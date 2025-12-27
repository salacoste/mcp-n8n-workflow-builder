# Workflows Management Tools

Complete reference for all 8 workflow management tools available in the n8n MCP Workflow Builder.

---

## Overview

The workflow management tools enable you to create, read, update, delete, activate, and execute n8n workflows through natural language conversations with Claude AI.

### Tools Summary

| Tool | Purpose | Type | n8n API Endpoint |
|------|---------|------|------------------|
| `list_workflows` | Get all workflows with metadata | Read | `GET /workflows` |
| `get_workflow` | Get complete workflow details | Read | `GET /workflows/{id}` |
| `create_workflow` | Create new workflow | Write | `POST /workflows` |
| `update_workflow` | Modify existing workflow | Write | `PATCH /workflows/{id}` |
| `delete_workflow` | Remove workflow permanently | Write | `DELETE /workflows/{id}` |
| `activate_workflow` | Enable workflow execution | Lifecycle | `PATCH /workflows/{id}` |
| `deactivate_workflow` | Disable workflow execution | Lifecycle | `PATCH /workflows/{id}` |
| `execute_workflow` | Manual execution (guidance) | Execution | N/A (API limitation) |

### Tool Categories

**Read Operations:**
- `list_workflows` - Browse and filter workflows
- `get_workflow` - View detailed workflow configuration

**Write Operations:**
- `create_workflow` - Build new workflows
- `update_workflow` - Modify existing workflows
- `delete_workflow` - Remove workflows

**Lifecycle Operations:**
- `activate_workflow` - Start automatic execution
- `deactivate_workflow` - Stop automatic execution

**Execution Operations:**
- `execute_workflow` - Trigger manual execution (limited by n8n API)

---

## list_workflows

Retrieve a list of all workflows with streamlined metadata.

### Purpose

Get an overview of your workflows without loading full workflow data. Optimized for performance to prevent Claude Desktop from becoming unresponsive with large workflow lists.

### Input Parameters

```typescript
{
  active?: boolean;        // Filter by status
  tags?: string[];         // Filter by tag IDs
  limit?: number;          // Results per page (default: 100, max: 250)
  cursor?: string;         // Pagination cursor
  instance?: string;       // n8n instance identifier (optional)
}
```

### Output Format

```typescript
{
  data: Array<{
    id: string;            // Workflow ID
    name: string;          // Workflow name
    active: boolean;       // Is workflow currently active
    createdAt: string;     // ISO 8601 timestamp
    updatedAt: string;     // ISO 8601 timestamp
    nodes?: number;        // Number of nodes (optional)
    tags?: string[];       // Associated tag IDs (optional)
  }>;
  nextCursor?: string;     // For pagination (if more results exist)
}
```

### Usage Examples

=== "List All Workflows"

    **Request:**
    ```
    List all my n8n workflows
    ```

    **What Claude does:**
    ```typescript
    list_workflows()
    ```

    **Response:**
    ```
    You have 15 workflows:

    1. Email Notification System (ID: 1)
       - Status: Active
       - Created: 2025-12-01
       - Nodes: 5

    2. Data Sync Pipeline (ID: 2)
       - Status: Inactive
       - Created: 2025-12-15
       - Nodes: 8

    [... 13 more workflows ...]
    ```

=== "Filter Active Only"

    **Request:**
    ```
    Show only active workflows
    ```

    **What Claude does:**
    ```typescript
    list_workflows({ active: true })
    ```

    **Response:**
    ```
    You have 8 active workflows:

    1. Email Notification System (ID: 1)
    2. Slack Alert Bot (ID: 5)
    3. Database Backup (ID: 7)
    [... 5 more ...]
    ```

=== "Filter by Tags"

    **Request:**
    ```
    Show workflows tagged with "production"
    ```

    **What Claude does:**
    ```typescript
    // First, get tag ID
    get_tags() // Find "production" tag ID

    // Then filter workflows
    list_workflows({ tags: ["tag_id_123"] })
    ```

=== "Multi-Instance"

    **Request:**
    ```
    List workflows in staging environment
    ```

    **What Claude does:**
    ```typescript
    list_workflows({ instance: "staging" })
    ```

### Performance Notes

!!! info "Optimized for Large Lists"
    - Returns metadata only (not full workflow JSON)
    - 90%+ data reduction compared to full workflow data
    - Prevents Claude Desktop crashes with 100+ workflows
    - Use `get_workflow` for detailed workflow information

### Error Handling

**Common Errors:**

| Error | Cause | Solution |
|-------|-------|----------|
| `401 Unauthorized` | Invalid API key | Verify n8n API key in configuration |
| `404 Not Found` | Wrong API endpoint | Check N8N_HOST URL format |
| `Instance not found` | Invalid instance name | List available instances |
| `Connection refused` | n8n not running | Start n8n instance |

---

## get_workflow

Retrieve complete workflow details including nodes, connections, and settings.

### Purpose

Get full workflow configuration for viewing, editing, or debugging purposes.

### Input Parameters

```typescript
{
  id: string;              // Workflow ID (required)
  instance?: string;       // n8n instance identifier (optional)
}
```

### Output Format

```typescript
{
  id: string;
  name: string;
  active: boolean;
  nodes: Array<{
    id: string;
    name: string;
    type: string;
    typeVersion: number;
    position: [number, number];
    parameters: Record<string, any>;
    credentials?: Record<string, any>;
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
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}
```

### Usage Examples

=== "Get by ID"

    **Request:**
    ```
    Show me workflow 15
    ```

    **What Claude does:**
    ```typescript
    get_workflow({ id: "15" })
    ```

    **Response:**
    ```
    Workflow: Email Notification System (ID: 15)
    Status: Active
    Created: 2025-12-01
    Updated: 2025-12-20

    Nodes (5 total):
    1. Schedule Trigger - scheduleTrigger (triggers daily at 9 AM)
    2. Fetch Data - httpRequest (GET request to API)
    3. Transform Data - set (formats email content)
    4. Send Email - email (sends to recipients)
    5. Log Result - set (logs execution status)

    Connections:
    - Schedule Trigger → Fetch Data
    - Fetch Data → Transform Data
    - Transform Data → Send Email
    - Send Email → Log Result
    ```

=== "Multi-Instance"

    **Request:**
    ```
    Get workflow 5 from production
    ```

    **What Claude does:**
    ```typescript
    get_workflow({ id: "5", instance: "production" })
    ```

### Use Cases

- **Debugging:** View workflow configuration to identify issues
- **Documentation:** Generate workflow documentation
- **Cloning:** Copy workflow to create variations
- **Analysis:** Understand workflow structure and dependencies

---

## create_workflow

Create a new n8n workflow with specified configuration.

### Purpose

Build workflows through natural language descriptions. Claude AI generates the necessary nodes, connections, and settings.

### Input Parameters

```typescript
{
  name: string;                    // Workflow name (required)
  nodes: Array<{                   // Workflow nodes (required)
    id: string;
    name: string;
    type: string;
    typeVersion?: number;
    position: [number, number];
    parameters: Record<string, any>;
    credentials?: Record<string, any>;
  }>;
  connections?: Array<{            // Node connections (optional, auto-converted)
    source: string;
    target: string;
    sourceOutput?: number;
    targetInput?: number;
  }>;
  settings?: Record<string, any>;  // Workflow settings (optional)
  staticData?: Record<string, any>; // Static workflow data (optional)
  tags?: string[];                 // Tag IDs (optional)
  instance?: string;               // n8n instance (optional)
}
```

### Output Format

```typescript
{
  id: string;                // New workflow ID
  name: string;
  active: boolean;           // Initially false
  nodes: Array<...>;
  connections: Record<...>;
  createdAt: string;
  updatedAt: string;
}
```

### Usage Examples

=== "Simple Workflow"

    **Request:**
    ```
    Create a workflow called "Daily Backup" that:
    - Runs every day at 2 AM
    - Backs up database
    - Sends completion email
    ```

    **What Claude does:**
    ```typescript
    create_workflow({
      name: "Daily Backup",
      nodes: [
        {
          id: "node1",
          name: "Schedule",
          type: "scheduleTrigger",
          parameters: {
            rule: {
              interval: [{ field: "cronExpression", expression: "0 2 * * *" }]
            }
          },
          position: [250, 300]
        },
        {
          id: "node2",
          name: "Backup Database",
          type: "postgres",
          parameters: {
            operation: "executeQuery",
            query: "SELECT * FROM backup_procedure()"
          },
          position: [450, 300]
        },
        {
          id: "node3",
          name: "Send Email",
          type: "email",
          parameters: {
            toEmail: "admin@example.com",
            subject: "Backup Complete",
            message: "Database backup completed successfully"
          },
          position: [650, 300]
        }
      ],
      connections: [
        { source: "node1", target: "node2" },
        { source: "node2", target: "node3" }
      ]
    })
    ```

=== "Webhook Workflow"

    **Request:**
    ```
    Create a webhook workflow "Order Processor" that receives orders and saves them
    ```

    **What Claude does:**
    ```typescript
    create_workflow({
      name: "Order Processor",
      nodes: [
        {
          id: "webhook",
          name: "Receive Order",
          type: "webhook",
          parameters: {
            path: "process-order",
            responseMode: "lastNode"
          },
          position: [250, 300]
        },
        {
          id: "validate",
          name: "Validate Order",
          type: "code",
          parameters: {
            code: "// Validation logic"
          },
          position: [450, 300]
        },
        {
          id: "save",
          name: "Save to Database",
          type: "postgres",
          parameters: {
            operation: "insert",
            table: "orders"
          },
          position: [650, 300]
        }
      ],
      connections: [
        { source: "webhook", target: "validate" },
        { source: "validate", target: "save" }
      ]
    })
    ```

### Best Practices

!!! tip "Workflow Creation Tips"
    1. **Start simple** - Create minimal workflow, then enhance
    2. **Use descriptive names** - For workflows and nodes
    3. **Test incrementally** - Activate after testing each component
    4. **Position nodes** - Space nodes 200 pixels apart for readability
    5. **Add error handling** - Include error workflow branches

### Validation

The MCP server automatically validates:
- ✅ Required fields presence
- ✅ Node type compatibility
- ✅ Connection validity
- ✅ Parameter formats

---

## update_workflow

Modify an existing workflow configuration.

### Purpose

Update workflow name, nodes, connections, settings, or any other workflow property.

### Input Parameters

```typescript
{
  id: string;                      // Workflow ID (required)
  name?: string;                   // New workflow name
  nodes?: Array<...>;              // Updated nodes array
  connections?: Array<...>;        // Updated connections
  settings?: Record<string, any>;  // Updated settings
  tags?: string[];                 // Updated tag assignments
  instance?: string;               // n8n instance (optional)
}
```

### Output Format

```typescript
{
  id: string;
  name: string;
  active: boolean;
  nodes: Array<...>;
  connections: Record<...>;
  updatedAt: string;              // New update timestamp
}
```

### Usage Examples

=== "Rename Workflow"

    **Request:**
    ```
    Rename workflow 15 to "Daily Email Alerts"
    ```

    **What Claude does:**
    ```typescript
    update_workflow({
      id: "15",
      name: "Daily Email Alerts"
    })
    ```

=== "Update Node Parameters"

    **Request:**
    ```
    Update workflow 10 to send email to new-email@example.com
    ```

    **What Claude does:**
    ```typescript
    // First, get current workflow
    const workflow = get_workflow({ id: "10" })

    // Update email node parameters
    const updatedNodes = workflow.nodes.map(node => {
      if (node.type === "email") {
        return {
          ...node,
          parameters: {
            ...node.parameters,
            toEmail: "new-email@example.com"
          }
        }
      }
      return node
    })

    // Update workflow
    update_workflow({
      id: "10",
      nodes: updatedNodes
    })
    ```

=== "Add New Node"

    **Request:**
    ```
    Add a Slack notification node to workflow 5 after the email node
    ```

    **What Claude does:**
    ```typescript
    // Get current workflow
    const workflow = get_workflow({ id: "5" })

    // Add new node
    const newNode = {
      id: "slack_node",
      name: "Notify Slack",
      type: "slack",
      parameters: {
        channel: "#alerts",
        message: "Task completed"
      },
      position: [850, 300]
    }

    // Add connection
    const newConnection = {
      source: "email_node_id",
      target: "slack_node"
    }

    // Update workflow
    update_workflow({
      id: "5",
      nodes: [...workflow.nodes, newNode],
      connections: [...workflow.connections, newConnection]
    })
    ```

### Important Notes

!!! warning "Full Replacement"
    When updating `nodes` or `connections`, you must provide the **complete** array, not just changes. The update replaces the entire field.

!!! tip "Incremental Updates"
    For complex updates:
    1. Get current workflow with `get_workflow`
    2. Modify the needed properties
    3. Send complete updated configuration

---

## delete_workflow

Permanently remove a workflow and all its execution history.

### Purpose

Delete workflows that are no longer needed. This action is irreversible.

### Input Parameters

```typescript
{
  id: string;              // Workflow ID (required)
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

=== "Delete by ID"

    **Request:**
    ```
    Delete workflow 99
    ```

    **What Claude does:**
    ```typescript
    delete_workflow({ id: "99" })
    ```

    **Response:**
    ```
    ✅ Successfully deleted workflow "Old Test Workflow" (ID: 99)

    The workflow and all its execution history have been permanently removed.
    ```

=== "Delete After Confirmation"

    **Request:**
    ```
    Delete the "Temporary Test" workflow
    ```

    **Claude's response:**
    ```
    I found workflow "Temporary Test" (ID: 42).

    ⚠️ Warning: This action is permanent and will delete:
    - The workflow configuration
    - All execution history
    - All associated data

    Should I proceed with deletion?
    ```

    **User confirms:**
    ```
    Yes, delete it
    ```

    **What Claude does:**
    ```typescript
    delete_workflow({ id: "42" })
    ```

### Safety Considerations

!!! danger "Irreversible Action"
    - **No undo** - Deletion is permanent
    - **History lost** - All execution records deleted
    - **Backup recommended** - Export workflow before deletion if needed

!!! tip "Before Deleting"
    1. **Deactivate first** - Stop executions before deletion
    2. **Export workflow** - Use n8n UI to export if you might need it later
    3. **Check dependencies** - Ensure no other workflows depend on this one
    4. **Verify ID** - Double-check you're deleting the correct workflow

---

## activate_workflow

Enable a workflow for automatic execution based on its triggers.

### Purpose

Start a workflow so it runs automatically when triggered (schedules, webhooks, etc.).

### Input Parameters

```typescript
{
  id: string;              // Workflow ID (required)
  instance?: string;       // n8n instance (optional)
}
```

### Output Format

```typescript
{
  id: string;
  name: string;
  active: boolean;         // Now true
  message?: string;        // Activation details
}
```

### Usage Examples

=== "Basic Activation"

    **Request:**
    ```
    Activate workflow 15
    ```

    **What Claude does:**
    ```typescript
    activate_workflow({ id: "15" })
    ```

    **Response:**
    ```
    ✅ Workflow "Daily Email Report" (ID: 15) has been activated!

    The workflow will now run automatically based on its schedule trigger:
    - Schedule: Every day at 9:00 AM
    - Next execution: 2025-12-28 09:00:00

    Monitor executions with: "Show executions for workflow 15"
    ```

=== "Multi-Instance"

    **Request:**
    ```
    Activate workflow 5 in production
    ```

    **What Claude does:**
    ```typescript
    activate_workflow({ id: "5", instance: "production" })
    ```

### Automatic Trigger Addition

!!! info "Smart Trigger Management"
    The MCP server automatically ensures workflows have valid triggers before activation:

    - If workflow has no trigger → Adds `scheduleTrigger` with default schedule
    - If workflow has `manualTrigger` only → Adds compatible trigger
    - n8n API v1.82.3 doesn't recognize `manualTrigger` as valid for activation

**Example:**
```
User: "Activate workflow 20"

Claude checks workflow 20:
- Has only manualTrigger node
- Adds scheduleTrigger node automatically
- Then activates workflow

Response: "Added schedule trigger and activated workflow"
```

### Activation Requirements

**Valid Triggers:**
- `scheduleTrigger` - Cron-based scheduling
- `webhook` - HTTP endpoint receiver
- Service-specific triggers (Slack, Email, etc.)

**Invalid Triggers:**
- `manualTrigger` - n8n API limitation (cannot activate)

### Best Practices

!!! tip "Before Activating"
    1. **Test manually** - Verify workflow works as expected
    2. **Check credentials** - Ensure all required credentials are configured
    3. **Verify schedule** - Confirm trigger settings are correct
    4. **Monitor initial runs** - Watch first few executions for issues

---

## deactivate_workflow

Disable a workflow to stop automatic execution.

### Purpose

Stop a workflow from running automatically. Useful for maintenance, debugging, or temporary suspension.

### Input Parameters

```typescript
{
  id: string;              // Workflow ID (required)
  instance?: string;       // n8n instance (optional)
}
```

### Output Format

```typescript
{
  id: string;
  name: string;
  active: boolean;         // Now false
  message?: string;
}
```

### Usage Examples

=== "Basic Deactivation"

    **Request:**
    ```
    Deactivate workflow 15
    ```

    **What Claude does:**
    ```typescript
    deactivate_workflow({ id: "15" })
    ```

    **Response:**
    ```
    ✅ Workflow "Daily Email Report" (ID: 15) has been deactivated!

    The workflow will no longer run automatically.
    You can still:
    - View workflow configuration
    - Check execution history
    - Reactivate when needed
    ```

=== "Batch Deactivation"

    **Request:**
    ```
    Deactivate all workflows tagged with "testing"
    ```

    **What Claude does:**
    ```typescript
    // Get testing tag ID
    const tags = get_tags()
    const testingTag = tags.find(t => t.name === "testing")

    // List workflows with testing tag
    const workflows = list_workflows({ tags: [testingTag.id] })

    // Deactivate each
    workflows.data.forEach(workflow => {
      deactivate_workflow({ id: workflow.id })
    })
    ```

### Use Cases

- **Maintenance** - Temporarily stop during updates
- **Debugging** - Prevent execution while troubleshooting
- **Resource Management** - Reduce load during peak times
- **Testing** - Stop production workflows before testing changes

---

## execute_workflow

Attempt to manually execute a workflow (with API limitations).

### Purpose

Provides guidance on manual workflow execution. Note that n8n REST API v1.82.3 has limitations for manual execution.

### Input Parameters

```typescript
{
  id: string;              // Workflow ID (required)
  instance?: string;       // n8n instance (optional)
}
```

### Output Format

```typescript
{
  success: boolean;
  message: string;         // Guidance or error explanation
  executionId?: string;    // If execution started
}
```

### API Limitations

!!! warning "n8n API Limitation"
    **Manual execution via REST API is limited:**

    - **Schedule triggers** - Cannot be executed manually via API
    - **Manual triggers** - Not supported for API execution
    - **Most triggers** - Designed for automatic activation only

    **Workaround:** Use n8n web interface for manual testing

### Usage Examples

=== "Execution Attempt"

    **Request:**
    ```
    Execute workflow 15 manually
    ```

    **What Claude does:**
    ```typescript
    execute_workflow({ id: "15" })
    ```

    **Response:**
    ```
    ⚠️ Manual Execution Limitation

    Workflow "Daily Email Report" (ID: 15) uses a schedule trigger,
    which cannot be executed manually via the n8n REST API.

    To test this workflow:
    1. Open workflow in n8n web interface:
       https://your-n8n-instance.com/workflow/15
    2. Click "Execute Workflow" button
    3. View execution results in the UI

    Alternatively:
    - Wait for next scheduled execution
    - Check execution history: "Show executions for workflow 15"
    ```

### Alternative Testing Methods

**Option 1: n8n Web Interface**
```
1. Navigate to workflow in n8n
2. Click "Execute Workflow" button
3. View real-time execution
```

**Option 2: Webhook Testing**
```
For webhook workflows:
curl -X POST https://your-n8n-instance.com/webhook/your-path \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

**Option 3: Monitor Scheduled Execution**
```
User: "When is workflow 15 scheduled to run next?"
Claude: Shows next execution time based on trigger settings
```

---

## Common Workflows

### Complete Workflow Lifecycle

```
1. Create workflow
   → create_workflow()

2. Review configuration
   → get_workflow()

3. Test and refine
   → update_workflow()

4. Activate for production
   → activate_workflow()

5. Monitor executions
   → list_executions() (see Executions Management)

6. Deactivate for maintenance
   → deactivate_workflow()

7. Delete when obsolete
   → delete_workflow()
```

### Batch Operations

**Activate all inactive workflows:**
```
1. list_workflows({ active: false })
2. For each workflow:
   - activate_workflow({ id })
```

**Tag all workflows by pattern:**
```
1. list_workflows()
2. Filter workflows by name pattern
3. create_tag() for new tag
4. update_workflow() to add tag to each
```

---

## Next Steps

- **[Execution Management](executions-management.md)** - Monitor workflow runs
- **[Tag Management](tags-management.md)** - Organize workflows
- **[Examples](../examples/basic/webhook-workflow.md)** - Real-world patterns
- **[API Reference](../api/workflows-api.md)** - Technical specifications

---

!!! question "Need Help?"
    - [Troubleshooting Guide](../troubleshooting/error-reference.md)
    - [GitHub Issues](https://github.com/salacoste/mcp-n8n-workflow-builder/issues)
