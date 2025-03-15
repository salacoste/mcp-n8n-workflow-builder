import { WorkflowSpec, WorkflowNode, LegacyWorkflowConnection, ConnectionMap } from '../types/workflow';
import { calculateNextPosition } from '../utils/positioning';
import { validateWorkflowSpec } from '../utils/validation';

export class WorkflowBuilder {
  private nodes: WorkflowNode[] = [];
  private connections: LegacyWorkflowConnection[] = [];
  private nextPosition = { x: 100, y: 100 };

  addNode(node: Partial<WorkflowNode>): WorkflowNode {
    const newNode: WorkflowNode = {
      id: node.id || `node_${this.nodes.length + 1}`,
      name: node.name || `Node ${this.nodes.length + 1}`,
      type: node.type || 'unknown',
      parameters: node.parameters || {},
      position: node.position || [this.nextPosition.x, this.nextPosition.y],
      typeVersion: node.typeVersion || 1
    };
    
    this.nextPosition = calculateNextPosition(this.nextPosition);
    this.nodes.push(newNode);
    return newNode;
  }

  connectNodes(source: string, target: string, sourceOutput: number = 0, targetInput: number = 0) {
    const connection: LegacyWorkflowConnection = {
      source,
      target,
      sourceOutput,
      targetInput
    };
    this.connections.push(connection);
  }

  exportWorkflow(name: string = 'New Workflow'): WorkflowSpec {
    return validateWorkflowSpec({
      name,
      nodes: this.nodes,
      connections: this.connections
    });
  }
}
