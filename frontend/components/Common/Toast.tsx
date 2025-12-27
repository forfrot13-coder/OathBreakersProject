'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ToastProps {
  type?: 'success' | 'error' | 'info' | 'warning';
  message: ReactNode;
  onClose?: () => void;
}

export default function Toast({ type = 'info', message, onClose }: ToastProps) {
  const icons: Record<string, string> = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️',
  };

  const colors: Record<string, string> = {
    success: 'border-green-600 bg-green-900/50',
    error: 'border-red-600 bg-red-900/50',
    info: 'border-blue-600 bg-blue-900/50',
    warning: 'border-yellow-600 bg-yellow-900/50',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, y: -50 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: 100, y: -50 }}
      className={`toast flex items-start gap-3 p-4 rounded-lg border-2 shadow-lg ${colors[type]}`}
    >
      <span className="text-2xl">{icons[type]}</span>
      <div className="flex-1 text-sm">{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-muted hover:text-primary transition-colors"
        >
          ✕
        </button>
      )}
    </motion.div>
  );
}
