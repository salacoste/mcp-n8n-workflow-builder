#!/usr/bin/env node

/**
 * Direct API test for ALL Credentials endpoints
 * Tests POST, PUT, DELETE methods to confirm entire API is restricted
 */

const axios = require('axios');
const fs = require('fs');

// Load configuration
let config;
if (fs.existsSync('.config.json')) {
  const rawConfig = JSON.parse(fs.readFileSync('.config.json', 'utf8'));
  const defaultEnv = rawConfig.defaultEnv || Object.keys(rawConfig.environments)[0];
  const envConfig = rawConfig.environments[defaultEnv];
  config = {
    n8nHost: envConfig.n8n_host,
    n8nApiKey: envConfig.n8n_api_key
  };
} else {
  require('dotenv').config();
  config = {
    n8nHost: process.env.N8N_HOST,
    n8nApiKey: process.env.N8N_API_KEY
  };
}

const testId = '1';

async function testEndpoint(method, endpoint, data = null) {
  try {
    const options = {
      method: method,
      url: `${config.n8nHost}/api/v1${endpoint}`,
      headers: {
        'X-N8N-API-KEY': config.n8nApiKey,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      options.data = data;
    }

    const response = await axios(options);
    return { success: true, status: response.status, data: response.data };
  } catch (error) {
    if (error.response) {
      return {
        success: false,
        status: error.response.status,
        message: error.response.data
      };
    }
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('\n=== Comprehensive Credentials API Test ===\n');
  console.log(`Testing against: ${config.n8nHost}\n`);

  const tests = [
    {
      name: 'GET /credentials',
      method: 'GET',
      endpoint: '/credentials',
      story: '2.6.1'
    },
    {
      name: 'GET /credentials/{id}',
      method: 'GET',
      endpoint: `/credentials/${testId}`,
      story: '2.6.2'
    },
    {
      name: 'POST /credentials',
      method: 'POST',
      endpoint: '/credentials',
      data: {
        name: 'Test Credential',
        type: 'httpBasicAuth',
        data: {
          user: 'test',
          password: 'test'
        }
      },
      story: '2.6.3'
    },
    {
      name: 'PUT /credentials/{id}',
      method: 'PUT',
      endpoint: `/credentials/${testId}`,
      data: {
        name: 'Updated Credential',
        type: 'httpBasicAuth',
        data: {
          user: 'test',
          password: 'test'
        }
      },
      story: '2.6.4'
    },
    {
      name: 'DELETE /credentials/{id}',
      method: 'DELETE',
      endpoint: `/credentials/${testId}`,
      story: '2.6.5'
    },
    {
      name: 'GET /credentials/schema/{typeName}',
      method: 'GET',
      endpoint: '/credentials/schema/httpBasicAuth',
      story: '2.6.6'
    }
  ];

  const results = [];

  for (const test of tests) {
    console.log(`Testing: ${test.name} (Story ${test.story})`);
    const result = await testEndpoint(test.method, test.endpoint, test.data);

    results.push({
      ...test,
      result
    });

    if (result.success) {
      console.log(`  ✅ Status ${result.status} - SUPPORTED`);
    } else if (result.status === 405) {
      console.log(`  ❌ Status 405 - NOT SUPPORTED (Method Not Allowed)`);
    } else if (result.status === 404) {
      console.log(`  ⚠️  Status 404 - Might be supported but resource not found`);
    } else if (result.status === 401) {
      console.log(`  ❌ Status 401 - Authentication error`);
    } else if (result.status === 403) {
      console.log(`  ❌ Status 403 - Permission denied`);
    } else if (result.status) {
      console.log(`  ⚠️  Status ${result.status} - ${JSON.stringify(result.message)}`);
    } else {
      console.log(`  ❌ Error: ${result.error}`);
    }
  }

  // Summary
  console.log('\n=== Summary ===\n');

  const supported = results.filter(r => r.result.success);
  const notAllowed = results.filter(r => r.result.status === 405);
  const other = results.filter(r => !r.result.success && r.result.status !== 405);

  console.log(`Total endpoints tested: ${results.length}`);
  console.log(`✅ Supported: ${supported.length}`);
  console.log(`❌ Not Allowed (405): ${notAllowed.length}`);
  console.log(`⚠️  Other errors: ${other.length}`);

  if (notAllowed.length === results.length) {
    console.log('\n🔒 CONCLUSION: Entire Credentials API is RESTRICTED (all 405)');
    console.log('   This is a security-based design decision by n8n');
    console.log('   Stories 2.6.1 - 2.6.6 should return informative messages');
  } else if (notAllowed.length > 0) {
    console.log(`\n⚠️  CONCLUSION: ${notAllowed.length}/${results.length} endpoints restricted`);
    console.log('   Partial API availability - investigate further');
  } else {
    console.log('\n✅ CONCLUSION: Credentials API appears to be available');
  }

  console.log('\n');
}

main();
