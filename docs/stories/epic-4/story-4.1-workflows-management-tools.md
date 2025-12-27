# Story 4.1: Workflows Management Tools Reference

**Epic:** Epic 4 - Core Features & MCP Tools Reference
**Story ID:** STORY-4.1
**Status:** Draft
**Created:** 2025-12-27
**Updated:** 2025-12-27

---

## User Story

**As a** user managing n8n workflows through Claude Desktop
**I want** comprehensive reference documentation for all 8 workflow management tools
**So that** I can effectively create, read, update, delete, activate, and execute workflows

---

## Story Description

### Current System Context

The MCP server provides **8 workflow management tools** implemented in `/src/index.ts`:

1. **list_workflows** - Get all workflows with metadata (optimized for performance)
2. **get_workflow** - Retrieve complete workflow details including nodes and connections
3. **create_workflow** - Create new workflows with validation
4. **update_workflow** - Modify existing workflows (full or partial updates)
5. **delete_workflow** - Permanently remove workflows
6. **activate_workflow** - Enable workflow for automatic execution
7. **deactivate_workflow** - Disable workflow execution
8. **execute_workflow** - Manual workflow execution (with API limitations guidance)

**Performance Optimization (Epic 2, v0.8.0):**
- `list_workflows` returns streamlined metadata only (ID, name, status, dates, node count, tags)
- Never returns full workflow JSON to prevent Claude Desktop crashes
- 90%+ data reduction for large workflow lists

**Multi-Instance Support (Epic 5):**
- All tools accept optional `instance` parameter
- Routes to specific n8n environment (production, staging, development)
- Uses default environment if instance not specified

**API Coverage (Epic 2):**
- 8/8 workflow methods fully implemented (100% coverage)
- Automatic trigger node addition for activation (Epic 1)
- Connection format transformation (array ↔ n8n object format)

### Enhancement: Comprehensive Workflows Tools Documentation

Create detailed reference documentation covering:

**Tool Overview:**
- Purpose and use cases for each tool
- Input parameters with types and requirements
- Output formats and response structure
- Multi-instance usage patterns
- Common usage scenarios

**Detailed Tool Specifications:**
- Parameter descriptions with examples
- Response schemas with TypeScript interfaces
- Error handling and common issues
- Performance considerations
- Best practices for each tool

**Integration Examples:**
- Claude Desktop conversation examples
- Chained tool operations
- Real-world workflow scenarios
- Troubleshooting patterns

**API Reference:**
- Direct n8n REST API mapping
- Epic 7 cross-reference (API Coverage documentation)
- Version compatibility notes

---

## Acceptance Criteria

### Documentation Requirements

**AC1: Tools Overview Section**
- [ ] Summary table of all 8 tools:
  | Tool | Purpose | Input | Output | n8n API |
  |------|---------|-------|--------|---------|
  | list_workflows | Get all workflows | filters, instance | metadata array | GET /workflows |
  | get_workflow | Get workflow details | id, instance | full workflow object | GET /workflows/{id} |
  | create_workflow | Create new workflow | workflow data, instance | created workflow | POST /workflows |
  | update_workflow | Modify workflow | id, updates, instance | updated workflow | PATCH /workflows/{id} |
  | delete_workflow | Remove workflow | id, instance | success/error | DELETE /workflows/{id} |
  | activate_workflow | Enable workflow | id, instance | activation status | PUT /workflows/{id}/activate |
  | deactivate_workflow | Disable workflow | id, instance | deactivation status | PUT /workflows/{id}/deactivate |
  | execute_workflow | Run manually | id, instance | guidance message | N/A (API limitation) |

- [ ] Tool categories explanation:
  - **Read operations:** list_workflows, get_workflow
  - **Write operations:** create_workflow, update_workflow, delete_workflow
  - **Lifecycle operations:** activate_workflow, deactivate_workflow
  - **Execution operations:** execute_workflow (guidance only)

**AC2: list_workflows Tool Documentation**
- [ ] **Purpose:** Retrieve list of all workflows with streamlined metadata
- [ ] **Input Parameters:**
  ```typescript
  {
    active?: boolean;        // Filter: true (active), false (inactive), undefined (all)
    tags?: string[];         // Filter by tag IDs (array of tag IDs)
    limit?: number;          // Max results (default: 100, max: 250)
    cursor?: string;         // Pagination cursor
    instance?: string;       // n8n instance identifier (optional)
  }
  ```
- [ ] **Output Format:**
  ```typescript
  {
    data: Array<{
      id: string;            // Workflow ID
      name: string;          // Workflow name
      active: boolean;       // Is workflow active
      createdAt: string;     // ISO 8601 timestamp
      updatedAt: string;     // ISO 8601 timestamp
      nodes?: number;        // Node count (optional)
      tags?: string[];       // Tag IDs (optional)
    }>;
    nextCursor?: string;     // Pagination cursor (if more results)
  }
  ```
- [ ] **Claude Desktop Examples:**
  ```
  Example 1 - List all workflows:
  User: "Show me all my n8n workflows"
  Claude: Uses list_workflows() → returns metadata for all workflows

  Example 2 - Filter active workflows:
  User: "List only active workflows"
  Claude: Uses list_workflows({ active: true })

  Example 3 - Filter by tags:
  User: "Show workflows tagged with production"
  Claude: First gets tag ID, then list_workflows({ tags: [tag_id] })

  Example 4 - Multi-instance:
  User: "List workflows in staging environment"
  Claude: Uses list_workflows({ instance: "staging" })

  Example 5 - Pagination:
  User: "Show next page of workflows"
  Claude: Uses list_workflows({ cursor: "previous_cursor" })
  ```
- [ ] **Performance Notes:**
  - Optimized for large datasets (Epic 2)
  - Does NOT return full workflow JSON
  - Use get_workflow for complete details
  - Safe for 1000+ workflows

**AC3: get_workflow Tool Documentation**
- [ ] **Purpose:** Retrieve complete workflow details including nodes, connections, settings
- [ ] **Input Parameters:**
  ```typescript
  {
    id: string;              // Workflow ID (required)
    instance?: string;       // n8n instance identifier (optional)
  }
  ```
- [ ] **Output Format:**
  ```typescript
  {
    id: string;
    name: string;
    active: boolean;
    nodes: Array<{
      name: string;
      type: string;          // e.g., "n8n-nodes-base.webhook"
      typeVersion: number;
      position: [number, number];  // [x, y] coordinates
      parameters: object;    // Node configuration
      credentials?: object;  // Credential references
    }>;
    connections: {           // n8n format (transformed from array)
      [nodeName: string]: {
        main?: Array<Array<{
          node: string;
          type: string;
          index: number;
        }>>;
      };
    };
    settings: object;
    staticData: object | null;
    tags: string[];
    createdAt: string;
    updatedAt: string;
  }
  ```
- [ ] **Claude Desktop Examples:**
  ```
  Example 1 - Get workflow by ID:
  User: "Get details for workflow 123"
  Claude: Uses get_workflow({ id: "123" })

  Example 2 - Get workflow by name (requires list first):
  User: "Show me the 'Customer Onboarding' workflow"
  Claude:
    1. list_workflows() → find ID by name
    2. get_workflow({ id: found_id })

  Example 3 - Multi-instance:
  User: "Get workflow 456 from production"
  Claude: Uses get_workflow({ id: "456", instance: "production" })

  Example 4 - Analyze workflow structure:
  User: "What nodes are in workflow 123?"
  Claude:
    1. get_workflow({ id: "123" })
    2. Analyzes nodes array
    3. Lists node names and types
  ```
- [ ] **Use Cases:**
  - Inspect workflow structure
  - Analyze node configuration
  - Review connections
  - Prepare for updates
  - Debugging workflow issues

**AC4: create_workflow Tool Documentation**
- [ ] **Purpose:** Create new workflow with nodes, connections, and configuration
- [ ] **Input Parameters:**
  ```typescript
  {
    name: string;            // Workflow name (required)
    nodes: Node[];           // Array of nodes (can be empty)
    connections: Connection[] | ConnectionsObject;  // Connections (array or object format)
    active?: boolean;        // Auto-activate (default: false)
    settings?: object;       // Workflow settings (default: {})
    staticData?: object;     // Static data (default: null)
    tags?: string[];         // Tag IDs (default: [])
    instance?: string;       // n8n instance identifier (optional)
  }
  ```
- [ ] **Output Format:** Full workflow object (same as get_workflow)
- [ ] **Claude Desktop Examples:**
  ```
  Example 1 - Create simple workflow:
  User: "Create a new workflow called 'Test Workflow' with just a Start node"
  Claude: Uses create_workflow({
    name: "Test Workflow",
    nodes: [{
      name: "Start",
      type: "n8n-nodes-base.start",
      typeVersion: 1,
      position: [250, 300],
      parameters: {}
    }],
    connections: []
  })

  Example 2 - Create workflow with tags:
  User: "Create 'Data Sync' workflow tagged with production and automation"
  Claude:
    1. Get tag IDs for "production" and "automation"
    2. create_workflow({ name: "Data Sync", tags: [tag_id1, tag_id2] })

  Example 3 - Create and activate:
  User: "Create active workflow 'Email Alert'"
  Claude: Uses create_workflow({ name: "Email Alert", active: true })
  Note: Must have valid trigger node for activation

  Example 4 - Multi-instance:
  User: "Create workflow in staging environment"
  Claude: Uses create_workflow({ ..., instance: "staging" })

  Example 5 - Using workflow prompts (easier):
  User: "Create HTTP webhook workflow"
  Claude: Uses workflow prompt template → create_workflow
  ```
- [ ] **Validation Notes:**
  - Automatic connection format conversion (array → n8n object)
  - Set node parameter normalization
  - Node type validation
  - Trigger node requirement for activation

**AC5: update_workflow Tool Documentation**
- [ ] **Purpose:** Modify existing workflow (supports partial updates via PATCH)
- [ ] **Input Parameters:**
  ```typescript
  {
    id: string;              // Workflow ID (required)
    name?: string;           // New name
    nodes?: Node[];          // Updated nodes
    connections?: Connection[] | ConnectionsObject;  // Updated connections
    active?: boolean;        // Change activation status
    settings?: object;       // Updated settings
    staticData?: object;     // Updated static data
    tags?: string[];         // Updated tags
    instance?: string;       // n8n instance identifier (optional)
  }
  ```
- [ ] **Output Format:** Updated workflow object
- [ ] **Claude Desktop Examples:**
  ```
  Example 1 - Rename workflow:
  User: "Rename workflow 123 to 'Production Data Sync'"
  Claude: Uses update_workflow({ id: "123", name: "Production Data Sync" })

  Example 2 - Update tags:
  User: "Add 'critical' tag to workflow 456"
  Claude:
    1. get_workflow({ id: "456" }) → get current tags
    2. Get "critical" tag ID
    3. update_workflow({ id: "456", tags: [...existing, critical_id] })

  Example 3 - Activate via update:
  User: "Activate workflow 789"
  Claude: Uses activate_workflow (preferred) OR update_workflow({ id: "789", active: true })

  Example 4 - Update nodes:
  User: "Update workflow 123 to change webhook path to '/new-path'"
  Claude:
    1. get_workflow({ id: "123" })
    2. Modify webhook node parameters
    3. update_workflow({ id: "123", nodes: updated_nodes })
  ```
- [ ] **Best Practices:**
  - Prefer PATCH for partial updates
  - Use activate_workflow/deactivate_workflow for status changes
  - Get current workflow first when modifying nodes/connections
  - Validate changes before updating

**AC6: delete_workflow Tool Documentation**
- [ ] **Purpose:** Permanently delete workflow (irreversible operation)
- [ ] **Input Parameters:**
  ```typescript
  {
    id: string;              // Workflow ID (required)
    instance?: string;       // n8n instance identifier (optional)
  }
  ```
- [ ] **Output Format:**
  ```typescript
  {
    success: boolean;        // Always true if no error
    message: string;         // Confirmation message
  }
  ```
- [ ] **Claude Desktop Examples:**
  ```
  Example 1 - Delete workflow:
  User: "Delete workflow 123"
  Claude: Uses delete_workflow({ id: "123" })
  Warning: Asks for confirmation first

  Example 2 - Delete by name:
  User: "Delete the 'Old Test' workflow"
  Claude:
    1. list_workflows() → find ID by name
    2. delete_workflow({ id: found_id })
    Confirms with user before deletion

  Example 3 - Bulk delete (with confirmation):
  User: "Delete all workflows tagged 'test'"
  Claude:
    1. list_workflows({ tags: [test_tag_id] })
    2. Shows list of workflows to delete
    3. Asks for confirmation
    4. delete_workflow for each (if confirmed)
  ```
- [ ] **Safety Warnings:**
  - ⚠️ **IRREVERSIBLE:** Deleted workflows cannot be recovered
  - Execution history is also deleted
  - Active workflows are deactivated before deletion
  - Always confirm before deletion
  - Consider deactivating instead of deleting for testing

**AC7: activate_workflow Tool Documentation**
- [ ] **Purpose:** Enable workflow for automatic execution via triggers
- [ ] **Input Parameters:**
  ```typescript
  {
    id: string;              // Workflow ID (required)
    instance?: string;       // n8n instance identifier (optional)
  }
  ```
- [ ] **Output Format:**
  ```typescript
  {
    id: string;
    active: boolean;         // Should be true
    message?: string;        // Success/info message
  }
  ```
- [ ] **Claude Desktop Examples:**
  ```
  Example 1 - Activate workflow:
  User: "Activate workflow 123"
  Claude: Uses activate_workflow({ id: "123" })

  Example 2 - Activate by name:
  User: "Enable the 'Customer Alerts' workflow"
  Claude:
    1. list_workflows() → find ID
    2. activate_workflow({ id: found_id })

  Example 3 - Bulk activation:
  User: "Activate all production workflows"
  Claude:
    1. list_workflows({ tags: [production_tag_id] })
    2. activate_workflow for each inactive workflow
  ```
- [ ] **Trigger Requirements (Epic 1 Feature):**
  - Workflow MUST have valid trigger node
  - Valid triggers: `scheduleTrigger`, `webhook`, service-specific triggers
  - **NOT valid:** `manualTrigger` (n8n API v1.82.3 limitation)
  - MCP server automatically adds valid trigger if missing
- [ ] **Common Issues:**
  - Cannot activate without trigger → solution: add valid trigger node
  - Workflow already active → no error, returns current status
  - Missing credentials → configure in n8n UI first

**AC8: deactivate_workflow Tool Documentation**
- [ ] **Purpose:** Disable workflow to stop automatic execution
- [ ] **Input Parameters:**
  ```typescript
  {
    id: string;              // Workflow ID (required)
    instance?: string;       // n8n instance identifier (optional)
  }
  ```
- [ ] **Output Format:**
  ```typescript
  {
    id: string;
    active: boolean;         // Should be false
    message?: string;        // Success message
  }
  ```
- [ ] **Claude Desktop Examples:**
  ```
  Example 1 - Deactivate workflow:
  User: "Deactivate workflow 123"
  Claude: Uses deactivate_workflow({ id: "123" })

  Example 2 - Deactivate for maintenance:
  User: "Temporarily disable 'Data Sync' workflow for maintenance"
  Claude:
    1. list_workflows() → find ID
    2. deactivate_workflow({ id: found_id })

  Example 3 - Bulk deactivation:
  User: "Deactivate all staging workflows"
  Claude:
    1. list_workflows({ instance: "staging" })
    2. deactivate_workflow for each active workflow
  ```
- [ ] **Use Cases:**
  - Temporary maintenance
  - Testing/debugging
  - Preventing unwanted executions
  - Before workflow updates
  - Workflow retirement (before deletion)

**AC9: execute_workflow Tool Documentation**
- [ ] **Purpose:** Provide guidance for manual workflow execution
- [ ] **API Limitation (n8n v1.82.3):**
  - Manual trigger workflows CANNOT be executed via REST API
  - Execution must occur through n8n web UI
  - Tool provides helpful guidance instead of attempting execution
- [ ] **Input Parameters:**
  ```typescript
  {
    id: string;              // Workflow ID (required)
    instance?: string;       // n8n instance identifier (optional)
  }
  ```
- [ ] **Output Format:**
  ```typescript
  {
    limitation: true;
    message: string;         // Guidance message
    alternativeMethods: {
      webUI: string;         // n8n UI execution instructions
      webhook: string;       // Webhook trigger alternative
      schedule: string;      // Schedule trigger alternative
    }
  }
  ```
- [ ] **Claude Desktop Examples:**
  ```
  Example 1 - Execute workflow (receives guidance):
  User: "Execute workflow 123"
  Claude: Uses execute_workflow({ id: "123" })
  Response: Explains API limitation, provides alternatives

  Example 2 - Guidance message example:
  "Workflow execution via REST API is not available for manual trigger workflows in n8n v1.82.3.

  Alternative methods:
  1. Web UI: Open workflow in n8n and click 'Execute Workflow'
  2. Webhook: Convert to webhook trigger for API execution
  3. Schedule: Use cron trigger for automated execution

  Would you like help converting this to a webhook trigger?"
  ```
- [ ] **Alternative Solutions:**
  - Use n8n web UI for manual execution
  - Convert to webhook trigger for API execution
  - Use schedule trigger for periodic execution
  - Check executions via list_executions tool

**AC10: Multi-Instance Usage Patterns**
- [ ] **Default Instance:**
  ```
  User: "List workflows"
  Claude: Uses list_workflows() → default instance from .config.json
  ```
- [ ] **Specific Instance:**
  ```
  User: "List workflows in staging"
  Claude: Uses list_workflows({ instance: "staging" })
  ```
- [ ] **Instance Discovery:**
  ```
  User: "What n8n instances are available?"
  Claude: Reads .config.json environments
  Response: "Available instances: production (default), staging, development"
  ```
- [ ] **Cross-Instance Operations:**
  ```
  User: "Copy workflow 123 from production to staging"
  Claude:
    1. get_workflow({ id: "123", instance: "production" })
    2. create_workflow({ ...workflow_data, instance: "staging" })
  ```

**AC11: Error Handling Reference**
- [ ] Common errors documented:
  - **404 Not Found:** Workflow ID doesn't exist
  - **401 Unauthorized:** Invalid API key
  - **409 Conflict:** Workflow name already exists (create)
  - **400 Bad Request:** Invalid parameters
  - **422 Unprocessable:** Invalid workflow structure
- [ ] Error response format:
  ```typescript
  {
    error: string;           // Error message
    code?: number;           // HTTP status code
    details?: object;        // Additional error details
  }
  ```
- [ ] Link to Epic 4 Story 4.6 (Error Handling) for comprehensive guide

**AC12: Best Practices Summary**
- [ ] **Performance:**
  - Use list_workflows for overview (not get_workflow in loop)
  - Filter workflows with parameters (active, tags)
  - Use pagination for large datasets
- [ ] **Safety:**
  - Always confirm before delete operations
  - Deactivate before deleting active workflows
  - Test workflows in non-production instances first
- [ ] **Workflow Management:**
  - Use tags for organization
  - Follow naming conventions
  - Document workflow purpose in n8n UI
  - Regular cleanup of unused workflows
- [ ] **Multi-Instance:**
  - Clearly identify which instance you're working with
  - Use instance parameter explicitly for clarity
  - Keep instance configurations in .config.json

---

## Technical Implementation Notes

### Documentation Structure

```markdown
# Workflows Management Tools Reference

## Overview

### Tools Summary
- Table of 8 tools
- Categories
- Quick reference

## Tool Specifications

### list_workflows
- Purpose
- Parameters
- Response format
- Examples
- Performance notes

### get_workflow
- Purpose
- Parameters
- Response format
- Examples
- Use cases

### create_workflow
- Purpose
- Parameters
- Response format
- Examples
- Validation

### update_workflow
- Purpose
- Parameters
- Response format
- Examples
- Best practices

### delete_workflow
- Purpose
- Parameters
- Response format
- Examples
- Safety warnings

### activate_workflow
- Purpose
- Parameters
- Response format
- Examples
- Trigger requirements

### deactivate_workflow
- Purpose
- Parameters
- Response format
- Examples
- Use cases

### execute_workflow
- Purpose
- API limitation
- Guidance message
- Alternatives

## Multi-Instance Usage

### Default Instance
### Specific Instance
### Cross-Instance Operations

## Error Handling

### Common Errors
### Error Formats
### Troubleshooting

## Best Practices

### Performance
### Safety
### Workflow Management
### Multi-Instance

## Related Documentation
- Epic 7: API Coverage
- Epic 6: Workflow Templates
- Story 4.6: Error Handling
```

### Content Sources

**Primary References:**
- `/src/index.ts` - tool implementations (lines 1-800)
- `/src/services/n8nApiWrapper.ts` - API methods
- `/src/services/workflowBuilder.ts` - workflow construction
- `/src/utils/validation.ts` - format transformations
- `/docs/n8n-api-docs/10-WORKFLOWS-API.md` - n8n API reference
- Epic 7 Story 7.2 - Workflows API documentation

### Code Examples

All examples tested with:
- n8n version 1.82.3
- MCP server version 0.9.1
- Claude Desktop (latest)
- Multi-instance configuration

---

## Dependencies

### Upstream Dependencies
- **Epic 3** (Installation & Quick Start) - users have MCP server configured
- **Epic 5** (Multi-Instance Architecture) - instance parameter functionality
- **Epic 1** (URL Configuration) - automatic /api/v1 appending
- **Epic 2** (API Validation) - 100% workflows API coverage

### Downstream Dependencies
- **Story 4.6** (Error Handling) - references this for workflow errors
- **Epic 6** (Workflow Templates) - uses these tools
- **Epic 8** (Troubleshooting) - references for debugging

### Related Stories
- **Story 4.2** (Executions Tools) - view workflow execution results
- **Story 4.3** (Tags Tools) - organize workflows with tags
- **Epic 7 Story 7.2** (Workflows API) - underlying API documentation

---

## Definition of Done

### Content Checklist
- [ ] All 8 tools documented with complete specifications
- [ ] Input/output formats with TypeScript interfaces
- [ ] 30+ Claude Desktop conversation examples
- [ ] Multi-instance usage patterns documented
- [ ] Error handling reference complete
- [ ] Best practices summary included
- [ ] Cross-references to related documentation

### Quality Checklist
- [ ] All examples tested in Claude Desktop
- [ ] Multi-instance scenarios validated
- [ ] Error cases tested and documented
- [ ] TypeScript interfaces accurate
- [ ] Performance notes verified
- [ ] Safety warnings reviewed
- [ ] Markdown formatting validated

### Review Checklist
- [ ] Technical accuracy by Dev Agent
- [ ] Beginner clarity by Mentor Persona
- [ ] Security review by Security Agent
- [ ] QA validation of examples

---

## Estimation

**Effort:** 8 story points (6-7 hours)

**Breakdown:**
- Overview and summary: 45 minutes
- list_workflows & get_workflow: 60 minutes
- create_workflow & update_workflow: 90 minutes
- delete_workflow & activation tools: 60 minutes
- execute_workflow (API limitation): 30 minutes
- Multi-instance patterns: 45 minutes
- Error handling & best practices: 60 minutes
- Examples testing: 90 minutes

**Page Count:** 15-18 pages

---

## Notes

### Tool Usage Statistics (Expected)
Most frequently used:
1. list_workflows (discovery)
2. get_workflow (inspection)
3. activate_workflow / deactivate_workflow (lifecycle)
4. create_workflow (from prompts)
5. update_workflow (modifications)

Least used:
- delete_workflow (safety concerns)
- execute_workflow (API limitation)

### Key Differentiators from n8n API
- Automatic connection format transformation
- Multi-instance routing
- Performance optimization (list_workflows)
- Helpful execute_workflow guidance (not error)
- Automatic trigger node handling

---

**Story Owner:** Technical Writer (Scribe Persona) + Dev Agent
**Reviewers:** Dev Agent, QA Agent, Mentor Persona
**Target Milestone:** Epic 4 - Phase 1 (Stories 4.1-4.3)
