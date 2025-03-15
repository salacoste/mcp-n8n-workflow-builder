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

// Создаем тестовый рабочий процесс
async function createTestWorkflow() {
  try {
    // Простой рабочий процесс с двумя узлами
    const workflow = {
      name: "Test Workflow",
      nodes: [
        {
          id: "node_1",
          name: "Start",
          type: "n8n-nodes-base.start",
          parameters: {},
          position: [100, 300],
          typeVersion: 1
        },
        {
          id: "node_2",
          name: "Set",
          type: "n8n-nodes-base.set",
          parameters: {
            values: [
              {
                name: "data",
                value: "test data"
              }
            ]
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

// Список всех рабочих процессов
async function listWorkflows() {
  try {
    console.log('Getting workflows list...');
    const response = await api.get('/workflows');
    console.log('Workflows:');
    console.log(JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Error listing workflows:');
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
    await listWorkflows();
    await createTestWorkflow();
    await listWorkflows();
    console.log('All tests completed successfully');
  } catch (error) {
    console.error('Tests failed');
  }
}

runTests(); 