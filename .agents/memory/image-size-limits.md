---
name: Image size limits
description: Upload size limits and max dimensions for each image type in storage.ts
---

# Image size limits (set after optimization work)

## getImageMaxBytes (target file sizes after compression)
- banners: 300KB
- blogs: 200KB
- featured: 250KB
- products: 130KB
- diamonds: 130KB
- gallery: 180KB
- default: 200KB

## getImageResizeConfig (max dimension + starting quality)
- ads: max 1200px, q 0.75
- banners: max 1400px, q 0.72
- products: max 900px, q 0.70
- diamonds: max 900px, q 0.70
- categories: max 900px, q 0.72
- diamond-categories: max 900px, q 0.72
- gallery: max 1000px, q 0.72
- blogs: max 1000px, q 0.72
- featured: max 1200px, q 0.72
- buying-guides: max 1000px, q 0.72
- default: max 1200px, q 0.72

**Why:** Previous limits (700-900KB, 1400-1600px) produced images that were too large for fast loading. Reduced to match competitor jewelry site performance targets.

**Note:** Quality iterates down to 0.45 minimum via `tryWebP` in `processImage` until size target is met.
