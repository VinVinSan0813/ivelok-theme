## 1. Hero 图片响应式 srcset

- [x] 1.1 阅读 `sections/hero-slider.liquid`，定位 Hero 图片的 `<img>` 标签渲染逻辑
- [x] 1.2 为每张 Hero 图片添加 `srcset`，引用已有的 `hero-1-800.webp` / `hero-2-800.webp`（800w）和原始文件（1600w）
- [x] 1.3 添加 `sizes="(max-width: 800px) 800px, 1600px"` 属性
- [ ] 1.4 在 Chrome DevTools Network 面板（移动端模拟）确认请求的是 800px 版本 *(需推送后在浏览器验证)*

## 2. 关键 CSS 内联

- [x] 2.1 阅读 `assets/theme.css`，识别首屏必要样式（CSS 变量、body reset、.header、.hero 占位）
- [x] 2.2 提取关键 CSS 片段，内联至 `layout/theme.liquid` 的 `<head>` 内
- [x] 2.3 将 `theme.css` 的 `<link>` 标签改为异步加载方式（`media="print"` + `onload="this.media='all'"`）
- [x] 2.4 在 `<noscript>` 中添加普通 `<link rel="stylesheet">` 回退
- [ ] 2.5 验证页面视觉无 FOUC（无样式闪烁），在 Chrome 慢速网络（Slow 3G）下测试 *(需推送后在浏览器验证)*

## 3. 验证与回归测试 *(推送后执行)*

- [ ] 3.1 使用 PageSpeed Insights 重新测试移动端，确认 LCP < 4s（目标 <3s）
- [ ] 3.2 确认 `theme.css` 不再出现在 render-blocking resources 中
- [ ] 3.3 检查桌面端视觉无回归（Hero 图片正常显示）
- [ ] 3.4 检查 Hero 滑动动画功能正常
