import React, { useState, useEffect, Suspense } from "react";
import { ChevronRight, Coins, Dice5, LayoutGrid, Wallet } from "lucide-react";
import "./Home.css";
import Web3 from "web3";
import WalletInfo from "./WalletInfo";
import App from "./dice/App";
import MathGame from "./math/App";
import SlotsGame from "./slot/App";

//************************METAMASK
window.onunhandledrejection = function (event) {
  console.error("Yakalanmamış bir Promise reddi:", event.reason);

  return true;
};
window.onerror = function (message, source, lineno, colno, error) {
  console.error("Bir hata yakalandı:", message, source, lineno, colno, error);

  return true;
};

const networks = {
  BNBTESTNET: {
    chainId: "0x61",
    chainName: "BNBTESTNET",
    nativeCurrency: {
      name: "BNB",
      symbol: "tBNB",
      decimals: 18,
    },
    rpcUrls: ["https://data-seed-prebsc-1-s1.binance.org:8545"],
    blockExplorerUrls: ["https://testnet.bscscan.com"],
  },
  REETA: {
    chainId: "0x27E0",
    chainName: "REETA",
    nativeCurrency: {
      name: "REETA",
      symbol: "REETA",
      decimals: 18,
    },
    rpcUrls: ["https://evm.average-moth-69.telebit.io"],
    blockExplorerUrls: [""],
  },
};

//************************BUTTON
const Button = ({ children, onClick, className }) => (
  <button onClick={onClick} className={`px-4 py-2 rounded ${className}`}>
    {children}
  </button>
);

const Card = ({ children, className }) => (
  <div className={`rounded-lg shadow-lg ${className}`}>{children}</div>
);

const CardContent = ({ children, className }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

const Home = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [web3, setWeb3] = useState(null);
  const [error, setError] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [notification, setNotification] = useState("");
  const [selectedGame, setSelectedGame] = useState(null); // Add this line

  //************************METAMASK
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        setWeb3(new Web3(window.ethereum));
        setNotification("Wallet successfully connected.");
        setIsConnected(true);
      } catch (error) {
        console.error("Please Refresh Website:", error);
        setNotification("Already Connected.");
      }
    } else {
      console.log("Wallet not found. Try again.");
      setNotification("Wallet not found.");
    }
  };

  useEffect(() => {
    const initializeWeb3 = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        try {
          await window.ethereum.enable();
          const accounts = await web3Instance.eth.getAccounts();
          setWeb3(web3Instance);
          setAccounts(accounts);
          setIsConnected(true);
        } catch (error) {
          console.error("Error initializing web3:", error);
          setError("Error initializing web3.");
        }
      } else {
        console.log("Metamask is not installed!");
        setError("Metamask is not installed!");
      }
    };

    initializeWeb3();
    // eslint-disable-next-line
  }, []);

  const switchNetwork = async () => {
    if (accounts.length > 0) {
      try {
        await changeNetwork("REETA");
        setNotification("Network switched successfully.");
      } catch (error) {
        console.error("Failed to switch network:", error);
        setNotification("Failed to switch network: " + error.message);
      }
    } else {
      console.log("Wallet not connected.");
      setNotification("Please connect your wallet first.");
    }
  };
  const changeNetwork = async (networkName) => {
    if (!window.ethereum) throw new Error("No crypto wallet found");
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [{ ...networks[networkName] }],
    });
  };
  const clearNotification = () => {
    setTimeout(() => {
      setNotification("");
    }, 3000);
  };

  const getNetworkName = async () => {
    if (web3) {
      try {
        const networkId = await web3.eth.net.getId();
        if (networkId === 97) {
          setNotification("Connected to REETA Testnet");
        } else {
          setNotification(
            "Not connected to REETA Testnet. Switching network..."
          );
          await switchNetwork();
        }
      } catch (error) {
        console.error("Error getting network:", error);
        setNotification("Error getting network: " + error.message);
      }
    } else {
      setNotification("Web3 not initialized. Please connect your wallet.");
    }
  };

  async function faucet() {
    /*     try {
      // Get the current gas price and nonce
      const gasPrice = await web33.eth.getGasPrice();
      const nonce = await web33.eth.getTransactionCount(faucetAccount.address);
      const balance = await web33.eth.getBalance(accounts[0].address); */
    /*       if (balance < web33.utils.toWei("2", "ether")) {
        // Create transaction object
        const tx = {
          from: faucetAccount.address,
          to: accounts[0].address,
          value: web33.utils.toWei("5", "ether"), // Convert amount to Wei
          gasPrice: gasPrice,
          gas: 21000, // Standard gas limit for sending Ether
          nonce: nonce,
        };

        // Sign the transaction
        const signedTx = await faucetAccount.signTransaction(tx);

        // Send the signed transaction
        const receipt = await web33.eth.sendSignedTransaction(
          signedTx.rawTransaction
        );

        console.log("Transaction sent:", receipt.transactionHash);
      }
    } catch (error) {
      console.log(error);
    } */
  }

  useEffect(() => {
    if (isConnected) {
      getNetworkName();
    }
  }, [isConnected]);

  useEffect(() => {
    if (notification) {
      clearNotification();
    }
  }, [notification]);

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 p-6 hidden md:block">
        <h2 className="text-2xl font-bold mb-6">Reeta's Games</h2>
        <nav>
          <ul className="space-y-2">
            <li>
              <a
                href="#"
                className="flex items-center p-2 rounded-lg hover:bg-gray-700"
                onClick={() => setSelectedGame("math")} // Add this line
              >
                <LayoutGrid className="mr-3" />
                Math Challenge
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center p-2 rounded-lg hover:bg-gray-700"
                onClick={() => setSelectedGame("dice")} // Add this line
              >
                <Dice5 className="mr-3" />
                Dice
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center p-2 rounded-lg hover:bg-gray-700"
                onClick={() => setSelectedGame("slots")} // Add this line
              >
                <Coins className="mr-3" />
                Slots
              </a>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-gray-800 p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Reeta's Crypto Games</h1>
          {isConnected && (
            <Button
              onClick={switchNetwork}
              className={`mr-4 ${"bg-green-500 hover:bg-green-600"} text-white transform hover:scale-105 transition-all duration-200`}
            >
              Change Network
            </Button>
          )}

          {isConnected && (
            <Button
              onClick={faucet}
              className="mr-4 bg-blue-500 hover:bg-blue-600 text-white transform hover:scale-105 transition-all duration-200"
            >
              Request Faucet
            </Button>
          )}
          <Button
            onClick={connectWallet}
            className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-gray-900 transform hover:scale-105 transition-all duration-200"
          >
            {isConnected ? (
              ((
                <span className="flex items-center">
                  <Wallet className="mr-2" />
                  Connected
                </span>
              ),
              (<WalletInfo />))
            ) : (
              <span className="flex items-center">
                <Wallet className="mr-2" />
                Connect MetaMask
              </span>
            )}
          </Button>
        </header>

        {/* Game Content */}
        <div className="flex-1 p-6 bg-opacity-50 bg-gray-800 bg-pattern">
          {selectedGame ? (
            <Card className="bg-green-800 h-full">
              <CardContent className="h-full">
                <Suspense fallback={<div>Loading...</div>}>
                  {selectedGame === "dice" && <App />}
                  {selectedGame === "math" && <MathGame />}
                  {selectedGame === "slots" && <SlotsGame />}
                </Suspense>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-green-80 h-full">
              <CardContent className="h-full flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-4">
                    Welcome to Reeta's Games!
                  </h2>
                  <p className="text-xl mb-6">
                    Math Game Rules
                    <ul>
                      <li>
                        1. Find target number with given numbers and operations
                      </li>
                      <li>
                        2. When done,approve transaction and get 0.2 REETA
                      </li>
                    </ul>
                    Dice Game Rules
                    <ul>
                      <li>1. Roll the dice and get 0.2 REETA if win</li>
                    </ul>
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Game Table */}
      </div>
    </div>
  );
};

export default Home;
