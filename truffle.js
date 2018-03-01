const HDWalletProvider = require("truffle-hdwallet-provider-privkey");
let privateKey = "asdasdas";
let infuraRopsten = 'https://ropsten.infura.io/ID';
let infuraRinkeby = 'https://rinkeby.infura.io/ID';

module.exports = {
	networks: {
		development: {
			host: "localhost",
			port: 8545,
			network_id: "*"
		},
		td: {
			host: "localhost",
			port: 9545,
			network_id: "*"
		},
		ganache: {
			host: "localhost",
			port: 7545,
			network_id: "*"
		},
		ropsten: {
			provider: function () {
				return new HDWalletProvider(privateKey, infuraRopsten)
			},
			network_id: 3,
			gas: 4000000,
			gasPrice: 20000000000
		},
		rinkeby: {
			provider: function () {
				return new HDWalletProvider(privateKey, infuraRinkeby)
			},
			network_id: 4,
			port: 8545,
			gas: 4000000
		}
	},
	solc: {
		optimizer: {
			enabled: true,
			runs: 999
		}
	}
};