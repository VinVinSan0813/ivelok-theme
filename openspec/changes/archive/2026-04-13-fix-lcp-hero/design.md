## Context

Current state after fix-performance-v2 (report s4jhigitf6):
- FCP: 2.9s, LCP: 6.3s, TBT: 30ms, CLS: 0
- LCP element: ENGWE E26 product card image (below hero fold)
- LCP breakdown: TTFB 0ms + Resource Load Delay 320ms + Load 40ms + Element Render Delay 980ms
- Hero image is preloaded but hero slide is `opacity: 0` at parse time → browser skips it as LCP candidate
- ivelok.com script: 134ms long task on DOMContentLoaded (includes initScrollAnimations + initHeader + initHeroSlider)

## Goals / Non-Goals

**Goals:**
- Make hero image the LCP element by ensuring first slide is visible at parse time
- Reduce Element Render Delay from 980ms by moving non-critical JS to idle
- Phase 1 target: LCP ≤ 3.5s (from 6.3s)

**Non-Goals:**
- FCP below 2.9s — FCP floor is set by Shopify's `content_for_header` platform scripts (not controllable)
- Removing platform scripts (Judge.me, Shopify Analytics)
- Further image compression (already at q=55, marginal returns)

## Decisions

### D1: Add `is-active` to first slide in HTML

**Decision:** In `hero-slider.liquid`, add `{% if forloop.first %} is-active{% endif %}` to the first slide's class attribute.

**Why:** The hero image has `fetchpriority="high"` and a `<link rel="preload">` in `<head>`. The preload fetches the image early. But if the slide is `opacity: 0` at parse time (because `is-active` is only added by JS on DOMContentLoaded), the browser never considers the hero image as a paint candidate. The LCP algorithm sees the hero as invisible and falls through to the next visible large element — the product card below the fold.

With `is-active` in HTML: theme.css rule `.hero-slider__slide.is-active { opacity: 1 }` applies immediately when theme.css loads. The hero image becomes visible at FCP time. Browser registers it as LCP. Expected LCP ≈ FCP ≈ 2.9s.

**JS compatibility:** `initHeroSlider()` calls `slides[0].classList.add('is-active')` on init — this is idempotent (no-op if already present). `goTo(index)` removes `is-active` from the outgoing slide and adds to incoming — works correctly regardless.

**Critical CSS interaction:** The `:first-child` rule added in fix-performance-v2 critical CSS becomes redundant. Remove it to keep critical CSS minimal. The `is-active` class + theme.css rule is the correct mechanism.

### D2: Move `initScrollAnimations` to idle

**Decision:** Move `initScrollAnimations()` from the synchronous DOMContentLoaded block to the `defer()` (requestIdleCallback) block in `theme.js`.

**Why:** `initScrollAnimations` queries all `.animate-on-scroll`, `.animate-from-left`, `.animate-from-right` elements and sets up an IntersectionObserver. This DOM query touches potentially dozens of elements and can take 20-40ms. Running it on DOMContentLoaded contributes to the 134ms long task that causes Element Render Delay. Moving to idle defers this cost until the main thread is free.

**Risk:** Scroll animations won't initialize until idle fires (typically within 50ms of idle time after page load). Elements will stay `opacity: 0` slightly longer. Acceptable trade-off: these are below-the-fold elements anyway.

### D3: Preload first product image on home page

**Decision:** In `theme.liquid`, for `request.page_type == 'index'`, add a `<link rel="preload">` for `collections.all.products.first.featured_image`.

**Why:** Even with D1 fixing hero as LCP, the first product image (now loading with `eager` + `fetchpriority="high"` from fix-performance-v2) benefits from an early hint in `<head>`. This reduces Resource Load Delay from the current 320ms. The product image in the featured-collection section is still above the fold on some viewports.

**Limitation:** `collections.all.products.first` may not match the actual first product displayed if the collection is sorted differently. Best-effort hint.

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| Hero slide flashes from unstyled → styled when theme.css loads async | Critical CSS already has hero placeholder; `is-active` makes slide visible only after theme.css defines `.is-active { opacity: 1 }` — no flash if theme.css loads before first paint |
| If theme.css loads after hero is visible, slide shows without overlay/content styles briefly | Acceptable — hero background color (#1a1a1a) is in critical CSS, image is visible, text may be unstyled briefly |
| Removing `:first-child` from critical CSS breaks FCP if theme.css is slow | Covered: `is-active` in HTML + theme.css `.is-active { opacity: 1 }` is the authoritative mechanism |

## Migration Plan

1. Apply code changes to local files
2. Push to live theme: `shopify theme push --allow-live --theme 148042711109`
3. Run PageSpeed Insights — target LCP ≤ 3.5s
4. Rollback: revert `is-active` from hero-slider.liquid and push
