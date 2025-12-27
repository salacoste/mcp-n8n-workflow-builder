# Epic 3: Installation & Quick Start Guide - GitHub Pages Documentation

<!-- Powered by BMAD™ Core -->

## Epic Goal

Create comprehensive, user-friendly installation and quick start documentation for GitHub Pages, covering all installation methods, configuration options, and a complete first-workflow tutorial to enable new users to get started within 15 minutes.

## Epic Description

### Existing System Context

**Current Relevant Functionality:**
- MCP server available via npm package `@kernel.salacoste/n8n-workflow-builder`
- Multiple installation methods: npm global, npm local, manual from source
- Two configuration approaches: `.config.json` (multi-instance) and `.env` (single-instance legacy)
- Claude Desktop integration via `cline_mcp_settings.json` or `claude_desktop_config.json`
- Comprehensive README.md with installation instructions
- Examples directory with setup guides

**Technology Stack:**
- Node.js (v14+ required)
- npm package manager
- TypeScript/compiled to JavaScript
- n8n REST API v1 (tested with 1.82.3)
- MCP protocol (Model Context Protocol)

**Integration Points:**
- npm registry for package distribution
- Claude Desktop / Cursor IDE for MCP client integration
- n8n instance (self-hosted or cloud) for API connectivity
- Configuration files (`.config.json`, `.env`, `cline_mcp_settings.json`)

### Enhancement Details

**Current Situation:**

**✅ Existing Documentation:**
- README.md contains comprehensive installation guide (lines 23-294)
- Configuration examples for both `.config.json` and `.env` formats
- Claude Desktop integration instructions
- Environment variable setup guidance
- Build and run commands documented

**📋 Examples Directory:**
- `examples/setup_with_claude.md` - Claude App integration steps
- `examples/workflow_examples.md` - Basic usage examples
- Configuration file examples

**⚠️ Current Gaps for GitHub Pages:**
- No structured step-by-step quick start tutorial
- Installation documentation mixed with other content
- No visual guides or screenshots
- Missing verification steps for successful installation
- No dedicated troubleshooting for installation issues
- Configuration best practices scattered across documents

**What's Being Added/Changed:**

1. **Structured Installation Guides (Stories 3.1-3.2):**
   - Separate pages for npm installation (global vs local)
   - Dedicated manual installation from source guide
   - Clear prerequisites checklist
   - Platform-specific instructions (macOS, Linux, Windows)
   - Verification commands for each step

2. **Configuration Documentation (Story 3.3):**
   - Step-by-step configuration setup guide
   - Visual comparison: single-instance vs multi-instance
   - Configuration file templates with annotations
   - URL format best practices (from Epic 1)
   - Environment variable reference
   - Migration guide from single to multi-instance

3. **Claude Desktop Integration (Story 3.4):**
   - Dedicated integration guide for Claude Desktop
   - Cursor IDE integration instructions
   - Configuration file setup with examples
   - Permission settings (alwaysAllow, autoApprove)
   - Troubleshooting integration issues
   - Multiple MCP server setup

4. **First Workflow Tutorial (Story 3.5):**
   - Complete hands-on tutorial from installation to first workflow execution
   - Sample workflow creation with explanations
   - Using workflow templates/prompts
   - Activating and testing workflows
   - Viewing execution results
   - Common beginner mistakes and solutions

5. **Verification & Testing (Story 3.6):**
   - Health check procedures
   - Testing MCP tool availability
   - Running test scripts (test-mcp-tools.js)
   - Verifying n8n connectivity
   - Debug mode usage
   - Installation success criteria

6. **Visual Enhancements:**
   - Architecture diagrams (user → Claude → MCP server → n8n)
   - Configuration flow diagrams
   - Screenshot placeholders for UI elements
   - Code blocks with syntax highlighting
   - Step-by-step numbered procedures

**How It Integrates:**

- Content extracted and reorganized from README.md
- Examples directory content integrated into tutorials
- Epic 1 URL configuration guidance incorporated
- Links to API reference (Epic 7) and troubleshooting (Epic 8)
- Maintains consistency with existing documentation

**Success Criteria:**

1. ✅ New user can install from npm in < 5 minutes
2. ✅ Configuration setup completed in < 5 minutes
3. ✅ First workflow created and executed in < 5 minutes
4. ✅ All installation methods documented with verification steps
5. ✅ Claude Desktop integration working on first attempt
6. ✅ Clear troubleshooting for common installation issues
7. ✅ Zero ambiguity in installation instructions
8. ✅ Platform-specific guidance where needed

## Stories

This epic consists of 6 user stories organized by installation phase:

### Phase 1: Installation Methods (Stories 3.1-3.2)

#### Story 3.1: npm Installation Guide
**📄 File:** `docs/stories/3.1.npm-installation-guide.md`

**Description:** Create comprehensive npm installation guide covering both global and local installation methods with verification steps.

**User Story:**
> As a developer new to n8n-workflow-builder, I want clear step-by-step npm installation instructions, so that I can install the package correctly on my first attempt without errors.

**Scope:**
- Prerequisites checklist (Node.js version, npm availability)
- Global installation guide (`npm install -g @kernel.salacoste/n8n-workflow-builder`)
- Local installation guide (project dependency)
- Installation verification commands
- Platform-specific notes (macOS, Linux, Windows)
- Troubleshooting common npm issues
- Next steps after installation

**Key Acceptance Criteria:**
1. Prerequisites clearly listed with version requirements
2. Both global and local installation methods documented
3. Verification commands provided with expected output
4. Common installation errors with solutions
5. Links to manual installation alternative
6. Estimated installation time: < 5 minutes

**Estimated Complexity:** Low
**Dependencies:** None
**Blocking:** Story 3.3 (configuration follows installation)

---

#### Story 3.2: Manual Installation from Source
**📄 File:** `docs/stories/3.2.manual-installation-source.md`

**Description:** Create guide for installing from GitHub source, including repository cloning, dependency installation, and building.

**User Story:**
> As a developer who wants the latest code or needs to customize the MCP server, I want instructions for manual installation from source, so that I can build and run the project locally.

**Scope:**
- Repository cloning instructions
- Dependency installation (`npm install`)
- Build process (`npm run build`)
- Development mode setup (`npm run dev`)
- Directory structure overview
- Running from source vs built version
- Updating to latest version

**Key Acceptance Criteria:**
1. Complete git clone command with repository URL
2. Step-by-step dependency installation
3. Build verification steps
4. Development workflow explained
5. Troubleshooting build errors
6. Comparison with npm installation method

**Estimated Complexity:** Low
**Dependencies:** None
**Blocking:** Story 3.3 (configuration applies to both methods)

---

### Phase 2: Configuration (Story 3.3)

#### Story 3.3: Configuration Setup Guide (Single vs Multi-Instance)
**📄 File:** `docs/stories/3.3.configuration-setup-guide.md`

**Description:** Comprehensive configuration guide covering both single-instance (.env) and multi-instance (.config.json) setups with migration path.

**User Story:**
> As a user setting up n8n-workflow-builder, I want clear guidance on choosing and configuring single-instance vs multi-instance mode, so that I can set up the right configuration for my needs.

**Scope:**
- Configuration decision tree (when to use single vs multi-instance)
- `.env` file setup (single-instance, legacy)
- `.config.json` file setup (multi-instance, recommended)
- Environment variable reference (N8N_HOST, N8N_API_KEY, MCP_PORT, DEBUG)
- URL configuration best practices (Epic 1 integration)
- n8n API key generation guide
- Configuration validation
- Migration from .env to .config.json

**Key Acceptance Criteria:**
1. Clear decision matrix for single vs multi-instance
2. Both configuration formats documented with examples
3. URL format guidance (no /api/v1 suffix)
4. Environment-specific configuration (production, staging, development)
5. Security best practices (API key protection, .gitignore)
6. Configuration verification commands
7. Migration guide with step-by-step instructions

**Estimated Complexity:** Medium
**Dependencies:** Stories 3.1, 3.2 (installation must be complete)
**Blocking:** Story 3.4 (Claude integration requires configuration)

---

### Phase 3: Integration & First Use (Stories 3.4-3.5)

#### Story 3.4: Claude Desktop Integration Guide
**📄 File:** `docs/stories/3.4.claude-desktop-integration.md`

**Description:** Step-by-step guide for integrating n8n-workflow-builder with Claude Desktop and Cursor IDE.

**User Story:**
> As a Claude Desktop user, I want detailed instructions for configuring the MCP server in my IDE, so that I can access n8n workflows through Claude's natural language interface.

**Scope:**
- Claude Desktop configuration file location (OS-specific)
- MCP server entry format (`mcpServers` configuration)
- Environment variables in Claude config
- Permission settings (alwaysAllow, autoApprove arrays)
- Cursor IDE configuration differences
- Multiple MCP server setup
- Port configuration (MCP_PORT)
- Restarting Claude Desktop after configuration
- Verification of MCP server availability

**Key Acceptance Criteria:**
1. OS-specific config file paths documented (macOS, Windows, Linux)
2. Complete configuration example with all required fields
3. Permission settings explained with security considerations
4. Port conflict resolution guidance
5. Verification steps with screenshots (placeholders)
6. Troubleshooting Claude Desktop connection issues
7. Links to official Claude Desktop documentation

**Estimated Complexity:** Medium
**Dependencies:** Story 3.3 (configuration must be ready)
**Blocking:** Story 3.5 (first workflow needs working integration)

---

#### Story 3.5: First Workflow Creation Tutorial
**📄 File:** `docs/stories/3.5.first-workflow-tutorial.md`

**Description:** Hands-on tutorial guiding users through creating, activating, and executing their first n8n workflow via MCP tools.

**User Story:**
> As a new user who completed installation and configuration, I want a guided tutorial for creating my first workflow, so that I can verify everything is working and learn the basic workflow.

**Scope:**
- Prerequisites check (installation, configuration, Claude integration)
- Using `list_workflows` to view existing workflows
- Creating a simple workflow using prompts system
  - Schedule Triggered Workflow template
  - Customizing template variables
- Understanding workflow structure (nodes, connections)
- Activating the workflow
- Viewing execution results
- Modifying and updating workflows
- Common beginner mistakes and solutions
- Next steps and learning resources

**Key Acceptance Criteria:**
1. Complete tutorial from start to working workflow (< 5 minutes)
2. Uses prompts system for simplified workflow creation
3. Step-by-step with expected outputs at each stage
4. Explains workflow concepts (nodes, triggers, connections)
5. Includes troubleshooting for common first-time issues
6. Links to advanced tutorials and API reference
7. Success criteria for tutorial completion

**Estimated Complexity:** Medium
**Dependencies:** Story 3.4 (Claude integration must work)
**Blocking:** None

---

### Phase 4: Verification & Troubleshooting (Story 3.6)

#### Story 3.6: Verification & Testing Guide
**📄 File:** `docs/stories/3.6.verification-testing-guide.md`

**Description:** Comprehensive verification guide to ensure installation, configuration, and integration are working correctly.

**User Story:**
> As a user who completed setup, I want verification procedures to confirm everything is working correctly, so that I can be confident the system is ready for production use.

**Scope:**
- Health check procedures
  - Server health endpoint (`http://localhost:3456/health`)
  - MCP tool availability check
  - n8n API connectivity test
- Running test scripts
  - `test-mcp-tools.js` usage and interpretation
  - Test configuration and cleanup flags
  - Understanding test results
- Debug mode activation
  - Setting DEBUG=true
  - Reading debug logs
  - Common debug scenarios
- Verification checklist
  - Installation verification
  - Configuration verification
  - Integration verification
  - API connectivity verification
- Troubleshooting installation-specific issues
  - Port conflicts (EADDRINUSE)
  - Authentication failures
  - URL configuration errors
  - Node.js version issues

**Key Acceptance Criteria:**
1. Complete verification checklist with all tests
2. Health check endpoint documented with expected responses
3. Test script usage guide with examples
4. Debug mode setup and log interpretation
5. Common installation issues with step-by-step solutions
6. Success criteria clearly defined
7. Links to comprehensive troubleshooting (Epic 8)

**Estimated Complexity:** Low
**Dependencies:** Stories 3.1-3.5 (all installation steps complete)
**Blocking:** None

---

## Story Implementation Order

**Phase 1 (Installation Methods) - Stories 3.1, 3.2:**
- Can be executed in parallel
- Both feed into configuration setup
- Provide foundation for all subsequent steps

**Phase 2 (Configuration) - Story 3.3:**
- MUST follow Phase 1 completion
- Required for integration setup
- Contains Epic 1 URL configuration guidance

**Phase 3 (Integration & First Use) - Stories 3.4, 3.5:**
- Sequential execution recommended (3.4 → 3.5)
- Integration must work before tutorial
- Tutorial validates entire setup

**Phase 4 (Verification) - Story 3.6:**
- Can be developed in parallel with Phase 3
- Provides validation for all previous phases
- Links to comprehensive troubleshooting guide

## Compatibility Requirements

- [x] Documentation aligns with v0.9.1 codebase
- [x] All installation methods tested and verified
- [x] Configuration examples match actual code behavior
- [x] Epic 1 URL normalization integrated
- [x] Claude Desktop configuration matches current MCP SDK
- [x] Test scripts verified with latest package version
- [x] Platform-specific guidance where needed (macOS, Linux, Windows)

## Risk Mitigation

**Primary Risk:** Users encounter errors during installation and abandon setup

**Mitigation:**
- Clear prerequisites before each step
- Verification commands after each major step
- Common errors documented with solutions
- Visual aids for complex steps (screenshots, diagrams)
- Link to troubleshooting guide throughout
- Estimated time for each step sets expectations

**Secondary Risk:** Documentation becomes outdated with package updates

**Mitigation:**
- Version-specific documentation (v0.9.1+)
- Reference actual code files and line numbers where applicable
- Automated testing of installation procedures
- Regular documentation review with releases
- Changelog integration for breaking changes

**Rollback Plan:**
- Documentation changes are non-breaking
- Users can reference README.md for comprehensive guide
- Version history maintained for older installations
- No code changes in this epic

## Definition of Done

- [ ] All 6 stories completed with acceptance criteria met
- [ ] Installation guides tested on all major platforms (macOS, Linux, Windows)
- [ ] Configuration examples validated against current codebase
- [ ] Claude Desktop integration verified with latest Claude version
- [ ] First workflow tutorial successfully completed by test users
- [ ] Verification procedures detect all common installation issues
- [ ] All links to other documentation sections working
- [ ] Visual aids (diagrams, screenshots) in place or placeholders documented
- [ ] Epic 1 URL configuration guidance integrated
- [ ] Cross-references to Epic 4 (Tools), Epic 5 (Architecture), Epic 8 (Troubleshooting)
- [ ] Documentation reviewed for clarity and accuracy
- [ ] GitHub Pages structure compatible
- [ ] Mobile-responsive formatting verified

### Testing Checklist

**Prerequisites:**
- [ ] Fresh system or clean environment available for testing
- [ ] All major platforms accessible (macOS, Linux, Windows)
- [ ] Latest n8n instance available (self-hosted or cloud)
- [ ] Claude Desktop latest version installed

**Installation Testing:**
- [ ] npm global installation tested and verified
- [ ] npm local installation tested and verified
- [ ] Manual installation from source tested and verified
- [ ] All verification commands produce expected output
- [ ] Installation time < 5 minutes per method

**Configuration Testing:**
- [ ] Single-instance (.env) configuration working
- [ ] Multi-instance (.config.json) configuration working
- [ ] Environment variables correctly recognized
- [ ] URL normalization working (Epic 1 validation)
- [ ] Configuration migration tested
- [ ] API key authentication successful

**Integration Testing:**
- [ ] Claude Desktop integration successful on first attempt
- [ ] Cursor IDE integration successful (if applicable)
- [ ] MCP tools visible in Claude Desktop
- [ ] Permissions (alwaysAllow, autoApprove) working as expected
- [ ] Multiple MCP server configuration tested

**Tutorial Testing:**
- [ ] First workflow tutorial completed in < 5 minutes
- [ ] Workflow created using prompts system
- [ ] Workflow activation successful
- [ ] Workflow execution verified
- [ ] Tutorial accessible to non-technical users

**Verification Testing:**
- [ ] Health check endpoint responding correctly
- [ ] test-mcp-tools.js running successfully
- [ ] Debug mode producing expected logs
- [ ] All verification steps pass
- [ ] Common errors detected and explained

**Documentation Quality:**
- [ ] All steps clear and unambiguous
- [ ] Code examples tested and working
- [ ] Links to other sections functional
- [ ] Visual aids support understanding
- [ ] Platform-specific notes accurate

## Technical Notes

### Current Documentation Sources

**README.md:**
- Lines 23-70: Requirements and installation overview
- Lines 70-105: Configuration (both .env and .config.json)
- Lines 105-160: URL configuration best practices (Epic 1)
- Lines 220-254: Build and run commands
- Lines 256-294: Claude App integration

**Examples Directory:**
- `examples/setup_with_claude.md` - Claude Desktop integration
- `examples/workflow_examples.md` - Basic usage examples
- `examples/using_prompts.md` - Prompts system tutorial

**CLAUDE.md:**
- Development commands reference
- Testing strategy and scripts
- Troubleshooting section

### GitHub Pages Integration

**Proposed Page Structure:**
```
🚀 Getting Started
├── Installation
│   ├── npm Installation (Story 3.1)
│   ├── Manual Installation (Story 3.2)
│   └── Prerequisites
├── Configuration
│   ├── Single-Instance Setup (Story 3.3)
│   ├── Multi-Instance Setup (Story 3.3)
│   └── Environment Variables
├── Integration
│   ├── Claude Desktop (Story 3.4)
│   └── Cursor IDE (Story 3.4)
├── Quick Start
│   └── First Workflow Tutorial (Story 3.5)
└── Verification
    └── Testing & Verification (Story 3.6)
```

### Visual Assets Needed

**Diagrams (mermaid.js or static images):**
- Architecture diagram: User → Claude Desktop → MCP Server → n8n API
- Configuration flow diagram: Decision tree for single vs multi-instance
- Installation process flowchart

**Screenshots (placeholders documented):**
- Claude Desktop MCP configuration screen
- n8n workflow interface showing created workflow
- Health check endpoint response
- Test script successful execution output

### Code Examples Format

All code blocks should include:
- Language identifier for syntax highlighting
- Comments explaining non-obvious steps
- Expected output where applicable
- Error handling examples

**Example Template:**
```bash
# Install globally
npm install -g @kernel.salacoste/n8n-workflow-builder

# Verify installation
n8n-workflow-builder --version
# Expected output: 0.9.1
```

### Content Extraction Plan

**From README.md:**
- Installation sections (lines 30-65) → Stories 3.1, 3.2
- Configuration sections (lines 66-219) → Story 3.3
- Claude integration (lines 256-294) → Story 3.4

**From examples/:**
- `setup_with_claude.md` → Story 3.4
- `workflow_examples.md` → Story 3.5
- `using_prompts.md` → Story 3.5

**From CLAUDE.md:**
- Testing commands → Story 3.6
- Troubleshooting → Story 3.6 (with links to Epic 8)

## Story Manager Handoff

**Story Manager Handoff:**

"Please develop detailed user stories for this GitHub Pages documentation epic. Key considerations:

- This is a documentation-focused epic with no code changes required
- Content sources:
  - README.md (Installation Guide, Configuration, Claude Integration sections)
  - examples/ directory (setup_with_claude.md, workflow_examples.md, using_prompts.md)
  - CLAUDE.md (Development commands, Testing, Troubleshooting)
  - Epic 1 completion (URL configuration best practices)
- Target audience:
  - Primary: New users installing for the first time
  - Secondary: Experienced users setting up multi-instance configurations
  - Tertiary: Contributors setting up development environment
- Documentation goals:
  - Zero ambiguity in installation instructions
  - < 15 minutes from installation to first workflow execution
  - Platform-agnostic where possible, platform-specific guidance where needed
  - Self-service troubleshooting for common issues
- GitHub Pages requirements:
  - Mobile-responsive content
  - Clear navigation structure
  - Search-friendly formatting
  - Version-specific documentation (v0.9.1+)
- Each story must include:
  - Prerequisites checklist
  - Step-by-step procedures with verification
  - Common errors with solutions
  - Links to related documentation
  - Visual aids (diagrams, screenshots, or placeholders)
  - Estimated completion time

The epic should provide a complete, beginner-friendly installation and quick start experience while maintaining technical accuracy and linking to advanced documentation for deeper exploration."

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-12-27 | 1.0 | Epic created for GitHub Pages Installation & Quick Start documentation | Sarah (PO) |

## References

- **Source Documentation:** README.md (Installation Guide, Configuration sections)
- **Integration Guide:** examples/setup_with_claude.md
- **Usage Examples:** examples/workflow_examples.md, examples/using_prompts.md
- **Developer Guide:** CLAUDE.md (Testing, Troubleshooting sections)
- **Epic 1:** URL Configuration Fix (integration into Story 3.3)
- **Target Version:** 0.9.1+
- **n8n Compatibility:** 1.82.3 (tested and validated)
- **MCP Protocol:** Latest version compatible with Claude Desktop and Cursor IDE
