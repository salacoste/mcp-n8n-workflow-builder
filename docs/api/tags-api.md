# Tags API Reference

Complete API reference for tag management operations. Organize workflows with tags for better categorization and filtering.

---

## Overview

The Tags API provides programmatic access to create and manage workflow tags for organization and filtering.

**Available Operations:**

| Operation | Purpose | Common Use Cases |
|-----------|---------|------------------|
| `create_tag` | Create new tag | Tag taxonomy setup, organization |
| `get_tags` | List all tags | Tag discovery, inventory |
| `get_tag` | Get specific tag | Tag details, validation |
| `update_tag` | Rename tag | Tag maintenance, corrections |
| `delete_tag` | Remove tag | Cleanup, reorganization |

**Use Cases:**

- Workflow categorization by environment (production, staging, development)
- Department organization (marketing, sales, engineering)
- Priority classification (critical, high, medium, low)
- Type categorization (integration, automation, reporting)

---

## create_tag

Create a new workflow tag for organizational purposes.

### Purpose

Create tags to categorize and filter workflows. Tags enable better organization and discovery of workflows across instances.

### Use Cases

- Setting up tag taxonomy for new instance
- Creating environment tags (production, staging, etc.)
- Adding department or team tags
- Creating priority or type classification tags

---

### Request

**MCP Tool Name:** `create_tag`

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| instance | string | No | Instance identifier |
| name | string | Yes | Tag name (unique per instance recommended) |

**TypeScript Interface:**

```typescript
interface CreateTagParams {
  instance?: string;
  name: string;
}
```

**JSON-RPC Request:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "create_tag",
    "arguments": {
      "instance": "production",
      "name": "production"
    }
  }
}
```

---

### Response

**Success Response:**

```typescript
interface Tag {
  id: string;
  name: string;
  createdAt: string;  // ISO 8601 timestamp
  updatedAt: string;  // ISO 8601 timestamp
}
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
  \"id\": \"tag_123\",
  \"name\": \"production\",
  \"createdAt\": \"2025-01-15T10:00:00Z\",
  \"updatedAt\": \"2025-01-15T10:00:00Z\"
}"
    }]
  }
}
```

---

### Code Examples

**TypeScript:**

```typescript
// Create environment tags
const tags = ['production', 'staging', 'development'];

for (const tagName of tags) {
  const response = await callTool('create_tag', {
    instance: 'production',
    name: tagName
  });

  const tag = JSON.parse(response.content[0].text);
  console.log(`Created tag: ${tag.name} (ID: ${tag.id})`);
}
```

**Python:**

```python
def create_tag(name, instance=None):
    request = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "tools/call",
        "params": {
            "name": "create_tag",
            "arguments": {
                "instance": instance,
                "name": name
            }
        }
    }

    result = subprocess.run(
        ['npx', '@kernel.salacoste/n8n-workflow-builder'],
        input=json.dumps(request),
        capture_output=True,
        text=True
    )

    response = json.loads(result.stdout)
    return json.loads(response['result']['content'][0]['text'])

# Create department tags
for dept in ['marketing', 'sales', 'engineering']:
    tag = create_tag(dept, instance='production')
    print(f"Created: {tag['name']}")
```

---

## get_tags

List all tags in an instance with optional filtering.

### Request

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| instance | string | No | Instance identifier |
| limit | number | No | Max tags to return |
| cursor | string | No | Pagination cursor |

**TypeScript Interface:**

```typescript
interface GetTagsParams {
  instance?: string;
  limit?: number;
  cursor?: string;
}
```

---

### Response

```typescript
interface TagListResponse {
  data: Tag[];
  nextCursor?: string;
}
```

**JSON Example:**

```json
{
  "data": [
    {
      "id": "tag_1",
      "name": "production",
      "createdAt": "2025-01-10T10:00:00Z",
      "updatedAt": "2025-01-10T10:00:00Z"
    },
    {
      "id": "tag_2",
      "name": "staging",
      "createdAt": "2025-01-10T10:01:00Z",
      "updatedAt": "2025-01-10T10:01:00Z"
    },
    {
      "id": "tag_3",
      "name": "marketing",
      "createdAt": "2025-01-10T10:02:00Z",
      "updatedAt": "2025-01-10T10:02:00Z"
    }
  ]
}
```

---

### Code Example

```typescript
// Get all tags
const response = await callTool('get_tags', {
  instance: 'production'
});

const result = JSON.parse(response.content[0].text);

console.log(`Total tags: ${result.data.length}`);
result.data.forEach(tag => {
  console.log(`  - ${tag.name} (${tag.id})`);
});
```

---

## get_tag

Get details for a specific tag by ID.

### Request

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| instance | string | No | Instance identifier |
| id | string | Yes | Tag ID |

**TypeScript Interface:**

```typescript
interface GetTagParams {
  instance?: string;
  id: string;
}
```

---

### Response

Returns complete `Tag` object.

### Code Example

```typescript
const response = await callTool('get_tag', {
  instance: 'production',
  id: 'tag_123'
});

const tag = JSON.parse(response.content[0].text);
console.log(`Tag: ${tag.name}`);
console.log(`Created: ${tag.createdAt}`);
```

---

## update_tag

Rename an existing tag.

### Known Issue (Epic 2)

Tag updates may return **409 Conflict** errors in some scenarios.

**Workaround:** Use DELETE + CREATE pattern if update fails.

---

### Request

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| instance | string | No | Instance identifier |
| id | string | Yes | Tag ID to update |
| name | string | Yes | New tag name |

**TypeScript Interface:**

```typescript
interface UpdateTagParams {
  instance?: string;
  id: string;
  name: string;
}
```

---

### Code Example with Fallback

```typescript
async function safeUpdateTag(
  tagId: string,
  newName: string,
  instance?: string
): Promise<Tag> {
  try {
    // Try direct update
    const response = await callTool('update_tag', {
      instance,
      id: tagId,
      name: newName
    });

    return JSON.parse(response.content[0].text);

  } catch (error) {
    // If 409 Conflict, use DELETE + CREATE pattern
    if (error.message?.includes('409') || error.message?.includes('Conflict')) {
      console.log('Update failed with 409, using DELETE + CREATE pattern...');

      // Delete old tag
      await callTool('delete_tag', {
        instance,
        id: tagId
      });

      // Create new tag with new name
      const createResponse = await callTool('create_tag', {
        instance,
        name: newName
      });

      const newTag = JSON.parse(createResponse.content[0].text);
      console.log(`Tag recreated: ${tagId} → ${newTag.id}`);

      return newTag;
    }

    throw error;
  }
}

// Usage
const updated = await safeUpdateTag('tag_123', 'new-name', 'production');
console.log(`Tag updated: ${updated.name}`);
```

---

## delete_tag

Remove a tag permanently. This does not affect workflows, only removes the tag from the system.

### Request

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| instance | string | No | Instance identifier |
| id | string | Yes | Tag ID to delete |

**TypeScript Interface:**

```typescript
interface DeleteTagParams {
  instance?: string;
  id: string;
}
```

---

### Code Example

```typescript
await callTool('delete_tag', {
  instance: 'staging',
  id: 'tag_test123'
});

console.log('Tag deleted successfully');
```

**Note:** Deleting a tag does NOT delete workflows tagged with it. Workflows will remain but lose the tag association.

---

## Tag Taxonomy Examples

### Environment Tags

```typescript
const environmentTags = [
  'production',
  'staging',
  'development',
  'testing',
  'demo'
];

for (const tag of environmentTags) {
  await callTool('create_tag', {
    instance: 'production',
    name: tag
  });
}
```

### Department Tags

```typescript
const departmentTags = [
  'marketing',
  'sales',
  'engineering',
  'operations',
  'customer-success',
  'finance'
];

for (const tag of departmentTags) {
  await callTool('create_tag', {
    instance: 'production',
    name: tag
  });
}
```

### Priority Tags

```typescript
const priorityTags = [
  'critical',
  'high-priority',
  'medium-priority',
  'low-priority'
];

for (const tag of priorityTags) {
  await callTool('create_tag', {
    instance: 'production',
    name: tag
  });
}
```

### Type Tags

```typescript
const typeTags = [
  'integration',      // External service integrations
  'automation',       // Automated workflows
  'reporting',        // Data reporting workflows
  'monitoring',       // System monitoring
  'notification',     // Alert and notification workflows
  'data-sync',        // Data synchronization
  'scheduled',        // Time-based workflows
  'webhook'           // Webhook-triggered workflows
];

for (const tag of typeTags) {
  await callTool('create_tag', {
    instance: 'production',
    name: tag
  });
}
```

---

## Tag Naming Conventions

### Best Practices

**✅ Good Tag Names:**
```
production
staging
development
marketing-automation
customer-onboarding
critical-alerts
daily-reporting
```

**❌ Avoid:**
```
Prod          // Use full name
tag1          // Not descriptive
TestTag123    // Inconsistent casing
my tag        // Spaces (use hyphens or underscores)
```

### Naming Guidelines

1. **Use lowercase** for consistency
2. **Use hyphens or underscores** for multi-word tags
3. **Be descriptive** but concise
4. **Follow taxonomy** (environment, department, type, priority)
5. **Avoid special characters** except hyphens and underscores

---

## Best Practices

### 1. Establish Tag Taxonomy Early

```typescript
// Create complete tag system during setup
async function setupTagTaxonomy(instance?: string) {
  const taxonomy = {
    environments: ['production', 'staging', 'development'],
    departments: ['marketing', 'sales', 'engineering'],
    priorities: ['critical', 'high', 'medium', 'low'],
    types: ['integration', 'automation', 'reporting']
  };

  const createdTags: Record<string, string[]> = {};

  for (const [category, tags] of Object.entries(taxonomy)) {
    createdTags[category] = [];

    for (const tagName of tags) {
      const response = await callTool('create_tag', {
        instance,
        name: tagName
      });

      const tag = JSON.parse(response.content[0].text);
      createdTags[category].push(tag.id);

      console.log(`Created ${category} tag: ${tagName}`);
    }
  }

  return createdTags;
}
```

### 2. Track Tag IDs for Workflow Assignment

```typescript
// Track tags for easy reference
const tagRegistry: Record<string, string> = {};

async function createAndTrackTag(name: string, instance?: string) {
  const response = await callTool('create_tag', {
    instance,
    name
  });

  const tag = JSON.parse(response.content[0].text);
  tagRegistry[name] = tag.id;

  return tag;
}

// Later: assign tags to workflow
const workflow = await callTool('create_workflow', {
  instance: 'production',
  name: 'Email Campaign',
  tags: [
    tagRegistry['production'],
    tagRegistry['marketing']
  ],
  // ... other workflow params
});
```

### 3. Use Meaningful Tag Combinations

```typescript
// Apply multiple tags for better organization
await callTool('create_workflow', {
  name: 'Daily Sales Report',
  tags: [
    tagRegistry['production'],      // Environment
    tagRegistry['sales'],            // Department
    tagRegistry['reporting'],        // Type
    tagRegistry['high']              // Priority
  ],
  // ... other params
});
```

### 4. Regular Tag Cleanup

```typescript
async function cleanupUnusedTags(instance?: string) {
  // Get all tags
  const tagsResponse = await callTool('get_tags', { instance });
  const tags = JSON.parse(tagsResponse.content[0].text).data;

  // Get all workflows
  const workflowsResponse = await callTool('list_workflows', { instance });
  const workflows = JSON.parse(workflowsResponse.content[0].text).data;

  // Find used tag IDs
  const usedTagIds = new Set(
    workflows.flatMap(w => w.tags?.map(t => t.id) || [])
  );

  // Find unused tags
  const unusedTags = tags.filter(tag => !usedTagIds.has(tag.id));

  console.log(`Found ${unusedTags.length} unused tags`);

  // Delete unused tags (with confirmation)
  for (const tag of unusedTags) {
    console.log(`Deleting unused tag: ${tag.name}`);
    await callTool('delete_tag', {
      instance,
      id: tag.id
    });
  }
}
```

---

## Next Steps

- **[Workflows API Reference](workflows-api.md)** - Use tags when creating workflows
- **[Resources & Prompts](resources-prompts.md)** - MCP resources and workflow templates
- **[Tag Management Guide](../features/tags-management.md)** - Comprehensive tag management

---

**Document Version:** 1.0
**Last Updated:** January 2025
**Related Epic:** Epic 4 (Tags Management Tools)
