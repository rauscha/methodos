# Faded Polaroid: the instrument settings

**DRAFT, 2026-10-29.** The third sheet in the relay (plan, parts, instrument settings, pages),
written from `docs/songs/faded-polaroid-parts.md` (itself a DRAFT). Andrew has reviewed none of
them. This sheet has every instrument's screen, its mod slots and tables, the groove, the mix and
the render steps. The data is also in `tools/songs/instruments.py` in the shape the song JSON
uses; the two must agree.

**Sources, in order of authority:** his device findings (`~/repos/music/rig/m8-notes.md`), his
photo of instrument 10 and the Faded Polaroid chat (`docs/sources/`), the manual (v6.5.2) and the
changelog (to 6.6.3), the meetup transcripts, and his patch cards (Polaroid arp, Velvet bass,
Polaroid chords). A value marked **(card)** is his card's; **(photo)** is from his photo of
instrument 10; anything else is new here and is a starting point, not a tried value. Section 8
lists what is unverified, each with one thing to report back.

## How to read the numbers

At **90 BPM**: one tick is 28 ms; a sixteenth (one phrase row) is 6 ticks, 0.167 s; a beat is 24
ticks, 0.667 s; a bar is 96 ticks, 2.67 s.

- **AHD** times are hex ticks and follow the tempo: `18` is 24 ticks, a beat; `60` is 96, a bar.
- **ADSR** times are seconds and don't follow the tempo. This sheet gives the target ("→0.25 s")
  and you **set it by the help line** at the bottom of the screen, which reads the value in
  seconds. Known points from his screen: `60` = 0.200 s, `C2` = 2.869 s, `CB` = 3.663 s.
- **LFO FREQ** is a period in steps, so higher is slower: `10` is one phrase, `80` eight.
- **Mod types** show a number on 6.6.3: `00` AHD ENV, `01` ADSR ENV, `03` LFO (his photos).
- **PAN `80` is center.** The sends read DRY, MFX, DEL, REV.
- Screen order is top to bottom, left column then right, as in his photo of instrument 10:
  TRANSP., TBL. TIC and EQ under the name, then the sound, filter, amp and mixer rows. His photo
  shows some values with a number in front (`01 LOWPASS`, `00 CLIP`, `28 WAV PARAPHONIC`); this
  sheet writes the number only where his photos or the patch cards show it.

## What changed from his cards

Nothing on his three cards changes: Polaroid arp (01), Velvet bass (02) and Polaroid chords (10)
are used exactly as on the cards and in his photo. Two things are only filled in:

- **The header rows** (TRANSP. ON, TBL. TIC 01, EQ --) are the defaults his photo shows; the cards
  didn't list them.
- **The arp's SCAN row** keeps its name: the card asked whether the row after WARP reads SCAN or
  MIRROR, and the changelog settles it ("Wavsynth MIRROR parameter renamed SCAN").

The bass plays lower notes in the song than on the card (G1, A1, E1), and the card's envelope
still gives the three-beat notes the parts want.

## 1. Before you start

- [ ] **Three drum samples** from the SD card's factory samples, for instruments 05, 06 and 07: a
      soft, round kick with no click; a brushed rim, or a muffled clap; a closed hat or a shaker.
      Audition fast with EDIT + LEFT / RIGHT on a loaded sample's name, which steps through its
      folder (Sampling page). Any will do; the instrument settings dull them.
- [ ] **No recordings.** The only new sample is the render of his own A section, made on the M8 at
      step 9 (section 7).
- [ ] **Leave instrument 11 alone**: on his device it holds his `COLOR 34` test.
- [ ] **Free slots:** instruments 04, 05, 06, 07, 09, 0A; tables 04 (the lead's own) and 81 (or
      whatever free table EDIT twice on a TBL value offers); groove 01.
- [ ] A spare song row for the render (row 0F here), emptied again after.

## 2. Instruments

In the order the steps bring them in. Each value's line says why, tied to the parts sheet's feel
paragraph for that instrument.

### 10 CHORDED · MACROSYN · step 2 (his instrument 10)

The feel: four voices struck together, a soft attack, a swell-and-fade over about two bars,
slightly smeared and digital, wide and behind the arp; the song's pad.

| Parameter | Value | Why |
|---|---|---|
| TRANSP. | ON | (photo) the default; nothing in the song transposes |
| TBL. TIC | 01 | (photo) the default; no table |
| EQ | -- | (photo) none |
| SHAPE | 28 WAV PARAPHONIC | (photo) four wavetable voices; COLOR picks the chord shape |
| TIMBRE | 45 | (photo) his wave in the set of 16: soft, slightly glassy |
| COLOR | 80 | (card) the base the relative `COL` values add to: `COL B4` lands on 34, `24` on A4, `44` on C4, `54` on D4 |
| DEGRADE | 00 | (photo) the wonkiness comes from the shapes, not grit |
| REDUX | 00 | (photo) |
| FILTER | LOWPASS | (photo, shown as `01 LOWPASS`) takes the digital edge off |
| CUTOFF | 90 | (photo) glassy but gentle: the top is softened, not gone |
| RES | 40 | (photo) a little resonance gives the smear a voice |
| AMP | 00 | (photo) |
| LIM | CLIP | (photo, shown as `00 CLIP`) |
| PAN | 80 | (photo) center |
| DRY | C0 | (photo) |
| MFX | 30 | (photo) the chorus is the width that makes it the pad |
| DEL | 10 | (photo) a trace |
| REV | 10 | (photo) little: the lead's tail fills the room, not the chords |

| Slot | Type | DEST | Values | Why |
|---|---|---|---|---|
| MOD1 | 00 AHD ENV | VOLUME | AMT FF, ATK 02, HOLD 60, DEC 60 | (card) ATK 2 ticks (56 ms) is the soft attack; HOLD 60 holds full for one bar and DEC 60 fades over the next: two bars at any tempo, which the B section's one strike per two bars relies on |
| MOD2–4 | -- | | | |

No table. **Unverified (carried from the card):** COLOR shapes `A4`, `C4` and `D4` come from the
Braids source, not his ears; `D4` (sus4 + octave, for Asus4 in B) is new.

### 02 VELVET BASS · WAVSYNTH · step 3 (his card)

The feel: round and felt-covered, soft but definite, no click, no fizz; dies away over about three
beats; a little drive after the filter; dry, in the center.

| Parameter | Value | Why |
|---|---|---|
| TRANSP. | ON | default |
| TBL. TIC | 01 | default; no table |
| EQ | -- | none: the filter does the shaping |
| SHAPE | SAW | (card) full harmonics low down for the "felt" body |
| SIZE | 40 | (card) |
| MULT | 00 | (card) |
| WARP | 00 | (card) |
| SCAN | 00 | (card) |
| FILTER | LOWPASS | (card) |
| CUTOFF | 60 | (card) the saw with its top shaved: no fizz |
| RES | 08 | (card) a hint of roundness at the cutoff |
| AMP | 18 | (card) a little gain into the limiter |
| LIM | POST | (card) clipped after the filter: body without brightness |
| PAN | 80 | center |
| DRY | D0 | (card) the floor of the mix |
| MFX | 08 | (card) a trace of chorus |
| DEL | 00 | (card) |
| REV | 08 | (card) almost none: reverb on the bass muddies the chords |

| Slot | Type | DEST | Values | Why |
|---|---|---|---|---|
| MOD1 | 00 AHD ENV | VOLUME | AMT FF, ATK 01, HOLD 18, DEC 30 | (card) ATK one tick so no click; HOLD a beat, DEC two: "dies away over about three beats" |
| MOD2–4 | -- | | | |

No table. The quiet octaves (velocity 24) and approach notes (30) are set in the phrases.

### 01 POLAROID ARP · WAVSYNTH · step 4 (his card)

The feel: a soft rounded "doong" whose bright edge is gone almost at once, fading to a hollow,
woody tone before the next eighth or two; the top softened; a very slow, very small tape wobble.

| Parameter | Value | Why |
|---|---|---|
| TRANSP. | ON | default |
| TBL. TIC | 01 | default; no table |
| EQ | -- | none |
| SHAPE | TRIANGLE | (card) the hollow fundamental |
| SIZE | 20 | (card) |
| MULT | 00 | (card) |
| WARP | 18 | (card) pushed slightly to one side: the woody asymmetry |
| SCAN | 00 | (card) the row after WARP is SCAN on 6.6.3 (changelog) |
| FILTER | LOWPASS | (card) |
| CUTOFF | A0 | (card) never glassy |
| RES | 12 | (card) the small nasal edge |
| AMP | 00 | (card) |
| LIM | CLIP | (card) |
| PAN | 80 | (card, `00` in the chat became `80`, center on 6.6.3) |
| DRY | C0 | (card) |
| MFX | 30 | (card) part of the haze |
| DEL | 28 | (card) dotted-eighth echoes fall between the eighths |
| REV | 48 | (card) |

| Slot | Type | DEST | Values | Why |
|---|---|---|---|---|
| MOD1 | 00 AHD ENV | VOLUME | AMT FF, ATK 01, HOLD 01, DEC 18 | (card) a one-tick attack and a one-beat fade: the next eighth arrives halfway down, so it's a pluck, not a drone ("fade within one or two eighths") |
| MOD2 | 00 AHD ENV | CUTOFF | AMT 20, ATK 00, HOLD 00, DEC 10 | (card) a little brightness that closes in 16 ticks, two-thirds of a beat: the "doong" |
| MOD3 | 03 LFO | PITCH | OSC SIN, TRIG FREE, AMT 01, FREQ 80 | (card) one wobble every eight bars at the smallest depth: the stretched tape |
| MOD4 | -- | | | |

No table. Stepping back under the lead is done in the phrases (velocity 3C/2C and CHA 8F), not
here.

### 05 KICK, 06 SNARE, 07 HAT · SAMPLER · step 5

The feel: dusty rather than punchy, "taped off the radio". Kick: low, round and short, a pillow
being hit. Snare: a brushed rim or muffled clap with a small room. Hat: closed, dull, quiet, felt
more than heard. All three play their sample on C-4.

| Parameter | 05 KICK | 06 SNARE | 07 HAT | Why |
|---|---|---|---|---|
| TRANSP. | OFF | OFF | OFF | the manual's advice for percussion: no transpose can ever move a drum |
| TBL. TIC | 01 | 01 | 01 | default; no tables |
| EQ | -- | -- | -- | none |
| SAMPLE | a soft kick | a brushed rim or muffled clap | a closed hat or shaker | from the factory samples (section 1) |
| SLICE | 00 | 00 | 00 | one-shots, no slices |
| PLAY | FWD | FWD | FWD | once, forward |
| START | 00 | 00 | 00 | from the top |
| LOOP ST. | 00 | 00 | 00 | not looping |
| LEN | FF | FF | FF | the whole sample; the envelope shortens it |
| DETUNE | 80 | 80 | 80 | in tune |
| DEGRADE | 18 | 18 | 20 | the grit "taped off the radio"; a little more on the hat, where aliasing reads as dust (the manual: any DEGRADE above 00 also turns off interpolation) |
| FILTER | LOWPASS | LOWPASS | LOWPASS | dusty means the top is gone |
| CUTOFF | 90 | A0 | 80 | kick: no click; snare: soft but still a crack; hat: dull |
| RES | 00 | 00 | 00 | no ring |
| AMP | 00 | 00 | 00 | |
| LIM | CLIP | CLIP | CLIP | |
| PAN | 80 | 80 | 90 | the hat a little right, off the backbeat |
| DRY | C0 | B0 | 90 | kick, then snare a step lower, the hat quiet: "felt more than heard" |
| MFX | 00 | 00 | 00 | |
| DEL | 00 | 00 | 00 | |
| REV | 08 | 28 | 10 | the snare's "small room" is a short trip into the shared reverb; the kick stays dry |

| Inst | Slot | Type | DEST | Values | Why |
|---|---|---|---|---|---|
| 05 | MOD1 | 00 AHD ENV | VOLUME | AMT FF, ATK 00, HOLD 04, DEC 08 | 12 ticks, an eighth (0.33 s): round and short, whatever the sample's own tail |
| 06 | MOD1 | 00 AHD ENV | VOLUME | AMT FF, ATK 00, HOLD 03, DEC 0C | 15 ticks: a short snap; the fill's sixteenths cut each other off anyway |
| 07 | MOD1 | 00 AHD ENV | VOLUME | AMT FF, ATK 00, HOLD 00, DEC 06 | one sixteenth: closed |

MOD2–4 empty on all three. No tables. Groove 01 (section 3) is set by the `GRV 01` on row 0 of
phrases 50–53 and 60.

**The fill (phrase 50, rows D–F): `NTH 40`** on each of the three snare notes. NTH skips what is
to its left (the note) on all but some passes; `4` in the left digit is written for "plays every
fourth pass". **Unverified:** the manual defers to the help line. When you enter it, read the help
line; if it says the note is skipped every fourth time instead, try `NTH 04` or the fallback
(chain 05 as `50 50 50 51 50 50 50 51`).

### 04 POLAROID LEAD · MACROSYN · step 6 (table at step 7)

The feel: the top of the mix (A5 to E6), breathy and airy, a recorder or wooden flute on a worn
cassette. A little air and a small scoop at the start of each note; short notes plain; long notes
grow a vibrato after about a beat. Notes join (one breath a phrase) and stop with an OFF. A long
reverb tail with shimmer.

| Parameter | Value | Why |
|---|---|---|
| TRANSP. | ON | default |
| TBL. TIC | 03 | three ticks a table row: the scoop is over in a sixteenth and the vibrato row arrives a beat in (the table's timing goal) |
| EQ | 04 | a low cut (section 4): nothing under the lead's F♯5 is worth keeping, and it keeps breath rumble out of the reverb |
| SHAPE | 1F FLUTED | the flute model: TIMBRE is air pressure, COLOR the instrument's geometry (manual, BLOWN / FLUTED) |
| TIMBRE | 60 | enough pressure to speak quickly on the eighth-note pickups, short of overblowing |
| COLOR | 40 | a short, wooden bore rather than a long metal one; set by ear |
| DEGRADE | 08 | a little worn-cassette grain |
| REDUX | 00 | |
| FILTER | LOWPASS | the model has no filter of its own (manual); this is the cassette's soft top |
| CUTOFF | A8 | breathy, not shrill, in the A5–E6 register |
| RES | 00 | |
| AMP | 00 | |
| LIM | CLIP | |
| PAN | 80 | center |
| DRY | B0 | soft enough to live above everything |
| MFX | 20 | a slight chorus: tape flutter |
| DEL | 30 | dotted-eighth echoes between the long notes |
| REV | 70 | the song's largest send: held notes leave a trace, and the shimmer is mostly this |

| Slot | Type | DEST | Values | Why |
|---|---|---|---|---|
| MOD1 | 01 ADSR ENV | VOLUME | AMT FF, ATK →0.03 s, DEC 00, SUS FF, REL →0.25 s | holds for as long as the note lasts; ATK about one tick so the table's breath does the shaping; REL a sixteenth and a half (0.25 s), "a short release on OFF". Since 6.6 a retrigger resumes from the current level, so tied notes join |
| MOD2 | 00 AHD ENV | TIMBRE | AMT 18, ATK 00, HOLD 00, DEC 06 | a puff of extra pressure for one sixteenth: the air on the attack |
| MOD3 | 03 LFO | PITCH | OSC SIN, TRIG FREE, AMT 01, FREQ 80 | the arp's tape wobble, the same depth and period: one tape |
| MOD4 | -- | | | |

Set the ADSR times by the help line: ATK until it reads about 0.030 seconds, REL about 0.250.

#### Table 04 (the lead's own) · step 7

TBL. TIC 03. **FIN is relative** (changelog: "FM, Macro, and Wavsynth had relative FIN command wrap
back to -1"), so rows 1 and 2 add back what row 0 took away. A note with an instrument number
resets it, so every note starts from zero. One FIN step is 1/128 of a semitone (the manual: FIN
spans −1 to +1 semitone): `F0` is −16, about 12 cents flat. V multiplies the phrase's velocity;
`7F` is full.

| Row | N | V | FX1 | FX2 | FX3 | Ticks in | What it does |
|---|---|---|---|---|---|---|---|
| 0 | 00 | 50 | FIN F0 | | | 0 | the breath: about 12 cents flat, at two-thirds level |
| 1 | 00 | 68 | FIN 08 | | | 3 | halfway up (about 6 cents flat) |
| 2 | 00 | 7F | FIN 08 | | | 6 | on pitch, full level: the scoop took one sixteenth |
| 3 | | | | | | 9 | the wait |
| 4 | | | | | | 12 | (an eighth note ends here, plain) |
| 5 | | | | | | 15 | |
| 6 | | | | | | 18 | |
| 7 | | | | | | 21 | |
| 8 | | | PVB 52 | | | 24 | a beat in: the vibrato starts, narrow |
| 9 | | | PVB 54 | | | 27 | at full width |
| A | | | HOP 09 | | | 30 | back to row 9 for as long as the note lasts |
| B | | | | | | | |
| C | | | | | | | |
| D | | | | | | | |
| E | | | | | | | |
| F | | | | | | | |

**PVB** is speed (first digit) and depth (second). The manual gives no scale for either: `5` and
`2`–`4` are a starting point. Set by ear toward about five wobbles a second, never wider than a
quarter tone.

#### Table 81 (a free table, for A4's long notes) · step 7

The same shape, a deeper breath and a wider vibrato: the second time the memory is told. Picked
with `TBL 81` in phrases 45–48; the breakdown's `TBL 04` (phrase 4D) puts the lead's own table
back. TABLE TIC is the instrument's, so 03 here too.

| Row | N | V | FX1 | FX2 | FX3 | What it does |
|---|---|---|---|---|---|---|
| 0 | 00 | 48 | FIN E8 | | | about 19 cents flat, a little softer |
| 1 | 00 | 64 | FIN 0C | | | halfway up |
| 2 | 00 | 7F | FIN 0C | | | on pitch, full |
| 3–7 | | | | | | the wait |
| 8 | | | PVB 54 | | | the vibrato starts |
| 9 | | | PVB 57 | | | wider than table 04's |
| A | | | HOP 09 | | | hold on row 9 |
| B–F | | | | | | empty |

To make it: on a TBL value in phrase 45, EDIT twice gives the next unused table; then type the
rows. If it offers a number other than 81, use that number in phrases 45–48.

### 09 FADED, 0A FADED REV · SAMPLER · step 9

The feel: his A section an octave down and at half speed, lasting eight bars; the same chords,
slower, lower, duller and a little grainy, as if remembered; quiet and far back, the top rolled
off. In the outro, backward: every note swells in and cuts off.

| Parameter | 09 FADED | 0A FADED REV | Why |
|---|---|---|---|
| TRANSP. | ON | ON | default |
| TBL. TIC | 01 | 01 | default; no table |
| EQ | 09 | 09 | a shared low cut (section 4): half speed moves the chords' lowest notes down to A2 |
| SAMPLE | FADED | FADED | the render from section 7; both play the same file |
| SLICE | 00 | 00 | |
| PLAY | FWD | REV | 09 once forward; 0A once backward, so every pluck and chord swells in and cuts off |
| START | 00 | 00 | |
| LOOP ST. | 00 | 00 | not looping: one note plays the whole song row and ends with it |
| LEN | FF | FF | all four bars |
| DETUNE | 80 | 80 | in tune; the octave comes from playing C-3 |
| DEGRADE | 30 | 30 | grainy; pitching down already dulls it |
| FILTER | LOWPASS | LOWPASS | the top rolled off |
| CUTOFF | 70 | 70 | duller than anything live, so it sits behind |
| RES | 00 | 00 | |
| AMP | 00 | 00 | |
| LIM | CLIP | CLIP | |
| PAN | 80 | 80 | |
| DRY | 90 | 90 | quiet; phrase velocities (60, 40, 50) do the rest |
| MFX | 20 | 20 | a little chorus, more tape warble |
| DEL | 00 | 00 | echoes would blur the slowed chords |
| REV | 50 | 60 | far back; 0A sends more so the outro's freeze has its chord to hold |

| Inst | Slot | Type | DEST | Values | Why |
|---|---|---|---|---|---|
| 09, 0A | MOD1 | 03 LFO | PITCH | OSC SIN, TRIG FREE, AMT 02, FREQ 20 | a deeper, faster wow than the live parts (one cycle every two bars): the memory is the more worn copy |

MOD2–4 empty. No volume envelope: the sample plays to its own end, which the crop puts exactly at
the end of the song row.

## 3. Groove

**Groove 01: `07` `05`**, 24 PPQN, used only by tracks 5 and 6 (the `GRV 01` on row 0 of every drum
and hat phrase). Every other track stays on groove 00, straight.

- Why: the plan's "light swing on the drums only". 07/05 is the manual's common swing setting
  (about 58%; since 6.5 the groove view also shows the swing as a percentage); it moves the hats' two ghosts
  (rows 3 and B) late. The arp sits on even rows, which a two-row groove never moves.
- To enter it: from the phrase view, SHIFT + UP opens the groove view; OPTION + RIGHT to groove
  01; on row 0, EDIT + UP / DOWN changes rows 0 and 1 together (manual) until they read 07 and
  05. Rows 2–F stay `--`, so the groove repeats every two rows.
- Lighter, if 07/05 sounds too lilting: set the groove to 48 PPQN (12 ticks a row) and use
  `0D` `0B`, about 54%.

## 4. Mixer and effects (step 10, and the EQs as they arrive)

The send effects are one per song: the instrument's MFX, DEL and REV decide how much of each
part reaches them. From the Mixer view, SHIFT + DOWN opens the effect settings. Values are
starting points by ear; the manual names the parameters but gives no scales.

**Reverb**

| Parameter | Value | Why |
|---|---|---|
| SIZE | E0 | a big, soft room: the photo has "flattened light", not a small space |
| DECAY | C0 | long, so the lead's held notes leave a trace |
| SHIMMER | 30 | the plan's mix moment: a pitched-up feedback in the tail (6.2+). The lead sends most (REV 70), so most of the shimmer is its tail; keep it low enough that the chords don't sparkle |
| MOD DEPTH | 40 | the tail drifts like the tape |
| MOD FREQ | 30 | slow |
| WIDTH | FF | full stereo |
| INPUT EQ | LOW: LOWCUT, about 250 Hz | keeps the bass and the chords' low notes out of the tail |

**Delay**

| Parameter | Value | Why |
|---|---|---|
| TIME L:R | 0C, 0C | a dotted eighth (three rows), as in Low Tide: the arp's and lead's echoes land between their notes |
| FEEDBACK | 60 | two or three repeats |
| WIDTH | FF | ping-pong across the field |
| REVERB SEND | 40 | the echoes sit in the same room |
| INPUT EQ | LOW: LOWCUT, about 300 Hz | thin echoes don't muddy the chords |

**Unverified (carried from Low Tide step 7):** whether `0C` is a dotted eighth (the manual: "first
digit is in beats, second digit is in fractions of a beat"). Report back what the help line says
for `0C`.

**ModFX**

| Parameter | Value | Why |
|---|---|---|
| Type | CHORUS | (manual: chorus, phaser or flanger; comb since 6.6) the tape's flutter |
| MOD DEPTH | 40 | noticeable on the chords (MFX 30), faint on the rest |
| MOD FREQ | 18 | slow, like a tape |
| WIDTH | C0 | the chords' width comes from here |
| REVERB SEND | 20 | |

**Instrument EQs.** In each instrument, set EQ to the slot number, then EDIT on it (or SHIFT +
RIGHT) opens the EQ editor. Give FREQ in Hz by watching the help line; whether the screen shows Hz
or hex is Low Tide's open question.

| Slot | Used by | Band | TYPE | FREQ | MODE | Why |
|---|---|---|---|---|---|---|
| 04 | lead 04 | LOW | LOWCUT | about 350 Hz | STEREO | the lead's lowest note is F♯5 (740 Hz); this only takes breath noise and rumble |
| 09 | memory 09, 0A | LOW | LOWCUT | about 150 Hz | STEREO | at half speed the chords reach down to A2; the cut keeps the intro and breakdown clear of the live bass |

The other bands stay flat. **Mixer view:** leave the eight track volumes and the MX, DE and RE
returns where the project has them, and balance with each instrument's DRY (so its sends stay put,
as in Low Tide). DJF `80` (off), OTT `00`. LIM: raise from `00` until the limiter's line on the MIX
meter moves only on the loudest rows (A2, A3 and A5); about `20` is a place to start.

**The reverb freeze (track 8, `XRZ`)**

- `XRZ FF` on row 8 of the outro's last bar (phrase 81) freezes the reverb: any value above `00`
  turns freeze on (manual). At that moment the backward memory (0A, REV 60) is swelling into its
  last chord, Dmaj9, so the freeze holds that chord as a still picture after the sample cuts off.
- `XRZ 00` on row 0 of the intro (phrase 80) thaws it, so the frozen chord melts into the intro's
  D when the song loops. Stopping playback during the freeze ends the song on it.
- **Unverified:** whether new sound reaching a frozen reverb is added or ignored, and whether the
  thaw is clean. Report back: when the song loops, does the freeze let go at the downbeat?

## 5. FX commands, by instrument

Every command the parts use, and why it is valid where it sits.

| Command | Where | On | Note |
|---|---|---|---|
| COL | phrases 30–36, 3D | 10, Macrosynth | relative (his test): COLOR 80 plus the value |
| PSL | bass and lead phrases | 02, 04 | a sequencer command, any instrument; ticks |
| CHA | phrases 14–17 | 01 | `8F`: the note about half the time, the FX always |
| TBL | phrases 45–48, 4D | 04 | picks table 81 or 04 |
| OFF | lead and chord phrases, FD | any | with 04's ADSR, starts the release |
| GRV | phrases 50–53, 60 | tracks 5 and 6 | groove 01 |
| NTH | phrase 50 rows D–F | 06 | `40`, see the drums |
| XRZ | phrases 80, 81 | track 8, no instrument | a mixer command; needs no instrument |
| FIN, PVB, HOP | tables 04 and 81 | 04 | FIN relative; HOP in a table jumps to its row (`0` times = for good) |

## 6. Lengths, against what the parts assume

| Part | The parts assume | The settings give |
|---|---|---|
| Arp 01 | fades within one or two eighths | 1-tick attack, 1-beat decay: half gone when the next eighth arrives |
| Bass 02 | about three beats | HOLD 1 beat + DEC 2 beats |
| Chords 10 | swell and fade over about two bars | HOLD 1 bar + DEC 1 bar, at any tempo |
| Lead 04 | sustains until the next note or an OFF; short release | ADSR SUS FF; REL 0.25 s |
| Kick 05 | round and short | an eighth |
| Memory 09, 0A | exactly eight bars on C-3 | a four-bar crop at half speed (section 7) |
| The outro chords | struck at bars 1 and 3, gone by the OFF at bar 5 | the AHD has faded by the end of bar 4, so the OFF is a safety |

## 7. Rendering the memory (step 9)

The memory is his A section without the bass, rendered to a sample and cropped to four bars, so
that played on C-3 (half speed, an octave down) it fills one eight-bar song row exactly. It is
rendered from a spare song row holding only the arp and the chords: no bass, and no question of
whether a quick render honors mutes.

1. **Song view, a spare row.** Go to row 0F. On track 1 type chain `01`; on track 3 chain `03`.
   Leave track 2 empty. (Any empty row will do.)
2. **Select it.** With the cursor on row 0F, track 1, press SHIFT + OPTION to start a selection,
   then RIGHT twice so tracks 1 to 3 of that one row are selected.
3. **Render.** Double-tap EDIT. The dialog offers QUICK RENDER, REALTIME and EXTERNAL ONLY; choose
   **QUICK RENDER** (offline, the tracks only). OPTION would cancel.
4. **Find the new instrument.** When it finishes, a new Sampler instrument holding the render
   appears and becomes the default for new notes. Note its number.
5. **Open the sample editor.** In that instrument, EDIT on EDIT, to the right of SAMPLE.
6. **Select four bars.** On SELECT, leave the start at the beginning. Move the end with OPTION +
   UP / DOWN, which steps in beats at the song's tempo, to 16 beats: the end of his bar 4. The help
   line shows the position. (The render is eight bars, his loop twice.)
7. **Crop.** On PROCESS, EDIT + LEFT / RIGHT to CROP, then EDIT.
8. **Soften the cut.** SELECT the last half beat (from 15 beats and 2 steps to 16 beats; OPTION +
   LEFT / RIGHT steps by one sixteenth). PROCESS: the fade-out (the manual lists FADE IN/OUT).
   Bar 4's Gmaj9 is still at full level where the crop cuts it; the fade keeps the end of the intro
   from clicking, and the start of the backward copy from clicking in.
9. **Name and save.** NAME: `FADED`. Then SAVE. OPTION leaves the editor.
10. **Move it to 09.** In the new instrument, SHIFT + OPTION copies it. OPTION + LEFT / RIGHT to
    instrument 09; SHIFT + EDIT pastes. Then clear the slot it landed in: in the Instrument Pool
    view, EDIT + OPTION on its name. (Or keep the number it landed on and type that in phrases 70
    and 71 instead of 09.)
11. **Set 09** as in section 2: PLAY FWD, DEGRADE 30, CUTOFF 70, DRY 90, MFX 20, REV 50, EQ 09, and
    the LFO.
12. **Make 0A.** On 09, SHIFT + OPTION; OPTION + RIGHT to 0A; SHIFT + EDIT. Then PLAY REV, REV 60,
    NAME `FADED REV`.
13. **Clear row 0F**: EDIT + OPTION on each of its cells.
14. **Check the length.** Play row 02 (phrase 70 on C-3): the memory should end exactly as the row
    does. 6.6 fixed a quick-render length error; if it runs long or short, trim LEN.

**Unverified, with what to report back:**

- **C-4 plays a sample at its own pitch**, so C-3 is half speed (the Sampling page's open check;
  the manual's pitch limit starts above C-4). Report back: does the memory on C-3 sound exactly an
  octave below his loop?
- **Whether QUICK RENDER includes the send effects** (reverb, delay, chorus). Either way works: with
  them, the haze is baked in; without, 09's own sends add it. Report back which.
- **Where PLAY REV starts.** Written as "from the end, backward". If 0A plays nothing, or only part,
  the fallback is a reversed file: in 0A's sample editor, SELECT all, PROCESS REVERSE, NAME
  `FADEDREV`, SAVE (a new file, so 09 still plays forward), and set 0A to PLAY FWD. Report back
  which you needed.

## 8. Unverified, all in one place

Each becomes an Unverified box on the pages. One ask each.

| What | Written as | Fallback | Report back |
|---|---|---|---|
| The flute model's name and number on 6.6.3 | `1F FLUTED`: Braids' model order in hex, which matches every number his photos and the cards show (`20` STRUCK BELL, `22` KICK, `23` CYMBAL, `24` SNARE, `28` WAV PARAPHONIC) | `1E BLOWN`, the reed model next to it | What does SHAPE read at 1E and 1F? |
| Whether the flute speaks on an eighth note | TIMBRE 60 plus the TIMBRE puff | raise TIMBRE; failing that, `03 SINE TRIANGLE` with TIMBRE 00 (a plain, pure voice that speaks at once; the table still scoops it) | Do the hook's pickups (A5, D6 in phrase 40) speak cleanly? |
| PVB in a table, and HOP 09 re-reading it | row 9 re-read every two rows | move the HOP to row B as `HOP 0A`, so the table idles after row 9; or `PVB 54` written in the phrases a beat after each long note | Does the vibrato on a long note sound smooth, or restart in pulses? |
| PVB's speed and depth scale | `52`, `54`; `54`, `57` | set by ear | What do 52 and 54 sound like: too fast, too wide? |
| NTH's counting | `NTH 40` = fill every fourth pass | chain 05 as `50 50 50 51 50 50 50 51` | What does the help line say for `NTH 40`? |
| Delay TIME `0C` = a dotted eighth | `0C 0C` | by ear | What does the help line say for `0C`? |
| XRZ freeze and thaw | `XRZ FF`, then `XRZ 00` at the top | stop playback during the freeze | Does the freeze let go cleanly when the song loops? |
| COLOR shapes `A4`, `C4`, `D4` | as named in the Braids source | skip Asus4 (bar 7 plays phrase 31) | Does `D4` sound like a sus4? |
| C-4 = a sample's own pitch; QUICK RENDER and sends; PLAY REV | see section 7 | see section 7 | see section 7 |
| ADSR targets | 0.03 s, 0.25 s by the help line | | What hex values give 0.030 and 0.250 s? (fills in the curve) |

## 9. Consistency pass

Checked with `python3 tools/songs/instruments.py check`, which walks every phrase in the model,
and by hand.

- **Every instrument the phrases use has settings,** and every instrument here is used: 01, 02, 04,
  05, 06, 07, 09, 0A, 10. Instrument 11 is his test and isn't touched.
- **Every FX command is valid where it sits** (section 5). The only instrument-specific one, COL,
  is only ever on instrument 10, a Macrosynth. No `??` is left in the parts.
- **Lengths match the parts' assumptions** (section 6).
- **Against `m8-notes.md`:** ADSR in seconds, AHD in ticks, LFO FREQ as a period; COL relative from
  a COLOR of 80, landing on `x4`; PAN 80 center; the sends read DRY/MFX/DEL/REV; mod types shown
  with their numbers. No contradiction found.
- **Changed in the parts** (recorded there in section 10, item 11): `NTH 40` filled in; tables 04
  and 81 filled in, TIC 03; the memory rendered from a spare row instead of with a mute. No note
  moved.

## 10. For the builder

- The data is `tools/songs/instruments.py`, `SONGS["faded-polaroid"]`: `instruments`, `tables`,
  `grooves`, `mix`. Table rows are keyed in decimal, as in the song JSON.
- **The header rows are named as his photo shows them: `TBL. TIC`.** The kit reads `TABLE TIC`
  (`m8kit.js`, and `patches/table-arp.json` uses it), so either alias the two in the kit or rename
  on the way into the JSON. Without that, the demo runs table 04 at the default speed.
- Mod `type` strings are Low Tide's (`AHD ENV`, `ADSR ENV`, `LFO`), which the kit keys on; the
  pages should show the numbers (`00 AHD ENV`, `01 ADSR ENV`, `03 LFO`).
- Filter and limiter values are written `LOWPASS`, `CLIP`, as in Low Tide and the cards, because
  the kit compares `FILTER === 'HIGHPASS'`; his photo shows `01 LOWPASS` and `00 CLIP`.
- ADSR mods carry `sec` as Low Tide's do. The lead's ATK is 0.03 s and REL 0.25 s.
- `demo: false` on every Sampler (no sample to play), as Low Tide's field loop.
- `mix` is new: lists of `[parameter, value]` for the reverb, delay, ModFX and mixer, and the
  instrument EQ slots. The pages can show them as screens; the kit doesn't need them.
- The kit doesn't play: the flute model, FIN or PVB in a table, NTH, XRZ, PLAY REV, DEGRADE.
