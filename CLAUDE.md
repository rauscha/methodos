# methodos

A personal library app for **guides**: collections of HTML artifacts that Andrew has made in
Claude or ChatGPT and curated into small "mini wikis" on one subject. Think of it as a cross
between his mfm-media interactive decks and a small Obsidian vault: pages you can browse, link
between, and work through step by step.

**Status (2026-10-23): idea only.** Nothing is designed, planned, or built yet. This file
records the idea. Don't start a plan or code until Andrew asks for one.

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

## Conventions

- Global rules apply (`~/.claude/CLAUDE.md`), especially: **never carry meaning by hue**. Patch
  cards, step states, and any diagrams need a second channel, such as labels, shape, or weight.
- Git: land on `main` and push. No PRs.
- If this becomes a PWA, follow the shared-origin manifest rules in the global CLAUDE.md
  (explicit `id`, relative `start_url`/`scope`).

## Remote Control session

`tikiserv-methodos` (tmux window `main:rc-methodos`, `claude-remote-control@methodos.timer`) was
added 2026-10-23. A one-shot timer, `methodos-rc-sunset.timer`, retires it on 2026-11-03 by
running `~/drop-rc.sh methodos`. `~/add-rc.sh methodos` brings it back.
