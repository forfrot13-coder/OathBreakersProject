import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore, useNotificationStore } from '../store';
import Card from '../components/Card';
import Button from '../components/Button';
import { getRarityClass } from '../utils';

const Inventory: React.FC = () => {
  const { cards, fetchCards, isLoading, equipCard, unequipCard, profile } = useGameStore();
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const handleEquipCard = async (cardId: number, slot: number) => {
    try {
      await equipCard(cardId, slot);
      addNotification({
        message: 'کارت با موفقیت مجهز شد',
        type: 'success',
      });
    } catch (error) {
      addNotification({
        message: 'خطا در مجهز کردن کارت',
        type: 'error',
      });
    }
  };

  const handleUnequipCard = async (slot: number) => {
    try {
      await unequipCard(slot);
      addNotification({
        message: 'کارت با موفقیت جدا شد',
        type: 'success',
      });
    } catch (error) {
      addNotification({
        message: 'خطا در جدا کردن کارت',
        type: 'error',
      });
    }
  };

  const equippedCards = profile?.slots?.filter((s) => s.card).map((s) => s.card!) || [];
  const availableCards = cards.filter(
    (card) => !equippedCards.some((eq) => eq.id === card.id)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">موجودی کارت‌ها</h1>
        <p className="text-gray-400">
          کل کارت‌ها: {cards.length} | مجهز شده: {equippedCards.length}
        </p>
      </div>

      {/* Equipped Cards */}
      {equippedCards.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-base"
        >
          <h2 className="text-white font-bold mb-4">کارت‌های مجهز شده</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {equippedCards.map((card, index) => (
              <div key={card.id} className="relative">
                <Card card={card} showSerial={false} />
                <Button
                  variant="danger"
                  size="sm"
                  className="mt-2 w-full"
                  onClick={() => handleUnequipCard(index + 1)}
                >
                  جدا کردن
                </Button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Available Slots */}
      {profile?.slots && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-base"
        >
          <h2 className="text-white font-bold mb-4">اسلات‌های خالی</h2>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((slot) => {
              const isOccupied = profile?.slots?.[slot - 1]?.card;
              return (
                <div
                  key={slot}
                  className={`
                    bg-game-darker rounded-lg p-4 border-2 border-dashed
                    ${isOccupied ? 'border-green-500' : 'border-gray-700'}
                    text-center
                  `}
                >
                  <div className="text-4xl mb-2">
                    {isOccupied ? '✅' : '📦'}
                  </div>
                  <p className={`text-sm font-bold ${isOccupied ? 'text-green-400' : 'text-gray-400'}`}>
                    اسلات {slot}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* All Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card-base"
      >
        <h2 className="text-white font-bold mb-4">همه کارت‌ها ({availableCards.length})</h2>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="spinner w-12 h-12" />
          </div>
        ) : availableCards.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-6xl mb-4">🎴</div>
            <p>هنوز هیچ کارتی ندارید</p>
            <p className="text-sm mt-2">به فروشگاه بروید و پک خریداری کنید</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {availableCards.map((card) => (
              <div key={card.id}>
                <Card card={card} />
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Inventory;
