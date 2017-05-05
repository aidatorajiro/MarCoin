const regeneratorRuntime = require("regenerator-runtime");

var MarCoin = artifacts.require("./MarCoin.sol");

contract('MarCoin', function(accounts) {
  it("should put 0 MarCoin in the first account", async () => {
    const mar = await MarCoin.deployed();
    const balance = await mar.getBalance.call(accounts[0]);
    assert.equal(balance.valueOf(), 0, "0 wasn't in the first account");
  });

  it("should issue coin correctly", async () => {
    const content = "test";
    const account = accounts[0];
    const mar = await MarCoin.deployed();
    const starting_balance   = (await mar.getBalance    .call(account)).toNumber();
    await mar.issueCoin(content, {from: account});
    const ending_balance     = (await mar.getBalance    .call(account)).toNumber();
    const last_owned_coin    =  await mar.getOwnedCoins .call(account, ending_balance - 1);
    const last_coin_contents =  await mar.coin_contents .call(last_owned_coin);
    const last_coin_issuers  =  await mar.coin_issuers  .call(last_owned_coin);
    const last_coin_owners   =  await mar.coin_owners   .call(last_owned_coin);
    assert.equal(ending_balance    , starting_balance + 1, "Coin wasn't correctly issued (there is something wrong with balance)");
    assert.equal(last_coin_contents, content             , "Coin wasn't correctly issued (there is something wrong with contents)");
    assert.equal(last_coin_issuers , account             , "Coin wasn't correctly issued (there is something wrong with issuers)");
    assert.equal(last_coin_owners  , account             , "Coin wasn't correctly issued (there is something wrong with owners)");
  });

  it("should send coin correctly", async () => {
    const account1 = accounts[0];
    const account2 = accounts[1];
    const mar = await MarCoin.deployed();
    const starting_balance_1 = (await mar.getBalance    .call(account1)).toNumber();
    const starting_balance_2 = (await mar.getBalance    .call(account2)).toNumber();
    const last_owned_coin_1  =  await mar.getOwnedCoins .call(account1, starting_balance_1 - 1); // id of the coin which account1 has at first
    const starting_coin_owner = await mar.coin_owners   .call(last_owned_coin_1);
    await mar.sendCoin(account2, last_owned_coin_1, {from: account1});
    const ending_balance_1   = (await mar.getBalance    .call(account1)).toNumber();
    const ending_balance_2   = (await mar.getBalance    .call(account2)).toNumber();
    const last_owned_coin_2  =  await mar.getOwnedCoins .call(account2, ending_balance_2 - 1); // id of the coin which account2 has at last
    const ending_coin_owner  =  await mar.coin_owners   .call(last_owned_coin_1);
    assert.equal(last_owned_coin_1.toNumber(), last_owned_coin_2.toNumber(), "Coin wasn't correctly sent (there is something wrong with getOwnedCoins)");
    assert.equal(starting_coin_owner         , account1                    , "Coin wasn't correctly sent (there is something wrong with coin_owners)");
    assert.equal(ending_coin_owner           , account2                    , "Coin wasn't correctly sent (there is something wrong with coin_owners)");
    assert.equal(ending_balance_1            , starting_balance_1 - 1      , "Coin wasn't correctly sent (there is something wrong with balance)");
    assert.equal(ending_balance_2            , starting_balance_2 + 1      , "Coin wasn't correctly sent (there is something wrong with balance)");
  });
});
