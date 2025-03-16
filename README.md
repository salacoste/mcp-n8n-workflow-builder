# n8n Workflow Builder MCP Server

This project provides an MCP (Model Context Protocol) server for managing n8n workflows. It allows you to create, update, delete, activate, and deactivate workflows through a set of tools available in Claude AI and Cursor IDE.

**Key Features:**
- Full integration with Claude AI and Cursor IDE via MCP protocol
- Create and manage n8n workflows via natural language
- Predefined workflow templates through prompts system
- Interactive workflow building with real-time feedback

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

Create an `.env` file in the project root with the following variables:

```
N8N_HOST=https://your-n8n-instance.com/api/v1/
N8N_API_KEY=your_api_key_here
```

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

**Important:** Do not add `cline_mcp_settings.json` to the repository as it contains your personal access credentials.

## Available Tools and Features

### MCP Tools

The following tools are available through the MCP protocol:

#### Workflow Management
- **list_workflows**: Displays a list of all workflows from n8n.
- **create_workflow**: Creates a new workflow in n8n.
- **get_workflow**: Gets workflow details by its ID.
- **update_workflow**: Updates an existing workflow.
- **delete_workflow**: Deletes a workflow by its ID.
- **activate_workflow**: Activates a workflow by its ID.
- **deactivate_workflow**: Deactivates a workflow by its ID.
- **execute_workflow**: Manually executes a workflow by its ID.

#### Execution Management
- **list_executions**: Displays a list of all workflow executions with filtering capabilities.
- **get_execution**: Gets details of a specific execution by its ID.
- **delete_execution**: Deletes an execution record by its ID.

All tools have been tested and optimized for n8n version 1.82.3. The node types and API structures used are compatible with this version.

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

## Usage Examples

In the `examples` directory, you'll find examples and instructions for setting up and using n8n Workflow Builder with Claude App:

1. **setup_with_claude.md** - Step-by-step instructions for setting up integration with Claude App
2. **workflow_examples.md** - Simple query examples for working with n8n workflows
3. **complex_workflow.md** - Examples of creating and updating complex workflows
4. **using_prompts.md** - Guide to using the prompts feature for quick workflow creation

## Testing the Server

You can use the provided test scripts to verify the functionality:

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

## Version Compatibility

This MCP server has been specifically tested and validated with:
- **n8n version**: 1.82.3
- **Node.js**: v14 and above
- **MCP Protocol**: Latest version compatible with Claude and Cursor

If you're using a different version of n8n, some API endpoints or node types may differ. Please report any compatibility issues in the GitHub repository.

## Changelog

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

## License

This project is distributed under the MIT License.
