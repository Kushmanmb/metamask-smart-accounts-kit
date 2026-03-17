/**
 * Deprecated Token Recycling ♻️
 *
 * Queries a wallet address for ETH balances remaining on deprecated test networks
 * (Ropsten, Rinkeby, Kovan, Goerli) and generates a recycling report to guide
 * migration of any funds to a supported network.
 *
 * Usage:
 *   ETHERSCAN_API_KEY=<key> WALLET_ADDRESS=<address> node recycle.js
 *
 * Environment variables:
 *   WALLET_ADDRESS      - The wallet address to audit (required)
 *   ETHERSCAN_API_KEY   - Etherscan API key (required)
 */

const fs = require('fs');
const path = require('path');
const { generateRecyclingReport } = require('./index.js');

/**
 * Renders a markdown summary of the recycling report for display in a
 * GitHub Actions step summary or terminal output.
 * @param {object} report - Report produced by generateRecyclingReport
 * @returns {string} Markdown-formatted summary
 */
function renderMarkdownSummary(report) {
  const rows = report.networks
    .map(n => {
      const statusIcon = n.hasBalance ? '♻️ Recycle' : '✅ Empty';
      const balanceCell = n.error ? `_error: ${n.error}_` : `${n.balanceEth} ETH`;
      return `| ${n.network} | ${n.chainId} | ${balanceCell} | ${statusIcon} |`;
    })
    .join('\n');

  const actionNote = report.summary.recyclableFound
    ? '> ⚠️ **Action required:** Funds detected on deprecated networks. Migrate to a supported network before these chains are fully shut down.'
    : '> ✅ **No action required:** No balances found on deprecated networks.';

  return `## ♻️ Deprecated Token Recycling Report

**Address:** \`${report.address}\`
**Checked at:** ${report.timestamp}

### Network Balance Summary

| Network | Chain ID | Balance | Status |
|---------|----------|---------|--------|
${rows}

### Summary

- **Deprecated networks checked:** ${report.summary.totalDeprecatedNetworks}
- **Networks with recyclable balance:** ${report.summary.networksWithBalance}

${actionNote}
`;
}

async function main() {
  const address = process.env.WALLET_ADDRESS;
  const apiKey = process.env.ETHERSCAN_API_KEY;

  if (!address) {
    console.error('Error: WALLET_ADDRESS environment variable is required');
    process.exit(1);
  }
  if (!apiKey) {
    console.error('Error: ETHERSCAN_API_KEY environment variable is required');
    process.exit(1);
  }

  console.log(`♻️  Checking deprecated network balances for: ${address}\n`);

  const report = await generateRecyclingReport(address, apiKey);

  // Write JSON report artifact
  const reportPath = path.join(process.cwd(), 'recycling-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`Report saved to: ${reportPath}`);

  // Append markdown summary to GitHub Actions step summary when running in CI
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, renderMarkdownSummary(report));
  }

  // Print human-readable summary to stdout
  console.log('\n=== Recycling Report ===');
  console.log(`Address:                    ${report.address}`);
  console.log(`Deprecated networks checked: ${report.summary.totalDeprecatedNetworks}`);
  console.log(`Networks with balance:       ${report.summary.networksWithBalance}`);
  console.log('');

  report.networks.forEach(n => {
    const label = n.hasBalance ? `♻️  ${n.balanceEth} ETH – recycle` : '✅ empty';
    const errorSuffix = n.error ? ` (query error: ${n.error})` : '';
    console.log(`  ${n.network.padEnd(10)} (chainId ${n.chainId.padEnd(4)}): ${label}${errorSuffix}`);
  });

  if (report.summary.recyclableFound) {
    console.log('\n⚠️  Recyclable funds detected. Please migrate to a supported network.');
    process.exit(0);
  } else {
    console.log('\n✓ No recyclable balances found on deprecated networks.');
  }
}

main().catch(err => {
  console.error(`\n✗ Fatal error: ${err.message}`);
  process.exit(1);
});
