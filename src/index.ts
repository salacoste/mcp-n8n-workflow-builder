#!/usr/bin/env node
import dotenv from 'dotenv';
// Load environment variables from .env file
dotenv.config();

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import express, { Request, Response, Application } from 'express';
import cors from 'cors';
import * as http from 'http';
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListResourceTemplatesRequestSchema,
  ListPromptsRequestSchema
} from './sdk-schemas';
import { N8NApiWrapper } from './services/n8nApiWrapper';
import { WorkflowBuilder } from './services/workflowBuilder';
import { validateWorkflowSpec } from './utils/validation';
import logger from './utils/logger';
import { WorkflowInput, LegacyWorkflowConnection } from './types/workflow';
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
  private isDebugMode: boolean;
  private n8nWrapper: N8NApiWrapper;

  constructor() {
    this.isDebugMode = process.env.DEBUG === 'true';
    this.n8nWrapper = new N8NApiWrapper();

    this.server = new Server(
      { name: 'n8n-workflow-builder', version: '0.9.0' },
      { capabilities: { tools: {}, resources: {}, prompts: {} } }
    );
    this.setupToolHandlers();
    this.setupResourceHandlers();
    this.setupPromptHandlers();
    this.setupNotificationHandlers();
    this.server.onerror = (error: any) => this.log('error', `Server error: ${error.message || error}`);
  }

  private log(level: 'info' | 'error' | 'debug' | 'warn', message: string, ...args: any[]) {
    const timestamp = new Date().toISOString();
    
    // В режиме отладки выводим больше информации
    if (this.isDebugMode || level !== 'debug') {
      console.error(`${timestamp} [n8n-workflow-builder] [${level}] ${message}`);
      if (args.length > 0) {
        console.error(...args);
      }
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
        const workflows = await this.n8nWrapper.listWorkflows();
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
          const executions = await this.n8nWrapper.listExecutions({ limit: 100 });
          
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
          const workflow = await this.n8nWrapper.getWorkflow(id);
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
          const execution = await this.n8nWrapper.getExecution(id, true);
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
            description: 'List all workflows from n8n with essential metadata only (ID, name, status, dates, node count, tags). Supports filtering by active status. Optimized for performance to prevent large data transfers.',
            inputSchema: {
              type: 'object',
              properties: {
                active: {
                  type: 'boolean',
                  description: 'Filter by activation status. true = only active workflows, false = only inactive workflows, omit for all workflows'
                },
                random_string: {
                  type: 'string',
                  description: 'Dummy parameter for no-parameter tools'
                },
                instance: {
                  type: 'string',
                  description: 'Optional instance name to override automatic instance selection (e.g., \'highway\', \'onvex\')'
                }
              }
            }
          },
          {
            name: 'execute_workflow',
            enabled: true,
            description: 'Manually execute a workflow by ID',
            inputSchema: {
              type: 'object',
              properties: {
                id: { 
                  type: 'string',
                  description: 'The ID of the workflow to execute'
                },
                runData: { 
                  type: 'object',
                  description: 'Optional data to pass to the workflow'
                },
                instance: {
                  type: 'string',
                  description: 'Optional instance name to override automatic instance selection'
                }
              },
              required: ['id']
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
                  description: 'Array of connections between nodes. Each connection defines how data flows from source to target node. This field is critical for workflow functionality. Without connections, the workflow nodes will not interact with each other. Example: [{"source":"Node1","target":"Node2"}]',
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
                },
                instance: {
                  type: 'string',
                  description: 'Optional instance name to override automatic instance selection'
                }
              },
              required: ['nodes', 'name', 'connections']
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
                },
                instance: {
                  type: 'string',
                  description: 'Optional instance name to override automatic instance selection'
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
                },
                instance: {
                  type: 'string',
                  description: 'Optional instance name to override automatic instance selection'
                }
              },
              required: ['id']
            }
          },
          {
            name: 'patch_workflow',
            enabled: true,
            description: 'Partially update workflow (returns guidance - PATCH not supported by n8n API). Use update_workflow for actual updates.',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: 'The ID of the workflow to partially update'
                },
                name: {
                  type: 'string',
                  description: 'New workflow name (optional)'
                },
                nodes: {
                  type: 'array',
                  description: 'New workflow nodes (optional)'
                },
                connections: {
                  type: 'array',
                  description: 'New workflow connections (optional)'
                },
                active: {
                  type: 'boolean',
                  description: 'New active status (optional)'
                },
                settings: {
                  type: 'object',
                  description: 'New settings object (optional)'
                },
                tags: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'New tags array (optional)'
                },
                instance: {
                  type: 'string',
                  description: 'Optional instance name to override automatic instance selection'
                }
              },
              required: ['id']
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
                },
                instance: {
                  type: 'string',
                  description: 'Optional instance name to override automatic instance selection'
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
                },
                instance: {
                  type: 'string',
                  description: 'Optional instance name to override automatic instance selection'
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
                },
                instance: {
                  type: 'string',
                  description: 'Optional instance name to override automatic instance selection'
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
                },
                instance: {
                  type: 'string',
                  description: 'Optional instance name to override automatic instance selection'
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
                },
                instance: {
                  type: 'string',
                  description: 'Optional instance name to override automatic instance selection'
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
                },
                instance: {
                  type: 'string',
                  description: 'Optional instance name to override automatic instance selection'
                }
              },
              required: ['id']
            }
          },
          {
            name: 'retry_execution',
            enabled: true,
            description: 'Retry a failed workflow execution (creates new execution). Only works for executions with status "error".',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'number',
                  description: 'The ID of the failed execution to retry'
                },
                instance: {
                  type: 'string',
                  description: 'Optional instance name to override automatic instance selection'
                }
              },
              required: ['id']
            }
          },
          // Tag Tools
          {
            name: 'create_tag',
            enabled: true,
            description: 'Create a new tag',
            inputSchema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'The name of the tag to create'
                },
                instance: {
                  type: 'string',
                  description: 'Optional instance name to override automatic instance selection'
                }
              },
              required: ['name']
            }
          },
          {
            name: 'get_tags',
            enabled: true,
            description: 'Get all tags',
            inputSchema: {
              type: 'object',
              properties: {
                cursor: {
                  type: 'string',
                  description: 'Cursor for pagination'
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of tags to return'
                },
                instance: {
                  type: 'string',
                  description: 'Optional instance name to override automatic instance selection'
                }
              }
            }
          },
          {
            name: 'get_tag',
            enabled: true,
            description: 'Get a tag by ID',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: 'The ID of the tag to retrieve'
                },
                instance: {
                  type: 'string',
                  description: 'Optional instance name to override automatic instance selection'
                }
              },
              required: ['id']
            }
          },
          {
            name: 'update_tag',
            enabled: true,
            description: 'Update a tag',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: 'The ID of the tag to update'
                },
                name: {
                  type: 'string',
                  description: 'The new name for the tag'
                },
                instance: {
                  type: 'string',
                  description: 'Optional instance name to override automatic instance selection'
                }
              },
              required: ['id', 'name']
            }
          },
          {
            name: 'delete_tag',
            enabled: true,
            description: 'Delete a tag',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: 'The ID of the tag to delete'
                },
                instance: {
                  type: 'string',
                  description: 'Optional instance name to override automatic instance selection'
                }
              },
              required: ['id']
            }
          },
          // Credential Tools
          {
            name: 'list_credentials',
            enabled: true,
            description: 'List all credentials (metadata only, sensitive data excluded for security). Returns credential ID, name, type, nodes access information, and timestamps. Actual credential data (passwords, tokens, keys) is never returned.',
            inputSchema: {
              type: 'object',
              properties: {
                limit: {
                  type: 'number',
                  description: 'Maximum number of credentials to return (default: 100)'
                },
                cursor: {
                  type: 'string',
                  description: 'Cursor for pagination'
                },
                instance: {
                  type: 'string',
                  description: 'Optional instance name to override automatic instance selection'
                }
              }
            }
          },
          {
            name: 'get_credential',
            enabled: true,
            description: 'Get credential by ID (returns guidance - GET not supported by n8n API for security). Credentials contain sensitive data and cannot be read through REST API.',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: 'The ID of the credential to retrieve'
                },
                instance: {
                  type: 'string',
                  description: 'Optional instance name to override automatic instance selection'
                }
              },
              required: ['id']
            }
          },
          {
            name: 'update_credential',
            enabled: true,
            description: 'Update credential (returns guidance - PUT not supported by n8n API for security). Use delete + create pattern instead.',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: 'The ID of the credential to update'
                },
                name: {
                  type: 'string',
                  description: 'New credential name'
                },
                type: {
                  type: 'string',
                  description: 'Credential type'
                },
                data: {
                  type: 'object',
                  description: 'Credential data (sensitive information)'
                },
                instance: {
                  type: 'string',
                  description: 'Optional instance name to override automatic instance selection'
                }
              },
              required: ['id']
            }
          },
          {
            name: 'create_credential',
            enabled: true,
            description: 'Create a new credential for external service authentication. Supports multiple credential types (httpBasicAuth, httpHeaderAuth, OAuth2, etc.). Use get_credential_schema to understand required fields for each type. Sensitive data is automatically encrypted by n8n.',
            inputSchema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'User-defined name for the credential'
                },
                type: {
                  type: 'string',
                  description: 'Credential type (e.g., "httpBasicAuth", "httpHeaderAuth", "oAuth2Api", "googleDriveOAuth2Api"). Use get_credential_schema to see available types and their required fields.'
                },
                data: {
                  type: 'object',
                  description: 'Type-specific credential data. Structure varies by credential type. For httpBasicAuth: {user, password}. For httpHeaderAuth: {name, value}. Use get_credential_schema for exact requirements.'
                },
                instance: {
                  type: 'string',
                  description: 'Optional instance name to override automatic instance selection'
                }
              },
              required: ['name', 'type', 'data']
            }
          },
          {
            name: 'delete_credential',
            enabled: true,
            description: 'Delete a credential by ID. Removes the credential from n8n permanently. Workflows using this credential will need to be updated.',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: 'The ID of the credential to delete'
                },
                instance: {
                  type: 'string',
                  description: 'Optional instance name to override automatic instance selection'
                }
              },
              required: ['id']
            }
          },
          {
            name: 'get_credential_schema',
            enabled: true,
            description: 'Get JSON schema for a specific credential type (e.g., httpBasicAuth, googleDriveOAuth2Api). Returns field definitions, types, required fields, and validation rules to help create credentials programmatically.',
            inputSchema: {
              type: 'object',
              properties: {
                typeName: {
                  type: 'string',
                  description: 'The credential type name (e.g., "httpBasicAuth", "httpHeaderAuth", "googleDriveOAuth2Api", "slackApi")'
                },
                instance: {
                  type: 'string',
                  description: 'Optional instance name to override automatic instance selection'
                }
              },
              required: ['typeName']
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
                const workflows = await this.n8nWrapper.listWorkflows(args.instance, args.active);
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

            case 'execute_workflow':
              if (!args.id) {
                throw new McpError(ErrorCode.InvalidParams, 'Workflow ID is required');
              }
              
              const executionResult = await this.n8nWrapper.executeWorkflow(args.id, args.runData, args.instance);
              return {
                content: [{ 
                  type: 'text', 
                  text: JSON.stringify(executionResult, null, 2) 
                }]
              };
            
            case 'create_workflow':
              try {
                // Ensure args is an object
                const parameters = args || {};
                
                this.log('info', 'Create workflow parameters:', JSON.stringify(parameters, null, 2));
                
                if (!parameters.name) {
                  throw new McpError(ErrorCode.InvalidParams, 'Workflow name is required');
                }

                // Nodes is optional - can create minimal workflow with just name
                const nodes = parameters.nodes || [];

                // Connections is optional - workflows can exist without connections
                const connections = parameters.connections || [];

                if (!Array.isArray(nodes)) {
                  throw new McpError(ErrorCode.InvalidParams, 'Nodes must be an array');
                }

                if (!Array.isArray(connections)) {
                  throw new McpError(ErrorCode.InvalidParams, 'Connections must be an array');
                }

                // Create input data in the required format
                const workflowInput: WorkflowInput = {
                  name: parameters.name,
                  nodes: nodes as any[],
                  connections: []
                };
                
                // Check and transform nodes
                workflowInput.nodes.forEach((node: any, index: number) => {
                  if (!node.name || !node.type) {
                    throw new McpError(ErrorCode.InvalidParams, `Node at index ${index} is missing name or type`);
                  }
                });
                
                // Transform connections to LegacyWorkflowConnection[] format
                if (parameters.connections && Array.isArray(parameters.connections)) {
                  workflowInput.connections = parameters.connections.map((conn: any) => {
                    if (!conn.source || !conn.target) {
                      throw new McpError(ErrorCode.InvalidParams, 'Connection is missing source or target fields. Each connection must define both source and target nodes.');
                    }
                    
                    // Check that source and target nodes exist in the workflow
                    const sourceNode = workflowInput.nodes.find(node => node.name === conn.source || node.id === conn.source);
                    const targetNode = workflowInput.nodes.find(node => node.name === conn.target || node.id === conn.target);
                    
                    if (!sourceNode) {
                      throw new McpError(ErrorCode.InvalidParams, `Connection references non-existent source node: "${conn.source}"`);
                    }
                    
                    if (!targetNode) {
                      throw new McpError(ErrorCode.InvalidParams, `Connection references non-existent target node: "${conn.target}"`);
                    }
                    
                    // Всегда используем имя узла для connections - это обеспечит совместимость с n8n UI
                    return {
                      source: sourceNode.name,
                      target: targetNode.name,
                      sourceOutput: conn.sourceOutput || 0,
                      targetInput: conn.targetInput || 0
                    };
                  });
                }
                
                this.log('info', 'Transformed workflow input:', JSON.stringify(workflowInput, null, 2));
                
                const createdWorkflow = await this.n8nWrapper.createWorkflow(workflowInput, args.instance);
                
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
              
              const workflow = await this.n8nWrapper.getWorkflow(args.id, args.instance);
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

              // Nodes and connections are optional for updates (same as create_workflow)
              const updateNodes = args.nodes || [];
              const updateConnections = args.connections || [];

              // Create input data for updating in the required format
              const updateInput: WorkflowInput = {
                name: args.name,
                nodes: updateNodes as any[],
                connections: []
              };
              
              // Transform connections to LegacyWorkflowConnection[] format
              if (updateConnections.length > 0) {
                // Проверяем, имеет ли объект connections структуру объекта или массива
                if (Array.isArray(updateConnections)) {
                  updateInput.connections = updateConnections.map((conn: any) => ({
                    source: conn.source,
                    target: conn.target,
                    sourceOutput: conn.sourceOutput,
                    targetInput: conn.targetInput
                  }));
                } else if (typeof args.connections === 'object') {
                  // Формат объекта n8n API, преобразуем его в массив LegacyWorkflowConnection
                  const legacyConnections: LegacyWorkflowConnection[] = [];
                  
                  Object.entries(args.connections).forEach(([sourceName, data]: [string, any]) => {
                    if (data.main && Array.isArray(data.main)) {
                      data.main.forEach((connectionGroup: any[], sourceIndex: number) => {
                        if (Array.isArray(connectionGroup)) {
                          connectionGroup.forEach(conn => {
                            legacyConnections.push({
                              source: sourceName,
                              target: conn.node,
                              sourceOutput: sourceIndex,
                              targetInput: conn.index || 0
                            });
                          });
                        }
                      });
                    }
                  });
                  
                  updateInput.connections = legacyConnections;
                } else {
                  throw new McpError(ErrorCode.InvalidParams, 'Connections must be either an array or an object');
                }
              }
              
              this.log('info', `Updating workflow with connections: ${JSON.stringify(updateInput.connections)}`);
              
              try {
                const updatedWorkflow = await this.n8nWrapper.updateWorkflow(args.id, updateInput, args.instance);
                return {
                  content: [{ 
                    type: 'text', 
                    text: JSON.stringify(updatedWorkflow, null, 2) 
                  }]
                };
              } catch (error: any) {
                this.log('error', `Failed to update workflow: ${error.message}`, error);
                throw new McpError(ErrorCode.InternalError, `Failed to update workflow: ${error.message}`);
              }

            case 'patch_workflow':
              if (!args.id) {
                throw new McpError(ErrorCode.InvalidParams, 'Workflow ID is required');
              }

              // PATCH method is not supported by n8n REST API (tested on v1.82.3 and v2.1.4)
              // Returns 405 Method Not Allowed
              this.log('info', `PATCH workflow request for ID: ${args.id} - returning API limitation message`);

              const requestedFields = [];
              if (args.name !== undefined) requestedFields.push('name');
              if (args.active !== undefined) requestedFields.push('active');
              if (args.settings !== undefined) requestedFields.push('settings');
              if (args.tags !== undefined) requestedFields.push('tags');
              if (args.nodes !== undefined) requestedFields.push('nodes');
              if (args.connections !== undefined) requestedFields.push('connections');

              return {
                content: [{
                  type: 'text',
                  text: JSON.stringify({
                    success: false,
                    method: 'PATCH',
                    workflowId: args.id,
                    requestedFields: requestedFields,
                    message: 'PATCH method is not supported by n8n REST API',
                    apiLimitation: 'n8n API does not support PATCH /workflows/{id} (returns 405 Method Not Allowed)',
                    testedVersions: ['v1.82.3', 'v2.1.4'],
                    recommendation: 'Use update_workflow (PUT method) instead for updating workflows',
                    workaround: {
                      description: 'To update only specific fields, use the update_workflow tool with complete workflow structure',
                      steps: [
                        '1. Retrieve current workflow using get_workflow',
                        '2. Modify only the desired fields',
                        '3. Send complete updated workflow via update_workflow',
                      ],
                      example: {
                        step1: 'const workflow = await get_workflow({ id: "' + args.id + '" })',
                        step2: 'workflow.name = "New Name"  // or modify other fields',
                        step3: 'const updated = await update_workflow({ id: workflow.id, ...workflow })'
                      }
                    },
                    alternativeTools: {
                      update_workflow: 'Full workflow update (PUT) - requires complete workflow structure',
                      activate_workflow: 'Change active status to true',
                      deactivate_workflow: 'Change active status to false'
                    },
                    technicalDetails: {
                      httpMethod: 'PATCH',
                      endpoint: '/api/v1/workflows/{id}',
                      expectedBehavior: 'Partial update of workflow fields',
                      actualBehavior: '405 Method Not Allowed',
                      documentation: 'PATCH is documented in API docs but not implemented in n8n',
                      implementationStatus: 'Code ready, waiting for n8n API support'
                    }
                  }, null, 2)
                }]
              };

            case 'delete_workflow':
              if (!args.id) {
                throw new McpError(ErrorCode.InvalidParams, 'Workflow ID is required');
              }
              
              const deleteResult = await this.n8nWrapper.deleteWorkflow(args.id, args.instance);
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

              try {
                const activatedWorkflow = await this.n8nWrapper.activateWorkflow(args.id, args.instance);
                return {
                  content: [{
                    type: 'text',
                    text: JSON.stringify(activatedWorkflow, null, 2)
                  }]
                };
              } catch (error: any) {
                this.log('error', `Failed to activate workflow: ${error.message}`, error);
                throw new McpError(ErrorCode.InternalError, `Failed to activate workflow: ${error.message}`);
              }

            case 'deactivate_workflow':
              if (!args.id) {
                throw new McpError(ErrorCode.InvalidParams, 'Workflow ID is required');
              }

              try {
                const deactivatedWorkflow = await this.n8nWrapper.deactivateWorkflow(args.id, args.instance);
                return {
                  content: [{
                    type: 'text',
                    text: JSON.stringify(deactivatedWorkflow, null, 2)
                  }]
                };
              } catch (error: any) {
                this.log('error', `Failed to deactivate workflow: ${error.message}`, error);
                throw new McpError(ErrorCode.InternalError, `Failed to deactivate workflow: ${error.message}`);
              }

            // Execution Tools
            case 'list_executions':
              const executions = await this.n8nWrapper.listExecutions({
                includeData: args.includeData,
                status: args.status,
                workflowId: args.workflowId,
                projectId: args.projectId,
                limit: args.limit,
                cursor: args.cursor
              }, args.instance);
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
              
              const execution = await this.n8nWrapper.getExecution(args.id, args.includeData, args.instance);
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

              const deletedExecution = await this.n8nWrapper.deleteExecution(args.id, args.instance);
              return {
                content: [{
                  type: 'text',
                  text: JSON.stringify(deletedExecution, null, 2)
                }]
              };

            case 'retry_execution':
              if (!args.id) {
                throw new McpError(ErrorCode.InvalidParams, 'Execution ID is required');
              }

              try {
                const retriedExecution = await this.n8nWrapper.retryExecution(args.id, args.instance);
                return {
                  content: [{
                    type: 'text',
                    text: JSON.stringify(retriedExecution, null, 2)
                  }]
                };
              } catch (error: any) {
                this.log('error', `Failed to retry execution: ${error.message}`, error);
                throw new McpError(ErrorCode.InternalError, `Failed to retry execution: ${error.message}`);
              }

            // Tag Tools
            case 'create_tag':
              if (!args.name) {
                throw new McpError(ErrorCode.InvalidParams, 'Tag name is required');
              }
              
              const createdTag = await this.n8nWrapper.createTag({ name: args.name }, args.instance);
              return {
                content: [{ 
                  type: 'text', 
                  text: JSON.stringify(createdTag, null, 2) 
                }]
              };
            
            case 'get_tags':
              const tagsOptions: { cursor?: string; limit?: number } = {};
              
              if (args.cursor) {
                tagsOptions.cursor = args.cursor;
              }
              
              if (args.limit) {
                tagsOptions.limit = args.limit;
              }
              
              const tags = await this.n8nWrapper.getTags(tagsOptions, args.instance);
              return {
                content: [{ 
                  type: 'text', 
                  text: JSON.stringify(tags, null, 2) 
                }]
              };
            
            case 'get_tag':
              if (!args.id) {
                throw new McpError(ErrorCode.InvalidParams, 'Tag ID is required');
              }
              
              const tag = await this.n8nWrapper.getTag(args.id, args.instance);
              return {
                content: [{ 
                  type: 'text', 
                  text: JSON.stringify(tag, null, 2) 
                }]
              };
            
            case 'update_tag':
              if (!args.id || !args.name) {
                throw new McpError(ErrorCode.InvalidParams, 'Tag ID and name are required');
              }
              
              const updatedTag = await this.n8nWrapper.updateTag(args.id, { name: args.name }, args.instance);
              return {
                content: [{ 
                  type: 'text', 
                  text: JSON.stringify(updatedTag, null, 2) 
                }]
              };
            
            case 'delete_tag':
              if (!args.id) {
                throw new McpError(ErrorCode.InvalidParams, 'Tag ID is required');
              }

              const deletedTag = await this.n8nWrapper.deleteTag(args.id, args.instance);
              return {
                content: [{
                  type: 'text',
                  text: JSON.stringify(deletedTag, null, 2)
                }]
              };

            // Credential Tools
            case 'list_credentials':
              // Credentials API is not supported by n8n REST API
              this.log('info', `Credentials API request - returning API limitation message`);

              return {
                content: [{
                  type: 'text',
                  text: JSON.stringify({
                    success: false,
                    method: 'GET',
                    endpoint: '/credentials',
                    message: 'Credentials API is not supported by n8n REST API',
                    apiLimitation: 'n8n API does not support GET /credentials endpoint (returns 405 Method Not Allowed)',
                    testedVersions: ['v1.82.3', 'v2.1.4'],
                    recommendation: 'Use the n8n web interface to view and manage credentials',
                    securityNote: 'Credentials contain sensitive data (API keys, passwords, tokens) and are intentionally restricted from REST API access for security reasons',
                    alternativeAccess: {
                      webInterface: {
                        description: 'Access credentials through n8n UI',
                        steps: [
                          '1. Open your n8n web interface',
                          '2. Navigate to Credentials menu',
                          '3. View and manage all credentials',
                          '4. Create, edit, or delete credentials as needed'
                        ],
                        url: 'Navigate to: Settings → Credentials'
                      },
                      workflowContext: {
                        description: 'Credentials are accessible within workflow nodes',
                        usage: 'When configuring nodes in workflows, credentials can be selected from a dropdown list',
                        note: 'Credential data is automatically injected into nodes during execution'
                      }
                    },
                    understandingCredentials: {
                      purpose: 'Credentials store authentication information for external services',
                      types: [
                        'OAuth2 (Google, GitHub, etc.)',
                        'API Keys',
                        'HTTP Basic Auth',
                        'HTTP Header Auth',
                        'Database connections',
                        'Custom credentials'
                      ],
                      security: 'All credential data is encrypted at rest and never exposed through REST API'
                    },
                    technicalDetails: {
                      httpMethod: 'GET',
                      endpoint: '/api/v1/credentials',
                      responseCode: 405,
                      errorMessage: 'GET method not allowed',
                      apiVersion: 'v1',
                      restriction: 'By design - credentials API intentionally not exposed for security'
                    }
                  }, null, 2)
                }]
              };

            case 'get_credential':
              if (!args.id) {
                throw new McpError(ErrorCode.InvalidParams, 'Credential ID is required');
              }

              // GET /credentials/{id} is not supported by n8n REST API
              this.log('info', `GET credential by ID request for ${args.id} - returning API limitation message`);

              return {
                content: [{
                  type: 'text',
                  text: JSON.stringify({
                    success: false,
                    method: 'GET',
                    endpoint: `/credentials/${args.id}`,
                    credentialId: args.id,
                    message: 'Reading individual credentials is not supported by n8n REST API',
                    apiLimitation: 'n8n API does not support GET /credentials/{id} endpoint (returns 405 Method Not Allowed)',
                    testedVersions: ['v1.82.3', 'v2.1.4'],
                    securityReason: 'Prevents exposure of sensitive credential data through API. This is an intentional security restriction.',
                    recommendation: 'Credentials are designed for use within workflows, not for reading through API',
                    alternativeApproaches: {
                      viewInUI: {
                        description: 'View credential details in n8n web interface',
                        steps: [
                          '1. Open n8n web interface',
                          '2. Navigate to Settings → Credentials',
                          '3. Find and open the specific credential',
                          '4. View configuration (sensitive data remains masked)'
                        ]
                      },
                      useInWorkflow: {
                        description: 'Credentials are automatically available in workflow nodes',
                        usage: 'When configuring a node, select the credential from the dropdown. Credential data is automatically injected during execution.',
                        note: 'This is the intended use case - credentials work transparently without manual data handling'
                      },
                      recreateIfNeeded: {
                        description: 'If you need to update a credential, delete and recreate it',
                        steps: [
                          '1. Note the credential name and type',
                          '2. Use delete_credential to remove it',
                          '3. Use create_credential to recreate with new data'
                        ],
                        tools: ['delete_credential', 'create_credential']
                      }
                    },
                    availableOperations: {
                      create: 'Use create_credential to create new credentials',
                      delete: 'Use delete_credential to remove credentials',
                      schema: 'Use get_credential_schema to get credential type schema',
                      list: 'list_credentials also unavailable (405) - view in UI instead'
                    },
                    technicalDetails: {
                      httpMethod: 'GET',
                      endpoint: `/api/v1/credentials/${args.id}`,
                      responseCode: 405,
                      errorMessage: 'GET method not allowed',
                      apiVersion: 'v1',
                      restriction: 'By design - reading credentials intentionally blocked for security',
                      partialAPISupport: 'Only CREATE, DELETE, and SCHEMA operations are supported via REST API'
                    }
                  }, null, 2)
                }]
              };

            case 'update_credential':
              if (!args.id) {
                throw new McpError(ErrorCode.InvalidParams, 'Credential ID is required');
              }

              // PUT /credentials/{id} is not supported by n8n REST API
              this.log('info', `UPDATE credential request for ${args.id} - returning API limitation message`);

              return {
                content: [{
                  type: 'text',
                  text: JSON.stringify({
                    success: false,
                    method: 'PUT',
                    endpoint: `/credentials/${args.id}`,
                    credentialId: args.id,
                    message: 'Updating credentials is not supported by n8n REST API',
                    apiLimitation: 'n8n API does not support PUT /credentials/{id} endpoint (returns 405 Method Not Allowed)',
                    testedVersions: ['v1.82.3', 'v2.1.4'],
                    securityReason: 'Prevents modification of existing credentials through API. This is an intentional security restriction.',
                    recommendation: 'Use the DELETE + CREATE pattern to "update" a credential',
                    workaround: {
                      description: 'To update a credential, delete the old one and create a new one with updated data',
                      steps: [
                        '1. Note the credential details (name, type) from n8n UI',
                        '2. Use delete_credential tool to remove the old credential',
                        '3. Use create_credential tool to create new credential with updated data',
                        '4. Update any workflows that referenced the old credential (if ID changes)'
                      ],
                      example: {
                        step1: 'View credential in n8n UI to note: name="My API Key", type="httpHeaderAuth"',
                        step2: 'await delete_credential({ id: "old-credential-id" })',
                        step3: 'const newCred = await create_credential({ name: "My API Key", type: "httpHeaderAuth", data: { name: "Authorization", value: "Bearer new-token" } })',
                        step4: 'Workflows automatically use credentials by name, or update node configuration if needed'
                      },
                      note: 'This is the intended pattern - credentials are immutable once created for security'
                    },
                    alternativeApproaches: {
                      uiUpdate: {
                        description: 'Update credential directly in n8n web interface',
                        steps: [
                          '1. Open n8n web interface',
                          '2. Navigate to Settings → Credentials',
                          '3. Find and open the credential',
                          '4. Click Edit and update the fields',
                          '5. Save changes'
                        ],
                        note: 'This is the recommended approach for most users'
                      },
                      deleteAndRecreate: {
                        description: 'Programmatic update via delete + create',
                        tools: ['delete_credential', 'create_credential'],
                        usageNote: 'Useful for automation scripts and bulk updates'
                      }
                    },
                    availableOperations: {
                      create: 'Use create_credential to create new credentials',
                      delete: 'Use delete_credential to remove credentials',
                      schema: 'Use get_credential_schema to get credential type schema for validation',
                      read: 'Reading credentials (GET) also unavailable (405) - view in UI instead'
                    },
                    technicalDetails: {
                      httpMethod: 'PUT',
                      endpoint: `/api/v1/credentials/${args.id}`,
                      responseCode: 405,
                      errorMessage: 'GET method not allowed',
                      apiVersion: 'v1',
                      restriction: 'By design - updating credentials intentionally blocked for security',
                      partialAPISupport: 'Only CREATE, DELETE, and SCHEMA operations are supported via REST API',
                      immutabilityReason: 'Credentials are designed to be immutable for audit trail and security'
                    }
                  }, null, 2)
                }]
              };

            case 'delete_credential':
              if (!args.id) {
                throw new McpError(ErrorCode.InvalidParams, 'Credential ID is required');
              }

              try {
                const deletedCredential = await this.n8nWrapper.deleteCredential(args.id, args.instance);
                return {
                  content: [{
                    type: 'text',
                    text: JSON.stringify(deletedCredential, null, 2)
                  }]
                };
              } catch (error: any) {
                this.log('error', `Failed to delete credential: ${error.message}`, error);
                throw new McpError(ErrorCode.InternalError, `Failed to delete credential: ${error.message}`);
              }

            case 'get_credential_schema':
              if (!args.typeName) {
                throw new McpError(ErrorCode.InvalidParams, 'Credential type name is required');
              }

              try {
                const schema = await this.n8nWrapper.getCredentialSchema(args.typeName, args.instance);
                return {
                  content: [{
                    type: 'text',
                    text: JSON.stringify(schema, null, 2)
                  }]
                };
              } catch (error: any) {
                this.log('error', `Failed to get credential schema: ${error.message}`, error);
                throw new McpError(ErrorCode.InternalError, `Failed to get credential schema: ${error.message}`);
              }

            case 'create_credential':
              if (!args.name || !args.type || !args.data) {
                throw new McpError(ErrorCode.InvalidParams, 'Credential name, type, and data are required');
              }

              try {
                const credential = await this.n8nWrapper.createCredential({
                  name: args.name,
                  type: args.type,
                  data: args.data
                }, args.instance);

                return {
                  content: [{
                    type: 'text',
                    text: JSON.stringify(credential, null, 2)
                  }]
                };
              } catch (error: any) {
                this.log('error', `Failed to create credential: ${error.message}`, error);
                throw new McpError(ErrorCode.InternalError, `Failed to create credential: ${error.message}`);
              }

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
    // Handler for prompts/list method
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      this.log('info', 'Listing available prompts');
      
      // Get all available prompts
      const prompts = promptsService.getAllPrompts();
      
      // Transform them to the format expected by MCP
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

    // For prompts/fill we'll add a handler manually
    // Working around type issues by registering the handler directly in the internal object
    this.server["_requestHandlers"].set('prompts/fill', async (request: any) => {
      const { promptId, variables } = request.params;
      this.log('info', `Filling prompt "${promptId}" with variables`);

      try {
        // Get the prompt by ID and fill it with the provided variables
        const workflowData = promptsService.fillPromptTemplate(promptId, variables);
        
        // Return the result in the format expected by MCP
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

  // Setup notification handlers for MCP protocol notifications
  private setupNotificationHandlers() {
    // Initialize notification handlers map if it doesn't exist
    this.server['_notificationHandlers'] = this.server['_notificationHandlers'] || new Map();

    // Handle notifications/initialized - sent by MCP clients after connection
    this.server['_notificationHandlers'].set('notifications/initialized', async (notification: any) => {
      this.log('info', 'MCP client initialized successfully');
      // No response needed for notifications per JSON-RPC 2.0 spec
    });

    // Handle notifications/cancelled - sent when client cancels an operation
    this.server['_notificationHandlers'].set('notifications/cancelled', async (notification: any) => {
      this.log('info', 'Client cancelled operation', notification.params);
      // No response needed for notifications
    });

    // Handle notifications/progress - progress updates from client
    this.server['_notificationHandlers'].set('notifications/progress', async (notification: any) => {
      this.log('debug', 'Progress notification received', notification.params);
      // No response needed for notifications
    });
  }

  // Запуск MCP сервера
  async run() {
    // ВАЖНО: Не добавлять вывод в консоль здесь, так как это препятствует работе JSON-RPC через stdin/stdout
    try {
      // Check if we're running as an MCP subprocess (stdin is a TTY) or standalone
      const isStandaloneMode = process.env.MCP_STANDALONE === 'true' || process.stdin.isTTY;
      
      if (isStandaloneMode) {
        // Standalone mode - only run HTTP server
        const port = process.env.MCP_PORT ? parseInt(process.env.MCP_PORT, 10) : 3456;
        await this.startHttpServer(port);
        this.log('info', `MCP server running in standalone mode on port ${port}`);
        
        // Keep the process alive
        process.on('SIGINT', () => {
          this.log('info', 'Received SIGINT, shutting down gracefully');
          process.exit(0);
        });
      } else {
        // MCP subprocess mode - use stdin/stdout transport
        const transport = new StdioServerTransport();
        
        // Also start HTTP server for debugging
        const port = process.env.MCP_PORT ? parseInt(process.env.MCP_PORT, 10) : 3456;
        this.startHttpServer(port).catch(error => {
          // Don't fail if HTTP server can't start in MCP mode
          this.log('warn', `HTTP server failed to start: ${error.message}`);
        });
        
        // Connect to MCP transport
        await this.server.connect(transport);
      }
    } catch (error) {
      // Логируем ошибку в файл
      this.log('error', `Failed to start MCP server: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  }
  
  private async startHttpServer(port: number): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const app = express();
        
        // Настройка CORS
        app.use(cors());
        
        // Парсинг JSON
        app.use(express.json({ limit: '50mb' }));
        
        // Эндпоинт для проверки работы сервера
        app.get('/health', (req: Request, res: Response) => {
          res.json({
            status: 'ok',
            message: 'MCP server is running',
            version: '0.9.0'
          });
        });
        
        // Обработчик для MCP запросов
        app.post('/mcp', (req: Request, res: Response) => {
          try {
            this.log('debug', 'Received MCP request', req.body);

            // Обработка MCP запроса
            this.handleJsonRpcMessage(req.body).then(result => {
              // Per JSON-RPC 2.0 spec: notifications return null and should get 204 No Content
              if (result === null) {
                this.log('debug', 'Notification processed, sending 204 No Content');
                res.status(204).end();
              } else {
                this.log('debug', 'Sending MCP response', result);
                res.json(result);
              }
            }).catch((error: Error) => {
              this.log('error', 'Error handling MCP request', error);
              res.status(500).json({
                jsonrpc: '2.0',
                error: {
                  code: -32603,
                  message: 'Internal server error',
                  data: error.message
                },
                id: req.body?.id || null
              });
            });
          } catch (error) {
            this.log('error', 'Error processing MCP request', error);
            res.status(500).json({
              jsonrpc: '2.0',
              error: {
                code: -32603,
                message: 'Internal server error',
                data: error instanceof Error ? error.message : 'Unknown error'
              },
              id: req.body?.id || null
            });
          }
        });
        
        // Запуск HTTP-сервера
        const httpServer = http.createServer(app);

        httpServer.on('error', (error: NodeJS.ErrnoException) => {
          if (error.code === 'EADDRINUSE') {
            this.log('info', `Port ${port} is already in use. Assuming another instance is already running.`);
            // Резолвим промис для graceful handling
            resolve();
          } else {
            this.log('error', `HTTP server error: ${error.message}`);
            reject(error);
          }
        });

        httpServer.listen(port, () => {
          this.log('info', `MCP HTTP server listening on port ${port}`);
          resolve();
        });
      } catch (error) {
        this.log('error', `Failed to start HTTP server: ${error instanceof Error ? error.message : String(error)}`);
        reject(error);
      }
    });
  }
  
  private async handleJsonRpcMessage(request: any): Promise<any> {
    const { method, id } = request;

    // Per JSON-RPC 2.0 spec: notifications don't have an 'id' field
    const isNotification = id === undefined || id === null;

    if (isNotification) {
      // Handle notification - look in notification handlers
      const notificationHandler = this.server['_notificationHandlers']?.get(method);

      if (!notificationHandler) {
        // Per JSON-RPC 2.0: no error response for notifications with unknown methods
        this.log('warn', `Notification handler not found for method '${method}', ignoring`);
        return null;
      }

      try {
        // Execute notification handler - no response expected
        await notificationHandler(request);
        return null; // No response for notifications
      } catch (error) {
        // Per JSON-RPC 2.0: errors in notification handlers should be logged but not returned
        this.log('error', `Notification handler error for '${method}': ${error instanceof Error ? error.message : String(error)}`);
        return null;
      }
    } else {
      // Handle request - look in request handlers
      const handler = this.server['_requestHandlers'].get(method);

      if (!handler) {
        throw new McpError(ErrorCode.MethodNotFound, `Method '${method}' not found`);
      }

      try {
        // Execute request handler and return response
        const result = await handler(request);

        // Return result in JSON-RPC 2.0 format
        return {
          jsonrpc: '2.0',
          result,
          id
        };
      } catch (error) {
        this.log('error', `Handler error: ${error instanceof Error ? error.message : String(error)}`);
        throw error;
      }
    }
  }
}

// Запуск сервера с обработкой ошибок
const server = new N8NWorkflowServer();
server.run().catch((error) => {
  console.error(`Fatal error starting server: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});