import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Session-level cache: once a URL has been fully downloaded this browser session,
 * skip the skeleton and fade-in on any subsequent render of the same URL.
 */
const sessionLoadedCache = new Set<string>();

/**
 * Shared IntersectionObserver — used ONLY to control the visual reveal (fade-in).
 * It does NOT control when the download starts; <img src> is always set immediately
 * so the browser begins downloading every image as soon as the component mounts.
 *
 * 150px rootMargin: the image becomes visible just before it scrolls into view,
 * so the fade-in starts right as the user reaches that section.
 */
let _revealObserver: IntersectionObserver | null = null;
const _revealCallbacks = new Map<Element, () => void>();

function getRevealObserver(): IntersectionObserver | null {
  if (typeof IntersectionObserver === 'undefined') return null;
  if (!_revealObserver) {
    _revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            _revealCallbacks.get(entry.target)?.();
            _revealObserver!.unobserve(entry.target);
            _revealCallbacks.delete(entry.target);
          }
        }
      },
      { rootMargin: '150px 0px', threshold: 0 }
    );
  }
  return _revealObserver;
}

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  wrapperClassName?: string;
  skeletonClassName?: string;
  /**
   * Render without a wrapper <div>. Parent must have position:relative so the
   * skeleton (position:absolute inset-0) and sentinel are positioned correctly.
   */
  noWrapper?: boolean;
  /**
   * Skip the IntersectionObserver entirely — show the image as soon as it loads,
   * regardless of scroll position. Use for above-the-fold or hero images.
   */
  eager?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  className,
  wrapperClassName,
  skeletonClassName,
  noWrapper,
  eager,
  onLoad,
  ...props
}: OptimizedImageProps) {
  const alreadyCached = Boolean(src && sessionLoadedCache.has(src));

  /**
   * `loaded`  — the <img> has fired its onLoad event (download complete).
   * `inView`  — the element has entered (or is near) the viewport per the observer.
   *
   * The image is VISIBLE only when BOTH are true. This means:
   *  • If the image downloads fast while the user is at the top: skeleton waits for
   *    scroll, then fades in instantly (no flicker, no pop-in).
   *  • If the user scrolls faster than the download: skeleton shows until done, but
   *    the download started at page-load so the wait is minimal.
   */
  const [loaded, setLoaded] = useState(alreadyCached);
  const [inView, setInView] = useState(alreadyCached || eager);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!src) return;
    if (sessionLoadedCache.has(src)) {
      setLoaded(true);
      setInView(true);
      return;
    }
    setLoaded(false);
    setInView(!!eager);

    if (eager) return; // no observer needed — reveal immediately once loaded

    // For noWrapper, observe the absolutely-positioned sentinel that fills the parent.
    // For wrapper, observe the wrapper div directly.
    const el = noWrapper ? sentinelRef.current : wrapperRef.current;
    if (!el) {
      setInView(true); // no element to watch — reveal immediately
      return;
    }

    const observer = getRevealObserver();
    if (!observer) {
      setInView(true); // no IntersectionObserver support — reveal immediately
      return;
    }

    _revealCallbacks.set(el, () => setInView(true));
    observer.observe(el);
    return () => {
      observer.unobserve(el);
      _revealCallbacks.delete(el);
    };
  }, [src, noWrapper, eager]);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (src) sessionLoadedCache.add(src);
    setLoaded(true);
    onLoad?.(e);
  };

  const visible = loaded && inView;

  const skeleton = !visible ? (
    <div
      className={cn(
        'absolute inset-0 animate-pulse bg-gradient-to-br from-stone-100 via-amber-50/30 to-stone-100 dark:from-stone-800 dark:via-stone-700/60 dark:to-stone-800',
        skeletonClassName
      )}
    />
  ) : null;

  /**
   * CRITICAL: src is always set — the browser starts downloading immediately on mount.
   * We do NOT withhold src until the observer fires. The observer only controls opacity.
   * This means all images on a page begin downloading as soon as their components mount,
   * giving the browser maximum time to fetch them before the user scrolls down.
   */
  const img = (
    <img
      src={src}
      alt={alt}
      className={cn(
        'transition-opacity duration-500',
        visible ? 'opacity-100' : 'opacity-0',
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
          Sentinel: fills the parent container (parent must have position:relative).
          The IntersectionObserver watches this to detect when the user is approaching,
          triggering the fade-in. The actual download already started at mount time.
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
