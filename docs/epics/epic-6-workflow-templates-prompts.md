# Epic 6: Workflow Templates & Prompts System - GitHub Pages Documentation

<!-- Powered by BMAD™ Core -->

## Epic Goal

Create comprehensive documentation for the MCP Prompts system and workflow templates, enabling users to rapidly create common workflow patterns through natural language interactions and understand template customization, variable substitution, and best practices for template-based workflow development.

## Epic Description

### Existing System Context

**Current Relevant Functionality:**
- MCP Prompts system with 5 predefined workflow templates
- Template variable substitution with validation
- Natural language workflow creation through Claude Desktop
- PromptsService implementing template management
- ListPromptsRequestSchema for prompt discovery
- Integration with workflow creation tools

**Available Templates:**
1. **Schedule Triggered Workflow** - Cron-based automation
2. **HTTP Webhook Workflow** - HTTP endpoint responder
3. **Data Transformation Workflow** - Data processing pipeline
4. **External Service Integration** - API integration workflows
5. **API Data Polling Workflow** - Interval-based API polling

**Technology Stack:**
- TypeScript template definitions in promptsService.ts
- MCP Prompts protocol for template delivery
- Variable substitution system
- n8n node type compatibility
- Claude Desktop natural language interface

**Integration Points:**
- src/services/promptsService.ts - Template definitions (lines 1-500+)
- src/index.ts - Prompts handler (ListPromptsRequestSchema)
- examples/using_prompts.md - Usage guide
- README.md - Prompts overview (lines 493-515)

### Enhancement Details

**Current Situation:**

**✅ Existing Implementation:**
- 5 fully implemented workflow templates
- Complete variable system with defaults and validation
- Natural language variable specification
- Template-to-workflow conversion
- Integration with create_workflow tool

**📋 Current Documentation:**
- README.md lists available prompts (lines 493-515)
- examples/using_prompts.md provides basic usage guide
- Template variables documented per prompt
- Basic customization examples

**⚠️ Current Gaps for GitHub Pages:**
- Template internals not explained
- Variable substitution mechanics not documented
- No advanced customization guide
- Missing template creation guide for contributors
- No template best practices
- Limited examples for each template
- No troubleshooting for template issues
- Template vs manual workflow creation comparison missing

**What's Being Added/Changed:**

1. **Prompts System Overview (Story 6.1):**
   - MCP Prompts protocol explanation
   - How templates work with Claude Desktop
   - Variable substitution system
   - Template discovery and selection
   - Benefits over manual workflow creation
   - Use cases for template-based development
   - Integration with MCP tools

2. **Workflow Template Reference (Story 6.2):**
   - Complete documentation for all 5 templates
   - Template structure and node composition
   - Variable specifications with types and validation
   - Default values and customization options
   - Example workflows for each template
   - Use cases and best practices per template
   - Trigger node compatibility notes

3. **Template Variables & Customization (Story 6.3):**
   - Variable system architecture
   - Variable types (string, number, boolean, json)
   - Required vs optional variables
   - Default value handling
   - Variable validation rules
   - Nested variable support
   - Customization patterns
   - Advanced variable techniques

4. **Creating Custom Templates (Story 6.4):**
   - Template creation guide for contributors
   - Template structure and schema
   - Node configuration patterns
   - Connection definition format
   - Variable definition best practices
   - Testing custom templates
   - Contributing templates to project

5. **Template Best Practices (Story 6.5):**
   - When to use templates vs manual creation
   - Template selection guide
   - Customization strategies
   - Combining templates
   - Template-based workflow evolution
   - Performance considerations
   - Maintenance and versioning

**How It Integrates:**

- Builds on Epic 3 (installation) and Epic 4 (tools)
- Templates use create_workflow tool from Epic 4
- Natural language interface through Claude Desktop
- Links to Epic 8 (troubleshooting template issues)
- Complements manual workflow creation
- Enables rapid prototyping and development

**Success Criteria:**

1. ✅ All 5 templates documented with complete specifications
2. ✅ Variable system clearly explained
3. ✅ Template customization patterns illustrated
4. ✅ Custom template creation guide enables contributions
5. ✅ Best practices help users choose appropriate templates
6. ✅ Examples demonstrate each template's capabilities
7. ✅ Troubleshooting guide for common template issues
8. ✅ Comparison with manual workflow creation clarifies when to use templates

## Stories

This epic consists of 5 user stories organized by template system concepts:

### Phase 1: System Overview (Story 6.1)

#### Story 6.1: Prompts System Overview
**📄 File:** `docs/stories/6.1.prompts-system-overview.md`

**Description:** Comprehensive overview of the MCP Prompts system, explaining how it works, its benefits, and integration with Claude Desktop.

**User Story:**
> As a developer new to the prompts system, I want to understand how workflow templates work and their benefits, so that I can decide when to use templates vs manual workflow creation.

**Scope:**
- **MCP Prompts Protocol:**
  - What MCP Prompts are and how they work
  - Protocol specification (ListPromptsRequestSchema)
  - Prompt discovery mechanism
  - Prompt delivery to Claude Desktop
  - Template vs tool distinction

- **How Templates Work:**
  - Template structure (nodes, connections, variables)
  - Variable substitution process
  - Natural language variable specification through Claude
  - Template-to-workflow conversion
  - Integration with create_workflow tool
  - Workflow creation flow

- **Benefits of Template-Based Development:**
  - Rapid workflow creation (minutes vs hours)
  - Consistency across similar workflows
  - Best practices built-in
  - Reduced errors from manual configuration
  - Learning tool for n8n patterns
  - Starting point for customization

- **Use Cases:**
  - Prototyping workflows quickly
  - Creating similar workflows repeatedly
  - Learning n8n node patterns
  - Standardizing workflow structures
  - Quick testing and experimentation
  - Team collaboration with shared templates

- **Integration with Claude Desktop:**
  - How to access prompts in Claude
  - Natural language template selection
  - Variable specification conversation
  - Template customization requests
  - Workflow creation from templates

- **Template vs Manual Comparison:**
  - When to use templates (simple, standard patterns)
  - When to create manually (complex, unique workflows)
  - Hybrid approach (template + customization)
  - Evolution from template to custom workflow

**Key Acceptance Criteria:**
1. MCP Prompts protocol clearly explained
2. Template workflow illustrated step-by-step
3. Benefits articulated with examples
4. Use cases demonstrated
5. Claude Desktop integration documented
6. Template vs manual comparison provided
7. Visual diagrams for template flow
8. Links to template reference (Story 6.2)

**Estimated Complexity:** Low
**Dependencies:** None
**Blocking:** Stories 6.2-6.5 (foundational understanding)

---

### Phase 2: Template Reference (Story 6.2)

#### Story 6.2: Workflow Template Reference (5 templates)
**📄 File:** `docs/stories/6.2.workflow-template-reference.md`

**Description:** Complete reference documentation for all 5 workflow templates with structure, variables, examples, and use cases.

**User Story:**
> As a user creating workflows from templates, I want detailed documentation for each available template, so that I can understand what each template does, what variables I can customize, and how to use them effectively.

**Scope:**

- **Template 1: Schedule Triggered Workflow**
  - **Purpose:** Cron-based automation
  - **Nodes:** scheduleTrigger (cron), Code Script
  - **Variables:**
    - workflow_name (string, required) - Default: "Scheduled Workflow"
    - schedule_expression (string, required) - Default: "*/5 * * * *" (every 5 min)
    - workflow_message (string, optional) - Default: "Scheduled execution triggered"
  - **Use Cases:** Daily reports, periodic data sync, scheduled notifications
  - **Examples:**
    - Daily report at 9 AM
    - Hourly data backup
    - Weekly cleanup task
  - **Customization:** Adding data processing nodes, external service calls
  - **Best Practices:** Cron expression validation, timezone considerations

- **Template 2: HTTP Webhook Workflow**
  - **Purpose:** HTTP endpoint responder
  - **Nodes:** Webhook (POST), Process Data (Code)
  - **Variables:**
    - workflow_name (string, required) - Default: "Webhook Workflow"
    - webhook_path (string, required) - Default: "my-webhook"
    - response_message (string, optional) - Default: "Webhook processed successfully"
  - **Use Cases:** API endpoints, webhook receivers, form submissions
  - **Examples:**
    - Payment notification handler
    - Form submission processor
    - External system integration
  - **Customization:** Authentication, complex data processing
  - **Best Practices:** Security considerations, error handling

- **Template 3: Data Transformation Workflow**
  - **Purpose:** Data processing pipeline
  - **Nodes:** Manual Trigger, Input Data (Set), Transform (Code), Output (Set)
  - **Variables:**
    - workflow_name (string, required) - Default: "Data Transformation"
    - sample_data (json, optional) - Default: sample JSON object
    - transformation_message (string, optional)
  - **Use Cases:** Data migration, ETL processes, format conversion
  - **Examples:**
    - CSV to JSON conversion
    - Data enrichment pipeline
    - Format normalization
  - **Customization:** Complex transformations, multiple steps
  - **Best Practices:** Data validation, error handling

- **Template 4: External Service Integration**
  - **Purpose:** API integration workflows
  - **Nodes:** Manual Trigger, HTTP Request, Process Response
  - **Variables:**
    - workflow_name (string, required) - Default: "Service Integration"
    - api_url (string, required)
    - service_name (string, optional)
  - **Use Cases:** Third-party API integration, data synchronization
  - **Examples:**
    - Slack notification sender
    - GitHub issue creator
    - Database sync
  - **Customization:** Authentication, error handling, retries
  - **Best Practices:** API rate limiting, error handling

- **Template 5: API Data Polling Workflow**
  - **Purpose:** Interval-based API polling with filtering
  - **Nodes:** scheduleTrigger, HTTP Request, Filter, Process
  - **Variables:**
    - workflow_name (string, required) - Default: "API Polling"
    - poll_interval (string, required) - Default: "*/10 * * * *" (every 10 min)
    - api_endpoint (string, required)
    - filter_condition (string, optional)
  - **Use Cases:** Monitoring APIs, data collection, status checking
  - **Examples:**
    - Status monitor
    - New data detector
    - Change tracker
  - **Customization:** Complex filtering, multiple endpoints
  - **Best Practices:** Rate limiting, data deduplication

**Common Documentation per Template:**
- Complete node configuration
- Connection diagram
- Variable reference table
- Usage examples (minimum 3 per template)
- Customization guide
- Best practices
- Common issues and solutions
- Links to relevant n8n node documentation

**Key Acceptance Criteria:**
1. All 5 templates documented completely
2. Node configurations specified in detail
3. All variables documented with types and defaults
4. Minimum 3 examples per template
5. Use cases clearly articulated
6. Customization guidance provided
7. Best practices included
8. Visual diagrams for each template structure

**Estimated Complexity:** High
**Dependencies:** Story 6.1 (prompts system overview)
**Blocking:** Story 6.3 (variable customization builds on template knowledge)

---

### Phase 3: Customization & Creation (Stories 6.3-6.4)

#### Story 6.3: Template Variables & Customization Guide
**📄 File:** `docs/stories/6.3.template-variables-customization.md`

**Description:** Deep dive into the variable system with customization patterns, validation, and advanced techniques.

**User Story:**
> As a user customizing workflow templates, I want to understand the variable system in depth, so that I can effectively customize templates to meet my specific needs.

**Scope:**
- **Variable System Architecture:**
  - Variable definition structure
  - Variable types (string, number, boolean, json)
  - Required vs optional variables
  - Default value mechanism
  - Variable validation system

- **Variable Types:**
  - **String variables:** Text values, patterns, validation
  - **Number variables:** Numeric values, ranges, validation
  - **Boolean variables:** True/false flags
  - **JSON variables:** Complex objects, schema validation
  - **Array variables:** Lists and collections (if supported)

- **Variable Substitution:**
  - How substitution works in templates
  - Substitution syntax: `{variable_name}`
  - Nested substitution (if supported)
  - Conditional substitution (if supported)
  - Escaping and special characters

- **Validation Rules:**
  - Required field validation
  - Type validation
  - Format validation (regex patterns)
  - Range validation (min/max)
  - Custom validation logic

- **Customization Patterns:**
  - Basic customization (changing names, values)
  - Moderate customization (adding nodes)
  - Advanced customization (restructuring workflow)
  - Template combination techniques
  - Progressive enhancement from template

- **Natural Language Variable Specification:**
  - How Claude interprets variable requests
  - Specifying variables conversationally
  - Default value acceptance
  - Variable value validation through conversation
  - Correcting variable values

- **Advanced Techniques:**
  - Dynamic variable values
  - Computed variables (if supported)
  - Environment-specific variables
  - Variable templates and reuse

**Key Acceptance Criteria:**
1. Variable system architecture documented
2. All variable types explained with examples
3. Substitution mechanism detailed
4. Validation rules comprehensive
5. Customization patterns illustrated (basic → advanced)
6. Natural language specification explained
7. Advanced techniques documented
8. Code examples for all patterns

**Estimated Complexity:** Medium
**Dependencies:** Story 6.2 (template knowledge)
**Blocking:** None

---

#### Story 6.4: Creating Custom Templates (Contributor Guide)
**📄 File:** `docs/stories/6.4.creating-custom-templates.md`

**Description:** Guide for contributors to create and contribute new workflow templates to the project.

**User Story:**
> As a contributor, I want a guide for creating custom workflow templates, so that I can add new templates to the project and share useful patterns with the community.

**Scope:**
- **Template Creation Process:**
  - Identifying template-worthy patterns
  - Designing template structure
  - Defining nodes and connections
  - Creating variable definitions
  - Testing template functionality
  - Documentation requirements

- **Template Structure:**
  - Prompt object schema
  - id, name, description fields
  - template object structure
  - nodes array configuration
  - connections array format
  - variables array specification

- **Node Configuration:**
  - Node structure and properties
  - Node type selection
  - Parameter configuration
  - Position and metadata
  - Node naming conventions

- **Connection Definition:**
  - Source and target specification
  - Connection types (main, ai, other)
  - Multiple connections
  - Connection validation

- **Variable Definition Best Practices:**
  - Variable naming conventions
  - Description clarity
  - Default value selection
  - Required vs optional decisions
  - Validation rule design
  - User experience considerations

- **Testing Custom Templates:**
  - Manual testing procedure
  - Variable substitution verification
  - Workflow creation testing
  - Activation and execution testing
  - Edge case testing
  - Documentation verification

- **Adding Template to PromptsService:**
  - Code structure in promptsService.ts
  - Constant definition (PROMPT_IDS)
  - Prompt object creation
  - Export and registration
  - Integration with getAvailablePrompts()

- **Contributing to Project:**
  - Fork and branch workflow
  - Code style guidelines
  - Testing requirements
  - Documentation requirements
  - Pull request process
  - Review criteria

**Key Acceptance Criteria:**
1. Template creation process documented step-by-step
2. Template structure schema provided
3. Node and connection configuration explained
4. Variable definition best practices clear
5. Testing procedures comprehensive
6. Code integration guide complete
7. Contribution workflow documented
8. Examples of template addition provided

**Estimated Complexity:** Medium
**Dependencies:** Stories 6.2, 6.3 (template and variable knowledge)
**Blocking:** None

---

### Phase 4: Best Practices (Story 6.5)

#### Story 6.5: Template Best Practices & Patterns
**📄 File:** `docs/stories/6.5.template-best-practices.md`

**Description:** Comprehensive guide to best practices for using, customizing, and evolving workflows from templates.

**User Story:**
> As a user working with workflow templates, I want best practices and patterns, so that I can use templates effectively and evolve them into production-ready workflows.

**Scope:**
- **Template Selection Guide:**
  - Decision tree for template selection
  - Use case to template mapping
  - When to use which template
  - When to combine templates
  - When to create manually instead

- **Customization Strategies:**
  - Start simple, iterate strategy
  - Minimal viable customization
  - Progressive enhancement approach
  - Testing after each customization
  - Documentation of changes

- **Template Combination Patterns:**
  - Using multiple templates in one workflow (if applicable)
  - Merging template patterns
  - Hybrid template-manual approach
  - Orchestration patterns

- **Template-Based Workflow Evolution:**
  - Phase 1: Use template as-is
  - Phase 2: Basic customization (variables)
  - Phase 3: Add nodes and connections
  - Phase 4: Restructure workflow
  - Phase 5: Template becomes reference only
  - Version control throughout evolution

- **Performance Considerations:**
  - Template overhead (minimal in this case)
  - Generated workflow performance
  - Optimization after template creation
  - Scaling considerations

- **Maintenance and Versioning:**
  - Tracking template origin
  - Documenting customizations
  - Version control best practices
  - Updating when templates change
  - Migration strategies

- **Team Collaboration:**
  - Shared template libraries
  - Template documentation standards
  - Template review processes
  - Template reuse metrics
  - Knowledge sharing

- **Common Anti-Patterns:**
  - Over-customizing templates (should create manually)
  - Under-utilizing variables (hardcoding values)
  - Ignoring template best practices
  - Not testing after customization
  - Poor documentation of changes

**Key Acceptance Criteria:**
1. Template selection guide clear and actionable
2. Customization strategies progressive and practical
3. Combination patterns illustrated with examples
4. Evolution pathway documented
5. Performance considerations addressed
6. Maintenance practices comprehensive
7. Team collaboration patterns provided
8. Anti-patterns identified with corrections

**Estimated Complexity:** Low
**Dependencies:** Stories 6.1-6.4 (all template concepts)
**Blocking:** None

---

## Story Implementation Order

**Phase 1 (System Overview) - Story 6.1:**
- MUST be completed first
- Provides foundational understanding
- Required context for all subsequent stories

**Phase 2 (Template Reference) - Story 6.2:**
- Follows Story 6.1
- Foundational for customization and creation
- Largest documentation effort

**Phase 3 (Customization & Creation) - Stories 6.3, 6.4:**
- Can be executed in parallel
- Both depend on Story 6.2
- Story 6.3 (user-focused), Story 6.4 (contributor-focused)

**Phase 4 (Best Practices) - Story 6.5:**
- MUST follow all previous stories
- Synthesizes knowledge from all areas
- Provides practical guidance

## Compatibility Requirements

- [x] Documentation matches v0.9.1 implementation
- [x] All templates from promptsService.ts documented
- [x] Variable system accurately described
- [x] n8n node compatibility notes included
- [x] Integration with create_workflow tool explained
- [x] Claude Desktop interaction patterns documented
- [x] Cross-references to Epic 4 (tools) functional
- [x] Links to Epic 8 (troubleshooting) for template issues

## Risk Mitigation

**Primary Risk:** Templates become outdated as n8n evolves

**Mitigation:**
- Version compatibility notes in each template
- Regular testing against latest n8n versions
- Deprecation notices for outdated templates
- Update process documented
- Community contribution for new templates

**Secondary Risk:** Users misunderstand template limitations

**Mitigation:**
- Clear scope for each template
- Explicit limitations documented
- When to use manual creation guidance
- Customization boundaries explained
- Links to manual workflow creation

**Rollback Plan:**
- Documentation changes are non-breaking
- Templates remain functional in code
- Users can reference examples/ directory
- Version history maintained

## Definition of Done

- [ ] All 5 stories completed with acceptance criteria met
- [ ] All 5 templates documented completely
- [ ] Variable system comprehensively explained
- [ ] Customization patterns illustrated
- [ ] Custom template creation guide enables contributions
- [ ] Best practices actionable and practical
- [ ] Minimum 3 examples per template
- [ ] Cross-references to other epics functional
- [ ] GitHub Pages navigation structure implemented
- [ ] Visual aids (diagrams, flowcharts) included
- [ ] Code examples tested against v0.9.1
- [ ] Mobile-responsive content verified

### Testing Checklist

**Prerequisites:**
- [ ] n8n instance available (self-hosted or cloud)
- [ ] Claude Desktop configured with MCP server
- [ ] All 5 templates accessible
- [ ] v0.9.1 MCP server running

**Template Testing:**
- [ ] Each template creates valid workflow
- [ ] Variable substitution working correctly
- [ ] Default values applied properly
- [ ] Required validation enforced
- [ ] Generated workflows activate successfully
- [ ] Template examples tested and working

**Documentation Quality:**
- [ ] All templates documented accurately
- [ ] Variable specifications complete
- [ ] Examples tested and functional
- [ ] Code snippets accurate
- [ ] Links to other documentation working
- [ ] Visual aids support understanding

**User Experience:**
- [ ] Template selection guidance clear
- [ ] Customization process intuitive
- [ ] Examples copy-paste ready
- [ ] Best practices actionable
- [ ] Troubleshooting effective

**Integration:**
- [ ] Links to Epic 3 (installation) working
- [ ] Links to Epic 4 (create_workflow tool) working
- [ ] Links to Epic 8 (troubleshooting) working
- [ ] Claude Desktop integration verified

## Technical Notes

### Current Documentation Sources

**README.md:**
- Lines 493-515: MCP Prompts overview
- Template list with descriptions

**examples/using_prompts.md:**
- Basic usage guide
- Trigger node compatibility notes
- Example conversations
- Variable customization

**src/services/promptsService.ts:**
- All 5 template definitions (complete code)
- Variable definitions with defaults
- Node configurations
- Connection structures

### GitHub Pages Integration

**Proposed Page Structure:**
```
🎨 Templates & Prompts
├── Overview
│   └── Prompts System (Story 6.1)
├── Template Reference
│   ├── Schedule Triggered Workflow
│   ├── HTTP Webhook Workflow
│   ├── Data Transformation Workflow
│   ├── External Service Integration
│   └── API Data Polling Workflow
├── Customization
│   └── Variables & Customization (Story 6.3)
├── Contributing
│   └── Creating Custom Templates (Story 6.4)
└── Best Practices
    └── Usage Patterns (Story 6.5)
```

### Visual Assets Needed

**Diagrams:**
- Template flow: User request → Variable specification → Workflow creation
- Template structure diagram (nodes + connections + variables)
- Variable substitution flow
- Template evolution pathway

**Per-Template Diagrams:**
- Node connection diagram
- Variable flow visualization

**Tables:**
- Template comparison table
- Variable reference table per template
- Template selection decision matrix

### Content Extraction Plan

**From promptsService.ts:**
- All template definitions → Template reference
- Variable definitions → Variable documentation
- Default values → Examples

**From examples/using_prompts.md:**
- Usage patterns → Examples section
- Trigger compatibility → Best practices
- Conversations → Usage guide

**From README.md:**
- Template list → Template overview
- Descriptions → Template descriptions

## Story Manager Handoff

**Story Manager Handoff:**

"Please develop detailed user stories for this workflow templates and prompts system epic. Key considerations:

- This is a documentation-focused epic covering template-based workflow creation
- Content sources:
  - src/services/promptsService.ts (all template definitions, complete implementation)
  - examples/using_prompts.md (usage guide and examples)
  - README.md (prompts overview, lines 493-515)
- Target audience:
  - Primary: Users creating workflows quickly through templates
  - Secondary: Contributors adding new templates
  - Tertiary: Users learning n8n workflow patterns
- Documentation goals:
  - Rapid workflow creation through templates
  - Clear understanding of variable customization
  - Ability to contribute new templates
  - Best practices for template usage and evolution
- GitHub Pages requirements:
  - Template catalog with examples
  - Interactive variable specification guide
  - Visual template structures
  - Searchable template reference
- Each story must include:
  - Complete template specifications
  - Variable reference tables
  - Usage examples (minimum 3 per template)
  - Customization patterns
  - Visual diagrams
  - Links to related documentation
  - Code examples tested against actual implementation

The epic should enable users to quickly create workflows from templates while understanding how to customize, evolve, and contribute templates effectively."

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-12-27 | 1.0 | Epic created for GitHub Pages Workflow Templates & Prompts documentation | Sarah (PO) |

## References

- **Template Definitions:** src/services/promptsService.ts (all 5 templates)
- **Usage Guide:** examples/using_prompts.md
- **Prompts Overview:** README.md (lines 493-515)
- **Epic 3:** Installation & Quick Start (Claude Desktop setup)
- **Epic 4:** Core Features & MCP Tools (create_workflow tool)
- **Epic 8:** Troubleshooting & FAQ (template issues)
- **Target Version:** 0.9.1+
- **n8n Compatibility:** 1.82.3 (tested trigger nodes)
