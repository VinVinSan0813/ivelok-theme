# ivelok.com PageSpeed 移动端性能报告

> 数据来源：PageSpeed Insights — 移动端  
> 报告日期：2026-04-13  
> 分析链接：https://pagespeed.web.dev/analysis/https-ivelok-com/mt84zhkai1?form_factor=mobile

---

## 核心评分

| 维度 | 状态 |
|------|------|
| Performance | 需改善 |
| Accessibility | 需改善（对比度、触控目标） |
| Best Practices | 有警告（CSP、Console 错误） |
| SEO | 基本通过 |

---

## Core Web Vitals

| 指标 | 数值 | 说明 |
|------|------|------|
| First Contentful Paint (FCP) | **2.6s** | 首次内容渲染，偏慢 |
| Largest Contentful Paint (LCP) | **6.4s** | 最大内容渲染，严重偏慢（目标 <2.5s） |
| Total Blocking Time (TBT) | **40ms** | 主线程阻塞，尚可 |
| Cumulative Layout Shift (CLS) | **0** | 布局稳定性，优秀 |
| Speed Index | **3.4s** | 视觉加载速度，偏慢 |
| 最大关键路径延迟 | **990ms** | 请求链过长 |

> **主要瓶颈：LCP 达 6.4s，远超 Google 推荐的 2.5s 标准，Hero 图片是核心原因。**

---

## 优化机会（Opportunities）

### 🔴 1. 图片体积过大 — 可节省 167 KiB

| 图片 | 当前大小 | 优化后 | 可节省 |
|------|---------|--------|--------|
| hero-2.webp | 219.4 KiB | 102.7 KiB | **116.7 KiB**（压缩 71.7 + 响应式 46.2） |
| hero-1.webp | 178.9 KiB | 64.1 KiB | **114.8 KiB** |

**修复方案：**
- 使用 `srcset` 提供响应式图片（移动端 800px 宽度版本）
- 提高 WebP 压缩率（质量降至 75-80 即可）
- 已有 `hero-1-800.webp` / `hero-2-800.webp`，确认 `srcset` 已正确引用

### 🟠 2. 未使用的 JavaScript — 可节省 25 KiB

- `b5bfe654aw9a31df99pb879ff13m3bd6cd49m.js`：总大小 59.7 KiB，其中 **24.9 KiB 未使用**
- 该文件在 6,001ms 时产生一个 88ms 的长任务

**修复方案：** 检查该 JS 是否为 Shopify App 注入的脚本，考虑延迟加载或移除不需要的 App。

### 🟠 3. 渲染阻塞资源

| 资源 | 大小 | 阻塞时间 |
|------|------|---------|
| accelerated-checkout-backwards-compat.css | 2.8 KiB | 160ms |
| theme.css | 6.5 KiB | 470ms |

**修复方案：**
- `theme.css`：提取首屏关键 CSS 内联，其余异步加载
- Checkout CSS：确认是否必要，考虑延迟加载

### 🟡 4. 缓存策略过短 — 可节省 7 KiB

- 静态资源 TTL 仅 5-10 分钟，重复访问无法利用缓存
- **修复方案：** 在 Shopify 层面资源通常由 CDN 管理；对自定义资源设置更长的 `Cache-Control`

### 🟡 5. preconnect 连接过多

- 超过 4 个 `preconnect`，浏览器连接资源被分散
- **修复方案：** 仅保留关键域名的 `preconnect`（如 Google Fonts、Shopify CDN）

---

## 诊断项（Diagnostics）

### 主线程耗时分布

| 任务类型 | 耗时 |
|---------|------|
| Script Evaluation | 273ms |
| Other | 215ms |
| Style & Layout | 103ms |
| Parsing/Compilation | 76ms |
| Rendering | 29ms |
| Parse HTML/CSS | 14ms |
| Garbage Collection | 7ms |

### 强制 Reflow（布局抖动）

| 来源 | Reflow 时间 |
|------|------------|
| Unattributed | 18ms |
| shopify-perf-kit | 12ms |
| theme.js | 3ms |

**修复方案：** 检查 `theme.js` 中是否有频繁读写 DOM 几何属性（`offsetWidth`、`getBoundingClientRect` 等），批量操作避免触发 reflow。

### 网络总负载：1,826 KiB

| 资源 | 大小 |
|------|------|
| shop-pay-ButtonWithRegisterWebPixel.js | 326.7 KiB |
| hero-2.webp | 220.7 KiB |
| hero-1.webp | 180.1 KiB |

> Shop Pay 脚本 326.7 KiB 是最大负载，属 Shopify 原生脚本，暂无法移除，但可确保其异步加载。

### DOM 规模

- 总元素数：331（尚在合理范围）
- 最大深度：11 层
- body 最大子元素：7 个

---

## 可访问性问题（Accessibility）

### 🔴 色彩对比度不足

以下元素文字与背景对比度不达标（WCAG AA 要求 ≥ 4.5:1）：

- "SHOP NOW" 按钮
- "SALE" 徽章
- "In Stock" 库存标签
- 价格显示
- "Add to Cart" 按钮
- "View All Products" 链接

**修复方案：** 加深文字颜色或加深/加亮背景色，使用 [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) 验证。

### 🟠 触控目标尺寸不足

- Hero 滑动器的导航圆点尺寸/间距过小（目标应 ≥ 48×48px）

### 🟡 标题层级错误

- "Quick Links" 使用了 `<h4>`，但跳过了 `<h2>` / `<h3>`，破坏文档结构

### 🟡 图片缺少尺寸声明

- "About Us" 图片未设置明确的 `width` / `height` 属性，可能引起 CLS

---

## 安全性问题（Security）

### 🔴 Content Security Policy（CSP）缺失

| 问题 | 严重程度 |
|------|---------|
| 缺少 `script-src` 指令 | 高 |
| 缺少 `object-src` 指令 | 高 |
| 无 `Trusted Types` 策略 | 中 |

### 🔴 HSTS 配置不当

| 问题 | 严重程度 |
|------|---------|
| `max-age` 值过低 | 高（建议 ≥ 31536000，即 1 年） |
| 缺少 `includeSubDomains` | 中 |
| 缺少 `preload` | 中 |

### 🟠 缺少安全响应头

- 未设置 `Cross-Origin-Opener-Policy (COOP)`

### 🟡 Source Map 错误

- 多个 `.map` 文件返回 HTML 而非 JSON，影响调试体验（不影响用户）

---

## SEO 状态（基本良好）

| 检查项 | 状态 |
|--------|------|
| HTTPS 启用 | ✅ |
| robots.txt 有效 | ✅ |
| 页面 title 存在 | ✅ |
| rel=canonical 有效 | ✅ |
| 链接可抓取 | ✅ |
| 图片 alt 属性 | ✅ |
| HTTP→HTTPS 重定向 | ✅ |
| hreflang 实现 | ✅ |

---

## 优先级行动清单

| 优先级 | 问题 | 预期收益 |
|--------|------|---------|
| 🔴 P0 | Hero 图片响应式压缩（`srcset` + 压缩率） | LCP 从 6.4s → ~3s |
| 🔴 P0 | theme.css 渲染阻塞（关键 CSS 内联） | FCP 减少 470ms |
| 🟠 P1 | 修复所有色彩对比度问题 | Accessibility 评分提升 |
| 🟠 P1 | 清理未使用 JS / 延迟 App 脚本 | TBT 降低，LCP 改善 |
| 🟡 P2 | 修复标题层级（h4 改为合理层级） | Accessibility 结构合规 |
| 🟡 P2 | 添加 About Us 图片尺寸声明 | CLS 防劣化 |
| 🟡 P2 | 配置正确的 HSTS 头 | 安全评分提升 |
| 🟡 P3 | 减少 preconnect 数量至 ≤4 | 连接资源优化 |
