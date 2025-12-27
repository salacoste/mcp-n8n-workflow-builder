# Story 1.2 Implementation Checklist

<!-- Quick Reference for Developer -->

## 📋 **Quick Stats**

- **Files to Update:** 4
- **Total URL Fixes:** ~16 occurrences
- **Estimated Time:** 3-4 hours
- **Dependencies:** Story 1.1 must be completed first

---

## ✅ **Pre-Implementation Checklist**

- [ ] Story 1.1 is completed and merged
- [ ] You have write access to all documentation files
- [ ] You have a markdown preview tool ready
- [ ] You have a JSON validator ready (https://jsonlint.com/)

---

## 📁 **File Update Checklist**

### 1. README.md (6 occurrences)

**Lines to Update:**
- [ ] Line 80: Remove `/api/v1/` from production example
- [ ] Line 84: Remove `/api/v1/` from staging example
- [ ] Line 88: Remove `/api/v1/` from development example
- [ ] Line 335: Remove `/api/v1/` from migration example 1
- [ ] Line 348: Remove `/api/v1/` from migration example 2
- [ ] Line 352: Remove `/api/v1/` from migration example 3

**New Sections to Add:**
- [ ] Add "Configuration Best Practices" section after Installation Guide
- [ ] Add "Migrating from Old Configuration" section
- [ ] Update Troubleshooting section with "URL Configuration Issues"

**Search Pattern:**
```bash
grep -n '"n8n_host".*api/v1' README.md
```

---

### 2. docs/multi-instance-architecture.md (7 occurrences)

**Lines to Update:**
- [ ] Line 28: First example - production
- [ ] Line 32: First example - staging
- [ ] Line 79: Second example - production
- [ ] Line 83: Second example - staging
- [ ] Line 87: Second example - development
- [ ] Line 98: .env fallback example
- [ ] Line 107: Migration example

**Search Pattern:**
```bash
grep -n 'n8n_host.*api/v1\|N8N_HOST.*api/v1' docs/multi-instance-architecture.md
```

---

### 3. examples/setup_with_claude.md (3 occurrences)

**Lines to Update:**
- [ ] Line 33: .env configuration example
- [ ] Line 51: Claude Desktop config (npm installed)
- [ ] Line 81: Claude Desktop config (cloned repo)

**Search Pattern:**
```bash
grep -n 'N8N_HOST.*api/v1' examples/setup_with_claude.md
```

---

### 4. CHANGELOG.md (1 new entry)

**Task:**
- [ ] Add version 0.9.1 entry at the top
- [ ] Include bug fix description
- [ ] Note backward compatibility
- [ ] Credit user bug report
- [ ] Document new features (smart URL detection, debug logging)
- [ ] List documentation updates

**Template:** See full story for complete CHANGELOG entry template

---

## ⚠️ **Files Already Completed**

### ✅ CLAUDE.md - NO ACTION NEEDED

- [x] Line 72: Already correct (`"n8n_host": "https://n8n.example.com"`)
- [x] Line 321: Already correct (`"N8N_HOST": "https://n8n.example.com"`)
- [x] Line 81: Explanatory note already added

**Status:** 100% complete before story began

---

## 🔍 **Verification Checklist**

### After Each File Update:

- [ ] Run JSON validator on all JSON examples
- [ ] Check markdown renders correctly
- [ ] Verify no broken links
- [ ] Ensure consistent formatting

### Final Verification:

```bash
# Should return NO results (all /api/v1 references removed from config examples)
grep -r '"n8n_host".*api/v1\|N8N_HOST.*api/v1' README.md docs/ examples/ | grep -v openapi

# Validate all JSON examples
find . -name "*.md" -exec grep -l "n8n_host" {} \; | xargs -I {} sh -c 'echo "Checking {}" && cat {} | grep -A5 "n8n_host"'

# Check markdown links
npx markdown-link-check README.md
```

---

## 📝 **Search & Replace Commands**

### Safe Automated Replacements

**For README.md:**
```bash
sed -i.bak 's|"n8n_host": "https://n8n.example.com/api/v1/"|"n8n_host": "https://n8n.example.com"|g' README.md
sed -i.bak 's|"n8n_host": "https://staging-n8n.example.com/api/v1/"|"n8n_host": "https://staging-n8n.example.com"|g' README.md
sed -i.bak 's|"n8n_host": "http://localhost:5678/api/v1/"|"n8n_host": "http://localhost:5678"|g' README.md
```

**For docs/multi-instance-architecture.md:**
```bash
sed -i.bak 's|/api/v1/||g' docs/multi-instance-architecture.md
# Then manually review and fix any OpenAPI spec references if present
```

**For examples/setup_with_claude.md:**
```bash
sed -i.bak 's|N8N_HOST=https://your-n8n-instance.com/api/v1/|N8N_HOST=https://your-n8n-instance.com|g' examples/setup_with_claude.md
sed -i.bak 's|"N8N_HOST": "https://your-n8n-instance.com/api/v1/"|"N8N_HOST": "https://your-n8n-instance.com"|g' examples/setup_with_claude.md
```

**⚠️ Warning:** Always create backups and review changes before committing!

---

## 📚 **Content Templates**

### Configuration Best Practices Section

Location: README.md, after "Installation Guide" section

**Template:** See full story file for complete markdown template

Key elements:
- ✅ Correct URL examples
- ❌ Incorrect URL examples with warnings
- Explanation of why it matters
- Backward compatibility note
- Links to official n8n docs

---

### Migration Guide Section

Location: README.md, new section

**Template:** See full story file for complete markdown template

Key elements:
- Option 1: Continue using old format (backward compatible)
- Option 2: Update to new format (recommended)
- Before/after examples
- Step-by-step migration instructions

---

### Troubleshooting Addition

Location: README.md, existing Troubleshooting section

**Template:** See full story file for complete markdown template

Key elements:
- Symptom description
- Possible causes
- 4-step solution process
- Debug logging instructions
- URL verification commands

---

### CHANGELOG Entry

Location: CHANGELOG.md, top of file

**Template:** See full story file for complete markdown template

Version: **0.9.1** (PATCH release)

Sections:
- 🐛 Bug Fixes
- 📚 Documentation
- ✨ Features
- 🔧 Technical Changes

---

## ⏱️ **Estimated Time Breakdown**

| Task | Time | Notes |
|------|------|-------|
| README.md updates | 90 min | 6 replacements + 3 new sections |
| multi-instance-architecture.md | 30 min | 7 replacements |
| setup_with_claude.md | 15 min | 3 replacements |
| CHANGELOG.md | 15 min | 1 new entry |
| Verification & testing | 45 min | JSON validation, link checking |
| Final review | 15 min | Consistency check |
| **TOTAL** | **3.5 hrs** | |

---

## 🎯 **Definition of Done**

Story 1.2 is complete when:

- [x] All 6 URL occurrences in README.md corrected
- [x] Configuration Best Practices section added to README.md
- [x] Migration Guide section added to README.md
- [x] Troubleshooting section updated in README.md
- [x] All 7 URL occurrences in multi-instance-architecture.md corrected
- [x] All 3 URL occurrences in setup_with_claude.md corrected
- [x] CHANGELOG.md updated with version 0.9.1
- [x] All JSON examples validated
- [x] All markdown renders correctly
- [x] No broken links found
- [x] Consistent formatting across all files
- [x] Examples align with Story 1.1 code changes
- [x] Final verification commands pass with no issues

---

## 🚨 **Common Pitfalls**

1. **Don't touch OpenAPI specs:** `examples/n8n-openapi-markdown.md` should NOT be modified
2. **Watch for localhost:** Remove `/api/v1` from localhost URLs too
3. **Trailing slashes:** Remove both `/api/v1` AND trailing `/`
4. **Version number:** Use 0.9.1 (patch), not 0.10.0
5. **JSON validation:** Always validate JSON after edits

---

## 📞 **Need Help?**

- Full story details: `docs/stories/1.2.documentation-updates.CORRECTED.md`
- Epic context: `docs/epic-1-url-configuration-fix.md`
- Story 1.1 (code): `docs/stories/1.1.url-normalization-implementation.md`

---

**Created:** 2025-12-25
**Story:** 1.2 - Documentation Updates
**Status:** Blocked - Waiting for Story 1.1
