import { Helmet } from "react-helmet-async";
import { SITE, buildKeywords } from "@/lib/seo";

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: "website" | "article" | "product";
  structuredData?: object | object[];
  faqItems?: Array<{ question: string; answer: string }>;
  breadcrumbs?: Array<{ name: string; url: string }>;
  articleMeta?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
    tags?: string[];
  };
  noIndex?: boolean;
}

const SEOHead = ({
  title,
  description,
  keywords,
  canonicalUrl,
  ogImage = SITE.ogImage,
  ogType = "website",
  structuredData,
  faqItems,
  breadcrumbs,
  articleMeta,
  noIndex = false,
}: SEOHeadProps) => {
  const siteName = SITE.name;
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;
  const baseUrl = SITE.url;
  const pageUrl = canonicalUrl || baseUrl;
  const metaKeywords = keywords || buildKeywords();
  const resolvedImage = ogImage.startsWith("http") ? ogImage : `${baseUrl}${ogImage}`;
  const today = new Date().toISOString().split("T")[0];

  // ── WebPage schema (page-specific) ───────────────────────────────────────────
  // NOTE: Organization, LocalBusiness, and WebSite global schemas live in
  // index.html so Googlebot can read them on first-wave (pre-JS) crawl without
  // duplication. Only page-scoped schemas are injected here.
  const webPageSchema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": ogType === "article" ? "BlogPosting" : "WebPage",
    "@id": `${pageUrl}#webpage`,
    name: fullTitle,
    description,
    url: pageUrl,
    inLanguage: "en-US",
    isPartOf: { "@id": `${baseUrl}/#website` },
    publisher: { "@id": `${baseUrl}/#organization` },
    dateModified: today,
  };
  if (breadcrumbs?.length) {
    webPageSchema.breadcrumb = { "@id": `${pageUrl}#breadcrumb` };
  }

  // ── BreadcrumbList schema ─────────────────────────────────────────────────────
  // breadcrumbs array must include all items starting with Home (position 1).
  // Do NOT add a hardcoded Home — that causes a duplicate Home error in Search Console.
  const breadcrumbSchema =
    breadcrumbs && breadcrumbs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "@id": `${pageUrl}#breadcrumb`,
          itemListElement: breadcrumbs.map((b, idx) => ({
            "@type": "ListItem",
            position: idx + 1,
            name: b.name,
            item: b.url,
          })),
        }
      : null;

  // ── FAQPage schema ────────────────────────────────────────────────────────────
  const faqSchema =
    faqItems && faqItems.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "@id": `${pageUrl}#faq`,
          mainEntity: faqItems.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }
      : null;

  // ── Assemble page-level schemas only ─────────────────────────────────────────
  const schemaList: object[] = [webPageSchema];
  if (breadcrumbSchema) schemaList.push(breadcrumbSchema);
  if (faqSchema) schemaList.push(faqSchema);
  if (structuredData) {
    if (Array.isArray(structuredData)) schemaList.push(...structuredData);
    else schemaList.push(structuredData);
  }

  return (
    <Helmet>
      {/* ── Primary ── */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={metaKeywords} />
      <meta
        name="robots"
        content={
          noIndex
            ? "noindex, nofollow"
            : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        }
      />
      <meta
        name="googlebot"
        content={noIndex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1"}
      />

      {/* ── Identity ── */}
      <meta name="language" content="English" />
      <meta name="author" content={siteName} />
      <meta httpEquiv="content-language" content="en-US" />

      {/* ── Geo ── */}
      <meta name="geo.region" content="IN-GJ" />
      <meta name="geo.placename" content="Surat, Gujarat, India" />
      <meta name="geo.position" content="21.1702;72.8311" />
      <meta name="ICBM" content="21.1702, 72.8311" />

      {/* ── Canonical & hreflang ─────────────────────────────────────────────────
           Only self-referencing canonical + generic English + x-default.
           Country-specific hreflang (en-US→/usa etc.) must NOT appear on
           pages that don't have actual per-country variants — Google flags it. */}
      <link rel="canonical" href={pageUrl} />
      <link rel="alternate" hrefLang="en" href={pageUrl} />
      <link rel="alternate" hrefLang="x-default" href={baseUrl} />

      {/* ── Discovery ── */}
      <link rel="sitemap" type="application/xml" title="Sitemap" href={`${baseUrl}/sitemap-index.xml`} />
      <link
        rel="alternate"
        type="application/rss+xml"
        title={`${siteName} — Jewelry Blog & News`}
        href={`${baseUrl}/feed.xml`}
      />
      <link rel="manifest" href="/site.webmanifest" />

      {/* ── Performance preconnects ── */}
      <link rel="preconnect" href="https://firebasestorage.googleapis.com" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      <link rel="dns-prefetch" href="https://ipapi.co" />

      {/* ── Open Graph ── */}
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={resolvedImage} />
      <meta property="og:image:secure_url" content={resolvedImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`${siteName} — ${title}`} />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:locale" content="en_US" />
      <meta property="og:url" content={pageUrl} />

      {/* ── Article OG ── */}
      {articleMeta?.publishedTime && (
        <meta property="article:published_time" content={articleMeta.publishedTime} />
      )}
      {articleMeta?.modifiedTime && (
        <meta property="article:modified_time" content={articleMeta.modifiedTime} />
      )}
      {articleMeta?.author && <meta property="article:author" content={articleMeta.author} />}
      {articleMeta?.section && <meta property="article:section" content={articleMeta.section} />}
      {articleMeta?.tags?.map((tag) => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}

      {/* ── Twitter / X Card ── */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@flenixjewels" />
      <meta name="twitter:creator" content="@flenixjewels" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={resolvedImage} />
      <meta name="twitter:image:alt" content={`${siteName} — ${title}`} />

      {/* ── Pinterest ── */}
      <meta name="pinterest-rich-pin" content="true" />

      {/* ── PWA / Mobile ── */}
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={siteName} />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="application-name" content={siteName} />
      <meta name="msapplication-TileColor" content="#C4906A" />
      <meta name="msapplication-config" content="/browserconfig.xml" />
      <meta name="theme-color" content="#C4906A" />

      {/* ── JSON-LD: page-level structured data ── */}
      {schemaList.map((schema, idx) => (
        <script key={idx} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEOHead;
