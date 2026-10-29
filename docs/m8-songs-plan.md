# M8 guide: Songs 2 and 3, the plan

**DRAFT, 2026-10-29.** Written by a Claude session as the first of a relay (plan, then parts,
then instrument settings, then pages). Andrew has not reviewed it. It sets the musical ideas and
what each song teaches; it gives no parameter values. Where it leans on something the sources
don't settle, it says so.

Sources: `docs/m8-guide-plan.md` (rev 4), Low Tide's spec and pages, `~/repos/music/rig/m8-notes.md`,
his Faded Polaroid chat and two photos in `docs/sources/`, the patch cards, the manual (6.5.2),
the changelog (6.6.3 F) and the meetup digest.

## Why these two

Low Tide teaches the Hypersynth pad and CRD, ADSR and LFO in real time, a bassline moved by TSP
with PSL slides, grooves, the trig-envelope duck, a hand-written arp with CHA, a field recording,
the song view with FE rests and DJC, and the mix. It has **no lead melody, no FM, no tables
inside the song, and no resampling.** The two new songs split those up so that each has one
clear identity:

| Technique | Low Tide | Song 2: Faded Polaroid | Song 3: Overpass |
|---|---|---|---|
| Lead melody / hook | none | **a synth lead, the hook** | a hook sung by his own voice, chopped |
| FM | none | none | **FM keys and FM bass** |
| Tables in the song | (Techniques page only) | **time-based: a table shapes every lead note** | **trigger-based: TIC 00, a table that counts stabs** |
| Sampling | field recording | **resampling the song into its own intro and outro** | **resampling for polyphony; chord-memory stabs; slicing drums; recording a voice** |
| Chords | Hypersynth banks + CRD | **Macrosynth WAV PARAPHONIC + relative COL** (his) | **sampled chord stabs played in parallel** |
| Other new | | Sampler drums, NTH fills, a borrowed chord, reverb freeze | 2-step groove, RET builds |

"Table-driven chords" in the narrow sense (a table that steps through chord shapes) was
considered and left out: the M8's chord instruments already change chords from the phrase (CRD,
COL), and a table-arp on one mono voice sounds like an arpeggio, not a chord. Both songs use
tables for what tables do that nothing else does: movement inside a note, and per-trigger
variation.

---

## Song 2: Faded Polaroid (finish his, don't replace it)

**Decision: finish and extend Faded Polaroid.** It is his own song, its chords and arp exist on
his device (instrument 10, phrase 10), he verified the relative COL behavior himself, and three
of its instruments are already patch cards. Nothing argues for replacing it. His four bars become
the A section, unchanged; the plan adds a lead, a B section, drums, and a resampled "faded" copy
of the loop that opens and closes the song.

- **Tempo:** 90 BPM (his device shows `T▸090`; the chat's 78 was never used).
- **Key:** D major. The B section borrows one chord from D minor.
- **Feel:** straight eighths in the arp and lead; a light swing on the drums only. The arp sits on
  even rows, so a swing groove (which moves odd rows) can't touch it.
- **Length:** nine song rows of eight bars, about 3:10.

**Mood.** A photo found in a drawer: the shapes are all there but the edges have gone soft and
the light has flattened. Hollow little plucks circling through ninth chords, a round bass under
them, a breathy flute-like voice that keeps reaching for a note and settling one step short of
home, and a beat that sounds like it was taped off the radio. Calm and fond, a little sad, never
heavy. The song starts and ends with its own loop played back slowed down and dulled, as if
remembered.

**References for the feel:** Boards of Canada, *Music Has the Right to Children* ("Roygbiv" for
the simple, wobbly lead over warm chords); Tycho, "Awake" (major-key ninth chords, a steady
pulse, nothing hurried); Washed Out, "Feel It All Around" (the hazy, slowed, tape-soft
production).

### Form and arrangement

Each song row is eight bars. The A section is his 4-bar loop played twice.

| Row | Section | Bars | Arp (T1) | Bass (T2) | Chords (T3) | Lead (T4) | Drums (T5) | Hats (T6) | Faded loop (T7) |
|---|---|---|---|---|---|---|---|---|---|
| 00 | Intro: the memory | 8 | | | | | | | **half speed, dull** |
| 01 | A1: his loop | 8 | **on** | **on** | **on** | | | | |
| 02 | A2: the beat | 8 | on | on | on | | **on** | **on** | |
| 03 | A3: the hook | 8 | stepped back | on | on | **hook** | on | on | |
| 04 | B: the fade | 8 | B phrases | B roots | **B chords** | counter-line | lighter | on | |
| 05 | A4: the hook again | 8 | stepped back | on | on | hook, varied | on | on | |
| 06 | Breakdown | 8 | on | | on | hook, first half only | | | half speed, low |
| 07 | A5: last time | 8 | stepped back | on | on | hook, resolves | on | on | |
| 08 | Outro: rewinding | 8 | | | Dmaj9 held, then OFF | last note | | | **reversed**, then reverb freeze |

"Stepped back" means the arp keeps playing his notes in his register but quieter and sparser
under the lead (lower velocity, CHA dropouts or NTH), so the two never fight. Don't move the arp
to another octave: down, it muddies the chords; up, it runs into the lead.

### Harmony

**A section (his, unchanged): one chord per bar.**

| Bar | Chord | Roman | Bass | Paraphonic note + shape | Upper structure (sounding) |
|---|---|---|---|---|---|
| 1 | Dmaj9 | I | D | F♯4, minor 7 (`34`) | F♯ A C♯ E |
| 2 | Aadd9 | V | A | A3, major add 9 (`A4`) | A C♯ E B |
| 3 | Bm9 | vi | B | D4, major 7 (`C4`) | D F♯ A C♯ |
| 4 | Gmaj9 | IV | G | B3, minor 7 (`34`) | B D F♯ A |

Rootless four-voice upper structures over a separate bass, exactly as he set it up. The COLOR
targets are his working values from the chat; he confirmed `80` + `COL B4` = `34` by ear, but
`A4` and `C4` were never tried one by one (the patch card's open question still stands).

His bass roots in the chat were D2, A2, B1, G2. **Suggestion for the parts agent:** D2, A1, B1,
G1, so the line falls a fourth, steps up, and falls a third, instead of leaping a seventh from A2
to B1. His call if he prefers his.

**B section (new): two bars per chord, so the harmony slows down.**

| Bars | Chord | Roman | Bass | Paraphonic note + shape | Upper structure |
|---|---|---|---|---|---|
| 1–2 | Em9 | ii | E | G3, major 7 (`C4`) | G B D F♯ |
| 3–4 | Gmaj9 | IV | G | B3, minor 7 (`34`) | B D F♯ A |
| 5–6 | Gm9 | iv (borrowed from D minor) | G | B♭3, major 7 (`C4`) | B♭ D F A |
| 7 | Asus4 | V sus | A | A3, sus4 + octave (`D4`) | A D E A |
| 8 | Aadd9 | V | A | A3, major add 9 (`A4`) | A C♯ E B |

- **The borrowed iv is the song's title moment.** Gmaj9 to Gm9 changes two notes, B down to B♭ and
  F♯ down to F, under the same bass note. The chord darkens while nothing else moves: the photo
  fading. Major IV to minor iv and home to I is one of the oldest nostalgic moves in pop.
- **A chromatic line runs through it:** B (bars 1–4) → B♭ (5–6) → A (7–8), falling a half step at a
  time into the dominant. The lead doubles this line two octaves up (see Themes), so it can't be
  missed.
- **Bar 7 to 8** resolves the sus inside the chord (D down to C♯) before the A section's Dmaj9.
- Only one new COLOR value: `D4` (sus4 + octave). The chat's shape table puts sus4 + octave in
  the `D0` region; like `A4` and `C4`, it is from the Braids source, not his ears. **Unverified.**
- Top voices: F♯4, A4, A4, A4, B4 → (A section) E5. The A held through bars 3–7 is a common tone;
  the darkening happens under it.

### Themes

**The hook (lead, track 4).** Four bars, a statement and an answer with the same rhythm. Written
an octave above the arp (A5 to E6), because the arp lives between D4 and F♯5; the lead is soft
enough to sit up there. Quarter note = one beat; a phrase row is a sixteenth.

| Bar | Chord | Rhythm and notes | Rows (16 per bar) |
|---|---|---|---|
| 1 | Dmaj9 | quarter rest, A5 eighth, D6 eighth, E6 half tied → | 4: A5, 6: D6, 8: E6 |
| 2 | Aadd9 | → E6 quarter (tie), C♯6 eighth, B5 for 2½ beats (half tied to eighth) | 4: C♯6, 6: B5 |
| 3 | Bm9 | quarter rest, B5 eighth, C♯6 eighth, D6 half tied → | 0: OFF, 4: B5, 6: C♯6, 8: D6 |
| 4 | Gmaj9 | → D6 quarter (tie), B5 eighth, A5 for 2½ beats | 4: B5, 6: A5 |

Bars 5–8 repeat it. **Second ending** (bar 8 only): B5 eighth, A5 eighth, B5 quarter, D6 quarter,
so the line climbs toward what comes next instead of settling.

- **Character:** it rises a sixth in three notes and sinks back, and it **always comes to rest on
  the chord's ninth** (B over A, A over G), never the root. So it never quite resolves, which is
  the nostalgia. Both halves land on the off-beat ("and" of 2), a small sigh each time.
- Every note is a chord tone of its bar; it clashes with nothing.
- **Recurs:** A3, A4, the breakdown (bars 1–2 only, alone over chords and arp: just the reaching
  gesture), A5.
- **Varies:** A4 adds ornaments, a slide into the long notes (PSL) and the delayed vibrato from
  the lead's table at full depth. A5 is the only time it resolves: the final bar holds E6 and then
  steps down to **D6**, the root, for the first and only time. In the outro, that E6 → D6 is the
  last thing the lead plays.

**The B counter-line (lead).** Long notes, one per two bars, doubling the chromatic fade:
B5 (Em9, two bars), B5 (Gmaj9, two bars), **B♭5** (Gm9, two bars), A5 (Asus4 and Aadd9). Whole
notes tied across bars, the vibrato blooming on each. The step from B5 to B♭5 is the emotional
center of the song; nothing else in the lead should be busy there.

**The arp (his).** Unchanged in A. The B section needs four new phrases written his way: eighth
notes on even rows, moving through each chord's extensions rather than up a triad, leaning on the
ninths and sevenths. Over Gm9, it should touch B♭ and F, so the arp joins the fade.

### The parts and the feel of each instrument

| Part | Track | Role | Register | Rhythm | Sound | Likely M8 type | Teaches |
|---|---|---|---|---|---|---|---|
| Arp | 1 | the song's motion; his | D4–F♯5 | steady eighths, even rows | hollow triangle pluck, a soft "doong" fading to a wooden tone, a music box through a wall, a slow tape wobble | Wavsynth (Polaroid arp card) | Wavsynth wave shaping; AHD in ticks; LFO on PITCH |
| Bass | 2 | roots, the floor | G1–D2 | a held root per bar in A1; from A2, root plus a quiet octave or fifth late in the bar, slides into the next root | round, warm, felt-covered; a filtered saw with a little drive, no fizz, almost no reverb | Wavsynth (Velvet bass card) | drive after the filter (AMP + LIM); a bass that leaves the chords room |
| Chords | 3 | the harmony, rootless | A3–E5 | one chord a bar in A, two bars in B; each fades as the next arrives | wonky, slightly smeared, glassy-soft four-voice chords; digital but gentle | Macrosynth WAV PARAPHONIC (his instrument 10) | COLOR chord shapes; **relative vs absolute FX** (COL) |
| Lead | 4 | the hook and the counter-line | A5–E6 | long notes and pickups, the opposite of the arp's eighths | breathy and airy, a recorder or wooden flute on a worn cassette; a little air on the attack, vibrato that arrives late, a tiny pitch drift | Macrosynth BLOWN/FLUTED model (reed/flute physical model; it has no filter of its own) | writing a melody; PSL; **a table that shapes every note** |
| Drums | 5 | kick and snare, the backbeat | | kick on 1 and the "and" of 3, snare on 2 and 4; a short fill every fourth bar | soft and dusty: a round, short kick; a snare like a brushed rim or a muffled clap with a small room; a bit of grit, as if taped off the radio | Sampler (factory kit) | **Sampler drums** (Low Tide had none); DEGRADE; **NTH** for the fill |
| Hats | 6 | shuffle and air | | eighths, off-beats softer, swung sixteenth ghosts | closed, dull, quiet; a shaker would do | Sampler | groove on one track only |
| Faded loop | 7 | the memory: intro, breakdown, outro | an octave below the song | half-speed loop; reversed in the outro | the song's own A section, slowed to half speed so it drops an octave, dull and grainy; in the outro played backward | Sampler holding a resample | **Selection to Sample**; pitch is speed; REV; DEGRADE |

No pad: the paraphonic chords are the pad. Track 8 stays free (a DJ filter lane if the arranger
wants one).

Two production moments for the mix step: the lead's tail into the reverb's **shimmer** (6.2+), and
a **reverb freeze** (XRZ) on the outro's last chord, so the song ends on a still picture.

### What the guide will teach (10 steps)

1. **The plan and the setup.** Where his song stands (90 BPM, D major, instrument 10, phrase 10),
   what gets added, the track layout. New: *finishing a song you started*.
2. **The chords.** WAV PARAPHONIC, COLOR as a chord shape, `x0`–`x4` vs `x8`, rootless upper
   structures, and COL as a relative command from a base of 80. New: **relative vs absolute FX
   commands** (manual: Relative and Absolute FX Commands). Report-back: do A4 and C4 sound as
   named?
3. **The bass.** Velvet bass under the chords; the smoother root line; drive after the filter.
   New: *a bass voiced to leave the rootless chords room*.
4. **The arp.** His notes on the Wavsynth triangle; the AHD pluck in ticks; the tape wobble (LFO on
   pitch); why even rows ignore swing. New: **Wavsynth shaping**, LFO on PITCH.
5. **The drums.** Load a factory kit; a dusty backbeat; DEGRADE for grit; a fill every fourth bar
   with NTH. New: **Sampler drums, NTH**.
6. **The lead.** The hook: why it rests on ninths; long notes against the arp's eighths; PSL into
   the long notes; OFF to end a phrase. New: **writing a lead melody**, the physical-model shape.
7. **The lead's table.** One table that gives every note a small scoop up into pitch and a vibrato
   that only starts after the note has held a while. New: **tables for movement inside a note**
   (the FX columns doing pitch and vibrato on a clock), which the Tables page doesn't show.
8. **The B section.** Ii, IV, the borrowed iv, V; two bars a chord; the fade line in chords and
   lead; four new arp phrases; new chains. New: **a borrowed chord and a change of harmonic
   rhythm**.
9. **The faded loop.** Render the A section to a sample, play it an octave down (half speed) for
   the intro and backward for the outro, dull it. New: **resampling**, playback direction, pitch
   is speed. (The easiest step to cut if the guide runs long.)
10. **Arrange and mix.** Nine rows; the arp stepping back under the lead; the hook's one
    resolution; shimmer on the lead; reverb freeze at the end. New: **XRZ, shimmer**.

---

## Song 3: Overpass (working title)

A night song built from samples, most of which he makes himself on the M8.

- **Tempo:** 124 BPM (the parts agent may move it ±4).
- **Key:** A minor, with one bright note from A Dorian (F♯) at the turnaround, and a B section
  that steps outside the key.
- **Feel:** 2-step garage meeting deep house. Broken kick, backbeat snare, swung sixteenth hats
  (heavier swing than Low Tide's), warm chord stabs, a voice in fragments.
- **Length:** nine rows of eight bars, about 2:20; the A rows can repeat if it wants to be longer.

**Mood.** After the last train, walking under an overpass with the rain stopped. Cold concrete
and wet glass outside, warmth in the chords, a voice that only ever says half a phrase, a beat
that keeps skipping a step. Lonely but not bleak: the warm keys are the lit windows.

**References for the feel:** Burial, "Archangel" (vocal fragments as the hook, rain and crackle,
the 2-step skip); Mr. Fingers (Larry Heard), "Can You Feel It" (unhurried deep house, warm minor
chords that just sit and glow); Todd Edwards (melodies made entirely of chopped vocal snippets).

**Why this song.** FM is the M8's hardest instrument and Glass Garden's FM voice disappointed him,
so FM gets a whole song and two jobs: keys and bass. The FM synth plays one note per track; four
tracks playing one chord, then rendered to a sample, is the M8's way to FM chords, and it leads
straight into the deep-house idea of one sampled chord played on every root ("chord memory").
That makes it the sample-built song: the chords are resampled, the drums sliced, and the hook is
his own voice. The table lesson is the opposite of Song 2's: a table that advances one row per
note (TIC 00), so every stab comes out slightly different.

### Form and arrangement

| Row | Section | Kick (T1) | Snare (T2) | Hats (T3) | Bass (T4) | Stabs (T5) | Voice (T6) | Rain (T7) | DJ filter (T8) |
|---|---|---|---|---|---|---|---|---|---|
| 00 | Intro | | | | | **on**, filtered | | **on** | closed, opening |
| 01 | Build | | | **on** | **on**, sparse | on | | on | |
| 02 | A1 | **on** | **on** | on | on | on | | on | |
| 03 | A2: the hook | on | on | on | on | on | **hook** | on | |
| 04 | B | half-time | on | on | held notes | **maj9 stabs** | reversed fragments | on | |
| 05 | Breakdown | | **RET roll** in bars 7–8 | | | on | hook, first bar only | on | closes, then opens |
| 06 | A3: the peak | on | on | on | on | on | hook, ends on F♯ | on | |
| 07 | A4: dub | on | on | on | on | | hook | | |
| 08 | Outro | | | | | on, filtered | | on | closing |

During steps 2–4 tracks 5–8 temporarily hold the four FM voices that get rendered; afterward
they're cleared and take the parts above.

### Harmony

The chords are two rendered stabs, each a rootless four-voice shape **built on C**, so the note
you type names the chord: C-4 plays C-something, A-3 plays the A version. The two shapes differ
by one note:

| Stab | Built as | Rootless voicing (3, 7, 9, 5 upward) | Played on A, it's |
|---|---|---|---|
| MIN9 | Cm9 | E♭4 B♭4 D5 G5 | Am9: C G B E |
| MAJ9 | Cmaj9 | E4 B4 D5 G5 | Amaj9 (not used) |

The FM bass supplies every root.

**A section: one shape, moving in parallel.**

| Bar | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|
| Chord | Am9 | Am9 | Dm9 | Dm9 | Am9 | Am9 | Dm9 | Em9 |
| Roman | i | i | iv | iv | i | i | iv | v (Dorian) |
| Stab note | A | A | D | D | A | A | D | E |

- The shape doesn't know the key. Dm9 brings F natural; Em9 brings **F♯**, the one bright note,
  in the last bar, which lifts the loop back to Am9. (The same idea as Low Tide's C♯: one note
  from outside the key at the turnaround.)
- Parallel motion is the sound: every voice moves the same distance, so the top voice is always
  the chord's fifth (E, A, B). Choose octaves to keep the stab between about A3 and A5.

**B section: the second shape, the Aeolian lift.**

| Bars | 1–2 | 3–4 | 5–6 | 7–8 |
|---|---|---|---|---|
| Chord | Fmaj9 | Gmaj9 | Fmaj9 | Gmaj9 |
| Roman | ♭VI | ♭VII | ♭VI | ♭VII |

Then Am9 at A3. ♭VI to ♭VII to i, climbing in whole steps, is the classic lift out of a minor
key. The major-9 stab makes it warmer than the A section, the "out of the tunnel" moment.
Gmaj9's F♯ again points back to the Dorian bar.

### Themes

**The hook (voice, track 6).** Two bars. He records himself humming one long "ooh" on a single
pitch (a C, sung along to a reference tone the M8 plays), and the Sampler plays it at other
pitches. Short notes and hard cuts make it sound chopped.

| Bar | Rhythm and notes | Rows |
|---|---|---|
| 1 | E5 dotted eighth, E5 sixteenth (a stutter), eighth rest, G5 eighth, A5 quarter, eighth rest, G5 eighth | 0: E5, 3: E5, 6: G5, 8: A5, E: G5 |
| 2 | E5 dotted quarter, D5 eighth, C5 half | 0: E5, 6: D5, 8: C5 |

- **Character:** a small climb to A and a fall past where it started, landing on C (the minor
  third). Pentatonic, syncopated on the "and"s, garage phrasing. Mostly the same few pitches, so a
  single hummed note pitched around stays natural.
- **It stays put while the chords move.** Over Am9 and Dm9 every note fits unchanged (over Dm9
  it's ninth, eleventh, fifth, root, seventh). That's the lesson: the same line, re-lit by the
  chord under it.
- **Varies at bar 8 (Em9):** the final C5 would clash, so it becomes B4 the first time and **F♯5**
  at the peak (row 06), the voice joining the stab's bright note.
- **In B:** only bar 1 (E E G A), some notes played reversed, the voice drifting over the major
  chords (all four notes fit Fmaj9).
- **Breakdown:** bar 1 alone, once, over the stabs.

### The parts and the feel of each instrument

| Part | Track | Role | Register | Rhythm | Sound | Likely M8 type | Teaches |
|---|---|---|---|---|---|---|---|
| FM keys (source) | 5–8, temporary | the material the stabs are made from | E♭4–G5 | one held chord, one bar | an electric piano: a glassy tine on the attack that fades fast, a round warm body under it | FM synth, one instrument on four tracks (Glass keys card) | **FM**: algorithms, carrier vs modulator, an envelope on a modulator's level |
| Stabs | 5 | the harmony, the warmth | A3–A5 | short syncopated stabs on the 2-step grid, two or three a bar, never on every beat | warm, round, a little worn, the tine softened by rendering | Sampler holding the render | **resampling for polyphony; chord memory**; TIC 00 table |
| Bass | 4 | roots and drive | A1–A2 | syncopated, sub-heavy, rests between notes, an octave pop and a slide into the next root | round and rubbery with a soft knock at the front; deep, no buzz | FM synth | **FM again**, bass-style (low ratios, a fast envelope on the modulator); PSL |
| Kick | 1 | the skip | | beat 1 and the "and" of 3, an occasional ghost before beat 1; half-time in B | short and thumpy | Sampler, slices of a factory break or kit | **slicing**: SLICE, slice markers, lazy chop |
| Snare / clap | 2 | the backbeat | | 2 and 4; a RET roll building into row 06 | a dry clap with a short room, a rim on an off-beat | Sampler slices | RET as a build |
| Hats | 3 | the shuffle | | swung sixteenths, ghosted, velocity doing the work | crisp but quiet, a shaker under them | Sampler slices | a heavier groove than Low Tide's |
| Voice | 6 | the hook | C5–A5 (in the sample's terms) | the hook above | breathy, close, a little lo-fi; chopped, sometimes reversed | Sampler, his recording | **recording a voice; playing one note as a melody**; REV |
| Rain | 7 | the street | | one long loop | rain, traffic, wet pavement; low and dull | Sampler, FWDLOOP | reused from Low Tide's step 8, or a new recording |
| DJ filter | 8 | the builds | | | | no notes, DJC | as in Low Tide |

### What the guide will teach (10 steps)

1. **The plan and the setup.** 124 BPM, A minor, the heavier groove; the chord-memory idea and
   why the song is built from samples. New: *a plan that starts from what the M8 can't do (FM
   chords)*.
2. **One FM voice.** The Glass keys patch made and understood: algorithm, which operators you
   hear, a modulator's level as brightness, an envelope on it for the tine. New: **FM synthesis**.
3. **Four tracks, one chord.** The same FM instrument on tracks 5–8, one note each, one bar of
   Cm9 built on C; then the Cmaj9 bar. New: *polyphony from mono tracks*.
4. **Render the chords.** Selection to Sample (QUICK RENDER), then in the sample editor: crop,
   normalize, mono and 16-bit for the pitch limit, a short fade; clear the four tracks. New:
   **resampling** and preparing a sample.
5. **Chord memory.** The stab on A, D, E: the progression from one shape; the stab rhythm; why
   building on C keeps the names right. New: **parallel chords from one sample**.
6. **The drums.** Slice a factory break or kit (SLICE, markers, lazy chop) and re-sequence it as
   2-step; a heavier groove; RET for the build. New: **slicing; RET**.
7. **A table that counts.** TIC 00 on the stab: the table moves one row per stab, so stabs cycle
   through slightly different brightness, volume and tuning, like a hand on keys; a three-row
   cycle against a bar so it never lines up the same way twice. New: **trigger-based tables**.
8. **The FM bass.** A second FM patch for the low end; the syncopated line; slides. New: **FM for
   bass**.
9. **The voice.** Record a hummed note with the M8's mic; tune it; play the hook; short cuts for
   the chopped sound; reversed fragments for B. New: **recording a voice and playing it as a
   melody**.
10. **Arrange and mix.** Nine rows; the half-time B; the breakdown build with DJC and the RET
    roll; mono low end under the stabs. New: *arranging a beat-led track*.

---

## Open questions for Andrew

1. **Song 2's B section borrows a minor chord** (Gmaj9 → Gm9, the fade). Keep it, or stay all in
   D major (the chat's softer iii, F♯m7, instead)?
2. **Song 3 is a turn:** faster and beat-led (124 BPM, 2-step / deep house) after two slow songs.
   Is that welcome, or would he rather a third slow one?
3. **Song 3's hook is his own voice**, hummed into the M8. Up for it? If not, the fallback is the
   Macrosynth VOWEL FOF model rendered to a sample and chopped the same way.
4. **His Faded Polaroid file:** a photo of its song view and chain screens, so the pages can use
   his track, chain and phrase numbers instead of new ones.

## Not settled (each becomes an Unverified box)

- The WAV PARAPHONIC shape names for `A4`, `C4` and `D4` come from the Braids source and the chat,
  not his ears.
- The BLOWN/FLUTED model's name on 6.6.3's SHAPE list and whether it speaks without a long note
  (the manual says the bowed model needs a gate; it doesn't say for blown).
- Whether PIT and PVB in a table's FX columns behave as they do in a phrase (the manual says
  table FX columns are "identical" but "some commands have a different behavior").
- One FM instrument on four tracks giving four independent voices (expected, not checked).
- Whether QUICK RENDER keeps a note's tail past the selection's end (likely: select an extra empty
  bar).
- The Sampler pitch limit above C-4 for the stabs and the voice; the stab may need to be mono
  16-bit.
- C-4 playing a sample at its own pitch (already an open check on the Sampling page).
- Tables ignore the groove. TIC 00 is safe (the phrase's swung notes trigger it); a time-based
  table on a swung part would run straight.
- NTH's exact counting (the manual defers to the help line).

---

## Handoff to the parts agent

**Fixed (don't change without asking):** titles, tempos, keys; the forms and the arrangement
maps; the chord progressions, Roman numerals and voicing intent; his A-section chords and arp
exactly as in the chat and `site/guides/m8/patches/faded-polaroid.json`; the hooks' notes and
rhythms as given above; the instrument types; the track layout; what each step teaches.

**Yours to decide:** every phrase in full (bass lines, drum patterns, stab rhythms, B-section arp
phrases, fills, the lead's ornaments, the voice's reversed fragments); octave placement within
the stated registers; velocities; which FX commands carry the musical gestures (PSL, CHA, NTH,
RET, OFF placement, REV on a row); chain and phrase numbers; whether an A row repeats to lengthen
a song; the bass-root suggestion for Faded Polaroid. Flag any place where you think the plan is
musically wrong; don't silently fix it.

**Not yours:** instrument parameter values, mod slots, table contents' values, groove tick values
(the settings agent), and anything under `site/` (the builder).

### Format: one parts sheet per song

Write `docs/songs/faded-polaroid-parts.md` and `docs/songs/overpass-parts.md`. Mark them DRAFT.
Each holds:

1. **Header:** title, tempo, key, groove intent (which tracks swing), track list
   (number, name, instrument number and name).
2. **Instruments used:** number, name, type, and one line of character. No values.
3. **Harmony table:** bar, chord, Roman numeral, bass, upper structure, a note on the move, the
   step it arrives in (the same fields as Low Tide's `harmony` list).
4. **Song rows:** row, chain per track, the step it arrives in, one line saying what happens.
5. **Chains:** number, the phrases in order, a TSP column where used, the step each arrives in.
6. **Phrases.** One block each. A heading with number, track, chord and step; then a
   staff-readable line; then the M8's own columns, rows in hex 0–F, only the rows that hold
   something:

```
### Phrase 40 · track 4 lead · Dmaj9, hook bar 1 · step 6

Staff: | 𝄽 quarter | A5 eighth  D6 eighth | E6 half (tied into the next bar) |

| Row | N   | V  | I  | FX1    | FX2 | FX3 | Step | Note |
|-----|-----|----|----|--------|-----|-----|------|------|
| 4   | A-5 | 50 | 03 |        |     |     | 6    |      |
| 6   | D-6 | 58 | 03 |        |     |     | 6    |      |
| 8   | E-6 | 60 | 03 | PSL 04 |     |     | 6    | slide into the long note |
```

   Note names the M8 way (`D-6`, `F#4`, `OFF`); velocity and FX values in hex. In a Step
   column, an FX that arrives later than its note gets that step after it (`PSL 04 @7`). Add
   `until N` where a row is replaced in a later step (Low Tide's roots to bassline).
7. **Tables** (Song 2's lead, Song 3's stab): rows with N, V, FX1–3 and what each row does in
   words; the settings agent fills in values you leave as `??`.

The builder turns these into `site/guides/m8/songs/<id>.json` with a generator in the style of
`tools/m8_low_tide.py` (`tools/m8_faded_polaroid.py`, `tools/m8_overpass.py`). Note for them: the
JSON keys rows in **decimal** (row 0A is `"10"`), as Low Tide's generator does, and every element
carries `step` and optional `until`. The settings agent writes
`docs/songs/<id>-instruments.md` in the patch-card shape: parameters as the screen shows them,
mods, tables, each value either from his device or under an Unverified line.
