'use client';

import { useEffect, useState } from 'react';
import { useGameStore, Pack } from '@/store/gameStore';
import { useAuthStore } from '@/store/authStore';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Modal from '@/components/Common/Modal';
import PackOpening from '@/components/Game/Pack/PackOpening';
import CurrencyDisplay from '@/components/Game/Currency/CurrencyDisplay';

export default function ShopPage() {
  const { packs, fetchPacks, openPack, isLoading } = useGameStore();
  const user = useAuthStore((state) => state.user);
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  useEffect(() => {
    fetchPacks();
  }, [fetchPacks]);

  const handleOpenPack = async () => {
    if (!selectedPack) return;

    setIsOpening(true);
    try {
      await openPack(selectedPack.id);
      toast.success('پک با موفقیت باز شد! 🎉');
      setIsModalOpen(false);
      setSelectedPack(null);
    } catch (error: any) {
      toast.error(error.message || 'خطا در باز کردن پک');
    } finally {
      setIsOpening(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    const colors: Record<string, string> = {
      COMMON: '#6b7280',
      RARE: '#3b82f6',
      EPIC: '#a855f7',
      LEGENDARY: '#f59e0b',
    };
    return colors[rarity] || '#6b7280';
  };

  return (
    <div className="shop space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">🏪 فروشگاه کارت</h1>
          <p className="text-muted">پک‌های کارت باز کنید و کارت‌های جدید بخرید!</p>
        </div>

        {user && (
          <CurrencyDisplay
            coins={user.profile.coins}
            gems={user.profile.gems}
            fragments={user.profile.vow_fragments}
          />
        )}
      </div>

      {/* Packs Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="spinner" />
        </div>
      ) : packs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold mb-2">هیچ پکی وجود ندارد</h3>
          <p className="text-muted">پک‌ها به زودی اضافه خواهند شد</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packs.map((pack, index) => (
            <motion.div
              key={pack.id}
              className="bg-secondary/50 rounded-2xl p-6 border border-primary/20 hover:border-primary/50 transition-all"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
            >
              {/* Pack Visual */}
              <div className="flex justify-center mb-6">
                <motion.div
                  className="w-48 h-56 rounded-2xl flex items-center justify-center text-6xl shadow-2xl relative"
                  style={{
                    background: `linear-gradient(135deg, ${getRarityColor(pack.guaranteed_rarity)}40, ${getRarityColor(pack.guaranteed_rarity)}80)`,
                    border: `3px solid ${getRarityColor(pack.guaranteed_rarity)}`,
                  }}
                  whileHover={{ rotate: 5, scale: 1.05 }}
                  animate={{ rotate: [0, 2, -2, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  📦
                  <motion.div
                    className="absolute inset-0 rounded-2xl"
                    animate={{
                      boxShadow: [
                        `0 0 20px ${getRarityColor(pack.guaranteed_rarity)}40`,
                        `0 0 40px ${getRarityColor(pack.guaranteed_rarity)}80`,
                        `0 0 20px ${getRarityColor(pack.guaranteed_rarity)}40`,
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
              </div>

              {/* Pack Info */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{pack.name}</h3>
                <p className="text-muted text-sm mb-3">{pack.description}</p>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold"
                  style={{
                    backgroundColor: `${getRarityColor(pack.guaranteed_rarity)}40`,
                    color: getRarityColor(pack.guaranteed_rarity),
                  }}
                >
                  تضمین {pack.guaranteed_rarity}+
                </div>
              </div>

              {/* Price */}
              <div className="bg-black/30 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-center gap-2 text-2xl font-bold">
                  <span>
                    {pack.cost_currency === 'COINS' ? '🪙' : pack.cost_currency === 'GEMS' ? '💎' : '🔮'}
                  </span>
                  <span>{pack.cost.toLocaleString()}</span>
                </div>
              </div>

              {/* Buy Button */}
              <motion.button
                onClick={() => {
                  setSelectedPack(pack);
                  setIsModalOpen(true);
                }}
                disabled={!user || (
                  user && pack.cost_currency === 'COINS' && user.profile.coins < pack.cost
                ) || (
                  user && pack.cost_currency === 'GEMS' && user.profile.gems < pack.cost
                )}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: !user || (user && pack.cost_currency === 'COINS' && user.profile.coins >= pack.cost) ? 1.02 : 1 }}
                whileTap={{ scale: !user || (user && pack.cost_currency === 'COINS' && user.profile.coins >= pack.cost) ? 0.98 : 1 }}
              >
                باز کردن پک 🎁
              </motion.button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pack Opening Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="xl"
      >
        {selectedPack && (
          <PackOpening
            packName={selectedPack.name}
            packRarity={selectedPack.guaranteed_rarity}
            onOpen={handleOpenPack}
            isOpening={isOpening}
          />
        )}
      </Modal>
    </div>
  );
}
