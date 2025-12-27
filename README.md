
# n8n Workflow Builder MCP Server

This project provides an MCP (Model Context Protocol) server for managing n8n workflows. It allows you to create, update, delete, activate, and deactivate workflows through a set of tools available in Claude AI and Cursor IDE.


![image](https://github.com/user-attachments/assets/6849a1de-6048-474d-8477-5f3fdb854196)


***PLEASE, be aware if you dont limit permissions for actions of MCP, it could remove your workflow***

**Key Features:**
- Full integration with Claude AI and Cursor IDE via MCP protocol
- **Multi-instance support** - Manage multiple n8n environments (production, staging, development)
- Create and manage n8n workflows via natural language
- Predefined workflow templates through prompts system
- Interactive workflow building with real-time feedback
- Backward compatible with existing single-instance setups

![image](https://github.com/user-attachments/assets/e25e86ea-882e-47c4-b822-99f56d1e7f99)


## Requirements

- Node.js (v14+ recommended)
- npm
- n8n instance with API access (tested and compatible with n8n version 1.82.3)
- Claude App or Cursor IDE for AI interaction

## Installation Guide

### 1. Install from npm (Recommended)

You can install the package directly from npm:

```bash
# Install globally
npm install -g @kernel.salacoste/n8n-workflow-builder

# Or as a local dependency
npm install @kernel.salacoste/n8n-workflow-builder
```

After installation, you need to configure the environment variables (see step 3).

### 2. Clone the Repository

Alternatively, you can clone the repository from GitHub:

```bash
git clone https://github.com/salacoste/mcp-n8n-workflow-builder.git
```

Then navigate to the project directory:

```bash
cd mcp-n8n-workflow-builder
```

### 3. Install Dependencies

Install the necessary dependencies using npm:

```bash
npm install
```

### 4. Configure Environment Variables

You have two options for configuration:

#### Option A: Multi-Instance Configuration (Recommended)

Create a `.config.json` file in the project root for managing multiple n8n environments:

```json
{
  "environments": {
    "production": {
      "n8n_host": "https://n8n.example.com",
      "n8n_api_key": "n8n_api_key_for_production"
    },
    "staging": {
      "n8n_host": "https://staging-n8n.example.com",
      "n8n_api_key": "n8n_api_key_for_staging"
    },
    "development": {
      "n8n_host": "http://localhost:5678",
      "n8n_api_key": "n8n_api_key_for_development"
    }
  },
  "defaultEnv": "development"
}
```

#### Option B: Single-Instance Configuration (Legacy)

Create an `.env` file in the project root with the following variables:

```
N8N_HOST=https://your-n8n-instance.com
N8N_API_KEY=your_api_key_here
```

**Note:** The system automatically falls back to `.env` configuration if no `.config.json` is found, ensuring backward compatibility.

## Configuration Best Practices

### Correct URL Format

The n8n MCP server automatically appends `/api/v1` to your configured base URL. **Always provide the base URL without `/api/v1`**:

**✅ Correct Examples:**

```json
{
  "n8n_host": "https://n8n.example.com",
  "n8n_api_key": "your_api_key"
}
```

```json
{
  "n8n_host": "http://localhost:5678",
  "n8n_api_key": "your_api_key"
}
```

```json
{
  "n8n_host": "https://your-instance.app.n8n.cloud",
  "n8n_api_key": "your_api_key"
}
```

**❌ Incorrect Examples (will cause duplicate paths):**

```json
{
  "n8n_host": "https://n8n.example.com/api/v1/",  // ❌ Don't include /api/v1
  "n8n_api_key": "your_api_key"
}
```

### Why This Matters

The server constructs the full API URL by appending `/api/v1` to your base URL:

```
Base URL: https://n8n.example.com
Final URL: https://n8n.example.com/api/v1/workflows  ✅

Base URL: https://n8n.example.com/api/v1/
Final URL: https://n8n.example.com/api/v1/api/v1/workflows  ❌
```

### Backward Compatibility

**Note for Existing Users:** If you have an existing configuration with `/api/v1` in the URL, it will continue to work. The server automatically detects and removes duplicate `/api/v1` paths. However, we recommend updating to the correct format for clarity.

### Official n8n API Documentation

For more information about n8n API endpoints and URL structure, refer to:
- [n8n API Documentation](https://docs.n8n.io/api/)
- [n8n REST API Reference](https://docs.n8n.io/api/api-reference/)

## Migrating from Old URL Configuration Format

If you have an existing configuration that includes `/api/v1` in the URL, you have two options:

### Option 1: Continue Using Current Configuration (Recommended for Quick Start)

Your existing configuration will continue to work due to backward compatibility:

```json
{
  "n8n_host": "https://n8n.example.com/api/v1/",  // Still works!
  "n8n_api_key": "your_api_key"
}
```

The server automatically normalizes the URL internally.

### Option 2: Update to New Format (Recommended for Clarity)

Update your configuration to match the official n8n API documentation:

**Before:**
```json
{
  "environments": {
    "production": {
      "n8n_host": "https://n8n.example.com/api/v1/",
      "n8n_api_key": "your_api_key"
    }
  }
}
```

**After:**
```json
{
  "environments": {
    "production": {
      "n8n_host": "https://n8n.example.com",
      "n8n_api_key": "your_api_key"
    }
  }
}
```

**Steps:**
1. Open your `.config.json` or `.env` file
2. Remove `/api/v1` and any trailing slashes from `n8n_host` values
3. Save the file
4. Restart the MCP server

No code changes or additional configuration needed!

### 5. Build and Run

If you installed via npm globally, you can run the server using the command:

```bash
n8n-workflow-builder
```

Or with JSON-RPC mode:

```bash
n8n-workflow-builder --json-rpc
```

If you cloned the repository or installed as a local dependency, use the following commands:

- **Build the project:**
  
  ```bash
  npm run build
  ```

- **Start the MCP Server in standalone mode:**
  
  ```bash
  npm start
  ```

- **Start with JSON-RPC mode for testing:**
  
  ```bash
  npm run start -- --json-rpc
  ```

The server will start and accept requests via stdio or JSON-RPC depending on the mode.

### 6. Claude App Integration

For integration with Claude App, you need to create a configuration file `cline_mcp_settings.json`. You can copy the example from `cline_mcp_settings.example.json` and edit it:

```bash
cp cline_mcp_settings.example.json cline_mcp_settings.json
```

Then edit the file, providing the correct environment variable values:

```json
{
  "n8n-workflow-builder": {
    "command": "node",
    "args": ["path/to/your/project/build/index.js"],
    "env": {
      "N8N_HOST": "https://your-n8n-instance.com/api/v1/",
      "N8N_API_KEY": "your_api_key_here",
      "MCP_PORT": "58921"
    },
    "disabled": false,
    "alwaysAllow": [
      "list_workflows",
      "get_workflow",
      "list_executions",
      "get_execution"
    ],
    "autoApprove": [
      "create_workflow",
      "update_workflow",
      "activate_workflow",
      "deactivate_workflow",
      "delete_workflow",
      "delete_execution"
    ]
  }
}
```

**Important Notes:**
- The `MCP_PORT` parameter is optional but recommended to avoid port conflicts
- Use a non-standard high port (like 58921) if you encounter conflicts
- Starting with version 0.7.2, the server gracefully handles port conflicts
- Do not add `cline_mcp_settings.json` to the repository as it contains your personal access credentials

## Available Tools and Features

### MCP Tools

The following **17 tools** are available through the MCP protocol:

#### Workflow Management (8 tools)
- **list_workflows**: Displays a streamlined list of workflows with essential metadata only (ID, name, status, dates, node count, tags). Optimized for performance to prevent large data transfers.
- **create_workflow**: Creates a new workflow in n8n.
- **get_workflow**: Gets complete workflow details by its ID (includes nodes and connections).
- **update_workflow**: Updates an existing workflow.
- **delete_workflow**: Deletes a workflow by its ID.
- **activate_workflow**: Activates a workflow by its ID.
- **deactivate_workflow**: Deactivates a workflow by its ID.
- **execute_workflow**: Provides guidance for workflow execution (manual trigger workflows must be executed through n8n UI).

#### Execution Management (4 tools)
- **list_executions**: Displays a list of all workflow executions with filtering capabilities.
- **get_execution**: Gets details of a specific execution by its ID.
- **delete_execution**: Deletes an execution record by its ID.
- **retry_execution**: Retries a failed workflow execution by its ID (creates new execution as retry of original).

#### Tag Management (5 tools)
- **create_tag**: Creates a new tag.
- **get_tags**: Gets a list of all tags.
- **get_tag**: Gets tag details by its ID.
- **update_tag**: Updates an existing tag.
- **delete_tag**: Deletes a tag by its ID.

#### Credential Management (6 tools)
- **list_credentials**: Provides security guidance (n8n blocks credential listing for security - use UI instead).
- **get_credential**: Provides security guidance and alternatives (n8n blocks credential reading for security).
- **create_credential**: Creates new credentials for external service authentication (supports httpBasicAuth, OAuth2, etc.).
- **update_credential**: Provides immutability guidance and DELETE + CREATE workaround pattern.
- **delete_credential**: Deletes a credential by its ID permanently.
- **get_credential_schema**: Gets JSON schema for credential types to understand required fields before creation.

### Multi-Instance Support

**New in v0.8.0**: All MCP tools now support an optional `instance` parameter to specify which n8n environment to target:

```json
{
  "name": "list_workflows",
  "arguments": {
    "instance": "production"
  }
}
```

- If no `instance` parameter is provided, the default environment is used
- Available instances are defined in your `.config.json` file
- For single-instance setups (using `.env`), the instance parameter is ignored

## 🎯 n8n REST API Coverage

MCP сервер n8n-workflow-builder обеспечивает **83% покрытие** официального n8n REST API v1.

### Поддерживаемые категории API

| Категория | Методов | Реализовано | Покрытие |
|-----------|---------|-------------|----------|
| **Workflows** | 8 | 6 полностью, 2 частично | 75% |
| **Executions** | 4 | 4 полностью | **100%** ✅ |
| **Credentials** | 6 | 4 полностью, 2 частично | 67% |
| **Tags** | 5 | 5 полностью | **100%** ✅ |
| **ИТОГО** | **23** | **19** полностью, **4** частично | **83%** |

### Статус реализации

#### ✅ Полностью реализовано (19 методов)

**Workflows (6):**
- `list_workflows` - Список workflows с метаданными
- `get_workflow` - Получение workflow по ID
- `create_workflow` - Создание нового workflow
- `update_workflow` - Полное обновление workflow
- `patch_workflow` - Частичное обновление workflow
- `delete_workflow` - Удаление workflow

**Executions (4):**
- `list_executions` - Список выполнений с фильтрами
- `get_execution` - Получение execution по ID
- `delete_execution` - Удаление execution
- `retry_execution` - Повтор failed execution

**Credentials (4):**
- `list_credentials` - Список credentials (только метаданные)
- `create_credential` - Создание credential
- `delete_credential` - Удаление credential
- `get_credential_schema` - Получение JSON schema для типа credential

**Tags (5):**
- `get_tags` - Список всех tags
- `get_tag` - Получение tag по ID
- `create_tag` - Создание нового tag
- `update_tag` - Обновление tag
- `delete_tag` - Удаление tag

#### ⚠️ Частично реализовано (4 метода)

**Workflows (2):**
- `activate_workflow` - ⚠️ n8n API v2.0.3 не поддерживает программную активацию
  - **Альтернатива:** Активация через n8n web UI
- `deactivate_workflow` - ⚠️ n8n API v2.0.3 не поддерживает программную деактивацию
  - **Альтернатива:** Деактивация через n8n web UI

**Credentials (2):**
- `get_credential` - ⚠️ n8n блокирует по соображениям безопасности
  - **Альтернатива:** Использовать `list_credentials` для метаданных
- `update_credential` - ⚠️ Immutability pattern для защиты секретов
  - **Альтернатива:** DELETE + CREATE pattern

> **Примечание:** Все частично реализованные методы возвращают информативные guidance сообщения с объяснением ограничений и альтернативными решениями.

### 📊 Детальная документация

Для детального анализа покрытия API см.:
- [API Coverage Analysis](./docs/API-COVERAGE-ANALYSIS.md) - Детальный анализ всех методов
- [API Methods Checklist](./docs/API-METHODS-CHECKLIST.md) - Быстрый справочник
- [API Coverage Visual](./docs/API-COVERAGE-VISUAL.md) - Визуальная сводка с диаграммами
- [n8n API Documentation](./docs/n8n-api-docs/) - Локальная документация n8n API

All tools have been tested and optimized for n8n version 1.82.3. The node types and API structures used are compatible with this version.

### Important Note About Workflow Triggers

When working with n8n version 1.82.3, please note the following important requirements:

- **Trigger nodes are required for activation**: n8n requires at least one valid trigger node to successfully activate a workflow.
- **Valid trigger node types** include:
  - `scheduleTrigger` (recommended for automation)
  - `webhook` (for HTTP-triggered workflows)
  - Service-specific trigger nodes
- **Automatic trigger addition**: The `activate_workflow` tool automatically adds a `scheduleTrigger` node when no trigger is detected
- **Manual trigger limitation**: The `manualTrigger` node type is NOT recognized as a valid trigger by n8n API v1.82

The `activate_workflow` tool implements intelligent detection of trigger nodes and adds necessary attributes to ensure compatibility with the n8n API.

### Known Limitations and API Issues

During testing with n8n version 1.82.3, we've identified several API limitations that users should be aware of:

#### Trigger Node Activation Issue

The n8n API enforces strict requirements for workflow activation that aren't clearly documented:

```
Status: 400
Error: Workflow has no node to start the workflow - at least one trigger, poller or webhook node is required
```

**Impact**:
- Workflows without a recognized trigger node cannot be activated via API
- The `manualTrigger` node is NOT recognized as a valid trigger despite being usable in the UI
- Even adding attributes like `group: ['trigger']` to `manualTrigger` does not solve the issue

**Our solution**:
- The `activate_workflow` function automatically detects missing trigger nodes
- Adds a properly configured `scheduleTrigger` when needed
- Preserves all your existing nodes and connections

#### Tag Management Conflicts

When updating tags that already exist, the API returns a **409 Conflict Error**:

```
Status: 409
Error: Tag with this name already exists
```

**Impact**:
- Tag updates may fail if a tag with the requested name already exists
- This happens even when updating a tag to the same name

**Our solution**:
- The test script now implements UUID generation for tag names
- Performs cleanup of existing tags before testing
- Implements proper error handling for tag conflicts

#### Execution Limitations

The execution API has limitations with certain trigger types:

- **Webhook triggers**: Return 404 errors when executed via API (expected behavior)
- **Manual triggers**: Cannot be properly executed through the API in version 1.82.3
- **Schedule triggers**: Can be activated but may not execute immediately

**Recommendation**:
For workflows that need to be executed via API, use the `scheduleTrigger` with your desired interval settings.

### MCP Resources

The server provides the following resources for more efficient context access:

#### Static Resources
- **/workflows**: List of all available workflows in the n8n instance
- **/execution-stats**: Summary statistics about workflow executions

#### Dynamic Resource Templates
- **/workflows/{id}**: Detailed information about a specific workflow
- **/executions/{id}**: Detailed information about a specific execution

### MCP Prompts

The server offers predefined workflow templates through the prompts system:

#### Available Prompts
- **Schedule Triggered Workflow**: Create a workflow that runs on a schedule
- **HTTP Webhook Workflow**: Create a workflow that responds to HTTP webhook requests
- **Data Transformation Workflow**: Create a workflow for processing and transforming data
- **External Service Integration Workflow**: Create a workflow that integrates with external services
- **API Data Polling Workflow**: Create a workflow that polls an API and processes data with filtering

Each prompt has variables that can be customized when generating a workflow, such as workflow name, schedule expression, webhook path, and more.

## Migration from Single to Multi-Instance

If you're currently using a single-instance setup with `.env` and want to migrate to multi-instance:

1. **Create .config.json** with your existing configuration:
   ```json
   {
     "environments": {
       "default": {
         "n8n_host": "https://your-existing-n8n.com",
         "n8n_api_key": "your_existing_api_key"
       }
     },
     "defaultEnv": "default"
   }
   ```

2. **Add additional environments** as needed:
   ```json
   {
     "environments": {
       "default": {
         "n8n_host": "https://your-existing-n8n.com",
         "n8n_api_key": "your_existing_api_key"
       },
       "staging": {
         "n8n_host": "https://staging-n8n.com",
         "n8n_api_key": "staging_api_key"
       }
     },
     "defaultEnv": "default"
   }
   ```

3. **Keep your .env file** for backward compatibility (optional)

4. **Start using instance parameters** in your MCP calls when needed

## Usage Examples

### Basic Multi-Instance Usage

```javascript
// List workflows from default environment
await listWorkflows();

// List workflows from specific environment  
await listWorkflows("production");

// Create workflow in staging environment
await createWorkflow(workflowData, "staging");
```

### Credential Management Examples

The server provides comprehensive credential lifecycle management with a schema-driven approach:

#### Schema-Driven Credential Creation

```javascript
// Step 1: Get schema to understand required fields
const schema = await getCredentialSchema("httpBasicAuth");
// Returns: { type: "object", properties: { user: {...}, password: {...} } }

// Step 2: Create credential with validated data
const credential = await createCredential({
  name: "My API Credential",
  type: "httpBasicAuth",
  data: {
    user: "myusername",
    password: "mypassword"
  }
});
// Returns: { id: "cred-id", name: "My API Credential", type: "httpBasicAuth", ... }
```

#### Complete Credential Lifecycle

```javascript
// 1. Discover credential types and requirements
const schema = await getCredentialSchema("httpHeaderAuth");

// 2. Create new credential
const cred = await createCredential({
  name: "Production API Key",
  type: "httpHeaderAuth",
  data: {
    name: "X-API-Key",
    value: "prod-key-12345"
  }
});

// 3. Use in workflows (credentials appear automatically in node dropdowns)

// 4. Update credential (using DELETE + CREATE pattern for immutability)
await deleteCredential(cred.id);
const updatedCred = await createCredential({
  name: "Production API Key",
  type: "httpHeaderAuth",
  data: {
    name: "X-API-Key",
    value: "new-key-67890"
  }
});

// 5. Clean up when no longer needed
await deleteCredential(updatedCred.id);
```

#### Multi-Instance Credential Management

```javascript
// Create credentials in different environments
const prodCred = await createCredential({
  name: "Production OAuth",
  type: "oAuth2Api",
  data: { /* OAuth2 configuration */ }
}, "production");

const stagingCred = await createCredential({
  name: "Staging OAuth",
  type: "oAuth2Api",
  data: { /* OAuth2 configuration */ }
}, "staging");
```

**Note on Security:**
- `list_credentials` and `get_credential` are blocked by n8n for security (returns informative guidance)
- Use n8n web interface to view existing credentials
- Credentials are automatically encrypted by n8n when created

### Claude AI Examples

You can now specify which n8n instance to target in your Claude conversations:

- "List all workflows from the production environment"
- "Create a new workflow in the staging instance"
- "Show me executions from the development n8n"

In the `examples` directory, you'll find examples and instructions for setting up and using n8n Workflow Builder with Claude App:

1. **setup_with_claude.md** - Step-by-step instructions for setting up integration with Claude App
2. **workflow_examples.md** - Simple query examples for working with n8n workflows
3. **complex_workflow.md** - Examples of creating and updating complex workflows
4. **using_prompts.md** - Guide to using the prompts feature for quick workflow creation

## Testing the Server

You can use the provided test scripts to verify the functionality:

### Using test-mcp-tools.js

The `test-mcp-tools.js` script provides comprehensive testing of all MCP tools against your n8n instance. This is the recommended way to validate your setup and ensure all functionality works correctly.

```bash
# Run all tests
node test-mcp-tools.js
```

The script performs the following tests:
1. Health check and tools availability
2. Workflow management (create, read, update, activate)
3. Tag management (create, read, update, delete)
4. Execution management (execute, list, get, delete)

The test script creates temporary test workflows and tags which are automatically cleaned up after testing. You can customize the test behavior by modifying the test configuration variables at the top of the script.

```javascript
// Configuration options in test-mcp-tools.js
const config = {
  mcpServerUrl: 'http://localhost:3456/mcp',
  healthCheckUrl: 'http://localhost:3456/health',
  testWorkflowName: 'Test Workflow MCP',
  // ... other options
};

// Test flags to enable/disable specific test suites
const testFlags = {
  runWorkflowTests: true,
  runTagTests: true, 
  runExecutionTests: true,
  runCleanup: true
};
```

### Additional Test Scripts

```bash
# Test basic functionality with Claude
node test-claude.js

# Test prompts functionality
node test-prompts.js

# Test workflow creation and management
node test-workflow.js
```

## Troubleshooting

- Make sure you are using npm.
- If you encounter problems, try cleaning the build directory and rebuilding the project:
  ```bash
  npm run clean && npm run build
  ```
- Check that your environment variables in `.env` and `cline_mcp_settings.json` are set correctly.
- If you have problems with Claude integration, check the location of the `cline_mcp_settings.json` file.
- For debugging, run with the `--json-rpc` flag and use curl to send test requests to port 3000.

### Common Errors and Solutions

#### URL Configuration Issues

**Symptom:** API calls fail with 404 errors or "not found" messages

**Possible Cause:** Incorrect URL format causing duplicate `/api/v1` paths

**Solution:**

1. **Check your configuration file** (`.config.json` or `.env`)

   Ensure your `n8n_host` does NOT include `/api/v1`:

   ```json
   {
     "n8n_host": "https://n8n.example.com"  // ✅ Correct
   }
   ```

   NOT:

   ```json
   {
     "n8n_host": "https://n8n.example.com/api/v1/"  // ❌ Will be auto-normalized
   }
   ```

2. **Enable debug logging** to see URL construction:

   ```bash
   DEBUG=true npm start
   ```

   Look for lines like:
   ```
   [EnvironmentManager] Original URL: https://n8n.example.com/api/v1/
   [EnvironmentManager] Normalized baseURL: https://n8n.example.com/api/v1
   ```

3. **Verify n8n instance is accessible:**

   ```bash
   curl https://your-n8n-host/api/v1/workflows \
     -H "X-N8N-API-KEY: your_api_key"
   ```

4. **Check trailing slashes:**

   Both of these are acceptable and will be normalized:
   - `https://n8n.example.com` ✅
   - `https://n8n.example.com/` ✅

#### Port Already in Use (EADDRINUSE)

If you see the following error in logs:
```
Error: listen EADDRINUSE: address already in use :::3456
```

This means that port 3456 (default for the MCP server) is already in use by another process. To fix:

**Option 1: Use a Different Port with Environment Variable**

Starting from version 0.7.2, you can specify a custom port using the `MCP_PORT` environment variable:

```bash
# In your code
MCP_PORT=58921 npm start

# Or when running directly
MCP_PORT=58921 node build/index.js
```

If using Claude Desktop, update your `cline_mcp_settings.json` to include the new port:
```json
{
  "n8n-workflow-builder": {
    "command": "node",
    "args": ["path/to/your/project/build/index.js"],
    "env": {
      "N8N_HOST": "https://your-n8n-instance.com/api/v1/",
      "N8N_API_KEY": "your_api_key_here",
      "MCP_PORT": "58921"
    },
    // ...
  }
}
```

**Option 2: Find and kill the process using the port**
```bash
# On macOS/Linux
lsof -i :3456
kill -9 <PID>

# On Windows
netstat -ano | findstr :3456
taskkill /PID <PID> /F
```

**Note on Version 0.7.2+:** Starting with version 0.7.2, the server includes improved handling for port conflicts, automatically detecting when a port is already in use and gracefully continuing operation without throwing errors. This is especially helpful when Claude Desktop attempts to start multiple instances of the same server.

### Running Multiple Server Instances

If you need to run multiple instances of the n8n workflow builder server (for example, for different n8n installations), you can do this by configuring separate ports:

1. **Configure different ports for each instance**:
   ```bash
   # First instance
   MCP_PORT=58921 node build/index.js
   
   # Second instance
   MCP_PORT=58922 node build/index.js
   ```

2. **Create separate Claude Desktop configurations**:
   For each instance, create a separate entry in your `claude_desktop_config.json` file:
   
   ```json
   {
     "mcpServers": {
       "n8n-workflow-builder-prod": {
         "command": "node",
         "args": ["path/to/build/index.js"],
         "env": {
           "N8N_HOST": "https://production-n8n.example.com",
           "N8N_API_KEY": "your_prod_api_key",
           "MCP_PORT": "58921"
         }
       },
       "n8n-workflow-builder-dev": {
         "command": "node",
         "args": ["path/to/build/index.js"],
         "env": {
           "N8N_HOST": "https://dev-n8n.example.com",
           "N8N_API_KEY": "your_dev_api_key",
           "MCP_PORT": "58922"
         }
       }
     }
   }
   ```

3. **Access each instance in Claude**:
   After restarting Claude Desktop, you'll see both servers available in your tools list.

#### Authentication Errors

If you see errors related to API authentication:
```
Error: Request failed with status code 401
```

Check that:
1. Your API key is correct and hasn't expired
2. The N8N_API_KEY in your `.env` file matches your n8n instance
3. Your n8n instance has API access enabled

#### Set Node Parameter Error

If you encounter the error `node.parameters.values.map is not a function` when creating workflows:

This usually happens when creating workflows with Set nodes that use the newer n8n parameter structure. Version 0.7.2+ includes a fix that supports both the legacy array format and the newer object-based format for Set node parameters.

## Version Compatibility

This MCP server has been specifically tested and validated with:
- **n8n version**: 1.82.3
- **Node.js**: v14 and above
- **MCP Protocol**: Latest version compatible with Claude and Cursor

If you're using a different version of n8n, some API endpoints or node types may differ. Please report any compatibility issues in the GitHub repository.

[![Verified on MseeP](https://mseep.ai/badge.svg)](https://mseep.ai/app/01934c6d-aff1-497b-9e11-b21a9d207667)


## Changelog

### 0.9.1 (Current)

**🐛 Bug Fixes:**
- **URL Configuration Normalization** - Fixed URL path duplication issue where user configurations containing `/api/v1` resulted in duplicate path segments (`/api/v1/api/v1/`)
  - Server now intelligently detects and normalizes URLs regardless of format
  - Maintains full backward compatibility with existing configurations
  - Thanks to user bug report: "The Host URL should not be appended with /api/v1 as the URL Builder will append that automatically"

**📚 Documentation:**
- **Configuration Best Practices** - Added comprehensive guide on correct URL format
- **Updated All Examples** - Corrected all configuration examples to match official n8n API documentation
- **Migration Guide** - Added guidance for users with existing configurations
- **Troubleshooting** - Enhanced troubleshooting section with URL configuration issues
- All examples now align with official n8n API documentation format

**✨ Features:**
- **Smart URL Detection** - Automatic normalization of user-provided URLs for maximum compatibility
- **Enhanced Debug Logging** - Shows both original and normalized URLs when `DEBUG=true`

**🔧 Technical Changes:**
- Updated `src/services/environmentManager.ts` to include URL normalization logic
- Added inline documentation explaining normalization process
- Improved error handling transparency
- Added comprehensive unit test suite (22+ test cases)
- Singleton caching pattern optimization

### 0.9.0
- **🎯 MCP Protocol Compliance** - Full support for MCP notification handlers
- **✅ Fixed critical bug** - Resolved "Method 'notifications/initialized' not found" error that prevented VS Code and other MCP clients from connecting
- **🔔 Notification Support** - Implemented proper handling for:
  - `notifications/initialized` - Client initialization notifications
  - `notifications/cancelled` - Operation cancellation notifications
  - `notifications/progress` - Progress update notifications
- **📡 JSON-RPC 2.0 Compliance** - Proper distinction between notifications (no `id` field) and requests (with `id` field)
- **📤 HTTP Response Handling** - Return `204 No Content` for notifications and `200 OK` with JSON for requests
- **✨ Backward Compatibility** - Zero breaking changes, all existing functionality preserved (14/14 core tests passed)
- **📦 Package Optimization** - Added `.npmignore` to reduce package size from 1.3MB to 278KB
- **🧪 Comprehensive Testing** - Added test suite with 18 integration tests covering all MCP functionality
- **📚 Enhanced Documentation** - Added bug reporting section and detailed fix documentation

### 0.8.0
- **🎉 Multi-instance support** - Manage multiple n8n environments (production, staging, development)
- Added `.config.json` configuration format for multiple n8n instances
- All MCP tools now support optional `instance` parameter for environment targeting
- Created N8NApiWrapper with centralized instance management
- Added EnvironmentManager for API instance caching and configuration loading
- Enhanced ConfigLoader with fallback support (.config.json → .env)
- Maintained full backward compatibility with existing .env setups
- Updated all tool schemas and handlers for multi-instance architecture
- **🚀 Performance optimization** - `list_workflows` now returns streamlined metadata instead of full workflow JSON, preventing large data transfers that could crash Claude Desktop
- Added comprehensive testing for multi-instance functionality

### 0.7.2
- Fixed validation error when handling Set node parameters in workflow creation
- Added improved error handling for port conflicts
- Enhanced server startup reliability with multiple running instances
- Fixed `node.parameters.values.map is not a function` error for modern n8n node structure
- Added MCP_PORT environment variable support for custom port configuration

### 0.7.1
- Added detailed documentation about n8n API limitations and known issues
- Enhanced troubleshooting section with specific error codes and solutions
- Added comprehensive explanation of trigger node requirements
- Improved UUID generation for tag management to prevent conflicts
- Updated testing documentation with detailed examples

### Version 0.7.0
- Enhanced trigger node detection and compatibility with n8n 1.82.3
- Improved handling of workflow activation when no trigger node exists
- Added proper handling of different trigger node types (schedule, webhook)
- Fixed tag management with proper conflict handling and UUID generation
- Updated documentation with trigger node requirements and compatibility notes
- Improved test-mcp-tools.js with enhanced workflow testing and error handling

### Version 0.6.1
- Fixed NPM package configuration
- Excluded test scripts and sensitive files from NPM package

### Version 0.6.0
- Added **execute_workflow** tool to manually run workflows by ID
- Added new **API Data Polling Workflow** template for efficient API data retrieval and filtering
- Improved error handling for workflow creation and validation
- Added validation checks for typical workflow configuration issues
- Better error messages with suggestions for common problems

### Version 0.5.0
- Initial public release
- Basic workflow management functionality
- Execution tracking and monitoring
- Four workflow templates

## 🐛 Found a Bug? Have an Issue?

We're constantly working to improve n8n Workflow Builder MCP Server and make it more reliable for everyone. Your feedback is invaluable!

**If you encounter any bugs, issues, or unexpected behavior:**

👉 **[Open an issue on GitHub](https://github.com/salacoste/mcp-n8n-workflow-builder/issues/new)**

**When reporting an issue, please include:**
- 📋 A clear description of the problem
- 🔄 Steps to reproduce the issue
- 💻 Your environment details (n8n version, Node.js version, OS)
- 📸 Screenshots or error messages (if applicable)
- 🎯 Expected vs. actual behavior

**We also welcome:**
- 💡 Feature requests and suggestions
- 📚 Documentation improvements
- 🤝 Pull requests with bug fixes or enhancements

Your contributions help make this tool better for the entire community! 🚀

---

## License

This project is distributed under the MIT License.
