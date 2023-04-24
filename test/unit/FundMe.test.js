const { deployments, ethers, getNamedAccounts } = require('hardhat')
const { expect, assert } = require('chai')

describe('FundMe', async function () {
  let fundMe, deployer, mockV3Aggregator
  const sendValue = ethers.utils.parseEther('1') // 1 ETH

  beforeEach(async function () {
    // Deploy fundme contract using hardhat deploy.
    // const accounts = await ethers.getSigners()
    // const accountZero = accounts[0]
    deployer = (await getNamedAccounts()).deployer
    await deployments.fixture(['all'])
    fundMe = await ethers.getContract('FundMe', deployer)
    mockV3Aggregator = await ethers.getContract('MockV3Aggregator', deployer)
  })

  describe('constructor', async function () {
    it('Sets the aggregator address correctly', async function () {
      const response = await fundMe.priceFeed()
      expect(response).to.equal(mockV3Aggregator.address)
    })
  })

  describe('fund', async function () {
    it("Fails if you don't send enough ETH", async function () {
      await expect(fundMe.fund()).to.be.revertedWith(
        'You need to spend more ETH!'
      )
    })

    it('Updates the amount funded data structure', async function () {
      await fundMe.fund({ value: sendValue })
      const response = await fundMe.addressToAmountFunded(deployer)
      expect(response.toString()).to.equal(sendValue.toString())
    })

    it('Adds funder to array of funders', async function () {
      await fundMe.fund({ value: sendValue })
      const funder = await fundMe.funders(0)
      expect(funder).to.equal(deployer)
    })
  })

  describe('withdraw', async function () {
    beforeEach(async function () {
      await fundMe.fund({ value: sendValue })
    })

    it('Can withdraw ETH from a single founder', async function () {
      // Arrange
      const startingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      )
      const startingDeployerBalance = await fundMe.provider.getBalance(deployer)
      // Act
      const transactionResponse = await fundMe.withdraw()
      const transactionReceipt = await transactionResponse.wait(1)
      const { gasUsed, effectiveGasPrice } = transactionReceipt
      const gasCost = gasUsed.mul(effectiveGasPrice)

      const endingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      )
      const endingDeployerBalance = await fundMe.provider.getBalance(deployer)
      // Assert
      expect(endingFundMeBalance).to.equal(0)
      expect(
        startingFundMeBalance.add(startingDeployerBalance).toString()
      ).to.equal(endingDeployerBalance.add(gasCost).toString())
    })
  })
})