import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Product } from '@/lib/storage';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import WhatsAppButton from './WhatsAppButton';
import { X, ChevronLeft, ChevronRight, Truck, Shield, Zap, Pause, Volume2, VolumeX, Play } from 'lucide-react';

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);

  const media: MediaItem[] = useMemo(() => {
    const urls = product?.images?.length ? product.images : product?.image ? [product.image] : [];
    return urls.map(url => ({ url, type: getMediaType(url) }));
  }, [product]);

  const poster = useMemo(() =>
    media.find(m => m.type === 'image')?.url || '',
  [media]);

  const count = media.length;
  const safeIdx = count > 0 ? Math.min(idx, count - 1) : 0;
  const current = media[safeIdx] ?? null;
  const multi = count > 1;

  // Reset on open
  useEffect(() => {
    if (!open) return;
    setIdx(0); setPlaying(false); setMuted(true); setLoaded(false);
  }, [open]);

  // Reset loaded on slide change
  useEffect(() => { setLoaded(false); setPlaying(false); }, [safeIdx]);

  // Stop video when closed
  useEffect(() => {
    if (!open) { videoRef.current?.pause(); }
  }, [open]);

  // Autoplay video when active
  useEffect(() => {
    if (!open || current?.type !== 'video') return;
    const v = videoRef.current;
    if (!v) return;
    const t = setTimeout(() => {
      v.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }, 100);
    return () => clearTimeout(t);
  }, [open, current?.url, current?.type]);

  // Scroll active thumbnail into view
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

  const go = (dir: 1 | -1) => setIdx(p => (p + dir + count) % count);

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

  /* ── Media renderer ─────────────────────────────────────────────── */
  const MainMedia = () => {
    if (!current) return null;
    if (current.type === 'video') {
      return (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-contain"
          loop muted={muted} playsInline preload="auto"
          src={current.url} poster={poster || undefined}
          onLoadedData={() => setLoaded(true)}
          onCanPlay={handleCanPlay}
        />
      );
    }
    return (
      <img
        key={current.url}
        src={current.url}
        alt={product.name}
        draggable={false}
        loading="eager"
        decoding="async"
        className="absolute inset-0 w-full h-full object-contain"
        onLoad={() => setLoaded(true)}
      />
    );
  };

  /* ── Thumbnail ──────────────────────────────────────────────────── */
  const Thumb = ({ item, i }: { item: MediaItem; i: number }) => {
    const active = i === safeIdx;
    return (
      <button
        onClick={() => setIdx(i)}
        className="relative flex-shrink-0 overflow-hidden transition-all duration-200"
        style={{
          width: 56, height: 56,
          borderRadius: 6,
          outline: active ? '2px solid #C4906A' : '2px solid transparent',
          outlineOffset: 2,
          opacity: active ? 1 : 0.5,
        }}
      >
        {item.type === 'video' ? (
          <div className="w-full h-full flex items-center justify-center" style={{ background: '#1C0D05' }}>
            <Play className="h-5 w-5 text-white/80" fill="white" />
          </div>
        ) : (
          <img src={item.url} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
        )}
      </button>
    );
  };

  /* ── Shared overlay button ──────────────────────────────────────── */
  const OverlayBtn = ({ onClick, label, children, pos }: {
    onClick: () => void; label: string; children: React.ReactNode;
    pos: React.CSSProperties;
  }) => (
    <button
      onClick={onClick}
      aria-label={label}
      className="absolute z-30 flex items-center justify-center rounded-full transition-all duration-150 hover:scale-110 active:scale-95"
      style={{
        width: 36, height: 36,
        background: 'rgba(28,13,5,0.68)',
        border: '1px solid rgba(196,144,106,0.45)',
        backdropFilter: 'blur(8px)',
        ...pos,
      }}
    >
      {children}
    </button>
  );

  /* ── Badge row ──────────────────────────────────────────────────── */
  const Badges = () => (
    <div className="flex gap-2">
      {[
        { icon: <Truck className="h-3.5 w-3.5" style={{ color: '#9B6844' }} />, label: 'Free Shipping', bg: 'rgba(196,144,106,0.10)', border: 'rgba(196,144,106,0.28)' },
        { icon: <Shield className="h-3.5 w-3.5" style={{ color: '#C4906A' }} />, label: 'Secure Payment', bg: 'rgba(212,169,106,0.10)', border: 'rgba(212,169,106,0.28)' },
        { icon: <Zap className="h-3.5 w-3.5" style={{ color: '#9B6844' }} />, label: 'Fast Delivery', bg: 'rgba(155,104,68,0.10)', border: 'rgba(155,104,68,0.28)' },
      ].map(b => (
        <div key={b.label} className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl"
          style={{ background: b.bg, border: `1px solid ${b.border}` }}>
          {b.icon}
          <span className="text-[9px] font-semibold text-center leading-tight text-zinc-600 dark:text-zinc-400">{b.label}</span>
        </div>
      ))}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="p-0 overflow-hidden"
        style={{
          width: '95vw',
          maxWidth: 1100,
          height: '92vh',
          maxHeight: 820,
          borderRadius: 20,
          background: 'transparent',
          border: '1px solid rgba(196,144,106,0.25)',
          boxShadow: '0 32px 80px -12px rgba(28,13,5,0.55)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <DialogTitle className="sr-only">{product.name}</DialogTitle>
        <DialogDescription className="sr-only">Product gallery and details</DialogDescription>

        {/* Close */}
        <OverlayBtn onClick={() => onOpenChange(false)} label="Close"
          pos={{ top: 12, right: 12 }}>
          <X className="h-3.5 w-3.5 text-white" />
        </OverlayBtn>

        {/* ── MOBILE  (< lg) ────────────────────────────────────────── */}
        <div className="lg:hidden flex flex-col h-full overflow-hidden" style={{ background: '#0f0906' }}>

          {/* Media — fixed clamp height: never too small on tiny phones, never too tall on big ones */}
          <div
            className="relative flex-shrink-0 w-full overflow-hidden"
            style={{ height: 'clamp(220px, 46vw, 320px)', background: '#0f0906' }}
          >
            {!loaded && (
              <div className="absolute inset-0 z-10" style={{ background: '#1C0D05' }}>
                <div className="absolute inset-0 animate-pulse" style={{ background: 'rgba(196,144,106,0.07)' }} />
              </div>
            )}

            <MainMedia />

            {/* Chevrons */}
            {multi && (
              <>
                <OverlayBtn onClick={() => go(-1)} label="Previous" pos={{ left: 10, top: '50%', transform: 'translateY(-50%)' }}>
                  <ChevronLeft className="h-4 w-4 text-white" strokeWidth={2.5} />
                </OverlayBtn>
                <OverlayBtn onClick={() => go(1)} label="Next" pos={{ right: 10, top: '50%', transform: 'translateY(-50%)' }}>
                  <ChevronRight className="h-4 w-4 text-white" strokeWidth={2.5} />
                </OverlayBtn>
              </>
            )}

            {/* Video controls */}
            {current?.type === 'video' && (
              <div className="absolute bottom-3 left-3 flex gap-1.5 z-20">
                <OverlayBtn onClick={togglePlay} label={playing ? 'Pause' : 'Play'} pos={{}}>
                  {playing ? <Pause className="h-3.5 w-3.5 text-white" /> : <Play className="h-3.5 w-3.5 text-white" fill="white" />}
                </OverlayBtn>
                <OverlayBtn onClick={toggleMute} label={muted ? 'Unmute' : 'Mute'} pos={{}}>
                  {muted ? <VolumeX className="h-3.5 w-3.5 text-white" /> : <Volume2 className="h-3.5 w-3.5 text-white" />}
                </OverlayBtn>
              </div>
            )}

            {/* Counter */}
            {multi && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 px-3 py-0.5 rounded-full text-[11px] font-medium text-white/80"
                style={{ background: 'rgba(28,13,5,0.55)', backdropFilter: 'blur(6px)' }}>
                {safeIdx + 1} / {count}
              </div>
            )}
          </div>

          {/* Thumbnail strip */}
          {multi && (
            <div className="flex-shrink-0 px-3 py-2" style={{ background: '#0f0906', borderTop: '1px solid rgba(196,144,106,0.15)' }}>
              <div ref={thumbsRef} className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                {media.map((item, i) => <Thumb key={i} item={item} i={i} />)}
                <div className="flex-shrink-0 w-2" />
              </div>
            </div>
          )}

          {/* Info — flex-1 takes remaining height, scrolls internally */}
          <div className="flex-1 overflow-y-auto min-h-0" style={{ background: '#fdf5ec' }}>
            <div className="px-5 pt-5 pb-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-px" style={{ background: 'linear-gradient(90deg,#9B6844,#D4A96A)' }} />
                <span className="text-[10px] tracking-[0.2em] uppercase font-semibold" style={{ color: '#9B6844' }}>Flenix Jewels</span>
              </div>
              <h1 className="text-lg font-semibold leading-snug text-zinc-900">{product.name}</h1>
              <Badges />
              {product.description && (
                <div className="text-sm leading-relaxed text-zinc-600 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.description }} />
              )}
              {/* bottom breathing room so content doesn't hide behind CTA */}
              <div className="h-2" />
            </div>
          </div>

          {/* CTA — always pinned at bottom */}
          <div className="flex-shrink-0 px-4 py-3" style={{ background: '#fdf5ec', borderTop: '1px solid rgba(196,144,106,0.20)' }}>
            <WhatsAppButton product={product} className="w-full h-11 text-sm font-semibold rounded-xl" />
          </div>
        </div>

        {/* ── DESKTOP  (lg+) ────────────────────────────────────────── */}
        <div className="hidden lg:flex h-full overflow-hidden">

          {/* LEFT — dark media panel */}
          <div className="relative flex flex-col overflow-hidden"
            style={{ width: '56%', flexShrink: 0, background: '#0f0906' }}>

            {/* Main media — absolute fills full panel */}
            <div className="relative flex-1 overflow-hidden" style={{ minHeight: 0 }}>
              {!loaded && (
                <div className="absolute inset-0 z-10" style={{ background: '#1C0D05' }}>
                  <div className="absolute inset-0 animate-pulse" style={{ background: 'rgba(196,144,106,0.06)' }} />
                </div>
              )}

              <MainMedia />

              {/* Chevrons */}
              {multi && (
                <>
                  <OverlayBtn onClick={() => go(-1)} label="Previous" pos={{ left: 14, top: '50%', transform: 'translateY(-50%)' }}>
                    <ChevronLeft className="h-4 w-4 text-white" strokeWidth={2.5} />
                  </OverlayBtn>
                  <OverlayBtn onClick={() => go(1)} label="Next" pos={{ right: 14, top: '50%', transform: 'translateY(-50%)' }}>
                    <ChevronRight className="h-4 w-4 text-white" strokeWidth={2.5} />
                  </OverlayBtn>
                </>
              )}

              {/* Video controls */}
              {current?.type === 'video' && (
                <div className="absolute bottom-4 left-4 flex gap-2 z-20">
                  <OverlayBtn onClick={togglePlay} label={playing ? 'Pause' : 'Play'} pos={{}}>
                    {playing ? <Pause className="h-4 w-4 text-white" /> : <Play className="h-4 w-4 text-white" fill="white" />}
                  </OverlayBtn>
                  <OverlayBtn onClick={toggleMute} label={muted ? 'Unmute' : 'Mute'} pos={{}}>
                    {muted ? <VolumeX className="h-4 w-4 text-white" /> : <Volume2 className="h-4 w-4 text-white" />}
                  </OverlayBtn>
                </div>
              )}

              {/* Counter */}
              {multi && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-full text-xs font-medium text-white/80"
                  style={{ background: 'rgba(28,13,5,0.55)', backdropFilter: 'blur(6px)' }}>
                  {safeIdx + 1} / {count}
                </div>
              )}
            </div>

            {/* Thumbnail strip — fixed height row */}
            {multi && (
              <div className="flex-shrink-0 px-4 py-3"
                style={{ background: 'rgba(15,9,6,0.95)', borderTop: '1px solid rgba(196,144,106,0.15)' }}>
                <div ref={thumbsRef} className="flex gap-2.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                  {media.map((item, i) => <Thumb key={i} item={item} i={i} />)}
                  <div className="flex-shrink-0 w-1" />
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — info panel */}
          <div className="flex-1 flex flex-col overflow-hidden" style={{ background: '#fdf5ec' }}>
            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
              <div className="px-7 xl:px-9 pt-8 pb-6 space-y-5">
                {/* Eyebrow */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-px" style={{ background: 'linear-gradient(90deg,#9B6844,#D4A96A)' }} />
                  <span className="text-[10px] tracking-[0.22em] uppercase font-semibold" style={{ color: '#9B6844' }}>Flenix Jewels</span>
                </div>

                {/* Product name */}
                <h1 className="text-2xl xl:text-3xl font-bold leading-snug text-zinc-900" style={{ letterSpacing: '-0.01em' }}>
                  {product.name}
                </h1>

                {/* Divider */}
                <div className="h-px w-full" style={{ background: 'linear-gradient(90deg,rgba(196,144,106,0.5),transparent)' }} />

                {/* Badges */}
                <Badges />

                {/* Description */}
                {product.description && (
                  <div className="text-[13.5px] xl:text-sm leading-relaxed text-zinc-600 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: product.description }} />
                )}
              </div>
            </div>

            {/* CTA — always visible at bottom */}
            <div className="flex-shrink-0 px-7 xl:px-9 py-5"
              style={{ borderTop: '1px solid rgba(196,144,106,0.18)', background: '#fdf5ec' }}>
              {/* Guarantee line */}
              <p className="text-[10px] text-center tracking-wider uppercase mb-3" style={{ color: '#9B6844' }}>
                Certified Quality · Secure Packaging · Global Shipping
              </p>
              <WhatsAppButton
                product={product}
                className="w-full h-12 text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-shadow"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
