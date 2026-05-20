import { initializeApp } from "firebase/app";
import { collection, getDocs, getFirestore, query, orderBy, limit, where } from "firebase/firestore";
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
const SITE_NAME = "Flenix Jewels";
const SITE_DESCRIPTION = "Premium diamond and gold jewelry — certified lab-grown and natural diamonds with worldwide delivery.";
const SITE_LANGUAGE = "en-US";
const SITE_LOGO = `${BASE_URL}/flenix-logo.png`;
const BUILD_DATE = new Date().toUTCString();

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const escapeXml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const stripHtml = (html) =>
  String(html ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();

const truncate = (text, max = 300) => {
  if (!text || text.length <= max) return text;
  const cut = text.slice(0, max);
  const last = cut.lastIndexOf(" ");
  return `${cut.slice(0, last > 60 ? last : max).trim()}...`;
};

const toRssDate = (dateStr) => {
  if (!dateStr) return BUILD_DATE;
  try {
    return new Date(dateStr).toUTCString();
  } catch {
    return BUILD_DATE;
  }
};

const run = async () => {
  const snap = await getDocs(collection(db, "blogs"));
  const blogs = snap.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .filter((b) => b?.title && b?.id)
    .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
    .slice(0, 50);

  const items = blogs.map((blog) => {
    const url = `${BASE_URL}/blog/${blog.id}`;
    const title = escapeXml(blog.title);
    const description = escapeXml(truncate(stripHtml(blog.content || blog.excerpt || blog.description || ""), 300));
    const pubDate = toRssDate(blog.date || blog.createdAt);
    const image = blog.imageUrl || blog.image || blog.thumbnail || "";
    const author = escapeXml(blog.author || SITE_NAME);
    const category = escapeXml(blog.category || "Jewelry");

    return `
    <item>
      <title>${title}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${description}</description>
      <pubDate>${pubDate}</pubDate>
      <author>info@flenixjewels.com (${author})</author>
      <category>${category}</category>
      <dc:creator>${author}</dc:creator>
      ${image ? `<enclosure url="${escapeXml(image)}" type="image/jpeg" length="0" />` : ""}
      ${image ? `<media:content url="${escapeXml(image)}" medium="image" />` : ""}
      ${image ? `<media:thumbnail url="${escapeXml(image)}" />` : ""}
    </item>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:media="http://search.yahoo.com/mrss/"
  xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(SITE_NAME)} — Jewelry Blog &amp; News</title>
    <link>${BASE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>${SITE_LANGUAGE}</language>
    <lastBuildDate>${BUILD_DATE}</lastBuildDate>
    <pubDate>${BUILD_DATE}</pubDate>
    <ttl>1440</ttl>
    <managingEditor>info@flenixjewels.com (${escapeXml(SITE_NAME)})</managingEditor>
    <webMaster>info@flenixjewels.com (${escapeXml(SITE_NAME)})</webMaster>
    <copyright>© ${new Date().getFullYear()} ${escapeXml(SITE_NAME)}. All rights reserved.</copyright>
    <category>Jewelry</category>
    <category>Diamonds</category>
    <category>Lab Grown Diamonds</category>
    <category>Gold Jewelry</category>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${SITE_LOGO}</url>
      <title>${escapeXml(SITE_NAME)}</title>
      <link>${BASE_URL}</link>
      <width>144</width>
      <height>144</height>
    </image>
${items.join("\n")}
  </channel>
</rss>`;

  const __dirname = dirname(fileURLToPath(import.meta.url));
  const outputPath = resolve(__dirname, "..", "public", "feed.xml");
  await writeFile(outputPath, xml, "utf8");
  console.log(`RSS feed generated with ${items.length} items → public/feed.xml`);
};

run().catch((err) => {
  console.error("Failed to generate RSS feed:", err);
  process.exit(1);
});
