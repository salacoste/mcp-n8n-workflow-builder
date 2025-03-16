const axios = require('axios');

// Запрос для получения списка инструментов
const mcpRequest = {
  jsonrpc: '2.0',
  id: '1',
  method: 'tools/list',
  params: {}
};

// Запускаем тест
async function testTools() {
  try {
    // Локальный порт может отличаться, поэтому пробуем несколько вариантов
    const ports = [3000, 3001, 3002, 8000, 8080];
    let success = false;
    
    for (const port of ports) {
      try {
        console.log(`Trying MCP server at localhost:${port}...`);
        const response = await axios.post(`http://localhost:${port}/jsonrpc`, mcpRequest, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 1000 // Таймаут 1 секунда
        });
        
        if (response.data && !response.data.error) {
          console.log(`\nSuccess! Connected to MCP server at port ${port}\n`);
          console.log('Available tools:');
          
          const tools = response.data.result?.tools || [];
          tools.forEach(tool => {
            console.log(`- ${tool.name}: ${tool.description}`);
          });
          
          // Проверяем наличие нашего нового инструмента
          const executeWorkflowTool = tools.find(t => t.name === 'execute_workflow');
          if (executeWorkflowTool) {
            console.log('\n✅ execute_workflow tool found!');
            console.log('Description:', executeWorkflowTool.description);
          } else {
            console.log('\n❌ execute_workflow tool not found in the list');
          }
          
          success = true;
          break;
        }
      } catch (error) {
        // Просто переходим к следующему порту
      }
    }
    
    if (!success) {
      console.error('\nFailed to connect to MCP server on any port. Make sure the server is running.');
    }
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testTools(); 