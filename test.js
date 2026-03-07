/**
 * Test suite for Etherscan API integration
 * Validates module exports and configuration
 */

const etherscanModule = require('./index.js');

console.log('Running module validation tests...\n');

// Test 1: Verify exports
console.log('Test 1: Checking module exports...');
const expectedExports = [
  'queryEtherscanApi',
  'buildApiPath',
  'getErc20TokenInfo',
  'ETHERSCAN_CONFIG',
  'SUPPORTED_ERC20_TOKENS',
  'DEPRECATED_NETWORKS'
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
    config.defaultChain === '1') {
  console.log('  ✓ Configuration is correct');
  console.log(`    Base URL: ${config.baseUrl}`);
  console.log(`    API Version: ${config.apiVersion}`);
  console.log(`    Default Chain (mainnet): ${config.defaultChain}`);
} else {
  console.log('  ✗ Configuration is incorrect');
  process.exit(1);
}

// Test 3: Verify path builder
console.log('\nTest 3: Testing path builder function...');
const pathDefault = etherscanModule.buildApiPath();
const pathCustom = etherscanModule.buildApiPath('137');

if (pathDefault === '/v2/api?chainid=1' && pathCustom === '/v2/api?chainid=137') {
  console.log('  ✓ Path builder works correctly');
  console.log(`    Default path (mainnet): ${pathDefault}`);
  console.log(`    Custom path (Polygon): ${pathCustom}`);
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

// Test 5: Verify SUPPORTED_ERC20_TOKENS
console.log('\nTest 5: Verifying SUPPORTED_ERC20_TOKENS...');
const tokens = etherscanModule.SUPPORTED_ERC20_TOKENS;

if (!Array.isArray(tokens) || tokens.length === 0) {
  console.log('  ✗ SUPPORTED_ERC20_TOKENS must be a non-empty array');
  process.exit(1);
}

const requiredTokenFields = ['symbol', 'name', 'chainId', 'address', 'decimals'];
let tokensValid = true;

tokens.forEach(token => {
  requiredTokenFields.forEach(field => {
    if (!(field in token)) {
      console.log(`  ✗ Token ${token.symbol || '(unknown)'} missing field: ${field}`);
      tokensValid = false;
    }
  });
  if (token.chainId !== '1') {
    console.log(`  ✗ Token ${token.symbol} must target mainnet (chainId '1'), got '${token.chainId}'`);
    tokensValid = false;
  }
  if (!/^0x[0-9a-fA-F]{40}$/.test(token.address)) {
    console.log(`  ✗ Token ${token.symbol} has invalid address format: ${token.address}`);
    tokensValid = false;
  }
});

if (tokensValid) {
  console.log(`  ✓ All ${tokens.length} tokens are valid mainnet ERC-20 entries`);
  tokens.forEach(t => console.log(`    ${t.symbol} (${t.name}) @ ${t.address}`));
} else {
  process.exit(1);
}

// Test 6: Verify DEPRECATED_NETWORKS
console.log('\nTest 6: Verifying DEPRECATED_NETWORKS...');
const deprecated = etherscanModule.DEPRECATED_NETWORKS;

if (!Array.isArray(deprecated) || deprecated.length === 0) {
  console.log('  ✗ DEPRECATED_NETWORKS must be a non-empty array');
  process.exit(1);
}

const deprecatedChainIds = deprecated.map(n => n.chainId);
const mainnetChainId = etherscanModule.ETHERSCAN_CONFIG.defaultChain;

if (deprecatedChainIds.includes(mainnetChainId)) {
  console.log(`  ✗ Mainnet (chainId ${mainnetChainId}) must not be listed as deprecated`);
  process.exit(1);
}

const allDeprecated = deprecated.every(n => n.status === 'deprecated');
if (allDeprecated) {
  console.log(`  ✓ All ${deprecated.length} deprecated networks correctly marked`);
  deprecated.forEach(n => console.log(`    ${n.name} (chainId ${n.chainId}) – ${n.status}`));
} else {
  console.log('  ✗ Some networks are missing the deprecated status');
  process.exit(1);
}

// Test 7: Verify getErc20TokenInfo
console.log('\nTest 7: Testing getErc20TokenInfo function...');
if (typeof etherscanModule.getErc20TokenInfo !== 'function') {
  console.log('  ✗ getErc20TokenInfo is not a function');
  process.exit(1);
}

const expectedUsdt = tokens.find(t => t.symbol === 'USDT');
const usdtInfo = etherscanModule.getErc20TokenInfo('USDT');
if (!usdtInfo || usdtInfo.address !== expectedUsdt.address) {
  console.log('  ✗ getErc20TokenInfo did not return correct USDT info');
  process.exit(1);
}

const usdtInfoLower = etherscanModule.getErc20TokenInfo('usdt');
if (!usdtInfoLower || usdtInfoLower.symbol !== 'USDT') {
  console.log('  ✗ getErc20TokenInfo is not case-insensitive');
  process.exit(1);
}

const unknownToken = etherscanModule.getErc20TokenInfo('UNKNOWN');
if (unknownToken !== undefined) {
  console.log('  ✗ getErc20TokenInfo should return undefined for unknown tokens');
  process.exit(1);
}

const invalidInput = etherscanModule.getErc20TokenInfo(123);
if (invalidInput !== undefined) {
  console.log('  ✗ getErc20TokenInfo should return undefined for non-string input');
  process.exit(1);
}

console.log('  ✓ getErc20TokenInfo works correctly (case-insensitive, returns undefined for unknown tokens)');

console.log('\n✓ All validation tests passed!');
console.log('\nNote: Network requests cannot be tested in this environment.');
console.log('The module is ready to use with external network access.');
