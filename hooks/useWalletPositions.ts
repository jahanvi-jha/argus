'use client';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useEffect, useState } from 'react';

export interface TokenPosition {
  mint: string;
  balance: number;
  decimals: number;
  symbol?: string;
}

export function useWalletPositions() {
  const { publicKey } = useWallet();
  const [positions, setPositions] = useState<TokenPosition[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!publicKey) {
      setPositions([]);
      return;
    }
    fetchPositions(publicKey);
  }, [publicKey]);

  const fetchPositions = async (pk: PublicKey) => {
    setLoading(true);
    try {
      const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: '1',
          method: 'getTokenAccountsByOwner',
          params: [
             pk.toBase58(),
            { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' }, // SPL Token
            { encoding: 'jsonParsed' },
          ],
        }),
      });

      const data = await response.json();
      console.log('🪙 RAW TOKEN DATA:', data); // Task 3 ✓

      const tokenAccounts = data.result?.value || [];
      const positions: TokenPosition[] = tokenAccounts
        .filter((acc: any) => acc.account.data.parsed.info.tokenAmount.uiAmount > 0)
        .map((acc: any) => ({
          mint: acc.account.data.parsed.info.mint,
          balance: acc.account.data.parsed.info.tokenAmount.uiAmount || 0,
          decimals: acc.account.data.parsed.info.tokenAmount.decimals,
          symbol: acc.account.data.parsed.info.tokenList?.symbol || 'Unknown',
        }));

      console.log('📊 PROCESSED POSITIONS:', positions); // Task 4 ✓
      setPositions(positions);
    } catch (error) {
      console.error('❌ Fetch failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return { positions, loading, refetch: fetchPositions };
}