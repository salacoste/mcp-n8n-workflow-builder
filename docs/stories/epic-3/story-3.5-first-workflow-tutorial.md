# Story 3.5: Creating Your First Workflow Tutorial

**Epic:** Epic 3 - Installation & Quick Start Guide
**Story ID:** STORY-3.5
**Status:** Draft
**Created:** 2025-12-27
**Updated:** 2025-12-27

---

## User Story

**As a** new user who completed installation and configuration
**I want** a guided step-by-step tutorial for creating my first workflow
**So that** I can understand the basic workflow creation process and verify everything works

---

## Story Description

### Current System Context

The MCP server provides 17 tools for n8n workflow management. For creating workflows, the primary tool is `create_workflow` which accepts:

```typescript
{
  name: string;              // Workflow name
  nodes: Node[];             // Array of workflow nodes
  connections: Connections;  // Node connections
  active: boolean;           // Auto-activate flag
  settings?: object;         // Workflow settings
  staticData?: object;       // Static data
  tags?: string[];          // Tag IDs
  instance?: string;        // Multi-instance support
}
```

**Available workflow prompts** (from PromptsService):
1. Schedule Triggered Workflow (cron-based)
2. HTTP Webhook Workflow
3. Data Transformation Workflow
4. External Service Integration
5. API Data Polling Workflow

**Node structure requirements:**
- Each node needs: name, type, typeVersion, position, parameters
- Connections format: array of source→target mappings
- Automatic conversion to n8n API format via validation.ts

### Enhancement: Guided First Workflow Tutorial

Create comprehensive beginner-friendly tutorial covering:

**Tutorial Overview:**
- What we'll build (simple HTTP webhook → Slack notification)
- Prerequisites check
- Estimated completion time (10-15 minutes)
- What you'll learn

**Step-by-Step Workflow Creation:**
1. Planning the workflow
2. Creating webhook trigger node
3. Adding Slack notification node
4. Connecting nodes
5. Configuring parameters
6. Creating and saving the workflow
7. Testing the workflow
8. Viewing execution results

**Using Workflow Prompts:**
- Introduction to built-in prompts
- Selecting appropriate prompt
- Customizing prompt variables
- Generating workflow from prompt

**Verification:**
- Confirming workflow creation
- Testing workflow execution
- Viewing in n8n UI
- Troubleshooting common issues

---

## Acceptance Criteria

### Documentation Requirements

**AC1: Tutorial Overview**
- [ ] Clear introduction:
  ```markdown
  # Creating Your First Workflow

  In this tutorial, you'll create a simple workflow that:
  - Receives HTTP webhook requests
  - Posts notifications to Slack
  - Takes 10-15 minutes to complete

  You'll learn:
  - Basic workflow structure
  - Creating nodes
  - Connecting nodes
  - Testing workflows
  ```
- [ ] Prerequisites checklist:
  - ✅ MCP server installed and running
  - ✅ Claude Desktop configured with MCP server
  - ✅ n8n instance accessible
  - ✅ Slack workspace (optional - for testing)
- [ ] What's needed:
  - Slack webhook URL (or use test mode)
  - Basic understanding of webhooks
  - n8n UI access for verification

**AC2: Understanding Workflow Structure**
- [ ] Workflow components explained:
  - **Nodes:** Individual actions (trigger, process, output)
  - **Connections:** Data flow between nodes
  - **Parameters:** Node configuration
  - **Settings:** Workflow-level configuration
- [ ] Visual diagram of simple workflow:
  ```
  [Webhook Trigger] → [Slack Node]
  ```
- [ ] Node types overview:
  - Trigger nodes (start workflow)
  - Action nodes (perform operations)
  - Data processing nodes

**AC3: Method 1 - Manual Node Creation**
- [ ] Step 1: Plan the workflow
  ```markdown
  We'll create a workflow with two nodes:
  1. Webhook Trigger - receives HTTP POST requests
  2. Slack Node - sends message to Slack channel
  ```
- [ ] Step 2: Create webhook trigger node
  ```javascript
  // In Claude Desktop conversation:
  "Create a new n8n workflow called 'My First Webhook' with these nodes:

  1. Webhook trigger node that listens on path '/my-webhook'
  2. Slack node that sends a message to #general channel

  Connect the webhook to the Slack node."

  // Claude will use create_workflow tool with:
  {
    name: "My First Webhook",
    nodes: [
      {
        name: "Webhook",
        type: "n8n-nodes-base.webhook",
        typeVersion: 1,
        position: [250, 300],
        parameters: {
          path: "my-webhook",
          responseMode: "onReceived",
          httpMethod: "POST"
        }
      },
      {
        name: "Slack",
        type: "n8n-nodes-base.slack",
        typeVersion: 1,
        position: [450, 300],
        parameters: {
          channel: "#general",
          text: "New webhook received!",
          authentication: "accessToken"
        }
      }
    ],
    connections: [
      {
        source: "Webhook",
        target: "Slack",
        sourceOutput: 0,
        targetInput: 0
      }
    ],
    active: false
  }
  ```
- [ ] Explanation of each node parameter
- [ ] Connection format explanation

**AC4: Method 2 - Using Workflow Prompts (Easier)**
- [ ] Introduction to prompts:
  ```markdown
  Workflow prompts provide pre-built templates that you can customize.
  This is the easiest way to create workflows!
  ```
- [ ] Step 1: List available prompts
  ```
  User: "What n8n workflow prompts are available?"

  Claude shows 5 prompts:
  1. Schedule Triggered Workflow
  2. HTTP Webhook Workflow ← We'll use this!
  3. Data Transformation Workflow
  4. External Service Integration
  5. API Data Polling Workflow
  ```
- [ ] Step 2: Get prompt details
  ```
  User: "Show me the HTTP Webhook Workflow prompt"

  Claude shows:
  - Prompt description
  - Required variables
  - Default values
  - Usage example
  ```
- [ ] Step 3: Use prompt to create workflow
  ```
  User: "Create a workflow using the HTTP Webhook prompt with:
  - webhook_path: my-webhook
  - response_mode: onReceived
  - http_method: POST
  - response_code: 200"

  Claude generates workflow from template
  ```
- [ ] Step 4: Verify created workflow
  ```
  User: "Get the workflow we just created"

  Claude shows full workflow details
  ```

**AC5: Testing the Workflow**
- [ ] Step 1: Activate the workflow (if not active)
  ```
  User: "Activate the 'My First Webhook' workflow"

  Claude uses activate_workflow tool
  ```
- [ ] Step 2: Get webhook URL from n8n UI
  ```markdown
  1. Open n8n UI in browser
  2. Find "My First Webhook" workflow
  3. Click on Webhook node
  4. Copy the production webhook URL
     Example: https://your-instance.app.n8n.cloud/webhook/my-webhook
  ```
- [ ] Step 3: Test with curl
  ```bash
  curl -X POST https://your-instance.app.n8n.cloud/webhook/my-webhook \
    -H "Content-Type: application/json" \
    -d '{"message": "Hello from my first workflow!"}'
  ```
- [ ] Step 4: Verify Slack message received (if configured)
- [ ] Alternative: Test mode without Slack
  ```
  User: "Show me recent executions of 'My First Webhook'"

  Claude uses list_executions tool to show results
  ```

**AC6: Viewing Execution Results**
- [ ] Check execution via Claude:
  ```
  User: "Get execution details for workflow 'My First Webhook'"

  Claude shows:
  - Execution ID
  - Status (success/error)
  - Start/end time
  - Node execution data
  ```
- [ ] Check execution in n8n UI:
  ```markdown
  1. Open n8n UI
  2. Go to "Executions" tab
  3. Find your workflow execution
  4. View node outputs
  5. Check for errors
  ```
- [ ] Understanding execution data:
  - Input data to each node
  - Output data from each node
  - Execution timeline
  - Error messages (if any)

**AC7: Common Issues and Solutions**
- [ ] Issue 1: Workflow not activating
  - **Symptom:** activate_workflow fails
  - **Cause:** Missing valid trigger node
  - **Solution:** Ensure webhook node is configured correctly
- [ ] Issue 2: Webhook returns 404
  - **Symptom:** curl test returns "Not Found"
  - **Cause:** Workflow not activated or wrong URL
  - **Solution:** Check activation status, verify webhook path
- [ ] Issue 3: Slack message not sent
  - **Symptom:** Execution succeeds but no Slack message
  - **Cause:** Slack credentials not configured
  - **Solution:** Configure Slack credentials in n8n UI first
- [ ] Issue 4: Execution shows error
  - **Symptom:** Execution status = "error"
  - **Cause:** Node parameter misconfiguration
  - **Solution:** Check execution details, fix parameters
- [ ] Issue 5: Cannot find created workflow
  - **Symptom:** Workflow not in list
  - **Cause:** Created in different instance (multi-instance)
  - **Solution:** Check correct instance, use instance parameter

**AC8: Next Steps**
- [ ] Workflow created successfully ✅
- [ ] What to explore next:
  - **Epic 4:** Complete tool documentation
    - Learn all 17 MCP tools
    - Workflows management (8 tools)
    - Executions tracking (4 tools)
    - Tags organization (5 tools)
  - **Epic 6:** Workflow templates and prompts
    - Use pre-built templates
    - Customize workflow prompts
    - Create complex workflows
  - **n8n Documentation:** Learn advanced features
    - More node types
    - Complex connections
    - Error handling
    - Workflow settings
- [ ] Suggested practice exercises:
  1. Create schedule-triggered workflow
  2. Add more nodes to existing workflow
  3. Use tags to organize workflows
  4. Try different workflow prompts
- [ ] Community resources:
  - n8n documentation
  - n8n community forum
  - Example workflows

---

## Technical Implementation Notes

### Documentation Structure

```markdown
# Creating Your First Workflow

## Tutorial Overview

### What You'll Build
- Workflow description
- Prerequisites
- Time estimate
- Learning objectives

## Understanding Workflows

### Workflow Components
- Nodes
- Connections
- Parameters
- Settings

### Workflow Types
- Trigger nodes
- Action nodes
- Flow control

## Method 1: Manual Creation

### Step-by-Step
1. Plan workflow
2. Create trigger node
3. Add action nodes
4. Configure connections
5. Set parameters
6. Create workflow

### Code Examples
- create_workflow tool usage
- Node configuration
- Connection format

## Method 2: Using Prompts (Recommended)

### Introduction to Prompts
- What are prompts
- Available prompts
- Benefits

### Using HTTP Webhook Prompt
1. List prompts
2. Select prompt
3. Customize variables
4. Generate workflow

### Prompt Customization
- Variable examples
- Default values
- Advanced options

## Testing Your Workflow

### Activation
- Activate workflow
- Verify activation

### Getting Webhook URL
- From n8n UI
- URL format

### Testing with curl
- curl command
- Expected response

### Verification
- Check Slack
- Check executions
- Review results

## Viewing Results

### Via Claude Desktop
- List executions
- Get execution details
- Analyze output

### Via n8n UI
- Executions tab
- Node data
- Timeline

## Troubleshooting

### Common Issues
1. Workflow won't activate
2. Webhook 404
3. Slack not working
4. Execution errors
5. Workflow not found

### Solutions
- Step-by-step fixes
- Prevention tips

## Next Steps

### Continue Learning
- Epic 4: Tool documentation
- Epic 6: Workflow templates
- n8n advanced features

### Practice Exercises
- Suggested workflows
- Skill progression

### Resources
- Documentation links
- Community support
```

### Content Sources

**Primary References:**
- `/src/services/promptsService.ts` - workflow prompt templates
- `/src/services/workflowBuilder.ts` - workflow construction
- `/src/utils/validation.ts` - connection format transformation
- `/examples/using_prompts.md` - prompt usage examples
- n8n official documentation for node types

### Visual Assets Needed

1. **Diagram:** Simple workflow structure (Webhook → Slack)
2. **Screenshot:** n8n UI showing created workflow
3. **Screenshot:** Webhook node configuration in n8n
4. **Screenshot:** Execution results in n8n UI
5. **Screenshot:** Claude Desktop conversation example
6. **Flowchart:** Tutorial workflow (plan → create → test → verify)
7. **Diagram:** Node connection visualization

---

## Dependencies

### Upstream Dependencies
- **Story 3.1** OR **Story 3.2** (Installation)
- **Story 3.3** (Configuration)
- **Story 3.4** (Claude Desktop Integration)

### Downstream Dependencies
- **Story 3.6** (Verification Guide) uses workflows created in this tutorial
- **Epic 4 Stories** reference this tutorial as prerequisite
- **Epic 6 Stories** build on prompt usage introduced here

### Related Stories
- **Epic 6 Story 6.2** (Template Reference) - detailed prompt documentation
- **Epic 4 Story 4.1** (Workflows Tools) - complete tool reference

---

## Definition of Done

### Content Checklist
- [ ] Tutorial overview with clear objectives
- [ ] Workflow structure explanation
- [ ] Manual creation method documented
- [ ] Prompt-based creation method documented (recommended)
- [ ] Testing instructions complete
- [ ] Execution viewing documented
- [ ] Troubleshooting covers 5+ issues
- [ ] Next steps and resources provided

### Quality Checklist
- [ ] Tutorial tested end-to-end by 3 different users
- [ ] All code examples tested and working
- [ ] Screenshots from actual n8n instance (v1.82.3)
- [ ] Both methods (manual and prompt) validated
- [ ] Diagrams clear and helpful
- [ ] Markdown formatting validated
- [ ] Internal links working

### Review Checklist
- [ ] Peer review by Dev Agent
- [ ] Beginner user testing (no prior n8n experience)
- [ ] Editor review for clarity and flow
- [ ] QA Agent validation

---

## Estimation

**Effort:** 6 story points (4-5 hours)

**Breakdown:**
- Tutorial overview and structure: 30 minutes
- Workflow components explanation: 45 minutes
- Manual creation method: 90 minutes
- Prompt-based method: 60 minutes
- Testing and verification: 45 minutes
- Troubleshooting: 30 minutes
- Diagrams and screenshots: 60 minutes

**Page Count:** 10-12 pages

---

## Notes

### Pedagogical Approach
- Start with simple example (2 nodes only)
- Explain concepts before showing code
- Provide both manual and prompt methods
- Encourage prompt method for beginners
- Include visual diagrams for each step
- Test-driven approach (verify each step)

### Tutorial Design Principles
1. **Progressive disclosure:** Start simple, add complexity gradually
2. **Learning by doing:** Hands-on creation from start
3. **Multiple paths:** Manual vs. prompt-based for different learning styles
4. **Immediate feedback:** Test and verify at each step
5. **Troubleshooting mindset:** Teach debugging from the start
6. **Real-world example:** Webhook → Slack is practical and testable

### Success Metrics
- User completes tutorial in 10-15 minutes
- First workflow works on first try (90%+ success rate)
- User understands workflow structure after tutorial
- User can create second workflow independently
- Clear preference established between manual vs. prompt methods

### Alternative Examples (for variation)
If Slack is not available:
- Webhook → HTTP Request (call external API)
- Webhook → Set node (data transformation)
- Schedule → HTTP Request (API polling)

---

**Story Owner:** Technical Writer (Scribe Persona) + Mentor Persona
**Reviewers:** Dev Agent, QA Agent, Beginner User Testers
**Target Milestone:** Epic 3 - Phase 2 (Stories 3.4-3.6)
