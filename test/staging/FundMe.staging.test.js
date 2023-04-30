const { deployments, ethers, getNamedAccounts, network } = require('hardhat')
const { expect, assert } = require('chai')
const { developmentChains } = require('../../helper-hardhat-config')
const isDevelopmentChain = developmentChains.includes(network.name)

isDevelopmentChain
  ? describe.skip
  : describe('FundMe', async function () {
      let fundMe, deployer
      const sendValue = ethers.utils.parseEther('1') // 1 ETH

      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer
        fundMe = await ethers.getContract('FundMe', deployer)
      })

      it('Allows people to fund and withdraw', async function () {
        await fundMe.fund({ value: sendValue })
        await fundMe.widthdraw()
        const endingBalance = await fundMe.provider.getBalance(fundMe.address)
        expect(endingBalance.toString()).to.equal('0')
      })
    })
