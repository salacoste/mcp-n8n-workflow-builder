const axios = require('axios');
require('dotenv').config();

// Получаем адрес хоста и API ключ из переменных окружения
const N8N_HOST = process.env.N8N_HOST || 'http://localhost:5678';
const N8N_API_KEY = process.env.N8N_API_KEY || '';

// Конфигурация API клиента
const api = axios.create({
  baseURL: N8N_HOST,
  headers: {
    'Content-Type': 'application/json',
    'X-N8N-API-KEY': N8N_API_KEY
  }
});

// Создаем тестовый рабочий процесс с Manual Trigger
async function createTestWorkflow() {
  try {
    // Рабочий процесс с Schedule Trigger и Code узлом
    const workflow = {
      name: "Test Scheduled Workflow",
      nodes: [
        {
          id: "node_1",
          name: "Schedule Trigger",
          type: "n8n-nodes-base.cron",
          parameters: {
            rule: "*/10 * * * *"  // Каждые 10 минут
          },
          position: [100, 300],
          typeVersion: 1
        },
        {
          id: "node_2",
          name: "Code",
          type: "n8n-nodes-base.code",
          parameters: {
            jsCode: `// Код для выполнения
const now = new Date();
return {
  json: {
    message: 'Workflow executed successfully!',
    timestamp: now.toISOString(),
    executionId: $execution.id
  }
}`
          },
          position: [300, 300],
          typeVersion: 1
        }
      ],
      connections: {
        "node_1": {
          main: [
            [
              {
                node: "node_2",
                type: "main",
                index: 0
              }
            ]
          ]
        }
      },
      settings: {
        executionOrder: "v1"
      }
    };

    console.log('Sending workflow creation request...');
    const response = await api.post('/workflows', workflow);
    console.log('Workflow created successfully:');
    console.log(JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Error creating workflow:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Response data:', error.response.data);
    } else {
      console.error(error.message);
    }
    throw error;
  }
}

// Активируем рабочий процесс
async function activateWorkflow(id) {
  try {
    console.log(`Activating workflow: ${id}`);
    const response = await api.post(`/workflows/${id}/activate`, {});
    console.log('Activation response:');
    console.log(JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Error activating workflow:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Response data:', error.response.data);
    } else {
      console.error(error.message);
    }
    throw error;
  }
}

// Запускаем рабочий процесс вручную
async function executeWorkflow(id) {
  try {
    console.log(`Manually executing workflow: ${id}`);
    
    // Пробуем альтернативный эндпоинт с CLI-синтаксисом
    const response = await api.post(`/workflows/${id}/execute`, {});
    console.log('Execution response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Если есть executionId, получаем результаты выполнения
    if (response.data && response.data.executionId) {
      console.log(`Getting execution details for ID: ${response.data.executionId}`);
      // Даем время на обработку
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const executionResponse = await api.get(`/executions/${response.data.executionId}`);
      console.log('Execution details:');
      console.log(JSON.stringify(executionResponse.data, null, 2));
      return executionResponse.data;
    }
    
    return response.data;
  } catch (error) {
    console.error('Error executing workflow:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Response data:', error.response.data);
    } else {
      console.error(error.message);
    }
    throw error;
  }
}

// Выполняем тесты
async function runTests() {
  try {
    // Создаем новый рабочий процесс
    const workflow = await createTestWorkflow();
    console.log(`Created workflow with ID: ${workflow.id}`);
    
    // Активируем рабочий процесс
    await activateWorkflow(workflow.id);
    
    // Запускаем его вручную
    await executeWorkflow(workflow.id);
    
    console.log('All tests completed successfully');
  } catch (error) {
    console.error('Tests failed');
  }
}

runTests(); 