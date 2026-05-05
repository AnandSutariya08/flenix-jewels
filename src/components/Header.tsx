import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, MessageCircle, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import logo from '@/assets/flenix-logo-horizontal.png';
import { PromoHeader as PromoHeaderType } from '@/lib/storage';

interface HeaderProps {
  promoHeader?: PromoHeaderType | null;
}

const navLinks = [
  { name: 'Home',         path: '/' },
  { name: 'Categories',   path: '/categories' },
  { name: 'Gallery',      path: '/gallery' },
  { name: 'Blog',         path: '/blog' },
  { name: 'Buying Guide', path: '/buying-guide' },
  { name: 'About',        path: '/about' },
  { name: 'Contact',      path: '/contact' },
];

const WHATSAPP_URL = 'https://wa.me/919967381180?text=Hi!%20I%20am%20interested%20in%20your%20jewelry%20collection.';

export default function Header({ promoHeader }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen]   = useState(false);
  const [isScrolled, setIsScrolled]   = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  const hasPromo = promoHeader?.enabled && promoHeader?.text;

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 64);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setIsMenuOpen(false); }, [location.pathname]);

  /* Lock body scroll when mobile menu is open */
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">

      {/* ── Promo bar ──────────────────────────────────────────────── */}
      <div
        className="overflow-hidden transition-all duration-500"
        style={{
          height:  hasPromo && !isScrolled ? 34 : 0,
          opacity: hasPromo && !isScrolled ? 1  : 0,
          background: 'linear-gradient(90deg, #6B3F20, #9B6844, #D4A96A, #C4906A, #9B6844, #6B3F20)',
        }}
      >
        <div className="h-full flex items-center overflow-hidden">
          <div className="animate-marquee whitespace-nowrap inline-flex">
            {[...Array(8)].map((_, i) => (
              <span key={i} className="inline-flex items-center gap-4 px-10 text-[11px] tracking-[0.22em] uppercase font-semibold text-white/90">
                <span className="opacity-60">✦</span>
                <span>{promoHeader?.text}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Outer shell — padding animates to create floating pill ── */}
      <div
        className="transition-all duration-500 ease-in-out"
        style={{ padding: isScrolled ? '10px 20px 0' : '0' }}
      >
        <header
          className="relative transition-all duration-500 ease-in-out overflow-hidden"
          style={{
            borderRadius:    isScrolled ? 9999 : 0,
            background:      isScrolled ? 'rgba(10,6,4,0.90)' : 'rgba(253,248,243,0.94)',
            backdropFilter:  'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border:          isScrolled ? '1px solid rgba(196,144,106,0.28)' : 'none',
            borderBottom:    isScrolled ? undefined : '1px solid rgba(196,144,106,0.14)',
            boxShadow:       isScrolled
              ? '0 12px 48px -8px rgba(0,0,0,0.55), inset 0 1px 0 rgba(196,144,106,0.12)'
              : '0 1px 0 rgba(196,144,106,0.10)',
          }}
        >
          {/* Subtle top shimmer edge when scrolled */}
          {isScrolled && (
            <div className="absolute top-0 left-8 right-8 h-px pointer-events-none"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(196,144,106,0.45), transparent)' }} />
          )}

          {/* Bottom gold line when at top */}
          {!isScrolled && (
            <div className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
              style={{ background: 'linear-gradient(90deg, transparent 5%, rgba(196,144,106,0.30) 30%, rgba(212,169,106,0.45) 50%, rgba(196,144,106,0.30) 70%, transparent 95%)' }} />
          )}

          <div
            className="flex items-center justify-between transition-all duration-300"
            style={{ padding: isScrolled ? '0 20px' : '0 24px', height: isScrolled ? 52 : 70 }}
          >
            {/* ── Logo ── */}
            <Link to="/" className="flex items-center flex-shrink-0 z-10">
              <img
                src={logo}
                alt="Flenix Jewels - Premium Diamond Jewelry"
                className="w-auto transition-all duration-300"
                style={{
                  height:      isScrolled ? 36 : 50,
                  filter:      isScrolled ? 'brightness(1.15) contrast(0.95)' : 'none',
                }}
                loading="eager"
                decoding="async"
              />
            </Link>

            {/* ── Desktop nav ── */}
            <nav className="hidden md:flex items-center" role="navigation" aria-label="Main navigation">
              {navLinks.map(link => {
                const active  = isActive(link.path);
                const hovered = hoveredLink === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onMouseEnter={() => setHoveredLink(link.path)}
                    onMouseLeave={() => setHoveredLink(null)}
                    className="relative flex flex-col items-center transition-all duration-200"
                    style={{ padding: isScrolled ? '5px 11px' : '5px 13px' }}
                  >
                    {/* Hover / active pill background */}
                    <span
                      className="absolute inset-0 rounded-full transition-all duration-200"
                      style={{
                        background: active
                          ? isScrolled ? 'rgba(196,144,106,0.18)' : 'rgba(155,104,68,0.10)'
                          : hovered
                          ? isScrolled ? 'rgba(255,255,255,0.07)' : 'rgba(155,104,68,0.07)'
                          : 'transparent',
                      }}
                    />

                    <span
                      className="relative z-10 transition-all duration-200 whitespace-nowrap"
                      style={{
                        fontSize:      isScrolled ? 11.5 : 12.5,
                        fontWeight:    600,
                        letterSpacing: '0.07em',
                        textTransform: 'uppercase',
                        color: active
                          ? '#C4906A'
                          : isScrolled
                          ? hovered ? '#DEB48A' : 'rgba(255,255,255,0.62)'
                          : hovered ? '#9B6844' : '#5a4535',
                      }}
                    >
                      {link.name}
                    </span>

                    {/* Active dot indicator */}
                    <span
                      className="relative z-10 rounded-full transition-all duration-300"
                      style={{
                        width:      active ? 16 : 0,
                        height:     3,
                        marginTop:  2,
                        background: 'linear-gradient(90deg, #9B6844, #D4A96A)',
                        opacity:    active ? 1 : 0,
                        borderRadius: 99,
                      }}
                    />
                  </Link>
                );
              })}
            </nav>

            {/* ── Right controls ── */}
            <div className="hidden md:flex items-center gap-2.5">

              {/* WhatsApp Enquire CTA */}
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-full font-bold uppercase transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg"
                style={{
                  padding:     '7px 18px',
                  fontSize:    11,
                  letterSpacing: '0.09em',
                  background:  'linear-gradient(135deg, #9B6844 0%, #C4906A 60%, #D4A96A 100%)',
                  color:       '#fff',
                  boxShadow:   '0 4px 18px -4px rgba(155,104,68,0.55)',
                }}
              >
                <MessageCircle className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="hidden lg:inline">Enquire</span>
              </a>

              {/* Theme toggle */}
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
                style={{
                  width:      36,
                  height:     36,
                  background: isScrolled ? 'rgba(255,255,255,0.07)' : 'rgba(155,104,68,0.08)',
                  border:     `1px solid ${isScrolled ? 'rgba(196,144,106,0.22)' : 'rgba(196,144,106,0.20)'}`,
                }}
                aria-label="Toggle theme"
              >
                {theme === 'dark'
                  ? <Sun  className="h-4 w-4" style={{ color: '#DEB48A' }} />
                  : <Moon className="h-4 w-4" style={{ color: isScrolled ? '#DEB48A' : '#9B6844' }} />
                }
              </button>
            </div>

            {/* ── Mobile animated hamburger ── */}
            <button
              onClick={() => setIsMenuOpen(v => !v)}
              className="md:hidden flex items-center justify-center rounded-full transition-all duration-200 active:scale-90"
              style={{
                width:      40,
                height:     40,
                background: isScrolled ? 'rgba(255,255,255,0.08)' : 'rgba(155,104,68,0.08)',
                border:     `1px solid ${isScrolled ? 'rgba(196,144,106,0.22)' : 'rgba(196,144,106,0.22)'}`,
              }}
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              <div className="relative w-[18px] h-[14px]">
                <span className={`absolute left-0 right-0 h-[1.5px] rounded-full transition-all duration-300 ${isMenuOpen ? 'top-[6px] rotate-45' : 'top-0'}`}
                  style={{ background: isScrolled ? '#DEB48A' : '#9B6844' }} />
                <span className={`absolute left-0 right-0 top-[6px] h-[1.5px] rounded-full transition-all duration-200 ${isMenuOpen ? 'opacity-0 scale-x-0' : 'opacity-100'}`}
                  style={{ background: isScrolled ? '#DEB48A' : '#9B6844' }} />
                <span className={`absolute left-0 right-0 h-[1.5px] rounded-full transition-all duration-300 ${isMenuOpen ? 'top-[6px] -rotate-45' : 'top-[12px]'}`}
                  style={{ background: isScrolled ? '#DEB48A' : '#9B6844' }} />
              </div>
            </button>
          </div>
        </header>
      </div>

      {/* ════════════════════════════════════════════════════════════
          MOBILE DRAWER
      ════════════════════════════════════════════════════════════ */}

      {/* Backdrop */}
      <div
        onClick={() => setIsMenuOpen(false)}
        className="md:hidden fixed inset-0 z-40 transition-all duration-400"
        style={{
          background:     'rgba(6,3,2,0.72)',
          backdropFilter: isMenuOpen ? 'blur(6px)' : 'blur(0px)',
          opacity:        isMenuOpen ? 1 : 0,
          pointerEvents:  isMenuOpen ? 'auto' : 'none',
        }}
      />

      {/* Drawer panel */}
      <div
        className="md:hidden fixed top-0 right-0 bottom-0 flex flex-col z-50 transition-all duration-500"
        style={{
          width:     '78vw',
          maxWidth:  320,
          transform: isMenuOpen ? 'translateX(0)' : 'translateX(102%)',
          background:'linear-gradient(170deg, #0d0806 0%, #1c1008 60%, #140c06 100%)',
          borderLeft:'1px solid rgba(196,144,106,0.18)',
          boxShadow: '-24px 0 80px rgba(0,0,0,0.6)',
        }}
      >
        {/* Top shimmer */}
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(196,144,106,0.5), transparent)' }} />

        {/* Header row */}
        <div className="flex items-center justify-between px-6 pt-6 pb-5"
          style={{ borderBottom: '1px solid rgba(196,144,106,0.10)' }}>
          <img src={logo} alt="Flenix Jewels" className="h-9 w-auto" style={{ filter: 'brightness(1.2) saturate(0.8)' }} />
          <button
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center justify-center rounded-full transition-all hover:scale-110"
            style={{ width: 34, height: 34, background: 'rgba(196,144,106,0.10)', border: '1px solid rgba(196,144,106,0.22)' }}
          >
            <X className="h-3.5 w-3.5" style={{ color: '#C4906A' }} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-0.5" role="navigation" aria-label="Mobile navigation">
          {/* Small label */}
          <p className="text-[9px] tracking-[0.3em] uppercase font-semibold px-3 pb-3" style={{ color: 'rgba(196,144,106,0.45)' }}>
            Navigation
          </p>

          {navLinks.map((link, i) => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 py-3 px-3 rounded-xl transition-all duration-300"
                style={{
                  transform:       isMenuOpen ? 'translateX(0)' : 'translateX(28px)',
                  opacity:         isMenuOpen ? 1 : 0,
                  transitionDelay: isMenuOpen ? `${i * 38 + 60}ms` : '0ms',
                  background:      active ? 'rgba(196,144,106,0.10)' : 'transparent',
                }}
              >
                {/* Left accent */}
                <span
                  className="flex-shrink-0 rounded-full transition-all duration-300"
                  style={{
                    width:      active ? 3 : 3,
                    height:     active ? 20 : 8,
                    background: active
                      ? 'linear-gradient(180deg, #C4906A, #9B6844)'
                      : 'rgba(196,144,106,0.2)',
                  }}
                />
                <span
                  className="text-[13px] font-semibold tracking-[0.06em] uppercase transition-colors duration-200"
                  style={{ color: active ? '#DEB48A' : 'rgba(255,255,255,0.5)' }}
                >
                  {link.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom CTA zone */}
        <div className="px-4 py-5 flex flex-col gap-2.5"
          style={{ borderTop: '1px solid rgba(196,144,106,0.10)' }}>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 rounded-2xl font-bold text-[12px] tracking-[0.1em] uppercase transition-all hover:scale-[1.02] active:scale-95"
            style={{
              padding:    '13px',
              background: 'linear-gradient(135deg, #9B6844 0%, #C4906A 55%, #D4A96A 100%)',
              color:      '#fff',
              boxShadow:  '0 6px 24px -4px rgba(155,104,68,0.55)',
            }}
          >
            <MessageCircle className="h-4 w-4" />
            Enquire Now
          </a>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-full flex items-center justify-center gap-2 rounded-2xl text-[12px] font-medium tracking-wider uppercase transition-all hover:scale-[1.02]"
            style={{
              padding:    '11px',
              background: 'rgba(255,255,255,0.04)',
              border:     '1px solid rgba(196,144,106,0.18)',
              color:      'rgba(255,255,255,0.4)',
            }}
          >
            {theme === 'dark'
              ? <Sun  className="h-3.5 w-3.5" style={{ color: '#DEB48A' }} />
              : <Moon className="h-3.5 w-3.5" style={{ color: '#DEB48A' }} />
            }
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </div>

    </div>
  );
}
