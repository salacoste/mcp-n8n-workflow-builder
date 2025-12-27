#!/usr/bin/env node

/**
 * Direct API test for GET /credentials endpoint
 * Tests if n8n API supports credentials listing
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

async function testCredentialsEndpoint() {
  console.log('\n=== Direct n8n API Test: GET /credentials ===\n');
  console.log(`Testing against: ${config.n8nHost}`);

  try {
    const response = await axios.get(`${config.n8nHost}/api/v1/credentials`, {
      headers: {
        'X-N8N-API-KEY': config.n8nApiKey,
        'Accept': 'application/json'
      }
    });

    console.log(`\n✅ SUCCESS: Status ${response.status}`);
    console.log(`\nResponse structure:`);
    console.log(`- Data array: ${response.data.data ? response.data.data.length : 0} credentials`);
    console.log(`- Has nextCursor: ${!!response.data.nextCursor}`);

    if (response.data.data && response.data.data.length > 0) {
      console.log(`\nFirst credential structure:`);
      const first = response.data.data[0];
      console.log(`- ID: ${first.id}`);
      console.log(`- Name: ${first.name}`);
      console.log(`- Type: ${first.type}`);
      console.log(`- Has 'data' field (sensitive): ${!!first.data}`);
      console.log(`- Has nodesAccess: ${!!first.nodesAccess}`);
      console.log(`- Created: ${first.createdAt}`);
      console.log(`- Updated: ${first.updatedAt}`);
    }

    console.log('\n✅ Credentials API is SUPPORTED\n');

  } catch (error) {
    if (error.response) {
      console.log(`\n❌ ERROR: Status ${error.response.status}`);
      console.log(`Message: ${JSON.stringify(error.response.data)}`);

      if (error.response.status === 405) {
        console.log('\n❌ GET /credentials endpoint is NOT SUPPORTED by this n8n version');
        console.log('   This is similar to the PATCH /workflows limitation');
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

testCredentialsEndpoint();
