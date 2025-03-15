# Setting Up n8n Workflow Builder for Use with Claude App

## Setup Steps

1. **Package Installation**

```bash
npm install @makafeli/n8n-workflow-builder
```

2. **Setting Up the .env File**

Create an .env file in the project root with the following variables:

```
N8N_HOST=https://yourn8ninstance.com/api/v1/
N8N_API_KEY=your_api_key_here
```

3. **Configuring Claude's Configuration File**

Create a `cline_mcp_settings.json` file in the user's home directory (or in the directory specified in Claude's documentation):

```json
{
  "n8n-workflow-builder": {
    "command": "node",
    "args": ["path/to/your/project/build/index.js"],
    "env": {
      "N8N_HOST": "https://yourn8ninstance.com/api/v1/",
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

4. **Building the Project**

```bash
npm run build
```

5. **Testing the Setup**

Launch Claude App and verify that the integration is working by executing a simple query:

```
Show me the available n8n workflows
```

## Security Configuration

In the `cline_mcp_settings.json` file:

- `alwaysAllow` - tools that don't require user confirmation (safe read operations)
- `autoApprove` - tools that require confirmation only on first use
- For the most secure setup, remove tools from both lists to always request confirmation

## Troubleshooting

1. **Claude can't find n8n tools**
   - Check that the path to the `build/index.js` file is correct
   - Verify that the `cline_mcp_settings.json` file is in the right directory
   - Restart Claude App

2. **n8n API connection errors**
   - Check the correctness of the URL and API key
   - Make sure your n8n server is accessible and the API is enabled
   - Verify the access permissions for the API key

3. **Command execution errors**
   - Check Claude's log files for detailed error information
   - Run the server manually for debugging: `node build/index.js` 