# L-feed Update

A markdown-powered changelog/update site generator. Create beautiful update pages by simply writing markdown files.

## Features

- **Markdown powered**: Write updates in markdown with frontmatter
- **SEO ready**: Each update has canonical URLs, metadata, and clean HTML
- **Shareable**: Built-in share buttons for copying links and posting to social media
- **Low maintenance**: No database—just markdown files and an automated build step
- **Hot reload**: Updates regenerate automatically when you edit markdown files

## Quick Start

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The site will be available at `http://localhost:5173/updates/`

### Creating a new update

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

### Build for production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

## Project Structure

```
l-feed-update/
├── scripts/
│   └── generate-updates.mjs    # Build script that generates static pages
├── updates/
│   ├── index.html              # Update list page
│   ├── list.js                 # List page logic
│   ├── detail-template.html    # Detail page template
│   ├── detail.js               # Detail page logic
│   ├── updates.css             # Styles
│   └── *.md                    # Your markdown updates
├── public/                     # Static assets
├── vite.config.js              # Vite configuration
└── package.json
```

## How it works

1. The `generate-updates.mjs` script reads all markdown files from `updates/`
2. It parses frontmatter (title, date, summary) and markdown content
3. It generates:
   - `public/updates/index.json` - List of all updates
   - `public/updates/*.md` - Copies of markdown files
   - `updates/{slug}/index.html` - Individual detail pages
4. Vite serves the static files and watches for changes

## Customization

### Styling

Edit `updates/updates.css` to customize the appearance.

### Templates

Edit `updates/index.html` for the list page layout.
Edit `updates/detail-template.html` for the detail page layout.

### Build configuration

Edit `vite.config.js` to change:
- Port number
- Base path
- Build output directory
