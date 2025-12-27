# Contributing Guidelines

Thank you for your interest in contributing to the n8n MCP Workflow Builder! This guide will help you get started.

---

## Quick Start

```bash
# 1. Fork and clone
git clone https://github.com/YOUR_USERNAME/mcp-n8n-workflow-builder.git
cd mcp-n8n-workflow-builder

# 2. Install dependencies
npm install

# 3. Build project
npm run build

# 4. Run tests
npm test

# 5. Start development server
npm run dev
```

---

## Code of Conduct

- Be respectful and constructive
- Welcome newcomers and help others learn
- Focus on what is best for the community
- Show empathy and kindness

Report violations to project maintainers.

---

## How to Contribute

### Reporting Bugs

1. **Search existing issues** to avoid duplicates
2. **Use bug report template** (see [Bug Reporting](../troubleshooting/error-reference.md#getting-additional-help))
3. **Include:**
   - MCP server version
   - n8n version
   - Node.js version
   - Steps to reproduce
   - Expected vs actual behavior
   - Error messages with `DEBUG=true`
   - Configuration (sanitized)

### Suggesting Features

1. **Check existing feature requests**
2. **Describe use case** and motivation
3. **Propose solution** with examples
4. **Consider alternatives** you've explored
5. **Add context** (mockups, related features)

### Contributing Code

1. **Find or create issue**
2. **Fork repository**
3. **Create feature branch:** `git checkout -b feature/your-feature`
4. **Make changes** following code style
5. **Write tests** for new functionality
6. **Run tests:** `npm test`
7. **Update documentation**
8. **Commit:** `git commit -m "feat: add your feature"`
9. **Push:** `git push origin feature/your-feature`
10. **Create pull request**

---

## Development Setup

### Prerequisites

- **Node.js:** v14 or higher
- **npm:** Latest version
- **n8n instance:** For testing (local or cloud)
- **Git:** For version control

### Environment Setup

```bash
# Install dependencies
npm install

# Create configuration
cp .env.example .env

# Edit .env with your n8n credentials
N8N_HOST=https://your-n8n-instance.com
N8N_API_KEY=your_api_key

# Build project
npm run build

# Run in development mode
npm run dev
```

### Development Scripts

```bash
npm run clean        # Remove build artifacts
npm run build        # Compile TypeScript
npm run dev          # Watch mode for development
npm start            # Run compiled server
npm test             # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

---

## Code Style

### TypeScript

- **Strict mode** enabled
- **ESLint** for linting
- **Prettier** for formatting

### Naming Conventions

```typescript
// Classes: PascalCase
class EnvironmentManager {}

// Functions/Methods: camelCase
function createWorkflow() {}

// Constants: UPPER_SNAKE_CASE
const DEFAULT_PORT = 3456;

// Interfaces: PascalCase with I prefix (optional)
interface WorkflowParams {}

// Files: kebab-case
// environment-manager.ts
// n8n-api-wrapper.ts
```

### File Organization

```
src/
├── index.ts              # Entry point
├── services/             # Business logic
│   ├── environmentManager.ts
│   ├── n8nApiWrapper.ts
│   └── __tests__/        # Unit tests
├── types/                # TypeScript types
│   └── api.ts
└── utils/                # Utilities
    └── validation.ts
```

---

## Code Patterns

### Multi-Instance Tool Pattern

All MCP tools must support optional `instance` parameter:

```typescript
interface ToolParams {
  instance?: string;  // Always optional
  // ... other parameters
}
```

### Instance Resolution Pattern

```typescript
private async callWithInstance<T>(
  instanceSlug: string | undefined,
  apiCall: () => Promise<T>
): Promise<T> {
  // Validate instance exists if provided
  // Use default if no instance specified
  // Execute API call
  // Provide helpful error messages
}
```

### Error Handling Pattern

```typescript
private handleApiError(context: string, error: unknown): never {
  logger.error(`API error during ${context}`);
  if (axios.isAxiosError(error)) {
    logger.error(`Status: ${error.response?.status}`);
    logger.error(`Response: ${JSON.stringify(error.response?.data)}`);
  }
  throw new Error(`API error ${context}: ${error.message}`);
}
```

---

## Testing Requirements

### Unit Tests

- **Coverage:** Minimum 80%
- **Location:** `src/services/__tests__/`
- **Framework:** Jest
- **Run:** `npm test`

```typescript
// Example unit test
describe('EnvironmentManager', () => {
  it('should load configuration successfully', () => {
    const manager = EnvironmentManager.getInstance();
    expect(manager).toBeDefined();
  });
});
```

### Integration Tests

- **Location:** Project root (`test-*.js`)
- **Run:** `node test-mcp-tools.js`
- **Cleanup:** Always clean up test data

```javascript
// Example integration test
async function testCreateWorkflow() {
  const workflow = await createWorkflow({
    name: 'Test Workflow',
    nodes: [...]
  });

  try {
    expect(workflow.id).toBeDefined();
    expect(workflow.name).toBe('Test Workflow');
  } finally {
    await deleteWorkflow(workflow.id);
  }
}
```

---

## Documentation Standards

### Code Documentation

```typescript
/**
 * Creates a new workflow in the specified n8n instance.
 *
 * @param params - Workflow creation parameters
 * @param params.instance - Optional instance identifier
 * @param params.name - Workflow name
 * @param params.nodes - Array of workflow nodes
 * @returns Created workflow with ID
 * @throws {Error} If workflow creation fails
 */
async createWorkflow(params: CreateWorkflowParams): Promise<Workflow> {
  // Implementation
}
```

### README Updates

Update README.md for user-facing changes:

- New tools
- New features
- Breaking changes
- Configuration changes

### CHANGELOG Updates

Follow [Keep a Changelog](https://keepachangelog.com/) format:

```markdown
## [Version] - YYYY-MM-DD

### Added
- New feature description

### Changed
- Changed behavior description

### Fixed
- Bug fix description
```

---

## Pull Request Process

### PR Checklist

- [ ] Tests pass (`npm test`)
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] No breaking changes (or documented)
- [ ] Commits follow conventional commits
- [ ] PR description complete

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test updates
- `chore`: Build/tooling changes

**Examples:**
```
feat(api): add support for workflow templates
fix(auth): handle expired API keys gracefully
docs(readme): update installation instructions
```

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] No breaking changes
```

---

## Review Criteria

Pull requests will be reviewed for:

1. **Functionality:** Does it work as intended?
2. **Code Quality:** Is it maintainable and well-structured?
3. **Tests:** Are there adequate tests?
4. **Documentation:** Is it properly documented?
5. **Performance:** Are there performance implications?
6. **Security:** Are there security concerns?
7. **Breaking Changes:** Are they necessary and documented?

---

## Adding New Features

### Adding New MCP Tool

1. **Define tool schema** in `src/index.ts`:
```typescript
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "new_tool",
      description: "Tool description",
      inputSchema: {
        type: "object",
        properties: {
          instance: {
            type: "string",
            description: "Instance identifier (optional)"
          },
          // ... other parameters
        },
        required: ["param1", "param2"]
      }
    }
  ]
}));
```

2. **Implement handler**:
```typescript
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "new_tool") {
    const result = await n8nApi.newToolMethod(request.params.arguments);
    return {
      content: [{
        type: "text",
        text: JSON.stringify(result, null, 2)
      }]
    };
  }
});
```

3. **Add to N8NApiWrapper**:
```typescript
async newToolMethod(params: NewToolParams): Promise<Result> {
  return this.callWithInstance(params.instance, async () => {
    // Implementation
  });
}
```

4. **Write tests**
5. **Update documentation**

### Adding Workflow Template

1. **Define in `src/services/promptsService.ts`**:
```typescript
const NEW_TEMPLATE: Prompt = {
  id: "new-template",
  name: "New Template",
  description: "Template description",
  template: {
    nodes: [...],
    connections: [...]
  },
  variables: [
    {
      name: "variable_name",
      description: "Variable description",
      type: "string",
      default: "default_value"
    }
  ]
};
```

2. **Add to exports**
3. **Test with Claude Desktop**
4. **Update documentation**

---

## Getting Help

- **Documentation:** Check [docs/](../)
- **Issues:** Search [GitHub Issues](https://github.com/salacoste/mcp-n8n-workflow-builder/issues)
- **Discussions:** Ask in [GitHub Discussions](https://github.com/salacoste/mcp-n8n-workflow-builder/discussions)

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing!** 🎉

---

**Document Version:** 1.0
**Last Updated:** December 2025
