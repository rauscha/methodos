# Starting a new guide: handoff

Written 2026-10-24 at the end of the session that built methodos and the first M8 slice. Read
this, then the repo's `CLAUDE.md`, before starting work on another guide for the shelf. It is
for a fresh session that has none of that session's context.

## Where things stand

- **The app is done for now.** v0.1 is live at https://methodos.andrewrausch.com/ (its own origin
  since 2026-10-24; no tailnet mirror any more). Andrew has not tried it on the Pixel
  yet. Until he has, the app itself gets no new features.
- **The M8 guide is parked**, waiting on him. Slice 1 (Low Tide steps 1 to 3, the Tide pad card)
  is built and reviewed. The next M8 work is fix plan D in `docs/review-2026-10-23.md`, and it
  waits on three things he will report from the device (the "Report back" box on the guide's
  "How these pages work" page). Don't touch the M8 guide from a new-guide session.
- **A new guide is data, so it is not blocked.** It adds a folder under `site/guides/` and a
  line in `site/guides/index.json`. It must need **zero changes** to `app.js`, `style.css` or
  `sw.js`. If it seems to need one, write it into the plan as a question for him; don't build it.

## How the M8 guide was made (the pattern to repeat)

1. **Research first, from real sources.** Manuals, changelogs, his own notes and chats. Note the
   version of every source, and where it may not match his hardware or materials.
2. **Write a plan and stop.** `docs/<guide-id>-guide-plan.md`, marked **DRAFT** at the top until
   he approves it. The M8 plan (`docs/m8-guide-plan.md`) is the model: sources and their versions,
   what he wants to see, the pages and the order he would work through them, which panels or
   pictures earn their place, the first slice, and his open questions. "Plan" means deliver the
   plan; answering a clarifying question is not a go signal.
3. **Build one small first slice** after he approves, and get it in his hands that day. His
   reaction, not the tests, gates the next slice.
4. **Review is optional and costly.** The M8 review used a fleet of subagents because he asked
   for one. Don't launch agents unasked; they spend his shared usage.

## What he wants from a guide

- **"Show me how."** Pages that walk him through doing the thing, step by step, with the exact
  values to enter. Text first. A picture or interactive panel goes in only where it shows
  something text can't, and several threads at once beat one big diagram.
- **Never carry meaning by hue.** He is a protanope. Every state or category needs a second
  channel (word, weight, shape, position, pattern). Test by desaturating. No translucent fills
  for anything that matters. Describe things by luminance and material, never by color name.
- **Mark what isn't verified.** If a step depends on something the sources don't settle, say so
  on the page in an "unverified" box and ask him to report back, as the M8 pages do.
- Music guides only: he reads staff notation and prefers a piano roll to hex columns. The global
  CLAUDE.md has the full note ("How he reads music"). Don't chase a device's exact sound in the
  browser; the right notes at the right time is enough.

## Candidate guides

Nothing is chosen. His brief (CLAUDE.md, "The idea") names other synths, such as the OP-XY and the
CZ-1, and things unrelated to music, such as embroidery. Confirm the subject with him if the
request doesn't name it.

Sources on tikiserv:
- **Device manuals**: `~/music-library/manuals/md/*.md`, catalogued in
  `~/music-library/manuals/INDEX.md`. The OP-XY guide, the CZ-1 Mini manual, the MPK mini Plus,
  the nanoKEY Fold and others are there. Note each one's firmware version against his unit's.
- **His hardware**: the instruments table in the global CLAUDE.md.
- **Chats, photos, exports he sends**: they arrive in `~/Taildrop`. Keep them in
  `docs/sources/<guide-id>/`, which is gitignored. Never commit them (the repo is public, and
  its history was scrubbed once already for exactly this).
- **Web pages**: read with `curl` and strip the tags, not WebFetch, when the wording matters.

## Mechanics

```
python3 tools/methodos.py new <id> --title "Title" --subtitle "..." --description "..."
python3 tools/methodos.py add <id> page.html --section <section> --layout steps|cards [--group "..."]
python3 tools/methodos.py files <id>     # after adding scripts, styles or data files
python3 tools/methodos.py check          # before every push; CI runs it too
python3 -m http.server 8732 -d site      # local preview
```

- **Layout of a guide**: `site/guides/<id>/guide.json`, pages in `pages/`, and anything shared
  between its pages in its own folder (the M8 guide keeps its panels in `kit/` and song data in
  `songs/`). Shared code stays inside the guide, never in the app.
- **Sections** take `layout` `steps` (a numbered list with done-ticks) or `cards` (a grid), and
  an optional `group` heading. An empty section shows "Nothing here yet", so a planned section can
  exist early.
- **Links between pages**: `<a href="page:<id>">` or a relative `other.html`. Backlinks are
  computed. The in-app "How Methodos works" guide documents all of this with examples.
- **Offline**: pages are saved by "Save for offline" automatically. Other files are saved only if
  `files` has listed them in `guide.json`.
- **Service worker**: a new guide needs no `SHELL_VERSION` bump. Bump it only when a shell file
  (`index.html`, `app.js`, `style.css`, `manifest.json`, icons) changes, which a guide shouldn't.
- **Pages can use CDN libraries** (cached on first use). Pin exact versions.
- **Browser tests**: Playwright from `~/repos/backlot/` (via `createRequire`) with the Chromium
  at `~/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome`. Phone width is the target.
- **Deploy**: land on `main` and push; `pages.yml` deploys. A push is not a deploy until the run
  completes (`gh run list`), so check the live page after.

## Loose ends from the last session (not methodos)

- The manuals `INDEX.md` hasn't been rebuilt since the M8 firmware changelog was added, because
  `uv run --with pymupdf4llm` can't import the package right now. The rebuild and the commit to
  the music repo are Andrew's to run (the auto-mode classifier blocks a session from writing to
  that repo). This rebuild skips the PDF import, which the index step doesn't use:

  ```
  cd ~/music-library/manuals && python3 -c "import sys, types; sys.modules['pymupdf4llm'] = types.ModuleType('pymupdf4llm'); sys.argv = ['convert.py']; sys.path.insert(0, 'tools'); import convert; print(convert.build_index())" && cp INDEX.md ~/repos/music/rig/manuals-index.md && cd ~/repos/music && git add rig/manuals-index.md && git commit -m "Manuals index: M8 firmware changelog (6.6.3 F)" && git push
  ```
- GitHub may still serve one scrubbed commit by its SHA until GitHub collects garbage. Only a
  GitHub Support request purges it sooner, and only if he wants that.

## A prompt to start the next session

> Read `docs/new-guide.md` and `CLAUDE.md` in ~/repos/methodos. Research a new guide on
> <subject> for the methodos shelf, and write `docs/<id>-guide-plan.md` marked DRAFT. Stop there.
