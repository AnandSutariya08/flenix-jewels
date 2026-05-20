import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  getBanners,
  getCategories,
  getProducts,
  getGallery,
  getFeaturedCollection,
  getBlogs,
  getInstagramPosts,
  getTestimonials,
  getPromoHeader,
  getContact,
  getOffices,
  getPriceSettings,
  initializeDefaultData,
  type Banner,
  type Category,
  type Product,
  type GalleryItem,
  type FeaturedCollection,
  type BlogPost,
  type InstagramPost,
  type Testimonial,
  type PromoHeader,
  type ContactInfo,
  type Office,
  type PriceSettings,
} from "@/lib/storage";
import { getBuyingGuides, type BuyingGuide } from "@/lib/buyingGuides";
import type { RootState } from "./store";

export interface GlobalData {
  banners: Banner[];
  categories: Category[];
  products: Product[];
  galleryItems: GalleryItem[];
  featuredCollection: FeaturedCollection[];
  blogs: BlogPost[];
  instagramPosts: InstagramPost[];
  testimonials: Testimonial[];
  promoHeader: PromoHeader | null;
  contactInfo: ContactInfo | null;
  offices: Office[];
  buyingGuides: BuyingGuide[];
  priceSettings: PriceSettings;
}

interface ContentState {
  data: GlobalData;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  hydrated: boolean;
  lastUpdated: number | null;
  deferredStatus: "idle" | "loading" | "succeeded" | "failed";
  deferredLoaded: boolean;
  productsStatus: "idle" | "loading" | "succeeded" | "failed";
  productsLoaded: boolean;
  blogsStatus: "idle" | "loading" | "succeeded" | "failed";
  blogsLoaded: boolean;
}

const computeDeferredLoaded = (data: GlobalData) =>
  data.galleryItems.length > 0 ||
  data.featuredCollection.length > 0 ||
  data.instagramPosts.length > 0 ||
  data.testimonials.length > 0 ||
  Boolean(data.contactInfo) ||
  data.offices.length > 0 ||
  data.buyingGuides.length > 0;

// Bump cache version to avoid stale data (especially after Firebase project changes).
const SESSION_KEY = "flenix_global_data_v5";
const LOCAL_KEY = "flenix_global_data_v5_persisted";
const CACHE_TTL_MS = 5 * 60 * 1000;

const emptyData: GlobalData = {
  banners: [],
  categories: [],
  products: [],
  galleryItems: [],
  featuredCollection: [],
  blogs: [],
  instagramPosts: [],
  testimonials: [],
  promoHeader: null,
  contactInfo: null,
  offices: [],
  buyingGuides: [],
  priceSettings: { showPrices: false },
};

const normalizeBuyingGuides = (guides: BuyingGuide[]): BuyingGuide[] => {
  return guides.map((g) => {
    const anyGuide = g as BuyingGuide & { createdAt?: unknown };
    const createdAt = anyGuide.createdAt;
    const asDate =
      createdAt && typeof createdAt === "object" && "toDate" in (createdAt as object)
        ? (createdAt as { toDate: () => Date }).toDate()
        : createdAt instanceof Date
        ? createdAt
        : typeof createdAt === "number"
        ? new Date(createdAt)
        : typeof createdAt === "string"
        ? new Date(createdAt)
        : null;
    return {
      ...g,
      createdAt: asDate ? asDate.toISOString() : (g as BuyingGuide).createdAt,
    };
  });
};

const normalizeBlogDates = (blogs: BlogPost[]): BlogPost[] => {
  return blogs.map((b) => {
    const anyBlog = b as BlogPost & { date?: unknown };
    const dateValue = anyBlog.date;
    const asDate =
      dateValue && typeof dateValue === "object" && "toDate" in (dateValue as object)
        ? (dateValue as { toDate: () => Date }).toDate()
        : dateValue instanceof Date
        ? dateValue
        : typeof dateValue === "number"
        ? new Date(dateValue)
        : typeof dateValue === "string"
        ? new Date(dateValue)
        : null;
    return {
      ...b,
      date: asDate ? asDate.toISOString() : (b as BlogPost).date,
    };
  });
};

const safeParse = (value: string | null) => {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

type CacheSnapshot = {
  data: GlobalData;
  savedAt: number;
  deferredLoaded?: boolean;
  productsLoaded?: boolean;
  blogsLoaded?: boolean;
};

const normalizeCachePayload = (raw: unknown): CacheSnapshot | null => {
  if (!raw || typeof raw !== "object" || !("data" in raw)) return null;
  const snapshot = raw as {
    data?: GlobalData;
    savedAt?: number;
    deferredLoaded?: boolean;
    productsLoaded?: boolean;
    blogsLoaded?: boolean;
  };
  if (!snapshot.data) return null;
  return {
    data: {
      ...snapshot.data,
      blogs: Array.isArray(snapshot.data.blogs) ? snapshot.data.blogs : [],
    },
    savedAt: snapshot.savedAt || Date.now(),
    deferredLoaded: Boolean(snapshot.deferredLoaded),
    productsLoaded: Boolean(snapshot.productsLoaded),
    blogsLoaded: Boolean(snapshot.blogsLoaded),
  };
};

const readSessionCache = (): CacheSnapshot | null => {
  if (typeof window === "undefined") return null;
  return normalizeCachePayload(safeParse(sessionStorage.getItem(SESSION_KEY)));
};

const readPersistentCache = (): CacheSnapshot | null => {
  if (typeof window === "undefined") return null;
  const snapshot = normalizeCachePayload(safeParse(localStorage.getItem(LOCAL_KEY)));
  if (!snapshot) return null;
  if (Date.now() - snapshot.savedAt > CACHE_TTL_MS) return null;
  return snapshot;
};

const saveCache = (data: GlobalData, deferredLoaded: boolean, productsLoaded: boolean, blogsLoaded: boolean) => {
  if (typeof window === "undefined") return;
  const payload = JSON.stringify({
    savedAt: Date.now(),
    data,
    deferredLoaded,
    productsLoaded,
    blogsLoaded,
  });
  try {
    sessionStorage.setItem(SESSION_KEY, payload);
    localStorage.setItem(LOCAL_KEY, payload);
  } catch {
    // ignore quota / privacy errors
  }
};

const cached = readSessionCache() ?? readPersistentCache();

const initialState: ContentState = {
  data: cached?.data ?? emptyData,
  status: cached ? "succeeded" : "idle",
  error: null,
  hydrated: Boolean(cached),
  lastUpdated: cached?.savedAt ?? null,
  deferredStatus: cached?.deferredLoaded ? "succeeded" : "idle",
  deferredLoaded: Boolean(cached?.deferredLoaded),
  productsStatus: cached?.productsLoaded ? "succeeded" : "idle",
  productsLoaded: Boolean(
    cached?.productsLoaded ??
      (cached?.data?.products ? true : false)
  ),
  blogsStatus: cached?.blogsLoaded ? "succeeded" : "idle",
  blogsLoaded: Boolean(cached?.blogsLoaded),
};

export const loadGlobalData = createAsyncThunk<
  GlobalData,
  { force?: boolean } | undefined,
  { state: RootState }
>(
  "content/loadGlobalData",
  async (args) => {
    if (!args?.force) {
      const session = readSessionCache() ?? readPersistentCache();
      if (session?.data) {
        const promoHeaderDisabled = session.data.promoHeader
          ? { ...session.data.promoHeader, enabled: false }
          : null;
        return {
          ...emptyData,
          ...session.data,
          featuredCollection: [],
          galleryItems: [],
          instagramPosts: [],
          testimonials: [],
          contactInfo: null,
          offices: [],
          buyingGuides: [],
          promoHeader: promoHeaderDisabled,
          blogs: session.blogsLoaded ? session.data.blogs : [],
          products: session.productsLoaded ? session.data.products : [],
        };
      }
    }

    await initializeDefaultData();

    const [
      banners,
      categories,
      promoHeader,
      priceSettings,
      contactInfo,
    ] = await Promise.all([
      getBanners(),
      getCategories(),
      getPromoHeader(),
      getPriceSettings(),
      getContact(),
    ]);

    return {
      banners,
      categories,
      products: [],
      galleryItems: [],
      featuredCollection: [],
      blogs: [],
      instagramPosts: [],
      testimonials: [],
      promoHeader: promoHeader ? { ...promoHeader, enabled: false } : promoHeader,
      contactInfo,
      offices: [],
      buyingGuides: [],
      priceSettings,
    };
  },
  {
    condition: (args, { getState }) => {
      const { content } = getState();
      if (args?.force) return true;
      if (content.status === "loading") return false;
      if (content.hydrated) return false;
      return true;
    },
  }
);

export const loadDeferredData = createAsyncThunk<
  Pick<GlobalData, "galleryItems" | "featuredCollection" | "instagramPosts" | "testimonials" | "contactInfo" | "offices" | "buyingGuides">,
  { force?: boolean } | undefined,
  { state: RootState }
>(
  "content/loadDeferredData",
  async (args) => {
    if (!args?.force) {
      const session = readSessionCache() ?? readPersistentCache();
      if (session?.deferredLoaded) {
        const hasSomething =
          (session.data.galleryItems?.length ?? 0) > 0 ||
          (session.data.featuredCollection?.length ?? 0) > 0 ||
          (session.data.testimonials?.length ?? 0) > 0 ||
          (session.data.offices?.length ?? 0) > 0;
        if (hasSomething) {
          return {
            galleryItems: session.data.galleryItems,
            featuredCollection: session.data.featuredCollection,
            instagramPosts: session.data.instagramPosts,
            testimonials: session.data.testimonials,
            contactInfo: session.data.contactInfo,
            offices: session.data.offices,
            buyingGuides: session.data.buyingGuides,
          };
        }
      }
    }

    const [
      galleryItems,
      featuredCollection,
      instagramPosts,
      testimonials,
      contactInfo,
      offices,
      buyingGuides,
    ] = await Promise.all([
      getGallery(),
      getFeaturedCollection(),
      getInstagramPosts(),
      getTestimonials(),
      getContact(),
      getOffices(),
      getBuyingGuides(),
    ]);

    return {
      galleryItems,
      featuredCollection,
      instagramPosts,
      testimonials,
      contactInfo,
      offices,
      buyingGuides: normalizeBuyingGuides(buyingGuides),
    };
  },
  {
    condition: (args, { getState }) => {
      const { content } = getState();
      if (args?.force) return true;
      if (content.deferredStatus === "loading") return false;
      if (content.deferredLoaded) {
        // Allow a re-fetch if any deferred section is still empty.
        // This prevents stale caches from showing "Coming Soon" even when Firestore has data.
        const hasAnyDeferredContent =
          content.data.galleryItems.length > 0 ||
          content.data.featuredCollection.length > 0 ||
          content.data.instagramPosts.length > 0 ||
          content.data.testimonials.length > 0 ||
          Boolean(content.data.contactInfo) ||
          content.data.offices.length > 0 ||
          content.data.buyingGuides.length > 0;
        if (hasAnyDeferredContent) return false;
      }
      return true;
    },
  }
);

export const loadProducts = createAsyncThunk<
  Product[],
  { force?: boolean } | undefined,
  { state: RootState }
>(
  "content/loadProducts",
  async (args) => {
    if (!args?.force) {
      const session = readSessionCache() ?? readPersistentCache();
      if (session?.productsLoaded && session.data?.products) {
        return session.data.products;
      }
    }
    const products = await getProducts();
    return products;
  },
  {
    condition: (args, { getState }) => {
      const { content } = getState();
      if (args?.force) return true;
      if (content.productsStatus === "loading") return false;
      if (content.productsLoaded) return false;
      return true;
    },
  }
);

export const loadBlogs = createAsyncThunk<
  BlogPost[],
  { force?: boolean } | undefined,
  { state: RootState }
>(
  "content/loadBlogs",
  async (args) => {
    const blogs = await getBlogs();
    return normalizeBlogDates(blogs);
  },
  {
    condition: (args, { getState }) => {
      const { content } = getState();
      if (args?.force) return true;
      if (content.blogsStatus === "loading") return false;
      if (content.blogsLoaded) return false;
      return true;
    },
  }
);

const contentSlice = createSlice({
  name: "content",
  initialState,
  reducers: {
    setGlobalData(state, action: PayloadAction<GlobalData>) {
      state.data = action.payload;
      state.status = "succeeded";
      state.error = null;
      state.hydrated = true;
      state.lastUpdated = Date.now();
      state.deferredLoaded =
        action.payload.galleryItems.length > 0 ||
        action.payload.featuredCollection.length > 0 ||
        action.payload.instagramPosts.length > 0 ||
        action.payload.testimonials.length > 0 ||
        Boolean(action.payload.contactInfo) ||
        action.payload.offices.length > 0 ||
        action.payload.buyingGuides.length > 0;
      state.deferredStatus = state.deferredLoaded ? "succeeded" : state.deferredStatus;
      saveCache(action.payload, state.deferredLoaded, state.productsLoaded, state.blogsLoaded);
    },
    patchGlobalData(state, action: PayloadAction<Partial<GlobalData>>) {
      state.data = { ...state.data, ...action.payload };
      state.status = "succeeded";
      state.error = null;
      state.hydrated = true;
      state.lastUpdated = Date.now();
      if (action.payload.products) state.productsLoaded = true;
      if (action.payload.blogs) state.blogsLoaded = true;
      state.deferredLoaded = computeDeferredLoaded(state.data);
      if (state.deferredLoaded && state.deferredStatus === "idle") state.deferredStatus = "succeeded";
      saveCache(state.data, state.deferredLoaded, state.productsLoaded, state.blogsLoaded);
    },
    patchDeferredData(
      state,
      action: PayloadAction<
        Pick<
          GlobalData,
          "galleryItems" | "featuredCollection" | "instagramPosts" | "testimonials" | "contactInfo" | "offices" | "buyingGuides"
        >
      >
    ) {
      state.data = { ...state.data, ...action.payload };
      state.deferredLoaded = computeDeferredLoaded(state.data);
      state.deferredStatus = "succeeded";
      state.hydrated = true;
      state.lastUpdated = Date.now();
      saveCache(state.data, state.deferredLoaded, state.productsLoaded, state.blogsLoaded);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadGlobalData.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loadGlobalData.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = {
          ...state.data,
          ...action.payload,
          products: state.productsLoaded ? state.data.products : action.payload.products,
          blogs: state.blogsLoaded ? state.data.blogs : action.payload.blogs,
          galleryItems: state.data.galleryItems.length > 0 ? state.data.galleryItems : action.payload.galleryItems,
          featuredCollection: state.data.featuredCollection.length > 0 ? state.data.featuredCollection : action.payload.featuredCollection,
          instagramPosts: state.data.instagramPosts.length > 0 ? state.data.instagramPosts : action.payload.instagramPosts,
          testimonials: state.data.testimonials.length > 0 ? state.data.testimonials : action.payload.testimonials,
          offices: state.data.offices.length > 0 ? state.data.offices : action.payload.offices,
          buyingGuides: state.data.buyingGuides.length > 0 ? state.data.buyingGuides : action.payload.buyingGuides,
        };
        state.hydrated = true;
        state.lastUpdated = Date.now();
        saveCache(state.data, state.deferredLoaded, state.productsLoaded, state.blogsLoaded);
      })
      .addCase(loadGlobalData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Failed to load data";
      })
      .addCase(loadDeferredData.pending, (state) => {
        state.deferredStatus = "loading";
      })
      .addCase(loadDeferredData.fulfilled, (state, action) => {
        state.deferredStatus = "succeeded";
        state.deferredLoaded = true;
        state.data = {
          ...state.data,
          ...action.payload,
        };
        state.lastUpdated = Date.now();
        saveCache(state.data, state.deferredLoaded, state.productsLoaded, state.blogsLoaded);
      })
      .addCase(loadDeferredData.rejected, (state, action) => {
        state.deferredStatus = "failed";
        state.error = action.error.message ?? "Failed to load deferred data";
      })
      .addCase(loadProducts.pending, (state) => {
        state.productsStatus = "loading";
      })
      .addCase(loadProducts.fulfilled, (state, action) => {
        state.productsStatus = "succeeded";
        state.productsLoaded = true;
        state.data.products = action.payload;
        saveCache(state.data, state.deferredLoaded, state.productsLoaded, state.blogsLoaded);
      })
      .addCase(loadProducts.rejected, (state, action) => {
        state.productsStatus = "failed";
        state.error = action.error.message ?? "Failed to load products";
      })
      .addCase(loadBlogs.pending, (state) => {
        state.blogsStatus = "loading";
      })
      .addCase(loadBlogs.fulfilled, (state, action) => {
        state.blogsStatus = "succeeded";
        state.blogsLoaded = true;
        state.data.blogs = action.payload;
        saveCache(state.data, state.deferredLoaded, state.productsLoaded, state.blogsLoaded);
      })
      .addCase(loadBlogs.rejected, (state, action) => {
        state.blogsStatus = "failed";
        state.error = action.error.message ?? "Failed to load blogs";
      });
  },
});

export const { setGlobalData, patchGlobalData, patchDeferredData } = contentSlice.actions;

export const selectGlobalData = (state: RootState) => state.content.data;
export const selectContentStatus = (state: RootState) => state.content.status;
export const selectContentHydrated = (state: RootState) => state.content.hydrated;
export const selectContentError = (state: RootState) => state.content.error;
export const selectDeferredStatus = (state: RootState) => state.content.deferredStatus;
export const selectDeferredLoaded = (state: RootState) => state.content.deferredLoaded;
export const selectProductsStatus = (state: RootState) => state.content.productsStatus;
export const selectProductsLoaded = (state: RootState) => state.content.productsLoaded;
export const selectBlogsStatus = (state: RootState) => state.content.blogsStatus;
export const selectBlogsLoaded = (state: RootState) => state.content.blogsLoaded;

export default contentSlice.reducer;
