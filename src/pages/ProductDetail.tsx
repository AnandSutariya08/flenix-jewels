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
  parsePrice,
  stripHtml,
} from "@/lib/seo";
import { ChevronLeft, ChevronRight, Gem, Shield, Star, Globe, MessageCircle, Play } from "lucide-react";
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
    // No $ anchor — Firebase Storage URLs end with ?alt=media&token=XXX,
    // so a $ would never match. Also check "vid-" (admin naming convention).
    const videoExtensions = /\.(mp4|webm|ogg|mov|avi|mkv)/i;
    const lower = url.toLowerCase();
    return videoExtensions.test(lower) ||
      lower.includes("video") ||
      lower.includes("vid-")
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
        ogType="product"
        ogImage={
          (product.images && product.images.filter(u => !u.match(/\.(mp4|webm)$/i))[0]) ||
          product.image ||
          undefined
        }
        productMeta={{
          price: parsePrice(product.price) ?? undefined,
          currency: "USD",
        }}
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
            <div className="lg:sticky lg:top-24">

              {/* One unified dark card — image + thumbnails share the same
                  black background so no grey/light gap ever shows through. */}
              <div className="rounded-2xl overflow-hidden bg-black flex flex-col">

              {/* ── Main viewer ─────────────────────────────────
                  All items always in DOM — toggled via opacity only.
                  Videos stay buffered so switching back is instant.  */}
              <div className="relative w-full bg-black"
                style={{ aspectRatio: "1 / 1", maxHeight: "min(62vw, 68vh, calc(100vh - 11rem))" }}>

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
                          preload="auto"
                        />
                      ) : (
                        <img
                          src={item}
                          alt={`${product.name} view ${i + 1}`}
                          className="w-full h-full object-contain"
                          loading={i === 0 ? "eager" : "lazy"}
                          decoding="async"
                        />
                      )}
                    </div>
                  );
                })}

                {/* Prev / Next arrows */}
                {hasMultiple && (
                  <>
                    <button
                      onClick={() => setSelectedIndex((p) => (p - 1 + media.length) % media.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-2.5 rounded-full bg-white/90 dark:bg-stone-800/90 shadow-lg hover:bg-white dark:hover:bg-stone-700 hover:scale-110 transition-all"
                      aria-label="Previous"
                    >
                      <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-stone-700 dark:text-stone-200" />
                    </button>
                    <button
                      onClick={() => setSelectedIndex((p) => (p + 1) % media.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-2.5 rounded-full bg-white/90 dark:bg-stone-800/90 shadow-lg hover:bg-white dark:hover:bg-stone-700 hover:scale-110 transition-all"
                      aria-label="Next"
                    >
                      <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-stone-700 dark:text-stone-200" />
                    </button>
                  </>
                )}

                {/* Dot indicators — always visible at bottom center */}
                {hasMultiple && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
                    {media.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedIndex(i)}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          selectedIndex === i ? "bg-white w-5" : "bg-white/45 w-2 hover:bg-white/70"
                        }`}
                        aria-label={`Go to item ${i + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* ── Thumbnail strip — inside the same dark card ── */}
              {hasMultiple && (
                <div className="flex gap-2 px-3 py-3 overflow-x-auto scrollbar-none border-t border-white/10">
                  {media.map((item, i) => {
                    const isActive = i === selectedIndex;
                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedIndex(i)}
                        className={`
                          flex-shrink-0 rounded-lg overflow-hidden bg-stone-900
                          w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18
                          transition-all duration-200
                          ${isActive
                            ? "ring-2 ring-primary opacity-100"
                            : "ring-1 ring-white/10 opacity-45 hover:opacity-80"
                          }
                        `}
                        aria-label={`View ${i + 1}`}
                      >
                        {getMediaType(item) === "video" ? (
                          <div className="relative w-full h-full">
                            <OptimizedVideo
                              noWrapper
                              src={item}
                              className="w-full h-full object-contain"
                              muted
                              playsInline
                              preload="metadata"
                            />
                            {/* Play badge — always visible so user knows it's a video */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="bg-black/60 rounded-full p-1.5">
                                <Play className="h-3 w-3 text-white fill-white" />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <img
                            src={item}
                            alt={`${product.name} ${i + 1}`}
                            className="w-full h-full object-contain"
                            loading="lazy"
                            decoding="async"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              </div>{/* end unified dark card */}
            </div>

            {/* ── RIGHT: Product info ─────────────────────────── */}
            <div className="flex flex-col gap-5">

              {/* Breadcrumb + Product ID */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <nav className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
                  <Link to="/categories" className="hover:text-foreground transition-colors">Collections</Link>
                  {category && (
                    <>
                      <ChevronRight className="h-3 w-3 flex-shrink-0" />
                      <Link to={`/category/${category.id}`} className="hover:text-foreground transition-colors">
                        {category.name}
                      </Link>
                    </>
                  )}
                </nav>
                <span className="text-[10px] font-mono tracking-wider px-2.5 py-1 rounded-full border border-border/60 text-muted-foreground/70">
                  #{product.id.slice(-8)}
                </span>
              </div>

              {/* Category badge */}
              {category && (
                <div>
                  <span
                    className="inline-flex items-center gap-1.5 text-[10px] font-black tracking-[0.25em] uppercase px-3 py-1.5 rounded-full"
                    style={{ background: 'linear-gradient(135deg,rgba(196,144,106,0.15),rgba(212,169,106,0.12))', color: '#9B6844', border: '1px solid rgba(196,144,106,0.3)' }}
                  >
                    <Gem className="h-2.5 w-2.5" />
                    {category.name}
                  </span>
                </div>
              )}

              {/* Title */}
              <h1 className="text-lg sm:text-xl font-bold leading-tight tracking-tight text-foreground">
                {product.name}
              </h1>

              {/* Gold accent line */}
              <div className="flex items-center gap-2">
                <div className="h-0.5 w-16 rounded-full" style={{ background: 'linear-gradient(90deg,#C4906A,#D4A96A)' }} />
                <div className="h-0.5 w-8 rounded-full" style={{ background: 'rgba(196,144,106,0.4)' }} />
                <div className="h-0.5 w-4 rounded-full" style={{ background: 'rgba(196,144,106,0.2)' }} />
              </div>

              {/* Price */}
              {priceSettings.showPrices && product.price && (
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold" style={{ color: '#9B6844' }}>
                    ${formatPriceRounded(product.price)}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">Enquire for best price</span>
                </div>
              )}

              {/* Description */}
              {product.description && (
                <div
                  className="rounded-2xl p-4 border border-border/40"
                  style={{ background: 'rgba(196,144,106,0.04)' }}
                >
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none text-foreground/80 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                </div>
              )}

              {/* CTA Section */}
              <div className="rounded-2xl p-4 border border-border/40 space-y-3" style={{ background: 'rgba(196,144,106,0.04)' }}>
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 flex-shrink-0" style={{ color: '#9B6844' }} />
                  <p className="text-xs text-muted-foreground leading-snug">
                    For more information, please reach out via WhatsApp, and we will get back to you shortly.
                  </p>
                </div>
                <WhatsAppButton
                  product={product}
                  className="w-full h-12 text-sm font-bold tracking-wide"
                />
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { Icon: Shield, label: "Secure Enquiry", sub: "Private & confidential" },
                  { Icon: Star, label: "Premium Quality", sub: "Certified fine jewels" },
                  { Icon: Globe, label: "Worldwide Shipping", sub: "Order Over $5000" },
                ].map(({ Icon, label, sub }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center gap-2 rounded-xl py-4 px-2 text-center border border-border/40"
                    style={{ background: 'rgba(196,144,106,0.04)' }}
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg,rgba(196,144,106,0.2),rgba(212,169,106,0.15))' }}>
                      <Icon className="h-4 w-4" style={{ color: '#9B6844' }} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-foreground leading-tight">{label}</p>
                      <p className="text-[9px] text-muted-foreground mt-0.5 leading-tight">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Category shop link */}
              {category && (
                <Link
                  to={`/category/${category.id}`}
                  className="inline-flex items-center justify-center gap-2 w-full h-10 rounded-xl border border-border/60 text-xs font-bold tracking-wide transition-all hover:border-primary/40 hover:bg-primary/5"
                  style={{ color: '#9B6844' }}
                >
                  <Gem className="h-3.5 w-3.5" />
                  Browse all {category.name} jewelry
                  <ChevronRight className="h-3.5 w-3.5" />
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
