#!/usr/bin/env node

/**
 * Test: delete_credential and get_credential_schema
 * Stories 2.6.5 and 2.6.6 - Full implementation tests
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

async function testGetCredentialSchema() {
  console.log('\n=== Test 1: get_credential_schema (Story 2.6.6) ===\n');

  const testTypes = [
    { name: 'httpBasicAuth', desc: 'HTTP Basic Authentication' },
    { name: 'httpHeaderAuth', desc: 'HTTP Header Authentication' },
    { name: 'oAuth2Api', desc: 'OAuth2 API' }
  ];

  let passedCount = 0;

  for (const testType of testTypes) {
    try {
      console.log(`\n📋 Testing schema for: ${testType.name} (${testType.desc})`);

      const result = await callTool('get_credential_schema', {
        typeName: testType.name
      });

      const schema = JSON.parse(result.content[0].text);

      console.log(`  ✅ Schema retrieved successfully`);

      // Validate schema structure
      if (schema.properties || schema.type) {
        console.log(`  ✓ Has schema structure`);
      }

      if (schema.properties) {
        const fieldCount = Object.keys(schema.properties).length;
        console.log(`  ✓ Fields defined: ${fieldCount}`);

        // Show first few fields
        const fields = Object.keys(schema.properties).slice(0, 3);
        console.log(`  ✓ Sample fields: ${fields.join(', ')}`);
      }

      if (schema.required) {
        console.log(`  ✓ Required fields: ${schema.required.length}`);
      }

      passedCount++;

    } catch (error) {
      console.error(`  ❌ Failed: ${error.message}`);
    }
  }

  console.log(`\n📊 Schema tests: ${passedCount}/${testTypes.length} passed`);
  return passedCount === testTypes.length;
}

async function testDeleteCredential() {
  console.log('\n\n=== Test 2: delete_credential (Story 2.6.5) ===\n');

  let createdId = null;

  try {
    // First, we need to create a credential to delete
    // Since create_credential is not implemented yet in Story 2.6.3,
    // we'll use the direct API approach

    console.log('Step 1: Creating test credential via direct API...');

    // Load config for direct API call
    const fs = require('fs');
    let apiConfig;
    if (fs.existsSync('.config.json')) {
      const rawConfig = JSON.parse(fs.readFileSync('.config.json', 'utf8'));
      const defaultEnv = rawConfig.defaultEnv || Object.keys(rawConfig.environments)[0];
      const envConfig = rawConfig.environments[defaultEnv];
      apiConfig = {
        n8nHost: envConfig.n8n_host,
        n8nApiKey: envConfig.n8n_api_key
      };
    } else {
      require('dotenv').config();
      apiConfig = {
        n8nHost: process.env.N8N_HOST,
        n8nApiKey: process.env.N8N_API_KEY
      };
    }

    const createResponse = await axios.post(
      `${apiConfig.n8nHost}/api/v1/credentials`,
      {
        name: `Test Credential for Delete ${Date.now()}`,
        type: 'httpBasicAuth',
        data: {
          user: 'testuser',
          password: 'testpass'
        }
      },
      {
        headers: {
          'X-N8N-API-KEY': apiConfig.n8nApiKey,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );

    createdId = createResponse.data.id;
    console.log(`  ✅ Created test credential: ${createdId}`);

    // Now test delete via MCP tool
    console.log(`\nStep 2: Deleting credential via delete_credential tool...`);

    const result = await callTool('delete_credential', { id: createdId });
    const deletedCred = JSON.parse(result.content[0].text);

    console.log(`  ✅ Credential deleted successfully`);
    console.log(`  ✓ Deleted credential name: ${deletedCred.name}`);
    console.log(`  ✓ Deleted credential type: ${deletedCred.type}`);

    // Verify deletion by trying to delete again (should fail with 404)
    console.log(`\nStep 3: Verifying deletion (should fail with 404)...`);

    try {
      await callTool('delete_credential', { id: createdId });
      console.log(`  ❌ ERROR: Should have failed but didn't`);
      return false;
    } catch (error) {
      if (error.message.includes('404') || error.message.includes('not found')) {
        console.log(`  ✅ Correctly returns 404 for already deleted credential`);
      } else {
        console.log(`  ✓ Delete failed as expected: ${error.message}`);
      }
    }

    console.log('\n✅ Test 2 PASSED');
    return true;

  } catch (error) {
    console.error(`\n❌ Test 2 FAILED: ${error.message}`);

    // Cleanup if credential was created
    if (createdId) {
      console.log(`\nAttempting cleanup of credential ${createdId}...`);
      try {
        await callTool('delete_credential', { id: createdId });
        console.log('  ✅ Cleanup successful');
      } catch (cleanupError) {
        console.log(`  ⚠️  Cleanup failed (may already be deleted): ${cleanupError.message}`);
      }
    }

    return false;
  }
}

async function main() {
  console.log('\n=== Credentials API Full Implementation Test Suite ===');
  console.log('Testing Stories 2.6.5 (delete_credential) and 2.6.6 (get_credential_schema)\n');

  const results = [];

  // Test Story 2.6.6 first (doesn't require setup)
  results.push(await testGetCredentialSchema());

  // Test Story 2.6.5 (requires credential creation)
  results.push(await testDeleteCredential());

  const passed = results.filter(r => r).length;
  const total = results.length;

  console.log('\n\n=== Summary ===');
  console.log(`Tests passed: ${passed}/${total}`);

  if (passed === total) {
    console.log('✅ All tests PASSED!\n');
    console.log('Stories 2.6.5 and 2.6.6 are COMPLETE\n');
  } else {
    console.log('❌ Some tests failed\n');
    process.exit(1);
  }
}

main();
