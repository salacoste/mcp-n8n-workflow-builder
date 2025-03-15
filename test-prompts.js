const { spawn } = require('child_process');
const path = require('path');

// Путь к исполняемому файлу n8n-workflow-builder
const builderPath = path.join(__dirname, 'build', 'index.js');

// Запускаем n8n-workflow-builder в режиме JSON-RPC
const builder = spawn('node', [builderPath], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: { ...process.env }
});

// Обработка вывода от сервера
builder.stdout.on('data', (data) => {
  console.log(`STDOUT: ${data}`);
});

builder.stderr.on('data', (data) => {
  console.error(`STDERR: ${data}`);
});

function sendRequest(method, params = {}) {
  const request = {
    jsonrpc: '2.0',
    id: Date.now(),
    method,
    params
  };
  
  console.log(`Отправлен запрос: ${JSON.stringify(request)}`);
  builder.stdin.write(JSON.stringify(request) + '\n');
}

// Последовательность тестовых запросов
setTimeout(() => {
  // Инициализация
  sendRequest('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: {
      name: 'test-client',
      version: '1.0.0'
    }
  });
}, 1000);

setTimeout(() => {
  // Получение списка промтов
  sendRequest('prompts/list');
}, 2000);

setTimeout(() => {
  // Заполнение промта для рабочего процесса с расписанием
  sendRequest('prompts/fill', {
    promptId: 'schedule-workflow',
    variables: {
      workflow_name: 'Мой тестовый рабочий процесс',
      schedule_expression: '*/10 * * * *',
      workflow_message: 'Тестовое сообщение от промта'
    }
  });
}, 3000);

setTimeout(() => {
  // Заполнение промта для HTTP вебхука
  sendRequest('prompts/fill', {
    promptId: 'http-webhook-workflow',
    variables: {
      workflow_name: 'Тестовый HTTP вебхук',
      webhook_path: 'test-webhook',
      response_message: 'Успешно обработано!'
    }
  });
}, 4000);

// Завершение процесса после всех тестов
setTimeout(() => {
  console.log('Тест завершен');
  builder.kill();
  process.exit(0);
}, 5000); 