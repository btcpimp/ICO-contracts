const ICOCappedRefundableCrowdsale = artifacts.require("./ICOCappedRefundableCrowdsale.sol");
const ICOToken = artifacts.require("./ICOToken.sol");
const expectThrow = require('../util').expectThrow;
const timeTravel = require('../util').timeTravel;
const web3FutureTime = require('../util').web3FutureTime;

contract('ICOCappedRefundableCrowdsale', function (accounts) {

	let crowdsaleInstance;
	let _startTime;
	let _endTime;

	const weiInEther = 1000000000000000000;

	const _owner = accounts[0];
	const _alice = accounts[1];
	const _wallet = accounts[2];
	const _carol = accounts[3];
	const _notOwner = accounts[8];

	const day = 24 * 60 * 60;
	const sixtyThreeDays = 63 * day;
	const thirtyDays = 30 * day;
	const fourteenDays = 14 * day;
	const sevenDays = 7 * day;

	const minWeiAmount = 0.01 * weiInEther;

	const _defaultRate = 5000;

	const _cap = 10000 * weiInEther;

	const _goal = 3000 * weiInEther;

	xdescribe("initializing crowsale", () => {
		it("should set initial values correctly", async function () {
			await timeTravel(web3, day);
			_startTime = web3FutureTime(web3);
			_endTime = _startTime + sixtyThreeDays;

			crowdsaleInstance = await ICOCappedRefundableCrowdsale.new(_startTime, _endTime, _cap, _goal, _wallet, {
				from: _owner
			});

			let startTime = await crowdsaleInstance.startTime.call();
			let endTime = await crowdsaleInstance.endTime.call();
			let wallet = await crowdsaleInstance.wallet.call();
			let rate = await crowdsaleInstance.rate.call();
			let cap = await crowdsaleInstance.cap.call();
			let goal = await crowdsaleInstance.goal.call();

			assert(startTime.eq(_startTime), "The start time is incorrect");
			assert(endTime.eq(_endTime), "The end time is incorrect");
			assert(rate.eq(_defaultRate), "The rate is incorrect");
			assert(cap.eq(_cap), "The cap is incorrect");
			assert(goal.eq(_goal), "The goal is incorrect");
			assert.strictEqual(wallet, _wallet, "The start time is incorrect");

			let token = await crowdsaleInstance.token.call();
			assert(token.length > 0, "Token length is 0");
			assert(token != "0x0");
		})
	});

	xdescribe('cap', () => {
		beforeEach(async function () {
			_startTime = web3FutureTime(web3);
			_endTime = _startTime + sixtyThreeDays;

			crowdsaleInstance = await ICOCappedRefundableCrowdsale.new(_startTime, _endTime, _cap, _goal, _wallet, {
				from: _owner
			});

			let tokenAddress = await crowdsaleInstance.token.call();

			tokenInstance = ICOToken.at(tokenAddress);
		})

		it("should end on reaching cap", async function () {
			await timeTravel(web3, thirtyDays);

			const weiSent = 1000 * weiInEther;

			await crowdsaleInstance.buyTokens(_wallet, {
				value: weiSent,
				from: _wallet
			})
			await crowdsaleInstance.buyTokens(_wallet, {
				value: weiSent,
				from: _wallet
			})
			await crowdsaleInstance.buyTokens(_wallet, {
				value: weiSent,
				from: _wallet
			})
			await crowdsaleInstance.buyTokens(_wallet, {
				value: weiSent,
				from: _wallet
			})
			await crowdsaleInstance.buyTokens(_wallet, {
				value: weiSent,
				from: _wallet
			})
			await crowdsaleInstance.buyTokens(_wallet, {
				value: weiSent,
				from: _wallet
			})
			await crowdsaleInstance.buyTokens(_wallet, {
				value: weiSent,
				from: _wallet
			})
			await crowdsaleInstance.buyTokens(_wallet, {
				value: weiSent,
				from: _wallet
			})
			await crowdsaleInstance.buyTokens(_wallet, {
				value: weiSent,
				from: _wallet
			})
			await crowdsaleInstance.buyTokens(_wallet, {
				value: weiSent,
				from: _wallet
			})

			const hasEnded = await crowdsaleInstance.hasEnded();
			assert(hasEnded, "The crowdsale has not ended on the cap");
		})

		it("should create bounty tokens after reaching the cap", async function () {
			await timeTravel(web3, thirtyDays);

			let weiSent = 1000 * weiInEther;
			await crowdsaleInstance.buyTokens(_wallet, {
				value: weiSent,
				from: _wallet
			})
			await crowdsaleInstance.buyTokens(_wallet, {
				value: weiSent,
				from: _wallet
			})
			await crowdsaleInstance.buyTokens(_wallet, {
				value: weiSent,
				from: _wallet
			})
			await crowdsaleInstance.buyTokens(_wallet, {
				value: weiSent,
				from: _wallet
			})
			await crowdsaleInstance.buyTokens(_wallet, {
				value: weiSent,
				from: _wallet
			})
			await crowdsaleInstance.buyTokens(_wallet, {
				value: weiSent,
				from: _wallet
			})
			await crowdsaleInstance.buyTokens(_wallet, {
				value: weiSent,
				from: _wallet
			})
			await crowdsaleInstance.buyTokens(_wallet, {
				value: weiSent,
				from: _wallet
			})
			await crowdsaleInstance.buyTokens(_wallet, {
				value: weiSent,
				from: _wallet
			})
			await crowdsaleInstance.buyTokens(_wallet, {
				value: weiSent,
				from: _wallet
			})

			const bonusTokens = 500 * weiInEther;

			crowdsaleInstance.createBountyToken(_alice, bonusTokens, {
				from: _owner
			})

			let balance = await tokenInstance.balanceOf.call(_alice);

			assert(balance.eq(bonusTokens), "The balance was not correct based on bounty tokens");

		})

		it("should throw on buying tokens after reaching the cap", async function () {
			await timeTravel(web3, thirtyDays);

			let weiSent = 1000 * weiInEther;
			await crowdsaleInstance.buyTokens(_wallet, {
				value: weiSent,
				from: _wallet
			})
			await crowdsaleInstance.buyTokens(_wallet, {
				value: weiSent,
				from: _wallet
			})
			await crowdsaleInstance.buyTokens(_wallet, {
				value: weiSent,
				from: _wallet
			})
			await crowdsaleInstance.buyTokens(_wallet, {
				value: weiSent,
				from: _wallet
			})
			await crowdsaleInstance.buyTokens(_wallet, {
				value: weiSent,
				from: _wallet
			})
			await crowdsaleInstance.buyTokens(_wallet, {
				value: weiSent,
				from: _wallet
			})
			await crowdsaleInstance.buyTokens(_wallet, {
				value: weiSent,
				from: _wallet
			})
			await crowdsaleInstance.buyTokens(_wallet, {
				value: weiSent,
				from: _wallet
			})
			await crowdsaleInstance.buyTokens(_wallet, {
				value: weiSent,
				from: _wallet
			})
			await crowdsaleInstance.buyTokens(_wallet, {
				value: weiSent,
				from: _wallet
			})

			weiSent = 1 * weiInEther;
			await expectThrow(crowdsaleInstance.buyTokens(_wallet, {
				value: weiSent,
				from: _wallet
			}))
		})
	})

	describe('close Vault', () => {
		beforeEach(async function () {
			_startTime = web3FutureTime(web3);
			_endTime = _startTime + sixtyThreeDays;

			crowdsaleInstance = await ICOCappedRefundableCrowdsale.new(_startTime, _endTime, _cap, _goal, _wallet, {
				from: _owner
			});

			let tokenAddress = await crowdsaleInstance.token.call();
			tokenInstance = ICOToken.at(tokenAddress);
		})

		it("should forward the funds if goal is reached", async function () {
			await timeTravel(web3, thirtyDays);
			const weiSent = 1000 * weiInEther;

			await crowdsaleInstance.buyTokens(_alice, {
				value: weiSent,
				from: _alice
			})
			await crowdsaleInstance.buyTokens(_alice, {
				value: weiSent,
				from: _alice
			})
			await crowdsaleInstance.buyTokens(_alice, {
				value: weiSent,
				from: _alice
			})

			const initialBalance = web3.eth.getBalance(_wallet);
			await timeTravel(web3, sixtyThreeDays);
			await crowdsaleInstance.closeVault();
			const finalBalance = web3.eth.getBalance(_wallet);

			assert(finalBalance.eq(initialBalance.plus(weiSent * 3)), "The balance was not correct");
		})

		it("should throw closing the vault if goal is not reached", async function () {
			await timeTravel(web3, thirtyDays);
			const weiSent = 1000 * weiInEther;

			await crowdsaleInstance.buyTokens(_alice, {
				value: weiSent,
				from: _alice
			})
			await crowdsaleInstance.buyTokens(_alice, {
				value: weiSent,
				from: _alice
			})

			await timeTravel(web3, sixtyThreeDays);
			await expectThrow(crowdsaleInstance.closeVault());
		})

		it("should forward the funds if goal is reached and finalize", async function () {
			await timeTravel(web3, thirtyDays);
			const weiSent = 1000 * weiInEther;

			await crowdsaleInstance.buyTokens(_alice, {
				value: weiSent,
				from: _alice
			})
			await crowdsaleInstance.buyTokens(_alice, {
				value: weiSent,
				from: _alice
			})
			await crowdsaleInstance.buyTokens(_alice, {
				value: weiSent,
				from: _alice
			})

			const initialBalance = web3.eth.getBalance(_wallet);
			await timeTravel(web3, thirtyDays);
			await crowdsaleInstance.closeVault();

			await crowdsaleInstance.buyTokens(_alice, {
				value: weiSent,
				from: _alice
			})

			await timeTravel(web3, sixtyThreeDays);
			await crowdsaleInstance.finalize();
			const finalBalance = web3.eth.getBalance(_wallet);

			assert(finalBalance.eq(initialBalance.plus(weiSent * 4)), "The balance was not correct");
		})

		it("should forward the funds if vault is closed", async function () {
			await timeTravel(web3, thirtyDays);
			const weiSent = 1000 * weiInEther;

			await crowdsaleInstance.buyTokens(_alice, {
				value: weiSent,
				from: _alice
			})
			await crowdsaleInstance.buyTokens(_alice, {
				value: weiSent,
				from: _alice
			})
			await crowdsaleInstance.buyTokens(_alice, {
				value: weiSent,
				from: _alice
			})

			await timeTravel(web3, thirtyDays);
			await crowdsaleInstance.closeVault();

			const initialBalance = web3.eth.getBalance(_wallet);

			await crowdsaleInstance.buyTokens(_alice, {
				value: weiSent,
				from: _alice
			})

			const finalBalance = web3.eth.getBalance(_wallet);

			assert(finalBalance.eq(initialBalance.plus(weiSent)), "The balance was not correct");
		})

		it("should not forward the funds if vault is not closed", async function () {
			await timeTravel(web3, thirtyDays);
			const weiSent = 1000 * weiInEther;

			const initialBalance = web3.eth.getBalance(_wallet);

			await crowdsaleInstance.buyTokens(_alice, {
				value: weiSent,
				from: _alice
			})

			await timeTravel(web3, thirtyDays);
			const finalBalance = web3.eth.getBalance(_wallet);

			assert(finalBalance.eq(initialBalance), "The balance was not correct");
		})

		it("can not claim refund after vault is closed", async function () {
			await timeTravel(web3, thirtyDays);
			const weiSent = 1000 * weiInEther;

			await crowdsaleInstance.buyTokens(_alice, {
				value: weiSent,
				from: _alice
			})
			await crowdsaleInstance.buyTokens(_alice, {
				value: weiSent,
				from: _alice
			})
			await crowdsaleInstance.buyTokens(_alice, {
				value: weiSent,
				from: _alice
			})

			await timeTravel(web3, sixtyThreeDays);
			await crowdsaleInstance.closeVault();
			await expectThrow(crowdsaleInstance.claimRefund({
				from: _alice
			}));
		})

		it("should unpause the token on cap", async function () {
			await timeTravel(web3, thirtyDays);
			const weiSent = 1000 * weiInEther;

			await crowdsaleInstance.buyTokens(_alice, {
				value: weiSent,
				from: _alice
			})
			await crowdsaleInstance.buyTokens(_alice, {
				value: weiSent,
				from: _alice
			})
			await crowdsaleInstance.buyTokens(_alice, {
				value: weiSent,
				from: _alice
			})
			await crowdsaleInstance.buyTokens(_alice, {
				value: weiSent,
				from: _alice
			})

			await timeTravel(web3, sixtyThreeDays);

			await crowdsaleInstance.finalize();
			let paused = await tokenInstance.paused.call();
			assert.isFalse(paused, "The token contract was not unpaused");
		})
	})

	xdescribe('finalization', () => {
		beforeEach(async function () {
			_startTime = web3FutureTime(web3);
			_endTime = _startTime + sixtyThreeDays;

			crowdsaleInstance = await ICOCappedRefundableCrowdsale.new(_startTime, _endTime, _cap, _goal, _wallet, {
				from: _owner
			});

			let tokenAddress = await crowdsaleInstance.token.call();
			tokenInstance = ICOToken.at(tokenAddress);
		})

		it("should forward the funds if goal is reached", async function () {
			await timeTravel(web3, thirtyDays);
			const weiSent = 1000 * weiInEther;

			await crowdsaleInstance.buyTokens(_alice, {
				value: weiSent,
				from: _alice
			})
			await crowdsaleInstance.buyTokens(_alice, {
				value: weiSent,
				from: _alice
			})
			await crowdsaleInstance.buyTokens(_alice, {
				value: weiSent,
				from: _alice
			})

			const initialBalance = web3.eth.getBalance(_wallet);
			await timeTravel(web3, sixtyThreeDays);
			await crowdsaleInstance.finalize();
			const finalBalance = web3.eth.getBalance(_wallet);

			assert(finalBalance.eq(initialBalance.plus(weiSent * 3)), "The balance was not correct");
		})

		it("should not forward the funds if goal is not reached", async function () {
			await timeTravel(web3, thirtyDays);
			const weiSent = 1000 * weiInEther;

			await crowdsaleInstance.buyTokens(_alice, {
				value: weiSent,
				from: _alice
			})
			await crowdsaleInstance.buyTokens(_alice, {
				value: weiSent,
				from: _alice
			})

			const initialBalance = web3.eth.getBalance(_wallet);
			await timeTravel(web3, sixtyThreeDays);
			await crowdsaleInstance.finalize();
			const finalBalance = web3.eth.getBalance(_wallet);

			assert(finalBalance.eq(initialBalance), "The balance was not correct");
		})

		it("can claim refund", async function () {
			await timeTravel(web3, thirtyDays);
			const weiSent = 1000 * weiInEther;

			await crowdsaleInstance.buyTokens(_alice, {
				value: weiSent,
				from: _alice
			})

			const initialBalance = web3.eth.getBalance(_alice);
			await timeTravel(web3, sixtyThreeDays);
			await crowdsaleInstance.finalize();
			await crowdsaleInstance.claimRefund({
				from: _alice
			})
			const finalBalance = web3.eth.getBalance(_alice);

			assert(finalBalance.gt(initialBalance), "The balance was not correct");
		})

		it("should unpause the token on cap", async function () {
			await timeTravel(web3, thirtyDays);
			const weiSent = 1000 * weiInEther;

			await crowdsaleInstance.buyTokens(_alice, {
				value: weiSent,
				from: _alice
			})
			await crowdsaleInstance.buyTokens(_alice, {
				value: weiSent,
				from: _alice
			})
			await crowdsaleInstance.buyTokens(_alice, {
				value: weiSent,
				from: _alice
			})
			await crowdsaleInstance.buyTokens(_alice, {
				value: weiSent,
				from: _alice
			})

			await timeTravel(web3, sixtyThreeDays);

			await crowdsaleInstance.finalize();
			let paused = await tokenInstance.paused.call();
			assert.isFalse(paused, "The token contract was not unpaused");
		})
	})
});