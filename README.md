# Joshua Aryeetey

A small personal homepage built with React, TypeScript and Vite.

## Run locally

Use Node 24 (the tested version is in `.node-version`).

```sh
npm ci
npm run dev
```

## Production

```sh
npm run build
npm run preview
```

The build checks TypeScript and produces `dist/`.

## Cloudflare Pages

Connect `joshuaAryy/temporary-portfolio` using these settings:

- Production branch: `main`
- Root directory: repository root
- Build command: `npm run build`
- Output directory: `dist`
- Node version: `.node-version`

No functions, backend, secrets or custom redirects are required. Once the real
`pages.dev` address is assigned, set the canonical URL and absolute Open Graph /
Twitter image URLs in `index.html`. Verify `/resume.pdf` returns a PDF after deployment.

## Content and artwork

Edit the paragraph and links in `src/App.tsx`. `public/resume.pdf` is the supplied
Joshua Aryeetey General Resume, copied unchanged. The three supplied project
images are local grayscale derivatives in `src/assets/`.

The static signature is `src/assets/signature.svg`; its prepared surface texture
is `src/assets/signature-surface.png`. The WebGL material uses this texture without
runtime image processing. The SVG cursor follows a small damped spring. Motion
settles when idle and stops for reduced motion, hidden tabs, or offscreen content.

The React Bits material notice is retained in `src/metal.LICENSE.md`. Manrope's
font license is in `src/assets/manrope.LICENSE`.
