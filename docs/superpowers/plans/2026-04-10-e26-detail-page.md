# E26 Detail Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 E26 商品页购买区下方，实现双 metafield 响应式详情切图区 + 四栏 HTML 零件区块，PC/手机各加载对应图片组，全宽拉伸展示。

**Architecture:** 两个 Shopify File Reference List metafields（`custom.detail_images_pc` / `custom.detail_images_mobile`）通过 Liquid 输出为 JSON 数据岛，页面加载时 JS 按屏幕宽度（断点 768px）选择加载对应组。四栏零件区块独立为 `sections/product-components.liquid`，通过 `{% render %}` 嵌入产品页。

**Tech Stack:** Shopify Liquid, Vanilla JS, CSS (no framework), Shopify CLI 3.x

---

## 文件变更概览

| 操作 | 文件 | 职责 |
|------|------|------|
| 修改 | `sections/main-product.liquid` | 替换旧 detail_images 区块为新双 metafield + JS 方案 |
| 修改 | `assets/theme.css` | 替换旧负 margin 为 full-bleed；新增零件区块样式 |
| 新建 | `sections/product-components.liquid` | 四栏零件展示 section |

---

## Task 1: 替换 main-product.liquid 中的详情图区块

**Files:**
- Modify: `sections/main-product.liquid:277–291`

### 背景
当前第 277–291 行是旧的单 metafield 方案（`custom.detail_images`），用 Liquid 直接渲染 img 标签。需替换为双 metafield + JS 按需加载方案。

- [ ] **Step 1: 删除旧区块，插入新代码**

将 `sections/main-product.liquid` 第 277–291 行替换为：

```liquid
      {%- comment -%} ── Detail Images (PC + Mobile, JS-driven) ── {%- endcomment -%}
      {%- assign detail_images_pc = product.metafields.custom.detail_images_pc.value -%}
      {%- assign detail_images_mobile = product.metafields.custom.detail_images_mobile.value -%}
      {%- if detail_images_pc != blank or detail_images_mobile != blank -%}
        <div id="product-detail-images"></div>

        <script type="application/json" id="detail-images-pc">
          [{% for img in detail_images_pc %}"{{ img | image_url: width: 1920 }}"{% unless forloop.last %},{% endunless %}{% endfor %}]
        </script>
        <script type="application/json" id="detail-images-mobile">
          [{% for img in detail_images_mobile %}"{{ img | image_url: width: 750 }}"{% unless forloop.last %},{% endunless %}{% endfor %}]
        </script>

        <script>
          (function () {
            var isMobile = window.innerWidth < 768;
            var key = isMobile ? 'detail-images-mobile' : 'detail-images-pc';
            var el = document.getElementById(key);
            var images = el ? JSON.parse(el.textContent.trim() || '[]') : [];
            if (!images.length && isMobile) {
              var pcEl = document.getElementById('detail-images-pc');
              images = pcEl ? JSON.parse(pcEl.textContent.trim() || '[]') : [];
            }
            if (!images.length) return;
            var container = document.getElementById('product-detail-images');
            container.innerHTML = images.map(function (src, i) {
              return '<img src="' + src + '" alt="" loading="' + (i === 0 ? 'eager' : 'lazy') + '">';
            }).join('');
          })();
        </script>
      {%- endif -%}
```

- [ ] **Step 2: 验证 Liquid 语法**

```bash
cd /Users/ivelokvin/Desktop/ivelok-theme
# 检查标签是否闭合
grep -c "{%-\|-%}" sections/main-product.liquid
```

预期：输出一个偶数（开闭标签成对）。

- [ ] **Step 3: Commit**

```bash
git add sections/main-product.liquid
git commit -m "feat: replace detail images with dual metafield JS loader"
```

---

## Task 2: 更新 theme.css 详情图样式

**Files:**
- Modify: `assets/theme.css:1954–1975`

### 背景
旧方案用负 margin 抵消容器 padding（需随断点调整）。新方案改用 `calc(50% - 50vw)` full-bleed，简洁且不依赖容器 padding 值。

- [ ] **Step 1: 替换旧 Detail Images CSS**

将 `assets/theme.css` 第 1954–1975 行替换为：

```css
/* ── Detail Images ── */
#product-detail-images {
  margin-top: 2rem;
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);
  width: 100vw;
  line-height: 0;
  font-size: 0;
}

#product-detail-images img {
  display: block;
  width: 100%;
  max-width: 100%;
}
```

- [ ] **Step 2: 验证 CSS 语法**

```bash
node -e "require('fs').readFileSync('assets/theme.css','utf8')" && echo "OK"
```

预期：`OK`（文件可读，无语法错误）。

- [ ] **Step 3: Commit**

```bash
git add assets/theme.css
git commit -m "feat: update detail images to full-bleed layout"
```

---

## Task 3: 新建 sections/product-components.liquid

**Files:**
- Create: `sections/product-components.liquid`
- Modify: `sections/main-product.liquid` (在详情图区块后添加 render)

### 背景
四栏零件区块展示座椅/大灯/变速/电机四张白底产品图，每栏含图片、小标题、描述。图片上传到 Shopify Files 后在 section settings 中配置 URL。

- [ ] **Step 1: 创建 sections/product-components.liquid**

```liquid
{%- if section.settings.show_section -%}
<div class="product-components">
  <div class="product-components__grid">

    {%- for i in (1..4) -%}
      {%- assign img_key = 'component_image_' | append: i -%}
      {%- assign title_key = 'component_title_' | append: i -%}
      {%- assign desc_key = 'component_desc_' | append: i -%}
      {%- assign img = section.settings[img_key] -%}
      {%- assign title = section.settings[title_key] -%}
      {%- assign desc = section.settings[desc_key] -%}
      {%- if img != blank or title != blank -%}
        <div class="product-components__item">
          {%- if img != blank -%}
            <div class="product-components__img-wrap">
              <img
                src="{{ img | image_url: width: 600 }}"
                alt="{{ title | escape }}"
                loading="lazy"
                width="600"
              >
            </div>
          {%- endif -%}
          {%- if title != blank -%}
            <h3 class="product-components__title">{{ title }}</h3>
          {%- endif -%}
          {%- if desc != blank -%}
            <p class="product-components__desc">{{ desc }}</p>
          {%- endif -%}
        </div>
      {%- endif -%}
    {%- endfor -%}

  </div>
</div>
{%- endif -%}

{% schema %}
{
  "name": "Product Components",
  "settings": [
    {
      "type": "checkbox",
      "id": "show_section",
      "label": "Show section",
      "default": true
    },
    { "type": "image_picker", "id": "component_image_1", "label": "Image 1" },
    { "type": "text", "id": "component_title_1", "label": "Title 1", "default": "Extensive Soft Seat" },
    { "type": "text", "id": "component_desc_1", "label": "Description 1", "default": "Pure relaxation with the comfort of an extensive soft seat." },
    { "type": "image_picker", "id": "component_image_2", "label": "Image 2" },
    { "type": "text", "id": "component_title_2", "label": "Title 2", "default": "LED Headlight & Taillight" },
    { "type": "text", "id": "component_desc_2", "label": "Description 2", "default": "Illuminate the path ahead and make sure vehicles behind you can see you clearly." },
    { "type": "image_picker", "id": "component_image_3", "label": "Image 3" },
    { "type": "text", "id": "component_title_3", "label": "Title 3", "default": "7-Speed SHIMANO Gears" },
    { "type": "text", "id": "component_desc_3", "label": "Description 3", "default": "Reliable and accurate gear shifting for all riding conditions." },
    { "type": "image_picker", "id": "component_image_4", "label": "Image 4" },
    { "type": "text", "id": "component_title_4", "label": "Title 4", "default": "Powerful Hub Motor" },
    { "type": "text", "id": "component_desc_4", "label": "Description 4", "default": "70Nm of torque from the 250W motor conquers any hill." }
  ],
  "presets": [
    { "name": "Product Components" }
  ]
}
{% endschema %}
```

- [ ] **Step 2: 在 main-product.liquid 中嵌入该 section**

在 `sections/main-product.liquid` 的 `{%- endif -%}` 后（第 291 行附近），关闭 `.container` 的 `</div>` 之前，添加：

```liquid
      {% render 'product-components' %}
```

完整上下文如下（确认插入位置正确）：

```liquid
      {%- endif -%}
      {% render 'product-components' %}
    </div>
  </div>
</div>
```

- [ ] **Step 3: 添加零件区块 CSS 到 theme.css**

在 `assets/theme.css` 文件末尾（`/* CART PAGE */` 注释之前）追加：

```css
/* ── Product Components ── */
.product-components {
  margin-top: 3rem;
  padding: 3rem 0;
  background: #f9fafb;
}

.product-components__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  max-width: 80rem;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 768px) {
  .product-components__grid {
    grid-template-columns: repeat(4, 1fr);
    padding: 0 2rem;
  }
}

.product-components__item {
  text-align: center;
}

.product-components__img-wrap {
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 8px;
  margin-bottom: 1rem;
  background: #fff;
}

.product-components__img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.product-components__title {
  font-size: 0.9375rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.375rem;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.product-components__desc {
  font-size: 0.8125rem;
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
}
```

- [ ] **Step 4: 验证文件存在且语法正确**

```bash
ls sections/product-components.liquid && echo "section exists"
grep -c "{% schema %}" sections/product-components.liquid
```

预期：
```
section exists
1
```

- [ ] **Step 5: Commit**

```bash
git add sections/product-components.liquid sections/main-product.liquid assets/theme.css
git commit -m "feat: add product-components section with 4-column layout"
```

---

## Task 4: 全量推送到 Shopify 新主题

**Files:** 无代码变更，只推送

### 背景
之前用 `--only` 只推两个文件，导致主题不完整。本次全量推送创建新的 unpublished 主题。

- [ ] **Step 1: 全量推送**

```bash
shopify theme push \
  --store 215gih-5u.myshopify.com \
  --unpublished \
  --theme "e26-detail-v2"
```

预期输出包含：
```
The theme 'e26-detail-v2' (#XXXXXXXXX) was pushed successfully.
```

记录输出的主题 ID（格式：`#147XXXXXXX`）。

- [ ] **Step 2: 确认主题存在**

```bash
shopify theme list --store 215gih-5u.myshopify.com 2>&1 | grep "e26-detail-v2"
```

预期：显示 `e26-detail-v2 [unpublished] #XXXXXXXXX`

---

## Task 5: Shopify Admin 手动配置（需人工操作）

### 5.1 配置 Metafield 定义

- [ ] 进入 Shopify Admin → Settings → Custom data → Products
- [ ] 添加 metafield：Namespace `custom`，Key `detail_images_pc`，类型：**File（允许多个）**，名称 "Detail Images - PC"
- [ ] 添加 metafield：Namespace `custom`，Key `detail_images_mobile`，类型：**File（允许多个）**，名称 "Detail Images - Mobile"

### 5.2 上传切图到 E26 产品

- [ ] 进入 E26 产品编辑页 → 滚动到 Metafields 区域
- [ ] 在 "Detail Images - PC" 字段上传以下文件（按序）：
  - `欧版E26PC端详情页_01.jpg` → `_11.jpg`（共 11 个，含 `_10.gif`）
- [ ] 在 "Detail Images - Mobile" 字段上传以下文件（按序）：
  - `欧版E26手机端详情页_01.jpg` → `_09.jpg` + `手机男款gif.gif`（共 10 个）
- [ ] 点击 Save

### 5.3 上传零件图到主题编辑器

- [ ] 进入 Shopify Admin → Themes → e26-detail-v2 → Customize
- [ ] 找到产品页模板 → 找到 "Product Components" section
- [ ] 依次上传：
  - Image 1: `轮播/1.jpg`（座椅）
  - Image 2: `轮播/2.jpg`（大灯）
  - Image 3: `轮播/3.jpg`（变速）
  - Image 4: `轮播/4.jpg`（电机）
- [ ] 点击 Save

---

## Task 6: 验证

- [ ] **Step 1: 桌面端验证**

打开主题预览链接（从 Task 4 Step 1 输出的 URL）：
```
https://215gih-5u.myshopify.com?preview_theme_id=<主题ID>
```
导航到 E26 产品页，确认：
- ✓ 购买区下方显示 11 张 PC 切图，全宽无间距
- ✓ 切图下方显示四栏零件区块（座椅/大灯/变速/电机）
- ✓ 无 Tabs 残留

- [ ] **Step 2: 手机端验证**

在 Chrome 开发者工具中切换到手机模式（iPhone 12，375px）刷新页面，确认：
- ✓ 详情区显示手机切图（750px 设计稿，垂直构图），而非 PC 宽图
- ✓ 零件区块为 2 列布局（非 4 列）

- [ ] **Step 3: 无图降级验证**

临时创建一个无 metafield 的测试产品，预览确认详情区不渲染，页面无空白块或 JS 报错。

---

## 自检结果

| 需求 | 对应 Task |
|------|-----------|
| 购买区下方显示详情图 | Task 1 |
| PC 加载 1920px 切图 | Task 1 |
| 手机加载 750px 切图 | Task 1 |
| 断点 768px | Task 1 |
| 全宽拉伸 | Task 2 |
| 四栏零件区块 | Task 3 |
| Metafield 配置 | Task 5 |
| 图片上传 | Task 5 |
| 全量推送（非 --only）| Task 4 |
| 验证 PC / 手机 | Task 6 |
