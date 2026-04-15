"use client";

import { useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";

const navigationItems = [
  { label: "Landing", icon: "🏠", id: "landing", active: true },
  { label: "Dashboard", icon: "📊", id: "dashboard" },
  { label: "AI Chat", icon: "💬", id: "ai-chat" },
  { label: "Simulator", icon: "📈", id: "simulator" },
  { label: "Confirm Tx", icon: "✓", id: "confirm-tx" },
  { label: "Alert Settings", icon: "🔔", id: "alert-settings", badge: true },
  { label: "History", icon: "📋", id: "history" },
];

export default function Home() {
  const { connected, disconnect, publicKey, select, wallets } = useWallet();

  const truncatedAddress = publicKey
    ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}`
    : null;

  const handleDisconnect = useCallback(() => {
    disconnect();
  }, [disconnect]);

  const handlePhantomConnect = useCallback(() => {
    const phantomWallet = wallets.find(
      (w) => w.adapter.name === "Phantom"
    );
    if (phantomWallet) {
      select(phantomWallet.adapter.name);
    }
  }, [wallets, select]);

  const handleSolflareConnect = useCallback(() => {
    const solflareWallet = wallets.find(
      (w) => w.adapter.name === "Solflare"
    );
    if (solflareWallet) {
      select(solflareWallet.adapter.name);
    }
  }, [wallets, select]);

  if (connected) {
    return (
      <div className="min-h-screen flex bg-slate-950">
        {/* Sidebar */}
        <div className="w-56 border-r border-slate-700 bg-slate-900">
          <div className="p-4 border-b border-slate-700">
            <h1 className="text-lg font-bold text-white">Argus</h1>
          </div>
          <div className="p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase mb-3">
              Navigation
            </p>
            {navigationItems.map((item) => (
              <button
                key={item.id}
                className="w-full text-left px-3 py-2 rounded text-sm text-slate-400 hover:bg-slate-800 transition-colors"
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
                {item.badge && (
                  <span className="ml-2 inline-block w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    1
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-12 max-w-md w-full text-center">
            <div className="mb-6">
              <p className="text-slate-400 text-sm mb-4">Connected Wallet</p>
              <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                <p className="text-white font-mono text-lg font-semibold">
                  {truncatedAddress}
                </p>
                <p className="text-slate-500 text-xs mt-2 break-all">
                  {publicKey?.toString()}
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-6">
              <button
                onClick={() => {
                  console.log("Navigate to dashboard");
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors"
              >
                Go to Dashboard
              </button>
              <button
                onClick={handleDisconnect}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded-lg transition-colors"
              >
                Disconnect
              </button>
            </div>

            <p className="text-slate-400 text-xs pt-6 border-t border-slate-700 mt-6">
              You're all set! Argus is now monitoring your positions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Landing Page - Disconnected State
  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* Sidebar */}
      <div className="w-56 border-r border-slate-700 bg-slate-900">
        <div className="p-4 border-b border-slate-700">
          <h1 className="text-lg font-bold text-white">Argus</h1>
        </div>
        <div className="p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-3">
            Navigation
          </p>
          {navigationItems.map((item) => (
            <button
              key={item.id}
              className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                item.active
                  ? "bg-blue-600/20 text-blue-400 border-l-2 border-blue-400"
                  : "text-slate-400 hover:bg-slate-800"
              }`}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
              {item.badge && (
                <span className="ml-2 inline-block w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  1
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="max-w-2xl w-full text-center space-y-8">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="w-16 h-16 flex items-center justify-center">
              <svg
                className="w-full h-full text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7m0 0a9.958 9.958 0 01-9.542 7c-4.477 0-8.268-2.943-9.542-7m19.084 0A10.002 10.002 0 0012 22c-5.49 0-10.129-3.612-11.701-8.5"
                />
              </svg>
            </div>
          </div>

          {/* Tagline */}
          <div className="space-y-2">
            <div className="inline-block px-3 py-1 bg-teal-500/20 border border-teal-500/40 rounded-full">
              <span className="text-teal-400 text-xs font-medium">
                ● Watching Solana DeFi 24/7
              </span>
            </div>
            <h1 className="text-5xl font-bold text-white leading-tight">
              Your Kamino positions,{" "}
              <span className="text-blue-400">protected while you sleep.</span>
            </h1>
          </div>

          {/* Description */}
          <p className="text-slate-400 text-base leading-relaxed max-w-lg mx-auto">
            Argus monitors your DeFi health factor in real time and acts the
            moment you're at risk — so you never wake up to a liquidated
            position.
          </p>

          {/* Wallet Buttons */}
          <div className="flex flex-col gap-4 pt-4">
            {/* Phantom Button */}
            <button
              onClick={handlePhantomConnect}
              className="flex items-center gap-4 px-6 py-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:bg-slate-800/80 transition-colors group"
            >
              <div className="flex-shrink-0">
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  color="#AB9FF2"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                </svg>
              </div>
              <div className="text-left flex-1">
                <p className="text-white font-semibold text-sm">
                  Connect Phantom
                </p>
                <p className="text-slate-500 text-xs">
                  Most popular Solana wallet
                </p>
              </div>
              <svg
                className="w-5 h-5 text-slate-500 group-hover:text-slate-400 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            {/* Solflare Button */}
            <button
              onClick={handleSolflareConnect}
              className="flex items-center gap-4 px-6 py-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:bg-slate-800/80 transition-colors group"
            >
              <div className="flex-shrink-0">
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  color="#26A6A6"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                </svg>
              </div>
              <div className="text-left flex-1">
                <p className="text-white font-semibold text-sm">
                  Connect Solflare
                </p>
                <p className="text-slate-500 text-xs">
                  Multi-chain hardware support
                </p>
              </div>
              <svg
                className="w-5 h-5 text-slate-500 group-hover:text-slate-400 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {/* Security Info */}
          <div className="flex items-center justify-center gap-6 pt-8 border-t border-slate-700">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              <span className="text-slate-400 text-xs">Read-only by default</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              <span className="text-slate-400 text-xs">Limited session keys</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              <span className="text-slate-400 text-xs">You confirm every action</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
