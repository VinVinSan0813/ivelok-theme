## Why

ivelok.com 移动端 LCP 达 6.4s（Google 推荐目标 <2.5s），PageSpeed 移动端性能评分不达标，直接影响搜索排名和用户转化率。主要原因是 Hero 图片体积过大、CSS 渲染阻塞、以及未使用的 JavaScript。

## What Changes

- 修复 Hero 图片的 `srcset` 引用，确保移动端正确加载已有的 800px 压缩版本（`hero-1-800.webp`、`hero-2-800.webp`）
- 提取首屏关键 CSS 内联至 `<head>`，将 `theme.css` 其余部分改为异步加载，消除 470ms 渲染阻塞
- 延迟加载非首屏 JavaScript（Shopify App 脚本），降低主线程阻塞时间

## Capabilities

### New Capabilities

- `responsive-hero-images`: Hero 轮播图根据屏幕宽度自动选择合适尺寸的图片（`srcset` + `sizes`），移动端加载 800px 版本，减少约 230 KiB 传输量
- `deferred-css-loading`: 关键 CSS 内联至 `<head>`，非关键 CSS 异步加载，消除渲染阻塞

### Modified Capabilities

<!-- 无现有 spec 级别行为变更 -->

## Impact

- `sections/hero-slider.liquid`：添加 `srcset` 和 `sizes` 属性
- `layout/theme.liquid`：内联关键 CSS，修改 `theme.css` 加载方式
- `assets/theme.css`：拆分关键 CSS（首屏样式）与非关键 CSS
