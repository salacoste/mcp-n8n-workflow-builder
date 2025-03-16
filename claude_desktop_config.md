# Setting Up n8n-workflow-builder for Claude Desktop App

This guide explains how to set up the n8n-workflow-builder for use with Claude Desktop App.

## Configuration Steps

### 1. Find the MCP Configuration Directory

The location of the Claude Desktop App MCP settings file depends on your operating system:

- **Windows**: `%APPDATA%\Claude\cline_mcp_settings.json`
- **macOS**: `~/Library/Application Support/Claude/cline_mcp_settings.json`
- **Linux**: `~/.config/Claude/cline_mcp_settings.json`

### 2. Create or Edit the Configuration File

Create or edit the `cline_mcp_settings.json` file in the directory mentioned above.

### 3. Add the n8n-workflow-builder Configuration

Add the following JSON configuration, making sure to replace the placeholder paths and API credentials with your actual values:

```json
{
  "n8n-workflow-builder": {
    "command": "node",
    "args": ["/absolute/path/to/n8n-workflow-builder/build/index.js"],
    "env": {
      "N8N_HOST": "https://your-n8n-instance.com/api/v1/",
      "N8N_API_KEY": "your_n8n_api_key_here",
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

### 4. Configuration Parameters Explained

- `command`: The command to run the MCP server (always "node" for this project)
- `args`: Array of arguments to pass to the command
  - The first argument should be the absolute path to the compiled index.js file
- `env`: Environment variables to set for the process
  - `N8N_HOST`: Your n8n API host URL
  - `N8N_API_KEY`: Your n8n API key
  - `MCP_PORT`: (Optional) Custom port for the MCP server (default: 3456)
- `disabled`: Set to false to enable the tool
- `alwaysAllow`: Tools that are allowed without asking for permission (read operations)
- `autoApprove`: Tools that require permission only on first use

### 5. Important Notes

- All logs from stdout have been removed from the codebase for compatibility with the Claude Desktop App
- The absolute path to index.js must be correct for your system
- You must restart Claude Desktop App after modifying the configuration file
- All read operations (list_workflows, get_workflow) are safe to put in alwaysAllow
- Write operations should be in autoApprove or left out entirely for maximum security
- If you encounter port conflicts, use the `MCP_PORT` parameter to set a different port (like 58921)
- Starting with version 0.7.2, the server will automatically handle port conflicts by gracefully continuing if another instance is already running on the specified port

## Troubleshooting Common Issues

### Port Conflicts

If you see errors about "address already in use" in your logs:

1. Use a non-standard high port (e.g., 58921) in your configuration:
   ```json
   "env": {
     "N8N_HOST": "https://your-n8n-instance.com/api/v1/",
     "N8N_API_KEY": "your_n8n_api_key_here",
     "MCP_PORT": "58921"
   }
   ```

2. Restart Claude Desktop App completely after changing the configuration

3. If issues persist, you can manually check if the port is in use:
   ```bash
   # On macOS/Linux
   lsof -i :58921
   ```

4. Since version 0.7.2, multiple instances of the server will gracefully handle port conflicts

## Example Usage in Claude Desktop App

After configuring the MCP settings, you can use commands like:

```
Show me all available n8n workflows
```

```
Create a new workflow named "Email Notifier" with a Timer node and an Email node
```

```
Activate the workflow with ID "12345"
```

If you encounter any issues, check the path to the index.js file and ensure your n8n API credentials are correct. 