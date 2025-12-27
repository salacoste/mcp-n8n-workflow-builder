#!/usr/bin/env node

const axios = require('axios');
const crypto = require('crypto');

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

async function test() {
  try {
    // Use UUID for 100% uniqueness
    const tagName = `Test${crypto.randomUUID().substring(0, 8)}`;
    console.error(`[INFO] Creating tag with UUID: ${tagName}`);

    const result = await callTool('create_tag', { name: tagName });
    const tag = JSON.parse(result.content[0].text);

    console.error('[SUCCESS] Tag created!');
    console.error(JSON.stringify(tag, null, 2));

    // Clean up
    console.error(`\n[INFO] Deleting tag: ${tag.id}`);
    await callTool('delete_tag', { id: tag.id });
    console.error('[SUCCESS] Tag deleted');

  } catch (error) {
    console.error('[ERROR]', error.message);
  }
}

test();
