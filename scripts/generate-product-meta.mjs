import { initializeApp } from "firebase/app";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import { writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const firebaseConfig = {
  apiKey: "AIzaSyCOkXybrDQX9TLbHs9fyLvrKLt5XWAIgwI",
  authDomain: "flenix-jewels.firebaseapp.com",
  projectId: "flenix-jewels",
  storageBucket: "flenix-jewels.firebasestorage.app",
  messagingSenderId: "758181914278",
  appId: "1:758181914278:web:cb951281b928920a2cf667",
  measurementId: "G-4CN8M7YR2P",
};

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = resolve(__dirname, "../public");
const OUT_FILE = resolve(PUBLIC_DIR, "product-meta.json");

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const readCollection = async (name) => {
  const snap = await getDocs(collection(db, name));
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

const stripHtml = (html = "") =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();

const truncate = (str = "", max = 160) => {
  if (str.length <= max) return str;
  const cut = str.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 60 ? lastSpace : max).trim()}...`;
};

const run = async () => {
  console.log("📦 Fetching product & blog meta from Firestore...");

  const [products, blogs] = await Promise.all([
    readCollection("products").catch(() => []),
    readCollection("blogs").catch(() => []),
  ]);

  const meta = { products: {}, blogs: {} };

  for (const p of products) {
    if (!p.id) continue;
    const desc = truncate(stripHtml(p.description || ""), 160);
    meta.products[p.id] = {
      name: p.name || "",
      image: p.image || "",
      description: desc,
    };
  }

  for (const b of blogs) {
    if (!b.id) continue;
    const excerpt = b.excerpt
      ? truncate(b.excerpt, 160)
      : truncate(stripHtml(b.content || b.body || ""), 160);
    meta.blogs[b.id] = {
      title: b.title || "",
      image: b.image || b.coverImage || b.thumbnail || "",
      description: excerpt,
    };
  }

  await mkdir(PUBLIC_DIR, { recursive: true });
  await writeFile(OUT_FILE, JSON.stringify(meta, null, 2), "utf-8");

  console.log(
    `✅ product-meta.json written — ${Object.keys(meta.products).length} products, ${Object.keys(meta.blogs).length} blogs`
  );
  process.exit(0);
};

run().catch((err) => {
  console.error("❌ generate-product-meta failed:", err);
  process.exit(1);
});
