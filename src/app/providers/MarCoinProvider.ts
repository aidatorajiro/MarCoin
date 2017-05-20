import { Injectable } from '@angular/core';
import Web3 from "web3";
import { default as contract } from 'truffle-contract'
import marcoin_artifacts from '../../../build/contracts/MarCoin.json'
import moment from "moment";

moment.locale('ja');

const MarCoin : any = contract(marcoin_artifacts);
let web3      : any;
let mar       : any;

export interface Coin {
  id      : number,
  content : string,
  issuer  : string,
  owner   : string
}

export interface Detail {
  blockHash        : string,
  blockNumber      : number,
  blockTime        : moment.Moment,
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

  private getAccounts() {
    return new Promise((resolve, reject) => {
      web3.eth.getAccounts((error, result) => {
        if (error != null) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  private getEventResult(ev) : Promise<Array<any>> {
    return new Promise((resolve, reject) => {
      ev.get((error, result) => {
        if (error != null) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

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

    mar = await MarCoin.deployed();

    // Get the initial account balance so it can be displayed.
    const accs = await this.getAccounts();

    this.setAccounts(accs);
    this.setAccount(accs[0]);

    await this.refreshBalance();
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
    return {
      id,
      content : await mar.coin_contents(id),
      issuer  : await mar.coin_issuers(id),
      owner   : await mar.coin_owners(id)
    };
  }

  async getDetailByID (id : number) : Promise<Detail> {
    const create          = mar.Create({_id: id}, {fromBlock: 0, toBlock: 'latest'});
    const create_result   = await this.getEventResult(create);
    const tx = create_result[0];

    const blockHash        = tx.blockHash;
    const blockNumber      = tx.blockNumber;
    const blockTime        = moment.unix(web3.eth.getBlock(blockNumber).timestamp);
    const transactionHash  = tx.transactionHash;
    const transactionIndex = tx.transactionIndex;

    const sister        = mar.Create(null, {fromBlock: blockNumber, toBlock: blockNumber});
    const sister_result = await this.getEventResult(sister);
    const sistercoins   = await Promise.all(sister_result.map(async (c) => (
      {
        id : c.args._id,
        content : c.args._content,
        issuer  : c.args._issuer,
        owner   : await mar.coin_owners(c.args._id)
      }
    )));

    return {
      blockHash,
      blockNumber,
      blockTime,
      transactionHash,
      transactionIndex,
      sistercoins,
    };
  }
}