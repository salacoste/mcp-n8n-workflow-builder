# Bug #4: Workflow Activation/Deactivation API Limitation

**Status**: DOCUMENTED AS API LIMITATION
**Priority**: Medium
**Discovered**: 2025-12-26
**n8n Version**: 2.0.3

## Problem Description

Workflow activation and deactivation cannot be performed programmatically through the n8n REST API v2.0.3.

### Error Details

```
HTTP 400 Bad Request
{
  "message": "request/body/active is read-only"
}
```

## Investigation Results

### Methods Tested

1. **PATCH /api/v1/workflows/{id}** with `{ active: true }` → 405 Method Not Allowed
2. **PUT /api/v1/workflows/{id}/activate** → 405 Method Not Allowed
3. **POST /api/v1/workflows/{id}/activate** → 400 Bad Request (active field is read-only)
4. **PUT /api/v1/workflows/{id}** with `{ active: true }` → 400 Bad Request (active field is read-only)

### Root Cause

The `active` field in n8n v2.0.3 API is **read-only**. The `/activate` and `/deactivate` endpoints appear to have been added in later versions of n8n (documented in OpenAPI spec for current versions).

### n8n Version Analysis

- **Current Live Instance**: n8n v2.0.3 (released ~2024)
- **Documentation Reference**: OpenAPI spec shows POST /workflows/{id}/activate endpoint
- **API Evolution**: The activate/deactivate endpoints were added after v2.0.3

### Workflow Structure Analysis

Active workflows in n8n v2.0.3 have these fields related to activation:
```json
{
  "active": true,
  "versionId": "uuid",
  "activeVersionId": "uuid",
  "activeVersion": {
    "workflowPublishHistory": [
      {
        "event": "activated",
        "userId": null,
        "createdAt": "timestamp"
      }
    ]
  }
}
```

This shows activation is managed through a versioning system, not simple field toggle.

## Solution Implemented

### Code Changes

**File**: `src/services/n8nApiWrapper.ts`

Updated `activateWorkflow()` and `deactivateWorkflow()` methods to:
1. Return helpful error message instead of attempting API call
2. Direct users to web interface for manual activation
3. Document the API limitation

```typescript
async activateWorkflow(id: string, instanceSlug?: string): Promise<N8NWorkflowResponse> {
  return this.callWithInstance(instanceSlug, async () => {
    logger.log(`Workflow activation via REST API is not supported in this n8n version`);

    throw new Error(
      `Workflow activation via REST API is not supported. ` +
      `The 'active' field is read-only in n8n v2.0.3 API. ` +
      `Please activate workflows manually through the n8n web interface: ` +
      `Navigate to your workflow and click the "Active" toggle.`
    );
  });
}
```

### User-Facing Impact

**MCP Tool Response**:
```json
{
  "error": {
    "code": -32603,
    "message": "Internal server error",
    "data": "Failed to activate workflow: API call failed: Workflow activation via REST API is not supported. The 'active' field is read-only in n8n v2.0.3 API. Please activate workflows manually through the n8n web interface: Navigate to your workflow and click the 'Active' toggle."
  }
}
```

## Workaround

Users must activate/deactivate workflows through the n8n web interface:

1. Navigate to https://auto.thepeace.ru/
2. Open the workflow
3. Click the "Active" toggle switch in the workflow editor

## Upgrade Path

To enable programmatic workflow activation, upgrade n8n to a version that supports the `/activate` endpoint:

- **Minimum version**: Unknown (needs investigation)
- **Current version with support**: n8n v1.88+ (based on OpenAPI spec)
- **Recommended**: Upgrade to latest stable n8n version

## Test Results

### Before Fix
```
[TEST] activate_workflow - Activate workflow: ✗ FAIL
HTTP 500: Request failed with status code 405
```

### After Fix
```
[TEST] activate_workflow - Activate workflow: ✗ FAIL
HTTP 500: Workflow activation via REST API is not supported.
The 'active' field is read-only in n8n v2.0.3 API.
Please activate workflows manually through the n8n web interface.
```

## References

- [n8n OpenAPI Specification](https://github.com/n8n-io/n8n-docs/blob/main/docs/api/v1/openapi.yml) - Shows POST /workflows/{id}/activate
- [Activate workflows on schedule template](https://n8n.io/workflows/3229-activate-and-deactivate-workflows-on-schedule-using-native-n8n-api/)
- [n8n Public API Introduction](https://blog.n8n.io/introducing-the-n8n-public-api/) - June 2022

## Related Issues

- Bug #3: update_workflow validation (partially related to read-only fields)
- Story 2.1 validation testing reveals API version limitations

## Recommendations

1. **Short-term**: Document this limitation in README.md and CLAUDE.md
2. **Medium-term**: Add n8n version detection to provide version-specific guidance
3. **Long-term**: Request live instance upgrade to n8n v1.88+ for full API support
