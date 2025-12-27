# Story 3.4: Claude Desktop Integration

**Epic:** Epic 3 - Installation & Quick Start Guide
**Story ID:** STORY-3.4
**Status:** Draft
**Created:** 2025-12-27
**Updated:** 2025-12-27

---

## User Story

**As a** Claude Desktop user
**I want** step-by-step integration instructions for connecting the MCP server
**So that** I can use n8n workflow management tools directly from Claude Desktop

---

## Story Description

### Current System Context

Claude Desktop supports MCP (Model Context Protocol) servers through configuration in `claude_desktop_config.json`. The MCP server for n8n runs as a Node.js process that Claude Desktop communicates with via stdio.

**Claude Desktop Config Location:**
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux:** `~/.config/Claude/claude_desktop_config.json`

**Current Configuration Example** (from `/examples/setup_with_claude.md`):
```json
{
  "mcpServers": {
    "n8n-workflow-builder": {
      "command": "node",
      "args": ["/absolute/path/to/build/index.js"],
      "env": {
        "N8N_HOST": "https://n8n.example.com",
        "N8N_API_KEY": "your_key",
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

**MCP Tools Available:** 17 tools across workflows, executions, tags, and credentials management.

### Enhancement: Comprehensive Claude Desktop Integration Guide

Create detailed integration documentation covering:

**Prerequisites Verification:**
- Claude Desktop installed and running
- MCP server installed (npm or manual)
- n8n instance configured and accessible
- Configuration files ready

**Claude Desktop Configuration:**
- Locating config file on each OS
- Understanding config structure
- Adding MCP server configuration
- Configuring environment variables
- Setting up tool permissions (alwaysAllow)

**Configuration Methods:**
- **Method 1:** npm package installation
- **Method 2:** Local build from source
- **Method 3:** Global npm installation

**Verification and Testing:**
- Restarting Claude Desktop
- Verifying MCP server connection
- Testing basic tools
- Troubleshooting connection issues

**Using MCP Tools in Claude:**
- Discovering available tools
- Invoking tools through conversation
- Understanding tool responses
- Best practices for tool usage

---

## Acceptance Criteria

### Documentation Requirements

**AC1: Prerequisites Verification**
- [ ] Checklist of prerequisites:
  - ✅ Claude Desktop installed (version 0.7.0+)
  - ✅ MCP server installed via npm or built from source
  - ✅ n8n instance running and accessible
  - ✅ n8n API key generated
  - ✅ Configuration file ready (.env or .config.json)
- [ ] Verification commands for each prerequisite
- [ ] Links to installation guides (Story 3.1, 3.2, 3.3)

**AC2: Locating Claude Desktop Config**
- [ ] Platform-specific paths documented:
  - **macOS:**
    ```bash
    ~/Library/Application Support/Claude/claude_desktop_config.json
    ```
  - **Windows:**
    ```cmd
    %APPDATA%\Claude\claude_desktop_config.json
    ```
  - **Linux:**
    ```bash
    ~/.config/Claude/claude_desktop_config.json
    ```
- [ ] Command to check if file exists:
  ```bash
  # macOS/Linux
  ls -la ~/Library/Application\ Support/Claude/claude_desktop_config.json

  # Windows (PowerShell)
  Test-Path "$env:APPDATA\Claude\claude_desktop_config.json"
  ```
- [ ] Creating file if it doesn't exist
- [ ] Backup recommendation before editing

**AC3: Configuration Method 1 - NPM Package**
- [ ] Step-by-step configuration for global npm install:
  ```json
  {
    "mcpServers": {
      "n8n-workflow-builder": {
        "command": "npx",
        "args": [
          "@bmad-labs/mcp-n8n-workflow-builder"
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
- [ ] Environment variables explanation
- [ ] Port selection guidance (use non-standard port like 58921)
- [ ] alwaysAllow tools explanation and security implications

**AC4: Configuration Method 2 - Local Build**
- [ ] Step-by-step for local development build:
  ```json
  {
    "mcpServers": {
      "n8n-workflow-builder": {
        "command": "node",
        "args": [
          "/absolute/path/to/mcp-n8n-workflow-builder/build/index.js"
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
- [ ] **Important:** Use absolute paths (not relative)
- [ ] Path examples for each OS:
  - macOS: `/Users/username/projects/mcp-n8n-workflow-builder/build/index.js`
  - Windows: `C:\\Users\\username\\projects\\mcp-n8n-workflow-builder\\build\\index.js`
  - Linux: `/home/username/projects/mcp-n8n-workflow-builder/build/index.js`
- [ ] Path validation commands

**AC5: Configuration Method 3 - Global NPM Install**
- [ ] For users who installed globally:
  ```json
  {
    "mcpServers": {
      "n8n-workflow-builder": {
        "command": "mcp-n8n-workflow-builder",
        "env": {
          "N8N_HOST": "https://your-instance.app.n8n.cloud",
          "N8N_API_KEY": "your_api_key_here",
          "MCP_PORT": "58921"
        }
      }
    }
  }
  ```
- [ ] When this method is available
- [ ] Troubleshooting if command not found

**AC6: Multi-Instance Configuration**
- [ ] Using .config.json for multiple environments:
  ```json
  {
    "mcpServers": {
      "n8n-workflow-builder": {
        "command": "npx",
        "args": ["@bmad-labs/mcp-n8n-workflow-builder"],
        "env": {
          "MCP_PORT": "58921"
        }
      }
    }
  }
  ```
- [ ] Note: .config.json file in project root will be auto-loaded
- [ ] Alternative: Specify config file path via environment variable

**AC7: Tool Permissions (alwaysAllow)**
- [ ] Explanation of alwaysAllow array:
  - Tools that don't require user confirmation
  - Read-only operations recommended
  - Security consideration for write operations
- [ ] Recommended safe tools:
  ```json
  "alwaysAllow": [
    "list_workflows",
    "get_workflow",
    "list_executions",
    "get_execution",
    "get_tags",
    "list_credentials"
  ]
  ```
- [ ] **Warning:** Don't add write operations without understanding risks:
  - `create_workflow` - creates new workflows
  - `update_workflow` - modifies workflows
  - `delete_workflow` - permanently deletes
  - `activate_workflow` - enables workflows
- [ ] Full list reference to Epic 4 Story 4.1-4.4

**AC8: Verification and Testing**
- [ ] Step 1: Save claude_desktop_config.json
- [ ] Step 2: Completely quit Claude Desktop:
  - macOS: Cmd+Q (not just close window)
  - Windows: Exit from system tray
  - Linux: Close all windows and background process
- [ ] Step 3: Restart Claude Desktop
- [ ] Step 4: Verify MCP server connection:
  - Look for MCP server in tools/integrations
  - Check for "n8n-workflow-builder" in available servers
- [ ] Step 5: Test basic tool:
  ```
  User: "Can you list my n8n workflows?"
  Expected: Claude uses list_workflows tool and shows results
  ```
- [ ] Step 6: Verify each tool category:
  - Workflows management
  - Executions tracking
  - Tags organization

**AC9: Troubleshooting**
- [ ] Common issues with solutions:
  1. **MCP server not showing up**
     - Symptom: No n8n tools available
     - Solution: Check JSON syntax, restart Claude Desktop
  2. **Connection timeout**
     - Symptom: Tools fail to execute
     - Solution: Verify n8n host URL and API key
  3. **Permission denied**
     - Symptom: Cannot execute tools
     - Solution: Check alwaysAllow configuration
  4. **Path not found (local build)**
     - Symptom: Command fails to start
     - Solution: Verify absolute path to build/index.js
  5. **Port conflict**
     - Symptom: Server won't start
     - Solution: Change MCP_PORT to different value
  6. **Invalid JSON**
     - Symptom: Config file error on startup
     - Solution: Validate JSON syntax (use jsonlint.com)
- [ ] Debug logging instructions:
  - Add `"DEBUG": "true"` to env
  - Check Claude Desktop logs
  - Check MCP server output

**AC10: Using Tools in Claude**
- [ ] How to discover available tools:
  ```
  "What n8n tools do you have available?"
  ```
- [ ] Example conversations:
  ```
  Example 1 - List workflows:
  User: "Show me all my n8n workflows"
  Claude: Uses list_workflows tool

  Example 2 - Get specific workflow:
  User: "Get details for workflow ID 123"
  Claude: Uses get_workflow tool

  Example 3 - Check executions:
  User: "Show me recent failed workflow executions"
  Claude: Uses list_executions with status filter
  ```
- [ ] Best practices:
  - Be specific in requests
  - Provide workflow IDs when known
  - Use filters to narrow results
  - Review tool outputs before acting
- [ ] Link to Epic 4 for full tool documentation

---

## Technical Implementation Notes

### Documentation Structure

```markdown
# Claude Desktop Integration Guide

## Prerequisites

### Requirements Checklist
- Claude Desktop version
- MCP server installation
- n8n configuration

### Verification
- Check versions
- Confirm access

## Locating Config File

### Platform-Specific Paths
- macOS path
- Windows path
- Linux path

### Creating/Backing Up
- Check existence
- Create if needed
- Backup existing

## Configuration Methods

### Method 1: NPM Package (Recommended)
- Full configuration
- Environment variables
- Tool permissions

### Method 2: Local Build
- Absolute path configuration
- Platform-specific paths
- Validation

### Method 3: Global Install
- Command configuration
- When available

### Multi-Instance Setup
- Using .config.json
- Environment routing

## Tool Permissions

### alwaysAllow Explained
- Security implications
- Recommended safe tools
- Write operation warnings

### Full Tool List
- Link to Epic 4 documentation

## Verification & Testing

### Step-by-Step Verification
1. Save configuration
2. Quit Claude Desktop
3. Restart application
4. Check MCP server
5. Test basic tool
6. Verify tool categories

### Expected Behavior
- Success indicators
- Tool responses

## Troubleshooting

### Common Issues
1. Server not showing
2. Connection timeout
3. Permission denied
4. Path not found
5. Port conflict
6. Invalid JSON

### Debug Logging
- Enable DEBUG mode
- Check logs
- Interpret errors

## Using Tools in Claude

### Discovery
- Ask about available tools
- Tool categories

### Example Conversations
- List workflows
- Get workflow details
- Check executions
- Manage tags

### Best Practices
- Be specific
- Use filters
- Review outputs
- Reference tool docs

## Next Steps
- Creating Your First Workflow →
- Full Tool Documentation (Epic 4) →
```

### Content Sources

**Primary References:**
- `/examples/setup_with_claude.md` - current setup example
- `/README.md` - Claude Desktop integration section
- `/src/index.ts` - MCP tool registration
- Claude Desktop official documentation
- MCP protocol documentation

### Screenshots Needed

1. **File Explorer:** claude_desktop_config.json location (macOS)
2. **Text Editor:** Example configuration file
3. **Claude Desktop:** MCP server showing in integrations
4. **Claude Desktop:** Tool execution example
5. **Claude Desktop:** Successful workflow list response
6. **Diagram:** Configuration flow (file → Claude Desktop → MCP server → n8n)

---

## Dependencies

### Upstream Dependencies
- **Story 3.1** OR **Story 3.2** (Installation complete)
- **Story 3.3** (Configuration ready)

### Downstream Dependencies
- **Story 3.5** (First Workflow Tutorial) assumes Claude Desktop is configured
- **Epic 4 Stories** provide detailed tool documentation

### Related Stories
- **Epic 5 Story 5.4** (Instance Routing) - using multiple instances in Claude
- **Epic 8 Story 8.1** (Common Issues) - troubleshooting reference

---

## Definition of Done

### Content Checklist
- [ ] Prerequisites clearly documented
- [ ] All three configuration methods documented
- [ ] Platform-specific paths for all OS
- [ ] Tool permissions explained with security warnings
- [ ] Verification steps tested and documented
- [ ] Troubleshooting covers 6+ common issues
- [ ] Example conversations provided
- [ ] Best practices section complete

### Quality Checklist
- [ ] All configurations tested on macOS, Windows, Linux
- [ ] Screenshots from actual Claude Desktop
- [ ] JSON syntax validated
- [ ] Tool execution tested for each category
- [ ] Security warnings reviewed
- [ ] Markdown formatting validated
- [ ] Internal links working

### Review Checklist
- [ ] Peer review by Dev Agent
- [ ] Security review for alwaysAllow recommendations
- [ ] Editor review for clarity
- [ ] User testing with fresh Claude Desktop install
- [ ] QA Agent validation

---

## Estimation

**Effort:** 6 story points (4-5 hours)

**Breakdown:**
- Prerequisites and config file location: 30 minutes
- Configuration methods documentation: 90 minutes
- Tool permissions and security: 45 minutes
- Verification and testing: 60 minutes
- Troubleshooting: 45 minutes
- Example conversations and best practices: 45 minutes
- Screenshots and testing: 45 minutes

**Page Count:** 8-10 pages

---

## Notes

### Critical Success Factors
- Clear platform-specific instructions
- Security warnings for alwaysAllow configuration
- Absolute vs relative path clarification
- Complete quit/restart instructions (common mistake)

### Security Considerations
- API keys in environment variables (visible to Claude Desktop)
- alwaysAllow permissions implications
- Recommend read-only tools for alwaysAllow
- Full tool permissions documentation link

### Common User Mistakes to Address
1. Using relative paths instead of absolute
2. Not completely quitting Claude Desktop (just closing window)
3. Invalid JSON syntax (missing commas, quotes)
4. Including all 17 tools in alwaysAllow without understanding
5. Forgetting to restart Claude Desktop after config change

---

**Story Owner:** Technical Writer (Scribe Persona)
**Reviewers:** Dev Agent, Security Agent, QA Agent
**Target Milestone:** Epic 3 - Phase 2 (Stories 3.4-3.6)
