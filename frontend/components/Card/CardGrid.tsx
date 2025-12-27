'use client';

import { motion } from 'framer-motion';
import CardDisplay from '../Game/Card/CardDisplay';
import { Card } from '@/store/gameStore';

interface CardGridProps {
  cards: Card[];
  onCardClick?: (card: Card) => void;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function CardGrid({
  cards,
  onCardClick,
  showDetails = true,
  size = 'md',
}: CardGridProps) {
  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-6xl mb-4">🎴</div>
        <h3 className="text-xl font-semibold mb-2">هیچ کارتی وجود ندارد</h3>
        <p className="text-muted">هنوز کارتی ندارید. از فروشگاه کارت بخرید!</p>
      </div>
    );
  }

  return (
    <div className="card-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <CardDisplay
            card={card}
            onClick={() => onCardClick?.(card)}
            showDetails={showDetails}
            size={size}
          />
        </motion.div>
      ))}
    </div>
  );
}
