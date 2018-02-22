pragma solidity ^0.4.17;

import "./ICOCrowdsale.sol";
import "../node_modules/zeppelin-solidity/contracts/crowdsale/RefundableCrowdsale.sol";
import "../node_modules/zeppelin-solidity/contracts/crowdsale/CappedCrowdsale.sol";

/**
 * @title ICOCappedRefundableCrowdsale
 */
contract ICOCappedRefundableCrowdsale is CappedCrowdsale, ICOCrowdsale, RefundableCrowdsale {

  function ICOCappedRefundableCrowdsale(uint256 _startTime, uint256 _endTime, uint256 _cap, uint256 _goal, address _wallet) public
  	FinalizableCrowdsale()
    ICOCrowdsale(_startTime, _endTime, _wallet)
	CappedCrowdsale(_cap)
    RefundableCrowdsale(_goal) 
	{
		require(_goal <= _cap);
	}
}
