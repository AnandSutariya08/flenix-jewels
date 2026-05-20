import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { keepImageAlive } from '@/lib/preload';

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
  noWrapper,
  onLoad,
  ...props
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(() => Boolean(src && sessionLoadedCache.has(src)));

  useEffect(() => {
    if (!src) return;
    if (sessionLoadedCache.has(src)) {
      setLoaded(true);
      return;
    }
    setLoaded(false);
    // Start warming the memory cache immediately so the browser fetches
    // the image in the background. By the time the <img> tag's onLoad
    // fires, the data is already in memory — no re-download on remount.
    keepImageAlive(src);
  }, [src]);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (src) {
      sessionLoadedCache.add(src);
      // Keep a live HTMLImageElement reference so the browser never evicts
      // this image from its memory cache across SPA navigation.
      keepImageAlive(src);
    }
    setLoaded(true);
    onLoad?.(e);
  };

  const skeleton = !loaded ? (
    <div
      className={cn(
        'absolute inset-0 animate-pulse bg-gradient-to-br from-stone-100 via-amber-50/30 to-stone-100 dark:from-stone-800 dark:via-stone-700/60 dark:to-stone-800',
        skeletonClassName
      )}
    />
  ) : null;

  const img = (
    <img
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
