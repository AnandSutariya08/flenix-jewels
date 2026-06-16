import { useEffect, useRef, useState, useCallback, forwardRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * Session-level cache: once a URL has started playing this session,
 * skip the skeleton shimmer on every subsequent render of that same URL.
 */
const sessionVideoCache = new Set<string>();

interface OptimizedVideoProps extends Omit<React.VideoHTMLAttributes<HTMLVideoElement>, 'src'> {
  src: string;
  wrapperClassName?: string;
  skeletonClassName?: string;
  /**
   * Skip wrapper div. Parent must have position:relative for the skeleton
   * (position:absolute inset-0) to be positioned correctly.
   */
  noWrapper?: boolean;
}

/**
 * Drop-in <video> replacement that adds:
 *  - Session-level cache  — second open skips skeleton instantly
 *  - Skeleton shimmer     — dark animated placeholder while first frame loads
 *  - Fade-in transition   — smooth opacity reveal when first frame arrives
 *  - Smooth autoplay      — triggers on canplaythrough (enough buffered) with
 *                           a 3-second fallback so slow connections still play
 *  - forwardRef           — parent keeps full play/pause/mute control
 *
 * Pass autoPlay={false} to suppress internal autoplay (ProductDialog pattern).
 * Pass skeletonClassName="hidden" when the parent shows its own loading UI.
 */
export const OptimizedVideo = forwardRef<HTMLVideoElement, OptimizedVideoProps>(
  function OptimizedVideo(
    {
      src,
      className,
      wrapperClassName,
      skeletonClassName,
      noWrapper,
      autoPlay,
      onCanPlay: externalCanPlay,
      onCanPlayThrough: externalCanPlayThrough,
      ...props
    },
    forwardedRef
  ) {
    const internalRef = useRef<HTMLVideoElement>(null);
    const playStartedRef = useRef(false);

    const setRef = useCallback(
      (node: HTMLVideoElement | null) => {
        (internalRef as React.MutableRefObject<HTMLVideoElement | null>).current = node;
        if (typeof forwardedRef === 'function') forwardedRef(node);
        else if (forwardedRef)
          (forwardedRef as React.MutableRefObject<HTMLVideoElement | null>).current = node;
      },
      [forwardedRef]
    );

    const [loaded, setLoaded] = useState(() => Boolean(src && sessionVideoCache.has(src)));

    useEffect(() => {
      if (!src) return;
      if (sessionVideoCache.has(src)) { setLoaded(true); return; }
      setLoaded(false);
      playStartedRef.current = false;
    }, [src]);

    const doPlay = useCallback(() => {
      const v = internalRef.current;
      if (!v || playStartedRef.current || !autoPlay) return;
      playStartedRef.current = true;
      v.play().catch(() => { playStartedRef.current = false; });
    }, [autoPlay]);

    useEffect(() => {
      if (!autoPlay || !src) return;
      playStartedRef.current = false;
      const t = setTimeout(() => doPlay(), 3000);
      return () => clearTimeout(t);
    }, [src, autoPlay, doPlay]);

    const handleCanPlay = (e: React.SyntheticEvent<HTMLVideoElement>) => {
      if (src) sessionVideoCache.add(src);
      setLoaded(true);
      externalCanPlay?.(e);
    };

    const handleCanPlayThrough = (e: React.SyntheticEvent<HTMLVideoElement>) => {
      if (src) sessionVideoCache.add(src);
      setLoaded(true);
      doPlay();
      externalCanPlayThrough?.(e);
    };

    const skeleton = !loaded ? (
      <div
        className={cn(
          'absolute inset-0 animate-pulse bg-gradient-to-br from-stone-900 via-stone-800/60 to-stone-900',
          skeletonClassName
        )}
      />
    ) : null;

    const video = (
      <video
        preload="auto"
        {...props}
        autoPlay={false}
        ref={setRef}
        src={src}
        className={cn(
          'transition-opacity duration-500',
          loaded ? 'opacity-100' : 'opacity-0',
          className
        )}
        onCanPlay={handleCanPlay}
        onCanPlayThrough={handleCanPlayThrough}
      />
    );

    if (noWrapper) return <>{skeleton}{video}</>;

    return (
      <div className={cn('relative overflow-hidden', wrapperClassName)}>
        {skeleton}
        {video}
      </div>
    );
  }
);
