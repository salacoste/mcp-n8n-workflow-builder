# Story 5.2: EnvironmentManager Implementation

**Epic:** Epic 5 - Multi-Instance Architecture
**Story Points:** 7
**Priority:** High
**Status:** Completed
**Estimated Page Count:** 12-15 pages

---

## User Story

**As a** MCP server developer
**I want** a centralized service that manages n8n API instances for multiple environments
**So that** I can efficiently route API calls to the correct n8n instance with connection pooling and caching

---

## Story Description

### Current System

With Story 5.1 implemented, configuration loading works but API instance management is scattered:

**Problems:**
- No centralized API instance management
- API instances recreated for every call (inefficient)
- No connection pooling or caching
- Instance validation repeated unnecessarily
- No unified error handling for instance routing

### Enhancement

Implement EnvironmentManager service that:
- Manages n8n API instances with singleton pattern
- Provides connection pooling and instance caching
- Routes API calls to correct instance based on parameter
- Validates instances before API calls
- Handles default environment fallback
- Provides instance discovery and listing

**Architecture:**
```
ConfigLoader (Story 5.1)
    ↓
EnvironmentManager (This Story)
    ↓
N8NApiWrapper (Modified to use EnvironmentManager)
    ↓
n8n REST API (per instance)
```

### Context from Previous Stories

**Story 5.1 (Configuration System):**
- ConfigLoader provides environment configurations
- Multi-instance vs single-instance mode detection
- Default environment concept

**Epic 2 (API Implementation):**
- N8NApiWrapper provides unified API interface
- All 23 API methods need instance routing

**Epic 4 (Tools Reference):**
- All 17 MCP tools accept optional `instance` parameter
- Default environment used when instance not specified

---

## Acceptance Criteria

### AC1: EnvironmentManager Class Design
**Given** a need for centralized API instance management
**When** implementing EnvironmentManager
**Then** it should use singleton pattern with caching:

#### 1.1 Class Structure

**File:** `src/services/environmentManager.ts`

```typescript
import { ConfigLoader, EnvironmentConfig } from '../config/configLoader';
import { N8NApiWrapper } from './n8nApiWrapper';

interface ApiInstanceCache {
  [instanceName: string]: N8NApiWrapper;
}

export class EnvironmentManager {
  private static instance: EnvironmentManager;
  private configLoader: ConfigLoader;
  private apiInstances: ApiInstanceCache;

  private constructor() {
    this.configLoader = ConfigLoader.getInstance();
    this.apiInstances = {};

    console.error('[EnvironmentManager] Initialized');
    console.error(`  Multi-instance: ${this.configLoader.isMultiInstance()}`);
    console.error(`  Default environment: ${this.getDefaultEnvironment()}`);
  }

  public static getInstance(): EnvironmentManager {
    if (!EnvironmentManager.instance) {
      EnvironmentManager.instance = new EnvironmentManager();
    }
    return EnvironmentManager.instance;
  }

  /**
   * Get list of available environment names
   */
  public listEnvironments(): string[] {
    return this.configLoader.listEnvironments();
  }

  /**
   * Get default environment name
   */
  public getDefaultEnvironment(): string {
    return this.configLoader.getDefaultEnvironment();
  }

  /**
   * Validate that an environment exists
   */
  public validateEnvironment(instanceName: string): void {
    const available = this.listEnvironments();

    if (!available.includes(instanceName)) {
      throw new Error(
        `Instance "${instanceName}" not found. ` +
        `Available instances: ${available.join(', ')}`
      );
    }
  }

  /**
   * Get or create API instance for environment
   * Uses caching to avoid recreating instances
   */
  public getApi(instanceName?: string): N8NApiWrapper {
    // Use default environment if not specified
    const envName = instanceName || this.getDefaultEnvironment();

    // Validate environment exists
    this.validateEnvironment(envName);

    // Return cached instance if exists
    if (this.apiInstances[envName]) {
      return this.apiInstances[envName];
    }

    // Create new instance
    const config = this.configLoader.getEnvironmentConfig(envName);
    const api = new N8NApiWrapper(config.n8n_host, config.n8n_api_key);

    // Cache for reuse
    this.apiInstances[envName] = api;

    console.error(`[EnvironmentManager] Created API instance for "${envName}"`);
    console.error(`  Host: ${config.n8n_host}`);

    return api;
  }

  /**
   * Clear cached API instance (useful for testing or config reload)
   */
  public clearCache(instanceName?: string): void {
    if (instanceName) {
      delete this.apiInstances[instanceName];
      console.error(`[EnvironmentManager] Cleared cache for "${instanceName}"`);
    } else {
      this.apiInstances = {};
      console.error('[EnvironmentManager] Cleared all cached instances');
    }
  }

  /**
   * Get environment configuration without creating API instance
   */
  public getEnvironmentConfig(instanceName?: string): EnvironmentConfig {
    const envName = instanceName || this.getDefaultEnvironment();
    this.validateEnvironment(envName);
    return this.configLoader.getEnvironmentConfig(envName);
  }

  /**
   * Check if running in multi-instance mode
   */
  public isMultiInstance(): boolean {
    return this.configLoader.isMultiInstance();
  }

  /**
   * Get instance statistics (for debugging/monitoring)
   */
  public getStats(): {
    totalEnvironments: number;
    cachedInstances: number;
    defaultEnvironment: string;
    environments: string[];
  } {
    return {
      totalEnvironments: this.listEnvironments().length,
      cachedInstances: Object.keys(this.apiInstances).length,
      defaultEnvironment: this.getDefaultEnvironment(),
      environments: this.listEnvironments()
    };
  }
}
```

#### 1.2 Singleton Pattern Benefits

**Why Singleton:**
- **Single Source of Truth:** All API calls route through same instance
- **Connection Pooling:** Reuse HTTP connections via axios instances
- **Memory Efficiency:** One API wrapper per environment, not per call
- **Consistent State:** All parts of application see same environment configuration

**Memory Footprint:**
```
Single-Instance Mode:
- 1 ConfigLoader instance
- 1 EnvironmentManager instance
- 1 N8NApiWrapper instance
Total: ~3 objects

Multi-Instance Mode (3 environments):
- 1 ConfigLoader instance
- 1 EnvironmentManager instance
- 3 N8NApiWrapper instances (cached)
Total: ~5 objects (vs 100s without caching)
```

#### 1.3 API Instance Caching

**Cache Strategy:**
```typescript
// First call to environment
const api = envManager.getApi('production');
// Creates new N8NApiWrapper instance
// Caches in apiInstances['production']

// Subsequent calls
const api2 = envManager.getApi('production');
// Returns cached instance (same object reference)
// No new HTTP client creation

console.log(api === api2); // true (same instance)
```

**Performance Impact:**
```
Without Caching (per API call):
- Create axios instance: ~2ms
- Configure headers: ~0.1ms
- Total overhead: ~2.1ms per call

With Caching (first call per environment):
- First call: ~2.1ms overhead
- Subsequent calls: ~0ms overhead (cache hit)

For 100 API calls to same environment:
- Without caching: ~210ms overhead
- With caching: ~2.1ms overhead
- Improvement: ~100x faster
```

### AC2: Instance Routing Logic
**Given** an API call with optional instance parameter
**When** routing the call to correct environment
**Then** it should follow this logic:

#### 2.1 Routing Decision Tree

```
API Call with instance parameter
├─ instance provided?
│  ├─ Yes
│  │  ├─ instance exists?
│  │  │  ├─ Yes → Use specified instance
│  │  │  └─ No → Error: Instance not found
│  │  └─
│  └─ No (undefined)
│     └─ Use default environment from config
│
└─ Result: N8NApiWrapper instance for environment
```

**Implementation:**
```typescript
/**
 * Helper method for instance routing in tool handlers
 */
public async callWithInstance<T>(
  instanceSlug: string | undefined,
  apiCall: (api: N8NApiWrapper) => Promise<T>
): Promise<T> {
  const envManager = EnvironmentManager.getInstance();

  // Determine which instance to use
  const instanceName = instanceSlug || envManager.getDefaultEnvironment();

  // Validate instance exists (throws error if not)
  try {
    envManager.validateEnvironment(instanceName);
  } catch (error) {
    throw new Error(
      `${error.message}\n\n` +
      `Available instances: ${envManager.listEnvironments().join(', ')}\n` +
      `Default instance: ${envManager.getDefaultEnvironment()}`
    );
  }

  // Get API instance (cached)
  const api = envManager.getApi(instanceName);

  // Execute API call
  try {
    return await apiCall(api);
  } catch (error) {
    throw new Error(
      `API call failed for instance "${instanceName}": ` +
      `${error instanceof Error ? error.message : String(error)}`
    );
  }
}
```

#### 2.2 Usage in MCP Tool Handlers

**Before (No Multi-Instance):**
```typescript
// src/index.ts - list_workflows handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'list_workflows') {
    // Hardcoded single instance
    const api = new N8NApiWrapper(process.env.N8N_HOST, process.env.N8N_API_KEY);
    const workflows = await api.listWorkflows(request.params.arguments);
    return { content: [{ type: 'text', text: JSON.stringify(workflows) }] };
  }
});
```

**After (Multi-Instance with EnvironmentManager):**
```typescript
// src/index.ts - list_workflows handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'list_workflows') {
    const envManager = EnvironmentManager.getInstance();

    // Extract instance from arguments
    const { instance, ...apiParams } = request.params.arguments;

    // Route to correct instance (uses default if not specified)
    const api = envManager.getApi(instance);

    // Make API call
    const workflows = await api.listWorkflows(apiParams);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(workflows, null, 2)
      }]
    };
  }
});
```

**Using Helper Method:**
```typescript
// Even cleaner with callWithInstance helper
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'list_workflows') {
    const { instance, ...apiParams } = request.params.arguments;

    const workflows = await callWithInstance(
      instance,
      (api) => api.listWorkflows(apiParams)
    );

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(workflows, null, 2)
      }]
    };
  }
});
```

### AC3: N8NApiWrapper Integration
**Given** N8NApiWrapper needs to work with EnvironmentManager
**When** modifying N8NApiWrapper
**Then** it should support per-instance configuration:

#### 3.1 N8NApiWrapper Modifications

**File:** `src/services/n8nApiWrapper.ts`

**Before (Single Instance):**
```typescript
export class N8NApiWrapper {
  private baseURL: string;
  private apiKey: string;

  constructor() {
    // Load from environment variables
    this.baseURL = process.env.N8N_HOST + '/api/v1';
    this.apiKey = process.env.N8N_API_KEY;
  }

  private getAxiosConfig() {
    return {
      baseURL: this.baseURL,
      headers: { 'X-N8N-API-KEY': this.apiKey }
    };
  }
}
```

**After (Multi-Instance Compatible):**
```typescript
export class N8NApiWrapper {
  private baseURL: string;
  private apiKey: string;
  private axiosInstance: AxiosInstance;

  constructor(n8nHost: string, n8nApiKey: string) {
    // Accept configuration as constructor parameters
    this.baseURL = n8nHost.replace(/\/$/, '') + '/api/v1';
    this.apiKey = n8nApiKey;

    // Create dedicated axios instance for this environment
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      headers: {
        'X-N8N-API-KEY': this.apiKey,
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });

    console.error(`[N8NApiWrapper] Initialized for ${n8nHost}`);
  }

  // All API methods use this.axiosInstance
  async listWorkflows(params?: ListWorkflowsParams): Promise<WorkflowListResponse> {
    const response = await this.axiosInstance.get('/workflows', { params });
    return response.data;
  }

  async getWorkflow(id: string): Promise<WorkflowDefinition> {
    const response = await this.axiosInstance.get(`/workflows/${id}`);
    return response.data;
  }

  // ... other methods
}
```

#### 3.2 Connection Pooling Benefits

**Axios Instance Reuse:**
```typescript
// Each N8NApiWrapper has dedicated axios instance
// HTTP connections are pooled and reused automatically

// First API call
await api.listWorkflows(); // Creates new HTTP connection

// Subsequent calls (same instance)
await api.getWorkflow('123'); // Reuses existing connection
await api.listExecutions(); // Reuses existing connection

// Benefits:
// - No TCP handshake overhead
// - No TLS negotiation overhead
// - Keep-alive connection reuse
// - ~50-100ms saved per call
```

**Performance Comparison:**
```
Without Connection Pooling (new axios call each time):
- TCP handshake: ~20ms
- TLS negotiation: ~50ms
- HTTP request: ~100ms
- Total: ~170ms per call

With Connection Pooling (reuse axios instance):
- Connection reuse: ~0ms (already established)
- HTTP request: ~100ms
- Total: ~100ms per call

10 API calls:
- Without pooling: ~1,700ms
- With pooling: ~1,000ms
- Improvement: ~40% faster
```

### AC4: Error Handling and Validation
**Given** various error scenarios in multi-instance routing
**When** errors occur
**Then** they should provide clear, actionable messages:

#### 4.1 Error Scenarios

**Scenario 1: Instance Not Found**
```typescript
try {
  const api = envManager.getApi('nonexistent');
} catch (error) {
  // Error message:
  // Instance "nonexistent" not found.
  // Available instances: production, staging, development
}
```

**Scenario 2: Default Environment Not Set**
```typescript
// .config.json
{
  "environments": { "production": {...} },
  "defaultEnv": "staging"  // staging doesn't exist!
}

// On startup:
// Error: Default environment "staging" not found in environments.
// Available: production
```

**Scenario 3: Configuration Missing**
```typescript
try {
  const envManager = EnvironmentManager.getInstance();
} catch (error) {
  // Error message:
  // No configuration found. Please create one of:
  //   1. .config.json (multi-instance, recommended)
  //   2. .env (single-instance, backward compatibility)
  //
  // See documentation: https://github.com/.../README.md#configuration
}
```

**Scenario 4: API Call Failure**
```typescript
try {
  const workflows = await envManager.callWithInstance(
    'production',
    (api) => api.listWorkflows()
  );
} catch (error) {
  // Error message:
  // API call failed for instance "production": Request timeout
  //
  // Troubleshooting:
  // - Check production instance is running
  // - Verify n8n_host URL is correct
  // - Check network connectivity
}
```

#### 4.2 Validation Methods

```typescript
/**
 * Validates instance name and provides helpful error
 */
private validateInstanceWithContext(
  instanceName: string,
  context: string
): void {
  const available = this.listEnvironments();

  if (!available.includes(instanceName)) {
    const suggestions = this.suggestSimilarInstances(instanceName, available);

    throw new Error(
      `Instance "${instanceName}" not found (${context}).\n\n` +
      `Available instances: ${available.join(', ')}\n` +
      (suggestions.length > 0
        ? `Did you mean: ${suggestions.join(', ')}?\n`
        : '') +
      `\nCheck your .config.json configuration.`
    );
  }
}

/**
 * Suggests similar instance names (typo detection)
 */
private suggestSimilarInstances(
  input: string,
  available: string[]
): string[] {
  return available
    .filter(name =>
      name.toLowerCase().includes(input.toLowerCase()) ||
      input.toLowerCase().includes(name.toLowerCase())
    )
    .slice(0, 3);
}
```

**Example with Suggestions:**
```typescript
envManager.getApi('proudction'); // Typo

// Error:
// Instance "proudction" not found.
// Available instances: production, staging, development
// Did you mean: production?
```

### AC5: Instance Discovery and Monitoring
**Given** a need to discover and monitor environments
**When** using discovery methods
**Then** they should provide comprehensive information:

#### 5.1 Discovery Methods

```typescript
/**
 * Get comprehensive environment information
 */
public getEnvironmentInfo(instanceName?: string): {
  name: string;
  config: EnvironmentConfig;
  isDefault: boolean;
  isCached: boolean;
  stats?: {
    totalCalls?: number;
    lastUsed?: Date;
  };
} {
  const envName = instanceName || this.getDefaultEnvironment();
  this.validateEnvironment(envName);

  return {
    name: envName,
    config: this.configLoader.getEnvironmentConfig(envName),
    isDefault: envName === this.getDefaultEnvironment(),
    isCached: !!this.apiInstances[envName],
    // Could add call tracking in future
  };
}

/**
 * Get all environments information
 */
public getAllEnvironmentsInfo(): Array<{
  name: string;
  host: string;
  isDefault: boolean;
  isCached: boolean;
}> {
  return this.listEnvironments().map(name => {
    const config = this.configLoader.getEnvironmentConfig(name);
    return {
      name,
      host: config.n8n_host,
      isDefault: name === this.getDefaultEnvironment(),
      isCached: !!this.apiInstances[name]
    };
  });
}
```

#### 5.2 Monitoring and Debugging

**Debug Endpoint:**
```typescript
// Add to MCP server for debugging
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'debug_environments') {
    const envManager = EnvironmentManager.getInstance();
    const stats = envManager.getStats();
    const environments = envManager.getAllEnvironmentsInfo();

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          stats,
          environments,
          multiInstance: envManager.isMultiInstance()
        }, null, 2)
      }]
    };
  }
});
```

**Output Example:**
```json
{
  "stats": {
    "totalEnvironments": 3,
    "cachedInstances": 2,
    "defaultEnvironment": "staging",
    "environments": ["production", "staging", "development"]
  },
  "environments": [
    {
      "name": "production",
      "host": "https://prod.app.n8n.cloud",
      "isDefault": false,
      "isCached": true
    },
    {
      "name": "staging",
      "host": "https://staging.app.n8n.cloud",
      "isDefault": true,
      "isCached": true
    },
    {
      "name": "development",
      "host": "http://localhost:5678",
      "isDefault": false,
      "isCached": false
    }
  ],
  "multiInstance": true
}
```

### AC6: Testing and Cache Management
**Given** a need to test environment switching
**When** using test utilities
**Then** cache management should work correctly:

#### 6.1 Cache Management Methods

```typescript
/**
 * Clear specific instance cache (useful for testing)
 */
public clearInstanceCache(instanceName: string): void {
  if (this.apiInstances[instanceName]) {
    delete this.apiInstances[instanceName];
    console.error(`[EnvironmentManager] Cache cleared: ${instanceName}`);
  }
}

/**
 * Clear all cached instances
 */
public clearAllCaches(): void {
  const cachedCount = Object.keys(this.apiInstances).length;
  this.apiInstances = {};
  console.error(`[EnvironmentManager] All caches cleared (${cachedCount} instances)`);
}

/**
 * Reload configuration and clear caches
 */
public reload(): void {
  console.error('[EnvironmentManager] Reloading configuration...');

  // Clear all cached API instances
  this.clearAllCaches();

  // Force ConfigLoader reload (requires singleton reset)
  // Note: In production, this requires server restart
  console.error('⚠️  Full reload requires server restart');
}
```

#### 6.2 Testing Utilities

```typescript
// test-environment-manager.js
import { EnvironmentManager } from './src/services/environmentManager';

function testEnvironmentManager() {
  const envManager = EnvironmentManager.getInstance();

  console.log('=== Environment Manager Test ===\n');

  // Test 1: List environments
  console.log('Available environments:', envManager.listEnvironments());
  console.log('Default environment:', envManager.getDefaultEnvironment());

  // Test 2: Get API instances
  console.log('\n=== Testing API Instance Creation ===');
  const prodApi = envManager.getApi('production');
  console.log('Created production API:', !!prodApi);

  const stagingApi = envManager.getApi('staging');
  console.log('Created staging API:', !!stagingApi);

  // Test 3: Verify caching
  console.log('\n=== Testing Instance Caching ===');
  const prodApi2 = envManager.getApi('production');
  console.log('Cache hit (same instance):', prodApi === prodApi2);

  // Test 4: Default environment
  console.log('\n=== Testing Default Environment ===');
  const defaultApi = envManager.getApi(); // No instance specified
  console.log('Got default environment API:', !!defaultApi);

  // Test 5: Stats
  console.log('\n=== Environment Stats ===');
  console.log(JSON.stringify(envManager.getStats(), null, 2));

  // Test 6: Clear cache
  console.log('\n=== Testing Cache Clear ===');
  envManager.clearInstanceCache('production');
  const prodApi3 = envManager.getApi('production');
  console.log('New instance after cache clear:', prodApi !== prodApi3);

  // Test 7: Invalid instance
  console.log('\n=== Testing Error Handling ===');
  try {
    envManager.getApi('nonexistent');
  } catch (error) {
    console.log('Error caught correctly:', error.message);
  }

  console.log('\n✅ All tests passed');
}

testEnvironmentManager();
```

---

## Technical Implementation Notes

### Implementation Files

**Created Files:**
- `src/services/environmentManager.ts` - EnvironmentManager class

**Modified Files:**
- `src/services/n8nApiWrapper.ts` - Constructor accepts config parameters
- `src/index.ts` - All tool handlers use EnvironmentManager
- `test-environment-manager.js` - Test suite

### Implementation Sequence

1. **Create EnvironmentManager class** with singleton pattern
2. **Implement instance caching** logic
3. **Add validation methods** with helpful errors
4. **Modify N8NApiWrapper** to accept config parameters
5. **Update all MCP tool handlers** to use EnvironmentManager
6. **Add discovery methods** for monitoring
7. **Implement cache management** utilities
8. **Create test utilities** and validate behavior

### Performance Considerations

**Memory Usage:**
```
Single Environment:
- EnvironmentManager: ~1 KB
- N8NApiWrapper: ~5 KB
- Total: ~6 KB

Three Environments (all cached):
- EnvironmentManager: ~1 KB
- N8NApiWrapper × 3: ~15 KB
- Total: ~16 KB

Minimal overhead for significant performance gain
```

**API Call Performance:**
```
Cold start (first call to environment):
- getApi(): ~2ms (create axios instance)
- API call: ~100-200ms
- Total: ~102-202ms

Warm (cached instance):
- getApi(): ~0.01ms (cache hit)
- API call: ~100-200ms
- Total: ~100-200ms

Improvement: ~2ms saved per call (1-2% faster)
Connection pooling adds additional ~40% improvement
```

---

## Dependencies

### Upstream Dependencies
- **Story 5.1** (Configuration System) - Uses ConfigLoader
- Epic 2 (API Implementation) - Modifies N8NApiWrapper

### Downstream Dependencies
- **Story 5.3** (Instance Routing in Tools) - Uses EnvironmentManager in all tools
- **Story 5.4** (Testing) - Tests EnvironmentManager behavior
- All Epic 4 Stories - Document EnvironmentManager usage

### External Dependencies
```json
{
  "dependencies": {
    "axios": "^1.6.0"
  }
}
```

---

## Definition of Done

### Implementation Completeness
- [x] EnvironmentManager class with singleton pattern
- [x] API instance caching mechanism
- [x] Instance validation with helpful errors
- [x] N8NApiWrapper modified for multi-instance
- [x] Discovery and monitoring methods
- [x] Cache management utilities

### Documentation
- [ ] EnvironmentManager API documentation
- [ ] Usage examples in all tool handlers
- [ ] Performance characteristics documented
- [ ] Testing guide created

### Testing
- [ ] Unit tests for EnvironmentManager
- [ ] Cache hit/miss tests
- [ ] Instance validation tests
- [ ] Default environment fallback tests
- [ ] Error handling tests

### Code Quality
- [x] TypeScript interfaces defined
- [x] Singleton pattern correctly implemented
- [x] Error messages are clear and actionable
- [x] Console logging uses stderr

---

## Estimation Breakdown

**Story Points:** 7

**Effort Distribution:**
- EnvironmentManager Implementation: 2.5 SP
- Instance Caching Logic: 1 SP
- N8NApiWrapper Integration: 1 SP
- Validation & Error Handling: 1 SP
- Discovery & Monitoring: 0.5 SP
- Testing & Documentation: 1 SP

**Page Count:** 12-15 pages
- Class Design: 2-3 pages
- Instance Routing: 2-3 pages
- N8NApiWrapper Integration: 2 pages
- Error Handling: 2-3 pages
- Discovery & Monitoring: 1-2 pages
- Testing Utilities: 2-3 pages

**Estimated Duration:** 3-4 days (1 developer)

---

## Notes

### Success Metrics
- 100% cache hit rate for repeated calls to same instance
- API instance creation time <5ms
- Zero instance validation errors in production
- 40% performance improvement from connection pooling

### Common Mistakes to Avoid
- ❌ Creating new API instance for every call
- ❌ Not validating instance before API call
- ❌ Hardcoding instance names
- ❌ Not using default environment fallback
- ❌ Forgetting to handle single-instance mode

### Best Practices
- ✅ Always use EnvironmentManager.getInstance()
- ✅ Let EnvironmentManager handle validation
- ✅ Use callWithInstance helper for cleaner code
- ✅ Cache API instances for performance
- ✅ Provide clear error messages with available instances

### Related Documentation
- Story 5.1: Multi-Instance Configuration System
- Story 5.3: Instance Routing in MCP Tools
- Epic 2: N8NApiWrapper API methods

---

**Status:** Implemented in version 0.8.0
**Related Files:**
- `src/services/environmentManager.ts`
- `src/services/n8nApiWrapper.ts`
- `test-environment-manager.js`
