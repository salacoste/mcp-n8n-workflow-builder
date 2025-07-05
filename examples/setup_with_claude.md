# Setting Up n8n Workflow Builder with Claude

This guide provides step-by-step instructions for setting up and using the n8n Workflow Builder MCP service with Claude. Follow these instructions to ensure Claude can access and manage your n8n workflows through natural language conversations.

## Prerequisites

Before starting, ensure you have:

1. A working n8n instance with API access (version 1.82.3 recommended)
2. Node.js installed (v14+ recommended)
3. Claude access (Claude App or Cursor IDE)
4. Your n8n API key

## Installation Steps

### Step 1: Install the n8n Workflow Builder

You can install the package globally or as a local dependency:

```bash
# Install globally
npm install -g @kernel.salacoste/n8n-workflow-builder

# Or as a local dependency
npm install @kernel.salacoste/n8n-workflow-builder
```

### Step 2: Configure Environment Variables

Create a `.env` file in the project directory with the following content:

```
N8N_HOST=https://your-n8n-instance.com/api/v1/
N8N_API_KEY=your_api_key_here
```

Replace the values with your actual n8n host URL and API key.

### Step 3: Configure Claude Integration

Create a configuration file for Claude to access the MCP server:

1. Create a file named `cline_mcp_settings.json` in your home directory or appropriate location for Claude settings
2. Add the following content to the file:

```json
{
  "n8n-workflow-builder": {
    "command": "n8n-workflow-builder",
    "env": {
      "N8N_HOST": "https://your-n8n-instance.com/api/v1/",
      "N8N_API_KEY": "your_api_key_here" 
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

If you installed as a local dependency, use:

```json
{
  "n8n-workflow-builder": {
    "command": "node",
    "args": ["/path/to/your/project/build/index.js"],
    "env": {
      "N8N_HOST": "https://your-n8n-instance.com/api/v1/",
      "N8N_API_KEY": "your_api_key_here"
    },
    "disabled": false,
    "alwaysAllow": ["list_workflows", "get_workflow", "list_executions", "get_execution"],
    "autoApprove": ["create_workflow", "update_workflow", "activate_workflow", "deactivate_workflow", "delete_workflow", "delete_execution"]
  }
}
```

## Testing Your Setup

### Using test-mcp-tools.js

Before using with Claude, validate your installation with the test script:

```bash
# Start the MCP server in a separate terminal
npm start

# Run comprehensive tests in another terminal
node test-mcp-tools.js
```

This script tests all functionality including workflow creation, activation, and execution. 
It will help identify any connection issues with your n8n instance.

### Important Notes About n8n v1.82.3 Compatibility

* **Trigger node requirement**: n8n v1.82.3 requires valid trigger nodes for workflow activation
* The MCP server automatically adds a `scheduleTrigger` node if missing when activating workflows
* Note that `manualTrigger` is not recognized as a valid trigger in this n8n version
* For manually executable workflows, recommended trigger types are `scheduleTrigger` or `webhook`

## Using Claude with n8n Workflow Builder

Once set up, you can interact with Claude to manage your n8n workflows. Here are some example prompts:

- "Show me all my n8n workflows" (returns essential metadata only for performance)
- "Create a new workflow that runs every day and sends a Slack message"
- "Help me build an HTTP webhook workflow that processes incoming data"
- "Update my 'Data Processing' workflow to add an email notification"
- "Show me the executions of my workflow named 'Daily Report'"

## Troubleshooting

If you encounter issues:

1. Check that your n8n instance is running and accessible
2. Verify your API key has the necessary permissions
3. Ensure the environment variables are correctly set
4. Check Claude has access to the MCP server
5. Look for error messages in the MCP server logs
6. Run the test-mcp-tools.js script to verify connectivity

For more detailed examples and usage patterns, refer to the other guides in the examples directory. 