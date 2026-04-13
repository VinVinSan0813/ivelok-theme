## Context

ivelok.com is a Shopify storefront using a custom Liquid theme. Latest PageSpeed mobile score: 37 (report snyar9dmd6). Core Web Vitals breakdown:
- **LCP 6.8s** — hero image loads in 60ms but takes 1,120ms extra Element Render Delay before paint
- **CLS 0.415** — Montserrat WOFF2 triggers layout shift on product cards when it loads
- **TBT 150ms** — `b5bfe654...js` (202ms) and `shopify-perf-kit` (130ms) block main thread

The hero image is the LCP element. It already has `fetchpriority="high"` and `loading="eager"`, but the browser still incurs 1,120ms render delay. This is caused by the browser not discovering the resource early enough (preload hint missing) and by render-blocking `theme.css` (synchronous `<link>` in `<head>`).

## Goals / Non-Goals

**Goals:**
- **Phase 1 目标：LCP < 5s**（消除 render-blocking CSS ~310ms + preload render delay ~800ms = 预计节省 ~1.1s，6.8s → ~5.7s）
- **Phase 2 目标（下一轮评估）：LCP < 3s**（需结合 PageSpeed 实测结果，判断是否还有额外瓶颈）
- Reduce CLS from 0.415 to < 0.1 by preventing Montserrat font swap reflow
- Reduce custom JS contribution to TBT by deferring non-critical inits to idle (platform TBT floor ~120ms, not controllable)
- Preserve all existing visual behavior (no FOUC, no layout change)

**Non-Goals:**
- Server-side rendering changes or CDN config (not accessible in Shopify)
- Removing Shopify Analytics / checkout scripts (required by platform)
- **232 KiB image optimization (explicitly deferred):** PageSpeed 报告的 232 KiB 节省来自 About 区段的 Unsplash 外链图片（`images.unsplash.com/photo-...?w=800`）以非 WebP 格式加载，且不在 LCP 路径上（首屏不可见）。该图片不影响 LCP，优化价值低于本次三项改动。决策：本轮不处理，待 LCP/CLS 修复后在下一 PageSpeed 报告中重新评估优先级。

## Decisions

### D1: Preload first hero image with `<link rel="preload">`

**Decision:** Add `<link rel="preload" as="image" fetchpriority="high">` for the first hero image in `theme.liquid` `<head>`, before stylesheets.

**Why:** Element Render Delay = time between image download complete and actual paint. The browser must parse HTML, discover the `<img>`, then queue the image request. A `<link rel="preload">` in `<head>` fires immediately, giving the browser the image bytes before it even reaches the slider section. This alone can eliminate 800-1000ms of render delay.

**Alternative considered:** `<link rel="preconnect">` to CDN — reduces DNS/TLS latency (~140ms Resource Load Delay) but doesn't address the 1,120ms element render delay. Both should be done, preload is higher priority.

**Implementation:** The first hero slide uses `asset_image: "hero-1.webp"` (confirmed in `templates/index.json`). Use `imagesrcset` + `imagesizes` attributes on the preload tag — this mirrors the exact `srcset`/`sizes` of the `<img>`, so the browser picks the same candidate (typically 1200w on high-DPR mobile) rather than always fetching 800w:
```html
<link rel="preload" as="image" fetchpriority="high"
  imagesrcset="{{ 'hero-1-800.webp' | asset_url }} 800w, {{ 'hero-1-1200.webp' | asset_url }} 1200w, {{ 'hero-1.webp' | asset_url }} 1920w"
  imagesizes="100vw">
```
If `imagesrcset`/`imagesizes` are omitted and `href` points to `hero-1-800.webp`, the browser would preload 800w but the `<img srcset>` would request 1200w on a 390px/3× device — two separate fetches, preload wasted.

### D2: Make theme.css non-render-blocking via inline critical CSS

**Decision:** Extract the minimal critical CSS (CSS vars, body reset, header height, hero placeholder dimensions) and inline it in `<head>`. Load `theme.css` asynchronously with `media="print" onload`.

**Why:** A synchronous `<link rel="stylesheet">` for `theme.css` blocks rendering until the full 50KB+ stylesheet downloads. This pushes LCP back. Inlining ~2KB of critical CSS allows the browser to start rendering the hero immediately while theme.css loads in background.

**Risk:** Previous attempt caused CLS 0.685 regression because `.animate-on-scroll` elements were unstyled during the async gap. **Mitigation:** Include `.animate-on-scroll { opacity: 0 }` in critical CSS so elements remain invisible until theme.css loads and transitions in. This prevents both FOUC and layout shift.

**Alternative considered:** Keep theme.css synchronous (current state) — safe but leaves render-blocking resource blocking LCP.

### D3: Font CLS fix via `font-display: optional`

**Decision:** Change Montserrat Google Fonts URL to use `display=optional` instead of `display=swap`.

**Why:** `font-display: swap` means: render with system font, then swap to Montserrat when loaded. The swap causes text reflow = CLS. `font-display: optional` means: if Montserrat isn't cached, skip it and use fallback permanently for this page load. No swap = no CLS.

**Trade-off:** First-time visitors see system font (e.g., Arial/Helvetica) if Montserrat hasn't loaded within ~100ms. Subsequent visits use cached Montserrat. Acceptable trade-off for CLS compliance.

**Alternative considered:** `size-adjust` CSS descriptor to make fallback font match Montserrat metrics exactly — more complex, requires measuring Montserrat's `ascent-override`, `descent-override`, `line-gap-override`. `display=optional` is simpler and sufficient.

### D4: TBT reduction — defer non-critical DOMContentLoaded inits

**Decision:** Move non-critical init functions from synchronous `DOMContentLoaded` to `requestIdleCallback` inside `theme.js`. Keep only `initHeroSlider()` as critical. Move `initProductTabs`, `initQuantitySelector`, `initAddToCart`, and `updateCartCount` (the `fetch('/cart.js')` call) to idle time.

**Why:** `theme.js` currently runs 6 init functions synchronously on `DOMContentLoaded`. Each function touches the DOM and can trigger layout reads. Moving non-critical inits to idle removes ~50-80ms of custom JS from the TBT window.

**Limitation:** The dominant TBT contributors are Shopify platform scripts (`b5bfe654...js` 202ms, `shopify-perf-kit` 130ms) injected via `content_for_header` — these cannot be deferred. **Realistic TBT floor: ~120ms** (platform minimum). Our target is to avoid adding custom JS on top of that floor, not to achieve < 80ms.

**Forced Reflow 209ms:** Audited `theme.js` — no `getBoundingClientRect`, `offsetWidth`, or other layout-reading calls found. The 209ms forced reflow originates from Shopify's platform scripts or the Judge.me review app (`shopify://apps/judge-me-reviews`). Both are outside our control. **No code change planned for forced reflow.**

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| Async theme.css causes FOUC/CLS again | Include `animate-on-scroll { opacity: 0 }` + hero/header critical CSS inline; test on Slow 3G |
| Preload hint wrong image path | Verify with `shopify theme pull` after push; check Network tab |
| `font-display: optional` changes brand font appearance on cold loads | Acceptable trade-off vs CLS; Montserrat cached after first visit |
| CDN cache serves stale HTML | Hard-purge by appending `?v=2` to test URL, or wait 5min after push |

## Migration Plan

1. Push changes to live theme (`ivelok-perf-fix` #148042711109) via `shopify theme push --allow-live --theme 148042711109`
2. Wait ~2 minutes for CDN propagation
3. Run PageSpeed on `https://ivelok.com/?nocache=1` (cache-busting param) to get fresh score
4. Rollback: revert `theme.liquid` and `theme.css` changes; push again

