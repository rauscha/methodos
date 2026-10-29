# Overpass: the instrument settings

**DRAFT, 2026-10-29.** The third sheet in the relay (plan, parts, instrument settings, pages),
written from `docs/songs/overpass-parts.md` (itself a DRAFT). Andrew has reviewed none of them.
This sheet has every instrument's screen, its mod slots and tables, the groove, the mix, and the
render, slicing and recording steps. The data is also in `tools/songs/instruments.py` in the
shape the song JSON uses; the two must agree.

**Sources, in order of authority:** his device findings (`~/repos/music/rig/m8-notes.md`), his
photos (`docs/sources/`), the manual (v6.5.2) and the changelog (to 6.6.3), the meetup
transcripts, and his patch cards (Glass keys, Field recording loop). A value marked **(card)** is
the card's; anything else is new here and is a starting point, not a tried value. Section 9 lists
what is unverified, each with one thing to report back.

## How to read the numbers

At **124 BPM**: one tick is 20 ms; a sixteenth (one phrase row) is 6 ticks, 0.121 s; a beat is 24
ticks, 0.484 s; a bar is 96 ticks, 1.94 s.

- **AHD** times are hex ticks and follow the tempo: `0C` is an eighth, `18` a beat, `60` a bar.
- **ADSR** times are seconds. This sheet gives the target ("→0.48 s") and you **set it by the help
  line**, which reads seconds. Known points: `60` = 0.200 s, `C2` = 2.869 s, `CB` = 3.663 s.
- **Mod types** show a number on 6.6.3: `00` AHD ENV, `01` ADSR ENV, `03` LFO (his photos). TRIG
  ENV is `04` by the manual's order (AHD, ADSR, DRUM, LFO, TRIG, TRACKING); his photos don't show it.
- **PAN `80` is center.** The sends read DRY, MFX, DEL, REV.
- Screen order is as in his photo of instrument 10: TRANSP., TBL. TIC and EQ under the name, then
  the sound, filter, amp and mixer rows. The FM synth puts its four operator rows (A–D) and its
  MOD1–MOD4 values between ALGO and the filter (manual, FM Synth).

## What changed from his cards

**Glass keys (0A), two changes:**

1. **MOD1 `FF` → `00`.** Operator C's MOD slot is `1 LEV`: MOD1 scales C's level. MOD2's AHD
   (DEC 0C) is meant to sweep MOD1 so the tine fades in an eighth. An M8 mod adds to the value it
   modulates (as the arp's cutoff envelope adds to its CUTOFF), so with MOD1 already at `FF` the
   envelope has nowhere to go and the tine never fades. At `00`, the envelope takes C from full to
   nothing in 12 ticks.
2. **Sends to `00`** (MFX, DEL, REV; DRY stays C0). It is only ever heard rendered, and a dry render
   makes clean stabs; 05 and 08 add their own space. If a quick render leaves the sends out anyway,
   nothing is lost.

**Field recording loop (07 here):** the same recording, now LOWPASS 70 (dull, as the feel wants)
with an EQ low cut, instead of the card's HIGHPASS 30; and an ADSR so the OFF in row 07 fades the
rain out instead of cutting it.

## 1. Before you start

- [ ] **One drum file to slice** from the SD card's factory samples, for 01, 02 and 03: ideally one
      file with a short kick, a dry clap, a rim, a closed hat, an open hat and a shaker. A drum
      break works too: a snare can stand in for the clap.
- [ ] **The rain:** Low Tide's FIELD sample if it was rain or traffic, or a new recording on the
      mic (the Field recording loop card has the steps).
- [ ] **Your voice:** a hummed "ooh" on C, recorded on the M8 at step 9 (section 7). **Headphones**,
      so the reference tone doesn't leak into the mic.
- [ ] **Two renders** made on the M8 at step 4 (section 6): CM9 and CMAJ9.
- [ ] **Free slots:** instruments 01–09, 0A, 0B, 0C (and 0D for the reference tone, cleared after);
      tables 05 and 08; groove 00 (edited, not added). Spare song row 0F for the reference tone.

## 2. Instruments

In the order the steps bring them in.

### 0A GLASS KEYS · FMSYNTH · steps 2–4 (his card, two changes)

The feel: an electric piano, a glassy tine at the front gone within a beat, a round body under it
that rings out over the bar; almost dry; only ever heard rendered.

| Parameter | Value | Why |
|---|---|---|
| TRANSP. | ON | default |
| TBL. TIC | 01 | default; no table |
| EQ | -- | none |
| ALGO | 07 [A>B]+[C>D] | (card) two pairs side by side: B and D are heard; A and C color them |
| MOD1 | 00 | **changed from FF**: the base the tine envelope sweeps up from |
| MOD2 | 00 | (card) unused |
| MOD3 | 00 | (card) unused |
| MOD4 | 00 | (card) unused |
| FILTER | LOWPASS | (card) |
| CUTOFF | FF | (card) open: the tine is the point |
| RES | 00 | (card) |
| AMP | 00 | (card) |
| LIM | CLIP | (card) |
| PAN | 80 | (card) center, so the render loses nothing in MONO |
| DRY | C0 | (card) |
| MFX | 00 | **changed from 10**: a dry render |
| DEL | 00 | **changed from 30** |
| REV | 00 | **changed from 40** |

| Op | Shape | RATIO | LEV | FB | MOD | Why |
|---|---|---|---|---|---|---|
| A | SIN | 1.00 | 30 | 00 | -- -- | (card) bends B gently: the round body |
| B | SIN | 1.00 | C0 | 00 | -- -- | (card) the body you hear |
| C | SIN | 14.00 | 60 | 00 | 1 LEV, -- | (card) fourteen times the note: the cluster of high, bell-like partials; its level follows MOD1 |
| D | SIN | 1.00 | 80 | 00 | -- -- | (card) the tine you hear |

| Slot | Type | DEST | Values | Why |
|---|---|---|---|---|
| MOD1 | 00 AHD ENV | VOLUME | AMT FF, ATK 00, HOLD 00, DEC 60 | (card) the whole chord fades over one bar (1.94 s): "rings out over the bar", inside the two bars rendered |
| MOD2 | 00 AHD ENV | MOD1 | AMT FF, ATK 00, HOLD 00, DEC 0C | (card) C's level from full to nothing in an eighth (0.24 s): the tine "gone within a beat" |
| MOD3–4 | -- | | | |

No table. Played on tracks 5–8 at once, one note each, at velocity 60 (phrases 90–97).

### 05 STAB MIN9, 08 STAB MAJ9 · SAMPLER · step 4 (made), 5 (played), 7 (table)

The feel: four voices in one fixed shape; short, a hit and a little ring cut by the next; round
and a little worn, the tine softened; mid-level, center, the warmest thing in the mix; each hit
nudged by the table. In B (08) fewer, ringing about half a bar.

| Parameter | 05 | 08 | Why |
|---|---|---|---|
| TRANSP. | ON | ON | default; nothing transposes, and the typed note must name the chord |
| TBL. TIC | 00 | 00 | the table moves one row per stab, not in time (manual, Table TIC modes) |
| EQ | 05 | 05 | a shared low cut (section 4), under the FM bass's range |
| SAMPLE | CM9 | CMAJ9 | the renders (section 6), each a rootless chord built on C |
| SLICE | 00 | 00 | |
| PLAY | FWD | FWD | once |
| START | 00 | 00 | the crop puts the hit at the start |
| LOOP ST. | 00 | 00 | |
| LEN | FF | FF | |
| DETUNE | 80 | 80 | in tune: C-4 sounds C (the Sampling page's open check) |
| DEGRADE | 10 | 10 | "a little worn" |
| FILTER | LOWPASS | LOWPASS | softens the tine |
| CUTOFF | B0 | B0 | round, not glassy; the table darkens two hits in three from here |
| RES | 10 | 10 | a trace of body at the cutoff |
| AMP | 00 | 00 | |
| LIM | CLIP | CLIP | |
| PAN | 80 | 80 | center |
| DRY | C0 | C0 | mid-level |
| MFX | 18 | 18 | a little chorus: the width the mono render lacks |
| DEL | 10 | 10 | a trace of the dotted-eighth echo |
| REV | 38 | 50 | the A stabs in the room; the B stabs further in, "out of the tunnel" |

| Inst | Slot | Type | DEST | Values | Why |
|---|---|---|---|---|---|
| 05 | MOD1 | 00 AHD ENV | VOLUME | AMT FF, ATK 00, HOLD 02, DEC 10 | 18 ticks, three-quarters of a beat: "a hit and a little ring, under a beat" |
| 05 | MOD2 | 00 AHD ENV | CUTOFF | AMT 18, ATK 00, HOLD 00, DEC 0C | a small brightening that closes in an eighth: the front of the hit |
| 08 | MOD1 | 00 AHD ENV | VOLUME | AMT FF, ATK 00, HOLD 08, DEC 28 | 48 ticks, half a bar: "ring about half a bar" |
| 08 | MOD2 | 00 AHD ENV | CUTOFF | AMT 18, ATK 00, HOLD 00, DEC 0C | as 05 |

MOD3–4 empty.

**The last stab (phrase 5D) rings out:** `DE1 60` on its row adds 60 (96 ticks) to MOD1's decay for
that note only: 10 + 60 = 70, 112 ticks, a little over a bar. (Added to the parts; see section 8.)

#### Table 05 (and table 08, a copy) · step 7

TBL. TIC 00: one row per stab. A three-stab cycle against five stabs every two bars, so the same
hit gets the same treatment only every six bars. Small differences: a hand on keys.

| Row | N | V | FX1 | FX2 | FX3 | What it does |
|---|---|---|---|---|---|---|
| 0 | 00 | 7F | | | | the firm hit: the instrument as set (CUTOFF B0, in tune), full level |
| 1 | 00 | 64 | CUT 98 | FIN F9 | | the lazy hit: about 80% level, darker, about 5 cents flat |
| 2 | 00 | 72 | CUT A4 | FIN 03 | HOP 00 | the reach: between the two, about 2 cents sharp; then back to row 0 |
| 3 | | | | | | empty |
| 4 | | | | | | |
| 5 | | | | | | |
| 6 | | | | | | |
| 7 | | | | | | |
| 8 | | | | | | |
| 9 | | | | | | |
| A | | | | | | |
| B | | | | | | |
| C | | | | | | |
| D | | | | | | |
| E | | | | | | |
| F | | | | | | |

- **Row 0 has no commands.** Every stab carries instrument 05 (or 08), and a note with an
  instrument number resets the instrument's parameters (manual, Relative and Absolute FX
  Commands). So the firm hit is the instrument itself, and rows 1 and 2 are offsets from it.
- **The HOP is in row 2, not a row of its own** (a change from the parts' draft): three stabs make
  one cycle whatever a HOP row would do on a trigger of its own.
- **`CUT`** stands for the Sampler's cutoff command, which the manual doesn't list. To get the right
  one whatever its name: highlight CUTOFF in instrument 05 and press SHIFT + RIGHT; the table opens
  with that command as the default for new FX (manual, Instrument View). The values are absolute.
  If the help line says the command is relative, type `E8` for `98` and `F4` for `A4`: the same
  results from CUTOFF B0.
- **`FIN`** is relative (changelog), but each stab resets it, so the values are the same either way:
  `F9` is −7/128 of a semitone, `03` is +3/128. If the Sampler's fine-pitch command turns out to be
  named for its DETUNE parameter instead (80 in tune, second digit sixteenths of a semitone), use
  `7F` for the flat hit and `81` for the sharp one: wider, still small.
- **V** multiplies the phrase velocity: `64` is about 80%, `72` about 90%.

### 01 KICK, 02 CLAP, 03 HATS · SAMPLER · step 6

The feel: kick short and thumpy, tight, centered, its ghost a soft nudge; clap dry with a short
room, the rim a quiet click; hats crisp but quiet, velocity doing the work. All three play the same
sliced file (section 5), each instrument its own slices.

| Parameter | 01 KICK | 02 CLAP | 03 HATS | Why |
|---|---|---|---|---|
| TRANSP. | OFF | OFF | OFF | a transpose would play the wrong slices (manual: off for percussion) |
| TBL. TIC | 01 | 01 | 01 | default; no tables |
| EQ | -- | -- | -- | none |
| SAMPLE | OVERKIT | OVERKIT | OVERKIT | the sliced file, saved under its own name (section 5) |
| SLICE | 01 FILE | 01 FILE | 01 FILE | plays the markers saved in the file, the first on C-1 (manual) |
| PLAY | FWD | FWD | FWD | |
| START | 00 | 00 | 00 | |
| LOOP ST. | 00 | 00 | 00 | |
| LEN | FF | FF | FF | the envelopes keep each hit short |
| DETUNE | 80 | 80 | 80 | |
| DEGRADE | 00 | 00 | 00 | crisp: the worn sound belongs to the stabs and voice |
| FILTER | LOWPASS | HIGHPASS | HIGHPASS | the kick keeps its low end; the clap and hats lose theirs |
| CUTOFF | FF | 20 | 50 | kick open; the clap's thump trimmed; the hats thin and crisp |
| RES | 00 | 00 | 00 | |
| AMP | 10 | 00 | 00 | a little more push on the kick: "thumpy" |
| LIM | CLIP | CLIP | CLIP | |
| PAN | 80 | 80 | 90 | the hats a little right, off the kick and clap |
| DRY | E0 | C8 | A0 | the kick in front; the hats well back |
| MFX | 00 | 00 | 00 | |
| DEL | 00 | 00 | 00 | |
| REV | 00 | 30 | 10 | the clap's "short room"; the kick dry |

| Inst | Slot | Type | DEST | Values | Why |
|---|---|---|---|---|---|
| 01 | MOD1 | 00 AHD ENV | VOLUME | AMT FF, ATK 00, HOLD 03, DEC 06 | 9 ticks (0.18 s): tight, and no next slice bleeding in |
| 02 | MOD1 | 00 AHD ENV | VOLUME | AMT FF, ATK 00, HOLD 04, DEC 0C | 16 ticks: the clap and a short tail; the RET roll retriggers it |
| 03 | MOD1 | 00 AHD ENV | VOLUME | AMT FF, ATK 00, HOLD 00, DEC 0C | an eighth: long enough for the open hat to ring over row F; the next hat or shaker cuts the closed ones |

MOD2–4 empty. Groove: every track swings through groove 00 (section 3).

### 04 FM SUB · FMSYNTH · step 8

The feel: deep and round, a soft knock at the front from a fast envelope on the modulator, no
buzz; short notes, about an eighth, with rests; slides into the next root; mono, dead center.

| Parameter | Value | Why |
|---|---|---|
| TRANSP. | ON | default |
| TBL. TIC | 01 | default; no table |
| EQ | -- | none |
| ALGO | 07 [A>B]+[C>D] | the Glass keys routing again, so step 8 reads like step 2: one FM pair and one plain sine |
| MOD1 | 00 | the base the knock envelope sweeps up from |
| MOD2–MOD4 | 00 | unused |
| FILTER | LOWPASS | |
| CUTOFF | 70 | takes the FM's upper partials off: "no buzz" |
| RES | 00 | |
| AMP | 00 | |
| LIM | CLIP | |
| PAN | 80 | dead center |
| DRY | D0 | the floor |
| MFX | 00 | mono: no chorus on the bass |
| DEL | 00 | |
| REV | 00 | dry |

| Op | Shape | RATIO | LEV | FB | MOD | Why |
|---|---|---|---|---|---|---|
| A | SIN | 1.00 | 60 | 00 | 1 LEV, -- | the modulator: a low ratio, so the bend stays harmonic and rubbery; its level follows MOD1 |
| B | SIN | 1.00 | C0 | 00 | -- -- | the rubbery body you hear |
| C | SIN | 1.00 | 00 | 00 | -- -- | off, so D is a plain sine |
| D | SIN | 1.00 | 90 | 00 | -- -- | the clean, deep fundamental under it |

| Slot | Type | DEST | Values | Why |
|---|---|---|---|---|
| MOD1 | 00 AHD ENV | VOLUME | AMT FF, ATK 01, HOLD 05, DEC 06 | 12 ticks, an eighth (0.24 s); one tick of attack keeps the sine from clicking |
| MOD2 | 00 AHD ENV | MOD1 | AMT FF, ATK 00, HOLD 00, DEC 04 | A's level from full to nothing in 4 ticks (80 ms): the knock |
| MOD3 | 04 TRIG ENV | VOLUME | AMT negative, about 40%; ATK 00, HOLD 01, DEC 06; SRC 80 | step 10: ducks under the kick (SRC 80 is track 1, manual), so the two don't pile up on beat 1 |
| MOD4 | -- | | | |

No table. The slides are `PSL 03` in the phrases.

### 06 VOICE, 09 VOICE REV · SAMPLER · step 9

The feel: breathy and close, a little lo-fi; chopped, each note starting at the front of the hum and
cut hard by the next note or an OFF; above the stabs. The backward copy swells in and cuts off.

| Parameter | 06 | 09 | Why |
|---|---|---|---|
| TRANSP. | ON | ON | default |
| TBL. TIC | 01 | 01 | default; no table |
| EQ | 06 | 06 | a shared low cut (section 4): mic rumble and breath pops out |
| SAMPLE | VOICE C | VOICE C | your hum (section 7); both play the same file |
| SLICE | 00 | 00 | |
| PLAY | FWD | REV | 06 forward, every note from the front; 09 backward, every note a swell |
| START | 00 | 00 | the crop puts the hum's onset at the start |
| LOOP ST. | 00 | 00 | not looping: a long note ends with the hum |
| LEN | FF | FF | for 09, shorten LEN if a backward swell runs past its downbeat |
| DETUNE | 80 | 80 | then tune by ear against the reference (section 7) |
| DEGRADE | 10 | 10 | "a little lo-fi" |
| FILTER | LOWPASS | LOWPASS | |
| CUTOFF | C0 | C0 | takes the hiss off, keeps the breath |
| RES | 00 | 00 | |
| AMP | 00 | 00 | |
| LIM | CLIP | CLIP | |
| PAN | 80 | 80 | center |
| DRY | C0 | B0 | the backward copy a little behind |
| MFX | 10 | 10 | |
| DEL | 18 | 18 | a little echo in the gaps |
| REV | 40 | 60 | 09 wetter: the fragments are further away |

| Inst | Slot | Type | DEST | Values | Why |
|---|---|---|---|---|---|
| 06, 09 | MOD1 | 01 ADSR ENV | VOLUME | AMT FF, ATK →0.005 s, DEC 00, SUS FF, REL →0.03 s | "a tiny release so hard cuts don't click": a 5 ms fade in and a 30 ms fade out on OFF. ADSR small values start around 2 ms (4.0 meetup) |

MOD2–4 empty. Set the ADSR by the help line: ATK about 0.005 seconds, REL about 0.030.

### 0B SUB HOLD · FMSYNTH · step 10

04 copied, with one change: the volume envelope sustains. For the B section's held F and G, two
bars each, which slide up a step and end with the OFF in phrase 4C.

Every parameter and operator as 04. Mods:

| Slot | Type | DEST | Values | Why |
|---|---|---|---|---|
| MOD1 | 01 ADSR ENV | VOLUME | AMT FF, ATK →0.01 s, DEC 00, SUS FF, REL →0.48 s | holds until the next note or the OFF; releases over a beat (0.48 s at 124 BPM) |
| MOD2 | 00 AHD ENV | MOD1 | AMT FF, ATK 00, HOLD 00, DEC 04 | the knock, as 04 |
| MOD3 | 04 TRIG ENV | VOLUME | as 04 | the half-time kick still ducks it |
| MOD4 | -- | | | |

To make it: on 04, SHIFT + OPTION copies; OPTION + RIGHT to 0B; SHIFT + EDIT pastes. Then change
MOD1's type to `01 ADSR ENV` (in the mod view, SHIFT + UP from the instrument) and set its times.

### 0C VOICE DUB · SAMPLER · step 10

06 copied, with a big delay send: the dub throws (phrases 64 and 65). Every parameter as 06
except **DEL C0** (from 18) and **REV 30** (from 40), so the throws repeat in the delay rather than
wash out in the reverb. Mods as 06.

### 07 RAIN · SAMPLER · step 10

The feel: rain, traffic, wet pavement; low, dull, wide and far back; never louder than the hats.
Triggered once in row 00, carried through by empty chains, stopped by the OFF in chain 72, started
again in the outro.

| Parameter | Value | Why |
|---|---|---|
| TRANSP. | OFF | it's a texture; nothing should move it |
| TBL. TIC | 01 | default; no table |
| EQ | 07 | a low cut (section 4), so it never touches the bass |
| SAMPLE | FIELD, or a new rain recording | (card) Low Tide's field loop |
| SLICE | 00 | |
| PLAY | FWDLOOP | (card) loops for as long as the note holds |
| START | 00 | |
| LOOP ST. | 00 | |
| LEN | FF | |
| DETUNE | 80 | |
| DEGRADE | 00 | |
| FILTER | LOWPASS | dull (the card used HIGHPASS 30; the EQ takes over that job) |
| CUTOFF | 70 | the hiss and sparkle gone: wet, not crisp |
| RES | 00 | |
| AMP | 00 | |
| LIM | CLIP | |
| PAN | 80 | |
| DRY | 58 | quieter than the hats' A0: "never louder than the hats" |
| MFX | 00 | |
| DEL | 00 | |
| REV | 50 | far back |

| Slot | Type | DEST | Values | Why |
|---|---|---|---|---|
| MOD1 | 01 ADSR ENV | VOLUME | AMT FF, ATK →0.5 s, DEC 00, SUS FF, REL →1.0 s | fades in when it starts (rows 00 and 08), holds through the empty chains, and fades out over a second at the OFF before the dub instead of cutting |
| MOD2–4 | -- | | | |

## 3. Groove

**Groove 00: `08` `04`**, 24 PPQN. No phrase carries a GRV; every track plays groove 00, the
default (manual: "Groove 00 is the default groove for all 8 tracks").

- Why: "a heavy sixteenth swing, heavier than Low Tide's 07/05". 08/04 is the manual's second
  swing example, about 67%: every odd row (the shaker, the kick's ghost, the rim, the stab on "1a",
  the voice's stutter, the bass's row-7 repeat) lands two-thirds of the way through its eighth, the
  2-step lilt.
- To enter it: from any phrase, SHIFT + UP opens the groove view, on groove 00; on row 0, EDIT +
  UP / DOWN changes rows 0 and 1 together (manual) until they read 08 and 04. Rows 2–F stay `--`.
  Since 6.5 the groove view also shows the swing as a percentage (#32 meetup).
- Groove 00 can be edited: the manual's own swing instructions and examples all edit GROOVE 00.
  (The project view can name a different default groove; leave it on 00.)
- Tables ignore the groove, and table 05 is TIC 00 anyway: each swung stab triggers its row.
- Lighter, if 08/04 sounds like a shuffle rather than garage: 48 PPQN and `0F` `09` (about 62%).

## 4. Mixer and effects (step 10, and the EQs as they arrive)

From the Mixer view, SHIFT + DOWN opens the effect settings. Values are starting points by ear;
the manual names the parameters but gives no scales.

**Reverb**

| Parameter | Value | Why |
|---|---|---|
| SIZE | A0 | a street under an overpass: big, but not a hall |
| DECAY | 90 | medium: the beat must stay clear |
| SHIMMER | 00 | none; this song's lift is the stabs, not the tail |
| MOD DEPTH | 30 | a slight drift |
| MOD FREQ | 30 | |
| WIDTH | FF | the rain and the fragments wide |
| INPUT EQ | LOW: LOWCUT, about 250 Hz | the kick and bass never reach the tail |

**Delay**

| Parameter | Value | Why |
|---|---|---|
| TIME L:R | 0C, 0C | a dotted eighth: "suits 124 BPM and the 2-step rhythm"; each throw lands off the beat |
| FEEDBACK | 80 | long enough for 0C's throws to repeat through a bar or more; the stabs' small send (10) keeps their echoes faint |
| WIDTH | FF | ping-pong |
| REVERB SEND | 30 | the echoes go into the street |
| INPUT EQ | LOW: LOWCUT, about 300 Hz; HIGH: HI.CUT, about 4 kHz | darker, thinner repeats: the dub sound |

**Unverified (from Low Tide step 7):** `0C` as a dotted eighth. Report back what the help line says.

**ModFX**

| Parameter | Value | Why |
|---|---|---|
| Type | CHORUS | (chorus, phaser or flanger; comb since 6.6) |
| MOD DEPTH | 30 | |
| MOD FREQ | 20 | |
| WIDTH | C0 | the width the mono stabs get |
| REVERB SEND | 10 | |

**Instrument EQs.** In each instrument set EQ to the slot, then EDIT on it (or SHIFT + RIGHT) opens
the EQ editor. Watch the help line for Hz (Low Tide's open question: Hz or hex on screen).

| Slot | Used by | Band | TYPE | FREQ | MODE | Why |
|---|---|---|---|---|---|---|
| 05 | stabs 05, 08 | LOW | LOWCUT | about 150 Hz | STEREO | the stabs' lowest note is A3 (220 Hz); below that is the bass's |
| 06 | voice 06, 09, 0C | LOW | LOWCUT | about 200 Hz | STEREO | mic rumble and pops out; the hum's C5 is 523 Hz |
| 07 | rain 07 | LOW | LOWCUT | about 200 Hz | STEREO | traffic rumble out from under the bass |

**Main mix EQ** (Mixer view, EDIT on EQ): LOW band, TYPE LOWCUT, **MODE SIDE**, about 150 Hz. The
plan's "mono low end under the stabs": the low end of everything, kick, bass and the reverb's low
tail, goes mono; above it the chorus and reverb stay wide. The meetup's version of this trick
(#32) is on one instrument at about 500 Hz; on the whole mix it wants to be much lower.

**Mixer view:** leave the track volumes and the MX, DE and RE returns where the project has them,
and balance with each instrument's DRY. OTT `00`. LIM about `30`, raised until the limiter's line
on the MIX meter moves only on the drops into rows 02 and 06. **DJF starts at `80`** (off); track
8's DJC commands move it. Playback started from a middle row keeps whatever DJC last set (the
outro leaves it at `20`, nearly shut): if the song sounds muffled, set DJF back to 80.

## 5. Slicing the drums (step 6)

1. **Load the file.** Instrument 01: TYPE `SAMPLER`. EDIT on LOAD, to the right of SAMPLE, opens
   the file browser; PLAY previews, EDIT loads.
2. **Open the sample editor:** EDIT on EDIT.
3. **Mark the hits.** Either PROCESS `SLICE:AUTO` (finds the transients), or chop by ear: put the
   cursor on SLICE MARKER, press PLAY, and tap EDIT on each hit ("lazy chop", 5.0+).
4. **Save it as your own file.** NAME: `OVERKIT`. SAVE. (A new name keeps the factory file as it
   was; markers are stored in the WAV.) OPTION leaves.
5. **Play the markers:** SLICE `01 FILE` (manual). The first slice plays on C-1, the next on C#1.
6. **Find the six sounds.** Play C-1 upward and write down which note is the kick, clap, rim,
   closed hat, open hat and shaker. If they aren't in the parts' slice map order (C-1, D-1, D#1,
   E-1, F-1, F#1), change only the N column in phrases 10–13, 20–24 and 30–31.
7. **Set 01** as in section 2. Then copy it: SHIFT + OPTION, OPTION + RIGHT to 02, SHIFT + EDIT;
   again for 03. Change each copy's FILTER, CUTOFF, PAN, DRY, REV and envelope.

## 6. Rendering the chords (steps 3 and 4)

**Step 3, the setup.** 0A on four tracks: phrases 90–93 (Cm9: E♭4, B♭4, D5, G5) on tracks 5–8 of
row 00, and 94–97 (Cmaj9: E4, B4, D5, G5) on row 01, each chain the chord and an empty bar for the
tail. Play row 00: you should hear one chord, four voices. (Unverified: one FM instrument on four
tracks gives four independent voices. Fallback: copy 0A to three more slots, one per track.)

**Step 4, the render.** For each of rows 00 and 01:

1. **Select the four cells.** Song view, cursor on track 5 of row 00. SHIFT + OPTION starts a
   selection; RIGHT three times to cover tracks 5–8.
2. **Render.** Double-tap EDIT; choose **QUICK RENDER**. The two bars of each chain (the chord and
   its tail) are rendered.
3. A new Sampler instrument holding the render appears and becomes the default for new notes. In
   it, EDIT on EDIT opens the sample editor.
4. **Crop to the chord.** On SELECT, start at the beginning; move the end with OPTION + UP / DOWN
   (beats at the song's tempo) to **4 beats**: by then 0A's one-bar fade has finished. PROCESS
   `CROP`.
5. **NORMALIZE** (select the whole sample first). Quick renders are already 16-bit (changelog:
   "32-bit normalization process before finalizing to 16-bit").
6. **MONO: MIX.** The four voices are all center-panned and dry, so nothing is lost, and a mono file
   halves what the pitch limit has to stream (the stabs play up to E-4, four semitones above C-4).
7. **A short fade at the end:** SELECT the last beat, PROCESS the fade-out (FADE IN/OUT).
8. NAME `CM9` (row 01: `CMAJ9`). SAVE. OPTION leaves.

**Into 05 and 08.**

9. On the CM9 instrument, SHIFT + OPTION copies it; OPTION + LEFT / RIGHT to 05; SHIFT + EDIT.
   Set 05 as in section 2.
10. On 05, SHIFT + OPTION; go to 08; SHIFT + EDIT. On 08's SAMPLE, EDIT + LEFT / RIGHT on the name
    steps through the folder to `CMAJ9` (Sampling page). Set 08's envelope (HOLD 08, DEC 28) and
    REV 50.
11. Clear the two slots the renders landed in (Instrument Pool view, EDIT + OPTION on each name),
    and clear tracks 5–8 of rows 00 and 01 (EDIT + OPTION on each cell). Those tracks and rows now
    take the song's parts.

**Step 7, the table.** In instrument 05 set TBL. TIC `00`. Highlight CUTOFF and press SHIFT +
RIGHT: table 05 opens with the cutoff command ready. Type rows 0–2 (FIN is in the FX help: EDIT +
UP / DOWN on an FX cell). Then copy it to 08:

1. Cursor on row 0's N. SHIFT + OPTION enters selection mode; move to row 2's FX3.
2. OPTION copies and leaves selection mode.
3. OPTION + RIGHT three times: table 08. Cursor on row 0's N; SHIFT + EDIT pastes.
4. In instrument 08, TBL. TIC `00`.

08 was copied from 05 at step 4, before the table existed, which is why table 05 is copied by hand.

**Unverified, with what to report back:**

- **C-4 plays a sample at its own pitch.** Report back: does A-3 on 05 sound Am9 (C, G, B, E) in
  tune against the bass's A?
- **Whether a quick render includes a note's tail past the selection** doesn't arise: each chain
  holds an empty bar after the chord.

## 7. Recording the voice (step 9)

**Set up a reference tone** so you hum on C:

1. A spare instrument, **0D**: TYPE `WAVSYNTH`, SHAPE `SINE`, no mods (it holds for as long as the
   note does), DRY 80.
2. A spare phrase, **0D**: `C-5` on row 0, instrument 0D. A spare chain **0D**: phrase 0D. Song row
   **0F**, track 1: chain 0D.
3. Headphones on (the speaker would leak into the mic).

**Record:**

4. Instrument 06: TYPE `SAMPLER`. EDIT on REC. opens the sample editor ready to record.
5. SRC `MIC`. VOL: hum, and raise it until the loudest part sits high without clipping.
6. PLAY: set it to row `0F`, then EDIT on PLAY so the song plays the reference tone. (Unverified:
   how PLAY starts the song while recording. Fallback: in the song view, play row 0F, listen, stop,
   then record and hum from memory; DETUNE fixes the rest.)
7. Start recording with the **power button** (no key click). Hum one "ooh" on the reference C, in
   head voice, breathy, for 3 or 4 seconds, and **let it end softly**: the soft end is where the
   backward copy will swell from. Stop.
8. If C5 is out of reach, hum C4 (and set the reference to C-4): the same phrases sound an octave
   lower, inside the stabs (the parts' octave note).

**Edit:**

9. **SELECT** from the very start of the hum (zoom in with EDIT + LEFT / RIGHT) to about **1.8
   seconds** later, including the soft end. PROCESS `CROP`. Why 1.8 s: the last backward swell
   (phrase 69, E-4, from beat 2) has three beats to reach the next downbeat, 1.45 s at 124 BPM,
   and E-4 plays the sample about a quarter faster than C-4.
10. **MONO: MIX** (if the recording is stereo) and **NORMALIZE**. The voice plays up to A-4, nine
    semitones above C-4, so mono and 16-bit matter here. Recordings are already 16-bit (changelog).
11. A short fade at the very end (the last tenth of a second): FADE IN/OUT.
12. NAME `VOICE C`. SAVE. OPTION leaves.

**Tune and copy:**

13. With row 0F playing the reference, play C-4 on 06 (EDIT + PLAY previews the instrument). Move
    DETUNE (80 = in tune; the second digit moves sixteenths of a semitone) until the two sound as
    one.
14. Copy 06 to **09**: PLAY REV, DRY B0, REV 60. Copy 06 to **0C** at step 10: DEL C0, REV 30.
15. Clear row 0F, chain 0D, phrase 0D and instrument 0D.

**Fallback if he'd rather not hum** (the plan's open question 3): instrument 0D as a Macrosynth,
SHAPE `17 VOWEL FOF` (Braids' order in hex, unverified as for the flute), TIMBRE about `C0` toward
"oo" (TIMBRE morphs a, e, i, o, u, manual), COLOR `40`, an ADSR on VOLUME (ATK →0.05 s, REL →0.3 s).
Hold `C-5` for two bars in a spare row, QUICK RENDER it, and edit and copy it exactly as from
step 9. Every phrase stays the same.

**Unverified, with what to report back:**

- **Where PLAY REV starts** (09). Written as "from the end, backward". The B fragments want swells
  of a beat to a bar; the last (phrase 69) should end at the next downbeat. Report back: does the
  backward E land on the breakdown's first beat? If it runs long, lower 09's LEN; if 09 plays
  nothing, use a reversed file instead (09's sample editor: SELECT all, PROCESS REVERSE, NAME
  `VOICE REV`, SAVE as a new file, PLAY FWD).
- **The pitch limit** for A-4 on a mono 16-bit sample. Report back: does A-4 play? If not,
  DOWNSAMPLE.
- **How a recording stops** (EDIT again, or the power button): the field loop card's open question.

## 8. Changes made to the parts

Made in the model (`tools/songs/op.py`, `op_tpl.md`) and the sheet regenerated; recorded in the
parts' section 10, item 11.

1. **`DE1 60` on phrase 5D**, the outro's last Am9 stab. The parts want it to "ring out", but 05's
   envelope is a three-quarter-beat stab. DE1 offsets the envelope's decay for this one note (manual,
   Instrument FX Commands: "DE[1-2] Envelope Decay"). **Unverified:** that "1" is mod slot 1.
   Fallback: a copy of 05 with DEC 60, used for that one note.
2. **The table's HOP moved into row 2's FX3**, so the cycle is three stabs whatever a HOP row does.
3. **Table values filled in** (`??` gone), with the CUT and FIN notes above.

## 9. Unverified, all in one place

Each becomes an Unverified box on the pages. One ask each.

| What | Written as | Fallback | Report back |
|---|---|---|---|
| How an FM mod reaches an operator | MOD2 DEST `MOD1`, operator C's MOD slot `1 LEV` (card) | | What DEST choices does a mod slot show on an FM instrument? |
| MOD1 `00` as the base | the tine and the knock fade to nothing | if the tine is silent, raise MOD1 a little | Does the tine fade in an eighth? |
| Four voices from one FM instrument on four tracks | one 0A | copies of 0A, one per track | Does row 00 sound four notes? |
| C-4 = a sample's own pitch | every stab and voice note | shift all notes by the same amount | Does A-3 on 05 sound Am9 in tune with the bass? |
| The cutoff command's name, and absolute or relative | `CUT 98`, `CUT A4`, absolute | `E8`, `F4` if relative | What does SHIFT + RIGHT from CUTOFF put in the table? |
| The Sampler's fine-pitch command | `FIN F9`, `FIN 03` | the DETUNE command: `7F`, `81` | What does the FX help list for a Sampler? |
| A HOP sharing row 2 | `HOP 00` in FX3 | a row 3 of its own | Do three different stabs come round in turn? |
| `DE1` = mod slot 1 | `DE1 60` on 5D | a long-decay copy of 05 | Does the last stab ring for about a bar? |
| Where PLAY REV starts; LEN on a reversed sample | from the end | a reversed file | Does phrase 69's backward E end on the downbeat? |
| PLAY in the sample editor while recording | plays row 0F | listen first, hum, tune with DETUNE | How does PLAY start the song? |
| A held FWDLOOP note through empty chains (71) | rain starts once in row 00 | chain 70 in every row, as Low Tide | Does the rain carry through rows 01–06? |
| RET keeps retriggering to the next note or KIL | phrase 23 | the clap on every row with its RET | Does the build roll through bar 8? |
| Delay TIME `0C` = a dotted eighth | `0C 0C` | by ear | What does the help line say for `0C`? |
| TRIG ENV's negative amount on screen | "about 40%, negative" | by ear | How does a negative AMT read? |
| The model numbers `17 VOWEL FOF` (fallback only) | Braids' order in hex | by name | What does SHAPE read at 17? |
| ADSR targets | 0.005, 0.01, 0.03, 0.48, 0.5, 1.0 s by the help line | | Which hex values give 0.010 and 0.480 s? |

## 10. Consistency pass

Checked with `python3 tools/songs/instruments.py check`, which walks every phrase in the model,
and by hand.

- **Every instrument the phrases use has settings,** and every instrument here is used: 01, 02, 03,
  04, 05, 06, 07, 08, 09, 0A, 0B, 0C. (0D is only the temporary reference tone.)
- **Every FX command is valid where it sits:**

| Command | Where | On | Note |
|---|---|---|---|
| RET | phrase 23 | 02 | `96`, `A3`: X above 7 raises the volume each retrig; Y the ticks (manual) |
| KIL | phrase 23 row E | 02 | `00`: stops the clap at once: the eighth of silence |
| PSL | bass phrases 41–45, 4A | 04, 0B | ticks; any instrument |
| OFF | voice, bass 4C, FD | any | starts the ADSR release on 06, 09, 0B, 07 |
| DE1 | phrase 5D | 05 | an envelope offset; common to all instrument types (manual) |
| DJC | track 8 | no instrument | a mixer command |
| CUT, FIN, HOP | tables 05, 08 | 05, 08 | see the table notes |

- **Lengths against the parts:**

| Part | The parts assume | The settings give |
|---|---|---|
| Glass keys 0A | rings out within the two bars rendered | fades over one bar |
| A stabs 05 | a hit and a little ring, under a beat | three-quarters of a beat |
| B stabs 08 | ring about half a bar | half a bar |
| The last stab 5D | rings out | a little over a bar (`DE1 60`) |
| FM bass 04 | about an eighth | an eighth |
| SUB HOLD 0B | sustains to the next note or OFF, releases over a beat | ADSR SUS FF, REL 0.48 s |
| Voice 06, 09, 0C | a tiny release so hard cuts don't click | 30 ms |
| Open hat (phrase 31 row E) | rings over row F | an eighth |
| Rain 07 | carried through empty chains, stopped by an OFF | FWDLOOP, ADSR with a one-second release |

- **Against `m8-notes.md`:** ADSR in seconds, AHD in ticks; mod types with their numbers; PAN 80
  center; the sends DRY/MFX/DEL/REV; the trig-envelope duck with SRC above 7F for a track. No
  contradiction found.

## 11. For the builder

- The data is `tools/songs/instruments.py`, `SONGS["overpass"]`: `instruments`, `tables`,
  `grooves`, `mix`. Table rows keyed in decimal.
- **`TBL. TIC`** is the screen's label; the kit reads `TABLE TIC`. Alias it, or rename on the way in.
- **FM instruments carry `ops`**, a list of operator rows (`op`, `shape`, `ratio`, `lev`, `fb`,
  `mod`), which the Glass keys card shows as an HTML table and its JSON leaves out. The pages
  should draw them as the operator rows.
- Mod `type` strings are Low Tide's (`AHD ENV`, `ADSR ENV`, `TRIG ENV`); the pages show the
  numbers. The duck's AMT is `"neg."` with `amt: -0.4`, as Low Tide's.
- 0A's `until` is 4; 05 and 08 appear at step 4 (made) and are played from step 5; their mods carry
  step 5 and their tables step 7.
- `demo: false` on every Sampler. A demo stab can be a four-note chord from the voicings in the
  parts' section 3.
- `mix` is new: the reverb, delay, ModFX and mixer as `[parameter, value]` lists, and the EQ slots.
- The kit doesn't play: FM, slices, TIC 00, RET, KIL, DE1, PLAY REV, DEGRADE.
