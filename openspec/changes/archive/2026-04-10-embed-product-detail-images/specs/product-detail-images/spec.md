## ADDED Requirements

### Requirement: 详情图区块渲染

商品详情页 SHALL 移除现有 Tabs 区块，并在原位置渲染详情图区块，该区块读取 `product.metafields.custom.detail_images`（类型：`list.file_reference`）并按序展示所有图片。

#### Scenario: 产品有详情图时渲染图片

- **WHEN** 产品的 `custom.detail_images` metafield 包含一张或多张图片
- **THEN** 详情图区块替代原 Tabs 位置出现，按 metafield 中的顺序逐张渲染

#### Scenario: 产品无详情图时区块不渲染

- **WHEN** 产品的 `custom.detail_images` metafield 为空或未设置
- **THEN** 详情图区块不渲染任何 HTML，不影响页面其他区域

### Requirement: 图片尺寸匹配容器宽度

详情图区块中的每张图片 SHALL 宽度为父容器的 100%，且图片之间无间隙。

#### Scenario: 图片宽度撑满容器

- **WHEN** 详情图区块渲染
- **THEN** 每张图片的 CSS `width` 为 `100%`，`display` 为 `block`，图片之间无 margin/gap

### Requirement: 图片懒加载

除第一张图片外，其余图片 SHALL 使用 `loading="lazy"` 属性以优化页面加载性能。

#### Scenario: 首图立即加载

- **WHEN** 详情图区块渲染且包含多张图片
- **THEN** 第一张图片的 `loading` 属性为 `eager`（或无该属性）

#### Scenario: 后续图片懒加载

- **WHEN** 详情图区块渲染且包含多张图片
- **THEN** 第二张及之后的图片均带有 `loading="lazy"` 属性

### Requirement: 图片通过 Shopify CDN 输出

所有详情图 SHALL 通过 Shopify `image_url` filter 输出，最大宽度限定为 1600px，以利用 CDN 加速并避免超大原图加载。

#### Scenario: 图片 URL 使用 CDN 转换

- **WHEN** 渲染详情图
- **THEN** 图片 `src` 使用 `| image_url: width: 1600` filter 生成的 CDN 地址
