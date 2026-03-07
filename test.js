/**
 * Test suite for Etherscan API integration
 * Validates module exports, configuration, and token balance functions
 */

const etherscanModule = require('./index.js');

console.log('Running module validation tests...\n');

// Test 1: Verify exports
console.log('Test 1: Checking module exports...');
const expectedExports = [
  'queryEtherscanApi',
  'buildApiPath',
  'buildQueryString',
  'makeEtherscanRequest',
  'queryEthBalance',
  'queryTokenBalance',
  'ETHERSCAN_CONFIG'
];
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

// Test 5: Verify buildQueryString function
console.log('\nTest 5: Testing buildQueryString function...');
const queryStr = etherscanModule.buildQueryString({
  module: 'account',
  action: 'balance',
  address: '0x1234',
  tag: 'latest',
  extra: null,
  empty: undefined
});
const expectedStr = 'module=account&action=balance&address=0x1234&tag=latest';
if (queryStr === expectedStr) {
  console.log('  ✓ buildQueryString works correctly');
  console.log(`    Query string: ${queryStr}`);
} else {
  console.log('  ✗ buildQueryString failed');
  console.log(`    Expected: ${expectedStr}`);
  console.log(`    Got: ${queryStr}`);
  process.exit(1);
}

// Test 6: Verify queryEthBalance input validation
console.log('\nTest 6: Testing queryEthBalance input validation...');
let validationPassed = true;

etherscanModule.queryEthBalance(null, 'apikey').catch(err => {
  if (err.message === 'Address is required') {
    console.log('  ✓ Rejects missing address');
  } else {
    console.log(`  ✗ Wrong error for missing address: ${err.message}`);
    validationPassed = false;
  }
});

etherscanModule.queryEthBalance('0x1234', null).catch(err => {
  if (err.message === 'API key is required') {
    console.log('  ✓ Rejects missing API key');
  } else {
    console.log(`  ✗ Wrong error for missing API key: ${err.message}`);
    validationPassed = false;
  }
});

const ethBalanceResult = etherscanModule.queryEthBalance('0x1234', 'apikey');
if (ethBalanceResult instanceof Promise) {
  console.log('  ✓ queryEthBalance returns a Promise');
  ethBalanceResult.catch(() => {});
} else {
  console.log('  ✗ queryEthBalance does not return a Promise');
  validationPassed = false;
}

if (!validationPassed) {
  process.exit(1);
}

// Test 7: Verify queryTokenBalance input validation
console.log('\nTest 7: Testing queryTokenBalance input validation...');
let tokenValidationPassed = true;

etherscanModule.queryTokenBalance(null, '0xtoken', 'apikey').catch(err => {
  if (err.message === 'Address is required') {
    console.log('  ✓ Rejects missing address');
  } else {
    console.log(`  ✗ Wrong error for missing address: ${err.message}`);
    tokenValidationPassed = false;
  }
});

etherscanModule.queryTokenBalance('0x1234', null, 'apikey').catch(err => {
  if (err.message === 'Contract address is required') {
    console.log('  ✓ Rejects missing contract address');
  } else {
    console.log(`  ✗ Wrong error for missing contract address: ${err.message}`);
    tokenValidationPassed = false;
  }
});

etherscanModule.queryTokenBalance('0x1234', '0xtoken', null).catch(err => {
  if (err.message === 'API key is required') {
    console.log('  ✓ Rejects missing API key');
  } else {
    console.log(`  ✗ Wrong error for missing API key: ${err.message}`);
    tokenValidationPassed = false;
  }
});

const tokenBalanceResult = etherscanModule.queryTokenBalance('0x1234', '0xtoken', 'apikey');
if (tokenBalanceResult instanceof Promise) {
  console.log('  ✓ queryTokenBalance returns a Promise');
  tokenBalanceResult.catch(() => {});
} else {
  console.log('  ✗ queryTokenBalance does not return a Promise');
  tokenValidationPassed = false;
}

if (!tokenValidationPassed) {
  process.exit(1);
}

console.log('\n✓ All validation tests passed!');
console.log('\nNote: Network requests cannot be tested in this environment.');
console.log('The module is ready to use with external network access.');

