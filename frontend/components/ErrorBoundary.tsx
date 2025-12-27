'use client';

import React from 'react';
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

  private reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-900/10 p-6">
        <h2 className="text-xl font-bold text-red-300 mb-2">مشکلی پیش آمد</h2>
        <p className="text-sm text-muted mb-4">
          یک خطای غیرمنتظره رخ داد. می‌توانید صفحه را دوباره بارگذاری کنید یا به داشبورد برگردید.
        </p>

        {this.state.error?.message ? (
          <pre className="text-xs whitespace-pre-wrap bg-black/30 rounded-xl p-3 mb-4 text-red-200">
            {this.state.error.message}
          </pre>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button
            onClick={this.reset}
            className="px-4 py-2 rounded-xl bg-secondary/60 hover:bg-secondary/80 transition-colors"
          >
            تلاش مجدد
          </button>
          <button
            onClick={() => (window.location.href = '/game/dashboard')}
            className="px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary-dark transition-colors"
          >
            رفتن به داشبورد
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-xl bg-tertiary hover:bg-tertiary/70 transition-colors"
          >
            رفرش
          </button>
        </div>
      </div>
    );
  }
}
