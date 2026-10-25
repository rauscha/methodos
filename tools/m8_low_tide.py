"""Generate the M8 guide's Low Tide song spec, and the drum-kit and struck-bell card specs that
share its parts, from one place. Edit here, then run from the repo root:

    python3 tools/m8_low_tide.py site/guides/m8
"""
import json, sys
from pathlib import Path

OUT = Path(sys.argv[1])  # site/guides/m8


def cell(n=None, v=None, i=None, step=None, fx=None, until=None):
    c = {}
    if n is not None: c["n"] = n
    if v is not None: c["v"] = v
    if i is not None: c["i"] = i
    if fx: c["fx"] = fx
    if step is not None: c["step"] = step
    if until is not None: c["until"] = until
    return c


def fx(cmd, val, step=None):
    f = {"cmd": cmd, "val": val}
    if step is not None: f["step"] = step
    return f


def mixer(dry, mfx="00", dl="00", rev="00", pan="80"):
    return [["PAN", pan], ["DRY", dry], ["MFX", mfx], ["DEL", dl], ["REV", rev]]


phrases = {}
chains = {}

# ---- track 3: the pad. One held D-3; chords change with CRD on rows with no note.
phrases["30"] = {"rows": {"0": cell("D-3", "64", "03", step=2, fx=[fx("CRD", "00", 3)])},
                 "about": "The one note the pad plays. No bank sounds the D itself: every interval is above it."}
for ph, bank in [("31", "01"), ("32", "02"), ("33", "03"), ("34", "04"), ("35", "05")]:
    phrases[ph] = {"rows": {"0": cell(fx=[fx("CRD", bank, 3)])}}
phrases["3F"] = {"rows": {}, "about": "Empty on purpose: the chord keeps sounding through this bar."}
phrases["3E"] = {"rows": {"0": cell("OFF", step=9)}, "about": "An OFF: the pad starts its release, about a bar and a quarter."}
chains["03"] = [{"ph": "30", "step": 2}] + [{"ph": p, "step": 3} for p in ["31", "32", "3F", "33", "3F", "34", "35"]]
chains["33"] = [{"ph": p, "step": 9} for p in ["30", "3F", "31", "3F", "30", "3F", "3E", "3F"]]

# ---- track 2: roots in step 3, a bassline from step 4 (one phrase pair, moved by TSP)
for ph, n in [("20", "D-2"), ("21", "A#1"), ("22", "G-1"), ("23", "A-1")]:
    phrases[ph] = {"rows": {"0": cell(n, "64", "02", step=3)}}
phrases["2F"] = {"rows": {}, "about": "Empty on purpose: the root keeps sounding through this bar."}
phrases["24"] = {"rows": {
    "0": cell("D-2", "64", "02", step=4, fx=[fx("PSL", "06", 4), fx("GRV", "01", 5)]),
    "6": cell("D-3", "28", "02", step=4),
    "11": cell("D-2", "20", "02", step=4),
    "12": cell("A-2", "50", "02", step=4),
}, "about": "Written in D. The chain's TSP column moves it to the other roots."}
phrases["25"] = {"rows": {
    "0": cell("D-2", "64", "02", step=4),
    "6": cell("D-3", "28", "02", step=4),
    "10": cell("A-2", "48", "02", step=4),
    "13": cell("D-3", "24", "02", step=4),
}}
chains["02"] = [{"ph": p, "step": 3, "until": 3} for p in ["20", "2F", "21", "2F", "22", "2F", "23", "2F"]] + \
    [{"ph": p, "tsp": t, "step": 4} for p, t in [("24", "00"), ("25", "00"), ("24", "FC"), ("25", "FC"),
                                                  ("24", "F9"), ("25", "F9"), ("24", "FB"), ("25", "FB")]]

# ---- track 1: kick (06) and snare (07) share a track; track 6: hats (08)
K, S = "D-2", "D-4"
phrases["10"] = {"rows": {
    "0": cell(K, "70", "06", step=5, fx=[fx("GRV", "01", 5)]),
    "4": cell(S, "68", "07", step=5),
    "10": cell(K, "58", "06", step=5),
    "12": cell(S, "68", "07", step=5),
    "15": cell(S, "20", "07", step=5),
}}
phrases["11"] = {"rows": {
    "0": cell(K, "70", "06", step=5),
    "4": cell(S, "68", "07", step=5),
    "10": cell(K, "58", "06", step=5),
    "12": cell(S, "68", "07", step=5),
    "13": cell(S, "20", "07", step=5),
    "14": cell(S, "30", "07", step=5),
    "15": cell(S, "44", "07", step=5),
}, "about": "Bar 8: the ghost notes build into the top of the loop."}
chains["01"] = [{"ph": p, "step": 5} for p in ["10"] * 7 + ["11"]]
H = "C-6"
hat_rows = {"0": ("60", [fx("GRV", "01", 5)]), "2": ("30", None), "3": ("18", None), "4": ("60", None),
            "6": ("30", None), "8": ("60", None), "10": ("30", None), "11": ("18", None),
            "12": ("60", None), "14": ("30", None)}
phrases["60"] = {"rows": {r: cell(H, v, "08", step=5, fx=f) for r, (v, f) in hat_rows.items()},
                 "about": "Rows 3 and B are the swung ones: groove 01 makes every odd row a tick late."}
chains["06"] = [{"ph": "60", "step": 5} for _ in range(8)]

# ---- track 4: the arp, by hand, eighth notes on even rows, an octave above the pad
arp = {
    "40": ["D-6", "A-5", "E-6", "C-6", "F-6", "E-6", "A-5", "C-6"],   # Dm9
    "41": ["E-6", "A-5", "D-6", "C-6", "F-6", "E-6", "C-6", "A-5"],   # Dm9, top E
    "42": ["F-5", "C-6", "A-5", "D-6", "C-6", "F-5", "A-5", "C-6"],   # Bbmaj9
    "43": ["D-6", "A-5", "A#5", "F-6", "D-6", "A-5", "A#5", "F-5"],   # Gm9
    "44": ["G-5", "D-6", "A#5", "E-6", "D-6", "G-5", "A#5", "D-6"],   # A7sus4b9
    "45": ["E-6", "A#5", "C#6", "G-5", "E-6", "C#6", "A#5", "C#6"],   # A7b9: C# pulls to D
}
cha_rows = {"40": {6, 12}, "41": {4}, "42": {6, 10}, "43": {4, 12}, "44": {6}, "45": {10}}
for ph, notes in arp.items():
    rows = {}
    for k, n in enumerate(notes):
        r = 2 * k
        rows[str(r)] = cell(n, "60" if k % 2 == 0 else "40", "05", step=7,
                            fx=[fx("CHA", "8F", 7)] if r in cha_rows[ph] else None)
    phrases[ph] = {"rows": rows}
chains["04"] = [{"ph": p, "step": 7} for p in ["40", "41", "42", "42", "43", "43", "44", "45"]]

# ---- track 5: the texture you record
phrases["50"] = {"rows": {"0": cell("C-4", "50", "0B", step=8)}}
phrases["5F"] = {"rows": {}, "about": "Empty: the loop keeps playing."}
chains["05"] = [{"ph": "50", "step": 8}] + [{"ph": "5F", "step": 8} for _ in range(7)]

# ---- arrangement helpers (step 9): rests, and track 8 moving the DJ filter
phrases["FD"] = {"rows": {"0": cell("OFF", step=9)}, "about": "An OFF on row 0 stops whatever the track was playing."}
phrases["FE"] = {"rows": {}, "about": "Empty."}
chains["FE"] = [{"ph": "FD", "step": 9}] + [{"ph": "FE", "step": 9} for _ in range(7)]
phrases["80"] = {"rows": {"0": cell(fx=[fx("DJC", "60", 9)])}}
phrases["81"] = {"rows": {"0": cell(fx=[fx("DJC", "40", 9)])}}
phrases["82"] = {"rows": {"0": cell(fx=[fx("DJC", "30", 9)])}}
phrases["83"] = {"rows": {"0": cell(fx=[fx("DJC", "48", 9)]), "4": cell(fx=[fx("DJC", "58", 9)]),
                          "8": cell(fx=[fx("DJC", "68", 9)]), "12": cell(fx=[fx("DJC", "80", 9)])},
                 "about": "Opens back up a beat at a time; 80 is fully open."}
phrases["8F"] = {"rows": {}, "about": "Empty: the filter stays where it was put."}
chains["80"] = [{"ph": p, "step": 9} for p in ["80", "8F", "81", "8F", "82", "8F", "8F", "83"]]

loop = {"1": "01", "2": "02", "3": "03", "4": "04", "5": "05", "6": "06"}
song = [{"row": "00", "chains": loop, "until": 8}]
arr = [
    ("00", {"1": "FE", "2": "FE", "3": "03", "4": "FE", "5": "05", "6": "FE", "8": "FE"}, "intro: pad and texture"),
    ("01", {"1": "FE", "2": "02", "3": "03", "4": "FE", "5": "05", "6": "FE", "8": "FE"}, "the bass enters"),
    ("02", {"1": "01", "2": "02", "3": "03", "4": "FE", "5": "05", "6": "06", "8": "FE"}, "the drums enter"),
    ("03", {"1": "01", "2": "02", "3": "03", "4": "04", "5": "05", "6": "06", "8": "FE"}, "the arp: everything"),
    ("04", {"1": "FE", "2": "FE", "3": "03", "4": "04", "5": "05", "6": "FE", "8": "80"}, "breakdown: the filter closes"),
    ("05", {"1": "01", "2": "02", "3": "03", "4": "04", "5": "05", "6": "06", "8": "FE"}, "everything again"),
    ("06", {"1": "FE", "2": "FE", "3": "33", "4": "FE", "5": "05", "6": "FE", "8": "FE"}, "outro: the pad lets go"),
]
for row, ch, about in arr:
    song.append({"row": row, "chains": ch, "step": 9, "about": about})

instruments = {
    "02": {"type": "MACROSYN", "name": "ROOTS", "step": 3, "params": [
        ["SHAPE", "SINE TRIANGLE"], ["TIMBRE", "00"], ["COLOR", "10"], ["DEGRADE", "00"], ["REDUX", "00"],
        ["FILTER", "LOWPASS"], ["CUTOFF", "50"], ["RES", "00"], ["AMP", "00"], ["LIM", "CLIP"]] + mixer("80", rev="00"),
        "mods": [
            {"slot": 1, "type": "ADSR ENV", "dest": "VOLUME", "step": 3,
             "p": {"AMT": "FF", "ATK": "→0.5s", "DEC": "00", "SUS": "FF", "REL": "→1.0s"},
             "sec": {"ATK": 0.5, "REL": 1.0}},
            {"slot": 2, "type": "LFO", "dest": "CUTOFF", "step": 3,
             "p": {"OSC": "SIN", "TRIG": "FREE", "AMT": "20", "FREQ": "80"}},
        ]},
    "03": {"type": "HYPERSYNTH", "name": "TIDE PAD", "step": 2, "params": [
        ["SHAPE", "SOFT SAW"], ["SCALE", "00"], ["CHORD", "00"], ["SHIFT", "80"], ["SWARM", "08"], ["WIDTH", "C0"],
        ["SUBOSC", "80"], ["FILTER", "LOWPASS"], ["CUTOFF", "80"], ["RES", "20"], ["AMP", "00"], ["LIM", "CLIP"]]
        + mixer("B0", mfx="20", dl="10", rev="90"),
        "banks": [
            {"bank": "00", "iv": ["03", "0A", "0E", "13", "18"], "step": 2, "shape": "F3 C4 E4 A4 D5", "use": "Dm9 over D"},
            {"bank": "01", "iv": ["03", "0A", "0E", "13", "1A"], "step": 3, "shape": "F3 C4 E4 A4 E5", "use": "Dm9 over D, the 9th on top"},
            {"bank": "02", "iv": ["03", "0A", "0F", "13", "18"], "step": 3, "shape": "F3 C4 F4 A4 D5", "use": "B♭maj9 over B♭"},
            {"bank": "03", "iv": ["03", "08", "0F", "13", "18"], "step": 3, "shape": "F3 B♭3 F4 A4 D5", "use": "Gm9 over G"},
            {"bank": "04", "iv": ["02", "08", "0E", "11", "18"], "step": 3, "shape": "E3 B♭3 E4 G4 D5", "use": "A7sus4♭9 over A"},
            {"bank": "05", "iv": ["02", "08", "0E", "11", "17"], "step": 3, "shape": "E3 B♭3 E4 G4 C♯5", "use": "A7♭9 over A"},
        ],
        "mods": [
            {"slot": 1, "type": "ADSR ENV", "dest": "VOLUME", "step": 2,
             "p": {"AMT": "FF", "ATK": "C2", "DEC": "00", "SUS": "FF", "REL": "CB"},
             "sec": {"ATK": 2.869, "REL": 3.663}},
            {"slot": 2, "type": "LFO", "dest": "CUTOFF", "step": 2,
             "p": {"OSC": "SIN", "TRIG": "FREE", "AMT": "40", "FREQ": "80"}},
            {"slot": 3, "type": "TRIG ENV", "dest": "VOLUME", "step": 6,
             "p": {"AMT": "neg.", "ATK": "00", "HOLD": "03", "DEC": "12", "SRC": "06"}, "amt": -0.55},
        ]},
    "05": {"type": "MACROSYN", "name": "TIDE BELL", "step": 7, "params": [
        ["SHAPE", "20 STRUCK BELL"], ["TIMBRE", "50"], ["COLOR", "30"], ["DEGRADE", "00"], ["REDUX", "00"],
        ["FILTER", "LOWPASS"], ["CUTOFF", "C0"], ["RES", "00"], ["AMP", "00"], ["LIM", "CLIP"]]
        + mixer("A0", dl="50", rev="60"), "mods": []},
    "06": {"type": "MACROSYN", "name": "KICK", "step": 5, "demo": False, "params": [
        ["SHAPE", "22 KICK"], ["TIMBRE", "60"], ["COLOR", "30"], ["DEGRADE", "00"], ["REDUX", "00"],
        ["FILTER", "LOWPASS"], ["CUTOFF", "FF"], ["RES", "00"], ["AMP", "20"], ["LIM", "CLIP"]] + mixer("E0"),
        "mods": []},
    "07": {"type": "MACROSYN", "name": "SNARE", "step": 5, "demo": False, "params": [
        ["SHAPE", "24 SNARE"], ["TIMBRE", "40"], ["COLOR", "90"], ["DEGRADE", "00"], ["REDUX", "00"],
        ["FILTER", "LOWPASS"], ["CUTOFF", "FF"], ["RES", "00"], ["AMP", "10"], ["LIM", "CLIP"]] + mixer("C0", rev="30"),
        "mods": []},
    "08": {"type": "MACROSYN", "name": "HAT", "step": 5, "demo": False, "params": [
        ["SHAPE", "23 CYMBAL"], ["TIMBRE", "C0"], ["COLOR", "E0"], ["DEGRADE", "00"], ["REDUX", "00"],
        ["FILTER", "HIGHPASS"], ["CUTOFF", "80"], ["RES", "00"], ["AMP", "00"], ["LIM", "CLIP"]] + mixer("A0", rev="18"),
        "mods": [{"slot": 1, "type": "AHD ENV", "dest": "VOLUME", "p": {"AMT": "FF", "ATK": "00", "HOLD": "00", "DEC": "06"}}]},
    "0B": {"type": "SAMPLER", "name": "FIELD", "step": 8, "demo": False, "params": [
        ["SAMPLE", "(your recording)"], ["SLICE", "00"], ["PLAY", "FWDLOOP"], ["START", "00"], ["LOOP ST.", "00"],
        ["LEN", "FF"], ["DETUNE", "80"], ["DEGRADE", "00"], ["FILTER", "HIGHPASS"], ["CUTOFF", "30"], ["RES", "00"],
        ["AMP", "00"], ["LIM", "CLIP"]] + mixer("60", rev="40"), "mods": []},
}

harmony = [
    {"bar": 1, "chord": "Dm9", "roman": "i", "bass": "D", "upper": "F C E A D", "move": "The top voice steps up to E", "step": 3},
    {"bar": 2, "chord": "Dm9", "roman": "i", "bass": "D", "upper": "F C E A E", "move": "E steps up to F, the top falls back to D; the bass drops a major third", "step": 3},
    {"bar": 3, "chord": "B♭maj9", "roman": "♭VI", "bass": "B♭", "upper": "F C F A D", "hold": 2, "move": "One voice steps down, C to B♭", "step": 3},
    {"bar": 5, "chord": "Gm9", "roman": "iv", "bass": "G", "upper": "F B♭ F A D", "hold": 2, "move": "Three voices step down; the top D holds", "step": 3},
    {"bar": 7, "chord": "A7sus4♭9", "roman": "V", "bass": "A", "upper": "E B♭ E G D", "move": "The top D falls a half step", "step": 3},
    {"bar": 8, "chord": "A7♭9", "roman": "V", "bass": "A", "upper": "E B♭ E G C♯", "move": "Four voices step up, E holds: home", "step": 3},
]

spec = {
    "title": "Low Tide", "tempo": 84, "key": "D minor", "firmware": "6.6.3",
    "notes": "Every element carries the walkthrough step that introduces it (and `until`, the last step it belongs to). "
             "A page at step N plays and draws what is on at N, and marks step == N as new. Generated by a script; "
             "tools/m8_low_tide.py; see docs/m8-guide-plan.md, revision 4.",
    "grooves": {"01": [7, 5]},
    "tracks": [
        {"n": 1, "name": "Drums", "step": 5},
        {"n": 2, "name": "Bass", "step": 3},
        {"n": 3, "name": "Pad", "step": 2},
        {"n": 4, "name": "Arp", "step": 7},
        {"n": 5, "name": "Texture", "step": 8},
        {"n": 6, "name": "Hats", "step": 5},
        {"n": 8, "name": "DJ filter", "step": 9},
    ],
    "song": song, "chains": chains, "phrases": phrases, "instruments": instruments, "harmony": harmony,
}
(OUT / "songs/low-tide.json").write_text(json.dumps(spec, indent=1, ensure_ascii=False) + "\n")

# ---- patch-card specs that share Low Tide's parts
pick = lambda d, keys: {k: d[k] for k in keys}
def nostep(o):
    if isinstance(o, dict): return {k: nostep(v) for k, v in o.items() if k not in ("step", "until")}
    if isinstance(o, list): return [nostep(v) for v in o]
    return o

drums = {
    "title": "No-sample drum kit", "tempo": 84, "key": "D minor", "firmware": "6.6.3",
    "notes": "Low Tide's drums (step 5) as a patch card: every element is on from the start.",
    "grooves": {"01": [7, 5]},
    "tracks": [{"n": 1, "name": "Kick + snare"}, {"n": 6, "name": "Hats"}],
    "song": [{"row": "00", "chains": {"1": "01", "6": "06"}}],
    "chains": nostep(pick(chains, ["01", "06"])),
    "phrases": nostep(pick(phrases, ["10", "11", "60"])),
    "instruments": nostep(pick(instruments, ["06", "07", "08"])),
}
(OUT / "patches/drum-kit.json").write_text(json.dumps(drums, indent=1, ensure_ascii=False) + "\n")

bell = {
    "title": "Struck bell", "tempo": 84, "key": "D minor", "firmware": "6.6.3",
    "notes": "Low Tide's arp, bar 1 (step 7), as a patch card: every element is on from the start.",
    "tracks": [{"n": 4, "name": "Arp"}],
    "song": [{"row": "00", "chains": {"4": "04"}}],
    "chains": {"04": [{"ph": "40"}]},
    "phrases": nostep(pick(phrases, ["40"])),
    "instruments": nostep(pick(instruments, ["05"])),
}
(OUT / "patches/struck-bell.json").write_text(json.dumps(bell, indent=1, ensure_ascii=False) + "\n")
print("ok")
