# Documentation Assets

This directory contains images and visual assets for the documentation site.

## Required Assets

### Logo and Favicon

- `logo.png` - Site logo (recommended: 128x128px, transparent background)
- `favicon.png` - Browser favicon (recommended: 32x32px or 64x64px)

You can create these assets using:
1. Project branding guidelines
2. n8n logo + MCP protocol icon combination
3. Custom design tools (Figma, Canva, etc.)

For now, placeholder text will be used until proper assets are created.

## Screenshots and Diagrams

Additional subdirectories for documentation content:

- `screenshots/` - Installation steps, UI examples
- `diagrams/` - Architecture diagrams, workflow examples
- `icons/` - Custom icons for features

## Image Optimization

All images should be optimized for web:
- PNG: Use `pngquant` or `optipng`
- JPG: Use `jpegoptim`
- Convert to WebP for better performance

Example:
```bash
# Optimize PNG
pngquant --quality=80-90 logo.png

# Create WebP version
cwebp -q 80 logo.png -o logo.webp
```
