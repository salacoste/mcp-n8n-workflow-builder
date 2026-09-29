# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an MCP (Model Context Protocol) server that enables AI-powered management of n8n workflows. It allows Claude AI and Cursor IDE to create, manage, and monitor n8n workflows through natural language via the MCP protocol.

## Common Commands

```bash
# Build the TypeScript project
npm run build

# Run tests
npm test

# Run a single test file
npx jest src/services/__tests__/environmentManager.test.ts

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Start the MCP server (after build)
npm start

# Development mode (watch for TypeScript changes)
npm run dev

# Build and serve documentation locally
npm run docs:dev
```

## Architecture

### Core Components

**Entry Point (`src/index.ts`)**
- `N8NWorkflowServer` class implements the MCP server
- Handles tool calls, resource requests, prompts, and notifications
- Can run in two modes: MCP subprocess (stdin/stdout) or standalone HTTP mode
- Registers 23 MCP tools for workflow, execution, tag, and credential management

**Configuration Layer (`src/config/`)**
- `ConfigLoader` - Singleton that loads config from `.config.json` (multi-instance) or `.env` (single instance fallback)
- Supports multi-instance n8n environments (production, staging, development)

**Environment/API Layer (`src/services/`)**
- `EnvironmentManager` - Singleton managing axios instances per n8n environment with URL normalization
- `N8NApiWrapper` - High-level API wrapper with instance routing for all n8n operations
- `n8nApi.ts` - Lower-level API functions (deprecated, use wrapper instead)

**Workflow Processing**
- `WorkflowBuilder` - Constructs n8n-compatible workflow specifications
- `validation.ts` - Validates and transforms workflow input (connection format conversion, node positioning)

### Data Flow

```
MCP Client (Claude/Cursor)
    ↓
N8NWorkflowServer (index.ts)
    ↓
N8NApiWrapper (services/n8nApiWrapper.ts)
    ↓
EnvironmentManager (services/environmentManager.ts)
    ↓
ConfigLoader (config/configLoader.ts)
    ↓
n8n REST API
```

### Multi-Instance Support

Every tool accepts an optional `instance` parameter to target a specific n8n environment. Without it, the default environment is used.

Configuration format (`.config.json`):
```json
{
  "environments": {
    "production": { "n8n_host": "...", "n8n_api_key": "..." },
    "development": { "n8n_host": "...", "n8n_api_key": "..." }
  },
  "defaultEnv": "development"
}
```

### Key Types (`src/types/`)

- `WorkflowInput` - Input format for creating/updating workflows (uses `LegacyWorkflowConnection[]` for connections)
- `WorkflowSpec` - n8n API format (uses `ConnectionMap` object format)
- `N8NWorkflowResponse`, `N8NExecutionResponse`, etc. - API response types

### Connection Format Transformation

The server accepts a simplified connection format:
```typescript
{ source: "Node1", target: "Node2", sourceOutput: 0, targetInput: 0 }
```

And transforms it to n8n's native format:
```typescript
{ "Node1": { main: [[{ node: "Node2", type: "main", index: 0 }]] } }
```

## n8n API Limitations

Several n8n REST API operations are intentionally blocked or limited:

- **Workflow activation/deactivation** - Returns guidance; activate/deactivate via n8n web interface
- **Workflow execution** - Manual Trigger workflows cannot be executed via API; use webhook triggers instead
- **PATCH workflows** - Not supported (405); use full PUT update instead
- **Credential read/update** - Blocked for security; credentials are write-only via API
- **Credential listing** - Limited to metadata only; no sensitive data exposed

## Testing

Tests are located alongside source files in `__tests__` directories. The project uses Jest with ts-jest for TypeScript support.

Coverage thresholds are set to 80% for branches, functions, lines, and statements.
