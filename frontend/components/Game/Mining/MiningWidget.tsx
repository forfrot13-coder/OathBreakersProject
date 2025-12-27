'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { formatNumber } from '@/lib/utils';
import { useSoundStore } from '@/store/soundStore';

interface MiningWidgetProps {
  miningRate: number;
  lastClaimTime: string;
  onClaim: () => void | Promise<void>;
  isLoading?: boolean;
  autoClaim?: boolean;
  claimThreshold?: number;
}

export default function MiningWidget({
  miningRate,
  lastClaimTime,
  onClaim,
  isLoading = false,
  autoClaim = false,
  claimThreshold = 1,
}: MiningWidgetProps) {
  const playEffect = useSoundStore((s) => s.playEffect);
  const [earnings, setEarnings] = useState(0);
  const [hasNotifiedReady, setHasNotifiedReady] = useState(false);

  useEffect(() => {
    const baseTs = lastClaimTime ? new Date(lastClaimTime).getTime() : Date.now();

    const tick = () => {
      const elapsedSec = Math.max(0, (Date.now() - baseTs) / 1000);
      const next = (miningRate * elapsedSec) / 3600;
      setEarnings(next);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [lastClaimTime, miningRate]);

  const earningsInt = Math.floor(earnings);
  const formattedEarnings = useMemo(() => formatNumber(earningsInt, { compact: false }), [earningsInt]);

  const secondsToThreshold = useMemo(() => {
    if (miningRate <= 0) return Infinity;
    if (earnings >= claimThreshold) return 0;
    const missing = claimThreshold - earnings;
    return Math.ceil((missing * 3600) / miningRate);
  }, [claimThreshold, earnings, miningRate]);

  useEffect(() => {
    if (earnings >= claimThreshold && !hasNotifiedReady) {
      setHasNotifiedReady(true);
      playEffect('success');
    }
    if (earnings < claimThreshold && hasNotifiedReady) {
      setHasNotifiedReady(false);
    }
  }, [claimThreshold, earnings, hasNotifiedReady, playEffect]);

  useEffect(() => {
    if (!autoClaim) return;
    if (isLoading) return;
    if (earnings < claimThreshold) return;

    void Promise.resolve(onClaim()).finally(() => {
      // best-effort: UI will resync when parent updates lastClaimTime
    });
  }, [autoClaim, claimThreshold, earnings, isLoading, onClaim]);

  const progress = useMemo(() => {
    if (!Number.isFinite(earnings) || miningRate <= 0) return 0;
    return Math.min(100, (earnings / claimThreshold) * 100);
  }, [claimThreshold, earnings, miningRate]);

  const formatSeconds = (s: number) => {
    if (!Number.isFinite(s) || s <= 0) return '0s';
    const m = Math.floor(s / 60);
    const sec = s % 60;
    if (m === 0) return `${sec}s`;
    return `${m}m ${sec}s`;
  };

  return (
    <motion.div
      className="mining-widget bg-gradient-to-br from-amber-900/50 to-orange-900/50 rounded-2xl p-6 border border-amber-700/50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <motion.div
            className="text-4xl"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ⛏️
          </motion.div>
          <h3 className="text-xl font-bold text-amber-200">استخراج</h3>
        </div>
        <div className="text-right">
          <div className="text-sm text-amber-400">نرخ استخراج</div>
          <div className="text-2xl font-bold text-white">{formatNumber(miningRate, { compact: false })}/ساعت</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-black/30 rounded-xl p-4">
          <div className="text-sm text-amber-400 mb-1">درآمد فعلی</div>
          <motion.div
            key={formattedEarnings}
            className="text-3xl font-bold text-white flex items-center gap-2"
            initial={{ scale: 1.15 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <span>🪙</span>
            <span>{formattedEarnings}</span>
          </motion.div>
        </div>

        <div className="bg-black/30 rounded-xl p-4">
          <div className="text-sm text-amber-400 mb-1">برداشت بعدی</div>
          <div className="text-lg font-semibold text-white">
            {earnings >= claimThreshold ? 'آماده ✅' : formatSeconds(secondsToThreshold)}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-sm text-amber-400 mb-2">
          <span>پیشرفت</span>
          <span>{progress.toFixed(0)}%</span>
        </div>
        <div className="h-3 bg-black/30 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <motion.button
        onClick={() => {
          playEffect('claim');
          void Promise.resolve(onClaim());
        }}
        disabled={isLoading || earnings < claimThreshold}
        className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        whileHover={{ scale: isLoading || earnings < claimThreshold ? 1 : 1.02 }}
        whileTap={{ scale: isLoading || earnings < claimThreshold ? 1 : 0.98 }}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full spin" />
            درحال پردازش...
          </span>
        ) : earnings < claimThreshold ? (
          '⏳ منتظر جمع‌آوری'
        ) : (
          `🪙 جمع‌آوری ${earningsInt} سکه`
        )}
      </motion.button>
    </motion.div>
  );
}
