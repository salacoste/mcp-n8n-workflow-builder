#!/usr/bin/env node
import dotenv from 'dotenv';
// Load environment variables from .env file
dotenv.config();

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListResourceTemplatesRequestSchema,
  ListPromptsRequestSchema
} from './sdk-schemas';
import * as n8nApi from './services/n8nApi';
import { WorkflowBuilder } from './services/workflowBuilder';
import { validateWorkflowSpec } from './utils/validation';
import logger from './utils/logger';
import { WorkflowInput } from './types/workflow';
import * as promptsService from './services/promptsService';
import { Prompt } from './types/prompts';

// Определение типа для результата вызова инструмента
interface ToolCallResult {
  content: Array<{
    type: string;
    text: string;
  }>;
  isError?: boolean;
  [key: string]: unknown;
}

// Удалены логи схем

class N8NWorkflowServer {
  private server: InstanceType<typeof Server>;

  constructor() {
    this.server = new Server(
      { name: 'n8n-workflow-builder', version: '0.3.0' },
      { capabilities: { tools: {}, resources: {}, prompts: {} } }
    );
    this.setupToolHandlers();
    this.setupResourceHandlers();
    this.setupPromptHandlers();
    this.server.onerror = (error: any) => this.log('error', `Server error: ${error.message || error}`);
  }

  private log(level: 'info' | 'error' | 'debug', message: string, ...args: any[]) {
    const timestamp = new Date().toISOString();
    console.error(`${timestamp} [n8n-workflow-builder] [${level}] ${message}`);
    if (args.length > 0) {
      console.error(...args);
    }
  }

  private setupResourceHandlers() {
    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      this.log('info', 'Initializing resources list');
      return {
        resources: [
          {
            uri: '/workflows',
            name: 'Workflows List',
            description: 'List of all available workflows',
            mimeType: 'application/json'
          },
          {
            uri: '/execution-stats',
            name: 'Execution Statistics',
            description: 'Summary statistics of workflow executions',
            mimeType: 'application/json'
          }
        ]
      };
    });

    // List resource templates
    this.server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => {
      this.log('info', 'Listing resource templates');
      return {
        templates: [
          {
            uriTemplate: '/workflows/{id}',
            name: 'Workflow Details',
            description: 'Details of a specific workflow',
            mimeType: 'application/json',
            parameters: [
              {
                name: 'id',
                description: 'The ID of the workflow',
                required: true
              }
            ]
          },
          {
            uriTemplate: '/executions/{id}',
            name: 'Execution Details',
            description: 'Details of a specific execution',
            mimeType: 'application/json',
            parameters: [
              {
                name: 'id',
                description: 'The ID of the execution',
                required: true
              }
            ]
          }
        ]
      };
    });

    // Read a specific resource
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request: any) => {
      const { uri } = request.params;
      logger.info();
      
      // Static resources
      if (uri === '/workflows') {
        const workflows = await n8nApi.listWorkflows();
        return {
          contents: [{
            type: 'text',
            text: JSON.stringify(workflows, null, 2),
            mimeType: 'application/json',
            uri: '/workflows'
          }]
        };
      }
      
      if (uri === '/execution-stats') {
        try {
          const executions = await n8nApi.listExecutions({ limit: 100 });
          
          // Calculate statistics
          const total = executions.data.length;
          const succeeded = executions.data.filter(exec => exec.finished && exec.mode !== 'error').length;
          const failed = executions.data.filter(exec => exec.mode === 'error').length;
          const waiting = executions.data.filter(exec => !exec.finished).length;
          
          // Calculate average execution time for finished executions
          let totalTimeMs = 0;
          let finishedCount = 0;
          for (const exec of executions.data) {
            if (exec.finished && exec.startedAt && exec.stoppedAt) {
              const startTime = new Date(exec.startedAt).getTime();
              const endTime = new Date(exec.stoppedAt).getTime();
              totalTimeMs += (endTime - startTime);
              finishedCount++;
            }
          }
          
          const avgExecutionTimeMs = finishedCount > 0 ? totalTimeMs / finishedCount : 0;
          const avgExecutionTime = `${(avgExecutionTimeMs / 1000).toFixed(2)}s`;
          
          return {
            contents: [{
              type: 'text',
              text: JSON.stringify({
                total,
                succeeded,
                failed,
                waiting,
                avgExecutionTime
              }, null, 2),
              mimeType: 'application/json',
              uri: '/execution-stats'
            }]
          };
        } catch (error) {
          logger.error();
          return {
            contents: [{
              type: 'text',
              text: JSON.stringify({
                total: 0,
                succeeded: 0,
                failed: 0,
                waiting: 0,
                avgExecutionTime: '0s',
                error: 'Failed to retrieve execution statistics'
              }, null, 2),
              mimeType: 'application/json',
              uri: '/execution-stats'
            }]
          };
        }
      }
      
      
      // Dynamic resource template matching
      const workflowMatch = uri.match(/^\/workflows\/(.+)$/);
      if (workflowMatch) {
        const id = workflowMatch[1];
        try {
          const workflow = await n8nApi.getWorkflow(id);
          return {
            contents: [{
              type: 'text',
              text: JSON.stringify(workflow, null, 2),
              mimeType: 'application/json',
              uri: uri
            }]
          };
        } catch (error) {
          throw new McpError(ErrorCode.InvalidParams, `Workflow with ID ${id} not found`);
        }
      }
      
      const executionMatch = uri.match(/^\/executions\/(.+)$/);
      if (executionMatch) {
        const id = parseInt(executionMatch[1], 10);
        if (isNaN(id)) {
          throw new McpError(ErrorCode.InvalidParams, 'Execution ID must be a number');
        }
        
        try {
          const execution = await n8nApi.getExecution(id, true);
          return {
            contents: [{
              type: 'text',
              text: JSON.stringify(execution, null, 2),
              mimeType: 'application/json',
              uri: uri
            }]
          };
        } catch (error) {
          throw new McpError(ErrorCode.InvalidParams, `Execution with ID ${id} not found`);
        }
      }
      
      throw new McpError(ErrorCode.InvalidParams, `Resource not found: ${uri}`);
    });
  }

  private setupToolHandlers() {
    // Register available tools using the local schemas and return an array of tool definitions.
    this.server.setRequestHandler(ListToolsRequestSchema, async (req: any) => {
      logger.info();
      return {
        tools: [
          // Workflow Tools
          {
            name: 'list_workflows',
            enabled: true,
            description: 'List all workflows from n8n',
            inputSchema: { 
              type: 'object', 
              properties: {
                random_string: {
                  type: 'string',
                  description: 'Dummy parameter for no-parameter tools'
                }
              }
            }
          },
          {
            name: 'create_workflow',
            enabled: true,
            description: 'Create a new workflow in n8n',
            inputSchema: {
              type: 'object',
              properties: {
                name: { 
                  type: 'string',
                  description: 'The name of the workflow to create'
                },
                nodes: {
                  type: 'array',
                  description: 'Array of workflow nodes to create. Each node must have type and name.',
                  items: {
                    type: 'object',
                    properties: {
                      type: { 
                        type: 'string',
                        description: 'The node type (e.g. "n8n-nodes-base.code", "n8n-nodes-base.httpRequest")'
                      },
                      name: { 
                        type: 'string',
                        description: 'The display name of the node'
                      },
                      parameters: { 
                        type: 'object',
                        description: 'Node-specific configuration parameters'
                      }
                    },
                    required: ['type', 'name']
                  }
                },
                connections: {
                  type: 'array',
                  description: 'Array of connections between nodes. Each connection defines how data flows from source to target node.',
                  items: {
                    type: 'object',
                    properties: {
                      source: { 
                        type: 'string',
                        description: 'The source node name or ID'
                      },
                      target: { 
                        type: 'string',
                        description: 'The target node name or ID'
                      },
                      sourceOutput: { 
                        type: 'number', 
                        default: 0,
                        description: 'Output index from the source node (default: 0)'
                      },
                      targetInput: { 
                        type: 'number', 
                        default: 0,
                        description: 'Input index of the target node (default: 0)'
                      }
                    },
                    required: ['source', 'target']
                  }
                }
              },
              required: ['nodes']
            }
          },
          {
            name: 'get_workflow',
            enabled: true,
            description: 'Get a workflow by ID',
            inputSchema: {
              type: 'object',
              properties: { 
                id: { 
                  type: 'string',
                  description: 'The ID of the workflow to retrieve'
                }
              },
              required: ['id']
            }
          },
          {
            name: 'update_workflow',
            enabled: true,
            description: 'Update an existing workflow',
            inputSchema: {
              type: 'object',
              properties: {
                id: { 
                  type: 'string',
                  description: 'The ID of the workflow to update'
                },
                name: { 
                  type: 'string',
                  description: 'The new name for the workflow'
                },
                nodes: { 
                  type: 'array',
                  description: 'Array of workflow nodes. See create_workflow for detailed structure.'
                },
                connections: { 
                  type: 'array',
                  description: 'Array of node connections. See create_workflow for detailed structure.'
                }
              },
              required: ['id', 'name', 'nodes']
            }
          },
          {
            name: 'delete_workflow',
            enabled: true,
            description: 'Delete a workflow by ID',
            inputSchema: {
              type: 'object',
              properties: { 
                id: { 
                  type: 'string',
                  description: 'The ID of the workflow to delete'
                }
              },
              required: ['id']
            }
          },
          {
            name: 'activate_workflow',
            enabled: true,
            description: 'Activate a workflow by ID',
            inputSchema: {
              type: 'object',
              properties: { 
                id: { 
                  type: 'string',
                  description: 'The ID of the workflow to activate'
                }
              },
              required: ['id']
            }
          },
          {
            name: 'deactivate_workflow',
            enabled: true,
            description: 'Deactivate a workflow by ID',
            inputSchema: {
              type: 'object',
              properties: { 
                id: { 
                  type: 'string',
                  description: 'The ID of the workflow to deactivate'
                }
              },
              required: ['id']
            }
          },
          
          // Execution Tools
          {
            name: 'list_executions',
            enabled: true,
            description: 'List all executions from n8n with optional filters',
            inputSchema: {
              type: 'object',
              properties: {
                includeData: { 
                  type: 'boolean',
                  description: 'Whether to include execution data in the response'
                },
                status: { 
                  type: 'string',
                  enum: ['error', 'success', 'waiting'],
                  description: 'Filter executions by status (error, success, or waiting)'
                },
                workflowId: { 
                  type: 'string',
                  description: 'Filter executions by workflow ID'
                },
                projectId: { 
                  type: 'string',
                  description: 'Filter executions by project ID'
                },
                limit: { 
                  type: 'number',
                  description: 'Maximum number of executions to return'
                },
                cursor: { 
                  type: 'string',
                  description: 'Cursor for pagination'
                }
              }
            }
          },
          {
            name: 'get_execution',
            enabled: true,
            description: 'Get details of a specific execution by ID',
            inputSchema: {
              type: 'object',
              properties: {
                id: { 
                  type: 'number',
                  description: 'The ID of the execution to retrieve'
                },
                includeData: { 
                  type: 'boolean',
                  description: 'Whether to include execution data in the response'
                }
              },
              required: ['id']
            }
          },
          {
            name: 'delete_execution',
            enabled: true,
            description: 'Delete an execution by ID',
            inputSchema: {
              type: 'object',
              properties: {
                id: { 
                  type: 'number',
                  description: 'The ID of the execution to delete'
                }
              },
              required: ['id']
            }
          }
        ]
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
      this.log('info', `Message from client: ${JSON.stringify(request)}`);
      
      try {
        const { name, arguments: args } = request.params;
        
        this.log('info', `Tool call: ${name} with arguments: ${JSON.stringify(args)}`);
        
        const handleToolCall = async (toolName: string, args: any): Promise<ToolCallResult> => {
          switch (toolName) {
            case 'list_workflows':
              try {
                const workflows = await n8nApi.listWorkflows();
                return {
                  content: [{ 
                    type: 'text', 
                    text: JSON.stringify(workflows, null, 2) 
                  }]
                };
              } catch (error: any) {
                this.log('error', `Failed to list workflows: ${error.message}`, error);
                throw new McpError(ErrorCode.InternalError, `Failed to list workflows: ${error.message}`);
              }
              
            case 'create_workflow':
              try {
                // Обеспечение, что args - это объект
                const parameters = args || {};
                
                this.log('info', 'Create workflow parameters:', JSON.stringify(parameters, null, 2));
                
                if (!parameters.name || !parameters.nodes) {
                  throw new McpError(ErrorCode.InvalidParams, 'Workflow name and nodes are required');
                }
                
                // Создаем входные данные в нужном формате
                const workflowInput: WorkflowInput = {
                  name: parameters.name,
                  nodes: parameters.nodes as any[]
                };
                
                // Проверка и преобразование узлов
                workflowInput.nodes.forEach((node, index) => {
                  if (!node.name || !node.type) {
                    throw new McpError(ErrorCode.InvalidParams, `Node at index ${index} is missing name or type`);
                  }
                });
                
                // Приводим соединения к формату LegacyWorkflowConnection[]
                if (parameters.connections && Array.isArray(parameters.connections)) {
                  workflowInput.connections = parameters.connections.map((conn: any) => {
                    if (!conn.source || !conn.target) {
                      throw new McpError(ErrorCode.InvalidParams, 'Connection is missing source or target');
                    }
                    return {
                      source: conn.source,
                      target: conn.target,
                      sourceOutput: conn.sourceOutput,
                      targetInput: conn.targetInput
                    };
                  });
                }
                
                this.log('info', 'Transformed workflow input:', JSON.stringify(workflowInput, null, 2));
                
                const createdWorkflow = await n8nApi.createWorkflow(workflowInput);
                
                this.log('info', 'Workflow created successfully:', JSON.stringify(createdWorkflow, null, 2));
                
                return {
                  content: [{ 
                    type: 'text', 
                    text: JSON.stringify(createdWorkflow, null, 2) 
                  }]
                };
              } catch (error: any) {
                this.log('error', 'Error creating workflow:', error);
                if (error instanceof McpError) {
                  throw error;
                }
                throw new McpError(ErrorCode.InternalError, `Failed to create workflow: ${error.message}`);
              }
            
            case 'get_workflow':
              if (!args.id) {
                throw new McpError(ErrorCode.InvalidParams, 'Workflow ID is required');
              }
              
              const workflow = await n8nApi.getWorkflow(args.id);
              return {
                content: [{ 
                  type: 'text', 
                  text: JSON.stringify(workflow, null, 2) 
                }]
              };
            
            case 'update_workflow':
              if (!args.id) {
                throw new McpError(ErrorCode.InvalidParams, 'Workflow ID is required');
              }
              
              if (!args.nodes) {
                throw new McpError(ErrorCode.InvalidParams, 'Workflow nodes are required');
              }
              
              // Создаем входные данные для обновления в нужном формате
              const updateInput: WorkflowInput = {
                name: args.name,
                nodes: args.nodes as any[]
              };
              
              // Приводим соединения к формату LegacyWorkflowConnection[]
              if (args.connections && Array.isArray(args.connections)) {
                updateInput.connections = args.connections.map((conn: any) => ({
                  source: conn.source,
                  target: conn.target,
                  sourceOutput: conn.sourceOutput,
                  targetInput: conn.targetInput
                }));
              }
              
              const updatedWorkflow = await n8nApi.updateWorkflow(args.id, updateInput);
              return {
                content: [{ 
                  type: 'text', 
                  text: JSON.stringify(updatedWorkflow, null, 2) 
                }]
              };
            
            case 'delete_workflow':
              if (!args.id) {
                throw new McpError(ErrorCode.InvalidParams, 'Workflow ID is required');
              }
              
              const deleteResult = await n8nApi.deleteWorkflow(args.id);
              return {
                content: [{ 
                  type: 'text', 
                  text: JSON.stringify(deleteResult, null, 2) 
                }]
              };
            
            case 'activate_workflow':
              if (!args.id) {
                throw new McpError(ErrorCode.InvalidParams, 'Workflow ID is required');
              }
              
              const activatedWorkflow = await n8nApi.activateWorkflow(args.id);
              return {
                content: [{ 
                  type: 'text', 
                  text: JSON.stringify(activatedWorkflow, null, 2) 
                }]
              };
            
            case 'deactivate_workflow':
              if (!args.id) {
                throw new McpError(ErrorCode.InvalidParams, 'Workflow ID is required');
              }
              
              const deactivatedWorkflow = await n8nApi.deactivateWorkflow(args.id);
              return {
                content: [{ 
                  type: 'text', 
                  text: JSON.stringify(deactivatedWorkflow, null, 2) 
                }]
              };
            
            // Execution Tools
            case 'list_executions':
              const executions = await n8nApi.listExecutions({
                includeData: args.includeData,
                status: args.status,
                workflowId: args.workflowId,
                projectId: args.projectId,
                limit: args.limit,
                cursor: args.cursor
              });
              return {
                content: [{ 
                  type: 'text', 
                  text: JSON.stringify(executions, null, 2) 
                }]
              };
            
            case 'get_execution':
              if (!args.id) {
                throw new McpError(ErrorCode.InvalidParams, 'Execution ID is required');
              }
              
              const execution = await n8nApi.getExecution(args.id, args.includeData);
              return {
                content: [{ 
                  type: 'text', 
                  text: JSON.stringify(execution, null, 2) 
                }]
              };
            
            case 'delete_execution':
              if (!args.id) {
                throw new McpError(ErrorCode.InvalidParams, 'Execution ID is required');
              }
              
              const deletedExecution = await n8nApi.deleteExecution(args.id);
              return {
                content: [{ 
                  type: 'text', 
                  text: JSON.stringify(deletedExecution, null, 2) 
                }]
              };
            
            default:
              throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
          }
        };

        return await handleToolCall(name, args);
      } catch (error) {
        logger.error();
        
        if (error instanceof McpError) {
          throw error;
        }
        
        return {
          content: [{ 
            type: 'text', 
            text: `Error: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    });
  }

  private setupPromptHandlers() {
    // Обработчик метода prompts/list
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      this.log('info', 'Listing available prompts');
      
      // Получаем все доступные промты
      const prompts = promptsService.getAllPrompts();
      
      // Преобразуем их в формат, ожидаемый MCP
      const mcpPrompts = prompts.map((prompt: Prompt) => ({
        id: prompt.id,
        name: prompt.name,
        description: prompt.description,
        inputSchema: {
          type: 'object',
          properties: prompt.variables.reduce((schema: Record<string, any>, variable) => {
            schema[variable.name] = {
              type: 'string',
              description: variable.description,
              default: variable.defaultValue
            };
            return schema;
          }, {}),
          required: prompt.variables
            .filter(variable => variable.required)
            .map(variable => variable.name)
        }
      }));
      
      return {
        prompts: mcpPrompts
      };
    });

    // Для prompts/fill добавим обработчик вручную
    // Обходим проблему с типами, регистрируя обработчик напрямую во внутреннем объекте
    this.server["_requestHandlers"].set('prompts/fill', async (request: any) => {
      const { promptId, variables } = request.params;
      this.log('info', `Filling prompt "${promptId}" with variables`);

      try {
        // Получаем промт по ID и заполняем его переданными переменными
        const workflowData = promptsService.fillPromptTemplate(promptId, variables);
        
        // Возвращаем результат в формате, ожидаемом MCP
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(workflowData, null, 2)
          }],
          metadata: {
            promptId,
            timestamp: new Date().toISOString()
          }
        };
      } catch (error) {
        this.log('error', `Error filling prompt: ${error instanceof Error ? error.message : String(error)}`);
        throw new McpError(ErrorCode.InvalidParams, `Error filling prompt: ${error instanceof Error ? error.message : String(error)}`);
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    // Убираем вывод на консоль при запуске
  }
}

const server = new N8NWorkflowServer();
server.run().catch(() => {});