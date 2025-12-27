#!/usr/bin/env node

const axios = require('axios');

const mcp = axios.create({ baseURL: 'http://localhost:3456/mcp' });

async function mcpCall(method, args) {
  const resp = await mcp.post('', {
    jsonrpc: '2.0',
    id: Date.now(),
    method: 'tools/call',
    params: { name: method, arguments: args }
  });
  return resp.data.result;
}

async function test() {
  console.log('=== Full Delete Test Scenario ===\n');

  // 1. Create workflow
  console.log('1. Creating workflow...');
  const createResult = await mcpCall('create_workflow', {
    name: `Full Test ${Date.now()}`,
    nodes: [],
    connections: {}
  });

  if (!createResult.content || !createResult.content[0]) {
    console.log('   ERROR: No content in create result');
    console.log('   Result:', JSON.stringify(createResult, null, 2));
    return;
  }

  const workflow = JSON.parse(createResult.content[0].text);
  const id = workflow.id;
  console.log(`   ✅ Created: ${id}\n`);

  // 2. Delete workflow
  console.log('2. Deleting workflow...');
  const deleteResult = await mcpCall('delete_workflow', { id });
  console.log('   isError:', deleteResult.isError);
  console.log('   Content (first 150 chars):', deleteResult.content[0].text.substring(0, 150));

  // Check if delete returned the workflow object
  if (!deleteResult.isError) {
    try {
      const deletedWf = JSON.parse(deleteResult.content[0].text);
      console.log(`   ✅ Delete returned workflow object: ${deletedWf.name}`);
      console.log(`   Workflow ID in response: ${deletedWf.id}`);
    } catch (e) {
      console.log('   Delete returned non-JSON response');
    }
  }
  console.log('');

  // 3. Try to get deleted workflow
  console.log('3. Getting deleted workflow...');
  const getResult = await mcpCall('get_workflow', { id });
  console.log('   isError:', getResult.isError);

  if (getResult.isError) {
    console.log('   ✅ CORRECT: get_workflow returns error for deleted workflow');
    console.log('   Error message:', getResult.content[0].text);
  } else {
    console.log('   ❌ PROBLEM: get_workflow still returns workflow!');
    const wf = JSON.parse(getResult.content[0].text);
    console.log(`   Workflow still accessible: ${wf.name} (id: ${wf.id})`);
  }
}

test().catch(err => {
  console.error('Script error:', err.message);
  console.error(err.stack);
  process.exit(1);
});
