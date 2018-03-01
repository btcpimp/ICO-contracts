var ICOCappedRefundableCrowdsale = artifacts.require("./ICOCappedRefundableCrowdsale.sol");

function getFutureTimestamp(plusMinutes) {
	let date = new Date();
	date.setMinutes(date.getMinutes() + plusMinutes)
	let timestamp = +date;
	timestamp = Math.ceil(timestamp / 1000);
	return timestamp;
}

function getWeb3FutureTimestamp(plusMinutes) {
	return web3.eth.getBlock(web3.eth.blockNumber).timestamp + plusMinutes * 60;
}

module.exports = async function (deployer, network) {
	const isDevNetwork = (network == 'development' || network == 'td' || network == 'ganache');
	const fifteenMinutes = 15;
	const sixtyThreeInMinutes = 63 * 24 * 60;
	const _startTime = 1521417600; // (isDevNetwork) ? getWeb3FutureTimestamp(fifteenMinutes) : getFutureTimestamp(fifteenMinutes);
	const _endTime = 1526860800; // (isDevNetwork) ? getWeb3FutureTimestamp(nintyDaysInMinutes) : getFutureTimestamp(sixtyThreeInMinutes);
	const _wallet = '0xAeCF9c56dfB558590CFD0944644b96bBc681CF69'; // Vibeo Address for ETH
	const weiInEther = 1000000000000000000;
	const _goal = 3000 * weiInEther;
	const _cap = 10000 * weiInEther;
	await deployer.deploy(ICOCappedRefundableCrowdsale, _startTime, _endTime, _cap, _goal, _wallet);
};