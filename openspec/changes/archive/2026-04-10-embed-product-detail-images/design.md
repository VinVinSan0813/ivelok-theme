## Context

`sections/main-product.liquid` 是商品详情页的核心模板，目前结构为：面包屑 → 主图 + 产品信息 → Tabs（描述/规格/物流）。

详情切图（如欧版 E26 的 11 张 PC 端长图）是品牌提供的营销素材，尺寸已固定（约 790px 宽），需在 Tabs 下方以无间隙堆叠方式展示。图片通过 Shopify 产品 metafield 绑定，实现每个产品独立配置。

## Goals / Non-Goals

**Goals:**
- 移除现有 `.product-tabs` 区块（含三个 Tab 的 HTML + JS）
- 在原位置替换为详情图渲染区，支持多张图片顺序展示
- 图片宽度撑满 `.container` 容器（与切图设计尺寸匹配）
- 通过 `product.metafields.custom.detail_images` 动态读取，每个产品独立
- 无图时区块不渲染

**Non-Goals:**
- 不做移动端适配（移动端切图另行处理）
- 不实现图片上传界面（通过 Shopify Admin metafield 管理）
- 不修改现有 Gallery 和购买区

## Decisions

### 决策 1：使用 Metafield（File Reference List）而非 Section Settings

**选择**：`product.metafields.custom.detail_images`，类型 `list.file_reference`

**理由**：
- 每个产品的详情图不同，Section Settings 是全局的，无法按产品区分
- File Reference List metafield 原生支持多文件、有序排列，Admin 界面友好
- 可通过 Shopify Admin → Products → Metafields 直接管理，无需开发者介入

**备选方案**：将图片 URL 硬编码进模板 → 不可扩展，每次换产品都需改代码，排除。

### 决策 2：图片宽度 100% 容器宽，无间隙堆叠

**选择**：`width: 100%; display: block;`，容器不加内边距

**理由**：详情切图本身已包含内边距设计，强制撑满可还原设计稿效果。`display: block` 消除 img 元素底部天然空隙。

### 决策 3：直接替换 `.product-tabs` 区块

**理由**：Tabs 中的描述/规格/物流信息价值低于品牌详情切图，且切图本身已包含产品卖点和规格呈现。整体删除 `.product-tabs` HTML（第 278–398 行）及其对应的 Tab 切换 JS，替换为详情图区块，页面结构更简洁，减少 JS 依赖。

## Risks / Trade-offs

- **图片未上传到 metafield** → 区块不渲染，页面正常显示，无破坏性影响
- **大量高清切图影响页面加载速度** → 使用 Shopify CDN + `image_url` filter 指定宽度（最大 1600px），并对第 2 张起启用 `loading="lazy"`
- **metafield 未声明时 Liquid 返回 nil** → 已通过 `{% if %}` 判空保护

## Migration Plan

1. 在 Shopify Admin → Settings → Custom data → Products 中添加 metafield 定义：
   - Namespace: `custom`，Key: `detail_images`，类型：File Reference（List）
2. 修改 `sections/main-product.liquid`，删除 `.product-tabs` 区块（第 278–398 行）及 Tab 切换 JS，替换为详情图区块
3. 在目标产品的 metafield 中上传对应切图（如欧版 E26 的 11 张）
4. 预览确认尺寸与排版

**回滚**：删除 Liquid 区块代码即可，metafield 数据不影响页面。

## Open Questions

- 是否需要为移动端单独配置 metafield（`custom.detail_images_mobile`）？本期暂不处理。
- 切图是否需要 alt 文本支持？当前方案复用 `product.title`，后续可扩展为 metafield 数组。
