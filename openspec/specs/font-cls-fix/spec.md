# font-cls-fix Specification

## Purpose
TBD - created by archiving change fix-performance-v2. Update Purpose after archive.
## Requirements
### Requirement: Montserrat font does not cause layout shift
The theme SHALL load Montserrat with `display=optional` so the font is only used if it loads within the browser's optional loading window (~100ms), preventing a font-swap layout shift.

#### Scenario: Font display strategy is optional
- **WHEN** the Google Fonts URL is inspected in layout/theme.liquid
- **THEN** it SHALL contain `display=optional` (not `display=swap`)

#### Scenario: No text reflow on font load
- **WHEN** a page with product cards is loaded on a cold cache (Montserrat not yet cached)
- **THEN** text content SHALL NOT shift position after the font loads, resulting in CLS contribution < 0.05 from font loading

#### Scenario: Cached font loads normally
- **WHEN** Montserrat is already cached in the browser
- **THEN** it SHALL be applied immediately with no visible swap or shift

