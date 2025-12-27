# Workflows API Reference

Complete API reference for all workflow management operations. This page documents all 8 workflow tools with request/response schemas, code examples, and best practices.

---

## Overview

The Workflows API provides programmatic access to create, manage, and monitor n8n workflows across multiple instances.

**Available Operations:**

| Operation | Purpose | Common Use Cases |
|-----------|---------|------------------|
| `list_workflows` | List workflows with filtering | Dashboards, inventory, monitoring |
| `get_workflow` | Get complete workflow definition | Debugging, cloning, analysis |
| `create_workflow` | Create new workflow | Templates, CI/CD, automation |
| `update_workflow` | Modify existing workflow | Improvements, fixes, configuration |
| `delete_workflow` | Remove workflow permanently | Cleanup, decommissioning |
| `activate_workflow` | Enable workflow execution | Deployment, go-live |
| `deactivate_workflow` | Disable workflow execution | Maintenance, troubleshooting |
| `execute_workflow` | Manual trigger execution | Testing, one-time runs |

---

## list_workflows

List workflows with optional filtering and cursor-based pagination.

### Purpose

Retrieve streamlined workflow metadata from an n8n instance. Returns metadata only (no full node definitions) for optimal performance.

### Use Cases

- Building workflow dashboards and monitoring UIs
- Inventory management and workflow discovery
- Finding workflows by tag or status
- Pre-flight checks before operations
- Monitoring active workflow counts

---

### Request

**MCP Tool Name:** `list_workflows`

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| instance | string | No | default | Instance identifier from `.config.json` |
| active | boolean | No | - | Filter by active status (true/false) |
| tags | string[] | No | - | Filter by tag names (AND logic) |
| limit | number | No | 100 | Max workflows to return (1-250) |
| cursor | string | No | - | Pagination cursor from previous response |

**TypeScript Interface:**

```typescript
interface ListWorkflowsParams {
  instance?: string;
  active?: boolean;
  tags?: string[];
  limit?: number;  // Range: 1-250
  cursor?: string; // Opaque cursor token
}
```

**JSON-RPC Request Example:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "list_workflows",
    "arguments": {
      "instance": "production",
      "active": true,
      "tags": ["production", "critical"],
      "limit": 50
    }
  }
}
```

---

### Response

**Success Response:**

**TypeScript Interface:**

```typescript
interface WorkflowListResponse {
  data: WorkflowMetadata[];
  nextCursor?: string;  // Present if more data available
}

interface WorkflowMetadata {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;      // ISO 8601 timestamp
  updatedAt: string;      // ISO 8601 timestamp
  nodes?: number;         // Node count (if available)
  tags?: Tag[];           // Associated tags
}

interface Tag {
  id: string;
  name: string;
}
```

**JSON Example:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [{
      "type": "text",
      "text": "{
  \"data\": [
    {
      \"id\": \"123\",
      \"name\": \"Email Campaign Automation\",
      \"active\": true,
      \"createdAt\": \"2024-12-15T10:30:00Z\",
      \"updatedAt\": \"2025-01-10T14:20:00Z\",
      \"nodes\": 12,
      \"tags\": [
        { \"id\": \"1\", \"name\": \"production\" },
        { \"id\": \"2\", \"name\": \"marketing\" }
      ]
    },
    {
      \"id\": \"456\",
      \"name\": \"Slack Error Notifications\",
      \"active\": true,
      \"createdAt\": \"2024-11-20T08:15:00Z\",
      \"updatedAt\": \"2024-12-05T16:45:00Z\",
      \"nodes\": 5,
      \"tags\": [
        { \"id\": \"1\", \"name\": \"production\" },
        { \"id\": \"3\", \"name\": \"monitoring\" }
      ]
    }
  ],
  \"nextCursor\": \"eyJvZmZzZXQiOjUwfQ==\"
}"
    }]
  }
}
```

**Field Descriptions:**

- **id**: Unique workflow identifier (string, not number)
- **name**: User-defined workflow name
- **active**: Whether workflow is enabled for automatic execution
- **createdAt**: Workflow creation timestamp (UTC, ISO 8601)
- **updatedAt**: Last modification timestamp (UTC, ISO 8601)
- **nodes**: Number of nodes in workflow (count only, not full definitions)
- **tags**: Array of associated tags with IDs and names
- **nextCursor**: Opaque pagination cursor (base64 encoded), present if more data available

---

### Pagination

**Cursor-Based Pagination:**

The Workflows API uses cursor-based pagination (not offset-based) for stability when data changes between requests.

**First Page Request:**

```json
{
  "limit": 50
}
```

**Subsequent Page Request:**

```json
{
  "limit": 50,
  "cursor": "eyJvZmZzZXQiOjUwfQ=="
}
```

**Complete Pagination Example:**

```typescript
async function getAllWorkflows(instance?: string): Promise<WorkflowMetadata[]> {
  const allWorkflows: WorkflowMetadata[] = [];
  let cursor: string | undefined;

  do {
    const response = await callMCPTool('list_workflows', {
      instance,
      limit: 100,
      cursor
    });

    const result = JSON.parse(response.content[0].text);
    allWorkflows.push(...result.data);
    cursor = result.nextCursor;
  } while (cursor);

  return allWorkflows;
}

// Usage
const workflows = await getAllWorkflows('production');
console.log(`Total workflows: ${workflows.length}`);
```

---

### Error Responses

**Instance Not Found (400):**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32602,
    "message": "Instance 'nonexistent' not found. Available: production, staging, development"
  }
}
```

**Authentication Failed (401):**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32000,
    "message": "API call failed for instance 'production': Authentication failed. Check API key."
  }
}
```

**Invalid Parameters (400):**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32602,
    "message": "Invalid limit: must be between 1 and 250"
  }
}
```

**Network Error:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32000,
    "message": "Connection timeout after 30000ms. Check n8n instance availability."
  }
}
```

---

### Rate Limiting

**n8n API Limits:**

- No official published rate limits for self-hosted instances
- Recommended: <100 requests/second per instance
- Large result sets may timeout (use pagination with smaller limits)

**Best Practices:**

- Use `limit` parameter to control response size
- Implement exponential backoff on errors
- Cache results when appropriate (TTL: 1-5 minutes)
- Use filters (`active`, `tags`) to reduce result size

---

### Code Examples

**JavaScript/TypeScript:**

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';

const client = new Client({
  name: 'n8n-workflow-manager',
  version: '1.0.0'
});

await client.connect(transport);

// List active production workflows
const response = await client.callTool({
  name: 'list_workflows',
  arguments: {
    instance: 'production',
    active: true,
    limit: 50
  }
});

const result = JSON.parse(response.content[0].text);
console.log(`Found ${result.data.length} active workflows`);

result.data.forEach((workflow: any) => {
  console.log(`- ${workflow.name} (${workflow.nodes} nodes)`);
});
```

**Python:**

```python
import json
import subprocess

def list_workflows(instance=None, active=None, tags=None, limit=100):
    """List workflows using MCP server."""
    request = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "tools/call",
        "params": {
            "name": "list_workflows",
            "arguments": {
                "instance": instance,
                "active": active,
                "tags": tags,
                "limit": limit
            }
        }
    }

    # Remove None values
    request["params"]["arguments"] = {
        k: v for k, v in request["params"]["arguments"].items()
        if v is not None
    }

    # Send to MCP server via stdio
    result = subprocess.run(
        ['npx', '@kernel.salacoste/n8n-workflow-builder'],
        input=json.dumps(request),
        capture_output=True,
        text=True
    )

    response = json.loads(result.stdout)
    return json.loads(response['result']['content'][0]['text'])

# Usage
workflows = list_workflows(instance='production', active=True)
print(f"Found {len(workflows['data'])} workflows")

for wf in workflows['data']:
    print(f"  - {wf['name']} ({wf['nodes']} nodes)")
```

**Shell (curl):**

```bash
#!/bin/bash

# List workflows via HTTP MCP server
curl -X POST http://localhost:3456/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "list_workflows",
      "arguments": {
        "instance": "production",
        "active": true,
        "limit": 50
      }
    }
  }' | jq '.result.content[0].text | fromjson'
```

---

### Best Practices

**1. Use Server-Side Filtering:**

```typescript
// ✅ Good: Filter on server side
const activeWorkflows = await client.callTool({
  name: 'list_workflows',
  arguments: { active: true, instance: 'production' }
});

// ❌ Avoid: Fetch all and filter client-side
const all = await client.callTool({
  name: 'list_workflows',
  arguments: { instance: 'production' }
});
const active = all.data.filter(w => w.active);  // Wasteful!
```

**2. Implement Proper Pagination:**

```typescript
// ✅ Good: Paginate through large result sets
let cursor: string | undefined;
const workflows: WorkflowMetadata[] = [];

do {
  const page = await list({ limit: 100, cursor });
  workflows.push(...page.data);
  cursor = page.nextCursor;
} while (cursor);

// ❌ Avoid: Requesting everything at once
const all = await list({ limit: 9999 });  // May timeout or crash
```

**3. Cache Results Appropriately:**

```typescript
// ✅ Good: Cache with TTL for frequently accessed data
import { LRUCache } from 'lru-cache';

const workflowCache = new LRUCache<string, WorkflowMetadata[]>({
  max: 100,
  ttl: 60_000  // 1 minute
});

async function getCachedWorkflows(instance: string): Promise<WorkflowMetadata[]> {
  const cacheKey = `workflows-${instance}`;

  if (workflowCache.has(cacheKey)) {
    return workflowCache.get(cacheKey)!;
  }

  const response = await list({ instance });
  workflowCache.set(cacheKey, response.data);
  return response.data;
}
```

---

## create_workflow

Create a new workflow in an n8n instance programmatically.

### Purpose

Create workflows with nodes, connections, and configuration using schema-driven approach.

### Use Cases

- Workflow templates and generators
- CI/CD pipeline deployment
- Bulk workflow creation from templates
- Cross-instance workflow cloning
- Automated workflow provisioning

---

### Request

**MCP Tool Name:** `create_workflow`

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| instance | string | No | Instance identifier |
| name | string | Yes | Workflow name (unique recommended) |
| nodes | Node[] | Yes | Array of workflow nodes (minimum 1) |
| connections | Connections | No | Node connections (optional if single node) |
| settings | object | No | Workflow settings (timezone, error workflow, etc.) |
| staticData | object | No | Static workflow data |
| tags | string[] | No | Tag IDs to assign (must exist) |
| active | boolean | No | Activate after creation (default: false) |

**TypeScript Interface:**

```typescript
interface CreateWorkflowParams {
  instance?: string;
  name: string;
  nodes: Node[];
  connections?: Connections;
  settings?: WorkflowSettings;
  staticData?: Record<string, any>;
  tags?: string[];
  active?: boolean;
}

interface Node {
  name: string;              // Unique within workflow
  type: string;              // e.g., "n8n-nodes-base.webhook"
  typeVersion: number;       // Node type version
  position: [number, number]; // [x, y] coordinates
  parameters?: Record<string, any>;
  credentials?: Record<string, CredentialReference>;
}

interface CredentialReference {
  id: string;
  name: string;
}

interface Connections {
  [nodeName: string]: {
    main: Array<Array<{
      node: string;
      type: string;
      index: number;
    }>>;
  };
}

interface WorkflowSettings {
  timezone?: string;
  errorWorkflow?: string;
  callerPolicy?: string;
  saveExecutionProgress?: boolean;
  saveManualExecutions?: boolean;
  saveDataErrorExecution?: 'all' | 'none';
  saveDataSuccessExecution?: 'all' | 'none';
  executionTimeout?: number;
}
```

**JSON Request Example:**

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "create_workflow",
    "arguments": {
      "instance": "staging",
      "name": "Customer Welcome Email",
      "nodes": [
        {
          "name": "Webhook",
          "type": "n8n-nodes-base.webhook",
          "typeVersion": 1,
          "position": [250, 300],
          "parameters": {
            "path": "customer-welcome",
            "responseMode": "onReceived",
            "httpMethod": "POST"
          }
        },
        {
          "name": "Send Email",
          "type": "n8n-nodes-base.emailSend",
          "typeVersion": 2,
          "position": [450, 300],
          "parameters": {
            "fromEmail": "welcome@company.com",
            "toEmail": "={{ $json.email }}",
            "subject": "Welcome to Our Platform!",
            "text": "Hi {{ $json.name }},\\n\\nWelcome to our platform!"
          },
          "credentials": {
            "smtp": {
              "id": "1",
              "name": "Company SMTP"
            }
          }
        }
      ],
      "connections": {
        "Webhook": {
          "main": [[{
            "node": "Send Email",
            "type": "main",
            "index": 0
          }]]
        }
      },
      "settings": {
        "timezone": "America/New_York",
        "saveManualExecutions": true
      },
      "active": false
    }
  }
}
```

---

### Response

**Success Response:**

Returns complete workflow definition including generated ID and timestamps.

**TypeScript Interface:**

```typescript
interface CreateWorkflowResponse {
  id: string;
  name: string;
  active: boolean;
  nodes: Node[];
  connections: Connections;
  createdAt: string;
  updatedAt: string;
  tags?: Tag[];
  settings?: WorkflowSettings;
  staticData?: Record<string, any>;
}
```

**JSON Example:**

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "content": [{
      "type": "text",
      "text": "{
  \"id\": \"789\",
  \"name\": \"Customer Welcome Email\",
  \"active\": false,
  \"nodes\": [...],
  \"connections\": {...},
  \"createdAt\": \"2025-01-15T10:00:00Z\",
  \"updatedAt\": \"2025-01-15T10:00:00Z\",
  \"settings\": {
    \"timezone\": \"America/New_York\"
  }
}"
    }]
  }
}
```

---

### Validation Rules

**Required Fields:**

- `name`: Non-empty string (recommended: descriptive and unique)
- `nodes`: Array with at least 1 node

**Node Validation:**

- Each node MUST have: `name`, `type`, `typeVersion`, `position`
- Node names MUST be unique within workflow
- Position MUST be `[x, y]` array of numbers
- Valid node types from n8n (e.g., `n8n-nodes-base.webhook`)

**Connection Validation:**

- Source and target nodes MUST exist in `nodes` array
- Connection indices MUST be valid (typically 0)
- Connection types typically `"main"`

**Activation Validation:**

- If `active: true`, workflow MUST have valid trigger node
- ❌ `manualTrigger` NOT accepted by n8n API (Epic 1 limitation)
- ✅ Valid triggers: `scheduleTrigger`, `webhook`, service-specific triggers
- Server automatically adds valid trigger if missing during activation

---

### Error Responses

**Validation Error:**

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "error": {
    "code": -32602,
    "message": "Workflow validation failed: node 'Process Data' references non-existent node 'Invalid Node'"
  }
}
```

**Invalid Node Type:**

```json
{
  "error": {
    "code": -32000,
    "message": "Unknown node type: 'n8n-nodes-base.invalidNode'"
  }
}
```

**Duplicate Node Names:**

```json
{
  "error": {
    "code": -32602,
    "message": "Duplicate node names found: 'HTTP Request' appears 2 times"
  }
}
```

**Missing Required Trigger:**

```json
{
  "error": {
    "code": -32000,
    "message": "Cannot activate workflow: missing valid trigger node"
  }
}
```

---

### Code Examples

**TypeScript - Webhook Workflow Generator:**

```typescript
function generateWebhookWorkflow(
  name: string,
  webhookPath: string,
  action: string
): CreateWorkflowParams {
  return {
    name,
    nodes: [
      {
        name: 'Webhook',
        type: 'n8n-nodes-base.webhook',
        typeVersion: 1,
        position: [250, 300],
        parameters: {
          path: webhookPath,
          responseMode: 'onReceived',
          httpMethod: 'POST'
        }
      },
      {
        name: 'Process',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [450, 300],
        parameters: {
          mode: 'runOnceForAllItems',
          jsCode: `// ${action}\nreturn $input.all();`
        }
      },
      {
        name: 'Respond',
        type: 'n8n-nodes-base.respondToWebhook',
        typeVersion: 1,
        position: [650, 300],
        parameters: {
          respondWith: 'json',
          responseBody: '={{ $json }}'
        }
      }
    ],
    connections: {
      'Webhook': {
        main: [[{ node: 'Process', type: 'main', index: 0 }]]
      },
      'Process': {
        main: [[{ node: 'Respond', type: 'main', index: 0 }]]
      }
    },
    active: false
  };
}

// Usage
const workflow = generateWebhookWorkflow(
  'Order Processing',
  'process-order',
  'Validate and store order data'
);

const result = await client.callTool({
  name: 'create_workflow',
  arguments: workflow
});

console.log(`Created workflow ${result.id}`);
```

**TypeScript - Scheduled Workflow:**

```typescript
function generateScheduledWorkflow(
  name: string,
  cronExpression: string,
  action: string
): CreateWorkflowParams {
  return {
    name,
    nodes: [
      {
        name: 'Schedule',
        type: 'n8n-nodes-base.scheduleTrigger',
        typeVersion: 1,
        position: [250, 300],
        parameters: {
          rule: {
            interval: [{
              field: 'cronExpression',
              expression: cronExpression
            }]
          }
        }
      },
      {
        name: 'Execute Task',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [450, 300],
        parameters: {
          jsCode: `// ${action}\nreturn [{ json: { executed: true, timestamp: new Date() } }];`
        }
      }
    ],
    connections: {
      'Schedule': {
        main: [[{ node: 'Execute Task', type: 'main', index: 0 }]]
      }
    },
    settings: {
      timezone: 'America/New_York'
    },
    active: false
  };
}

// Create daily backup at 2 AM
const backup = generateScheduledWorkflow(
  'Daily Backup',
  '0 2 * * *',
  'Backup data to cloud storage'
);

await client.callTool({
  name: 'create_workflow',
  arguments: backup
});
```

---

### Best Practices

**1. Validate Before Creating:**

```typescript
function validateWorkflow(workflow: CreateWorkflowParams): void {
  // Check required fields
  if (!workflow.name) {
    throw new Error('Workflow name is required');
  }

  if (!workflow.nodes || workflow.nodes.length === 0) {
    throw new Error('At least one node is required');
  }

  // Check for duplicate node names
  const names = workflow.nodes.map(n => n.name);
  const duplicates = names.filter((n, i) => names.indexOf(n) !== i);
  if (duplicates.length > 0) {
    throw new Error(`Duplicate node names: ${duplicates.join(', ')}`);
  }

  // Validate connections reference existing nodes
  if (workflow.connections) {
    for (const [source, conn] of Object.entries(workflow.connections)) {
      if (!names.includes(source)) {
        throw new Error(`Connection source '${source}' not found`);
      }
      for (const targets of conn.main) {
        for (const target of targets) {
          if (!names.includes(target.node)) {
            throw new Error(`Connection target '${target.node}' not found`);
          }
        }
      }
    }
  }

  // Check for trigger node if active
  if (workflow.active) {
    const hasTrigger = workflow.nodes.some(node =>
      node.type.includes('Trigger') || node.type.includes('webhook')
    );
    if (!hasTrigger) {
      throw new Error('Active workflows require a trigger node');
    }
  }
}

// Usage
try {
  validateWorkflow(myWorkflow);
  await createWorkflow(myWorkflow);
} catch (error) {
  console.error('Validation failed:', error.message);
}
```

**2. Test in Staging First:**

```typescript
// Multi-stage deployment pattern
async function deployWorkflow(workflow: CreateWorkflowParams) {
  // Stage 1: Create in staging
  console.log('Creating workflow in staging...');
  const staging = await createWorkflow({
    ...workflow,
    instance: 'staging',
    active: false
  });

  console.log(`Staging workflow created: ${staging.id}`);

  // Stage 2: Test in staging
  console.log('Testing in staging...');
  await activateWorkflow(staging.id, 'staging');
  await testWorkflow(staging.id, 'staging');

  // Stage 3: Deploy to production
  console.log('Deploying to production...');
  const production = await createWorkflow({
    ...workflow,
    instance: 'production',
    active: false  // Keep inactive for review
  });

  console.log(`Production workflow created: ${production.id}`);
  console.log('Review workflow before activation');

  return { staging: staging.id, production: production.id };
}
```

**3. Use Connection Transformation Utilities:**

```typescript
import { transformConnectionsForN8N } from './utils/validation';

// If using array format (easier to work with)
const arrayConnections = [
  { source: 'Node1', target: 'Node2', sourceOutput: 0, targetInput: 0 },
  { source: 'Node2', target: 'Node3', sourceOutput: 0, targetInput: 0 }
];

// Transform to n8n's object format
const workflow: CreateWorkflowParams = {
  name: 'My Workflow',
  nodes: [...],
  connections: transformConnectionsForN8N(arrayConnections)
};
```

---

## get_workflow

Retrieve complete workflow definition including all nodes, connections, and settings.

### Request

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| instance | string | No | Instance identifier |
| id | string | Yes | Workflow ID |

### Response

Returns complete `WorkflowDefinition` object (same structure as create_workflow response).

### Code Example

```typescript
const workflow = await client.callTool({
  name: 'get_workflow',
  arguments: {
    instance: 'production',
    id: '123'
  }
});

const wf = JSON.parse(workflow.content[0].text);
console.log(`Workflow: ${wf.name}`);
console.log(`Nodes: ${wf.nodes.length}`);
console.log(`Active: ${wf.active}`);
```

---

## update_workflow

Modify an existing workflow (supports PATCH semantics).

### Request

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| instance | string | No | Instance identifier |
| id | string | Yes | Workflow ID to update |
| name | string | No | New workflow name |
| nodes | Node[] | No | Updated nodes array |
| connections | Connections | No | Updated connections |
| settings | object | No | Updated settings |
| active | boolean | No | Update active status |

**Note:** Only provide fields you want to update. Omitted fields remain unchanged.

### Code Example

```typescript
// Update workflow name and settings
await client.callTool({
  name: 'update_workflow',
  arguments: {
    instance: 'production',
    id: '123',
    name: 'Updated Workflow Name',
    settings: {
      timezone: 'America/Los_Angeles'
    }
  }
});
```

---

## delete_workflow

Permanently remove a workflow from an instance.

### Request

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| instance | string | No | Instance identifier |
| id | string | Yes | Workflow ID to delete |

### Response

Returns confirmation message on success.

### Code Example

```typescript
await client.callTool({
  name: 'delete_workflow',
  arguments: {
    instance: 'staging',
    id: '456'
  }
});

console.log('Workflow deleted successfully');
```

**Warning:** This operation is permanent and cannot be undone. Backup workflows before deletion.

---

## activate_workflow

Enable a workflow for automatic execution.

### Request

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| instance | string | No | Instance identifier |
| id | string | Yes | Workflow ID to activate |

### Validation

- Workflow must have valid trigger node
- ❌ `manualTrigger` not valid (Epic 1 limitation)
- ✅ Valid: `scheduleTrigger`, `webhook`, service triggers
- Server automatically adds schedule trigger if missing

### Code Example

```typescript
// Activate workflow
const result = await client.callTool({
  name: 'activate_workflow',
  arguments: {
    instance: 'production',
    id: '789'
  }
});

console.log('Workflow activated successfully');
```

---

## deactivate_workflow

Disable a workflow to stop automatic execution.

### Request

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| instance | string | No | Instance identifier |
| id | string | Yes | Workflow ID to deactivate |

### Code Example

```typescript
await client.callTool({
  name: 'deactivate_workflow',
  arguments: {
    instance: 'production',
    id: '789'
  }
});

console.log('Workflow deactivated');
```

---

## execute_workflow

Manually trigger workflow execution.

### Limitation (Epic 1)

**Important:** Workflows with only `manualTrigger` nodes CANNOT be executed via REST API in n8n v1.82.3.

**Workarounds:**

1. Use n8n web interface for manual execution
2. Add webhook or schedule trigger for API execution
3. Use test execution in n8n UI

### Request

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| instance | string | No | Instance identifier |
| id | string | Yes | Workflow ID to execute |

### Response

If workflow has manual trigger only, returns helpful guidance instead of error.

---

## Next Steps

- **[Executions API Reference](executions-api.md)** - Manage and debug workflow executions
- **[Credentials API Reference](credentials-api.md)** - Schema-driven credential creation
- **[Tags API Reference](tags-api.md)** - Organize workflows with tags
- **[API Architecture Overview](overview.md)** - System architecture and components

---

**Document Version:** 1.0
**Last Updated:** January 2025
**Related Epic:** Epic 4 (Workflows Management Tools)
