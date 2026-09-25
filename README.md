# Recipe Finder · 菜谱查找

Web 开发技术课程作业，使用原生 HTML、CSS 和 JavaScript 实现。

## 功能

- 输入英文菜谱名称，点击搜索按钮或按回车搜索。
- 通过 TheMealDB API 展示菜品图片、名称和分类。
- 点击卡片查看地区、食材用量和做法，点击返回按钮回到列表。
- 提供空输入、无结果和网络异常提示，适配手机和电脑。

## 运行

直接用浏览器打开 `index.html`，无需安装依赖。菜谱与图片通过网络加载，需要联网。

也可以在本目录运行 `python -m http.server 8000`，访问 http://localhost:8000 。

## 文件结构

- `index.html`：搜索框、结果列表和详情区域。
- `style.css`：页面样式与响应式布局。
- `script.js`：接口请求、DOM 渲染与事件处理。

## 数据接口

数据来源：[TheMealDB](https://www.themealdb.com/api.php)。

- 按名称搜索：`https://www.themealdb.com/api/json/v1/1/search.php?s=pasta`
- 查询详情：`https://www.themealdb.com/api/json/v1/1/lookup.php?i=52771`

接口原始菜名、食材和做法为英文，搜索时请使用英文名称。
