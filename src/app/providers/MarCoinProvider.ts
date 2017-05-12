import { Injectable } from '@angular/core';
import Web3 from "web3";
import { default as contract } from 'truffle-contract'
import marcoin_artifacts from '../../../build/contracts/MarCoin.json'

let MarCoin : any = contract(marcoin_artifacts);
let web3    : any;

export interface Coin {
  id      : number,
  content : string,
  issuer  : string,
  owner   : string
}

export interface Detail {
  blockHash        : string,
  blockNumber      : number,
  blockTimestamp   : number,
  transactionHash  : string,
  transactionIndex : number,
  sistercoins      : Coin[],
}

@Injectable()
export class MarCoinProvider {
  balance  : number = 0;
  accounts : [string];
  account  : string;
  status   : string;
  coins    : Coin[];

  async start() : Promise<void> {

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
    let accs = await new Promise((resolve, reject) => {
      web3.eth.getAccounts((e, accounts) => {
        if (e != null) {
          reject(e);
        } else {
          resolve(accounts);
        }
      });
    });

    this.setAccounts(accs);
    this.setAccount(accs[0]);

    await this.refreshBalance();
    await this.startWatching();
  }

  setBalance (val) : void {
    this.balance = val;
  }

  setAccounts (accs) : void {
    this.accounts = accs;
  }

  setAccount (acc) : void {
    this.account = acc;
  }

  setStatus (message) : void {
    this.status = message;
  }

  setCoins (coins) : void {
    this.coins = coins;
  }

  async issueCoin (input_content : string) : Promise<void> {
    this.setStatus("Initiating transaction... (please wait)");

    try {
      const mar = await MarCoin.deployed();
      await mar.issueCoin(input_content, {from: this.account, gas: 1000000});
      this.setStatus("Transaction complete!");
      await this.refreshBalance();
    } catch (e) {
      console.log(e);
      this.setStatus("Error issuing coin; see log.");
    }
  }

  async sendCoin (input_receiver : string, input_id : string) : Promise<void> {
    this.setStatus("Initiating transaction... (please wait)");

    try {
      const mar = await MarCoin.deployed();
      await mar.sendCoin(input_receiver, parseInt(input_id), {from: this.account});
      this.setStatus("Transaction complete!");
      await this.refreshBalance();
    } catch (e) {
      console.log(e);
      this.setStatus("Error sending coin; see log.");
    };
  }

  async refreshBalance () : Promise<void> {
    console.log("refreshing balance...");
    try {
      const mar            = await MarCoin.deployed();
      const value : number = (await mar.getBalance.call(this.account, {from: this.account})).toNumber();
      this.setBalance(value);
      let coins : Coin[] = [];
      for (let i = 0; i < value; i++) {
        let id = await mar.getOwnedCoins.call(this.account, i);
        coins.push(await this.getCoinById(id));
      }
      this.setCoins(coins);
    } catch (e) {
      console.log(e);
      this.setStatus("Error getting balance; see log.");
    }
  }

  async getCoinById (id : number) : Promise<Coin> {
    let mar = await MarCoin.deployed();
    return {
      id,
      content : await mar.coin_contents(id),
      issuer  : await mar.coin_issuers(id),
      owner   : await mar.coin_owners(id)
    };
  }

  async getDetailByID (id : number) : Promise<Detail> {
    let mar = await MarCoin.deployed();
    var create = mar.Create({_id: id}, {fromBlock: 0, toBlock: 'latest'});
    var create_result = await new Promise(function (resolve, reject) {
      create.get((error, result) => {
        if (error != null) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });

    let tx = create_result[0];

    let blockHash        = tx.blockHash;
    let blockNumber      = tx.blockNumber;
    let blockTimestamp   = web3.eth.getBlock(blockNumber).timestamp;
    let transactionHash  = tx.transactionHash;
    let transactionIndex = tx.transactionIndex;
    let sistercoins : Coin[] = [];
    return {
      blockHash,
      blockNumber,
      blockTimestamp,
      transactionHash,
      transactionIndex,
      sistercoins,
    };
  }

  async startWatching () {
    let mar = await MarCoin.deployed();
    var create        = mar.Create  ({_issuer: this.account});
    var transfer_from = mar.Transfer({_from  : this.account});
    var transfer_to   = mar.Transfer({_to    : this.account});
    create       .watch(() => { this.refreshBalance() });
    transfer_from.watch(() => { this.refreshBalance() });
    transfer_to  .watch(() => { this.refreshBalance() });
  }
}