pragma solidity ^0.4.2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/MarCoin.sol";

contract TestMarcoin {

  function testInitialBalanceUsingDeployedContract() {
    MarCoin meta = MarCoin(DeployedAddresses.MarCoin());

    uint expected = 0;

    Assert.equal(meta.getBalance(tx.origin), expected, "Owner should have 10000 MarCoin initially");
  }

  function testInitialBalanceWithNewMarCoin() {
    MarCoin meta = new MarCoin();

    uint expected = 0;

    Assert.equal(meta.getBalance(tx.origin), expected, "Owner should have 10000 MarCoin initially");
  }

}
