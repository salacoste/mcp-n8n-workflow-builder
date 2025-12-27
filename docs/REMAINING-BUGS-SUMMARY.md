# Remaining Bugs - Quick Reference

**Last Updated:** 2025-12-26
**Current Test Coverage:** 77% (17/22 tests passing)
**Bugs Remaining:** 3 of 6

---

## Bug #5: delete_workflow Verification ❌ HIGH PRIORITY

**Status:** OPEN
**Impact:** 2 tests failing (0/2 passing in delete category)
**Priority:** HIGH - Critical functionality not working

### Symptoms
```
[TEST] delete_workflow - Delete and verify: ✗ FAIL - Workflow still exists after deletion
[TEST] delete_workflow - 404 for non-existent ID: ✗ FAIL - Should have thrown error
```

### Quick Investigation Steps
1. Check if API call actually deletes workflow:
   ```bash
   # Test manually
   curl -X DELETE 'https://auto.thepeace.ru/api/v1/workflows/{id}' \
     -H 'X-N8N-API-KEY: your_key'

   # Verify deletion
   curl 'https://auto.thepeace.ru/api/v1/workflows/{id}' \
     -H 'X-N8N-API-KEY: your_key'
   ```

2. Check timing - might need delay before verification
3. Review deleteWorkflow implementation

### Files to Check
- `src/services/n8nApiWrapper.ts` - deleteWorkflow method
- `test-workflows-validation.js` - Test expectations and timing
- `src/index.ts` - delete_workflow tool handler

### Likely Causes
1. **Timing issue:** Immediate get after delete returns stale data
2. **API issue:** Delete succeeds but returns workflow in response
3. **Test logic:** Verification checking wrong thing
4. **Cache issue:** Instance cache not updated after delete

### Quick Fix Strategy
1. Add small delay (100-500ms) before verification
2. Check API response - delete might return deleted workflow
3. Update test to check HTTP status or error instead of get

**Estimated Time:** 2-4 hours

---

## Bug #3: update_workflow Name Update ⚠️ MEDIUM PRIORITY

**Status:** OPEN
**Impact:** 1 test failing (1/2 passing - 50% in update category)
**Priority:** MEDIUM - Partial functionality working

### Symptoms
```
[TEST] update_workflow - Update name: ✗ FAIL - Name update failed
```

### Partial Fix Applied
- ✅ Schema changed to require only `id` (not `['id', 'name', 'nodes']`)
- ✅ Made nodes/connections optional in handler
- ⚠️ Still failing - needs more investigation

### Quick Investigation Steps
1. Check what payload is being sent to API
2. Verify API response
3. Test with minimal update (name only)
4. Review n8n API docs for required fields

### Files to Check
- `src/index.ts` - update_workflow handler (lines 808-822)
- `src/services/n8nApiWrapper.ts` - updateWorkflow method
- `test-workflows-validation.js` - Test setup and expectations

### Current Implementation
```typescript
// In src/index.ts around line 808
const updateInput: WorkflowInput = {
  name: args.name,
  nodes: updateNodes as any[],
  connections: []
};
```

### Likely Causes
1. **Missing fields:** API might require nodes even for name-only update
2. **Wrong method:** Using POST instead of PUT/PATCH
3. **ID handling:** ID might need to be in body or only in URL
4. **Validation:** Server-side validation rejecting update

### Quick Fix Strategy
1. Test with full workflow update (name + nodes)
2. Check if PATCH vs PUT makes difference
3. Try including all original fields in update

**Estimated Time:** 1-3 hours

---

## Bug #6: 404 Error Handling ⚠️ LOW PRIORITY

**Status:** OPEN
**Impact:** 3 tests failing across multiple methods
**Priority:** LOW - Test infrastructure issue, not functionality issue

### Affected Tests
```
[TEST] get_workflow - 404 for non-existent ID: ✗ FAIL
[TEST] delete_workflow - 404 for non-existent ID: ✗ FAIL
[TEST] execute_workflow - 404 for non-existent ID: ✗ FAIL
```

### Quick Investigation Steps
1. Test manually what n8n returns for non-existent IDs:
   ```bash
   curl 'https://auto.thepeace.ru/api/v1/workflows/non-existent-12345' \
     -H 'X-N8N-API-KEY: your_key' \
     -v  # verbose to see status code
   ```

2. Check if error is being caught or propagated
3. Review error format in test expectations

### Likely Causes
1. **Different status code:** n8n might return 400 instead of 404
2. **Error format:** Error message format might be different than expected
3. **Error propagation:** Error not propagating through MCP layer correctly
4. **Test expectations:** Tests checking for wrong error format

### Files to Check
- `src/services/n8nApiWrapper.ts` - Error handling in callWithInstance
- `src/index.ts` - Error propagation in tool handlers
- `test-workflows-validation.js` - Error expectations in tests

### Quick Fix Strategy
1. Log actual error to see format
2. Update test expectations to match actual error
3. Or fix error propagation if errors are being swallowed

**Estimated Time:** 2-3 hours

---

## Bug Fix Priority Order

### Option A: By Priority
1. Bug #5 (HIGH) - delete_workflow
2. Bug #3 (MEDIUM) - update_workflow
3. Bug #6 (LOW) - 404 handling

### Option B: By Quick Wins
1. Bug #6 (easiest) - Likely just test expectations
2. Bug #3 (medium) - Partial fix already done
3. Bug #5 (hardest) - May need timing or API changes

### Recommendation
**Go with Option A** - Fix critical functionality first (delete), then less critical issues.

Bug #5 blocks workflow lifecycle testing completely. Bug #3 and #6 are less critical.

---

## Testing After Each Fix

```bash
# Build and restart server
npm run build
pkill -f "node.*build/index.js"
npm start &

# Wait for server startup
sleep 2

# Run tests
node test-workflows-validation.js

# Check specific category
# Edit test file to run only testDeleteWorkflow(), etc.
```

---

## Success Criteria

### Bug #5 Fixed When:
- [ ] delete_workflow - Delete and verify: ✓ PASS
- [ ] delete_workflow - 404 for non-existent ID: ✓ PASS
- [ ] delete category: 2/2 (100%)

### Bug #3 Fixed When:
- [ ] update_workflow - Update name: ✓ PASS
- [ ] update category: 2/2 (100%)

### Bug #6 Fixed When:
- [ ] get_workflow - 404 for non-existent ID: ✓ PASS
- [ ] delete_workflow - 404 for non-existent ID: ✓ PASS
- [ ] execute_workflow - 404 for non-existent ID: ✓ PASS
- [ ] All 404 tests: 3/3 (100%)

### Story 2.1 Complete When:
- [ ] All bugs fixed (6/6)
- [ ] All tests passing (22/22 - 100%)
- [ ] Final validation report created

---

## Quick Reference Links

**Documentation:**
- [Full Bug Documentation](./bugs/story-2.1-validation-bugs.md)
- [Handoff Report](./STORY-2.1-HANDOFF-REPORT.md)
- [Bug #4 Resolution](./STORY-2.1-BUG-4-RESOLUTION.md)
- [Story Tracking](./stories/2.1.validate-workflows-api.md)

**Code:**
- [Test Suite](../test-workflows-validation.js)
- [MCP Tools](../src/index.ts)
- [API Wrapper](../src/services/n8nApiWrapper.ts)
- [Validation](../src/utils/validation.ts)

**Testing:**
- [Testing Guide](../VALIDATION-TESTING.md)
- [Activation Test](../test-activate-methods.js)
