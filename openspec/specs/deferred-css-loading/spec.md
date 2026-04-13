# deferred-css-loading Specification

## Purpose
TBD - created by archiving change fix-mobile-performance. Update Purpose after archive.
## Requirements
### Requirement: 关键 CSS 内联至 head
`layout/theme.liquid` 的 `<head>` SHALL 包含内联的关键 CSS，覆盖首屏所有可见元素（CSS 变量、body reset、header、hero 占位样式），以确保首屏内容在任何外部 CSS 加载前即可正确渲染。

#### Scenario: 首屏无外部 CSS 依赖
- **WHEN** 浏览器解析 HTML `<head>` 时
- **THEN** 内联 `<style>` SHALL 包含渲染首屏所需的完整样式，无需等待外部 CSS 文件

#### Scenario: 内联 CSS 包含必要变量
- **WHEN** 检查内联 `<style>` 内容
- **THEN** SHALL 包含 `:root` CSS 变量定义（颜色、字体大小）、`body` 基础样式、`.header` 样式

### Requirement: theme.css 异步加载
`theme.css` SHALL 通过 `media="print"` + `onload` 方式异步加载，不阻塞页面首次渲染。页面 SHALL 同时提供 `<noscript>` 回退确保无 JS 环境下样式正常加载。

#### Scenario: theme.css 不阻塞渲染
- **WHEN** 使用 Chrome DevTools Performance 面板录制页面加载
- **THEN** `theme.css` SHALL NOT 出现在关键渲染路径（render-blocking resources）中

#### Scenario: noscript 回退可用
- **WHEN** 浏览器禁用 JavaScript
- **THEN** `<noscript>` 中的 `<link rel="stylesheet">` SHALL 正常加载 theme.css，页面样式完整显示

