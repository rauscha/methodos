# M8 guide: plan

**DRAFT, 2026-10-23.** Written by a Claude session from Andrew's brief (`CLAUDE.md`) and two
screenshots of oto-style music visualizers he sent as ideas. Nothing here is decided until he
has read it; the open questions at the end are his.

M8 facts below come from the operation manual on disk,
`~/music-library/manuals/md/dirtywave-m8-operation-manual.md` (v6.5.2, 2026-04-21). Every
instruction that reaches a page gets checked against it and then played on his unit.

## The idea in one paragraph

The M8 shows music as columns of hex. That is fast to type and hard to *see*: a phrase does not
look like a melody, and a table does not look like an arpeggio. The guide puts a picture next to
every grid. Each page shows two things side by side: **exactly what to type** (a mirror of the
M8's own screen) and **what that does to the music** (panels adapted from the screenshots). Next
to them is a recording from his own M8 to check his result against. This is the same explain loop
that started Parallax, aimed at the tracker this time.

## What to take from the screenshots

The reel shows six panels. Four of them teach something about the M8; two are decoration.

| Panel | What it shows | What it teaches on the M8 | Verdict |
|---|---|---|---|
| **Orbit** | One bar as a clock face; notes as arcs; a hand sweeps round | A **phrase is 16 steps** (manual, Phrase View), so the circle gets 16 ticks labeled 0 to F, matching the row numbers he types. One ring per track. | Core. The best fit of the lot. |
| **Roll** | Piano roll over several bars, playhead, readouts (bar, tempo, sounding notes) | How chains string phrases into a song: bars across, pitch up. "Sounding: D4 A5 C#5" in words is a channel that works for anyone. | Core. |
| **Roots** | Notes as nodes, sized by how long each has sounded; lines trace the tune's path | Harmony and melody shape: which notes are home, where the line goes. Good for song pages and the Scale view. | Yes, song pages only. |
| **Rack** | Waveform with loudness curve, scope, spectrum, stereo vector; LUFS and peak readouts | The *sound*: what a filter sweep does to the spectrum, what a wavsynth shape looks like, why a sample clicks. The M8 has its own Limiter & Mix Scope view; this is the same idea, bigger. | Core for patch cards and sampling. |
| Sheet | A "printing" mesh drawing | Nothing specific. | Skip. |
| Fountain | Particle fountain driven by the spectrum | Nothing specific; fun. | Maybe later, as delight. |

Plus one panel the reel doesn't have, and the one that matters most:

- **Tracker mirror.** The phrase or table as the M8 draws it: rows 0 to F, then the N, V, I and
  three FX columns, in a monospace grid. The current row is marked by a drawn cursor and bold
  weight. On a song step, the rows this step adds are marked "new" in words, with a bar in the
  margin. This is what he copies onto the device.

### The hue problem in the originals

The screenshots separate kick, snare and hat by hue alone (one blue line, one orange, one
yellow), and each panel is a single pink or blue. For him that distinction mostly doesn't exist.
The guide's versions use:

- **One ink per panel**, with luminance steps (dark for the current note, mid for sounded,
  light for coming up).
- **Tracks separated by position first.** Orbit gives each track its own ring, Roll gives each
  its own lane, and both carry direct labels ("T1 kick").
- **Then by mark shape.** Filled disc for kick, square for snare, cross for hat, an outlined
  block for sustained notes. Line style (solid, dashed, dotted) for paths in Roots.
- **Readouts in words** for anything that matters: bar, row, sounding notes, LUFS.
- Okabe–Ito tints are allowed on top, never on their own.

## How the panels get their data

There are two inputs per page. Neither is guessed from the other.

1. **A song spec (JSON).** The song as M8 data: tempo, groove, the instruments (each one points
   at a patch card id), and per track its chains, phrases and rows (note, volume, instrument,
   up to three FX). Each walkthrough step lists the rows it adds. The spec is the single source:
   the tracker mirror, Orbit, Roll and Roots are all drawn from it, and the step's instructions
   are written from it.
2. **A recording per step**, made on his M8 over USB audio (44.1 kHz on Windows; see GEAR.md),
   as a short loop. The Rack panels analyze it live in the browser with Web Audio. Loudness
   numbers (LUFS needs K-weighting) are precomputed with ffmpeg's `ebur128` and stored as a
   small JSON curve, because that is more accurate than doing it in the page.

The recording is also the check on the spec: if what he hears from his unit doesn't match the
step's clip, either the spec or the instructions are wrong.

Reading `.m8s` song files directly would save transcribing. There are community parsers (a
Rust crate, `m8-files`, if memory serves). **UNVERIFIED**; worth a look once a song exists,
not needed to start.

## The kit

The panels are one shared script in the guide, not copied into each artifact:

```
site/guides/m8/
  guide.json
  pages/            the artifacts
  kit/scopes.js     Tracker mirror, Orbit, Roll, Roots, Rack; reads a spec + a clip
  kit/scopes.css
  songs/<song>.json the song specs
  audio/<song>/     step clips (Opus, ~100 KB each) + loudness JSON
  AUTHORING.md      the prompt pack (below)
```

A page includes `<script src="../kit/scopes.js">` and declares what to show:
`<m8-orbit spec="../songs/night-drive.json" step="3" clip="../audio/night-drive/03.opus">`.
That gives up strict self-containment for consistency: twenty pages drawn by one kit look like
one guide, and fixing a panel fixes every page. "Open the page on its own" in Methodos still
works, because the relative paths still resolve.

**What the app needs:** almost nothing, and nothing M8-specific. `kit/`, `songs/` and `audio/`
are plain files Methodos serves already. One small, subject-neutral change: "Save for offline"
should also cache a guide's non-page files (a `files` list in guide.json, or the tool fills it).
`check` should confirm every `spec=`/`clip=` a page names exists.

## Guide structure

**Start here** (steps)
1. How to use this guide: the mirror, the panels, the clip, "mark done".
2. The M8 in one page: song, chain, phrase, instrument, table. Orbit shows a phrase going
   round; Roll shows chains laid end to end.

**Songs** (one *steps* section per song, all under the group heading "Songs")
Each step page has one job ("add the bassline to chain 01"). It shows:

- what this step adds and why, in two or three sentences;
- the tracker mirror, with the new rows marked;
- Orbit and Roll, before and after;
- the clip, with a written description of what to listen for;
- the instruments used, linked to their patch cards.

The last page of each song is the full song: Roll across the whole arrangement, Roots, and the
Rack on the final mix.

Three songs, each chosen to exercise a different part of the M8 (his choice of music; see the
questions):

| Song | Teaches | Instruments |
|---|---|---|
| 1, first loop | phrase → chain → song, the mixer | sampler drums, a Macrosynth bass, a Wavsynth lead |
| 2, table-driven | tables as arps, envelopes and chords | FM or Hypersynth chords driven by tables |
| 3, sample-built | slicing, recording, resampling | sampler throughout |

**Techniques: Tables** (steps), from the manual's Table View:
1. What a table is: 16 rows that play alongside an instrument at the instrument's own Table
   Tic rate, not the song tempo. Orbit is at its best here: the phrase ring and a smaller,
   faster table ring spinning at their own speeds.
2. The N column: an arpeggio by transposing each row.
3. The V column: a volume shape (V multiplies the phrase volume).
4. FX columns in a table: pitch and filter movement.
5. Length and speed: TIC modes (per trigger, ticks per row, octave, velocity and note maps,
   200 Hz) and HOP to shorten a table.
6. Beyond the instrument's own table: the 128 shared tables and the TBL command.

**Techniques: Sampling** (steps), from the manual's Sampler and Sample Editor:
1. Load a sample; .wav only, mono or stereo; why the high-pitch limit exists (it streams from
   SD) and how mono or lower bit depth lifts it.
2. Start, loop and slices, with Rack's waveform showing the markers.
3. Recording on the M8: sources (line, mic, USB, a track), the arm threshold.
4. Resampling a track of the song.
5. His Zoom M4 route for heavy pitch-down: record at 96 kHz float, transpose on the desktop,
   export at 44.1 kHz for the M8 (from his instruments notes).

**Patch cards** (cards)
One card per instrument: the type (Wavsynth, Macrosynth, Sampler, FM, Hypersynth, MIDI Out,
External), every parameter as the screen shows it, its mods, its table if it has one (with a
tracker mirror), a clip of a phrase played on it, and the Rack. Tags give type and role (bass,
lead, pad, drums). "Used in" comes free from Methodos backlinks. Every instrument from the songs,
then extras worth trying.

## Making the artifacts

The input is still artifacts made in Claude or ChatGPT. To keep forty of them consistent,
`AUTHORING.md` is a prompt pack: page templates for a song step, a technique step and a patch
card; the kit's tags and what each takes; the spec schema; the hue rules above; and the house
voice. He pastes the pack, the spec and the step into a chat and gets back a page that drops
straight into `tools/methodos.py add`.

A Claude Code session in this repo can also draft pages straight from a spec, with Andrew
curating. Either way, a page isn't done until he has played the step on his unit and it
matches the clip. Until then it carries an **UNVERIFIED** line, as the OP-XY notes in the
music repo do.

## First slice, and what it gates

Per the global rule, nothing gets built on top of a piece he hasn't tried.

1. **Slice 1.** The kit with the tracker mirror, Orbit and Roll only. Song 1, steps 1 and 2. One
   patch card (the bass). Clips from his M8. He works through it with the M8 in hand and the
   Pixel beside it. *Question it answers:* do the panels help him follow along, or are they
   noise next to the grid?
2. **Slice 2**, if 1 works: Roots and Rack, the rest of Song 1, its patch cards.
3. **Slice 3:** the Tables tutorial (phrase and table orbits together).
4. **Slice 4:** sampling, then Songs 2 and 3.

This is also his first real use of Methodos v0.1, so slice 1 tests the app as well.

## Open questions (his)

1. **Which music?** Genre, tempo, mood for Song 1, and whether three songs is the right number.
   Anything he already has going on the M8 could be Song 1.
2. **Recording.** Is he up for recording a short clip per step (M8 → USB → crane-desk, or the
   Zoom)? Without clips the Rack has nothing to show and nothing checks the spec.
3. **Audio in git.** Small Opus clips in this repo (about 2–5 MB per song) are simplest. If the
   repo goes public for Pages, they go public too. Alternatively they live in `music-library`
   and get copied in at deploy.
4. **Shared kit vs. self-contained pages.** The plan picks the shared kit. The cost: a page
   saved out of the guide loses its panels.
5. **Who drafts pages:** him in Claude/ChatGPT with the prompt pack, a Claude Code session here,
   or both.
6. **His firmware version**, so instructions match the 6.5.2 manual.
7. **Which panels he actually liked** in the reel. The verdicts above are a reading of what
   teaches, not of what he enjoyed watching.
