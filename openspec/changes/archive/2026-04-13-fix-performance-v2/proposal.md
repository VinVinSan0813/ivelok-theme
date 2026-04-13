## Why

PageSpeed Insights mobile score for ivelok.com has degraded to 37 (latest report snyar9dmd6), with LCP at 6.8s, CLS at 0.415, and TBT at 150ms. The primary bottleneck is a 1,120ms Element Render Delay on the hero image, combined with font-induced layout shifts and third-party script long tasks.

## What Changes

- Add `<link rel="preload">` for the first hero image asset to eliminate element render delay
- Add `font-display: swap` (already set) + `font-display: optional` fallback strategy, or use `size-adjust` CSS descriptor to prevent Montserrat WOFF2 from causing CLS
- Add `rel="preconnect"` hints for Shopify CDN and Fonts origins to reduce resource load delay
- Defer or async non-critical third-party scripts (shopify-perf-kit, analytics) to reduce TBT
- Add explicit `width`/`height` to the About section fallback image tag (Unsplash URL path) to prevent CLS

## Capabilities

### New Capabilities
- `hero-lcp-optimization`: Preload first hero image, eliminate element render delay bringing LCP < 3s
- `font-cls-fix`: Prevent Montserrat WOFF2 font swap from causing layout shift on product cards
- `tbt-reduction`: Reduce main thread blocking time by deferring non-critical scripts

### Modified Capabilities

## Impact

- `layout/theme.liquid`: Add preload link tag, preconnect hints
- `assets/theme.css`: Add `font-display: optional` or `size-adjust` for Montserrat
- `sections/about.liquid`: Fix fallback img dimensions
- No breaking changes — all changes are progressive enhancement
