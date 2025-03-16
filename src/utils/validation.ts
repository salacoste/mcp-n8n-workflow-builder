import { WorkflowSpec, WorkflowInput, LegacyWorkflowConnection, ConnectionMap } from '../types/workflow';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

/**
 * Validates and transforms workflow input data into a format accepted by the n8n API
 */
export function validateWorkflowSpec(input: WorkflowInput): WorkflowSpec {
  if (!input || typeof input !== 'object') {
    throw new McpError(ErrorCode.InvalidParams, 'Workflow spec must be an object');
  }
  
  if (!Array.isArray(input.nodes)) {
    throw new McpError(ErrorCode.InvalidParams, 'Workflow nodes must be an array');
  }
  
  if (!Array.isArray(input.connections)) {
    throw new McpError(ErrorCode.InvalidParams, 'Workflow connections must be an array');
  }
  
  if (input.connections.length === 0) {
    throw new McpError(ErrorCode.InvalidParams, 'Workflow connections array cannot be empty. Nodes must be connected.');
  }
  
  // Check and transform nodes
  const formattedNodes = (input.nodes || []).map((node, index) => {
    if (typeof node !== 'object' || typeof node.type !== 'string' || typeof node.name !== 'string') {
      throw new McpError(ErrorCode.InvalidParams, 'Each node must have a type and name');
    }
    
    // Generate ID if it doesn't exist
    const nodeId = node.id || `node_${index + 1}`;
    
    // If this is a Set type node, structure parameters according to n8n API expectations
    if (node.type === 'n8n-nodes-base.set' && node.parameters && node.parameters.values) {
      // Create the correct parameter structure for a Set node for n8n version 1.82.3+
      const formattedValues = node.parameters.values.map((value: any) => {
        return {
          name: value.name,
          value: value.value,
          type: value.type || 'string',
          parameterType: 'propertyValue'
        };
      });
      
      // Completely redefine the parameters for the Set node
      node.parameters = {
        values: formattedValues,
        options: {
          dotNotation: true
        },
        mode: 'manual'
      };
    }
    
    // Create a properly formatted node
    return {
      id: nodeId,
      name: node.name,
      type: node.type,
      parameters: node.parameters || {},
      position: node.position || [index * 200, 300], // Position nodes horizontally with a step of 200
      typeVersion: 1
    };
  });
  
  // Create a dictionary of nodes by ID for quick access
  const nodeDict: Record<string, { id: string; name: string; index: number }> = {};
  formattedNodes.forEach((node, index) => {
    nodeDict[node.id] = { id: node.id, name: node.name, index };
  });
  
  // Transform connections to n8n format
  let connections: ConnectionMap = {};
  
  if (input.connections && Array.isArray(input.connections)) {
    input.connections.forEach((conn: LegacyWorkflowConnection) => {
      // Find nodes by name if source and target are node names
      const sourceNode = findNodeByNameOrId(formattedNodes, conn.source);
      const targetNode = findNodeByNameOrId(formattedNodes, conn.target);
      
      if (!sourceNode) {
        throw new McpError(ErrorCode.InvalidParams, `Connection references non-existent source node: "${conn.source}"`);
      }
      
      if (!targetNode) {
        throw new McpError(ErrorCode.InvalidParams, `Connection references non-existent target node: "${conn.target}"`);
      }
      
      // Используем имя узла в качестве ключа для соединений
      if (!connections[sourceNode.name]) {
        connections[sourceNode.name] = { main: [] };
      }
      
      // Make sure the array for sourceOutput exists
      const sourceOutput = conn.sourceOutput || 0;
      while (connections[sourceNode.name].main.length <= sourceOutput) {
        connections[sourceNode.name].main.push([]);
      }
      
      // Используем имя целевого узла для target
      connections[sourceNode.name].main[sourceOutput].push({
        node: targetNode.name,
        type: 'main',
        index: conn.targetInput || 0
      });
    });
  } else {
    throw new McpError(ErrorCode.InvalidParams, 'Workflow connections are missing or invalid. Please provide a valid connections array.');
  }
  
  // Проверка на некорректные ключи соединений
  Object.keys(connections).forEach(nodeKey => {
    const matchingNode = formattedNodes.find(node => node.name === nodeKey);
    if (!matchingNode) {
      console.warn(`Warning: Found connection with invalid node name "${nodeKey}". Removing this connection.`);
      delete connections[nodeKey];
    }
  });
  
  // Default settings
  const defaultSettings = { executionOrder: 'v1' };
  const mergedSettings = input.settings 
    ? { ...defaultSettings, ...input.settings } 
    : defaultSettings;
  
  // Return the formatted workflow specification
  return {
    name: input.name || 'New Workflow',
    nodes: formattedNodes,
    connections: connections,
    settings: mergedSettings
  };
}

/**
 * Finds a node by name or ID, prioritizing ID matching
 */
function findNodeByNameOrId(nodes: Array<any>, nameOrId: string): any {
  // Сначала ищем точное совпадение по ID
  const nodeById = nodes.find(node => node.id === nameOrId);
  if (nodeById) {
    return nodeById;
  }
  
  // Если не нашли по ID, ищем по имени
  const nodeByName = nodes.find(node => node.name === nameOrId);
  if (nodeByName) {
    console.log(`Note: Found node "${nameOrId}" by name instead of ID. Using node ID: ${nodeByName.id}`);
    return nodeByName;
  }
  
  // Не нашли узел
  return null;
}
