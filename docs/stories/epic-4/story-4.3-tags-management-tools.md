# Story 4.3: Tags Management Tools Reference

**Epic:** Epic 4 - Core Features & MCP Tools Reference
**Story ID:** STORY-4.3
**Status:** Draft
**Created:** 2025-12-27
**Updated:** 2025-12-27

---

## User Story

**As a** user organizing n8n workflows with tags
**I want** comprehensive reference documentation for all 5 tag management tools
**So that** I can create, organize, update, and maintain workflow categorization

---

## Story Description

### Current System Context

The MCP server provides **5 tag management tools** for workflow organization:

1. **create_tag** - Create new tag for workflow categorization
2. **get_tags** / **get_tag** - List all tags or retrieve specific tag details
3. **update_tag** - Modify existing tag (rename)
4. **delete_tag** - Remove tag (doesn't delete tagged workflows)

**API Coverage (Epic 2):**
- 5/5 tag methods fully implemented (100% coverage)
- Full CRUD operations support
- Pagination support for large tag lists

**Tag Object Structure:**
```typescript
{
  id: string;               // Unique tag ID
  name: string;             // Tag name (unique)
  createdAt: string;        // ISO 8601 timestamp
  updatedAt: string;        // ISO 8601 timestamp
}
```

**Tag Usage in Workflows:**
- Workflows can have multiple tags (array of tag IDs)
- Tags used for filtering in list_workflows
- Tags visible in n8n UI for organization
- Tag deletion removes tag from all workflows

**Known Issue (Epic 2 Testing):**
- Tag update returns 409 Conflict in some cases
- Workaround: Use unique tag names (UUID suffix for testing)

### Enhancement: Comprehensive Tags Tools Documentation

Create detailed reference covering:

**Tool Specifications:**
- Complete parameter descriptions
- Response formats and schemas
- Tag naming conventions
- Usage patterns and best practices

**Workflow Organization:**
- Tagging strategies (environment, department, priority, type)
- Multi-tag workflows
- Tag-based filtering
- Tag hierarchies and conventions

**Tag Lifecycle Management:**
- Creating standard tags
- Updating tag names
- Deleting unused tags
- Tag auditing and cleanup

**Integration with Workflows:**
- Assigning tags during workflow creation
- Adding tags to existing workflows
- Filtering workflows by tags
- Bulk tagging operations

---

## Acceptance Criteria

### Documentation Requirements

**AC1: Tools Overview**
- [ ] Summary table:
  | Tool | Purpose | Creates | Modifies | Deletes | n8n API |
  |------|---------|---------|----------|---------|---------|
  | create_tag | Create new tag | ✅ | ❌ | ❌ | POST /tags |
  | get_tags | List all tags | ❌ | ❌ | ❌ | GET /tags |
  | get_tag | Get specific tag | ❌ | ❌ | ❌ | GET /tags/{id} |
  | update_tag | Rename tag | ❌ | ✅ | ❌ | PUT /tags/{id} |
  | delete_tag | Remove tag | ❌ | ❌ | ✅ | DELETE /tags/{id} |

- [ ] Tool categories:
  - **Creation:** create_tag
  - **Query:** get_tags, get_tag
  - **Modification:** update_tag
  - **Deletion:** delete_tag

**AC2: create_tag Tool Documentation**
- [ ] **Purpose:** Create new tag for workflow organization
- [ ] **Input Parameters:**
  ```typescript
  {
    name: string;            // Tag name (required, must be unique)
    instance?: string;       // n8n instance identifier (optional)
  }
  ```
- [ ] **Output Format:**
  ```typescript
  {
    id: string;              // Generated tag ID
    name: string;            // Tag name as provided
    createdAt: string;       // ISO 8601 creation timestamp
    updatedAt: string;       // ISO 8601 update timestamp
  }
  ```
- [ ] **Claude Desktop Examples:**
  ```
  Example 1 - Create single tag:
  User: "Create a tag called 'Production'"
  Claude: Uses create_tag({ name: "Production" })
  Response: Tag created with ID "10"

  Example 2 - Create multiple tags:
  User: "Create tags: Staging, Development, Testing"
  Claude:
    1. create_tag({ name: "Staging" })
    2. create_tag({ name: "Development" })
    3. create_tag({ name: "Testing" })
  Response: All tags created with IDs

  Example 3 - Create tag for workflow:
  User: "Create 'Critical' tag and apply it to workflow 123"
  Claude:
    1. create_tag({ name: "Critical" })
    2. update_workflow({ id: "123", tags: [critical_tag_id] })

  Example 4 - Multi-instance:
  User: "Create 'Production' tag in staging environment"
  Claude: Uses create_tag({ name: "Production", instance: "staging" })
  ```
- [ ] **Tag Naming Conventions:**
  - Use descriptive names (avoid "tag1", "tag2")
  - Follow consistent style (Title Case recommended)
  - Categories: Environment, Department, Priority, Type
  - Examples: "Production", "Marketing Team", "High Priority", "Data Integration"
- [ ] **Common Issues:**
  - **409 Conflict:** Tag name already exists → use different name
  - **400 Bad Request:** Empty tag name → provide non-empty name
  - Case sensitivity: "Production" ≠ "production"

**AC3: get_tags Tool Documentation**
- [ ] **Purpose:** Retrieve list of all tags with pagination support
- [ ] **Input Parameters:**
  ```typescript
  {
    limit?: number;          // Max results (default: 100, max: 250)
    cursor?: string;         // Pagination cursor
    instance?: string;       // n8n instance identifier (optional)
  }
  ```
- [ ] **Output Format:**
  ```typescript
  {
    data: Array<{
      id: string;
      name: string;
      createdAt: string;
      updatedAt: string;
    }>;
    nextCursor?: string;     // Present if more results available
  }
  ```
- [ ] **Claude Desktop Examples:**
  ```
  Example 1 - List all tags:
  User: "Show me all my tags"
  Claude: Uses get_tags()
  Response: Array of all tags

  Example 2 - Find tag by name:
  User: "Find the 'Production' tag"
  Claude:
    1. get_tags()
    2. Filters by name matching "Production"
    3. Returns tag ID and details

  Example 3 - Tag inventory:
  User: "How many tags do I have?"
  Claude:
    1. get_tags()
    2. Counts total tags
    3. Groups by category (if pattern detected)

  Example 4 - Pagination:
  User: "Show all tags (I have 300+)"
  Claude:
    1. get_tags({ limit: 100 })
    2. Continues with cursor until all retrieved
  ```

**AC4: get_tag Tool Documentation**
- [ ] **Purpose:** Get details for specific tag by ID
- [ ] **Input Parameters:**
  ```typescript
  {
    id: string;              // Tag ID (required)
    instance?: string;       // n8n instance identifier (optional)
  }
  ```
- [ ] **Output Format:** Single tag object
- [ ] **Claude Desktop Examples:**
  ```
  Example 1 - Get tag by ID:
  User: "Get details for tag ID 10"
  Claude: Uses get_tag({ id: "10" })

  Example 2 - Verify tag exists:
  User: "Does tag 'Marketing' exist?"
  Claude:
    1. get_tags() → search by name
    2. If found: get_tag({ id: found_id })
    3. Response: "Yes, tag exists with ID X"
  ```
- [ ] **Use Cases:**
  - Verify tag exists before assignment
  - Check tag details
  - Validation in automated workflows

**AC5: update_tag Tool Documentation**
- [ ] **Purpose:** Rename existing tag (updates all tagged workflows)
- [ ] **Input Parameters:**
  ```typescript
  {
    id: string;              // Tag ID (required)
    name: string;            // New tag name (required)
    instance?: string;       // n8n instance identifier (optional)
  }
  ```
- [ ] **Output Format:** Updated tag object
- [ ] **Claude Desktop Examples:**
  ```
  Example 1 - Rename tag:
  User: "Rename tag 'Prod' to 'Production'"
  Claude:
    1. get_tags() → find "Prod" tag ID
    2. update_tag({ id: found_id, name: "Production" })

  Example 2 - Standardize tag names:
  User: "Rename all environment tags to Title Case"
  Claude:
    1. get_tags()
    2. Identifies environment tags
    3. update_tag for each with standardized name

  Example 3 - Multi-instance:
  User: "Rename tag 15 to 'Critical' in staging"
  Claude: Uses update_tag({ id: "15", name: "Critical", instance: "staging" })
  ```
- [ ] **Known Issue Warning:**
  - Tag update may return 409 Conflict
  - n8n API limitation (documented in Epic 2)
  - Workaround: Delete old tag, create new tag, reassign workflows
- [ ] **Impact on Workflows:**
  - All workflows with this tag automatically updated
  - No workflow disruption
  - Changes reflected in n8n UI immediately

**AC6: delete_tag Tool Documentation**
- [ ] **Purpose:** Remove tag from system (removes from all workflows)
- [ ] **Input Parameters:**
  ```typescript
  {
    id: string;              // Tag ID (required)
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
  Example 1 - Delete tag:
  User: "Delete tag 'Old Project'"
  Claude:
    1. get_tags() → find tag ID
    2. Shows workflows using this tag
    3. Asks confirmation
    4. delete_tag({ id: found_id })

  Example 2 - Cleanup unused tags:
  User: "Delete all unused tags"
  Claude:
    1. get_tags()
    2. list_workflows() for each tag
    3. Identifies tags with 0 workflows
    4. Asks confirmation
    5. delete_tag for each unused

  Example 3 - Safe deletion with check:
  User: "Delete tag 20"
  Claude:
    1. get_tag({ id: "20" })
    2. list_workflows({ tags: ["20"] })
    3. Shows: "Tag 'X' used in Y workflows"
    4. Confirms: "Delete tag from all workflows?"
    5. delete_tag({ id: "20" }) if confirmed
  ```
- [ ] **Safety Warnings:**
  - ⚠️ **NON-DESTRUCTIVE:** Tag deleted but workflows remain
  - Tag automatically removed from all workflows
  - Cannot be undone (recreate tag if needed)
  - Consider rename instead of delete
- [ ] **Impact:**
  - Workflows lose this tag
  - Filtering by this tag won't work
  - No workflow functionality affected

**AC7: Workflow Tagging Patterns**
- [ ] **Standard Tag Taxonomy:**
  ```markdown
  ### Environment Tags
  - Production
  - Staging
  - Development
  - Testing

  ### Department Tags
  - Marketing
  - Sales
  - Engineering
  - Customer Support
  - Finance

  ### Priority Tags
  - Critical
  - High Priority
  - Medium Priority
  - Low Priority

  ### Type Tags
  - Data Integration
  - Email Automation
  - Reporting
  - Notification
  - API Polling
  - Data Transformation
  ```
- [ ] **Multi-Tag Strategy:**
  ```
  Example workflow tags:
  - "Customer Onboarding" → [Production, Marketing, Automation]
  - "Daily Sales Report" → [Production, Sales, Reporting, High Priority]
  - "Test Data Sync" → [Development, Engineering, Data Integration]
  ```
- [ ] **Tag Filtering:**
  ```
  User: "Show all production marketing workflows"
  Claude:
    1. get_tags() → find "Production" and "Marketing" IDs
    2. list_workflows({ tags: [prod_id, marketing_id] })
    Note: n8n filters workflows with ALL specified tags (AND logic)
  ```

**AC8: Tag Maintenance Workflows**
- [ ] **Setup Standard Tags:**
  ```
  User: "Set up standard organizational tags"
  Claude:
    1. create_tag for each standard tag
    2. Returns mapping of names to IDs
    3. Suggests: "Use these IDs when tagging workflows"
  ```
- [ ] **Audit Tags:**
  ```
  User: "Audit tag usage"
  Claude:
    1. get_tags()
    2. For each tag: list_workflows({ tags: [tag_id] })
    3. Reports:
       - Total tags
       - Tags by usage count
       - Unused tags
       - Workflows without tags
  ```
- [ ] **Cleanup Unused:**
  ```
  User: "Clean up unused tags"
  Claude:
    1. Audit process (above)
    2. Identifies unused tags
    3. Shows list
    4. Asks confirmation
    5. delete_tag for each unused
  ```
- [ ] **Standardize Names:**
  ```
  User: "Standardize all tag names to Title Case"
  Claude:
    1. get_tags()
    2. Identifies non-standard names
    3. Shows proposed changes
    4. update_tag for each (if approved)
  ```

**AC9: Integration with Workflow Tools**
- [ ] **Tagging During Creation:**
  ```
  User: "Create 'Email Campaign' workflow tagged Production and Marketing"
  Claude:
    1. get_tags() → find tag IDs
    2. create_workflow({
         name: "Email Campaign",
         tags: [prod_id, marketing_id]
       })
  ```
- [ ] **Adding Tags to Existing:**
  ```
  User: "Add 'Critical' tag to workflow 123"
  Claude:
    1. get_workflow({ id: "123" }) → get current tags
    2. get_tags() → find "Critical" tag ID
    3. update_workflow({ id: "123", tags: [...existing, critical_id] })
  ```
- [ ] **Removing Tags from Workflow:**
  ```
  User: "Remove 'Testing' tag from workflow 456"
  Claude:
    1. get_workflow({ id: "456" }) → get current tags
    2. Filter out testing tag ID
    3. update_workflow({ id: "456", tags: filtered_tags })
  ```

**AC10: Multi-Instance Tag Management**
- [ ] **Instance-Specific Tags:**
  ```
  User: "Create 'Production' tag in each environment"
  Claude:
    1. create_tag({ name: "Production-Prod", instance: "production" })
    2. create_tag({ name: "Production-Stage", instance: "staging" })
    3. create_tag({ name: "Production-Dev", instance: "development" })
  ```
- [ ] **Cross-Instance Tag Strategy:**
  - Tags are instance-specific (not shared)
  - Use consistent naming across instances
  - Document which tags exist in which instances

**AC11: Error Handling**
- [ ] Common errors:
  - **409 Conflict:** Tag name already exists (create)
  - **409 Conflict:** New tag name exists (update)
  - **404 Not Found:** Tag ID doesn't exist
  - **400 Bad Request:** Empty tag name
  - **401 Unauthorized:** Invalid API key
- [ ] Error examples and solutions
- [ ] Link to Story 4.6 for comprehensive error handling

**AC12: Best Practices**
- [ ] **Naming Conventions:**
  - Use descriptive names
  - Follow consistent style (Title Case)
  - Avoid abbreviations unless standard
  - Group by category prefix (optional)
- [ ] **Organization Strategy:**
  - Create standard tags upfront
  - Use multiple tags per workflow
  - Regular tag audits
  - Delete unused tags
- [ ] **Workflow Tagging:**
  - Every workflow should have at least 1 tag
  - Recommended: 2-4 tags per workflow
  - Include environment tag always
  - Add department/team tag
  - Add priority tag (if applicable)
- [ ] **Maintenance:**
  - Quarterly tag audit
  - Cleanup unused tags
  - Standardize tag names
  - Document tag taxonomy

---

## Technical Implementation Notes

### Documentation Structure

```markdown
# Tags Management Tools Reference

## Overview

### Tools Summary Table
### Tool Categories
### Tag Purpose & Benefits

## Tool Specifications

### create_tag
- Purpose
- Parameters
- Response format
- Examples
- Naming conventions

### get_tags
- Purpose
- Parameters
- Response format
- Examples
- Pagination

### get_tag
- Purpose
- Parameters
- Response format
- Examples
- Use cases

### update_tag
- Purpose
- Parameters
- Response format
- Examples
- Known issues

### delete_tag
- Purpose
- Parameters
- Response format
- Examples
- Safety warnings

## Workflow Organization

### Standard Tag Taxonomy
- Environment tags
- Department tags
- Priority tags
- Type tags

### Multi-Tag Strategies
### Tag-Based Filtering
### Tag Hierarchies

## Tag Lifecycle

### Setup Standard Tags
### Audit Tag Usage
### Cleanup Unused Tags
### Standardize Names

## Integration with Workflows

### Tagging During Creation
### Adding Tags to Existing
### Removing Tags
### Bulk Tagging

## Multi-Instance Management

### Instance-Specific Tags
### Cross-Instance Strategy
### Tag Synchronization

## Usage Patterns

### Example 1: Setup Tags
### Example 2: Organize Workflows
### Example 3: Tag Audit
### Example 4: Cleanup

## Error Handling

### Common Errors
### Solutions
### Known Issues

## Best Practices

### Naming Conventions
### Organization Strategy
### Workflow Tagging
### Maintenance Schedule

## Related Documentation
- Story 4.1: Workflows Tools
- Epic 7 Story 7.5: Tags API
- Story 4.6: Error Handling
```

### Content Sources

**Primary References:**
- `/src/index.ts` - tag tool implementations
- `/src/services/n8nApiWrapper.ts` - tags API methods
- `/docs/n8n-api-docs/40-TAGS-API.md` - n8n API reference
- Epic 7 Story 7.5 - Tags API documentation
- `/test-mcp-tools.js` - tag testing patterns
- Epic 2 documentation - known tag update issue

---

## Dependencies

### Upstream Dependencies
- **Story 4.1** (Workflows Tools) - tags are assigned to workflows
- **Epic 3** (Installation & Quick Start) - MCP server configured

### Downstream Dependencies
- **Story 4.6** (Error Handling) - references tag errors
- **Epic 8 Story 8.1** (Common Issues) - tag-related troubleshooting

### Related Stories
- **Epic 7 Story 7.5** (Tags API) - underlying API documentation
- **Epic 5** (Multi-Instance) - instance-specific tag management

---

## Definition of Done

### Content Checklist
- [ ] All 5 tools documented with complete specifications
- [ ] Input/output formats with TypeScript interfaces
- [ ] 20+ Claude Desktop conversation examples
- [ ] Standard tag taxonomy documented
- [ ] Tag lifecycle workflows included
- [ ] Multi-instance patterns documented
- [ ] Error handling reference complete
- [ ] Best practices comprehensive

### Quality Checklist
- [ ] All examples tested in Claude Desktop
- [ ] Tag naming conventions validated
- [ ] Multi-instance scenarios tested
- [ ] Error cases documented
- [ ] TypeScript interfaces accurate
- [ ] Markdown formatting validated

### Review Checklist
- [ ] Technical accuracy by Dev Agent
- [ ] Organization strategy by Architect Agent
- [ ] QA validation of examples

---

## Estimation

**Effort:** 5 story points (3-4 hours)

**Breakdown:**
- Tools overview: 30 minutes
- create_tag & get_tags documentation: 60 minutes
- get_tag & update_tag documentation: 45 minutes
- delete_tag documentation: 45 minutes
- Tag taxonomy and strategies: 45 minutes
- Usage patterns and examples: 45 minutes
- Testing and validation: 30 minutes

**Page Count:** 10-12 pages

---

## Notes

### Tag Management Philosophy
- Tags are organizational metadata
- Non-destructive (deleting tag doesn't delete workflows)
- Flexible and user-defined
- Critical for large workflow collections
- Foundation for workflow governance

### Recommended Tag Sets by Use Case

**Small Teams (1-20 workflows):**
- Environment: Production, Development
- Priority: Critical, Normal

**Medium Teams (20-100 workflows):**
- Environment: Production, Staging, Development
- Department: Marketing, Sales, Engineering
- Priority: Critical, High, Medium, Low

**Large Teams (100+ workflows):**
- Full taxonomy (Environment + Department + Priority + Type)
- Team-specific tags
- Project-based tags
- Custom business tags

---

**Story Owner:** Technical Writer (Scribe Persona)
**Reviewers:** Dev Agent, QA Agent, Architect Agent
**Target Milestone:** Epic 4 - Phase 1 (Stories 4.1-4.3)
