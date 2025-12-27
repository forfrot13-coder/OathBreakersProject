'use client';

import { useMemo, useState } from 'react';
import Modal from '@/components/Common/Modal';
import Button from '@/components/Common/Button';
import type { CardInstance, Currency } from '@/lib/types';
import { calculateMarketingPrice } from '@/lib/utils';

interface SellModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: CardInstance | null;
  onSell: (cardId: number, price: number, currency: Currency) => Promise<void>;
}

export default function SellModal({ isOpen, onClose, card, onSell }: SellModalProps) {
  const [currency, setCurrency] = useState<Currency>('COINS');
  const [price, setPrice] = useState('');
  const [isSubmitting, setSubmitting] = useState(false);

  const suggested = useMemo(() => (card ? calculateMarketingPrice(card, currency) : 0), [card, currency]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="فروش کارت" size="md">
      {!card ? (
        <div className="text-muted">کارتی انتخاب نشده است.</div>
      ) : (
        <div className="space-y-4">
          <div className="text-sm text-muted">پیشنهاد: {suggested}</div>

          <div>
            <label className="block text-sm font-medium mb-2">ارز</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
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
              placeholder={String(suggested)}
              className="w-full px-4 py-3 bg-tertiary border border-primary/20 rounded-xl"
            />
          </div>

          <Button
            variant="primary"
            className="w-full"
            loading={isSubmitting}
            onClick={async () => {
              const p = Number(price || suggested);
              if (!Number.isFinite(p) || p <= 0) return;

              setSubmitting(true);
              try {
                await onSell(card.id, p, currency);
                onClose();
              } finally {
                setSubmitting(false);
              }
            }}
          >
            ثبت آگهی
          </Button>
        </div>
      )}
    </Modal>
  );
}
