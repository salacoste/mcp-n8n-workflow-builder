# MCP N8N Workflow Builder - Development Standards

## Project Overview

**Purpose**: MCP (Model Context Protocol) server for managing n8n workflows through Claude AI and Cursor IDE
**Technology Stack**: TypeScript, Node.js, Express, Axios, MCP SDK
**Core Functionality**: Workflow CRUD operations, execution management, multi-instance support, template-based workflow generation

## Project Architecture

### Directory Structure
```
src/
├── config/          # Configuration management
├── services/        # Core business logic services
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
└── index.ts         # Main entry point
```

### Core Services
- **N8NApiWrapper**: API abstraction layer for n8n REST API
- **WorkflowBuilder**: Programmatic workflow construction
- **EnvironmentManager**: Multi-instance configuration management
- **PromptsService**: Template-based workflow generation

## Code Standards

### TypeScript Standards
- **ALWAYS** use strict TypeScript with proper type annotations
- **ALWAYS** extend existing interfaces rather than creating new ones
- **ALWAYS** use the provided type definitions in `src/types/`
- **NEVER** use `any` type without explicit justification
- **ALWAYS** validate input data using the validation utilities

### Naming Conventions
- **Services**: PascalCase with descriptive names (e.g., `N8NApiWrapper`)
- **Interfaces**: PascalCase with descriptive names (e.g., `WorkflowInput`)
- **Functions**: camelCase with descriptive names (e.g., `validateWorkflowSpec`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `DEFAULT_POSITION`)
- **Files**: kebab-case for utilities, PascalCase for services

### Error Handling Standards
- **ALWAYS** use MCP ErrorCode enum for error codes
- **ALWAYS** provide descriptive error messages
- **ALWAYS** log errors using the logger utility
- **NEVER** expose internal error details to clients
- **ALWAYS** validate inputs before processing

```typescript
// CORRECT: Use MCP error codes
throw new McpError(ErrorCode.InvalidParams, 'Workflow ID is required');

// INCORRECT: Generic errors
throw new Error('Something went wrong');
```

## Functionality Implementation Standards

### Workflow Management
- **ALWAYS** validate workflow specifications using `validateWorkflowSpec()`
- **ALWAYS** transform connections using `transformConnectionsToArray()` when needed
- **ALWAYS** use the WorkflowBuilder for programmatic workflow creation
- **NEVER** bypass validation for workflow operations
- **ALWAYS** handle both array and object connection formats

### Multi-Instance Support
- **ALWAYS** use EnvironmentManager for instance selection
- **ALWAYS** validate instance existence before API calls
- **ALWAYS** use the `callWithInstance()` wrapper for API operations
- **NEVER** hardcode instance configurations
- **ALWAYS** provide instance parameter in tool definitions

### API Integration
- **ALWAYS** use N8NApiWrapper for all n8n API calls
- **ALWAYS** handle API errors consistently using `handleApiError()`
- **ALWAYS** validate API responses
- **NEVER** make direct axios calls outside the wrapper
- **ALWAYS** use proper authentication headers

### Configuration Management
- **ALWAYS** use ConfigLoader singleton for configuration access
- **ALWAYS** support both .config.json and .env formats
- **ALWAYS** validate configuration structure
- **NEVER** hardcode configuration values
- **ALWAYS** provide fallback configurations

## Framework/Plugin/Third-party Library Usage Standards

### MCP SDK
- **ALWAYS** use the latest MCP SDK version
- **ALWAYS** follow MCP protocol specifications
- **ALWAYS** use proper request/response schemas
- **NEVER** bypass MCP protocol requirements
- **ALWAYS** handle both stdio and HTTP transports

### Axios
- **ALWAYS** use configured axios instances from EnvironmentManager
- **ALWAYS** handle axios errors properly
- **ALWAYS** set proper headers and timeouts
- **NEVER** create axios instances directly
- **ALWAYS** use the provided error handling utilities

### Express (HTTP Server)
- **ALWAYS** use CORS middleware
- **ALWAYS** validate request bodies
- **ALWAYS** handle JSON-RPC format properly
- **NEVER** expose sensitive information in responses
- **ALWAYS** use proper HTTP status codes

## Workflow Standards

### Development Workflow
1. **ALWAYS** start with type definitions
2. **ALWAYS** implement validation first
3. **ALWAYS** add error handling
4. **ALWAYS** update documentation
5. **ALWAYS** test with multiple instances

### Code Review Checklist
- [ ] Type safety maintained
- [ ] Error handling implemented
- [ ] Validation added
- [ ] Documentation updated
- [ ] Multi-instance support verified
- [ ] MCP protocol compliance checked

## Key File Interaction Standards

### Multi-File Coordination Requirements
When modifying these files, **ALWAYS** update related files:

**Workflow Types** (`src/types/workflow.ts`):
- **MUST** update validation in `src/utils/validation.ts`
- **MUST** update WorkflowBuilder in `src/services/workflowBuilder.ts`
- **MUST** update API wrapper in `src/services/n8nApiWrapper.ts`

**API Types** (`src/types/api.ts`):
- **MUST** update N8NApiWrapper in `src/services/n8nApiWrapper.ts`
- **MUST** update tool handlers in `src/index.ts`

**Configuration Types** (`src/types/config.ts`):
- **MUST** update ConfigLoader in `src/config/configLoader.ts`
- **MUST** update EnvironmentManager in `src/services/environmentManager.ts`

**Tool Definitions** (`src/index.ts`):
- **MUST** update corresponding service methods
- **MUST** update validation logic
- **MUST** update error handling

### Critical File Dependencies
```
src/index.ts
├── src/services/n8nApiWrapper.ts
├── src/services/workflowBuilder.ts
├── src/services/promptsService.ts
├── src/utils/validation.ts
└── src/types/*.ts

src/services/n8nApiWrapper.ts
├── src/services/environmentManager.ts
├── src/utils/validation.ts
└── src/types/api.ts

src/services/environmentManager.ts
├── src/config/configLoader.ts
└── src/types/config.ts
```

## AI Decision-making Standards

### Priority Decision Tree
1. **Type Safety First**: Always prioritize type safety over convenience
2. **Validation Required**: All inputs must be validated
3. **Error Handling**: Comprehensive error handling is mandatory
4. **Multi-Instance Support**: All features must support multiple instances
5. **MCP Compliance**: Must follow MCP protocol specifications

### Ambiguous Situation Resolution
- **Configuration Conflicts**: Prefer .config.json over .env
- **Connection Formats**: Prefer array format for internal processing
- **Error Messages**: Use MCP error codes over custom messages
- **Instance Selection**: Use default instance when not specified
- **Validation**: Fail fast with clear error messages

### Code Modification Guidelines
- **Adding New Tools**: Follow existing tool definition pattern in `src/index.ts`
- **Adding New Types**: Extend existing interfaces in `src/types/`
- **Adding New Services**: Follow singleton pattern for configuration services
- **Adding New Validation**: Use existing validation utilities and patterns
- **Adding New API Endpoints**: Use N8NApiWrapper abstraction

## Prohibited Actions

### ❌ Strictly Forbidden
- **NEVER** use `any` type without explicit justification
- **NEVER** bypass validation utilities
- **NEVER** create direct axios instances outside EnvironmentManager
- **NEVER** hardcode configuration values
- **NEVER** expose internal error details to clients
- **NEVER** use console.log for debug output (use logger utility)
- **NEVER** bypass MCP protocol requirements
- **NEVER** create workflows without connections
- **NEVER** ignore instance validation
- **NEVER** use generic error types

### ❌ Anti-Patterns to Avoid
- **NEVER** create duplicate validation logic
- **NEVER** hardcode API endpoints
- **NEVER** skip error handling
- **NEVER** use inconsistent naming conventions
- **NEVER** ignore type safety
- **NEVER** create circular dependencies
- **NEVER** bypass the service layer
- **NEVER** use synchronous file operations in async contexts

## Implementation Examples

### ✅ Correct Tool Definition
```typescript
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
        description: 'Array of workflow nodes to create',
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
        description: 'Array of connections between nodes',
        items: {
          type: 'object',
          properties: {
            source: { type: 'string' },
            target: { type: 'string' }
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
}
```

### ✅ Correct Error Handling
```typescript
try {
  const workflow = await this.n8nWrapper.createWorkflow(workflowInput, args.instance);
  return {
    content: [{ 
      type: 'text', 
      text: JSON.stringify(workflow, null, 2) 
    }]
  };
} catch (error: any) {
  this.log('error', 'Error creating workflow:', error);
  if (error instanceof McpError) {
    throw error;
  }
  throw new McpError(ErrorCode.InternalError, `Failed to create workflow: ${error.message}`);
}
```

### ✅ Correct Validation Usage
```typescript
if (!args.id) {
  throw new McpError(ErrorCode.InvalidParams, 'Workflow ID is required');
}

if (!Array.isArray(args.nodes) || args.nodes.length === 0) {
  throw new McpError(ErrorCode.InvalidParams, 'Workflow nodes array is required and must not be empty');
}

const validatedWorkflow = validateWorkflowSpec(workflowInput);
```

## Testing and Validation Standards

### Required Testing
- **ALWAYS** test with multiple n8n instances
- **ALWAYS** validate workflow creation and execution
- **ALWAYS** test error scenarios
- **ALWAYS** verify connection transformations
- **ALWAYS** test configuration loading

### Validation Checklist
- [ ] Type definitions are complete and accurate
- [ ] All inputs are validated
- [ ] Error handling covers all scenarios
- [ ] Multi-instance support works correctly
- [ ] MCP protocol compliance verified
- [ ] Documentation is updated
- [ ] No hardcoded values remain
- [ ] All services follow singleton pattern where appropriate

## Performance and Scalability Standards

### Performance Guidelines
- **ALWAYS** use connection pooling for API instances
- **ALWAYS** implement proper caching strategies
- **ALWAYS** validate data before processing
- **NEVER** load entire workflows when only metadata is needed
- **ALWAYS** use pagination for large datasets

### Scalability Considerations
- **ALWAYS** support multiple n8n instances
- **ALWAYS** handle concurrent requests properly
- **ALWAYS** implement proper resource cleanup
- **ALWAYS** use async/await patterns consistently
- **NEVER** block the event loop with synchronous operations

## Security Standards

### Security Requirements
- **ALWAYS** validate all inputs
- **ALWAYS** use environment variables for sensitive data
- **ALWAYS** implement proper authentication
- **NEVER** expose API keys in logs
- **ALWAYS** sanitize error messages
- **ALWAYS** use HTTPS for production deployments

### Data Protection
- **ALWAYS** encrypt sensitive configuration data
- **ALWAYS** validate API responses
- **ALWAYS** implement proper access controls
- **NEVER** store credentials in code
- **ALWAYS** use secure communication protocols
