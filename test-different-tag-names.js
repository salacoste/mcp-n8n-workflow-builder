#!/usr/bin/env node

const axios = require('axios');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('.config.json', 'utf8'));
const env = config.environments[config.defaultEnv];

const api = axios.create({
  baseURL: `${env.n8n_host}/api/v1`,
  headers: {
    'X-N8N-API-KEY': env.n8n_api_key,
    'Content-Type': 'application/json'
  }
});

const testNames = [
  `DirectTest_${Date.now()}`,
  `Test${Date.now()}`,
  `ValidTag${Date.now()}`,
  `MyTag_${Math.random().toString(36).substring(7)}`,
  `UUID_${crypto.randomUUID()}`.substring(0, 20)
];

async function test() {
  console.error('[INFO] Testing different tag name patterns...\n');

  for (const tagName of testNames) {
    try {
      console.error(`[INFO] Trying: ${tagName}`);
      const response = await api.post('/tags', { name: tagName });
      console.error(`[SUCCESS] Created! ID: ${response.data.id}`);

      // Clean up
      await api.delete(`/tags/${response.data.id}`);
      console.error(`[SUCCESS] Deleted\n`);

      // If we get here, we found a working pattern
      console.error(`\n[SUCCESS] Working pattern found: ${tagName}`);
      break;

    } catch (error) {
      if (error.response) {
        console.error(`[ERROR] Status ${error.response.status}: ${error.response.data.message || error.response.data}\n`);
      } else {
        console.error(`[ERROR] ${error.message}\n`);
      }
    }
  }
}

test();
