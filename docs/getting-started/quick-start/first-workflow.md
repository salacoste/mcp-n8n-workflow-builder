# First Workflow Tutorial

Learn how to create your first n8n workflow using Claude AI and the MCP Workflow Builder.

---

## What You'll Build

In this tutorial, you'll create a simple **Scheduled Email Notification** workflow that:

- ✅ Runs on a schedule (every day at 9 AM)
- ✅ Generates a custom message
- ✅ Sends an email notification
- ✅ Can be activated and monitored

**Estimated Time:** 10-15 minutes

---

## Prerequisites

Before starting, ensure you have:

- [x] Claude Desktop with MCP server configured ([Integration Guide](claude-desktop.md))
- [x] n8n instance running and accessible
- [x] Email credentials configured in n8n (Gmail, Outlook, SendGrid, etc.)

---

## Step 1: Start a Conversation

Open Claude Desktop and start with:

```
Hi Claude! I want to create a new n8n workflow.
```

Claude will respond and offer to help create a workflow.

---

## Step 2: Describe Your Workflow

Tell Claude what you want to build:

```
Create a workflow called "Daily Morning Report" that:
- Runs every day at 9 AM
- Generates a simple greeting message
- Sends it via email to my-email@example.com
```

---

## Step 3: Claude Creates the Workflow

Claude will use the MCP tools to create the workflow:

**Example Response:**

```
I'll create the "Daily Morning Report" workflow for you.

[Claude invokes create_workflow tool]

✅ Successfully created workflow!

Workflow Details:
- ID: 15
- Name: Daily Morning Report
- Status: Inactive
- Nodes: 3
  1. Schedule Trigger (runs daily at 9 AM)
  2. Set Node (generates message)
  3. Email Node (sends notification)

The workflow is created but not yet active. Would you like me to:
1. Activate the workflow?
2. Review the workflow configuration?
3. Test it manually?
```

---

## Step 4: Review the Workflow

Ask Claude to show workflow details:

```
Show me the workflow details
```

**Claude's Response:**

```
Here's the detailed configuration:

**Workflow: Daily Morning Report (ID: 15)**

Node 1: Schedule Trigger
- Type: scheduleTrigger
- Trigger Rule: 0 9 * * *
- Timezone: America/New_York

Node 2: Set Message
- Type: set
- Operation: Set
- Fields:
  - Name: message
  - Value: "Good morning! Here's your daily report."

Node 3: Send Email
- Type: email
- Operation: Send
- To: my-email@example.com
- Subject: Daily Morning Report
- Message: {{ $json.message }}
- Credentials: [Your Email Credentials]

Connections:
- Schedule Trigger → Set Message
- Set Message → Send Email

Would you like to make any changes?
```

---

## Step 5: Activate the Workflow

Once you're satisfied, activate it:

```
Activate the workflow
```

**Claude's Response:**

```
✅ Workflow "Daily Morning Report" (ID: 15) has been activated!

The workflow will now run every day at 9:00 AM.

Next execution scheduled for: 2025-12-28 09:00:00 (America/New_York)

You can:
- Monitor executions with: "Show recent executions"
- Deactivate with: "Deactivate workflow 15"
- Test manually with: "Execute workflow 15"
```

---

## Step 6: Test the Workflow (Optional)

Test before waiting for the scheduled time:

```
Execute workflow 15 manually
```

!!! warning "Manual Execution Limitation"
    Workflows with schedule triggers cannot be executed manually via API.
    You'll need to use the n8n web interface to test manually, or wait for the scheduled execution.

**Alternative:** Ask Claude to check executions:

```
Show recent executions for workflow 15
```

---

## Step 7: Monitor Executions

After the workflow runs (or after manual execution in n8n UI):

```
List recent workflow executions
```

**Example Response:**

```
Recent Executions:

1. Workflow: Daily Morning Report (ID: 15)
   - Execution ID: 456
   - Status: ✅ Success
   - Started: 2025-12-28 09:00:15
   - Finished: 2025-12-28 09:00:18
   - Mode: trigger

2. Workflow: Daily Morning Report (ID: 15)
   - Execution ID: 455
   - Status: ✅ Success
   - Started: 2025-12-27 09:00:12
   - Finished: 2025-12-27 09:00:16
   - Mode: trigger

Total executions: 2 (all successful)
```

---

## Understanding Workflow Components

### Schedule Trigger

The schedule trigger uses cron syntax:

```
0 9 * * *
│ │ │ │ │
│ │ │ │ └─ Day of week (0-7, 0 and 7 are Sunday)
│ │ │ └─── Month (1-12)
│ │ └───── Day of month (1-31)
│ └─────── Hour (0-23)
└───────── Minute (0-59)
```

**Common Schedules:**

| Cron | Description |
|------|-------------|
| `0 9 * * *` | Every day at 9:00 AM |
| `0 */4 * * *` | Every 4 hours |
| `0 9 * * 1` | Every Monday at 9:00 AM |
| `*/15 * * * *` | Every 15 minutes |

### Set Node

The Set node creates or modifies data:

```json
{
  "parameters": {
    "mode": "manual",
    "duplicateItem": false,
    "assignments": {
      "assignments": [
        {
          "name": "message",
          "value": "Good morning!",
          "type": "string"
        }
      ]
    }
  }
}
```

### Email Node

Sends emails using configured credentials:

```json
{
  "parameters": {
    "fromEmail": "noreply@example.com",
    "toEmail": "recipient@example.com",
    "subject": "Subject Line",
    "message": "={{ $json.message }}"
  }
}
```

---

## Common Modifications

### Change Schedule

```
Update workflow 15 to run at 8 AM instead of 9 AM
```

### Add More Fields

```
Modify the Set node in workflow 15 to include:
- current date
- weather information
- task count
```

### Change Email Content

```
Update the email message to include:
- Personalized greeting
- Current date
- Motivational quote
```

---

## Next Steps: More Complex Workflows

### Workflow Ideas to Try

1. **HTTP Webhook Receiver**
   ```
   Create a workflow that receives HTTP webhooks and logs them
   ```

2. **Data Transformation**
   ```
   Create a workflow that fetches data from an API,
   transforms it, and saves to Google Sheets
   ```

3. **Conditional Logic**
   ```
   Create a workflow that sends different emails based on
   the day of the week
   ```

4. **Multi-Service Integration**
   ```
   Create a workflow that:
   - Monitors Slack for specific messages
   - Creates tasks in Notion
   - Sends summary via email
   ```

---

## Troubleshooting

### Workflow Not Executing

**Check activation status:**
```
Get workflow 15 details
```

Verify `active: true` in the response.

**Check execution history:**
```
List executions for workflow 15
```

Look for error messages in failed executions.

### Email Not Sending

**Verify credentials:**
- Check email credentials are configured in n8n
- Test credentials in n8n web interface
- Check spam folder for sent emails

**Check node configuration:**
```
Show workflow 15 details
```

Verify email node has correct recipient and credentials.

### Schedule Not Triggering

**Verify cron syntax:**
- Use [crontab.guru](https://crontab.guru) to validate cron expressions
- Check timezone settings match your location

**Check n8n instance:**
- Ensure n8n instance is running continuously
- Verify system time is correct

---

## Best Practices

### 1. Start Simple

Begin with basic workflows and gradually add complexity.

### 2. Test Before Activating

Always test workflows manually before enabling scheduled execution.

### 3. Use Descriptive Names

Name workflows, nodes, and variables clearly:
- ✅ Good: "Daily Sales Report Email"
- ❌ Bad: "Workflow 1"

### 4. Monitor Executions

Regularly check execution history for errors:
```
Show recent executions
```

### 5. Use Tags for Organization

Group related workflows with tags:
```
Create tag "daily-reports"
Add tag "daily-reports" to workflow 15
```

### 6. Document Workflow Purpose

Add workflow description explaining its purpose:
```
Update workflow 15 description to:
"Sends daily morning greeting email to team at 9 AM EST"
```

---

## Quick Reference Commands

### Workflow Management

```
List my workflows
Get workflow [ID]
Create workflow called "[name]"
Update workflow [ID]
Delete workflow [ID]
Activate workflow [ID]
Deactivate workflow [ID]
```

### Execution Management

```
List recent executions
Show executions for workflow [ID]
Get execution [ID] details
Retry execution [ID]
```

### Tag Management

```
List all tags
Create tag "[name]"
Add tag "[name]" to workflow [ID]
```

---

## Learning Resources

- **[Workflow Examples](../../examples/basic/webhook-workflow.md)** - Common patterns
- **[API Reference](../../api/workflows-api.md)** - Complete tool documentation
- **[n8n Documentation](https://docs.n8n.io)** - Official n8n docs

---

## What's Next?

Now that you've created your first workflow:

1. **[Explore Examples](../../examples/basic/webhook-workflow.md)** - Try more workflow patterns
2. **[Advanced Features](../../features/workflows-management.md)** - Deep dive into all features
3. **[API Reference](../../api/overview.md)** - Explore all available tools

---

!!! success "Congratulations! 🎉"
    You've successfully created and activated your first n8n workflow using Claude AI!

    Keep experimenting with different triggers, nodes, and integrations to build powerful automation workflows.
