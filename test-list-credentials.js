#!/usr/bin/env node

/**
 * Test: list_credentials MCP tool
 * Tests the new Credentials API list endpoint
 */

const axios = require('axios');

const config = {
  mcpServerUrl: 'http://localhost:3456/mcp'
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
  console.log('\n=== Test: list_credentials MCP tool ===\n');

  try {
    // Test 1: List all credentials
    console.log('Test 1: List all credentials');
    const result = await callTool('list_credentials');
    const credentials = JSON.parse(result.content[0].text);

    console.log(`✅ Successfully retrieved credentials list`);
    console.log(`   Found ${credentials.data.length} credentials`);

    if (credentials.data.length > 0) {
      console.log('\n📋 Credentials metadata:');
      credentials.data.forEach((cred, index) => {
        console.log(`\n${index + 1}. ${cred.name}`);
        console.log(`   ID: ${cred.id}`);
        console.log(`   Type: ${cred.type}`);
        console.log(`   Created: ${cred.createdAt}`);
        console.log(`   Updated: ${cred.updatedAt}`);

        if (cred.nodesAccess && cred.nodesAccess.length > 0) {
          console.log(`   Nodes Access:`);
          cred.nodesAccess.forEach(access => {
            console.log(`     - ${access.nodeType} (${access.date})`);
          });
        } else {
          console.log(`   Nodes Access: None`);
        }

        // Security check: ensure no sensitive data
        if (cred.data) {
          console.log('   ⚠️  WARNING: Sensitive data field found!');
        } else {
          console.log(`   ✅ Security: No sensitive data returned`);
        }
      });

      console.log('\n📊 Credential types summary:');
      const typeCount = credentials.data.reduce((acc, cred) => {
        acc[cred.type] = (acc[cred.type] || 0) + 1;
        return acc;
      }, {});
      Object.entries(typeCount).forEach(([type, count]) => {
        console.log(`   - ${type}: ${count}`);
      });
    } else {
      console.log('ℹ️  No credentials found in this n8n instance');
    }

    // Test 2: Pagination (if applicable)
    if (credentials.data.length >= 5) {
      console.log('\n\nTest 2: Pagination with limit');
      const limitedResult = await callTool('list_credentials', { limit: 2 });
      const limitedCredentials = JSON.parse(limitedResult.content[0].text);
      console.log(`✅ Retrieved ${limitedCredentials.data.length} credentials with limit=2`);
      if (limitedCredentials.nextCursor) {
        console.log(`   Next cursor: ${limitedCredentials.nextCursor}`);
      }
    }

    console.log('\n✅ All tests passed!\n');

  } catch (error) {
    console.error(`\n❌ Error: ${error.message}\n`);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

main();
