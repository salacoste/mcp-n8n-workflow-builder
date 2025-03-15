# Setting Up n8n Workflow Builder with Claude

This guide provides step-by-step instructions for setting up and using the n8n Workflow Builder MCP server with Claude AI.

## Prerequisites

Before you begin, ensure you have:

1. An n8n instance running and accessible
2. An API key for your n8n instance
3. Node.js (v14 or higher) installed
4. Access to Claude AI (via Claude App or Cursor IDE)

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/salacoste/mcp-n8n-workflow-builder.git
cd mcp-n8n-workflow-builder
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```
N8N_HOST=https://your-n8n-instance.com/api/v1/
N8N_API_KEY=your_api_key_here
```

Make sure to replace the placeholder values with your actual n8n instance URL and API key.

### 4. Build the Project

```bash
npm run build
```

### 5. Configure Claude Integration

#### For Claude App

Create a `cline_mcp_settings.json` file in the appropriate location:

- On macOS & Linux: `~/.config/Claude/cline_mcp_settings.json`
- On Windows: `%APPDATA%\Claude\cline_mcp_settings.json`

Add the following configuration (adjusting paths as needed):

```json
{
  "mcp-n8n-workflow-builder": {
    "command": "node",
    "args": ["/path/to/your/mcp-n8n-workflow-builder/build/index.js"],
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

#### For Cursor IDE

If you're using Cursor IDE with Claude integration:

1. Open Cursor settings
2. Navigate to the AI section
3. Find the MCP configuration area
4. Add the same configuration as above, adjusting for your environment

## Testing the Integration

### 1. Start a New Conversation in Claude App

Open Claude App and start a new conversation.

### 2. Check MCP Connection

Type a message like:

```
Can you check if my n8n MCP server is connected?
```

Claude should respond confirming the connection and listing available tools.

### 3. Try Basic Commands

Try simple commands like:

```
List all my n8n workflows
```

or

```
Show me execution statistics
```

## Using Advanced Features

### Working with Workflow Prompts

The n8n Workflow Builder includes predefined prompt templates for common workflow patterns:

1. To see available prompts, ask Claude:

```
What workflow templates do you have available?
```

2. To use a specific prompt, describe what you need:

```
Create a workflow that runs every day at 9 AM
```

3. Claude will guide you through filling in the required variables for the template.

### Creating Complex Workflows

For more complex workflows, you can describe what you need in natural language:

```
Create a workflow that fetches data from a weather API, processes it, and sends the results via email if the temperature exceeds 30°C
```

Claude will break this down into steps and help you create the appropriate workflow.

## Troubleshooting

If you encounter issues:

1. **Connection Problems**:
   - Ensure your n8n instance is running and accessible
   - Check that your API key is valid
   - Verify the N8N_HOST URL is correct

2. **Permission Issues**:
   - Make sure the API key has sufficient permissions

3. **MCP Integration Issues**:
   - Check the `cline_mcp_settings.json` file location and format
   - Restart Claude App after making changes to the configuration

4. **Server Errors**:
   - Run the server manually with `npm start` to see error output
   - Check if the n8n API is accessible from your machine

## Next Steps

Once you've confirmed the basic setup works:

- Check out `workflow_examples.md` for more example workflows
- Explore `complex_workflow.md` for advanced use cases
- See `using_prompts.md` for details on using workflow templates

Remember that Claude can help you understand and debug issues, so feel free to ask for help if you encounter any problems. 