## ADDED Requirements

### Requirement: First hero slide is visible at HTML parse time
The first hero slide SHALL have the `is-active` CSS class present in the server-rendered HTML, so it is visible as soon as the browser applies stylesheets — without requiring JavaScript execution.

#### Scenario: First slide has is-active in HTML source
- **WHEN** the page HTML is fetched and inspected
- **THEN** the first `.hero-slider__slide` element SHALL have `is-active` in its class attribute
- **AND** subsequent slides SHALL NOT have `is-active` in their HTML class attribute

#### Scenario: Hero image is the LCP element
- **WHEN** a PageSpeed Insights mobile audit is run on the home page
- **THEN** the LCP element SHALL be the first hero slide image (not a product card image)

#### Scenario: Hero slider JavaScript still works correctly
- **WHEN** `initHeroSlider()` runs after page load
- **THEN** the slider SHALL autoplay correctly starting from slide 1
- **AND** prev/next navigation SHALL work without visual glitches
- **AND** dot navigation SHALL reflect the active slide correctly

### Requirement: Non-critical scroll animation JS is deferred
The `initScrollAnimations` function SHALL run in `requestIdleCallback` (or `setTimeout` fallback), not synchronously on `DOMContentLoaded`, to reduce main-thread long-task duration.

#### Scenario: DOMContentLoaded long task is shorter
- **WHEN** a Chrome Performance trace is recorded on page load
- **THEN** the DOMContentLoaded long task duration SHALL be reduced (target < 80ms) compared to the previous 134ms

#### Scenario: Scroll animations still work
- **WHEN** the user scrolls down the page after load
- **THEN** elements with `.animate-on-scroll`, `.animate-from-left`, `.animate-from-right` classes SHALL animate in as they enter the viewport

### Requirement: First product image is preloaded on home page
On the index page only, the theme SHALL emit a `<link rel="preload" as="image">` hint in `<head>` for the first product image from `collections.all`, to reduce its Resource Load Delay.

#### Scenario: Preload hint present on home page
- **WHEN** the home page HTML `<head>` is inspected
- **THEN** it SHALL contain a `<link rel="preload" as="image">` referencing the first product's featured image URL

#### Scenario: Preload hint absent on other pages
- **WHEN** a product page or collection page HTML `<head>` is inspected
- **THEN** it SHALL NOT contain a product image preload hint (only home page)

### Requirement: Preconnect count does not exceed 3 origins
The theme `<head>` SHALL include preconnect hints for at most 3 external origins — `fonts.gstatic.com` (font files, LCP-critical) and `cdn.shopify.com` (product images, LCP-critical) — removing `fonts.googleapis.com` preconnect (CSS request only, not a blocking resource for LCP).

#### Scenario: Only high-value preconnects remain
- **WHEN** the rendered `<head>` is inspected
- **THEN** `<link rel="preconnect">` SHALL exist for `https://fonts.gstatic.com` and `https://cdn.shopify.com`
- **AND** `<link rel="preconnect">` for `https://fonts.googleapis.com` SHALL be removed (the font CSS is loaded async and non-blocking, so early connection is not needed)

### Requirement: fetchpriority attribute on hero img is correctly separated
The Liquid template for hero-slider SHALL use a whitespace-safe pattern for rendering `fetchpriority="high"` on the first slide's `<img>`, ensuring it appears as a distinct HTML attribute.

#### Scenario: No attribute concatenation in rendered HTML
- **WHEN** the hero slider HTML is inspected on the live site
- **THEN** there SHALL be a space or newline between `loading="eager"` and `fetchpriority="high"` in the first hero `<img>` tag
