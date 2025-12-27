'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getRarityColor } from '@/lib/utils';
import type { Card } from '@/store/gameStore';
import CardDisplay from '../Card/CardDisplay';
import { triggerConfetti } from '@/lib/effects';
import { useSoundStore } from '@/store/soundStore';

interface PackOpeningProps {
  packName: string;
  packRarity: string;
  onOpen: () => Promise<Card[]>;
  isOpening: boolean;
}

export default function PackOpening({ packName, packRarity, onOpen, isOpening }: PackOpeningProps) {
  const [revealedCards, setRevealedCards] = useState<Card[]>([]);
  const [currentCard, setCurrentCard] = useState(0);
  const playEffect = useSoundStore((s) => s.playEffect);

  useEffect(() => {
    if (revealedCards.length === 0) return;
    const card = revealedCards[currentCard];
    if (card?.rarity === 'LEGENDARY') {
      triggerConfetti();
      playEffect('success');
    } else {
      playEffect('cardFlip');
    }
  }, [currentCard, playEffect, revealedCards]);

  const handleOpen = async () => {
    playEffect('packOpen');
    const cards = await onOpen();
    setRevealedCards(cards);
    setCurrentCard(0);
  };

  const handleNextCard = () => {
    if (currentCard < revealedCards.length - 1) {
      setCurrentCard((c) => c + 1);
    }
  };

  const handleFinish = () => {
    setRevealedCards([]);
    setCurrentCard(0);
  };

  if (revealedCards.length > 0) {
    const card = revealedCards[currentCard];
    const rarityColor = getRarityColor(card.rarity);
    const isLastCard = currentCard === revealedCards.length - 1;

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={card.id}
          className="pack-opening flex flex-col items-center gap-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          <motion.div
            className="relative"
            initial={{ rotateY: 0 }}
            animate={{ rotateY: 360 }}
            transition={{ duration: 0.7 }}
          >
            <CardDisplay card={card} showDetails={false} size="lg" flippable={false} />
          </motion.div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <motion.div
              className="text-6xl mb-4"
              style={{ color: rarityColor, textShadow: `0 0 20px ${rarityColor}` }}
            >
              {card.rarity === 'LEGENDARY' && '🏆'}
              {card.rarity === 'EPIC' && '✨'}
              {card.rarity === 'RARE' && '⭐'}
              {card.rarity === 'COMMON' && '💫'}
            </motion.div>
            <h2 className="text-3xl font-bold mb-2">{card.card_name}</h2>
            <p className="text-xl font-semibold mb-4" style={{ color: rarityColor }}>
              {card.rarity}
            </p>
            <p className="text-muted">کارت #{currentCard + 1} از {revealedCards.length}</p>
          </motion.div>

          <motion.button
            onClick={isLastCard ? handleFinish : handleNextCard}
            className="w-full max-w-xs px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-lg rounded-xl transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {isLastCard ? 'اتمام 🎉' : 'کارت بعدی 👉'}
          </motion.button>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <motion.div
      className="pack-opening flex flex-col items-center justify-center min-h-[400px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div className="relative mb-8" whileHover={{ scale: 1.05, rotate: 5 }} whileTap={{ scale: 0.95 }}>
        <div
          className="w-64 h-80 rounded-2xl flex items-center justify-center text-8xl shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            border: '4px solid rgba(255,255,255,0.2)',
          }}
        >
          📦
        </div>
        <motion.div
          className="absolute inset-0 rounded-2xl"
          animate={{
            boxShadow: [
              '0 0 20px rgba(99, 102, 241, 0.3)',
              '0 0 40px rgba(99, 102, 241, 0.5)',
              '0 0 20px rgba(99, 102, 241, 0.3)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">{packName}</h2>
        <p className="text-muted">شامل کارت‌های {packRarity} و بالاتر</p>
      </div>

      <motion.button
        onClick={handleOpen}
        disabled={isOpening}
        className="w-full max-w-xs px-12 py-5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold text-xl rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        whileHover={{ scale: isOpening ? 1 : 1.05 }}
        whileTap={{ scale: isOpening ? 1 : 0.95 }}
        animate={isOpening ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        {isOpening ? (
          <span className="flex items-center gap-3">
            <span className="inline-block w-6 h-6 border-2 border-white border-t-transparent rounded-full spin" />
            درحال باز کردن...
          </span>
        ) : (
          '🎁 باز کردن پک'
        )}
      </motion.button>
    </motion.div>
  );
}
