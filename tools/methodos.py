#!/usr/bin/env python3
"""Curate Methodos guides. Standard library only.

    methodos.py list [GUIDE]
    methodos.py new GUIDE --title "Title" [--subtitle ...] [--description ...]
    methodos.py add GUIDE FILE.html --section SECTION [--title ...] [--id ...]
                    [--summary ...] [--tags a,b] [--links id1,id2]
                    [--section-title ...] [--layout steps|cards] [--group ...]
    methodos.py files GUIDE
    methodos.py check
    methodos.py pack DIR [-o OUT.zip]

`add` copies an artifact into site/guides/GUIDE/pages/ and registers it in that
guide's guide.json. The title defaults to the artifact's <title>. A section that
does not exist yet is created (use --section-title/--layout/--group to shape it).
`files` lists a guide's other files (scripts, styles, song data, samples) in guide.json, so
"Save for offline" can fetch them; run it after adding any. Run `check` before pushing; CI
runs it too.
`pack` zips a guide folder (anywhere, not only under site/guides/) after checking it, for
"Add a guide from a file" in the app. A packed guide stays on the device it is added to.
"""

import argparse
import json
import re
import shutil
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GUIDES = ROOT / "site" / "guides"
INDEX = GUIDES / "index.json"
LAYOUTS = ("steps", "cards")


def die(msg):
    print(f"error: {msg}", file=sys.stderr)
    sys.exit(1)


def load(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def save(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")


def slugify(text):
    s = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return s or "page"


def html_title(path):
    text = path.read_text(encoding="utf-8", errors="replace")
    m = re.search(r"<title[^>]*>(.*?)</title>", text, re.I | re.S)
    return re.sub(r"\s+", " ", m.group(1)).strip() if m else None


def guide_path(gid):
    p = GUIDES / gid / "guide.json"
    if not p.exists():
        die(f"no guide '{gid}' (expected {p.relative_to(ROOT)})")
    return p


def all_pages(guide):
    for s in guide.get("sections", []):
        for p in s.get("pages", []):
            yield s, p


def cmd_list(args):
    index = load(INDEX)
    for gid in index["guides"]:
        if args.guide and gid != args.guide:
            continue
        g = load(guide_path(gid))
        print(f"{gid}: {g.get('title', gid)}")
        for s in g.get("sections", []):
            group = f"{s['group']} / " if s.get("group") else ""
            print(f"  [{s['id']}] {group}{s.get('title', s['id'])} ({s.get('layout', 'cards')})")
            for p in s.get("pages", []):
                print(f"      {p['id']}: {p.get('title', '')}")


def cmd_new(args):
    gid = slugify(args.guide)
    d = GUIDES / gid
    if (d / "guide.json").exists():
        die(f"guide '{gid}' already exists")
    (d / "pages").mkdir(parents=True, exist_ok=True)
    guide = {"title": args.title}
    if args.subtitle:
        guide["subtitle"] = args.subtitle
    if args.description:
        guide["description"] = args.description
    guide["sections"] = []
    save(d / "guide.json", guide)
    index = load(INDEX)
    if gid not in index["guides"]:
        index["guides"].append(gid)
        save(INDEX, index)
    print(f"created guide '{gid}' at {d.relative_to(ROOT)}")


def split(value):
    return [v.strip() for v in value.split(",") if v.strip()] if value else []


def cmd_add(args):
    gpath = guide_path(args.guide)
    guide = load(gpath)
    src = Path(args.file).expanduser()
    if not src.is_file():
        die(f"no such file: {src}")
    title = args.title or html_title(src) or src.stem.replace("-", " ").replace("_", " ")
    taken = {p["id"] for _, p in all_pages(guide)}
    pid = slugify(args.id or title)
    if args.id and pid in taken:
        die(f"page id '{pid}' is already used in this guide")
    base, n = pid, 2
    while pid in taken:
        pid, n = f"{base}-{n}", n + 1

    sections = guide.setdefault("sections", [])
    section = next((s for s in sections if s["id"] == args.section), None)
    if section is None:
        layout = args.layout or "cards"
        section = {"id": args.section, "title": args.section_title or args.section.replace("-", " ").capitalize(),
                   "layout": layout, "pages": []}
        if args.group:
            section = {"id": section["id"], "group": args.group, **{k: v for k, v in section.items() if k != "id"}}
        sections.append(section)
        print(f"created section '{args.section}' ({layout})")

    dest_rel = f"pages/{pid}.html"
    dest = gpath.parent / dest_rel
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(src, dest)

    page = {"id": pid, "title": title, "file": dest_rel}
    if args.summary:
        page["summary"] = args.summary
    if args.tags:
        page["tags"] = split(args.tags)
    if args.links:
        page["links"] = split(args.links)
    section.setdefault("pages", []).append(page)
    save(gpath, guide)
    print(f"added '{pid}' to {args.guide}/{section['id']} -> {dest.relative_to(ROOT)}")
    problems = check_guide(args.guide, guide)
    for p in problems:
        print(f"warning: {p}")


def check_guide(gid, guide, gdir=None):
    problems = []
    gdir = gdir or GUIDES / gid
    if not guide.get("title"):
        problems.append(f"{gid}: missing title")
    ids, files = set(), set()
    section_ids = set()
    for s in guide.get("sections", []):
        if not s.get("id"):
            problems.append(f"{gid}: a section has no id")
        elif s["id"] in section_ids:
            problems.append(f"{gid}: duplicate section id '{s['id']}'")
        section_ids.add(s.get("id"))
        if s.get("layout", "cards") not in LAYOUTS:
            problems.append(f"{gid}/{s.get('id')}: layout must be one of {', '.join(LAYOUTS)}")
    for s, p in all_pages(guide):
        where = f"{gid}/{s.get('id')}/{p.get('id')}"
        for key in ("id", "title", "file"):
            if not p.get(key):
                problems.append(f"{where}: missing {key}")
        if p.get("id") in ids:
            problems.append(f"{where}: duplicate page id")
        ids.add(p.get("id"))
        if p.get("file"):
            files.add(p["file"])
            if not (gdir / p["file"]).is_file():
                problems.append(f"{where}: file not found: {p['file']}")
    for s, p in all_pages(guide):
        for target in p.get("links", []):
            if target not in ids:
                problems.append(f"{gid}/{p.get('id')}: links to unknown page '{target}'")
    pages_dir = gdir / "pages"
    if pages_dir.is_dir():
        for f in sorted(pages_dir.glob("*.html")):
            if f"pages/{f.name}" not in files:
                problems.append(f"{gid}: {f.relative_to(ROOT)} is not listed in guide.json")
    listed = set(guide.get("files", []))
    for f in sorted(listed):
        if not (gdir / f).is_file():
            problems.append(f"{gid}: files lists {f}, which does not exist")
    for f in other_files(gdir):
        if f not in listed:
            problems.append(f"{gid}: {f} is not in guide.json files (run: methodos.py files {gid})")
    for page in sorted(files):
        path = gdir / page
        if not path.is_file():
            continue
        text = path.read_text(encoding="utf-8", errors="replace")
        for ref in re.findall(r'<[a-zA-Z][^>]*?\s(?:src|href)="([^"#:]+)"', text):
            if not (path.parent / ref).resolve().exists():
                problems.append(f"{gid}/{page}: refers to {ref}, which does not exist")
    return problems


def other_files(gdir):
    """Every file in a guide folder that isn't guide.json or a page."""
    out = []
    for f in sorted(gdir.rglob("*")):
        rel = f.relative_to(gdir).as_posix()
        is_page = rel.startswith("pages/") and "/" not in rel[6:] and rel.endswith(".html")
        if f.is_file() and rel != "guide.json" and not is_page and not f.name.startswith("."):
            out.append(rel)
    return out


def cmd_files(args):
    gpath = guide_path(args.guide)
    guide = load(gpath)
    guide["files"] = other_files(gpath.parent)
    save(gpath, guide)
    print(f"{args.guide}: {len(guide['files'])} files listed")


def cmd_check(_args):
    problems = []
    index = load(INDEX)
    listed = index.get("guides", [])
    for gid in listed:
        p = GUIDES / gid / "guide.json"
        if not p.exists():
            problems.append(f"{gid}: listed in index.json but {p.relative_to(ROOT)} is missing")
            continue
        try:
            problems += check_guide(gid, load(p))
        except json.JSONDecodeError as e:
            problems.append(f"{gid}: guide.json is not valid JSON: {e}")
    for d in sorted(GUIDES.iterdir()):
        if d.is_dir() and d.name not in listed:
            problems.append(f"{d.name}: folder exists but is not listed in index.json")
    for p in problems:
        print(p)
    n = len(listed)
    print(f"{n} guide{'s' if n != 1 else ''}, {len(problems)} problem{'s' if len(problems) != 1 else ''}")
    sys.exit(1 if problems else 0)


def cmd_pack(args):
    gdir = Path(args.dir).expanduser().resolve()
    gpath = gdir / "guide.json"
    if not gpath.is_file():
        die(f"no guide.json in {gdir}")
    gid = slugify(gdir.name)
    guide = load(gpath)
    listed = set(guide.get("files", []))
    if set(other_files(gdir)) != listed:
        guide["files"] = other_files(gdir)
        save(gpath, guide)
        print(f"{gid}: files list updated ({len(guide['files'])} files)")
    problems = check_guide(gid, guide, gdir)
    if problems:
        for p in problems:
            print(p)
        die(f"{len(problems)} problem(s); not packed")
    out = Path(args.out).expanduser() if args.out else gdir.parent / f"{gid}.zip"
    names = ["guide.json"] + [p["file"] for _, p in all_pages(guide)] + guide.get("files", [])
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
        for rel in dict.fromkeys(names):
            z.write(gdir / rel, f"{gid}/{rel}")
    print(f"packed '{gid}': {len(set(names))} files, {out.stat().st_size / 1e6:.1f} MB -> {out}")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)

    p = sub.add_parser("list", help="show guides, sections and pages")
    p.add_argument("guide", nargs="?")
    p.set_defaults(fn=cmd_list)

    p = sub.add_parser("new", help="start a new guide")
    p.add_argument("guide")
    p.add_argument("--title", required=True)
    p.add_argument("--subtitle")
    p.add_argument("--description")
    p.set_defaults(fn=cmd_new)

    p = sub.add_parser("add", help="add an HTML artifact to a guide")
    p.add_argument("guide")
    p.add_argument("file")
    p.add_argument("--section", required=True, help="section id (created if new)")
    p.add_argument("--title")
    p.add_argument("--id")
    p.add_argument("--summary")
    p.add_argument("--tags", help="comma-separated")
    p.add_argument("--links", help="comma-separated page ids this page links to")
    p.add_argument("--section-title")
    p.add_argument("--layout", choices=LAYOUTS)
    p.add_argument("--group", help="heading shared by several sections, e.g. Songs")
    p.set_defaults(fn=cmd_add)

    p = sub.add_parser("files", help="list a guide's non-page files for offline saving")
    p.add_argument("guide")
    p.set_defaults(fn=cmd_files)

    p = sub.add_parser("check", help="validate every guide")
    p.set_defaults(fn=cmd_check)

    p = sub.add_parser("pack", help="zip a guide folder for 'Add a guide from a file'")
    p.add_argument("dir", help="the guide folder (holds guide.json)")
    p.add_argument("-o", "--out", help="output .zip (default: <folder>.zip beside it)")
    p.set_defaults(fn=cmd_pack)

    args = ap.parse_args()
    args.fn(args)


if __name__ == "__main__":
    main()
