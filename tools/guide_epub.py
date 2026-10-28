#!/usr/bin/env python3
"""Turn a Methodos guide folder into an EPUB for a small e-ink reader.

    python3 tools/guide_epub.py <guide-dir> [-o out.epub] [--width 480]

Needs BeautifulSoup and Pillow. The reader in mind is the Xteink X4 (480 x 800 e-ink,
modest EPUB support), so the output keeps to what every reader handles: plain XHTML,
almost no CSS, an EPUB 2 NCX beside the EPUB 3 nav, small grayscale JPEGs. What only
works in the app is translated:

- Scripts, interactive panels (custom elements) and maps are dropped; map-pin links keep
  their words.
- A spoiler (details.spoiler) can't be tapped open on paper, so it moves to the end of
  its chapter; a line in its place says what kind of spoiler it is and links to it.
- Other <details> are shown open. Links between pages become links between chapters;
  links off the guide keep their text only.
- Labels drawn by CSS (step numbers, route marks) become words or plain numbering.

Nothing here knows about any one guide or subject.
"""
import argparse
import datetime as dt
import html
import io
import json
import re
import sys
import uuid
import zipfile
from pathlib import Path

from bs4 import BeautifulSoup, Comment, NavigableString
from PIL import Image

CSS = """body { margin: 0 4px; line-height: 1.4; }
h1 { font-size: 1.35em; margin: 0.4em 0; }
h2 { font-size: 1.15em; margin: 1em 0 0.3em; }
h3 { font-size: 1em; margin: 0.9em 0 0.2em; }
p, li { margin: 0.3em 0; }
.kicker { font-size: 0.8em; text-transform: uppercase; letter-spacing: 0.05em; margin: 0; }
.box { border: 1px solid #000; padding: 0.3em 0.5em; margin: 0.6em 0; }
.box.dashed { border-style: dashed; }
.box .label { font-weight: bold; display: block; }
.spoiler-ref { font-style: italic; border-left: 3px solid #000; padding-left: 0.4em; }
.spoilers { border-top: 2px solid #000; margin-top: 1.5em; padding-top: 0.3em; }
table { border-collapse: collapse; margin: 0.5em 0; font-size: 0.9em; }
th, td { border: 1px solid #000; padding: 2px 4px; vertical-align: top; text-align: left; }
img { max-width: 100%; height: auto; }
.note { font-size: 0.85em; font-style: italic; }
.small { font-size: 0.85em; }
"""

BOX_CLASSES = {'tip': '', 'warn': '', 'unverified': 'dashed', 'listen': '', 'demo-note': ''}


def xhtml(title, body, lang='en'):
    return ('<?xml version="1.0" encoding="utf-8"?>\n<!DOCTYPE html>\n'
            f'<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="{lang}" xml:lang="{lang}">\n'
            f'<head><meta charset="utf-8"/><title>{html.escape(title)}</title>'
            '<link rel="stylesheet" type="text/css" href="style.css"/></head>\n'
            f'<body>\n{body}\n</body></html>\n')


class Book:
    def __init__(self, guide_dir, width):
        self.dir = Path(guide_dir)
        self.guide = json.loads((self.dir / 'guide.json').read_text())
        self.width = width
        self.images = {}      # source path -> epub name
        self.image_data = {}  # epub name -> bytes
        self.pages = []       # dicts: id, title, file (source), href (epub), section
        for s in self.guide.get('sections', []):
            for p in s.get('pages', []):
                self.pages.append({**p, 'section': s, 'href': f"p-{re.sub(r'[^A-Za-z0-9_-]', '_', p['id'])}.xhtml"})
        self.by_id = {p['id']: p for p in self.pages}
        self.by_file = {(self.dir / p['file']).resolve(): p for p in self.pages}

    # -- images: grayscale, at most `width` wide, baseline JPEG (or PNG if it has transparency)
    def image(self, src_path):
        src_path = src_path.resolve()
        if src_path in self.images:
            return self.images[src_path]
        try:
            im = Image.open(src_path)
            im.load()
        except Exception:
            return None
        alpha = im.mode in ('RGBA', 'LA', 'P') and 'transparency' in im.info or im.mode in ('RGBA', 'LA')
        if alpha:
            bg = Image.new('RGBA', im.size, (255, 255, 255, 255))
            bg.alpha_composite(im.convert('RGBA'))
            im = bg
        im = im.convert('L')
        if im.width > self.width:
            im = im.resize((self.width, round(im.height * self.width / im.width)), Image.LANCZOS)
        buf = io.BytesIO()
        im.save(buf, 'JPEG', quality=78, optimize=True, progressive=False)
        name = f'img/i{len(self.images) + 1:03d}.jpg'
        self.images[src_path] = name
        self.image_data[name] = buf.getvalue()
        return name

    def link_target(self, href, page_file):
        if href.startswith('page:'):
            pid, _, frag = href[5:].partition('#')
            p = self.by_id.get(pid)
            return p and p['href'] + (f'#{frag}' if frag else '')
        if re.match(r'^[a-z][a-z0-9+.-]*:', href, re.I) or href.startswith('//'):
            return None
        path, _, frag = href.partition('#')
        if not path:
            return f'#{frag}' if frag else None
        p = self.by_file.get((page_file.parent / path).resolve())
        return p and p['href'] + (f'#{frag}' if frag else '')

    def chapter(self, page):
        src = self.dir / page['file']
        soup = BeautifulSoup(src.read_text(encoding='utf-8'), 'html.parser')
        root = soup.find('main') or soup.body or soup
        for el in root.find_all(['script', 'style', 'link', 'noscript', 'iframe', 'canvas', 'svg', 'video', 'audio', 'input', 'button', 'form']):
            el.decompose()
        for c in root.find_all(string=lambda s: isinstance(s, Comment)):
            c.extract()
        # interactive panels: custom elements, and empty map containers
        dropped = 0
        for el in root.find_all(lambda t: '-' in t.name):
            el.decompose(); dropped += 1
        for el in root.find_all(True):
            if el.decomposed or el.name in ('img', 'br', 'hr', 'td', 'th'):
                continue
            if not el.get_text(strip=True) and not el.find('img'):
                el.decompose(); dropped += 1

        # spoilers to the chapter's end
        spoilers = []
        for d in root.find_all('details'):
            summary = d.find('summary')
            label = summary.get_text(' ', strip=True) if summary else ''
            if summary:
                summary.extract()
            if 'spoiler' in (d.get('class') or []):
                n = len(spoilers) + 1
                body = soup.new_tag('div', attrs={'id': f'sp-{n}'})
                head = soup.new_tag('p'); b = soup.new_tag('b')
                b.string = f'Spoiler {n}: {label}' if label else f'Spoiler {n}'
                head.append(b); body.append(head)
                for child in list(d.contents):
                    body.append(child.extract())
                back = soup.new_tag('p', attrs={'class': 'small'}); ba = soup.new_tag('a', href=f'#ref-{n}')
                ba.string = 'Back'; back.append(ba); body.append(back)
                spoilers.append(body)
                ref = soup.new_tag('p', attrs={'class': 'spoiler-ref', 'id': f'ref-{n}'})
                ref.append(f'Spoiler {n}{f" ({label})" if label else ""}: at the end of this chapter. ')
                a = soup.new_tag('a', href=f'#sp-{n}'); a.string = 'Read it'
                ref.append(a)
                d.replace_with(ref)
            else:
                d.name = 'div'
                if label:
                    h = soup.new_tag('p'); b = soup.new_tag('b'); b.string = label; h.append(b)
                    d.insert(0, h)

        if spoilers:
            block = soup.new_tag('div', attrs={'class': 'spoilers'})
            h = soup.new_tag('h2'); h.string = 'Spoilers'; block.append(h)
            for sp in spoilers:
                block.append(sp)
            root.append(block)

        # A list of short name/value pairs (a device's parameter screen) reads better as a
        # table, two pairs to a row, than as a tall column on a small screen.
        for dl in root.find_all('dl'):
            pairs = []
            for dt_ in dl.find_all('dt'):
                dd = dt_.find_next_sibling('dd')
                pairs.append((dt_.get_text(' ', strip=True), dd.get_text(' ', strip=True) if dd else ''))
            if not pairs or max(len(k) + len(v) for k, v in pairs) > 28:
                continue
            table = soup.new_tag('table')
            for i in range(0, len(pairs), 2):
                tr = soup.new_tag('tr')
                for k, v in pairs[i:i + 2]:
                    th = soup.new_tag('th'); th.string = k; td = soup.new_tag('td'); td.string = v
                    tr.append(th); tr.append(td)
                table.append(tr)
            dl.replace_with(table)

        # boxes keep their label words; give them a plain border
        for el in root.find_all(class_=list(BOX_CLASSES)):
            cls = el.get('class') or []
            kind = next(c for c in cls if c in BOX_CLASSES)
            el['class'] = ['box'] + ([BOX_CLASSES[kind]] if BOX_CLASSES[kind] else [])
            if el.name in ('p', 'span') and not el.find(class_='label'):
                el.name = 'div'
                word = {'tip': 'Tip', 'warn': 'Watch out', 'unverified': 'Unverified', 'listen': 'Listen for'}.get(kind)
                if word:
                    lab = soup.new_tag('span', attrs={'class': 'label'}); lab.string = word
                    el.insert(0, lab)
        # route marks drawn by CSS become words
        for li in root.select('ol.route > li'):
            cls = li.get('class') or []
            word = 'Grace' if 'grace' in cls else 'Boss' if 'boss' in cls else None
            if word:
                b = soup.new_tag('b'); b.string = f'{word}: '
                li.insert(0, b)
            else:
                li.insert(0, NavigableString('then: '))
        for ol in root.find_all('ol'):
            if 'route' in (ol.get('class') or []):
                ol.name = 'ul'

        # links
        for a in root.find_all('a'):
            if a.has_attr('data-pin') or 'pin' in (a.get('class') or []):
                a.unwrap(); continue  # a map pin: the map lives only in the app
            href = a.get('href', '')
            target = self.link_target(href, src) if href else None
            if target:
                a.attrs = {'href': target}
            else:
                a.unwrap()
        # images
        for img in root.find_all('img'):
            name = self.image((src.parent / img.get('src', '')).resolve()) if img.get('src') else None
            if not name:
                img.decompose(); continue
            img.attrs = {'src': name, 'alt': img.get('alt', '')}
        # strip what readers ignore anyway; keep the classes the CSS above knows
        keep = {'box', 'dashed', 'label', 'kicker', 'spoiler-ref', 'spoilers', 'note', 'small'}
        for el in root.find_all(True):
            for attr in list(el.attrs):
                if attr in ('href', 'src', 'alt', 'id', 'colspan', 'rowspan'):
                    continue
                if attr == 'class':
                    cls = [c for c in el['class'] if c in keep]
                    if cls: el['class'] = cls
                    else: del el['class']
                    continue
                del el[attr]
        for el in root.find_all(['div', 'span', 'section', 'main', 'figure', 'figcaption']):
            if el.name in ('div', 'span') and el.get('class'):
                continue
            if el.name == 'figcaption':
                el.name = 'p'; el['class'] = ['note']; continue
            if el.name in ('section', 'figure', 'main'):
                el.unwrap()
            elif el.name == 'div' and not el.attrs:
                el.unwrap()
            elif el.name == 'span' and not el.attrs:
                el.unwrap()

        body = ''.join(str(c) for c in (root.contents if root.name in ('main', 'body') else [root]))
        if dropped and not root.get_text(strip=True):
            body += '<p class="note">This page is interactive (a map or a player). Open it in the Methodos app.</p>'
        return xhtml(page['title'], body)

    def write(self, out):
        g = self.guide
        title = g.get('title') or self.dir.name
        book_id = f'urn:uuid:{uuid.uuid5(uuid.NAMESPACE_URL, "methodos:" + self.dir.name)}'
        modified = dt.datetime.now(dt.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
        chapters = {p['id']: self.chapter(p) for p in self.pages}

        # title page and section openers
        parts = [f'<h1>{html.escape(title)}</h1>']
        if g.get('subtitle'): parts.append(f'<p class="kicker">{html.escape(g["subtitle"])}</p>')
        if g.get('description'): parts.append(f'<p>{html.escape(g["description"])}</p>')
        parts.append(f'<p class="note">Made from the Methodos guide on {dt.date.today():%Y-%m-%d}. '
                     'Spoilers sit at the end of each chapter. Maps and players are only in the app.</p>')
        files = [('title.xhtml', xhtml(title, '\n'.join(parts)))]
        nav_tree = []  # (label, href, children)
        last_group, group_node = None, None
        for si, s in enumerate(g.get('sections', [])):
            pages = [p for p in self.pages if p['section'] is s]
            if not pages:
                continue
            opener = f's-{si:02d}.xhtml'
            head = f'<h1>{html.escape(s.get("title") or s.get("id", ""))}</h1>'
            if s.get('group'): head = f'<p class="kicker">{html.escape(s["group"])}</p>' + head
            if s.get('description'): head += f'<p>{html.escape(s["description"])}</p>'
            head += '<ol>' + ''.join(f'<li><a href="{p["href"]}">{html.escape(p["title"])}</a></li>' for p in pages) + '</ol>'
            files.append((opener, xhtml(s.get('title') or '', head)))
            node = (s.get('title') or s.get('id'), opener, [(p['title'], p['href'], []) for p in pages])
            if s.get('group'):
                if s['group'] != last_group:
                    group_node = (s['group'], opener, [])
                    nav_tree.append(group_node)
                group_node[2].append(node)
            else:
                nav_tree.append(node)
            last_group = s.get('group')
            for p in pages:
                files.append((p['href'], chapters[p['id']]))

        def nav_ol(nodes):
            return '<ol>' + ''.join(f'<li><a href="{h}">{html.escape(l)}</a>{nav_ol(k) if k else ""}</li>' for l, h, k in nodes) + '</ol>'
        nav = xhtml('Contents', f'<nav epub:type="toc" id="toc"><h1>Contents</h1>{nav_ol(nav_tree)}</nav>')

        counter, order = [0], {}
        def ncx_points(nodes):
            out = ''
            for l, h, k in nodes:
                counter[0] += 1
                play = order.setdefault(h, len(order) + 1)  # one number per target
                out += (f'<navPoint id="n{counter[0]}" playOrder="{play}"><navLabel><text>{html.escape(l)}</text></navLabel>'
                        f'<content src="{h}"/>{ncx_points(k)}</navPoint>')
            return out
        ncx = ('<?xml version="1.0" encoding="utf-8"?>\n<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">'
               f'<head><meta name="dtb:uid" content="{book_id}"/></head><docTitle><text>{html.escape(title)}</text></docTitle>'
               f'<navMap>{ncx_points([("Title", "title.xhtml", [])] + nav_tree)}</navMap></ncx>')

        manifest = ['<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>',
                    '<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>',
                    '<item id="css" href="style.css" media-type="text/css"/>']
        spine = []
        for i, (name, _) in enumerate(files):
            manifest.append(f'<item id="c{i}" href="{name}" media-type="application/xhtml+xml"/>')
            spine.append(f'<itemref idref="c{i}"/>')
        for i, name in enumerate(self.image_data):
            manifest.append(f'<item id="img{i}" href="{name}" media-type="image/jpeg"/>')
        opf = ('<?xml version="1.0" encoding="utf-8"?>\n'
               '<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bookid">'
               '<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">'
               f'<dc:identifier id="bookid">{book_id}</dc:identifier><dc:title>{html.escape(title)}</dc:title>'
               '<dc:language>en</dc:language><dc:creator>Methodos</dc:creator>'
               f'<meta property="dcterms:modified">{modified}</meta></metadata>'
               f'<manifest>{"".join(manifest)}</manifest><spine toc="ncx">{"".join(spine)}</spine></package>')

        with zipfile.ZipFile(out, 'w') as z:
            z.writestr(zipfile.ZipInfo('mimetype'), 'application/epub+zip', compress_type=zipfile.ZIP_STORED)
            z.writestr('META-INF/container.xml', '<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">'
                       '<rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>',
                       compress_type=zipfile.ZIP_DEFLATED)
            z.writestr('OEBPS/content.opf', opf, compress_type=zipfile.ZIP_DEFLATED)
            z.writestr('OEBPS/nav.xhtml', nav, compress_type=zipfile.ZIP_DEFLATED)
            z.writestr('OEBPS/toc.ncx', ncx, compress_type=zipfile.ZIP_DEFLATED)
            z.writestr('OEBPS/style.css', CSS, compress_type=zipfile.ZIP_DEFLATED)
            for name, text in files:
                z.writestr(f'OEBPS/{name}', text, compress_type=zipfile.ZIP_DEFLATED)
            for name, data in self.image_data.items():
                z.writestr(f'OEBPS/{name}', data, compress_type=zipfile.ZIP_STORED)
        return len(files), len(self.image_data)


def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('dir', help='the guide folder (holds guide.json)')
    ap.add_argument('-o', '--out', help='output .epub (default: <folder>.epub beside it)')
    ap.add_argument('--width', type=int, default=480, help='widest image, in pixels (default 480)')
    a = ap.parse_args()
    d = Path(a.dir)
    out = Path(a.out) if a.out else d.parent / f'{d.resolve().name}.epub'
    book = Book(d, a.width)
    n, imgs = book.write(out)
    print(f'{out}: {n} chapters, {imgs} images, {out.stat().st_size / 1e6:.1f} MB')


if __name__ == '__main__':
    sys.exit(main())
