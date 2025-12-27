# Testing Infrastructure Guide

Complete guide to testing the n8n MCP Workflow Builder, including test scripts, running tests, and writing new tests.

---

## Quick Start

Run comprehensive tests:

```bash
# Build the project
npm run build

# Start MCP server (separate terminal)
npm start

# Run all tests (new terminal)
node test-mcp-tools.js
```

---

## Table of Contents

1. [Test Scripts Overview](#test-scripts-overview)
2. [Running Tests](#running-tests)
3. [Test Configuration](#test-configuration)
4. [Interpreting Test Results](#interpreting-test-results)
5. [Writing New Tests](#writing-new-tests)
6. [Unit Testing with Jest](#unit-testing-with-jest)
7. [Integration Testing](#integration-testing)
8. [Best Practices](#best-practices)

---

## Test Scripts Overview

### Main Test Suite

**`test-mcp-tools.js`** - Comprehensive MCP tool testing

**Coverage:**
- ✅ Workflow CRUD operations (create, read, update, delete)
- ✅ Workflow activation/deactivation
- ✅ Tag management (create, list, update, delete)
- ✅ Execution management (list, get, delete, retry)
- ✅ Multi-instance routing
- ✅ Error handling validation
- ✅ Automatic cleanup

**Configuration flags:**
```javascript
const testFlags = {
  runWorkflowTests: true,    // Test workflow operations
  runTagTests: true,          // Test tag operations
  runExecutionTests: true,    // Test execution operations
  runCleanup: true            // Clean up test data (set false to keep)
};
```

### Specialized Test Scripts

**Credential Tests:**
- `test-credentials-all-methods-direct.js` - All credential operations
- `test-credentials-api-direct.js` - Direct API credential testing
- `test-credentials-create.js` - Credential creation validation
- `test-credentials-delete-and-schema.js` - Deletion and schema testing
- `test-credentials-informative-messages.js` - Error message validation

**Workflow Tests:**
- `test-activate-methods.js` - Workflow activation testing
- `test-patch-workflow.js` - Workflow update operations
- `test-workflows-validation.js` - Workflow validation

**Tag Tests:**
- `test-check-tags.js` - Tag existence validation
- `test-create-tag-simple.js` - Basic tag creation
- `test-different-tag-names.js` - Tag naming validation
- `test-tags-validation.js` - Comprehensive tag testing

**Execution Tests:**
- `test-executions-validation.js` - Execution operation validation
- `test-retry-quick.js` - Retry mechanism testing

**Integration Tests:**
- `test-comprehensive.js` - Full integration testing
- `test-e2e-all-tools.js` - End-to-end tool testing

### Unit Tests (Jest)

**Location:** `src/services/__tests__/`

**Coverage:**
- Service layer testing
- API wrapper validation
- Configuration loading
- Error handling
- Multi-instance logic

---

## Running Tests

### Prerequisites

1. **n8n instance running and accessible:**
   ```bash
   # Check n8n is accessible
   curl https://your-n8n-host/api/v1/workflows \
     -H "X-N8N-API-KEY: your_api_key"
   ```

2. **Configuration file created:**
   - `.config.json` for multi-instance testing
   - `.env` for single-instance testing

3. **MCP server built:**
   ```bash
   npm run build
   ```

4. **MCP server running:**
   ```bash
   # Terminal 1: Start server
   npm start

   # Or with debug mode
   DEBUG=true npm start
   ```

### Running Main Test Suite

```bash
# Terminal 2: Run tests
node test-mcp-tools.js
```

**Expected Output:**
```
🧪 MCP n8n Workflow Builder - Comprehensive Test Suite
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Test Configuration
  ├─ MCP Server URL: http://localhost:3456/mcp
  ├─ Health Check URL: http://localhost:3456/health
  ├─ Test Workflow Name: Test Workflow MCP
  └─ Cleanup: Enabled

🏥 Health Check...
  ✅ MCP server is healthy

🔧 Testing Workflow Operations...
  ✅ Create workflow
  ✅ List workflows
  ✅ Get workflow details
  ✅ Update workflow
  ✅ Activate workflow
  ✅ Deactivate workflow
  ✅ Delete workflow

🏷️  Testing Tag Operations...
  ✅ Create tag
  ✅ List tags
  ✅ Get tag details
  ✅ Update tag
  ✅ Delete tag

🔄 Testing Execution Operations...
  ✅ List executions
  ✅ Get execution details
  ✅ Delete execution

🧹 Cleanup...
  ✅ Test data removed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ All tests passed successfully!
```

### Running Specific Test Categories

**Workflow tests only:**
```javascript
// Edit test-mcp-tools.js
const testFlags = {
  runWorkflowTests: true,
  runTagTests: false,       // Disable
  runExecutionTests: false, // Disable
  runCleanup: true
};
```

**Keep test data for inspection:**
```javascript
const testFlags = {
  runWorkflowTests: true,
  runTagTests: true,
  runExecutionTests: true,
  runCleanup: false  // Disable cleanup
};
```

### Running Credential Tests

```bash
# Test all credential operations
node test-credentials-all-methods-direct.js

# Test credential creation
node test-credentials-create.js

# Test schema validation
node test-credentials-delete-and-schema.js
```

### Running Unit Tests (Jest)

```bash
# Run all unit tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run specific test file
npm test -- src/services/__tests__/environmentManager.test.ts
```

---

## Test Configuration

### test-mcp-tools.js Configuration

**Location:** Top of `test-mcp-tools.js` file

```javascript
const config = {
  // MCP server connection
  mcpServerUrl: 'http://localhost:3456/mcp',
  healthCheckUrl: 'http://localhost:3456/health',

  // Test data
  testWorkflowName: 'Test Workflow MCP',
  testTagName: 'test-tag-' + Date.now(),

  // Test flags
  testFlags: {
    runWorkflowTests: true,
    runTagTests: true,
    runExecutionTests: true,
    runCleanup: true
  },

  // Timeout settings
  requestTimeout: 30000,  // 30 seconds

  // Multi-instance testing (optional)
  testInstance: 'staging'  // Or undefined for default
};
```

### Environment Variables for Tests

```bash
# Set test instance
TEST_INSTANCE=staging node test-mcp-tools.js

# Enable debug output
DEBUG=true node test-mcp-tools.js

# Custom MCP server port
MCP_PORT=58921 npm start
# Then update mcpServerUrl in test config
```

### Multi-Instance Test Configuration

**Testing specific instance:**

```javascript
// In test script
const params = {
  instance: 'staging',  // Test staging environment
  name: 'Test Workflow',
  // ... other parameters
};
```

**Testing all instances:**

```javascript
const instances = ['production', 'staging', 'development'];

for (const instance of instances) {
  console.log(`\nTesting instance: ${instance}`);

  // Run tests for this instance
  await testWorkflowOperations(instance);
  await testTagOperations(instance);
  await testExecutionOperations(instance);
}
```

---

## Interpreting Test Results

### Success Indicators

```
✅ Create workflow
✅ List workflows
✅ Get workflow details
```

**Meaning:**
- Operation completed successfully
- No errors encountered
- Data validated correctly
- Response format correct

### Failure Patterns

```
❌ Create workflow
   Error: Request failed with status code 401
   Authentication failed
```

**Analysis:**
- Operation failed
- HTTP status code provided (401 = auth error)
- Error message explains cause
- Stack trace available in debug mode

### Common Test Errors

**Authentication failures:**
```
❌ List workflows
   Error: Request failed with status code 401
   Unauthorized: Invalid API key
```
**Solution:** Check API key in configuration

**Connection refused:**
```
❌ Health check failed
   Error: connect ECONNREFUSED 127.0.0.1:3456
```
**Solution:** Start MCP server (`npm start`)

**Validation errors:**
```
❌ Create workflow
   Error: Workflow validation failed
   Missing required trigger node
```
**Solution:** Add valid trigger node to workflow

### Performance Metrics

Tests include timing information:

```
✅ Create workflow (234ms)
✅ List workflows (45ms)
✅ Get workflow details (123ms)
```

**Performance thresholds:**
- `< 100ms` - Excellent (cached or simple operation)
- `100-500ms` - Good (typical API call)
- `500-2000ms` - Acceptable (complex operation)
- `> 2000ms` - Slow (investigate)

---

## Writing New Tests

### Test Structure

```javascript
// test-my-feature.js

const axios = require('axios');

const config = {
  mcpServerUrl: 'http://localhost:3456/mcp',
  healthCheckUrl: 'http://localhost:3456/health'
};

async function runTests() {
  console.log('🧪 Testing My Feature');

  try {
    // 1. Health check
    await healthCheck();

    // 2. Test operations
    await testOperation1();
    await testOperation2();

    // 3. Cleanup
    await cleanup();

    console.log('✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

async function healthCheck() {
  const response = await axios.get(config.healthCheckUrl);
  if (response.data.status !== 'ok') {
    throw new Error('Server not healthy');
  }
  console.log('✅ Health check passed');
}

async function testOperation1() {
  const response = await axios.post(config.mcpServerUrl, {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: 'my_tool',
      arguments: {
        // ... tool parameters
      }
    }
  });

  // Validate response
  if (response.data.error) {
    throw new Error(response.data.error.message);
  }

  const result = JSON.parse(response.data.result.content[0].text);

  // Assertions
  if (!result.id) {
    throw new Error('Missing result ID');
  }

  console.log('✅ Operation 1 passed');
}

async function cleanup() {
  // Delete test data
  console.log('🧹 Cleaning up...');
}

// Run tests
runTests();
```

### Using Test Utilities

```javascript
// Common test helper functions

async function callTool(toolName, args) {
  const response = await axios.post(config.mcpServerUrl, {
    jsonrpc: '2.0',
    id: Date.now(),
    method: 'tools/call',
    params: {
      name: toolName,
      arguments: args
    }
  });

  if (response.data.error) {
    throw new Error(response.data.error.message);
  }

  return JSON.parse(response.data.result.content[0].text);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(
      `${message}\nExpected: ${expected}\nActual: ${actual}`
    );
  }
}
```

### Test Cleanup Procedures

```javascript
async function cleanup() {
  const createdResources = [];

  try {
    // Track created resources
    const workflow = await createWorkflow();
    createdResources.push({ type: 'workflow', id: workflow.id });

    const tag = await createTag();
    createdResources.push({ type: 'tag', id: tag.id });

    // Run tests...

  } finally {
    // Always cleanup, even if tests fail
    console.log('🧹 Cleaning up test data...');

    for (const resource of createdResources.reverse()) {
      try {
        if (resource.type === 'workflow') {
          await deleteWorkflow(resource.id);
        } else if (resource.type === 'tag') {
          await deleteTag(resource.id);
        }
      } catch (error) {
        console.warn(`Failed to cleanup ${resource.type} ${resource.id}`);
      }
    }
  }
}
```

---

## Unit Testing with Jest

### Test File Structure

```typescript
// src/services/__tests__/n8nApiWrapper.test.ts

import { N8NApiWrapper } from '../n8nApiWrapper';
import { EnvironmentManager } from '../environmentManager';

describe('N8NApiWrapper', () => {
  let apiWrapper: N8NApiWrapper;

  beforeEach(() => {
    // Setup
    apiWrapper = new N8NApiWrapper();
  });

  afterEach(() => {
    // Cleanup
    jest.clearAllMocks();
  });

  describe('listWorkflows', () => {
    it('should list workflows successfully', async () => {
      // Test implementation
      const result = await apiWrapper.listWorkflows({
        instance: 'test',
        limit: 10
      });

      expect(result).toHaveProperty('data');
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should handle errors gracefully', async () => {
      // Error handling test
      await expect(
        apiWrapper.listWorkflows({ instance: 'invalid' })
      ).rejects.toThrow('Instance not found');
    });
  });
});
```

### Running Specific Tests

```bash
# Run tests matching pattern
npm test -- --testNamePattern="listWorkflows"

# Run specific file
npm test -- n8nApiWrapper.test.ts

# Run with coverage
npm run test:coverage

# Update snapshots
npm test -- --updateSnapshot
```

### Test Coverage Requirements

**Minimum coverage thresholds:**
- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%

**Check coverage:**
```bash
npm run test:coverage

# View HTML report
open coverage/lcov-report/index.html
```

---

## Integration Testing

### End-to-End Test Flow

```javascript
// test-e2e-workflow-lifecycle.js

async function testWorkflowLifecycle() {
  console.log('🔄 Testing complete workflow lifecycle...');

  let workflowId;
  let executionId;

  try {
    // 1. Create workflow
    console.log('1️⃣ Creating workflow...');
    const workflow = await createWorkflow({
      name: 'E2E Test Workflow',
      nodes: [...],
      connections: [...]
    });
    workflowId = workflow.id;
    console.log(`✅ Created workflow ${workflowId}`);

    // 2. Add tags
    console.log('2️⃣ Adding tags...');
    const tag = await createTag('e2e-test');
    await updateWorkflow(workflowId, {
      tags: [tag.id]
    });
    console.log('✅ Tags added');

    // 3. Activate workflow
    console.log('3️⃣ Activating workflow...');
    await activateWorkflow(workflowId);
    console.log('✅ Workflow activated');

    // 4. Execute workflow (if webhook)
    console.log('4️⃣ Executing workflow...');
    const execution = await executeWorkflow(workflowId);
    executionId = execution.id;
    console.log(`✅ Execution started: ${executionId}`);

    // 5. Monitor execution
    console.log('5️⃣ Monitoring execution...');
    await waitForExecution(executionId);
    console.log('✅ Execution completed');

    // 6. Verify results
    console.log('6️⃣ Verifying results...');
    const executionDetails = await getExecution(executionId);
    if (executionDetails.finished) {
      console.log('✅ Workflow executed successfully');
    }

  } finally {
    // Cleanup
    if (workflowId) await deleteWorkflow(workflowId);
    if (executionId) await deleteExecution(executionId);
  }
}
```

### Multi-Instance Integration Tests

```javascript
async function testMultiInstanceIntegration() {
  const instances = ['production', 'staging', 'development'];

  for (const instance of instances) {
    console.log(`\n📍 Testing instance: ${instance}`);

    // Test instance-specific operations
    await testInstanceWorkflows(instance);
    await testInstanceTags(instance);
    await testInstanceExecutions(instance);

    console.log(`✅ Instance ${instance} tests passed`);
  }
}
```

---

## Best Practices

### Test Isolation

```javascript
// ✅ Good - Tests are independent
test('create workflow', async () => {
  const workflow = await createWorkflow({
    name: 'Test-' + Date.now()  // Unique name
  });
  await deleteWorkflow(workflow.id);  // Cleanup
});

// ❌ Bad - Tests depend on each other
let sharedWorkflowId;

test('create workflow', async () => {
  const workflow = await createWorkflow();
  sharedWorkflowId = workflow.id;  // Shared state
});

test('update workflow', async () => {
  await updateWorkflow(sharedWorkflowId);  // Depends on previous test
});
```

### Cleanup After Tests

```javascript
// ✅ Good - Always cleanup
async function testWithCleanup() {
  let workflowId;

  try {
    workflowId = await createWorkflow();
    // Run tests...
  } finally {
    if (workflowId) {
      await deleteWorkflow(workflowId);
    }
  }
}
```

### Meaningful Test Names

```javascript
// ✅ Good - Descriptive names
test('should create workflow with valid trigger node', async () => {});
test('should reject workflow without trigger node', async () => {});
test('should handle API authentication errors gracefully', async () => {});

// ❌ Bad - Unclear names
test('test1', async () => {});
test('workflow', async () => {});
test('it works', async () => {});
```

### Comprehensive Assertions

```javascript
// ✅ Good - Thorough validation
const workflow = await createWorkflow();

expect(workflow).toHaveProperty('id');
expect(workflow).toHaveProperty('name');
expect(workflow).toHaveProperty('active');
expect(workflow.active).toBe(false);
expect(workflow.nodes).toBeInstanceOf(Array);
expect(workflow.nodes.length).toBeGreaterThan(0);

// ❌ Bad - Minimal validation
const workflow = await createWorkflow();
expect(workflow).toBeDefined();
```

### Edge Case Coverage

```javascript
// Test various scenarios
describe('workflow creation', () => {
  it('should create minimal workflow', async () => {});
  it('should create complex workflow with many nodes', async () => {});
  it('should handle empty connections', async () => {});
  it('should reject invalid node types', async () => {});
  it('should handle special characters in names', async () => {});
});
```

---

## Next Steps

- **[Error Reference](error-reference.md)** - Debug test failures
- **[Debug Mode](debug-mode.md)** - Enable detailed logging
- **[Contributing](../about/contributing.md)** - Contribute tests
- **[FAQ](faq.md)** - Testing questions

---

**Document Version:** 1.0
**Last Updated:** December 2025
**Related:** [Debug Mode](debug-mode.md), [Error Reference](error-reference.md), [Contributing](../about/contributing.md)
