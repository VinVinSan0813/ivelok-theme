# PC Detail Images — Design Spec

**Date:** 2026-04-10
**Scope:** `sections/main-product.liquid`, `assets/theme.css`

---

## Goal

在商品页简介区块（`pdp-description-section`）下方，新增一个 PC 详情切图区域，图片取自 `custom.detail_images_pc` metafield，全宽（full-bleed）垂直堆叠展示。

---

## Architecture

### 插入位置

`sections/main-product.liquid` 第 327 行 `{%- endif -%}` 之后、`.container` 关闭 `</div>` 之前：

```
.product-page
  .container
    .product-layout
    .product-tabs
    .pdp-description-section
    ← 插入 #product-detail-images
  </div>
</div>
```

### Full-bleed 原理

`.container` 有 `max-width` 和水平 padding。通过以下 CSS 强制区块拉伸到视口宽度：

```css
margin-left: calc(50% - 50vw);
margin-right: calc(50% - 50vw);
width: 100vw;
```

---

## Implementation

### sections/main-product.liquid

在 `pdp-description-section` 的 `{%- endif -%}` 后插入：

```liquid
{%- assign detail_images_pc = product.metafields.custom.detail_images_pc.value -%}
{%- if detail_images_pc != blank -%}
  <div id="product-detail-images">
    {%- for img in detail_images_pc -%}
      <img
        src="{{ img | image_url: width: 1920 }}"
        alt="{{ product.title | escape }} detail {{ forloop.index }}"
        loading="{{ forloop.first | iif: 'eager', 'lazy' }}"
        width="1920"
      >
    {%- endfor -%}
  </div>
{%- endif -%}
```

### assets/theme.css

追加到文件末尾：

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

---

## Data Requirements

| Metafield | Namespace | Key | 类型 |
|-----------|-----------|-----|------|
| PC 详情图 | `custom` | `detail_images_pc` | File Reference List（图片） |

Shopify Admin → Settings → Custom data → Products 中创建该 metafield，然后在 E26 商品编辑页上传图片。

---

## Edge Cases

- **metafield 为空**：整个 `#product-detail-images` 不渲染，页面无变化。
- **单张图片**：正常渲染，`loading="eager"`。
- **多张图片**：首张 eager，其余 lazy，顺序与 metafield 上传顺序一致。

---

## Files Changed

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `sections/main-product.liquid` | 修改 | 插入约 10 行 Liquid |
| `assets/theme.css` | 修改 | 追加约 15 行 CSS |
