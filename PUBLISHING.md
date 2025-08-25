# Automated Workflow Deployment

This guide provides instructions for the automated deployment of n8n workflows to `n8n.informedcrew.com` using semantic versioning and GitHub Actions.

## Prerequisites

Before deploying workflows, make sure you have:

1. Access to n8n.informedcrew.com with API permissions
2. GitHub repository with configured secrets
3. Properly configured package.json with semantic versioning
4. All changes committed to git using conventional commits

## Deployment Process

### 1. Configure GitHub Secrets

Set up the following secrets in your GitHub repository:

- `N8N_API_URL`: The n8n instance URL (e.g., `https://n8n.informedcrew.com`)
- `N8N_API_KEY`: Your n8n API key
- `N8N_WORKFLOW_ID`: The ID of the workflow to update

### 2. Commit Changes Using Conventional Commits

All commits must follow the conventional commits format:

```bash
# For new workflow features
git commit -m "workflow-feat: add new integration workflow"

# For workflow bug fixes
git commit -m "workflow-fix: resolve authentication error"

# For workflow improvements
git commit -m "workflow-refactor: optimize search performance"
```

### 3. Push to Main Branch

Push your changes to the main branch to trigger automated deployment:

```bash
git push origin main
```

### 4. Automated Deployment Process

The GitHub Actions workflow will automatically:

1. **Build and Test**: Compile the project and run tests
2. **Deploy Workflow**: Update the workflow in n8n.informedcrew.com
3. **Create Release**: Generate new version and changelog using semantic-release
4. **Tag Release**: Create GitHub release with version tag

### 5. Verify Deployment

After deployment, verify that the workflow is updated in n8n:

1. Log into n8n.informedcrew.com
2. Navigate to the updated workflow
3. Check that changes are reflected
4. Test the workflow functionality

## Troubleshooting

### Deployment Failures

If deployment fails, check the following:

1. **GitHub Secrets Configuration**
   - Verify all required secrets are set
   - Check that API keys are valid and not expired
   - Ensure workflow ID exists in n8n

2. **Authentication Errors**
   ```bash
   # Test API access manually
   curl -H "X-N8N-API-KEY: your-api-key" \
        https://n8n.informedcrew.com/api/v1/workflows
   ```

3. **Workflow Validation Errors**
   - Check workflow JSON syntax
   - Verify node configurations
   - Ensure all required parameters are set

### Version Conflicts

If you encounter version conflicts:

1. **Check existing tags**
   ```bash
   git tag --list
   ```

2. **Verify commit history**
   ```bash
   git log --oneline
   ```

3. **Reset semantic-release if needed**
   ```bash
   npm run release:dry-run
   ```

## Manual Deployment

For emergency deployments or testing:

```bash
# Set environment variables
export N8N_API_URL="https://n8n.informedcrew.com"
export N8N_API_KEY="your-api-key"
export N8N_WORKFLOW_ID="your-workflow-id"

# Deploy workflow
npm run deploy:workflow
```

## Future Updates

To update workflows in the future:

1. Make your workflow changes
2. Commit using conventional commits format
3. Push to main branch
4. Automated deployment will handle the rest 