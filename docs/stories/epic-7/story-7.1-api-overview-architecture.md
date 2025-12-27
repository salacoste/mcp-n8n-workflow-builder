# Story 7.1: API Overview & Architecture Documentation

**Epic:** Epic 7 - API Reference Documentation
**Story Points:** 5
**Priority:** High
**Status:** Ready for Implementation
**Estimated Page Count:** 10-12 pages

---

## User Story

**As a** developer integrating with the n8n MCP server programmatically
**I want** comprehensive API architecture and overview documentation
**So that** I can understand the system design, authentication, and integration patterns

---

## Story Description

### Current System

With Epic 6 completed:
- ✅ User-facing examples and tutorials
- ✅ Claude Desktop usage patterns
- ✅ Integration guides for end users
- ❌ No technical API reference
- ❌ No architecture documentation
- ❌ No programmatic integration guide
- ❌ No API design patterns documented

### Enhancement

Create comprehensive API architecture documentation covering:
- **System Architecture:** MCP protocol, n8n REST API, multi-instance routing
- **Authentication:** API key management, credential security
- **Request/Response Patterns:** JSON-RPC 2.0, error handling
- **Rate Limiting:** Best practices and limits
- **Versioning:** API version compatibility
- **Data Models:** Core data structures and schemas

---

## Acceptance Criteria

### AC1: System Architecture Documentation
**Given** developers wanting to understand the system
**When** reading architecture documentation
**Then** they should understand all system components:

#### 1.1 Architecture Overview

**Document:** `docs/api/architecture-overview.md`

```markdown
# API Architecture Overview

## System Architecture

### High-Level Architecture

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                     Claude Desktop                          │
│                   (User Interface)                          │
└─────────────────┬───────────────────────────────────────────┘
                  │ MCP Protocol (stdio/HTTP)
                  │ JSON-RPC 2.0
                  ▼
┌─────────────────────────────────────────────────────────────┐
│              n8n MCP Server (Node.js)                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │   MCP Protocol Layer (@modelcontextprotocol/sdk)    │   │
│  └───────────────────┬─────────────────────────────────┘   │
│                      │                                       │
│  ┌───────────────────▼─────────────────────────────────┐   │
│  │         Tool Request Handler                         │   │
│  │   • 17 MCP Tools (workflows, executions, etc.)      │   │
│  │   • Parameter validation                             │   │
│  │   • Instance routing                                 │   │
│  └───────────────────┬─────────────────────────────────┘   │
│                      │                                       │
│  ┌───────────────────▼─────────────────────────────────┐   │
│  │      EnvironmentManager (Singleton)                  │   │
│  │   • Multi-instance routing                           │   │
│  │   • API instance caching                             │   │
│  │   • Connection pooling                               │   │
│  └───────────────────┬─────────────────────────────────┘   │
│                      │                                       │
│  ┌───────────────────▼─────────────────────────────────┐   │
│  │       N8NApiWrapper (per instance)                   │   │
│  │   • HTTP client (axios)                              │   │
│  │   • Request/response formatting                      │   │
│  │   • Error handling                                   │   │
│  └───────────────────┬─────────────────────────────────┘   │
└────────────────────┬─┴─────────────────────────────────────┘
                     │ HTTPS
                     │ REST API v1
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              n8n Instance (per environment)                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              n8n REST API v1                         │   │
│  │   • /api/v1/workflows                                │   │
│  │   • /api/v1/executions                               │   │
│  │   • /api/v1/credentials                              │   │
│  │   • /api/v1/tags                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         n8n Core (Workflow Engine)                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │          Database (SQLite/PostgreSQL)                │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
\`\`\`

---

## Component Details

### 1. MCP Protocol Layer

**Technology:** `@modelcontextprotocol/sdk` (Model Context Protocol SDK)

**Purpose:** Standardized protocol for Claude Desktop to communicate with external services

**Transport:**
- **stdio:** Standard input/output for local processes
- **HTTP:** JSON-RPC over HTTP for remote servers

**Message Format:** JSON-RPC 2.0
\`\`\`json
// Request
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "list_workflows",
    "arguments": {
      "instance": "production",
      "active": true
    }
  }
}

// Response
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [{
      "type": "text",
      "text": "{...workflow data...}"
    }]
  }
}
\`\`\`

**Key Features:**
- Tool discovery (list available tools)
- Resource provisioning (static/dynamic resources)
- Prompt templates (workflow generation)
- Notification support (v0.9.0+)

---

### 2. Tool Request Handler

**File:** `src/index.ts`

**Responsibilities:**
- Register all 17 MCP tools
- Parse and validate tool parameters
- Route requests to appropriate handlers
- Format responses for MCP protocol

**Tool Categories:**
\`\`\`typescript
// Workflow Tools (8)
const workflowTools = [
  'list_workflows', 'get_workflow', 'create_workflow',
  'update_workflow', 'delete_workflow', 'activate_workflow',
  'deactivate_workflow', 'execute_workflow'
];

// Execution Tools (4)
const executionTools = [
  'list_executions', 'get_execution',
  'delete_execution', 'retry_execution'
];

// Credential Tools (6)
const credentialTools = [
  'list_credentials', 'get_credential', 'create_credential',
  'update_credential', 'delete_credential', 'get_credential_schema'
];

// Tag Tools (5)
const tagTools = [
  'create_tag', 'get_tags', 'get_tag',
  'update_tag', 'delete_tag'
];
\`\`\`

**Request Flow:**
\`\`\`
1. Receive JSON-RPC request
2. Parse tool name and arguments
3. Extract instance parameter
4. Validate required parameters
5. Route to EnvironmentManager
6. Execute API call
7. Format response
8. Return JSON-RPC response
\`\`\`

---

### 3. EnvironmentManager (Multi-Instance Router)

**File:** `src/services/environmentManager.ts`

**Pattern:** Singleton

**Purpose:** Centralized management of multiple n8n instances

**Key Features:**
\`\`\`typescript
class EnvironmentManager {
  private static instance: EnvironmentManager;
  private apiInstances: Map<string, N8NApiWrapper>;

  // Get or create API instance for environment
  getApi(instanceName?: string): N8NApiWrapper;

  // List available environments
  listEnvironments(): string[];

  // Get default environment
  getDefaultEnvironment(): string;

  // Validate environment exists
  validateEnvironment(name: string): void;

  // Clear cached instances
  clearCache(instanceName?: string): void;
}
\`\`\`

**Caching Strategy:**
- API instances cached per environment
- Connection pooling via axios instances
- ~100x performance improvement for repeated calls
- Manual cache invalidation supported

**Instance Resolution:**
\`\`\`
Tool parameter "instance" provided?
  ├─ Yes → Use specified instance (validate exists)
  └─ No → Use default environment from config
\`\`\`

---

### 4. N8NApiWrapper (n8n REST API Client)

**File:** `src/services/n8nApiWrapper.ts`

**Purpose:** Abstraction layer for n8n REST API v1

**Architecture:**
\`\`\`typescript
class N8NApiWrapper {
  private baseURL: string;        // e.g., https://n8n.cloud/api/v1
  private apiKey: string;          // X-N8N-API-KEY header
  private axiosInstance: AxiosInstance;

  // Workflow operations
  async listWorkflows(params): Promise<WorkflowListResponse>;
  async getWorkflow(id): Promise<WorkflowDefinition>;
  async createWorkflow(data): Promise<WorkflowDefinition>;
  async updateWorkflow(id, data): Promise<WorkflowDefinition>;
  async deleteWorkflow(id): Promise<void>;
  async activateWorkflow(id): Promise<WorkflowDefinition>;
  async deactivateWorkflow(id): Promise<WorkflowDefinition>;

  // Execution operations
  async listExecutions(params): Promise<ExecutionListResponse>;
  async getExecution(id, includeData): Promise<Execution>;
  async deleteExecution(id): Promise<void>;
  async retryExecution(id): Promise<Execution>;

  // Credential operations
  async getCredentialSchema(type): Promise<CredentialSchema>;
  async createCredential(data): Promise<Credential>;
  async deleteCredential(id): Promise<void>;

  // Tag operations
  async createTag(data): Promise<Tag>;
  async getTags(params): Promise<TagListResponse>;
  async getTag(id): Promise<Tag>;
  async updateTag(id, data): Promise<Tag>;
  async deleteTag(id): Promise<void>;
}
\`\`\`

**HTTP Configuration:**
\`\`\`typescript
{
  baseURL: "https://n8n.example.com/api/v1",
  headers: {
    "X-N8N-API-KEY": "n8n_api_...",
    "Content-Type": "application/json"
  },
  timeout: 30000  // 30 seconds
}
\`\`\`

---

### 5. Configuration Management

**Files:**
- `src/config/configLoader.ts` - Configuration loading
- `.config.json` - Multi-instance configuration
- `.env` - Single-instance fallback

**Configuration Priority:**
\`\`\`
1. Environment variables (runtime overrides)
2. .config.json (multi-instance)
3. .env (single-instance fallback)
\`\`\`

**ConfigLoader Responsibilities:**
- Load and validate configuration
- Provide environment access
- URL normalization (remove /api/v1/)
- Singleton pattern for consistency

---

## Data Flow Examples

### Example 1: List Workflows

\`\`\`
1. User in Claude Desktop:
   "List active workflows in production"

2. Claude generates MCP request:
   {
     "method": "tools/call",
     "params": {
       "name": "list_workflows",
       "arguments": {
         "instance": "production",
         "active": true
       }
     }
   }

3. MCP Server receives request:
   ├─ Tool Handler extracts: instance="production", active=true
   └─ Routes to EnvironmentManager

4. EnvironmentManager:
   ├─ Validates "production" exists
   ├─ Gets cached N8NApiWrapper for production
   └─ Calls listWorkflows({ active: true })

5. N8NApiWrapper:
   ├─ Builds HTTP request:
   │  GET /api/v1/workflows?active=true
   │  Headers: X-N8N-API-KEY: prod_key
   └─ Sends to production n8n instance

6. n8n Instance:
   ├─ Authenticates API key
   ├─ Queries database for active workflows
   └─ Returns JSON response

7. Response flows back:
   n8n → N8NApiWrapper → EnvironmentManager → Tool Handler → MCP Protocol → Claude

8. Claude presents to user:
   "Found 5 active workflows in production:
   1. Email Campaign (12 nodes)
   2. Slack Notifications (5 nodes)
   ..."
\`\`\`

### Example 2: Create Workflow (Multi-Instance)

\`\`\`
1. Claude creates workflow in staging:
   MCP Request → Tool Handler → EnvironmentManager
   → N8NApiWrapper(staging) → POST /api/v1/workflows
   → n8n(staging)

2. Returns workflow with ID: 123

3. User tests and approves

4. Claude creates in production:
   MCP Request → Tool Handler → EnvironmentManager
   → N8NApiWrapper(production) → POST /api/v1/workflows
   → n8n(production)

5. Returns workflow with ID: 456 (different instance)
\`\`\`

---

## Performance Characteristics

### Connection Pooling

**Without Caching:**
\`\`\`
10 API calls = 10 axios instances created
Each call: ~2ms overhead (instance creation)
Total overhead: ~20ms
\`\`\`

**With Caching (Current):**
\`\`\`
10 API calls = 1 axios instance (reused)
First call: ~2ms overhead
Subsequent calls: ~0ms overhead
Total overhead: ~2ms
Improvement: ~90% faster
\`\`\`

### API Call Latency

**Typical Response Times:**
- list_workflows (metadata): 50-150ms
- get_workflow (full): 100-300ms
- create_workflow: 150-400ms
- list_executions: 100-250ms
- get_execution (with data): 200-500ms

**Factors:**
- n8n instance load
- Network latency
- Workflow/execution data size
- Database query performance

---

## Error Handling Strategy

### Error Types

\`\`\`typescript
// Configuration Errors
class ConfigurationError extends Error {
  code: 'CONFIGURATION_ERROR';
  // Missing/invalid .config.json or .env
}

// Authentication Errors
class AuthenticationError extends Error {
  code: 'AUTHENTICATION_ERROR';
  httpStatus: 401;
  // Invalid API key
}

// Instance Errors
class InstanceError extends Error {
  code: 'INSTANCE_NOT_FOUND';
  availableInstances: string[];
  // Requested instance doesn't exist
}

// API Errors
class ApiError extends Error {
  code: 'API_ERROR';
  httpStatus: number;
  apiResponse: any;
  // n8n API returned error
}

// Network Errors
class NetworkError extends Error {
  code: 'NETWORK_ERROR' | 'TIMEOUT' | 'ECONNREFUSED';
  // Connection issues
}
\`\`\`

### Error Propagation

\`\`\`
n8n API Error
  ↓
N8NApiWrapper catches and enriches
  ↓
EnvironmentManager adds instance context
  ↓
Tool Handler formats for MCP
  ↓
JSON-RPC error response
  ↓
Claude Desktop displays to user
\`\`\`

---

## Security Architecture

### API Key Management

**Storage:**
- .config.json (excluded from version control)
- Environment variables (runtime override)
- Never in code or logs

**Transmission:**
- HTTPS only
- X-N8N-API-KEY header
- Never in URL parameters

**Rotation:**
- Generate new key in n8n UI
- Update configuration
- Restart MCP server
- No code changes needed

### Credential Isolation

**n8n Security Model:**
- Credentials encrypted in n8n database
- LIST/GET operations blocked via API
- Schema-driven creation only
- Credentials never exposed to MCP server

**MCP Server Handling:**
- References credentials by ID
- Never stores credential data
- Provides schema information only
- Guides users to n8n UI for management

---

## Versioning & Compatibility

### MCP Server Version

**Current:** 0.9.1

**Versioning Scheme:** Semantic Versioning (semver)
- Major: Breaking API changes
- Minor: New features (backward compatible)
- Patch: Bug fixes

**Version Check:**
\`\`\`bash
npx @bmad-labs/mcp-n8n-workflow-builder --version
# Output: 0.9.1
\`\`\`

### n8n API Version

**Supported:** n8n REST API v1

**Tested With:** n8n v1.82.3

**Compatibility:**
- API v1 endpoints: Stable
- Known limitations documented (Epic 1, Epic 2)
- Forward compatible with minor n8n updates

**Version Detection:**
\`\`\`bash
curl https://your-n8n.cloud/api/v1/workflows
# Response headers include n8n version
\`\`\`

---

## Next Steps

- [Authentication Guide](./authentication.md)
- [Workflows API Reference](./workflows-api.md)
- [Executions API Reference](./executions-api.md)
- [Error Handling Reference](./error-handling.md)
```

---

## Technical Implementation Notes

### Documentation Structure

```
docs/api/
├── architecture-overview.md
├── authentication.md
├── request-response-patterns.md
├── rate-limiting.md
├── versioning.md
└── data-models.md
```

### Diagram Tools

Use Mermaid.js for architecture diagrams:

```markdown
\`\`\`mermaid
graph TB
    A[Claude Desktop] --> B[MCP Server]
    B --> C[EnvironmentManager]
    C --> D[N8NApiWrapper]
    D --> E[n8n Instance]
\`\`\`
```

---

## Dependencies

### Upstream Dependencies
- All Epic 1-6 features (complete system knowledge)
- `@modelcontextprotocol/sdk` documentation
- n8n REST API v1 documentation

### Downstream Dependencies
- Stories 7.2-7.6 (Specific API references)
- Epic 8 (Deployment) - Production architecture

---

## Definition of Done

### Documentation Completeness
- [ ] System architecture diagram
- [ ] Component descriptions
- [ ] Data flow examples
- [ ] Performance characteristics
- [ ] Error handling strategy
- [ ] Security architecture
- [ ] Versioning information

### Quality Standards
- [ ] Technical review by development team
- [ ] Architecture diagrams accurate
- [ ] All components documented
- [ ] Examples tested and verified

---

## Estimation Breakdown

**Story Points:** 5

**Effort Distribution:**
- Architecture Diagrams: 1 SP
- Component Documentation: 1.5 SP
- Data Flow Examples: 1 SP
- Performance & Security: 1 SP
- Versioning & Compatibility: 0.5 SP

**Page Count:** 10-12 pages

**Estimated Duration:** 2-3 days (1 technical writer)

---

## Notes

### Success Metrics
- Developers understand system architecture
- Clear component boundaries
- Integration patterns documented
- Performance expectations set

### Best Practices
- ✅ Use visual diagrams
- ✅ Show data flow examples
- ✅ Document all components
- ✅ Explain design decisions
- ✅ Include performance metrics

---

**Status:** Ready for Implementation
**Related Files:**
- `docs/api/architecture-overview.md`
- `docs/api/authentication.md`
- `docs/api/request-response-patterns.md`
