import { StrictMode, startTransition } from "react";
import { hydrateRoot } from "react-dom/client";
import { StartClient } from "@tanstack/react-start/client";

// Auto-recover if a stale chunk fails to load after a deployment
if (typeof window !== "undefined") {
  const recoverStaleChunk = () => {
    const key = "nanami_auto_reload_" + window.location.pathname;
    const lastReload = sessionStorage.getItem(key);
    const now = Date.now();
    // Allow auto-reload once every 10 seconds to break stale chunk cache
    if (!lastReload || now - Number(lastReload) > 10000) {
      sessionStorage.setItem(key, now.toString());
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistrations().then((regs) => {
          regs.forEach((r) => r.unregister());
        });
      }
      if (typeof caches !== "undefined") {
        caches.keys().then((keys) => {
          keys.forEach((k) => caches.delete(k));
        });
      }
      const url = new URL(window.location.href);
      url.searchParams.set("_v", Date.now().toString());
      window.location.replace(url.toString());
    }
  };

  window.addEventListener("vite:preloadError", recoverStaleChunk);

  window.addEventListener("error", (e) => {
    const msg = e?.message || "";
    if (
      msg.includes("Failed to fetch dynamically imported module") ||
      msg.includes("Importing a module script failed") ||
      msg.includes("error loading dynamically imported module")
    ) {
      recoverStaleChunk();
    }
  });

  window.addEventListener("unhandledrejection", (e) => {
    const msg = e?.reason?.message || String(e?.reason || "");
    if (
      msg.includes("Failed to fetch dynamically imported module") ||
      msg.includes("Importing a module script failed") ||
      msg.includes("error loading dynamically imported module")
    ) {
      recoverStaleChunk();
    }
  });
}

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <StartClient />
    </StrictMode>,
  );
});
