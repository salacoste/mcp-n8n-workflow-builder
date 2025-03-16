// Скрипт для тестирования MCP-сервера через прямое подключение
const { spawn } = require('child_process');
const path = require('path');

// Путь к серверу 
const serverPath = path.resolve(__dirname, 'build/index.js');

// Создаем экземпляр сервера
const server = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: process.env
});

// Логируем все ошибки сервера
server.stderr.on('data', data => {
  console.error(`[SERVER] stderr: ${data.toString().trim()}`);
});

// Накапливаем ответ сервера
let responseBuffer = '';
server.stdout.on('data', data => {
  const content = data.toString();
  responseBuffer += content;
  
  // Проверяем, есть ли в буфере полный JSON-ответ
  try {
    // Ищем конец JSON-объекта
    if (content.includes('}') && responseBuffer.includes('{')) {
      const jsonStr = responseBuffer.trim();
      const response = JSON.parse(jsonStr);
      console.log('Received response:', JSON.stringify(response, null, 2));
      
      // Очищаем буфер
      responseBuffer = '';
      
      // Если это был запрос на список инструментов, проверяем наши инструменты
      if (response.id === '1' && response.result && response.result.tools) {
        const tools = response.result.tools;
        
        console.log('\nChecking for our tools:');
        const executeWorkflow = tools.find(t => t.name === 'execute_workflow');
        if (executeWorkflow) {
          console.log('✅ execute_workflow tool found!');
          console.log(`Description: ${executeWorkflow.description}`);
        } else {
          console.log('❌ execute_workflow tool not found');
        }
        
        // Теперь проверим наш новый шаблон
        sendPromptListRequest();
      }
      
      // Если это был запрос на список шаблонов, проверяем наш новый шаблон
      if (response.id === '2' && response.result && response.result.prompts) {
        const prompts = response.result.prompts;
        
        console.log('\nChecking for our prompt template:');
        const apiPollingPrompt = prompts.find(p => p.id === 'api-polling-workflow');
        if (apiPollingPrompt) {
          console.log('✅ api-polling-workflow prompt found!');
          console.log(`Name: ${apiPollingPrompt.name}`);
          console.log(`Description: ${apiPollingPrompt.description}`);
        } else {
          console.log('❌ api-polling-workflow prompt not found');
        }
        
        // Завершаем тестирование
        console.log('\nTest completed, shutting down...');
        server.kill();
        process.exit(0);
      }
    }
  } catch (e) {
    console.error('Error parsing JSON response:', e.message);
    console.error('Partial response buffer:', responseBuffer);
  }
});

// Функция для отправки запроса серверу
function sendRequest(request) {
  console.log(`Sending request: ${JSON.stringify(request, null, 2)}`);
  server.stdin.write(JSON.stringify(request) + '\n');
}

// Отправляем запрос для получения списка инструментов
function sendToolsListRequest() {
  const request = {
    jsonrpc: '2.0',
    id: '1',
    method: 'tools/list',
    params: {}
  };
  
  sendRequest(request);
}

// Отправляем запрос для получения списка шаблонов
function sendPromptListRequest() {
  const request = {
    jsonrpc: '2.0',
    id: '2',
    method: 'prompts/list',
    params: {}
  };
  
  sendRequest(request);
}

// Запускаем тест
console.log('Starting MCP test...');
sendToolsListRequest(); 