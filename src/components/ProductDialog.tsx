import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { isImageCached, keepImageAlive } from '@/lib/preload';
import { Product } from '@/lib/storage';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import WhatsAppButton from './WhatsAppButton';
import { X, ChevronLeft, ChevronRight, Truck, Shield, Star, Pause, Volume2, VolumeX, Play, Sparkles } from 'lucide-react';

interface ProductDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
interface MediaItem { url: string; type: 'image' | 'video'; }

const getMediaType = (url: string): 'image' | 'video' => {
  if (!url) return 'image';
  const lower = url.toLowerCase();
  return /\.(mp4|webm|ogg|mov|avi|mkv)/i.test(lower) ||
    lower.includes('video') || lower.includes('vid-') ? 'video' : 'image';
};

export default function ProductDialog({ product, open, onOpenChange }: ProductDialogProps) {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);

  const media: MediaItem[] = useMemo(() => {
    const urls = product?.images?.length ? product.images : product?.image ? [product.image] : [];
    return urls.map(url => ({ url, type: getMediaType(url) }));
  }, [product]);

  const poster = useMemo(() => media.find(m => m.type === 'image')?.url || '', [media]);
  const count = media.length;
  const safeIdx = count > 0 ? Math.min(idx, count - 1) : 0;
  const current = media[safeIdx] ?? null;
  const multi = count > 1;

  useEffect(() => {
    if (!open) return;
    const firstUrl = media[0]?.url;
    setIdx(0); setPlaying(false); setMuted(true);
    setLoaded(Boolean(firstUrl && media[0]?.type === 'image' && isImageCached(firstUrl)));
    setTransitioning(false);
  }, [open, media]);

  useEffect(() => {
    const url = media[safeIdx]?.url;
    setLoaded(Boolean(url && media[safeIdx]?.type === 'image' && isImageCached(url)));
    setPlaying(false);
    setTransitioning(false);
  }, [safeIdx, media]);

  useEffect(() => {
    if (!open) { videoRef.current?.pause(); }
  }, [open]);

  useEffect(() => {
    if (!open || current?.type !== 'video') return;
    const v = videoRef.current;
    if (!v) return;
    const t = setTimeout(() => {
      v.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }, 100);
    return () => clearTimeout(t);
  }, [open, current?.url, current?.type]);

  useEffect(() => {
    const strip = thumbsRef.current;
    if (!strip) return;
    const btn = strip.children[safeIdx] as HTMLElement | undefined;
    btn?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }, [safeIdx]);

  const handleCanPlay = useCallback(() => {
    setLoaded(true);
    if (!open || !videoRef.current) return;
    videoRef.current.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, [open]);

  if (!product || count === 0) return null;

  const go = (dir: 1 | -1) => {
    setTransitioning(true);
    setTimeout(() => {
      setIdx(p => (p + dir + count) % count);
      setTransitioning(false);
    }, 120);
  };

  const goTo = (i: number) => {
    if (i === safeIdx) return;
    setTransitioning(true);
    setTimeout(() => {
      setIdx(i);
      setTransitioning(false);
    }, 120);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) { videoRef.current.pause(); setPlaying(false); }
    else { videoRef.current.play().then(() => setPlaying(true)); }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !muted;
    setMuted(!muted);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="p-0 overflow-hidden gap-0 border-0"
        style={{
          width: '96vw',
          maxWidth: 1260,
          height: '82vh',
          maxHeight: 700,
          borderRadius: 24,
          background: '#080504',
          boxShadow: '0 40px 120px -20px rgba(0,0,0,0.85), 0 0 0 1px rgba(196,144,106,0.18)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <DialogTitle className="sr-only">{product.name}</DialogTitle>
        <DialogDescription className="sr-only">Product gallery and details</DialogDescription>

        {/* Close button */}
        <button
          onClick={() => onOpenChange(false)}
          aria-label="Close"
          className="absolute z-50 flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
          style={{
            top: 14, right: 14,
            width: 38, height: 38,
            background: 'rgba(8,5,4,0.75)',
            border: '1px solid rgba(196,144,106,0.35)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <X className="h-4 w-4 text-white/90" />
        </button>

        {/* ═══ MOBILE layout (< lg) ═══════════════════════════════════ */}
        <div className="lg:hidden flex flex-col h-full overflow-hidden">

          {/* Image area */}
          <div className="relative flex-shrink-0 w-full overflow-hidden" style={{ height: 'clamp(240px, 50vw, 340px)', background: '#080504' }}>
            {/* Main media */}
            <div
              className="absolute inset-0 transition-opacity duration-200"
              style={{ opacity: transitioning ? 0 : 1 }}
            >
              {!loaded && (
                <div className="absolute inset-0 z-10 flex items-center justify-center" style={{ background: '#0f0906' }}>
                  <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'rgba(196,144,106,0.6)', borderTopColor: 'transparent' }} />
                </div>
              )}
              {current?.type === 'video' ? (
                <video
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full object-contain"
                  loop muted={muted} playsInline preload="auto"
                  src={current.url} poster={poster || undefined}
                  onLoadedData={() => setLoaded(true)}
                  onCanPlay={handleCanPlay}
                />
              ) : current ? (
                <img
                  key={current.url}
                  src={current.url}
                  alt={product.name}
                  draggable={false}
                  loading="eager"
                  className="absolute inset-0 w-full h-full object-contain"
                  onLoad={() => { setLoaded(true); keepImageAlive(current.url); }}
                />
              ) : null}
            </div>

            {/* Bottom fade */}
            <div className="absolute bottom-0 left-0 right-0 h-16 z-10 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(8,5,4,0.6), transparent)' }} />

            {/* Nav arrows */}
            {multi && (
              <>
                <button onClick={() => go(-1)} aria-label="Previous"
                  className="absolute z-20 flex items-center justify-center rounded-full transition-all hover:scale-110 active:scale-95"
                  style={{ left: 10, top: '50%', transform: 'translateY(-50%)', width: 34, height: 34, background: 'rgba(8,5,4,0.65)', border: '1px solid rgba(196,144,106,0.35)', backdropFilter: 'blur(8px)' }}>
                  <ChevronLeft className="h-4 w-4 text-white" strokeWidth={2.5} />
                </button>
                <button onClick={() => go(1)} aria-label="Next"
                  className="absolute z-20 flex items-center justify-center rounded-full transition-all hover:scale-110 active:scale-95"
                  style={{ right: 10, top: '50%', transform: 'translateY(-50%)', width: 34, height: 34, background: 'rgba(8,5,4,0.65)', border: '1px solid rgba(196,144,106,0.35)', backdropFilter: 'blur(8px)' }}>
                  <ChevronRight className="h-4 w-4 text-white" strokeWidth={2.5} />
                </button>
              </>
            )}

            {/* Video controls */}
            {current?.type === 'video' && (
              <div className="absolute bottom-3 left-3 flex gap-1.5 z-20">
                {[{ onClick: togglePlay, label: playing ? 'Pause' : 'Play', icon: playing ? <Pause className="h-3.5 w-3.5 text-white" /> : <Play className="h-3.5 w-3.5 text-white" fill="white" /> },
                  { onClick: toggleMute, label: muted ? 'Unmute' : 'Mute', icon: muted ? <VolumeX className="h-3.5 w-3.5 text-white" /> : <Volume2 className="h-3.5 w-3.5 text-white" /> }].map(b => (
                  <button key={b.label} onClick={b.onClick} aria-label={b.label}
                    className="flex items-center justify-center rounded-full"
                    style={{ width: 30, height: 30, background: 'rgba(8,5,4,0.7)', border: '1px solid rgba(196,144,106,0.35)', backdropFilter: 'blur(8px)' }}>
                    {b.icon}
                  </button>
                ))}
              </div>
            )}

            {/* Dot indicators */}
            {multi && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
                {media.map((_, i) => (
                  <button key={i} onClick={() => goTo(i)} aria-label={`Go to image ${i + 1}`}
                    className="rounded-full transition-all duration-300"
                    style={{ width: i === safeIdx ? 20 : 6, height: 6, background: i === safeIdx ? '#C4906A' : 'rgba(255,255,255,0.35)' }} />
                ))}
              </div>
            )}
          </div>

          {/* Thumbnail strip — only show if > 1 and layout has space */}
          {multi && count <= 8 && (
            <div className="flex-shrink-0 px-3 py-2.5" style={{ background: '#0a0604', borderTop: '1px solid rgba(196,144,106,0.12)' }}>
              <div ref={thumbsRef} className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                {media.map((item, i) => {
                  const active = i === safeIdx;
                  return (
                    <button key={i} onClick={() => goTo(i)} aria-label={`Thumbnail ${i + 1}`}
                      className="flex-shrink-0 rounded-lg overflow-hidden transition-all duration-200"
                      style={{ width: 48, height: 48, padding: active ? 0 : 0, flexShrink: 0, position: 'relative' }}>
                      {/* Border wrapper — outside overflow:hidden */}
                      <div style={{
                        position: 'absolute', inset: active ? -2 : 0,
                        borderRadius: active ? 9 : 8,
                        border: active ? '2px solid #C4906A' : '2px solid transparent',
                        zIndex: 2, pointerEvents: 'none',
                        transition: 'border-color 0.2s',
                        boxShadow: active ? '0 0 8px rgba(196,144,106,0.5)' : 'none',
                      }} />
                      {item.type === 'video' ? (
                        <div className="w-full h-full flex items-center justify-center rounded-lg" style={{ background: '#1a0e08' }}>
                          <Play className="h-4 w-4 text-white/70" fill="rgba(255,255,255,0.7)" />
                        </div>
                      ) : (
                        <img src={item.url} alt="" className="w-full h-full object-cover rounded-lg" loading="lazy"
                          style={{ opacity: active ? 1 : 0.5, transition: 'opacity 0.2s' }} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Info panel */}
          <div className="flex-1 overflow-y-auto min-h-0" style={{ background: 'linear-gradient(160deg, #faf7f3 0%, #f5ede3 100%)' }}>
            <div className="px-5 pt-5 pb-4 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3 w-3" style={{ color: '#C4906A' }} />
                <span className="text-[9px] tracking-[0.25em] uppercase font-bold" style={{ color: '#9B6844' }}>Flenix Jewels</span>
              </div>
              <h1 className="text-xl font-bold leading-snug text-zinc-900">{product.name}</h1>

              {/* Badges */}
              <div className="flex gap-2">
                {[
                  { icon: <Truck className="h-3.5 w-3.5" />, label: 'Free Shipping' },
                  { icon: <Shield className="h-3.5 w-3.5" />, label: 'Secure Pay' },
                  { icon: <Star className="h-3.5 w-3.5" />, label: 'Certified' },
                ].map(b => (
                  <div key={b.label} className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl"
                    style={{ background: 'rgba(196,144,106,0.08)', border: '1px solid rgba(196,144,106,0.2)', color: '#9B6844' }}>
                    {b.icon}
                    <span className="text-[8.5px] font-semibold text-center leading-tight" style={{ color: '#8a5e38' }}>{b.label}</span>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div className="h-px" style={{ background: 'linear-gradient(90deg, rgba(196,144,106,0.4), transparent)' }} />

              {product.description && (
                <div className="text-sm leading-relaxed text-zinc-600 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.description }} />
              )}
              <div className="h-1" />
            </div>
          </div>

          {/* CTA */}
          <div className="flex-shrink-0 px-4 py-3" style={{ background: '#faf7f3', borderTop: '1px solid rgba(196,144,106,0.18)' }}>
            <WhatsAppButton product={product} className="w-full h-12 text-sm font-bold rounded-xl" />
          </div>
        </div>

        {/* ═══ DESKTOP layout (lg+) ══════════════════════════════════ */}
        <div className="hidden lg:flex h-full overflow-hidden" style={{ borderRadius: 24 }}>

          {/* LEFT — media panel */}
          <div className="relative flex flex-col overflow-hidden" style={{ width: '55%', flexShrink: 0, background: '#080504' }}>

            {/* Vertical thumbnail rail — left inside the image panel */}
            {multi && (
              <div
                className="absolute left-0 top-0 bottom-0 z-20 flex flex-col items-center py-4 gap-2.5 overflow-y-auto"
                ref={thumbsRef}
                style={{
                  width: 72,
                  scrollbarWidth: 'none',
                  background: 'linear-gradient(to right, rgba(8,5,4,0.92), rgba(8,5,4,0.5), transparent)',
                  backdropFilter: 'blur(4px)',
                }}
              >
                {media.map((item, i) => {
                  const active = i === safeIdx;
                  return (
                    <button
                      key={i}
                      onClick={() => goTo(i)}
                      aria-label={`View image ${i + 1}`}
                      className="flex-shrink-0 transition-all duration-200 hover:scale-105"
                      style={{ position: 'relative', width: 48, height: 48 }}
                    >
                      {/* Border layer — sits outside, not clipped */}
                      <span style={{
                        position: 'absolute',
                        inset: -3,
                        borderRadius: 10,
                        border: active ? '2px solid #C4906A' : '2px solid transparent',
                        boxShadow: active ? '0 0 12px rgba(196,144,106,0.55)' : 'none',
                        pointerEvents: 'none',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                        zIndex: 2,
                      }} />
                      <div className="w-full h-full rounded-lg overflow-hidden" style={{ opacity: active ? 1 : 0.45, transition: 'opacity 0.2s' }}>
                        {item.type === 'video' ? (
                          <div className="w-full h-full flex items-center justify-center" style={{ background: '#1a0e08' }}>
                            <Play className="h-4 w-4 text-white/80" fill="rgba(255,255,255,0.8)" />
                          </div>
                        ) : (
                          <img src={item.url} alt="" className="w-full h-full object-cover" loading="lazy" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Main media */}
            <div className="absolute inset-0" style={{ left: multi ? 72 : 0 }}>
              <div
                className="absolute inset-0 transition-opacity duration-150"
                style={{ opacity: transitioning ? 0 : 1 }}
              >
                {!loaded && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center" style={{ background: '#0a0705' }}>
                    <div className="w-10 h-10 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(196,144,106,0.4)', borderTopColor: '#C4906A' }} />
                  </div>
                )}
                {current?.type === 'video' ? (
                  <video
                    ref={videoRef}
                    className="absolute inset-0 w-full h-full object-contain"
                    loop muted={muted} playsInline preload="auto"
                    src={current.url} poster={poster || undefined}
                    onLoadedData={() => setLoaded(true)}
                    onCanPlay={handleCanPlay}
                  />
                ) : current ? (
                  <img
                    key={current.url}
                    src={current.url}
                    alt={product.name}
                    draggable={false}
                    loading="eager"
                    className="absolute inset-0 w-full h-full object-contain"
                    onLoad={() => { setLoaded(true); keepImageAlive(current.url); }}
                  />
                ) : null}
              </div>

              {/* Top gradient */}
              <div className="absolute top-0 left-0 right-0 h-20 z-10 pointer-events-none"
                style={{ background: 'linear-gradient(to bottom, rgba(8,5,4,0.45), transparent)' }} />
              {/* Bottom gradient */}
              <div className="absolute bottom-0 left-0 right-0 h-28 z-10 pointer-events-none"
                style={{ background: 'linear-gradient(to top, rgba(8,5,4,0.65), transparent)' }} />

              {/* Nav arrows */}
              {multi && (
                <>
                  <button onClick={() => go(-1)} aria-label="Previous"
                    className="absolute z-20 flex items-center justify-center rounded-full transition-all duration-150 hover:scale-110 active:scale-95"
                    style={{ left: 14, top: '50%', transform: 'translateY(-50%)', width: 40, height: 40, background: 'rgba(8,5,4,0.7)', border: '1px solid rgba(196,144,106,0.4)', backdropFilter: 'blur(10px)' }}>
                    <ChevronLeft className="h-5 w-5 text-white" strokeWidth={2} />
                  </button>
                  <button onClick={() => go(1)} aria-label="Next"
                    className="absolute z-20 flex items-center justify-center rounded-full transition-all duration-150 hover:scale-110 active:scale-95"
                    style={{ right: 14, top: '50%', transform: 'translateY(-50%)', width: 40, height: 40, background: 'rgba(8,5,4,0.7)', border: '1px solid rgba(196,144,106,0.4)', backdropFilter: 'blur(10px)' }}>
                    <ChevronRight className="h-5 w-5 text-white" strokeWidth={2} />
                  </button>
                </>
              )}

              {/* Video controls */}
              {current?.type === 'video' && (
                <div className="absolute bottom-5 left-5 flex gap-2 z-20">
                  {[{ onClick: togglePlay, label: playing ? 'Pause' : 'Play', icon: playing ? <Pause className="h-4 w-4 text-white" /> : <Play className="h-4 w-4 text-white" fill="white" /> },
                    { onClick: toggleMute, label: muted ? 'Unmute' : 'Mute', icon: muted ? <VolumeX className="h-4 w-4 text-white" /> : <Volume2 className="h-4 w-4 text-white" /> }].map(b => (
                    <button key={b.label} onClick={b.onClick} aria-label={b.label}
                      className="flex items-center justify-center rounded-full transition-all hover:scale-110"
                      style={{ width: 36, height: 36, background: 'rgba(8,5,4,0.72)', border: '1px solid rgba(196,144,106,0.38)', backdropFilter: 'blur(8px)' }}>
                      {b.icon}
                    </button>
                  ))}
                </div>
              )}

              {/* Dot indicators at bottom center */}
              {multi && (
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2 items-center">
                  {media.map((_, i) => (
                    <button key={i} onClick={() => goTo(i)} aria-label={`Go to ${i + 1}`}
                      className="rounded-full transition-all duration-300"
                      style={{ width: i === safeIdx ? 24 : 7, height: 7, background: i === safeIdx ? '#C4906A' : 'rgba(255,255,255,0.3)' }} />
                  ))}
                </div>
              )}

              {/* Image counter badge */}
              {multi && (
                <div className="absolute top-5 right-5 z-20 px-3 py-1 rounded-full text-[11px] font-semibold text-white/80"
                  style={{ background: 'rgba(8,5,4,0.6)', border: '1px solid rgba(196,144,106,0.25)', backdropFilter: 'blur(8px)' }}>
                  {safeIdx + 1} / {count}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — info panel */}
          <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'linear-gradient(160deg, #faf8f4 0%, #f3e9dd 100%)' }}>

            {/* Decorative top accent */}
            <div className="flex-shrink-0 h-1 w-full" style={{ background: 'linear-gradient(90deg, #9B6844, #D4A96A, #C4906A, transparent)' }} />

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
              <div className="px-8 xl:px-10 pt-8 pb-6 space-y-5">

                {/* Brand eyebrow */}
                <div className="flex items-center gap-2.5">
                  <div className="flex gap-0.5">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="w-1 h-1 rounded-full" style={{ background: '#C4906A', opacity: 1 - i * 0.25 }} />
                    ))}
                  </div>
                  <span className="text-[10px] tracking-[0.3em] uppercase font-bold" style={{ color: '#9B6844' }}>Flenix Jewels</span>
                </div>

                {/* Product name */}
                <div>
                  <h1 className="text-2xl xl:text-[1.75rem] font-bold leading-tight text-zinc-900" style={{ letterSpacing: '-0.015em' }}>
                    {product.name}
                  </h1>
                  <div className="mt-3 h-px" style={{ background: 'linear-gradient(90deg, rgba(196,144,106,0.55), rgba(196,144,106,0.1), transparent)' }} />
                </div>

                {/* Badges */}
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { icon: <Truck className="h-4 w-4" />, label: 'Free Shipping', sub: 'Worldwide' },
                    { icon: <Shield className="h-4 w-4" />, label: 'Secure Pay', sub: '100% Safe' },
                    { icon: <Star className="h-4 w-4" />, label: 'Certified', sub: 'Authentic' },
                  ].map(b => (
                    <div key={b.label} className="flex flex-col items-center gap-1.5 py-3 rounded-2xl"
                      style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(196,144,106,0.22)', backdropFilter: 'blur(8px)', boxShadow: '0 2px 12px rgba(196,144,106,0.08)' }}>
                      <div style={{ color: '#C4906A' }}>{b.icon}</div>
                      <div className="text-center">
                        <div className="text-[10px] font-bold leading-tight" style={{ color: '#7a4e2a' }}>{b.label}</div>
                        <div className="text-[9px] leading-tight text-zinc-400">{b.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Description */}
                {product.description && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-3 h-px" style={{ background: '#C4906A' }} />
                      <span className="text-[9px] tracking-[0.2em] uppercase font-bold" style={{ color: '#9B6844' }}>Details</span>
                    </div>
                    <div className="text-[13px] xl:text-sm leading-[1.75] text-zinc-600 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: product.description }} />
                  </div>
                )}
              </div>
            </div>

            {/* CTA — pinned bottom */}
            <div className="flex-shrink-0 px-8 xl:px-10 py-5"
              style={{ borderTop: '1px solid rgba(196,144,106,0.2)', background: 'rgba(250,247,243,0.95)', backdropFilter: 'blur(12px)' }}>
              <p className="text-[9.5px] text-center tracking-[0.2em] uppercase font-semibold mb-3.5" style={{ color: '#A0714A' }}>
                Certified Quality · Secure Packaging · Global Shipping
              </p>
              <WhatsAppButton
                product={product}
                className="w-full h-12 text-sm font-bold rounded-2xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
