'use strict';

const assert = require('assert');
const {
  createMetaMaskSmartAccount
} = require('./smart-account');

async function expectReject(promise, expectedMessage) {
  try {
    await promise;
    assert.fail(`Expected rejection: ${expectedMessage}`);
  } catch (error) {
    assert.strictEqual(error.message, expectedMessage);
  }
}

async function runTests() {
  console.log('Running Smart Account validation tests...\n');

  await expectReject(
    createMetaMaskSmartAccount(),
    'client is required'
  );
  console.log('✓ Rejects missing client');

  await expectReject(
    createMetaMaskSmartAccount({ client: {} }),
    'implementation is required'
  );
  console.log('✓ Rejects missing implementation');

  await expectReject(
    createMetaMaskSmartAccount({
      client: {},
      implementation: {}
    }),
    'signer is required'
  );
  console.log('✓ Rejects missing signer');

  const base = {
    client: {},
    implementation: {},
    signer: {}
  };

  await expectReject(
    createMetaMaskSmartAccount(base),
    'Either address or deployParams and deploySalt are required'
  );
  console.log('✓ Requires account configuration');

  await expectReject(
    createMetaMaskSmartAccount({
      ...base,
      deployParams: {}
    }),
    'deployParams and deploySalt must be provided together'
  );
  console.log('✓ Rejects deployParams without deploySalt');

  await expectReject(
    createMetaMaskSmartAccount({
      ...base,
      deploySalt: '0x01'
    }),
    'deployParams and deploySalt must be provided together'
  );
  console.log('✓ Rejects deploySalt without deployParams');

  await expectReject(
    createMetaMaskSmartAccount({
      ...base,
      address: '0x0000000000000000000000000000000000000001',
      deployParams: {},
      deploySalt: '0x01'
    }),
    'Provide either address or deployment parameters, not both'
  );
  console.log('✓ Rejects conflicting account configuration');

  console.log('\n✓ Smart Account validation tests passed!');
}

runTests().catch(error => {
  console.error('\n✗ Smart Account tests failed');
  console.error(error);
  process.exit(1);
});
