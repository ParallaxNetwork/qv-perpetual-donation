require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

module.exports = {
  solidity: "0.8.27",
  networks: {
    holesky: {
      url: `${process.env.RPC_URL_HOLESKY}`,
      accounts: [`${process.env.PRIVATE_KEY}`],
    },
  },
};
