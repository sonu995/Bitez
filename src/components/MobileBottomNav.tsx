import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutDashboard, ShoppingBag, ShoppingCart, User, Clock, UtensilsCrossed } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { totalItems } = useCart();
  const { user, hasActiveSub } = useAuth();

  const navItems = [
    {
      to: '/',
      label: 'Home',
      icon: Home,
      isActive: location.pathname === '/',
    },
    {
      to: hasActiveSub ? '/dashboard' : '/mess',
      label: hasActiveSub ? 'Dashboard' : 'Mess',
      icon: hasActiveSub ? LayoutDashboard : UtensilsCrossed,
      isActive: hasActiveSub
        ? location.pathname === '/dashboard'
        : (location.pathname === '/mess' || location.pathname === '/plans' || location.pathname === '/subscriptions'),
    },
    {
      to: '/menu',
      label: 'Food',
      icon: ShoppingBag,
      isActive: location.pathname.startsWith('/menu'),
    },
    {
      to: '/cart',
      label: 'Cart',
      icon: ShoppingCart,
      isActive: location.pathname === '/cart',
      count: totalItems,
    },
    {
      to: user ? '/orders' : '/login',
      label: user ? 'Orders' : 'Login',
      icon: user ? Clock : User,
      isActive: location.pathname === '/orders' || location.pathname === '/login' || location.pathname.startsWith('/track'),
    },
  ];

  return (
    <nav
      className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/98 backdrop-blur-xl border-t border-slate-200 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] px-1"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
      aria-label="Mobile Navigation"
    >
      <div className="flex items-center justify-around max-w-md mx-auto w-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;
          return (
            <Link
              key={item.label}
              to={item.to}
              className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-200 select-none flex-1 ${
                active
                  ? 'text-orange-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {/* Icon Container */}
              <div className="relative">
                <Icon className={`w-5 h-5 transition-all ${active ? 'scale-110' : 'scale-100'}`} />

                {/* Badge count for Cart */}
                {typeof item.count === 'number' && item.count > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                    {item.count > 9 ? '9+' : item.count}
                  </span>
                )}
              </div>

              {/* Label */}
              <span className={`text-[10px] mt-1 leading-none ${active ? 'font-semibold' : 'font-medium'}`}>
                {item.label}
              </span>

              {/* Active indicator */}
              {active && (
                <span className="absolute -bottom-0.5 w-1 h-1 bg-orange-600 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
