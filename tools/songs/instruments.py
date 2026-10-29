"""Instrument settings for Faded Polaroid (FP) and Overpass (OP), in the shape songs/<id>.json uses.

DRAFT, 2026-10-29: the third sheet in the relay (plan, parts, settings, pages). The prose that
explains every value, and which ones are unverified, is in docs/songs/faded-polaroid-instruments.md
and docs/songs/overpass-instruments.md. This module is the data the builder reads.

Shapes match site/guides/m8/songs/low-tide.json and the patch specs:
  instrument: {type, name, step, params: [[k, v]...], mods: [{slot, type, dest, step?, p, sec?, amt?}],
               table?, demo?, ops? (FM only), until?}
  table:      {rows: {"<decimal row>": {n?, v?, fx?: [{cmd, val}]}}, about, step}
  grooves:    {"<hex groove>": [ticks...]}
Params are in screen order. The three header rows (TRANSP., TBL. TIC, EQ) are the labels in his
photo of instrument 10; the kit currently reads 'TABLE TIC' (see the builder notes).
ADSR times are seconds: "p" shows the target ("→0.03s") and "sec" carries the number, as Low Tide
does, because the hex-to-seconds curve isn't published (known: 60 = 0.200 s, C2 = 2.869 s, CB = 3.663 s).
AHD times are hex ticks (6 a sixteenth, 24 a beat). LFO FREQ is a period in steps (10 = one phrase).

    python3 instruments.py check   # cross-check against fp.py / op.py
    python3 instruments.py json    # print both as JSON
"""
import sys, json

sys.path.insert(0, sys.path[0])


def head(tic="01", eq="--", transp="ON"):
    return [["TRANSP.", transp], ["TBL. TIC", tic], ["EQ", eq]]


def mixer(dry, mfx="00", dl="00", rev="00", pan="80"):
    return [["PAN", pan], ["DRY", dry], ["MFX", mfx], ["DEL", dl], ["REV", rev]]


def ahd(slot, dest, amt, atk, hold, dec, step=None):
    m = {"slot": slot, "type": "AHD ENV", "dest": dest, "p": {"AMT": amt, "ATK": atk, "HOLD": hold, "DEC": dec}}
    if step is not None:
        m["step"] = step
    return m


def adsr(slot, dest, atk_s, rel_s, step=None, sus="FF", dec="00"):
    m = {"slot": slot, "type": "ADSR ENV", "dest": dest,
         "p": {"AMT": "FF", "ATK": f"→{atk_s:g}s", "DEC": dec, "SUS": sus, "REL": f"→{rel_s:g}s"},
         "sec": {"ATK": atk_s, "REL": rel_s}}
    if step is not None:
        m["step"] = step
    return m


def lfo(slot, dest, osc, trig, amt, freq, step=None):
    m = {"slot": slot, "type": "LFO", "dest": dest, "p": {"OSC": osc, "TRIG": trig, "AMT": amt, "FREQ": freq}}
    if step is not None:
        m["step"] = step
    return m


def sampler(sample, play="FWD", slice_="00", degrade="00", filt="LOWPASS", cutoff="FF", res="00", amp="00",
            detune="80", length="FF"):
    return [["SAMPLE", sample], ["SLICE", slice_], ["PLAY", play], ["START", "00"], ["LOOP ST.", "00"],
            ["LEN", length], ["DETUNE", detune], ["DEGRADE", degrade], ["FILTER", filt], ["CUTOFF", cutoff],
            ["RES", res], ["AMP", amp], ["LIM", "CLIP"]]


def trow(n=None, v=None, *fx):
    r = {}
    if n is not None:
        r["n"] = n
    if v is not None:
        r["v"] = v
    if fx:
        r["fx"] = [{"cmd": c.split()[0], "val": c.split()[1]} for c in fx]
    return r


# ======================================================================= Faded Polaroid, 90 BPM
FP_INST = {
    "10": {"type": "MACROSYN", "name": "CHORDED", "step": 2, "params": head() + [
        ["SHAPE", "28 WAV PARAPHONIC"], ["TIMBRE", "45"], ["COLOR", "80"], ["DEGRADE", "00"], ["REDUX", "00"],
        ["FILTER", "LOWPASS"], ["CUTOFF", "90"], ["RES", "40"], ["AMP", "00"], ["LIM", "CLIP"]]
        + mixer("C0", mfx="30", dl="10", rev="10"),
        "mods": [ahd(1, "VOLUME", "FF", "02", "60", "60")]},
    "02": {"type": "WAVSYNTH", "name": "VELVET BASS", "step": 3, "params": head() + [
        ["SHAPE", "SAW"], ["SIZE", "40"], ["MULT", "00"], ["WARP", "00"], ["SCAN", "00"],
        ["FILTER", "LOWPASS"], ["CUTOFF", "60"], ["RES", "08"], ["AMP", "18"], ["LIM", "POST"]]
        + mixer("D0", mfx="08", rev="08"),
        "mods": [ahd(1, "VOLUME", "FF", "01", "18", "30")]},
    "01": {"type": "WAVSYNTH", "name": "POLAROID ARP", "step": 4, "params": head() + [
        ["SHAPE", "TRIANGLE"], ["SIZE", "20"], ["MULT", "00"], ["WARP", "18"], ["SCAN", "00"],
        ["FILTER", "LOWPASS"], ["CUTOFF", "A0"], ["RES", "12"], ["AMP", "00"], ["LIM", "CLIP"]]
        + mixer("C0", mfx="30", dl="28", rev="48"),
        "mods": [ahd(1, "VOLUME", "FF", "01", "01", "18"), ahd(2, "CUTOFF", "20", "00", "00", "10"),
                 lfo(3, "PITCH", "SIN", "FREE", "01", "80")]},
    "05": {"type": "SAMPLER", "name": "KICK", "step": 5, "demo": False,
           "params": head(transp="OFF") + sampler("(a soft kick from the factory samples)", degrade="18", cutoff="90")
           + mixer("C0", rev="08"),
           "mods": [ahd(1, "VOLUME", "FF", "00", "04", "08")]},
    "06": {"type": "SAMPLER", "name": "SNARE", "step": 5, "demo": False,
           "params": head(transp="OFF") + sampler("(a brushed rim or muffled clap from the factory samples)",
                                                  degrade="18", cutoff="A0")
           + mixer("B0", rev="28"),
           "mods": [ahd(1, "VOLUME", "FF", "00", "03", "0C")]},
    "07": {"type": "SAMPLER", "name": "HAT", "step": 5, "demo": False,
           "params": head(transp="OFF") + sampler("(a closed hat or shaker from the factory samples)",
                                                  degrade="20", cutoff="80")
           + mixer("90", rev="10", pan="90"),
           "mods": [ahd(1, "VOLUME", "FF", "00", "00", "06")]},
    "04": {"type": "MACROSYN", "name": "POLAROID LEAD", "step": 6, "table": "04", "params": head(tic="03", eq="04") + [
        ["SHAPE", "1F FLUTED"], ["TIMBRE", "60"], ["COLOR", "40"], ["DEGRADE", "08"], ["REDUX", "00"],
        ["FILTER", "LOWPASS"], ["CUTOFF", "A8"], ["RES", "00"], ["AMP", "00"], ["LIM", "CLIP"]]
        + mixer("B0", mfx="20", dl="30", rev="70"),
        "mods": [adsr(1, "VOLUME", 0.03, 0.25), ahd(2, "TIMBRE", "18", "00", "00", "06"),
                 lfo(3, "PITCH", "SIN", "FREE", "01", "80")]},
    "09": {"type": "SAMPLER", "name": "FADED", "step": 9, "demo": False,
           "params": head(eq="09") + sampler("FADED (your render of the A section)", degrade="30", cutoff="70")
           + mixer("90", mfx="20", rev="50"),
           "mods": [lfo(1, "PITCH", "SIN", "FREE", "02", "20")]},
    "0A": {"type": "SAMPLER", "name": "FADED REV", "step": 9, "demo": False,
           "params": head(eq="09") + sampler("FADED (the same file as 09)", play="REV", degrade="30", cutoff="70")
           + mixer("90", mfx="20", rev="60"),
           "mods": [lfo(1, "PITCH", "SIN", "FREE", "02", "20")]},
}

FP_TABLES = {
    "04": {"step": 7, "about": "instrument 04's own table: a breath and a scoop up into pitch, then a vibrato after a beat",
           "rows": {"0": trow("00", "50", "FIN F0"), "1": trow("00", "68", "FIN 08"), "2": trow("00", "7F", "FIN 08"),
                    "8": trow(None, None, "PVB 52"), "9": trow(None, None, "PVB 54"), "10": trow(None, None, "HOP 09")}},
    "81": {"step": 7, "about": "a free table, picked with TBL 81 in A4: a deeper scoop and a wider vibrato",
           "rows": {"0": trow("00", "48", "FIN E8"), "1": trow("00", "64", "FIN 0C"), "2": trow("00", "7F", "FIN 0C"),
                    "8": trow(None, None, "PVB 54"), "9": trow(None, None, "PVB 57"), "10": trow(None, None, "HOP 09")}},
}

FP_GROOVES = {"01": [7, 5]}

FP_MIX = {
    "step": 10,
    "reverb": [["SIZE", "E0"], ["DECAY", "C0"], ["SHIMMER", "30"], ["MOD DEPTH", "40"], ["MOD FREQ", "30"],
               ["WIDTH", "FF"], ["INPUT EQ", "LOW: LOWCUT about 250 Hz"]],
    "delay": [["TIME L:R", "0C 0C"], ["FEEDBACK", "60"], ["WIDTH", "FF"], ["REVERB SEND", "40"],
              ["INPUT EQ", "LOW: LOWCUT about 300 Hz"]],
    "modfx": [["TYPE", "CHORUS"], ["MOD DEPTH", "40"], ["MOD FREQ", "18"], ["WIDTH", "C0"], ["REVERB SEND", "20"]],
    "mixer": [["TRACKS 1-8", "unchanged (balance with each instrument's DRY)"], ["MX DE RE", "unchanged"],
              ["DJF", "80"], ["OTT", "00"], ["LIM", "20"], ["EQ", "--"]],
    "eq": {"04": [["LOW", "LOWCUT, about 350 Hz, STEREO"]], "09": [["LOW", "LOWCUT, about 150 Hz, STEREO"]]},
}

# ======================================================================= Overpass, 124 BPM
OP_INST = {
    "0A": {"type": "FMSYNTH", "name": "GLASS KEYS", "step": 2, "until": 4, "params": head() + [
        ["ALGO", "07 [A>B]+[C>D]"], ["MOD1", "00"], ["MOD2", "00"], ["MOD3", "00"], ["MOD4", "00"],
        ["FILTER", "LOWPASS"], ["CUTOFF", "FF"], ["RES", "00"], ["AMP", "00"], ["LIM", "CLIP"]]
        + mixer("C0"),
        "ops": [{"op": "A", "shape": "SIN", "ratio": "1.00", "lev": "30", "fb": "00", "mod": ["--", "--"]},
                {"op": "B", "shape": "SIN", "ratio": "1.00", "lev": "C0", "fb": "00", "mod": ["--", "--"]},
                {"op": "C", "shape": "SIN", "ratio": "14.00", "lev": "60", "fb": "00", "mod": ["1 LEV", "--"]},
                {"op": "D", "shape": "SIN", "ratio": "1.00", "lev": "80", "fb": "00", "mod": ["--", "--"]}],
        "mods": [ahd(1, "VOLUME", "FF", "00", "00", "60"), ahd(2, "MOD1", "FF", "00", "00", "0C")]},
    "05": {"type": "SAMPLER", "name": "STAB MIN9", "step": 4, "demo": False, "table": "05",
           "params": head(tic="00", eq="05") + sampler("CM9 (your render)", degrade="10", cutoff="B0", res="10")
           + mixer("C0", mfx="18", dl="10", rev="38"),
           "mods": [ahd(1, "VOLUME", "FF", "00", "02", "10", step=5), ahd(2, "CUTOFF", "18", "00", "00", "0C", step=5)]},
    "08": {"type": "SAMPLER", "name": "STAB MAJ9", "step": 4, "demo": False, "table": "08",
           "params": head(tic="00", eq="05") + sampler("CMAJ9 (your render)", degrade="10", cutoff="B0", res="10")
           + mixer("C0", mfx="18", dl="10", rev="50"),
           "mods": [ahd(1, "VOLUME", "FF", "00", "08", "28", step=5), ahd(2, "CUTOFF", "18", "00", "00", "0C", step=5)]},
    "01": {"type": "SAMPLER", "name": "KICK", "step": 6, "demo": False,
           "params": head(transp="OFF") + sampler("OVERKIT (a factory kit or break, with slice markers)",
                                                  slice_="01 FILE", amp="10") + mixer("E0"),
           "mods": [ahd(1, "VOLUME", "FF", "00", "03", "06")]},
    "02": {"type": "SAMPLER", "name": "CLAP", "step": 6, "demo": False,
           "params": head(transp="OFF") + sampler("OVERKIT (the same file)", slice_="01 FILE", filt="HIGHPASS",
                                                  cutoff="20") + mixer("C8", rev="30"),
           "mods": [ahd(1, "VOLUME", "FF", "00", "04", "0C")]},
    "03": {"type": "SAMPLER", "name": "HATS", "step": 6, "demo": False,
           "params": head(transp="OFF") + sampler("OVERKIT (the same file)", slice_="01 FILE", filt="HIGHPASS",
                                                  cutoff="50") + mixer("A0", rev="10", pan="90"),
           "mods": [ahd(1, "VOLUME", "FF", "00", "00", "0C")]},
    "04": {"type": "FMSYNTH", "name": "FM SUB", "step": 8, "params": head() + [
        ["ALGO", "07 [A>B]+[C>D]"], ["MOD1", "00"], ["MOD2", "00"], ["MOD3", "00"], ["MOD4", "00"],
        ["FILTER", "LOWPASS"], ["CUTOFF", "70"], ["RES", "00"], ["AMP", "00"], ["LIM", "CLIP"]]
        + mixer("D0"),
        "ops": [{"op": "A", "shape": "SIN", "ratio": "1.00", "lev": "60", "fb": "00", "mod": ["1 LEV", "--"]},
                {"op": "B", "shape": "SIN", "ratio": "1.00", "lev": "C0", "fb": "00", "mod": ["--", "--"]},
                {"op": "C", "shape": "SIN", "ratio": "1.00", "lev": "00", "fb": "00", "mod": ["--", "--"]},
                {"op": "D", "shape": "SIN", "ratio": "1.00", "lev": "90", "fb": "00", "mod": ["--", "--"]}],
        "mods": [ahd(1, "VOLUME", "FF", "01", "05", "06"), ahd(2, "MOD1", "FF", "00", "00", "04"),
                 {"slot": 3, "type": "TRIG ENV", "dest": "VOLUME", "step": 10,
                  "p": {"AMT": "neg.", "ATK": "00", "HOLD": "01", "DEC": "06", "SRC": "80"}, "amt": -0.4}]},
    "06": {"type": "SAMPLER", "name": "VOICE", "step": 9, "demo": False,
           "params": head(eq="06") + sampler("VOICE C (your hummed C)", degrade="10", cutoff="C0")
           + mixer("C0", mfx="10", dl="18", rev="40"),
           "mods": [adsr(1, "VOLUME", 0.005, 0.03)]},
    "09": {"type": "SAMPLER", "name": "VOICE REV", "step": 9, "demo": False,
           "params": head(eq="06") + sampler("VOICE C (the same file as 06)", play="REV", degrade="10",
                                             cutoff="C0")
           + mixer("B0", mfx="10", dl="18", rev="60"),
           "mods": [adsr(1, "VOLUME", 0.005, 0.03)]},
    "0B": {"type": "FMSYNTH", "name": "SUB HOLD", "step": 10, "params": head() + [
        ["ALGO", "07 [A>B]+[C>D]"], ["MOD1", "00"], ["MOD2", "00"], ["MOD3", "00"], ["MOD4", "00"],
        ["FILTER", "LOWPASS"], ["CUTOFF", "70"], ["RES", "00"], ["AMP", "00"], ["LIM", "CLIP"]]
        + mixer("D0"),
        "ops": [{"op": "A", "shape": "SIN", "ratio": "1.00", "lev": "60", "fb": "00", "mod": ["1 LEV", "--"]},
                {"op": "B", "shape": "SIN", "ratio": "1.00", "lev": "C0", "fb": "00", "mod": ["--", "--"]},
                {"op": "C", "shape": "SIN", "ratio": "1.00", "lev": "00", "fb": "00", "mod": ["--", "--"]},
                {"op": "D", "shape": "SIN", "ratio": "1.00", "lev": "90", "fb": "00", "mod": ["--", "--"]}],
        "mods": [adsr(1, "VOLUME", 0.01, 0.48), ahd(2, "MOD1", "FF", "00", "00", "04"),
                 {"slot": 3, "type": "TRIG ENV", "dest": "VOLUME",
                  "p": {"AMT": "neg.", "ATK": "00", "HOLD": "01", "DEC": "06", "SRC": "80"}, "amt": -0.4}]},
    "0C": {"type": "SAMPLER", "name": "VOICE DUB", "step": 10, "demo": False,
           "params": head(eq="06") + sampler("VOICE C (the same file as 06)", degrade="10", cutoff="C0")
           + mixer("C0", mfx="10", dl="C0", rev="30"),
           "mods": [adsr(1, "VOLUME", 0.005, 0.03)]},
    "07": {"type": "SAMPLER", "name": "RAIN", "step": 10, "demo": False,
           "params": head(transp="OFF", eq="07") + sampler("(Low Tide's FIELD loop, or a new rain recording)",
                                                           play="FWDLOOP", cutoff="70") + mixer("58", rev="50"),
           "mods": [adsr(1, "VOLUME", 0.5, 1.0)]},
}

_STAB_ROWS = {"0": trow("00", "7F"), "1": trow("00", "64", "CUT 98", "FIN F9"),
              "2": trow("00", "72", "CUT A4", "FIN 03", "HOP 00")}
OP_TABLES = {
    "05": {"step": 7, "about": "instrument 05's own table, TIC 00: one row per stab, a three-stab cycle (firm, lazy, reach)",
           "rows": _STAB_ROWS},
    "08": {"step": 7, "about": "instrument 08's own table: table 05 copied in by hand", "rows": dict(_STAB_ROWS)},
}

OP_GROOVES = {"00": [8, 4]}

OP_MIX = {
    "step": 10,
    "reverb": [["SIZE", "A0"], ["DECAY", "90"], ["SHIMMER", "00"], ["MOD DEPTH", "30"], ["MOD FREQ", "30"],
               ["WIDTH", "FF"], ["INPUT EQ", "LOW: LOWCUT about 250 Hz"]],
    "delay": [["TIME L:R", "0C 0C"], ["FEEDBACK", "80"], ["WIDTH", "FF"], ["REVERB SEND", "30"],
              ["INPUT EQ", "LOW: LOWCUT about 300 Hz; HIGH: HI.CUT about 4 kHz"]],
    "modfx": [["TYPE", "CHORUS"], ["MOD DEPTH", "30"], ["MOD FREQ", "20"], ["WIDTH", "C0"], ["REVERB SEND", "10"]],
    "mixer": [["TRACKS 1-8", "unchanged (balance with each instrument's DRY)"], ["MX DE RE", "unchanged"],
              ["DJF", "80 (track 8 moves it)"], ["OTT", "00"], ["LIM", "30"],
              ["EQ", "main mix: LOW: LOWCUT, MODE SIDE, about 150 Hz"]],
    "eq": {"05": [["LOW", "LOWCUT, about 150 Hz, STEREO"]], "06": [["LOW", "LOWCUT, about 200 Hz, STEREO"]],
           "07": [["LOW", "LOWCUT, about 200 Hz, STEREO"]]},
}

SONGS = {
    "faded-polaroid": {"instruments": FP_INST, "tables": FP_TABLES, "grooves": FP_GROOVES, "mix": FP_MIX},
    "overpass": {"instruments": OP_INST, "tables": OP_TABLES, "grooves": OP_GROOVES, "mix": OP_MIX},
}


# ======================================================================= consistency check
VALID_ANY = {"OFF", "CHA", "PSL", "TBL", "GRV", "NTH", "RET", "KIL", "HOP", "PVB", "FIN", "DE1", "XRZ", "DJC", "TIC"}
ONLY = {"COL": {"MACROSYN"}, "CUT": {"SAMPLER", "MACROSYN", "WAVSYNTH", "FMSYNTH"}}
NO_INSTRUMENT = {"XRZ", "DJC"}  # mixer commands: fine on a track with no instrument


def check():
    import importlib
    problems = []
    for song, modname in (("faded-polaroid", "fp"), ("overpass", "op")):
        mod = importlib.import_module(modname)
        inst = SONGS[song]["instruments"]
        used = {}
        for k, p in mod.P.items():
            last = None
            for r in p.rows:
                if r.i:
                    used.setdefault(r.i, []).append(k)
                    last = r.i
                for f in r.fx:
                    cmd = f.split()[0]
                    if "??" in f:
                        problems.append(f"{song}: phrase {k} row {r.r:X} still has {f}")
                    if cmd not in VALID_ANY and cmd not in ONLY:
                        problems.append(f"{song}: phrase {k}: unknown command {cmd}")
                    if cmd in ONLY and last and inst.get(last, {}).get("type") not in ONLY[cmd]:
                        problems.append(f"{song}: phrase {k}: {cmd} on instrument {last} ({inst.get(last, {}).get('type')})")
        for i, ph in sorted(used.items()):
            if i not in inst:
                problems.append(f"{song}: instrument {i} used in phrases {sorted(set(ph))} has no settings")
        for i in inst:
            if i not in used:
                problems.append(f"{song}: instrument {i} has settings but no phrase uses it")
        for i, d in inst.items():
            t = d.get("table")
            if t and t not in SONGS[song]["tables"]:
                problems.append(f"{song}: instrument {i} names table {t}, which isn't written")
        for t, tb in SONGS[song]["tables"].items():
            for r, row in tb["rows"].items():
                for f in row.get("fx", []):
                    if f["cmd"] not in VALID_ANY | set(ONLY):
                        problems.append(f"{song}: table {t} row {r}: unknown {f['cmd']}")
        print(f"{song}: {len(inst)} instruments, used in phrases: {', '.join(sorted(used))}")
    print("problems:" if problems else "no problems", *problems, sep="\n  ")
    return problems


if __name__ == "__main__":
    what = sys.argv[1] if len(sys.argv) > 1 else "check"
    if what == "json":
        print(json.dumps(SONGS, ensure_ascii=False, indent=1))
    else:
        check()
