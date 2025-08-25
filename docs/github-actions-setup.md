# GitHub Actions Setup for n8n Workflow Deployment

This document explains how to configure GitHub Actions for automated n8n workflow deployments to `n8n.informedcrew.com`.

## Required GitHub Secrets

To enable automated workflow deployments, you need to configure the following secrets in your GitHub repository:

### 1. Navigate to Repository Settings

1. Go to your GitHub repository
2. Click on **Settings** tab
3. In the left sidebar, click **Secrets and variables** → **Actions**

### 2. Add Required Secrets

Add the following secrets:

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `N8N_API_URL` | The n8n instance URL | `https://n8n.informedcrew.com` |
| `N8N_API_KEY` | Your n8n API key | `your-api-key-here` |
| `N8N_WORKFLOW_ID` | The ID of the workflow to update | `12345678-1234-1234-1234-123456789012` |

### 3. How to Get n8n API Key

1. Log into your n8n instance at `https://n8n.informedcrew.com`
2. Go to **Settings** → **API**
3. Click **Create API Key**
4. Give it a name (e.g., "GitHub Actions Deployment")
5. Copy the generated API key

### 4. How to Get Workflow ID

1. Open the workflow you want to deploy in n8n
2. Look at the URL: `https://n8n.informedcrew.com/workflow/12345678-1234-1234-1234-123456789012`
3. The last part is your workflow ID: `12345678-1234-1234-1234-123456789012`

## Workflow Deployment Process

The GitHub Actions workflow will:

1. **Trigger**: Run on every push to the `main` branch
2. **Deploy**: Update the specified workflow in n8n using the API
3. **Release**: Create a new semantic release with changelog

## Workflow File Structure

The deployment script expects workflow files in the `workflows/` directory:

```
workflows/
├── cipher-weaviate-integration.json
└── other-workflows.json
```

## Testing the Deployment

To test the deployment locally:

```bash
# Set environment variables
export N8N_API_URL="https://n8n.informedcrew.com"
export N8N_API_KEY="your-api-key"
export N8N_WORKFLOW_ID="your-workflow-id"

# Run deployment
npm run deploy:workflow
```

## Troubleshooting

### Common Issues

1. **401 Unauthorized**: Check your `N8N_API_KEY` is correct
2. **404 Not Found**: Verify the `N8N_WORKFLOW_ID` exists
3. **Network Error**: Ensure `N8N_API_URL` is accessible

### Debug Mode

To enable debug logging, add this to your workflow:

```yaml
- name: Deploy to n8n
  env:
    N8N_API_URL: ${{ secrets.N8N_API_URL }}
    N8N_API_KEY: ${{ secrets.N8N_API_KEY }}
    N8N_WORKFLOW_ID: ${{ secrets.N8N_WORKFLOW_ID }}
    DEBUG: "true"
  run: |
    npm run deploy:workflow
```

## Security Considerations

- Never commit API keys to the repository
- Use repository secrets for all sensitive data
- Regularly rotate your n8n API keys
- Limit API key permissions to only what's necessary

## Related Files

- `.github/workflows/deploy.yml` - GitHub Actions workflow
- `scripts/deploy-workflow.js` - Deployment script
- `workflows/` - Directory containing workflow JSON files
