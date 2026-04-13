## Why

After fix-performance-v2 (score 37→67), PageSpeed report s4jhigitf6 shows LCP stuck at 6.3s and FCP at 2.9s. Root cause: the hero slider's first slide has `opacity: 0` until JavaScript runs and adds `is-active` — so the browser never registers the hero image as an LCP candidate. The actual LCP element becomes a product card image below the fold, with a 980ms Element Render Delay from main-thread blocking. The preload added in v2 is effectively wasted because the preloaded hero image is not the LCP element.

Fixing this requires making the hero first slide immediately visible in HTML (before JS) and moving non-critical JS to idle to reduce the main-thread blocking causing the 980ms render delay.

## What Changes

- Add `is-active` class to the first hero slide directly in HTML (Liquid `forloop.first`), so the preloaded hero image is visible on first paint without waiting for JavaScript
- Remove the CSS `:first-child` hack from critical CSS in `theme.liquid` (no longer needed once HTML carries `is-active`)
- Move `initScrollAnimations` from synchronous DOMContentLoaded to `requestIdleCallback`, eliminating it from the 134ms long task on the main thread
- Add first product image preload to `<head>` via `theme.liquid` (home page only) as a secondary LCP safety net

## Capabilities

### New Capabilities
- `hero-first-paint`: Hero first slide is visible immediately on HTML parse, without requiring JavaScript execution

### Modified Capabilities

## Impact

- `sections/hero-slider.liquid`: Add `is-active` to first slide in forloop
- `layout/theme.liquid`: Remove `:first-child` critical CSS rule; add first-product preload for index page
- `assets/theme.js`: Move `initScrollAnimations` to idle block
