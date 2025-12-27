# Story 7.2: Workflows API Reference Documentation

**Epic:** Epic 7 - API Reference Documentation
**Story Points:** 6
**Priority:** High
**Status:** Ready for Implementation
**Estimated Page Count:** 12-16 pages

---

## User Story

**As a** developer working with the n8n MCP server API
**I want** complete API reference for all workflow operations
**So that** I can programmatically create, manage, and deploy n8n workflows

---

## Story Description

### Current System

With Story 7.1 completed:
- ✅ Architecture overview documented
- ✅ System components explained
- ❌ No detailed API reference for workflows
- ❌ No request/response schemas
- ❌ No code examples for each endpoint
- ❌ No error response documentation

### Enhancement

Create comprehensive Workflows API reference documentation covering all 8 workflow operations:
- **list_workflows** - List workflows with filtering and pagination
- **get_workflow** - Get complete workflow definition
- **create_workflow** - Create new workflow
- **update_workflow** - Update existing workflow
- **delete_workflow** - Delete workflow
- **activate_workflow** - Enable workflow execution
- **deactivate_workflow** - Disable workflow execution
- **execute_workflow** - Manual workflow execution (with limitations)

Each operation documented with:
- Purpose and use cases
- Request parameters (required/optional)
- Response schema
- TypeScript interfaces
- Code examples (multiple languages)
- Error responses
- Rate limiting
- Best practices

---

## Acceptance Criteria

### AC1: list_workflows API Reference
**Given** developers wanting to list workflows
**When** reading the API reference
**Then** they should have complete documentation:

#### 1.1 list_workflows Documentation

**Document:** `docs/api/workflows-api.md#list_workflows`

```markdown
# Workflows API Reference

Complete API reference for all workflow operations (8 methods).

---

## list_workflows

List workflows with optional filtering and pagination.

### Purpose

Retrieve workflow metadata from an n8n instance. This operation returns streamlined metadata only (no full node definitions) for performance (Epic 2 optimization).

### Use Cases

- Dashboard workflow listing
- Inventory management
- Finding workflows by tag
- Monitoring active workflows
- Pre-flight checks before operations

---

### Request

**MCP Tool Name:** `list_workflows`

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| instance | string | No | Instance identifier (uses default if not provided) |
| active | boolean | No | Filter by active status |
| tags | string[] | No | Filter by tag names (AND logic) |
| limit | number | No | Max workflows to return (1-250, default: 100) |
| cursor | string | No | Pagination cursor from previous response |

**TypeScript Interface:**

\`\`\`typescript
interface ListWorkflowsParams {
  instance?: string;
  active?: boolean;
  tags?: string[];
  limit?: number;
  cursor?: string;
}
\`\`\`

**JSON-RPC Request:**

\`\`\`json
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
\`\`\`

---

### Response

**Success Response:**

**TypeScript Interface:**

\`\`\`typescript
interface WorkflowListResponse {
  data: Array<{
    id: string;
    name: string;
    active: boolean;
    createdAt: string;      // ISO 8601
    updatedAt: string;      // ISO 8601
    nodes?: number;         // Node count (if available)
    tags?: Array<{
      id: string;
      name: string;
    }>;
  }>;
  nextCursor?: string;      // Present if more data available
}
\`\`\`

**JSON Example:**

\`\`\`json
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
\`\`\`

**Field Descriptions:**

- **id**: Unique workflow identifier
- **name**: Workflow name (user-defined)
- **active**: Whether workflow is enabled for execution
- **createdAt**: Workflow creation timestamp (UTC)
- **updatedAt**: Last modification timestamp (UTC)
- **nodes**: Number of nodes in workflow (performance optimization)
- **tags**: Array of associated tags
- **nextCursor**: Opaque pagination cursor (base64 encoded)

---

### Pagination

**Cursor-Based Pagination:**

Workflows API uses cursor-based pagination (not offset-based) for stability when data changes.

**First Page:**

\`\`\`json
{
  "limit": 50
}
\`\`\`

**Subsequent Pages:**

\`\`\`json
{
  "limit": 50,
  "cursor": "eyJvZmZzZXQiOjUwfQ=="
}
\`\`\`

**Complete Pagination Example:**

\`\`\`typescript
async function getAllWorkflows(instance?: string): Promise<Workflow[]> {
  const allWorkflows: Workflow[] = [];
  let cursor: string | undefined;

  do {
    const response = await callMCPTool('list_workflows', {
      instance,
      limit: 100,
      cursor
    });

    allWorkflows.push(...response.data);
    cursor = response.nextCursor;
  } while (cursor);

  return allWorkflows;
}
\`\`\`

---

### Error Responses

**Instance Not Found (400):**

\`\`\`json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32602,
    "message": "Instance 'nonexistent' not found. Available: production, staging"
  }
}
\`\`\`

**Authentication Failed (401):**

\`\`\`json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32000,
    "message": "API call failed for instance 'production': Authentication failed"
  }
}
\`\`\`

**Invalid Parameters (400):**

\`\`\`json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32602,
    "message": "Invalid limit: must be between 1 and 250"
  }
}
\`\`\`

---

### Rate Limiting

**n8n API Limits:**
- No official published rate limits
- Recommended: <100 requests/second per instance
- Large result sets may timeout (use pagination)

**Best Practices:**
- Use `limit` parameter to control response size
- Implement exponential backoff on errors
- Cache results when appropriate

---

### Code Examples

**JavaScript/TypeScript:**

\`\`\`typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';

const client = new Client({
  name: 'n8n-workflow-manager',
  version: '1.0.0'
});

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
\`\`\`

**Python:**

\`\`\`python
import json
import subprocess

def list_workflows(instance=None, active=None, limit=100):
    request = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "tools/call",
        "params": {
            "name": "list_workflows",
            "arguments": {
                "instance": instance,
                "active": active,
                "limit": limit
            }
        }
    }

    # Send to MCP server via stdio
    result = subprocess.run(
        ['npx', '@bmad-labs/mcp-n8n-workflow-builder'],
        input=json.dumps(request),
        capture_output=True,
        text=True
    )

    response = json.loads(result.stdout)
    return json.loads(response['result']['content'][0]['text'])

# Usage
workflows = list_workflows(instance='production', active=True)
print(f"Found {len(workflows['data'])} workflows")
\`\`\`

---

### Best Practices

**1. Use Appropriate Filters:**

\`\`\`typescript
// ✅ Good: Filter on server side
const active = await list({ active: true });

// ❌ Avoid: Filter on client side
const all = await list({});
const active = all.filter(w => w.active);
\`\`\`

**2. Implement Pagination:**

\`\`\`typescript
// ✅ Good: Paginate through results
let cursor;
do {
  const page = await list({ limit: 100, cursor });
  processWorkflows(page.data);
  cursor = page.nextCursor;
} while (cursor);

// ❌ Avoid: Requesting all at once
const all = await list({ limit: 9999 });  // May timeout/crash
\`\`\`

**3. Cache Results:**

\`\`\`typescript
// ✅ Good: Cache workflow list
const cache = new Map();
const cacheKey = `${instance}-${active}`;

if (cache.has(cacheKey)) {
  return cache.get(cacheKey);
}

const workflows = await list({ instance, active });
cache.set(cacheKey, workflows, { ttl: 60000 });  // 1 minute
return workflows;
\`\`\`

---

## create_workflow

Create a new workflow in an n8n instance.

### Purpose

Programmatically create workflows with nodes, connections, and configuration.

### Use Cases

- Workflow templates and generators
- CI/CD workflow deployment
- Bulk workflow creation
- Workflow cloning across instances

---

### Request

**MCP Tool Name:** `create_workflow`

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| instance | string | No | Instance identifier |
| name | string | Yes | Workflow name |
| nodes | Node[] | Yes | Array of workflow nodes |
| connections | Connections | No | Node connections |
| settings | object | No | Workflow settings |
| staticData | object | No | Static workflow data |
| tags | string[] | No | Tag IDs to assign |
| active | boolean | No | Activate after creation (default: false) |

**TypeScript Interface:**

\`\`\`typescript
interface CreateWorkflowParams {
  instance?: string;
  name: string;
  nodes: Array<{
    name: string;
    type: string;
    typeVersion: number;
    position: [number, number];
    parameters?: Record<string, any>;
    credentials?: Record<string, { id: string; name: string }>;
  }>;
  connections?: {
    [nodeName: string]: {
      main: Array<Array<{
        node: string;
        type: string;
        index: number;
      }>>;
    };
  };
  settings?: {
    timezone?: string;
    errorWorkflow?: string;
    callerPolicy?: string;
  };
  staticData?: Record<string, any>;
  tags?: string[];
  active?: boolean;
}
\`\`\`

**JSON Example:**

\`\`\`json
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
            "responseMode": "onReceived"
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
            "subject": "Welcome!",
            "text": "Welcome to our platform, {{ $json.name }}!"
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
      "active": false
    }
  }
}
\`\`\`

---

### Response

**Success Response:**

Returns complete workflow definition including generated ID.

\`\`\`typescript
interface CreateWorkflowResponse {
  id: string;
  name: string;
  active: boolean;
  nodes: Node[];
  connections: Connections;
  createdAt: string;
  updatedAt: string;
  tags?: Tag[];
  settings?: object;
  staticData?: object;
}
\`\`\`

**JSON Example:**

\`\`\`json
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
  \"updatedAt\": \"2025-01-15T10:00:00Z\"
}"
    }]
  }
}
\`\`\`

---

### Validation Rules

**Required Fields:**
- `name`: Non-empty string
- `nodes`: Array with at least 1 node

**Node Validation:**
- Each node must have: name, type, typeVersion, position
- Node names must be unique within workflow
- Position must be `[x, y]` array of numbers

**Connection Validation:**
- Referenced nodes must exist
- Connection indices must be valid

**Activation Validation:**
- If `active: true`, workflow must have valid trigger node
- manualTrigger NOT accepted (Epic 1 limitation)
- Valid triggers: scheduleTrigger, webhook, service triggers

---

### Error Responses

**Validation Error:**

\`\`\`json
{
  "jsonrpc": "2.0",
  "id": 2,
  "error": {
    "code": -32602,
    "message": "Workflow validation failed: missing required trigger node"
  }
}
\`\`\`

**Invalid Node Type:**

\`\`\`json
{
  "error": {
    "code": -32000,
    "message": "Unknown node type: 'n8n-nodes-base.invalid'"
  }
}
\`\`\`

---

### Code Examples

**TypeScript - Template Generator:**

\`\`\`typescript
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
          responseMode: 'onReceived'
        }
      },
      {
        name: 'Process',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [450, 300],
        parameters: {
          jsCode: `// ${action}\\nreturn $input.all();`
        }
      }
    ],
    connections: {
      'Webhook': {
        main: [[{ node: 'Process', type: 'main', index: 0 }]]
      }
    },
    active: false
  };
}

// Usage
const workflow = generateWebhookWorkflow(
  'Order Processing',
  'process-order',
  'Validate and store order'
);

await client.callTool({
  name: 'create_workflow',
  arguments: workflow
});
\`\`\`

---

### Best Practices

**1. Validate Before Creating:**

\`\`\`typescript
function validateWorkflow(workflow: CreateWorkflowParams): void {
  if (!workflow.name) throw new Error('Name required');
  if (!workflow.nodes || workflow.nodes.length === 0) {
    throw new Error('At least one node required');
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
}
\`\`\`

**2. Test in Staging First:**

\`\`\`typescript
// Create in staging
const staging = await create({ instance: 'staging', ...workflow });

// Test execution
await testWorkflow(staging.id, 'staging');

// If successful, deploy to production
const production = await create({ instance: 'production', ...workflow });
\`\`\`

**3. Use Connection Transformation:**

\`\`\`typescript
import { transformConnectionsForN8N } from './utils/validation';

// If using array format
const arrayConnections = [
  { source: 'Node1', target: 'Node2', sourceOutput: 0, targetInput: 0 }
];

// Transform to n8n format
workflow.connections = transformConnectionsForN8N(arrayConnections);
\`\`\`

---

## Additional Workflow Operations

The following operations follow similar documentation patterns:

- **get_workflow** - Retrieve complete workflow definition
- **update_workflow** - Modify existing workflow (PATCH support)
- **delete_workflow** - Permanently remove workflow
- **activate_workflow** - Enable workflow for execution
- **deactivate_workflow** - Disable workflow execution
- **execute_workflow** - Manual execution (with limitations)

[Full documentation for each operation continues...]
```

---

## Technical Implementation Notes

### Documentation Structure

```
docs/api/
└── workflows-api.md
    ├── list_workflows
    ├── get_workflow
    ├── create_workflow
    ├── update_workflow
    ├── delete_workflow
    ├── activate_workflow
    ├── deactivate_workflow
    └── execute_workflow
```

### Code Example Languages

- TypeScript (primary)
- Python
- JavaScript
- Shell/curl (for HTTP examples)

---

## Dependencies

### Upstream Dependencies
- Story 7.1 (Architecture Overview)
- Epic 2 (API Implementation) - Actual API behavior
- Epic 4 Story 4.1 (Workflows Tools) - Tool specifications

### Downstream Dependencies
- Stories 7.3-7.6 (Other API references)
- Epic 8 (Deployment) - API usage in production

---

## Definition of Done

### Documentation Completeness
- [ ] All 8 workflow operations documented
- [ ] Request/response schemas for each
- [ ] TypeScript interfaces defined
- [ ] Code examples in 3+ languages
- [ ] Error responses documented
- [ ] Best practices included

### Quality Standards
- [ ] Technical review by development team
- [ ] All examples tested and work
- [ ] Schemas match implementation
- [ ] Cross-references to related docs

---

## Estimation Breakdown

**Story Points:** 6

**Effort Distribution:**
- list_workflows documentation: 0.75 SP
- create_workflow documentation: 1 SP
- get_workflow documentation: 0.75 SP
- update_workflow documentation: 0.75 SP
- Other operations (4): 1.5 SP
- Code examples & testing: 1.25 SP

**Page Count:** 12-16 pages

**Estimated Duration:** 3 days (1 technical writer)

---

## Notes

### Success Metrics
- Developers successfully use API without questions
- Code examples work without modification
- Error handling is clear
- API usage increases

### Best Practices
- ✅ Show complete request/response examples
- ✅ Include TypeScript interfaces
- ✅ Document all error conditions
- ✅ Provide code examples in multiple languages
- ✅ Link to related operations

---

**Status:** Ready for Implementation
**Related Files:**
- `docs/api/workflows-api.md`
