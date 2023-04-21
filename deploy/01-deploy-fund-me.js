const { networkConfig, developmentChains } = require('../helper-hardhat-config')
const { network } = require('hardhat')

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = network.config.chainId

  // What happens when we want to change chains?
  // const ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeed
  let ethUsdPriceFeedAddress

  if (developmentChains.includes(network.name)) {
    const ethUsdAggregator = await deployments.get('MockV3Aggregator')
    ethUsdPriceFeedAddress = ethUsdAggregator.address
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeed
  }

  // If the contract doesn't exist, we deploy a minimal version of it for
  // local testing.

  // When testing on localhost or hardhat network we want to use a mock.
  const fundMe = await deploy('FundMe', {
    from: deployer,
    args: [ethUsdPriceFeedAddress], // put price feed address here,
    log: true,
  })

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    // Verify
  }

  log('=============================================')
}

module.exports.tags = ['all', 'fundme']
