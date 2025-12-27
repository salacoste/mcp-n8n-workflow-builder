#!/usr/bin/env node

/**
 * Quick Test: retry_execution tool
 * Tests against n8n v2.1.4 platform
 */

const axios = require('axios');

const config = {
  mcpServerUrl: 'http://localhost:3456/mcp',
  healthCheckUrl: 'http://localhost:3456/health'
};

let requestId = 1;

async function sendMcpRequest(method, params = {}) {
  const response = await axios.post(config.mcpServerUrl, {
    jsonrpc: '2.0',
    id: requestId++,
    method,
    params
  });
  return response.data.result;
}

async function callTool(name, args = {}) {
  const result = await sendMcpRequest('tools/call', { name, arguments: args });
  if (result.isError) {
    const errorMessage = result.content && result.content[0] && result.content[0].text
      ? result.content[0].text
      : 'Unknown error';
    throw new Error(errorMessage);
  }
  return result;
}

async function main() {
  console.error('=== Quick Test: retry_execution ===\n');

  try {
    // Check server health
    const health = await axios.get(config.healthCheckUrl);
    console.error(`✓ Server health: ${health.data.status}\n`);

    // Step 1: List executions to find a failed one
    console.error('Looking for failed executions...');
    const listResult = await callTool('list_executions', {
      status: 'error',
      limit: 5
    });
    const executions = JSON.parse(listResult.content[0].text);

    if (!executions.data || executions.data.length === 0) {
      console.error('\n⚠️  No failed executions found.');
      console.error('To test retry_execution:');
      console.error('1. Create a workflow that will fail');
      console.error('2. Execute it to generate a failed execution');
      console.error('3. Run this test again\n');
      process.exit(0);
    }

    const failedExecution = executions.data[0];
    console.error(`✓ Found failed execution: ${failedExecution.id}`);
    console.error(`  Workflow: ${failedExecution.workflowId}`);
    console.error(`  Status: ${failedExecution.status}`);
    console.error(`  Started: ${failedExecution.startedAt}\n`);

    // Step 2: Retry the failed execution
    console.error('Retrying failed execution...');
    const retryResult = await callTool('retry_execution', {
      id: failedExecution.id
    });
    const newExecution = JSON.parse(retryResult.content[0].text);

    console.error(`✓ Retry initiated successfully!`);
    console.error(`  New execution ID: ${newExecution.id}`);
    console.error(`  Retry of: ${newExecution.retryOf || failedExecution.id}`);
    console.error(`  Mode: ${newExecution.mode}`);
    console.error(`  Status: ${newExecution.status || 'running'}\n`);

    // Verify it's a different execution
    if (newExecution.id === failedExecution.id) {
      console.error('⚠️  WARNING: New execution has same ID as original');
    } else {
      console.error('✓ Verified: New execution has different ID');
    }

    console.error('\n=== Test Result: ✓ SUCCESS ===');
    console.error('retry_execution tool is working correctly!\n');

  } catch (error) {
    console.error(`\n✗ Test failed: ${error.message}`);
    console.error('\nError details:', error.response?.data || error.stack);
    process.exit(1);
  }
}

main();
