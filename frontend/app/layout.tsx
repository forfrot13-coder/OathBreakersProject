import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import PWARegister from '@/components/PWARegister';
import ToasterProvider from '@/components/ToasterProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'OathBreakers - Trading Card Game',
  description: 'A thrilling trading card game where you collect, trade, and battle with unique cards',
  manifest: '/manifest.json',
  themeColor: '#7c3aed',
  appleWebApp: {
    capable: true,
    title: 'OathBreakers',
    statusBarStyle: 'default',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body className={inter.className}>
        <PWARegister />
        <ToasterProvider />
        {children}
      </body>
    </html>
  );
}
