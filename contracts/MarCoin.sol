pragma solidity ^0.4.8;

contract MarCoin {
	string[]  public coin_contents;
	address[] public coin_issuers;
	address[] public coin_owners;

	event Create  (uint indexed _id  ,string          _content, address indexed _issuer);
	event Transfer(uint indexed _id  ,address indexed _from   , address indexed _to    );

	function MarCoin() {
	}

	function issueCoin(string content) returns(bool sufficient) {
		uint id = coin_contents.length;
		coin_contents.push(content   );
		coin_issuers .push(msg.sender);
		coin_owners  .push(msg.sender);
		Create(id, content, msg.sender);
		return true;
	}

	function sendCoin(address receiver, uint id) returns(bool sufficient) {
		if (coin_owners[id] != msg.sender) { return false; }

		// change who owns the coin
		coin_owners[id] = receiver;

		Transfer(id, msg.sender, receiver);
		return true;
	}

	function getBalance(address addr) returns(uint) {
		uint bal = 0;
		for (uint i = 0; i < coin_owners.length; i++) {
			if (coin_owners[i] == addr) {
				bal += 1;
			}
		}
		return bal;
	}

	function getOwnedCoins(address addr, uint i) returns(uint) {
		for (uint j = 0; j < coin_owners.length; j++) {
			if (coin_owners[j] == addr) {
				if (i == 0) {
					return j;
				}
				i--;
			}
		}
		throw;
	}
}
