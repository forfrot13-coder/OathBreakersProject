'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { getRarityColor, getRarityGradient } from '@/lib/utils';
import { Card } from '@/store/gameStore';

interface CardDisplayProps {
  card: Card;
  onClick?: () => void;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function CardDisplay({ card, onClick, showDetails = true, size = 'md' }: CardDisplayProps) {
  const rarityColor = getRarityColor(card.rarity);
  const rarityGradient = getRarityGradient(card.rarity);

  const sizeStyles: Record<string, string> = {
    sm: 'w-32 h-44',
    md: 'w-48 h-64',
    lg: 'w-64 h-80',
  };

  return (
    <motion.div
      className={`card-container relative ${sizeStyles[size]} cursor-pointer`}
      whileHover={{ scale: 1.05, rotateY: 5 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      style={{
        borderRadius: '12px',
        overflow: 'hidden',
        background: rarityGradient,
        boxShadow: `0 4px 20px ${rarityColor}40`,
        border: `2px solid ${rarityColor}`,
      }}
    >
      {/* Shine Effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-0 hover:opacity-100 transition-opacity"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
        }}
      />

      {/* Legendary Shimmer */}
      {card.rarity === 'LEGENDARY' && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            backgroundPosition: ['200% 0', '-200% 0'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: 'loop',
          }}
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
            backgroundSize: '200% 100%',
          }}
        />
      )}

      {/* Card Image */}
      <div className="relative w-full h-3/5 bg-gradient-to-br from-gray-900 to-gray-800">
        {card.image ? (
          <Image
            src={card.image}
            alt={card.card_name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-4xl">
            🎴
          </div>
        )}

        {/* Rarity Badge */}
        <div
          className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold text-white"
          style={{ backgroundColor: rarityColor }}
        >
          {card.rarity}
        </div>
      </div>

      {/* Card Info */}
      {showDetails && (
        <div className="relative p-3 h-2/5 flex flex-col justify-between bg-black/40 backdrop-blur-sm">
          <div>
            <h3 className="font-bold text-white text-sm md:text-base truncate">
              {card.card_name}
            </h3>
            <p className="text-xs text-muted">#{card.serial_number}</p>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-amber-400 flex items-center gap-1">
              ⛏️ {card.mining_rate}/ساعت
            </span>
            {card.is_listed_in_market && (
              <span className="text-green-400">🏷️ برای فروش</span>
            )}
          </div>
        </div>
      )}

      {/* Glow Effect on Hover */}
      <motion.div
        className="absolute inset-0 pointer-events-none rounded-xl"
        whileHover={{
          boxShadow: `0 0 30px ${rarityColor}80`,
        }}
        style={{
          boxShadow: `0 0 20px ${rarityColor}40`,
        }}
      />
    </motion.div>
  );
}
