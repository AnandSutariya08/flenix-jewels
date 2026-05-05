import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import Header from '@/components/Header';
import MiniHeader from '@/components/MiniHeader';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { useAppSelector } from "@/store/hooks";
import { selectGlobalData } from "@/store/contentSlice";
import { ChevronLeft, ChevronRight, X, ZoomIn, Gem } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { useTheme } from 'next-themes';

const GOLD = 'linear-gradient(135deg, #9B6844 0%, #C4906A 55%, #D4A96A 100%)';

/* ── Intersection Observer hook for scroll-reveal ── */
function useReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ── Single masonry card ── */
const MasonryCard = ({
  item, index, onClick,
}: {
  item: { id: string; image: string; description: string; category?: string };
  index: number;
  onClick: () => void;
}) => {
  const { ref, visible } = useReveal(0.08);
  return (
    <div
      ref={ref}
      className="break-inside-avoid mb-3 sm:mb-4 group cursor-pointer relative overflow-hidden rounded-2xl"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(28px) scale(0.97)',
        transition: `opacity 0.65s ease ${Math.min(index * 50, 400)}ms, transform 0.65s ease ${Math.min(index * 50, 400)}ms`,
        boxShadow: '0 4px 24px -6px rgba(0,0,0,0.22)',
      }}
      onClick={onClick}
    >
      {/* Image */}
      <img
        src={item.image}
        alt={item.description || 'Flenix Jewels'}
        className="w-full block object-cover transition-transform duration-700 group-hover:scale-[1.07]"
        loading="lazy"
        decoding="async"
        style={{ borderRadius: 'inherit' }}
      />

      {/* Always-on bottom scrim */}
      <div
        className="absolute inset-x-0 bottom-0 h-20 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(6,3,1,0.82) 0%, transparent 100%)', borderRadius: 'inherit' }}
      />

      {/* Item number */}
      <div className="absolute top-3 left-3.5 z-10">
        <span style={{ fontSize: '9px', fontWeight: 900, letterSpacing: '0.22em', color: 'rgba(196,144,106,0.65)', textShadow: '0 1px 6px rgba(0,0,0,0.9)' }}>
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>

      {/* Category pill */}
      {item.category && (
        <div className="absolute bottom-3 left-3.5 z-10">
          <span style={{ fontSize: '8px', fontWeight: 900, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(196,144,106,0.85)', textShadow: '0 1px 8px rgba(0,0,0,0.95)' }}>
            {item.category}
          </span>
        </div>
      )}

      {/* Hover: deep overlay */}
      <div
        className="absolute inset-0 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(4,2,0,0.90) 0%, rgba(4,2,0,0.35) 50%, rgba(196,144,106,0.04) 100%)', borderRadius: 'inherit' }}
      />

      {/* Hover: gold inset border */}
      <div
        className="absolute inset-0 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none rounded-2xl"
        style={{ boxShadow: 'inset 0 0 0 1.5px rgba(196,144,106,0.55)' }}
      />

      {/* Hover: zoom pill */}
      <div className="absolute top-3 right-3 z-30 opacity-0 group-hover:opacity-100 translate-y-1.5 group-hover:translate-y-0 transition-all duration-300">
        <div
          className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5"
          style={{ background: 'rgba(196,144,106,0.18)', backdropFilter: 'blur(10px)', border: '1px solid rgba(196,144,106,0.45)' }}
        >
          <ZoomIn className="h-3 w-3" style={{ color: '#D4A96A' }} />
          <span style={{ fontSize: '8px', fontWeight: 900, letterSpacing: '0.18em', color: '#D4A96A' }}>VIEW</span>
        </div>
      </div>

      {/* Hover: description */}
      {item.description && (
        <div className="absolute bottom-0 left-0 right-0 z-30 px-4 pb-4 pt-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-350">
          <p className="text-[11px] leading-snug line-clamp-2 mb-2" style={{ color: 'rgba(255,255,255,0.72)' }}>
            {item.description}
          </p>
          <div className="flex items-center gap-2">
            <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, #C4906A, rgba(196,144,106,0.15))' }} />
            <Gem className="h-2.5 w-2.5 flex-shrink-0" style={{ color: '#C4906A' }} />
          </div>
        </div>
      )}
    </div>
  );
};

const Gallery = () => {
  const { categories, galleryItems, promoHeader, contactInfo } = useAppSelector(selectGlobalData);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState('all');
  const [isLoaded, setIsLoaded] = useState(false);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const hasPromo = promoHeader?.enabled && promoHeader?.text;
  const promoHeight = hasPromo ? 40 : 0;
  const paddingTop = promoHeight + 80 + 52 + 12 + 26;

  const whatsappNumber = useMemo(() => contactInfo?.whatsapp || "919967381180", [contactInfo?.whatsapp]);

  useEffect(() => { const t = setTimeout(() => setIsLoaded(true), 80); return () => clearTimeout(t); }, []);

  const filteredItems = useMemo(() => {
    if (filter === 'all') return galleryItems;
    return galleryItems.filter((item: any) => item.category === filter);
  }, [galleryItems, filter]);

  const openLightbox = useCallback((index: number) => setSelectedIndex(index), []);
  const closeLightbox = useCallback(() => setSelectedIndex(null), []);

  const goNext = useCallback(() => {
    setSelectedIndex(prev => prev !== null && prev < filteredItems.length - 1 ? prev + 1 : prev);
  }, [filteredItems.length]);

  const goPrev = useCallback(() => {
    setSelectedIndex(prev => prev !== null && prev > 0 ? prev - 1 : prev);
  }, []);

  /* keyboard nav */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedIndex, goNext, goPrev, closeLightbox]);

  /* scroll lock */
  useEffect(() => {
    if (selectedIndex !== null) {
      const scrollY = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      return () => {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [selectedIndex !== null]);

  /* thumb strip scroll-to-active */
  useEffect(() => {
    if (selectedIndex !== null && thumbsRef.current) {
      const thumb = thumbsRef.current.children[selectedIndex] as HTMLElement;
      thumb?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [selectedIndex]);

  /* touch swipe in lightbox */
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);
  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) { dx < 0 ? goNext() : goPrev(); }
    touchStartX.current = null;
  }, [goNext, goPrev]);

  const handleWhatsApp = useCallback(() => {
    if (selectedIndex === null) return;
    const item = filteredItems[selectedIndex];
    const msg = `Hi! I'm interested in this jewelry from your gallery:\n${item.image}`;
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  }, [selectedIndex, filteredItems, whatsappNumber]);

  const uniqueCategories = useMemo(() => {
    const cats = new Set(galleryItems.map((i: any) => i.category).filter(Boolean));
    return Array.from(cats) as string[];
  }, [galleryItems]);

  /* category counts */
  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = { all: galleryItems.length };
    galleryItems.forEach((i: any) => { if (i.category) map[i.category] = (map[i.category] || 0) + 1; });
    return map;
  }, [galleryItems]);

  const structuredData = {
    '@context': 'https://schema.org', '@type': 'ImageGallery',
    name: 'Flenix Jewels Gallery', url: 'https://www.flenixjewels.com/gallery',
    image: galleryItems.slice(0, 10).map((i: any) => i.image),
  };

  const faqItems = [
    { question: "What is shown in the Flenix Jewels gallery?", answer: "Our gallery showcases premium diamond and gold jewelry, including rings, earrings, necklaces, and bracelets." },
    { question: "Can I request a similar design from the gallery?", answer: "Yes. You can contact us on WhatsApp to request similar or customized designs." },
    { question: "Are gallery items available for international shipping?", answer: "Yes. We ship worldwide with secure packaging for select regions." },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="Jewelry Gallery - Diamond & Gold Collection Photos | Flenix Jewels"
        description="Browse our gallery of exquisite GIA certified diamond jewelry. View stunning engagement rings, gold necklaces, earrings, bracelets."
        keywords="jewelry gallery, diamond jewelry photos, gold jewelry images, engagement ring photos, luxury jewelry collection"
        canonicalUrl="https://www.flenixjewels.com/gallery"
        structuredData={structuredData}
        breadcrumbs={[{ name: "Home", url: "https://www.flenixjewels.com" }, { name: "Gallery", url: "https://www.flenixjewels.com/gallery" }]}
        faqItems={faqItems}
      />

      <Header promoHeader={promoHeader} />
      <MiniHeader categories={categories} promoHeight={promoHeight} />

      <main className="flex-1" style={{ paddingTop: `${paddingTop}px` }}>

        {/* ── Hero ── */}
        <section className="relative overflow-hidden py-20 md:py-28" style={{ background: isDark ? '#0c0703' : '#1a0f06' }}>
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent 5%, #C4906A 35%, #D4A96A 50%, #C4906A 65%, transparent 95%)' }} />
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(196,144,106,0.12) 0%, transparent 70%)' }} />

          <div
            className="relative z-10 max-w-4xl mx-auto px-6 text-center"
            style={{ transition: 'opacity 1s ease, transform 1s ease', opacity: isLoaded ? 1 : 0, transform: isLoaded ? 'translateY(0)' : 'translateY(20px)' }}
          >
            <div className="flex items-center justify-center gap-3 mb-7">
              <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, transparent, #C4906A)' }} />
              <Gem className="h-4 w-4" style={{ color: '#C4906A' }} />
              <p className="text-[10px] tracking-[0.4em] uppercase font-black" style={{ color: '#C4906A' }}>The Collection</p>
              <Gem className="h-4 w-4" style={{ color: '#C4906A' }} />
              <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, #C4906A, transparent)' }} />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.02] text-white mb-5">
              Moments<br />
              <span style={{ background: GOLD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>in Gold</span>
            </h1>
            <p className="text-lg leading-relaxed max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.50)' }}>
              Every piece tells a story of craftsmanship, elegance, and timeless beauty.
            </p>
            {galleryItems.length > 0 && (
              <p className="mt-4 text-[11px] tracking-[0.25em] uppercase font-bold" style={{ color: 'rgba(196,144,106,0.60)' }}>
                {galleryItems.length} Curated Pieces
              </p>
            )}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent 5%, rgba(196,144,106,0.3) 50%, transparent 95%)' }} />
        </section>

        {/* ── Filter strip ── */}
        {uniqueCategories.length > 0 && (
          <div
            className="sticky top-0 z-30"
            style={{ background: isDark ? 'rgba(10,6,3,0.96)' : 'rgba(253,248,242,0.96)', backdropFilter: 'blur(20px)', borderBottom: `1px solid rgba(196,144,106,${isDark ? '0.15' : '0.20'})` }}
          >
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 overflow-x-auto scrollbar-hide">
              {(['all', ...uniqueCategories] as string[]).map(cat => (
                <button
                  key={cat}
                  onClick={() => { setFilter(cat); setSelectedIndex(null); }}
                  className="flex-shrink-0 flex items-center gap-2 text-[10px] sm:text-[11px] font-black tracking-[0.18em] uppercase px-4 py-2 rounded-full transition-all duration-300"
                  style={filter === cat
                    ? { background: GOLD, color: '#fff', boxShadow: '0 4px 18px -4px rgba(155,104,68,0.55)' }
                    : { background: isDark ? 'rgba(196,144,106,0.08)' : 'rgba(196,144,106,0.07)', color: isDark ? 'rgba(196,144,106,0.8)' : '#9B6844', border: '1px solid rgba(196,144,106,0.22)' }
                  }
                >
                  {cat === 'all' ? 'All Pieces' : cat}
                  <span
                    className="text-[9px] rounded-full px-1.5 py-0.5 font-black leading-none"
                    style={{ background: filter === cat ? 'rgba(255,255,255,0.22)' : 'rgba(196,144,106,0.15)', color: filter === cat ? '#fff' : '#C4906A' }}
                  >
                    {categoryCounts[cat] || 0}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Gallery ── */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-32 px-6">
            <Gem className="h-16 w-16 mx-auto mb-6 opacity-20" style={{ color: '#C4906A' }} />
            <h3 className="text-2xl font-bold mb-2">Gallery Coming Soon</h3>
            <p className="text-muted-foreground">We're curating an exceptional collection for you.</p>
          </div>
        ) : (
          <div style={{ background: isDark ? '#0a0603' : '#f2ece5' }}>
            <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent 5%, #9B6844 30%, #D4A96A 50%, #9B6844 70%, transparent 95%)' }} />

            {/* Label row */}
            <div className="flex items-center justify-between px-5 sm:px-8 md:px-12 py-5">
              <div className="flex items-center gap-3">
                <div className="w-5 h-px" style={{ background: '#C4906A' }} />
                <span className="text-[9px] tracking-[0.35em] uppercase font-black" style={{ color: 'rgba(196,144,106,0.6)' }}>The Collection</span>
              </div>
              <span className="text-[9px] tracking-[0.25em] uppercase font-black" style={{ color: 'rgba(196,144,106,0.35)' }}>
                {filteredItems.length} Pieces
              </span>
            </div>

            {/* ── Masonry columns ── */}
            <div
              className="px-3 sm:px-5 md:px-8 lg:px-10 pb-16"
              style={{
                columnCount: 'var(--col-count)' as any,
                columnGap: '12px',
                /* responsive column count via CSS custom property */
              } as React.CSSProperties}
            >
              {/* Inject CSS custom property per breakpoint */}
              <style>{`
                :root { --col-count: 2; }
                @media (min-width: 640px)  { :root { --col-count: 3; } }
                @media (min-width: 1024px) { :root { --col-count: 4; } }
                @media (min-width: 1400px) { :root { --col-count: 5; } }

                @keyframes lightboxFadeIn {
                  from { opacity: 0; transform: scale(0.96); }
                  to   { opacity: 1; transform: scale(1); }
                }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
              `}</style>

              {filteredItems.map((item: any, index: number) => (
                <MasonryCard
                  key={item.id}
                  item={item}
                  index={index}
                  onClick={() => openLightbox(index)}
                />
              ))}
            </div>

            <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent 5%, rgba(196,144,106,0.22) 50%, transparent 95%)' }} />
          </div>
        )}

        {/* ── CTA ── */}
        {filteredItems.length > 0 && (
          <section className="relative overflow-hidden mx-4 md:mx-10 lg:mx-16 mt-14 md:mt-20 mb-24 rounded-3xl" style={{ background: '#0c0703' }}>
            <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(196,144,106,0.18) 0%, transparent 70%)' }} />
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent 10%, rgba(196,144,106,0.5) 40%, rgba(212,169,106,0.7) 50%, rgba(196,144,106,0.5) 60%, transparent 90%)' }} />
            <div className="relative z-10 text-center py-16 md:py-20 px-6">
              <span className="text-[10px] tracking-[0.4em] uppercase font-black block mb-5" style={{ color: '#C4906A' }}>✦ Enquire Now</span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Find Your Perfect Piece</h2>
              <p className="text-base mb-8 max-w-md mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Connect with our experts to explore bespoke designs and custom orders.
              </p>
              <button
                onClick={() => window.open(`https://wa.me/${whatsappNumber}`, '_blank')}
                className="inline-flex items-center gap-3 font-bold text-[13px] tracking-[0.1em] uppercase rounded-full transition-all duration-300 hover:scale-105 active:scale-95"
                style={{ padding: '15px 40px', background: GOLD, color: '#fff', boxShadow: '0 10px 40px -8px rgba(155,104,68,0.65)' }}
              >
                <FaWhatsapp className="h-5 w-5" />
                Connect on WhatsApp
              </button>
            </div>
          </section>
        )}
      </main>

      <Footer />

      {/* ── Cinematic Lightbox ── */}
      {selectedIndex !== null && (
        <div
          ref={lightboxRef}
          className="fixed inset-0 z-[100] flex flex-col"
          style={{ background: 'rgba(4,2,1,0.97)', backdropFilter: 'blur(28px)', overscrollBehavior: 'contain' }}
          onClick={e => { if (e.target === lightboxRef.current) closeLightbox(); }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-5 sm:px-7 py-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(196,144,106,0.12)' }}>
            <div className="flex items-center gap-2.5">
              <Gem className="h-4 w-4" style={{ color: '#C4906A' }} />
              <span className="text-[11px] tracking-[0.3em] uppercase font-black hidden sm:block" style={{ color: '#C4906A' }}>Flenix Jewels</span>
            </div>
            <span className="text-sm font-mono" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {String(selectedIndex + 1).padStart(2, '0')} / {String(filteredItems.length).padStart(2, '0')}
            </span>
            <button
              onClick={closeLightbox}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 hover:bg-white/10"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </button>
          </div>

          {/* Main area */}
          <div className="flex-1 flex overflow-hidden min-h-0">
            {/* Prev arrow — desktop */}
            <button
              onClick={goPrev}
              disabled={selectedIndex === 0}
              className="flex-shrink-0 hidden md:flex items-center justify-center w-16 transition-all duration-200 disabled:opacity-20 hover:bg-white/5 group"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 group-hover:scale-110"
                style={{ background: 'rgba(196,144,106,0.12)', border: '1px solid rgba(196,144,106,0.25)' }}
              >
                <ChevronLeft className="h-5 w-5 group-hover:text-[#C4906A] transition-colors" style={{ color: 'rgba(255,255,255,0.6)' }} />
              </div>
            </button>

            {/* Image + Info */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
              {/* Image */}
              <div className="flex-1 flex items-center justify-center p-4 sm:p-6 min-h-0" style={{ touchAction: 'none' }}>
                <img
                  key={selectedIndex}
                  src={filteredItems[selectedIndex].image}
                  alt={filteredItems[selectedIndex].description || 'Flenix Jewels'}
                  className="max-w-full max-h-full object-contain"
                  style={{
                    animation: 'lightboxFadeIn 0.35s ease',
                    borderRadius: '16px',
                    boxShadow: '0 40px 80px -20px rgba(0,0,0,0.9)',
                  }}
                  loading="eager"
                />
              </div>

              {/* Info panel — desktop */}
              <div
                className="hidden lg:flex lg:w-72 xl:w-84 flex-shrink-0 flex-col justify-center px-8 py-6"
                style={{ borderLeft: '1px solid rgba(196,144,106,0.10)' }}
              >
                <div className="flex items-center gap-2 mb-6">
                  <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, rgba(196,144,106,0.4))' }} />
                  <span className="text-[9px] tracking-[0.3em] uppercase font-black" style={{ color: '#C4906A' }}>Detail</span>
                </div>

                {filteredItems[selectedIndex].description ? (
                  <p className="text-sm leading-relaxed mb-5" style={{ color: 'rgba(255,255,255,0.60)' }}>
                    {filteredItems[selectedIndex].description}
                  </p>
                ) : (
                  <p className="text-sm leading-relaxed mb-5" style={{ color: 'rgba(255,255,255,0.28)' }}>
                    Fine jewelry crafted with exceptional artisanship at Flenix Jewels.
                  </p>
                )}

                {(filteredItems[selectedIndex] as any).category && (
                  <span
                    className="inline-block text-[9px] tracking-[0.22em] uppercase font-black px-3 py-1.5 rounded-full mb-6"
                    style={{ background: 'rgba(196,144,106,0.12)', border: '1px solid rgba(196,144,106,0.25)', color: '#C4906A' }}
                  >
                    {(filteredItems[selectedIndex] as any).category}
                  </span>
                )}

                <button
                  onClick={handleWhatsApp}
                  className="w-full flex items-center justify-center gap-3 font-bold text-sm tracking-wider uppercase rounded-xl transition-all duration-300 hover:scale-[1.03] active:scale-95 py-4"
                  style={{ background: 'linear-gradient(135deg, #128C7E, #25D366)', color: '#fff', boxShadow: '0 8px 24px -6px rgba(37,211,102,0.35)' }}
                >
                  <FaWhatsapp className="h-5 w-5" />
                  Enquire on WhatsApp
                </button>

                <p className="text-center text-[10px] mt-5" style={{ color: 'rgba(255,255,255,0.20)' }}>
                  Use ← → keys or swipe to navigate
                </p>
              </div>
            </div>

            {/* Next arrow — desktop */}
            <button
              onClick={goNext}
              disabled={selectedIndex === filteredItems.length - 1}
              className="flex-shrink-0 hidden md:flex items-center justify-center w-16 transition-all duration-200 disabled:opacity-20 hover:bg-white/5 group"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 group-hover:scale-110"
                style={{ background: 'rgba(196,144,106,0.12)', border: '1px solid rgba(196,144,106,0.25)' }}
              >
                <ChevronRight className="h-5 w-5 group-hover:text-[#C4906A] transition-colors" style={{ color: 'rgba(255,255,255,0.6)' }} />
              </div>
            </button>
          </div>

          {/* Mobile bottom bar */}
          <div
            className="md:hidden flex-shrink-0"
            style={{ borderTop: '1px solid rgba(196,144,106,0.12)' }}
          >
            {/* Mobile info (description + category) */}
            {(filteredItems[selectedIndex].description || (filteredItems[selectedIndex] as any).category) && (
              <div className="px-5 pt-3 pb-2">
                {(filteredItems[selectedIndex] as any).category && (
                  <span
                    className="inline-block text-[8px] tracking-[0.2em] uppercase font-black px-2.5 py-1 rounded-full mb-1.5"
                    style={{ background: 'rgba(196,144,106,0.12)', border: '1px solid rgba(196,144,106,0.25)', color: '#C4906A' }}
                  >
                    {(filteredItems[selectedIndex] as any).category}
                  </span>
                )}
                {filteredItems[selectedIndex].description && (
                  <p className="text-[11px] leading-snug line-clamp-2" style={{ color: 'rgba(255,255,255,0.50)' }}>
                    {filteredItems[selectedIndex].description}
                  </p>
                )}
              </div>
            )}

            {/* Mobile nav row */}
            <div className="flex items-center gap-3 px-5 py-3">
              <button
                onClick={goPrev}
                disabled={selectedIndex === 0}
                className="w-11 h-11 rounded-full flex items-center justify-center disabled:opacity-25 flex-shrink-0"
                style={{ background: 'rgba(196,144,106,0.10)', border: '1px solid rgba(196,144,106,0.25)' }}
              >
                <ChevronLeft className="h-5 w-5" style={{ color: '#C4906A' }} />
              </button>

              <button
                onClick={handleWhatsApp}
                className="flex-1 flex items-center justify-center gap-2 font-bold text-xs tracking-wider uppercase py-3 rounded-full"
                style={{ background: 'linear-gradient(135deg, #128C7E, #25D366)', color: '#fff' }}
              >
                <FaWhatsapp className="h-4 w-4" />
                Enquire
              </button>

              <button
                onClick={goNext}
                disabled={selectedIndex === filteredItems.length - 1}
                className="w-11 h-11 rounded-full flex items-center justify-center disabled:opacity-25 flex-shrink-0"
                style={{ background: 'rgba(196,144,106,0.10)', border: '1px solid rgba(196,144,106,0.25)' }}
              >
                <ChevronRight className="h-5 w-5" style={{ color: '#C4906A' }} />
              </button>
            </div>

            {/* Swipe hint */}
            <p className="text-center text-[9px] pb-3" style={{ color: 'rgba(255,255,255,0.18)' }}>
              Swipe left / right to navigate
            </p>
          </div>

          {/* Thumbnail filmstrip */}
          <div
            className="flex-shrink-0 relative"
            style={{ borderTop: '1px solid rgba(196,144,106,0.12)', background: 'rgba(6,3,1,0.95)' }}
          >
            <div className="absolute left-0 top-0 bottom-0 w-10 z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, rgba(6,3,1,0.95), transparent)' }} />
            <div className="absolute right-0 top-0 bottom-0 w-10 z-10 pointer-events-none" style={{ background: 'linear-gradient(to left, rgba(6,3,1,0.95), transparent)' }} />
            <div
              ref={thumbsRef}
              className="flex gap-2 overflow-x-auto scrollbar-hide px-5 py-3"
              style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
            >
              {filteredItems.map((item: any, idx: number) => {
                const isActive = idx === selectedIndex;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedIndex(idx)}
                    className="flex-shrink-0 relative overflow-hidden"
                    style={{
                      width: isActive ? 84 : 68,
                      height: isActive ? 76 : 60,
                      borderRadius: 10,
                      scrollSnapAlign: 'center',
                      transition: 'width 0.32s ease, height 0.32s ease, opacity 0.32s ease, box-shadow 0.32s ease',
                      opacity: isActive ? 1 : 0.42,
                      boxShadow: isActive ? '0 0 0 2px #C4906A, 0 0 18px -3px rgba(196,144,106,0.65)' : '0 0 0 1px rgba(255,255,255,0.06)',
                    }}
                  >
                    <img
                      src={item.image}
                      alt=""
                      className="w-full h-full object-cover"
                      style={{ filter: isActive ? 'none' : 'grayscale(25%)' }}
                      loading="lazy"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
