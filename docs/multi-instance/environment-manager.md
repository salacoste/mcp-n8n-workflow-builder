# Environment Manager

Technical reference for the EnvironmentManager component that powers multi-instance routing.

---

## Architecture

### Component Overview

```
EnvironmentManager (singleton)
├── ConfigLoader - Load .config.json
├── N8NApiWrapper[] - One per environment
└── Instance Cache - Connection pooling
```

### Singleton Pattern

```typescript
// Get singleton instance
const manager = EnvironmentManager.getInstance()

// Always returns same instance
const manager2 = EnvironmentManager.getInstance()
// manager === manager2 (true)
```

**Benefits:**
- Single source of truth for all environments
- Shared connection pool
- Centralized routing logic
- Memory efficient

---

## Core Functionality

### Instance Resolution

```typescript
class EnvironmentManager {
  // Get API wrapper for specific instance
  getApiWrapper(instanceSlug?: string): N8NApiWrapper {
    // 1. If no instance specified, use default
    const env = instanceSlug || this.config.defaultEnv

    // 2. Validate instance exists
    if (!this.config.environments[env]) {
      throw new Error(`Instance '${env}' not found`)
    }

    // 3. Return or create API wrapper
    return this.getOrCreateWrapper(env)
  }
}
```

### Connection Pooling

```typescript
// First call - creates wrapper
manager.getApiWrapper("production")
→ Creates new N8NApiWrapper
→ Stores in cache

// Subsequent calls - reuses wrapper
manager.getApiWrapper("production")
→ Returns cached wrapper
→ No new connection created
```

**Performance Benefits:**
- Faster subsequent requests
- Reduced memory usage
- Connection reuse
- Lower latency

---

## API Wrapper Management

### N8NApiWrapper Per Instance

Each environment gets its own API wrapper:

```typescript
{
  "production": N8NApiWrapper {
    baseUrl: "https://prod.n8n.example.com/api/v1",
    apiKey: "prod_key",
    axiosInstance: AxiosInstance
  },
  "staging": N8NApiWrapper {
    baseUrl: "https://staging.n8n.example.com/api/v1",
    apiKey: "staging_key",
    axiosInstance: AxiosInstance
  }
}
```

### Request Routing

```typescript
// User request
list_workflows({ instance: "production" })

// Environment Manager flow
1. Resolve instance: "production"
2. Get API wrapper for production
3. Execute: productionWrapper.listWorkflows()
4. Return: workflows from production
```

---

## Configuration Loading

### Load Sequence

```
1. Check for .config.json
   ↓ Found
2. Parse JSON
   ↓
3. Validate structure
   ↓
4. Create EnvironmentManager
   ↓
5. Ready for requests

1. Check for .config.json
   ↓ Not Found
2. Check for .env
   ↓ Found
3. Load as single instance
   ↓
4. Create EnvironmentManager (single)
   ↓
5. Ready for requests
```

### Validation Rules

**Required Fields:**
```typescript
// Must have
✅ environments (object)
✅ defaultEnv (string)
✅ environments[name].n8n_host (string)
✅ environments[name].n8n_api_key (string)

// Must validate
✅ defaultEnv exists in environments
✅ n8n_host is valid URL
✅ n8n_api_key is non-empty
```

---

## Error Handling

### Instance Not Found

```typescript
Error: Instance 'staging' not found
Available instances: production, development

Suggestion: Check .config.json for typo in instance name
```

### Invalid Configuration

```typescript
Error: Invalid .config.json: Missing required field 'defaultEnv'

Required structure:
{
  "environments": { ... },
  "defaultEnv": "environment-name"
}
```

### Connection Failure

```typescript
Error: Failed to connect to instance 'production'
URL: https://prod.n8n.example.com/api/v1
Status: Connection refused

Suggestions:
1. Verify n8n is running at that URL
2. Check firewall settings
3. Test with: curl https://prod.n8n.example.com
```

---

## Performance Optimization

### Connection Caching

```typescript
// First request to production
list_workflows({ instance: "production" })
→ Creates wrapper (100ms)
→ Makes API call (200ms)
→ Total: 300ms

// Second request to production
list_workflows({ instance: "production" })
→ Reuses wrapper (0ms)
→ Makes API call (200ms)
→ Total: 200ms (33% faster)
```

### Lazy Initialization

```typescript
// Wrappers created only when needed
config.json has 5 environments
→ EnvironmentManager created
→ 0 wrappers initially

First request to "production"
→ Create production wrapper

First request to "staging"
→ Create staging wrapper

// Only 2 wrappers created (not all 5)
```

---

## Implementation Details

### Source Files

**ConfigLoader:**
- File: `src/config/configLoader.ts`
- Loads and validates .config.json
- Singleton pattern
- Fallback to .env

**EnvironmentManager:**
- File: `src/services/environmentManager.ts`
- Manages API wrappers
- Instance routing
- Connection pooling

**N8NApiWrapper:**
- File: `src/services/n8nApiWrapper.ts`
- Per-instance API client
- Axios-based HTTP client
- Method implementations

---

## Advanced Usage

### Dynamic Instance Selection

Claude can intelligently select instances:

```
User: "List production workflows"
→ Extracts "production" from context
→ Uses instance: "production"

User: "Show staging executions"
→ Extracts "staging" from context
→ Uses instance: "staging"

User: "List workflows"
→ No instance specified
→ Uses defaultEnv
```

### Instance Context Persistence

```
User: "List workflows from production"
Claude: [Lists production workflows]

User: "Show recent executions"
Claude: [Shows production executions]
        (remembers "production" from context)
```

---

## Next Steps

- [Configuration Guide](configuration.md) - Setup instructions
- [Instance Routing](instance-routing.md) - Routing details
- [Testing](testing.md) - Validation testing
- [Examples](examples.md) - Real-world scenarios

---

!!! info "Technical Deep Dive"
    See [API Architecture](../api/architecture.md) for implementation details.
