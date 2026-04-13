# ivelok.com — Mobile Performance Optimization Log

**Store:** 215gih-5u.myshopify.com  
**Live Theme:** ivelok-perf-fix (#148042711109)  
**Optimization Period:** 2026-04-13

---

## Score Progression

| Phase | Mobile Score | LCP | FCP | TBT | CLS |
|-------|-------------|-----|-----|-----|-----|
| Baseline | 37 | ~6.8s | ~4.5s | 150ms | 0.415 |
| After fix-mobile-performance | 67 | ~6.3s | ~3.1s | ~80ms | ~0.1 |
| After fix-performance-v2 | 67 | ~6.3s | ~2.9s | 30ms | 0 |
| After fix-lcp-hero | pending re-measure | target <3.5s | ~2.9s | 30ms | 0 |

---

## Phase 1: fix-mobile-performance

**Goal:** Eliminate render-blocking resources, reduce TBT, fix initial CLS.

### Changes Made

**`layout/theme.liquid`**
- Made `theme.css` non-render-blocking: `media="print" onload="this.media='all'"` + noscript fallback
- Changed Google Fonts to `display=optional` (prevents font-swap CLS) + async load
- Reduced preconnects to 2 high-value origins only (`fonts.gstatic.com`, `cdn.shopify.com`)
- Inlined critical CSS in `<head>`: CSS vars, body reset, header height reservation, hero placeholder dimensions
- Added `<link rel="preload" imagesrcset>` for first hero image
- Added first product image preload on home page only

**`assets/theme.js`**
- Deferred all non-critical inits to `requestIdleCallback`: `initScrollAnimations`, `updateCartCount`, `initProductTabs`, `initQuantitySelector`, `initAddToCart`, `initCollectionSort`, `initCartPage`
- Only `initHeader()` and `initHeroSlider()` remain on DOMContentLoaded critical path

**`snippets/product-card.liquid`**
- First product card (index 0): `loading="eager" fetchpriority="high"`
- All others: `loading="lazy" fetchpriority="auto"`

**`assets/hero-*.webp`** — Hero image recompression at q=55:
- hero-1.webp: 139KB → 97KB (−30%)
- hero-2.webp: 171KB → 126KB (−26%)
- hero-1-800.webp: 32KB → 26KB
- hero-2-800.webp: 34KB → 28KB
- hero-1-1200.webp: 48KB (new 1200w breakpoint)
- hero-2-1200.webp: 57KB (new 1200w breakpoint)

---

## Phase 2: fix-performance-v2

**Goal:** Fix CLS regression from async CSS, bring CLS to 0, reduce TBT further.

### Root Cause: CLS Regression from Phase 1

Async `theme.css` caused `.animate-on-scroll` elements to appear without `opacity:0` until the stylesheet loaded, then snap to hidden — creating a visible layout shift.

### Changes Made

**`layout/theme.liquid`** — Extended inlined critical CSS:
- Added `.animate-on-scroll, .animate-from-left, .animate-from-right { opacity: 0 }` to prevent CLS before theme.css loads

**`sections/about.liquid`**
- Added explicit `height="533"` on the about image (800×533 = 3:2 ratio) to prevent image CLS

**`assets/theme.js`**
- Moved `updateCartCount()` out of `initHeader()` and into deferred `requestIdleCallback` block

### Result
- **CLS: 0** ✓ (was 0.415)
- **TBT: 30ms** ✓ (was 150ms)

---

## Phase 3: fix-lcp-hero

**Goal:** Fix LCP — hero image not being selected as LCP element due to opacity:0.

### Root Cause: LCP Element Not Visible

Browser only considers visible elements as LCP candidates. The hero's first slide had `opacity:0` (controlled by `is-active` class added by JS). Before JS ran, the hero was invisible → browser skipped it and fell back to the product card image below the fold as LCP element → LCP measured at 6.3–6.8s.

### Changes Made

**`sections/hero-slider.liquid`**
- Added `is-active` class inline in Liquid HTML for first slide: `class="hero-slider__slide{% if forloop.first %} is-active{% endif %}"` — first slide is visible at HTML parse time, browser registers it as LCP candidate immediately

**Bug fixed:** `fetchpriority` attribute concatenation  
- Before: `{%- if forloop.first -%}fetchpriority="high"{%- endif -%}` strips whitespace, producing `loading="eager"fetchpriority="high"` (no space) — browser ignores malformed attribute
- After: `{% if forloop.first %}fetchpriority="high"{% endif %}` (no `-` dashes, space preserved)

### Expected Result
- **LCP < 3.5s** — hero image is now immediately visible, fetchpriority="high" is parsed correctly, imagesrcset preload in `<head>` matches the img srcset

---

## Known Remaining Issues

| Issue | Root Cause | Controllable? |
|-------|-----------|---------------|
| FCP floor ~2.9s | Shopify `content_for_header` platform scripts (Boomerang, Shopify Pay) | No — platform injection |
| 232 KiB Shopify scripts | Platform analytics/payment scripts | No — not removable |
| LCP/FCP not yet re-measured after Phase 3 | CDN propagation pending | Needs PageSpeed re-run |

---

## Specs Created (OpenSpec)

| Spec ID | Topic |
|---------|-------|
| `deferred-css-loading` | Async CSS with media="print" onload pattern |
| `responsive-hero-images` | imagesrcset/imagesizes preload for responsive images |
| `font-cls-fix` | font-display: optional to prevent font-swap CLS |
| `hero-lcp-optimization` | LCP candidate visibility requirement |
| `tbt-reduction` | requestIdleCallback deferral pattern |
| `hero-first-paint` | First slide is-active class in HTML |

---

## Next Steps

- Re-run PageSpeed Insights after CDN propagation to confirm LCP < 3.5s
- Implement `product-gallery-swipe` change (proposed in openspec/changes/product-gallery-swipe)
