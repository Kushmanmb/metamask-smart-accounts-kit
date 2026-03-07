# Etherscan API v2 Integration

This module provides integration with Etherscan's API v2 for querying blockchain data related to smart accounts.

## Overview

The implementation uses Node.js native `https` module (no external HTTP dependencies) to make GET requests to Etherscan's v2 API endpoint.

## Features

- Zero external HTTP dependencies (uses native Node.js https module)
- Promise-based async API
- Configurable chain ID support
- CLI and module usage modes
- Secure API key handling via environment variable (never hard-coded)
- Error handling for network and parsing failures

## Setup

### API Key (Required)

An Etherscan API key is required to authenticate requests. **Never hard-code API keys in source code.**

1. Obtain a free API key at [https://etherscan.io/myapikey](https://etherscan.io/myapikey)
2. Set the `ETHERSCAN_API_KEY` environment variable before running the module:

```bash
export ETHERSCAN_API_KEY=your_api_key_here
```

Or create a `.env` file (already excluded by `.gitignore`):

```
ETHERSCAN_API_KEY=your_api_key_here
```

> ⚠️ **Security notice:** Never commit your API key to version control. The `.gitignore` file in this repository excludes `.env` files to prevent accidental exposure.

## Usage

### As a CLI Tool

Set the API key environment variable, then run directly from the command line:

```bash
export ETHERSCAN_API_KEY=your_api_key_here
node index.js
```

Or using npm/yarn scripts:

```bash
ETHERSCAN_API_KEY=your_api_key_here yarn start
# or
ETHERSCAN_API_KEY=your_api_key_here yarn query-etherscan
```

### As a Module

Import and use in your Node.js code:

```javascript
const { queryEtherscanApi, buildApiPath, getApiKey, ETHERSCAN_CONFIG } = require('./index.js');

// The module reads ETHERSCAN_API_KEY from process.env automatically
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

// Provide API key explicitly (useful in tests)
queryEtherscanApi('1', process.env.MY_CUSTOM_KEY)
  .then(result => {
    // Handle result
  });
```

## API Reference

### `getApiKey()`

Reads the Etherscan API key from the `ETHERSCAN_API_KEY` environment variable.

**Returns:**
- String: The API key value

**Throws:**
- Error if `ETHERSCAN_API_KEY` is not set in the environment

### `queryEtherscanApi(chainId?, apiKey?)`

Executes a GET request to Etherscan API v2 endpoint.

**Parameters:**
- `chainId` (string, optional): The blockchain chain ID. Default: `'eth'`
- `apiKey` (string, optional): Etherscan API key. Default: read from `ETHERSCAN_API_KEY` env var

**Returns:**
- Promise that resolves to an object containing:
  - `statusCode`: HTTP status code
  - `headers`: Response headers
  - `body`: Parsed JSON response data

**Throws:**
- Error if `ETHERSCAN_API_KEY` environment variable is not set (and no key is passed)
- Error if network request fails
- Error if response cannot be parsed as JSON
- Error if HTTP status code indicates failure

### `buildApiPath(chain?, apiKey?)`

Constructs the API endpoint path with chain and API key parameters.

**Parameters:**
- `chain` (string, optional): Chain identifier. Default: `'eth'`
- `apiKey` (string, optional): Etherscan API key. Default: read from `ETHERSCAN_API_KEY` env var

**Returns:**
- String: The formatted API path (includes `apikey` query parameter)

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
- API key environment variable guard works
- `getApiKey` reads from environment correctly
- Query function returns Promise

## Implementation Details

The module makes HTTPS GET requests to:
```
https://api.etherscan.io/v2/api?chainid={chain}&apikey={apikey}
```

Request headers include:
- `User-Agent`: SmartAccountsKit/1.0
- `Accept`: application/json

The API key is sourced from the `ETHERSCAN_API_KEY` environment variable and **never logged or exposed in output**.

## Integration with Smart Accounts Kit

This module is designed to work alongside `@metamask/smart-accounts-kit` to provide blockchain data verification and transaction monitoring capabilities for smart accounts.

## Network Requirements

Requires outbound HTTPS access to `api.etherscan.io` on port 443.

## Error Handling

The module handles:
- Missing API key (environment variable not set)
- Network connectivity errors
- HTTP error status codes
- JSON parsing failures

All errors are wrapped in descriptive Error objects with clear messages.

## Security

- API keys are read from environment variables only — never hard-coded
- API keys are masked (`***`) in log output to prevent accidental exposure
- The `.gitignore` excludes `.env` files and all common secret-file patterns

