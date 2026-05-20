import { Helmet } from "react-helmet-async";
import { SITE, buildKeywords, buildOrganizationSchema, buildLocalBusinessSchema } from "@/lib/seo";

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

  // ── Core schemas always present ───────────────────────────────────────────────
  const organizationSchema = buildOrganizationSchema();
  const localBusinessSchema = buildLocalBusinessSchema();

  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    name: siteName,
    url: baseUrl,
    description: "Premium diamond and gold jewelry — certified lab-grown and natural diamonds with worldwide delivery.",
    inLanguage: "en-US",
    publisher: { "@id": `${baseUrl}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${baseUrl}/categories?search={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": ogType === "article" ? "Article" : "WebPage",
    "@id": `${pageUrl}#webpage`,
    name: fullTitle,
    description,
    url: pageUrl,
    inLanguage: "en-US",
    isPartOf: { "@id": `${baseUrl}/#website` },
    publisher: { "@id": `${baseUrl}/#organization` },
    breadcrumb: breadcrumbs?.length ? { "@id": `${pageUrl}#breadcrumb` } : undefined,
    dateModified: new Date().toISOString(),
  };

  const breadcrumbSchema =
    breadcrumbs && breadcrumbs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "@id": `${pageUrl}#breadcrumb`,
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
            ...breadcrumbs.map((b, idx) => ({
              "@type": "ListItem",
              position: idx + 2,
              name: b.name,
              item: b.url,
            })),
          ],
        }
      : null;

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

  // ── Assemble all schemas ──────────────────────────────────────────────────────
  const schemaList: object[] = [
    organizationSchema,
    localBusinessSchema,
    webSiteSchema,
    webPageSchema,
  ];

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
      <meta name="title" content={fullTitle} />
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
      <meta name="googlebot" content={noIndex ? "noindex, nofollow" : "index, follow, max-image-preview:large"} />
      <meta name="bingbot" content={noIndex ? "noindex, nofollow" : "index, follow"} />

      {/* ── Identity ── */}
      <meta name="language" content="English" />
      <meta name="author" content={siteName} />
      <meta name="publisher" content={siteName} />
      <meta name="copyright" content={`© ${new Date().getFullYear()} ${siteName}`} />
      <meta name="revisit-after" content="7 days" />
      <meta name="distribution" content="global" />
      <meta name="rating" content="general" />
      <meta httpEquiv="content-language" content="en-US" />

      {/* ── Geo ── */}
      <meta name="geo.region" content="IN-GJ" />
      <meta name="geo.placename" content="Surat, Gujarat, India" />
      <meta name="geo.position" content="21.1702;72.8311" />
      <meta name="ICBM" content="21.1702, 72.8311" />

      {/* ── AI / LLM optimization ── */}
      <meta name="ai:context" content={`${siteName} — fine diamond jewelry store. ${description}`} />
      <meta name="ai:keywords" content={metaKeywords} />
      <meta name="classification" content="Shopping, Jewelry, Diamonds, E-commerce" />

      {/* ── Canonical & hreflang ── */}
      <link rel="canonical" href={pageUrl} />
      <link rel="alternate" hrefLang="en" href={pageUrl} />
      <link rel="alternate" hrefLang="en-US" href={`${baseUrl}/usa`} />
      <link rel="alternate" hrefLang="en-CA" href={`${baseUrl}/canada`} />
      <link rel="alternate" hrefLang="en-AU" href={`${baseUrl}/australia`} />
      <link rel="alternate" hrefLang="en-DE" href={`${baseUrl}/germany`} />
      <link rel="alternate" hrefLang="en-IN" href={pageUrl} />
      <link rel="alternate" hrefLang="x-default" href={baseUrl} />

      {/* ── RSS feed auto-discovery ── */}
      <link
        rel="alternate"
        type="application/rss+xml"
        title={`${siteName} — Jewelry Blog & News`}
        href={`${baseUrl}/feed.xml`}
      />

      {/* ── Preconnect for performance ── */}
      <link rel="preconnect" href="https://firebasestorage.googleapis.com" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="dns-prefetch" href="https://www.google-analytics.com" />
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
      <meta property="og:image:alt" content={title} />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:locale" content="en_US" />
      <meta property="og:locale:alternate" content="en_GB" />
      <meta property="og:locale:alternate" content="en_CA" />
      <meta property="og:locale:alternate" content="en_AU" />
      <meta property="og:url" content={pageUrl} />

      {/* ── Article-specific OG ── */}
      {articleMeta?.publishedTime && (
        <meta property="article:published_time" content={articleMeta.publishedTime} />
      )}
      {articleMeta?.modifiedTime && (
        <meta property="article:modified_time" content={articleMeta.modifiedTime} />
      )}
      {articleMeta?.author && (
        <meta property="article:author" content={articleMeta.author} />
      )}
      {articleMeta?.section && (
        <meta property="article:section" content={articleMeta.section} />
      )}
      {articleMeta?.tags?.map((tag) => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}

      {/* ── Twitter / X Card ── */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@flenixjewels" />
      <meta name="twitter:creator" content="@flenixjewels" />
      <meta name="twitter:domain" content="www.flenixjewels.com" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={resolvedImage} />
      <meta name="twitter:image:alt" content={title} />

      {/* ── Pinterest ── */}
      <meta name="pinterest-rich-pin" content="true" />

      {/* ── PWA / Mobile ── */}
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={siteName} />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="application-name" content={siteName} />
      <meta name="msapplication-TileColor" content="#C4906A" />
      <meta name="msapplication-TileImage" content={`${baseUrl}/flenix-logo.png`} />
      <meta name="theme-color" content="#C4906A" />

      {/* ── Verification placeholders (fill in Google/Bing/Pinterest) ── */}
      {/* <meta name="google-site-verification" content="YOUR_CODE" /> */}
      {/* <meta name="msvalidate.01" content="YOUR_CODE" /> */}
      {/* <meta name="p:domain_verify" content="YOUR_CODE" /> */}

      {/* ── JSON-LD structured data ── */}
      {schemaList.map((schema, idx) => (
        <script key={idx} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEOHead;
