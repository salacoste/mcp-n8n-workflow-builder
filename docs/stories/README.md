# Stories Directory

This directory contains detailed user stories for implementation. Each story is derived from an epic and provides comprehensive implementation details.

## Epic 1: URL Configuration Fix

**Epic Document:** [../epic-1-url-configuration-fix.md](../epic-1-url-configuration-fix.md)

**Goal:** Fix URL configuration handling to eliminate duplicate `/api/v1` path segments and align documentation with official n8n API standards.

### Stories

#### Story 1.1: URL Normalization Implementation
**File:** [1.1.url-normalization-implementation.md](./1.1.url-normalization-implementation.md)
**Status:** Draft
**Type:** Code Implementation
**Complexity:** Medium

**Objective:** Add intelligent URL normalization to `EnvironmentManager.getApiInstance()` to handle both old and new URL formats seamlessly.

**Key Deliverables:**
- Updated `src/services/environmentManager.ts` with 3-step URL normalization
- Inline documentation explaining normalization logic
- Debug logging for transparency
- Full backward compatibility

---

#### Story 1.2: Documentation Updates
**File:** [1.2.documentation-updates.md](./1.2.documentation-updates.md)
**Status:** Draft
**Type:** Documentation
**Complexity:** Medium
**Depends On:** Story 1.1

**Objective:** Update all project documentation to reflect correct URL format per official n8n API documentation.

**Key Deliverables:**
- Updated README.md with corrected examples and new sections
- Updated CLAUDE.md integration guide
- Updated all examples/ configuration files
- New "Configuration Best Practices" section
- Migration guide for existing users
- Updated CHANGELOG.md

---

## Story Structure

Each story file follows the BMAD framework structure:

### Required Sections
- **Status:** Draft | Approved | InProgress | Review | Done
- **Story:** User story in "As a... I want... so that..." format
- **Acceptance Criteria:** Numbered list of testable requirements
- **Tasks / Subtasks:** Hierarchical task breakdown with checkboxes
- **Dev Notes:** Technical context and implementation details
- **Change Log:** Document version history
- **Dev Agent Record:** Implementation tracking (filled by dev agent)
- **QA Results:** QA validation (filled by QA agent)

### Dev Notes Subsections
- **Relevant Source Tree:** Files to modify and dependencies
- **Current Implementation:** Code that needs changing
- **Proposed Implementation:** Detailed solution with code examples
- **Key Implementation Points:** Critical technical considerations
- **Testing:** Test approach and edge cases
- **Testing Standards:** Framework, coverage requirements

## Implementation Workflow

1. **Review Epic:** Understand overall goal and context
2. **Read Story 1.1:** Understand code changes required
3. **Implement Story 1.1:** Make code changes, run tests
4. **Update Story 1.1:** Mark tasks complete, fill Dev Agent Record
5. **Read Story 1.2:** Understand documentation updates
6. **Implement Story 1.2:** Update all documentation files
7. **Update Story 1.2:** Mark tasks complete, fill Dev Agent Record
8. **QA Review:** Both stories reviewed and validated
9. **Epic Complete:** All stories Done, epic Definition of Done met

## Quick Reference

### Story 1.1 Files to Modify
- `src/services/environmentManager.ts` (primary)

### Story 1.2 Files to Modify
- `README.md`
- `CLAUDE.md`
- `CHANGELOG.md`
- `examples/setup_with_claude.md`
- `examples/workflow_examples.md`
- `examples/complex_workflow.md`
- `examples/using_prompts.md`
- `docs/multi-instance-architecture.md` (check)

## Development Notes

### URL Format Reference

**Correct (without /api/v1):**
```json
{
  "n8n_host": "https://n8n.example.com"
}
```

**Incorrect (with /api/v1):**
```json
{
  "n8n_host": "https://n8n.example.com/api/v1/"
}
```

**Note:** Story 1.1 makes BOTH formats work correctly through automatic normalization.

### Testing Strategy

1. **Unit Tests:** URL normalization logic with all edge cases
2. **Integration Tests:** Full workflow with ConfigLoader and API calls
3. **Manual Tests:** Test with real n8n instance using both URL formats
4. **Documentation Tests:** Verify all examples are correct and consistent

### Success Metrics

- ✅ All 8 URL edge cases handled correctly
- ✅ Backward compatibility maintained (no breaking changes)
- ✅ All documentation examples corrected
- ✅ API calls succeed with both old and new URL formats
- ✅ Debug logging provides transparency
- ✅ Code is well-documented with inline comments
