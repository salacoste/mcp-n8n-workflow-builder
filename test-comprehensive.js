#!/usr/bin/env node

/**
 * Comprehensive Integration Test for MCP n8n Workflow Builder
 * Tests all MCP functionality to ensure nothing broke with notification handler changes
 */

const http = require('http');

const PORT = process.env.MCP_PORT || 3456;
const HOST = 'localhost';

let testsPassed = 0;
let testsFailed = 0;

// Helper function to send JSON-RPC request
function sendRequest(data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);

    const options = {
      hostname: HOST,
      port: PORT,
      path: '/mcp',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          statusMessage: res.statusMessage,
          headers: res.headers,
          body: body ? (body.length > 0 ? JSON.parse(body) : null) : null
        });
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function logTest(name, passed, details = '') {
  if (passed) {
    console.log(`  ✅ PASS: ${name}`);
    testsPassed++;
  } else {
    console.log(`  ❌ FAIL: ${name}`);
    if (details) console.log(`    ${details}`);
    testsFailed++;
  }
}

// Test cases
async function runTests() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║  MCP n8n Workflow Builder - Comprehensive Integration Test  ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  try {
    // ==========================================
    // 1. BASIC CONNECTIVITY TESTS
    // ==========================================
    console.log('📡 1. Basic Connectivity Tests');
    console.log('─────────────────────────────────────────────────────────────');

    // Test 1.1: Health Check
    const healthResult = await new Promise((resolve, reject) => {
      http.get(`http://${HOST}:${PORT}/health`, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve({
          statusCode: res.statusCode,
          body: JSON.parse(body)
        }));
      }).on('error', reject);
    });

    logTest(
      'Health check endpoint',
      healthResult.statusCode === 200 && healthResult.body.status === 'ok',
      JSON.stringify(healthResult.body)
    );

    // ==========================================
    // 2. NOTIFICATION HANDLING TESTS (NEW)
    // ==========================================
    console.log('\n🔔 2. Notification Handling Tests (New Functionality)');
    console.log('─────────────────────────────────────────────────────────────');

    // Test 2.1: notifications/initialized
    const initNotification = await sendRequest({
      jsonrpc: '2.0',
      method: 'notifications/initialized',
      params: {}
    });
    logTest(
      'notifications/initialized → 204 No Content',
      initNotification.statusCode === 204 && initNotification.body === null
    );

    // Test 2.2: notifications/cancelled
    const cancelNotification = await sendRequest({
      jsonrpc: '2.0',
      method: 'notifications/cancelled',
      params: { requestId: 123 }
    });
    logTest(
      'notifications/cancelled → 204 No Content',
      cancelNotification.statusCode === 204 && cancelNotification.body === null
    );

    // Test 2.3: notifications/progress
    const progressNotification = await sendRequest({
      jsonrpc: '2.0',
      method: 'notifications/progress',
      params: { progress: 50, total: 100 }
    });
    logTest(
      'notifications/progress → 204 No Content',
      progressNotification.statusCode === 204 && progressNotification.body === null
    );

    // ==========================================
    // 3. MCP TOOLS TESTS
    // ==========================================
    console.log('\n🛠️  3. MCP Tools Tests (Core Functionality)');
    console.log('─────────────────────────────────────────────────────────────');

    // Test 3.1: List Tools
    const listToolsResult = await sendRequest({
      jsonrpc: '2.0',
      method: 'tools/list',
      params: {},
      id: 1
    });
    logTest(
      'tools/list - Returns list of available tools',
      listToolsResult.statusCode === 200 &&
      listToolsResult.body.result &&
      Array.isArray(listToolsResult.body.result.tools) &&
      listToolsResult.body.result.tools.length > 0,
      `Found ${listToolsResult.body.result?.tools?.length || 0} tools`
    );

    // Test 3.2: Call Tool - list_workflows (may fail without n8n connection)
    const listWorkflowsResult = await sendRequest({
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: 'list_workflows',
        arguments: {}
      },
      id: 2
    });

    // This test is expected to fail if n8n is not configured, but should return proper error structure
    const hasProperStructure = listWorkflowsResult.statusCode === 200 &&
      listWorkflowsResult.body.jsonrpc === '2.0' &&
      listWorkflowsResult.body.id === 2;

    logTest(
      'tools/call - list_workflows (structure check)',
      hasProperStructure,
      listWorkflowsResult.body.error ?
        `Expected error (no n8n): ${listWorkflowsResult.body.error.message}` :
        'Success'
    );

    // Test 3.3: Call Tool - list_executions
    const listExecutionsResult = await sendRequest({
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: 'list_executions',
        arguments: {}
      },
      id: 3
    });

    const hasProperExecStructure = listExecutionsResult.statusCode === 200 &&
      listExecutionsResult.body.jsonrpc === '2.0' &&
      listExecutionsResult.body.id === 3;

    logTest(
      'tools/call - list_executions (structure check)',
      hasProperExecStructure,
      listExecutionsResult.body.error ?
        `Expected error (no n8n): ${listExecutionsResult.body.error.message}` :
        'Success'
    );

    // ==========================================
    // 4. MCP RESOURCES TESTS
    // ==========================================
    console.log('\n📦 4. MCP Resources Tests');
    console.log('─────────────────────────────────────────────────────────────');

    // Test 4.1: List Resources
    const listResourcesResult = await sendRequest({
      jsonrpc: '2.0',
      method: 'resources/list',
      params: {},
      id: 4
    });

    logTest(
      'resources/list - Returns available resources',
      listResourcesResult.statusCode === 200 &&
      listResourcesResult.body.result &&
      Array.isArray(listResourcesResult.body.result.resources),
      `Found ${listResourcesResult.body.result?.resources?.length || 0} resources`
    );

    // Test 4.2: List Resource Templates
    const listTemplatesResult = await sendRequest({
      jsonrpc: '2.0',
      method: 'resources/templates/list',
      params: {},
      id: 5
    });

    logTest(
      'resources/templates/list - Returns resource templates',
      listTemplatesResult.statusCode === 200 &&
      listTemplatesResult.body.result &&
      Array.isArray(listTemplatesResult.body.result.resourceTemplates),
      `Found ${listTemplatesResult.body.result?.resourceTemplates?.length || 0} templates`
    );

    // Test 4.3: Read Resource - workflows
    const readResourceResult = await sendRequest({
      jsonrpc: '2.0',
      method: 'resources/read',
      params: {
        uri: 'n8n://workflows'
      },
      id: 6
    });

    const hasResourceStructure = readResourceResult.statusCode === 200 &&
      readResourceResult.body.jsonrpc === '2.0' &&
      readResourceResult.body.id === 6;

    logTest(
      'resources/read - Read workflows resource',
      hasResourceStructure,
      readResourceResult.body.error ?
        `Expected error (no n8n): ${readResourceResult.body.error.message}` :
        'Success'
    );

    // ==========================================
    // 5. MCP PROMPTS TESTS
    // ==========================================
    console.log('\n📝 5. MCP Prompts Tests');
    console.log('─────────────────────────────────────────────────────────────');

    // Test 5.1: List Prompts
    const listPromptsResult = await sendRequest({
      jsonrpc: '2.0',
      method: 'prompts/list',
      params: {},
      id: 7
    });

    logTest(
      'prompts/list - Returns available prompts',
      listPromptsResult.statusCode === 200 &&
      listPromptsResult.body.result &&
      Array.isArray(listPromptsResult.body.result.prompts),
      `Found ${listPromptsResult.body.result?.prompts?.length || 0} prompts`
    );

    // ==========================================
    // 6. JSON-RPC 2.0 COMPLIANCE TESTS
    // ==========================================
    console.log('\n⚙️  6. JSON-RPC 2.0 Compliance Tests');
    console.log('─────────────────────────────────────────────────────────────');

    // Test 6.1: Request with ID returns proper response structure
    const validRequest = await sendRequest({
      jsonrpc: '2.0',
      method: 'tools/list',
      params: {},
      id: 100
    });

    logTest(
      'Request with ID returns response with same ID',
      validRequest.body.id === 100 &&
      validRequest.body.jsonrpc === '2.0' &&
      validRequest.body.result !== undefined
    );

    // Test 6.2: Invalid method returns proper error
    const invalidMethod = await sendRequest({
      jsonrpc: '2.0',
      method: 'invalid/method',
      params: {},
      id: 101
    });

    logTest(
      'Invalid method returns JSON-RPC error',
      invalidMethod.body.error &&
      invalidMethod.body.error.code === -32601 &&
      invalidMethod.body.id === 101
    );

    // Test 6.3: Notification with unknown method is ignored gracefully
    const unknownNotification = await sendRequest({
      jsonrpc: '2.0',
      method: 'notifications/unknown',
      params: {}
    });

    logTest(
      'Unknown notification returns 204 (ignored gracefully)',
      unknownNotification.statusCode === 204
    );

    // ==========================================
    // 7. BACKWARD COMPATIBILITY TESTS
    // ==========================================
    console.log('\n🔄 7. Backward Compatibility Tests');
    console.log('─────────────────────────────────────────────────────────────');

    // Test 7.1: Multiple sequential requests work correctly
    const seq1 = await sendRequest({
      jsonrpc: '2.0',
      method: 'tools/list',
      params: {},
      id: 201
    });

    const seq2 = await sendRequest({
      jsonrpc: '2.0',
      method: 'resources/list',
      params: {},
      id: 202
    });

    const seq3 = await sendRequest({
      jsonrpc: '2.0',
      method: 'prompts/list',
      params: {},
      id: 203
    });

    logTest(
      'Sequential requests maintain proper ID mapping',
      seq1.body.id === 201 &&
      seq2.body.id === 202 &&
      seq3.body.id === 203
    );

    // Test 7.2: Mixed notifications and requests
    const mixedSeq1 = await sendRequest({
      jsonrpc: '2.0',
      method: 'notifications/initialized',
      params: {}
    });

    const mixedSeq2 = await sendRequest({
      jsonrpc: '2.0',
      method: 'tools/list',
      params: {},
      id: 301
    });

    const mixedSeq3 = await sendRequest({
      jsonrpc: '2.0',
      method: 'notifications/progress',
      params: { progress: 75 }
    });

    logTest(
      'Mixed notifications and requests work correctly',
      mixedSeq1.statusCode === 204 &&
      mixedSeq2.body.id === 301 &&
      mixedSeq3.statusCode === 204
    );

    // ==========================================
    // 8. ERROR HANDLING TESTS
    // ==========================================
    console.log('\n🚨 8. Error Handling Tests');
    console.log('─────────────────────────────────────────────────────────────');

    // Test 8.1: Malformed JSON-RPC request
    const malformedRequest = await sendRequest({
      method: 'tools/list',
      // Missing jsonrpc field
      id: 401
    });

    logTest(
      'Malformed request handled gracefully',
      malformedRequest.statusCode === 200 || malformedRequest.statusCode === 500,
      'Server responds without crashing'
    );

    // Test 8.2: Tool call with missing arguments
    const missingArgs = await sendRequest({
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: 'create_workflow'
        // Missing required arguments
      },
      id: 402
    });

    logTest(
      'Tool call with missing arguments returns error',
      missingArgs.body.error !== undefined,
      `Error: ${missingArgs.body.error?.message || 'Unknown'}`
    );

    // ==========================================
    // FINAL SUMMARY
    // ==========================================
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║                       TEST SUMMARY                           ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');

    const totalTests = testsPassed + testsFailed;
    const successRate = ((testsPassed / totalTests) * 100).toFixed(1);

    console.log(`  Total Tests:    ${totalTests}`);
    console.log(`  ✅ Passed:      ${testsPassed}`);
    console.log(`  ❌ Failed:      ${testsFailed}`);
    console.log(`  Success Rate:   ${successRate}%`);

    console.log('\n─────────────────────────────────────────────────────────────');

    if (testsFailed === 0) {
      console.log('\n  🎉 All tests passed! Server functionality is intact.\n');
      process.exit(0);
    } else {
      console.log('\n  ⚠️  Some tests failed. Review the output above.\n');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Test suite failed with error:', error.message);
    console.error('\nMake sure the MCP server is running with:');
    console.error('  MCP_STANDALONE=true npm start\n');
    process.exit(1);
  }
}

// Run tests
console.log('\nStarting comprehensive integration tests...');
setTimeout(runTests, 1000); // Wait 1 second for any startup delays
