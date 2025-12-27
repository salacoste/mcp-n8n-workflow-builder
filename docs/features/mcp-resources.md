# MCP Resources & Prompts

Guide to MCP resources for workflow discovery and prompt templates for workflow generation.

---

## Overview

The MCP server exposes resources and prompts that can be accessed directly by Claude AI or other MCP clients.

### Resource Types

**Static Resources:**
- `n8n://workflows` - List all workflows metadata
- `n8n://execution-stats` - Execution statistics summary

**Dynamic Resources:**
- `n8n://workflows/{id}` - Specific workflow details
- `n8n://executions/{id}` - Specific execution details

**Prompt Templates:**
- 5 workflow generation templates for common patterns

---

## MCP Resources

### n8n://workflows

List all workflows with metadata (read-only resource).

**URI:** `n8n://workflows`

**Query Parameters:**
- `instance` (optional) - Instance identifier

**Response Format:**
```typescript
{
  workflows: Array<{
    id: string;
    name: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    nodes?: number;
    tags?: string[];
  }>;
  totalCount: number;
  generatedAt: string;
}
```

**Equivalent Tool:** `list_workflows()`

**Use Case:** Quick overview of all workflows without using a tool call.

---

### n8n://execution-stats

Execution statistics summary.

**URI:** `n8n://execution-stats`

**Response Format:**
```typescript
{
  summary: {
    total: number;
    successful: number;
    failed: number;
    running: number;
  };
  recentExecutions: Execution[];
  byWorkflow: Array<{
    workflowId: number;
    workflowName: string;
    executions: number;
    successRate: number;
  }>;
  timeRange: {
    from: string;
    to: string;
  };
  generatedAt: string;
}
```

**Use Case:** Dashboard-style overview of execution health.

---

### n8n://workflows/{id}

Get specific workflow details.

**URI Pattern:** `n8n://workflows/{workflowId}`

**Parameters:**
- `{workflowId}` - Workflow ID
- Query: `instance` (optional)

**Equivalent Tool:** `get_workflow({ id })`

**Example:** `n8n://workflows/15?instance=production`

---

### n8n://executions/{id}

Get specific execution details.

**URI Pattern:** `n8n://executions/{executionId}`

**Equivalent Tool:** `get_execution({ id })`

**Example:** `n8n://executions/789`

---

## MCP Prompts

Prompt templates for generating common workflow patterns.

### 1. schedule-triggered-workflow

Generate a workflow with schedule trigger.

**Arguments:**
```typescript
{
  workflow_name: string;         // Workflow name
  cron_schedule: string;         // Cron expression (e.g., "0 9 * * *")
  action_description: string;    // What the workflow does
  timezone?: string;             // Timezone (default: UTC)
}
```

**Example Usage:**
```
Use prompt: schedule-triggered-workflow
Arguments:
  workflow_name: "Daily Backup"
  cron_schedule: "0 2 * * *"
  action_description: "Backup database to S3"
  timezone: "America/New_York"
```

**Generated Workflow:**
- Schedule Trigger node (cron-based)
- Action nodes based on description
- Error handling nodes

---

### 2. http-webhook-workflow

Generate a webhook receiver workflow.

**Arguments:**
```typescript
{
  workflow_name: string;         // Workflow name
  webhook_path: string;          // Webhook URL path
  response_mode?: string;        // 'onReceived' | 'lastNode'
  processing_description: string; // What to do with webhook data
}
```

**Example Usage:**
```
Use prompt: http-webhook-workflow
Arguments:
  workflow_name: "Order Processor"
  webhook_path: "process-order"
  response_mode: "lastNode"
  processing_description: "Validate order and save to database"
```

**Generated Workflow:**
- Webhook Trigger node
- Data processing nodes
- Response node

---

### 3. data-transformation-workflow

Generate data transformation pipeline.

**Arguments:**
```typescript
{
  workflow_name: string;            // Workflow name
  source_description: string;       // Data source
  transformation_description: string; // Transformations needed
  destination_description: string;   // Where to send data
}
```

**Example Usage:**
```
Use prompt: data-transformation-workflow
Arguments:
  workflow_name: "CSV to Database"
  source_description: "Read CSV file from S3"
  transformation_description: "Parse CSV, validate, enrich with API data"
  destination_description: "Insert into PostgreSQL"
```

**Generated Workflow:**
- Source node (file, API, database)
- Transformation nodes (Set, Code, Function)
- Destination node

---

### 4. external-service-integration

Generate service integration workflow.

**Arguments:**
```typescript
{
  workflow_name: string;         // Workflow name
  service_name: string;          // Service to integrate (Slack, Gmail, etc.)
  trigger_description: string;   // What triggers the workflow
  action_description: string;    // What action to take
}
```

**Example Usage:**
```
Use prompt: external-service-integration
Arguments:
  workflow_name: "Slack Alert System"
  service_name: "Slack"
  trigger_description: "When error occurs in application"
  action_description: "Send alert to #alerts channel"
```

**Generated Workflow:**
- Service-specific trigger
- Processing nodes
- Service action node

---

### 5. api-data-polling

Generate API polling workflow.

**Arguments:**
```typescript
{
  workflow_name: string;         // Workflow name
  api_endpoint: string;          // API URL to poll
  poll_interval: string;         // How often to poll (cron)
  data_processing: string;       // What to do with API response
}
```

**Example Usage:**
```
Use prompt: api-data-polling
Arguments:
  workflow_name: "Weather Sync"
  api_endpoint: "https://api.weather.com/current"
  poll_interval: "0 */6 * * *"  // Every 6 hours
  data_processing: "Save to database and send notifications if extreme weather"
```

**Generated Workflow:**
- Schedule Trigger (polling interval)
- HTTP Request node (API call)
- Processing nodes
- Action nodes

---

## Using Prompts

### Via MCP Client

```typescript
// List available prompts
const prompts = await client.listPrompts()

// Get specific prompt
const workflow = await client.getPrompt({
  name: "http-webhook-workflow",
  arguments: {
    workflow_name: "Order Processor",
    webhook_path: "process-order",
    processing_description: "Validate and store order"
  }
})

// Create workflow from template
await client.callTool({
  name: "create_workflow",
  arguments: JSON.parse(workflow.messages[0].content.text)
})
```

### Via Claude Desktop

**Request:**
```
Create a schedule-triggered workflow called "Daily Report"
that runs at 9 AM and generates a sales report
```

**Claude recognizes the pattern and may use prompt template internally**

---

## Resources vs Tools

| Feature | Resources | Tools |
|---------|-----------|-------|
| **Access Method** | Direct URI access | Tool invocation |
| **Caching** | Can be cached by client | Not cached |
| **Updates** | Real-time data | On-demand |
| **Use Case** | Quick reference | Actions & operations |
| **Performance** | Faster (cached) | Slower (API call) |

**When to Use Resources:**
- Quick data lookup
- Dashboard views
- Cached information

**When to Use Tools:**
- Modify workflows
- Execute operations
- Get latest data

---

## Next Steps

- [Workflows Management](workflows-management.md) - Create workflows
- [API Reference](../api/resources-prompts.md) - Technical details
- [Examples](../examples/workflows/basic-patterns.md) - Workflow patterns

---

!!! info "MCP Protocol"
    Learn more about MCP resources and prompts at:
    [Model Context Protocol Specification](https://spec.modelcontextprotocol.io/)
