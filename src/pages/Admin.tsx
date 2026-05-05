// src/pages/Admin.tsx
import { Suspense, lazy, useState, type ReactNode } from 'react';
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
  BookOpen,
  Menu,
  X,
  Gem,
  ChevronRight,
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
const AdminBuyingGuides = lazy(() => import('@/components/admin/AdminBuyingGuides'));

const SectionFallback = () => (
  <div className="flex items-center justify-center min-h-[360px]">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-4 border-violet-400 border-t-transparent rounded-full animate-spin" />
      <span className="text-sm text-slate-400">Loading section…</span>
    </div>
  </div>
);

const NAV_ITEMS = [
  { key: 'promo',         label: 'Promo Header',   icon: Megaphone },
  { key: 'banners',       label: 'Banners',         icon: Image },
  { key: 'categories',    label: 'Categories',      icon: Tag },
  { key: 'products',      label: 'Products',        icon: Package },
  { key: 'gallery',       label: 'Gallery',         icon: Image },
  { key: 'featured',      label: 'Featured',        icon: Sparkles },
  { key: 'testimonials',  label: 'Testimonials',    icon: MessageSquareQuote },
  { key: 'blogs',         label: 'Blogs',           icon: Newspaper },
  { key: 'instagram',     label: 'Instagram',       icon: Instagram },
  { key: 'contact',       label: 'Contact',         icon: Phone },
  { key: 'offices',       label: 'Offices',         icon: Building2 },
  { key: 'visitors',      label: 'Visitors',        icon: Users },
  { key: 'buying-guides', label: 'Buying Guides',   icon: BookOpen },
];

const SECTION_MAP: Record<string, ReactNode> = {
  promo:          <AdminPromoHeader />,
  banners:        <AdminBanners />,
  categories:     <AdminCategories />,
  products:       <AdminProducts />,
  gallery:        <AdminGallery />,
  featured:       <AdminFeaturedCollection />,
  testimonials:   <AdminTestimonials />,
  blogs:          <AdminBlogs />,
  instagram:      <AdminInstagram />,
  contact:        <AdminContact />,
  offices:        <AdminOffices />,
  visitors:       <AdminVisitors />,
  'buying-guides':<AdminBuyingGuides />,
};

/* ───────────────────────── Login page ───────────────────────── */
const LoginPage = ({ onLogin }: { onLogin: (u: string, p: string) => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>

      {/* Decorative blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #a78bfa, transparent 70%)' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #f472b6, transparent 70%)' }} />

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Glass card */}
        <div className="rounded-2xl p-8 shadow-2xl"
          style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.12)' }}>

          {/* Logo area */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}>
              <Gem className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-wide">FLENIX JEWELS</h1>
            <p className="text-slate-400 text-sm mt-1">Admin Control Panel</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-slate-300 text-sm">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter username"
                required
                className="h-12 text-white placeholder:text-slate-500 border-0 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.1)' }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-slate-300 text-sm">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="h-12 text-white placeholder:text-slate-500 border-0 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.1)' }}
              />
            </div>
            <button type="submit"
              className="w-full h-12 rounded-xl text-white font-semibold text-base mt-2 transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}>
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────── Sidebar nav item ─────────────────────── */
const NavItem = ({
  item,
  active,
  onClick,
  collapsed,
}: {
  item: typeof NAV_ITEMS[0];
  active: boolean;
  onClick: () => void;
  collapsed: boolean;
}) => {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={`
        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
        transition-all duration-150 group relative
        ${active
          ? 'text-white shadow-md'
          : 'text-slate-400 hover:text-white hover:bg-white/10'
        }
      `}
      style={active ? { background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)' } : {}}
    >
      {/* Active left accent strip */}
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-pink-400" />
      )}
      <Icon className={`flex-shrink-0 h-4 w-4 ${active ? 'text-white' : 'text-slate-400 group-hover:text-violet-400'} transition-colors`} />
      {!collapsed && (
        <span className="truncate flex-1 text-left">{item.label}</span>
      )}
      {!collapsed && active && (
        <ChevronRight className="h-3.5 w-3.5 text-pink-300 flex-shrink-0" />
      )}
    </button>
  );
};

/* ───────────────────────── Main Admin ───────────────────────── */
const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeSection, setActiveSection] = useState('banners');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (username: string, password: string) => {
    if (username === 'StarLala' && password === 'Panchkutir32') {
      setIsAuthenticated(true);
      toast.success('Welcome back, Flenix Jewels Admin!');
    } else {
      toast.error('Invalid credentials');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    navigate('/');
    toast('Logged out successfully');
  };

  if (!isAuthenticated) return <LoginPage onLogin={handleLogin} />;

  const activeLabel = NAV_ITEMS.find(n => n.key === activeSection)?.label ?? '';
  const ActiveIcon = NAV_ITEMS.find(n => n.key === activeSection)?.icon ?? LayoutDashboard;

  return (
    <div className="min-h-screen flex" style={{ background: '#f1f0fb' }}>

      {/* ── Sidebar ── */}
      <aside
        className="flex flex-col flex-shrink-0 h-screen sticky top-0 overflow-y-auto transition-all duration-300 shadow-2xl"
        style={{
          width: sidebarCollapsed ? '72px' : '240px',
          background: 'linear-gradient(180deg, #1e1b4b 0%, #2d1b69 50%, #1e1b4b 100%)',
        }}
      >
        {/* Brand */}
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 ${sidebarCollapsed ? 'justify-center' : ''}`}>
          <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}>
            <Gem className="h-5 w-5 text-white" />
          </div>
          {!sidebarCollapsed && (
            <div className="overflow-hidden">
              <p className="text-white font-bold text-sm leading-tight tracking-wide">FLENIX JEWELS</p>
              <p className="text-violet-400 text-[11px] leading-tight">Admin Panel</p>
            </div>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-2 py-4 space-y-0.5">
          {NAV_ITEMS.map(item => (
            <NavItem
              key={item.key}
              item={item}
              active={activeSection === item.key}
              onClick={() => setActiveSection(item.key)}
              collapsed={sidebarCollapsed}
            />
          ))}
        </nav>

        {/* Logout */}
        <div className="px-2 pb-4 border-t border-white/10 pt-3">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm font-medium ${sidebarCollapsed ? 'justify-center' : ''}`}
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top header */}
        <header className="sticky top-0 z-40 flex items-center gap-4 px-6 py-4 shadow-sm border-b border-white/60"
          style={{ background: 'rgba(241,240,251,0.85)', backdropFilter: 'blur(12px)' }}>
          <button
            onClick={() => setSidebarCollapsed(v => !v)}
            className="p-2 rounded-lg text-slate-500 hover:text-violet-700 hover:bg-violet-100 transition-all"
          >
            {sidebarCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
          </button>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}>
              <ActiveIcon className="h-3.5 w-3.5 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-slate-800">{activeLabel}</h2>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-slate-500 hidden sm:block">Flenix Jewels</span>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}>
              FJ
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="rounded-2xl shadow-sm border border-white/70 min-h-[600px] p-6 sm:p-8"
            style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)' }}>
            <Suspense fallback={<SectionFallback />}>
              {SECTION_MAP[activeSection]}
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Admin;
