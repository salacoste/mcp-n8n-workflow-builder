#!/usr/bin/env node

/**
 * Quick Test: Check if PATCH /workflows/{id} works on n8n v2.1.4
 */

const axios = require('axios');

const config = {
  mcpServerUrl: 'http://localhost:3456/mcp',
  healthCheckUrl: 'http://localhost:3456/health'
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
  console.error('=== Проверка: PATCH /workflows/{id} на n8n v2.1.4 ===\n');

  let workflowId = null;

  try {
    // Check server health
    const health = await axios.get(config.healthCheckUrl);
    console.error(`✓ Сервер работает: ${health.data.status}\n`);

    // Step 1: Create test workflow
    console.error('Шаг 1: Создаю тестовый workflow...');
    const createResult = await callTool('create_workflow', {
      name: 'PATCH Test Workflow',
      nodes: [
        {
          name: 'Start',
          type: 'n8n-nodes-base.scheduleTrigger',
          position: [250, 300],
          parameters: {
            rule: { interval: [{ field: 'hours', hoursInterval: 1 }] }
          }
        }
      ],
      connections: [],
      tags: ['test-tag']
    });
    const workflow = JSON.parse(createResult.content[0].text);
    workflowId = workflow.id;
    console.error(`✓ Workflow создан: ${workflowId}`);
    console.error(`  Имя: ${workflow.name}`);
    console.error(`  Теги: ${workflow.tags}\n`);

    // Step 2: Try PATCH to update name only
    console.error('Шаг 2: Пробую PATCH для изменения имени...');
    try {
      const patchResult = await callTool('patch_workflow', {
        id: workflowId,
        name: 'UPDATED via PATCH on v2.1.4'
      });
      const patched = JSON.parse(patchResult.content[0].text);

      console.error('✅ УСПЕХ! PATCH работает!');
      console.error(`  Новое имя: ${patched.name}`);
      console.error(`  Nodes сохранены: ${patched.nodes.length} nodes`);
      console.error(`  Теги сохранены: ${patched.tags}\n`);

      console.error('🎉 PATCH МЕТОД РАБОТАЕТ НА n8n v2.1.4! 🎉');
      console.error('Story 2.4 можно разблокировать!\n');

    } catch (patchError) {
      if (patchError.message.includes('405')) {
        console.error('❌ PATCH всё ещё не поддерживается');
        console.error('   Ошибка: 405 Method Not Allowed');
        console.error('   Story 2.4 остаётся BLOCKED\n');
      } else if (patchError.message.includes('DISABLED')) {
        console.error('⚠️  Инструмент patch_workflow отключен');
        console.error('   Нужно включить в src/index.ts\n');
      } else {
        throw patchError;
      }
    }

    // Cleanup
    if (workflowId) {
      console.error('Очистка: Удаляю тестовый workflow...');
      await callTool('delete_workflow', { id: workflowId });
      console.error('✓ Тестовый workflow удалён\n');
    }

  } catch (error) {
    console.error(`\n✗ Ошибка: ${error.message}\n`);

    // Cleanup on error
    if (workflowId) {
      try {
        await callTool('delete_workflow', { id: workflowId });
        console.error('✓ Тестовый workflow удалён\n');
      } catch (cleanupError) {
        // Ignore cleanup errors
      }
    }

    process.exit(1);
  }
}

main();
