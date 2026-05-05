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
interface MediaItem {
  url: string;
  type: 'image' | 'video';
}

const ProductDialog = ({ product, open, onOpenChange }: ProductDialogProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [mainLoaded, setMainLoaded] = useState(false);
  const mainVideoRef = useRef<HTMLVideoElement>(null);

  const getMediaType = (url: string): 'image' | 'video' => {
    const videoExtensions = /\.(mp4|webm|ogg|mov|avi|mkv)/i;
    return videoExtensions.test(url) ||
           url.toLowerCase().includes('video') ||
           url.toLowerCase().includes('.mp4') ||
           url.toLowerCase().includes('vid-') ||
           url.toLowerCase().includes('mov') ? 'video' : 'image';
  };

  const posterImage = useMemo(() => {
    const images = (product?.images || []).filter((url) => getMediaType(url) === 'image');
    return images[0] || product?.image || '';
  }, [product]);

  const allMediaUrls = product?.images?.length > 0 ? product.images : product?.image ? [product.image] : [];
  const media: MediaItem[] = allMediaUrls.map(url => ({ url, type: getMediaType(url) }));
  const hasMultiple = media.length > 1;
  const clampedIndex = media.length > 0 ? Math.min(selectedIndex, media.length - 1) : 0;
  const currentMedia = media.length > 0 ? media[clampedIndex] : null;

  // Reset on index/open change
  useEffect(() => {
    setMainLoaded(false);
    setIsPlaying(false);
  }, [selectedIndex, open]);

  useEffect(() => {
    if (!open) return;
    setSelectedIndex(0);
    setIsPlaying(false);
    setIsMuted(true);
  }, [open]);

  useEffect(() => {
    if (!open && mainVideoRef.current) {
      mainVideoRef.current.pause();
      mainVideoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, [open]);

  useEffect(() => {
    if (mainVideoRef.current) {
      mainVideoRef.current.pause();
      mainVideoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, [selectedIndex]);

  // Autoplay video whenever it becomes active
  useEffect(() => {
    if (!open) return;
    if (currentMedia?.type !== 'video') return;
    const video = mainVideoRef.current;
    if (!video) return;
    const id = window.setTimeout(() => {
      video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }, 80);
    return () => window.clearTimeout(id);
  }, [open, currentMedia?.type, currentMedia?.url]);

  const handleVideoCanPlay = useCallback(() => {
    setMainLoaded(true);
    if (!open || !mainVideoRef.current) return;
    mainVideoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  }, [open]);

  if (!product || media.length === 0) return null;

  const next = () => setSelectedIndex((prev) => (prev + 1) % media.length);
  const prev = () => setSelectedIndex((prev) => (prev - 1 + media.length) % media.length);

  const handleVideoPlayPause = () => {
    if (!mainVideoRef.current) return;
    if (isPlaying) { mainVideoRef.current.pause(); }
    else { mainVideoRef.current.play(); }
    setIsPlaying(!isPlaying);
  };

  const handleMuteToggle = () => {
    if (!mainVideoRef.current) return;
    mainVideoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // ── Chevron button — rose-gold styled ────────────────────────────
  const ChevronBtn = ({ direction, onClick }: { direction: 'left' | 'right'; onClick: () => void }) => (
    <button
      onClick={onClick}
      aria-label={direction === 'left' ? 'Previous' : 'Next'}
      className="absolute top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
      style={{
        [direction === 'left' ? 'left' : 'right']: '10px',
        background: 'rgba(196,144,106,0.85)',
        backdropFilter: 'blur(6px)',
        boxShadow: '0 2px 10px rgba(155,104,68,0.35)',
        border: '1px solid rgba(212,169,106,0.5)',
      }}
    >
      {direction === 'left'
        ? <ChevronLeft className="h-4 w-4 text-white" strokeWidth={2.5} />
        : <ChevronRight className="h-4 w-4 text-white" strokeWidth={2.5} />
      }
    </button>
  );

  // ── Video controls row ────────────────────────────────────────────
  const VideoControls = ({ size = 'sm' }: { size?: 'sm' | 'md' }) => (
    <div className={`absolute bottom-3 left-3 flex gap-1.5 z-20 ${size === 'md' ? 'bottom-4 left-4 gap-2' : ''}`}>
      <button
        onClick={handleVideoPlayPause}
        className="flex items-center justify-center rounded-full transition-all hover:scale-110"
        style={{
          width: size === 'md' ? 34 : 30, height: size === 'md' ? 34 : 30,
          background: 'rgba(28,13,5,0.72)', backdropFilter: 'blur(6px)',
          border: '1px solid rgba(196,144,106,0.4)',
        }}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying
          ? <Pause className={`text-white ${size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5'}`} />
          : <Play  className={`text-white ${size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5'}`} fill="white" />
        }
      </button>
      <button
        onClick={handleMuteToggle}
        className="flex items-center justify-center rounded-full transition-all hover:scale-110"
        style={{
          width: size === 'md' ? 34 : 30, height: size === 'md' ? 34 : 30,
          background: 'rgba(28,13,5,0.72)', backdropFilter: 'blur(6px)',
          border: '1px solid rgba(196,144,106,0.4)',
        }}
        aria-label={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted
          ? <VolumeX className={`text-white ${size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5'}`} />
          : <Volume2 className={`text-white ${size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5'}`} />
        }
      </button>
    </div>
  );

  // ── Main media renderer ───────────────────────────────────────────
  const renderMainMedia = () => {
    if (!currentMedia) return null;
    if (currentMedia.type === 'video') {
      return (
        <video
          ref={mainVideoRef}
          className="w-full h-full object-contain"
          loop muted={isMuted} playsInline preload="auto" autoPlay={open}
          src={currentMedia.url}
          poster={posterImage || undefined}
          onLoadedMetadata={() => setMainLoaded(true)}
          onLoadedData={() => setMainLoaded(true)}
          onCanPlay={handleVideoCanPlay}
        >
          Your browser does not support the video tag.
        </video>
      );
    }
    return (
      <img
        src={currentMedia.url}
        alt={product.name}
        className="max-w-full max-h-full object-contain"
        draggable={false}
        loading="eager"
        decoding="async"
        fetchpriority="high"
        onLoad={() => setMainLoaded(true)}
      />
    );
  };

  // ── Thumbnail strip ───────────────────────────────────────────────
  const ThumbnailStrip = ({ gap = 'gap-2', size = 'w-14 h-14', rounded = 'rounded-md' }: { gap?: string; size?: string; rounded?: string }) => (
    <div className={`flex ${gap} overflow-x-auto pb-0.5`} style={{ scrollbarWidth: 'none' }}>
      {media.map((item, i) => (
        <button
          key={i}
          onClick={() => setSelectedIndex(i)}
          className={`relative flex-shrink-0 ${size} ${rounded} overflow-hidden border-2 transition-all duration-200 ${
            selectedIndex === i
              ? 'scale-105 shadow-md'
              : 'opacity-55 hover:opacity-90'
          }`}
          style={{
            borderColor: selectedIndex === i ? '#C4906A' : 'rgba(196,144,106,0.25)',
          }}
        >
          {item.type === 'video' ? (
            <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
              <Play className="h-4 w-4 text-white/80" fill="white" />
            </div>
          ) : (
            <img src={item.url} alt={`${i + 1}`} className="w-full h-full object-cover" loading="lazy" decoding="async" />
          )}
        </button>
      ))}
    </div>
  );

  // ── Badge cards ───────────────────────────────────────────────────
  const BadgeCards = ({ layout = 'row' }: { layout?: 'row' | 'grid' }) => {
    const base = 'flex items-center gap-2 p-2.5 rounded-xl border';
    const style1 = { background: 'rgba(196,144,106,0.08)', borderColor: 'rgba(196,144,106,0.28)' };
    const style2 = { background: 'rgba(212,169,106,0.08)', borderColor: 'rgba(212,169,106,0.28)' };
    const style3 = { background: 'rgba(155,104,68,0.08)', borderColor: 'rgba(155,104,68,0.28)' };
    if (layout === 'grid') {
      return (
        <div className="grid grid-cols-3 gap-2">
          <div className={`${base} flex-col`} style={style1}><Truck className="h-4 w-4 text-[#9B6844]" /><span className="text-[9px] font-semibold text-center leading-tight text-zinc-700 dark:text-zinc-300">Free<br/>Shipping</span></div>
          <div className={`${base} flex-col`} style={style2}><Shield className="h-4 w-4 text-[#C4906A]" /><span className="text-[9px] font-semibold text-center leading-tight text-zinc-700 dark:text-zinc-300">Secure<br/>Payment</span></div>
          <div className={`${base} flex-col`} style={style3}><Zap className="h-4 w-4 text-[#9B6844]" /><span className="text-[9px] font-semibold text-center leading-tight text-zinc-700 dark:text-zinc-300">Fast<br/>Delivery</span></div>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-3 gap-2">
        <div className={`${base}`} style={style1}><Truck className="h-4 w-4 flex-shrink-0 text-[#9B6844]" /><span className="text-[9px] font-semibold text-zinc-700 dark:text-zinc-300">Free Shipping</span></div>
        <div className={`${base}`} style={style2}><Shield className="h-4 w-4 flex-shrink-0 text-[#C4906A]" /><span className="text-[9px] font-semibold text-zinc-700 dark:text-zinc-300">Secure Payment</span></div>
        <div className={`${base}`} style={style3}><Zap className="h-4 w-4 flex-shrink-0 text-[#9B6844]" /><span className="text-[9px] font-semibold text-zinc-700 dark:text-zinc-300">Fast Delivery</span></div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 w-[96vw] max-w-[420px] sm:max-w-[680px] lg:max-w-5xl h-[94vh] sm:h-[82vh] lg:h-[78vh] max-h-[820px] flex flex-col bg-white dark:bg-zinc-950 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl">
        <DialogTitle className="sr-only">{product.name}</DialogTitle>
        <DialogDescription className="sr-only">Product details, gallery, and actions</DialogDescription>

        {/* Close button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-50 h-8 w-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{ background: 'rgba(28,13,5,0.65)', backdropFilter: 'blur(6px)', border: '1px solid rgba(196,144,106,0.35)' }}
          aria-label="Close"
        >
          <X className="h-3.5 w-3.5 text-white" />
        </button>

        {/* ── MOBILE ────────────────────────────────────────────────── */}
        <div className="lg:hidden flex-1 overflow-y-auto">
          {/* Main media — zero padding, edge-to-edge */}
          <div className="relative bg-zinc-100 dark:bg-zinc-900 aspect-square overflow-hidden">
            {!mainLoaded && <div className="absolute inset-0 bg-muted animate-pulse z-0" />}
            <div className="w-full h-full flex items-center justify-center">
              {renderMainMedia()}
            </div>

            {/* Video controls */}
            {currentMedia?.type === 'video' && <VideoControls size="sm" />}

            {/* Chevrons */}
            {hasMultiple && <><ChevronBtn direction="left" onClick={prev} /><ChevronBtn direction="right" onClick={next} /></>}

            {/* Counter */}
            {hasMultiple && (
              <div className="absolute top-3 right-12 px-2.5 py-0.5 rounded-full text-xs font-medium text-white z-10"
                style={{ background: 'rgba(28,13,5,0.60)', backdropFilter: 'blur(4px)' }}>
                {clampedIndex + 1}/{media.length}
              </div>
            )}
          </div>

          {/* Thumbnail strip */}
          {hasMultiple && (
            <div className="px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-800">
              <ThumbnailStrip gap="gap-2" size="w-13 h-13" rounded="rounded-md" />
            </div>
          )}

          {/* Content */}
          <div className="px-5 py-5 pb-32 space-y-5">
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">{product.name}</h1>
            <BadgeCards layout="grid" />
            {product.description && (
              <div className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: product.description }} />
            )}
          </div>
        </div>

        {/* ── DESKTOP ───────────────────────────────────────────────── */}
        <div className="hidden lg:flex flex-1 overflow-hidden min-h-0">
          {/* Left — media panel */}
          <div className="relative bg-zinc-100 dark:bg-zinc-900 w-[54%] flex flex-col shrink-0 border-r border-zinc-200 dark:border-zinc-800">
            {/* Main media — minimal padding */}
            <div className="flex-1 flex items-center justify-center p-2 min-h-0 relative overflow-hidden">
              {!mainLoaded && <div className="absolute inset-0 bg-muted animate-pulse z-0" />}
              {renderMainMedia()}

              {/* Video controls */}
              {currentMedia?.type === 'video' && <VideoControls size="md" />}

              {/* Chevrons */}
              {hasMultiple && <><ChevronBtn direction="left" onClick={prev} /><ChevronBtn direction="right" onClick={next} /></>}

              {/* Counter */}
              {hasMultiple && (
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium text-white z-10"
                  style={{ background: 'rgba(28,13,5,0.60)', backdropFilter: 'blur(4px)' }}>
                  {clampedIndex + 1} / {media.length}
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            {hasMultiple && (
              <div className="bg-white/60 dark:bg-black/20 border-t border-zinc-200 dark:border-zinc-800 px-3 py-2.5">
                <ThumbnailStrip gap="gap-2.5" size="w-16 h-16" rounded="rounded-lg" />
              </div>
            )}
          </div>

          {/* Right — info panel */}
          <div className="flex-1 overflow-y-auto bg-white dark:bg-zinc-950">
            <div className="p-6 xl:p-8 space-y-5">
              <h1 className="text-xl xl:text-2xl font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                {product.name}
              </h1>
              <div className="h-px" style={{ background: 'linear-gradient(90deg, rgba(196,144,106,0.5), transparent)' }} />
              <BadgeCards />
              {product.description && (
                <div className="leading-relaxed text-zinc-600 dark:text-zinc-400 prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: product.description }} />
              )}
              <div className="pt-3">
                <WhatsAppButton
                  product={product}
                  className="w-full h-12 text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile sticky CTA */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-200 dark:border-zinc-800 shadow-2xl">
          <WhatsAppButton product={product} className="w-full h-12 text-sm font-semibold rounded-xl shadow-lg" />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDialog;
