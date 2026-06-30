import { useEffect, useMemo, useRef, useState, memo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Banner } from '@/lib/storage';
import { ChevronLeft, ChevronRight, ArrowRight, Gem } from 'lucide-react';
import { preloadMedia } from '@/lib/preload';
import heroFallback from '@/assets/hero banner1.png';
import { SITE } from '@/lib/seo';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { OptimizedVideo } from '@/components/ui/optimized-video';

interface BannerCarouselProps {
  banners?: Banner[];
  tickerItems?: string[];
}

const DEFAULT_TICKER = ['GIA Certified', 'IGI Graded', 'Worldwide Shipping', 'Lifetime Guarantee', '1K+ Happy Clients', '15+ Countries', 'Ethically Sourced', 'Custom Design'];

const BannerCarousel = memo(({ banners = [], tickerItems }: BannerCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [leavingIndex, setLeavingIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [animated, setAnimated] = useState(false);
  const [loadedIndexes, setLoadedIndexes] = useState<Set<number>>(new Set());
  const [hasAnyLoaded, setHasAnyLoaded] = useState(false);
  const isMountedRef = useRef(true);
  const slideTimerRef = useRef<number | null>(null);
  const hasMultiple = banners.length > 1;
  const currentBanner = banners[currentIndex];
  const safeTitle = currentBanner?.title?.trim() || 'Flenix Jewels Ltd';
  const safeDesc =
    currentBanner?.description?.trim() ||
    'Certified diamonds. Timeless designs. Crafted with precision.';

  const markLoaded = useCallback((index: number) => {
    setLoadedIndexes((prev) => {
      if (prev.has(index)) return prev;
      const next = new Set(prev);
      next.add(index);
      return next;
    });
    setHasAnyLoaded(true);
  }, []);

  useEffect(() => { setLoadedIndexes(new Set()); }, [banners.length]);
  useEffect(() => {
    setHasAnyLoaded(false);
    setCurrentIndex(0);
    setLeavingIndex(null);
    setAnimated(false);
  }, [banners]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (slideTimerRef.current) clearTimeout(slideTimerRef.current);
    };
  }, []);

  const ensureLoaded = useCallback(async (index: number) => {
    if (loadedIndexes.has(index)) return;
    const banner = banners[index];
    if (!banner) return;
    if (banner.mediaType === 'video') return;
    await new Promise<void>((resolve) => {
      const img = new Image();
      img.src = banner.image;
      img.onload = () => resolve();
      img.onerror = () => resolve();
    });
    if (isMountedRef.current) markLoaded(index);
  }, [banners, loadedIndexes, markLoaded]);

  // Two-phase slide: set up leaving/entering positions, then trigger animation
  const navigate = useCallback((newIndex: number, dir?: 1 | -1) => {
    if (leavingIndex !== null || newIndex === currentIndex) return;
    const d: 1 | -1 = dir ?? (newIndex > currentIndex ? 1 : -1);
    if (slideTimerRef.current) clearTimeout(slideTimerRef.current);
    setDirection(d);
    setLeavingIndex(currentIndex);
    setCurrentIndex(newIndex);
    setAnimated(false); // entering slide starts offscreen
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setAnimated(true); // trigger CSS transition
      });
    });
    slideTimerRef.current = window.setTimeout(() => {
      setLeavingIndex(null);
      setAnimated(false);
    }, 1000);
  }, [leavingIndex, currentIndex]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = window.setInterval(async () => {
      const next = (currentIndex + 1) % banners.length;
      await ensureLoaded(next);
      if (isMountedRef.current) navigate(next, 1);
    }, 5000);
    return () => window.clearInterval(interval);
  }, [banners.length, currentIndex, ensureLoaded, navigate]);

  useEffect(() => {
    if (!banners[0] || banners[0].mediaType === 'video') return;
    ensureLoaded(0);
  }, [banners, ensureLoaded]);

  useEffect(() => {
    if (banners.length === 0) return;
    const nextIndex = (currentIndex + 1) % banners.length;
    const urls = [banners[currentIndex]?.image, banners[nextIndex]?.image].filter(Boolean) as string[];
    preloadMedia(urls, "critical");
  }, [banners, currentIndex]);

  const goToNext = useCallback(() => navigate((currentIndex + 1) % banners.length, 1), [navigate, currentIndex, banners.length]);
  const goToPrev = useCallback(() => navigate((currentIndex - 1 + banners.length) % banners.length, -1), [navigate, currentIndex, banners.length]);

  if (banners.length === 0) {
    return (
      <div className="relative h-[85svh] md:h-[90svh] min-h-[580px] max-h-[1000px] overflow-hidden w-full bg-[#0c0703]">
        <img src={heroFallback} alt="Hero background" className="absolute inset-0 w-full h-full object-cover opacity-60" loading="eager" decoding="async" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, rgba(6,3,1,0.72) 0%, rgba(6,3,1,0.45) 45%, rgba(6,3,1,0.80) 100%)' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 70% at 20% 50%, rgba(196,144,106,0.18) 0%, transparent 60%)' }} />
        <HeroContent title={safeTitle} description={safeDesc} isActive />
        <TrustTicker />
      </div>
    );
  }

  return (
    <div className="relative h-[85svh] md:h-[90svh] min-h-[580px] max-h-[1000px] overflow-hidden w-full bg-[#0c0703]">
      {/* Fallback image while loading */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ease-out ${hasAnyLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} style={{ zIndex: 1 }}>
        <img
          src={heroFallback}
          alt="Hero"
          className="w-full h-full object-cover"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          loading="eager"
          decoding="async"
        />
      </div>

      {/* Slides — directional slide transition */}
      {banners.map((banner, index) => {
        const isCurrent = index === currentIndex;
        const isLeaving = index === leavingIndex;
        if (!isCurrent && !isLeaving) return null;

        // Slide transform logic:
        // Leaving slide: starts at translateX(0), animates out in the opposite direction
        // Entering slide: starts off-screen in direction of travel, animates to translateX(0)
        let transform: string;
        let transition: string;
        let zIndex: number;

        if (isLeaving) {
          // outgoing slide: sits at 0 until animation fires, then slides out
          transform = animated ? `translateX(${direction === 1 ? '-100%' : '100%'})` : 'translateX(0)';
          transition = 'transform 0.9s cubic-bezier(0.65, 0, 0.35, 1)';
          zIndex = 5;
        } else if (leavingIndex !== null) {
          // entering slide during an active transition: start offscreen, slide into view
          transform = animated ? 'translateX(0)' : `translateX(${direction === 1 ? '100%' : '-100%'})`;
          transition = animated ? 'transform 0.9s cubic-bezier(0.65, 0, 0.35, 1)' : 'none';
          zIndex = 10;
        } else {
          // idle current slide (no transition happening) — always fully visible
          transform = 'translateX(0)';
          transition = 'none';
          zIndex = 10;
        }

        return (
          <div
            key={banner.id}
            className="absolute inset-0"
            style={{ transform, transition, zIndex, willChange: leavingIndex !== null ? 'transform' : 'auto' }}
          >
            {banner.mediaType === 'video' ? (
              <OptimizedVideo
                noWrapper
                src={banner.image}
                className="w-full h-full object-cover"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                autoPlay={isCurrent}
                preload={isCurrent ? "auto" : "none"}
                muted
                loop
                playsInline
                poster={heroFallback}
                onLoadedData={() => markLoaded(index)}
              />
            ) : (
              <OptimizedImage
                noWrapper
                src={banner.image}
                alt={banner.title}
                className="w-full h-full object-cover object-center"
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
                loading={isCurrent ? 'eager' : 'lazy'}
                decoding="async"
                fetchPriority={isCurrent ? 'high' : 'auto'}
                sizes="100vw"
                onLoad={() => markLoaded(index)}
              />
            )}

            {/* Multi-layer overlays for depth */}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, rgba(6,3,1,0.78) 0%, rgba(6,3,1,0.32) 45%, rgba(6,3,1,0.75) 100%)' }} />
            <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 75% 65% at 18% 48%, rgba(196,144,106,0.22) 0%, transparent 58%)' }} />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(4,2,1,0.88) 0%, transparent 45%)' }} />

            {/* Decorative gold accent line */}
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, transparent 5%, rgba(196,144,106,0.7) 30%, rgba(212,169,106,0.9) 50%, rgba(196,144,106,0.7) 70%, transparent 95%)' }} />

            {/* Floating diamond accents */}
            <div className="absolute top-[15%] right-[8%] opacity-30">
              <Gem className="h-8 w-8 md:h-12 md:w-12" style={{ color: '#C4906A' }} />
            </div>
            <div className="absolute top-[35%] right-[18%] opacity-15">
              <span className="text-4xl md:text-6xl" style={{ color: '#D4A96A' }}>✦</span>
            </div>

            {/* Content */}
            {(isCurrent || isLeaving) && <HeroContent title={banner.title} description={banner.description} isActive={!isLeaving || !animated} />}
          </div>
        );
      })}

      {/* Navigation arrows */}
      {hasMultiple && (
        <>
          <button type="button" onClick={goToPrev} aria-label="Previous slide"
            className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 z-30 h-14 w-14 items-center justify-center rounded-full transition-all duration-300 hover:scale-110 group"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(196,144,106,0.35)', backdropFilter: 'blur(6px)' }}>
            <ChevronLeft className="h-6 w-6 text-white group-hover:text-[#C4906A] transition-colors" />
          </button>
          <button type="button" onClick={goToNext} aria-label="Next slide"
            className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 z-30 h-14 w-14 items-center justify-center rounded-full transition-all duration-300 hover:scale-110 group"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(196,144,106,0.35)', backdropFilter: 'blur(6px)' }}>
            <ChevronRight className="h-6 w-6 text-white group-hover:text-[#C4906A] transition-colors" />
          </button>

          {/* Slide indicators — stylish vertical bar on right */}
          {/* <div className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2 z-30 hidden md:flex flex-col gap-3">
            {banners.map((_, index) => (
              <button key={index} onClick={() => navigate(index)} aria-label={`Go to slide ${index + 1}`}
                className="rounded-full transition-all duration-500"
                style={{
                  width: 3,
                  height: index === currentIndex ? 40 : 16,
                  background: index === currentIndex
                    ? 'linear-gradient(180deg, #9B6844, #C4906A, #D4A96A)'
                    : 'rgba(255,255,255,0.25)',
                  boxShadow: index === currentIndex ? '0 0 12px rgba(196,144,106,0.6)' : 'none',
                }} />
            ))}
          </div> */}

          {/* Mobile bottom dots */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 z-30 md:hidden">
            {banners.map((_, index) => (
              <button key={index} onClick={() => navigate(index)}
                className="rounded-full transition-all duration-500"
                style={{
                  height: 3,
                  width: index === currentIndex ? 28 : 8,
                  background: index === currentIndex ? 'linear-gradient(90deg, #9B6844, #C4906A)' : 'rgba(255,255,255,0.30)',
                }} />
            ))}
          </div>

          {/* Slide counter */}
          <div className="absolute top-8 right-8 z-30 md:right-24"
            style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.2em', fontWeight: 700 }}>
            {String(currentIndex + 1).padStart(2, '0')} / {String(banners.length).padStart(2, '0')}
          </div>
        </>
      )}

      {/* Trust ticker at very bottom */}
      <TrustTicker items={tickerItems?.length ? tickerItems : DEFAULT_TICKER} />
    </div>
  );
});

const HeroContent = ({ title, description, isActive }: { title: string; description: string; isActive: boolean }) => (
  <div className="absolute inset-0 flex items-center z-20">
    <div className="w-full px-6 sm:px-10 md:px-16 lg:px-24 max-w-[1500px] mx-auto">
      <div className={`max-w-2xl xl:max-w-3xl transition-all duration-1000 ease-out ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`} style={{ transitionDelay: '150ms' }}>

        {/* Eyebrow */}
        <div className="flex items-center gap-3 mb-6 md:mb-8">
          <div className="h-px w-10" style={{ background: 'linear-gradient(90deg, #9B6844, #C4906A)' }} />
          <p className="text-[10px] md:text-[11px] tracking-[0.4em] uppercase font-black" style={{ color: '#C4906A' }}>{`Fine Jewelry · Est. ${SITE.foundingYear}`}</p>
        </div>

        {/* Main headline */}
        <h1 className="font-bold leading-[1.02] tracking-tight mb-6 md:mb-8 text-white"
          style={{ fontSize: 'clamp(2.4rem, 6vw, 5.5rem)' }}>
          {title}
        </h1>

        {/* Gold divider */}
        <div className="flex items-center gap-3 mb-6 md:mb-8">
          <div className="h-[1.5px] w-16 md:w-24 rounded-full" style={{ background: 'linear-gradient(90deg, #9B6844, #C4906A, #D4A96A)' }} />
          <span style={{ color: 'rgba(196,144,106,0.6)', fontSize: 10 }}>✦</span>
        </div>

        {/* Description */}
        <p className="text-base md:text-lg lg:text-xl leading-relaxed mb-8 md:mb-10 max-w-xl" style={{ color: 'rgba(255,255,255,0.72)', fontWeight: 300 }}>
          {description}
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap gap-4">
          <Link to="/categories"
            className="inline-flex items-center gap-2.5 font-bold text-[12px] md:text-[13px] tracking-[0.14em] uppercase rounded-full transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-2xl group"
            style={{
              padding: '14px 36px',
              background: 'linear-gradient(135deg, #9B6844 0%, #C4906A 55%, #D4A96A 100%)',
              color: '#fff',
              boxShadow: '0 8px 40px -8px rgba(155,104,68,0.65)',
            }}>
            Explore Collections
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
          <Link to="/contact"
            className="inline-flex items-center gap-2.5 font-bold text-[12px] md:text-[13px] tracking-[0.14em] uppercase rounded-full transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              padding: '14px 36px',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.22)',
              color: 'rgba(255,255,255,0.90)',
              backdropFilter: 'blur(8px)',
            }}>
            Book Consultation
          </Link>
        </div>

        {/* Trust badges */}
        {/* <div className="flex flex-wrap gap-2.5 mt-8 md:mt-10">
          {['GIA / IGI Certified', 'Free Worldwide Shipping', 'Custom Designs'].map(item => (
            <span key={item}
              className="text-[10px] md:text-[11px] font-semibold tracking-wider px-3.5 py-1.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.65)' }}>
              {item}
            </span>
          ))}
        </div> */}
      </div>
    </div>
  </div>
);

const TrustTicker = ({ items }: { items?: string[] }) => {
  const safeItems = Array.isArray(items) && items.length > 0 ? items : DEFAULT_TICKER;
  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 overflow-hidden"
      style={{ background: 'rgba(0,0,0,0.70)', borderTop: '1px solid rgba(196,144,106,0.22)', height: 44 }}>
      <div className="flex items-center h-full animate-[scroll_15s_linear_infinite] whitespace-nowrap">
        {[...safeItems, ...safeItems, ...safeItems].map((item, i) => (
          <span key={i} className="inline-flex items-center gap-3 px-6">
            <span className="text-[9px] tracking-[0.32em] uppercase font-black" style={{ color: 'rgba(255,255,255,0.75)' }}>{item}</span>
            <span style={{ color: 'rgba(196,144,106,0.55)', fontSize: 8 }}>✦</span>
          </span>
        ))}
      </div>
    </div>
  );
};

BannerCarousel.displayName = 'BannerCarousel';
export default BannerCarousel;
