import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import WhatsAppButton from "@/components/WhatsAppButton";
import ProductCard from "@/components/ProductCard";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  loadProducts,
  selectContentHydrated,
  selectContentStatus,
  selectGlobalData,
  selectProductsLoaded,
  selectProductsStatus,
} from "@/store/contentSlice";
import {
  buildFaqForProduct,
  buildMetaDescriptionForProduct,
  buildMetaTitleForProduct,
  buildOffer,
  stripHtml,
} from "@/lib/seo";
import { ChevronLeft, ChevronRight, Gem } from "lucide-react";
import { preloadMedia } from "@/lib/preload";
import { OptimizedVideo } from "@/components/ui/optimized-video";
import { useHeaderOffset } from "@/hooks/useHeaderOffset";
import { formatPriceRounded } from "@/lib/utils";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { categories, promoHeader, products, priceSettings } =
    useAppSelector(selectGlobalData);
  const status = useAppSelector(selectContentStatus);
  const hydrated = useAppSelector(selectContentHydrated);
  const productsLoaded = useAppSelector(selectProductsLoaded);
  const productsStatus = useAppSelector(selectProductsStatus);
  const isReady = status === "succeeded" || hydrated;
  const productsReady =
    productsLoaded ||
    productsStatus === "succeeded" ||
    productsStatus === "failed";

  const paddingTop = useHeaderOffset();

  const product = useMemo(
    () => products.find((p) => p.id === id) || null,
    [products, id]
  );
  const category = useMemo(
    () => categories.find((c) => c.id === product?.categoryId) || null,
    [categories, product?.categoryId]
  );

  const relatedProducts = useMemo(
    () =>
      products
        .filter(
          (p) => p.categoryId === product?.categoryId && p.id !== product?.id
        )
        .slice(0, 4),
    [products, product]
  );

  const media =
    product?.images && product.images.length > 0
      ? product.images
      : product?.image
      ? [product.image]
      : [];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const currentMedia = media[selectedIndex] || null;
  const hasMultiple = media.length > 1;

  const getMediaType = (url: string): "image" | "video" => {
    const videoExtensions = /\.(mp4|webm|ogg|mov|avi|mkv)$/i;
    return videoExtensions.test(url) || url.includes("video")
      ? "video"
      : "image";
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
        description: stripHtml(
          product.description ||
            `${product.name} from Flenix Jewels Ltd`
        ),
        sku: product.id,
        category: category?.name,
        mainEntityOfPage: `https://www.flenixjewels.com/product/${product.id}`,
        brand: { "@type": "Brand", name: "Flenix Jewels Ltd" },
        offers: buildOffer(
          `https://www.flenixjewels.com/product/${product.id}`,
          product.price
        ),
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.9",
          reviewCount: "150",
          bestRating: "5",
          worstRating: "1",
        },
      }
    : undefined;

  /* ── Loading skeleton ───────────────────────────────────────── */
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-[55%_1fr] gap-10">
              <div className="aspect-square bg-muted rounded-3xl animate-pulse" />
              <div className="space-y-5 pt-2">
                <div className="h-4 w-32 bg-muted rounded-full animate-pulse" />
                <div className="h-8 w-4/5 bg-muted rounded-lg animate-pulse" />
                <div className="h-5 w-1/3 bg-muted rounded-lg animate-pulse" />
                <div className="space-y-2 mt-4">
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} className="h-4 bg-muted rounded animate-pulse" />
                  ))}
                </div>
                <div className="h-12 bg-muted rounded-xl animate-pulse mt-6" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  /* ── Not found ──────────────────────────────────────────────── */
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
          <div className="container mx-auto px-4 py-20 text-center">
            <Gem className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">
              Product not found.
            </p>
            <Link
              to="/categories"
              className="inline-flex items-center gap-2 mt-6 text-sm font-medium text-primary hover:underline"
            >
              <ChevronLeft className="h-4 w-4" />
              Browse all collections
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  /* ── Main page ──────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title={product.metaTitle || buildMetaTitleForProduct(product.name)}
        description={
          product.metaDescription ||
          buildMetaDescriptionForProduct(product.name, category?.name)
        }
        canonicalUrl={`https://www.flenixjewels.com/product/${product.id}`}
        structuredData={structuredData}
        breadcrumbs={[
          { name: "Home", url: "https://www.flenixjewels.com" },
          {
            name: "Collections",
            url: "https://www.flenixjewels.com/categories",
          },
          ...(category
            ? [
                {
                  name: category.name,
                  url: `https://www.flenixjewels.com/category/${category.id}`,
                },
              ]
            : []),
          {
            name: product.name,
            url: `https://www.flenixjewels.com/product/${product.id}`,
          },
        ]}
        faqItems={
          product.seoFaq && product.seoFaq.length > 0
            ? product.seoFaq
            : buildFaqForProduct(product.name, category?.name)
        }
      />

      <Header promoHeader={promoHeader} />

      <main className="flex-1" style={{ paddingTop }}>
        {/* ── Product section ─────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-[55%_1fr] gap-8 lg:gap-12 items-start">

            {/* ── LEFT: Media viewer ──────────────────────────── */}
            <div className="lg:sticky lg:top-24 space-y-3">

              {/* Main viewer — ALL items always in DOM, toggled via opacity.
                  This keeps videos buffered so switching back is instant. */}
              <div className="relative w-full aspect-square sm:aspect-[4/5] max-h-[62vw] sm:max-h-[68vh] lg:max-h-[calc(100vh-9rem)] rounded-2xl overflow-hidden bg-black">

                {media.map((item, i) => {
                  const isActive = i === selectedIndex;
                  const type = getMediaType(item);
                  return (
                    <div
                      key={i}
                      className={`absolute inset-0 transition-opacity duration-300 ${
                        isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                      }`}
                    >
                      {type === "video" ? (
                        <OptimizedVideo
                          noWrapper
                          src={item}
                          className="w-full h-full object-contain"
                          autoPlay={isActive}
                          muted
                          loop
                          playsInline
                          controls={isActive}
                          preload="auto"
                        />
                      ) : (
                        <img
                          src={item}
                          alt={`${product.name} view ${i + 1}`}
                          className="w-full h-full object-contain"
                          loading={i === 0 ? "eager" : "lazy"}
                          decoding="async"
                          fetchpriority={i === 0 ? "high" : "low"}
                        />
                      )}
                    </div>
                  );
                })}

                {/* Prev / Next */}
                {hasMultiple && (
                  <>
                    <button
                      onClick={() =>
                        setSelectedIndex(
                          (prev) => (prev - 1 + media.length) % media.length
                        )
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white/95 dark:bg-stone-800/95 shadow-lg hover:scale-110 transition-transform"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-5 w-5 text-stone-700 dark:text-stone-200" />
                    </button>
                    <button
                      onClick={() =>
                        setSelectedIndex(
                          (prev) => (prev + 1) % media.length
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white/95 dark:bg-stone-800/95 shadow-lg hover:scale-110 transition-transform"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-5 w-5 text-stone-700 dark:text-stone-200" />
                    </button>

                    {/* Dot indicators on mobile */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 sm:hidden">
                      {media.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedIndex(i)}
                          className={`h-2 rounded-full transition-all duration-300 ${
                            selectedIndex === i
                              ? "bg-primary w-4"
                              : "bg-white/60 w-2"
                          }`}
                          aria-label={`Go to item ${i + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnail strip — hidden on mobile (dots used instead) */}
              {hasMultiple && (
                <div className="hidden sm:flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                  {media.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedIndex(i)}
                      className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 bg-stone-100 dark:bg-stone-900 ${
                        selectedIndex === i
                          ? "border-primary ring-1 ring-primary/50"
                          : "border-transparent opacity-55 hover:opacity-100"
                      }`}
                    >
                      {getMediaType(item) === "video" ? (
                        <OptimizedVideo
                          noWrapper
                          src={item}
                          className="w-full h-full object-contain"
                          muted
                          playsInline
                          preload="metadata"
                        />
                      ) : (
                        <img
                          src={item}
                          alt={`${product.name} view ${i + 1}`}
                          className="w-full h-full object-contain"
                          loading="lazy"
                          decoding="async"
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── RIGHT: Product info ─────────────────────────── */}
            <div className="flex flex-col gap-5">

              {/* Breadcrumb */}
              <nav className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
                <Link to="/categories" className="hover:text-foreground transition-colors">
                  Collections
                </Link>
                {category && (
                  <>
                    <ChevronRight className="h-3 w-3 flex-shrink-0" />
                    <Link
                      to={`/category/${category.id}`}
                      className="hover:text-foreground transition-colors"
                    >
                      {category.name}
                    </Link>
                  </>
                )}
              </nav>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight">
                {product.name}
              </h1>

              {/* Price */}
              {priceSettings.showPrices && product.price && (
                <p className="text-xl font-semibold text-foreground">
                  ${formatPriceRounded(product.price)}
                </p>
              )}

              {/* Divider */}
              <div className="border-t border-border/60" />

              {/* Description */}
              {product.description && (
                <div
                  className="prose prose-sm dark:prose-invert max-w-none text-foreground/80 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              )}

              {/* CTA */}
              <div className="pt-1">
                <WhatsAppButton
                  product={product}
                  className="w-full h-12 text-sm font-bold tracking-wide"
                />
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                {[
                  { icon: "🔒", label: "Secure Enquiry" },
                  { icon: "💎", label: "Premium Quality" },
                  { icon: "🚚", label: "Worldwide Delivery" },
                ].map((badge) => (
                  <div
                    key={badge.label}
                    className="flex flex-col items-center gap-1.5 rounded-xl border border-border/50 py-3 px-2 text-center"
                  >
                    <span className="text-xl">{badge.icon}</span>
                    <span className="text-[10px] font-medium text-muted-foreground leading-tight">
                      {badge.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Category shop link */}
              {category && (
                <Link
                  to={`/category/${category.id}`}
                  className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline underline-offset-2 mt-1"
                >
                  <Gem className="h-3.5 w-3.5" />
                  Shop more {category.name} jewelry
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* ── More from this collection ────────────────────────── */}
        {relatedProducts.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
            <div className="border-t border-border/60 pt-10 mb-6">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                More from{" "}
                <span className="text-primary">{category?.name ?? "this collection"}</span>
              </h2>
              {category && (
                <Link
                  to={`/category/${category.id}`}
                  className="inline-flex items-center gap-1 mt-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  View all
                  <ChevronRight className="h-4 w-4" />
                </Link>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onClick={() => navigate(`/product/${p.id}`)}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
