import { useEffect, useRef, useState } from 'react';
import Header from '@/components/Header';
import MiniHeader from '@/components/MiniHeader';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { useAppSelector } from "@/store/hooks";
import { selectGlobalData } from "@/store/contentSlice";
import { Link } from 'react-router-dom';
import { Award, Shield, Heart, Globe, Gem, Crown, Sparkles, Target, Users, Clock, Zap, ArrowRight, ChevronRight } from 'lucide-react';
import logo1 from '@/assets/2.jpg';
import logo2 from '@/assets/3.jpg';
import logo3 from '@/assets/04.jpg';
import logo4 from '@/assets/05.jpg';
import { FaWhatsapp } from 'react-icons/fa';

const GOLD = 'linear-gradient(135deg, #9B6844 0%, #C4906A 55%, #D4A96A 100%)';

function useReveal(threshold = 0.1) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

const RevealSection = ({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const { ref, visible } = useReveal(0.1);
  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.8s ease ${delay}ms, transform 0.8s ease ${delay}ms`,
      }}
    >
      {children}
    </section>
  );
};

const stats = [
  { value: '11+', label: 'Years of Excellence' },
  { value: '50K+', label: 'Happy Clients' },
  { value: '30+', label: 'Countries Served' },
  { value: '10K+', label: 'Unique Designs' },
];

const coreValues = [
  { icon: Award, title: 'Excellence', description: 'Every piece meets our exacting standards — no compromise, ever.' },
  { icon: Shield, title: 'Integrity', description: 'Transparency and honesty at every step, from sourcing to delivery.' },
  { icon: Heart, title: 'Passion', description: 'Each creation is infused with love and dedication to the art of jewelry.' },
  { icon: Globe, title: 'Sustainability', description: 'Committed to ethical sourcing and environmentally responsible practice.' },
];

const expertise = [
  { icon: Users, title: 'Master Artisans', description: 'Our skilled craftsmen bring decades of experience to every piece.' },
  { icon: Clock, title: 'Timeless Designs', description: 'We create pieces that transcend trends — elegance that lasts a lifetime.' },
  { icon: Shield, title: 'Certified Quality', description: 'Every piece comes with international certifications and lifetime warranty.' },
  { icon: Gem, title: 'Rare Gemstones', description: 'Finest diamonds and gemstones sourced from trusted suppliers worldwide.' },
];

const About = () => {
  const { categories, promoHeader, contactInfo } = useAppSelector(selectGlobalData);
  const [heroLoaded, setHeroLoaded] = useState(false);

  const hasPromo = promoHeader?.enabled && promoHeader?.text;
  const promoHeight = hasPromo ? 40 : 0;
  const paddingTop = promoHeight + 80 + 52;

  useEffect(() => { const t = setTimeout(() => setHeroLoaded(true), 80); return () => clearTimeout(t); }, []);

  const structuredData = {
    '@context': 'https://schema.org', '@type': 'AboutPage',
    '@id': 'https://www.flenixjewels.com/about#aboutpage',
    name: 'About Flenix Jewels - Premium Diamond Jewelry Since 2011',
    description: 'Learn about Flenix Jewels - a premier luxury jewelry brand with over 11 years of excellence.',
    url: 'https://www.flenixjewels.com/about',
    mainEntityOfPage: 'https://www.flenixjewels.com/about',
    mainEntity: {
      '@type': 'Organization', '@id': 'https://www.flenixjewels.com/#jewelry-store',
      name: 'Flenix Jewels', foundingDate: '2011', numberOfEmployees: '50+',
      areaServed: 'Worldwide', award: 'GIA Certified Partner',
      knowsAbout: ['Diamond Jewelry', 'Gold Jewelry', 'Custom Jewelry Design', 'Lab Grown Diamonds']
    }
  };
  const faqItems = [
    { question: "How long has Flenix Jewels been in business?", answer: "We have 11+ years of experience in diamond and gold jewelry design, manufacturing, and exports." },
    { question: "Do you offer certified diamonds?", answer: "Yes. We offer certified lab-grown and natural diamonds with trusted grading standards." },
    { question: "Do you serve international clients?", answer: "Yes. We serve clients globally with secure delivery and customer support." },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FDF8F2] dark:bg-[#0a0603]">
      <SEOHead
        title="About Us - 11+ Years of Diamond Jewelry Excellence | Flenix Jewels"
        description="Discover Flenix Jewels - 11+ years of crafting exceptional GIA certified diamond and gold jewelry. Master craftsmanship, ethical sourcing, 50K+ happy clients worldwide."
        keywords="about flenix jewels, jewelry brand story, luxury jewelry heritage, diamond jewelry craftsmanship, GIA certified jeweler"
        canonicalUrl="https://www.flenixjewels.com/about"
        structuredData={structuredData}
        breadcrumbs={[{ name: "Home", url: "https://www.flenixjewels.com" }, { name: "About", url: "https://www.flenixjewels.com/about" }]}
        faqItems={faqItems}
      />
      <Header promoHeader={promoHeader} />
      <MiniHeader categories={categories} promoHeight={promoHeight} />

      <main className="flex-1" style={{ paddingTop: `${paddingTop}px` }}>

        {/* ── Hero ── */}
        <section className="relative overflow-hidden py-24 md:py-36 bg-[#130900] dark:bg-[#0c0703]">
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent 5%, #C4906A 35%, #D4A96A 50%, #C4906A 65%, transparent 95%)' }} />
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 65% 70% at 50% 50%, rgba(196,144,106,0.11) 0%, transparent 70%)' }} />
          {/* Decorative circles */}
          <div className="absolute top-[-8%] left-[-5%] w-80 h-80 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(196,144,106,0.08), transparent 70%)' }} />
          <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(212,169,106,0.07), transparent 70%)' }} />

          <div
            className="relative z-10 max-w-4xl mx-auto px-6 text-center"
            style={{ opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 1s ease, transform 1s ease' }}
          >
            <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full mb-8" style={{ background: 'rgba(196,144,106,0.12)', border: '1px solid rgba(196,144,106,0.3)' }}>
              <Crown className="h-3.5 w-3.5" style={{ color: '#C4906A' }} />
              <span className="text-[10px] tracking-[0.35em] uppercase font-black" style={{ color: '#C4906A' }}>Est. 2011 · Fine Jewelry</span>
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white leading-[1.04] mb-6">
              Crafting Dreams<br />
              <span style={{ background: GOLD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Into Reality</span>
            </h1>
            <p className="text-lg md:text-xl leading-relaxed max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.48)' }}>
              For over 11 years, Flenix Jewels has been transforming precious metals and gems into timeless masterpieces that celebrate life's most precious moments.
            </p>
          </div>

          {/* Stats bar inside hero */}
          <div
            className="relative z-10 max-w-4xl mx-auto px-6 mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
            style={{ opacity: heroLoaded ? 1 : 0, transition: 'opacity 1.2s ease 0.3s' }}
          >
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold mb-1" style={{ background: GOLD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{s.value}</div>
                <div className="text-[11px] tracking-[0.2em] uppercase font-bold" style={{ color: 'rgba(255,255,255,0.38)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent 5%, rgba(196,144,106,0.3) 50%, transparent 95%)' }} />
        </section>

        {/* ── Our Story ── */}
        <RevealSection className="py-20 md:py-28 bg-[#FDF8F2] dark:bg-[#0e0805]">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 grid lg:grid-cols-2 gap-16 items-center">
            {/* Text */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="h-px w-8" style={{ background: GOLD }} />
                <span className="text-[10px] tracking-[0.35em] uppercase font-black" style={{ color: '#C4906A' }}>Our Journey</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-[#1C0D05] dark:text-[#F5E8D8] leading-[1.1]">
                A Legacy of<br />
                <span style={{ background: GOLD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Excellence</span>
              </h2>
              <p className="text-base leading-relaxed mb-5 text-[#5A3D2A] dark:text-[#B89880]">
                Flenix Jewels is a modern fine jewelry manufacturer and supplier, specializing in both lab-grown and natural diamond jewelry. With a strong focus on craftsmanship, ethical sourcing, and precision, we create timeless designs that blend luxury with everyday wearability.
              </p>
              <p className="text-base leading-relaxed mb-8 text-[#5A3D2A] dark:text-[#B89880]">
                Every piece is made to order, ensuring superior quality, attention to detail, and complete customization. We proudly serve jewelers and buyers across the world — from concept and CAD design to final polishing and secure worldwide delivery, entirely in-house.
              </p>
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: Zap, label: 'Fast Delivery' },
                  { icon: Shield, label: 'Certified Quality' },
                  { icon: Gem, label: 'Rare Gems' },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold bg-white dark:bg-[#1a0c06] text-[#9B6844] dark:text-[#C4906A]"
                    style={{ border: '1px solid rgba(196,144,106,0.28)', boxShadow: '0 2px 12px -4px rgba(196,144,106,0.15)' }}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Image collage */}
            <div className="grid grid-cols-2 gap-4">
              {[logo1, logo2, logo3, logo4].map((src, i) => (
                <div
                  key={i}
                  className={`group relative overflow-hidden rounded-2xl aspect-square ${i % 2 === 1 ? 'mt-8' : ''}`}
                  style={{ boxShadow: '0 12px 40px -10px rgba(0,0,0,0.22)' }}
                >
                  <img
                    src={src}
                    alt="Jewelry craftsmanship"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.08]"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-350 pointer-events-none"
                    style={{ boxShadow: 'inset 0 0 0 2px rgba(196,144,106,0.6)' }} />
                </div>
              ))}
            </div>
          </div>
        </RevealSection>

        {/* ── Mission & Vision ── */}
        <RevealSection className="py-20 md:py-28 bg-[#F5EDE3] dark:bg-[#0a0603]">
          <div className="max-w-6xl mx-auto px-6 lg:px-10">
            <div className="text-center mb-14">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="h-px w-10" style={{ background: 'linear-gradient(90deg, transparent, #C4906A)' }} />
                <Sparkles className="h-3.5 w-3.5" style={{ color: '#C4906A' }} />
                <span className="text-[10px] tracking-[0.35em] uppercase font-black" style={{ color: '#C4906A' }}>Purpose</span>
                <Sparkles className="h-3.5 w-3.5" style={{ color: '#C4906A' }} />
                <div className="h-px w-10" style={{ background: 'linear-gradient(90deg, #C4906A, transparent)' }} />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-[#1C0D05] dark:text-[#F5E8D8]">What Drives Us</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Vision */}
              <div
                className="group relative overflow-hidden rounded-3xl p-8 md:p-10 bg-white dark:bg-[#150a04]"
                style={{ border: '1px solid rgba(196,144,106,0.2)', boxShadow: '0 8px 40px -10px rgba(0,0,0,0.1)', transition: 'border-color 0.3s ease, box-shadow 0.3s ease' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(196,144,106,0.5)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 16px 50px -10px rgba(196,144,106,0.18)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(196,144,106,0.2)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 40px -10px rgba(0,0,0,0.1)'; }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(196,144,106,0.10), transparent 70%)' }} />
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ background: 'rgba(196,144,106,0.12)', border: '1px solid rgba(196,144,106,0.2)' }}>
                  <Sparkles className="h-6 w-6" style={{ color: '#C4906A' }} />
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[9px] tracking-[0.3em] uppercase font-black" style={{ color: '#C4906A' }}>Our Vision</span>
                  <div className="h-px flex-1" style={{ background: 'rgba(196,144,106,0.25)' }} />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-[#1C0D05] dark:text-[#F5E8D8]">Global Trusted Partner</h3>
                <p className="text-base leading-relaxed text-[#5A3D2A] dark:text-[#B89880]">
                  To become a globally trusted jewelry manufacturing partner, known for innovation, ethical diamonds, and exceptional craftsmanship — setting new standards in quality and design for the modern jewelry industry.
                </p>
              </div>
              {/* Mission */}
              <div
                className="group relative overflow-hidden rounded-3xl p-8 md:p-10 bg-[#130900] dark:bg-[#130900]"
                style={{ border: '1px solid rgba(196,144,106,0.25)', boxShadow: '0 8px 40px -10px rgba(0,0,0,0.25)', transition: 'border-color 0.3s ease, box-shadow 0.3s ease' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(196,144,106,0.55)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(196,144,106,0.25)'; }}
              >
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(196,144,106,0.08), transparent 70%)' }} />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ background: 'rgba(196,144,106,0.15)', border: '1px solid rgba(196,144,106,0.3)' }}>
                    <Target className="h-6 w-6" style={{ color: '#D4A96A' }} />
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[9px] tracking-[0.3em] uppercase font-black" style={{ color: '#C4906A' }}>Our Mission</span>
                    <div className="h-px flex-1" style={{ background: 'rgba(196,144,106,0.25)' }} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white">Delivering Lasting Value</h3>
                  <p className="text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    To deliver finely crafted diamond jewelry that meets international standards, supports sustainable practices, and helps our partners grow their businesses — combining advanced technology, skilled artistry, and honest pricing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </RevealSection>

        {/* ── Core Values ── */}
        <RevealSection className="py-20 md:py-28 bg-[#FDF8F2] dark:bg-[#0e0805]">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <div className="text-center mb-14">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="h-px w-10" style={{ background: 'linear-gradient(90deg, transparent, #C4906A)' }} />
                <Gem className="h-3.5 w-3.5" style={{ color: '#C4906A' }} />
                <span className="text-[10px] tracking-[0.35em] uppercase font-black" style={{ color: '#C4906A' }}>Principles</span>
                <Gem className="h-3.5 w-3.5" style={{ color: '#C4906A' }} />
                <div className="h-px w-10" style={{ background: 'linear-gradient(90deg, #C4906A, transparent)' }} />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-[#1C0D05] dark:text-[#F5E8D8]">Our Core Values</h2>
              <p className="mt-3 text-base text-[#9B8070] dark:text-[#7A6050]">The principles that guide everything we do</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {coreValues.map(({ icon: Icon, title, description }, i) => (
                <div
                  key={i}
                  className="group relative overflow-hidden rounded-2xl p-7 text-center bg-white dark:bg-[#150a04] cursor-default"
                  style={{ border: '1px solid rgba(196,144,106,0.16)', boxShadow: '0 4px 24px -6px rgba(0,0,0,0.08)', transition: 'transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-6px)'; el.style.boxShadow = '0 20px 40px -10px rgba(196,144,106,0.22)'; el.style.borderColor = 'rgba(196,144,106,0.45)'; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(0)'; el.style.boxShadow = '0 4px 24px -6px rgba(0,0,0,0.08)'; el.style.borderColor = 'rgba(196,144,106,0.16)'; }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 100%, rgba(196,144,106,0.07), transparent)' }} />
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 relative z-10" style={{ background: 'linear-gradient(135deg, rgba(196,144,106,0.14), rgba(212,169,106,0.08))', border: '1px solid rgba(196,144,106,0.2)' }}>
                    <Icon className="h-7 w-7" style={{ color: '#C4906A' }} />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-[#1C0D05] dark:text-[#F5E8D8] relative z-10">{title}</h3>
                  <p className="text-sm leading-relaxed text-[#9B8070] dark:text-[#7A6050] relative z-10">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </RevealSection>

        {/* ── Why Choose Us ── */}
        <RevealSection className="py-20 md:py-28 bg-[#F5EDE3] dark:bg-[#0a0603]">
          <div className="max-w-6xl mx-auto px-6 lg:px-10">
            <div className="grid lg:grid-cols-[380px_1fr] gap-14 items-start">
              {/* Left label */}
              <div className="lg:sticky lg:top-32">
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-px w-8" style={{ background: GOLD }} />
                  <span className="text-[10px] tracking-[0.35em] uppercase font-black" style={{ color: '#C4906A' }}>Expertise</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-5 text-[#1C0D05] dark:text-[#F5E8D8] leading-[1.1]">
                  Why Choose<br />
                  <span style={{ background: GOLD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Flenix?</span>
                </h2>
                <p className="text-base leading-relaxed text-[#5A3D2A] dark:text-[#B89880]">
                  Experience, integrity, and artistry — combined to deliver jewelry that exceeds expectations every time.
                </p>
              </div>
              {/* Right features */}
              <div className="flex flex-col gap-4">
                {expertise.map(({ icon: Icon, title, description }, i) => (
                  <div
                    key={i}
                    className="group flex gap-5 items-start p-6 rounded-2xl bg-white dark:bg-[#150a04] cursor-default"
                    style={{ border: '1px solid rgba(196,144,106,0.14)', boxShadow: '0 2px 16px -4px rgba(0,0,0,0.07)', transition: 'border-color 0.3s ease, box-shadow 0.3s ease' }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(196,144,106,0.45)'; el.style.boxShadow = '0 8px 32px -8px rgba(196,144,106,0.18)'; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(196,144,106,0.14)'; el.style.boxShadow = '0 2px 16px -4px rgba(0,0,0,0.07)'; }}
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110" style={{ background: 'rgba(196,144,106,0.12)', border: '1px solid rgba(196,144,106,0.2)' }}>
                      <Icon className="h-5 w-5" style={{ color: '#C4906A' }} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-1 text-[#1C0D05] dark:text-[#F5E8D8]">{title}</h3>
                      <p className="text-sm leading-relaxed text-[#9B8070] dark:text-[#7A6050]">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </RevealSection>

        {/* ── CTA ── */}
        <RevealSection className="py-20 md:py-28 bg-[#FDF8F2] dark:bg-[#0e0805]">
          <div className="max-w-6xl mx-auto px-6 lg:px-10">
            <div
              className="relative overflow-hidden rounded-3xl p-10 md:p-16 text-center"
              style={{ background: '#100803' }}
            >
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent 10%, rgba(196,144,106,0.5) 40%, rgba(212,169,106,0.7) 50%, rgba(196,144,106,0.5) 60%, transparent 90%)' }} />
              <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(196,144,106,0.10), transparent 70%)' }} />
              <div className="relative z-10">
                <span className="text-[10px] tracking-[0.42em] uppercase font-black block mb-5" style={{ color: '#C4906A' }}>✦ Begin Your Journey</span>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-[1.1]">
                  Find Your Perfect<br />
                  <span style={{ background: GOLD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Piece</span>
                </h2>
                <p className="text-base mb-10 max-w-md mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.42)' }}>
                  Discover the collection or speak to our experts about a bespoke creation crafted just for you.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <Link
                    to="/categories"
                    className="inline-flex items-center gap-2.5 font-bold text-sm tracking-[0.1em] uppercase rounded-full transition-all duration-300 hover:scale-105 active:scale-95"
                    style={{ padding: '14px 36px', background: GOLD, color: '#fff', boxShadow: '0 10px 36px -8px rgba(155,104,68,0.65)' }}
                  >
                    Browse Collections
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  {contactInfo?.whatsapp && (
                    <a
                      href={`https://wa.me/${contactInfo.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2.5 font-bold text-sm tracking-[0.1em] uppercase rounded-full transition-all duration-300 hover:scale-105 active:scale-95"
                      style={{ padding: '14px 36px', background: 'rgba(255,255,255,0.07)', color: '#fff', border: '1px solid rgba(255,255,255,0.14)', backdropFilter: 'blur(10px)' }}
                    >
                      <FaWhatsapp className="h-4 w-4" style={{ color: '#25D366' }} />
                      WhatsApp Us
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </RevealSection>
      </main>

      <Footer />
    </div>
  );
};

export default About;
