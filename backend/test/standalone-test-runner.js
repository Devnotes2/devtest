#!/usr/bin/env node

/**
 * Standalone Test Runner
 * Can run tests independently without needing the backend to be running
 * Perfect for CI/CD, monitoring, or separate test deployments
 */

const { execSync } = require('child_process');
const path = require('path');

// Configuration for standalone testing
const config = {
  prod: {
    collection: 'test/collections/health-check/health-check-collection.json',
    environment: 'test/environments/prod-environment.json',
    iterations: 2,
    delayBetweenIterations: 60000, // 1 minute
    baseUrl: 'https://devtest2.onrender.com',
    description: 'Production API Testing'
  },
  dev: {
    collection: 'test/collections/health-check/health-check-collection.json',
    environment: 'test/environments/dev-environment.json',
    iterations: 2,
    delayBetweenIterations: 5000, // 5 seconds
    baseUrl: 'http://svb.local:8000',
    description: 'Development API Testing'
  }
};

function generateReportName(module, environment, iteration) {
  const now = new Date();
  const timestamp = now.toISOString()
    .replace(/:/g, '-')
    .replace(/\..+/, '')
    .replace('T', '-');
  
  return `${module}-${environment}-standalone-${iteration}-${timestamp}.html`;
}

function runSingleIteration(module, environment, iteration, totalIterations) {
  const envConfig = config[environment];
  const reportName = generateReportName(module, environment, iteration);
  const reportPath = path.join('test', 'reports', reportName);
  
  console.log(`\n🧪 Running iteration ${iteration}/${totalIterations}...`);
  console.log(`🌐 Testing: ${envConfig.baseUrl}`);
  console.log(`📊 Report: ${reportName}`);
  
  try {
    const command = `newman run ${envConfig.collection} -e ${envConfig.environment} -r htmlextra --reporter-htmlextra-export ${reportPath}`;
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ Iteration ${iteration} completed successfully`);
    return true;
  } catch (error) {
    console.error(`❌ Iteration ${iteration} failed:`, error.message);
    return false;
  }
}

async function runStandaloneTests(module, environment) {
  const envConfig = config[environment];
  
  if (!envConfig) {
    console.error(`❌ Unknown environment: ${environment}`);
    console.log('Available environments:', Object.keys(config).join(', '));
    process.exit(1);
  }
  
  console.log(`🚀 Standalone Test Runner`);
  console.log(`📋 ${envConfig.description}`);
  console.log(`🌐 Target: ${envConfig.baseUrl}`);
  console.log(`📊 Iterations: ${envConfig.iterations}`);
  console.log(`⏱️  Delay between iterations: ${envConfig.delayBetweenIterations/1000} seconds`);
  console.log(`📁 Reports will be saved in: test/reports/`);
  
  const results = [];
  const startTime = Date.now();
  
  for (let i = 1; i <= envConfig.iterations; i++) {
    const success = runSingleIteration(module, environment, i, envConfig.iterations);
    results.push({ iteration: i, success });
    
    // Don't wait after the last iteration
    if (i < envConfig.iterations) {
      console.log(`⏳ Waiting ${envConfig.delayBetweenIterations/1000} seconds before next iteration...`);
      await new Promise(resolve => setTimeout(resolve, envConfig.delayBetweenIterations));
    }
  }
  
  const endTime = Date.now();
  const totalTime = (endTime - startTime) / 1000;
  const successfulIterations = results.filter(r => r.success).length;
  
  console.log(`\n📊 Standalone Test Summary:`);
  console.log(`✅ Successful iterations: ${successfulIterations}/${envConfig.iterations}`);
  console.log(`⏱️  Total time: ${totalTime.toFixed(1)} seconds`);
  console.log(`📁 Reports saved in: test/reports/`);
  
  if (successfulIterations === envConfig.iterations) {
    console.log(`🎉 All standalone tests completed successfully!`);
    return true;
  } else {
    console.log(`⚠️  Some standalone tests failed. Check individual reports.`);
    return false;
  }
}

// Command line usage
const testModule = process.argv[2] || 'health-check';
const environment = process.argv[3] || 'prod';

console.log('🔧 Standalone Test Runner - Independent API Testing');
console.log('==================================================');

runStandaloneTests(testModule, environment).then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Standalone test execution failed:', error.message);
  process.exit(1);
});
