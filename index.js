/**
 * Etherscan API Integration for Smart Account Monitoring
 * Provides blockchain transaction and account verification capabilities
 */

const https = require('https');

// Configuration for Etherscan API access
// defaultChain uses the numeric chain ID for Ethereum mainnet (EIP-155)
const ETHERSCAN_CONFIG = {
  baseUrl: 'api.etherscan.io',
  apiVersion: 'v2',
  defaultChain: '1'
};

/**
 * Deprecated test networks – no longer supported by MetaMask or Infura.
 * All token integrations must target mainnet (chainId 1) or a supported L2.
 */
const DEPRECATED_NETWORKS = [
  { name: 'Ropsten',  chainId: '3',    status: 'deprecated' },
  { name: 'Rinkeby',  chainId: '4',    status: 'deprecated' },
  { name: 'Kovan',    chainId: '42',   status: 'deprecated' },
  { name: 'Goerli',   chainId: '5',    status: 'deprecated' }
];

/**
 * Consolidated list of supported ERC-20 tokens on Ethereum mainnet.
 * Deprecated token contract addresses have been replaced with their
 * current mainnet equivalents.
 */
const SUPPORTED_ERC20_TOKENS = [
  {
    symbol: 'USDT',
    name: 'Tether USD',
    chainId: '1',
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    decimals: 6
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    chainId: '1',
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    decimals: 6
  },
  {
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    chainId: '1',
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    decimals: 18
  },
  {
    symbol: 'WETH',
    name: 'Wrapped Ether',
    chainId: '1',
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    decimals: 18
  },
  {
    symbol: 'WBTC',
    name: 'Wrapped BTC',
    chainId: '1',
    address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    decimals: 8
  }
];

/**
 * Constructs the full API endpoint path
 */
function buildApiPath(chain = ETHERSCAN_CONFIG.defaultChain) {
  return `/${ETHERSCAN_CONFIG.apiVersion}/api?chainid=${chain}`;
}

/**
 * Returns the token entry from SUPPORTED_ERC20_TOKENS for the given symbol,
 * or undefined if the token is not found.
 * @param {string} symbol - ERC-20 token symbol (e.g. 'USDT')
 * @returns {object|undefined}
 */
function getErc20TokenInfo(symbol) {
  if (typeof symbol !== 'string') return undefined;
  return SUPPORTED_ERC20_TOKENS.find(
    token => token.symbol.toUpperCase() === symbol.toUpperCase()
  );
}

/**
 * Executes a GET request to Etherscan API v2
 * Uses native https module for zero external dependencies
 */
function queryEtherscanApi(chainId = ETHERSCAN_CONFIG.defaultChain) {
  return new Promise((resolve, reject) => {
    const requestConfig = {
      hostname: ETHERSCAN_CONFIG.baseUrl,
      port: 443,
      path: buildApiPath(chainId),
      method: 'GET',
      headers: {
        'User-Agent': 'SmartAccountsKit/1.0',
        'Accept': 'application/json'
      }
    };

    const req = https.request(requestConfig, (response) => {
      let dataBuffer = '';
      
      response.on('data', (chunk) => {
        dataBuffer += chunk.toString();
      });
      
      response.on('end', () => {
        if (response.statusCode >= 200 && response.statusCode < 300) {
          try {
            const parsedData = JSON.parse(dataBuffer);
            resolve({
              statusCode: response.statusCode,
              headers: response.headers,
              body: parsedData
            });
          } catch (parseError) {
            reject(new Error(`Failed to parse response: ${parseError.message}`));
          }
        } else {
          reject(new Error(`Request failed with status ${response.statusCode}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Network error: ${error.message}`));
    });

    req.end();
  });
}

// Export for use in other modules
module.exports = {
  queryEtherscanApi,
  buildApiPath,
  getErc20TokenInfo,
  ETHERSCAN_CONFIG,
  SUPPORTED_ERC20_TOKENS,
  DEPRECATED_NETWORKS
};

// CLI execution support
if (require.main === module) {
  console.log('Initiating Etherscan API v2 request...');
  console.log(`Endpoint: https://${ETHERSCAN_CONFIG.baseUrl}${buildApiPath()}`);
  
  queryEtherscanApi()
    .then(result => {
      console.log('\n✓ Request successful');
      console.log(`Status: ${result.statusCode}`);
      console.log('\nResponse data:');
      console.log(JSON.stringify(result.body, null, 2));
    })
    .catch(error => {
      console.error('\n✗ Request failed');
      console.error(`Error: ${error.message}`);
      process.exit(1);
    });
}
