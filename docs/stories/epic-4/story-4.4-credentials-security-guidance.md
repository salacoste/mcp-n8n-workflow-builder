# Story 4.4: Credentials Tools Security Guidance

**Epic:** Epic 4 - Core Features & MCP Tools Reference
**Story ID:** STORY-4.4
**Status:** Draft
**Created:** 2025-12-27
**Updated:** 2025-12-27

---

## User Story

**As a** user managing sensitive n8n credentials
**I want** clear documentation about credentials tools security limitations and best practices
**So that** I understand what operations are available and how to securely manage credentials

---

## Story Description

### Current System Context

The MCP server provides **6 credential tools with security guidance** (Epic 2):

1. **list_credentials** - Security guidance (n8n blocks for protection)
2. **get_credential** - Security guidance and alternatives
3. **create_credential** - Schema-driven credential creation
4. **update_credential** - Immutability guidance (DELETE + CREATE pattern)
5. **delete_credential** - Permanent credential removal
6. **get_credential_schema** - JSON schema for credential types

**API Coverage (Epic 2):**
- 6/6 credential methods documented (100% documentation coverage)
- 4/6 methods fully functional (create, delete, get_schema, list with guidance)
- 2/6 methods provide security guidance (list, get, update)

**n8n Security Restrictions:**
- LIST operations blocked by n8n for security (returns 403/404)
- GET operations blocked to prevent credential exposure
- Credentials contain sensitive data (API keys, passwords, tokens)
- n8n encrypts credential data at rest

**Schema-Driven Pattern (Epic 2):**
```typescript
// Step 1: Get schema
get_credential_schema({ type: "httpBasicAuth" })
// Returns: { properties: [{ name: "user", type: "string" }, ...] }

// Step 2: Create credential with validated data
create_credential({
  name: "My API Credential",
  type: "httpBasicAuth",
  data: { user: "username", password: "securepass" }
})
```

### Enhancement: Credentials Security Documentation

Create comprehensive security-focused documentation covering:

**Security Model:**
- Why n8n blocks certain operations
- Credential encryption and storage
- API key exposure risks
- Best practices for credential management

**Available Operations:**
- What works (create, delete, get_schema)
- What's blocked (list, get, update with reasons)
- Alternative approaches
- Workarounds and solutions

**Schema-Driven Creation:**
- Understanding credential schemas
- Supported credential types
- Creating credentials securely
- Validation and error handling

**Credential Lifecycle:**
- Planning credential needs
- Creating with proper naming
- Managing in n8n UI (preferred)
- Deletion and rotation strategies

---

## Acceptance Criteria

### Documentation Requirements

**AC1: Tools Overview with Security Context**
- [ ] Summary table:
  | Tool | Functionality | Security Status | Alternative | n8n API |
  |------|---------------|-----------------|-------------|---------|
  | list_credentials | List all credentials | 🔒 Blocked | Use n8n UI | GET /credentials (403) |
  | get_credential | Get credential details | 🔒 Blocked | Use n8n UI | GET /credentials/{id} (403) |
  | create_credential | Create new credential | ✅ Available | - | POST /credentials |
  | update_credential | Update credential | 🔒 Immutable | DELETE + CREATE | PUT /credentials/{id} |
  | delete_credential | Delete credential | ✅ Available | - | DELETE /credentials/{id} |
  | get_credential_schema | Get type schema | ✅ Available | - | GET /credentials/schema/{type} |

- [ ] Security indicator legend:
  - ✅ **Available:** Tool works as expected
  - 🔒 **Blocked:** n8n security restriction
  - ⚠️ **Pattern Required:** Special workflow needed

**AC2: Security Model Explanation**
- [ ] **Why n8n Blocks Operations:**
  ```markdown
  ## Security by Design

  n8n blocks LIST and GET operations for credentials through REST API to protect sensitive data:

  ### Why LIST is Blocked:
  - Prevents enumeration of all credentials
  - Reduces API key exposure risk
  - Protects credential names and types from discovery
  - Forces intentional credential access through UI

  ### Why GET is Blocked:
  - Credential data contains sensitive information (passwords, tokens, API keys)
  - Even encrypted data shouldn't be accessible via API
  - Prevents accidental credential exposure
  - Reduces attack surface

  ### Why UPDATE Returns Guidance:
  - Credentials are immutable by design
  - Pattern: Delete old credential + Create new credential
  - Ensures audit trail of changes
  - Prevents partial updates that could corrupt credentials
  ```
- [ ] **Credential Encryption:**
  - n8n automatically encrypts credential data at rest
  - Encryption key from n8n instance (not exposed via API)
  - Decryption only within n8n runtime
  - API never returns decrypted sensitive data

**AC3: list_credentials Tool Documentation**
- [ ] **Purpose:** Provide security guidance about credentials listing
- [ ] **Security Status:** 🔒 Blocked by n8n for security
- [ ] **Input Parameters:**
  ```typescript
  {
    instance?: string;       // n8n instance identifier (optional)
  }
  ```
- [ ] **Output Format:**
  ```typescript
  {
    security_limitation: true;
    message: string;         // Explanation of security block
    alternatives: {
      n8nUI: string;        // How to list in n8n UI
      schema: string;       // Use get_credential_schema for types
      naming: string;       // Naming convention recommendations
    };
    reason: string;          // Why n8n blocks this operation
  }
  ```
- [ ] **Claude Desktop Examples:**
  ```
  Example 1 - Attempt to list credentials:
  User: "List all my n8n credentials"
  Claude: Uses list_credentials()
  Response: Security guidance message explaining:
    - n8n blocks LIST for security
    - Alternative: Use n8n UI (Settings → Credentials)
    - Shows how to access credentials in n8n web interface

  Example 2 - Understanding security:
  User: "Why can't I list credentials?"
  Claude: Explains n8n security model:
    - Prevents credential enumeration
    - Protects sensitive data
    - Reduces API attack surface
    - Recommends n8n UI for credential management
  ```
- [ ] **Alternative: n8n UI Access:**
  ```markdown
  ### Access Credentials in n8n UI:
  1. Log into your n8n instance web interface
  2. Navigate to Settings → Credentials
  3. View all credentials with:
     - Credential name
     - Credential type
     - Nodes with access
     - Created/Updated timestamps
  4. Note: Sensitive data (API keys, passwords) are hidden by default
  ```

**AC4: get_credential Tool Documentation**
- [ ] **Purpose:** Provide security guidance and alternatives
- [ ] **Security Status:** 🔒 Blocked by n8n for security
- [ ] **Input Parameters:**
  ```typescript
  {
    id: string;              // Credential ID (required)
    instance?: string;       // n8n instance identifier (optional)
  }
  ```
- [ ] **Output Format:** Security guidance message
- [ ] **Claude Desktop Examples:**
  ```
  Example 1 - Attempt to get credential:
  User: "Get credential details for ID 29"
  Claude: Uses get_credential({ id: "29" })
  Response: Security guidance explaining n8n restriction

  Example 2 - Check credential in workflow:
  User: "What credentials does workflow 123 use?"
  Claude:
    1. get_workflow({ id: "123" })
    2. Analyzes nodes.credentials
    3. Shows: credential IDs and names (not sensitive data)
    4. Note: Full credential data not accessible via API
  ```
- [ ] **Alternative Approaches:**
  - View credential metadata in workflow nodes
  - Access full details through n8n UI
  - Use get_credential_schema to understand structure

**AC5: create_credential Tool Documentation**
- [ ] **Purpose:** Create new credential with schema validation
- [ ] **Input Parameters:**
  ```typescript
  {
    name: string;            // Credential display name (required)
    type: string;            // Credential type (required)
    data: object;            // Credential data matching schema (required)
    nodesAccess?: Array<{    // Node access restrictions (optional)
      nodeType: string;
    }>;
    instance?: string;       // n8n instance identifier (optional)
  }
  ```
- [ ] **Output Format:**
  ```typescript
  {
    id: string;              // Generated credential ID
    name: string;
    type: string;
    nodesAccess: Array<{
      nodeType: string;
      date: string;
    }>;
    createdAt: string;
    updatedAt: string;
  }
  ```
- [ ] **Claude Desktop Examples:**
  ```
  Example 1 - Create HTTP Basic Auth:
  User: "Create HTTP Basic Auth credential named 'API Access'"
  Claude:
    1. get_credential_schema({ type: "httpBasicAuth" })
    2. Asks: "Please provide username and password"
    3. create_credential({
         name: "API Access",
         type: "httpBasicAuth",
         data: { user: "admin", password: "secure123" }
       })

  Example 2 - Create with schema check:
  User: "Create Airtable API credential"
  Claude:
    1. get_credential_schema({ type: "airtableApi" })
    2. Shows required fields: apiKey
    3. Asks: "Please provide your Airtable API key"
    4. create_credential({
         name: "Airtable Production",
         type: "airtableApi",
         data: { apiKey: "keyABC123" }
       })

  Example 3 - Create with node access restrictions:
  User: "Create Slack credential accessible only to Slack nodes"
  Claude: create_credential({
    name: "Slack Workspace",
    type: "slackApi",
    data: { accessToken: "xoxb-..." },
    nodesAccess: [{ nodeType: "n8n-nodes-base.slack" }]
  })
  ```
- [ ] **Schema-Driven Workflow:**
  1. Always get_credential_schema first
  2. Understand required fields
  3. Prepare credential data
  4. Create credential with validation
  5. Verify creation successful

**AC6: update_credential Tool Documentation**
- [ ] **Purpose:** Provide UPDATE pattern guidance (immutability by design)
- [ ] **Security Status:** ⚠️ Pattern Required (DELETE + CREATE)
- [ ] **Input Parameters:** Not applicable (provides guidance)
- [ ] **Output Format:** Guidance message
- [ ] **Claude Desktop Examples:**
  ```
  Example 1 - Update attempt:
  User: "Update credential 29 with new API key"
  Claude: Uses update_credential({ id: "29" })
  Response: Guidance message explaining immutability pattern:

  "Credentials are immutable in n8n for security. To update:

  1. Note the current credential details (name, type, nodesAccess)
  2. Delete the old credential:
     delete_credential({ id: '29' })
  3. Create new credential with updated data:
     create_credential({ name: '...', type: '...', data: {new_data} })

  ⚠️ Warning: Workflows using old credential will break until updated!

  Alternative: Create new credential, update workflows, then delete old."
  ```
- [ ] **UPDATE Pattern Workflow:**
  ```markdown
  ### Safe Credential Update Pattern:

  Step 1: Create new credential with updated data
  → create_credential({ name: "API v2", type: "...", data: {...} })
  → Returns new_credential_id

  Step 2: Update workflows to use new credential
  → get_workflow({ id: each_workflow })
  → Update node.credentials references
  → update_workflow with new credential ID

  Step 3: Verify workflows working
  → Test workflows with new credential
  → Check executions successful

  Step 4: Delete old credential
  → delete_credential({ id: old_credential_id })

  This ensures zero downtime and safe migration.
  ```

**AC7: delete_credential Tool Documentation**
- [ ] **Purpose:** Permanently remove credential from n8n
- [ ] **Input Parameters:**
  ```typescript
  {
    id: string;              // Credential ID (required)
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
  Example 1 - Delete credential (with safety check):
  User: "Delete credential 29"
  Claude:
    1. Warns: "This will remove credential permanently"
    2. Suggests: "Check if any workflows use this credential"
    3. Asks confirmation
    4. delete_credential({ id: "29" }) if confirmed

  Example 2 - Safe deletion workflow:
  User: "Safely delete credential 'Old API'"
  Claude:
    1. list_workflows()
    2. For each workflow: check if uses this credential
    3. Shows: "Credential used in workflows: X, Y, Z"
    4. Recommends: "Update these workflows first"
    5. After confirmation: delete_credential
  ```
- [ ] **Safety Warnings:**
  - ⚠️ **IRREVERSIBLE:** Deleted credentials cannot be recovered
  - Workflows using deleted credentials will fail
  - Active workflows should be deactivated first
  - Check credential usage before deletion
- [ ] **Impact on Workflows:**
  - Workflows with deleted credential will show error
  - Must reconfigure credentials in n8n UI
  - Executions will fail until fixed

**AC8: get_credential_schema Tool Documentation**
- [ ] **Purpose:** Get JSON schema for credential type (validation reference)
- [ ] **Input Parameters:**
  ```typescript
  {
    type: string;            // Credential type name (required)
    instance?: string;       // n8n instance identifier (optional)
  }
  ```
- [ ] **Output Format:**
  ```typescript
  {
    type: string;            // Credential type
    displayName: string;     // Human-readable name
    documentationUrl?: string;  // Official docs URL
    properties: Array<{
      displayName: string;   // Field label
      name: string;          // Field key
      type: string;          // Field type (string, boolean, etc.)
      typeOptions?: object;  // Type-specific options
      default?: any;         // Default value
      required: boolean;     // Is field required
      description?: string;  // Field description
    }>;
  }
  ```
- [ ] **Claude Desktop Examples:**
  ```
  Example 1 - Get HTTP Basic Auth schema:
  User: "What fields do I need for HTTP Basic Auth credential?"
  Claude: Uses get_credential_schema({ type: "httpBasicAuth" })
  Response:
    "HTTP Basic Auth requires 2 fields:
    1. user (string, required) - Username
    2. password (string, required) - Password

    Documentation: [link if available]"

  Example 2 - Get Airtable API schema:
  User: "Show me Airtable credential schema"
  Claude: Uses get_credential_schema({ type: "airtableApi" })
  Response: Lists required apiKey field with description

  Example 3 - Get OAuth2 schema (complex):
  User: "What's needed for Google Drive OAuth2?"
  Claude: Uses get_credential_schema({ type: "googleDriveOAuth2Api" })
  Response: Shows OAuth2 token structure and required fields

  Example 4 - Validate before creation:
  User: "I want to create Slack credential, what do I need?"
  Claude:
    1. get_credential_schema({ type: "slackApi" })
    2. Shows required fields
    3. Asks: "Please provide the required data"
    4. create_credential with validated data
  ```
- [ ] **Common Credential Types:**
  ```markdown
  ### Popular Credential Types:

  **API Key Based:**
  - airtableApi - Airtable API key
  - slackApi - Slack access token
  - githubApi - GitHub personal access token
  - notionApi - Notion integration token

  **OAuth2 Based:**
  - googleDriveOAuth2Api - Google Drive OAuth2
  - githubOAuth2Api - GitHub OAuth2
  - slackOAuth2Api - Slack OAuth2

  **Basic Auth:**
  - httpBasicAuth - Generic HTTP Basic Authentication

  **Custom Auth:**
  - httpHeaderAuth - Custom HTTP header
  - httpQueryAuth - Query parameter authentication
  ```

**AC9: Security Best Practices**
- [ ] **Credential Creation:**
  - Always use get_credential_schema first
  - Validate data structure before creation
  - Use descriptive names with environment indicator
  - Restrict node access when possible
  - Never log or expose credential data
- [ ] **Credential Storage:**
  - Credentials stored encrypted in n8n database
  - API keys in MCP config (.env, .config.json) also sensitive
  - Never commit credential data to git
  - Use environment-specific credentials
- [ ] **Credential Access:**
  - Prefer n8n UI for viewing credentials
  - Use get_credential_schema for structure reference
  - Avoid storing credential IDs in code
  - Rotate credentials regularly
- [ ] **Credential Lifecycle:**
  ```markdown
  ### Secure Credential Lifecycle:

  1. **Planning:**
     - Identify required integrations
     - Determine credential types needed
     - Plan environment-specific credentials

  2. **Creation:**
     - Use n8n UI for complex credentials (OAuth2)
     - Use create_credential for simple credentials (API keys)
     - Always get schema first
     - Verify creation successful

  3. **Usage:**
     - Assign credentials to workflows in n8n UI
     - Reference by ID in workflow nodes
     - Test with non-production credentials first

  4. **Rotation:**
     - Use UPDATE pattern (DELETE + CREATE)
     - Update workflows with new credential ID
     - Verify workflows before deleting old
     - Schedule regular rotation (quarterly)

  5. **Deletion:**
     - Check workflow usage first
     - Deactivate dependent workflows
     - Delete credential
     - Remove from workflows or assign new
  ```

**AC10: Workarounds and Alternatives**
- [ ] **Alternative: n8n UI for Management:**
  ```markdown
  ### Recommended: Use n8n UI for Credentials

  n8n web interface provides full credential management:

  **Access:** Settings → Credentials

  **Available Operations:**
  - ✅ List all credentials
  - ✅ View credential metadata
  - ✅ Create new credentials
  - ✅ Update existing credentials
  - ✅ Delete credentials
  - ✅ Test credential connections
  - ✅ View credential usage in workflows

  **Benefits:**
  - No API security limitations
  - Visual interface for complex credentials (OAuth2)
  - Built-in validation and testing
  - Credential usage tracking
  ```
- [ ] **Hybrid Approach:**
  ```
  User: "I want to automate credential creation but manage via UI"
  Claude: Recommends:
    1. Use create_credential for initial setup
    2. Use n8n UI for viewing and management
    3. Use schema-driven approach for validation
    4. Use DELETE for cleanup only
  ```

**AC11: Schema-Driven Creation Examples**
- [ ] **Example 1: Simple API Key**
  ```
  User: "Create Airtable credential"
  Claude:
    1. get_credential_schema({ type: "airtableApi" })
       Response: { properties: [{ name: "apiKey", type: "string", required: true }] }

    2. Asks: "Please provide your Airtable API key"
       User: "keyABC123XYZ789"

    3. create_credential({
         name: "Airtable Production",
         type: "airtableApi",
         data: { apiKey: "keyABC123XYZ789" },
         nodesAccess: [{ nodeType: "n8n-nodes-base.airtable" }]
       })

    4. Response: "✅ Credential created with ID 29"
  ```
- [ ] **Example 2: Basic Auth**
  ```
  User: "Create HTTP Basic Auth for internal API"
  Claude:
    1. get_credential_schema({ type: "httpBasicAuth" })
       Shows: user and password required

    2. create_credential({
         name: "Internal API Auth",
         type: "httpBasicAuth",
         data: {
           user: "api_user",
           password: "secure_password_123"
         }
       })
  ```
- [ ] **Example 3: Header Auth**
  ```
  User: "Create custom header authentication"
  Claude:
    1. get_credential_schema({ type: "httpHeaderAuth" })
       Shows: name (header name) and value (header value)

    2. create_credential({
         name: "Custom API Token",
         type: "httpHeaderAuth",
         data: {
           name: "X-API-Key",
           value: "custom_token_abc123"
         }
       })
  ```

**AC12: Error Handling**
- [ ] Common errors:
  - **403 Forbidden:** Credential LIST/GET blocked by n8n
  - **404 Not Found:** Credential type doesn't exist
  - **400 Bad Request:** Invalid credential data structure
  - **409 Conflict:** Credential name already exists
  - **422 Unprocessable:** Schema validation failure
- [ ] Security-specific error messages
- [ ] Link to Story 4.6 for general error handling

---

## Technical Implementation Notes

### Documentation Structure

```markdown
# Credentials Tools Security Guidance

## Overview

### Tools Summary with Security Status
### Security Indicator Legend
### Why This Approach

## Security Model

### n8n Security Design
- Why LIST blocked
- Why GET blocked
- UPDATE immutability

### Credential Encryption
### Attack Surface Reduction

## Tool Specifications

### list_credentials (Security Guidance)
- Purpose
- Security status
- Alternatives
- n8n UI access

### get_credential (Security Guidance)
- Purpose
- Security status
- Alternatives
- Workflow metadata access

### create_credential (Available)
- Purpose
- Parameters
- Response format
- Schema-driven workflow
- Examples

### update_credential (Pattern Guidance)
- Purpose
- Immutability pattern
- DELETE + CREATE workflow
- Safe update procedure

### delete_credential (Available)
- Purpose
- Parameters
- Response format
- Safety checks
- Examples

### get_credential_schema (Available)
- Purpose
- Parameters
- Response format
- Common types
- Examples

## Security Best Practices

### Credential Creation
### Credential Storage
### Credential Access
### Credential Lifecycle

## Workarounds & Alternatives

### n8n UI for Management
### Hybrid Approach
### API Limitations

## Schema-Driven Creation

### Simple API Key Example
### Basic Auth Example
### Header Auth Example
### OAuth2 Considerations

## Common Credential Types

### API Key Based
### OAuth2 Based
### Basic Auth
### Custom Auth

## Error Handling

### Security Errors
### Validation Errors
### Solutions

## Integration with Workflows

### Assigning Credentials
### Credential References
### Workflow Testing

## Related Documentation
- Epic 7 Story 7.4: Credentials API
- Story 4.1: Workflows Tools
- Story 4.6: Error Handling
```

### Content Sources

**Primary References:**
- `/src/index.ts` - credential tool implementations
- `/src/services/n8nApiWrapper.ts` - credentials API
- `/docs/n8n-api-docs/30-CREDENTIALS-API.md` - n8n API reference
- Epic 2 documentation - security restrictions discovered
- Epic 7 Story 7.4 - Credentials API documentation

---

## Dependencies

### Upstream Dependencies
- **Story 4.1** (Workflows Tools) - credentials used in workflow nodes
- **Epic 2** (API Validation) - security restrictions documented
- **Epic 3** (Installation) - MCP server configured

### Downstream Dependencies
- **Story 4.6** (Error Handling) - security error patterns
- **Epic 8 Story 8.1** (Common Issues) - credential troubleshooting

### Related Stories
- **Epic 7 Story 7.4** (Credentials API) - underlying API documentation
- **Epic 5** (Multi-Instance) - instance-specific credentials

---

## Definition of Done

### Content Checklist
- [ ] All 6 tools documented with security context
- [ ] Security model clearly explained
- [ ] Schema-driven creation workflow documented
- [ ] UPDATE pattern (DELETE + CREATE) explained
- [ ] n8n UI alternatives provided
- [ ] 15+ examples with security focus
- [ ] Best practices comprehensive
- [ ] Common credential types listed

### Quality Checklist
- [ ] Security explanations reviewed by Security Agent
- [ ] All schema examples tested
- [ ] CREATE workflow validated
- [ ] UPDATE pattern tested
- [ ] Error cases documented
- [ ] Markdown formatting validated

### Review Checklist
- [ ] Security review by Security Agent (critical)
- [ ] Technical accuracy by Dev Agent
- [ ] QA validation of patterns
- [ ] User testing for clarity

---

## Estimation

**Effort:** 6 story points (4-5 hours)

**Breakdown:**
- Security model explanation: 60 minutes
- Blocked tools documentation (list, get, update): 60 minutes
- Available tools documentation (create, delete, schema): 75 minutes
- Schema-driven workflow examples: 60 minutes
- Security best practices: 45 minutes
- Alternatives and workarounds: 30 minutes
- Testing and validation: 45 minutes

**Page Count:** 14-16 pages

---

## Notes

### Security-First Approach
- Emphasize why security restrictions exist
- Position as feature, not limitation
- Provide practical alternatives
- Focus on safe patterns

### User Education
- Many users expect full CRUD operations
- Need clear explanation of security rationale
- Provide actionable alternatives
- Reduce frustration through understanding

### Key Messages
1. **Security restrictions protect your sensitive data**
2. **n8n UI is the recommended way to manage credentials**
3. **Schema-driven creation is available and secure**
4. **UPDATE pattern ensures audit trail and safety**

---

**Story Owner:** Technical Writer (Scribe Persona) + Security Agent
**Reviewers:** Security Agent (critical), Dev Agent, QA Agent
**Target Milestone:** Epic 4 - Phase 2 (Stories 4.4-4.6)
