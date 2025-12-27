import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, useNotificationStore } from '../store';
import Card from '../components/Card';
import Button from '../components/Button';
import { formatCurrency, formatNumber } from '../utils';

const Marketplace: React.FC = () => {
  const { marketListings, fetchMarketListings, buyListing, isLoading } = useGameStore();
  const { addNotification } = useNotificationStore();
  const [selectedListing, setSelectedListing] = useState<number | null>(null);

  useEffect(() => {
    fetchMarketListings();
  }, [fetchMarketListings]);

  const handleBuyListing = async (listingId: number) => {
    try {
      await buyListing(listingId);
      addNotification({
        message: 'خرید با موفقیت انجام شد',
        type: 'success',
      });
      setSelectedListing(null);
    } catch (error) {
      addNotification({
        message: 'خطا در خرید',
        type: 'error',
      });
    }
  };

  const activeListings = marketListings.filter((l) => l.is_active);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">بازار سیاه</h1>
        <p className="text-gray-400">خرید و فروش کارت با Vow Fragments</p>
      </div>

      {/* Listings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-base"
      >
        <h2 className="text-white font-bold mb-4">آگهی‌های فعال ({activeListings.length})</h2>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="spinner w-12 h-12" />
          </div>
        ) : activeListings.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-6xl mb-4">🏪</div>
            <p>هیچ آگهی فعالی وجود ندارد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeListings.map((listing) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card-base"
              >
                <Card card={listing.card_instance} showSerial={false} />
                <div className="mt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">فروشنده:</span>
                    <span className="text-white font-medium">{listing.seller_name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">قیمت:</span>
                    <span className="text-indigo-400 font-bold text-lg">
                      {formatCurrency(listing.price, 'FRAGMENTS')}
                    </span>
                  </div>
                  <div className="text-gray-400 text-xs">
                    {formatNumber(Math.floor((Date.now() - new Date(listing.created_at).getTime()) / 1000 / 60))} دقیقه پیش
                  </div>
                  <Button
                    variant="primary"
                    fullWidth
                    isLoading={isLoading && selectedListing === listing.id}
                    onClick={() => {
                      setSelectedListing(listing.id);
                      handleBuyListing(listing.id);
                    }}
                  >
                    خرید
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Marketplace;
