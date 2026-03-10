# L-feed Updates / L-feed 更新日志

[English](#english) | [中文](#中文)

---

<a name="english"></a>
## English

A markdown-powered changelog/update site generator. Create beautiful update pages by simply writing markdown files.

### Features

- **Markdown powered**: Write updates in markdown with frontmatter
- **SEO ready**: Each update has canonical URLs, metadata, and clean HTML
- **Shareable**: Built-in share buttons for copying links and posting to social media
- **Low maintenance**: No database—just markdown files and an automated build step
- **Hot reload**: Updates regenerate automatically when you edit markdown files
- **Bilingual**: Chinese/English language switcher for the interface

### Quick Start

#### Installation

```bash
npm install
```

#### Development

```bash
npm run dev
```

The site will be available at `http://localhost:5173/updates/`

#### Creating a new update

Create a new markdown file in the `updates/` directory following this pattern:

```
updates/YYYY-MM-DD-slug.md
```

Example:

```markdown
---
title: Improved mobile layout
date: 2026-03-05
summary: A smoother reading surface for phones and tablets.
---

We refactored the mobile layout so the reading flow fits any screen.

### Highlights

- New typography scale crafted for small displays
- Sticky reading controls to save taps
- Faster gesture handling and buttery scrolling
```

#### Build for production

```bash
npm run build
```

#### Preview production build

```bash
npm run preview
```

### Project Structure

```
l-feed-updates/
├── scripts/
│   └── generate-updates.mjs    # Build script that generates static pages
├── updates/
│   ├── index.html              # Update list page
│   ├── list.js                 # List page logic
│   ├── detail-template.html    # Detail page template
│   ├── detail.js               # Detail page logic
│   ├── i18n.js                 # Internationalization (language switcher)
│   ├── updates.css             # Styles
│   └── *.md                    # Your markdown updates
├── public/                     # Static assets
├── vite.config.js              # Vite configuration
└── package.json
```

### How it works

1. The `generate-updates.mjs` script reads all markdown files from `updates/`
2. It parses frontmatter (title, date, summary) and markdown content
3. It generates:
   - `public/updates/index.json` - List of all updates
   - `public/updates/*.md` - Copies of markdown files
   - `updates/{slug}/index.html` - Individual detail pages
4. Vite serves the static files and watches for changes

### Customization

#### Styling

Edit `updates/updates.css` to customize the appearance.

#### Templates

Edit `updates/index.html` for the list page layout.
Edit `updates/detail-template.html` for the detail page layout.

#### Build configuration

Edit `vite.config.js` to change:
- Port number
- Base path
- Build output directory

---

<a name="中文"></a>
## 中文

基于 Markdown 的更新日志/站点生成器。只需编写 Markdown 文件即可创建精美的更新页面。

### 功能特性

- **Markdown 驱动**：使用 Markdown 和 frontmatter 编写更新内容
- **SEO 友好**：每次更新都有规范的 URL、元数据和干净的 HTML
- **可分享**：内置分享按钮，可复制链接和发布到社交媒体
- **低维护**：无需数据库——只需 Markdown 文件和自动构建步骤
- **热重载**：编辑 Markdown 文件时自动重新生成更新
- **双语支持**：界面支持中英文切换

### 快速开始

#### 安装

```bash
npm install
```

#### 开发

```bash
npm run dev
```

站点将在 `http://localhost:5173/updates/` 上运行

#### 创建新更新

在 `updates/` 目录中创建一个新的 Markdown 文件，遵循以下格式：

```
updates/YYYY-MM-DD-slug.md
```

示例：

```markdown
---
title: Improved mobile layout
date: 2026-03-05
summary: A smoother reading surface for phones and tablets.
---

We refactored the mobile layout so the reading flow fits any screen.

### Highlights

- New typography scale crafted for small displays
- Sticky reading controls to save taps
- Faster gesture handling and buttery scrolling
```

#### 生产构建

```bash
npm run build
```

#### 预览生产构建

```bash
npm run preview
```

### 项目结构

```
l-feed-updates/
├── scripts/
│   └── generate-updates.mjs    # 生成静态页面的构建脚本
├── updates/
│   ├── index.html              # 更新列表页
│   ├── list.js                 # 列表页逻辑
│   ├── detail-template.html    # 详情页模板
│   ├── detail.js               # 详情页逻辑
│   ├── i18n.js                 # 国际化（语言切换器）
│   ├── updates.css             # 样式文件
│   └── *.md                    # 你的 Markdown 更新文件
├── public/                     # 静态资源
├── vite.config.js              # Vite 配置
└── package.json
```

### 工作原理

1. `generate-updates.mjs` 脚本读取 `updates/` 中的所有 Markdown 文件
2. 解析 frontmatter（标题、日期、摘要）和 Markdown 内容
3. 生成以下内容：
   - `public/updates/index.json` - 所有更新的列表
   - `public/updates/*.md` - Markdown 文件的副本
   - `updates/{slug}/index.html` - 单个详情页面
4. Vite 提供静态文件并监视更改

### 自定义

#### 样式

编辑 `updates/updates.css` 来自定义外观。

#### 模板

编辑 `updates/index.html` 修改列表页布局。
编辑 `updates/detail-template.html` 修改详情页布局。

#### 构建配置

编辑 `vite.config.js` 更改：
- 端口号
- 基础路径
- 构建输出目录
