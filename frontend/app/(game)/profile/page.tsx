'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useGameStore } from '@/store/gameStore';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import CardGrid from '@/components/Card/CardGrid';

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const { cards, fetchCards } = useGameStore();
  const [isEditing, setIsEditing] = useState(false);
  const [avatar, setAvatar] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCards();
    if (user?.profile?.avatar_url) {
      setAvatar(user.profile.avatar_url);
    }
  }, [user, fetchCards]);

  const calculateStats = () => {
    const totalCards = cards.length;
    const legendary = cards.filter(c => c.rarity === 'LEGENDARY').length;
    const epic = cards.filter(c => c.rarity === 'EPIC').length;
    const rare = cards.filter(c => c.rarity === 'RARE').length;
    const common = cards.filter(c => c.rarity === 'COMMON').length;
    const totalMiningRate = cards.reduce((sum, card) => sum + card.mining_rate, 0);

    return { totalCards, legendary, epic, rare, common, totalMiningRate };
  };

  const stats = calculateStats();

  const handleUpdateProfile = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/profile/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ avatar_url: avatar }),
      });

      if (!response.ok) {
        throw new Error('خطا در بروزرسانی پروفایل');
      }

      const data = await response.json();
      setUser(data);
      setIsEditing(false);
      toast.success('پروفایل با موفقیت بروزرسانی شد! ✅');
    } catch (error: any) {
      toast.error(error.message || 'خطا در بروزرسانی پروفایل');
    } finally {
      setIsLoading(false);
    }
  };

  const getXPProgress = () => {
    if (!user) return 0;
    const xpInLevel = user.profile.level * 1000;
    const xpProgress = (user.profile.level * 1000) % 1000;
    return (xpProgress / xpInLevel) * 100;
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="profile space-y-6">
      {/* Profile Header */}
      <motion.div
        className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl p-8 border border-primary/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-6xl overflow-hidden">
              {avatar ? (
                <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                '👤'
              )}
            </div>
            <motion.button
              onClick={() => setIsEditing(!isEditing)}
              className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white shadow-lg"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isEditing ? '✕' : '✏️'}
            </motion.button>
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{user.username}</h1>
            <p className="text-muted mb-4">عضو از {new Date().toLocaleDateString('fa-IR')}</p>

            {/* XP Progress */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted">سطح {user.profile.level}</span>
                <span className="text-primary">سطح بعدی: {user.profile.level + 1}</span>
              </div>
              <div className="h-3 bg-black/30 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${getXPProgress()}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>

            {/* Edit Avatar */}
            {isEditing && (
              <motion.div
                className="bg-black/30 rounded-xl p-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <label className="block text-sm font-medium mb-2">URL آواتار</label>
                <input
                  type="url"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="لینک تصویر را وارد کنید"
                  className="w-full px-4 py-3 bg-tertiary border border-primary/20 rounded-xl mb-3"
                />
                <motion.button
                  onClick={handleUpdateProfile}
                  disabled={isLoading}
                  className="px-6 py-2 bg-primary hover:bg-primary-dark text-white font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: isLoading ? 1 : 1.05 }}
                  whileTap={{ scale: isLoading ? 1 : 0.95 }}
                >
                  {isLoading ? 'درحال ذخیره...' : 'ذخیره'}
                </motion.button>
              </motion.div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="flex flex-col gap-3">
            <div className="bg-black/30 rounded-xl px-4 py-3 text-center">
              <div className="text-2xl font-bold">{stats.totalCards}</div>
              <div className="text-xs text-muted">کارت</div>
            </div>
            <div className="bg-black/30 rounded-xl px-4 py-3 text-center">
              <div className="text-2xl font-bold">⛏️{stats.totalMiningRate}</div>
              <div className="text-xs text-muted">نرخ استخراج</div>
            </div>
            <div className="bg-black/30 rounded-xl px-4 py-3 text-center">
              <div className="text-2xl font-bold">{user.profile.level}</div>
              <div className="text-xs text-muted">سطح</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-xl font-bold mb-4">آمار کارت‌ها</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'مجموع', count: stats.totalCards, color: 'from-gray-600 to-gray-700', icon: '📦' },
            { label: 'لجندری', count: stats.legendary, color: 'from-amber-500 to-amber-600', icon: '🏆' },
            { label: 'ایپیک', count: stats.epic, color: 'from-purple-500 to-purple-600', icon: '✨' },
            { label: 'رِیر', count: stats.rare, color: 'from-blue-500 to-blue-600', icon: '⭐' },
            { label: 'کامن', count: stats.common, color: 'from-gray-500 to-gray-600', icon: '💫' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              className="bg-gradient-to-br rounded-xl p-4 text-center"
              style={{ background: stat.color }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.05 }}
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-white mb-1">{stat.count}</div>
              <div className="text-sm text-white/80">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Currency Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-xl font-bold mb-4">ارزها</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'سکه', amount: user.profile.coins, icon: '🪙', color: 'from-yellow-600 to-amber-600' },
            { label: 'جواهر', amount: user.profile.gems, icon: '💎', color: 'from-blue-600 to-cyan-600' },
            { label: 'قطعه', amount: user.profile.vow_fragments, icon: '🔮', color: 'from-purple-600 to-pink-600' },
          ].map((currency, index) => (
            <motion.div
              key={currency.label}
              className="bg-secondary/50 rounded-xl p-6 border border-primary/20"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">{currency.icon}</div>
                <div>
                  <div className="text-sm text-muted">{currency.label}</div>
                  <div className="text-2xl font-bold">{currency.amount.toLocaleString()}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-xl font-bold mb-4">کارت‌های شما</h2>
        <CardGrid cards={cards.slice(0, 5)} />
        {cards.length > 5 && (
          <p className="text-center text-muted mt-4">
            و {cards.length - 5} کارت دیگر...
          </p>
        )}
      </motion.div>
    </div>
  );
}
