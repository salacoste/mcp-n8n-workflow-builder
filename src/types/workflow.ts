export interface WorkflowNode {
  id: string;
  name: string;
  type: string;
  parameters: Record<string, any>;
  position: number[];
  typeVersion: number;
}

export interface ConnectionItem {
  node: string;
  type: string;
  index: number;
}

export interface ConnectionMap {
  [key: string]: {
    main: ConnectionItem[][]
  }
}

export interface WorkflowSpec {
  name: string;
  nodes: WorkflowNode[];
  connections: ConnectionMap;
  settings?: {
    executionOrder: string;
    [key: string]: any;
  };
  tags?: string[];
}

// Temporary interface to support the old input format
export interface LegacyWorkflowConnection {
  source: string;
  target: string;
  sourceOutput?: number;
  targetInput?: number;
}

// Interface for input data
export interface WorkflowInput {
  name?: string;
  nodes: {
    type: string;
    name: string;
    parameters?: Record<string, any>;
    id?: string;
    position?: number[];
  }[];
  connections: LegacyWorkflowConnection[];
  active?: boolean;
  settings?: Record<string, any>;
  tags?: string[];
}
