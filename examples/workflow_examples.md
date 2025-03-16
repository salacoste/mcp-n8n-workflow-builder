# n8n Workflow Examples

This document provides examples of common workflows you can create using the n8n Workflow Builder through Claude. These examples show how to use different workflow types, triggers, and actions.

## Basic Workflow Concepts

Every n8n workflow consists of the following components:

1. **Trigger Node**: Determines when the workflow should execute (e.g., schedule, webhook, manual)
2. **Processing Nodes**: Perform operations on the data (e.g., transformations, HTTP requests)
3. **Output Nodes**: Deliver the results (e.g., email, database write, HTTP response)

## Important Notes About Trigger Nodes

When creating workflows for n8n version 1.82.3, be aware of the following requirements:

- **Valid trigger required**: A workflow must have at least one valid trigger node to be activated
- **Automatic trigger addition**: If you don't specify a trigger, the system will add a `scheduleTrigger` automatically
- **Manual trigger limitation**: The `manualTrigger` node is not recognized as valid by the n8n API v1.82.3

### Recommended Trigger Types

For successful workflow activation, use one of these trigger types:

1. **Schedule Trigger** (recommended for automated tasks):
```
"type": "n8n-nodes-base.scheduleTrigger"
```

2. **Webhook Trigger** (for HTTP-based triggers):
```
"type": "n8n-nodes-base.webhook" 
```

3. **Service-specific Triggers** (e.g., Google Calendar Trigger)

## Example Workflows

### 1. Schedule-Triggered Data Fetch

This workflow runs on a schedule, fetches data from an API, and processes it.

**Claude command**: 
```
Create a workflow that runs every day at 8 AM to fetch stock prices from an API, filter stocks with price changes >5%, and send the results via email.
```

**Key components**:
- Trigger: Schedule (every day at 8 AM)
- Action: HTTP Request to fetch stock data
- Processing: Filter for significant price changes
- Output: Send email notification

### 2. Webhook Data Processor

This workflow receives data via webhook, processes it, and stores the results.

**Claude command**:
```
Create a webhook workflow that receives customer data, validates required fields, transforms the format, and stores valid entries in a database.
```

**Key components**:
- Trigger: Webhook (receives HTTP POST requests)
- Processing: Validate and transform data
- Output: Database storage operation
- Response: HTTP response to the sender

### 3. Data Integration Pipeline

This workflow connects different systems by moving and transforming data between them.

**Claude command**:
```
Create a workflow to sync customer data between Salesforce and HubSpot every 6 hours, mapping fields and only updating changed records.
```

**Key components**:
- Trigger: Schedule (every 6 hours)
- Action: Fetch data from Salesforce
- Processing: Map fields, detect changes
- Output: Update records in HubSpot

## Common Workflow Patterns

### Error Handling Workflow

**Claude command**:
```
Create a workflow with proper error handling that fetches data from an API and retries up to 3 times if the request fails, then sends a notification if all attempts fail.
```

### Data Transformation Workflow

**Claude command**:
```
Create a workflow that takes a CSV file with customer data, converts it to JSON, removes sensitive fields, and outputs the cleaned data to a new file.
```

### Multi-step Approval Workflow

**Claude command**:
```
Create a workflow that receives an expense request via webhook, sends an approval email to a manager, waits for their response, and then either proceeds with payment or sends a rejection notification.
```

## Testing Your Workflows

After creating a workflow, you can test it:

1. **For scheduled workflows**: Trigger execution manually
   ```
   Execute my "Daily Data Report" workflow now
   ```

2. **For webhook workflows**: Send a test HTTP request
   ```
   What's the URL for my "Customer Data Processor" webhook? I want to test it with Postman.
   ```

3. **Check execution results**:
   ```
   Show me the last execution of my "Stock Price Alert" workflow
   ```

## Workflow Management Examples

### Listing Workflows

**Claude command**:
```
List all my active workflows
```

### Updating Workflows

**Claude command**:
```
Update my "Weekly Report" workflow to run on Fridays at 4 PM instead of Mondays
```

### Deactivating Workflows

**Claude command**:
```
Deactivate my "Holiday Promotion" workflow
```

## Advanced Workflow Techniques

### Using Environment Variables

**Claude command**:
```
Create a workflow that uses environment variables for API keys and sensitive configuration
```

### Creating Workflow with Conditional Logic

**Claude command**:
```
Create a workflow that processes orders differently based on their total value, with premium handling for orders over $1000
```

### Workflow with Parallel Processing

**Claude command**:
```
Create a workflow that fetches data from multiple APIs in parallel and then combines the results
```

Remember that all workflows created through Claude will have proper trigger nodes to ensure they can be activated successfully on your n8n instance. 