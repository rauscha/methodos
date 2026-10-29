import sys
sys.path.insert(0, sys.path[0])
from common import *

P = {}
def ph(num, *a, **k):
    P[num] = Phrase(num, *a, **k)

# ---------------- FM keys, temporary on tracks 5-8 (instrument 0A)
for num, t, n, title in [("90", 5, "D#4", "Cm9 voice 1: the third"), ("91", 6, "A#4", "Cm9 voice 2: the seventh"),
                         ("92", 7, "D-5", "Cm9 voice 3: the ninth"), ("93", 8, "G-5", "Cm9 voice 4: the fifth"),
                         ("94", 5, "E-4", "Cmaj9 voice 1: the third"), ("95", 6, "B-4", "Cmaj9 voice 2: the seventh"),
                         ("96", 7, "D-5", "Cmaj9 voice 3: the ninth"), ("97", 8, "G-5", "Cmaj9 voice 4: the fifth")]:
    ph(num, t, title, 3, [Row(0, n, "60", "0A")], flats=num in ("90", "91"), until=4)
P["90"].about = "One note per track, all four on instrument 0A at the same moment. The envelope lets each ring out over the bar."

# ---------------- track 1 kick (01), track 2 clap/rim (02), track 3 hats/shaker (03): slices of one kit
KIT = {"C-1": "kick", "D-1": "clap", "D#1": "rim", "E-1": "hat", "F-1": "open hat", "F#1": "shaker"}
ph("10", 1, "kick, 2-step", 6, [Row(0, "C-1", "70", "01"), Row(10, "C-1", "60", "01")], drum=KIT,
   about="Beat 1 and the “and” of 3. Nothing on beat 3: that gap is the skip.")
ph("11", 1, "kick, with a ghost", 6, [Row(0, "C-1", "70", "01"), Row(10, "C-1", "60", "01"),
     Row(15, "C-1", "24", "01", note="a ghost just before beat 1")], drum=KIT)
ph("12", 1, "kick, half-time (B)", 10, [Row(0, "C-1", "70", "01")], drum=KIT)
ph("13", 1, "kick, half-time with a ghost (B)", 10, [Row(0, "C-1", "70", "01"), Row(15, "C-1", "24", "01")], drum=KIT)
ph("20", 2, "clap", 6, [Row(4, "D-1", "64", "02"), Row(12, "D-1", "64", "02")], drum=KIT)
ph("21", 2, "clap and rim", 6, [Row(4, "D-1", "64", "02"), Row(11, "D#1", "2C", "02", note="rim, swung, right after the kick"),
     Row(12, "D-1", "64", "02")], drum=KIT)
roll = [Row(r, "D-1", v, "02") for r, v in zip(range(0, 16, 2), ["14", "18", "1C", "20", "24", "28", "2C", "30"])]
ph("22", 2, "the build, bar 7 (breakdown)", 6, roll, drum=KIT, about="Eighth-note claps getting louder.")
ph("23", 2, "the build, bar 8 (breakdown)", 6, [Row(0, "D-1", "30", "02", fx=["RET 96"], note="retrigs every 6 ticks (sixteenths), a little louder each time"),
     Row(8, "D-1", "40", "02", fx=["RET A3"], note="every 3 ticks (thirty-seconds), louder faster"),
     Row(14, fx=["KIL 00"], note="an eighth of silence before the drop")], drum=KIT)
ph("24", 2, "clap, half-time (B)", 10, [Row(8, "D-1", "64", "02", note="beat 3"), Row(14, "D#1", "28", "02")], drum=KIT)
hat = []
for r in range(16):
    if r % 2:
        hat.append(Row(r, "F#1", "1C" if r % 4 == 3 else "14", "03"))
    else:
        hat.append(Row(r, "E-1", "48" if r % 4 == 2 else ("28" if r % 8 == 0 else "24"), "03"))
ph("30", 3, "hats and shaker", 6, hat, drum=KIT,
   about="Closed hat on the even rows (off-beat eighths loud), shaker on the odd rows (the swung ones), very quiet. Velocity does the work.")
hat2 = [x for x in hat if x.r not in (14, 15)] + [Row(14, "F-1", "40", "03", note="open hat; rings over row F")]
hat2.sort(key=lambda x: x.r)
ph("31", 3, "hats, open hat at the end", 6, hat2, drum=KIT)

# ---------------- track 4: FM bass (04; 0B is a sustaining clone for B)
ph("40", 4, "Am9, bar a", 8, [Row(0, "A-1", "70", "04"), Row(7, "A-1", "4C", "04", note="swung, between the claps"),
     Row(13, "A-2", "38", "04", note="the octave pop")],
   about="Root with the kick, a swung repeat, an octave pop. Short notes; the rests are part of the line.")
ph("41", 4, "Am9, bar b, slides to D", 8, [Row(0, "A-1", "64", "04"), Row(9, "A-1", "48", "04"),
     Row(14, "D-2", "54", "04", fx=["PSL 03"], note="arrives an eighth early, sliding up")])
ph("42", 4, "Dm9, bar a", 8, [Row(0, "D-2", "70", "04"), Row(7, "D-2", "4C", "04"), Row(13, "D-3", "38", "04")])
ph("43", 4, "Dm9, bar b, slides to A", 8, [Row(0, "D-2", "64", "04"), Row(9, "D-2", "48", "04"),
     Row(14, "A-1", "54", "04", fx=["PSL 03"], note="slides down a fourth")])
ph("44", 4, "Dm9, bar 7, slides to E", 8, [Row(0, "D-2", "70", "04"), Row(7, "D-2", "4C", "04"),
     Row(14, "E-2", "54", "04", fx=["PSL 03"], note="slides up a step")])
ph("45", 4, "Em9, bar 8, slides home", 8, [Row(0, "E-2", "64", "04"), Row(9, "E-2", "48", "04"),
     Row(14, "A-1", "54", "04", fx=["PSL 03"], note="slides down a fifth, home")])
ph("46", 4, "A root (build)", 10, [Row(0, "A-1", "60", "04")])
ph("47", 4, "D root (build)", 10, [Row(0, "D-2", "60", "04")])
ph("48", 4, "E root (build)", 10, [Row(0, "E-2", "60", "04")])
ph("49", 4, "F, held (B)", 10, [Row(0, "F-2", "64", "0B", note="instrument 0B: sustains until the next note")], tie_out=True)
ph("4A", 4, "G, held (B)", 10, [Row(0, "G-2", "64", "0B", fx=["PSL 06"], note="slides up from F")], tie_out=True)
ph("4C", 4, "OFF at the end of B", 10, [Row(12, "OFF")], tie_in="G2")

for k in ["40","41","42","43","44","45","46","47","48"]:
    P[k].cap = 2
# ---------------- track 5: stabs (05 = MIN9 render, 08 = MAJ9 render)
STABN = {("A-3", "05"): "Am9", ("D-4", "05"): "Dm9", ("E-4", "05"): "Em9", ("F-3", "08"): "Fmaj9", ("G-3", "08"): "Gmaj9"}
def stab(num, title, step, hits, inst="05", about=""):
    ph(num, 5, title, step, [Row(r, n, v, inst, note=nt) for r, n, v, nt in hits], about=about, drum=STABN)
stab("50", "Am9, bar a", 5, [(3, "A-3", "60", ""), (6, "A-3", "48", ""), (14, "A-3", "54", "pushes into the next bar")],
     about="A-3 plays the Cm9 render three semitones down: C G B E, Am9 without its root.")
stab("51", "Am9, bar b", 5, [(6, "A-3", "50", ""), (11, "A-3", "44", "")])
stab("52", "Dm9, bar a", 5, [(3, "D-4", "60", ""), (6, "D-4", "48", ""), (14, "D-4", "54", "")],
     about="D-4: the same render two semitones up, F C E A.")
stab("53", "Dm9, bar b", 5, [(6, "D-4", "50", ""), (11, "D-4", "44", "")])
stab("54", "Dm9, bar 7", 5, [(3, "D-4", "60", ""), (6, "D-4", "48", ""), (14, "E-4", "54", "Em9 arrives an eighth early")])
stab("55", "Em9, bar 8", 5, [(6, "E-4", "50", "G D F♯ B: the F♯ is the bright note"), (11, "E-4", "44", "")])
stab("56", "Fmaj9, bar a (B)", 5, [(0, "F-3", "5C", "longer: on the downbeat"), (10, "F-3", "44", "")], inst="08",
     about="Instrument 08, the Cmaj9 render, seven semitones down: A E G C.")
stab("57", "Fmaj9, bar b (B)", 5, [(6, "F-3", "48", "")], inst="08")
stab("58", "Gmaj9, bar a (B)", 5, [(0, "G-3", "5C", ""), (10, "G-3", "44", "")], inst="08")
stab("59", "Gmaj9, bar b (B)", 5, [(6, "G-3", "48", "")], inst="08")
stab("5A", "Am9, one stab (breakdown)", 10, [(0, "A-3", "50", "")])
stab("5B", "Dm9, one stab (breakdown)", 10, [(0, "D-4", "50", "")])
stab("5C", "Em9, one stab (breakdown)", 10, [(0, "E-4", "50", "")])
stab("5D", "Am9, the last stab (outro)", 10, [(0, "A-3", "58", "let it ring out")])

# ---------------- track 6: the voice (06 forward, 09 reversed clone, 0C dub clone)
ph("60", 6, "the hook, bar 1", 9, [Row(0, "E-4", "60", "06"), Row(3, "E-4", "48", "06", note="the stutter"), Row(4, "OFF", note="hard cut"),
     Row(6, "G-4", "58", "06"), Row(8, "A-4", "64", "06"), Row(12, "OFF"), Row(14, "G-4", "50", "06")], tie_out=True,
   about="Written as typed. C-4 plays your hummed C at its own pitch; hum it at C5 and the whole hook sounds an octave above what is written here (E5 to A5, the plan's register).")
ph("61", 6, "the hook, bar 2", 9, [Row(0, "E-4", "60", "06"), Row(6, "D-4", "54", "06"), Row(8, "C-4", "58", "06", note="lands on the minor third")], tie_out=True)
ph("62", 6, "the hook, bar 2 over Em9", 9, [Row(0, "E-4", "60", "06"), Row(6, "D-4", "54", "06"),
     Row(8, "B-3", "58", "06", note="C would clash with Em9; B is its fifth")], tie_out=True)
ph("63", 6, "the hook, bar 2 at the peak", 10, [Row(0, "E-4", "60", "06"), Row(6, "D-4", "54", "06"),
     Row(8, "F#4", "64", "06", note="joins the stab's F♯")], tie_out=True)
ph("64", 6, "the hook, bar 1, dub", 10, [Row(0, "E-4", "60", "06"), Row(3, "E-4", "48", "06"), Row(4, "OFF"),
     Row(6, "G-4", "58", "06"), Row(8, "A-4", "64", "0C", note="instrument 0C: the same sample with a big delay send"),
     Row(12, "OFF"), Row(14, "G-4", "50", "06")], tie_out=True)
ph("65", 6, "the hook, bar 2, dub", 10, [Row(0, "E-4", "60", "06"), Row(6, "D-4", "54", "06"),
     Row(8, "C-4", "58", "0C", note="thrown into the delay")], tie_out=True)
ph("66", 6, "Fmaj9, the opening, then backward (B)", 9, [Row(0, "E-4", "54", "06"), Row(3, "E-4", "40", "06"), Row(4, "OFF"),
     Row(6, "G-4", "50", "06"), Row(8, "A-4", "48", "09", note="instrument 09 plays backward: it swells in")], tie_out=True)
ph("67", 6, "Gmaj9, a backward G (B)", 9, [Row(0, "G-4", "48", "09", note="swells through the bar"),
     Row(12, "A-4", "40", "06", note="forward, short"), Row(14, "OFF")])
ph("68", 6, "Gmaj9, G and A (B)", 9, [Row(0, "OFF"), Row(6, "G-4", "44", "06"), Row(8, "A-4", "48", "06"), Row(12, "OFF")])
ph("69", 6, "Gmaj9, backward E into the breakdown (B)", 9, [Row(4, "E-4", "50", "09", note="swells into the next downbeat")], tie_out=True)

# ---------------- track 7 rain (07), track 8 DJ filter
ph("70", 7, "rain", 10, [Row(0, "C-4", "50", "07", note="FWDLOOP: it keeps going")], tie_out=True)
dj = {"80": [(0, "30")], "81": [(0, "40")], "82": [(0, "50")], "83": [(0, "60"), (8, "68")],
      "84": [(0, "70"), (4, "78"), (8, "7C"), (12, "80")],
      "85": [(0, "60")], "86": [(0, "48")], "87": [(0, "30")], "88": [(0, "38"), (8, "48")],
      "89": [(0, "58"), (4, "68"), (8, "78"), (12, "80")],
      "8A": [(0, "70")], "8B": [(0, "60")], "8C": [(0, "48")], "8D": [(0, "30")], "8E": [(0, "20")]}
titles = {"80": "intro, closed", "84": "intro, opening a beat at a time", "85": "breakdown, closing", "89": "breakdown, opening into the drop",
          "8A": "outro, closing", "8E": "outro, nearly shut"}
for num, steps in dj.items():
    ph(num, 8, "DJ filter" + (", " + titles[num] if num in titles else ""), 10,
       [Row(r, fx=[f"DJC {v}"], note="80 is fully open" if v == "80" else "") for r, v in steps], staff="| no notes |")
ph("8F", 8, "empty", 10, [], staff="| no notes |", about="The filter stays where it was put.")
ph("FD", "any", "OFF", 9, [Row(0, "OFF")], about="Shared: an OFF on row 0 stops whatever the track was playing.")
ph("FE", "any", "empty", 3, [], about="Shared: empty.", staff="| no new note (whatever is sounding carries on) |")
P["FD"].staff_override = "| rest whole (the OFF on row 0 stops the note) |"
P["8F"].staff_override = "| no notes |"
P["70"].staff_override = "| C4, one note that loops for as long as the track runs |"
P["23"].staff_override = "| clap roll: sixteenths from 1, thirty-seconds from 3, silence on 4& |"
P["4C"].staff_override = "| G2 (held from bar 7) dotted half  rest quarter |"

C = {
    **{n: [n, "FE"] for n in ["90", "91", "92", "93", "94", "95", "96", "97"]},
    "10": ["10", "10", "10", "11"] * 2, "11": ["12", "13"] * 4,
    "20": ["20", "21"] * 4, "23": ["20", "21", "20", "21", "20", "21", "22", "23"], "21": ["24"] * 8, "22": ["FE"] * 6 + ["22", "23"],
    "30": ["30", "31"] * 4,
    "40": ["40", "41", "42", "43", "40", "41", "44", "45"], "41": ["46", "46", "47", "47", "46", "46", "47", "48"],
    "42": ["49", "FE", "4A", "FE", "49", "FE", "4A", "4C"],
    "50": ["50", "51", "52", "53", "50", "51", "54", "55"], "51": ["56", "57", "58", "59"] * 2,
    "52": ["5A", "5A", "5B", "5B", "5A", "5A", "5B", "5C"], "53": ["50", "51", "52", "53", "50", "51", "5D", "FE"],
    "60": ["60", "61", "60", "FD", "60", "61", "60", "62"], "61": ["66", "FE", "67", "FE", "66", "FE", "68", "69"],
    "62": ["60", "FD"] + ["FE"] * 6, "63": ["60", "61", "60", "FD", "60", "61", "60", "63"],
    "64": ["64", "65", "FD", "FE", "64", "FD", "60", "62"],
    "70": ["70"] + ["FE"] * 7, "71": ["FE"] * 8, "72": ["FD"] + ["FE"] * 7,
    "80": ["80", "8F", "81", "8F", "82", "8F", "83", "84"], "81": ["85", "8F", "86", "8F", "87", "8F", "88", "89"],
    "82": ["8A", "8F", "8B", "8F", "8C", "8F", "8D", "8E"],
}
SONG = [
    ("00", {5: "50", 7: "70", 8: "80"}),
    ("01", {3: "30", 4: "41", 5: "50", 7: "71"}),
    ("02", {1: "10", 2: "20", 3: "30", 4: "40", 5: "50", 7: "71"}),
    ("03", {1: "10", 2: "20", 3: "30", 4: "40", 5: "50", 6: "60", 7: "71"}),
    ("04", {1: "11", 2: "21", 3: "30", 4: "42", 5: "51", 6: "61", 7: "71"}),
    ("05", {2: "22", 5: "52", 6: "62", 7: "71", 8: "81"}),
    ("06", {1: "10", 2: "20", 3: "30", 4: "40", 5: "50", 6: "63", 7: "71"}),
    ("07", {1: "10", 2: "20", 3: "30", 4: "40", 6: "64", 7: "72"}),
    ("08", {5: "53", 7: "70", 8: "82"}),
]
CH = {"Am9": chord_set("A C E G B"), "Dm9": chord_set("D F A C E"), "Em9": chord_set("E G B D F#"),
      "Fmaj9": chord_set("F A C E G"), "Gmaj9": chord_set("G B D F# A")}
A = ["Am9", "Am9", "Dm9", "Dm9", "Am9", "Am9", "Dm9", "Em9"]
HARM = {r: A for r in ["00", "01", "02", "03", "05", "06", "07"]}
HARM["04"] = ["Fmaj9", "Fmaj9", "Gmaj9", "Gmaj9"] * 2
HARM["08"] = ["Am9", "Am9", "Dm9", "Dm9", "Am9", "Am9", "Am9", "Am9"]
# the voice is typed an octave below sounding; pitch class is what matters here
ALLOWED = {
    ("61", 6): "D over Am9, the eleventh: an eighth-note passing step from E down to C",
    ("41", 14): "D2 over Am9: the bass arrives at Dm9 an eighth early (anticipation)",
    ("45", 14): "A1 over Em9: the bass arrives home an eighth early (anticipation)",
    ("54", 14): "the Em9 stab over the Dm9 bar: arrives an eighth early with the bass's slide (anticipation); its F♯ against the bass's D is part of that push",
    ("69", 4): "E over Gmaj9, the sixth: a backward swell that lands on the breakdown's Am9, where E is the fifth",
    ("60", 6): "G over Dm9, the eleventh: the plan's \"ninth, eleventh, fifth\"; an available tension, held an eighth",
    ("60", 14): "G over Dm9, the eleventh again, an eighth",
    ("65", 6): "D over Am9, the eleventh: the same passing step as phrase 61",
}
ALLOWED = {k: v for k, v in ALLOWED.items() if v}
# Stab notes are chord roots by design; check the voicings they produce separately.
STAB = {"05": [3, 10, 14, 19], "08": [4, 11, 14, 19]}
C4 = parse("C-4")

def voicing(n, inst):
    p = parse(n) - C4
    return [C4 + 3 * 0 + iv + p for iv in STAB[inst]]

CORDER = ["90", "91", "92", "93", "94", "95", "96", "97", "10", "11", "20", "23", "21", "22", "30", "40", "41", "42",
          "50", "51", "52", "53", "60", "61", "62", "63", "64", "70", "71", "72", "80", "81", "82"]
CTRACK = {"90": "5", "91": "6", "92": "7", "93": "8", "94": "5", "95": "6", "96": "7", "97": "8"}
for k in CORDER:
    CTRACK.setdefault(k, k[0])
CSTEP = {**{k: "3, until 4" for k in ["90", "91", "92", "93", "94", "95", "96", "97"]},
         "10": 6, "11": 10, "20": 10, "23": "6, until 9", "21": 10, "22": 10, "30": 6, "40": 8, "41": 10, "42": 10,
         "50": 5, "51": 5, "52": 10, "53": 10, "60": 9, "61": 9, "62": 10, "63": 10, "64": 10,
         "70": 10, "71": 10, "72": 10, "80": 10, "81": 10, "82": 10}
CDESC = {"90": "Cm9 voice 1 and a bar of tail", "91": "Cm9 voice 2", "92": "Cm9 voice 3", "93": "Cm9 voice 4",
         "94": "Cmaj9 voice 1 and a bar of tail", "95": "Cmaj9 voice 2", "96": "Cmaj9 voice 3", "97": "Cmaj9 voice 4",
         "10": "the 2-step kick, a ghost every fourth bar", "11": "half-time kick (B)", "20": "claps, a rim every other bar",
         "23": "the working loop: claps, and the RET build in bars 7–8", "21": "half-time clap (B)",
         "22": "silence, then the build (breakdown)", "30": "hats and shaker, the open hat every other bar",
         "40": "the bassline", "41": "roots only (build)", "42": "held F and G (B), OFF at the end", "50": "the A stabs",
         "51": "the B stabs (the MAJ9 render on F and G)", "52": "one stab a bar (breakdown)", "53": "the A stabs, ending on one long Am9",
         "60": "the hook three and a half times; B at the end", "61": "fragments, some backward (B)", "62": "the hook's first bar, once",
         "63": "as 60, ending on F♯", "64": "the dub: throws into the delay, more space", "70": "rain starts", "71": "rain carries on (no new note)",
         "72": "rain stops", "80": "intro: closed, opening", "81": "breakdown: closes, then opens into the drop", "82": "outro: closing"}

if __name__ == "__main__":
    what = sys.argv[1] if len(sys.argv) > 1 else "check"
    if what == "md":
        order = sorted((k for k in P if k not in ("FD", "FE")), key=lambda k: int(k, 16)) + ["FD", "FE"]
        for k in order:
            print(P[k].md())
    else:
        u, e = check(SONG, C, P, CH, HARM, ALLOWED, skip_tracks=(1, 2, 3, 7, 8))
        print("UNEXPECTED:", *u, sep="\n  ")
        print("EXPECTED:", *e, sep="\n  ")
        names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
        for k in ["50", "52", "55", "56", "58"]:
            x = [r for r in P[k].rows if r.n][0]
            v = voicing(x.n, x.i)
            print(k, x.n, [f"{names[p % 12]}{p // 12}" for p in v])
        for k in ["60", "61", "63", "66"]:
            print(k, P[k].staff())
        print(P["10"].staff(), P["23"].staff(), P["30"].staff())

THEADS = {"9": "Tracks 5 to 8, steps 3 and 4 only: the FM chord to render (instrument 0A)",
          "1": "Track 1: kick (instrument 01)", "2": "Track 2: clap and rim (instrument 02)",
          "3": "Track 3: hats and shaker (instrument 03)", "4": "Track 4: the FM bass (instruments 04 and 0B)",
          "5": "Track 5: the stabs (instruments 05 and 08)", "6": "Track 6: the voice (instruments 06, 09 and 0C)",
          "7": "Track 7: rain (instrument 07)", "8": "Track 8: the DJ filter (no instrument)",
          "shared": "Shared phrases (any track)"}

FIRST = "9"
