import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import WhatsAppButton from "@/components/WhatsAppButton";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loadProducts, selectContentHydrated, selectContentStatus, selectGlobalData, selectProductsLoaded, selectProductsStatus } from "@/store/contentSlice";
import { buildFaqForProduct, buildMetaDescriptionForProduct, buildMetaTitleForProduct, buildOffer, stripHtml } from "@/lib/seo";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { preloadMedia } from "@/lib/preload";
import { OptimizedVideo } from "@/components/ui/optimized-video";
import { useHeaderOffset } from "@/hooks/useHeaderOffset";
import { formatPriceRounded } from "@/lib/utils";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { categories, promoHeader, products, priceSettings } = useAppSelector(selectGlobalData);
  const status = useAppSelector(selectContentStatus);
  const hydrated = useAppSelector(selectContentHydrated);
  const productsLoaded = useAppSelector(selectProductsLoaded);
  const productsStatus = useAppSelector(selectProductsStatus);
  const isReady = status === "succeeded" || hydrated;
  const productsReady = productsLoaded || productsStatus === "succeeded" || productsStatus === "failed";

  const paddingTop = useHeaderOffset();

  const product = useMemo(() => products.find((p) => p.id === id) || null, [products, id]);
  const category = useMemo(
    () => categories.find((c) => c.id === product?.categoryId) || null,
    [categories, product?.categoryId]
  );

  const media = product?.images && product.images.length > 0 ? product.images : product?.image ? [product.image] : [];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const currentMedia = media[selectedIndex] || null;
  const hasMultiple = media.length > 1;

  const getMediaType = (url: string): "image" | "video" => {
    const videoExtensions = /\.(mp4|webm|ogg|mov|avi|mkv)$/i;
    return videoExtensions.test(url) || url.includes("video") ? "video" : "image";
  };

  useEffect(() => {
    if (!productsLoaded && productsStatus === "idle") {
      dispatch(loadProducts());
    }
  }, [dispatch, productsLoaded, productsStatus]);

  useEffect(() => {
    if (media.length === 0) return;
    const urls = [media[0], media[1]].filter(Boolean) as string[];
    preloadMedia(urls);
  }, [media]);

  // Reset to first slide when product changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [id]);

  const structuredData = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        "@id": `https://www.flenixjewels.com/product/${product.id}#product`,
        name: product.name,
        image: media.length > 0 ? media : undefined,
        description: stripHtml(product.description || `${product.name} from Flenix Jewels Ltd`),
        sku: product.id,
        category: category?.name,
        mainEntityOfPage: `https://www.flenixjewels.com/product/${product.id}`,
        brand: {
          "@type": "Brand",
          name: "Flenix Jewels Ltd",
        },
        offers: buildOffer(`https://www.flenixjewels.com/product/${product.id}`, product.price),
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.9",
          reviewCount: "150",
          bestRating: "5",
          worstRating: "1",
        },
      }
    : undefined;

  /* ── Loading skeleton ─────────────────────────────────────────── */
  if (!product && (!isReady || !productsReady)) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <SEOHead
          title="Loading Product"
          description="Loading product details."
          canonicalUrl={`https://www.flenixjewels.com/product/${id}`}
        />
        <Header promoHeader={promoHeader} />
        <main className="flex-1" style={{ paddingTop }}>
          <div className="container mx-auto px-4 sm:px-6 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">
              <div className="aspect-square bg-muted rounded-2xl animate-pulse" />
              <div className="space-y-4 pt-2">
                <div className="h-7 w-2/3 bg-muted rounded-lg animate-pulse" />
                <div className="h-5 w-1/3 bg-muted rounded-lg animate-pulse" />
                <div className="h-40 bg-muted rounded-lg animate-pulse" />
                <div className="h-12 bg-muted rounded-xl animate-pulse" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  /* ── Not found ────────────────────────────────────────────────── */
  if (!product) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <SEOHead
          title="Product Not Found"
          description="The requested product could not be found."
          canonicalUrl={`https://www.flenixjewels.com/product/${id}`}
        />
        <Header promoHeader={promoHeader} />
        <main className="flex-1" style={{ paddingTop }}>
          <div className="container mx-auto px-4 py-12 text-center">
            <p className="text-lg text-muted-foreground">Product not found.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  /* ── Main render ──────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title={product.metaTitle || buildMetaTitleForProduct(product.name)}
        description={product.metaDescription || buildMetaDescriptionForProduct(product.name, category?.name)}
        canonicalUrl={`https://www.flenixjewels.com/product/${product.id}`}
        structuredData={structuredData}
        breadcrumbs={[
          { name: "Home", url: "https://www.flenixjewels.com" },
          { name: "Categories", url: "https://www.flenixjewels.com/categories" },
          ...(category ? [{ name: category.name, url: `https://www.flenixjewels.com/category/${category.id}` }] : []),
          { name: product.name, url: `https://www.flenixjewels.com/product/${product.id}` },
        ]}
        faqItems={product.seoFaq && product.seoFaq.length > 0 ? product.seoFaq : buildFaqForProduct(product.name, category?.name)}
      />

      <Header promoHeader={promoHeader} />

      <main className="flex-1" style={{ paddingTop }}>
        <div className="container mx-auto px-4 sm:px-6 py-6 md:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-start">

            {/* ── Media column ───────────────────────────────────── */}
            <div className="lg:sticky lg:top-24 space-y-3">

              {/* Main display */}
              <div className="relative aspect-square sm:aspect-[4/5] rounded-2xl bg-muted overflow-hidden">
                {currentMedia && getMediaType(currentMedia) === "video" ? (
                  <OptimizedVideo
                    noWrapper
                    src={currentMedia}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                    controls
                  />
                ) : (
                  currentMedia && (
                    <img
                      src={currentMedia}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      loading="eager"
                      decoding="async"
                      fetchpriority="high"
                    />
                  )
                )}

                {/* Prev / Next arrows */}
                {hasMultiple && (
                  <>
                    <button
                      onClick={() => setSelectedIndex((prev) => (prev - 1 + media.length) % media.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 shadow-lg hover:bg-white transition-colors"
                      aria-label="Previous"
                    >
                      <ChevronLeft className="h-5 w-5 text-stone-800" />
                    </button>
                    <button
                      onClick={() => setSelectedIndex((prev) => (prev + 1) % media.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 shadow-lg hover:bg-white transition-colors"
                      aria-label="Next"
                    >
                      <ChevronRight className="h-5 w-5 text-stone-800" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail strip */}
              {hasMultiple && (
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {media.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedIndex(i)}
                      className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                        selectedIndex === i
                          ? "border-primary ring-1 ring-primary"
                          : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      {getMediaType(item) === "video" ? (
                        <OptimizedVideo
                          noWrapper
                          src={item}
                          className="w-full h-full object-cover"
                          muted
                          playsInline
                          preload="metadata"
                        />
                      ) : (
                        <img
                          src={item}
                          alt={`${product.name} ${i + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Info column ────────────────────────────────────── */}
            <div className="flex flex-col gap-5 lg:pt-2">

              {/* Category breadcrumb */}
              {category && (
                <Link
                  to={`/category/${category.id}`}
                  className="inline-flex items-center gap-1 text-sm text-primary font-medium hover:underline w-fit"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Shop more {category.name} jewelry
                </Link>
              )}

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">
                {product.name}
              </h1>

              {/* Price */}
              {priceSettings.showPrices && product.price && (
                <p className="text-xl font-semibold text-foreground/90">
                  ${formatPriceRounded(product.price)}
                </p>
              )}

              {/* Description */}
              {product.description && (
                <div
                  className="prose prose-sm max-w-none text-foreground/80"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              )}

              {/* CTA */}
              <div className="pt-2">
                <WhatsAppButton product={product} className="w-full h-12 text-sm font-bold" />
              </div>

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
