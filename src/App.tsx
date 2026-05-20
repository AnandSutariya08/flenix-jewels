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
  selectContentHydrated,
  selectContentStatus,
  selectDeferredLoaded,
  selectDeferredStatus,
  selectGlobalData,
} from "@/store/contentSlice";
import {
  subscribeBanners,
  subscribeCategories,
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
import CategoryProducts from "./pages/CategoryProducts";
import ProductDetail from "./pages/ProductDetail";
import Gallery from "./pages/Gallery";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import BuyingGuidePage from "./pages/BuyingGuide";
import NotFound from "./pages/NotFound";
import ScrollToTop from "./components/ScrollToTop";
import { requestLocationAndLog } from '@/lib/locationPermission';
import { preloadMedia } from "@/lib/preload";
import { pingSitemapOncePerDay } from "@/lib/seo";
import GlobalLoader from "@/components/GlobalLoader";
import CountryLanding from "./pages/CountryLanding";

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

    unsubs.push(subscribeBanners((banners) => dispatch(patchGlobalData({ banners }))));
    unsubs.push(subscribeCategories((categories) => dispatch(patchGlobalData({ categories }))));
    unsubs.push(subscribePromoHeader((promoHeader) => dispatch(patchGlobalData({ promoHeader }))));
    unsubs.push(subscribeContact((contactInfo) => dispatch(patchGlobalData({ contactInfo }))));
    unsubs.push(subscribePriceSettings((priceSettings) => dispatch(patchGlobalData({ priceSettings }))));

    // Products + blogs are used across pages; keep them synced too.
    unsubs.push(subscribeProducts((products) => dispatch(patchGlobalData({ products }))));
    unsubs.push(subscribeBlogs((blogs) => dispatch(patchGlobalData({ blogs }))));

    // Deferred sections
    let latestDeferred = {
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

    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(
        () => {
          timeoutId = window.setTimeout(startDeferredLoad, DEFERRED_LOAD_DELAY_MS);
        },
        { timeout: 2000 }
      );
    } else {
      timeoutId = window.setTimeout(startDeferredLoad, DEFERRED_LOAD_DELAY_MS);
    }

    return () => {
      if (idleId !== null && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
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

  // Collect important images to preload. Deferred images (gallery, featured,
  // instagram) are added here so the browser starts caching them as soon as
  // that data arrives — before the user ever scrolls to those sections.
  const assetUrls = useMemo(() => {
    if (isAdminRoute) return [];
    return [
      ...data.banners.map((b) => b.image).filter(Boolean),
      ...data.categories.map((c) => c.image).filter(Boolean),
      ...data.products.flatMap((p) => [p.image, ...(p.images || [])]).filter(Boolean),
      ...data.featuredCollection.map((f) => f.image).filter(Boolean),
      ...data.galleryItems.map((g) => g.image).filter(Boolean),
      ...data.instagramPosts.map((i) => i.image).filter(Boolean),
      ...(data.testimonials ?? []).map((t: any) => t.image).filter(Boolean),
      ...(data.blogs ?? []).flatMap((b: any) => [b.thumbnail, b.image].filter(Boolean)),
      ...(data.buyingGuides ?? []).map((g: any) => g.image).filter(Boolean),
    ];
  }, [
    data.banners,
    data.categories,
    data.products,
    data.featuredCollection,
    data.galleryItems,
    data.instagramPosts,
    data.testimonials,
    data.blogs,
    data.buyingGuides,
    isAdminRoute,
  ]);

  useEffect(() => {
    if (status === "succeeded" || hydrated) {
      preloadMedia(assetUrls);
    }
  }, [assetUrls, hydrated, status]);

  useEffect(() => {
    if (status === "succeeded" || hydrated) {
      pingSitemapOncePerDay();
    }
  }, [hydrated, status]);

  return (
    <>
      <GlobalLoader isLoading={showLoader} imagesToPreload={[]} />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/about" element={<About />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/category/:id" element={<CategoryProducts />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<Blog />} />
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
