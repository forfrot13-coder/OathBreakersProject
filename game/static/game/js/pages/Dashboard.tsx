import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore, useNotificationStore } from '../store';
import { formatCurrency, formatNumber, formatXPProgress, calculateLevelProgress } from '../utils';
import { CoinsIcon, GemsIcon } from '../components/Icons';
import Button from '../components/Button';

const Dashboard: React.FC = () => {
  const { profile, fetchProfile, claimMiningReward, exchangeCurrency, isLoading } = useGameStore();
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Auto-refresh profile every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchProfile();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchProfile]);

  const handleClaimReward = async () => {
    try {
      const result = await claimMiningReward();
      addNotification({
        message: `جایزه استخراج دریافت شد: ${formatCurrency(result.coins_earned, 'COINS')}`,
        type: 'success',
      });
    } catch (error) {
      addNotification({
        message: 'خطا در دریافت جایزه',
        type: 'error',
      });
    }
  };

  const handleExchangeCurrency = async () => {
    if (!profile) return;
    try {
      await exchangeCurrency(1000);
      addNotification({
        message: 'تبادل ارز با موفقیت انجام شد',
        type: 'success',
      });
    } catch (error) {
      addNotification({
        message: 'خطا در تبادل ارز',
        type: 'error',
      });
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">در حال بارگذاری...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">داشبورد</h1>
        <p className="text-gray-400">خوش آمدید، {profile.username}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Coins */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-base"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">سکه‌ها</p>
              <p className="text-2xl font-bold text-yellow-400">{formatNumber(profile.coins)}</p>
            </div>
            <CoinsIcon className="w-12 h-12 text-yellow-400" />
          </div>
        </motion.div>

        {/* Gems */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-base"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">gem</p>
              <p className="text-2xl font-bold text-purple-400">{formatNumber(profile.gems)}</p>
            </div>
            <GemsIcon className="w-12 h-12 text-purple-400" />
          </div>
        </motion.div>

        {/* Level */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-base"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">سطح</p>
              <p className="text-2xl font-bold text-game-accent">{formatNumber(profile.level)}</p>
            </div>
            <div className="text-4xl">⭐</div>
          </div>
        </motion.div>
      </div>

      {/* Level Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card-base"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-bold">پیشرفت سطح</h3>
          <span className="text-sm text-gray-400">
            {formatXPProgress(profile.xp || 0, profile.next_level_xp || 100)}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${calculateLevelProgress(profile.xp || 0, profile.next_level_xp || 100)}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-game-accent to-purple-500 rounded-full"
          />
        </div>
      </motion.div>

      {/* Mining Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card-base"
      >
        <h3 className="text-white font-bold mb-4">استخراج</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-game-darker rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-2">نرخ استخراج</p>
            <p className="text-2xl font-bold text-green-400">
              +{formatNumber(profile.current_mining_rate)}/ثانیه
            </p>
          </div>
          <div className="bg-game-darker rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-2">تعداد کارت‌ها</p>
            <p className="text-2xl font-bold text-blue-400">
              {formatNumber(profile.total_cards)}
            </p>
          </div>
        </div>
        <div className="mt-4 flex gap-4">
          <Button
            onClick={handleClaimReward}
            isLoading={isLoading}
            fullWidth
          >
            دریافت جایزه استخراج
          </Button>
          <Button
            variant="secondary"
            onClick={handleExchangeCurrency}
            isLoading={isLoading}
          >
            تبادل 1000 سکه → gem
          </Button>
        </div>
      </motion.div>

      {/* Vow Fragments */}
      {profile.vow_fragments > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card-base border-indigo-500"
        >
          <div className="flex items-center gap-3">
            <div className="text-4xl">💫</div>
            <div>
              <p className="text-gray-400 text-sm">Vow Fragments</p>
              <p className="text-2xl font-bold text-indigo-400">
                {formatNumber(profile.vow_fragments)}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;
