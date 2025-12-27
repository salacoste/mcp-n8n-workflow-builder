# Configuration Setup Guide

This guide explains how to configure the n8n MCP Workflow Builder to connect to your n8n instance(s).

---

## Overview

The MCP server supports two configuration methods:

| Method | Use Case | Configuration File |
|--------|----------|-------------------|
| **Single-Instance** | One n8n environment, personal projects | `.env` file |
| **Multi-Instance** | Multiple environments (prod, staging, dev) | `.config.json` file |

**Configuration Priority:** `.config.json` → `.env` → Environment Variables

---

## Getting n8n Credentials

Before configuring the MCP server, you'll need:

1. **n8n Host URL** - The base URL of your n8n instance
2. **n8n API Key** - Authentication key for API access

### Finding Your n8n Host URL

The format depends on your n8n deployment type:

=== "n8n Cloud"

    **Format:** `https://<instance-name>.app.n8n.cloud`

    **Example:** `https://my-company.app.n8n.cloud`

    **How to find:**
    1. Log into your n8n Cloud instance
    2. Look at the browser URL bar
    3. Copy everything up to `.cloud` (do not include `/workflow/` or other paths)

    !!! warning "Important"
        Use only the base URL - do **NOT** include `/api/v1` at the end. The server adds this automatically.

=== "Self-Hosted"

    **Format:** `https://your-domain.com` or `http://localhost:5678`

    **Examples:**
    - Production: `https://n8n.mycompany.com`
    - Development: `http://localhost:5678`
    - Docker: `http://n8n:5678` (internal network)

    **How to find:**
    1. Check your n8n deployment configuration
    2. Use the base URL you configured during installation
    3. For local development, typically `http://localhost:5678`

**URL Normalization:**

The MCP server automatically appends `/api/v1` to your base URL:

```
Your Config:    https://n8n.example.com
Actual API URL: https://n8n.example.com/api/v1
```

---

### Generating n8n API Key

Follow these steps to create an API key in n8n:

#### Step 1: Access n8n Settings

1. Log into your n8n instance
2. Click on your profile icon (bottom left)
3. Select **Settings** from the menu

#### Step 2: Navigate to API Section

1. In Settings, find the **API** tab
2. Click on **API** to open API settings

#### Step 3: Create API Key

1. Click **Create API Key** button
2. Enter a descriptive name (e.g., "MCP Server - Production")
3. Click **Create**

#### Step 4: Copy and Secure the Key

1. **Copy the API key immediately** - it will only be shown once
2. Store it securely (password manager recommended)
3. Never commit API keys to version control

!!! danger "Security Warning"
    - API keys grant full access to your n8n instance
    - Treat them like passwords
    - Rotate keys regularly
    - Use separate keys for different environments

**API Key Format:**

n8n API keys typically look like:
```
n8n_api_1234567890abcdefghijklmnopqrstuvwxyz
```

---

## Single-Instance Configuration

Use this method if you're connecting to just one n8n instance.

### When to Use

- ✅ Personal projects
- ✅ Single environment (only production or only development)
- ✅ Simple use cases
- ✅ Quick testing and prototyping

### Setup Instructions

#### Option 1: Using .env File (Recommended)

Create a `.env` file in your project root:

```bash
# Create .env file
cat > .env << 'EOF'
# n8n Connection Settings
N8N_HOST=https://your-instance.app.n8n.cloud
N8N_API_KEY=your_api_key_here

# MCP Server Settings (Optional)
MCP_PORT=3456
DEBUG=false
EOF
```

**Configuration Variables:**

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `N8N_HOST` | ✅ Yes | n8n base URL (without `/api/v1`) | `https://n8n.example.com` |
| `N8N_API_KEY` | ✅ Yes | n8n API key | `n8n_api_abc123...` |
| `MCP_PORT` | ⬜ No | MCP server port (default: 3456) | `3456` or `58921` |
| `DEBUG` | ⬜ No | Enable debug logging (default: false) | `true` or `false` |

**Example .env File:**

```bash
# n8n Cloud Instance
N8N_HOST=https://my-company.app.n8n.cloud
N8N_API_KEY=n8n_api_1234567890abcdefghijklmnopqrstuvwxyz

# Custom port (optional)
MCP_PORT=58921

# Enable debug mode (optional)
DEBUG=true
```

#### Option 2: System Environment Variables

Alternatively, export environment variables in your shell:

```bash
# Export variables (current shell session only)
export N8N_HOST=https://your-instance.app.n8n.cloud
export N8N_API_KEY=your_api_key_here
export MCP_PORT=3456
export DEBUG=false

# Run MCP server
npx @kernel.salacoste/n8n-workflow-builder
```

**Persistent Environment Variables:**

Add to your shell profile (`~/.bashrc`, `~/.zshrc`, etc.):

```bash
# Add to ~/.bashrc or ~/.zshrc
echo 'export N8N_HOST=https://your-instance.app.n8n.cloud' >> ~/.bashrc
echo 'export N8N_API_KEY=your_api_key_here' >> ~/.bashrc

# Reload shell configuration
source ~/.bashrc
```

---

## Multi-Instance Configuration

Use this method to manage multiple n8n environments from a single MCP server.

### When to Use

- ✅ Multiple environments (production, staging, development)
- ✅ Team collaboration with different instances
- ✅ Testing workflows across environments
- ✅ Environment-specific configurations

### Setup Instructions

Create a `.config.json` file in your project root:

```json
{
  "environments": {
    "production": {
      "n8n_host": "https://prod.app.n8n.cloud",
      "n8n_api_key": "prod_key_here"
    },
    "staging": {
      "n8n_host": "https://staging.app.n8n.cloud",
      "n8n_api_key": "staging_key_here"
    },
    "development": {
      "n8n_host": "http://localhost:5678",
      "n8n_api_key": "dev_key_here"
    }
  },
  "defaultEnv": "development"
}
```

### Configuration Structure

**Top-Level Properties:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `environments` | Object | ✅ Yes | Collection of n8n instances |
| `defaultEnv` | String | ✅ Yes | Default environment identifier |

**Environment Properties:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `n8n_host` | String | ✅ Yes | n8n base URL |
| `n8n_api_key` | String | ✅ Yes | n8n API key |

### Example Configurations

#### Example 1: Production + Development

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

#### Example 2: Full Environment Stack

```json
{
  "environments": {
    "production": {
      "n8n_host": "https://prod.n8n.mycompany.com",
      "n8n_api_key": "n8n_api_prod_xyz789"
    },
    "staging": {
      "n8n_host": "https://staging.n8n.mycompany.com",
      "n8n_api_key": "n8n_api_staging_def456"
    },
    "qa": {
      "n8n_host": "https://qa.n8n.mycompany.com",
      "n8n_api_key": "n8n_api_qa_ghi789"
    },
    "development": {
      "n8n_host": "http://localhost:5678",
      "n8n_api_key": "n8n_api_dev_abc123"
    }
  },
  "defaultEnv": "development"
}
```

### Using Multi-Instance Configuration

When using Claude AI or Cursor IDE, you can specify which instance to use:

**Default Instance (no parameter):**
```
Create a workflow in my default n8n instance
```

**Specific Instance:**
```
Create a workflow in production instance
List workflows from staging
```

All MCP tools accept an optional `instance` parameter to target specific environments.

---

## Advanced Configuration

### Custom MCP Port

If port 3456 is already in use, specify a different port:

=== ".env File"

    ```bash
    MCP_PORT=58921
    ```

=== "Environment Variable"

    ```bash
    export MCP_PORT=58921
    npx @kernel.salacoste/n8n-workflow-builder
    ```

=== "Command Line"

    ```bash
    MCP_PORT=58921 npx @kernel.salacoste/n8n-workflow-builder
    ```

**Recommended Ports:** 49152-65535 (dynamic/private port range)

---

### Debug Mode

Enable detailed logging for troubleshooting:

=== ".env File"

    ```bash
    DEBUG=true
    ```

=== "Environment Variable"

    ```bash
    DEBUG=true npx @kernel.salacoste/n8n-workflow-builder
    ```

**Debug Output Example:**

```
[DEBUG] ConfigLoader: Loading configuration...
[DEBUG] ConfigLoader: .config.json found
[DEBUG] ConfigLoader: 3 environments loaded
[DEBUG] EnvironmentManager: Default environment: development
[DEBUG] N8NApiWrapper: Connecting to http://localhost:5678/api/v1
[DEBUG] MCP Server: Listening on port 3456
```

---

## Configuration Validation

After configuring, verify your setup:

### Step 1: Start the MCP Server

```bash
npx @kernel.salacoste/n8n-workflow-builder
```

**Expected Output:**

```
[MCP Server] Starting n8n Workflow Builder MCP Server v0.9.1...
[MCP Server] Configuration loaded: 1 environment(s)
[MCP Server] Default environment: development
[MCP Server] Listening on stdio (MCP Protocol)
[MCP Server] Ready to accept requests
```

### Step 2: Verify Connection (Optional)

If running in HTTP mode, test the health endpoint:

```bash
curl http://localhost:3456/health
```

**Expected Response:**

```json
{
  "status": "ok",
  "version": "0.9.1",
  "timestamp": "2025-12-27T12:00:00.000Z"
}
```

### Step 3: Test with Claude AI

Integrate with Claude Desktop and try a simple command:

```
List my n8n workflows
```

---

## Troubleshooting

### Connection Failed

**Symptom:**
```
Error: connect ECONNREFUSED
```

**Solutions:**

1. **Verify n8n is running:**
   ```bash
   curl https://your-n8n-instance.com
   ```

2. **Check URL format:**
   - ✅ Correct: `https://n8n.example.com`
   - ❌ Wrong: `https://n8n.example.com/api/v1`

3. **Test API connectivity:**
   ```bash
   curl -H "X-N8N-API-KEY: your_key" \
        https://your-n8n-instance.com/api/v1/workflows
   ```

---

### Invalid API Key

**Symptom:**
```
Error: 401 Unauthorized
```

**Solutions:**

1. **Regenerate API key** in n8n Settings → API
2. **Check for whitespace** in `.env` or `.config.json`:
   ```bash
   # Wrong (has quotes and whitespace)
   N8N_API_KEY=" your_key "

   # Correct (no quotes, no whitespace)
   N8N_API_KEY=your_key
   ```

3. **Verify key format** - should start with `n8n_api_`

---

### Wrong Instance Selected

**Symptom:**
```
Workflows from wrong environment appear
```

**Solutions:**

1. **Check `defaultEnv` in `.config.json`**
2. **Explicitly specify instance** in commands:
   ```
   List workflows from production
   ```

3. **Verify environment names** match your `.config.json`

---

### Configuration Not Loaded

**Symptom:**
```
Error: No configuration found
```

**Solutions:**

1. **Check file location** - must be in project root:
   ```bash
   ls -la .env .config.json
   ```

2. **Check file permissions:**
   ```bash
   chmod 600 .env .config.json
   ```

3. **Validate JSON syntax** in `.config.json`:
   ```bash
   cat .config.json | python -m json.tool
   ```

---

## Security Best Practices

### Protecting API Keys

1. **Never commit credentials** to version control:
   ```bash
   # Add to .gitignore
   echo ".env" >> .gitignore
   echo ".config.json" >> .gitignore
   ```

2. **Use separate keys per environment**
3. **Rotate API keys regularly** (every 90 days recommended)
4. **Use password managers** to store keys securely

### File Permissions

Restrict access to configuration files:

```bash
# Make files readable only by owner
chmod 600 .env .config.json

# Verify permissions
ls -la .env .config.json
# Should show: -rw------- (600)
```

### Environment Variables in CI/CD

For CI/CD pipelines, use encrypted secrets:

=== "GitHub Actions"

    ```yaml
    env:
      N8N_HOST: ${{ secrets.N8N_HOST }}
      N8N_API_KEY: ${{ secrets.N8N_API_KEY }}
    ```

=== "GitLab CI"

    ```yaml
    variables:
      N8N_HOST: ${N8N_HOST}
      N8N_API_KEY: ${N8N_API_KEY}
    ```

---

## Next Steps

After successful configuration:

1. **[Claude Desktop Integration](../quick-start/claude-desktop.md)** - Connect with Claude AI
2. **[First Workflow Tutorial](../quick-start/first-workflow.md)** - Create your first workflow
3. **[Verification & Testing](../quick-start/verification.md)** - Test your setup

---

## Configuration Reference

### Complete .env Example

```bash
# n8n Connection (Required)
N8N_HOST=https://your-instance.app.n8n.cloud
N8N_API_KEY=n8n_api_1234567890abcdefghijklmnopqrstuvwxyz

# MCP Server Settings (Optional)
MCP_PORT=3456
DEBUG=false

# Additional Options (Optional)
# N8N_TIMEOUT=30000
```

### Complete .config.json Example

```json
{
  "environments": {
    "production": {
      "n8n_host": "https://prod.app.n8n.cloud",
      "n8n_api_key": "n8n_api_prod_xyz789"
    },
    "staging": {
      "n8n_host": "https://staging.app.n8n.cloud",
      "n8n_api_key": "n8n_api_staging_def456"
    },
    "development": {
      "n8n_host": "http://localhost:5678",
      "n8n_api_key": "n8n_api_dev_abc123"
    }
  },
  "defaultEnv": "development"
}
```

---

!!! question "Need Help?"
    - [Troubleshooting Guide](../../troubleshooting/error-reference.md)
    - [GitHub Issues](https://github.com/salacoste/mcp-n8n-workflow-builder/issues)
    - [Multi-Instance Documentation](../../multi-instance/configuration.md)
