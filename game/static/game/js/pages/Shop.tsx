import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, useNotificationStore } from '../store';
import Button from '../components/Button';
import { formatCurrency, formatNumber } from '../utils';

const Shop: React.FC = () => {
  const { packs, fetchPacks, openPack, isLoading } = useGameStore();
  const { addNotification } = useNotificationStore();
  const [openingPack, setOpeningPack] = useState<number | null>(null);
  const [showOpeningAnimation, setShowOpeningAnimation] = useState(false);
  const [openedCard, setOpenedCard] = useState<any>(null);

  useEffect(() => {
    fetchPacks();
  }, [fetchPacks]);

  const handleOpenPack = async (packId: number) => {
    try {
      setOpeningPack(packId);
      const result = await openPack(packId);
      setOpenedCard(result.card);
      setShowOpeningAnimation(true);
      addNotification({
        message: `پک با موفقیت باز شد! کارت ${result.card.card_name} دریافت شد`,
        type: 'success',
      });
    } catch (error) {
      addNotification({
        message: 'خطا در باز کردن پک',
        type: 'error',
      });
    } finally {
      setOpeningPack(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">فروشگاه</h1>
        <p className="text-gray-400">پک‌های کارت خریداری کنید</p>
      </div>

      {/* Packs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-base"
      >
        <h2 className="text-white font-bold mb-4">پک‌های موجود</h2>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="spinner w-12 h-12" />
          </div>
        ) : packs.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-6xl mb-4">📦</div>
            <p>هیچ پکی موجود نیست</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {packs.map((pack) => {
              const currencyIcon = pack.cost_currency === 'COINS' ? '🪙' : '💎';
              return (
                <motion.div
                  key={pack.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * pack.id }}
                  className="card-base border-2 border-game-accent relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-game-accent/10 to-purple-500/10" />
                  <div className="relative">
                    {/* Pack Icon */}
                    <div className="text-center py-8">
                      <div className="text-7xl mb-4">🎁</div>
                      <h3 className="text-xl font-bold text-white mb-2">{pack.name}</h3>
                      <p className="text-gray-400 text-sm mb-4">{pack.description}</p>
                    </div>

                    {/* Pack Details */}
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between items-center px-2">
                        <span className="text-gray-400">قیمت:</span>
                        <span className="text-white font-bold text-lg">
                          {currencyIcon} {formatNumber(pack.cost)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center px-2">
                        <span className="text-gray-400">تضمین:</span>
                        <span className="font-bold text-sm px-2 py-1 rounded bg-purple-600 text-white">
                          {pack.guaranteed_rarity}
                        </span>
                      </div>
                    </div>

                    {/* Open Pack Button */}
                    <Button
                      variant="primary"
                      fullWidth
                      isLoading={isLoading && openingPack === pack.id}
                      onClick={() => handleOpenPack(pack.id)}
                    >
                      باز کردن پک
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Pack Opening Animation Modal */}
      <AnimatePresence>
        {showOpeningAnimation && openedCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowOpeningAnimation(false)}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: 'spring', damping: 20 }}
              className="bg-game-card rounded-2xl p-8 max-w-md w-full text-center border-2 border-game-accent"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-white mb-6">تبریک! 🎉</h2>
              
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                className="mb-6"
              >
                <div className="text-8xl mb-4">🎴</div>
                <h3 className="text-xl font-bold text-white">{openedCard.card_name}</h3>
                <p className="text-game-accent font-bold text-lg mt-2">
                  {openedCard.rarity}
                </p>
              </motion.div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-game-darker rounded-lg p-3">
                  <p className="text-gray-400 text-sm">نرخ استخراج</p>
                  <p className="text-green-400 font-bold text-lg">
                    +{formatNumber(openedCard.mining_rate)}/s
                  </p>
                </div>
                <div className="bg-game-darker rounded-lg p-3">
                  <p className="text-gray-400 text-sm">شماره سریال</p>
                  <p className="text-blue-400 font-bold text-lg">
                    #{openedCard.serial_number}
                  </p>
                </div>
              </div>

              <Button
                variant="primary"
                fullWidth
                onClick={() => setShowOpeningAnimation(false)}
              >
                ادامه
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Shop;
