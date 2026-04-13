## 1. Hero LCP — Preload + Async CSS

- [x] 1.1 Read `layout/theme.liquid` and `assets/theme.css` to extract critical above-fold styles (CSS vars, body reset, header height, hero placeholder dimensions, `.animate-on-scroll { opacity: 0 }`, `.animate-from-left { opacity: 0 }`, `.animate-from-right { opacity: 0 }`)
- [x] 1.2 Add inline `<style>` block with critical CSS in `<head>` of `layout/theme.liquid`, before any `<link>` tags
- [x] 1.3 Add hero image preload using `imagesrcset`/`imagesizes` (not a plain `href`) so browser picks correct srcset candidate:
  ```html
  <link rel="preload" as="image" fetchpriority="high"
    imagesrcset="{{ 'hero-1-800.webp' | asset_url }} 800w, {{ 'hero-1-1200.webp' | asset_url }} 1200w, {{ 'hero-1.webp' | asset_url }} 1920w"
    imagesizes="100vw">
  ```
- [x] 1.4 Change `theme.css` `<link>` from synchronous `stylesheet_tag` to `media="print" onload="this.media='all'"` async pattern; add `<noscript>` fallback
- [x] 1.5 Add `<link rel="preconnect" href="https://cdn.shopify.com">` to `<head>` (Google Fonts preconnects already exist)

## 2. Font CLS Fix

- [x] 2.1 In `layout/theme.liquid`, change Google Fonts URL from `display=swap` to `display=optional` in both the async `<link>` and the `<noscript>` fallback

## 3. TBT — Defer Non-Critical JS

- [x] 3.1 In `assets/theme.js`, move `initProductTabs`, `initQuantitySelector`, `initAddToCart` out of the synchronous `DOMContentLoaded` block and into the existing `defer()` (requestIdleCallback) block
- [x] 3.2 Move `updateCartCount()` call (inside `initHeader`) to idle: call it via `defer()` after `initHeader` returns, instead of inside `initHeader` directly

## 4. Verify & Push

- [x] 4.1 Run `shopify theme push --allow-live --theme 148042711109` to push to live theme
- [ ] 4.2 Wait 2 minutes, then run PageSpeed Insights on `https://ivelok.com` and confirm LCP improvement, CLS < 0.1
- [ ] 4.3 In Chrome DevTools Network tab (mobile emulation, Slow 3G): confirm the preloaded image URL matches the `<img>` srcset selection (same file, no double fetch)
- [ ] 4.4 Test on Slow 3G: verify no FOUC and no layout shift before theme.css loads
- [ ] 4.5 Confirm `.animate-on-scroll` elements stay invisible until theme.css loads
