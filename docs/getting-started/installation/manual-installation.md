# Manual Installation from Source

This guide explains how to install and build the n8n MCP Workflow Builder from source code, giving you full control over the build process and enabling custom modifications.

---

## When to Use Manual Installation

Choose manual installation if you:

- ✅ Want to customize the source code
- ✅ Need to debug or contribute to the project
- ✅ Prefer building from source for security auditing
- ✅ Are working with the latest development features
- ✅ Need to build for specific platforms or environments

For most users, **[NPM installation](npm-installation.md)** is recommended.

---

## Prerequisites

Before starting, ensure you have the following tools installed:

### Required Tools

| Tool | Minimum Version | Recommended Version | Purpose |
|------|----------------|---------------------|---------|
| **Git** | 2.x | Latest stable | Clone repository |
| **Node.js** | 14.0.0 | 18.x or 20.x | Runtime environment |
| **npm** | 7.0.0 | 9.x or 10.x | Package manager |
| **Text Editor** | Any | VS Code, Cursor | Code editing |

### Verification Commands

Check your installed versions:

```bash
# Check Git version
git --version
# Expected: git version 2.x.x or higher

# Check Node.js version
node --version
# Expected: v14.x.x or higher (v18.x.x or v20.x.x recommended)

# Check npm version
npm --version
# Expected: 7.x.x or higher (9.x.x or 10.x.x recommended)
```

### Additional Requirements

- **Command line knowledge** - Basic familiarity with terminal/command prompt
- **GitHub account** (optional) - For contributing changes
- **5-10 minutes** - Estimated time for complete setup

---

## Installation Steps

### Step 1: Clone the Repository

Clone the GitHub repository to your local machine:

```bash
# Clone via HTTPS (recommended for most users)
git clone https://github.com/salacoste/mcp-n8n-workflow-builder.git

# OR clone via SSH (if you have SSH keys configured)
git clone git@github.com:salacoste/mcp-n8n-workflow-builder.git

# Navigate to project directory
cd mcp-n8n-workflow-builder
```

**Expected Output:**

```
Cloning into 'mcp-n8n-workflow-builder'...
remote: Enumerating objects: 342, done.
remote: Counting objects: 100% (342/342), done.
remote: Compressing objects: 100% (156/156), done.
remote: Total 342 (delta 178), reused 312 (delta 165)
Receiving objects: 100% (342/342), 2.15 MiB | 5.23 MiB/s, done.
Resolving deltas: 100% (178/178), done.
```

**Verification:**

```bash
# Verify repository was cloned successfully
ls -la

# You should see:
# - src/           (TypeScript source code)
# - package.json   (Dependencies and scripts)
# - tsconfig.json  (TypeScript configuration)
# - README.md      (Documentation)
```

### Step 2: Select Branch (Optional)

The repository has different branches for different purposes:

| Branch | Purpose | Stability |
|--------|---------|-----------|
| `main` | Stable releases | ✅ High |
| `develop` | Latest features | ⚠️ May be unstable |

**For stable installation, use `main` (default):**

```bash
# Verify you're on main branch
git branch

# Output should show:
# * main
```

**For latest features, switch to `develop`:**

```bash
# Switch to develop branch
git checkout develop

# Verify
git branch

# Output should show:
# * develop
```

---

### Step 3: Install Dependencies

Install all required npm packages:

```bash
npm install
```

**Expected Output:**

```
added 45 packages, and audited 46 packages in 12s

12 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

**What Gets Installed:**

=== "Core Dependencies"

    - `@modelcontextprotocol/sdk` - MCP protocol implementation
    - `axios` - HTTP client for n8n API
    - `cors` - CORS middleware
    - `dotenv` - Environment variable management
    - `express` - HTTP server framework
    - `node-fetch` - Fetch API polyfill

=== "Development Dependencies"

    - `typescript` - TypeScript compiler
    - `@types/*` - TypeScript type definitions
    - `jest` - Testing framework
    - `ts-jest` - TypeScript for Jest

### Step 4: Build from Source

Compile TypeScript source code to JavaScript:

```bash
# Clean previous build artifacts (if any)
npm run clean

# Build the project
npm run build
```

**Expected Output:**

```
> @kernel.salacoste/n8n-workflow-builder@0.9.1 build
> tsc

# (TypeScript compilation happens silently if successful)
```

**Verification:**

```bash
# Check build output directory
ls -la build/

# You should see compiled JavaScript files:
# - index.js
# - config/
# - services/
# - types/
# - utils/
```

**Build Directory Structure:**

```
build/
├── index.js              # Main entry point
├── config/
│   └── configLoader.js   # Configuration loading
├── services/
│   ├── environmentManager.js
│   ├── n8nApiWrapper.js
│   ├── workflowBuilder.js
│   └── promptsService.js
├── types/
│   └── api.js            # Type definitions
└── utils/
    └── validation.js     # Validation utilities
```

---

### Step 5: Configure the Server

Before running, configure your n8n connection:

=== ".env File (Quick Setup)"

    ```bash
    # Create .env file
    cat > .env << 'EOF'
    N8N_HOST=https://your-instance.app.n8n.cloud
    N8N_API_KEY=your_api_key_here
    MCP_PORT=3456
    DEBUG=false
    EOF
    ```

=== ".config.json (Multi-Instance)"

    ```bash
    # Create .config.json
    cat > .config.json << 'EOF'
    {
      "environments": {
        "development": {
          "n8n_host": "http://localhost:5678",
          "n8n_api_key": "your_dev_api_key"
        }
      },
      "defaultEnv": "development"
    }
    EOF
    ```

!!! tip "Configuration Guide"
    See [Configuration Setup](configuration.md) for detailed configuration instructions.

---

### Step 6: Run the Server

Start the MCP server:

=== "Production Mode"

    Run the compiled JavaScript:

    ```bash
    npm start
    ```

    Or directly:

    ```bash
    node build/index.js
    ```

    **Expected Output:**

    ```
    [MCP Server] Starting n8n Workflow Builder MCP Server v0.9.1...
    [MCP Server] Configuration loaded: 1 environment(s)
    [MCP Server] Default environment: development
    [MCP Server] Listening on stdio (MCP Protocol)
    [MCP Server] Ready to accept requests
    ```

=== "Development Mode"

    Watch mode with automatic rebuild:

    ```bash
    npm run dev
    ```

    **Expected Output:**

    ```
    [npm run dev] Starting TypeScript compiler in watch mode...

    [12:34:56 PM] Starting compilation in watch mode...

    [12:34:58 PM] Found 0 errors. Watching for file changes.
    ```

    This will:
    - Watch `src/` directory for changes
    - Automatically recompile on file save
    - Keep running until stopped with Ctrl+C

**Verification:**

Press `Ctrl+C` to stop the server. You should see:

```
^C[MCP Server] Shutting down gracefully...
[MCP Server] Stopped.
```

---

## Development Workflow

### Making Code Changes

Follow this workflow when modifying the source code:

#### Step 1: Create a Feature Branch

```bash
# Create and switch to new branch
git checkout -b feature/my-enhancement

# Verify you're on the new branch
git branch
```

#### Step 2: Make Your Changes

Edit files in the `src/` directory using your preferred editor:

```bash
# Open project in VS Code
code .

# Or use any text editor
nano src/index.ts
```

#### Step 3: Test Changes Locally

```bash
# In terminal 1: Start development server
npm run dev

# In terminal 2: Test your changes
# (Use Claude Desktop or run manual tests)
```

#### Step 4: Build and Verify

```bash
# Stop development server (Ctrl+C in terminal 1)

# Clean build
npm run clean
npm run build

# Run production build
npm start

# Test functionality
```

#### Step 5: Commit Changes

```bash
# Stage your changes
git add src/

# Commit with descriptive message
git commit -m "feat: add new feature description"

# Push to GitHub (if contributing)
git push origin feature/my-enhancement
```

---

## Debugging Setup

### VS Code Debug Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug MCP Server",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/build/index.js",
      "preLaunchTask": "npm: build",
      "outFiles": ["${workspaceFolder}/build/**/*.js"],
      "env": {
        "N8N_HOST": "http://localhost:5678",
        "N8N_API_KEY": "your_dev_api_key",
        "DEBUG": "true"
      }
    }
  ]
}
```

**Usage:**

1. Set breakpoints in TypeScript files (`src/`)
2. Press `F5` to start debugging
3. Execution will pause at breakpoints

---

## Testing

### Run Unit Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

**Expected Output:**

```
PASS  src/services/__tests__/environmentManager.test.ts
PASS  src/services/__tests__/n8nApiWrapper.test.ts

Test Suites: 2 passed, 2 total
Tests:       15 passed, 15 total
Snapshots:   0 total
Time:        3.456 s
```

### Manual Testing

Test the MCP server manually:

```bash
# Start server in one terminal
npm start

# In another terminal, use test scripts
node test-mcp-tools.js
```

---

## Troubleshooting

### Issue 1: TypeScript Compilation Errors

**Symptom:**

```
src/index.ts:42:15 - error TS2304: Cannot find name 'someThing'.

42   const x = someThing;
                ~~~~~~~~~~
```

**Solutions:**

1. **Check TypeScript syntax:**
   ```bash
   # Review the file with errors
   cat -n src/index.ts | grep -A 5 -B 5 "42"
   ```

2. **Install missing type definitions:**
   ```bash
   npm install --save-dev @types/node
   ```

3. **Clean and rebuild:**
   ```bash
   npm run clean
   rm -rf node_modules
   npm install
   npm run build
   ```

---

### Issue 2: Build Directory Not Created

**Symptom:**

```
npm start
Error: Cannot find module './build/index.js'
```

**Solutions:**

1. **Verify build ran successfully:**
   ```bash
   npm run build
   # Check for errors in output
   ```

2. **Check directory permissions:**
   ```bash
   ls -ld .
   # Should be: drwxr-xr-x (readable and writable)
   ```

3. **Manually verify tsconfig.json:**
   ```bash
   cat tsconfig.json
   # Check that "outDir": "build" is present
   ```

---

### Issue 3: Node Modules Missing

**Symptom:**

```
Error: Cannot find module '@modelcontextprotocol/sdk'
```

**Solutions:**

1. **Reinstall dependencies:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Check npm configuration:**
   ```bash
   npm config list
   # Verify registry is set correctly
   ```

3. **Use clean install:**
   ```bash
   npm ci
   ```

---

### Issue 4: Port Already in Use

**Symptom:**

```
Error: listen EADDRINUSE: address already in use :::3456
```

**Solutions:**

1. **Find and kill process using port:**
   ```bash
   lsof -i :3456
   kill -9 <PID>
   ```

2. **Use different port:**
   ```bash
   MCP_PORT=58921 npm start
   ```

3. **Add to .env file:**
   ```bash
   echo "MCP_PORT=58921" >> .env
   ```

---

### Issue 5: Permission Denied

**Symptom:**

```
npm run build
sh: 1: tsc: Permission denied
```

**Solutions:**

1. **Fix npm bin permissions:**
   ```bash
   chmod +x node_modules/.bin/*
   ```

2. **Reinstall dependencies:**
   ```bash
   rm -rf node_modules
   npm install
   ```

3. **Use npx instead:**
   ```bash
   npx tsc
   ```

---

### Issue 6: Git Clone Fails

**Symptom:**

```
fatal: could not read Username for 'https://github.com': terminal prompts disabled
```

**Solutions:**

=== "Use HTTPS with Credentials"

    ```bash
    git clone https://github.com/salacoste/mcp-n8n-workflow-builder.git
    # Enter GitHub username and password when prompted
    ```

=== "Use SSH (if configured)"

    ```bash
    # Set up SSH key first
    ssh-keygen -t ed25519 -C "your_email@example.com"
    # Add key to GitHub: Settings → SSH keys

    # Clone with SSH
    git clone git@github.com:salacoste/mcp-n8n-workflow-builder.git
    ```

=== "Check Network"

    ```bash
    # Test GitHub connectivity
    ping github.com

    # Test HTTPS access
    curl -I https://github.com
    ```

---

## Advanced Topics

### Custom Build Configurations

Modify `tsconfig.json` for custom build settings:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./build",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### Cross-Platform Build Notes

=== "Windows (WSL2 Recommended)"

    ```powershell
    # Install WSL2 first
    wsl --install

    # Then follow Linux instructions inside WSL2
    ```

=== "macOS"

    ```bash
    # Native support, no special configuration needed
    npm install
    npm run build
    ```

=== "Linux"

    ```bash
    # Native support, may need build-essential
    sudo apt install build-essential
    npm install
    npm run build
    ```

### Docker Build

Create a `Dockerfile` for containerized deployment:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

ENV N8N_HOST=https://n8n.example.com
ENV MCP_PORT=3456

EXPOSE 3456

CMD ["node", "build/index.js"]
```

**Build and run:**

```bash
# Build Docker image
docker build -t n8n-mcp-server .

# Run container
docker run -d \
  -e N8N_HOST=https://n8n.example.com \
  -e N8N_API_KEY=your_api_key \
  -p 3456:3456 \
  n8n-mcp-server
```

---

## Production Deployment

For production deployments, consider:

### Process Management

=== "PM2"

    ```bash
    # Install PM2 globally
    npm install -g pm2

    # Start server with PM2
    pm2 start build/index.js --name n8n-mcp-server

    # View logs
    pm2 logs n8n-mcp-server

    # Restart on file changes
    pm2 restart n8n-mcp-server
    ```

=== "systemd (Linux)"

    Create `/etc/systemd/system/n8n-mcp-server.service`:

    ```ini
    [Unit]
    Description=n8n MCP Workflow Builder
    After=network.target

    [Service]
    Type=simple
    User=nodejs
    WorkingDirectory=/opt/mcp-n8n-workflow-builder
    ExecStart=/usr/bin/node build/index.js
    Restart=on-failure
    Environment=N8N_HOST=https://n8n.example.com
    Environment=N8N_API_KEY=your_api_key

    [Install]
    WantedBy=multi-user.target
    ```

    **Enable and start:**

    ```bash
    sudo systemctl enable n8n-mcp-server
    sudo systemctl start n8n-mcp-server
    sudo systemctl status n8n-mcp-server
    ```

---

## Contributing

If you want to contribute to the project:

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Create a feature branch**
4. **Make your changes** with tests
5. **Submit a pull request**

See [CONTRIBUTING.md](../../about/contributing.md) for detailed guidelines.

---

## Repository Structure

Understanding the codebase:

```
mcp-n8n-workflow-builder/
├── src/                          # TypeScript source code
│   ├── index.ts                 # MCP server entry point
│   ├── config/
│   │   └── configLoader.ts      # Configuration loading
│   ├── services/
│   │   ├── environmentManager.ts # Multi-instance management
│   │   ├── n8nApiWrapper.ts     # n8n API client
│   │   ├── workflowBuilder.ts   # Workflow construction
│   │   └── promptsService.ts    # Workflow templates
│   ├── types/
│   │   └── api.ts               # TypeScript types
│   └── utils/
│       └── validation.ts        # Data validation
├── build/                       # Compiled JavaScript (gitignored)
├── docs/                        # Documentation
├── test/                        # Test files
├── .github/                     # GitHub Actions
├── package.json                 # Dependencies & scripts
├── tsconfig.json               # TypeScript config
├── .env.example                # Environment template
└── README.md                   # Project documentation
```

---

## Next Steps

After successful manual installation:

1. **[Configuration Setup](configuration.md)** - Configure n8n connection
2. **[Claude Desktop Integration](../quick-start/claude-desktop.md)** - Connect with Claude AI
3. **[First Workflow Tutorial](../quick-start/first-workflow.md)** - Create your first workflow
4. **[Contributing Guide](../../about/contributing.md)** - Contribute to the project

---

!!! question "Need Help?"
    - [Troubleshooting Guide](../../examples/troubleshooting.md)
    - [GitHub Issues](https://github.com/salacoste/mcp-n8n-workflow-builder/issues)
    - [Development Discord](#) - Coming soon!
