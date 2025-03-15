import { 
  ListToolsRequestSchema as MCPListToolsRequestSchema, 
  CallToolRequestSchema as MCPCallToolRequestSchema,
  ListResourcesRequestSchema as MCPListResourcesRequestSchema,
  ReadResourceRequestSchema as MCPReadResourceRequestSchema,
  ListResourceTemplatesRequestSchema as MCPListResourceTemplatesRequestSchema,
  ListPromptsRequestSchema as MCPListPromptsRequestSchema
} from '@modelcontextprotocol/sdk/types.js';

export const ListToolsRequestSchema = MCPListToolsRequestSchema;
export const CallToolRequestSchema = MCPCallToolRequestSchema;
export const ListResourcesRequestSchema = MCPListResourcesRequestSchema;
export const ReadResourceRequestSchema = MCPReadResourceRequestSchema;
export const ListResourceTemplatesRequestSchema = MCPListResourceTemplatesRequestSchema;
export const ListPromptsRequestSchema = MCPListPromptsRequestSchema;

// Определяем свою схему для заполнения промтов, так как в SDK ее нет
export const FillPromptRequestSchema = {
  method: 'prompts/fill',
  params: {
    promptId: String,
    variables: Object
  }
};
