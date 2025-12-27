# Story 4.2: Executions Management Tools Reference

**Epic:** Epic 4 - Core Features & MCP Tools Reference
**Story ID:** STORY-4.2
**Status:** Draft
**Created:** 2025-12-27
**Updated:** 2025-12-27

---

## User Story

**As a** user monitoring n8n workflow executions
**I want** comprehensive reference documentation for all 4 execution management tools
**So that** I can track, analyze, retry, and manage workflow execution history

---

## Story Description

### Current System Context

The MCP server provides **4 execution management tools** for tracking workflow runs:

1. **list_executions** - Get execution history with filtering (status, workflow, pagination)
2. **get_execution** - Retrieve detailed execution data including node outputs
3. **delete_execution** - Permanently remove execution records
4. **retry_execution** - Retry failed executions (creates new execution as retry)

**API Coverage (Epic 2):**
- 4/4 execution methods fully implemented (100% coverage)
- Comprehensive filtering support (status, workflowId, includeData)
- Cursor-based pagination for large execution histories

**Execution Object Structure:**
```typescript
{
  id: number;               // Execution ID
  workflowId: number;       // Related workflow
  finished: boolean;        // Completion status
  mode: ExecutionMode;      // manual, trigger, webhook, retry, etc.
  startedAt: string;        // ISO 8601 timestamp
  stoppedAt: string;        // ISO 8601 timestamp
  retryOf?: number;         // Original execution ID (for retries)
  retrySuccessId?: number;  // Successful retry ID (in original)
  data?: {                  // Full execution data (optional)
    resultData: {...},      // Node outputs
    workflowData: {...}     // Workflow snapshot
  }
}
```

**Execution Modes:**
- `manual` - Manual execution via n8n UI
- `trigger` - Triggered by schedule/webhook
- `webhook` - Webhook execution
- `retry` - Retry of failed execution
- `cli`, `error`, `integrated`, `internal`

### Enhancement: Comprehensive Executions Tools Documentation

Create detailed reference covering:

**Tool Specifications:**
- Detailed parameter descriptions
- Response formats and schemas
- Filtering and pagination patterns
- Common usage scenarios

**Execution Monitoring:**
- Real-time execution tracking
- Failed execution analysis
- Performance monitoring patterns
- Execution data interpretation

**Retry Patterns:**
- When to retry executions
- Automatic retry strategies
- Retry tracking and validation

**Data Management:**
- includeData parameter usage
- Managing large execution histories
- Execution cleanup strategies

---

## Acceptance Criteria

### Documentation Requirements

**AC1: Tools Overview**
- [ ] Summary table:
  | Tool | Purpose | Filters | Pagination | n8n API |
  |------|---------|---------|------------|---------|
  | list_executions | Get execution history | status, workflowId, includeData | ✅ cursor | GET /executions |
  | get_execution | Get execution details | includeData | ❌ | GET /executions/{id} |
  | delete_execution | Remove execution record | - | ❌ | DELETE /executions/{id} |
  | retry_execution | Retry failed execution | - | ❌ | POST /executions/{id}/retry |

- [ ] Tool categories:
  - **Query operations:** list_executions, get_execution
  - **Maintenance operations:** delete_execution
  - **Recovery operations:** retry_execution

**AC2: list_executions Tool Documentation**
- [ ] **Purpose:** Query execution history with filtering and pagination
- [ ] **Input Parameters:**
  ```typescript
  {
    includeData?: boolean;   // Include full execution data (default: false)
    status?: 'error' | 'success' | 'waiting';  // Filter by status
    workflowId?: string;     // Filter by workflow ID
    limit?: number;          // Max results (default: 100, max: 250)
    cursor?: string;         // Pagination cursor
    instance?: string;       // n8n instance identifier (optional)
  }
  ```
- [ ] **Output Format:**
  ```typescript
  {
    data: Array<{
      id: number;
      workflowId: number;
      finished: boolean;
      mode: ExecutionMode;
      startedAt: string;
      stoppedAt: string;
      retryOf?: number;
      retrySuccessId?: number;
      waitTill?: string;
      customData?: object;
      data?: {               // Only if includeData=true
        resultData: {...},
        workflowData: {...}
      }
    }>;
    nextCursor?: string;
  }
  ```
- [ ] **Claude Desktop Examples:**
  ```
  Example 1 - List all executions:
  User: "Show me recent workflow executions"
  Claude: Uses list_executions({ limit: 50 })

  Example 2 - Filter by status:
  User: "Show me all failed executions"
  Claude: Uses list_executions({ status: 'error' })

  Example 3 - Filter by workflow:
  User: "Show executions for workflow 'Customer Alerts'"
  Claude:
    1. list_workflows() → find workflow ID
    2. list_executions({ workflowId: found_id })

  Example 4 - Include full data:
  User: "Get execution details for workflow 123 with full data"
  Claude: Uses list_executions({ workflowId: "123", includeData: true })

  Example 5 - Pagination:
  User: "Show next page of executions"
  Claude: Uses list_executions({ cursor: previous_cursor })

  Example 6 - Multi-instance:
  User: "Show staging environment executions"
  Claude: Uses list_executions({ instance: "staging" })
  ```
- [ ] **Performance Considerations:**
  - `includeData=false` (default) for performance
  - Use `includeData=true` only when needed
  - Pagination recommended for >100 executions
  - Filter by status/workflow to reduce results

**AC3: get_execution Tool Documentation**
- [ ] **Purpose:** Retrieve detailed information about specific execution
- [ ] **Input Parameters:**
  ```typescript
  {
    id: string;              // Execution ID (required)
    includeData?: boolean;   // Include full data (default: true)
    instance?: string;       // n8n instance identifier (optional)
  }
  ```
- [ ] **Output Format:** Single execution object (same structure as list_executions item)
- [ ] **Claude Desktop Examples:**
  ```
  Example 1 - Get execution details:
  User: "Get execution 231 details"
  Claude: Uses get_execution({ id: "231" })

  Example 2 - Analyze failed execution:
  User: "Why did execution 245 fail?"
  Claude:
    1. get_execution({ id: "245" })
    2. Analyzes data.resultData.error
    3. Explains failure reason

  Example 3 - Check execution data:
  User: "What data did execution 250 produce?"
  Claude:
    1. get_execution({ id: "250" })
    2. Shows data.resultData.runData
    3. Explains node outputs

  Example 4 - Without full data (faster):
  User: "Check status of execution 260"
  Claude: Uses get_execution({ id: "260", includeData: false })
  Returns: Basic metadata only (faster response)
  ```
- [ ] **Execution Data Structure:**
  ```typescript
  data: {
    resultData: {
      runData: {
        [nodeName: string]: [{
          startTime: number;
          endTime: number;
          inputData: {...};
          outputData: {...};
          error?: {...};
        }]
      },
      lastNodeExecuted: string;
      error?: {
        message: string;
        stack: string;
      }
    },
    workflowData: {         // Workflow snapshot at execution time
      name: string;
      nodes: [...];
      connections: {...};
    }
  }
  ```

**AC4: delete_execution Tool Documentation**
- [ ] **Purpose:** Remove execution record from history (irreversible)
- [ ] **Input Parameters:**
  ```typescript
  {
    id: string;              // Execution ID (required)
    instance?: string;       // n8n instance identifier (optional)
  }
  ```
- [ ] **Output Format:**
  ```typescript
  {
    success: boolean;
    message: string;
  }
  ```
- [ ] **Claude Desktop Examples:**
  ```
  Example 1 - Delete execution:
  User: "Delete execution 231"
  Claude: Uses delete_execution({ id: "231" })
  Warning: Confirms with user first

  Example 2 - Cleanup old executions:
  User: "Delete all executions older than 30 days"
  Claude:
    1. list_executions() → filter by date
    2. Shows list of old executions
    3. Asks for confirmation
    4. delete_execution for each (if confirmed)

  Example 3 - Delete failed executions (after analysis):
  User: "Delete all failed executions from last week"
  Claude:
    1. list_executions({ status: 'error' })
    2. Filters by date
    3. Confirms deletion
    4. Deletes each execution
  ```
- [ ] **Safety Warnings:**
  - ⚠️ **IRREVERSIBLE:** Deleted executions cannot be recovered
  - Cannot delete running executions (status: running/waiting)
  - Recommended: Use n8n auto-cleanup settings instead
  - Consider: Keep failed executions for debugging
- [ ] **Alternative: n8n Auto-Cleanup:**
  ```bash
  # Self-hosted n8n settings (environment variables)
  EXECUTIONS_DATA_PRUNE=true
  EXECUTIONS_DATA_MAX_AGE=168        # 7 days in hours
  EXECUTIONS_DATA_PRUNE_MAX_COUNT=50000
  ```

**AC5: retry_execution Tool Documentation**
- [ ] **Purpose:** Retry failed workflow execution (creates new execution)
- [ ] **Input Parameters:**
  ```typescript
  {
    id: string;              // Failed execution ID (required)
    instance?: string;       // n8n instance identifier (optional)
  }
  ```
- [ ] **Output Format:**
  ```typescript
  {
    id: number;              // New execution ID
    mode: 'retry';           // Always 'retry'
    retryOf: number;         // Original execution ID
    workflowId: number;
    finished: boolean;
    startedAt: string;
    stoppedAt?: string;
  }
  ```
- [ ] **Claude Desktop Examples:**
  ```
  Example 1 - Retry failed execution:
  User: "Retry execution 231"
  Claude: Uses retry_execution({ id: "231" })
  Response: New execution created with ID 250

  Example 2 - Find and retry all recent failures:
  User: "Retry all failed executions from today"
  Claude:
    1. list_executions({ status: 'error' })
    2. Filters by date (today)
    3. Shows list of failures
    4. Asks for confirmation
    5. retry_execution for each

  Example 3 - Track retry success:
  User: "Did retry of execution 231 succeed?"
  Claude:
    1. get_execution({ id: "231" })
    2. Checks retrySuccessId field
    3. If present: get_execution({ id: retrySuccessId })
    4. Shows retry outcome

  Example 4 - Retry chain tracking:
  User: "Show retry history for execution 231"
  Claude:
    1. get_execution({ id: "231" })
    2. Traces retryOf and retrySuccessId
    3. Builds retry chain
    4. Shows timeline of retry attempts
  ```
- [ ] **Retry Requirements:**
  - Only failed executions (status = 'error') can be retried
  - Creates NEW execution (not modifying original)
  - Uses CURRENT workflow version (not execution snapshot)
  - Original execution links to successful retry via retrySuccessId
- [ ] **Common Issues:**
  - Cannot retry success execution → error message
  - Cannot retry running execution → wait for completion
  - Retry uses current workflow → may differ from original

**AC6: Execution Monitoring Patterns**
- [ ] **Real-Time Monitoring:**
  ```
  User: "Monitor executions of workflow 123"
  Claude:
    1. list_executions({ workflowId: "123", limit: 10 })
    2. Shows recent executions with status
    3. Identifies patterns (success rate, failure trends)

  User: "Are there any failures in the last hour?"
  Claude:
    1. list_executions({ status: 'error' })
    2. Filters by timestamp
    3. Shows recent failures with details
  ```
- [ ] **Performance Analysis:**
  ```
  User: "How long do executions of workflow 456 take?"
  Claude:
    1. list_executions({ workflowId: "456", limit: 50 })
    2. Calculates duration: stoppedAt - startedAt
    3. Provides statistics (avg, min, max)
  ```
- [ ] **Failure Analysis:**
  ```
  User: "Analyze why workflow 789 is failing"
  Claude:
    1. list_executions({ workflowId: "789", status: 'error', includeData: true })
    2. Examines error messages in data.resultData.error
    3. Identifies common failure patterns
    4. Suggests fixes
  ```

**AC7: Execution Data Interpretation**
- [ ] **Node Execution Data:**
  ```typescript
  // From get_execution response
  data.resultData.runData: {
    "Webhook": [{
      startTime: 1703501400000,
      endTime: 1703501400100,
      inputData: { main: [[]] },
      outputData: { main: [[{ json: {...} }]] }
    }],
    "HTTP Request": [{
      startTime: 1703501400100,
      endTime: 1703501415000,
      inputData: { main: [[{ json: {...} }]] },
      outputData: { main: [[{ json: { status: "success" } }]] },
      error?: {
        message: "Connection timeout",
        stack: "Error: Connection timeout\n..."
      }
    }]
  }
  ```
- [ ] **Execution Timeline:**
  - startedAt → first node starts
  - Node execution sequence in runData
  - lastNodeExecuted → final node attempted
  - stoppedAt → execution completed
  - Duration = stoppedAt - startedAt
- [ ] **Error Data:**
  - error object in failed nodes
  - error.message - human-readable description
  - error.stack - full stack trace
  - lastNodeExecuted - where failure occurred

**AC8: Pagination and Performance**
- [ ] **Cursor-Based Pagination:**
  ```
  User: "Show me all executions (there are 500+)"
  Claude:
    1. list_executions({ limit: 100 })
    2. Returns first 100 + nextCursor
    3. User: "Show next page"
    4. list_executions({ limit: 100, cursor: nextCursor })
    5. Repeats until nextCursor is null
  ```
- [ ] **Performance Best Practices:**
  - Default: `includeData=false` (metadata only)
  - Use `includeData=true` only for analysis
  - Filter by workflowId to reduce results
  - Use pagination for >100 executions
  - Limit parameter: balance between requests and data size

**AC9: Multi-Instance Execution Management**
- [ ] **Cross-Instance Tracking:**
  ```
  User: "Show executions across all environments"
  Claude:
    1. list_executions({ instance: "production" })
    2. list_executions({ instance: "staging" })
    3. list_executions({ instance: "development" })
    4. Combines and presents results
  ```
- [ ] **Instance-Specific Operations:**
  ```
  User: "Retry failed executions in staging"
  Claude:
    1. list_executions({ status: 'error', instance: "staging" })
    2. Shows failures
    3. retry_execution({ id: each_id, instance: "staging" })
  ```

**AC10: Error Handling**
- [ ] Common errors:
  - **404 Not Found:** Execution ID doesn't exist
  - **400 Bad Request:** Cannot retry non-failed execution
  - **400 Bad Request:** Cannot delete running execution
  - **401 Unauthorized:** Invalid API key
- [ ] Error examples with solutions documented

**AC11: Usage Examples**
- [ ] **Example 1: Monitoring Failed Executions**
  ```
  User: "Show me all failed executions from today"
  Claude:
    1. list_executions({ status: 'error' })
    2. Filters by date (today)
    3. Shows: execution ID, workflow name, error message, time
    4. Suggests: "Would you like to retry any of these?"
  ```
- [ ] **Example 2: Debugging Specific Failure**
  ```
  User: "Why did execution 231 fail?"
  Claude:
    1. get_execution({ id: "231", includeData: true })
    2. Analyzes data.resultData.error
    3. Shows: failed node, error message, input data
    4. Suggests: potential fixes
  ```
- [ ] **Example 3: Workflow Performance Analysis**
  ```
  User: "Analyze performance of 'Data Sync' workflow"
  Claude:
    1. Find workflow ID
    2. list_executions({ workflowId: id, limit: 100 })
    3. Calculates: avg duration, success rate, failure patterns
    4. Shows: statistics and trends
  ```
- [ ] **Example 4: Cleanup Old Executions**
  ```
  User: "Delete executions older than 60 days"
  Claude:
    1. list_executions()
    2. Filters by date < 60 days ago
    3. Shows count and list
    4. Asks confirmation
    5. delete_execution for each (if confirmed)
  ```
- [ ] **Example 5: Retry Strategy**
  ```
  User: "Automatically retry all yesterday's failures"
  Claude:
    1. list_executions({ status: 'error' })
    2. Filters by date (yesterday)
    3. Shows failures with error reasons
    4. Asks: "Retry all or selective?"
    5. retry_execution for each selected
    6. Tracks new execution IDs
  ```

**AC12: Best Practices**
- [ ] **Monitoring:**
  - Check failed executions daily
  - Set up regular execution reviews
  - Track success rates over time
  - Monitor execution durations
- [ ] **Data Management:**
  - Use includeData=false for lists
  - Use includeData=true for debugging
  - Configure n8n auto-cleanup
  - Delete old executions periodically
- [ ] **Retry Strategy:**
  - Analyze failure reason before retry
  - Don't retry systematic failures
  - Track retry success rates
  - Limit retry attempts
- [ ] **Performance:**
  - Use filters to narrow results
  - Pagination for large datasets
  - Avoid includeData for all executions
  - Cache execution statistics

---

## Technical Implementation Notes

### Documentation Structure

```markdown
# Executions Management Tools Reference

## Overview

### Tools Summary Table
### Tool Categories
### Execution Lifecycle

## Tool Specifications

### list_executions
- Purpose
- Parameters
- Response format
- Examples
- Filtering patterns
- Pagination

### get_execution
- Purpose
- Parameters
- Response format
- Examples
- Data interpretation

### delete_execution
- Purpose
- Parameters
- Response format
- Examples
- Safety warnings

### retry_execution
- Purpose
- Parameters
- Response format
- Examples
- Retry requirements

## Execution Monitoring

### Real-Time Monitoring
### Performance Analysis
### Failure Analysis

## Execution Data

### Structure
### Node Execution Data
### Timeline Interpretation
### Error Data

## Pagination & Performance

### Cursor-Based Pagination
### Performance Best Practices
### Data Size Management

## Multi-Instance Management

### Cross-Instance Tracking
### Instance-Specific Operations

## Usage Patterns

### Monitor Failed Executions
### Debug Failures
### Performance Analysis
### Cleanup Strategy
### Retry Patterns

## Error Handling

### Common Errors
### Error Formats
### Solutions

## Best Practices

### Monitoring
### Data Management
### Retry Strategy
### Performance

## Related Documentation
- Epic 7 Story 7.3: Executions API
- Story 4.6: Error Handling
- Epic 8: Troubleshooting
```

### Content Sources

**Primary References:**
- `/src/index.ts` - tool implementations
- `/src/services/n8nApiWrapper.ts` - executions API methods
- `/docs/n8n-api-docs/20-EXECUTIONS-API.md` - n8n API reference
- Epic 7 Story 7.3 - Executions API documentation
- `/test-mcp-tools.js` - execution testing examples

---

## Dependencies

### Upstream Dependencies
- **Story 4.1** (Workflows Tools) - executions belong to workflows
- **Epic 3** (Installation & Quick Start) - assumes MCP server configured

### Downstream Dependencies
- **Story 4.6** (Error Handling) - references execution errors
- **Epic 8 Story 8.1** (Common Issues) - troubleshooting execution failures

### Related Stories
- **Epic 7 Story 7.3** (Executions API) - underlying API documentation
- **Epic 6** (Workflow Templates) - executions from template workflows

---

## Definition of Done

### Content Checklist
- [ ] All 4 tools documented with complete specifications
- [ ] Input/output formats with TypeScript interfaces
- [ ] 20+ Claude Desktop conversation examples
- [ ] Execution data interpretation guide
- [ ] Pagination patterns documented
- [ ] Multi-instance usage patterns
- [ ] Error handling reference
- [ ] Best practices included

### Quality Checklist
- [ ] All examples tested in Claude Desktop
- [ ] Execution data structure validated
- [ ] Error cases tested
- [ ] Performance recommendations verified
- [ ] TypeScript interfaces accurate
- [ ] Markdown formatting validated

### Review Checklist
- [ ] Technical accuracy by Dev Agent
- [ ] QA validation of examples
- [ ] Editor review for clarity

---

## Estimation

**Effort:** 6 story points (4-5 hours)

**Breakdown:**
- Tools overview: 30 minutes
- list_executions documentation: 60 minutes
- get_execution documentation: 60 minutes
- delete_execution & retry_execution: 60 minutes
- Execution data interpretation: 45 minutes
- Usage patterns and examples: 60 minutes
- Testing and validation: 45 minutes

**Page Count:** 12-14 pages

---

**Story Owner:** Technical Writer (Scribe Persona) + Analyzer Persona
**Reviewers:** Dev Agent, QA Agent
**Target Milestone:** Epic 4 - Phase 1 (Stories 4.1-4.3)
