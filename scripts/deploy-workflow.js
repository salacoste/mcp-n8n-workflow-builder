#!/usr/bin/env node

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const N8N_API_URL = process.env.N8N_API_URL || 'https://n8n.informedcrew.com';
const N8N_API_KEY = process.env.N8N_API_KEY;
const N8N_WORKFLOW_ID = process.env.N8N_WORKFLOW_ID;

if (!N8N_API_KEY) {
  console.error('❌ N8N_API_KEY environment variable is required');
  process.exit(1);
}

if (!N8N_WORKFLOW_ID) {
  console.error('❌ N8N_WORKFLOW_ID environment variable is required');
  process.exit(1);
}

async function deployWorkflow() {
  try {
    console.log('🚀 Starting workflow deployment to n8n.informedcrew.com...');
    
    // Read workflow file
    const workflowPath = path.join(__dirname, '..', 'workflows', 'cipher-weaviate-integration.json');
    
    if (!fs.existsSync(workflowPath)) {
      console.log('⚠️  No workflow file found at workflows/cipher-weaviate-integration.json');
      console.log('📝 Creating placeholder workflow...');
      
      // Create a basic workflow structure
      const basicWorkflow = {
        name: "Cipher-Weaviate Knowledge Integration",
        nodes: [
          {
            id: "webhook-trigger",
            name: "Webhook Trigger",
            type: "n8n-nodes-base.webhook",
            typeVersion: 1,
            position: [240, 300],
            parameters: {
              httpMethod: "POST",
              path: "search",
              responseMode: "responseNode"
            }
          }
        ],
        connections: {},
        active: false,
        settings: {},
        versionId: "1"
      };
      
      // Ensure workflows directory exists
      const workflowsDir = path.join(__dirname, '..', 'workflows');
      if (!fs.existsSync(workflowsDir)) {
        fs.mkdirSync(workflowsDir, { recursive: true });
      }
      
      fs.writeFileSync(workflowPath, JSON.stringify(basicWorkflow, null, 2));
      console.log('✅ Created placeholder workflow file');
    }
    
    const workflowData = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));
    
    // Prepare the API request
    const apiUrl = `${N8N_API_URL}/api/v1/workflows/${N8N_WORKFLOW_ID}`;
    
    console.log(`📡 Deploying to: ${apiUrl}`);
    
    const response = await axios.put(apiUrl, workflowData, {
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 200) {
      console.log('✅ Workflow deployed successfully!');
      console.log(`📊 Workflow ID: ${response.data.id}`);
      console.log(`📝 Workflow Name: ${response.data.name}`);
      console.log(`🔗 Access URL: ${N8N_API_URL}/workflow/${response.data.id}`);
    } else {
      console.log('⚠️  Unexpected response status:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Deployment failed:');
    
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Message: ${error.response.data?.message || error.response.statusText}`);
    } else if (error.request) {
      console.error('Network error - no response received');
    } else {
      console.error('Error:', error.message);
    }
    
    process.exit(1);
  }
}

// Run deployment
deployWorkflow();
