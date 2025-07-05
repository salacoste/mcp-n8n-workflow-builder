# Multi-Instance Architecture

This document provides detailed information about the multi-instance architecture introduced in version 0.8.0 of the n8n Workflow Builder MCP Server.

## Overview

The multi-instance architecture allows you to manage multiple n8n environments (production, staging, development, etc.) from a single MCP server instance. This provides several benefits:

- **Environment isolation**: Keep production and development workflows separate
- **Centralized management**: Manage all your n8n instances from one place
- **Easy switching**: Target specific environments with a simple parameter
- **Backward compatibility**: Existing single-instance setups continue to work

## Architecture Components

### 1. ConfigLoader (`src/config/configLoader.ts`)

The ConfigLoader handles loading configuration from multiple sources:

- **Primary**: `.config.json` file for multi-instance setup
- **Fallback**: `.env` file for single-instance setup (backward compatibility)

```typescript
// Multi-instance configuration
{
  "environments": {
    "production": {
      "n8n_host": "https://n8n.example.com/api/v1/",
      "n8n_api_key": "prod_api_key"
    },
    "staging": {
      "n8n_host": "https://staging.example.com/api/v1/",
      "n8n_api_key": "staging_api_key"
    }
  },
  "defaultEnv": "staging"
}
```

### 2. EnvironmentManager (`src/services/environmentManager.ts`)

The EnvironmentManager provides:

- **API instance caching**: Reuses axios instances for performance
- **Environment validation**: Ensures requested environments exist
- **Configuration access**: Provides environment-specific configurations

Key methods:
- `getApiInstance(instanceSlug?: string)`: Returns cached or new axios instance
- `getEnvironmentConfig(instanceSlug?: string)`: Returns environment configuration
- `getAvailableEnvironments()`: Lists all configured environments

### 3. N8NApiWrapper (`src/services/n8nApiWrapper.ts`)

The N8NApiWrapper provides:

- **Unified API interface**: Single interface for all n8n operations
- **Instance routing**: Routes requests to appropriate n8n instances
- **Error handling**: Consistent error handling across instances
- **Validation**: Validates instance existence before API calls

All wrapper methods accept an optional `instanceSlug` parameter:

```typescript
// Examples
await wrapper.listWorkflows(); // Uses default environment
await wrapper.listWorkflows("production"); // Uses production environment
await wrapper.createWorkflow(data, "staging"); // Creates in staging
```

## Configuration Formats

### Multi-Instance Configuration (.config.json)

```json
{
  "environments": {
    "production": {
      "n8n_host": "https://n8n.company.com/api/v1/",
      "n8n_api_key": "n8n_prod_api_key_here"
    },
    "staging": {
      "n8n_host": "https://staging-n8n.company.com/api/v1/",
      "n8n_api_key": "n8n_staging_api_key_here"
    },
    "development": {
      "n8n_host": "http://localhost:5678/api/v1/",
      "n8n_api_key": "n8n_dev_api_key_here"
    }
  },
  "defaultEnv": "development"
}
```

### Single-Instance Configuration (.env)

```env
N8N_HOST=https://your-n8n-instance.com/api/v1/
N8N_API_KEY=your_api_key_here
```

This automatically converts to:
```json
{
  "environments": {
    "default": {
      "n8n_host": "https://your-n8n-instance.com/api/v1/",
      "n8n_api_key": "your_api_key_here"
    }
  },
  "defaultEnv": "default"
}
```

## MCP Tool Integration

All MCP tools now support an optional `instance` parameter:

### Tool Schema Updates

Every tool schema includes:
```typescript
instance: {
  type: 'string',
  description: 'Optional instance name to override automatic instance selection'
}
```

### Usage Examples

```json
// List workflows from default environment
{
  "name": "list_workflows",
  "arguments": {}
}

// List workflows from production environment
{
  "name": "list_workflows", 
  "arguments": {
    "instance": "production"
  }
}

// Create workflow in staging environment
{
  "name": "create_workflow",
  "arguments": {
    "name": "Test Workflow",
    "nodes": [...],
    "connections": [...],
    "instance": "staging"
  }
}
```

## Migration Guide

### From Single to Multi-Instance

1. **Backup your current setup**
2. **Create .config.json** with your existing configuration as the default
3. **Add additional environments** as needed
4. **Test with default environment** (should work exactly as before)
5. **Start using instance parameters** when targeting specific environments

### Migration Script Example

```bash
#!/bin/bash
# Convert .env to .config.json

source .env

cat > .config.json << EOF
{
  "environments": {
    "default": {
      "n8n_host": "$N8N_HOST",
      "n8n_api_key": "$N8N_API_KEY"
    }
  },
  "defaultEnv": "default"
}
EOF

echo "Migration complete! Add additional environments to .config.json as needed."
```

## Implementation Details

### Instance Resolution Logic

1. If `instanceSlug` is provided:
   - Validate it exists in configuration
   - Use that specific environment
2. If no `instanceSlug` provided:
   - Use the `defaultEnv` from configuration
3. If configuration fails:
   - Fall back to .env file
   - Create single "default" environment

### Error Handling

The system provides detailed error messages for common issues:

```typescript
// Instance not found
throw new Error(`Instance 'invalid' not found. Available instances: production, staging, development`);

// Configuration errors
throw new Error(`Environment 'production' is missing required fields (n8n_host, n8n_api_key)`);

// API errors with context
throw new Error(`API call failed for instance 'production': Connection refused`);
```

### Performance Optimizations

- **Axios instance caching**: Prevents recreation of HTTP clients
- **Configuration caching**: Loads configuration once and reuses
- **Lazy loading**: Only loads configurations for requested environments
- **Connection pooling**: Reuses HTTP connections across requests

## Security Considerations

### Configuration Security

- **Never commit .config.json**: Add to .gitignore
- **Environment isolation**: Each environment has separate API keys
- **Secure storage**: Store API keys in secure environment variables when possible

### Access Control

- **Instance validation**: Prevents access to non-configured instances
- **API key isolation**: Each environment uses its own credentials
- **Error message filtering**: Avoids exposing sensitive configuration details

## Testing

### Unit Tests

Test configuration loading, environment management, and API wrapper functionality:

```javascript
// Test environment manager
const envManager = EnvironmentManager.getInstance();
const environments = envManager.getAvailableEnvironments();
const config = envManager.getEnvironmentConfig('production');

// Test API wrapper
const wrapper = new N8NApiWrapper();
const workflows = await wrapper.listWorkflows('staging');
```

### Integration Tests

Test actual API calls to different environments:

```javascript
// Test multi-instance workflow creation
const prodWorkflow = await wrapper.createWorkflow(workflowData, 'production');
const stagingWorkflow = await wrapper.createWorkflow(workflowData, 'staging');
```

## Troubleshooting

### Common Issues

1. **Instance not found**: Check spelling in .config.json
2. **Configuration errors**: Validate JSON syntax
3. **API connection failures**: Verify host URLs and API keys
4. **Default environment not working**: Check defaultEnv setting

### Debug Mode

Enable debug logging to see instance resolution:

```bash
DEBUG=true npm start
```

This shows:
- Which configuration file is loaded
- Environment resolution process
- API instance creation and caching
- Request routing to specific instances

## Future Enhancements

Planned improvements for future versions:

- **Configuration hot-reloading**: Update configuration without restart
- **Health monitoring**: Monitor all configured instances
- **Load balancing**: Distribute requests across multiple instances
- **Configuration validation**: Enhanced validation and error reporting
- **Environment templates**: Quick setup for common configurations