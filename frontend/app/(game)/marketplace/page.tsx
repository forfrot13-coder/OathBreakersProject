'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import CardDisplay from '@/components/Game/Card/CardDisplay';
import Button from '@/components/Common/Button';
import { Rarity } from '@/store/gameStore';

export default function MarketplacePage() {
  const { marketListings, fetchMarketListings, buyCard, isLoading } = useGameStore();
  const [selectedRarity, setSelectedRarity] = useState<Rarity | 'ALL'>('ALL');
  const [buyingId, setBuyingId] = useState<number | null>(null);

  useEffect(() => {
    fetchMarketListings();
  }, [fetchMarketListings]);

  const handleBuy = async (listingId: number) => {
    setBuyingId(listingId);
    try {
      await buyCard(listingId);
      toast.success('کارت با موفقیت خریداری شد! 🎉');
      fetchMarketListings();
    } catch (error: any) {
      toast.error(error.message || 'خطا در خرید کارت');
    } finally {
      setBuyingId(null);
    }
  };

  const filteredListings = selectedRarity === 'ALL'
    ? marketListings
    : marketListings.filter(listing => listing.card_instance.rarity === selectedRarity);

  return (
    <div className="marketplace space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">🛍️ بازار سیاه</h1>
          <p className="text-muted">{marketListings.length} آگهی فعال</p>
        </div>

        {/* Rarity Filter */}
        <div className="flex flex-wrap gap-2">
          {(['ALL', 'COMMON', 'RARE', 'EPIC', 'LEGENDARY'] as const).map((rarity) => (
            <button
              key={rarity}
              onClick={() => setSelectedRarity(rarity)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedRarity === rarity
                  ? 'bg-primary text-white'
                  : 'bg-secondary/50 text-secondary hover:bg-secondary'
              }`}
            >
              {rarity === 'ALL' ? 'همه' : rarity}
            </button>
          ))}
        </div>
      </div>

      {/* Listings Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="spinner" />
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h3 className="text-xl font-semibold mb-2">هیچ آگهی وجود ندارد</h3>
          <p className="text-muted">در حال حاضر هیچ کارتی در بازار موجود نیست</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing, index) => (
            <motion.div
              key={listing.id}
              className="bg-secondary/50 rounded-2xl p-6 border border-primary/20 hover:border-primary/50 transition-all"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02, y: -4 }}
            >
              {/* Card Display */}
              <div className="flex justify-center mb-4">
                <CardDisplay card={listing.card_instance} showDetails={false} size="md" />
              </div>

              {/* Card Details */}
              <div className="space-y-2 mb-4">
                <h3 className="font-bold text-lg text-center">{listing.card_instance.card_name}</h3>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">نادرتی:</span>
                  <span className="font-semibold">{listing.card_instance.rarity}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">نرخ استخراج:</span>
                  <span className="font-semibold">⛏️ {listing.card_instance.mining_rate}/ساعت</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">فروشنده:</span>
                  <span className="font-semibold">{listing.seller_name}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">زمان:</span>
                  <span className="font-semibold text-muted">
                    {new Date(listing.created_at).toLocaleDateString('fa-IR')}
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="bg-black/30 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-center gap-2 text-2xl font-bold">
                  <span>{listing.currency === 'COINS' ? '🪙' : listing.currency === 'GEMS' ? '💎' : '🔮'}</span>
                  <span>{listing.price.toLocaleString()}</span>
                </div>
              </div>

              {/* Buy Button */}
              <Button
                variant="primary"
                onClick={() => handleBuy(listing.id)}
                loading={buyingId === listing.id}
                className="w-full"
              >
                خرید کارت
              </Button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
