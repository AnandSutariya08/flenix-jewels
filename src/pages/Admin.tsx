// src/pages/Admin.tsx
import { Suspense, lazy, useState, Component, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  LogOut,
  LayoutDashboard,
  Image,
  Tag,
  Package,
  Sparkles,
  Newspaper,
  Instagram,
  Phone,
  Building2,
  Users,
  Megaphone,
  MessageSquareQuote,
  Menu,
  X,
  Gem,
  ChevronRight,
  Eye,
  EyeOff,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

const AdminBanners = lazy(() => import('@/components/admin/AdminBanners'));
const AdminCategories = lazy(() => import('@/components/admin/AdminCategories'));
const AdminProducts = lazy(() => import('@/components/admin/AdminProducts'));
const AdminGallery = lazy(() => import('@/components/admin/AdminGallery'));
const AdminFeaturedCollection = lazy(() => import('@/components/admin/AdminFeaturedCollection'));
const AdminContact = lazy(() => import('@/components/admin/AdminContact'));
const AdminOffices = lazy(() => import('@/components/admin/AdminOffices'));
const AdminBlogs = lazy(() => import('@/components/admin/AdminBlogs'));
const AdminInstagram = lazy(() => import('@/components/admin/AdminInstagram'));
const AdminVisitors = lazy(() => import('@/components/admin/AdminVisitors'));
const AdminPromoHeader = lazy(() => import('@/components/admin/AdminPromoHeader'));
const AdminTestimonials = lazy(() => import('@/components/admin/AdminTestimonials'));

const SectionFallback = () => (
  <div className="flex items-center justify-center min-h-[360px]">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#C4906A', borderTopColor: 'transparent' }} />
      <span className="text-sm" style={{ color: '#9B6844' }}>Loading section…</span>
    </div>
  </div>
);

class SectionErrorBoundary extends Component<
  { children: ReactNode; sectionKey: string },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: ReactNode; sectionKey: string }) {
    super(props);
    this.state = { hasError: false, error: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error?.message || 'Unknown error' };
  }

  componentDidUpdate(prevProps: { sectionKey: string }) {
    if (prevProps.sectionKey !== this.props.sectionKey && this.state.hasError) {
      this.setState({ hasError: false, error: '' });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[360px] gap-4 text-center px-6">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#fee2e2' }}>
            <span className="text-xl">⚠️</span>
          </div>
          <div>
            <p className="font-semibold text-base" style={{ color: '#991b1b' }}>Failed to load this section</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">{this.state.error}</p>
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: '' })}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white"
            style={{ background: '#C4906A' }}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const NAV_ITEMS = [
  { key: 'promo',        label: 'Promo Header',  icon: Megaphone },
  { key: 'banners',      label: 'Banners',        icon: Image },
  { key: 'categories',   label: 'Categories',     icon: Tag },
  { key: 'products',     label: 'Products',       icon: Package },
  { key: 'gallery',      label: 'Gallery',        icon: Image },
  { key: 'featured',     label: 'Featured',       icon: Sparkles },
  { key: 'testimonials', label: 'Testimonials',   icon: MessageSquareQuote },
  { key: 'blogs',        label: 'Blogs',          icon: Newspaper },
  { key: 'instagram',    label: 'Instagram',      icon: Instagram },
  { key: 'contact',      label: 'Contact',        icon: Phone },
  { key: 'offices',      label: 'Offices',        icon: Building2 },
  { key: 'visitors',     label: 'Visitors',       icon: Users },
];

const SECTION_MAP: Record<string, () => ReactNode> = {
  promo:        () => <AdminPromoHeader />,
  banners:      () => <AdminBanners />,
  categories:   () => <AdminCategories />,
  products:     () => <AdminProducts />,
  gallery:      () => <AdminGallery />,
  featured:     () => <AdminFeaturedCollection />,
  testimonials: () => <AdminTestimonials />,
  blogs:        () => <AdminBlogs />,
  instagram:    () => <AdminInstagram />,
  contact:      () => <AdminContact />,
  offices:      () => <AdminOffices />,
  visitors:     () => <AdminVisitors />,
};

/* ── colour tokens (rose gold / espresso palette) ── */
const C = {
  espresso:      '#1C0D05',
  espressoDark:  '#130900',
  espressoMid:   '#2A1208',
  espressoLight: '#3D1C0E',
  roseGold:      '#C4906A',
  roseGoldDark:  '#9B6844',
  roseGoldLight: '#DEB48A',
  gold:          '#D4A96A',
  cream:         '#FDF5EC',
  creamDark:     '#F5E8D8',
  warmText:      '#4A2D18',
  mutedText:     '#9B8070',
};

/* ───────────────────────── Login page ───────────────────────── */
const LoginPage = ({ onLogin }: { onLogin: (u: string, p: string) => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${C.espressoDark} 0%, ${C.espressoMid} 50%, ${C.espressoDark} 100%)` }}>

      {/* Decorative glows */}
      <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${C.roseGold}22, transparent 70%)` }} />
      <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${C.gold}22, transparent 70%)` }} />

      {/* Floating diamond particles */}
      {[...Array(8)].map((_, i) => (
        <div key={i} className="absolute w-1.5 h-1.5 rotate-45 animate-float pointer-events-none"
          style={{ background: C.roseGoldLight, opacity: 0.25,
            left: `${10 + i * 11}%`, top: `${20 + (i % 4) * 20}%`,
            animationDelay: `${i * 0.4}s`, animationDuration: `${4 + i * 0.5}s` }} />
      ))}

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="rounded-2xl p-8 shadow-2xl"
          style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(24px)',
            border: `1px solid ${C.roseGold}33` }}>

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4 shadow-xl"
              style={{ background: `linear-gradient(135deg, ${C.roseGoldDark}, ${C.roseGold}, ${C.gold})` }}>
              <Gem className="h-10 w-10 text-white drop-shadow" />
            </div>
            <img src="/flenix-logo.png" alt="Flenix Jewels" className="h-12 w-auto mb-2 object-contain" />
            <p className="text-sm" style={{ color: C.roseGoldLight }}>Admin Control Panel</p>
          </div>

          <form onSubmit={e => { e.preventDefault(); onLogin(username, password); }} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-sm" style={{ color: C.creamDark }}>Username</Label>
              <Input id="username" type="text" value={username}
                onChange={e => setUsername(e.target.value)} placeholder="Enter username" required
                className="h-12 rounded-xl border-0 text-white placeholder:text-stone-500"
                style={{ background: 'rgba(255,255,255,0.08)' }} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm" style={{ color: C.creamDark }}>Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-12 rounded-xl border-0 text-white placeholder:text-stone-500 pr-12"
                  style={{ background: 'rgba(255,255,255,0.08)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                  style={{ background: 'rgba(0,0,0,0.18)', border: `1px solid ${C.roseGold}22` }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword
                    ? <EyeOff className="h-4 w-4" style={{ color: C.roseGoldLight }} />
                    : <Eye className="h-4 w-4" style={{ color: C.roseGoldLight }} />
                  }
                </button>
              </div>
            </div>
            <button type="submit"
              className="w-full h-12 rounded-xl text-white font-semibold text-base transition-all duration-200 hover:opacity-90 active:scale-[0.98] shadow-lg mt-2"
              style={{ background: `linear-gradient(135deg, ${C.roseGoldDark}, ${C.roseGold}, ${C.gold})` }}>
              Sign In to Dashboard
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

/* ── Sidebar nav item ── */
const NavItem = ({
  item, active, onClick, collapsed,
}: { item: typeof NAV_ITEMS[0]; active: boolean; onClick: () => void; collapsed: boolean }) => {
  const Icon = item.icon;
  return (
    <button onClick={onClick} title={collapsed ? item.label : undefined}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative"
      style={{
        background: active ? `linear-gradient(135deg, ${C.roseGoldDark}CC, ${C.roseGold}BB)` : 'transparent',
        color: active ? '#fff' : C.mutedText,
      }}
      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = `${C.roseGold}18`; }}
      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
    >
      {/* Active strip */}
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
          style={{ background: C.gold }} />
      )}
      <Icon className="flex-shrink-0 h-4 w-4 transition-colors"
        style={{ color: active ? '#fff' : C.roseGold }} />
      {!collapsed && <span className="truncate flex-1 text-left">{item.label}</span>}
      {!collapsed && active && <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" style={{ color: C.gold }} />}
    </button>
  );
};

/* ───────────────────────── Main Admin ───────────────────────── */
const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return localStorage.getItem('flenix_admin_authed') === '1';
    } catch {
      return false;
    }
  });
  const [activeSection, setActiveSection] = useState('banners');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshKey(k => k + 1);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleLogin = (username: string, password: string) => {
    if (username === 'Flenix' && password === 'Flenix123') {
      setIsAuthenticated(true);
      try { localStorage.setItem('flenix_admin_authed', '1'); } catch {}
      toast.success('Welcome back — Flenix Jewels Admin');
    } else {
      toast.error('Invalid credentials');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    try { localStorage.removeItem('flenix_admin_authed'); } catch {}
    navigate('/');
    toast('Logged out successfully');
  };

  if (!isAuthenticated) return <LoginPage onLogin={handleLogin} />;

  const activeItem = NAV_ITEMS.find(n => n.key === activeSection);
  const ActiveIcon = activeItem?.icon ?? LayoutDashboard;
  const activeLabel = activeItem?.label ?? '';

  return (
    <div className="min-h-screen flex" style={{ background: C.cream }}>

      {/* ── Sidebar ── */}
      <aside className="flex flex-col flex-shrink-0 h-screen sticky top-0 overflow-y-auto transition-all duration-300 shadow-2xl admin-sidebar-scroll"
        style={{ width: sidebarCollapsed ? '72px' : '240px',
          background: `linear-gradient(180deg, ${C.espressoDark} 0%, ${C.espressoMid} 50%, ${C.espressoDark} 100%)` }}>

        {/* Brand */}
        <div className={`flex items-center gap-3 px-4 py-5 border-b ${sidebarCollapsed ? 'justify-center' : ''}`}
          style={{ borderColor: `${C.roseGold}22` }}>
          <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center shadow-lg"
            style={{ background: `linear-gradient(135deg, ${C.roseGoldDark}, ${C.roseGold})` }}>
            <Gem className="h-5 w-5 text-white" />
          </div>
          {!sidebarCollapsed && (
            <div className="overflow-hidden">
              <p className="font-bold text-sm leading-tight tracking-wide" style={{ color: C.roseGoldLight }}>FLENIX JEWELS</p>
              <p className="text-[11px] leading-tight" style={{ color: C.mutedText }}>Admin Panel</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-0.5">
          {NAV_ITEMS.map(item => (
            <NavItem key={item.key} item={item} active={activeSection === item.key}
              onClick={() => setActiveSection(item.key)} collapsed={sidebarCollapsed} />
          ))}
        </nav>

        {/* Logout */}
        <div className="px-2 pb-4 pt-3 border-t" style={{ borderColor: `${C.roseGold}22` }}>
          <button onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${sidebarCollapsed ? 'justify-center' : ''}`}
            style={{ color: C.mutedText }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(180,60,40,0.15)'; (e.currentTarget as HTMLButtonElement).style.color = '#e88'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = C.mutedText; }}>
            <LogOut className="h-4 w-4 flex-shrink-0" />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="sticky top-0 z-40 flex items-center gap-4 px-6 py-4 shadow-sm"
          style={{ background: `rgba(253,245,236,0.90)`, backdropFilter: 'blur(12px)',
            borderBottom: `1px solid ${C.roseGold}30` }}>
          <button onClick={() => setSidebarCollapsed(v => !v)}
            className="p-2 rounded-lg transition-all"
            style={{ color: C.roseGoldDark }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = `${C.roseGold}18`; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}>
            {sidebarCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
          </button>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${C.roseGoldDark}, ${C.gold})` }}>
              <ActiveIcon className="h-3.5 w-3.5 text-white" />
            </div>
            <h2 className="text-lg font-semibold" style={{ color: C.warmText }}>{activeLabel}</h2>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={handleRefresh}
              title="Refresh section"
              className="p-2 rounded-lg transition-all"
              style={{ color: C.roseGoldDark }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = `${C.roseGold}18`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <span className="text-xs hidden sm:block" style={{ color: C.mutedText }}>Flenix Jewels Ltd.</span>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shadow"
              style={{ background: `linear-gradient(135deg, ${C.roseGoldDark}, ${C.gold})` }}>
              FJ
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto admin-main-scroll">
          {/* Decorative background pattern */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
            <div className="absolute top-[10%] right-[5%] w-80 h-80 rounded-full"
              style={{ background: `radial-gradient(circle, ${C.roseGold}0D, transparent 70%)` }} />
            <div className="absolute bottom-[15%] left-[8%] w-64 h-64 rounded-full"
              style={{ background: `radial-gradient(circle, ${C.gold}0D, transparent 70%)` }} />
          </div>

          <div className="relative z-10 rounded-2xl shadow-sm min-h-[600px] p-6 sm:p-8"
            style={{ background: 'rgba(255,252,248,0.92)', backdropFilter: 'blur(8px)',
              border: `1px solid ${C.roseGold}28` }}>
            <SectionErrorBoundary sectionKey={`${activeSection}-${refreshKey}`}>
              <Suspense fallback={<SectionFallback />} key={`${activeSection}-${refreshKey}`}>
                {SECTION_MAP[activeSection]?.()}
              </Suspense>
            </SectionErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Admin;
