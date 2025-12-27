# Frequently Asked Questions (FAQ)

Common questions and answers about the n8n MCP Workflow Builder.

---

## Table of Contents

1. [General Questions](#general-questions)
2. [Multi-Instance Questions](#multi-instance-questions)
3. [Workflow Questions](#workflow-questions)
4. [Integration Questions](#integration-questions)
5. [Performance Questions](#performance-questions)
6. [Credential & Security Questions](#credential--security-questions)
7. [Troubleshooting Questions](#troubleshooting-questions)

---

## General Questions

### Q: What is the n8n MCP Workflow Builder?

**A:** It's an MCP (Model Context Protocol) server that enables AI assistants like Claude to create, manage, and monitor n8n workflows through natural language conversations.

**Key Features:**
- Create workflows via Claude Desktop
- Manage multiple n8n instances
- Monitor executions
- Debug workflows
- No manual JSON editing required

**Supported Platforms:**
- Claude Desktop (primary)
- Cursor IDE
- Any MCP-compatible AI tool

---

### Q: Do I need coding knowledge to use this?

**A:** No! That's the primary benefit.

**Without MCP Server (Traditional):**
- Write complex JSON workflow definitions
- Understand n8n node structure
- Debug JSON syntax errors
- Manual API calls

**With MCP Server (Using Claude):**
```
You: "Create a webhook that receives orders and saves them to PostgreSQL"

Claude: [Creates complete workflow automatically]
```

**Basic Conversational Skills Needed:**
- Describe what you want the workflow to do
- Specify which environment (production, staging, etc.)
- Provide integration details (email addresses, channels, etc.)

**No JSON or Programming Required!**

---

### Q: Can I manage multiple n8n instances?

**A:** Yes! This is a core feature (Epic 5).

**Single Instance (.env):**
```env
N8N_HOST=https://n8n.example.com
N8N_API_KEY=your_key
```

**Multi-Instance (.config.json):**
```json
{
  "environments": {
    "production": {
      "n8n_host": "https://prod.n8n.example.com",
      "n8n_api_key": "prod_key"
    },
    "staging": {
      "n8n_host": "https://staging.n8n.example.com",
      "n8n_api_key": "staging_key"
    },
    "development": {
      "n8n_host": "http://localhost:5678",
      "n8n_api_key": "dev_key"
    }
  },
  "defaultEnv": "development"
}
```

**Usage:**
```
"List workflows in production"
"Create workflow in staging"
"Get workflow 123 from development"
```

See: [Multi-Instance Configuration Guide](../multi-instance/configuration.md)

---

### Q: Which n8n versions are supported?

**A:**
- **Tested with:** n8n v1.82.3
- **Expected compatibility:** n8n v1.70.0+
- **API version:** REST API v1

**Compatibility Notes:**
- Some features may vary between versions
- Older versions may have limited API capabilities
- Always use latest stable n8n version when possible

**Check Your Version:**
```bash
# n8n UI → Settings → About
# Or via API:
curl https://your-n8n.cloud/api/v1/
```

---

### Q: Is this compatible with n8n Cloud and self-hosted?

**A:** Yes, both!

**n8n Cloud:**
```json
{
  "n8n_host": "https://your-instance.app.n8n.cloud",
  "n8n_api_key": "n8n_api_..."
}
```

**Self-Hosted:**
```json
{
  "n8n_host": "https://n8n.yourcompany.com",
  "n8n_api_key": "your_api_key"
}
```

**Local Development:**
```json
{
  "n8n_host": "http://localhost:5678",
  "n8n_api_key": "local_dev_key"
}
```

**Requirements:**
- n8n REST API enabled
- Valid API key
- Network access to n8n instance

---

## Multi-Instance Questions

### Q: How do I switch between production and staging?

**A:** Simply specify the instance in your request.

```
You: "List workflows in production"
Claude: [Lists production workflows]

You: "List workflows in staging"
Claude: [Lists staging workflows]

You: "List workflows"  // No instance specified
Claude: [Lists workflows from defaultEnv]
```

**Context Awareness:**
Claude remembers the last instance you mentioned:

```
You: "List workflows in production"
Claude: [Lists production workflows]

You: "Activate workflow 123"
Claude: [Activates in production - remembers context]
```

**Explicit Override:**
```
You: "No, activate workflow 123 in staging instead"
Claude: [Activates in staging]
```

---

### Q: Can I copy workflows from staging to production?

**A:** Not directly, but you can recreate them.

**Workflow Replication Pattern:**

```
You: "Get workflow 123 from staging and create an identical one in production"

Claude: I'll replicate the workflow from staging to production.

Step 1: Retrieve from staging
[MCP tool call: get_workflow]
{
  "instance": "staging",
  "id": "123"
}

✅ Retrieved "Customer Onboarding" workflow

Step 2: Create in production
[MCP tool call: create_workflow]
{
  "instance": "production",
  "name": "Customer Onboarding",
  // ... same nodes and connections
}

✅ Workflow created in production (ID: 456)

**Important Notes:**
- New workflow gets different ID
- Credentials may need reconfiguration
- Environment-specific URLs should be updated
- Test thoroughly before activating

Would you like me to:
1. Review configuration differences
2. Update environment-specific settings
3. Activate the workflow
```

---

### Q: What's the difference between defaultEnv and specifying instance?

**A:** `defaultEnv` is used when no instance is specified.

**Configuration:**
```json
{
  "environments": {
    "production": {...},
    "staging": {...}
  },
  "defaultEnv": "staging"
}
```

**Behavior:**

```
// Explicit instance specified
You: "List workflows in production"
→ Uses production (ignores defaultEnv)

// No instance specified
You: "List workflows"
→ Uses staging (defaultEnv)
```

**Best Practice:**
Set `defaultEnv` to your safest environment (typically `development` or `staging`) to prevent accidental production changes.

---

## Workflow Questions

### Q: How do I test a workflow before activating it?

**A:** Different methods depending on trigger type.

**For Webhook Workflows:**
```
1. Create workflow (keep inactive)
2. Activate it
3. Test with curl or Postman
4. Review execution in n8n UI
5. Keep activated if successful
```

Example:
```
You: "Create and activate a test webhook in staging"
Claude: [Creates and activates]

// Test it:
curl -X POST https://staging.../webhook/test \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'

You: "Show me the latest execution"
Claude: [Shows execution results]
```

**For Schedule Workflows:**
```
Cannot test via MCP API (n8n limitation)

Method 1: Manual test in n8n UI
1. Open workflow in n8n
2. Click "Test Workflow"
3. Click "Execute Workflow"

Method 2: Temporary schedule
Change schedule to run in 2 minutes for testing
```

**For Manual Trigger Workflows:**
```
Execute in n8n UI only (API limitation)
```

---

### Q: Why can't I execute my workflow through Claude?

**A:** n8n API limitation with manual triggers.

**Problem:**
Workflows with ONLY `manualTrigger` cannot be executed via REST API (v1.82.3).

**MCP Response:**
```
You: "Execute workflow 456"

Claude: ⚠️ This workflow has a manual trigger only.

n8n API v1.82.3 doesn't support executing manual-trigger workflows via REST API.

**Options:**

1. **Execute in n8n UI:**
   Open workflow → Click "Test Workflow"

2. **Add webhook trigger:**
   I can add a webhook so you can execute via HTTP POST

3. **Add schedule trigger:**
   I can add a schedule for automatic execution

Which would you prefer?
```

**Solutions:**
- Option 1: Use n8n UI for testing
- Option 2: Add webhook trigger
- Option 3: Add schedule trigger
- Option 4: Add service-specific trigger

See: [Error Reference - Cannot Execute Manual Trigger](./error-reference.md#cannot-execute-workflow-with-manual-trigger-via-api)

---

### Q: How do I find workflows that haven't run in a while?

**A:** List workflows and check execution history.

```
You: "List all workflows in production and show their last execution times"

Claude: I'll retrieve workflows and check execution history.

[Lists workflows with execution data]

**Workflows with no recent executions:**

1. "Old Email Campaign" (ID: 101)
   - Last execution: 45 days ago
   - Status: Active ⚠️

2. "Backup Process" (ID: 203)
   - Last execution: 30 days ago
   - Status: Active ⚠️

3. "Weekly Report" (ID: 305)
   - Last execution: 8 days ago
   - Status: Active ✓ (scheduled weekly)

**Recommendations:**
- Review workflow 101 and 203
- Consider deactivating if no longer needed
- Check if triggers are configured correctly
```

---

### Q: Can I schedule workflows to run at specific times?

**A:** Yes, using schedule triggers.

**Daily at 9 AM:**
```
You: "Create a workflow in production that runs daily at 9 AM EST"

Claude: [Creates workflow with schedule trigger]

Parameters:
- Cron: 0 9 * * *
- Timezone: America/New_York
```

**Weekdays Only:**
```
Cron: 0 9 * * 1-5  // Monday-Friday at 9 AM
```

**Twice Daily:**
```
Cron: 0 9,17 * * *  // 9 AM and 5 PM
```

**Weekly:**
```
Cron: 0 9 * * 1  // Mondays at 9 AM
```

**Monthly:**
```
Cron: 0 9 1 * *  // 1st of month at 9 AM
```

**Every Hour:**
```
Cron: 0 * * * *  // Top of every hour
```

See: [Schedule Trigger Examples](../examples/basic/scheduled-report.md)

---

## Integration Questions

### Q: Can Claude create credentials for me?

**A:** No, n8n blocks credential operations via API for security.

**Reason:**
Epic 2 discovery - n8n REST API v1.82.3 blocks:
- `list_credentials` (403 Forbidden)
- `get_credential` (403 Forbidden)
- Direct credential creation via API

**Why?**
Security protection - prevents API from accessing encrypted credential data.

**How to Configure Credentials:**

```
You: "I need to create a Slack workflow but haven't configured credentials"

Claude: I can't create credentials via API (n8n security restriction), but I'll guide you:

**Slack Credential Setup:**

1. Open n8n UI
2. Settings → Credentials → Add Credential
3. Search "Slack"
4. Select "Slack OAuth2 API"
5. Enter your Slack Bot Token
6. Save as "Slack Production"

Once configured, let me know and I'll create the workflow.

You: "Done! Saved as 'Slack Production'"

Claude: Perfect! I'll create the Slack workflow now.
[Creates workflow referencing "Slack Production" credential]
```

**Supported Credential Types:**
All n8n credential types (configure in n8n UI, reference in workflows)

See: [Credentials Security Guide](../features/credentials-security.md)

---

### Q: Why is my Slack message not sending?

**A:** Common causes and solutions:

**Checklist:**

1. **Credentials Configured?**
   ```
   n8n UI → Settings → Credentials → Slack OAuth2 API
   ```

2. **Bot Invited to Channel?**
   ```
   Slack → Channel → Type: /invite @YourBotName
   ```

3. **Channel Name Correct?**
   ```
   Use: #channel-name (with hash)
   Not: channel-name
   ```

4. **Permissions Granted?**
   ```
   Slack App → OAuth & Permissions → Bot Token Scopes:
   - chat:write (required)
   - chat:write.public (for posting without invite)
   ```

**Debug:**
```
You: "Slack node failing in workflow 456"

Claude: Let me check the execution details.

[Gets execution data]

Error: "channel_not_found"

**Solution:**
Invite your bot to the channel:
1. Open Slack channel
2. Type: /invite @n8n-bot
3. Retry workflow

Alternatively, add chat:write.public scope to post to public channels without invitation.
```

See: [Slack Integration Tutorial](../tutorials/integrations/slack-integration.md)

---

### Q: How do I connect to my database?

**A:** Configure database credentials in n8n, then create workflow.

**PostgreSQL Example:**

```
Step 1: Configure Credential (n8n UI)

Settings → Credentials → Add Credential → PostgreSQL

Fields:
- Host: db.example.com
- Database: production_db
- User: n8n_user
- Password: secure_password
- Port: 5432
- SSL: Enabled

Save as: "Production PostgreSQL"


Step 2: Create Workflow (via Claude)

You: "Create a workflow that receives webhook data and stores it in PostgreSQL table 'orders'"

Claude: [Creates workflow with PostgreSQL node]

Workflow includes:
- Webhook trigger
- Data validation
- PostgreSQL Insert node (using "Production PostgreSQL" credential)
- Success response
```

**Supported Databases:**
- PostgreSQL
- MySQL
- MongoDB
- Redis
- Microsoft SQL Server
- SQLite

See: [Database Integration Tutorial](../tutorials/integrations/postgresql-integration.md)

---

## Performance Questions

### Q: My workflow is slow. How can I speed it up?

**A:** Claude can analyze and suggest optimizations.

```
You: "Workflow 789 takes 2 minutes to complete. Can you analyze and optimize it?"

Claude: I'll analyze workflow performance.

[Gets workflow and execution data]

**Performance Analysis:**

Workflow: "Data Processing Pipeline"
Current Duration: 125 seconds
Nodes: 6

**Bottlenecks:**

1. HTTP Request node (90s) ⚠️
   - Issue: Fetching 10,000 records individually
   - Solution: Use batch API endpoint
   - Expected savings: ~75s

2. Loop Processing (30s) ⚠️
   - Issue: Sequential processing
   - Solution: Split In Batches for parallelization
   - Expected savings: ~20s

3. Database Writes (5s)
   - Issue: Individual INSERTs
   - Solution: Bulk INSERT
   - Expected savings: ~3s

**Projected Improvement:**
125s → ~25s (80% faster)

Would you like me to implement these optimizations?
```

**Common Optimizations:**
- Batch API requests instead of loops
- Use parallel processing (Split In Batches)
- Bulk database operations
- Reduce HTTP Request timeouts
- Filter data early in workflow
- Cache frequently accessed data

---

### Q: Can workflows run in parallel?

**A:** Yes, but with different meanings:

**1. Multiple Workflows in Parallel:**
```
Different workflows run simultaneously:
- Workflow A: Processing orders
- Workflow B: Sending emails
- Workflow C: Syncing data

These run independently in parallel.
```

**2. Parallel Processing Within Workflow:**
```
Use Split In Batches node:
- Splits data into chunks
- Processes each chunk in parallel
- Combines results

Example:
You: "Process 1000 customer records in parallel batches of 100"

Claude: [Creates workflow with Split In Batches]
- Splits 1000 records into 10 batches
- Processes each batch in parallel
- Significantly faster than sequential
```

---

### Q: How many workflows can I create?

**A:** Depends on n8n instance plan.

**Typical Limits:**

**n8n Cloud:**
- Starter: 20 workflows
- Pro: 100 workflows
- Enterprise: Unlimited

**Self-Hosted:**
- No artificial limits
- Limited by server resources (RAM, CPU, database)

**MCP Server:**
- No additional limits imposed
- Full access to all workflows in n8n instance

**Check Your Limit:**
```
n8n UI → Settings → Plan
```

---

## Credential & Security Questions

### Q: How secure are my credentials?

**A:** Very secure - n8n stores credentials encrypted.

**Security Layers:**

1. **n8n Encryption:**
   - All credentials encrypted at rest
   - Encryption key in n8n configuration
   - Never exposed via API

2. **API Protection:**
   - n8n blocks credential data access via REST API (Epic 2)
   - LIST and GET operations return 403 Forbidden
   - Prevents credential exfiltration

3. **MCP Server:**
   - Never stores credentials
   - Cannot access credential data
   - Only references credential IDs in workflows

**What MCP Can Do:**
- Reference existing credential by ID
- Guide you through credential setup
- Create workflows using credentials

**What MCP Cannot Do:**
- Read credential values
- List credential data
- Export/backup credentials
- Modify credential settings

See: [Credentials Security](../features/credentials-security.md)

---

### Q: Should I use different API keys for each environment?

**A:** Yes! Strongly recommended.

**Best Practice:**

```json
{
  "environments": {
    "production": {
      "n8n_host": "https://prod.n8n.example.com",
      "n8n_api_key": "PRODUCTION_KEY_xyz789"  // Unique key
    },
    "staging": {
      "n8n_host": "https://staging.n8n.example.com",
      "n8n_api_key": "STAGING_KEY_abc123"  // Different key
    },
    "development": {
      "n8n_host": "http://localhost:5678",
      "n8n_api_key": "DEV_KEY_def456"  // Different key
    }
  }
}
```

**Benefits:**
- **Limit blast radius:** Compromised key only affects one environment
- **Easy rotation:** Rotate keys per environment independently
- **Audit trail:** Track API usage per environment
- **Access control:** Different permission levels per environment

**Security:**
```bash
# Never commit .config.json
echo ".config.json" >> .gitignore

# Restrict file permissions
chmod 600 .config.json
```

---

## Troubleshooting Questions

### Q: Why am I getting authentication errors?

**A:** Usually invalid/expired API key.

**Quick Fix:**

```
You: "Getting 401 authentication errors for production"

Claude: 401 errors indicate authentication failure.

**Diagnostic Steps:**

1. **Test API key manually:**
   curl -X GET 'https://prod.n8n.example.com/api/v1/workflows?limit=1' \
     -H 'X-N8N-API-KEY: your_key'

   200 OK = Valid ✅
   401 Unauthorized = Invalid ❌

2. **Regenerate API key:**
   - Open n8n UI
   - Settings → API
   - Click "Create New API Key"
   - Copy new key

3. **Update configuration:**
   - Edit .config.json
   - Replace old key with new key
   - Restart MCP server

4. **Test again:**
   You: "List workflows in production"
   Should work now ✅
```

See: [Authentication Errors](./error-reference.md#authentication-failed-invalid-api-key)

---

### Q: My configuration isn't loading. What's wrong?

**A:** Common configuration issues:

**1. File Location:**
```bash
# Must be in project root
ls -la .config.json  # Should exist
ls -la .env          # Fallback
```

**2. JSON Syntax:**
```bash
# Validate JSON
cat .config.json | python3 -m json.tool

# Common errors:
# - Missing comma
# - Extra comma at end
# - Unquoted strings
# - Wrong quotes (' vs ")
```

**3. Required Fields:**
```json
{
  "environments": {  // Required
    "production": {  // At least one environment
      "n8n_host": "...",  // Required
      "n8n_api_key": "..."  // Required
    }
  },
  "defaultEnv": "production"  // Required
}
```

**4. URL Format:**
```json
// ❌ Wrong
"n8n_host": "https://n8n.example.com/api/v1/"

// ✅ Correct
"n8n_host": "https://n8n.example.com"
```

**Validation:**
```bash
npm run validate-config
```

---

### Q: How do I report a bug or request a feature?

**A:** Use GitHub Issues.

**Bug Report:**
```
GitHub: https://github.com/your-org/mcp-n8n-workflow-builder/issues

Include:
- Error message (redact API keys!)
- MCP server version
- n8n version
- Steps to reproduce
- Expected vs actual behavior
- Configuration (redact sensitive data)
```

**Feature Request:**
```
GitHub: https://github.com/your-org/mcp-n8n-workflow-builder/issues

Include:
- Use case description
- Why current functionality doesn't work
- Proposed solution
- Examples of desired behavior
```

---

## Related Documentation

- **[Error Reference](./error-reference.md)** - Complete error message guide
- **[Claude Desktop Patterns](../guides/claude-desktop-patterns.md)** - Effective usage patterns
- **[Multi-Instance Setup](../multi-instance/configuration.md)** - Multi-environment configuration
- **[Integration Tutorials](../tutorials/integrations/)** - Service integration guides
- **[Examples](../examples/)** - Workflow examples and patterns

---

**Last Updated:** January 2025
**Version:** 1.0
**Contributions:** Submit improvements via GitHub PR
