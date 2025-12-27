# Debug Mode & Logging Guide

Complete guide to debug mode, logging system, and debugging workflows for the n8n MCP Workflow Builder.

---

## Quick Start

Enable debug mode to see detailed logs:

```bash
# Start with debug mode
DEBUG=true npm start

# Or for specific port
DEBUG=true MCP_PORT=58921 npm start
```

**What you'll see:**
- Configuration loading details
- URL normalization logs
- API request/response information
- Instance routing decisions
- Error stack traces

---

## Table of Contents

1. [Enabling Debug Mode](#enabling-debug-mode)
2. [Log Levels & Categories](#log-levels--categories)
3. [Reading Logs](#reading-logs)
4. [Common Log Patterns](#common-log-patterns)
5. [Debugging Workflows](#debugging-workflows)
6. [Performance Debugging](#performance-debugging)
7. [Network Debugging](#network-debugging)
8. [Multi-Instance Debugging](#multi-instance-debugging)

---

## Enabling Debug Mode

### Development Environment

**Option 1: Environment Variable**
```bash
# Enable debug mode
DEBUG=true npm start

# With custom port
DEBUG=true MCP_PORT=58921 npm start

# With other environment variables
DEBUG=true N8N_HOST=https://n8n.example.com N8N_API_KEY=key npm start
```

**Option 2: In .env File**
```bash
# Create or edit .env
echo "DEBUG=true" >> .env

# Then start normally
npm start
```

**Option 3: Export Environment Variable**
```bash
# Set for current session
export DEBUG=true
npm start

# Unset when done
unset DEBUG
```

### Claude Desktop Configuration

Add `DEBUG` to environment variables in `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "n8n-workflow-builder": {
      "command": "node",
      "args": ["/absolute/path/to/build/index.js"],
      "env": {
        "DEBUG": "true",
        "N8N_HOST": "https://n8n.example.com",
        "N8N_API_KEY": "your_api_key",
        "MCP_PORT": "58921"
      }
    }
  }
}
```

**Restart Required:**
- Quit Claude Desktop completely
- Relaunch to apply debug mode

### Production Environment

**⚠️ Warning:** Debug mode generates verbose logs. Use with caution in production.

**Recommended Approach:**
```bash
# Enable temporarily for troubleshooting
DEBUG=true npm start

# Disable after debugging
npm start
```

**Alternative: Log to File**
```bash
# Redirect debug logs to file
DEBUG=true npm start 2> debug.log

# Monitor logs
tail -f debug.log
```

---

## Log Levels & Categories

### Log Levels

All MCP logs use `console.error()` to avoid interfering with JSON-RPC on stdout.

| Level | Description | When Used |
|-------|-------------|-----------|
| **info** | General information | Startup, configuration loaded, instance routing |
| **error** | Error messages | API failures, validation errors, crashes |
| **debug** | Debug information | Only when `DEBUG=true` |
| **warn** | Warning messages | Deprecation notices, potential issues |

### Log Categories

**Configuration Loading:**
```
[ConfigLoader] Loading configuration...
[ConfigLoader] Using .config.json (multi-instance mode)
[ConfigLoader] Loaded 3 environments: production, staging, development
[ConfigLoader] Default environment: production
```

**Environment Manager:**
```
[EnvironmentManager] Initializing for instance: production
[EnvironmentManager] Original URL: https://n8n.example.com/api/v1/
[EnvironmentManager] Normalized baseURL: https://n8n.example.com/api/v1
[EnvironmentManager] API instance cached for: production
```

**API Wrapper:**
```
[N8NApiWrapper] Calling list_workflows for instance: production
[N8NApiWrapper] Request: GET /workflows?limit=10
[N8NApiWrapper] Response: 200 OK (123ms)
[N8NApiWrapper] Retrieved 10 workflows
```

**MCP Server:**
```
[MCP] Server initialized on port 58921
[MCP] Tool called: list_workflows
[MCP] Tool execution successful: list_workflows (234ms)
[MCP] Resource requested: n8n://workflows
```

**Error Logs:**
```
[ERROR] API error during list_workflows
[ERROR] Status: 401
[ERROR] Response: {"code":401,"message":"Unauthorized"}
```

---

## Reading Logs

### Log Format

```
[Category] Message with details
```

**Examples:**

```
[ConfigLoader] Configuration loaded successfully
[EnvironmentManager] Using instance: production
[N8NApiWrapper] API call successful: GET /workflows
[MCP] Tool executed: create_workflow (1.2s)
[ERROR] Authentication failed: Invalid API key
```

### Timestamp Analysis

Logs include execution time in parentheses for performance monitoring:

```
[N8NApiWrapper] Response: 200 OK (45ms)
[MCP] Tool execution successful: list_workflows (234ms)
```

**Performance Indicators:**
- `< 100ms` - Excellent (cached or simple operation)
- `100-500ms` - Good (typical API call)
- `500-2000ms` - Acceptable (complex operation)
- `> 2000ms` - Slow (investigate)

### Error Stack Traces

When `DEBUG=true`, errors include full stack traces:

```
[ERROR] API error during list_workflows
Error: Request failed with status code 401
    at N8NApiWrapper.handleApiError (N8NApiWrapper.ts:123)
    at N8NApiWrapper.listWorkflows (N8NApiWrapper.ts:234)
    at processTicksAndRejections (internal/process/task_queues.js:93)
[ERROR] Status: 401
[ERROR] Response: {"code":401,"message":"Invalid credentials"}
```

**Reading Stack Traces:**
1. **Error message** - What went wrong
2. **Status code** - HTTP status (401 = auth, 404 = not found, etc.)
3. **Stack trace** - Where error originated
4. **Response body** - n8n API error details

---

## Common Log Patterns

### Successful Tool Execution

```
[MCP] Tool called: list_workflows
[N8NApiWrapper] Calling list_workflows for instance: production
[EnvironmentManager] Using cached API instance for: production
[N8NApiWrapper] Request: GET /workflows?limit=10
[N8NApiWrapper] Response: 200 OK (87ms)
[N8NApiWrapper] Retrieved 10 workflows
[MCP] Tool execution successful: list_workflows (145ms)
```

**Indicators:**
- ✅ 200 OK status
- ✅ Response time < 500ms
- ✅ Expected data retrieved
- ✅ No error messages

### API Call Failure

```
[MCP] Tool called: list_workflows
[N8NApiWrapper] Calling list_workflows for instance: production
[N8NApiWrapper] Request: GET /workflows
[ERROR] API error during list_workflows
[ERROR] Status: 401
[ERROR] Response: {"code":401,"message":"Unauthorized"}
Error: Request failed with status code 401
    at N8NApiWrapper.handleApiError (...)
```

**Indicators:**
- ❌ 401 Unauthorized (invalid API key)
- ❌ 404 Not Found (wrong URL or resource)
- ❌ 500 Internal Server Error (n8n issue)
- ❌ ECONNREFUSED (n8n not reachable)

### URL Normalization (Epic 1)

```
[EnvironmentManager] Initializing for instance: production
[EnvironmentManager] Original URL: https://n8n.example.com/api/v1/
[EnvironmentManager] URL includes /api/v1, normalizing...
[EnvironmentManager] Normalized baseURL: https://n8n.example.com/api/v1
```

**What this means:**
- Automatic removal of duplicate `/api/v1` paths
- Ensures correct API endpoint construction
- Prevents 404 errors from malformed URLs

### Instance Routing Logs

```
[ConfigLoader] Loaded 3 environments: production, staging, development
[ConfigLoader] Default environment: production
[MCP] Tool called: list_workflows (instance: staging)
[EnvironmentManager] Resolving instance: staging
[EnvironmentManager] Using cached API instance for: staging
```

**Instance Selection:**
- Explicit instance parameter → Use specified instance
- No instance parameter → Use default environment
- Invalid instance → Error with available instances list

### Configuration Loading

```
[ConfigLoader] Loading configuration...
[ConfigLoader] Checking for .config.json...
[ConfigLoader] Found .config.json
[ConfigLoader] Using .config.json (multi-instance mode)
[ConfigLoader] Loaded 3 environments: production, staging, development
[ConfigLoader] Default environment: production
[ConfigLoader] Configuration loaded successfully
```

**Fallback Order:**
1. `.config.json` (multi-instance)
2. `.env` file (single instance)
3. Environment variables

---

## Debugging Workflows

### Installation Debugging

**Enable debug mode and check startup:**

```bash
DEBUG=true npm start
```

**Expected Output:**
```
[ConfigLoader] Loading configuration...
[ConfigLoader] Configuration loaded successfully
[MCP] Server initialized on port 58921
[MCP] Listening for MCP requests...
```

**Common Issues:**

**Missing configuration:**
```
[ERROR] Configuration file not found
[ERROR] Please create .config.json or .env file
```
**Solution:** Create configuration file

**Invalid JSON:**
```
[ERROR] Failed to parse .config.json
SyntaxError: Unexpected token } in JSON at position 123
```
**Solution:** Validate JSON syntax

**Port conflict:**
```
[ERROR] Port 3456 already in use
```
**Solution:** Use `MCP_PORT=58921` or kill process on port 3456

### Configuration Debugging

**Check configuration loading:**

```bash
DEBUG=true npm start
```

**Look for:**
```
[ConfigLoader] Using .config.json (multi-instance mode)
[ConfigLoader] Loaded environments: production, staging, development
[ConfigLoader] Default environment: production
```

**Verify URL normalization:**
```
[EnvironmentManager] Original URL: https://n8n.example.com/api/v1/
[EnvironmentManager] Normalized baseURL: https://n8n.example.com/api/v1
```

**Test API connectivity:**
```
[N8NApiWrapper] Request: GET /workflows?limit=1
[N8NApiWrapper] Response: 200 OK
```

### Runtime Debugging

**Monitor tool execution:**

```bash
DEBUG=true npm start
```

**Watch for:**
```
[MCP] Tool called: create_workflow
[N8NApiWrapper] Calling create_workflow for instance: production
[N8NApiWrapper] Request: POST /workflows
[N8NApiWrapper] Request body: {...}
[N8NApiWrapper] Response: 201 Created (456ms)
[MCP] Tool execution successful: create_workflow (523ms)
```

**Debug specific operations:**

**list_workflows:**
```
[N8NApiWrapper] Request: GET /workflows?limit=10&cursor=abc123
[N8NApiWrapper] Response: 200 OK (123ms)
[N8NApiWrapper] Retrieved 10 workflows, nextCursor: def456
```

**activate_workflow:**
```
[N8NApiWrapper] Activating workflow 123
[N8NApiWrapper] Checking for valid trigger nodes...
[N8NApiWrapper] Found trigger: scheduleTrigger
[N8NApiWrapper] Request: PATCH /workflows/123
[N8NApiWrapper] Response: 200 OK
```

---

## Performance Debugging

### Identifying Slow Operations

**Enable debug mode and monitor execution times:**

```bash
DEBUG=true npm start
```

**Look for slow operations:**
```
[N8NApiWrapper] Response: 200 OK (2345ms)  # > 2 seconds!
```

**Common Slow Operations:**

**Large workflow lists (without pagination):**
```
[N8NApiWrapper] Request: GET /workflows  # No limit!
[N8NApiWrapper] Response: 200 OK (5678ms)  # Very slow
```
**Solution:** Use pagination with `limit` and `cursor`

**Retrieving full workflow data:**
```
[N8NApiWrapper] Request: GET /workflows/123
[N8NApiWrapper] Response: 200 OK (3456ms)  # Large workflow
```
**Solution:** Use metadata-only list first, fetch details only when needed

### API Response Time Analysis

**Measure API performance:**

```bash
DEBUG=true npm start 2>&1 | grep "Response:"
```

**Output:**
```
[N8NApiWrapper] Response: 200 OK (45ms)
[N8NApiWrapper] Response: 200 OK (123ms)
[N8NApiWrapper] Response: 200 OK (2345ms)  # Outlier!
```

**Performance Thresholds:**
- `< 100ms` - Cached or simple operation ✅
- `100-500ms` - Normal API call ✅
- `500-2000ms` - Complex operation ⚠️
- `> 2000ms` - Performance issue ❌

### Memory Usage Patterns

**Monitor memory with Node.js flags:**

```bash
DEBUG=true node --trace-warnings --expose-gc build/index.js
```

**Look for:**
- Memory leaks (increasing memory over time)
- Large object allocations
- GC (garbage collection) pauses

### Connection Pooling Metrics

**Check API instance caching:**

```bash
DEBUG=true npm start 2>&1 | grep "API instance"
```

**Expected:**
```
[EnvironmentManager] API instance created for: production
[EnvironmentManager] Using cached API instance for: production  # Reuse!
[EnvironmentManager] Using cached API instance for: production  # Reuse!
```

**Performance Impact:**
- First call: Instance creation (~50ms overhead)
- Subsequent calls: Cached instance (~0ms overhead)
- ~100x faster for repeated operations

---

## Network Debugging

### Request/Response Inspection

**Enable debug mode to see all HTTP traffic:**

```bash
DEBUG=true npm start
```

**Full request details:**
```
[N8NApiWrapper] Request: POST /workflows
[N8NApiWrapper] URL: https://n8n.example.com/api/v1/workflows
[N8NApiWrapper] Headers: {
  "X-N8N-API-KEY": "***",  # Redacted in logs
  "Content-Type": "application/json"
}
[N8NApiWrapper] Request body: {
  "name": "My Workflow",
  "nodes": [...],
  "connections": {...}
}
```

**Response details:**
```
[N8NApiWrapper] Response: 201 Created (456ms)
[N8NApiWrapper] Response body: {
  "id": "123",
  "name": "My Workflow",
  "active": false,
  "createdAt": "2025-01-15T10:00:00Z"
}
```

### URL Construction Verification

**Check final API URLs:**

```bash
DEBUG=true npm start 2>&1 | grep "URL:"
```

**Output:**
```
[N8NApiWrapper] URL: https://n8n.example.com/api/v1/workflows
[N8NApiWrapper] URL: https://n8n.example.com/api/v1/workflows/123
[N8NApiWrapper] URL: https://n8n.example.com/api/v1/executions?workflowId=123
```

**Verify:**
- ✅ No duplicate `/api/v1` paths
- ✅ Correct protocol (http/https)
- ✅ Correct domain
- ✅ Proper query parameters

### Authentication Header Checking

**Verify API key is sent:**

```bash
DEBUG=true npm start 2>&1 | grep "Headers:"
```

**Expected:**
```
[N8NApiWrapper] Headers: {
  "X-N8N-API-KEY": "***",  # Present and redacted
  "Content-Type": "application/json"
}
```

**Issues:**
- Missing `X-N8N-API-KEY` → API key not configured
- Wrong header name → Check n8n API version

### Proxy/Firewall Detection

**Test connectivity:**

```bash
# Enable verbose curl output
curl -v https://your-n8n-host/api/v1/workflows \
  -H "X-N8N-API-KEY: your_key"
```

**Look for:**
```
* Connected to your-n8n-host (IP) port 443 (#0)
* TLS handshake succeeded
> GET /api/v1/workflows HTTP/1.1
> Host: your-n8n-host
> X-N8N-API-KEY: your_key

< HTTP/1.1 200 OK
```

**Common Issues:**
- `Connection refused` → Firewall blocking
- `Connection timeout` → Network issue
- `SSL handshake failed` → Certificate issue
- `407 Proxy Authentication Required` → Proxy issue

### SSL/TLS Troubleshooting

**Check certificate:**

```bash
openssl s_client -connect your-n8n-host:443 -servername your-n8n-host
```

**Look for:**
```
Verify return code: 0 (ok)  # ✅ Valid certificate
Verify return code: 19 (self signed certificate)  # ⚠️ Self-signed
Verify return code: 10 (certificate has expired)  # ❌ Expired
```

**For development with self-signed certificates:**
```bash
# DEVELOPMENT ONLY - Disable SSL verification
NODE_TLS_REJECT_UNAUTHORIZED=0 DEBUG=true npm start
```

**⚠️ Never use in production!**

---

## Multi-Instance Debugging

### Instance Selection Logging

**Monitor instance routing:**

```bash
DEBUG=true npm start 2>&1 | grep "instance"
```

**Output:**
```
[ConfigLoader] Loaded 3 environments: production, staging, development
[MCP] Tool called: list_workflows (instance: production)
[EnvironmentManager] Resolving instance: production
[EnvironmentManager] Using cached API instance for: production
```

**Verify:**
- ✅ Correct instance selected
- ✅ Instance exists in configuration
- ✅ API instance cached for performance

### Environment Routing Traces

**Full routing flow:**

```
[MCP] Tool called: create_workflow
[MCP] Parameters: { instance: "staging", name: "Test Workflow", ... }
[EnvironmentManager] Resolving instance: staging
[EnvironmentManager] Instance found in configuration
[EnvironmentManager] Creating API instance for: staging
[EnvironmentManager] Base URL: https://staging.n8n.example.com/api/v1
[EnvironmentManager] API instance cached for: staging
[N8NApiWrapper] Calling create_workflow for instance: staging
```

### Configuration Per Instance

**Check instance-specific settings:**

```bash
DEBUG=true npm start
```

**Look for:**
```
[ConfigLoader] Environment: production
[ConfigLoader]   - Host: https://prod.n8n.example.com
[ConfigLoader]   - API Key: *** (redacted)

[ConfigLoader] Environment: staging
[ConfigLoader]   - Host: https://staging.n8n.example.com
[ConfigLoader]   - API Key: *** (redacted)
```

### API Instance Caching Logs

**Monitor cache effectiveness:**

```bash
DEBUG=true npm start 2>&1 | grep "API instance"
```

**Expected pattern:**
```
[EnvironmentManager] API instance created for: production  # First call
[EnvironmentManager] Using cached API instance for: production  # Subsequent
[EnvironmentManager] Using cached API instance for: production  # Subsequent
[EnvironmentManager] API instance created for: staging  # First for staging
[EnvironmentManager] Using cached API instance for: staging  # Subsequent
```

**Benefits:**
- ~100x faster subsequent calls
- Reduced connection overhead
- Better performance for repeated operations

---

## Advanced Debugging Techniques

### Logging to File

**Capture all debug logs:**

```bash
# All logs to file
DEBUG=true npm start 2> debug.log

# Monitor in real-time
tail -f debug.log
```

**Filter specific categories:**

```bash
# Only configuration logs
DEBUG=true npm start 2>&1 | grep "ConfigLoader"

# Only API calls
DEBUG=true npm start 2>&1 | grep "N8NApiWrapper"

# Only errors
DEBUG=true npm start 2>&1 | grep "ERROR"
```

### Verbose Curl Testing

**Test n8n API directly:**

```bash
# Verbose output
curl -v https://your-n8n-host/api/v1/workflows \
  -H "X-N8N-API-KEY: your_key" \
  2>&1 | tee curl-debug.log

# Analyze timing
curl -w "\nTime: %{time_total}s\n" \
  https://your-n8n-host/api/v1/workflows \
  -H "X-N8N-API-KEY: your_key"
```

### Node.js Debug Flags

**Advanced debugging:**

```bash
# Trace warnings
node --trace-warnings build/index.js

# Trace deprecations
node --trace-deprecation build/index.js

# Enable async stack traces
node --async-stack-traces build/index.js

# Combine with DEBUG
DEBUG=true node --trace-warnings build/index.js
```

### Memory Profiling

**Check for memory leaks:**

```bash
# Enable GC logging
node --expose-gc --trace-gc build/index.js

# Heap snapshot
node --inspect build/index.js
# Then use Chrome DevTools Memory profiler
```

---

## Debugging Checklists

### Quick Diagnostic Checklist

**When something isn't working:**

1. **Enable debug mode:**
   ```bash
   DEBUG=true npm start
   ```

2. **Check startup logs:**
   - [ ] Configuration loaded?
   - [ ] Correct environments?
   - [ ] Server started on expected port?

3. **Check instance routing:**
   - [ ] Correct instance selected?
   - [ ] Instance exists in configuration?
   - [ ] API instance cached?

4. **Check API calls:**
   - [ ] Correct URL constructed?
   - [ ] API key sent?
   - [ ] Response status 200/201?

5. **Check error messages:**
   - [ ] Error category identified?
   - [ ] Stack trace available?
   - [ ] n8n API error details?

### Performance Debugging Checklist

**When operations are slow:**

1. **Measure response times:**
   ```bash
   DEBUG=true npm start 2>&1 | grep "Response:"
   ```

2. **Check for:**
   - [ ] Slow API calls (> 2 seconds)
   - [ ] Network timeouts
   - [ ] Large data transfers
   - [ ] Missing pagination

3. **Optimize:**
   - [ ] Use pagination for lists
   - [ ] Fetch metadata before full data
   - [ ] Check n8n instance performance
   - [ ] Verify network connection

### Connection Debugging Checklist

**When can't connect to n8n:**

1. **Test n8n accessibility:**
   ```bash
   curl -I https://your-n8n-host
   ```

2. **Check:**
   - [ ] n8n instance running?
   - [ ] URL correct (no /api/v1 suffix)?
   - [ ] Firewall allowing connection?
   - [ ] VPN connected (if required)?

3. **Test API endpoint:**
   ```bash
   curl https://your-n8n-host/api/v1/workflows \
     -H "X-N8N-API-KEY: your_key"
   ```

4. **Verify:**
   - [ ] Returns 200 OK (not 401/404)
   - [ ] Returns workflow list JSON
   - [ ] No network errors

---

## Next Steps

**Still having issues?**

1. **Enable debug mode** and capture logs
2. **Review [Error Reference](error-reference.md)** for specific errors
3. **Check [FAQ](faq.md)** for common questions
4. **Test components** systematically
5. **Report issues** with debug logs

**Related Documentation:**
- [Error Reference](error-reference.md) - Specific error solutions
- [FAQ](faq.md) - Common questions
- [Testing Guide](testing.md) - Test infrastructure
- [Contributing](../about/contributing.md) - Report bugs

---

**Document Version:** 1.0
**Last Updated:** December 2025
**Related:** [Error Reference](error-reference.md), [FAQ](faq.md), [Testing](testing.md)
