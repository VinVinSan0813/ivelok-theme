## Context

当前 `sections/main-product.liquid` 在 `#product-detail-images` 块中渲染 `custom.detail_images_pc` 元字段的图片列表，该块位于 `.container` 之外，无宽度限制。移动端直接展示同一批 PC 图，构图和尺寸均不适合窄屏。

## Goals / Non-Goals

**Goals:**
- 新增 `custom.detail_images_mobile` 元字段，移动端优先使用专属详情图
- 若 `detail_images_mobile` 为空，移动端回退展示 `detail_images_pc`，保证无空白
- PC 端行为完全不变

**Non-Goals:**
- 不做图片懒加载改造（新增 img 块同样加 `loading="lazy"`）
- 不修改 PC 端 `#product-detail-images` 的任何逻辑

## Decisions

**决策 1：CSS 媒体查询切换，而非 JS**
- 方案 A（选用）：在 Liquid 中同时输出两个区块，用 CSS `display: none / block` 按断点切换
- 方案 B：JS 检测 viewport 后动态渲染
- 选 A 原因：无 JS 依赖、无 CLS 风险、SSR 友好，符合现有主题架构

**决策 2：断点 768px**
- 与现有主题 mobile 断点一致（`@media (max-width: 768px)`）

**决策 3：元字段类型 `list.file_reference`**
- 与 `detail_images_pc` 保持一致，运营熟悉操作方式

## Risks / Trade-offs

- [运营遗漏填写] 移动端详情图为空时自动回退 PC 图，无空白风险 → 运营可按需优化，无强制时间窗口
- [Admin API 权限] 创建元字段定义需 `shpat_` token，已获取 → 可通过 API 自动创建

## Migration Plan

1. 通过 Admin API 创建元字段定义 `custom.detail_images_mobile`
2. 修改 `sections/main-product.liquid`，新增移动端图块
3. 修改 `assets/theme.css`，添加媒体查询控制显示
4. 推送到线上主题
5. 运营在 Admin 为产品上传移动端详情图

回滚：删除新增 Liquid 区块和 CSS，不影响 PC 端。
