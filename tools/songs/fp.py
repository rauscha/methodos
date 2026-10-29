import sys
sys.path.insert(0, sys.path[0])
from common import *

P = {}
def ph(num, *a, **k):
    P[num] = Phrase(num, *a, **k)

# ---------------- track 1: the arp (instrument 01)
his = {
    "10": ("Dmaj9, his bar 1", ["D-4", "A-4", "E-5", "F#4", "C#5", "A-4", "F#4", "E-5"]),
    "11": ("Aadd9, his bar 2", ["C#4", "E-4", "B-4", "A-4", "C#5", "E-4", "B-4", "E-5"]),
    "12": ("Bm9, his bar 3", ["B-3", "F#4", "C#5", "D-4", "A-4", "F#4", "D-5", "C#5"]),
    "13": ("Gmaj9, his bar 4", ["G-3", "D-4", "A-4", "B-4", "F#5", "D-4", "B-4", "A-4"]),
}
for num, (title, notes) in his.items():
    ph(num, 1, title, 4, [Row(2 * k, n, "60" if k % 2 == 0 else "48", "01") for k, n in enumerate(notes)])
P["10"].about = "His phrases 10 to 13, unchanged: eighth notes on even rows, velocity 60 on the beat and 48 off it."

back = {"14": "10", "15": "11", "16": "12", "17": "13"}
for num, src in back.items():
    rows = []
    for k, n in enumerate(his[src][1]):
        r = 2 * k
        rows.append(Row(r, n, "3C" if k % 2 == 0 else "2C", "01",
                        fx=["CHA 8F"] if r in (6, 14) else [],
                        note="drops out about half the time" if r in (6, 14) else ""))
    ph(num, 1, his[src][0].replace("his bar", "stepped back, bar"), 10, rows)
P["14"].about = ("His notes, his register, quieter and sparser, for the rows where the lead plays. "
                 "CHA 8F on the off-beat rows 6 and E: the note has a little over half a chance; the FX always run.")

newarp = {
    "18": ("Em9, B section bars 1–2", ["E-4", "B-4", "F#5", "G-4", "D-5", "B-4", "G-4", "F#5"], False,
           "His bar-1 shape (root, fifth, ninth, third, seventh, fifth, third, ninth) moved onto E."),
    "19": ("Gmaj9, B section bars 3–4", ["B-3", "F#4", "A-4", "D-4", "F#5", "A-4", "B-4", "F#4"], False,
           "Starts on the third and leans on the seventh (F♯) and the ninth (A). B is the top of the fade line."),
    "1A": ("Gm9, B section bars 5–6", ["A#3", "F-4", "A-4", "D-4", "F-5", "A-4", "A#4", "F-4"], True,
           "Phrase 19 with two notes lowered a half step: B to B♭, F♯ to F. The arp fades with the chord."),
    "1B": ("Asus4, B section bar 7", ["A-3", "E-4", "A-4", "D-5", "E-5", "A-4", "E-4", "D-4"], False,
           "Ends on D4, which falls to his C♯4 on the next downbeat (phrase 11): the sus resolves in the arp too."),
}
for num, (title, notes, flats, about) in newarp.items():
    ph(num, 1, title, 8, [Row(2 * k, n, "60" if k % 2 == 0 else "48", "01") for k, n in enumerate(notes)],
       flats=flats, about=about)

# ---------------- track 2: the bass (instrument 02)
for num, n, t in [("20", "D-2", "Dmaj9 root"), ("21", "A-1", "Aadd9 root"), ("22", "B-1", "Bm9 root"), ("23", "G-1", "Gmaj9 root")]:
    ph(num, 2, t + ", A1", 3, [Row(0, n, "70", "02")])
P["20"].about = "One root a bar. 21 and 23 are an octave below the patch card's (A1 and G1, not A2 and G2): see the bass note above."

def fig(num, title, root, pop, appr, step, about="", appr_note=""):
    rows = [Row(0, root, "70", "02", fx=["PSL 02"], note="a quick scoop from the note before"),
            Row(10, pop, "24", "02", note="the octave, quiet, with the kick")]
    if appr:
        rows.append(Row(14, appr, "30", "02", note=appr_note))
    ph(num, 2, title, step, rows, about=about)

fig("24", "Dmaj9, A2 on", "D-2", "D-3", "B-1", 5, about="Root, a quiet octave on the “and” of 3, and a step into the next root.", appr_note="a passing step down to A")
fig("25", "Aadd9, A2 on (also B bar 8)", "A-1", "A-2", "C#2", 5, appr_note="the third; steps down to B, or up to D after the B section")
fig("26", "Bm9, A2 on", "B-1", "B-2", "A-1", 5, appr_note="the seventh; steps down to G")
fig("27", "Gmaj9, A2 on", "G-1", "G-2", "E-2", 5, appr_note="a passing step down to D")
fig("28", "Gmaj9, last bar before B", "G-1", "G-2", "F#1", 8, appr_note="the seventh; steps down to the B section's E")
fig("29", "Gmaj9, last bar before the breakdown", "G-1", "G-2", None, 10, about="No approach note: nothing follows it.")
ph("2A", 2, "Em9, B bar 1", 8, [Row(0, "E-1", "68", "02", fx=["PSL 02"]), Row(10, "E-2", "24", "02")],
   about="The B section's lowest note. The roots climb from here: E, G, A, then D.")
ph("2B", 2, "Em9, B bar 2", 8, [Row(0, "B-1", "40", "02", note="the fifth, softer"), Row(14, "F#1", "30", "02", note="the ninth; steps up to G")])
ph("2C", 2, "G, B bars 3 and 5 (Gmaj9 and Gm9)", 8, [Row(0, "G-1", "68", "02", fx=["PSL 02"]), Row(10, "G-2", "24", "02")],
   about="The same bar under both G chords: the bass doesn't move while the chord darkens above it.")
ph("2D", 2, "Gmaj9, B bar 4", 8, [Row(0, "D-2", "40", "02", note="the fifth"), Row(8, "G-1", "38", "02")])
ph("2E", 2, "Gm9, B bar 6", 8, [Row(0, "D-2", "40", "02"), Row(14, "A#1", "30", "02", note="B♭ falls to A: the fade line, in the bass")], flats=True)
ph("2F", 2, "Asus4, B bar 7", 8, [Row(0, "A-1", "68", "02", fx=["PSL 02"]), Row(8, "A-1", "38", "02", note="a soft repeat; no octave, so bar 8's scoop is a unison")])

# ---------------- track 3: chords (his instrument 10)
for num, n, col, t, step in [("30", "F#4", "B4", "Dmaj9: F♯m7 shape (34)", 2), ("31", "A-3", "24", "Aadd9: add9 shape (A4)", 2),
                             ("32", "D-4", "44", "Bm9: maj7 shape (C4)", 2), ("33", "B-3", "B4", "Gmaj9: m7 shape (34)", 2),
                             ("34", "G-3", "44", "Em9: maj7 shape (C4) on G", 8), ("35", "A#3", "44", "Gm9: maj7 shape (C4) on B♭", 8),
                             ("36", "A-3", "54", "Asus4: sus4 + octave shape (D4)", 8)]:
    ph(num, 3, t, step, [Row(0, n, "60", "10", fx=[f"COL {col}"])], flats=(num == "35"))
P["30"].about = "His phrases 30 to 33 (one chord a bar). COL is relative: COLOR 80 plus the value."
P["36"].about = "D4 is the one new COLOR target. Unverified: it comes from the Braids table, not his ears."
ph("3D", 3, "Dmaj9 again, softer (outro)", 10, [Row(0, "F#4", "40", "10", fx=["COL B4"])])
ph("3E", 3, "OFF (outro)", 10, [Row(0, "OFF")], about="Ends the held chord before the reversed loop's A chord.")
ph("3F", 3, "empty", 2, [], about="Empty on purpose: the chord keeps fading through this bar.")

# ---------------- track 4: the lead (instrument 04)
ph("40", 4, "Dmaj9, hook bar 1", 6, [Row(0, "OFF", note="ends the note before, if any"),
     Row(4, "A-5", "50", "04"), Row(6, "D-6", "58", "04"), Row(8, "E-6", "60", "04", fx=["PSL 04"], note="slide into the long note")],
   tie_out=True)
ph("41", 4, "Aadd9, hook bar 2", 6, [Row(4, "C#6", "54", "04"), Row(6, "B-5", "50", "04", note="lands on the ninth, on the “and” of 2")],
   tie_in="E6", tie_out=True)
ph("42", 4, "Bm9, hook bar 3", 6, [Row(0, "OFF"), Row(4, "B-5", "50", "04"), Row(6, "C#6", "58", "04"),
     Row(8, "D-6", "60", "04", fx=["PSL 04"], note="slide into the long note")], tie_out=True)
ph("43", 4, "Gmaj9, hook bar 4", 6, [Row(4, "B-5", "54", "04"), Row(6, "A-5", "50", "04", note="lands on the ninth again")],
   tie_in="D6", tie_out=True)
ph("44", 4, "Gmaj9, second ending (bar 8)", 6, [Row(4, "B-5", "50", "04"), Row(6, "A-5", "4C", "04"),
     Row(8, "B-5", "54", "04"), Row(12, "D-6", "5C", "04", note="climbs toward what comes next")], tie_in="D6", tie_out=True)
ph("45", 4, "Dmaj9, hook bar 1 varied (A4)", 7, [Row(0, "OFF"), Row(2, "F#5", "40", "04", note="new pickup"),
     Row(4, "A-5", "50", "04"), Row(6, "D-6", "58", "04"),
     Row(8, "E-6", "64", "04", fx=["PSL 06", "TBL 81"], note="slower slide; the deep table")], tie_out=True)
ph("46", 4, "Aadd9, hook bar 2 varied", 7, [Row(4, "C#6", "54", "04"), Row(5, "D-6", "38", "04", note="upper neighbor, a sixteenth"),
     Row(6, "B-5", "50", "04", fx=["PSL 02", "TBL 81"], note="a small fall into the ninth")], tie_in="E6", tie_out=True)
ph("47", 4, "Bm9, hook bar 3 varied", 7, [Row(0, "OFF"), Row(2, "A-5", "40", "04", note="new pickup"), Row(4, "B-5", "50", "04"),
     Row(6, "C#6", "58", "04"), Row(8, "D-6", "64", "04", fx=["PSL 06", "TBL 81"])], tie_out=True)
ph("48", 4, "Gmaj9, hook bar 4 varied", 7, [Row(4, "B-5", "54", "04"),
     Row(6, "A-5", "50", "04", fx=["PSL 03", "TBL 81"], note="a small fall into the ninth")], tie_in="D6", tie_out=True)
ph("49", 4, "Gmaj9, the resolution (A5 bar 8)", 10, [Row(4, "B-5", "50", "04"), Row(6, "A-5", "4C", "04"),
     Row(8, "E-6", "5C", "04", note="held into the outro, where it steps down to D6")], tie_in="D6", tie_out=True)
ph("4A", 4, "B5, counter-line (B bars 1 and 3)", 8, [Row(0, "B-5", "50", "04", note="held two bars; the vibrato blooms")], tie_out=True)
ph("4B", 4, "B♭5, counter-line (B bar 5)", 8, [Row(0, "A#5", "4C", "04", fx=["PSL 0C"], note="sags from B: the fade")], tie_out=True, flats=True)
ph("4C", 4, "A5, counter-line (B bar 7)", 8, [Row(0, "A-5", "48", "04", fx=["PSL 0C"], note="sags again, into the dominant")], tie_out=True)
ph("4D", 4, "Dmaj9, the reach (breakdown)", 10, [Row(0, "OFF"), Row(4, "A-5", "48", "04", fx=["TBL 04"], note="back to the lead's own table"),
     Row(6, "D-6", "54", "04"), Row(8, "E-6", "5C", "04", fx=["PSL 04"])], tie_out=True)
ph("4E", 4, "D6, the last note (outro)", 10, [Row(0, "D-6", "58", "04", note="the root, the first and only time")], tie_out=True)

# ---------------- track 5: kick 05 + snare 06; track 6: hat 07
DR = {("C-4", "05"): "kick", ("C-4", "06"): "snare", ("C-4", "07"): "hat"}
def drums(num, title, step, kick, snare, fill, nth, about=""):
    rows = []
    for r, v in kick:
        rows.append((r, Row(r, "C-4", v, "05", fx=["GRV 01"] if r == 0 else [])))
    for r, v in snare:
        rows.append((r, Row(r, "C-4", v, "06")))
    for r, v in fill:
        rows.append((r, Row(r, "C-4", v, "06", fx=["NTH 40"] if nth else [], note="fill: every fourth pass" if nth else "fill")))
    rows = [x for _, x in sorted(rows, key=lambda t: t[0])]
    ph(num, 5, title, step, rows, drum={}, about=about)
    P[num].drum = None
    P[num].staff_override = None
    P[num].drum = {}
fill = [(13, "18"), (14, "28"), (15, "3C")]
drums("50", "A drums", 5, [(0, "70"), (10, "58")], [(4, "60"), (12, "60")], fill, True,
      about="Kick on 1 and the “and” of 3, snare on 2 and 4. Rows D, E, F hold a fill that NTH lets through only every fourth bar.")
drums("51", "A drums with the fill (fallback for NTH)", 5, [(0, "70"), (10, "58")], [(4, "60"), (12, "60")], fill, False,
      about="Only if NTH doesn't count as hoped: phrase 50 without the NTH, written out for bars 4 and 8.")
drums("52", "B drums, lighter", 8, [(0, "60")], [(4, "40"), (12, "40")], [], False,
      about="One kick, a softer backbeat.")
drums("53", "B drums, last bar", 8, [(0, "60")], [(4, "40"), (12, "40")], fill, False, about="The fill leads back into A4.")
hat = [(0, "48"), (2, "24"), (3, "10"), (4, "48"), (6, "24"), (8, "48"), (10, "24"), (11, "10"), (12, "48"), (14, "24")]
ph("60", 6, "hats", 5, [Row(r, "C-4", v, "07", fx=["GRV 01"] if r == 0 else [],
                         note="swung ghost" if r in (3, 11) else ("off-beat, softer" if r % 4 == 2 else ""))
                     for r, v in hat], drum={})
for k in ("50", "51", "52", "53"):
    P[k].drum = {("C-4", "05"): "kick", ("C-4", "06"): "snare"}
P["60"].drum = {"C-4": "hat"}

# ---------------- track 7: the faded loop; track 8: freeze
ph("70", 7, "the memory (intro)", 9, [Row(0, "C-3", "60", "09", note="an octave down = half speed: 4 bars become 8")],
   tie_out=True, about="One note plays the whole 8-bar song row.")
ph("71", 7, "the memory, low (breakdown)", 10, [Row(0, "C-3", "40", "09")], tie_out=True)
ph("72", 7, "the memory, backward (outro)", 9, [Row(0, "C-3", "50", "0A", note="instrument 0A: 09 cloned, PLAY REV")], tie_out=True)
ph("80", 8, "thaw (song start)", 10, [Row(0, fx=["XRZ 00"], note="turns the freeze off if the song loops")], staff="| no notes |")
ph("81", 8, "freeze (outro bar 8)", 10, [Row(8, fx=["XRZ FF"], note="any value above 00 freezes")], staff="| no notes |")
ph("FD", "any", "OFF", 10, [Row(0, "OFF")], about="Shared: an OFF on row 0 stops whatever the track was playing.")
ph("FE", "any", "empty", 8, [], about="Shared: empty. A held note keeps sounding through it.")

VO = {"30": "F♯4 A4 C♯5 E5", "31": "A3 C♯4 E4 B4", "32": "D4 F♯4 A4 C♯5", "33": "B3 D4 F♯4 A4",
      "34": "G3 B3 D4 F♯4", "35": "B♭3 D4 F4 A4", "36": "A3 D4 E4 A4", "3D": "F♯4 A4 C♯5 E5"}
for k, v in VO.items():
    P[k].staff_override = f"| {staff_name(P[k].rows[0].n, P[k].flats)} whole, fading (sounds {v}) |"
for k in ("3F", "FE"):
    P[k].staff_override = "| no new note (whatever is sounding carries on) |"
P["FD"].staff_override = "| rest whole (the OFF on row 0 stops the note) |"
P["3E"].staff_override = "| rest whole (OFF on row 0) |"
for k in ("70", "71", "72"):
    P[k].staff_override = "| C3, held eight bars: one note plays the whole song row |"
P["50"].staff_override = P["51"].staff_override = "| kick 1, 3& · snare 2, 4 · fill (soft snares) 4e, 4&, 4a |"
P["53"].staff_override = "| kick 1 · snare 2, 4 · fill (soft snares) 4e, 4&, 4a |"

C = {
    "01": ["10", "11", "12", "13"] * 2, "11": ["14", "15", "16", "17"] * 2,
    "12": ["18", "18", "19", "19", "1A", "1A", "1B", "11"], "13": ["10", "10", "11", "11", "12", "12", "13", "13"],
    "02": ["20", "21", "22", "23"] * 2, "21": ["24", "25", "26", "27"] * 2,
    "22": ["24", "25", "26", "27", "24", "25", "26", "28"], "23": ["24", "25", "26", "27", "24", "25", "26", "29"],
    "24": ["2A", "2B", "2C", "2D", "2C", "2E", "2F", "25"], "25": ["20"] + ["FE"] * 7,
    "03": ["30", "31", "32", "33"] * 2, "31": ["34", "3F", "33", "3F", "35", "3F", "36", "31"],
    "32": ["30", "3F", "31", "3F", "32", "3F", "33", "3F"], "33": ["30", "3F", "3D", "3F", "3E", "3F", "3F", "3F"],
    "04": ["40", "41", "42", "43", "40", "41", "42", "44"], "41": ["4A", "FE", "4A", "FE", "4B", "FE", "4C", "FE"],
    "42": ["45", "46", "47", "48", "45", "46", "47", "44"], "43": ["FD", "4D", "41", "FE", "FD", "FE", "FE", "FE"],
    "44": ["40", "41", "42", "43", "40", "41", "42", "49"], "45": ["4E", "FE", "FD", "FE", "FE", "FE", "FE", "FE"],
    "05": ["50"] * 8, "51": ["52"] * 7 + ["53"], "06": ["60"] * 8,
    "07": ["70"] + ["FE"] * 7, "71": ["71"] + ["FE"] * 7, "72": ["72"] + ["FE"] * 7,
    "80": ["80"] + ["FE"] * 7, "81": ["FE"] * 7 + ["81"],
}
SONG = [
    ("00", {7: "07", 8: "80"}),
    ("01", {1: "01", 2: "02", 3: "03"}),
    ("02", {1: "01", 2: "21", 3: "03", 5: "05", 6: "06"}),
    ("03", {1: "11", 2: "22", 3: "03", 4: "04", 5: "05", 6: "06"}),
    ("04", {1: "12", 2: "24", 3: "31", 4: "41", 5: "51", 6: "06"}),
    ("05", {1: "11", 2: "23", 3: "03", 4: "42", 5: "05", 6: "06"}),
    ("06", {1: "13", 3: "32", 4: "43", 7: "71"}),
    ("07", {1: "11", 2: "21", 3: "03", 4: "44", 5: "05", 6: "06"}),
    ("08", {2: "25", 3: "33", 4: "45", 7: "72", 8: "81"}),
]
CH = {
    "Dmaj9": chord_set("D F# A C# E"), "Aadd9": chord_set("A C# E B"), "Bm9": chord_set("B D F# A C#"),
    "Gmaj9": chord_set("G B D F# A"), "Em9": chord_set("E G B D F#"), "Gm9": chord_set("G A# D F A"),
    "Asus4": chord_set("A D E"),
}
A = ["Dmaj9", "Aadd9", "Bm9", "Gmaj9"] * 2
HARM = {"01": A, "02": A, "03": A, "05": A, "07": A,
        "04": ["Em9", "Em9", "Gmaj9", "Gmaj9", "Gm9", "Gm9", "Asus4", "Aadd9"],
        "06": ["Dmaj9", "Dmaj9", "Aadd9", "Aadd9", "Bm9", "Bm9", "Gmaj9", "Gmaj9"],
        "08": ["Dmaj9", "Dmaj9", "Dmaj9", "Dmaj9", None, None, None, None]}
ALLOWED = {
    ("24", 14): "B over Dmaj9, the sixth: a quiet passing step to A on the last eighth",
    ("27", 14): "E over Gmaj9, the sixth: a quiet passing step to D on the last eighth",
    ("49", 8): "E6 over Gmaj9, the thirteenth: held two beats, resolves to D6 over Dmaj9 at the outro",
    ("46", 5): "D6 over Aadd9, a sixteenth upper neighbor between C♯6 and B5 (A4 only)",
}

CORDER = ["01", "11", "12", "13", "02", "21", "22", "23", "24", "25", "03", "31", "32", "33",
          "04", "41", "42", "43", "44", "45", "05", "51", "06", "07", "71", "72", "80", "81"]
CTRACK = {k: (k[0] if k[0] != "0" else k[1]) for k in CORDER}
CTRACK.update({"01": "1", "02": "2", "03": "3", "04": "4", "05": "5", "06": "6", "07": "7", "80": "8", "81": "8",
               "11": "1", "12": "1", "13": "1", "71": "7", "72": "7"})
CSTEP = {"01": 4, "11": 10, "12": 8, "13": 10, "02": 3, "21": 5, "22": 8, "23": 10, "24": 8, "25": 10, "03": 2,
         "31": 8, "32": 10, "33": 10, "04": 6, "41": 8, "42": 7, "43": 10, "44": 10, "45": 10, "05": 5, "51": 8,
         "06": 5, "07": 9, "71": 10, "72": 9, "80": 10, "81": 10}
CDESC = {"01": "his arp, twice", "11": "his arp stepped back, under the lead", "12": "the B arp: two bars a chord, his bar 2 at the end",
         "13": "his arp at the memory's speed: each bar twice", "02": "roots, one a bar (A1)",
         "21": "the figure: root, octave, a step into the next root", "22": "the figure, ending on F♯1 into the B section's E1",
         "23": "the figure, ending with no step (the breakdown has no bass)", "24": "the B bass: E, G, G, A, with B♭ falling to A",
         "25": "one D2 under the outro's held chord", "03": "his chords, twice", "31": "the B chords, two bars each, the borrowed Gm9 in bars 5–6",
         "32": "his chords at the memory's speed, two bars each", "33": "Dmaj9 twice, then OFF", "04": "the hook, with the second ending",
         "41": "the counter-line: B, B, B♭, A", "42": "the hook varied: pickups, a turn, slower slides, the deep table",
         "43": "the reach once, left hanging", "44": "the hook, resolving at the very end", "45": "the last note, D6",
         "05": "the backbeat; NTH lets the fill through every fourth bar (fallback: 50 50 50 51 50 50 50 51)",
         "51": "lighter drums, a fill at the end", "06": "hats", "07": "the memory, once, eight bars long", "71": "the memory, quieter",
         "72": "the memory backward", "80": "XRZ 00 at the top of the song", "81": "XRZ in the last bar"}

if __name__ == "__main__":
    what = sys.argv[1] if len(sys.argv) > 1 else "check"
    if what == "md":
        order = sorted((k for k in P if k not in ("FD", "FE")), key=lambda k: int(k, 16)) + ["FD", "FE"]
        for k in order:
            print(P[k].md())
    else:
        u, e = check(SONG, C, P, CH, HARM, ALLOWED, skip_tracks=(5, 6, 7, 8))
        print("UNEXPECTED:", *u, sep="\n  ")
        print("EXPECTED:", *e, sep="\n  ")
        caps = {1: 4, 2: 10, 3: 32, 4: 32}
        for row in ["03", "04", "05", "06", "07", "08"]:
            g = sounding(SONG, C, P, caps, row)
            cl = close_clashes(g, 4, (1, 2, 3))
            print(row, "lead half-step/m9 clashes:", cl)
        # top voice and bass lines
        print("staff samples:")
        for k in ["40", "41", "44", "24", "4B", "1A"]:
            print(k, P[k].staff())

THEADS = {"1": "Track 1: the arp (instrument 01)", "2": "Track 2: the bass (instrument 02)",
          "3": "Track 3: the chords (instrument 10)", "4": "Track 4: the lead (instrument 04)",
          "5": "Track 5: kick and snare (instruments 05 and 06)", "6": "Track 6: hats (instrument 07)",
          "7": "Track 7: the faded loop (instruments 09 and 0A)", "8": "Track 8: the reverb freeze (no instrument)",
          "shared": "Shared phrases (any track)"}
