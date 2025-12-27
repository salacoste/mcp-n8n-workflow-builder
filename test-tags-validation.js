#!/usr/bin/env node

/**
 * Tags API Validation Test Suite - Story 2.3
 *
 * Validates all 5 Tags API methods against live n8n instance:
 * - get_tags (GET /tags) - List all tags with pagination
 * - get_tag (GET /tags/{id}) - Get specific tag
 * - create_tag (POST /tags) - Create new tag
 * - update_tag (PUT /tags/{id}) - Update tag name
 * - delete_tag (DELETE /tags/{id}) - Delete tag
 *
 * Test Categories:
 * - Tag listing with pagination
 * - Tag CRUD operations
 * - Tag name uniqueness validation
 * - Error handling and edge cases
 * - Multi-instance routing
 */

const axios = require('axios');
const crypto = require('crypto');

// ========================================
// Configuration
// ========================================

const config = {
  mcpServerUrl: 'http://localhost:3456/mcp',
  healthCheckUrl: 'http://localhost:3456/health',
  testTagPrefix: 'ValidTest',
  testFlags: {
    runListTests: true,
    runGetTests: true,
    runCreateTests: true,
    runUpdateTests: true,
    runDeleteTests: true,
    runCleanup: true
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

  // Don't retry create operations to avoid 409 conflicts
  const isCreateOperation = name === 'create_tag' || name === 'create_workflow';
  const actualRetries = isCreateOperation ? 1 : maxRetries;

  for (let attempt = 1; attempt <= actualRetries; attempt++) {
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

      // Don't retry on 409 Conflict errors (resource already exists)
      if (error.message && error.message.includes('409')) {
        throw error;
      }

      if (attempt < actualRetries) {
        logger.warn(`Retrying tools/call (${actualRetries - attempt} attempts remaining)`);
        await sleep(1000 * attempt);
      }
    }
  }

  throw lastError;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ========================================
// Test State Management
// ========================================

const testState = {
  createdTags: [],
  testTagIds: []
};

// ========================================
// Test Suite: get_tags (List Tags)
// ========================================

async function testGetTags() {
  logger.info('\n--- Task 2: Validate get_tags ---\n');

  let testsPassed = 0;
  let testsTotal = 0;

  // Test 2.1: List all tags
  testsTotal++;
  try {
    const result = await callTool('get_tags', {});
    const data = JSON.parse(result.content[0].text);

    const isValid = data && Array.isArray(data.data);
    logger.test(
      'get_tags - List all tags',
      isValid,
      isValid ? `Found ${data.data.length} tags` : 'Invalid response structure'
    );
    if (isValid) testsPassed++;

    // Store tag IDs for later tests
    if (data.data.length > 0) {
      testState.testTagIds = data.data.slice(0, 3).map(t => t.id);
    }
  } catch (error) {
    logger.test('get_tags - List all tags', false, error.message);
  }

  // Test 2.2: Response structure validation
  testsTotal++;
  try {
    const result = await callTool('get_tags', { limit: 5 });
    const data = JSON.parse(result.content[0].text);

    if (data.data && data.data.length > 0) {
      const tag = data.data[0];
      const hasRequiredFields =
        tag.hasOwnProperty('id') &&
        tag.hasOwnProperty('name') &&
        tag.hasOwnProperty('createdAt') &&
        tag.hasOwnProperty('updatedAt');

      logger.test(
        'get_tags - Response structure validation',
        hasRequiredFields,
        hasRequiredFields ? 'All required fields present' : 'Missing required fields'
      );
      if (hasRequiredFields) testsPassed++;
    } else {
      logger.test('get_tags - Response structure validation', true, 'No tags to validate (empty list is valid)');
      testsPassed++;
    }
  } catch (error) {
    logger.test('get_tags - Response structure validation', false, error.message);
  }

  // Test 2.3: Pagination with limit
  testsTotal++;
  try {
    const result = await callTool('get_tags', { limit: 3 });
    const data = JSON.parse(result.content[0].text);

    const isValid = data.data && data.data.length <= 3;
    logger.test(
      'get_tags - Pagination limit',
      isValid,
      isValid ? `Returned ${data.data.length} tags (limit: 3)` : 'Limit not respected'
    );
    if (isValid) testsPassed++;
  } catch (error) {
    logger.test('get_tags - Pagination limit', false, error.message);
  }

  // Test 2.4: Cursor-based pagination
  testsTotal++;
  try {
    const firstPage = await callTool('get_tags', { limit: 2 });
    const firstData = JSON.parse(firstPage.content[0].text);

    if (firstData.nextCursor) {
      const secondPage = await callTool('get_tags', {
        limit: 2,
        cursor: firstData.nextCursor
      });
      const secondData = JSON.parse(secondPage.content[0].text);

      const isValid = secondData.data && secondData.data.length > 0;
      logger.test(
        'get_tags - Cursor pagination',
        isValid,
        isValid ? `Next page retrieved with ${secondData.data.length} tags` : 'Cursor pagination failed'
      );
      if (isValid) testsPassed++;
    } else {
      logger.test('get_tags - Cursor pagination', true, 'No next cursor (all tags fit in first page)');
      testsPassed++;
    }
  } catch (error) {
    logger.test('get_tags - Cursor pagination', false, error.message);
  }

  return { passed: testsPassed, total: testsTotal };
}

// ========================================
// Test Suite: create_tag
// ========================================

async function testCreateTag() {
  logger.info('\n--- Task 3: Validate create_tag ---\n');

  let testsPassed = 0;
  let testsTotal = 0;

  // Test 3.1: Create tag with unique name
  testsTotal++;
  try {
    const tagName = `Test${crypto.randomUUID().substring(0, 8)}`;
    const result = await callTool('create_tag', { name: tagName });
    const tag = JSON.parse(result.content[0].text);

    const isValid = tag && tag.id && tag.name === tagName;
    logger.test(
      'create_tag - Create with unique name',
      isValid,
      isValid ? `Created tag: ${tag.id}` : 'Tag creation failed'
    );
    if (isValid) {
      testsPassed++;
      testState.createdTags.push(tag.id);
    }
  } catch (error) {
    logger.test('create_tag - Create with unique name', false, error.message);
  }

  // Test 3.2: Structure validation
  testsTotal++;
  try {
    const tagName = `Test${crypto.randomUUID().substring(0, 8)}`;
    const result = await callTool('create_tag', { name: tagName });
    const tag = JSON.parse(result.content[0].text);

    const hasRequiredFields =
      tag.hasOwnProperty('id') &&
      tag.hasOwnProperty('name') &&
      tag.hasOwnProperty('createdAt') &&
      tag.hasOwnProperty('updatedAt');

    logger.test(
      'create_tag - Structure validation',
      hasRequiredFields,
      hasRequiredFields ? 'All required fields present' : 'Missing required fields'
    );
    if (hasRequiredFields) {
      testsPassed++;
      testState.createdTags.push(tag.id);
    }
  } catch (error) {
    logger.test('create_tag - Structure validation', false, error.message);
  }

  // Test 3.3: Duplicate name handling
  testsTotal++;
  try {
    const tagName = `Test${crypto.randomUUID().substring(0, 8)}`;

    // Create first tag
    const first = await callTool('create_tag', { name: tagName });
    const firstTag = JSON.parse(first.content[0].text);
    testState.createdTags.push(firstTag.id);

    // Try to create duplicate
    try {
      await callTool('create_tag', { name: tagName });
      logger.test('create_tag - Duplicate name handling', false, 'Should have rejected duplicate name');
    } catch (error) {
      const isDuplicateError = error.message.includes('already exists') ||
                              error.message.includes('duplicate') ||
                              error.message.includes('unique') ||
                              error.message.includes('409');
      logger.test(
        'create_tag - Duplicate name handling',
        isDuplicateError,
        isDuplicateError ? 'Correctly rejected duplicate' : 'Wrong error type'
      );
      if (isDuplicateError) testsPassed++;
    }
  } catch (error) {
    logger.test('create_tag - Duplicate name handling', false, error.message);
  }

  return { passed: testsPassed, total: testsTotal };
}

// ========================================
// Test Suite: get_tag
// ========================================

async function testGetTag() {
  logger.info('\n--- Task 4: Validate get_tag ---\n');

  let testsPassed = 0;
  let testsTotal = 0;

  // Ensure we have tag IDs to test
  if (testState.testTagIds.length === 0 && testState.createdTags.length === 0) {
    logger.warn('No tag IDs available for testing. Skipping get_tag tests.');
    return { passed: 0, total: 0 };
  }

  const testTagId = testState.testTagIds.length > 0
    ? testState.testTagIds[0]
    : testState.createdTags[0];

  logger.info(`Using tag ID: ${testTagId}`);

  // Test 4.1: Retrieve tag by ID
  testsTotal++;
  try {
    const result = await callTool('get_tag', { id: testTagId });
    const tag = JSON.parse(result.content[0].text);

    const isValid = tag && tag.id === testTagId;
    logger.test(
      'get_tag - Retrieve by ID',
      isValid,
      isValid ? `Tag retrieved: ${tag.name}` : 'Failed to retrieve tag'
    );
    if (isValid) testsPassed++;
  } catch (error) {
    logger.test('get_tag - Retrieve by ID', false, error.message);
  }

  // Test 4.2: Structure validation
  testsTotal++;
  try {
    const result = await callTool('get_tag', { id: testTagId });
    const tag = JSON.parse(result.content[0].text);

    const hasRequiredFields =
      tag.hasOwnProperty('id') &&
      tag.hasOwnProperty('name') &&
      tag.hasOwnProperty('createdAt') &&
      tag.hasOwnProperty('updatedAt');

    logger.test(
      'get_tag - Structure validation',
      hasRequiredFields,
      hasRequiredFields ? 'All required fields present' : 'Missing required fields'
    );
    if (hasRequiredFields) testsPassed++;
  } catch (error) {
    logger.test('get_tag - Structure validation', false, error.message);
  }

  // Test 4.3: 404 for non-existent ID
  testsTotal++;
  try {
    await callTool('get_tag', { id: '99999999' });
    logger.test('get_tag - 404 for non-existent ID', false, 'Should have returned error');
  } catch (error) {
    const is404 = error.message.includes('404') || error.message.includes('not found') || error.message.includes('Not Found');
    logger.test(
      'get_tag - 404 for non-existent ID',
      is404,
      is404 ? 'Correctly returned 404' : 'Wrong error type'
    );
    if (is404) testsPassed++;
  }

  return { passed: testsPassed, total: testsTotal };
}

// ========================================
// Test Suite: update_tag
// ========================================

async function testUpdateTag() {
  logger.info('\n--- Task 5: Validate update_tag ---\n');

  let testsPassed = 0;
  let testsTotal = 0;

  // Test 5.1: Update tag name
  testsTotal++;
  try {
    // Create a tag to update
    const originalName = `Test${crypto.randomUUID().substring(0, 8)}`;
    const createResult = await callTool('create_tag', { name: originalName });
    const createdTag = JSON.parse(createResult.content[0].text);
    testState.createdTags.push(createdTag.id);

    // Update the tag
    const newName = `Test${crypto.randomUUID().substring(0, 8)}`;
    const updateResult = await callTool('update_tag', {
      id: createdTag.id,
      name: newName
    });
    const updatedTag = JSON.parse(updateResult.content[0].text);

    const isValid = updatedTag && updatedTag.name === newName && updatedTag.id === createdTag.id;
    logger.test(
      'update_tag - Update name',
      isValid,
      isValid ? `Name updated successfully` : 'Update failed'
    );
    if (isValid) testsPassed++;
  } catch (error) {
    logger.test('update_tag - Update name', false, error.message);
  }

  // Test 5.2: 404 for non-existent ID
  testsTotal++;
  try {
    await callTool('update_tag', {
      id: '99999999',
      name: `${config.testTagPrefix}NonExistent`
    });
    logger.test('update_tag - 404 for non-existent ID', false, 'Should have returned error');
  } catch (error) {
    const is404 = error.message.includes('404') || error.message.includes('not found');
    logger.test(
      'update_tag - 404 for non-existent ID',
      is404,
      is404 ? 'Correctly returned 404' : 'Wrong error type'
    );
    if (is404) testsPassed++;
  }

  return { passed: testsPassed, total: testsTotal };
}

// ========================================
// Test Suite: delete_tag
// ========================================

async function testDeleteTag() {
  logger.info('\n--- Task 6: Validate delete_tag ---\n');

  let testsPassed = 0;
  let testsTotal = 0;

  // Test 6.1: Delete tag and verify
  testsTotal++;
  try {
    // Create a tag to delete
    const tagName = `Test${crypto.randomUUID().substring(0, 8)}`;
    const createResult = await callTool('create_tag', { name: tagName });
    const createdTag = JSON.parse(createResult.content[0].text);

    // Delete the tag
    await callTool('delete_tag', { id: createdTag.id });

    // Verify it's gone
    try {
      await callTool('get_tag', { id: createdTag.id });
      logger.test('delete_tag - Delete and verify', false, 'Tag still exists after deletion');
    } catch (error) {
      const is404 = error.message.includes('404') || error.message.includes('not found');
      logger.test(
        'delete_tag - Delete and verify',
        is404,
        is404 ? 'Tag successfully deleted' : 'Unexpected error'
      );
      if (is404) testsPassed++;
    }
  } catch (error) {
    logger.test('delete_tag - Delete and verify', false, error.message);
  }

  // Test 6.2: 404 for non-existent ID
  testsTotal++;
  try {
    await callTool('delete_tag', { id: '99999999' });
    logger.test('delete_tag - 404 for non-existent ID', false, 'Should have returned error');
  } catch (error) {
    const is404 = error.message.includes('404') || error.message.includes('not found');
    logger.test(
      'delete_tag - 404 for non-existent ID',
      is404,
      is404 ? 'Correctly returned 404' : 'Wrong error type'
    );
    if (is404) testsPassed++;
  }

  return { passed: testsPassed, total: testsTotal };
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

  let cleanedTags = 0;

  if (testState.createdTags.length > 0) {
    logger.info(`Cleaning up ${testState.createdTags.length} test tags...`);

    for (const tagId of testState.createdTags) {
      try {
        await callTool('delete_tag', { id: tagId });
        cleanedTags++;
      } catch (error) {
        logger.debug(`Failed to delete tag ${tagId}: ${error.message}`);
      }
    }

    logger.success(`✓ Cleaned up ${cleanedTags}/${testState.createdTags.length} test tags`);
  }
}

// ========================================
// Main Test Runner
// ========================================

async function runTests() {
  console.error('======================================================================');
  console.error('  Tags API Validation Test Suite - Story 2.3');
  console.error('======================================================================\n');

  logger.info('Testing 5 Tags API methods against live n8n instance');
  logger.info(`MCP Server: ${config.mcpServerUrl}\n`);

  const results = {
    list: { passed: 0, total: 0 },
    create: { passed: 0, total: 0 },
    get: { passed: 0, total: 0 },
    update: { passed: 0, total: 0 },
    delete: { passed: 0, total: 0 }
  };

  try {
    // Pre-flight checks
    console.error('--- Pre-flight Checks ---\n');

    const health = await axios.get(config.healthCheckUrl);
    logger.info(`Server health: ${health.data.status}\n`);

    // Run test suites
    if (config.testFlags.runListTests) {
      results.list = await testGetTags();
    }

    if (config.testFlags.runCreateTests) {
      results.create = await testCreateTag();
    }

    if (config.testFlags.runGetTests) {
      results.get = await testGetTag();
    }

    if (config.testFlags.runUpdateTests) {
      results.update = await testUpdateTag();
    }

    if (config.testFlags.runDeleteTests) {
      results.delete = await testDeleteTag();
    }

    // Cleanup
    await cleanup();

    // Summary
    console.error('\n======================================================================');
    console.error('  Test Summary Report');
    console.error('======================================================================\n');

    const totalPassed = results.list.passed + results.create.passed + results.get.passed +
                       results.update.passed + results.delete.passed;
    const totalTests = results.list.total + results.create.total + results.get.total +
                      results.update.total + results.delete.total;

    console.error(`Total tests executed: ${totalTests}`);
    console.error(`Passed: ${totalPassed} (${totalTests > 0 ? Math.round(totalPassed/totalTests*100) : 0}%)`);
    console.error(`Failed: ${totalTests - totalPassed}`);
    console.error(`Skipped: 0\n`);

    console.error('Test categories:');
    console.error(`   list: ${results.list.passed}/${results.list.total} (${results.list.total > 0 ? Math.round(results.list.passed/results.list.total*100) : 0}%)`);
    console.error(`   create: ${results.create.passed}/${results.create.total} (${results.create.total > 0 ? Math.round(results.create.passed/results.create.total*100) : 0}%)`);
    console.error(`   get: ${results.get.passed}/${results.get.total} (${results.get.total > 0 ? Math.round(results.get.passed/results.get.total*100) : 0}%)`);
    console.error(`   update: ${results.update.passed}/${results.update.total} (${results.update.total > 0 ? Math.round(results.update.passed/results.update.total*100) : 0}%)`);
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
