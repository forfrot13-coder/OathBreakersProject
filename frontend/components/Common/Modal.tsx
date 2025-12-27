'use client';

import { ReactNode, useEffect, useId, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

let openModalCount = 0;

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnBackdrop = true,
  closeOnEscape = true,
}: ModalProps) {
  const titleId = useId();
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const active = document.activeElement as HTMLElement | null;

    const handleEscape = (e: KeyboardEvent) => {
      if (!closeOnEscape) return;
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);

    openModalCount += 1;
    if (openModalCount === 1) {
      document.body.style.overflow = 'hidden';
    }

    // Focus modal container for accessibility
    setTimeout(() => containerRef.current?.focus(), 0);

    return () => {
      document.removeEventListener('keydown', handleEscape);

      openModalCount = Math.max(0, openModalCount - 1);
      if (openModalCount === 0) {
        document.body.style.overflow = 'unset';
      }

      active?.focus?.();
    };
  }, [isOpen, closeOnEscape, onClose]);

  const sizeStyles: Record<string, string> = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={() => {
            if (closeOnBackdrop) onClose();
          }}
          role="presentation"
        >
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            ref={containerRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            className={`relative w-full ${sizeStyles[size]} bg-secondary rounded-2xl shadow-2xl p-6 outline-none`}
            initial={{ scale: 0.95, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 16 }}
            transition={{ duration: 0.18 }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 left-4 text-muted hover:text-primary transition-colors"
              aria-label="بستن"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {title && (
              <h2 id={titleId} className="text-2xl font-bold mb-6 pr-8">
                {title}
              </h2>
            )}

            <div className="max-h-[70vh] overflow-y-auto">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
