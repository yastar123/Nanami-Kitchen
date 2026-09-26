/**
 * Shared media URL helper utilities for client and server.
 * Pure string functions without any Node.js or server-only dependencies.
 */

export function optimizeMenuImage(id: string, image?: string): string {
  if (!image) return "";
  if (image.startsWith("data:image/") || image.length > 500) {
    return `/api/media/menu-${id}`;
  }
  return image;
}

export function optimizeCms(cms: any): any {
  if (!cms) return cms;
  const copy = { ...cms };
  if (copy.logoUrl && (copy.logoUrl.startsWith("data:image/") || copy.logoUrl.length > 500)) {
    copy.logoUrl = "/api/media/cms-logo";
  }
  if (copy.heroImage && (copy.heroImage.startsWith("data:image/") || copy.heroImage.length > 500)) {
    copy.heroImage = "/api/media/cms-hero";
  }
  if (
    copy.welcomeScreen?.imageUrl &&
    (copy.welcomeScreen.imageUrl.startsWith("data:image/") ||
      copy.welcomeScreen.imageUrl.length > 500)
  ) {
    copy.welcomeScreen = {
      ...copy.welcomeScreen,
      imageUrl: "/api/media/cms-welcome",
    };
  }
  return copy;
}

export function optimizePromoImage(id: string, imageUrl?: string): string {
  if (!imageUrl) return "";
  if (imageUrl.startsWith("data:image/") || imageUrl.length > 500) {
    return `/api/media/promo-${id}`;
  }
  return imageUrl;
}

export function optimizeMediaAsset(id: string, url?: string): string {
  if (!url) return "";
  if (url.startsWith("data:image/") || url.length > 500) {
    return `/api/media/asset-${id}`;
  }
  return url;
}
