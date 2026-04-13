## Why

商品主图区域在切换颜色/变体时需要重新加载大图，加载延迟明显；同时桌面端缺少左右箭头导航控件，移动端缺少滑动手势支持，操作体验较差。

## What Changes

- 为商品主图区新增左右箭头导航按钮（桌面端可见）
- 支持触摸滑动手势切换图片（移动端）
- 图片预加载：切换变体时预加载对应图片组，减少可见加载延迟
- 为当前激活图片添加缩略图指示点（dots）或缩略图轨道

## Capabilities

### New Capabilities

- `product-gallery`: 商品主图轮播区域，支持箭头导航、滑动手势、图片预加载、缩略图指示

### Modified Capabilities

<!-- 无现有 spec 需要变更 -->

## Impact

- `sections/main-product.liquid`：主图展示区 HTML 结构与切换逻辑
- `assets/theme.css`：轮播箭头、指示点样式
- `assets/theme.js`（或内联 `<script>`）：手势/箭头交互逻辑、图片预加载
- 无外部依赖，无 breaking change
