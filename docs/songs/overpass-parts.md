# Overpass: the parts

**DRAFT, 2026-10-29.** The second sheet in the relay (plan, parts, instrument settings, pages),
written from `docs/m8-songs-plan.md` (itself a DRAFT). Andrew has reviewed neither. This sheet
has every note and every phrase FX; it has no instrument parameter values, and no table values
(those are `??` for the settings agent).

**Written on these defaults until he answers the plan's open questions:**

- Overpass is written as planned: 124 BPM, 2-step meeting deep house (open question 2).
- The hook is **his own hummed voice** (open question 3). **Fallback:** the Macrosynth VOWEL FOF
  model holding one long "ooh" on C, rendered to a sample, then used exactly as below (instrument
  06 and its clones hold the render instead of a recording; every phrase stays the same).
- Track, chain and phrase numbers are this sheet's own, in the plan's track layout.

## 1. Header

| | |
|---|---|
| Title | Overpass (working title) |
| Tempo | 124 BPM |
| Key | A minor; F♯ from A Dorian in the last bar of the loop; a B section on ♭VI and ♭VII |
| Length | nine song rows of eight bars, 72 bars, about 2:20 |
| Groove | **everything swings the same**, a heavy sixteenth swing (heavier than Low Tide's). Rather than a GRV on every phrase, the plan for this song is to **edit groove 00**, the groove every track uses by default; no phrase here carries a GRV. The odd rows are the swung ones: the shaker, the kick's ghost, the rim, the stab on "1a", the voice's stutter. |

| Track | Part | Instrument |
|---|---|---|
| 1 | Kick | 01 KICK (Sampler: slices of one kit) |
| 2 | Clap and rim | 02 CLAP (clone of 01) |
| 3 | Hats and shaker | 03 HATS (clone of 01) |
| 4 | Bass | 04 FM SUB (FM synth); 0B SUB HOLD (clone, for B) |
| 5 | Stabs | 05 STAB MIN9, 08 STAB MAJ9 (Sampler: the renders) |
| 6 | Voice | 06 VOICE, 09 VOICE REV, 0C VOICE DUB (Sampler: his recording) |
| 7 | Rain | 07 RAIN (Sampler) |
| 8 | DJ filter | none: DJC only |

During steps 3 and 4, tracks 5 to 8 hold the four FM voices that get rendered (instrument 0A,
GLASS KEYS); after the render they are cleared and take the parts above.

**How to read the tables.** Rows are hex, 0 to F, as the M8 shows them; the JSON keys them in
decimal (`A`=10, `B`=11, `C`=12, `D`=13, `E`=14, `F`=15). Velocities and FX values are hex. Each
phrase is one bar of sixteen sixteenth-note rows.

**How to read the staff lines.** Note names with durations, one bar between the bar lines; a
quarter note is a beat. "→" means the note carries on into the next bar. Drums and stabs are
counted instead: "1a" is the last sixteenth of beat 1, "2&" the "and" of 2. The bass lines show
the notes as short as they are meant to be played (an eighth), with the rests that make the line.

## 2. Instruments used

No values here; the settings agent writes them in `docs/songs/overpass-instruments.md`.

| No. | Name | Type | Character |
|---|---|---|---|
| 0A | GLASS KEYS | FM synth | the Glass keys card: an electric piano, a glassy tine over a round body. Steps 2–4 only |
| 05 | STAB MIN9 | Sampler | the Cm9 chord rendered from four tracks of 0A; played on A, D, E |
| 08 | STAB MAJ9 | Sampler | the Cmaj9 render; a clone of 05, so it carries a copy of 05's table; played on F and G |
| 04 | FM SUB | FM synth | a second FM patch: round, rubbery, a soft knock at the front; short notes |
| 0B | SUB HOLD | FM synth | 04 cloned with an envelope that sustains until the next note or an OFF (the B section's held notes) |
| 01 | KICK | Sampler | one sliced kit or break; this instrument plays the kick slices |
| 02 | CLAP | Sampler | 01 cloned: same sample and slices, its own filter and sends, plays the clap and rim |
| 03 | HATS | Sampler | 01 cloned again, for the hats and shaker |
| 06 | VOICE | Sampler | his hummed "ooh" on one C |
| 09 | VOICE REV | Sampler | 06 cloned with PLAY REV: the backward fragments |
| 0C | VOICE DUB | Sampler | 06 cloned with a large delay send: the dub throws |
| 07 | RAIN | Sampler | rain and traffic, FWDLOOP: Low Tide's field loop (Low Tide step 8) or a new recording |

### The slice map (instruments 01, 02, 03)

The plan's step 6 slices a factory kit or break (SLICE, slice markers, or the lazy chop). The
phrases assume the slices land in this order; each slice plays on a note, counting up from C-1.

| Note | Slice | What it should be | Played by |
|---|---|---|---|
| C-1 | 0 | a short kick | 01, track 1 |
| C#1 | 1 | (spare: a second kick) | |
| D-1 | 2 | a dry clap | 02, track 2 |
| D#1 | 3 | a rim | 02, track 2 |
| E-1 | 4 | a closed hat | 03, track 3 |
| F-1 | 5 | an open hat | 03, track 3 |
| F#1 | 6 | a shaker | 03, track 3 |

A lazy chop of a break puts the slices in the order the break plays them, which won't be this
one. Then only the N column changes: note which slice is which and type those notes; the rhythms
stay.

### The feel of each instrument

**Glass keys (0A).** E♭4 to G5, one note per track. An electric piano: a glassy tine at the front
that is gone within a beat, a round body under it that rings out over the bar. Almost dry. It is
only ever heard rendered.

**Stabs (05, 08).** A3 to B5, four voices, always the same shape. Short: a stab is a hit and a
little ring, cut by the next one. The tine is softened by rendering and by being played below or
just above its own pitch, so the stabs read as round and a little worn, the lit windows in the
song. Mid-level, in the center, the warmest thing in the mix. The table nudges each hit, so no two
in a row are identical. In B (08) the stabs are fewer and ring longer.

**FM bass (04, 0B).** A1 to E2 for the roots, with octave pops up to D3. Deep and round, with a
soft knock at the front of each note from a fast envelope on the modulator; no buzz. Short notes,
about an eighth, with rests between them: the rests are half the line. Slides into the next root.
Mono, dead center. In B (0B) the notes hold for two bars and slide up a step.

**Kick (01).** Short and thumpy, tight, centered. The ghost before beat 1 is a soft nudge, not a
second kick.

**Clap and rim (02).** A dry clap with a short room around it. The rim is a quiet click right
after the kick. The breakdown's build rises from almost nothing to the loudest clap in the song,
then stops dead for an eighth.

**Hats and shaker (03).** Crisp but quiet. The closed hat's off-beat eighths carry the groove; the
on-beats are softer; the shaker on every swung sixteenth is barely there. Velocity does the work.

**Voice (06, 09, 0C).** Breathy and close, a little lo-fi. Chopped: every note starts at the front
of the hum and is cut hard by the next note or an OFF, so it sounds like fragments of a sung line
rather than a singer. Above the stabs (see the octave note at the voice phrases). The backward
clone swells in and cuts off; the dub clone throws single notes into a long delay.

**Rain (07).** Rain, traffic, wet pavement. Low, dull, wide and far back; never louder than the
hats. It runs from the intro to the dub, drops out for the dub, and comes back for the outro.

**DJ filter (track 8).** No sound of its own: it closes the whole mix for the intro, the breakdown
and the outro, and opens it into the drops.

## 3. Harmony

The chords are two rendered stabs, each a rootless four-voice shape built on C, so the note you
type names the chord.

| Stab | Built as | Voicing (third, seventh, ninth, fifth, upward) |
|---|---|---|
| MIN9 (05) | Cm9 | E♭4 B♭4 D5 G5 |
| MAJ9 (08) | Cmaj9 | E4 B4 D5 G5 |

### A section: one shape moving in parallel

| Bar | Chord | Roman | Bass | Stab note: sounds | The move | Step |
|---|---|---|---|---|---|---|
| 1 | Am9 | i | A1 | A-3: C4 G4 B4 E5 | home | 5 |
| 2 | Am9 | i | A1 | | the bass slides up to D an eighth early | 5 |
| 3 | Dm9 | iv | D2 | D-4: F4 C5 E5 A5 | every voice up a fourth; F natural | 5 |
| 4 | Dm9 | iv | D2 | | the bass slides down to A an eighth early | 5 |
| 5 | Am9 | i | A1 | A-3 | every voice down a fourth | 5 |
| 6 | Am9 | i | A1 | | the bass slides up to D an eighth early | 5 |
| 7 | Dm9 | iv | D2 | D-4 | the stab and the bass both push into Em9 on the last eighth | 5 |
| 8 | Em9 | v (Dorian) | E2 | E-4: G4 D5 F♯5 B5 | up a step; **F♯**, the loop's one bright note; the bass slides down a fifth, home | 5 |

The top voice is always the chord's fifth: E5, E5, A5, A5, E5, E5, A5, B5, back to E5. The bass
plays every root. The intro, build, A sections and breakdown all use this progression; the
outro plays it once and ends on a long Am9 in bar 7.

Em9 sits at E-4 rather than E-3 so that its F♯ is F♯5, the note the voice joins at the peak; its
top, B5, is a step above the plan's "about A5". The renders are played from seven semitones below
their own pitch (F-3) to four above (E-4).

### B section: the second shape, the lift

| Bars | Chord | Roman | Bass | Stab note: sounds | The move | Step |
|---|---|---|---|---|---|---|
| 1–2 | Fmaj9 | ♭VI | F2, held | F-3: A3 E4 G4 C5 | the major shape; the warmest chord in the song | 5 (stabs), 10 (bass) |
| 3–4 | Gmaj9 | ♭VII | G2, held, slides up from F | G-3: B3 F♯4 A4 D5 | everything up a whole step; F♯ again | 5, 10 |
| 5–6 | Fmaj9 | ♭VI | F2 | F-3 | down a step | 5, 10 |
| 7–8 | Gmaj9 | ♭VII | G2 | G-3 | up a step; on to the breakdown's Am9, a third whole step up | 5, 10 |

Top voice C5, D5, C5, D5, then E5 when the breakdown's Am9 arrives: F, G, A, climbing in whole
steps out of the tunnel.

## 4. Themes

### The hook (voice, track 6)

Two bars. Bar 1: E, a stutter on E, a gap, G, A held, a gap, G. Bar 2: E held, D, and a long C, the
minor third. A small climb to A and a fall past the starting note; pentatonic, on the "and"s,
garage phrasing. Every note in it is one of five pitches, so one hummed note pitched around stays
natural.

**The octave.** The phrases are written as typed. C-4 plays his hummed C at its own pitch, so the
hook sounds wherever he hums. **Hum the C as C5, in head voice** (a breathy falsetto "ooh" is the
sound), and the hook sounds E5 to A5, above the stabs, as the plan has it. If C5 is out of reach,
hum C4: the same phrases sound an octave lower, inside the stabs, which is muddier. Typing the
hook an octave higher instead would pitch a C4 hum up an octave: thin, and likely past the
Sampler's pitch limit.

- **A2 (row 03), chain 60:** three and a half statements. Bars 1–2 and 5–6 over Am9; bar 3 (the
  first bar alone) over Dm9, then silence in bar 4; bars 7–8 over Dm9 and Em9, where the final C
  would clash with Em9 and becomes **B** (its fifth). The same line, re-lit by the chord under it:
  over Am9 the long C is the third; over Dm9 the first bar's E, G, A are the ninth, eleventh and
  fifth. Step 9.
- **B (row 04), chain 61:** fragments. Over Fmaj9, the opening (E, E, G) and then A played
  backward, swelling in; over Gmaj9, a backward G and a short forward A; at the very end a
  backward E swelling into the breakdown's first downbeat, where the forward E answers it. Step 9.
- **Breakdown (row 05), chain 62:** the first bar alone, once, over the stabs. Step 10.
- **A3, the peak (row 06), chain 63:** as A2, but the last note becomes **F♯**, the voice joining
  the stab's bright note. Step 10.
- **A4, dub (row 07), chain 64:** stabs and rain gone; the A of bar 1 and the C of bar 2 thrown into
  the delay (instrument 0C), gaps where the line used to continue, then the line once more with
  its B ending. Step 10.

### The one shape (stabs, track 5)

One rendered chord played on every root, the deep-house "chord memory". Every voice moves the
same distance, so the stabs slide around as a single block, and the top voice is always the fifth.
The A section uses the minor shape, the B section the major one: changing one note of the render
(E♭ to E) is all that separates the cold half of the song from the warm half.

### The 2-step rhythm and the early arrival

The kick plays 1 and the "and" of 3, never beat 3: that missing beat is the skip. The stabs fall
between the kicks and claps ("1a", "2&", "4&", then "2&", "3a"). The bass and the stabs arrive at
each new chord an eighth early, sliding in, so the loop leans forward into every change.

### The bright note

F♯, from A Dorian. It appears in the Em9 stab of bar 8 (the turnaround), in the voice at the peak
(row 06's last note), and in the B section's Gmaj9 stabs. Everything else is in A minor.

## 5. Song rows

### Working rows, steps 3 to 9

| Row | T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 | Step | What happens |
|---|---|---|---|---|---|---|---|---|---|---|
| 00 | | | | | 90 | 91 | 92 | 93 | 3, until 4 | Cm9, one note per track, to render |
| 01 | | | | | 94 | 95 | 96 | 97 | 3, until 4 | Cmaj9, to render |
| 00 | 10 (6) | 23 (6) | 30 (6) | 40 (8) | 50 (5) | 60 (9) | | | 5, until 9 | the A loop, one part per step |
| 01 | | | | | 51 (5) | 61 (9) | | | 5, until 9 | the B stabs, and from step 9 the voice's fragments |

At step 5 the two FM rows are gone (the renders are made and tracks 5–8 cleared), and rows 00 and
01 are rewritten as the working loop.

### The finished song, step 10

| Row | Section | T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 | What happens |
|---|---|---|---|---|---|---|---|---|---|---|
| 00 | Intro | | | | | 50 | | 70 | 80 | stabs and rain under a closed filter that opens a beat at a time in bar 8 |
| 01 | Build | | | 30 | 41 | 50 | | 71 | | hats; the bass, roots only |
| 02 | A1 | 10 | 20 | 30 | 40 | 50 | | 71 | | the beat and the bassline |
| 03 | A2: the hook | 10 | 20 | 30 | 40 | 50 | 60 | 71 | | the voice |
| 04 | B | 11 | 21 | 30 | 42 | 51 | 61 | 71 | | half-time, held bass, the major stabs, backward fragments |
| 05 | Breakdown | | 22 | | | 52 | 62 | 71 | 81 | one stab a bar, the hook's first bar once, the filter closes; the build in bars 7–8 |
| 06 | A3: the peak | 10 | 20 | 30 | 40 | 50 | 63 | 71 | | everything; the voice ends on F♯ |
| 07 | A4: dub | 10 | 20 | 30 | 40 | | 64 | 72 | | no stabs, no rain; the voice thrown into the delay |
| 08 | Outro | | | | | 53 | | 70 | 82 | stabs and rain under a closing filter, ending on one long Am9 |

An empty cell means no chain. The only sustained sounds are the B bass (ended by the OFF in
phrase 4C), the voice (ended by OFFs or the next note) and the rain (started in row 00, carried
through rows 01–06 by chain 71, which has no notes, stopped by chain 72, started again in row 08).
Playback started from a middle row has no rain until row 08.

## 6. Chains

No chain uses TSP: the point of the stabs is that the note you type names the chord, and the bass
slides differ from bar to bar.

| Chain | Track | Phrases in order (one bar each) | TSP | Step | What it is |
|---|---|---|---|---|---|
| 90 | 5 | 90 FE | — | 3, until 4 | Cm9 voice 1 and a bar of tail |
| 91 | 6 | 91 FE | — | 3, until 4 | Cm9 voice 2 |
| 92 | 7 | 92 FE | — | 3, until 4 | Cm9 voice 3 |
| 93 | 8 | 93 FE | — | 3, until 4 | Cm9 voice 4 |
| 94 | 5 | 94 FE | — | 3, until 4 | Cmaj9 voice 1 and a bar of tail |
| 95 | 6 | 95 FE | — | 3, until 4 | Cmaj9 voice 2 |
| 96 | 7 | 96 FE | — | 3, until 4 | Cmaj9 voice 3 |
| 97 | 8 | 97 FE | — | 3, until 4 | Cmaj9 voice 4 |
| 10 | 1 | 10 10 10 11 10 10 10 11 | — | 6 | the 2-step kick, a ghost every fourth bar |
| 11 | 1 | 12 13 12 13 12 13 12 13 | — | 10 | half-time kick (B) |
| 20 | 2 | 20 21 20 21 20 21 20 21 | — | 10 | claps, a rim every other bar |
| 23 | 2 | 20 21 20 21 20 21 22 23 | — | 6, until 9 | the working loop: claps, and the RET build in bars 7–8 |
| 21 | 2 | 24 24 24 24 24 24 24 24 | — | 10 | half-time clap (B) |
| 22 | 2 | FE FE FE FE FE FE 22 23 | — | 10 | silence, then the build (breakdown) |
| 30 | 3 | 30 31 30 31 30 31 30 31 | — | 6 | hats and shaker, the open hat every other bar |
| 40 | 4 | 40 41 42 43 40 41 44 45 | — | 8 | the bassline |
| 41 | 4 | 46 46 47 47 46 46 47 48 | — | 10 | roots only (build) |
| 42 | 4 | 49 FE 4A FE 49 FE 4A 4C | — | 10 | held F and G (B), OFF at the end |
| 50 | 5 | 50 51 52 53 50 51 54 55 | — | 5 | the A stabs |
| 51 | 5 | 56 57 58 59 56 57 58 59 | — | 5 | the B stabs (the MAJ9 render on F and G) |
| 52 | 5 | 5A 5A 5B 5B 5A 5A 5B 5C | — | 10 | one stab a bar (breakdown) |
| 53 | 5 | 50 51 52 53 50 51 5D FE | — | 10 | the A stabs, ending on one long Am9 |
| 60 | 6 | 60 61 60 FD 60 61 60 62 | — | 9 | the hook three and a half times; B at the end |
| 61 | 6 | 66 FE 67 FE 66 FE 68 69 | — | 9 | fragments, some backward (B) |
| 62 | 6 | 60 FD FE FE FE FE FE FE | — | 10 | the hook's first bar, once |
| 63 | 6 | 60 61 60 FD 60 61 60 63 | — | 10 | as 60, ending on F♯ |
| 64 | 6 | 64 65 FD FE 64 FD 60 62 | — | 10 | the dub: throws into the delay, more space |
| 70 | 7 | 70 FE FE FE FE FE FE FE | — | 10 | rain starts |
| 71 | 7 | FE FE FE FE FE FE FE FE | — | 10 | rain carries on (no new note) |
| 72 | 7 | FD FE FE FE FE FE FE FE | — | 10 | rain stops |
| 80 | 8 | 80 8F 81 8F 82 8F 83 84 | — | 10 | intro: closed, opening |
| 81 | 8 | 85 8F 86 8F 87 8F 88 89 | — | 10 | breakdown: closes, then opens into the drop |
| 82 | 8 | 8A 8F 8B 8F 8C 8F 8D 8E | — | 10 | outro: closing |

## 7. Phrases

### Tracks 5 to 8, steps 3 and 4 only: the FM chord to render (instrument 0A)

#### Phrase 90 · track 5 · Cm9 voice 1: the third · step 3, until 4

One note per track, all four on instrument 0A at the same moment. The envelope lets each ring out over the bar.

Staff: | E♭4 whole |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 0 | D#4 | 60 | 0A |  |  |  | 3 |  |

#### Phrase 91 · track 6 · Cm9 voice 2: the seventh · step 3, until 4

Staff: | B♭4 whole |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 0 | A#4 | 60 | 0A |  |  |  | 3 |  |

#### Phrase 92 · track 7 · Cm9 voice 3: the ninth · step 3, until 4

Staff: | D5 whole |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 0 | D-5 | 60 | 0A |  |  |  | 3 |  |

#### Phrase 93 · track 8 · Cm9 voice 4: the fifth · step 3, until 4

Staff: | G5 whole |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 0 | G-5 | 60 | 0A |  |  |  | 3 |  |

#### Phrase 94 · track 5 · Cmaj9 voice 1: the third · step 3, until 4

Staff: | E4 whole |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 0 | E-4 | 60 | 0A |  |  |  | 3 |  |

#### Phrase 95 · track 6 · Cmaj9 voice 2: the seventh · step 3, until 4

Staff: | B4 whole |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 0 | B-4 | 60 | 0A |  |  |  | 3 |  |

#### Phrase 96 · track 7 · Cmaj9 voice 3: the ninth · step 3, until 4

Staff: | D5 whole |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 0 | D-5 | 60 | 0A |  |  |  | 3 |  |

#### Phrase 97 · track 8 · Cmaj9 voice 4: the fifth · step 3, until 4

Staff: | G5 whole |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 0 | G-5 | 60 | 0A |  |  |  | 3 |  |

### Track 1: kick (instrument 01)

#### Phrase 10 · track 1 · kick, 2-step · step 6

Beat 1 and the “and” of 3. Nothing on beat 3: that gap is the skip.

Staff: | kick 1, 3& |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 0 | C-1 | 70 | 01 |  |  |  | 6 |  |
| A | C-1 | 60 | 01 |  |  |  | 6 |  |

#### Phrase 11 · track 1 · kick, with a ghost · step 6

Staff: | kick 1, 3&, 4a |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 0 | C-1 | 70 | 01 |  |  |  | 6 |  |
| A | C-1 | 60 | 01 |  |  |  | 6 |  |
| F | C-1 | 24 | 01 |  |  |  | 6 | a ghost just before beat 1 |

#### Phrase 12 · track 1 · kick, half-time (B) · step 10

Staff: | kick 1 |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 0 | C-1 | 70 | 01 |  |  |  | 10 |  |

#### Phrase 13 · track 1 · kick, half-time with a ghost (B) · step 10

Staff: | kick 1, 4a |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 0 | C-1 | 70 | 01 |  |  |  | 10 |  |
| F | C-1 | 24 | 01 |  |  |  | 10 |  |

### Track 2: clap and rim (instrument 02)

#### Phrase 20 · track 2 · clap · step 6

Staff: | clap 2, 4 |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 4 | D-1 | 64 | 02 |  |  |  | 6 |  |
| C | D-1 | 64 | 02 |  |  |  | 6 |  |

#### Phrase 21 · track 2 · clap and rim · step 6

Staff: | clap 2, 4 · rim 3a |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 4 | D-1 | 64 | 02 |  |  |  | 6 |  |
| B | D#1 | 2C | 02 |  |  |  | 6 | rim, swung, right after the kick |
| C | D-1 | 64 | 02 |  |  |  | 6 |  |

#### Phrase 22 · track 2 · the build, bar 7 (breakdown) · step 6

Eighth-note claps getting louder.

Staff: | clap 1, 1&, 2, 2&, 3, 3&, 4, 4& |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 0 | D-1 | 14 | 02 |  |  |  | 6 |  |
| 2 | D-1 | 18 | 02 |  |  |  | 6 |  |
| 4 | D-1 | 1C | 02 |  |  |  | 6 |  |
| 6 | D-1 | 20 | 02 |  |  |  | 6 |  |
| 8 | D-1 | 24 | 02 |  |  |  | 6 |  |
| A | D-1 | 28 | 02 |  |  |  | 6 |  |
| C | D-1 | 2C | 02 |  |  |  | 6 |  |
| E | D-1 | 30 | 02 |  |  |  | 6 |  |

#### Phrase 23 · track 2 · the build, bar 8 (breakdown) · step 6

Staff: | clap roll: sixteenths from 1, thirty-seconds from 3, silence on 4& |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 0 | D-1 | 30 | 02 | RET 96 |  |  | 6 | retrigs every 6 ticks (sixteenths), a little louder each time |
| 8 | D-1 | 40 | 02 | RET A3 |  |  | 6 | every 3 ticks (thirty-seconds), louder faster |
| E |  |  |  | KIL 00 |  |  | 6 | an eighth of silence before the drop |

#### Phrase 24 · track 2 · clap, half-time (B) · step 10

Staff: | clap 3 · rim 4& |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 8 | D-1 | 64 | 02 |  |  |  | 10 | beat 3 |
| E | D#1 | 28 | 02 |  |  |  | 10 |  |

### Track 3: hats and shaker (instrument 03)

#### Phrase 30 · track 3 · hats and shaker · step 6

Closed hat on the even rows (off-beat eighths loud), shaker on the odd rows (the swung ones), very quiet. Velocity does the work.

Staff: | hat 1, 1&, 2, 2&, 3, 3&, 4, 4& · shaker 1e, 1a, 2e, 2a, 3e, 3a, 4e, 4a |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 0 | E-1 | 28 | 03 |  |  |  | 6 |  |
| 1 | F#1 | 14 | 03 |  |  |  | 6 |  |
| 2 | E-1 | 48 | 03 |  |  |  | 6 |  |
| 3 | F#1 | 1C | 03 |  |  |  | 6 |  |
| 4 | E-1 | 24 | 03 |  |  |  | 6 |  |
| 5 | F#1 | 14 | 03 |  |  |  | 6 |  |
| 6 | E-1 | 48 | 03 |  |  |  | 6 |  |
| 7 | F#1 | 1C | 03 |  |  |  | 6 |  |
| 8 | E-1 | 28 | 03 |  |  |  | 6 |  |
| 9 | F#1 | 14 | 03 |  |  |  | 6 |  |
| A | E-1 | 48 | 03 |  |  |  | 6 |  |
| B | F#1 | 1C | 03 |  |  |  | 6 |  |
| C | E-1 | 24 | 03 |  |  |  | 6 |  |
| D | F#1 | 14 | 03 |  |  |  | 6 |  |
| E | E-1 | 48 | 03 |  |  |  | 6 |  |
| F | F#1 | 1C | 03 |  |  |  | 6 |  |

#### Phrase 31 · track 3 · hats, open hat at the end · step 6

Staff: | hat 1, 1&, 2, 2&, 3, 3&, 4 · shaker 1e, 1a, 2e, 2a, 3e, 3a, 4e · open hat 4& |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 0 | E-1 | 28 | 03 |  |  |  | 6 |  |
| 1 | F#1 | 14 | 03 |  |  |  | 6 |  |
| 2 | E-1 | 48 | 03 |  |  |  | 6 |  |
| 3 | F#1 | 1C | 03 |  |  |  | 6 |  |
| 4 | E-1 | 24 | 03 |  |  |  | 6 |  |
| 5 | F#1 | 14 | 03 |  |  |  | 6 |  |
| 6 | E-1 | 48 | 03 |  |  |  | 6 |  |
| 7 | F#1 | 1C | 03 |  |  |  | 6 |  |
| 8 | E-1 | 28 | 03 |  |  |  | 6 |  |
| 9 | F#1 | 14 | 03 |  |  |  | 6 |  |
| A | E-1 | 48 | 03 |  |  |  | 6 |  |
| B | F#1 | 1C | 03 |  |  |  | 6 |  |
| C | E-1 | 24 | 03 |  |  |  | 6 |  |
| D | F#1 | 14 | 03 |  |  |  | 6 |  |
| E | F-1 | 40 | 03 |  |  |  | 6 | open hat; rings over row F |

### Track 4: the FM bass (instruments 04 and 0B)

#### Phrase 40 · track 4 · Am9, bar a · step 8

Root with the kick, a swung repeat, an octave pop. Short notes; the rests are part of the line.

Staff: | A1 8th  rest quarter + 16th  A1 8th  rest quarter  A2 8th  rest 16th |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 0 | A-1 | 70 | 04 |  |  |  | 8 |  |
| 7 | A-1 | 4C | 04 |  |  |  | 8 | swung, between the claps |
| D | A-2 | 38 | 04 |  |  |  | 8 | the octave pop |

#### Phrase 41 · track 4 · Am9, bar b, slides to D · step 8

Staff: | A1 8th  rest dotted quarter + 16th  A1 8th  rest dotted 8th  D2 8th |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 0 | A-1 | 64 | 04 |  |  |  | 8 |  |
| 9 | A-1 | 48 | 04 |  |  |  | 8 |  |
| E | D-2 | 54 | 04 | PSL 03 |  |  | 8 | arrives an eighth early, sliding up |

#### Phrase 42 · track 4 · Dm9, bar a · step 8

Staff: | D2 8th  rest quarter + 16th  D2 8th  rest quarter  D3 8th  rest 16th |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 0 | D-2 | 70 | 04 |  |  |  | 8 |  |
| 7 | D-2 | 4C | 04 |  |  |  | 8 |  |
| D | D-3 | 38 | 04 |  |  |  | 8 |  |

#### Phrase 43 · track 4 · Dm9, bar b, slides to A · step 8

Staff: | D2 8th  rest dotted quarter + 16th  D2 8th  rest dotted 8th  A1 8th |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 0 | D-2 | 64 | 04 |  |  |  | 8 |  |
| 9 | D-2 | 48 | 04 |  |  |  | 8 |  |
| E | A-1 | 54 | 04 | PSL 03 |  |  | 8 | slides down a fourth |

#### Phrase 44 · track 4 · Dm9, bar 7, slides to E · step 8

Staff: | D2 8th  rest quarter + 16th  D2 8th  rest quarter + 16th  E2 8th |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 0 | D-2 | 70 | 04 |  |  |  | 8 |  |
| 7 | D-2 | 4C | 04 |  |  |  | 8 |  |
| E | E-2 | 54 | 04 | PSL 03 |  |  | 8 | slides up a step |

#### Phrase 45 · track 4 · Em9, bar 8, slides home · step 8

Staff: | E2 8th  rest dotted quarter + 16th  E2 8th  rest dotted 8th  A1 8th |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 0 | E-2 | 64 | 04 |  |  |  | 8 |  |
| 9 | E-2 | 48 | 04 |  |  |  | 8 |  |
| E | A-1 | 54 | 04 | PSL 03 |  |  | 8 | slides down a fifth, home |

#### Phrase 46 · track 4 · A root (build) · step 10

Staff: | A1 8th  rest dotted half + 8th |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 0 | A-1 | 60 | 04 |  |  |  | 10 |  |

#### Phrase 47 · track 4 · D root (build) · step 10

Staff: | D2 8th  rest dotted half + 8th |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 0 | D-2 | 60 | 04 |  |  |  | 10 |  |

#### Phrase 48 · track 4 · E root (build) · step 10

Staff: | E2 8th  rest dotted half + 8th |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 0 | E-2 | 60 | 04 |  |  |  | 10 |  |

#### Phrase 49 · track 4 · F, held (B) · step 10

Staff: | F2 whole → |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 0 | F-2 | 64 | 0B |  |  |  | 10 | instrument 0B: sustains until the next note |

#### Phrase 4A · track 4 · G, held (B) · step 10

Staff: | G2 whole → |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 0 | G-2 | 64 | 0B | PSL 06 |  |  | 10 | slides up from F |

#### Phrase 4C · track 4 · OFF at the end of B · step 10

Staff: | G2 (held from bar 7) dotted half  rest quarter |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| C | OFF |  |  |  |  |  | 10 |  |

### Track 5: the stabs (instruments 05 and 08)

#### Phrase 50 · track 5 · Am9, bar a · step 5

A-3 plays the Cm9 render three semitones down: C G B E, Am9 without its root.

Staff: | Am9 1a, 2&, 4& |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 3 | A-3 | 60 | 05 |  |  |  | 5 |  |
| 6 | A-3 | 48 | 05 |  |  |  | 5 |  |
| E | A-3 | 54 | 05 |  |  |  | 5 | pushes into the next bar |

#### Phrase 51 · track 5 · Am9, bar b · step 5

Staff: | Am9 2&, 3a |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 6 | A-3 | 50 | 05 |  |  |  | 5 |  |
| B | A-3 | 44 | 05 |  |  |  | 5 |  |

#### Phrase 52 · track 5 · Dm9, bar a · step 5

D-4: the same render two semitones up, F C E A.

Staff: | Dm9 1a, 2&, 4& |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 3 | D-4 | 60 | 05 |  |  |  | 5 |  |
| 6 | D-4 | 48 | 05 |  |  |  | 5 |  |
| E | D-4 | 54 | 05 |  |  |  | 5 |  |

#### Phrase 53 · track 5 · Dm9, bar b · step 5

Staff: | Dm9 2&, 3a |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 6 | D-4 | 50 | 05 |  |  |  | 5 |  |
| B | D-4 | 44 | 05 |  |  |  | 5 |  |

#### Phrase 54 · track 5 · Dm9, bar 7 · step 5

Staff: | Dm9 1a, 2& · Em9 4& |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 3 | D-4 | 60 | 05 |  |  |  | 5 |  |
| 6 | D-4 | 48 | 05 |  |  |  | 5 |  |
| E | E-4 | 54 | 05 |  |  |  | 5 | Em9 arrives an eighth early |

#### Phrase 55 · track 5 · Em9, bar 8 · step 5

Staff: | Em9 2&, 3a |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 6 | E-4 | 50 | 05 |  |  |  | 5 | G D F♯ B: the F♯ is the bright note |
| B | E-4 | 44 | 05 |  |  |  | 5 |  |

#### Phrase 56 · track 5 · Fmaj9, bar a (B) · step 5

Instrument 08, the Cmaj9 render, seven semitones down: A E G C.

Staff: | Fmaj9 1, 3& |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 0 | F-3 | 5C | 08 |  |  |  | 5 | longer: on the downbeat |
| A | F-3 | 44 | 08 |  |  |  | 5 |  |

#### Phrase 57 · track 5 · Fmaj9, bar b (B) · step 5

Staff: | Fmaj9 2& |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 6 | F-3 | 48 | 08 |  |  |  | 5 |  |

#### Phrase 58 · track 5 · Gmaj9, bar a (B) · step 5

Staff: | Gmaj9 1, 3& |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 0 | G-3 | 5C | 08 |  |  |  | 5 |  |
| A | G-3 | 44 | 08 |  |  |  | 5 |  |

#### Phrase 59 · track 5 · Gmaj9, bar b (B) · step 5

Staff: | Gmaj9 2& |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 6 | G-3 | 48 | 08 |  |  |  | 5 |  |

#### Phrase 5A · track 5 · Am9, one stab (breakdown) · step 10

Staff: | Am9 1 |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 0 | A-3 | 50 | 05 |  |  |  | 10 |  |

#### Phrase 5B · track 5 · Dm9, one stab (breakdown) · step 10

Staff: | Dm9 1 |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 0 | D-4 | 50 | 05 |  |  |  | 10 |  |

#### Phrase 5C · track 5 · Em9, one stab (breakdown) · step 10

Staff: | Em9 1 |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 0 | E-4 | 50 | 05 |  |  |  | 10 |  |

#### Phrase 5D · track 5 · Am9, the last stab (outro) · step 10

Staff: | Am9 1 |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 0 | A-3 | 58 | 05 |  |  |  | 10 | let it ring out |

### Track 6: the voice (instruments 06, 09 and 0C)

#### Phrase 60 · track 6 · the hook, bar 1 · step 9

Written as typed. C-4 plays your hummed C at its own pitch; hum it at C5 and the whole hook sounds an octave above what is written here (E5 to A5, the plan's register).

Staff: | E4 dotted 8th  E4 16th  rest 8th  G4 8th  A4 quarter  rest 8th  G4 8th → |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 0 | E-4 | 60 | 06 |  |  |  | 9 |  |
| 3 | E-4 | 48 | 06 |  |  |  | 9 | the stutter |
| 4 | OFF |  |  |  |  |  | 9 | hard cut |
| 6 | G-4 | 58 | 06 |  |  |  | 9 |  |
| 8 | A-4 | 64 | 06 |  |  |  | 9 |  |
| C | OFF |  |  |  |  |  | 9 |  |
| E | G-4 | 50 | 06 |  |  |  | 9 |  |

#### Phrase 61 · track 6 · the hook, bar 2 · step 9

Staff: | E4 dotted quarter  D4 8th  C4 half → |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 0 | E-4 | 60 | 06 |  |  |  | 9 |  |
| 6 | D-4 | 54 | 06 |  |  |  | 9 |  |
| 8 | C-4 | 58 | 06 |  |  |  | 9 | lands on the minor third |

#### Phrase 62 · track 6 · the hook, bar 2 over Em9 · step 9

Staff: | E4 dotted quarter  D4 8th  B3 half → |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 0 | E-4 | 60 | 06 |  |  |  | 9 |  |
| 6 | D-4 | 54 | 06 |  |  |  | 9 |  |
| 8 | B-3 | 58 | 06 |  |  |  | 9 | C would clash with Em9; B is its fifth |

#### Phrase 63 · track 6 · the hook, bar 2 at the peak · step 10

Staff: | E4 dotted quarter  D4 8th  F♯4 half → |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 0 | E-4 | 60 | 06 |  |  |  | 10 |  |
| 6 | D-4 | 54 | 06 |  |  |  | 10 |  |
| 8 | F#4 | 64 | 06 |  |  |  | 10 | joins the stab's F♯ |

#### Phrase 64 · track 6 · the hook, bar 1, dub · step 10

Staff: | E4 dotted 8th  E4 16th  rest 8th  G4 8th  A4 quarter  rest 8th  G4 8th → |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 0 | E-4 | 60 | 06 |  |  |  | 10 |  |
| 3 | E-4 | 48 | 06 |  |  |  | 10 |  |
| 4 | OFF |  |  |  |  |  | 10 |  |
| 6 | G-4 | 58 | 06 |  |  |  | 10 |  |
| 8 | A-4 | 64 | 0C |  |  |  | 10 | instrument 0C: the same sample with a big delay send |
| C | OFF |  |  |  |  |  | 10 |  |
| E | G-4 | 50 | 06 |  |  |  | 10 |  |

#### Phrase 65 · track 6 · the hook, bar 2, dub · step 10

Staff: | E4 dotted quarter  D4 8th  C4 half → |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 0 | E-4 | 60 | 06 |  |  |  | 10 |  |
| 6 | D-4 | 54 | 06 |  |  |  | 10 |  |
| 8 | C-4 | 58 | 0C |  |  |  | 10 | thrown into the delay |

#### Phrase 66 · track 6 · Fmaj9, the opening, then backward (B) · step 9

Staff: | E4 dotted 8th  E4 16th  rest 8th  G4 8th  A4 half → |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 0 | E-4 | 54 | 06 |  |  |  | 9 |  |
| 3 | E-4 | 40 | 06 |  |  |  | 9 |  |
| 4 | OFF |  |  |  |  |  | 9 |  |
| 6 | G-4 | 50 | 06 |  |  |  | 9 |  |
| 8 | A-4 | 48 | 09 |  |  |  | 9 | instrument 09 plays backward: it swells in |

#### Phrase 67 · track 6 · Gmaj9, a backward G (B) · step 9

Staff: | G4 dotted half  A4 8th  rest 8th |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 0 | G-4 | 48 | 09 |  |  |  | 9 | swells through the bar |
| C | A-4 | 40 | 06 |  |  |  | 9 | forward, short |
| E | OFF |  |  |  |  |  | 9 |  |

#### Phrase 68 · track 6 · Gmaj9, G and A (B) · step 9

Staff: | rest dotted quarter  G4 8th  A4 quarter  rest quarter |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 0 | OFF |  |  |  |  |  | 9 |  |
| 6 | G-4 | 44 | 06 |  |  |  | 9 |  |
| 8 | A-4 | 48 | 06 |  |  |  | 9 |  |
| C | OFF |  |  |  |  |  | 9 |  |

#### Phrase 69 · track 6 · Gmaj9, backward E into the breakdown (B) · step 9

Staff: | rest quarter  E4 dotted half → |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 4 | E-4 | 50 | 09 |  |  |  | 9 | swells into the next downbeat |

### Track 7: rain (instrument 07)

#### Phrase 70 · track 7 · rain · step 10

Staff: | C4, one note that loops for as long as the track runs |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 0 | C-4 | 50 | 07 |  |  |  | 10 | FWDLOOP: it keeps going |

### Track 8: the DJ filter (no instrument)

#### Phrase 80 · track 8 · DJ filter, intro, closed · step 10

Staff: | no notes |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 0 |  |  |  | DJC 30 |  |  | 10 |  |

#### Phrase 81 · track 8 · DJ filter · step 10

Staff: | no notes |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 0 |  |  |  | DJC 40 |  |  | 10 |  |

#### Phrase 82 · track 8 · DJ filter · step 10

Staff: | no notes |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 0 |  |  |  | DJC 50 |  |  | 10 |  |

#### Phrase 83 · track 8 · DJ filter · step 10

Staff: | no notes |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 0 |  |  |  | DJC 60 |  |  | 10 |  |
| 8 |  |  |  | DJC 68 |  |  | 10 |  |

#### Phrase 84 · track 8 · DJ filter, intro, opening a beat at a time · step 10

Staff: | no notes |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 0 |  |  |  | DJC 70 |  |  | 10 |  |
| 4 |  |  |  | DJC 78 |  |  | 10 |  |
| 8 |  |  |  | DJC 7C |  |  | 10 |  |
| C |  |  |  | DJC 80 |  |  | 10 | 80 is fully open |

#### Phrase 85 · track 8 · DJ filter, breakdown, closing · step 10

Staff: | no notes |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 0 |  |  |  | DJC 60 |  |  | 10 |  |

#### Phrase 86 · track 8 · DJ filter · step 10

Staff: | no notes |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 0 |  |  |  | DJC 48 |  |  | 10 |  |

#### Phrase 87 · track 8 · DJ filter · step 10

Staff: | no notes |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 0 |  |  |  | DJC 30 |  |  | 10 |  |

#### Phrase 88 · track 8 · DJ filter · step 10

Staff: | no notes |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 0 |  |  |  | DJC 38 |  |  | 10 |  |
| 8 |  |  |  | DJC 48 |  |  | 10 |  |

#### Phrase 89 · track 8 · DJ filter, breakdown, opening into the drop · step 10

Staff: | no notes |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 0 |  |  |  | DJC 58 |  |  | 10 |  |
| 4 |  |  |  | DJC 68 |  |  | 10 |  |
| 8 |  |  |  | DJC 78 |  |  | 10 |  |
| C |  |  |  | DJC 80 |  |  | 10 | 80 is fully open |

#### Phrase 8A · track 8 · DJ filter, outro, closing · step 10

Staff: | no notes |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 0 |  |  |  | DJC 70 |  |  | 10 |  |

#### Phrase 8B · track 8 · DJ filter · step 10

Staff: | no notes |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 0 |  |  |  | DJC 60 |  |  | 10 |  |

#### Phrase 8C · track 8 · DJ filter · step 10

Staff: | no notes |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 0 |  |  |  | DJC 48 |  |  | 10 |  |

#### Phrase 8D · track 8 · DJ filter · step 10

Staff: | no notes |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 0 |  |  |  | DJC 30 |  |  | 10 |  |

#### Phrase 8E · track 8 · DJ filter, outro, nearly shut · step 10

Staff: | no notes |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 0 |  |  |  | DJC 20 |  |  | 10 |  |

#### Phrase 8F · track 8 · empty · step 10

The filter stays where it was put.

Staff: | no notes |

(empty phrase)

### Shared phrases (any track)

#### Phrase FD · track any · OFF · step 9

Shared: an OFF on row 0 stops whatever the track was playing.

Staff: | rest whole (the OFF on row 0 stops the note) |

| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |
|-----|---|---|---|-----|-----|-----|------|------|
| 0 | OFF |  |  |  |  |  | 9 |  |

#### Phrase FE · track any · empty · step 3

Shared: empty.

Staff: | no new note (whatever is sounding carries on) |

(empty phrase)


## 8. Table (instrument 05, the stab; copied into 08)

A table that counts: **TIC 00** advances it one row per stab, so it doesn't run in time at all.
Three rows, then back to the top. The A section plays five stabs every two bars, so the three-row
cycle lines up with the bar only every six bars: over an eight-bar loop, the same stab never gets
the same treatment twice in a row. Like a hand on keys: one firm, one lazy, one reaching. Values are
the settings agent's (`??`); all three differences should be small.

### Table 05 · step 7

| Row | N | V | FX1 | FX2 | FX3 | What it does |
|---|---|---|---|---|---|---|
| 0 | 00 | ?? | CUT ?? | FIN ?? | | the firm hit: full level, the brightest of the three, in tune |
| 1 | 00 | ?? | CUT ?? | FIN ?? | | the lazy hit: a little softer, a little darker, a few cents flat |
| 2 | 00 | ?? | CUT ?? | FIN ?? | | the reach: between the two in level and brightness, a hair sharp |
| 3 | | | HOP 00 | | | back to row 0 |

`CUT` stands for the Sampler's filter-cutoff command; the settings agent should use whatever the
FX help screen names it. 08 STAB MAJ9 is made by cloning 05, so its own table (08) starts as a copy
of this one.

## 9. Harmony check

What was checked, with the generator's help (every pitched note of the bass and voice in every
chain of every song row against the chord of its bar), and by hand for the stab voicings, which
are chord shapes by construction:

- **Every note against its chord.** All bass, stab and voice notes are chord tones of their bar,
  except these, all deliberate:
  - **The bass's early arrivals:** D2 on the last eighth of Am9 (phrase 41) and A1 on the last
    eighth of Em9 (phrase 45) belong to the next chord. The same goes for the Em9 stab on the last
    eighth of bar 7 (phrase 54), which arrives with the bass's slide up to E2.
  - **The voice's elevenths:** D over Am9 (phrase 61, row 6, and 65 in the dub), an eighth-note
    step from E down to C; G over Dm9 (phrase 60, rows 6 and E, when bar 1 plays over Dm9). The plan
    counts the G as fitting ("ninth, eleventh, fifth"); an eleventh over a minor chord is an
    available tension, and here it only lasts an eighth.
  - **The backward E** at the end of B (phrase 69): the sixth of Gmaj9, swelling into the
    breakdown's Am9, where E is the fifth and the forward voice sings it.
- **Accidental clashes.** One, from the plan's fixed hook and voicing: in bars 2 and 6, the voice's
  long C (sounding C5, with a C5 hum) is a half step above the Am9 stab's B4, and the second stab
  of the bar (row B of phrase 51) hits under it. It's short, the ninth-against-third rub that m9
  chords carry anyway. If it bites on the device, take the row-B stab out of phrase 51 (it then
  also goes from rows 00–02, which have no voice). Elsewhere the voice is in unison with a stab
  voice (E5 over Am9, A5 over Dm9, F♯5 over Em9) or a whole step from one (G5 against Dm9's A5;
  E5 inside Em9's D5 and F♯5, the chord's seventh, root and ninth).
- **Top voice.** Stabs E5, E5, A5, A5, E5, E5, A5, B5 in A; C5, D5 in B, rising to the breakdown's
  E5. The voice sits above it at E5–A5 with a C5 hum, touching it in unisons.
- **Bass line.** A1, A1, D2, D2, A1, A1, D2, E2, home to A1: roots only, every chord change
  reached by a slide an eighth early. B: F2, G2, F2, G2 held, one slide up a step. Octave pops stay
  on the root.
- **Voice leading.** The stabs move in strict parallel, by design: every voice up a fourth, down a
  fourth, up a step, down a fifth. That is the deep-house sound, not something to smooth out. The
  stab's lowest voice moves C4, F4, G4 (A section) and A3, B3 (B section), well clear of the bass.
- **Register.** Bass A1–E2 (pops to D3), stabs A3–B5, voice E5–A5 (C5 hum). The FM keys at steps
  3–4 are E♭4–G5 and are never heard in the song itself.

## 10. Changes to the plan, and flags

His call on all of them.

1. **The voice's octave.** The phrases are typed relative to C-4 (the sample's own pitch); the
   register comes from the octave he hums. Hum C5 for the plan's E5–A5 (see Themes).
2. **The B section's snare goes half-time too** (beat 3, phrase 24). The plan marks the kick
   half-time and the snare "on"; a half-time kick under a backbeat on 2 and 4 just sounds thin.
3. **The B stabs arrive at step 5**, with the A stabs: playing the MAJ9 render on F and G is the
   same chord-memory lesson. It also gives step 9's backward fragments chords to sit on.
4. **The B bass needs a sustaining clone** (0B), since the A bass is short notes.
5. **The dub throws use a clone** (0C) with a big delay send, rather than an FX command: in a phrase,
   `DEL` delays the row, and the send command's name isn't on any page yet.
6. **Every track swings**, through groove 00, rather than a GRV per track.
7. **The rain** arrives at step 10 (the plan's steps don't place it), triggered once and carried
   through by an empty chain, so it doesn't restart every eight bars.
8. **The working loop's clap chain** (23) ends with the RET build, so step 6 hears RET in context;
   the finished song uses it only in the breakdown (chain 22).
9. **Em9's stab is E-4** (top B5, a step above "about A5"), so its F♯ is the voice's F♯5.
10. **A2 states the hook three and a half times** (bar 4 is silent), so the voice "only ever says
    half a phrase" at least once a loop.

## 11. Depends on device behavior not yet settled

Each becomes an Unverified box on the pages, with its fallback.

- **One FM instrument on four tracks gives four independent voices** (expected, not checked).
  Fallback: clone 0A three times and give each track its own copy.
- **QUICK RENDER keeps a note's tail past the selection's end.** Chains 90–97 already include an
  empty bar after the chord: select both bars.
- **The Sampler's pitch limit above C-4.** The stabs play up to E-4 (four semitones above their own
  pitch); the voice up to A-4 (nine). Fallback: make both samples mono and 16-bit in the sample
  editor, and downsample if needed.
- **C-4 plays a sample at its own pitch** (the Sampling page's open check). Every stab and voice
  note here assumes it. If another note does, shift all of them by the same amount.
- **Slice notes** count up from C-1 (manual); with slice markers, SLICE's value is `01 FILE`
  (Sampling page, unverified).
- **TIC 00 and the groove:** the plan expects TIC 00 to be safe with swing (the phrase's swung notes
  trigger it). **Whether the HOP row takes a stab of its own:** if the cycle turns out to be four
  stabs long with a plain one in it, move `HOP 00` into row 2's FX3 and leave row 3 empty.
- **RET's span:** written as if a RET keeps retriggering until the next note or a KIL. If it only
  fills its own row, write the clap on every row of phrase 23 with the same RETs.
- **PLAY REV:** where a backward sample starts, and so how long each backward swell lasts. The B
  fragments want swells of about a beat to a bar; the last one (phrase 69) should end close to the
  next downbeat. Fallback: trim LEN or START on 09 until it does.
- **Groove 00 can be edited** like any other groove. Fallback: `GRV 01` on row 0 of every phrase on
  tracks 1–6.
- **A held FWDLOOP sample keeps playing through rows whose chain has no note** (chain 71).
  Fallback: retrigger the rain at the top of every row (chain 70 everywhere), as Low Tide does.
- **Whether a cloned instrument keeps its table** (08 from 05). Fallback: `TBL 05` on the first B
  stab.
- **NTH, PVB, FIN in tables** aren't used here.

## 12. For the settings agent

- **The renders.** 0A is the Glass keys card; it should ring out within the two bars rendered.
  After QUICK RENDER: crop to the hit and its ring, normalize, mono, 16-bit, a short fade at the end.
  Two samples, Cm9 and Cmaj9, each played back so that C-4 sounds C.
- **Lengths the parts assume.** A stabs are short: a hit and a little ring, under a beat. The B
  stabs (08) ring about half a bar. The FM bass's notes last about an eighth; 0B sustains until the
  next note or the OFF, then releases over about a beat. The voice needs a tiny release so hard
  cuts don't click.
- **0C VOICE DUB:** a big delay send; a dotted-eighth delay time suits 124 BPM and the 2-step
  rhythm.
- **Groove 00:** a heavy sixteenth swing, more than Low Tide's 07/05.
- **Table 05:** values for every `??`; TABLE TIC is TIC 00.
- **Velocities** set the balance inside each part; the levels between parts are yours. The rain
  stays below the hats.

## 13. For the builder

- `tools/m8_overpass.py` in the style of `tools/m8_low_tide.py`. Rows here are hex; the JSON keys
  them in decimal. Every phrase heading gives its step; `until` marks the last step something
  belongs to. Song row 00 and 01 change meaning at step 5 (render rows until 4, then the loop).
- FD and FE are shared phrases, as in Low Tide.
- The kit doesn't yet play `RET`, `KIL`, PLAY REV, slices, TIC 00 tables, or a rendered stab (a
  four-voice chord from one Sampler note). A demo can stand in with a four-note chord per stab,
  built from the voicings in section 3.
