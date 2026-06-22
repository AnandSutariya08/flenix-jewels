import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  loadBlogs,
  selectBlogsLoaded,
  selectBlogsStatus,
  selectGlobalData,
} from '@/store/contentSlice';
import { useHeaderOffset } from '@/hooks/useHeaderOffset';
import { buildMetaDescriptionForBlog, buildMetaTitleForBlog } from '@/lib/seo';
import { OptimizedImage } from '@/components/ui/optimized-image';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock,
  Copy,
  Check,
  MessageCircle,
  Share2,
  BookOpen,
  Gem,
} from 'lucide-react';
import { toast } from 'sonner';
import { BlogPost } from '@/lib/storage';
import { cleanWhatsApp } from '@/lib/utils';

const GOLD = 'linear-gradient(135deg, #9B6844 0%, #C4906A 55%, #D4A96A 100%)';
const C = {
  roseGold: '#C4906A',
  roseGoldDark: '#9B6844',
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

function getExcerpt(content: string, maxLen = 110) {
  const plain = content.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  return plain.length > maxLen ? plain.slice(0, maxLen).trim() + '…' : plain;
}

function cleanContent(html: string) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  tempDiv.querySelectorAll('meta, title, link, script, style').forEach(el => el.remove());
  tempDiv.querySelectorAll('[data-meta], .meta-info, .seo-info').forEach(el => el.remove());
  return tempDiv.innerHTML;
}

const RelatedCard = ({ blog, onClick }: { blog: BlogPost; onClick: () => void }) => (
  <article
    className="group cursor-pointer flex flex-col h-full"
    onClick={onClick}
  >
    <div
      className="relative overflow-hidden rounded-2xl mb-4"
      style={{ aspectRatio: '4/3', boxShadow: '0 8px 32px -8px rgba(0,0,0,0.18)' }}
    >
      <OptimizedImage
        noWrapper
        src={blog.thumbnail || blog.image}
        alt={blog.title}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.07]"
        loading="lazy"
        decoding="async"
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(8,4,1,0.72) 0%, transparent 55%)' }}
      />
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ boxShadow: 'inset 0 0 0 2px rgba(196,144,106,0.55)' }}
      />
      <div className="absolute top-3 right-3">
        <span
          className="flex items-center gap-1 text-[9px] font-black tracking-wider px-2.5 py-1.5 rounded-full"
          style={{ background: 'rgba(0,0,0,0.52)', backdropFilter: 'blur(10px)', color: 'rgba(255,255,255,0.72)', border: '1px solid rgba(255,255,255,0.10)' }}
        >
          <Clock className="h-2.5 w-2.5" />
          {readingTime(blog.content)} min
        </span>
      </div>
      <div className="absolute bottom-3 left-3">
        <span className="text-[9px] font-black tracking-[0.2em] uppercase" style={{ color: 'rgba(196,144,106,0.85)', textShadow: '0 1px 6px rgba(0,0,0,0.9)' }}>
          {formatDate(blog.date)}
        </span>
      </div>
    </div>
    <div className="flex flex-col flex-1 px-1">
      <h3
        className="font-bold text-base leading-snug mb-2 line-clamp-2 transition-colors duration-200 group-hover:text-[#C4906A]"
        style={{ color: C.warmText }}
      >
        {blog.title}
      </h3>
      <p className="text-sm leading-relaxed line-clamp-2 mb-3 flex-1" style={{ color: C.mutedText }}>
        {getExcerpt(blog.content, 100)}
      </p>
      <div className="flex items-center gap-1.5" style={{ color: C.roseGoldDark }}>
        <span className="text-[11px] font-black tracking-[0.15em] uppercase">Read Article</span>
        <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-1" />
      </div>
    </div>
  </article>
);

const BlogDetail = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { blogs, promoHeader, contactInfo } = useAppSelector(selectGlobalData);
  const blogsLoaded = useAppSelector(selectBlogsLoaded);
  const blogsStatus = useAppSelector(selectBlogsStatus);
  const [copied, setCopied] = useState(false);
  const paddingTop = useHeaderOffset();

  useEffect(() => {
    if (blogsStatus === 'loading') return;
    if (!blogsLoaded && blogs.length === 0 && blogsStatus === 'idle') {
      dispatch(loadBlogs());
    }
  }, [blogs.length, blogsLoaded, blogsStatus, dispatch]);

  const blog = useMemo(() => blogs.find(b => b.id === id) || null, [blogs, id]);

  const relatedBlogs = useMemo(
    () => blogs.filter(b => b.id !== id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3),
    [blogs, id]
  );

  const blogUrl = typeof window !== 'undefined' ? `${window.location.origin}/blog/${id}` : `https://www.flenixjewels.com/blog/${id}`;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(blogUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleShare = async () => {
    if (navigator.share && blog) {
      try {
        await navigator.share({ title: blog.title, url: blogUrl });
      } catch {
        handleCopyUrl();
      }
    } else {
      handleCopyUrl();
    }
  };

  const handleWhatsApp = () => {
    const num = cleanWhatsApp(contactInfo?.whatsapp || '85251254000');
    const msg = encodeURIComponent(`Hi! I read your blog: "${blog?.title}" and I'd like to learn more.`);
    window.open(`https://wa.me/${num}?text=${msg}`, '_blank');
  };

  /* ── Loading ── */
  if (!blog && blogsStatus === 'loading') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header promoHeader={promoHeader} />
        <main className="flex-1 flex items-center justify-center" style={{ paddingTop }}>
          <div className="text-center py-32">
            <div className="w-10 h-10 mx-auto mb-6 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: C.roseGold, borderTopColor: 'transparent' }} />
            <p className="text-muted-foreground">Loading article…</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  /* ── Not found ── */
  if (!blog) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header promoHeader={promoHeader} />
        <main className="flex-1 flex items-center justify-center" style={{ paddingTop }}>
          <div className="text-center py-32">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-20" style={{ color: C.roseGold }} />
            <p className="text-lg font-semibold mb-2">Article not found</p>
            <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline" style={{ color: C.roseGold }}>
              <ArrowLeft className="h-4 w-4" /> Back to Blog
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const mins = readingTime(blog.content);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title={blog.metaTitle || buildMetaTitleForBlog(blog.title)}
        description={blog.metaDescription || buildMetaDescriptionForBlog(blog.content)}
        canonicalUrl={`https://www.flenixjewels.com/blog/${blog.id}`}
        ogType="article"
        ogImage={blog.image || undefined}
        breadcrumbs={[
          { name: 'Home', url: 'https://www.flenixjewels.com' },
          { name: 'Blog', url: 'https://www.flenixjewels.com/blog' },
          { name: blog.title, url: `https://www.flenixjewels.com/blog/${blog.id}` },
        ]}
        articleMeta={{
          publishedTime: blog.date,
          modifiedTime: blog.date,
          author: blog.author || 'Flenix Jewels Ltd',
          section: blog.category || 'Jewelry',
          tags: blog.tags || [],
        }}
      />

      <Header promoHeader={promoHeader} />

      <main className="flex-1" style={{ paddingTop }}>

        {/* ── Hero image ── */}
        <div className="relative w-full bg-black overflow-hidden" style={{ maxHeight: '55vh', minHeight: 280 }}>
          <OptimizedImage
            noWrapper
            src={blog.image}
            alt={blog.title}
            className="w-full h-full object-cover"
            style={{ maxHeight: '55vh', minHeight: 280 }}
            loading="eager"
            decoding="async"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.1) 100%)' }} />
          {/* Hero text */}
          <div className="absolute bottom-0 left-0 right-0 z-10 max-w-4xl mx-auto px-4 sm:px-6 pb-8 sm:pb-10">
            <div className="flex items-center gap-3 mb-3">
              <span
                className="text-[9px] font-black tracking-[0.28em] uppercase px-3 py-1.5 rounded-full"
                style={{ background: GOLD, color: '#fff' }}
              >
                {blog.category || 'Jewelry'}
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-bold" style={{ color: 'rgba(255,255,255,0.7)' }}>
                <Clock className="h-3 w-3" />{mins} min read
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>
              {blog.title}
            </h1>
          </div>
        </div>

        {/* ── Article body ── */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">

          {/* Meta bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-border/50">
            <div className="flex flex-wrap items-center gap-4">
              <Link to="/blog" className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase transition-colors hover:opacity-80" style={{ color: C.roseGold }}>
                <ArrowLeft className="h-3.5 w-3.5" /> All Articles
              </Link>
              <span className="w-px h-4 bg-border/60" />
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4" style={{ color: C.roseGold }} />
                <time dateTime={blog.date}>{formatDate(blog.date)}</time>
              </div>
              {blog.author && (
                <>
                  <span className="w-px h-4 bg-border/60" />
                  <span className="text-sm text-muted-foreground">By {blog.author}</span>
                </>
              )}
            </div>
            {/* Share buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyUrl}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-border/60 hover:border-primary/40 transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-border/60 hover:border-primary/40 transition-colors"
              >
                <Share2 className="h-3.5 w-3.5" /> Share
              </button>
            </div>
          </div>

          {/* Gold accent line */}
          <div className="flex items-center gap-2 mb-8">
            <div className="h-0.5 w-16 rounded-full" style={{ background: 'linear-gradient(90deg,#C4906A,#D4A96A)' }} />
            <div className="h-0.5 w-8 rounded-full" style={{ background: 'rgba(196,144,106,0.4)' }} />
            <div className="h-0.5 w-4 rounded-full" style={{ background: 'rgba(196,144,106,0.2)' }} />
          </div>

          {/* Article content */}
          <div className="blog-content">
            <div dangerouslySetInnerHTML={{ __html: cleanContent(blog.content) }} />
          </div>

          {/* WhatsApp CTA */}
          <div
            className="mt-12 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4"
            style={{ background: 'linear-gradient(135deg,rgba(196,144,106,0.1),rgba(212,169,106,0.07))', border: '1px solid rgba(196,144,106,0.25)' }}
          >
            <div>
              <p className="text-[10px] font-black tracking-[0.28em] uppercase mb-1" style={{ color: C.roseGold }}>Interested?</p>
              <p className="text-lg font-bold text-foreground">Have questions about this topic?</p>
              <p className="text-sm text-muted-foreground mt-1">Our jewelry experts are available on WhatsApp — ask anything.</p>
            </div>
            <button
              onClick={handleWhatsApp}
              className="flex-shrink-0 inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl font-bold text-sm text-white transition-all hover:scale-105 shadow-lg"
              style={{ background: '#25D366', boxShadow: '0 8px 24px -6px rgba(37,211,102,0.45)' }}
            >
              <MessageCircle className="h-5 w-5" />
              Chat on WhatsApp
            </button>
          </div>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {blog.tags.map(tag => (
                <span
                  key={tag}
                  className="text-[10px] font-bold tracking-wider uppercase px-3 py-1.5 rounded-full"
                  style={{ background: 'rgba(196,144,106,0.1)', color: C.roseGoldDark, border: '1px solid rgba(196,144,106,0.25)' }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── More articles ── */}
        {relatedBlogs.length > 0 && (
          <section className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-10 pb-16">
            <div className="h-px mb-12" style={{ background: 'linear-gradient(90deg, transparent 5%, rgba(196,144,106,0.3) 50%, transparent 95%)' }} />

            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-[10px] tracking-[0.32em] uppercase font-black mb-1" style={{ color: C.roseGold }}>Continue Reading</p>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">More Articles to Read</h2>
              </div>
              <Link
                to="/blog"
                className="hidden sm:flex items-center gap-2 text-xs font-black tracking-[0.15em] uppercase transition-all hover:gap-3"
                style={{ color: C.roseGoldDark }}
              >
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedBlogs.map(b => (
                <RelatedCard
                  key={b.id}
                  blog={b}
                  onClick={() => navigate(`/blog/${b.id}`)}
                />
              ))}
            </div>

            <div className="mt-10 text-center sm:hidden">
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-xs font-black tracking-[0.15em] uppercase"
                style={{ color: C.roseGoldDark }}
              >
                View All Articles <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default BlogDetail;
