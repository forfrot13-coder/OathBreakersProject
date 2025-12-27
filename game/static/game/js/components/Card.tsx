import React from 'react';
import { motion } from 'framer-motion';
import type { CardInstance } from '../types';
import { getRarityClass, getRarityBorderColor, getRarityGlow, formatNumber } from '../utils';

interface CardProps {
  card: CardInstance;
  onClick?: () => void;
  isSelectable?: boolean;
  isSelected?: boolean;
  showSerial?: boolean;
}

export const Card: React.FC<CardProps> = ({
  card,
  onClick,
  isSelectable = false,
  isSelected = false,
  showSerial = true,
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className={`
        game-card relative overflow-hidden
        ${getRarityBorderColor(card.rarity)}
        ${getRarityGlow(card.rarity)}
        ${isSelectable ? 'cursor-pointer' : ''}
        ${isSelected ? 'ring-2 ring-game-accent' : ''}
        ${card.is_listed_in_market ? 'opacity-60' : ''}
      `}
    >
      {/* Card Image */}
      {card.image ? (
        <img
          src={card.image}
          alt={card.card_name}
          className="w-full h-48 object-cover bg-game-darker"
        />
      ) : (
        <div className="w-full h-48 bg-game-darker flex items-center justify-center">
          <span className="text-6xl">🎴</span>
        </div>
      )}

      {/* Card Info */}
      <div className="p-4">
        <h3 className="text-white font-bold text-lg mb-2 truncate">{card.card_name}</h3>
        <div className="flex justify-between items-center">
          <span className={`text-xs ${getRarityClass(card.rarity)}`}>
            {card.rarity}
          </span>
          <span className="text-yellow-400 text-sm">
            +{formatNumber(card.mining_rate)}/s
          </span>
        </div>
        {showSerial && (
          <div className="mt-2 text-gray-400 text-xs">
            #{card.serial_number}
          </div>
        )}
        {card.is_listed_in_market && (
          <div className="mt-2 text-red-400 text-xs font-bold">
            در بازار
          </div>
        )}
      </div>

      {/* Rarity Glow Effect */}
      <div className={`absolute inset-0 pointer-events-none ${getRarityGlow(card.rarity)}`} />
    </motion.div>
  );
};

export default Card;
