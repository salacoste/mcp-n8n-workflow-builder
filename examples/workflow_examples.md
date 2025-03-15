# n8n Workflow Examples with Claude

This document contains examples of working with n8n workflows through Claude AI using the MCP n8n Workflow Builder.

## Basic Examples

### List All Workflows

To view all available workflows in your n8n instance:

```
Show me all my n8n workflows
```

Claude will display a list of your workflows, including their IDs, names, and active status.

### Get Workflow Details

To see details about a specific workflow:

```
Show me details for workflow ID "abc123"
```

Replace `abc123` with your actual workflow ID. Claude will show the workflow's nodes, connections, and other configuration details.

### Create a Simple Workflow

To create a basic workflow:

```
Create a workflow named "Simple Test" with a manual trigger and a Set node that sets a value called "message" to "Hello World"
```

Claude will create the workflow and provide you with the ID and other details.

### Update a Workflow

To modify an existing workflow:

```
Update workflow "abc123" to add a Code node after the Set node that logs the message value
```

### Delete a Workflow

To delete a workflow:

```
Delete workflow with ID "abc123"
```

Claude will ask for confirmation before deleting.

### Activate/Deactivate Workflows

To change a workflow's active status:

```
Activate workflow "abc123"
```

or

```
Deactivate workflow "abc123"
```

## Working with Executions

### List Workflow Executions

To view execution history:

```
Show me the execution history for workflow "abc123"
```

or

```
List all successful executions from the past 24 hours
```

### Get Execution Details

To see details about a specific execution:

```
Show me details for execution ID 42
```

Replace `42` with your actual execution ID.

### Delete an Execution

To remove execution history:

```
Delete execution with ID 42
```

## Using Resources

The MCP server provides resource endpoints for efficient access to n8n data.

### View All Workflows as a Resource

```
Show me the /workflows resource
```

### View Execution Statistics

```
Show me execution statistics
```

## Using Workflow Prompts

For more efficient workflow creation, you can use predefined templates:

### Schedule-Based Workflow

```
I need a workflow that runs every hour and sends a status update
```

Claude will suggest using the Schedule Triggered Workflow prompt and guide you through the setup.

### Webhook API Workflow

```
Create an API endpoint for receiving customer feedback
```

Claude will use the HTTP Webhook Workflow prompt to help you build this.

### Data Transformation

```
I need a workflow to process and format CSV data
```

Claude will recommend the Data Transformation Workflow prompt and assist with customization.

### External API Integration

```
Build a workflow that fetches stock prices and alerts me on significant changes
```

Claude will suggest the External Service Integration Workflow prompt.

## Natural Language Workflow Building

You can also describe workflows in natural language, and Claude will help build them:

```
Create a workflow that monitors a folder for new files, processes any CSV files by extracting customer information, and then sends that data to a Google Sheet
```

Claude will break this down into steps and create the appropriate workflow structure.

## Advanced Techniques

### Conditional Logic

```
Create a workflow that processes incoming orders, sending high-value orders to a manager for approval and automatically processing others
```

### Multi-Node Workflows

```
I need a workflow that pulls data from an API, transforms it, splits it into different categories, and sends notifications based on the category
```

### Error Handling

```
Add error handling to workflow "abc123" so that failures send an email alert
```

## Debugging Tips

Ask Claude for help when workflows aren't behaving as expected:

```
Why might my webhook workflow with ID "abc123" not be receiving data?
```

or 

```
How can I debug the execution issues in workflow "abc123"?
```

Remember that Claude can analyze workflow structures and execution logs to help identify problems. 