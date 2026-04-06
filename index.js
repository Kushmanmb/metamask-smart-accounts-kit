/**
 * Etherscan API Integration for Smart Account Monitoring
 * Provides blockchain transaction, token balance, and account verification capabilities
 */

const https = require('https');
const bip39 = require('bip39');

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
 * Builds query string from params object, filtering out undefined/null values
 */
function buildQueryString(params) {
  return Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
}

/**
 * Core HTTPS GET request executor for the Etherscan API
 * Collects the full response body, parses JSON, and rejects on HTTP or parse errors.
 * @param {string} path - Full request path including query string
 * @returns {Promise<{statusCode: number, headers: object, body: object}>}
 */
function executeHttpsRequest(path) {
  return new Promise((resolve, reject) => {
    const requestConfig = {
      hostname: ETHERSCAN_CONFIG.baseUrl,
      port: 443,
      path,
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

/**
 * Executes a GET request to Etherscan API v2
 * Uses native https module for zero external dependencies
 */
function queryEtherscanApi(chainId = ETHERSCAN_CONFIG.defaultChain) {
  return executeHttpsRequest(buildApiPath(chainId));
}

/**
 * Makes a parameterized GET request to the Etherscan API v2
 */
function makeEtherscanRequest(params, chainId = ETHERSCAN_CONFIG.defaultChain) {
  const basePath = buildApiPath(chainId);
  const queryString = buildQueryString(params);
  return executeHttpsRequest(`${basePath}&${queryString}`);
}

/**
 * Queries the native ETH balance for a given wallet address
 * @param {string} address - The wallet address to query
 * @param {string} apiKey - Etherscan API key
 * @param {string} [chainId] - Chain ID (default: '1' for Ethereum mainnet)
 * @returns {Promise<{address: string, balance: string, balanceEth: string}>}
 */
function queryEthBalance(address, apiKey, chainId = ETHERSCAN_CONFIG.defaultChain) {
  if (!address) {
    return Promise.reject(new Error('Address is required'));
  }
  if (!apiKey) {
    return Promise.reject(new Error('API key is required'));
  }

  const params = {
    module: 'account',
    action: 'balance',
    address,
    tag: 'latest',
    apikey: apiKey
  };

  return makeEtherscanRequest(params, chainId).then(result => {
    const body = result.body;
    if (body.status !== '1') {
      throw new Error(`Etherscan API error: ${body.message || body.result}`);
    }
    const balanceWei = body.result;
    // Perform division in BigInt to preserve precision, then format as decimal string
    const weiPerEth = BigInt('1000000000000000000');
    const balanceBigInt = BigInt(balanceWei);
    const integerPart = balanceBigInt / weiPerEth;
    const fractionalPart = ((balanceBigInt % weiPerEth) * 1000000n / weiPerEth).toString().padStart(6, '0');
    const balanceEth = `${integerPart}.${fractionalPart}`;
    return {
      address,
      balance: balanceWei,
      balanceEth
    };
  });
}

/**
 * Queries the ERC-20 token balance for a given wallet address and token contract
 * @param {string} address - The wallet address to query
 * @param {string} contractAddress - The ERC-20 token contract address
 * @param {string} apiKey - Etherscan API key
 * @param {string} [chainId] - Chain ID (default: '1' for Ethereum mainnet)
 * @returns {Promise<{address: string, contractAddress: string, balance: string}>}
 */
function queryTokenBalance(address, contractAddress, apiKey, chainId = ETHERSCAN_CONFIG.defaultChain) {
  if (!address) {
    return Promise.reject(new Error('Address is required'));
  }
  if (!contractAddress) {
    return Promise.reject(new Error('Contract address is required'));
  }
  if (!apiKey) {
    return Promise.reject(new Error('API key is required'));
  }

  const params = {
    module: 'account',
    action: 'tokenbalance',
    contractaddress: contractAddress,
    address,
    tag: 'latest',
    apikey: apiKey
  };

  return makeEtherscanRequest(params, chainId).then(result => {
    const body = result.body;
    if (body.status !== '1') {
      throw new Error(`Etherscan API error: ${body.message || body.result}`);
    }
    return {
      address,
      contractAddress,
      balance: body.result
    };
  });
}

/**
 * Looks up ERC-20 token information by symbol (case-insensitive)
 * @param {string} symbol - The token symbol to look up (e.g. 'USDT')
 * @returns {{symbol: string, name: string, chainId: string, address: string, decimals: number}|undefined}
 *   Token info object with symbol, name, chainId, address, and decimals, or undefined if not found
 */
function getErc20TokenInfo(symbol) {
  if (typeof symbol !== 'string') {
    return undefined;
  }
  return SUPPORTED_ERC20_TOKENS.find(t => t.symbol.toLowerCase() === symbol.toLowerCase());
}

/**
 * Generates a new BIP-39 mnemonic seed phrase using cryptographically secure entropy.
 *
 * **Security warning:** Seed phrases provide full access to a wallet. Never log,
 * display in plain text longer than necessary, transmit over insecure channels,
 * or store without strong encryption. This function is intended for wallet
 * initialisation flows where the phrase is shown once and immediately stored
 * securely by the caller.
 *
 * @param {number} [wordCount=12] - Number of words in the seed phrase (12 or 24)
 * @returns {string} A space-separated BIP-39 mnemonic seed phrase
 * @throws {Error} If wordCount is not 12 or 24
 */
function generateSeedPhrase(wordCount = 12) {
  if (wordCount !== 12 && wordCount !== 24) {
    throw new Error('wordCount must be 12 or 24');
  }
  // BIP-39: 12 words = 128 bits of entropy, 24 words = 256 bits of entropy
  const strength = wordCount === 24 ? 256 : 128;
  return bip39.generateMnemonic(strength);
}

/**
 * Retrieves comprehensive details for a wallet address, including the native ETH balance
 * and the balance of every supported ERC-20 token.
 *
 * Token queries that fail (e.g. the contract is not deployed on the given chain) are
 * captured individually so that one failing token does not prevent the rest of the data
 * from being returned.
 *
 * @param {string} address - The wallet address to query
 * @param {string} apiKey - Etherscan API key
 * @param {string} [chainId] - Chain ID (default: '1' for Ethereum mainnet)
 * @returns {Promise<{address: string, chainId: string, ethBalance: string, ethBalanceEth: string, tokens: Array}>}
 */
function getAddressDetails(address, apiKey, chainId = ETHERSCAN_CONFIG.defaultChain) {
  if (!address) {
    return Promise.reject(new Error('Address is required'));
  }
  if (!apiKey) {
    return Promise.reject(new Error('API key is required'));
  }

  return queryEthBalance(address, apiKey, chainId).then(ethResult => {
    const tokenQueries = SUPPORTED_ERC20_TOKENS.map(token =>
      queryTokenBalance(address, token.address, apiKey, chainId)
        .then(tokenResult => ({
          symbol: token.symbol,
          name: token.name,
          contractAddress: token.address,
          decimals: token.decimals,
          balance: tokenResult.balance
        }))
        .catch(err => ({
          symbol: token.symbol,
          name: token.name,
          contractAddress: token.address,
          decimals: token.decimals,
          balance: '0',
          error: err.message
        }))
    );

    return Promise.all(tokenQueries).then(tokens => ({
      address,
      chainId,
      ethBalance: ethResult.balance,
      ethBalanceEth: ethResult.balanceEth,
      tokens
    }));
  });
}

/**
 * Queries the native ETH balance on every deprecated network for a given wallet address.
 * Results are returned for all networks; networks that cannot be queried include an error field.
 *
 * @param {string} address - The wallet address to query
 * @param {string} apiKey - Etherscan API key
 * @returns {Promise<Array<{network: string, chainId: string, status: string, balance: string, balanceEth: string, hasBalance: boolean, error?: string}>>}
 */
function queryDeprecatedNetworkBalances(address, apiKey) {
  if (!address) {
    return Promise.reject(new Error('Address is required'));
  }
  if (!apiKey) {
    return Promise.reject(new Error('API key is required'));
  }

  const queries = DEPRECATED_NETWORKS.map(network =>
    queryEthBalance(address, apiKey, network.chainId)
      .then(result => ({
        network: network.name,
        chainId: network.chainId,
        status: network.status,
        balance: result.balance,
        balanceEth: result.balanceEth,
        hasBalance: BigInt(result.balance) > 0n
      }))
      .catch(err => ({
        network: network.name,
        chainId: network.chainId,
        status: network.status,
        balance: '0',
        balanceEth: '0.000000',
        hasBalance: false,
        error: err.message
      }))
  );

  return Promise.all(queries);
}

/**
 * Generates a recycling report for a wallet address across all deprecated networks.
 * Identifies any ETH balances that remain on deprecated test networks and should be
 * migrated (recycled ♻️) to a supported network before the deprecated chain is fully shut down.
 *
 * @param {string} address - The wallet address to audit
 * @param {string} apiKey - Etherscan API key
 * @returns {Promise<{address: string, timestamp: string, summary: object, networks: Array, recyclableNetworks: Array}>}
 */
function generateRecyclingReport(address, apiKey) {
  if (!address) {
    return Promise.reject(new Error('Address is required'));
  }
  if (!apiKey) {
    return Promise.reject(new Error('API key is required'));
  }

  return queryDeprecatedNetworkBalances(address, apiKey).then(networks => {
    const recyclableNetworks = networks.filter(n => n.hasBalance);
    return {
      address,
      timestamp: new Date().toISOString(),
      summary: {
        totalDeprecatedNetworks: DEPRECATED_NETWORKS.length,
        networksWithBalance: recyclableNetworks.length,
        recyclableFound: recyclableNetworks.length > 0
      },
      networks,
      recyclableNetworks
    };
  });
}

// Export for use in other modules
module.exports = {
  queryEtherscanApi,
  buildApiPath,
  buildQueryString,
  makeEtherscanRequest,
  queryEthBalance,
  queryTokenBalance,
  getErc20TokenInfo,
  getAddressDetails,
  generateSeedPhrase,
  queryDeprecatedNetworkBalances,
  generateRecyclingReport,
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

