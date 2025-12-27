'use client';

import { motion } from 'framer-motion';

interface PlayerStatsProps {
  level: number;
  xp?: number;
  rank?: number;
}

export default function PlayerStats({ level, xp, rank }: PlayerStatsProps) {
  const xpToNext = 1000;
  const progress = xp ? Math.min(100, ((xp % xpToNext) / xpToNext) * 100) : 0;

  return (
    <div className="bg-secondary/50 rounded-xl p-4 border border-primary/20">
      <div className="flex items-center justify-between mb-2">
        <div className="font-bold">سطح {level}</div>
        {typeof rank === 'number' && <div className="text-sm text-muted">رتبه {rank}</div>}
      </div>
      <div className="h-2 bg-black/30 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-secondary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-2 text-xs text-muted">XP: {xp ?? 0}</div>
    </div>
  );
}
