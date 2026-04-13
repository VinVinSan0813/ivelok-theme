## 1. Hero First Paint — is-active in HTML

- [x] 1.1 In `sections/hero-slider.liquid`, add `{% if forloop.first %} is-active{% endif %}` to the first slide's class attribute so the hero image is visible at CSS-apply time without requiring JS
- [x] 1.2 In `layout/theme.liquid` critical CSS `<style>` block, remove the redundant `.hero-slider__slide:first-child` override (handled by HTML class + theme.css `.is-active` rule)

## 2. Fix fetchpriority Attribute Spacing Bug

- [x] 2.1 In `sections/hero-slider.liquid`, fix the Liquid whitespace-stripping bug: replace `{%- if forloop.first -%}fetchpriority="high"{%- endif -%}` with `{% if forloop.first %}fetchpriority="high"{% endif %}` (remove `-` whitespace stripping dashes) so a space is preserved between `loading="eager"` and `fetchpriority="high"` in rendered HTML

## 3. Reduce Preconnects to High-Value Origins Only

- [x] 3.1 In `layout/theme.liquid`, remove `<link rel="preconnect" href="https://fonts.googleapis.com">` — the Google Fonts CSS is loaded async (non-blocking), so early connection to the CSS origin is not LCP-critical. Keep `fonts.gstatic.com` (actual font file) and `cdn.shopify.com` (product images)

## 4. Reduce DOMContentLoaded Long Task

- [x] 4.1 In `assets/theme.js`, move `initScrollAnimations()` from synchronous DOMContentLoaded block into the `defer()` (requestIdleCallback) block

## 5. First Product Image Preload (Home Page)

- [x] 5.1 In `layout/theme.liquid`, after the hero preload `<link>`, add a `{%- if request.page_type == 'index' -%}` block that emits `<link rel="preload" as="image" fetchpriority="high">` for `collections.all.products.first.featured_image | image_url: width: 600`

## 6. Push & Verify

- [x] 6.1 Run `shopify theme push --allow-live --theme 148042711109`
- [ ] 6.2 Inspect live HTML: confirm `loading="eager" fetchpriority="high"` has a space between attributes *(CDN cache lag — verify after 5 min)*
- [ ] 6.3 Run PageSpeed Insights — confirm LCP element is now the hero image, LCP ≤ 3.5s
- [ ] 6.4 Visually verify hero slider: first slide visible on load, autoplay works, dots correct
