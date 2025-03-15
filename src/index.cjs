#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const axios = require('axios'); // Use require for CommonJS

class N8NWorkflowBuilder {
    constructor() {
        this.nodes = [];
        this.connections = [];
        this.nextPosition = { x: 100, y: 100 };
    }
    addNode(nodeType, name, parameters) {
        const node = {
            type: nodeType,
            name: name,
            parameters: parameters,
            position: Object.assign({}, this.nextPosition)
        };
        this.nodes.push(node);
        this.nextPosition.x += 200;
        return name;
    }
    connectNodes(source, target, sourceOutput = 0, targetInput = 0) {
        this.connections.push({
            source_node: source,
            target_node: target,
            source_output: sourceOutput,
            target_input: targetInput
        });
    }
    exportWorkflow() {
        const workflow = {
            nodes: this.nodes,
            connections: { main: [] }
        };
        for (const conn of this.connections) {
            const connection = {
                node: conn.target_node,
                type: 'main',
                index: conn.target_input,
                sourceNode: conn.source_node,
                sourceIndex: conn.source_output
            };
            workflow.connections.main.push(connection);
        }
        return workflow;
    }
}

class N8NWorkflowServer {
    constructor() {
        this.n8nHost = process.env.N8N_HOST || 'http://localhost:5678';
        this.n8nApiKey = process.env.N8N_API_KEY || '';

        if (!this.n8nApiKey) {
            console.warn('N8N_API_KEY environment variable not set. API calls to n8n will likely fail.');
        }

        this.server = new index_js_1.Server({
            name: 'n8n-workflow-builder',
            version: '0.2.0'
        }, {
            capabilities: {
                resources: {},
                tools: {}
            }
        });
        this.setupToolHandlers();
        this.server.onerror = (error) => console.error('[MCP Error]', error);
    }

    async createWorkflow(workflowData) {
        try {
            console.log('Creating workflow with data:', JSON.stringify(workflowData, null, 2));
            const response = await axios.post(`${this.n8nHost}/api/v1/workflows`, workflowData, {
                headers: {
                    'X-N8N-API-KEY': this.n8nApiKey
                }
            });
            return response.data;
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                throw new types_js_1.McpError(types_js_1.ErrorCode.InternalError, `n8n API Error: ${error.response?.data?.message || error.message}`);
            }
            throw error;
        }
    }
    async updateWorkflow(id, workflowData) {
        try {
            console.log(`Updating workflow ${id} with data:`, JSON.stringify(workflowData, null, 2));
            const response = await axios.put(`${this.n8nHost}/api/v1/workflows/${id}`, workflowData, {
                headers: {
                    'X-N8N-API-KEY': this.n8nApiKey
                }
            });
            return response.data;
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                throw new types_js_1.McpError(types_js_1.ErrorCode.InternalError, `n8n API Error: ${error.response?.data?.message || error.message}`);
            }
            throw error;
        }
    }
    async activateWorkflow(id) {
        try {
            console.log(`Activating workflow ${id}`);
            const response = await axios.post(`${this.n8nHost}/api/v1/workflows/${id}/activate`, {}, {
                headers: {
                    'X-N8N-API-KEY': this.n8nApiKey
                }
            });
            return response.data;
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                throw new types_js_1.McpError(types_js_1.ErrorCode.InternalError, `n8n API Error: ${error.response?.data?.message || error.message}`);
            }
            throw error;
        }
    }
    async deactivateWorkflow(id) {
        try {
            console.log(`Deactivating workflow ${id}`);
            const response = await axios.post(`${this.n8nHost}/api/v1/workflows/${id}/deactivate`, {}, {
                headers: {
                    'X-N8N-API-KEY': this.n8nApiKey
                }
            });
            return response.data;
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                throw new types_js_1.McpError(types_js_1.ErrorCode.InternalError, `n8n API Error: ${error.response?.data?.message || error.message}`);
            }
            throw error;
        }
    }
    async getWorkflow(id) {
        try {
            console.log(`Getting workflow ${id}`);
            const response = await axios.get(`${this.n8nHost}/api/v1/workflows/${id}`, {
                headers: {
                    'X-N8N-API-KEY': this.n8nApiKey
                }
            });
            return response.data;
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                throw new types_js_1.McpError(types_js_1.ErrorCode.InternalError, `n8n API Error: ${error.response?.data?.message || error.message}`);
            }
            throw error;
        }
    }
    async deleteWorkflow(id) {
        try {
            console.log(`Deleting workflow ${id}`);
            const response = await axios.delete(`${this.n8nHost}/api/v1/workflows/${id}`, {
                headers: {
                    'X-N8N-API-KEY': this.n8nApiKey
                }
            });
            return response.data;
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                throw new types_js_1.McpError(types_js_1.ErrorCode.InternalError, `n8n API Error: ${error.response?.data?.message || error.message}`);
            }
            throw error;
        }
    }
    setupToolHandlers() {
        this.server.setRequestHandler(types_js_1.ListToolsRequestSchema, () => __awaiter(this, void 0, void 0, function* () {
            return ({
                tools: [
                    {
                        name: 'create_workflow',
                        description: 'Create an n8n workflow',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                nodes: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            type: { type: 'string' },
                                            name: { type: 'string' },
                                            parameters: { type: 'object' }
                                        },
                                        required: ['type', 'name']
                                    }
                                },
                                connections: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            source: { type: 'string' },
                                            target: { type: 'string' },
                                            sourceOutput: { type: 'number', default: 0 },
                                            targetInput: { type: 'number', default: 0 }
                                        },
                                        required: ['source', 'target']
                                    }
                                }
                            },
                            required: ['nodes']
                        }
                    },
                    {
                        name: 'create_workflow_and_activate',
                        description: 'Create and activate an n8n workflow',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                nodes: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            type: { type: 'string' },
                                            name: { type: 'string' },
                                            parameters: { type: 'object' }
                                        },
                                        required: ['type', 'name']
                                    }
                                },
                                connections: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            source: { type: 'string' },
                                            target: { type: 'string' },
                                            sourceOutput: { type: 'number', default: 0 },
                                            targetInput: { type: 'number', default: 0 }
                                        },
                                        required: ['source', 'target']
                                    }
                                }
                            },
                            required: ['nodes']
                        }
                    },
                    {
                        name: 'update_workflow',
                        description: 'Update an existing n8n workflow',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                id: { type: 'string', description: 'The ID of the workflow to update' },
                                nodes: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            type: { type: 'string' },
                                            name: { type: 'string' },
                                            parameters: { type: 'object' }
                                        },
                                        required: ['type', 'name']
                                    }
                                },
                                connections: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            source: { type: 'string' },
                                            target: { type: 'string' },
                                            sourceOutput: { type: 'number', default: 0 },
                                            targetInput: { type: 'number', default: 0 }
                                        },
                                        required: ['source', 'target']
                                    }
                                }
                            },
                            required: ['id', 'nodes']
                        }
                    },
                    {
                        name: 'activate_workflow',
                        description: 'Activate an n8n workflow',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                id: { type: 'string', description: 'The ID of the workflow to activate' }
                            },
                            required: ['id']
                        }
                    },
                    {
                        name: 'deactivate_workflow',
                        description: 'Deactivate an n8n workflow',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                id: { type: 'string', description: 'The ID of the workflow to deactivate' }
                            },
                            required: ['id']
                        }
                    },
                    {
                        name: 'get_workflow',
                        description: 'Get an n8n workflow',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                id: { type: 'string', description: 'The ID of the workflow to get' }
                            },
                            required: ['id']
                        }
                    },
                    {
                        name: 'delete_workflow',
                        description: 'Delete an n8n workflow',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                id: { type: 'string', description: 'The ID of the workflow to delete' }
                            },
                            required: ['id']
                        }
                    }
                ]
            });
        }));
        this.server.setRequestHandler(types_js_1.CallToolRequestSchema, (request) => __awaiter(this, void 0, void 0, function* () {
            try {
                const builder = new N8NWorkflowBuilder();
                function isWorkflowSpec(obj) {
                    return obj &&
                        typeof obj === 'object' &&
                        Array.isArray(obj.nodes) &&
                        obj.nodes.every((node) => typeof node === 'object' &&
                            typeof node.type === 'string' &&
                            typeof node.name === 'string') &&
                        (!obj.connections || (Array.isArray(obj.connections) &&
                            obj.connections.every((conn) => typeof conn === 'object' &&
                                typeof conn.source === 'string' &&
                                typeof conn.target === 'string')));
                }
                const args = request.params.arguments;
                switch (request.params.name) {
                    case 'create_workflow': {
                        if (!isWorkflowSpec(args)) {
                            throw new types_js_1.McpError(types_js_1.ErrorCode.InvalidParams, 'Invalid workflow specification: must include nodes array with type and name properties');
                        }
                        const { nodes, connections } = args;
                        for (const node of nodes) {
                            builder.addNode(node.type, node.name, node.parameters || {});
                        }
                        for (const conn of connections || []) {
                            builder.connectNodes(conn.source, conn.target, conn.sourceOutput, conn.targetInput);
                        }
                        return {
                            content: [{
                                    type: 'text',
                                    text: JSON.stringify(builder.exportWorkflow(), null, 2)
                                }]
                        };
                    }
                    case 'create_workflow_and_activate': {
                        if (!isWorkflowSpec(args)) {
                            throw new types_js_1.McpError(types_js_1.ErrorCode.InvalidParams, 'Invalid workflow specification: must include nodes array with type and name properties');
                        }
                        const { nodes, connections } = args;
                        for (const node of nodes) {
                            builder.addNode(node.type, node.name, node.parameters || {});
                        }
                        for (const conn of connections || []) {
                            builder.connectNodes(conn.source, conn.target, conn.sourceOutput, conn.targetInput);
                        }
                        const workflowData = builder.exportWorkflow();
                        const createdWorkflow = yield this.createWorkflow(workflowData);
                        if (createdWorkflow && createdWorkflow.id) {
                            yield this.activateWorkflow(createdWorkflow.id);
                        }
                        return {
                            content: [{
                                    type: 'text',
                                    text: JSON.stringify(createdWorkflow, null, 2)
                                }]
                        };
                    }
                    case 'update_workflow': {
                        if (!isWorkflowSpec(args)) {
                            throw new types_js_1.McpError(types_js_1.ErrorCode.InvalidParams, 'Invalid workflow specification: must include id, nodes array with type and name properties');
                        }
                        const { id, nodes, connections } = args;
                        for (const node of nodes) {
                            builder.addNode(node.type, node.name, node.parameters || {});
                        }
                        for (const conn of connections || []) {
                            builder.connectNodes(conn.source, conn.target, conn.sourceOutput, conn.targetInput);
                        }
                        const workflowData = builder.exportWorkflow();
                        const updatedWorkflow = yield this.updateWorkflow(id, workflowData);
                        return {
                            content: [{
                                    type: 'text',
                                    text: JSON.stringify(updatedWorkflow, null, 2)
                                }]
                        };
                    }
                    case 'activate_workflow': {
                        const { id } = args;
                        if (typeof id !== 'string') {
                            throw new types_js_1.McpError(types_js_1.ErrorCode.InvalidParams, 'Missing workflow id');
                        }
                        const activatedWorkflow = yield this.activateWorkflow(id);
                        return {
                            content: [{
                                    type: 'text',
                                    text: JSON.stringify(activatedWorkflow, null, 2)
                                }]
                        };
                    }
                    case 'deactivate_workflow': {
                        const { id } = args;
                        if (typeof id !== 'string') {
                            throw new types_js_1.McpError(types_js_1.ErrorCode.InvalidParams, 'Missing workflow id');
                        }
                        const deactivatedWorkflow = yield this.deactivateWorkflow(id);
                        return {
                            content: [{
                                    type: 'text',
                                    text: JSON.stringify(deactivatedWorkflow, null, 2)
                                }]
                        };
                    }
                    case 'get_workflow': {
                        const { id } = args;
                        if (typeof id !== 'string') {
                            throw new types_js_1.McpError(types_js_1.ErrorCode.InvalidParams, 'Missing workflow id');
                        }
                        const workflow = yield this.getWorkflow(id);
                        return {
                            content: [{
                                    type: 'text',
                                    text: JSON.stringify(workflow, null, 2)
                                }]
                        };
                    }
                    case 'delete_workflow': {
                        const { id } = args;
                        if (typeof id !== 'string') {
                            throw new types_js_1.McpError(types_js_1.ErrorCode.InvalidParams, 'Missing workflow id');
                        }
                        const deletedWorkflow = yield this.deleteWorkflow(id);
                        return {
                            content: [{
                                    type: 'text',
                                    text: JSON.stringify(deletedWorkflow, null, 2)
                                }]
                        };
                    }
                    default:
                        throw new types_js_1.McpError(types_js_1.ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
                }
            }
            catch (error) {
                if (error instanceof types_js_1.McpError) {
                    throw error;
                }
                throw new types_js_1.McpError(types_js_1.ErrorCode.InternalError, `Workflow operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }));
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            const transport = new stdio_js_1.StdioServerTransport();
            yield this.server.connect(transport);
            console.error('N8N Workflow Builder MCP server running on stdio');
        });
    }
}
const server = new N8NWorkflowServer();
server.run().catch(console.error);
