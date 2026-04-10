# PC Detail Images Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在商品页简介区块下方，新增全宽 PC 详情切图区域，图片来自 `custom.detail_images_pc` metafield，垂直堆叠展示。

**Architecture:** 在 `sections/main-product.liquid` 的 `pdp-description-section` 关闭后插入纯 Liquid 渲染区块，通过 `calc(50% - 50vw)` full-bleed 跳出 `.container` 宽度限制。metafield 为空时整个区块不渲染。

**Tech Stack:** Shopify Liquid, CSS (no JS, no framework), Shopify CLI 3.x

---

## 文件变更概览

| 操作 | 文件 | 职责 |
|------|------|------|
| 修改 | `sections/main-product.liquid` | 在第 327 行后插入详情图 Liquid 区块 |
| 修改 | `assets/theme.css` | 追加 full-bleed 详情图样式 |

---

## Task 1: 在 main-product.liquid 插入详情图区块

**Files:**
- Modify: `sections/main-product.liquid:327`

### 背景

第 309–327 行是 `pdp-description-section`（简介区块）。新代码插入在其 `{%- endif -%}`（第 327 行）之后、`.container` 关闭 `</div>`（第 329 行）之前。

- [ ] **Step 1: 在第 327 行 `{%- endif -%}` 后插入以下代码**

将 `sections/main-product.liquid` 第 327 行：

```liquid
    {%- endif -%}
```

替换为：

```liquid
    {%- endif -%}

    {%- assign detail_images_pc = product.metafields.custom.detail_images_pc.value -%}
    {%- if detail_images_pc != blank -%}
      <div id="product-detail-images">
        {%- for img in detail_images_pc -%}
          <img
            src="{{ img | image_url: width: 1920 }}"
            alt="{{ product.title | escape }} detail {{ forloop.index }}"
            loading="{% if forloop.first %}eager{% else %}lazy{% endif %}"
            width="1920"
          >
        {%- endfor -%}
      </div>
    {%- endif -%}
```

- [ ] **Step 2: 验证 Liquid 标签闭合**

```bash
cd /Users/ivelokvin/Desktop/ivelok-theme
node -e "
var fs = require('fs');
var src = fs.readFileSync('sections/main-product.liquid', 'utf8');
var opens  = (src.match(/\{%-?\s*(if|for|form|liquid)\b/g) || []).length;
var closes = (src.match(/\{%-?\s*end(if|for|form|liquid)\b/g) || []).length;
console.log('opens:', opens, 'closes:', closes, opens === closes ? 'OK' : 'MISMATCH');
"
```

预期输出：`opens: N closes: N OK`（数字相同，末尾 OK）

- [ ] **Step 3: Commit**

```bash
git add sections/main-product.liquid
git commit -m "feat: add PC detail images below product description"
```

---

## Task 2: 追加 CSS 样式到 theme.css

**Files:**
- Modify: `assets/theme.css:2241`（文件末尾追加）

- [ ] **Step 1: 在 theme.css 末尾追加以下样式**

在 `assets/theme.css` 文件最后一行之后追加：

```css

/* ── PC Detail Images ── */
#product-detail-images {
  margin-top: 3rem;
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
  height: auto;
}
```

- [ ] **Step 2: 验证 CSS 可读且选择器存在**

```bash
node -e "require('fs').readFileSync('assets/theme.css','utf8')" && \
grep -c "product-detail-images" assets/theme.css
```

预期输出：`3`（选择器出现 3 次：`#product-detail-images`、`#product-detail-images` block、`#product-detail-images img`）

- [ ] **Step 3: Commit**

```bash
git add assets/theme.css
git commit -m "feat: add full-bleed CSS for PC detail images"
```

---

## Task 3: 推送并预览验证

**Files:** 无代码变更，只推送

- [ ] **Step 1: 推送到 Shopify（unpublished 主题）**

```bash
shopify theme push \
  --store 215gih-5u.myshopify.com \
  --unpublished \
  --theme "pc-detail-images-v1"
```

预期输出包含：
```
The theme 'pc-detail-images-v1' was pushed successfully.
```

记录输出的主题 ID（格式 `#1XXXXXXXX`）。

- [ ] **Step 2: 配置 Metafield（如尚未创建）**

若 `custom.detail_images_pc` 尚未在 Shopify 后台创建：

1. 进入 Shopify Admin → Settings → Custom data → Products
2. 点击 Add definition
3. 填写：Name `Detail Images - PC`，Namespace `custom`，Key `detail_images_pc`，类型选 **File**，勾选 **Allow multiple**
4. 点击 Save

- [ ] **Step 3: 为 E26 上传详情图**

1. 进入 E26 商品编辑页
2. 滚动到 Metafields 区域 → 找到 "Detail Images - PC"
3. 按顺序上传 PC 详情切图（`欧版E26PC端详情页_01.jpg` → `_11.jpg`）
4. 点击 Save

- [ ] **Step 4: 桌面端验证**

用主题预览链接打开 E26 商品页：

```
https://215gih-5u.myshopify.com/products/e26?preview_theme_id=<主题ID>
```

确认：
- ✓ 简介区块下方出现详情图
- ✓ 图片左右与浏览器视口齐平（无留白）
- ✓ 图片垂直堆叠，无间隙
- ✓ 无 Metafield 商品预览：详情图区域不渲染，页面无空白块

---

## 自检结果

| 需求 | 对应 Task |
|------|-----------|
| 简介下方显示详情图 | Task 1 |
| 图片来自 custom.detail_images_pc | Task 1 |
| 全宽 full-bleed | Task 2 |
| 首张 eager、其余 lazy | Task 1 |
| metafield 为空不渲染 | Task 1 |
| 推送 + 验证 | Task 3 |
