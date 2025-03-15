import { WorkflowSpec, WorkflowInput, LegacyWorkflowConnection, ConnectionMap } from '../types/workflow';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

/**
 * Проверяет и преобразует входные данные рабочего процесса в формат, принимаемый API n8n
 */
export function validateWorkflowSpec(input: WorkflowInput): WorkflowSpec {
  if (!input || typeof input !== 'object') {
    throw new McpError(ErrorCode.InvalidParams, 'Workflow spec must be an object');
  }
  
  if (!Array.isArray(input.nodes)) {
    throw new McpError(ErrorCode.InvalidParams, 'Workflow nodes must be an array');
  }
  
  // Проверяем и преобразуем узлы
  const formattedNodes = (input.nodes || []).map((node, index) => {
    if (typeof node !== 'object' || typeof node.type !== 'string' || typeof node.name !== 'string') {
      throw new McpError(ErrorCode.InvalidParams, 'Each node must have a type and name');
    }
    
    // Генерируем ID, если его нет
    const nodeId = node.id || `node_${index + 1}`;
    
    // Если это узел типа Set, структурируем параметры в соответствии с ожиданиями n8n API
    if (node.type === 'n8n-nodes-base.set' && node.parameters && node.parameters.values) {
      // Создаем правильную структуру параметров узла Set для версии n8n 1.82.3+
      const formattedValues = node.parameters.values.map((value: any) => {
        return {
          name: value.name,
          value: value.value,
          type: value.type || 'string',
          parameterType: 'propertyValue'
        };
      });
      
      // Полностью переопределяем параметры для узла Set
      node.parameters = {
        values: formattedValues,
        options: {
          dotNotation: true
        },
        mode: 'manual'
      };
    }
    
    // Создаем правильно отформатированный узел
    return {
      id: nodeId,
      name: node.name,
      type: node.type,
      parameters: node.parameters || {},
      position: node.position || [index * 200, 300], // Размещаем узлы по горизонтали с шагом 200
      typeVersion: 1
    };
  });
  
  // Создаем словарь узлов по ID для быстрого доступа
  const nodeDict: Record<string, { id: string; name: string; index: number }> = {};
  formattedNodes.forEach((node, index) => {
    nodeDict[node.id] = { id: node.id, name: node.name, index };
  });
  
  // Преобразуем соединения в формат n8n
  let connections: ConnectionMap = {};
  
  if (input.connections && Array.isArray(input.connections)) {
    input.connections.forEach((conn: LegacyWorkflowConnection) => {
      // Находим узлы по имени, если source и target - это имена узлов
      const sourceNode = findNodeByNameOrId(formattedNodes, conn.source);
      const targetNode = findNodeByNameOrId(formattedNodes, conn.target);
      
      if (!sourceNode || !targetNode) {
        throw new McpError(ErrorCode.InvalidParams, `Connection references non-existent node: ${conn.source} -> ${conn.target}`);
      }
      
      // Создаем структуру соединений, если она еще не существует
      if (!connections[sourceNode.id]) {
        connections[sourceNode.id] = { main: [] };
      }
      
      // Убедимся, что массив для sourceOutput существует
      const sourceOutput = conn.sourceOutput || 0;
      while (connections[sourceNode.id].main.length <= sourceOutput) {
        connections[sourceNode.id].main.push([]);
      }
      
      // Добавляем соединение
      connections[sourceNode.id].main[sourceOutput].push({
        node: targetNode.id,
        type: 'main',
        index: conn.targetInput || 0
      });
    });
  }
  
  // Настройки по умолчанию
  const defaultSettings = { executionOrder: 'v1' };
  const mergedSettings = input.settings 
    ? { ...defaultSettings, ...input.settings } 
    : defaultSettings;
  
  // Возвращаем отформатированную спецификацию рабочего процесса
  return {
    name: input.name || 'New Workflow',
    nodes: formattedNodes,
    connections: connections,
    settings: mergedSettings
  };
}

/**
 * Находит узел по имени или ID
 */
function findNodeByNameOrId(nodes: Array<any>, nameOrId: string): any {
  return nodes.find(node => node.id === nameOrId || node.name === nameOrId);
}
