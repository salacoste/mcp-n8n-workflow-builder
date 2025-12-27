# Epic 5: Multi-Instance Architecture & Configuration - GitHub Pages Documentation

<!-- Powered by BMAD™ Core -->

## Epic Goal

Create comprehensive documentation for the multi-instance architecture system, covering configuration management, environment routing, URL normalization, and advanced patterns to enable users to effectively manage multiple n8n environments (production, staging, development) from a single MCP server.

## Epic Description

### Existing System Context

**Current Relevant Functionality:**
- Multi-instance MCP server supporting multiple n8n environments simultaneously
- Configuration system with `.config.json` (multi-instance) and `.env` (single-instance fallback)
- EnvironmentManager singleton for API instance caching and routing
- ConfigLoader for configuration discovery and validation
- N8NApiWrapper with instance-aware API calls
- All 17 MCP tools support optional `instance` parameter
- URL normalization system (Epic 1 completion)

**Technology Stack:**
- TypeScript with singleton pattern for managers
- Axios instance pooling per environment
- JSON configuration files with validation
- Environment-specific API key management
- Intelligent URL normalization (Epic 1)

**Integration Points:**
- src/config/configLoader.ts - Configuration loading and validation
- src/services/environmentManager.ts - Instance management and routing
- src/services/n8nApiWrapper.ts - Multi-instance API calls
- .config.json - Multi-instance configuration file
- .env - Single-instance legacy configuration (fallback)

### Enhancement Details

**Current Situation:**

**✅ Existing Implementation:**
- Multi-instance support introduced in v0.8.0
- EnvironmentManager with singleton pattern and caching
- ConfigLoader with .config.json → .env fallback logic
- All 17 tools support instance parameter
- docs/multi-instance-architecture.md exists with technical overview
- Epic 1 completed: URL normalization for all configurations

**📋 Current Documentation:**
- README.md covers basic multi-instance setup (lines 70-105)
- Configuration examples for both formats
- Migration guide from single to multi-instance (lines 519-554)
- docs/multi-instance-architecture.md provides technical architecture

**⚠️ Current Gaps for GitHub Pages:**
- Multi-instance benefits not clearly articulated
- Advanced configuration patterns missing
- Environment routing mechanics not explained
- Instance selection strategies not documented
- Configuration best practices scattered
- No troubleshooting for multi-instance issues
- Missing visual architecture diagrams
- Performance implications not discussed

**What's Being Added/Changed:**

1. **Multi-Instance Architecture Overview (Story 5.1):**
   - System architecture and component interactions
   - Benefits of multi-instance approach
   - Use cases: production/staging/development separation
   - Component responsibilities (ConfigLoader, EnvironmentManager, N8NApiWrapper)
   - Singleton pattern and caching strategy
   - Performance characteristics
   - Visual architecture diagrams

2. **Configuration Formats Deep Dive (Story 5.2):**
   - `.config.json` structure and schema
   - `.env` format for single-instance
   - Configuration priority and fallback logic
   - Environment variable expansion
   - Validation rules and error handling
   - Configuration file location and discovery
   - Security best practices

3. **Environment Management (Story 5.3):**
   - Defining environments (production, staging, development, custom)
   - Environment naming conventions
   - Default environment selection
   - Per-environment configuration (n8n_host, n8n_api_key)
   - Environment isolation and security
   - Multi-tenant patterns
   - Environment lifecycle management

4. **Instance Routing & Selection (Story 5.4):**
   - How instance parameter works across all tools
   - Default instance behavior
   - Explicit instance selection
   - Instance validation and error handling
   - Routing performance and caching
   - EnvironmentManager internals
   - Instance discovery and availability

5. **URL Configuration & Normalization (Story 5.5):**
   - Epic 1 integration: URL normalization system
   - Correct URL format (base URL without /api/v1)
   - Automatic URL normalization logic
   - Backward compatibility handling
   - Debug logging for URL construction
   - Platform-specific URL patterns (self-hosted vs cloud)
   - Troubleshooting URL issues

6. **Migration from Single to Multi-Instance (Story 5.6):**
   - Step-by-step migration guide
   - Converting .env to .config.json
   - Testing migration before switching
   - Rollback procedures
   - Common migration issues
   - Validation after migration

7. **Advanced Configuration Patterns (Story 5.7):**
   - Dynamic environment configuration
   - Configuration templates and inheritance
   - Secrets management integration
   - Environment-specific settings
   - Load balancing across instances
   - Disaster recovery configurations
   - CI/CD integration patterns
   - Monitoring and health checks per environment

**How It Integrates:**

- Builds on Epic 3 (installation) with advanced configuration
- Referenced by Epic 4 (all tools support instance parameter)
- Integrates Epic 1 (URL normalization)
- Links to Epic 8 (troubleshooting multi-instance issues)
- Provides foundation for enterprise deployments
- Supports production-ready architectures

**Success Criteria:**

1. ✅ Multi-instance architecture clearly explained with diagrams
2. ✅ Both configuration formats (`.config.json`, `.env`) fully documented
3. ✅ Environment management patterns illustrated
4. ✅ Instance routing mechanics understood by readers
5. ✅ URL normalization (Epic 1) integrated seamlessly
6. ✅ Migration path from single to multi-instance clear and tested
7. ✅ Advanced patterns enable enterprise use cases
8. ✅ Troubleshooting guide for multi-instance issues

## Stories

This epic consists of 7 user stories organized by architectural layers and usage patterns:

### Phase 1: Architecture & Fundamentals (Stories 5.1-5.2)

#### Story 5.1: Multi-Instance Architecture Overview
**📄 File:** `docs/stories/5.1.multi-instance-architecture-overview.md`

**Description:** Comprehensive overview of multi-instance architecture including system design, components, benefits, and use cases.

**User Story:**
> As a developer or architect, I want to understand the multi-instance architecture design and its benefits, so that I can decide if it fits my needs and understand how it works before implementation.

**Scope:**
- **Architecture Overview:**
  - System components (ConfigLoader, EnvironmentManager, N8NApiWrapper)
  - Component interactions and data flow
  - Singleton pattern implementation
  - Axios instance pooling strategy
  - Caching and performance optimization

- **Multi-Instance Benefits:**
  - Environment separation (production, staging, development)
  - Single MCP server for multiple n8n instances
  - Unified tool interface across environments
  - Simplified deployment and management
  - Cost efficiency (one MCP server vs multiple)
  - Consistent workflows across environments

- **Use Cases:**
  - Development workflow (dev → staging → production)
  - Multi-tenant deployments
  - Geographic distribution
  - Blue/green deployments
  - Disaster recovery setups
  - Client-specific instances

- **Component Responsibilities:**
  - **ConfigLoader:** Configuration discovery, loading, validation
  - **EnvironmentManager:** API instance creation, caching, routing
  - **N8NApiWrapper:** Multi-instance API calls, error handling
  - Tool handlers: Instance parameter processing

- **Performance Characteristics:**
  - Singleton instance creation (one per environment)
  - Connection pooling per environment
  - Caching strategy and TTL
  - Memory footprint
  - Request routing overhead
  - Scalability considerations

- **Visual Diagrams:**
  - High-level architecture diagram
  - Component interaction flow
  - Request routing sequence
  - Configuration loading flow
  - Instance caching mechanism

**Key Acceptance Criteria:**
1. Architecture components clearly identified and explained
2. Multi-instance benefits articulated with examples
3. Use cases illustrated with real-world scenarios
4. Component responsibilities documented
5. Performance characteristics explained
6. Visual diagrams support understanding
7. Comparison with single-instance approach
8. Links to detailed component documentation

**Estimated Complexity:** Medium
**Dependencies:** None
**Blocking:** Stories 5.2-5.7 (foundational understanding)

---

#### Story 5.2: Configuration Formats Deep Dive
**📄 File:** `docs/stories/5.2.configuration-formats-deep-dive.md`

**Description:** Detailed documentation of both configuration formats (`.config.json` and `.env`) with schema, validation, and best practices.

**User Story:**
> As a user configuring n8n-workflow-builder, I want detailed documentation of configuration file formats and options, so that I can set up my configuration correctly and understand all available options.

**Scope:**
- **`.config.json` Format (Multi-Instance):**
  - Complete JSON schema definition
  - environments object structure
  - Environment properties (n8n_host, n8n_api_key)
  - defaultEnv field specification
  - Optional fields and defaults
  - Validation rules
  - Example configurations:
    - Minimal (single environment)
    - Standard (3 environments)
    - Advanced (custom environments)

- **`.env` Format (Single-Instance Legacy):**
  - Environment variable definitions
  - N8N_HOST specification
  - N8N_API_KEY specification
  - Optional variables (MCP_PORT, DEBUG)
  - When to use .env vs .config.json
  - Limitations of .env format

- **Configuration Priority:**
  - Discovery order: .config.json → .env
  - Override behavior
  - Fallback mechanism
  - Error handling when both present
  - Validation sequence

- **File Location and Discovery:**
  - Default location: project root
  - Search paths and discovery algorithm
  - Custom configuration paths (if supported)
  - File permissions requirements

- **Environment Variable Expansion:**
  - Using environment variables in .config.json
  - Template syntax (if supported)
  - Security considerations

- **Validation Rules:**
  - Required fields per format
  - URL format validation
  - API key format requirements
  - Environment name restrictions
  - Error messages and troubleshooting

- **Security Best Practices:**
  - API key protection
  - .gitignore configuration
  - File permissions
  - Secrets management integration
  - Credential rotation

**Key Acceptance Criteria:**
1. Both configuration formats fully documented with schemas
2. Complete examples for common scenarios
3. Configuration priority clearly explained
4. Validation rules specified with error messages
5. Security best practices prominent
6. File location and discovery documented
7. Migration guidance between formats
8. Links to Epic 3 (installation) and Story 5.6 (migration)

**Estimated Complexity:** Medium
**Dependencies:** Story 5.1 (architecture context)
**Blocking:** Story 5.3 (environment management builds on config)

---

### Phase 2: Environment & Routing (Stories 5.3-5.4)

#### Story 5.3: Environment Management Guide
**📄 File:** `docs/stories/5.3.environment-management-guide.md`

**Description:** Complete guide to defining, managing, and organizing multiple n8n environments with naming conventions and lifecycle management.

**User Story:**
> As an administrator managing multiple n8n environments, I want guidance on environment organization and management, so that I can structure my environments effectively and maintain them over time.

**Scope:**
- **Defining Environments:**
  - Standard environments (production, staging, development)
  - Custom environment names
  - Environment naming conventions
  - Environment purpose and documentation
  - Number of environments (best practices)

- **Default Environment:**
  - Setting default environment (defaultEnv field)
  - Default environment behavior
  - When default is used vs explicit instance
  - Changing default environment
  - Best practices for default selection

- **Per-Environment Configuration:**
  - n8n_host configuration per environment
  - n8n_api_key management per environment
  - Environment-specific settings
  - Configuration inheritance patterns (if supported)
  - Environment isolation

- **Environment Lifecycle:**
  - Adding new environments
  - Modifying existing environments
  - Deprecating environments
  - Removing environments
  - Environment versioning

- **Multi-Tenant Patterns:**
  - Client-specific environments
  - Shared vs dedicated instances
  - Namespace strategies
  - Isolation and security

- **Environment Organization Strategies:**
  - By purpose (dev/staging/prod)
  - By client (client-a, client-b)
  - By geography (us-east, eu-west)
  - By feature (feature-x, feature-y)
  - Hybrid approaches

- **Security and Isolation:**
  - API key separation per environment
  - Network isolation considerations
  - Access control per environment
  - Audit logging per environment

**Key Acceptance Criteria:**
1. Environment definition process clearly documented
2. Naming conventions and best practices provided
3. Default environment behavior explained
4. Environment lifecycle management illustrated
5. Multi-tenant patterns documented with examples
6. Organization strategies compared with pros/cons
7. Security and isolation guidance comprehensive
8. Links to Story 5.2 (configuration) and Story 5.4 (routing)

**Estimated Complexity:** Medium
**Dependencies:** Story 5.2 (configuration formats)
**Blocking:** Story 5.4 (routing needs environment context)

---

#### Story 5.4: Instance Routing & Selection Mechanics
**📄 File:** `docs/stories/5.4.instance-routing-selection.md`

**Description:** Detailed explanation of how instance routing works, including parameter handling, default behavior, and EnvironmentManager internals.

**User Story:**
> As a developer using MCP tools, I want to understand how instance routing works, so that I can correctly target specific n8n environments and troubleshoot routing issues.

**Scope:**
- **Instance Parameter Usage:**
  - Optional instance parameter on all 17 tools
  - Parameter format and validation
  - Instance name matching (case-sensitive/insensitive)
  - Examples for each tool category

- **Default Instance Behavior:**
  - When instance parameter omitted
  - Default environment selection (defaultEnv)
  - Fallback when default not configured
  - Single-instance mode behavior

- **Explicit Instance Selection:**
  - Specifying instance by name
  - Instance availability validation
  - Error handling for invalid instances
  - Instance discovery

- **EnvironmentManager Internals:**
  - getApiInstance() method flow
  - Singleton pattern implementation
  - Axios instance creation and caching
  - Cache invalidation (if supported)
  - Thread safety and concurrency

- **Routing Performance:**
  - First request (instance creation)
  - Subsequent requests (cached instance)
  - Connection pooling per instance
  - Memory usage per instance
  - Performance benchmarks

- **Instance Validation:**
  - Pre-request validation
  - Configuration checking
  - Connectivity testing
  - Error messages for validation failures

- **Advanced Routing Patterns:**
  - Round-robin across instances (if supported)
  - Failover strategies
  - Health check integration
  - Load balancing considerations

**Key Acceptance Criteria:**
1. Instance parameter usage documented for all tool categories
2. Default instance behavior clearly explained
3. EnvironmentManager internals documented (architecture level)
4. Routing performance characteristics explained
5. Instance validation process detailed
6. Error handling for routing failures covered
7. Code examples for common routing scenarios
8. Links to Epic 4 (tools) and Story 5.3 (environments)

**Estimated Complexity:** Medium
**Dependencies:** Story 5.3 (environment definitions)
**Blocking:** None

---

### Phase 3: URL & Migration (Stories 5.5-5.6)

#### Story 5.5: URL Configuration & Normalization (Epic 1 Integration)
**📄 File:** `docs/stories/5.5.url-configuration-normalization.md`

**Description:** Comprehensive guide to URL configuration with Epic 1 normalization system integrated, covering correct formats, automatic normalization, and troubleshooting.

**User Story:**
> As a user configuring n8n hosts, I want clear guidance on URL format and automatic normalization, so that my configurations work correctly without URL path duplication errors.

**Scope:**
- **Epic 1 Integration:**
  - URL normalization system overview
  - Automatic /api/v1 detection and removal
  - Backward compatibility with old configs
  - Debug logging for URL construction

- **Correct URL Format:**
  - Base URL without /api/v1 (recommended)
  - Self-hosted format: `https://n8n.example.com`
  - n8n Cloud format: `https://instance.app.n8n.cloud`
  - Localhost format: `http://localhost:5678`
  - Port specification when needed

- **URL Normalization Logic:**
  - Step 1: Remove trailing slashes
  - Step 2: Detect and remove /api/v1 suffix
  - Step 3: Append /api/v1 to normalized base
  - Result: Clean, consistent URL format
  - Code examples from Epic 1

- **Backward Compatibility:**
  - Old configurations with /api/v1 still work
  - Automatic normalization prevents duplication
  - No breaking changes for existing users
  - Migration not required (but recommended)

- **Platform-Specific Patterns:**
  - Self-hosted n8n URL patterns
  - n8n Cloud URL patterns
  - Custom domains and reverse proxies
  - SSL/TLS considerations
  - Port and path customization

- **Debug Logging:**
  - Enabling DEBUG=true
  - Reading URL normalization logs
  - Original URL vs normalized URL
  - Troubleshooting URL issues with logs

- **Common URL Issues:**
  - Duplicate /api/v1 paths (historical)
  - Incorrect protocol (http vs https)
  - Missing port numbers
  - Trailing slashes causing issues
  - Custom paths not supported

**Key Acceptance Criteria:**
1. Epic 1 URL normalization integrated and explained
2. Correct URL formats documented with examples
3. Normalization logic detailed step-by-step
4. Backward compatibility clearly communicated
5. Platform-specific patterns documented
6. Debug logging usage explained
7. Common URL issues with solutions
8. Links to Epic 1 documentation

**Estimated Complexity:** Low (Epic 1 already complete)
**Dependencies:** Epic 1 completion, Story 5.2 (configuration)
**Blocking:** None

---

#### Story 5.6: Migration from Single to Multi-Instance
**📄 File:** `docs/stories/5.6.migration-single-to-multi.md`

**Description:** Step-by-step migration guide for converting single-instance (.env) setups to multi-instance (.config.json) with testing and rollback procedures.

**User Story:**
> As a user with existing single-instance configuration, I want a clear migration path to multi-instance setup, so that I can upgrade without service disruption and with confidence.

**Scope:**
- **Migration Prerequisites:**
  - Current configuration review (.env file)
  - Backup procedures
  - Testing environment availability
  - Version compatibility check

- **Step-by-Step Migration:**
  1. Review existing .env configuration
  2. Create .config.json with equivalent settings
  3. Add .env values to "default" environment
  4. (Optional) Add additional environments
  5. Set defaultEnv to "default"
  6. Test configuration before switching
  7. Rename .env to .env.backup
  8. Restart MCP server
  9. Verify operation
  10. Validate multi-instance functionality

- **Configuration Conversion:**
  - .env to .config.json mapping
  - N8N_HOST → environments.default.n8n_host
  - N8N_API_KEY → environments.default.n8n_api_key
  - Example conversion templates

- **Testing Before Migration:**
  - Test .config.json alongside .env
  - Validate both configurations work
  - Test default environment behavior
  - Verify tool accessibility

- **Adding Additional Environments:**
  - After successful migration
  - Adding staging environment
  - Adding development environment
  - Testing multi-environment setup

- **Rollback Procedures:**
  - Renaming .env.backup to .env
  - Removing .config.json
  - Restarting server
  - Verification after rollback

- **Common Migration Issues:**
  - Configuration priority (which file is used)
  - URL format differences
  - API key validation
  - Environment naming conflicts
  - Troubleshooting failed migration

- **Post-Migration Validation:**
  - Tool availability check
  - API connectivity verification
  - Multi-instance functionality test
  - Performance validation

**Key Acceptance Criteria:**
1. Complete migration steps documented
2. Configuration conversion process clear
3. Testing procedures before switching
4. Rollback procedures documented and tested
5. Common issues anticipated with solutions
6. Post-migration validation checklist
7. Examples for all steps
8. Links to Stories 5.2 (config formats), 5.3 (environments)

**Estimated Complexity:** Low
**Dependencies:** Story 5.2 (both config formats), Story 5.3 (environments)
**Blocking:** None

---

### Phase 4: Advanced Patterns (Story 5.7)

#### Story 5.7: Advanced Configuration Patterns
**📄 File:** `docs/stories/5.7.advanced-configuration-patterns.md`

**Description:** Documentation of advanced configuration patterns for enterprise deployments including secrets management, CI/CD integration, monitoring, and disaster recovery.

**User Story:**
> As an enterprise user or DevOps engineer, I want advanced configuration patterns and integration examples, so that I can deploy n8n-workflow-builder in production environments with proper security, monitoring, and resilience.

**Scope:**
- **Dynamic Environment Configuration:**
  - Configuration from environment variables
  - Runtime configuration updates (if supported)
  - Configuration reload mechanisms
  - Hot-swapping configurations

- **Secrets Management Integration:**
  - HashiCorp Vault integration patterns
  - AWS Secrets Manager integration
  - Azure Key Vault integration
  - Environment variable expansion
  - API key rotation strategies

- **Configuration Templates:**
  - Base configuration with overrides
  - Environment-specific extensions
  - Configuration inheritance patterns
  - Template variables and substitution

- **Load Balancing Patterns:**
  - Multiple n8n instances behind load balancer
  - Instance selection strategies
  - Health check integration
  - Failover configurations
  - Session affinity considerations

- **Disaster Recovery Configurations:**
  - Primary and backup instances
  - Automatic failover patterns
  - Health check monitoring
  - Recovery time objectives (RTO)
  - Recovery point objectives (RPO)

- **CI/CD Integration:**
  - Configuration management in version control
  - Environment-specific config deployment
  - Automated testing of configurations
  - Configuration validation in pipelines
  - Blue/green deployment patterns

- **Monitoring and Observability:**
  - Per-environment health checks
  - Configuration monitoring
  - Instance availability tracking
  - Performance metrics per environment
  - Alerting patterns

- **Security Hardening:**
  - Network segmentation per environment
  - API key rotation automation
  - Audit logging configuration
  - Compliance considerations
  - Least privilege access

**Key Acceptance Criteria:**
1. Advanced patterns documented with examples
2. Secrets management integration patterns provided
3. CI/CD integration examples included
4. Monitoring and observability guidance complete
5. Disaster recovery patterns illustrated
6. Load balancing strategies documented
7. Security hardening best practices prominent
8. Links to external tools and services where applicable

**Estimated Complexity:** High
**Dependencies:** Stories 5.1-5.6 (all foundational concepts)
**Blocking:** None

---

## Story Implementation Order

**Phase 1 (Architecture & Fundamentals) - Stories 5.1, 5.2:**
- Sequential execution recommended (5.1 → 5.2)
- Architecture overview provides context for configuration
- Foundational for all subsequent stories

**Phase 2 (Environment & Routing) - Stories 5.3, 5.4:**
- Sequential execution recommended (5.3 → 5.4)
- Environment definitions needed before routing
- Core multi-instance functionality

**Phase 3 (URL & Migration) - Stories 5.5, 5.6:**
- Can be executed in parallel
- Both build on Phase 1 and Phase 2
- URL story integrates Epic 1
- Migration story enables adoption

**Phase 4 (Advanced Patterns) - Story 5.7:**
- MUST follow all previous stories
- Builds on all foundational concepts
- Enterprise and advanced users

## Compatibility Requirements

- [x] Documentation matches v0.9.1 implementation
- [x] Epic 1 URL normalization integrated
- [x] All configuration patterns tested and verified
- [x] Multi-instance support validated across all 17 tools
- [x] EnvironmentManager singleton pattern documented
- [x] ConfigLoader fallback logic accurately described
- [x] Security best practices align with industry standards
- [x] Cross-references to Epic 3 (installation), Epic 4 (tools), Epic 8 (troubleshooting)

## Risk Mitigation

**Primary Risk:** Users misconfigure multi-instance setup

**Mitigation:**
- Clear, tested configuration examples
- Validation checklist for each configuration
- Step-by-step guides with verification steps
- Common mistakes documented with solutions
- Migration guide with rollback procedures
- Debug logging guidance for troubleshooting

**Secondary Risk:** Documentation doesn't match implementation

**Mitigation:**
- Reference actual code files (configLoader.ts, environmentManager.ts)
- Include version tags (v0.9.1+)
- Test all configuration examples
- Regular documentation review with releases
- Integration with automated testing

**Rollback Plan:**
- Documentation changes are non-breaking
- Users can reference README.md for basic setup
- Version history maintained
- No code changes in this epic

## Definition of Done

- [ ] All 7 stories completed with acceptance criteria met
- [ ] Multi-instance architecture clearly explained with diagrams
- [ ] Both configuration formats fully documented with examples
- [ ] Environment management patterns illustrated
- [ ] Instance routing mechanics documented
- [ ] Epic 1 URL normalization integrated seamlessly
- [ ] Migration guide tested with real configurations
- [ ] Advanced patterns enable enterprise deployments
- [ ] Cross-references to other epics functional
- [ ] GitHub Pages navigation structure implemented
- [ ] Visual aids (architecture diagrams, flowcharts) included
- [ ] Code examples tested against v0.9.1
- [ ] Mobile-responsive content verified

### Testing Checklist

**Prerequisites:**
- [ ] Multiple n8n instances available (production, staging, development)
- [ ] v0.9.1 MCP server installed
- [ ] Both .config.json and .env configurations prepared
- [ ] Epic 1 URL normalization verified

**Configuration Testing:**
- [ ] .config.json multi-instance configuration working
- [ ] .env single-instance configuration working
- [ ] Configuration priority (.config.json → .env) verified
- [ ] URL normalization working for all instances
- [ ] Environment validation functioning
- [ ] Default environment behavior correct

**Routing Testing:**
- [ ] Instance parameter working across all tools
- [ ] Default instance selection correct
- [ ] Explicit instance selection working
- [ ] Instance validation errors appropriate
- [ ] Cached instance performance verified

**Migration Testing:**
- [ ] Migration from .env to .config.json successful
- [ ] Rollback procedure working
- [ ] No service disruption during migration
- [ ] Multi-instance functionality after migration
- [ ] All tools accessible post-migration

**Advanced Patterns Testing:**
- [ ] Secrets management integration (if applicable)
- [ ] CI/CD configuration deployment (if applicable)
- [ ] Monitoring and health checks functional
- [ ] Load balancing patterns validated (if applicable)

**Documentation Quality:**
- [ ] Architecture diagrams accurate and helpful
- [ ] Configuration examples tested and working
- [ ] All code snippets functional
- [ ] Links to other documentation functional
- [ ] Search keywords optimized
- [ ] Mobile layout readable

## Technical Notes

### Current Documentation Sources

**README.md:**
- Lines 70-105: Configuration (single and multi-instance)
- Lines 337-350: Multi-instance support overview
- Lines 519-554: Migration from single to multi-instance

**docs/multi-instance-architecture.md:**
- Technical architecture overview
- Component responsibilities
- Implementation patterns

**Epic 1:**
- docs/epic-1-url-configuration-fix.md
- URL normalization system
- Backward compatibility

**Source Code:**
- src/config/configLoader.ts - Configuration loading
- src/services/environmentManager.ts - Instance management
- src/services/n8nApiWrapper.ts - Multi-instance API calls

### GitHub Pages Integration

**Proposed Page Structure:**
```
🏗️ Architecture
├── Overview
│   └── Multi-Instance Architecture (Story 5.1)
├── Configuration
│   ├── Configuration Formats (Story 5.2)
│   ├── Environment Management (Story 5.3)
│   └── URL Configuration (Story 5.5)
├── Routing
│   └── Instance Routing & Selection (Story 5.4)
├── Migration
│   └── Single to Multi-Instance (Story 5.6)
└── Advanced
    └── Advanced Patterns (Story 5.7)
```

### Visual Assets Needed

**Architecture Diagrams:**
- High-level multi-instance architecture
- Component interaction diagram
- Request routing flow
- Configuration loading sequence
- Instance caching mechanism

**Flowcharts:**
- Configuration discovery flowchart
- Instance selection decision tree
- URL normalization flow (Epic 1)
- Migration process flowchart

**Tables:**
- Configuration format comparison
- Environment organization strategies
- Routing performance characteristics

### Content Extraction Plan

**From README.md:**
- Multi-instance sections (lines 70-105, 337-350, 519-554)
- Configuration examples
- Migration guidance

**From docs/multi-instance-architecture.md:**
- Architecture overview
- Component descriptions
- Technical implementation details

**From Epic 1:**
- URL normalization system
- Backward compatibility notes
- Debug logging examples

**From source code:**
- configLoader.ts (configuration loading logic)
- environmentManager.ts (instance management, singleton pattern)
- n8nApiWrapper.ts (multi-instance API call patterns)

## Story Manager Handoff

**Story Manager Handoff:**

"Please develop detailed user stories for this multi-instance architecture epic. Key considerations:

- This is a documentation-focused epic covering advanced architecture
- Content sources:
  - docs/multi-instance-architecture.md (technical architecture)
  - README.md (configuration and migration sections)
  - Epic 1 (URL normalization integration)
  - Source code (configLoader.ts, environmentManager.ts, n8nApiWrapper.ts)
- Target audience:
  - Primary: Administrators managing multiple n8n environments
  - Secondary: Architects designing production deployments
  - Tertiary: DevOps engineers integrating with CI/CD
- Documentation goals:
  - Clear understanding of multi-instance benefits and architecture
  - Confident configuration of multiple environments
  - Successful migration from single to multi-instance
  - Enterprise-ready deployment patterns
- GitHub Pages requirements:
  - Architecture diagrams and visual aids
  - Interactive configuration examples
  - Step-by-step migration guide
  - Advanced patterns for enterprise use
- Each story must include:
  - Architecture context and component relationships
  - Complete configuration examples
  - Visual diagrams where helpful
  - Testing and validation procedures
  - Troubleshooting guidance
  - Links to related documentation
  - Security considerations

The epic should provide comprehensive multi-instance documentation from basic concepts to advanced enterprise patterns, enabling users to confidently deploy and manage multiple n8n environments."

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-12-27 | 1.0 | Epic created for GitHub Pages Multi-Instance Architecture documentation | Sarah (PO) |

## References

- **Architecture Document:** docs/multi-instance-architecture.md
- **Configuration Guide:** README.md (Configuration sections)
- **Epic 1:** URL Configuration Fix (normalization system)
- **Source Code:** src/config/configLoader.ts, src/services/environmentManager.ts
- **Epic 3:** Installation & Quick Start (configuration setup)
- **Epic 4:** Core Features & MCP Tools (instance parameter usage)
- **Epic 8:** Troubleshooting & FAQ (multi-instance issues)
- **Target Version:** 0.9.1+
- **MCP Protocol:** Multi-instance support introduced in v0.8.0
