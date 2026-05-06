# Flenix Jewels (Flenix Jewels)

A professional e-commerce jewelry store web application built with React + Vite.

## Stack

- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui (Radix UI)
- **State Management**: Redux Toolkit
- **Database/Storage**: Firebase (Firestore + Firebase Storage)
- **Routing**: React Router DOM v6
- **Animations**: GSAP
- **Icons**: Lucide React, React Icons
- **Forms**: React Hook Form + Zod
- **Data Fetching**: TanStack React Query
- **Package Manager**: npm

## Project Structure

```
src/
  components/      - UI and feature components (shadcn/ui + custom)
    admin/         - Admin panel components
    ui/            - shadcn/ui base components
  pages/           - Route-level page components
  store/           - Redux state (contentSlice.ts)
  lib/             - Utilities (firebase.ts, analytics, seo, etc.)
  assets/          - Static images and branding
public/            - Public static assets
scripts/           - Maintenance scripts (sitemap generation)
```

## Development

The app runs on port 5000 with host `0.0.0.0` to be accessible in Replit's preview pane.

```bash
npm run dev    # Start Vite dev server on port 5000
npm run build  # Production build to dist/
npm run preview  # Preview production build
```

## Admin Panel

The admin panel is accessible at `/aEgZjaHJvbWUyBggAEEUYOdIBCDUzMTRqMGo3` and uses a simple hardcoded password check.

## Firebase

Firebase Firestore is used as the backend database. Firebase Storage is used for image uploads. The Firebase config in `src/lib/firebase.ts` contains public client-side keys (standard Firebase practice).

## Deployment

Configured for Replit Autoscale deployment:
- **Build**: `npm run build`
- **Run**: `npm run preview` (serves the built dist/)

## Notes

- Vite dev server configured with `allowedHosts: true` and WSS HMR for Replit proxy compatibility
- GSAP animation warnings on initial load are harmless (elements not yet mounted)
- React Router v6 future flag warnings are informational only
- `ipapi.co` is used for free visitor analytics (no API key required)
