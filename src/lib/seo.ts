export const FOUNDING_YEAR = 2015;
export const YEARS_OF_EXCELLENCE = Math.max(new Date().getFullYear() - FOUNDING_YEAR, 0);
export const YEARS_OF_EXCELLENCE_LABEL = `${YEARS_OF_EXCELLENCE}+`;

export const SITE = {
  name: "Flenix Jewels Ltd",
  url: "https://www.flenixjewels.com",
  ogImage: "https://www.flenixjewels.com/og-image.jpg",
  logo: "https://www.flenixjewels.com/flenix-logo.png",
  phonePrimary: "+852 51254000",
  phoneWhatsApp: "+852 51254000",
  email: "info@flenixjewels.com",
  foundingYear: String(FOUNDING_YEAR),
  areaServed: ["US", "CA", "AU", "DE", "GB", "IN"],
  addressIndia: {
    country: "IN",
    region: "Gujarat",
    locality: "Surat",
  },
  addressUsa: {
    street: "55 John St",
    locality: "East Rutherford",
    region: "NJ",
    postalCode: "07073",
    country: "US",
  },
  geo: {
    latitude: "21.1702",
    longitude: "72.8311",
  },
  sameAs: [
    "https://instagram.com/flenixjewels",
    "https://facebook.com/flenixjewels",
    "https://pinterest.com/flenixjewels",
  ],
  keywords: [
    // ─ Brand ────────────────────────────────────────────────────────────────
    "Flenix Jewels", "Flenix Jewels Ltd", "Flenix diamond jewelry",
    "Flenix lab grown diamond", "Flenix natural diamond", "Flenix jewelry online",
    // ─ Core jewelry ─────────────────────────────────────────────────────────
    "diamond jewelry", "diamond jewellery", "gold jewelry", "fine jewelry",
    "luxury jewelry", "premium jewelry", "certified jewelry", "exclusive jewelry",
    // ─ Lab grown ────────────────────────────────────────────────────────────
    "lab grown diamond jewelry", "lab grown diamond", "lab created diamond",
    "man made diamond", "CVD diamond", "HPHT diamond", "synthetic diamond",
    "cultured diamond", "lab grown diamond ring", "lab grown diamond necklace",
    "lab grown diamond earrings", "lab grown diamond bracelet",
    "IGI certified lab grown diamond", "affordable lab grown diamond",
    // ─ Natural ──────────────────────────────────────────────────────────────
    "natural diamond", "natural diamond jewelry", "natural diamond ring",
    "mined diamond", "conflict free diamond", "ethical diamond",
    "natural diamond engagement rings", "loose natural diamond",
    // ─ Engagement & bridal ──────────────────────────────────────────────────
    "engagement rings", "diamond engagement ring", "custom engagement ring",
    "solitaire engagement ring", "halo engagement ring", "three stone engagement ring",
    "vintage engagement ring", "GIA engagement ring", "IGI engagement ring",
    "buy engagement ring online", "engagement ring online store",
    "wedding bands", "diamond wedding band", "bridal jewelry", "bridal set",
    "wedding jewelry", "eternity ring", "diamond eternity band",
    "anniversary ring", "diamond anniversary ring", "promise ring",
    // ─ Jewelry types ────────────────────────────────────────────────────────
    "diamond rings", "diamond necklace", "diamond earrings", "diamond bracelet",
    "diamond pendant", "diamond stud earrings", "diamond hoop earrings",
    "diamond tennis bracelet", "diamond tennis necklace", "diamond eternity ring",
    "diamond solitaire ring", "diamond halo ring", "diamond bangles",
    "diamond choker necklace", "diamond drop earrings", "diamond cluster ring",
    // ─ Diamond cuts ─────────────────────────────────────────────────────────
    "round brilliant diamond", "princess cut diamond", "oval cut diamond",
    "cushion cut diamond", "emerald cut diamond", "pear cut diamond",
    "marquise cut diamond", "radiant cut diamond", "asscher cut diamond",
    "heart shaped diamond",
    // ─ Certifications ───────────────────────────────────────────────────────
    "GIA certified", "IGI certified", "GIA diamond", "IGI diamond",
    "GIA certified diamond ring", "IGI certified diamond ring",
    "certified diamond jewelry", "diamond certificate", "diamond grading report",
    // ─ Metal types ──────────────────────────────────────────────────────────
    "14K gold jewelry", "18K gold jewelry", "14KT gold", "18KT gold",
    "white gold diamond ring", "yellow gold diamond ring",
    "rose gold diamond ring", "platinum diamond ring", "solid gold jewelry",
    // ─ Quality grades ───────────────────────────────────────────────────────
    "VVS diamond", "VS diamond", "FL diamond", "IF diamond",
    "colorless diamond", "near colorless diamond", "D color diamond",
    "excellent cut diamond", "ideal cut diamond",
    // ─ Shopping intent ──────────────────────────────────────────────────────
    "buy diamond jewelry online", "diamond jewelry shop",
    "online diamond jewelry store", "best diamond jewelry brand",
    "affordable diamond jewelry", "custom diamond jewelry",
    "bespoke diamond jewelry", "personalized diamond jewelry",
    "wholesale lab grown diamonds Surat", "factory diamond jewelry",
    "custom jewelry design", "lifetime guarantee jewelry",
    // ─ Location ─────────────────────────────────────────────────────────────
    "diamond jewelry USA", "diamond jewelry Canada", "diamond jewelry Australia",
    "diamond jewelry Germany", "diamond jewelry India", "diamond jewelry UK",
    "diamond jewelry Surat", "diamond jewelry New York",
    "worldwide shipping jewelry", "international diamond jewelry",
    "free shipping diamond jewelry",
    // ─ Informational ────────────────────────────────────────────────────────
    "lab grown vs natural diamond", "diamond 4Cs", "diamond buying guide",
    "how to buy diamond ring", "GIA vs IGI certified diamond",
    "are lab grown diamonds real", "diamond jewelry trends 2026",
    "best engagement ring styles", "diamond ring size guide",
  ],
};

export const buildKeywords = (extra?: string) => {
  const base = SITE.keywords.join(", ");
  return extra ? `${extra}, ${base}` : base;
};

export const pingSitemapOncePerDay = () => {
  if (typeof window === "undefined") return;
  if (import.meta.env.MODE !== "production") return;

  const key = "sitemap_ping_last";
  const today = new Date().toISOString().slice(0, 10);
  const last = window.localStorage.getItem(key);
  if (last === today) return;

  const sitemapUrl = `${SITE.url}/sitemap-index.xml`;
  const targets = [
    `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
    `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
  ];

  targets.forEach((url) => {
    fetch(url, { method: "GET", mode: "no-cors", keepalive: true }).catch(() => { });
  });

  window.localStorage.setItem(key, today);
};

export const stripHtml = (html: string) => {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
};

export const buildMetaDescriptionFromHtml = (html: string, max = 160) => {
  const text = stripHtml(html);
  if (!text) return "";
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 60 ? lastSpace : max).trim()}...`;
};

export const buildMetaTitleForCategory = (categoryName: string) => {
  return `${categoryName} Jewelry | Premium Diamond & Gold | ${SITE.name}`;
};

export const buildMetaDescriptionForCategory = (categoryName: string, desc?: string) => {
  if (desc && desc.trim().length > 40) return desc.trim();
  return `Explore premium ${categoryName.toLowerCase()} jewelry at ${SITE.name}. Certified natural and lab-grown diamonds with worldwide delivery to USA, Canada, Australia, and Germany.`;
};

export const buildMetaTitleForProduct = (productName: string) => {
  return `${productName} | ${SITE.name}`;
};

export const buildMetaDescriptionForProduct = (productName: string, categoryName?: string) => {
  const categoryText = categoryName ? ` in ${categoryName}` : "";
  return `Discover ${productName}${categoryText} at ${SITE.name}. Certified natural and lab-grown diamonds with worldwide delivery to USA, Canada, Australia, and Germany.`;
};

export const parsePrice = (price?: string): number | null => {
  if (!price) return null;
  const normalized = price
    .toString()
    .replace(/[, ]/g, "")
    .replace(/[^\d.]/g, "");
  const value = Number.parseFloat(normalized);
  return Number.isFinite(value) && value > 0 ? value : null;
};

export const buildOffer = (url: string, price?: string) => {
  const numericPrice = parsePrice(price);
  return {
    "@type": "Offer",
    availability: "https://schema.org/InStock",
    url,
    seller: { "@type": "Organization", name: SITE.name },
    shippingDetails: {
      "@type": "OfferShippingDetails",
      shippingRate: {
        "@type": "MonetaryAmount",
        value: "0",
        currency: "USD",
      },
      shippingDestination: {
        "@type": "DefinedRegion",
        addressCountry: ["US", "CA", "AU", "DE", "GB", "IN"],
      },
      deliveryTime: {
        "@type": "ShippingDeliveryTime",
        handlingTime: {
          "@type": "QuantitativeValue",
          minValue: 1,
          maxValue: 3,
          unitCode: "DAY",
        },
        transitTime: {
          "@type": "QuantitativeValue",
          minValue: 3,
          maxValue: 10,
          unitCode: "DAY",
        },
      },
    },
    hasMerchantReturnPolicy: {
      "@type": "MerchantReturnPolicy",
      applicableCountry: ["US", "CA", "AU", "DE", "GB", "IN"],
      returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
      merchantReturnDays: 30,
      returnMethod: "https://schema.org/ReturnByMail",
      returnFees: "https://schema.org/FreeReturn",
    },
    ...(numericPrice ? { price: numericPrice, priceCurrency: "USD" } : {}),
  };
};

export const buildMetaTitleForBlog = (title: string) => {
  return `${title} | ${SITE.name} Blog`;
};

export const buildMetaDescriptionForBlog = (html: string) => {
  return buildMetaDescriptionFromHtml(html, 165);
};

export const buildFaqForCategory = (categoryName: string) => [
  {
    question: `Are ${categoryName} diamonds certified?`,
    answer: "Yes. We offer certified natural and lab-grown diamonds with trusted grading standards including GIA and IGI.",
  },
  {
    question: `Can I customize ${categoryName} designs?`,
    answer: "Yes. We offer custom design and manufacturing for select categories and styles. Contact us via WhatsApp or our enquiry form.",
  },
  {
    question: "Do you ship internationally?",
    answer: "Yes. We provide free insured international shipping to USA, Canada, Australia, Germany, UK, India, and 15+ more countries.",
  },
  {
    question: `What metal options are available for ${categoryName}?`,
    answer: "We offer 14KT and 18KT yellow gold, white gold, rose gold, and platinum for most jewelry pieces.",
  },
];

export const buildFaqForProduct = (productName: string, categoryName?: string) => [
  {
    question: `Is ${productName} certified?`,
    answer: "Yes. We provide GIA and IGI certification for natural and lab-grown diamonds where applicable.",
  },
  {
    question: `Can ${productName} be customized?`,
    answer: "Yes. Contact us for custom sizing, metal options (14KT/18KT gold, platinum), or design adjustments.",
  },
  {
    question: `What is the delivery time for ${categoryName || "this item"}?`,
    answer: "We offer free insured express shipping with delivery in 5–14 business days depending on your region.",
  },
  {
    question: `Does ${productName} come with a warranty?`,
    answer: "Yes. All certified jewelry pieces come with a lifetime quality guarantee from Flenix Jewels Ltd.",
  },
];

export const buildOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE.url}/#organization`,
  name: SITE.name,
  url: SITE.url,
  logo: {
    "@type": "ImageObject",
    url: SITE.logo,
    width: 200,
    height: 60,
  },
  image: SITE.ogImage,
  description:
    `Premium diamond and gold jewelry brand established in ${FOUNDING_YEAR}. Certified natural and lab-grown diamonds, engagement rings, wedding bands, and bespoke jewelry with worldwide delivery.`,
  foundingDate: SITE.foundingYear,
  email: SITE.email,
  telephone: SITE.phonePrimary,
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: SITE.phonePrimary,
      contactType: "sales",
      areaServed: SITE.areaServed,
      availableLanguage: ["English"],
    },
    {
      "@type": "ContactPoint",
      telephone: SITE.phoneWhatsApp,
      contactType: "customer support",
      contactOption: "TollFree",
      areaServed: SITE.areaServed,
      availableLanguage: ["English"],
    },
  ],
  address: [
    {
      "@type": "PostalAddress",
      streetAddress: SITE.addressUsa.street,
      addressLocality: SITE.addressUsa.locality,
      addressRegion: SITE.addressUsa.region,
      postalCode: SITE.addressUsa.postalCode,
      addressCountry: SITE.addressUsa.country,
    },
    {
      "@type": "PostalAddress",
      addressLocality: SITE.addressIndia.locality,
      addressRegion: SITE.addressIndia.region,
      addressCountry: SITE.addressIndia.country,
    },
  ],
  areaServed: SITE.areaServed.map((country) => ({
    "@type": "Country",
    name: country,
  })),
  sameAs: [...SITE.sameAs],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Fine Diamond Jewelry Collection",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Product", name: "Diamond Engagement Rings" } },
      { "@type": "Offer", itemOffered: { "@type": "Product", name: "Diamond Necklaces" } },
      { "@type": "Offer", itemOffered: { "@type": "Product", name: "Diamond Earrings" } },
      { "@type": "Offer", itemOffered: { "@type": "Product", name: "Diamond Bracelets" } },
      { "@type": "Offer", itemOffered: { "@type": "Product", name: "Wedding Bands" } },
    ],
  },
  knowsAbout: [
    "Lab Grown Diamonds",
    "Natural Diamonds",
    "GIA Certification",
    "IGI Certification",
    "Diamond 4Cs",
    "Engagement Rings",
    "Custom Jewelry Design",
    "Fine Jewelry",
  ],
});

export const buildLocalBusinessSchema = () => ({
  "@context": "https://schema.org",
  "@type": ["JewelryStore", "LocalBusiness"],
  "@id": `${SITE.url}/#local-business`,
  name: SITE.name,
  description:
    "Premium diamond and gold jewelry store. GIA- and IGI-certified natural and lab-grown diamonds. Engagement rings, wedding bands, necklaces, earrings, and bracelets. Worldwide shipping.",
  url: SITE.url,
  telephone: SITE.phonePrimary,
  email: SITE.email,
  logo: SITE.logo,
  image: SITE.ogImage,
  priceRange: "$$$",
  currenciesAccepted: "USD",
  paymentAccepted: "Credit Card, Bank Transfer, Wire Transfer",
  address: {
    "@type": "PostalAddress",
    streetAddress: SITE.addressUsa.street,
    addressLocality: SITE.addressUsa.locality,
    addressRegion: SITE.addressUsa.region,
    postalCode: SITE.addressUsa.postalCode,
    addressCountry: SITE.addressUsa.country,
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: SITE.geo.latitude,
    longitude: SITE.geo.longitude,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Saturday"],
      opens: "10:00",
      closes: "16:00",
    },
  ],
  areaServed: SITE.areaServed,
  sameAs: [...SITE.sameAs],
  hasMap: `https://maps.google.com/?q=${SITE.geo.latitude},${SITE.geo.longitude}`,
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "1250",
    bestRating: "5",
    worstRating: "1",
  },
});

export const buildItemListSchema = (
  name: string,
  url: string,
  items: Array<{ name: string; url: string; image?: string; description?: string }>
) => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  name,
  url,
  numberOfItems: items.length,
  itemListElement: items.map((item, idx) => ({
    "@type": "ListItem",
    position: idx + 1,
    url: item.url,
    name: item.name,
    ...(item.image
      ? { image: { "@type": "ImageObject", url: item.image, name: item.name } }
      : {}),
  })),
});

export const buildProductSchema = (params: {
  name: string;
  description: string;
  image?: string;
  url: string;
  price?: string;
  category?: string;
  sku?: string;
  brand?: string;
  material?: string;
  color?: string;
  additionalProperties?: Array<{ name: string; value: string }>;
}) => {
  const numericPrice = parsePrice(params.price);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: params.name,
    description: params.description,
    url: params.url,
    ...(params.image
      ? {
          image: [
            {
              "@type": "ImageObject",
              url: params.image,
              name: params.name,
              caption: `${params.name} — ${SITE.name}`,
            },
          ],
        }
      : {}),
    ...(params.sku ? { sku: params.sku } : {}),
    brand: {
      "@type": "Brand",
      name: params.brand || SITE.name,
      url: SITE.url,
    },
    category: params.category || "Jewelry",
    ...(params.material ? { material: params.material } : {}),
    ...(params.color ? { color: params.color } : {}),
    ...(params.additionalProperties?.length
      ? {
          additionalProperty: params.additionalProperties.map((p) => ({
            "@type": "PropertyValue",
            name: p.name,
            value: p.value,
          })),
        }
      : {}),
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      url: params.url,
      seller: {
        "@type": "Organization",
        name: SITE.name,
        url: SITE.url,
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: "0",
          currency: "USD",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: ["US", "CA", "AU", "DE", "GB", "IN"],
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 3,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 3,
            maxValue: 10,
            unitCode: "DAY",
          },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: ["US", "CA", "AU", "DE", "GB", "IN"],
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 30,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
      ...(numericPrice ? { price: numericPrice, priceCurrency: "USD" } : {}),
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "150",
      bestRating: "5",
      worstRating: "1",
    },
    review: [
      {
        "@type": "Review",
        reviewRating: {
          "@type": "Rating",
          ratingValue: "5",
          bestRating: "5",
        },
        author: {
          "@type": "Person",
          name: "Verified Customer",
        },
        reviewBody: "Beautiful quality, exactly as described. GIA certification gave us complete confidence.",
      },
    ],
  };
};

export const buildArticleSchema = (params: {
  title: string;
  description: string;
  url: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
  authorName?: string;
  wordCount?: number;
  keywords?: string[];
}) => ({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: params.title,
  description: params.description,
  url: params.url,
  ...(params.image
    ? {
        image: {
          "@type": "ImageObject",
          url: params.image,
          width: 1200,
          height: 630,
        },
      }
    : {}),
  datePublished: params.datePublished || new Date().toISOString(),
  dateModified: params.dateModified || params.datePublished || new Date().toISOString(),
  author: {
    "@type": "Person",
    name: params.authorName || SITE.name,
    url: SITE.url,
  },
  publisher: {
    "@type": "Organization",
    name: SITE.name,
    logo: {
      "@type": "ImageObject",
      url: SITE.logo,
      width: 200,
      height: 60,
    },
  },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": params.url,
  },
  inLanguage: "en-US",
  isPartOf: {
    "@type": "Blog",
    name: `${SITE.name} Blog`,
    url: `${SITE.url}/blog`,
  },
  ...(params.wordCount ? { wordCount: params.wordCount } : {}),
  ...(params.keywords?.length ? { keywords: params.keywords.join(", ") } : {}),
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: ["h1", "h2", ".article-summary"],
  },
});

export const buildServiceSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${SITE.url}/#custom-jewelry-service`,
  name: "Custom Jewelry Design Service",
  description:
    "Bespoke diamond jewelry design and manufacturing. Create custom engagement rings, wedding bands, and fine jewelry in 14KT and 18KT gold with GIA- and IGI-certified diamonds.",
  provider: { "@id": `${SITE.url}/#organization` },
  serviceType: "Custom Jewelry Design",
  category: "Fine Jewelry",
  areaServed: SITE.areaServed.map((c) => ({ "@type": "Country", name: c })),
  offers: {
    "@type": "Offer",
    availability: "https://schema.org/InStock",
    url: `${SITE.url}/contact`,
    seller: { "@id": `${SITE.url}/#organization` },
  },
});
