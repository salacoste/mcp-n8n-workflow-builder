# MCP N8N Workflow Builder - AI Agent Guidelines

## Project Overview

**Project Name**: MCP N8N Workflow Builder  
**Purpose**: MCP (Model Context Protocol) server for managing n8n workflows through Claude AI and Cursor IDE  
**Technology Stack**: TypeScript, Node.js, Express, Axios, MCP SDK  
**Repository**: https://github.com/salacoste/mcp-n8n-workflow-builder

## Core Functionality

### Primary Capabilities
- **Workflow Management**: Complete CRUD operations for n8n workflows
- **Execution Control**: Execute, monitor, and manage workflow executions
- **Multi-Instance Support**: Manage multiple n8n instances simultaneously
- **Template System**: Generate workflows from predefined templates
- **Tag Management**: Organize workflows with tagging system

### MCP Tools Available
- `list_workflows` - List all workflows with metadata
- `create_workflow` - Create new workflows with nodes and connections
- `get_workflow` - Retrieve specific workflow details
- `update_workflow` - Modify existing workflows
- `delete_workflow` - Remove workflows
- `activate_workflow` / `deactivate_workflow` - Control workflow status
- `execute_workflow` - Manually trigger workflow execution
- `list_executions` - View execution history
- `get_execution` - Retrieve execution details
- `delete_execution` - Remove execution records
- `create_tag` / `get_tags` / `update_tag` / `delete_tag` - Tag management

## Development Standards

### Code Quality Requirements
- **Type Safety**: Strict TypeScript with comprehensive type definitions
- **Validation**: All inputs must be validated using provided utilities
- **Error Handling**: Use MCP ErrorCode enum for consistent error responses
- **Multi-Instance**: All features must support multiple n8n instances
- **Documentation**: Maintain comprehensive documentation and examples

### Architecture Patterns
- **Service Layer**: Use N8NApiWrapper for all API interactions
- **Configuration**: Use EnvironmentManager for instance management
- **Validation**: Use validateWorkflowSpec() for workflow validation
- **Logging**: Use logger utility for consistent logging
- **Error Handling**: Use handleApiError() for API error management

### File Structure Guidelines
```
src/
├── config/          # Configuration management
│   ├── configLoader.ts
│   └── constants.ts
├── services/        # Core business logic
│   ├── n8nApi.ts
│   ├── n8nApiWrapper.ts
│   ├── workflowBuilder.ts
│   ├── promptsService.ts
│   └── environmentManager.ts
├── types/           # TypeScript definitions
│   ├── api.ts
│   ├── config.ts
│   ├── execution.ts
│   ├── node.ts
│   ├── prompts.ts
│   ├── tag.ts
│   └── workflow.ts
├── utils/           # Utility functions
│   ├── logger.ts
│   ├── positioning.ts
│   └── validation.ts
└── index.ts         # Main entry point
```

## AI Agent Responsibilities

### When Working on This Project
1. **ALWAYS** follow the shrimp-rules.md development standards
2. **ALWAYS** validate all inputs before processing
3. **ALWAYS** use proper error handling with MCP error codes
4. **ALWAYS** support multi-instance configurations
5. **ALWAYS** maintain type safety and use existing interfaces
6. **NEVER** bypass validation utilities
7. **NEVER** create direct API calls outside the wrapper
8. **NEVER** hardcode configuration values

### Common Tasks and Patterns
- **Adding New Tools**: Follow the tool definition pattern in src/index.ts
- **Adding New Types**: Extend existing interfaces in src/types/
- **Adding New Services**: Follow singleton pattern for configuration services
- **Adding New Validation**: Use existing validation utilities and patterns
- **Adding New API Endpoints**: Use N8NApiWrapper abstraction

### Testing Requirements
- Test with multiple n8n instances
- Validate workflow creation and execution
- Test error scenarios and edge cases
- Verify connection transformations
- Test configuration loading and validation

## Configuration Management

### Environment Setup
- **Primary**: .config.json for multi-instance configuration
- **Fallback**: .env for single-instance setup
- **Validation**: All configurations must be validated
- **Security**: API keys must be properly secured

### Instance Management
- **Default Instance**: Automatically selected if not specified
- **Instance Validation**: Verify instance exists before API calls
- **Configuration Loading**: Use ConfigLoader singleton
- **API Instance Caching**: Managed by EnvironmentManager

## Integration Guidelines

### MCP Protocol Compliance
- **Transport**: Support both stdio and HTTP transports
- **Error Codes**: Use MCP ErrorCode enum consistently
- **Request/Response**: Follow MCP protocol specifications
- **Resources**: Implement proper resource handling
- **Prompts**: Support template-based workflow generation

### n8n API Integration
- **Authentication**: Use API key authentication
- **Endpoints**: Follow n8n REST API specifications
- **Data Formats**: Handle both array and object connection formats
- **Error Handling**: Proper HTTP status code handling
- **Rate Limiting**: Respect API rate limits

## Quality Assurance

### Code Review Checklist
- [ ] Type safety maintained
- [ ] Error handling implemented
- [ ] Validation added
- [ ] Documentation updated
- [ ] Multi-instance support verified
- [ ] MCP protocol compliance checked
- [ ] No hardcoded values remain
- [ ] All services follow singleton pattern where appropriate

### Performance Considerations
- Use connection pooling for API instances
- Implement proper caching strategies
- Validate data before processing
- Use pagination for large datasets
- Handle concurrent requests properly

## Security Standards

### Data Protection
- Validate all inputs
- Use environment variables for sensitive data
- Implement proper authentication
- Never expose API keys in logs
- Sanitize error messages
- Use HTTPS for production deployments

### Access Control
- Validate API responses
- Implement proper access controls
- Never store credentials in code
- Use secure communication protocols
- Encrypt sensitive configuration data

## Troubleshooting

### Common Issues
- **Connection Format Errors**: Use transformConnectionsToArray() utility
- **Instance Not Found**: Verify instance exists in configuration
- **Validation Failures**: Check input data against type definitions
- **API Errors**: Use handleApiError() for consistent error handling
- **Configuration Issues**: Verify .config.json or .env format

### Debug Mode
- Set DEBUG=true environment variable
- Logs output to stderr to avoid MCP protocol interference
- Provides detailed API request/response information
- Shows configuration loading details
- Displays validation and transformation steps

## Resources

### Documentation
- [shrimp-rules.md](./shrimp-rules.md) - Comprehensive development standards
- [README.md](./README.md) - Project overview and setup instructions
- [docs/](./docs/) - Additional documentation and examples
- [examples/](./examples/) - Usage examples and templates

### Key Files
- `src/index.ts` - Main MCP server implementation
- `src/services/n8nApiWrapper.ts` - API abstraction layer
- `src/utils/validation.ts` - Validation utilities
- `src/types/workflow.ts` - Workflow type definitions
- `.config.json.example` - Configuration template

### External References
- [n8n REST API Documentation](https://docs.n8n.io/api/)
- [MCP Protocol Specification](https://modelcontextprotocol.io/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
