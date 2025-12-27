# Executions API Reference

Complete API reference for execution management operations. Monitor, debug, and retry workflow executions across instances.

---

## Overview

The Executions API provides programmatic access to workflow execution history, detailed execution data, and retry capabilities.

**Available Operations:**

| Operation | Purpose | Common Use Cases |
|-----------|---------|------------------|
| `list_executions` | List execution history | Monitoring, debugging, analytics |
| `get_execution` | Get detailed execution data | Root cause analysis, debugging |
| `delete_execution` | Remove execution records | Cleanup, compliance |
| `retry_execution` | Retry failed executions | Error recovery, reprocessing |

---

## list_executions

List workflow execution history with filtering and cursor-based pagination.

### Purpose

Retrieve execution records for monitoring, debugging, analytics, and compliance. Supports comprehensive filtering by workflow, status, and time ranges.

### Use Cases

- Building execution monitoring dashboards
- Tracking workflow success/failure rates
- Finding failed executions for retry
- Debugging specific workflow runs
- Compliance and audit reporting
- Performance analysis

---

### Request

**MCP Tool Name:** `list_executions`

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| instance | string | No | default | Instance identifier |
| workflowId | string | No | - | Filter by workflow ID |
| finished | boolean | No | - | Filter by completion status |
| status | string | No | - | Filter by status: 'success', 'error', 'waiting' |
| includeData | boolean | No | false | Include execution data (slower, larger response) |
| limit | number | No | 100 | Max executions (1-250) |
| cursor | string | No | - | Pagination cursor |

**TypeScript Interface:**

```typescript
interface ListExecutionsParams {
  instance?: string;
  workflowId?: string;
  finished?: boolean;
  status?: 'success' | 'error' | 'waiting';
  includeData?: boolean;
  limit?: number;   // Range: 1-250
  cursor?: string;
}
```

**JSON-RPC Request Example:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "list_executions",
    "arguments": {
      "instance": "production",
      "workflowId": "123",
      "finished": true,
      "status": "error",
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
interface ExecutionListResponse {
  data: ExecutionSummary[];
  nextCursor?: string;
}

interface ExecutionSummary {
  id: number;
  workflowId: number;
  finished: boolean;
  mode: ExecutionMode;
  startedAt: string;       // ISO 8601 timestamp
  stoppedAt?: string;      // ISO 8601 timestamp
  retryOf?: number;        // If this is a retry
  retrySuccessId?: number; // If retry succeeded
}

type ExecutionMode =
  | 'manual'     // Manual execution via UI
  | 'trigger'    // Triggered automatically
  | 'webhook'    // Webhook execution
  | 'retry'      // Retry of previous execution
  | 'cli'        // CLI execution
  | 'error'      // Error workflow execution
  | 'integrated' // Integrated workflow
  | 'internal';  // Internal execution
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
      \"id\": 9876,
      \"workflowId\": 123,
      \"finished\": true,
      \"mode\": \"webhook\",
      \"startedAt\": \"2025-01-15T10:30:00.000Z\",
      \"stoppedAt\": \"2025-01-15T10:30:02.245Z\"
    },
    {
      \"id\": 9875,
      \"workflowId\": 123,
      \"finished\": false,
      \"mode\": \"manual\",
      \"startedAt\": \"2025-01-15T10:25:00.000Z\"
    }
  ],
  \"nextCursor\": \"eyJvZmZzZXQiOjEwMH0=\"
}"
    }]
  }
}
```

**Field Descriptions:**

- **id**: Unique execution identifier (number)
- **workflowId**: ID of executed workflow
- **finished**: Whether execution completed (true/false)
- **mode**: How execution was triggered
- **startedAt**: Execution start timestamp (UTC)
- **stoppedAt**: Execution end timestamp (UTC, null if running)
- **retryOf**: Original execution ID if this is a retry
- **retrySuccessId**: Successful retry execution ID (if applicable)

---

### Filtering Examples

**Failed Executions:**

```typescript
// Find all failed executions in production
const failed = await callTool('list_executions', {
  instance: 'production',
  finished: true,
  status: 'error',
  limit: 100
});

console.log(`Found ${failed.data.length} failed executions`);
```

**Specific Workflow Executions:**

```typescript
// Get execution history for specific workflow
const workflowRuns = await callTool('list_executions', {
  instance: 'production',
  workflowId: '123',
  limit: 100
});

// Calculate success rate
const successful = workflowRuns.data.filter(e =>
  e.finished && !e.error
).length;
const total = workflowRuns.data.filter(e => e.finished).length;
const successRate = (successful / total * 100).toFixed(2);

console.log(`Success rate: ${successRate}%`);
```

**Currently Running Executions:**

```typescript
// Find all currently running executions
const running = await callTool('list_executions', {
  instance: 'production',
  finished: false
});

console.log(`${running.data.length} executions currently running`);
running.data.forEach(exec => {
  const duration = Date.now() - new Date(exec.startedAt).getTime();
  console.log(`- Execution ${exec.id}: running for ${duration}ms`);
});
```

---

### Pagination

Same cursor-based pagination as workflows API:

```typescript
async function getAllExecutions(
  workflowId: string,
  instance?: string
): Promise<ExecutionSummary[]> {
  const allExecutions: ExecutionSummary[] = [];
  let cursor: string | undefined;

  do {
    const response = await callTool('list_executions', {
      instance,
      workflowId,
      limit: 100,
      cursor
    });

    const result = JSON.parse(response.content[0].text);
    allExecutions.push(...result.data);
    cursor = result.nextCursor;
  } while (cursor);

  return allExecutions;
}
```

---

## get_execution

Get detailed execution data including node outputs, errors, and execution flow.

### Purpose

Retrieve complete execution information for debugging, analysis, and audit purposes. Includes all node data, errors, and execution metadata.

### Use Cases

- Debugging failed workflows
- Analyzing execution performance
- Auditing data flow
- Root cause analysis
- Performance profiling

---

### Request

**MCP Tool Name:** `get_execution`

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| instance | string | No | default | Instance identifier |
| id | number\|string | Yes | - | Execution ID |
| includeData | boolean | No | true | Include execution data (node outputs, errors) |

**TypeScript Interface:**

```typescript
interface GetExecutionParams {
  instance?: string;
  id: number | string;
  includeData?: boolean;
}
```

**JSON-RPC Request:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "get_execution",
    "arguments": {
      "instance": "production",
      "id": 9876,
      "includeData": true
    }
  }
}
```

---

### Response

**Complete Execution Object:**

**TypeScript Interface:**

```typescript
interface Execution {
  id: number;
  workflowId: number;
  finished: boolean;
  mode: ExecutionMode;
  startedAt: string;
  stoppedAt?: string;
  retryOf?: number;
  retrySuccessId?: number;
  data?: ExecutionData;
}

interface ExecutionData {
  resultData: {
    runData: {
      [nodeName: string]: NodeRun[];
    };
    lastNodeExecuted: string;
    error?: ExecutionError;
  };
  workflowData: {
    id: number;
    name: string;
    nodes: Node[];
    connections: Connections;
  };
}

interface NodeRun {
  startTime: number;           // Unix timestamp (ms)
  executionTime: number;       // Duration in ms
  data: {
    main: Array<Array<{
      json: Record<string, any>;
      binary?: Record<string, BinaryData>;
    }>>;
  };
  error?: {
    message: string;
    description?: string;
    context?: any;
  };
}

interface ExecutionError {
  message: string;
  stack?: string;
  context?: any;
}
```

---

### Response Examples

**Successful Execution:**

```json
{
  "id": 9876,
  "workflowId": 123,
  "finished": true,
  "mode": "webhook",
  "startedAt": "2025-01-15T10:30:00.000Z",
  "stoppedAt": "2025-01-15T10:30:02.245Z",
  "data": {
    "resultData": {
      "runData": {
        "Webhook": [{
          "startTime": 1736936400000,
          "executionTime": 12,
          "data": {
            "main": [[{
              "json": {
                "headers": {...},
                "body": {"order_id": "12345", "amount": 99.99}
              }
            }]]
          }
        }],
        "Process Order": [{
          "startTime": 1736936400012,
          "executionTime": 233,
          "data": {
            "main": [[{
              "json": {
                "status": "processed",
                "order_id": "12345",
                "total": 99.99
              }
            }]]
          }
        }]
      },
      "lastNodeExecuted": "Process Order"
    },
    "workflowData": {
      "id": 123,
      "name": "Order Processing",
      "nodes": [...],
      "connections": {...}
    }
  }
}
```

**Failed Execution:**

```json
{
  "id": 9877,
  "workflowId": 123,
  "finished": true,
  "mode": "trigger",
  "startedAt": "2025-01-15T11:00:00.000Z",
  "stoppedAt": "2025-01-15T11:00:05.123Z",
  "data": {
    "resultData": {
      "runData": {
        "Trigger": [{
          "startTime": 1736938800000,
          "executionTime": 5,
          "data": { "main": [[{"json": {...}}]] }
        }],
        "HTTP Request": [{
          "startTime": 1736938800005,
          "executionTime": 5118,
          "error": {
            "message": "ETIMEDOUT: Connection timeout",
            "description": "The HTTP request took too long to complete (timeout: 5000ms)"
          }
        }]
      },
      "lastNodeExecuted": "HTTP Request",
      "error": {
        "message": "ETIMEDOUT: Connection timeout",
        "stack": "Error: ETIMEDOUT\\n    at Timeout.onTimeout (...)"
      }
    }
  }
}
```

---

### Debugging Pattern

**Comprehensive Execution Debugger:**

```typescript
async function debugFailedExecution(
  executionId: number,
  instance?: string
): Promise<void> {
  console.log(`\n=== Debugging Execution ${executionId} ===\n`);

  const execution = await callTool('get_execution', {
    id: executionId,
    instance,
    includeData: true
  });

  const exec = JSON.parse(execution.content[0].text);

  // Check execution status
  if (!exec.data?.resultData?.error) {
    console.log('✅ Execution completed successfully');
    return;
  }

  // Extract error information
  const error = exec.data.resultData.error;
  const lastNode = exec.data.resultData.lastNodeExecuted;
  const runData = exec.data.resultData.runData;

  console.log('❌ Execution Failed\n');
  console.log(`Workflow: ${exec.data.workflowData.name} (ID: ${exec.workflowId})`);
  console.log(`Execution: ${exec.id}`);
  console.log(`Started: ${exec.startedAt}`);
  console.log(`Stopped: ${exec.stoppedAt}`);
  console.log(`Duration: ${
    new Date(exec.stoppedAt).getTime() - new Date(exec.startedAt).getTime()
  }ms\n`);

  console.log(`Last Node Executed: ${lastNode}`);
  console.log(`Error Message: ${error.message}\n`);

  // Get node-specific error
  const nodeRun = runData[lastNode]?.[0];
  if (nodeRun?.error) {
    console.log('Node Error Details:');
    console.log(`  Message: ${nodeRun.error.message}`);
    if (nodeRun.error.description) {
      console.log(`  Description: ${nodeRun.error.description}`);
    }
    if (nodeRun.error.context) {
      console.log(`  Context: ${JSON.stringify(nodeRun.error.context, null, 2)}`);
    }
  }

  // Analyze execution flow
  const executedNodes = Object.keys(runData);
  console.log(`\nExecution Flow:`);
  executedNodes.forEach((nodeName, i) => {
    const runs = runData[nodeName];
    const lastRun = runs[runs.length - 1];
    const status = lastRun.error ? '❌' : '✅';
    console.log(`  ${i + 1}. ${status} ${nodeName} (${lastRun.executionTime}ms)`);
  });

  // Performance analysis
  console.log(`\nPerformance:`);
  const nodePerformance = executedNodes.map(nodeName => {
    const run = runData[nodeName][0];
    return { node: nodeName, time: run.executionTime };
  }).sort((a, b) => b.time - a.time);

  nodePerformance.forEach(({ node, time }) => {
    console.log(`  ${node}: ${time}ms`);
  });

  // Suggest retry if recoverable
  if (error.message.includes('TIMEOUT') || error.message.includes('ECONNREFUSED')) {
    console.log(`\n💡 Suggestion: This appears to be a transient error. Consider retrying.`);
  }
}

// Usage
await debugFailedExecution(9877, 'production');
```

---

## retry_execution

Retry a failed execution, creating a new execution as a retry of the original.

### Purpose

Recover from transient failures by retrying failed executions. Creates new execution with `retryOf` reference.

### Use Cases

- Recovering from network timeouts
- Retrying after service outages
- Handling rate limit errors
- Reprocessing after temporary failures

---

### Request

**MCP Tool Name:** `retry_execution`

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| instance | string | No | Instance identifier |
| id | number\|string | Yes | Execution ID to retry |

**TypeScript Interface:**

```typescript
interface RetryExecutionParams {
  instance?: string;
  id: number | string;
}
```

---

### Response

Returns new execution object created as retry:

```typescript
interface RetryExecutionResponse {
  id: number;              // New execution ID (different from original)
  workflowId: number;
  retryOf: number;         // Original execution ID
  mode: 'retry';           // Always 'retry'
  finished: boolean;
  startedAt: string;
  stoppedAt?: string;
  data?: ExecutionData;
}
```

---

### Retry Validation

**Pre-Retry Checks:**

```typescript
async function safeRetry(
  executionId: number,
  instance?: string
): Promise<Execution> {
  // Get execution details
  const execution = await callTool('get_execution', {
    id: executionId,
    instance,
    includeData: true
  });

  const exec = JSON.parse(execution.content[0].text);

  // Check 1: Execution finished?
  if (!exec.finished) {
    throw new Error(
      `Execution ${executionId} is still running. ` +
      `Wait for completion before retrying.`
    );
  }

  // Check 2: Did it actually fail?
  if (!exec.data?.resultData?.error) {
    throw new Error(
      `Execution ${executionId} completed successfully. ` +
      `No retry needed.`
    );
  }

  // Check 3: Already retried successfully?
  if (exec.retrySuccessId) {
    console.warn(
      `Warning: Execution ${executionId} was already retried successfully ` +
      `(retry execution: ${exec.retrySuccessId})`
    );
  }

  // Safe to retry
  console.log(`Retrying execution ${executionId}...`);
  const retry = await callTool('retry_execution', {
    id: executionId,
    instance
  });

  const result = JSON.parse(retry.content[0].text);
  console.log(`Created retry execution: ${result.id}`);

  return result;
}
```

---

### Retry Chain Tracking

**Get Complete Retry History:**

```typescript
async function getRetryChain(
  executionId: number,
  instance?: string
): Promise<Execution[]> {
  const chain: Execution[] = [];
  let currentId: number | undefined = executionId;

  // Walk backwards through retry chain
  while (currentId) {
    const execution = await callTool('get_execution', {
      id: currentId,
      instance,
      includeData: false  // Metadata only for efficiency
    });

    const exec = JSON.parse(execution.content[0].text);
    chain.push(exec);

    // Check if this execution was itself a retry
    currentId = exec.retryOf;
  }

  // Reverse to show original first
  return chain.reverse();
}

// Usage
const chain = await getRetryChain(10123, 'production');

console.log('Retry Chain:');
chain.forEach((exec, i) => {
  const status = exec.finished
    ? (exec.data?.resultData?.error ? '❌ Failed' : '✅ Success')
    : '🔄 Running';

  console.log(`  ${i + 1}. Execution ${exec.id} - ${status}`);
  console.log(`     Started: ${exec.startedAt}`);
  if (exec.stoppedAt) {
    const duration = new Date(exec.stoppedAt).getTime() -
                    new Date(exec.startedAt).getTime();
    console.log(`     Duration: ${duration}ms`);
  }
});

// Example output:
// Retry Chain:
//   1. Execution 9870 - ❌ Failed
//      Started: 2025-01-15T10:00:00Z
//      Duration: 5123ms
//   2. Execution 9875 - ❌ Failed
//      Started: 2025-01-15T10:05:00Z
//      Duration: 4892ms
//   3. Execution 10123 - ✅ Success
//      Started: 2025-01-15T10:10:00Z
//      Duration: 2145ms
```

---

### Retry Strategies

**1. Simple Retry:**

```typescript
async function simpleRetry(executionId: number, instance?: string) {
  const retry = await callTool('retry_execution', {
    id: executionId,
    instance
  });

  return JSON.parse(retry.content[0].text);
}
```

**2. Retry with Exponential Backoff:**

```typescript
async function retryWithBackoff(
  executionId: number,
  instance?: string,
  maxAttempts: number = 3
): Promise<Execution> {
  let attempt = 1;
  let lastError: Error | null = null;

  while (attempt <= maxAttempts) {
    console.log(`Retry attempt ${attempt}/${maxAttempts}...`);

    const retry = await callTool('retry_execution', {
      id: executionId,
      instance
    });

    const result = JSON.parse(retry.content[0].text);

    // Wait for execution to complete
    await waitForCompletion(result.id, instance);

    // Check if succeeded
    const execution = await callTool('get_execution', {
      id: result.id,
      instance,
      includeData: true
    });

    const exec = JSON.parse(execution.content[0].text);

    if (!exec.data?.resultData?.error) {
      console.log(`✅ Retry succeeded on attempt ${attempt}`);
      return exec;
    }

    lastError = new Error(exec.data.resultData.error.message);
    console.log(`❌ Retry attempt ${attempt} failed: ${lastError.message}`);

    // Exponential backoff: 1s, 2s, 4s, 8s, etc.
    if (attempt < maxAttempts) {
      const delay = Math.pow(2, attempt - 1) * 1000;
      console.log(`Waiting ${delay}ms before next attempt...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    attempt++;
  }

  throw new Error(
    `All ${maxAttempts} retry attempts failed. Last error: ${lastError?.message}`
  );
}

async function waitForCompletion(
  executionId: number,
  instance?: string,
  timeout: number = 60000
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const execution = await callTool('get_execution', {
      id: executionId,
      instance,
      includeData: false
    });

    const exec = JSON.parse(execution.content[0].text);

    if (exec.finished) {
      return;
    }

    // Wait 1 second before checking again
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  throw new Error(`Execution ${executionId} timeout after ${timeout}ms`);
}
```

---

## delete_execution

Remove execution records permanently. Useful for cleanup and compliance.

### Request

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| instance | string | No | Instance identifier |
| id | number\|string | Yes | Execution ID to delete |

### Code Example

```typescript
await callTool('delete_execution', {
  instance: 'staging',
  id: 9999
});

console.log('Execution deleted successfully');
```

**Warning:** Deletion is permanent and cannot be undone.

---

## Best Practices

### 1. Efficient Execution Listing

```typescript
// ✅ Good: Use server-side filtering
const failed = await callTool('list_executions', {
  workflowId: '123',
  finished: true,
  status: 'error',
  limit: 50
});

// ❌ Avoid: Fetch all and filter client-side
const all = await callTool('list_executions', {
  workflowId: '123',
  limit: 9999  // May timeout!
});
const failed = all.data.filter(e => e.data?.resultData?.error);
```

### 2. Include Data Only When Needed

```typescript
// ✅ Good: Exclude data for listing (faster, smaller)
const executions = await callTool('list_executions', {
  workflowId: '123',
  includeData: false
});

// ✅ Good: Include data for debugging (slower, detailed)
const execution = await callTool('get_execution', {
  id: 9876,
  includeData: true
});

// ❌ Avoid: Always including data in list operations
const all = await callTool('list_executions', {
  includeData: true,  // Wasteful for large lists!
  limit: 100
});
```

### 3. Retry with Validation

```typescript
// ✅ Good: Validate before retry
async function retryWithValidation(id: number) {
  const exec = await callTool('get_execution', { id });
  const execution = JSON.parse(exec.content[0].text);

  if (!execution.finished) {
    throw new Error('Wait for execution to finish');
  }

  if (!execution.data?.resultData?.error) {
    throw new Error('Execution succeeded, no retry needed');
  }

  return await callTool('retry_execution', { id });
}

// ❌ Avoid: Blind retry without validation
await callTool('retry_execution', { id: 9876 });  // May fail if still running
```

### 4. Monitor Execution Health

```typescript
async function monitorWorkflowHealth(workflowId: string, instance?: string) {
  const executions = await callTool('list_executions', {
    instance,
    workflowId,
    limit: 100
  });

  const execs = JSON.parse(executions.content[0].text).data;
  const finished = execs.filter(e => e.finished);
  const successful = finished.filter(e => !e.error);

  const successRate = (successful.length / finished.length * 100).toFixed(2);
  const avgDuration = finished.reduce((sum, e) => {
    const duration = new Date(e.stoppedAt).getTime() -
                    new Date(e.startedAt).getTime();
    return sum + duration;
  }, 0) / finished.length;

  console.log(`Workflow ${workflowId} Health:`);
  console.log(`  Success Rate: ${successRate}%`);
  console.log(`  Avg Duration: ${avgDuration.toFixed(0)}ms`);
  console.log(`  Total Executions: ${execs.length}`);
  console.log(`  Running: ${execs.filter(e => !e.finished).length}`);
}
```

---

## Next Steps

- **[Workflows API Reference](workflows-api.md)** - Create and manage workflows
- **[Credentials API Reference](credentials-api.md)** - Schema-driven credential creation
- **[Tags API Reference](tags-api.md)** - Organize workflows with tags
- **[Troubleshooting Guide](../troubleshooting/error-reference.md)** - Common execution errors

---

**Document Version:** 1.0
**Last Updated:** January 2025
**Related Epic:** Epic 4 (Executions Management Tools)
