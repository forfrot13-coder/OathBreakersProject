'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { href: '/game/dashboard', label: 'داشبورد', icon: '🏠' },
  { href: '/game/inventory', label: 'موجودی', icon: '📦' },
  { href: '/game/marketplace', label: 'بازار', icon: '🛍️' },
  { href: '/game/shop', label: 'فروشگاه', icon: '🏪' },
  { href: '/game/profile', label: 'پروفایل', icon: '👤' },
  { href: '/game/leaderboard', label: 'رتبه‌بندی', icon: '🏆' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar hidden lg:block w-64 bg-secondary/50 border-r border-primary/20 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
      <div className="p-4">
        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group"
              >
                {/* Active Background */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary/20 rounded-xl"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}

                {/* Content */}
                <div className="relative flex items-center gap-3">
                  <motion.span
                    className="text-2xl"
                    whileHover={{ rotate: 10, scale: 1.1 }}
                  >
                    {item.icon}
                  </motion.span>
                  <span
                    className={`font-medium ${
                      isActive ? 'text-primary' : 'text-secondary group-hover:text-primary'
                    } transition-colors`}
                  >
                    {item.label}
                  </span>
                </div>

                {/* Hover Glow */}
                {!isActive && (
                  <motion.div
                    className="absolute inset-0 bg-primary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                    whileHover={{ scale: 1.02 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Player Stats */}
        <div className="mt-8 p-4 bg-black/30 rounded-xl">
          <h3 className="text-sm font-semibold text-muted mb-3">آمار کلی</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary">سطح</span>
              <span className="text-sm font-bold text-primary">5</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary">کارت‌ها</span>
              <span className="text-sm font-bold text-primary">12</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary">برداشت‌ها</span>
              <span className="text-sm font-bold text-primary">3</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
