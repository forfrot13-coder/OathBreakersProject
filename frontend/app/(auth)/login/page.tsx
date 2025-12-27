'use client';

import { useMemo, useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Button from '@/components/Common/Button';
import { isValidPassword, isValidUsername } from '@/lib/utils';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({ username: false, password: false });

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

  const usernameValid = useMemo(() => isValidUsername(username), [username]);
  const passwordValid = useMemo(() => isValidPassword(password), [password]);

  const usernameError = touched.username && !usernameValid ? 'نام‌کاربری باید ۳ تا ۲۰ کاراکتر و فقط شامل حروف/اعداد باشد' : '';
  const passwordError = touched.password && !passwordValid ? 'رمز عبور باید حداقل ۸ کاراکتر و شامل حرف و عدد باشد' : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ username: true, password: true });

    if (!usernameValid || !passwordValid) {
      toast.error('اطلاعات وارد شده معتبر نیست');
      return;
    }

    try {
      await login(username, password);
      toast.success('خوش‌آمدید! 🎉');
      router.push('/game/dashboard');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'نام‌کاربری یا رمز عبور اشتباه است');
    }
  };

  return (
    <motion.div
      className="bg-secondary rounded-2xl shadow-2xl p-8 border border-primary/20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">نام‌کاربری</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, username: true }))}
            placeholder="نام‌کاربری خود را وارد کنید"
            required
            className="w-full px-4 py-3 bg-tertiary border border-primary/20 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
          {usernameError && <p className="mt-2 text-sm text-red-400">{usernameError}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">رمز عبور</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, password: true }))}
            placeholder="رمز عبور خود را وارد کنید"
            required
            className="w-full px-4 py-3 bg-tertiary border border-primary/20 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
          {passwordError && <p className="mt-2 text-sm text-red-400">{passwordError}</p>}
        </div>

        <Button
          type="submit"
          disabled={!username || !password || isLoading}
          loading={isLoading}
          loadingText="درحال ورود..."
          className="w-full py-4 bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary-dark text-white font-bold rounded-xl shadow-lg"
          ariaLabel="ورود"
        >
          ورود به حساب
        </Button>

        {/* Social login mockup */}
        <div className="pt-2">
          <div className="text-center text-xs text-muted mb-3">ورود با شبکه‌های اجتماعی (به زودی)</div>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="ghost"
              disabled
              className="w-full bg-tertiary/40 text-secondary"
              tooltip="به زودی"
            >
              Google
            </Button>
            <Button
              variant="ghost"
              disabled
              className="w-full bg-tertiary/40 text-secondary"
              tooltip="به زودی"
            >
              Discord
            </Button>
          </div>
        </div>
      </form>

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
