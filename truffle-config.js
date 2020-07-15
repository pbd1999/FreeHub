module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*", // Match any network id
      gas: 4600000
    },
    ropsten: {
      host: "localhost",
      port: 8545,
      network_id: 3,
      gas: 4600000
    },
    rinkeby: {
      host: "localhost",
      port: 8545,
      network_id: 4,
      gas: 4600000
    },
    compilers:
    {
        solc:
        {
          version :"v0.4.18"
        }
    }
  }
};
