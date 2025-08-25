#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Test configuration
const TEST_CONFIG = {
  n8nApiUrl: process.env.N8N_API_URL || 'https://n8n.informedcrew.com',
  n8nApiKey: process.env.N8N_API_KEY,
  n8nWorkflowId: process.env.N8N_WORKFLOW_ID,
  testMode: process.env.NODE_ENV === 'test'
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`🧪 ${title}`, 'bright');
  log(`${'='.repeat(60)}`, 'cyan');
}

function logTest(testName, passed, details = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  const color = passed ? 'green' : 'red';
  log(`${status} ${testName}`, color);
  if (details) {
    log(`   ${details}`, 'yellow');
  }
}

function runCommand(command, description) {
  try {
    log(`Running: ${command}`, 'blue');
    const result = execSync(command, { 
      encoding: 'utf8', 
      stdio: 'pipe',
      cwd: process.cwd()
    });
    logTest(description, true);
    return { success: true, output: result };
  } catch (error) {
    logTest(description, false, error.message);
    return { success: false, error: error.message };
  }
}

function checkFileExists(filePath, description) {
  const exists = fs.existsSync(filePath);
  logTest(description, exists, exists ? '' : `File not found: ${filePath}`);
  return exists;
}

function validateConventionalCommit(commitMessage) {
  const conventionalCommitRegex = /^(feat|fix|docs|style|refactor|perf|test|chore|workflow|workflow-feat|workflow-fix|workflow-refactor)(\(.+\))?: .+/;
  const isValid = conventionalCommitRegex.test(commitMessage);
  logTest('Conventional commit format validation', isValid, 
    isValid ? '' : `Invalid format: ${commitMessage}`);
  return isValid;
}

async function testN8nApiConnection() {
  if (!TEST_CONFIG.n8nApiKey) {
    logTest('N8n API connection test', false, 'N8N_API_KEY not provided');
    return false;
  }

  try {
    const response = await axios.get(`${TEST_CONFIG.n8nApiUrl}/api/v1/health`, {
      headers: {
        'X-N8N-API-KEY': TEST_CONFIG.n8nApiKey
      },
      timeout: 5000
    });
    
    const isHealthy = response.status === 200;
    logTest('N8n API health check', isHealthy, 
      isHealthy ? 'API is healthy' : `Status: ${response.status}`);
    return isHealthy;
  } catch (error) {
    logTest('N8n API health check', false, 
      error.response ? `Status: ${error.response.status}` : error.message);
    return false;
  }
}

async function testWorkflowDeployment() {
  if (!TEST_CONFIG.n8nApiKey || !TEST_CONFIG.n8nWorkflowId) {
    logTest('Workflow deployment test', false, 'Missing API credentials');
    return false;
  }

  try {
    // Read workflow file
    const workflowPath = path.join(__dirname, 'workflows', 'cipher-weaviate-integration.json');
    if (!fs.existsSync(workflowPath)) {
      logTest('Workflow deployment test', false, 'Workflow file not found');
      return false;
    }

    const workflowData = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));
    
    // Test deployment (dry-run if in test mode)
    if (TEST_CONFIG.testMode) {
      logTest('Workflow deployment test (dry-run)', true, 'Test mode - skipping actual deployment');
      return true;
    }

    const response = await axios.put(
      `${TEST_CONFIG.n8nApiUrl}/api/v1/workflows/${TEST_CONFIG.n8nWorkflowId}`,
      workflowData,
      {
        headers: {
          'X-N8N-API-KEY': TEST_CONFIG.n8nApiKey,
          'Content-Type': 'application/json'
        }
      }
    );

    const success = response.status === 200;
    logTest('Workflow deployment test', success, 
      success ? `Deployed successfully` : `Status: ${response.status}`);
    return success;
  } catch (error) {
    logTest('Workflow deployment test', false, 
      error.response ? `Status: ${error.response.status}` : error.message);
    return false;
  }
}

function testSemanticReleaseConfig() {
  const configPath = 'release.config.js';
  const exists = checkFileExists(configPath, 'Semantic-release configuration file');
  
  if (exists) {
    try {
      const config = require(path.resolve(configPath));
      const hasWorkflowRules = config.releaseRules && 
        config.releaseRules.some(rule => rule.type && rule.type.startsWith('workflow'));
      
      logTest('Workflow-specific release rules', hasWorkflowRules,
        hasWorkflowRules ? 'Found workflow commit types' : 'Missing workflow commit types');
      
      return hasWorkflowRules;
    } catch (error) {
      logTest('Semantic-release configuration validation', false, error.message);
      return false;
    }
  }
  return false;
}

function testChangelogGeneration() {
  const changelogPath = 'CHANGELOG.md';
  const exists = checkFileExists(changelogPath, 'Changelog file');
  
  if (exists) {
    const content = fs.readFileSync(changelogPath, 'utf8');
    const hasWorkflowSection = content.includes('## [') && content.includes('### ');
    logTest('Changelog structure validation', hasWorkflowSection,
      hasWorkflowSection ? 'Proper changelog structure' : 'Invalid changelog structure');
    return hasWorkflowSection;
  }
  return false;
}

function testGitHubActionsWorkflow() {
  const workflowPath = '.github/workflows/deploy.yml';
  const exists = checkFileExists(workflowPath, 'GitHub Actions workflow file');
  
  if (exists) {
    const content = fs.readFileSync(workflowPath, 'utf8');
    const hasN8nDeployment = content.includes('N8N_API_URL') && content.includes('deploy:workflow');
    const hasSemanticRelease = content.includes('semantic-release');
    
    logTest('N8n deployment in GitHub Actions', hasN8nDeployment,
      hasN8nDeployment ? 'Found n8n deployment step' : 'Missing n8n deployment step');
    
    logTest('Semantic-release in GitHub Actions', hasSemanticRelease,
      hasSemanticRelease ? 'Found semantic-release step' : 'Missing semantic-release step');
    
    return hasN8nDeployment && hasSemanticRelease;
  }
  return false;
}

function testPackageJsonScripts() {
  const packagePath = 'package.json';
  if (!checkFileExists(packagePath, 'Package.json file')) {
    return false;
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const scripts = packageJson.scripts || {};
    
    const requiredScripts = [
      'release',
      'release:dry-run',
      'deploy:workflow',
      'deploy:workflow:dry-run',
      'version:check',
      'workflow:test'
    ];
    
    let allScriptsPresent = true;
    requiredScripts.forEach(script => {
      const present = !!scripts[script];
      logTest(`Script: ${script}`, present, present ? '' : 'Missing script');
      if (!present) allScriptsPresent = false;
    });
    
    return allScriptsPresent;
  } catch (error) {
    logTest('Package.json scripts validation', false, error.message);
    return false;
  }
}

async function runAllTests() {
  log('🚀 Starting Complete Semantic Versioning Workflow Tests', 'bright');
  log(`Test Mode: ${TEST_CONFIG.testMode ? 'Enabled' : 'Disabled'}`, 'yellow');
  
  let testResults = {
    total: 0,
    passed: 0,
    failed: 0
  };

  // Test 1: Conventional commits validation
  logSection('1. Conventional Commits Validation');
  const testCommits = [
    'feat: add new workflow feature',
    'workflow-feat: implement cipher integration',
    'workflow-fix: resolve webhook trigger issue',
    'chore: update dependencies',
    'invalid commit message'
  ];
  
  testCommits.forEach(commit => {
    testResults.total++;
    const passed = validateConventionalCommit(commit);
    if (passed) testResults.passed++;
    else testResults.failed++;
  });

  // Test 2: Package.json scripts
  logSection('2. Package.json Scripts');
  testResults.total++;
  const scriptsPassed = testPackageJsonScripts();
  if (scriptsPassed) testResults.passed++;
  else testResults.failed++;

  // Test 3: Semantic-release configuration
  logSection('3. Semantic-release Configuration');
  testResults.total++;
  const configPassed = testSemanticReleaseConfig();
  if (configPassed) testResults.passed++;
  else testResults.failed++;

  // Test 4: Changelog generation
  logSection('4. Changelog Generation');
  testResults.total++;
  const changelogPassed = testChangelogGeneration();
  if (changelogPassed) testResults.passed++;
  else testResults.failed++;

  // Test 5: GitHub Actions workflow
  logSection('5. GitHub Actions Workflow');
  testResults.total++;
  const workflowPassed = testGitHubActionsWorkflow();
  if (workflowPassed) testResults.passed++;
  else testResults.failed++;

  // Test 6: N8n API integration
  logSection('6. N8n API Integration');
  testResults.total++;
  const apiPassed = await testN8nApiConnection();
  if (apiPassed) testResults.passed++;
  else testResults.failed++;

  // Test 7: Workflow deployment
  logSection('7. Workflow Deployment');
  testResults.total++;
  const deploymentPassed = await testWorkflowDeployment();
  if (deploymentPassed) testResults.passed++;
  else testResults.failed++;

  // Test 8: Semantic-release dry-run
  logSection('8. Semantic-release Dry-run');
  const dryRunResult = runCommand('npm run release:dry-run', 'Semantic-release dry-run');
  testResults.total++;
  if (dryRunResult.success) testResults.passed++;
  else testResults.failed++;

  // Test 9: Workflow test script
  logSection('9. Workflow Test Script');
  const workflowTestResult = runCommand('npm run workflow:test', 'Workflow test script');
  testResults.total++;
  if (workflowTestResult.success) testResults.passed++;
  else testResults.failed++;

  // Summary
  logSection('Test Summary');
  log(`Total Tests: ${testResults.total}`, 'bright');
  log(`Passed: ${testResults.passed}`, 'green');
  log(`Failed: ${testResults.failed}`, 'red');
  log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`, 'cyan');

  if (testResults.failed === 0) {
    log('\n🎉 All tests passed! Semantic versioning workflow is working correctly.', 'green');
    process.exit(0);
  } else {
    log('\n⚠️  Some tests failed. Please review the issues above.', 'yellow');
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(error => {
    log(`❌ Test execution failed: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = {
  runAllTests,
  testN8nApiConnection,
  testWorkflowDeployment,
  validateConventionalCommit,
  testSemanticReleaseConfig,
  testChangelogGeneration,
  testGitHubActionsWorkflow,
  testPackageJsonScripts
};
