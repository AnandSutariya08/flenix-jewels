import { initializeApp } from "firebase/app";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const firebaseConfig = {
  apiKey: "AIzaSyBse5vfsARbl8k6ub9Mir6qs-CsPdaNuGU",
  authDomain: "flenixjewels109.firebaseapp.com",
  projectId: "flenixjewels109",
  storageBucket: "flenixjewels109.firebasestorage.app",
  messagingSenderId: "192385163202",
  appId: "1:192385163202:web:6499e21aa7c34cd9e7c05b",
  measurementId: "G-FFTQZDHDDM",
};

const BASE_URL = "https://www.flenixjewels.com";
const today = new Date().toISOString().split("T")[0];

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const readCollection = async (name) => {
  const snap = await getDocs(collection(db, name));
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

const escapeXml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const buildUrlEntry = (loc, changefreq = "weekly", priority = "0.7", images = []) => {
  const imageXml = images
    .filter(Boolean)
    .slice(0, 5)
    .map(
      (img) => `
    <image:image>
      <image:loc>${escapeXml(img.url)}</image:loc>
      ${img.title ? `<image:title>${escapeXml(img.title)}</image:title>` : ""}
      ${img.caption ? `<image:caption>${escapeXml(img.caption)}</image:caption>` : ""}
    </image:image>`
    )
    .join("");

  return `
  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>${imageXml}
  </url>`;
};

const buildImageOnlyEntry = (loc, images = []) => {
  if (!images.length) return "";
  const imageXml = images
    .filter(Boolean)
    .slice(0, 5)
    .map(
      (img) => `
    <image:image>
      <image:loc>${escapeXml(img.url)}</image:loc>
      ${img.title ? `<image:title>${escapeXml(img.title)}</image:title>` : ""}
      ${img.caption ? `<image:caption>${escapeXml(img.caption)}</image:caption>` : ""}
    </image:image>`
    )
    .join("");
  return `
  <url>
    <loc>${escapeXml(loc)}</loc>${imageXml}
  </url>`;
};

const run = async () => {
  const [categories, products, buyingGuides, blogs, gallery] = await Promise.all([
    readCollection("categories"),
    readCollection("products"),
    readCollection("buying-guides"),
    readCollection("blogs"),
    readCollection("gallery").catch(() => []),
  ]);

  const urls = [];
  const imageUrls = [];

  // ── Core pages ──────────────────────────────────────────────────────────────
  urls.push(buildUrlEntry(`${BASE_URL}/`, "daily", "1.0"));
  urls.push(buildUrlEntry(`${BASE_URL}/categories`, "weekly", "0.9"));
  urls.push(buildUrlEntry(`${BASE_URL}/gallery`, "weekly", "0.85"));
  urls.push(buildUrlEntry(`${BASE_URL}/blog`, "weekly", "0.75"));
  urls.push(buildUrlEntry(`${BASE_URL}/buying-guide`, "monthly", "0.70"));
  urls.push(buildUrlEntry(`${BASE_URL}/about`, "monthly", "0.65"));
  urls.push(buildUrlEntry(`${BASE_URL}/contact`, "monthly", "0.60"));

  // ── Country landing pages ────────────────────────────────────────────────────
  urls.push(buildUrlEntry(`${BASE_URL}/usa`,       "monthly", "0.70"));
  urls.push(buildUrlEntry(`${BASE_URL}/canada`,    "monthly", "0.70"));
  urls.push(buildUrlEntry(`${BASE_URL}/australia`, "monthly", "0.70"));
  urls.push(buildUrlEntry(`${BASE_URL}/germany`,   "monthly", "0.70"));

  // ── Category pages ───────────────────────────────────────────────────────────
  categories.forEach((cat) => {
    if (!cat?.id) return;
    const catImages = [];
    if (cat.imageUrl || cat.image) {
      catImages.push({ url: cat.imageUrl || cat.image, title: cat.name });
    }
    urls.push(buildUrlEntry(`${BASE_URL}/category/${cat.id}`, "weekly", "0.85", catImages));
    if (catImages.length) {
      imageUrls.push(buildImageOnlyEntry(`${BASE_URL}/category/${cat.id}`, catImages));
    }
  });

  // ── Buying guide pages ───────────────────────────────────────────────────────
  buyingGuides
    .filter((g) => g?.published && g?.slug)
    .forEach((g) => {
      urls.push(buildUrlEntry(`${BASE_URL}/buying-guide/${g.slug}`, "monthly", "0.60"));
    });

  // ── Product pages ─────────────────────────────────────────────────────────────
  products.forEach((product) => {
    if (!product?.id) return;
    const productImages = [];
    const imgSources = [
      product.imageUrl,
      product.image,
      ...(Array.isArray(product.images) ? product.images : []),
    ].filter(Boolean);
    imgSources.slice(0, 5).forEach((imgUrl) => {
      productImages.push({ url: imgUrl, title: product.name, caption: product.category });
    });
    urls.push(buildUrlEntry(`${BASE_URL}/product/${product.id}`, "weekly", "0.80", productImages));
    if (productImages.length) {
      imageUrls.push(buildImageOnlyEntry(`${BASE_URL}/product/${product.id}`, productImages));
    }
  });

  // ── Blog post pages ──────────────────────────────────────────────────────────
  blogs.forEach((blog) => {
    if (!blog?.id) return;
    const blogImages = [];
    if (blog.imageUrl || blog.image || blog.thumbnail) {
      blogImages.push({
        url: blog.imageUrl || blog.image || blog.thumbnail,
        title: blog.title,
        caption: blog.excerpt || blog.title,
      });
    }
    urls.push(buildUrlEntry(`${BASE_URL}/blog/${blog.id}`, "monthly", "0.65", blogImages));
    if (blogImages.length) {
      imageUrls.push(buildImageOnlyEntry(`${BASE_URL}/blog/${blog.id}`, blogImages));
    }
  });

  // ── Gallery images ────────────────────────────────────────────────────────────
  if (gallery.length > 0) {
    const galleryImages = gallery
      .filter((g) => g?.imageUrl || g?.image)
      .map((g) => ({ url: g.imageUrl || g.image, title: g.title || "Flenix Jewels Gallery", caption: g.description }));
    if (galleryImages.length) {
      imageUrls.push(buildImageOnlyEntry(`${BASE_URL}/gallery`, galleryImages.slice(0, 20)));
    }
  }

  const __dirname = dirname(fileURLToPath(import.meta.url));

  // ── Write main sitemap ────────────────────────────────────────────────────────
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join("\n")}
</urlset>`;

  const sitemapPath = resolve(__dirname, "..", "public", "sitemap.xml");
  await writeFile(sitemapPath, sitemapXml, "utf8");
  console.log(`✅ Sitemap generated: ${urls.length} URLs → public/sitemap.xml`);

  // ── Write image-only sitemap ──────────────────────────────────────────────────
  const imageSitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${imageUrls.filter(Boolean).join("\n")}
</urlset>`;

  const imageSitemapPath = resolve(__dirname, "..", "public", "sitemap-images.xml");
  await writeFile(imageSitemapPath, imageSitemapXml, "utf8");
  console.log(`✅ Image sitemap generated: ${imageUrls.filter(Boolean).length} pages → public/sitemap-images.xml`);

  // ── Write sitemap index ───────────────────────────────────────────────────────
  const sitemapIndexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${BASE_URL}/sitemap.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap-images.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>`;

  const sitemapIndexPath = resolve(__dirname, "..", "public", "sitemap-index.xml");
  await writeFile(sitemapIndexPath, sitemapIndexXml, "utf8");
  console.log(`✅ Sitemap index generated → public/sitemap-index.xml`);
};

run().catch((err) => {
  console.error("Failed to generate sitemap:", err);
  process.exit(1);
});
