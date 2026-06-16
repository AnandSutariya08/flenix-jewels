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
 *  - Stall recovery       — if playback freezes mid-video, automatically seeks
 *                           back 0.25 s and resumes after 2 seconds
 *  - forwardRef           — parent keeps full play/pause/mute control
 *
 * Pass autoPlay={false} to suppress internal autoplay (ProductDialog pattern).
 * Pass skeletonClassName="hidden" when the parent shows its own loading UI.
 * Pass preload="none" to defer download until play() is called (e.g. carousels).
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
    const stallTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

    // ── Stall recovery ──────────────────────────────────────────────────────
    // Attach once to the video DOM element. When the browser fires "waiting"
    // or "stalled" (video froze waiting for data), schedule a nudge:
    //   • After 2 s of no progress, seek back 0.25 s and call play().
    //   • If the video recovered on its own ("playing"/"seeked"), cancel.
    useEffect(() => {
      const v = internalRef.current;
      if (!v) return;

      const clearStall = () => {
        if (stallTimerRef.current !== null) {
          clearTimeout(stallTimerRef.current);
          stallTimerRef.current = null;
        }
      };

      const onStall = () => {
        clearStall();
        stallTimerRef.current = setTimeout(() => {
          // Only nudge if the video is still supposed to be playing
          // (not paused by the user) and hasn't buffered enough data.
          if (!v.paused && v.readyState < 3 /* HAVE_FUTURE_DATA */) {
            const t = v.currentTime;
            v.currentTime = Math.max(0, t - 0.25);
            v.play().catch(() => {});
          }
        }, 2000);
      };

      v.addEventListener('waiting', onStall);
      v.addEventListener('stalled', onStall);
      v.addEventListener('playing', clearStall);
      v.addEventListener('seeked',  clearStall);

      return () => {
        clearStall();
        v.removeEventListener('waiting', onStall);
        v.removeEventListener('stalled', onStall);
        v.removeEventListener('playing', clearStall);
        v.removeEventListener('seeked',  clearStall);
      };
    }, []); // DOM element doesn't change — set up once

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
