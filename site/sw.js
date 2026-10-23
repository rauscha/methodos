// Methodos service worker.
// - The app shell is precached so the library opens offline.
// - Same-site files (guides, pages) are network-first, falling back to cache, so
//   an edit to a guide shows up on the next load and old copies serve offline.
// - Files from other sites (CDN scripts and fonts that artifacts load) are
//   cache-first: they are versioned URLs and rarely change.
// andrewrausch.com is one origin shared by many apps, so this worker only ever
// touches caches whose names start with "methodos-".

const SHELL_CACHE = 'methodos-shell-v1';
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
    if (response.ok) {
      const copy = response.clone();
      caches.open(DATA_CACHE).then((c) => c.put(request, copy));
    }
    return response;
  } catch {
    const cached = await caches.match(request, { ignoreSearch: true });
    if (cached) return cached;
    if (request.mode === 'navigate' && request.destination === 'document') {
      return (await caches.match('index.html')) ?? Response.error();
    }
    return Response.error();
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok || response.type === 'opaque') {
    const copy = response.clone();
    caches.open(CDN_CACHE).then((c) => c.put(request, copy));
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
  } else {
    event.respondWith(cacheFirst(request));
  }
});
