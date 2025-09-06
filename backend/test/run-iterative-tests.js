#!/usr/bin/env node

/**
 * Proper Iterative Test Runner
 * Runs tests multiple times with delays between iterations
 */

const { execSync } = require('child_process');
const path = require('path');

// Configuration
const config = {
  dev: {
    collection: 'test/collections/health-check/health-check-collection.json',
    environment: 'test/environments/dev-environment.json',
    iterations: 2,
    delayBetweenIterations: 5000, // 5 seconds
    baseUrl: 'http://svb.local:8000'
  },
  prod: {
    collection: 'test/collections/health-check/health-check-collection.json',
    environment: 'test/environments/prod-environment.json',
    iterations: 2,
    delayBetweenIterations: 60000, // 1 minute
    baseUrl: 'https://devtest2.onrender.com'
  }
};

function generateReportName(module, environment, iteration) {
  const now = new Date();
  const timestamp = now.toISOString()
    .replace(/:/g, '-')
    .replace(/\..+/, '')
    .replace('T', '-');
  
  return `${module}-${environment}-iteration-${iteration}-${timestamp}.html`;
}

function runSingleIteration(module, environment, iteration, totalIterations) {
  const envConfig = config[environment];
  const reportName = generateReportName(module, environment, iteration);
  const reportPath = path.join('test', 'reports', reportName);
  
  console.log(`\n🧪 Running iteration ${iteration}/${totalIterations}...`);
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

async function runIterativeTests(module, environment) {
  const envConfig = config[environment];
  
  if (!envConfig) {
    console.error(`❌ Unknown environment: ${environment}`);
    console.log('Available environments:', Object.keys(config).join(', '));
    process.exit(1);
  }
  
  console.log(`🚀 Starting iterative tests for ${module} (${environment})`);
  console.log(`📊 Iterations: ${envConfig.iterations}`);
  console.log(`⏱️  Delay between iterations: ${envConfig.delayBetweenIterations/1000} seconds`);
  console.log(`🌐 Base URL: ${envConfig.baseUrl}`);
  
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
  
  console.log(`\n📊 Test Summary:`);
  console.log(`✅ Successful iterations: ${successfulIterations}/${envConfig.iterations}`);
  console.log(`⏱️  Total time: ${totalTime.toFixed(1)} seconds`);
  console.log(`📁 Reports saved in: test/reports/`);
  
  if (successfulIterations === envConfig.iterations) {
    console.log(`🎉 All iterations completed successfully!`);
    return true;
  } else {
    console.log(`⚠️  Some iterations failed. Check individual reports.`);
    return false;
  }
}

// Command line usage
const testModule = process.argv[2] || 'health-check';
const environment = process.argv[3] || 'dev';

runIterativeTests(testModule, environment).then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Test execution failed:', error.message);
  process.exit(1);
});
