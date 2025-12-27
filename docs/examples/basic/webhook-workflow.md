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

You need an endpoint that receives webhook notifications from external services (e.g., GitHub, Stripe, payment processors) and logs the received data for debugging and monitoring purposes.

**Real-World Use Cases:**
- Receive payment notifications from Stripe
- Log GitHub webhook events
- Process form submissions
- Monitor API callbacks
- Debugging third-party integrations

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

**Workflow Characteristics:**
- **Trigger:** HTTP Webhook
- **Nodes:** 2 (Webhook, Code)
- **Complexity:** Simple
- **Response Time:** <100ms

---

## Step-by-Step Tutorial

### Step 1: Start Conversation in Claude Desktop

```
You: "I need to create a webhook workflow in my staging environment that logs incoming requests"

Claude: I'll help you create a webhook workflow in staging. Let me use the http-webhook-workflow prompt to generate the structure.

[MCP tool call: create_workflow]
{
  "instance": "staging",
  "name": "Webhook Logger",
  "nodes": [
    {
      "id": "webhook_1",
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
      "id": "code_1",
      "name": "Log Data",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [450, 300],
      "parameters": {
        "mode": "runOnceForAllItems",
        "jsCode": "// Log incoming webhook data\nconst data = $input.all();\n\nconsole.log('='.repeat(50));\nconsole.log('Webhook Received:', new Date().toISOString());\nconsole.log('Data:', JSON.stringify(data, null, 2));\nconsole.log('='.repeat(50));\n\n// Return the data for next nodes\nreturn data;"
      }
    }
  ],
  "connections": {
    "Webhook": {
      "main": [[{ "node": "Log Data", "type": "main", "index": 0 }]]
    }
  },
  "active": false
}

✅ Workflow "Webhook Logger" created successfully in "staging"

Details:
- ID: 123
- Webhook URL: https://staging.app.n8n.cloud/webhook/webhook-logger
- Status: Inactive (activate when ready)
- Nodes: 2 (Webhook, Log Data)

The webhook will log all incoming POST requests to the n8n console.
```

---

### Step 2: Activate the Workflow

```
You: "Activate this workflow"

Claude: I'll activate the workflow now.

[MCP tool call: activate_workflow]
{
  "instance": "staging",
  "id": "123"
}

✅ Workflow activated successfully

The webhook is now live at:
https://staging.app.n8n.cloud/webhook/webhook-logger

You can test it with:
curl -X POST https://staging.app.n8n.cloud/webhook/webhook-logger \
  -H "Content-Type: application/json" \
  -d '{"test": "data", "timestamp": "2025-01-15T10:30:00Z"}'
```

---

### Step 3: Test the Webhook

#### Using curl:

```bash
curl -X POST https://staging.app.n8n.cloud/webhook/webhook-logger \
  -H "Content-Type: application/json" \
  -d '{
    "event": "user.signup",
    "user_id": 12345,
    "email": "user@example.com",
    "timestamp": "2025-01-15T10:35:00Z"
  }'
```

**Expected Response:**
```json
{"status":"ok"}
```

#### Using Postman:

1. **Method:** POST
2. **URL:** `https://staging.app.n8n.cloud/webhook/webhook-logger`
3. **Headers:** `Content-Type: application/json`
4. **Body (raw JSON):**
```json
{
  "event": "payment.success",
  "amount": 49.99,
  "currency": "USD",
  "customer_id": "cus_12345"
}
```

#### Using JavaScript:

```javascript
fetch('https://staging.app.n8n.cloud/webhook/webhook-logger', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    event: 'form.submit',
    name: 'John Doe',
    email: 'john@example.com'
  })
})
.then(response => response.json())
.then(data => console.log('Success:', data));
```

---

### Step 4: Verify Execution

```
You: "Show me the most recent execution for this workflow"

Claude: I'll retrieve the latest execution details.

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
- Finished: 2025-01-15 10:35:23
- Duration: 245ms
- Mode: webhook

The workflow successfully processed your test request.
Check the n8n logs to see the logged data.
```

---

## Complete Workflow Definition

```json
{
  "name": "Webhook Logger",
  "nodes": [
    {
      "id": "webhook_1",
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
      "id": "code_1",
      "name": "Log Data",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [450, 300],
      "parameters": {
        "mode": "runOnceForAllItems",
        "jsCode": "// Log incoming webhook data\nconst data = $input.all();\n\nconsole.log('='.repeat(50));\nconsole.log('Webhook Received:', new Date().toISOString());\nconsole.log('Data:', JSON.stringify(data, null, 2));\nconsole.log('='.repeat(50));\n\nreturn data;"
      }
    }
  ],
  "connections": {
    "Webhook": {
      "main": [[{ "node": "Log Data", "type": "main", "index": 0 }]]
    }
  },
  "active": true,
  "settings": {
    "saveExecutionProgress": true,
    "saveManualExecutions": true,
    "saveDataErrorExecution": "all",
    "saveDataSuccessExecution": "all"
  }
}
```

---

## Testing Checklist

- [x] Webhook receives POST requests
- [x] Data logged to n8n console
- [x] Returns 200 OK response
- [x] Execution appears in history
- [x] Works with different JSON payloads
- [ ] Security: Add authentication (next step)
- [ ] Monitoring: Set up error alerts

---

## Viewing Logged Data

### Method 1: n8n UI

1. Open n8n UI
2. Navigate to **Executions** tab
3. Click on the execution
4. Select "Log Data" node
5. View the output in **Output** panel

### Method 2: Docker Logs (if using Docker)

```bash
docker logs n8n 2>&1 | grep "Webhook Received"
```

### Method 3: n8n Server Logs

```bash
# If running n8n locally
tail -f ~/.n8n/logs/n8n.log | grep "Webhook Received"
```

---

## Common Pitfalls

### Issue 1: Webhook Returns 404

**Symptoms:**
```bash
curl: (22) The requested URL returned error: 404
```

**Causes:**
- Workflow not activated
- Wrong webhook path in URL
- Typo in webhook path

**Solution:**
1. Verify workflow is active: `You: "Is workflow 123 in staging active?"`
2. Check webhook path matches URL
3. Ensure exact path spelling: `webhook-logger` not `webhook_logger`

---

### Issue 2: Data Not Logging

**Symptoms:**
- Webhook responds 200 OK
- But no logs appear in console

**Solution:**
1. Check n8n console logs (not browser console)
2. Open n8n UI → Executions → View Details
3. Click "Log Data" node to see output
4. Verify Code node has `console.log()` statement

---

### Issue 3: Workflow Not Triggering

**Symptoms:**
- No execution created when webhook called
- Webhook returns error

**Checklist:**
```
You: "Debug workflow 123 in staging - webhook not triggering"

Claude: I'll help debug. Let me check:

1. Is workflow active? ✓
2. Get workflow details to verify webhook configuration
3. Check recent executions for errors
```

**Common fixes:**
- Activate workflow
- Check webhook URL is correct
- Verify HTTP method (POST vs GET)
- Test with simple curl first

---

### Issue 4: Invalid JSON Error

**Symptoms:**
```
Error: Unexpected token in JSON at position 0
```

**Cause:** Sending non-JSON data to webhook expecting JSON

**Solution:**
```javascript
// ❌ Wrong - plain text
curl -d "test=data"

// ✅ Correct - JSON
curl -H "Content-Type: application/json" -d '{"test":"data"}'
```

---

## Next Steps

### 1. Add Data Validation

Enhance workflow to validate incoming data:

```
You: "Add validation to workflow 123 to check that 'email' and 'user_id' fields exist"

Claude: I'll add an IF node for validation.

[Adds validation node between Webhook and Log Data]
```

### 2. Add Error Handling

Handle malformed requests gracefully:

```javascript
{
  "name": "Error Handler",
  "type": "n8n-nodes-base.code",
  "parameters": {
    "jsCode": "try {\n  const data = $input.all();\n  // Validate required fields\n  if (!data[0].json.email) {\n    throw new Error('Missing email field');\n  }\n  return data;\n} catch (error) {\n  console.error('Validation error:', error.message);\n  return [{ json: { error: error.message } }];\n}"
  }
}
```

### 3. Store Data in Database

Connect to PostgreSQL, MongoDB, or other database:

```
You: "Add a PostgreSQL node after the logger that saves the webhook data to a 'webhook_events' table"
```

### 4. Send Notifications

Alert team on specific events:

```
You: "Add a Slack notification when the webhook receives a 'payment.failed' event"
```

---

## Real-World Enhancement Examples

### Example 1: GitHub Webhook Handler

```json
{
  "name": "GitHub Webhook Handler",
  "nodes": [
    {
      "name": "Webhook",
      "parameters": { "path": "github-events" }
    },
    {
      "name": "Extract Event Type",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "const event = $json.headers['x-github-event'];\nconst action = $json.body.action;\nreturn [{ json: { event, action, data: $json.body } }];"
      }
    },
    {
      "name": "Route by Event",
      "type": "n8n-nodes-base.switch",
      "parameters": {
        "rules": [
          { "value": "push" },
          { "value": "pull_request" },
          { "value": "issue" }
        ]
      }
    }
  ]
}
```

### Example 2: Stripe Payment Webhook

```json
{
  "name": "Stripe Payment Webhook",
  "nodes": [
    {
      "name": "Webhook",
      "parameters": { "path": "stripe-payments" }
    },
    {
      "name": "Verify Stripe Signature",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "// Verify webhook signature for security\nconst stripe = require('stripe');\nconst signature = $json.headers['stripe-signature'];\n// Validation logic here\nreturn [$json];"
      }
    },
    {
      "name": "Process Payment",
      "type": "n8n-nodes-base.switch"
    }
  ]
}
```

---

## Related Examples

- [Webhook with Authentication](./webhook-with-auth.md)
- [Webhook to Slack](../integrations/slack-notifications.md)
- [Webhook to Database](../integrations/database-operations.md)
- [Advanced Error Handling](../advanced/error-handling.md)

---

## Key Takeaways

✅ **Learned:**
- Create simple webhook workflows via Claude Desktop
- Activate and test webhooks
- View execution logs
- Debug common webhook issues

✅ **Best Practices:**
- Always test in staging first
- Validate incoming data
- Log important events
- Monitor webhook executions

✅ **Next Level:**
- Add authentication
- Implement data validation
- Store data persistently
- Send notifications on events

---

**Estimated Reading Time:** 15 minutes
**Hands-On Time:** 10 minutes
**Total Time:** 25 minutes
