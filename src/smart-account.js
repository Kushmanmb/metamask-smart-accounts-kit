'use strict';

const {
  toMetaMaskSmartAccount
} = require('@metamask/smart-accounts-kit');

/**
 * Creates or connects to a MetaMask Smart Account.
 *
 * Raw private keys and seed phrases should never be passed to this module.
 * The caller must provide a compatible signer.
 */
async function createMetaMaskSmartAccount(params = {}) {
  const {
    client,
    implementation,
    signer,
    environment,
    address,
    deployParams,
    deploySalt
  } = params;

  if (!client) {
    throw new TypeError('client is required');
  }

  if (!implementation) {
    throw new TypeError('implementation is required');
  }

  if (!signer) {
    throw new TypeError('signer is required');
  }

  const hasAddress = Boolean(address);

  const hasDeployParams = deployParams !== undefined;
  const hasDeploySalt = deploySalt !== undefined;

  if (hasDeployParams !== hasDeploySalt) {
    throw new TypeError(
      'deployParams and deploySalt must be provided together'
    );
  }

  const hasDeployment = hasDeployParams && hasDeploySalt;

  if (hasAddress && hasDeployment) {
    throw new TypeError(
      'Provide either address or deployment parameters, not both'
    );
  }

  if (!hasAddress && !hasDeployment) {
    throw new TypeError(
      'Either address or deployParams and deploySalt are required'
    );
  }

  const accountParams = {
    client,
    implementation,
    signer
  };

  if (environment !== undefined) {
    accountParams.environment = environment;
  }

  if (hasAddress) {
    accountParams.address = address;
  } else {
    accountParams.deployParams = deployParams;
    accountParams.deploySalt = deploySalt;
  }

  return toMetaMaskSmartAccount(accountParams);
}

module.exports = {
  createMetaMaskSmartAccount
};
