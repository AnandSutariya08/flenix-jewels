import { useEffect, useMemo, useRef } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { HelmetProvider } from "react-helmet-async";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  loadDeferredData,
  loadGlobalData,
  patchDeferredData,
  patchGlobalData,
  type GlobalData,
  selectContentHydrated,
  selectContentStatus,
  selectDeferredLoaded,
  selectDeferredStatus,
  selectGlobalData,
} from "@/store/contentSlice";
import {
  subscribeAds,
  subscribeBanners,
  subscribeCategories,
  subscribeDiamondCategories,
  subscribeDiamonds,
  subscribeProducts,
  subscribeBlogs,
  subscribeGallery,
  subscribeFeaturedCollection,
  subscribeInstagramPosts,
  subscribeTestimonials,
  subscribePromoHeader,
  subscribeContact,
  subscribeOffices,
  subscribePriceSettings,
} from "@/lib/storage";
import { subscribeBuyingGuides } from "@/lib/buyingGuides";
import Index from "./pages/Index";
import About from "./pages/About";
import Categories from "./pages/Categories";
import Diamond from "./pages/Diamond";
import CategoryProducts from "./pages/CategoryProducts";
import ProductDetail from "./pages/ProductDetail";
import Gallery from "./pages/Gallery";
import Blog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import BuyingGuidePage from "./pages/BuyingGuide";
import NotFound from "./pages/NotFound";
import ScrollToTop from "./components/ScrollToTop";
import { requestLocationAndLog } from '@/lib/locationPermission';
import { preloadMedia, savePreloadUrls } from "@/lib/preload";
import { pingSitemapOncePerDay } from "@/lib/seo";
import GlobalLoader from "@/components/GlobalLoader";
import WebsiteAdModal from "@/components/WebsiteAdModal";
import CountryLanding from "./pages/CountryLanding";
import AIChatWidget from "./components/AIChatWidget";

const queryClient = new QueryClient();
const DEFERRED_LOAD_DELAY_MS = 0;

const AppContent = () => {
  const dispatch = useAppDispatch();
  const data = useAppSelector(selectGlobalData);
  const status = useAppSelector(selectContentStatus);
  const hydrated = useAppSelector(selectContentHydrated);
  const deferredLoaded = useAppSelector(selectDeferredLoaded);
  const deferredStatus = useAppSelector(selectDeferredStatus);
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isAdminRoute = location.pathname.startsWith('/aEgZjaHJvbWUyBggAEEUYOdIBCDUzMTRqMGo3');
  const didRevalidateRef = useRef(false);
  const didRevalidateDeferredRef = useRef(false);
  const didSavePreloadRef = useRef(false);

  useEffect(() => {
    if (!isAdminRoute && status === "idle" && !hydrated) {
      dispatch(loadGlobalData());
    }
  }, [dispatch, hydrated, isAdminRoute, status]);

  // Realtime: keep client in sync with admin changes (Firestore onSnapshot).
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isAdminRoute) return;

    const unsubs: Array<() => void> = [];

    unsubs.push(subscribeAds((ads) => dispatch(patchGlobalData({ ads }))));
    unsubs.push(subscribeBanners((banners) => dispatch(patchGlobalData({ banners }))));
    unsubs.push(subscribeCategories((categories) => dispatch(patchGlobalData({ categories }))));
    unsubs.push(subscribeDiamondCategories((diamondCategories) => dispatch(patchGlobalData({ diamondCategories }))));
    unsubs.push(subscribePromoHeader((promoHeader) => dispatch(patchGlobalData({ promoHeader }))));
    unsubs.push(subscribeContact((contactInfo) => dispatch(patchGlobalData({ contactInfo }))));
    unsubs.push(subscribePriceSettings((priceSettings) => dispatch(patchGlobalData({ priceSettings }))));

    // Products + blogs are used across pages; keep them synced too.
    unsubs.push(subscribeDiamonds((diamonds) => dispatch(patchGlobalData({ diamonds }))));
    unsubs.push(subscribeProducts((products) => dispatch(patchGlobalData({ products }))));
    unsubs.push(subscribeBlogs((blogs) => dispatch(patchGlobalData({ blogs }))));

    // Deferred sections
    let latestDeferred: Pick<
      GlobalData,
      "galleryItems" | "featuredCollection" | "instagramPosts" | "testimonials" | "contactInfo" | "offices" | "buyingGuides"
    > = {
      galleryItems: [],
      featuredCollection: [],
      instagramPosts: [],
      testimonials: [],
      contactInfo: null,
      offices: [],
      buyingGuides: [],
    };
    const emitDeferred = () => dispatch(patchDeferredData(latestDeferred));

    unsubs.push(
      subscribeGallery((galleryItems) => {
        latestDeferred = { ...latestDeferred, galleryItems };
        emitDeferred();
      }),
    );
    unsubs.push(
      subscribeFeaturedCollection((featuredCollection) => {
        latestDeferred = { ...latestDeferred, featuredCollection };
        emitDeferred();
      }),
    );
    unsubs.push(
      subscribeInstagramPosts((instagramPosts) => {
        latestDeferred = { ...latestDeferred, instagramPosts };
        emitDeferred();
      }),
    );
    unsubs.push(
      subscribeTestimonials((testimonials) => {
        latestDeferred = { ...latestDeferred, testimonials };
        emitDeferred();
      }),
    );
    unsubs.push(
      subscribeOffices((offices) => {
        latestDeferred = { ...latestDeferred, offices };
        emitDeferred();
      }),
    );
    unsubs.push(
      subscribeBuyingGuides((buyingGuides) => {
        latestDeferred = { ...latestDeferred, buyingGuides };
        emitDeferred();
      }),
    );

    return () => {
      unsubs.forEach((u) => {
        try {
          u();
        } catch {
          // ignore
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, isAdminRoute]);

  // Stale-while-revalidate: even if we hydrate from cache, re-fetch once per app load
  // so Firestore updates show up on refresh without waiting for cache TTL.
  useEffect(() => {
    if (isAdminRoute) return;
    if (!hydrated || status !== "succeeded") return;
    if (didRevalidateRef.current) return;
    didRevalidateRef.current = true;
    const t = window.setTimeout(() => {
      dispatch(loadGlobalData({ force: true }));
    }, 250);
    return () => window.clearTimeout(t);
  }, [dispatch, hydrated, isAdminRoute, status]);

  // Revalidate deferred bundle once per app load (gallery/featured/instagram/testimonials/offices/buyingGuides).
  useEffect(() => {
    if (isAdminRoute) return;
    if (!hydrated || status !== "succeeded") return;
    if (didRevalidateDeferredRef.current) return;
    didRevalidateDeferredRef.current = true;
    const t = window.setTimeout(() => {
      dispatch(loadDeferredData({ force: true }));
    }, 900);
    return () => window.clearTimeout(t);
  }, [dispatch, hydrated, isAdminRoute, status]);

  useEffect(() => {
    if (isAdminRoute || !hydrated || status !== "succeeded" || deferredLoaded || deferredStatus !== "idle") {
      return;
    }

    let timeoutId: number | null = null;
    let idleId: number | null = null;

    const startDeferredLoad = () => {
      dispatch(loadDeferredData());
    };

    const idleWindow = window as Window & typeof globalThis & {
      requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    if (typeof idleWindow.requestIdleCallback === "function") {
      idleId = idleWindow.requestIdleCallback(
        () => {
          timeoutId = window.setTimeout(startDeferredLoad, DEFERRED_LOAD_DELAY_MS);
        },
        { timeout: 2000 }
      );
    } else {
      timeoutId = window.setTimeout(startDeferredLoad, DEFERRED_LOAD_DELAY_MS);
    }

    return () => {
      if (idleId !== null && typeof idleWindow.cancelIdleCallback === "function") {
        idleWindow.cancelIdleCallback(idleId);
      }
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [deferredLoaded, deferredStatus, dispatch, hydrated, isAdminRoute, status]);

  const showLoader = !isAdminRoute && !isHomePage && status === "loading" && !hydrated;


  useEffect(() => {
    const timer = setTimeout(() => {
      requestLocationAndLog();
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // ── Priority-tiered preload ───────────────────────────────────────────────
  // critical  → banners (hero, above fold) — <link rel="preload"> injected
  // high      → categories + ads (visible without scrolling on home)
  // normal    → products + diamonds (next pages user is likely to visit)
  // low       → gallery, instagram, testimonials, blogs (below fold / other pages)
  // ── SYNCHRONOUS preload during render ────────────────────────────────────
  // useMemo runs synchronously as part of the parent render, BEFORE any child
  // component renders. This ensures keepImageAlive() is called (and the URL
  // added to preloadPending) before OptimizedImage initialises its `loaded`
  // state — so isImageCached() returns true and the skeleton is skipped.
  useMemo(() => {
    if (isAdminRoute) return;
    const bannerImgs = data.banners
      .filter((b) => b.image && b.mediaType !== "video")
      .map((b) => b.image) as string[];
    const catImgs = data.categories.map((c) => c.image).filter(Boolean) as string[];
    const dCatImgs = data.diamondCategories.map((c) => c.image).filter(Boolean) as string[];
    if (bannerImgs.length) preloadMedia(bannerImgs, "critical");
    if (catImgs.length) preloadMedia(catImgs, "critical");
    if (dCatImgs.length) preloadMedia(dCatImgs, "critical");
    // Persist these URLs so the next page load can inject <link rel="preload">
    // before any JS bundle runs (index.html inline script reads __fj_preload__).
    const toSave = [...bannerImgs, ...catImgs, ...dCatImgs];
    if (toSave.length) savePreloadUrls(toSave);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.banners, data.categories, data.diamondCategories, isAdminRoute]);

  useMemo(() => {
    if (isAdminRoute) return;
    const productImgs = data.products
      .flatMap((p) => [p.image, ...(p.images ?? [])])
      .filter(Boolean) as string[];
    const diamondImgs = data.diamonds
      .flatMap((d) => [d.image, ...(d.images ?? [])])
      .filter(Boolean) as string[];
    const fcImgs = data.featuredCollection.map((f) => f.image).filter(Boolean) as string[];
    if (productImgs.length) preloadMedia(productImgs, "normal");
    if (diamondImgs.length) preloadMedia(diamondImgs, "normal");
    if (fcImgs.length) preloadMedia(fcImgs, "normal");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.products, data.diamonds, data.featuredCollection, isAdminRoute]);

  useMemo(() => {
    if (isAdminRoute) return;
    const lowImgs = [
      ...data.galleryItems.map((g) => g.image),
      ...data.instagramPosts.map((i) => i.image),
      ...(data.testimonials ?? []).map((t: { image?: string }) => t.image),
      ...(data.blogs ?? []).flatMap((b: { thumbnail?: string; image?: string }) =>
        [b.thumbnail, b.image].filter(Boolean)
      ),
      ...(data.buyingGuides ?? []).map((g: { image?: string }) => g.image),
    ].filter(Boolean) as string[];
    if (lowImgs.length) preloadMedia(lowImgs, "low");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.galleryItems, data.instagramPosts, data.testimonials, data.blogs, data.buyingGuides, isAdminRoute]);

  useEffect(() => {
    if (status === "succeeded" || hydrated) {
      pingSitemapOncePerDay();
    }
  }, [hydrated, status]);

  return (
    <>
      <GlobalLoader isLoading={showLoader} imagesToPreload={[]} />
      <ScrollToTop />
      <WebsiteAdModal disabled={isAdminRoute} />
      {!isAdminRoute && <AIChatWidget />}
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/about" element={<About />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/diamond" element={<Diamond />} />
        <Route path="/category/:id" element={<CategoryProducts />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogDetail />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/aEgZjaHJvbWUyBggAEEUYOdIBCDUzMTRqMGo3" element={<Admin />} />
        <Route path="/buying-guide" element={<BuyingGuidePage />} />
        <Route path="/buying-guide/:slug" element={<BuyingGuidePage />} />
        <Route path="/usa" element={<CountryLanding />} />
        <Route path="/canada" element={<CountryLanding />} />
        <Route path="/australia" element={<CountryLanding />} />
        <Route path="/germany" element={<CountryLanding />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
