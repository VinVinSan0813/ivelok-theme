## ADDED Requirements

### Requirement: Mobile detail images block
The system SHALL render a dedicated mobile detail images block on the PDP when the `custom.detail_images_mobile` metafield contains one or more images.

#### Scenario: Images present on mobile
- **WHEN** `custom.detail_images_mobile` has at least one image AND viewport width ≤ 768px
- **THEN** the mobile detail images block SHALL be visible below the product layout section

#### Scenario: Mobile images absent — fallback to PC images
- **WHEN** `custom.detail_images_mobile` is empty or not set AND `custom.detail_images_pc` has at least one image AND viewport width ≤ 768px
- **THEN** the mobile detail images block SHALL render the PC images as fallback

#### Scenario: Both mobile and PC images absent
- **WHEN** both `custom.detail_images_mobile` and `custom.detail_images_pc` are empty
- **THEN** no mobile detail images block SHALL be rendered on the page

#### Scenario: Images present on desktop
- **WHEN** `custom.detail_images_mobile` has images AND viewport width > 768px
- **THEN** the mobile detail images block SHALL NOT be visible (hidden via CSS)

### Requirement: PC detail images unaffected
The system SHALL continue to render `custom.detail_images_pc` images on desktop (viewport > 768px) without any behavioral change.

#### Scenario: PC images visible on desktop
- **WHEN** `custom.detail_images_pc` has images AND viewport width > 768px
- **THEN** the PC detail images block SHALL be visible as before

#### Scenario: PC images hidden on mobile
- **WHEN** viewport width ≤ 768px
- **THEN** the PC detail images block (`#product-detail-images`) SHALL NOT be visible

### Requirement: Metafield definition exists
The Shopify store SHALL have a metafield definition for `custom.detail_images_mobile` of type `list.file_reference` on the Product owner type.

#### Scenario: Definition created via Admin API
- **WHEN** the metafield definition is created with namespace `custom`, key `detail_images_mobile`, type `list.file_reference`
- **THEN** the field SHALL appear in the product editor under Custom data
