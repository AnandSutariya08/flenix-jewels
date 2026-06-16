const isBrowser = typeof window !== "undefined";

/**
 * Two-state tracking:
 *  preloadPending  — fetch has been queued (in-flight, not yet decoded)
 *  imageMemoryCache — HTMLImageElement held alive (fetch complete, in memory cache)
 *
 * Keeping the HTMLImageElement reference prevents the browser from evicting
 * the decoded bitmap from its memory cache during SPA navigation.
 */
const preloadPending = new Set<string>();
const imageMemoryCache = new Map<string, HTMLImageElement>();
const videoMemoryCache = new Map<string, HTMLVideoElement>();

/**
 * Returns true as soon as a URL has been queued — even before it finishes.
 * This lets OptimizedImage / ProductDialog skip the skeleton immediately
 * when the image is already in-flight or fully decoded.
 */
export function isImageQueued(url: string): boolean {
  return preloadPending.has(url) || imageMemoryCache.has(url);
}

/**
 * Legacy alias — keeps all call sites working.
 * Now correctly returns true while image is still loading (not just after).
 */
export function isImageCached(url: string): boolean {
  return isImageQueued(url);
}

/**
 * Injects a <link rel="preload" as="image"> into <head>.
 * This lets the browser's preload scanner fetch the image *before* any
 * JavaScript runs — significantly earlier than new Image().
 * Only fires for critical / high-priority images (limit: first 8 per call).
 */
const injectedPreloads = new Set<string>();
function injectLinkPreload(url: string): void {
  if (!isBrowser || !url || injectedPreloads.has(url)) return;
  injectedPreloads.add(url);
  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "image";
  link.href = url;
  (link as HTMLLinkElement & { fetchpriority?: string }).fetchpriority = "high";
  document.head.appendChild(link);
}

/**
 * Injects <link rel="preconnect"> for Firebase Storage.
 * Eliminates DNS + TLS handshake time for the first Firebase CDN image.
 * Called once per session.
 */
let preconnectDone = false;
function injectPreconnect(): void {
  if (!isBrowser || preconnectDone) return;
  preconnectDone = true;
  ["https://firebasestorage.googleapis.com"].forEach((origin) => {
    if (document.querySelector(`link[rel="preconnect"][href="${origin}"]`)) return;
    const pc = document.createElement("link");
    pc.rel = "preconnect";
    pc.href = origin;
    document.head.appendChild(pc);
    const dns = document.createElement("link");
    dns.rel = "dns-prefetch";
    dns.href = origin;
    document.head.appendChild(dns);
  });
}

export function keepImageAlive(url: string, priority: "high" | "normal" = "normal"): void {
  if (!url || !isBrowser) return;
  if (preloadPending.has(url) || imageMemoryCache.has(url)) return;

  // Mark queued IMMEDIATELY — isImageCached() returns true from this point on,
  // so callers skip the skeleton even before the network response arrives.
  preloadPending.add(url);

  const img = new Image();
  img.decoding = priority === "high" ? "sync" : "async";
  if (priority === "high") {
    (img as HTMLImageElement & { fetchpriority?: string }).fetchpriority = "high";
  }
  img.onload = () => {
    imageMemoryCache.set(url, img);  // hold reference so browser never evicts it
    preloadPending.delete(url);
  };
  img.onerror = () => {
    preloadPending.delete(url);      // remove from pending so retries are allowed
  };
  img.src = url;
}

export function keepVideoAlive(url: string): void {
  if (!url || !isBrowser || videoMemoryCache.has(url)) return;
  const vid = document.createElement("video");
  vid.preload = "auto";
  vid.muted = true;
  vid.playsInline = true;            // required for mobile browsers to buffer
  vid.src = url;
  vid.style.cssText = "position:absolute;width:0;height:0;opacity:0;pointer-events:none;";
  document.body.appendChild(vid);
  vid.load();
  videoMemoryCache.set(url, vid);
}

const VIDEO_RE = /\.(mp4|webm|ogg|mov|avi|mkv)(\?|$)/i;
const isVideoUrl = (url: string) =>
  VIDEO_RE.test(url) || url.includes("/video") || url.includes("vid-");

export type PreloadPriority = "critical" | "high" | "normal" | "low";

/**
 * Preloads a batch of URLs at the given priority tier.
 *
 *  critical  → <link rel="preload"> injected + loaded immediately (fetchpriority=high)
 *              Use for: hero banners, first carousel slide
 *  high      → loaded immediately (fetchpriority=high), no <link> injection
 *              Use for: category images, first product thumbnails
 *  normal    → deferred ~300 ms to idle
 *              Use for: remaining product images, diamonds
 *  low       → deferred ~1500 ms to idle
 *              Use for: gallery, instagram, testimonials, blog thumbnails
 */
export const preloadMedia = (
  urls: string[],
  priority: PreloadPriority = "normal"
): void => {
  if (!isBrowser) return;
  injectPreconnect();

  const unique = Array.from(new Set(urls.filter(Boolean)));
  const images = unique.filter((u) => !isVideoUrl(u));
  const videos = unique.filter((u) => isVideoUrl(u));

  const loadImages = () => {
    const imgPrio: "high" | "normal" =
      priority === "critical" || priority === "high" ? "high" : "normal";
    if (priority === "critical") {
      images.slice(0, 8).forEach(injectLinkPreload);
    }
    images.forEach((url) => keepImageAlive(url, imgPrio));
  };

  const loadVideos = () => {
    videos.forEach(keepVideoAlive);
  };

  if (priority === "critical" || priority === "high") {
    loadImages();
    if (videos.length > 0) {
      schedule(loadVideos, 500);
    }
  } else {
    const delayMs = priority === "normal" ? 300 : 1500;
    schedule(loadImages, delayMs);
    if (videos.length > 0) {
      schedule(loadVideos, delayMs + 300);
    }
  }
};

function schedule(fn: () => void, fallbackMs: number): void {
  if (typeof (window as Window & { requestIdleCallback?: unknown }).requestIdleCallback === "function") {
    (window as Window & { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => void })
      .requestIdleCallback(fn, { timeout: fallbackMs + 2000 });
  } else {
    setTimeout(fn, fallbackMs);
  }
}

/** @deprecated Use preloadMedia(urls, priority) directly */
export const preloadAssets = (urls: string[]) => preloadMedia(urls, "normal");
