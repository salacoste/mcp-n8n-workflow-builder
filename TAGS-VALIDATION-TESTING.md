# Tags API Validation Testing Guide

**Story:** 2.3 - Validate & Test Tags API
**Status:** In Progress
**Test Suite:** `test-tags-validation.js`

## Overview

Comprehensive validation testing for all 5 Tags API methods implemented in the n8n Workflow Builder MCP Server:

- `get_tags` - List all tags with cursor-based pagination
- `get_tag` - Retrieve specific tag by ID
- `create_tag` - Create new tags
- `update_tag` - Update tag names
- `delete_tag` - Remove tags

## Prerequisites

### 1. Running n8n Instance

You need access to a live n8n instance (v1.82.3 or later) with:
- Valid API key
- Permissions to create, update, and delete tags

### 2. Environment Configuration

Same as previous test suites - use either `.config.json` or `.env` file.

### 3. Built Project

```bash
npm run build
```

## Running the Tests

### Basic Test Execution

```bash
# 1. Build the project
npm run build

# 2. Start the MCP server (if not already running)
npm start &

# 3. Wait for server to start
sleep 3

# 4. Run tags validation tests
node test-tags-validation.js
```

## Test Categories

### 1. get_tags Tests (4 tests)

Tests tag listing and pagination:
- List all tags
- Response structure validation
- Pagination limit
- Cursor-based pagination

### 2. create_tag Tests (3 tests)

Tests tag creation:
- Create tag with unique name
- Response structure validation
- Duplicate name handling (409 error expected)

### 3. get_tag Tests (3 tests)

Tests individual tag retrieval:
- Retrieve tag by ID
- Structure validation
- 404 error for non-existent ID

### 4. update_tag Tests (2 tests)

Tests tag name updates:
- Update tag name
- 404 error for non-existent ID

### 5. delete_tag Tests (2 tests)

Tests tag deletion:
- Delete and verify removal
- 404 error for non-existent ID

## Expected Response Structures

### Tag Object

```json
{
  "id": "string",
  "name": "string",
  "createdAt": "ISO 8601 date",
  "updatedAt": "ISO 8601 date"
}
```

### List Response

```json
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "createdAt": "ISO 8601 date",
      "updatedAt": "ISO 8601 date"
    }
  ],
  "nextCursor": "string or null"
}
```

## Key Testing Points

### Tag Name Uniqueness

Tags must have unique names within an n8n instance. Attempting to create a duplicate will result in a 409 Conflict error.

### Cursor-Based Pagination

Similar to executions API:
- Uses opaque cursor strings
- `nextCursor` field indicates more results available
- Efficient for large tag lists

### Error Handling

Tests validate proper error responses:
- 404 Not Found for non-existent tag IDs
- 409 Conflict for duplicate tag names
- Proper error message format

## Test Data Cleanup

The test suite automatically cleans up all created tags after completion (unless `runCleanup: false`).

**Cleanup behavior:**
- All tags created during tests are deleted
- Uses unique prefix `TagTest_` for identification
- Automatic retry logic for failed deletions

## Troubleshooting

### Issue: "Duplicate name" errors

If tests fail with duplicate name errors, there may be leftover test tags from previous runs.

**Solution:**
```bash
# Manually clean up test tags through n8n interface
# Or set runCleanup: true and re-run tests
```

### Issue: 409 Conflict test fails

If the duplicate name test doesn't get a 409 error, check n8n version compatibility.

**Possible causes:**
- Some n8n versions may allow duplicate tag names
- API behavior may differ between versions

## CI/CD Integration

Same GitHub Actions pattern as previous test suites.

## Documentation References

- **API Documentation:** `docs/n8n-api-docs/30-TAGS-API.md`
- **Pagination Guide:** `docs/n8n-api-docs/03-PAGINATION.md`
- **Implementation:** `src/services/n8nApiWrapper.ts`
- **MCP Tool Definitions:** `src/index.ts`

## Expected Coverage

Total Tests: 14
- get_tags: 4 tests
- create_tag: 3 tests
- get_tag: 3 tests
- update_tag: 2 tests
- delete_tag: 2 tests

**Target:** 100% pass rate
