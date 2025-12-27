'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';

export default function NetworkStatus() {
  const isOnline = useGameStore((s) => s.isOnline);

  return (
    <motion.div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border ${
        isOnline
          ? 'bg-green-900/20 border-green-500/30 text-green-300'
          : 'bg-red-900/20 border-red-500/30 text-red-300'
      }`}
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      title={isOnline ? 'اتصال برقرار است' : 'آفلاین'}
    >
      <span className="text-lg">{isOnline ? '🟢' : '🔴'}</span>
      <span>{isOnline ? 'Online' : 'Offline'}</span>
    </motion.div>
  );
}
