'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import CurrencyDisplay from '@/components/Game/Currency/CurrencyDisplay';

export default function Navbar() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav className="navbar bg-secondary border-b border-primary/20 sticky top-0 z-40 backdrop-blur-lg bg-opacity-90">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link href="/game/dashboard" className="flex items-center gap-3">
            <motion.div
              className="text-3xl"
              whileHover={{ rotate: 10 }}
            >
              ⚔️
            </motion.div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              OathBreakers
            </h1>
          </Link>

          {/* Navigation Links */}
          {user && (
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/game/dashboard"
                className="text-secondary hover:text-primary transition-colors font-medium"
              >
                داشبورد
              </Link>
              <Link
                href="/game/inventory"
                className="text-secondary hover:text-primary transition-colors font-medium"
              >
                موجودی
              </Link>
              <Link
                href="/game/marketplace"
                className="text-secondary hover:text-primary transition-colors font-medium"
              >
                بازار
              </Link>
              <Link
                href="/game/shop"
                className="text-secondary hover:text-primary transition-colors font-medium"
              >
                فروشگاه
              </Link>
              <Link
                href="/game/leaderboard"
                className="text-secondary hover:text-primary transition-colors font-medium"
              >
                رتبه‌بندی
              </Link>
            </div>
          )}

          {/* User Section */}
          {user && (
            <div className="flex items-center gap-4">
              {/* Currency Display */}
              <div className="hidden lg:block">
                <CurrencyDisplay
                  coins={user?.profile?.coins ?? 0}
                  gems={user?.profile?.gems ?? 0}
                  fragments={user?.profile?.vow_fragments ?? 0}
                  compact
                />
              </div>

              {/* User Menu */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="font-semibold text-sm">{user?.username ?? 'کاربر'}</div>
                  <div className="text-xs text-muted">سطح {user?.profile?.level ?? 1}</div>
                </div>

                <motion.button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors text-sm font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  خروج
                </motion.button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
