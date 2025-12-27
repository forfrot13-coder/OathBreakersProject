'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { createErrorReport, logError } from '@/lib/errorHandler';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    logError(error, { componentStack: errorInfo.componentStack });

    try {
      const report = createErrorReport(error, { componentStack: errorInfo.componentStack });
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('lastCrashReport', JSON.stringify(report));
      }
    } catch {
      // ignore
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    return (
      <motion.div className="min-h-screen flex items-center justify-center bg-dark">
        <div className="text-center p-8">
          <h1 className="text-4xl font-bold mb-4">💥 خطا رخ داد</h1>
          <p className="text-gray-400 mb-6">{this.state.error?.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-primary hover:bg-primary-dark rounded-lg text-white font-bold"
          >
            بازگذاری صفحه
          </button>
        </div>
      </motion.div>
    );
  }
}
