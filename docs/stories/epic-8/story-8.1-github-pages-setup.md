# Story 8.1: GitHub Pages Setup & Configuration

**Epic:** Epic 8 - Deployment & GitHub Pages Publishing
**Story Points:** 5
**Priority:** High
**Status:** Ready for Implementation
**Estimated Page Count:** 10-12 pages

---

## User Story

**As a** project maintainer
**I want** a GitHub Pages site configured for documentation hosting
**So that** users can access comprehensive documentation at a public URL

---

## Story Description

### Current System

With Epics 3-7 completed:
- ✅ Complete documentation written (200+ pages)
- ✅ Installation guides (Epic 3)
- ✅ Core features reference (Epic 4)
- ✅ Multi-instance documentation (Epic 5)
- ✅ Examples and tutorials (Epic 6)
- ✅ API reference (Epic 7)
- ❌ No documentation hosting
- ❌ No public URL for documentation
- ❌ No search functionality
- ❌ No navigation structure

### Enhancement

Set up GitHub Pages with modern documentation framework:
- **Static Site Generator:** Choose appropriate framework (Jekyll, MkDocs, Docusaurus, VitePress)
- **GitHub Pages Configuration:** Repository settings and deployment
- **Custom Domain:** Optional custom domain setup
- **Theme & Navigation:** Professional theme with search and navigation
- **Asset Management:** Images, diagrams, code highlighting
- **Analytics:** Optional usage tracking

---

## Acceptance Criteria

### AC1: Documentation Framework Selection
**Given** various static site generator options
**When** selecting documentation framework
**Then** it should meet requirements:

#### 1.1 Framework Comparison

| Framework | Language | Pros | Cons | Best For |
|-----------|----------|------|------|----------|
| **MkDocs Material** | Python | Beautiful design, great search, easy setup | Python dependency | Technical docs |
| **Docusaurus** | Node.js | React-based, versioning, i18n | Heavier build | API docs |
| **VitePress** | Node.js | Fast, Vue-based, simple | Newer, less plugins | Modern docs |
| **Jekyll** | Ruby | GitHub native, simple | Limited features | Simple sites |

**Recommendation:** **MkDocs Material**

**Rationale:**
- ✅ Beautiful, professional design out of the box
- ✅ Excellent search functionality
- ✅ Markdown-native (all docs already in Markdown)
- ✅ API documentation support
- ✅ Code highlighting and tabbed content
- ✅ Mobile responsive
- ✅ Fast build times
- ✅ Minimal configuration

#### 1.2 MkDocs Material Setup

**Installation:**

```bash
# Install MkDocs and Material theme
pip install mkdocs-material

# Install plugins
pip install mkdocs-git-revision-date-localized-plugin
pip install mkdocs-minify-plugin
pip install mkdocs-redirects
```

**Configuration File:**

**File:** `mkdocs.yml`

```yaml
# Site Information
site_name: n8n MCP Workflow Builder
site_url: https://your-org.github.io/mcp-n8n-workflow-builder
site_description: AI-powered n8n workflow management via Model Context Protocol
site_author: Your Organization

# Repository
repo_name: your-org/mcp-n8n-workflow-builder
repo_url: https://github.com/your-org/mcp-n8n-workflow-builder
edit_uri: edit/main/docs/

# Copyright
copyright: Copyright &copy; 2025 Your Organization

# Theme Configuration
theme:
  name: material
  language: en

  # Color Scheme
  palette:
    # Light mode
    - media: "(prefers-color-scheme: light)"
      scheme: default
      primary: indigo
      accent: indigo
      toggle:
        icon: material/brightness-7
        name: Switch to dark mode

    # Dark mode
    - media: "(prefers-color-scheme: dark)"
      scheme: slate
      primary: indigo
      accent: indigo
      toggle:
        icon: material/brightness-4
        name: Switch to light mode

  # Features
  features:
    - navigation.tabs
    - navigation.tabs.sticky
    - navigation.sections
    - navigation.expand
    - navigation.path
    - navigation.top
    - navigation.footer
    - search.suggest
    - search.highlight
    - search.share
    - content.code.copy
    - content.code.annotate
    - content.tabs.link

  # Icons
  icon:
    repo: fontawesome/brands/github
    edit: material/pencil
    view: material/eye

  # Logo
  logo: assets/logo.png
  favicon: assets/favicon.png

# Plugins
plugins:
  - search:
      lang: en
      separator: '[\s\-\.]+'

  - git-revision-date-localized:
      enable_creation_date: true
      type: timeago

  - minify:
      minify_html: true
      minify_js: true
      minify_css: true

# Markdown Extensions
markdown_extensions:
  # Python Markdown
  - abbr
  - admonition
  - attr_list
  - def_list
  - footnotes
  - md_in_html
  - tables
  - toc:
      permalink: true
      toc_depth: 3

  # Python Markdown Extensions
  - pymdownx.arithmatex:
      generic: true
  - pymdownx.betterem:
      smart_enable: all
  - pymdownx.caret
  - pymdownx.details
  - pymdownx.emoji:
      emoji_index: !!python/name:material.extensions.emoji.twemoji
      emoji_generator: !!python/name:material.extensions.emoji.to_svg
  - pymdownx.highlight:
      anchor_linenums: true
      line_spans: __span
      pygments_lang_class: true
  - pymdownx.inlinehilite
  - pymdownx.keys
  - pymdownx.mark
  - pymdownx.smartsymbols
  - pymdownx.superfences:
      custom_fences:
        - name: mermaid
          class: mermaid
          format: !!python/name:pymdownx.superfences.fence_code_format
  - pymdownx.tabbed:
      alternate_style: true
  - pymdownx.tasklist:
      custom_checkbox: true
  - pymdownx.tilde

# Extra CSS/JS
extra_css:
  - stylesheets/extra.css

extra_javascript:
  - javascripts/extra.js

# Social Links
extra:
  social:
    - icon: fontawesome/brands/github
      link: https://github.com/your-org/mcp-n8n-workflow-builder
    - icon: fontawesome/brands/npm
      link: https://www.npmjs.com/package/@bmad-labs/mcp-n8n-workflow-builder

  version:
    provider: mike
    default: stable

# Navigation Structure
nav:
  - Home: index.md

  - Getting Started:
    - Installation:
      - NPM Installation: getting-started/installation/npm-installation.md
      - Manual Installation: getting-started/installation/manual-installation.md
      - Configuration Setup: getting-started/installation/configuration.md
    - Quick Start:
      - Claude Desktop Integration: getting-started/quick-start/claude-desktop.md
      - First Workflow: getting-started/quick-start/first-workflow.md
      - Verification & Testing: getting-started/quick-start/verification.md

  - Features & Tools:
    - Workflow Management: features/workflows-management.md
    - Execution Management: features/executions-management.md
    - Tag Management: features/tags-management.md
    - Credential Security: features/credentials-security.md
    - MCP Resources: features/mcp-resources.md
    - Error Handling: features/error-handling.md

  - Multi-Instance:
    - Overview: multi-instance/overview.md
    - Configuration: multi-instance/configuration.md
    - Environment Manager: multi-instance/environment-manager.md
    - Instance Routing: multi-instance/instance-routing.md
    - Testing: multi-instance/testing.md
    - Examples: multi-instance/examples.md

  - Examples & Tutorials:
    - Workflow Examples:
      - Basic Patterns: examples/workflows/basic-patterns.md
      - Integration Examples: examples/workflows/integrations.md
      - Advanced Patterns: examples/workflows/advanced-patterns.md
    - Integrations:
      - Slack: examples/integrations/slack.md
      - Email: examples/integrations/email.md
      - Google Sheets: examples/integrations/google-sheets.md
      - Databases: examples/integrations/databases.md
    - Usage Patterns: examples/claude-desktop-patterns.md
    - Troubleshooting: examples/troubleshooting.md

  - API Reference:
    - Overview: api/overview.md
    - Architecture: api/architecture.md
    - Workflows API: api/workflows-api.md
    - Executions API: api/executions-api.md
    - Credentials API: api/credentials-api.md
    - Tags API: api/tags-api.md
    - Resources & Prompts: api/resources-prompts.md

  - Deployment:
    - Quick Start: deployment/quick-start.md
    - Docker: deployment/docker.md
    - Kubernetes: deployment/kubernetes.md
    - Serverless: deployment/serverless.md

  - About:
    - Changelog: about/changelog.md
    - Contributing: about/contributing.md
    - License: about/license.md
```

---

### AC2: GitHub Pages Configuration
**Given** repository with documentation
**When** configuring GitHub Pages
**Then** it should deploy automatically:

#### 2.1 GitHub Repository Settings

**Settings → Pages:**

```yaml
Source: GitHub Actions
Branch: Not applicable (using Actions)
Custom domain: (optional) docs.yourproject.com
```

#### 2.2 GitHub Actions Workflow

**File:** `.github/workflows/deploy-docs.yml`

```yaml
name: Deploy Documentation

on:
  push:
    branches:
      - main
    paths:
      - 'docs/**'
      - 'mkdocs.yml'
      - '.github/workflows/deploy-docs.yml'

  workflow_dispatch:

permissions:
  contents: write
  pages: write
  id-token: write

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Full history for git-revision-date

      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: |
          pip install mkdocs-material
          pip install mkdocs-git-revision-date-localized-plugin
          pip install mkdocs-minify-plugin
          pip install mkdocs-redirects

      - name: Build documentation
        run: mkdocs build --strict

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./site
          publish_branch: gh-pages
          user_name: 'github-actions[bot]'
          user_email: 'github-actions[bot]@users.noreply.github.com'
          commit_message: 'docs: deploy documentation ${{ github.sha }}'
```

---

### AC3: Custom Domain Setup (Optional)
**Given** a custom domain for documentation
**When** configuring DNS and GitHub Pages
**Then** documentation should be accessible at custom domain:

#### 3.1 DNS Configuration

**Add CNAME Record:**

```
Type: CNAME
Name: docs (or subdomain of choice)
Value: your-org.github.io
TTL: 3600
```

**Verify DNS:**

```bash
dig docs.yourproject.com
# Should show CNAME to your-org.github.io
```

#### 3.2 GitHub Pages Custom Domain

**File:** `docs/CNAME`

```
docs.yourproject.com
```

**GitHub Settings:**
- Pages → Custom domain: `docs.yourproject.com`
- Enforce HTTPS: ✅ Enabled

---

### AC4: Local Development Setup
**Given** documentation contributors
**When** developing documentation locally
**Then** they should have easy development workflow:

#### 4.1 Local Development Guide

**Setup:**

```bash
# Install dependencies
pip install mkdocs-material

# Install plugins
pip install mkdocs-git-revision-date-localized-plugin
pip install mkdocs-minify-plugin

# Serve locally
mkdocs serve

# Access at: http://localhost:8000
```

**Live Reload:**

MkDocs watches for file changes and automatically rebuilds.

**Build for Production:**

```bash
# Build static site
mkdocs build

# Output: ./site/ directory
# Deploy: ./site/ contents to GitHub Pages
```

---

### AC5: Search Configuration
**Given** users searching documentation
**When** using site search
**Then** it should find relevant content:

#### 5.1 Search Configuration

**Built-in Search (MkDocs Material):**

```yaml
plugins:
  - search:
      lang: en
      separator: '[\s\-\.]+'
      prebuild_index: true
```

**Features:**
- Full-text search
- Search suggestions
- Keyboard shortcuts (/)
- Highlight matches
- Deep linking

---

## Technical Implementation Notes

### Directory Structure

```
project-root/
├── docs/                          # Documentation source
│   ├── index.md                   # Homepage
│   ├── getting-started/
│   ├── features/
│   ├── multi-instance/
│   ├── examples/
│   ├── api/
│   ├── deployment/
│   ├── about/
│   ├── assets/
│   │   ├── logo.png
│   │   ├── favicon.png
│   │   └── images/
│   └── stylesheets/
│       └── extra.css
├── mkdocs.yml                     # MkDocs configuration
├── .github/
│   └── workflows/
│       └── deploy-docs.yml        # Deployment workflow
└── site/                          # Generated (gitignored)
```

### Content Migration

**From Story Files to Documentation:**

```bash
# Epic 3 stories → Getting Started
docs/stories/epic-3/story-3.1-npm-installation-guide.md
  → docs/getting-started/installation/npm-installation.md

# Epic 4 stories → Features
docs/stories/epic-4/story-4.1-workflows-management-tools.md
  → docs/features/workflows-management.md

# Epic 5 stories → Multi-Instance
docs/stories/epic-5/story-5.1-multi-instance-configuration-system.md
  → docs/multi-instance/configuration.md

# Epic 6 stories → Examples
docs/stories/epic-6/story-6.1-workflow-creation-examples.md
  → docs/examples/workflows/basic-patterns.md

# Epic 7 stories → API Reference
docs/stories/epic-7/story-7.2-workflows-api-reference.md
  → docs/api/workflows-api.md
```

---

## Dependencies

### Upstream Dependencies
- Epics 3-7 (All documentation content)

### Downstream Dependencies
- Story 8.2 (Documentation Site Structure)
- Story 8.3 (CI/CD Pipeline)

### External Dependencies

```
# requirements.txt
mkdocs-material==9.5.3
mkdocs-git-revision-date-localized-plugin==1.2.2
mkdocs-minify-plugin==0.8.0
mkdocs-redirects==1.2.1
```

---

## Definition of Done

### Implementation Completeness
- [ ] MkDocs Material installed and configured
- [ ] mkdocs.yml configuration file created
- [ ] GitHub Actions workflow configured
- [ ] GitHub Pages enabled in repository settings
- [ ] Documentation builds successfully
- [ ] Site accessible at GitHub Pages URL

### Documentation
- [ ] Local development guide
- [ ] Deployment process documented
- [ ] Custom domain setup guide (optional)
- [ ] Contribution guidelines for docs

### Validation
- [ ] Documentation builds without errors
- [ ] All links work correctly
- [ ] Search functionality works
- [ ] Mobile responsive
- [ ] Fast load times (<2 seconds)

---

## Estimation Breakdown

**Story Points:** 5

**Effort Distribution:**
- Framework selection & setup: 1 SP
- mkdocs.yml configuration: 1.5 SP
- GitHub Actions workflow: 1 SP
- GitHub Pages configuration: 0.5 SP
- Testing & validation: 1 SP

**Page Count:** 10-12 pages

**Estimated Duration:** 2-3 days (1 developer)

---

## Notes

### Success Metrics
- Documentation site loads in <2 seconds
- Search returns results in <500ms
- 100% of markdown files build successfully
- Mobile responsive score >95/100

### Common Mistakes to Avoid
- ❌ Not testing build locally before pushing
- ❌ Missing dependencies in requirements.txt
- ❌ Broken internal links
- ❌ Missing navigation entries
- ❌ Images not in assets folder

### Best Practices
- ✅ Test locally with `mkdocs serve`
- ✅ Use `mkdocs build --strict` to catch errors
- ✅ Validate all links before deployment
- ✅ Optimize images for web
- ✅ Use consistent heading structure

---

**Status:** Ready for Implementation
**Related Files:**
- `mkdocs.yml`
- `.github/workflows/deploy-docs.yml`
- `docs/CNAME` (if custom domain)
- `requirements.txt`
