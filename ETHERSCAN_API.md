# Etherscan API v2 Integration

This module provides integration with Etherscan's API v2 for querying blockchain data related to smart accounts.

## Overview

The implementation uses Node.js native `https` module (no external HTTP dependencies) to make GET requests to Etherscan's v2 API endpoint.

## Features

- Zero external HTTP dependencies (uses native Node.js https module)
- Promise-based async API
- Configurable chain ID support
- CLI and module usage modes
- Error handling for network and parsing failures

## Usage

### As a CLI Tool

Run directly from command line:

```bash
node index.js
```

Or using npm/yarn scripts:

```bash
yarn start
# or
yarn query-etherscan
```

### As a Module

Import and use in your Node.js code:

```javascript
const { queryEtherscanApi, buildApiPath, ETHERSCAN_CONFIG } = require('./index.js');

// Query Etherscan API for default chain (eth)
queryEtherscanApi()
  .then(result => {
    console.log('Status:', result.statusCode);
    console.log('Data:', result.body);
  })
  .catch(error => {
    console.error('Error:', error.message);
  });

// Query for specific chain ID
queryEtherscanApi('1')
  .then(result => {
    // Handle result
  });
```

## API Reference

### `queryEtherscanApi(chainId = 'eth')`

Executes a GET request to Etherscan API v2 endpoint.

**Parameters:**
- `chainId` (string, optional): The blockchain chain ID. Default: 'eth'

**Returns:**
- Promise that resolves to an object containing:
  - `statusCode`: HTTP status code
  - `headers`: Response headers
  - `body`: Parsed JSON response data

**Throws:**
- Error if network request fails
- Error if response cannot be parsed as JSON
- Error if HTTP status code indicates failure

### `buildApiPath(chain)`

Constructs the API endpoint path with chain parameter.

**Parameters:**
- `chain` (string, optional): Chain identifier. Default: 'eth'

**Returns:**
- String: The formatted API path

### `ETHERSCAN_CONFIG`

Configuration object containing:
- `baseUrl`: Etherscan API hostname
- `apiVersion`: API version identifier
- `defaultChain`: Default chain to query

## Testing

Run the validation tests:

```bash
yarn test
```

This validates:
- Module exports are correct
- Configuration is properly set
- Path builder works correctly  
- Query function returns Promise

## Implementation Details

The module makes HTTPS GET requests to:
```
https://api.etherscan.io/v2/api?chainid={chain}
```

Request headers include:
- `User-Agent`: SmartAccountsKit/1.0
- `Accept`: application/json

## Integration with Smart Accounts Kit

This module is designed to work alongside `@metamask/smart-accounts-kit` to provide blockchain data verification and transaction monitoring capabilities for smart accounts.

## Network Requirements

Requires outbound HTTPS access to `api.etherscan.io` on port 443.

## Error Handling

The module handles:
- Network connectivity errors
- HTTP error status codes
- JSON parsing failures

All errors are wrapped in descriptive Error objects with clear messages.
