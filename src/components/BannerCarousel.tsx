import { useEffect, useMemo, useRef, useState, memo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Banner } from '@/lib/storage';
import { ChevronLeft, ChevronRight, ArrowRight, Gem } from 'lucide-react';
import { preloadMedia } from '@/lib/preload';
import heroFallback from '@/assets/hero banner1.png';
import { SITE } from '@/lib/seo';

interface BannerCarouselProps {
  banners?: Banner[];
}

const TRUST_ITEMS = ['GIA Certified', 'IGI Graded', 'Worldwide Shipping', 'Lifetime Guarantee', '1K+ Happy Clients', '15+ Countries', 'Ethically Sourced', 'Custom Design'];

const BannerCarousel = memo(({ banners = [] }: BannerCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedIndexes, setLoadedIndexes] = useState<Set<number>>(new Set());
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasAnyLoaded, setHasAnyLoaded] = useState(false);
  const isMountedRef = useRef(true);
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
  }, [banners]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
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

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = window.setInterval(async () => {
      const next = (currentIndex + 1) % banners.length;
      await ensureLoaded(next);
      setCurrentIndex(next);
    }, 7000);
    return () => window.clearInterval(interval);
  }, [banners.length, currentIndex, ensureLoaded]);

  useEffect(() => {
    if (!banners[0] || banners[0].mediaType === 'video') return;
    ensureLoaded(0);
  }, [banners, ensureLoaded]);

  useEffect(() => {
    if (banners.length === 0) return;
    const nextIndex = (currentIndex + 1) % banners.length;
    const urls = [banners[currentIndex]?.image, banners[nextIndex]?.image].filter(Boolean) as string[];
    preloadMedia(urls);
  }, [banners, currentIndex]);

  const navigate = useCallback((newIndex: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    void ensureLoaded(newIndex).finally(() => {
      setCurrentIndex(newIndex);
      setTimeout(() => setIsAnimating(false), 800);
    });
  }, [ensureLoaded, isAnimating]);

  const goToNext = useCallback(() => navigate((currentIndex + 1) % banners.length), [navigate, currentIndex, banners.length]);
  const goToPrev = useCallback(() => navigate((currentIndex - 1 + banners.length) % banners.length), [navigate, currentIndex, banners.length]);

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

  const nextIndex = (currentIndex + 1) % banners.length;
  const prevIndex = (currentIndex - 1 + banners.length) % banners.length;
  const visibleIndexes = new Set([currentIndex, nextIndex, prevIndex]);

  return (
    <div className="relative h-[85svh] md:h-[90svh] min-h-[580px] max-h-[1000px] overflow-hidden w-full bg-[#0c0703]">
      {/* Fallback image while loading */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ease-out ${hasAnyLoaded ? 'opacity-0' : 'opacity-100'}`}>
        <img
          src={heroFallback}
          alt="Hero"
          className="w-full h-full object-cover"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          loading="eager"
          decoding="async"
        />
      </div>

      {/* Slides */}
      {banners.map((banner, index) => {
        if (!visibleIndexes.has(index)) return null;
        const isActive = index === currentIndex;
        return (
          <div key={banner.id} className={`absolute inset-0 transition-all duration-1000 ease-out ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
            {banner.mediaType === 'video' ? (
              <video
                src={banner.image}
                className="w-full h-full object-cover"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                autoPlay={isActive}
                muted
                loop
                playsInline
                preload="metadata"
                poster={heroFallback} onLoadedData={() => markLoaded(index)} />
            ) : (
              <img
                src={banner.image}
                alt={banner.title}
                className={`w-full h-full object-cover object-center transition-transform duration-[8000ms] ease-out ${isActive ? 'scale-110' : 'scale-100'}`}
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
                loading={isActive ? 'eager' : 'lazy'}
                decoding="async"
                fetchPriority={isActive ? 'high' : 'auto'} sizes="100vw" onLoad={() => markLoaded(index)} />
            )}

            {/* Multi-layer overlays for depth */}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, rgba(6,3,1,0.78) 0%, rgba(6,3,1,0.32) 45%, rgba(6,3,1,0.75) 100%)' }} />
            <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 75% 65% at 18% 48%, rgba(196,144,106,0.22) 0%, transparent 58%)' }} />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(4,2,1,0.88) 0%, transparent 45%)' }} />

            {/* Decorative gold accent line */}
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, transparent 5%, rgba(196,144,106,0.7) 30%, rgba(212,169,106,0.9) 50%, rgba(196,144,106,0.7) 70%, transparent 95%)' }} />

            {/* Floating diamond accents */}
            <div className={`absolute top-[15%] right-[8%] transition-all duration-1000 ${isActive ? 'opacity-30 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '400ms' }}>
              <Gem className="h-8 w-8 md:h-12 md:w-12" style={{ color: '#C4906A' }} />
            </div>
            <div className={`absolute top-[35%] right-[18%] transition-all duration-1000 ${isActive ? 'opacity-15 translate-y-0' : 'opacity-0 -translate-y-4'}`} style={{ transitionDelay: '600ms' }}>
              <span className="text-4xl md:text-6xl" style={{ color: '#D4A96A' }}>✦</span>
            </div>

            {/* Content */}
            {isActive && <HeroContent title={banner.title} description={banner.description} isActive={isActive} />}
          </div>
        );
      })}

      {/* Navigation arrows */}
      {hasMultiple && (
        <>
          <button type="button" onClick={goToPrev} aria-label="Previous slide"
            className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 z-30 h-14 w-14 items-center justify-center rounded-full transition-all duration-300 hover:scale-110 group"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(196,144,106,0.35)', backdropFilter: 'blur(12px)' }}>
            <ChevronLeft className="h-6 w-6 text-white group-hover:text-[#C4906A] transition-colors" />
          </button>
          <button type="button" onClick={goToNext} aria-label="Next slide"
            className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 z-30 h-14 w-14 items-center justify-center rounded-full transition-all duration-300 hover:scale-110 group"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(196,144,106,0.35)', backdropFilter: 'blur(12px)' }}>
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
      <TrustTicker />
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

const TrustTicker = () => (
  <div className="absolute bottom-0 left-0 right-0 z-30 overflow-hidden"
    style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(196,144,106,0.22)', height: 44 }}>
    <div className="flex items-center h-full animate-[scroll_30s_linear_infinite] whitespace-nowrap">
      {[...TRUST_ITEMS, ...TRUST_ITEMS, ...TRUST_ITEMS].map((item, i) => (
        <span key={i} className="inline-flex items-center gap-3 px-6">
          <span className="text-[9px] tracking-[0.32em] uppercase font-black" style={{ color: 'rgba(255,255,255,0.75)' }}>{item}</span>
          <span style={{ color: 'rgba(196,144,106,0.55)', fontSize: 8 }}>✦</span>
        </span>
      ))}
    </div>
  </div>
);

BannerCarousel.displayName = 'BannerCarousel';
export default BannerCarousel;
