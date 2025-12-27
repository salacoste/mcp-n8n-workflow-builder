# Story 7.3: Executions API Reference Documentation

**Epic:** Epic 7 - API Reference Documentation
**Story Points:** 5
**Priority:** High
**Status:** Ready for Implementation
**Estimated Page Count:** 10-13 pages

---

## User Story

**As a** developer monitoring and managing workflow executions
**I want** complete API reference for execution operations
**So that** I can programmatically track, debug, and retry workflow runs

---

## Story Description

### Current System

With Story 7.2 completed:
- ✅ Workflows API fully documented
- ❌ No executions API reference
- ❌ No execution data structure documentation
- ❌ No retry patterns documented

### Enhancement

Create comprehensive Executions API reference for all 4 execution operations:
- **list_executions** - List execution history with filtering
- **get_execution** - Get detailed execution data
- **delete_execution** - Remove execution records
- **retry_execution** - Retry failed executions

---

## Acceptance Criteria

### AC1: list_executions API Reference

**Document:** `docs/api/executions-api.md#list_executions`

```markdown
# Executions API Reference

Complete API reference for execution management operations (4 methods).

---

## list_executions

List workflow execution history with filtering and pagination.

### Purpose

Retrieve execution records for monitoring, debugging, and analysis.

---

### Request

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| instance | string | No | Instance identifier |
| workflowId | string | No | Filter by workflow ID |
| finished | boolean | No | Filter by completion status |
| status | string | No | Filter by status: 'success', 'error', 'waiting' |
| includeData | boolean | No | Include execution data (default: false) |
| limit | number | No | Max executions (1-250, default: 100) |
| cursor | string | No | Pagination cursor |

**TypeScript Interface:**

\`\`\`typescript
interface ListExecutionsParams {
  instance?: string;
  workflowId?: string;
  finished?: boolean;
  status?: 'success' | 'error' | 'waiting';
  includeData?: boolean;
  limit?: number;
  cursor?: string;
}
\`\`\`

---

### Response

\`\`\`typescript
interface ExecutionListResponse {
  data: Array<{
    id: number;
    workflowId: number;
    finished: boolean;
    mode: 'manual' | 'trigger' | 'webhook' | 'retry';
    startedAt: string;
    stoppedAt?: string;
    retryOf?: number;
    retrySuccessId?: number;
  }>;
  nextCursor?: string;
}
\`\`\`

**Example Response:**

\`\`\`json
{
  "data": [
    {
      "id": 9876,
      "workflowId": 123,
      "finished": true,
      "mode": "webhook",
      "startedAt": "2025-01-15T10:30:00Z",
      "stoppedAt": "2025-01-15T10:30:02Z"
    },
    {
      "id": 9875,
      "workflowId": 123,
      "finished": false,
      "mode": "manual",
      "startedAt": "2025-01-15T10:25:00Z"
    }
  ],
  "nextCursor": "eyJvZmZzZXQiOjEwMH0="
}
\`\`\`

---

### Filtering Examples

**Failed Executions:**

\`\`\`typescript
const failed = await listExecutions({
  instance: 'production',
  finished: true,
  status: 'error',
  limit: 50
});
\`\`\`

**Specific Workflow:**

\`\`\`typescript
const workflowRuns = await listExecutions({
  instance: 'production',
  workflowId: '123',
  limit: 100
});
\`\`\`

**Running Executions:**

\`\`\`typescript
const running = await listExecutions({
  instance: 'production',
  finished: false
});
\`\`\`

---

## get_execution

Get detailed execution data including node outputs and errors.

### Request

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| instance | string | No | Instance identifier |
| id | number\|string | Yes | Execution ID |
| includeData | boolean | No | Include execution data (default: true) |

**TypeScript Interface:**

\`\`\`typescript
interface GetExecutionParams {
  instance?: string;
  id: number | string;
  includeData?: boolean;
}
\`\`\`

---

### Response

**Complete Execution Object:**

\`\`\`typescript
interface Execution {
  id: number;
  workflowId: number;
  finished: boolean;
  mode: 'manual' | 'trigger' | 'webhook' | 'retry';
  startedAt: string;
  stoppedAt?: string;
  retryOf?: number;          // If this is a retry
  retrySuccessId?: number;   // If retry succeeded
  data?: {
    resultData: {
      runData: {
        [nodeName: string]: Array<{
          startTime: number;
          executionTime: number;
          data: {
            main: Array<Array<{
              json: Record<string, any>;
              binary?: Record<string, any>;
            }>>;
          };
          error?: {
            message: string;
            description?: string;
            context?: any;
          };
        }>;
      };
      lastNodeExecuted: string;
      error?: {
        message: string;
        stack?: string;
      };
    };
    workflowData: {
      id: number;
      name: string;
      nodes: Node[];
      connections: Connections;
    };
  };
}
\`\`\`

**Example - Successful Execution:**

\`\`\`json
{
  "id": 9876,
  "workflowId": 123,
  "finished": true,
  "mode": "webhook",
  "startedAt": "2025-01-15T10:30:00Z",
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
                "body": {"order_id": "12345"}
              }
            }]]
          }
        }],
        "Process Order": [{
          "startTime": 1736936400012,
          "executionTime": 233,
          "data": {
            "main": [[{
              "json": {"status": "processed", "order_id": "12345"}
            }]]
          }
        }]
      },
      "lastNodeExecuted": "Process Order"
    }
  }
}
\`\`\`

**Example - Failed Execution:**

\`\`\`json
{
  "id": 9877,
  "workflowId": 123,
  "finished": true,
  "mode": "trigger",
  "startedAt": "2025-01-15T11:00:00Z",
  "stoppedAt": "2025-01-15T11:00:05.123Z",
  "data": {
    "resultData": {
      "runData": {
        "HTTP Request": [{
          "startTime": 1736938800000,
          "executionTime": 5123,
          "error": {
            "message": "ETIMEDOUT: Connection timeout",
            "description": "The request took too long to complete"
          }
        }]
      },
      "lastNodeExecuted": "HTTP Request",
      "error": {
        "message": "ETIMEDOUT: Connection timeout",
        "stack": "Error: ETIMEDOUT\\n    at ..."
      }
    }
  }
}
\`\`\`

---

### Debugging Pattern

\`\`\`typescript
async function debugFailedExecution(
  executionId: number,
  instance?: string
): Promise<void> {
  const execution = await getExecution({
    id: executionId,
    instance,
    includeData: true
  });

  // Check if execution failed
  if (!execution.data?.resultData?.error) {
    console.log('Execution completed successfully');
    return;
  }

  // Extract error information
  const error = execution.data.resultData.error;
  const lastNode = execution.data.resultData.lastNodeExecuted;

  console.log('Execution Failed:');
  console.log('  Last Node:', lastNode);
  console.log('  Error:', error.message);

  // Get node-specific error
  const nodeRun = execution.data.resultData.runData[lastNode]?.[0];
  if (nodeRun?.error) {
    console.log('  Node Error:', nodeRun.error.message);
    console.log('  Description:', nodeRun.error.description);
  }

  // Analyze execution flow
  const executedNodes = Object.keys(execution.data.resultData.runData);
  console.log('  Executed Nodes:', executedNodes.join(' → '));
}
\`\`\`

---

## retry_execution

Retry a failed execution creating a new execution.

### Request

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| instance | string | No | Instance identifier |
| id | number\|string | Yes | Execution ID to retry |

**TypeScript Interface:**

\`\`\`typescript
interface RetryExecutionParams {
  instance?: string;
  id: number | string;
}
\`\`\`

---

### Response

Returns new execution object created as retry.

\`\`\`typescript
interface RetryExecutionResponse {
  id: number;              // New execution ID
  workflowId: number;
  retryOf: number;         // Original execution ID
  mode: 'retry';
  finished: boolean;
  startedAt: string;
  // ... other execution fields
}
\`\`\`

---

### Retry Validation

**Pre-Retry Checks:**

\`\`\`typescript
async function safeRetry(
  executionId: number,
  instance?: string
): Promise<Execution> {
  // Get execution details
  const execution = await getExecution({ id: executionId, instance });

  // Check 1: Execution finished?
  if (!execution.finished) {
    throw new Error(
      `Execution ${executionId} still running. Wait for completion.`
    );
  }

  // Check 2: Did it actually fail?
  if (!execution.data?.resultData?.error) {
    throw new Error(
      `Execution ${executionId} succeeded. No retry needed.`
    );
  }

  // Check 3: Already retried successfully?
  if (execution.retrySuccessId) {
    console.warn(
      `Execution ${executionId} already retried successfully ` +
      `(retry execution: ${execution.retrySuccessId})`
    );
  }

  // Safe to retry
  return await retryExecution({ id: executionId, instance });
}
\`\`\`

---

### Retry Chain Tracking

\`\`\`typescript
async function getRetryChain(
  executionId: number,
  instance?: string
): Promise<Execution[]> {
  const chain: Execution[] = [];
  let currentId: number | undefined = executionId;

  while (currentId) {
    const execution = await getExecution({ id: currentId, instance });
    chain.push(execution);

    // Check if this execution was itself a retry
    currentId = execution.retryOf;
  }

  return chain.reverse();  // Original first, retries after
}

// Usage
const chain = await getRetryChain(9999);
console.log('Retry chain:');
chain.forEach((exec, i) => {
  console.log(
    `  ${i + 1}. Execution ${exec.id} ` +
    `(${exec.finished ? exec.data?.resultData?.error ? 'Failed' : 'Success' : 'Running'})`
  );
});

// Output:
// Retry chain:
//   1. Execution 9870 (Failed)
//   2. Execution 9875 (Failed)
//   3. Execution 9999 (Success)
\`\`\`

---

## Best Practices

### 1. Efficient Execution Listing

\`\`\`typescript
// ✅ Good: Use filters server-side
const failed = await listExecutions({
  workflowId: '123',
  finished: true,
  status: 'error',
  limit: 50
});

// ❌ Avoid: Fetch all and filter client-side
const all = await listExecutions({ workflowId: '123', limit: 9999 });
const failed = all.data.filter(e => e.data?.resultData?.error);
\`\`\`

### 2. Include Data Only When Needed

\`\`\`typescript
// ✅ Good: Exclude data for listing
const executions = await listExecutions({
  includeData: false  // Faster, smaller response
});

// ✅ Good: Include data for debugging
const execution = await getExecution({
  id: 9876,
  includeData: true  // Full debug information
});

// ❌ Avoid: Always including data
const executions = await listExecutions({
  includeData: true,  // Wasteful for large lists
  limit: 100
});
\`\`\`

### 3. Retry with Validation

\`\`\`typescript
// ✅ Good: Validate before retry
async function retryWithValidation(id: number) {
  const exec = await getExecution({ id });

  if (!exec.finished) {
    throw new Error('Wait for execution to finish');
  }

  if (!exec.data?.resultData?.error) {
    throw new Error('Execution succeeded, no retry needed');
  }

  return await retryExecution({ id });
}

// ❌ Avoid: Blind retry
await retryExecution({ id: 9876 });  // May fail if still running
\`\`\`

---

## Next Steps

- [Credentials API Reference](./credentials-api.md)
- [Tags API Reference](./tags-api.md)
- [Debugging Guide](../troubleshooting/debugging-guide.md)
```

---

## Dependencies

### Upstream Dependencies
- Story 7.1 (Architecture) - System context
- Story 7.2 (Workflows API) - Related operations
- Epic 4 Story 4.2 (Executions Tools) - Tool specifications

### Downstream Dependencies
- Stories 7.4-7.6 (Other API references)
- Epic 6 (Examples) - Execution debugging patterns

---

## Definition of Done

### Documentation Completeness
- [ ] All 4 execution operations documented
- [ ] Request/response schemas
- [ ] Execution data structure explained
- [ ] Retry patterns documented
- [ ] Code examples provided
- [ ] Error responses documented

---

## Estimation Breakdown

**Story Points:** 5

**Effort Distribution:**
- list_executions: 1.25 SP
- get_execution: 1.5 SP (complex data structure)
- retry_execution: 1 SP
- delete_execution: 0.5 SP
- Code examples: 0.75 SP

**Page Count:** 10-13 pages

**Estimated Duration:** 2-3 days

---

**Status:** Ready for Implementation
**Related Files:**
- `docs/api/executions-api.md`
