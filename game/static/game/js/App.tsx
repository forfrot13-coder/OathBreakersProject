import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from './store';
import { Notifications } from './components/Notification';
import { LoadingSpinner, HomeIcon, CardIcon, ShopIcon, TrendingUpIcon, UserIcon, TrophyIcon } from './components/Icons';

// Pages
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Marketplace from './pages/Marketplace';
import Shop from './pages/Shop';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';
import Login from './pages/Login';
import Register from './pages/Register';

type Page = 'dashboard' | 'inventory' | 'marketplace' | 'shop' | 'profile' | 'leaderboard' | 'login' | 'register';

const App: React.FC = () => {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Get current page path to determine initial page
  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('/login')) setCurrentPage('login');
    else if (path.includes('/register')) setCurrentPage('register');
    else if (path.includes('/inventory')) setCurrentPage('inventory');
    else if (path.includes('/marketplace')) setCurrentPage('marketplace');
    else if (path.includes('/shop')) setCurrentPage('shop');
    else if (path.includes('/profile')) setCurrentPage('profile');
    else if (path.includes('/leaderboard')) setCurrentPage('leaderboard');
    else setCurrentPage('dashboard');
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-game-darker">
        <div className="text-center">
          <LoadingSpinner className="w-16 h-16 text-game-accent mx-auto mb-4" />
          <p className="text-gray-400">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && currentPage !== 'login' && currentPage !== 'register') {
    setCurrentPage('login');
  }

  const navItems = [
    { id: 'dashboard' as Page, icon: HomeIcon, label: 'داشبورد' },
    { id: 'inventory' as Page, icon: CardIcon, label: 'موجودی' },
    { id: 'marketplace' as Page, icon: TrendingUpIcon, label: 'بازار' },
    { id: 'shop' as Page, icon: ShopIcon, label: 'فروشگاه' },
    { id: 'leaderboard' as Page, icon: TrophyIcon, label: 'جدول' },
    { id: 'profile' as Page, icon: UserIcon, label: 'پروفایل' },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'inventory':
        return <Inventory />;
      case 'marketplace':
        return <Marketplace />;
      case 'shop':
        return <Shop />;
      case 'profile':
        return <Profile />;
      case 'leaderboard':
        return <Leaderboard />;
      case 'login':
        return <Login onRegisterClick={() => setCurrentPage('register')} />;
      case 'register':
        return <Register onLoginClick={() => setCurrentPage('login')} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-game-darker">
      {/* Header (Mobile) */}
      {isAuthenticated && (
        <header className="lg:hidden bg-game-card border-b border-gray-700 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
          <h1 className="text-xl font-bold text-white">OathBreakers</h1>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-white p-2"
          >
            <motion.div
              animate={isSidebarOpen ? { rotate: 180 } : { rotate: 0 }}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </motion.div>
          </button>
        </header>
      )}

      {/* Sidebar Navigation */}
      {isAuthenticated && (
        <>
          {/* Desktop Sidebar */}
          <aside className="hidden lg:flex flex-col fixed right-0 top-0 h-full w-64 bg-game-card border-l border-gray-700 z-40">
            <div className="p-6 border-b border-gray-700">
              <h1 className="text-2xl font-bold text-white">OathBreakers</h1>
            </div>
            <nav className="flex-1 p-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentPage(item.id)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                      ${currentPage === item.id
                        ? 'bg-game-accent text-white'
                        : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                      }
                    `}
                  >
                    <Icon />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Mobile Sidebar Overlay */}
          <AnimatePresence>
            {isSidebarOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsSidebarOpen(false)}
                  className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-30"
                />
                <motion.aside
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="lg:hidden fixed right-0 top-0 h-full w-64 bg-game-card border-l border-gray-700 z-40 flex flex-col"
                >
                  <div className="p-6 border-b border-gray-700 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-white">OathBreakers</h1>
                    <button
                      onClick={() => setIsSidebarOpen(false)}
                      className="text-white p-2"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setCurrentPage(item.id);
                            setIsSidebarOpen(false);
                          }}
                          className={`
                            w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                            ${currentPage === item.id
                              ? 'bg-game-accent text-white'
                              : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                            }
                          `}
                        >
                          <Icon />
                          <span className="font-medium">{item.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                </motion.aside>
              </>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Main Content */}
      <main className={isAuthenticated ? 'lg:mr-64 min-h-screen' : 'min-h-screen'}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="p-4 lg:p-8"
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation */}
      {isAuthenticated && (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-game-card border-t border-gray-700 z-40">
          <div className="flex justify-around py-2">
            {navItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`
                    flex flex-col items-center justify-center p-2 rounded-lg transition-colors
                    ${currentPage === item.id
                      ? 'text-game-accent'
                      : 'text-gray-400'
                    }
                  `}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-xs mt-1">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}

      {/* Notifications */}
      <Notifications />
    </div>
  );
};

export default App;
