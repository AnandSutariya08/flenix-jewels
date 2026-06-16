---
name: LQIP blur-up system
description: How the Low Quality Image Placeholder (blur-up) system works in this project
---

# LQIP blur-up system

## The rule
LQIP (20×20 base64 WebP thumbnail) is generated client-side at upload time, stored in Firestore alongside each image URL, and passed as `lqip` prop to `OptimizedImage` where it shows as a blurred background while the full image loads.

**Why:** Existing images don't have LQIP — only images uploaded after the system was added will have it. For images without LQIP, OptimizedImage falls back to animate-pulse skeleton.

## How to apply
- `processImage` in `src/lib/storage.ts` generates the LQIP and stores it in module-level `_lastLqip`
- `getLastUploadLqip()` is exported from storage.ts — call it right after `uploadImageToStorage()` completes
- Admin components read `getLastUploadLqip()` after upload, preserve existing lqip from Firestore state array when no new image is uploaded
- Interfaces with `lqip?: string`: Banner, Category, DiamondCategory, GalleryItem, FeaturedCollection
- Admin components that save lqip: AdminCategories, AdminBanners, AdminGallery, AdminFeaturedCollection, AdminDiamondCategories
- UI components that consume lqip: Index.tsx (categories[0] + cat cards), Categories.tsx
- `OptimizedImage` (src/components/ui/optimized-image.tsx) — `lqip` prop enables blur-up; `overflow-hidden` on wrapper clips the 1.08× scaled inner div
