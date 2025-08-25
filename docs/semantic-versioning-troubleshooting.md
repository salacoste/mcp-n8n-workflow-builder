# Semantic Versioning Troubleshooting Guide

This guide helps you resolve common issues with semantic versioning and automated workflow deployment.

## Table of Contents

- [Common Issues](#common-issues)
- [Commit Message Problems](#commit-message-problems)
- [Deployment Failures](#deployment-failures)
- [Version Conflicts](#version-conflicts)
- [GitHub Actions Issues](#github-actions-issues)
- [Debugging Commands](#debugging-commands)

## Common Issues

### Issue: No New Version Created

**Symptoms:**
- Push to main branch doesn't create a new release
- Semantic-release reports "no new version to publish"

**Causes:**
- No conventional commits since last release
- All commits are of types that don't trigger version bumps
- Branch protection rules preventing deployment

**Solutions:**
1. Check commit history:
   ```bash
   git log --oneline --since="1 week ago"
   ```

2. Verify commit types:
   ```bash
   git log --pretty=format:"%h %s" --since="1 week ago"
   ```

3. Ensure commits follow conventional format:
   ```bash
   # Good examples
   git commit -m "feat: add new workflow feature"
   git commit -m "workflow-fix: resolve authentication error"
   
   # Bad examples
   git commit -m "update workflow"
   git commit -m "fix bug"
   ```

### Issue: Wrong Version Bump

**Symptoms:**
- Minor version bump when expecting patch
- No version bump when expecting one

**Causes:**
- Incorrect commit type used
- Commit message doesn't follow conventional format

**Solutions:**
1. Check commit types and their effects:
   - `feat`, `workflow-feat` → MINOR version bump
   - `fix`, `workflow-fix` → PATCH version bump
   - `docs`, `style`, `chore` → No version bump

2. Amend commit message if needed:
   ```bash
   git commit --amend -m "workflow-fix: resolve authentication error"
   git push --force-with-lease origin main
   ```

## Commit Message Problems

### Issue: Commit Message Validation Fails

**Symptoms:**
- Git hooks reject commit
- Error: "Commit message does not follow conventional format"

**Solutions:**
1. Use the correct format:
   ```
   <type>[optional scope]: <description>
   
   [optional body]
   
   [optional footer(s)]
   ```

2. Use valid commit types:
   - `feat`, `workflow-feat`
   - `fix`, `workflow-fix`
   - `docs`, `workflow-docs`
   - `style`, `refactor`, `test`, `chore`

3. Check commit message template:
   ```bash
   cat .gitmessage
   ```

### Issue: Commit Message Too Long

**Symptoms:**
- Warning about commit message length
- Commit rejected by validation

**Solutions:**
1. Keep subject line under 50 characters
2. Use body for detailed description:
   ```bash
   git commit -m "workflow-feat: add Cipher integration

   - Add webhook trigger for search queries
   - Implement decision routing logic
   - Add result combination node
   - Configure environment variables"
   ```

## Deployment Failures

### Issue: GitHub Actions Deployment Fails

**Symptoms:**
- GitHub Actions workflow fails
- Error in deployment step

**Solutions:**
1. Check GitHub secrets:
   - Go to repository Settings → Secrets and variables → Actions
   - Verify `N8N_API_URL`, `N8N_API_KEY`, `N8N_WORKFLOW_ID` are set

2. Test API access manually:
   ```bash
   curl -H "X-N8N-API-KEY: your-api-key" \
        https://n8n.informedcrew.com/api/v1/workflows
   ```

3. Check workflow logs:
   - Go to Actions tab in GitHub
   - Click on failed workflow run
   - Review error messages

### Issue: Workflow Not Found

**Symptoms:**
- Error: "Workflow not found"
- 404 response from n8n API

**Solutions:**
1. Verify workflow ID:
   - Log into n8n.informedcrew.com
   - Open the target workflow
   - Copy the ID from the URL

2. Check workflow exists:
   ```bash
   curl -H "X-N8N-API-KEY: your-api-key" \
        https://n8n.informedcrew.com/api/v1/workflows/YOUR_WORKFLOW_ID
   ```

3. Create workflow if missing:
   - Use n8n interface to create workflow
   - Update GitHub secret with new workflow ID

### Issue: Authentication Errors

**Symptoms:**
- Error: "401 Unauthorized"
- "Invalid API key" message

**Solutions:**
1. Check API key validity:
   - Log into n8n.informedcrew.com
   - Go to Settings → API
   - Verify API key exists and is active

2. Regenerate API key if needed:
   - Delete old API key
   - Create new API key
   - Update GitHub secret

3. Check API key permissions:
   - Ensure API key has workflow management permissions
   - Verify API access is enabled

## Version Conflicts

### Issue: Version Already Exists

**Symptoms:**
- Error: "Version 1.2.3 already exists"
- Semantic-release fails to create tag

**Solutions:**
1. Check existing tags:
   ```bash
   git tag --list
   ```

2. Delete conflicting tag if needed:
   ```bash
   git tag -d v1.2.3
   git push origin :refs/tags/v1.2.3
   ```

3. Force semantic-release to continue:
   ```bash
   npm run release:dry-run
   ```

### Issue: Git History Problems

**Symptoms:**
- Semantic-release can't analyze commits
- Error: "No commits found"

**Solutions:**
1. Check git history:
   ```bash
   git log --oneline -10
   ```

2. Ensure commits are on main branch:
   ```bash
   git branch -a
   git checkout main
   ```

3. Rebase if needed:
   ```bash
   git rebase main
   ```

## GitHub Actions Issues

### Issue: Workflow Not Triggered

**Symptoms:**
- Push to main doesn't trigger workflow
- No GitHub Actions run

**Solutions:**
1. Check workflow file:
   - Verify `.github/workflows/deploy.yml` exists
   - Check trigger configuration

2. Check branch protection:
   - Go to Settings → Branches
   - Verify main branch allows pushes

3. Check workflow permissions:
   - Go to Settings → Actions → General
   - Ensure workflows can run

### Issue: Workflow Times Out

**Symptoms:**
- GitHub Actions workflow times out
- Deployment step hangs

**Solutions:**
1. Check n8n instance availability:
   ```bash
   curl -I https://n8n.informedcrew.com
   ```

2. Increase timeout in workflow:
   ```yaml
   - name: Deploy to n8n
     timeout-minutes: 10
     env:
       N8N_API_URL: ${{ secrets.N8N_API_URL }}
       N8N_API_KEY: ${{ secrets.N8N_API_KEY }}
       N8N_WORKFLOW_ID: ${{ secrets.N8N_WORKFLOW_ID }}
     run: npm run deploy:workflow
   ```

3. Check for infinite loops in deployment script

## Debugging Commands

### Check Current Status

```bash
# Check git status
git status

# Check recent commits
git log --oneline -5

# Check tags
git tag --list

# Check semantic-release configuration
cat release.config.js

# Test semantic-release
npm run release:dry-run
```

### Test Deployment Locally

```bash
# Set environment variables
export N8N_API_URL="https://n8n.informedcrew.com"
export N8N_API_KEY="your-api-key"
export N8N_WORKFLOW_ID="your-workflow-id"

# Test deployment
npm run deploy:workflow:dry-run

# Test workflow
npm run workflow:test
```

### Reset Semantic Versioning

```bash
# Clear semantic-release cache
rm -rf node_modules/.cache/semantic-release

# Reset to last release
git reset --hard $(git describe --tags --abbrev=0)

# Force new release
npm run release:dry-run
```

### Check GitHub Actions Logs

```bash
# View workflow runs
gh run list

# View specific run logs
gh run view --log

# Rerun failed workflow
gh run rerun <run-id>
```

## Getting Help

If you're still experiencing issues:

1. **Check existing issues**: Search GitHub issues for similar problems
2. **Create detailed issue**: Include error messages, logs, and steps to reproduce
3. **Provide context**: Include commit history, workflow configuration, and environment details
4. **Test locally**: Try to reproduce the issue in a local environment

## Resources

- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [Semantic Release Documentation](https://semantic-release.gitbook.io/semantic-release/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [n8n API Documentation](https://docs.n8n.io/api/)
