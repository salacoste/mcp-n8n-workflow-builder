import axios, { AxiosInstance } from 'axios';
import { WorkflowSpec, WorkflowInput } from '../types/workflow';
import { ExecutionListOptions } from '../types/execution';
import { Tag } from '../types/tag';
import { 
  N8NWorkflowResponse,
  N8NWorkflowSummary,
  N8NExecutionResponse, 
  N8NExecutionListResponse,
  N8NTagResponse,
  N8NTagListResponse
} from '../types/api';
import logger from '../utils/logger';
import { validateWorkflowSpec, transformConnectionsToArray } from '../utils/validation';
import { EnvironmentManager } from './environmentManager';

// Get environment manager instance
const envManager = EnvironmentManager.getInstance();

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
function buildUrl(path: string, params: Record<string, any> = {}, instanceSlug?: string): string {
  const envConfig = envManager.getEnvironmentConfig(instanceSlug);
  const url = new URL(path, envConfig.n8n_host);
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
export async function createWorkflow(workflowInput: WorkflowInput, instanceSlug?: string): Promise<N8NWorkflowResponse> {
  try {
    const api = envManager.getApiInstance(instanceSlug);
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
export async function getWorkflow(id: string, instanceSlug?: string): Promise<N8NWorkflowResponse> {
  try {
    const api = envManager.getApiInstance(instanceSlug);
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
export async function updateWorkflow(id: string, workflowInput: WorkflowInput, instanceSlug?: string): Promise<N8NWorkflowResponse> {
  try {
    const api = envManager.getApiInstance(instanceSlug);
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
export async function deleteWorkflow(id: string, instanceSlug?: string): Promise<any> {
  try {
    const api = envManager.getApiInstance(instanceSlug);
    logger.log(`Deleting workflow with ID: ${id}`);
    const response = await api.delete(`/workflows/${id}`);
    logger.log(`Deleted workflow with ID: ${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(`deleting workflow with ID ${id}`, error);
  }
}

/**
 * Activates a workflow
 */
export async function activateWorkflow(id: string, instanceSlug?: string): Promise<N8NWorkflowResponse> {
  try {
    const api = envManager.getApiInstance(instanceSlug);
    logger.log(`Activating workflow with ID: ${id}`);
    
    // Получаем текущий рабочий процесс, чтобы получить его полную структуру
    const workflow = await getWorkflow(id, instanceSlug);
    
    // Улучшенная проверка наличия узла-триггера с учетом атрибута group
    const hasTriggerNode = workflow.nodes.some(node => {
      // Проверка по типу узла
      const nodeType = node.type?.toLowerCase() || '';
      const isTypeBasedTrigger = nodeType.includes('trigger') || 
                                nodeType.includes('webhook') || 
                                nodeType.includes('cron') || 
                                nodeType.includes('interval') ||
                                nodeType.includes('schedule');
      
      // Проверка по группе (как в GoogleCalendarTrigger)
      const isTriggerGroup = Array.isArray(node.group) && 
                             node.group.includes('trigger');
      
      // Узел считается триггером, если соответствует типу или имеет группу trigger
      return isTypeBasedTrigger || isTriggerGroup;
    });
    
    let updatedNodes = [...workflow.nodes];
    let needsUpdate = false;
    
    // Если нет узла-триггера, добавляем schedule trigger
    if (!hasTriggerNode) {
      logger.log('No trigger node found. Adding a schedule trigger node to the workflow.');
      
      // Найдем минимальную позицию среди существующих узлов
      const minX = Math.min(...workflow.nodes.map(node => node.position[0] || 0)) - 200;
      const minY = Math.min(...workflow.nodes.map(node => node.position[1] || 0));
      
      // Создаем уникальный ID для триггера
      const triggerId = `ScheduleTrigger_${Date.now()}`;
      
      // Создаем узел schedule триггера с атрибутами соответствующими GoogleCalendarTrigger
      const scheduleTrigger = {
        id: triggerId,
        name: "Schedule Trigger",
        type: 'n8n-nodes-base.scheduleTrigger',
        parameters: {
          interval: 10 // 10 секунд
        },
        position: [minX, minY],
        typeVersion: 1,
        // Добавляем важные атрибуты из GoogleCalendarTrigger
        group: ['trigger'],
        inputs: [],
        outputs: [
          {
            type: "main", // Соответствует NodeConnectionType.Main
            index: 0
          }
        ]
      };
      
      // Добавляем триггер в начало массива узлов
      updatedNodes = [scheduleTrigger, ...updatedNodes];
      
      // Проверим, есть ли хотя бы один узел для соединения с триггером
      if (workflow.nodes.length > 0) {
        // Соединяем триггер с первым узлом
        if (!workflow.connections) {
          workflow.connections = {};
        }
        
        let firstNodeId = workflow.nodes[0].id;
        
        // Добавляем соединение от триггера к первому узлу
        if (Array.isArray(workflow.connections)) {
          workflow.connections.push({
            source: triggerId,
            target: firstNodeId,
            sourceOutput: 0,
            targetInput: 0
          });
        } else if (typeof workflow.connections === 'object') {
          if (!workflow.connections[triggerId]) {
            workflow.connections[triggerId] = { main: [[{ node: firstNodeId, type: 'main', index: 0 }]] };
          }
        }
      }
      
      needsUpdate = true;
    }
    
    // Проверяем, содержит ли процесс узел типа 'Set'
    const hasSetNode = workflow.nodes.some(node => 
      node.type === 'n8n-nodes-base.set' || 
      node.type?.includes('set')
    );
    
    // Если есть узел Set, нам нужно проверить его параметры
    if (hasSetNode) {
      // Исправляем параметры узла 'Set' перед активацией
      updatedNodes = updatedNodes.map(node => {
        if (node.type === 'n8n-nodes-base.set' || node.type?.includes('set')) {
          // Убедимся, что параметры узла имеют правильную структуру
          const updatedNode = { ...node };
          
          // Проверяем и исправляем параметры узла Set
          if (updatedNode.parameters && updatedNode.parameters.values) {
            // Проверяем, что values является массивом
            if (!Array.isArray(updatedNode.parameters.values)) {
              updatedNode.parameters.values = [];
            }
            
            // Проверяем каждый элемент values и исправляем его структуру
            const formattedValues = updatedNode.parameters.values.map((item: any) => {
              // Убедимся, что каждый элемент имеет свойства name и value
              return {
                name: item?.name || 'value',
                value: item?.value !== undefined ? item.value : '',
                type: item?.type || 'string',
                parameterType: 'propertyValue'
              };
            });
            
            // Полностью заменяем параметры для Set node по формату API n8n
            updatedNode.parameters = {
              propertyValues: {
                itemName: formattedValues
              },
              options: {
                dotNotation: true
              },
              mode: 'manual'
            };
          } else {
            // Если параметров нет или нет values, создаем их с правильной структурой
            updatedNode.parameters = {
              propertyValues: {
                itemName: []
              },
              options: {
                dotNotation: true
              },
              mode: 'manual'
            };
          }
          
          return updatedNode;
        }
        return node;
      });
      
      needsUpdate = true;
    }
    
    // Обновляем рабочий процесс, если были внесены изменения
    if (needsUpdate) {
      // Преобразуем соединения в формат массива
      const arrayConnections = transformConnectionsToArray(workflow.connections);
      
      try {
        // Обновляем рабочий процесс с исправленными узлами и соединениями в формате массива
        await updateWorkflow(id, {
          name: workflow.name,
          nodes: updatedNodes,
          connections: arrayConnections
        }, instanceSlug);
        
        logger.log('Updated workflow nodes to fix potential activation issues');
      } catch (updateError) {
        logger.error('Failed to update workflow before activation', updateError);
        throw updateError;
      }
    }
    
    // Активируем рабочий процесс - согласно документации API используем только POST
    try {
      const response = await api.post(`/workflows/${id}/activate`, {});
      
      // В случае успеха логгируем результат
      logger.log(`Workflow activation response status: ${response.status}`);
      return response.data;
    } catch (activationError) {
      logger.error('Workflow activation failed', activationError);
      throw activationError;
    }
  } catch (error) {
    return handleApiError(`activating workflow with ID ${id}`, error);
  }
}

/**
 * Deactivates a workflow
 */
export async function deactivateWorkflow(id: string, instanceSlug?: string): Promise<N8NWorkflowResponse> {
  try {
    const api = envManager.getApiInstance(instanceSlug);
    logger.log(`Deactivating workflow with ID: ${id}`);
    const response = await api.post(`/workflows/${id}/deactivate`, {});
    logger.log(`Deactivated workflow: ${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(`deactivating workflow with ID ${id}`, error);
  }
}

/**
 * Lists all workflows with essential metadata only (no nodes/connections)
 */
export async function listWorkflows(instanceSlug?: string): Promise<N8NWorkflowSummary[]> {
  try {
    const api = envManager.getApiInstance(instanceSlug);
    logger.log('Listing workflows');
    const response = await api.get('/workflows');
    logger.log(`Retrieved ${response.data.data ? response.data.data.length : 0} workflows`);
    
    // Extract workflows from nested response structure
    const workflows = response.data.data || response.data;
    
    // Transform full workflow responses to summaries
    const workflowSummaries: N8NWorkflowSummary[] = workflows.map((workflow: any) => ({
      id: workflow.id,
      name: workflow.name,
      active: workflow.active,
      createdAt: workflow.createdAt,
      updatedAt: workflow.updatedAt,
      nodeCount: workflow.nodes ? workflow.nodes.length : 0,
      tags: workflow.tags ? workflow.tags.map((tag: any) => tag.name || tag) : [],
      // Note: folder information may not be available in list view
    }));
    
    return workflowSummaries;
  } catch (error) {
    return handleApiError('listing workflows', error);
  }
}

/**
 * Lists executions with optional filters
 */
export async function listExecutions(options: ExecutionListOptions = {}, instanceSlug?: string): Promise<N8NExecutionListResponse> {
  try {
    const api = envManager.getApiInstance(instanceSlug);
    logger.log('Listing executions');
    
    const url = buildUrl('/executions', options, instanceSlug);
    
    logger.log(`Request URL: ${url}`);
    const response = await api.get(url);
    logger.log(`Retrieved ${response.data.data.length} executions`);
    return response.data;
  } catch (error) {
    return handleApiError('listing executions', error);
  }
}

/**
 * Gets an execution by ID
 */
export async function getExecution(id: number, includeData?: boolean, instanceSlug?: string): Promise<N8NExecutionResponse> {
  try {
    const api = envManager.getApiInstance(instanceSlug);
    logger.log(`Getting execution with ID: ${id}`);
    const url = buildUrl(`/executions/${id}`, includeData ? { includeData: true } : {}, instanceSlug);
    const response = await api.get(url);
    logger.log(`Retrieved execution: ${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(`getting execution with ID ${id}`, error);
  }
}

/**
 * Deletes an execution
 */
export async function deleteExecution(id: number, instanceSlug?: string): Promise<N8NExecutionResponse> {
  try {
    const api = envManager.getApiInstance(instanceSlug);
    logger.log(`Deleting execution with ID: ${id}`);
    const response = await api.delete(`/executions/${id}`);
    logger.log(`Deleted execution: ${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(`deleting execution with ID ${id}`, error);
  }
}

/**
 * Manually executes a workflow
 * @param id The workflow ID
 * @param runData Optional data to pass to the workflow
 */
export async function executeWorkflow(id: string, runData?: Record<string, any>, instanceSlug?: string): Promise<N8NExecutionResponse> {
  try {
    const api = envManager.getApiInstance(instanceSlug);
    logger.log(`Manually executing workflow with ID: ${id}`);
    
    // Проверяем активен ли рабочий процесс
    try {
      const workflow = await getWorkflow(id, instanceSlug);
      
      if (!workflow.active) {
        logger.warn(`Workflow ${id} is not active. Attempting to activate it.`);
        try {
          await activateWorkflow(id, instanceSlug);
          // Ждем существенное время после активации перед выполнением
          logger.log('Waiting for workflow activation to complete (10 seconds)...');
          await new Promise(resolve => setTimeout(resolve, 10000));
        } catch (activationError) {
          logger.error('Workflow activation failed before execution', activationError);
          throw activationError;
        }
      } else {
        // Если уже активен, все равно подождем немного для стабильности
        logger.log('Workflow is active. Waiting a moment before execution (5 seconds)...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    } catch (checkError) {
      logger.error('Failed to check workflow status before execution', checkError);
      throw checkError;
    }
    
    // Prepare request data - правильный формат для n8n API
    const requestData = {
      data: runData || {}
    };
    
    // Согласно документации n8n API, используем только /execute эндпоинт
    const response = await api.post(`/workflows/${id}/execute`, requestData);
    logger.log(`Workflow execution started with /execute endpoint`);
    
    // If the response includes an executionId, fetch the execution details
    if (response.data && response.data.executionId) {
      const executionId = response.data.executionId;
      // Wait longer to ensure execution has completed processing
      logger.log(`Waiting for execution ${executionId} to complete...`);
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      try {
        // Get the execution details
        const executionResponse = await api.get(`/executions/${executionId}`);
        return executionResponse.data;
      } catch (executionError) {
        logger.error(`Failed to get execution details for execution ${executionId}`, executionError);
        throw executionError;
      }
    }
    
    return response.data;
  } catch (error) {
    return handleApiError(`executing workflow with ID ${id}`, error);
  }
}

/**
 * Создает новый тег
 */
export async function createTag(tag: { name: string }, instanceSlug?: string): Promise<N8NTagResponse> {
  try {
    const api = envManager.getApiInstance(instanceSlug);
    logger.log(`Creating tag: ${tag.name}`);
    const response = await api.post('/tags', tag);
    logger.log(`Tag created: ${response.data.name}`);
    return response.data;
  } catch (error) {
    return handleApiError(`creating tag ${tag.name}`, error);
  }
}

/**
 * Получает список всех тегов
 */
export async function getTags(options: { limit?: number; cursor?: string } = {}, instanceSlug?: string): Promise<N8NTagListResponse> {
  try {
    const api = envManager.getApiInstance(instanceSlug);
    logger.log('Getting tags list');
    const url = buildUrl('/tags', options, instanceSlug);
    const response = await api.get(url);
    logger.log(`Found ${response.data.data.length} tags`);
    return response.data;
  } catch (error) {
    return handleApiError('getting tags list', error);
  }
}

/**
 * Получает тег по ID
 */
export async function getTag(id: string, instanceSlug?: string): Promise<N8NTagResponse> {
  try {
    const api = envManager.getApiInstance(instanceSlug);
    logger.log(`Getting tag with ID: ${id}`);
    const response = await api.get(`/tags/${id}`);
    logger.log(`Tag found: ${response.data.name}`);
    return response.data;
  } catch (error) {
    return handleApiError(`getting tag with ID ${id}`, error);
  }
}

/**
 * Обновляет тег
 */
export async function updateTag(id: string, tag: { name: string }, instanceSlug?: string): Promise<N8NTagResponse> {
  try {
    const api = envManager.getApiInstance(instanceSlug);
    logger.log(`Updating tag with ID: ${id}`);
    
    // Сначала проверим, существует ли тег с таким именем
    try {
      const allTags = await getTags({}, instanceSlug);
      const existingTag = allTags.data.find((t: any) => t.name === tag.name);
      
      if (existingTag) {
        logger.warn(`Tag with name "${tag.name}" already exists. Generating a new unique name.`);
        // Генерируем более уникальное имя с большим диапазоном случайности
        const uuid = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
        tag.name = `${tag.name}-${uuid}`;
      }
    } catch (error) {
      logger.error('Failed to check existing tags', error);
      // Продолжаем без проверки, если не удалось получить список тегов
    }
    
    const response = await api.put(`/tags/${id}`, tag);
    logger.log(`Tag updated: ${response.data.name}`);
    return response.data;
  } catch (error) {
    return handleApiError(`updating tag with ID ${id}`, error);
  }
}

/**
 * Удаляет тег
 */
export async function deleteTag(id: string, instanceSlug?: string): Promise<N8NTagResponse> {
  try {
    const api = envManager.getApiInstance(instanceSlug);
    logger.log(`Deleting tag with ID: ${id}`);
    const response = await api.delete(`/tags/${id}`);
    logger.log(`Tag deleted: ${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(`deleting tag with ID ${id}`, error);
  }
}
