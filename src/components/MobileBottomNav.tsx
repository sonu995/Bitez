import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, UtensilsCrossed, ShoppingBag, ShoppingCart, User, Clock } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { totalItems } = useCart();
  const { user } = useAuth();

  const navItems = [
    {
      to: '/',
      label: 'Home',
      icon: Home,
      isActive: location.pathname === '/',
    },
    {
      to: '/mess',
      label: 'Mess',
      sublabel: 'Plans',
      icon: UtensilsCrossed,
      isActive: location.pathname === '/mess',
      badge: 'Daily',
    },
    {
      to: '/menu',
      label: 'Instant Order',
      icon: ShoppingBag,
      isActive: location.pathname.startsWith('/menu'),
      badge: '25m',
    },
    {
      to: '/cart',
      label: 'Cart',
      icon: ShoppingCart,
      isActive: location.pathname === '/cart',
      count: totalItems,
    },
    {
      to: user ? '/dashboard' : '/login',
      label: user ? 'Account' : 'Login',
      icon: user ? User : User,
      isActive: location.pathname === '/dashboard' || location.pathname === '/login' || location.pathname === '/orders',
    },
  ];

  return (
    <nav
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-[0_-4px_25px_rgba(0,0,0,0.06)] px-1 pt-1.5 transition-all"
      style={{ paddingBottom: 'max(0.45rem, env(safe-area-inset-bottom))' }}
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
              className={`relative flex flex-col items-center justify-center py-0.5 px-2 rounded-xl transition-all duration-200 select-none flex-1 ${
                active
                  ? 'text-orange-600 font-extrabold'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              {/* Icon Container with active highlight pill */}
              <div
                className={`relative p-1 rounded-xl transition-all duration-200 ${
                  active
                    ? 'bg-orange-50 text-orange-600 scale-105'
                    : 'text-slate-600'
                }`}
              >
                <Icon className="w-5 h-5 transition-transform" />

                {/* Badge count for Cart */}
                {typeof item.count === 'number' && item.count > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-scale-in">
                    {item.count}
                  </span>
                )}

                {/* Micro text badge for Mess/Menu */}
                {item.badge && !active && (
                  <span className="absolute -top-1.5 -right-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[8px] font-black px-1 rounded-full shadow-2xs">
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span className="text-[10px] tracking-tight mt-0.5 leading-none text-center truncate max-w-full">
                {item.label}
              </span>

              {/* Active bottom indicator pill */}
              {active && (
                <span className="w-4 h-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full mt-1 shadow-xs" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
