'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

interface Action {
  href: string;
  label: string;
  icon: string;
}

interface QuickActionsProps {
  actions?: Action[];
}

const defaultActions: Action[] = [
  { href: '/game/shop', label: 'فروشگاه', icon: '📦' },
  { href: '/game/marketplace', label: 'بازار', icon: '🛍️' },
  { href: '/game/inventory', label: 'موجودی', icon: '🎴' },
  { href: '/game/leaderboard', label: 'رتبه‌بندی', icon: '🏆' },
];

export default function QuickActions({ actions = defaultActions }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {actions.map((a) => (
        <Link key={a.href} href={a.href}>
          <motion.div
            className="bg-secondary/50 rounded-xl p-4 border border-primary/20 hover:border-primary/50 transition-all cursor-pointer"
            whileHover={{ scale: 1.02, y: -2 }}
          >
            <div className="text-2xl mb-1">{a.icon}</div>
            <div className="font-semibold text-sm">{a.label}</div>
          </motion.div>
        </Link>
      ))}
    </div>
  );
}
