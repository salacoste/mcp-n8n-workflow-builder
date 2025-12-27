# Story 4.5: MCP Resources Documentation

**Epic:** Epic 4 - Core Features & Tools Reference Documentation
**Story Points:** 6
**Priority:** Medium
**Status:** Ready for Implementation
**Estimated Page Count:** 8-10 pages

---

## User Story

**As a** Claude Desktop user integrating the n8n MCP server
**I want** comprehensive documentation on MCP resources and prompt templates
**So that** I can discover available workflow templates and understand how resources complement the tool-based API

---

## Story Description

### Current System

The n8n MCP server currently provides:
- **17 MCP Tools** for direct workflow/execution/credential/tag management
- **MCP Resources** for data discovery and listing (4 resource types)
- **MCP Prompts** for template-based workflow generation (5 predefined templates)

However, resources and prompts are less documented than tools, leading to:
- Users primarily using tools without knowing about resource alternatives
- Undiscovered prompt templates that could accelerate workflow creation
- Confusion about when to use resources vs. tools
- Missing documentation on prompt variable substitution

### Enhancement

Create comprehensive reference documentation that:
- Explains MCP resources concept and how they complement tools
- Documents all 4 resource types (static and dynamic templates)
- Details all 5 workflow prompt templates with variable systems
- Provides Claude Desktop conversation examples for resource usage
- Cross-references resources with equivalent tool operations
- Explains prompt-based workflow generation workflow

### Context from Previous Epics

**Epic 1 (URL Configuration):**
- Resources use normalized URLs from EnvironmentManager
- Multi-instance routing applies to resource fetching

**Epic 2 (API Implementation):**
- Resources fetch data through same N8NApiWrapper as tools
- Performance optimizations (list_workflows metadata) apply to `/workflows` resource

**Epic 5 (Multi-Instance):**
- Resources support instance parameter for multi-environment access
- Resource URIs include instance identifier when appropriate

---

## Acceptance Criteria

### AC1: MCP Resources Concept Explanation
**Given** a user new to MCP protocol
**When** they read the resources documentation
**Then** they should understand:

1. **What MCP Resources Are:**
   - Alternative to tools for read-only data access
   - Stateless data endpoints vs. stateful tool invocations
   - Resource URIs as standardized paths
   - JSON response format consistency

2. **Resources vs. Tools Comparison:**
   ```markdown
   | Aspect | MCP Resources | MCP Tools |
   |--------|---------------|-----------|
   | Purpose | Data discovery & listing | Operations & mutations |
   | Access Pattern | URI-based (GET-like) | Function call with parameters |
   | State | Stateless, cacheable | Stateful, non-cacheable |
   | Use Case | Browse, preview, explore | Create, update, delete, execute |
   | Example | `/workflows` list | `create_workflow` tool |
   ```

3. **When to Use Resources:**
   - Initial data discovery and exploration
   - Previewing data before tool operations
   - Cacheable read-only access
   - Lightweight metadata retrieval

4. **When to Use Tools:**
   - Creating, updating, or deleting entities
   - Filtering or pagination control
   - Multi-instance explicit routing
   - Operations requiring validation

**Code Example - Resource Access Pattern:**
```typescript
// Claude Desktop conversation using resource
User: "Show me the /workflows resource"

// MCP server returns:
{
  "uri": "n8n://workflows",
  "mimeType": "application/json",
  "text": JSON.stringify({
    workflows: [
      { id: "123", name: "Email Campaign", active: true, nodes: 5 },
      { id: "456", name: "Slack Alerts", active: false, nodes: 3 }
    ],
    totalCount: 2,
    generatedAt: "2025-01-15T10:30:00Z"
  })
}
```

### AC2: Static Resources Documentation
**Given** a user wanting to explore available workflows and execution statistics
**When** they access static resources
**Then** they should have complete documentation for:

#### 2.1 Resource: `/workflows`

**Purpose:** List all workflows with streamlined metadata

**URI:** `n8n://workflows`

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

**Multi-Instance Support:**
```typescript
// Default environment
URI: "n8n://workflows"

// Specific instance
URI: "n8n://workflows?instance=production"
```

**Equivalent Tool:** `list_workflows` (provides filtering, pagination, instance routing)

**Use Cases:**
- Quick workflow overview without filters
- Initial project discovery
- Dashboard data for monitoring
- Workflow count verification

**Claude Desktop Example:**
```
User: "Read the /workflows resource"

Claude: I'll retrieve the workflows resource to see all available workflows.

[MCP resource read: n8n://workflows]

I found 5 workflows in your n8n instance:

1. **Email Campaign Automation** (Active)
   - Created: 2024-12-15
   - Nodes: 8
   - Tags: marketing, production

2. **Slack Error Notifications** (Inactive)
   - Created: 2024-11-20
   - Nodes: 3
   - Tags: monitoring, development

[... additional workflows ...]

Total: 5 workflows
Generated: 2025-01-15 10:30:00 UTC
```

#### 2.2 Resource: `/execution-stats`

**Purpose:** Aggregated execution statistics summary

**URI:** `n8n://execution-stats`

**Response Format:**
```typescript
{
  summary: {
    total: number;
    successful: number;
    failed: number;
    running: number;
    waiting: number;
  };
  recentExecutions: Array<{
    id: number;
    workflowId: number;
    workflowName: string;
    finished: boolean;
    mode: string;
    startedAt: string;
    stoppedAt?: string;
  }>;
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

**Multi-Instance Support:**
```typescript
URI: "n8n://execution-stats?instance=production"
```

**Equivalent Tool:** `list_executions` (provides detailed filtering, pagination)

**Use Cases:**
- Health monitoring dashboard
- Success rate analysis
- Quick status check
- Workflow performance comparison

**Claude Desktop Example:**
```
User: "Show me execution statistics"

Claude: I'll read the execution-stats resource to get an overview.

[MCP resource read: n8n://execution-stats]

**Execution Statistics Summary:**

Overall Health:
- Total Executions: 1,247
- Successful: 1,180 (94.6%)
- Failed: 67 (5.4%)
- Currently Running: 3

Recent Activity (Last 10):
1. Email Campaign (ID: 9876) - Success - 2 min ago
2. Slack Alert (ID: 9875) - Success - 5 min ago
3. Data Sync (ID: 9874) - Failed - 12 min ago
   [... additional executions ...]

Top Workflows by Volume:
1. Email Campaign (450 runs, 98% success)
2. Slack Alerts (320 runs, 91% success)
3. Data Sync (280 runs, 89% success)

Time Range: Last 24 hours
Generated: 2025-01-15 10:35:00 UTC
```

### AC3: Dynamic Resource Templates Documentation
**Given** a user wanting to access specific workflow or execution details
**When** they use dynamic resource templates
**Then** they should have complete documentation for:

#### 3.1 Resource Template: `/workflows/{id}`

**Purpose:** Get complete details for a specific workflow

**URI Pattern:** `n8n://workflows/{workflowId}`

**Path Parameters:**
- `{workflowId}`: Workflow ID (string)

**Response Format:**
```typescript
{
  id: string;
  name: string;
  active: boolean;
  nodes: Array<{
    name: string;
    type: string;
    typeVersion: number;
    position: [number, number];
    parameters: Record<string, any>;
  }>;
  connections: Record<string, {
    main: Array<Array<{
      node: string;
      type: string;
      index: number;
    }>>;
  }>;
  settings?: Record<string, any>;
  staticData?: Record<string, any>;
  tags?: Array<{ id: string; name: string }>;
  createdAt: string;
  updatedAt: string;
}
```

**Multi-Instance Support:**
```typescript
URI: "n8n://workflows/123?instance=staging"
```

**Equivalent Tool:** `get_workflow` (provides same data with parameter validation)

**Use Cases:**
- Inspecting workflow structure before modification
- Previewing workflow nodes and connections
- Understanding workflow configuration
- Documentation generation

**Claude Desktop Example:**
```
User: "Read the /workflows/123 resource"

Claude: I'll retrieve the detailed workflow information.

[MCP resource read: n8n://workflows/123]

**Workflow: Email Campaign Automation**

Status: Active
Created: 2024-12-15
Last Updated: 2025-01-10

**Workflow Structure:**

Nodes (8):
1. Schedule Trigger (n8n-nodes-base.scheduleTrigger)
   - Cron: 0 9 * * 1-5 (Weekdays at 9 AM)

2. Google Sheets (n8n-nodes-base.googleSheets)
   - Operation: Read rows
   - Sheet: Campaign List

3. Filter (n8n-nodes-base.filter)
   - Condition: status equals "active"

[... additional nodes ...]

Connections:
- Schedule Trigger → Google Sheets
- Google Sheets → Filter
- Filter → Email Send (true branch)
- Filter → Slack Notify (false branch)
[... additional connections ...]

Tags: marketing, production, automated

This workflow runs automatically on weekdays at 9 AM to process email campaigns.
```

#### 3.2 Resource Template: `/executions/{id}`

**Purpose:** Get complete details for a specific execution

**URI Pattern:** `n8n://executions/{executionId}`

**Path Parameters:**
- `{executionId}`: Execution ID (number or string)

**Response Format:**
```typescript
{
  id: number;
  workflowId: number;
  workflowName: string;
  finished: boolean;
  mode: 'manual' | 'trigger' | 'webhook' | 'retry';
  startedAt: string;
  stoppedAt?: string;
  retryOf?: number;
  retrySuccessId?: number;
  data?: {
    resultData: {
      runData: Record<string, Array<{
        startTime: number;
        executionTime: number;
        data: {
          main: Array<Array<{
            json: Record<string, any>;
          }>>;
        };
      }>>;
      lastNodeExecuted: string;
      error?: {
        message: string;
        stack: string;
      };
    };
    workflowData: {...};
  };
}
```

**Multi-Instance Support:**
```typescript
URI: "n8n://executions/9876?instance=production"
```

**Equivalent Tool:** `get_execution` (provides same data with includeData parameter)

**Use Cases:**
- Debugging failed executions
- Inspecting execution results
- Verifying data transformations
- Troubleshooting workflow issues

**Claude Desktop Example:**
```
User: "Show me details for execution 9874"

Claude: I'll read the execution resource to see what happened.

[MCP resource read: n8n://executions/9874]

**Execution #9874: Data Sync Workflow**

Status: Failed ❌
Started: 2025-01-15 10:23:15
Stopped: 2025-01-15 10:23:47
Duration: 32 seconds
Mode: Trigger

**Execution Flow:**

1. Schedule Trigger ✅
   - Triggered at 10:23:15
   - Execution time: 45ms

2. HTTP Request ✅
   - Fetched API data
   - Execution time: 1,250ms
   - Output: 150 records

3. Data Transformation ❌
   - Failed with error
   - Execution time: 120ms

**Error Details:**
Message: "Cannot read property 'email' of undefined"
Node: Data Transformation
Last successful node: HTTP Request

The workflow failed during data transformation. The API response might be missing expected 'email' fields in some records.
```

### AC4: MCP Prompts Documentation
**Given** a user wanting to use prompt templates for workflow generation
**When** they access the prompts documentation
**Then** they should have complete documentation for:

#### 4.1 Prompts System Overview

**What are MCP Prompts:**
- Predefined workflow templates with variable substitution
- Rapid workflow generation from structured inputs
- Integration with `create_workflow` tool
- 5 prompt templates covering common use cases

**Prompt Structure:**
```typescript
interface MCPPrompt {
  name: string;
  description: string;
  arguments: Array<{
    name: string;
    description: string;
    required: boolean;
    default?: any;
  }>;
}
```

**Workflow:**
1. User selects prompt template
2. Claude requests variable values
3. User provides substitution values
4. MCP server generates workflow JSON
5. Claude creates workflow using `create_workflow` tool

**Claude Desktop Pattern:**
```
User: "Create a workflow using the schedule-triggered-workflow prompt"

Claude: I'll help you create a schedule-triggered workflow. I need some information:

What should the workflow be named? [workflow_name]
What schedule do you want? (e.g., "every day at 9am") [cron_schedule]
What action should it perform? [action_description]

User: "Daily Sales Report, every weekday at 8am, send sales data to Slack"

Claude: [Uses prompt template to generate workflow JSON]
[Calls create_workflow tool with generated JSON]

Created workflow "Daily Sales Report" successfully!
- Trigger: Cron (0 8 * * 1-5)
- Action: Slack message with sales data
- Status: Inactive (activate when ready)
```

#### 4.2 Prompt Template: Schedule Triggered Workflow

**Name:** `schedule-triggered-workflow`

**Description:** Create a workflow that runs on a schedule (cron)

**Arguments:**
```typescript
{
  workflow_name: {
    description: "Name of the workflow",
    required: true,
    type: "string"
  },
  cron_schedule: {
    description: "Cron expression or natural language (e.g., 'every day at 9am')",
    required: true,
    type: "string"
  },
  action_description: {
    description: "What the workflow should do",
    required: true,
    type: "string"
  },
  timezone: {
    description: "Timezone for schedule (e.g., 'America/New_York')",
    required: false,
    default: "UTC"
  }
}
```

**Generated Workflow Structure:**
```json
{
  "name": "{{workflow_name}}",
  "nodes": [
    {
      "name": "Schedule Trigger",
      "type": "n8n-nodes-base.scheduleTrigger",
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "cronExpression",
              "expression": "{{cron_schedule}}"
            }
          ]
        },
        "timezone": "{{timezone}}"
      }
    },
    {
      "name": "Action Node",
      "type": "n8n-nodes-base.noOp",
      "parameters": {
        "note": "{{action_description}}"
      }
    }
  ],
  "connections": {
    "Schedule Trigger": {
      "main": [[{ "node": "Action Node", "type": "main", "index": 0 }]]
    }
  }
}
```

**Use Cases:**
- Daily reports
- Periodic data syncs
- Scheduled notifications
- Recurring maintenance tasks

**Claude Desktop Example:**
```
User: "Use the schedule-triggered-workflow prompt to create a daily backup workflow"

Claude: I'll create a scheduled workflow for daily backups. Let me gather the details:

**Schedule Triggered Workflow Setup:**

1. Workflow name: [your response]
2. Schedule: [cron or natural language]
3. Action: [what should happen]
4. Timezone: [optional, defaults to UTC]

User:
1. "Database Backup Workflow"
2. "every day at 2am"
3. "backup production database to S3"
4. "America/New_York"

Claude: [Generates workflow from prompt template]
[Creates workflow using create_workflow tool]

✅ Created "Database Backup Workflow"

Configuration:
- Schedule: Daily at 2:00 AM EST
- Trigger: Cron (0 2 * * *)
- Timezone: America/New_York
- Action: Database backup to S3

Next steps:
1. Add database connection node
2. Add S3 upload node
3. Configure credentials
4. Test manually before activating
```

#### 4.3 Prompt Template: HTTP Webhook Workflow

**Name:** `http-webhook-workflow`

**Description:** Create a workflow triggered by HTTP webhook

**Arguments:**
```typescript
{
  workflow_name: {
    description: "Name of the workflow",
    required: true,
    type: "string"
  },
  webhook_path: {
    description: "URL path for webhook (e.g., 'my-webhook')",
    required: true,
    type: "string"
  },
  response_mode: {
    description: "When to respond: 'onReceived' or 'lastNode'",
    required: false,
    default: "onReceived"
  },
  processing_description: {
    description: "What the workflow should do with the webhook data",
    required: true,
    type: "string"
  }
}
```

**Generated Workflow Structure:**
```json
{
  "name": "{{workflow_name}}",
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "{{webhook_path}}",
        "responseMode": "{{response_mode}}",
        "options": {}
      }
    },
    {
      "name": "Process Data",
      "type": "n8n-nodes-base.noOp",
      "parameters": {
        "note": "{{processing_description}}"
      }
    }
  ],
  "connections": {
    "Webhook": {
      "main": [[{ "node": "Process Data", "type": "main", "index": 0 }]]
    }
  }
}
```

**Use Cases:**
- API integrations
- Form submissions
- External service notifications
- Real-time event processing

**Claude Desktop Example:**
```
User: "Create a webhook workflow for Stripe payment notifications"

Claude: I'll use the http-webhook-workflow prompt. Please provide:

1. Workflow name
2. Webhook path (will be: https://your-n8n.com/webhook/{path})
3. Response mode (onReceived or lastNode)
4. Processing description

User:
1. "Stripe Payment Handler"
2. "stripe-payments"
3. "onReceived"
4. "validate payment, update database, send confirmation email"

Claude: [Generates workflow]

✅ Created "Stripe Payment Handler"

Webhook URL: https://your-n8n.app.cloud/webhook/stripe-payments
Response Mode: Immediate (onReceived)

Processing Pipeline:
1. Webhook receives Stripe event
2. Validates payment data
3. Updates database
4. Sends confirmation email

Next steps:
1. Add validation node
2. Configure database connection
3. Add email node
4. Activate workflow
5. Configure in Stripe dashboard
```

#### 4.4 Prompt Template: Data Transformation Workflow

**Name:** `data-transformation-workflow`

**Description:** ETL workflow for data processing

**Arguments:**
```typescript
{
  workflow_name: {
    description: "Name of the workflow",
    required: true
  },
  source_description: {
    description: "Where data comes from (e.g., 'Google Sheets', 'API endpoint')",
    required: true
  },
  transformation_description: {
    description: "How data should be transformed",
    required: true
  },
  destination_description: {
    description: "Where to send transformed data",
    required: true
  }
}
```

**Use Cases:**
- ETL pipelines
- Data migration
- Format conversion
- Data enrichment

#### 4.5 Prompt Template: External Service Integration

**Name:** `external-service-integration`

**Description:** Connect to external services (Slack, email, etc.)

**Arguments:**
```typescript
{
  workflow_name: {
    description: "Name of the workflow",
    required: true
  },
  service_name: {
    description: "External service (e.g., 'Slack', 'Gmail')",
    required: true
  },
  trigger_description: {
    description: "What triggers this workflow",
    required: true
  },
  action_description: {
    description: "What action to perform in the service",
    required: true
  }
}
```

**Use Cases:**
- Slack notifications
- Email automation
- CRM updates
- Calendar events

#### 4.6 Prompt Template: API Data Polling

**Name:** `api-data-polling`

**Description:** Periodically check API for new data

**Arguments:**
```typescript
{
  workflow_name: {
    description: "Name of the workflow",
    required: true
  },
  api_endpoint: {
    description: "API URL to poll",
    required: true
  },
  poll_interval: {
    description: "How often to check (cron or natural language)",
    required: true
  },
  data_processing: {
    description: "What to do with new data",
    required: true
  }
}
```

**Use Cases:**
- New record detection
- Status monitoring
- Data synchronization
- Alert generation

### AC5: Resource Discovery & Listing
**Given** a user wanting to discover available resources and prompts
**When** they use MCP discovery commands
**Then** they should understand:

**Resource Listing:**
```
User: "List available MCP resources"

Claude: The n8n MCP server provides 4 resources:

**Static Resources:**
1. n8n://workflows
   - Lists all workflows with metadata
   - Equivalent to list_workflows tool

2. n8n://execution-stats
   - Execution statistics summary
   - Health monitoring data

**Dynamic Resources (Templates):**
3. n8n://workflows/{id}
   - Get specific workflow details
   - Equivalent to get_workflow tool

4. n8n://executions/{id}
   - Get specific execution details
   - Equivalent to get_execution tool

All resources support multi-instance access via ?instance parameter.
```

**Prompt Listing:**
```
User: "What workflow prompts are available?"

Claude: The n8n MCP server provides 5 workflow prompt templates:

1. **schedule-triggered-workflow**
   - Cron-based scheduled automation
   - Variables: workflow_name, cron_schedule, action_description, timezone

2. **http-webhook-workflow**
   - HTTP webhook receiver
   - Variables: workflow_name, webhook_path, response_mode, processing_description

3. **data-transformation-workflow**
   - ETL data processing pipeline
   - Variables: workflow_name, source, transformation, destination

4. **external-service-integration**
   - Connect to Slack, email, etc.
   - Variables: workflow_name, service_name, trigger, action

5. **api-data-polling**
   - Periodic API polling
   - Variables: workflow_name, api_endpoint, poll_interval, data_processing

Would you like to use any of these templates to create a workflow?
```

### AC6: Cross-References with Tools
**Given** a user understanding both resources and tools
**When** they read the documentation
**Then** they should see clear guidance:

**Resource to Tool Mapping:**
```markdown
| Resource | Equivalent Tool | Key Differences |
|----------|----------------|-----------------|
| `/workflows` | `list_workflows` | Resource: no filtering; Tool: filters, pagination, instance |
| `/workflows/{id}` | `get_workflow` | Resource: URI-based; Tool: parameter validation |
| `/execution-stats` | `list_executions` | Resource: summary; Tool: detailed filtering |
| `/executions/{id}` | `get_execution` | Resource: always includes data; Tool: optional includeData |
```

**Decision Guide:**
```
Use Resources When:
✅ Browsing and exploring
✅ Quick read-only access
✅ No filtering needed
✅ Cacheable data

Use Tools When:
✅ Creating/updating/deleting
✅ Filtering or pagination
✅ Multi-instance explicit routing
✅ Parameter validation required
```

### AC7: Multi-Instance Resource Access
**Given** a multi-instance n8n setup
**When** accessing resources
**Then** documentation should explain:

**Instance Parameter:**
```
Default Environment:
URI: n8n://workflows

Specific Instance:
URI: n8n://workflows?instance=production
URI: n8n://workflows/123?instance=staging
URI: n8n://execution-stats?instance=development
```

**Claude Desktop Example:**
```
User: "Show me workflows from the staging instance"

Claude: [MCP resource read: n8n://workflows?instance=staging]

Workflows in Staging Environment:

1. Test Email Campaign (Active)
2. Development Webhook (Inactive)
3. Staging Data Sync (Active)

Total: 3 workflows
```

---

## Technical Implementation Notes

### Resource Implementation Location

**File:** `src/index.ts`

**Key Sections:**
1. Resource Registration:
```typescript
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    { uri: "n8n://workflows", name: "Workflows List", ... },
    { uri: "n8n://execution-stats", name: "Execution Statistics", ... },
    { uri: "n8n://workflows/{id}", name: "Workflow Details", ... },
    { uri: "n8n://executions/{id}", name: "Execution Details", ... }
  ]
}));
```

2. Resource Reading:
```typescript
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = new URL(request.params.uri);
  const path = uri.pathname;

  if (path === '/workflows') {
    // Fetch from N8NApiWrapper
  } else if (path.startsWith('/workflows/')) {
    // Extract ID, fetch specific workflow
  }
  // ... handle other resources
});
```

### Prompt Implementation Location

**File:** `src/services/promptsService.ts`

**Key Methods:**
```typescript
export class PromptsService {
  static getAvailablePrompts(): MCPPrompt[] {
    return [
      {
        name: "schedule-triggered-workflow",
        description: "...",
        arguments: [...]
      },
      // ... other prompts
    ];
  }

  static generateWorkflowFromPrompt(
    promptName: string,
    variables: Record<string, any>
  ): WorkflowDefinition {
    // Template substitution logic
  }
}
```

### Multi-Instance Resource Routing

**Pattern:**
```typescript
async function getResourceData(uri: URL): Promise<any> {
  const instance = uri.searchParams.get('instance');
  const envManager = EnvironmentManager.getInstance();

  if (instance) {
    envManager.validateEnvironment(instance);
  }

  const api = envManager.getApi(instance);
  return await api.fetchData();
}
```

---

## Dependencies

### Upstream Dependencies
- Epic 1 Story 1.1 (URL normalization) - Resource URLs
- Epic 2 Story 2.1 (list_workflows optimization) - `/workflows` resource performance
- Epic 5 Story 5.1 (Multi-instance) - Instance routing for resources

### Downstream Dependencies
- Epic 7 Story 7.6 (Resources/Prompts API) - API reference documentation
- Epic 8 (Deployment) - Documentation publishing

### Cross-Story Dependencies
- Story 4.1 (Workflows Tools) - Tool equivalents for resources
- Story 4.2 (Executions Tools) - get_execution vs /executions/{id}

---

## Definition of Done

### Documentation Completeness
- [ ] MCP resources concept explained with comparisons to tools
- [ ] All 4 resource types documented (2 static, 2 dynamic)
- [ ] All 5 prompt templates documented with arguments
- [ ] Multi-instance resource access patterns documented
- [ ] Resource discovery methods explained

### Code Examples
- [ ] 10+ Claude Desktop conversation examples
- [ ] TypeScript interfaces for all response formats
- [ ] URI pattern examples for each resource
- [ ] Prompt variable substitution examples
- [ ] Multi-instance access examples

### Cross-References
- [ ] Resource-to-tool mapping table
- [ ] Decision guide (when to use resources vs tools)
- [ ] Links to Epic 1 URL configuration
- [ ] Links to Epic 2 performance optimizations
- [ ] Links to Epic 5 multi-instance architecture

### Validation
- [ ] Technical review by development team
- [ ] Examples tested with actual MCP server
- [ ] Resource URIs verified against implementation
- [ ] Prompt templates validated for correctness

---

## Estimation Breakdown

**Story Points:** 6

**Effort Distribution:**
- Research & Planning: 0.5 SP (gathering resource/prompt specifications)
- Resource Documentation: 2 SP (4 resources with examples)
- Prompt Documentation: 2.5 SP (5 prompts with variable systems)
- Cross-References: 0.5 SP (tool mappings, decision guides)
- Examples & Validation: 0.5 SP (Claude Desktop conversations)

**Page Count:** 8-10 pages
- Resources Concept: 1 page
- Static Resources (2): 2 pages
- Dynamic Resources (2): 2 pages
- Prompts System: 1 page
- Prompt Templates (5): 3-4 pages
- Discovery & Cross-References: 1 page

**Estimated Duration:** 3-4 days (1 developer)

---

## Notes

### Success Metrics
- Users discover and use prompt templates for rapid workflow creation
- Resource usage complements tool usage appropriately
- 80%+ of users understand resources vs tools distinction
- Prompt variable substitution documented clearly

### Common Documentation Mistakes to Avoid
- ❌ Assuming users know MCP protocol concepts
- ❌ Not explaining when to use resources vs tools
- ❌ Missing multi-instance examples for resources
- ❌ Incomplete prompt variable documentation
- ❌ No URI syntax examples

### Best Practices
- ✅ Show complete Claude Desktop conversation flows
- ✅ Provide resource-to-tool decision guide
- ✅ Document all prompt arguments with defaults
- ✅ Explain variable substitution mechanism
- ✅ Cross-reference with equivalent tools

### Documentation Organization
```
docs/
└── features/
    └── mcp-resources-prompts.md
        ├── Resources Concept
        ├── Static Resources
        │   ├── /workflows
        │   └── /execution-stats
        ├── Dynamic Resources
        │   ├── /workflows/{id}
        │   └── /executions/{id}
        ├── Prompts System
        └── Prompt Templates (5)
```

---

**Related Stories:**
- Story 4.1: Workflows Management Tools (tool equivalents)
- Story 4.2: Executions Management Tools (execution data structures)
- Story 4.6: Error Handling & Common Patterns (resource error handling)

**Related Epics:**
- Epic 1: URL Configuration (resource URL normalization)
- Epic 2: API Implementation Validation (performance optimizations)
- Epic 5: Multi-Instance Architecture (instance routing)
- Epic 7: API Reference Documentation (resources API documentation)
