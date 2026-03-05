"use client";

import { useState, useEffect } from "react";
import { isConnected, getAddress, signTransaction, requestAccess } from "@stellar/freighter-api";
import * as StellarSdk from "@stellar/stellar-sdk";

export default function Home() {
  const [word, setWord] = useState("");
  const [story, setStory] = useState<string[]>([]);
  const [walletAddress, setWalletAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchStory();
  }, []);

  async function fetchStory() {
    const res = await fetch("/api/get-story");
    const data = await res.json();
    if (data.words) setStory(data.words);
  }

  async function connectWallet() {
  try {
    const connected = await isConnected();
    if (!connected.isConnected) {
      setMessage("Freighter wallet not found. Please install it.");
      return;
    }

    await requestAccess();
    const result = await getAddress();
    console.log("getAddress result:", JSON.stringify(result));

    const addr = result?.address;
    if (!addr) {
      setMessage("Could not get wallet address.");
      return;
    }

    setWalletAddress(addr);
    setMessage("Wallet connected ✅");
  } catch (e) {
    console.log("Error:", e);
    setMessage("Error: " + e);
  }
}

  async function sendWord() {
    if (!walletAddress) {
      setMessage("Please connect your wallet first.");
      return;
    }
    if (!word.trim()) {
      setMessage("Please enter a word.");
      return;
    }
    if (word.trim().split(" ").length > 1) {
      setMessage("One word only.");
      return;
    }

    setLoading(true);
    setMessage("Preparing transaction...");

    try {
      const server = new StellarSdk.Horizon.Server("https://horizon-testnet.stellar.org");
      const account = await server.loadAccount(walletAddress);

      const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.TESTNET,
      })
        .addOperation(
          StellarSdk.Operation.payment({
            destination: walletAddress,
            asset: StellarSdk.Asset.native(),
            amount: "0.0000001",
          })
        )
        .addMemo(StellarSdk.Memo.text(word.trim()))
        .setTimeout(30)
        .build();

      const xdr = transaction.toXDR();
      const signed = await signTransaction(xdr, { networkPassphrase: StellarSdk.Networks.TESTNET });
      console.log("signed:", JSON.stringify(signed));
      const signedXdr = typeof signed === "string" ? signed : signed?.signedTxXdr ?? signed;
      const tx = StellarSdk.TransactionBuilder.fromXDR(signedXdr, StellarSdk.Networks.TESTNET);
      await server.submitTransaction(tx);

      setMessage("Word added to the story ✅");
      setWord("");
      fetchStory();
    } catch (err) {
      setMessage("Error: " + err);
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-2">One Word Story</h1>
      <p className="text-gray-400 mb-8">Every word is written to the Stellar blockchain. Forever.</p>

      <div className="w-full max-w-2xl bg-gray-900 rounded-xl p-6 mb-8 min-h-32">
        <p className="text-gray-400 text-sm mb-3">The Story So Far:</p>
        {story.length === 0 ? (
          <p className="text-gray-600 italic">No words yet. Be the first to write.</p>
        ) : (
          <p className="text-xl leading-relaxed">{story.join(" ")}</p>
        )}
      </div>

      {!walletAddress ? (
        <button
          onClick={connectWallet}
          className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg mb-4 font-semibold"
        >
          Connect Freighter Wallet
        </button>
      ) : (
        <p className="text-green-400 text-sm mb-4">
          Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-6)}
        </p>
      )}

      <div className="flex gap-3 w-full max-w-md">
        <input
          type="text"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          placeholder="Enter a word..."
          className="flex-1 bg-gray-800 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
          onKeyDown={(e) => e.key === "Enter" && sendWord()}
        />
        <button
          onClick={sendWord}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 px-6 py-3 rounded-lg font-semibold"
        >
          {loading ? "..." : "Submit"}
        </button>
      </div>

      {message && (
        <p className="mt-4 text-sm text-yellow-400">{message}</p>
      )}
    </main>
  );
}