# Story 7.6: Resources & Prompts API Reference Documentation

**Epic:** Epic 7 - API Reference Documentation
**Story Points:** 4
**Priority:** Medium
**Status:** Ready for Implementation
**Estimated Page Count:** 8-10 pages

---

## User Story

**As a** developer integrating MCP resources and prompts
**I want** complete API reference for resource access and prompt templates
**So that** I can programmatically discover workflows and generate from templates

---

## Story Description

### Enhancement

Create Resources & Prompts API reference documenting:
- **Resources** - 4 resource URIs (2 static, 2 dynamic)
- **Prompts** - 5 workflow generation templates

---

## Acceptance Criteria

### AC1: Resources API Documentation

**Document:** `docs/api/resources-prompts-api.md`

```markdown
# Resources & Prompts API Reference

## MCP Resources

### Static Resources

#### Resource: n8n://workflows

List all workflows (metadata only).

**URI:** `n8n://workflows`

**Query Parameters:**
- `instance` (optional): Instance identifier

**Response:**

\`\`\`typescript
interface WorkflowsResource {
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
\`\`\`

**Equivalent Tool:** `list_workflows`

---

#### Resource: n8n://execution-stats

Execution statistics summary.

**URI:** `n8n://execution-stats`

**Response:**

\`\`\`typescript
interface ExecutionStatsResource {
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
  timeRange: { from: string; to: string };
  generatedAt: string;
}
\`\`\`

---

### Dynamic Resources

#### Resource: n8n://workflows/{id}

Get specific workflow details.

**URI Pattern:** `n8n://workflows/{workflowId}`

**Parameters:**
- `{workflowId}`: Workflow ID
- Query: `instance` (optional)

**Equivalent Tool:** `get_workflow`

---

#### Resource: n8n://executions/{id}

Get specific execution details.

**URI Pattern:** `n8n://executions/{executionId}`

**Equivalent Tool:** `get_execution`

---

## MCP Prompts

### Prompt Templates

The MCP server provides 5 workflow generation prompts.

#### 1. schedule-triggered-workflow

**Arguments:**

\`\`\`typescript
{
  workflow_name: string;
  cron_schedule: string;
  action_description: string;
  timezone?: string;
}
\`\`\`

#### 2. http-webhook-workflow

**Arguments:**

\`\`\`typescript
{
  workflow_name: string;
  webhook_path: string;
  response_mode?: 'onReceived' | 'lastNode';
  processing_description: string;
}
\`\`\`

#### 3. data-transformation-workflow

**Arguments:**

\`\`\`typescript
{
  workflow_name: string;
  source_description: string;
  transformation_description: string;
  destination_description: string;
}
\`\`\`

#### 4. external-service-integration

**Arguments:**

\`\`\`typescript
{
  workflow_name: string;
  service_name: string;
  trigger_description: string;
  action_description: string;
}
\`\`\`

#### 5. api-data-polling

**Arguments:**

\`\`\`typescript
{
  workflow_name: string;
  api_endpoint: string;
  poll_interval: string;
  data_processing: string;
}
\`\`\`

---

## Code Examples

**List Available Prompts:**

\`\`\`typescript
const prompts = await client.listPrompts();
console.log('Available prompts:', prompts.map(p => p.name));
\`\`\`

**Generate from Prompt:**

\`\`\`typescript
const workflow = await client.getPrompt({
  name: 'http-webhook-workflow',
  arguments: {
    workflow_name: 'Order Processor',
    webhook_path: 'process-order',
    processing_description: 'Validate and store order'
  }
});

// Create workflow from template
await client.callTool({
  name: 'create_workflow',
  arguments: JSON.parse(workflow.messages[0].content.text)
});
\`\`\`

---

## Next Steps

- [Complete API Reference Index](./api-index.md)
- [OpenAPI Specification](./openapi.yaml)
```

---

## Dependencies

### Upstream Dependencies
- Story 7.1 (Architecture)
- Epic 4 Story 4.5 (Resources Documentation)

---

## Definition of Done

- [ ] 4 resources documented
- [ ] 5 prompts documented
- [ ] Code examples provided
- [ ] Resource vs tool comparison

---

## Estimation Breakdown

**Story Points:** 4
**Page Count:** 8-10 pages
**Duration:** 2 days

---

**Status:** Ready for Implementation
