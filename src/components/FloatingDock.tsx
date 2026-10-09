import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, UtensilsCrossed, ShoppingBag, Wallet, User } from 'lucide-react';

const FloatingDock = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { id: 'home', path: '/', label: 'Home', icon: Home },
    { id: 'mess', path: '/mess', label: 'Mess', icon: UtensilsCrossed },
    { id: 'orders', path: '/orders', label: 'Orders', icon: ShoppingBag },
    { id: 'wallet', path: '/dashboard', label: 'Dashboard', icon: Wallet },
    { id: 'profile', path: '/dashboard', label: 'Profile', icon: User } // We can link this to dashboard for now or a separate profile route
  ];

  // Helper to determine if a tab is active
  const isActive = (path: string) => {
    if (path === '/' && currentPath === '/') return true;
    if (path !== '/' && currentPath.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-[400px] md:max-w-[500px]">
      <nav className="bg-white/80 backdrop-blur-2xl border border-gray-200/60 shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-3xl p-2 flex justify-between items-center">
        {navItems.map(item => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`relative flex items-center justify-center p-3 rounded-2xl transition-all duration-300 ease-out flex-1 ${
                active ? 'bg-gray-900 text-white shadow-md scale-105' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <item.icon className={`w-6 h-6 transition-transform duration-300 ${active ? 'scale-110 stroke-[2.5px]' : 'stroke-[1.5px]'}`} />
              {/* Active Indicator Dot */}
              {active && (
                <span className="absolute -bottom-1 w-1.5 h-1.5 bg-gray-900 rounded-full animate-pulse shadow-[0_0_8px_rgba(0,0,0,0.5)]"></span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default FloatingDock;
