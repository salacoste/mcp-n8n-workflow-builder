# Credentials Security & Management

Comprehensive guide to credential management tools and security best practices.

---

## Overview

n8n credentials store sensitive authentication data (API keys, passwords, OAuth tokens). The MCP server provides 6 credential management tools with strong security protections.

### Security Model

!!! danger "Security by Design"
    **n8n API blocks credential data retrieval for security:**
    - ✅ Can create credentials
    - ✅ Can delete credentials
    - ✅ Can get credential schemas
    - ❌ **Cannot** list credentials (security block)
    - ❌ **Cannot** read credential data (security block)
    - ❌ **Cannot** update credentials directly (immutability)

### Tools Summary

| Tool | Purpose | Status | Security |
|------|---------|--------|----------|
| `list_credentials` | List credentials | 🚫 Blocked | Security protection |
| `get_credential` | Get credential data | 🚫 Blocked | Security protection |
| `create_credential` | Create new credential | ✅ Allowed | Encrypted storage |
| `update_credential` | Update credential | ⚠️ Guidance | Delete + Create pattern |
| `delete_credential` | Remove credential | ✅ Allowed | Permanent deletion |
| `get_credential_schema` | Get credential schema | ✅ Allowed | Schema only |

---

## get_credential_schema

Retrieve the JSON schema for a specific credential type to understand required fields.

### Purpose

Before creating credentials, get the schema to know what fields are required and their formats.

### Input Parameters

```typescript
{
  credentialType: string;  // Credential type (required)
  instance?: string;       // n8n instance (optional)
}
```

### Common Credential Types

| Type | Purpose | Fields |
|------|---------|--------|
| `httpBasicAuth` | HTTP Basic Authentication | user, password |
| `oAuth2Api` | OAuth 2.0 | authUrl, accessTokenUrl, clientId, clientSecret |
| `apiKey` | Generic API Key | apiKey, apiKeyLocation |
| `postgres` | PostgreSQL Database | host, database, user, password |
| `gmail` | Gmail API | clientId, clientSecret |
| `slackApi` | Slack API | accessToken |

### Usage Example

**Request:** `Show me the schema for httpBasicAuth`

**What Claude does:**
```typescript
get_credential_schema({
  credentialType: "httpBasicAuth"
})
```

**Response:**
```json
{
  "type": "object",
  "properties": {
    "user": {
      "type": "string",
      "description": "Username"
    },
    "password": {
      "type": "string",
      "description": "Password",
      "typeOptions": {
        "password": true
      }
    }
  },
  "required": ["user", "password"]
}
```

---

## create_credential

Create a new credential with encrypted storage.

### Purpose

Store authentication data securely for use in workflows. Data is automatically encrypted by n8n.

### Input Parameters

```typescript
{
  name: string;                    // Credential name (required)
  type: string;                    // Credential type (required)
  data: Record<string, any>;       // Credential data (required)
  nodesAccess?: Array<{            // Node access control (optional)
    nodeType: string;
  }>;
  instance?: string;               // n8n instance (optional)
}
```

### Output Format

```typescript
{
  id: string;
  name: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  nodesAccess: Array<{nodeType: string}>;
}
```

**Note:** `data` field is never returned (security protection)

### Usage Examples

=== "HTTP Basic Auth"

    **Request:**
    ```
    Create httpBasicAuth credential named "API Access"
    with user "admin" and password "secret123"
    ```

    **What Claude does:**
    ```typescript
    create_credential({
      name: "API Access",
      type: "httpBasicAuth",
      data: {
        user: "admin",
        password: "secret123"
      }
    })
    ```

    **Response:**
    ```
    ✅ Successfully created credential!

    Credential Details:
    - ID: cred_abc123
    - Name: API Access
    - Type: httpBasicAuth
    - Created: 2025-12-27

    Security: Data encrypted and stored securely.
    Use this credential in HTTP Request nodes.
    ```

=== "API Key"

    **Request:**
    ```
    Create API key credential for Slack
    ```

    **What Claude does:**
    ```typescript
    // First get schema
    get_credential_schema({ credentialType: "slackApi" })

    // Then create
    create_credential({
      name: "Slack Bot Token",
      type: "slackApi",
      data: {
        accessToken: "xoxb-your-token-here"
      }
    })
    ```

=== "Database Credential"

    **Request:**
    ```
    Create PostgreSQL credential for production database
    ```

    **What Claude does:**
    ```typescript
    create_credential({
      name: "Production DB",
      type: "postgres",
      data: {
        host: "db.example.com",
        port: 5432,
        database: "production",
        user: "dbuser",
        password: "dbpass123",
        ssl: "allow"
      }
    })
    ```

### Credential Data Encryption

!!! info "Automatic Encryption"
    n8n automatically encrypts all credential data:
    - AES-256-CBC encryption
    - Encryption key from `N8N_ENCRYPTION_KEY` environment variable
    - Data never stored or transmitted in plain text
    - Decrypted only when workflow executes

---

## update_credential

Update existing credential using DELETE + CREATE pattern.

### Why DELETE + CREATE?

!!! warning "Immutability by Design"
    n8n credentials are immutable for security:
    - Cannot update credential data directly
    - Prevents accidental exposure
    - Ensures audit trail integrity

### Update Pattern

```typescript
// Step 1: Delete old credential
delete_credential({ id: "old_cred_id" })

// Step 2: Create new credential
create_credential({
  name: "Updated Credential Name",
  type: "credentialType",
  data: {
    // Updated credential data
  }
})
```

### Usage Example

**Request:** `Update credential "API Access" with new password`

**What Claude does:**
```typescript
// Find credential by name (from previous conversation context)
const credId = "cred_abc123"

// Delete old
delete_credential({ id: credId })

// Create new with updated data
create_credential({
  name: "API Access",
  type: "httpBasicAuth",
  data: {
    user: "admin",
    password: "new_password_456"
  }
})
```

**Important:** Workflows using old credential ID will need to be updated.

---

## delete_credential

Permanently remove a credential.

### Purpose

Remove credentials that are no longer needed or need to be replaced.

### Input Parameters

```typescript
{
  id: string;              // Credential ID (required)
  instance?: string;       // n8n instance (optional)
}
```

### Usage Example

**Request:** `Delete credential cred_abc123`

**Response:**
```
✅ Successfully deleted credential (ID: cred_abc123)

Warning: Workflows using this credential will fail until updated.
```

### Safety Checks

!!! danger "Before Deleting"
    1. **Check workflow usage** - Identify workflows using this credential
    2. **Create replacement** - Have new credential ready
    3. **Update workflows** - Assign new credential to workflows
    4. **Test workflows** - Verify workflows work with new credential
    5. **Then delete** - Remove old credential

---

## list_credentials & get_credential

Both tools are **blocked by n8n API** for security.

### Why Blocked?

!!! info "Security Protection"
    **Preventing credential exposure:**
    - Listing credentials could expose credential names
    - Getting credentials would expose sensitive data
    - Even encrypted data should not be retrievable
    - Prevents accidental credential leakage

### What Claude Provides Instead

When you request credential information, Claude provides:

**Educational Guidance:**
```
n8n credentials are protected for security and cannot be listed
or retrieved via API. This prevents accidental exposure of
sensitive authentication data.

To view credentials:
1. Log into n8n web interface
2. Navigate to Credentials section
3. View credentials there

To use credentials in workflows:
- Create credentials via MCP: create_credential
- Reference by ID in workflow nodes
- Credentials automatically decrypted at execution
```

**Alternatives:**
- Use n8n web UI to view credentials
- Create new credentials via MCP
- Delete and recreate to update

---

## Security Best Practices

### Credential Management

!!! tip "Best Practices"
    **Creation:**
    - Use descriptive names (e.g., "Production Slack Bot", not "Cred1")
    - Follow naming convention: `[Environment] [Service] [Purpose]`
    - Document credential usage in workflow descriptions

    **Storage:**
    - Never store credentials in code or config files
    - Use n8n's encrypted storage exclusively
    - Set strong `N8N_ENCRYPTION_KEY` in n8n instance

    **Access Control:**
    - Limit credential access to specific node types if possible
    - Use separate credentials per environment
    - Rotate credentials regularly (90-180 days)

    **Maintenance:**
    - Document which workflows use each credential
    - Test after credential updates
    - Delete unused credentials promptly

### Environment Separation

**Multi-Instance Pattern:**
```typescript
// Production credentials (production instance)
create_credential({
  name: "Production API Key",
  type: "apiKey",
  data: { apiKey: "prod_key" },
  instance: "production"
})

// Staging credentials (staging instance)
create_credential({
  name: "Staging API Key",
  type: "apiKey",
  data: { apiKey: "staging_key" },
  instance: "staging"
})
```

### Credential Rotation

**Rotation Workflow:**
```
1. Create new credential with rotated secret
   → create_credential({ name: "API v2", ... })

2. Update workflows to use new credential
   → update_workflow({ nodes: [...] })

3. Test workflows with new credential
   → Verify executions succeed

4. Delete old credential
   → delete_credential({ id: old_id })
```

---

## Common Credential Types

### HTTP Authentication

**Basic Auth:**
```typescript
create_credential({
  name: "API Basic Auth",
  type: "httpBasicAuth",
  data: {
    user: "username",
    password: "password"
  }
})
```

**API Key:**
```typescript
create_credential({
  name: "API Key",
  type: "apiKey",
  data: {
    apiKey: "your-api-key",
    apiKeyLocation: "header",  // or "query"
    apiKeyName: "X-API-Key"
  }
})
```

**OAuth2:**
```typescript
create_credential({
  name: "OAuth2 App",
  type: "oAuth2Api",
  data: {
    authUrl: "https://auth.example.com/oauth/authorize",
    accessTokenUrl: "https://auth.example.com/oauth/token",
    clientId: "your-client-id",
    clientSecret: "your-client-secret",
    scope: "read write",
    grantType: "authorizationCode"
  }
})
```

### Database Connections

**PostgreSQL:**
```typescript
create_credential({
  name: "PostgreSQL DB",
  type: "postgres",
  data: {
    host: "localhost",
    port: 5432,
    database: "mydb",
    user: "dbuser",
    password: "dbpass",
    ssl: "allow"
  }
})
```

**MySQL:**
```typescript
create_credential({
  name: "MySQL DB",
  type: "mysql",
  data: {
    host: "localhost",
    port: 3306,
    database: "mydb",
    user: "dbuser",
    password: "dbpass"
  }
})
```

### Service Integrations

**Slack:**
```typescript
create_credential({
  name: "Slack Bot",
  type: "slackApi",
  data: {
    accessToken: "xoxb-your-bot-token"
  }
})
```

**Gmail:**
```typescript
create_credential({
  name: "Gmail Account",
  type: "gmailOAuth2",
  data: {
    clientId: "your-client-id",
    clientSecret: "your-client-secret"
  }
})
```

---

## Troubleshooting

### Credential Not Working

**Check:**
1. Credential exists and is properly created
2. Workflow node references correct credential ID
3. Credential type matches node requirements
4. Authentication data is correct
5. Service credentials are valid (not expired)

### Workflow Fails After Credential Update

**Solution:**
1. Credential ID changed (DELETE + CREATE pattern)
2. Update workflow to use new credential ID
3. Verify new credential data is correct
4. Test workflow execution

---

## Next Steps

- [Workflows Management](workflows-management.md) - Use credentials in workflows
- [API Reference](../api/credentials-api.md) - Technical details
- [Error Reference](../troubleshooting/error-reference.md) - Security troubleshooting

---

!!! question "Need Help?"
    - [FAQ](../troubleshooting/faq.md)
    - [GitHub Issues](https://github.com/salacoste/mcp-n8n-workflow-builder/issues)
