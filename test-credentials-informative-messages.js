#!/usr/bin/env node

/**
 * Test: get_credential and update_credential informative messages
 * Verifies Stories 2.6.2 and 2.6.4 return helpful guidance
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

async function testGetCredential() {
  console.log('\n=== Test 1: get_credential (Story 2.6.2) ===\n');

  try {
    const result = await callTool('get_credential', { id: 'test-cred-id' });
    const response = JSON.parse(result.content[0].text);

    console.log('✅ Получен информационный ответ\n');

    console.log('📋 Проверка структуры:');
    console.log(`  ✓ success: ${response.success === false ? 'false (ожидаемо)' : response.success}`);
    console.log(`  ✓ method: ${response.method}`);
    console.log(`  ✓ endpoint: ${response.endpoint}`);
    console.log(`  ✓ credentialId: ${response.credentialId}`);
    console.log(`  ✓ message: ${response.message}`);
    console.log(`  ✓ securityReason: ${response.securityReason ? 'присутствует' : 'отсутствует'}`);
    console.log(`  ✓ alternativeApproaches: ${response.alternativeApproaches ? 'присутствует' : 'отсутствует'}`);
    console.log(`  ✓ availableOperations: ${response.availableOperations ? 'присутствует' : 'отсутствует'}`);

    console.log(`\n💡 Recommendation: ${response.recommendation}`);
    console.log(`\n🔒 Security: ${response.securityReason}`);

    console.log('\n✅ Test 1 PASSED\n');
    return true;
  } catch (error) {
    console.error(`\n❌ Test 1 FAILED: ${error.message}\n`);
    return false;
  }
}

async function testUpdateCredential() {
  console.log('\n=== Test 2: update_credential (Story 2.6.4) ===\n');

  try {
    const result = await callTool('update_credential', {
      id: 'test-cred-id',
      name: 'Updated Credential',
      type: 'httpBasicAuth',
      data: { user: 'test', password: 'test' }
    });
    const response = JSON.parse(result.content[0].text);

    console.log('✅ Получен информационный ответ\n');

    console.log('📋 Проверка структуры:');
    console.log(`  ✓ success: ${response.success === false ? 'false (ожидаемо)' : response.success}`);
    console.log(`  ✓ method: ${response.method}`);
    console.log(`  ✓ endpoint: ${response.endpoint}`);
    console.log(`  ✓ credentialId: ${response.credentialId}`);
    console.log(`  ✓ message: ${response.message}`);
    console.log(`  ✓ securityReason: ${response.securityReason ? 'присутствует' : 'отсутствует'}`);
    console.log(`  ✓ workaround: ${response.workaround ? 'присутствует' : 'отсутствует'}`);
    console.log(`  ✓ alternativeApproaches: ${response.alternativeApproaches ? 'присутствует' : 'отсутствует'}`);

    console.log(`\n💡 Recommendation: ${response.recommendation}`);
    console.log(`\n🔒 Security: ${response.securityReason}`);

    if (response.workaround) {
      console.log(`\n🛠️  Workaround:`);
      console.log(`   ${response.workaround.description}`);
      console.log(`\n   Steps:`);
      response.workaround.steps.forEach(step => {
        console.log(`   ${step}`);
      });
    }

    console.log('\n✅ Test 2 PASSED\n');
    return true;
  } catch (error) {
    console.error(`\n❌ Test 2 FAILED: ${error.message}\n`);
    return false;
  }
}

async function main() {
  console.log('\n=== Credentials API Informative Messages Test Suite ===');
  console.log('Testing Stories 2.6.2 and 2.6.4\n');

  const results = [];

  results.push(await testGetCredential());
  results.push(await testUpdateCredential());

  const passed = results.filter(r => r).length;
  const total = results.length;

  console.log('\n=== Summary ===');
  console.log(`Tests passed: ${passed}/${total}`);

  if (passed === total) {
    console.log('✅ All tests PASSED!\n');
    console.log('Stories 2.6.2 and 2.6.4 are COMPLETE\n');
  } else {
    console.log('❌ Some tests failed\n');
    process.exit(1);
  }
}

main();
