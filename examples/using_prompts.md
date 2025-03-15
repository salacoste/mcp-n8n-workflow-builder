# Using Workflow Prompts with Claude

This guide explains how to use the prompt templates feature to quickly create workflows in n8n using Claude AI.

## What are Workflow Prompts?

Workflow prompts are predefined templates for common workflow patterns that can be filled with your specific variables. These templates help you create functional workflows quickly without having to design them from scratch.

## Available Prompts

The n8n Workflow Builder offers the following prompt templates:

### 1. Schedule Triggered Workflow

Create a workflow that runs on a specified schedule (like every hour, daily, etc.).

**Required variables:**
- `workflow_name`: Name of your workflow
- `schedule_expression`: Cron expression for schedule timing

**Optional variables:**
- `workflow_message`: Custom message included in workflow execution

**Example conversation:**

```
User: I want to create a workflow that runs every 15 minutes

Claude: I'll help you create a scheduled workflow in n8n. I can use a prompt template for this.

The workflow needs a name and a schedule. What would you like to name it?

User: System Health Check

Claude: Great! I'll create a scheduled workflow named "System Health Check" that runs every 15 minutes.

I'll use the "Schedule Triggered Workflow" prompt with:
- workflow_name: System Health Check
- schedule_expression: */15 * * * *
- workflow_message: Running system health verification

Would you like me to create this workflow now?

User: Yes, please

Claude: I've created the "System Health Check" workflow using the schedule template.
Workflow ID: YoNk24jknHj4dNZV
Status: Active
Schedule: Every 15 minutes
```

### 2. HTTP Webhook Workflow

Create a workflow that triggers when it receives an HTTP request to a specific endpoint.

**Required variables:**
- `workflow_name`: Name of your workflow
- `webhook_path`: Path for the webhook endpoint

**Optional variables:**
- `response_message`: Message to include in the response

**Example conversation:**

```
User: Create an API endpoint for user registration

Claude: I can help you create a webhook-based workflow for user registration.

I'll use the "HTTP Webhook Workflow" prompt. What would you like to name this workflow?

User: User Registration API

Claude: I'll create an HTTP webhook workflow with:
- workflow_name: User Registration API
- webhook_path: user-registration
- response_message: User registration request received successfully

Once created, you'll be able to send POST requests to:
https://your-n8n-instance.com/webhook/user-registration

Would you like me to create this workflow?

User: Yes, proceed

Claude: The "User Registration API" workflow has been created.
Workflow ID: 8nJks2jpQlM5dZxY
Status: Active
Webhook URL: https://your-n8n-instance.com/webhook/user-registration
```

### 3. Data Transformation Workflow

Create a workflow that processes and transforms input data.

**Required variables:**
- `workflow_name`: Name of your workflow
- `sample_data`: Example JSON data to transform
- `transformation_code`: JavaScript code for the transformation

**Example conversation:**

```
User: I need a workflow to format customer data

Claude: I can create a data transformation workflow for you.

I'll use the "Data Transformation Workflow" template. What would you like to name this workflow?

User: Customer Data Formatter

Claude: I'll create a data transformation workflow with:
- workflow_name: Customer Data Formatter
- sample_data: {"customers":[{"id":1,"name":"John Doe","email":"john@example.com"},{"id":2,"name":"Jane Smith","email":"jane@example.com"}]}
- transformation_code: // Format customer records
data.customers = data.customers.map(customer => ({
  customerId: customer.id,
  fullName: customer.name.toUpperCase(),
  emailAddress: customer.email,
  createdAt: new Date().toISOString()
}));

Would you like me to create this workflow now?

User: Yes

Claude: I've created the "Customer Data Formatter" workflow.
Workflow ID: TrP8m3kLnQ7xWbZ9
Status: Inactive (manual trigger)

You can now use this workflow by triggering it manually and providing customer data.
```

### 4. External Service Integration Workflow

Create a workflow that connects to external APIs or services.

**Required variables:**
- `workflow_name`: Name of your workflow
- `schedule_expression`: When to run the integration
- `api_url`: URL of the external API
- `processing_code`: JavaScript code to process the API response

**Example conversation:**

```
User: Create a workflow that fetches weather data daily

Claude: I can help you create an integration workflow for daily weather data.

I'll use the "External Service Integration Workflow" template. What would you like to name this workflow?

User: Daily Weather Report

Claude: I'll create an external service integration workflow with:
- workflow_name: Daily Weather Report
- schedule_expression: 0 8 * * * (runs at 8 AM daily)
- api_url: https://api.weatherapi.com/v1/forecast.json?key=YOUR_API_KEY&q=London&days=1
- processing_code: // Extract weather data
const location = data.location.name;
const current = data.current;
data.processed = {
  location,
  temperature: current.temp_c,
  condition: current.condition.text,
  humidity: current.humidity,
  reportDate: new Date().toISOString().split('T')[0]
};

Would you like me to create this workflow?

User: Yes, create it

Claude: I've created the "Daily Weather Report" workflow.
Workflow ID: Lkj72pQ8mR4xYzNv
Status: Active (scheduled at 8 AM daily)

Note: You'll need to update the API URL with your actual weather API key.
```

## Tips for Using Prompts

1. **Be specific** about what type of workflow you need when asking Claude.

2. **Provide all required variables** when prompted to ensure your workflow is properly configured.

3. **Check the created workflow** in your n8n instance and make any additional customizations as needed.

4. **Use the workflow ID** provided by Claude to retrieve or modify the workflow later.

5. **Consider starting with prompts** for common patterns, then customize them for more complex requirements. 