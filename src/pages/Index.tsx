import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from 'next-themes';
import Header from '@/components/Header';
import MiniHeader from '@/components/MiniHeader';
import Footer from '@/components/Footer';
import BannerCarousel from '@/components/BannerCarousel';
import SEOHead from '@/components/SEOHead';
import ServicesSection from '@/components/ServicesSection';
import BlogDialog from '@/components/BlogDialog';
import InstagramJourneyCarousel from '@/components/InstagramJourneyCarousel';
import EmptyState from '@/components/EmptyState';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loadBlogs, loadDeferredData, selectBlogsLoaded, selectBlogsStatus, selectGlobalData, selectDeferredStatus, selectDeferredLoaded } from '@/store/contentSlice';
import { useHeaderOffset } from '@/hooks/useHeaderOffset';
import { Truck, ShieldCheck, Award, Star, MessageCircle, ArrowRight, CheckCircle, ChevronLeft, ChevronRight, BookOpen, Gem } from 'lucide-react';
import { BlogPost } from '@/lib/storage';
import { SITE, YEARS_OF_EXCELLENCE_LABEL } from '@/lib/seo';

const WHATSAPP = 'https://wa.me/85251254000?text=Hi!%20I%20am%20interested%20in%20your%20jewelry%20collection.';
const GOLD = 'linear-gradient(135deg, #9B6844 0%, #C4906A 55%, #D4A96A 100%)';

const faqItems = [
  { question: 'Do you offer both natural and lab-grown diamonds?', answer: 'Yes. Flenix Jewels Ltd offers certified lab-grown diamonds and natural diamonds with authenticated grading and quality checks.' },
  { question: 'Can I customize an engagement ring or jewelry design?', answer: 'Yes. We provide custom design and manufacturing for engagement rings, wedding bands, and fine jewelry.' },
  { question: 'Do you ship internationally?', answer: 'Yes. We ship globally with secure packaging and insured delivery options for select regions.' },
];

const trustItems = ['GIA Certified', 'IGI Graded', 'Free Shipping', 'Lifetime Guarantee', '1K+ Happy Clients', '15+ Countries Served', 'Ethically Sourced', 'Custom Design'];

const features = [
  { icon: Truck, label: 'Worldwide Shipping', sub: '15+ Countries', detail: 'Fully insured express delivery to your door.' },
  { icon: MessageCircle, label: 'WhatsApp Support', sub: '24/7 Support', detail: 'Get quick help for orders, custom designs, and diamond inquiries.' },
  { icon: ShieldCheck, label: 'Secure Payments', sub: '100% Encrypted', detail: 'Bank-level security on every transaction.' },
  { icon: Award, label: 'Certified Authentic', sub: 'GIA / IGI', detail: 'Lifetime guarantee on all certified pieces.' },
];

export default function Index() {
  const { banners, categories, featuredCollection, galleryItems, blogs, instagramPosts, testimonials, promoHeader, contactInfo, tickerItems } = useAppSelector(selectGlobalData);
  const dispatch = useAppDispatch();

  const homeGalleryItems = useMemo(() =>
    galleryItems
      .filter((i) => i.sequence != null && i.sequence >= 1 && i.sequence <= 5)
      .sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0)),
    [galleryItems]
  );
  const blogsLoaded = useAppSelector(selectBlogsLoaded);
  const blogsStatus = useAppSelector(selectBlogsStatus);
  const deferredStatus = useAppSelector(selectDeferredStatus);
  const deferredLoaded = useAppSelector(selectDeferredLoaded);
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [isBlogDialogOpen, setIsBlogDialogOpen] = useState(false);

  // Force-fetch deferred data when home page detects gallery is empty.
  // Using useState (not useRef) so the FIRST render can read galleryFetched = false
  // and show skeleton instead of "Coming Soon" — useRef doesn't affect rendering so
  // with a ref the condition would flash "Coming Soon" for one frame before the effect fires.
  const [galleryFetched, setGalleryFetched] = useState(false);
  useEffect(() => {
    if (galleryItems.length > 0) return;
    if (deferredStatus === 'loading') return;
    if (galleryFetched) return;
    setGalleryFetched(true);
    dispatch(loadDeferredData({ force: true }));
  }, [deferredLoaded, deferredStatus, dispatch, galleryItems.length, galleryFetched]);

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  /* Featured Collection scroll state */
  const featuredScrollRef = useRef<HTMLDivElement>(null);
  const [featuredIdx, setFeaturedIdx] = useState(0);

  const scrollFeatured = useCallback((dir: 'prev' | 'next') => {
    const el = featuredScrollRef.current;
    if (!el) return;
    const cardW = el.firstElementChild ? (el.firstElementChild as HTMLElement).offsetWidth : 280;
    el.scrollBy({ left: dir === 'next' ? cardW : -cardW, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const el = featuredScrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const cardW = el.firstElementChild ? (el.firstElementChild as HTMLElement).offsetWidth : 280;
      const idx = Math.round(el.scrollLeft / cardW);
      setFeaturedIdx(Math.min(idx, featuredCollection.length - 1));
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [featuredCollection.length]);

  const sortedBlogs = useMemo(() => [...blogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [blogs]);

  useEffect(() => {
    if (!blogsLoaded && blogsStatus === 'idle') {
      const t = window.setTimeout(() => dispatch(loadBlogs()), 1800);
      return () => window.clearTimeout(t);
    }
  }, [blogsLoaded, blogsStatus, dispatch]);

  const paddingTop = useHeaderOffset();

  const openBlog = (blog: BlogPost) => { setSelectedBlog(blog); setIsBlogDialogOpen(true); };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="Fine Jewellery | Natural & Lab Grown Diamonds | Flenix Jewels Ltd"
        description="Shop certified natural and lab-grown diamond jewelry at Flenix Jewels Ltd. Explore GIA certified engagement rings, wedding bands, necklaces, earrings & bracelets. worldwide shipping."
        keywords="diamond jewelry, gold rings, engagement rings, wedding bands, lab grown diamonds, natural diamonds, certified jewelry, luxury jewelry store"
        canonicalUrl="https://www.flenixjewels.com"
        faqItems={faqItems}
      />

      <Header promoHeader={promoHeader} />
      {/* <MiniHeader categories={categories} promoHeight={promoHeight} /> */}

      <main className="flex-1" style={{ paddingTop: `${paddingTop}px` }}>

        {/* ═══════════════════════════════════════════════════════
            1. HERO — full-bleed carousel
        ═══════════════════════════════════════════════════════ */}
        <section className="w-full">
          <BannerCarousel banners={banners} tickerItems={tickerItems} />
        </section>


        {/* ═══════════════════════════════════════════════════════
            3. COLLECTIONS — asymmetric editorial grid
        ═══════════════════════════════════════════════════════ */}
        <section className="py-20 md:py-28 px-4 md:px-10 lg:px-16 max-w-[1600px] mx-auto">
          {/* Section header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <div>
              <p className="text-[10px] tracking-[0.32em] uppercase font-black mb-3 text-primary">✦ Collections</p>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.08] tracking-tight">
                Crafted for<br />Every Occasion
              </h2>
            </div>
            <div className="lg:pb-2 max-w-sm">
              <p className="text-muted-foreground leading-relaxed mb-5">
                Each piece is a testament to exceptional artisanship and timeless elegance, designed to be cherished forever.
              </p>
              <Link to="/categories" className="inline-flex items-center gap-2 text-sm font-bold tracking-widest uppercase transition-all group text-primary">
                View All Collections
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1.5" />
              </Link>
            </div>
          </div>

          {categories.length === 0 ? (
            <EmptyState
              icon={<Gem className="h-7 w-7" />}
              title="Collections Coming Soon"
              description="We’re curating a refined set of collections. Please check back shortly."
              className="py-10"
            />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4" style={{ gridAutoRows: '220px' }}>
              {/* Hero card — spans 2×2 */}
              {categories[0] && (
                <Link to={`/category/${categories[0].id}`}
                  className="relative col-span-2 row-span-2 overflow-hidden rounded-3xl group block"
                  style={{ gridRow: 'span 2' }}>
                  <OptimizedImage noWrapper src={categories[0].image} alt={categories[0].name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 transition-opacity duration-500"
                    style={{ background: 'linear-gradient(to top, rgba(6,3,1,0.88) 0%, rgba(6,3,1,0.28) 45%, transparent 100%)' }} />
                  {/* Hover gold overlay */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: 'linear-gradient(135deg, rgba(155,104,68,0.12), transparent)' }} />
                  <div className="absolute bottom-0 left-0 p-7 md:p-9">
                    <p className="text-[9px] tracking-[0.3em] uppercase font-black mb-2.5 text-gold">Featured</p>
                    <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 leading-tight">{categories[0].name}</h3>
                    <p className="text-white/55 text-sm mb-6 max-w-[240px] leading-relaxed hidden md:block">{categories[0].description}</p>
                    <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase px-5 py-2.5 rounded-full transition-all duration-200 group-hover:shadow-xl"
                      style={{ background: GOLD, color: '#fff', boxShadow: '0 4px 20px -4px rgba(155,104,68,0.5)' }}>
                      Explore <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              )}

              {/* Small cards */}
              {categories.slice(1, 5).map((cat, i) => (
                <Link key={cat.id} to={`/category/${cat.id}`}
                  className="relative overflow-hidden group block"
                  style={{ borderRadius: i === 0 || i === 2 ? '20px 20px 20px 20px' : '20px' }}>
                  <OptimizedImage noWrapper src={cat.image} alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 transition-opacity duration-300"
                    style={{ background: 'linear-gradient(to top, rgba(6,3,1,0.78) 0%, transparent 60%)' }} />
                  {/* Gold border on hover */}
                  <div className="absolute inset-0 rounded-[20px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{ boxShadow: 'inset 0 0 0 2px rgba(196,144,106,0.65)' }} />
                  <div className="absolute bottom-0 left-0 p-5">
                    <h3 className="text-base md:text-lg font-bold text-white leading-tight">{cat.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ═══════════════════════════════════════════════════════
            4. FEATURED COLLECTION — editorial lookbook
        ═══════════════════════════════════════════════════════ */}
        {featuredCollection.length > 0 && (
          <section className="py-20 md:py-28" style={{ background: isDark ? '#0c0703' : '#f5ede3' }}>

            {/* Header + chevrons row */}
            <div className="flex items-end justify-between px-4 md:px-10 lg:px-16 mb-14 max-w-[1600px] mx-auto">
              <div>
                <p className="text-[10px] tracking-[0.32em] uppercase font-black mb-3" style={{ color: '#C4906A' }}>✦ Curated For You</p>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight" style={{ color: isDark ? '#fff' : '#1a0f06' }}>
                  Featured Collection
                </h2>
              </div>

              <div className="flex items-center gap-4">
                <p className="hidden lg:block text-sm max-w-[200px] text-right leading-relaxed"
                  style={{ color: isDark ? 'rgba(255,255,255,0.32)' : 'rgba(90,55,20,0.5)' }}>
                  Handpicked treasures for the discerning connoisseur
                </p>
                {/* Desktop chevrons */}
                <div className="hidden md:flex items-center gap-2">
                  <button
                    onClick={() => scrollFeatured('prev')}
                    disabled={featuredIdx === 0}
                    className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-30"
                    style={{
                      border: `1px solid ${isDark ? 'rgba(196,144,106,0.35)' : 'rgba(196,144,106,0.45)'}`,
                      background: isDark ? 'rgba(196,144,106,0.08)' : 'rgba(196,144,106,0.10)',
                      color: '#C4906A',
                    }}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => scrollFeatured('next')}
                    disabled={featuredIdx === featuredCollection.length - 1}
                    className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-30"
                    style={{
                      background: GOLD,
                      color: '#fff',
                      boxShadow: '0 4px 16px -4px rgba(155,104,68,0.5)',
                    }}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Snap-scroll lookbook track */}
            <div
              ref={featuredScrollRef}
              className="flex gap-0 overflow-x-auto pl-4 md:pl-10 lg:pl-16 pr-4"
              style={{
                scrollSnapType: 'x mandatory',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {featuredCollection.map((item, i) => (
                <div
                  key={item.id}
                  className="flex-shrink-0 group cursor-pointer relative"
                  style={{ scrollSnapAlign: 'start', width: 'clamp(260px, 28vw, 380px)', marginRight: '2px' }}
                >
                  {/* Gold hairline divider between cards */}
                  {i > 0 && (
                    <div className="absolute left-0 top-12 bottom-12 w-px pointer-events-none"
                      style={{ background: 'linear-gradient(to bottom, transparent, rgba(196,144,106,0.25) 30%, rgba(196,144,106,0.25) 70%, transparent)' }} />
                  )}

                  <div className="relative overflow-hidden mx-2" style={{ height: 'clamp(380px, 52vw, 520px)', borderRadius: 20 }}>
                    <OptimizedImage noWrapper
                      src={item.image} alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {/* Always-on bottom fade */}
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(4,2,1,0.92) 0%, rgba(4,2,1,0.4) 35%, transparent 65%)' }} />
                    {/* Hover gold sheen */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ background: 'linear-gradient(135deg, rgba(196,144,106,0.08), transparent 60%)' }} />

                    {/* Large editorial index number */}
                    <span
                      className="absolute top-6 right-6 font-black leading-none select-none pointer-events-none"
                      style={{
                        fontSize: 'clamp(56px, 8vw, 96px)',
                        color: 'rgba(196,144,106,0.15)',
                        fontVariantNumeric: 'tabular-nums',
                        letterSpacing: '-0.04em',
                      }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>

                    {/* Bottom content */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                      <p className="text-[9px] tracking-[0.3em] uppercase font-black mb-2" style={{ color: '#C4906A' }}>Flenix Jewels Ltd</p>
                      <h3 className="font-bold text-white leading-snug mb-1.5" style={{ fontSize: 'clamp(16px, 2vw, 22px)' }}>
                        {item.title}
                      </h3>
                      <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'rgba(255,255,255,0.45)' }}>
                        {item.description}
                      </p>
                      <div className="mt-5 w-8 h-px" style={{ background: GOLD }} />
                    </div>
                  </div>
                </div>
              ))}
              {/* Trailing spacer */}
              <div className="flex-shrink-0 w-4 md:w-16" />
            </div>

            {/* Live dots + mobile chevrons */}
            <div className="flex items-center justify-center gap-4 mt-8 px-4">
              {/* Mobile prev */}
              <button
                onClick={() => scrollFeatured('prev')}
                disabled={featuredIdx === 0}
                className="md:hidden w-9 h-9 rounded-full flex items-center justify-center disabled:opacity-30 transition-opacity"
                style={{ border: '1px solid rgba(196,144,106,0.4)', color: '#C4906A' }}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {/* Dots */}
              <div className="flex items-center gap-1.5">
                {featuredCollection.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      const el = featuredScrollRef.current;
                      if (!el || !el.firstElementChild) return;
                      const cardW = (el.firstElementChild as HTMLElement).offsetWidth;
                      el.scrollTo({ left: i * cardW, behavior: 'smooth' });
                    }}
                    className="rounded-full transition-all duration-300"
                    style={{
                      width: featuredIdx === i ? 24 : 6,
                      height: 4,
                      background: featuredIdx === i ? '#C4906A' : isDark ? 'rgba(196,144,106,0.28)' : 'rgba(196,144,106,0.35)',
                    }}
                  />
                ))}
              </div>

              {/* Mobile next */}
              <button
                onClick={() => scrollFeatured('next')}
                disabled={featuredIdx === featuredCollection.length - 1}
                className="md:hidden w-9 h-9 rounded-full flex items-center justify-center disabled:opacity-30 transition-opacity"
                style={{ background: GOLD, color: '#fff' }}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════
            5. EDITORIAL — About + Stats (theme-aware)
        ═══════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden" style={{ background: isDark ? '#0c0703' : '#1a0f06' }}>
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent 5%, #C4906A 35%, #D4A96A 50%, #C4906A 65%, transparent 95%)' }} />
          {/* Ambient glow */}
          <div className="absolute top-0 right-0 w-[700px] h-[700px] pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at top right, rgba(196,144,106,0.10) 0%, transparent 65%)', transform: 'translate(30%, -30%)' }} />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at bottom left, rgba(196,144,106,0.08) 0%, transparent 65%)', transform: 'translate(-30%, 30%)' }} />

          <div className="relative z-10 max-w-[1400px] mx-auto px-4 md:px-16 py-24 md:py-36">
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">

              {/* Left — copy */}
              <div>
                <p className="text-[10px] tracking-[0.35em] uppercase font-black mb-7" style={{ color: '#C4906A' }}>✦ Our Story</p>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.08] tracking-tight mb-8" style={{ color: '#fff' }}>
                  Crafting<br />Excellence<br />Since {SITE.foundingYear}
                </h2>
                <p className="text-lg leading-[1.8] mb-10 max-w-md" style={{ color: 'rgba(255,255,255,0.50)' }}>
                  Flenix Jewels Ltd is a premier destination for luxury jewelry — combining traditional artisanship with contemporary design. From ethically sourced diamonds to handcrafted settings, every piece tells a unique story.
                </p>
                <div className="flex flex-wrap gap-2.5 mb-12">
                  {['GIA Certified', 'IGI Certified', 'Ethically Sourced', 'Custom Design'].map(tag => (
                    <span key={tag} className="text-[10.5px] font-bold tracking-wider uppercase px-4 py-2 rounded-full"
                      style={{ border: '1px solid rgba(196,144,106,0.30)', color: 'rgba(196,144,106,0.85)' }}>
                      {tag}
                    </span>
                  ))}
                </div>
                <Link to="/about" className="inline-flex items-center gap-3 font-bold text-sm tracking-widest uppercase transition-all duration-200 group"
                  style={{ color: '#D4A96A' }}>
                  Our Full Story
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1.5" />
                </Link>
              </div>

              {/* Right — stats grid */}
              <div className="grid grid-cols-2 gap-4 md:gap-5">
                {[
                  { num: YEARS_OF_EXCELLENCE_LABEL, label: 'Years of Excellence', icon: Award },
                  { num: '1K+', label: 'Happy Customers', icon: Star },
                  { num: '15+', label: 'Countries Served', icon: Truck },
                  { num: '100%', label: 'Satisfaction Rate', icon: CheckCircle },
                ].map(({ num, label, icon: Icon }) => (
                  <div key={label} className="relative p-7 md:p-8 rounded-2xl overflow-hidden group transition-all duration-300 hover:-translate-y-1"
                    style={{ background: 'rgba(196,144,106,0.07)', border: '1px solid rgba(196,144,106,0.16)' }}>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: 'rgba(196,144,106,0.05)' }} />
                    <Icon className="h-5 w-5 mb-5 relative z-10" style={{ color: 'rgba(196,144,106,0.5)' }} />
                    <div className="text-4xl md:text-5xl font-black mb-2 relative z-10"
                      style={{ background: GOLD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                      {num}
                    </div>
                    <p className="text-[10.5px] font-bold tracking-[0.18em] uppercase relative z-10" style={{ color: 'rgba(255,255,255,0.40)' }}>
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent 5%, rgba(196,144,106,0.3) 35%, rgba(212,169,106,0.4) 50%, rgba(196,144,106,0.3) 65%, transparent 95%)' }} />
        </section>

        {/* ═══════════════════════════════════════════════════════
            6. WHY US — Feature cards
        ═══════════════════════════════════════════════════════ */}
        <section className="py-20 md:py-28 px-4 md:px-10 lg:px-16 max-w-[1600px] mx-auto">
          <div className="text-center mb-16">
            <p className="text-[10px] tracking-[0.32em] uppercase font-black mb-3.5" style={{ color: '#C4906A' }}>✦ Why Choose Us</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Excellence in Every Detail</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map(({ icon: Icon, label, sub, detail }) => (
              <div key={label} className="group relative p-7 md:p-8 rounded-3xl overflow-hidden cursor-default transition-all duration-500 hover:-translate-y-2 bg-card"
                style={{ border: '1px solid rgba(196,144,106,0.18)', boxShadow: '0 2px 20px rgba(196,144,106,0.06)' }}>
                {/* Top gold bar on hover */}
                <div className="absolute top-0 left-6 right-6 h-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-400"
                  style={{ background: GOLD, transitionDuration: '400ms' }} />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
                  style={{ background: 'linear-gradient(135deg, rgba(196,144,106,0.05), transparent)', transitionDuration: '400ms' }} />

                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-7 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                    style={{ background: 'rgba(196,144,106,0.10)' }}>
                    <Icon className="h-6 w-6" style={{ color: '#C4906A' }} />
                  </div>
                  <h3 className="font-bold text-[17px] mb-1.5 leading-snug">{label}</h3>
                  <p className="text-[10px] font-black tracking-[0.2em] uppercase mb-4" style={{ color: '#C4906A' }}>{sub}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            7. GALLERY — Immersive showcase
        ═══════════════════════════════════════════════════════ */}
        <section className="py-20 md:py-28 relative overflow-hidden" style={{ background: isDark ? '#080400' : '#0e0804' }}>
          {/* Ambient glow */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at top right, rgba(196,144,106,0.10) 0%, transparent 65%)', transform: 'translate(20%,-20%)' }} />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at bottom left, rgba(212,169,106,0.08) 0%, transparent 65%)', transform: 'translate(-20%,20%)' }} />
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent 5%, #C4906A 35%, #D4A96A 50%, #C4906A 65%, transparent 95%)' }} />

          <div className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-10 lg:px-16">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
              <div>
                <p className="text-[10px] tracking-[0.35em] uppercase font-black mb-3" style={{ color: '#C4906A' }}>✦ Gallery</p>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.06] text-white">
                  Moments<br className="hidden md:block" /> in Gold
                </h2>
              </div>
              <div className="lg:pb-2">
                <p className="text-sm leading-relaxed mb-5 max-w-xs" style={{ color: 'rgba(255,255,255,0.38)' }}>
                  Each piece is a testament to exceptional artisanship — photographed to reveal every facet.
                </p>
                <Link to="/gallery"
                  className="inline-flex items-center gap-2.5 text-[11px] font-bold tracking-[0.22em] uppercase transition-all duration-200 group"
                  style={{ color: '#C4906A' }}>
                  Explore Full Gallery
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1.5" />
                </Link>
              </div>
            </div>

            {/* Main showcase grid */}
            {galleryItems.length === 0 && (deferredStatus === 'loading' || deferredStatus === 'idle' || !galleryFetched) ? (
              <div className="grid grid-cols-12 gap-3 md:gap-4" style={{ gridAutoRows: '180px' }}>
                <div className="col-span-12 md:col-span-5 row-span-3 rounded-3xl animate-pulse" style={{ background: 'rgba(196,144,106,0.12)' }} />
                <div className="col-span-12 md:col-span-7 row-span-2 rounded-2xl animate-pulse" style={{ background: 'rgba(196,144,106,0.10)', animationDelay: '0.1s' }} />
                <div className="col-span-12 md:col-span-7 row-span-1 grid grid-cols-3 gap-3 md:gap-4">
                  {[0.2, 0.3, 0.4].map((d) => (
                    <div key={d} className="rounded-xl animate-pulse" style={{ background: 'rgba(196,144,106,0.10)', animationDelay: `${d}s` }} />
                  ))}
                </div>
              </div>
            ) : galleryItems.length === 0 ? (
              <EmptyState
                icon={<Gem className="h-7 w-7" />}
                title="Gallery Coming Soon"
                description="We’re curating an exceptional collection for you."
                className="py-10"
              />
            ) : homeGalleryItems.length >= 5 ? (
              <div className="grid grid-cols-12 gap-3 md:gap-4" style={{ gridAutoRows: '180px' }}>

                {/* Hero tall image — 5 cols × 3 rows */}
                <Link to="/gallery"
                  className="col-span-12 md:col-span-5 row-span-3 relative overflow-hidden rounded-3xl group block"
                  style={{ gridRow: 'span 3' }}>
                  <OptimizedImage noWrapper src={homeGalleryItems[0].image} alt={homeGalleryItems[0].description || 'Gallery'}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: 'linear-gradient(to top, rgba(6,3,1,0.85) 0%, rgba(6,3,1,0.25) 50%, transparent 80%)' }} />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: 'linear-gradient(135deg, rgba(196,144,106,0.12), transparent)' }} />
                  {/* Gold corner frames */}
                  <div className="absolute top-0 left-0 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{ borderTop: '2px solid rgba(196,144,106,0.7)', borderLeft: '2px solid rgba(196,144,106,0.7)', borderRadius: '20px 0 0 0' }} />
                  <div className="absolute bottom-0 right-0 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{ borderBottom: '2px solid rgba(196,144,106,0.7)', borderRight: '2px solid rgba(196,144,106,0.7)', borderRadius: '0 0 20px 0' }} />
                  <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-3 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-400">
                    <p className="text-[9px] tracking-[0.28em] uppercase font-black mb-1.5" style={{ color: '#C4906A' }}>✦ Featured</p>
                    {homeGalleryItems[0].description && (
                      <p className="text-white text-sm leading-relaxed line-clamp-2">{homeGalleryItems[0].description}</p>
                    )}
                  </div>
                </Link>

                {/* Top-right wide — 7 cols × 2 rows */}
                <Link to="/gallery"
                  className="col-span-12 md:col-span-7 row-span-2 relative overflow-hidden rounded-2xl group block">
                  <OptimizedImage noWrapper src={homeGalleryItems[1].image} alt={homeGalleryItems[1].description || 'Gallery'}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                    style={{ background: 'linear-gradient(to top, rgba(6,3,1,0.75) 0%, transparent 55%)' }} />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                    style={{ background: 'linear-gradient(135deg, rgba(196,144,106,0.10), transparent)' }} />
                  {homeGalleryItems[1].description && (
                    <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-400">
                      <p className="text-white text-sm leading-relaxed line-clamp-1">{homeGalleryItems[1].description}</p>
                    </div>
                  )}
                </Link>

                {/* Bottom-right 3 small tiles — contained in col-span-7 wrapper */}
                <div className="col-span-12 md:col-span-7 grid grid-cols-3 gap-3 md:gap-4">
                  {homeGalleryItems.slice(2, 5).map((item) => (
                    <Link key={item.id} to="/gallery"
                      className="relative overflow-hidden group block h-full min-h-[140px] md:min-h-0"
                      style={{ borderRadius: 16 }}>
                      <OptimizedImage noWrapper src={item.image} alt={item.description || 'Gallery'}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ background: 'linear-gradient(to top, rgba(6,3,1,0.80) 0%, transparent 65%)' }} />
                      <div className="absolute inset-0 rounded-[16px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                        style={{ boxShadow: 'inset 0 0 0 1.5px rgba(196,144,106,0.55)' }} />
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              /* Fallback — editorial scroll (fewer than 5 home images assigned) */
              <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
                {homeGalleryItems.map(item => (
                  <Link key={item.id} to="/gallery" className="flex-shrink-0 w-64 h-80 rounded-2xl overflow-hidden group relative block">
                    <OptimizedImage noWrapper src={item.image} alt={item.description || 'Gallery'}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: 'linear-gradient(to top, rgba(6,3,1,0.75) 0%, transparent 55%)' }} />
                  </Link>
                ))}
              </div>
            )}

            {/* Count pill */}
            {galleryItems.length > 0 && (
              <div className="flex items-center justify-center mt-10">
                <Link to="/gallery"
                  className="inline-flex items-center gap-3 text-[11px] font-bold tracking-[0.2em] uppercase px-7 py-3.5 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                  style={{ background: GOLD, color: '#fff', boxShadow: '0 8px 30px -6px rgba(155,104,68,0.5)' }}>
                  View All {galleryItems.length} Pieces
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent 5%, rgba(196,144,106,0.25) 50%, transparent 95%)' }} />
        </section>


        {/* ═══════════════════════════════════════════════════════
            8. TESTIMONIALS — Scroll marquee
        ═══════════════════════════════════════════════════════ */}
        {testimonials.length > 0 && (
          <section className="py-20 overflow-hidden bg-secondary/60 dark:bg-secondary/20">
            <div className="text-center mb-14 px-4">
              <p className="text-[10px] tracking-[0.32em] uppercase font-black mb-3.5 text-primary">✦ Client Love ✦</p>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Testimonial</h2>
            </div>
            <div className="flex gap-5 animate-[scroll_28s_linear_infinite] hover:pause pl-6 md:pl-16">
              {[...testimonials, ...testimonials].map((t, i) => (
                <div
                  key={`${t.id}-${i}`}
                  className="flex-shrink-0 w-[320px] md:w-[380px] p-8 rounded-3xl bg-card border border-border/50 shadow-sm"
                  style={{ boxShadow: '0 4px 32px rgba(196,144,106,0.07)' }}
                >
                  {/* Stars */}
                  <div className="flex gap-0.5 mb-5">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className={`h-4 w-4 ${j < t.rating ? 'fill-gold text-gold' : 'text-muted-foreground/30'}`} />
                    ))}
                  </div>
                  {/* Large serif quote mark */}
                  <p className="text-6xl leading-none font-serif mb-1 text-primary/25" style={{ fontFamily: 'Georgia, serif' }}>"</p>
                  <p className="text-[14.5px] leading-[1.75] mb-7 line-clamp-4 text-foreground/80">{t.text}</p>
                  <div className="flex items-center gap-3.5 pt-5 border-t border-border/50">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center font-black text-white text-sm flex-shrink-0"
                      style={{ background: GOLD }}>
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-foreground">{t.name}</p>
                      <p className="text-[11px] tracking-wide text-muted-foreground">Verified Customer</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════
            9. BLOG — Editorial magazine layout
        ═══════════════════════════════════════════════════════ */}
        <section className="py-20 md:py-28 px-4 md:px-10 lg:px-16 max-w-[1400px] mx-auto">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10 md:mb-14">
            <div>
              <p className="text-[10px] tracking-[0.32em] uppercase font-black mb-3" style={{ color: '#C4906A' }}>✦ The Journal</p>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Latest Stories</h2>
            </div>
            <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-bold tracking-widest uppercase group" style={{ color: '#C4906A' }}>
              All Articles <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1.5" />
            </Link>
          </div>

          {sortedBlogs.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="h-7 w-7" />}
              title="Stories Coming Soon"
              description="We’re writing expert guides, diamond education, and timeless jewelry stories."
              className="py-10"
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8">
              {/* Featured — 3 cols */}
              {sortedBlogs[0] && (
                <article className="lg:col-span-3 group cursor-pointer" onClick={() => openBlog(sortedBlogs[0])}>
                  <div className="relative h-64 md:h-[400px] rounded-3xl overflow-hidden mb-6">
                    <OptimizedImage noWrapper src={sortedBlogs[0].thumbnail || sortedBlogs[0].image} alt={sortedBlogs[0].title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(6,3,1,0.55) 0%, transparent 55%)' }} />
                    <span className="absolute top-5 left-5 text-[10px] font-black tracking-[0.2em] uppercase px-3.5 py-1.5 rounded-full"
                      style={{ background: GOLD, color: '#fff' }}>
                      Featured
                    </span>
                  </div>
                  <time className="text-[11px] text-muted-foreground tracking-widest uppercase font-semibold">
                    {new Date(sortedBlogs[0].date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </time>
                  <h3 className="text-2xl md:text-3xl font-bold mt-2.5 mb-3 leading-snug tracking-tight group-hover:text-[#C4906A] transition-colors duration-200">
                    {sortedBlogs[0].title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed line-clamp-2">
                    {sortedBlogs[0].content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()}
                  </p>
                </article>
              )}

              {/* Sidebar — 2 cols */}
              <div className="lg:col-span-2 flex flex-col gap-7">
                {sortedBlogs.slice(1, 3).map(blog => (
                  <article key={blog.id} className="group cursor-pointer flex gap-5" onClick={() => openBlog(blog)}>
                    <div className="relative flex-shrink-0 w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden">
                      <OptimizedImage noWrapper src={blog.thumbnail || blog.image} alt={blog.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <time className="text-[10.5px] text-muted-foreground tracking-widest uppercase font-semibold mb-1.5">
                        {new Date(blog.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </time>
                      <h3 className="font-bold text-base leading-snug group-hover:text-[#C4906A] transition-colors duration-200 line-clamp-2 mb-2">
                        {blog.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {blog.content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ═══════════════════════════════════════════════════════
            10. WHATSAPP CTA — Dark full-bleed
        ═══════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden mx-4 md:mx-10 lg:mx-16 mb-24 rounded-3xl" style={{ background: '#0c0703' }}>
          {/* Ambient glow */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(196,144,106,0.18) 0%, transparent 70%)' }} />
          {/* Gold borders */}
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent 10%, rgba(196,144,106,0.5) 40%, rgba(212,169,106,0.6) 50%, rgba(196,144,106,0.5) 60%, transparent 90%)' }} />
          <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent 10%, rgba(196,144,106,0.3) 40%, rgba(196,144,106,0.3) 60%, transparent 90%)' }} />
          {/* Decorative corner diamonds */}
          <span className="absolute top-8 left-10 text-2xl opacity-20" style={{ color: '#C4906A' }}>✦</span>
          <span className="absolute top-8 right-10 text-2xl opacity-20" style={{ color: '#C4906A' }}>✦</span>
          <span className="absolute bottom-8 left-10 text-lg opacity-10" style={{ color: '#C4906A' }}>✦</span>
          <span className="absolute bottom-8 right-10 text-lg opacity-10" style={{ color: '#C4906A' }}>✦</span>

          <div className="relative z-10 text-center py-20 md:py-28 px-6">
            <p className="text-[10px] tracking-[0.45em] uppercase font-black mb-7" style={{ color: '#C4906A' }}>✦ Let's Create Together</p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-[1.12] tracking-tight">
              Your Dream Piece<br />Awaits
            </h2>
            <p className="mb-12 max-w-lg mx-auto leading-[1.8] text-lg" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Connect with our jewelry experts for a personalized consultation. We craft bespoke pieces that tell your unique story.
            </p>
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 font-bold text-[13px] tracking-[0.12em] uppercase rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                padding: '17px 44px',
                background: GOLD,
                color: '#fff',
                boxShadow: '0 10px 50px -8px rgba(155,104,68,0.7)',
              }}
            >
              <MessageCircle className="h-5 w-5" />
              Enquire on WhatsApp
            </a>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            11. INSTAGRAM — Journey cards
        ═══════════════════════════════════════════════════════ */}
        {instagramPosts.length > 0 && (
          <section className="py-20 md:py-28 px-4 md:px-10 lg:px-16 max-w-[1600px] mx-auto mb-4">
            {/* Header — split layout */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
              <div>
                <p className="text-[10px] tracking-[0.32em] uppercase font-black mb-3" style={{ color: '#C4906A' }}>✦ Instagram</p>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Follow Our Journey</h2>
              </div>
              <a
                href="https://instagram.com/flenixjewels"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 font-bold text-sm tracking-widest uppercase transition-all duration-200 group self-start md:self-end"
                style={{ color: '#C4906A' }}
              >
                @flenixjewels
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1.5" />
              </a>
            </div>

            <InstagramJourneyCarousel posts={instagramPosts} />
          </section>
        )}

        <ServicesSection />
      </main>

      <Footer />

      <BlogDialog
        blog={selectedBlog}
        isOpen={isBlogDialogOpen}
        onClose={() => setIsBlogDialogOpen(false)}
        whatsappNumber={contactInfo?.whatsapp}
      />
    </div>
  );
}
