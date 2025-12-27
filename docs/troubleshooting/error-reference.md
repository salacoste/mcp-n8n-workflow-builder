# Error Reference Guide

Quick reference for common error messages, their causes, and solutions.

This guide covers errors you might encounter when using the MCP n8n Workflow Builder through Claude Desktop.

---

## Table of Contents

1. [Workflow Errors](#workflow-errors)
2. [Authentication Errors](#authentication-errors)
3. [Connection Errors](#connection-errors)
4. [Execution Errors](#execution-errors)
5. [Integration Errors](#integration-errors)
6. [Configuration Errors](#configuration-errors)
7. [API Errors](#api-errors)

---

## Workflow Errors

### Error: "Workflow validation failed: missing required trigger node"

**Full Message:**
```
Cannot activate workflow without valid trigger node.
Please add scheduleTrigger, webhook, or service-specific trigger before activation.
```

**Cause:**
Attempting to activate a workflow that has no valid trigger node, or only has a `manualTrigger` node.

**Background:**
This is a known limitation from Epic 1. The n8n REST API (v1.82.3) does not recognize `manualTrigger` as a valid trigger for activation.

**Solution via Claude Desktop:**
```
You: "Workflow 123 in staging won't activate. Add a schedule trigger that runs daily at 9 AM."

Claude: I'll add a valid schedule trigger to enable activation.

[MCP tool call: update_workflow]
{
  "instance": "staging",
  "id": "123",
  "nodes": [
    {
      "name": "Schedule Trigger",
      "type": "n8n-nodes-base.scheduleTrigger",
      "parameters": {
        "rule": {
          "interval": [{"field": "cronExpression", "expression": "0 9 * * *"}]
        }
      }
    },
    // ... existing nodes
  ]
}

✅ Schedule trigger added
Now you can activate the workflow.
```

**Alternative Solutions:**
1. Add webhook trigger for HTTP-based activation
2. Add service-specific trigger (Slack, GitHub, etc.)
3. Keep manual trigger for n8n UI testing only

**Prevention:**
Always include a valid trigger node when creating workflows intended for automation.

---

### Error: "Invalid workflow definition: connections malformed"

**Symptoms:**
- Workflow creation fails
- Error mentions "connections" or "invalid structure"

**Cause:**
Workflow connections are not in the correct n8n API format.

**Details:**
The MCP server automatically transforms connections between array format (user-friendly) and n8n's object format (API requirement). This error indicates a transformation issue.

**Solution:**
```
You: "I'm getting a connection error when creating a workflow. Here's the structure: [paste workflow JSON]"

Claude: Let me fix the connection format for n8n compatibility.

[Analyzes and corrects connection structure]
[Creates workflow with proper connections]

✅ Workflow created with corrected connections
```

**Technical Note:**
Connections transform from:
```javascript
// Array format (input)
[{source: "node1", target: "node2"}]

// To n8n object format (API)
{"node1": {"main": [[{"node": "node2", "type": "main", "index": 0}]]}}
```

---

## Authentication Errors

### Error: "Authentication failed: Invalid API key"

**HTTP Status:** 401 Unauthorized

**Full Message:**
```
Request failed with status code 401
Authentication failed: Invalid or expired n8n API key
```

**Cause:**
The n8n API key in your configuration is invalid, expired, or revoked.

**Diagnostic Steps:**

```
You: "I'm getting 401 authentication errors for production. Can you test the connection?"

Claude: Let me verify the production instance connection.

[MCP tool call: list_workflows]
{
  "instance": "production",
  "limit": 1
}

Error: Authentication failed (401 Unauthorized)

The production API key appears to be invalid or expired.

**Fix Required:**
1. Open production n8n instance UI
2. Navigate to: Settings → API
3. Regenerate API key
4. Update .config.json with new key:

{
  "environments": {
    "production": {
      "n8n_host": "https://prod.n8n.example.com",
      "n8n_api_key": "NEW_KEY_HERE"
    }
  }
}

5. Restart MCP server
```

**Quick API Key Test:**
```bash
# Test API key manually
curl -X GET 'https://your-n8n.cloud/api/v1/workflows?limit=1' \
  -H 'X-N8N-API-KEY: your_api_key_here'

# Expected responses:
# 200 OK = Valid key ✅
# 401 Unauthorized = Invalid key ❌
```

**Common Causes:**
- API key typo in configuration
- API key regenerated in n8n UI
- API key deleted/revoked
- Wrong instance URL

---

### Error: "Forbidden: Insufficient permissions"

**HTTP Status:** 403 Forbidden

**Cause:**
API key doesn't have required permissions for the operation.

**Solution:**
Check API key permissions in n8n UI:
1. Settings → API
2. Verify key has necessary scopes
3. Regenerate with full permissions if needed

---

## Connection Errors

### Error: "ECONNREFUSED - Connection Refused"

**Full Message:**
```
Error: connect ECONNREFUSED
Failed to connect to n8n instance at [URL]
```

**Cause:**
Cannot establish connection to the n8n instance.

**Common Reasons:**

1. **n8n instance is down**
   ```
   Solution: Verify n8n is running
   - Open n8n URL in browser
   - Check n8n server status
   - Restart n8n if needed
   ```

2. **Wrong URL in configuration**
   ```
   Check .config.json:
   {
     "n8n_host": "https://n8n.example.com"  // Verify this URL
   }

   Common mistakes:
   - Typo in domain name
   - HTTP vs HTTPS
   - Wrong subdomain
   - Including /api/v1/ suffix (remove it!)
   ```

3. **Firewall blocking connection**
   ```
   Test connectivity:
   curl https://your-n8n.cloud/api/v1/workflows

   If this fails, check:
   - Corporate firewall rules
   - Network restrictions
   - VPN requirements
   ```

4. **VPN required but not connected**
   ```
   If n8n is behind VPN:
   - Connect to VPN first
   - Then restart MCP server
   ```

**Diagnostic Conversation:**
```
You: "Getting ECONNREFUSED errors for staging instance"

Claude: Let me help diagnose the connection issue.

**Checks:**
1. Can you access https://staging.n8n.example.com in your browser?
   - Yes → n8n is running, check API key/config
   - No → n8n instance is down or URL is wrong

2. Is the URL in .config.json exactly: https://staging.n8n.example.com
   - No /api/v1/ suffix
   - Correct protocol (http/https)
   - Correct domain

3. Are you on required VPN (if applicable)?

Please check these and let me know what you find.
```

---

### Error: "ETIMEDOUT - Request Timeout"

**Full Message:**
```
Error: timeout of 30000ms exceeded
Request to n8n instance timed out
```

**Cause:**
Request took longer than 30 seconds to complete.

**Common Reasons:**

1. **Slow network connection**
2. **n8n instance overloaded**
3. **Large workflow/execution data**
4. **n8n database performance issues**

**Solutions:**

```
You: "Getting timeout errors when fetching workflow 123"

Claude: Timeouts often occur with large workflows or slow networks.

**Optimized Approach:**
1. First, get workflow metadata (lighter operation)
2. If successful, then fetch full workflow data

[Tries optimized sequence]

Result: Workflow 123 has 150+ nodes which causes timeouts.

**Recommendations:**
- Split into smaller workflows
- Reduce node count
- Check n8n instance performance
- Increase timeout in configuration (if needed)
```

---

### Error: "Invalid URL format: must not include /api/v1/"

**Full Message:**
```
Configuration error: n8n_host must not include /api/v1 suffix
Please use base URL only (e.g., https://n8n.example.com)
The MCP server automatically appends /api/v1 to API calls.
```

**Cause:**
Configuration includes `/api/v1/` in the n8n_host value (Epic 1 common mistake).

**Fix:**

```json
// ❌ Incorrect (will cause errors)
{
  "environments": {
    "production": {
      "n8n_host": "https://n8n.example.com/api/v1/",
      "n8n_api_key": "key"
    }
  }
}

// ✅ Correct
{
  "environments": {
    "production": {
      "n8n_host": "https://n8n.example.com",
      "n8n_api_key": "key"
    }
  }
}
```

**Validation:**
```bash
# Run configuration validator
npm run validate-config

# Should output:
✅ Configuration valid
✅ All n8n_host URLs correctly formatted
```

**After Fix:**
Restart the MCP server to apply configuration changes.

---

## Execution Errors

### Error: "Cannot execute workflow with manual trigger via API"

**Cause:**
n8n REST API limitation (Epic 2 known issue).

**Explanation:**
Workflows with ONLY a `manualTrigger` node cannot be executed via the n8n REST API (v1.82.3). This is a platform limitation, not an MCP server bug.

**MCP Server Response:**
```
You: "Execute workflow 456 in production"

Claude:
[MCP tool call: execute_workflow]
{
  "instance": "production",
  "id": "456"
}

⚠️ Cannot execute via API: Workflow has manual trigger only

This is a known n8n API limitation (v1.82.3).

**Alternative Methods:**

1. **Execute in n8n UI (Recommended)**
   - Open: https://prod.n8n.example.com
   - Navigate to workflow 456
   - Click "Test Workflow"
   - Click "Execute Workflow"

2. **Add Webhook Trigger**
   Would you like me to add a webhook trigger so you can execute via HTTP POST?

3. **Add Schedule Trigger**
   Or add a schedule trigger for automated execution?

Which approach would you prefer?
```

**Solutions:**

**Option 1: Use n8n UI**
```
Navigate to n8n → Open workflow → Test Workflow → Execute
```

**Option 2: Add Webhook**
```
You: "Add a webhook trigger so I can execute it via API"

Claude: I'll add a webhook trigger to enable API execution.

[Adds webhook node]

✅ Webhook trigger added
Execute via: POST https://your-n8n.cloud/webhook/execute-456
```

**Option 3: Add Schedule**
```
You: "Add a schedule trigger that runs every hour"

Claude: [Adds schedule trigger]

✅ Schedule trigger added (runs hourly)
Activate to enable automatic execution.
```

---

### Error: "Execution not found"

**HTTP Status:** 404

**Cause:**
Requesting execution ID that doesn't exist.

**Diagnostic:**
```
You: "Get details for execution 9999 in production"

Claude:
[MCP tool call: get_execution]
{
  "instance": "production",
  "id": "9999"
}

Error: Execution 9999 not found in production

Possible reasons:
1. Wrong execution ID
2. Execution from different instance
3. Execution deleted/purged

**Find recent executions:**
Would you like me to list recent executions for:
- Specific workflow?
- All executions from today?
- Failed executions only?
```

---

## Integration Errors

### Slack: "channel_not_found"

**Error in Execution:**
```
Slack API Error: channel_not_found
The channel does not exist or the bot is not a member
```

**Cause:**
Slack bot not invited to the target channel.

**Solution:**
```
1. Open Slack
2. Navigate to the channel
3. Type: /invite @YourBotName
4. Retry workflow execution
```

**Alternative (for public channels):**
Use `chat:write.public` permission to post without invitation.

**Bot Permission Setup:**
```
Slack App → OAuth & Permissions → Scopes:
- chat:write (required)
- chat:write.public (posts to public channels without invite)
```

---

### Gmail: "The caller does not have permission"

**Cause:**
Gmail API not enabled or OAuth scope insufficient.

**Fix:**
```
1. Google Cloud Console
2. APIs & Services → Enable APIs
3. Search "Gmail API"
4. Click "Enable"
5. Re-authenticate n8n credential
```

**OAuth Scopes Required:**
```
- https://www.googleapis.com/auth/gmail.send
- https://www.googleapis.com/auth/gmail.compose
```

---

### Google Sheets: "The caller does not have permission"

**Cause:**
Google Sheet not shared with OAuth email.

**Solution:**
```
1. Open Google Sheet
2. Click "Share" (top right)
3. Add OAuth email address from n8n credential
4. Grant "Editor" permission
5. Click "Send"
6. Retry workflow
```

**Find OAuth Email:**
```
n8n UI → Settings → Credentials → [Your Google Sheets Credential] → View Details
```

---

### SMTP: "Authentication failed"

**For Gmail:**
**Cause:** Using account password instead of App Password

**Solution:**
```
1. Google Account → Security
2. Enable 2-Step Verification (if not enabled)
3. Click "App passwords"
4. Select: Mail → Other (Custom name: "n8n")
5. Generate
6. Copy 16-character password
7. Update n8n SMTP credential with App Password
```

**For Outlook/Office 365:**
**Cause:** Less secure app access disabled

**Solution:**
```
1. Microsoft Account → Security
2. Advanced security options
3. Enable "App passwords"
4. Generate app-specific password
5. Use in n8n
```

---

## Configuration Errors

### Error: "Instance 'production' not found"

**Full Message:**
```
Instance "production" not found in configuration.

Available instances: staging, development

Please use one of the available instance names or add 'production' to .config.json
```

**Cause:**
Requesting an instance that doesn't exist in `.config.json`.

**Solution:**

**Check Configuration:**
```
You: "What instances are configured in my setup?"

Claude: Let me check your configuration.

[Reads .config.json]

**Configured Instances:**
1. staging (default)
   - URL: https://staging.n8n.example.com

2. development
   - URL: http://localhost:5678

The 'production' instance is not configured.

**To add production:**
Update .config.json:

{
  "environments": {
    "production": {
      "n8n_host": "https://prod.n8n.example.com",
      "n8n_api_key": "your_production_api_key"
    },
    "staging": {...},
    "development": {...}
  },
  "defaultEnv": "staging"
}

After updating, restart the MCP server.
```

---

### Error: "Configuration file not found"

**Cause:**
No `.config.json` or `.env` file found.

**Solution:**
```bash
# Option 1: Create .config.json (multi-instance)
cat > .config.json << 'EOF'
{
  "environments": {
    "production": {
      "n8n_host": "https://n8n.example.com",
      "n8n_api_key": "your_api_key"
    }
  },
  "defaultEnv": "production"
}
EOF

# Option 2: Create .env (single instance)
cat > .env << 'EOF'
N8N_HOST=https://n8n.example.com
N8N_API_KEY=your_api_key
EOF

# Validate configuration
npm run validate-config
```

---

## API Errors

### Error 422: "Unprocessable Entity"

**Cause:**
Request data doesn't meet n8n API validation requirements.

**Common Issues:**
- Missing required fields
- Invalid data types
- Malformed JSON
- Invalid node parameters

**Solution:**
```
You: "Getting 422 error when creating workflow"

Claude: 422 errors indicate validation issues. Let me check the workflow definition.

[Analyzes workflow structure]

**Issues Found:**
1. Missing required parameter in HTTP Request node
2. Invalid cron expression in Schedule Trigger
3. Empty node connections

**Fixed Issues:**
[Creates corrected workflow]

✅ Workflow created successfully
All validation issues resolved.
```

---

### Error 409: "Conflict"

**Common With:** Tag updates

**Cause:**
Tag name already exists or conflicts with existing tag.

**Workaround:**
```
You: "Update tag 5 to rename it to 'customer-workflows'"

Claude:
[MCP tool call: update_tag]

Error: 409 Conflict - Tag name may already exist

**Workaround (Epic 2 known issue):**
1. Delete old tag
2. Create new tag with desired name

Would you like me to:
1. Delete tag 5
2. Create new tag "customer-workflows"
3. Re-tag affected workflows
```

---

## Quick Diagnostic Checklist

### Workflow Won't Activate
- [ ] Has valid trigger node? (not manualTrigger)
- [ ] Workflow definition valid JSON?
- [ ] No syntax errors in expressions?
- [ ] All required credentials configured?
- [ ] Instance name correct?

### Workflow Won't Execute
- [ ] Workflow activated?
- [ ] Has manual trigger? (API limitation - use n8n UI)
- [ ] Trigger configuration correct?
- [ ] Tested in n8n UI?

### API Connection Issues
- [ ] n8n instance running?
- [ ] API key valid and not expired?
- [ ] URL correct (no /api/v1/ suffix)?
- [ ] Network/firewall allowing connection?
- [ ] VPN connected (if required)?

### Integration Not Working
- [ ] Credentials configured in n8n UI?
- [ ] Service-specific permissions granted?
- [ ] API rate limits not exceeded?
- [ ] Service account has required access?
- [ ] Correct credential ID referenced?

---

## Getting Additional Help

### 1. Enable Debug Logging
```bash
# Check MCP server logs
npm start 2> mcp-server.log
tail -f mcp-server.log
```

### 2. Validate Configuration
```bash
npm run validate-config
```

### 3. Test API Directly
```bash
curl -X GET 'https://your-n8n.cloud/api/v1/workflows?limit=1' \
  -H 'X-N8N-API-KEY: your_api_key' \
  -v
```

### 4. Check n8n Logs
```
n8n UI → Executions → Click execution → View Details
```

### 5. Report Issues
GitHub Issues: https://github.com/your-org/mcp-n8n-workflow-builder/issues

**Include:**
- Error message (redact API keys!)
- MCP server version: `npm list @kernel.salacoste/n8n-workflow-builder`
- n8n version
- Steps to reproduce
- Relevant configuration (redact sensitive data)

---

## Related Documentation

- [FAQ](./faq.md) - Frequently Asked Questions
- [Debugging Guide](./debugging-guide.md) - Systematic debugging
- [Claude Desktop Patterns](../guides/claude-desktop-patterns.md) - Effective usage
- [Multi-Instance Configuration](../multi-instance/configuration.md) - Setup guide

---

**Last Updated:** January 2025
**Version:** 1.0
**Feedback:** Report errors or suggest additions via GitHub issues
