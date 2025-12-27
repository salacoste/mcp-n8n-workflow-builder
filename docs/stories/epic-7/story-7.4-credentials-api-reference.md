# Story 7.4: Credentials API Reference Documentation

**Epic:** Epic 7 - API Reference Documentation
**Story Points:** 4
**Priority:** Medium
**Status:** Ready for Implementation
**Estimated Page Count:** 8-10 pages

---

## User Story

**As a** developer managing workflow credentials
**I want** complete API reference for credential operations
**So that** I can understand security restrictions and implement schema-driven credential creation

---

## Story Description

### Current System

With Stories 7.1-7.3 completed:
- ✅ Architecture and workflows/executions APIs documented
- ❌ No credentials API reference
- ❌ n8n security restrictions not documented in API reference
- ❌ Schema-driven creation pattern not in API docs

### Enhancement

Create Credentials API reference documenting all 6 operations with emphasis on security model:
- **list_credentials** - Security restriction (blocked by n8n)
- **get_credential** - Security restriction (blocked by n8n)
- **create_credential** - Schema-driven creation
- **update_credential** - DELETE + CREATE pattern
- **delete_credential** - Permanent removal
- **get_credential_schema** - Schema retrieval for validation

---

## Acceptance Criteria

### AC1: Security Model Documentation

**Document:** `docs/api/credentials-api.md`

```markdown
# Credentials API Reference

Complete API reference for credential management (6 methods).

## Security Model

**n8n Credential Security (Epic 2):**

n8n intentionally blocks LIST and GET operations for credentials via REST API to prevent credential exposure.

**Blocked Operations:**
- ❌ `list_credentials` - Returns security guidance
- ❌ `get_credential` - Returns security guidance

**Available Operations:**
- ✅ `create_credential` - Schema-driven creation
- ✅ `delete_credential` - Permanent removal
- ✅ `get_credential_schema` - Get field requirements
- ⚠️  `update_credential` - Use DELETE + CREATE pattern

**Recommended Approach:**
Manage credentials through n8n UI for visibility and control.

---

## get_credential_schema

Retrieve JSON schema for credential type to understand required fields.

### Purpose

Get field requirements before creating credentials. Essential for schema-driven creation pattern.

### Request

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| instance | string | No | Instance identifier |
| type | string | Yes | Credential type name |

**TypeScript Interface:**

\`\`\`typescript
interface GetCredentialSchemaParams {
  instance?: string;
  type: string;
}
\`\`\`

**Common Credential Types:**
- `httpBasicAuth` - Basic HTTP authentication
- `httpHeaderAuth` - HTTP header authentication
- `oAuth2Api` - OAuth 2.0
- `googleSheetsOAuth2Api` - Google Sheets
- `slackApi` - Slack
- `gmailOAuth2` - Gmail
- `postgresDb` - PostgreSQL
- And 100+ more in n8n

---

### Response

\`\`\`typescript
interface CredentialSchema {
  type: 'object';
  properties: Array<{
    name: string;
    type: 'string' | 'number' | 'boolean' | 'options';
    required: boolean;
    displayName: string;
    description?: string;
    default?: any;
    options?: Array<{ name: string; value: any }>;
  }>;
}
\`\`\`

**Example - httpBasicAuth:**

\`\`\`json
{
  "type": "object",
  "properties": [
    {
      "name": "user",
      "type": "string",
      "required": true,
      "displayName": "User",
      "description": "Username for basic auth"
    },
    {
      "name": "password",
      "type": "string",
      "required": true,
      "displayName": "Password",
      "description": "Password for basic auth"
    }
  ]
}
\`\`\`

---

## create_credential

Create new credential using schema-driven approach.

### Request

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| instance | string | No | Instance identifier |
| name | string | Yes | Credential name |
| type | string | Yes | Credential type |
| data | object | Yes | Credential data (schema-specific) |
| nodesAccess | object[] | No | Node access restrictions |

**TypeScript Interface:**

\`\`\`typescript
interface CreateCredentialParams {
  instance?: string;
  name: string;
  type: string;
  data: Record<string, any>;
  nodesAccess?: Array<{
    nodeType: string;
  }>;
}
\`\`\`

---

### Schema-Driven Creation Pattern

**Step 1: Get Schema**

\`\`\`typescript
const schema = await getCredentialSchema({
  type: 'httpBasicAuth',
  instance: 'production'
});
\`\`\`

**Step 2: Validate Data**

\`\`\`typescript
function validateCredentialData(
  data: any,
  schema: CredentialSchema
): void {
  const required = schema.properties
    .filter(p => p.required)
    .map(p => p.name);

  const missing = required.filter(field => !data[field]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required fields: ${missing.join(', ')}`
    );
  }
}
\`\`\`

**Step 3: Create Credential**

\`\`\`typescript
const credential = await createCredential({
  instance: 'production',
  name: 'API Basic Auth',
  type: 'httpBasicAuth',
  data: {
    user: process.env.API_USER,
    password: process.env.API_PASSWORD
  }
});

console.log(`Created credential: ${credential.id}`);
\`\`\`

---

### Response

\`\`\`typescript
interface CreateCredentialResponse {
  id: string;
  name: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  nodesAccess?: Array<{ nodeType: string }>;
}
\`\`\`

**Note:** `data` field NEVER returned (security)

---

## UPDATE Pattern (DELETE + CREATE)

Since n8n doesn't support direct credential updates:

\`\`\`typescript
async function updateCredential(
  credentialId: string,
  newData: CreateCredentialParams,
  instance?: string
): Promise<CreateCredentialResponse> {
  // Step 1: Delete old credential
  await deleteCredential({ id: credentialId, instance });

  // Step 2: Create new credential
  const newCredential = await createCredential({
    ...newData,
    instance
  });

  console.log(`Credential updated: ${credentialId} → ${newCredential.id}`);

  return newCredential;
}
\`\`\`

**Important:** Workflows using old credential ID will break. Update workflow credential references after recreation.

---

## Best Practices

### 1. Never Hardcode Credentials

\`\`\`typescript
// ❌ Bad: Hardcoded
const cred = await createCredential({
  data: { password: 'admin123' }
});

// ✅ Good: Environment variables
const cred = await createCredential({
  data: { password: process.env.API_PASSWORD }
});
\`\`\`

### 2. Always Use Schema Validation

\`\`\`typescript
// ✅ Good: Schema-driven
const schema = await getCredentialSchema({ type });
validateAgainstSchema(data, schema);
await createCredential({ type, data });

// ❌ Bad: Guessing fields
await createCredential({
  type: 'unknownType',
  data: { field1: 'value' }  // May be wrong!
});
\`\`\`

### 3. Manage Complex Credentials via UI

For OAuth2, JWT, and complex types:
- Use n8n UI for initial setup
- MCP server for simple types only
- Reference by ID in workflows

---

## Next Steps

- [Tags API Reference](./tags-api.md)
- [Security Best Practices](./security-best-practices.md)
```

---

## Dependencies

### Upstream Dependencies
- Story 7.1 (Architecture)
- Epic 2 (Credential Limitations)
- Epic 4 Story 4.4 (Credentials Tools)

---

## Definition of Done

- [ ] All 6 credential operations documented
- [ ] Security model explained
- [ ] Schema-driven pattern documented
- [ ] UPDATE pattern (DELETE + CREATE) explained
- [ ] Code examples provided

---

## Estimation Breakdown

**Story Points:** 4
**Page Count:** 8-10 pages
**Duration:** 2 days

---

**Status:** Ready for Implementation
