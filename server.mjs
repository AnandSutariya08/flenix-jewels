import { createServer } from 'node:http';
import { readFileSync, statSync } from 'node:fs';
import { join, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const DIST = resolve(__dirname, 'dist');
const PORT = process.env.PORT || 3000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.txt': 'text/plain',
  '.xml': 'application/xml',
  '.webmanifest': 'application/manifest+json',
};

// Unique per-page meta — injected into <head> before sending HTML to crawlers
const PAGE_META = {
  '/': {
    title: 'Flenix Jewels Ltd | Natural & Lab Grown Diamond Jewelry | Fine Jewellery Online',
    description: 'Shop certified natural and lab-grown diamond jewelry at Flenix Jewels Ltd. Explore GIA certified engagement rings, wedding bands, necklaces, earrings & bracelets. Worldwide shipping.',
  },
  '/categories': {
    title: 'Jewellery Collections | Diamond & Gold Jewelry | Flenix Jewels Ltd',
    description: 'Browse all Flenix Jewels diamond and gold jewelry collections — engagement rings, necklaces, earrings, bracelets, and wedding bands. GIA & IGI certified.',
  },
  '/diamond': {
    title: 'Diamond Catalog — Natural & Lab Grown Diamonds | Flenix Jewels Ltd',
    description: 'Explore GIA and IGI certified natural and lab-grown loose diamonds at Flenix Jewels Ltd. Filter by shape, carat, cut, color, clarity and certificate.',
  },
  '/gallery': {
    title: 'Jewelry Gallery — Diamond & Gold Jewelry Photos | Flenix Jewels Ltd',
    description: 'Browse our gallery of exquisite GIA certified diamond jewelry. View stunning engagement rings, gold necklaces, earrings, bracelets and bespoke designs.',
  },
  '/blog': {
    title: 'Jewelry Blog & Diamond Education | Flenix Jewels Ltd',
    description: 'Expert articles on diamonds, jewelry trends, care guides, buying tips, and lab-grown diamond education from Flenix Jewels Ltd.',
  },
  '/about': {
    title: 'About Flenix Jewels Ltd — 11+ Years of Diamond Excellence',
    description: 'Discover Flenix Jewels Ltd — 11+ years of crafting exceptional GIA certified diamond and gold jewelry. Master craftsmanship, ethical sourcing, 50K+ happy clients worldwide.',
  },
  '/contact': {
    title: 'Contact Us — Diamond Jewelry Enquiries | Flenix Jewels Ltd',
    description: 'Contact Flenix Jewels Ltd for GIA certified diamonds, custom jewelry designs, engagement rings, wholesale orders. Global offices. 24/7 WhatsApp support.',
  },
  '/buying-guide': {
    title: 'Diamond Buying Guide — Expert Jewelry Advice | Flenix Jewels Ltd',
    description: 'Expert guides on diamond 4Cs, lab-grown vs natural diamonds, engagement ring styles, GIA vs IGI certification, and how to buy jewelry.',
  },
  '/usa': {
    title: 'Diamond Jewelry — United States | Flenix Jewels Ltd',
    description: 'GIA and IGI certified diamond jewelry delivered to the United States. Free insured express shipping to all US states. Shop engagement rings, necklaces and more.',
  },
  '/canada': {
    title: 'Diamond Jewelry — Canada | Flenix Jewels Ltd',
    description: 'Premium certified diamond jewelry delivered to Canada. Natural and lab-grown diamonds with free insured shipping. Shop GIA certified engagement rings and fine jewelry.',
  },
  '/australia': {
    title: 'Diamond Jewelry — Australia | Flenix Jewels Ltd',
    description: 'Shop certified diamond jewelry delivered to Australia. Ethical natural and lab-grown diamonds with expert craftsmanship and insured worldwide shipping.',
  },
  '/germany': {
    title: 'Diamond Jewelry — Germany | Flenix Jewels Ltd',
    description: 'Certified diamond jewelry delivered to Germany. Lab-grown and natural diamonds with secure international shipping. GIA & IGI certified fine jewelry.',
  },
};

function esc(str) {
  return str.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function injectMeta(html, meta) {
  return html
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(meta.title)}</title>`)
    .replace(/<meta\s+name="description"[^>]*>/i,
      `<meta name="description" content="${esc(meta.description)}">`)
    .replace(/<meta\s+property="og:title"[^>]*>/i,
      `<meta property="og:title" content="${esc(meta.title)}">`)
    .replace(/<meta\s+property="og:description"[^>]*>/i,
      `<meta property="og:description" content="${esc(meta.description)}">`)
    .replace(/<meta\s+name="twitter:title"[^>]*>/i,
      `<meta name="twitter:title" content="${esc(meta.title)}">`)
    .replace(/<meta\s+name="twitter:description"[^>]*>/i,
      `<meta name="twitter:description" content="${esc(meta.description)}">`);
}

let template;
try {
  template = readFileSync(join(DIST, 'index.html'), 'utf-8');
} catch {
  console.error('dist/index.html not found — run "npm run build" first.');
  process.exit(1);
}

const server = createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const pathname = url.pathname;

  // Try to serve a real static file from dist/
  const filePath = join(DIST, pathname);
  try {
    const stat = statSync(filePath);
    if (stat.isFile()) {
      const ext = extname(filePath).toLowerCase();
      const mime = MIME[ext] || 'application/octet-stream';
      const isAsset = ext !== '.html';
      const securityHeaders = {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
        'X-DNS-Prefetch-Control': 'on',
      };
      res.writeHead(200, {
        'Content-Type': mime,
        'Cache-Control': isAsset
          ? 'public, max-age=31536000, immutable'
          : 'no-cache, must-revalidate',
        ...securityHeaders,
      });
      res.end(readFileSync(filePath));
      return;
    }
  } catch { /* not a file — fall through to SPA */ }

  // SPA fallback — inject correct meta for this path
  const meta = PAGE_META[pathname] || PAGE_META['/'];
  const html = injectMeta(template, meta);
  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-cache, must-revalidate',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'X-DNS-Prefetch-Control': 'on',
    'Link': '<https://www.flenixjewels.com/sitemap-index.xml>; rel="sitemap"',
  });
  res.end(html);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Flenix server running at http://0.0.0.0:${PORT}`);
});
