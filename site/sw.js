// Methodos service worker.
// - The app shell is precached so the library opens offline.
// - Same-site files (guides, pages) are network-first, falling back to cache, so
//   an edit to a guide shows up on the next load and old copies serve offline.
// - Files from other sites (CDN scripts and fonts that artifacts load) are
//   cache-first: they are versioned URLs and rarely change.
// andrewrausch.com is one origin shared by many apps, so this worker only ever
// touches caches whose names start with "methodos-".

// Bump SHELL_VERSION with every change to a shell file, or offline users keep the old copy.
const SHELL_VERSION = '2026-10-24c';
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
  event.waitUntil(caches.open(SHELL_CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
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

async function networkFirst(request) {
  const network = fetch(request).then((response) => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const copy = response.clone();
    caches.open(DATA_CACHE).then((c) => c.put(request, copy)).catch(() => {});
    return response;
  });
  network.catch(() => {}); // handled below; this only silences the unhandled-rejection warning
  try {
    return await Promise.race([network, timeout(6000)]);
  } catch {
    // Data first (it holds whatever was fetched most recently), then the shell.
    for (const name of [DATA_CACHE, SHELL_CACHE]) {
      const cached = await (await caches.open(name)).match(request, { ignoreSearch: true });
      if (cached) return cached;
    }
    // Nothing saved: on a slow connection the network may still answer, so wait for it.
    try { return await network; } catch {}
    if (request.mode === 'navigate' && request.destination === 'document') {
      return (await (await caches.open(SHELL_CACHE)).match('index.html')) ?? Response.error();
    }
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
    event.respondWith(networkFirst(request));
  } else if (CDN_KINDS.has(request.destination)) {
    event.respondWith(cacheFirst(request));
  }
});
