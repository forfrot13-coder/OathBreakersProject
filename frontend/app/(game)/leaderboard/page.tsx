'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useAuthStore } from '@/store/authStore';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function LeaderboardPage() {
  const { leaderboard, fetchLeaderboard, isLoading } = useGameStore();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    fetchLeaderboard().catch((error) => {
      toast.error('خطا در بارگذاری رتبه‌بندی');
    });
  }, [fetchLeaderboard]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-amber-500 to-yellow-600';
    if (rank === 2) return 'from-gray-400 to-gray-500';
    if (rank === 3) return 'from-amber-700 to-orange-800';
    return 'from-primary/20 to-secondary/20';
  };

  const userRank = leaderboard.find(entry => entry.username === user?.username);

  return (
    <div className="leaderboard space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">🏆 رتبه‌بندی بازیکنان</h1>
        <p className="text-muted">بهترین بازیکنان OathBreakers را ببینید</p>
      </div>

      {/* User Rank Card */}
      {userRank && (
        <motion.div
          className="bg-gradient-to-r from-primary/30 to-secondary/30 rounded-2xl p-6 border border-primary/40"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-6">
            <div className="text-5xl">{getRankIcon(userRank.rank)}</div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-bold">{user.username}</h2>
                <span className="px-3 py-1 bg-primary/30 text-primary rounded-full text-sm font-medium">
                  شما
                </span>
              </div>
              <p className="text-muted">سطح {userRank.level} • {userRank.total_cards} کارت</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">رتبه {userRank.rank}</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Leaderboard List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="spinner" />
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-xl font-semibold mb-2">هنوز رتبه‌بندی وجود ندارد</h3>
          <p className="text-muted">به بازی بپیوندید تا رتبه‌بندی ساخته شود</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((entry, index) => (
            <motion.div
              key={entry.username}
              className={`bg-secondary/50 rounded-xl p-4 border transition-all ${
                entry.username === user?.username
                  ? 'border-primary/50 bg-primary/10'
                  : 'border-primary/20 hover:border-primary/40'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: entry.username === user?.username ? 1 : 1.02, x: 5 }}
            >
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold bg-gradient-to-br`}
                  style={{ background: getRankColor(entry.rank) }}
                >
                  {getRankIcon(entry.rank)}
                </div>

                {/* Player Info */}
                <div className="flex-1">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    {entry.username}
                    {entry.username === user?.username && (
                      <span className="text-xs px-2 py-0.5 bg-primary text-white rounded-full">
                        شما
                      </span>
                    )}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-muted">
                    <span>سطح {entry.level}</span>
                    <span>•</span>
                    <span>{entry.total_cards} کارت</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="text-right">
                  <div className="text-sm text-muted">رتبه</div>
                  <div className="text-xl font-bold text-primary">{entry.rank}</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(1 - (entry.rank - 1) / leaderboard.length) * 100}%` }}
                    transition={{ duration: 1, delay: index * 0.05 }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Legend */}
      <motion.div
        className="bg-secondary/30 rounded-xl p-6 mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="font-bold mb-4">نحوه محاسبه رتبه‌بندی</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⭐</span>
            <div>
              <div className="font-semibold">سطح</div>
              <div className="text-muted">سطح بالاتر = امتیاز بیشتر</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🎴</span>
            <div>
              <div className="font-semibold">تعداد کارت</div>
              <div className="text-muted">کارت‌های بیشتر = امتیاز بیشتر</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">💎</span>
            <div>
              <div className="font-semibold">نادرتی کارت‌ها</div>
              <div className="text-muted">کارت‌های لجندری = امتیاز ویژه</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
