# Example: Scheduled Daily Report Workflow

Create a workflow that runs daily and sends automated email reports.

## What You'll Build

A scheduled workflow that:

1. Runs every day at 9 AM
2. Fetches data from an API
3. Formats the data into a readable report
4. Sends email report to team

**Time Required:** 15 minutes
**Difficulty:** Beginner
**Prerequisites:** Email credentials configured in n8n

---

## Problem Statement

Your team needs a daily metrics report delivered to their inbox every morning at 9 AM. The report should include:
- Total users
- Active sessions
- Revenue
- Top performing products

Currently, someone manually generates this report each morning, taking 30 minutes of their time.

**Business Impact:**
- **Time Saved:** 30 minutes/day = 10 hours/month
- **Consistency:** No missed reports
- **Timeliness:** Delivered exactly at 9 AM
- **Automation:** Zero manual effort

---

## Solution Architecture

```
[Schedule Trigger]
9 AM Daily
    ↓
[HTTP Request]
Fetch Metrics API
    ↓
[Code Node]
Format Report
    ↓
[Send Email]
Team Distribution
```

**Workflow Characteristics:**
- **Trigger:** Schedule (Cron: `0 9 * * *`)
- **Nodes:** 4 (Schedule, HTTP Request, Code, Email)
- **Frequency:** Daily at 9:00 AM
- **Timezone:** Configurable

---

## Step-by-Step Tutorial

### Step 1: Create the Scheduled Workflow

```
You: "Create a daily report workflow that runs at 9 AM, fetches data from https://api.example.com/metrics, and emails the results to team@company.com"

Claude: I'll create a scheduled workflow for your daily report.

[MCP tool call: create_workflow]
{
  "instance": "production",
  "name": "Daily Metrics Report",
  "nodes": [
    {
      "id": "schedule_1",
      "name": "Schedule Trigger",
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1.1,
      "position": [250, 300],
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "cronExpression",
              "expression": "0 9 * * *"
            }
          ]
        },
        "timezone": "America/New_York"
      }
    },
    {
      "id": "http_1",
      "name": "Fetch Metrics",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.1,
      "position": [450, 300],
      "parameters": {
        "url": "https://api.example.com/metrics",
        "authentication": "none",
        "options": {
          "timeout": 10000
        }
      }
    },
    {
      "id": "code_1",
      "name": "Format Report",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [650, 300],
      "parameters": {
        "mode": "runOnceForAllItems",
        "jsCode": "const metrics = $input.all()[0].json;\n\nconst today = new Date().toLocaleDateString('en-US', {\n  weekday: 'long',\n  year: 'numeric',\n  month: 'long',\n  day: 'numeric'\n});\n\nconst report = `\n📊 Daily Metrics Report - ${today}\n${'='.repeat(60)}\n\n👥 USERS\n   Total Users:        ${metrics.users.toLocaleString()}\n   New Today:          ${metrics.newUsers.toLocaleString()}\n   Active Sessions:    ${metrics.activeSessions.toLocaleString()}\n\n💰 REVENUE\n   Today's Revenue:    $${metrics.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}\n   Monthly Total:      $${metrics.monthlyRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}\n   Target Progress:    ${((metrics.revenue / metrics.target) * 100).toFixed(1)}%\n\n🏆 TOP PRODUCTS\n${metrics.topProducts.map((p, i) => \n  `   ${i + 1}. ${p.name.padEnd(30)} $${p.sales.toLocaleString()}`\n).join('\\n')}\n\n${'='.repeat(60)}\nGenerated: ${new Date().toISOString()}\n`;\n\nreturn [{ json: { report, subject: `Daily Metrics - ${today}` } }];"
      }
    },
    {
      "id": "email_1",
      "name": "Send Email",
      "type": "n8n-nodes-base.emailSend",
      "typeVersion": 2,
      "position": [850, 300],
      "parameters": {
        "fromEmail": "reports@company.com",
        "toEmail": "team@company.com",
        "subject": "={{ $json.subject }}",
        "emailType": "text",
        "message": "={{ $json.report }}"
      },
      "credentials": {
        "smtp": {
          "id": "1",
          "name": "Company SMTP"
        }
      }
    }
  ],
  "connections": {
    "Schedule Trigger": {
      "main": [[{ "node": "Fetch Metrics", "type": "main", "index": 0 }]]
    },
    "Fetch Metrics": {
      "main": [[{ "node": "Format Report", "type": "main", "index": 0 }]]
    },
    "Format Report": {
      "main": [[{ "node": "Send Email", "type": "main", "index": 0 }]]
    }
  },
  "active": false
}

✅ Workflow "Daily Metrics Report" created successfully

Details:
- ID: 456
- Schedule: Daily at 9:00 AM EST
- Status: Inactive (test before activating)
- Nodes: 4 (Schedule, HTTP, Code, Email)

IMPORTANT: Test manually before activating!
```

---

### Step 2: Manual Testing (Required Before Activation)

Since this workflow has a schedule trigger, you cannot execute it via the MCP server API. Instead, test in the n8n UI:

```
You: "How do I test this workflow before activating it?"

Claude: Great question! Here's how to test schedule-based workflows:

**Method 1: Manual Test in n8n UI (Recommended)**
1. Open n8n UI: https://your-n8n.cloud
2. Navigate to workflow "Daily Metrics Report"
3. Click "Test Workflow" button (top right)
4. Click "Execute Workflow"
5. Review results in execution panel

**Method 2: Temporarily Add Manual Trigger**
Ask me to add a manual trigger for testing:
"Add a manual trigger to workflow 456 for testing purposes"

**Method 3: Change Schedule to Run Soon**
Temporarily change schedule to run in 5 minutes:
"Update workflow 456 schedule to run at [current_time + 5 minutes]"

I recommend Method 1 for quickest testing.
```

#### Testing in n8n UI:

1. **Open Workflow:** Navigate to workflow in n8n UI
2. **Click "Test Workflow":** Top-right button
3. **Execute:** Click "Execute Workflow"
4. **Review Output:** Check each node's output:
   - Schedule Trigger: ✓ Triggered
   - Fetch Metrics: ✓ API response received
   - Format Report: ✓ Report formatted
   - Send Email: ✓ Email sent

**Expected Email Output:**
```
From: reports@company.com
To: team@company.com
Subject: Daily Metrics - Wednesday, January 15, 2025

📊 Daily Metrics Report - Wednesday, January 15, 2025
============================================================

👥 USERS
   Total Users:        15,432
   New Today:          127
   Active Sessions:    1,245

💰 REVENUE
   Today's Revenue:    $12,450.75
   Monthly Total:      $187,234.50
   Target Progress:    93.6%

🏆 TOP PRODUCTS
   1. Premium Plan                      $5,200
   2. Starter Plan                      $3,100
   3. Enterprise License                $2,800

============================================================
Generated: 2025-01-15T09:00:23.456Z
```

---

### Step 3: Activate for Production

After successful testing:

```
You: "The test worked perfectly! Activate workflow 456 in production."

Claude: Excellent! I'll activate the daily report workflow.

[MCP tool call: activate_workflow]
{
  "instance": "production",
  "id": "456"
}

✅ Workflow activated successfully

Your Daily Metrics Report will now run automatically every day at 9:00 AM EST.

**Next Execution:** Tomorrow at 09:00:00 EST
**Recipients:** team@company.com
**Status:** Active ✅

Would you like me to:
1. Set up execution monitoring?
2. Add error notifications?
3. Create a backup recipient list?
```

---

## Customization Options

### Change Schedule Time

Update to different time:

```
You: "Change workflow 456 to run at 6 AM instead of 9 AM"

Claude: I'll update the schedule to 6:00 AM.

[Updates cron expression from "0 9 * * *" to "0 6 * * *"]

✅ Schedule updated to 6:00 AM daily
```

### Change Timezone

```
You: "Update workflow 456 timezone to Pacific Time (PT)"

Claude: I'll change the timezone to America/Los_Angeles (PT).

[Updates timezone parameter]

✅ Timezone changed to Pacific Time
Next execution: Tomorrow at 09:00:00 PST
```

### Add Multiple Recipients

```
You: "Add sarah@company.com and john@company.com to the recipient list"

Claude: I'll update the email recipients.

[Updates toEmail parameter to "team@company.com, sarah@company.com, john@company.com"]

✅ Email recipients updated
Now sending to: team@company.com, sarah@company.com, john@company.com
```

---

## Schedule Examples

### Weekdays Only (Monday-Friday)

```javascript
{
  "cronExpression": "0 9 * * 1-5"
}
// Mon-Fri at 9 AM
```

### Twice Daily

```javascript
{
  "cronExpression": "0 9,17 * * *"
}
// 9 AM and 5 PM daily
```

### Weekly (Monday Only)

```javascript
{
  "cronExpression": "0 9 * * 1"
}
// Mondays at 9 AM
```

### Monthly (1st of Month)

```javascript
{
  "cronExpression": "0 9 1 * *"
}
// 1st of every month at 9 AM
```

### Every Hour

```javascript
{
  "cronExpression": "0 * * * *"
}
// Top of every hour
```

---

## Common Pitfalls

### Issue 1: Wrong Timezone

**Symptom:** Report arrives at unexpected time

**Solution:**
```
You: "Check what timezone workflow 456 is using"

Claude: [Gets workflow details]

Current timezone: UTC
9:00 AM UTC = 4:00 AM EST

Would you like me to change it to America/New_York (EST)?
```

**Fix:** Always specify timezone explicitly

---

### Issue 2: API Timeout

**Symptom:** Workflow fails with timeout error

**Cause:** API response takes >10 seconds

**Solution:**
```javascript
{
  "name": "Fetch Metrics",
  "parameters": {
    "url": "https://api.example.com/metrics",
    "options": {
      "timeout": 30000  // Increase to 30 seconds
    }
  }
}
```

---

### Issue 3: Email Not Sending

**Symptom:** Execution succeeds but no email received

**Checklist:**
1. ✓ SMTP credentials configured?
2. ✓ Recipient email correct?
3. ✓ Check spam folder
4. ✓ SMTP server accessible?

**Debug:**
```
You: "Why isn't workflow 456 sending emails? Show me the latest execution."

Claude: [Gets execution details]

Execution shows:
- HTTP Request: ✅ Success
- Format Report: ✅ Success
- Send Email: ❌ Failed - "Authentication failed"

Issue: SMTP credentials invalid or expired.

Fix:
1. Open n8n UI → Settings → Credentials
2. Test SMTP credential
3. Update if needed
4. Retry workflow execution
```

---

## Advanced Features

### Add Error Handling

```
You: "Add error handling to workflow 456 that sends a Slack alert if the API fails"

Claude: I'll add error handling with Slack notifications.

[Adds error trigger node and Slack notification]

✅ Error handling added
- On HTTP Request failure → Send Slack alert to #ops-alerts
- Include error details and timestamp
- Workflow continues to attempt tomorrow
```

### HTML Email Format

Replace plain text with HTML:

```javascript
{
  "name": "Send Email",
  "parameters": {
    "emailType": "html",
    "message": `
      <html>
        <body style="font-family: Arial, sans-serif;">
          <h2>📊 Daily Metrics Report</h2>
          <table style="border-collapse: collapse;">
            <tr>
              <td><strong>Total Users:</strong></td>
              <td>{{ $json.users }}</td>
            </tr>
            <tr>
              <td><strong>Revenue:</strong></td>
              <td>$</ $json.revenue }}</td>
            </tr>
          </table>
        </body>
      </html>
    `
  }
}
```

### Add Charts/Graphs

Use external chart service:

```javascript
{
  "name": "Generate Chart",
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "url": "https://quickchart.io/chart",
    "method": "POST",
    "sendBody": true,
    "bodyParameters": {
      "chart": {
        "type": "line",
        "data": {
          "labels": ["Mon", "Tue", "Wed", "Thu", "Fri"],
          "datasets": [{
            "label": "Revenue",
            "data": "={{ $json.dailyRevenue }}"
          }]
        }
      }
    }
  }
}
```

---

## Monitoring and Alerts

### Track Execution Success

```
You: "Show me execution history for workflow 456 over the last 7 days"

Claude: I'll retrieve the execution history.

[MCP tool call: list_executions with time filter]

Last 7 days execution summary:
- Total executions: 7
- Successful: 6 ✅
- Failed: 1 ❌
- Average duration: 2.3 seconds

Failed execution:
- Date: Jan 12, 2025
- Error: API timeout
- Status: Resolved (API was temporarily down)
```

### Set Up Success Monitoring

```
You: "Add a check that alerts me if the workflow hasn't run in 25 hours"

Claude: I'll create a monitoring workflow that checks execution status.

[Creates separate monitoring workflow]

✅ Monitoring workflow created
- Checks every hour if Daily Metrics Report ran in last 25 hours
- Sends alert if missing
- Notifies: your-email@company.com
```

---

## Complete Workflow Definition

```json
{
  "name": "Daily Metrics Report",
  "nodes": [
    {
      "id": "schedule_1",
      "name": "Schedule Trigger",
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1.1,
      "position": [250, 300],
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "cronExpression",
              "expression": "0 9 * * *"
            }
          ]
        },
        "timezone": "America/New_York"
      }
    },
    {
      "id": "http_1",
      "name": "Fetch Metrics",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.1,
      "position": [450, 300],
      "parameters": {
        "url": "https://api.example.com/metrics",
        "authentication": "none",
        "requestMethod": "GET",
        "options": {
          "timeout": 10000,
          "retry": {
            "enabled": true,
            "maxRetries": 3,
            "waitBetweenRetries": 1000
          }
        }
      }
    },
    {
      "id": "code_1",
      "name": "Format Report",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [650, 300],
      "parameters": {
        "mode": "runOnceForAllItems",
        "jsCode": "// Full formatting code here"
      }
    },
    {
      "id": "email_1",
      "name": "Send Email",
      "type": "n8n-nodes-base.emailSend",
      "typeVersion": 2,
      "position": [850, 300],
      "parameters": {
        "fromEmail": "reports@company.com",
        "toEmail": "team@company.com",
        "subject": "={{ $json.subject }}",
        "emailType": "text",
        "message": "={{ $json.report }}"
      },
      "credentials": {
        "smtp": {
          "id": "1",
          "name": "Company SMTP"
        }
      }
    }
  ],
  "connections": {
    "Schedule Trigger": {
      "main": [[{ "node": "Fetch Metrics", "type": "main", "index": 0 }]]
    },
    "Fetch Metrics": {
      "main": [[{ "node": "Format Report", "type": "main", "index": 0 }]]
    },
    "Format Report": {
      "main": [[{ "node": "Send Email", "type": "main", "index": 0 }]]
    }
  },
  "active": true,
  "settings": {
    "saveExecutionProgress": true,
    "saveManualExecutions": true,
    "saveDataErrorExecution": "all",
    "saveDataSuccessExecution": "all",
    "executionTimeout": 60,
    "timezone": "America/New_York"
  },
  "tags": [
    { "name": "daily" },
    { "name": "reports" },
    { "name": "automated" }
  ]
}
```

---

## Key Takeaways

✅ **Learned:**
- Create scheduled workflows with cron expressions
- Test schedule-based workflows before activation
- Format data into readable reports
- Send automated emails

✅ **Best Practices:**
- Always test manually in n8n UI first
- Specify timezone explicitly
- Add error handling for API calls
- Monitor execution history

✅ **Production Ready:**
- Configure retry logic for API calls
- Set up failure alerts
- Use HTML formatting for better readability
- Add backup recipients

---

**Estimated Reading Time:** 12 minutes
**Setup Time:** 15 minutes
**Total Time:** 27 minutes
