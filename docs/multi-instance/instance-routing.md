# Instance Routing

How MCP tools route requests to the correct n8n environment.

---

## Routing Mechanism

### Parameter-Based Routing

All MCP tools accept optional `instance` parameter:

```typescript
{
  name: "list_workflows",
  inputSchema: {
    properties: {
      instance: {
        type: "string",
        description: "Instance identifier (optional)"
      },
      // ... other parameters
    }
  }
}
```

### Routing Logic

```
1. Tool invoked with parameters
   ↓
2. Extract instance parameter (if present)
   ↓
3. If instance provided → Use that instance
   If not provided → Use defaultEnv
   ↓
4. EnvironmentManager.getApiWrapper(instance)
   ↓
5. Execute API call on selected instance
   ↓
6. Return results
```

---

## Usage Patterns

### Explicit Instance Selection

**Claude Desktop:**
```
List workflows from production
→ instance: "production"

Show staging executions
→ instance: "staging"

Create workflow in development
→ instance: "development"
```

### Default Instance

**Claude Desktop:**
```
List workflows
→ instance: undefined
→ Uses defaultEnv from .config.json
```

### Instance Context

Claude remembers instance context:

```
User: "List workflows in production"
Claude: [Uses instance: "production"]

User: "Activate workflow 5"
Claude: [Uses instance: "production" from context]

User: "Now list development workflows"
Claude: [Switches to instance: "development"]
```

---

## Multi-Instance Tool Examples

### Workflow Operations

```typescript
// Production
list_workflows({ instance: "production" })
create_workflow({ name: "...", instance: "production" })
activate_workflow({ id: "5", instance: "production" })

// Staging
list_workflows({ instance: "staging" })
get_workflow({ id: "10", instance: "staging" })

// Development (default)
list_workflows()  // Uses defaultEnv
```

### Cross-Instance Operations

**Clone workflow across instances:**

```
1. Get workflow from staging
   → get_workflow({ id: "15", instance: "staging" })

2. Create in production
   → create_workflow({
       name: workflow.name,
       nodes: workflow.nodes,
       connections: workflow.connections,
       instance: "production"
     })
```

**Compare executions:**

```
1. Get production executions
   → list_executions({ instance: "production" })

2. Get staging executions
   → list_executions({ instance: "staging" })

3. Compare success rates
```

---

## Routing Table

### Tool-to-Instance Mapping

| Tool | Instance Param | Default Behavior |
|------|---------------|------------------|
| `list_workflows` | ✅ Supported | Uses defaultEnv |
| `create_workflow` | ✅ Supported | Uses defaultEnv |
| `list_executions` | ✅ Supported | Uses defaultEnv |
| `create_tag` | ✅ Supported | Uses defaultEnv |
| All 17 tools | ✅ Supported | Uses defaultEnv |

**100% Coverage:** All tools support multi-instance routing

---

## Error Handling

### Invalid Instance

```
Request: list_workflows({ instance: "nonexistent" })

Response:
Error: Instance 'nonexistent' not found

Available instances:
- production
- staging
- development

Please use one of the available instance names.
```

### Connection Failure

```
Request: list_workflows({ instance: "production" })

Response:
Error: Failed to connect to instance 'production'
URL: https://prod.n8n.example.com/api/v1
Cause: ECONNREFUSED

Suggestions:
1. Verify n8n is running at production URL
2. Check firewall/network settings
3. Test connectivity: curl https://prod.n8n.example.com
```

---

## Performance Optimization

### Connection Pooling

```
Request 1 (production): 300ms (create + call)
Request 2 (production): 200ms (cached + call)
Request 3 (staging):    300ms (create + call)
Request 4 (production): 200ms (cached + call)
Request 5 (staging):    200ms (cached + call)
```

### Lazy Loading

Only creates connections when needed:

```
Config has 5 instances
→ EnvironmentManager loads config only

User requests from "production"
→ Creates production wrapper

User requests from "staging"
→ Creates staging wrapper

// Only 2 wrappers created (not all 5)
// Memory saved: ~60%
```

---

## Next Steps

- [Configuration](configuration.md) - Setup guide
- [Testing](testing.md) - Validate routing
- [Examples](examples.md) - Real-world usage
- [API Reference](../api/overview.md) - Technical specs

---

!!! info "Implementation"
    Routing implementation: `src/services/environmentManager.ts:45`
