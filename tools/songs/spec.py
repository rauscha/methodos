"""Turn the parts model (fp.py / op.py) and the settings (instruments.py) into a song spec in
the shape site/guides/m8/songs/low-tide.json uses, for the kit (site/guides/m8/kit/m8kit.js).

Shared by tools/m8_faded_polaroid.py and tools/m8_overpass.py. Nothing here is song-specific:
the song rows, tracks and harmony are passed in by those scripts.

- Phrase rows are hex in the parts and decimal in the JSON ("10" is row A).
- Every element carries the walkthrough step that introduces it (`step`) and, where it goes
  away again, the last step it belongs to (`until`). FX carry their row's step.
- Mod types keep Low Tide's strings (the kit keys on them); `num` is the number the 6.6.3
  screen shows in front of the type (his photos: 00 AHD ENV, 01 ADSR ENV, 03 LFO).
- An empty song cell on the M8 ends that track's list ("it will loop back to the beginning of
  its list of chains", manual, Song View), so the finished song fills every empty cell with
  the silence chain FE (FD, an OFF, then seven empty FE phrases), as Low Tide does.
"""
import copy

MOD_NUM = {"AHD ENV": "00", "ADSR ENV": "01", "LFO": "03"}


def step_of(v):
    """CSTEP values are ints or strings like '3, until 4'."""
    if isinstance(v, int):
        return v, None
    s = str(v)
    if "until" in s:
        a, b = s.split(",")
        return int(a), int(b.replace("until", "").strip())
    return int(s), None


def cell(row, ph):
    st = row.step if row.step is not None else ph.step
    un = row.until if row.until is not None else ph.until
    c = {}
    if row.n is not None:
        c["n"] = row.n
    if row.v is not None and row.n != "OFF":
        c["v"] = row.v
    if row.i is not None and row.n != "OFF":
        c["i"] = row.i
    if row.fx:
        fx = []
        for f in row.fx:
            cmd, val = f.split()[:2]
            e = {"cmd": cmd, "val": val, "step": st}
            if un is not None:
                e["until"] = un
            fx.append(e)
        c["fx"] = fx
    c["step"] = st
    if un is not None:
        c["until"] = un
    return c


def phrases(P):
    out = {}
    for k, ph in P.items():
        d = {"rows": {str(r.r): cell(r, ph) for r in ph.rows}}
        if ph.about:
            d["about"] = ph.about
        if ph.until is not None:
            d["until"] = ph.until
        out[k] = d
    return out


def chains(C, CSTEP, extra=None):
    out = {}
    for k, phs in C.items():
        st, un = step_of(CSTEP.get(k, 0))
        out[k] = [dict(ph=p, step=st, **({"until": un} if un is not None else {})) for p in phs]
    for k, (phs, st) in (extra or {}).items():
        out[k] = [{"ph": p, "step": st} for p in phs]
    return out


def instruments(INST, extra=None):
    out = copy.deepcopy(INST)
    for i in out.values():
        for m in i.get("mods", []):
            if m["type"] in MOD_NUM:
                m["num"] = MOD_NUM[m["type"]]
    for k, v in (extra or {}).items():
        out[k].update(v)
    return out


def song_rows(working, final_rows, steps, final_step, n_tracks=8):
    """working: (row, track, chain, step, until) cells for the workbench steps.
    final_rows: [(row, {track: chain})] for the finished song at final_step.
    Returns spec 'song' entries, each one song row over a run of steps with the same cells."""
    out = []
    rows = sorted({w[0] for w in working})
    for r in rows:
        runs = []
        for s in steps:
            cells = {str(t): ch for (rr, t, ch, a, b) in working if rr == r and a <= s <= b}
            if runs and runs[-1][1] == cells and runs[-1][3] == s - 1:
                runs[-1][3] = s
            else:
                runs.append([s, cells, s, s])
        for a, cells, _, b in runs:
            if cells:
                out.append({"row": r, "chains": dict(sorted(cells.items(), key=lambda kv: int(kv[0]))),
                            "step": a, "until": b})
    for r, cells in final_rows:
        full = {str(t): cells.get(t, "FE") for t in range(1, n_tracks + 1)}
        out.append({"row": r, "chains": full, "step": final_step})
    return out


def nostep(o):
    if isinstance(o, dict):
        return {k: nostep(v) for k, v in o.items() if k not in ("step", "until")}
    if isinstance(o, list):
        return [nostep(v) for v in o]
    return o


def pick(d, keys):
    return {k: d[k] for k in keys}
