#!/usr/bin/env node

/**
 * Test script to determine which activation method works with n8n API
 * Tests both PATCH and PUT methods for workflow activation
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Load configuration
const configPath = path.join(__dirname, '.config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const env = config.environments[config.defaultEnv];

const API_BASE = env.n8n_host;
const API_KEY = env.n8n_api_key;

console.log('🧪 Testing n8n Workflow Activation Methods');
console.log(`📡 Server: ${API_BASE}`);
console.log('');

// Create axios instance
const api = axios.create({
  baseURL: `${API_BASE}/api/v1`,
  headers: {
    'X-N8N-API-KEY': API_KEY,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

async function createTestWorkflow() {
  console.log('1️⃣  Creating test workflow...');

  const workflow = {
    name: `Test Activation Methods ${Date.now()}`,
    nodes: [
      {
        name: 'Schedule Trigger',
        type: 'n8n-nodes-base.scheduleTrigger',
        position: [250, 300],
        parameters: {
          rule: {
            interval: [{ field: 'hours', hoursInterval: 1 }]
          }
        },
        typeVersion: 1.1
      }
    ],
    connections: {},
    settings: {
      executionOrder: 'v1'
    }
  };

  try {
    const response = await api.post('/workflows', workflow);
    console.log(`✅ Workflow created: ID=${response.data.id}, Name="${response.data.name}"`);
    console.log(`   Active status: ${response.data.active}`);
    console.log('');
    return response.data.id;
  } catch (error) {
    console.error('❌ Failed to create workflow:', error.response?.data || error.message);
    process.exit(1);
  }
}

async function testMethodPUT(workflowId) {
  console.log('2️⃣  Testing Method 1: PUT /workflows/{id}/activate');

  try {
    const response = await api.put(`/workflows/${workflowId}/activate`, {});
    console.log('✅ PUT /activate method WORKS!');
    console.log(`   Response: active=${response.data.active}`);
    console.log('');
    return true;
  } catch (error) {
    console.log('❌ PUT /activate method FAILED');
    console.log(`   Status: ${error.response?.status || 'N/A'}`);
    console.log(`   Error: ${error.response?.data?.message || error.message}`);
    console.log('');
    return false;
  }
}

async function testMethodPATCH(workflowId) {
  console.log('3️⃣  Testing Method 2: PATCH /workflows/{id} with {active: true}');

  try {
    const response = await api.patch(`/workflows/${workflowId}`, {
      active: true,
      settings: {},
      staticData: null,
      tags: []
    });
    console.log('✅ PATCH method WORKS!');
    console.log(`   Response: active=${response.data.active}`);
    console.log('');
    return true;
  } catch (error) {
    console.log('❌ PATCH method FAILED');
    console.log(`   Status: ${error.response?.status || 'N/A'}`);
    console.log(`   Error: ${error.response?.data?.message || error.message}`);
    console.log('');
    return false;
  }
}

async function deactivateWorkflow(workflowId) {
  console.log('4️⃣  Deactivating workflow for next test...');

  try {
    // Try PUT method first
    const response = await api.put(`/workflows/${workflowId}/deactivate`, {});
    console.log('✅ Deactivated using PUT /deactivate');
    console.log('');
  } catch (error) {
    // Fallback to PATCH
    try {
      await api.patch(`/workflows/${workflowId}`, { active: false });
      console.log('✅ Deactivated using PATCH with {active: false}');
      console.log('');
    } catch (err) {
      console.log('⚠️  Could not deactivate workflow');
      console.log('');
    }
  }
}

async function cleanupWorkflow(workflowId) {
  console.log('🧹 Cleaning up test workflow...');

  try {
    await api.delete(`/workflows/${workflowId}`);
    console.log('✅ Test workflow deleted');
  } catch (error) {
    console.log('⚠️  Could not delete workflow:', error.message);
  }
}

async function main() {
  let workflowId = null;

  try {
    // Create test workflow
    workflowId = await createTestWorkflow();

    // Test PUT method
    const putWorks = await testMethodPUT(workflowId);

    if (putWorks) {
      // Deactivate before testing PATCH
      await deactivateWorkflow(workflowId);
    }

    // Test PATCH method
    const patchWorks = await testMethodPATCH(workflowId);

    // Summary
    console.log('📊 Test Results Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`PUT /workflows/{id}/activate:     ${putWorks ? '✅ WORKS' : '❌ FAILS'}`);
    console.log(`PATCH /workflows/{id} {active}:   ${patchWorks ? '✅ WORKS' : '❌ FAILS'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    if (putWorks) {
      console.log('💡 Recommendation: Use PUT /workflows/{id}/activate (dedicated endpoint)');
    } else if (patchWorks) {
      console.log('💡 Recommendation: Use PATCH /workflows/{id} with {active: true}');
    } else {
      console.log('⚠️  Neither method works! API may not support activation.');
    }

  } catch (error) {
    console.error('💥 Test failed:', error.message);
  } finally {
    if (workflowId) {
      await cleanupWorkflow(workflowId);
    }
  }
}

main();
