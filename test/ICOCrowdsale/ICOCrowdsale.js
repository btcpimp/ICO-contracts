const ICOCrowdsale = artifacts.require("./ICOCrowdsale.sol");
const ICOToken = artifacts.require("./ICOToken.sol");
const expectThrow = require('../util').expectThrow;
const timeTravel = require('../util').timeTravel;
const web3FutureTime = require('../util').web3FutureTime;

contract('ICOCrowdsale', function (accounts) {

	let crowdsaleInstance;
	let _startTime;
	let _endTime;

	const weiInEther = 1000000000000000000;

	const _owner = accounts[0];
	const _alice = accounts[1];
	const _wallet = accounts[2];

	const day = 24 * 60 * 60;
	const nintyDays = 90 * day;
	const sixtyThreeDays = 63 * day;
	const thirtyDays = 30 * day;
	const twentyFiveDays = 25 * day;
	const fourteenDays = 14 * day;
	const nineDays = 9 * day;
	const sevenDays = 7 * day;

	const minWeiAmount = 0.01 * weiInEther;
	const maxWeiAmount = 1000 * weiInEther;

	const _defaultRate = 5000;
	const _firstPeriod = {
		TIME: twentyFiveDays,
		BONUS_RATE: 6750,
		CAP: 3000 * weiInEther
	}

	const _secondPeriod = {
		TIME: _firstPeriod.TIME + nineDays,
		BONUS_RATE: 5750,
		CAP: _firstPeriod.CAP + 2500 * weiInEther
	}

	const _thirdPeriod = {
		TIME: _secondPeriod.TIME + fourteenDays,
		BONUS_RATE: 5500,
		CAP: _secondPeriod.CAP + 2500 * weiInEther
	}

	describe("initializing crowsale", () => {
		it("should set initial values correctly", async function () {
			await timeTravel(web3, day);
			_startTime = web3FutureTime(web3);
			_endTime = _startTime + sixtyThreeDays;

			crowdsaleInstance = await ICOCrowdsale.new(_startTime, _endTime, _wallet, {
				from: _owner
			});

			let startTime = await crowdsaleInstance.startTime.call();
			let endTime = await crowdsaleInstance.endTime.call();
			let wallet = await crowdsaleInstance.wallet.call();
			let rate = await crowdsaleInstance.rate.call();

			assert(startTime.eq(_startTime), "The start time is incorrect");
			assert(endTime.eq(_endTime), "The end time is incorrect");
			assert(rate.eq(_defaultRate), "The rate is incorrect");
			assert.strictEqual(wallet, _wallet, "The start time is incorrect");

			let token = await crowdsaleInstance.token.call();
			assert(token.length > 0, "Token length is 0");
			assert(token != "0x0");
		})

		it("throw if the end time is less than 15 days", async function () {
			_startTime = web3FutureTime(web3);
			_endTime = _startTime + sevenDays;

			await expectThrow(ICOCrowdsale.new(_startTime, _endTime, _defaultRate, _wallet, {
				from: _owner
			}));
		})


	});

	describe("testing token creation", () => {
		let tokenInstance;
		const _symbol = "VBEO";

		beforeEach(async function () {

			_startTime = web3FutureTime(web3);
			_endTime = _startTime + sixtyThreeDays;

			crowdsaleInstance = await ICOCrowdsale.new(_startTime, _endTime, _wallet, {
				from: _owner
			});

			let tokenAddress = await crowdsaleInstance.token.call();

			tokenInstance = ICOToken.at(tokenAddress);
		})

		it("should create the correct token", async function () {
			let tokenSymbol = await tokenInstance.symbol.call();
			assert.equal(tokenSymbol, _symbol, "It has not created token with the correct symbol");
		})

		it("should create the token paused", async function () {
			let paused = await tokenInstance.paused.call();
			assert.isTrue(paused, "The token was not created paused");
		})

		it("should create the token owned by the crowdsale", async function () {
			let owner = await tokenInstance.owner.call();
			assert.equal(owner, crowdsaleInstance.address, "The token was with the crowdsale as owner");
		})
	});

	describe("testing crowdsale periods", () => {
		let tokenInstance;

		beforeEach(async function () {

			_startTime = web3FutureTime(web3);
			_endTime = _startTime + sixtyThreeDays;

			crowdsaleInstance = await ICOCrowdsale.new(_startTime, _endTime, _wallet, {
				from: _owner
			});

			let tokenAddress = await crowdsaleInstance.token.call();

			tokenInstance = ICOToken.at(tokenAddress);

		})

		it("should throw on wei below min amount", async function () {
			const weiSent = minWeiAmount / 2;
			await expectThrow(crowdsaleInstance.buyTokens(_wallet, {
				value: weiSent,
				from: _wallet
			}))
		})

		it("should throw on wei above max amount", async function () {
			const weiSent = maxWeiAmount / 2;
			await expectThrow(crowdsaleInstance.buyTokens(_wallet, {
				value: weiSent,
				from: _wallet
			}))
		})

		it("should throw if buying tokens after endDate", async function () {
			await timeTravel(web3, _endTime + (1 * day));

			const weiSent = minWeiAmount;
			await expectThrow(crowdsaleInstance.buyTokens(_wallet, {
				value: weiSent,
				from: _wallet
			}))
		})

		it("should convert to first period rate after some time", async function () {
			await timeTravel(web3, _firstPeriod.TIME * 0.75);
			const weiSent = 1 * weiInEther;
			await crowdsaleInstance.buyTokens(_alice, {
				value: weiSent,
				from: _alice
			})

			let balance = await tokenInstance.balanceOf.call(_alice);
			assert(balance.eq(weiSent * _firstPeriod.BONUS_RATE), "The balance was not correct based on the first period rate and weiSent");
		})

		it("should convert to first period rate after some time using fallback function", async function () {
			await timeTravel(web3, _firstPeriod.TIME * 0.75);
			const weiSent = 1 * weiInEther;
			await crowdsaleInstance.sendTransaction({
				value: weiSent,
				from: _wallet
			})

			let balance = await tokenInstance.balanceOf.call(_wallet);

			assert(balance.eq(weiSent * _firstPeriod.BONUS_RATE), "The balance was not correct based on the first period rate and weiSent");
		})

		it("should convert to first period rate after some tokens are sold", async function () {
			await timeTravel(web3, day / 24);
			let weiSentFirst = 1 * weiInEther;
			await crowdsaleInstance.buyTokens(_wallet, {
				value: weiSentFirst,
				from: _wallet
			})

			let weiSentSecond = minWeiAmount;
			await crowdsaleInstance.buyTokens(_owner, {
				value: weiSentSecond,
				from: _owner
			})

			let balance = await tokenInstance.balanceOf.call(_owner);

			assert(balance.eq((weiSentSecond) * _firstPeriod.BONUS_RATE), "The balance was not correct based on the first period rate and weiSent");
		})

		it("should convert to second period rate after some time", async function () {
			await timeTravel(web3, _secondPeriod.TIME * 0.9);
			const weiSent = 1 * weiInEther;
			await crowdsaleInstance.buyTokens(_wallet, {
				value: weiSent,
				from: _wallet
			})

			let balance = await tokenInstance.balanceOf.call(_wallet);

			assert(balance.eq(weiSent * _secondPeriod.BONUS_RATE), "The balance was not correct based on the second period rate and weiSent");
		})

		it("should convert to second period rate after first period tokens are sold", async function () {
			await timeTravel(web3, day / 24);

			await crowdsaleInstance.buyTokens(_alice, {
				value: maxWeiAmount,
				from: _wallet
			})

			await crowdsaleInstance.buyTokens(_alice, {
				value: maxWeiAmount,
				from: _wallet
			})

			await crowdsaleInstance.buyTokens(_alice, {
				value: maxWeiAmount,
				from: _wallet
			})

			let weiSentSecond = 1 * weiInEther;
			await crowdsaleInstance.buyTokens(_owner, {
				value: weiSentSecond,
				from: _owner
			})

			let balance = await tokenInstance.balanceOf.call(_owner);
			assert(balance.eq(weiSentSecond * _secondPeriod.BONUS_RATE), "The balance was not correct based on the second period rate and weiSent");
		})

		it("should convert to second period rate after almost all first period tokens are sold", async function () {
			await timeTravel(web3, day / 24);

			await crowdsaleInstance.buyTokens(_alice, {
				value: maxWeiAmount,
				from: _wallet
			})

			await crowdsaleInstance.buyTokens(_alice, {
				value: maxWeiAmount,
				from: _wallet
			})

			await crowdsaleInstance.buyTokens(_alice, {
				value: maxWeiAmount - (500 * weiInEther),
				from: _wallet
			})

			await crowdsaleInstance.buyTokens(_owner, {
				value: maxWeiAmount,
				from: _owner
			})

			let balance = await tokenInstance.balanceOf.call(_owner);

			assert(balance.eq(maxWeiAmount * _secondPeriod.BONUS_RATE), "The balance was not correct based on the second period rate and weiSent");
		})

		it("should convert to third period rate after some time", async function () {
			await timeTravel(web3, _thirdPeriod.TIME * 0.9);
			const weiSent = 1 * weiInEther;
			await crowdsaleInstance.buyTokens(_wallet, {
				value: weiSent,
				from: _wallet
			})

			let balance = await tokenInstance.balanceOf.call(_wallet);

			assert(balance.eq(weiSent * _thirdPeriod.BONUS_RATE), "The balance was not correct based on the third period rate and weiSent");
		})

		it("should convert to third period rate after second period tokens are sold", async function () {
			await timeTravel(web3, day / 24);

			await crowdsaleInstance.buyTokens(_alice, {
				value: maxWeiAmount,
				from: _wallet
			})

			await crowdsaleInstance.buyTokens(_alice, {
				value: maxWeiAmount,
				from: _wallet
			})

			await crowdsaleInstance.buyTokens(_alice, {
				value: maxWeiAmount,
				from: _wallet
			})

			await crowdsaleInstance.buyTokens(_alice, {
				value: maxWeiAmount,
				from: _wallet
			})

			await crowdsaleInstance.buyTokens(_alice, {
				value: maxWeiAmount,
				from: _wallet
			})

			await crowdsaleInstance.buyTokens(_alice, {
				value: maxWeiAmount - (500 * weiInEther),
				from: _wallet
			})

			let weiSentSecond = 1 * weiInEther;
			await crowdsaleInstance.buyTokens(_owner, {
				value: weiSentSecond,
				from: _owner
			})

			let balance = await tokenInstance.balanceOf.call(_owner);
			assert(balance.eq(weiSentSecond * _thirdPeriod.BONUS_RATE), "The balance was not correct based on the third period rate and weiSent");
		})

		it("should convert to third period rate after almost all second period tokens are sold", async function () {
			await timeTravel(web3, day / 24);

			await crowdsaleInstance.buyTokens(_alice, {
				value: maxWeiAmount,
				from: _wallet
			})

			await crowdsaleInstance.buyTokens(_alice, {
				value: maxWeiAmount,
				from: _wallet
			})

			await crowdsaleInstance.buyTokens(_alice, {
				value: maxWeiAmount,
				from: _wallet
			})

			await crowdsaleInstance.buyTokens(_alice, {
				value: maxWeiAmount,
				from: _wallet
			})

			await crowdsaleInstance.buyTokens(_alice, {
				value: maxWeiAmount,
				from: _wallet
			})

			await crowdsaleInstance.buyTokens(_alice, {
				value: maxWeiAmount - (800 * weiInEther),
				from: _wallet
			})

			await crowdsaleInstance.buyTokens(_owner, {
				value: maxWeiAmount,
				from: _owner
			})

			let balance = await tokenInstance.balanceOf.call(_owner);

			assert(balance.eq(maxWeiAmount * _thirdPeriod.BONUS_RATE), "The balance was not correct based on the second period rate and weiSent");
		})

		it("should convert to default rate after the time has past", async function () {
			await timeTravel(web3, sixtyThreeDays);
			const weiSent = 1 * weiInEther;
			await crowdsaleInstance.buyTokens(_wallet, {
				value: weiSent,
				from: _wallet
			})

			let balance = await tokenInstance.balanceOf.call(_wallet);

			assert(balance.eq(weiSent * _defaultRate), "The balance was not correct based on the default rate and weiSent");
		})

		it("should convert to default rate after all presale tokens are sold", async function () {
			await timeTravel(web3, day / 24);

			await crowdsaleInstance.buyTokens(_alice, {
				value: maxWeiAmount,
				from: _wallet
			})

			await crowdsaleInstance.buyTokens(_alice, {
				value: maxWeiAmount,
				from: _wallet
			})

			await crowdsaleInstance.buyTokens(_alice, {
				value: maxWeiAmount,
				from: _wallet
			})

			await crowdsaleInstance.buyTokens(_alice, {
				value: maxWeiAmount,
				from: _wallet
			})

			await crowdsaleInstance.buyTokens(_alice, {
				value: maxWeiAmount,
				from: _wallet
			})

			await crowdsaleInstance.buyTokens(_alice, {
				value: maxWeiAmount,
				from: _wallet
			})

			await crowdsaleInstance.buyTokens(_alice, {
				value: maxWeiAmount,
				from: _wallet
			})

			await crowdsaleInstance.buyTokens(_alice, {
				value: maxWeiAmount,
				from: _wallet
			})

			const weiSent = 1 * weiInEther;
			await crowdsaleInstance.buyTokens(_wallet, {
				value: weiSent,
				from: _wallet
			})

			let balance = await tokenInstance.balanceOf.call(_wallet);

			assert(balance.eq(weiSent * _defaultRate), "The balance was not correct based on the default rate and weiSent");
		})
	})

	describe("bounty token", () => {
		let tokenInstance;

		beforeEach(async function () {

			_startTime = web3FutureTime(web3);
			_endTime = _startTime + nintyDays;

			crowdsaleInstance = await ICOCrowdsale.new(_startTime, _endTime, _wallet, {
				from: _owner
			});

			let tokenAddress = await crowdsaleInstance.token.call();

			tokenInstance = ICOToken.at(tokenAddress);
			await timeTravel(web3, thirtyDays);

		})

		it("create bounty tokens", async function () {

			const bonusTokens = 500 * weiInEther;

			crowdsaleInstance.createBountyToken(_alice, bonusTokens, {
				from: _owner
			})

			let balance = await tokenInstance.balanceOf.call(_alice);

			assert(balance.eq(bonusTokens), "The balance was not correct based on bounty tokens");

		})

		it("should throw if non owner trying to create bounty", async function () {
			const bonusTokens = 500 * weiInEther;

			await expectThrow(crowdsaleInstance.createBountyToken(_alice, bonusTokens, {
				from: _alice
			}))
		})

		it("should throw if bounty limit is reached", async function () {
			const bonusTokens = 22000000 * weiInEther;

			await expectThrow(crowdsaleInstance.createBountyToken(_alice, bonusTokens, {
				from: _owner
			}))
		})

		it("should emit event on sending bounty", async function () {

			const expectedEvent = 'LogBountyTokenMinted';

			const bonusTokens = 500 * weiInEther;
			let result = await crowdsaleInstance.createBountyToken(_alice, bonusTokens, {
				from: _owner
			});
			assert.lengthOf(result.logs, 1, "There should be 1 event emitted from createBounty!");
			assert.strictEqual(result.logs[0].event, expectedEvent, `The event emitted was ${result.logs[0].event} instead of ${expectedEvent}`);
		});
	})

	describe('finalization', () => {

		beforeEach(async function () {

			_startTime = web3FutureTime(web3);
			_endTime = _startTime + nintyDays;

			crowdsaleInstance = await ICOCrowdsale.new(_startTime, _endTime, _wallet, {
				from: _owner
			});

			let tokenAddress = await crowdsaleInstance.token.call();

			tokenInstance = ICOToken.at(tokenAddress);

			await timeTravel(web3, _firstPeriod.TIME * 0.75);
			const weiSent = 1 * weiInEther;
			await crowdsaleInstance.buyTokens(_wallet, {
				value: weiSent,
				from: _wallet
			})

		})

		it("should transfer ownership of the token correctly on time finish", async function () {
			let initialOwner = await tokenInstance.owner.call();
			await timeTravel(web3, nintyDays);
			await crowdsaleInstance.finalize();
			let afterOwner = await tokenInstance.owner.call();

			assert(initialOwner != afterOwner, "The owner has not changed");
			assert.equal(afterOwner, _owner, "The owner was not set to the crowdsale owner");
		})

		it("should unpause the token", async function () {
			await timeTravel(web3, nintyDays);
			await crowdsaleInstance.finalize();
			let paused = await tokenInstance.paused.call();
			assert.isFalse(paused, "The token contract was not unpaused");
		})
	})
});