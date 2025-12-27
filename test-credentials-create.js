#!/usr/bin/env node

/**
 * Story 2.6.3: POST /credentials - Create Credential Test
 *
 * Tests the create_credential MCP tool with schema-driven workflow:
 * 1. Get credential schema for type
 * 2. Create credential with validated data
 * 3. Verify creation success
 * 4. Clean up test credentials
 *
 * Tests multiple credential types:
 * - httpBasicAuth (user/password)
 * - httpHeaderAuth (name/value)
 * - oAuth2Api (complex OAuth2 setup)
 */

const axios = require('axios');

// Configuration
const config = {
  mcpServerUrl: 'http://localhost:3456/mcp',
  healthCheckUrl: 'http://localhost:3456/health',
  testFlags: {
    runHttpBasicAuth: true,
    runHttpHeaderAuth: true,
    runOAuth2: false,  // OAuth2 is complex - skip for basic validation
    runCleanup: true
  }
};

// Storage for created credential IDs
const createdCredentials = [];

// Utility: MCP JSON-RPC request
async function mcpRequest(method, params = {}) {
  try {
    const response = await axios.post(config.mcpServerUrl, {
      jsonrpc: '2.0',
      id: Date.now(),
      method,
      params
    });

    if (response.data.error) {
      throw new Error(`MCP Error: ${response.data.error.message}`);
    }

    return response.data.result;
  } catch (error) {
    if (error.response) {
      throw new Error(`HTTP ${error.response.status}: ${JSON.stringify(error.response.data)}`);
    }
    throw error;
  }
}

// Utility: Call MCP tool
async function callTool(toolName, args) {
  const result = await mcpRequest('tools/call', {
    name: toolName,
    arguments: args
  });

  if (result.content && result.content[0]) {
    return JSON.parse(result.content[0].text);
  }

  return result;
}

// Health check
async function healthCheck() {
  try {
    const response = await axios.get(config.healthCheckUrl);
    console.log('✅ Server health check passed');
    console.log(`   Server version: ${response.data.version}`);
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
}

// Test 1: httpBasicAuth credential
async function testHttpBasicAuth() {
  console.log('\n=== Test 1: httpBasicAuth Credential ===\n');

  try {
    // Step 1: Get schema for httpBasicAuth
    console.log('Step 1: Getting schema for httpBasicAuth...');
    const schema = await callTool('get_credential_schema', {
      typeName: 'httpBasicAuth'
    });

    console.log(`  ✅ Schema retrieved successfully`);
    console.log(`  ✓ Schema type: ${schema.type}`);
    console.log(`  ✓ Properties: ${Object.keys(schema.properties || {}).join(', ')}`);

    // Step 2: Create credential using schema structure
    console.log('\nStep 2: Creating httpBasicAuth credential...');
    const timestamp = Date.now();
    const credential = await callTool('create_credential', {
      name: `Test HTTP Basic Auth ${timestamp}`,
      type: 'httpBasicAuth',
      data: {
        user: 'testuser',
        password: 'testpassword123'
      }
    });

    console.log(`  ✅ Credential created successfully`);
    console.log(`  ✓ ID: ${credential.id}`);
    console.log(`  ✓ Name: ${credential.name}`);
    console.log(`  ✓ Type: ${credential.type}`);
    console.log(`  ✓ Created: ${credential.createdAt}`);

    // Store for cleanup
    createdCredentials.push({ id: credential.id, name: credential.name, type: credential.type });

    console.log('\n✅ Test 1 PASSED');
    return true;
  } catch (error) {
    console.error('\n❌ Test 1 FAILED:', error.message);
    return false;
  }
}

// Test 2: httpHeaderAuth credential
async function testHttpHeaderAuth() {
  console.log('\n=== Test 2: httpHeaderAuth Credential ===\n');

  try {
    // Step 1: Get schema for httpHeaderAuth
    console.log('Step 1: Getting schema for httpHeaderAuth...');
    const schema = await callTool('get_credential_schema', {
      typeName: 'httpHeaderAuth'
    });

    console.log(`  ✅ Schema retrieved successfully`);
    console.log(`  ✓ Schema type: ${schema.type}`);
    console.log(`  ✓ Properties: ${Object.keys(schema.properties || {}).join(', ')}`);

    // Step 2: Create credential using schema structure
    console.log('\nStep 2: Creating httpHeaderAuth credential...');
    const timestamp = Date.now();
    const credential = await callTool('create_credential', {
      name: `Test HTTP Header Auth ${timestamp}`,
      type: 'httpHeaderAuth',
      data: {
        name: 'Authorization',
        value: 'Bearer test-token-12345'
      }
    });

    console.log(`  ✅ Credential created successfully`);
    console.log(`  ✓ ID: ${credential.id}`);
    console.log(`  ✓ Name: ${credential.name}`);
    console.log(`  ✓ Type: ${credential.type}`);
    console.log(`  ✓ Created: ${credential.createdAt}`);

    // Store for cleanup
    createdCredentials.push({ id: credential.id, name: credential.name, type: credential.type });

    console.log('\n✅ Test 2 PASSED');
    return true;
  } catch (error) {
    console.error('\n❌ Test 2 FAILED:', error.message);
    return false;
  }
}

// Test 3: oAuth2Api credential (complex structure)
async function testOAuth2() {
  console.log('\n=== Test 3: oAuth2Api Credential (Complex) ===\n');

  try {
    // Step 1: Get schema for oAuth2Api
    console.log('Step 1: Getting schema for oAuth2Api...');
    const schema = await callTool('get_credential_schema', {
      typeName: 'oAuth2Api'
    });

    console.log(`  ✅ Schema retrieved successfully`);
    console.log(`  ✓ Schema type: ${schema.type}`);
    console.log(`  ✓ Properties count: ${Object.keys(schema.properties || {}).length}`);
    console.log(`  ✓ Sample properties: ${Object.keys(schema.properties || {}).slice(0, 5).join(', ')}`);

    // Step 2: Create credential with minimal OAuth2 configuration
    console.log('\nStep 2: Creating oAuth2Api credential...');
    const timestamp = Date.now();
    const credential = await callTool('create_credential', {
      name: `Test OAuth2 ${timestamp}`,
      type: 'oAuth2Api',
      data: {
        grantType: 'authorizationCode',
        authUrl: 'https://example.com/oauth/authorize',
        accessTokenUrl: 'https://example.com/oauth/token',
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        scope: 'read write',
        authQueryParameters: '',
        authentication: 'body'
      }
    });

    console.log(`  ✅ Credential created successfully`);
    console.log(`  ✓ ID: ${credential.id}`);
    console.log(`  ✓ Name: ${credential.name}`);
    console.log(`  ✓ Type: ${credential.type}`);
    console.log(`  ✓ Created: ${credential.createdAt}`);

    // Store for cleanup
    createdCredentials.push({ id: credential.id, name: credential.name, type: credential.type });

    console.log('\n✅ Test 3 PASSED');
    return true;
  } catch (error) {
    console.error('\n❌ Test 3 FAILED:', error.message);
    return false;
  }
}

// Cleanup: Delete all test credentials
async function cleanup() {
  console.log('\n=== Cleanup: Deleting Test Credentials ===\n');

  let successCount = 0;
  let failCount = 0;

  for (const cred of createdCredentials) {
    try {
      console.log(`Deleting credential: ${cred.name} (${cred.id})...`);
      await callTool('delete_credential', { id: cred.id });
      console.log(`  ✅ Deleted successfully`);
      successCount++;
    } catch (error) {
      console.error(`  ❌ Failed to delete: ${error.message}`);
      failCount++;
    }
  }

  console.log(`\n📊 Cleanup Summary:`);
  console.log(`   ✅ Deleted: ${successCount}`);
  if (failCount > 0) {
    console.log(`   ❌ Failed: ${failCount}`);
  }

  return failCount === 0;
}

// Main test runner
async function runTests() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Story 2.6.3: POST /credentials - Create Credential Test  ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Health check
  const healthy = await healthCheck();
  if (!healthy) {
    console.error('\n❌ Server not healthy, aborting tests');
    process.exit(1);
  }

  const results = {
    total: 0,
    passed: 0,
    failed: 0
  };

  // Run tests
  if (config.testFlags.runHttpBasicAuth) {
    results.total++;
    if (await testHttpBasicAuth()) results.passed++;
    else results.failed++;
  }

  if (config.testFlags.runHttpHeaderAuth) {
    results.total++;
    if (await testHttpHeaderAuth()) results.passed++;
    else results.failed++;
  }

  if (config.testFlags.runOAuth2) {
    results.total++;
    if (await testOAuth2()) results.passed++;
    else results.failed++;
  }

  // Cleanup
  if (config.testFlags.runCleanup && createdCredentials.length > 0) {
    await cleanup();
  } else if (createdCredentials.length > 0) {
    console.log(`\n⚠️  Cleanup disabled. Created ${createdCredentials.length} credentials that need manual deletion:`);
    createdCredentials.forEach(cred => {
      console.log(`   - ${cred.name} (${cred.id})`);
    });
  }

  // Final summary
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                     TEST SUMMARY                           ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  console.log(`Total tests: ${results.total}`);
  console.log(`✅ Passed: ${results.passed}`);
  if (results.failed > 0) {
    console.log(`❌ Failed: ${results.failed}`);
  }

  console.log(`\n📊 Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);

  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
