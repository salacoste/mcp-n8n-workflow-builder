# Contributing to n8n Workflow Builder

Thank you for your interest in contributing to the n8n Workflow Builder MCP Server! This document provides guidelines for contributing to the project, with a focus on semantic versioning and workflow deployment.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Commit Guidelines](#commit-guidelines)
- [Workflow Development](#workflow-development)
- [Pull Request Process](#pull-request-process)
- [Semantic Versioning](#semantic-versioning)
- [Deployment Process](#deployment-process)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## Getting Started

### Prerequisites

- Node.js (v14+ recommended)
- npm
- Git
- Access to n8n.informedcrew.com (for testing deployments)

### Development Setup

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/mcp-n8n-workflow-builder.git
   cd mcp-n8n-workflow-builder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   - Copy `.config.json.example` to `.config.json`
   - Add your n8n API credentials
   - Set up GitHub secrets for automated deployment

4. **Build the project**
   ```bash
   npm run build
   ```

## Commit Guidelines

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages. This ensures automatic semantic versioning and changelog generation.

### Commit Message Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Commit Types

#### For Workflow Changes
- `workflow-feat`: New workflow functionality (minor version bump)
- `workflow-fix`: Bug fixes in workflows (patch version bump)
- `workflow-refactor`: Workflow improvements (patch version bump)
- `workflow-docs`: Documentation updates for workflows (patch version bump)

#### For Core Application Changes
- `feat`: New features (minor version bump)
- `fix`: Bug fixes (patch version bump)
- `docs`: Documentation updates (patch version bump)
- `style`: Code style changes (no version bump)
- `refactor`: Code refactoring (patch version bump)
- `test`: Adding or updating tests (patch version bump)
- `chore`: Maintenance tasks (patch version bump)

### Examples

```bash
# Workflow feature
git commit -m "workflow-feat: add Cipher-Weaviate integration workflow

- Add webhook trigger for search queries
- Implement decision routing logic
- Add result combination node
- Configure environment variables"

# Workflow fix
git commit -m "workflow-fix: resolve authentication error in Cipher search node

- Update API endpoint configuration
- Fix header parameter formatting
- Add error handling for failed requests"

# Core application feature
git commit -m "feat: add multi-instance support for n8n environments

- Support multiple n8n instances (production, staging, dev)
- Add environment configuration management
- Update all MCP tools for instance targeting"

# Documentation update
git commit -m "docs: update deployment guide for semantic versioning

- Add GitHub Actions setup instructions
- Document conventional commits format
- Include troubleshooting section"
```

## Workflow Development

### Workflow Structure

Workflows should be stored in the `workflows/` directory with descriptive names:

```
workflows/
├── cipher-weaviate-integration.json
├── api-data-polling.json
└── other-workflows.json
```

### Workflow Naming Convention

- Use kebab-case for workflow file names
- Include descriptive functionality in the name
- Example: `cipher-weaviate-integration.json`

### Testing Workflows

1. **Local Testing**
   ```bash
   npm run workflow:test
   ```

2. **Dry Run Deployment**
   ```bash
   npm run deploy:workflow:dry-run
   ```

3. **Version Check**
   ```bash
   npm run version:check
   ```

## Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make your changes**
   - Follow the commit guidelines
   - Test your changes locally
   - Update documentation if needed

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```

4. **Push to your fork**
   ```bash
   git push origin feat/your-feature-name
   ```

5. **Create a Pull Request**
   - Use the PR template
   - Describe your changes clearly
   - Link any related issues

## Semantic Versioning

This project uses semantic versioning (SemVer) for automated releases. Version numbers follow the format `MAJOR.MINOR.PATCH`.

### Version Bumps

- **MAJOR**: Breaking changes (incompatible API changes)
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Automatic Versioning

The semantic-release tool automatically:
- Analyzes commit messages
- Determines the appropriate version bump
- Generates changelog entries
- Creates GitHub releases

### Commit Types and Version Bumps

| Commit Type | Version Bump | Description |
|-------------|--------------|-------------|
| `feat`, `workflow-feat` | MINOR | New features |
| `fix`, `workflow-fix` | PATCH | Bug fixes |
| `workflow-refactor` | PATCH | Workflow improvements |
| `docs`, `workflow-docs` | PATCH | Documentation updates |
| `style`, `chore` | None | No version bump |

## Deployment Process

### Automated Deployment

1. **Push to main branch**
   - Triggers GitHub Actions workflow
   - Runs tests and validation
   - Deploys to n8n.informedcrew.com

2. **Release Process**
   - Semantic-release analyzes commits
   - Creates new version if needed
   - Generates changelog
   - Creates GitHub release

### Important: Update Workspace Memory

**⚠️ When significant changes are made to the project (like semantic versioning implementation, major feature additions, or architectural changes), always remember to:**

1. **Check Cipher workspace-specific memories** to ensure they reflect current project state
2. **Update workspace memory** with new project details, features, and configurations
3. **Verify alignment** with general memory requirements and project standards

This ensures that AI agents working with the project have access to current and accurate information about the project's capabilities, structure, and deployment process.

### Manual Deployment

For testing or emergency deployments:

```bash
# Set environment variables
export N8N_API_URL="https://n8n.informedcrew.com"
export N8N_API_KEY="your-api-key"
export N8N_WORKFLOW_ID="your-workflow-id"

# Deploy workflow
npm run deploy:workflow
```

### Deployment Configuration

Required GitHub secrets for automated deployment:

- `N8N_API_URL`: n8n instance URL
- `N8N_API_KEY`: n8n API key
- `N8N_WORKFLOW_ID`: Target workflow ID

## Troubleshooting

### Common Issues

1. **Commit Message Validation Errors**
   - Ensure commit messages follow conventional format
   - Use appropriate commit types
   - Include descriptive messages

2. **Deployment Failures**
   - Check GitHub secrets configuration
   - Verify n8n API credentials
   - Ensure workflow ID exists

3. **Version Conflicts**
   - Check for existing version tags
   - Ensure proper commit history
   - Verify semantic-release configuration

### Getting Help

- Check existing issues and discussions
- Create a new issue with detailed information
- Include error messages and logs
- Provide steps to reproduce the problem

## License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.
