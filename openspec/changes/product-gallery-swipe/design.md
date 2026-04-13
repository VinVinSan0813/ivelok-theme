## Context

当前商品主图区（`sections/main-product.liquid`）使用一个 `<img>` 标签展示当前图片，切换变体时通过 JS 直接替换 `src`，浏览器需从网络加载新图，延迟明显（大图 ~1MB+）。桌面端无箭头按钮，移动端无滑动手势，用户体验受限。

商品图片数据通过 Liquid 输出到页面内联 JSON，已有 `product.images` 可用。主题为 Shopify Liquid + 原生 JS，无外部框架。

## Goals / Non-Goals

**Goals:**
- 添加左右箭头导航按钮（桌面端可见，移动端隐藏）
- 支持 touch swipe 手势切换（移动端）
- 变体切换时预加载对应图片组（`<link rel="preload">`），减少白屏时间
- 添加缩略图指示点（dots），显示当前图片位置

**Non-Goals:**
- 不引入第三方轮播库（Swiper、Glide 等）
- 不实现懒加载（已有首屏 eager，其余现有行为保持）
- 不改变缩略图列表的现有布局

## Decisions

### 1. 纯原生 JS，不引入外部库
**选择**：手写约 80 行 JS 实现箭头 + 滑动 + 预加载。  
**原因**：主题已是纯原生栈，引入库会增加 ~30KB bundle，且功能需求简单。  
**替代方案**：Swiper.js — 功能强大但体积大，overkill。

### 2. `<link rel="preload">` 动态注入预加载
**选择**：变体切换时，向 `<head>` 动态插入 `<link rel="preload" as="image">` 标签预加载下一组图片。  
**原因**：无需修改 Liquid 输出结构，浏览器原生支持，优先级高于普通 `<img>` fetch。  
**替代方案**：用 `new Image()` 预加载 — 优先级低，效果弱。

### 3. 箭头按钮内联到主图容器 HTML
**选择**：在现有 `.product-gallery__main` 容器内插入 `<button class="gallery-arrow gallery-arrow--prev">` / `--next`。  
**原因**：定位简单（`position: absolute`），不需要额外 wrapper。

### 4. Dots 指示点，不做缩略图轨道
**选择**：在主图下方渲染圆点指示，点击可跳转。  
**原因**：缩略图轨道需要较大布局改动，dots 轻量且满足需求。

## Risks / Trade-offs

- **图片数量多时 dots 过密** → 超过 8 张时隐藏 dots，仅保留箭头导航
- **预加载消耗带宽** → 仅预加载变体切换时的目标图片组首张（而非全部），其余保持懒加载
- **CSS `position: absolute` 箭头与现有布局冲突** → 确保主图容器有 `position: relative`，验证移动端不遮挡图片区域
