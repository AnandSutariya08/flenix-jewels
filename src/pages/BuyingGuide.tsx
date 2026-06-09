import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BuyingGuide } from "@/lib/buyingGuides";
import { ArrowLeft, BookOpen, Search } from 'lucide-react';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from '@/components/Header';
import MiniHeader from '@/components/MiniHeader';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import PageHero from "@/components/PageHero";
import EmptyState from "@/components/EmptyState";
import { useAppSelector } from "@/store/hooks";
import { selectContentHydrated, selectContentStatus, selectGlobalData } from "@/store/contentSlice";
import { buildMetaDescriptionFromHtml } from "@/lib/seo";
import { useHeaderOffset } from "@/hooks/useHeaderOffset";
import hero3 from "@/assets/hero3.png";
import guide4cs from "@/assets/guide_4cs.png";
import guideLabGrown from "@/assets/guide_labgrown.png";
import guideSizing from "@/assets/guide_sizing.png";

type GuideSection = {
  id: string;
  title: string;
  intro?: string;
  bullets?: string[];
  subsections?: Array<{
    id: string;
    title: string;
    body?: string;
    bullets?: string[];
  }>;
  callout?: { title: string; body: string };
};

type StaticBuyingGuide = {
  id: string;
  slug: string;
  title: string;
  metaTitle?: string;
  metaDescription: string;
  image?: string;
  published: boolean;
  order?: number;
  sections: GuideSection[];
};

const STATIC_BUYING_GUIDES: StaticBuyingGuide[] = [
  {
    id: "static-4cs",
    slug: "diamond-4cs-made-simple",
    title: "Diamond 4Cs Made Simple",
    metaTitle: "Diamond 4Cs Made Simple - Buying Guide",
    metaDescription:
      "A clear, practical guide to Cut, Color, Clarity, and Carat—what to prioritize and how to balance quality with budget.",
    image: guide4cs,
    published: true,
    order: 1,
    sections: [
      {
        id: "quick-start",
        title: "Quick start",
        intro:
          "If you only remember one thing: prioritize Cut first, then balance Color/Clarity based on shape, metal, and your eye—not a chart.",
        bullets: [
          "Best value: excellent cut + “eye-clean” clarity + balanced color.",
          "Round shapes show color less than step cuts; yellow/rose gold hides warmth.",
          "Carat is size, not sparkle—cut controls brilliance.",
        ],
        callout: {
          title: "Rule of thumb",
          body: "Two diamonds with the same carat can look dramatically different depending on cut quality and measurements.",
        },
      },
      {
        id: "cut",
        title: "Cut (sparkle & beauty)",
        intro:
          "Cut is the biggest driver of brilliance, fire, and “life”. It’s also the easiest way to avoid a dull stone.",
        subsections: [
          {
            id: "cut-what-to-ask",
            title: "What to ask for",
            bullets: [
              "Certification (GIA/IGI) with proportions.",
              "A video in neutral lighting + close-up stills.",
              "Table/depth % and symmetry/polish grades.",
            ],
          },
          {
            id: "cut-common-mistakes",
            title: "Common mistakes",
            bullets: [
              "Buying by carat only (faces up small or looks glassy).",
              "Ignoring proportions for fancy shapes.",
              "Choosing extreme depth/table to “game” price.",
            ],
          },
        ],
      },
      {
        id: "color",
        title: "Color (warmth)",
        intro:
          "Color preference is personal. The goal is a stone that looks white in your setting and lighting—without overspending.",
        bullets: [
          "Platinum/white gold: consider staying a bit whiter.",
          "Yellow/rose gold: you can often go warmer and still look great.",
          "Step cuts (emerald/asscher) show color more than rounds.",
        ],
      },
      {
        id: "clarity",
        title: "Clarity (clean to the eye)",
        intro:
          "Clarity is about what you can see without magnification. “Eye-clean” is usually the sweet spot for value.",
        bullets: [
          "Ask: is it eye-clean at 6–8 inches in daylight?",
          "Avoid dark crystals under the table; look for clean center.",
          "Clarity needs differ by shape (step cuts show more).",
        ],
      },
      {
        id: "carat",
        title: "Carat (size)",
        intro:
          "Carat is weight. The same carat can face up larger or smaller depending on cut and shape.",
        bullets: [
          "Check millimeter measurements, not just carat.",
          "Consider “just-under” sizes (e.g., 0.90 vs 1.00) for value.",
          "Elongated shapes often look larger for the same carat.",
        ],
      },
      {
        id: "final-checklist",
        title: "Final checklist before you buy",
        bullets: [
          "Certificate + matching laser inscription (if available).",
          "Proportions + video reviewed.",
          "Return/resize policy clarified.",
          "Setting compatibility confirmed (prongs, depth, head size).",
        ],
      },
    ],
  },
  // {
  //   id: "static-lab-vs-natural",
  //   slug: "lab-grown-vs-natural-diamonds",
  //   title: "Lab‑Grown vs Natural Diamonds",
  //   metaTitle: "Lab‑Grown vs Natural Diamonds - Buying Guide",
  //   metaDescription:
  //     "Understand the real differences: origin, pricing, resale expectations, certification, and how to choose confidently.",
  //   image: guideLabGrown,
  //   published: true,
  //   order: 2,
  //   sections: [
  //     {
  //       id: "differences",
  //       title: "What’s the difference?",
  //       intro:
  //         "Chemically and optically, natural and lab-grown diamonds are the same material. The key differences are origin and market pricing.",
  //       bullets: [
  //         "Natural: formed in the earth over time.",
  //         "Lab-grown: created in controlled conditions (HPHT/CVD).",
  //         "Both should be certified (GIA/IGI) and graded similarly.",
  //       ],
  //     },
  //     {
  //       id: "pricing",
  //       title: "Pricing & value",
  //       bullets: [
  //         "Lab-grown typically costs less for the same specs.",
  //         "Natural pricing is influenced by rarity and supply.",
  //         "Resale expectations differ—buy for enjoyment first.",
  //       ],
  //       callout: {
  //         title: "Best way to decide",
  //         body: "Set a budget, then compare: do you want maximum size/specs (lab) or natural origin (natural)?",
  //       },
  //     },
  //     {
  //       id: "what-to-check",
  //       title: "What to check before purchase",
  //       bullets: [
  //         "Certification number + report details.",
  //         "Growth method disclosure (HPHT/CVD for lab-grown).",
  //         "Any treatments / post-growth processing noted on report.",
  //         "Video + light performance (cut quality still matters most).",
  //       ],
  //     },
  //   ],
  // },
  {
    id: "static-ring-sizing",
    slug: "ring-sizing-fit-guide",
    title: "Ring Sizing & Fit Guide",
    metaTitle: "Ring Sizing & Fit Guide - Buying Guide",
    metaDescription:
      "How to get the right size, avoid common fit issues, and plan for resizing—simple steps that prevent expensive mistakes.",
    image: guideSizing,
    published: true,
    order: 3,
    sections: [
      {
        id: "measure",
        title: "How to measure ring size",
        bullets: [
          "Use a jeweler’s sizer for the most accurate measurement.",
          "Measure at the end of the day (fingers swell).",
          "Avoid measuring when cold (fingers shrink).",
        ],
      },
      {
        id: "fit",
        title: "Fit factors that change your size",
        bullets: [
          "Wide bands fit tighter (may need +0.25 to +0.5).",
          "Knuckles: size for knuckle first, then add sizing beads if needed.",
          "Temperature and activity can change fit during the day.",
        ],
      },
      {
        id: "resizing",
        title: "Resizing notes",
        bullets: [
          "Most plain bands can be resized within a reasonable range.",
          "Intricate pavé/eternity styles may have limited resizing.",
          "Confirm resizing policy before purchase.",
        ],
      },
    ],
  },
];

const BuyingGuidePage = () => {
  const { categories, promoHeader, buyingGuides } = useAppSelector(selectGlobalData);
  const status = useAppSelector(selectContentStatus);
  const hydrated = useAppSelector(selectContentHydrated);
  const isReady = status === "succeeded" || hydrated;
  const navigate = useNavigate();
  const [guides, setGuides] = useState<BuyingGuide[]>([]);
  const [selected, setSelected] = useState<BuyingGuide | null>(null);
  const [query, setQuery] = useState("");
  const { slug } = useParams<{ slug?: string }>();
  const GOLD = "linear-gradient(135deg, #9B6844 0%, #C4906A 55%, #D4A96A 100%)";

  const promoHeight = 0;
  const paddingTop = useHeaderOffset();

  // Static-mode first: redesign the presentation before changing admin inputs.
  const STATIC_MODE = true;

  const staticGuides = useMemo(
    () => STATIC_BUYING_GUIDES.filter((g) => g.published).sort((a, b) => (a.order || 0) - (b.order || 0)),
    [],
  );

  const selectedStaticGuide = useMemo(() => {
    if (!STATIC_MODE || !slug) return null;
    return staticGuides.find((g) => g.slug === slug) || null;
  }, [STATIC_MODE, slug, staticGuides]);

  const publishedGuides = useMemo(
    () => buyingGuides.filter((g) => g.published).sort((a, b) => (a.order || 0) - (b.order || 0)),
    [buyingGuides]
  );

  const safeContent = useMemo(() => {
    if (!selected?.content) return "";
    try {
      const doc = new DOMParser().parseFromString(selected.content, "text/html");
      doc.querySelectorAll("style, link, script").forEach((el) => el.remove());
      doc.querySelectorAll("[style]").forEach((el) => el.removeAttribute("style"));
      doc.querySelectorAll("[face], [color], [size]").forEach((el) => {
        el.removeAttribute("face");
        el.removeAttribute("color");
        el.removeAttribute("size");
      });
      return doc.body.innerHTML;
    } catch {
      return selected.content;
    }
  }, [selected?.content]);

  useEffect(() => {
    if (STATIC_MODE) {
      setGuides(staticGuides as unknown as BuyingGuide[]);
      setSelected(null);
      return;
    }

    setGuides(publishedGuides);
    if (slug) {
      const found = publishedGuides.find((g) => g.slug === slug);
      setSelected(found || publishedGuides[0] || null);
    } else {
      setSelected(null);
    }
  }, [STATIC_MODE, publishedGuides, slug, staticGuides]);

  const guideList = STATIC_MODE ? (staticGuides as unknown as BuyingGuide[]) : guides;

  const filteredGuides = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return guideList;
    return guideList.filter((g) => (g.title || "").toLowerCase().includes(q));
  }, [guideList, query]);

  const { contentHtml, toc } = useMemo(() => {
    if (!safeContent) return { contentHtml: "", toc: [] as Array<{ id: string; text: string; level: 2 | 3 }> };

    try {
      const doc = new DOMParser().parseFromString(safeContent, "text/html");
      const headings = Array.from(doc.body.querySelectorAll("h2, h3")) as HTMLElement[];
      const seen = new Map<string, number>();
      const items: Array<{ id: string; text: string; level: 2 | 3 }> = [];

      const slugify = (value: string) =>
        value
          .toLowerCase()
          .trim()
          .replace(/['"]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");

      headings.forEach((h) => {
        const rawText = (h.textContent || "").trim();
        if (!rawText) return;

        const base = slugify(rawText) || "section";
        const next = (seen.get(base) || 0) + 1;
        seen.set(base, next);
        const id = next === 1 ? base : `${base}-${next}`;

        h.id = id;
        items.push({ id, text: rawText, level: h.tagName.toLowerCase() === "h3" ? 3 : 2 });
      });

      return { contentHtml: doc.body.innerHTML, toc: items };
    } catch {
      return { contentHtml: safeContent, toc: [] as Array<{ id: string; text: string; level: 2 | 3 }> };
    }
  }, [safeContent]);

  const guideForSEO = STATIC_MODE ? selectedStaticGuide : (selected as any);

  const guideUrl = `https://www.flenixjewels.com/buying-guide${slug ? `/${slug}` : ''}`;
  const guideDescription = guideForSEO
    ? (guideForSEO.metaDescription || (guideForSEO.content ? buildMetaDescriptionFromHtml(guideForSEO.content, 160) : 'Expert advice to help you make the perfect jewelry choice.'))
    : 'Expert advice to help you make the perfect jewelry choice.';

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      '@id': `${guideUrl}#howto`,
      name: guideForSEO?.title || 'Jewelry Buying Guide',
      description: guideDescription,
      url: guideUrl,
      mainEntityOfPage: guideUrl,
      image: {
        '@type': 'ImageObject',
        url: 'https://www.flenixjewels.com/og-image.jpg',
        width: 1200,
        height: 630,
      },
      author: {
        '@type': 'Organization',
        name: 'Flenix Jewels Ltd',
        url: 'https://www.flenixjewels.com',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Flenix Jewels Ltd',
        logo: { '@type': 'ImageObject', url: 'https://www.flenixjewels.com/flenix-logo.png', width: 200, height: 60 },
      },
      inLanguage: 'en-US',
      estimatedCost: { '@type': 'MonetaryAmount', currency: 'USD', value: '0' },
      tool: [
        { '@type': 'HowToTool', name: 'GIA Diamond Report' },
        { '@type': 'HowToTool', name: 'IGI Diamond Certificate' },
        { '@type': 'HowToTool', name: 'Ring Size Guide' },
      ],
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Understand the Diamond 4Cs',
          text: 'Learn about Cut (brilliance), Color (D–Z scale), Clarity (FL–I3), and Carat weight. Cut is the most important factor for sparkle.',
          url: 'https://www.flenixjewels.com/buying-guide',
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'Choose Natural or Lab-Grown Diamond',
          text: 'Natural diamonds are mined; lab-grown diamonds are created in a lab with identical properties. Lab-grown are typically 50–70% less expensive.',
          url: 'https://www.flenixjewels.com/buying-guide',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Select a Certification (GIA or IGI)',
          text: 'GIA is the gold standard for natural diamonds. IGI is widely trusted for lab-grown diamonds. Always insist on a grading certificate.',
          url: 'https://www.flenixjewels.com/buying-guide',
        },
        {
          '@type': 'HowToStep',
          position: 4,
          name: 'Pick a Metal and Setting Style',
          text: 'Choose from 14KT or 18KT yellow, white, or rose gold, or platinum. Consider solitaire, halo, three-stone, or pave settings based on style.',
          url: 'https://www.flenixjewels.com/buying-guide',
        },
        {
          '@type': 'HowToStep',
          position: 5,
          name: 'Confirm Ring Size and Order',
          text: 'Use our ring size guide to measure accurately. Contact Flenix Jewels via WhatsApp or the enquiry form to finalize your order.',
          url: 'https://www.flenixjewels.com/buying-guide',
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      '@id': 'https://www.flenixjewels.com/#education',
      name: 'Flenix Jewels Jewelry Education',
      description: 'Expert buying guides covering diamond 4Cs, lab-grown vs natural diamonds, ring styles, certification, and purchasing tips.',
      url: 'https://www.flenixjewels.com/buying-guide',
      provider: { '@id': 'https://www.flenixjewels.com/#organization' },
    },
  ];

  const defaultFaqItems = [
    {
      question: "What are the diamond 4Cs?",
      answer:
        "The 4Cs are Cut, Color, Clarity, and Carat weight — the universal grading system for diamonds developed by GIA. Cut is the most important as it determines a diamond's brilliance and sparkle.",
    },
    {
      question: "What is the difference between lab-grown and natural diamonds?",
      answer:
        "Natural diamonds are mined from the earth over billions of years. Lab-grown diamonds (CVD or HPHT) are created in a laboratory with identical chemical and optical properties. Both are certified real diamonds — lab-grown typically cost 50–70% less.",
    },
    {
      question: "Should I choose a GIA or IGI certified diamond?",
      answer:
        "GIA (Gemological Institute of America) is the gold standard for natural diamond grading. IGI (International Gemological Institute) is widely trusted for lab-grown diamonds. Both provide reliable, internationally recognized grading reports.",
    },
    {
      question: "What metal should I choose for an engagement ring?",
      answer:
        "18KT white gold gives a platinum-like appearance with warmth; 14KT is more durable for daily wear. Yellow gold is classic and timeless. Rose gold is romantic and trending. Platinum is the most durable and hypoallergenic.",
    },
    {
      question: "How do I find my ring size?",
      answer:
        "You can measure your finger with a strip of paper or string, or visit a local jeweler for sizing. Our team can also guide you — contact us on WhatsApp for a free sizing consultation.",
    },
    {
      question: "Can I request a custom jewelry design?",
      answer:
        "Yes. Flenix Jewels Ltd offers full bespoke design services. Contact us via WhatsApp or our enquiry form with your vision, budget, and preferred metal and diamond type.",
    },
  ];
  const faqItems = selected?.seoFaq && selected.seoFaq.length > 0 ? selected.seoFaq : defaultFaqItems;

  if (!STATIC_MODE && guides.length === 0 && !isReady) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <SEOHead
          title="Jewelry Buying Guide"
          description="Learn how to buy jewelry like a pro."
          keywords="jewelry buying guide, diamond buying guide, lab grown diamond guide, engagement ring guide, jewelry education"
          canonicalUrl="https://www.flenixjewels.com/buying-guide"
          breadcrumbs={[
            { name: "Home", url: "https://www.flenixjewels.com" },
            { name: "Buying Guide", url: "https://www.flenixjewels.com/buying-guide" },
          ]}
          faqItems={faqItems}
        />
        <Header promoHeader={promoHeader} />
        {/* <MiniHeader categories={categories} promoHeight={promoHeight} /> */}
        <main className="flex-1 container mx-auto px-4 py-12" style={{ paddingTop: `${paddingTop}px` }}>
          <div className="text-center mb-12">
            <div className="h-12 w-72 bg-muted rounded-md mx-auto animate-pulse mb-4" />
            <div className="h-5 w-96 bg-muted/70 rounded-md mx-auto animate-pulse" />
          </div>
          <div className="grid lg:grid-cols-4 gap-10">
            <div className="lg:col-span-1">
              <div className="h-80 bg-muted rounded-2xl animate-pulse" />
            </div>
            <div className="lg:col-span-3">
              <div className="h-[420px] bg-muted rounded-2xl animate-pulse" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!STATIC_MODE && guides.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <SEOHead
          title="Jewelry Buying Guide"
          description="Learn how to buy jewelry like a pro."
          keywords="jewelry buying guide, diamond buying guide, lab grown diamond guide, engagement ring guide, jewelry education"
          canonicalUrl="https://www.flenixjewels.com/buying-guide"
          breadcrumbs={[
            { name: "Home", url: "https://www.flenixjewels.com" },
            { name: "Buying Guide", url: "https://www.flenixjewels.com/buying-guide" },
          ]}
          faqItems={faqItems}
        />
        <Header promoHeader={promoHeader} />
        {/* <MiniHeader categories={categories} promoHeight={promoHeight} /> */}
        <main className="flex-1 flex items-center justify-center py-20" style={{ paddingTop: `${paddingTop}px` }}>
          <EmptyState
            icon={<BookOpen className="h-7 w-7" />}
            title="Buying Guides Coming Soon"
            description="We’re preparing clear, practical guides to help you choose with confidence."
            className="w-full"
          />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title={guideForSEO ? (guideForSEO.metaTitle || `${guideForSEO.title} - Buying Guide`) : 'Jewelry Buying Guide'}
        description={guideForSEO
          ? (guideForSEO.metaDescription || (guideForSEO.content ? buildMetaDescriptionFromHtml(guideForSEO.content, 160) : 'Comprehensive jewelry buying guides.'))
          : 'Comprehensive jewelry buying guides.'}
        keywords="jewelry buying guide, diamond 4cs"
        canonicalUrl={`https://www.flenixjewels.com/buying-guide${slug ? `/${slug}` : ''}`}
        structuredData={structuredData}
        breadcrumbs={[
          { name: "Home", url: "https://www.flenixjewels.com" },
          { name: "Buying Guide", url: "https://www.flenixjewels.com/buying-guide" },
          ...(guideForSEO ? [{ name: guideForSEO.title, url: `https://www.flenixjewels.com/buying-guide/${guideForSEO.slug}` }] : []),
        ]}
        faqItems={faqItems}
      />

      <Header promoHeader={promoHeader} />
      {/* <MiniHeader categories={categories} promoHeight={promoHeight} /> */}

      <main className="flex-1" style={{ paddingTop: `${paddingTop}px` }}>
        {/* Hero */}
        <PageHero
          backgroundImage={hero3}
          eyebrow={
            <span className="inline-flex items-center justify-center gap-2">
              <BookOpen className="h-3 w-3" />
              <span>Buying Guide</span>
            </span>
          }
          // title="Jewelry Buying Guide"
          title={
            <>
              Jewelry{" "}
              <span style={{ background: GOLD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Buying
              </span>
              {" "}Guide
            </>
          }
          subtitle="Clear, structured guides to help you choose diamonds, gemstones, and fine jewelry with confidence."
        />

        {!slug && (
          <section className="container mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 mb-8">
              <div className="flex-1">
                <h2 className="text-xl font-bold tracking-tight">All Guides</h2>
                <p className="text-sm text-muted-foreground">Browse by topic. New guides are added regularly.</p>
              </div>
              <div className="w-full md:w-[380px] relative">
                <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search guides…"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredGuides.map((guide) => {
                const blurb = guide.metaDescription || (guide.content ? buildMetaDescriptionFromHtml(guide.content, 140) : "");
                return (
                  <Link
                    key={guide.id}
                    to={`/buying-guide/${guide.slug}`}
                    className="group rounded-2xl border bg-card overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {guide.image ? (
                      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                        <OptimizedImage
                          noWrapper
                          src={guide.image}
                          alt={guide.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    ) : (
                      <div className="aspect-[16/9] bg-muted/60" />
                    )}
                    <div className="p-5">
                      <h3 className="font-bold text-lg leading-snug">{guide.title}</h3>
                      {blurb && <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-3">{blurb}</p>}
                      <div className="mt-4 text-sm font-semibold text-primary">Read guide →</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {slug && (
          <section className="container mx-auto px-4 py-10 md:py-12">
            {/* Mobile selector */}
            <div className="lg:hidden mb-6">
              <Select
                value={(STATIC_MODE ? selectedStaticGuide?.slug : selected?.slug) || ""}
                onValueChange={(value) => navigate(`/buying-guide/${value}`)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a guide" />
                </SelectTrigger>
                <SelectContent>
                  {(STATIC_MODE ? staticGuides : (guides as any)).map((g: any) => (
                    <SelectItem key={g.id} value={g.slug}>
                      {g.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left: guide list */}
              <aside className="hidden lg:block lg:col-span-3">
                <div className="sticky top-24 rounded-2xl border bg-card p-5">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <h2 className="text-sm font-bold tracking-[0.18em] uppercase text-muted-foreground">All Guides</h2>
                      <p className="text-xs text-muted-foreground mt-1">Pick a topic to continue reading.</p>
                    </div>
                  </div>
                  <div className="relative mb-4">
                    <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search…"
                      className="pl-9"
                    />
                  </div>
                  <nav className="space-y-1">
                    {filteredGuides.map((guide) => (
                      <Link
                        key={guide.id}
                        to={`/buying-guide/${guide.slug}`}
                        className={[
                          "block rounded-xl px-3 py-2.5 text-sm leading-snug border transition-colors",
                          (STATIC_MODE ? selectedStaticGuide?.id : selected?.id) === guide.id
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-transparent hover:bg-muted border-transparent",
                        ].join(" ")}
                      >
                        {guide.title}
                      </Link>
                    ))}
                  </nav>
                </div>
              </aside>

              {/* Main content */}
              <article className="lg:col-span-7">
                {STATIC_MODE ? (
                  selectedStaticGuide ? (
                    <div className="rounded-2xl border bg-card overflow-hidden">
                      {selectedStaticGuide.image && (
                        <div className="relative aspect-[21/9] bg-muted overflow-hidden">
                          <OptimizedImage
                            noWrapper
                            src={selectedStaticGuide.image}
                            alt={selectedStaticGuide.title}
                            className="h-full w-full object-cover"
                            loading="eager"
                            decoding="async"
                            fetchPriority="high"
                          />
                        </div>
                      )}
                      <div className="p-6 md:p-10">
                        <div className="flex flex-col gap-3">
                          <p className="text-xs font-semibold tracking-[0.22em] uppercase text-muted-foreground">Buying Guide</p>
                          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{selectedStaticGuide.title}</h2>
                          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                            {selectedStaticGuide.metaDescription}
                          </p>
                        </div>

                        <div className="mt-8 space-y-10">
                          {selectedStaticGuide.sections.map((section) => (
                            <section key={section.id} id={section.id} className="scroll-mt-28">
                              <h3 className="text-xl md:text-2xl font-bold tracking-tight">{section.title}</h3>
                              {section.intro && (
                                <p className="mt-2 text-sm md:text-base text-muted-foreground leading-relaxed">
                                  {section.intro}
                                </p>
                              )}

                              {section.callout && (
                                <div className="mt-5 rounded-2xl border bg-muted/40 p-5">
                                  <p className="text-sm font-bold">{section.callout.title}</p>
                                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{section.callout.body}</p>
                                </div>
                              )}

                              {section.bullets && section.bullets.length > 0 && (
                                <ul className="mt-5 space-y-2">
                                  {section.bullets.map((b, idx) => (
                                    <li key={idx} className="flex gap-3 text-sm md:text-base leading-relaxed">
                                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary/70 flex-shrink-0" aria-hidden="true" />
                                      <span>{b}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}

                              {section.subsections && section.subsections.length > 0 && (
                                <div className="mt-6 space-y-6">
                                  {section.subsections.map((sub) => (
                                    <div key={sub.id} id={sub.id} className="scroll-mt-28">
                                      <h4 className="text-base md:text-lg font-bold">{sub.title}</h4>
                                      {sub.body && (
                                        <p className="mt-1.5 text-sm md:text-base text-muted-foreground leading-relaxed">
                                          {sub.body}
                                        </p>
                                      )}
                                      {sub.bullets && sub.bullets.length > 0 && (
                                        <ul className="mt-3 space-y-2">
                                          {sub.bullets.map((bb, ii) => (
                                            <li key={ii} className="flex gap-3 text-sm md:text-base leading-relaxed">
                                              <span className="mt-2 h-1.5 w-1.5 rounded-full border border-primary/70 flex-shrink-0" aria-hidden="true" />
                                              <span>{bb}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </section>
                          ))}
                        </div>

                        <div className="mt-10 pt-8 border-t border-border flex items-center justify-between gap-4">
                          <Button asChild variant="outline">
                            <Link to="/buying-guide">
                              <ArrowLeft className="h-4 w-4 mr-2" />
                              Back to all guides
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border bg-card p-10 text-center">
                      <p className="text-muted-foreground">That guide was not found.</p>
                      <div className="mt-6">
                        <Button asChild variant="outline">
                          <Link to="/buying-guide">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to all guides
                          </Link>
                        </Button>
                      </div>
                    </div>
                  )
                ) : selected ? (
                  <div className="rounded-2xl border bg-card overflow-hidden">
                    {selected.image && (
                      <div className="relative aspect-[21/9] bg-muted overflow-hidden">
                        <OptimizedImage
                          noWrapper
                          src={selected.image}
                          alt={selected.title}
                          className="h-full w-full object-cover"
                          loading="eager"
                          decoding="async"
                          fetchPriority="high"
                        />
                      </div>
                    )}
                    <div className="p-6 md:p-10">
                      <div className="flex flex-col gap-3">
                        <p className="text-xs font-semibold tracking-[0.22em] uppercase text-muted-foreground">Buying Guide</p>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{selected.title}</h2>
                        {selected.metaDescription && (
                          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                            {selected.metaDescription}
                          </p>
                        )}
                      </div>

                      <div className="mt-8 prose prose-neutral dark:prose-invert prose-headings:tracking-tight prose-headings:font-bold prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-hr:my-10 max-w-none">
                        <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
                      </div>

                      <div className="mt-10 pt-8 border-t border-border flex items-center justify-between gap-4">
                        <Button asChild variant="outline">
                          <Link to="/buying-guide">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to all guides
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border bg-card p-10 text-center">
                    <p className="text-muted-foreground">Select a guide to start reading.</p>
                  </div>
                )}
              </article>

              {/* Right: in-page TOC */}
              <aside className="hidden xl:block xl:col-span-2">
                {STATIC_MODE ? (
                  selectedStaticGuide && selectedStaticGuide.sections.length > 0 ? (
                    <div className="sticky top-24 rounded-2xl border bg-card p-5">
                      <h3 className="text-sm font-bold tracking-[0.18em] uppercase text-muted-foreground mb-3">
                        On this page
                      </h3>
                      <nav aria-label="Table of contents">
                        <ul className="space-y-1">
                          {selectedStaticGuide.sections
                            .flatMap((section) => {
                              const base: Array<{ id: string; text: string; level: 2 | 3 }> = [
                                { id: section.id, text: section.title, level: 2 },
                              ];
                              const subs = (section.subsections || []).map((s) => ({
                                id: s.id,
                                text: s.title,
                                level: 3 as const,
                              }));
                              return [...base, ...subs];
                            })
                            .map((item) => (
                              <li
                                key={item.id}
                                className={[
                                  "flex items-start gap-2",
                                  item.level === 3 ? "pl-3" : "",
                                ].join(" ")}
                              >
                                {item.level === 3 ? (
                                  <span
                                    className="mt-2 h-1.5 w-1.5 rounded-full border border-muted-foreground/60 flex-shrink-0"
                                    aria-hidden="true"
                                  />
                                ) : (
                                  <span
                                    className="mt-2 h-1.5 w-1.5 rounded-full bg-muted-foreground/60 flex-shrink-0"
                                    aria-hidden="true"
                                  />
                                )}
                                <a
                                  href={`#${item.id}`}
                                  className={[
                                    "block text-sm text-foreground/80 hover:text-foreground transition-colors leading-snug",
                                    item.level === 3 ? "text-[13px]" : "",
                                  ].join(" ")}
                                >
                                  {item.text}
                                </a>
                              </li>
                            ))}
                        </ul>
                      </nav>
                    </div>
                  ) : null
                ) : (
                  toc.length > 0 && (
                    <div className="sticky top-24 rounded-2xl border bg-card p-5">
                      <h3 className="text-sm font-bold tracking-[0.18em] uppercase text-muted-foreground mb-3">
                        On this page
                      </h3>
                      <nav aria-label="Table of contents">
                        <ul className="space-y-1">
                          {toc.map((item) => (
                            <li
                              key={item.id}
                              className={[
                                "flex items-start gap-2",
                                item.level === 3 ? "pl-3" : "",
                              ].join(" ")}
                            >
                              {item.level === 3 ? (
                                <span
                                  className="mt-2 h-1.5 w-1.5 rounded-full border border-muted-foreground/60 flex-shrink-0"
                                  aria-hidden="true"
                                />
                              ) : (
                                <span
                                  className="mt-2 h-1.5 w-1.5 rounded-full bg-muted-foreground/60 flex-shrink-0"
                                  aria-hidden="true"
                                />
                              )}
                              <a
                                href={`#${item.id}`}
                                className={[
                                  "block text-sm text-foreground/80 hover:text-foreground transition-colors leading-snug",
                                  item.level === 3 ? "text-[13px]" : "",
                                ].join(" ")}
                              >
                                {item.text}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </nav>
                    </div>
                  ))}
              </aside>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default BuyingGuidePage;
