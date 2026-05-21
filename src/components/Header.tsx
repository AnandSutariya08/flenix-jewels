import { useRef, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Moon, Sun, MessageCircle, ChevronDown, Gem } from 'lucide-react';
import { useTheme } from 'next-themes';
import logo from '@/assets/flenix-logo-horizontal.png';
import { PromoHeader as PromoHeaderType } from '@/lib/storage';
import { useAppSelector } from '@/store/hooks';
import { selectGlobalData } from '@/store/contentSlice';

interface HeaderProps {
  promoHeader?: PromoHeaderType | null;
}

const WHATSAPP_URL = 'https://wa.me/85251254000?text=Hi!%20I%20am%20interested%20in%20your%20jewelry%20collection.';

const DIAMOND_OPTIONS = [
  {
    value: 'real',
    label: 'Natural Diamonds',
    desc: 'Timeless. Natural. Forever.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6 flex-shrink-0">
        <polygon points="12,3 20,9 17,21 7,21 4,9"/>
        <line x1="4" y1="9" x2="20" y2="9" strokeOpacity="0.5"/>
        <line x1="12" y1="3" x2="7" y2="21" strokeOpacity="0.5"/>
        <line x1="12" y1="3" x2="17" y2="21" strokeOpacity="0.5"/>
      </svg>
    ),
  },
  {
    value: 'cvd',
    label: 'Lab Grown Diamonds',
    desc: 'Modern. Ethical. Brilliant.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6 flex-shrink-0">
        <polygon points="12,2 22,8 19,22 5,22 2,8"/>
        <line x1="2" y1="8" x2="22" y2="8" strokeOpacity="0.5"/>
        <line x1="12" y1="2" x2="5" y2="22" strokeOpacity="0.5"/>
        <line x1="12" y1="2" x2="19" y2="22" strokeOpacity="0.5"/>
      </svg>
    ),
  },
];

export default function Header({ promoHeader }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen]     = useState(false);
  const [isScrolled, setIsScrolled]     = useState(false);
  const [hoveredLink, setHoveredLink]   = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const location  = useLocation();
  const navigate  = useNavigate();
  const { categories } = useAppSelector(selectGlobalData);

  const hasPromo = false;

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 64);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setIsMenuOpen(false); setOpenDropdown(null); }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  const isActive = (path: string) => location.pathname === path;

  const showDd = (name: string) => {
    if (dropdownTimer.current) clearTimeout(dropdownTimer.current);
    setOpenDropdown(name);
  };
  const hideDd = () => {
    dropdownTimer.current = setTimeout(() => setOpenDropdown(null), 180);
  };
  const keepDd = () => {
    if (dropdownTimer.current) clearTimeout(dropdownTimer.current);
  };

  const headerHeight = isScrolled ? 84 : 70;

  const navLinks = [
    { name: 'Home',         path: '/',            dropdown: null },
    { name: 'Jewellery',    path: '/categories',  dropdown: 'jewellery' },
    { name: 'Diamond',      path: '/diamond',     dropdown: 'diamond' },
    { name: 'Gallery',      path: '/gallery',     dropdown: null },
    { name: 'Blog',         path: '/blog',        dropdown: null },
    { name: 'Buying Guide', path: '/buying-guide',dropdown: null },
    { name: 'About',        path: '/about',       dropdown: null },
    { name: 'Contact',      path: '/contact',     dropdown: null },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50">

      {/* Promo bar */}
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

      {/* Outer shell */}
      <div
        className="relative transition-all duration-500 ease-in-out"
        style={{ padding: isScrolled ? '10px 10px 0' : '0' }}
      >
        <header
          className="relative transition-all duration-500 ease-in-out overflow-hidden"
          style={{
            borderRadius:         isScrolled ? 9999 : 0,
            background:           isScrolled
              ? (isDark ? 'rgba(14,8,4,0.62)' : 'rgba(255,252,248,0.78)')
              : (isDark ? 'rgba(12,7,3,0.78)' : 'rgba(253,248,243,0.94)'),
            backdropFilter:       isScrolled
              ? (isDark ? 'blur(48px) saturate(200%) brightness(0.85)' : 'blur(40px) saturate(180%)')
              : (isDark ? 'blur(28px) saturate(160%)' : 'blur(24px)'),
            WebkitBackdropFilter: isScrolled
              ? (isDark ? 'blur(48px) saturate(200%) brightness(0.85)' : 'blur(40px) saturate(180%)')
              : (isDark ? 'blur(28px) saturate(160%)' : 'blur(24px)'),
            border:          isScrolled ? `1px solid ${isDark ? 'rgba(196,144,106,0.32)' : 'rgba(155,104,68,0.18)'}` : 'none',
            borderBottom:    isScrolled ? undefined : `1px solid ${isDark ? 'rgba(196,144,106,0.16)' : 'rgba(196,144,106,0.14)'}`,
            boxShadow:       isScrolled
              ? '0 8px 32px -4px rgba(0,0,0,0.40), 0 2px 8px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,220,180,0.10), inset 0 -1px 0 rgba(196,144,106,0.08)'
              : (isDark ? '0 1px 0 rgba(196,144,106,0.10)' : '0 1px 0 rgba(155,104,68,0.06)'),
          }}
        >
          {isScrolled && (
            <div className="absolute top-0 left-8 right-8 h-px pointer-events-none"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(196,144,106,0.45), transparent)' }} />
          )}
          {!isScrolled && (
            <div className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
              style={{ background: 'linear-gradient(90deg, transparent 5%, rgba(196,144,106,0.30) 30%, rgba(212,169,106,0.45) 50%, rgba(196,144,106,0.30) 70%, transparent 95%)' }} />
          )}

          <div
            className="flex items-center justify-between transition-all duration-300"
            style={{ padding: isScrolled ? '0 22px' : '0 24px', height: isScrolled ? 64 : 70 }}
          >
            {/* Logo */}
            <Link to="/" className="flex items-center flex-shrink-0 z-10">
              <img
                src={logo}
                alt="Flenix Jewels Ltd - Premium Diamond Jewelry"
                className="w-auto transition-all duration-300"
                style={{ height: isScrolled ? 42 : 50 }}
                loading="eager" decoding="async"
              />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center" role="navigation" aria-label="Main navigation">
              <div
                className="flex items-center gap-1 rounded-full px-2 py-1"
                style={{
                  background: isScrolled
                    ? (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(155,104,68,0.05)')
                    : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.60)'),
                  border: `1px solid ${isScrolled
                    ? (isDark ? 'rgba(196,144,106,0.22)' : 'rgba(155,104,68,0.16)')
                    : (isDark ? 'rgba(196,144,106,0.18)' : 'rgba(196,144,106,0.18)')}`,
                  boxShadow: isScrolled
                    ? 'inset 0 1px 0 rgba(255,255,255,0.06)'
                    : (isDark ? '0 8px 26px -20px rgba(0,0,0,0.55)' : '0 6px 22px -18px rgba(0,0,0,0.20)'),
                  backdropFilter: 'blur(14px)',
                  WebkitBackdropFilter: 'blur(14px)',
                }}
              >
                {navLinks.map((link) => {
                  const active  = isActive(link.path);
                  const hovered = hoveredLink === link.path;
                  const ddOpen  = openDropdown === link.dropdown;

                  const linkEl = (
                    <Link
                      key={link.path}
                      to={link.path}
                      onMouseEnter={() => { setHoveredLink(link.path); if (link.dropdown) showDd(link.dropdown); else hideDd(); }}
                      onMouseLeave={() => { setHoveredLink(null); if (link.dropdown) hideDd(); }}
                      onClick={() => setOpenDropdown(null)}
                      className="group relative flex items-center justify-center gap-1 rounded-full transition-all duration-200"
                      style={{
                        padding:   isScrolled ? '9px 14px' : '9px 15px',
                        transform: hovered ? 'translateY(-0.5px)' : 'translateY(0)',
                        background: ddOpen
                          ? (isDark ? 'rgba(196,144,106,0.12)' : 'rgba(155,104,68,0.10)')
                          : 'transparent',
                        border: '1px solid transparent',
                      }}
                    >
                      <span
                        className="absolute inset-0 rounded-full transition-opacity duration-200"
                        style={{
                          opacity: !active && hovered && !ddOpen ? 1 : 0,
                          background: isScrolled
                            ? (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(155,104,68,0.06)')
                            : (isDark ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, rgba(196,144,106,0.10) 0%, rgba(212,169,106,0.10) 100%)'),
                          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.10)',
                        }}
                        aria-hidden="true"
                      />
                      <span
                        className="relative z-10 whitespace-nowrap transition-all duration-200"
                        style={{
                          fontSize: isScrolled ? 11.5 : 12,
                          fontWeight: active ? 800 : 700,
                          letterSpacing: '0.16em',
                          textTransform: 'uppercase',
                          color: active
                            ? (isDark ? '#FFD99A' : '#9B6844')
                            : isScrolled
                            ? (isDark ? (hovered ? '#F0C890' : 'rgba(255,255,255,0.86)') : (hovered ? '#9B6844' : '#3b2a1e'))
                            : hovered ? '#9B6844' : (isDark ? 'rgba(255,255,255,0.82)' : '#5a4535'),
                        }}
                      >
                        {link.name}
                      </span>
                      {link.dropdown && (
                        <ChevronDown
                          className="relative z-10 transition-transform duration-200 flex-shrink-0"
                          style={{
                            width: 10, height: 10,
                            transform: ddOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                            color: active ? (isDark ? '#FFD99A' : '#9B6844') : 'currentColor',
                            opacity: 0.6,
                          }}
                        />
                      )}
                      <span
                        className="absolute left-3 right-3 bottom-1 h-0.5 rounded-full transition-all duration-300"
                        style={{
                          opacity: active ? 1 : hovered ? 0.55 : 0,
                          transform: active || hovered ? 'scaleX(1)' : 'scaleX(0.7)',
                          background: active
                            ? 'linear-gradient(90deg, transparent, rgba(212,169,106,0.98), transparent)'
                            : 'linear-gradient(90deg, transparent, rgba(196,144,106,0.85), transparent)',
                        }}
                      />
                    </Link>
                  );

                  return linkEl;
                })}
              </div>
            </nav>

            {/* Right controls */}
            <div className="hidden lg:flex items-center gap-2.5">
              <a
                href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-full font-bold uppercase transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg"
                style={{
                  padding: '7px 18px', fontSize: 11, letterSpacing: '0.09em',
                  background: 'linear-gradient(135deg, #9B6844 0%, #C4906A 60%, #D4A96A 100%)',
                  color: '#fff', boxShadow: '0 4px 18px -4px rgba(155,104,68,0.55)',
                }}
              >
                <MessageCircle className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="hidden lg:inline">Enquire</span>
              </a>
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
                style={{
                  width: 36, height: 36,
                  background: isScrolled ? 'rgba(255,255,255,0.07)' : 'rgba(155,104,68,0.08)',
                  border: `1px solid ${isScrolled ? 'rgba(196,144,106,0.22)' : 'rgba(196,144,106,0.20)'}`,
                }}
                aria-label="Toggle theme"
              >
                {theme === 'dark'
                  ? <Sun  className="h-4 w-4" style={{ color: '#DEB48A' }} />
                  : <Moon className="h-4 w-4" style={{ color: isScrolled ? '#DEB48A' : '#9B6844' }} />
                }
              </button>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsMenuOpen(v => !v)}
              className="lg:hidden flex items-center justify-center rounded-full transition-all duration-200 active:scale-90"
              style={{
                width: 40, height: 40,
                background: isScrolled ? 'rgba(255,255,255,0.08)' : 'rgba(155,104,68,0.08)',
                border: `1px solid ${isScrolled ? 'rgba(196,144,106,0.22)' : 'rgba(196,144,106,0.22)'}`,
              }}
              aria-label="Toggle menu" aria-expanded={isMenuOpen}
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

        {/* Mobile dropdown */}
        <div
          className="lg:hidden absolute left-0 right-0 z-50 transition-all duration-500"
          style={{
            top: '100%',
            transform: isMenuOpen ? 'translateY(0)' : 'translateY(-10px)',
            opacity: isMenuOpen ? 1 : 0,
            pointerEvents: isMenuOpen ? 'auto' : 'none',
          }}
        >
          <div
            className="mx-3 overflow-hidden rounded-3xl"
            style={{
              background: isDark
                ? 'linear-gradient(170deg, #0d0806 0%, #1c1008 60%, #140c06 100%)'
                : 'linear-gradient(170deg, rgba(255,252,248,0.96) 0%, rgba(253,248,242,0.96) 60%, rgba(248,241,233,0.96) 100%)',
              border: `1px solid ${isDark ? 'rgba(196,144,106,0.18)' : 'rgba(196,144,106,0.22)'}`,
              boxShadow: isDark ? '0 22px 80px rgba(0,0,0,0.55)' : '0 18px 60px rgba(0,0,0,0.16)',
            }}
          >
            <div className="h-px" style={{ background: isDark ? 'linear-gradient(90deg, transparent, rgba(196,144,106,0.5), transparent)' : 'linear-gradient(90deg, transparent, rgba(155,104,68,0.35), transparent)' }} />
            <nav className="px-3 py-3 flex flex-col gap-1" role="navigation" aria-label="Mobile navigation">
              {navLinks.map((link) => {
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className="relative flex items-center justify-center px-4 py-3 transition-all duration-200"
                  >
                    <span className="text-[12px] font-semibold tracking-[0.14em] uppercase" style={{ color: active ? (isDark ? '#DEB48A' : '#7A4A2A') : (isDark ? 'rgba(255,255,255,0.70)' : 'rgba(20,12,6,0.82)') }}>
                      {link.name}
                    </span>
                    <span className="absolute left-4 right-4 bottom-0 h-px" style={{ background: isDark ? 'linear-gradient(90deg, transparent, rgba(196,144,106,0.22), transparent)' : 'linear-gradient(90deg, transparent, rgba(155,104,68,0.18), transparent)' }} aria-hidden="true" />
                    <span className="absolute left-4 right-4 bottom-0.5 h-0.5 rounded-full transition-opacity duration-200" style={{ opacity: active ? 1 : 0, background: isDark ? 'linear-gradient(90deg, transparent, rgba(196,144,106,0.95), transparent)' : 'linear-gradient(90deg, transparent, rgba(155,104,68,0.85), transparent)' }} />
                  </Link>
                );
              })}
              {/* Mobile diamond sub-links */}
              <div className="px-4 pt-1 pb-2 flex gap-2">
                {DIAMOND_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { navigate(`/diamond?type=${opt.value}`); setIsMenuOpen(false); }}
                    className="flex-1 text-center text-[10px] font-bold tracking-wide py-2 rounded-xl border transition-all"
                    style={{
                      color: isDark ? 'rgba(196,144,106,0.9)' : '#9B6844',
                      borderColor: isDark ? 'rgba(196,144,106,0.22)' : 'rgba(196,144,106,0.30)',
                      background: isDark ? 'rgba(196,144,106,0.06)' : 'rgba(196,144,106,0.05)',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </nav>
            <div className="px-3 pb-3 pt-4 flex flex-col gap-2.5" style={{ borderTop: `1px solid ${isDark ? 'rgba(196,144,106,0.10)' : 'rgba(155,104,68,0.14)'}` }}>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 rounded-2xl font-bold text-[12px] tracking-[0.1em] uppercase transition-all hover:scale-[1.02] active:scale-95"
                style={{ padding: '13px', background: 'linear-gradient(135deg, #9B6844 0%, #C4906A 55%, #D4A96A 100%)', color: '#fff', boxShadow: '0 6px 24px -4px rgba(155,104,68,0.55)' }}>
                <MessageCircle className="h-4 w-4" />
                Enquire Now
              </a>
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="w-full flex items-center justify-center gap-2 rounded-2xl text-[12px] font-medium tracking-wider uppercase transition-all hover:scale-[1.02]"
                style={{ padding: '11px', background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(155,104,68,0.06)', border: `1px solid ${isDark ? 'rgba(196,144,106,0.18)' : 'rgba(196,144,106,0.22)'}`, color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(20,12,6,0.70)' }}>
                {theme === 'dark' ? <Sun className="h-3.5 w-3.5" style={{ color: '#DEB48A' }} /> : <Moon className="h-3.5 w-3.5" style={{ color: '#9B6844' }} />}
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Desktop dropdown panels ────────────────────────────────── */}
      <div
        className="hidden lg:block absolute left-0 right-0 z-40"
        style={{
          top: headerHeight,
          transform: openDropdown ? 'translateY(0)' : 'translateY(-8px)',
          opacity: openDropdown ? 1 : 0,
          pointerEvents: openDropdown ? 'auto' : 'none',
          transition: 'opacity 0.22s ease, transform 0.22s ease',
        }}
        onMouseEnter={keepDd}
        onMouseLeave={hideDd}
      >
        <div className="mx-4 mt-1 overflow-hidden rounded-2xl"
          style={{
            background: isDark
              ? 'linear-gradient(160deg, rgba(18,10,5,0.97) 0%, rgba(22,13,7,0.97) 100%)'
              : 'rgba(255,252,248,0.98)',
            border: `1px solid ${isDark ? 'rgba(196,144,106,0.20)' : 'rgba(196,144,106,0.28)'}`,
            boxShadow: isDark
              ? '0 16px 48px -8px rgba(0,0,0,0.60), 0 4px 12px rgba(0,0,0,0.30)'
              : '0 12px 40px -8px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.06)',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
          }}
        >
          {/* Gold top line */}
          <div className="h-px" style={{ background: isDark ? 'linear-gradient(90deg,transparent,rgba(196,144,106,0.55),transparent)' : 'linear-gradient(90deg,transparent,rgba(155,104,68,0.32),transparent)' }} />

          {/* JEWELLERY dropdown */}
          {openDropdown === 'jewellery' && (
            <div className="px-6 py-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[9px] font-black tracking-[0.28em] uppercase" style={{ color: isDark ? 'rgba(196,144,106,0.7)' : 'rgba(155,104,68,0.7)' }}>
                  Jewellery Categories
                </span>
                <div className="flex-1 h-px" style={{ background: isDark ? 'rgba(196,144,106,0.15)' : 'rgba(196,144,106,0.20)' }} />
              </div>
              <div className="flex items-stretch gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                {categories.length > 0 ? categories.map(cat => (
                  <Link
                    key={cat.id}
                    to={`/category/${cat.id}`}
                    onClick={() => setOpenDropdown(null)}
                    className="group flex-shrink-0 flex flex-col items-center gap-2 w-20 transition-all duration-200"
                  >
                    <div
                      className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 transition-all duration-200 group-hover:scale-105 group-hover:shadow-md"
                      style={{ border: `1px solid ${isDark ? 'rgba(196,144,106,0.18)' : 'rgba(196,144,106,0.22)'}` }}
                    >
                      {cat.image ? (
                        <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ background: isDark ? 'rgba(196,144,106,0.08)' : 'rgba(196,144,106,0.06)' }}>
                          <Gem className="h-5 w-5" style={{ color: isDark ? 'rgba(196,144,106,0.5)' : 'rgba(155,104,68,0.5)' }} />
                        </div>
                      )}
                    </div>
                    <span
                      className="text-[10px] font-semibold tracking-wide text-center leading-tight line-clamp-2 transition-colors duration-200 group-hover:text-amber-700"
                      style={{ color: isDark ? 'rgba(245,232,216,0.75)' : 'rgba(20,12,6,0.75)' }}
                    >
                      {cat.name}
                    </span>
                  </Link>
                )) : (
                  <Link
                    to="/categories"
                    onClick={() => setOpenDropdown(null)}
                    className="text-sm font-medium transition-colors hover:text-amber-700"
                    style={{ color: isDark ? 'rgba(245,232,216,0.75)' : 'rgba(20,12,6,0.75)' }}
                  >
                    View All Categories →
                  </Link>
                )}
                <Link
                  to="/categories"
                  onClick={() => setOpenDropdown(null)}
                  className="flex-shrink-0 flex flex-col items-center justify-center gap-1 w-20 rounded-xl border border-dashed transition-all duration-200 hover:border-amber-600/60 hover:text-amber-700 py-2"
                  style={{
                    borderColor: isDark ? 'rgba(196,144,106,0.20)' : 'rgba(196,144,106,0.25)',
                    color: isDark ? 'rgba(196,144,106,0.7)' : 'rgba(155,104,68,0.7)',
                  }}
                >
                  <span className="text-[18px]">→</span>
                  <span className="text-[9px] font-bold tracking-wide uppercase text-center leading-tight">View All</span>
                </Link>
              </div>
            </div>
          )}

          {/* DIAMOND dropdown */}
          {openDropdown === 'diamond' && (
            <div className="px-6 py-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[9px] font-black tracking-[0.28em] uppercase" style={{ color: isDark ? 'rgba(196,144,106,0.7)' : 'rgba(155,104,68,0.7)' }}>
                  Diamond Collection
                </span>
                <div className="flex-1 h-px" style={{ background: isDark ? 'rgba(196,144,106,0.15)' : 'rgba(196,144,106,0.20)' }} />
              </div>
              <div className="flex gap-3">
                {DIAMOND_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { navigate(`/diamond?type=${opt.value}`); setOpenDropdown(null); }}
                    className="group flex items-center gap-3 px-5 py-4 rounded-xl border transition-all duration-200 hover:scale-[1.02] text-left"
                    style={{
                      background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(196,144,106,0.04)',
                      borderColor: isDark ? 'rgba(196,144,106,0.18)' : 'rgba(196,144,106,0.22)',
                    }}
                  >
                    <span style={{ color: isDark ? 'rgba(196,144,106,0.8)' : 'rgba(155,104,68,0.8)' }}>
                      {opt.icon}
                    </span>
                    <div>
                      <div
                        className="text-sm font-bold tracking-wide mb-0.5 transition-colors duration-200 group-hover:text-amber-700"
                        style={{ color: isDark ? 'rgba(245,232,216,0.90)' : 'rgba(20,12,6,0.85)' }}
                      >
                        {opt.label}
                      </div>
                      <div
                        className="text-[10px] tracking-wide"
                        style={{ color: isDark ? 'rgba(245,232,216,0.45)' : 'rgba(20,12,6,0.45)' }}
                      >
                        {opt.desc}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Gold bottom line */}
          <div className="h-px" style={{ background: isDark ? 'linear-gradient(90deg,transparent,rgba(196,144,106,0.18),transparent)' : 'linear-gradient(90deg,transparent,rgba(196,144,106,0.14),transparent)' }} />
        </div>
      </div>

      {/* Backdrop */}
      <div
        onClick={() => setIsMenuOpen(false)}
        className="lg:hidden fixed inset-0 z-30 transition-all duration-400"
        style={{ background: 'rgba(6,3,2,0.72)', opacity: isMenuOpen ? 1 : 0, pointerEvents: isMenuOpen ? 'auto' : 'none' }}
      />
    </div>
  );
}
