#!/usr/bin/env node

/**
 * Test n8n API directly (bypassing MCP) to see if 409 error is from n8n or our code
 */

const axios = require('axios');
const fs = require('fs');

// Load config
const config = JSON.parse(fs.readFileSync('.config.json', 'utf8'));
const env = config.environments[config.defaultEnv];

const api = axios.create({
  baseURL: `${env.n8n_host}/api/v1`,
  headers: {
    'X-N8N-API-KEY': env.n8n_api_key,
    'Content-Type': 'application/json'
  }
});

async function test() {
  try {
    console.error('[INFO] Testing direct n8n API...');
    console.error(`[INFO] Base URL: ${env.n8n_host}/api/v1`);

    // Try to create a tag
    const tagName = `DirectTest_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    console.error(`\n[INFO] Creating tag: ${tagName}`);

    const response = await api.post('/tags', { name: tagName });
    console.error('[SUCCESS] Tag created!');
    console.error(JSON.stringify(response.data, null, 2));

    // Clean up
    console.error(`\n[INFO] Cleaning up tag: ${response.data.id}`);
    await api.delete(`/tags/${response.data.id}`);
    console.error('[SUCCESS] Tag deleted');

  } catch (error) {
    console.error('[ERROR] Request failed:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data:`, error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

test();
