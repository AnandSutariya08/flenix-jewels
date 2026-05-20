const isBrowser = typeof window !== "undefined";

/**
 * Keeps actual HTMLImageElement objects alive in a module-level Map.
 * This prevents GC from evicting images from the browser's memory cache.
 * Without this, Image objects created during preload go out of scope
 * immediately and the browser discards the cached data — causing every
 * page revisit to re-fetch images from the network.
 */
const imageMemoryCache = new Map<string, HTMLImageElement>();

export function keepImageAlive(url: string): void {
  if (!url || !isBrowser || imageMemoryCache.has(url)) return;
  const img = new Image();
  img.decoding = "async";
  img.onload = () => {
    imageMemoryCache.set(url, img);
  };
  img.onerror = () => {};
  img.src = url;
}

export function isImageCached(url: string): boolean {
  return imageMemoryCache.has(url);
}

export const preloadMedia = (urls: string[]) => {
  if (!isBrowser) return;
  const unique = Array.from(new Set(urls.filter(Boolean)));
  unique.forEach(keepImageAlive);
};

export const preloadAssets = (urls: string[]) => {
  if (!isBrowser) return;
  const unique = Array.from(new Set(urls.filter(Boolean)));
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(() => preloadMedia(unique), { timeout: 1500 });
  } else {
    setTimeout(() => preloadMedia(unique), 100);
  }
};
