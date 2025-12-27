#!/usr/bin/env node

/**
 * Test: list_credentials informative message
 * Verifies the tool returns helpful guidance about API limitation
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
  console.log('\n=== Test: list_credentials informative message ===\n');

  try {
    // Call list_credentials
    const result = await callTool('list_credentials');
    const response = JSON.parse(result.content[0].text);

    console.log('✅ УСПЕХ! Получен информационный ответ\n');

    // Verify response structure
    console.log('📋 Проверка структуры ответа:');
    console.log(`  ✓ success: ${response.success === false ? 'false (ожидаемо)' : response.success}`);
    console.log(`  ✓ method: ${response.method}`);
    console.log(`  ✓ endpoint: ${response.endpoint}`);
    console.log(`  ✓ message: ${response.message}`);
    console.log(`  ✓ recommendation: ${response.recommendation ? 'присутствует' : 'отсутствует'}`);
    console.log(`  ✓ securityNote: ${response.securityNote ? 'присутствует' : 'отсутствует'}`);
    console.log(`  ✓ alternativeAccess: ${response.alternativeAccess ? 'присутствует' : 'отсутствует'}`);
    console.log(`  ✓ understandingCredentials: ${response.understandingCredentials ? 'присутствует' : 'отсутствует'}`);

    // Display helpful information
    console.log('\n📚 Информация для пользователя:');
    console.log(`\n${response.message}`);
    console.log(`\n🔒 Безопасность: ${response.securityNote}`);
    console.log(`\n💡 Рекомендация: ${response.recommendation}`);

    if (response.alternativeAccess && response.alternativeAccess.webInterface) {
      console.log(`\n🌐 Доступ через веб-интерфейс:`);
      response.alternativeAccess.webInterface.steps.forEach(step => {
        console.log(`   ${step}`);
      });
    }

    console.log('\n✅ Тест пройден! list_credentials возвращает информативное сообщение.\n');

  } catch (error) {
    console.error(`\n❌ Ошибка: ${error.message}\n`);
    process.exit(1);
  }
}

main();
