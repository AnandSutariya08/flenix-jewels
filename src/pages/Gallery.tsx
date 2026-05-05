import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import Header from '@/components/Header';
import MiniHeader from '@/components/MiniHeader';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { useAppSelector } from "@/store/hooks";
import { selectGlobalData } from "@/store/contentSlice";
import { ChevronLeft, ChevronRight, X, ZoomIn, MessageCircle, Gem } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { useTheme } from 'next-themes';

const GOLD = 'linear-gradient(135deg, #9B6844 0%, #C4906A 55%, #D4A96A 100%)';

const Gallery = () => {
  const { categories, galleryItems, promoHeader, contactInfo } = useAppSelector(selectGlobalData);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState('all');
  const [isLoaded, setIsLoaded] = useState(false);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const hasPromo = promoHeader?.enabled && promoHeader?.text;
  const promoHeight = hasPromo ? 40 : 0;
  const paddingTop = promoHeight + 80 + 52 + 12 + 26;

  const whatsappNumber = useMemo(() => contactInfo?.whatsapp || "919967381180", [contactInfo?.whatsapp]);

  useEffect(() => { const t = setTimeout(() => setIsLoaded(true), 80); return () => clearTimeout(t); }, []);

  const filteredItems = useMemo(() => {
    if (filter === 'all') return galleryItems;
    return galleryItems.filter(item => item.category === filter);
  }, [galleryItems, filter]);

  const openLightbox = useCallback((index: number) => setSelectedIndex(index), []);
  const closeLightbox = useCallback(() => setSelectedIndex(null), []);

  const goNext = useCallback(() => {
    setSelectedIndex(prev => prev !== null && prev < filteredItems.length - 1 ? prev + 1 : prev);
  }, [filteredItems.length]);

  const goPrev = useCallback(() => {
    setSelectedIndex(prev => prev !== null && prev > 0 ? prev - 1 : prev);
  }, []);

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

  // Lock body scroll when lightbox is open (fixes iOS Safari scroll bleed)
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

  useEffect(() => {
    if (selectedIndex !== null && thumbsRef.current) {
      const thumb = thumbsRef.current.children[selectedIndex] as HTMLElement;
      thumb?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [selectedIndex, thumbsRef]);

  const handleWhatsApp = useCallback(() => {
    if (selectedIndex === null) return;
    const item = filteredItems[selectedIndex];
    const msg = `Hi! I'm interested in this jewelry from your gallery:\n${item.image}`;
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  }, [selectedIndex, filteredItems, whatsappNumber]);

  const uniqueCategories = useMemo(() => {
    const cats = new Set(galleryItems.map(i => i.category).filter(Boolean));
    return Array.from(cats);
  }, [galleryItems]);

  const structuredData = {
    '@context': 'https://schema.org', '@type': 'ImageGallery',
    name: 'Flenix Jewels Gallery', url: 'https://www.flenixjewels.com/gallery',
    image: galleryItems.slice(0, 10).map(i => i.image),
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

          <div className={`relative z-10 max-w-4xl mx-auto px-6 text-center transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
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

        {/* ── Filter tabs ── */}
        {uniqueCategories.length > 0 && (
          <div className={`sticky top-0 z-30 transition-all duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            style={{ background: isDark ? 'rgba(12,7,3,0.95)' : 'rgba(253,248,242,0.95)', backdropFilter: 'blur(16px)', borderBottom: `1px solid rgba(196,144,106,${isDark ? '0.15' : '0.20'})` }}>
            <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center gap-2 overflow-x-auto scrollbar-hide">
              {['all', ...uniqueCategories].map(cat => (
                <button
                  key={cat}
                  onClick={() => { setFilter(cat); setSelectedIndex(null); }}
                  className="flex-shrink-0 text-[11px] font-bold tracking-[0.18em] uppercase px-5 py-2 rounded-full transition-all duration-300"
                  style={filter === cat
                    ? { background: GOLD, color: '#fff', boxShadow: '0 4px 16px -4px rgba(155,104,68,0.5)' }
                    : { background: isDark ? 'rgba(196,144,106,0.08)' : 'rgba(196,144,106,0.08)', color: isDark ? 'rgba(196,144,106,0.8)' : '#9B6844', border: '1px solid rgba(196,144,106,0.25)' }
                  }
                >
                  {cat === 'all' ? 'All Pieces' : cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Grid ── */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-32 px-6">
            <Gem className="h-16 w-16 mx-auto mb-6 opacity-20" style={{ color: '#C4906A' }} />
            <h3 className="text-2xl font-bold mb-2">Gallery Coming Soon</h3>
            <p className="text-muted-foreground">We're curating an exceptional collection for you.</p>
          </div>
        ) : (
          <div className="relative" style={{ background: isDark ? '#0a0603' : '#f5f0eb' }}>
            {/* Top rule */}
            <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent 5%, #9B6844 30%, #D4A96A 50%, #9B6844 70%, transparent 95%)' }} />

            {/* Section label */}
            <div className="flex items-center justify-between px-6 md:px-10 py-6">
              <div className="flex items-center gap-3">
                <div className="w-5 h-px" style={{ background: '#C4906A' }} />
                <span className="text-[9px] tracking-[0.35em] uppercase font-black" style={{ color: 'rgba(196,144,106,0.6)' }}>The Collection</span>
              </div>
              <span className="text-[9px] tracking-[0.25em] uppercase font-black" style={{ color: 'rgba(196,144,106,0.35)' }}>
                {filteredItems.length} Pieces
              </span>
            </div>

            {/* Mosaic grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 px-4 md:px-8 pb-14" style={{ gap: '14px' }}>
              {filteredItems.map((item, index) => {
                // Intentional editorial sizing pattern
                const mod = index % 9;
                const isFeature = mod === 0;          // wide 2-col card
                const isTall    = mod === 3 || mod === 7; // taller aspect

                return (
                  <div
                    key={item.id}
                    className={`group cursor-pointer relative overflow-hidden transition-all duration-700 rounded-2xl
                      ${isFeature ? 'col-span-2' : ''}
                      ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
                    `}
                    style={{
                      aspectRatio: isFeature ? '16/8' : isTall ? '3/4' : '4/5',
                      transitionDelay: `${Math.min(index * 40, 500)}ms`,
                    }}
                    onClick={() => openLightbox(index)}
                  >
                    {/* Image */}
                    <img
                      src={item.image}
                      alt={item.description || 'Flenix Jewels'}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy" decoding="async"
                    />

                    {/* Always-on: editorial number top-left */}
                    <div className="absolute top-3 left-3.5 z-10">
                      <span style={{ fontSize: '9px', fontWeight: 900, letterSpacing: '0.2em', color: 'rgba(196,144,106,0.55)', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>

                    {/* Always-on: base scrim + category tag at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 h-14 z-10" style={{ background: 'linear-gradient(to top, rgba(6,3,1,0.75) 0%, transparent 100%)' }} />
                    {item.category && (
                      <div className="absolute bottom-2.5 left-3 z-10">
                        <span style={{ fontSize: '8px', fontWeight: 900, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(196,144,106,0.75)', textShadow: '0 1px 6px rgba(0,0,0,0.9)' }}>
                          {item.category}
                        </span>
                      </div>
                    )}

                    {/* Hover: deep overlay */}
                    <div className="absolute inset-0 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
                      style={{ background: 'linear-gradient(to top, rgba(4,2,0,0.92) 0%, rgba(4,2,0,0.45) 45%, rgba(196,144,106,0.06) 100%)' }} />

                    {/* Hover: gold border frame */}
                    <div className="absolute inset-0 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
                      style={{ boxShadow: 'inset 0 0 0 1.5px rgba(196,144,106,0.55)' }} />

                    {/* Hover: top-right zoom pill */}
                    <div className="absolute top-3 right-3 z-30 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1.5 group-hover:translate-y-0">
                      <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5"
                        style={{ background: 'rgba(196,144,106,0.18)', backdropFilter: 'blur(10px)', border: '1px solid rgba(196,144,106,0.40)' }}>
                        <ZoomIn className="h-3 w-3" style={{ color: '#D4A96A' }} />
                        <span style={{ fontSize: '8px', fontWeight: 900, letterSpacing: '0.18em', color: '#D4A96A' }}>VIEW</span>
                      </div>
                    </div>

                    {/* Hover: description + gold rule at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 z-30 p-4 opacity-0 group-hover:opacity-100 transition-all duration-350 translate-y-2 group-hover:translate-y-0">
                      {item.description && (
                        <p className="text-[11px] leading-relaxed mb-2.5 line-clamp-2" style={{ color: 'rgba(255,255,255,0.75)' }}>
                          {item.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2">
                        <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, #C4906A, rgba(196,144,106,0.2))' }} />
                        <Gem className="h-2.5 w-2.5" style={{ color: '#C4906A' }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom rule */}
            <div className="h-px mt-1" style={{ background: 'linear-gradient(90deg, transparent 5%, rgba(196,144,106,0.25) 50%, transparent 95%)' }} />
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
          style={{ background: 'rgba(4,2,1,0.97)', backdropFilter: 'blur(24px)', overscrollBehavior: 'contain' }}
          onClick={e => { if (e.target === lightboxRef.current) closeLightbox(); }}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
            style={{ borderBottom: '1px solid rgba(196,144,106,0.12)' }}>
            <div className="flex items-center gap-3">
              <Gem className="h-5 w-5" style={{ color: '#C4906A' }} />
              <span className="text-[11px] tracking-[0.3em] uppercase font-black" style={{ color: '#C4906A' }}>Flenix Jewels</span>
            </div>
            <span className="text-sm font-mono" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {String(selectedIndex + 1).padStart(2, '0')} / {String(filteredItems.length).padStart(2, '0')}
            </span>
            <button onClick={closeLightbox}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <X className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* Main area */}
          <div className="flex-1 flex overflow-hidden min-h-0">
            {/* Prev arrow */}
            <button
              onClick={goPrev}
              disabled={selectedIndex === 0}
              className="flex-shrink-0 hidden md:flex items-center justify-center w-16 transition-all duration-200 disabled:opacity-20 hover:bg-white/5 group"
            >
              <ChevronLeft className="h-7 w-7 group-hover:text-[#C4906A] transition-colors" style={{ color: 'rgba(255,255,255,0.5)' }} />
            </button>

            {/* Image + Info */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden gap-0">
              {/* Image */}
              <div className="flex-1 flex items-center justify-center p-6 min-h-0" style={{ touchAction: 'none' }}>
                <img
                  key={selectedIndex}
                  src={filteredItems[selectedIndex].image}
                  alt={filteredItems[selectedIndex].description || 'Flenix Jewels'}
                  className="max-w-full max-h-full object-contain rounded-xl"
                  style={{ animation: 'lightboxFadeIn 0.35s ease', boxShadow: '0 40px 80px -20px rgba(0,0,0,0.9)' }}
                  loading="eager"
                />
              </div>

              {/* Info panel — desktop only */}
              <div className="hidden lg:flex lg:w-72 xl:w-80 flex-shrink-0 flex-col justify-center px-8 py-0"
                style={{ borderLeft: '1px solid rgba(196,144,106,0.10)' }}>
                <div className="mb-1">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, rgba(196,144,106,0.5))' }} />
                    <span className="text-[9px] tracking-[0.3em] uppercase font-black" style={{ color: '#C4906A' }}>Detail</span>
                  </div>
                  {filteredItems[selectedIndex].description ? (
                    <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.60)' }}>
                      {filteredItems[selectedIndex].description}
                    </p>
                  ) : (
                    <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.30)' }}>
                      Fine jewelry crafted with exceptional artisanship at Flenix Jewels.
                    </p>
                  )}
                  {filteredItems[selectedIndex].category && (
                    <span className="inline-block text-[9px] tracking-[0.22em] uppercase font-black px-3 py-1.5 rounded-full mb-6"
                      style={{ background: 'rgba(196,144,106,0.12)', border: '1px solid rgba(196,144,106,0.25)', color: '#C4906A' }}>
                      {filteredItems[selectedIndex].category}
                    </span>
                  )}
                </div>

                <button onClick={handleWhatsApp}
                  className="hidden lg:flex w-full items-center justify-center gap-3 font-bold text-sm tracking-wider uppercase rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 py-4"
                  style={{ background: 'linear-gradient(135deg, #128C7E, #25D366)', color: '#fff', boxShadow: '0 8px 24px -6px rgba(37,211,102,0.35)' }}>
                  <FaWhatsapp className="h-5 w-5" />
                  Enquire on WhatsApp
                </button>

                <p className="text-center text-[10px] mt-4 hidden lg:block" style={{ color: 'rgba(255,255,255,0.22)' }}>
                  Use ← → keys to navigate
                </p>
              </div>
            </div>

            {/* Next arrow */}
            <button
              onClick={goNext}
              disabled={selectedIndex === filteredItems.length - 1}
              className="flex-shrink-0 hidden md:flex items-center justify-center w-16 transition-all duration-200 disabled:opacity-20 hover:bg-white/5 group"
            >
              <ChevronRight className="h-7 w-7 group-hover:text-[#C4906A] transition-colors" style={{ color: 'rgba(255,255,255,0.5)' }} />
            </button>
          </div>

          {/* Mobile nav */}
          <div className="md:hidden flex items-center justify-between px-6 py-4 flex-shrink-0"
            style={{ borderTop: '1px solid rgba(196,144,106,0.12)' }}>
            <button onClick={goPrev} disabled={selectedIndex === 0}
              className="w-11 h-11 rounded-full flex items-center justify-center disabled:opacity-25 transition-all"
              style={{ background: 'rgba(196,144,106,0.10)', border: '1px solid rgba(196,144,106,0.25)' }}>
              <ChevronLeft className="h-5 w-5" style={{ color: '#C4906A' }} />
            </button>
            <button onClick={handleWhatsApp}
              className="flex items-center gap-2 font-bold text-xs tracking-wider uppercase px-5 py-3 rounded-full"
              style={{ background: 'linear-gradient(135deg, #128C7E, #25D366)', color: '#fff' }}>
              <FaWhatsapp className="h-4 w-4" />
              Enquire
            </button>
            <button onClick={goNext} disabled={selectedIndex === filteredItems.length - 1}
              className="w-11 h-11 rounded-full flex items-center justify-center disabled:opacity-25 transition-all"
              style={{ background: 'rgba(196,144,106,0.10)', border: '1px solid rgba(196,144,106,0.25)' }}>
              <ChevronRight className="h-5 w-5" style={{ color: '#C4906A' }} />
            </button>
          </div>

          {/* Thumbnail filmstrip */}
          <div className="flex-shrink-0 relative" style={{ borderTop: '1px solid rgba(196,144,106,0.15)', background: 'rgba(6,3,1,0.95)' }}>
            {/* Left fade edge */}
            <div className="absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
              style={{ background: 'linear-gradient(to right, rgba(6,3,1,0.95), transparent)' }} />
            {/* Right fade edge */}
            <div className="absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
              style={{ background: 'linear-gradient(to left, rgba(6,3,1,0.95), transparent)' }} />

            <div
              ref={thumbsRef}
              className="flex gap-2.5 overflow-x-auto scrollbar-hide px-6 py-3"
              style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
            >
              {filteredItems.map((item, idx) => {
                const isActive = idx === selectedIndex;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedIndex(idx)}
                    className="flex-shrink-0 relative group transition-all duration-350"
                    style={{
                      width: isActive ? 88 : 72,
                      height: isActive ? 80 : 64,
                      scrollSnapAlign: 'center',
                      borderRadius: 10,
                      overflow: 'hidden',
                      transition: 'width 0.35s ease, height 0.35s ease, box-shadow 0.35s ease, opacity 0.35s ease',
                      opacity: isActive ? 1 : 0.45,
                      boxShadow: isActive
                        ? '0 0 0 2px #C4906A, 0 0 18px -3px rgba(196,144,106,0.65)'
                        : '0 0 0 1px rgba(255,255,255,0.06)',
                    }}
                  >
                    <img
                      src={item.image}
                      alt=""
                      className="w-full h-full object-cover"
                      style={{
                        transition: 'transform 0.35s ease',
                        transform: isActive ? 'scale(1.05)' : 'scale(1)',
                        filter: isActive ? 'none' : 'grayscale(20%)',
                      }}
                      loading="lazy"
                    />
                    {/* Active gold overlay shimmer */}
                    {isActive && (
                      <div className="absolute inset-0 pointer-events-none"
                        style={{ background: 'linear-gradient(135deg, rgba(196,144,106,0.18) 0%, transparent 60%)' }} />
                    )}
                    {/* Active indicator dot at bottom */}
                    {isActive && (
                      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
                        style={{ background: 'linear-gradient(90deg, #9B6844, #D4A96A)' }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes lightboxFadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default Gallery;
