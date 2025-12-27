import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore, useNotificationStore } from '../store';
import Button from '../components/Button';

interface LoginProps {
  onRegisterClick: () => void;
}

const Login: React.FC<LoginProps> = ({ onRegisterClick }) => {
  const { login, isLoading, error, isAuthenticated } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = '/';
    }
  }, [isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      addNotification({
        message: 'لطفاً نام کاربری و رمز عبور را وارد کنید',
        type: 'warning',
      });
      return;
    }

    try {
      await login(username, password);
      addNotification({
        message: 'ورود با موفقیت انجام شد',
        type: 'success',
      });
      window.location.href = '/';
    } catch (error) {
      addNotification({
        message: error instanceof Error ? error.message : 'خطا در ورود',
        type: 'error',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        className="card-base max-w-md w-full"
      >
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎴</div>
          <h1 className="text-3xl font-bold text-white mb-2">OathBreakers</h1>
          <p className="text-gray-400">به بازی خوش آمدید</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-2">نام کاربری</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field"
              placeholder="نام کاربری خود را وارد کنید"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">رمز عبور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="رمز عبور خود را وارد کنید"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg"
            >
              {error}
            </motion.div>
          )}

          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
          >
            ورود
          </Button>
        </form>

        {/* Register Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            حساب کاربری ندارید؟{' '}
            <button
              type="button"
              onClick={onRegisterClick}
              className="text-game-accent hover:text-game-accent-hover font-bold transition-colors"
            >
              ثبت‌نام کنید
            </button>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-700 text-center">
          <p className="text-gray-500 text-sm">
            ورود به حساب به معنی پذیرش{' '}
            <a href="#" className="text-game-accent hover:underline">
              شرایط استفاده
            </a>{' '}
            و{' '}
            <a href="#" className="text-game-accent hover:underline">
              حریم خصوصی
            </a>{' '}
            است
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
