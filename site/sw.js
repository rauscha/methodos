// Methodos service worker.
// - The app shell is precached so the library opens offline.
// - Same-site files (guides, pages) are network-first, falling back to cache, so
//   an edit to a guide shows up on the next load and old copies serve offline.
// - Files from other sites (CDN scripts and fonts that artifacts load) are
//   cache-first: they are versioned URLs and rarely change.
// andrewrausch.com is one origin shared by many apps, so this worker only ever
// touches caches whose names start with "methodos-".

// Bump SHELL_VERSION with every change to a shell file, or offline users keep the old copy.
const SHELL_VERSION = '2026-10-24a';
const SHELL_CACHE = `methodos-shell-${SHELL_VERSION}`;
const DATA_CACHE = 'methodos-data';
const CDN_CACHE = 'methodos-cdn';
const KEEP = [SHELL_CACHE, DATA_CACHE, CDN_CACHE];

const SHELL = [
  './',
  'index.html',
  'app.js',
  'style.css',
  'manifest.json',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
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
  try {
    const response = await Promise.race([fetch(request), timeout(6000)]);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const copy = response.clone();
    caches.open(DATA_CACHE).then((c) => c.put(request, copy)).catch(() => {});
    return response;
  } catch {
    // Data first (it holds whatever was fetched most recently), then the shell.
    for (const name of [DATA_CACHE, SHELL_CACHE]) {
      const cached = await (await caches.open(name)).match(request, { ignoreSearch: true });
      if (cached) return cached;
    }
    if (request.mode === 'navigate' && request.destination === 'document') {
      return (await (await caches.open(SHELL_CACHE)).match('index.html')) ?? Response.error();
    }
    return Response.error();
  }
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
    event.respondWith(networkFirst(request));
  } else if (CDN_KINDS.has(request.destination)) {
    event.respondWith(cacheFirst(request));
  }
});
