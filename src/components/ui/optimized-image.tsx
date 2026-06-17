import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { keepImageAlive, isImageCached } from '@/lib/preload';

const sessionLoadedCache = new Set<string>();

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  wrapperClassName?: string;
  skeletonClassName?: string;
  lqip?: string;
  noWrapper?: boolean;
  /**
   * Maps to the HTML `fetchpriority` attribute. Extracted here so React
   * doesn't warn about an unrecognised DOM prop — applied via setAttribute.
   */
  fetchPriority?: 'high' | 'low' | 'auto';
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
  fetchPriority,
  ...props
}: OptimizedImageProps) {
  const alreadyReady = (url: string) => Boolean(url && sessionLoadedCache.has(url));

  const [loaded, setLoaded] = useState(() => alreadyReady(src));
  const imgRef = useRef<HTMLImageElement>(null);

  // Apply fetchpriority as a DOM attribute (bypasses React prop warnings)
  useLayoutEffect(() => {
    if (imgRef.current && fetchPriority) {
      imgRef.current.setAttribute('fetchpriority', fetchPriority);
    }
  }, [fetchPriority]);

  // If browser already has image in memory/HTTP cache, skip skeleton immediately
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
        'transition-opacity duration-150',
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
