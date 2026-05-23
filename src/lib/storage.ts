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
  description: string;
  category?: string;
  sequence?: number;
}

export interface FeaturedCollection {
  id: string;
  image: string;
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
  if (lower.includes('ads')) return { max: 1600, quality: 0.82 };
  if (lower.includes('banners')) return { max: 1600, quality: 0.8 };
  if (lower.includes('products')) return { max: 1400, quality: 0.8 };
  if (lower.includes('diamonds')) return { max: 1400, quality: 0.8 };
  if (lower.includes('categories')) return { max: 1400, quality: 0.82 };
  if (lower.includes('diamond-categories')) return { max: 1400, quality: 0.82 };
  if (lower.includes('gallery')) return { max: 1400, quality: 0.82 };
  if (lower.includes('blogs')) return { max: 1600, quality: 0.82 };
  if (lower.includes('featured')) return { max: 1600, quality: 0.82 };
  if (lower.includes('buying-guides')) return { max: 1600, quality: 0.82 };
  return { max: 1600, quality: 0.82 };
};

const processImage = async (file: File, path: string, addMark: boolean): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    img.onload = () => {
      const { max, quality } = getImageResizeConfig(path);
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const targetWidth = Math.round(img.width * scale);
      const targetHeight = Math.round(img.height * scale);

      canvas.width = targetWidth;
      canvas.height = targetHeight;
      
      if (!ctx) {
        resolve(file);
        return;
      }
      
      // Draw original image
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      
      // Add watermark
      if (addMark) {
        ctx.font = `${Math.max(20, targetWidth / 20)}px Cinzel`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.20)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('FLENIX JEWELS', canvas.width / 2, canvas.height / 2);
      }
      
      // Convert canvas to blob
      const fileName = file.name.replace(/\.\w+$/, '');
      canvas.toBlob((blob) => {
        if (blob) {
          const optimizedFile = new File([blob], `${fileName}.webp`, { type: 'image/webp' });
          resolve(optimizedFile);
        } else {
          // Fallback to JPEG
          canvas.toBlob((jpegBlob) => {
            if (jpegBlob) {
              const optimizedFile = new File([jpegBlob], `${fileName}.jpg`, { type: 'image/jpeg' });
              resolve(optimizedFile);
            } else {
              resolve(file);
            }
          }, 'image/jpeg', Math.min(0.9, quality + 0.08));
        }
      }, 'image/webp', quality);
    };
    
    img.onerror = () => resolve(file);
    img.src = URL.createObjectURL(file);
  });
};

const getSupportedVideoMimeType = () => {
  const candidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ];
  for (const type of candidates) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return "";
};

// Add watermark to video by rendering frames to canvas and recording
const addVideoWatermark = async (file: File): Promise<File> => {
  return new Promise((resolve) => {
    if (typeof MediaRecorder === "undefined") {
      resolve(file);
      return;
    }
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.src = url;
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";

    const cleanup = () => {
      URL.revokeObjectURL(url);
    };

    video.onerror = () => {
      cleanup();
      resolve(file);
    };

    video.onloadedmetadata = async () => {
      const mimeType = getSupportedVideoMimeType();
      if (!mimeType) {
        cleanup();
        resolve(file);
        return;
      }

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        cleanup();
        resolve(file);
        return;
      }

      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;

      if (!("captureStream" in canvas)) {
        cleanup();
        resolve(file);
        return;
      }

      const stream = canvas.captureStream();
      const audioStream =
        (video as HTMLVideoElement & { captureStream?: () => MediaStream })
          .captureStream?.() ||
        (video as HTMLVideoElement & { mozCaptureStream?: () => MediaStream })
          .mozCaptureStream?.();

      if (audioStream) {
        audioStream.getAudioTracks().forEach((track) => stream.addTrack(track));
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const extension = mimeType.includes("webm") ? "webm" : "mp4";
        const watermarked = new File([blob], file.name.replace(/\.\w+$/, `.${extension}`), {
          type: mimeType,
        });
        cleanup();
        resolve(watermarked);
      };

      const drawFrame = () => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const fontSize = Math.max(24, Math.floor(canvas.width / 20));
        ctx.font = `${fontSize}px Cinzel`;
        ctx.fillStyle = "rgba(255, 255, 255, 0.20)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("FLENIX JEWELS", canvas.width / 2, canvas.height / 2);

        if (!video.paused && !video.ended) {
          requestAnimationFrame(drawFrame);
        }
      };

      try {
        recorder.start(250);
        await video.play();
        drawFrame();
      } catch {
        recorder.stop();
      }

      video.onended = () => {
        if (recorder.state !== "inactive") recorder.stop();
      };
    };
  });
};

export const uploadImageToStorage = async (file: File, path: string, skipWatermark: boolean = false): Promise<string> => {
  try {
    // Add watermark before uploading (unless skipped)
    let fileToUpload = file;
    if (!skipWatermark) {
      if (file.type.startsWith("video/")) {
        fileToUpload = await addVideoWatermark(file);
      } else {
        fileToUpload = await processImage(file, path, true);
      }
    } else if (file.type.startsWith("image/")) {
      // Optimize even when watermark is skipped
      fileToUpload = await processImage(file, path, false);
    }
    const storageRef = ref(storage, `${path}/${Date.now()}_${fileToUpload.name}`);
    const snapshot = await uploadBytes(storageRef, fileToUpload);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
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
