import React, { useState, useEffect } from "react";
import "./Homepage.css";
import Web3 from "web3";
import WalletInfo from "./WalletInfo";
import App from "./dice/App";

import Home from "./Home";

window.onerror = function (message, source, lineno, colno, error) {
  console.error("Bir hata yakalandı:", message, source, lineno, colno, error);

  return true;
};

window.onunhandledrejection = function (event) {
  console.error("Yakalanmamış bir Promise reddi:", event.reason);

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
};

function Metamask() {
  const [web3, setWeb3] = useState(null);
  const [error, setError] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [notification, setNotification] = useState("");

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        setWeb3(new Web3(window.ethereum));
        setNotification("Wallet successfully connected.");
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
        await changeNetwork("BNBTESTNET");
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

  useEffect(() => {
    if (notification) {
      clearNotification();
    }
  }, [notification]);

  return (
    <div className="LoginApp">
      {notification && <div className="toast">{notification}</div>}
      {web3 ? (
        // If Metamask is connected, show the game page
        <>
          <div class="row">
            <WalletInfo />
            {/* Switch Network button */}
            {web3 && (
              <div className="button">
                <button onClick={switchNetwork}>Switch Network</button>
              </div>
            )}
          </div>

          <div class="divider"></div>

          <Home />
        </>
      ) : (
        // If Metamask is not connected, show the Connect Wallet button
        <div className="button">
          <button onClick={connectWallet}>Connect Wallet</button>
        </div>
      )}
    </div>
  );
}

export default Metamask;
