# tbt-reduction Specification

## Purpose
TBD - created by archiving change fix-performance-v2. Update Purpose after archive.
## Requirements
### Requirement: No custom render-blocking scripts in theme head
The theme SHALL NOT include any custom `<script>` tags without `defer` or `async` attributes in `layout/theme.liquid` or any section files, except for scripts explicitly required by Shopify platform (injected via `content_for_header`).

#### Scenario: theme.js has defer attribute
- **WHEN** the rendered HTML is inspected
- **THEN** the `<script src="theme.js">` tag SHALL have the `defer` attribute

#### Scenario: No synchronous inline scripts in head
- **WHEN** `layout/theme.liquid` `<head>` section is audited
- **THEN** there SHALL be no inline `<script>` blocks that execute synchronously on page load (outside of Shopify's `content_for_header`)

### Requirement: Preconnect hints for external origins
The theme SHALL include `<link rel="preconnect">` for all external origins loaded during page startup to reduce Resource Load Delay.

#### Scenario: Preconnect exists for Google Fonts
- **WHEN** the `<head>` is inspected
- **THEN** it SHALL contain `<link rel="preconnect" href="https://fonts.googleapis.com">` and `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`

#### Scenario: Preconnect exists for Shopify CDN
- **WHEN** the `<head>` is inspected
- **THEN** it SHALL contain `<link rel="preconnect" href="https://cdn.shopify.com">` to reduce connection time for product images and theme assets

