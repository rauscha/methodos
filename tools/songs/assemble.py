"""Splice generated phrase and chain tables into a hand-written template.

    python3 assemble.py fp template.md out.md
"""
import sys, importlib, io, contextlib, re

modname, tpl, out = sys.argv[1:4]
mod = importlib.import_module(modname)
heads = getattr(mod, "THEADS", {})

def phrases_md():
    order = sorted((k for k in mod.P if k not in ("FD", "FE")), key=lambda k: int(k, 16)) + ["FD", "FE"]
    first = getattr(mod, "FIRST", "")
    if first:
        order = [k for k in order if k.startswith(first)] + [k for k in order if not k.startswith(first)]
    parts, cur = [], None
    for k in order:
        g = "shared" if k in ("FD", "FE") else k[0]
        if g != cur:
            cur = g
            parts.append(f"### {heads.get(g, g)}\n")
        parts.append(mod.P[k].md())
    return "\n".join(parts)

def chains_md():
    lines = ["| Chain | Track | Phrases in order (one bar each) | TSP | Step | What it is |", "|---|---|---|---|---|---|"]
    for ch in mod.CORDER:
        lines.append(f"| {ch} | {mod.CTRACK[ch]} | {' '.join(mod.C[ch])} | — | {mod.CSTEP[ch]} | {mod.CDESC[ch]} |")
    return "\n".join(lines)

text = open(tpl).read()
text = text.replace("{{PHRASES}}", phrases_md()).replace("{{CHAINS}}", chains_md())
open(out, "w").write(text)
print("wrote", out, len(text.splitlines()), "lines")
