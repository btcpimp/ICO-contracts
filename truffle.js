var HDWalletProvider = require("truffle-hdwallet-provider");
let ropstenMnemonic = 'unusual coconut pistol sting happy smart exchange volume pottery antenna laundry trumpet';
let infuraRopsten = 'https://ropsten.infura.io/H4UAAWyThMPs2WB9LsHD ';
let infuraRinkeby = 'https://rinkeby.infura.io/H4UAAWyThMPs2WB9LsHD';

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
				return new HDWalletProvider(ropstenMnemonic, infuraRopsten)
			},
			network_id: 3,
			port: 8545,
			gas: 4000000
		},
		rinkeby: {
			provider: function () {
				return new HDWalletProvider(ropstenMnemonic, infuraRinkeby)
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