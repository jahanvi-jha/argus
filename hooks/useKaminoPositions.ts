import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

// 🚀 HACKATHON DEMO MODE - Simulated Kamino positions
// Using mock data for demonstration purposes
const DEMO_MODE = true;

type RiskStatus = 'safe' | 'caution' | 'danger';

export interface KaminoPosition {
  id: string;
  market: string;
  pair: string;
  healthFactor: number;
  collateralValue: number;
  borrowValue: number;
  liquidationThreshold: number;
  liquidationDistance: number;
  riskStatus: RiskStatus;
  ltvPercentage: number;
  liquidationPrice: number;
}

// Risk classification logic
const classifyRisk = (healthFactor: number): RiskStatus => {
  if (healthFactor > 1.5) return 'safe';
  if (healthFactor >= 1.2) return 'caution';
  return 'danger';
};

// Mock positions data
const MOCK_POSITIONS: KaminoPosition[] = [
  {
    id: 'position-1',
    market: 'Kamino Finance',
    pair: 'SOL / USDC - Mainnet',
    healthFactor: 2.14,
    collateralValue: 24860,
    borrowValue: 11590,
    liquidationThreshold: 0.4672,
    liquidationDistance: 53,
    riskStatus: 'safe',
    ltvPercentage: 46.7,
    liquidationPrice: 67.40,
  },
  {
    id: 'position-2',
    market: 'Kamino Finance',
    pair: 'mSOL / USDC - Mainnet',
    healthFactor: 1.31,
    collateralValue: 8280,
    borrowValue: 5259,
    liquidationThreshold: 0.763,
    liquidationDistance: 24,
    riskStatus: 'caution',
    ltvPercentage: 76.3,
    liquidationPrice: 188.20,
  },
];

export const useKaminoPositions = () => {
  const { publicKey } = useWallet();
  const [positions, setPositions] = useState<KaminoPosition[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!publicKey) {
      setPositions([]);
      return;
    }

    const fetchKaminoData = async () => {
      setLoading(true);
      try {
        const walletToFetch = publicKey.toBase58();
        
        console.log('🚀 DEMO MODE: Using simulated Kamino position data');
        console.log('🔄 Fetching Kamino positions for:', walletToFetch);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Classify risks and use mock data
        const enrichedPositions = MOCK_POSITIONS.map(pos => ({
          ...pos,
          riskStatus: classifyRisk(pos.healthFactor),
        }));

        console.log('💰 Kamino Position Data:', enrichedPositions);
        setPositions(enrichedPositions);
      } catch (err) {
        const error = err as any;
        console.error('❌ Kamino fetch error:', error?.message || error);
        setPositions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchKaminoData();

    // Refresh every 30 seconds
    const interval = setInterval(fetchKaminoData, 30000);
    return () => clearInterval(interval);

  }, [publicKey]);

  return { positions, loading };
};