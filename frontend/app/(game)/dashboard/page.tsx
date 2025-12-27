'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useGameStore } from '@/store/gameStore';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Link from 'next/link';
import MiningWidget from '@/components/Game/Mining/MiningWidget';
import CardGrid from '@/components/Card/CardGrid';
import CurrencyDisplay from '@/components/Game/Currency/CurrencyDisplay';

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const cards = useGameStore((state) => state.cards);
  const fetchCards = useGameStore((state) => state.fetchCards);
  const [lastClaim, setLastClaim] = useState<string>('');
  const [isClaiming, setIsClaiming] = useState(false);

  useEffect(() => {
    fetchCards();
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/profile/`, {
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      }
    } catch (error) {
      console.error('Failed to fetch profile');
    }
  };

  const handleClaim = async () => {
    setIsClaiming(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/claim/`, {
        method: 'POST',
        headers: { 'Authorization': `Token ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'خطا در برداشت');
      }

      const data = await response.json();
      toast.success(`${data.earned_coins} سکه جمع‌آوری شد! 🪙`);
      setLastClaim(new Date().toISOString());
      fetchProfile();
    } catch (error: any) {
      toast.error(error.message || 'خطا در جمع‌آوری سکه‌ها');
    } finally {
      setIsClaiming(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="spinner" />
      </div>
    );
  }

  const recentCards = cards.slice(0, 5);

  return (
    <div className="dashboard space-y-8">
      {/* Header */}
      <motion.div
        className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl p-6 border border-primary/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-3xl">
              👤
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1">👋 خوش آمدید، {user.username}!</h1>
              <p className="text-muted">سطح {user.profile.level} • نرخ استخراج {user.profile.current_mining_rate}/ساعت</p>
            </div>
          </div>

          <CurrencyDisplay
            coins={user.profile.coins}
            gems={user.profile.gems}
            fragments={user.profile.vow_fragments}
          />
        </div>
      </motion.div>

      {/* Mining Widget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <MiningWidget
          miningRate={user.profile.current_mining_rate}
          lastClaimTime={lastClaim}
          onClaim={handleClaim}
          isLoading={isClaiming}
        />
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-xl font-bold mb-4">دسترسی سریع</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/game/shop">
            <motion.div
              className="bg-secondary rounded-xl p-6 border border-primary/20 hover:border-primary/50 transition-all cursor-pointer group"
              whileHover={{ scale: 1.02, y: -4 }}
            >
              <div className="text-4xl mb-3">📦</div>
              <h3 className="font-bold">فروشگاه</h3>
              <p className="text-sm text-muted">خرید پک کارت</p>
            </motion.div>
          </Link>

          <Link href="/game/marketplace">
            <motion.div
              className="bg-secondary rounded-xl p-6 border border-primary/20 hover:border-primary/50 transition-all cursor-pointer group"
              whileHover={{ scale: 1.02, y: -4 }}
            >
              <div className="text-4xl mb-3">🛍️</div>
              <h3 className="font-bold">بازار</h3>
              <p className="text-sm text-muted">خرید و فروش کارت</p>
            </motion.div>
          </Link>

          <Link href="/game/leaderboard">
            <motion.div
              className="bg-secondary rounded-xl p-6 border border-primary/20 hover:border-primary/50 transition-all cursor-pointer group"
              whileHover={{ scale: 1.02, y: -4 }}
            >
              <div className="text-4xl mb-3">🏆</div>
              <h3 className="font-bold">رتبه‌بندی</h3>
              <p className="text-sm text-muted">مشاهده رتبه‌ها</p>
            </motion.div>
          </Link>

          <Link href="/game/profile">
            <motion.div
              className="bg-secondary rounded-xl p-6 border border-primary/20 hover:border-primary/50 transition-all cursor-pointer group"
              whileHover={{ scale: 1.02, y: -4 }}
            >
              <div className="text-4xl mb-3">👤</div>
              <h3 className="font-bold">پروفایل</h3>
              <p className="text-sm text-muted">مدیریت حساب</p>
            </motion.div>
          </Link>
        </div>
      </motion.div>

      {/* Recent Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">کارت‌های اخیر</h2>
          <Link href="/game/inventory" className="text-primary hover:underline text-sm">
            مشاهده همه ({cards.length})
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {recentCards.length > 0 ? (
            recentCards.map((card) => (
              <div key={card.id}>
                <CardGrid cards={[card]} showDetails={true} size="sm" />
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8 bg-secondary/30 rounded-xl">
              <p className="text-muted">هنوز کارتی ندارید. از فروشگاه کارت بخرید!</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
