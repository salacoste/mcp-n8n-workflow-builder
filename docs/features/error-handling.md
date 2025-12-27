# Error Handling & Troubleshooting

Comprehensive guide to error handling patterns and troubleshooting common issues.

---

## Overview

Understanding errors helps you debug workflows, fix issues quickly, and build robust automation.

---

## Common Error Categories

### 1. Connection Errors

**Symptoms:**
- `ECONNREFUSED` - Connection refused
- `ETIMEDOUT` - Connection timeout
- `ENOTFOUND` - Host not found

**Common Causes:**
- n8n instance not running
- Incorrect `N8N_HOST` URL
- Firewall blocking connection
- Network issues

**Solutions:**
```bash
# Check n8n is running
curl https://your-n8n-instance.com

# Verify configuration
echo $N8N_HOST

# Test API connectivity
curl -H "X-N8N-API-KEY: your-key" \
  https://your-n8n-instance.com/api/v1/workflows
```

---

### 2. Authentication Errors

**Symptoms:**
- `401 Unauthorized`
- `403 Forbidden`

**Common Causes:**
- Invalid API key
- Expired API key
- Missing API key
- Incorrect permissions

**Solutions:**
```
1. Regenerate API key in n8n Settings → API
2. Update configuration with new key
3. Restart MCP server
4. Test with: "List workflows"
```

---

### 3. Validation Errors

**Symptoms:**
- `400 Bad Request`
- `422 Unprocessable Entity`
- Workflow creation fails

**Common Causes:**
- Missing required fields
- Invalid parameter formats
- Malformed connections
- Invalid node types

**Solutions:**
- Check workflow structure
- Verify all required nodes
- Validate connection format
- Review parameter types

---

### 4. API Limitations

**Known Limitations:**

**Manual Execution:**
```
Issue: execute_workflow() fails for most triggers
Cause: n8n API limitation (v1.82.3)
Solution: Use n8n web interface for manual testing
```

**Credential Retrieval:**
```
Issue: list_credentials() and get_credential() blocked
Cause: Security protection
Solution: Use n8n web UI to view credentials
```

**Tag Updates:**
```
Issue: update_tag() may return 409 Conflict
Cause: API limitation
Solution: Delete + Create pattern
```

---

## Error Response Format

### Standard Error Structure

```typescript
{
  error: {
    code: string;          // Error code
    message: string;       // Human-readable message
    details?: any;         // Additional context
  }
}
```

### Common Error Codes

| Code | Meaning | Action |
|------|---------|--------|
| `401` | Unauthorized | Check API key |
| `404` | Not Found | Verify resource ID |
| `409` | Conflict | Resource already exists or locked |
| `422` | Validation Error | Fix request data |
| `500` | Server Error | Check n8n logs |
| `503` | Service Unavailable | Wait and retry |

---

## Debugging Workflows

### Enable Debug Mode

```bash
# Set DEBUG environment variable
DEBUG=true npx @kernel.salacoste/n8n-workflow-builder
```

**Debug Output Includes:**
- API request details
- Response data
- Error stack traces
- Timing information

### Execution Debugging

**Check Execution Details:**
```
1. Get execution with full data
   → get_execution({ id, includeData: true })

2. Review node outputs
   → Check data flow through workflow

3. Identify failed node
   → Review error message and stack trace

4. Fix and retry
   → retry_execution({ id })
```

### Common Workflow Issues

**Issue: Workflow Won't Activate**
```
Cause: Missing valid trigger node
Solution: Add scheduleTrigger or webhook node
Tool: activate_workflow() auto-adds trigger if missing
```

**Issue: Execution Fails Immediately**
```
Cause: Missing credentials or invalid configuration
Solution:
1. Check credential assignment in nodes
2. Verify credential exists and is valid
3. Test credentials in n8n UI
```

**Issue: Workflow Runs But No Output**
```
Cause: Nodes disconnected or data not flowing
Solution:
1. Check node connections
2. Verify data mapping
3. Test each node individually
```

---

## Error Recovery Patterns

### Automatic Retry Pattern

```
1. Monitor for failures
   → list_executions({ status: 'error' })

2. Analyze error type
   → get_execution({ id, includeData: true })

3. Classify error
   → Temporary (network) vs Permanent (auth)

4. Retry if temporary
   → retry_execution({ id })

5. Alert if permanent
   → Log for manual intervention
```

### Circuit Breaker Pattern

```
1. Track failure rate
   → Count failures in time window

2. If > threshold (e.g., 50% in 5 min)
   → Deactivate workflow temporarily

3. Alert team
   → Notify via Slack/email

4. Manual investigation
   → Fix root cause

5. Reactivate workflow
   → activate_workflow({ id })
```

---

## Best Practices

### Error Handling in Workflows

!!! tip "Workflow Design"
    **Add Error Handling:**
    - Use IF nodes to check for errors
    - Add error workflow branches
    - Log errors to monitoring system
    - Send alerts for critical failures

    **Example Pattern:**
    ```
    Main Flow:
      Try Operation → Success → Continue
                    ↓ Error
      Error Handler → Log Error → Alert → Stop
    ```

### Monitoring

!!! tip "Proactive Monitoring"
    **Daily Checks:**
    - Review failed executions
    - Check workflow activation status
    - Monitor execution duration trends
    - Verify credential validity

    **Weekly:**
    - Clean up old executions
    - Review error patterns
    - Update workflows based on failures
    - Rotate credentials if needed

### Logging

!!! tip "Effective Logging"
    **In Workflows:**
    - Log before/after critical operations
    - Include context (workflow ID, execution ID)
    - Log input data (sanitized)
    - Log error details

    **In MCP Server:**
    - Enable DEBUG mode during development
    - Log API errors with full context
    - Disable verbose logging in production

---

## Troubleshooting Checklist

### Connection Issues
- [ ] n8n instance is running
- [ ] `N8N_HOST` URL is correct (no `/api/v1` suffix)
- [ ] Network/firewall allows connection
- [ ] API endpoint is accessible (`curl` test)

### Authentication Issues
- [ ] API key is valid and not expired
- [ ] API key has correct permissions
- [ ] Configuration file is correct
- [ ] No whitespace in API key value

### Workflow Issues
- [ ] Workflow has valid trigger node
- [ ] All nodes are properly connected
- [ ] Credentials are assigned to nodes
- [ ] Node parameters are valid

### Execution Issues
- [ ] Workflow is activated
- [ ] Trigger conditions are met
- [ ] Required services are available
- [ ] No rate limiting or quotas exceeded

---

## Getting Help

### Information to Provide

When reporting issues, include:

1. **Error Message** - Exact error text
2. **MCP Server Version** - `npx @kernel.salacoste/n8n-workflow-builder --version`
3. **n8n Version** - From n8n UI
4. **Workflow ID** - If workflow-specific
5. **Execution ID** - If execution-specific
6. **Steps to Reproduce** - What led to error
7. **Debug Logs** - With `DEBUG=true`

### Resources

- [GitHub Issues](https://github.com/salacoste/mcp-n8n-workflow-builder/issues) - Report bugs
- [Examples](../troubleshooting/error-reference.md) - Common solutions
- [API Reference](../api/overview.md) - Technical details

---

## Next Steps

- [Workflows Management](workflows-management.md) - Create robust workflows
- [Executions Management](executions-management.md) - Monitor and retry
- [Examples](../troubleshooting/error-reference.md) - Real-world solutions

---

!!! question "Still Having Issues?"
    [Report an Issue](https://github.com/salacoste/mcp-n8n-workflow-builder/issues/new)
