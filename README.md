# methodos

A personal library of curated guides: HTML artifacts made in Claude or ChatGPT, collected
into small "mini wikis" with one subject per guide. The first guide is the Dirtywave M8 (song
walkthroughs, Tables and sampling tutorials, patch cards). Other guides, on music or anything
else, are added as data without changing the app.

## Run it

```
python3 -m http.server 8000 -d site      # then open http://localhost:8000/
```

On the tailnet it is served from tikiserv at **https://tikiserv.saiga-wage.ts.net:8450/**
(`tailscale serve`, straight from `site/`, so a push isn't needed to see a change there).
That URL is HTTPS, so the Pixel can install it as an app.

## Add an artifact

```
python3 tools/methodos.py add m8 ~/Downloads/tables-101.html --section techniques
python3 tools/methodos.py check
```

`python3 tools/methodos.py --help` covers the rest (`new`, `list`, links, tags, groups). The
in-app guide "How Methodos works" explains the same things with examples.

## Layout

```
site/                  the whole app; no build step
  index.html app.js style.css sw.js manifest.json icons/
  guides/index.json    which guides are on the shelf, in order
  guides/<id>/guide.json, guides/<id>/pages/*.html
tools/methodos.py      curation CLI (stdlib Python)
```
