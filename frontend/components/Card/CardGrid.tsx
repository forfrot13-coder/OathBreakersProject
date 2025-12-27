'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import CardDisplay from '../Game/Card/CardDisplay';
import type { Card } from '@/store/gameStore';
import { calculateCardRank } from '@/lib/utils';

type SortKey = 'newest' | 'name' | 'mining' | 'rank' | 'rarity';

interface CardGridProps {
  cards: Card[];
  onCardClick?: (card: Card) => void;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';

  enableSearch?: boolean;
  enableFilters?: boolean;
  enableSorting?: boolean;
  pageSize?: number;
}

export default function CardGrid({
  cards,
  onCardClick,
  showDetails = true,
  size = 'md',
  enableSearch = false,
  enableFilters = false,
  enableSorting = false,
  pageSize = 50,
}: CardGridProps) {
  const [query, setQuery] = useState('');
  const [rarityFilter, setRarityFilter] = useState<string>('ALL');
  const [sortKey, setSortKey] = useState<SortKey>('newest');
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    let result = cards;

    if (q) {
      result = result.filter(
        (c) => c.card_name.toLowerCase().includes(q) || String(c.serial_number).includes(q)
      );
    }

    if (rarityFilter !== 'ALL') {
      result = result.filter((c) => c.rarity === rarityFilter);
    }

    if (enableSorting) {
      result = [...result].sort((a, b) => {
        switch (sortKey) {
          case 'name':
            return a.card_name.localeCompare(b.card_name);
          case 'mining':
            return b.mining_rate - a.mining_rate;
          case 'rank':
            return calculateCardRank(b) - calculateCardRank(a);
          case 'rarity':
            return String(b.rarity).localeCompare(String(a.rarity));
          case 'newest':
          default:
            return b.id - a.id;
        }
      });
    }

    return result;
  }, [cards, enableSorting, query, rarityFilter, sortKey]);

  const visible = filtered.slice(0, visibleCount);

  useEffect(() => {
    setVisibleCount(pageSize);
  }, [pageSize, filtered.length]);

  useEffect(() => {
    if (!sentinelRef.current) return;

    const el = sentinelRef.current;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((n) => Math.min(n + pageSize, filtered.length));
        }
      },
      { rootMargin: '400px' }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [pageSize, filtered.length]);

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
    <div className="space-y-4">
      {(enableSearch || enableFilters || enableSorting) && (
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          {enableSearch && (
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="جستجوی نام/شماره..."
              className="w-full md:w-80 px-4 py-2 bg-tertiary border border-primary/20 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          )}

          <div className="flex flex-wrap gap-3">
            {enableFilters && (
              <select
                value={rarityFilter}
                onChange={(e) => setRarityFilter(e.target.value)}
                className="px-4 py-2 bg-tertiary border border-primary/20 rounded-xl"
              >
                <option value="ALL">همه rarity</option>
                <option value="COMMON">COMMON</option>
                <option value="RARE">RARE</option>
                <option value="EPIC">EPIC</option>
                <option value="LEGENDARY">LEGENDARY</option>
              </select>
            )}

            {enableSorting && (
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                className="px-4 py-2 bg-tertiary border border-primary/20 rounded-xl"
              >
                <option value="newest">جدیدترین</option>
                <option value="name">نام</option>
                <option value="mining">نرخ استخراج</option>
                <option value="rank">رتبه</option>
                <option value="rarity">Rarity</option>
              </select>
            )}

            <div className="text-sm text-muted flex items-center px-2">
              {filtered.length.toLocaleString('fa-IR')} کارت
            </div>
          </div>
        </div>
      )}

      <div className="card-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {visible.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(index, 10) * 0.03 }}
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

      <div ref={sentinelRef} />

      {visibleCount < filtered.length && (
        <div className="text-center text-sm text-muted">درحال بارگذاری...</div>
      )}
    </div>
  );
}
