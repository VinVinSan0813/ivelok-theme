## ADDED Requirements

### Requirement: Arrow navigation buttons
商品主图区 SHALL 在图片容器内显示左箭头（prev）和右箭头（next）按钮，允许用户按顺序浏览当前变体的所有图片。

#### Scenario: Next arrow advances image
- **WHEN** 用户点击右箭头按钮
- **THEN** 主图切换为当前图片的下一张，指示点更新

#### Scenario: Prev arrow goes back
- **WHEN** 用户点击左箭头按钮
- **THEN** 主图切换为当前图片的上一张，指示点更新

#### Scenario: Arrows hidden on mobile
- **WHEN** 视口宽度 < 768px
- **THEN** 左右箭头按钮不可见（`display: none`）

#### Scenario: Arrow disabled at boundary
- **WHEN** 当前显示第一张图片
- **THEN** 左箭头按钮显示为禁用状态（`disabled` 或 `opacity: 0.3`）

### Requirement: Touch swipe gesture
商品主图区 SHALL 支持 touch swipe 手势，向左滑动切换到下一张，向右滑动切换到上一张。

#### Scenario: Swipe left advances image
- **WHEN** 用户在主图区域向左滑动（swipe left，水平位移 > 50px）
- **THEN** 主图切换为下一张图片

#### Scenario: Swipe right goes back
- **WHEN** 用户在主图区域向右滑动（swipe right，水平位移 > 50px）
- **THEN** 主图切换为上一张图片

#### Scenario: Vertical scroll not blocked
- **WHEN** 用户在主图区域做垂直滑动（水平位移 < 垂直位移）
- **THEN** 页面正常滚动，不触发图片切换

### Requirement: Dot indicators
商品主图区 SHALL 在主图下方渲染圆点指示器，每个圆点对应一张图片，当前图片对应的圆点高亮显示。

#### Scenario: Active dot highlighted
- **WHEN** 第 N 张图片正在显示
- **THEN** 第 N 个圆点拥有 `active` class，其余圆点为非激活状态

#### Scenario: Dot click jumps to image
- **WHEN** 用户点击第 N 个圆点
- **THEN** 主图切换为第 N 张图片

#### Scenario: Dots hidden when many images
- **WHEN** 当前变体图片数量 > 8
- **THEN** 圆点区域不渲染（`display: none`）

### Requirement: Variant image preload
切换颜色/变体时，系统 SHALL 预加载目标变体的第一张图片，以减少可见加载延迟。

#### Scenario: Preload on variant change
- **WHEN** 用户选择一个新的颜色/变体选项
- **THEN** 系统向 `<head>` 注入 `<link rel="preload" as="image">` 指向该变体首张图片 URL

#### Scenario: No duplicate preload tags
- **WHEN** 用户多次切换同一变体
- **THEN** 同一 URL 的 preload link 不重复注入
