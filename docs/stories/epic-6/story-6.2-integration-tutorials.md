# Story 6.2: Integration Tutorials

**Epic:** Epic 6 - Examples & Tutorials
**Story Points:** 7
**Priority:** High
**Status:** Ready for Implementation
**Estimated Page Count:** 14-18 pages

---

## User Story

**As a** user integrating n8n with popular SaaS platforms
**I want** detailed tutorials for common service integrations
**So that** I can quickly connect my workflows to Slack, Google Workspace, databases, and other services

---

## Story Description

### Current System

With Story 6.1 completed:
- ✅ Basic workflow creation examples
- ✅ Simple integration patterns shown
- ❌ No deep-dive integration tutorials
- ❌ No service-specific configuration guides
- ❌ No authentication setup documentation
- ❌ No troubleshooting for specific integrations

### Enhancement

Create comprehensive integration tutorials for:
- **Communication:** Slack, Discord, Microsoft Teams, Email (SMTP, Gmail)
- **Productivity:** Google Sheets, Notion, Airtable, Trello
- **Databases:** PostgreSQL, MySQL, MongoDB, Redis
- **APIs:** REST APIs, GraphQL, WebSockets
- **Cloud Storage:** AWS S3, Google Drive, Dropbox
- **Development:** GitHub, GitLab, Jira

**Tutorial Format:**
- Service overview and use cases
- Prerequisites and credential setup
- Step-by-step integration guide
- Common patterns and examples
- Troubleshooting specific errors
- Best practices

---

## Acceptance Criteria

### AC1: Communication Platform Integrations
**Given** users wanting to connect communication tools
**When** following communication platform tutorials
**Then** they should successfully integrate messaging services:

#### 1.1 Tutorial: Slack Integration

**Document:** `docs/tutorials/integrations/slack-integration.md`

```markdown
# Slack Integration Tutorial

Complete guide to integrating n8n workflows with Slack.

## Overview

Slack integration enables:
- Sending messages and notifications
- Creating channels and managing members
- Responding to slash commands
- Interactive buttons and forms
- File uploads and sharing

**Time Required:** 20 minutes
**Difficulty:** Beginner to Intermediate

---

## Prerequisites

### Slack Workspace Setup

1. **Create Slack App** (https://api.slack.com/apps)
   - Click "Create New App"
   - Choose "From scratch"
   - Name: "n8n Integration"
   - Select workspace

2. **Configure Permissions**
   - Go to "OAuth & Permissions"
   - Add Bot Token Scopes:
     - `chat:write` - Send messages
     - `chat:write.public` - Post to public channels
     - `files:write` - Upload files
     - `channels:read` - List channels
     - `users:read` - Get user info

3. **Install App to Workspace**
   - Click "Install to Workspace"
   - Authorize the app
   - Copy "Bot User OAuth Token" (starts with `xoxb-`)

### n8n Credential Setup

\`\`\`
You: "I need to configure Slack credentials in my n8n instance. Can you guide me?"

Claude: I'll help you set up Slack credentials. While I can't create credentials directly through the MCP server (n8n blocks credential listing/creation for security), I can guide you through the n8n UI setup.

**Steps:**

1. Open n8n UI
2. Go to **Settings** → **Credentials**
3. Click **Add Credential**
4. Search for "Slack"
5. Select "Slack OAuth2 API"
6. Enter:
   - **OAuth Token:** Your `xoxb-` token from Slack app
   - **Name:** "Slack Production" (or your preference)
7. Click **Save**

Once configured, you can reference this credential in workflows I create.

Would you like me to create a workflow that uses Slack?
\`\`\`

---

## Tutorial 1: Send Message to Slack Channel

### Use Case
Send automated notifications to a Slack channel when events occur.

### Claude Desktop Conversation

\`\`\`
You: "Create a workflow that sends a welcome message to #general when a new user signs up"

Claude: I'll create a Slack notification workflow.

[MCP tool call: create_workflow]
{
  "instance": "production",
  "name": "New User Slack Notification",
  "nodes": [
    {
      "name": "Webhook - New User",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 300],
      "parameters": {
        "path": "new-user-notification",
        "responseMode": "onReceived"
      }
    },
    {
      "name": "Format Message",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [450, 300],
      "parameters": {
        "jsCode": "const user = $json;\\n\\nreturn [{\\n  json: {\\n    text: \`🎉 Welcome to the team!\\n\\nNew user just signed up:\\n• Name: ${user.name}\\n• Email: ${user.email}\\n• Plan: ${user.plan || 'Free'}\\n\\nJoined: ${new Date().toLocaleString()}\`\\n  }\\n}];"
      }
    },
    {
      "name": "Send to Slack",
      "type": "n8n-nodes-base.slack",
      "typeVersion": 2.1,
      "position": [650, 300],
      "parameters": {
        "resource": "message",
        "operation": "post",
        "channel": "#general",
        "text": "={{ $json.text }}"
      },
      "credentials": {
        "slackApi": {
          "id": "1",
          "name": "Slack Production"
        }
      }
    }
  ],
  "connections": {
    "Webhook - New User": {
      "main": [[{ "node": "Format Message", "type": "main", "index": 0 }]]
    },
    "Format Message": {
      "main": [[{ "node": "Send to Slack", "type": "main", "index": 0 }]]
    }
  },
  "active": false
}

✅ Workflow created successfully

Webhook URL: https://your-n8n.cloud/webhook/new-user-notification

To trigger, send POST request:
\`\`\`bash
curl -X POST https://your-n8n.cloud/webhook/new-user-notification \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "plan": "Pro"
  }'
\`\`\`

You: "Great! Activate it and test with a sample user."

Claude: I'll activate the workflow.

[MCP tool call: activate_workflow]
{
  "instance": "production",
  "id": "789"
}

✅ Workflow activated

The workflow is now live. Test it with the curl command above.
\`\`\`

---

## Tutorial 2: Slack Interactive Buttons

### Use Case
Create interactive approval workflows with Slack buttons.

### Workflow Overview

\`\`\`
Approval Request
    ↓
Send Slack Message with Buttons
    ↓
User Clicks Button
    ↓
[Approve] → Execute Action
[Deny] → Log Rejection
\`\`\`

### Implementation

\`\`\`json
{
  "name": "Slack Approval Workflow",
  "nodes": [
    {
      "name": "Approval Request",
      "type": "n8n-nodes-base.webhook",
      "parameters": { "path": "approval-request" }
    },
    {
      "name": "Send Slack Interactive Message",
      "type": "n8n-nodes-base.slack",
      "parameters": {
        "resource": "message",
        "operation": "post",
        "channel": "#approvals",
        "text": "Approval Required",
        "blocksUi": {
          "blocksValues": [
            {
              "type": "section",
              "text": {
                "type": "mrkdwn",
                "text": "*Approval Request*\\n{{ $json.description }}"
              }
            },
            {
              "type": "actions",
              "elements": [
                {
                  "type": "button",
                  "text": { "type": "plain_text", "text": "✅ Approve" },
                  "style": "primary",
                  "value": "approve"
                },
                {
                  "type": "button",
                  "text": { "type": "plain_text", "text": "❌ Deny" },
                  "style": "danger",
                  "value": "deny"
                }
              ]
            }
          ]
        }
      }
    }
  ]
}
\`\`\`

---

## Common Slack Integration Patterns

### 1. Daily Standup Reminder

\`\`\`javascript
// Schedule: Every weekday at 9 AM
{
  "trigger": "scheduleTrigger",
  "schedule": "0 9 * * 1-5",
  "slack": {
    "channel": "#team",
    "message": "🌅 Good morning team! Time for daily standup."
  }
}
\`\`\`

### 2. Error Notifications

\`\`\`javascript
// On workflow error
{
  "trigger": "errorTrigger",
  "slack": {
    "channel": "#alerts",
    "message": "🚨 Workflow failed: {{ $json.error }}",
    "mention": "@oncall"
  }
}
\`\`\`

### 3. File Upload

\`\`\`javascript
// Upload report to Slack
{
  "slack": {
    "operation": "uploadFile",
    "channel": "#reports",
    "file": "={{ $binary.data }}",
    "fileName": "daily-report.pdf",
    "comment": "Here's today's report"
  }
}
\`\`\`

---

## Troubleshooting

### Issue: "channel_not_found" Error

**Cause:** Bot not added to channel

**Solution:**
1. Open Slack channel
2. Type: `/invite @n8n Integration`
3. Or add bot to public channels automatically with `chat:write.public` scope

### Issue: "not_authed" or "invalid_auth" Error

**Cause:** Invalid or expired token

**Solution:**
1. Go to Slack App settings
2. Reinstall app to workspace
3. Copy new OAuth token
4. Update n8n credential

### Issue: Messages Not Appearing

**Cause:** Missing `chat:write` permission

**Solution:**
1. Go to Slack App → OAuth & Permissions
2. Add `chat:write` scope
3. Reinstall app
4. Update token in n8n

---

## Best Practices

### 1. Rate Limiting

Slack has rate limits (1 message/second per channel):

\`\`\`javascript
// Add delay between messages
{
  "wait": {
    "time": 1000  // 1 second delay
  }
}
\`\`\`

### 2. Message Formatting

Use Slack's Block Kit for rich messages:

\`\`\`json
{
  "blocks": [
    {
      "type": "header",
      "text": { "type": "plain_text", "text": "📊 Report" }
    },
    {
      "type": "section",
      "fields": [
        { "type": "mrkdwn", "text": "*Status:*\\nSuccess" },
        { "type": "mrkdwn", "text": "*Duration:*\\n2.5s" }
      ]
    }
  ]
}
\`\`\`

### 3. Error Handling

Always handle Slack API errors:

\`\`\`javascript
try {
  // Send Slack message
} catch (error) {
  console.error('Slack error:', error);
  // Fallback: Send email or log
}
\`\`\`

---

## Next Steps

- [Slack Slash Commands](./slack-slash-commands.md)
- [Slack Events API](./slack-events-api.md)
- [Advanced Slack Workflows](./slack-advanced.md)
```

#### 1.2 Tutorial: Email Integration (Gmail & SMTP)

```markdown
# Email Integration Tutorial

Complete guide to sending emails from n8n workflows.

## Overview

Email integration options:
- **Gmail API:** OAuth2 authentication, full Gmail features
- **SMTP:** Works with any email provider (Gmail, Outlook, custom)
- **SendGrid:** Transactional email service
- **Email Send Node:** Generic email sending

---

## Method 1: Gmail API Integration

### Prerequisites

1. **Google Cloud Project:**
   - Go to https://console.cloud.google.com
   - Create new project: "n8n Email Integration"

2. **Enable Gmail API:**
   - APIs & Services → Enable APIs
   - Search "Gmail API"
   - Click "Enable"

3. **Create OAuth Credentials:**
   - Credentials → Create Credentials → OAuth 2.0 Client ID
   - Application type: Web application
   - Name: "n8n"
   - Authorized redirect URIs: `https://your-n8n.cloud/rest/oauth2-credential/callback`
   - Copy Client ID and Client Secret

### n8n Setup

\`\`\`
You: "I've set up Google OAuth. How do I configure Gmail in n8n?"

Claude: Configure Gmail credentials in n8n UI:

1. Settings → Credentials → Add Credential
2. Search "Gmail"
3. Select "Gmail OAuth2 API"
4. Enter:
   - Client ID
   - Client Secret
5. Click "Connect my account"
6. Authorize Google account
7. Save as "Gmail Production"

Once configured, I can create workflows that send emails.
\`\`\`

### Send Email via Gmail

\`\`\`
You: "Create a workflow that sends a welcome email when someone subscribes"

Claude: I'll create a welcome email workflow using Gmail.

[MCP tool call: create_workflow]
{
  "instance": "production",
  "name": "Welcome Email - Gmail",
  "nodes": [
    {
      "name": "New Subscriber",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "new-subscriber",
        "responseMode": "onReceived"
      }
    },
    {
      "name": "Send Welcome Email",
      "type": "n8n-nodes-base.gmail",
      "typeVersion": 2.1,
      "parameters": {
        "resource": "message",
        "operation": "send",
        "to": "={{ $json.email }}",
        "subject": "Welcome to Our Platform! 🎉",
        "emailType": "html",
        "message": "<h2>Welcome {{ $json.name }}!</h2><p>We're excited to have you on board.</p><p>Your account is now active.</p>"
      },
      "credentials": {
        "gmailOAuth2": {
          "id": "2",
          "name": "Gmail Production"
        }
      }
    }
  ],
  "connections": {
    "New Subscriber": {
      "main": [[{ "node": "Send Welcome Email" }]]
    }
  }
}

✅ Workflow created

Webhook: https://your-n8n.cloud/webhook/new-subscriber
\`\`\`

---

## Method 2: SMTP Integration

### SMTP Setup (Universal for All Providers)

**Gmail SMTP Settings:**
\`\`\`
Host: smtp.gmail.com
Port: 587 (TLS) or 465 (SSL)
User: your-email@gmail.com
Password: App Password (not your account password!)
\`\`\`

**Outlook/Microsoft 365:**
\`\`\`
Host: smtp.office365.com
Port: 587
User: your-email@outlook.com
Password: Your account password
\`\`\`

**Custom SMTP:**
\`\`\`
Host: mail.yourdomain.com
Port: 587 or 465
User: noreply@yourdomain.com
Password: SMTP password
\`\`\`

### Gmail App Password Setup

1. Google Account → Security
2. 2-Step Verification (must be enabled)
3. App Passwords
4. Select: Mail → Other (n8n)
5. Generate
6. Copy 16-character password

### n8n SMTP Credential

\`\`\`
Settings → Credentials → Add Credential
Search: "SMTP"
Enter:
  Host: smtp.gmail.com
  Port: 587
  Secure: Use TLS
  User: your-email@gmail.com
  Password: [16-char app password]
Save as: "Company SMTP"
\`\`\`

### Send Email via SMTP

\`\`\`json
{
  "name": "Email Send via SMTP",
  "type": "n8n-nodes-base.emailSend",
  "parameters": {
    "fromEmail": "noreply@company.com",
    "toEmail": "={{ $json.email }}",
    "subject": "Order Confirmation",
    "emailType": "html",
    "message": "<h2>Order #{{ $json.orderId }}</h2><p>Thank you for your purchase!</p>"
  },
  "credentials": {
    "smtp": {
      "id": "3",
      "name": "Company SMTP"
    }
  }
}
\`\`\`

---

## Advanced Email Patterns

### 1. HTML Email Templates

\`\`\`html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; }
    .header { background: #4CAF50; color: white; padding: 20px; }
    .content { padding: 20px; }
    .footer { background: #f1f1f1; padding: 10px; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <h1>{{ $json.title }}</h1>
  </div>
  <div class="content">
    {{ $json.content }}
  </div>
  <div class="footer">
    <p>© 2025 Your Company</p>
  </div>
</body>
</html>
\`\`\`

### 2. Email with Attachments

\`\`\`json
{
  "type": "n8n-nodes-base.emailSend",
  "parameters": {
    "toEmail": "customer@example.com",
    "subject": "Your Invoice",
    "message": "Please find your invoice attached.",
    "attachments": "={{ $binary.invoice.fileName }}",
    "options": {
      "binaryPropertyName": "invoice"
    }
  }
}
\`\`\`

### 3. Batch Emails with Delay

\`\`\`javascript
// Send to multiple recipients with delay
for (const recipient of recipients) {
  await sendEmail(recipient);
  await wait(1000); // 1 second delay to avoid rate limits
}
\`\`\`

---

## Troubleshooting

### Gmail: "Less Secure App" Error

**Solution:** Use App Passwords instead of account password

### SMTP: Connection Timeout

**Causes:**
- Firewall blocking port 587/465
- Incorrect host/port
- ISP blocking SMTP

**Solutions:**
- Try alternative port (587 vs 465)
- Check firewall rules
- Use VPN if ISP blocks SMTP

### Emails Going to Spam

**Solutions:**
- Set up SPF record for your domain
- Configure DKIM signing
- Use authenticated SMTP
- Avoid spam trigger words
- Include unsubscribe link

---

## Best Practices

### 1. Email Rate Limiting

\`\`\`javascript
// Gmail: 500 emails/day, 2000/day with paid G Suite
// SMTP: Varies by provider

// Add delays for bulk sending
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

for (const email of emails) {
  await sendEmail(email);
  await delay(100); // 100ms between emails
}
\`\`\`

### 2. Error Handling

\`\`\`javascript
try {
  await sendEmail(recipient);
} catch (error) {
  // Log failed email
  console.error('Email failed:', recipient, error);

  // Queue for retry
  await queueForRetry(recipient);
}
\`\`\`

### 3. Personalization

\`\`\`javascript
const message = \`
Hello {{ $json.name }},

Thank you for signing up on {{ $json.signup_date }}.

Your account ID is: {{ $json.account_id }}

Best regards,
The Team
\`;
\`\`\`

---

## Next Steps

- [Email Templates Library](./email-templates.md)
- [Transactional Email with SendGrid](./sendgrid-integration.md)
- [Email Marketing Automation](./email-marketing.md)
```

### AC2: Productivity Tool Integrations
**Given** users working with productivity platforms
**When** following productivity tool tutorials
**Then** they should successfully integrate with Google Workspace, Notion, etc.:

#### 2.1 Tutorial: Google Sheets Integration

```markdown
# Google Sheets Integration Tutorial

Complete guide to reading and writing Google Sheets data.

## Overview

Google Sheets integration enables:
- Reading data from sheets
- Writing and appending data
- Creating and updating sheets
- Lookup and filtering operations
- Batch operations

**Common Use Cases:**
- Data import/export
- Reporting dashboards
- Form responses
- Inventory management
- CRM synchronization

---

## Prerequisites

### Google Cloud Setup

1. **Create Project:**
   - https://console.cloud.google.com
   - New Project: "n8n Sheets Integration"

2. **Enable Google Sheets API:**
   - APIs & Services → Library
   - Search "Google Sheets API"
   - Enable

3. **Create OAuth Credentials:**
   - Credentials → Create → OAuth 2.0 Client
   - Web application
   - Redirect URI: `https://your-n8n.cloud/rest/oauth2-credential/callback`
   - Copy Client ID and Secret

### n8n Credential Configuration

\`\`\`
Settings → Credentials → Add
Search: "Google Sheets"
Select: "Google Sheets OAuth2 API"
Enter: Client ID, Client Secret
Connect: Authorize Google account
Save: "Google Sheets Production"
\`\`\`

---

## Tutorial 1: Read Data from Google Sheets

### Use Case
Import customer data from Google Sheets into your workflow.

### Claude Desktop Conversation

\`\`\`
You: "Create a workflow that reads customer data from a Google Sheet and processes it"

Claude: I'll create a workflow to read and process Google Sheets data.

[MCP tool call: create_workflow]
{
  "instance": "production",
  "name": "Import Customers from Sheets",
  "nodes": [
    {
      "name": "Schedule Daily",
      "type": "n8n-nodes-base.scheduleTrigger",
      "parameters": {
        "rule": { "interval": [{ "field": "days", "daysInterval": 1 }] }
      }
    },
    {
      "name": "Read Customer Sheet",
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4,
      "parameters": {
        "operation": "read",
        "documentId": {
          "__rl": true,
          "value": "1ABC...XYZ",  // Your Sheet ID
          "mode": "id"
        },
        "sheetName": {
          "__rl": true,
          "value": "Customers",
          "mode": "name"
        },
        "options": {
          "range": "A1:E100"
        }
      },
      "credentials": {
        "googleSheetsOAuth2Api": {
          "id": "4",
          "name": "Google Sheets Production"
        }
      }
    },
    {
      "name": "Process Each Customer",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "// Process customer data\\nconst customers = $input.all();\\n\\nconst processed = customers.map(customer => ({\\n  id: customer.json.ID,\\n  name: customer.json.Name,\\n  email: customer.json.Email,\\n  status: customer.json.Status || 'active'\\n}));\\n\\nreturn processed.map(c => ({ json: c }));"
      }
    }
  ],
  "connections": {
    "Schedule Daily": {
      "main": [[{ "node": "Read Customer Sheet" }]]
    },
    "Read Customer Sheet": {
      "main": [[{ "node": "Process Each Customer" }]]
    }
  }
}

✅ Workflow created

Note: Update the documentId with your actual Google Sheet ID (from sheet URL).
\`\`\`

---

## Tutorial 2: Write Data to Google Sheets

### Use Case
Append form submissions to a Google Sheet.

\`\`\`json
{
  "name": "Append to Google Sheets",
  "type": "n8n-nodes-base.googleSheets",
  "typeVersion": 4,
  "parameters": {
    "operation": "append",
    "documentId": { "value": "1ABC...XYZ", "mode": "id" },
    "sheetName": { "value": "Form Responses", "mode": "name" },
    "columns": {
      "mappingMode": "defineBelow",
      "value": {
        "Name": "={{ $json.name }}",
        "Email": "={{ $json.email }}",
        "Message": "={{ $json.message }}",
        "Timestamp": "={{ $now.toISO() }}"
      }
    }
  }
}
\`\`\`

---

## Tutorial 3: Lookup Data in Google Sheets

### Use Case
Find specific rows based on criteria.

\`\`\`json
{
  "name": "Lookup Customer",
  "type": "n8n-nodes-base.googleSheets",
  "typeVersion": 4,
  "parameters": {
    "operation": "lookup",
    "documentId": { "value": "1ABC...XYZ", "mode": "id" },
    "sheetName": { "value": "Customers", "mode": "name" },
    "lookupColumn": "Email",
    "lookupValue": "={{ $json.email }}",
    "options": {}
  }
}
\`\`\`

---

## Advanced Patterns

### 1. Batch Update Multiple Rows

\`\`\`javascript
// Update multiple rows at once
{
  "operation": "update",
  "documentId": "1ABC...XYZ",
  "sheetName": "Inventory",
  "dataMode": "autoMapInputData",
  "options": {
    "range": "A2:D100"
  }
}
\`\`\`

### 2. Create New Sheet

\`\`\`javascript
{
  "operation": "create",
  "title": "Monthly Report - January 2025",
  "sheetsUi": {
    "sheetValues": [
      {
        "sheetName": "Data",
        "headerRow": "ID,Name,Value,Date"
      }
    ]
  }
}
\`\`\`

### 3. Clear Sheet Data

\`\`\`javascript
{
  "operation": "clear",
  "documentId": "1ABC...XYZ",
  "sheetName": "Temp Data",
  "range": "A2:Z1000"  // Clear all data except headers
}
\`\`\`

---

## Troubleshooting

### Error: "The caller does not have permission"

**Solution:** Share the Google Sheet with the OAuth email address

### Error: "Unable to parse range"

**Solution:** Use A1 notation (e.g., "A1:E100") and ensure range exists

### Error: "Requested entity was not found"

**Solution:** Verify Sheet ID in URL matches documentId parameter

---

## Best Practices

### 1. Use Sheet ID, Not Sheet Name
\`\`\`javascript
// ✅ Good: Use Sheet ID
"documentId": "1ABC123...XYZ789"

// ❌ Avoid: Sheet names can change
"documentId": "My Customer List"
\`\`\`

### 2. Batch Operations
\`\`\`javascript
// ✅ Good: Batch append
appendRows(allData);  // One API call

// ❌ Avoid: Individual appends
for (row of data) {
  appendRow(row);  // Multiple API calls
}
\`\`\`

### 3. Error Handling
\`\`\`javascript
try {
  await googleSheets.append(data);
} catch (error) {
  console.error('Sheets error:', error);
  // Fallback: Store in database or retry queue
}
\`\`\`

---

## Next Steps

- [Google Drive Integration](./google-drive-integration.md)
- [Sheets Formulas and Functions](./sheets-formulas.md)
- [Data Validation with Sheets](./sheets-validation.md)
```

---

## Technical Implementation Notes

### Tutorial Structure

```
docs/tutorials/integrations/
├── communication/
│   ├── slack-integration.md
│   ├── discord-integration.md
│   ├── teams-integration.md
│   └── email-integration.md
├── productivity/
│   ├── google-sheets-integration.md
│   ├── notion-integration.md
│   ├── airtable-integration.md
│   └── trello-integration.md
├── databases/
│   ├── postgresql-integration.md
│   ├── mysql-integration.md
│   ├── mongodb-integration.md
│   └── redis-integration.md
├── apis/
│   ├── rest-api-integration.md
│   ├── graphql-integration.md
│   └── websocket-integration.md
├── storage/
│   ├── aws-s3-integration.md
│   ├── google-drive-integration.md
│   └── dropbox-integration.md
└── development/
    ├── github-integration.md
    ├── gitlab-integration.md
    └── jira-integration.md
```

---

## Dependencies

### Upstream Dependencies
- Story 6.1 (Workflow Examples) - Foundation patterns
- Epic 4 (Tools Documentation) - Tool usage

### Downstream Dependencies
- Story 6.3 (Usage Patterns) - Advanced patterns using integrations
- Epic 7 (API Reference) - Technical integration details

---

## Definition of Done

### Tutorial Completeness
- [ ] 4+ communication platform tutorials
- [ ] 4+ productivity tool tutorials
- [ ] 4+ database integration tutorials
- [ ] 3+ API integration tutorials
- [ ] 3+ storage service tutorials
- [ ] 3+ development tool tutorials

### Quality Standards
- [ ] Credential setup documented
- [ ] Authentication troubleshooting included
- [ ] Common error messages explained
- [ ] Best practices for each service
- [ ] All tutorials tested end-to-end

---

## Estimation Breakdown

**Story Points:** 7

**Effort Distribution:**
- Communication (4 tutorials): 1.5 SP
- Productivity (4 tutorials): 1.5 SP
- Databases (4 tutorials): 1.5 SP
- APIs (3 tutorials): 1 SP
- Storage (3 tutorials): 0.75 SP
- Development (3 tutorials): 0.75 SP

**Page Count:** 14-18 pages

**Estimated Duration:** 3-4 days (1 technical writer)

---

## Notes

### Success Metrics
- 85%+ users complete at least one integration
- Credential setup success rate >90%
- Integration tutorials work without modification
- <15% error rate during setup

### Best Practices
- ✅ Include credential setup for each service
- ✅ Document service-specific rate limits
- ✅ Provide troubleshooting for common errors
- ✅ Show both OAuth and API key methods
- ✅ Include real-world use case examples

---

**Status:** Ready for Implementation
**Related Files:**
- `docs/tutorials/integrations/communication/*.md`
- `docs/tutorials/integrations/productivity/*.md`
- `docs/tutorials/integrations/databases/*.md`
- `docs/tutorials/integrations/apis/*.md`
- `docs/tutorials/integrations/storage/*.md`
- `docs/tutorials/integrations/development/*.md`
