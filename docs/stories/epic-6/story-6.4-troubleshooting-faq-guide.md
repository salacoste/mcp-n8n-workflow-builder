# Story 6.4: Troubleshooting & FAQ Guide

**Epic:** Epic 6 - Examples & Tutorials
**Story Points:** 4
**Priority:** Medium
**Status:** Ready for Implementation
**Estimated Page Count:** 8-10 pages

---

## User Story

**As a** user encountering issues with n8n workflow management
**I want** a comprehensive troubleshooting guide and FAQ
**So that** I can quickly resolve common problems without external support

---

## Story Description

### Current System

With Stories 6.1-6.3 completed:
- ✅ Workflow creation examples
- ✅ Integration tutorials
- ✅ Claude Desktop usage patterns
- ❌ No centralized troubleshooting guide
- ❌ No FAQ for common questions
- ❌ No error message reference
- ❌ No debugging decision trees

### Enhancement

Create comprehensive troubleshooting and FAQ documentation:
- **Common Errors:** Error messages and solutions
- **Debugging Guide:** Step-by-step debugging workflows
- **FAQ:** Frequently asked questions with answers
- **Decision Trees:** Visual troubleshooting flows
- **Performance Issues:** Optimization techniques
- **Integration Problems:** Service-specific troubleshooting

---

## Acceptance Criteria

### AC1: Common Error Messages and Solutions
**Given** users encountering error messages
**When** they search the troubleshooting guide
**Then** they should find clear solutions:

#### 1.1 Error Reference Guide

**Document:** `docs/troubleshooting/error-reference.md`

```markdown
# Error Reference Guide

Quick reference for common error messages and solutions.

## Workflow Errors

### Error: "Workflow validation failed: missing required trigger node"

**Full Message:**
\`\`\`
Cannot activate workflow without valid trigger node.
Add scheduleTrigger or webhook node before activation.
\`\`\`

**Cause:** Trying to activate workflow without a trigger (Epic 1 known issue)

**Solution:**
\`\`\`
You: "Add a schedule trigger to workflow 123 in staging that runs daily at 9 AM"

Claude: I'll add a schedule trigger to the workflow.

[Updates workflow with scheduleTrigger node]

✅ Added schedule trigger
Now you can activate the workflow.
\`\`\`

**Prevention:** Always include valid trigger when creating workflows for automation

---

### Error: "Invalid URL format: must not include /api/v1/"

**Full Message:**
\`\`\`
n8n_host must not include /api/v1 suffix. Use base URL only.
\`\`\`

**Cause:** Configuration includes `/api/v1/` in n8n_host (Epic 1 issue)

**Solution:**
\`\`\`json
// ❌ Incorrect
{
  "n8n_host": "https://n8n.example.com/api/v1/"
}

// ✅ Correct
{
  "n8n_host": "https://n8n.example.com"
}
\`\`\`

**Fix in .config.json:**
Remove `/api/v1/` from all n8n_host values and restart MCP server.

**Validation:**
\`\`\`bash
npm run validate-config
\`\`\`

---

### Error: "Instance 'production' not found"

**Full Message:**
\`\`\`
Instance "production" not found.
Available instances: staging, development
\`\`\`

**Cause:** Requesting instance that doesn't exist in configuration

**Solution:**
\`\`\`
You: "What instances are configured?"

Claude: [Reads configuration]

Available instances:
- staging (default)
- development

The 'production' instance is not configured.

To add it, update your .config.json:
{
  "environments": {
    "production": {
      "n8n_host": "https://prod.example.com",
      "n8n_api_key": "your_prod_key"
    },
    "staging": {...},
    "development": {...}
  }
}
\`\`\`

**Prevention:** Use `npm run validate-config` after configuration changes

---

## Authentication Errors

### Error: "Authentication failed: Invalid API key"

**Status Code:** 401

**Cause:** Invalid or expired n8n API key

**Diagnostic Steps:**
\`\`\`
You: "I'm getting authentication errors for production. Can you test the connection?"

Claude: Let me check the production instance configuration.
[Attempts to list workflows]

Error: Authentication failed (401)

The production API key appears to be invalid or expired.

**Steps to fix:**
1. Open production n8n UI
2. Settings → API
3. Regenerate API key
4. Update .config.json with new key
5. Restart MCP server
\`\`\`

**Quick Test:**
\`\`\`bash
curl -X GET 'https://your-n8n.cloud/api/v1/workflows?limit=1' \\
  -H 'X-N8N-API-KEY: your_key'

# 200 OK = Valid key
# 401 Unauthorized = Invalid key
\`\`\`

---

## Connection Errors

### Error: "ECONNREFUSED" - Connection Refused

**Cause:** Cannot connect to n8n instance

**Common Reasons:**
1. n8n instance is down
2. Wrong URL in configuration
3. Firewall blocking connection
4. VPN required but not connected

**Diagnostic Steps:**
\`\`\`
Step 1: Verify n8n is running
- Open n8n URL in browser
- Can you access the n8n UI?

Step 2: Test API directly
curl https://your-n8n.cloud/api/v1/workflows

Step 3: Check configuration
- Verify n8n_host URL is correct
- Ensure no typos in domain

Step 4: Network connectivity
- Try from different network
- Check VPN if required
- Verify firewall rules
\`\`\`

---

### Error: "ETIMEDOUT" - Request Timeout

**Cause:** Request to n8n took too long (>30 seconds)

**Common Reasons:**
1. Slow network connection
2. n8n instance overloaded
3. Large workflow/execution data
4. n8n database issues

**Solutions:**
\`\`\`
You: "Getting timeout errors when fetching workflow 123"

Claude: Timeouts can occur with large workflows. Let me try to:
1. Get workflow metadata first (lighter operation)
2. If successful, then fetch full workflow

[Uses optimized approach]

The workflow has 150+ nodes which may cause timeouts.
Consider:
- Splitting into smaller workflows
- Optimizing node count
- Checking n8n instance performance
\`\`\`

---

## Workflow Execution Errors

### Error: "Cannot execute workflow with manual trigger via API"

**Cause:** n8n REST API limitation (Epic 2)

**Explanation:**
Workflows with ONLY manual triggers cannot be executed via REST API.

**Workarounds:**
\`\`\`
You: "I can't execute workflow 456. It has a manual trigger."

Claude: That's a known n8n API limitation (v1.82.3).

**Options:**

1. **Execute in n8n UI:**
   - Open workflow in n8n
   - Click "Test Workflow" button

2. **Add valid trigger:**
   - Add webhook or schedule trigger
   - Activate workflow
   - Trigger automatically

3. **Convert to webhook:**
   Would you like me to add a webhook trigger so you can execute via HTTP POST?
\`\`\`

---

## Integration Errors

### Slack: "channel_not_found"

**Cause:** Bot not invited to channel

**Solution:**
\`\`\`
1. Open Slack channel
2. Type: /invite @YourBotName
3. Or use chat:write.public scope to post without invite
\`\`\`

---

### Google Sheets: "The caller does not have permission"

**Cause:** Sheet not shared with OAuth email

**Solution:**
\`\`\`
1. Open Google Sheet
2. Click "Share"
3. Add the OAuth email address
4. Grant "Editor" permission
5. Save
\`\`\`

---

### SMTP Email: "Authentication failed"

**For Gmail:**
\`\`\`
Cause: Using account password instead of App Password

Solution:
1. Google Account → Security
2. 2-Step Verification (enable if not active)
3. App Passwords
4. Generate password for "Mail"
5. Use 16-character app password in n8n
\`\`\`

---

## Performance Issues

### Slow Workflow Execution

**Diagnostic Conversation:**
\`\`\`
You: "Workflow 789 is taking 2 minutes to complete. How can I optimize it?"

Claude: I'll analyze the workflow structure.

[MCP tool call: get_workflow]
[MCP tool call: list_executions]

**Performance Analysis:**

Workflow: Data Processing Pipeline
Average Time: 125 seconds
Nodes: 25

**Bottlenecks Found:**
1. HTTP Request node fetching 10,000 records individually (90s)
2. Loop processing each record sequentially (30s)
3. Multiple database writes (5s)

**Optimization Recommendations:**

1. **Batch API Requests:**
   Replace individual requests with bulk API call
   Expected savings: ~75 seconds

2. **Parallel Processing:**
   Use Split In Batches node for parallel execution
   Expected savings: ~20 seconds

3. **Bulk Database Operations:**
   Write all records in single transaction
   Expected savings: ~3 seconds

**Total Expected Improvement:**
125s → ~25s (80% faster)

Would you like me to implement these optimizations?
\`\`\`

---

## Debugging Decision Tree

\`\`\`
Workflow Not Working?
│
├─ Not Triggering?
│  ├─ Webhook → Check: Active? URL correct? Test with curl
│  ├─ Schedule → Check: Active? Cron valid? Timezone correct?
│  └─ Manual → Execute in n8n UI (API limitation)
│
├─ Triggering But Failing?
│  ├─ Get execution details
│  ├─ Check error message
│  ├─ Identify failing node
│  └─ Review node configuration
│
├─ Slow Performance?
│  ├─ Check execution times per node
│  ├─ Identify bottlenecks
│  ├─ Optimize slow operations
│  └─ Consider parallel processing
│
└─ Wrong Results?
   ├─ Check node data transformation
   ├─ Verify expressions/formulas
   ├─ Test with sample data
   └─ Review connections between nodes
\`\`\`

---

## FAQ - Frequently Asked Questions

### General Questions

**Q: Can I manage multiple n8n instances from one MCP server?**

A: Yes! Use multi-instance configuration (.config.json). See [Multi-Instance Setup Guide](../multi-instance-setup.md).

---

**Q: How do I switch between production and staging?**

A: Specify instance in commands:
\`\`\`
You: "List workflows in production"
You: "List workflows in staging"
\`\`\`

Default instance used when not specified.

---

**Q: Can Claude create credentials for me?**

A: No. n8n blocks credential listing/creation via API for security (Epic 2).
Configure credentials in n8n UI, then reference them in workflows.

---

**Q: Why can't I execute my workflow via the MCP server?**

A: If your workflow has ONLY a manual trigger, it cannot be executed via n8n REST API (API limitation).

**Solutions:**
- Execute in n8n UI
- Add webhook/schedule trigger

---

### Workflow Questions

**Q: How do I test a workflow before activating it?**

A:
\`\`\`
You: "Create the workflow in staging, execute it manually, then show me the results"

[Test thoroughly]

You: "It works! Now create the same workflow in production but keep it inactive until I activate it"
\`\`\`

---

**Q: Can I copy a workflow from staging to production?**

A: Not directly copy, but you can:
\`\`\`
You: "Get workflow 123 from staging and create an identical workflow in production"

Claude: [Reads staging workflow, creates in production]

Note: Credentials and some settings may need adjustment for production.
\`\`\`

---

**Q: How do I find workflows that haven't run in a while?**

A:
\`\`\`
You: "List all workflows in production and show me their last execution times"

Claude: [Lists workflows with execution data]

Workflows with no recent executions:
- Workflow 101: Last run 45 days ago
- Workflow 203: Last run 30 days ago
\`\`\`

---

### Integration Questions

**Q: Why is my Slack message not sending?**

A: Check:
1. Credentials configured? ✓
2. Bot invited to channel? ✓
3. Channel name correct? (use #channel-name)
4. Token has chat:write permission? ✓

---

**Q: Google Sheets says permission denied**

A: Share the sheet with your OAuth email:
1. Get OAuth email from n8n credential
2. Share Google Sheet with that email
3. Grant Editor access

---

### Performance Questions

**Q: My workflow is slow. How can I speed it up?**

A:
\`\`\`
You: "Analyze workflow 456 performance and suggest optimizations"

Claude: [Analyzes execution times and workflow structure]

**Bottlenecks:** [Lists slow nodes]
**Optimizations:** [Provides specific recommendations]
**Expected Improvement:** X% faster
\`\`\`

---

**Q: Can I run workflows in parallel?**

A: Yes! Use n8n's Split In Batches node for parallel processing within a workflow.

---

## Quick Troubleshooting Checklist

### Workflow Won't Activate
- [ ] Has valid trigger node? (not manualTrigger)
- [ ] Workflow definition valid?
- [ ] No syntax errors in expressions?
- [ ] Credentials configured if needed?

### Workflow Won't Execute
- [ ] Is it activated?
- [ ] Does it have manual trigger? (API limitation)
- [ ] Trigger configuration correct?
- [ ] Test in n8n UI first?

### API Connection Issues
- [ ] n8n instance running?
- [ ] API key valid?
- [ ] URL correct (no /api/v1/)?
- [ ] Network/firewall allowing connection?

### Integration Not Working
- [ ] Credentials configured in n8n?
- [ ] Service-specific permissions set?
- [ ] API rate limits not exceeded?
- [ ] Service account has access?

---

## Getting Additional Help

### 1. Check Logs
\`\`\`bash
# MCP server logs (stderr)
npm start 2> mcp-server.log

# n8n logs
Check n8n UI → Executions → Click execution → View Details
\`\`\`

### 2. Validate Configuration
\`\`\`bash
npm run validate-config
\`\`\`

### 3. Test API Directly
\`\`\`bash
curl -X GET 'https://your-n8n.cloud/api/v1/workflows?limit=1' \\
  -H 'X-N8N-API-KEY: your_key'
\`\`\`

### 4. Report Issues
GitHub: https://github.com/your-org/mcp-n8n-workflow-builder/issues

**Include:**
- Error message (redact API keys!)
- MCP server version
- n8n version
- Steps to reproduce

---

## Next Steps

- [Advanced Debugging](../guides/advanced-debugging.md)
- [Performance Optimization](../guides/performance-optimization.md)
- [Integration Troubleshooting](../integrations/troubleshooting.md)
```

---

## Technical Implementation Notes

### Documentation Structure

```
docs/troubleshooting/
├── error-reference.md
├── debugging-guide.md
├── faq.md
├── performance-issues.md
└── integration-problems.md
```

---

## Dependencies

### Upstream Dependencies
- All Epic 1-5 features (known limitations and fixes)
- Stories 6.1-6.3 (Examples for context)

### Downstream Dependencies
- Epic 7 (API Reference) - Technical error details
- Epic 8 (Deployment) - Production troubleshooting

---

## Definition of Done

### Documentation Completeness
- [ ] 15+ common errors documented
- [ ] Solutions for each error
- [ ] 10+ FAQ entries
- [ ] Debugging decision trees
- [ ] Integration-specific troubleshooting
- [ ] Quick reference checklist

### Quality Standards
- [ ] All errors tested and verified
- [ ] Solutions work as documented
- [ ] FAQ answers are accurate
- [ ] Decision trees lead to solutions

---

## Estimation Breakdown

**Story Points:** 4

**Effort Distribution:**
- Error Reference: 1.5 SP
- FAQ Creation: 1 SP
- Debugging Guides: 1 SP
- Integration Troubleshooting: 0.5 SP

**Page Count:** 8-10 pages

**Estimated Duration:** 2 days (1 technical writer)

---

## Notes

### Success Metrics
- 75%+ issues resolved using guide
- <10% questions require support escalation
- Users find solutions in <5 minutes
- Reduced duplicate support requests

### Best Practices
- ✅ Include error messages verbatim
- ✅ Provide step-by-step solutions
- ✅ Link to related documentation
- ✅ Test all solutions before publishing
- ✅ Keep FAQ updated with common questions

---

**Status:** ✅ Completed
**Related Files:**
- `docs/troubleshooting/error-reference.md` (created)
- `docs/troubleshooting/debug-mode.md` (created)
- `docs/troubleshooting/faq.md` (created)
