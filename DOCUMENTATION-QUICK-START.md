# Documentation Quick Start

Quick guide to working with the GitHub Pages documentation.

---

## 🚀 Local Development

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

**What gets installed:**
- `mkdocs` - Documentation site generator
- `mkdocs-material` - Material Design theme
- Plugins for search, dates, and minification

### 2. Start Development Server

```bash
npm run docs:dev
```

**Access at:** http://localhost:8000

**Features:**
- ✅ Live reload on file changes
- ✅ Full search functionality
- ✅ Preview exactly as it will appear online

### 3. Edit Documentation

**Location:** `docs/` directory

**Example:**
```bash
# Edit homepage
nano docs/index.md

# Edit installation guide
nano docs/getting-started/installation/npm-installation.md
```

**Save → Changes appear instantly in browser!**

---

## 🔨 Build & Test

### Build Documentation

```bash
npm run docs:build
```

**Output:** `site/` directory (ready for deployment)

**Validation:**
- ✅ Strict mode enabled (catches errors)
- ✅ Broken links detected
- ✅ Markdown syntax validated

### Test Locally

```bash
# After building
cd site
python3 -m http.server 8001
```

**Access at:** http://localhost:8001

---

## 🌐 Deployment

### Automatic Deployment (Recommended)

**Just push to main:**

```bash
git add docs/ mkdocs.yml
git commit -m "docs: update documentation"
git push origin main
```

**GitHub Actions will:**
1. Build documentation
2. Deploy to GitHub Pages
3. Site live in ~2 minutes

**Live URL:** https://salacoste.github.io/mcp-n8n-workflow-builder

### Manual Deployment

```bash
npm run docs:deploy
```

**This will:**
- Build documentation
- Push to `gh-pages` branch
- Update GitHub Pages site

---

## 📝 Writing Tips

### Markdown Syntax

**Code blocks:**
````markdown
```bash
npm install
```
````

**Admonitions:**
```markdown
!!! tip "Helpful Hint"
    This is a tip.

!!! warning
    Be careful!
```

**Tabs:**
```markdown
=== "macOS"

    macOS-specific content

=== "Linux"

    Linux-specific content
```

**Links:**
```markdown
[Link Text](../path/to/file.md)
```

### Best Practices

- ✅ Use relative links: `../installation/npm-installation.md`
- ✅ Add "Next Steps" at page end
- ✅ Include code examples with comments
- ✅ Test all commands before documenting
- ✅ Use admonitions for important notes

---

## 🐛 Troubleshooting

### Build Fails

**Error:** "Config file not found"

```bash
# Make sure you're in project root
pwd  # Should show: /path/to/mcp-n8n-workflow-builder

# Run from correct location
npm run docs:build
```

**Error:** "Documentation file does not exist"

- Check file path in `mkdocs.yml`
- Verify file exists in `docs/` directory
- Check for typos in filenames

### Deployment Issues

**GitHub Pages not updating:**

1. Check GitHub Actions workflow
2. Verify `gh-pages` branch exists
3. Enable GitHub Pages in Settings → Pages
4. Clear browser cache

---

## 📁 Project Structure

```
mcp-n8n-workflow-builder/
├── mkdocs.yml              # Configuration
├── requirements.txt        # Python dependencies
├── docs/
│   ├── index.md           # Homepage
│   ├── getting-started/   # Installation & setup
│   ├── features/          # Feature documentation (TBD)
│   ├── examples/          # Examples (TBD)
│   ├── api/               # API reference (TBD)
│   └── assets/            # Images, CSS, JS
└── .github/
    └── workflows/
        └── deploy-docs.yml # Auto-deployment
```

---

## 🎯 Quick Commands

```bash
# Development
npm run docs:dev          # Start dev server

# Build & Deploy
npm run docs:build        # Build only
npm run docs:deploy       # Build + deploy

# Testing
mkdocs build --strict     # Validate
python3 -m http.server    # Test locally
```

---

## 📚 Resources

- **MkDocs:** https://www.mkdocs.org/
- **Material Theme:** https://squidfunk.github.io/mkdocs-material/
- **Markdown Guide:** https://www.markdownguide.org/

---

## ✅ Current Status

**Completed:**
- ✅ Homepage (`index.md`)
- ✅ Installation guides (NPM, Manual, Configuration)
- ✅ Quick Start (Claude Desktop, First Workflow, Verification)
- ✅ CI/CD pipeline (GitHub Actions)
- ✅ Custom styling and JavaScript

**Total:** 7 pages, 20,800+ words

**Pending:**
- ⏳ Features documentation (Epic 4)
- ⏳ Multi-instance guides (Epic 5)
- ⏳ Examples & tutorials (Epic 6)
- ⏳ API reference (Epic 7)

---

**Questions?** See `docs/README.md` for detailed documentation guide.
