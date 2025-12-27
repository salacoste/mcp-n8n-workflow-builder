# Documentation Source

This directory contains the source files for the n8n MCP Workflow Builder documentation site, built with [MkDocs Material](https://squidfunk.github.io/mkdocs-material/).

## 📁 Directory Structure

```
docs/
├── index.md                          # Homepage
├── getting-started/                  # Installation & Quick Start
│   ├── installation/
│   │   ├── npm-installation.md      # NPM installation guide
│   │   ├── manual-installation.md   # Build from source
│   │   └── configuration.md         # Configuration setup
│   └── quick-start/
│       ├── claude-desktop.md        # Claude Desktop integration
│       ├── first-workflow.md        # First workflow tutorial
│       └── verification.md          # Testing & verification
├── features/                         # Feature documentation (TBD)
├── multi-instance/                   # Multi-instance guides (TBD)
├── examples/                         # Examples & tutorials (TBD)
├── api/                             # API reference (TBD)
├── about/                           # About pages (TBD)
└── assets/                          # Static assets
    ├── stylesheets/
    │   └── extra.css                # Custom styles
    ├── javascripts/
    │   └── extra.js                 # Custom JavaScript
    └── images/
        └── README.md                # Image guidelines
```

## 🚀 Local Development

### Prerequisites

Install Python dependencies:

```bash
pip install -r requirements.txt
```

**Required packages:**
- `mkdocs` - Static site generator
- `mkdocs-material` - Material theme
- `mkdocs-git-revision-date-localized-plugin` - Last modified dates
- `mkdocs-minify-plugin` - HTML/CSS/JS minification

### Run Development Server

Start the local development server with live reload:

```bash
# Option 1: Using npm script
npm run docs:dev

# Option 2: Using mkdocs directly
mkdocs serve
```

**Access the site:**
- **URL:** http://localhost:8000
- **Live reload:** Enabled (auto-refreshes on file changes)
- **Search:** Available immediately

### Build Documentation

Build static site for production:

```bash
# Option 1: Using npm script
npm run docs:build

# Option 2: Using mkdocs directly
mkdocs build --strict
```

**Output:** `site/` directory (gitignored)

**Strict mode:**
- Fails on warnings
- Catches broken links
- Validates markdown syntax

### Deploy to GitHub Pages

**Automatic Deployment (Recommended):**

Documentation automatically deploys on push to `main` branch via GitHub Actions:

```yaml
# .github/workflows/deploy-docs.yml
on:
  push:
    branches: [main]
    paths: ['docs/**', 'mkdocs.yml']
```

**Manual Deployment:**

```bash
# Option 1: Using npm script
npm run docs:deploy

# Option 2: Using mkdocs directly
mkdocs gh-deploy --force
```

This will:
1. Build the documentation
2. Push to `gh-pages` branch
3. Update GitHub Pages site

**Live Site:** https://salacoste.github.io/mcp-n8n-workflow-builder

## ✍️ Writing Documentation

### Markdown Guidelines

**Frontmatter (Optional):**
```markdown
---
title: Page Title
description: Page description for SEO
---
```

**Headings:**
```markdown
# H1 - Page Title (one per page)
## H2 - Section
### H3 - Subsection
```

**Code Blocks:**
````markdown
```bash
npm install
```

```json
{
  "key": "value"
}
```
````

**Admonitions:**
```markdown
!!! note "Custom Title"
    This is a note admonition.

!!! tip
    This is a tip.

!!! warning
    This is a warning.

!!! danger "Important!"
    This is a danger warning.
```

**Tabs:**
```markdown
=== "Tab 1"

    Content for tab 1

=== "Tab 2"

    Content for tab 2
```

**Tables:**
```markdown
| Column 1 | Column 2 |
|----------|----------|
| Value 1  | Value 2  |
```

**Links:**
```markdown
[Link Text](../path/to/file.md)
[External Link](https://example.com)
```

**Images:**
```markdown
![Alt Text](../assets/images/image.png)
```

### Content Organization

**File Naming:**
- Use lowercase
- Use hyphens for spaces: `my-page-name.md`
- Be descriptive: `npm-installation.md` not `install.md`

**Page Structure:**
1. **Title** - H1 heading
2. **Introduction** - Brief overview
3. **Prerequisites** (if applicable)
4. **Main Content** - Organized with H2/H3 headings
5. **Next Steps** - Links to related pages
6. **Additional Resources** (if applicable)

**Cross-Linking:**
- Link to related documentation
- Use relative paths: `../path/to/file.md`
- Add "Next Steps" section at page end

## 🎨 Styling

### Custom CSS

Edit `docs/assets/stylesheets/extra.css` for custom styles.

**Current customizations:**
- Primary color override (indigo)
- Grid cards layout
- Custom admonition colors
- Table styling
- Button enhancements

### Custom JavaScript

Edit `docs/assets/javascripts/extra.js` for custom functionality.

**Current features:**
- Copy button feedback
- Smooth scroll for anchors
- External link indicators
- Keyboard shortcuts

## 🔍 Search

MkDocs Material includes built-in search:

**Features:**
- Full-text search
- Search suggestions
- Keyboard shortcut: `/` to focus search
- Highlighting of search terms

**Configuration:**
```yaml
# mkdocs.yml
plugins:
  - search:
      lang: en
      separator: '[\s\-\.]+'
```

## 📝 Navigation

Navigation is defined in `mkdocs.yml`:

```yaml
nav:
  - Home: index.md
  - Getting Started:
    - Installation:
      - npm-installation.md
      - manual-installation.md
```

**Best Practices:**
- 3-4 levels maximum
- Group related pages
- Use descriptive titles
- Order logically (basics → advanced)

## 🧪 Testing

### Local Testing Checklist

Before committing:

- [ ] Run `mkdocs build --strict` (no warnings/errors)
- [ ] All internal links work
- [ ] Code examples are tested
- [ ] Images display correctly
- [ ] Mobile responsive (test with browser dev tools)
- [ ] Search finds relevant content

### Validate Links

```bash
# Build in strict mode
mkdocs build --strict --verbose

# Check for broken links
grep -r "](.*\.md)" docs/ | grep -v "README"
```

## 🚢 Deployment

### GitHub Actions Workflow

Automatic deployment configured in `.github/workflows/deploy-docs.yml`:

**Triggers:**
- Push to `main` branch
- Changes in `docs/**` or `mkdocs.yml`
- Manual workflow dispatch

**Steps:**
1. Checkout code
2. Setup Python 3.11
3. Install dependencies
4. Build documentation (strict mode)
5. Deploy to GitHub Pages

### Manual Deployment

If needed, deploy manually:

```bash
# 1. Build locally
mkdocs build --strict

# 2. Deploy to gh-pages branch
mkdocs gh-deploy --force

# 3. Verify at:
# https://salacoste.github.io/mcp-n8n-workflow-builder
```

## 📊 Analytics (Optional)

To add Google Analytics:

```yaml
# mkdocs.yml
extra:
  analytics:
    provider: google
    property: G-XXXXXXXXXX
```

## 🐛 Troubleshooting

### Build Errors

**Error: "Config file 'mkdocs.yml' does not exist"**
- Run commands from project root
- Verify `mkdocs.yml` exists

**Error: "Documentation file 'X' does not exist"**
- Check file path in `mkdocs.yml`
- Verify file exists in `docs/` directory

**Error: "Invalid YAML"**
- Validate `mkdocs.yml` syntax
- Check indentation (use spaces, not tabs)

### Deployment Issues

**GitHub Pages not updating:**
1. Check GitHub Actions workflow status
2. Verify `gh-pages` branch exists
3. Check GitHub Pages settings (Settings → Pages)
4. Clear browser cache

**404 errors:**
- Verify file paths in navigation
- Check case sensitivity (Linux is case-sensitive)
- Rebuild and redeploy

## 📚 Resources

**MkDocs:**
- [MkDocs Documentation](https://www.mkdocs.org/)
- [MkDocs Material](https://squidfunk.github.io/mkdocs-material/)
- [MkDocs Material Reference](https://squidfunk.github.io/mkdocs-material/reference/)

**Markdown:**
- [CommonMark Spec](https://commonmark.org/)
- [GitHub Flavored Markdown](https://github.github.com/gfm/)
- [Python-Markdown Extensions](https://python-markdown.github.io/extensions/)

**Tools:**
- [Mermaid Diagrams](https://mermaid-js.github.io/)
- [Material Icons](https://fonts.google.com/icons?icon.set=Material+Icons)

## 🤝 Contributing

See [CONTRIBUTING.md](../about/contributing.md) for documentation contribution guidelines.

---

**Questions?** Open an [issue](https://github.com/salacoste/mcp-n8n-workflow-builder/issues) on GitHub.
