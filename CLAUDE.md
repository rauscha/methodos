# methodos

A personal library app for **guides**: collections of HTML artifacts that Andrew has made in
Claude or ChatGPT and curated into small "mini wikis" on one subject. Think of it as a cross
between his mfm-media interactive decks and a small Obsidian vault: pages you can browse, link
between, and work through step by step.

**Status (2026-10-23): v0.1 built, not yet tried by Andrew.** A static PWA in `site/`, served on
the tailnet at https://tikiserv.saiga-wage.ts.net:8450/. The M8 guide has its first pages. Plan for that guide: `docs/m8-guide-plan.md` (rev 3, approved). Slice 1 (Low Tide steps 1–3, Tide pad, the `kit/` panels and browser demo engine) built 2026-10-23, waiting on his try with the M8 on his trip. **His reaction to it on the Pixel gates anything
further**; don't add features on top of it before then.

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
- **Curation:** `tools/methodos.py add|new|list|check` (stdlib). CI runs `check`.
- **Deploy:** the repo is private and Pages on this account needs a public repo, so
  `pages.yml` skips itself while private. Going public is Andrew's call; then set Pages source to
  GitHub Actions and it lands at andrewrausch.com/methodos/. Until then, the tailnet URL.
  Undo the tailnet serve with `tailscale serve --https=8450 off`.
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
