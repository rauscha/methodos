"""Shared helpers: turn parts data into M8 tables, staff lines, and harmony checks."""
import re

PC = {"C": 0, "C#": 1, "D": 2, "D#": 3, "E": 4, "F": 5, "F#": 6, "G": 7, "G#": 8, "A": 9, "A#": 10, "B": 11}
SHARP_NAMES = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"]
FLAT_NAMES = ["C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭", "A", "B♭", "B"]


def parse(n):
    """'D-4' / 'C#5' -> midi-ish number (octave*12+pc). None for OFF."""
    if n is None or n == "OFF":
        return None
    m = re.match(r"([A-G])([-#])(-?\d)", n)
    name = m.group(1) + ("#" if m.group(2) == "#" else "")
    return int(m.group(3)) * 12 + PC[name]


def staff_name(n, flats=False):
    p = parse(n)
    names = FLAT_NAMES if flats else SHARP_NAMES
    return f"{names[p % 12]}{p // 12}"


DUR = {1: "16th", 2: "8th", 3: "dotted 8th", 4: "quarter", 6: "dotted quarter", 8: "half",
       12: "dotted half", 16: "whole"}


def dur_name(r):
    if r in DUR:
        return DUR[r]
    # compose from the largest pieces
    parts = []
    for size in (16, 12, 8, 6, 4, 3, 2, 1):
        while r >= size and size in DUR:
            if size in (12, 6, 3) and parts:  # avoid dotted pieces after the first
                continue
            parts.append(DUR[size])
            r -= size
            break
        else:
            continue
    # fallback greedy without dotted after first
    return " + ".join(parts) if r == 0 else None


def compose(r):
    out = []
    first = True
    for size in (16, 12, 8, 6, 4, 3, 2, 1):
        if not first and size in (12, 6, 3):
            continue
        while r >= size:
            out.append(DUR[size])
            r -= size
            first = False
    return " + ".join(out) + (" tied" if len(out) > 1 else "")


def dname(r):
    return DUR.get(r) or compose(r)


def hexrow(r):
    return format(r, "X")


class Row:
    def __init__(self, r, n=None, v=None, i=None, fx=(), note="", step=None, until=None):
        self.r, self.n, self.v, self.i, self.fx, self.note = r, n, v, i, list(fx), note
        self.step, self.until = step, until


class Phrase:
    def __init__(self, num, track, title, step, rows, flats=False, tie_in=None, tie_out=False,
                 drum=None, about="", staff=None, until=None, cap=None):
        self.num, self.track, self.title, self.step = num, track, title, step
        self.rows = rows
        self.flats, self.tie_in, self.tie_out = flats, tie_in, tie_out
        self.drum = drum  # dict note->label for drum phrases
        self.about = about
        self.staff_override = staff
        self.until = until
        self.cap = cap

    def staff(self):
        if self.staff_override:
            return self.staff_override
        if self.drum is not None:
            return self.drum_staff()
        events = [x for x in self.rows if x.n is not None]
        if not events:
            if self.tie_in:
                return f"| {self.tie_in} (tied) whole |"
            return "| whole-bar rest |" if self.tie_in is None else ""
        out = []
        first = events[0].r
        if first > 0:
            if self.tie_in:
                out.append(f"{self.tie_in} (tied) {dname(first)}")
            else:
                out.append(f"rest {dname(first).replace(' tied', '')}")
        for k, e in enumerate(events):
            end = events[k + 1].r if k + 1 < len(events) else 16
            d = end - e.r
            if e.n == "OFF":
                if d:
                    out.append(f"rest {dname(d).replace(' tied', '')}")
                continue
            rest = 0
            if self.cap and d > self.cap:
                d, rest = self.cap, d - self.cap
            tag = staff_name(e.n, self.flats) + " " + dname(d)
            if k + 1 == len(events) and self.tie_out and not rest:
                tag += " →"
            out.append(tag)
            if rest:
                out.append(f"rest {dname(rest).replace(' tied', '')}")
        return "| " + "  ".join(out) + " |"

    def drum_staff(self):
        counts = {}
        for x in self.rows:
            if x.n is None or x.n == "OFF":
                continue
            lab = self.drum.get((x.n, x.i), self.drum.get(x.n, x.n))
            beat = x.r // 4 + 1
            sub = ["", "e", "&", "a"][x.r % 4]
            counts.setdefault(lab, []).append(f"{beat}{sub}")
        return "| " + " · ".join(f"{k} {', '.join(v)}" for k, v in counts.items()) + " |"

    def md(self):
        lines = [f"#### Phrase {self.num} · track {self.track} · {self.title} · step {self.step}"
                 + (f", until {self.until}" if self.until else ""), ""]
        if self.about:
            lines += [self.about, ""]
        lines += [f"Staff: {self.staff()}", ""]
        if not self.rows:
            lines += ["(empty phrase)", ""]
            return "\n".join(lines)
        lines += ["| Row | N | V | I | FX1 | FX2 | FX3 | Step | Note |",
                  "|-----|---|---|---|-----|-----|-----|------|------|"]
        for x in self.rows:
            fx = list(x.fx) + ["", "", ""]
            st = x.step if x.step is not None else self.step
            stxt = str(st) + (f", until {x.until}" if x.until else "")
            lines.append(f"| {hexrow(x.r)} | {x.n or ''} | {x.v or ''} | {x.i or ''} | {fx[0]} | {fx[1]} | {fx[2]} | {stxt} | {x.note} |")
        lines.append("")
        return "\n".join(lines)


def chord_set(spec):
    return {PC[s] for s in spec.split()}


def check(song_rows, chains, phrases, chords, row_harmony, allowed, skip_tracks=()):
    """Walk each song row; every pitched note against the bar's chord. Return (unexpected, expected)."""
    unexpected, expected = [], []
    for row, cells in song_rows:
        harm = row_harmony.get(row)
        if harm is None:
            continue
        for t, ch in cells.items():
            if t in skip_tracks or ch is None:
                continue
            for bar, ph in enumerate(chains[ch]):
                p = phrases.get(ph)
                if p is None:
                    continue
                cname = harm[bar]
                if cname is None:
                    continue
                cs = chords[cname]
                for x in p.rows:
                    if x.n is None or x.n == "OFF":
                        continue
                    if p.drum is not None:
                        continue
                    pc = parse(x.n) % 12
                    if pc not in cs:
                        key = (ph, x.r)
                        rec = f"row {row} T{t} chain {ch} bar {bar+1} ({cname}) phrase {ph} row {hexrow(x.r)} {x.n}"
                        if key in allowed:
                            expected.append(rec + f": {allowed[key]}")
                        else:
                            unexpected.append(rec)
    return unexpected, expected


def sounding(song_rows, chains, phrases, caps, row):
    """Per-16th list of (track, pitch) sounding in one song row, using note-to-next-event lengths capped per track."""
    cells = dict(song_rows)[row]
    grid = {}
    for t, ch in cells.items():
        if ch is None:
            continue
        evs = []
        for bar, ph in enumerate(chains[ch]):
            p = phrases.get(ph)
            if p is None or p.drum is not None:
                continue
            for x in p.rows:
                if x.n is not None:
                    evs.append((bar * 16 + x.r, x.n))
        evs.sort()
        for k, (pos, n) in enumerate(evs):
            if n == "OFF":
                continue
            end = evs[k + 1][0] if k + 1 < len(evs) else 128
            end = min(end, pos + caps.get(t, 16))
            for s in range(pos, end):
                grid.setdefault(s, []).append((t, parse(n), n))
    return grid


def close_clashes(grid, lead_track, others):
    """Half-step or minor-ninth between the lead track and any other pitched track at the same 16th."""
    out = set()
    for s, notes in grid.items():
        leads = [x for x in notes if x[0] == lead_track]
        for lt, lp, ln in leads:
            for ot, op, on in notes:
                if ot == lead_track or ot not in others:
                    continue
                d = abs(lp - op)
                if d in (1, 13):
                    out.add((s // 16 + 1, ln, f"T{ot} {on}", d))
    return sorted(out)
