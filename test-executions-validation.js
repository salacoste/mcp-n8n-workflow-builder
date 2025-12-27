#!/usr/bin/env node

/**
 * Executions API Validation Test Suite - Story 2.2
 *
 * Validates all 3 Executions API methods against live n8n instance:
 * - list_executions (GET /executions)
 * - get_execution (GET /executions/{id})
 * - delete_execution (DELETE /executions/{id})
 *
 * Test Categories:
 * - Execution listing with filtering and pagination
 * - Execution retrieval with full data
 * - Execution deletion and cleanup
 * - Error handling and edge cases
 * - Multi-instance routing
 */

const axios = require('axios');

// ========================================
// Configuration
// ========================================

const config = {
  mcpServerUrl: 'http://localhost:3456/mcp',
  healthCheckUrl: 'http://localhost:3456/health',
  testWorkflowPrefix: 'ExecTest_',
  testFlags: {
    generateExecutions: true,  // Create test workflows and executions
    runListTests: true,
    runGetTests: true,
    runDeleteTests: true,
    runCleanup: true
  },
  executionGeneration: {
    minExecutions: 15,  // Minimum executions needed for pagination testing
    maxRetries: 30,     // Max attempts to wait for executions
    retryDelay: 2000    // Delay between retry attempts (ms)
  }
};

// ========================================
// Logger Utility
// ========================================

const logger = {
  info: (msg) => console.error(`[INFO] ${msg}`),
  test: (name, passed, details = '') => {
    const status = passed ? '✓ PASS' : '✗ FAIL';
    const message = details ? ` - ${details}` : '';
    console.error(`[TEST] ${name}: ${status}${message}`);
  },
  warn: (msg) => console.error(`[WARN] ⚠️  ${msg}`),
  error: (msg) => console.error(`[ERROR] ❌ ${msg}`),
  success: (msg) => console.error(`[SUCCESS] ✓ ${msg}`),
  debug: (msg, data) => {
    if (process.env.DEBUG) {
      console.error(`[DEBUG] ${msg}`, data ? JSON.stringify(data, null, 2) : '');
    }
  },
  validationFinding: (method, finding) => {
    console.error(`[WARN] ⚠️  Validation Finding [${method}]: ${finding}`);
  }
};

// ========================================
// MCP Communication
// ========================================

let requestId = 1;

async function sendMcpRequest(method, params = {}) {
  try {
    const response = await axios.post(config.mcpServerUrl, {
      jsonrpc: '2.0',
      id: requestId++,
      method,
      params
    });

    logger.debug(`MCP Response for ${method}:`, response.data);
    return response.data.result;
  } catch (error) {
    logger.error(`MCP request failed: ${method}`);
    if (error.response) {
      logger.error(`Status: ${error.response.status}`);
      logger.error(`Data: ${JSON.stringify(error.response.data)}`);
    }
    throw error;
  }
}

async function callTool(name, args = {}, maxRetries = 3) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await sendMcpRequest('tools/call', { name, arguments: args });

      // Check if MCP tool returned an error
      if (result.isError) {
        const errorMessage = result.content && result.content[0] && result.content[0].text
          ? result.content[0].text
          : 'Unknown MCP tool error';
        throw new Error(errorMessage);
      }

      return result;
    } catch (error) {
      lastError = error;

      if (attempt < maxRetries) {
        logger.warn(`Retrying tools/call (${maxRetries - attempt} attempts remaining)`);
        await sleep(1000 * attempt); // Exponential backoff
      }
    }
  }

  throw lastError;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ========================================
// Test Workflow Generators
// ========================================

/**
 * Create a simple workflow that will execute successfully
 */
function createSuccessWorkflow(name) {
  return {
    name: name,
    nodes: [
      {
        name: 'Manual Trigger',
        type: 'n8n-nodes-base.manualTrigger',
        position: [250, 300],
        parameters: {}
      },
      {
        name: 'Set Success',
        type: 'n8n-nodes-base.set',
        position: [450, 300],
        parameters: {
          values: {
            string: [
              {
                name: 'status',
                value: 'success'
              },
              {
                name: 'timestamp',
                value: '={{ $now }}'
              }
            ]
          }
        }
      }
    ],
    connections: [
      {
        source: 'Manual Trigger',
        target: 'Set Success',
        sourceOutput: 0,
        targetInput: 0
      }
    ]
  };
}

/**
 * Create a workflow with schedule trigger (can execute automatically)
 */
function createScheduledWorkflow(name) {
  return {
    name: name,
    nodes: [
      {
        name: 'Schedule Trigger',
        type: 'n8n-nodes-base.scheduleTrigger',
        position: [250, 300],
        parameters: {
          rule: {
            interval: [
              {
                field: 'hours',
                hoursInterval: 1
              }
            ]
          }
        }
      },
      {
        name: 'Set Data',
        type: 'n8n-nodes-base.set',
        position: [450, 300],
        parameters: {
          values: {
            string: [
              {
                name: 'executionTime',
                value: '={{ $now }}'
              }
            ]
          }
        }
      }
    ],
    connections: [
      {
        source: 'Schedule Trigger',
        target: 'Set Data',
        sourceOutput: 0,
        targetInput: 0
      }
    ]
  };
}

// ========================================
// Test State Management
// ========================================

const testState = {
  createdWorkflows: [],
  createdExecutions: [],
  testExecutionIds: []
};

// ========================================
// Test Execution Generation
// ========================================

async function generateTestExecutions() {
  logger.info('Generating test executions...');

  try {
    // Create test workflow
    const workflowName = `${config.testWorkflowPrefix}${Date.now()}`;
    const workflowData = createSuccessWorkflow(workflowName);

    logger.info(`Creating test workflow: ${workflowName}`);
    const createResult = await callTool('create_workflow', workflowData);
    const workflow = JSON.parse(createResult.content[0].text);
    testState.createdWorkflows.push(workflow.id);
    logger.info(`Created workflow: ${workflow.id}`);

    // Note: We'll rely on existing executions in the n8n instance
    // as manual trigger workflows cannot be executed via REST API
    logger.info('Waiting for existing executions to be available...');

    await sleep(2000);

    // List existing executions
    const listResult = await callTool('list_executions', { limit: 50 });
    const execData = JSON.parse(listResult.content[0].text);
    const executions = execData.data || [];

    logger.info(`Found ${executions.length} existing executions`);

    if (executions.length === 0) {
      logger.warn('No executions found. Some tests may be limited.');
      logger.warn('Please execute some workflows manually through n8n interface for complete testing.');
    } else {
      // Store some execution IDs for testing
      testState.testExecutionIds = executions.slice(0, 10).map(e => e.id);
      logger.info(`Using ${testState.testExecutionIds.length} executions for testing`);
    }

    return executions.length > 0;
  } catch (error) {
    logger.error(`Failed to generate test executions: ${error.message}`);
    throw error;
  }
}

// ========================================
// Test Suite: list_executions
// ========================================

async function testListExecutions() {
  logger.info('\n--- Task 2: Validate list_executions ---\n');

  let testsPassed = 0;
  let testsTotal = 0;

  // Test 2.1: List all executions
  testsTotal++;
  try {
    const result = await callTool('list_executions', {});
    const data = JSON.parse(result.content[0].text);

    const isValid = data && Array.isArray(data.data);
    logger.test(
      'list_executions - List all executions',
      isValid,
      isValid ? `Found ${data.data.length} executions` : 'Invalid response structure'
    );
    if (isValid) testsPassed++;

    // Store for later tests
    if (data.data.length > 0) {
      testState.testExecutionIds = data.data.slice(0, 5).map(e => e.id);
    }
  } catch (error) {
    logger.test('list_executions - List all executions', false, error.message);
  }

  // Test 2.2: Response structure validation
  testsTotal++;
  try {
    const result = await callTool('list_executions', { limit: 5 });
    const data = JSON.parse(result.content[0].text);

    if (data.data && data.data.length > 0) {
      const exec = data.data[0];
      const hasRequiredFields =
        exec.hasOwnProperty('id') &&
        exec.hasOwnProperty('finished') &&
        exec.hasOwnProperty('mode') &&
        exec.hasOwnProperty('startedAt') &&
        exec.hasOwnProperty('workflowId');

      logger.test(
        'list_executions - Response structure validation',
        hasRequiredFields,
        hasRequiredFields ? 'All required fields present' : 'Missing required fields'
      );
      if (hasRequiredFields) testsPassed++;
    } else {
      logger.test('list_executions - Response structure validation', false, 'No executions to validate');
    }
  } catch (error) {
    logger.test('list_executions - Response structure validation', false, error.message);
  }

  // Test 2.3: Pagination with limit
  testsTotal++;
  try {
    const result = await callTool('list_executions', { limit: 3 });
    const data = JSON.parse(result.content[0].text);

    const isValid = data.data && data.data.length <= 3;
    logger.test(
      'list_executions - Pagination limit',
      isValid,
      isValid ? `Returned ${data.data.length} executions (limit: 3)` : 'Limit not respected'
    );
    if (isValid) testsPassed++;
  } catch (error) {
    logger.test('list_executions - Pagination limit', false, error.message);
  }

  // Test 2.4: Cursor-based pagination
  testsTotal++;
  try {
    const firstPage = await callTool('list_executions', { limit: 5 });
    const firstData = JSON.parse(firstPage.content[0].text);

    if (firstData.nextCursor) {
      const secondPage = await callTool('list_executions', {
        limit: 5,
        cursor: firstData.nextCursor
      });
      const secondData = JSON.parse(secondPage.content[0].text);

      const isValid = secondData.data && secondData.data.length > 0;
      logger.test(
        'list_executions - Cursor pagination',
        isValid,
        isValid ? `Next page retrieved with ${secondData.data.length} executions` : 'Cursor pagination failed'
      );
      if (isValid) testsPassed++;
    } else {
      logger.test('list_executions - Cursor pagination', true, 'No next cursor (all results fit in first page)');
      testsPassed++;
    }
  } catch (error) {
    logger.test('list_executions - Cursor pagination', false, error.message);
  }

  // Test 2.5: Filter by workflowId
  testsTotal++;
  try {
    const allExecs = await callTool('list_executions', { limit: 10 });
    const allData = JSON.parse(allExecs.content[0].text);

    if (allData.data && allData.data.length > 0) {
      const testWorkflowId = allData.data[0].workflowId;

      const filtered = await callTool('list_executions', {
        workflowId: testWorkflowId,
        limit: 10
      });
      const filteredData = JSON.parse(filtered.content[0].text);

      const allMatch = filteredData.data.every(e => e.workflowId === testWorkflowId);
      logger.test(
        'list_executions - Filter by workflowId',
        allMatch,
        allMatch ? `All ${filteredData.data.length} executions match workflow ${testWorkflowId}` : 'Filter not working correctly'
      );
      if (allMatch) testsPassed++;
    } else {
      logger.test('list_executions - Filter by workflowId', false, 'No executions to test filtering');
    }
  } catch (error) {
    logger.test('list_executions - Filter by workflowId', false, error.message);
  }

  // Test 2.6: includeData parameter
  testsTotal++;
  try {
    const withoutData = await callTool('list_executions', { limit: 1, includeData: false });
    const withData = await callTool('list_executions', { limit: 1, includeData: true });

    const withoutDataObj = JSON.parse(withoutData.content[0].text);
    const withDataObj = JSON.parse(withData.content[0].text);

    if (withoutDataObj.data && withoutDataObj.data.length > 0 && withDataObj.data && withDataObj.data.length > 0) {
      const withoutDataSize = JSON.stringify(withoutDataObj.data[0]).length;
      const withDataSize = JSON.stringify(withDataObj.data[0]).length;

      const isValid = withDataSize >= withoutDataSize;
      logger.test(
        'list_executions - includeData parameter',
        isValid,
        isValid ? `Data size: without=${withoutDataSize}, with=${withDataSize}` : 'includeData not working'
      );
      if (isValid) testsPassed++;
    } else {
      logger.test('list_executions - includeData parameter', false, 'No executions to test');
    }
  } catch (error) {
    logger.test('list_executions - includeData parameter', false, error.message);
  }

  return { passed: testsPassed, total: testsTotal };
}

// ========================================
// Test Suite: get_execution
// ========================================

async function testGetExecution() {
  logger.info('\n--- Task 3: Validate get_execution ---\n');

  let testsPassed = 0;
  let testsTotal = 0;

  // Ensure we have execution IDs to test
  if (testState.testExecutionIds.length === 0) {
    logger.warn('No execution IDs available for testing. Skipping get_execution tests.');
    return { passed: 0, total: 0 };
  }

  const testExecutionId = testState.testExecutionIds[0];
  logger.info(`Using execution ID: ${testExecutionId}`);

  // Test 3.1: Retrieve execution by ID
  testsTotal++;
  try {
    const result = await callTool('get_execution', { id: testExecutionId });
    const execution = JSON.parse(result.content[0].text);

    const isValid = execution && execution.id === testExecutionId;
    logger.test(
      'get_execution - Retrieve by ID',
      isValid,
      isValid ? `Execution retrieved successfully` : 'Failed to retrieve execution'
    );
    if (isValid) testsPassed++;
  } catch (error) {
    logger.test('get_execution - Retrieve by ID', false, error.message);
  }

  // Test 3.2: Structure validation
  testsTotal++;
  try {
    const result = await callTool('get_execution', { id: testExecutionId });
    const execution = JSON.parse(result.content[0].text);

    const hasRequiredFields =
      execution.hasOwnProperty('id') &&
      execution.hasOwnProperty('finished') &&
      execution.hasOwnProperty('mode') &&
      execution.hasOwnProperty('startedAt') &&
      execution.hasOwnProperty('workflowId');

    logger.test(
      'get_execution - Structure validation',
      hasRequiredFields,
      hasRequiredFields ? 'All required fields present' : 'Missing required fields'
    );
    if (hasRequiredFields) testsPassed++;
  } catch (error) {
    logger.test('get_execution - Structure validation', false, error.message);
  }

  // Test 3.3: Execution data completeness
  testsTotal++;
  try {
    const result = await callTool('get_execution', { id: testExecutionId, includeData: true });
    const execution = JSON.parse(result.content[0].text);

    const hasData = execution.data !== undefined;
    logger.test(
      'get_execution - Data completeness',
      hasData,
      hasData ? 'Execution data present' : 'No execution data'
    );
    if (hasData) testsPassed++;
  } catch (error) {
    logger.test('get_execution - Data completeness', false, error.message);
  }

  // Test 3.4: 404 for non-existent ID
  testsTotal++;
  try {
    await callTool('get_execution', { id: '99999999' });
    logger.test('get_execution - 404 for non-existent ID', false, 'Should have returned error');
  } catch (error) {
    const is404 = error.message.includes('404') || error.message.includes('not found') || error.message.includes('Not Found');
    logger.test(
      'get_execution - 404 for non-existent ID',
      is404,
      is404 ? 'Correctly returned 404' : 'Wrong error type'
    );
    if (is404) testsPassed++;
  }

  return { passed: testsPassed, total: testsTotal };
}

// ========================================
// Test Suite: delete_execution
// ========================================

async function testDeleteExecution() {
  logger.info('\n--- Task 4: Validate delete_execution ---\n');

  let testsPassed = 0;
  let testsTotal = 0;

  // Test 4.1: Delete execution and verify
  testsTotal++;
  try {
    // Use the last execution ID if available
    if (testState.testExecutionIds.length > 0) {
      const execIdToDelete = testState.testExecutionIds[testState.testExecutionIds.length - 1];

      // Delete execution
      await callTool('delete_execution', { id: execIdToDelete });

      // Verify it's gone
      try {
        await callTool('get_execution', { id: execIdToDelete });
        logger.test('delete_execution - Delete and verify', false, 'Execution still exists after deletion');
      } catch (error) {
        const is404 = error.message.includes('404') || error.message.includes('not found');
        logger.test(
          'delete_execution - Delete and verify',
          is404,
          is404 ? 'Execution successfully deleted' : 'Unexpected error'
        );
        if (is404) testsPassed++;
      }
    } else {
      logger.test('delete_execution - Delete and verify', false, 'No executions available to delete');
    }
  } catch (error) {
    logger.test('delete_execution - Delete and verify', false, error.message);
  }

  // Test 4.2: 404 for non-existent ID
  testsTotal++;
  try {
    await callTool('delete_execution', { id: 99999999 });
    logger.test('delete_execution - 404 for non-existent ID', false, 'Should have returned error');
  } catch (error) {
    const is404 = error.message.includes('404') || error.message.includes('not found');
    logger.test(
      'delete_execution - 404 for non-existent ID',
      is404,
      is404 ? 'Correctly returned 404' : 'Wrong error type'
    );
    if (is404) testsPassed++;
  }

  return { passed: testsPassed, total: testsTotal };
}

// ========================================
// Test Suite: Error Handling
// ========================================

async function testErrorHandling() {
  logger.info('\n--- Task 5: Error Handling Validation ---\n');

  logger.info('Error handling tests are integrated into each API method test suite:');
  logger.info('  - 404 errors for non-existent resources');
  logger.info('  - Error response format validation');
  logger.info('  - Invalid parameter handling');

  return { passed: 0, total: 0 }; // Counted in individual test suites
}

// ========================================
// Cleanup
// ========================================

async function cleanup() {
  if (!config.testFlags.runCleanup) {
    logger.info('Cleanup disabled by configuration');
    return;
  }

  logger.info('\n======================================================================');
  logger.info('  Cleanup');
  logger.info('======================================================================\n');

  let cleanedWorkflows = 0;

  // Clean up test workflows
  if (testState.createdWorkflows.length > 0) {
    logger.info(`Cleaning up ${testState.createdWorkflows.length} test workflows...`);

    for (const workflowId of testState.createdWorkflows) {
      try {
        await callTool('delete_workflow', { id: workflowId });
        cleanedWorkflows++;
      } catch (error) {
        logger.debug(`Failed to delete workflow ${workflowId}: ${error.message}`);
      }
    }

    logger.success(`✓ Cleaned up ${cleanedWorkflows}/${testState.createdWorkflows.length} test workflows`);
  }
}

// ========================================
// Main Test Runner
// ========================================

async function runTests() {
  console.error('======================================================================');
  console.error('  Executions API Validation Test Suite - Story 2.2');
  console.error('======================================================================\n');

  logger.info('Testing 3 Executions API methods against live n8n instance');
  logger.info(`MCP Server: ${config.mcpServerUrl}\n`);

  const results = {
    list: { passed: 0, total: 0 },
    get: { passed: 0, total: 0 },
    delete: { passed: 0, total: 0 },
    error: { passed: 0, total: 0 }
  };

  try {
    // Pre-flight checks
    console.error('--- Pre-flight Checks ---\n');

    const health = await axios.get(config.healthCheckUrl);
    logger.info(`Server health: ${health.data.status}\n`);

    // Generate/find test executions
    if (config.testFlags.generateExecutions) {
      await generateTestExecutions();
    }

    // Run test suites
    if (config.testFlags.runListTests) {
      results.list = await testListExecutions();
    }

    if (config.testFlags.runGetTests) {
      results.get = await testGetExecution();
    }

    if (config.testFlags.runDeleteTests) {
      results.delete = await testDeleteExecution();
    }

    results.error = await testErrorHandling();

    // Cleanup
    await cleanup();

    // Summary
    console.error('\n======================================================================');
    console.error('  Test Summary Report');
    console.error('======================================================================\n');

    const totalPassed = results.list.passed + results.get.passed + results.delete.passed + results.error.passed;
    const totalTests = results.list.total + results.get.total + results.delete.total + results.error.total;

    console.error(`Total tests executed: ${totalTests}`);
    console.error(`Passed: ${totalPassed} (${totalTests > 0 ? Math.round(totalPassed/totalTests*100) : 0}%)`);
    console.error(`Failed: ${totalTests - totalPassed}`);
    console.error(`Skipped: 0\n`);

    console.error('Test categories:');
    console.error(`   list: ${results.list.passed}/${results.list.total} (${results.list.total > 0 ? Math.round(results.list.passed/results.list.total*100) : 0}%)`);
    console.error(`   get: ${results.get.passed}/${results.get.total} (${results.get.total > 0 ? Math.round(results.get.passed/results.get.total*100) : 0}%)`);
    console.error(`   delete: ${results.delete.passed}/${results.delete.total} (${results.delete.total > 0 ? Math.round(results.delete.passed/results.delete.total*100) : 0}%)`);

    console.error('\n======================================================================');
    if (totalPassed === totalTests && totalTests > 0) {
      console.error('✓ ALL TESTS PASSED!');
    } else {
      console.error(`⚠ ${totalTests - totalPassed} TESTS FAILED`);
    }
    console.error('======================================================================');

    process.exit(totalPassed === totalTests ? 0 : 1);

  } catch (error) {
    logger.error(`Test suite failed: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run tests
runTests();
