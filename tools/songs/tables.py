import sys, importlib
mod = importlib.import_module(sys.argv[1])
steps, desc, track = mod.CSTEP, mod.CDESC, mod.CTRACK
print("| Chain | Track | Phrases in order (one bar each) | TSP | Step | What it is |")
print("|---|---|---|---|---|---|")
for ch in mod.CORDER:
    print(f"| {ch} | {track[ch]} | {' '.join(mod.C[ch])} | — | {steps[ch]} | {desc[ch]} |")
