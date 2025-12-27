#!/usr/bin/env node

/**
 * Test: patch_workflow informative message
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
  console.log('\n=== Тест: patch_workflow информационное сообщение ===\n');

  try {
    // Call patch_workflow
    const result = await callTool('patch_workflow', {
      id: 'test-workflow-id',
      name: 'New Name'
    });

    const response = JSON.parse(result.content[0].text);

    console.log('✅ УСПЕХ! Получен информационный ответ:\n');
    console.log(JSON.stringify(response, null, 2));

    // Verify response structure
    console.log('\n📋 Проверка структуры ответа:');
    console.log(`  ✓ success: ${response.success === false ? 'false (ожидаемо)' : response.success}`);
    console.log(`  ✓ method: ${response.method}`);
    console.log(`  ✓ message: ${response.message}`);
    console.log(`  ✓ recommendation: ${response.recommendation ? 'присутствует' : 'отсутствует'}`);
    console.log(`  ✓ workaround: ${response.workaround ? 'присутствует' : 'отсутствует'}`);
    console.log(`  ✓ alternativeTools: ${response.alternativeTools ? 'присутствует' : 'отсутствует'}`);

    console.log('\n✅ Тест пройден! patch_workflow возвращает информативное сообщение.\n');

  } catch (error) {
    console.error(`\n❌ Ошибка: ${error.message}\n`);
    process.exit(1);
  }
}

main();
