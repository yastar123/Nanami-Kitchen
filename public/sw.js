// Self-destructing Service Worker: Unregisters itself and purges all caches immediately
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: "window" }))
      .then((clients) => {
        for (const client of clients) {
          try {
            client.navigate(client.url);
          } catch {
            // ignore
          }
        }
      }),
  );
});

// Pass-through: NEVER intercept or block fetch events
self.addEventListener("fetch", () => {});
