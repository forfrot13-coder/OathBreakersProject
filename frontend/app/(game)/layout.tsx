'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Layout/Navbar';
import Sidebar from '@/components/Layout/Sidebar';
import Footer from '@/components/Layout/Footer';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function GameLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const router = useRouter();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <div className="game-layout min-h-screen flex flex-col bg-primary">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-8">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
