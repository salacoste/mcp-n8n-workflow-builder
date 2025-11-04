#!/usr/bin/env node

/**
 * Test script to verify MCP notification handling
 * Tests both notifications (no id) and regular requests (with id)
 */

const http = require('http');

const PORT = process.env.MCP_PORT || 3456;
const HOST = 'localhost';

// Helper function to send JSON-RPC request
function sendRequest(data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);

    const options = {
      hostname: HOST,
      port: PORT,
      path: '/mcp',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          statusMessage: res.statusMessage,
          headers: res.headers,
          body: body ? JSON.parse(body) : null
        });
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Test cases
async function runTests() {
  console.log('Testing MCP Server Notification Handling\n');
  console.log('==========================================\n');

  try {
    // Test 1: Send notification (no id field)
    console.log('Test 1: Sending notification/initialized (should return 204 No Content)');
    const notificationRequest = {
      jsonrpc: '2.0',
      method: 'notifications/initialized',
      params: {}
      // Note: no 'id' field - this makes it a notification
    };

    const notificationResult = await sendRequest(notificationRequest);
    console.log(`  Status Code: ${notificationResult.statusCode}`);
    console.log(`  Status Message: ${notificationResult.statusMessage}`);
    console.log(`  Response Body: ${notificationResult.body ? JSON.stringify(notificationResult.body) : 'null (empty)'}`);

    if (notificationResult.statusCode === 204) {
      console.log('  ✅ PASS: Notification handled correctly with 204 No Content\n');
    } else {
      console.log('  ❌ FAIL: Expected 204, got', notificationResult.statusCode, '\n');
    }

    // Test 2: Send regular request (with id field)
    console.log('Test 2: Sending tools/list request (should return 200 with JSON response)');
    const requestWithId = {
      jsonrpc: '2.0',
      method: 'tools/list',
      params: {},
      id: 1
    };

    const requestResult = await sendRequest(requestWithId);
    console.log(`  Status Code: ${requestResult.statusCode}`);
    console.log(`  Response Body: ${requestResult.body ? 'JSON response received' : 'null'}`);

    if (requestResult.statusCode === 200 && requestResult.body) {
      console.log('  ✅ PASS: Regular request handled correctly with JSON response\n');
    } else {
      console.log('  ❌ FAIL: Expected 200 with JSON body\n');
    }

    // Test 3: Send notification/cancelled
    console.log('Test 3: Sending notification/cancelled (should return 204 No Content)');
    const cancelNotification = {
      jsonrpc: '2.0',
      method: 'notifications/cancelled',
      params: { requestId: 123 }
      // Note: no 'id' field
    };

    const cancelResult = await sendRequest(cancelNotification);
    console.log(`  Status Code: ${cancelResult.statusCode}`);
    console.log(`  Status Message: ${cancelResult.statusMessage}`);

    if (cancelResult.statusCode === 204) {
      console.log('  ✅ PASS: Cancel notification handled correctly\n');
    } else {
      console.log('  ❌ FAIL: Expected 204, got', cancelResult.statusCode, '\n');
    }

    // Test 4: Health check
    console.log('Test 4: Health check (should return 200)');
    const healthResult = await new Promise((resolve, reject) => {
      http.get(`http://${HOST}:${PORT}/health`, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve({
          statusCode: res.statusCode,
          body: JSON.parse(body)
        }));
      }).on('error', reject);
    });

    console.log(`  Status Code: ${healthResult.statusCode}`);
    console.log(`  Response: ${JSON.stringify(healthResult.body)}`);

    if (healthResult.statusCode === 200) {
      console.log('  ✅ PASS: Health check successful\n');
    } else {
      console.log('  ❌ FAIL: Expected 200\n');
    }

    console.log('==========================================');
    console.log('All tests completed!');

  } catch (error) {
    console.error('Test failed with error:', error.message);
    console.error('\nMake sure the MCP server is running with:');
    console.error('  MCP_STANDALONE=true npm start');
    process.exit(1);
  }
}

// Run tests
runTests();
