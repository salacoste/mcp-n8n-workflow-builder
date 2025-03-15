/**
 * Prompt variable description
 */
export interface PromptVariable {
  name: string;
  description: string;
  defaultValue?: string;
  required: boolean;
}

/**
 * Template object for a prompt
 * Contains workflow description with placeholders for variables
 */
export interface PromptTemplate {
  name: string;
  nodes: any[];
  connections: any[];
}

/**
 * Prompt for creating a workflow
 */
export interface Prompt {
  id: string;
  name: string;
  description: string;
  template: PromptTemplate;
  variables: PromptVariable[];
}

/**
 * Result of filling a prompt template
 */
export interface FilledPrompt {
  workflowData: any;
  promptId: string;
} 