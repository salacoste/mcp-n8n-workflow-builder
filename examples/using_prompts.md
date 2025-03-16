# Using Workflow Prompts with n8n Workflow Builder

The n8n Workflow Builder includes a powerful prompts system that allows you to quickly create common workflow patterns through Claude's natural language interface. This guide explains how to use these predefined workflow templates effectively.

## Available Workflow Prompts

The system offers the following workflow templates:

1. **Schedule Triggered Workflow**  
   Create a workflow that runs on a defined schedule.

2. **HTTP Webhook Workflow**  
   Create a workflow that responds to HTTP webhook requests.

3. **Data Transformation Workflow**  
   Create a workflow for processing and transforming data.

4. **External Service Integration Workflow**  
   Create a workflow that integrates with external services via API.

5. **API Data Polling Workflow**  
   Create a workflow that polls an API and processes data with filtering.

## Trigger Node Compatibility

When using workflow prompts, it's important to understand the n8n v1.82.3 trigger node requirements:

- **Valid trigger nodes**: Workflows must have a valid trigger node to be activated
- **Recommended triggers**: The prompts system uses compatible trigger nodes such as `scheduleTrigger` and `webhook`
- **Automatic handling**: The system automatically ensures proper trigger node configuration
- **Activation guarantee**: All workflows created through prompts will have valid trigger nodes for successful activation

## How to Use Workflow Prompts

### Basic Usage Pattern

1. **Ask for a template**: Request a specific workflow type based on your needs
2. **Provide variables**: Answer Claude's questions about workflow specifics
3. **Review & customize**: Review the generated workflow and make adjustments

### Example Conversations

#### Example 1: Schedule Triggered Workflow

**You**: Create a workflow that runs every day at 9 AM to send a status report.

**Claude**: I'll help you create a schedule-triggered workflow. I need some information:

- What name would you like for this workflow?
- Should it run every day at 9 AM, or do you want a different schedule?
- What actions should occur after the trigger?

**You**: Name it "Daily Status Report", run at 9 AM daily, and it should send an email to team@example.com.

**Claude**: [Creates the workflow with a properly configured scheduleTrigger node]

#### Example 2: Webhook Workflow

**You**: I need a webhook workflow that processes incoming JSON data.

**Claude**: Let's create a webhook-triggered workflow. Please provide:

- Name for this workflow
- The webhook path (e.g., "/incoming-data")
- What processing should happen with the incoming data?

**You**: Name: "Process Incoming Data", path: "/process-data", and it should filter records with status "completed".

**Claude**: [Creates the workflow with a correctly configured webhook trigger node]

## Variable Customization

Each workflow prompt has specific variables you can customize:

### Schedule Triggered Workflow
- **Workflow name**: Name for your workflow
- **Schedule expression**: When to run (e.g., "every day at 9 AM", "every hour", "every Monday at 8 AM")
- **Actions**: What actions to perform on trigger

### HTTP Webhook Workflow
- **Workflow name**: Name for your workflow
- **Webhook path**: The URL path to expose
- **Authentication**: Whether to require authentication
- **Response handling**: How to process the request and format the response

### Data Transformation Workflow
- **Workflow name**: Name for your workflow
- **Data source**: Where to get the data
- **Transformation rules**: How to transform the data
- **Destination**: Where to send the processed data

## Tips for Effective Use

1. **Be specific**: Provide clear details about what you want the workflow to do
2. **Start simple**: Begin with basic workflows and add complexity later
3. **Combine templates**: You can ask Claude to combine aspects of different templates
4. **Iterate**: Use the created workflow as a starting point and refine it through conversation

## Troubleshooting

If you encounter issues with workflow templates:

1. **Activation problems**: Make sure your n8n instance is configured correctly and accessible
2. **Missing nodes**: If specific nodes are missing, check if your n8n instance has them installed
3. **Execution errors**: Check workflow execution logs in n8n for details
4. **Trigger issues**: Ensure the trigger node is properly configured according to your n8n version requirements

Remember that Claude can help troubleshoot issues with your workflow. Simply describe the problem you're experiencing, and Claude will suggest solutions. 