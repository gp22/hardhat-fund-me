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
      const response = await fundMe.s_priceFeed()
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
      const response = await fundMe.s_addressToAmountFunded(deployer)
      expect(response.toString()).to.equal(sendValue.toString())
    })

    it('Adds funder to array of funders', async function () {
      await fundMe.fund({ value: sendValue })
      const funder = await fundMe.s_funders(0)
      expect(funder).to.equal(deployer)
    })
  })

  describe('withdraw', async function () {
    beforeEach(async function () {
      await fundMe.fund({ value: sendValue })
    })

    it('Can withdraw ETH from a single funder', async function () {
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

    it('Can withdraw ETH from multiple funders', async function () {
      // Arrange
      const accounts = await ethers.getSigners()

      for (let i = 1; i < accounts.length; i++) {
        const fundMeConnectedContract = await fundMe.connect(accounts[i])

        await fundMeConnectedContract.fund({ value: sendValue })
      }

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

      // Make sure the funders are reset
      await expect(fundMe.s_funders(0)).to.be.reverted

      accounts.forEach(async (account, i) => {
        if (i !== 0) {
          const balance = await fundMe.s_addressToAmountFunded(account.address)

          expect(balance).to.equal(0)
        }
      })
    })

    it('Only allows the owner to withdraw', async function () {
      const accounts = await ethers.getSigners()
      const attacker = accounts[1]
      const attackerConnectedContract = await fundMe.connect(attacker)

      await expect(
        attackerConnectedContract.withdraw()
      ).to.be.revertedWithCustomError(fundMe, 'FundMe__NotOwner')
    })

    it('Can withdraw ETH from a single funder using cheaperWithdraw', async function () {
      // Arrange
      const startingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      )
      const startingDeployerBalance = await fundMe.provider.getBalance(deployer)

      // Act
      const transactionResponse = await fundMe.cheaperWithdraw()
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

    it('Can withdraw ETH from multiple funders using cheaperWithdraw', async function () {
      // Arrange
      const accounts = await ethers.getSigners()

      for (let i = 1; i < accounts.length; i++) {
        const fundMeConnectedContract = await fundMe.connect(accounts[i])

        await fundMeConnectedContract.fund({ value: sendValue })
      }

      const startingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      )
      const startingDeployerBalance = await fundMe.provider.getBalance(deployer)

      // Act
      const transactionResponse = await fundMe.cheaperWithdraw()
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

      // Make sure the funders are reset
      await expect(fundMe.s_funders(0)).to.be.reverted

      accounts.forEach(async (account, i) => {
        if (i !== 0) {
          const balance = await fundMe.s_addressToAmountFunded(account.address)

          expect(balance).to.equal(0)
        }
      })
    })
  })
})
