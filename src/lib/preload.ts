const isBrowser = typeof window !== "undefined";

/**
 * Keeps actual HTMLImageElement objects alive in a module-level Map.
 * This prevents GC from evicting images from the browser's memory cache.
 * Without this, Image objects created during preload go out of scope
 * immediately and the browser discards the cached data — causing every
 * page revisit to re-fetch images from the network.
 */
const imageMemoryCache = new Map<string, HTMLImageElement>();

/**
 * Keeps hidden HTMLVideoElement objects alive so the browser pre-buffers
 * video files before the dialog opens. preload="auto" tells the browser
 * to download the full video in the background.
 */
const videoMemoryCache = new Map<string, HTMLVideoElement>();

export function keepVideoAlive(url: string): void {
  if (!url || !isBrowser || videoMemoryCache.has(url)) return;
  const vid = document.createElement('video');
  vid.preload = 'auto';
  vid.muted = true;
  vid.src = url;
  vid.style.cssText = 'position:absolute;width:0;height:0;opacity:0;pointer-events:none;';
  document.body.appendChild(vid);
  vid.load();
  videoMemoryCache.set(url, vid);
}

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

const VIDEO_RE = /\.(mp4|webm|ogg|mov|avi|mkv)(\?|$)/i;
const isVideoUrl = (url: string) =>
  VIDEO_RE.test(url) || url.includes('/video') || url.includes('vid-');

/**
 * Preloads all URLs:
 *  - Images → keepImageAlive (fetched immediately via <img>)
 *  - Videos → keepVideoAlive (buffered via hidden <video preload="auto">)
 *
 * Videos are deferred to idle time so they don't compete with
 * critical first-paint resources.
 */
export const preloadMedia = (urls: string[]) => {
  if (!isBrowser) return;
  const unique = Array.from(new Set(urls.filter(Boolean)));
  const images = unique.filter(u => !isVideoUrl(u));
  const videos = unique.filter(u => isVideoUrl(u));

  // Images: start immediately
  images.forEach(keepImageAlive);

  // Videos: defer to idle so they don't delay first paint
  if (videos.length === 0) return;
  const scheduleVideos = () => videos.forEach(keepVideoAlive);
  if ('requestIdleCallback' in window) {
    (window as Window & { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => void })
      .requestIdleCallback(scheduleVideos, { timeout: 2000 });
  } else {
    setTimeout(scheduleVideos, 500);
  }
};

export const preloadAssets = (urls: string[]) => {
  preloadMedia(urls);
};
