#!/usr/bin/env node

/**
 * Test DELETE /credentials/{id} with real credential
 * Creates credential via POST, then tries to DELETE it
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

async function testDeleteCredential() {
  console.log('\n=== DELETE /credentials/{id} Validation Test ===\n');
  console.log(`Testing against: ${config.n8nHost}\n`);

  let createdId = null;

  try {
    // Step 1: Create a test credential
    console.log('Step 1: Creating test credential via POST...');
    const createResponse = await axios.post(
      `${config.n8nHost}/api/v1/credentials`,
      {
        name: `Test Delete Credential ${Date.now()}`,
        type: 'httpBasicAuth',
        data: {
          user: 'testuser',
          password: 'testpass'
        }
      },
      {
        headers: {
          'X-N8N-API-KEY': config.n8nApiKey,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );

    createdId = createResponse.data.id;
    console.log(`  ✅ Created credential with ID: ${createdId}`);

    // Step 2: Try to DELETE it
    console.log(`\nStep 2: Attempting to DELETE credential ${createdId}...`);
    const deleteResponse = await axios.delete(
      `${config.n8nHost}/api/v1/credentials/${createdId}`,
      {
        headers: {
          'X-N8N-API-KEY': config.n8nApiKey,
          'Accept': 'application/json'
        }
      }
    );

    console.log(`  ✅ DELETE successful! Status: ${deleteResponse.status}`);
    console.log(`  Response: ${JSON.stringify(deleteResponse.data)}`);
    console.log('\n✅ CONCLUSION: DELETE /credentials/{id} is SUPPORTED\n');

  } catch (error) {
    if (error.response) {
      console.log(`  ❌ DELETE failed! Status: ${error.response.status}`);
      console.log(`  Message: ${JSON.stringify(error.response.data)}`);

      if (error.response.status === 405) {
        console.log('\n❌ CONCLUSION: DELETE /credentials/{id} is NOT SUPPORTED (405)\n');
      } else {
        console.log(`\n⚠️  CONCLUSION: DELETE returned ${error.response.status} - investigate further\n`);
      }

      // Cleanup attempt if credential was created
      if (createdId) {
        console.log(`Note: Test credential ${createdId} may still exist in n8n`);
      }
    } else {
      console.log(`\n❌ Request error: ${error.message}\n`);
    }
  }
}

testDeleteCredential();
