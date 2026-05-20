import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Module-level session cache — images loaded once never fade in again on re-navigation.
 */
const sessionLoadedCache = new Set<string>();

/**
 * Shared IntersectionObserver with a large rootMargin so images begin downloading
 * 600px before they enter the viewport. This eliminates the "pop-in" effect users
 * see when native lazy-loading only triggers at the very edge of the viewport.
 */
let _observer: IntersectionObserver | null = null;
const _callbacks = new Map<Element, () => void>();

function getPreloadObserver(): IntersectionObserver | null {
  if (typeof IntersectionObserver === 'undefined') return null;
  if (!_observer) {
    _observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            _callbacks.get(entry.target)?.();
            _observer!.unobserve(entry.target);
            _callbacks.delete(entry.target);
          }
        }
      },
      { rootMargin: '600px 0px', threshold: 0 }
    );
  }
  return _observer;
}

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  wrapperClassName?: string;
  skeletonClassName?: string;
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
  const alreadyCached = Boolean(src && sessionLoadedCache.has(src));

  // `revealed` — true once the element is within 600px of the viewport (starts download)
  // `loaded`   — true once the img fires onLoad (triggers fade-in)
  const [revealed, setRevealed] = useState(alreadyCached);
  const [loaded, setLoaded] = useState(alreadyCached);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!src) return;
    if (sessionLoadedCache.has(src)) {
      setRevealed(true);
      setLoaded(true);
      return;
    }
    setRevealed(false);
    setLoaded(false);

    // For wrapper mode: observe the wrapper div.
    // For noWrapper mode: observe the absolutely-positioned sentinel div.
    const el = (noWrapper ? sentinelRef.current : wrapperRef.current);
    if (!el) {
      setRevealed(true); // fallback: no element to watch, load immediately
      return;
    }

    const observer = getPreloadObserver();
    if (!observer) {
      setRevealed(true); // fallback: no IntersectionObserver support
      return;
    }

    _callbacks.set(el, () => setRevealed(true));
    observer.observe(el);

    return () => {
      observer.unobserve(el);
      _callbacks.delete(el);
    };
  }, [src, noWrapper]);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (src) sessionLoadedCache.add(src);
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

  // The img src is withheld until revealed — no download until the observer fires.
  // No loading="lazy" here: once we set src, the browser downloads immediately (no
  // second throttle delay on top of our custom 600px pre-load margin).
  const img = (
    <img
      src={revealed ? src : undefined}
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
        {/*
          Sentinel: fills the parent container (parent must be positioned).
          The IntersectionObserver watches this to fire 600px before the parent
          comes into view, so the real image download starts early.
        */}
        <div
          ref={sentinelRef}
          aria-hidden="true"
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: -1 }}
        />
        {skeleton}
        {img}
      </>
    );
  }

  return (
    <div ref={wrapperRef} className={cn('relative overflow-hidden', wrapperClassName)}>
      {skeleton}
      {img}
    </div>
  );
}
