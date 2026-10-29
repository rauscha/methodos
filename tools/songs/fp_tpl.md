# Faded Polaroid: the parts

**DRAFT, 2026-10-29.** The second sheet in the relay (plan, parts, instrument settings, pages),
written from `docs/m8-songs-plan.md` (itself a DRAFT). Andrew has reviewed neither. This sheet
has every note and every phrase FX; it has no instrument parameter values. The table values and
the `??` FX values were filled in by the third sheet, `docs/songs/faded-polaroid-instruments.md`
(2026-10-29), which also records every change it made here.

**Written on these defaults until he answers the plan's open questions:**

- The B section keeps the borrowed Gm9 (open question 1).
- Track, chain and phrase numbers are this sheet's own, in the plan's track layout. A photo of
  his song view may renumber them (open question 4). One known difference: on his device,
  **phrase 10 holds a chord** (F♯4, instrument 10, `COL B4`, in his photo), while here phrases 1x
  are the arp and 3x the chords, as on the Faded Polaroid patch card.

## 1. Header

| | |
|---|---|
| Title | Faded Polaroid |
| Tempo | 90 BPM |
| Key | D major; the B section borrows Gm9 from D minor |
| Length | nine song rows of eight bars, 72 bars, about 3:12 |
| Groove | a light swing on **tracks 5 and 6 only** (`GRV 01` on row 0 of every drum and hat phrase). Everything else is straight. The arp sits on even rows, so it couldn't swing anyway. |

| Track | Part | Instrument |
|---|---|---|
| 1 | Arp | 01 POLAROID ARP (Wavsynth) |
| 2 | Bass | 02 VELVET BASS (Wavsynth) |
| 3 | Chords | 10 CHORDED (Macrosynth WAV PARAPHONIC, his) |
| 4 | Lead | 04 POLAROID LEAD (Macrosynth, blown/fluted model) |
| 5 | Kick and snare | 05 KICK, 06 SNARE (Sampler) |
| 6 | Hats | 07 HAT (Sampler) |
| 7 | Faded loop | 09 FADED, 0A FADED REV (Sampler) |
| 8 | Reverb freeze | none: phrase FX only |

**How to read the tables.** Rows are hex, 0 to F, as the M8 shows them; the JSON keys them in
decimal (`A`=10, `B`=11, `C`=12, `D`=13, `E`=14, `F`=15). Velocities and FX values are hex. Each
phrase is one bar of sixteen sixteenth-note rows.

**How to read the staff lines.** Note names with durations, one bar between the bar lines; a
quarter note is a beat. "→" means the note carries on into the next bar (the next phrase has
nothing on row 0). Durations run from one note to the next; a plucked or decaying sound fades
sooner than the written value, and the drum lines are counted instead ("3&" is the "and" of
beat 3; "4e" and "4a" are the sixteenths either side of it).

## 2. Instruments used

No values here; the settings agent writes them in `docs/songs/faded-polaroid-instruments.md`.

| No. | Name | Type | Character |
|---|---|---|---|
| 01 | POLAROID ARP | Wavsynth | his patch card: a hollow triangle pluck, a music box through a wall |
| 02 | VELVET BASS | Wavsynth | his patch card: a round, felt-covered filtered saw with a little drive |
| 10 | CHORDED | Macrosynth WAV PARAPHONIC | his instrument 10, COLOR 80 so each `COL` reads as 80 plus the value |
| 04 | POLAROID LEAD | Macrosynth, the blown/fluted physical model | new: a breathy wooden flute on a worn cassette; its table shapes every note |
| 05 | KICK | Sampler | a factory kick: round, short, soft |
| 06 | SNARE | Sampler | a factory brushed rim or muffled clap with a small room |
| 07 | HAT | Sampler | a factory closed hat or shaker, dull and quiet |
| 09 | FADED | Sampler | the A section rendered to a sample, played an octave down |
| 0A | FADED REV | Sampler | 09 cloned with PLAY set to REV, for the outro |

Leave instrument **11** alone: on his device it holds his `COLOR 34` test.

### The feel of each instrument

**Arp (01).** G3 to F♯5, centered around A4: the middle of the mix, sharing the chords'
register. Every note is a separate pluck, a soft rounded "doong" whose bright edge is gone
almost at once, leaving a hollow, woody tone that has faded by the time the next eighth or two
arrives. The top is softened, so it never gets glassy. A very slow, very small pitch wobble, as if
the tape stretched. In the A rows with the lead it steps back: quieter, with gaps, so the lead
has the air above it.

**Bass (02).** E1 to D3. Round and felt-covered: the note starts soft but definite, with no
click and no fizz, and dies away over about three beats. A little drive after the filter gives it
body without brightness. Dry, in the center, under everything. The octave pops on the "and" of 3
are quiet, a thumb on a string; the approach notes on the last eighth are quieter still.

**Chords (10).** A3 to E5, four voices struck together. A soft attack, a long swell-and-fade
that lasts about two bars, so in A each chord is still fading when the next arrives and in B one
strike carries a chord's two bars. Slightly smeared and digital, glassy but gentle; the wonkiness
of the paraphonic shapes is part of the sound. Wide and behind the arp: this is the song's pad.

**Lead (04).** F♯5 to E6, with A5 to E6 the home range: the top of the mix, but soft enough to
live up there. Breathy and airy, a recorder or wooden flute on a worn cassette. Each note starts
with a little air and a small scoop up into pitch; short notes stay plain; long notes grow a
vibrato after about a beat. Notes join each other (one breath per phrase) and stop with an OFF. A
long reverb tail with shimmer, so held notes leave a trace.

**Kick (05).** Low, round and short, no click: a pillow being hit. Dusty rather than punchy.

**Snare (06).** A brushed rim or a muffled clap with a small room around it. The backbeat is
mid-level; the fill notes are near-whispers that rise into the next bar.

**Hat (07).** Closed, dull, quiet; a shaker would do. Off-beats softer than on-beats, two swung
ghosts a bar. It should be felt more than heard.

**Faded loop (09, 0A).** His A section an octave down and at half speed, so it lasts eight bars:
the same chords, slower, lower, duller and a little grainy, as if remembered. Quiet and far back,
the top rolled off. In the outro, backward: every note swells in and cuts off.

## 3. Harmony

### A section (his, unchanged): one chord a bar, played twice per song row

| Bar | Chord | Roman | Bass | Upper structure (note, shape) | The move | Step |
|---|---|---|---|---|---|---|
| 1, 5 | Dmaj9 | I | D2 | F♯4 A4 C♯5 E5 (F♯4, m7 `34`) | home; the top voice is the ninth, E | 2 |
| 2, 6 | Aadd9 | V | A1 | A3 C♯4 E4 B4 (A3, add9 `A4`) | the bass falls a fourth; the top is the ninth again, B | 2 |
| 3, 7 | Bm9 | vi | B1 | D4 F♯4 A4 C♯5 (D4, maj7 `C4`) | the bass steps up; the top is the ninth, C♯ | 2 |
| 4, 8 | Gmaj9 | IV | G1 | B3 D4 F♯4 A4 (B3, m7 `34`) | the bass falls a third; the top is the ninth, A; back to D | 2 |

The bass is the plan's suggestion (D2, A1, B1, G1) rather than his chat's (D2, A2, B1, G2): the
line falls a fourth, steps up, falls a third, and never leaps a seventh. His call. Every chord's
top voice is its own ninth: E, B, C♯, A. The hook comes to rest on ninths too (see Themes).

### B section (new): two bars a chord

| Bars | Chord | Roman | Bass | Upper structure (note, shape) | The move | Step |
|---|---|---|---|---|---|---|
| 1–2 | Em9 | ii | E1 | G3 B3 D4 F♯4 (G3, maj7 `C4`) | the harmony slows down; the bass falls a third to the song's lowest note | 8 |
| 3–4 | Gmaj9 | IV | G1 | B3 D4 F♯4 A4 (B3, m7 `34`) | the bass climbs a third; the top A arrives and stays | 8 |
| 5–6 | Gm9 | iv, from D minor | G1 | B♭3 D4 F4 A4 (B♭3, maj7 `C4`) | B falls to B♭ and F♯ to F, under a held A and a held G: the fade | 8 |
| 7 | Asus4 | V sus | A1 | A3 D4 E4 A4 (A3, sus4 + octave `D4`) | B♭ falls to A; the bass steps up | 8 |
| 8 | Aadd9 | V | A1 | A3 C♯4 E4 B4 (A3, add9 `A4`) | D falls to C♯ inside the chord; on to Dmaj9 | 8 |

Top voices: F♯4, A4, A4, A4, B4, then E5 at the A section. The bottom voice carries the
chromatic line: B3 (bars 3–4; B is also the second voice of Em9), B♭3, A3.

### Breakdown (row 06): his chords at the memory's speed

| Bars | 1–2 | 3–4 | 5–6 | 7–8 |
|---|---|---|---|---|
| Chord | Dmaj9 | Aadd9 | Bm9 | Gmaj9 |
| Bass | none | none | none | none |

**This changes the plan; see section 10.** The faded loop under the breakdown plays his four
bars at half speed, so its chords last two bars each. The live chords and arp follow it. Step 10.

### Outro (row 08)

| Bars | 1–2 | 3–4 | 5–6 | 7–8 |
|---|---|---|---|---|
| Live | Dmaj9 struck, D2 in the bass, the lead's D6 | Dmaj9 struck again, softer | OFF | nothing |
| The memory, backward | Gmaj9 | Bm9 | Aadd9 | Dmaj9 |

Played backward, the faded loop runs his progression in reverse, two bars a chord: IV, vi, V, I.
The song ends on the backward D chord swelling in and cutting off, then the reverb freezes.
Step 10.

## 4. Themes

### The hook (lead, track 4)

Four bars, a statement and an answer with the same rhythm: a quarter rest, two eighths reaching
up, a long note. The first half reaches A5, D6, E6 and sinks to B5; the second reaches B5, C♯6, D6
and sinks to A5. Both long notes arrive with a short slide (`PSL 04`), and both halves come to
rest on the "and" of 2 of their second bar, on the chord's ninth: B over Aadd9, A over Gmaj9. It
never lands on a root, so it never quite comes home. Every note is a chord tone of its bar.

- **A3 (row 03), chain 04:** the hook twice; the eighth bar is the plan's second ending (B5, A5,
  B5, D6), climbing toward the B section instead of settling. Step 6.
- **A4 (row 05), chain 42:** varied. A pickup eighth before each reach (F♯5 into bar 1, A5 into
  bar 3), a sixteenth turn in bar 2 (C♯6, D6, B5), slower slides into the long notes (`PSL 06`),
  small falls into the resting notes, and the lead's second table (`TBL 81`) for a deeper vibrato.
  Same harmony, more ornament: the second time a memory is told. Step 7.
- **Breakdown (row 06), chain 43:** only the reach (hook bars 1–2), once, starting in bar 2 so it
  straddles the slowed D-to-A change; B5 is left hanging through bar 4 and stops. Then four bars
  with no lead at all. Step 10.
- **A5 (row 07), chain 44:** as in A3 until the last bar, which reaches A5 up to E6 on beat 3 and
  holds it (the thirteenth of Gmaj9, the one note of the hook outside its chord). The outro's
  first downbeat steps it down to **D6 over Dmaj9 and a D2 bass**, the root, the first and only
  time. That D6 is the last thing the lead plays. Step 10.

### The fade line (B section, four tracks at once)

B, B, B♭, A over Em9, Gmaj9, Gm9, A: a half step down at a time into the dominant.

| Bars | 1–2 Em9 | 3–4 Gmaj9 | 5–6 Gm9 | 7–8 Asus4, Aadd9 |
|---|---|---|---|---|
| Lead (4A, 4B, 4C) | B5 | B5 (struck again) | **B♭5**, sagging down from B with `PSL 0C` | A5, sagging again |
| Chords, bottom voice | (G3; B3 above it) | B3 | B♭3 | A3 |
| Arp | B4 | B3, B4 | B♭3, B♭4 | A3, A4 |
| Bass | | | B♭1 on the last eighth of bar 6, falling to A1 | A1 |

The lead's slow slide from B5 to B♭5 is the song's center: the note itself seems to warp, like
a stretched tape. Nothing else is busy there: the bass holds G, the chord is struck once and fades.

### Ninths on top

His chords put the ninth on top of every chord (E, B, C♯, A). The hook rests on ninths. The B
arp leans on ninths and sevenths. The song's one root on top is the lead's last D6.

### The memory (track 7)

His own A section, rendered and played back at half speed: the intro (alone), the breakdown
(under the slowed live parts) and the outro (backward). It's the only part not played live.

### The bass's step

From A2 on, every bar ends with a quiet note a step away from the next root (B before A, C♯
before B, A before G, E before D), and the next root scoops in from it with `PSL 02`. In the B
section the step before the A chord is B♭, so the bass joins the fade line for one eighth note.

## 5. Song rows

### Working rows, steps 2 to 9

A page at step N plays what is on at N. Until step 10 the song view is a workbench: row 00 is his
loop, growing a part per step; row 01 is the B section from step 8; row 02 is the faded loop alone
at step 9.

| Row | T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 | Step | What happens |
|---|---|---|---|---|---|---|---|---|---|---|
| 00 | 01 (4) | 02 (3, until 4); 21 (5, until 7); 22 (8, until 9) | 03 (2) | 04 (6, until 6); 42 (7, until 9) | 05 (5) | 06 (5) | | | 2, until 9 | his loop, one part per step |
| 01 | 12 | 24 | 31 | 41 | 51 | 06 | | | 8, until 9 | the B section, alternating with row 00 |
| 02 | | | | | | | 07 | | 9, until 9 | the memory on its own |

### The finished song, step 10

| Row | Section | T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 | What happens |
|---|---|---|---|---|---|---|---|---|---|---|
| 00 | Intro: the memory | | | | | | | 07 | 80 | the faded loop alone, half speed; the freeze is turned off |
| 01 | A1: his loop | 01 | 02 | 03 | | | | | | arp, roots, chords: his four bars twice |
| 02 | A2: the beat | 01 | 21 | 03 | | 05 | 06 | | | drums and hats; the bass figure |
| 03 | A3: the hook | 11 | 22 | 03 | 04 | 05 | 06 | | | the lead enters; the arp steps back |
| 04 | B: the fade | 12 | 24 | 31 | 41 | 51 | 06 | | | two bars a chord, the borrowed Gm9, the counter-line |
| 05 | A4: the hook again | 11 | 23 | 03 | 42 | 05 | 06 | | | the hook varied, deeper vibrato |
| 06 | Breakdown | 13 | | 32 | 43 | | | 71 | | the memory under his loop slowed to match it; the reach once |
| 07 | A5: last time | 11 | 21 | 03 | 44 | 05 | 06 | | | the hook, reaching E6 at the very end |
| 08 | Outro: rewinding | | 25 | 33 | 45 | | | 72 | 81 | D6 over Dmaj9; the memory backward; freeze |

An empty cell means no chain. Nothing is left sounding into an empty cell: the drums and the
bass decay on their own, and the lead and chords are ended by OFFs in their chains. After row 08
the M8 loops back to row 00, where `XRZ 00` thaws the frozen chord into the intro, which starts on
the same D: the song becomes a circle. Stopping playback during the freeze ends it on the still
picture instead.

## 6. Chains

No chain uses TSP: each bass bar steps into the next root differently, and the hook and arp are
written out, so transposing a phrase would break them.

{{CHAINS}}

## 7. Phrases

{{PHRASES}}

## 8. Tables (instrument 04, the lead)

A table that shapes every note in time: a small scoop up into pitch, then nothing, then a
vibrato that only starts once the note has held for a while. Short notes finish before the
vibrato arrives; long notes bloom. Values from the settings sheet
(`docs/songs/faded-polaroid-instruments.md`). **TABLE TIC is `03`** (the screen says TBL. TIC):
three ticks a row, so rows 0 to 2 (the scoop) take the first sixteenth (6 ticks) and row 8
arrives 24 ticks in, one beat into the note. An eighth note (12 ticks) gets to row 4 and stays
plain.

**FIN is relative** (changelog: "FM, Macro, and Wavsynth had relative FIN command wrap back to
-1"), so rows 1 and 2 add back what row 0 took away: −16, +8, +8, and the note lands on pitch.
A note with an instrument number resets it, so every note starts from zero. One FIN step is
1/128 of a semitone (the manual: FIN spans −1 to +1 semitone); `F0` is about 12 cents flat.

### Table 04 (the lead's own table) · step 7

| Row | N | V | FX1 | FX2 | FX3 | What it does |
|---|---|---|---|---|---|---|
| 0 | 00 | 50 | FIN F0 | | | the breath: starts about 12 cents flat and at two-thirds level |
| 1 | 00 | 68 | FIN 08 | | | halfway up to pitch (about 6 cents flat) |
| 2 | 00 | 7F | FIN 08 | | | on pitch, full level |
| 3 to 7 | | | | | | empty: the note holds still; these rows are the wait |
| 8 | | | PVB 52 | | | the vibrato starts, narrow |
| 9 | | | PVB 54 | | | the vibrato at its full width |
| A | | | HOP 09 | | | stay on row 9 for as long as the note lasts |
| B to F | | | | | | empty |

PVB's speed (first digit) and depth (second) have no published scale: `5` and `2`–`4` are a
starting point, set by ear toward about five wobbles a second, never wider than a quarter tone.

### Table 81 (a free table, for A4) · step 7

The same rows with a deeper vibrato in rows 8 and 9 and a slightly bigger scoop in row 0. A4's
long notes carry `TBL 81`; the breakdown's first note carries `TBL 04` to come back. The number
81 is a suggestion: on the M8, EDIT twice on a TBL value picks the next unused table, and the
Tables page already uses 80.

| Row | N | V | FX1 | FX2 | FX3 | What it does |
|---|---|---|---|---|---|---|
| 0 | 00 | 48 | FIN E8 | | | a deeper breath: about 19 cents flat, a little softer |
| 1 | 00 | 64 | FIN 0C | | | halfway up |
| 2 | 00 | 7F | FIN 0C | | | on pitch, full level |
| 3 to 7 | | | | | | empty: the wait |
| 8 | | | PVB 54 | | | the vibrato starts |
| 9 | | | PVB 57 | | | wider than table 04's |
| A | | | HOP 09 | | | hold on row 9 |
| B to F | | | | | | empty |

## 9. Harmony check

What was checked, with the generator's help (every pitched note in every chain of every song
row against the chord of its bar; then the lead against everything sounding with it), and by
hand for the chord voicings:

- **Every note against its chord.** All arp, chord, bass and lead notes are chord tones of their
  bar, except these, all deliberate:
  - Bass phrase 24, row E: B1 over Dmaj9 (the sixth), and phrase 27, row E: E2 over Gmaj9 (the
    sixth). Quiet passing steps on the last eighth, into A1 and D2.
  - Lead phrase 46, row 5: D6 over Aadd9, a sixteenth upper neighbor in A4's turn.
  - Lead phrase 49, row 8: E6 over Gmaj9, the thirteenth, held two beats at the end of A5, then
    resolved to D6 over Dmaj9 at the outro.
- **No accidental clashes**, apart from the two that come from the plan's fixed material and are
  intended:
  - **Bm9, hook bar 3:** the lead's D6 sits a minor ninth above the chord's top voice, C♯5 (and the
    arp's C♯5 on row E). That is the ninth below the third, which can bite; here the two are more
    than an octave apart, the lead is soft, and the D6 is gone a beat into the next bar. If it bites
    on the device, the cure is in the chord (a COLOR shape with the C♯ lower), not the hook.
  - **Gm9, B bars 5–6:** the lead's B♭5 sits a minor ninth above the chord's top A4 and the arp's
    A4. This one is the point: B♭ leans on the A that is already sounding, and falls to it in bar 7.
  - The B bass is the only part that plays B♭ against anything with B natural: none of the Gm9
    bars has a B natural in any track.
- **The breakdown as the plan has it would clash.** The half-speed memory holds each chord for two
  bars while live chords change every bar: bar 3 (live Bm9 over remembered Aadd9: D and F♯ against
  E), bar 4 (live Gmaj9 over remembered Aadd9: G against the remembered C♯, a tritone), bar 6 (live
  Aadd9 over remembered Bm9: E against D and F♯). Hence section 10, item 1.
- **The outro's first two bars** put the live Dmaj9 over the backward Gmaj9, an octave down: D
  major over G, a Lydian blur. Accepted: the backward sound starts from its quiet tail, so it is a
  soft wash, and bars 3–4 (over the backward Bm9) share four notes with Dmaj9.
- **Top voice.** Chords: E5, B4, C♯5, A4 in A (all ninths); F♯4, A4, A4, A4, B4 in B, back to E5.
  The lead: A5–E6 above everything; no other part goes above F♯5.
- **Bass line.** A section D2, A1, B1, G1 (down a fourth, up a step, down a third, up a fifth home),
  with step approaches. B section E1, G1, G1, A1, then up a fourth to D2: it climbs where the A
  section falls.
- **Voice leading.** His paraphonic chords move as parallel shapes (each bar is a new four-note
  block, F♯4 shape down to A3 and so on); that is his sound and stays. In B the shapes move by
  common tones: Gmaj9 to Gm9 changes two voices by a half step and holds two, Gm9 to Asus4 to Aadd9
  moves one voice at a time. The arp moves into each new bar by a step or a common tone in B
  (1B's last D4 falls to his C♯4).
- **Register.** The arp and the chords share A3–E5 by design (his). The lead is an octave above
  the arp's top. The bass stays below D3.

## 10. Changes to the plan, and flags

Things this sheet does differently from the plan, each for a reason; his call on all of them.

1. **The breakdown's harmony slows down** (row 06): the arp plays each of his bars twice (chain 13)
   and the chords strike every other bar (chain 32), so the live parts match the half-speed memory
   under them. Why: the plan's version clashes (section 9). To get the plan's version back, put
   chains 01 and 03 in row 06; to keep one chord a bar without clashes, leave track 7 empty there.
2. **The reach in the breakdown** starts in bar 2, not bar 1, so it straddles the slowed D-to-A
   change as the hook does at normal speed, and it plays once, not twice.
3. **The resolution moves by half a bar.** The plan has A5's final bar hold E6 and step down to D6.
   Over that bar's Gmaj9, D is the fifth, not the root. Here A5's last bar reaches E6 and the D6
   arrives on the outro's downbeat, over Dmaj9: the same E-to-D, now landing on the root.
4. **The outro gets a bass note**, one D2 in bar 1 (chain 25). Without a D under it, the rootless
   Dmaj9 shape is just F♯m7, and the last D6 wouldn't sound like home.
5. **The outro's chords:** Dmaj9 struck in bars 1 and 3, OFF at bar 5, where the backward A chord
   begins. The plan says "Dmaj9 held, then OFF"; with his AHD the chord fades in about two bars, so
   it is struck twice to last four.
6. **The B roots go down to E1**, below the plan's G1–D2 bass range, so the B bass climbs E, G, A,
   D and answers the A section's falling line.
7. **The bass figure arrives at step 5 with the drums**, not step 3: step 3 is the roots alone, as
   the plan describes it; the octave pop belongs with the kick it lands on.
8. **A4's deeper vibrato is a second table** chosen with TBL, so step 7 also teaches TBL.
9. **Track 8 holds the freeze** (`XRZ FF` in the outro's last bar) and its release (`XRZ 00` at the
   top of the song). The plan left track 8 free.
10. **Wording only:** the hook "rises a sixth in three notes" in the plan; A5 to E6 is a fifth. His
    arp spans G3 to F♯5, not D4 to F♯5 (his bars 3 and 4 start on B3 and G3); nothing moved.
11. **Added by the settings sheet:** `NTH 40` on the fill rows of phrase 50; the values of tables 04
    and 81 (section 8); and the memory is rendered from a spare song row holding only chains 01
    and 03, rather than with track 2 muted. No note moved.

## 11. Depends on device behavior not yet settled

Each becomes an Unverified box on the pages, with its fallback.

- **COLOR shapes `A4`, `C4`, `D4`** come from the Braids source and the chat, not his ears (`D4`
  is new, for Asus4). Fallback: if `D4` isn't sus4 + octave, Asus4 can be skipped (bar 7 plays
  phrase 31, Aadd9, for two bars) at the cost of the sus resolution.
- **The blown/fluted model's name on 6.6.3, and whether it speaks on an eighth note.** The hook's
  pickups are eighths. Fallback: the settings agent picks the nearest model that speaks quickly;
  the parts don't change.
- **PVB in a table's FX columns,** and whether re-reading row 9 through the HOP restarts the
  vibrato every two rows (it would stutter). Fallback for the stutter: move the HOP to row B as
  `HOP 0A`, so the table idles on empty rows after row 9. Fallback if PVB does nothing in a table:
  the vibrato written into the phrases instead, `PVB 54` on an empty row about a beat after each
  long note (row C after a long note on row 8; row A after a long note on row 6). FIN is settled:
  it is relative (changelog), and the table is written for that.
- **Whether TBL stays set after the next note.** Written to work either way: A4 puts `TBL 81` on
  every long note, and the breakdown's first note puts `TBL 04` back.
- **Whether PSL stays on for later notes.** Written as if it applies to its own row only. If it
  stays on, add `PSL 00` to the note after each slide.
- **NTH's counting** (the manual defers to the help line). `NTH 40` is written for "the left side
  plays on every fourth pass"; read the help line when you enter it. Fallback: chain 05 as
  `50 50 50 51 50 50 50 51`, with the fill written out in phrase 51.
- **Rendering the A section** for the memory: render his loop **without the bass**, because half
  speed would put the bass at D1 to G0, below hearing and full of mud. The settings sheet does it
  from a spare song row holding only chains 01 and 03 (no question of whether QUICK RENDER honors
  mutes), then crops the sample to exactly four bars (6.6 fixed a quick-render length error, so
  check), so half speed fills exactly eight.
- **C-4 plays a sample at its own pitch** (the Sampling page's open check). The memory is played on
  C-3, an octave below whatever note does.
- **PLAY REV:** where a backward sample starts (its end, or START), for 0A.
- **XRZ:** the manual says any value above 00 freezes; `FF` is used. Whether `XRZ 00` at the top
  of the song thaws it cleanly.

## 12. For the settings agent

- Instruments 01, 02 and 10 are on his cards and his device: start from those and say where you
  change anything. Instrument 10's COLOR stays at 80; the `COL` values in phrases 30–36 assume it.
- **Lengths the parts assume.** Arp notes fade within one or two eighths. Bass notes last about
  three beats (his card's AHD does). Chords swell and fade over about two bars (his card's AHD,
  hold 60 and decay 60 in ticks, is exactly two bars at any tempo); the B section strikes once per
  two bars and relies on that. The lead sustains until the next note or an OFF.
- The lead needs a quick, soft attack it can scoop from, and a short release on OFF. Shimmer on
  the reverb is a mix moment for its tail (plan: 6.2+).
- Groove 01: a light swing; it is only on tracks 5 and 6.
- 09 FADED: PLAY FWD (not a loop), dulled and a little grainy (filter, DEGRADE), quiet. 0A: a clone
  of 09 with PLAY REV.
- Velocities in the phrases set the balance inside each part; the levels between parts are yours.
- Tables 04 and 81: values for every `??`, TABLE TIC, and whether FIN is relative. **Done:** see
  section 8 and `docs/songs/faded-polaroid-instruments.md`.

## 13. For the builder

- `tools/m8_faded_polaroid.py` in the style of `tools/m8_low_tide.py`. Rows here are hex; the JSON
  keys them in decimal. Every phrase heading gives its step; a row with its own Step value
  overrides it; `until` marks the last step something belongs to.
- FD and FE are shared phrases, as in Low Tide (FE empty, FD an OFF on row 0).
- The kit doesn't yet play `COL` (it would need the paraphonic shapes), `NTH`, `PVB` or `FIN` in a
  table, `XRZ`, or PLAY REV. TBL, PSL, CHA, GRV and OFF it already does.
- The staff lines are for the pages as text; the roll draws the same notes.
