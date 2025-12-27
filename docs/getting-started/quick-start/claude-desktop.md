# Claude Desktop Integration

This guide explains how to integrate the n8n MCP Workflow Builder with Claude Desktop, enabling you to manage n8n workflows through natural language conversations.

---

## Prerequisites

Before integrating with Claude Desktop, ensure you have:

- [x] **Claude Desktop installed** (version 0.7.0 or later)
- [x] **n8n MCP Workflow Builder** installed via [NPM](../installation/npm-installation.md) or [manual build](../installation/manual-installation.md)
- [x] **n8n instance** running and accessible
- [x] **n8n API key** generated
- [x] **Configuration** completed ([Configuration Guide](../installation/configuration.md))

!!! tip "Not Installed Yet?"
    - Download Claude Desktop: [https://claude.ai/download](https://claude.ai/download)
    - Install MCP server: See [Installation Guide](../installation/npm-installation.md)

---

## Understanding Claude Desktop MCP Configuration

Claude Desktop connects to MCP servers through a configuration file that specifies:

1. **Server Name** - Identifier for your MCP server
2. **Command** - How to start the MCP server process
3. **Arguments** - Command-line arguments for the server
4. **Environment Variables** - Configuration for the server
5. **Permissions** - Tools that can run without user approval

---

## Locating the Configuration File

The Claude Desktop configuration file location varies by operating system:

=== "macOS"

    **Path:**
    ```
    ~/Library/Application Support/Claude/claude_desktop_config.json
    ```

    **Check if file exists:**
    ```bash
    ls -la ~/Library/Application\ Support/Claude/claude_desktop_config.json
    ```

    **Create parent directory if needed:**
    ```bash
    mkdir -p ~/Library/Application\ Support/Claude
    ```

=== "Windows"

    **Path:**
    ```
    %APPDATA%\Claude\claude_desktop_config.json
    ```

    **Check if file exists (PowerShell):**
    ```powershell
    Test-Path "$env:APPDATA\Claude\claude_desktop_config.json"
    ```

    **Check if file exists (Command Prompt):**
    ```cmd
    dir "%APPDATA%\Claude\claude_desktop_config.json"
    ```

    **Create parent directory if needed (PowerShell):**
    ```powershell
    New-Item -ItemType Directory -Force -Path "$env:APPDATA\Claude"
    ```

=== "Linux"

    **Path:**
    ```
    ~/.config/Claude/claude_desktop_config.json
    ```

    **Check if file exists:**
    ```bash
    ls -la ~/.config/Claude/claude_desktop_config.json
    ```

    **Create parent directory if needed:**
    ```bash
    mkdir -p ~/.config/Claude
    ```

!!! warning "Backup Existing Configuration"
    If the file already exists, create a backup before editing:

    ```bash
    # macOS/Linux
    cp ~/Library/Application\ Support/Claude/claude_desktop_config.json \
       ~/Library/Application\ Support/Claude/claude_desktop_config.json.backup

    # Windows (PowerShell)
    Copy-Item "$env:APPDATA\Claude\claude_desktop_config.json" `
              "$env:APPDATA\Claude\claude_desktop_config.json.backup"
    ```

---

## Configuration Methods

Choose the method that matches your installation:

### Method 1: NPX (Recommended)

Best for users who installed via npm without global installation.

**Configuration:**

=== "macOS/Linux"

    ```json
    {
      "mcpServers": {
        "n8n-workflow-builder": {
          "command": "npx",
          "args": [
            "@kernel.salacoste/n8n-workflow-builder"
          ],
          "env": {
            "N8N_HOST": "https://your-instance.app.n8n.cloud",
            "N8N_API_KEY": "your_api_key_here",
            "MCP_PORT": "58921"
          },
          "alwaysAllow": [
            "list_workflows",
            "get_workflow",
            "list_executions",
            "get_execution"
          ]
        }
      }
    }
    ```

=== "Windows"

    ```json
    {
      "mcpServers": {
        "n8n-workflow-builder": {
          "command": "npx",
          "args": [
            "@kernel.salacoste/n8n-workflow-builder"
          ],
          "env": {
            "N8N_HOST": "https://your-instance.app.n8n.cloud",
            "N8N_API_KEY": "your_api_key_here",
            "MCP_PORT": "58921"
          },
          "alwaysAllow": [
            "list_workflows",
            "get_workflow",
            "list_executions",
            "get_execution"
          ]
        }
      }
    }
    ```

**Pros:**
- ✅ Always uses latest published version
- ✅ No path configuration needed
- ✅ Works across all platforms

**Cons:**
- ⚠️ Slower first start (downloads package)
- ⚠️ Requires internet connection

---

### Method 2: Local Build

Best for developers or users who built from source.

**Configuration:**

=== "macOS"

    ```json
    {
      "mcpServers": {
        "n8n-workflow-builder": {
          "command": "node",
          "args": [
            "/Users/username/projects/mcp-n8n-workflow-builder/build/index.js"
          ],
          "env": {
            "N8N_HOST": "https://your-instance.app.n8n.cloud",
            "N8N_API_KEY": "your_api_key_here",
            "MCP_PORT": "58921"
          }
        }
      }
    }
    ```

    **Find your absolute path:**
    ```bash
    cd /path/to/mcp-n8n-workflow-builder
    echo "$(pwd)/build/index.js"
    ```

=== "Windows"

    ```json
    {
      "mcpServers": {
        "n8n-workflow-builder": {
          "command": "node",
          "args": [
            "C:\\Users\\username\\projects\\mcp-n8n-workflow-builder\\build\\index.js"
          ],
          "env": {
            "N8N_HOST": "https://your-instance.app.n8n.cloud",
            "N8N_API_KEY": "your_api_key_here",
            "MCP_PORT": "58921"
          }
        }
      }
    }
    ```

    **Find your absolute path (PowerShell):**
    ```powershell
    cd C:\path\to\mcp-n8n-workflow-builder
    $pwd = Get-Location
    Write-Output "$pwd\build\index.js"
    ```

    **Important:** Use double backslashes (`\\`) in JSON!

=== "Linux"

    ```json
    {
      "mcpServers": {
        "n8n-workflow-builder": {
          "command": "node",
          "args": [
            "/home/username/projects/mcp-n8n-workflow-builder/build/index.js"
          ],
          "env": {
            "N8N_HOST": "https://your-instance.app.n8n.cloud",
            "N8N_API_KEY": "your_api_key_here",
            "MCP_PORT": "58921"
          }
        }
      }
    }
    ```

    **Find your absolute path:**
    ```bash
    cd /path/to/mcp-n8n-workflow-builder
    echo "$(pwd)/build/index.js"
    ```

**Pros:**
- ✅ Fast startup (no download)
- ✅ Use custom modifications
- ✅ Offline operation

**Cons:**
- ⚠️ Manual updates required
- ⚠️ Must rebuild after changes

!!! danger "Use Absolute Paths Only"
    **Never** use relative paths like `./build/index.js` or `~/projects/...`

    Claude Desktop requires absolute paths starting from root:
    - ✅ Correct: `/Users/john/projects/mcp-n8n-workflow-builder/build/index.js`
    - ❌ Wrong: `~/projects/mcp-n8n-workflow-builder/build/index.js`
    - ❌ Wrong: `./build/index.js`

---

### Method 3: Global NPM Installation

Best for users who installed globally with `npm install -g`.

**Configuration:**

```json
{
  "mcpServers": {
    "n8n-workflow-builder": {
      "command": "n8n-workflow-builder",
      "env": {
        "N8N_HOST": "https://your-instance.app.n8n.cloud",
        "N8N_API_KEY": "your_api_key_here",
        "MCP_PORT": "58921"
      },
      "alwaysAllow": [
        "list_workflows",
        "get_workflow"
      ]
    }
  }
}
```

**Verify global installation:**

```bash
which n8n-workflow-builder
# Should output: /usr/local/bin/n8n-workflow-builder (or similar)
```

**Pros:**
- ✅ Simplest configuration
- ✅ Fast startup
- ✅ No path needed

**Cons:**
- ⚠️ Requires global install permissions
- ⚠️ May conflict with other versions

---

## Configuration Reference

### Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `N8N_HOST` | ✅ Yes | n8n base URL (without `/api/v1`) | `https://n8n.example.com` |
| `N8N_API_KEY` | ✅ Yes | n8n API key | `n8n_api_abc123...` |
| `MCP_PORT` | ⬜ No | MCP server port (default: 3456) | `58921` |
| `DEBUG` | ⬜ No | Enable debug logging | `true` or `false` |

!!! tip "Port Selection"
    Use non-standard ports like `58921` to avoid conflicts with default MCP port 3456.

### Always Allow Tools

The `alwaysAllow` array specifies tools that can run without asking for permission:

**Read-Only Tools (Safe):**
```json
"alwaysAllow": [
  "list_workflows",
  "get_workflow",
  "list_executions",
  "get_execution",
  "get_tags"
]
```

**Write Tools (Require Caution):**
```json
"alwaysAllow": [
  "create_workflow",
  "update_workflow",
  "delete_workflow",
  "activate_workflow",
  "deactivate_workflow"
]
```

!!! warning "Security Consideration"
    Only add write tools to `alwaysAllow` if you trust the AI to make changes without confirmation.

    **Recommended for most users:** Only allow read-only tools.

---

## Multi-Instance Configuration

If using `.config.json` with multiple n8n environments, Claude Desktop will use the default environment:

**Option 1: Use .config.json file**

Create `.config.json` in your project directory and reference it:

```json
{
  "mcpServers": {
    "n8n-workflow-builder": {
      "command": "npx",
      "args": ["@kernel.salacoste/n8n-workflow-builder"],
      "cwd": "/path/to/project/with/config.json"
    }
  }
}
```

**Option 2: Override environment in Claude Desktop**

```json
{
  "mcpServers": {
    "n8n-production": {
      "command": "npx",
      "args": ["@kernel.salacoste/n8n-workflow-builder"],
      "env": {
        "N8N_HOST": "https://prod.n8n.example.com",
        "N8N_API_KEY": "prod_key"
      }
    },
    "n8n-staging": {
      "command": "npx",
      "args": ["@kernel.salacoste/n8n-workflow-builder"],
      "env": {
        "N8N_HOST": "https://staging.n8n.example.com",
        "N8N_API_KEY": "staging_key"
      }
    }
  }
}
```

This creates two separate MCP servers - one for production, one for staging.

---

## Applying Configuration

### Step 1: Edit Configuration File

=== "macOS/Linux"

    ```bash
    # Open in default text editor
    open ~/Library/Application\ Support/Claude/claude_desktop_config.json

    # Or use nano
    nano ~/Library/Application\ Support/Claude/claude_desktop_config.json

    # Or use VS Code
    code ~/Library/Application\ Support/Claude/claude_desktop_config.json
    ```

=== "Windows"

    ```powershell
    # Open in Notepad
    notepad "$env:APPDATA\Claude\claude_desktop_config.json"

    # Or use VS Code
    code "$env:APPDATA\Claude\claude_desktop_config.json"
    ```

### Step 2: Paste Configuration

Copy your chosen configuration method and paste it into the file.

**If file is empty or new:**
Paste the complete JSON structure.

**If file already has other MCP servers:**
Add your server to the existing `mcpServers` object:

```json
{
  "mcpServers": {
    "existing-server": {
      "command": "...",
      ...
    },
    "n8n-workflow-builder": {
      "command": "npx",
      "args": ["@kernel.salacoste/n8n-workflow-builder"],
      ...
    }
  }
}
```

### Step 3: Save and Validate

1. **Save the file** (Ctrl+S or Cmd+S)

2. **Validate JSON syntax:**

    ```bash
    # macOS/Linux
    cat ~/Library/Application\ Support/Claude/claude_desktop_config.json | python3 -m json.tool

    # Windows (PowerShell)
    Get-Content "$env:APPDATA\Claude\claude_desktop_config.json" | ConvertFrom-Json
    ```

    If you see errors, check for:
    - Missing commas between properties
    - Missing quotes around strings
    - Unclosed brackets or braces

---

## Verification and Testing

### Step 1: Restart Claude Desktop

**Complete restart required:**

1. **Quit Claude Desktop** completely (not just close window)
   - macOS: Cmd+Q
   - Windows: File → Exit
   - Linux: File → Quit

2. **Wait 5 seconds**

3. **Relaunch Claude Desktop**

### Step 2: Verify MCP Server Connection

Open a new conversation in Claude and send:

```
What MCP tools do you have available?
```

**Expected Response:**

Claude should list the n8n MCP Workflow Builder tools:

```
I have access to the following n8n workflow management tools:

Workflow Management:
- list_workflows - List all workflows
- create_workflow - Create new workflows
- get_workflow - Get workflow details
- update_workflow - Update existing workflows
- delete_workflow - Remove workflows
- activate_workflow - Enable workflows
- deactivate_workflow - Disable workflows
- execute_workflow - Run workflows manually

Execution Management:
- list_executions - List workflow executions
- get_execution - Get execution details
- delete_execution - Remove execution records
- retry_execution - Retry failed executions

Tag Management:
- create_tag - Create workflow tags
- get_tags - List all tags
- update_tag - Update tag names
- delete_tag - Remove tags

Would you like me to help with any of these operations?
```

### Step 3: Test Basic Functionality

Try a simple read-only command:

```
List my n8n workflows
```

**Expected Response:**

Claude should invoke the `list_workflows` tool and display your workflows:

```
Here are your n8n workflows:

1. **Email Notification System** (ID: 1)
   - Status: Active
   - Created: 2025-12-15
   - Nodes: 5

2. **Data Sync Pipeline** (ID: 2)
   - Status: Inactive
   - Created: 2025-12-20
   - Nodes: 8

You have 2 workflows total.
```

---

## Troubleshooting

### Issue 1: MCP Server Not Found

**Symptom:**

Claude responds: "I don't have access to n8n workflow tools"

**Solutions:**

1. **Verify configuration file location:**
   ```bash
   # Check file exists
   ls -la ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```

2. **Check JSON syntax:**
   ```bash
   python3 -m json.tool < ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```

3. **Verify npx or node is in PATH:**
   ```bash
   which npx    # Should show path
   which node   # Should show path
   ```

4. **Restart Claude Desktop completely** (Quit + Relaunch)

---

### Issue 2: Connection Failed

**Symptom:**

Claude shows error: "Failed to connect to MCP server"

**Solutions:**

1. **Test MCP server manually:**
   ```bash
   npx @kernel.salacoste/n8n-workflow-builder
   # Should start without errors
   ```

2. **Check n8n is accessible:**
   ```bash
   curl https://your-n8n-instance.com
   ```

3. **Verify API key is correct:**
   - Check for whitespace in configuration
   - Regenerate API key in n8n if needed

4. **Check logs:**
   - macOS: `~/Library/Logs/Claude/`
   - Windows: `%APPDATA%\Claude\Logs\`

---

### Issue 3: Permission Denied

**Symptom:**

Error: "EACCES: permission denied"

**Solutions:**

1. **Check file permissions:**
   ```bash
   ls -la ~/Library/Application\ Support/Claude/claude_desktop_config.json
   # Should be readable
   ```

2. **Fix permissions:**
   ```bash
   chmod 644 ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```

3. **For local build, check build directory:**
   ```bash
   ls -la /path/to/mcp-n8n-workflow-builder/build/index.js
   ```

---

### Issue 4: Wrong Tools Appear

**Symptom:**

Different MCP tools appear (not n8n tools)

**Solutions:**

1. **Check server name in config:**
   - Must be unique across all MCP servers
   - Try renaming to `n8n-mcp` or `n8n-prod`

2. **Verify command matches your installation method**

3. **Remove old configurations** if you changed installation methods

---

## Using MCP Tools in Claude

### Discovering Tools

Ask Claude about available tools:

```
What n8n tools can you use?
What can you do with my workflows?
Show me the available workflow commands
```

### Invoking Tools

Use natural language commands:

**List Operations:**
```
List my workflows
Show all workflow executions
Get all tags
```

**Get Operations:**
```
Get details for workflow ID 5
Show me execution 123
```

**Create Operations:**
```
Create a new workflow called "Daily Backup"
Add a tag called "production"
```

**Update Operations:**
```
Activate workflow 3
Rename tag "test" to "staging"
```

**Delete Operations:**
```
Delete workflow 7
Remove tag "obsolete"
```

### Best Practices

1. **Start with read operations** to understand your current state
2. **Be specific** with IDs and names
3. **Ask for confirmation** before destructive operations
4. **Use multi-instance** by specifying environment:
   ```
   List workflows from production
   Create workflow in staging instance
   ```

---

## Next Steps

After successful integration:

1. **[First Workflow Tutorial](first-workflow.md)** - Create your first workflow with Claude
2. **[Verification & Testing](verification.md)** - Comprehensive testing guide
3. **[Workflow Examples](../../examples/workflows/basic-patterns.md)** - Explore workflow patterns

---

## Additional Resources

- [MCP Tools Reference](../../features/workflows-management.md) - Complete tool documentation
- [Multi-Instance Guide](../../multi-instance/configuration.md) - Advanced multi-environment setup
- [Troubleshooting Guide](../../examples/troubleshooting.md) - Common issues and solutions
- [Claude Desktop MCP Documentation](https://docs.anthropic.com/claude/docs/mcp) - Official MCP docs

---

!!! success "Integration Complete!"
    You're now ready to manage n8n workflows through natural language conversations with Claude AI! 🎉
