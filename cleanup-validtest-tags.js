#!/usr/bin/env node

const axios = require('axios');

const mcpServerUrl = 'http://localhost:3456/mcp';
let requestId = 1;

async function sendMcpRequest(method, params = {}) {
  const response = await axios.post(mcpServerUrl, {
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

async function cleanup() {
  try {
    console.error('[INFO] Fetching all tags...');
    const result = await callTool('get_tags', { limit: 100 });
    const data = JSON.parse(result.content[0].text);
    const tags = data.data || [];

    console.error(`[INFO] Found ${tags.length} total tags`);

    const validTestTags = tags.filter(tag => tag.name.startsWith('ValidTest'));
    console.error(`[INFO] Found ${validTestTags.length} ValidTest tags to delete`);

    if (validTestTags.length === 0) {
      console.error('[INFO] No ValidTest tags to clean up');
      return;
    }

    let deleted = 0;
    for (const tag of validTestTags) {
      try {
        await callTool('delete_tag', { id: tag.id });
        deleted++;
        console.error(`[SUCCESS] Deleted tag: ${tag.name} (${tag.id})`);
      } catch (error) {
        console.error(`[ERROR] Failed to delete tag ${tag.name}: ${error.message}`);
      }
    }

    console.error(`[SUCCESS] Cleaned up ${deleted}/${validTestTags.length} ValidTest tags`);

  } catch (error) {
    console.error(`[ERROR] Cleanup failed: ${error.message}`);
    process.exit(1);
  }
}

cleanup();
