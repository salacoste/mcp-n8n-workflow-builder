# Epic 4: Core Features & MCP Tools Reference - GitHub Pages Documentation

<!-- Powered by BMAD™ Core -->

## Epic Goal

Create comprehensive reference documentation for all 17 MCP tools, covering complete API specifications, usage examples, parameter details, error handling, and best practices to enable users to effectively utilize the full functionality of n8n-workflow-builder MCP server.

## Epic Description

### Existing System Context

**Current Relevant Functionality:**
- 17 fully implemented MCP tools across 4 API categories
- Multi-instance support for all tools (optional `instance` parameter)
- Comprehensive API coverage: 83% of n8n REST API v1 methods
- MCP Resources system for data access (/workflows, /execution-stats)
- Tool schemas defined in src/index.ts with JSON schema validation
- N8NApiWrapper implementing all API methods

**Tool Categories:**
1. **Workflows Management** - 8 tools (list, create, get, update, patch, delete, activate, deactivate)
2. **Executions Management** - 4 tools (list, get, delete, retry)
3. **Tags Management** - 5 tools (create, get_tags, get_tag, update, delete)
4. **Credentials Management** - 6 tools (list, get, create, update, delete, get_schema)

**Technology Stack:**
- MCP Protocol (Model Context Protocol) - JSON-RPC 2.0
- TypeScript tool definitions with inputSchema validation
- Axios-based HTTP client for n8n REST API
- Multi-instance routing via EnvironmentManager
- Error handling with detailed messages

**Integration Points:**
- src/index.ts - Tool registration and request handling (lines 881-1650)
- N8NApiWrapper - API method implementations
- EnvironmentManager - Multi-instance routing
- README.md - Available Tools documentation (lines 301-423)

### Enhancement Details

**Current Situation:**

**✅ Existing Documentation:**
- README.md lists all 17 tools with brief descriptions (lines 301-423)
- Tool categories organized (Workflows, Executions, Tags, Credentials)
- Multi-instance support mentioned
- Basic parameter descriptions
- Known limitations documented (activate/deactivate, credential security)

**📋 Code Implementation:**
- All 17 tools fully implemented and tested
- Complete inputSchema definitions in src/index.ts
- Error handling with informative messages
- Epic 2 validation completed (100% test success rate)

**⚠️ Current Gaps for GitHub Pages:**
- No detailed parameter specifications
- Missing usage examples for each tool
- Error responses not documented
- Return value structures not specified
- Best practices scattered or missing
- No interactive examples or code snippets
- Multi-instance usage patterns not clearly demonstrated
- Relationship between tools not explained

**What's Being Added/Changed:**

1. **Workflows Tools Reference (Story 4.1):**
   - Detailed documentation for all 8 workflow tools
   - Complete parameter specifications with types and validation rules
   - Request/response examples for each tool
   - Multi-instance usage patterns
   - Common workflows (create → activate → execute → monitor)
   - Error handling and troubleshooting
   - Best practices for workflow management
   - Known limitations (activate/deactivate API restrictions)

2. **Executions Tools Reference (Story 4.2):**
   - Complete documentation for all 4 execution tools
   - Filtering and pagination examples
   - Execution status interpretation
   - Retry workflow patterns
   - Performance considerations
   - Data inclusion options (includeData parameter)
   - Execution lifecycle management

3. **Tags Tools Reference (Story 4.3):**
   - Full documentation for all 5 tag tools
   - Tag creation and assignment workflows
   - Tag-based workflow organization
   - Tag relationship management
   - Bulk tagging patterns
   - Best practices for tag naming and structure

4. **Credentials Tools Reference (Story 4.4):**
   - Complete documentation for all 6 credential tools
   - Schema-driven credential creation workflow
   - Security considerations and limitations
   - DELETE + CREATE pattern for "updates"
   - Credential type reference
   - Multi-environment credential management
   - Best practices for credential security

5. **MCP Resources System (Story 4.5):**
   - Static resources documentation (/workflows, /execution-stats)
   - Dynamic resource templates (/workflows/{id}, /executions/{id})
   - Resource URI patterns
   - Usage examples with Claude Desktop
   - Performance considerations
   - Caching and refresh patterns

6. **Error Handling & Best Practices (Story 4.6):**
   - Common error responses across all tools
   - Error code interpretation
   - Troubleshooting guide for each tool category
   - Multi-instance error handling
   - Rate limiting considerations
   - Best practices summary
   - Design patterns for tool composition
   - Security best practices

**How It Integrates:**

- Content extracted from src/index.ts tool schemas
- README.md tool descriptions expanded with details
- Epic 2 test results inform usage examples
- Links to Epic 3 (installation), Epic 5 (multi-instance), Epic 7 (API coverage)
- Cross-references to Epic 8 (troubleshooting)
- Integration with GitHub Pages search and navigation

**Success Criteria:**

1. ✅ All 17 tools documented with complete API specifications
2. ✅ Each tool has at least 2 working code examples
3. ✅ All parameters documented with types, validation, and defaults
4. ✅ Error responses documented with troubleshooting steps
5. ✅ Multi-instance usage demonstrated for each tool category
6. ✅ Best practices clearly articulated
7. ✅ Tool relationships and workflows explained
8. ✅ Searchable reference format for quick lookup

## Stories

This epic consists of 6 user stories organized by tool category and cross-cutting concerns:

### Phase 1: Core Tool Categories (Stories 4.1-4.4)

#### Story 4.1: Workflows Management Tools Reference (8 tools)
**📄 File:** `docs/stories/4.1.workflows-tools-reference.md`

**Description:** Comprehensive reference documentation for all 8 workflow management tools with complete API specifications, examples, and best practices.

**User Story:**
> As a developer using n8n-workflow-builder, I want detailed documentation for all workflow management tools, so that I can effectively create, manage, and maintain n8n workflows programmatically.

**Scope:**
- **list_workflows** - List all workflows with metadata
  - Parameters: instance (optional), active filter
  - Response structure: streamlined metadata (ID, name, active, dates, nodeCount, tags)
  - Filtering examples
  - Performance notes (optimized for large datasets)

- **get_workflow** - Retrieve complete workflow details
  - Parameters: instance (optional), id (required)
  - Response structure: full workflow JSON (nodes, connections, settings)
  - Usage patterns

- **create_workflow** - Create new workflow
  - Parameters: instance (optional), name, nodes, connections, settings
  - Connection format transformation (array → n8n object format)
  - Set node parameter handling
  - Validation rules
  - Examples: simple workflow, complex workflow with multiple nodes

- **update_workflow** - Full workflow replacement
  - Parameters: instance (optional), id, complete workflow data
  - Difference from patch_workflow
  - Update strategies

- **patch_workflow** - Partial workflow update
  - Parameters: instance (optional), id, partial data
  - Use cases: rename, change settings, add nodes
  - Examples for common scenarios

- **delete_workflow** - Remove workflow permanently
  - Parameters: instance (optional), id
  - Confirmation patterns
  - Cascade considerations

- **activate_workflow** - Activate workflow (API limitation)
  - Parameters: instance (optional), id
  - ⚠️ API Limitation: Returns informative error (n8n v2.0.3+)
  - Workaround: Manual activation via n8n UI
  - Explanation of read-only 'active' field

- **deactivate_workflow** - Deactivate workflow (API limitation)
  - Parameters: instance (optional), id
  - ⚠️ API Limitation: Returns informative error (n8n v2.0.3+)
  - Workaround: Manual deactivation via n8n UI

**Common Workflows:**
- Create → Activate → Execute → Monitor lifecycle
- Update and versioning strategies
- Bulk operations patterns
- Multi-instance workflow management

**Key Acceptance Criteria:**
1. All 8 tools documented with complete parameter specifications
2. Request/response examples for each tool
3. API limitations clearly explained with workarounds
4. Multi-instance usage demonstrated
5. Connection format transformation documented
6. Common workflows illustrated with step-by-step examples
7. Error handling for each tool
8. Best practices section

**Estimated Complexity:** High
**Dependencies:** None
**Blocking:** Story 4.6 (error handling references workflow tools)

---

#### Story 4.2: Executions Management Tools Reference (4 tools)
**📄 File:** `docs/stories/4.2.executions-tools-reference.md`

**Description:** Complete reference documentation for all 4 execution management tools covering monitoring, filtering, retry, and deletion.

**User Story:**
> As a developer monitoring n8n workflows, I want comprehensive documentation for execution management tools, so that I can effectively track, analyze, and manage workflow executions.

**Scope:**
- **list_executions** - List workflow executions with filtering
  - Parameters: instance, status, workflowId, projectId, limit, cursor, includeData
  - Filtering options (status: success, error, waiting)
  - Pagination with cursor-based navigation
  - includeData flag for full execution data
  - Performance considerations (large datasets)
  - Examples: filter by workflow, filter by status, paginated retrieval

- **get_execution** - Retrieve single execution details
  - Parameters: instance, id, includeData (optional)
  - Response structure: execution metadata, data, timing
  - Execution status interpretation
  - Execution data structure
  - Examples: with and without includeData

- **delete_execution** - Remove execution record
  - Parameters: instance, id
  - Use cases: cleanup, privacy compliance
  - Bulk deletion patterns
  - Confirmation best practices

- **retry_execution** - Retry failed execution
  - Parameters: instance, id
  - Creates new execution as retry of original
  - Works only for executions with status 'error'
  - Retry strategies and patterns
  - Example workflow

**Execution Monitoring Patterns:**
- Real-time execution tracking
- Error detection and alerting
- Execution history analysis
- Performance metrics collection
- Cleanup and retention policies

**Key Acceptance Criteria:**
1. All 4 tools documented with complete specifications
2. Filtering and pagination examples provided
3. Execution status values documented
4. includeData parameter usage explained
5. Retry workflow patterns illustrated
6. Multi-instance execution monitoring demonstrated
7. Performance best practices included
8. Error handling for each tool

**Estimated Complexity:** Medium
**Dependencies:** Story 4.1 (executions relate to workflows)
**Blocking:** None

---

#### Story 4.3: Tags Management Tools Reference (5 tools)
**📄 File:** `docs/stories/4.3.tags-tools-reference.md`

**Description:** Full reference documentation for all 5 tag management tools covering creation, retrieval, updating, and deletion.

**User Story:**
> As a developer organizing n8n workflows, I want detailed documentation for tag management tools, so that I can effectively categorize and organize workflows using tags.

**Scope:**
- **create_tag** - Create new tag
  - Parameters: instance, name
  - Tag naming conventions
  - Duplicate handling
  - Examples: category tags, environment tags

- **get_tags** - List all tags
  - Parameters: instance
  - Response structure: array of tags with IDs and names
  - Sorting and organization

- **get_tag** - Get single tag by ID
  - Parameters: instance, id
  - Response structure: tag details with usage count
  - Use cases

- **update_tag** - Update tag name
  - Parameters: instance, id, name
  - ⚠️ Note: May return 409 Conflict if name already exists
  - Update strategies
  - Workaround for conflicts

- **delete_tag** - Remove tag
  - Parameters: instance, id
  - Cascade behavior (tag removed from workflows)
  - Confirmation patterns

**Tag Organization Patterns:**
- Tag hierarchies and naming conventions
- Environment tagging (production, staging, development)
- Functional categorization
- Workflow lifecycle tags
- Bulk tagging operations
- Tag-based workflow queries

**Key Acceptance Criteria:**
1. All 5 tools documented with complete specifications
2. Tag naming best practices provided
3. Conflict handling (409 errors) documented
4. Workflow association patterns explained
5. Multi-instance tag management demonstrated
6. Organization strategies illustrated
7. Error handling for each tool
8. Examples for common use cases

**Estimated Complexity:** Low
**Dependencies:** Story 4.1 (tags relate to workflows)
**Blocking:** None

---

#### Story 4.4: Credentials Management Tools Reference (6 tools)
**📄 File:** `docs/stories/4.4.credentials-tools-reference.md`

**Description:** Comprehensive reference documentation for all 6 credential management tools with emphasis on security, schema-driven creation, and API limitations.

**User Story:**
> As a developer managing n8n credentials, I want detailed documentation for credential management tools including security considerations and API limitations, so that I can safely create and manage credentials for workflow integrations.

**Scope:**
- **list_credentials** - Security guidance (API blocked)
  - ⚠️ Returns 405 Method Not Allowed (security restriction)
  - Explanation: n8n blocks credential listing for security
  - Alternative: Use n8n web interface
  - Information about credential types and purposes
  - Workflow integration context

- **get_credential** - Security guidance (API blocked)
  - ⚠️ Returns 405 Method Not Allowed (security restriction)
  - Explanation: Credential reading blocked for security/audit trail
  - Three alternative approaches:
    1. View in n8n UI
    2. Use in workflow nodes
    3. Recreate pattern (delete + create)

- **create_credential** - Create new credential
  - Parameters: instance, name, type, data
  - Schema-driven creation workflow
  - Supported credential types (httpBasicAuth, httpHeaderAuth, oAuth2Api, etc.)
  - Data structure per credential type
  - Encryption and security notes
  - Multi-instance credential management
  - Examples: Basic Auth, Header Auth, OAuth2

- **update_credential** - Immutability guidance (no direct update)
  - ⚠️ Credentials are immutable (security/audit trail)
  - DELETE + CREATE workaround pattern
  - Step-by-step "update" procedure
  - Code examples for programmatic updates
  - Alternative: UI-based updates

- **delete_credential** - Remove credential permanently
  - Parameters: instance, id
  - Returns deleted credential metadata
  - 404 handling for non-existent credentials
  - Use in DELETE + CREATE pattern
  - Confirmation best practices

- **get_credential_schema** - Get JSON schema for credential type
  - Parameters: instance, typeName
  - Returns field definitions, types, required fields, validation rules
  - Tested credential types
  - Schema-driven creation support
  - Examples: httpBasicAuth, httpHeaderAuth, oAuth2Api

**Schema-Driven Credential Creation Workflow:**
```
Step 1: Get schema → Understand required fields
Step 2: Prepare credential data → Validate against schema
Step 3: Create credential → Encrypted storage in n8n
Step 4: Use in workflows → Auto-injection
```

**Security Considerations:**
- API limitations and rationale
- Credential encryption by n8n
- Multi-environment credential isolation
- DELETE + CREATE pattern for security
- Best practices for credential management

**Key Acceptance Criteria:**
1. All 6 tools documented with complete specifications
2. API limitations clearly explained with workarounds
3. Schema-driven workflow illustrated step-by-step
4. Security considerations prominent and clear
5. DELETE + CREATE pattern documented with examples
6. Credential types reference provided
7. Multi-instance credential management demonstrated
8. Error handling for each tool
9. Best practices for credential security

**Estimated Complexity:** High
**Dependencies:** Story 4.1 (credentials used in workflows)
**Blocking:** Story 4.6 (security best practices)

---

### Phase 2: Cross-Cutting Features (Stories 4.5-4.6)

#### Story 4.5: MCP Resources System Reference
**📄 File:** `docs/stories/4.5.mcp-resources-reference.md`

**Description:** Documentation for MCP Resources system covering static and dynamic resources for efficient data access.

**User Story:**
> As a Claude Desktop user, I want to understand the MCP Resources system, so that I can efficiently access workflow and execution data without repeatedly calling tools.

**Scope:**
- **Static Resources:**
  - `/workflows` - List of all workflows
    - URI: `/workflows`
    - Returns: JSON array of workflow metadata
    - Use cases: Quick reference, caching
    - Performance benefits

  - `/execution-stats` - Execution statistics summary
    - URI: `/execution-stats`
    - Returns: Aggregated stats (total, succeeded, failed, waiting, avgTime)
    - Use cases: Monitoring dashboards, health checks
    - Calculation methodology

- **Dynamic Resource Templates:**
  - `/workflows/{id}` - Specific workflow details
    - URI template: `/workflows/{id}`
    - Parameters: id (workflow ID)
    - Returns: Complete workflow JSON
    - Use cases: Workflow inspection, versioning

  - `/executions/{id}` - Specific execution details
    - URI template: `/executions/{id}`
    - Parameters: id (execution ID)
    - Returns: Execution data and metadata
    - Use cases: Execution debugging, analysis

- **Using Resources in Claude Desktop:**
  - Resource discovery
  - Resource reading syntax
  - Caching considerations
  - Refresh patterns
  - Error handling

**Resource vs Tool Comparison:**
- When to use resources vs tools
- Performance differences
- Data freshness considerations
- Best practices for each

**Key Acceptance Criteria:**
1. All 4 resource types documented
2. URI patterns clearly specified
3. Response structures detailed
4. Usage examples with Claude Desktop
5. Performance considerations explained
6. Resource vs tool comparison provided
7. Caching and refresh patterns documented
8. Error handling covered

**Estimated Complexity:** Low
**Dependencies:** Stories 4.1, 4.2 (resources provide workflow/execution data)
**Blocking:** None

---

#### Story 4.6: Error Handling & Best Practices Guide
**📄 File:** `docs/stories/4.6.error-handling-best-practices.md`

**Description:** Comprehensive guide to error handling across all MCP tools with common error codes, troubleshooting, and best practices summary.

**User Story:**
> As a developer building with n8n-workflow-builder, I want a comprehensive error handling guide and best practices, so that I can handle errors gracefully and follow recommended patterns.

**Scope:**
- **Common Error Responses:**
  - 400 Bad Request - Invalid parameters, validation errors
  - 401 Unauthorized - Authentication failures (API key issues)
  - 404 Not Found - Workflow, execution, tag, or credential not found
  - 405 Method Not Allowed - API limitations (credentials, activate/deactivate)
  - 409 Conflict - Tag name conflicts, concurrent modifications
  - 500 Internal Server Error - n8n API errors, server issues

- **Error Response Structure:**
  - MCP error format
  - n8n API error format
  - Error message interpretation
  - Stack traces and debugging

- **Category-Specific Error Handling:**
  - Workflows: Connection validation, node parameter errors
  - Executions: Status interpretation, retry failures
  - Tags: Name conflicts, deletion cascades
  - Credentials: Security restrictions, schema validation

- **Multi-Instance Error Handling:**
  - Instance not found errors
  - Instance routing failures
  - Environment-specific troubleshooting
  - Fallback strategies

- **Best Practices:**
  - **Workflow Management:**
    - Validate before create/update
    - Use patch for incremental changes
    - Handle activation via UI when necessary
    - Version control for workflows

  - **Execution Monitoring:**
    - Use filtering to reduce data transfer
    - Implement pagination for large datasets
    - includeData only when needed
    - Regular cleanup of old executions

  - **Tag Organization:**
    - Consistent naming conventions
    - Hierarchical tag structures
    - Avoid duplicate tag names
    - Document tag purposes

  - **Credential Security:**
    - Follow schema-driven creation
    - Use DELETE + CREATE for updates
    - Isolate credentials per environment
    - Never log credential data
    - Rotate credentials regularly

  - **Multi-Instance Usage:**
    - Always specify instance for clarity
    - Use default instance consistently
    - Document instance purposes
    - Test instance connectivity before operations

  - **Tool Composition Patterns:**
    - List → Get → Update workflow
    - Create → Activate → Execute → Monitor lifecycle
    - Bulk operations with error handling
    - Atomic operations where possible

- **Performance Best Practices:**
  - Rate limiting considerations
  - Caching strategies
  - Batch operations
  - Pagination usage
  - Resource vs tool selection

**Key Acceptance Criteria:**
1. All common error codes documented with examples
2. Error response structures explained
3. Category-specific troubleshooting provided
4. Multi-instance error handling covered
5. Best practices organized by category
6. Tool composition patterns illustrated
7. Performance considerations included
8. Links to detailed troubleshooting (Epic 8)

**Estimated Complexity:** Medium
**Dependencies:** Stories 4.1-4.4 (all tool categories)
**Blocking:** None

---

## Story Implementation Order

**Phase 1 (Core Tool Categories) - Stories 4.1, 4.2, 4.3, 4.4:**
- Can be executed in parallel
- Each focuses on one tool category
- All feed into Phase 2 cross-cutting concerns

**Recommended Sequential Order:**
1. **Story 4.1** (Workflows) - Most complex, foundational
2. **Story 4.2** (Executions) - Related to workflows
3. **Story 4.3** (Tags) - Related to workflows
4. **Story 4.4** (Credentials) - Related to workflows, security-focused

**Phase 2 (Cross-Cutting Features) - Stories 4.5, 4.6:**
- MUST follow Phase 1 completion
- Story 4.5 (Resources) can be independent
- Story 4.6 (Error Handling) requires all Phase 1 stories

## Compatibility Requirements

- [x] Documentation matches v0.9.1 implementation
- [x] All tool schemas from src/index.ts accurately reflected
- [x] Multi-instance support documented for all tools
- [x] Epic 2 test results integrated into examples
- [x] API limitations from n8n 1.82.3 documented
- [x] Error handling patterns match actual implementation
- [x] Security considerations for credentials prominent
- [x] Cross-references to Epic 3 (installation), Epic 5 (architecture), Epic 7 (API coverage), Epic 8 (troubleshooting)

## Risk Mitigation

**Primary Risk:** Documentation becomes outdated as tools evolve

**Mitigation:**
- Reference actual code files and line numbers
- Include version tags (v0.9.1+)
- Automated documentation generation where possible
- Regular documentation review with releases
- Changelog integration for tool changes
- Test examples against live n8n instance

**Secondary Risk:** Users misunderstand API limitations

**Mitigation:**
- Prominent ⚠️ warnings for limitations
- Clear explanations of why limitations exist
- Documented workarounds for all limitations
- Examples showing alternative approaches
- Links to relevant n8n API documentation

**Rollback Plan:**
- Documentation changes are non-breaking
- Users can reference README.md for tool list
- Version history maintained
- No code changes in this epic

## Definition of Done

- [ ] All 17 MCP tools documented with complete API specifications
- [ ] Each tool has minimum 2 working code examples
- [ ] All parameters documented with types, validation rules, defaults
- [ ] Error responses documented for each tool
- [ ] Multi-instance usage demonstrated for all categories
- [ ] Best practices clearly articulated per category
- [ ] Tool relationships and workflows explained
- [ ] MCP Resources system fully documented
- [ ] Error handling guide comprehensive and actionable
- [ ] Cross-references to other epics functional
- [ ] GitHub Pages navigation structure implemented
- [ ] Search-friendly formatting applied
- [ ] Mobile-responsive content verified
- [ ] Code examples tested against n8n 1.82.3
- [ ] Visual aids (diagrams, tables) included where helpful

### Testing Checklist

**Prerequisites:**
- [ ] n8n instance available (self-hosted or cloud)
- [ ] All 17 tools functional and tested
- [ ] Multi-instance configuration available
- [ ] Epic 2 test results accessible

**Documentation Quality:**
- [ ] All tool parameters accurately documented
- [ ] Request/response examples match actual behavior
- [ ] Error examples from real API responses
- [ ] Code examples tested and working
- [ ] Multi-instance examples verified
- [ ] Links to other documentation functional

**Content Coverage:**
- [ ] All 17 tools covered (8 workflows + 4 executions + 5 tags + 6 credentials)
- [ ] All API limitations documented with workarounds
- [ ] All error codes explained
- [ ] Best practices for each category
- [ ] Security considerations for credentials
- [ ] Performance optimization guidance

**User Experience:**
- [ ] Navigation intuitive and logical
- [ ] Search functionality effective
- [ ] Code examples copy-paste ready
- [ ] Visual aids support understanding
- [ ] Mobile layout readable
- [ ] Loading performance acceptable

**Integration:**
- [ ] Links to Epic 3 (installation) working
- [ ] Links to Epic 5 (multi-instance) working
- [ ] Links to Epic 7 (API coverage) working
- [ ] Links to Epic 8 (troubleshooting) working
- [ ] External links to n8n docs working

## Technical Notes

### Current Documentation Sources

**README.md:**
- Lines 301-423: Available Tools section
- Tool categories and descriptions
- Multi-instance support notes
- Known limitations

**src/index.ts:**
- Lines 620-880: Tool schemas (ListToolsRequestSchema)
- Lines 881-1650: Tool handlers (CallToolRequestSchema)
- Complete parameter definitions
- Input schema validation

**docs/API-COVERAGE-ANALYSIS.md:**
- Implementation status for each tool
- API limitations documentation
- Testing results

**Epic 2 Documentation:**
- Test results for all tools
- Usage examples from testing
- Known issues and workarounds

### GitHub Pages Integration

**Proposed Page Structure:**
```
📚 Core Features
├── Overview
│   └── MCP Tools Introduction
├── Workflows Tools
│   ├── list_workflows
│   ├── create_workflow
│   ├── get_workflow
│   ├── update_workflow
│   ├── patch_workflow
│   ├── delete_workflow
│   ├── activate_workflow
│   └── deactivate_workflow
├── Executions Tools
│   ├── list_executions
│   ├── get_execution
│   ├── delete_execution
│   └── retry_execution
├── Tags Tools
│   ├── create_tag
│   ├── get_tags
│   ├── get_tag
│   ├── update_tag
│   └── delete_tag
├── Credentials Tools
│   ├── list_credentials
│   ├── get_credential
│   ├── create_credential
│   ├── update_credential
│   ├── delete_credential
│   └── get_credential_schema
├── Resources System
│   ├── Static Resources
│   └── Dynamic Templates
└── Error Handling & Best Practices
    ├── Common Errors
    ├── Category-Specific Handling
    └── Best Practices Summary
```

### Visual Assets Needed

**Diagrams:**
- MCP tool architecture (Claude → MCP Server → n8n API)
- Workflow lifecycle (create → activate → execute → monitor)
- Schema-driven credential creation flow
- Multi-instance routing diagram
- Error handling flow chart

**Tables:**
- Tool parameter reference tables
- Error code reference table
- Credential type comparison table
- Tool vs Resource comparison table

**Code Examples Format:**
All code blocks should include:
- Language identifier (json, javascript, typescript)
- Comments explaining purpose
- Expected responses
- Error handling examples
- Multi-instance variations where applicable

### Content Extraction Plan

**From src/index.ts:**
- Tool schemas (lines 620-880) → Parameter documentation
- Tool handlers (lines 881-1650) → Implementation details
- Error handling patterns → Error guide

**From README.md:**
- Available Tools section (lines 301-423) → Expand into detailed docs
- Multi-instance notes → Integrate into all tool docs

**From Epic 2:**
- Test results → Usage examples
- Known limitations → API limitation warnings
- Validation findings → Best practices

**From docs/API-COVERAGE-ANALYSIS.md:**
- Implementation status → Tool availability matrix
- API limitations → Workarounds and alternatives

## Story Manager Handoff

**Story Manager Handoff:**

"Please develop detailed user stories for this comprehensive MCP tools reference epic. Key considerations:

- This is a documentation-focused epic covering all 17 MCP tools
- Content sources:
  - src/index.ts (tool schemas and handlers, lines 620-1650)
  - README.md (Available Tools section, lines 301-423)
  - docs/API-COVERAGE-ANALYSIS.md (implementation status and limitations)
  - Epic 2 documentation (test results and validation findings)
- Target audience:
  - Primary: Developers using MCP tools programmatically
  - Secondary: API integrators and automation engineers
  - Tertiary: Technical users seeking deep understanding
- Documentation goals:
  - Complete API reference for all tools
  - Working code examples for all common use cases
  - Clear explanation of API limitations with workarounds
  - Best practices for each tool category
  - Security guidance for credential management
- GitHub Pages requirements:
  - Searchable tool reference format
  - Quick navigation to specific tools
  - Copy-paste ready code examples
  - Mobile-responsive tables and code blocks
  - Syntax highlighting for code examples
- Each story must include:
  - Complete parameter specifications (type, validation, default, required/optional)
  - Request/response examples with real data
  - Error handling examples
  - Multi-instance usage patterns
  - Best practices specific to tool category
  - Links to related tools and documentation
  - Visual aids where helpful (diagrams, flowcharts, tables)

The epic should provide a comprehensive, authoritative reference for all MCP tools while being accessible and practical for developers at all skill levels."

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-12-27 | 1.0 | Epic created for GitHub Pages Core Features & MCP Tools documentation | Sarah (PO) |

## References

- **Source Code:** src/index.ts (tool schemas and handlers)
- **Current Documentation:** README.md (Available Tools section)
- **API Coverage:** docs/API-COVERAGE-ANALYSIS.md
- **Validation Results:** Epic 2 documentation (all stories)
- **Epic 3:** Installation & Quick Start (prerequisite documentation)
- **Epic 5:** Multi-Instance Architecture (advanced usage)
- **Epic 7:** API Coverage & n8n Integration (technical deep dive)
- **Epic 8:** Troubleshooting & FAQ (error resolution)
- **Target Version:** 0.9.1+
- **n8n Compatibility:** 1.82.3 (tested and validated)
