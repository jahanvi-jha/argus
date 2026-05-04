"use client";

import { useCallback, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useKaminoPositions } from "@/hooks/useKaminoPositions";
import PositionCard from "@/components/PositionCard";
import dynamic from "next/dynamic";
const ArgusChatPanel = dynamic(() => import("@/components/ArgusChatPanel"), {
  ssr: false,
});

const navigationItems = [
  { label: "Landing", icon: "🏠", id: "landing", active: true },
  { label: "Dashboard", icon: "📊", id: "dashboard" },
  { label: "AI Chat", icon: "💬", id: "ai-chat" },
  { label: "Simulator", icon: "📈", id: "simulator" },
  { label: "Confirm Tx", icon: "✓", id: "confirm-tx" },
  { label: "Alert Settings", icon: "🔔", id: "alert-settings", badge: true },
  { label: "History", icon: "📋", id: "history" },
];

interface SidebarProps {
  activeNav: string;
  setActiveNav: (id: string) => void;
  onDisconnect: () => void;
  showDisconnect?: boolean;
}

const Sidebar = ({
  activeNav,
  setActiveNav,
  onDisconnect,
  showDisconnect = false,
}: SidebarProps) => (
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
      <p className="text-xs font-semibold text-slate-500 uppercase mb-4 px-2">
        Navigation
      </p>
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
  const { positions: kaminoPositions, loading: kaminoLoading } =
    useKaminoPositions();
  const [activeNav, setActiveNav] = useState<string>("landing");
  const [isChatClosed, setIsChatClosed] = useState<boolean>(false);

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
    const overallRiskStatus = kaminoPositions.every(
      (p) => p.riskStatus === "safe",
    )
      ? "safe"
      : kaminoPositions.some((p) => p.riskStatus === "danger")
        ? "danger"
        : "caution";

    const getRecommendation = () => {
      if (overallRiskStatus === "safe") {
        return {
          heading: "You're in good shape tonight.",
          body: "Both positions are safely above the danger zone. No action needed — Argus is watching and will alert you immediately if anything changes.",
          buttons: [
            { label: "Set up auto-protect", action: "protect" },
            { label: "Simulate a price drop", action: "simulate" },
          ],
        };
      } else if (overallRiskStatus === "caution") {
        return {
          heading: "Worth keeping an eye on.",
          body: "One of your positions is in the caution zone. No immediate danger, but a further price drop could change that. Consider repaying a small amount to rebuild your cushion.",
          buttons: [
            { label: "Protect this position", action: "protect" },
            { label: "Simulate a price drop", action: "simulate" },
          ],
        };
      } else {
        return {
          heading: "Act now.",
          body: "You're close to the liquidation threshold. Bots are watching. Argus recommends repaying now to bring your health factor back to safety.",
          buttons: [
            { label: "Repay now", action: "repay" },
            { label: "Simulate a price drop", action: "simulate" },
          ],
        };
      }
    };

    const recommendation = getRecommendation();

    return (
      <div className="min-h-screen flex bg-[#0A0A0F]">
        <Sidebar
          activeNav={activeNav}
          setActiveNav={setActiveNav}
          onDisconnect={handleDisconnect}
          showDisconnect={true}
        />

        <div className="flex-1 flex">
          {/* Left Panel - 55% or Full Width */}
          <div className={`${isChatClosed ? "w-full" : "w-[55%]"} overflow-auto border-r border-slate-800 transition-all duration-300`}>
            <div className="px-8 py-8">
              {/* Header with Wallet & Disconnect */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                  <p className="text-slate-400 text-sm">
                    {kaminoPositions.length} positions monitored across Kamino
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white font-mono text-sm font-semibold mb-2">
                    {truncatedAddress}
                  </p>
                  <button
                    onClick={handleDisconnect}
                    className="text-slate-400 hover:text-slate-200 text-sm px-3 py-1.5 rounded border border-slate-700 hover:border-slate-600 transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              </div>

              {/* Status Banner */}
              {kaminoPositions.length > 0 && (
                <div
                  className={`rounded-lg p-4 border mb-6 ${
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

              {/* Last Updated Line */}
              <p className="text-slate-500 text-xs mb-6">
                Last checked 14s ago · Updates every 30s
              </p>

              {isChatClosed && (
                <button
                  onClick={() => setIsChatClosed(false)}
                  className="w-full mb-6 px-4 py-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <span>💬</span> Open AI Chat
                </button>
              )}

              {/* WHAT ARGUS RECOMMENDS Card */}
              <div
                className={`rounded-xl p-6 mb-8 border backdrop-blur-md bg-linear-to-br ${
                  overallRiskStatus === "safe"
                    ? "from-blue-500/10 to-blue-600/10 border-blue-500/30"
                    : overallRiskStatus === "caution"
                      ? "from-amber-500/10 to-amber-600/10 border-amber-500/30"
                      : "from-red-500/10 to-red-600/10 border-red-500/30"
                }`}
              >
                <p
                  className={`text-xs font-semibold uppercase tracking-wide mb-2 ${
                    overallRiskStatus === "safe"
                      ? "text-blue-400"
                      : overallRiskStatus === "caution"
                        ? "text-amber-400"
                        : "text-red-400"
                  }`}
                >
                  What Argus Recommends
                </p>
                <h3 className="text-lg font-bold text-white mb-3">
                  {recommendation.heading}
                </h3>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                  {recommendation.body}
                </p>
                <div className="flex gap-3">
                  {recommendation.buttons.map((btn, idx) => (
                    <button
                      key={idx}
                      className={`text-sm px-4 py-2 rounded-lg font-medium transition-all ${
                        idx === 0
                          ? overallRiskStatus === "safe"
                            ? "bg-blue-600/30 text-blue-400 hover:bg-blue-600/50 border border-blue-500/30"
                            : overallRiskStatus === "caution"
                              ? "bg-amber-600/30 text-amber-400 hover:bg-amber-600/50 border border-amber-500/30"
                              : "bg-red-600/30 text-red-400 hover:bg-red-600/50 border border-red-500/30"
                          : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 border border-slate-700"
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* YOUR POSITIONS Section */}
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-4">
                Your Positions
              </p>

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
                <div className="space-y-4">
                  {kaminoPositions.map((position) => (
                    <PositionCard key={position.id} position={position} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-slate-900/50 border border-slate-800 rounded-lg">
                  <p className="text-slate-400">No positions found</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - 45% AI Chat */}
          <div className={`${isChatClosed ? "hidden" : "w-[45%]"} bg-linear-to-b from-slate-900/50 to-slate-950/50 border-l border-slate-800 flex flex-col sticky top-0 h-screen transition-all duration-300`}>
              {connected && activeNav === "dashboard" ? (
              <ArgusChatPanel isCollapsible={true} isCollapsed={false} onToggleCollapse={() => setIsChatClosed(true)} />
            ) : (
              <div className="flex-1 flex items-center justify-center px-6 py-8 overflow-auto">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl">🤖</span>
                  </div>
                  <p className="text-slate-400 text-sm mb-2">
                    AI Assistant Setup
                  </p>
                  <p className="text-slate-500 text-xs max-w-xs">
                    Your AI chat panel is being prepared. Ask Argus AI about
                    your positions, strategies, and risk analysis.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Full-screen AI Chat View
  if (connected && activeNav === "ai-chat") {
    return (
      <div className="min-h-screen flex bg-[#0A0A0F]">
        <Sidebar
          activeNav={activeNav}
          setActiveNav={setActiveNav}
          onDisconnect={handleDisconnect}
          showDisconnect={true}
        />

        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="border-b border-slate-800 bg-slate-950/50 px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Argus AI Chat</h1>
                <p className="text-slate-400 text-sm">Ask anything about your positions</p>
              </div>
              <div className="text-right">
                <p className="text-white font-mono text-sm font-semibold mb-2">
                  {truncatedAddress}
                </p>
                <button
                  onClick={handleDisconnect}
                  className="text-slate-400 hover:text-slate-200 text-sm px-3 py-1.5 rounded border border-slate-700 hover:border-slate-600 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </div>
          </div>

          {/* Full-screen Chat Panel */}
          <div className="flex-1 overflow-hidden">
            <ArgusChatPanel isCollapsible={false} isCollapsed={false} onToggleCollapse={() => {}} />
          </div>
        </div>
      </div>
    );
  }

  // Connected Welcome State
  if (connected && activeNav === "landing") {
    return (
      <div className="min-h-screen flex bg-[#0A0A0F]">
        <Sidebar
          activeNav={activeNav}
          setActiveNav={setActiveNav}
          onDisconnect={handleDisconnect}
          showDisconnect={true}
        />

        <div className="flex-1 flex items-center justify-center px-8 py-12">
          <div className="max-w-md w-full text-center">
            <div className="mb-8">
              <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m7.5-4.5A9 9 0 1 0 3 12a9 9 0 0 0 16.5-4.5z"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Connected!</h2>
              <p className="text-slate-400 text-sm mb-6">
                Your wallet is ready to go. Let's protect your positions.
              </p>

              <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 mb-6">
                <p className="text-xs text-slate-500 mb-2">Connected Wallet</p>
                <p className="text-white font-mono text-lg font-semibold">
                  {truncatedAddress}
                </p>
                <p className="text-slate-500 text-xs mt-3 break-all">
                  {publicKey?.toString()}
                </p>
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
      <Sidebar
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        onDisconnect={handleDisconnect}
      />

      <div className="flex-1 overflow-auto">
        <div className="min-h-screen flex items-center justify-center px-8 py-12">
          <div className="max-w-3xl w-full text-center space-y-10">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-3xl bg-linear-to-br from-blue-600/30 to-purple-600/30 border border-blue-500/30 flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-blue-400"
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
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7m0 0a9.958 9.958 0 01-9.542 7c-4.477 0-8.268-2.943-9.542-7m19.084 0A10.002 10.002 0 0112 22c-5.49 0-10.129-3.612-11.701-8.5"
                  />
                </svg>
              </div>
            </div>

            <div className="space-y-4">
              <div className="inline-block px-4 py-1.5 backdrop-blur-sm bg-white/3 border border-teal-500/40 rounded-full">
                <span className="text-teal-400 text-sm font-medium">
                  ● Watching Solana DeFi 24/7
                </span>
              </div>
              <h1 className="text-6xl font-black text-white leading-tight">
                Your Kamino positions,{" "}
                <span className="bg-linear-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                  protected while you sleep.
                </span>
              </h1>
            </div>

            <p className="text-slate-400 text-lg leading-relaxed max-w-xl mx-auto">
              Argus monitors your DeFi health factor in real time and acts the
              moment you're at risk — so you never wake up to a liquidated
              position.
            </p>

            <div className="flex flex-col gap-3 pt-6 max-w-md mx-auto w-full">
              <button
                onClick={handlePhantomConnect}
                className="flex items-center justify-between gap-4 px-6 py-4 backdrop-blur-md bg-white/4 border border-slate-700/50 rounded-xl hover:bg-white/6 hover:border-slate-600/50 transition-all transform hover:scale-105 group"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-purple-400"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-white font-semibold">Connect Phantom</p>
                    <p className="text-slate-500 text-xs">
                      Most popular Solana wallet
                    </p>
                  </div>
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

              <button
                onClick={handleSolflareConnect}
                className="flex items-center justify-between gap-4 px-6 py-4 backdrop-blur-md bg-white/4 border border-slate-700/50 rounded-xl hover:bg-white/6 hover:border-slate-600/50 transition-all transform hover:scale-105 group"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-cyan-400"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-white font-semibold">Connect Solflare</p>
                    <p className="text-slate-500 text-xs">
                      Multi-chain hardware support
                    </p>
                  </div>
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

            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-800">
              <div className="text-center backdrop-blur-sm bg-white/3 border border-slate-700/30 rounded-lg py-3">
                <p className="text-slate-400 text-xs mb-2">🔒</p>
                <p className="text-slate-400 text-xs">Read-only by default</p>
              </div>
              <div className="text-center backdrop-blur-sm bg-white/3 border border-slate-700/30 rounded-lg py-3">
                <p className="text-slate-400 text-xs mb-2">🔑</p>
                <p className="text-slate-400 text-xs">Limited session keys</p>
              </div>
              <div className="text-center backdrop-blur-sm bg-white/3 border border-slate-700/30 rounded-lg py-3">
                <p className="text-slate-400 text-xs mb-2">✓</p>
                <p className="text-slate-400 text-xs">
                  You confirm every action
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* HOW IT WORKS Section */}
        <div className="min-h-screen flex items-center justify-center px-8 py-20 border-t border-slate-800">
          <div className="max-w-4xl w-full">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-black text-white mb-4">
                How it works
              </h2>
              <p className="text-slate-400 text-lg">
                Argus protects your DeFi positions with real-time monitoring and
                automated actions
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="backdrop-blur-md bg-linear-to-br from-slate-900/40 to-slate-950/40 border border-blue-500/20 rounded-2xl p-8 hover:border-blue-500/40 transition-all">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center mb-6">
                  <span className="text-2xl">👁️</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Connect & Scan
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Link your wallet read-only. Argus indexes your Kamino vaults,
                  leverage positions, and collateral ratios instantly.
                </p>
              </div>

              {/* Step 2 */}
              <div className="backdrop-blur-md bg-linear-to-br from-slate-900/40 to-slate-950/40 border border-blue-500/20 rounded-2xl p-8 hover:border-blue-500/40 transition-all">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center mb-6">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Monitor 24/7
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Real-time health factor tracking across all your positions
                  with configurable alert thresholds.
                </p>
              </div>

              {/* Step 3 */}
              <div className="backdrop-blur-md bg-linear-to-br from-slate-900/40 to-slate-950/40 border border-blue-500/20 rounded-2xl p-8 hover:border-blue-500/40 transition-all">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center mb-6">
                  <span className="text-2xl">🛡️</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Auto-Protect
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  When risk spikes, Argus executes pre-approved deleverage or
                  top-up actions automatically.
                </p>
              </div>
            </div>

            <div className="mt-16 backdrop-blur-md bg-linear-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-8">
              <div className="flex items-start gap-4">
                <span className="text-2xl">🔐</span>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">
                    Your security, our priority
                  </h4>
                  <p className="text-slate-400 text-sm">
                    Argus never holds your funds. All actions require your
                    explicit approval. We use session keys with limited
                    permissions and time-based expiration.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="min-h-[40vh] flex items-center justify-center px-8 py-20 border-t border-slate-800">
          <div className="max-w-4xl w-full">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-4xl font-black text-transparent bg-linear-to-r from-blue-400 to-blue-600 bg-clip-text mb-2">
                  $48.2M
                </p>
                <p className="text-slate-500 text-xs uppercase tracking-wide">
                  Collateral Protected
                </p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-black text-transparent bg-linear-to-r from-teal-400 to-teal-600 bg-clip-text mb-2">
                  12,847
                </p>
                <p className="text-slate-500 text-xs uppercase tracking-wide">
                  Active Positions
                </p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-black text-transparent bg-linear-to-r from-cyan-400 to-cyan-600 bg-clip-text mb-2">
                  340ms
                </p>
                <p className="text-slate-500 text-xs uppercase tracking-wide">
                  Avg Response
                </p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-black text-transparent bg-linear-to-r from-blue-400 to-blue-600 bg-clip-text mb-2">
                  99.97%
                </p>
                <p className="text-slate-500 text-xs uppercase tracking-wide">
                  Uptime
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
