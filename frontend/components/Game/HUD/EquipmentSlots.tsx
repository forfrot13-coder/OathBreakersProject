'use client';

import type { Equipment, SlotType } from '@/lib/types';

interface EquipmentSlotsProps {
  slots: Partial<Record<SlotType, Equipment | null>>;
}

const slotLabels: Record<SlotType, string> = {
  HEAD: 'سر',
  CHEST: 'سینه',
  HANDS: 'دست',
  LEGS: 'پا',
  WEAPON: 'سلاح',
  ACCESSORY: 'اکسسوری',
};

export default function EquipmentSlots({ slots }: EquipmentSlotsProps) {
  return (
    <div className="bg-secondary/50 rounded-xl p-4 border border-primary/20">
      <h3 className="font-bold mb-3">تجهیزات</h3>
      <div className="grid grid-cols-2 gap-3">
        {(Object.keys(slotLabels) as SlotType[]).map((slot) => {
          const eq = slots[slot];
          return (
            <div key={slot} className="bg-black/30 rounded-lg p-3">
              <div className="text-xs text-muted mb-1">{slotLabels[slot]}</div>
              <div className="text-sm font-semibold truncate">{eq?.name ?? '—'}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
