#!/usr/bin/env node

/**
 * Comprehensive Test Runner
 * Runs all available test suites in sequence
 * Supports both development and production environments
 */

const { execSync } = require('child_process');
const path = require('path');

// Available test modules
const testModules = [
  'health-check',
  'general-data'
];

// Configuration for different environments
const config = {
  dev: {
    baseUrl: 'http://svb.local:8000',
    description: 'Development Environment Testing',
    timeout: 300000 // 5 minutes timeout per module
  },
  prod: {
    baseUrl: 'https://devtest2.onrender.com',
    description: 'Production Environment Testing',
    timeout: 600000 // 10 minutes timeout per module
  }
};

function runTestModule(module, environment) {
  const envConfig = config[environment];
  
  console.log(`\n🧪 Running ${module} tests...`);
  console.log(`🌐 Environment: ${environment}`);
  console.log(`⏱️  Timeout: ${envConfig.timeout/1000} seconds`);
  
  try {
    const command = `node test/standalone-test-runner.js ${module} ${environment}`;
    const startTime = Date.now();
    
    execSync(command, { 
      stdio: 'inherit',
      timeout: envConfig.timeout
    });
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log(`✅ ${module} tests completed successfully in ${duration.toFixed(1)}s`);
    return { module, success: true, duration };
    
  } catch (error) {
    console.error(`❌ ${module} tests failed:`, error.message);
    return { module, success: false, error: error.message };
  }
}

async function runAllTests(environment) {
  const envConfig = config[environment];
  
  if (!envConfig) {
    console.error(`❌ Unknown environment: ${environment}`);
    console.log('Available environments:', Object.keys(config).join(', '));
    process.exit(1);
  }
  
  console.log(`🚀 Comprehensive Test Runner`);
  console.log(`📋 ${envConfig.description}`);
  console.log(`🌐 Target: ${envConfig.baseUrl}`);
  console.log(`📊 Test Modules: ${testModules.join(', ')}`);
  console.log(`⏱️  Total timeout: ${(envConfig.timeout * testModules.length / 1000 / 60).toFixed(1)} minutes`);
  console.log(`📁 Reports will be saved in: test/reports/`);
  
  const results = [];
  const startTime = Date.now();
  
  // Run each test module sequentially
  for (const module of testModules) {
    const result = runTestModule(module, environment);
    results.push(result);
    
    // Add a small delay between modules
    if (module !== testModules[testModules.length - 1]) {
      console.log(`⏳ Waiting 5 seconds before next module...`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  
  const endTime = Date.now();
  const totalTime = (endTime - startTime) / 1000;
  const successfulModules = results.filter(r => r.success).length;
  
  // Print comprehensive summary
  console.log(`\n📊 Comprehensive Test Summary:`);
  console.log(`================================`);
  console.log(`🌐 Environment: ${environment}`);
  console.log(`⏱️  Total time: ${totalTime.toFixed(1)} seconds`);
  console.log(`📊 Modules tested: ${testModules.length}`);
  console.log(`✅ Successful: ${successfulModules}`);
  console.log(`❌ Failed: ${testModules.length - successfulModules}`);
  
  console.log(`\n📋 Detailed Results:`);
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    const duration = result.duration ? ` (${result.duration.toFixed(1)}s)` : '';
    console.log(`${status} ${result.module}${duration}`);
    if (!result.success && result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  console.log(`\n📁 All reports saved in: test/reports/`);
  
  if (successfulModules === testModules.length) {
    console.log(`🎉 All test modules completed successfully!`);
    return true;
  } else {
    console.log(`⚠️  Some test modules failed. Check individual reports.`);
    return false;
  }
}

// Command line usage
const environment = process.argv[2] || 'dev';

console.log('🔧 Comprehensive Test Runner - All API Test Suites');
console.log('==================================================');

runAllTests(environment).then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Comprehensive test execution failed:', error.message);
  process.exit(1);
});
