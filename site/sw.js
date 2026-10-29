// Methodos service worker.
// - The app shell is precached so the library opens offline.
// - The app's own files are served from the shell cache at once; a new version arrives
//   through the update check (the app calls it on open), never by waiting on the network.
// - Guides and pages are served from the saved copy at once and refreshed in the
//   background, so an edit shows up on the load after next and a hung network never blocks.
// - Files from other sites (CDN scripts and fonts that artifacts load) are
//   cache-first: they are versioned URLs and rarely change.
// andrewrausch.com is one origin shared by many apps, so this worker only ever
// touches caches whose names start with "methodos-".

// Bump SHELL_VERSION with every change to a shell file, or offline users keep the old copy.
const SHELL_VERSION = '2026-10-29a';
const SHELL_CACHE = `methodos-shell-${SHELL_VERSION}`;
const DATA_CACHE = 'methodos-data';
const CDN_CACHE = 'methodos-cdn';
// Guides added from a file (app.js). Never fetched, never deleted here.
const LOCAL_CACHE = 'methodos-local';
const KEEP = [SHELL_CACHE, DATA_CACHE, CDN_CACHE, LOCAL_CACHE];

const SHELL = [
  './',
  'index.html',
  'app.js',
  'style.css',
  'manifest.json',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  // The shelf list, so the library opens offline even before anything else was fetched.
  'guides/index.json',
];

self.addEventListener('install', (event) => {
  // cache: 'reload' skips the browser's HTTP cache (Pages sends max-age=600), so a new
  // version never precaches the previous version's files.
  const fresh = SHELL.map((u) => new Request(u, { cache: 'reload' }));
  event.waitUntil(caches.open(SHELL_CACHE).then((c) => c.addAll(fresh)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) {
      if (name.startsWith('methodos-') && !KEEP.includes(name)) await caches.delete(name);
    }
    await self.clients.claim();
  })());
});

const timeout = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms));

// The app itself (index, script, style, manifest, icons) comes from the shell cache at once.
// It changes only with a new SHELL_VERSION, which the update check fetches in the
// background, so a slow or hung network never holds the app up.
const SHELL_PATHS = new Set(SHELL.filter((u) => !u.startsWith('guides/')).map((u) => new URL(u, self.location).pathname));

// The app's own page, as opposed to a guide page opening in its frame (also a navigation).
const isAppPage = (request) => request.mode === 'navigate' && request.destination === 'document';

async function fromShell(request) {
  const cache = await caches.open(SHELL_CACHE);
  if (isAppPage(request)) return (await cache.match('./')) ?? (await cache.match('index.html'));
  return cache.match(request, { ignoreSearch: true });
}

// Guides and pages: the saved copy at once, refreshed in the background for next time
// (no-cache: ask the server, a cheap 304 when nothing changed). With nothing saved, wait
// for the network, up to a limit.
async function savedThenRefresh(event) {
  const { request } = event;
  const refresh = fetch(request, request.mode === 'navigate' ? undefined : { cache: 'no-cache' }).then((response) => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const copy = response.clone();
    caches.open(DATA_CACHE).then((c) => c.put(request, copy)).catch(() => {});
    return response;
  });
  refresh.catch(() => {}); // a failed refresh is fine: the saved copy stands
  for (const name of [DATA_CACHE, SHELL_CACHE]) {
    const cached = await (await caches.open(name)).match(request, { ignoreSearch: true });
    if (cached) {
      event.waitUntil(refresh.catch(() => {}));
      return cached;
    }
  }
  try {
    return await Promise.race([refresh, timeout(15000)]);
  } catch {
    if (isAppPage(request)) return (await fromShell(request)) ?? Response.error();
    return Response.error();
  }
}

// A guide added from a file exists only in LOCAL_CACHE, so its URLs never go to
// the network: what isn't there is a 404.
async function fromLocal(request) {
  const cached = await (await caches.open(LOCAL_CACHE)).match(request, { ignoreSearch: true });
  return cached ?? new Response('Not in this guide', { status: 404, headers: { 'Content-Type': 'text/plain' } });
}

const CDN_KINDS = new Set(['script', 'style', 'font', 'image']);

async function cacheFirst(request) {
  const cache = await caches.open(CDN_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  // Only versioned assets, and only readable responses: an opaque one costs several MB of
  // quota on a shared origin and can't be checked.
  if (response.ok && CDN_KINDS.has(request.destination)) {
    const copy = response.clone();
    cache.put(request, copy).catch(() => {});
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
  if (url.origin === self.location.origin) {
    if (!url.pathname.startsWith(new URL('./', self.location).pathname)) return;
    if (url.pathname.startsWith(new URL('local/', self.location).pathname)) {
      event.respondWith(fromLocal(request));
      return;
    }
    if (isAppPage(request) || SHELL_PATHS.has(url.pathname)) {
      event.respondWith(fromShell(request).then((r) => r ?? savedThenRefresh(event)));
      return;
    }
    event.respondWith(savedThenRefresh(event));
  } else if (CDN_KINDS.has(request.destination)) {
    event.respondWith(cacheFirst(request));
  }
});
