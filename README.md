# FundMe

An Ethereum crowd funding project.

The `.env` file uses the following syntax.

```
SEPOLIA_PRIVATE_KEY=your-sepolia-private-key
SEPOLIA_RPC_URL=https://your-sepolia-rpc-url.com
ETHERSCAN_API_KEY=your-etherscan-api-key
COINMARKETCAP_API_KEY=your-coinmarketcap-api-key
```

Try running some tasks:

```shell
yarn hardhat deploy
yarn hardhat deploy --tags mocks
yarn hardhat deploy --network sepolia
yarn hardhat test
yarn hardhat test --network sepolia
```
