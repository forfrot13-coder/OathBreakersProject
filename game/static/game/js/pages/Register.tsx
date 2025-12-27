import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore, useNotificationStore } from '../store';
import Button from '../components/Button';
import { isValidEmail, isValidUsername, isValidPassword } from '../utils';

interface RegisterProps {
  onLoginClick: () => void;
}

const Register: React.FC<RegisterProps> = ({ onLoginClick }) => {
  const { register, isLoading, error, isAuthenticated } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = '/';
    }
  }, [isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!username || !email || !password) {
      addNotification({
        message: 'لطفاً تمام فیلدها را پر کنید',
        type: 'warning',
      });
      return;
    }

    if (!isValidUsername(username)) {
      addNotification({
        message: 'نام کاربری باید بین 3 تا 20 کاراکتر باشد و فقط شامل حروف انگلیسی، اعداد و زیرخط باشد',
        type: 'warning',
      });
      return;
    }

    if (!isValidEmail(email)) {
      addNotification({
        message: 'لطفاً یک ایمیل معتبر وارد کنید',
        type: 'warning',
      });
      return;
    }

    if (!isValidPassword(password)) {
      addNotification({
        message: 'رمز عبور باید حداقل 8 کاراکتر باشد',
        type: 'warning',
      });
      return;
    }

    if (password !== confirmPassword) {
      addNotification({
        message: 'رمز عبور و تکرار آن یکسان نیستند',
        type: 'warning',
      });
      return;
    }

    try {
      await register(username, email, password);
      addNotification({
        message: 'ثبت‌نام با موفقیت انجام شد',
        type: 'success',
      });
      window.location.href = '/';
    } catch (error) {
      addNotification({
        message: error instanceof Error ? error.message : 'خطا در ثبت‌نام',
        type: 'error',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12">
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
          <p className="text-gray-400">ساخت حساب کاربری جدید</p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-2">نام کاربری</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field"
              placeholder="نام کاربری (3-20 کاراکتر)"
              autoComplete="username"
            />
            {username && !isValidUsername(username) && (
              <p className="text-red-400 text-xs mt-1">
                نام کاربری باید بین 3 تا 20 کاراکتر باشد
              </p>
            )}
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">ایمیل</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="example@email.com"
              autoComplete="email"
            />
            {email && !isValidEmail(email) && (
              <p className="text-red-400 text-xs mt-1">
                لطفاً یک ایمیل معتبر وارد کنید
              </p>
            )}
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">رمز عبور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="حداقل 8 کاراکتر"
              autoComplete="new-password"
            />
            {password && !isValidPassword(password) && (
              <p className="text-red-400 text-xs mt-1">
                رمز عبور باید حداقل 8 کاراکتر باشد
              </p>
            )}
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">تکرار رمز عبور</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field"
              placeholder="تکرار رمز عبور"
              autoComplete="new-password"
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="text-red-400 text-xs mt-1">
                رمز عبور و تکرار آن یکسان نیستند
              </p>
            )}
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
            ثبت‌نام
          </Button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            قبلاً ثبت‌نام کرده‌اید؟{' '}
            <button
              type="button"
              onClick={onLoginClick}
              className="text-game-accent hover:text-game-accent-hover font-bold transition-colors"
            >
              وارد شوید
            </button>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-700 text-center">
          <p className="text-gray-500 text-sm">
            با ثبت‌نام، شما{' '}
            <a href="#" className="text-game-accent hover:underline">
              شرایط استفاده
            </a>{' '}
            و{' '}
            <a href="#" className="text-game-accent hover:underline">
              حریم خصوصی
            </a>{' '}
            را می‌پذیرید
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
