# Story 3.6: Verification & Testing Guide

**Epic:** Epic 3 - Installation & Quick Start Guide
**Story ID:** STORY-3.6
**Status:** Draft
**Created:** 2025-12-27
**Updated:** 2025-12-27

---

## User Story

**As a** user who completed installation and first workflow tutorial
**I want** comprehensive verification steps and testing procedures
**So that** I can confirm everything is working correctly and troubleshoot any issues

---

## Story Description

### Current System Context

The MCP server provides multiple verification points:

**Health Check Endpoint:**
- URL: `http://localhost:<MCP_PORT>/health`
- Response: `{"status":"ok","version":"0.9.1"}`

**MCP Tools Available:** 17 tools across 4 categories
- Workflows: 8 tools (list, get, create, update, delete, activate, deactivate, execute)
- Executions: 4 tools (list, get, delete, retry)
- Tags: 5 tools (create, get, update, delete, list)
- Credentials: 6 tools (informative guidance only)

**Testing Infrastructure:**
- `/test-mcp-tools.js` - Comprehensive test suite
- `/test-comprehensive.js` - Full integration tests
- Health check endpoint
- n8n API connectivity validation

**Current Testing Documentation:**
- README.md mentions test files
- No comprehensive verification guide
- No systematic testing procedure
- No troubleshooting decision tree

### Enhancement: Comprehensive Verification & Testing Guide

Create systematic verification guide covering:

**Installation Verification:**
- Package installation confirmation
- Build verification (manual install)
- Version checking
- File structure validation

**Configuration Verification:**
- Environment variables loaded correctly
- Multi-instance configuration working
- n8n API connectivity test
- API key validation

**MCP Server Verification:**
- Server starts successfully
- Health endpoint responds
- Correct port binding
- Process running check

**Claude Desktop Integration Verification:**
- MCP server appears in Claude
- Tool discovery working
- Basic tool execution test
- Multi-tool workflow test

**n8n Integration Verification:**
- API connectivity test
- Authentication successful
- Workflow CRUD operations
- Execution tracking working
- Tags management functional

**Comprehensive Testing:**
- Running test suite
- Interpreting test results
- Test cleanup procedures
- Custom test scenarios

**Troubleshooting Decision Tree:**
- Systematic issue diagnosis
- Common failure patterns
- Fix verification
- When to seek help

---

## Acceptance Criteria

### Documentation Requirements

**AC1: Installation Verification**
- [ ] **NPM Installation Check:**
  ```bash
  # Global installation
  npm list -g @bmad-labs/mcp-n8n-workflow-builder
  # Expected: @bmad-labs/mcp-n8n-workflow-builder@0.9.1

  # Local installation
  npm list @bmad-labs/mcp-n8n-workflow-builder
  # Expected: @bmad-labs/mcp-n8n-workflow-builder@0.9.1

  # Version check
  npx @bmad-labs/mcp-n8n-workflow-builder --version
  # Expected: 0.9.1
  ```
- [ ] **Manual Build Check:**
  ```bash
  # Verify build directory exists
  ls -la build/

  # Expected files:
  # - index.js (main entry point)
  # - config/ (configuration modules)
  # - services/ (business logic)
  # - types/ (TypeScript definitions)
  # - utils/ (utilities)

  # Verify build is recent
  stat build/index.js
  # Check timestamp matches recent build
  ```
- [ ] **File Structure Validation:**
  ```bash
  # Check required files exist
  test -f package.json && echo "✅ package.json"
  test -f tsconfig.json && echo "✅ tsconfig.json"
  test -d src && echo "✅ src/"
  test -d build && echo "✅ build/"
  ```
- [ ] Success criteria: All checks pass with ✅

**AC2: Configuration Verification**
- [ ] **Environment Variables Check:**
  ```bash
  # For .env configuration
  test -f .env && echo "✅ .env file exists"
  grep -q "N8N_HOST" .env && echo "✅ N8N_HOST configured"
  grep -q "N8N_API_KEY" .env && echo "✅ N8N_API_KEY configured"

  # For multi-instance configuration
  test -f .config.json && echo "✅ .config.json exists"

  # Validate JSON syntax
  node -e "JSON.parse(require('fs').readFileSync('.config.json'))" \
    && echo "✅ .config.json valid JSON"
  ```
- [ ] **Configuration Loading Test:**
  ```javascript
  // Create test script: verify-config.js
  const { ConfigLoader } = require('./build/config/configLoader');

  const config = ConfigLoader.getInstance();
  console.log('✅ Config loaded successfully');
  console.log('Environments:', Object.keys(config.environments || {}));
  console.log('Default env:', config.defaultEnv || 'from .env');
  ```
- [ ] **n8n API Connectivity Test:**
  ```bash
  # Test n8n API directly
  curl -X GET \
    'https://your-instance.app.n8n.cloud/api/v1/workflows' \
    -H "X-N8N-API-KEY: your_api_key" \
    -H "Accept: application/json"

  # Expected: JSON response with workflows list
  # ✅ Success: {"data": [...]}
  # ❌ Failure: 401 Unauthorized / Network error
  ```
- [ ] **API Key Validation:**
  - Test with correct key → 200 OK
  - Test with invalid key → 401 Unauthorized
  - Test with missing key → 401 Unauthorized

**AC3: MCP Server Verification**
- [ ] **Server Startup Test:**
  ```bash
  # Start server
  npm start
  # OR
  node build/index.js
  # OR
  npx @bmad-labs/mcp-n8n-workflow-builder

  # Expected output:
  # MCP Server starting...
  # Health check endpoint: http://localhost:3456/health
  # MCP Server started successfully
  ```
- [ ] **Health Endpoint Test:**
  ```bash
  # In separate terminal
  curl http://localhost:3456/health

  # Expected response:
  # {"status":"ok","version":"0.9.1"}
  ```
- [ ] **Port Binding Verification:**
  ```bash
  # Check port is listening
  lsof -i :3456
  # OR (Linux)
  netstat -tlnp | grep 3456

  # Expected: node process listening on port 3456
  ```
- [ ] **Process Verification:**
  ```bash
  # Check process is running
  ps aux | grep "mcp-n8n-workflow-builder"
  # OR
  ps aux | grep "build/index.js"

  # Expected: Active node process
  ```

**AC4: Claude Desktop Integration Verification**
- [ ] **MCP Server Discovery:**
  ```
  In Claude Desktop:
  User: "What MCP servers do you have available?"

  Expected response includes:
  - n8n-workflow-builder
  ```
- [ ] **Tool Discovery Test:**
  ```
  User: "What n8n tools do you have?"

  Expected: List of 17 tools across 4 categories:
  - Workflows (8)
  - Executions (4)
  - Tags (5)
  - Credentials (6 - guidance only)
  ```
- [ ] **Basic Tool Execution:**
  ```
  User: "List my n8n workflows"

  Expected: Claude uses list_workflows tool
  Response: List of workflows with IDs, names, status
  ```
- [ ] **Multi-Tool Workflow Test:**
  ```
  User: "Create a tag called 'Test', list all tags, then delete the test tag"

  Expected sequence:
  1. create_tag('Test') → success, returns tag ID
  2. get_tags() → shows all tags including 'Test'
  3. delete_tag(tag_id) → success, tag removed

  All operations complete without errors
  ```

**AC5: n8n Integration Verification**
- [ ] **Workflow CRUD Test:**
  ```
  Test sequence in Claude Desktop:

  1. CREATE:
  User: "Create a simple test workflow with just a Start node"
  ✅ Workflow created, ID returned

  2. READ:
  User: "Get the workflow we just created"
  ✅ Full workflow details returned

  3. UPDATE:
  User: "Update the workflow name to 'Test Workflow Updated'"
  ✅ Workflow name updated

  4. LIST:
  User: "List all workflows"
  ✅ Updated workflow appears in list

  5. DELETE:
  User: "Delete the test workflow"
  ✅ Workflow deleted successfully
  ```
- [ ] **Execution Tracking Test:**
  ```
  1. Create simple workflow with webhook trigger
  2. Activate workflow
  3. Trigger via curl
  4. List executions
  5. Get execution details
  6. Verify execution data

  All steps complete with expected results
  ```
- [ ] **Tags Management Test:**
  ```
  1. Create tag: "Verification Test"
  2. List tags, verify new tag exists
  3. Update tag name to "Verified"
  4. Get updated tag
  5. Delete tag
  6. Verify tag removed

  All operations successful
  ```

**AC6: Comprehensive Test Suite**
- [ ] **Running Test Suite:**
  ```bash
  # Install test dependencies if needed
  npm install

  # Run comprehensive tests
  node test-mcp-tools.js

  # Expected output:
  # ✅ Workflow Tests: PASSED (8/8)
  # ✅ Execution Tests: PASSED (4/4)
  # ✅ Tag Tests: PASSED (5/5)
  # ✅ Cleanup: PASSED
  #
  # Overall: ALL TESTS PASSED
  ```
- [ ] **Test Configuration:**
  ```javascript
  // In test-mcp-tools.js
  const config = {
    mcpServerUrl: 'http://localhost:3456/mcp',
    healthCheckUrl: 'http://localhost:3456/health',
    testFlags: {
      runWorkflowTests: true,
      runTagTests: true,
      runExecutionTests: true,
      runCleanup: true  // Cleanup test artifacts
    }
  };
  ```
- [ ] **Interpreting Test Results:**
  - ✅ Green checkmarks → All tests passed
  - ❌ Red X → Test failed (see error details)
  - ⏭️ Skipped → Test skipped (check flags)
  - 🧹 Cleanup → Test artifacts removed
- [ ] **Test Cleanup Verification:**
  ```
  After tests complete:
  1. No test workflows remain in n8n
  2. No test tags remain
  3. No test executions clutter history

  List workflows and tags to confirm cleanup
  ```

**AC7: Troubleshooting Decision Tree**
- [ ] **Server Won't Start → Diagnosis:**
  ```
  Issue: Server fails to start

  Check 1: Port conflict
  → Run: lsof -i :3456
  → If port in use: Change MCP_PORT in config
  → If port free: Continue to Check 2

  Check 2: Missing dependencies
  → Run: npm install
  → Verify node_modules exists
  → If missing: Run npm install

  Check 3: Build artifacts missing (manual install)
  → Run: test -d build && echo "OK" || echo "Missing"
  → If missing: Run npm run build

  Check 4: Environment variables
  → Verify .env or .config.json exists
  → Check file contents
  → Fix configuration issues
  ```
- [ ] **Tools Not Available in Claude → Diagnosis:**
  ```
  Issue: Claude Desktop doesn't show n8n tools

  Check 1: MCP server in config
  → Open claude_desktop_config.json
  → Verify "n8n-workflow-builder" entry exists
  → Fix: Add correct configuration

  Check 2: Claude Desktop restart
  → Completely quit Claude Desktop (Cmd+Q)
  → Restart application
  → Wait for MCP servers to initialize

  Check 3: Server running
  → Check health endpoint: curl http://localhost:3456/health
  → If fails: Start MCP server

  Check 4: JSON syntax errors
  → Validate JSON: node -e "JSON.parse(require('fs').readFileSync('claude_desktop_config.json'))"
  → Fix syntax errors
  ```
- [ ] **API Connection Fails → Diagnosis:**
  ```
  Issue: Tools fail with connection errors

  Check 1: n8n instance accessible
  → Test: curl https://your-instance.app.n8n.cloud
  → If fails: Check n8n instance is running

  Check 2: API key valid
  → Test n8n API directly with key
  → If 401: Regenerate API key in n8n

  Check 3: Network/firewall
  → Check corporate proxy settings
  → Verify firewall allows connections
  → Test from different network

  Check 4: URL format
  → Verify N8N_HOST doesn't include /api/v1
  → Server auto-appends /api/v1
  → Fix: Remove /api/v1 from config
  ```
- [ ] **Workflow Creation Fails → Diagnosis:**
  ```
  Issue: create_workflow returns error

  Check 1: Workflow structure
  → Verify nodes array is valid
  → Check connections format
  → Fix: Use workflow prompts for valid structure

  Check 2: Node types valid
  → Verify node types exist in n8n
  → Check typeVersion matches
  → Fix: Use standard n8n node types

  Check 3: Credentials required
  → Some nodes need credentials configured
  → Configure in n8n UI first
  → Then create workflow

  Check 4: Instance parameter
  → If multi-instance: specify instance
  → Verify instance name correct
  → Fix: Use correct instance identifier
  ```

**AC8: Success Confirmation Checklist**
- [ ] Complete verification checklist:
  ```markdown
  ## Installation Verification ✅
  - [ ] Package installed successfully
  - [ ] Build directory present (manual install)
  - [ ] Version matches expected (0.9.1)

  ## Configuration Verification ✅
  - [ ] .env or .config.json exists
  - [ ] Environment variables load correctly
  - [ ] n8n API connection successful
  - [ ] API key valid

  ## MCP Server Verification ✅
  - [ ] Server starts without errors
  - [ ] Health endpoint responds
  - [ ] Correct port binding
  - [ ] Process running

  ## Claude Desktop Integration ✅
  - [ ] MCP server discovered
  - [ ] All 17 tools available
  - [ ] Basic tool execution works
  - [ ] Multi-tool workflows work

  ## n8n Integration ✅
  - [ ] Workflow CRUD operations successful
  - [ ] Execution tracking working
  - [ ] Tags management functional
  - [ ] Test suite passes (17/17 tests)

  ## Overall Status
  All checks passed → ✅ **SYSTEM READY**
  Some checks failed → ⚠️ **TROUBLESHOOTING NEEDED** (use decision tree)
  ```

---

## Technical Implementation Notes

### Documentation Structure

```markdown
# Verification & Testing Guide

## Overview

### Verification Checklist
- Installation
- Configuration
- MCP Server
- Claude Desktop
- n8n Integration
- Testing

### When to Use This Guide
- After installation
- After configuration changes
- When troubleshooting
- Before production use

## Installation Verification

### NPM Installation
- Global check
- Local check
- Version verification

### Manual Build
- Build directory check
- File structure validation
- Build timestamp

### Success Criteria

## Configuration Verification

### Environment Variables
- .env file check
- .config.json validation
- Variable loading test

### n8n API Connectivity
- Direct API test
- Authentication validation
- Network connectivity

### Success Criteria

## MCP Server Verification

### Server Startup
- Start command
- Expected output
- Error handling

### Health Endpoint
- Curl test
- Expected response
- Troubleshooting

### Port and Process
- Port binding check
- Process verification

### Success Criteria

## Claude Desktop Integration

### MCP Discovery
- Server visibility
- Tool discovery

### Tool Execution
- Basic tool test
- Multi-tool workflow

### Success Criteria

## n8n Integration Verification

### Workflow CRUD
- Create test
- Read test
- Update test
- Delete test

### Execution Tracking
- Trigger workflow
- List executions
- Get execution details

### Tags Management
- Create tag
- List tags
- Update tag
- Delete tag

### Success Criteria

## Comprehensive Testing

### Running Test Suite
- Test command
- Test configuration
- Expected output

### Interpreting Results
- Success indicators
- Failure diagnosis
- Cleanup verification

### Custom Tests
- Creating test scenarios
- Validation procedures

## Troubleshooting

### Decision Trees
1. Server won't start
2. Tools not available
3. API connection fails
4. Workflow creation fails

### Common Solutions
- Port conflicts
- Configuration errors
- Network issues
- Permission problems

### When to Seek Help
- GitHub issues
- Community support

## Success Confirmation

### Final Checklist
- All verification categories
- Overall status assessment

### Next Steps
- Production usage
- Advanced features
- Community resources
```

### Content Sources

**Primary References:**
- `/test-mcp-tools.js` - test suite structure
- `/test-comprehensive.js` - integration tests
- `/README.md` - testing section
- `/docs/TROUBLESHOOTING.md` (to be created in Epic 8)

### Visual Assets Needed

1. **Flowchart:** Verification sequence (Installation → Config → Server → Claude → n8n → Tests)
2. **Decision Tree:** Server won't start diagnosis
3. **Decision Tree:** Tools not available diagnosis
4. **Decision Tree:** API connection fails diagnosis
5. **Screenshot:** Successful test suite output
6. **Checklist Diagram:** Success confirmation visual

---

## Dependencies

### Upstream Dependencies
- **Story 3.1** OR **Story 3.2** (Installation)
- **Story 3.3** (Configuration)
- **Story 3.4** (Claude Desktop Integration)
- **Story 3.5** (First Workflow Tutorial)

### Downstream Dependencies
- **Epic 4 Stories** assume verification is complete
- **Epic 8 Story 8.1** (Common Issues) references this for systematic diagnosis

### Related Stories
- **Epic 8 Story 8.2** (Debug Mode Guide) - advanced troubleshooting
- **Epic 8 Story 8.3** (Testing Infrastructure) - developer testing guide

---

## Definition of Done

### Content Checklist
- [ ] Installation verification documented
- [ ] Configuration verification complete
- [ ] MCP server verification steps
- [ ] Claude Desktop integration tests
- [ ] n8n integration verification
- [ ] Test suite running guide
- [ ] Troubleshooting decision trees (4+)
- [ ] Success confirmation checklist

### Quality Checklist
- [ ] All verification steps tested on 3 platforms
- [ ] Test suite executed and documented
- [ ] Decision trees validated with real failures
- [ ] Screenshots from actual test runs
- [ ] Markdown formatting validated
- [ ] Internal links working

### Review Checklist
- [ ] Peer review by Dev Agent
- [ ] QA Agent validation
- [ ] Editor review for clarity
- [ ] User testing with deliberate failures

---

## Estimation

**Effort:** 6 story points (4-5 hours)

**Breakdown:**
- Installation verification: 45 minutes
- Configuration verification: 45 minutes
- MCP server verification: 45 minutes
- Claude Desktop integration tests: 60 minutes
- n8n integration tests: 60 minutes
- Test suite documentation: 45 minutes
- Troubleshooting decision trees: 60 minutes

**Page Count:** 12-15 pages

---

## Notes

### Testing Philosophy
- Systematic verification from bottom to top
- Each layer depends on previous layer
- Clear success/failure criteria for each check
- Decision trees for efficient troubleshooting
- Emphasis on self-service diagnosis

### Success Metrics
- User can complete verification in 15 minutes
- 90%+ of issues diagnosed through decision trees
- Clear go/no-go decision for production use
- Reduced support requests through self-service

---

**Story Owner:** QA Agent + Technical Writer (Scribe Persona)
**Reviewers:** Dev Agent, QA Agent, DevOps Agent
**Target Milestone:** Epic 3 - Phase 2 (Stories 3.4-3.6)
