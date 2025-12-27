'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import toast from 'react-hot-toast';
import CardGrid from '@/components/Card/CardGrid';
import CardDisplay from '@/components/Game/Card/CardDisplay';
import Modal from '@/components/Common/Modal';
import Button from '@/components/Common/Button';
import type { Card, Rarity } from '@/store/gameStore';

export default function InventoryPage() {
  const { cards, fetchCards, listCard, isLoading } = useGameStore();
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState<'COINS' | 'GEMS' | 'FRAGMENTS'>('COINS');
  const [isListing, setIsListing] = useState(false);
  const [filterRarity, setFilterRarity] = useState<Rarity | 'ALL'>('ALL');

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const handleCardClick = (card: Card) => {
    setSelectedCard(card);
    setIsModalOpen(true);
  };

  const handleListCard = async () => {
    if (!selectedCard) return;

    const priceNum = parseInt(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error('قیمت معتبر نیست');
      return;
    }

    setIsListing(true);
    try {
      await listCard(selectedCard.id, priceNum, currency);
      toast.success('کارت با موفقیت در بازار ثبت شد! 🎉');
      setIsModalOpen(false);
      setPrice('');
      fetchCards();
    } catch (error: any) {
      toast.error(error.message || 'خطا در ثبت کارت در بازار');
    } finally {
      setIsListing(false);
    }
  };

  const filteredCards = filterRarity === 'ALL'
    ? cards
    : cards.filter(card => card.rarity === filterRarity);

  return (
    <div className="inventory space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">📦 موجودی کارت‌ها</h1>
          <p className="text-muted">
            {cards.length} کارت • {cards.filter(c => c.is_listed_in_market).length} کارت در بازار
          </p>
        </div>

        {/* Rarity Filter */}
        <div className="flex flex-wrap gap-2">
          {(['ALL', 'COMMON', 'RARE', 'EPIC', 'LEGENDARY'] as const).map((rarity) => (
            <button
              key={rarity}
              onClick={() => setFilterRarity(rarity)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterRarity === rarity
                  ? 'bg-primary text-white'
                  : 'bg-secondary/50 text-secondary hover:bg-secondary'
              }`}
            >
              {rarity === 'ALL' ? 'همه' : rarity}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="spinner" />
        </div>
      ) : (
        <CardGrid
          cards={filteredCards}
          onCardClick={handleCardClick}
          enableSearch
          enableSorting
          pageSize={60}
        />
      )}

      {/* Card Detail Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="جزئیات کارت"
        size="md"
      >
        {selectedCard && (
          <div className="space-y-6">
            <div className="flex justify-center">
              <CardDisplay card={selectedCard} showDetails={false} size="md" />
            </div>

            <div className="bg-black/30 rounded-xl p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted">نام کارت:</span>
                <span className="font-semibold">{selectedCard.card_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">شمارنده سریال:</span>
                <span className="font-semibold">#{selectedCard.serial_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">نادرتی:</span>
                <span className="font-semibold">{selectedCard.rarity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">نرخ استخراج:</span>
                <span className="font-semibold">⛏️ {selectedCard.mining_rate}/ساعت</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">وضعیت بازار:</span>
                <span className={`font-semibold ${selectedCard.is_listed_in_market ? 'text-green-400' : 'text-muted'}`}>
                  {selectedCard.is_listed_in_market ? 'برای فروش' : 'در موجودی'}
                </span>
              </div>
            </div>

            {!selectedCard.is_listed_in_market && (
              <div className="space-y-4 pt-4 border-t border-primary/20">
                <h3 className="font-bold">ثبت در بازار</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">ارز</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value as typeof currency)}
                      className="w-full px-4 py-3 bg-tertiary border border-primary/20 rounded-xl"
                    >
                      <option value="COINS">🪙 سکه</option>
                      <option value="GEMS">💎 جواهر</option>
                      <option value="FRAGMENTS">🔮 قطعه</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">قیمت</label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="قیمت را وارد کنید"
                      className="w-full px-4 py-3 bg-tertiary border border-primary/20 rounded-xl"
                    />
                  </div>
                  <Button
                    variant="primary"
                    onClick={handleListCard}
                    loading={isListing}
                    disabled={!price}
                    className="w-full"
                  >
                    ثبت در بازار
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
