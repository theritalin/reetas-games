import React, { useState, useEffect } from "react";
import { Box, Button, Heading, VStack } from "@chakra-ui/react";
import { Progress } from "@chakra-ui/react";
import { Sparkles, Clock, Target } from "lucide-react";
import Web3 from "web3";

const contractAddress = "0x59d007A9b3A244A068b2Ec20E3B608BB44a8B6E6";
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
        indexed: false,
        internalType: "uint256",
        name: "newFee",
        type: "uint256",
      },
    ],
    name: "FeeChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "player",
        type: "address",
      },
    ],
    name: "GameOver",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "player",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "fee",
        type: "uint256",
      },
    ],
    name: "GamePlayed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "player",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "payout",
        type: "uint256",
      },
    ],
    name: "GameWon",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "player",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Withdrawal",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_newFee",
        type: "uint256",
      },
    ],
    name: "changeFee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_newtime",
        type: "uint256",
      },
    ],
    name: "changeTime",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "playerResult",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "target",
        type: "uint256",
      },
    ],
    name: "checkResult",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "player",
        type: "address",
      },
    ],
    name: "forceEndGame",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "gameFee",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "gameStartTime",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getFee",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTime",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "play",
    outputs: [],
    stateMutability: "payable",
    type: "function",
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
  },
  {
    inputs: [],
    name: "timeLimit",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "useFaucet",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "withdrawContractBalance",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
];

const generateRandomNumbers = () => {
  const smallNumbers = Array.from(
    { length: 5 },
    () => Math.floor(Math.random() * 9) + 1
  );
  const largeNumber = Math.floor(Math.random() * 90) + 10;
  return [...smallNumbers, largeNumber];
};

const generateTargetNumber = () => Math.floor(Math.random() * 900) + 100;

const OPERATIONS = ["+", "-", "×", "÷"];

export default function MathGame() {
  const [contract, setContract] = useState(null);
  const [targetNumber, setTargetNumber] = useState(generateTargetNumber());
  const [initialNumbers, setInitialNumbers] = useState(generateRandomNumbers());
  const [numbers, setNumbers] = useState([...initialNumbers]);
  const [currentCalculation, setCurrentCalculation] = useState([]);
  const [calculations, setCalculations] = useState([]);
  const [timer, setTimer] = useState(120); // 3 minutes
  const [gameOver, setGameOver] = useState(false);
  const [payout, setPayout] = useState(0);
  const [userAddress, setUserAddress] = useState(null);
  const [web3, setWeb3] = useState(null);
  useEffect(() => {
    setGameOver(true);
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

  useEffect(() => {
    let interval;
    if (!gameOver && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            clearInterval(interval);
            setGameOver(true);
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [gameOver, timer]);

  const handleNumberClick = (num, index) => {
    setCurrentCalculation([...currentCalculation, num]);
    setNumbers(numbers.filter((_, i) => i !== index));
  };

  const handleOperationClick = (op) => {
    setCurrentCalculation([...currentCalculation, op]);
  };

  const handleCalculationItemClick = (index) => {
    const item = currentCalculation[index];
    setCurrentCalculation(currentCalculation.filter((_, i) => i !== index));
    if (typeof item === "number") {
      setNumbers([...numbers, item]);
    }
  };

  const calculateResult = async () => {
    if (!gameOver) {
      const calculation = currentCalculation
        .join(" ")
        .replace("×", "*")
        .replace("÷", "/");
      try {
        const result = eval(calculation);
        if (result === targetNumber) {
          // Player wins, payout is double the bet
          setPayout(0.2);

          await contract.methods
            .checkResult(result, targetNumber)
            .send({ from: userAddress });
          setGameOver(true);
        }

        setCalculations([
          ...calculations,
          {
            expression: currentCalculation.join(" "),
            result,
            numbers: currentCalculation.filter(
              (item) => typeof item === "number"
            ),
            usedCalculations: calculations.length,
          },
        ]);
        setNumbers([...numbers, result]);
        setCurrentCalculation([]);
      } catch (error) {
        console.error("Invalid calculation");
      }
    }
  };

  const startGame = async () => {
    if (!contract || !userAddress) {
      console.error("Contract or user address not available");
      return;
    }

    try {
      await contract.methods.play().send({
        from: userAddress,
        value: web3.utils.toWei("0.1", "ether"),
      });

      const newInitialNumbers = generateRandomNumbers();
      setTargetNumber(generateTargetNumber());
      setInitialNumbers(newInitialNumbers);
      setNumbers(newInitialNumbers);
      setCurrentCalculation([]);
      setCalculations([]);
      setTimer(120);
      setGameOver(false);
      setPayout(0);
    } catch (error) {
      console.error("Error starting the game:", error);
    }
  };

  const resetGame = () => {
    setNumbers([...initialNumbers]);
    setCurrentCalculation([]);
    setCalculations([]);
  };

  const forceEndGame = async () => {
    try {
      await contract.methods
        .forceEndGame(userAddress)
        .send({ from: userAddress });
    } catch (error) {}
  };

  const withdraw = async () => {
    try {
      await contract.methods.withdraw().send({ from: userAddress });
    } catch (error) {}
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-700 to-indigo-900 p-4">
      <Box className="w-full max-w-md bg-white/10 backdrop-blur-md border-none text-white">
        <VStack className="space-y-1">
          <Heading className="text-2xl font-bold text-center">
            Math Challenge
          </Heading>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-yellow-400" />
              <span className="text-xl font-semibold">{targetNumber}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-green-400" />
              <span className="text-xl font-semibold">
                {Math.floor(timer / 60)}:
                {(timer % 60).toString().padStart(2, "0")}
              </span>
            </div>
          </div>
          <Progress value={(timer / 180) * 100} className="h-2 bg-gray-600" />
        </VStack>

        <VStack className="space-y-4">
          <div className="bg-white/20 p-4 rounded-lg h-[200px] w-[400px] overflow-y-auto">
            <div className="flex flex-wrap items-start content-start ">
              {currentCalculation.map((item, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="m-1 p-1 text-lg bg-white/30 hover:bg-white/40 text-white"
                  onClick={() => handleCalculationItemClick(index)}
                >
                  {item}
                </Button>
              ))}
            </div>
            {calculations.map((calc, index) => (
              <div
                key={index}
                className="flex justify-between items-center text-sm text-gray-300 mt-2"
              >
                <span>
                  {calc.expression} = {calc.result}
                </span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {numbers.map((num, index) => (
              <Button
                key={`${num}-${index}`}
                onClick={() => handleNumberClick(num, index)}
                disabled={gameOver}
                className="text-lg font-bold bg-indigo-600 hover:bg-indigo-700"
              >
                {num}
              </Button>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {OPERATIONS.map((op) => (
              <Button
                key={op}
                onClick={() => handleOperationClick(op)}
                disabled={gameOver}
                className="text-lg font-bold bg-purple-600 hover:bg-purple-700"
              >
                {op}
              </Button>
            ))}
          </div>
          <div>
            <Button
              onClick={calculateResult}
              disabled={gameOver || currentCalculation.length < 3}
              className="bg-green-600 hover:bg-green-700"
            >
              {"........=........"}
            </Button>
            <Button
              onClick={resetGame}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              {"Reset"}
            </Button>
          </div>
          <div className="flex justify-between mt-4">
            <Button
              onClick={startGame}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              {"New Game (0.1 REETA)"}
            </Button>
          </div>
          <div className="flex justify-between mt-4">
            <Button
              onClick={withdraw}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              {"Withdraw"}
            </Button>
            <Button
              onClick={forceEndGame}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              {"Force End Game"}
            </Button>
          </div>

          {gameOver && (
            <div className="mt-4 text-center bg-white/20 p-4 rounded-lg">
              <h2 className="text-2xl font-bold flex items-center justify-center">
                <Sparkles className="mr-2 h-6 w-6 text-yellow-400" />
                {payout > 0 ? "Congratulations!" : "Game Over!"}
              </h2>
              <p className="text-lg mt-2">
                {payout > 0
                  ? `You won ${payout} REEETA!`
                  : "Better luck next time!"}
              </p>
            </div>
          )}
        </VStack>
      </Box>
    </div>
  );
}

///faucet üzerinde çalış
