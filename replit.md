# Flenix Jewels

A Next.js web application for an exquisite jewelry collection.

## Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Package Manager**: npm

## Project Structure

```
app/
  layout.tsx    - Root layout with metadata
  page.tsx      - Home page
  globals.css   - Global styles with Tailwind
next.config.ts  - Next.js config (allowedDevOrigins for Replit proxy)
tailwind.config.ts
tsconfig.json
package.json
```

## Development

The app runs on port 5000 with host `0.0.0.0` to be accessible in Replit's preview pane.

```bash
npm run dev    # Start dev server on port 5000
npm run build  # Production build
npm run start  # Start production server on port 5000
```

## Deployment

Configured for Replit Autoscale deployment:
- **Build**: `npm run build`
- **Run**: `npm run start`

## Notes

- `allowedDevOrigins` in `next.config.ts` is set to allow `*.replit.dev` origins so HMR works correctly through Replit's iframe proxy.
