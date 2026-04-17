/**
 * filename: hardhat.config.js
 * purpose: Hardhat compiler and network configuration.
 * setup notes: Ensure Ganache is running on port 7545 with chainId 1337.
 */
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545",
      chainId: 1337,
    },
  },
};
