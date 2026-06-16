import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { keepImageAlive, isImageCached } from '@/lib/preload';

/**
 * Session-level UI cache: once a URL has finished loading this browser session,
 * skip the skeleton and fade-in on every subsequent render of that same URL.
 * Module-level so it survives React unmount/remount across SPA navigation.
 */
const sessionLoadedCache = new Set<string>();

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  wrapperClassName?: string;
  skeletonClassName?: string;
  /**
   * Low-Quality Image Placeholder — a tiny (~20×20) base64 data URL generated
   * at upload time. Shown as a blurred background while the full image loads,
   * giving the "instant blur-up" effect used by premium e-commerce sites.
   */
  lqip?: string;
  /**
   * Skip wrapper div. Parent must have position:relative for the skeleton
   * (position:absolute inset-0) to be positioned correctly.
   */
  noWrapper?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  className,
  wrapperClassName,
  skeletonClassName,
  lqip,
  noWrapper,
  onLoad,
  ...props
}: OptimizedImageProps) {
  // Only skip skeleton when the image is CONFIRMED visible (loaded in this
  // session or detected via img.complete below). Do NOT include isImageCached /
  // preloadPending here — that set marks images as "downloading" not "done",
  // and skipping the skeleton for an in-flight image shows blank white space.
  const alreadyReady = (url: string) => Boolean(url && sessionLoadedCache.has(url));

  const [loaded, setLoaded] = useState(() => alreadyReady(src));
  const imgRef = useRef<HTMLImageElement>(null);

  // ── Browser HTTP-cache detection ──────────────────────────────────────────
  // useLayoutEffect fires synchronously after DOM mutation but BEFORE paint.
  // If the browser already has this image in its HTTP cache, img.complete is
  // true the instant the element mounts — so we can flip loaded→true in the
  // same paint frame and the user never sees the skeleton.
  useLayoutEffect(() => {
    if (!src) return;
    const el = imgRef.current;
    if (el && el.complete && el.naturalWidth > 0) {
      sessionLoadedCache.add(src);
      keepImageAlive(src);
      setLoaded(true);
    }
  }, [src]);

  useEffect(() => {
    if (!src) return;
    if (alreadyReady(src)) {
      sessionLoadedCache.add(src);
      setLoaded(true);
      return;
    }
    setLoaded(false);
    keepImageAlive(src);
  }, [src]);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (src) {
      sessionLoadedCache.add(src);
      keepImageAlive(src);
    }
    setLoaded(true);
    onLoad?.(e);
  };

  const skeleton = !loaded ? (
    <div className={cn('absolute inset-0 overflow-hidden', skeletonClassName)}>
      {lqip ? (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${lqip})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(12px)',
            transform: 'scale(1.08)',
          }}
        />
      ) : (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-stone-100 via-amber-50/30 to-stone-100 dark:from-stone-800 dark:via-stone-700/60 dark:to-stone-800" />
      )}
    </div>
  ) : null;

  const img = (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      className={cn(
        'transition-opacity duration-500',
        loaded ? 'opacity-100' : 'opacity-0',
        className
      )}
      decoding="async"
      onLoad={handleLoad}
      {...props}
    />
  );

  if (noWrapper) {
    return (
      <>
        {skeleton}
        {img}
      </>
    );
  }

  return (
    <div className={cn('relative overflow-hidden', wrapperClassName)}>
      {skeleton}
      {img}
    </div>
  );
}
