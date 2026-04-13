## Context

ivelok.com 使用 Shopify + 自定义 Liquid 主题。PageSpeed 移动端分析（2026-04-13）显示：
- LCP 6.4s（目标 <2.5s），主因是 Hero 图片 `hero-1.webp`（180KB）和 `hero-2.webp`（220KB）在移动端未加载 800px 压缩版
- `theme.css`（6.5 KiB）作为渲染阻塞资源，延迟首屏渲染 470ms
- 已存在 `hero-1-800.webp` 和 `hero-2-800.webp` 两个压缩版本，但 `srcset` 未正确引用

## Goals / Non-Goals

**Goals:**
- 移动端 LCP 从 6.4s 降至 3s 以内
- 消除 `theme.css` 渲染阻塞（470ms）
- 不引入新的第三方依赖
- 保持现有视觉效果不变

**Non-Goals:**
- 不处理 Shopify 原生脚本（shop-pay、checkout）的体积问题
- 不重构 JS 模块打包逻辑
- 不修改 SEO 相关配置（当前已通过）

## Decisions

### 1. Hero 图片：使用原生 `srcset` + `sizes`

**选择**：在 `hero-slider.liquid` 的 `<img>` 标签上添加 `srcset` 和 `sizes`，引用已有的 `-800.webp` 文件。

**理由**：已有压缩版本资源，无需重新生成图片；原生 `srcset` 是浏览器标准，无额外 JS 开销；Shopify CDN 自动处理资源分发。

**备选方案**：Shopify `image_url` filter 动态调整尺寸 → 需要改动模板逻辑较多，且现有文件已经是最优格式，无必要。

```html
<!-- 修改前 -->
<img src="{{ slide.image | img_url: 'master' }}" ...>

<!-- 修改后 -->
<img
  src="{{ slide.image | img_url: 'master' }}"
  srcset="
    {{ 'hero-1-800.webp' | asset_url }} 800w,
    {{ 'hero-1.webp' | asset_url }} 1600w
  "
  sizes="(max-width: 800px) 800px, 1600px"
  ...>
```

### 2. CSS 阻塞：关键 CSS 内联 + `media="print"` 技巧异步加载

**选择**：将首屏必要的 CSS（reset、字体声明、header、hero 骨架）内联至 `<head>`，`theme.css` 改为：

```html
<link rel="stylesheet" href="{{ 'theme.css' | asset_url }}"
      media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="{{ 'theme.css' | asset_url }}"></noscript>
```

**理由**：`media="print"` 让浏览器异步下载 CSS 而不阻塞渲染；`onload` 切换为 `all` 使其生效；这是无需构建工具的标准方案，与 Shopify 主题完全兼容。

**备选方案**：Critical CSS 自动化工具（如 `critical`）→ 需要 Node.js 构建流程，超出当前主题架构范围。

**风险**：内联 CSS 需要手动维护，若首屏组件新增样式需同步更新内联部分。

### 3. 关键 CSS 内容界定

内联范围限于：
- CSS 变量定义（颜色、字体）
- `body`、`*` 基础 reset
- Header 样式（导航栏高度、背景）
- Hero section 占位样式（防止 CLS）

非首屏样式（product card、footer、collection 等）保留在 `theme.css` 异步加载。

## Risks / Trade-offs

- **FOUC（无样式内容闪烁）风险**：若内联 CSS 范围不足，非首屏元素在异步 CSS 加载前可能短暂无样式。缓解：充分覆盖首屏元素，并在慢速网络下测试。
- **维护负担**：内联 CSS 是 `theme.css` 的子集，需保持同步。缓解：在代码注释中标注来源，限制内联 CSS 仅覆盖最小必要集合。
- **Hero srcset 图片对应**：两张 Hero 图片的 srcset 需要分别对应正确的文件名，slider 动态渲染时需确认逻辑正确。

## Migration Plan

1. 修改 `hero-slider.liquid`，添加 `srcset`/`sizes` → 验证移动端图片请求
2. 提取关键 CSS 并内联至 `layout/theme.liquid`
3. 修改 `theme.css` 加载方式为异步
4. 使用 PageSpeed Insights 或 Chrome DevTools 验证 LCP 改善
5. 回滚：git revert 对应 commit，无数据迁移风险
