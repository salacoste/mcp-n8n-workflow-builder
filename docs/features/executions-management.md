# Executions Management Tools

Complete reference for all 4 execution management tools to monitor, analyze, and manage workflow execution history.

---

## Overview

Execution management tools help you track workflow runs, analyze failures, retry executions, and manage execution history.

### Tools Summary

| Tool | Purpose | Filters | Pagination | n8n API Endpoint |
|------|---------|---------|------------|------------------|
| `list_executions` | Get execution history | status, workflowId, includeData | ✅ Cursor | `GET /executions` |
| `get_execution` | Get detailed execution data | includeData | ❌ | `GET /executions/{id}` |
| `delete_execution` | Remove execution record | - | ❌ | `DELETE /executions/{id}` |
| `retry_execution` | Retry failed execution | - | ❌ | `POST /executions/{id}/retry` |

### Execution Lifecycle

```
1. Workflow triggers → Execution starts
2. Nodes execute → Data flows through workflow
3. Execution completes → Success or failure recorded
4. History available → list_executions / get_execution
5. Optional retry → retry_execution (if failed)
6. Optional cleanup → delete_execution
```

---

## list_executions

Retrieve execution history with filtering and pagination support.

### Purpose

Monitor workflow executions, track success rates, identify failures, and analyze execution patterns.

### Input Parameters

```typescript
{
  status?: 'success' | 'error' | 'running' | 'waiting';
  workflowId?: string;       // Filter by specific workflow
  includeData?: boolean;     // Include full execution data (default: false)
  limit?: number;            // Results per page (default: 100, max: 250)
  cursor?: string;           // Pagination cursor
  instance?: string;         // n8n instance identifier (optional)
}
```

### Output Format

```typescript
{
  data: Array<{
    id: string;              // Execution ID
    workflowId: string;      // Workflow ID
    workflowName?: string;   // Workflow name
    finished: boolean;       // Has execution finished
    mode: string;            // manual, trigger, webhook, retry
    startedAt: string;       // ISO 8601 timestamp
    stoppedAt?: string;      // ISO 8601 timestamp (if finished)
    status?: string;         // success, error, running
    retryOf?: string;        // Original execution ID (if retry)
    data?: ExecutionData;    // Full data (if includeData: true)
  }>;
  nextCursor?: string;       // Pagination cursor
}
```

### Usage Examples

=== "Recent Executions"

    **Request:**
    ```
    Show recent workflow executions
    ```

    **What Claude does:**
    ```typescript
    list_executions({ limit: 20 })
    ```

    **Response:**
    ```
    Recent Executions (20 total):

    1. Daily Email Report (ID: 456)
       - Execution: #789
       - Status: ✅ Success
       - Started: 2025-12-27 09:00:15
       - Duration: 3.2 seconds
       - Mode: trigger

    2. Data Sync Pipeline (ID: 123)
       - Execution: #788
       - Status: ❌ Error
       - Started: 2025-12-27 08:45:10
       - Duration: 1.8 seconds
       - Mode: trigger
       - Error: Connection timeout

    [... 18 more executions ...]
    ```

=== "Failed Executions Only"

    **Request:**
    ```
    Show me all failed executions
    ```

    **What Claude does:**
    ```typescript
    list_executions({ status: 'error' })
    ```

    **Response:**
    ```
    Failed Executions (5 found):

    1. Data Sync Pipeline (#788)
       - Failed: 2025-12-27 08:45:12
       - Error: Database connection timeout
       - Workflow ID: 123

    2. API Integration (#756)
       - Failed: 2025-12-26 14:30:45
       - Error: 401 Unauthorized
       - Workflow ID: 89

    [... 3 more failures ...]

    Tip: Use "retry execution [ID]" to retry failed executions
    ```

=== "Filter by Workflow"

    **Request:**
    ```
    Show executions for workflow 15
    ```

    **What Claude does:**
    ```typescript
    list_executions({ workflowId: "15" })
    ```

=== "Include Full Data"

    **Request:**
    ```
    Get last 5 executions with full data
    ```

    **What Claude does:**
    ```typescript
    list_executions({
      limit: 5,
      includeData: true
    })
    ```

    !!! warning "Performance Impact"
        Setting `includeData: true` returns large amounts of data. Use only when needed for debugging.

### Execution Status Values

| Status | Description | Icon |
|--------|-------------|------|
| `success` | Execution completed without errors | ✅ |
| `error` | Execution failed with error | ❌ |
| `running` | Currently executing | 🔄 |
| `waiting` | Queued, waiting to execute | ⏳ |

### Execution Modes

| Mode | Description |
|------|-------------|
| `manual` | Manually triggered via n8n UI |
| `trigger` | Triggered by schedule, webhook, etc. |
| `webhook` | Webhook execution |
| `retry` | Retry of failed execution |
| `cli` | CLI execution |
| `error` | Error workflow execution |

---

## get_execution

Retrieve detailed information about a specific execution.

### Purpose

Debug failed executions, analyze node outputs, review execution flow, and validate data transformations.

### Input Parameters

```typescript
{
  id: string;              // Execution ID (required)
  includeData?: boolean;   // Include full node data (default: false)
  instance?: string;       // n8n instance (optional)
}
```

### Output Format

```typescript
{
  id: string;
  workflowId: string;
  workflowName: string;
  finished: boolean;
  mode: string;
  startedAt: string;
  stoppedAt?: string;
  status: string;
  retryOf?: string;
  retrySuccessId?: string;
  data?: {
    resultData: {
      runData: {
        [nodeName]: Array<{
          data: {
            main: Array<Array<{  // Node output data
              json: Record<string, any>;
              binary?: Record<string, any>;
            }>>;
          };
          error?: {
            message: string;
            stack?: string;
          };
          startTime: number;
          executionTime: number;
        }>;
      };
    };
    workflowData: {          // Workflow snapshot at execution time
      nodes: Array<...>;
      connections: Record<...>;
    };
  };
}
```

### Usage Examples

=== "Basic Execution Details"

    **Request:**
    ```
    Show execution 789 details
    ```

    **What Claude does:**
    ```typescript
    get_execution({ id: "789" })
    ```

    **Response:**
    ```
    Execution #789
    Workflow: Daily Email Report (ID: 15)

    Status: ✅ Success
    Mode: trigger
    Started: 2025-12-27 09:00:15
    Finished: 2025-12-27 09:00:18
    Duration: 3.2 seconds

    Node Execution:
    1. Schedule Trigger - ✅ Success (0.1s)
    2. Fetch Data - ✅ Success (1.5s)
    3. Transform Data - ✅ Success (0.8s)
    4. Send Email - ✅ Success (0.8s)

    Total execution time: 3.2 seconds
    ```

=== "Failed Execution Analysis"

    **Request:**
    ```
    Why did execution 788 fail?
    ```

    **What Claude does:**
    ```typescript
    get_execution({
      id: "788",
      includeData: true
    })
    ```

    **Response:**
    ```
    Execution #788 - FAILED ❌
    Workflow: Data Sync Pipeline (ID: 123)

    Error Details:
    - Node: "Connect to Database"
    - Error: Connection timeout
    - Message: "Failed to connect to database after 30 seconds"

    Node Execution Timeline:
    1. Schedule Trigger - ✅ Success (0.1s)
    2. Connect to Database - ❌ Failed (30.0s)
       Error: ETIMEDOUT - Connection timeout
       Stack: Error at pg.connect (pg/lib/client.js:45)

    Failed at: 2025-12-27 08:45:12
    Duration before failure: 30.1 seconds

    Suggestion:
    - Check database connectivity
    - Verify credentials
    - Check firewall settings
    - Consider increasing timeout
    ```

=== "With Full Node Data"

    **Request:**
    ```
    Show execution 756 with full data
    ```

    **What Claude does:**
    ```typescript
    get_execution({
      id: "756",
      includeData: true
    })
    ```

    **Response includes:**
    - Complete node execution data
    - Input/output for each node
    - Workflow configuration snapshot
    - Timing information

### Use Cases

**Debugging:**
- Identify which node failed
- View error messages and stack traces
- Analyze node input/output data

**Performance Analysis:**
- Review execution times per node
- Identify slow operations
- Optimize workflow bottlenecks

**Data Validation:**
- Verify data transformations
- Check API responses
- Validate calculations

---

## delete_execution

Permanently remove an execution record from history.

### Purpose

Clean up execution history, remove failed test executions, or manage storage space.

### Input Parameters

```typescript
{
  id: string;              // Execution ID (required)
  instance?: string;       // n8n instance (optional)
}
```

### Output Format

```typescript
{
  success: boolean;
  message: string;
}
```

### Usage Examples

=== "Delete Single Execution"

    **Request:**
    ```
    Delete execution 788
    ```

    **What Claude does:**
    ```typescript
    delete_execution({ id: "788" })
    ```

    **Response:**
    ```
    ✅ Successfully deleted execution #788

    The execution record has been permanently removed.
    ```

=== "Clean Up Failed Tests"

    **Request:**
    ```
    Delete all failed executions from test workflow
    ```

    **What Claude does:**
    ```typescript
    // Get test workflow ID
    const workflows = list_workflows()
    const testWorkflow = workflows.data.find(w => w.name.includes("Test"))

    // List failed executions for that workflow
    const executions = list_executions({
      workflowId: testWorkflow.id,
      status: 'error'
    })

    // Delete each failed execution
    executions.data.forEach(execution => {
      delete_execution({ id: execution.id })
    })
    ```

### Safety Considerations

!!! warning "Irreversible Action"
    - **No undo** - Deletion is permanent
    - **Data loss** - All execution data and logs removed
    - **Audit trail** - Consider keeping records for compliance

!!! tip "Before Deleting"
    1. **Review execution** - Ensure you don't need the data
    2. **Export if needed** - Save execution data before deletion
    3. **Check references** - Verify no retry references exist

### Cleanup Strategies

**Keep:**
- Recent successful executions (last 30 days)
- All failed executions (for analysis)
- Production workflow executions

**Delete:**
- Test workflow executions (after testing complete)
- Old successful executions (>90 days)
- Duplicate retry executions (keep only successful retry)

---

## retry_execution

Retry a failed execution with the same input data.

### Purpose

Automatically retry failed executions without manual workflow re-triggering. Useful for temporary failures (network issues, API rate limits, etc.).

### Input Parameters

```typescript
{
  id: string;              // Failed execution ID (required)
  instance?: string;       // n8n instance (optional)
}
```

### Output Format

```typescript
{
  success: boolean;
  originalExecutionId: string;
  newExecutionId: string;
  status: string;
  message: string;
}
```

### How Retry Works

```
1. Original execution fails → Execution #100 (status: error)
2. Call retry_execution({ id: "100" })
3. New execution created → Execution #101
4. Execution #101 has: retryOf: "100"
5. If #101 succeeds:
   - Execution #100 updated with: retrySuccessId: "101"
6. If #101 fails:
   - Can retry again, creating #102
```

### Usage Examples

=== "Basic Retry"

    **Request:**
    ```
    Retry execution 788
    ```

    **What Claude does:**
    ```typescript
    retry_execution({ id: "788" })
    ```

    **Response:**
    ```
    ✅ Successfully queued execution retry!

    Original Execution: #788 (failed)
    New Execution: #890
    Status: Running
    Workflow: Data Sync Pipeline (ID: 123)

    The workflow will rerun with the same input data.

    Monitor with: "Get execution 890 details"
    ```

=== "Retry After Fix"

    **Request:**
    ```
    Execution 788 failed with connection timeout.
    I've fixed the network issue. Please retry.
    ```

    **What Claude does:**
    ```typescript
    retry_execution({ id: "788" })
    ```

    **Response:**
    ```
    ✅ Retry queued! Execution #890 started.

    Previous failure: Connection timeout
    Fix applied: Network issue resolved

    Running retry now...
    Check status with: "Get execution 890"
    ```

=== "Retry Multiple Failures"

    **Request:**
    ```
    Retry all failed executions from last hour
    ```

    **What Claude does:**
    ```typescript
    // Get failed executions from last hour
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString()
    const executions = list_executions({
      status: 'error',
      // Filter by time in results
    })

    // Retry each
    executions.data
      .filter(e => new Date(e.startedAt) > new Date(oneHourAgo))
      .forEach(execution => {
        retry_execution({ id: execution.id })
      })
    ```

### When to Retry

**Good Candidates for Retry:**
- ✅ Network timeouts or connection errors
- ✅ API rate limiting (429 errors)
- ✅ Temporary service unavailability (503 errors)
- ✅ Database deadlocks or temporary locks
- ✅ External service outages

**Bad Candidates for Retry:**
- ❌ Invalid credentials (401/403 errors)
- ❌ Malformed data or validation errors
- ❌ Logic errors in workflow
- ❌ Resource not found (404 errors)
- ❌ Permanent failures

### Retry Tracking

**Check Retry Status:**
```
Get execution [original-id]
→ Shows retrySuccessId if retry succeeded

Get execution [retry-id]
→ Shows retryOf linking back to original
```

**Retry Chain:**
```
Execution #100 (failed)
  ├─ retryOf: null
  ├─ retrySuccessId: null
  └─ Retry → #101 (failed)
      ├─ retryOf: "100"
      ├─ retrySuccessId: null
      └─ Retry → #102 (success)
          ├─ retryOf: "101"
          └─ Updates #101.retrySuccessId = "102"
```

---

## Common Workflows

### Monitor and Respond to Failures

```
1. Check for failures
   → list_executions({ status: 'error' })

2. Analyze each failure
   → get_execution({ id, includeData: true })

3. Fix underlying issue
   → Update workflow, credentials, etc.

4. Retry failed execution
   → retry_execution({ id })

5. Verify success
   → get_execution({ id: newExecutionId })
```

### Performance Analysis

```
1. Get recent executions with data
   → list_executions({
       limit: 100,
       includeData: true
     })

2. Analyze execution times
   → Review node execution times
   → Identify bottlenecks

3. Optimize workflow
   → update_workflow() with improvements

4. Compare new execution times
   → get_execution() for recent runs
```

### Execution Cleanup

```
1. List old successful executions
   → list_executions({
       status: 'success',
       // Filter by date
     })

2. Delete old records
   → delete_execution({ id })
   → Keep last 30 days

3. Keep all failures
   → Retain for debugging

4. Archive if needed
   → Export data before deletion
```

---

## Best Practices

### Monitoring

!!! tip "Regular Checks"
    - Check failed executions daily
    - Monitor execution duration trends
    - Set up alerts for critical workflows (external monitoring)

### Data Management

!!! tip "Storage Management"
    - Use `includeData: false` by default (faster, less data)
    - Only use `includeData: true` for debugging
    - Clean up old successful executions regularly
    - Keep failed executions for analysis

### Retry Strategy

!!! tip "Smart Retries"
    - Analyze error before retrying
    - Fix root cause before retry
    - Don't retry permanent failures
    - Track retry success rates

### Performance

!!! tip "Optimization"
    - Use pagination for large histories
    - Filter by workflow to reduce results
    - Monitor slow executions
    - Optimize bottleneck nodes

---

## Next Steps

- **[Workflows Management](workflows-management.md)** - Manage workflows
- **[Tags Management](tags-management.md)** - Organize with tags
- **[API Reference](../api/executions-api.md)** - Technical specifications
- **[Troubleshooting](../troubleshooting/error-reference.md)** - Debug execution issues

---

!!! question "Need Help?"
    - [Examples](../examples/workflows/basic-patterns.md)
    - [GitHub Issues](https://github.com/salacoste/mcp-n8n-workflow-builder/issues)
