export const FOUNDING_YEAR = 2015;
export const YEARS_OF_EXCELLENCE = Math.max(new Date().getFullYear() - FOUNDING_YEAR, 0);
export const YEARS_OF_EXCELLENCE_LABEL = `${YEARS_OF_EXCELLENCE}+`;

export const SITE = {
  name: "Flenix Jewels",
  url: "https://www.flenixjewels.com",
  ogImage: "https://www.flenixjewels.com/icon.png",
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
    "lab grown diamond jewelry",
    "natural diamond engagement rings",
    "custom diamond jewelry",
    "eternity ring lab grown diamonds",
    "diamond necklace online India",
    "wholesale lab grown diamonds Surat",
    "certified lab grown diamond rings",
    "14KT gold diamond earrings",
    "luxury diamond wedding bands",
    "buy natural and lab grown diamonds online",
    "diamond jewelry",
    "gold jewelry",
    "engagement rings",
    "wedding bands",
    "GIA certified",
    "IGI certified",
    "worldwide shipping jewelry",
    "diamond jewelry USA",
    "diamond jewelry Canada",
    "diamond jewelry Australia",
    "diamond jewelry Germany",
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

  const sitemapUrl = `${SITE.url}/sitemap.xml`;
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
  return `Explore premium ${categoryName.toLowerCase()} jewelry at ${SITE.name}. Certified lab-grown and natural diamonds with worldwide delivery to USA, Canada, Australia, and Germany.`;
};

export const buildMetaTitleForProduct = (productName: string) => {
  return `${productName} | ${SITE.name}`;
};

export const buildMetaDescriptionForProduct = (productName: string, categoryName?: string) => {
  const categoryText = categoryName ? ` in ${categoryName}` : "";
  return `Discover ${productName}${categoryText} at ${SITE.name}. Certified lab-grown and natural diamonds with worldwide delivery to USA, Canada, Australia, and Germany.`;
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
    answer: "Yes. We offer certified lab-grown and natural diamonds with trusted grading standards.",
  },
  {
    question: `Can I customize ${categoryName} designs?`,
    answer: "Yes. We offer custom design and manufacturing for select categories and styles.",
  },
  {
    question: "Do you ship internationally?",
    answer: "Yes. We provide international shipping with secure packaging for select regions.",
  },
];

export const buildFaqForProduct = (productName: string, categoryName?: string) => [
  {
    question: `Is ${productName} certified?`,
    answer: "Yes. We provide certification for lab-grown and natural diamonds where applicable.",
  },
  {
    question: `Can ${productName} be customized?`,
    answer: "Yes. Contact us for custom sizing, metal options, or design adjustments.",
  },
  {
    question: `What is the delivery time for ${categoryName || "this item"}?`,
    answer: "We offer secure, insured shipping with delivery timelines based on your region.",
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
    `Premium diamond and gold jewelry brand established in ${FOUNDING_YEAR}. Certified lab-grown and natural diamonds, engagement rings, wedding bands, and bespoke jewelry with worldwide delivery.`,
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
});

export const buildLocalBusinessSchema = () => ({
  "@context": "https://schema.org",
  "@type": ["JewelryStore", "LocalBusiness"],
  "@id": `${SITE.url}/#local-business`,
  name: SITE.name,
  description:
    "Premium diamond and gold jewelry store. GIA- and IGI-certified lab-grown and natural diamonds. Engagement rings, wedding bands, necklaces, earrings, and bracelets. worldwide shipping.",
  url: SITE.url,
  telephone: SITE.phonePrimary,
  email: SITE.email,
  logo: SITE.logo,
  image: SITE.ogImage,
  priceRange: "$$$",
  currenciesAccepted: "USD",
  paymentAccepted: "Credit Card, Bank Transfer",
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
    reviewCount: "12000",
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
}) => {
  const numericPrice = parsePrice(params.price);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: params.name,
    description: params.description,
    url: params.url,
    ...(params.image
      ? { image: [{ "@type": "ImageObject", url: params.image, name: params.name }] }
      : {}),
    ...(params.sku ? { sku: params.sku } : {}),
    brand: {
      "@type": "Brand",
      name: params.brand || SITE.name,
    },
    category: params.category || "Jewelry",
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      url: params.url,
      seller: { "@type": "Organization", name: SITE.name },
      ...(numericPrice ? { price: numericPrice, priceCurrency: "USD" } : {}),
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "150",
      bestRating: "5",
    },
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
}) => ({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: params.title,
  description: params.description,
  url: params.url,
  ...(params.image ? { image: { "@type": "ImageObject", url: params.image } } : {}),
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
    logo: { "@type": "ImageObject", url: SITE.logo },
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
});
