# Story 5.4: Multi-Instance Testing & Validation

**Epic:** Epic 5 - Multi-Instance Architecture
**Story Points:** 5
**Priority:** Medium
**Status:** Ready for Implementation
**Estimated Page Count:** 9-12 pages

---

## User Story

**As a** developer implementing or deploying the n8n MCP server
**I want** comprehensive testing and validation for multi-instance functionality
**So that** I can verify correct behavior across environments and prevent configuration errors

---

## Story Description

### Current System

With Stories 5.1-5.3 implemented:
- ✅ Multi-instance configuration system (ConfigLoader)
- ✅ Instance management and routing (EnvironmentManager)
- ✅ All 17 tools support instance parameter
- ❌ No automated tests for multi-instance behavior
- ❌ No validation tools for configuration correctness
- ❌ No integration tests across instances

### Enhancement

Implement comprehensive testing and validation suite:
- **Unit Tests:** ConfigLoader, EnvironmentManager, instance routing
- **Integration Tests:** Cross-instance operations, tool routing
- **Validation Tools:** Configuration checker, instance health monitoring
- **Test Utilities:** Mock instances, test harness for development
- **CI/CD Integration:** Automated testing in deployment pipeline

---

## Acceptance Criteria

### AC1: Configuration Validation Tests
**Given** various .config.json scenarios
**When** running configuration validation tests
**Then** they should detect all error conditions:

#### 1.1 Valid Configuration Tests

```typescript
// test/config/valid-config.test.ts
import { ConfigLoader } from '../../src/config/configLoader';
import * as fs from 'fs';
import * as path from 'path';

describe('ConfigLoader - Valid Configurations', () => {
  const testConfigDir = path.join(__dirname, 'fixtures');

  beforeEach(() => {
    // Create test configuration directory
    if (!fs.existsSync(testConfigDir)) {
      fs.mkdirSync(testConfigDir, { recursive: true });
    }
  });

  afterEach(() => {
    // Cleanup test configurations
    if (fs.existsSync(testConfigDir)) {
      fs.rmdirSync(testConfigDir, { recursive: true });
    }
  });

  test('should load valid multi-instance configuration', () => {
    const config = {
      environments: {
        production: {
          n8n_host: 'https://prod.n8n.cloud',
          n8n_api_key: 'prod_key'
        },
        staging: {
          n8n_host: 'https://staging.n8n.cloud',
          n8n_api_key: 'staging_key'
        }
      },
      defaultEnv: 'staging'
    };

    const configPath = path.join(testConfigDir, '.config.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    // Change working directory to test dir
    const originalCwd = process.cwd();
    process.chdir(testConfigDir);

    try {
      const loader = ConfigLoader.getInstance();
      expect(loader.isMultiInstance()).toBe(true);
      expect(loader.listEnvironments()).toEqual(['production', 'staging']);
      expect(loader.getDefaultEnvironment()).toBe('staging');
    } finally {
      process.chdir(originalCwd);
    }
  });

  test('should load valid single-instance .env configuration', () => {
    const envPath = path.join(testConfigDir, '.env');
    fs.writeFileSync(envPath, 'N8N_HOST=https://n8n.example.com\nN8N_API_KEY=test_key');

    const originalCwd = process.cwd();
    process.chdir(testConfigDir);

    try {
      const loader = ConfigLoader.getInstance();
      expect(loader.isMultiInstance()).toBe(false);
      expect(loader.listEnvironments()).toEqual(['default']);

      const config = loader.getEnvironmentConfig();
      expect(config.n8n_host).toBe('https://n8n.example.com');
      expect(config.n8n_api_key).toBe('test_key');
    } finally {
      process.chdir(originalCwd);
    }
  });

  test('should handle environment variable overrides', () => {
    const config = {
      environments: {
        production: {
          n8n_host: 'https://prod.n8n.cloud',
          n8n_api_key: 'original_key'
        }
      },
      defaultEnv: 'production'
    };

    const configPath = path.join(testConfigDir, '.config.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    // Set environment variable override
    process.env.N8N_PRODUCTION_HOST = 'https://override.n8n.cloud';
    process.env.N8N_PRODUCTION_API_KEY = 'override_key';

    const originalCwd = process.cwd();
    process.chdir(testConfigDir);

    try {
      const loader = ConfigLoader.getInstance();
      const prodConfig = loader.getEnvironmentConfig('production');

      expect(prodConfig.n8n_host).toBe('https://override.n8n.cloud');
      expect(prodConfig.n8n_api_key).toBe('override_key');
    } finally {
      process.chdir(originalCwd);
      delete process.env.N8N_PRODUCTION_HOST;
      delete process.env.N8N_PRODUCTION_API_KEY;
    }
  });
});
```

#### 1.2 Invalid Configuration Tests

```typescript
// test/config/invalid-config.test.ts
describe('ConfigLoader - Invalid Configurations', () => {
  test('should throw error for missing configuration', () => {
    const testDir = createEmptyTestDir();

    expect(() => {
      process.chdir(testDir);
      ConfigLoader.getInstance();
    }).toThrow('No configuration found');
  });

  test('should throw error for invalid JSON', () => {
    const configPath = path.join(testDir, '.config.json');
    fs.writeFileSync(configPath, '{ invalid json }');

    expect(() => {
      ConfigLoader.getInstance();
    }).toThrow('Failed to load .config.json');
  });

  test('should throw error for missing environments object', () => {
    const config = {
      defaultEnv: 'production'
      // Missing environments
    };

    writeConfig(config);

    expect(() => {
      ConfigLoader.getInstance();
    }).toThrow('Configuration must have "environments" object');
  });

  test('should throw error for missing defaultEnv', () => {
    const config = {
      environments: {
        production: {
          n8n_host: 'https://prod.n8n.cloud',
          n8n_api_key: 'key'
        }
      }
      // Missing defaultEnv
    };

    writeConfig(config);

    expect(() => {
      ConfigLoader.getInstance();
    }).toThrow('Configuration must have "defaultEnv" string');
  });

  test('should throw error for non-existent default environment', () => {
    const config = {
      environments: {
        production: {
          n8n_host: 'https://prod.n8n.cloud',
          n8n_api_key: 'key'
        }
      },
      defaultEnv: 'staging' // Doesn't exist!
    };

    writeConfig(config);

    expect(() => {
      ConfigLoader.getInstance();
    }).toThrow('Default environment "staging" not found');
  });

  test('should throw error for missing n8n_host', () => {
    const config = {
      environments: {
        production: {
          // Missing n8n_host
          n8n_api_key: 'key'
        }
      },
      defaultEnv: 'production'
    };

    writeConfig(config);

    expect(() => {
      ConfigLoader.getInstance();
    }).toThrow('Environment "production" missing: n8n_host');
  });

  test('should throw error for /api/v1 in URL (Epic 1)', () => {
    const config = {
      environments: {
        production: {
          n8n_host: 'https://prod.n8n.cloud/api/v1/', // Invalid!
          n8n_api_key: 'key'
        }
      },
      defaultEnv: 'production'
    };

    writeConfig(config);

    expect(() => {
      ConfigLoader.getInstance();
    }).toThrow('Remove /api/v1 from n8n_host');
  });

  test('should throw error for missing protocol', () => {
    const config = {
      environments: {
        production: {
          n8n_host: 'prod.n8n.cloud', // Missing https://
          n8n_api_key: 'key'
        }
      },
      defaultEnv: 'production'
    };

    writeConfig(config);

    expect(() => {
      ConfigLoader.getInstance();
    }).toThrow('n8n_host must include protocol');
  });
});
```

### AC2: EnvironmentManager Tests
**Given** EnvironmentManager singleton and caching
**When** running unit tests
**Then** they should verify correct behavior:

#### 2.1 Instance Management Tests

```typescript
// test/services/environment-manager.test.ts
describe('EnvironmentManager', () => {
  let envManager: EnvironmentManager;

  beforeEach(() => {
    // Setup test configuration
    setupMultiInstanceConfig({
      environments: {
        production: {
          n8n_host: 'https://prod.test',
          n8n_api_key: 'prod_key'
        },
        staging: {
          n8n_host: 'https://staging.test',
          n8n_api_key: 'staging_key'
        }
      },
      defaultEnv: 'staging'
    });

    envManager = EnvironmentManager.getInstance();
  });

  afterEach(() => {
    // Clear cache for clean state
    envManager.clearAllCaches();
  });

  test('should return same instance (singleton)', () => {
    const instance1 = EnvironmentManager.getInstance();
    const instance2 = EnvironmentManager.getInstance();

    expect(instance1).toBe(instance2);
  });

  test('should list all environments', () => {
    const environments = envManager.listEnvironments();

    expect(environments).toHaveLength(2);
    expect(environments).toContain('production');
    expect(environments).toContain('staging');
  });

  test('should return correct default environment', () => {
    const defaultEnv = envManager.getDefaultEnvironment();

    expect(defaultEnv).toBe('staging');
  });

  test('should validate existing environment', () => {
    expect(() => {
      envManager.validateEnvironment('production');
    }).not.toThrow();

    expect(() => {
      envManager.validateEnvironment('staging');
    }).not.toThrow();
  });

  test('should throw error for non-existent environment', () => {
    expect(() => {
      envManager.validateEnvironment('nonexistent');
    }).toThrow('Instance "nonexistent" not found');
  });

  test('should cache API instances', () => {
    const api1 = envManager.getApi('production');
    const api2 = envManager.getApi('production');

    // Should return same cached instance
    expect(api1).toBe(api2);
  });

  test('should create separate instances for different environments', () => {
    const prodApi = envManager.getApi('production');
    const stagingApi = envManager.getApi('staging');

    // Should be different instances
    expect(prodApi).not.toBe(stagingApi);
  });

  test('should use default environment when instance not specified', () => {
    const api = envManager.getApi(); // No instance specified

    // Should use staging (default)
    const config = envManager.getEnvironmentConfig('staging');
    expect(api).toBeDefined();
  });

  test('should clear specific instance cache', () => {
    const api1 = envManager.getApi('production');
    envManager.clearCache('production');
    const api2 = envManager.getApi('production');

    // Should be different instances after cache clear
    expect(api1).not.toBe(api2);
  });

  test('should clear all caches', () => {
    const prodApi1 = envManager.getApi('production');
    const stagingApi1 = envManager.getApi('staging');

    envManager.clearAllCaches();

    const prodApi2 = envManager.getApi('production');
    const stagingApi2 = envManager.getApi('staging');

    expect(prodApi1).not.toBe(prodApi2);
    expect(stagingApi1).not.toBe(stagingApi2);
  });

  test('should return correct environment statistics', () => {
    envManager.getApi('production'); // Create cached instance
    envManager.getApi('staging'); // Create cached instance

    const stats = envManager.getStats();

    expect(stats.totalEnvironments).toBe(2);
    expect(stats.cachedInstances).toBe(2);
    expect(stats.defaultEnvironment).toBe('staging');
    expect(stats.environments).toEqual(['production', 'staging']);
  });

  test('should get environment configuration', () => {
    const config = envManager.getEnvironmentConfig('production');

    expect(config.n8n_host).toBe('https://prod.test');
    expect(config.n8n_api_key).toBe('prod_key');
  });

  test('should throw error for invalid environment in getEnvironmentConfig', () => {
    expect(() => {
      envManager.getEnvironmentConfig('invalid');
    }).toThrow('Instance "invalid" not found');
  });
});
```

### AC3: Instance Routing Integration Tests
**Given** all 17 MCP tools with instance routing
**When** running integration tests
**Then** they should verify end-to-end behavior:

#### 3.1 Tool Instance Routing Tests

```typescript
// test/integration/tool-instance-routing.test.ts
describe('Tool Instance Routing Integration', () => {
  let mockProductionApi: jest.Mocked<N8NApiWrapper>;
  let mockStagingApi: jest.Mocked<N8NApiWrapper>;

  beforeEach(() => {
    // Setup mock n8n instances
    mockProductionApi = createMockN8NApi('production');
    mockStagingApi = createMockN8NApi('staging');

    // Setup multi-instance config
    setupMultiInstanceConfig({
      environments: {
        production: {
          n8n_host: 'https://prod.test',
          n8n_api_key: 'prod_key'
        },
        staging: {
          n8n_host: 'https://staging.test',
          n8n_api_key: 'staging_key'
        }
      },
      defaultEnv: 'staging'
    });

    // Mock API instance creation
    jest.spyOn(EnvironmentManager.prototype, 'getApi')
      .mockImplementation((instance?) => {
        if (instance === 'production') return mockProductionApi;
        if (instance === 'staging') return mockStagingApi;
        return mockStagingApi; // Default
      });
  });

  test('list_workflows should route to specified instance', async () => {
    mockProductionApi.listWorkflows.mockResolvedValue({
      data: [{ id: '1', name: 'Production Workflow', active: true }]
    });

    const result = await callMCPTool('list_workflows', {
      instance: 'production'
    });

    expect(mockProductionApi.listWorkflows).toHaveBeenCalled();
    expect(mockStagingApi.listWorkflows).not.toHaveBeenCalled();
    expect(result.data[0].name).toBe('Production Workflow');
  });

  test('list_workflows should use default instance when not specified', async () => {
    mockStagingApi.listWorkflows.mockResolvedValue({
      data: [{ id: '2', name: 'Staging Workflow', active: false }]
    });

    const result = await callMCPTool('list_workflows', {});

    expect(mockStagingApi.listWorkflows).toHaveBeenCalled();
    expect(mockProductionApi.listWorkflows).not.toHaveBeenCalled();
    expect(result.data[0].name).toBe('Staging Workflow');
  });

  test('create_workflow should create in specified instance', async () => {
    mockProductionApi.createWorkflow.mockResolvedValue({
      id: '123',
      name: 'New Workflow',
      active: false,
      nodes: [],
      connections: {}
    });

    const workflow = {
      name: 'New Workflow',
      nodes: [{ name: 'Start', type: 'n8n-nodes-base.start', position: [250, 300] }]
    };

    await callMCPTool('create_workflow', {
      instance: 'production',
      ...workflow
    });

    expect(mockProductionApi.createWorkflow).toHaveBeenCalledWith(workflow);
    expect(mockStagingApi.createWorkflow).not.toHaveBeenCalled();
  });

  test('should throw error for invalid instance', async () => {
    await expect(
      callMCPTool('list_workflows', { instance: 'nonexistent' })
    ).rejects.toThrow('Instance "nonexistent" not found');
  });

  test('cross-instance operations should work independently', async () => {
    // Setup different responses for each instance
    mockProductionApi.listWorkflows.mockResolvedValue({
      data: [{ id: '1', name: 'Production Workflow', active: true }]
    });

    mockStagingApi.listWorkflows.mockResolvedValue({
      data: [{ id: '2', name: 'Staging Workflow', active: false }]
    });

    // Call both instances
    const prodResult = await callMCPTool('list_workflows', {
      instance: 'production'
    });
    const stagingResult = await callMCPTool('list_workflows', {
      instance: 'staging'
    });

    expect(prodResult.data[0].name).toBe('Production Workflow');
    expect(stagingResult.data[0].name).toBe('Staging Workflow');
  });
});
```

#### 3.2 All Tools Instance Routing Test Suite

```typescript
// test/integration/all-tools-instance-routing.test.ts
describe('All Tools Instance Routing', () => {
  const TOOLS_TO_TEST = [
    // Workflow tools
    'list_workflows',
    'get_workflow',
    'create_workflow',
    'update_workflow',
    'delete_workflow',
    'activate_workflow',
    'deactivate_workflow',
    'execute_workflow',

    // Execution tools
    'list_executions',
    'get_execution',
    'delete_execution',
    'retry_execution',

    // Credential tools
    'list_credentials',
    'get_credential',
    'create_credential',
    'delete_credential',
    'get_credential_schema',

    // Tag tools
    'create_tag',
    'get_tags',
    'get_tag',
    'update_tag',
    'delete_tag'
  ];

  test.each(TOOLS_TO_TEST)(
    '%s should accept instance parameter',
    async (toolName) => {
      const mockApi = createMockN8NApi('production');

      // Setup appropriate mock response for tool
      setupMockResponse(mockApi, toolName);

      const result = await callMCPTool(toolName, {
        instance: 'production',
        ...getDefaultParamsForTool(toolName)
      });

      expect(result).toBeDefined();
      expect(mockApi[getApiMethodForTool(toolName)]).toHaveBeenCalled();
    }
  );

  test.each(TOOLS_TO_TEST)(
    '%s should use default instance when not specified',
    async (toolName) => {
      const mockApi = createMockN8NApi('staging');
      setupMockResponse(mockApi, toolName);

      const result = await callMCPTool(toolName, {
        ...getDefaultParamsForTool(toolName)
      });

      expect(result).toBeDefined();
    }
  );
});
```

### AC4: Configuration Validation CLI Tool
**Given** a need to validate configuration before deployment
**When** using validation CLI tool
**Then** it should check all configuration aspects:

#### 4.1 Validation Script

```typescript
// scripts/validate-config.ts
import { ConfigLoader } from '../src/config/configLoader';
import { EnvironmentManager } from '../src/services/environmentManager';
import * as fs from 'fs';
import axios from 'axios';

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  info: string[];
}

async function validateConfiguration(): Promise<ValidationResult> {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    info: []
  };

  console.log('🔍 Validating n8n MCP Server Configuration...\n');

  // Step 1: Check configuration files exist
  const hasConfigJson = fs.existsSync('.config.json');
  const hasEnvFile = fs.existsSync('.env');

  if (!hasConfigJson && !hasEnvFile) {
    result.errors.push('No configuration file found (.config.json or .env)');
    result.valid = false;
    return result;
  }

  if (hasConfigJson) {
    result.info.push('✓ Using .config.json (multi-instance)');
  } else {
    result.warnings.push('Using .env (single-instance, consider migrating to .config.json)');
  }

  // Step 2: Load and validate configuration
  try {
    const configLoader = ConfigLoader.getInstance();

    if (configLoader.isMultiInstance()) {
      const environments = configLoader.listEnvironments();
      result.info.push(`✓ ${environments.length} environment(s) configured: ${environments.join(', ')}`);

      const defaultEnv = configLoader.getDefaultEnvironment();
      result.info.push(`✓ Default environment: ${defaultEnv}`);

      // Check for production as default (warning)
      if (defaultEnv.toLowerCase().includes('prod')) {
        result.warnings.push(
          `Default environment is "${defaultEnv}". ` +
          `Consider using staging/development as default for safety.`
        );
      }
    } else {
      result.info.push('✓ Single-instance configuration loaded');
    }
  } catch (error) {
    result.errors.push(`Configuration validation failed: ${error.message}`);
    result.valid = false;
    return result;
  }

  // Step 3: Test n8n API connectivity
  console.log('\n🔗 Testing n8n API connectivity...\n');

  try {
    const envManager = EnvironmentManager.getInstance();
    const environments = envManager.listEnvironments();

    for (const envName of environments) {
      try {
        const config = envManager.getEnvironmentConfig(envName);

        // Test API connection
        const response = await axios.get(`${config.n8n_host}/api/v1/workflows`, {
          headers: { 'X-N8N-API-KEY': config.n8n_api_key },
          params: { limit: 1 },
          timeout: 5000
        });

        result.info.push(`✓ ${envName}: Connected successfully (${response.status})`);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            result.errors.push(`${envName}: Authentication failed (check API key)`);
            result.valid = false;
          } else if (error.code === 'ECONNREFUSED') {
            result.errors.push(`${envName}: Connection refused (is n8n running?)`);
            result.valid = false;
          } else if (error.code === 'ETIMEDOUT') {
            result.warnings.push(`${envName}: Connection timeout (slow network or n8n overloaded)`);
          } else {
            result.warnings.push(`${envName}: ${error.message}`);
          }
        } else {
          result.warnings.push(`${envName}: Unexpected error - ${error}`);
        }
      }
    }
  } catch (error) {
    result.errors.push(`Connectivity test failed: ${error.message}`);
  }

  // Step 4: Security checks
  console.log('\n🔒 Security checks...\n');

  // Check if .config.json is in .gitignore
  if (hasConfigJson && fs.existsSync('.gitignore')) {
    const gitignore = fs.readFileSync('.gitignore', 'utf-8');
    if (!gitignore.includes('.config.json')) {
      result.warnings.push(
        'Security: .config.json not in .gitignore (add to prevent committing secrets)'
      );
    } else {
      result.info.push('✓ .config.json in .gitignore');
    }
  }

  return result;
}

async function main() {
  const result = await validateConfiguration();

  console.log('\n' + '='.repeat(60));
  console.log('VALIDATION RESULTS');
  console.log('='.repeat(60) + '\n');

  if (result.info.length > 0) {
    console.log('ℹ️  INFO:');
    result.info.forEach(msg => console.log(`   ${msg}`));
    console.log();
  }

  if (result.warnings.length > 0) {
    console.log('⚠️  WARNINGS:');
    result.warnings.forEach(msg => console.log(`   ${msg}`));
    console.log();
  }

  if (result.errors.length > 0) {
    console.log('❌ ERRORS:');
    result.errors.forEach(msg => console.log(`   ${msg}`));
    console.log();
  }

  if (result.valid) {
    console.log('✅ Configuration is valid and ready for use\n');
    process.exit(0);
  } else {
    console.log('❌ Configuration has errors - please fix before deploying\n');
    process.exit(1);
  }
}

main();
```

**Usage:**
```bash
# Validate configuration
npm run validate-config

# Output example:
🔍 Validating n8n MCP Server Configuration...

✓ Using .config.json (multi-instance)
✓ 3 environment(s) configured: production, staging, development
✓ Default environment: staging

🔗 Testing n8n API connectivity...

✓ production: Connected successfully (200)
✓ staging: Connected successfully (200)
⚠️  development: Connection timeout (slow network or n8n overloaded)

🔒 Security checks...

✓ .config.json in .gitignore

============================================================
VALIDATION RESULTS
============================================================

ℹ️  INFO:
   ✓ Using .config.json (multi-instance)
   ✓ 3 environment(s) configured: production, staging, development
   ✓ Default environment: staging
   ✓ production: Connected successfully (200)
   ✓ staging: Connected successfully (200)
   ✓ .config.json in .gitignore

⚠️  WARNINGS:
   development: Connection timeout (slow network or n8n overloaded)

✅ Configuration is valid and ready for use
```

### AC5: CI/CD Integration Tests
**Given** deployment pipeline
**When** running automated tests
**Then** configuration should be validated automatically:

#### 5.1 GitHub Actions Workflow

```yaml
# .github/workflows/test-multi-instance.yml
name: Multi-Instance Configuration Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test-configuration:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Create test configuration
        env:
          TEST_PROD_HOST: ${{ secrets.TEST_PROD_HOST }}
          TEST_PROD_KEY: ${{ secrets.TEST_PROD_KEY }}
          TEST_STAGING_HOST: ${{ secrets.TEST_STAGING_HOST }}
          TEST_STAGING_KEY: ${{ secrets.TEST_STAGING_KEY }}
        run: |
          cat > .config.json << EOF
          {
            "environments": {
              "production": {
                "n8n_host": "${TEST_PROD_HOST}",
                "n8n_api_key": "${TEST_PROD_KEY}"
              },
              "staging": {
                "n8n_host": "${TEST_STAGING_HOST}",
                "n8n_api_key": "${TEST_STAGING_KEY}"
              }
            },
            "defaultEnv": "staging"
          }
          EOF

      - name: Run configuration validation
        run: npm run validate-config

      - name: Run unit tests
        run: npm test -- --coverage

      - name: Run integration tests
        run: npm run test:integration

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

---

## Technical Implementation Notes

### Test Structure

```
test/
├── config/
│   ├── valid-config.test.ts
│   ├── invalid-config.test.ts
│   └── fixtures/
│       ├── valid-multi.json
│       └── valid-single.env
├── services/
│   ├── environment-manager.test.ts
│   └── n8n-api-wrapper.test.ts
├── integration/
│   ├── tool-instance-routing.test.ts
│   └── all-tools-instance-routing.test.ts
└── utils/
    ├── mock-n8n-api.ts
    └── test-helpers.ts
```

### Testing Tools

**Dependencies:**
```json
{
  "devDependencies": {
    "@types/jest": "^29.5.0",
    "jest": "^29.5.0",
    "ts-jest": "^29.1.0"
  }
}
```

**Jest Configuration:**
```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

---

## Dependencies

### Upstream Dependencies
- **Story 5.1** (Configuration System) - Test ConfigLoader
- **Story 5.2** (EnvironmentManager) - Test instance management
- **Story 5.3** (Tool Routing) - Test all tool integrations
- Epic 2 (API Implementation) - Mock API responses

### Downstream Dependencies
- Epic 6 (Examples) - Use test patterns in examples
- Epic 8 (Deployment) - CI/CD integration

---

## Definition of Done

### Implementation Completeness
- [ ] Unit tests for ConfigLoader (10+ test cases)
- [ ] Unit tests for EnvironmentManager (10+ test cases)
- [ ] Integration tests for all 17 tools (2+ test cases each)
- [ ] Configuration validation CLI tool
- [ ] CI/CD integration workflow

### Test Coverage
- [ ] 80%+ code coverage overall
- [ ] 100% coverage for ConfigLoader critical paths
- [ ] 100% coverage for EnvironmentManager critical paths
- [ ] All error conditions tested

### Documentation
- [ ] Testing guide for developers
- [ ] Validation tool usage documentation
- [ ] CI/CD integration examples
- [ ] Troubleshooting common test failures

---

## Estimation Breakdown

**Story Points:** 5

**Effort Distribution:**
- Configuration Tests: 1 SP
- EnvironmentManager Tests: 1 SP
- Integration Tests (17 tools): 1.5 SP
- Validation CLI Tool: 0.75 SP
- CI/CD Integration: 0.75 SP

**Page Count:** 9-12 pages

**Estimated Duration:** 2-3 days (1 developer)

---

## Notes

### Success Metrics
- 80%+ code coverage
- Zero configuration errors in production
- CI/CD tests pass consistently
- Validation tool catches 95%+ config errors

### Best Practices
- ✅ Test both valid and invalid configurations
- ✅ Use fixtures for test data
- ✅ Mock external API calls
- ✅ Test error conditions thoroughly
- ✅ Integrate validation in CI/CD

---

**Status:** Ready for Implementation
**Related Files:**
- `test/config/*`
- `test/services/*`
- `test/integration/*`
- `scripts/validate-config.ts`
- `.github/workflows/test-multi-instance.yml`
