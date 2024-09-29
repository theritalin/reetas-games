// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract MathGame  {
    uint256 public gameFee;
    uint256 public timeLimit = 180; 
    mapping(address => uint256) public gameStartTime; // Oyuncunun oyun başlama zamanını tutar
    mapping(address => uint256) public playerBalances;
    address owner;

    event GamePlayed(address player, uint256 fee);
    event GameWon(address player, uint256 payout);
    event GameOver(address player);
    event FeeChanged(uint256 newFee);
    event Withdrawal(address player, uint256 amount);

    constructor() {
        owner = payable(msg.sender);
        gameFee = 0.1 * 10 ** 18;
    }

       //only owner can perform
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform");
        _;
    }

    modifier checkBet() {
        require(msg.value == gameFee, "Not enough play FEE");
        _;
    }

    function changeFee(uint256 _newFee) external onlyOwner {
        gameFee = _newFee * 10 ** 18;
        emit FeeChanged(_newFee);
    }

    function getTime() external view onlyOwner returns (uint256) {
        return timeLimit;
    }

    function getFee() external view onlyOwner returns (uint256) {
        return gameFee;
    }


    function changeTime(uint256 _newtime) external onlyOwner {
            timeLimit = _newtime ;
        }


//ektra çekmek isterse
    function withdraw() external  {
        uint256 amount = playerBalances[msg.sender];
        require(amount > 0, "No balance to withdraw");
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
        playerBalances[msg.sender] = 0;
        emit Withdrawal(msg.sender, amount);
    }
    // Function to withdraw the balance from the contract
    function withdrawContractBalance() public onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }

    function play() external payable checkBet {
        uint sentBalance = playerBalances[msg.sender];
        gameStartTime[msg.sender] = 0;
        if (sentBalance > 0) {
            if (address(this).balance >= sentBalance) {
                payable(msg.sender).transfer(sentBalance);
                playerBalances[msg.sender] = 0;
            } else {
                //next time
            }
        }
       require(gameStartTime[msg.sender] == 0 || block.timestamp > gameStartTime[msg.sender] + timeLimit, "Game already started or in progress");
        gameStartTime[msg.sender] = block.timestamp; // Oyunun başladığı zamanı kaydet
        emit GamePlayed(msg.sender, msg.value);
    }


//başkası abi alıp sürekli aynı sayıyı gönderebilir.
    function checkResult(uint256 playerResult ,uint256 target ) external {
        require(gameStartTime[msg.sender] != 0, "Game not started");
        require(block.timestamp <= gameStartTime[msg.sender] + timeLimit, "Time is over!"); // Zaman aşımı kontrolü

        if (playerResult == target) {
            uint256 payoutAmount = 2 * gameFee; // Ödül, bahis miktarının 2 katı
            playerBalances[msg.sender] += payoutAmount;
            emit GameWon(msg.sender, payoutAmount);
        } else {
            emit GameOver(msg.sender);
        }
        gameStartTime[msg.sender] = 0; // Oyun bittiğinde zaman sıfırlanır
            
         uint sentBalance = playerBalances[msg.sender];

        if (sentBalance > 0) {
            if (address(this).balance >= sentBalance) {
                payable(msg.sender).transfer(sentBalance);
                playerBalances[msg.sender] = 0;
            } else {
                //next time
            }
        }
    }

  function forceEndGame(address player) external {
 
    emit GameOver(player);
}

function useFaucet() external {
    require(address(this).balance >= 5 * 10 ** 18, "Faucet empty, not enough balance in contract"); // Ensure contract has enough Ether
    require(msg.sender.balance < 2 * 10 ** 18, "Wallet balance is too high to use the faucet"); // Check if the wallet balance is below 2 tokens

    (bool success, ) = payable(msg.sender).call{value: 5 * 10 ** 18}(""); // Transfer 5 tokens (in wei) directly to player's wallet
    require(success, "Faucet transfer failed"); // Ensure the transfer was successful

}



    receive() external payable {}
}