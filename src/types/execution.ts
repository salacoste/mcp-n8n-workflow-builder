/**
 * Represents the execution data structure for a single node in a workflow
 */
export interface NodeExecutionData {
  // Node execution metadata
  name: string;
  type: string;
  // Execution status and timing
  startTime: number;
  endTime?: number;
  // Input data received by the node
  inputData: {
    [key: string]: Array<{
      [key: string]: any;
    }>;
  };
  // Output data produced by the node
  outputData?: {
    [key: string]: Array<{
      [key: string]: any;
    }>;
  };
  // Execution error details if any
  error?: {
    message: string;
    stack?: string;
    name?: string;
    description?: string;
  };
}

/**
 * Represents the data structure of a workflow execution
 */
export interface ExecutionData {
  // Result data
  resultData: {
    runData: { [nodeName: string]: NodeExecutionData[] };
    lastNodeExecuted?: string;
    error?: {
      message: string;
      stack?: string;
    };
  };
  // Workflow data snapshot at execution time
  workflowData: {
    name: string;
    nodes: any[];
    connections: any;
    active: boolean;
    settings?: object;
  };
  // Additional execution metadata
  executionData?: {
    contextData?: {
      [key: string]: any;
    };
    nodeExecutionOrder?: string[];
    waitingExecution?: object;
    waitingExecutionSource?: object;
  };
}

/**
 * Represents an execution's status
 */
export type ExecutionStatus = 'success' | 'error' | 'waiting';

/**
 * Represents the execution mode (how it was triggered)
 */
export type ExecutionMode = 'cli' | 'error' | 'integrated' | 'internal' | 'manual' | 'retry' | 'trigger' | 'webhook';

/**
 * Filtering options for listing executions
 */
export interface ExecutionListOptions {
  includeData?: boolean;
  status?: ExecutionStatus;
  workflowId?: string;
  projectId?: string;
  limit?: number;
  cursor?: string;
}