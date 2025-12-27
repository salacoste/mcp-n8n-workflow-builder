# Workflows API Validation Testing Guide

**Story 2.1: Validate & Test Workflows API**

This guide explains how to run comprehensive validation tests for all 8 Workflows API methods against a live n8n instance.

## Prerequisites

### 1. Live n8n Instance

You need access to a running n8n instance (v1.82.3 or later) with:
- API access enabled
- Valid API key with workflow management permissions
- Network accessibility from your test environment

### 2. Project Setup

```bash
# Install dependencies
npm install

# Build the project
npm run build
```

### 3. Configuration

#### Option A: Using .config.json (Multi-Instance)

Create or update `.config.json` in the project root:

```json
{
  "environments": {
    "production": {
      "n8n_host": "https://your-n8n-instance.com",
      "n8n_api_key": "your_api_key_here"
    },
    "staging": {
      "n8n_host": "https://staging-n8n.com",
      "n8n_api_key": "staging_api_key"
    }
  },
  "defaultEnv": "production"
}
```

#### Option B: Using .env (Single Instance)

Create `.env` file in project root:

```bash
N8N_HOST=https://your-n8n-instance.com
N8N_API_KEY=your_api_key_here
MCP_PORT=3456
```

**Important**: Provide the base URL without `/api/v1`. The server automatically appends `/api/v1`.

## Running Validation Tests

### 1. Start MCP Server

In one terminal:

```bash
npm start
```

The server should start on `http://localhost:3456` (or your configured `MCP_PORT`).

Verify health:
```bash
curl http://localhost:3456/health
```

Expected response:
```json
{"status":"ok"}
```

### 2. Run Validation Tests

In another terminal:

```bash
node test-workflows-validation.js
```

### 3. Test Execution Options

Edit `test-workflows-validation.js` to control which tests run:

```javascript
const testFlags = {
  runListWorkflowsTests: true,      // GET /workflows
  runGetWorkflowTests: true,         // GET /workflows/{id}
  runCreateWorkflowTests: true,      // POST /workflows
  runUpdateWorkflowTests: true,      // PUT /workflows/{id}
  runDeleteWorkflowTests: true,      // DELETE /workflows/{id}
  runActivateWorkflowTests: true,    // PUT /workflows/{id}/activate
  runDeactivateWorkflowTests: true,  // PUT /workflows/{id}/deactivate
  runExecuteWorkflowTests: true,     // Execute workflow
  runMultiInstanceTests: false,      // Requires multi-instance config
  runErrorHandlingTests: true,       // Error scenarios
  runCleanup: true                   // Delete test workflows after
};
```

### 4. Debug Mode

Enable detailed logging:

```bash
DEBUG=true node test-workflows-validation.js
```

## Test Coverage

The validation suite includes **54+ comprehensive tests**:

### Task 2: list_workflows (7 tests)
- ✓ List all workflows without filters
- ✓ Response structure validation
- ✓ Filter by active=true
- ✓ Filter by active=false
- ✓ Pagination with limit parameter
- ✓ Multi-instance routing
- ✓ Error handling (401, malformed params)

### Task 3: get_workflow (5 tests)
- ✓ Retrieve existing workflow by ID
- ✓ Complete structure validation
- ✓ Nodes and connections validation
- ✓ Multi-instance retrieval
- ✓ 404 error for non-existent ID

### Task 4: create_workflow (6 tests)
- ✓ Create minimal workflow (name only)
- ✓ Create complete workflow with nodes
- ✓ Create complex workflow (10+ nodes)
- ✓ Verify nodes and connections preserved
- ✓ Multi-instance creation
- ✓ Error handling (400 for invalid data)

### Task 5: update_workflow (6 tests)
- ✓ Update workflow name
- ✓ Update workflow structure
- ✓ Verify changes persisted
- ✓ Multi-instance update
- ✓ 404 error for non-existent workflow
- ✓ Error handling validation

### Task 6: delete_workflow (5 tests)
- ✓ Delete existing workflow
- ✓ Verify deletion (workflow not retrievable)
- ✓ Multi-instance deletion
- ✓ 404 error for non-existent workflow
- ✓ Idempotency check

### Task 7: activate_workflow (6 tests)
- ✓ Activate inactive workflow
- ✓ Verify active status changes
- ✓ Persistence validation
- ✓ Idempotency (activate already active)
- ✓ Multi-instance activation
- ✓ 404 error handling

### Task 8: deactivate_workflow (5 tests)
- ✓ Deactivate active workflow
- ✓ Verify inactive status
- ✓ Idempotency check
- ✓ Multi-instance deactivation
- ✓ Error handling

### Task 9: execute_workflow (5 tests)
- ✓ Known limitation: Manual trigger workflows
- ✓ Error handling for non-existent workflow
- ✓ Documentation vs implementation comparison

### Task 10: Multi-Instance (3 tests)
- ✓ List workflows from default instance
- ✓ List workflows from specific instance
- ✓ Instance isolation validation

### Task 11: Error Handling (6 tests)
- ✓ 401 Unauthorized (invalid API key)
- ✓ 404 Not Found (non-existent resources)
- ✓ 400 Bad Request (malformed data)
- ✓ Error response format consistency
- ✓ Multi-instance error handling
- ✓ Error message clarity

## Test Output

### Successful Test Run

```
======================================================================
  Workflows API Validation Test Suite - Story 2.1
======================================================================

[INFO] Testing 8 Workflows API methods against live n8n instance
[INFO] MCP Server: http://localhost:3456/mcp

--- Pre-flight Checks ---

[INFO] Server health: ok

--- Task 2: Validate list_workflows ---

[TEST] list_workflows - List all workflows: ✓ PASS - Found 15 workflows
[TEST] list_workflows - Response structure validation: ✓ PASS - All required fields present
[TEST] list_workflows - Filter active=true: ✓ PASS - 8 active workflows
...

======================================================================
  Test Summary Report
======================================================================
Total tests executed: 54
Passed: 54 (100%)
Failed: 0
Skipped: 0

✓ ALL TESTS PASSED!
======================================================================
```

### Failed Test Example

```
[TEST] create_workflow - Complete workflow: ✗ FAIL - Node/connection mismatch

======================================================================
  Test Summary Report
======================================================================
Total tests executed: 54
Passed: 53 (98%)
Failed: 1

❌ Failed tests:
   - create_workflow - Complete workflow

⚠️  1 test(s) need attention
======================================================================
```

## Validation Findings

The test suite automatically tracks discrepancies between documentation and implementation:

```
⚠️  Validation Findings: 1
   1. [execute_workflow] Manual trigger workflows cannot be executed via REST API - n8n v1.82.3 limitation
```

These findings are logged to help identify:
- Documentation inaccuracies
- Missing functionality
- API behavior differences
- Implementation gaps

## Test Data Cleanup

Tests automatically clean up created workflows unless `runCleanup: false`.

All test workflows are prefixed with `ValidationTest_` for easy identification.

Manual cleanup:
```bash
# List test workflows in n8n UI and delete manually
# Or use list_workflows tool to find and delete by name prefix
```

## Multi-Instance Testing

To test multi-instance routing:

1. Configure multiple environments in `.config.json`
2. Set `runMultiInstanceTests: true` in test flags
3. Run tests

The suite will validate:
- Workflow isolation between instances
- Correct routing to specified instance
- Default instance fallback
- Invalid instance error handling

## Troubleshooting

### Server Not Starting

```bash
# Check if port is in use
lsof -i :3456

# Use different port
MCP_PORT=3457 npm start
```

Update test config:
```javascript
const config = {
  mcpServerUrl: 'http://localhost:3457/mcp',
  healthCheckUrl: 'http://localhost:3457/health',
  ...
};
```

### Connection Errors

Verify n8n instance accessibility:
```bash
curl -H "X-N8N-API-KEY: your_api_key" https://your-n8n-instance.com/api/v1/workflows
```

### API Key Permissions

Ensure your API key has permissions for:
- List workflows
- Create workflows
- Update workflows
- Delete workflows
- Activate/deactivate workflows

### Test Failures

1. **Enable debug mode**: `DEBUG=true node test-workflows-validation.js`
2. **Disable cleanup**: Set `runCleanup: false` to inspect created workflows
3. **Run individual test suites**: Set specific flags to `false` to isolate issues
4. **Check n8n version**: Tests validated against n8n v1.82.3+

## Integration with Test Infrastructure

### Existing Test Suite

The validation tests complement existing tests:

```bash
# Run all tests
npm test                          # Jest unit tests
node test-mcp-tools.js            # MCP tool integration tests
node test-comprehensive.js        # Comprehensive integration tests
node test-workflows-validation.js # Workflows API validation (Story 2.1)
```

### CI/CD Integration

Add to your CI pipeline:

```yaml
# .github/workflows/test.yml
- name: Build project
  run: npm run build

- name: Start MCP server
  run: npm start &

- name: Wait for server
  run: sleep 5

- name: Run validation tests
  run: node test-workflows-validation.js
  env:
    N8N_HOST: ${{ secrets.N8N_HOST }}
    N8N_API_KEY: ${{ secrets.N8N_API_KEY }}
```

## Expected Results

After running validation tests, you should have:

1. **Test Results**: Pass/fail status for all 54 tests
2. **Validation Report**: Any discrepancies between docs and implementation
3. **Coverage Metrics**: Percentage of successful tests per API method
4. **Findings List**: Documentation updates needed

## Next Steps

After completing validation:

1. **Document findings** in Story 2.1 Dev Agent Record
2. **Update validation report** (Task 12)
3. **Address any failures** found during testing
4. **Update documentation** based on validation findings
5. **Proceed to Story 2.2** (Executions API validation)

## Reference

- **Story**: `docs/stories/2.1.validate-workflows-api.md`
- **Epic**: `docs/epic-2-api-implementation-validation.md`
- **API Docs**: `docs/n8n-api-docs/10-WORKFLOWS-API.md`
- **Implementation**: `src/index.ts`, `src/services/n8nApiWrapper.ts`
