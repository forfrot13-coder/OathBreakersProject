import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store';
import { formatNumber } from '../utils';
import { TrophyIcon } from '../components/Icons';

const Leaderboard: React.FC = () => {
  const { leaderboard, fetchLeaderboard, isLoading } = useGameStore();

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${formatNumber(rank)}`;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500';
    if (rank === 2) return 'bg-gray-400';
    if (rank === 3) return 'bg-amber-700';
    return 'bg-game-card';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <TrophyIcon className="w-8 h-8 text-yellow-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">جدول امتیازات</h1>
          <p className="text-gray-400">برترین بازیکنان</p>
        </div>
      </div>

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-end justify-center gap-4 mb-8"
        >
          {/* 2nd Place */}
          {leaderboard[1] && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center"
            >
              <div className="w-24 h-24 rounded-full bg-gray-400/20 border-4 border-gray-400 flex items-center justify-center mb-2 overflow-hidden">
                <span className="text-4xl">👤</span>
              </div>
              <div className="bg-gray-400 rounded-lg px-4 py-2 text-center min-w-[120px]">
                <p className="text-black font-bold">{leaderboard[1].username}</p>
                <p className="text-black/70 text-sm">سطح {formatNumber(leaderboard[1].level)}</p>
                <p className="text-black font-bold text-2xl mt-2">🥈 ۲</p>
              </div>
            </motion.div>
          )}

          {/* 1st Place */}
          {leaderboard[0] && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center"
            >
              <div className="text-4xl mb-2">👑</div>
              <div className="w-32 h-32 rounded-full bg-yellow-400/20 border-4 border-yellow-400 flex items-center justify-center mb-2 overflow-hidden">
                <span className="text-6xl">👤</span>
              </div>
              <div className="bg-yellow-500 rounded-lg px-6 py-3 text-center min-w-[140px]">
                <p className="text-black font-bold text-lg">{leaderboard[0].username}</p>
                <p className="text-black/70 text-sm">سطح {formatNumber(leaderboard[0].level)}</p>
                <p className="text-black font-bold text-3xl mt-2">🥇 ۱</p>
              </div>
            </motion.div>
          )}

          {/* 3rd Place */}
          {leaderboard[2] && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center"
            >
              <div className="w-24 h-24 rounded-full bg-amber-700/20 border-4 border-amber-700 flex items-center justify-center mb-2 overflow-hidden">
                <span className="text-4xl">👤</span>
              </div>
              <div className="bg-amber-700 rounded-lg px-4 py-2 text-center min-w-[120px]">
                <p className="text-white font-bold">{leaderboard[2].username}</p>
                <p className="text-white/70 text-sm">سطح {formatNumber(leaderboard[2].level)}</p>
                <p className="text-white font-bold text-2xl mt-2">🥉 ۳</p>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Full Leaderboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-base"
      >
        <h2 className="text-white font-bold mb-4">رتبه‌بندی کامل</h2>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="spinner w-12 h-12" />
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>هنوز بازیکنی در جدول وجود ندارد</p>
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((entry, index) => (
              <motion.div
                key={entry.rank}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`
                  flex items-center gap-4 p-4 rounded-lg
                  ${index < 3 ? 'bg-gradient-to-r from-game-accent/20 to-transparent' : 'bg-game-darker'}
                `}
              >
                <div className={`
                  w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold
                  ${getRankColor(entry.rank)}
                `}>
                  {getRankBadge(entry.rank)}
                </div>
                <div className="flex-1">
                  <p className="text-white font-bold">{entry.username}</p>
                  <p className="text-gray-400 text-sm">سطح {formatNumber(entry.level)}</p>
                </div>
                <div className="text-right">
                  <p className="text-game-accent font-bold text-lg">
                    {formatNumber(entry.total_cards)} کارت
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Leaderboard;
