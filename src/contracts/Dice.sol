// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract DiceGame {
    //DATA

    address owner;
    mapping(address => uint256) public playerBalances;
    uint256 FEE ;

    event GameResult(
        address indexed player,
        uint256 playerNumber,
        uint256 computerNumber,
        bool playerWins,
        uint256 payout
    );
    event GameFeeMessage(address owner, uint256 gamecost);

    constructor() {
        owner = payable(msg.sender);
        FEE = 0.1 * 10 ** 18;
    }

   
    modifier checkBet() {
        require(
            msg.value == FEE,
            "Not enough play FEE"
        );
        _;
    }

    

    //checks if the player has balance
    modifier checkBalance() {
        require(
            playerBalances[msg.sender] > 0,
            "No funds available for withdrawal."
        );
        _;
    }

    //only owner can perform
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform");
        _;
    }

    //EXECUTE FUNCTIONS


   function changeGameFee(uint256 fee) external onlyOwner {
        FEE = fee * 10 ** 18;
        emit GameFeeMessage(msg.sender, FEE);
   
    }
    //play function
    function play() external payable checkBet {
        uint256 playerNumber = roll(
            block.timestamp,
            block.difficulty,
            msg.sender,
            block.number + 9
        );
        uint256 computerNumber = roll(
            block.timestamp + 1,
            block.difficulty,
            address(this),
            block.number - 1
        );

        bool playerWins = playerNumber > computerNumber;

        if (playerWins) {
            uint256 payout = FEE * 2;
            playerBalances[msg.sender] += payout;
            emit GameResult(
                msg.sender,
                playerNumber,
                computerNumber,
                true,
                payout
            );
        } else {
            emit GameResult(msg.sender, playerNumber, computerNumber, false, 0);
        }


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

    //the player can withdraw his balance
    //can give error when the balance is low. This game will be use it's own token
    //Then when the balance is low new token will be minted by owner and will be sent to contract

    function withdraw() external {
        uint256 amount = playerBalances[msg.sender];
       

        require(amount > 0, "No funds available for withdrawal."); // Add a revert message here

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Failed to send funds.");
        playerBalances[msg.sender] = 0;
    }

    //roll function to get random numbers

    function roll(
        uint256 seed1,
        uint256 seed2,
        address user,
        uint256 bNumber
    ) public pure returns (uint256) {
        uint256 rollNumber = (uint256(
            keccak256(abi.encodePacked(seed1, seed2, user, bNumber))
        ) % 6) + 1;
        return rollNumber;
    }

    //QUERY FUNCTIONS

    function checkGameBalance() external view returns (uint256) {
        return playerBalances[msg.sender];
    }

    function get_owner() external view returns (address) {
        return owner;
    }
    
    //check balance of the contract and withdraw
        // Function to check the balance of the contract
    function checkContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    // Function to withdraw the balance from the contract
    function withdrawContractBalance() public onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }


       function checkFee() public view returns (uint256) {
        return FEE;
    }
}
