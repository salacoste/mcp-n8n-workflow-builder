import axios from 'axios';
import { N8N_HOST, N8N_API_KEY } from '../config/constants';
import { WorkflowSpec, WorkflowInput } from '../types/workflow';
import { ExecutionListOptions } from '../types/execution';
import { N8NWorkflowResponse, N8NExecutionResponse, N8NExecutionListResponse } from '../types/api';
import logger from '../utils/logger';
import { validateWorkflowSpec } from '../utils/validation';

const api = axios.create({
  baseURL: N8N_HOST,
  headers: {
    'Content-Type': 'application/json',
    'X-N8N-API-KEY': N8N_API_KEY
  }
});

/**
 * Helper function to handle API errors consistently
 * @param context Description of the operation that failed
 * @param error The error that was thrown
 */
function handleApiError(context: string, error: unknown): never {
  logger.error(`API error during ${context}`);
  if (axios.isAxiosError(error)) {
    logger.error(`Status: ${error.response?.status || 'Unknown'}`);
    logger.error(`Response: ${JSON.stringify(error.response?.data || {})}`);
    logger.error(`Config: ${JSON.stringify(error.config)}`);
    throw new Error(`API error ${context}: ${error.message}`);
  }
  throw error instanceof Error ? error : new Error(`Unknown error ${context}: ${String(error)}`);
}

/**
 * Builds a URL with query parameters
 */
function buildUrl(path: string, params: Record<string, any> = {}): string {
  const url = new URL(path, N8N_HOST);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  });
  return url.pathname + url.search;
}

/**
 * Creates a new workflow
 */
export async function createWorkflow(workflowInput: WorkflowInput): Promise<N8NWorkflowResponse> {
  try {
    logger.log(`Creating workflow: ${workflowInput.name}`);
    // Преобразуем входные данные в формат, принимаемый API
    const validatedWorkflow = validateWorkflowSpec(workflowInput);
    
    // Предварительная проверка на типичные проблемы
    validateWorkflowConfiguration(validatedWorkflow);
    
    // Логгируем данные для отладки
    logger.log(`Sending workflow data to API: ${JSON.stringify(validatedWorkflow)}`);
    
    const response = await api.post('/workflows', validatedWorkflow);
    logger.log(`Workflow created with ID: ${response.data.id}`);
    return response.data;
  } catch (error) {
    // Расширенная обработка ошибок с проверкой типичных случаев
    if (axios.isAxiosError(error) && error.response?.status) {
      const status = error.response.status;
      const message = error.response?.data?.message;
      
      if (status === 400) {
        // Проблемы с форматом или структурой данных
        if (message?.includes('property values')) {
          logger.error(`Validation error with property values: ${message}`);
          throw new Error(`API rejected workflow due to invalid property values. This may happen with complex Set node configurations. Try simplifying the values or using a Code node instead.`);
        }
        
        if (message?.includes('already exists')) {
          logger.error(`Workflow name conflict: ${message}`);
          throw new Error(`A workflow with this name already exists. Please choose a unique name for your workflow.`);
        }
      }
      
      if (status === 401 || status === 403) {
        logger.error(`Authentication error: ${status} ${message}`);
        throw new Error(`Authentication error: Please check that your N8N_API_KEY is correct and has the necessary permissions.`);
      }
      
      if (status === 413) {
        logger.error(`Payload too large: ${message}`);
        throw new Error(`The workflow is too large. Try splitting it into smaller workflows or reducing the complexity.`);
      }
      
      if (status === 429) {
        logger.error(`Rate limit exceeded: ${message}`);
        throw new Error(`Rate limit exceeded. Please wait before creating more workflows.`);
      }
      
      if (status >= 500) {
        logger.error(`n8n server error: ${status} ${message}`);
        throw new Error(`The n8n server encountered an error. Please check the n8n logs for more information.`);
      }
    }
    
    return handleApiError('creating workflow', error);
  }
}

/**
 * Validates a workflow configuration for common issues
 */
function validateWorkflowConfiguration(workflow: WorkflowSpec): void {
  // Проверка на наличие узлов
  if (!workflow.nodes || workflow.nodes.length === 0) {
    throw new Error('Workflow must contain at least one node');
  }
  
  // Проверка наличия узлов-триггеров для активации
  const hasTriggerNode = workflow.nodes.some(node => {
    const nodeType = node.type.toLowerCase();
    return nodeType.includes('trigger') || 
           nodeType.includes('webhook') || 
           nodeType.includes('cron') || 
           nodeType.includes('interval') ||
           nodeType.includes('schedule');
  });
  
  if (!hasTriggerNode) {
    logger.warn('Workflow does not contain any trigger nodes. It cannot be activated automatically.');
  }
  
  // Проверка наличия изолированных узлов без соединений
  const connectedNodes = new Set<string>();
  Object.keys(workflow.connections).forEach(sourceId => {
    connectedNodes.add(sourceId);
    workflow.connections[sourceId]?.main?.forEach(outputs => {
      outputs?.forEach(connection => {
        if (connection?.node) {
          connectedNodes.add(connection.node);
        }
      });
    });
  });
  
  const isolatedNodes = workflow.nodes.filter(node => !connectedNodes.has(node.id));
  if (isolatedNodes.length > 0) {
    const isolatedNodeNames = isolatedNodes.map(node => node.name).join(', ');
    logger.warn(`Workflow contains isolated nodes that are not connected: ${isolatedNodeNames}`);
  }
  
  // Возможно добавить другие проверки (циклы, ошибки в типах узлов и т.д.)
}

/**
 * Gets a workflow by ID
 */
export async function getWorkflow(id: string): Promise<N8NWorkflowResponse> {
  try {
    logger.log(`Getting workflow with ID: ${id}`);
    const response = await api.get(`/workflows/${id}`);
    logger.log(`Retrieved workflow: ${response.data.name}`);
    return response.data;
  } catch (error) {
    return handleApiError(`getting workflow with ID ${id}`, error);
  }
}

/**
 * Updates a workflow
 */
export async function updateWorkflow(id: string, workflowInput: WorkflowInput): Promise<N8NWorkflowResponse> {
  try {
    logger.log(`Updating workflow with ID: ${id}`);
    // Преобразуем входные данные в формат, принимаемый API
    const validatedWorkflow = validateWorkflowSpec(workflowInput);
    
    const response = await api.put(`/workflows/${id}`, validatedWorkflow);
    logger.log(`Workflow updated: ${response.data.name}`);
    return response.data;
  } catch (error) {
    return handleApiError(`updating workflow with ID ${id}`, error);
  }
}

/**
 * Deletes a workflow
 */
export async function deleteWorkflow(id: string): Promise<any> {
  try {
    logger.log();
    const response = await api.delete(`/workflows/${id}`);
    logger.log();
    return response.data;
  } catch (error) {
    return handleApiError(`deleting workflow with ID ${id}`, error);
  }
}

/**
 * Activates a workflow
 */
export async function activateWorkflow(id: string): Promise<N8NWorkflowResponse> {
  try {
    logger.log(`Activating workflow with ID: ${id}`);
    
    // Упрощенная версия запроса - передаем пустой объект, как в документации
    const response = await api.post(`/workflows/${id}/activate`, {});
    
    // В случае успеха логгируем результат
    logger.log(`Workflow activation response status: ${response.status}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const errorMessage = error.response.data?.message || '';
      const originalResponse = JSON.stringify(error.response.data || {});
      
      // Проверка на известную ошибку API n8n версии 1.82.3 с узлом Set
      if (error.response.status === 400 && errorMessage === 'propertyValues[itemName] is not iterable') {
        logger.warn(`Encountered known n8n API limitation: ${errorMessage}`);
        logger.warn(`This is a known issue with n8n API version 1.82.3 and not an issue with our implementation.`);
        
        // Получаем данные рабочего процесса и возвращаем информативный ответ
        const workflow = await getWorkflow(id);
        return {
          ...workflow,
          activationError: {
            message: `The workflow could not be activated due to a known limitation in n8n API: ${errorMessage}`,
            details: "This is a limitation of the n8n API and not an issue with the n8n-workflow-builder.",
            originalApiResponse: originalResponse
          }
        };
      }
      
      // Проверка на ошибку отсутствия триггерного узла
      if (errorMessage.includes('has no node to start the workflow') || 
          errorMessage.includes('at least one trigger, poller or webhook node is required')) {
        logger.warn(`Cannot activate workflow: ${errorMessage}`);
        
        // Получаем данные рабочего процесса для информативного ответа
        const workflow = await getWorkflow(id);
        return {
          ...workflow,
          activationError: {
            message: "Workflow activation failed: This workflow requires at least one trigger node to be activated.",
            details: "To activate this workflow, please add a trigger node (such as a Webhook, Schedule, or other event-based node) that will initiate the workflow execution.",
            originalApiResponse: originalResponse
          }
        };
      }
      
      // Общее сообщение об ошибке активации для других случаев
      if (error.response.status >= 400) {
        logger.warn(`Workflow activation failed with status ${error.response.status}: ${errorMessage}`);
        
        try {
          const workflow = await getWorkflow(id);
          return {
            ...workflow,
            activationError: {
              message: `Workflow activation failed: ${errorMessage}`,
              details: `The n8n API returned an error (${error.response.status}) when trying to activate this workflow.`,
              originalApiResponse: originalResponse
            }
          };
        } catch (getError) {
          // Если не удается получить рабочий процесс, обрабатываем ошибку стандартным образом
          return handleApiError(`getting workflow after activation error for ID ${id}`, getError);
        }
      }
    }

    // Если это другая ошибка, обрабатываем стандартным способом 
    return handleApiError(`activating workflow with ID ${id}`, error);
  }
}

/**
 * Deactivates a workflow
 */
export async function deactivateWorkflow(id: string): Promise<N8NWorkflowResponse> {
  try {
    logger.log();
    const response = await api.post(`/workflows/${id}/deactivate`, {});
    logger.log();
    return response.data;
  } catch (error) {
    return handleApiError(`deactivating workflow with ID ${id}`, error);
  }
}

/**
 * Lists all workflows
 */
export async function listWorkflows(): Promise<N8NWorkflowResponse[]> {
  try {
    logger.log();
    const response = await api.get('/workflows');
    logger.log();
    return response.data;
  } catch (error) {
    return handleApiError('listing workflows', error);
  }
}

/**
 * Lists executions with optional filters
 */
export async function listExecutions(options: ExecutionListOptions = {}): Promise<N8NExecutionListResponse> {
  try {
    logger.log();
    
    const url = buildUrl('/executions', options);
    
    logger.log();
    const response = await api.get(url);
    logger.log();
    return response.data;
  } catch (error) {
    return handleApiError('listing executions', error);
  }
}

/**
 * Gets an execution by ID
 */
export async function getExecution(id: number, includeData?: boolean): Promise<N8NExecutionResponse> {
  try {
    logger.log();
    const url = buildUrl(`/executions/${id}`, includeData ? { includeData: true } : {});
    const response = await api.get(url);
    logger.log();
    return response.data;
  } catch (error) {
    return handleApiError(`getting execution with ID ${id}`, error);
  }
}

/**
 * Deletes an execution
 */
export async function deleteExecution(id: number): Promise<N8NExecutionResponse> {
  try {
    logger.log();
    const response = await api.delete(`/executions/${id}`);
    logger.log();
    return response.data;
  } catch (error) {
    return handleApiError(`deleting execution with ID ${id}`, error);
  }
}

/**
 * Manually executes a workflow
 * @param id Workflow ID to execute
 * @param runData Optional data to pass to the workflow
 */
export async function executeWorkflow(id: string, runData?: Record<string, any>): Promise<N8NExecutionResponse> {
  try {
    logger.log(`Manually executing workflow with ID: ${id}`);
    
    // Prepare request data
    const requestData = {
      workflowData: runData || {}
    };
    
    // Call the n8n API to execute the workflow
    const response = await api.post(`/workflows/${id}/execute`, requestData);
    logger.log(`Workflow execution started with ID: ${response.data.executionId || 'unknown'}`);
    
    // If the response includes an executionId, fetch the execution details
    if (response.data && response.data.executionId) {
      const executionId = response.data.executionId;
      // Wait a bit to ensure execution has started processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      return await getExecution(executionId, true);
    }
    
    return response.data;
  } catch (error) {
    return handleApiError(`executing workflow with ID ${id}`, error);
  }
}
