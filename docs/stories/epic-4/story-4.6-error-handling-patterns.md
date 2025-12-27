# Story 4.6: Error Handling & Common Patterns Reference

**Epic:** Epic 4 - Core Features & Tools Reference Documentation
**Story Points:** 7
**Priority:** High
**Status:** Ready for Implementation
**Estimated Page Count:** 12-15 pages

---

## User Story

**As a** developer integrating the n8n MCP server into applications
**I want** comprehensive error handling documentation and common patterns reference
**So that** I can build robust integrations, troubleshoot issues efficiently, and follow best practices

---

## Story Description

### Current System

The n8n MCP server currently provides:
- **17 MCP Tools** with various error scenarios
- **4 MCP Resources** with potential failure modes
- **Multi-instance architecture** with routing complexities
- **n8n REST API integration** with HTTP error responses

However, error handling patterns are scattered across tool documentation:
- No centralized error reference
- Missing troubleshooting decision trees
- Undocumented common mistakes
- No validation pattern library
- Limited retry strategies

### Enhancement

Create comprehensive error handling and patterns documentation that:
- Catalogs all possible error types with resolutions
- Provides troubleshooting decision trees for common scenarios
- Documents validation patterns for data integrity
- Establishes best practices for robust integrations
- Includes error recovery strategies
- Cross-references errors with affected tools

### Context from Previous Epics

**Epic 1 (URL Configuration):**
- URL validation errors and normalization failures
- /api/v1/ suffix handling errors

**Epic 2 (API Implementation):**
- Credential API security restrictions (LIST/GET blocked)
- Tag update 409 Conflict issue
- Manual trigger execution limitation

**Epic 5 (Multi-Instance):**
- Instance not found errors
- Default environment fallback
- Instance validation failures

---

## Acceptance Criteria

### AC1: Error Type Catalog
**Given** a developer encountering an error
**When** they consult the error catalog
**Then** they should find:

#### 1.1 Configuration Errors

**Error Type:** Missing Configuration
```typescript
{
  code: "CONFIGURATION_ERROR",
  message: "No configuration found. Please create .config.json or .env file",
  category: "Configuration",
  severity: "Critical",
  resolution: "Create configuration file with n8n_host and n8n_api_key"
}
```

**Affected Tools:** All tools (server startup)

**Common Causes:**
- Missing .config.json and .env files
- Empty configuration files
- Invalid JSON syntax in .config.json

**Resolution Steps:**
```bash
# Option 1: Create .env file
echo "N8N_HOST=https://your-instance.app.n8n.cloud" > .env
echo "N8N_API_KEY=your_api_key_here" >> .env

# Option 2: Create .config.json file
cat > .config.json << EOF
{
  "environments": {
    "production": {
      "n8n_host": "https://your-instance.app.n8n.cloud",
      "n8n_api_key": "your_api_key_here"
    }
  },
  "defaultEnv": "production"
}
EOF
```

**Claude Desktop Example:**
```
Error: "Failed to initialize MCP server: No configuration found"

Resolution:
1. Check configuration file exists
2. Verify JSON syntax (if using .config.json)
3. Ensure required fields present (n8n_host, n8n_api_key)
4. Restart MCP server after fixing
```

---

**Error Type:** Invalid URL Format (Epic 1)
```typescript
{
  code: "INVALID_URL",
  message: "n8n_host must be a valid URL without /api/v1/ suffix",
  category: "Configuration",
  severity: "High",
  resolution: "Use base URL only (e.g., https://n8n.example.com)"
}
```

**Affected Tools:** All tools

**Common Mistakes:**
```typescript
// ❌ Incorrect - includes /api/v1/
"n8n_host": "https://n8n.example.com/api/v1/"

// ❌ Incorrect - missing protocol
"n8n_host": "n8n.example.com"

// ❌ Incorrect - has trailing path
"n8n_host": "https://n8n.example.com/workflows"

// ✅ Correct - base URL only
"n8n_host": "https://n8n.example.com"
```

**Resolution Pattern:**
```typescript
// URL validation function (from Epic 1)
function validateAndNormalizeUrl(url: string): string {
  if (url.endsWith('/api/v1/') || url.endsWith('/api/v1')) {
    throw new Error('Remove /api/v1/ from n8n_host - use base URL only');
  }
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    throw new Error('n8n_host must include protocol (https://)');
  }
  return url.replace(/\/$/, ''); // Remove trailing slash
}
```

---

**Error Type:** Invalid API Key
```typescript
{
  code: "AUTHENTICATION_ERROR",
  message: "Invalid API key or insufficient permissions",
  httpStatus: 401,
  category: "Authentication",
  severity: "Critical"
}
```

**Affected Tools:** All tools

**Common Causes:**
- Incorrect API key
- Expired API key
- Insufficient n8n user permissions
- API key for wrong n8n instance

**Resolution Steps:**
1. Verify API key in n8n UI (Settings → API)
2. Check user has necessary permissions
3. Ensure API key matches n8n instance
4. Regenerate API key if needed

**Troubleshooting Decision Tree:**
```
Authentication Error
├─ API key wrong instance?
│  └─ Update to correct instance API key
├─ API key expired?
│  └─ Regenerate in n8n UI
├─ User permissions insufficient?
│  └─ Grant necessary permissions in n8n
└─ API key typo?
   └─ Copy-paste from n8n UI (no manual typing)
```

---

#### 1.2 Multi-Instance Errors (Epic 5)

**Error Type:** Instance Not Found
```typescript
{
  code: "INSTANCE_NOT_FOUND",
  message: "Instance 'staging' not found. Available: production, development",
  category: "Multi-Instance",
  severity: "High",
  availableInstances: ["production", "development"]
}
```

**Affected Tools:** All tools with `instance` parameter

**Common Causes:**
- Typo in instance name
- Instance not configured in .config.json
- Using instance name when only .env configured

**Resolution Pattern:**
```typescript
// Always validate instance before API call
async function validateInstance(instance?: string): Promise<string> {
  const envManager = EnvironmentManager.getInstance();
  const available = envManager.listEnvironments();

  if (instance && !available.includes(instance)) {
    throw new Error(
      `Instance '${instance}' not found. Available: ${available.join(', ')}`
    );
  }

  return instance || envManager.getDefaultEnvironment();
}
```

**Claude Desktop Example:**
```
User: "List workflows from staging instance"

Error: "Instance 'staging' not found. Available: production, development"

Resolution:
1. Check .config.json for configured instances
2. Verify instance name spelling
3. Add missing instance to configuration if needed
4. Use correct instance name in tool call
```

---

**Error Type:** Default Environment Not Set
```typescript
{
  code: "DEFAULT_ENV_MISSING",
  message: "No defaultEnv specified and no instance provided",
  category: "Multi-Instance",
  severity: "Medium"
}
```

**Resolution:**
```json
{
  "environments": { ... },
  "defaultEnv": "production"  // ← Add this
}
```

---

#### 1.3 Workflow Operation Errors

**Error Type:** Workflow Not Found
```typescript
{
  code: "WORKFLOW_NOT_FOUND",
  message: "Workflow with ID '123' not found",
  httpStatus: 404,
  category: "Workflow",
  severity: "Medium"
}
```

**Affected Tools:** get_workflow, update_workflow, delete_workflow, activate_workflow, deactivate_workflow, execute_workflow

**Common Causes:**
- Incorrect workflow ID
- Workflow deleted
- Wrong instance selected

**Resolution Pattern:**
```typescript
// Always list workflows first to verify ID
const workflows = await listWorkflows({ instance: 'production' });
const workflow = workflows.data.find(w => w.name === 'My Workflow');

if (!workflow) {
  throw new Error('Workflow not found - verify name and instance');
}

// Now use verified ID
await getWorkflow({ id: workflow.id, instance: 'production' });
```

---

**Error Type:** Invalid Workflow Structure
```typescript
{
  code: "VALIDATION_ERROR",
  message: "Workflow validation failed: missing required trigger node",
  category: "Workflow",
  severity: "High",
  details: {
    field: "nodes",
    issue: "No valid trigger node found"
  }
}
```

**Affected Tools:** create_workflow, update_workflow, activate_workflow

**Common Causes:**
- Missing trigger nodes
- Invalid node type
- Malformed connections
- Invalid Set node parameters (Epic 2)

**Validation Pattern:**
```typescript
// Workflow validation checklist
function validateWorkflow(workflow: WorkflowDefinition): void {
  // 1. Check required fields
  if (!workflow.name) throw new Error('Workflow name required');
  if (!workflow.nodes || workflow.nodes.length === 0) {
    throw new Error('Workflow must have at least one node');
  }

  // 2. Validate trigger for activation
  const hasTrigger = workflow.nodes.some(node =>
    node.type.includes('Trigger') || node.type.includes('webhook')
  );
  if (workflow.active && !hasTrigger) {
    throw new Error('Active workflows require valid trigger node');
  }

  // 3. Validate connections format
  if (workflow.connections) {
    // Check if using array format (needs transformation)
    if (Array.isArray(workflow.connections)) {
      workflow.connections = transformConnectionsForN8N(workflow.connections);
    }
  }

  // 4. Validate Set node parameters (Epic 2)
  workflow.nodes.forEach(node => {
    if (node.type === 'n8n-nodes-base.set') {
      node.parameters = normalizeSetNodeParameters(node.parameters);
    }
  });
}
```

---

**Error Type:** Activation Without Valid Trigger (Epic 1)
```typescript
{
  code: "ACTIVATION_ERROR",
  message: "Cannot activate workflow without valid trigger node",
  category: "Workflow",
  severity: "High",
  resolution: "Add scheduleTrigger or webhook node before activation"
}
```

**Affected Tools:** activate_workflow, create_workflow (with active: true)

**Known Issue from Epic 1:**
- `manualTrigger` NOT recognized as valid by n8n API v1.82.3
- Server automatically adds scheduleTrigger if missing

**Resolution Pattern:**
```typescript
// Auto-add trigger before activation
async function ensureValidTrigger(workflow: WorkflowDefinition): Promise<void> {
  const hasTrigger = workflow.nodes.some(node =>
    node.type === 'n8n-nodes-base.scheduleTrigger' ||
    node.type === 'n8n-nodes-base.webhook' ||
    node.type.toLowerCase().includes('trigger')
  );

  if (!hasTrigger) {
    console.warn('No valid trigger found, adding scheduleTrigger');
    workflow.nodes.push({
      name: 'Schedule Trigger',
      type: 'n8n-nodes-base.scheduleTrigger',
      typeVersion: 1,
      position: [250, 300],
      parameters: {
        rule: { interval: [{ field: 'hours', hoursInterval: 1 }] }
      }
    });
  }
}
```

---

**Error Type:** Manual Trigger Execution Limitation (Epic 2)
```typescript
{
  code: "EXECUTION_NOT_SUPPORTED",
  message: "Workflows with only manual triggers cannot be executed via REST API",
  category: "Workflow",
  severity: "Medium",
  workaround: "Execute manually in n8n UI or add valid trigger node"
}
```

**Affected Tools:** execute_workflow

**Known API Limitation:** n8n REST API v1.82.3 cannot execute manual-trigger workflows

**Workaround:**
```typescript
async function executeWorkflow(params: { id: string }): Promise<string> {
  // Server returns helpful guidance instead of failing
  return `
Workflow execution via REST API is only supported for workflows with:
- scheduleTrigger nodes
- webhook nodes
- service-specific triggers

For manual-trigger workflows:
1. Open n8n UI
2. Navigate to workflow
3. Click "Test Workflow" button

Alternatively:
- Add a valid trigger node (schedule or webhook)
- Use activate_workflow to enable automatic execution
  `.trim();
}
```

---

#### 1.4 Execution Operation Errors

**Error Type:** Execution Not Found
```typescript
{
  code: "EXECUTION_NOT_FOUND",
  message: "Execution with ID '9999' not found",
  httpStatus: 404,
  category: "Execution",
  severity: "Low"
}
```

**Affected Tools:** get_execution, delete_execution, retry_execution

**Common Causes:**
- Incorrect execution ID
- Execution deleted
- Execution from different instance

**Resolution:**
```typescript
// List executions first to find ID
const executions = await listExecutions({
  workflowId: '123',
  limit: 10,
  instance: 'production'
});

const failedExecution = executions.data.find(e => !e.finished);
if (failedExecution) {
  await retryExecution({ id: failedExecution.id, instance: 'production' });
}
```

---

**Error Type:** Retry Already Successful
```typescript
{
  code: "RETRY_NOT_NEEDED",
  message: "Execution completed successfully - retry not needed",
  category: "Execution",
  severity: "Low"
}
```

**Affected Tools:** retry_execution

**Common Cause:** Attempting to retry successful execution

**Resolution Pattern:**
```typescript
// Check execution status before retry
async function safeRetry(executionId: number, instance?: string): Promise<void> {
  const execution = await getExecution({ id: executionId, instance });

  if (execution.finished && !execution.data?.resultData?.error) {
    throw new Error(
      `Execution ${executionId} completed successfully - retry not needed`
    );
  }

  if (!execution.finished) {
    throw new Error(
      `Execution ${executionId} still running - wait for completion before retry`
    );
  }

  // Safe to retry
  await retryExecution({ id: executionId, instance });
}
```

---

#### 1.5 Credential Operation Errors (Epic 2)

**Error Type:** Credential List/Get Blocked by n8n
```typescript
{
  code: "CREDENTIAL_ACCESS_BLOCKED",
  message: "n8n blocks LIST and GET operations for credential security",
  category: "Credential",
  severity: "Info",
  workaround: "Use n8n UI or schema-driven creation pattern"
}
```

**Affected Tools:** list_credentials, get_credential

**Known Security Restriction:** n8n API intentionally blocks these operations

**Resolution Pattern:**
```typescript
// Use schema-driven creation instead of GET
async function createCredentialSafely(type: string, data: any): Promise<void> {
  // Step 1: Get schema to understand required fields
  const schema = await getCredentialSchema({ type });

  // Step 2: Validate data against schema
  const requiredFields = schema.properties
    .filter(p => p.required)
    .map(p => p.name);

  const missingFields = requiredFields.filter(field => !data[field]);
  if (missingFields.length > 0) {
    throw new Error(
      `Missing required fields: ${missingFields.join(', ')}`
    );
  }

  // Step 3: Create with validated data
  await createCredential({
    name: 'My Credential',
    type,
    data
  });
}
```

---

**Error Type:** Credential Update Not Supported
```typescript
{
  code: "CREDENTIAL_IMMUTABLE",
  message: "Credentials cannot be updated - use DELETE + CREATE pattern",
  category: "Credential",
  severity: "Info"
}
```

**Affected Tools:** update_credential

**Known Limitation:** Credential immutability for security

**UPDATE Pattern:**
```typescript
// DELETE + CREATE pattern for credential updates
async function updateCredentialPattern(
  credentialId: string,
  newData: CredentialData,
  instance?: string
): Promise<void> {
  // Step 1: Delete old credential
  await deleteCredential({ id: credentialId, instance });

  // Step 2: Create new credential with updated data
  const newCredential = await createCredential({
    name: newData.name,
    type: newData.type,
    data: newData.data,
    instance
  });

  console.log(`Credential updated: ${credentialId} → ${newCredential.id}`);
}
```

---

#### 1.6 Tag Operation Errors (Epic 2)

**Error Type:** Tag Update 409 Conflict
```typescript
{
  code: "TAG_UPDATE_CONFLICT",
  message: "Tag update returned 409 Conflict",
  httpStatus: 409,
  category: "Tag",
  severity: "Medium",
  knownIssue: "Updating existing tag names may cause conflicts"
}
```

**Affected Tools:** update_tag

**Known Issue from Epic 2:** Tag name updates sometimes return 409 Conflict

**Workaround:**
```typescript
// Use unique names to avoid conflicts
function generateUniqueTagName(baseName: string): string {
  const timestamp = Date.now();
  return `${baseName}-${timestamp}`;
}

// Or use DELETE + CREATE pattern
async function updateTagSafely(
  tagId: string,
  newName: string,
  instance?: string
): Promise<void> {
  try {
    await updateTag({ id: tagId, name: newName, instance });
  } catch (error) {
    if (error.response?.status === 409) {
      console.warn('Tag update conflict, using DELETE + CREATE pattern');
      await deleteTag({ id: tagId, instance });
      await createTag({ name: newName, instance });
    } else {
      throw error;
    }
  }
}
```

---

#### 1.7 Connection & Network Errors

**Error Type:** Connection Timeout
```typescript
{
  code: "NETWORK_TIMEOUT",
  message: "Request to n8n API timed out after 30000ms",
  category: "Network",
  severity: "High"
}
```

**Affected Tools:** All tools

**Common Causes:**
- n8n instance down
- Network connectivity issues
- Firewall blocking requests
- Large workflow/execution data

**Resolution Pattern:**
```typescript
// Retry with exponential backoff
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) throw error;

      const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
      console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
}

// Usage
const workflow = await retryWithBackoff(() =>
  getWorkflow({ id: '123', instance: 'production' })
);
```

---

**Error Type:** Rate Limiting
```typescript
{
  code: "RATE_LIMIT_EXCEEDED",
  message: "Too many requests - rate limit exceeded",
  httpStatus: 429,
  category: "Network",
  severity: "Medium",
  retryAfter: 60
}
```

**Resolution Pattern:**
```typescript
// Implement rate limiting
class RateLimiter {
  private lastRequest = 0;
  private minInterval = 100; // 100ms between requests

  async throttle(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastRequest;

    if (elapsed < this.minInterval) {
      await new Promise(resolve =>
        setTimeout(resolve, this.minInterval - elapsed)
      );
    }

    this.lastRequest = Date.now();
  }
}

// Usage
const limiter = new RateLimiter();
for (const workflow of workflows) {
  await limiter.throttle();
  await updateWorkflow({ id: workflow.id, active: true });
}
```

---

### AC2: Troubleshooting Decision Trees
**Given** a developer encountering a specific scenario
**When** they follow the decision tree
**Then** they should reach a resolution:

#### 2.1 Workflow Creation Troubleshooting

```
Workflow Creation Failed
├─ "Workflow validation failed"?
│  ├─ Missing trigger node?
│  │  └─ Add scheduleTrigger or webhook node
│  ├─ Invalid node type?
│  │  └─ Verify node type exists in n8n instance
│  ├─ Malformed connections?
│  │  └─ Use transformConnectionsForN8N() utility
│  └─ Invalid Set node parameters?
│     └─ Use normalizeSetNodeParameters() (Epic 2)
│
├─ "Invalid URL"?
│  ├─ Contains /api/v1/?
│  │  └─ Remove suffix, use base URL only (Epic 1)
│  ├─ Missing protocol?
│  │  └─ Add https:// prefix
│  └─ Has trailing path?
│     └─ Use base domain only
│
├─ "Authentication error"?
│  ├─ API key incorrect?
│  │  └─ Copy from n8n UI Settings → API
│  ├─ Wrong instance?
│  │  └─ Verify n8n_host matches API key instance
│  └─ Insufficient permissions?
│     └─ Grant user necessary permissions in n8n
│
└─ "Instance not found"?
   ├─ Typo in instance name?
   │  └─ Check .config.json for exact names
   ├─ Instance not configured?
   │  └─ Add to .config.json environments
   └─ Using .env instead of .config.json?
      └─ Convert to multi-instance config (Epic 5)
```

---

#### 2.2 Workflow Activation Troubleshooting

```
Workflow Activation Failed
├─ "No valid trigger node"?
│  ├─ Has manualTrigger?
│  │  └─ Replace with scheduleTrigger (manualTrigger not valid)
│  ├─ No trigger at all?
│  │  └─ Add scheduleTrigger or webhook node
│  └─ Custom trigger not recognized?
│     └─ Verify trigger node type exists in n8n
│
├─ "Workflow not found"?
│  ├─ Incorrect ID?
│  │  └─ Use list_workflows to verify ID
│  ├─ Wrong instance?
│  │  └─ Check instance parameter matches workflow location
│  └─ Workflow deleted?
│     └─ Recreate workflow
│
└─ "Authentication error"?
   └─ (See Workflow Creation troubleshooting)
```

---

#### 2.3 Execution Troubleshooting

```
Execution Failed
├─ "Cannot execute workflow"?
│  ├─ Manual trigger only?
│  │  └─ Execute in n8n UI or add valid trigger (Epic 2 limitation)
│  ├─ Workflow inactive?
│  │  └─ Activate workflow first
│  └─ Missing credentials?
│     └─ Configure credentials in n8n UI
│
├─ "Execution not found"?
│  ├─ Incorrect execution ID?
│  │  └─ Use list_executions to find ID
│  ├─ Wrong instance?
│  │  └─ Verify instance parameter
│  └─ Execution deleted?
│     └─ Cannot retrieve deleted executions
│
└─ Retry failed?
   ├─ Execution successful?
   │  └─ No need to retry successful executions
   ├─ Execution still running?
   │  └─ Wait for completion before retry
   └─ Same error on retry?
      └─ Fix workflow issue before retrying again
```

---

#### 2.4 Credential Troubleshooting

```
Credential Operation Failed
├─ "Cannot list credentials"?
│  └─ n8n blocks for security (Epic 2)
│     └─ Use n8n UI or schema-driven creation
│
├─ "Cannot get credential"?
│  └─ n8n blocks for security (Epic 2)
│     └─ Use get_credential_schema for field info
│
├─ "Cannot update credential"?
│  └─ Credentials are immutable
│     └─ Use DELETE + CREATE pattern
│
├─ "Invalid credential type"?
│  └─ Check available credential types in n8n UI
│
└─ "Missing required fields"?
   ├─ Use get_credential_schema first
   │  └─ See required fields and their types
   └─ Validate data against schema before creation
```

---

### AC3: Validation Patterns Library
**Given** a developer implementing robust integrations
**When** they use validation patterns
**Then** they should prevent common errors:

#### 3.1 Input Validation Pattern

```typescript
/**
 * Validates and normalizes tool input parameters
 */
class InputValidator {
  /**
   * Validate workflow ID
   */
  static validateWorkflowId(id: any): string {
    if (!id) throw new Error('Workflow ID required');
    if (typeof id !== 'string' && typeof id !== 'number') {
      throw new Error('Workflow ID must be string or number');
    }
    return String(id);
  }

  /**
   * Validate instance name
   */
  static validateInstance(instance: any, availableInstances: string[]): string | undefined {
    if (!instance) return undefined;

    if (typeof instance !== 'string') {
      throw new Error('Instance must be a string');
    }

    if (!availableInstances.includes(instance)) {
      throw new Error(
        `Instance '${instance}' not found. Available: ${availableInstances.join(', ')}`
      );
    }

    return instance;
  }

  /**
   * Validate pagination parameters
   */
  static validatePagination(params: {
    limit?: any;
    cursor?: any;
  }): { limit?: number; cursor?: string } {
    const result: { limit?: number; cursor?: string } = {};

    if (params.limit !== undefined) {
      const limit = Number(params.limit);
      if (isNaN(limit) || limit < 1 || limit > 250) {
        throw new Error('Limit must be between 1 and 250');
      }
      result.limit = limit;
    }

    if (params.cursor !== undefined) {
      if (typeof params.cursor !== 'string') {
        throw new Error('Cursor must be a string');
      }
      result.cursor = params.cursor;
    }

    return result;
  }

  /**
   * Validate workflow definition
   */
  static validateWorkflowDefinition(workflow: any): void {
    if (!workflow.name || typeof workflow.name !== 'string') {
      throw new Error('Workflow name required (string)');
    }

    if (!Array.isArray(workflow.nodes)) {
      throw new Error('Workflow nodes must be an array');
    }

    if (workflow.nodes.length === 0) {
      throw new Error('Workflow must have at least one node');
    }

    // Validate each node
    workflow.nodes.forEach((node: any, index: number) => {
      if (!node.name) {
        throw new Error(`Node ${index} missing name`);
      }
      if (!node.type) {
        throw new Error(`Node ${index} (${node.name}) missing type`);
      }
      if (!node.position || !Array.isArray(node.position)) {
        throw new Error(`Node ${index} (${node.name}) missing position array`);
      }
    });
  }
}
```

---

#### 3.2 Error Handling Pattern

```typescript
/**
 * Standardized error handling for n8n API calls
 */
class ErrorHandler {
  /**
   * Handle API errors with context
   */
  static handleApiError(context: string, error: unknown): never {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const data = error.response?.data;

      // Authentication errors
      if (status === 401) {
        throw new Error(
          `Authentication failed for ${context}: Invalid API key or insufficient permissions`
        );
      }

      // Not found errors
      if (status === 404) {
        throw new Error(
          `Resource not found for ${context}: ${data?.message || 'Entity does not exist'}`
        );
      }

      // Validation errors
      if (status === 400) {
        throw new Error(
          `Validation failed for ${context}: ${data?.message || 'Invalid request parameters'}`
        );
      }

      // Conflict errors (e.g., tag updates)
      if (status === 409) {
        throw new Error(
          `Conflict for ${context}: ${data?.message || 'Resource conflict - try DELETE + CREATE pattern'}`
        );
      }

      // Rate limiting
      if (status === 429) {
        const retryAfter = error.response?.headers['retry-after'] || 60;
        throw new Error(
          `Rate limit exceeded for ${context}: Retry after ${retryAfter} seconds`
        );
      }

      // Server errors
      if (status && status >= 500) {
        throw new Error(
          `n8n server error for ${context}: ${data?.message || 'Internal server error'}`
        );
      }

      // Generic HTTP error
      throw new Error(
        `HTTP error ${status} for ${context}: ${data?.message || error.message}`
      );
    }

    // Network errors
    if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
      throw new Error(
        `Cannot connect to n8n instance for ${context}: Check n8n_host configuration`
      );
    }

    if (error instanceof Error && error.message.includes('timeout')) {
      throw new Error(
        `Request timeout for ${context}: n8n instance may be slow or down`
      );
    }

    // Generic errors
    throw new Error(
      `Unexpected error for ${context}: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  /**
   * Safe async wrapper with error context
   */
  static async withContext<T>(
    context: string,
    operation: () => Promise<T>
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      this.handleApiError(context, error);
    }
  }
}

// Usage example
const workflow = await ErrorHandler.withContext(
  'get workflow 123',
  () => api.getWorkflow('123')
);
```

---

#### 3.3 Retry Pattern

```typescript
/**
 * Retry logic with exponential backoff
 */
class RetryHandler {
  static async withRetry<T>(
    operation: () => Promise<T>,
    options: {
      maxRetries?: number;
      baseDelay?: number;
      maxDelay?: number;
      retryableErrors?: number[];
    } = {}
  ): Promise<T> {
    const {
      maxRetries = 3,
      baseDelay = 1000,
      maxDelay = 30000,
      retryableErrors = [408, 429, 500, 502, 503, 504]
    } = options;

    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Check if error is retryable
        const isRetryable =
          axios.isAxiosError(error) &&
          error.response?.status &&
          retryableErrors.includes(error.response.status);

        if (!isRetryable || attempt === maxRetries) {
          throw lastError;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          baseDelay * Math.pow(2, attempt - 1),
          maxDelay
        );

        console.warn(
          `Attempt ${attempt}/${maxRetries} failed, retrying in ${delay}ms...`
        );

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError || new Error('Retry failed');
  }
}

// Usage example
const workflow = await RetryHandler.withRetry(
  () => api.getWorkflow('123'),
  {
    maxRetries: 3,
    baseDelay: 1000,
    retryableErrors: [429, 500, 502, 503]
  }
);
```

---

#### 3.4 Safe Workflow Modification Pattern

```typescript
/**
 * Safe workflow modification with validation
 */
class WorkflowModifier {
  /**
   * Safely update workflow with rollback capability
   */
  static async safeUpdate(params: {
    workflowId: string;
    updates: Partial<WorkflowDefinition>;
    instance?: string;
    validateBeforeUpdate?: boolean;
  }): Promise<WorkflowDefinition> {
    const { workflowId, updates, instance, validateBeforeUpdate = true } = params;

    // Step 1: Get current workflow (backup)
    const currentWorkflow = await api.getWorkflow(workflowId, instance);

    try {
      // Step 2: Merge updates
      const updatedWorkflow = {
        ...currentWorkflow,
        ...updates
      };

      // Step 3: Validate if requested
      if (validateBeforeUpdate) {
        InputValidator.validateWorkflowDefinition(updatedWorkflow);

        // Transform connections if needed
        if (updatedWorkflow.connections && Array.isArray(updatedWorkflow.connections)) {
          updatedWorkflow.connections = transformConnectionsForN8N(
            updatedWorkflow.connections
          );
        }

        // Normalize Set nodes if needed
        updatedWorkflow.nodes = updatedWorkflow.nodes.map(node => {
          if (node.type === 'n8n-nodes-base.set') {
            return {
              ...node,
              parameters: normalizeSetNodeParameters(node.parameters)
            };
          }
          return node;
        });
      }

      // Step 4: Apply update
      return await api.updateWorkflow(workflowId, updatedWorkflow, instance);

    } catch (error) {
      console.error('Workflow update failed, current state preserved');
      throw error; // Original workflow still intact in n8n
    }
  }
}
```

---

### AC4: Best Practices Guide
**Given** a developer building production integrations
**When** they follow best practices
**Then** they should create robust, maintainable code:

#### 4.1 Configuration Best Practices

**✅ DO:**
```typescript
// Use multi-instance configuration
{
  "environments": {
    "production": { "n8n_host": "...", "n8n_api_key": "..." },
    "staging": { "n8n_host": "...", "n8n_api_key": "..." }
  },
  "defaultEnv": "staging" // Safe default for testing
}

// Validate configuration on startup
function validateConfig(config: Config): void {
  for (const [name, env] of Object.entries(config.environments)) {
    if (!env.n8n_host || !env.n8n_api_key) {
      throw new Error(`Invalid config for ${name}: missing required fields`);
    }
    if (env.n8n_host.includes('/api/v1')) {
      throw new Error(`Invalid n8n_host for ${name}: remove /api/v1 suffix`);
    }
  }
}

// Use environment variables for sensitive data
const config = {
  environments: {
    production: {
      n8n_host: process.env.PROD_N8N_HOST,
      n8n_api_key: process.env.PROD_N8N_API_KEY
    }
  }
};
```

**❌ DON'T:**
```typescript
// Hardcode credentials
const apiKey = "n8n_api_key_abc123"; // Security risk!

// Include /api/v1 in configuration
"n8n_host": "https://n8n.example.com/api/v1/" // Will fail!

// Mix configuration sources
if (hasConfigJson && hasEnvFile) {
  // Unclear which takes precedence
}
```

---

#### 4.2 Error Handling Best Practices

**✅ DO:**
```typescript
// Always handle errors with context
try {
  const workflow = await getWorkflow({ id: '123' });
} catch (error) {
  console.error('Failed to get workflow 123:', error.message);
  // Provide fallback or guidance
  throw new Error(`Workflow retrieval failed: ${error.message}`);
}

// Use typed error handling
if (axios.isAxiosError(error)) {
  const status = error.response?.status;
  if (status === 404) {
    // Handle not found specifically
  } else if (status === 401) {
    // Handle authentication specifically
  }
}

// Implement retry for transient failures
const workflow = await RetryHandler.withRetry(
  () => getWorkflow({ id: '123' }),
  { maxRetries: 3, retryableErrors: [500, 502, 503] }
);

// Log errors appropriately
console.error('[ERROR] API call failed:', {
  context: 'get_workflow',
  workflowId: '123',
  error: error.message,
  timestamp: new Date().toISOString()
});
```

**❌ DON'T:**
```typescript
// Swallow errors silently
try {
  await getWorkflow({ id: '123' });
} catch {
  // Silent failure - impossible to debug!
}

// Expose sensitive information in errors
throw new Error(`API call failed: ${apiKey} is invalid`);

// Retry non-retryable errors
await retry(() => getWorkflow({ id: 'invalid' })); // 404 won't succeed on retry!

// Use generic error messages
throw new Error('Something went wrong'); // Unhelpful!
```

---

#### 4.3 Workflow Operation Best Practices

**✅ DO:**
```typescript
// Validate before creation
InputValidator.validateWorkflowDefinition(workflow);

// Transform connections to n8n format
workflow.connections = transformConnectionsForN8N(workflow.connections);

// Normalize Set node parameters
workflow.nodes = workflow.nodes.map(node => {
  if (node.type === 'n8n-nodes-base.set') {
    return { ...node, parameters: normalizeSetNodeParameters(node.parameters) };
  }
  return node;
});

// Add valid trigger before activation
if (workflow.active) {
  await ensureValidTrigger(workflow);
}

// Use specific instance for production
await createWorkflow({ ...workflow, instance: 'production' });

// List workflows with pagination
let allWorkflows = [];
let cursor = undefined;
do {
  const response = await listWorkflows({ limit: 100, cursor });
  allWorkflows.push(...response.data);
  cursor = response.nextCursor;
} while (cursor);
```

**❌ DON'T:**
```typescript
// Create workflow without validation
await createWorkflow(userInput); // May have invalid structure!

// Forget connection transformation
workflow.connections = arrayFormat; // n8n won't understand this!

// Use manualTrigger for active workflows
workflow.nodes = [{ type: 'n8n-nodes-base.manualTrigger', ... }];
workflow.active = true; // Will fail! (Epic 1 issue)

// Fetch all workflows without pagination
const workflows = await listWorkflows({ limit: 9999 }); // May crash!

// Modify production without instance
await updateWorkflow({ id: '123', active: false }); // Wrong instance?
```

---

#### 4.4 Credential Management Best Practices

**✅ DO:**
```typescript
// Use schema-driven creation
const schema = await getCredentialSchema({ type: 'httpBasicAuth' });
console.log('Required fields:', schema.properties.filter(p => p.required));

const credential = await createCredential({
  name: 'API Credential',
  type: 'httpBasicAuth',
  data: {
    user: process.env.API_USER,
    password: process.env.API_PASSWORD
  }
});

// Use DELETE + CREATE for updates
async function updateCredential(id: string, newData: any) {
  await deleteCredential({ id });
  return await createCredential(newData);
}

// Manage credentials through n8n UI for complex types
// (OAuth2, JWT, etc.)
```

**❌ DON'T:**
```typescript
// Try to list credentials
const creds = await listCredentials(); // Blocked by n8n!

// Try to get credential details
const cred = await getCredential({ id: '123' }); // Blocked by n8n!

// Try to update credentials directly
await updateCredential({ id: '123', data: {...} }); // Not supported!

// Hardcode credential data
const cred = await createCredential({
  data: { user: 'admin', password: 'password123' } // Security risk!
});
```

---

#### 4.5 Performance Best Practices

**✅ DO:**
```typescript
// Use streamlined list_workflows (Epic 2 optimization)
const workflows = await listWorkflows({ limit: 50 }); // Metadata only

// Implement pagination for large datasets
async function getAllExecutions(workflowId: string): Promise<Execution[]> {
  const executions = [];
  let cursor = undefined;

  do {
    const response = await listExecutions({
      workflowId,
      limit: 100,
      cursor
    });
    executions.push(...response.data);
    cursor = response.nextCursor;
  } while (cursor);

  return executions;
}

// Cache frequently accessed data
const workflowCache = new Map<string, WorkflowDefinition>();

async function getCachedWorkflow(id: string): Promise<WorkflowDefinition> {
  if (!workflowCache.has(id)) {
    const workflow = await getWorkflow({ id });
    workflowCache.set(id, workflow);
  }
  return workflowCache.get(id)!;
}

// Use batch operations when possible
await Promise.all(
  workflowIds.map(id => activateWorkflow({ id, instance: 'production' }))
);
```

**❌ DON'T:**
```typescript
// Fetch full workflow data when only metadata needed
const workflows = await Promise.all(
  ids.map(id => getWorkflow({ id })) // Wasteful for large lists!
);

// Load all executions without pagination
const executions = await listExecutions({
  workflowId: '123',
  limit: 99999 // May crash Claude Desktop!
});

// Make sequential API calls in loops
for (const id of workflowIds) {
  await activateWorkflow({ id }); // Slow!
}

// Refetch unchanged data repeatedly
const workflow = await getWorkflow({ id: '123' }); // Every time!
```

---

### AC5: Common Mistake Prevention
**Given** developers learning the MCP server
**When** they review common mistakes
**Then** they should avoid these patterns:

#### 5.1 Top 10 Common Mistakes

**1. Including /api/v1/ in n8n_host (Epic 1)**
```typescript
// ❌ WRONG
"n8n_host": "https://n8n.example.com/api/v1/"

// ✅ CORRECT
"n8n_host": "https://n8n.example.com"
```

**2. Using manualTrigger for active workflows (Epic 1)**
```typescript
// ❌ WRONG - manualTrigger not recognized by n8n API
{
  nodes: [{ type: 'n8n-nodes-base.manualTrigger', ... }],
  active: true
}

// ✅ CORRECT - use scheduleTrigger or webhook
{
  nodes: [{ type: 'n8n-nodes-base.scheduleTrigger', ... }],
  active: true
}
```

**3. Forgetting connection format transformation**
```typescript
// ❌ WRONG - array format sent to n8n
workflow.connections = [
  { source: 'Node1', target: 'Node2' }
];

// ✅ CORRECT - transform to n8n object format
workflow.connections = transformConnectionsForN8N([
  { source: 'Node1', target: 'Node2' }
]);
```

**4. Trying to list/get credentials (Epic 2)**
```typescript
// ❌ WRONG - blocked by n8n for security
const credentials = await listCredentials();

// ✅ CORRECT - use schema-driven creation
const schema = await getCredentialSchema({ type: 'httpBasicAuth' });
const credential = await createCredential({ ...data });
```

**5. Wrong instance parameter**
```typescript
// ❌ WRONG - typo in instance name
await getWorkflow({ id: '123', instance: 'prod' }); // Should be 'production'

// ✅ CORRECT - verify instance names
const instances = envManager.listEnvironments();
console.log('Available:', instances); // ['production', 'staging']
await getWorkflow({ id: '123', instance: 'production' });
```

**6. Not handling errors**
```typescript
// ❌ WRONG - unhandled promise rejection
const workflow = await getWorkflow({ id: '123' });

// ✅ CORRECT - handle errors
try {
  const workflow = await getWorkflow({ id: '123' });
} catch (error) {
  console.error('Failed to get workflow:', error.message);
  // Provide fallback or user guidance
}
```

**7. Loading all data without pagination**
```typescript
// ❌ WRONG - may crash with large datasets
const executions = await listExecutions({ limit: 99999 });

// ✅ CORRECT - use pagination
let cursor = undefined;
do {
  const response = await listExecutions({ limit: 100, cursor });
  processExecutions(response.data);
  cursor = response.nextCursor;
} while (cursor);
```

**8. Trying to execute manual-trigger workflows (Epic 2)**
```typescript
// ❌ WRONG - API limitation
await executeWorkflow({ id: '123' }); // Fails if workflow has manualTrigger only

// ✅ CORRECT - check trigger type or use n8n UI
const workflow = await getWorkflow({ id: '123' });
const hasTrigger = workflow.nodes.some(n => n.type.includes('Trigger'));
if (!hasTrigger) {
  console.log('Execute this workflow in n8n UI');
}
```

**9. Hardcoding credentials**
```typescript
// ❌ WRONG - security risk
const credential = await createCredential({
  data: { apiKey: 'sk-abc123...' } // Exposed in code!
});

// ✅ CORRECT - use environment variables
const credential = await createCredential({
  data: { apiKey: process.env.API_KEY }
});
```

**10. Not validating workflow structure**
```typescript
// ❌ WRONG - no validation
await createWorkflow(userProvidedWorkflow);

// ✅ CORRECT - validate first
InputValidator.validateWorkflowDefinition(userProvidedWorkflow);
await createWorkflow(userProvidedWorkflow);
```

---

## Dependencies

### Upstream Dependencies
- Epic 1 Story 1.1 (URL Configuration) - URL validation errors
- Epic 2 All Stories (API Validation) - API limitation documentation
- Epic 5 Story 5.1 (Multi-Instance) - Instance routing errors
- Stories 4.1-4.5 (Tool Documentation) - Tool-specific error contexts

### Downstream Dependencies
- Epic 6 (Examples & Tutorials) - Error handling examples
- Epic 7 (API Reference) - Error response schemas
- Epic 8 (Deployment) - Production error handling guides

### Cross-Story Dependencies
- All Epic 4 Stories - Error contexts for each tool category

---

## Definition of Done

### Documentation Completeness
- [ ] All error types cataloged with resolutions (15+ error types)
- [ ] 4+ troubleshooting decision trees for common scenarios
- [ ] Validation pattern library with TypeScript examples
- [ ] Best practices guide covering all tool categories
- [ ] Top 10 common mistakes documented with correct patterns

### Code Examples
- [ ] 20+ TypeScript code examples for patterns
- [ ] Error handling class implementations
- [ ] Retry logic with exponential backoff
- [ ] Input validation utilities
- [ ] Safe operation wrappers

### Cross-References
- [ ] Links to Epic 1 URL configuration issues
- [ ] Links to Epic 2 API limitations
- [ ] Links to Epic 5 multi-instance errors
- [ ] Links to Stories 4.1-4.5 for tool contexts
- [ ] Links to known issues from previous epics

### Validation
- [ ] Technical review by development team
- [ ] Error scenarios tested with actual MCP server
- [ ] Decision trees validated for correctness
- [ ] Best practices verified against production use cases

---

## Estimation Breakdown

**Story Points:** 7

**Effort Distribution:**
- Research & Error Catalog: 1.5 SP (gather all error types)
- Troubleshooting Trees: 1.5 SP (4+ decision trees)
- Validation Patterns: 1.5 SP (pattern library with code)
- Best Practices: 1.5 SP (comprehensive guide)
- Common Mistakes: 1 SP (top 10 with corrections)

**Page Count:** 12-15 pages
- Error Catalog: 4-5 pages (15+ errors)
- Decision Trees: 2-3 pages (4 trees)
- Validation Patterns: 2-3 pages (code examples)
- Best Practices: 2-3 pages (all categories)
- Common Mistakes: 1-2 pages (top 10)

**Estimated Duration:** 4-5 days (1 developer)

---

## Notes

### Success Metrics
- Developers resolve 80%+ of issues using documentation
- Decision trees lead to resolution in <5 minutes
- Common mistakes section prevents 90%+ of typical errors
- Error catalog covers all observed production errors

### Common Documentation Mistakes to Avoid
- ❌ Listing errors without resolutions
- ❌ Missing code examples for patterns
- ❌ Decision trees that don't reach resolution
- ❌ Best practices without rationale
- ❌ Incomplete error context

### Best Practices
- ✅ Provide resolution for every error type
- ✅ Include TypeScript implementations of patterns
- ✅ Decision trees with clear end states
- ✅ Best practices with DO/DON'T comparisons
- ✅ Cross-reference with epic issues

### Documentation Organization
```
docs/
└── reference/
    └── error-handling-patterns.md
        ├── Error Catalog (15+ types)
        ├── Troubleshooting Trees (4+)
        ├── Validation Patterns
        ├── Best Practices
        └── Common Mistakes
```

---

**Related Stories:**
- Story 4.1: Workflows Management Tools (workflow-specific errors)
- Story 4.2: Executions Management Tools (execution errors)
- Story 4.3: Tags Management Tools (tag errors)
- Story 4.4: Credentials Security Guidance (credential errors)
- Story 4.5: MCP Resources Documentation (resource errors)

**Related Epics:**
- Epic 1: URL Configuration Fix (URL validation errors)
- Epic 2: API Implementation Validation (API limitations)
- Epic 5: Multi-Instance Architecture (instance routing)
- Epic 6: Examples & Tutorials (error handling examples)
- Epic 7: API Reference Documentation (error response schemas)
