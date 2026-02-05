/**
 * Test suite for Etherscan API integration
 * Validates module exports and configuration
 */

const etherscanModule = require('./index.js');

console.log('Running module validation tests...\n');

// Test 1: Verify exports
console.log('Test 1: Checking module exports...');
const expectedExports = ['queryEtherscanApi', 'buildApiPath', 'ETHERSCAN_CONFIG'];
const actualExports = Object.keys(etherscanModule);

let exportsValid = true;
expectedExports.forEach(exportName => {
  if (!actualExports.includes(exportName)) {
    console.log(`  ✗ Missing export: ${exportName}`);
    exportsValid = false;
  }
});

if (exportsValid) {
  console.log('  ✓ All required exports present');
} else {
  console.log('  ✗ Some exports missing');
  process.exit(1);
}

// Test 2: Verify configuration
console.log('\nTest 2: Verifying configuration...');
const config = etherscanModule.ETHERSCAN_CONFIG;

if (config.baseUrl === 'api.etherscan.io' &&
    config.apiVersion === 'v2' &&
    config.defaultChain === 'eth') {
  console.log('  ✓ Configuration is correct');
  console.log(`    Base URL: ${config.baseUrl}`);
  console.log(`    API Version: ${config.apiVersion}`);
  console.log(`    Default Chain: ${config.defaultChain}`);
} else {
  console.log('  ✗ Configuration is incorrect');
  process.exit(1);
}

// Test 3: Verify path builder
console.log('\nTest 3: Testing path builder function...');
const pathDefault = etherscanModule.buildApiPath();
const pathCustom = etherscanModule.buildApiPath('1');

if (pathDefault === '/v2/api?chainid=eth' && pathCustom === '/v2/api?chainid=1') {
  console.log('  ✓ Path builder works correctly');
  console.log(`    Default path: ${pathDefault}`);
  console.log(`    Custom path: ${pathCustom}`);
} else {
  console.log('  ✗ Path builder failed');
  console.log(`    Got: ${pathDefault} and ${pathCustom}`);
  process.exit(1);
}

// Test 4: Verify function signature
console.log('\nTest 4: Checking queryEtherscanApi function...');
if (typeof etherscanModule.queryEtherscanApi === 'function') {
  console.log('  ✓ queryEtherscanApi is a function');
  
  // Verify it returns a Promise with default parameter
  const resultDefault = etherscanModule.queryEtherscanApi();
  if (resultDefault instanceof Promise) {
    console.log('  ✓ Returns a Promise (default chain)');
    resultDefault.catch(() => {});
  } else {
    console.log('  ✗ Does not return a Promise');
    process.exit(1);
  }
  
  // Verify it returns a Promise with custom parameter
  const resultCustom = etherscanModule.queryEtherscanApi('1');
  if (resultCustom instanceof Promise) {
    console.log('  ✓ Returns a Promise (custom chain)');
    resultCustom.catch(() => {});
  } else {
    console.log('  ✗ Does not return a Promise');
    process.exit(1);
  }
} else {
  console.log('  ✗ queryEtherscanApi is not a function');
  process.exit(1);
}

console.log('\n✓ All validation tests passed!');
console.log('\nNote: Network requests cannot be tested in this environment.');
console.log('The module is ready to use with external network access.');
