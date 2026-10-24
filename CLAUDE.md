# methodos

A personal library app for **guides**: collections of HTML artifacts that Andrew has made in
Claude or ChatGPT and curated into small "mini wikis" on one subject. Think of it as a cross
between his mfm-media interactive decks and a small Obsidian vault: pages you can browse, link
between, and work through step by step.

**Status (2026-10-23): v0.1 built, not yet tried by Andrew.** A static PWA in `site/`, live at
https://andrewrausch.com/methodos/ (public repo, Pages via Actions, since 2026-10-24; unlisted, no
card on the apps page) and on the tailnet at https://tikiserv.saiga-wage.ts.net:8450/. The M8 guide has its first pages. Plan for that guide: `docs/m8-guide-plan.md` (rev 3, approved). Slice 1 (Low Tide steps 1–3, Tide pad, the `kit/` panels and browser demo engine) built 2026-10-23, waiting on his try with the M8 on his trip. Reviewed the same evening: `docs/review-2026-10-23.md` holds the findings, his decisions (it's a "show me how" app: no more work on making the browser sound like the M8) and the fix plan, in order. **His reaction to it on the Pixel gates anything
further**; don't add features on top of it before then.

**Starting another guide: read `docs/new-guide.md` first** (2026-10-24). It is the handoff for a
fresh session: what is parked, the research-then-DRAFT-plan pattern the M8 guide followed, the
sources on tikiserv, and the mechanics. A new guide is data and is not blocked by the M8 wait.

## The idea (Andrew, 2026-10-23)

- **The input is HTML artifacts** made in Claude or OpenAI tools, each one a self-contained page.
  Andrew curates them into a guide on one topic. The app holds, organizes, and presents them.
- **The first guide is the Dirtywave M8** (his Model:02, the tracker with the Macro/Braids synth;
  see the instruments table in the global CLAUDE.md). It will have:
  1. **Song walkthroughs:** several complete songs, each built step by step on the M8, and each
     with its own set of instruments.
  2. **Technique tutorials:** hands-on walkthroughs of **Tables** and **sampling**.
  3. **A library of instrument patch cards:** every instrument from the song walkthroughs, plus
     other good example instruments to try.
- **It has to be extensible.** Later guides could cover other synths (OP-XY, CZ-1, and so on) or
  things unrelated to music, such as embroidery tutorials. None of those are needed now, but no
  design decision should assume the M8 or assume music. A guide is something Andrew can add
  ("download") later without changing the app.

## How it is built (2026-10-23)

- **No build step.** `site/` is the app: `index.html`, `app.js` (ES module, hash router),
  `style.css`, `sw.js`, `manifest.json`. Run with `python3 -m http.server -d site`.
- **Guides are data.** `site/guides/index.json` lists guide ids in shelf order; each
  `site/guides/<id>/guide.json` holds sections (`layout`: `steps` or `cards`, optional `group`
  heading) and pages (`id`, `title`, `file`, `summary`, `tags`, `links`). Backlinks are computed.
  Nothing in `app.js` may name a guide or a subject.
- **Artifacts are shown untouched, in a same-origin iframe** (no sandbox), so their scripts and
  storage work, and the app can catch in-page links: `page:<id>` or a relative `other.html` to a
  page in the same guide opens it in the app; off-site links open a new tab. They are his own
  curated files, which is why no sandbox.
- **Done, last page, search text** live in `localStorage` under `methodos:` keys.
- **Offline:** the service worker precaches the shell, serves same-site files network-first
  with a cache fallback, and CDN files cache-first. It only touches caches named `methodos-*`
  (andrewrausch.com is a shared origin). "Save for offline" on a guide caches all its pages.
- **Guides from a file** (2026-10-24): "Add a guide from a file" on the library takes a `.zip`
  of a guide folder (`tools/methodos.py pack <dir>` makes one) and keeps it on that device only:
  files go into the `methodos-local` cache at `local/<id>/...`, and `sw.js` answers `local/`
  from that cache alone, never the network. This is how private guides (commercial IP, such as
  the Elden Ring guide in the git-excluded `private/` folder) reach the Pixel: pack, Taildrop,
  add. Never put a private guide under `site/` or in git.
- **Curation:** `tools/methodos.py add|new|list|files|check|pack` (stdlib). CI runs `check`.
- **Deploy:** every push to `main` runs `pages.yml` and lands at andrewrausch.com/methodos/
  (repo public since 2026-10-24). The tailnet serve at :8450 still mirrors `site/` straight from
  the checkout, handy for trying a change before pushing; `tailscale serve --https=8450 off`
  removes it. `docs/sources/` (chat exports, screen photos) is gitignored and stays on tikiserv.
- The demo guide `field-guide` ("How Methodos works") documents the app and is non-music on
  purpose, as a standing test that nothing assumes the M8.

## Conventions

- Global rules apply (`~/.claude/CLAUDE.md`), especially: **never carry meaning by hue**. Patch
  cards, step states, and any diagrams need a second channel, such as labels, shape, or weight.
- Git: land on `main` and push. No PRs.
- It is a PWA: keep `"id": "./"` and relative `start_url`/`scope` forever (shared-origin rules in
  the global CLAUDE.md). Check with `python3 ~/tools/pwa-manifest-check.py site/manifest.json`.

## Remote Control session

`tikiserv-methodos` (tmux window `main:rc-methodos`, `claude-remote-control@methodos.timer`) was
added 2026-10-23. A one-shot timer, `methodos-rc-sunset.timer`, retires it on 2026-11-03 by
running `~/drop-rc.sh methodos`. `~/add-rc.sh methodos` brings it back.
