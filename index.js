/**
 * Etherscan API Integration for Smart Account Monitoring
 * Provides blockchain transaction and account verification capabilities
 *
 * Required environment variable:
 *   ETHERSCAN_API_KEY - Your Etherscan API key (never hard-code this value)
 */

const https = require('https');

// Configuration for Etherscan API access
const ETHERSCAN_CONFIG = {
  baseUrl: 'api.etherscan.io',
  apiVersion: 'v2',
  defaultChain: 'eth'
};

/**
 * Retrieves the Etherscan API key from the environment.
 * Throws if the key is not set, preventing accidental unauthenticated requests.
 */
function getApiKey() {
  const key = process.env.ETHERSCAN_API_KEY;
  if (!key) {
    throw new Error(
      'ETHERSCAN_API_KEY environment variable is not set. ' +
      'Set it before running this module. Never hard-code API keys in source code.'
    );
  }
  return key;
}

/**
 * Constructs the full API endpoint path, including the API key.
 * @param {string} [chain] - Chain identifier (default: ETHERSCAN_CONFIG.defaultChain)
 * @param {string} [apiKey] - Etherscan API key (default: read from ETHERSCAN_API_KEY env var)
 */
function buildApiPath(chain = ETHERSCAN_CONFIG.defaultChain, apiKey = getApiKey()) {
  return `/${ETHERSCAN_CONFIG.apiVersion}/api?chainid=${chain}&apikey=${apiKey}`;
}

/**
 * Executes a GET request to Etherscan API v2.
 * Uses native https module for zero external dependencies.
 * @param {string} [chainId] - Chain identifier (default: ETHERSCAN_CONFIG.defaultChain)
 * @param {string} [apiKey] - Etherscan API key (default: read from ETHERSCAN_API_KEY env var)
 */
function queryEtherscanApi(chainId = ETHERSCAN_CONFIG.defaultChain, apiKey = getApiKey()) {
  return new Promise((resolve, reject) => {
    const requestConfig = {
      hostname: ETHERSCAN_CONFIG.baseUrl,
      port: 443,
      path: buildApiPath(chainId, apiKey),
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
  getApiKey,
  ETHERSCAN_CONFIG
};

// CLI execution support
if (require.main === module) {
  let apiKey;
  try {
    apiKey = getApiKey();
  } catch (err) {
    console.error(`\n✗ Configuration error: ${err.message}`);
    process.exit(1);
  }

  // Only log the endpoint without the key to avoid accidental exposure in logs
  console.log('Initiating Etherscan API v2 request...');
  console.log(`Endpoint: https://${ETHERSCAN_CONFIG.baseUrl}/${ETHERSCAN_CONFIG.apiVersion}/api?chainid=${ETHERSCAN_CONFIG.defaultChain}&apikey=***`);

  queryEtherscanApi(ETHERSCAN_CONFIG.defaultChain, apiKey)
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
