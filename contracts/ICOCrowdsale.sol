pragma solidity ^0.4.17;

import "./ICOToken.sol";
import "../node_modules/zeppelin-solidity/contracts/crowdsale/FinalizableCrowdsale.sol";
import '../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol';
import '../node_modules/zeppelin-solidity/contracts/lifecycle/Pausable.sol';


contract ICOCrowdsale is Ownable, Pausable, FinalizableCrowdsale {
  uint256 constant TOKENS_FOR_TEAM = 10000000 * (10 ** 18);
  uint256 constant TOKENS_FOR_FOUNDER = 10000000 * (10 ** 18);
  uint256 constant REMAINING_TOKENS = 1625000 * (10 ** 18); // Remaining tokens if hardcap reached
  uint256 BOUNTY_TOKENS_CAP = TOKENS_FOR_TEAM.add(TOKENS_FOR_FOUNDER.add(REMAINING_TOKENS));

  uint256 constant BONUS_1_CAP = 3000 ether;
  uint256 constant BONUS_1_RATE = 6750;
  uint256 constant BONUS_1_DURATION = 25 days;

  uint256 constant BONUS_2_CAP = BONUS_1_CAP + 2500 ether;
  uint256 constant BONUS_2_RATE = 5750;
  uint256 constant BONUS_2_DURATION = BONUS_1_DURATION + 9 days;

  uint256 constant BONUS_3_CAP = BONUS_2_CAP + 2500 ether;
  uint256 constant BONUS_3_RATE = 5500;
  uint256 constant BONUS_3_DURATION = BONUS_2_DURATION + 14 days;
  
  uint256 constant CAP = BONUS_3_CAP + 2000 ether;
  uint256 constant NORMAL_RATE = 5000;
  uint256 constant DURATION = BONUS_3_DURATION + 14 days;

  uint256 totalBountyTokens;

  event LogJumpOverPhases(string message, uint256 amountForCurrentPhase, uint256 amountForNextPhase);
  event LogBountyTokenMinted(address minter, address beneficiary, uint256 amount);

  function ICOCrowdsale(uint256 _startTime, uint256 _endTime, address _wallet) public
    FinalizableCrowdsale()
    Crowdsale(_startTime, _endTime, NORMAL_RATE, _wallet)
  {
    require((_endTime-_startTime) > DURATION);
  }

  /**
   * Invoked on initialization of the contract
   */
  function createTokenContract() internal returns (MintableToken) {
    ICOToken _token = new ICOToken();
    _token.pause();
    return _token;
  }

  function finalization() internal {
    super.finalization();

    ICOToken _token = ICOToken(token);
    _token.unpause();
    _token.transferOwnership(owner);
  }

	function buyTokens(address beneficiary) public payable {
      uint256 maxContributionAmount = 1000 ether;
    	uint256 minContributionAmount = 10 finney; // 0.01 ETH

    	require(msg.value <= maxContributionAmount && msg.value >= minContributionAmount);

    	super.buyTokens(beneficiary);
  }

  function getRate(uint256 weiAmount) internal constant returns(uint256) {

    uint256 totalWei = weiRaised.add(weiAmount);
    // First Bonus Period
    if (now < (startTime + BONUS_1_DURATION) && totalWei < BONUS_1_CAP) {
      return BONUS_1_RATE;
    }

    //Second Bonus Period
    if ((now < (startTime + BONUS_2_DURATION) && now >= (startTime + BONUS_1_DURATION)) || (totalWei < BONUS_2_CAP && totalWei >= BONUS_1_CAP)) {
      return BONUS_2_RATE;
    }

    //Third Bonus Period
    if ((now < (startTime + BONUS_3_DURATION) && now >= (startTime + BONUS_2_DURATION)) || (totalWei < BONUS_3_CAP && totalWei >= BONUS_2_CAP)) {
      return BONUS_3_RATE;
    }

    // Default Period
    return rate;
  }

  function getTokenAmount(uint256 weiAmount) internal constant returns(uint256) {
    uint256 _rate = getRate(weiAmount);
    return weiAmount.mul(_rate);
  }

  function createBountyToken(address beneficiary, uint256 amount) public onlyOwner returns(bool) {
    require(totalBountyTokens.add(amount) <= BOUNTY_TOKENS_CAP);

    totalBountyTokens = totalBountyTokens.add(amount);
    token.mint(beneficiary, amount);

    LogBountyTokenMinted(msg.sender, beneficiary, amount);
    return true;
  }
}
