pragma solidity ^0.4.18;

import "../node_modules/zeppelin-solidity/contracts/crowdsale/FinalizableCrowdsale.sol";
import "../node_modules/zeppelin-solidity/contracts/crowdsale/RefundVault.sol";

/**
 * @title RefundableCrowdsale
 * @dev Extension of Crowdsale contract that adds a funding goal, and
 * the possibility of users getting a refund if goal is not met.
 * Uses a RefundVault as the crowdsale's vault.
 */
contract ICORefundableCrowdsale is FinalizableCrowdsale {
  using SafeMath for uint256;

  // minimum amount of funds to be raised in weis
  uint256 public goal;

  // refund vault used to hold funds while crowdsale is running
  RefundVault public vault;

  function ICORefundableCrowdsale(uint256 _goal) public {
    require(_goal > 0);
    vault = new RefundVault(wallet);
    goal = _goal;
  }

  // if crowdsale is unsuccessful, investors can claim refunds here
  function claimRefund() public {
    require(isFinalized);
    require(!goalReached());

    vault.refund(msg.sender);
  }

  function goalReached() public view returns (bool) {
    return weiRaised >= goal;
  }

  function closeVault() public onlyOwner {
      require(goalReached());
      vault.close();
  }

  // vault finalization task, called when owner calls finalize()
  function finalization() internal {
    if (goalReached()) {
        if (vault.state() == RefundVault.State.Active) {
            vault.close();
        }
    } else {
      vault.enableRefunds();
    }

    super.finalization();
  }

  function forwardFunds() internal {
      if (goalReached() && vault.state() == RefundVault.State.Closed) {
        wallet.transfer(msg.value);
      } else {
        vault.deposit.value(msg.value)(msg.sender);
      }
  }
}