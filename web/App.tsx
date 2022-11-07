import { BigNumber, ethers } from "ethers";
import React, { useEffect, useState } from "react";

import abi from "../abi/BuyMeACoffee.json";

interface Memo {
  address: string;
  timestamp: Date;
  name: string;
  message: string;
}

export function App() {
  // Contract Address & ABI
  const contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3";
  const contractABI = abi.abi;

  // Component state
  const [currentAccount, setCurrentAccount] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [memos, setMemos] = useState<Memo[]>([]);
  const [hasProvider, setHasProvider] = useState(true);

  const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const onMessageChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(event.target.value);
  };

  // Wallet connection logic
  const isWalletConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        return setHasProvider(false);
      }

      const accounts = await ethereum.request?.({ method: "eth_accounts" });
      console.log("accounts: ", accounts);

      if (accounts.length > 0) {
        const account = accounts[0];
        console.log("wallet is connected! " + account);
      } else {
        console.log("make sure MetaMask is connected");
      }
    } catch (error) {
      console.log("error: ", error);
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        return setHasProvider(false);
      }

      const accounts = await ethereum.request?.({
        method: "eth_requestAccounts",
      });

      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const buyCoffee = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        return setHasProvider(false);
      }

      const provider = new ethers.providers.Web3Provider(ethereum, "any");
      const signer = provider.getSigner();
      const buyMeACoffee = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      console.log("buying coffee..");
      const coffeeTxn = await buyMeACoffee.buyCoffee(
        name ? name : "anon",
        message ? message : "Enjoy your coffee!",
        { value: ethers.utils.parseEther("0.001") }
      );

      await coffeeTxn.wait();

      console.log("mined ", coffeeTxn.hash);

      console.log("coffee purchased!");

      // Clear the form fields.
      setName("");
      setMessage("");
    } catch (error) {
      console.log(error);
    }
  };

  // Function to fetch all memos stored on-chain.
  const getMemos = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        return setHasProvider(false);
      }

      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const buyMeACoffee = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      console.log("fetching memos from the blockchain..");
      const memos = await buyMeACoffee.getMemos();
      console.log("fetched!");
      setMemos(memos);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    let buyMeACoffee: ethers.Contract;
    isWalletConnected();
    getMemos();

    // Create an event handler function for when someone sends
    // us a new memo.
    const onNewMemo = (
      from: string,
      timestamp: BigNumber,
      name: string,
      message: string
    ) => {
      console.log("Memo received: ", from, timestamp, name, message);
      setMemos((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp.toNumber() * 1000),
          message,
          name,
        },
      ]);
    };

    const { ethereum } = window;

    if (!ethereum) {
      return setHasProvider(false);
    }

    // Listen for new memo events.
    const provider = new ethers.providers.Web3Provider(ethereum, "any");
    const signer = provider.getSigner();
    buyMeACoffee = new ethers.Contract(contractAddress, contractABI, signer);

    buyMeACoffee.on("NewMemo", onNewMemo);

    return () => {
      if (buyMeACoffee) {
        buyMeACoffee.off("NewMemo", onNewMemo);
      }
    };
  }, []);

  return (
    <>
      <main className="container main">
        <h1 className="title">Buy Me a Coffee!</h1>

        {!hasProvider ? (
          <div className="warning">Please install MetaMask.</div>
        ) : null}

        <section className="actions">
          {currentAccount ? (
            <div>
              <form className="form">
                <div className="form-control">
                  <label htmlFor="name">Name</label>
                  <input
                    id="name"
                    onChange={onNameChange}
                    placeholder="anon"
                    type="text"
                  />
                </div>

                <br />

                <div className="form-control">
                  <label htmlFor="message">Send Albert a message</label>
                  <textarea
                    id="message"
                    onChange={onMessageChange}
                    placeholder="Enjoy your coffee!"
                    required
                    rows={3}
                  ></textarea>
                </div>

                <div className="form-control">
                  <button className="button" onClick={buyCoffee} type="button">
                    Send 1 Coffee for 0.001ETH
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <button className="button" onClick={connectWallet}>
              Connect your wallet
            </button>
          )}
        </section>

        {currentAccount ? (
          <section className="history">
            <h1>Memos received</h1>
            {memos.length ? (
              <ul>
                {memos.map((memo, idx) => (
                  <li className="memo" key={idx}>
                    <p className="memo-title">"{memo.message}"</p>
                    <p className="memo-description">
                      From: {memo.name} at {memo.timestamp.toString()}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <div>No memos received yet.</div>
            )}
          </section>
        ) : null}
      </main>

      <footer className="container footer">
        <a
          href="https://alchemy.com/?a=roadtoweb3weektwo"
          rel="noopener noreferrer"
          target="_blank"
        >
          Alchemy Road to Web3 - "Buy Me a Coffee"
        </a>
      </footer>
    </>
  );
}
