# Story 5.1: Multi-Instance Configuration System

**Epic:** Epic 5 - Multi-Instance Architecture
**Story Points:** 8
**Priority:** High
**Status:** Completed
**Estimated Page Count:** 14-18 pages

---

## User Story

**As a** developer managing multiple n8n environments (production, staging, development)
**I want** a unified configuration system that supports multiple instances
**So that** I can manage different n8n environments from a single MCP server installation

---

## Story Description

### Current System

The n8n MCP server originally supported single-instance configuration through `.env` files:

```bash
N8N_HOST=https://n8n.example.com
N8N_API_KEY=your_api_key_here
```

**Limitations:**
- Only one n8n instance per MCP server installation
- No environment separation (production vs staging vs development)
- Requires multiple MCP server installations for multiple instances
- Configuration changes require server restart
- No default environment concept

### Enhancement

Implement multi-instance configuration system that:
- Supports multiple named environments in single `.config.json` file
- Maintains backward compatibility with `.env` single-instance setup
- Provides default environment fallback
- Enables instance-specific routing for all MCP tools
- Validates configuration on server startup
- Supports environment-specific API key management

**Configuration Priority:**
1. `.config.json` (multi-instance) - Primary
2. `.env` (single-instance) - Fallback for backward compatibility

### Context from Previous Epics

**Epic 1 (URL Configuration):**
- URL normalization applies to all instances in multi-instance setup
- Each instance validates `/api/v1/` suffix removal independently

**Epic 2 (API Implementation):**
- All 23 API methods support optional `instance` parameter
- Performance optimizations apply per-instance

**Epic 4 (Tools Reference):**
- All 17 MCP tools document multi-instance usage patterns
- Resources support `?instance=name` query parameter

---

## Acceptance Criteria

### AC1: Multi-Instance Configuration File Format
**Given** a developer with multiple n8n environments
**When** they create a `.config.json` file
**Then** they should use this structure:

#### 1.1 Configuration Schema

**File:** `.config.json` (root directory)

```json
{
  "environments": {
    "production": {
      "n8n_host": "https://prod.app.n8n.cloud",
      "n8n_api_key": "n8n_api_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    },
    "staging": {
      "n8n_host": "https://staging.app.n8n.cloud",
      "n8n_api_key": "n8n_api_yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy"
    },
    "development": {
      "n8n_host": "http://localhost:5678",
      "n8n_api_key": "n8n_api_zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz"
    }
  },
  "defaultEnv": "staging"
}
```

**TypeScript Interface:**
```typescript
interface EnvironmentConfig {
  n8n_host: string;
  n8n_api_key: string;
}

interface MultiInstanceConfig {
  environments: {
    [key: string]: EnvironmentConfig;
  };
  defaultEnv: string;
}
```

#### 1.2 Configuration Rules

**Environment Names:**
- **Allowed Characters:** Alphanumeric, hyphens, underscores (`[a-zA-Z0-9_-]+`)
- **Case Sensitive:** Yes (`Production` ≠ `production`)
- **Reserved Names:** None (any string allowed)
- **Examples:** `production`, `prod`, `staging-us-east`, `dev_local`, `test-123`

**Environment Fields:**
- `n8n_host` (required): Base n8n instance URL without `/api/v1/` suffix
- `n8n_api_key` (required): n8n API key for the instance
- **Validation:** Both fields must be non-empty strings

**Default Environment:**
- `defaultEnv` (required): Must match one of the environment names
- Used when no `instance` parameter provided in tool calls
- **Best Practice:** Set to safest environment (e.g., `staging` or `development`)

**Example with Comments:**
```jsonc
{
  "environments": {
    // Production - US Region
    "production-us": {
      "n8n_host": "https://us-prod.n8n.cloud",
      "n8n_api_key": "n8n_api_prod_us_key"
    },

    // Production - EU Region
    "production-eu": {
      "n8n_host": "https://eu-prod.n8n.cloud",
      "n8n_api_key": "n8n_api_prod_eu_key"
    },

    // Staging Environment
    "staging": {
      "n8n_host": "https://staging.n8n.cloud",
      "n8n_api_key": "n8n_api_staging_key"
    },

    // Local Development
    "local": {
      "n8n_host": "http://localhost:5678",
      "n8n_api_key": "n8n_api_local_key"
    }
  },

  // Default to staging for safety
  "defaultEnv": "staging"
}
```

#### 1.3 Validation Requirements

**Startup Validation:**
```typescript
class ConfigValidator {
  static validate(config: MultiInstanceConfig): void {
    // 1. Validate structure
    if (!config.environments || typeof config.environments !== 'object') {
      throw new Error('Configuration must have "environments" object');
    }

    if (!config.defaultEnv || typeof config.defaultEnv !== 'string') {
      throw new Error('Configuration must have "defaultEnv" string');
    }

    // 2. Validate at least one environment
    const envNames = Object.keys(config.environments);
    if (envNames.length === 0) {
      throw new Error('Configuration must have at least one environment');
    }

    // 3. Validate default environment exists
    if (!config.environments[config.defaultEnv]) {
      throw new Error(
        `Default environment "${config.defaultEnv}" not found in environments. ` +
        `Available: ${envNames.join(', ')}`
      );
    }

    // 4. Validate each environment
    for (const [name, env] of Object.entries(config.environments)) {
      // Check required fields
      if (!env.n8n_host) {
        throw new Error(`Environment "${name}" missing required field: n8n_host`);
      }
      if (!env.n8n_api_key) {
        throw new Error(`Environment "${name}" missing required field: n8n_api_key`);
      }

      // Validate URL format (from Epic 1)
      if (env.n8n_host.includes('/api/v1')) {
        throw new Error(
          `Environment "${name}": n8n_host must not include /api/v1 suffix. ` +
          `Use base URL only (e.g., https://n8n.example.com)`
        );
      }

      if (!env.n8n_host.startsWith('http://') && !env.n8n_host.startsWith('https://')) {
        throw new Error(
          `Environment "${name}": n8n_host must include protocol (http:// or https://)`
        );
      }

      // Warn about localhost in production default
      if (config.defaultEnv === name && env.n8n_host.includes('localhost')) {
        console.warn(
          `⚠️  Default environment "${name}" uses localhost. ` +
          `Consider using staging/development as default.`
        );
      }
    }

    console.log(`✅ Configuration validated: ${envNames.length} environments`);
    console.log(`   Default: ${config.defaultEnv}`);
    console.log(`   Available: ${envNames.join(', ')}`);
  }
}
```

### AC2: Backward Compatibility with .env
**Given** an existing single-instance `.env` configuration
**When** the server starts without `.config.json`
**Then** it should fall back to `.env` format:

#### 2.1 .env Format Support

**File:** `.env` (root directory)

```bash
N8N_HOST=https://n8n.example.com
N8N_API_KEY=n8n_api_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Priority Logic:**
```typescript
class ConfigLoader {
  static load(): MultiInstanceConfig | SingleInstanceConfig {
    // Priority 1: Check for .config.json
    if (fs.existsSync('.config.json')) {
      console.log('Loading multi-instance configuration from .config.json');
      const config = JSON.parse(fs.readFileSync('.config.json', 'utf-8'));
      ConfigValidator.validate(config);
      return config;
    }

    // Priority 2: Check for .env
    if (fs.existsSync('.env')) {
      console.log('Loading single-instance configuration from .env');
      return this.loadEnvFile();
    }

    throw new Error(
      'No configuration found. Please create .config.json or .env file. ' +
      'See documentation for setup instructions.'
    );
  }

  private static loadEnvFile(): SingleInstanceConfig {
    const dotenv = require('dotenv');
    dotenv.config();

    const n8n_host = process.env.N8N_HOST;
    const n8n_api_key = process.env.N8N_API_KEY;

    if (!n8n_host || !n8n_api_key) {
      throw new Error(
        'Invalid .env configuration. Required: N8N_HOST, N8N_API_KEY'
      );
    }

    // Validate URL format (Epic 1)
    if (n8n_host.includes('/api/v1')) {
      throw new Error(
        'N8N_HOST must not include /api/v1 suffix. Use base URL only.'
      );
    }

    return {
      type: 'single-instance',
      n8n_host,
      n8n_api_key
    };
  }
}
```

#### 2.2 Migration Guide

**From .env to .config.json:**
```bash
# Current .env file
N8N_HOST=https://n8n.example.com
N8N_API_KEY=n8n_api_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Convert to .config.json
cat > .config.json << 'EOF'
{
  "environments": {
    "production": {
      "n8n_host": "https://n8n.example.com",
      "n8n_api_key": "n8n_api_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    }
  },
  "defaultEnv": "production"
}
EOF

# Remove .env file (optional, but recommended)
rm .env
```

**Migration Script:**
```typescript
// migrate-to-multi-instance.ts
import * as fs from 'fs';
import * as dotenv from 'dotenv';

function migrateToMultiInstance(): void {
  // Check for .env
  if (!fs.existsSync('.env')) {
    console.error('No .env file found');
    return;
  }

  // Load .env
  dotenv.config();
  const n8n_host = process.env.N8N_HOST;
  const n8n_api_key = process.env.N8N_API_KEY;

  if (!n8n_host || !n8n_api_key) {
    console.error('Invalid .env: missing N8N_HOST or N8N_API_KEY');
    return;
  }

  // Create .config.json
  const config = {
    environments: {
      production: {
        n8n_host,
        n8n_api_key
      }
    },
    defaultEnv: 'production'
  };

  fs.writeFileSync('.config.json', JSON.stringify(config, null, 2));
  console.log('✅ Created .config.json from .env');
  console.log('   You can now add more environments to .config.json');
  console.log('   Consider removing .env file');
}

migrateToMultiInstance();
```

### AC3: Configuration Loading and Caching
**Given** a multi-instance configuration
**When** the server initializes
**Then** it should load and cache configuration:

#### 3.1 ConfigLoader Implementation

**File:** `src/config/configLoader.ts`

```typescript
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

export interface EnvironmentConfig {
  n8n_host: string;
  n8n_api_key: string;
}

export interface MultiInstanceConfig {
  environments: {
    [key: string]: EnvironmentConfig;
  };
  defaultEnv: string;
}

export interface SingleInstanceConfig {
  type: 'single-instance';
  n8n_host: string;
  n8n_api_key: string;
}

export type Config = MultiInstanceConfig | SingleInstanceConfig;

export class ConfigLoader {
  private static instance: ConfigLoader;
  private config: Config;

  private constructor() {
    this.config = this.loadConfiguration();
  }

  public static getInstance(): ConfigLoader {
    if (!ConfigLoader.instance) {
      ConfigLoader.instance = new ConfigLoader();
    }
    return ConfigLoader.instance;
  }

  private loadConfiguration(): Config {
    const configPath = path.join(process.cwd(), '.config.json');
    const envPath = path.join(process.cwd(), '.env');

    // Priority 1: .config.json
    if (fs.existsSync(configPath)) {
      return this.loadMultiInstanceConfig(configPath);
    }

    // Priority 2: .env
    if (fs.existsSync(envPath)) {
      return this.loadSingleInstanceConfig(envPath);
    }

    throw new Error(
      'No configuration found. Please create one of:\n' +
      '  1. .config.json (multi-instance, recommended)\n' +
      '  2. .env (single-instance, backward compatibility)\n\n' +
      'See documentation: https://github.com/your-org/mcp-n8n-workflow-builder#configuration'
    );
  }

  private loadMultiInstanceConfig(configPath: string): MultiInstanceConfig {
    try {
      const rawConfig = fs.readFileSync(configPath, 'utf-8');
      const config = JSON.parse(rawConfig) as MultiInstanceConfig;

      // Validate configuration
      this.validateMultiInstanceConfig(config);

      console.error('[ConfigLoader] Multi-instance configuration loaded');
      console.error(`  Environments: ${Object.keys(config.environments).join(', ')}`);
      console.error(`  Default: ${config.defaultEnv}`);

      return config;
    } catch (error) {
      throw new Error(
        `Failed to load .config.json: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private loadSingleInstanceConfig(envPath: string): SingleInstanceConfig {
    dotenv.config({ path: envPath });

    const n8n_host = process.env.N8N_HOST;
    const n8n_api_key = process.env.N8N_API_KEY;

    if (!n8n_host || !n8n_api_key) {
      throw new Error(
        'Invalid .env configuration. Required variables:\n' +
        '  - N8N_HOST\n' +
        '  - N8N_API_KEY'
      );
    }

    // Validate URL (Epic 1)
    if (n8n_host.endsWith('/api/v1/') || n8n_host.endsWith('/api/v1')) {
      throw new Error(
        'N8N_HOST must not include /api/v1 suffix.\n' +
        'Use base URL only (e.g., https://n8n.example.com)'
      );
    }

    console.error('[ConfigLoader] Single-instance configuration loaded (.env)');
    console.error(`  Host: ${n8n_host}`);

    return {
      type: 'single-instance',
      n8n_host,
      n8n_api_key
    };
  }

  private validateMultiInstanceConfig(config: MultiInstanceConfig): void {
    // Validate structure
    if (!config.environments || typeof config.environments !== 'object') {
      throw new Error('Configuration must have "environments" object');
    }

    if (!config.defaultEnv || typeof config.defaultEnv !== 'string') {
      throw new Error('Configuration must have "defaultEnv" string');
    }

    // Validate at least one environment
    const envNames = Object.keys(config.environments);
    if (envNames.length === 0) {
      throw new Error('Configuration must have at least one environment');
    }

    // Validate default environment exists
    if (!config.environments[config.defaultEnv]) {
      throw new Error(
        `Default environment "${config.defaultEnv}" not found. ` +
        `Available: ${envNames.join(', ')}`
      );
    }

    // Validate each environment
    for (const [name, env] of Object.entries(config.environments)) {
      if (!env.n8n_host) {
        throw new Error(`Environment "${name}" missing: n8n_host`);
      }
      if (!env.n8n_api_key) {
        throw new Error(`Environment "${name}" missing: n8n_api_key`);
      }

      // Validate URL format (Epic 1)
      if (env.n8n_host.includes('/api/v1')) {
        throw new Error(
          `Environment "${name}": Remove /api/v1 from n8n_host. ` +
          `Use base URL only.`
        );
      }

      if (!env.n8n_host.startsWith('http://') && !env.n8n_host.startsWith('https://')) {
        throw new Error(
          `Environment "${name}": n8n_host must include protocol ` +
          `(http:// or https://)`
        );
      }
    }
  }

  public getConfig(): Config {
    return this.config;
  }

  public isMultiInstance(): boolean {
    return 'environments' in this.config;
  }

  public listEnvironments(): string[] {
    if (this.isMultiInstance()) {
      return Object.keys((this.config as MultiInstanceConfig).environments);
    }
    return ['default'];
  }

  public getDefaultEnvironment(): string {
    if (this.isMultiInstance()) {
      return (this.config as MultiInstanceConfig).defaultEnv;
    }
    return 'default';
  }

  public getEnvironmentConfig(name?: string): EnvironmentConfig {
    if (!this.isMultiInstance()) {
      const singleConfig = this.config as SingleInstanceConfig;
      return {
        n8n_host: singleConfig.n8n_host,
        n8n_api_key: singleConfig.n8n_api_key
      };
    }

    const multiConfig = this.config as MultiInstanceConfig;
    const envName = name || multiConfig.defaultEnv;

    if (!multiConfig.environments[envName]) {
      throw new Error(
        `Instance "${envName}" not found. ` +
        `Available: ${Object.keys(multiConfig.environments).join(', ')}`
      );
    }

    return multiConfig.environments[envName];
  }
}
```

#### 3.2 Singleton Pattern

**Purpose:** Single source of truth for configuration across entire application

**Benefits:**
- Configuration loaded once on startup
- Consistent configuration access
- Memory efficient (single instance)
- Thread-safe configuration reads

**Usage Pattern:**
```typescript
// Anywhere in the application
import { ConfigLoader } from './config/configLoader';

const loader = ConfigLoader.getInstance(); // Always same instance

// Check configuration type
if (loader.isMultiInstance()) {
  console.log('Running in multi-instance mode');
  console.log('Environments:', loader.listEnvironments());
}

// Get environment configuration
const prodConfig = loader.getEnvironmentConfig('production');
console.log('Production host:', prodConfig.n8n_host);

// Get default environment
const defaultEnv = loader.getDefaultEnvironment();
const defaultConfig = loader.getEnvironmentConfig(); // Uses default
```

### AC4: Environment Variable Override Support
**Given** a deployment scenario requiring environment variable overrides
**When** environment variables are set
**Then** they should override `.config.json` values:

#### 4.1 Override Pattern

**Priority (Highest to Lowest):**
1. Environment variables (runtime override)
2. `.config.json` (multi-instance configuration)
3. `.env` (single-instance fallback)

**Environment Variable Format:**
```bash
# Override specific environment
N8N_PRODUCTION_HOST=https://prod-override.n8n.cloud
N8N_PRODUCTION_API_KEY=override_key_here

# Override staging
N8N_STAGING_HOST=https://staging-override.n8n.cloud
N8N_STAGING_API_KEY=staging_override_key

# Override default environment
N8N_DEFAULT_ENV=staging
```

**Implementation:**
```typescript
private loadMultiInstanceConfig(configPath: string): MultiInstanceConfig {
  const rawConfig = fs.readFileSync(configPath, 'utf-8');
  const config = JSON.parse(rawConfig) as MultiInstanceConfig;

  // Apply environment variable overrides
  for (const envName of Object.keys(config.environments)) {
    const hostVar = `N8N_${envName.toUpperCase().replace(/-/g, '_')}_HOST`;
    const keyVar = `N8N_${envName.toUpperCase().replace(/-/g, '_')}_API_KEY`;

    if (process.env[hostVar]) {
      console.error(`  Override: ${envName}.n8n_host from ${hostVar}`);
      config.environments[envName].n8n_host = process.env[hostVar]!;
    }

    if (process.env[keyVar]) {
      console.error(`  Override: ${envName}.n8n_api_key from ${keyVar}`);
      config.environments[envName].n8n_api_key = process.env[keyVar]!;
    }
  }

  // Override default environment
  if (process.env.N8N_DEFAULT_ENV) {
    console.error(`  Override: defaultEnv from N8N_DEFAULT_ENV`);
    config.defaultEnv = process.env.N8N_DEFAULT_ENV;
  }

  this.validateMultiInstanceConfig(config);
  return config;
}
```

**Use Case - Docker Deployment:**
```yaml
# docker-compose.yml
services:
  mcp-n8n:
    image: mcp-n8n-workflow-builder
    environment:
      # Override production to use Docker network
      - N8N_PRODUCTION_HOST=http://n8n-prod:5678
      - N8N_PRODUCTION_API_KEY=${PROD_API_KEY}

      # Override staging
      - N8N_STAGING_HOST=http://n8n-staging:5678
      - N8N_STAGING_API_KEY=${STAGING_API_KEY}

      # Set default to staging in Docker
      - N8N_DEFAULT_ENV=staging
    volumes:
      - ./config.json:/app/.config.json
```

**Use Case - CI/CD Pipeline:**
```bash
#!/bin/bash
# deploy.sh

# Set environment-specific overrides
export N8N_PRODUCTION_HOST="https://prod.n8n.cloud"
export N8N_PRODUCTION_API_KEY="${PROD_API_KEY_SECRET}"
export N8N_DEFAULT_ENV="production"

# Start MCP server (uses overrides)
npm start
```

### AC5: Configuration Security Best Practices
**Given** sensitive API keys in configuration
**When** setting up multi-instance configuration
**Then** developers should follow security best practices:

#### 5.1 Security Checklist

**✅ DO:**
1. **Keep .config.json out of version control:**
   ```bash
   # .gitignore
   .config.json
   .env
   *.local.json
   ```

2. **Use environment variables for secrets:**
   ```json
   {
     "environments": {
       "production": {
         "n8n_host": "${PROD_HOST}",
         "n8n_api_key": "${PROD_API_KEY}"
       }
     }
   }
   ```

3. **Store secrets in secure vault:**
   - AWS Secrets Manager
   - HashiCorp Vault
   - Azure Key Vault
   - GitHub Secrets (CI/CD)

4. **Use separate API keys per environment:**
   - Each environment has unique API key
   - Easy to rotate keys per environment
   - Limit blast radius if key compromised

5. **Restrict file permissions:**
   ```bash
   # Only owner can read/write
   chmod 600 .config.json
   ```

6. **Template for version control:**
   ```json
   // .config.template.json (safe to commit)
   {
     "environments": {
       "production": {
         "n8n_host": "https://YOUR_PRODUCTION_HOST",
         "n8n_api_key": "YOUR_PRODUCTION_API_KEY"
       },
       "staging": {
         "n8n_host": "https://YOUR_STAGING_HOST",
         "n8n_api_key": "YOUR_STAGING_API_KEY"
       }
     },
     "defaultEnv": "staging"
   }
   ```

**❌ DON'T:**
1. **Commit .config.json with real keys**
2. **Use same API key for all environments**
3. **Store API keys in plain text in CI/CD logs**
4. **Share .config.json files via email/chat**
5. **Use production as default environment**

#### 5.2 Secret Management Pattern

**Using Environment Variables:**
```typescript
// scripts/load-secrets.ts
import * as fs from 'fs';

interface SecretsMap {
  [key: string]: string;
}

function loadSecretsFromVault(): SecretsMap {
  // Example: Load from AWS Secrets Manager
  // const secrets = await secretsManager.getSecretValue(...);

  return {
    PROD_HOST: process.env.PROD_HOST || '',
    PROD_API_KEY: process.env.PROD_API_KEY || '',
    STAGING_HOST: process.env.STAGING_HOST || '',
    STAGING_API_KEY: process.env.STAGING_API_KEY || ''
  };
}

function generateConfigFromSecrets(secrets: SecretsMap): void {
  const config = {
    environments: {
      production: {
        n8n_host: secrets.PROD_HOST,
        n8n_api_key: secrets.PROD_API_KEY
      },
      staging: {
        n8n_host: secrets.STAGING_HOST,
        n8n_api_key: secrets.STAGING_API_KEY
      }
    },
    defaultEnv: 'staging'
  };

  fs.writeFileSync('.config.json', JSON.stringify(config, null, 2));
  console.log('✅ Configuration generated from secrets');
}

// Usage in deployment
const secrets = loadSecretsFromVault();
generateConfigFromSecrets(secrets);
```

**GitHub Actions Example:**
```yaml
# .github/workflows/deploy.yml
name: Deploy MCP Server

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Generate configuration
        env:
          PROD_HOST: ${{ secrets.PROD_N8N_HOST }}
          PROD_API_KEY: ${{ secrets.PROD_N8N_API_KEY }}
          STAGING_HOST: ${{ secrets.STAGING_N8N_HOST }}
          STAGING_API_KEY: ${{ secrets.STAGING_N8N_API_KEY }}
        run: |
          cat > .config.json << EOF
          {
            "environments": {
              "production": {
                "n8n_host": "${PROD_HOST}",
                "n8n_api_key": "${PROD_API_KEY}"
              },
              "staging": {
                "n8n_host": "${STAGING_HOST}",
                "n8n_api_key": "${STAGING_API_KEY}"
              }
            },
            "defaultEnv": "staging"
          }
          EOF

      - name: Deploy
        run: npm run deploy
```

---

## Technical Implementation Notes

### Implementation Files

**Created Files:**
- `src/config/configLoader.ts` - Configuration loading and validation
- `.config.template.json` - Template for developers
- `scripts/migrate-to-multi-instance.ts` - Migration utility

**Modified Files:**
- `src/index.ts` - Use ConfigLoader on startup
- `README.md` - Document multi-instance setup
- `.gitignore` - Add .config.json

### Implementation Sequence

1. **Create ConfigLoader class** with singleton pattern
2. **Implement validation** for multi-instance config
3. **Add backward compatibility** for .env
4. **Add environment variable overrides** support
5. **Create migration script** from .env to .config.json
6. **Update documentation** with examples
7. **Add security guidelines** to README

### Error Handling

**Configuration Errors:**
```typescript
try {
  const loader = ConfigLoader.getInstance();
} catch (error) {
  console.error('Configuration error:', error.message);
  console.error('\nSetup instructions:');
  console.error('  1. Create .config.json (recommended)');
  console.error('  2. Or create .env (single-instance)');
  console.error('  See: https://github.com/.../README.md#configuration');
  process.exit(1);
}
```

**Runtime Validation:**
```typescript
// Validate instance before API call
const loader = ConfigLoader.getInstance();
const instanceName = params.instance || loader.getDefaultEnvironment();

try {
  const config = loader.getEnvironmentConfig(instanceName);
  // Proceed with API call
} catch (error) {
  throw new Error(
    `Invalid instance "${instanceName}". ` +
    `Available: ${loader.listEnvironments().join(', ')}`
  );
}
```

---

## Dependencies

### Upstream Dependencies
- Epic 1 Story 1.1 (URL Configuration) - URL validation logic reused
- None (foundational feature)

### Downstream Dependencies
- **Story 5.2** (EnvironmentManager) - Uses ConfigLoader
- **Story 5.3** (Instance Routing) - Uses environment configuration
- **Story 5.4** (Testing) - Validates multi-instance behavior
- All Epic 4 Stories - Document instance parameter usage

### External Dependencies
```json
{
  "dependencies": {
    "dotenv": "^16.0.0"
  }
}
```

---

## Definition of Done

### Implementation Completeness
- [x] ConfigLoader class implemented with singleton pattern
- [x] Multi-instance .config.json support
- [x] Backward compatibility with .env
- [x] Configuration validation on startup
- [x] Environment variable override support
- [x] Migration script from .env to .config.json

### Documentation
- [x] Configuration format documented
- [x] Migration guide created
- [x] Security best practices documented
- [x] Template file provided (.config.template.json)
- [x] Examples for Docker, CI/CD deployments

### Testing
- [ ] Unit tests for ConfigLoader
- [ ] Validation tests for invalid configurations
- [ ] .env fallback tests
- [ ] Environment variable override tests
- [ ] Migration script tests

### Code Quality
- [x] TypeScript interfaces defined
- [x] Error messages are clear and actionable
- [x] Console logging uses stderr (MCP protocol compliance)
- [x] Singleton pattern correctly implemented

---

## Estimation Breakdown

**Story Points:** 8

**Effort Distribution:**
- ConfigLoader Implementation: 2 SP
- Validation Logic: 1.5 SP
- Backward Compatibility (.env): 1 SP
- Environment Variable Overrides: 1 SP
- Migration Script: 0.5 SP
- Documentation & Examples: 1.5 SP
- Testing: 0.5 SP

**Page Count:** 14-18 pages
- Configuration Format: 2-3 pages
- ConfigLoader Implementation: 3-4 pages
- Validation & Error Handling: 2-3 pages
- Security Best Practices: 2-3 pages
- Migration Guide: 2 pages
- Examples & Use Cases: 3-4 pages

**Estimated Duration:** 4-5 days (1 developer)

---

## Notes

### Success Metrics
- 100% of multi-environment teams adopt .config.json
- Zero configuration errors in production deployments
- 90%+ developers use template for initial setup
- Migration from .env takes <5 minutes

### Common Mistakes to Avoid
- ❌ Including /api/v1/ in n8n_host
- ❌ Committing .config.json to version control
- ❌ Using production as defaultEnv
- ❌ Same API key for all environments
- ❌ Not validating configuration on startup

### Best Practices
- ✅ Use staging/development as defaultEnv
- ✅ Separate API keys per environment
- ✅ Store secrets in environment variables
- ✅ Template file in version control
- ✅ Validate configuration on startup

### Related Documentation
- Epic 1 Story 1.1: URL Configuration (validation patterns)
- Story 5.2: EnvironmentManager (uses ConfigLoader)
- Epic 4 All Stories: Instance parameter usage

---

**Status:** Implemented in version 0.8.0
**Related Files:**
- `src/config/configLoader.ts`
- `.config.template.json`
- `docs/multi-instance-architecture.md`
