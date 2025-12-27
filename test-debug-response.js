const axios = require('axios');

async function mcpRequest(method, params = {}) {
  const response = await axios.post('http://localhost:3456/mcp', {
    jsonrpc: '2.0',
    id: Date.now(),
    method,
    params
  });
  return response.data.result;
}

async function callTool(toolName, args) {
  const result = await mcpRequest('tools/call', {
    name: toolName,
    arguments: args
  });

  if (result.content && result.content[0]) {
    try {
      return JSON.parse(result.content[0].text);
    } catch (e) {
      return result.content[0].text;
    }
  }
  return result;
}

async function test() {
  console.log('\n=== Testing list_executions ===');
  const executions = await callTool('list_executions', {});
  console.log('Type:', typeof executions);
  console.log('Is Array:', Array.isArray(executions));
  if (typeof executions === 'object') {
    console.log('Keys:', Object.keys(executions));
    if (executions.data) {
      console.log('Has data property, is array:', Array.isArray(executions.data));
    }
  }
  console.log('First 500 chars:', JSON.stringify(executions, null, 2).substring(0, 500));

  console.log('\n=== Testing get_tags ===');
  const tags = await callTool('get_tags', {});
  console.log('Type:', typeof tags);
  console.log('Is Array:', Array.isArray(tags));
  if (typeof tags === 'object') {
    console.log('Keys:', Object.keys(tags));
    if (tags.data) {
      console.log('Has data property, is array:', Array.isArray(tags.data));
    }
  }
  console.log('First 500 chars:', JSON.stringify(tags, null, 2).substring(0, 500));
}

test().catch(console.error);
