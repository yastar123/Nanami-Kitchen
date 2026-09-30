const CACHE = "nanami-shell-v4";
const PRECACHE = ["/manifest.webmanifest", "/favicon.png", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // 1. Only handle GET requests from the same origin
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // 2. NEVER intercept or cache admin, owner, api, server-functions, or JS code bundles
  if (
    url.pathname.startsWith("/api") ||
    url.pathname.startsWith("/owner") ||
    url.pathname.startsWith("/admin") ||
    url.pathname.startsWith("/_server") ||
    url.pathname.includes("_data") ||
    url.searchParams.has("_data") ||
    url.pathname.endsWith(".js") ||
    url.pathname.includes(".js?")
  ) {
    return;
  }

  // 3. Navigation requests: Network-first, do NOT cache HTML shell to avoid stale chunk hashes
  if (request.mode === "navigate") {
    return;
  }

  // 4. Static media assets only (images, icons, webmanifest): Stale-while-revalidate / cache-first
  const isMediaAsset =
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".jpeg") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".webp") ||
    url.pathname.endsWith(".ico") ||
    url.pathname.endsWith(".webmanifest");

  if (isMediaAsset) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request)
          .then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches
                .open(CACHE)
                .then((cache) => cache.put(request, copy))
                .catch(() => {});
            }
            return response;
          })
          .catch(() => Response.error());
      }),
    );
  }
});
