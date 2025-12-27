# Story 5.3: Instance Routing in MCP Tools

**Epic:** Epic 5 - Multi-Instance Architecture
**Story Points:** 6
**Priority:** High
**Status:** Completed
**Estimated Page Count:** 10-13 pages

---

## User Story

**As a** Claude Desktop user working with multiple n8n environments
**I want** all MCP tools to support instance parameter for routing
**So that** I can manage workflows, executions, and credentials across production, staging, and development from a single conversation

---

## Story Description

### Current System

With Stories 5.1 and 5.2 implemented:
- ✅ Configuration system supports multiple instances
- ✅ EnvironmentManager manages API routing
- ❌ MCP tools don't accept instance parameter
- ❌ Tools always use single default instance
- ❌ No way to specify target environment in tool calls

### Enhancement

Update all 17 MCP tools to:
- Accept optional `instance` parameter
- Route API calls through EnvironmentManager
- Use default environment when instance not specified
- Provide clear error messages for invalid instances
- Document multi-instance usage in each tool

**Affected Tools (17 total):**
- **Workflows** (8): list, get, create, update, delete, activate, deactivate, execute
- **Executions** (4): list, get, delete, retry
- **Credentials** (6): list, get, create, update, delete, get_schema
- **Tags** (5): list, get, create, update, delete

### Context from Previous Stories

**Story 5.1 (Configuration):**
- Multi-instance .config.json format
- Default environment concept

**Story 5.2 (EnvironmentManager):**
- Instance routing and validation
- API instance caching

**Epic 4 (Tools Reference):**
- All 17 tools documented
- Tool parameter schemas defined

---

## Acceptance Criteria

### AC1: Universal Instance Parameter Schema
**Given** all MCP tools need consistent instance routing
**When** defining tool input schemas
**Then** they should include optional instance parameter:

#### 1.1 Standard Instance Parameter

**Parameter Definition:**
```typescript
interface InstanceParameter {
  instance?: string;  // Optional
  description: "Instance identifier (optional, uses default if not provided)";
  examples: ["production", "staging", "development"];
}
```

**Tool Schema Pattern:**
```typescript
// Example: list_workflows tool
{
  name: "list_workflows",
  description: "List all workflows from n8n instance",
  inputSchema: {
    type: "object",
    properties: {
      // Instance parameter (ALWAYS first)
      instance: {
        type: "string",
        description:
          "Instance identifier (optional, uses default if not provided). " +
          "Examples: 'production', 'staging', 'development'"
      },

      // Tool-specific parameters follow
      active: {
        type: "boolean",
        description: "Filter by active status"
      },
      tags: {
        type: "array",
        items: { type: "string" },
        description: "Filter by tag names"
      },
      limit: {
        type: "number",
        description: "Maximum workflows to return (1-250)"
      },
      cursor: {
        type: "string",
        description: "Pagination cursor from previous response"
      }
    },
    // No required parameters (all optional including instance)
  }
}
```

**Key Principles:**
1. **Always Optional:** Instance parameter never required (defaults used)
2. **First Parameter:** Instance always listed first for consistency
3. **Clear Description:** Explain default behavior and provide examples
4. **String Type:** Instance names are always strings
5. **No Validation in Schema:** Validation happens in tool handler

#### 1.2 Instance Parameter Extraction Pattern

**Standard Pattern for All Tools:**
```typescript
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'tool_name') {
    // Step 1: Extract instance parameter
    const { instance, ...toolParams } = args;

    // Step 2: Route through EnvironmentManager
    const envManager = EnvironmentManager.getInstance();
    const api = envManager.getApi(instance); // Uses default if undefined

    // Step 3: Make API call with remaining parameters
    try {
      const result = await api.toolMethod(toolParams);

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }]
      };
    } catch (error) {
      // Step 4: Handle errors with instance context
      throw new Error(
        `Failed to execute tool_name on instance "${instance || envManager.getDefaultEnvironment()}": ` +
        `${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
});
```

### AC2: Workflow Tools Instance Routing
**Given** 8 workflow management tools
**When** implementing instance routing
**Then** each tool should support multi-instance:

#### 2.1 list_workflows with Instance Routing

**Before (Single Instance):**
```typescript
if (name === 'list_workflows') {
  const api = new N8NApiWrapper(process.env.N8N_HOST, process.env.N8N_API_KEY);
  const workflows = await api.listWorkflows(args);
  return { content: [{ type: 'text', text: JSON.stringify(workflows) }] };
}
```

**After (Multi-Instance):**
```typescript
if (name === 'list_workflows') {
  const { instance, ...params } = args;
  const envManager = EnvironmentManager.getInstance();

  try {
    const api = envManager.getApi(instance);
    const workflows = await api.listWorkflows(params);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(workflows, null, 2)
      }]
    };
  } catch (error) {
    const instanceName = instance || envManager.getDefaultEnvironment();
    throw new Error(
      `Failed to list workflows from "${instanceName}": ${error.message}\n\n` +
      `Available instances: ${envManager.listEnvironments().join(', ')}`
    );
  }
}
```

**Claude Desktop Usage:**
```
User: "List all active workflows from production"

Claude: I'll list the active workflows from the production instance.

[MCP tool call: list_workflows]
{
  "instance": "production",
  "active": true
}

Result: Found 12 active workflows in production:
1. Email Campaign Automation (12 nodes)
2. Slack Notifications (5 nodes)
3. Data Sync Pipeline (18 nodes)
[...]

---

User: "Now show me workflows from staging"

Claude: I'll list workflows from the staging instance.

[MCP tool call: list_workflows]
{
  "instance": "staging",
  "active": true
}

Result: Found 3 active workflows in staging:
1. Test Email Campaign (8 nodes)
2. Development Slack Alerts (3 nodes)
3. Test Data Sync (10 nodes)
```

#### 2.2 create_workflow with Instance Routing

```typescript
if (name === 'create_workflow') {
  const { instance, ...workflowData } = args;
  const envManager = EnvironmentManager.getInstance();
  const api = envManager.getApi(instance);

  try {
    // Validate workflow structure
    if (!workflowData.name || !workflowData.nodes) {
      throw new Error('Workflow must have name and nodes');
    }

    // Transform connections if needed (from Epic 2)
    if (workflowData.connections && Array.isArray(workflowData.connections)) {
      workflowData.connections = transformConnectionsForN8N(workflowData.connections);
    }

    // Create workflow
    const workflow = await api.createWorkflow(workflowData);

    const instanceName = instance || envManager.getDefaultEnvironment();
    return {
      content: [{
        type: 'text',
        text:
          `✅ Workflow "${workflow.name}" created successfully in "${instanceName}"\n\n` +
          `ID: ${workflow.id}\n` +
          `Nodes: ${workflow.nodes.length}\n` +
          `Status: ${workflow.active ? 'Active' : 'Inactive'}\n\n` +
          JSON.stringify(workflow, null, 2)
      }]
    };
  } catch (error) {
    const instanceName = instance || envManager.getDefaultEnvironment();
    throw new Error(
      `Failed to create workflow in "${instanceName}": ${error.message}`
    );
  }
}
```

**Claude Desktop Usage:**
```
User: "Create a simple webhook workflow in staging"

Claude: I'll create a webhook workflow in the staging environment.

[MCP tool call: create_workflow]
{
  "instance": "staging",
  "name": "Test Webhook Handler",
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300],
      "parameters": {
        "path": "test-webhook",
        "responseMode": "onReceived"
      }
    }
  ],
  "connections": {},
  "active": false
}

✅ Workflow "Test Webhook Handler" created successfully in "staging"

ID: 456
Nodes: 1
Status: Inactive

You can now test this workflow at:
https://staging.app.n8n.cloud/webhook/test-webhook
```

#### 2.3 All 8 Workflow Tools Pattern

**Consistent Implementation:**
```typescript
const workflowTools = [
  'list_workflows',
  'get_workflow',
  'create_workflow',
  'update_workflow',
  'delete_workflow',
  'activate_workflow',
  'deactivate_workflow',
  'execute_workflow'
];

for (const toolName of workflowTools) {
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === toolName) {
      const { instance, ...params } = request.params.arguments;
      const envManager = EnvironmentManager.getInstance();
      const api = envManager.getApi(instance);

      try {
        const result = await api[getApiMethodName(toolName)](params);
        return formatToolResponse(result, toolName, instance);
      } catch (error) {
        return handleToolError(error, toolName, instance);
      }
    }
  });
}
```

### AC3: Execution Tools Instance Routing
**Given** 4 execution management tools
**When** implementing instance routing
**Then** they should support cross-instance execution tracking:

#### 3.1 list_executions with Instance Routing

```typescript
if (name === 'list_executions') {
  const { instance, ...params } = args;
  const envManager = EnvironmentManager.getInstance();
  const api = envManager.getApi(instance);

  try {
    const executions = await api.listExecutions(params);

    const instanceName = instance || envManager.getDefaultEnvironment();
    return {
      content: [{
        type: 'text',
        text:
          `Executions from "${instanceName}":\n\n` +
          `Total: ${executions.data.length}\n` +
          (executions.nextCursor ? `Next page available\n\n` : '\n') +
          JSON.stringify(executions, null, 2)
      }]
    };
  } catch (error) {
    const instanceName = instance || envManager.getDefaultEnvironment();
    throw new Error(
      `Failed to list executions from "${instanceName}": ${error.message}`
    );
  }
}
```

**Claude Desktop Cross-Instance Comparison:**
```
User: "Compare failed executions between production and staging"

Claude: I'll check failed executions in both environments.

[MCP tool call: list_executions]
{
  "instance": "production",
  "finished": true,
  "includeData": false
}

Production failed executions: 3

[MCP tool call: list_executions]
{
  "instance": "staging",
  "finished": true,
  "includeData": false
}

Staging failed executions: 12

**Comparison:**
- Production: 3 failed (healthy)
- Staging: 12 failed (needs attention)

Staging has significantly more failures. Would you like me to investigate specific failed executions?
```

#### 3.2 retry_execution with Instance Routing

```typescript
if (name === 'retry_execution') {
  const { instance, id } = args;
  const envManager = EnvironmentManager.getInstance();
  const api = envManager.getApi(instance);
  const instanceName = instance || envManager.getDefaultEnvironment();

  try {
    // Verify execution exists and failed
    const execution = await api.getExecution(id);

    if (!execution.finished) {
      throw new Error(
        `Execution ${id} is still running in "${instanceName}". ` +
        `Wait for completion before retrying.`
      );
    }

    if (execution.finished && !execution.data?.resultData?.error) {
      throw new Error(
        `Execution ${id} completed successfully in "${instanceName}". ` +
        `No retry needed.`
      );
    }

    // Retry execution
    const retryResult = await api.retryExecution(id);

    return {
      content: [{
        type: 'text',
        text:
          `✅ Execution ${id} retried in "${instanceName}"\n\n` +
          `New execution ID: ${retryResult.id}\n` +
          `Original execution: ${id}\n` +
          `Workflow: ${execution.workflowId}\n\n` +
          JSON.stringify(retryResult, null, 2)
      }]
    };
  } catch (error) {
    throw new Error(
      `Failed to retry execution ${id} in "${instanceName}": ${error.message}`
    );
  }
}
```

### AC4: Credential Tools Instance Routing
**Given** 6 credential management tools
**When** implementing instance routing
**Then** they should handle per-instance credential isolation:

#### 4.1 Credential Isolation by Instance

**Important:** Credentials are instance-specific and NOT shared across instances.

```typescript
if (name === 'create_credential') {
  const { instance, ...credentialData } = args;
  const envManager = EnvironmentManager.getInstance();
  const api = envManager.getApi(instance);
  const instanceName = instance || envManager.getDefaultEnvironment();

  try {
    // Get schema first (schema-driven creation from Epic 2)
    const schema = await api.getCredentialSchema(credentialData.type);

    // Validate required fields
    const requiredFields = schema.properties
      .filter(p => p.required)
      .map(p => p.name);

    const missingFields = requiredFields.filter(
      field => !credentialData.data[field]
    );

    if (missingFields.length > 0) {
      throw new Error(
        `Missing required fields for ${credentialData.type}: ` +
        `${missingFields.join(', ')}`
      );
    }

    // Create credential
    const credential = await api.createCredential(credentialData);

    return {
      content: [{
        type: 'text',
        text:
          `✅ Credential "${credential.name}" created in "${instanceName}"\n\n` +
          `ID: ${credential.id}\n` +
          `Type: ${credential.type}\n` +
          `⚠️  This credential only exists in "${instanceName}"\n` +
          `   To use in other instances, create separately.\n\n` +
          JSON.stringify(credential, null, 2)
      }]
    };
  } catch (error) {
    throw new Error(
      `Failed to create credential in "${instanceName}": ${error.message}`
    );
  }
}
```

**Claude Desktop Credential Management:**
```
User: "Create httpBasicAuth credential in both production and staging"

Claude: I'll create the credential in both environments separately, as credentials are instance-specific.

[MCP tool call: get_credential_schema]
{
  "type": "httpBasicAuth",
  "instance": "production"
}

Required fields: user, password

[MCP tool call: create_credential]
{
  "instance": "production",
  "name": "API Credential",
  "type": "httpBasicAuth",
  "data": {
    "user": "api_user",
    "password": "[secure]"
  }
}

✅ Created in production (ID: 101)

[MCP tool call: create_credential]
{
  "instance": "staging",
  "name": "API Credential",
  "type": "httpBasicAuth",
  "data": {
    "user": "api_user_staging",
    "password": "[secure_staging]"
  }
}

✅ Created in staging (ID: 202)

Credentials created in both environments:
- Production: ID 101
- Staging: ID 202

Note: These are separate credentials. Changes to one won't affect the other.
```

### AC5: Tag Tools Instance Routing
**Given** 5 tag management tools
**When** implementing instance routing
**Then** they should support per-instance tag organization:

#### 5.1 Tag Organization Across Instances

```typescript
if (name === 'create_tag') {
  const { instance, name: tagName } = args;
  const envManager = EnvironmentManager.getInstance();
  const api = envManager.getApi(instance);
  const instanceName = instance || envManager.getDefaultEnvironment();

  try {
    // Create tag
    const tag = await api.createTag({ name: tagName });

    return {
      content: [{
        type: 'text',
        text:
          `✅ Tag "${tag.name}" created in "${instanceName}"\n\n` +
          `ID: ${tag.id}\n` +
          `Instance: ${instanceName}\n\n` +
          `You can now apply this tag to workflows in "${instanceName}".\n\n` +
          JSON.stringify(tag, null, 2)
      }]
    };
  } catch (error) {
    throw new Error(
      `Failed to create tag in "${instanceName}": ${error.message}`
    );
  }
}
```

**Claude Desktop Tag Synchronization:**
```
User: "Create 'production-ready' tag in all environments"

Claude: I'll create the 'production-ready' tag in all configured environments.

[MCP tool call: create_tag]
{
  "instance": "production",
  "name": "production-ready"
}

✅ Created in production (ID: 10)

[MCP tool call: create_tag]
{
  "instance": "staging",
  "name": "production-ready"
}

✅ Created in staging (ID: 11)

[MCP tool call: create_tag]
{
  "instance": "development",
  "name": "production-ready"
}

✅ Created in development (ID: 12)

Tag "production-ready" created in all 3 environments:
- Production: ID 10
- Staging: ID 11
- Development: ID 12

Each environment has its own independent tag with the same name.
```

### AC6: Error Handling and User Feedback
**Given** various error scenarios
**When** errors occur during instance routing
**Then** users should receive clear, actionable feedback:

#### 6.1 Instance Not Found Error

```typescript
try {
  const api = envManager.getApi('nonexistent');
} catch (error) {
  return {
    isError: true,
    content: [{
      type: 'text',
      text:
        `❌ Instance "nonexistent" not found\n\n` +
        `Available instances:\n` +
        envManager.listEnvironments().map(e => `  - ${e}`).join('\n') + '\n\n' +
        `Default instance: ${envManager.getDefaultEnvironment()}\n\n` +
        `To use a specific instance, provide the instance parameter.\n` +
        `To use the default instance, omit the instance parameter.`
    }]
  };
}
```

#### 6.2 Instance-Specific API Errors

```typescript
try {
  const workflow = await api.getWorkflow('123');
} catch (error) {
  const instanceName = instance || envManager.getDefaultEnvironment();

  if (axios.isAxiosError(error) && error.response?.status === 404) {
    return {
      isError: true,
      content: [{
        type: 'text',
        text:
          `❌ Workflow "123" not found in "${instanceName}"\n\n` +
          `Possible reasons:\n` +
          `  1. Workflow doesn't exist in "${instanceName}"\n` +
          `  2. Workflow exists in different instance\n` +
          `  3. Workflow ID is incorrect\n\n` +
          `Try:\n` +
          `  - List workflows to verify: list_workflows(instance="${instanceName}")\n` +
          `  - Check other instances if multi-instance setup\n` +
          `  - Verify workflow ID`
      }]
    };
  }

  // Other errors
  throw new Error(
    `API error in "${instanceName}": ${error.message}`
  );
}
```

#### 6.3 Default Environment Indicator

```typescript
function formatToolResponse(result: any, toolName: string, instance?: string): MCPResponse {
  const envManager = EnvironmentManager.getInstance();
  const instanceName = instance || envManager.getDefaultEnvironment();
  const isDefault = !instance;

  const header =
    `✅ ${toolName} successful\n` +
    `Instance: ${instanceName}` + (isDefault ? ' (default)' : '') + '\n\n';

  return {
    content: [{
      type: 'text',
      text: header + JSON.stringify(result, null, 2)
    }]
  };
}
```

**Output Example:**
```
✅ list_workflows successful
Instance: staging (default)

{
  "data": [
    { "id": "1", "name": "Test Workflow", "active": true },
    { "id": "2", "name": "Development Flow", "active": false }
  ]
}
```

### AC7: Documentation and Examples
**Given** developers integrating with multi-instance tools
**When** they read documentation
**Then** they should have comprehensive examples:

#### 7.1 Tool Documentation Template

**For Each Tool:**
```markdown
## tool_name

**Description:** [Tool description]

**Parameters:**
- `instance` (optional): Instance identifier (uses default if not provided)
- [other tool-specific parameters...]

**Multi-Instance Examples:**

**Example 1: Using Default Instance**
\`\`\`json
{
  "param1": "value1",
  "param2": "value2"
}
\`\`\`
Result: Uses default environment from .config.json

**Example 2: Explicit Instance**
\`\`\`json
{
  "instance": "production",
  "param1": "value1",
  "param2": "value2"
}
\`\`\`
Result: Uses production instance

**Example 3: Cross-Instance Operation**
\`\`\`
1. List from production:
   { "instance": "production" }

2. List from staging:
   { "instance": "staging" }

3. Compare results
\`\`\`

**Error Handling:**
- Instance not found → Lists available instances
- API error → Includes instance name in error message
- Default fallback → Clearly indicates default usage
```

---

## Technical Implementation Notes

### Implementation Files

**Modified Files:**
- `src/index.ts` - Update all 17 tool handlers
- Update each tool's input schema to include instance parameter
- Add consistent error handling across all tools

### Implementation Checklist

**For Each Tool:**
- [ ] Add `instance` parameter to input schema
- [ ] Extract instance from arguments
- [ ] Route through EnvironmentManager
- [ ] Handle errors with instance context
- [ ] Add default environment indicator in responses
- [ ] Update documentation with multi-instance examples

**Tool Categories:**
- [ ] 8 Workflow tools
- [ ] 4 Execution tools
- [ ] 6 Credential tools (note isolation)
- [ ] 5 Tag tools

### Testing Strategy

```typescript
// test-instance-routing.js
const TEST_CASES = [
  {
    tool: 'list_workflows',
    args: { instance: 'production' },
    expected: 'Uses production instance'
  },
  {
    tool: 'list_workflows',
    args: {}, // No instance
    expected: 'Uses default instance'
  },
  {
    tool: 'list_workflows',
    args: { instance: 'nonexistent' },
    expected: 'Error with available instances'
  }
];

for (const test of TEST_CASES) {
  await testToolInstanceRouting(test);
}
```

---

## Dependencies

### Upstream Dependencies
- **Story 5.1** (Configuration System) - Multi-instance config
- **Story 5.2** (EnvironmentManager) - Instance routing logic
- Epic 2 (API Implementation) - All API methods
- Epic 4 (Tools Documentation) - Tool specifications

### Downstream Dependencies
- **Story 5.4** (Testing & Validation) - Tests all instance routing
- Epic 6 (Examples & Tutorials) - Uses multi-instance patterns
- Epic 7 (API Reference) - Documents instance parameter

---

## Definition of Done

### Implementation Completeness
- [x] All 17 tools accept instance parameter
- [x] Consistent error handling across tools
- [x] Default environment fallback works
- [x] Instance validation before API calls
- [x] Clear user feedback with instance names

### Documentation
- [ ] Each tool documents instance parameter
- [ ] Multi-instance examples for each tool
- [ ] Error handling documented
- [ ] Cross-instance operation examples

### Testing
- [ ] Instance routing tests for all tools
- [ ] Default environment fallback tests
- [ ] Invalid instance error tests
- [ ] Cross-instance operation tests

### Code Quality
- [x] Consistent parameter extraction pattern
- [x] Standardized error messages
- [x] Clear default environment indicators
- [x] DRY principle applied across tools

---

## Estimation Breakdown

**Story Points:** 6

**Effort Distribution:**
- Update 8 Workflow Tools: 1.5 SP
- Update 4 Execution Tools: 0.75 SP
- Update 6 Credential Tools: 1 SP (note isolation)
- Update 5 Tag Tools: 0.75 SP
- Error Handling & Feedback: 1 SP
- Documentation & Examples: 1 SP

**Page Count:** 10-13 pages
- Universal Parameter Schema: 1-2 pages
- Workflow Tools (8): 2-3 pages
- Execution Tools (4): 1-2 pages
- Credential Tools (6): 2 pages
- Tag Tools (5): 1 page
- Error Handling: 2-3 pages
- Documentation Examples: 2-3 pages

**Estimated Duration:** 3 days (1 developer)

---

## Notes

### Success Metrics
- 100% of tools support instance parameter
- Zero instance routing errors in production
- Users successfully manage multiple environments
- Clear error messages reduce support requests by 80%

### Common Mistakes to Avoid
- ❌ Forgetting to extract instance parameter
- ❌ Not handling default environment fallback
- ❌ Inconsistent error messages across tools
- ❌ Not indicating which instance was used
- ❌ Hardcoding instance names in tool handlers

### Best Practices
- ✅ Always extract instance first
- ✅ Use EnvironmentManager for routing
- ✅ Include instance name in all responses
- ✅ Indicate when default instance used
- ✅ Provide clear error messages with available instances

### Related Documentation
- Story 5.1: Multi-Instance Configuration System
- Story 5.2: EnvironmentManager Implementation
- Epic 4: All tool specifications

---

**Status:** Implemented in version 0.8.0
**Related Files:**
- `src/index.ts` (all 17 tool handlers)
- `docs/multi-instance-usage.md`
