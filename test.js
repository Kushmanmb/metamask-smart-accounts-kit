/**
 * Test suite for Etherscan API integration
 * Validates module exports, configuration, and API key handling
 */

const etherscanModule = require('./index.js');

console.log('Running module validation tests...\n');

// Test 1: Verify exports
console.log('Test 1: Checking module exports...');
const expectedExports = ['queryEtherscanApi', 'buildApiPath', 'getApiKey', 'ETHERSCAN_CONFIG'];
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

// Test 3: Verify path builder with explicit API key
console.log('\nTest 3: Testing path builder function...');
const testApiKey = 'TESTKEY123';
const pathDefault = etherscanModule.buildApiPath('eth', testApiKey);
const pathCustom = etherscanModule.buildApiPath('1', testApiKey);

if (pathDefault === `/v2/api?chainid=eth&apikey=${testApiKey}` &&
    pathCustom === `/v2/api?chainid=1&apikey=${testApiKey}`) {
  console.log('  ✓ Path builder works correctly');
  console.log(`    Default path: /v2/api?chainid=eth&apikey=***`);
  console.log(`    Custom path:  /v2/api?chainid=1&apikey=***`);
} else {
  console.log('  ✗ Path builder failed');
  process.exit(1);
}

// Test 4: Verify getApiKey throws when env var is not set
console.log('\nTest 4: Verifying API key environment variable guard...');
const savedKey = process.env.ETHERSCAN_API_KEY;
delete process.env.ETHERSCAN_API_KEY;

let threwCorrectly = false;
try {
  etherscanModule.getApiKey();
} catch (err) {
  if (err.message.includes('ETHERSCAN_API_KEY')) {
    threwCorrectly = true;
  }
}

if (threwCorrectly) {
  console.log('  ✓ getApiKey throws when ETHERSCAN_API_KEY is not set');
} else {
  console.log('  ✗ getApiKey should throw when ETHERSCAN_API_KEY is not set');
  process.exit(1);
}

// Test 5: Verify getApiKey returns the key when env var is set
console.log('\nTest 5: Verifying getApiKey reads from environment...');
process.env.ETHERSCAN_API_KEY = 'env-test-key';

let envKey;
try {
  envKey = etherscanModule.getApiKey();
} catch (err) {
  console.log(`  ✗ getApiKey threw unexpectedly: ${err.message}`);
  process.exit(1);
}

if (envKey === 'env-test-key') {
  console.log('  ✓ getApiKey correctly reads ETHERSCAN_API_KEY from environment');
} else {
  console.log('  ✗ getApiKey returned unexpected value');
  process.exit(1);
}

// Restore environment
if (savedKey !== undefined) {
  process.env.ETHERSCAN_API_KEY = savedKey;
} else {
  delete process.env.ETHERSCAN_API_KEY;
}

// Test 6: Verify queryEtherscanApi function signature
console.log('\nTest 6: Checking queryEtherscanApi function...');
if (typeof etherscanModule.queryEtherscanApi === 'function') {
  console.log('  ✓ queryEtherscanApi is a function');

  // Verify it returns a Promise when called with explicit API key
  const resultCustom = etherscanModule.queryEtherscanApi('1', testApiKey);
  if (resultCustom instanceof Promise) {
    console.log('  ✓ Returns a Promise (explicit API key)');
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
console.log('Set ETHERSCAN_API_KEY in your environment before running the module for real requests.');
