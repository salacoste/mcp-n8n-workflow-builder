# Multi-Instance Testing

Comprehensive testing guide for multi-instance configurations.

---

## Test Suite Overview

| Test Category | Tests | Duration |
|--------------|-------|----------|
| Configuration | 5 tests | 2-3 min |
| Routing | 6 tests | 3-4 min |
| Cross-Instance | 4 tests | 2-3 min |
| Performance | 3 tests | 2-3 min |

**Total:** 18 tests, 9-13 minutes

---

## Configuration Tests

### Test 1: Config File Loading

**Verify .config.json loads correctly:**

```bash
# Start server and check output
npx @kernel.salacoste/n8n-workflow-builder
```

**Expected Output:**
```
[MCP Server] Configuration loaded: 3 environment(s)
[MCP Server] Default environment: development
[MCP Server] Environments: production, staging, development
```

**Pass Criteria:**
- ✅ Correct environment count
- ✅ Default environment identified
- ✅ All environments listed

---

### Test 2: Instance Discovery

**Claude Desktop:**
```
What n8n instances do you have access to?
```

**Expected Response:**
```
I have access to 3 n8n environments:

1. production
   - Host: https://prod.n8n.example.com
   - Status: Connected

2. staging
   - Host: https://staging.n8n.example.com
   - Status: Connected

3. development (default)
   - Host: http://localhost:5678
   - Status: Connected
```

**Pass Criteria:**
- ✅ All instances listed
- ✅ Default marked correctly
- ✅ URLs correct

---

### Test 3: Default Instance Behavior

**Claude Desktop:**
```
List workflows
```

(No instance specified)

**Expected:**
- Uses `defaultEnv` from .config.json
- Returns workflows from default environment

**Verify:**
```
Which instance did you query?
```

Should respond with default environment name.

---

### Test 4: Invalid Instance Handling

**Claude Desktop:**
```
List workflows from nonexistent
```

**Expected Response:**
```
Error: Instance 'nonexistent' not found

Available instances:
- production
- staging
- development

Please use one of the available instance names.
```

---

### Test 5: Configuration Validation

**Test invalid .config.json:**

```bash
# Create invalid config
cat > .config.test.json << 'EOF'
{
  "environments": {
    "prod": {
      "n8n_host": "https://n8n.example.com"
      // Missing n8n_api_key
    }
  }
  // Missing defaultEnv
}
EOF
```

**Expected:** Server fails to start with clear error message

---

## Routing Tests

### Test 6: Production Routing

**Claude Desktop:**
```
List workflows from production
```

**Expected:**
- Routes to production instance
- Returns workflows from production
- No data leakage from other instances

**Verify:**
```bash
# Check MCP server debug logs
DEBUG=true npx @kernel.salacoste/n8n-workflow-builder

# Should show:
# [DEBUG] Routing to instance: production
# [DEBUG] API URL: https://prod.n8n.example.com/api/v1/workflows
```

---

### Test 7: Staging Routing

**Claude Desktop:**
```
Show executions from staging
```

**Expected:**
- Routes to staging instance
- Returns executions from staging only

---

### Test 8: Development Routing

**Claude Desktop:**
```
Create tag "multi-test" in development
```

**Expected:**
- Routes to development instance
- Tag created in development only
- Not visible in production or staging

---

### Test 9: Rapid Instance Switching

**Claude Desktop:**
```
1. List workflows from production
2. List workflows from staging
3. List workflows from development
4. List workflows from production again
```

**Expected:**
- Each request routes correctly
- No cross-contamination
- Performance consistent (caching works)

---

### Test 10: All Tools Multi-Instance

Test each tool category:

```
Workflows: create_workflow({ instance: "staging" })
Executions: list_executions({ instance: "production" })
Tags: create_tag({ instance: "development" })
Credentials: get_credential_schema({ instance: "staging" })
```

**Expected:** All tools respect instance parameter

---

### Test 11: Resources Multi-Instance

**Access resources:**
```
n8n://workflows?instance=production
n8n://execution-stats?instance=staging
```

**Expected:** Returns data from specified instance

---

## Cross-Instance Tests

### Test 12: Workflow Cloning

**Clone from dev to staging:**

```
1. Get workflow from development
2. Create copy in staging
3. Verify exists in staging
4. Verify original unchanged in development
```

**Commands:**
```
Get workflow 5 from development
Create that workflow in staging
List workflows from staging (should include new workflow)
List workflows from development (should still have original)
```

---

### Test 13: Tag Synchronization

**Create same tag across instances:**

```
Create tag "production-ready" in production
Create tag "production-ready" in staging
Create tag "production-ready" in development
```

**Expected:**
- 3 separate tags created
- Each with unique ID per instance
- Same name, different instances

---

### Test 14: Execution Comparison

**Compare execution stats:**

```
Show execution stats from production
Show execution stats from staging
```

**Expected:**
- Different counts per instance
- No data mixing
- Correct attribution

---

## Performance Tests

### Test 15: Connection Pool Efficiency

**Measure routing speed:**

```bash
# Test script
for i in {1..10}; do
  echo "Request $i to production"
  # Make request
done
```

**Expected:**
- First request: ~300ms
- Subsequent: ~200ms (cached)
- No memory leaks

---

### Test 16: Concurrent Requests

**Multiple instances simultaneously:**

```
1. List production workflows
2. List staging executions
3. List development tags
(all at same time)
```

**Expected:**
- All complete successfully
- Correct routing for each
- No conflicts

---

### Test 17: Large Configuration

**Test with many instances:**

```json
{
  "environments": {
    "prod1": {...},
    "prod2": {...},
    "staging1": {...},
    "staging2": {...},
    "dev1": {...},
    "dev2": {...}
    // 6+ instances
  }
}
```

**Expected:**
- Loads successfully
- Routes correctly
- Performance acceptable

---

## Automated Testing

### Run Test Suite

```bash
# Run comprehensive tests
node test-mcp-tools.js

# With multi-instance config
cp .config.json .config.test.json
NODE_ENV=test node test-mcp-tools.js
```

**Expected Results:**
```
✅ Configuration Tests: 5/5 passed
✅ Routing Tests: 6/6 passed
✅ Cross-Instance Tests: 4/4 passed
✅ Performance Tests: 3/3 passed
✅ Total: 18/18 tests passed
```

---

## Troubleshooting

### Test Failures

**Configuration not loading:**
- Check JSON syntax
- Verify file location (project root)
- Check file permissions

**Routing to wrong instance:**
- Verify instance names match config
- Check defaultEnv setting
- Clear and restart

**Performance degradation:**
- Check network latency
- Verify connection pooling
- Review debug logs

---

## Test Results Template

```markdown
## Multi-Instance Test Results

**Date:** YYYY-MM-DD
**Version:** 0.9.1
**Configuration:** 3 instances (production, staging, development)

### Configuration Tests
- [✅] Config file loading
- [✅] Instance discovery
- [✅] Default instance
- [✅] Invalid instance handling
- [✅] Validation

### Routing Tests
- [✅] Production routing
- [✅] Staging routing
- [✅] Development routing
- [✅] Rapid switching
- [✅] All tools support
- [✅] Resources routing

### Cross-Instance Tests
- [✅] Workflow cloning
- [✅] Tag synchronization
- [✅] Execution comparison
- [✅] Data isolation

### Performance Tests
- [✅] Connection pooling
- [✅] Concurrent requests
- [✅] Large configuration

**Result:** ✅ All tests passed
**Performance:** Average 200ms per request (with caching)
```

---

## Next Steps

- [Examples](examples.md) - Real-world multi-instance usage
- [Configuration](configuration.md) - Setup guide
- [Environment Manager](environment-manager.md) - Architecture

---

!!! success "Testing Complete"
    If all tests pass, your multi-instance setup is working correctly!
