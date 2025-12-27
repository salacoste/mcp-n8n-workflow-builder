# Story 6.1: Workflow Creation Examples

**Epic:** Epic 6 - Examples & Tutorials
**Story Points:** 6
**Priority:** High
**Status:** Ready for Implementation
**Estimated Page Count:** 12-15 pages

---

## User Story

**As a** new user learning to create n8n workflows via the MCP server
**I want** practical step-by-step examples for common workflow patterns
**So that** I can quickly understand how to build workflows using Claude Desktop

---

## Story Description

### Current System

With all previous epics implemented:
- ✅ Complete MCP tool suite (17 tools)
- ✅ Multi-instance architecture
- ✅ Comprehensive tool documentation
- ✅ 5 workflow prompt templates
- ❌ No practical workflow creation examples
- ❌ No end-to-end tutorials
- ❌ No real-world use case demonstrations

### Enhancement

Create comprehensive workflow creation examples covering:
- **Basic Patterns:** Simple webhook, scheduled task, data transformation
- **Integration Examples:** Slack, email, Google Sheets, databases
- **Advanced Patterns:** Multi-step workflows, error handling, conditional logic
- **Real-World Scenarios:** Customer onboarding, data sync, notification systems
- **Best Practices:** Node organization, testing, debugging

**Tutorial Format:**
- Problem statement
- Solution architecture
- Step-by-step Claude Desktop conversation
- Complete workflow definition
- Testing and validation
- Common pitfalls and solutions

---

## Acceptance Criteria

### AC1: Basic Workflow Patterns
**Given** users new to workflow creation
**When** following basic pattern examples
**Then** they should create functional workflows in <15 minutes:

#### 1.1 Example: Simple HTTP Webhook Workflow

**Document:** `docs/examples/basic-webhook-workflow.md`

```markdown
# Example: HTTP Webhook Workflow

Learn to create a simple webhook that receives HTTP requests and processes data.

## What You'll Build

A webhook workflow that:
1. Receives HTTP POST requests
2. Extracts data from request body
3. Logs the data
4. Returns success response

**Time Required:** 10 minutes
**Difficulty:** Beginner
**Prerequisites:** None

---

## Problem Statement

You need an endpoint that receives webhook notifications from external services (e.g., GitHub, Stripe) and logs the received data for debugging.

---

## Solution Architecture

```
HTTP POST Request
    ↓
[Webhook Node] → Receives request, extracts body
    ↓
[Code Node] → Logs data to console
    ↓
[Response] → Returns 200 OK
```

---

## Step-by-Step Tutorial

### Step 1: Start Conversation in Claude Desktop

\`\`\`
You: "I need to create a webhook workflow in my staging environment that logs incoming requests"

Claude: I'll help you create a webhook workflow in staging. Let me use the http-webhook-workflow prompt to generate the structure.

[MCP tool call: create_workflow]
{
  "instance": "staging",
  "name": "Webhook Logger",
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 300],
      "parameters": {
        "path": "webhook-logger",
        "responseMode": "onReceived",
        "options": {}
      }
    },
    {
      "name": "Code",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [450, 300],
      "parameters": {
        "mode": "runOnceForAllItems",
        "jsCode": "// Log incoming data\nconst data = $input.all();\nconsole.log('Received webhook data:', JSON.stringify(data, null, 2));\n\nreturn data;"
      }
    }
  ],
  "connections": {
    "Webhook": {
      "main": [[{ "node": "Code", "type": "main", "index": 0 }]]
    }
  },
  "active": false
}

✅ Workflow "Webhook Logger" created successfully in "staging"

ID: 123
Webhook URL: https://staging.app.n8n.cloud/webhook/webhook-logger
Status: Inactive (activate when ready)
\`\`\`

### Step 2: Activate the Workflow

\`\`\`
You: "Activate this workflow"

Claude: I'll activate the workflow.

[MCP tool call: activate_workflow]
{
  "instance": "staging",
  "id": "123"
}

✅ Workflow activated successfully

The webhook is now live at:
https://staging.app.n8n.cloud/webhook/webhook-logger

You can test it with:
curl -X POST https://staging.app.n8n.cloud/webhook/webhook-logger \\
  -H "Content-Type: application/json" \\
  -d '{"test": "data", "timestamp": "2025-01-15T10:30:00Z"}'
\`\`\`

### Step 3: Test the Webhook

\`\`\`bash
# Terminal
curl -X POST https://staging.app.n8n.cloud/webhook/webhook-logger \\
  -H "Content-Type: application/json" \\
  -d '{"event": "user.signup", "user_id": 12345}'

# Response
{"status":"ok"}
\`\`\`

### Step 4: Verify Execution

\`\`\`
You: "Show me the most recent execution for this workflow"

Claude: I'll retrieve the latest execution.

[MCP tool call: list_executions]
{
  "instance": "staging",
  "workflowId": "123",
  "limit": 1
}

Most recent execution:
- Execution ID: 9876
- Status: Success ✅
- Started: 2025-01-15 10:35:23
- Duration: 245ms
- Mode: webhook

The workflow successfully processed your test request.
\`\`\`

---

## Complete Workflow Definition

\`\`\`json
{
  "name": "Webhook Logger",
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 300],
      "parameters": {
        "path": "webhook-logger",
        "responseMode": "onReceived",
        "options": {}
      }
    },
    {
      "name": "Code",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [450, 300],
      "parameters": {
        "mode": "runOnceForAllItems",
        "jsCode": "// Log incoming data\\nconst data = $input.all();\\nconsole.log('Received webhook data:', JSON.stringify(data, null, 2));\\n\\nreturn data;"
      }
    }
  ],
  "connections": {
    "Webhook": {
      "main": [[{ "node": "Code", "type": "main", "index": 0 }]]
    }
  },
  "active": true
}
\`\`\`

---

## Testing Checklist

- [ ] Webhook receives POST requests
- [ ] Data logged to n8n console
- [ ] Returns 200 OK response
- [ ] Execution appears in history
- [ ] Works with different JSON payloads

---

## Common Pitfalls

**Issue:** Webhook returns 404

**Solution:** Ensure workflow is activated and path is correct

**Issue:** Data not logging

**Solution:** Check n8n console logs in n8n UI → Executions → View Details

**Issue:** Workflow not triggering

**Solution:** Verify webhook URL matches exactly (check for typos)

---

## Next Steps

1. Add data validation to Code node
2. Add error handling for malformed requests
3. Store data in database or send to external service
4. Add authentication to webhook

**Related Examples:**
- [Webhook with Validation](./webhook-with-validation.md)
- [Webhook to Slack](./webhook-to-slack.md)
- [Webhook to Database](./webhook-to-database.md)
```

#### 1.2 Example: Scheduled Daily Report

```markdown
# Example: Scheduled Daily Report Workflow

Create a workflow that runs daily and sends a report email.

## What You'll Build

A scheduled workflow that:
1. Runs every day at 9 AM
2. Fetches data from an API
3. Formats the data
4. Sends email report

**Time Required:** 15 minutes
**Difficulty:** Beginner
**Prerequisites:** Email credentials configured in n8n

---

## Claude Desktop Conversation

\`\`\`
You: "Create a daily report workflow that runs at 9 AM, fetches data from https://api.example.com/metrics, and emails the results to team@company.com"

Claude: I'll create a scheduled workflow for your daily report.

[MCP tool call: create_workflow]
{
  "instance": "production",
  "name": "Daily Metrics Report",
  "nodes": [
    {
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
      "name": "HTTP Request",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.1,
      "position": [450, 300],
      "parameters": {
        "url": "https://api.example.com/metrics",
        "authentication": "none",
        "options": {}
      }
    },
    {
      "name": "Format Data",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [650, 300],
      "parameters": {
        "jsCode": "const metrics = $input.all()[0].json;\\n\\nconst report = \`Daily Metrics Report - ${new Date().toLocaleDateString()}\\n\\nTotal Users: ${metrics.users}\\nActive Sessions: ${metrics.sessions}\\nRevenue: $${metrics.revenue}\\n\`;\\n\\nreturn [{ json: { report } }];"
      }
    },
    {
      "name": "Send Email",
      "type": "n8n-nodes-base.emailSend",
      "typeVersion": 2,
      "position": [850, 300],
      "parameters": {
        "toEmail": "team@company.com",
        "subject": "Daily Metrics Report",
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
      "main": [[{ "node": "HTTP Request", "type": "main", "index": 0 }]]
    },
    "HTTP Request": {
      "main": [[{ "node": "Format Data", "type": "main", "index": 0 }]]
    },
    "Format Data": {
      "main": [[{ "node": "Send Email", "type": "main", "index": 0 }]]
    }
  },
  "active": false
}

✅ Workflow "Daily Metrics Report" created successfully

The workflow will run daily at 9:00 AM Eastern Time.
Test it manually first before activating.
\`\`\`

### Testing

\`\`\`
You: "Execute this workflow manually to test it"

Claude: I'll trigger a manual execution.

[MCP tool call: execute_workflow]
{
  "instance": "production",
  "id": "456"
}

⚠️  Note: This workflow has a schedule trigger. For manual testing:
1. Open n8n UI
2. Navigate to the workflow
3. Click "Test Workflow" button

Or modify the workflow to add a manual trigger node for testing.
\`\`\`

### Activation

\`\`\`
You: "The test worked. Activate the workflow."

Claude: I'll activate the workflow.

[MCP tool call: activate_workflow]
{
  "instance": "production",
  "id": "456"
}

✅ Workflow activated

Your daily report will be sent to team@company.com every day at 9:00 AM EST.
\`\`\`
```

#### 1.3 Example: Data Transformation Pipeline

```markdown
# Example: Data Transformation Workflow

Transform data from one format to another.

## What You'll Build

A workflow that:
1. Receives CSV data via webhook
2. Parses and transforms the data
3. Sends formatted data to another API

**Time Required:** 15 minutes
**Difficulty:** Intermediate

---

## Claude Desktop Conversation

\`\`\`
You: "Create a workflow that receives CSV data via webhook, converts it to JSON, and posts it to https://api.example.com/data"

Claude: I'll create a data transformation workflow.

[MCP tool call: create_workflow]
{
  "instance": "staging",
  "name": "CSV to JSON Transformer",
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 300],
      "parameters": {
        "path": "csv-import",
        "responseMode": "lastNode"
      }
    },
    {
      "name": "Parse CSV",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [450, 300],
      "parameters": {
        "jsCode": "const csv = $input.all()[0].json.body.csv;\\nconst lines = csv.split('\\\\n');\\nconst headers = lines[0].split(',');\\n\\nconst items = lines.slice(1).map(line => {\\n  const values = line.split(',');\\n  const obj = {};\\n  headers.forEach((header, i) => {\\n    obj[header.trim()] = values[i]?.trim();\\n  });\\n  return { json: obj };\\n});\\n\\nreturn items;"
      }
    },
    {
      "name": "Send to API",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.1,
      "position": [650, 300],
      "parameters": {
        "url": "https://api.example.com/data",
        "method": "POST",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "data",
              "value": "={{ $json }}"
            }
          ]
        }
      }
    }
  ],
  "connections": {
    "Webhook": {
      "main": [[{ "node": "Parse CSV", "type": "main", "index": 0 }]]
    },
    "Parse CSV": {
      "main": [[{ "node": "Send to API", "type": "main", "index": 0 }]]
    }
  }
}

✅ Created CSV to JSON Transformer workflow

Webhook URL: https://staging.app.n8n.cloud/webhook/csv-import
\`\`\`
```

### AC2: Integration Examples
**Given** users integrating with external services
**When** following integration examples
**Then** they should successfully connect workflows to popular services:

#### 2.1 Example: Slack Notification Workflow

```markdown
# Example: Slack Notification on Workflow Failure

Send Slack alerts when workflows fail.

## What You'll Build

A workflow that:
1. Monitors workflow executions
2. Detects failures
3. Sends detailed Slack notifications

---

## Prerequisites

- Slack webhook URL (from Slack → Apps → Incoming Webhooks)
- Credentials configured in n8n

---

## Claude Desktop Conversation

\`\`\`
You: "Create a workflow that sends a Slack notification when any workflow fails"

Claude: I'll create an error notification workflow. Note: You'll need to trigger this from other workflows using the Execute Workflow node when errors occur.

[MCP tool call: create_workflow]
{
  "instance": "production",
  "name": "Error Notification to Slack",
  "nodes": [
    {
      "name": "Workflow Trigger",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 300],
      "parameters": {
        "path": "error-notification",
        "responseMode": "onReceived"
      }
    },
    {
      "name": "Format Error Message",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [450, 300],
      "parameters": {
        "jsCode": "const error = $input.all()[0].json;\\n\\nconst message = {\\n  text: '🚨 Workflow Failure Alert',\\n  blocks: [\\n    {\\n      type: 'header',\\n      text: { type: 'plain_text', text: '🚨 Workflow Failure' }\\n    },\\n    {\\n      type: 'section',\\n      fields: [\\n        { type: 'mrkdwn', text: \`*Workflow:*\\\\n${error.workflow}\` },\\n        { type: 'mrkdwn', text: \`*Error:*\\\\n${error.message}\` },\\n        { type: 'mrkdwn', text: \`*Time:*\\\\n${new Date().toISOString()}\` }\\n      ]\\n    }\\n  ]\\n};\\n\\nreturn [{ json: message }];"
      }
    },
    {
      "name": "Slack",
      "type": "n8n-nodes-base.slack",
      "typeVersion": 2.1,
      "position": [650, 300],
      "parameters": {
        "resource": "message",
        "operation": "post",
        "channel": "#alerts",
        "text": "={{ $json.text }}",
        "blocksUi": {
          "blocksValues": "={{ $json.blocks }}"
        }
      },
      "credentials": {
        "slackApi": {
          "id": "2",
          "name": "Slack Account"
        }
      }
    }
  ],
  "connections": {
    "Workflow Trigger": {
      "main": [[{ "node": "Format Error Message", "type": "main", "index": 0 }]]
    },
    "Format Error Message": {
      "main": [[{ "node": "Slack", "type": "main", "index": 0 }]]
    }
  }
}

✅ Created error notification workflow

To use this in other workflows, add an Error Trigger node that calls this webhook when errors occur.
\`\`\`
```

#### 2.2 Example: Google Sheets Data Sync

```markdown
# Example: Sync Data to Google Sheets

Automatically update a Google Sheet with fresh data.

## What You'll Build

A workflow that:
1. Runs every hour
2. Fetches data from API
3. Updates Google Sheets

---

## Claude Desktop Conversation

\`\`\`
You: "Create a workflow that fetches customer data from https://api.example.com/customers every hour and updates a Google Sheet"

Claude: I'll create a data sync workflow. You'll need to configure Google Sheets credentials in n8n first.

[MCP tool call: create_workflow]
{
  "instance": "production",
  "name": "Customer Data to Google Sheets",
  "nodes": [
    {
      "name": "Schedule Hourly",
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1.1,
      "position": [250, 300],
      "parameters": {
        "rule": {
          "interval": [{ "field": "hours", "hoursInterval": 1 }]
        }
      }
    },
    {
      "name": "Fetch Customer Data",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.1,
      "position": [450, 300],
      "parameters": {
        "url": "https://api.example.com/customers",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth"
      }
    },
    {
      "name": "Clear Existing Data",
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4,
      "position": [650, 300],
      "parameters": {
        "operation": "clear",
        "documentId": { "__rl": true, "value": "1ABC...", "mode": "id" },
        "sheetName": { "__rl": true, "value": "Sheet1", "mode": "name" },
        "range": "A2:Z"
      },
      "credentials": {
        "googleSheetsOAuth2Api": {
          "id": "3",
          "name": "Google Sheets"
        }
      }
    },
    {
      "name": "Append New Data",
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4,
      "position": [850, 300],
      "parameters": {
        "operation": "append",
        "documentId": { "__rl": true, "value": "1ABC...", "mode": "id" },
        "sheetName": { "__rl": true, "value": "Sheet1", "mode": "name" },
        "columns": {
          "mappingMode": "autoMapInputData",
          "matchingColumns": ["id", "name", "email", "status"]
        }
      }
    }
  ],
  "connections": {
    "Schedule Hourly": {
      "main": [[{ "node": "Fetch Customer Data", "type": "main", "index": 0 }]]
    },
    "Fetch Customer Data": {
      "main": [[{ "node": "Clear Existing Data", "type": "main", "index": 0 }]]
    },
    "Clear Existing Data": {
      "main": [[{ "node": "Append New Data", "type": "main", "index": 0 }]]
    }
  }
}

✅ Created Google Sheets sync workflow

Make sure to:
1. Configure Google Sheets credentials in n8n
2. Update the documentId with your actual Google Sheet ID
3. Test manually before activating
\`\`\`
```

### AC3: Advanced Pattern Examples
**Given** users building complex workflows
**When** following advanced examples
**Then** they should implement sophisticated patterns:

#### 3.1 Example: Conditional Routing with Error Handling

```markdown
# Example: Workflow with Conditional Logic and Error Handling

Build robust workflows with branching logic and error recovery.

## What You'll Build

A workflow that:
1. Processes incoming data
2. Routes based on conditions
3. Handles errors gracefully
4. Logs all activities

---

## Architecture

\`\`\`
Webhook
  ↓
Validate Data → [Invalid] → Log Error → Notify Admin
  ↓ [Valid]
Process Data
  ↓
Check Result → [Success] → Update Database
  ↓ [Failure]
Retry Logic → [Max Retries] → Alert Team
\`\`\`

---

## Complete Workflow

\`\`\`json
{
  "name": "Advanced Order Processing",
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300],
      "parameters": { "path": "process-order" }
    },
    {
      "name": "Validate Order",
      "type": "n8n-nodes-base.if",
      "position": [450, 300],
      "parameters": {
        "conditions": {
          "boolean": [
            {
              "value1": "={{ $json.order_id }}",
              "operation": "isNotEmpty"
            },
            {
              "value1": "={{ $json.amount }}",
              "operation": "isNotEmpty"
            }
          ]
        }
      }
    },
    {
      "name": "Process Order",
      "type": "n8n-nodes-base.httpRequest",
      "position": [650, 200],
      "parameters": {
        "url": "https://api.example.com/orders",
        "method": "POST"
      },
      "onError": "continueErrorOutput"
    },
    {
      "name": "Log Error",
      "type": "n8n-nodes-base.code",
      "position": [650, 400],
      "parameters": {
        "jsCode": "console.error('Invalid order:', $json);\\nreturn [$json];"
      }
    },
    {
      "name": "Error Handler",
      "type": "n8n-nodes-base.code",
      "position": [850, 300],
      "parameters": {
        "jsCode": "// Handle API errors\\nif ($input.item.error) {\\n  console.error('API Error:', $json);\\n  return [{ json: { status: 'retry', error: $json.error } }];\\n}\\nreturn [{ json: { status: 'success' } }];"
      }
    }
  ],
  "connections": {
    "Webhook": {
      "main": [[{ "node": "Validate Order" }]]
    },
    "Validate Order": {
      "main": [
        [{ "node": "Process Order" }],
        [{ "node": "Log Error" }]
      ]
    },
    "Process Order": {
      "main": [[{ "node": "Error Handler" }]],
      "error": [[{ "node": "Error Handler" }]]
    }
  }
}
\`\`\`
```

---

## Technical Implementation Notes

### Example Structure

```
docs/examples/
├── basic/
│   ├── webhook-workflow.md
│   ├── scheduled-report.md
│   └── data-transformation.md
├── integrations/
│   ├── slack-notifications.md
│   ├── google-sheets-sync.md
│   ├── email-automation.md
│   └── database-operations.md
├── advanced/
│   ├── conditional-routing.md
│   ├── error-handling.md
│   ├── multi-step-approval.md
│   └── data-enrichment.md
└── real-world/
    ├── customer-onboarding.md
    ├── order-processing.md
    ├── data-pipeline.md
    └── monitoring-alerts.md
```

---

## Dependencies

### Upstream Dependencies
- Epic 4 (Tools Documentation) - Tool usage patterns
- Epic 5 (Multi-Instance) - Instance routing in examples

### Downstream Dependencies
- Story 6.2 (Integration Tutorials) - Builds on these examples
- Epic 7 (API Reference) - Technical details

---

## Definition of Done

### Example Completeness
- [ ] 3+ basic workflow examples
- [ ] 5+ integration examples
- [ ] 3+ advanced pattern examples
- [ ] 2+ real-world scenario examples
- [ ] All examples tested and verified

### Quality Standards
- [ ] Step-by-step Claude Desktop conversations
- [ ] Complete workflow definitions
- [ ] Testing instructions
- [ ] Common pitfalls documented
- [ ] Screenshots where helpful

---

## Estimation Breakdown

**Story Points:** 6

**Effort Distribution:**
- Basic Examples (3): 1.5 SP
- Integration Examples (5): 2 SP
- Advanced Examples (3): 1.5 SP
- Real-World Scenarios (2): 1 SP

**Page Count:** 12-15 pages

**Estimated Duration:** 3 days (1 technical writer)

---

## Notes

### Success Metrics
- 90%+ users complete at least one example
- Examples work without modification
- Users create custom workflows after tutorials
- <10% error rate in example execution

### Best Practices
- ✅ Include complete Claude Desktop conversations
- ✅ Provide copy-paste ready workflow JSON
- ✅ Test examples in clean environment
- ✅ Document prerequisites clearly
- ✅ Show both success and error scenarios

---

**Status:** Ready for Implementation
**Related Files:**
- `docs/examples/basic/*.md`
- `docs/examples/integrations/*.md`
- `docs/examples/advanced/*.md`
- `docs/examples/real-world/*.md`
