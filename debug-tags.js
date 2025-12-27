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

async function debug() {
  try {
    // List all tags
    console.error('[INFO] Fetching all tags...');
    const result = await callTool('get_tags', { limit: 100 });
    const data = JSON.parse(result.content[0].text);

    console.error('\n[INFO] All tags in system:');
    console.error(JSON.stringify(data, null, 2));

    // Try to create a test tag
    console.error('\n[INFO] Attempting to create a test tag...');
    const tagName = `TagTest_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    console.error(`[INFO] Tag name: ${tagName}`);

    try {
      const createResult = await callTool('create_tag', { name: tagName });
      const tag = JSON.parse(createResult.content[0].text);
      console.error('[SUCCESS] Tag created successfully!');
      console.error(JSON.stringify(tag, null, 2));

      // Clean up
      console.error('\n[INFO] Cleaning up test tag...');
      await callTool('delete_tag', { id: tag.id });
      console.error('[SUCCESS] Test tag deleted');
    } catch (error) {
      console.error('[ERROR] Failed to create tag:');
      console.error(error.message);
      console.error('\nFull error:', error);
    }

  } catch (error) {
    console.error(`[ERROR] Debug failed: ${error.message}`);
    process.exit(1);
  }
}

debug();
