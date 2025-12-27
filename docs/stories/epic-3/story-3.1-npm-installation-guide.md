# Story 3.1: NPM Installation Guide

**Epic:** Epic 3 - Installation & Quick Start Guide
**Story ID:** STORY-3.1
**Status:** Draft
**Created:** 2025-12-27
**Updated:** 2025-12-27

---

## User Story

**As a** developer who prefers npm packages
**I want** clear npm installation instructions with prerequisites and troubleshooting
**So that** I can quickly install and configure the MCP server in under 5 minutes

---

## Story Description

### Current System Context

The MCP server is published to npm registry as `@bmad-labs/mcp-n8n-workflow-builder` version 0.9.1. The package includes:
- Pre-compiled JavaScript in `/build` directory
- TypeScript source code in `/src` directory
- Package dependencies: `@modelcontextprotocol/sdk`, `axios`, `zod`
- Requires Node.js 18+ and npm 7+

Installation is currently documented in README.md lines 42-89, covering basic npm install and npx usage patterns.

### Enhancement: Comprehensive NPM Installation Documentation

Create detailed installation guide page covering:

**Prerequisites Documentation:**
- Node.js version requirements (18.x or higher)
- npm version requirements (7.x or higher)
- Operating system compatibility (macOS, Linux, Windows)
- Verification commands for checking installed versions

**Installation Methods:**
1. **Global Installation** (recommended for CLI usage)
   - Command: `npm install -g @bmad-labs/mcp-n8n-workflow-builder`
   - Usage: `mcp-n8n-workflow-builder` command available globally
   - Use case: System-wide installation for multiple projects

2. **Local Project Installation**
   - Command: `npm install @bmad-labs/mcp-n8n-workflow-builder`
   - Usage: Via npx or package.json scripts
   - Use case: Project-specific installation

3. **NPX Direct Execution** (no installation)
   - Command: `npx @bmad-labs/mcp-n8n-workflow-builder`
   - Usage: One-time execution without installation
   - Use case: Quick testing or CI/CD pipelines

**Post-Installation Verification:**
- Version check command
- Health check endpoint validation
- Environment variable setup verification

**Troubleshooting Common Issues:**
- Node.js version mismatch
- npm permissions errors (EACCES)
- Port conflicts (default 3456)
- Network/firewall issues during installation

---

## Acceptance Criteria

### Documentation Requirements

**AC1: Prerequisites Section**
- [ ] Node.js version requirements clearly stated (18.x minimum, 20.x recommended)
- [ ] npm version requirements specified (7.x minimum)
- [ ] OS compatibility table (macOS, Linux, Windows WSL2)
- [ ] Verification commands provided:
  ```bash
  node --version  # Should output v18.x.x or higher
  npm --version   # Should output 7.x.x or higher
  ```

**AC2: Installation Methods**
- [ ] Global installation documented with step-by-step commands
- [ ] Local installation documented with project setup
- [ ] npx execution method explained
- [ ] Each method includes:
  - Installation command
  - Expected output
  - Verification step
  - Use case explanation

**AC3: Post-Installation Verification**
- [ ] Version check documented:
  ```bash
  npm list -g @bmad-labs/mcp-n8n-workflow-builder
  # OR
  npx @bmad-labs/mcp-n8n-workflow-builder --version
  ```
- [ ] Quick health check command:
  ```bash
  curl http://localhost:3456/health
  ```
- [ ] Expected successful response documented

**AC4: Troubleshooting Section**
- [ ] At least 5 common issues documented with solutions:
  1. Node.js version too old → upgrade instructions
  2. EACCES permission errors → npm prefix solution or sudo alternatives
  3. Port 3456 already in use → MCP_PORT environment variable
  4. Installation hangs → network/proxy configuration
  5. Package not found → npm registry issues
- [ ] Each issue includes:
  - Symptom description
  - Error message example
  - Step-by-step solution
  - Prevention tip

**AC5: Code Examples**
- [ ] All installation commands tested and validated
- [ ] Example outputs included for successful installations
- [ ] Example error messages included for troubleshooting
- [ ] Copy-paste ready commands with proper escaping

**AC6: Quick Start Link**
- [ ] Link to Story 3.3 (Configuration Setup) for next steps
- [ ] Link to Story 3.4 (Claude Desktop Integration) for usage
- [ ] Breadcrumb navigation to Epic 3 overview

---

## Technical Implementation Notes

### Documentation Structure

```markdown
# NPM Installation Guide

## Prerequisites

### System Requirements
- Node.js version table
- npm version table
- OS compatibility matrix

### Verification
- Check Node.js version
- Check npm version
- Troubleshoot version mismatches

## Installation Methods

### Method 1: Global Installation (Recommended)
- Installation command
- Verification
- Usage examples

### Method 2: Local Project Installation
- Installation command
- Package.json setup
- npx usage

### Method 3: NPX Direct Execution
- Command syntax
- Use cases
- Limitations

## Post-Installation Verification

### Version Check
- Global installation verification
- Local installation verification

### Health Check
- Start server (if needed)
- Curl health endpoint
- Expected response

## Troubleshooting

### Issue 1: Node.js Version Too Old
### Issue 2: Permission Errors (EACCES)
### Issue 3: Port Conflicts
### Issue 4: Installation Hangs
### Issue 5: Package Not Found

## Next Steps
- Configuration Setup Guide →
- Claude Desktop Integration →
```

### Content Sources

**Primary References:**
- `/README.md` lines 42-89 (current installation section)
- `/package.json` for version and dependencies
- `/docs/CHANGELOG.md` for version history
- `/examples/setup_with_claude.md` for npx examples

**Verification Testing:**
- Test all installation methods on:
  - macOS (latest)
  - Ubuntu 22.04 LTS
  - Windows 11 WSL2
- Document actual outputs from each platform

### Screenshots/Diagrams Needed

1. **Terminal screenshot:** Successful global installation output
2. **Terminal screenshot:** npm version verification
3. **Terminal screenshot:** Health check response
4. **Flowchart:** Installation method decision tree (which method to choose)

---

## Dependencies

### Upstream Dependencies
- None (this is the first story in Epic 3)

### Downstream Dependencies
- **Story 3.3** (Configuration Setup) depends on this for installation completion
- **Story 3.4** (Claude Desktop Integration) assumes npm installation is complete

### Related Stories
- **Epic 4 Story 4.1** (Workflows Tools Reference) - references installation for tool usage
- **Epic 8 Story 8.2** (Debug Mode Guide) - references installation troubleshooting

---

## Definition of Done

### Content Checklist
- [ ] Prerequisites section written and validated
- [ ] All three installation methods documented with examples
- [ ] Post-installation verification steps tested on 3 platforms
- [ ] Troubleshooting section covers 5+ common issues
- [ ] Code examples tested and copy-paste ready
- [ ] Navigation links to related stories added

### Quality Checklist
- [ ] Technical accuracy verified by testing on macOS/Linux/Windows
- [ ] All npm commands tested with npm 7, 8, 9, 10
- [ ] All Node.js version requirements tested (18.x, 20.x, 21.x)
- [ ] Screenshots captured for key steps
- [ ] Markdown formatting validated
- [ ] No broken internal links

### Review Checklist
- [ ] Peer review completed (technical accuracy)
- [ ] Editor review completed (clarity, grammar)
- [ ] User testing (follow guide on clean machine)
- [ ] QA Agent validation (Story 3.1 acceptance criteria met)

---

## Estimation

**Effort:** 4 story points (2-3 hours)

**Breakdown:**
- Content research and organization: 30 minutes
- Writing prerequisites and methods: 45 minutes
- Testing on 3 platforms: 45 minutes
- Troubleshooting section writing: 30 minutes
- Screenshots and formatting: 30 minutes

**Page Count:** 3-4 pages

---

## Notes

### Writing Style Guidelines
- Use active voice and imperative mood for instructions
- Include both command explanations and copy-paste ready examples
- Add "Why this matters" boxes for key concepts
- Use collapsible sections for verbose output examples
- Follow GitHub-flavored Markdown conventions

### Success Metrics
- User can complete installation in under 5 minutes
- Zero ambiguity in installation method selection
- Common issues preventable through clear prerequisites
- 90%+ of users succeed without troubleshooting section

---

## Technical Validation

### Installation Method Testing Matrix

| Method | macOS | Linux | Windows WSL2 | Node 18.x | Node 20.x | Node 21.x |
|--------|-------|-------|--------------|-----------|-----------|-----------|
| Global | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Local | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| npx | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### Common Issues Validation

| Issue | Reproducible | Solution Tested | Preventable |
|-------|--------------|-----------------|-------------|
| Node.js too old | ✅ | ✅ | ✅ (prereqs) |
| EACCES permissions | ✅ | ✅ | ✅ (npm prefix) |
| Port conflict | ✅ | ✅ | ✅ (MCP_PORT) |
| Network timeout | ✅ | ✅ | ⚠️ (user network) |
| Package not found | ✅ | ✅ | ⚠️ (npm registry) |

---

**Story Owner:** Technical Writer (Scribe Persona)
**Reviewers:** Dev Agent, QA Agent
**Target Milestone:** Epic 3 - Phase 1 (Stories 3.1-3.3)
