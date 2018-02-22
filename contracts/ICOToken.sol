pragma solidity ^0.4.17;


import "../node_modules/zeppelin-solidity/contracts/token/ERC20/MintableToken.sol";
import "../node_modules/zeppelin-solidity/contracts/lifecycle/Pausable.sol";


/**
 * @title ICOToken
 * `StandardToken` functions.
 */
contract ICOToken is MintableToken, Pausable {

  string public constant name = "Vibeo";
  string public constant symbol = "VBEO";
  uint8 public constant decimals = 18;

  function ICOToken() public {
  }
}
