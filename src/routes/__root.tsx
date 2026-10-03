import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useRef, type ReactNode } from "react";
import { actions } from "@/lib/store";
import { getDatabaseState } from "@/lib/server-functions";
import { getSessionToken } from "@/lib/session";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AuthGuard } from "@/components/AuthGuard";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error("Root ErrorComponent caught error:", error);
  const router = useRouter();

  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  // Automatic recovery for stale dynamic imports (e.g. Failed to fetch dynamically imported module)
  const isModuleError =
    error?.message?.includes("Failed to fetch dynamically imported module") ||
    error?.message?.includes("Importing a module script failed") ||
    error?.message?.includes("error loading dynamically imported module");

  useEffect(() => {
    if (isModuleError && typeof window !== "undefined") {
      const lastAttempt = sessionStorage.getItem("nanami_chunk_attempt");
      const now = Date.now();
      if (!lastAttempt || now - Number(lastAttempt) > 6000) {
        sessionStorage.setItem("nanami_chunk_attempt", now.toString());
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
        url.searchParams.set("_reload", Date.now().toString());
        window.location.replace(url.toString());
      }
    }
  }, [error, isModuleError]);

  const handleClearCache = async () => {
    try {
      if (typeof document !== "undefined") {
        document.cookie = "nanami_session_token=; path=/; max-age=0; SameSite=Lax";
      }
      if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const reg of regs) {
          await reg.unregister();
        }
      }
      if (typeof caches !== "undefined") {
        const keys = await caches.keys();
        for (const key of keys) {
          await caches.delete(key);
        }
      }
      if (typeof localStorage !== "undefined") {
        localStorage.clear();
      }
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.clear();
      }
    } catch (e) {
      console.error(e);
    }
    if (typeof window !== "undefined") {
      window.location.replace("/?_t=" + Date.now());
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          {isModuleError ? "Versi Baru Aplikasi Tersedia" : "Halaman Tidak Dapat Dimuat"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isModuleError
            ? "Server telah memperbarui versi kode aplikasi di VPS. Silakan muat ulang untuk mengambil script terbaru."
            : "Terjadi kendala saat memuat halaman ini. Silakan coba muat ulang atau kembali ke beranda."}
        </p>
        {error?.message && (
          <div className="mt-3 rounded-lg border border-destructive/20 bg-destructive/10 p-2.5 text-left text-xs text-destructive">
            <p className="font-semibold">Error:</p>
            <p className="font-mono text-[11px] break-words">{error.message}</p>
          </div>
        )}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={async () => {
              if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
                const regs = await navigator.serviceWorker.getRegistrations();
                for (const reg of regs) await reg.unregister();
              }
              if (typeof caches !== "undefined") {
                const keys = await caches.keys();
                for (const key of keys) await caches.delete(key);
              }
              sessionStorage.clear();
              window.location.replace(window.location.pathname + "?_t=" + Date.now());
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {isModuleError ? "Muat Ulang Versi Terbaru" : "Coba Lagi"}
          </button>
          <button
            onClick={handleClearCache}
            className="inline-flex items-center justify-center rounded-md border border-input bg-secondary/50 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Reset App Cache
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Kembali ke Beranda
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, viewport-fit=cover",
      },
      { title: "Nanami Kitchen" },
      {
        name: "description",
        content:
          "Nanami Kitchen cloud kitchen. Order bento, geprek, snacks and drinks for pickup or delivery with WhatsApp checkout.",
      },
      { name: "author", content: "Nanami Kitchen" },
      { property: "og:title", content: "Nanami Kitchen" },
      {
        property: "og:description",
        content:
          "Nanami Kitchen cloud kitchen. Order bento, geprek, snacks and drinks for pickup or delivery with WhatsApp checkout.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#0f1115" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: "Nanami" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/icon-192.png" },
    ],
  }),
  loader: async () => {
    try {
      let sessionToken: string | undefined = undefined;
      if (typeof document !== "undefined") {
        const match = document.cookie.match(/(?:^|; )nanami_session_token=([^;]*)/);
        sessionToken = match ? decodeURIComponent(match[1]) : undefined;
      }
      const data = await getDatabaseState({ data: { sessionToken } });
      if (data) {
        actions.hydrateState(data);
      }
      return data;
    } catch (err) {
      console.warn("Failed to load root database state:", err);
      return null;
    }
  },
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
              try {
                window.__nanami_nav_start = Date.now();
                var w=typeof window!=="undefined"?window:typeof globalThis!=="undefined"?globalThis:null;
                if(w){
                  var p=Object.getPrototypeOf(w);
                  var d=Object.getOwnPropertyDescriptor(w,"fetch")||(p?Object.getOwnPropertyDescriptor(p,"fetch"):null);
                  if(d&&(!d.writable||!d.set)){
                    var _f=w.fetch;
                    Object.defineProperty(w,"fetch",{configurable:true,enumerable:true,get:function(){return _f;},set:function(v){_f=v;}});
                  }
                }
              }catch(e){}
            })();`,
          }}
        />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const serverState = Route.useLoaderData();
  const lastHydratedRef = useRef<any>(null);

  // Clear chunk recovery flag upon successful page render
  useEffect(() => {
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.removeItem("nanami_chunk_recovered");
    }
  }, []);

  // Synchronously hydrate state if serverState is available so child components
  // immediately have the up-to-date database state on the first render pass
  if (serverState && lastHydratedRef.current !== serverState) {
    lastHydratedRef.current = serverState;
    actions.hydrateState(serverState);
  }

  useEffect(() => {
    const token = getSessionToken();
    if (token || !serverState) {
      actions.loadServerState();
    }

    // Set up BroadcastChannel for instant real-time cross-tab state synchronization
    let channel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== "undefined") {
      try {
        channel = new BroadcastChannel("nanami_live_sync");
        channel.onmessage = (event) => {
          if (event.data?.type === "SYNC_STATE" || event.data?.type === "ORDER_UPDATED") {
            actions.loadServerState().catch(() => {});
          }
        };
      } catch (e) {
        console.warn("BroadcastChannel error:", e);
      }
    }

    // Periodic global background poll every 5 seconds
    const interval = setInterval(() => {
      actions.loadServerState().catch(() => {});
    }, 5000);

    return () => {
      clearInterval(interval);
      if (channel) {
        channel.close();
      }
    };
  }, [serverState]);

  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

    // Unregister any active service worker and clear stale caches to ensure browser always requests current Vite chunk bundles
    navigator.serviceWorker.getRegistrations().then((regs) => {
      for (const reg of regs) {
        reg.unregister();
      }
    });
    if (typeof caches !== "undefined") {
      caches.keys().then((keys) => {
        for (const key of keys) {
          caches.delete(key);
        }
      });
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthGuard>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
      </AuthGuard>
    </QueryClientProvider>
  );
}
