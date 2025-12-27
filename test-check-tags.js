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
  const tagsResponse = await callTool('get_tags', {});
  const tags = tagsResponse.data || tagsResponse;
  
  console.log('\nExisting tags:');
  tags.forEach(tag => {
    console.log(`  - ${tag.name} (${tag.id})`);
  });
  
  // Delete E2E test tags
  console.log('\nDeleting E2E test tags...');
  for (const tag of tags) {
    if (tag.name.includes('E2E Test')) {
      try {
        await callTool('delete_tag', { id: tag.id });
        console.log(`  ✅ Deleted: ${tag.name}`);
      } catch (error) {
        console.log(`  ❌ Failed to delete: ${tag.name}`);
      }
    }
  }
}

test().catch(console.error);
