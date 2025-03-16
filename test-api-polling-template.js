const axios = require('axios');
require('dotenv').config();

// MCP request format for filling a prompt
const requestData = {
  jsonrpc: '2.0',
  id: '1',
  method: 'prompts/fill',
  params: {
    promptId: 'api-polling-workflow',
    variables: {
      workflow_name: 'Test API Polling Workflow',
      interval_value: '5',
      api_url: 'https://jsonplaceholder.typicode.com/posts',
      filter_path: 'items || $json', // Поддерживает как items, так и прямые данные
      filter_condition: 'item.id < 10'
    }
  }
};

// Выполняем тест
async function runTest() {
  try {
    console.log('Sending request to fill prompt template...');
    const response = await axios.post('http://localhost:3000/jsonrpc', requestData);
    
    if (response.data.error) {
      console.error('Error filling prompt:', response.data.error);
      return;
    }
    
    console.log('Successfully filled prompt template:');
    
    // Разбираем результат
    const content = response.data.result?.content;
    if (content && content.length > 0) {
      // Получаем данные рабочего процесса из ответа
      const workflowData = JSON.parse(content[0].text);
      console.log(JSON.stringify(workflowData, null, 2));
      
      // Проверяем, что переменные были заполнены правильно
      verifyTemplateVariables(workflowData);
    }
    
    console.log('Template test completed');
  } catch (error) {
    console.error('Error testing prompt template:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Response data:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

// Проверяет, что переменные были заполнены правильно
function verifyTemplateVariables(workflow) {
  console.log('\nVerifying template variables:');
  
  // Проверка имени рабочего процесса
  console.log(`Name: ${workflow.name === 'Test API Polling Workflow' ? '✅' : '❌'}`);
  
  // Найдем узел HTTP Request
  const httpNode = workflow.nodes.find(node => node.name === 'HTTP Request');
  if (httpNode) {
    console.log(`HTTP URL: ${httpNode.parameters.url === 'https://jsonplaceholder.typicode.com/posts' ? '✅' : '❌'}`);
  } else {
    console.log('HTTP Node: ❌ (not found)');
  }
  
  // Найдем узел Interval Trigger
  const intervalNode = workflow.nodes.find(node => node.name === 'Interval Trigger');
  if (intervalNode) {
    console.log(`Interval: ${intervalNode.parameters.interval === '5' ? '✅' : '❌'}`);
  } else {
    console.log('Interval Node: ❌ (not found)');
  }
  
  // Найдем узел Filter Data и проверим его код
  const filterNode = workflow.nodes.find(node => node.name === 'Filter Data');
  if (filterNode) {
    const jsCode = filterNode.parameters.jsCode;
    const hasFilterPath = jsCode.includes('items || $json');
    const hasFilterCondition = jsCode.includes('item.id < 10');
    console.log(`Filter path: ${hasFilterPath ? '✅' : '❌'}`);
    console.log(`Filter condition: ${hasFilterCondition ? '✅' : '❌'}`);
  } else {
    console.log('Filter Node: ❌ (not found)');
  }
}

runTest(); 