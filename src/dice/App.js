import React, { useState, useEffect, useContext } from "react";
import { ethers } from "ethers";
import dice1 from "./image/1.png";
import dice2 from "./image/2.png";
import dice3 from "./image/3.png";
import dice4 from "./image/4.png";
import dice5 from "./image/5.png";
import dice6 from "./image/6.png";
import play from "./image/play.png";
import { Button } from "@chakra-ui/react";
import { WalletContext } from "../WalletContext"; // WalletContext'i içe aktar

const App = () => {
  const [payout, setPayout] = useState(0);
  const [yourChoice, setYourChoice] = useState("");
  const [AIChoice, setAIChoice] = useState(null);
  const { account, diceContract } = useContext(WalletContext);

  const diceImages = [dice1, dice2, dice3, dice4, dice5, dice6];

  useEffect(() => {
    const initEthers = async () => {};

    initEthers();
  }, []);

  const playGame = async () => {
    // Clear the results of old games
    setYourChoice("");
    setAIChoice(null);
    setPayout(0);
    try {
      if (!account) {
        console.error("Please connect your Ethereum wallet.");
        return;
      }

      const transaction = await diceContract.play({
        from: account,
        value: ethers.utils.parseEther("0.1", "ether"),
        maxFeePerGas: 10000000000,
        maxPriorityFeePerGas: 10000000000,
      });

      const result = await transaction.wait();

      // Assuming result.events is an array of event logs:
      const gameResultEvent = result.events.find(
        (event) => event.event === "GameResult"
      );

      if (gameResultEvent) {
        const playerAddress = gameResultEvent.args[0]; // First argument: player address
        const computerNumber = Number(gameResultEvent.args[2]); // Second argument: computer number (BigNumber)
        const playerNumber = Number(gameResultEvent.args[1]); // Third argument: player number (BigNumber)
        const isWinner = gameResultEvent.args[3]; // Fourth argument: is winner (boolean)
        const paid = gameResultEvent.args[4]; // Fifth argument: payout (BigNumber)

        console.log("Computer Number:", computerNumber.toString()); // Convert BigNumber to string for logging
        console.log("Player Number:", playerNumber.toString());
        console.log("Is Winner:", isWinner);
        console.log("Payout:", payout.toString());

        const payoutEther = ethers.utils.formatEther(paid);

        setYourChoice(playerNumber);
        setAIChoice(computerNumber);
        setPayout(payoutEther);
      }
    } catch (error) {
      console.error("Error playing the game:", error);
    }
  };

  const withdraw = async () => {
    try {
      let balance = await diceContract.checkGameBalance();
      console.log(`Balance: ${balance}`);
      await diceContract.withdraw({
        from: account,
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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-700 to-indigo-900 p-4">
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
                <Button onClick={withdraw}>Check Balance and Withdraw</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
