import { sql, initDb } from "../lib/db";
import { getStorageData } from "./persistent-storage";

export interface MediaResolved {
  buffer?: Buffer;
  contentType?: string;
  redirectUrl?: string;
  etag?: string;
}

/**
 * Resolves media ID to binary image buffer or redirect URL.
 * Supports:
 * - menu-:id -> Menu item image
 * - cms-logo -> CMS brand logo
 * - cms-hero -> CMS hero banner image
 * - cms-welcome -> Welcome screen image
 * - promo-:id -> Promo banner image
 * - asset-:id / :id -> MediaAsset from gallery
 */
export async function resolveMedia(id: string): Promise<MediaResolved | null> {
  const fallback = getStorageData();
  const dbReady = await initDb();

  let rawData: string | undefined;

  // 1. Menu item image: "menu-:id"
  if (id.startsWith("menu-")) {
    const menuId = id.replace("menu-", "");
    if (sql && dbReady) {
      try {
        const rows =
          (await sql`SELECT image FROM menu_items WHERE id = ${menuId} LIMIT 1`) as any[];
        if (rows.length && rows[0].image) {
          rawData = rows[0].image;
        }
      } catch (err) {
        console.warn("[MediaService] Error querying menu image from DB:", err);
      }
    }
    if (!rawData) {
      const item = fallback.menu.find((m) => m.id === menuId);
      rawData = item?.image;
    }
  }
  // 2. CMS images
  else if (id === "cms-logo") {
    if (sql && dbReady) {
      try {
        const rows =
          (await sql`SELECT data FROM cms_content WHERE id = 'main_cms' LIMIT 1`) as any[];
        rawData = rows[0]?.data?.logoUrl;
      } catch (err) {
        void err;
      }
    }
    if (!rawData) rawData = fallback.cms.logoUrl;
  } else if (id === "cms-hero") {
    if (sql && dbReady) {
      try {
        const rows =
          (await sql`SELECT data FROM cms_content WHERE id = 'main_cms' LIMIT 1`) as any[];
        rawData = rows[0]?.data?.heroImage;
      } catch (err) {
        void err;
      }
    }
    if (!rawData) rawData = fallback.cms.heroImage;
  } else if (id === "cms-welcome") {
    if (sql && dbReady) {
      try {
        const rows =
          (await sql`SELECT data FROM cms_content WHERE id = 'main_cms' LIMIT 1`) as any[];
        rawData = rows[0]?.data?.welcomeScreen?.imageUrl;
      } catch (err) {
        void err;
      }
    }
    if (!rawData) rawData = fallback.cms.welcomeScreen?.imageUrl;
  }
  // 3. Promo image: "promo-:id"
  else if (id.startsWith("promo-")) {
    const promoId = id.replace("promo-", "");
    if (sql && dbReady) {
      try {
        const rows =
          (await sql`SELECT image_url FROM promos WHERE id = ${promoId} LIMIT 1`) as any[];
        rawData = rows[0]?.image_url;
      } catch (err) {
        void err;
      }
    }
    if (!rawData) {
      const p = fallback.promos.find((x) => x.id === promoId);
      rawData = p?.imageUrl;
    }
  }
  // 4. Media Asset: "asset-:id" or ":id"
  else {
    const assetId = id.startsWith("asset-") ? id.replace("asset-", "") : id;
    if (sql && dbReady) {
      try {
        const rows =
          (await sql`SELECT url FROM media_assets WHERE id = ${assetId} LIMIT 1`) as any[];
        rawData = rows[0]?.url;
      } catch (err) {
        void err;
      }
    }
    if (!rawData) {
      const asset = fallback.mediaAssets.find((m) => m.id === assetId);
      rawData = asset?.url;
    }
  }

  if (!rawData || typeof rawData !== "string" || !rawData.trim()) {
    return getDefaultFallback(id);
  }

  const clean = rawData.trim();

  // Handle Base64 Data URL (e.g. data:image/jpeg;base64,...)
  if (clean.startsWith("data:")) {
    const match = clean.match(/^data:([^;]+);base64,(.+)$/s);
    if (!match || !match[2]) return getDefaultFallback(id);
    const contentType = match[1] || "image/jpeg";
    const base64Data = match[2].trim();
    try {
      const buffer = Buffer.from(base64Data, "base64");
      const etag = `"${buffer.length}-${buffer.subarray(0, Math.min(32, buffer.length)).toString("hex")}"`;
      return { buffer, contentType, etag };
    } catch {
      return getDefaultFallback(id);
    }
  }

  // Break self-referential redirect loops (e.g. rawData was saved as /api/media/...)
  if (clean.startsWith("/api/media/") || clean === id) {
    return getDefaultFallback(id);
  }

  // Filter out mock test URLs from automated tests (e.g. photo-test-welcome-456.jpg, photo-audit-)
  if (clean.includes("photo-test-") || clean.includes("photo-audit-")) {
    return getDefaultFallback(id);
  }

  // Handle URL redirect (external or static asset path)
  if (clean.startsWith("http://") || clean.startsWith("https://") || clean.startsWith("/")) {
    return { redirectUrl: clean };
  }

  return getDefaultFallback(id);
}

function getDefaultFallback(id: string): MediaResolved {
  if (id === "cms-hero" || id === "cms-welcome") {
    return { redirectUrl: "/hero.jpg" };
  }
  if (id === "cms-logo") {
    return { redirectUrl: "/nanami-logo.png" };
  }
  if (id.startsWith("promo-")) {
    return { redirectUrl: "/hero.jpg" };
  }
  return { redirectUrl: "/food-1.jpg" };
}

// Re-export pure image optimization functions for backwards compatibility
export {
  optimizeMenuImage,
  optimizeCms,
  optimizePromoImage,
  optimizeMediaAsset,
} from "../lib/media-utils";
