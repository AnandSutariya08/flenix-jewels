import { useEffect, useMemo, useState, memo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Banner } from '@/lib/storage';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { preloadMedia } from '@/lib/preload';
import heroFallback from '@/assets/hero-banner-1.jpg';

interface BannerCarouselProps {
  banners?: Banner[];
}

const BannerCarousel = memo(({ banners = [] }: BannerCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedIndexes, setLoadedIndexes] = useState<Set<number>>(new Set());
  const [fallbackImage, setFallbackImage] = useState<string | null>(heroFallback);
  const hasMultiple = banners.length > 1;
  const currentBanner = banners[currentIndex];
  const safeTitle = currentBanner?.title?.trim() || 'Flenix Jewels';
  const safeDesc =
    currentBanner?.description?.trim() ||
    'Certified diamonds. Timeless designs. Crafted with precision.';

  const slideLabel = useMemo(() => {
    if (banners.length <= 1) return null;
    return `${currentIndex + 1} / ${banners.length}`;
  }, [banners.length, currentIndex]);

  const markLoaded = useCallback((index: number) => {
    setLoadedIndexes((prev) => {
      if (prev.has(index)) return prev;
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }, []);

  useEffect(() => {
    setLoadedIndexes(new Set());
  }, [banners.length]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const cached = window.localStorage.getItem('flenix_hero_fallback');
      if (cached) setFallbackImage(cached);
    } catch {
      // ignore storage errors
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const first = banners[0];
    if (!first || first.mediaType === 'video') return;
    try {
      window.localStorage.setItem('flenix_hero_fallback', first.image);
      setFallbackImage(first.image);
    } catch {
      // ignore storage errors
    }
  }, [banners]);

  useEffect(() => {
    if (banners.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 7000);

    return () => clearInterval(interval);
  }, [banners.length]);

  useEffect(() => {
    if (!banners[0] || banners[0].mediaType === 'video') return;
    const img = new Image();
    img.src = banners[0].image;
    img.onload = () => markLoaded(0);
  }, [banners, markLoaded]);

  useEffect(() => {
    if (banners.length === 0) return;
    const nextIndex = (currentIndex + 1) % banners.length;
    const urls = [banners[currentIndex]?.image, banners[nextIndex]?.image].filter(Boolean) as string[];
    preloadMedia(urls);
  }, [banners, currentIndex]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  if (banners.length === 0) {
    return (
      <div className="relative h-[72vh] md:h-[80vh] min-h-[520px] max-h-[880px] bg-gradient-to-br from-primary/20 via-primary/10 to-background flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary),0.1),transparent_50%)]" />
        {fallbackImage ? (
          <img
            src={fallbackImage}
            alt="Hero background"
            className="w-full h-full object-cover"
            loading="eager"
            decoding="async"
          />
        ) : (
          <div className="text-center px-4 sm:px-6 relative z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg text-muted-foreground">Loading...</p>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full px-4 sm:px-6 md:px-10 lg:px-16 max-w-[1400px]">
          <div className="max-w-2xl rounded-3xl border border-border/40 bg-background/70 backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
            <p className="text-[10px] tracking-[0.38em] uppercase font-black text-primary mb-3">✦ Fine Jewelry</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.05]">{safeTitle}</h2>
            <p className="mt-4 text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">{safeDesc}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full px-7">
                <Link to="/categories">Explore Collections</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-7">
                <Link to="/contact">Book Consultation</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const nextIndex = banners.length > 0 ? (currentIndex + 1) % banners.length : 0;
  const prevIndex = banners.length > 0 ? (currentIndex - 1 + banners.length) % banners.length : 0;
  const visibleIndexes = new Set([currentIndex, nextIndex, prevIndex]);

  return (
    <div className="relative h-[72vh] md:h-[80vh] min-h-[520px] max-h-[880px] overflow-hidden w-full bg-muted">
      {fallbackImage && (
        <div
          className={`absolute inset-0 transition-opacity duration-700 ${
            loadedIndexes.has(currentIndex) ? "opacity-0" : "opacity-100"
          }`}
        >
          <img
            src={fallbackImage}
            alt="Hero background"
            className="w-full h-full object-cover"
            loading="eager"
            decoding="async"
          />
        </div>
      )}
      {banners.map((banner, index) => {
        if (!visibleIndexes.has(index)) return null;
        return (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-all duration-1000 ease-out ${
            index === currentIndex ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-110 z-0'
          }`}
        >
          {index === currentIndex && !loadedIndexes.has(index) && !fallbackImage && (
            <div className="absolute inset-0 bg-muted animate-pulse" />
          )}
          {banner.mediaType === 'video' ? (
            <video
              src={banner.image}
              className="w-full h-full object-cover"
              autoPlay={index === currentIndex}
              muted
              loop
              playsInline
              preload="metadata"
              poster={fallbackImage || undefined}
              onLoadedData={() => markLoaded(index)}
            />
          ) : (
            <img
              src={banner.image}
              alt={banner.title}
              className="w-full h-full object-cover transition-opacity duration-500"
              loading={index === currentIndex ? 'eager' : 'lazy'}
              decoding="async"
              fetchpriority={index === currentIndex ? 'high' : 'auto'}
              sizes="100vw"
              onLoad={() => markLoaded(index)}
            />
          )}
          
          {/* Overlay gradients for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(196,144,106,0.25)_0%,transparent_55%)]" />
          
          {/* Content */}
          <div className="absolute inset-0 flex items-end justify-center pb-8 sm:pb-10 md:pb-12">
            <div className="w-full px-4 sm:px-6 md:px-10 lg:px-16 max-w-[1400px]">
              <div
                className={`max-w-2xl rounded-3xl border border-white/12 bg-black/35 backdrop-blur-xl p-6 sm:p-8 shadow-2xl transition-all duration-1000 ease-out ${
                  index === currentIndex ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                }`}
                style={{ transitionDelay: '160ms' }}
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <p className="text-[10px] tracking-[0.38em] uppercase font-black text-white/85">✦ Fine Jewelry</p>
                  {slideLabel && (
                    <span className="text-[10px] tracking-[0.3em] uppercase font-black text-white/65">
                      {slideLabel}
                    </span>
                  )}
                </div>

                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.04] tracking-tight">
                  {banner.title}
                </h2>

                <p className="mt-4 text-sm sm:text-base md:text-lg text-white/85 font-light max-w-xl leading-relaxed">
                  {banner.description}
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Button asChild size="lg" className="rounded-full px-7 bg-white text-primary hover:bg-white/90">
                    <Link to="/categories">Explore Collections</Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="rounded-full px-7 border-white/25 text-white hover:bg-white/10 hover:text-white"
                  >
                    <Link to="/contact">Book Consultation</Link>
                  </Button>
                </div>

                <div className="mt-6 flex flex-wrap gap-2.5 text-[11px] font-semibold tracking-wide text-white/70">
                  <span className="px-3 py-1 rounded-full border border-white/14 bg-white/5">GIA / IGI Certified</span>
                  <span className="px-3 py-1 rounded-full border border-white/14 bg-white/5">Worldwide Shipping</span>
                  <span className="px-3 py-1 rounded-full border border-white/14 bg-white/5">Custom Designs</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        );
      })}

      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={goToPrev}
            aria-label="Previous slide"
            className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 z-20 h-12 w-12 items-center justify-center rounded-full bg-black/35 backdrop-blur border border-white/15 text-white hover:bg-black/45 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={goToNext}
            aria-label="Next slide"
            className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-20 h-12 w-12 items-center justify-center rounded-full bg-black/35 backdrop-blur border border-white/15 text-white hover:bg-black/45 transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3 z-20">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-1 sm:h-1.5 md:h-2 rounded-full transition-all duration-500 ${
                  index === currentIndex 
                    ? 'bg-white w-8 sm:w-10 md:w-12 lg:w-16 shadow-lg' 
                    : 'bg-white/40 w-1 sm:w-1.5 md:w-2 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
});

BannerCarousel.displayName = 'BannerCarousel';

export default BannerCarousel;
