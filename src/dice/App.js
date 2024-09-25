import React, { useState, useEffect } from "react";
import Web3 from "web3";
import dice1 from "./image/1.png";
import dice2 from "./image/2.png";
import dice3 from "./image/3.png";
import dice4 from "./image/4.png";
import dice5 from "./image/5.png";
import dice6 from "./image/6.png";
import play from "./image/play.png";

const contractAddress = "0x996f661f1bF0B1d749bD4C57beDD03887E028D99";
const contractABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "player",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "playerNumber",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "computerNumber",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "playerWins",
        type: "bool",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "payout",
        type: "uint256",
      },
    ],
    name: "GameResult",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "playerBalances",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [],
    name: "play",
    outputs: [],
    stateMutability: "payable",
    type: "function",
    payable: true,
  },
  {
    inputs: [],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "seed1",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "seed2",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "bNumber",
        type: "uint256",
      },
    ],
    name: "roll",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
    constant: true,
  },
  {
    inputs: [],
    name: "checkGameBalance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
  {
    inputs: [],
    name: "get_owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
    constant: true,
  },
];

const App = () => {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [userAddress, setUserAddress] = useState(null);
  const [payout, setPayout] = useState(0);
  const [yourChoice, setYourChoice] = useState("");
  const [AIChoice, setAIChoice] = useState(null);

  const diceImages = [dice1, dice2, dice3, dice4, dice5, dice6];

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        const contractInstance = new web3Instance.eth.Contract(
          contractABI,
          contractAddress
        );
        setContract(contractInstance);
        const accounts = await web3Instance.eth.getAccounts();
        setUserAddress(accounts[0]);
      }
    };
    initWeb3();
  }, []);

  const playGame = async () => {
    // Clear the results of old games
    setYourChoice("");
    setAIChoice(null);
    setPayout(0);
    try {
      if (!web3 || !contract || !userAddress) {
        console.error("Please connect your Ethereum wallet.");
        return;
      }

      const transaction = await contract.methods.play().send({
        from: userAddress,
        value: web3.utils.toWei("0.001", "ether"),
        maxFeePerGas: 10000000000,
        maxPriorityFeePerGas: 10000000000,
      });

      const playerNumber = Number(
        transaction.events.GameResult.returnValues.playerNumber
      );
      const computerNumber = Number(
        transaction.events.GameResult.returnValues.computerNumber
      );
      const paid = transaction.events.GameResult.returnValues.payout;
      const payoutEther = web3.utils.fromWei(paid, "ether");

      setYourChoice(playerNumber);
      setAIChoice(computerNumber);
      setPayout(payoutEther);
    } catch (error) {
      console.error("Error playing the game:", error);
    }
  };

  const withdraw = async () => {
    try {
      let balance = await contract.methods.checkGameBalance().call();
      console.log(`Balance: ${balance}`);
      await contract.methods.withdraw().send({
        from: userAddress,
        maxFeePerGas: 10000000000,
        maxPriorityFeePerGas: 10000000000,
      });
    } catch (error) {
      console.error("Error executing withdraw function:", error);
    }
  };

  const getGameResult = () => {
    if (yourChoice > AIChoice) {
      return <h2 className="text-2xl font-bold text-green-500">You Won!</h2>;
    } else if (AIChoice > yourChoice) {
      return <h2 className="text-2xl font-bold text-red-500">You Lost!</h2>;
    } else if (AIChoice === null && yourChoice === "") {
      return <h2 className="text-2xl font-bold text-gray-500">Start Game!</h2>;
    } else {
      return <h2 className="text-2xl font-bold text-blue-500">Draw</h2>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-center mb-8">
              <img
                alt="choose"
                onClick={playGame}
                className="w-40 h-40 cursor-pointer hover:opacity-80 transition-opacity"
                src={play}
              />
            </div>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex flex-col items-center">
                  <p className="font-bold mb-2">You </p>
                  {yourChoice && (
                    <img
                      alt="Your dice"
                      className="w-16 h-16"
                      src={diceImages[yourChoice - 1]}
                    />
                  )}
                </div>
                <div className="flex flex-col items-center">
                  <p className="font-bold mb-2">AI</p>
                  {AIChoice && (
                    <img
                      alt="AI dice"
                      className="w-16 h-16"
                      src={diceImages[AIChoice - 1]}
                    />
                  )}
                </div>
              </div>
              {getGameResult()}
              <p className="text-center font-semibold">Payout: {payout} ETH</p>
              <div className="flex justify-center">
                <button
                  onClick={withdraw}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Check Balance and Withdraw
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
