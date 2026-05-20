import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Session-level cache: once a URL is fully loaded this browser session,
 * skip skeleton and fade-in on any subsequent render of the same URL.
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
  }, [src]);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (src) sessionLoadedCache.add(src);
    setLoaded(true);
    onLoad?.(e);
  };

  /**
   * Key design decision: src is ALWAYS set immediately on mount.
   * The browser starts downloading every image as soon as the component renders —
   * no IntersectionObserver gate on the download. Below-fold images download in
   * the background; by the time the user scrolls there, the image is ready.
   *
   * The skeleton + opacity-0 just hide the <img> until the download finishes.
   * The fade-in (transition-opacity) runs off-screen for below-fold images —
   * invisible to the user, but means the image is already fully visible by the
   * time they scroll to it.
   */
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
