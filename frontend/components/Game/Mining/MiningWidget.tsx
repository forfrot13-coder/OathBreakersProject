'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface MiningWidgetProps {
  miningRate: number;
  lastClaimTime: string;
  onClaim: () => void;
  isLoading?: boolean;
}

export default function MiningWidget({
  miningRate,
  lastClaimTime,
  onClaim,
  isLoading = false,
}: MiningWidgetProps) {
  const [earnings, setEarnings] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setEarnings((prev) => prev + miningRate / 3600); // Per second
    }, 1000);

    return () => clearInterval(interval);
  }, [miningRate]);

  const formattedEarnings = earnings.toFixed(2);
  const earningsInt = Math.floor(earnings);

  return (
    <motion.div
      className="mining-widget bg-gradient-to-br from-amber-900/50 to-orange-900/50 rounded-2xl p-6 border border-amber-700/50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
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
          <div className="text-2xl font-bold text-white">
            {miningRate.toLocaleString()}/ساعت
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-black/30 rounded-xl p-4">
          <div className="text-sm text-amber-400 mb-1">درآمد فعلی</div>
          <motion.div
            key={formattedEarnings}
            className="text-3xl font-bold text-white flex items-center gap-2"
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <span>🪙</span>
            <span>{earningsInt}</span>
          </motion.div>
        </div>

        <div className="bg-black/30 rounded-xl p-4">
          <div className="text-sm text-amber-400 mb-1">آخرین برداشت</div>
          <div className="text-lg font-semibold text-white">
            {lastClaimTime
              ? new Date(lastClaimTime).toLocaleTimeString('fa-IR')
              : 'هرگز'}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-amber-400 mb-2">
          <span>پیشرفت</span>
          <span>{((earnings % 60) / 60 * 100).toFixed(0)}%</span>
        </div>
        <div className="h-3 bg-black/30 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${(earnings % 60) / 60 * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Claim Button */}
      <motion.button
        onClick={onClaim}
        disabled={isLoading || earnings < 1}
        className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        whileHover={{ scale: isLoading || earnings < 1 ? 1 : 1.02 }}
        whileTap={{ scale: isLoading || earnings < 1 ? 1 : 0.98 }}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full spin" />
            درحال پردازش...
          </span>
        ) : earnings < 1 ? (
          '⏳ منتظر جمع‌آوری'
        ) : (
          `🪙 جمع‌آوری ${earningsInt} سکه`
        )}
      </motion.button>
    </motion.div>
  );
}
