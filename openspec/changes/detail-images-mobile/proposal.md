## Why

移动端 PDP 目前复用 PC 端的 `detail_images_pc` 元字段加载商品详情图，但 PC 图片尺寸偏大、构图不适合竖屏，导致移动端展示效果差、加载慢。需要独立的移动端元字段，允许运营上传针对手机屏幕优化的详情图。

## What Changes

- 新增 Shopify 产品元字段定义：`custom.detail_images_mobile`（类型 `list.file_reference`）
- 在 `sections/main-product.liquid` 中读取该字段，在移动端（≤768px）渲染移动端详情图块
- PC 端继续使用 `custom.detail_images_pc`，两者互不影响
- 移动端回退逻辑：若 `detail_images_mobile` 为空，回退显示 `detail_images_pc`（保证移动端不出现空白区域）

## Capabilities

### New Capabilities

- `mobile-detail-images`: 移动端独立商品详情图区块，从 `custom.detail_images_mobile` 元字段读取并渲染

### Modified Capabilities

<!-- 无现有 spec 需要修改 -->

## Impact

- **文件**: `sections/main-product.liquid`、`assets/theme.css`
- **Shopify Admin**: 需创建元字段定义 `custom.detail_images_mobile`（list.file_reference）
- **无破坏性变更**：PC 端详情图逻辑不受影响
