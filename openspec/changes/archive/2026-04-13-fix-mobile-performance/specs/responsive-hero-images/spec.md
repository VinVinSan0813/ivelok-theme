## ADDED Requirements

### Requirement: Hero 图片使用响应式 srcset
Hero 轮播图的 `<img>` 标签 SHALL 包含 `srcset` 和 `sizes` 属性，浏览器 SHALL 根据视口宽度自动选择最优图片资源。移动端（≤800px）SHALL 加载 800px 版本，桌面端加载原始分辨率版本。

#### Scenario: 移动端加载压缩图片
- **WHEN** 用户在视口宽度 ≤800px 的设备上访问首页
- **THEN** 浏览器 SHALL 请求 `hero-1-800.webp` 或 `hero-2-800.webp`，而非原始尺寸文件

#### Scenario: 桌面端加载原图
- **WHEN** 用户在视口宽度 >800px 的设备上访问首页
- **THEN** 浏览器 SHALL 请求 `hero-1.webp` 或 `hero-2.webp` 原始分辨率文件

#### Scenario: srcset 属性格式正确
- **WHEN** 检查 hero-slider.liquid 渲染的 HTML
- **THEN** 每个 Hero `<img>` SHALL 包含 `srcset` 属性，列出 800w 和 1600w 两个候选，以及对应的 `sizes="(max-width: 800px) 800px, 1600px"`
