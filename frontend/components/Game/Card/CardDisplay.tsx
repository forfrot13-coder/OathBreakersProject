'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { calculateCardRank, getRarityColor, getRarityGradient } from '@/lib/utils';
import type { Card } from '@/store/gameStore';
import { useSoundStore } from '@/store/soundStore';

interface CardDisplayProps {
  card: Card;
  onClick?: () => void;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
  flippable?: boolean;
}

export default function CardDisplay({
  card,
  onClick,
  showDetails = true,
  size = 'md',
  flippable = false,
}: CardDisplayProps) {
  const playEffect = useSoundStore((s) => s.playEffect);
  const [flipped, setFlipped] = useState(false);

  const rarityColor = getRarityColor(card.rarity);
  const rarityGradient = getRarityGradient(card.rarity);

  const rank = useMemo(() => calculateCardRank(card), [card]);

  const sizeStyles: Record<string, string> = {
    sm: 'w-32 h-44',
    md: 'w-48 h-64',
    lg: 'w-64 h-80',
  };

  return (
    <motion.div
      className={`card-container relative ${sizeStyles[size]} cursor-pointer [perspective:1000px]`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => playEffect('cardHover')}
      onClick={() => {
        if (flippable) {
          playEffect('cardFlip');
          setFlipped((v) => !v);
          return;
        }
        onClick?.();
      }}
      style={{
        borderRadius: '12px',
        overflow: 'hidden',
        background: rarityGradient,
        boxShadow: `0 4px 20px ${rarityColor}40`,
        border: `2px solid ${rarityColor}`,
      }}
    >
      <motion.div
        className="absolute inset-0"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 180, damping: 18 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* FRONT */}
        <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden' }}>
          <div
            className="absolute inset-0 pointer-events-none opacity-0 hover:opacity-100 transition-opacity"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }}
          />

          {card.rarity === 'LEGENDARY' && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
              transition={{ duration: 2, repeat: Infinity, repeatType: 'loop' }}
              style={{
                background:
                  'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                backgroundSize: '200% 100%',
              }}
            />
          )}

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
              <div className="flex items-center justify-center h-full text-4xl">🎴</div>
            )}

            <div
              className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: rarityColor }}
            >
              {card.rarity}
            </div>

            <div className="absolute bottom-2 left-2 px-2 py-1 rounded-lg bg-black/40 text-[10px] text-white">
              Rank: {rank}
            </div>
          </div>

          {showDetails && (
            <div className="relative p-3 h-2/5 flex flex-col justify-between bg-black/40 backdrop-blur-sm">
              <div>
                <h3 className="font-bold text-white text-sm md:text-base truncate">{card.card_name}</h3>
                <p className="text-xs text-muted">#{card.serial_number}</p>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-amber-400 flex items-center gap-1">⛏️ {card.mining_rate}/ساعت</span>
                <div className="flex items-center gap-2">
                  {card.equipment?.length ? <span className="text-sky-300">🧩 {card.equipment.length}</span> : null}
                  {card.is_listed_in_market ? <span className="text-green-400">🏷️ برای فروش</span> : null}
                </div>
              </div>
            </div>
          )}

          <motion.div
            className="absolute inset-0 pointer-events-none rounded-xl"
            whileHover={{ boxShadow: `0 0 30px ${rarityColor}80` }}
            style={{ boxShadow: `0 0 20px ${rarityColor}40` }}
          />
        </div>

        {/* BACK */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-md p-4"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="h-full flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold">{card.card_name}</h3>
              <p className="text-sm text-muted mt-1">#{card.serial_number}</p>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted">Rarity</span>
                <span style={{ color: rarityColor }} className="font-semibold">
                  {card.rarity}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Mining</span>
                <span className="font-semibold">⛏️ {card.mining_rate}/h</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Rank</span>
                <span className="font-semibold">{rank}</span>
              </div>
            </div>

            <div className="text-xs text-muted">برای برگشت کلیک کنید</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
