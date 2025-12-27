'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const login = useAuthStore((state) => state.login);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const router = useRouter();

  useEffect(() => {
    initializeAuth();
    if (user) {
      router.push('/game/dashboard');
    }
  }, [user, router, initializeAuth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
      toast.success('خوش‌آمدید! 🎉');
      router.push('/game/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'نام‌کاربری یا رمز عبور اشتباه است');
    }
  };

  return (
    <motion.div
      className="bg-secondary rounded-2xl shadow-2xl p-8 border border-primary/20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          className="text-6xl mb-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
        >
          ⚔️
        </motion.div>
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          OathBreakers
        </h1>
        <p className="text-muted">به بازی خوش‌آمدید</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">نام‌کاربری</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="نام‌کاربری خود را وارد کنید"
            required
            className="w-full px-4 py-3 bg-tertiary border border-primary/20 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">رمز عبور</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="رمز عبور خود را وارد کنید"
            required
            className="w-full px-4 py-3 bg-tertiary border border-primary/20 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <motion.button
          type="submit"
          disabled={!username || !password || isLoading}
          className="w-full py-4 bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary-dark disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          whileHover={{ scale: !username || !password || isLoading ? 1 : 1.02 }}
          whileTap={{ scale: !username || !password || isLoading ? 1 : 0.98 }}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full spin" />
              درحال ورود...
            </span>
          ) : (
            'ورود به حساب'
          )}
        </motion.button>
      </form>

      {/* Footer */}
      <div className="mt-6 text-center">
        <p className="text-sm text-muted">
          حساب ندارید؟{' '}
          <Link href="/register" className="text-primary hover:underline font-medium">
            ثبت‌نام کنید
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
