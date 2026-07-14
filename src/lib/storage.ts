// Firebase data management for Flenix Jewels Ltd
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc, 
  deleteField,
  onSnapshot,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';

export interface Banner {
  id: string;
  image: string;
  lqip?: string;
  title: string;
  description: string;
  mediaType?: 'image' | 'video' | 'gif';
  priority?: number;
}

export interface AdCampaign {
  id: string;
  title?: string;
  description?: string;
  image?: string;
  active: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export interface VisitorLog {
  id?: string;
  ip: string;
  country?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  userAgent: string;
  page: string;
  timestamp: Date;
  grantedLocation: boolean;   // true = user allowed geolocation
}

export interface Category {
  id: string;
  name: string;
  image: string;
  lqip?: string;
  description: string;
  priority?: number;
  metaTitle?: string;
  metaDescription?: string;
  seoFaq?: { question: string; answer: string }[];
}

export type DiamondType = 'real' | 'cvd';
export type DiamondShape = 'round' | 'pear' | 'marquise' | 'oval' | 'heart' | 'princess' | 'cushion' | 'emerald' | 'sq_emerald' | 'radiant' | 'sq_radiant' | 'other';
export type DiamondClarity = 'FL' | 'IF' | 'VVS1' | 'VVS2' | 'VS1' | 'VS2' | 'SI1' | 'SI2' | 'I1' | 'I2';
export type DiamondGrade = 'excellent' | 'very_good' | 'good' | 'fair';
export type DiamondFluorescence = 'none' | 'faint' | 'medium' | 'strong' | 'very_strong';
export type DiamondCertificate = 'GIA' | 'IGI' | 'HRD' | 'GSI' | 'SNJ';

export interface DiamondCategory {
  id: string;
  name: string;
  image: string;
  lqip?: string;
  description: string;
  priority?: number;
  metaTitle?: string;
  metaDescription?: string;
  seoFaq?: { question: string; answer: string }[];
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  image: string;
  images?: string[]; // Multiple product images
  description: string;
  price: string;
  refCode?: string; // Optional reference code e.g. "FLRG14"
  priority?: number;
  createdAt?: number | string | { seconds: number; nanoseconds?: number };
  metaTitle?: string;
  metaDescription?: string;
  seoFaq?: { question: string; answer: string }[];
}

export interface Diamond {
  id: string;
  diamondCategoryId: string;
  diamondType: DiamondType;
  name: string;
  image: string;
  images?: string[];
  description: string;
  price: string;
  priority?: number;
  createdAt?: number | string | { seconds: number; nanoseconds?: number };
  metaTitle?: string;
  metaDescription?: string;
  seoFaq?: { question: string; answer: string }[];
  shape?: DiamondShape;
  carat?: number;
  clarity?: DiamondClarity;
  colorGrade?: string;
  cut?: DiamondGrade;
  polish?: DiamondGrade;
  symmetry?: DiamondGrade;
  fluorescence?: DiamondFluorescence;
  certificate?: DiamondCertificate;
}

export interface GalleryItem {
  id: string;
  image: string;
  lqip?: string;
  description: string;
  category?: string;
  sequence?: number;
}

export interface FeaturedCollection {
  id: string;
  image: string;
  lqip?: string;
  title: string;
  description: string;
  priority?: number;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  image: string;
  thumbnail?: string;
  date: string;
  author?: string;
  category?: string;
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
  seoFaq?: { question: string; answer: string }[];
}

export interface InstagramPost {
  id: string;
  url: string;
  image?: string;
  caption?: string;
  location?: string;
  song?: string;
}

export type CatalogItem = Product | Diamond;

export interface ContactInfo {
  address: string;
  phone: string;
  email: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
  linkedin?: string;
  twitter?: string;
  pinterest?: string;
  whatsapp: string;
}

export interface PromoHeader {
  text: string;
  enabled: boolean;
}

export interface PriceSettings {
  showPrices: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  email?: string;
  location?: string;
  text: string;
  rating: number;
  approved?: boolean;
  source?: 'admin' | 'customer';
  submittedAt?: number;
}

export interface Office {
  id: string;
  country: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  isHeadquarters?: boolean;
  flagImage?: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  submittedAt: number;
  read: boolean;
}

// Collection names
const COLLECTIONS = {
  BANNERS: 'banners',
  CATEGORIES: 'categories',
  DIAMOND_CATEGORIES: 'diamond-categories',
  PRODUCTS: 'products',
  DIAMONDS: 'diamonds',
  GALLERY: 'gallery',
  FEATURED: 'featured-collection',
  CONTACT: 'contact',
  CONTACT_SUBMISSIONS: 'contact-submissions',
  OFFICES: 'offices',
  BLOGS: 'blogs',
  INSTAGRAM: 'instagram',
  VISITORS: 'visitors',
  PROMO_HEADER: 'promo-header',
  TESTIMONIALS: 'testimonials',
  SETTINGS: 'settings',
  ADS: 'ads',
};

const DEFAULT_TICKER_ITEMS = [
  'GIA Certified',
  'IGI Graded',
  'Worldwide Shipping',
  'Lifetime Guarantee',
  '1K+ Happy Clients',
  '15+ Countries',
  'Ethically Sourced',
  'Custom Design',
];

const sanitizeForFirestore = <T>(value: T): T => {
  if (Array.isArray(value)) {
    return value
      .map((item) => sanitizeForFirestore(item))
      .filter((item) => item !== undefined) as T;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, item]) => item !== undefined)
      .map(([key, item]) => [key, sanitizeForFirestore(item)]);
    return Object.fromEntries(entries) as T;
  }

  return value;
};

// Initialize default data
export const initializeDefaultData = async () => {
  try {
    const contactDoc = await getDoc(doc(db, COLLECTIONS.CONTACT, 'main'));
    if (!contactDoc.exists()) {
      const defaultContact: ContactInfo = {
        address: '123 Diamond Street, Mumbai, India',
        phone: '+85251254000',
        email: 'info@flenixjewels.com',
        instagram: 'https://instagram.com/flenixjewels',
        facebook: 'https://facebook.com/flenixjewels',
        youtube: '',
        linkedin: '',
        twitter: '',
        pinterest: '',
        whatsapp: '85251254000',
      };
      await setDoc(doc(db, COLLECTIONS.CONTACT, 'main'), defaultContact);
    }

    const priceSettingsDoc = await getDoc(doc(db, COLLECTIONS.SETTINGS, 'pricing'));
    if (!priceSettingsDoc.exists()) {
      const defaults: PriceSettings = { showPrices: false };
      await setDoc(doc(db, COLLECTIONS.SETTINGS, 'pricing'), defaults);
    }
  } catch (error) {
    console.error('Error initializing default data:', error);
  }
};

export const getPriceSettings = async (): Promise<PriceSettings> => {
  try {
    const docSnap = await getDoc(doc(db, COLLECTIONS.SETTINGS, 'pricing'));
    if (docSnap.exists()) {
      const data = docSnap.data() as Partial<PriceSettings>;
      return { showPrices: Boolean(data.showPrices) };
    }
  } catch (error) {
    console.error('Error getting price settings:', error);
  }
  return { showPrices: false };
};

export const savePriceSettings = async (settings: PriceSettings) => {
  try {
    await setDoc(doc(db, COLLECTIONS.SETTINGS, 'pricing'), settings);
  } catch (error) {
    console.error('Error saving price settings:', error);
  }
};

// ───────────────────────────────────────────────────────────────
// Realtime subscriptions (client sync)
// ───────────────────────────────────────────────────────────────

export const subscribeBanners = (onChange: (banners: Banner[]) => void) =>
  onSnapshot(collection(db, COLLECTIONS.BANNERS), (snapshot) => {
    const banners = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Banner));
    onChange(banners.sort((a, b) => (a.priority || 99) - (b.priority || 99)));
  });

const sortAds = (ads: AdCampaign[]) =>
  [...ads].sort((a, b) => {
    if (a.active !== b.active) return Number(b.active) - Number(a.active);
    return (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0);
  });

export const subscribeAds = (onChange: (ads: AdCampaign[]) => void) =>
  onSnapshot(collection(db, COLLECTIONS.ADS), (snapshot) => {
    const ads = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as AdCampaign));
    onChange(sortAds(ads));
  });

export const subscribeCategories = (onChange: (categories: Category[]) => void) =>
  onSnapshot(collection(db, COLLECTIONS.CATEGORIES), (snapshot) => {
    const categories = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Category));
    onChange(categories.sort((a, b) => (a.priority || 99) - (b.priority || 99)));
  });

export const subscribeDiamondCategories = (onChange: (categories: DiamondCategory[]) => void) =>
  onSnapshot(collection(db, COLLECTIONS.DIAMOND_CATEGORIES), (snapshot) => {
    const categories = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as DiamondCategory));
    onChange(categories.sort((a, b) => (a.priority || 99) - (b.priority || 99)));
  });

export const subscribeProducts = (onChange: (products: Product[]) => void) =>
  onSnapshot(collection(db, COLLECTIONS.PRODUCTS), (snapshot) => {
    const products = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
    onChange(products.sort((a, b) => (a.priority || 99) - (b.priority || 99)));
  });

export const subscribeDiamonds = (onChange: (diamonds: Diamond[]) => void) =>
  onSnapshot(collection(db, COLLECTIONS.DIAMONDS), (snapshot) => {
    const diamonds = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Diamond));
    onChange(diamonds.sort((a, b) => (a.priority || 99) - (b.priority || 99)));
  });

export const subscribeBlogs = (onChange: (blogs: BlogPost[]) => void) =>
  onSnapshot(collection(db, COLLECTIONS.BLOGS), (snapshot) => {
    const blogs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as BlogPost));
    onChange(blogs);
  });

export const subscribeGallery = (onChange: (items: GalleryItem[]) => void) =>
  onSnapshot(collection(db, COLLECTIONS.GALLERY), (snapshot) => {
    const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as GalleryItem));
    onChange(items);
  });

export const subscribeFeaturedCollection = (onChange: (items: FeaturedCollection[]) => void) =>
  onSnapshot(collection(db, COLLECTIONS.FEATURED), (snapshot) => {
    const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as FeaturedCollection));
    onChange(items.sort((a, b) => (a.priority || 99) - (b.priority || 99)));
  });

export const subscribeInstagramPosts = (onChange: (items: InstagramPost[]) => void) =>
  onSnapshot(collection(db, COLLECTIONS.INSTAGRAM), (snapshot) => {
    const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as InstagramPost));
    onChange(items);
  });

export const subscribeTestimonials = (onChange: (items: Testimonial[]) => void) =>
  onSnapshot(collection(db, COLLECTIONS.TESTIMONIALS), (snapshot) => {
    const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Testimonial));
    onChange(items);
  });

export const subscribeOffices = (onChange: (items: Office[]) => void) =>
  onSnapshot(collection(db, COLLECTIONS.OFFICES), (snapshot) => {
    const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Office));
    onChange(items);
  });

export const subscribePromoHeader = (onChange: (promo: PromoHeader | null) => void) =>
  onSnapshot(doc(db, COLLECTIONS.PROMO_HEADER, 'main'), (docSnap) => {
    onChange(docSnap.exists() ? (docSnap.data() as PromoHeader) : null);
  });

export const subscribeContact = (onChange: (contact: ContactInfo | null) => void) =>
  onSnapshot(doc(db, COLLECTIONS.CONTACT, 'main'), (docSnap) => {
    onChange(docSnap.exists() ? (docSnap.data() as ContactInfo) : null);
  });

export const subscribeContactSubmissions = (onChange: (items: ContactSubmission[]) => void) =>
  onSnapshot(collection(db, COLLECTIONS.CONTACT_SUBMISSIONS), (snapshot) => {
    const items = snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() } as ContactSubmission))
      .sort((a, b) => b.submittedAt - a.submittedAt);
    onChange(items);
  });

export const subscribePriceSettings = (onChange: (settings: PriceSettings) => void) =>
  onSnapshot(doc(db, COLLECTIONS.SETTINGS, 'pricing'), (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data() as Partial<PriceSettings>;
      onChange({ showPrices: Boolean(data.showPrices) });
    } else {
      onChange({ showPrices: false });
    }
  });

// Banner methods
export const getBanners = async (): Promise<Banner[]> => {
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS.BANNERS));
    const banners = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Banner));
    // Sort by priority (lower number = first)
    return banners.sort((a, b) => (a.priority || 99) - (b.priority || 99));
  } catch (error) {
    console.error('Error getting banners:', error);
    return [];
  }
};

export const saveBanner = async (banner: Banner) => {
  try {
    await setDoc(doc(db, COLLECTIONS.BANNERS, banner.id), { ...banner, id: banner.id });
  } catch (error) {
    console.error('Error saving banner:', error);
  }
};

export const deleteBanner = async (id: string) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.BANNERS, id));
  } catch (error) {
    console.error('Error deleting banner:', error);
  }
};

// Ads methods
export const getAds = async (): Promise<AdCampaign[]> => {
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS.ADS));
    const ads = snapshot.docs.map((adDoc) => ({ id: adDoc.id, ...adDoc.data() } as AdCampaign));
    return sortAds(ads);
  } catch (error) {
    console.error('Error getting ads:', error);
    return [];
  }
};

export const saveAdCampaign = async (ad: AdCampaign) => {
  try {
    const adRef = doc(db, COLLECTIONS.ADS, ad.id);
    const payload = sanitizeForFirestore({
      ...ad,
      id: ad.id,
      title: ad.title?.trim() || '',
      description: ad.description?.trim() || '',
      image: ad.image || '',
      updatedAt: ad.updatedAt || Date.now(),
    });

    if (!ad.active) {
      await setDoc(adRef, payload);
      return;
    }

    const activeSnapshot = await getDocs(
      query(collection(db, COLLECTIONS.ADS), where('active', '==', true))
    );
    const batch = writeBatch(db);

    activeSnapshot.forEach((activeDoc) => {
      if (activeDoc.id !== ad.id) {
        batch.update(doc(db, COLLECTIONS.ADS, activeDoc.id), {
          active: false,
          updatedAt: Date.now(),
        });
      }
    });

    batch.set(adRef, payload);
    await batch.commit();
  } catch (error) {
    console.error('Error saving ad campaign:', error);
    throw error;
  }
};

export const deleteAdCampaign = async (id: string) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.ADS, id));
  } catch (error) {
    console.error('Error deleting ad campaign:', error);
    throw error;
  }
};

// Category methods
export const getCategories = async (): Promise<Category[]> => {
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS.CATEGORIES));
    const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
    // Sort by priority (lower number = first)
    return categories.sort((a, b) => (a.priority || 99) - (b.priority || 99));
  } catch (error) {
    console.error('Error getting categories:', error);
    return [];
  }
};

export const getDiamondCategories = async (): Promise<DiamondCategory[]> => {
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS.DIAMOND_CATEGORIES));
    const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DiamondCategory));
    return categories.sort((a, b) => (a.priority || 99) - (b.priority || 99));
  } catch (error) {
    console.error('Error getting diamond categories:', error);
    return [];
  }
};

export const saveCategory = async (category: Category) => {
  try {
    await setDoc(doc(db, COLLECTIONS.CATEGORIES, category.id), { ...category, id: category.id });
  } catch (error) {
    console.error('Error saving category:', error);
  }
};

export const saveDiamondCategory = async (category: DiamondCategory) => {
  try {
    await setDoc(doc(db, COLLECTIONS.DIAMOND_CATEGORIES, category.id), { ...category, id: category.id });
  } catch (error) {
    console.error('Error saving diamond category:', error);
  }
};

export const getCategoryById = async (id: string): Promise<Category | undefined> => {
  try {
    const docSnap = await getDoc(doc(db, COLLECTIONS.CATEGORIES, id));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Category;
    }
  } catch (error) {
    console.error('Error getting category:', error);
  }
  return undefined;
};

export const deleteCategory = async (id: string) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.CATEGORIES, id));
  } catch (error) {
    console.error('Error deleting category:', error);
  }
};

export const deleteDiamondCategory = async (id: string) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.DIAMOND_CATEGORIES, id));
  } catch (error) {
    console.error('Error deleting diamond category:', error);
  }
};

// Product methods
export const getProducts = async (): Promise<Product[]> => {
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS.PRODUCTS));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  } catch (error) {
    console.error('Error getting products:', error);
    return [];
  }
};

export const getDiamonds = async (): Promise<Diamond[]> => {
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS.DIAMONDS));
    const diamonds = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Diamond));
    return diamonds.sort((a, b) => (a.priority || 99) - (b.priority || 99));
  } catch (error) {
    console.error('Error getting diamonds:', error);
    return [];
  }
};

export const getProductsByCategory = async (categoryId: string): Promise<Product[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.PRODUCTS),
      where('categoryId', '==', categoryId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  } catch (error) {
    console.error('Error getting products by category:', error);
    return [];
  }
};

export const getDiamondsByCategory = async (diamondCategoryId: string): Promise<Diamond[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.DIAMONDS),
      where('diamondCategoryId', '==', diamondCategoryId)
    );
    const snapshot = await getDocs(q);
    const diamonds = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Diamond));
    return diamonds.sort((a, b) => (a.priority || 99) - (b.priority || 99));
  } catch (error) {
    console.error('Error getting diamonds by category:', error);
    return [];
  }
};

export const saveProduct = async (product: Product) => {
  try {
    await setDoc(
      doc(db, COLLECTIONS.PRODUCTS, product.id),
      sanitizeForFirestore({ ...product, id: product.id })
    );
  } catch (error) {
    console.error('Error saving product:', error);
  }
};

export const saveDiamond = async (diamond: Diamond) => {
  try {
    await setDoc(
      doc(db, COLLECTIONS.DIAMONDS, diamond.id),
      sanitizeForFirestore({ ...diamond, id: diamond.id })
    );
  } catch (error) {
    console.error('Error saving diamond:', error);
  }
};

export const deleteProduct = async (id: string) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.PRODUCTS, id));
  } catch (error) {
    console.error('Error deleting product:', error);
  }
};

export const deleteDiamond = async (id: string) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.DIAMONDS, id));
  } catch (error) {
    console.error('Error deleting diamond:', error);
  }
};

// Gallery methods
export const getGallery = async (): Promise<GalleryItem[]> => {
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS.GALLERY));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GalleryItem));
  } catch (error) {
    console.error('Error getting gallery:', error);
    return [];
  }
};

export const saveGalleryItem = async (item: GalleryItem) => {
  try {
    await setDoc(doc(db, COLLECTIONS.GALLERY, item.id), { ...item, id: item.id });
  } catch (error) {
    console.error('Error saving gallery item:', error);
    throw error;
  }
};

export const clearGalleryItemSequence = async (id: string) => {
  try {
    await updateDoc(doc(db, COLLECTIONS.GALLERY, id), { sequence: deleteField() });
  } catch (error) {
    console.error('Error clearing gallery item sequence:', error);
    throw error;
  }
};

export const deleteGalleryItem = async (id: string) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.GALLERY, id));
  } catch (error) {
    console.error('Error deleting gallery item:', error);
  }
};

// Featured Collection methods
export const getFeaturedCollection = async (): Promise<FeaturedCollection[]> => {
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS.FEATURED));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FeaturedCollection));
  } catch (error) {
    console.error('Error getting featured collection:', error);
    return [];
  }
};

export const saveFeaturedItem = async (item: FeaturedCollection) => {
  try {
    await setDoc(doc(db, COLLECTIONS.FEATURED, item.id), { ...item, id: item.id });
  } catch (error) {
    console.error('Error saving featured item:', error);
  }
};

export const deleteFeaturedItem = async (id: string) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.FEATURED, id));
  } catch (error) {
    console.error('Error deleting featured item:', error);
  }
};

// Contact methods
export const getContact = async (): Promise<ContactInfo> => {
  try {
    const docSnap = await getDoc(doc(db, COLLECTIONS.CONTACT, 'main'));
    if (docSnap.exists()) {
      return docSnap.data() as ContactInfo;
    }
  } catch (error) {
    console.error('Error getting contact:', error);
  }
  return {
    address: '',
    phone: '',
    email: '',
    facebook: '',
    instagram: '',
    youtube: '',
    linkedin: '',
    twitter: '',
    pinterest: '',
    whatsapp: '85251254000',
  };
};

export const saveContact = async (contact: ContactInfo) => {
  try {
    await setDoc(doc(db, COLLECTIONS.CONTACT, 'main'), contact);
  } catch (error) {
    console.error('Error saving contact:', error);
  }
};

// Office methods
export const getOffices = async (): Promise<Office[]> => {
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS.OFFICES));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Office));
  } catch (error) {
    console.error('Error getting offices:', error);
    return [];
  }
};

export const saveOffice = async (office: Office) => {
  try {
    await setDoc(doc(db, COLLECTIONS.OFFICES, office.id), { ...office, id: office.id });
  } catch (error) {
    console.error('Error saving office:', error);
  }
};

export const deleteOffice = async (id: string) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.OFFICES, id));
  } catch (error) {
    console.error('Error deleting office:', error);
  }
};

// Blog methods
export const getBlogs = async (): Promise<BlogPost[]> => {
  try {
    console.log('[storage/getBlogs] fetching from collection', COLLECTIONS.BLOGS);
    const snapshot = await getDocs(collection(db, COLLECTIONS.BLOGS));
    console.log('[storage/getBlogs] docs', snapshot.size);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));
  } catch (error) {
    console.error('Error getting blogs:', error);
    return [];
  }
};

export const saveBlog = async (blog: BlogPost) => {
  try {
    await setDoc(doc(db, COLLECTIONS.BLOGS, blog.id), { ...blog, id: blog.id });
  } catch (error) {
    console.error('Error saving blog:', error);
    throw error;
  }
};

export const deleteBlog = async (id: string) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.BLOGS, id));
  } catch (error) {
    console.error('Error deleting blog:', error);
    throw error;
  }
};

// Instagram methods
export const getInstagramPosts = async (): Promise<InstagramPost[]> => {
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS.INSTAGRAM));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InstagramPost));
  } catch (error) {
    console.error('Error getting Instagram posts:', error);
    return [];
  }
};

export const saveInstagramPost = async (post: InstagramPost) => {
  try {
    await setDoc(doc(db, COLLECTIONS.INSTAGRAM, post.id), sanitizeForFirestore({ ...post, id: post.id }));
  } catch (error) {
    console.error('Error saving Instagram post:', error);
    throw error;
  }
};

export const deleteInstagramPost = async (id: string) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.INSTAGRAM, id));
  } catch (error) {
    console.error('Error deleting Instagram post:', error);
  }
};

// PromoHeader methods
export const getPromoHeader = async (): Promise<PromoHeader> => {
  try {
    const docSnap = await getDoc(doc(db, COLLECTIONS.PROMO_HEADER, 'main'));
    if (docSnap.exists()) {
      return docSnap.data() as PromoHeader;
    }
  } catch (error) {
    console.error('Error getting promo header:', error);
  }
  return { text: '', enabled: false };
};

export const savePromoHeader = async (promo: PromoHeader) => {
  try {
    await setDoc(doc(db, COLLECTIONS.PROMO_HEADER, 'main'), promo);
  } catch (error) {
    console.error('Error saving promo header:', error);
  }
};

// Testimonial methods
export const getTestimonials = async (): Promise<Testimonial[]> => {
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS.TESTIMONIALS));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimonial));
  } catch (error) {
    console.error('Error getting testimonials:', error);
    return [];
  }
};

export const getApprovedTestimonials = async (): Promise<Testimonial[]> => {
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS.TESTIMONIALS));
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Testimonial))
      .filter(t => t.approved !== false);
  } catch (error) {
    console.error('Error getting approved testimonials:', error);
    return [];
  }
};

export const saveTestimonial = async (testimonial: Testimonial) => {
  try {
    await setDoc(doc(db, COLLECTIONS.TESTIMONIALS, testimonial.id), { ...testimonial, id: testimonial.id });
  } catch (error) {
    console.error('Error saving testimonial:', error);
    throw error;
  }
};

export const approveTestimonial = async (id: string) => {
  try {
    await updateDoc(doc(db, COLLECTIONS.TESTIMONIALS, id), { approved: true });
  } catch (error) {
    console.error('Error approving testimonial:', error);
    throw error;
  }
};

export const saveCustomerTestimonial = async (
  submission: Pick<Testimonial, 'name' | 'email' | 'location' | 'text' | 'rating'>
): Promise<void> => {
  try {
    const id = `cust-${Date.now()}`;
    const data: Testimonial = {
      ...submission,
      id,
      approved: false,
      source: 'customer',
      submittedAt: Date.now(),
    };
    await setDoc(doc(db, COLLECTIONS.TESTIMONIALS, id), data);
  } catch (error) {
    console.error('Error saving customer testimonial:', error);
    throw error;
  }
};

export const subscribeAllTestimonials = (onChange: (items: Testimonial[]) => void) =>
  onSnapshot(collection(db, COLLECTIONS.TESTIMONIALS), (snapshot) => {
    const items = snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() } as Testimonial))
      .sort((a, b) => (b.submittedAt ?? 0) - (a.submittedAt ?? 0));
    onChange(items);
  });

export const subscribeApprovedTestimonials = (onChange: (items: Testimonial[]) => void) =>
  onSnapshot(collection(db, COLLECTIONS.TESTIMONIALS), (snapshot) => {
    const items = snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() } as Testimonial))
      .filter((t) => t.approved !== false)
      .sort((a, b) => (b.submittedAt ?? 0) - (a.submittedAt ?? 0));
    onChange(items);
  });

export const deleteTestimonial = async (id: string) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.TESTIMONIALS, id));
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    throw error;
  }
};

// Upload file to Firebase Storage and return URL
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

const getImageResizeConfig = (path: string) => {
  const lower = path.toLowerCase();
  if (lower.includes('ads')) return { max: 1200, quality: 0.75 };
  if (lower.includes('banners')) return { max: 1400, quality: 0.72 };
  if (lower.includes('products')) return { max: 900, quality: 0.70 };
  if (lower.includes('diamonds')) return { max: 900, quality: 0.70 };
  if (lower.includes('categories')) return { max: 900, quality: 0.72 };
  if (lower.includes('diamond-categories')) return { max: 900, quality: 0.72 };
  if (lower.includes('gallery')) return { max: 1000, quality: 0.72 };
  if (lower.includes('blogs')) return { max: 1000, quality: 0.72 };
  if (lower.includes('featured')) return { max: 1200, quality: 0.72 };
  if (lower.includes('buying-guides')) return { max: 1000, quality: 0.72 };
  return { max: 1200, quality: 0.72 };
};

const getImageMaxBytes = (path: string): number => {
  const lower = path.toLowerCase();
  if (lower.includes('banners'))  return 300_000;
  if (lower.includes('blogs'))    return 200_000;
  if (lower.includes('featured')) return 250_000;
  if (lower.includes('products')) return 130_000;
  if (lower.includes('diamonds')) return 130_000;
  if (lower.includes('gallery'))  return 180_000;
  return 200_000;
};

let _lastLqip = '';
export const getLastUploadLqip = (): string => _lastLqip;

const processImage = async (file: File, path: string, addMark: boolean): Promise<File> => {
  return new Promise((resolve) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      const { max, quality } = getImageResizeConfig(path);
      const maxBytes = getImageMaxBytes(path);
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const targetWidth  = Math.round(img.width  * scale);
      const targetHeight = Math.round(img.height * scale);

      canvas.width  = targetWidth;
      canvas.height = targetHeight;

      if (!ctx) { resolve(file); return; }

      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      if (addMark) {
        ctx.font         = `${Math.max(20, targetWidth / 20)}px Cinzel`;
        ctx.fillStyle    = 'rgba(255, 255, 255, 0.20)';
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('FLENIX JEWELS', canvas.width / 2, canvas.height / 2);
      }

      // Generate a tiny 20 px-wide LQIP (blur-up placeholder) before quality reduction
      _lastLqip = '';
      const _tinyW = 20;
      const _tinyH = Math.max(1, Math.round(_tinyW * (targetHeight / targetWidth)));
      const _tiny = document.createElement('canvas');
      _tiny.width = _tinyW;
      _tiny.height = _tinyH;
      const _tinyCtx = _tiny.getContext('2d');
      if (_tinyCtx) {
        _tinyCtx.drawImage(canvas, 0, 0, _tinyW, _tinyH);
        const _dl = _tiny.toDataURL('image/webp', 0.5);
        _lastLqip = (_dl && _dl.length > 6) ? _dl : _tiny.toDataURL('image/jpeg', 0.5);
      }

      const fileName = file.name.replace(/\.\w+$/, '');

      const tryWebP = (q: number) => {
        canvas.toBlob((blob) => {
          if (blob) {
            if (blob.size <= maxBytes || q <= 0.45) {
              resolve(new File([blob], `${fileName}.webp`, { type: 'image/webp' }));
            } else {
              tryWebP(Math.max(0.45, parseFloat((q - 0.08).toFixed(2))));
            }
          } else {
            canvas.toBlob((jpegBlob) => {
              resolve(jpegBlob
                ? new File([jpegBlob], `${fileName}.jpg`, { type: 'image/jpeg' })
                : file);
            }, 'image/jpeg', Math.min(0.9, quality + 0.08));
          }
        }, 'image/webp', q);
      };

      tryWebP(quality);
    };

    img.onerror = () => resolve(file);
    img.src = URL.createObjectURL(file);
  });
};

// ── MP4 "faststart" remux ────────────────────────────────────────────────
// Camera/phone MP4s usually store the moov index atom at the END of the file,
// which forces browsers to make extra round-trips before playback can begin.
// This losslessly moves moov before mdat (identical bytes otherwise) so videos
// start playing immediately while streaming. On ANY parse anomaly the original
// file is returned untouched — this can never corrupt an upload.

interface Mp4Box { type: string; start: number; size: number; headerSize: number }

const MP4_CONTAINER_BOXES = new Set(['moov', 'trak', 'mdia', 'minf', 'stbl', 'edts', 'udta']);

const parseTopLevelMp4Boxes = (view: DataView): Mp4Box[] | null => {
  const boxes: Mp4Box[] = [];
  let off = 0;
  while (off + 8 <= view.byteLength) {
    let size = view.getUint32(off);
    const type = String.fromCharCode(
      view.getUint8(off + 4), view.getUint8(off + 5),
      view.getUint8(off + 6), view.getUint8(off + 7),
    );
    let headerSize = 8;
    if (size === 1) {
      if (off + 16 > view.byteLength) return null;
      size = view.getUint32(off + 8) * 4294967296 + view.getUint32(off + 12);
      headerSize = 16;
    } else if (size === 0) {
      size = view.byteLength - off; // box extends to EOF
    }
    if (size < headerSize || off + size > view.byteLength) return null;
    if (!/^[\x20-\x7e]{4}$/.test(type)) return null;
    boxes.push({ type, start: off, size, headerSize });
    off += size;
  }
  return off === view.byteLength ? boxes : null;
};

// Recursively find stco/co64 chunk-offset tables inside moov.
// Returns absolute offsets (within the moov buffer) of each table's payload,
// or null on any anomaly (including compressed cmov, which we can't patch).
const findChunkOffsetBoxes = (
  view: DataView, start: number, end: number, depth = 0,
): { type: string; start: number }[] | null => {
  if (depth > 8) return null;
  const found: { type: string; start: number }[] = [];
  let off = start;
  while (off + 8 <= end) {
    let size = view.getUint32(off);
    const type = String.fromCharCode(
      view.getUint8(off + 4), view.getUint8(off + 5),
      view.getUint8(off + 6), view.getUint8(off + 7),
    );
    let headerSize = 8;
    if (size === 1) {
      if (off + 16 > end) return null;
      size = view.getUint32(off + 8) * 4294967296 + view.getUint32(off + 12);
      headerSize = 16;
    } else if (size === 0) {
      size = end - off;
    }
    if (size < headerSize || off + size > end) return null;
    if (type === 'stco' || type === 'co64') {
      found.push({ type, start: off + headerSize });
    } else if (type === 'cmov') {
      return null;
    } else if (MP4_CONTAINER_BOXES.has(type)) {
      const inner = findChunkOffsetBoxes(view, off + headerSize, off + size, depth + 1);
      if (inner === null) return null;
      found.push(...inner);
    }
    off += size;
  }
  return found;
};

const makeMp4Faststart = async (file: File): Promise<File> => {
  try {
    const buffer = await file.arrayBuffer();
    const view = new DataView(buffer);
    const boxes = parseTopLevelMp4Boxes(view);
    if (!boxes) return file;

    const moov = boxes.find((b) => b.type === 'moov');
    const mdat = boxes.find((b) => b.type === 'mdat');
    const ftyp = boxes.find((b) => b.type === 'ftyp');
    if (!moov || !mdat || !ftyp || boxes[0].type !== 'ftyp') return file;
    if (moov.start < mdat.start) return file; // already faststart

    // Patch a copy of moov: moving it to just after ftyp shifts everything
    // behind it forward by moov.size, so all absolute chunk offsets grow by it.
    const moovBytes = new Uint8Array(buffer.slice(moov.start, moov.start + moov.size));
    const moovView = new DataView(moovBytes.buffer);
    const offsetBoxes = findChunkOffsetBoxes(moovView, moov.headerSize, moov.size);
    if (!offsetBoxes || offsetBoxes.length === 0) return file;

    const delta = moov.size;
    for (const { type, start } of offsetBoxes) {
      const count = moovView.getUint32(start + 4); // skip version/flags
      let p = start + 8;
      for (let i = 0; i < count; i++) {
        if (type === 'stco') {
          if (p + 4 > moov.size) return file;
          const v = moovView.getUint32(p) + delta;
          if (v > 0xffffffff) return file; // would overflow 32-bit stco
          moovView.setUint32(p, v);
          p += 4;
        } else {
          if (p + 8 > moov.size) return file;
          const v = moovView.getUint32(p) * 4294967296 + moovView.getUint32(p + 4) + delta;
          moovView.setUint32(p, Math.floor(v / 4294967296));
          moovView.setUint32(p + 4, v >>> 0);
          p += 8;
        }
      }
    }

    const parts: Uint8Array<ArrayBuffer>[] = [
      new Uint8Array(buffer.slice(ftyp.start, ftyp.start + ftyp.size)),
      moovBytes,
    ];
    for (const b of boxes) {
      if (b === ftyp || b === moov) continue;
      parts.push(new Uint8Array(buffer.slice(b.start, b.start + b.size)));
    }
    if (parts.reduce((n, part) => n + part.length, 0) !== buffer.byteLength) return file;

    return new File(parts, file.name, { type: file.type || 'video/mp4' });
  } catch {
    return file;
  }
};

export const uploadImageToStorage = async (
  file: File,
  path: string,
  skipWatermark: boolean = false,
  onProgress?: (stage: 'compressing' | 'uploading', percent: number) => void,
): Promise<string> => {
  try {
    let fileToUpload = file;

    if (file.type.startsWith('video/')) {
      // Never re-encode video (canvas + MediaRecorder produced uneven frame
      // timing and permanent stutter). The watermark is a CSS overlay in the
      // player instead. For MP4/MOV, losslessly move the moov index to the
      // front (faststart) so playback starts without extra round-trips.
      onProgress?.('compressing', 0);
      fileToUpload = /mp4|quicktime/i.test(file.type) || /\.(mp4|mov)$/i.test(file.name)
        ? await makeMp4Faststart(file)
        : file;
      onProgress?.('compressing', 100);
    } else {
      // Always process images; watermark is optional
      fileToUpload = await processImage(file, path, !skipWatermark);
    }

    onProgress?.('uploading', 0);
    const storageRef = ref(storage, `${path}/${Date.now()}_${fileToUpload.name}`);
    const snapshot   = await uploadBytes(storageRef, fileToUpload);
    const downloadURL = await getDownloadURL(snapshot.ref);
    onProgress?.('uploading', 100);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Ticker Items (stored as settings/ticker document)
export const getTickerItems = async (): Promise<string[]> => {
  try {
    const docSnap = await getDoc(doc(db, COLLECTIONS.SETTINGS, 'ticker'));
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (Array.isArray(data.items) && data.items.length > 0) return data.items as string[];
    }
    return DEFAULT_TICKER_ITEMS;
  } catch (error) {
    console.error('Error getting ticker items:', error);
    return DEFAULT_TICKER_ITEMS;
  }
};

export const saveTickerItems = async (items: string[]): Promise<void> => {
  try {
    await setDoc(doc(db, COLLECTIONS.SETTINGS, 'ticker'), { items });
  } catch (error) {
    console.error('Error saving ticker items:', error);
    throw error;
  }
};

// Contact Submissions
export const saveContactSubmission = async (submission: Omit<ContactSubmission, 'id' | 'submittedAt' | 'read'>): Promise<void> => {
  try {
    const id = Date.now().toString();
    const data: ContactSubmission = {
      id,
      ...submission,
      submittedAt: Date.now(),
      read: false,
    };
    await setDoc(doc(db, COLLECTIONS.CONTACT_SUBMISSIONS, id), data);
  } catch (error) {
    console.error('Error saving contact submission:', error);
    throw error;
  }
};

export const getContactSubmissions = async (): Promise<ContactSubmission[]> => {
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS.CONTACT_SUBMISSIONS));
    return snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() } as ContactSubmission))
      .sort((a, b) => b.submittedAt - a.submittedAt);
  } catch (error) {
    console.error('Error getting contact submissions:', error);
    return [];
  }
};

export const markContactSubmissionRead = async (id: string, read: boolean): Promise<void> => {
  try {
    await setDoc(doc(db, COLLECTIONS.CONTACT_SUBMISSIONS, id), { read }, { merge: true });
  } catch (error) {
    console.error('Error marking submission read:', error);
  }
};

export const deleteContactSubmission = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.CONTACT_SUBMISSIONS, id));
  } catch (error) {
    console.error('Error deleting contact submission:', error);
  }
};
