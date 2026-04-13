## Why

商品详情页目前只展示主图轮播 + 文字描述，缺少品牌设计的详情长图（营销切图）。欧版 E26 等产品已有完整的 PC 端详情页切图（共 11 张），需将其嵌入商品页面，以提升转化率和视觉呈现效果。

## What Changes

- 移除 `main-product.liquid` 中现有的 `.product-tabs` 区块（Description / Specifications / Shipping & Returns 三个 Tab）
- 在原 Tabs 位置替换为「详情图」渲染区块
- 区块通过产品 metafield（`custom.detail_images`，类型：File Reference List）读取图片列表并按序渲染
- 图片宽度撑满容器（与 PC 端详情页切图尺寸匹配），无间隙堆叠排列
- 支持懒加载（除第一张外），提升页面性能
- 无详情图时该区块不渲染

## Capabilities

### New Capabilities

- `product-detail-images`: 移除现有 Tabs，在原位置渲染产品详情切图序列，图片来源为 `product.metafields.custom.detail_images`（Shopify File Reference List metafield）

### Modified Capabilities

<!-- 无现有 spec 需修改 -->

## Impact

- 修改文件：`sections/main-product.liquid`
- 新增 metafield 定义：`custom.detail_images`（需在 Shopify Admin 或 `config/metafields_definitions.json` 中声明）
- 无 API 变更，无依赖新增
- 移除现有 Tabs 区块及对应 JS 逻辑
- 不影响 Gallery、产品购买信息区域
