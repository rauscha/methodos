// Methodos: a library of guides. Each guide is a folder of HTML artifacts plus a
// guide.json that orders them into sections. The app knows nothing about any one
// subject; everything subject-specific lives in site/guides/<id>/.
//
// Routes (hash-based, so the app works from any sub-path and offline):
//   #/                    library
//   #/<guide>             a guide's contents
//   #/<guide>/<page>      one page, shown in a frame
//
// Guides come from two places: the shelf on the server (guides/index.json), and
// guides added from a file on this device, which never touch the server.

const app = document.getElementById('app');
const LAYOUTS = new Set(['steps', 'cards']);
export const DATA_CACHE = 'methodos-data';
// Guides added from a file live here at local/<id>/..., and the service worker
// answers those URLs from this cache alone (sw.js).
export const LOCAL_CACHE = 'methodos-local';

// ---- storage (wrapped: private windows and blocked storage must not break the app)

const store = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem('methodos:' + key);
      return v == null ? fallback : JSON.parse(v);
    } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem('methodos:' + key, JSON.stringify(value)); } catch {}
  },
};

const doneSet = (guideId) => new Set(store.get(`done:${guideId}`, []));
function setDone(guideId, pageId, done) {
  const s = doneSet(guideId);
  done ? s.add(pageId) : s.delete(pageId);
  store.set(`done:${guideId}`, [...s]);
}

// ---- loading

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

async function getJSON(path) {
  const r = await fetch(path, { cache: 'no-cache' });
  if (!r.ok) throw new Error(`${path}: HTTP ${r.status}`);
  return r.json();
}

// Turn a raw guide.json into something the views can walk: every page gets its
// section, its position, its resolved URL, and the pages that link to it.
function normalize(id, raw, base = `guides/${id}/`) {
  const pages = [];
  const byId = new Map();
  const sections = (raw.sections ?? []).map((s) => {
    const section = { ...s, layout: LAYOUTS.has(s.layout) ? s.layout : 'cards', items: [] };
    for (const p of s.pages ?? []) {
      const page = {
        ...p,
        tags: p.tags ?? [],
        links: p.links ?? [],
        backlinks: [],
        section,
        index: section.items.length,
        url: `${base}${p.file}`,
      };
      section.items.push(page);
      pages.push(page);
      byId.set(p.id, page);
    }
    return section;
  });
  for (const p of pages) {
    for (const target of p.links) byId.get(target)?.backlinks.push(p);
  }
  return { ...raw, id, sections, pages, byId };
}

let library = null;

async function loadLibrary() {
  // Guides on this device, and the button to add one, still work when the shelf can't
  // be reached (offline, or a bad connection).
  const local = await localGuides().catch(() => []);
  let index, shelfError = null;
  try { index = await getJSON('guides/index.json'); } catch (err) {
    index = { guides: [] };
    shelfError = String(err.message ?? err);
  }
  const guides = await Promise.all((index.guides ?? []).map(async (id) => {
    try {
      return normalize(id, await getJSON(`guides/${id}/guide.json`));
    } catch (err) {
      return { ...normalize(id, {}), title: id, error: String(err.message ?? err) };
    }
  }));
  const shelf = new Set(guides.map((g) => g.id));
  for (const g of local) if (!shelf.has(g.id)) guides.push(g);
  library = { guides, shelfError, byId: new Map(guides.map((g) => [g.id, g])) };
}

// ---- guides added from a file
//
// The file is a .zip of a guide folder (tools/methodos.py pack makes one): guide.json
// and pages/ at the top, or inside one folder named for the guide. Each file goes into
// LOCAL_CACHE, so the guide works offline at once and is only ever on this device.

const localURL = (id, rel = '') => new URL(`local/${id}/${rel}`, location.href).href;

async function localGuides() {
  if (!('caches' in window)) return [];
  const cache = await caches.open(LOCAL_CACHE);
  const out = [];
  for (const req of await cache.keys()) {
    const m = req.url.match(/\/local\/([^/]+)\/guide\.json$/);
    if (!m || req.url !== localURL(m[1], 'guide.json')) continue;
    const id = decodeURIComponent(m[1]);
    try {
      const g = normalize(id, await (await cache.match(req)).json(), `local/${id}/`);
      out.push({ ...g, local: store.get(`local:${id}`, null) ?? {} });
    } catch {}
  }
  return out.sort((a, b) => (a.local.added ?? '').localeCompare(b.local.added ?? ''));
}

const MIME = {
  html: 'text/html', htm: 'text/html', css: 'text/css', js: 'text/javascript', mjs: 'text/javascript',
  json: 'application/json', txt: 'text/plain', md: 'text/plain', svg: 'image/svg+xml',
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif',
  avif: 'image/avif', mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg', m4a: 'audio/mp4',
  mp4: 'video/mp4', webm: 'video/webm', woff2: 'font/woff2', woff: 'font/woff', pdf: 'application/pdf',
};
const mimeOf = (name) => {
  const type = MIME[name.split('.').pop().toLowerCase()] ?? 'application/octet-stream';
  return type.startsWith('text/') || type.endsWith('json') || type.endsWith('javascript') ? `${type}; charset=utf-8` : type;
};

// A small zip reader: the central directory, then each entry stored or deflated.
// Zip64 and encrypted archives are refused.
function readZip(buf) {
  const v = new DataView(buf);
  let eocd = -1;
  for (let i = buf.byteLength - 22; i >= Math.max(0, buf.byteLength - 22 - 0xffff); i--) {
    if (v.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error('this is not a zip file');
  const count = v.getUint16(eocd + 10, true);
  let p = v.getUint32(eocd + 16, true);
  if (count === 0xffff || p === 0xffffffff) throw new Error('this zip is too large (zip64)');
  const text = new TextDecoder();
  const entries = [];
  for (let n = 0; n < count; n++) {
    if (v.getUint32(p, true) !== 0x02014b50) throw new Error('the zip file is damaged');
    const flags = v.getUint16(p + 8, true);
    const method = v.getUint16(p + 10, true);
    const size = v.getUint32(p + 20, true);
    const nameLen = v.getUint16(p + 28, true);
    const at = v.getUint32(p + 42, true);
    const name = text.decode(new Uint8Array(buf, p + 46, nameLen));
    if (flags & 1) throw new Error('the zip is encrypted');
    if (method !== 0 && method !== 8) throw new Error(`${name}: unsupported compression`);
    const start = at + 30 + v.getUint16(at + 26, true) + v.getUint16(at + 28, true);
    entries.push({ name, method, data: new Uint8Array(buf, start, size) });
    p += 46 + nameLen + v.getUint16(p + 30, true) + v.getUint16(p + 32, true);
  }
  return entries;
}

async function unpack({ method, data }) {
  if (method === 0) return data;
  const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

async function addFromFile(file, say) {
  const entries = readZip(await file.arrayBuffer())
    .filter((e) => !e.name.endsWith('/') && !e.name.startsWith('__MACOSX/'));
  const manifest = entries.find((e) => e.name === 'guide.json')
    ?? entries.find((e) => /^[^/]+\/guide\.json$/.test(e.name));
  if (!manifest) throw new Error('there is no guide.json in this file');
  const prefix = manifest.name.slice(0, -'guide.json'.length);
  const id = slug(prefix ? prefix.slice(0, -1) : file.name.replace(/\.zip$/i, ''));
  if (!id) throw new Error('could not tell the guide’s name from the file');
  if (library.byId.has(id) && !library.byId.get(id).local) {
    throw new Error(`a guide called “${id}” is already on the shelf`);
  }
  let raw;
  try { raw = JSON.parse(new TextDecoder().decode(await unpack(manifest))); } catch {
    throw new Error('guide.json is not valid JSON');
  }
  const files = entries.filter((e) => e.name.startsWith(prefix)).map((e) => ({ ...e, rel: e.name.slice(prefix.length) }));
  const unsafe = files.find((f) => f.rel.startsWith('/') || f.rel.split('/').includes('..'));
  if (unsafe) throw new Error(`${unsafe.name}: unsafe path`);

  const cache = await caches.open(LOCAL_CACHE);
  await removeLocal(id);
  let bytes = 0;
  for (const [i, f] of files.entries()) {
    const body = await unpack(f);
    bytes += body.byteLength;
    await cache.put(localURL(id, f.rel.split('/').map(encodeURIComponent).join('/')),
      new Response(body, { headers: { 'Content-Type': mimeOf(f.rel), 'Content-Length': String(body.byteLength) } }));
    say(`Adding “${raw.title ?? id}”: ${i + 1} of ${files.length} files…`);
  }
  store.set(`local:${id}`, { added: new Date().toISOString(), bytes, file: file.name });
  // Ask the browser not to clear these files when space runs low.
  const kept = await navigator.storage?.persist?.().catch(() => false);
  return { id, title: raw.title ?? id, files: files.length, bytes, kept };
}

async function removeLocal(id) {
  const cache = await caches.open(LOCAL_CACHE);
  const base = localURL(id);
  for (const req of await cache.keys()) if (req.url.startsWith(base)) await cache.delete(req);
}

const megabytes = (n) => n < 1e5 ? `${Math.max(1, Math.round(n / 1e3))} KB` : `${(n / 1e6).toFixed(n < 1e7 ? 1 : 0)} MB`;

// ---- small view helpers

function bar({ back, title, sub, actions = '' }) {
  return `
    <header class="bar">
      ${back ? `<a class="back" href="${back.href}"><span aria-hidden="true">←</span> ${esc(back.label)}</a>` : ''}
      <div class="bar-title">
        ${sub ? `<span class="kicker">${esc(sub)}</span>` : ''}
        <h1>${esc(title)}</h1>
      </div>
      <div class="bar-actions">${actions}</div>
    </header>`;
}

const tagList = (tags) => tags.length
  ? `<ul class="tags">${tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : '';

// Done is shown by shape and words, never by color: a filled disc with a check
// versus an open ring with the step number.
const mark = (done, label) => done
  ? `<span class="mark is-done" aria-label="done"><span aria-hidden="true">✓</span></span>`
  : `<span class="mark" aria-label="not done">${esc(label)}</span>`;

const countLine = (items, done) => {
  const n = items.filter((p) => done.has(p.id)).length;
  return `${n} of ${items.length} done`;
};

// ---- library view

// The shelf's order and hidden guides are this device's own, kept beside done marks.
let arranging = false;
function arrangedGuides() {
  const { order = [], hidden = [] } = store.get('shelf', {});
  const rank = (id) => { const i = order.indexOf(id); return i < 0 ? Infinity : i; };
  const all = library.guides.map((g, i) => ({ g, i }))
    .sort((a, b) => rank(a.g.id) - rank(b.g.id) || a.i - b.i).map((x) => x.g);
  return { all, shown: all.filter((g) => !hidden.includes(g.id)), hidden: all.filter((g) => hidden.includes(g.id)) };
}
function saveShelf(all, hidden) {
  store.set('shelf', { order: all.map((g) => g.id), hidden: hidden.map((g) => g.id) });
}

function renderLibrary(focus) {
  document.title = 'Methodos';
  const { all, shown, hidden } = arrangedGuides();
  const cards = shown.map((g, i) => {
    const done = doneSet(g.id);
    const meta = g.error
      ? `Could not load: ${esc(g.error)}`
      : (g.local ? 'On this device only · ' : '') + (g.pages.length
        ? `${g.pages.length} page${g.pages.length === 1 ? '' : 's'} · ${countLine(g.pages, done)}`
        : 'No pages yet');
    return `
      <li>
        <a class="guide-card" href="#/${encodeURIComponent(g.id)}">
          ${g.subtitle ? `<span class="kicker">${esc(g.subtitle)}</span>` : ''}
          <h2>${esc(g.title ?? g.id)}</h2>
          ${g.description ? `<p>${esc(g.description)}</p>` : ''}
          <span class="meta">${meta}</span>
        </a>
        ${arranging ? `<div class="arrange-row" role="group" aria-label="Arrange ${esc(g.title ?? g.id)}">
          <button class="button" type="button" data-move="-1" data-id="${esc(g.id)}" ${i === 0 ? 'disabled' : ''}><span aria-hidden="true">↑</span> Up</button>
          <button class="button" type="button" data-move="1" data-id="${esc(g.id)}" ${i === shown.length - 1 ? 'disabled' : ''}><span aria-hidden="true">↓</span> Down</button>
          <button class="button" type="button" data-hide="${esc(g.id)}">Hide</button>
        </div>` : ''}
      </li>`;
  }).join('');
  const hiddenList = hidden.length ? `
      <details class="hidden-guides" ${arranging ? 'open' : ''}>
        <summary>Hidden guides (${hidden.length})</summary>
        <ul class="link-list">${hidden.map((g) => `
          <li><a href="#/${encodeURIComponent(g.id)}">${esc(g.title ?? g.id)}</a>
            <button class="button" type="button" data-show="${esc(g.id)}">Show</button></li>`).join('')}
        </ul>
      </details>` : '';
  app.innerHTML = `
    ${bar({ title: 'Methodos', sub: 'Library' })}
    <main class="page-body">
      ${library.shelfError ? `<p class="empty">Couldn't reach the shelf (${esc(library.shelfError)}). Check the connection and reload; guides on this device still open.</p>` : ''}
      <ul class="guide-grid${arranging ? ' arranging' : ''}">${cards || (library.shelfError || hidden.length ? '' : '<li class="empty">No guides yet. Add one with <code>tools/methodos.py new</code>.</li>')}</ul>
      ${hiddenList}
      <div class="guide-tools library-tools">
        ${all.length > 1 ? `<button class="button toggle" type="button" data-arrange aria-pressed="${arranging}">${arranging ? 'Done arranging' : 'Arrange'}</button>` : ''}
        ${'caches' in window ? `<button class="button" type="button" data-add>Add a guide from a file</button>
        <input type="file" accept=".zip,application/zip" hidden data-file>
        <span class="add-status meta" role="status"></span>` : ''}
      </div>
    </main>`;

  // Arrange: move, hide, show. Re-render, then put focus back on the button that was used.
  app.querySelector('.page-body').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    const { all: list, hidden: off } = arrangedGuides();
    if (b.hasAttribute('data-arrange')) {
      arranging = !arranging;
      return renderLibrary('[data-arrange]');
    }
    if (b.dataset.move) {
      const id = b.dataset.id, dir = Number(b.dataset.move);
      const on = list.filter((g) => !off.includes(g));
      const j = on.findIndex((g) => g.id === id) + dir;
      if (j < 0 || j >= on.length) return;
      const a = list.findIndex((g) => g.id === id), c = list.indexOf(on[j]);
      [list[a], list[c]] = [list[c], list[a]];
      saveShelf(list, off);
      return renderLibrary(`[data-move="${dir}"][data-id="${CSS.escape(id)}"]`);
    }
    if (b.dataset.hide) {
      saveShelf(list, [...off, list.find((g) => g.id === b.dataset.hide)]);
      return renderLibrary('[data-arrange]');
    }
    if (b.dataset.show) {
      saveShelf(list, off.filter((g) => g.id !== b.dataset.show));
      return renderLibrary(`[data-id="${CSS.escape(b.dataset.show)}"]`);
    }
  });
  if (focus) (app.querySelector(`${focus}:not(:disabled)`) ?? app.querySelector('[data-arrange]'))?.focus();

  const input = app.querySelector('[data-file]');
  const status = app.querySelector('.add-status');
  app.querySelector('[data-add]')?.addEventListener('click', () => input.click());
  input?.addEventListener('change', async () => {
    const file = input.files[0];
    if (!file) return;
    const button = app.querySelector('[data-add]');
    button.disabled = true;
    try {
      const r = await addFromFile(file, (msg) => { status.textContent = msg; });
      library = null;
      await loadLibrary();
      renderLibrary();
      app.querySelector('.add-status').textContent = `Added “${r.title}”: ${r.files} files, ${megabytes(r.bytes)}. ` +
        (r.kept ? 'The browser will keep it.' : 'The browser may clear it if the device runs low on space.');
    } catch (err) {
      status.textContent = `Could not add ${file.name}: ${err.message ?? err}.`;
      button.disabled = false;
    }
    input.value = '';
  });
}

// ---- guide view

function pageRow(g, p, done) {
  const href = `#/${encodeURIComponent(g.id)}/${encodeURIComponent(p.id)}`;
  const isDone = done.has(p.id);
  if (p.section.layout === 'steps') {
    return `
      <li class="${isDone ? 'is-done' : ''}">
        <a class="step" href="${href}">
          ${mark(isDone, p.index + 1)}
          <span class="step-text">
            <span class="step-title">${esc(p.title)}</span>
            ${p.summary ? `<span class="summary">${esc(p.summary)}</span>` : ''}
          </span>
        </a>
      </li>`;
  }
  return `
    <li class="${isDone ? 'is-done' : ''}">
      <a class="card" href="${href}">
        <span class="card-head">
          <span class="card-title">${esc(p.title)}</span>
          ${isDone ? '<span class="done-word"><span aria-hidden="true">✓</span> done</span>' : ''}
        </span>
        ${p.summary ? `<span class="summary">${esc(p.summary)}</span>` : ''}
        ${tagList(p.tags)}
      </a>
    </li>`;
}

function renderSection(g, s, done) {
  const list = s.items.length
    ? `<${s.layout === 'steps' ? 'ol class="steps"' : 'ul class="cards"'}>
         ${s.items.map((p) => pageRow(g, p, done)).join('')}
       </${s.layout === 'steps' ? 'ol' : 'ul'}>`
    : `<p class="empty">Nothing here yet.</p>`;
  // Every section folds shut with a tap on its heading; the device remembers which.
  const folded = foldSet(g.id).has(s.id);
  return `
    <details class="section" data-section="${esc(s.id)}" ${folded ? '' : 'open'}>
      <summary class="section-head">
        <span class="fold-mark" aria-hidden="true"></span>
        <h3>${esc(s.title ?? s.id)}</h3>
        ${s.items.length ? `<span class="meta">${countLine(s.items, done)}</span>` : ''}
        <span class="fold-word meta" aria-hidden="true"></span>
      </summary>
      ${s.description ? `<p class="section-desc">${esc(s.description)}</p>` : ''}
      ${list}
    </details>`;
}

const foldSet = (guideId) => new Set(store.get(`fold:${guideId}`, []));
function wireFolds(g, root) {
  root.querySelectorAll('details.section').forEach((d) => d.addEventListener('toggle', () => {
    const s = foldSet(g.id);
    d.open ? s.delete(d.dataset.section) : s.add(d.dataset.section);
    store.set(`fold:${g.id}`, [...s]);
  }));
}

function matches(p, q) {
  const hay = [p.title, p.summary, p.section.title, ...p.tags].join(' ').toLowerCase();
  return q.split(/\s+/).every((word) => hay.includes(word));
}

function renderGuideBody(g, q) {
  const done = doneSet(g.id);
  if (q) {
    const hits = g.pages.filter((p) => matches(p, q));
    return hits.length
      ? `<ul class="cards results">${hits.map((p) => pageRow(g, { ...p, section: { layout: 'cards' } }, done)).join('')}</ul>`
      : `<p class="empty">No pages match “${esc(q)}”.</p>`;
  }
  // Sections that share a `group` are shown under one heading (several song
  // walkthroughs, each its own step-by-step section, under "Songs").
  let out = '';
  let lastGroup;
  for (const s of g.sections) {
    if (s.group && s.group !== lastGroup) out += `<h2 class="group">${esc(s.group)}</h2>`;
    lastGroup = s.group;
    out += renderSection(g, s, done);
  }
  return out || '<p class="empty">This guide has no sections yet.</p>';
}

function renderGuide(g) {
  document.title = `${g.title ?? g.id} · Methodos`;
  if (g.error) {
    app.innerHTML = `${bar({ back: { href: '#/', label: 'Library' }, title: g.title })}
      <main class="page-body"><p class="empty">Could not load this guide: ${esc(g.error)}</p></main>`;
    return;
  }
  const last = g.byId.get(store.get(`last:${g.id}`, null));
  const q = store.get(`q:${g.id}`, '');
  app.innerHTML = `
    ${bar({ back: { href: '#/', label: 'Library' }, title: g.title ?? g.id, sub: g.subtitle })}
    <main class="page-body">
      ${g.description ? `<p class="lede">${esc(g.description)}</p>` : ''}
      ${g.local ? `<p class="meta">On this device only, added from ${esc(g.local.file ?? 'a file')}${g.local.bytes ? ` (${megabytes(g.local.bytes)})` : ''}. It works offline.</p>` : ''}
      <div class="guide-tools">
        ${last ? `<a class="button primary" href="#/${encodeURIComponent(g.id)}/${encodeURIComponent(last.id)}">Continue: ${esc(last.title)}</a>` : ''}
        ${g.pages.length ? `<label class="search"><span class="visually-hidden">Search this guide</span>
          <input type="search" placeholder="Search ${g.pages.length} pages" value="${esc(q)}" autocomplete="off"></label>` : ''}
        ${g.local
          ? `<button class="button" type="button" data-remove>Remove from this device</button>`
          : g.pages.length && 'caches' in window ? `<button class="button" type="button" data-save>Save for offline</button>` : ''}
        <span class="save-status meta" role="status"></span>
      </div>
      <div class="guide-body">${renderGuideBody(g, q.trim().toLowerCase())}</div>
    </main>`;

  const input = app.querySelector('input[type=search]');
  const body = app.querySelector('.guide-body');
  wireFolds(g, body);
  input?.addEventListener('input', () => {
    store.set(`q:${g.id}`, input.value);
    body.innerHTML = renderGuideBody(g, input.value.trim().toLowerCase());
    wireFolds(g, body);
  });
  app.querySelector('[data-save]')?.addEventListener('click', (e) => saveOffline(g, e.currentTarget));
  app.querySelector('[data-remove]')?.addEventListener('click', async () => {
    if (!confirm(`Remove “${g.title ?? g.id}” from this device? Its pages are deleted; add the file again to bring it back.`)) return;
    await removeLocal(g.id);
    store.set(`local:${g.id}`, null);
    library = null;
    location.hash = '#/';
  });
}

// Fetch every page of a guide into the cache the service worker reads from.
// Scripts and fonts a page pulls from a CDN are cached the first time the page
// is opened, so open each page once online for a fully offline guide.
async function saveOffline(g, button) {
  const status = app.querySelector('.save-status');
  button.disabled = true;
  const cache = await caches.open(DATA_CACHE);
  // Pages, plus the guide's own scripts, styles and data (its "files" list).
  const urls = [...g.pages.map((p) => p.url), ...(g.files ?? []).map((f) => `guides/${g.id}/${f}`)];
  let ok = 0;
  for (const url of urls) {
    try {
      const r = await fetch(url, { cache: 'no-cache' });
      if (r.ok) { await cache.put(url, r); ok++; }
    } catch {}
    status.textContent = `Saving ${ok} of ${urls.length}…`;
  }
  const extra = urls.length - g.pages.length;
  status.textContent = ok === urls.length
    ? `Saved all ${g.pages.length} pages${extra ? ` and ${extra} supporting files` : ''}.`
    : `Saved ${ok} of ${urls.length} files; the rest failed to load.`;
  button.disabled = false;
}

// ---- page view

let framed = null; // { guide, page } currently in the frame

function linkItems(g, pages) {
  return pages.map((p) => `<li><a href="#/${encodeURIComponent(g.id)}/${encodeURIComponent(p.id)}">${esc(p.title)}</a>
    <span class="meta">${esc(p.section.title ?? '')}</span></li>`).join('');
}

function renderPage(g, p) {
  document.title = `${p.title} · ${g.title ?? g.id}`;
  store.set(`last:${g.id}`, p.id);
  const s = p.section;
  const prev = s.items[p.index - 1];
  const next = s.items[p.index + 1];
  const isDone = doneSet(g.id).has(p.id);
  const outgoing = p.links.map((id) => g.byId.get(id)).filter(Boolean);
  const nLinks = outgoing.length + p.backlinks.length;
  const pageHref = (q) => `#/${encodeURIComponent(g.id)}/${encodeURIComponent(q.id)}`;

  app.innerHTML = `
    <div class="reader">
      ${bar({
        back: { href: `#/${encodeURIComponent(g.id)}`, label: g.title ?? g.id },
        title: p.title,
        sub: s.title,
        actions: `
          <button class="button" type="button" data-panel aria-expanded="false" aria-controls="links-panel">
            Links${nLinks ? ` (${nLinks})` : ''}</button>
          <button class="button toggle" type="button" data-done aria-pressed="${isDone}">
            ${isDone ? '<span aria-hidden="true">✓</span> Done' : 'Mark done'}</button>`,
      })}
      <div class="reader-main">
        <iframe class="frame" title="${esc(p.title)}" src="${esc(p.url)}"></iframe>
        <aside id="links-panel" class="panel" hidden>
          <h2>Links from here</h2>
          ${outgoing.length ? `<ul class="link-list">${linkItems(g, outgoing)}</ul>` : '<p class="empty">None.</p>'}
          <h2>Linked from</h2>
          ${p.backlinks.length ? `<ul class="link-list">${linkItems(g, p.backlinks)}</ul>` : '<p class="empty">None.</p>'}
          ${p.tags.length ? `<h2>Tags</h2>${tagList(p.tags)}` : ''}
          <p><a href="${esc(p.url)}" target="_blank" rel="noopener">Open the page on its own ↗</a></p>
        </aside>
      </div>
      <nav class="pager" aria-label="Pages in this section">
        ${prev ? `<a class="pager-link" href="${pageHref(prev)}" rel="prev"><span aria-hidden="true">←</span> <span class="pager-text">${esc(prev.title)}</span></a>` : '<span></span>'}
        <span class="meta">${p.index + 1} / ${s.items.length}</span>
        ${next ? `<a class="pager-link next" href="${pageHref(next)}" rel="next"><span class="pager-text">${esc(next.title)}</span> <span aria-hidden="true">→</span></a>` : '<span></span>'}
      </nav>
    </div>`;

  framed = { guide: g, page: p };
  const frame = app.querySelector('iframe');
  frame.addEventListener('load', () => wireFrame(frame, g));

  const doneBtn = app.querySelector('[data-done]');
  doneBtn.addEventListener('click', () => {
    const now = doneBtn.getAttribute('aria-pressed') !== 'true';
    setDone(g.id, p.id, now);
    doneBtn.setAttribute('aria-pressed', String(now));
    doneBtn.innerHTML = now ? '<span aria-hidden="true">✓</span> Done' : 'Mark done';
  });

  const panelBtn = app.querySelector('[data-panel]');
  const panel = app.querySelector('#links-panel');
  panelBtn.addEventListener('click', () => {
    panel.hidden = !panel.hidden;
    panelBtn.setAttribute('aria-expanded', String(!panel.hidden));
  });
}

// Inside a page, a link to another page of the same guide moves the app there
// instead of navigating the frame. Two forms work:
//   <a href="page:some-id">         by page id
//   <a href="other-page.html">      by file, relative to the page
// Links that leave the site open in a new tab.
function wireFrame(frame, g) {
  let doc;
  try { doc = frame.contentDocument; } catch { return; }
  if (!doc) return;
  doc.addEventListener('click', (e) => {
    const a = e.target.closest?.('a[href]');
    if (!a || e.defaultPrevented) return;
    const href = a.getAttribute('href');
    if (href.startsWith('#') || href.startsWith('javascript:')) return;
    let target = null;
    if (href.startsWith('page:')) {
      target = g.byId.get(decodeURIComponent(href.slice(5)));
    } else {
      let url;
      try { url = new URL(href, doc.baseURI); } catch { return; }
      if (url.origin !== location.origin) {
        e.preventDefault();
        window.open(url.href, '_blank', 'noopener');
        return;
      }
      const bare = url.href.split('#')[0];
      target = g.pages.find((p) => new URL(p.url, location.href).href === bare) ?? null;
      if (!target) return; // some other same-site file: let the frame handle it
    }
    e.preventDefault();
    if (target) location.hash = `#/${encodeURIComponent(g.id)}/${encodeURIComponent(target.id)}`;
  });
}

// ---- router

async function route() {
  const [guideId, pageId] = location.hash.replace(/^#\/?/, '').split('/').map(decodeURIComponent);
  if (!library) {
    try { await loadLibrary(); } catch (err) {
      app.innerHTML = `${bar({ title: 'Methodos' })}<main class="page-body">
        <p class="empty">Could not load the library: ${esc(err.message)}</p></main>`;
      return;
    }
  }
  framed = null;
  const g = guideId && library.byId.get(guideId);
  if (!guideId) return renderLibrary();
  if (!g) { location.replace('#/'); return; }
  if (!pageId) return renderGuide(g);
  const p = g.byId.get(pageId);
  if (!p) { location.replace(`#/${encodeURIComponent(g.id)}`); return; }
  renderPage(g, p);
  window.scrollTo(0, 0);
}

addEventListener('hashchange', route);

// Arrow keys step through a section when the frame doesn't have focus.
addEventListener('keydown', (e) => {
  if (!framed || e.altKey || e.ctrlKey || e.metaKey) return;
  if (e.target.closest?.('input, textarea, select')) return;
  const rel = e.key === 'ArrowLeft' ? 'prev' : e.key === 'ArrowRight' ? 'next' : null;
  const link = rel && app.querySelector(`.pager a[rel=${rel}]`);
  if (link) location.hash = link.getAttribute('href');
});

// Methodos moved to its own origin on 2026-10-24: one app per origin keeps Chrome's install
// records and the browser storage apart from the other apps on andrewrausch.com. A copy opened
// at the old address hands over once the new one answers: it removes its service worker and
// its methodos-* caches there, then goes to the new address.
const NEW_HOME = 'https://methodos.andrewrausch.com/';
if (location.hostname === 'andrewrausch.com') {
  fetch(NEW_HOME + 'manifest.json', { cache: 'no-store' }).then(async (r) => {
    if (!r.ok) return;
    const here = new URL('./', location.href).href;
    for (const reg of (await navigator.serviceWorker?.getRegistrations?.()) ?? []) {
      if (reg.scope.startsWith(here)) await reg.unregister();
    }
    for (const name of await caches.keys()) if (name.startsWith('methodos-')) await caches.delete(name);
    location.replace(NEW_HOME + location.hash);
  }).catch(() => {});
}

if ('serviceWorker' in navigator) {
  // Ask for a new version on every open and every return to the screen; the browser's own
  // check is lazy, and an installed app is rarely navigated fresh.
  const hadWorker = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.register('sw.js').then((reg) => {
    reg.update().catch(() => {});
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') reg.update().catch(() => {});
    });
  }).catch(() => {});
  // A new version took over: this page still runs the old code. Reload now on the library
  // or a guide's contents; inside a page, wait for the next move so nothing is interrupted.
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadWorker || reloading) return;
    const inPage = location.hash.split('/').length > 2;
    const go = () => { reloading = true; location.reload(); };
    if (!inPage) go();
    else window.addEventListener('hashchange', go, { once: true });
  });
}

route();
