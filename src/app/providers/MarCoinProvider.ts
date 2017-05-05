import { Injectable } from '@angular/core';
import Web3 from "web3";
import { default as contract } from 'truffle-contract'
import marcoin_artifacts from '../../../build/contracts/MarCoin.json'

let MarCoin : any = contract(marcoin_artifacts);
let web3    : any;

interface Coin {
  id      : number,
  content : string,
  issuer  : string,
  owner   : string
}

@Injectable()
export class MarCoinProvider {
  balance  : number = 0;
  accounts : [string];
  account  : string;
  status   : string;
  coins    : [Coin];

  start() : void {

    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof window["web3"] !== 'undefined') {
      console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MarCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
      // Use Mist/MetaMask's provider
      web3 = new Web3(window["web3"].currentProvider);
    } else {
      console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }

    // Bootstrap the MarCoin abstraction for Use.
    MarCoin.setProvider(web3.currentProvider);

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts((err, accs) => {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      this.setAccounts(accs);
      this.setAccount(accs[0]);

      this.refreshBalance();
    });
  }

  redraw() : void {

  }

  setBalance (val) {
    this.balance = val;
    this.redraw();
  }

  setAccounts (accs) {
    this.accounts = accs;
    this.redraw();
  }

  setAccount (acc) {
    this.account = acc;
    this.redraw();
  }

  setStatus (message) {
    this.status = message;
    this.redraw();
  }

  setCoins (coins) {
    this.coins = coins;
    this.redraw();
  }

  async issueCoin (input_content : string) {
    this.setStatus("Initiating transaction... (please wait)");

    try {
      const mar = await MarCoin.deployed();
      await mar.issueCoin(input_content, {from: this.account, gas: 1000000});
      this.setStatus("Transaction complete!");
      this.refreshBalance();
    } catch (e) {
      console.log(e);
      this.setStatus("Error issuing coin; see log.");
    }
  }

  async refreshBalance () {
    try {
      const mar = await MarCoin.deployed();
      const value = await mar.getBalance.call(this.account, {from: this.account});
      this.setBalance(value.valueOf());
      let coins = [];
      let id;
      for (let i = 0; i < value.toNumber(); i++) {
        id = await mar.getOwnedCoins.call(this.account, i);
        coins.push({
          id,
          content : await mar.coin_contents(id),
          issuer  : await mar.coin_issuers(id),
          owner   : await mar.coin_owners(id)
        });
      }
      this.setCoins(coins);
    } catch (e) {
      console.log(e);
      this.setStatus("Error getting balance; see log.");
    }
  }

  async sendCoin (input_receiver : string, input_id : string) {
    this.setStatus("Initiating transaction... (please wait)");

    try {
      const mar = await MarCoin.deployed();
      await mar.sendCoin(input_receiver, parseInt(input_id), {from: this.account});
      this.setStatus("Transaction complete!");
      this.refreshBalance();
    } catch (e) {
      console.log(e);
      this.setStatus("Error sending coin; see log.");
    };
  }
}