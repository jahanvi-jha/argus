"use client";

import { useCallback, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useKaminoPositions } from "@/hooks/useKaminoPositions";
import PositionCard from "@/components/PositionCard";

const navigationItems = [
  { label: "Landing", icon: "🏠", id: "landing", active: true },
  { label: "Dashboard", icon: "📊", id: "dashboard" },
  { label: "AI Chat", icon: "💬", id: "ai-chat" },
  { label: "Simulator", icon: "📈", id: "simulator" },
  { label: "Confirm Tx", icon: "✓", id: "confirm-tx" },
  { label: "Alert Settings", icon: "🔔", id: "alert-settings", badge: true },
  { label: "History", icon: "📋", id: "history" },
];

const Sidebar = ({ activeNav, setActiveNav, onDisconnect, showDisconnect = false }) => (
  <div className="w-48 border-r border-slate-800 bg-slate-950 flex flex-col sticky top-0 h-screen">
    <div className="p-5 border-b border-slate-800">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
          <span className="text-white font-bold text-sm">⚡</span>
        </div>
        <h1 className="text-lg font-bold text-white">Argus</h1>
      </div>
    </div>

    <nav className="flex-1 p-4 space-y-2">
      <p className="text-xs font-semibold text-slate-500 uppercase mb-4 px-2">Navigation</p>
      {navigationItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveNav(item.id)}
          className={`w-full text-left px-3 py-2.5 rounded text-sm transition-colors flex items-center justify-between ${
            activeNav === item.id
              ? "bg-blue-600/20 text-blue-400 border-l-2 border-blue-500"
              : "text-slate-400 hover:bg-slate-900/50"
          }`}
        >
          <span className="flex items-center gap-2">
            <span className="text-base">{item.icon}</span>
            {item.label}
          </span>
          {item.badge && (
            <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
              1
            </span>
          )}
        </button>
      ))}
    </nav>

    {showDisconnect && (
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={onDisconnect}
          className="w-full px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded text-sm transition-colors"
        >
          Disconnect
        </button>
      </div>
    )}
  </div>
);

export default function Home() {
  const { connected, disconnect, publicKey, select, wallets } = useWallet();
  const { positions: kaminoPositions, loading: kaminoLoading } = useKaminoPositions();
  const [activeNav, setActiveNav] = useState<string>("landing");

  const truncatedAddress = publicKey
    ? `${publicKey.toString().slice(0, 6)}...${publicKey.toString().slice(-4)}`
    : null;

  const handleDisconnect = useCallback(() => {
    disconnect();
    setActiveNav("landing");
  }, [disconnect]);

  const handlePhantomConnect = useCallback(() => {
    const phantomWallet = wallets.find((w) => w.adapter.name === "Phantom");
    if (phantomWallet) {
      select(phantomWallet.adapter.name);
    }
  }, [wallets, select]);

  const handleSolflareConnect = useCallback(() => {
    const solflareWallet = wallets.find((w) => w.adapter.name === "Solflare");
    if (solflareWallet) {
      select(solflareWallet.adapter.name);
    }
  }, [wallets, select]);

  // Dashboard - Connected + Dashboard View
  if (connected && activeNav === "dashboard") {
    const overallRiskStatus = kaminoPositions.every((p) => p.riskStatus === "safe")
      ? "safe"
      : kaminoPositions.some((p) => p.riskStatus === "danger")
        ? "danger"
        : "caution";

    return (
      <div className="min-h-screen flex bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
        <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} onDisconnect={handleDisconnect} showDisconnect={true} />

        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-8 py-8">
            <div className="mb-12">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="inline-block px-3 py-1 bg-blue-500/20 border border-blue-500/40 rounded-full mb-4">
                    <span className="text-blue-400 text-xs font-medium">● {kaminoPositions.length} positions monitored</span>
                  </div>
                  <h1 className="text-4xl font-bold text-white mb-2">Your Positions</h1>
                  <p className="text-slate-400">Monitor your DeFi lending positions across protocols</p>
                </div>
              </div>

              {kaminoPositions.length > 0 && (
                <div
                  className={`rounded-lg p-4 border ${
                    overallRiskStatus === "safe"
                      ? "bg-green-500/10 border-green-500/30"
                      : overallRiskStatus === "caution"
                        ? "bg-amber-500/10 border-amber-500/30"
                        : "bg-red-500/10 border-red-500/30"
                  }`}
                >
                  <p
                    className={`text-sm font-medium ${
                      overallRiskStatus === "safe"
                        ? "text-green-400"
                        : overallRiskStatus === "caution"
                          ? "text-amber-400"
                          : "text-red-400"
                    }`}
                  >
                    ●{" "}
                    {overallRiskStatus === "safe"
                      ? "All positions safe"
                      : overallRiskStatus === "caution"
                        ? "Some positions need attention"
                        : "Critical: Positions at risk"}
                  </p>
                </div>
              )}
            </div>

            {kaminoLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="inline-block mb-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-2 border-slate-600 border-t-blue-400"></div>
                  </div>
                  <p className="text-slate-400">Loading positions...</p>
                </div>
              </div>
            ) : kaminoPositions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {kaminoPositions.map((position) => (
                  <PositionCard key={position.id} position={position} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-slate-900/50 border border-slate-800 rounded-lg">
                <p className="text-slate-400">No positions found</p>
              </div>
            )}

            {kaminoPositions.length > 0 && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
                <p className="text-sm text-blue-300">
                  💡 <strong>Pro Tip:</strong> Argus continuously monitors all your positions and will alert you the moment any approach the danger zone. Stay protected while you sleep.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Connected Welcome State
  if (connected && activeNav === "landing") {
    return (
      <div className="min-h-screen flex bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
        <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} onDisconnect={handleDisconnect} showDisconnect={true} />

        <div className="flex-1 flex items-center justify-center px-8 py-12">
          <div className="max-w-md w-full text-center">
            <div className="mb-8">
              <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m7.5-4.5A9 9 0 1 0 3 12a9 9 0 0 0 16.5-4.5z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Connected!</h2>
              <p className="text-slate-400 text-sm mb-6">Your wallet is ready to go. Let's protect your positions.</p>

              <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 mb-6">
                <p className="text-xs text-slate-500 mb-2">Connected Wallet</p>
                <p className="text-white font-mono text-lg font-semibold">{truncatedAddress}</p>
                <p className="text-slate-500 text-xs mt-3 break-all">{publicKey?.toString()}</p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setActiveNav("dashboard")}
                className="w-full bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-105"
              >
                Go to Dashboard
              </button>
              <button
                onClick={handleDisconnect}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Disconnect
              </button>
            </div>

            <p className="text-slate-500 text-xs pt-6 border-t border-slate-800 mt-6">
              Argus is now monitoring your DeFi positions 24/7
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Landing Page - Disconnected State
  return (
    <div className="min-h-screen flex bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
      <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} onDisconnect={handleDisconnect} />

      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="max-w-3xl w-full text-center space-y-10">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-3xl bg-linear-to-br from-blue-600/30 to-purple-600/30 border border-blue-500/30 flex items-center justify-center">
              <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7m0 0a9.958 9.958 0 01-9.542 7c-4.477 0-8.268-2.943-9.542-7m19.084 0A10.002 10.002 0 0112 22c-5.49 0-10.129-3.612-11.701-8.5" />
              </svg>
            </div>
          </div>

          <div className="space-y-4">
            <div className="inline-block px-4 py-1.5 bg-teal-500/20 border border-teal-500/40 rounded-full">
              <span className="text-teal-400 text-sm font-medium">● Watching Solana DeFi 24/7</span>
            </div>
            <h1 className="text-6xl font-black text-white leading-tight">
              Your Kamino positions,{" "}
              <span className="bg-linear-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                protected while you sleep.
              </span>
            </h1>
          </div>

          <p className="text-slate-400 text-lg leading-relaxed max-w-xl mx-auto">
            Argus monitors your DeFi health factor in real time and acts the moment you're at risk — so you never wake up to a liquidated position.
          </p>

          <div className="flex flex-col gap-3 pt-6 max-w-md mx-auto w-full">
            <button
              onClick={handlePhantomConnect}
              className="flex items-center justify-between gap-4 px-6 py-4 bg-slate-900/80 border border-slate-700 rounded-xl hover:bg-slate-800/80 transition-all transform hover:scale-105 group"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-white font-semibold">Connect Phantom</p>
                  <p className="text-slate-500 text-xs">Most popular Solana wallet</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-slate-500 group-hover:text-slate-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <button
              onClick={handleSolflareConnect}
              className="flex items-center justify-between gap-4 px-6 py-4 bg-slate-900/80 border border-slate-700 rounded-xl hover:bg-slate-800/80 transition-all transform hover:scale-105 group"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-cyan-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-white font-semibold">Connect Solflare</p>
                  <p className="text-slate-500 text-xs">Multi-chain hardware support</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-slate-500 group-hover:text-slate-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-800">
            <div className="text-center">
              <p className="text-slate-500 text-xs mb-2">🔒</p>
              <p className="text-slate-400 text-xs">Read-only by default</p>
            </div>
            <div className="text-center">
              <p className="text-slate-500 text-xs mb-2">🔑</p>
              <p className="text-slate-400 text-xs">Limited session keys</p>
            </div>
            <div className="text-center">
              <p className="text-slate-500 text-xs mb-2">✓</p>
              <p className="text-slate-400 text-xs">You confirm every action</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
