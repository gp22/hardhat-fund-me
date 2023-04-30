const { deployments, ethers, getNamedAccounts, network } = require('hardhat')

async function main() {
  const { deployer } = await getNamedAccounts()
  const fundMe = await ethers.getContract('FundMe', deployer)
  const sendValue = ethers.utils.parseEther('0.1')

  console.log('Funding contract...')

  const transactionResponse = await fundMe.withdraw()

  await transactionResponse.wait(1)

  console.log('Withdrawn!')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
