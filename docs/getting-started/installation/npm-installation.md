# NPM Installation Guide

This guide walks you through installing the n8n MCP Workflow Builder via npm, the recommended installation method for most users.

---

## Prerequisites

Before installing, ensure your system meets the following requirements:

### System Requirements

| Component | Minimum Version | Recommended Version |
|-----------|----------------|---------------------|
| **Node.js** | 14.0.0 | 18.x or 20.x |
| **npm** | 7.0.0 | 9.x or 10.x |
| **Operating System** | macOS, Linux, Windows WSL2 | Latest stable release |

### Verification Commands

Check your installed versions:

```bash
# Check Node.js version
node --version
# Expected output: v14.x.x or higher (v18.x.x or v20.x.x recommended)

# Check npm version
npm --version
# Expected output: 7.x.x or higher (9.x.x or 10.x.x recommended)
```

!!! tip "Version Check"
    If your Node.js or npm versions are below the minimum requirements, follow the [upgrade instructions](#troubleshooting) below.

### Operating System Compatibility

=== "macOS"

    **Supported:** macOS 10.15 (Catalina) and later

    **Installation:** Node.js can be installed via:
    - [Official Node.js installer](https://nodejs.org/)
    - Homebrew: `brew install node`
    - nvm: `nvm install 20`

=== "Linux"

    **Supported:** Ubuntu 20.04+, Debian 10+, CentOS 8+, Fedora 34+

    **Installation:** Node.js can be installed via:
    - [NodeSource repository](https://github.com/nodesource/distributions)
    - Package manager: `sudo apt install nodejs npm`
    - nvm: `nvm install 20`

=== "Windows"

    **Supported:** Windows 10/11 with WSL2 (Windows Subsystem for Linux)

    **Installation:**
    1. [Install WSL2](https://docs.microsoft.com/en-us/windows/wsl/install)
    2. Install Node.js in WSL2 using Linux instructions above

    !!! warning "Native Windows"
        Native Windows installation is not officially supported. Use WSL2 for best compatibility.

---

## Installation Methods

Choose the installation method that best fits your use case:

### Method 1: Global Installation (Recommended)

Global installation makes the `n8n-workflow-builder` command available system-wide.

**Installation:**

```bash
npm install -g @kernel.salacoste/n8n-workflow-builder
```

**Expected Output:**

```
added 45 packages in 8s

12 packages are looking for funding
  run `npm fund` for details
```

**Verification:**

```bash
# Check if globally installed
npm list -g @kernel.salacoste/n8n-workflow-builder

# Expected output:
# /usr/local/lib
# └── @kernel.salacoste/n8n-workflow-builder@0.9.1
```

**Usage:**

```bash
# Run the server
n8n-workflow-builder

# Or use npx
npx @kernel.salacoste/n8n-workflow-builder
```

**Best For:**
- Personal development machines
- System-wide CLI access
- Multiple projects using the same version

---

### Method 2: Local Project Installation

Local installation adds the package to your project's `node_modules` directory.

**Installation:**

```bash
# Navigate to your project directory
cd /path/to/your/project

# Install as a dependency
npm install @kernel.salacoste/n8n-workflow-builder

# Or install as a dev dependency
npm install --save-dev @kernel.salacoste/n8n-workflow-builder
```

**Expected Output:**

```
added 45 packages, and audited 46 packages in 6s

12 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

**Package.json Setup:**

```json
{
  "name": "my-n8n-project",
  "version": "1.0.0",
  "dependencies": {
    "@kernel.salacoste/n8n-workflow-builder": "^0.9.1"
  },
  "scripts": {
    "mcp-server": "n8n-workflow-builder"
  }
}
```

**Usage:**

```bash
# Via npx
npx @kernel.salacoste/n8n-workflow-builder

# Via npm script
npm run mcp-server

# Via node_modules
./node_modules/.bin/n8n-workflow-builder
```

**Best For:**
- Project-specific installations
- Version control across team members
- CI/CD pipelines
- Isolated project environments

---

### Method 3: NPX Direct Execution (No Installation)

NPX allows you to run the package without installing it.

**Command:**

```bash
npx @kernel.salacoste/n8n-workflow-builder
```

**Expected Output:**

```
Need to install the following packages:
  @kernel.salacoste/n8n-workflow-builder@0.9.1
Ok to proceed? (y) y

[MCP Server] Starting n8n Workflow Builder MCP Server...
[MCP Server] Listening on stdio
```

**Usage:**

```bash
# One-time execution
npx @kernel.salacoste/n8n-workflow-builder

# With specific version
npx @kernel.salacoste/n8n-workflow-builder@0.9.1

# With configuration
N8N_HOST=http://localhost:5678 npx @kernel.salacoste/n8n-workflow-builder
```

**Best For:**
- Quick testing without installation
- CI/CD environments
- Temporary usage
- Trying different versions

---

## Post-Installation Verification

After installation, verify everything is working correctly:

### Step 1: Version Check

=== "Global Installation"

    ```bash
    npm list -g @kernel.salacoste/n8n-workflow-builder
    ```

    **Expected Output:**
    ```
    /usr/local/lib
    └── @kernel.salacoste/n8n-workflow-builder@0.9.1
    ```

=== "Local Installation"

    ```bash
    npm list @kernel.salacoste/n8n-workflow-builder
    ```

    **Expected Output:**
    ```
    my-n8n-project@1.0.0
    └── @kernel.salacoste/n8n-workflow-builder@0.9.1
    ```

=== "NPX"

    ```bash
    npx @kernel.salacoste/n8n-workflow-builder --version
    ```

    **Expected Output:**
    ```
    0.9.1
    ```

### Step 2: Quick Test Run

Start the MCP server in test mode:

```bash
# For testing purposes, you can run without full configuration
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

!!! success "Installation Successful!"
    If you see the output above, your installation is complete! Press `Ctrl+C` to stop the server.

### Step 3: Health Check (Optional)

If your server is configured and running, test the health endpoint:

```bash
# Start the server in the background
npx @kernel.salacoste/n8n-workflow-builder &

# Wait 2 seconds for startup
sleep 2

# Check health endpoint (if HTTP mode is enabled)
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

---

## Troubleshooting

### Issue 1: Node.js Version Too Old

**Symptom:**

```
error @kernel.salacoste/n8n-workflow-builder@0.9.1:
The engine "node" is incompatible with this module.
Expected version ">=14.0.0". Got "12.22.0"
```

**Solution:**

Upgrade Node.js to version 14.0.0 or higher (18.x or 20.x recommended):

=== "Using nvm (Recommended)"

    ```bash
    # Install nvm (if not already installed)
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

    # Install latest LTS version
    nvm install --lts

    # Use the installed version
    nvm use --lts

    # Verify installation
    node --version  # Should show v18.x.x or v20.x.x
    ```

=== "macOS (Homebrew)"

    ```bash
    # Update Homebrew
    brew update

    # Upgrade Node.js
    brew upgrade node

    # Verify installation
    node --version
    ```

=== "Linux (NodeSource)"

    ```bash
    # Ubuntu/Debian - Install Node.js 20.x
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs

    # Verify installation
    node --version
    ```

**Prevention:**

Always check Node.js version before installation using `node --version`.

---

### Issue 2: Permission Errors (EACCES)

**Symptom:**

```
npm ERR! code EACCES
npm ERR! syscall access
npm ERR! path /usr/local/lib/node_modules
npm ERR! errno -13
npm ERR! Error: EACCES: permission denied
```

**Solution Option A: Configure npm Prefix (Recommended)**

```bash
# Create a directory for global packages
mkdir ~/.npm-global

# Configure npm to use the new directory
npm config set prefix '~/.npm-global'

# Add to your PATH (add this line to ~/.bashrc or ~/.zshrc)
export PATH=~/.npm-global/bin:$PATH

# Reload shell configuration
source ~/.bashrc  # or source ~/.zshrc

# Retry installation
npm install -g @kernel.salacoste/n8n-workflow-builder
```

**Solution Option B: Fix Permissions**

```bash
# Fix npm directory ownership (macOS/Linux)
sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}

# Retry installation
npm install -g @kernel.salacoste/n8n-workflow-builder
```

**Solution Option C: Use Local Installation**

Avoid global installation entirely:

```bash
# Install locally in your project
npm install @kernel.salacoste/n8n-workflow-builder

# Use via npx
npx @kernel.salacoste/n8n-workflow-builder
```

!!! warning "Avoid Using sudo"
    Do NOT use `sudo npm install -g` as this can cause permission issues and security risks.

**Prevention:**

Configure npm prefix before installing global packages.

---

### Issue 3: Port 3456 Already in Use

**Symptom:**

```
Error: listen EADDRINUSE: address already in use :::3456
```

**Solution:**

Use the `MCP_PORT` environment variable to specify a different port:

```bash
# Option 1: Set port for single run
MCP_PORT=58921 npx @kernel.salacoste/n8n-workflow-builder

# Option 2: Add to .env file
echo "MCP_PORT=58921" >> .env

# Option 3: Export in shell
export MCP_PORT=58921
npx @kernel.salacoste/n8n-workflow-builder
```

**Find and Kill Process Using Port 3456:**

```bash
# Find process using port 3456
lsof -i :3456

# Kill the process (replace PID with actual process ID)
kill -9 <PID>
```

**Prevention:**

Choose a unique port number between 49152-65535 (dynamic/private ports).

---

### Issue 4: Installation Hangs or Times Out

**Symptom:**

```
npm install -g @kernel.salacoste/n8n-workflow-builder
[hangs indefinitely...]
```

**Solution:**

=== "Network Timeout"

    ```bash
    # Increase npm timeout
    npm config set fetch-timeout 60000
    npm config set fetch-retry-maxtimeout 120000

    # Retry installation
    npm install -g @kernel.salacoste/n8n-workflow-builder
    ```

=== "Proxy Configuration"

    ```bash
    # Set proxy (if behind corporate firewall)
    npm config set proxy http://proxy.company.com:8080
    npm config set https-proxy http://proxy.company.com:8080

    # Retry installation
    npm install -g @kernel.salacoste/n8n-workflow-builder
    ```

=== "Use Different Registry"

    ```bash
    # Use npm mirror
    npm config set registry https://registry.npmmirror.com

    # Or reset to default
    npm config set registry https://registry.npmjs.org

    # Retry installation
    npm install -g @kernel.salacoste/n8n-workflow-builder
    ```

**Prevention:**

Configure npm timeouts and proxy settings before installation.

---

### Issue 5: Package Not Found

**Symptom:**

```
npm ERR! 404 Not Found - GET https://registry.npmjs.org/@kernel.salacoste%2fn8n-workflow-builder
npm ERR! 404 '@kernel.salacoste/n8n-workflow-builder@*' is not in this registry.
```

**Solution:**

=== "Check Package Name"

    Verify you're using the correct package name:

    ```bash
    # Correct package name (with @kernel.salacoste scope)
    npm install -g @kernel.salacoste/n8n-workflow-builder

    # Incorrect (without scope) - will NOT work
    # npm install -g n8n-workflow-builder
    ```

=== "Clear npm Cache"

    ```bash
    # Clear npm cache
    npm cache clean --force

    # Verify npm registry
    npm config get registry
    # Should show: https://registry.npmjs.org/

    # Retry installation
    npm install -g @kernel.salacoste/n8n-workflow-builder
    ```

=== "Check npm Registry"

    ```bash
    # Search for package
    npm search @kernel.salacoste/n8n-workflow-builder

    # View package info
    npm view @kernel.salacoste/n8n-workflow-builder

    # Should display package details
    ```

**Prevention:**

Always use the full scoped package name: `@kernel.salacoste/n8n-workflow-builder`

---

## Next Steps

After successful installation, proceed with:

1. **[Configuration Setup](configuration.md)** - Set up `.config.json` for multi-instance support
2. **[Claude Desktop Integration](../quick-start/claude-desktop.md)** - Connect with Claude AI
3. **[First Workflow Tutorial](../quick-start/first-workflow.md)** - Create your first n8n workflow

---

## Additional Resources

- [Manual Installation Guide](manual-installation.md) - Build from source
- [Configuration Reference](configuration.md) - Complete configuration options
- [Troubleshooting Guide](../../examples/troubleshooting.md) - Advanced troubleshooting
- [GitHub Repository](https://github.com/salacoste/mcp-n8n-workflow-builder) - Source code and issues

---

!!! question "Need Help?"
    If you encounter issues not covered in this guide, please:

    - Check the [Troubleshooting Guide](../../examples/troubleshooting.md)
    - Search [GitHub Issues](https://github.com/salacoste/mcp-n8n-workflow-builder/issues)
    - Report a [new issue](https://github.com/salacoste/mcp-n8n-workflow-builder/issues/new)
