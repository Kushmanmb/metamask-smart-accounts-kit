/**
 * Etherscan API Integration for Smart Account Monitoring
 * Provides blockchain transaction, token balance, and account verification capabilities
 */

const https = require('https');

// Configuration for Etherscan API access
const ETHERSCAN_CONFIG = {
  baseUrl: 'api.etherscan.io',
  apiVersion: 'v2',
  defaultChain: 'eth'
};

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

/**
 * Makes a parameterized GET request to the Etherscan API v2
 */
function makeEtherscanRequest(params, chainId = ETHERSCAN_CONFIG.defaultChain) {
  return new Promise((resolve, reject) => {
    const basePath = buildApiPath(chainId);
    const queryString = buildQueryString(params);
    const fullPath = `${basePath}&${queryString}`;

    const requestConfig = {
      hostname: ETHERSCAN_CONFIG.baseUrl,
      port: 443,
      path: fullPath,
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
 * Queries the native ETH balance for a given wallet address
 * @param {string} address - The wallet address to query
 * @param {string} apiKey - Etherscan API key
 * @param {string} [chainId] - Chain ID (default: 'eth')
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
    const balanceEth = (BigInt(balanceWei) * 100000n / BigInt(1e18)) / 100000n * 100000n;
    return {
      address,
      balance: balanceWei,
      balanceEth: (Number(BigInt(balanceWei)) / 1e18).toFixed(6)
    };
  });
}

/**
 * Queries the ERC-20 token balance for a given wallet address and token contract
 * @param {string} address - The wallet address to query
 * @param {string} contractAddress - The ERC-20 token contract address
 * @param {string} apiKey - Etherscan API key
 * @param {string} [chainId] - Chain ID (default: 'eth')
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

// Export for use in other modules
module.exports = {
  queryEtherscanApi,
  buildApiPath,
  buildQueryString,
  makeEtherscanRequest,
  queryEthBalance,
  queryTokenBalance,
  ETHERSCAN_CONFIG
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

