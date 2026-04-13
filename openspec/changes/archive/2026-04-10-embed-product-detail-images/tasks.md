## 1. Shopify Metafield 配置

- [ ] 1.1 在 Shopify Admin → Settings → Custom data → Products 中添加 metafield 定义：Namespace `custom`，Key `detail_images`，类型 File Reference（允许多个）
- [ ] 1.2 在欧版 E26 产品页面的 metafield 编辑器中，上传并排序 11 张 PC 端详情切图（欧版E26PC端详情页_01.jpg ~ _11.jpg）

## 2. 模板修改

- [x] 2.1 删除 `sections/main-product.liquid` 第 278–398 行的 `.product-tabs` 整个区块（含三个 Tab 的 HTML）
- [x] 2.2 在原位置插入详情图区块：`{% assign detail_images = product.metafields.custom.detail_images.value %}` + `{% if detail_images %}` 判断 + `{% for image in detail_images %}` 循环渲染 `<img>`
- [x] 2.3 图片属性：`src="{{ image | image_url: width: 1600 }}"`，`display: block; width: 100%`，首图 `loading="eager"`，其余 `loading="lazy"`
- [x] 2.4 检查并删除 `assets/` 中 Tab 切换相关的 JS 逻辑（`product-tab-btn` / `product-tab-panel` 相关代码）

## 3. 样式处理

- [x] 3.1 为详情图容器添加样式：`line-height: 0;`（消除 img 底部空隙），确保图片间无间隙堆叠
- [x] 3.2 左右全拉伸：用负 margin 抵消 `.container` 各断点内边距，图片撑满屏幕宽度

## 4. 验证

- [ ] 4.1 在 Shopify 主题预览中打开欧版 E26 产品页，确认 11 张详情图按序出现在购买区下方，Tabs 已消失
- [ ] 4.2 确认无详情图的其他产品页面正常显示（区块不渲染，无空白区域）
- [ ] 4.3 检查浏览器 Network 面板，确认第 2 张起图片为懒加载
