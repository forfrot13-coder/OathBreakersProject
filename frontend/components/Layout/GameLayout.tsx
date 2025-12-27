'use client';

import type { ReactNode } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import NetworkStatus from '@/components/Game/HUD/NetworkStatus';

export default function GameLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-primary">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-6">
            <div className="flex justify-end mb-4">
              <NetworkStatus />
            </div>
            {children}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
