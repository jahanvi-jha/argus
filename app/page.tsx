'use client';

import { useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function Home() {
  const { connected, disconnect, publicKey } = useWallet();

  // Format wallet address to show first 4 and last 4 characters
  const truncatedAddress = publicKey
    ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}`
    : null;

  const handleDisconnect = useCallback(() => {
    disconnect();
  }, [disconnect]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {!connected ? (
          // Landing Page - Connect Wallet Screen
          <div className="flex flex-col items-center justify-center gap-8">
            {/* Logo / Header */}
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-3">
                <span className="bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
                  Argus
                </span>
              </h1>
              <p className="text-slate-400 text-lg">
                AI guardian for your Solana DeFi position
              </p>
            </div>

            {/* Description */}
            <div className="text-center space-y-3">
              <p className="text-slate-300 text-sm leading-relaxed">
                Connect your wallet to monitor your lending positions, track liquidation risk, and protect your portfolio with AI-powered insights.
              </p>
              <p className="text-slate-500 text-xs">
                No registration. No KYC. Just connect and go.
              </p>
            </div>

            {/* Wallet Connection Buttons */}
            <div className="w-full space-y-3">
              {/* Using WalletMultiButton from adapter UI library */}
              <div className="flex justify-center">
                <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700 !rounded-lg !h-12 !text-base !font-semibold !px-6" />
              </div>
              <p className="text-slate-500 text-xs text-center">
                Supports Phantom, Solflare, and more
              </p>
            </div>

            {/* Feature highlights */}
            <div className="w-full space-y-4 pt-6 border-t border-slate-800">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-green-400 text-sm">✓</span>
                </div>
                <div>
                  <p className="text-white font-medium text-sm">Real-time Monitoring</p>
                  <p className="text-slate-400 text-xs">24/7 health factor tracking</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-teal-400 text-sm">✓</span>
                </div>
                <div>
                  <p className="text-white font-medium text-sm">AI Risk Analysis</p>
                  <p className="text-slate-400 text-xs">Plain English explanations</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-400 text-sm">✓</span>
                </div>
                <div>
                  <p className="text-white font-medium text-sm">Automated Protection</p>
                  <p className="text-slate-400 text-xs">Auto-repayment rules</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Connected Dashboard - Show wallet info and disconnect
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8">
            <div className="text-center space-y-6">
              <div>
                <p className="text-slate-400 text-sm mb-2">Connected Wallet</p>
                <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                  <p className="text-white font-mono text-lg font-semibold">
                    {truncatedAddress}
                  </p>
                  <p className="text-slate-500 text-xs mt-2">
                    Full address: {publicKey?.toString()}
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <button
                  onClick={() => {
                    // TODO: Navigate to dashboard
                    console.log('Navigate to dashboard');
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

              <p className="text-slate-400 text-xs pt-4 border-t border-slate-700">
                You're all set! Argus is now monitoring your positions.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
