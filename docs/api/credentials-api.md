# Credentials API Reference

Complete API reference for credential management operations. Understand n8n's security model and implement schema-driven credential creation.

---

## Overview

The Credentials API provides programmatic access to create and manage workflow credentials with strong security restrictions.

**Available Operations:**

| Operation | Purpose | Status | Notes |
|-----------|---------|--------|-------|
| `get_credential_schema` | Get credential type schema | ✅ Available | Essential for creation |
| `create_credential` | Create new credential | ✅ Available | Schema-driven |
| `delete_credential` | Remove credential | ✅ Available | Permanent |
| `list_credentials` | List credentials | ❌ Blocked | Security restriction |
| `get_credential` | Get credential data | ❌ Blocked | Security restriction |
| `update_credential` | Update credential | ⚠️ Workaround | Use DELETE + CREATE |

---

## Security Model

### n8n Credential Security (Epic 2)

n8n intentionally **blocks** LIST and GET operations for credentials via REST API to prevent credential exposure and unauthorized access.

**Security Architecture:**

```
Credentials in n8n Database
    ↓
Encrypted with AES-256
    ↓
REST API Blocks List/Get Operations
    ↓
Only n8n UI can view credentials
    ↓
MCP Server References by ID Only
```

**Blocked Operations:**

- ❌ `list_credentials` - Returns security guidance, not credential list
- ❌ `get_credential` - Returns security guidance, not credential data

**Why This Matters:**

1. **Prevents Credential Theft:** API cannot be used to extract credentials
2. **Reduces Attack Surface:** Limits credential access points
3. **Centralized Management:** Forces credential management through secure n8n UI
4. **Audit Trail:** All credential access logged in n8n

**Available Operations:**

- ✅ `get_credential_schema` - Get field requirements for credential types
- ✅ `create_credential` - Schema-driven creation with encrypted storage
- ✅ `delete_credential` - Permanent removal
- ⚠️ `update_credential` - Use DELETE + CREATE pattern (immutability)

**Recommended Approach:**

Manage credentials through n8n UI for visibility and control. Use MCP server only for programmatic creation of simple credential types.

---

## get_credential_schema

Retrieve JSON schema for a credential type to understand required fields and validation rules.

### Purpose

Get field requirements before creating credentials. Essential for schema-driven creation pattern and validation.

### Use Cases

- Understanding required fields for credential type
- Validating user input before credential creation
- Building credential creation UIs
- Documenting credential requirements

---

### Request

**MCP Tool Name:** `get_credential_schema`

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| instance | string | No | Instance identifier |
| type | string | Yes | Credential type name |

**TypeScript Interface:**

```typescript
interface GetCredentialSchemaParams {
  instance?: string;
  type: string;
}
```

**Common Credential Types:**

```typescript
// Authentication
'httpBasicAuth'           // Basic HTTP authentication
'httpHeaderAuth'          // HTTP header authentication
'httpDigestAuth'          // Digest authentication
'oAuth1Api'               // OAuth 1.0
'oAuth2Api'               // OAuth 2.0

// Services
'googleSheetsOAuth2Api'   // Google Sheets
'slackApi'                // Slack
'slackOAuth2Api'          // Slack OAuth2
'gmailOAuth2'             // Gmail
'discordApi'              // Discord

// Databases
'postgresDb'              // PostgreSQL
'mysqlDb'                 // MySQL
'mongoDb'                 // MongoDB
'redis'                   // Redis

// And 100+ more types in n8n...
```

---

### Response

**TypeScript Interface:**

```typescript
interface CredentialSchema {
  type: 'object';
  properties: CredentialProperty[];
}

interface CredentialProperty {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'options';
  required: boolean;
  displayName: string;
  description?: string;
  default?: any;
  options?: PropertyOption[];
  placeholder?: string;
  typeOptions?: {
    password?: boolean;
    multipleValues?: boolean;
  };
}

interface PropertyOption {
  name: string;
  value: any;
}
```

---

### Response Examples

**httpBasicAuth Schema:**

```json
{
  "type": "object",
  "properties": [
    {
      "name": "user",
      "type": "string",
      "required": true,
      "displayName": "User",
      "description": "Username for basic authentication"
    },
    {
      "name": "password",
      "type": "string",
      "required": true,
      "displayName": "Password",
      "description": "Password for basic authentication",
      "typeOptions": {
        "password": true
      }
    }
  ]
}
```

**postgresDb Schema:**

```json
{
  "type": "object",
  "properties": [
    {
      "name": "host",
      "type": "string",
      "required": true,
      "displayName": "Host",
      "default": "localhost"
    },
    {
      "name": "port",
      "type": "number",
      "required": true,
      "displayName": "Database Port",
      "default": 5432
    },
    {
      "name": "database",
      "type": "string",
      "required": true,
      "displayName": "Database Name"
    },
    {
      "name": "user",
      "type": "string",
      "required": true,
      "displayName": "User"
    },
    {
      "name": "password",
      "type": "string",
      "required": true,
      "displayName": "Password",
      "typeOptions": {
        "password": true
      }
    },
    {
      "name": "ssl",
      "type": "options",
      "required": false,
      "displayName": "SSL",
      "options": [
        { "name": "Disable", "value": "disable" },
        { "name": "Allow", "value": "allow" },
        { "name": "Require", "value": "require" }
      ],
      "default": "disable"
    }
  ]
}
```

---

### Code Example

```typescript
// Get schema for HTTP Basic Auth
const schema = await callTool('get_credential_schema', {
  instance: 'production',
  type: 'httpBasicAuth'
});

const credSchema = JSON.parse(schema.content[0].text);

console.log('Required fields:');
credSchema.properties
  .filter(p => p.required)
  .forEach(p => {
    console.log(`  - ${p.name}: ${p.displayName}`);
    if (p.description) {
      console.log(`    ${p.description}`);
    }
  });

// Output:
// Required fields:
//   - user: User
//     Username for basic authentication
//   - password: Password
//     Password for basic authentication
```

---

## create_credential

Create new credential using schema-driven approach with encrypted storage.

### Purpose

Programmatically create credentials for workflow nodes. Credentials are encrypted and stored securely in n8n database.

### Use Cases

- CI/CD credential provisioning
- Bulk credential creation from templates
- Programmatic credential setup
- Testing and development environments

---

### Request

**MCP Tool Name:** `create_credential`

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| instance | string | No | Instance identifier |
| name | string | Yes | Credential name (descriptive) |
| type | string | Yes | Credential type (from schema) |
| data | object | Yes | Credential data (schema-specific fields) |
| nodesAccess | object[] | No | Node access restrictions |

**TypeScript Interface:**

```typescript
interface CreateCredentialParams {
  instance?: string;
  name: string;
  type: string;
  data: Record<string, any>;
  nodesAccess?: NodeAccess[];
}

interface NodeAccess {
  nodeType: string;
}
```

---

### Schema-Driven Creation Pattern

**Step 1: Get Schema**

```typescript
const schemaResponse = await callTool('get_credential_schema', {
  type: 'httpBasicAuth',
  instance: 'production'
});

const schema = JSON.parse(schemaResponse.content[0].text);
```

**Step 2: Validate Data Against Schema**

```typescript
function validateCredentialData(
  data: Record<string, any>,
  schema: CredentialSchema
): void {
  // Check required fields
  const required = schema.properties
    .filter(p => p.required)
    .map(p => p.name);

  const missing = required.filter(field => !data[field]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required fields: ${missing.join(', ')}`
    );
  }

  // Validate field types
  for (const prop of schema.properties) {
    if (data[prop.name] !== undefined) {
      const actualType = typeof data[prop.name];
      const expectedType = prop.type;

      if (expectedType === 'number' && actualType !== 'number') {
        throw new Error(
          `Field '${prop.name}' must be a number, got ${actualType}`
        );
      }

      if (expectedType === 'string' && actualType !== 'string') {
        throw new Error(
          `Field '${prop.name}' must be a string, got ${actualType}`
        );
      }
    }
  }
}

// Usage
validateCredentialData(credentialData, schema);
```

**Step 3: Create Credential**

```typescript
const credential = await callTool('create_credential', {
  instance: 'production',
  name: 'API Basic Auth',
  type: 'httpBasicAuth',
  data: {
    user: process.env.API_USER,
    password: process.env.API_PASSWORD
  }
});

const result = JSON.parse(credential.content[0].text);
console.log(`Created credential: ${result.id}`);
```

---

### Response

**Success Response:**

```typescript
interface CreateCredentialResponse {
  id: string;
  name: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  nodesAccess?: NodeAccess[];
}
```

**Important:** `data` field is NEVER returned for security reasons.

**JSON Example:**

```json
{
  "id": "cred_abc123",
  "name": "API Basic Auth",
  "type": "httpBasicAuth",
  "createdAt": "2025-01-15T10:00:00Z",
  "updatedAt": "2025-01-15T10:00:00Z"
}
```

---

### Complete Creation Examples

**HTTP Basic Auth:**

```typescript
// Step 1: Get schema
const schema = await callTool('get_credential_schema', {
  type: 'httpBasicAuth'
});

// Step 2: Create credential
const credential = await callTool('create_credential', {
  instance: 'production',
  name: 'External API Credentials',
  type: 'httpBasicAuth',
  data: {
    user: 'api_user',
    password: 'secure_password_here'
  }
});

const result = JSON.parse(credential.content[0].text);
console.log(`Credential ID: ${result.id}`);
```

**PostgreSQL Database:**

```typescript
const postgresCredential = await callTool('create_credential', {
  instance: 'production',
  name: 'Production Database',
  type: 'postgresDb',
  data: {
    host: 'db.example.com',
    port: 5432,
    database: 'production_db',
    user: 'dbuser',
    password: process.env.DB_PASSWORD,
    ssl: 'require'
  }
});
```

**Slack API:**

```typescript
const slackCredential = await callTool('create_credential', {
  instance: 'production',
  name: 'Slack Bot Token',
  type: 'slackApi',
  data: {
    accessToken: process.env.SLACK_BOT_TOKEN
  }
});
```

---

## UPDATE Pattern (DELETE + CREATE)

n8n does not support direct credential updates due to security and immutability.

**Workaround:** Delete old credential and create new one.

```typescript
async function updateCredential(
  credentialId: string,
  newData: CreateCredentialParams,
  instance?: string
): Promise<CreateCredentialResponse> {
  console.log(`Updating credential ${credentialId}...`);

  // Step 1: Delete old credential
  await callTool('delete_credential', {
    id: credentialId,
    instance
  });
  console.log('Old credential deleted');

  // Step 2: Create new credential with updated data
  const newCredential = await callTool('create_credential', {
    ...newData,
    instance
  });

  const result = JSON.parse(newCredential.content[0].text);

  console.log(`Credential updated: ${credentialId} → ${result.id}`);
  console.log('⚠️  Note: Credential ID changed. Update workflow references!');

  return result;
}

// Usage
const updated = await updateCredential(
  'cred_old123',
  {
    name: 'API Basic Auth',
    type: 'httpBasicAuth',
    data: {
      user: 'new_user',
      password: 'new_password'
    }
  },
  'production'
);
```

**Important:** Workflows using old credential ID will break. Update workflow credential references after recreation:

```typescript
async function updateWorkflowCredentials(
  workflowId: string,
  oldCredentialId: string,
  newCredentialId: string,
  instance?: string
): Promise<void> {
  // Get workflow
  const workflow = await callTool('get_workflow', {
    id: workflowId,
    instance
  });

  const wf = JSON.parse(workflow.content[0].text);

  // Update credential references
  wf.nodes.forEach(node => {
    if (node.credentials) {
      for (const [type, cred] of Object.entries(node.credentials)) {
        if (cred.id === oldCredentialId) {
          cred.id = newCredentialId;
          console.log(`Updated credential in node: ${node.name}`);
        }
      }
    }
  });

  // Save workflow
  await callTool('update_workflow', {
    id: workflowId,
    instance,
    nodes: wf.nodes
  });

  console.log(`Workflow ${workflowId} credential references updated`);
}
```

---

## delete_credential

Remove credential permanently from instance.

### Request

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| instance | string | No | Instance identifier |
| id | string | Yes | Credential ID to delete |

### Code Example

```typescript
await callTool('delete_credential', {
  instance: 'staging',
  id: 'cred_test123'
});

console.log('Credential deleted successfully');
```

**Warning:**
- Deletion is permanent and cannot be undone
- Workflows using this credential will fail
- Remove credential references from workflows first

---

## list_credentials

**Status:** ❌ Blocked by n8n API for security

### Security Guidance

This operation is intentionally blocked by n8n's REST API to prevent credential exposure.

**What Happens:**

```typescript
const response = await callTool('list_credentials', {
  instance: 'production'
});

// Returns security guidance, not credentials
```

**Response:**

```json
{
  "message": "Credential listing is blocked by n8n API for security.",
  "reason": "Credentials are encrypted and should only be managed through n8n UI",
  "recommendation": "Use n8n web interface to view and manage credentials",
  "alternatives": [
    "View credentials in n8n UI: Settings → Credentials",
    "Track credential IDs during creation",
    "Use credential references by ID in workflows"
  ]
}
```

---

## get_credential

**Status:** ❌ Blocked by n8n API for security

### Security Guidance

This operation is intentionally blocked to prevent credential data exposure.

**What Happens:**

```typescript
const response = await callTool('get_credential', {
  id: 'cred_123',
  instance: 'production'
});

// Returns security guidance, not credential data
```

**Alternatives:**

1. **View in n8n UI:** Settings → Credentials → Select credential
2. **Track During Creation:** Store credential IDs when created
3. **Reference by ID:** Use credential ID in workflow nodes

---

## Best Practices

### 1. Never Hardcode Credentials

```typescript
// ❌ Bad: Hardcoded credentials in code
const cred = await callTool('create_credential', {
  type: 'httpBasicAuth',
  data: {
    user: 'admin',
    password: 'password123'  // NEVER do this!
  }
});

// ✅ Good: Use environment variables
const cred = await callTool('create_credential', {
  type: 'httpBasicAuth',
  data: {
    user: process.env.API_USER,
    password: process.env.API_PASSWORD
  }
});

// ✅ Good: Load from secure vault
import { getSecret } from './secure-vault';

const cred = await callTool('create_credential', {
  type: 'httpBasicAuth',
  data: {
    user: await getSecret('api_user'),
    password: await getSecret('api_password')
  }
});
```

### 2. Always Use Schema Validation

```typescript
// ✅ Good: Schema-driven creation
async function createValidatedCredential(
  type: string,
  name: string,
  data: Record<string, any>,
  instance?: string
) {
  // Get schema
  const schemaResponse = await callTool('get_credential_schema', {
    type,
    instance
  });
  const schema = JSON.parse(schemaResponse.content[0].text);

  // Validate
  validateCredentialData(data, schema);

  // Create
  return await callTool('create_credential', {
    instance,
    name,
    type,
    data
  });
}

// ❌ Bad: Guessing fields without schema
const cred = await callTool('create_credential', {
  type: 'unknownType',
  data: {
    field1: 'value',  // May be wrong!
    field2: 'value'   // May be missing required fields!
  }
});
```

### 3. Manage Complex Credentials via UI

For OAuth2, JWT, and other complex credential types:

```typescript
// ✅ Recommended: Use n8n UI for complex types
// - OAuth2 with multiple steps
// - JWT with key generation
// - Service accounts with JSON key files
// - SSH keys

// ✅ Good: Use MCP for simple types
// - HTTP Basic Auth
// - API keys
// - Database credentials
// - Simple tokens
```

### 4. Track Credential IDs

```typescript
// ✅ Good: Track credential IDs for reference
const credentialRegistry: Record<string, string> = {};

async function createAndTrackCredential(
  name: string,
  type: string,
  data: Record<string, any>,
  instance?: string
) {
  const response = await callTool('create_credential', {
    instance,
    name,
    type,
    data
  });

  const credential = JSON.parse(response.content[0].text);

  // Track for later reference
  const key = `${instance || 'default'}-${name}`;
  credentialRegistry[key] = credential.id;

  console.log(`Created and tracked: ${key} → ${credential.id}`);

  return credential;
}

// Later: retrieve credential ID
const credId = credentialRegistry['production-API Basic Auth'];
```

### 5. Secure Credential Lifecycle

```typescript
// Complete secure credential lifecycle
async function secureCredentialLifecycle() {
  // 1. Get schema
  const schema = await callTool('get_credential_schema', {
    type: 'httpBasicAuth'
  });

  // 2. Load secrets from secure vault (never hardcode!)
  const secrets = await loadSecretsFromVault();

  // 3. Validate against schema
  validateCredentialData(secrets, schema);

  // 4. Create credential
  const credential = await callTool('create_credential', {
    instance: 'production',
    name: 'Secure API Credentials',
    type: 'httpBasicAuth',
    data: secrets
  });

  // 5. Track credential ID (don't track data!)
  saveCredentialId(credential.id);

  // 6. Clear secrets from memory
  Object.keys(secrets).forEach(key => delete secrets[key]);

  // 7. Use in workflows by reference
  return credential.id;
}
```

---

## Next Steps

- **[Workflows API Reference](workflows-api.md)** - Use credentials in workflows
- **[Tags API Reference](tags-api.md)** - Organize credentials with tags
- **[Security Best Practices](../features/credentials-security.md)** - Credential security guide
- **[API Architecture](overview.md)** - Security architecture details

---

**Document Version:** 1.0
**Last Updated:** January 2025
**Related Epic:** Epic 2 (Credentials API Implementation)
**Security Note:** Always follow security best practices when handling credentials
