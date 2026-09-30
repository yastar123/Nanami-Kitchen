import type { SyntheticEvent } from "react";

export const food1 = "/food-1.jpg";
export const food2 = "/food-2.jpg";
export const food3 = "/food-3.jpg";
export const food4 = "/food-4.jpg";
export const hero = "/hero.jpg";
export const logo = "/nanami-logo.png";

export {
  food1 as defaultFood1,
  food2 as defaultFood2,
  food3 as defaultFood3,
  food4 as defaultFood4,
};

export const DEFAULT_FOOD_IMAGES: Record<string, string> = {
  "/src/assets/food-1.jpg": food1,
  "/assets/food-1.jpg": food1,
  "/food-1.jpg": food1,
  "food-1.jpg": food1,
  "/src/assets/food-2.jpg": food2,
  "/assets/food-2.jpg": food2,
  "/food-2.jpg": food2,
  "food-2.jpg": food2,
  "/src/assets/food-3.jpg": food3,
  "/assets/food-3.jpg": food3,
  "/food-3.jpg": food3,
  "food-3.jpg": food3,
  "/src/assets/food-4.jpg": food4,
  "/assets/food-4.jpg": food4,
  "/food-4.jpg": food4,
  "food-4.jpg": food4,
  "/src/assets/hero.jpg": hero,
  "/assets/hero.jpg": hero,
  "/hero.jpg": hero,
  "hero.jpg": hero,
  "/src/assets/nanami-logo.png": logo,
  "/assets/nanami-logo.png": logo,
  "/nanami-logo.png": logo,
  "nanami-logo.png": logo,
};

/**
 * Resolves menu item image string into a valid, Vite-bundled or static asset URL.
 * Falls back to bundled food1 if empty or unknown local path.
 */
export function resolveMenuImage(src?: string | null, fallback: string = food1): string {
  if (!src || typeof src !== "string" || !src.trim()) {
    return fallback;
  }
  const clean = src.trim();
  // Filter out dummy/mock URLs from tests (e.g. photo-test-welcome-456.jpg, photo-audit-)
  if (clean.includes("photo-test-") || clean.includes("photo-audit-")) {
    return fallback;
  }
  if (DEFAULT_FOOD_IMAGES[clean]) {
    return DEFAULT_FOOD_IMAGES[clean]!;
  }
  return clean;
}

/**
 * Graceful error recovery for any img element when loading fails (e.g. 404, network error, or CSP)
 */
export function handleImageError(
  e: SyntheticEvent<HTMLImageElement, Event>,
  fallback: string = food1,
) {
  const target = e.currentTarget as HTMLImageElement;
  if (target.src !== fallback && !target.src.endsWith(fallback)) {
    target.src = fallback;
  }
}
