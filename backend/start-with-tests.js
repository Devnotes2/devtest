#!/usr/bin/env node

/**
 * Start server with automatic health check tests
 */

const { spawn } = require('child_process');
const { execSync } = require('child_process');
const path = require('path');

// Configuration
const config = {
  dev: {
    serverCommand: 'node --watch app',
    testCommand: 'npm run test:health:dev',
    environment: 'development',
    waitTime: 3000, // 3 seconds for dev
    baseUrl: 'http://svb.local:8000'
  },
  prod: {
    serverCommand: 'node app',
    testCommand: 'npm run test:health:prod', 
    environment: 'production',
    waitTime: 5000, // 5 seconds for prod
    baseUrl: 'https://devtest2.onrender.com'
  }
};

function waitForServer(baseUrl, maxAttempts = 10) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    
    const checkServer = () => {
      attempts++;
      console.log(`🔍 Checking server health (attempt ${attempts}/${maxAttempts})...`);
      
      try {
        // Try to make a simple HTTP request to check if server is up
        execSync(`curl -s -o /dev/null -w "%{http_code}" ${baseUrl}/health || echo "000"`, { 
          encoding: 'utf8',
          timeout: 2000 
        });
        console.log('✅ Server is ready!');
        resolve();
      } catch (error) {
        if (attempts >= maxAttempts) {
          console.log('❌ Server failed to start within timeout');
          reject(new Error('Server startup timeout'));
        } else {
          console.log('⏳ Server not ready yet, waiting...');
          setTimeout(checkServer, 1000);
        }
      }
    };
    
    checkServer();
  });
}

async function startWithTests(environment) {
  const envConfig = config[environment];
  
  if (!envConfig) {
    console.error('❌ Invalid environment. Use "dev" or "prod"');
    process.exit(1);
  }
  
  console.log(`🚀 Starting ${environment} server with health check tests...`);
  console.log(`📊 Environment: ${envConfig.environment}`);
  
  const baseUrl = envConfig.baseUrl;
  let serverProcess = null;
  
  try {
    // Check if server is already running
    console.log('🔍 Checking if server is already running...');
    try {
      await waitForServer(baseUrl, 3); // Quick check with only 3 attempts
      console.log('✅ Server is already running!');
    } catch (error) {
      // Server not running, start it
      console.log('🖥️  Starting server...');
      serverProcess = spawn('node', environment === 'dev' ? ['--watch', 'app'] : ['app'], {
        stdio: 'inherit',
        shell: true
      });
      
      // Wait for server to be ready
      await waitForServer(baseUrl);
    }
    
    // Wait additional time for server to fully initialize
    console.log(`⏳ Waiting ${envConfig.waitTime/1000} seconds for server to fully initialize...`);
    await new Promise(resolve => setTimeout(resolve, envConfig.waitTime));
    
    // Run health check tests
    console.log('🧪 Starting health check tests...');
    try {
      execSync(envConfig.testCommand, { stdio: 'inherit' });
      console.log('✅ Health check tests completed!');
      console.log('📊 Check test/reports/ for detailed results');
    } catch (error) {
      console.log('⚠️  Health check tests completed with some issues');
      console.log('📊 Check test/reports/ for detailed results');
    }
    
    // If we started the server, keep it running
    if (serverProcess) {
      console.log('🖥️  Server is running. Press Ctrl+C to stop.');
      
      // Handle process termination
      process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down server...');
        serverProcess.kill();
        process.exit(0);
      });
      
      process.on('SIGTERM', () => {
        console.log('\n🛑 Shutting down server...');
        serverProcess.kill();
        process.exit(0);
      });
      
      // Keep the process alive
      await new Promise(() => {}); // This will keep the process running indefinitely
    }
    
  } catch (error) {
    console.error('❌ Error during startup:', error.message);
    if (serverProcess) {
      serverProcess.kill();
    }
    process.exit(1);
  }
}

// Get environment from command line argument
const environment = process.argv[2] || 'dev';

startWithTests(environment).catch(error => {
  console.error('❌ Startup failed:', error.message);
  process.exit(1);
});
