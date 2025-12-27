'use client';

import { motion } from 'framer-motion';

interface CurrencyDisplayProps {
  coins: number;
  gems: number;
  fragments: number;
  showLabels?: boolean;
  compact?: boolean;
}

export default function CurrencyDisplay({
  coins,
  gems,
  fragments,
  showLabels = false,
  compact = false,
}: CurrencyDisplayProps) {
  const currencies = [
    { icon: '🪙', amount: coins, label: 'سکه', color: 'from-yellow-600 to-amber-600' },
    { icon: '💎', amount: gems, label: 'gem', color: 'from-blue-600 to-cyan-600' },
    { icon: '🔮', amount: fragments, label: 'قطعه', color: 'from-purple-600 to-pink-600' },
  ];

  if (compact) {
    return (
      <div className="flex items-center gap-4">
        {currencies.map((currency) => (
          <motion.div
            key={currency.label}
            className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-lg"
            whileHover={{ scale: 1.05 }}
          >
            <span className="text-xl">{currency.icon}</span>
            <span className="font-semibold text-sm">
              {currency.amount.toLocaleString()}
            </span>
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
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          {/* Currency Badge */}
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r"
            style={{
              background: currency.color,
            }}
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
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                {currency.amount.toLocaleString()}
              </motion.span>
              {showLabels && (
                <span className="text-xs text-white/80">{currency.label}</span>
              )}
            </div>
          </div>

          {/* Glow Effect */}
          <motion.div
            className="absolute inset-0 blur-xl opacity-30"
            animate={{
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
            style={{
              background: currency.color,
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}
