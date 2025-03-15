/**
 * Описание переменной промта
 */
export interface PromptVariable {
  name: string;
  description: string;
  defaultValue?: string;
  required: boolean;
}

/**
 * Объект шаблона для промта
 * Содержит описание рабочего процесса с плейсхолдерами для переменных
 */
export interface PromptTemplate {
  name: string;
  nodes: any[];
  connections: any[];
}

/**
 * Промт для создания рабочего процесса
 */
export interface Prompt {
  id: string;
  name: string;
  description: string;
  template: PromptTemplate;
  variables: PromptVariable[];
}

/**
 * Результат заполнения промта
 */
export interface FilledPrompt {
  workflowData: any;
  promptId: string;
} 