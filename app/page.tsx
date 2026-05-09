"use client";

import { useCallback, useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useKaminoPositions } from "@/hooks/useKaminoPositions";
import { useDemo } from "@/contexts/DemoContext";
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
  <div className="fixed top-0 left-0 h-screen w-44 overflow-hidden z-10 border-r border-slate-800 bg-slate-950 flex flex-col">
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
  const { isDemoMode, enableDemoMode, disableDemoMode, demoPublicKey } =
    useDemo();
  const { positions: kaminoPositions, loading: kaminoLoading } =
    useKaminoPositions();
  const [activeNav, setActiveNav] = useState<string>("landing");
  const [isChatClosed, setIsChatClosed] = useState<boolean>(false);
  const [simulatedDrop, setSimulatedDrop] = useState<number>(20);
  const [confirmSubmitted, setConfirmSubmitted] = useState<boolean>(false);
  const [isAddCollateral, setIsAddCollateral] = useState<boolean>(false);
  const [alertThreshold, setAlertThreshold] = useState<number>(1.6);
  const [emailAlerts, setEmailAlerts] = useState<boolean>(true);
  const [browserAlerts, setBrowserAlerts] = useState<boolean>(true);
  const [telegramConnected, setTelegramConnected] = useState<boolean>(false);
  const [showTelegramModal, setShowTelegramModal] = useState<boolean>(false);
  const [telegramModalState, setTelegramModalState] = useState<"default" | "failed" | "connected">("default");
  const [telegramToast, setTelegramToast] = useState<boolean>(false);
  const [autoProtectEnabled, setAutoProtectEnabled] = useState<boolean>(false);
  const [autoProtectTriggered, setAutoProtectTriggered] =
    useState<boolean>(true);
  const [autoProtectThreshold, setAutoProtectThreshold] =
    useState<string>("1.20");
  const [autoProtectMaxRepay, setAutoProtectMaxRepay] =
    useState<string>("$2,000 USDC");
  const [autoProtectTargetHF, setAutoProtectTargetHF] =
    useState<string>("1.60");
  const [settingsSaved, setSettingsSaved] = useState<boolean>(false);
  const [savedSettings, setSavedSettings] = useState({
    alertThreshold: 1.6,
    emailAlerts: true,
    browserAlerts: true,
    telegramConnected: false,
    autoProtectEnabled: false,
    autoProtectThreshold: "1.20",
    autoProtectMaxRepay: "$2,000 USDC",
    autoProtectTargetHF: "1.60",
  });
  const [historyFilter, setHistoryFilter] = useState<"all" | "auto" | "manual">(
    "all",
  );

  const historyData = [
    {
      date: "Apr 14",
      time: "03:14 AM",
      type: "Auto Repay",
      amount: "$2,000 USDC",
      beforeHF: "1.15",
      afterHF: "1.52",
      fee: "$5.00",
      txText: "View on Solscan",
      txUrl: "https://solscan.io",
      category: "auto",
    },
    {
      date: "Apr 12",
      time: "11:42 AM",
      type: "Manual Repay",
      amount: "$1,200 USDC",
      beforeHF: "1.28",
      afterHF: "1.61",
      fee: "$3.00",
      txText: "View on Solscan",
      txUrl: "https://solscan.io",
      category: "manual",
    },
    {
      date: "Apr 9",
      time: "06:28 PM",
      type: "Auto Repay",
      amount: "$3,500 USDC",
      beforeHF: "1.11",
      afterHF: "1.68",
      fee: "$8.75",
      txText: "View on Solscan",
      txUrl: "https://solscan.io",
      category: "auto",
    },
  ];

  const filteredHistory = historyData.filter((item) =>
    historyFilter === "all" ? true : item.category === historyFilter,
  );

  const handleSaveSettings = useCallback(() => {
    setSavedSettings({
      alertThreshold,
      emailAlerts,
      browserAlerts,
      telegramConnected,
      autoProtectEnabled,
      autoProtectThreshold,
      autoProtectMaxRepay,
      autoProtectTargetHF,
    });
    setSettingsSaved(true);
    window.setTimeout(() => setSettingsSaved(false), 2000);
  }, [
    alertThreshold,
    emailAlerts,
    browserAlerts,
    telegramConnected,
    autoProtectEnabled,
    autoProtectThreshold,
    autoProtectMaxRepay,
    autoProtectTargetHF,
  ]);

  const handleHistoryFilter = useCallback(
    (filter: "all" | "auto" | "manual") => setHistoryFilter(filter),
    [],
  );

  // Treat demo mode as connected
  const isActive = connected || isDemoMode;

  const thresholdZone =
    alertThreshold <= 1.5
      ? "risk"
      : alertThreshold <= 2.0
        ? "warning"
        : "early";
  const thresholdZoneColor =
    thresholdZone === "risk"
      ? "#E8A020"
      : thresholdZone === "warning"
        ? "#E8A020"
        : "#22C55E";
  const thresholdZoneLabel =
    thresholdZone === "risk"
      ? "Risky threshold — act quickly."
      : thresholdZone === "warning"
        ? "Early warning — you'll get more frequent alerts, but you'll always have time to act."
        : "Early warning — you have more cushion before risk.";

  useEffect(() => {
    if (activeNav !== "confirm-tx") {
      setConfirmSubmitted(false);
      setIsAddCollateral(false);
    }
  }, [activeNav]);

  const simulatedPosition = kaminoPositions.find((pos) =>
    pos.pair.toLowerCase().includes("msol"),
  );
  const baseSimulatedPrice = 183.0;
  const displayLiqPrice = 148.0;
  const dropFraction = simulatedDrop / 100;
  const simulatedPrice = parseFloat(
    (baseSimulatedPrice * (1 - dropFraction)).toFixed(2),
  );
  const simulatedHealthFactor = parseFloat(
    ((simulatedPosition?.healthFactor ?? 1) * (1 - dropFraction)).toFixed(2),
  );
  const simulatedLiqDistance = simulatedPosition
    ? parseFloat(
        (
          simulatedPosition.liquidationDistance *
          (simulatedHealthFactor / simulatedPosition.healthFactor)
        ).toFixed(1),
      )
    : 0;
  const simulatedStatus =
    simulatedHealthFactor > 1.5
      ? "safe"
      : simulatedHealthFactor >= 1.2
        ? "caution"
        : "danger";
  const isLiquidated = simulatedHealthFactor <= 1.0;
  const simulatedCollateralValue = simulatedPosition
    ? parseFloat(
        (
          simulatedPosition.collateralValue *
          (simulatedPrice / baseSimulatedPrice)
        ).toFixed(2),
      )
    : 0;
  const simulatedLTV = simulatedPosition
    ? parseFloat(
        (
          (simulatedPosition.borrowValue / simulatedCollateralValue) *
          100
        ).toFixed(1),
      )
    : 0;
  const penaltyFee = simulatedPosition
    ? Math.round(simulatedPosition.borrowValue * 0.12)
    : 0;
  const totalLoss = simulatedPosition
    ? Math.round(simulatedPosition.collateralValue)
    : 0;

  const truncatedAddress = publicKey
    ? `${publicKey.toString().slice(0, 6)}...${publicKey.toString().slice(-4)}`
    : isDemoMode
      ? `${demoPublicKey.slice(0, 6)}...${demoPublicKey.slice(-4)}`
      : null;

  // Confirm TX calculations
  const repayAmount = 1500;
  const currentPrice = baseSimulatedPrice;
  const beforeDebt = simulatedPosition?.borrowValue || 5259;
  const beforeCollateral = simulatedPosition?.collateralValue || 8280;
  const beforeHF = simulatedPosition?.healthFactor || 1.31;
  const beforeLiqPrice = parseFloat(
    ((beforeDebt / beforeCollateral) * currentPrice).toFixed(2),
  );
  const afterDebt = beforeDebt - repayAmount;
  const afterHF = parseFloat((beforeCollateral / afterDebt).toFixed(2));
  const afterLiqPrice = parseFloat(
    ((afterDebt / beforeCollateral) * currentPrice).toFixed(2),
  );
  const totalDebtBefore = 6259; // hardcoded to match
  const totalDebtAfter = 4759;

  const handleDashboardAction = (action: string) => {
    // #region agent log
    
    if (action === "history") {
      setActiveNav("history");
      return;
    }
    if (action === "simulate") {
      setActiveNav("simulator");
      return;
    }
    if (action === "protect" || action === "repay") {
      setConfirmSubmitted(false);
      setActiveNav("confirm-tx");
      return;
    }
    if (action === "collateral") {
      // #region agent log
      
      setConfirmSubmitted(false);
      setActiveNav("confirm-tx");
      setIsAddCollateral(true);
      return;
    }
  };

  const handleDisconnect = useCallback(() => {
    disconnect();
    disableDemoMode();
    setActiveNav("landing");
  }, [disconnect, disableDemoMode]);

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

  const handleDemoMode = useCallback(() => {
    enableDemoMode();
    setActiveNav("dashboard");
  }, [enableDemoMode]);

  // Dashboard - Connected + Dashboard View
  if (isActive && activeNav === "dashboard") {
    const overallRiskStatus = kaminoPositions.every(
      (p) => p.riskStatus === "safe",
    )
      ? "safe"
      : kaminoPositions.some((p) => p.riskStatus === "danger")
        ? "danger"
        : "caution";

    const getRecommendation = () => {
      if (autoProtectTriggered) {
        return {
          heading: "Argus protected you while you slept.",
          body: "Your mSOL position dropped to 1.18 — inside the danger zone. Argus automatically repaid $1,200 USDC at 03:14 AM. Your health factor is now 1.52. No action needed.",
          buttons: [
            { label: "View transaction history", action: "history" },
            { label: "Add Collateral →", action: "collateral" },
          ],
        };
      }
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
            { label: "Add Collateral →", action: "collateral" },
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

        <div className="flex-1 ml-44 flex">
          {/* Left Panel - 55% or Full Width */}
          <div
            className={`${isChatClosed ? "w-full" : "w-[55%]"} overflow-auto border-r border-slate-800 transition-all duration-300`}
          >
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

              {autoProtectTriggered && (
                <div className="rounded-lg p-4 border border-amber-500/30 bg-amber-500/10 mb-6 flex items-center justify-between">
                  <p className="text-amber-400 text-sm font-medium">
                    ⚡ Argus acted at 03:14 AM — Repaid $1,200 USDC. Health
                    factor now 1.52.
                  </p>
                  <button
                    onClick={() => setActiveNav("history")}
                    className="text-amber-400 text-sm font-medium whitespace-nowrap ml-4 hover:text-amber-300 transition-colors"
                  >
                    View details →
                  </button>
                </div>
              )}

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
                      onClick={() => handleDashboardAction(btn.action)}
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
          <div
            className={`${isChatClosed ? "hidden" : "w-[45%]"} bg-linear-to-b from-slate-900/50 to-slate-950/50 border-l border-slate-800 flex flex-col sticky top-0 h-screen transition-all duration-300`}
          >
            {isActive && activeNav === "dashboard" ? (
              <ArgusChatPanel
                isCollapsible={true}
                isCollapsed={false}
                onToggleCollapse={() => setIsChatClosed(true)}
              />
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
  if (isActive && activeNav === "ai-chat") {
    return (
      <div className="min-h-screen flex bg-[#0A0A0F]">
        <Sidebar
          activeNav={activeNav}
          setActiveNav={setActiveNav}
          onDisconnect={handleDisconnect}
          showDisconnect={true}
        />

        <div className="flex-1 ml-44 flex flex-col">
          {/* Header */}
          <div className="border-b border-slate-800 bg-slate-950/50 px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Argus AI Chat</h1>
                <p className="text-slate-400 text-sm">
                  Ask anything about your positions
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
          </div>

          {/* Full-screen Chat Panel */}
          <div className="flex-1 overflow-hidden">
            <ArgusChatPanel
              isCollapsible={false}
              isCollapsed={false}
              onToggleCollapse={() => {}}
            />
          </div>
        </div>
      </div>
    );
  }

  // Simulator Screen
  if (isActive && activeNav === "simulator") {
    return (
      <div className="min-h-screen flex bg-[#0A0A0F]">
        <Sidebar
          activeNav={activeNav}
          setActiveNav={setActiveNav}
          onDisconnect={handleDisconnect}
          showDisconnect={true}
        />

        <div className="flex-1 ml-44 overflow-auto px-8 py-8">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-2">
                  Price Scenario Simulator
                </p>
                <h1 className="text-3xl font-bold text-white">
                  Simulate Price Risk
                </h1>
                <p className="text-slate-400 mt-2 max-w-2xl text-sm">
                  Test a price drop for your mSOL / USDC position and see the
                  simulated health factor, liquidation distance, and protection
                  recommendation.
                </p>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <button
                  onClick={() => setActiveNav("ai-chat")}
                  className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 transition"
                >
                  Chat
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                  onClick={() => setActiveNav("simulator")}
                >
                  Simulate
                </button>
              </div>
            </div>

            {/* Price Scenario Simulator Card */}
            <div className="rounded-3xl border border-[#17202A] bg-[#111118] p-6 shadow-[0_0_80px_rgba(0,229,255,0.08)]">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-[0.35em] text-cyan-300 mb-2">
                      Price Scenario Simulator
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#0F131A] px-3 py-2 text-sm text-slate-300 border border-slate-800">
                      <span>Simulating:</span>
                      <strong className="text-white">
                        mSOL / USDC — Kamino
                      </strong>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 text-xs">
                      Current price: ${baseSimulatedPrice.toFixed(2)} ·
                      Liquidation at: ${displayLiqPrice.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Price Drop Slider */}
                <div className="rounded-3xl border border-slate-800 bg-[#0F131A] p-6">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.18em] text-slate-500">
                        Price drop scenario
                      </p>
                      <p className="text-sm text-slate-200 mt-1">
                        mSOL at ${simulatedPrice.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-4xl font-semibold text-white tracking-tight">
                      -{simulatedDrop}%
                    </div>
                  </div>

                  <div className="space-y-4">
                    <input
                      type="range"
                      min={0}
                      max={80}
                      value={simulatedDrop}
                      onChange={(e) => setSimulatedDrop(Number(e.target.value))}
                      className="w-full h-3 rounded-full accent-cyan-400 overflow-hidden"
                      style={{
                        background: `linear-gradient(90deg, #10b981 0%, #f59e0b 45%, #ef4444 100%)`,
                        outline: "none",
                      }}
                    />
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.35em] text-slate-500">
                      <span>0% No change</span>
                      <span>-25% midpoint</span>
                      <span>-80% max drop</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Simulation Results Card */}
            <div className="rounded-3xl border border-slate-800 bg-[#111118] p-6 shadow-[0_0_80px_rgba(0,229,255,0.08)]">
              <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
                <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
                  <div className="flex items-center justify-between mb-4 gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
                        Simulation Results
                      </p>
                      <div className="mt-3 flex items-center gap-3">
                        <span
                          className={`text-4xl font-bold ${
                            simulatedStatus === "safe"
                              ? "text-white"
                              : simulatedStatus === "caution"
                                ? "text-amber-300"
                                : "text-red-400"
                          }`}
                        >
                          {simulatedHealthFactor.toFixed(2)}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            simulatedStatus === "safe"
                              ? "bg-emerald-500/15 text-emerald-300"
                              : simulatedStatus === "caution"
                                ? "bg-amber-500/15 text-amber-300"
                                : "bg-red-500/15 text-red-300"
                          }`}
                        >
                          {simulatedStatus.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-[0.35em] text-slate-500 mb-2">
                        New state
                      </p>
                      <div className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-200">
                        <div className="flex justify-between mb-2">
                          <span>New collateral value</span>
                          <strong>
                            ${simulatedCollateralValue.toFixed(2)}
                          </strong>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span>New LTV</span>
                          <strong
                            className={
                              simulatedLTV > 90
                                ? "text-red-400"
                                : simulatedStatus === "caution"
                                  ? "text-amber-300"
                                  : "text-slate-200"
                            }
                          >
                            {simulatedLTV.toFixed(1)}%
                          </strong>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span>Distance to liquidation</span>
                          <strong
                            className={
                              simulatedLiqDistance <= 0
                                ? "text-red-400"
                                : simulatedStatus === "caution"
                                  ? "text-amber-300"
                                  : "text-slate-200"
                            }
                          >
                            {simulatedLiqDistance <= 0
                              ? "Already past liquidation threshold"
                              : `${simulatedLiqDistance.toFixed(1)}%`}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  {(simulatedStatus === "danger" || isLiquidated) && (
                    <div className="rounded-3xl border border-amber-500/20 bg-amber-500/10 p-5">
                      <p className="text-sm font-semibold text-amber-300 mb-3">
                        Warning: Liquidation Risk
                      </p>
                      <p className="text-sm text-slate-200">
                        At this price, liquidation bots can take your mSOL. Act
                        before this happens.
                      </p>
                    </div>
                  )}
                </div>

                <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6">
                  <div className="text-xs uppercase tracking-[0.35em] text-slate-500 mb-4">
                    Position details
                  </div>
                  <div className="grid gap-4 text-sm text-slate-300">
                    <div className="flex justify-between">
                      <span>Pair</span>
                      <strong>
                        {simulatedPosition?.pair ?? "mSOL / USDC"}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Collateral value</span>
                      <strong>${simulatedCollateralValue.toFixed(2)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Borrow value</span>
                      <strong>
                        ${simulatedPosition?.borrowValue.toFixed(2) ?? "0.00"}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Current HF</span>
                      <strong>
                        {simulatedPosition?.healthFactor.toFixed(2) ?? "0.00"}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Liquidation price</span>
                      <strong>${displayLiqPrice.toFixed(2)}</strong>
                    </div>
                  </div>

                  {(simulatedStatus === "caution" ||
                    simulatedStatus === "danger") && (
                    <div className="mt-6">
                      <button
                        onClick={() => {
                          setConfirmSubmitted(false);
                          setActiveNav("confirm-tx");
                        }}
                        className="w-full rounded-2xl bg-[#00E5FF] px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-400 transition"
                      >
                        Protect My Position →
                      </button>
                      <p className="text-xs text-slate-500 mt-2 text-center">
                        Returns you to Confirm Tx to review Argus's
                        recommendation.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Confirm Transaction Screen
  if (isActive && activeNav === "confirm-tx") {
    // #region agent log
   
    return (
      <div className="min-h-screen flex bg-[#0A0A0F]">
        <Sidebar
          activeNav={activeNav}
          setActiveNav={setActiveNav}
          onDisconnect={handleDisconnect}
          showDisconnect={true}
        />

        <div className="flex-1 ml-44 overflow-auto px-8 py-8">
          <div className="mx-auto max-w-6xl space-y-8">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <button
                    onClick={() => {
                      setActiveNav("simulator");
                      setConfirmSubmitted(false);
                    }}
                    className="text-slate-400 hover:text-white transition"
                  >
                    ← Back
                  </button>
                  <span className="text-slate-500">|</span>
                  <span className="uppercase tracking-[0.3em] text-slate-500">
                    {isAddCollateral ? "Confirm Add Collateral" : "Confirm Transaction"}
                  </span>
                </div>
                <h1 className="mt-3 text-4xl font-bold text-white">
                  {isAddCollateral ? "Confirm Add Collateral" : "Confirm Transaction"}
                </h1>
                <p className="mt-3 max-w-2xl text-slate-400">
                  {isAddCollateral
                    ? "Review exactly what will happen before adding collateral."
                    : "Review exactly what will happen before confirming."}
                </p>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-3xl border border-slate-800 bg-[#111118] px-4 py-3 text-sm text-slate-300">
                <div className="rounded-full bg-[#0F131A] px-3 py-1 text-slate-300">
                  {truncatedAddress}
                </div>
                <div className="rounded-full bg-[#0F131A] px-3 py-1 text-slate-300">
                  Connected Wallet
                </div>
              </div>
            </div>

            {!confirmSubmitted ? (
              <>
                <div className="grid gap-6 xl:grid-cols-[1fr_0.86fr]">
                  <div className="space-y-6">
                    <div className="rounded-3xl border border-slate-800 bg-[#111118] p-6 shadow-[0_0_40px_rgba(0,229,255,0.08)]">
                      <div className="flex items-start gap-4">
                        <div className="mt-1 rounded-2xl bg-cyan-500/10 p-3 text-cyan-300">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="h-6 w-6"
                          >
                            <path d="M12 2L4 5v6c0 5.25 3.8 10.74 8 12 4.2-1.26 8-6.75 8-12V5l-8-3z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300 mb-2">
                            {isAddCollateral
                              ? "Add collateral to protect your position"
                              : "Repay to protect your position"}
                          </p>
                          <h2 className="text-xl font-semibold text-white">
                            mSOL / USDC · Kamino Finance
                          </h2>
                          <div className="mt-4 rounded-2xl bg-[#0F131A] border border-slate-800 p-4 text-sm text-slate-300">
                            {isAddCollateral
                              ? "You are adding 0.5 SOL to your Kamino mSOL/USDC position. This brings your health factor from the caution zone into the safe zone."
                              : "You are repaying $1,500 USDC from your wallet to your Kamino mSOL/USDC loan. This brings your health factor from the caution zone into the safe zone."}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-slate-800 bg-[#111118] p-6">
                      <div className="mb-4 text-xs uppercase tracking-[0.35em] text-slate-500">
                        Before & After
                      </div>
                      <div className="grid gap-4 text-sm text-slate-300">
                        <div className="grid grid-cols-[1fr_0.9fr_0.9fr] gap-4 border-b border-slate-800 pb-4">
                          <span className="text-slate-500">Health factor</span>
                          <span className="text-amber-300">1.31</span>
                          <span className="text-emerald-300 font-semibold">
                            {isAddCollateral ? "1.74 ✓" : `${afterHF.toFixed(2)} ✓`}
                          </span>
                        </div>
                        <div className="grid grid-cols-[1fr_0.9fr_0.9fr] gap-4 border-b border-slate-800 pb-4">
                          <span className="text-slate-500">
                            {isAddCollateral ? "Collateral" : "Total debt"}
                          </span>
                          <span>{isAddCollateral ? "$8,200" : `$${totalDebtBefore}`}</span>
                          <span>{isAddCollateral ? "$8,290" : `$${totalDebtAfter}`}</span>
                        </div>
                        <div className="grid grid-cols-[1fr_0.9fr_0.9fr] gap-4 border-b border-slate-800 pb-4">
                          <span className="text-slate-500">Risk status</span>
                          <span className="text-amber-300">Caution</span>
                          <span className="text-emerald-300">Safe</span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-slate-800 bg-[#111118] p-6">
                      <div className="mb-4 text-xs uppercase tracking-[0.35em] text-slate-500">
                        Transaction cost breakdown
                      </div>
                      <div className="grid gap-4 text-sm text-slate-300">
                        <div className="flex justify-between border-b border-slate-800 pb-3">
                          <span>{isAddCollateral ? "Collateral amount" : "Repay amount"}</span>
                          <span>{isAddCollateral ? "0.5 SOL (~$84)" : "$1,500.00 USDC"}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-800 pb-3">
                          <div>
                            <p>Argus fee</p>
                            <p className="text-xs text-slate-500">
                              0.25% of {isAddCollateral ? "SOL value" : "repay amount"}
                            </p>
                          </div>
                          <span>{isAddCollateral ? "$0.21 USDC" : "$3.75 USDC"}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-800 pb-3">
                          <div>
                            <p>Solana network fee</p>
                            <p className="text-xs text-slate-500">
                              ~0.000005 SOL / $0.001
                            </p>
                          </div>
                          <span>Estimated</span>
                        </div>
                        <div className="flex justify-between pt-3 text-white text-lg font-semibold">
                          <span>Total cost</span>
                          <span>$1,503.75 USDC</span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-slate-800 bg-[#111118] p-6 space-y-4">
                      <div className="rounded-2xl bg-[#0F131A] border border-slate-800 p-4 text-sm text-slate-300">
                        <p className="font-semibold text-white">
                          🔒 Argus uses a limited session key
                        </p>
                        <p className="mt-2 text-slate-400">
                          It can only repay loans on Kamino, never send funds to
                          external wallets. Your session cap is strictly
                          enforced.
                        </p>
                      </div>
                      <div className="rounded-2xl bg-[#0F131A] border border-amber-500/20 p-4 text-sm text-amber-300">
                        <p className="font-semibold">
                          ⚠️ This action cannot be undone once submitted to
                          Solana.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-800 bg-[#111118] p-6">
                    <div className="rounded-3xl border border-slate-800 bg-[#0F131A] p-5 text-slate-300">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
                            Active position
                          </p>
                          <p className="text-lg font-semibold text-white">
                            mSOL / USDC
                          </p>
                        </div>
                        <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-300">
                          Caution
                        </span>
                      </div>
                      <div className="space-y-3 text-sm text-slate-300">
                        <div className="flex justify-between">
                          <span>Collateral</span>
                          <strong>${beforeCollateral.toFixed(0)}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Borrow</span>
                          <strong>${beforeDebt.toFixed(0)}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Current HF</span>
                          <strong>{beforeHF.toFixed(2)}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Liq price</span>
                          <strong>${beforeLiqPrice.toFixed(2)}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="sticky top-8 rounded-3xl border border-slate-800 bg-[#111118] p-6 shadow-[0_0_40px_rgba(0,229,255,0.06)]">
                  <div className="mb-6 rounded-3xl border border-slate-800 bg-[#0F131A] p-5 text-sm text-slate-300">
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-500 mb-2">
                      Transaction summary
                    </p>
                    <p className="text-white">
                      {isAddCollateral
                        ? "Adding 0.5 SOL · Health factor 1.31 → 1.74"
                        : `Repaying $1,500 USDC · Health factor ${beforeHF.toFixed(2)} → ${afterHF.toFixed(2)}`}
                    </p>
                  </div>
                  <button
                    onClick={() => setConfirmSubmitted(true)}
                    className="mb-3 flex w-full items-center justify-center gap-2 rounded-3xl bg-[#00E5FF] px-4 py-4 text-sm font-semibold text-slate-950 hover:bg-cyan-300 transition"
                  >
                    {isAddCollateral ? "🔒 Confirm — Add 0.5 SOL" : "🔒 Confirm — Repay $1,500 USDC"}
                  </button>
                  <button
                    onClick={() => setActiveNav("simulator")}
                    className="w-full rounded-3xl border border-slate-800 bg-[#0F131A] px-4 py-4 text-sm text-slate-300 hover:bg-slate-900 transition"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <div className="grid gap-6 xl:grid-cols-[1fr_0.86fr]">
                <div className="space-y-6">
                  <div className="rounded-3xl border border-slate-800 bg-[#111118] p-10 text-center shadow-[0_0_40px_rgba(0,229,255,0.08)]">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-300">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-8 w-8"
                      >
                        <path d="M9 12.5l2 2 4-4" />
                      </svg>
                    </div>
                    <h2 className="text-3xl font-semibold text-white mb-2">
                      Position Protected
                    </h2>
                    <p className="mx-auto max-w-xl text-slate-400 mb-6">
                      Your health factor is now {afterHF.toFixed(2)}. Argus is
                      watching your position.
                    </p>
                    <p className="text-5xl font-bold text-emerald-300 mb-2">
                      {afterHF.toFixed(2)}
                    </p>
                    <span className="inline-flex rounded-full bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300">
                      Safe
                    </span>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-800 bg-[#111118] p-6">
                  <div className="mb-6 rounded-3xl border border-slate-800 bg-[#0F131A] p-5 text-sm text-slate-300">
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-500 mb-2">
                      Transaction summary
                    </p>
                    <p className="text-white">
                      Your repay completed. Health factor is now{" "}
                      {afterHF.toFixed(2)} and your position is protected.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveNav("dashboard")}
                    className="mb-3 w-full rounded-3xl bg-[#00E5FF] px-4 py-4 text-sm font-semibold text-slate-950 hover:bg-cyan-300 transition"
                  >
                    Back to Dashboard
                  </button>
                  <button
                    onClick={() => setActiveNav("simulator")}
                    className="w-full rounded-3xl border border-slate-800 bg-[#0F131A] px-4 py-4 text-sm text-slate-300 hover:bg-slate-900 transition"
                  >
                    View Simulation
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Alert Settings Screen
  if (isActive && activeNav === "alert-settings") {
    return (
      <div className="min-h-screen flex bg-[#0A0A0F]">
        <Sidebar
          activeNav={activeNav}
          setActiveNav={setActiveNav}
          onDisconnect={handleDisconnect}
          showDisconnect={true}
        />

        <div className="flex-1 ml-44 overflow-auto px-8 py-8">
          <div className="mx-auto max-w-6xl space-y-8">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-500 mb-2">
                    Alert Settings
                  </p>
                  <h1 className="text-4xl font-bold text-white">
                    Configure how Argus protects and notifies you
                  </h1>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-slate-900 px-4 py-2 text-sm text-slate-300">
                    {truncatedAddress}
                  </div>
                  <button
                    onClick={handleDisconnect}
                    className="rounded-full border border-slate-700 bg-[#111118] px-4 py-2 text-sm text-slate-300 hover:border-slate-600 hover:text-white transition"
                  >
                    Disconnect
                  </button>
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
                <div className="space-y-6">
                  <section className="rounded-3xl border border-slate-800 bg-[#111118] p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h2 className="text-2xl font-semibold text-white">
                          Alert threshold
                        </h2>
                        <p className="text-slate-400 text-sm max-w-2xl">
                          Argus will notify you if your overall health factor
                          drops below this value.
                        </p>
                      </div>
                      <div className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
                        {alertThreshold.toFixed(2)} HF
                      </div>
                    </div>

                    <div className="mt-6 space-y-4">
                      <input
                        type="range"
                        min="1.1"
                        max="2.5"
                        step="0.05"
                        value={alertThreshold}
                        onChange={(e) =>
                          setAlertThreshold(parseFloat(e.target.value))
                        }
                        className="w-full h-2 rounded-full accent-[#1E88E5]"
                        style={{
                          background: `linear-gradient(90deg, #1E88E5 ${((alertThreshold - 1.1) / 1.4) * 100}%, #334155 ${((alertThreshold - 1.1) / 1.4) * 100}%)`,
                        }}
                      />
                      <div className="rounded-3xl border border-slate-800 bg-[#0F131A] p-4">
                        <p
                          className="text-sm font-medium"
                          style={{ color: thresholdZoneColor }}
                        >
                          {thresholdZoneLabel}
                        </p>
                        <p className="text-xs text-slate-500 mt-2">
                          Set this threshold to receive alerts before your
                          position becomes unsafe.
                        </p>
                      </div>
                    </div>
                  </section>

                  <section className="rounded-3xl border border-slate-800 bg-[#111118] p-6">
                    <div className="flex items-center justify-between gap-4 mb-6">
                      <div>
                        <h2 className="text-2xl font-semibold text-white">
                          Notification channels
                        </h2>
                        <p className="text-slate-400 text-sm">
                          Choose how Argus alerts you when your health factor is
                          at risk.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between rounded-3xl border border-slate-800 bg-[#0F131A] px-4 py-4">
                        <div>
                          <p className="text-sm font-semibold text-white">
                            Email alerts
                          </p>
                          <p className="text-slate-500 text-xs">
                            Get notified at user@example.com when the threshold
                            is crossed
                          </p>
                        </div>
                        <button
                          onClick={() => setEmailAlerts(!emailAlerts)}
                          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${emailAlerts ? "bg-emerald-400 text-slate-950" : "bg-slate-800 text-slate-300"}`}
                        >
                          {emailAlerts ? "On" : "Off"}
                        </button>
                      </div>

                      <div className="flex items-center justify-between rounded-3xl border border-slate-800 bg-[#0F131A] px-4 py-4">
                        <div>
                          <p className="text-sm font-semibold text-white">
                            Browser notifications
                          </p>
                          <p className="text-slate-500 text-xs">
                            Push alerts when the tab is open
                          </p>
                        </div>
                        <button
                          onClick={() => setBrowserAlerts(!browserAlerts)}
                          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${browserAlerts ? "bg-emerald-400 text-slate-950" : "bg-slate-800 text-slate-300"}`}
                        >
                          {browserAlerts ? "On" : "Off"}
                        </button>
                      </div>

                      <div className="flex items-center justify-between rounded-3xl border border-slate-800 bg-[#0F131A] px-4 py-4">
                        <div>
                          <p className="text-sm font-semibold text-white">
                            Telegram bot
                          </p>
                          {telegramConnected ? (
                            <p className="text-xs flex items-center gap-1 mt-0.5">
                              <span style={{ color: "#48c78e" }}>●</span>
                              <span style={{ color: "#48c78e" }}>
                                @ArgusProtectBot · Connected
                              </span>
                            </p>
                          ) : (
                            <p className="text-slate-500 text-xs">
                              Not connected — tap to set up
                            </p>
                          )}
                        </div>
                        {telegramConnected ? (
                          <span className="rounded-full px-4 py-2 text-sm font-semibold bg-emerald-400 text-slate-950">
                            Connected ✓
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              setShowTelegramModal(true);
                              setTelegramModalState("default");
                            }}
                            className="rounded-full px-4 py-2 text-sm font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                          >
                            Connect
                          </button>
                        )}
                      </div>
                    </div>
                  </section>

                  <section className="rounded-3xl border border-slate-800 bg-[#111118] p-6">
                    <div className="flex items-center justify-between gap-4 mb-6">
                      <div>
                        <h2 className="text-2xl font-semibold text-white">
                          Auto-Protect
                        </h2>
                        <p className="text-slate-400 text-sm">
                          Automatically repay a portion of your debt when your
                          health factor drops.
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          setAutoProtectEnabled(!autoProtectEnabled)
                        }
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${autoProtectEnabled ? "bg-emerald-400 text-slate-950" : "bg-slate-800 text-slate-300"}`}
                      >
                        {autoProtectEnabled ? "On" : "Off"}
                      </button>
                    </div>

                    {autoProtectEnabled ? (
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-semibold text-slate-200 mb-2 block">
                            Trigger when health factor drops below
                          </label>
                          <input
                            value={autoProtectThreshold}
                            onChange={(e) =>
                              setAutoProtectThreshold(e.target.value)
                            }
                            className="w-full rounded-3xl border border-slate-800 bg-[#0F131A] px-4 py-3 text-white text-sm outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-slate-200 mb-2 block">
                            Maximum repay amount per action
                          </label>
                          <input
                            value={autoProtectMaxRepay}
                            onChange={(e) =>
                              setAutoProtectMaxRepay(e.target.value)
                            }
                            className="w-full rounded-3xl border border-slate-800 bg-[#0F131A] px-4 py-3 text-white text-sm outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-slate-200 mb-2 block">
                            Target health factor after repay
                          </label>
                          <input
                            value={autoProtectTargetHF}
                            onChange={(e) =>
                              setAutoProtectTargetHF(e.target.value)
                            }
                            className="w-full rounded-3xl border border-slate-800 bg-[#0F131A] px-4 py-3 text-white text-sm outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-3xl border border-slate-800 bg-[#0F131A] p-4 text-sm text-slate-400">
                        Auto-Protect is currently turned off.
                      </div>
                    )}
                    {autoProtectTriggered && (
                      <p
                        style={{ color: "#5A5E72", fontSize: "12px" }}
                        className="mt-3"
                      >
                        Last triggered: May 3 at 03:14 AM — repaid $1,200 USDC
                      </p>
                    )}

                    <div className="mt-6 flex flex-col gap-3">
                      {settingsSaved && (
                        <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                          Settings saved.
                        </div>
                      )}
                      <button
                        onClick={handleSaveSettings}
                        className="w-full rounded-3xl bg-[#1E88E5] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1669c1] transition"
                      >
                        Save settings
                      </button>
                    </div>
                  </section>
                </div>

                <div className="space-y-6">
                  <div className="rounded-3xl border border-slate-800 bg-[#0F131A] p-6 text-slate-300">
                    <p className="text-sm font-semibold text-white mb-3">
                      Security note
                    </p>
                    <p className="text-sm leading-7 text-slate-400">
                      Argus uses a limited session key — it can only repay
                      loans, never send funds to external wallets, and your cap
                      is strictly enforced.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Telegram Toast */}
            {telegramToast && (
              <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-800 border border-emerald-500/30 text-emerald-300 text-sm px-5 py-3 rounded-full shadow-lg">
                Telegram connected — you'll now receive alerts via
                @ArgusProtectBot
              </div>
            )}

            {/* Telegram Modal */}
            {showTelegramModal && (
              <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <div className="bg-[#111118] border border-slate-800 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">
                      Connect Telegram
                    </h2>
                    <button
                      onClick={() => setShowTelegramModal(false)}
                      className="text-slate-400 hover:text-white transition"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-3 mb-6">
                    {[
                      "Open Telegram — search @ArgusProtectBot",
                      "Tap Start",
                      "Confirm wallet 8xKf...3mPq",
                      "Return and tap the button below",
                    ].map((step, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <p className="text-slate-300 text-sm">{step}</p>
                      </div>
                    ))}
                  </div>

                  <a
                    href="https://t.me/ArgusProtectBot?start=8xKf3mPq"
                    target="_blank"
                    rel="noreferrer"
                    className="block text-center w-full mb-4 px-4 py-3 rounded-2xl bg-slate-800 text-slate-300 text-sm font-semibold hover:bg-slate-700 transition"
                  >
                    Open @ArgusProtectBot in Telegram ↗
                  </a>

                  {telegramModalState === "failed" && (
                    <div className="mb-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
                      ⚠ We couldn't detect a connection yet. Make sure you
                      tapped Start in the bot and try again.
                    </div>
                  )}

                  {telegramModalState === "connected" ? (
                    <div className="text-center text-emerald-300 text-sm font-semibold py-2">
                      ✓ Connected successfully
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        if (telegramModalState === "default") {
                          setTelegramModalState("failed");
                        } else if (telegramModalState === "failed") {
                          setTelegramConnected(true);
                          setTelegramModalState("connected");
                          setShowTelegramModal(false);
                          setTelegramToast(true);
                          window.setTimeout(() => setTelegramToast(false), 2500);
                        }
                      }}
                      className="w-full px-4 py-3 rounded-2xl text-sm font-semibold transition"
                      style={{ background: "#26A6A6", color: "#fff" }}
                    >
                      {telegramModalState === "failed"
                        ? "Try again"
                        : "I've connected — verify now"}
                    </button>
                  )}

                  <p className="text-slate-500 text-xs text-center mt-4">
                    Argus only sends read-only alerts via Telegram. The bot
                    cannot access your funds or execute transactions.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // History Screen
  if (isActive && activeNav === "history") {
    return (
      <div className="min-h-screen flex bg-[#0A0A0F]">
        <Sidebar
          activeNav={activeNav}
          setActiveNav={setActiveNav}
          onDisconnect={handleDisconnect}
          showDisconnect={true}
        />

        <div className="flex-1 ml-44 overflow-auto px-8 py-8">
          <div className="mx-auto max-w-6xl space-y-8">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500 mb-2">
                  Transaction History
                </p>
                <h1 className="text-4xl font-bold text-white">
                  Everything Argus has done to protect your positions
                </h1>
              </div>
              <div className="text-sm text-slate-500">Last 30 days</div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-slate-800 bg-[#111118] p-6">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500 mb-4">
                  Total protected
                </p>
                <p className="text-4xl font-black text-white mb-2">$6,700</p>
                <p className="text-slate-400 text-sm">3 actions taken</p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-[#0B1F24] p-6 shadow-[0_0_40px_rgba(20,180,180,0.12)]">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500 mb-4">
                  Liquidations avoided
                </p>
                <p className="text-4xl font-black text-teal-300 mb-2">2</p>
                <p className="text-slate-400 text-sm">
                  ~$1,640 in penalties saved
                </p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-[#111118] p-6">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500 mb-4">
                  Total fees paid
                </p>
                <p className="text-4xl font-black text-white mb-2">$16.75</p>
                <p className="text-slate-400 text-sm">0.25% per action</p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-[#111118] p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleHistoryFilter("all")}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${historyFilter === "all" ? "bg-[#1E88E5] text-white" : "bg-slate-900 text-slate-400 hover:bg-slate-800"}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => handleHistoryFilter("auto")}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${historyFilter === "auto" ? "bg-[#1E88E5] text-white" : "bg-slate-900 text-slate-400 hover:bg-slate-800"}`}
                  >
                    Auto
                  </button>
                  <button
                    onClick={() => handleHistoryFilter("manual")}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${historyFilter === "manual" ? "bg-[#1E88E5] text-white" : "bg-slate-900 text-slate-400 hover:bg-slate-800"}`}
                  >
                    Manual
                  </button>
                </div>
                <div className="text-sm text-slate-500">
                  {historyFilter === "all"
                    ? "Showing all transactions"
                    : `Showing ${historyFilter} transactions`}
                </div>
              </div>

              <div className="mt-6 overflow-x-auto">
                <div style={{ minWidth: 920 }}>
                  <div className="grid grid-cols-[1.4fr_0.9fr_0.95fr_1fr_0.75fr_1fr] gap-4 rounded-t-3xl border-b border-slate-800 bg-[#0B131A] px-6 py-4 text-left text-xs uppercase tracking-[0.35em] text-slate-500">
                    <span>Date & Time</span>
                    <span>Action</span>
                    <span>Amount</span>
                    <span>Health Factor</span>
                    <span>Fee</span>
                    <span>TX</span>
                  </div>

                  {filteredHistory.length > 0 ? (
                    filteredHistory.map((item, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-[1.4fr_0.9fr_0.95fr_1fr_0.75fr_1fr] gap-4 border-b border-slate-800 px-6 py-4 text-sm text-slate-300"
                      >
                        <div>
                          <p className="font-semibold text-white">
                            {item.date}
                          </p>
                          <p className="text-slate-500 text-xs mt-1">
                            {item.time}
                          </p>
                        </div>
                        <div>
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${item.category === "auto" ? "bg-teal-500/10 text-teal-300 border border-teal-500/15" : "bg-slate-900 text-slate-300 border border-slate-700"}`}
                          >
                            {item.type}
                          </span>
                        </div>
                        <div className="font-semibold text-white">
                          {item.amount}
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            style={{
                              color:
                                parseFloat(item.beforeHF) < 1.2
                                  ? "#e04060"
                                  : "#e8a020",
                            }}
                          >
                            {item.beforeHF}
                          </span>
                          <span className="text-slate-500">→</span>
                          <span style={{ color: "#48c78e" }}>
                            {item.afterHF}
                          </span>
                        </div>
                        <div>{item.fee}</div>
                        <div>
                          <a
                            href={item.txUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#1E88E5] hover:text-[#1669c1]"
                          >
                            {item.txText} ↗
                          </a>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-b-3xl border border-slate-800 border-t-0 bg-[#0F131A] px-6 py-20 text-center text-slate-400">
                      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-slate-400">
                        <span className="text-2xl">👁️</span>
                      </div>
                      <p className="text-lg font-semibold text-white mb-2">
                        Nothing here yet
                      </p>
                      <p className="text-slate-500 mb-5">
                        Your transaction activity will appear here once Argus
                        takes action.
                      </p>
                      <button
                        onClick={() => setActiveNav("dashboard")}
                        className="rounded-full bg-[#1E88E5] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1669c1] transition"
                      >
                        Go to Dashboard →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Connected Welcome State
  if (isActive && activeNav === "landing") {
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
                  {isDemoMode ? demoPublicKey : publicKey?.toString()}
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
              Never Get Liquidated{" "}
            <span className="bg-linear-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                Again.
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

              <button
                onClick={handleDemoMode}
                className="px-4 py-2 text-xs font-medium border rounded-lg transition-all hover:scale-105"
                style={{
                  borderColor: "#1E1E2A",
                  color: "#A0A3B1",
                  backgroundColor: "transparent",
                }}
              >
                Try Demo — no wallet needed
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
              <div className="backdrop-blur-md bg-linear-to-br from-slate-900/40 to-slate-950/40 border border-blue-500/20 rounded-2xl p-8 hover:border-blue-500/40 transition-all duration-700 hover:-translate-y-2">
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
              <div className="backdrop-blur-md bg-linear-to-br from-slate-900/40 to-slate-950/40 border border-blue-500/20 rounded-2xl p-8 hover:border-blue-500/40 transition-all duration-700 hover:-translate-y-2">
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
              <div className="backdrop-blur-md bg-linear-to-br from-slate-900/40 to-slate-950/40 border border-blue-500/20 rounded-2xl p-8 hover:border-blue-500/40 transition-all duration-700 hover:-translate-y-2">
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
                <p className="text-4xl font-black text-transparent bg-linear-to-r from-blue-400 to-blue-600 bg-clip-text mb-2">$48.2M</p>
                <p className="text-slate-500 text-xs uppercase tracking-wide">Collateral Protected</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-black text-transparent bg-linear-to-r from-teal-400 to-teal-600 bg-clip-text mb-2">12,847</p>
                <p className="text-slate-500 text-xs uppercase tracking-wide">Active Positions</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-black text-transparent bg-linear-to-r from-cyan-400 to-cyan-600 bg-clip-text mb-2">340ms</p>
                <p className="text-slate-500 text-xs uppercase tracking-wide">Avg Response</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-black text-transparent bg-linear-to-r from-blue-400 to-blue-600 bg-clip-text mb-2">99.97%</p>
                <p className="text-slate-500 text-xs uppercase tracking-wide">Uptime</p>
              </div>
            </div>

            {/* CTA Banner */}
            <div className="mt-12 rounded-2xl bg-linear-to-r from-blue-600/20 to-teal-600/20 border border-blue-500/30 p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-3">Start protecting your positions today.</h3>
              <p className="text-slate-400 text-sm mb-6">Free to use. No funds held. Session keys only.</p>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all hover:scale-105"
              >
                Connect Wallet →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}  