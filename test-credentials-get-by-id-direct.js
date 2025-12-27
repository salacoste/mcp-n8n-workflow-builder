#!/usr/bin/env node

/**
 * Direct API test for GET /credentials/{id} endpoint
 * Tests if n8n API supports getting single credential
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

async function testGetCredentialById() {
  console.log('\n=== Direct n8n API Test: GET /credentials/{id} ===\n');
  console.log(`Testing against: ${config.n8nHost}`);

  // Try with a dummy ID (we expect 405 regardless of ID validity)
  const testId = '1';

  try {
    const response = await axios.get(`${config.n8nHost}/api/v1/credentials/${testId}`, {
      headers: {
        'X-N8N-API-KEY': config.n8nApiKey,
        'Accept': 'application/json'
      }
    });

    console.log(`\n✅ SUCCESS: Status ${response.status}`);
    console.log(`\nResponse structure:`);
    console.log(JSON.stringify(response.data, null, 2));
    console.log('\n✅ GET /credentials/{id} endpoint is SUPPORTED\n');

  } catch (error) {
    if (error.response) {
      console.log(`\n❌ ERROR: Status ${error.response.status}`);
      console.log(`Message: ${JSON.stringify(error.response.data)}`);

      if (error.response.status === 405) {
        console.log('\n❌ GET /credentials/{id} endpoint is NOT SUPPORTED');
        console.log('   This confirms the entire Credentials API is restricted');
      } else if (error.response.status === 404) {
        console.log('\n🤔 Got 404 - endpoint might exist but credential not found');
        console.log('   This could mean the API is available but requires valid ID');
      } else if (error.response.status === 401) {
        console.log('\n❌ Authentication error - check API key');
      } else if (error.response.status === 403) {
        console.log('\n❌ Permission denied - API key lacks credentials access');
      }
    } else {
      console.log(`\n❌ Request failed: ${error.message}`);
    }

    console.log('\n');
    return false;
  }

  return true;
}

testGetCredentialById();
