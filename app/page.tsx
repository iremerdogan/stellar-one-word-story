"use client";

import { useState, useEffect, useRef } from "react";
import { isConnected, getAddress, signTransaction, requestAccess } from "@stellar/freighter-api";
import * as StellarSdk from "@stellar/stellar-sdk";

function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = [
      "167, 139, 250",
      "236, 72, 153",
      "99, 102, 241",
      "196, 181, 253",
    ];

    const particles: {
      x: number; y: number; size: number;
      speedX: number; speedY: number;
      opacity: number; pulse: number; color: string;
    }[] = [];

    for (let i = 0; i < 70; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2.5 + 1,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.4,
        opacity: Math.random() * 0.5 + 0.2,
        pulse: Math.random() * Math.PI * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let animId: number;

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.pulse += 0.02;
        const pulsedOpacity = p.opacity + Math.sin(p.pulse) * 0.2;

        ctx.shadowBlur = 15;
        ctx.shadowColor = `rgba(${p.color}, ${pulsedOpacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${pulsedOpacity})`;
        ctx.fill();
        ctx.shadowBlur = 0;

        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      });

      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach((p2) => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 90) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(167, 139, 250, ${0.12 * (1 - dist / 90)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      animId = requestAnimationFrame(draw);
    }

    draw();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}

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
      const addr = typeof result === "string" ? result : result?.address;
      if (!addr) {
        setMessage("Could not get wallet address.");
        return;
      }
      setWalletAddress(addr);
      setMessage("Wallet connected ✅");
    } catch (e) {
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
      const signedXdr = typeof signed === "string" ? signed : signed?.signedTxXdr ?? signed;
      const tx = StellarSdk.TransactionBuilder.fromXDR(signedXdr, StellarSdk.Networks.TESTNET);
      await server.submitTransaction(tx);

      setMessage("Your word is now part of the story forever ✨");
      setWord("");
      fetchStory();
    } catch (err) {
      setMessage("Error: " + err);
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#060609] text-white flex flex-col items-center justify-center p-8 relative overflow-hidden">
      <AnimatedBackground />

      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-900 opacity-10 rounded-full blur-3xl pointer-events-none" />

      <div className="text-center mb-10 z-10">
        <h1 className="text-5xl font-extrabold tracking-tight mb-3 bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
          One Word Story
        </h1>
        <p className="text-gray-400 text-lg max-w-md mx-auto leading-relaxed">
          A collective story written by strangers — one word at a time, sealed forever on the Stellar blockchain.
        </p>
      </div>

      <div className="w-full max-w-2xl rounded-2xl p-6 mb-8 min-h-36 z-10 border border-white/10 bg-white/5 backdrop-blur-sm">
        <p className="text-xs uppercase tracking-widest text-purple-400 mb-4 font-semibold">The Story So Far</p>
        {story.length === 0 ? (
          <p className="text-gray-500 italic text-lg">No words yet. Be the first to write.</p>
        ) : (
          <p className="text-xl leading-relaxed text-gray-100 font-light">{story.join(" ")}</p>
        )}
        {story.length > 0 && (
          <p className="text-xs text-gray-600 mt-4">{story.length} word{story.length !== 1 ? "s" : ""} on-chain</p>
        )}
      </div>

      <div className="z-10 mb-6">
        {!walletAddress ? (
          <button
            onClick={connectWallet}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all px-8 py-3 rounded-xl font-semibold text-white shadow-lg shadow-purple-900/40"
          >
            Connect Freighter Wallet
          </button>
        ) : (
          <p className="text-green-400 text-sm bg-green-400/10 px-4 py-2 rounded-lg border border-green-400/20">
            ● Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-6)}
          </p>
        )}
      </div>

      <div className="flex gap-3 w-full max-w-md z-10">
        <input
          type="text"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          placeholder="Your word..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-3 outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-600 backdrop-blur-sm"
          onKeyDown={(e) => e.key === "Enter" && sendWord()}
        />
        <button
          onClick={sendWord}
          disabled={loading}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 transition-all px-6 py-3 rounded-xl font-semibold shadow-lg shadow-purple-900/30"
        >
          {loading ? "..." : "Submit"}
        </button>
      </div>

      {message && (
        <p className="mt-5 text-sm text-yellow-300/80 z-10 bg-yellow-400/5 px-4 py-2 rounded-lg border border-yellow-400/10">
          {message}
        </p>
      )}

      <p className="absolute bottom-6 text-xs text-gray-700 z-10">
        Built on Stellar Testnet · Every word is immutable
      </p>
    </main>
  );
}