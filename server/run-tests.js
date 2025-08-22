#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Starting Job Portal API Tests...\n');

try {
  // Install dependencies if needed
  console.log('📦 Checking dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  // Run the tests
  console.log('\n🧪 Running API tests...');
  execSync('npm test', { stdio: 'inherit' });

  console.log('\n✅ All tests completed successfully!');
} catch (error) {
  console.error('\n❌ Tests failed:', error.message);
  process.exit(1);
}
