'use client';

import type { MarketListing, Rarity } from '@/lib/types';
import { useMemo } from 'react';

interface PriceAnalyticsProps {
  listings: MarketListing[];
}

export default function PriceAnalytics({ listings }: PriceAnalyticsProps) {
  const stats = useMemo(() => {
    const byRarity: Record<string, number[]> = {};
    listings.forEach((l) => {
      const r = l.card_instance.rarity as Rarity;
      byRarity[r] = byRarity[r] ?? [];
      byRarity[r].push(l.price);
    });

    const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / Math.max(1, arr.length);

    return Object.entries(byRarity).map(([rarity, prices]) => ({
      rarity,
      count: prices.length,
      avg: Math.round(avg(prices)),
      min: Math.min(...prices),
      max: Math.max(...prices),
    }));
  }, [listings]);

  if (stats.length === 0) {
    return <div className="text-sm text-muted">داده‌ای برای تحلیل موجود نیست.</div>;
  }

  return (
    <div className="bg-secondary/50 rounded-xl p-4 border border-primary/20">
      <h3 className="font-bold mb-3">تحلیل قیمت</h3>
      <div className="space-y-2 text-sm">
        {stats.map((s) => (
          <div key={s.rarity} className="flex items-center justify-between">
            <span className="text-muted">{s.rarity}</span>
            <span className="font-semibold">avg {s.avg} • {s.count} listings</span>
          </div>
        ))}
      </div>
    </div>
  );
}
