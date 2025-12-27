# Resources & Prompts API Reference

Complete API reference for MCP resources and workflow generation prompts. Discover workflows and generate from templates.

---

## Overview

The MCP server provides two discovery mechanisms:

1. **Resources**: Read-only data endpoints for workflow and execution discovery
2. **Prompts**: Template-based workflow generation with variable substitution

**Key Features:**

- **Static Resources**: Global workflow lists and execution statistics
- **Dynamic Resources**: Specific workflow and execution details
- **Workflow Prompts**: 5 pre-built workflow generation templates
- **Variable Substitution**: Customizable prompt arguments

---

## MCP Resources

Resources provide read-only access to workflow and execution data through URI-based endpoints.

### Resource Categories

| Type | Count | Purpose |
|------|-------|---------|
| Static Resources | 2 | Global lists and statistics |
| Dynamic Resources | 2 | Specific item details |

---

## Static Resources

### Resource: `n8n://workflows`

List all workflows with metadata (performance optimized).

**URI:** `n8n://workflows`

**Query Parameters:**

- `instance` (optional): Instance identifier

**Response Schema:**

```typescript
interface WorkflowsResource {
  workflows: WorkflowMetadata[];
  totalCount: number;
  generatedAt: string;  // ISO 8601 timestamp
}

interface WorkflowMetadata {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  nodes?: number;        // Node count
  tags?: string[];       // Tag names
}
```

**Response Example:**

```json
{
  "workflows": [
    {
      "id": "123",
      "name": "Email Campaign Automation",
      "active": true,
      "createdAt": "2024-12-15T10:30:00Z",
      "updatedAt": "2025-01-10T14:20:00Z",
      "nodes": 12,
      "tags": ["production", "marketing"]
    },
    {
      "id": "456",
      "name": "Slack Notifications",
      "active": true,
      "createdAt": "2024-11-20T08:15:00Z",
      "updatedAt": "2024-12-05T16:45:00Z",
      "nodes": 5,
      "tags": ["production", "monitoring"]
    }
  ],
  "totalCount": 2,
  "generatedAt": "2025-01-15T10:00:00Z"
}
```

**Equivalent MCP Tool:** `list_workflows`

**Use Cases:**

- Building workflow dashboards
- Workflow inventory reports
- Monitoring active workflow counts
- Workflow discovery and exploration

---

### Resource: `n8n://execution-stats`

Execution statistics summary with recent executions and workflow performance.

**URI:** `n8n://execution-stats`

**Query Parameters:**

- `instance` (optional): Instance identifier
- `timeRange` (optional): Time range in hours (default: 24)

**Response Schema:**

```typescript
interface ExecutionStatsResource {
  summary: {
    total: number;
    successful: number;
    failed: number;
    running: number;
    successRate: number;  // Percentage
  };
  recentExecutions: ExecutionSummary[];
  byWorkflow: WorkflowExecutionStats[];
  timeRange: {
    from: string;  // ISO 8601
    to: string;    // ISO 8601
  };
  generatedAt: string;
}

interface WorkflowExecutionStats {
  workflowId: number;
  workflowName: string;
  executions: number;
  successRate: number;
  avgDuration: number;  // Milliseconds
}
```

**Response Example:**

```json
{
  "summary": {
    "total": 1250,
    "successful": 1180,
    "failed": 65,
    "running": 5,
    "successRate": 94.4
  },
  "recentExecutions": [
    {
      "id": 9876,
      "workflowId": 123,
      "finished": true,
      "mode": "webhook",
      "startedAt": "2025-01-15T10:30:00Z",
      "stoppedAt": "2025-01-15T10:30:02.245Z"
    }
  ],
  "byWorkflow": [
    {
      "workflowId": 123,
      "workflowName": "Email Campaign",
      "executions": 450,
      "successRate": 98.2,
      "avgDuration": 2145
    },
    {
      "workflowId": 456,
      "workflowName": "Slack Notifications",
      "executions": 800,
      "successRate": 99.5,
      "avgDuration": 345
    }
  ],
  "timeRange": {
    "from": "2025-01-14T10:00:00Z",
    "to": "2025-01-15T10:00:00Z"
  },
  "generatedAt": "2025-01-15T10:00:00Z"
}
```

**Use Cases:**

- Real-time monitoring dashboards
- Performance analytics
- Success rate tracking
- Workflow health monitoring

---

## Dynamic Resources

### Resource: `n8n://workflows/{id}`

Get complete workflow definition for specific workflow.

**URI Pattern:** `n8n://workflows/{workflowId}`

**Parameters:**

- `{workflowId}`: Workflow ID (required, in URI path)
- `instance` (query, optional): Instance identifier

**Example URI:** `n8n://workflows/123?instance=production`

**Response:** Complete `WorkflowDefinition` object (same as `get_workflow` tool)

**Equivalent MCP Tool:** `get_workflow`

**Use Cases:**

- Workflow detail views
- Workflow cloning and templating
- Configuration review
- Debugging and analysis

---

### Resource: `n8n://executions/{id}`

Get complete execution details including node outputs and errors.

**URI Pattern:** `n8n://executions/{executionId}`

**Parameters:**

- `{executionId}`: Execution ID (required, in URI path)
- `instance` (query, optional): Instance identifier
- `includeData` (query, optional): Include execution data (default: true)

**Example URI:** `n8n://executions/9876?instance=production&includeData=true`

**Response:** Complete `Execution` object (same as `get_execution` tool)

**Equivalent MCP Tool:** `get_execution`

**Use Cases:**

- Execution debugging
- Performance analysis
- Audit and compliance
- Error investigation

---

## MCP Prompts

Workflow generation templates with variable substitution for rapid workflow creation.

### Available Prompts

| Prompt Name | Purpose | Variables |
|-------------|---------|-----------|
| `schedule-triggered-workflow` | Cron-based scheduled workflows | 4 variables |
| `http-webhook-workflow` | HTTP endpoint responders | 4 variables |
| `data-transformation-workflow` | Data processing pipelines | 4 variables |
| `external-service-integration` | API integration workflows | 4 variables |
| `api-data-polling` | Interval-based API polling | 4 variables |

---

## Prompt: schedule-triggered-workflow

Generate workflow with schedule trigger (cron-based automation).

### Arguments

```typescript
interface ScheduleTriggeredWorkflowArgs {
  workflow_name: string;        // Workflow display name
  cron_schedule: string;        // Cron expression (e.g., "0 2 * * *")
  action_description: string;   // What the workflow does
  timezone?: string;            // Timezone (default: "America/New_York")
}
```

### Example Usage

```typescript
const prompt = await client.getPrompt({
  name: 'schedule-triggered-workflow',
  arguments: {
    workflow_name: 'Daily Backup',
    cron_schedule: '0 2 * * *',  // 2 AM daily
    action_description: 'Backup database to S3',
    timezone: 'America/New_York'
  }
});

// Prompt returns workflow definition
const workflowDef = JSON.parse(prompt.messages[0].content.text);

// Create workflow from prompt
await client.callTool({
  name: 'create_workflow',
  arguments: workflowDef
});
```

### Generated Workflow Structure

- **Trigger Node**: Schedule Trigger with cron expression
- **Action Node**: Code node with action description
- **Settings**: Timezone configuration

---

## Prompt: http-webhook-workflow

Generate workflow with HTTP webhook trigger.

### Arguments

```typescript
interface HttpWebhookWorkflowArgs {
  workflow_name: string;            // Workflow display name
  webhook_path: string;             // URL path (e.g., "customer-signup")
  response_mode?: string;           // "onReceived" or "lastNode" (default: "onReceived")
  processing_description: string;   // What the workflow does with request
}
```

### Example Usage

```typescript
const prompt = await client.getPrompt({
  name: 'http-webhook-workflow',
  arguments: {
    workflow_name: 'Customer Signup Handler',
    webhook_path: 'customer-signup',
    response_mode: 'onReceived',
    processing_description: 'Validate email, send welcome email, store in database'
  }
});

const workflowDef = JSON.parse(prompt.messages[0].content.text);

await client.callTool({
  name: 'create_workflow',
  arguments: workflowDef
});
```

### Generated Workflow Structure

- **Trigger Node**: Webhook with specified path
- **Processing Node**: Code node with processing description
- **Response Node**: Respond to webhook

---

## Prompt: data-transformation-workflow

Generate workflow for data transformation and ETL operations.

### Arguments

```typescript
interface DataTransformationWorkflowArgs {
  workflow_name: string;                // Workflow display name
  source_description: string;           // Where data comes from
  transformation_description: string;   // How data is transformed
  destination_description: string;      // Where data goes
}
```

### Example Usage

```typescript
const prompt = await client.getPrompt({
  name: 'data-transformation-workflow',
  arguments: {
    workflow_name: 'Sales Data ETL',
    source_description: 'Fetch sales data from Salesforce API',
    transformation_description: 'Aggregate by region and calculate totals',
    destination_description: 'Store in PostgreSQL analytics database'
  }
});

const workflowDef = JSON.parse(prompt.messages[0].content.text);

await client.callTool({
  name: 'create_workflow',
  arguments: workflowDef
});
```

### Generated Workflow Structure

- **Source Node**: Data source (manual trigger or HTTP)
- **Transform Node**: Code node with transformation logic
- **Destination Node**: Data storage/output

---

## Prompt: external-service-integration

Generate workflow integrating with external services.

### Arguments

```typescript
interface ExternalServiceIntegrationArgs {
  workflow_name: string;           // Workflow display name
  service_name: string;            // External service name (e.g., "Slack", "GitHub")
  trigger_description: string;     // What triggers the workflow
  action_description: string;      // What action to perform on service
}
```

### Example Usage

```typescript
const prompt = await client.getPrompt({
  name: 'external-service-integration',
  arguments: {
    workflow_name: 'GitHub Issue Notifier',
    service_name: 'Slack',
    trigger_description: 'New GitHub issue created',
    action_description: 'Send notification to #dev-team channel'
  }
});

const workflowDef = JSON.parse(prompt.messages[0].content.text);

await client.callTool({
  name: 'create_workflow',
  arguments: workflowDef
});
```

### Generated Workflow Structure

- **Trigger Node**: Service-specific trigger
- **Action Node**: Service integration node
- **Notification Node**: Optional confirmation

---

## Prompt: api-data-polling

Generate workflow that polls API endpoint on interval.

### Arguments

```typescript
interface ApiDataPollingArgs {
  workflow_name: string;        // Workflow display name
  api_endpoint: string;         // API URL to poll
  poll_interval: string;        // Cron expression or interval
  data_processing: string;      // What to do with retrieved data
}
```

### Example Usage

```typescript
const prompt = await client.getPrompt({
  name: 'api-data-polling',
  arguments: {
    workflow_name: 'Stock Price Monitor',
    api_endpoint: 'https://api.stocks.com/prices',
    poll_interval: '*/15 * * * *',  // Every 15 minutes
    data_processing: 'Compare with threshold and send alerts if exceeded'
  }
});

const workflowDef = JSON.parse(prompt.messages[0].content.text);

await client.callTool({
  name: 'create_workflow',
  arguments: workflowDef
});
```

### Generated Workflow Structure

- **Trigger Node**: Schedule Trigger with poll interval
- **HTTP Request Node**: API endpoint call
- **Processing Node**: Data processing logic
- **Action Node**: Result handling

---

## Code Examples

### List Available Prompts

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';

const client = new Client({
  name: 'n8n-prompt-explorer',
  version: '1.0.0'
});

await client.connect(transport);

// List all available prompts
const prompts = await client.listPrompts();

console.log('Available workflow prompts:');
prompts.forEach(prompt => {
  console.log(`\n${prompt.name}`);
  console.log(`  Description: ${prompt.description}`);
  console.log(`  Arguments:`);
  prompt.arguments?.forEach(arg => {
    const required = arg.required ? '(required)' : '(optional)';
    console.log(`    - ${arg.name} ${required}: ${arg.description}`);
  });
});
```

### Generate Workflow from Prompt

```typescript
async function generateWorkflowFromPrompt(
  promptName: string,
  args: Record<string, string>,
  instance?: string
) {
  // Get prompt with arguments
  const prompt = await client.getPrompt({
    name: promptName,
    arguments: args
  });

  // Parse workflow definition from prompt
  const workflowDef = JSON.parse(prompt.messages[0].content.text);

  // Create workflow
  const result = await client.callTool({
    name: 'create_workflow',
    arguments: {
      instance,
      ...workflowDef
    }
  });

  const workflow = JSON.parse(result.content[0].text);

  console.log(`Created workflow: ${workflow.name} (ID: ${workflow.id})`);
  return workflow;
}

// Usage
const workflow = await generateWorkflowFromPrompt(
  'http-webhook-workflow',
  {
    workflow_name: 'Order Processor',
    webhook_path: 'process-order',
    processing_description: 'Validate and store order'
  },
  'production'
);
```

### Python - Generate from Template

```python
import json
import subprocess

def generate_workflow_from_prompt(prompt_name, args, instance=None):
    """Generate workflow from MCP prompt."""
    # Get prompt
    prompt_request = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "prompts/get",
        "params": {
            "name": prompt_name,
            "arguments": args
        }
    }

    prompt_result = subprocess.run(
        ['npx', '@kernel.salacoste/n8n-workflow-builder'],
        input=json.dumps(prompt_request),
        capture_output=True,
        text=True
    )

    prompt_response = json.loads(prompt_result.stdout)
    workflow_def = json.loads(
        prompt_response['result']['messages'][0]['content']['text']
    )

    # Create workflow
    create_request = {
        "jsonrpc": "2.0",
        "id": 2,
        "method": "tools/call",
        "params": {
            "name": "create_workflow",
            "arguments": {
                "instance": instance,
                **workflow_def
            }
        }
    }

    create_result = subprocess.run(
        ['npx', '@kernel.salacoste/n8n-workflow-builder'],
        input=json.dumps(create_request),
        capture_output=True,
        text=True
    )

    create_response = json.loads(create_result.stdout)
    return json.loads(create_response['result']['content'][0]['text'])

# Usage
workflow = generate_workflow_from_prompt(
    'schedule-triggered-workflow',
    {
        'workflow_name': 'Daily Report',
        'cron_schedule': '0 9 * * *',
        'action_description': 'Generate and email daily report',
        'timezone': 'America/New_York'
    },
    instance='production'
)

print(f"Created workflow: {workflow['name']} (ID: {workflow['id']})")
```

---

## Best Practices

### 1. Resource vs Tool Comparison

**Use Resources When:**
- Building read-only dashboards
- Displaying workflow lists
- Showing execution statistics
- Creating monitoring UIs

**Use Tools When:**
- Creating or modifying workflows
- Managing executions
- Performing write operations
- Need fine-grained control

### 2. Prompt Customization

```typescript
// ✅ Good: Descriptive and specific arguments
const workflow = await generateFromPrompt('http-webhook-workflow', {
  workflow_name: 'Customer Signup Processor',
  webhook_path: 'customer-signup',
  processing_description: 'Validate email format, check for duplicates, send welcome email, store in PostgreSQL customers table'
});

// ❌ Avoid: Vague descriptions
const workflow = await generateFromPrompt('http-webhook-workflow', {
  workflow_name: 'Webhook',
  webhook_path: 'webhook',
  processing_description: 'Process data'
});
```

### 3. Prompt-Based Workflow Libraries

```typescript
// Build reusable workflow template library
const workflowTemplates = {
  customerSignup: {
    prompt: 'http-webhook-workflow',
    args: {
      workflow_name: 'Customer Signup',
      webhook_path: 'customer-signup',
      processing_description: 'Email validation → Duplicate check → Welcome email → Database storage'
    }
  },

  dailyBackup: {
    prompt: 'schedule-triggered-workflow',
    args: {
      workflow_name: 'Daily Backup',
      cron_schedule: '0 2 * * *',
      action_description: 'Backup production database to S3',
      timezone: 'UTC'
    }
  },

  slackNotifier: {
    prompt: 'external-service-integration',
    args: {
      workflow_name: 'Error Notifier',
      service_name: 'Slack',
      trigger_description: 'Application error detected',
      action_description: 'Send alert to #ops-alerts channel'
    }
  }
};

// Generate workflows from library
for (const [name, template] of Object.entries(workflowTemplates)) {
  const workflow = await generateFromPrompt(
    template.prompt,
    template.args,
    'production'
  );
  console.log(`Created ${name}: ${workflow.id}`);
}
```

---

## Next Steps

- **[Workflows API Reference](workflows-api.md)** - Create and manage workflows
- **[API Architecture Overview](overview.md)** - System architecture and components
- **[MCP Resources Guide](../features/mcp-resources.md)** - Complete resources documentation

---

**Document Version:** 1.0
**Last Updated:** January 2025
**Related Epic:** Epic 4 (MCP Resources & Prompts)
