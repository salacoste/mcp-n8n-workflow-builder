# Epic 8: Troubleshooting, FAQ & Contributing - GitHub Pages Documentation

<!-- Powered by BMAD™ Core -->

## Epic Goal

Create comprehensive troubleshooting guide, frequently asked questions (FAQ), and contributing guidelines to enable users to solve common problems independently, understand project conventions, and contribute effectively to the n8n-workflow-builder MCP server project.

## Epic Description

### Existing System Context

**Current Relevant Functionality:**
- Comprehensive troubleshooting section in README.md
- Developer guide in CLAUDE.md with patterns and conventions
- Test infrastructure with multiple test scripts
- Bug reporting section with GitHub issues link
- CHANGELOG.md with version history
- Complete codebase with TypeScript patterns

**Documented Issues & Solutions:**
- URL configuration problems (Epic 1)
- Port conflicts (EADDRINUSE)
- Authentication failures
- Set node parameter errors
- Multi-instance configuration
- Claude Desktop integration

**Technology Stack:**
- TypeScript/Node.js development
- Jest for unit testing
- Multiple test scripts for integration testing
- GitHub for version control and collaboration
- npm for package distribution

**Integration Points:**
- README.md - Troubleshooting section (lines 715-895)
- CLAUDE.md - Developer guidelines
- Test scripts (test-mcp-tools.js, test-comprehensive.js, etc.)
- GitHub Issues for bug reporting
- Epic 1-7 documentation with specific troubleshooting

### Enhancement Details

**Current Situation:**

**✅ Existing Documentation:**
- README.md has basic troubleshooting (URL issues, port conflicts, auth errors)
- CLAUDE.md provides developer context and patterns
- Bug reporting section exists with GitHub issues link
- Test scripts available for validation
- Version compatibility notes scattered

**📋 Current Resources:**
- Common error solutions documented
- Debug mode usage explained
- Test infrastructure in place
- Code patterns established
- Community contribution path via GitHub

**⚠️ Current Gaps for GitHub Pages:**
- Troubleshooting not organized by category
- FAQ missing (common questions not answered)
- Contributing guidelines not consolidated
- Testing guide not comprehensive
- Code patterns not fully documented
- No decision trees for problem diagnosis
- Debug workflow not detailed
- Community contribution process unclear

**What's Being Added/Changed:**

1. **Common Issues & Solutions (Story 8.1):**
   - Categorized troubleshooting by issue type
   - Installation issues
   - Configuration problems
   - Connection failures
   - Runtime errors
   - Multi-instance issues
   - Template/prompts problems
   - Decision trees for diagnosis
   - Step-by-step solution procedures

2. **Debug Mode & Logging (Story 8.2):**
   - Complete debug mode guide
   - Enabling DEBUG=true
   - Reading and interpreting logs
   - Log levels and categories
   - Common log patterns
   - Performance debugging
   - Network debugging
   - Multi-instance debugging

3. **Testing Infrastructure Guide (Story 8.3):**
   - Test script reference (test-mcp-tools.js, etc.)
   - Running tests against n8n instance
   - Interpreting test results
   - Test configuration options
   - Writing new tests
   - CI/CD integration
   - Test coverage requirements

4. **Frequently Asked Questions (Story 8.4):**
   - Installation & setup questions
   - Configuration questions
   - Feature availability questions
   - API limitation questions
   - Multi-instance questions
   - Performance questions
   - Security questions
   - Compatibility questions

5. **Contributing Guidelines (Story 8.5):**
   - Code contribution process
   - Development environment setup
   - Code style and patterns
   - Testing requirements
   - Documentation standards
   - Pull request workflow
   - Review criteria
   - Community guidelines

6. **Version Compatibility & Migration (Story 8.6):**
   - Version compatibility matrix
   - Breaking changes by version
   - Migration guides between versions
   - Deprecation notices
   - Upgrade procedures
   - Rollback strategies

7. **Bug Reporting & Feature Requests (Story 8.7):**
   - How to report bugs effectively
   - Bug report template
   - Feature request process
   - GitHub issues guidelines
   - Security vulnerability reporting
   - Community support channels

**How It Integrates:**

- References all Epics 1-7 for specific issues
- Provides user support for all documented features
- Enables community contributions
- Links to external resources (n8n docs, GitHub)
- Consolidates scattered troubleshooting information
- Serves as final reference for problem resolution

**Success Criteria:**

1. ✅ Common issues categorized and searchable
2. ✅ Debug mode comprehensively documented
3. ✅ Testing infrastructure fully explained
4. ✅ FAQ answers top 20+ questions
5. ✅ Contributing guidelines enable contributions
6. ✅ Version compatibility clearly presented
7. ✅ Bug reporting process streamlined
8. ✅ Users can self-serve for most common issues

## Stories

This epic consists of 7 user stories organized by support and contribution concerns:

### Phase 1: Problem Resolution (Stories 8.1-8.2)

#### Story 8.1: Common Issues & Solutions Catalog
**📄 File:** `docs/stories/8.1.common-issues-solutions.md`

**Description:** Comprehensive catalog of common issues organized by category with step-by-step solutions and diagnostic decision trees.

**User Story:**
> As a user experiencing problems, I want a searchable catalog of common issues with solutions, so that I can quickly resolve problems without external help.

**Scope:**

**Issue Categories:**

- **Installation Issues:**
  - npm installation failures
  - Build errors (TypeScript compilation)
  - Dependency conflicts
  - Node.js version incompatibility
  - Permission errors
  - Platform-specific issues (macOS, Linux, Windows)

- **Configuration Problems:**
  - .config.json syntax errors
  - .env file not recognized
  - Invalid n8n_host URL
  - API key authentication failures
  - Multi-instance configuration errors
  - Environment variable issues
  - URL normalization problems (Epic 1)

- **Connection Failures:**
  - Cannot connect to n8n instance
  - 401 Unauthorized errors
  - 404 Not Found errors
  - Network timeouts
  - SSL/TLS certificate issues
  - Firewall/proxy problems

- **Runtime Errors:**
  - Port conflicts (EADDRINUSE)
  - MCP server crashes
  - Tool execution failures
  - Workflow creation errors
  - Set node parameter errors
  - Connection transformation errors

- **Multi-Instance Issues:**
  - Instance not found errors
  - Instance routing failures
  - Default instance misconfiguration
  - Environment switching problems

- **Claude Desktop Integration:**
  - MCP server not appearing
  - Tools not available
  - Permission issues
  - Configuration file location
  - Multiple MCP servers conflicts

- **Template/Prompts Problems:**
  - Variable substitution failures
  - Template not found
  - Invalid template configuration
  - Trigger node compatibility

**Diagnostic Decision Trees:**
- "MCP server won't start" → Check port, check config, check logs
- "Cannot connect to n8n" → Check URL, check API key, check network
- "Workflow creation fails" → Check format, check validation, check logs
- "Tool not working" → Check parameters, check instance, check API

**Solution Format:**
```markdown
### Issue: [Clear issue description]

**Symptoms:**
- Observable behavior 1
- Observable behavior 2

**Cause:**
Root cause explanation

**Solution:**
1. Step-by-step instructions
2. With verification commands
3. Expected outcomes

**Verification:**
How to confirm the issue is resolved

**Related Issues:**
Links to similar problems or Epic sections
```

**Key Acceptance Criteria:**
1. All major issue categories covered
2. Each issue has clear symptoms, cause, solution
3. Step-by-step solutions with verification
4. Diagnostic decision trees for complex problems
5. Cross-references to relevant Epic sections
6. Code examples where applicable
7. Platform-specific notes included
8. Search-optimized formatting

**Estimated Complexity:** High
**Dependencies:** All Epics 1-7 (references specific issues)
**Blocking:** Story 8.4 (FAQ references common issues)

---

#### Story 8.2: Debug Mode & Logging Guide
**📄 File:** `docs/stories/8.2.debug-mode-logging-guide.md`

**Description:** Complete guide to debug mode, logging system, log interpretation, and debugging workflows.

**User Story:**
> As a developer debugging issues, I want comprehensive documentation on debug mode and logging, so that I can diagnose problems effectively using log output.

**Scope:**

- **Enabling Debug Mode:**
  - Setting DEBUG=true environment variable
  - Debug mode in different environments (development, production)
  - Claude Desktop debug configuration
  - Persistent debug settings
  - Disabling debug mode

- **Log Levels & Categories:**
  - info - General information
  - error - Error messages
  - debug - Debug information (DEBUG=true only)
  - warn - Warning messages
  - Log output format (timestamp, level, message)

- **Reading Logs:**
  - Log location (stderr for all MCP logs)
  - Log format interpretation
  - Timestamp analysis
  - Error stack traces
  - Request/response logging

- **Common Log Patterns:**
  - Successful tool execution
  - API call success/failure
  - URL normalization logs (Epic 1)
  - Instance routing logs
  - Configuration loading logs
  - Error patterns and meanings

- **Debugging Workflows:**
  - **Installation debugging:**
    1. Enable debug mode
    2. Check build logs
    3. Verify dependencies
    4. Check Node.js version

  - **Configuration debugging:**
    1. Enable debug mode
    2. Check config file loading
    3. Verify URL normalization
    4. Test API connectivity

  - **Runtime debugging:**
    1. Enable debug mode
    2. Monitor tool execution
    3. Check API requests/responses
    4. Analyze error messages

- **Performance Debugging:**
  - Identifying slow operations
  - API response time analysis
  - Caching effectiveness
  - Memory usage patterns
  - Connection pooling metrics

- **Network Debugging:**
  - Request/response inspection
  - URL construction verification
  - Authentication header checking
  - Proxy/firewall detection
  - SSL/TLS troubleshooting

- **Multi-Instance Debugging:**
  - Instance selection logging
  - Environment routing traces
  - Configuration per instance
  - API instance caching logs

**Debug Examples:**
```bash
# Enable debug mode
DEBUG=true npm start

# Debug mode with specific port
DEBUG=true MCP_PORT=58921 npm start

# Debug mode in Claude Desktop
# Add to env section of config:
"env": {
  "DEBUG": "true",
  "N8N_HOST": "...",
  "N8N_API_KEY": "..."
}
```

**Log Interpretation Guide:**
- Understanding error codes
- Tracing request flow
- Identifying configuration issues
- Performance bottleneck detection

**Key Acceptance Criteria:**
1. Debug mode activation documented for all scenarios
2. Log levels and categories explained
3. Log format interpretation clear
4. Common log patterns cataloged
5. Debugging workflows step-by-step
6. Performance debugging covered
7. Network debugging detailed
8. Multi-instance debugging included
9. Examples for all scenarios

**Estimated Complexity:** Medium
**Dependencies:** Story 8.1 (common issues reference debugging)
**Blocking:** None

---

### Phase 2: Testing & FAQ (Stories 8.3-8.4)

#### Story 8.3: Testing Infrastructure Guide
**📄 File:** `docs/stories/8.3.testing-infrastructure-guide.md`

**Description:** Comprehensive guide to test infrastructure, test scripts, running tests, and writing new tests.

**User Story:**
> As a developer or contributor, I want complete documentation of the testing infrastructure, so that I can run tests, validate changes, and write new tests effectively.

**Scope:**

- **Test Scripts Overview:**
  - **test-mcp-tools.js** - Comprehensive MCP tool testing
  - **test-comprehensive.js** - Full integration tests
  - **test-notification.js** - Notification handler tests
  - **test-credentials-*.js** - Credential-specific tests
  - **test-workflows-validation.js** - Workflow validation tests
  - **test-executions-validation.js** - Execution tests
  - **test-tags-validation.js** - Tag tests
  - Unit tests (Jest) - src/services/__tests__/

- **test-mcp-tools.js Reference:**
  - Configuration options
  - Test flags (runWorkflowTests, runTagTests, etc.)
  - Cleanup behavior (runCleanup flag)
  - Expected output
  - Success criteria
  - Failure diagnosis

- **Running Tests:**
  - Prerequisites (n8n instance, configuration)
  - Setup steps
  - Running all tests: `node test-mcp-tools.js`
  - Running specific tests: Modifying test flags
  - Running unit tests: `npm test`
  - Test coverage: `npm run test:coverage`

- **Test Configuration:**
  ```javascript
  const config = {
    mcpServerUrl: 'http://localhost:3456/mcp',
    healthCheckUrl: 'http://localhost:3456/health',
    testWorkflowName: 'Test Workflow MCP',
    testFlags: {
      runWorkflowTests: true,
      runTagTests: true,
      runExecutionTests: true,
      runCleanup: true  // Set false to keep test data
    }
  };
  ```

- **Interpreting Test Results:**
  - Success indicators
  - Failure patterns
  - Error message interpretation
  - Performance metrics
  - Coverage reports

- **Writing New Tests:**
  - Test structure and patterns
  - Using test utilities
  - Mocking and stubbing
  - Assertions and expectations
  - Cleanup procedures
  - Test documentation

- **Unit Testing (Jest):**
  - Test file location: src/services/__tests__/
  - Running unit tests: `npm test`
  - Watch mode: `npm run test:watch`
  - Coverage: `npm run test:coverage`
  - Writing unit tests for services
  - Testing TypeScript code

- **Integration Testing:**
  - End-to-end test scenarios
  - Multi-instance testing
  - API compatibility testing
  - Error handling tests
  - Performance tests

- **CI/CD Integration:**
  - Automated testing in pipelines
  - Test environment setup
  - Test data management
  - Coverage requirements
  - Quality gates

- **Testing Best Practices:**
  - Test isolation
  - Cleanup after tests
  - Meaningful test names
  - Comprehensive assertions
  - Edge case coverage
  - Documentation of test purpose

**Key Acceptance Criteria:**
1. All test scripts documented
2. Running tests step-by-step guide
3. Test configuration options explained
4. Result interpretation comprehensive
5. Writing new tests guide included
6. Unit and integration testing covered
7. CI/CD integration documented
8. Best practices actionable

**Estimated Complexity:** Medium
**Dependencies:** None
**Blocking:** Story 8.5 (contributing requires testing knowledge)

---

#### Story 8.4: Frequently Asked Questions (FAQ)
**📄 File:** `docs/stories/8.4.frequently-asked-questions.md`

**Description:** Comprehensive FAQ covering top questions about installation, configuration, features, limitations, and usage.

**User Story:**
> As a user with questions, I want a comprehensive FAQ, so that I can quickly find answers to common questions without searching documentation.

**Scope:**

**Installation & Setup:**
1. **Q: Which installation method should I use?**
   - A: npm global for quick start, npm local for project dependency, manual for development/customization

2. **Q: What are the system requirements?**
   - A: Node.js v14+, npm, n8n instance with API access, Claude Desktop or Cursor IDE

3. **Q: How do I get an n8n API key?**
   - A: n8n Settings → API → Create API Key

4. **Q: Can I use this with n8n Cloud?**
   - A: Yes, use your instance URL (https://instance.app.n8n.cloud)

**Configuration:**
5. **Q: Should I use .config.json or .env?**
   - A: .config.json for multi-instance, .env for single-instance (legacy)

6. **Q: What URL format should I use for n8n_host?**
   - A: Base URL without /api/v1 (e.g., https://n8n.example.com)

7. **Q: How do I configure multiple n8n instances?**
   - A: Use .config.json with environments object (See Epic 5)

8. **Q: What is the defaultEnv field?**
   - A: Environment used when instance parameter is omitted

**Features & Limitations:**
9. **Q: Can I activate workflows programmatically?**
   - A: No, n8n API v2.0+ has read-only 'active' field. Use n8n UI.

10. **Q: Why can't I read credential data?**
    - A: Security - n8n blocks credential reading. Use list_credentials for metadata.

11. **Q: How do I update credentials?**
    - A: Use DELETE + CREATE pattern (credentials are immutable)

12. **Q: Can I execute manual trigger workflows via API?**
    - A: No, use n8n UI or convert to webhook/schedule trigger

13. **Q: What's the API coverage percentage?**
    - A: 83% (19/23 methods fully implemented, 4 with informative guidance)

**Multi-Instance:**
14. **Q: How do I specify which n8n instance to use?**
    - A: Use optional instance parameter in tools, or set defaultEnv

15. **Q: Can I use different n8n versions simultaneously?**
    - A: Yes, configure each as separate environment

16. **Q: What happens if I don't specify an instance?**
    - A: Default environment is used (from defaultEnv)

**Templates & Prompts:**
17. **Q: How many workflow templates are available?**
    - A: 5 templates (Schedule, Webhook, Data Transformation, Integration, API Polling)

18. **Q: Can I create custom templates?**
    - A: Yes, see Contributing Guidelines (Story 8.5)

19. **Q: How do I customize template variables?**
    - A: Specify variables through natural language with Claude

**Performance & Troubleshooting:**
20. **Q: Why is list_workflows slow?**
    - A: Use filters and pagination for large datasets

21. **Q: How do I enable debug mode?**
    - A: Set DEBUG=true environment variable

22. **Q: What should I do if port 3456 is in use?**
    - A: Set MCP_PORT environment variable to different port

23. **Q: Why am I getting 401 Unauthorized?**
    - A: Check n8n_api_key is correct and has necessary permissions

**Security:**
24. **Q: Are credentials encrypted?**
    - A: Yes, n8n automatically encrypts credential data

25. **Q: Should I commit .config.json to git?**
    - A: No, add to .gitignore (contains API keys)

26. **Q: How do I rotate API keys?**
    - A: Update configuration, restart MCP server

**Compatibility:**
27. **Q: What n8n versions are supported?**
    - A: Tested with 1.82.3, compatible with 2.0+

28. **Q: Does this work with older n8n versions?**
    - A: v1.80+ recommended, older versions untested

29. **Q: Can I use this with Claude Desktop and Cursor?**
    - A: Yes, both are supported

**General:**
30. **Q: Is this project open source?**
    - A: Yes, MIT License

31. **Q: How do I report bugs?**
    - A: GitHub Issues with bug report template

32. **Q: Can I contribute?**
    - A: Yes, see Contributing Guidelines (Story 8.5)

**Key Acceptance Criteria:**
1. Minimum 30 questions answered
2. Questions categorized logically
3. Answers concise and actionable
4. Links to detailed documentation where applicable
5. Search-optimized formatting
6. Regular updates based on common questions
7. Cross-references to Epic documentation

**Estimated Complexity:** Medium
**Dependencies:** Story 8.1 (common issues), All Epics 1-7
**Blocking:** None

---

### Phase 3: Contributing & Support (Stories 8.5-8.7)

#### Story 8.5: Contributing Guidelines
**📄 File:** `docs/stories/8.5.contributing-guidelines.md`

**Description:** Comprehensive guidelines for contributing code, documentation, templates, and tests to the project.

**User Story:**
> As a potential contributor, I want clear contributing guidelines, so that I can contribute effectively and have my contributions accepted.

**Scope:**

- **Getting Started:**
  - Fork repository on GitHub
  - Clone to local machine
  - Install dependencies: `npm install`
  - Build project: `npm run build`
  - Run tests: `npm test`
  - Verify setup: `node test-mcp-tools.js`

- **Development Environment:**
  - Recommended tools (VS Code, TypeScript extensions)
  - Environment variables setup
  - Test n8n instance configuration
  - Debug mode configuration
  - Hot reload: `npm run dev`

- **Code Contribution Process:**
  1. **Find or create an issue** on GitHub
  2. **Create feature branch** from main: `git checkout -b feature/your-feature`
  3. **Make changes** following code style
  4. **Write tests** for new functionality
  5. **Run tests** to ensure nothing breaks
  6. **Update documentation** as needed
  7. **Commit changes** with descriptive message
  8. **Push to fork** and create pull request
  9. **Address review feedback**
  10. **Merge** after approval

- **Code Style & Patterns:**
  - TypeScript strict mode
  - ESLint configuration
  - Naming conventions (camelCase, PascalCase)
  - File organization patterns
  - Error handling patterns (try-catch, explicit throws)
  - Logging conventions (console.error for MCP)
  - Comment guidelines (when to comment, JSDoc)

- **Coding Patterns from CLAUDE.md:**
  - Multi-instance tool pattern
  - Instance resolution pattern (callWithInstance)
  - Error handling pattern (handleApiError)
  - Connection format conversion
  - Set node parameter normalization
  - Schema-driven credential creation

- **Testing Requirements:**
  - Unit tests for all new services/utilities
  - Integration tests for new tools
  - Test coverage minimum: 80%
  - All tests must pass before PR
  - Test cleanup (no orphaned data)
  - Performance tests for critical paths

- **Documentation Standards:**
  - Update README.md for user-facing changes
  - Update CLAUDE.md for developer patterns
  - Add JSDoc comments for public APIs
  - Update Epic documentation if applicable
  - Add examples for new features
  - Update CHANGELOG.md

- **Adding New MCP Tools:**
  1. Add tool schema in src/index.ts (ListToolsRequestSchema)
  2. Add tool handler in src/index.ts (CallToolRequestSchema)
  3. Implement method in N8NApiWrapper
  4. Add multi-instance support (instance parameter)
  5. Write tests in test-mcp-tools.js or new test file
  6. Update README.md Available Tools section
  7. Update Epic 4 documentation

- **Adding New Workflow Templates:**
  1. Define prompt in src/services/promptsService.ts
  2. Add to PROMPT_IDS constant
  3. Create Prompt object with id, name, description, template, variables
  4. Export and add to getAvailablePrompts()
  5. Test with Claude Desktop
  6. Update README.md Prompts section
  7. Update Epic 6 documentation

- **Pull Request Guidelines:**
  - Descriptive title and description
  - Reference related issues
  - Include test results
  - Screenshots for UI changes (if applicable)
  - Update CHANGELOG.md
  - Respond to review feedback promptly

- **Review Criteria:**
  - Code quality and style compliance
  - Test coverage adequate
  - Documentation updated
  - No breaking changes (or properly documented)
  - Performance considerations
  - Security considerations

- **Community Guidelines:**
  - Be respectful and constructive
  - Follow Code of Conduct
  - Help others in issues and discussions
  - Report bugs clearly and thoroughly
  - Provide reproducible test cases

**Key Acceptance Criteria:**
1. Complete contribution process documented
2. Development environment setup clear
3. Code style and patterns comprehensive
4. Testing requirements specific
5. Documentation standards defined
6. Adding new features guide step-by-step
7. Pull request process detailed
8. Review criteria transparent
9. Community guidelines included

**Estimated Complexity:** High
**Dependencies:** Story 8.3 (testing knowledge)
**Blocking:** None

---

#### Story 8.6: Version Compatibility & Migration Guide
**📄 File:** `docs/stories/8.6.version-compatibility-migration.md`

**Description:** Comprehensive version compatibility matrix and migration guides for upgrading between MCP server versions.

**User Story:**
> As a user upgrading versions, I want migration guides and compatibility information, so that I can upgrade safely without breaking my setup.

**Scope:**

- **Version Compatibility Matrix:**
  | MCP Server | n8n Version | Node.js | Breaking Changes | Migration Required |
  |------------|-------------|---------|------------------|-------------------|
  | 0.9.1 | 1.82.3+ | v14+ | None | No |
  | 0.9.0 | 1.82.3+ | v14+ | None | No |
  | 0.8.0 | 1.82.3+ | v14+ | Multi-instance added | Optional |
  | 0.7.2 | 1.82.3 | v14+ | None | No |

- **Breaking Changes by Version:**
  - **v0.9.1:** None (URL normalization backward compatible)
  - **v0.9.0:** None (notification handler added)
  - **v0.8.0:** Multi-instance architecture (backward compatible with .env)
  - **v0.7.2:** Set node parameter handling (backward compatible)

- **Migration Guides:**

  **Migrating to 0.9.1:**
  - No migration required
  - Optional: Update URLs to remove /api/v1 (automatic normalization)
  - Benefits: Automatic URL normalization, Epic 1 fixes

  **Migrating to 0.9.0:**
  - No migration required
  - Benefits: MCP notification support, package size optimization

  **Migrating to 0.8.0:**
  - Optional: Migrate from .env to .config.json for multi-instance
  - See Epic 5, Story 5.6 for detailed migration guide
  - .env continues to work (backward compatible)
  - Benefits: Multi-instance support, list_workflows optimization

- **Upgrade Procedures:**
  1. **Backup current configuration**
  2. **Check compatibility matrix**
  3. **Read breaking changes for target version**
  4. **Update package:** `npm install -g @kernel.salacoste/n8n-workflow-builder@latest`
  5. **Test configuration** (dry run if possible)
  6. **Run validation tests:** `node test-mcp-tools.js`
  7. **Update Claude Desktop config** if needed
  8. **Restart MCP server**
  9. **Verify operation**

- **Rollback Procedures:**
  1. **Stop MCP server**
  2. **Restore configuration backup**
  3. **Downgrade package:** `npm install -g @kernel.salacoste/n8n-workflow-builder@<version>`
  4. **Restart MCP server**
  5. **Verify operation**

- **Deprecation Notices:**
  - .env configuration (deprecated in favor of .config.json, still supported)
  - URL with /api/v1 suffix (deprecated, automatic normalization)

- **Feature Additions by Version:**
  - **v0.9.1:** URL normalization system
  - **v0.9.0:** Notification handler, package optimization
  - **v0.8.0:** Multi-instance support, list_workflows optimization
  - **v0.7.2:** Set node parameter handling, port conflict handling

- **Configuration Changes:**
  - Document configuration format changes
  - Show before/after examples
  - Provide conversion scripts if applicable

**Key Acceptance Criteria:**
1. Version compatibility matrix complete
2. Breaking changes documented for all versions
3. Migration guides step-by-step
4. Upgrade procedures safe and tested
5. Rollback procedures reliable
6. Deprecation notices clear with timelines
7. Feature additions tracked
8. Configuration changes documented

**Estimated Complexity:** Low
**Dependencies:** All Epics (version-specific features)
**Blocking:** None

---

#### Story 8.7: Bug Reporting & Feature Requests
**📄 File:** `docs/stories/8.7.bug-reporting-feature-requests.md`

**Description:** Guide to reporting bugs effectively, requesting features, and engaging with community support.

**User Story:**
> As a user encountering bugs or wanting features, I want clear guidelines for reporting, so that issues can be resolved quickly and features can be considered.

**Scope:**

- **Bug Reporting Process:**
  1. **Search existing issues** on GitHub
  2. **Gather information:**
     - MCP server version
     - n8n version
     - Node.js version
     - Operating system
     - Configuration (sanitized, no API keys)
     - Steps to reproduce
     - Expected vs actual behavior
     - Error messages/logs (with DEBUG=true)
     - Screenshots if applicable
  3. **Create GitHub issue** with bug report template
  4. **Provide reproducible test case** if possible
  5. **Respond to questions** from maintainers

- **Bug Report Template:**
  ```markdown
  ## Bug Description
  Clear description of the bug

  ## Environment
  - MCP Server Version: 0.9.1
  - n8n Version: 1.82.3
  - Node.js Version: v18.0.0
  - OS: macOS 13.0

  ## Steps to Reproduce
  1. Step 1
  2. Step 2
  3. Step 3

  ## Expected Behavior
  What should happen

  ## Actual Behavior
  What actually happens

  ## Error Messages/Logs
  ```
  Paste error messages and debug logs here
  ```

  ## Additional Context
  Screenshots, configuration (sanitized), etc.
  ```

- **Good Bug Report Examples:**
  - Specific, reproducible
  - Complete environment information
  - Debug logs included
  - Screenshots for visual issues
  - Configuration examples (sanitized)

- **What Makes a Good Bug Report:**
  - Clear title summarizing issue
  - Detailed description
  - Reproducible steps
  - Environment information
  - Error messages and logs
  - Expected vs actual behavior
  - Sanitized configuration (no secrets)

- **Feature Request Process:**
  1. **Check existing feature requests** on GitHub
  2. **Describe the feature:**
     - Use case and motivation
     - Proposed solution
     - Alternatives considered
     - Additional context
  3. **Create GitHub issue** with feature request template
  4. **Engage in discussion**

- **Feature Request Template:**
  ```markdown
  ## Feature Description
  Clear description of the feature

  ## Use Case
  Why is this feature needed?

  ## Proposed Solution
  How should this work?

  ## Alternatives Considered
  Other approaches explored

  ## Additional Context
  Examples, mockups, related features
  ```

- **Security Vulnerability Reporting:**
  - **DO NOT** create public GitHub issue
  - Email security contact (if provided)
  - Provide detailed vulnerability description
  - Include proof of concept if possible
  - Allow time for patch before disclosure

- **Community Support Channels:**
  - GitHub Issues for bugs and features
  - GitHub Discussions for questions
  - README.md for documentation
  - Epic documentation for detailed guides

- **Issue Triage & Response:**
  - Expected response time
  - Issue labels and their meanings
  - Priority levels
  - Milestone assignments
  - Closing criteria

- **Contributing Fixes:**
  - Link bug report to pull request
  - Reference issue in commit message
  - Add tests for bug fixes
  - Update documentation if needed

**Key Acceptance Criteria:**
1. Bug reporting process clear and complete
2. Bug report template provided
3. Good example bug reports shown
4. Feature request process documented
5. Feature request template provided
6. Security vulnerability reporting process secure
7. Community support channels listed
8. Issue triage expectations set
9. Contributing fixes linked to guidelines

**Estimated Complexity:** Low
**Dependencies:** Story 8.5 (contributing guidelines)
**Blocking:** None

---

## Story Implementation Order

**Phase 1 (Problem Resolution) - Stories 8.1-8.2:**
- Sequential execution recommended (8.1 → 8.2)
- Common issues catalog first
- Debug mode builds on troubleshooting knowledge

**Phase 2 (Testing & FAQ) - Stories 8.3-8.4:**
- Can be executed in parallel
- Testing guide independent
- FAQ references all previous epics

**Phase 3 (Contributing & Support) - Stories 8.5-8.7:**
- Sequential execution recommended (8.5 → 8.6 → 8.7)
- Contributing guidelines foundational
- Version compatibility informs migration
- Bug reporting completes support cycle

## Compatibility Requirements

- [x] Documentation covers all MCP server versions (0.7+)
- [x] All Epics 1-7 referenced for specific issues
- [x] Troubleshooting matches actual error messages
- [x] Debug mode guidance matches implementation
- [x] Test infrastructure accurately documented
- [x] Contributing guidelines reflect actual process
- [x] Bug reporting aligns with GitHub workflow
- [x] Cross-references to all epics functional

## Risk Mitigation

**Primary Risk:** Troubleshooting becomes outdated as code evolves

**Mitigation:**
- Version-specific troubleshooting notes
- Regular documentation review with releases
- Community contribution to troubleshooting
- Automated testing validates solutions
- CHANGELOG integration
- Issue tracking for documentation updates

**Secondary Risk:** FAQ doesn't cover actual user questions

**Mitigation:**
- Monitor GitHub issues for common questions
- Regular FAQ updates based on support requests
- Community contribution to FAQ
- Search analytics (if available)
- Quarterly review and update

**Rollback Plan:**
- Documentation changes are non-breaking
- Users can reference README.md troubleshooting
- Version history maintained
- No code changes in this epic

## Definition of Done

- [ ] All 7 stories completed with acceptance criteria met
- [ ] Common issues cataloged and searchable
- [ ] Debug mode comprehensively documented
- [ ] Testing infrastructure fully explained
- [ ] FAQ answers 30+ questions
- [ ] Contributing guidelines enable contributions
- [ ] Version compatibility clearly presented
- [ ] Bug reporting process streamlined
- [ ] Cross-references to all epics functional
- [ ] GitHub Pages navigation structure implemented
- [ ] Search-optimized formatting applied
- [ ] Mobile-responsive content verified
- [ ] Regular update process established

### Testing Checklist

**Prerequisites:**
- [ ] All Epics 1-7 reviewed for troubleshooting content
- [ ] GitHub issues reviewed for common problems
- [ ] Test scripts validated
- [ ] Contributing process verified

**Documentation Quality:**
- [ ] All common issues have solutions
- [ ] Debug mode instructions tested
- [ ] Test scripts work as documented
- [ ] FAQ answers accurate and helpful
- [ ] Contributing guidelines clear and complete
- [ ] Version compatibility verified
- [ ] Bug reporting template functional

**User Experience:**
- [ ] Issues quickly findable
- [ ] Solutions actionable and tested
- [ ] Debug workflow clear
- [ ] FAQ searchable
- [ ] Contributing process welcoming
- [ ] Mobile layout readable

**Integration:**
- [ ] Links to all Epics 1-7 working
- [ ] Links to GitHub functional
- [ ] Links to external resources working
- [ ] Cross-references accurate

## Technical Notes

### Current Documentation Sources

**README.md:**
- Lines 715-895: Troubleshooting section
- Common errors and solutions
- Port conflicts
- URL configuration issues

**CLAUDE.md:**
- Development patterns
- Code style guidelines
- Testing strategy
- Troubleshooting notes

**Test Scripts:**
- test-mcp-tools.js - Main test suite
- test-comprehensive.js - Integration tests
- Various validation tests
- Unit tests in __tests__/

**GitHub:**
- Issues for bug tracking
- Pull requests for contributions
- Discussions for questions

### GitHub Pages Integration

**Proposed Page Structure:**
```
🛠️ Support & Contributing
├── Troubleshooting
│   ├── Common Issues (Story 8.1)
│   └── Debug Mode Guide (Story 8.2)
├── Testing
│   └── Testing Infrastructure (Story 8.3)
├── FAQ
│   └── Frequently Asked Questions (Story 8.4)
├── Contributing
│   ├── Contributing Guidelines (Story 8.5)
│   └── Bug Reporting (Story 8.7)
└── Version Info
    └── Compatibility & Migration (Story 8.6)
```

### Visual Assets Needed

**Diagrams:**
- Diagnostic decision trees
- Debug workflow flowchart
- Contributing process flowchart
- Bug reporting process

**Tables:**
- Common issues quick reference
- Version compatibility matrix
- Test scripts reference
- Code style reference

### Content Extraction Plan

**From README.md:**
- Troubleshooting section → Story 8.1
- Common errors → Story 8.1
- Bug reporting → Story 8.7

**From CLAUDE.md:**
- Code patterns → Story 8.5
- Testing strategy → Story 8.3
- Development guidelines → Story 8.5

**From Test Scripts:**
- Test documentation → Story 8.3
- Test examples → Story 8.3

**From GitHub Issues:**
- Common questions → Story 8.4
- Bug patterns → Story 8.1

## Story Manager Handoff

**Story Manager Handoff:**

"Please develop detailed user stories for this troubleshooting, FAQ, and contributing epic. Key considerations:

- This is a support and contribution-focused epic
- Content sources:
  - README.md (Troubleshooting section, lines 715-895)
  - CLAUDE.md (Development guidelines and patterns)
  - Test scripts (test-mcp-tools.js and others)
  - GitHub issues (common problems and questions)
  - All Epics 1-7 (specific troubleshooting)
- Target audience:
  - Primary: Users encountering problems needing solutions
  - Secondary: Developers wanting to contribute
  - Tertiary: Community members seeking support
- Documentation goals:
  - Self-service problem resolution
  - Clear contribution pathway
  - Comprehensive FAQ
  - Effective bug reporting
- GitHub Pages requirements:
  - Searchable troubleshooting catalog
  - Decision trees for diagnosis
  - Contributing process clear and welcoming
  - FAQ organized and comprehensive
- Each story must include:
  - Categorized content for easy navigation
  - Step-by-step procedures
  - Code examples and commands
  - Links to related documentation
  - Search-optimized formatting
  - Mobile-responsive design

The epic should provide complete support infrastructure enabling users to solve problems independently and contribute effectively to the project."

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-12-27 | 1.0 | Epic created for GitHub Pages Troubleshooting, FAQ & Contributing documentation | Sarah (PO) |

## References

- **Troubleshooting:** README.md (lines 715-895)
- **Developer Guide:** CLAUDE.md
- **Test Suite:** test-mcp-tools.js and other test scripts
- **Bug Reporting:** README.md bug reporting section
- **Version History:** CHANGELOG.md
- **Epic 1-7:** All epics for specific troubleshooting
- **GitHub Issues:** Common problems and questions
- **Target Version:** 0.9.1+
