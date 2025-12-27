# Multi-Instance Overview

Learn how to manage multiple n8n environments (production, staging, development) from a single MCP server.

---

## What is Multi-Instance?

Multi-instance support allows you to connect to and manage multiple n8n environments simultaneously:

- **Production** - Live workflows serving real users
- **Staging** - Pre-production testing environment
- **Development** - Local development and experimentation
- **Custom** - Any additional environments (QA, UAT, demo, etc.)

### Single vs Multi-Instance

=== "Single-Instance"

    **Configuration:** `.env` file

    ```bash
    N8N_HOST=https://n8n.example.com
    N8N_API_KEY=your_key
    ```

    **Use Case:**
    - Personal projects
    - Single environment
    - Simple setups

=== "Multi-Instance"

    **Configuration:** `.config.json` file

    ```json
    {
      "environments": {
        "production": {
          "n8n_host": "https://prod.n8n.example.com",
          "n8n_api_key": "prod_key"
        },
        "staging": {
          "n8n_host": "https://staging.n8n.example.com",
          "n8n_api_key": "staging_key"
        },
        "development": {
          "n8n_host": "http://localhost:5678",
          "n8n_api_key": "dev_key"
        }
      },
      "defaultEnv": "development"
    }
    ```

    **Use Case:**
    - Team collaboration
    - Multiple environments
    - Professional workflows

---

## Benefits

### 1. Environment Isolation

**Test safely:**
- Develop workflows in development
- Test in staging
- Deploy to production
- No risk to production data

### 2. Team Collaboration

**Separate concerns:**
- Developers: work in development
- QA: test in staging
- Ops: manage production
- Each team member uses appropriate environment

### 3. Workflow Promotion

**Lifecycle management:**
```
Development → Staging → Production

1. Create workflow in dev
2. Test in dev
3. Clone to staging
4. QA validation in staging
5. Deploy to production
6. Monitor in production
```

### 4. Simplified Management

**Single interface:**
- One Claude Desktop configuration
- One MCP server instance
- Manage all environments
- Switch between instances easily

---

## Architecture

### Configuration Hierarchy

```
.config.json (primary)
    ↓
EnvironmentManager (singleton)
    ↓
N8NApiWrapper (per instance)
    ↓
n8n REST API (per environment)
```

### Component Roles

**ConfigLoader:**
- Discovers and loads configuration
- Supports `.config.json` and `.env`
- Validates structure
- Priority: `.config.json` > `.env` > environment variables

**EnvironmentManager:**
- Singleton pattern
- Manages multiple API instances
- Routes requests to correct environment
- Caches connections for performance

**N8NApiWrapper:**
- One instance per environment
- Encapsulates n8n REST API
- Handles authentication
- Provides unified interface

---

## How It Works

### Request Flow

```
Claude: "List workflows in production"
    ↓
MCP Server receives request
    ↓
Parse instance parameter: "production"
    ↓
EnvironmentManager.getInstance()
    ↓
Route to production N8NApiWrapper
    ↓
GET https://prod.n8n.example.com/api/v1/workflows
    ↓
Return workflows from production
```

### Default Instance

If no instance specified, uses `defaultEnv`:

```
Claude: "List workflows"
    ↓
No instance parameter
    ↓
Use defaultEnv from .config.json
    ↓
Route to default environment
```

### Instance Discovery

Claude AI automatically discovers available instances:

```
User: "What n8n instances do you have?"

Claude reads .config.json:
- production (default)
- staging
- development

Response: Lists all 3 instances
```

---

## Use Cases

### Development Workflow

```
1. Create workflow in development
   → "Create workflow in development"

2. Test locally
   → "List executions from development"

3. Promote to staging
   → "Clone workflow 5 from development to staging"

4. QA testing in staging
   → "Activate workflow in staging"

5. Deploy to production
   → "Clone workflow from staging to production"
```

### Multi-Team Setup

**Developer Team:**
- Primary: `development` instance
- Testing: Local n8n (localhost:5678)
- Push to staging when ready

**QA Team:**
- Primary: `staging` instance
- Validate workflows
- Approve for production

**Operations Team:**
- Primary: `production` instance
- Monitor executions
- Manage live workflows

### Geographic Distribution

```json
{
  "environments": {
    "us-east": {
      "n8n_host": "https://n8n-us-east.example.com",
      "n8n_api_key": "us_east_key"
    },
    "eu-west": {
      "n8n_host": "https://n8n-eu-west.example.com",
      "n8n_api_key": "eu_west_key"
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

## Migration Path

### From Single to Multi-Instance

**Step 1: Current Setup (Single)**

```bash
# .env
N8N_HOST=https://n8n.example.com
N8N_API_KEY=your_key
```

**Step 2: Create Multi-Instance Config**

```bash
# Create .config.json
cat > .config.json << 'EOF'
{
  "environments": {
    "production": {
      "n8n_host": "https://n8n.example.com",
      "n8n_api_key": "your_key"
    }
  },
  "defaultEnv": "production"
}
EOF
```

**Step 3: Test**

```
List workflows
# Should work exactly as before
```

**Step 4: Add More Environments**

```json
{
  "environments": {
    "production": {
      "n8n_host": "https://n8n.example.com",
      "n8n_api_key": "prod_key"
    },
    "development": {
      "n8n_host": "http://localhost:5678",
      "n8n_api_key": "dev_key"
    }
  },
  "defaultEnv": "development"
}
```

**Step 5: Remove .env**

```bash
# Backup first
cp .env .env.backup

# Remove (optional, .config.json takes priority anyway)
rm .env
```

---

## Configuration Priority

```
.config.json (highest priority)
    ↓
.env file
    ↓
Environment variables (lowest priority)
```

**Why this order:**
- `.config.json` enables multi-instance
- `.env` for backward compatibility
- Environment variables for CI/CD or Docker

---

## Next Steps

- **[Configuration Guide](configuration.md)** - Detailed configuration instructions
- **[Environment Manager](environment-manager.md)** - Architecture details
- **[Instance Routing](instance-routing.md)** - How routing works
- **[Testing Guide](testing.md)** - Validate multi-instance setup
- **[Examples](examples.md)** - Real-world scenarios

---

!!! success "Why Multi-Instance?"
    Multi-instance support provides professional workflow management with environment isolation, team collaboration, and safe testing practices.
