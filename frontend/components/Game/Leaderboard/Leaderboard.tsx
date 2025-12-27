'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { LeaderboardEntry } from '@/lib/types';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  pageSize?: number;
  currentUsername?: string | null;
}

export default function Leaderboard({ entries, pageSize = 20, currentUsername }: LeaderboardProps) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(entries.length / pageSize));
  const paged = useMemo(() => entries.slice((page - 1) * pageSize, page * pageSize), [entries, page, pageSize]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {paged.map((e, i) => (
          <motion.div
            key={e.username}
            className={`bg-secondary/50 rounded-xl p-4 border ${
              e.username === currentUsername ? 'border-primary/50 bg-primary/10' : 'border-primary/20'
            }`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.02 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-xl font-bold w-12 text-center">{getRankIcon(e.rank)}</div>
                <div>
                  <div className="font-bold">{e.username}</div>
                  <div className="text-xs text-muted">سطح {e.level} • {e.total_cards} کارت</div>
                </div>
              </div>
              <div className="text-sm text-muted">Rank {e.rank}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            className="px-3 py-2 rounded-lg bg-secondary/50 disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            قبلی
          </button>
          <div className="text-sm text-muted">
            صفحه {page} از {totalPages}
          </div>
          <button
            className="px-3 py-2 rounded-lg bg-secondary/50 disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            بعدی
          </button>
        </div>
      )}
    </div>
  );
}
