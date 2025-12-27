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
  const uniqueName = 'E2E-Test-' + Math.random().toString(36).substring(7);
  
  console.log('Creating tag:', uniqueName);
  try {
    const tag = await callTool('create_tag', { name: uniqueName });
    console.log('Success:', JSON.stringify(tag, null, 2));
    
    if (tag && tag.id) {
      await callTool('delete_tag', { id: tag.id });
      console.log('Deleted:', tag.id);
    }
  } catch (error) {
    console.log('Error:', error.message);
  }
}

test().catch(console.error);
