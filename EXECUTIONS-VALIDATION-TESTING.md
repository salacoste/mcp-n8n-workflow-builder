# Executions API Validation Testing Guide

**Story:** 2.2 - Validate & Test Executions API
**Status:** In Progress
**Test Suite:** `test-executions-validation.js`

## Overview

Comprehensive validation testing for all 3 Executions API methods implemented in the n8n Workflow Builder MCP Server:

- `list_executions` - List and filter execution history
- `get_execution` - Retrieve detailed execution information
- `delete_execution` - Remove execution records

## Prerequisites

### 1. Running n8n Instance

You need access to a live n8n instance (v1.82.3 or later) with:
- Valid API key
- Existing workflow executions (for comprehensive testing)

**Recommended:** Execute some workflows manually through the n8n web interface before running tests to ensure test data availability.

### 2. Environment Configuration

**Option A: Multi-instance configuration (`.config.json`)**

```json
{
  "environments": {
    "production": {
      "n8n_host": "https://your-n8n-instance.com",
      "n8n_api_key": "your_api_key_here"
    }
  },
  "defaultEnv": "production"
}
```

**Option B: Single instance configuration (`.env`)**

```env
N8N_HOST=https://your-n8n-instance.com
N8N_API_KEY=your_api_key_here
```

**Important:** Both `.config.json` and `.env` are gitignored for security.

### 3. Built Project

```bash
npm run build
```

## Running the Tests

### Basic Test Execution

```bash
# 1. Build the project
npm run build

# 2. Start the MCP server in background
npm start &

# 3. Wait for server to start (2-3 seconds)
sleep 3

# 4. Run executions validation tests
node test-executions-validation.js
```

### Test Configuration

Edit `test-executions-validation.js` to customize test behavior:

```javascript
const config = {
  testFlags: {
    generateExecutions: true,  // Create test workflows (note: executions must be manual)
    runListTests: true,        // Test list_executions method
    runGetTests: true,         // Test get_execution method
    runDeleteTests: true,      // Test delete_execution method
    runCleanup: true           // Clean up test data after tests
  }
};
```

## Test Categories

### 1. list_executions Tests (6 tests)

Tests the execution listing and filtering functionality:

- **List all executions** - Basic listing functionality
- **Response structure** - Validate required fields (id, finished, mode, startedAt, workflowId)
- **Pagination limit** - Test limit parameter
- **Cursor pagination** - Test cursor-based pagination with nextCursor
- **Filter by workflowId** - Test workflow-specific filtering
- **includeData parameter** - Test data inclusion/exclusion

**Expected Fields in Response:**
```json
{
  "data": [
    {
      "id": "string",
      "finished": boolean,
      "mode": "string",
      "startedAt": "ISO 8601 date",
      "stoppedAt": "ISO 8601 date or null",
      "workflowId": "string"
    }
  ],
  "nextCursor": "string or null"
}
```

### 2. get_execution Tests (4 tests)

Tests individual execution retrieval:

- **Retrieve by ID** - Get specific execution
- **Structure validation** - Verify all required fields present
- **Data completeness** - Test includeData parameter
- **404 handling** - Non-existent execution IDs

**Expected Response:**
```json
{
  "id": "string",
  "finished": boolean,
  "mode": "string",
  "startedAt": "ISO 8601 date",
  "stoppedAt": "ISO 8601 date",
  "workflowId": "string",
  "data": { ... }  // When includeData=true
}
```

### 3. delete_execution Tests (2 tests)

Tests execution deletion:

- **Delete and verify** - Delete execution and confirm removal
- **404 handling** - Non-existent execution IDs

### 4. Error Handling Validation

Integrated across all test categories:
- 404 errors for non-existent resources
- Error response format validation
- Invalid parameter handling

## Understanding Test Results

### Success Output Example

```
======================================================================
  Executions API Validation Test Suite - Story 2.2
======================================================================

[INFO] Testing 3 Executions API methods against live n8n instance

--- Pre-flight Checks ---
[INFO] Server health: ok
[INFO] Found 25 existing executions

--- Task 2: Validate list_executions ---
[TEST] list_executions - List all executions: ✓ PASS - Found 25 executions
[TEST] list_executions - Response structure validation: ✓ PASS
[TEST] list_executions - Pagination limit: ✓ PASS - Returned 3 executions (limit: 3)
[TEST] list_executions - Cursor pagination: ✓ PASS - Next page retrieved
[TEST] list_executions - Filter by workflowId: ✓ PASS
[TEST] list_executions - includeData parameter: ✓ PASS

--- Task 3: Validate get_execution ---
[TEST] get_execution - Retrieve by ID: ✓ PASS
[TEST] get_execution - Structure validation: ✓ PASS
[TEST] get_execution - Data completeness: ✓ PASS
[TEST] get_execution - 404 for non-existent ID: ✓ PASS

--- Task 4: Validate delete_execution ---
[TEST] delete_execution - Delete and verify: ✓ PASS
[TEST] delete_execution - 404 for non-existent ID: ✓ PASS

======================================================================
  Test Summary Report
======================================================================
Total tests executed: 12
Passed: 12 (100%)
Failed: 0

✓ ALL TESTS PASSED!
======================================================================
```

### Result Categories

- **✓ PASS** - Test passed successfully
- **✗ FAIL** - Test failed (see details)
- **⚠ WARN** - Warning or validation finding (not a failure)

## Important Notes

### Execution Generation Limitations

**Critical:** Manual trigger workflows cannot be executed via REST API (n8n v1.82.3 limitation).

The test suite will:
1. Create test workflows
2. Use existing executions in your n8n instance for testing
3. Recommend executing workflows manually if no executions exist

**Recommendation:** Before running tests, execute some workflows manually through the n8n web interface to ensure adequate test data.

### Cursor-Based Pagination

Unlike offset-based pagination, cursor-based pagination:
- Uses opaque cursor strings (not numeric offsets)
- Cursors obtained from `nextCursor` in previous response
- More efficient for large datasets
- Cursors may expire over time

### Data Size Considerations

When `includeData=true`:
- Response payloads can be very large (>1MB for complex workflows)
- Use judiciously in production
- Default behavior (`includeData=false`) returns minimal metadata only

## Troubleshooting

### Issue: "No executions found"

**Symptom:**
```
[WARN] No executions found. Some tests may be limited.
[WARN] Please execute some workflows manually through n8n interface for complete testing.
```

**Solution:**
1. Open your n8n web interface
2. Execute some workflows manually
3. Wait a few seconds for executions to complete
4. Re-run the validation tests

### Issue: "Connection refused"

**Symptom:**
```
[ERROR] MCP request failed: tools/call
Error: connect ECONNREFUSED 127.0.0.1:3456
```

**Solution:**
1. Ensure MCP server is running: `npm start`
2. Check if port 3456 is available
3. Set `MCP_PORT` environment variable if needed

### Issue: "401 Unauthorized"

**Symptom:**
```
[ERROR] API error: 401 Unauthorized
```

**Solution:**
1. Verify API key in `.config.json` or `.env`
2. Ensure API key has proper permissions
3. Check n8n instance URL is correct

### Issue: Cursor pagination not working

**Symptom:**
```
[TEST] list_executions - Cursor pagination: ✗ FAIL
```

**Possible Causes:**
1. Not enough executions to paginate (need >limit executions)
2. Cursor may have expired (run tests faster)
3. n8n version may not support cursor pagination

**Solution:**
- Create more workflow executions
- Run tests immediately after execution generation
- Check n8n API documentation for your version

## Test Data Cleanup

By default, tests clean up after themselves:

```javascript
testFlags: {
  runCleanup: true  // Automatically delete test workflows
}
```

**What gets cleaned up:**
- Test workflows created during test execution

**What doesn't get cleaned up:**
- Executions (some may be deleted during delete tests)
- Existing workflows and executions

**To preserve test data:**
```javascript
testFlags: {
  runCleanup: false  // Keep test workflows
}
```

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Executions API Validation

on:
  push:
    branches: [main, develop]
  pull_request:

jobs:
  validate-executions-api:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build project
        run: npm run build

      - name: Create config
        run: |
          echo '{
            "environments": {
              "production": {
                "n8n_host": "${{ secrets.N8N_HOST }}",
                "n8n_api_key": "${{ secrets.N8N_API_KEY }}"
              }
            },
            "defaultEnv": "production"
          }' > .config.json

      - name: Start MCP server
        run: npm start &

      - name: Wait for server
        run: sleep 5

      - name: Run executions validation tests
        run: node test-executions-validation.js
```

## Advanced Usage

### Debug Mode

Enable detailed logging:

```bash
DEBUG=true node test-executions-validation.js
```

Shows:
- MCP request/response details
- Internal test state
- Detailed error information

### Custom Port

```bash
MCP_PORT=8080 npm start &
```

Then update test configuration:
```javascript
const config = {
  mcpServerUrl: 'http://localhost:8080/mcp',
  healthCheckUrl: 'http://localhost:8080/health'
};
```

### Testing Specific Categories

Disable test categories:

```javascript
testFlags: {
  runListTests: true,   // Only run list tests
  runGetTests: false,   // Skip get tests
  runDeleteTests: false // Skip delete tests
}
```

## Expected Test Coverage

Based on Story 2.2 acceptance criteria:

- ✅ **AC 1:** All 3 Executions API methods validated
- ✅ **AC 2:** Automated test suite created
- ✅ **AC 3:** Request/response formats verified
- ✅ **AC 4:** Multi-instance routing tested
- ✅ **AC 5:** Filtering and pagination validated
- ✅ **AC 6:** Execution data structure verified
- ✅ **AC 7:** Error handling validated
- ✅ **AC 8:** Validation report created
- ✅ **AC 9:** Integration with test infrastructure
- ✅ **AC 10:** Edge cases tested

## Documentation References

- **API Documentation:** `docs/n8n-api-docs/20-EXECUTIONS-API.md`
- **Pagination Guide:** `docs/n8n-api-docs/03-PAGINATION.md`
- **Implementation:** `src/services/n8nApiWrapper.ts`
- **MCP Tool Definitions:** `src/index.ts` (lines 479-541)

## Support

For issues or questions:
- Check `docs/bugs/` directory for known issues
- Review Story 2.2 in `docs/stories/2.2.validate-executions-api.md`
- Consult `CLAUDE.md` for implementation details
