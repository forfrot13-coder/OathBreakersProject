import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore, useGameStore, useNotificationStore } from '../store';
import Button from '../components/Button';
import { formatNumber } from '../utils';
import { LogoutIcon } from '../components/Icons';

const Profile: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { profile, avatars, fetchProfile, fetchAvatars, updateProfile, isLoading } = useGameStore();
  const { addNotification } = useNotificationStore();
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null);

  useEffect(() => {
    fetchProfile();
    fetchAvatars();
  }, [fetchProfile, fetchAvatars]);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '');
      setSelectedAvatar(profile.avatar_id ?? null);
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    try {
      await updateProfile({ username, avatar_id: selectedAvatar });
      addNotification({
        message: 'پروفایل با موفقیت بروزرسانی شد',
        type: 'success',
      });
    } catch (error) {
      addNotification({
        message: 'خطا در بروزرسانی پروفایل',
        type: 'error',
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/login/';
    } catch (error) {
      addNotification({
        message: 'خطا در خروج',
        type: 'error',
      });
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">در حال بارگذاری...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">پروفایل</h1>
        <p className="text-gray-400">اطلاعات حساب کاربری</p>
      </div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-base"
      >
        <div className="flex items-center gap-6 mb-6">
          <div className="w-24 h-24 rounded-full bg-game-darker flex items-center justify-center overflow-hidden border-4 border-game-accent">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-5xl">👤</span>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{profile.username}</h2>
            <p className="text-gray-400">سطح {formatNumber(profile.level)}</p>
            <p className="text-sm text-gray-500 mt-1">
              عضو از: {new Date(profile.created_at || Date.now()).toLocaleDateString('fa-IR')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-game-darker rounded-lg p-4 text-center">
            <p className="text-gray-400 text-sm">کارت‌ها</p>
            <p className="text-2xl font-bold text-white">{formatNumber(profile.total_cards)}</p>
          </div>
          <div className="bg-game-darker rounded-lg p-4 text-center">
            <p className="text-gray-400 text-sm">رتبه</p>
            <p className="text-2xl font-bold text-game-accent">#{formatNumber(profile.rank)}</p>
          </div>
          <div className="bg-game-darker rounded-lg p-4 text-center">
            <p className="text-gray-400 text-sm">XP</p>
            <p className="text-2xl font-bold text-green-400">{formatNumber(profile.xp || 0)}</p>
          </div>
          <div className="bg-game-darker rounded-lg p-4 text-center">
            <p className="text-gray-400 text-sm">نرخ استخراج</p>
            <p className="text-2xl font-bold text-yellow-400">
              +{formatNumber(profile.current_mining_rate)}/s
            </p>
          </div>
        </div>
      </motion.div>

      {/* Edit Profile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card-base"
      >
        <h3 className="text-white font-bold mb-4">ویرایش پروفایل</h3>
        
        <div className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">نام کاربری</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field"
              placeholder="نام کاربری جدید"
            />
          </div>

          {/* Avatar Selection */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">آواتار</label>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
              {avatars.map((avatar) => (
                <button
                  key={avatar.id}
                  onClick={() => setSelectedAvatar(avatar.id)}
                  className={`
                    relative aspect-square rounded-lg overflow-hidden border-2 transition-all
                    ${selectedAvatar === avatar.id
                      ? 'border-game-accent ring-2 ring-game-accent/50'
                      : 'border-gray-700 hover:border-gray-500'
                    }
                  `}
                >
                  <img
                    src={avatar.image_url}
                    alt={avatar.name}
                    className="w-full h-full object-cover"
                  />
                  {selectedAvatar === avatar.id && (
                    <div className="absolute inset-0 bg-game-accent/20 flex items-center justify-center">
                      <span className="text-white text-2xl">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <Button
            variant="primary"
            fullWidth
            isLoading={isLoading}
            onClick={handleSaveProfile}
          >
            ذخیره تغییرات
          </Button>
        </div>
      </motion.div>

      {/* Logout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Button
          variant="danger"
          fullWidth
          onClick={handleLogout}
        >
          <span className="flex items-center gap-2">
            <LogoutIcon className="w-5 h-5" />
            خروج از حساب
          </span>
        </Button>
      </motion.div>
    </div>
  );
};

export default Profile;
