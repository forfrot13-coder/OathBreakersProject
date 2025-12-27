'use client';

import Modal from '@/components/Common/Modal';
import Button from '@/components/Common/Button';
import type { MarketListing } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface BuyModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: MarketListing | null;
  onBuy: (listingId: number) => Promise<void>;
  isBuying?: boolean;
}

export default function BuyModal({ isOpen, onClose, listing, onBuy, isBuying }: BuyModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="خرید کارت" size="md">
      {!listing ? (
        <div className="text-muted">آگهی‌ای انتخاب نشده است.</div>
      ) : (
        <div className="space-y-4">
          <div className="bg-black/30 rounded-xl p-4">
            <div className="font-bold mb-1">{listing.card_instance.card_name}</div>
            <div className="text-sm text-muted">فروشنده: {listing.seller_name}</div>
            <div className="text-lg font-bold mt-2">{formatCurrency(listing.price, listing.currency)}</div>
          </div>

          <Button
            variant="primary"
            className="w-full"
            loading={!!isBuying}
            onClick={async () => {
              await onBuy(listing.id);
              onClose();
            }}
          >
            تایید خرید
          </Button>
        </div>
      )}
    </Modal>
  );
}
