import { ExecutionData, ExecutionMode } from './execution';
import { Tag } from './tag';

export interface N8NWorkflowResponse {
  id: string;
  name: string;
  active: boolean;
  nodes: any[];
  connections: any;
  createdAt: string;
  updatedAt: string;
  activationError?: {
    message: string;
    details: string;
    originalApiResponse: string;
  };
}

/**
 * Streamlined workflow summary for list operations (excludes nodes/connections)
 */
export interface N8NWorkflowSummary {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  folder?: string;
  nodeCount?: number;
}

/**
 * Represents a full workflow execution response from n8n API
 */
export interface N8NExecutionResponse {
  id: number;
  data?: ExecutionData;
  finished: boolean;
  mode: ExecutionMode;
  retryOf?: number | null;
  retrySuccessId?: number | null;
  startedAt: string;
  stoppedAt: string;
  workflowId: number;
  waitTill?: string | null;
  customData?: {
    [key: string]: any;
  };
}

/**
 * Response structure when listing executions
 */
export interface N8NExecutionListResponse {
  data: N8NExecutionResponse[];
  nextCursor?: string;
}

/**
 * Standard error response structure
 */
export interface N8NErrorResponse {
  error: string;
}

/**
 * Response structure for a single tag
 */
export interface N8NTagResponse extends Tag {
  id: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Response structure when listing tags
 */
export interface N8NTagListResponse {
  data: N8NTagResponse[];
  nextCursor?: string;
}
