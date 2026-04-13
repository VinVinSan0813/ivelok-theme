## 1. HTML 结构调整

- [ ] 1.1 在 `sections/main-product.liquid` 的主图容器（`.product-gallery__main` 或等效 wrapper）内插入左右箭头按钮 HTML
- [ ] 1.2 在主图容器下方插入 dots 指示点容器 `<div class="gallery-dots"></div>`
- [ ] 1.3 确认主图容器有 `position: relative`（CSS 中添加或确认已有）

## 2. CSS 样式

- [ ] 2.1 在 `assets/theme.css` 中为 `.gallery-arrow` 添加绝对定位、尺寸、背景样式
- [ ] 2.2 添加 `.gallery-arrow--prev` / `.gallery-arrow--next` 左右位置定位
- [ ] 2.3 添加 `@media (max-width: 767px)` 隐藏箭头的规则
- [ ] 2.4 添加 `.gallery-dots` 容器样式（flex 居中）
- [ ] 2.5 添加 `.gallery-dot` 圆点样式及 `.gallery-dot.active` 高亮样式

## 3. JS 交互逻辑

- [ ] 3.1 在 `sections/main-product.liquid` 内联 `<script>` 中，初始化图片索引变量和图片 URL 数组（从现有 Liquid JSON 数据岛读取）
- [ ] 3.2 实现 `showImage(index)` 函数：更新主图 `src`，更新 dots active 状态，更新箭头 disabled 状态
- [ ] 3.3 绑定左右箭头 `click` 事件，调用 `showImage`
- [ ] 3.4 绑定 dots `click` 事件，点击第 N 个 dot 调用 `showImage(N)`
- [ ] 3.5 实现 touch swipe 手势：监听 `touchstart` / `touchend`，计算水平位移，超过 50px 时切换图片，垂直位移主导时不拦截
- [ ] 3.6 渲染 dots：根据图片数量动态生成 dot 元素（数量 > 8 时跳过）

## 4. 变体切换预加载

- [ ] 4.1 在现有变体切换逻辑（`updateGallery` 或等效函数）中，识别目标变体的首张图片 URL
- [ ] 4.2 实现 `preloadImage(url)` 函数：检查是否已有同 URL 的 preload link，如无则注入 `<link rel="preload" as="image" href="...">`
- [ ] 4.3 在变体切换时调用 `preloadImage`

## 5. 验证与推送

- [ ] 5.1 本地检查 Liquid 标签闭合（`node -e` 脚本）
- [ ] 5.2 在桌面端验证箭头显示、点击切换、disabled 状态
- [ ] 5.3 在 Chrome 手机模式（375px）验证 swipe 手势、箭头隐藏、dots 显示
- [ ] 5.4 验证切换颜色变体时主图快速切换（预加载生效）
- [ ] 5.5 执行 `shopify theme push` 推送到 live 主题
