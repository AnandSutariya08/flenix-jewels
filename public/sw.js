const CACHE = 'flenix-images-v1';
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Only cache Firebase Storage image responses
  if (
    url.hostname !== 'firebasestorage.googleapis.com' ||
    url.searchParams.get('alt') !== 'media'
  ) return;

  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(request);
      if (cached) {
        // Check age header we stored; serve stale and revalidate in background
        const storedAt = cached.headers.get('x-cached-at');
        const age = storedAt ? Date.now() - Number(storedAt) : 0;
        if (age < MAX_AGE_MS) {
          return cached;
        }
      }

      try {
        const response = await fetch(request);
        if (response.ok && response.status === 200) {
          // Clone the response and add a timestamp header before caching
          const headers = new Headers(response.headers);
          headers.set('x-cached-at', String(Date.now()));
          const body = await response.arrayBuffer();
          const stamped = new Response(body, {
            status: response.status,
            statusText: response.statusText,
            headers,
          });
          cache.put(request, stamped.clone());
          return stamped;
        }
        return response;
      } catch {
        // Network failed — serve stale cache if available
        if (cached) return cached;
        throw new Error('Network and cache both unavailable');
      }
    })
  );
});
