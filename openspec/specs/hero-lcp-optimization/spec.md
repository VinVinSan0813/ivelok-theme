# hero-lcp-optimization Specification

## Purpose
TBD - created by archiving change fix-performance-v2. Update Purpose after archive.
## Requirements
### Requirement: Hero LCP image is preloaded before stylesheet
The theme SHALL include a `<link rel="preload" as="image" fetchpriority="high">` tag in `<head>` for the first hero slide image, placed before any stylesheet links, so the browser begins fetching the hero image as early as possible.

#### Scenario: Preload tag exists in rendered HTML
- **WHEN** any page on ivelok.com is loaded
- **THEN** the `<head>` SHALL contain `<link rel="preload" as="image" fetchpriority="high">` referencing the first hero image asset URL

#### Scenario: Preload is ordered before stylesheets
- **WHEN** the browser parses `<head>`
- **THEN** the preload link SHALL appear before `<link rel="stylesheet">` tags so the image fetch begins before CSS parsing

### Requirement: Theme CSS is loaded asynchronously
The theme SHALL load `theme.css` using the `media="print" onload` async pattern so it does not block rendering.

#### Scenario: theme.css does not block initial render
- **WHEN** a page is loaded on a slow connection (Slow 3G simulation)
- **THEN** the hero image SHALL be visible before `theme.css` finishes loading (no render-blocking behavior)

#### Scenario: No FOUC or CLS from async CSS
- **WHEN** theme.css loads asynchronously
- **THEN** elements above the fold SHALL NOT shift layout or flash unstyled content, because critical CSS is inlined

### Requirement: Critical CSS is inlined in head
The theme SHALL inline a minimal set of critical CSS in a `<style>` block in `<head>` covering: CSS custom properties, body/html reset, header height reservation, hero placeholder dimensions, and `opacity: 0` for `.animate-on-scroll`.

#### Scenario: Hero placeholder prevents layout shift
- **WHEN** the page renders before theme.css loads
- **THEN** the hero section SHALL occupy its correct height (780px on desktop, proportional on mobile) without collapsing

#### Scenario: Animated elements remain hidden until theme.css loads
- **WHEN** theme.css is still loading
- **THEN** `.animate-on-scroll` elements SHALL have `opacity: 0` so they do not appear unstyled

### Requirement: Hero first image uses eager loading with correct attribute spacing
The first hero slide `<img>` SHALL have `loading="eager"` and `fetchpriority="high"` as correctly separated HTML attributes (whitespace between them), so the browser parses both attributes.

#### Scenario: loading="eager" present on first hero image
- **WHEN** the rendered HTML of the hero slider is inspected
- **THEN** the first `<img>` in `.hero-slider__slide:first-child` SHALL have `loading="eager"` (not `loading="lazy"`)

#### Scenario: fetchpriority="high" correctly parsed on first hero image
- **WHEN** the rendered HTML is inspected
- **THEN** `fetchpriority="high"` SHALL appear as a separate attribute with whitespace separating it from `loading="eager"` — not concatenated as `loading="eager"fetchpriority="high"`

#### Scenario: hero webp asset file sizes are within target
- **WHEN** the theme assets are measured
- **THEN** `hero-1-800.webp` SHALL be ≤ 40 KB and `hero-2-800.webp` SHALL be ≤ 40 KB (mobile 800w variants used by most mobile devices)
- **AND** `hero-1-1200.webp` SHALL be ≤ 70 KB and `hero-2-1200.webp` SHALL be ≤ 70 KB (mid-range viewport)

