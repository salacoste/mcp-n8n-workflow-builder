# Story 5.5: Multi-Instance Documentation & Examples

**Epic:** Epic 5 - Multi-Instance Architecture
**Story Points:** 4
**Priority:** Medium
**Status:** Ready for Implementation
**Estimated Page Count:** 8-10 pages

---

## User Story

**As a** user or developer setting up the n8n MCP server
**I want** comprehensive documentation and practical examples for multi-instance configuration
**So that** I can quickly set up and manage multiple n8n environments with confidence

---

## Story Description

### Current System

With Stories 5.1-5.4 implemented:
- ✅ Multi-instance configuration system functional
- ✅ EnvironmentManager and routing working
- ✅ All tools support instance parameter
- ✅ Testing and validation tools available
- ❌ No centralized user documentation
- ❌ No practical setup examples
- ❌ No troubleshooting guide
- ❌ No best practices documented

### Enhancement

Create comprehensive documentation covering:
- **Quick Start Guide:** Get multi-instance setup running in <10 minutes
- **Configuration Examples:** Production, staging, development setups
- **Deployment Patterns:** Docker, Kubernetes, serverless, local development
- **Migration Guide:** Step-by-step migration from single to multi-instance
- **Troubleshooting:** Common issues and solutions
- **Best Practices:** Security, performance, organization

---

## Acceptance Criteria

### AC1: Quick Start Guide
**Given** a new user wanting multi-instance setup
**When** following the quick start guide
**Then** they should have working configuration in <10 minutes:

#### 1.1 10-Minute Quick Start

**Document:** `docs/quick-start-multi-instance.md`

```markdown
# Multi-Instance Quick Start (10 Minutes)

Get started with multiple n8n environments in under 10 minutes.

## Prerequisites

- Node.js 18+ and npm 7+
- Access to 2+ n8n instances
- n8n API keys for each instance

## Step 1: Install (1 minute)

\`\`\`bash
npm install -g @bmad-labs/mcp-n8n-workflow-builder
\`\`\`

## Step 2: Generate API Keys (2 minutes)

For each n8n instance:

1. Open n8n UI
2. Go to **Settings** → **API**
3. Click **Generate API Key**
4. Copy the key (starts with `n8n_api_...`)

## Step 3: Create Configuration (2 minutes)

Create `.config.json` in your project directory:

\`\`\`json
{
  "environments": {
    "production": {
      "n8n_host": "https://your-prod-instance.app.n8n.cloud",
      "n8n_api_key": "n8n_api_YOUR_PROD_KEY_HERE"
    },
    "staging": {
      "n8n_host": "https://your-staging-instance.app.n8n.cloud",
      "n8n_api_key": "n8n_api_YOUR_STAGING_KEY_HERE"
    }
  },
  "defaultEnv": "staging"
}
\`\`\`

**Important:**
- Use base URL only (no `/api/v1/` suffix)
- Set `defaultEnv` to safest environment (staging/development)
- Keep this file out of version control

## Step 4: Add to .gitignore (1 minute)

\`\`\`bash
echo ".config.json" >> .gitignore
\`\`\`

## Step 5: Validate Configuration (1 minute)

\`\`\`bash
npx @bmad-labs/mcp-n8n-workflow-builder validate
\`\`\`

Expected output:
\`\`\`
✅ Configuration is valid
ℹ️  2 environments configured: production, staging
ℹ️  Default: staging
✓ production: Connected successfully
✓ staging: Connected successfully
\`\`\`

## Step 6: Configure Claude Desktop (3 minutes)

Add to Claude Desktop config:

**macOS/Linux:** `~/.config/claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

\`\`\`json
{
  "mcpServers": {
    "n8n-workflow-builder": {
      "command": "npx",
      "args": ["@bmad-labs/mcp-n8n-workflow-builder"]
    }
  }
}
\`\`\`

## Step 7: Restart Claude Desktop

Restart Claude Desktop to load the MCP server.

## Step 8: Test It! (<1 minute)

In Claude Desktop:

\`\`\`
You: "List workflows from staging"

Claude: I'll list workflows from the staging environment.
[Lists staging workflows]

You: "Now list workflows from production"

Claude: I'll list workflows from production.
[Lists production workflows]
\`\`\`

✅ **Done!** You're now managing multiple n8n environments from Claude Desktop.

## Next Steps

- [Configuration Examples](./configuration-examples.md)
- [Deployment Patterns](./deployment-patterns.md)
- [Best Practices](./best-practices.md)
```

### AC2: Configuration Examples
**Given** different deployment scenarios
**When** users need configuration examples
**Then** they should have templates for common setups:

#### 2.1 Configuration Template Library

**Document:** `docs/configuration-examples.md`

```markdown
# Multi-Instance Configuration Examples

## Example 1: Production + Staging

Classic two-environment setup for safe testing before production deployment.

\`\`\`json
{
  "environments": {
    "production": {
      "n8n_host": "https://prod.company.com",
      "n8n_api_key": "n8n_api_prod_xxxxxxxxx"
    },
    "staging": {
      "n8n_host": "https://staging.company.com",
      "n8n_api_key": "n8n_api_staging_xxxxxxxxx"
    }
  },
  "defaultEnv": "staging"
}
\`\`\`

**Use Case:** Test workflows in staging before deploying to production

**Workflow:**
1. Create workflow in staging
2. Test thoroughly
3. Export from staging
4. Import to production
5. Activate in production

---

## Example 2: Multi-Region Production

Different n8n instances per geographic region.

\`\`\`json
{
  "environments": {
    "production-us-east": {
      "n8n_host": "https://us-east.n8n.company.com",
      "n8n_api_key": "n8n_api_us_east_xxxxxxxxx"
    },
    "production-eu-west": {
      "n8n_host": "https://eu-west.n8n.company.com",
      "n8n_api_key": "n8n_api_eu_west_xxxxxxxxx"
    },
    "production-ap-southeast": {
      "n8n_host": "https://ap-southeast.n8n.company.com",
      "n8n_api_key": "n8n_api_ap_southeast_xxxxxxxxx"
    }
  },
  "defaultEnv": "production-us-east"
}
\`\`\`

**Use Case:** Manage region-specific workflows and comply with data residency

---

## Example 3: Development → Staging → Production

Full DTAP (Development, Testing, Acceptance, Production) pipeline.

\`\`\`json
{
  "environments": {
    "development": {
      "n8n_host": "http://localhost:5678",
      "n8n_api_key": "n8n_api_dev_local_xxxxxxxxx"
    },
    "testing": {
      "n8n_host": "https://test.company.com",
      "n8n_api_key": "n8n_api_test_xxxxxxxxx"
    },
    "staging": {
      "n8n_host": "https://staging.company.com",
      "n8n_api_key": "n8n_api_staging_xxxxxxxxx"
    },
    "production": {
      "n8n_host": "https://prod.company.com",
      "n8n_api_key": "n8n_api_prod_xxxxxxxxx"
    }
  },
  "defaultEnv": "development"
}
\`\`\`

**Promotion Workflow:**
```
Development → Testing → Staging → Production
   (local)     (auto)    (manual)   (approved)
```

---

## Example 4: Customer-Specific Instances

Separate n8n instance per customer (multi-tenant SaaS).

\`\`\`json
{
  "environments": {
    "customer-acme": {
      "n8n_host": "https://acme.workflows.company.com",
      "n8n_api_key": "n8n_api_acme_xxxxxxxxx"
    },
    "customer-globex": {
      "n8n_host": "https://globex.workflows.company.com",
      "n8n_api_key": "n8n_api_globex_xxxxxxxxx"
    },
    "customer-initech": {
      "n8n_host": "https://initech.workflows.company.com",
      "n8n_api_key": "n8n_api_initech_xxxxxxxxx"
    }
  },
  "defaultEnv": "customer-acme"
}
\`\`\`

**Use Case:** Manage customer-specific workflows and maintain data isolation

---

## Example 5: Environment Variables (Secrets Management)

Configuration with environment variable overrides for CI/CD.

**.config.json (template committed to git):**
\`\`\`json
{
  "environments": {
    "production": {
      "n8n_host": "https://prod.company.com",
      "n8n_api_key": "will_be_overridden_by_env_var"
    },
    "staging": {
      "n8n_host": "https://staging.company.com",
      "n8n_api_key": "will_be_overridden_by_env_var"
    }
  },
  "defaultEnv": "staging"
}
\`\`\`

**Environment Variables (secrets vault):**
\`\`\`bash
export N8N_PRODUCTION_API_KEY="n8n_api_prod_secret_from_vault"
export N8N_STAGING_API_KEY="n8n_api_staging_secret_from_vault"
\`\`\`

**Use Case:** Keep secrets out of configuration files in version control
```

### AC3: Deployment Patterns Documentation
**Given** different deployment environments
**When** users deploy the MCP server
**Then** they should have deployment pattern examples:

#### 3.1 Deployment Patterns Guide

**Document:** `docs/deployment-patterns.md`

```markdown
# Multi-Instance Deployment Patterns

## Pattern 1: Docker Compose

Perfect for local development and small deployments.

**docker-compose.yml:**
\`\`\`yaml
version: '3.8'

services:
  mcp-n8n-server:
    image: node:18
    working_dir: /app
    command: npx @bmad-labs/mcp-n8n-workflow-builder
    environment:
      # Override configuration via environment variables
      N8N_PRODUCTION_HOST: http://n8n-prod:5678
      N8N_PRODUCTION_API_KEY: \${PROD_API_KEY}
      N8N_STAGING_HOST: http://n8n-staging:5678
      N8N_STAGING_API_KEY: \${STAGING_API_KEY}
      N8N_DEFAULT_ENV: staging
    volumes:
      - ./config.json:/app/.config.json:ro
    networks:
      - n8n-network

  n8n-prod:
    image: n8nio/n8n
    environment:
      N8N_PORT: 5678
    networks:
      - n8n-network

  n8n-staging:
    image: n8nio/n8n
    environment:
      N8N_PORT: 5678
    networks:
      - n8n-network

networks:
  n8n-network:
    driver: bridge
\`\`\`

**.env file:**
\`\`\`bash
PROD_API_KEY=n8n_api_prod_xxxxxxxxx
STAGING_API_KEY=n8n_api_staging_xxxxxxxxx
\`\`\`

**Start:**
\`\`\`bash
docker-compose up -d
\`\`\`

---

## Pattern 2: Kubernetes

Production-grade deployment with secrets management.

**configmap.yaml:**
\`\`\`yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: n8n-mcp-config
data:
  config.json: |
    {
      "environments": {
        "production": {
          "n8n_host": "http://n8n-prod-service:5678",
          "n8n_api_key": "placeholder"
        },
        "staging": {
          "n8n_host": "http://n8n-staging-service:5678",
          "n8n_api_key": "placeholder"
        }
      },
      "defaultEnv": "staging"
    }
\`\`\`

**secret.yaml:**
\`\`\`yaml
apiVersion: v1
kind: Secret
metadata:
  name: n8n-api-keys
type: Opaque
stringData:
  prod-key: "n8n_api_prod_xxxxxxxxx"
  staging-key: "n8n_api_staging_xxxxxxxxx"
\`\`\`

**deployment.yaml:**
\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: n8n-mcp-server
spec:
  replicas: 2
  selector:
    matchLabels:
      app: n8n-mcp-server
  template:
    metadata:
      labels:
        app: n8n-mcp-server
    spec:
      containers:
      - name: mcp-server
        image: node:18
        command: ["npx", "@bmad-labs/mcp-n8n-workflow-builder"]
        env:
        - name: N8N_PRODUCTION_API_KEY
          valueFrom:
            secretKeyRef:
              name: n8n-api-keys
              key: prod-key
        - name: N8N_STAGING_API_KEY
          valueFrom:
            secretKeyRef:
              name: n8n-api-keys
              key: staging-key
        volumeMounts:
        - name: config
          mountPath: /app/.config.json
          subPath: config.json
      volumes:
      - name: config
        configMap:
          name: n8n-mcp-config
\`\`\`

---

## Pattern 3: AWS Lambda (Serverless)

Serverless deployment with AWS Secrets Manager.

**handler.js:**
\`\`\`javascript
const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");
const fs = require('fs');

async function loadConfigFromSecrets() {
  const client = new SecretsManagerClient({ region: 'us-east-1' });

  // Load secrets
  const prodSecretResponse = await client.send(
    new GetSecretValueCommand({ SecretId: 'n8n-mcp/production' })
  );
  const stagingSecretResponse = await client.send(
    new GetSecretValueCommand({ SecretId: 'n8n-mcp/staging' })
  );

  const prodSecret = JSON.parse(prodSecretResponse.SecretString);
  const stagingSecret = JSON.parse(stagingSecretResponse.SecretString);

  // Generate config
  const config = {
    environments: {
      production: {
        n8n_host: prodSecret.host,
        n8n_api_key: prodSecret.api_key
      },
      staging: {
        n8n_host: stagingSecret.host,
        n8n_api_key: stagingSecret.api_key
      }
    },
    defaultEnv: 'staging'
  };

  // Write to /tmp (Lambda writeable directory)
  fs.writeFileSync('/tmp/.config.json', JSON.stringify(config));
  process.chdir('/tmp');
}

exports.handler = async (event) => {
  await loadConfigFromSecrets();

  // Start MCP server
  const { startMCPServer } = require('@bmad-labs/mcp-n8n-workflow-builder');
  return await startMCPServer(event);
};
\`\`\`

---

## Pattern 4: Local Development

Simple setup for development with local n8n instance.

**.config.json:**
\`\`\`json
{
  "environments": {
    "local": {
      "n8n_host": "http://localhost:5678",
      "n8n_api_key": "n8n_api_local_dev_key"
    },
    "staging": {
      "n8n_host": "https://staging.company.com",
      "n8n_api_key": "n8n_api_staging_xxxxxxxxx"
    }
  },
  "defaultEnv": "local"
}
\`\`\`

**Start local n8n:**
\`\`\`bash
docker run -it --rm \\
  --name n8n \\
  -p 5678:5678 \\
  -v ~/.n8n:/home/node/.n8n \\
  n8nio/n8n
\`\`\`

**Start MCP server:**
\`\`\`bash
npm start
\`\`\`

---

## Choosing a Deployment Pattern

| Pattern | Best For | Complexity | Scalability |
|---------|----------|------------|-------------|
| Docker Compose | Local dev, small teams | Low | Low |
| Kubernetes | Production, large scale | High | High |
| AWS Lambda | Serverless, event-driven | Medium | Auto |
| Local Development | Testing, experimentation | Very Low | N/A |
```

### AC4: Migration Guide
**Given** existing single-instance users
**When** migrating to multi-instance
**Then** they should have step-by-step migration guide:

#### 4.1 Migration Guide

**Document:** `docs/migration-single-to-multi.md`

```markdown
# Migrating from Single to Multi-Instance

Step-by-step guide to migrate from `.env` to `.config.json` multi-instance setup.

## Prerequisites

- Existing working `.env` configuration
- Backup of current `.env` file
- Access to additional n8n instances (if adding more environments)

## Step 1: Backup Current Configuration (1 minute)

\`\`\`bash
# Backup .env file
cp .env .env.backup

# Verify MCP server works
npm start
# (Ctrl+C to stop after verification)
\`\`\`

## Step 2: Generate .config.json from .env (2 minutes)

**Option A: Automatic Migration Script**

\`\`\`bash
npx @bmad-labs/mcp-n8n-workflow-builder migrate
\`\`\`

This creates `.config.json` from your `.env` file automatically.

**Option B: Manual Migration**

1. Read your `.env` file:
\`\`\`bash
cat .env
# N8N_HOST=https://n8n.example.com
# N8N_API_KEY=n8n_api_xxxxxxxxx
\`\`\`

2. Create `.config.json`:
\`\`\`json
{
  "environments": {
    "production": {
      "n8n_host": "https://n8n.example.com",
      "n8n_api_key": "n8n_api_xxxxxxxxx"
    }
  },
  "defaultEnv": "production"
}
\`\`\`

## Step 3: Validate New Configuration (1 minute)

\`\`\`bash
npm run validate-config
\`\`\`

Expected output:
\`\`\`
✅ Configuration is valid
ℹ️  1 environment configured: production
✓ production: Connected successfully
\`\`\`

## Step 4: Test MCP Server (2 minutes)

\`\`\`bash
npm start
\`\`\`

In Claude Desktop, test:
\`\`\`
You: "List workflows"

Claude: I'll list workflows from production (default).
[Should show same workflows as before]
\`\`\`

## Step 5: Add Additional Environments (Optional, 3 minutes)

Add staging or development environments:

\`\`\`json
{
  "environments": {
    "production": {
      "n8n_host": "https://n8n.example.com",
      "n8n_api_key": "n8n_api_prod_xxxxxxxxx"
    },
    "staging": {
      "n8n_host": "https://staging.example.com",
      "n8n_api_key": "n8n_api_staging_xxxxxxxxx"
    }
  },
  "defaultEnv": "staging"
}
\`\`\`

## Step 6: Update .gitignore (1 minute)

\`\`\`bash
# Add .config.json to .gitignore
echo ".config.json" >> .gitignore

# Verify
cat .gitignore | grep .config.json
\`\`\`

## Step 7: Remove .env (Optional)

Once `.config.json` works correctly:

\`\`\`bash
# Keep backup
mv .env .env.backup

# Or remove completely
# rm .env
\`\`\`

## Step 8: Update Documentation

Update your team documentation to reference `.config.json` instead of `.env`.

## Rollback (If Needed)

If something goes wrong:

\`\`\`bash
# Restore .env
cp .env.backup .env

# Remove .config.json
rm .config.json

# Restart MCP server
npm start
\`\`\`

## Troubleshooting

**Issue:** Configuration not loading

**Solution:** Ensure `.config.json` has correct JSON syntax:
\`\`\`bash
cat .config.json | json_pp
\`\`\`

**Issue:** API key not working

**Solution:** Verify API key copied correctly from n8n UI

**Issue:** /api/v1 error

**Solution:** Remove `/api/v1` from `n8n_host` in `.config.json`

---

## Migration Checklist

- [ ] Backup `.env` file
- [ ] Create `.config.json` (auto or manual)
- [ ] Validate configuration
- [ ] Test MCP server
- [ ] Add additional environments (optional)
- [ ] Update `.gitignore`
- [ ] Update team documentation
- [ ] Remove old `.env` file
```

### AC5: Troubleshooting Guide
**Given** common multi-instance issues
**When** users encounter problems
**Then** they should have solutions:

#### 5.1 Troubleshooting Guide

**Document:** `docs/troubleshooting-multi-instance.md`

```markdown
# Multi-Instance Troubleshooting Guide

## Issue: Configuration Not Found

**Symptoms:**
\`\`\`
Error: No configuration found. Please create .config.json or .env file
\`\`\`

**Solutions:**

1. **Check file exists:**
\`\`\`bash
ls -la | grep -E '\.config\.json|\.env'
\`\`\`

2. **Check working directory:**
\`\`\`bash
pwd
# Should be project root with .config.json
\`\`\`

3. **Create configuration:**
\`\`\`bash
# Use template
cp .config.template.json .config.json
# Edit with your values
\`\`\`

---

## Issue: Instance Not Found

**Symptoms:**
\`\`\`
Error: Instance "production" not found. Available: staging, development
\`\`\`

**Solutions:**

1. **Check instance name spelling:**
\`\`\`json
// Correct
{ "instance": "production" }

// Incorrect (typo)
{ "instance": "proudction" }
\`\`\`

2. **List available instances:**
\`\`\`bash
npm run validate-config
# Shows: Available instances: production, staging
\`\`\`

3. **Add missing instance to .config.json:**
\`\`\`json
{
  "environments": {
    "production": { ... }  // Add this
  }
}
\`\`\`

---

## Issue: API Connection Failed

**Symptoms:**
\`\`\`
Error: API call failed for instance "production": Request timeout
\`\`\`

**Solutions:**

1. **Test n8n instance directly:**
\`\`\`bash
curl https://your-n8n.com/api/v1/workflows?limit=1 \\
  -H "X-N8N-API-KEY: your_key"
\`\`\`

2. **Check n8n is running:**
- Open n8n UI in browser
- Verify accessible at configured URL

3. **Verify API key:**
- Generate new API key in n8n UI
- Update .config.json with new key

4. **Check network/firewall:**
- VPN required?
- Firewall blocking requests?
- Proxy configuration needed?

---

## Issue: Wrong Instance Used

**Symptoms:**
\`\`\`
Expected production data but got staging data
\`\`\`

**Solutions:**

1. **Check default environment:**
\`\`\`json
{
  "defaultEnv": "staging"  // ← This is used when instance not specified
}
\`\`\`

2. **Explicitly specify instance:**
\`\`\`json
{
  "instance": "production",  // Always specify for clarity
  ...
}
\`\`\`

3. **Verify instance in response:**
Look for instance indicator in MCP responses:
\`\`\`
✅ list_workflows successful
Instance: staging (default)  // ← Shows which instance was used
\`\`\`

---

## Issue: Configuration Validation Errors

**Symptoms:**
\`\`\`
Error: Environment "production" missing: n8n_host
\`\`\`

**Solutions:**

Check for common JSON errors:

\`\`\`json
// ❌ Missing comma
{
  "n8n_host": "https://n8n.com"
  "n8n_api_key": "key"  // Missing comma above!
}

// ✅ Correct
{
  "n8n_host": "https://n8n.com",
  "n8n_api_key": "key"
}

// ❌ Trailing comma
{
  "environments": {
    "production": {...},  // Trailing comma not allowed
  }
}

// ✅ Correct
{
  "environments": {
    "production": {...}  // No trailing comma
  }
}
\`\`\`

**Validate JSON syntax:**
\`\`\`bash
cat .config.json | json_pp
\`\`\`

---

## Issue: /api/v1 URL Error

**Symptoms:**
\`\`\`
Error: n8n_host must not include /api/v1 suffix
\`\`\`

**Solution:**

\`\`\`json
// ❌ Incorrect
{
  "n8n_host": "https://n8n.example.com/api/v1/"
}

// ✅ Correct
{
  "n8n_host": "https://n8n.example.com"
}
\`\`\`

The MCP server automatically appends `/api/v1` internally.

---

## Getting Help

1. **Run validation:**
\`\`\`bash
npm run validate-config
\`\`\`

2. **Check logs:**
MCP server logs to stderr (visible in Claude Desktop developer tools)

3. **Report issue:**
https://github.com/your-org/mcp-n8n-workflow-builder/issues

Include:
- `.config.json` (redact API keys!)
- Error messages
- MCP server version
- n8n version
```

---

## Technical Implementation Notes

### Documentation Structure

```
docs/
├── quick-start-multi-instance.md
├── configuration-examples.md
├── deployment-patterns.md
├── migration-single-to-multi.md
├── troubleshooting-multi-instance.md
└── best-practices-multi-instance.md
```

### Documentation Standards

- **Clarity:** Step-by-step instructions
- **Examples:** Real code, not pseudo-code
- **Completeness:** Cover common scenarios
- **Searchability:** Clear headers and keywords
- **Maintainability:** Version-specific notes

---

## Dependencies

### Upstream Dependencies
- Stories 5.1-5.4 (All multi-instance features)
- Epic 4 (Tools documentation for reference)

### Downstream Dependencies
- Epic 6 (Examples & Tutorials) - Uses these docs as foundation
- Epic 8 (Deployment) - References deployment patterns

---

## Definition of Done

### Documentation Completeness
- [ ] Quick Start Guide (<10 minutes to working setup)
- [ ] 5+ configuration examples for common scenarios
- [ ] 4+ deployment pattern examples
- [ ] Step-by-step migration guide
- [ ] Troubleshooting guide with 10+ common issues

### Quality Standards
- [ ] Technical review by development team
- [ ] User testing with new users (<10 min completion)
- [ ] All code examples tested and verified
- [ ] Screenshots and diagrams where helpful

### Publication
- [ ] Published to GitHub Pages
- [ ] Linked from main README
- [ ] Search engine optimized
- [ ] Version-controlled

---

## Estimation Breakdown

**Story Points:** 4

**Effort Distribution:**
- Quick Start Guide: 0.5 SP
- Configuration Examples: 0.75 SP
- Deployment Patterns: 1 SP
- Migration Guide: 0.75 SP
- Troubleshooting Guide: 1 SP

**Page Count:** 8-10 pages

**Estimated Duration:** 2 days (1 technical writer or developer)

---

## Notes

### Success Metrics
- 90%+ users complete quick start in <10 minutes
- 80%+ find solutions in troubleshooting guide
- Migration guide used successfully by 95%+ users
- Deployment pattern examples work without modification

### Best Practices
- ✅ Test all examples before publishing
- ✅ Keep documentation version-specific
- ✅ Include troubleshooting for every feature
- ✅ Provide copy-paste-ready examples
- ✅ Link related documentation sections

---

**Status:** Ready for Implementation
**Related Files:**
- `docs/quick-start-multi-instance.md`
- `docs/configuration-examples.md`
- `docs/deployment-patterns.md`
- `docs/migration-single-to-multi.md`
- `docs/troubleshooting-multi-instance.md`
