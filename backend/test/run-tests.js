#!/usr/bin/env node

/**
 * Test Runner with Timestamped Reports
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Generate timestamped report name
function generateReportName(module, environment) {
  const now = new Date();
  const timestamp = now.toISOString()
    .replace(/:/g, '-')
    .replace(/\..+/, '')
    .replace('T', '-');
  
  return `${module}-${environment}-report-${timestamp}.html`;
}

// Test configurations
const testConfigs = {
  'health-check': {
    collection: 'test/collections/health-check/health-check-collection.json',
    environments: {
      dev: 'test/environments/dev-environment.json',
      prod: 'test/environments/prod-environment.json'
    }
  }
  // Add more modules here as needed
};

function runTest(testModule, environment = 'dev') {
  const config = testConfigs[testModule];
  
  if (!config) {
    console.error(`❌ Unknown test module: ${testModule}`);
    console.log('Available modules:', Object.keys(testConfigs).join(', '));
    process.exit(1);
  }
  
  const envFile = config.environments[environment];
  if (!envFile) {
    console.error(`❌ Unknown environment: ${environment}`);
    console.log('Available environments:', Object.keys(config.environments).join(', '));
    process.exit(1);
  }
  
  const reportName = generateReportName(testModule, environment);
  const reportPath = path.join('test', 'reports', reportName);
  
  console.log(`🧪 Running ${testModule} tests for ${environment} environment...`);
  console.log(`📊 Report will be saved as: ${reportName}`);
  
  try {
    const command = `newman run ${config.collection} -e ${envFile} -r htmlextra --reporter-htmlextra-export ${reportPath}`;
    console.log(`🚀 Executing: ${command}`);
    
    execSync(command, { stdio: 'inherit' });
    
    console.log('✅ Tests completed successfully!');
    console.log(`📊 Report saved: ${reportPath}`);
    
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
    process.exit(1);
  }
}

// Command line usage
const testModule = process.argv[2];
const environment = process.argv[3] || 'dev';

if (!testModule) {
  console.log('Usage: node test/run-tests.js <module> [environment]');
  console.log('Examples:');
  console.log('  node test/run-tests.js health-check dev');
  console.log('  node test/run-tests.js health-check prod');
  process.exit(1);
}

runTest(testModule, environment);
