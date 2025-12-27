# Verification & Testing Guide

Comprehensive testing guide to verify your n8n MCP Workflow Builder installation is working correctly.

---

## Quick Health Check

Run these commands in Claude Desktop to verify basic functionality:

### Test 1: MCP Server Connection

```
What MCP tools do you have for n8n?
```

**Expected:** List of 17+ n8n workflow management tools

**If it fails:** See [Claude Desktop Integration](claude-desktop.md) troubleshooting

---

### Test 2: API Connectivity

```
List my n8n workflows
```

**Expected:** List of your workflows (or "No workflows found")

**If it fails:** Check [Configuration](../installation/configuration.md)

---

### Test 3: Read Operations

```
Show all tags
```

**Expected:** List of tags or "No tags found"

**If it fails:** Verify API key permissions

---

## Comprehensive Testing

### Test Suite Overview

| Test Category | Tests | Expected Duration |
|--------------|-------|-------------------|
| Connection | 3 tests | 1-2 minutes |
| Read Operations | 5 tests | 2-3 minutes |
| Write Operations | 6 tests | 3-5 minutes |
| Execution Tests | 3 tests | 2-3 minutes |
| Multi-Instance | 4 tests | 2-4 minutes |

**Total Time:** 10-17 minutes

---

## Connection Tests

### Test 1.1: MCP Server Discovery

**Command:**
```
What n8n tools can you use?
```

**Expected Output:**
- List of tool categories (Workflow, Execution, Tag, Credential)
- Total of 17+ tools
- Brief description of each category

**Troubleshooting:**
- If no tools appear → Check [Claude Desktop config](claude-desktop.md)
- If wrong tools appear → Verify server name is unique

---

### Test 1.2: API Connection

**Command:**
```
List workflows
```

**Expected Output:**
- Successful API call
- Workflow list (may be empty)
- No connection errors

**Troubleshooting:**
- Connection refused → Check n8n is running
- 401 Unauthorized → Verify API key
- 404 Not Found → Check N8N_HOST URL format

---

### Test 1.3: Multi-Instance Routing

*(Skip if using single instance)*

**Command:**
```
List workflows from production
```

**Expected Output:**
- Workflows from production environment
- Correct instance identified in response

**Troubleshooting:**
- Wrong instance → Check defaultEnv in .config.json
- Instance not found → Verify environment names

---

## Read Operation Tests

### Test 2.1: List Workflows

**Command:**
```
List all my workflows
```

**Expected Output:**
```
You have [N] workflows:

1. Workflow Name (ID: 1)
   - Status: Active/Inactive
   - Created: YYYY-MM-DD
   - Nodes: N

[... more workflows ...]
```

**Pass Criteria:**
- ✅ Correct count
- ✅ All workflow names visible
- ✅ Status indicators accurate

---

### Test 2.2: Get Workflow Details

**Command:**
```
Get details for workflow 1
```

*(Replace 1 with an actual workflow ID)*

**Expected Output:**
```
Workflow: [Name] (ID: 1)
Status: Active/Inactive
Created: YYYY-MM-DD
Updated: YYYY-MM-DD

Nodes (N total):
1. [Node Name] - [Node Type]
2. [Node Name] - [Node Type]
...

Connections:
- [Node A] → [Node B]
...
```

**Pass Criteria:**
- ✅ Complete workflow information
- ✅ All nodes listed
- ✅ Connections shown correctly

---

### Test 2.3: List Executions

**Command:**
```
Show recent executions
```

**Expected Output:**
```
Recent Executions:

1. Workflow: [Name] (ID: X)
   - Execution ID: Y
   - Status: Success/Error/Running
   - Started: YYYY-MM-DD HH:MM:SS
   - Finished: YYYY-MM-DD HH:MM:SS
   - Mode: trigger/manual

[... more executions ...]
```

**Pass Criteria:**
- ✅ Executions displayed
- ✅ Status indicators correct
- ✅ Timestamps accurate

---

### Test 2.4: Get Execution Details

**Command:**
```
Get execution [ID] details
```

*(Replace [ID] with actual execution ID)*

**Expected Output:**
```
Execution ID: [ID]
Workflow: [Name] (ID: X)
Status: Success/Error
Started: YYYY-MM-DD HH:MM:SS
Finished: YYYY-MM-DD HH:MM:SS
Duration: X.XX seconds

Node Results:
1. [Node Name]: Success
2. [Node Name]: Success
...
```

**Pass Criteria:**
- ✅ Detailed execution information
- ✅ Node-level results shown
- ✅ Error details if applicable

---

### Test 2.5: List Tags

**Command:**
```
List all tags
```

**Expected Output:**
```
Available Tags:

1. production (ID: 1)
   - Workflows: 5
   - Created: YYYY-MM-DD

2. development (ID: 2)
   - Workflows: 3
   - Created: YYYY-MM-DD

[... more tags ...]
```

**Pass Criteria:**
- ✅ All tags listed
- ✅ Workflow counts accurate
- ✅ Metadata displayed

---

## Write Operation Tests

!!! warning "Caution"
    These tests create, modify, and delete data. Use a test environment if possible.

### Test 3.1: Create Tag

**Command:**
```
Create a tag called "test-tag-verification"
```

**Expected Output:**
```
✅ Successfully created tag!

Tag Details:
- ID: [new ID]
- Name: test-tag-verification
- Created: YYYY-MM-DD

You can now use this tag to organize your workflows.
```

**Pass Criteria:**
- ✅ Tag created successfully
- ✅ New ID assigned
- ✅ Name stored correctly

**Cleanup:**
```
Delete tag "test-tag-verification"
```

---

### Test 3.2: Create Simple Workflow

**Command:**
```
Create a test workflow called "Verification Test Workflow" with:
- A manual trigger
- A Set node that creates a message "Hello World"
```

**Expected Output:**
```
✅ Successfully created workflow!

Workflow Details:
- ID: [new ID]
- Name: Verification Test Workflow
- Status: Inactive
- Nodes: 2
  1. Manual Trigger
  2. Set Node (message)

The workflow has been created but is not active.
```

**Pass Criteria:**
- ✅ Workflow created
- ✅ Both nodes present
- ✅ Initially inactive

**Save the workflow ID for subsequent tests**

---

### Test 3.3: Update Workflow

**Command:**
```
Update workflow [ID] to add description "This is a test workflow"
```

*(Use ID from previous test)*

**Expected Output:**
```
✅ Successfully updated workflow!

Updated Fields:
- Description: "This is a test workflow"

Workflow: Verification Test Workflow (ID: [ID])
```

**Pass Criteria:**
- ✅ Update successful
- ✅ Description saved

---

### Test 3.4: Activate Workflow

**Command:**
```
Activate workflow [ID]
```

**Expected Output:**
```
✅ Workflow "Verification Test Workflow" (ID: [ID]) has been activated!

Note: This workflow has a manual trigger and cannot be executed
automatically. You'll need to trigger it manually in the n8n interface.
```

**Pass Criteria:**
- ✅ Activation successful
- ✅ Status changed to active
- ✅ Appropriate trigger warning shown

---

### Test 3.5: Deactivate Workflow

**Command:**
```
Deactivate workflow [ID]
```

**Expected Output:**
```
✅ Workflow "Verification Test Workflow" (ID: [ID]) has been deactivated!

The workflow will no longer run automatically.
```

**Pass Criteria:**
- ✅ Deactivation successful
- ✅ Status changed to inactive

---

### Test 3.6: Delete Workflow

**Command:**
```
Delete workflow [ID]
```

**Expected Output:**
```
✅ Successfully deleted workflow "Verification Test Workflow" (ID: [ID])

The workflow and all its execution history have been removed.
```

**Pass Criteria:**
- ✅ Deletion successful
- ✅ Workflow no longer appears in list

---

## Execution Tests

### Test 4.1: Execute Workflow

**Command:**
```
Execute workflow [ID] manually
```

*(Use a workflow with non-manual trigger)*

**Expected Behavior:**
- Manual execution attempted
- Guidance provided if not supported

**Note:** Most trigger types (except webhook/manual) cannot be executed via API.

---

### Test 4.2: Retry Failed Execution

*(Skip if no failed executions)*

**Command:**
```
Retry execution [failed-execution-ID]
```

**Expected Output:**
```
✅ Successfully queued execution retry!

Original Execution: [old-ID]
New Execution: [new-ID]
Status: Running

The workflow will rerun with the same data.
```

**Pass Criteria:**
- ✅ Retry initiated
- ✅ New execution ID created
- ✅ Links to original execution

---

### Test 4.3: Delete Execution

**Command:**
```
Delete execution [old-execution-ID]
```

**Expected Output:**
```
✅ Successfully deleted execution [ID]

The execution record has been removed from history.
```

**Pass Criteria:**
- ✅ Deletion successful
- ✅ Record no longer in list

---

## Multi-Instance Tests

*(Skip if using single instance)*

### Test 5.1: List Instances

**Command:**
```
What n8n instances do you have access to?
```

**Expected Output:**
```
I have access to the following n8n environments:

1. production (default)
   - Host: https://prod.n8n.example.com
   - Status: Connected

2. staging
   - Host: https://staging.n8n.example.com
   - Status: Connected

3. development
   - Host: http://localhost:5678
   - Status: Connected
```

**Pass Criteria:**
- ✅ All instances listed
- ✅ Default marked correctly
- ✅ Connection status shown

---

### Test 5.2: Query Specific Instance

**Command:**
```
List workflows from staging
```

**Expected Output:**
- Workflows from staging environment
- Correct instance identification

---

### Test 5.3: Create in Specific Instance

**Command:**
```
Create a tag called "multi-instance-test" in development
```

**Expected Output:**
```
✅ Successfully created tag in development instance!

Tag Details:
- ID: [ID]
- Name: multi-instance-test
- Instance: development
```

**Cleanup:**
```
Delete tag "multi-instance-test" from development
```

---

### Test 5.4: Switch Default Instance

*(Test configuration only - don't actually change)*

**Verification:**
```
cat .config.json | grep defaultEnv
```

**Expected:** Shows current default environment

---

## Performance Tests

### Test 6.1: Large Workflow List

*(If you have 10+ workflows)*

**Command:**
```
List all workflows with their details
```

**Expected:**
- Response within 5 seconds
- All workflows displayed
- No timeout errors

---

### Test 6.2: Execution History

**Command:**
```
Show last 50 executions
```

**Expected:**
- Response within 10 seconds
- Pagination working correctly
- No memory issues

---

## Security Tests

### Test 7.1: API Key Validation

**Test with invalid key:**

1. Temporarily change API key in configuration
2. Restart Claude Desktop
3. Try: `List workflows`

**Expected:** Authorization error (401)

**Restore correct API key after test**

---

### Test 7.2: Permission Scope

**Command:**
```
Get credential schema for httpBasicAuth
```

**Expected:**
- Schema returned successfully
- Security note about credential protection

**Note:** Actual credential data should never be returned by API

---

## Test Results Summary

Use this checklist to track your test results:

### Connection Tests
- [ ] 1.1 MCP Server Discovery
- [ ] 1.2 API Connection
- [ ] 1.3 Multi-Instance Routing *(optional)*

### Read Operations
- [ ] 2.1 List Workflows
- [ ] 2.2 Get Workflow Details
- [ ] 2.3 List Executions
- [ ] 2.4 Get Execution Details
- [ ] 2.5 List Tags

### Write Operations
- [ ] 3.1 Create Tag
- [ ] 3.2 Create Workflow
- [ ] 3.3 Update Workflow
- [ ] 3.4 Activate Workflow
- [ ] 3.5 Deactivate Workflow
- [ ] 3.6 Delete Workflow

### Execution Tests
- [ ] 4.1 Execute Workflow
- [ ] 4.2 Retry Execution *(if applicable)*
- [ ] 4.3 Delete Execution

### Multi-Instance *(if applicable)*
- [ ] 5.1 List Instances
- [ ] 5.2 Query Specific Instance
- [ ] 5.3 Create in Specific Instance
- [ ] 5.4 Verify Default Instance

### Performance
- [ ] 6.1 Large Workflow List
- [ ] 6.2 Execution History

### Security
- [ ] 7.1 API Key Validation
- [ ] 7.2 Permission Scope

---

## Automated Testing

For automated testing, use the test scripts:

```bash
# Run comprehensive MCP tool tests
node test-mcp-tools.js

# Expected output:
# ✅ Workflow Tests: 8/8 passed
# ✅ Tag Tests: 5/5 passed
# ✅ Execution Tests: 4/4 passed
# ✅ Total: 17/17 tests passed
```

---

## Common Issues

### Issue: "No tools available"

**Cause:** MCP server not configured correctly

**Solution:** Reconfigure [Claude Desktop Integration](claude-desktop.md)

---

### Issue: "Connection refused"

**Cause:** n8n instance not running or unreachable

**Solution:**
1. Check n8n is running: `curl https://your-n8n-host.com`
2. Verify firewall settings
3. Test API manually

---

### Issue: "401 Unauthorized"

**Cause:** Invalid or expired API key

**Solution:**
1. Regenerate API key in n8n
2. Update configuration
3. Restart Claude Desktop

---

### Issue: "Slow responses"

**Cause:** Large workflow/execution datasets or network latency

**Solution:**
1. Use filters to limit results
2. Paginate large lists
3. Check network connection
4. Consider local n8n instance for development

---

## Next Steps

After completing verification:

1. **[Workflow Examples](../../examples/workflows/basic-patterns.md)** - Build real workflows
2. **[Integration Examples](../../examples/integrations/slack.md)** - Connect services
3. **[API Reference](../../api/workflows-api.md)** - Deep dive into all tools

---

!!! success "Verification Complete! ✅"
    If all tests pass, your installation is working correctly and you're ready to build production workflows!

!!! question "Tests Failed?"
    - Review [Troubleshooting Guide](../../examples/troubleshooting.md)
    - Check [GitHub Issues](https://github.com/salacoste/mcp-n8n-workflow-builder/issues)
    - Report a [new issue](https://github.com/salacoste/mcp-n8n-workflow-builder/issues/new)
