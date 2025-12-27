'use client';

import { motion } from 'framer-motion';
import { cn, formatNumber } from '@/lib/utils';

interface CurrencyDisplayProps {
  coins: number;
  gems: number;
  fragments: number;
  showLabels?: boolean;
  compact?: boolean;
  animate?: boolean;
}

export default function CurrencyDisplay({
  coins,
  gems,
  fragments,
  showLabels = false,
  compact = false,
  animate = true,
}: CurrencyDisplayProps) {
  const currencies = [
    { icon: '🪙', amount: coins, label: 'سکه', color: 'from-yellow-600 to-amber-600' },
    { icon: '💎', amount: gems, label: 'جواهر', color: 'from-blue-600 to-cyan-600' },
    { icon: '🔮', amount: fragments, label: 'قطعه', color: 'from-purple-600 to-pink-600' },
  ];

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        {currencies.map((currency) => (
          <motion.div
            key={currency.label}
            className="flex items-center gap-2 bg-secondary/50 px-3 py-2 rounded-lg min-h-[44px]"
            whileHover={{ scale: 1.04 }}
            title={currency.label}
          >
            <span className="text-xl">{currency.icon}</span>
            <span className="font-semibold text-sm">{formatNumber(currency.amount, { compact: true })}</span>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      {currencies.map((currency, index) => (
        <motion.div
          key={currency.label}
          className="relative flex items-center gap-2"
          initial={animate ? { opacity: 0, y: -10 } : undefined}
          animate={animate ? { opacity: 1, y: 0 } : undefined}
          transition={{ delay: index * 0.08 }}
        >
          <div
            className={cn('flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r min-h-[44px]', currency.color)}
            title={currency.label}
          >
            <motion.span
              className="text-2xl"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
            >
              {currency.icon}
            </motion.span>
            <div className="flex flex-col">
              <motion.span
                key={currency.amount}
                className="font-bold text-white text-lg"
                initial={animate ? { scale: 1.15 } : undefined}
                animate={animate ? { scale: 1 } : undefined}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                {formatNumber(currency.amount, { compact: false })}
              </motion.span>
              {showLabels && <span className="text-xs text-white/80">{currency.label}</span>}
            </div>
          </div>

          <motion.div
            className={cn('absolute inset-0 blur-xl opacity-30 bg-gradient-to-r', currency.color)}
            animate={{ opacity: [0.25, 0.45, 0.25] }}
            transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
          />
        </motion.div>
      ))}
    </div>
  );
}
