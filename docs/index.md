# n8n MCP Workflow Builder

**AI-powered n8n workflow management via Model Context Protocol**

---

## What is n8n MCP Workflow Builder?

The n8n MCP Workflow Builder is a powerful MCP (Model Context Protocol) server that enables AI assistants like Claude and Cursor IDE to create, manage, and monitor n8n workflows through natural language interactions. It acts as a bridge between AI interfaces and your n8n automation platform.

<div class="grid cards" markdown>

-   :material-clock-fast:{ .lg .middle } **Get Started in 10 Minutes**

    ---

    Install via npm and configure your first n8n instance

    [:octicons-arrow-right-24: Installation Guide](getting-started/installation/npm-installation.md)

-   :material-book-open-variant:{ .lg .middle } **Learn the Basics**

    ---

    Follow the quick start tutorial to create your first workflow with Claude

    [:octicons-arrow-right-24: Quick Start Tutorial](getting-started/quick-start/first-workflow.md)

-   :material-api:{ .lg .middle } **API Reference**

    ---

    Comprehensive API documentation for all 17 MCP tools

    [:octicons-arrow-right-24: API Documentation](api/overview.md)

-   :material-help-circle:{ .lg .middle } **Examples & Tutorials**

    ---

    Explore workflow patterns, integrations, and troubleshooting guides

    [:octicons-arrow-right-24: View Examples](examples/workflows/basic-patterns.md)

</div>

---

## Key Features

### :fontawesome-solid-layer-group: Multi-Instance Support
Manage multiple n8n environments (production, staging, development) from a single MCP server with intelligent instance routing.

### :fontawesome-solid-wand-magic-sparkles: Natural Language Workflows
Create and manage workflows through conversational AI - no manual JSON editing required.

### :fontawesome-solid-puzzle-piece: 17 MCP Tools
Comprehensive toolset for workflows, executions, tags, and credentials management.

### :fontawesome-solid-rocket: Quick Integration
Seamless integration with Claude Desktop and Cursor IDE via MCP protocol.

### :fontawesome-solid-shield-halved: Secure by Default
Built-in credential protection, API key encryption, and secure multi-instance configuration.

### :fontawesome-solid-chart-line: Real-time Monitoring
Track workflow executions, monitor performance, and debug issues with execution statistics.

---

## Quick Start

### Installation

=== "NPM (Recommended)"

    ```bash
    # Install globally
    npm install -g @kernel.salacoste/n8n-workflow-builder

    # Verify installation
    npx @kernel.salacoste/n8n-workflow-builder --version
    ```

=== "NPX (No Installation)"

    ```bash
    # Run directly without installation
    npx @kernel.salacoste/n8n-workflow-builder
    ```

=== "Manual Installation"

    ```bash
    # Clone repository
    git clone https://github.com/salacoste/mcp-n8n-workflow-builder.git
    cd mcp-n8n-workflow-builder

    # Install dependencies
    npm install

    # Build project
    npm run build
    ```

### Configuration

Create `.config.json` for multi-instance setup:

```json
{
  "environments": {
    "production": {
      "n8n_host": "https://n8n.example.com",
      "n8n_api_key": "your_production_api_key"
    },
    "development": {
      "n8n_host": "http://localhost:5678",
      "n8n_api_key": "your_development_api_key"
    }
  },
  "defaultEnv": "development"
}
```

[:octicons-arrow-right-24: Full Configuration Guide](getting-started/installation/configuration.md)

### Claude Desktop Integration

Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "n8n-workflow-builder": {
      "command": "npx",
      "args": ["@kernel.salacoste/n8n-workflow-builder"]
    }
  }
}
```

[:octicons-arrow-right-24: Detailed Integration Guide](getting-started/quick-start/claude-desktop.md)

---

## Use Cases

### :fontawesome-solid-calendar-days: Scheduled Automation
Create workflows with cron triggers for periodic tasks like data backups, report generation, and system monitoring.

### :fontawesome-solid-link: API Integration
Connect external services and APIs with natural language instructions - no manual node configuration needed.

### :fontawesome-solid-database: Data Processing
Build data transformation pipelines that extract, transform, and load data between systems.

### :fontawesome-solid-bell: Webhook Receivers
Set up HTTP endpoints that respond to external events and trigger automated workflows.

### :fontawesome-solid-robot: AI-Powered Workflows
Leverage Claude AI to intelligently generate workflow logic based on your business requirements.

---

## What's New in v0.9.1

:sparkles: **Latest Updates:**

- ✅ Full MCP notification handler support
- ✅ Fixed "Method 'notifications/initialized' not found" error
- ✅ Package size optimization (1.3MB → 278KB)
- ✅ Multi-instance architecture with intelligent routing
- ✅ Enhanced credential management with schema validation

[:octicons-arrow-right-24: View Full Changelog](about/changelog.md)

---

## System Requirements

| Requirement | Version | Notes |
|-------------|---------|-------|
| **Node.js** | 14.0.0+ | Recommended: 18.x or 20.x |
| **npm** | 7.0.0+ | Included with Node.js |
| **n8n** | 1.82.3+ | Tested and compatible |
| **OS** | macOS, Linux, Windows WSL2 | Full cross-platform support |

---

## Community & Support

<div class="grid cards" markdown>

-   :fontawesome-brands-github: **GitHub Repository**

    ---

    Report issues, request features, and contribute to the project

    [:octicons-arrow-right-24: Visit Repository](https://github.com/salacoste/mcp-n8n-workflow-builder)

-   :fontawesome-solid-bug: **Bug Reports**

    ---

    Found a bug? Let us know!

    [:octicons-arrow-right-24: Report Issue](https://github.com/salacoste/mcp-n8n-workflow-builder/issues)

-   :fontawesome-solid-code-pull-request: **Contributing**

    ---

    Learn how to contribute to the project

    [:octicons-arrow-right-24: Contribution Guide](about/contributing.md)

-   :fontawesome-solid-book: **Documentation**

    ---

    Comprehensive guides and API reference

    [:octicons-arrow-right-24: Browse Docs](getting-started/installation/npm-installation.md)

</div>

---

## License

This project is licensed under the MIT License. See [LICENSE](about/license.md) for details.

---

## Next Steps

Ready to get started? Follow our installation guide:

[:octicons-arrow-right-24: Install n8n MCP Workflow Builder](getting-started/installation/npm-installation.md){ .md-button .md-button--primary }
