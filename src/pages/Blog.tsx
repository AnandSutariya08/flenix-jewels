import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import MiniHeader from '@/components/MiniHeader';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import PageHero from "@/components/PageHero";
import BlogDialog from '@/components/BlogDialog';
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loadBlogs, loadGlobalData, selectBlogsLoaded, selectBlogsStatus, selectContentStatus, selectGlobalData } from "@/store/contentSlice";
import { useHeaderOffset } from "@/hooks/useHeaderOffset";
import { BlogPost } from '@/lib/storage';
import { buildMetaDescriptionForBlog, buildMetaTitleForBlog } from '@/lib/seo';
import { ArrowRight, Clock, CalendarDays, BookOpen, Gem, ChevronRight } from 'lucide-react';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { useTheme } from 'next-themes';
import hero4 from "@/assets/hero4.png";

const GOLD = 'linear-gradient(135deg, #9B6844 0%, #C4906A 55%, #D4A96A 100%)';
const C = {
  roseGold: '#C4906A',
  roseGoldDark: '#9B6844',
  gold: '#D4A96A',
  espresso: '#1C0D05',
  espressoDark: '#100804',
  cream: '#FDF8F2',
  creamDark: '#F2EAE0',
  mutedText: '#9B8070',
  warmText: '#4A2D18',
};

function readingTime(content: string) {
  const words = content.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function shortDate(dateStr: string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getExcerpt(content: string, maxLen = 110) {
  const plain = content.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  return plain.length > maxLen ? plain.slice(0, maxLen).trim() + '…' : plain;
}

/* ── Scroll-reveal hook (disabled — elements show instantly) ── */
function useReveal(_threshold = 0.1) {
  const ref = useRef<HTMLElement>(null);
  return { ref, visible: true };
}

/* ── Featured (hero) card ── */
const FeaturedCard = ({ blog, onClick }: { blog: BlogPost; onClick: () => void }) => {
  const { ref, visible } = useReveal(0.08);
  const mins = readingTime(blog.content);
  return (
    <article
      ref={ref as React.RefObject<HTMLElement>}
      className="relative group cursor-pointer overflow-hidden rounded-3xl"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(30px)',
        transition: 'opacity 0.8s ease, transform 0.8s ease',
        boxShadow: '0 20px 60px -12px rgba(0,0,0,0.28)',
      }}
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
        <OptimizedImage
          noWrapper
          src={blog.thumbnail || blog.image}
          alt={blog.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
          loading="eager"
          decoding="async"
        />
      </div>

      {/* Gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(10,5,2,0.96) 0%, rgba(10,5,2,0.55) 45%, rgba(10,5,2,0.12) 100%)' }}
      />

      {/* Gold border on hover */}
      <div
        className="absolute inset-0 rounded-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-400"
        style={{ boxShadow: 'inset 0 0 0 2px rgba(196,144,106,0.55)' }}
      />

      {/* Top badges */}
      <div className="absolute top-5 left-5 flex items-center gap-2 z-10">
        <span
          className="text-[9px] font-black tracking-[0.28em] uppercase px-3 py-1.5 rounded-full"
          style={{ background: GOLD, color: '#fff', boxShadow: '0 4px 12px -4px rgba(155,104,68,0.7)' }}
        >
          Featured
        </span>
      </div>
      <div className="absolute top-5 right-5 flex items-center gap-2 z-10">
        <span
          className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)', color: 'rgba(255,255,255,0.75)', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          <Clock className="h-3 w-3" />
          {mins} min read
        </span>
      </div>

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-6 md:p-8">
        <div className="flex items-center gap-2 mb-3">
          <CalendarDays className="h-3.5 w-3.5" style={{ color: C.roseGold }} />
          <time className="text-[11px] font-bold tracking-[0.18em] uppercase" style={{ color: C.roseGold }}>
            {formatDate(blog.date)}
          </time>
        </div>
        <h2
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 leading-[1.15]"
          style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}
        >
          {blog.title}
        </h2>
        <p className="text-sm leading-relaxed mb-5 max-w-xl line-clamp-2 hidden sm:block" style={{ color: 'rgba(255,255,255,0.55)' }}>
          {getExcerpt(blog.content, 160)}
        </p>
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-2 text-xs font-black tracking-[0.18em] uppercase px-5 py-2.5 rounded-full transition-all duration-300 group-hover:scale-105"
            style={{ background: GOLD, color: '#fff', boxShadow: '0 6px 20px -6px rgba(155,104,68,0.65)' }}
          >
            Read Article
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </article>
  );
};

/* ── Standard blog card ── */
const BlogCard = ({ blog, index, onClick }: { blog: BlogPost; index: number; onClick: () => void }) => {
  const { ref, visible } = useReveal(0.08);
  const mins = readingTime(blog.content);

  return (
    <article
      ref={ref as React.RefObject<HTMLElement>}
      className="group cursor-pointer flex flex-col h-full"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.65s ease ${Math.min(index * 80, 400)}ms, transform 0.65s ease ${Math.min(index * 80, 400)}ms`,
      }}
      onClick={onClick}
    >
      {/* Image */}
      <div
        className="relative overflow-hidden rounded-2xl mb-4"
        style={{ aspectRatio: '4/3', boxShadow: '0 8px 32px -8px rgba(0,0,0,0.18)' }}
      >
        <OptimizedImage
          noWrapper
          src={blog.thumbnail || blog.image}
          alt={blog.title}
          className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-[1.08]"
          loading="lazy"
          decoding="async"
        />
        {/* Scrim */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(8,4,1,0.75) 0%, transparent 55%)' }}
        />
        {/* Gold hover border */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-350"
          style={{ boxShadow: 'inset 0 0 0 2px rgba(196,144,106,0.55)' }}
        />
        {/* Reading time */}
        <div className="absolute top-3 right-3">
          <span
            className="flex items-center gap-1 text-[9px] font-black tracking-wider px-2.5 py-1.5 rounded-full"
            style={{ background: 'rgba(0,0,0,0.52)', backdropFilter: 'blur(10px)', color: 'rgba(255,255,255,0.72)', border: '1px solid rgba(255,255,255,0.10)' }}
          >
            <Clock className="h-2.5 w-2.5" />
            {mins} min
          </span>
        </div>
        {/* Date on image */}
        <div className="absolute bottom-3 left-3">
          <span className="text-[9px] font-black tracking-[0.2em] uppercase" style={{ color: 'rgba(196,144,106,0.85)', textShadow: '0 1px 6px rgba(0,0,0,0.9)' }}>
            {shortDate(blog.date)}
          </span>
        </div>
      </div>

      {/* Text */}
      <div className="flex flex-col flex-1 px-1">
        <h3
          className="font-bold text-base sm:text-lg leading-snug mb-2 line-clamp-2 transition-colors duration-200 group-hover:text-[#C4906A]"
          style={{ color: C.warmText }}
        >
          {blog.title}
        </h3>
        <p className="text-sm leading-relaxed line-clamp-2 mb-3 flex-1" style={{ color: C.mutedText }}>
          {getExcerpt(blog.content, 100)}
        </p>
        <div className="flex items-center gap-1.5" style={{ color: C.roseGoldDark }}>
          <span className="text-[11px] font-black tracking-[0.15em] uppercase">Read More</span>
          <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-1" />
        </div>
      </div>
    </article>
  );
};

/* ── Sidebar card (smaller, horizontal on some breakpoints) ── */
const SidebarCard = ({ blog, index, onClick }: { blog: BlogPost; index: number; onClick: () => void }) => {
  const { ref, visible } = useReveal(0.08);
  const mins = readingTime(blog.content);
  return (
    <article
      ref={ref as React.RefObject<HTMLElement>}
      className="group cursor-pointer flex gap-4 items-start"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(20px)',
        transition: `opacity 0.6s ease ${index * 100}ms, transform 0.6s ease ${index * 100}ms`,
        paddingBottom: '16px',
        borderBottom: `1px solid rgba(196,144,106,0.14)`,
      }}
      onClick={onClick}
    >
      <div
        className="relative overflow-hidden rounded-xl flex-shrink-0"
        style={{ width: 80, height: 80, boxShadow: '0 4px 16px -4px rgba(0,0,0,0.18)' }}
      >
        <OptimizedImage
          noWrapper
          src={blog.thumbnail || blog.image}
          alt={blog.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.12]"
          loading="lazy"
        />
        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ boxShadow: 'inset 0 0 0 2px rgba(196,144,106,0.55)' }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <Clock className="h-2.5 w-2.5 flex-shrink-0" style={{ color: C.roseGold }} />
          <span className="text-[9px] font-bold tracking-wider uppercase" style={{ color: C.roseGold }}>{mins} min</span>
        </div>
        <h4 className="text-sm font-bold leading-snug line-clamp-2 mb-1 transition-colors duration-200 group-hover:text-[#C4906A]" style={{ color: C.warmText }}>
          {blog.title}
        </h4>
        <time className="text-[10px]" style={{ color: C.mutedText }}>{shortDate(blog.date)}</time>
      </div>
    </article>
  );
};

const Blog = () => {
  const dispatch = useAppDispatch();
  const { categories, blogs, promoHeader, contactInfo } = useAppSelector(selectGlobalData);
  const status = useAppSelector(selectContentStatus);
  const blogsLoaded = useAppSelector(selectBlogsLoaded);
  const blogsStatus = useAppSelector(selectBlogsStatus);
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [requestedRefresh, setRequestedRefresh] = useState(false);
  const navigate = useNavigate();
  const { id: routeBlogId } = useParams<{ id: string }>();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const paddingTop = useHeaderOffset();

  const sortedBlogs = useMemo(
    () => [...blogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [blogs]
  );

  useEffect(() => {
    // Avoid repeated forced refresh when the blog collection is genuinely empty.
    if (!requestedRefresh && blogs.length === 0 && status === "idle") {
      dispatch(loadGlobalData());
      setRequestedRefresh(true);
    }
  }, [blogs.length, dispatch, requestedRefresh, status]);

  useEffect(() => {
    // Load once; an empty list is a valid state (show "Coming Soon").
    if (blogsStatus === "loading") return;
    if (!blogsLoaded && blogs.length === 0 && blogsStatus === "idle") dispatch(loadBlogs());
  }, [blogs.length, blogsLoaded, blogsStatus, dispatch]);

  useEffect(() => {
    const blogId = routeBlogId || searchParams.get('id');
    if (blogId && blogs.length > 0) {
      const blog = blogs.find(b => b.id === blogId);
      if (blog) { setSelectedBlog(blog); setIsDialogOpen(true); }
    }
  }, [routeBlogId, searchParams, blogs]);

  const handleBlogClick = (blog: BlogPost) => {
    setSelectedBlog(blog);
    setIsDialogOpen(true);
    navigate(`/blog/${blog.id}`);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSearchParams({});
    navigate("/blog");
  };

  /* SEO */
  const baseStructuredData = {
    '@context': 'https://schema.org', '@type': 'Blog',
    '@id': 'https://www.flenixjewels.com/blog#blog',
    name: 'Flenix Jewels Ltd Blog - Expert Jewelry Insights & Guides',
    description: 'Expert insights, trends, and comprehensive guides about luxury jewelry, diamonds, gemstones, and precious metals from Flenix Jewels Ltd.',
    url: 'https://www.flenixjewels.com/blog',
    mainEntityOfPage: 'https://www.flenixjewels.com/blog',
    publisher: { '@type': 'Organization', name: 'Flenix Jewels Ltd', logo: { '@type': 'ImageObject', url: 'https://www.flenixjewels.com/icon.png' } },
    blogPost: sortedBlogs.slice(0, 10).map(blog => ({
      '@type': 'BlogPosting', '@id': `https://www.flenixjewels.com/blog/${blog.id}#blogpost`,
      headline: blog.title, datePublished: blog.date, dateModified: blog.date,
      image: blog.image, description: blog.content.substring(0, 160),
      mainEntityOfPage: `https://www.flenixjewels.com/blog/${blog.id}`,
      author: { '@type': 'Organization', name: 'Flenix Jewels Ltd' }
    })),
  };
  const blogStructuredData = selectedBlog ? {
    '@context': 'https://schema.org', '@type': 'BlogPosting',
    '@id': `https://www.flenixjewels.com/blog/${selectedBlog.id}#blogpost`,
    headline: selectedBlog.title, datePublished: selectedBlog.date, dateModified: selectedBlog.date,
    image: selectedBlog.image, description: buildMetaDescriptionForBlog(selectedBlog.content),
    author: { '@type': 'Organization', name: 'Flenix Jewels Ltd' },
    mainEntityOfPage: `https://www.flenixjewels.com/blog/${selectedBlog.id}`,
  } : undefined;
  const structuredData = [baseStructuredData, ...(blogStructuredData ? [blogStructuredData] : [])];
  const seoTitle = selectedBlog
    ? (selectedBlog.metaTitle || buildMetaTitleForBlog(selectedBlog.title))
    : "Jewelry Blog - Diamond Tips, Engagement Ring Guides & Luxury Trends | Flenix Jewels Ltd";
  const seoDescription = selectedBlog
    ? (selectedBlog.metaDescription || buildMetaDescriptionForBlog(selectedBlog.content))
    : "Discover expert jewelry insights, diamond buying guides, engagement ring tips, gemstone education, and the latest luxury jewelry trends from Flenix Jewels Ltd experts.";
  const defaultFaqItems = [
    { question: "What topics do you cover in the Flenix Jewels Ltd blog?", answer: "We cover diamond buying guides, engagement ring tips, jewelry care, gemstone education, and luxury jewelry trends." },
    { question: "Are your blog guides suitable for natural and lab-grown diamonds?", answer: "Yes. Our guides explain both natural and lab-grown diamond options with practical buying advice." },
    { question: "Can I request a topic?", answer: "Yes. You can contact us to request specific jewelry or diamond topics." },
  ];
  const faqItems = selectedBlog?.seoFaq && selectedBlog.seoFaq.length > 0 ? selectedBlog.seoFaq : defaultFaqItems;

  /* Layout split */
  const [featured, ...rest] = sortedBlogs;
  const mainGrid = rest.slice(0, 6);   // up to 6 in main 3-col grid
  const sidebar = rest.slice(0, 4);    // up to 4 in sidebar (shown alongside featured on desktop)
  const remaining = rest.slice(6);     // anything beyond 6

  return (
    <div className="min-h-screen flex flex-col" style={{ background: isDark ? C.espressoDark : C.cream }}>
      <SEOHead
        title={seoTitle} description={seoDescription}
        keywords="jewelry blog, diamond buying guide, engagement ring tips, jewelry trends 2024, gemstone guide, diamond education, luxury jewelry tips"
        canonicalUrl={`https://www.flenixjewels.com/blog${selectedBlog ? `/${selectedBlog.id}` : ''}`}
        ogType={selectedBlog ? "article" : "website"}
        ogImage={selectedBlog?.image || undefined}
        structuredData={structuredData}
        breadcrumbs={[{ name: "Home", url: "https://www.flenixjewels.com" }, { name: "Blog", url: "https://www.flenixjewels.com/blog" }]}
        faqItems={faqItems}
        articleMeta={selectedBlog ? {
          publishedTime: selectedBlog.date,
          modifiedTime: selectedBlog.date,
          author: selectedBlog.author || "Flenix Jewels Ltd",
          section: selectedBlog.category || "Jewelry",
          tags: selectedBlog.tags || [],
        } : undefined}
      />
      <Header promoHeader={promoHeader} />
      {/* <MiniHeader categories={categories} promoHeight={promoHeight} /> */}

      <main className="flex-1" style={{ paddingTop: `${paddingTop}px` }}>

        {/* ── Hero ── */}
        <PageHero
          backgroundImage={hero4}
          eyebrow={
            <span className="inline-flex items-center justify-center gap-2">
              <BookOpen className="h-3 w-3" />
              <span>The Journal</span>
            </span>
          }
          title={
            <>
              Stories &amp;{" "}
              <span style={{ background: GOLD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Insights
              </span>
            </>
          }
          subtitle="Expert guides, diamond education, and timeless jewelry stories — crafted for those who appreciate true luxury."
        />

        {/* ── Content ── */}
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-10 py-12 md:py-16">

          {sortedBlogs.length === 0 ? (
            blogsStatus === "loading" ? (
              <div className="text-center py-32">
                <div className="w-10 h-10 mx-auto mb-6 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: C.roseGold, borderTopColor: 'transparent' }} />
                <h3 className="text-2xl font-bold mb-2" style={{ color: C.warmText }}>Loading Articles…</h3>
                <p style={{ color: C.mutedText }}>Fetching the latest posts.</p>
              </div>
            ) : (
              <div className="text-center py-32">
                <Gem className="h-16 w-16 mx-auto mb-6 opacity-20" style={{ color: C.roseGold }} />
                <h3 className="text-2xl font-bold mb-2" style={{ color: C.warmText }}>Coming Soon</h3>
                <p style={{ color: C.mutedText }}>We're writing exceptional content for you.</p>
              </div>
            )
          ) : (
            <>
              {/* ── Featured + Sidebar layout ── */}
              {featured && (
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px] gap-6 mb-14 md:mb-18">
                  {/* Featured article */}
                  <FeaturedCard blog={featured} onClick={() => handleBlogClick(featured)} />

                  {/* Sidebar — latest 4 (hidden on mobile, shown on lg+) */}
                  {sidebar.length > 0 && (
                    <aside className="hidden lg:flex flex-col justify-between gap-0 rounded-3xl p-6"
                      style={{ background: isDark ? 'rgba(255,255,255,0.03)' : '#fff', border: `1px solid rgba(196,144,106,0.15)`, boxShadow: '0 4px 32px -8px rgba(0,0,0,0.08)' }}>
                      <div className="flex items-center gap-2 mb-5">
                        <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, rgba(196,144,106,0.4), transparent)' }} />
                        <span className="text-[9px] font-black tracking-[0.32em] uppercase" style={{ color: C.roseGold }}>Latest Posts</span>
                      </div>
                      <div className="flex flex-col gap-4 flex-1">
                        {sidebar.map((blog, i) => (
                          <SidebarCard key={blog.id} blog={blog} index={i} onClick={() => handleBlogClick(blog)} />
                        ))}
                      </div>
                      {rest.length > 4 && (
                        <div className="mt-5 pt-4" style={{ borderTop: '1px solid rgba(196,144,106,0.12)' }}>
                          <p className="text-[10px] text-center font-bold tracking-[0.18em] uppercase" style={{ color: C.mutedText }}>
                            Scroll to see all {sortedBlogs.length} articles
                          </p>
                        </div>
                      )}
                    </aside>
                  )}
                </div>
              )}

              {/* ── Section divider ── */}
              {mainGrid.length > 0 && (
                <div className="flex items-center gap-4 mb-10">
                  <div className="flex items-center gap-3">
                    <Gem className="h-3.5 w-3.5 flex-shrink-0" style={{ color: C.roseGold }} />
                    <span className="text-[10px] font-black tracking-[0.32em] uppercase whitespace-nowrap" style={{ color: C.roseGold }}>All Articles</span>
                  </div>
                  <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, rgba(196,144,106,0.4), transparent)` }} />
                  <span className="text-[10px] font-black tracking-wider uppercase whitespace-nowrap" style={{ color: 'rgba(196,144,106,0.35)' }}>
                    {sortedBlogs.length} posts
                  </span>
                </div>
              )}

              {/* ── Main blog grid ── */}
              {mainGrid.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-14">
                  {mainGrid.map((blog, i) => (
                    <BlogCard key={blog.id} blog={blog} index={i} onClick={() => handleBlogClick(blog)} />
                  ))}
                </div>
              )}

              {/* ── Remaining posts (if many) ── */}
              {remaining.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-14">
                  {remaining.map((blog, i) => (
                    <BlogCard key={blog.id} blog={blog} index={i} onClick={() => handleBlogClick(blog)} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── Explore categories ── */}
          {categories.length > 0 && (
            <section className="mt-6">
              <div className="h-px mb-10" style={{ background: 'linear-gradient(90deg, transparent 5%, rgba(196,144,106,0.25) 50%, transparent 95%)' }} />

              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-[10px] tracking-[0.32em] uppercase font-black mb-1" style={{ color: C.roseGold }}>Browse</p>
                  <h2 className="text-2xl md:text-3xl font-bold" style={{ color: C.warmText }}>Explore Collections</h2>
                </div>
                <Link
                  to="/categories"
                  className="hidden sm:flex items-center gap-2 text-xs font-black tracking-[0.15em] uppercase transition-all duration-200 hover:gap-3"
                  style={{ color: C.roseGoldDark }}
                >
                  View All <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                {categories.slice(0, 6).map((category, i) => (
                  <Link
                    key={category.id}
                    to={`/category/${category.id}`}
                    className="group flex flex-col items-center text-center"
                  >
                    <div
                      className="w-full aspect-square rounded-2xl overflow-hidden mb-2.5 relative"
                      style={{ boxShadow: '0 6px 24px -6px rgba(0,0,0,0.14)', transition: 'box-shadow 0.3s ease' }}
                    >
                      <OptimizedImage
                        noWrapper
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.1]"
                        loading="lazy"
                        decoding="async"
                      />
                      <div
                        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ boxShadow: 'inset 0 0 0 2px rgba(196,144,106,0.6)' }}
                      />
                    </div>
                    <p
                      className="text-[11px] sm:text-xs font-bold leading-tight transition-colors duration-200 group-hover:text-[#C4906A]"
                      style={{ color: C.warmText }}
                    >
                      {category.name}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />

      <BlogDialog
        blog={selectedBlog}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        whatsappNumber={contactInfo?.whatsapp}
      />
    </div>
  );
};

export default Blog;
