# Story 3.3: Configuration Setup Guide

**Epic:** Epic 3 - Installation & Quick Start Guide
**Story ID:** STORY-3.3
**Status:** Draft
**Created:** 2025-12-27
**Updated:** 2025-12-27

---

## User Story

**As a** user who has installed the MCP server
**I want** comprehensive configuration documentation for both single and multi-instance setups
**So that** I can properly connect to my n8n instance(s) and start using the server

---

## Story Description

### Current System Context

The MCP server supports two configuration formats (implemented in Epic 1 and Epic 5):

**1. Single-Instance Configuration (`.env` file - backward compatible):**
```bash
N8N_HOST=https://n8n.example.com
N8N_API_KEY=your_api_key_here
MCP_PORT=3456
DEBUG=false
```

**2. Multi-Instance Configuration (`.config.json` - recommended):**
```json
{
  "environments": {
    "production": {
      "n8n_host": "https://n8n.example.com",
      "n8n_api_key": "prod_key"
    },
    "staging": {
      "n8n_host": "https://staging.n8n.example.com",
      "n8n_api_key": "staging_key"
    }
  },
  "defaultEnv": "production"
}
```

**Configuration Priority:** `.config.json` > `.env` > environment variables

**URL Normalization (Epic 1):** Server automatically appends `/api/v1` to base URLs.

### Enhancement: Comprehensive Configuration Guide

Create detailed configuration documentation covering:

**Getting Your n8n Credentials:**
- Finding n8n host URL (cloud vs self-hosted)
- Generating API keys in n8n UI
- API key permissions and security

**Single-Instance Setup:**
- When to use (simple use case)
- Creating and configuring .env file
- Environment variable alternatives
- Verification steps

**Multi-Instance Setup:**
- When to use (multiple environments)
- Creating and configuring .config.json
- Environment management
- Switching between instances
- Verification steps

**Advanced Configuration:**
- Custom MCP port
- Debug mode enablement
- Network and firewall considerations
- Security best practices

**Configuration Validation:**
- Health check verification
- Troubleshooting connection issues
- API key validation
- URL format verification

---

## Acceptance Criteria

### Documentation Requirements

**AC1: Getting n8n Credentials**
- [ ] Section: "Finding Your n8n Host URL"
  - n8n Cloud format: `https://<instance>.app.n8n.cloud`
  - Self-hosted format: `https://<your-domain>` or `http://localhost:5678`
  - URL normalization explanation (automatic `/api/v1` appending)
  - Examples for both cloud and self-hosted
- [ ] Section: "Generating n8n API Key"
  - Step-by-step with screenshots:
    1. Log into n8n
    2. Navigate to Settings → API
    3. Create new API key
    4. Copy and secure the key
  - Permissions explanation
  - Security warning about key storage
- [ ] API key format validation regex provided

**AC2: Single-Instance Configuration**
- [ ] When to use decision guide:
  - Simple use case: one n8n instance
  - Personal projects
  - Single environment deployments
- [ ] Step-by-step setup:
  ```bash
  # Create .env file in project root
  cat > .env << 'EOF'
  N8N_HOST=https://your-instance.app.n8n.cloud
  N8N_API_KEY=your_api_key_here
  MCP_PORT=3456
  DEBUG=false
  EOF
  ```
- [ ] Environment variable explanation:
  - `N8N_HOST` - Base URL (without /api/v1)
  - `N8N_API_KEY` - API key from n8n
  - `MCP_PORT` - Server port (default: 3456)
  - `DEBUG` - Enable debug logging
- [ ] Alternative: System environment variables
  ```bash
  export N8N_HOST=https://your-instance.app.n8n.cloud
  export N8N_API_KEY=your_api_key_here
  ```
- [ ] Verification command with expected output

**AC3: Multi-Instance Configuration**
- [ ] When to use decision guide:
  - Multiple environments (production, staging, development)
  - Team collaboration with different instances
  - Testing workflows across environments
- [ ] Step-by-step setup:
  ```bash
  # Create .config.json in project root
  cat > .config.json << 'EOF'
  {
    "environments": {
      "production": {
        "n8n_host": "https://prod.app.n8n.cloud",
        "n8n_api_key": "prod_key_here"
      },
      "staging": {
        "n8n_host": "https://staging.app.n8n.cloud",
        "n8n_api_key": "staging_key_here"
      },
      "development": {
        "n8n_host": "http://localhost:5678",
        "n8n_api_key": "dev_key_here"
      }
    },
    "defaultEnv": "production"
  }
  EOF
  ```
- [ ] Configuration structure explained:
  - `environments` - Object containing instance configs
  - Environment keys - Custom names (production, staging, etc.)
  - `n8n_host` - Base URL for each instance
  - `n8n_api_key` - API key for each instance
  - `defaultEnv` - Default instance when not specified
- [ ] Using instances in tools:
  ```javascript
  // Default instance
  list_workflows()

  // Specific instance
  list_workflows({ instance: "staging" })
  ```
- [ ] Verification for each instance

**AC4: Advanced Configuration**
- [ ] Custom MCP port setup:
  ```bash
  MCP_PORT=8080  # .env file
  # OR
  export MCP_PORT=8080  # environment variable
  ```
  - Port selection guidelines
  - Firewall considerations
  - Port conflict resolution
- [ ] Debug mode configuration:
  ```bash
  DEBUG=true
  ```
  - When to enable debug mode
  - Log output location
  - Performance impact warning
- [ ] Network configuration:
  - Localhost vs. network access
  - Firewall rules (if needed)
  - Proxy configuration (if behind corporate proxy)
- [ ] Security best practices:
  - Never commit .env or .config.json to git
  - Use environment-specific keys
  - Rotate API keys regularly
  - Restrict API key permissions in n8n

**AC5: Configuration Validation**
- [ ] Health check verification:
  ```bash
  # Start the server
  npm start
  # OR (if installed globally)
  mcp-n8n-workflow-builder

  # Check health endpoint
  curl http://localhost:3456/health

  # Expected response:
  # {"status":"ok","version":"0.9.1"}
  ```
- [ ] Connection test to n8n:
  ```bash
  # Test basic connectivity
  curl -X GET \
    'https://your-instance.app.n8n.cloud/api/v1/workflows' \
    -H 'X-N8N-API-KEY: your_api_key_here' \
    -H 'Accept: application/json'
  ```
- [ ] Common issues troubleshooting:
  1. Server won't start → port already in use
  2. Health check fails → server not running
  3. API key invalid → regenerate in n8n
  4. URL format wrong → check URL normalization
  5. Network timeout → firewall/proxy issues
  6. SSL certificate errors → self-signed cert handling

**AC6: Quick Reference**
- [ ] Configuration comparison table:
  | Feature | .env (Single) | .config.json (Multi) |
  |---------|---------------|----------------------|
  | Setup complexity | Simple | Moderate |
  | Multiple instances | No | Yes |
  | Environment switching | Manual | Automatic |
  | Recommended for | Personal use | Teams/Multiple envs |
- [ ] Configuration template files provided for download
- [ ] Cheat sheet with common commands

---

## Technical Implementation Notes

### Documentation Structure

```markdown
# Configuration Setup Guide

## Getting Your n8n Credentials

### Finding Your n8n Host URL
- n8n Cloud instances
- Self-hosted instances
- URL format examples

### Generating n8n API Key
- Step-by-step with screenshots
- Permissions explanation
- Security considerations

## Configuration Methods

### Method 1: Single-Instance (.env)

#### When to Use
- Decision guide
- Use cases

#### Setup Steps
- Create .env file
- Configure variables
- Verification

#### Environment Variables
- Variable explanations
- Alternative methods

### Method 2: Multi-Instance (.config.json)

#### When to Use
- Decision guide
- Use cases

#### Setup Steps
- Create .config.json
- Configure environments
- Set default instance
- Verification

#### Using Instances
- Default instance usage
- Specific instance selection
- Instance list command

## Advanced Configuration

### Custom MCP Port
- Port configuration
- Firewall considerations

### Debug Mode
- Enabling debug logs
- Output location
- Performance notes

### Network Configuration
- Access control
- Firewall rules
- Proxy setup

### Security Best Practices
- Key storage
- .gitignore setup
- Key rotation
- Permission restrictions

## Configuration Validation

### Health Check
- Start server
- Check endpoint
- Expected responses

### Connection Testing
- Test n8n API
- Verify credentials
- Network connectivity

### Troubleshooting
- Common issues
- Solutions
- Prevention tips

## Quick Reference

### Comparison Table
### Template Files
### Command Cheat Sheet

## Next Steps
- Claude Desktop Integration →
- Creating Your First Workflow →
```

### Content Sources

**Primary References:**
- `/README.md` configuration section
- `/src/config/configLoader.ts` for config loading logic
- `/src/services/environmentManager.ts` for multi-instance management
- `/examples/.env.example` (to be created)
- `/examples/.config.json.example` (to be created)
- `/.gitignore` for security best practices

### Screenshots Needed

1. **n8n UI:** Settings → API page
2. **n8n UI:** API key creation dialog
3. **n8n UI:** API key copied confirmation
4. **Terminal:** Health check successful response
5. **Terminal:** Configuration validation output
6. **Diagram:** Configuration priority flowchart (.config.json vs .env vs env vars)

---

## Dependencies

### Upstream Dependencies
- **Story 3.1** (NPM Installation) OR **Story 3.2** (Manual Installation) must be complete

### Downstream Dependencies
- **Story 3.4** (Claude Desktop Integration) needs configuration complete
- **Story 3.5** (First Workflow Tutorial) assumes server is configured
- **Epic 4 All Stories** assume basic configuration is done

### Related Stories
- **Epic 5 Story 5.1** (Multi-Instance Architecture) - deeper dive into architecture
- **Epic 5 Story 5.3** (Environment Management) - advanced instance switching
- **Epic 8 Story 8.1** (Common Issues) - troubleshooting reference

---

## Definition of Done

### Content Checklist
- [ ] n8n credentials retrieval documented with screenshots
- [ ] Single-instance configuration fully documented
- [ ] Multi-instance configuration fully documented
- [ ] Advanced configuration options covered
- [ ] Configuration validation steps provided
- [ ] Troubleshooting section complete
- [ ] Quick reference materials created

### Quality Checklist
- [ ] All configuration methods tested on 3 platforms
- [ ] Screenshots captured from actual n8n UI (version 1.82.3)
- [ ] Example files created and validated
- [ ] Security best practices reviewed by Security Agent
- [ ] Markdown formatting validated
- [ ] Internal links working

### Review Checklist
- [ ] Peer review by Dev Agent
- [ ] Security review by Security Agent
- [ ] Editor review for clarity
- [ ] User testing on clean setup
- [ ] QA Agent validation

---

## Estimation

**Effort:** 5 story points (3-4 hours)

**Breakdown:**
- n8n credentials section with screenshots: 45 minutes
- Single-instance configuration: 30 minutes
- Multi-instance configuration: 60 minutes
- Advanced configuration: 45 minutes
- Validation and troubleshooting: 45 minutes
- Quick reference and templates: 30 minutes

**Page Count:** 6-8 pages

---

## Notes

### Critical Success Factors
- Clear decision guide: when to use single vs. multi-instance
- Security warnings prominently displayed
- URL normalization clearly explained (Epic 1 feature)
- Example files provided for copy-paste

### Security Considerations
- API keys are sensitive credentials
- .env and .config.json must be in .gitignore
- Recommend environment-specific keys (not sharing prod key)
- API key rotation guidance

### Common User Mistakes to Address
1. Including `/api/v1` in N8N_HOST (Epic 1 auto-appends it)
2. Committing .env or .config.json to git
3. Using production API key in development
4. Wrong API key format or permissions
5. Port conflicts with other services

---

## Example Files to Create

### `.env.example`
```bash
# n8n Instance Configuration
N8N_HOST=https://your-instance.app.n8n.cloud
N8N_API_KEY=your_api_key_here

# MCP Server Configuration
MCP_PORT=3456
DEBUG=false
```

### `.config.json.example`
```json
{
  "environments": {
    "production": {
      "n8n_host": "https://prod.app.n8n.cloud",
      "n8n_api_key": "your_production_api_key"
    },
    "staging": {
      "n8n_host": "https://staging.app.n8n.cloud",
      "n8n_api_key": "your_staging_api_key"
    },
    "development": {
      "n8n_host": "http://localhost:5678",
      "n8n_api_key": "your_development_api_key"
    }
  },
  "defaultEnv": "production"
}
```

---

**Story Owner:** Technical Writer (Scribe Persona)
**Reviewers:** Dev Agent, Security Agent, QA Agent
**Target Milestone:** Epic 3 - Phase 1 (Stories 3.1-3.3)
