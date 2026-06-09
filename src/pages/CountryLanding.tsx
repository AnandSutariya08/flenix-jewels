import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import MiniHeader from "@/components/MiniHeader";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useAppSelector } from "@/store/hooks";
import { selectGlobalData } from "@/store/contentSlice";
import { Button } from "@/components/ui/button";
import { useHeaderOffset } from "@/hooks/useHeaderOffset";
import { SITE } from "@/lib/seo";

type CountryConfig = {
  name: string;
  slug: string;
  locale: string;
  headline: string;
  description: string;
  shippingText: string;
  keywords: string;
};

const COUNTRIES: CountryConfig[] = [
  {
    name: "United States",
    slug: "usa",
    locale: "en-US",
    headline: "Diamond Jewelry Delivered Across the USA",
    description:
      "Shop certified natural and lab-grown diamond jewelry from Flenix Jewels Ltd with secure worldwide delivery to the United States. Custom designs, premium craftsmanship, and WhatsApp support.",
    shippingText:
      "Fast, insured international shipping to all US states with secure packaging and tracking.",
    keywords:
      "diamond jewelry USA, lab grown diamonds USA, engagement rings USA, luxury jewelry USA, diamond necklace USA",
  },
  {
    name: "Canada",
    slug: "canada",
    locale: "en-CA",
    headline: "Luxury Jewelry Delivery Across Canada",
    description:
      "Discover premium diamond and gold jewelry with worldwide delivery to Canada. Certified natural and lab-grown diamonds with custom design options.",
    shippingText:
      "Secure international shipping to all Canadian provinces with tracking and insurance.",
    keywords:
      "diamond jewelry Canada, lab grown diamonds Canada, engagement rings Canada, luxury jewelry Canada",
  },
  {
    name: "Australia",
    slug: "australia",
    locale: "en-AU",
    headline: "Premium Diamond Jewelry for Australia",
    description:
      "Shop certified diamond jewelry and custom designs delivered to Australia. Ethical natural and lab-grown diamonds with expert craftsmanship.",
    shippingText:
      "Tracked, insured shipping to all Australian states and territories.",
    keywords:
      "diamond jewelry Australia, lab grown diamonds Australia, engagement rings Australia, luxury jewelry Australia",
  },
  {
    name: "Germany",
    slug: "germany",
    locale: "en-DE",
    headline: "Certified Diamond Jewelry Delivered to Germany",
    description:
      "Explore Flenix Jewels Ltd luxury diamond collections with secure delivery to Germany. Lab-grown and natural diamonds, custom jewelry, and expert support.",
    shippingText:
      "Reliable international shipping to Germany with secure packaging and tracking.",
    keywords:
      "diamond jewelry Germany, lab grown diamonds Germany, engagement rings Germany, luxury jewelry Germany",
  },
];

const CountryLanding = () => {
  const { country } = useParams<{ country: string }>();
  const { categories, promoHeader } = useAppSelector(selectGlobalData);
  const paddingTop = useHeaderOffset();

  const config = useMemo(
    () => COUNTRIES.find((c) => c.slug === country) ?? null,
    [country]
  );

  const countryStructuredData = useMemo(() => {
    if (!config) return [];
    return [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${SITE.url}/${config.slug}#webpage`,
      name: `${config.name} Diamond Jewelry Shipping — ${SITE.name}`,
      description: config.description,
      url: `${SITE.url}/${config.slug}`,
      inLanguage: config.locale,
      isPartOf: { "@id": `${SITE.url}/#website` },
      about: { "@id": `${SITE.url}/#organization` },
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
          { "@type": "ListItem", position: 2, name: config.name, item: `${SITE.url}/${config.slug}` },
        ],
      },
    },
    {
      "@context": "https://schema.org",
      "@type": ["JewelryStore", "LocalBusiness"],
      "@id": `${SITE.url}/#local-business`,
      name: SITE.name,
      description: `Premium GIA and IGI certified diamond jewelry with free insured worldwide shipping to ${config.name}.`,
      url: SITE.url,
      telephone: SITE.phonePrimary,
      email: SITE.email,
      logo: SITE.logo,
      image: SITE.ogImage,
      priceRange: "$$$",
      areaServed: [
        { "@type": "Country", name: config.name },
        ...SITE.areaServed.map((c) => ({ "@type": "Country", name: c })),
      ],
      sameAs: [...SITE.sameAs],
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        reviewCount: "1250",
        bestRating: "5",
        worstRating: "1",
      },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: `Diamond Jewelry Collection — ${config.name}`,
        url: `${SITE.url}/categories`,
        itemListElement: [
          { "@type": "Offer", itemOffered: { "@type": "Product", name: "Diamond Engagement Rings" } },
          { "@type": "Offer", itemOffered: { "@type": "Product", name: "Diamond Necklaces" } },
          { "@type": "Offer", itemOffered: { "@type": "Product", name: "Diamond Earrings" } },
          { "@type": "Offer", itemOffered: { "@type": "Product", name: "Diamond Bracelets" } },
          { "@type": "Offer", itemOffered: { "@type": "Product", name: "Wedding Bands" } },
        ],
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "@id": `${SITE.url}/${config.slug}#shipping-service`,
      name: `Free Diamond Jewelry Shipping to ${config.name}`,
      description: config.shippingText,
      provider: { "@id": `${SITE.url}/#organization` },
      serviceType: "International Jewelry Shipping",
      areaServed: { "@type": "Country", name: config.name },
      offers: {
        "@type": "Offer",
        availability: "https://schema.org/InStock",
        url: `${SITE.url}/${config.slug}`,
        shippingDetails: {
          "@type": "OfferShippingDetails",
          shippingRate: { "@type": "MonetaryAmount", value: "0", currency: "USD" },
          shippingDestination: { "@type": "DefinedRegion", addressCountry: config.slug.toUpperCase().slice(0, 2) },
          deliveryTime: {
            "@type": "ShippingDeliveryTime",
            transitTime: { "@type": "QuantitativeValue", minValue: 5, maxValue: 14, unitCode: "DAY" },
          },
        },
      },
    },
  ]; }, [config]);

  const countryFaqItems = useMemo(() => {
    if (!config) return [];
    return [
    {
      question: `Do you ship diamond jewelry to ${config.name}?`,
      answer: `Yes. ${config.shippingText} We offer free insured express delivery to ${config.name} with full tracking.`,
    },
    {
      question: `Are the diamonds GIA or IGI certified for orders to ${config.name}?`,
      answer: "Yes. All significant pieces come with GIA or IGI certification regardless of destination. We ship the certificate alongside the jewelry.",
    },
    {
      question: `What is the delivery time for ${config.name}?`,
      answer: `Typical delivery to ${config.name} is 5–14 business days via insured express courier. You will receive a tracking number once dispatched.`,
    },
    {
      question: "Can I return or exchange an item from outside India?",
      answer: "Yes. We accept returns within 30 days of delivery from all countries. Return shipping is free and fully covered by us.",
    },
    {
      question: "How do I place an order or make an enquiry?",
      answer: `You can browse our collections online and contact us via WhatsApp at ${SITE.phoneWhatsApp} or email at ${SITE.email} to place an order or ask any questions.`,
    },
  ]; }, [config]);

  if (!config) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <SEOHead
          title="Country Page Not Found"
          description="The requested country page could not be found."
          canonicalUrl={`https://www.flenixjewels.com/${country || ""}`}
        />
        <Header promoHeader={promoHeader} />
        <main className="flex-1 container mx-auto px-4 py-16" style={{ paddingTop: `${paddingTop}px` }}>
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
            <Link to="/">
              <Button>Back to Home</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title={`${config.name} Diamond Jewelry — Free Shipping | ${SITE.name}`}
        description={config.description}
        keywords={config.keywords}
        canonicalUrl={`${SITE.url}/${config.slug}`}
        structuredData={countryStructuredData}
        breadcrumbs={[
          { name: "Home", url: SITE.url },
          { name: config.name, url: `${SITE.url}/${config.slug}` },
        ]}
        faqItems={countryFaqItems}
      />

      <Header promoHeader={promoHeader} />
      {/* <MiniHeader categories={categories} promoHeight={promoHeight} /> */}

      <main className="flex-1 container mx-auto px-4 py-12" style={{ paddingTop: `${paddingTop}px` }}>
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{config.headline}</h1>
          <p className="text-lg text-muted-foreground">{config.description}</p>
        </div>

        <div className="max-w-3xl mx-auto grid gap-6">
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-2">Shipping to {config.name}</h2>
            <p className="text-muted-foreground">{config.shippingText}</p>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-2">Why Flenix Jewels Ltd</h2>
            <ul className="text-muted-foreground space-y-2">
              <li>Certified natural and lab-grown diamonds.</li>
              <li>Custom design and manufacturing support.</li>
              <li>Secure worldwide shipping with tracking.</li>
              <li>WhatsApp support for quick inquiries.</li>
            </ul>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-sm text-center">
            <h2 className="text-xl font-semibold mb-2">Explore Our Collections</h2>
            <p className="text-muted-foreground mb-4">
              Browse engagement rings, wedding bands, necklaces, earrings, and more.
            </p>
            <Link to="/categories">
              <Button size="lg">View Collections</Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CountryLanding;
