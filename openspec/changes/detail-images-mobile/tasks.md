## 1. Shopify Admin — 创建元字段定义

- [x] 1.1 通过 Admin API（GraphQL）创建 `custom.detail_images_mobile` 元字段定义（type: `list.file_reference`，owner: PRODUCT）**— 必须在 Task 4.1 之前完成**；否则验证时 `value` 静默返回 nil，无法区分"定义未创建"与"未上传图片"两种情况

## 2. Theme — Liquid 模板修改

- [x] 2.1 在 `sections/main-product.liquid` 顶部 liquid 块中 assign `mobile_detail_images = product.metafields.custom.detail_images_mobile.value`，并 assign `mobile_detail_images_resolved = mobile_detail_images | default: detail_images_pc`
- [x] 2.2 在 PC 详情图块 `#product-detail-images` 后新增移动端详情图块 `#product-detail-images-mobile`，遍历 `mobile_detail_images_resolved` 渲染 `<img>`，每个 `<img>` 须带 `loading="lazy"`
- [x] 2.3 移动端图块仅在 `mobile_detail_images_resolved != blank` 时输出

## 3. Theme — CSS 媒体查询

- [x] 3.1 在 `assets/theme.css` 中添加：PC 端隐藏 `#product-detail-images-mobile`（`display: none` on > 768px）
- [x] 3.2 添加：移动端隐藏 `#product-detail-images`（`display: none` on ≤ 768px）
- [x] 3.3 添加 `#product-detail-images-mobile img` 样式（`width: 100%; display: block`）

## 4. 推送与验证

- [x] 4.1 推送 `sections/main-product.liquid` 和 `assets/theme.css` 到线上主题
- [x] 4.2 在 Admin 为测试产品上传 `detail_images_mobile` 图片
- [x] 4.3 移动端浏览器验证移动图显示、PC 端验证 PC 图不受影响
