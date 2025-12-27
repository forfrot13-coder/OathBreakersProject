'use client';

import { useMemo, useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Button from '@/components/Common/Button';
import { isValidPassword, isValidUsername } from '@/lib/utils';

function passwordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[A-Za-z\p{L}]/u.test(password)) score += 1;
  if (/[^A-Za-z0-9\p{L}]/u.test(password)) score += 1;

  const label = score <= 1 ? 'ضعیف' : score === 2 ? 'متوسط' : score === 3 ? 'خوب' : 'قوی';
  const percent = (score / 4) * 100;
  const color = score <= 1 ? 'bg-red-500' : score === 2 ? 'bg-yellow-500' : score === 3 ? 'bg-green-500' : 'bg-emerald-500';

  return { score, label, percent, color };
}

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [touched, setTouched] = useState({ username: false, password: false, confirmPassword: false });

  const register = useAuthStore((state) => state.register);
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
  const passwordsMatch = password === confirmPassword;

  const strength = useMemo(() => passwordStrength(password), [password]);

  const usernameError = touched.username && !usernameValid ? 'نام‌کاربری باید ۳ تا ۲۰ کاراکتر و فقط شامل حروف/اعداد باشد' : '';
  const passwordError = touched.password && !passwordValid ? 'رمز عبور باید حداقل ۸ کاراکتر و شامل حرف و عدد باشد' : '';
  const confirmError = touched.confirmPassword && !passwordsMatch ? 'رمز عبور و تکرار آن یکسان نیست' : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ username: true, password: true, confirmPassword: true });

    if (!usernameValid || !passwordValid || !passwordsMatch) {
      toast.error('اطلاعات وارد شده معتبر نیست');
      return;
    }

    try {
      await register(username, password, confirmPassword);
      toast.success('حساب کاربری با موفقیت ساخته شد! 🎉');
      router.push('/game/dashboard');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'خطا در ثبت‌نام');
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
        <p className="text-muted">یک حساب جدید بسازید</p>
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

          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-muted mb-1">
              <span>قدرت رمز عبور</span>
              <span className="text-secondary">{strength.label}</span>
            </div>
            <div className="h-2 bg-black/30 rounded-full overflow-hidden">
              <div className={`h-full ${strength.color}`} style={{ width: `${strength.percent}%` }} />
            </div>
          </div>

          {passwordError && <p className="mt-2 text-sm text-red-400">{passwordError}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">تکرار رمز عبور</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, confirmPassword: true }))}
            placeholder="رمز عبور را دوباره وارد کنید"
            required
            className="w-full px-4 py-3 bg-tertiary border border-primary/20 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
          {confirmError && <p className="mt-2 text-sm text-red-400">{confirmError}</p>}
        </div>

        <Button
          type="submit"
          disabled={!username || !password || !confirmPassword || isLoading}
          loading={isLoading}
          loadingText="درحال ثبت‌نام..."
          className="w-full py-4 bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary-dark text-white font-bold rounded-xl shadow-lg"
        >
          ثبت‌نام
        </Button>

        {/* Social login mockup */}
        <div className="pt-2">
          <div className="text-center text-xs text-muted mb-3">ثبت‌نام با شبکه‌های اجتماعی (به زودی)</div>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="ghost" disabled className="w-full bg-tertiary/40 text-secondary" tooltip="به زودی">
              Google
            </Button>
            <Button variant="ghost" disabled className="w-full bg-tertiary/40 text-secondary" tooltip="به زودی">
              Discord
            </Button>
          </div>
        </div>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted">
          قبلاً ثبت‌نام کرده‌اید؟{' '}
          <Link href="/login" className="text-primary hover:underline font-medium">
            وارد شوید
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
