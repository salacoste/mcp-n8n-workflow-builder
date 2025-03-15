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
      
      if (!sourceNode || !targetNode) {
        throw new McpError(ErrorCode.InvalidParams, `Connection references non-existent node: ${conn.source} -> ${conn.target}`);
      }
      
      // Create connection structure if it doesn't exist yet
      if (!connections[sourceNode.id]) {
        connections[sourceNode.id] = { main: [] };
      }
      
      // Make sure the array for sourceOutput exists
      const sourceOutput = conn.sourceOutput || 0;
      while (connections[sourceNode.id].main.length <= sourceOutput) {
        connections[sourceNode.id].main.push([]);
      }
      
      // Add the connection
      connections[sourceNode.id].main[sourceOutput].push({
        node: targetNode.id,
        type: 'main',
        index: conn.targetInput || 0
      });
    });
  }
  
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
 * Finds a node by name or ID
 */
function findNodeByNameOrId(nodes: Array<any>, nameOrId: string): any {
  return nodes.find(node => node.id === nameOrId || node.name === nameOrId);
}
