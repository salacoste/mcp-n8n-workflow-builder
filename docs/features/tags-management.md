# Tags Management Tools

Reference for tag management tools to organize and categorize workflows.

---

## Overview

Tags help organize workflows into logical groups (production, development, testing, etc.). The MCP server provides 5 tag management tools.

### Tools Summary

| Tool | Purpose | n8n API |
|------|---------|---------|
| `list_tags` / `get_tags` | List all tags | `GET /tags` |
| `get_tag` | Get specific tag details | `GET /tags/{id}` |
| `create_tag` | Create new tag | `POST /tags` |
| `update_tag` | Modify tag name | `PUT /tags/{id}` |
| `delete_tag` | Remove tag | `DELETE /tags/{id}` |

---

## list_tags / get_tags

Retrieve all available tags.

### Input Parameters

```typescript
{
  instance?: string;       // n8n instance (optional)
}
```

### Output Format

```typescript
{
  tags: Array<{
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  }>;
}
```

### Usage Example

**Request:** `List all tags`

**Response:**
```
Available Tags:

1. production (ID: 1)
   - Created: 2025-12-01

2. development (ID: 2)
   - Created: 2025-12-01

3. testing (ID: 3)
   - Created: 2025-12-15
```

---

## create_tag

Create a new tag for organizing workflows.

### Input Parameters

```typescript
{
  name: string;            // Tag name (required)
  instance?: string;       // n8n instance (optional)
}
```

### Usage Example

**Request:** `Create tag "production"`

**Response:**
```
✅ Successfully created tag!

Tag Details:
- ID: 123
- Name: production
- Created: 2025-12-27

Use this tag to organize workflows.
```

---

## update_tag

Rename an existing tag.

### Input Parameters

```typescript
{
  id: string;              // Tag ID (required)
  name: string;            // New name (required)
  instance?: string;       // n8n instance (optional)
}
```

### Known Issue

!!! warning "API Limitation"
    n8n API v1.82.3 may return 409 Conflict when updating tag names.
    Workaround: Delete old tag and create new one if update fails.

---

## delete_tag

Remove a tag. Does not delete workflows, only removes tag association.

### Input Parameters

```typescript
{
  id: string;              // Tag ID (required)
  instance?: string;       // n8n instance (optional)
}
```

### Usage Example

**Request:** `Delete tag "old-tag"`

**Response:**
```
✅ Successfully deleted tag "old-tag" (ID: 99)

Note: Workflows previously tagged are unchanged,
only the tag association has been removed.
```

---

## Tagging Workflows

Tags are assigned when creating or updating workflows:

```typescript
// When creating workflow
create_workflow({
  name: "My Workflow",
  nodes: [...],
  tags: ["tag_id_1", "tag_id_2"]
})

// When updating workflow
update_workflow({
  id: "workflow_id",
  tags: ["tag_id_3"]  // Replaces all tags
})
```

### Common Tagging Patterns

**Environment Tags:**
- `production` - Live workflows
- `staging` - Testing environment
- `development` - Development workflows

**Category Tags:**
- `alerts` - Notification workflows
- `backups` - Backup automation
- `integrations` - External service integrations
- `reports` - Reporting workflows

**Status Tags:**
- `active` - Currently in use
- `deprecated` - To be removed
- `experimental` - Testing new features

---

## Next Steps

- [Workflows Management](workflows-management.md)
- [Examples](../examples/workflows/basic-patterns.md)
