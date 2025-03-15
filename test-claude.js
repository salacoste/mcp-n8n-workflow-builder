const { spawn } = require('child_process');
const path = require('path');

// Путь к исполняемому файлу n8n-workflow-builder
const builderPath = path.join(__dirname, 'build', 'index.js');

// Запускаем n8n-workflow-builder в режиме JSON-RPC
const builder = spawn('node', [builderPath], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: { ...process.env }
});

// Переменная для хранения ID созданного рабочего процесса
let createdWorkflowId = '';

// Обработка вывода от сервера
builder.stdout.on('data', (data) => {
  console.log(`STDOUT: ${data}`);
  
  // Попытка разобрать JSON ответ
  try {
    const strResponse = data.toString();
    // Проверяем, является ли ответ JSON
    if (strResponse.trim().startsWith('{')) {
      const response = JSON.parse(strResponse);
      
      // Проверяем, содержит ли ответ данные от создания рабочего процесса
      if (response.result && response.result.content && 
          response.result.content[0] && response.result.content[0].text) {
        
        try {
          const content = JSON.parse(response.result.content[0].text);
          // Проверяем, является ли это ответом от create_workflow
          if (content.id && content.name && content.name.includes('Claude Test')) {
            createdWorkflowId = content.id;
            console.log(`Получен ID рабочего процесса: ${createdWorkflowId}`);
          }
        } catch (err) {
          // Игнорируем ошибки парсинга контента
        }
      }
    }
  } catch (err) {
    // Игнорируем ошибки парсинга JSON
  }
});

builder.stderr.on('data', (data) => {
  console.error(`STDERR: ${data}`);
});

// Отправка JSON-RPC запросов
const sendRequest = (method, params = {}) => {
  const request = {
    jsonrpc: '2.0',
    id: Date.now(),
    method,
    params
  };
  
  const requestStr = JSON.stringify(request) + '\n';
  builder.stdin.write(requestStr);
  console.log(`Отправлен запрос: ${requestStr}`);
};

// Тестовые запросы
setTimeout(() => {
  // Инициализация
  sendRequest('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'test-client', version: '1.0.0' }
  });
  
  // Получение списка инструментов
  setTimeout(() => {
    sendRequest('tools/list');
  }, 1000);
  
  // Получение списка рабочих процессов
  setTimeout(() => {
    sendRequest('tools/call', {
      name: 'list_workflows',
      arguments: {}
    });
  }, 2000);
  
  // Создание рабочего процесса
  setTimeout(() => {
    sendRequest('tools/call', {
      name: 'create_workflow',
      arguments: {
        name: 'Claude Test Workflow',
        nodes: [
          {
            name: 'Start',
            type: 'n8n-nodes-base.start'
          },
          {
            name: 'Set',
            type: 'n8n-nodes-base.set',
            parameters: {
              values: [
                {
                  name: 'data',
                  value: 'Hello from Claude!'
                }
              ]
            }
          }
        ],
        connections: [
          {
            source: 'Start',
            target: 'Set'
          }
        ]
      }
    });
  }, 3000);
  
  // Получение обновленного списка рабочих процессов
  setTimeout(() => {
    sendRequest('tools/call', {
      name: 'list_workflows',
      arguments: {}
    });
  }, 4000);
  
  // Активация рабочего процесса - используем таймер для ожидания получения ID
  setTimeout(() => {
    if (createdWorkflowId) {
      console.log(`Активация рабочего процесса с ID: ${createdWorkflowId}`);
      sendRequest('tools/call', {
        name: 'activate_workflow',
        arguments: {
          id: createdWorkflowId
        }
      });
    } else {
      console.log('Не удалось получить ID рабочего процесса для активации');
    }
  }, 5000);
  
  // Получение деталей активированного рабочего процесса
  setTimeout(() => {
    if (createdWorkflowId) {
      sendRequest('tools/call', {
        name: 'get_workflow',
        arguments: {
          id: createdWorkflowId
        }
      });
    }
  }, 6000);
  
  // Получение списка исполнений
  setTimeout(() => {
    sendRequest('tools/call', {
      name: 'list_executions',
      arguments: {}
    });
  }, 7000);
  
  // Завершение теста
  setTimeout(() => {
    console.log('Тест завершен');
    builder.kill();
  }, 8000);
}, 500);

// Обработка завершения процесса
builder.on('close', (code) => {
  console.log(`Процесс завершен с кодом ${code}`);
}); 