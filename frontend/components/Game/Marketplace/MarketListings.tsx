'use client';

import { useMemo, useState } from 'react';
import type { MarketListing, Rarity } from '@/lib/types';
import CardDisplay from '@/components/Game/Card/CardDisplay';
import Button from '@/components/Common/Button';
import { formatCurrency } from '@/lib/utils';

interface MarketListingsProps {
  listings: MarketListing[];
  onBuy?: (listingId: number) => Promise<void>;
  isBuyingId?: number | null;
}

export default function MarketListings({ listings, onBuy, isBuyingId }: MarketListingsProps) {
  const [rarity, setRarity] = useState<Rarity | 'ALL'>('ALL');
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return listings.filter((l) => {
      const matchRarity = rarity === 'ALL' ? true : l.card_instance.rarity === rarity;
      const matchQuery = query ? l.card_instance.card_name.toLowerCase().includes(query) : true;
      return matchRarity && matchQuery;
    });
  }, [listings, q, rarity]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="جستجو..."
          className="w-full md:w-80 px-4 py-2 bg-tertiary border border-primary/20 rounded-xl"
        />

        <select
          value={rarity}
          onChange={(e) => setRarity(e.target.value as Rarity | 'ALL')}
          className="px-4 py-2 bg-tertiary border border-primary/20 rounded-xl"
        >
          <option value="ALL">همه</option>
          <option value="COMMON">COMMON</option>
          <option value="RARE">RARE</option>
          <option value="EPIC">EPIC</option>
          <option value="LEGENDARY">LEGENDARY</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center text-muted py-12">آگهی‌ای یافت نشد</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((listing) => (
            <div
              key={listing.id}
              className="bg-secondary/50 rounded-2xl p-6 border border-primary/20 hover:border-primary/50 transition-all"
            >
              <div className="flex justify-center mb-4">
                <CardDisplay card={listing.card_instance} showDetails={false} size="md" />
              </div>

              <div className="space-y-2 mb-4 text-sm">
                <div className="font-bold text-center text-lg">{listing.card_instance.card_name}</div>
                <div className="flex items-center justify-between"><span className="text-muted">فروشنده</span><span>{listing.seller_name}</span></div>
                <div className="flex items-center justify-between"><span className="text-muted">قیمت</span><span className="font-bold">{formatCurrency(listing.price, listing.currency)}</span></div>
              </div>

              <Button
                variant="primary"
                className="w-full"
                loading={isBuyingId === listing.id}
                onClick={() => onBuy?.(listing.id)}
                disabled={!onBuy}
              >
                خرید
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
