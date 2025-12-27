# Multi-Instance Configuration

Detailed guide for configuring multiple n8n environments.

---

## Configuration File Format

### .config.json Structure

```json
{
  "environments": {
    "[env-name]": {
      "n8n_host": "https://n8n-url.com",
      "n8n_api_key": "api-key"
    }
  },
  "defaultEnv": "[env-name]"
}
```

### Field Specifications

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `environments` | Object | ✅ Yes | Collection of n8n instances |
| `defaultEnv` | String | ✅ Yes | Default environment identifier |
| `environments.[name]` | Object | ✅ Yes | Individual environment config |
| `n8n_host` | String | ✅ Yes | n8n base URL (no `/api/v1`) |
| `n8n_api_key` | String | ✅ Yes | n8n API authentication key |

---

## Configuration Examples

### Example 1: Dev + Prod

```json
{
  "environments": {
    "production": {
      "n8n_host": "https://n8n.mycompany.com",
      "n8n_api_key": "n8n_api_prod_xyz789"
    },
    "development": {
      "n8n_host": "http://localhost:5678",
      "n8n_api_key": "n8n_api_dev_abc123"
    }
  },
  "defaultEnv": "development"
}
```

### Example 2: Full Stack

```json
{
  "environments": {
    "production": {
      "n8n_host": "https://prod.n8n.example.com",
      "n8n_api_key": "prod_key_here"
    },
    "staging": {
      "n8n_host": "https://staging.n8n.example.com",
      "n8n_api_key": "staging_key_here"
    },
    "qa": {
      "n8n_host": "https://qa.n8n.example.com",
      "n8n_api_key": "qa_key_here"
    },
    "development": {
      "n8n_host": "http://localhost:5678",
      "n8n_api_key": "dev_key_here"
    }
  },
  "defaultEnv": "development"
}
```

### Example 3: Geographic Distribution

```json
{
  "environments": {
    "us-east": {
      "n8n_host": "https://n8n-us.example.com",
      "n8n_api_key": "us_key"
    },
    "eu-west": {
      "n8n_host": "https://n8n-eu.example.com",
      "n8n_api_key": "eu_key"
    },
    "asia-pacific": {
      "n8n_host": "https://n8n-apac.example.com",
      "n8n_api_key": "apac_key"
    }
  },
  "defaultEnv": "us-east"
}
```

---

## Environment Naming

### Best Practices

**Standard Names:**
- `production` - Live environment
- `staging` - Pre-production testing
- `development` - Local development
- `qa` - Quality assurance testing

**Custom Names:**
- `demo` - Demo/showcase environment
- `backup` - Backup instance
- `migration` - Migration testing
- Geographic: `us-east`, `eu-west`

**Naming Rules:**
- Use lowercase
- Use hyphens, not underscores: `us-east` not `us_east`
- Be descriptive: `production-eu` not `prod1`
- Avoid special characters

---

## Configuration Validation

### Startup Validation

On server start, configuration is validated:

```
✅ Configuration loaded: 3 environment(s)
✅ Default environment: development
✅ Environments:
   - production: https://prod.n8n.example.com
   - staging: https://staging.n8n.example.com
   - development: http://localhost:5678
```

### Runtime Validation

When tools are invoked:

```typescript
// Valid instance
list_workflows({ instance: "production" })
→ Routes to production

// Invalid instance
list_workflows({ instance: "nonexistent" })
→ Error: Instance 'nonexistent' not found.
   Available: production, staging, development
```

---

## Security Best Practices

### API Key Management

!!! danger "Never Commit .config.json"
    ```bash
    # Add to .gitignore
    echo ".config.json" >> .gitignore

    # Verify
    git status
    # .config.json should NOT appear
    ```

### Separate Keys Per Environment

```json
{
  "environments": {
    "production": {
      "n8n_api_key": "PROD_KEY_DIFFERENT"
    },
    "development": {
      "n8n_api_key": "DEV_KEY_DIFFERENT"
    }
  }
}
```

**Benefits:**
- Limit blast radius if key compromised
- Easy key rotation per environment
- Environment-specific permissions

### File Permissions

```bash
# Restrict access
chmod 600 .config.json

# Verify
ls -la .config.json
# Should show: -rw------- (600)
```

---

## Troubleshooting

### Configuration Not Loaded

**Symptom:** Server uses .env instead of .config.json

**Solution:**
```bash
# Verify .config.json exists
ls -la .config.json

# Check JSON syntax
cat .config.json | python3 -m json.tool

# Restart server
npx @kernel.salacoste/n8n-workflow-builder
```

### Instance Not Found

**Symptom:** "Instance 'staging' not found"

**Solution:**
1. Check environment name in .config.json
2. Verify exact spelling (case-sensitive)
3. List available instances in config
4. Use correct instance name

### Wrong Default Instance

**Symptom:** Commands use wrong environment by default

**Solution:**
```json
{
  "defaultEnv": "development"  // Change this
}
```

---

## Next Steps

- [Environment Manager](environment-manager.md) - Architecture details
- [Instance Routing](instance-routing.md) - How routing works
- [Testing](testing.md) - Validate configuration
- [Examples](examples.md) - Real-world setups

---

!!! tip "Quick Start"
    See [Installation Guide](../getting-started/installation/configuration.md) for step-by-step configuration instructions.
