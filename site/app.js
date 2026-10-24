// Methodos: a library of guides. Each guide is a folder of HTML artifacts plus a
// guide.json that orders them into sections. The app knows nothing about any one
// subject; everything subject-specific lives in site/guides/<id>/.
//
// Routes (hash-based, so the app works from any sub-path and offline):
//   #/                    library
//   #/<guide>             a guide's contents
//   #/<guide>/<page>      one page, shown in a frame

const app = document.getElementById('app');
const LAYOUTS = new Set(['steps', 'cards']);
export const DATA_CACHE = 'methodos-data';

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
function normalize(id, raw) {
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
        url: `guides/${id}/${p.file}`,
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
  const index = await getJSON('guides/index.json');
  const guides = await Promise.all((index.guides ?? []).map(async (id) => {
    try {
      return normalize(id, await getJSON(`guides/${id}/guide.json`));
    } catch (err) {
      return { ...normalize(id, {}), title: id, error: String(err.message ?? err) };
    }
  }));
  library = { guides, byId: new Map(guides.map((g) => [g.id, g])) };
}

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

function renderLibrary() {
  document.title = 'Methodos';
  const cards = library.guides.map((g) => {
    const done = doneSet(g.id);
    const meta = g.error
      ? `Could not load: ${esc(g.error)}`
      : g.pages.length
        ? `${g.pages.length} page${g.pages.length === 1 ? '' : 's'} · ${countLine(g.pages, done)}`
        : 'No pages yet';
    return `
      <li>
        <a class="guide-card" href="#/${encodeURIComponent(g.id)}">
          ${g.subtitle ? `<span class="kicker">${esc(g.subtitle)}</span>` : ''}
          <h2>${esc(g.title ?? g.id)}</h2>
          ${g.description ? `<p>${esc(g.description)}</p>` : ''}
          <span class="meta">${meta}</span>
        </a>
      </li>`;
  }).join('');
  app.innerHTML = `
    ${bar({ title: 'Methodos', sub: 'Library' })}
    <main class="page-body">
      <ul class="guide-grid">${cards || '<li class="empty">No guides yet. Add one with <code>tools/methodos.py new</code>.</li>'}</ul>
    </main>`;
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
  return `
    <section class="section">
      <div class="section-head">
        <h3>${esc(s.title ?? s.id)}</h3>
        ${s.items.length ? `<span class="meta">${countLine(s.items, done)}</span>` : ''}
      </div>
      ${s.description ? `<p class="section-desc">${esc(s.description)}</p>` : ''}
      ${list}
    </section>`;
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
      <div class="guide-tools">
        ${last ? `<a class="button primary" href="#/${encodeURIComponent(g.id)}/${encodeURIComponent(last.id)}">Continue: ${esc(last.title)}</a>` : ''}
        ${g.pages.length ? `<label class="search"><span class="visually-hidden">Search this guide</span>
          <input type="search" placeholder="Search ${g.pages.length} pages" value="${esc(q)}" autocomplete="off"></label>` : ''}
        ${g.pages.length && 'caches' in window ? `<button class="button" type="button" data-save>Save for offline</button>` : ''}
        <span class="save-status meta" role="status"></span>
      </div>
      <div class="guide-body">${renderGuideBody(g, q.trim().toLowerCase())}</div>
    </main>`;

  const input = app.querySelector('input[type=search]');
  input?.addEventListener('input', () => {
    store.set(`q:${g.id}`, input.value);
    app.querySelector('.guide-body').innerHTML = renderGuideBody(g, input.value.trim().toLowerCase());
  });
  app.querySelector('[data-save]')?.addEventListener('click', (e) => saveOffline(g, e.currentTarget));
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

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

route();
