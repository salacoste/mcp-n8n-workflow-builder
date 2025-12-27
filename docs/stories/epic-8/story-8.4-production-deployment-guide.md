# Story 8.4: Production Deployment Guide

**Epic:** Epic 8 - Deployment & GitHub Pages Publishing
**Story Points:** 5
**Priority:** Medium
**Status:** Ready for Implementation
**Estimated Page Count:** 10-12 pages

---

## User Story

**As a** project maintainer
**I want** comprehensive production deployment guide
**So that** documentation is deployed securely and performantly to production

---

## Story Description

### Current System

With Stories 8.1-8.3 completed:
- ✅ MkDocs Material configured
- ✅ Documentation content organized
- ✅ CI/CD pipeline implemented
- ❌ No production deployment checklist
- ❌ No custom domain setup guide
- ❌ No performance optimization guide
- ❌ No monitoring setup

### Enhancement

Create comprehensive production deployment documentation:
- **Pre-Deployment Checklist:** Validation steps before going live
- **Custom Domain Setup:** DNS configuration and SSL/HTTPS
- **Performance Optimization:** CDN, caching, compression strategies
- **Monitoring & Analytics:** Usage tracking and error monitoring
- **Maintenance Procedures:** Updates, backups, disaster recovery
- **Troubleshooting Guide:** Common deployment issues and solutions

---

## Acceptance Criteria

### AC1: Pre-Deployment Checklist
**Given** documentation ready for production
**When** preparing to deploy
**Then** all validation steps should be completed:

#### 1.1 Pre-Deployment Validation


```markdown
# Production Deployment Guide

Complete guide to deploying n8n MCP Workflow Builder documentation to production.

---

## Pre-Deployment Checklist

### 1. Content Validation

- [ ] All documentation pages complete
- [ ] Code examples tested and working
- [ ] Screenshots current and accurate
- [ ] Links verified (internal and external)
- [ ] No placeholder content (Lorem ipsum, TODO markers)
- [ ] Spelling and grammar checked
- [ ] Technical accuracy reviewed

**Validation Command:**
```bash
mkdocs build --strict
```

### 2. Build Quality

- [ ] Build completes without errors
- [ ] Build completes without warnings
- [ ] All pages render correctly
- [ ] Search index generated successfully
- [ ] Navigation structure correct

**Quality Check:**
```bash
# Build in strict mode
mkdocs build --strict --verbose

# Check for warnings
mkdocs build --strict 2>&1 | grep -i "warning"

# Verify output
ls -lh site/
find site -name "*.html" | wc -l
```

### 3. Performance Validation

- [ ] Total site size <20MB
- [ ] Individual page size <500KB
- [ ] Images optimized (<200KB each)
- [ ] CSS/JS minified
- [ ] No large embedded assets

**Performance Check:**
```bash
# Check total size
du -sh site/

# Check largest files
find site -type f -exec du -h {} + | sort -rh | head -20

# Verify minification
ls -lh site/assets/stylesheets/
ls -lh site/assets/javascripts/
```

### 4. Accessibility Validation

- [ ] WCAG 2.1 AA compliance
- [ ] Alt text on all images
- [ ] Proper heading hierarchy
- [ ] Keyboard navigation working
- [ ] Screen reader compatible

**Accessibility Check:**
```bash
# Install pa11y
npm install -g pa11y-ci

# Run accessibility tests
mkdocs serve &
sleep 5
pa11y-ci http://localhost:8000
```

### 5. SEO Validation

- [ ] Page titles descriptive and unique
- [ ] Meta descriptions on all pages
- [ ] Keywords defined
- [ ] sitemap.xml generated
- [ ] robots.txt configured

**SEO Check:**
```bash
# Verify sitemap
cat site/sitemap.xml

# Check meta tags
grep -r "<meta name=" site/
```

### 6. Security Validation

- [ ] No sensitive information in docs
- [ ] No hardcoded credentials
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] No vulnerable dependencies

**Security Check:**
```bash
# Search for potential secrets
grep -r "api_key\|password\|secret" docs/

# Check Python dependencies
pip list --outdated
pip-audit  # Install with: pip install pip-audit
```

---

## GitHub Pages Configuration

### Step 1: Enable GitHub Pages

1. Navigate to repository **Settings → Pages**
2. Configure source:
   - **Source:** GitHub Actions
   - **Branch:** Not applicable (using Actions)
3. Click **Save**

### Step 2: Verify Workflow Permissions

1. Navigate to **Settings → Actions → General**
2. Under "Workflow permissions":
   - ✅ **Read and write permissions**
   - ✅ **Allow GitHub Actions to create and approve pull requests**
3. Click **Save**

### Step 3: Trigger Deployment

```bash
# Commit and push to main
git add .
git commit -m "docs: initial production deployment"
git push origin main

# Monitor deployment
gh run watch
```

### Step 4: Verify Deployment

**Expected URL:**
```
https://your-org.github.io/mcp-n8n-workflow-builder/
```

**Verification:**
```bash
# Check deployment status
gh run list --workflow=deploy-docs.yml

# Test homepage
curl -I https://your-org.github.io/mcp-n8n-workflow-builder/

# Verify critical pages
for page in "" "getting-started/" "api/overview/" "examples/"; do
  curl -I "https://your-org.github.io/mcp-n8n-workflow-builder/${page}"
done
```

---

## Next Steps

The deployment guide has been successfully created. For additional customization and optimization, refer to:
- GitHub Pages custom domain documentation
- MkDocs Material performance optimization guide
- GitHub Pages monitoring and analytics tools

---

### AC2: Custom Domain Setup & SSL
**Given** custom domain for documentation
**When** configuring DNS and GitHub Pages
**Then** HTTPS should be enabled and working:

#### 2.1 Custom Domain Configuration


```markdown
# Custom Domain Setup

Configure custom domain for your documentation site.

---

## DNS Configuration

### Option 1: Subdomain (Recommended)

**Example:** `docs.yourproject.com`

**DNS Records:**

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | docs | your-org.github.io | 3600 |

**Configuration Steps:**

1. **Add CNAME Record:**
   ```
   Type: CNAME
   Name: docs
   Value: your-org.github.io
   TTL: 3600 (or Auto)
   ```

2. **Verify DNS Propagation:**
   ```bash
   # Check DNS resolution
   dig docs.yourproject.com

   # Expected output:
   # docs.yourproject.com. 3600 IN CNAME your-org.github.io.
   ```

3. **Add CNAME File:**

   **File:** `docs/CNAME`
   ```
   docs.yourproject.com
   ```

4. **Update mkdocs.yml:**
   ```yaml
   site_url: https://docs.yourproject.com
   ```

5. **Configure GitHub Pages:**
   - Go to **Settings → Pages**
   - Under "Custom domain", enter: `docs.yourproject.com`
   - Click **Save**
   - ✅ **Enforce HTTPS** (wait for SSL certificate provisioning)

### Option 2: Apex Domain

**Example:** `yourproject.com`

**DNS Records:**

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | 185.199.108.153 | 3600 |
| A | @ | 185.199.109.153 | 3600 |
| A | @ | 185.199.110.153 | 3600 |
| A | @ | 185.199.111.153 | 3600 |
| AAAA | @ | 2606:50c0:8000::153 | 3600 |
| AAAA | @ | 2606:50c0:8001::153 | 3600 |
| AAAA | @ | 2606:50c0:8002::153 | 3600 |
| AAAA | @ | 2606:50c0:8003::153 | 3600 |

**Note:** Apex domains are less flexible. Consider using subdomain instead.

---

## SSL Certificate Provisioning

GitHub Pages automatically provisions Let's Encrypt SSL certificates.

**Timeline:**
- DNS propagation: 5 minutes - 48 hours
- SSL certificate provisioning: 15 minutes - 24 hours

**Verification:**
```bash
# Check SSL certificate
openssl s_client -connect docs.yourproject.com:443 -servername docs.yourproject.com

# Verify HTTPS redirect
curl -I http://docs.yourproject.com
# Should return: HTTP/1.1 301 Moved Permanently
# Location: https://docs.yourproject.com/
```

---

## Troubleshooting

### DNS Not Resolving

**Symptoms:** Domain doesn't resolve to GitHub Pages

**Solutions:**
1. Verify DNS records are correct
2. Check DNS propagation: `dig docs.yourproject.com`
3. Wait up to 48 hours for global propagation
4. Clear local DNS cache: `sudo dscacheutil -flushcache` (macOS)

### SSL Certificate Not Provisioning

**Symptoms:** "Not secure" warning in browser

**Solutions:**
1. Ensure DNS is fully propagated
2. Verify CNAME file contains correct domain
3. Disable and re-enable "Enforce HTTPS" in GitHub settings
4. Wait 24 hours for automatic provisioning
5. Check GitHub status: https://www.githubstatus.com/

### CNAME Conflicts

**Symptoms:** Custom domain doesn't work after deployment

**Solutions:**
1. Ensure `docs/CNAME` file is committed to repository
2. Verify GitHub Actions workflow doesn't overwrite CNAME
3. Check deployment logs for CNAME-related errors

---

## Best Practices

### Security

- ✅ Always enforce HTTPS
- ✅ Use HSTS header (GitHub Pages default)
- ✅ Monitor SSL certificate expiration (auto-renewed by GitHub)
- ✅ Use CAA DNS records to restrict certificate authorities

**CAA Record:**
```
Type: CAA
Name: @
Value: 0 issue "letsencrypt.org"
```

### Performance

- ✅ Use subdomain for better CDN performance
- ✅ Enable HTTP/2 (GitHub Pages default)
- ✅ Configure DNS TTL appropriately (3600s recommended)
- ✅ Use DNS provider with global anycast network

### Monitoring

- ✅ Monitor DNS resolution
- ✅ Track SSL certificate expiration
- ✅ Set up uptime monitoring
- ✅ Alert on certificate issues
```

---

### AC3: Performance Optimization
**Given** production documentation site
**When** optimizing for performance
**Then** load times should be <2 seconds:

#### 3.1 Performance Optimization Guide


```markdown
# Performance Optimization

Optimize documentation site for fast load times and great user experience.

---

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Time to First Byte (TTFB) | <500ms | Check with PageSpeed |
| First Contentful Paint (FCP) | <1.5s | Check with PageSpeed |
| Largest Contentful Paint (LCP) | <2.5s | Check with PageSpeed |
| Total Blocking Time (TBT) | <200ms | Check with PageSpeed |
| Cumulative Layout Shift (CLS) | <0.1 | Check with PageSpeed |
| Total Page Size | <2MB | Check with DevTools |

---

## Build Optimization

### 1. Enable Minification

**mkdocs.yml:**
```yaml
plugins:
  - minify:
      minify_html: true
      minify_js: true
      minify_css: true
      htmlmin_opts:
        remove_comments: true
        remove_empty_space: true
      js_files:
        - assets/javascripts/extra.js
      css_files:
        - assets/stylesheets/extra.css
```

### 2. Optimize Images

**Image Guidelines:**
- **Format:** WebP (primary), PNG/JPEG (fallback)
- **Max Resolution:** 1280x720 for screenshots
- **File Size:** <200KB per image
- **Lazy Loading:** Enabled by default in Material

**Optimization Script:**
```bash
#!/bin/bash
# optimize-images.sh

for img in docs/assets/images/**/*.{png,jpg,jpeg}; do
  # Convert to WebP
  cwebp -q 80 "$img" -o "${img%.*}.webp"

  # Optimize original
  if [[ "$img" == *.png ]]; then
    pngquant --quality=80-90 --force --ext .png "$img"
  else
    jpegoptim --max=85 "$img"
  fi
done
```

### 3. Code Splitting

Material theme automatically splits JavaScript bundles.

**Verify:**
```bash
# Check bundle sizes
ls -lh site/assets/javascripts/
```

---

## Content Delivery

### 1. GitHub Pages CDN

GitHub Pages uses Fastly CDN automatically.

**Benefits:**
- Global edge network
- HTTP/2 support
- Automatic compression (gzip, brotli)
- DDoS protection

**No configuration required** - enabled by default.

### 2. Cache Headers

GitHub Pages sets optimal cache headers:
- **HTML:** `Cache-Control: max-age=600` (10 minutes)
- **Assets:** `Cache-Control: max-age=3600` (1 hour)
- **Immutable Assets:** Long cache with versioned URLs

**Verify Cache Headers:**
```bash
curl -I https://docs.yourproject.com/assets/javascripts/bundle.js
```

---

## Search Optimization

### 1. Prebuilt Index

**mkdocs.yml:**
```yaml
plugins:
  - search:
      prebuild_index: true
      lang: en
```

**Benefits:**
- Faster initial search
- Reduced client-side processing
- Better performance on mobile

### 2. Search Index Size

**Monitor:**
```bash
# Check search index size
ls -lh site/search/search_index.json

# Should be <500KB
```

**Optimization:**
- Exclude large code blocks from indexing
- Use `<!-- search: exclude -->` comments
- Limit indexed content depth

---

## Monitoring

### 1. Google PageSpeed Insights

**Test your site:**
```
https://pagespeed.web.dev/
```

**Targets:**
- **Performance:** >90/100
- **Accessibility:** >95/100
- **Best Practices:** >90/100
- **SEO:** >90/100

### 2. WebPageTest

**Advanced Performance Testing:**
```
https://www.webpagetest.org/
```

**Test Configurations:**
- Location: Multiple global locations
- Connection: 3G, 4G, Cable
- Browser: Chrome, Firefox, Safari

### 3. Lighthouse CI

**Automated Performance Testing:**

**File:** `.github/workflows/lighthouse.yml`

```yaml
name: Lighthouse CI

on:
  pull_request:
    paths:
      - 'docs/**'
      - 'mkdocs.yml'

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build site
        run: |
          pip install mkdocs-material
          mkdocs build

      - name: Run Lighthouse
        uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            http://localhost:8000/
            http://localhost:8000/getting-started/
            http://localhost:8000/api/overview/
          uploadArtifacts: true
          temporaryPublicStorage: true
```

---

## Best Practices

### Content Optimization

- ✅ Use WebP images with PNG/JPEG fallbacks
- ✅ Lazy load images below the fold
- ✅ Inline critical CSS for above-the-fold content
- ✅ Defer non-critical JavaScript
- ✅ Minimize custom fonts (Material uses system fonts)

### Code Optimization

- ✅ Minify HTML, CSS, JavaScript
- ✅ Remove unused CSS (PurgeCSS)
- ✅ Tree-shake JavaScript dependencies
- ✅ Use modern JavaScript (ES6+)
- ✅ Enable source maps for debugging (production)

### Asset Strategy

- ✅ Version assets for cache busting
- ✅ Use long cache headers for immutable assets
- ✅ Compress text assets (gzip/brotli)
- ✅ Serve static assets from CDN
- ✅ Implement resource hints (preconnect, prefetch)
```

---

### AC4: Monitoring & Analytics
**Given** production documentation site
**When** users access documentation
**Then** usage should be tracked and monitored:

#### 4.1 Monitoring Setup


```markdown
# Monitoring & Analytics

Track documentation usage, performance, and errors.

---

## Analytics Options

### Option 1: Google Analytics 4

**Setup:**

1. **Create GA4 Property:**
   - Visit [Google Analytics](https://analytics.google.com/)
   - Create new GA4 property
   - Get Measurement ID (format: `G-XXXXXXXXXX`)

2. **Configure MkDocs:**

   **mkdocs.yml:**
   ```yaml
   extra:
     analytics:
       provider: google
       property: G-XXXXXXXXXX
   ```

3. **Privacy Considerations:**
   - Anonymize IP addresses (default in GA4)
   - Add privacy policy page
   - Cookie consent (optional, based on jurisdiction)

**Metrics to Track:**
- Page views and sessions
- User demographics and locations
- Search queries
- Popular pages
- User flow and navigation

### Option 2: Plausible Analytics (Privacy-Friendly)

**Setup:**

1. **Create Plausible Account:**
   - Visit [Plausible.io](https://plausible.io/)
   - Add your domain

2. **Configure MkDocs:**

   **docs/assets/javascripts/extra.js:**
   ```javascript
   // Add Plausible script
   var script = document.createElement('script');
   script.defer = true;
   script.src = 'https://plausible.io/js/script.js';
   script.setAttribute('data-domain', 'docs.yourproject.com');
   document.head.appendChild(script);
   ```

**Benefits:**
- GDPR compliant
- No cookie banner required
- Lightweight (<1KB)
- Privacy-focused

---

## Uptime Monitoring

### UptimeRobot

**Setup:**

1. **Create Free Account:** https://uptimerobot.com/
2. **Add HTTP(S) Monitor:**
   - Monitor Type: HTTP(s)
   - Friendly Name: "Documentation Site"
   - URL: https://docs.yourproject.com
   - Monitoring Interval: 5 minutes

3. **Configure Alerts:**
   - Email notifications
   - Slack/Discord webhooks
   - SMS alerts (paid plans)

**Monitoring Checks:**
- Homepage accessibility
- Critical page availability
- SSL certificate validity
- Response time tracking

### GitHub Actions Health Check

**File:** `.github/workflows/health-check.yml`

```yaml
name: Documentation Health Check

on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:

jobs:
  health-check:
    runs-on: ubuntu-latest
    steps:
      - name: Check homepage
        run: |
          HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://docs.yourproject.com)
          if [ "$HTTP_CODE" != "200" ]; then
            echo "❌ Homepage returned HTTP $HTTP_CODE"
            exit 1
          fi

      - name: Check critical pages
        run: |
          PAGES=(
            "getting-started/"
            "api/overview/"
            "examples/"
            "multi-instance/overview/"
          )

          for page in "${PAGES[@]}"; do
            HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://docs.yourproject.com/$page")
            if [ "$HTTP_CODE" != "200" ]; then
              echo "❌ Page $page returned HTTP $HTTP_CODE"
              exit 1
            fi
          done

      - name: Check SSL certificate
        run: |
          echo | openssl s_client -servername docs.yourproject.com \
            -connect docs.yourproject.com:443 2>/dev/null | \
            openssl x509 -noout -dates

      - name: Notify on failure
        if: failure()
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: `Documentation Health Check Failed: ${new Date().toISOString()}`,
              body: 'Documentation site health check failed. Please investigate immediately.',
              labels: ['documentation', 'incident', 'urgent']
            });
```

---

## Error Tracking

### Sentry (Optional)

**Setup for JavaScript Errors:**

1. **Create Sentry Project:** https://sentry.io/
2. **Add Sentry SDK:**

   **docs/assets/javascripts/extra.js:**
   ```javascript
   // Sentry initialization
   Sentry.init({
     dsn: "https://your-sentry-dsn@sentry.io/project-id",
     environment: "production",
     tracesSampleRate: 0.1,
     beforeSend(event) {
       // Filter out non-critical errors
       if (event.level === 'info' || event.level === 'log') {
         return null;
       }
       return event;
     }
   });
   ```

---

## Performance Monitoring

### Real User Monitoring (RUM)

**Web Vitals Tracking:**

**docs/assets/javascripts/extra.js:**
```javascript
// Track Core Web Vitals
import {getCLS, getFID, getFCP, getLCP, getTTFB} from 'web-vitals';

function sendToAnalytics(metric) {
  // Send to Google Analytics
  if (window.gtag) {
    gtag('event', metric.name, {
      value: Math.round(metric.value),
      event_category: 'Web Vitals',
      event_label: metric.id,
      non_interaction: true,
    });
  }
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

---

## Maintenance Procedures

### Regular Checks

**Weekly:**
- [ ] Review analytics dashboard
- [ ] Check uptime monitoring logs
- [ ] Verify SSL certificate status
- [ ] Review search analytics for content gaps

**Monthly:**
- [ ] Run performance audits (PageSpeed, Lighthouse)
- [ ] Review and update outdated content
- [ ] Check for broken links
- [ ] Analyze popular search queries
- [ ] Review error logs (if using Sentry)

**Quarterly:**
- [ ] Comprehensive content audit
- [ ] Update dependencies (MkDocs, plugins)
- [ ] Review and optimize performance
- [ ] Analyze user feedback and metrics
- [ ] Plan content improvements

### Backup Procedures

**GitHub Repository:**
- Primary backup: Git version control
- Secondary backup: GitHub repository clone
- Disaster recovery: Fork to backup organization

**Automated Backup:**
```bash
#!/bin/bash
# backup-docs.sh

BACKUP_DIR="backups/$(date +%Y-%m-%d)"
mkdir -p "$BACKUP_DIR"

# Clone repository
git clone https://github.com/your-org/mcp-n8n-workflow-builder.git "$BACKUP_DIR"

# Archive
tar -czf "${BACKUP_DIR}.tar.gz" "$BACKUP_DIR"

# Upload to cloud storage (S3, Google Drive, etc.)
# aws s3 cp "${BACKUP_DIR}.tar.gz" s3://your-backup-bucket/
```
```

---

## Dependencies

### Upstream Dependencies
- Story 8.1 (GitHub Pages Setup)
- Story 8.2 (Site Structure)
- Story 8.3 (CI/CD Pipeline)

### External Dependencies
- DNS provider account
- Analytics provider account (optional)
- Monitoring service account (optional)

---

## Definition of Done

### Documentation
- [ ] Pre-deployment checklist complete
- [ ] Custom domain setup guide
- [ ] Performance optimization guide
- [ ] Monitoring setup documentation
- [ ] Maintenance procedures documented

### Configuration
- [ ] GitHub Pages configured
- [ ] Custom domain setup (if applicable)
- [ ] SSL/HTTPS enabled
- [ ] Analytics integrated (if applicable)
- [ ] Uptime monitoring configured

### Validation
- [ ] All pre-deployment checks passed
- [ ] Performance targets met (PageSpeed >90)
- [ ] Accessibility compliance verified
- [ ] SSL certificate provisioned
- [ ] Monitoring alerts tested

---

## Estimation Breakdown

**Story Points:** 5

**Effort Distribution:**
- Pre-deployment checklist: 1 SP
- Custom domain setup: 1.5 SP
- Performance optimization: 1.5 SP
- Monitoring setup: 1 SP

**Page Count:** 10-12 pages

**Estimated Duration:** 2-3 days (1 DevOps engineer)

---

## Notes

### Success Metrics
- Documentation accessible at custom domain
- PageSpeed score >90/100
- SSL/HTTPS working correctly
- Uptime >99.9%
- Load time <2 seconds globally

### Common Mistakes to Avoid
- ❌ Not verifying DNS propagation before SSL setup
- ❌ Skipping performance optimization
- ❌ No monitoring or alerting
- ❌ Missing backup procedures
- ❌ Not testing from multiple global locations

### Best Practices
- ✅ Complete pre-deployment checklist thoroughly
- ✅ Test from multiple geographic locations
- ✅ Set up monitoring before going live
- ✅ Document all configuration decisions
- ✅ Plan for disaster recovery

---

**Status:** ✅ Core deployment implemented
**Implemented Files:**
- `docs/about/deployment.md` (core deployment guide)
- `.github/workflows/deploy-docs.yml` (CI/CD pipeline)

**Note:** Advanced deployment features (custom domain, monitoring, performance optimization) are documented as reference guidance within the story but not implemented as separate files.
