import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingCart,
  User,
  MapPin,
  ChevronDown,
  Search,
  Sparkles,
  ArrowRight,
  LogOut,
  LayoutDashboard,
  Package,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import NotificationSystem from './NotificationSystem';
import TiffinMateLogo from './TiffinMateLogo';

const Header: React.FC = () => {
  const { user, logout, hasActiveSub } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowUserMenu(false);
  };

  // Close user dropdown on route change
  useEffect(() => {
    setShowUserMenu(false);
  }, [location.pathname]);

  // Press ESC to close open user menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowUserMenu(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside to close user dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white/98 backdrop-blur-xl border-b border-slate-200/80 sticky top-0 z-50 transition-all shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Logo */}
          <Link to="/" className="flex items-center group shrink-0">
            <TiffinMateLogo size="sm" showSubtitle={false} className="sm:hidden" />
            <TiffinMateLogo size="md" className="hidden sm:flex" />
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                location.pathname === '/' 
                  ? 'text-orange-600 bg-orange-50' 
                  : 'text-slate-700 hover:text-orange-600 hover:bg-slate-50'
              }`}
            >
              Home
            </Link>

            {hasActiveSub ? (
              <Link
                to="/dashboard"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === '/dashboard' 
                    ? 'text-orange-600 bg-orange-50' 
                    : 'text-slate-700 hover:text-orange-600 hover:bg-slate-50'
                }`}
              >
                Dashboard
              </Link>
            ) : (
              <Link
                to="/mess"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === '/mess' || location.pathname === '/subscriptions' || location.pathname === '/plans'
                    ? 'text-orange-600 bg-orange-50' 
                    : 'text-slate-700 hover:text-orange-600 hover:bg-slate-50'
                }`}
              >
                Mess Plans
              </Link>
            )}

            <Link
              to="/menu"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                location.pathname === '/menu' 
                  ? 'text-orange-600 bg-orange-50' 
                  : 'text-slate-700 hover:text-orange-600 hover:bg-slate-50'
              }`}
            >
              Food Delivery
            </Link>

            <Link
              to="/timetable"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                location.pathname === '/timetable' 
                  ? 'text-orange-600 bg-orange-50' 
                  : 'text-slate-700 hover:text-orange-600 hover:bg-slate-50'
              }`}
            >
              Weekly Menu
            </Link>

            <Link
              to="/orders"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                location.pathname === '/orders' 
                  ? 'text-orange-600 bg-orange-50' 
                  : 'text-slate-700 hover:text-orange-600 hover:bg-slate-50'
              }`}
            >
              My Orders
            </Link>
          </nav>

          {/* Right Action Bar (Mobile & Desktop App-Style) */}
          <div className="flex items-center space-x-1.5 sm:space-x-3">
            
            {/* Location Pill with Live Delivery Pulse */}
            <div 
              onClick={() => navigate('/menu')}
              className="flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-3.5 py-1 sm:py-1.5 rounded-full border border-orange-200/80 bg-orange-50/50 hover:bg-orange-100/60 text-[11px] sm:text-xs font-semibold text-slate-700 transition-colors shadow-2xs cursor-pointer select-none"
              title="Delivery in Bokaro Steel City"
            >
              <div className="relative flex items-center justify-center">
                <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-600 flex-shrink-0" />
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
              </div>
              <span className="hidden sm:inline">Bokaro, Jharkhand</span>
              <span className="sm:hidden font-bold text-slate-800">Bokaro</span>
              <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-400" />
            </div>

            {/* Quick Search Button (Mobile & Desktop) */}
            <Link
              to="/menu"
              className="p-1.5 sm:p-2 text-slate-700 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-all"
              title="Search dishes"
            >
              <Search className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            </Link>


            {/* Cart Icon (Visible on all screens) */}
            <Link
              to="/cart"
              className="flex items-center p-1.5 sm:p-2 text-slate-700 hover:text-orange-600 hover:bg-orange-50 rounded-full relative transition-all"
              title="View Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-black shadow-md shadow-orange-500/30 animate-scale-in">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* User Profile / Login */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              {user ? (
                <>
                  <div className="hidden sm:block">
                    <NotificationSystem />
                  </div>
                  <div className="relative" ref={menuRef}>
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-2 p-0.5 rounded-full hover:opacity-90 transition-opacity cursor-pointer"
                      aria-label="User menu"
                    >
                      <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-sm font-black text-xs sm:text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    </button>
                    {showUserMenu && (
                      <div className="absolute right-0 mt-3 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 overflow-hidden animate-scale-in">
                        <div className="px-4 py-2 border-b border-slate-100 bg-slate-50">
                          <p className="text-xs font-black text-slate-900 truncate">{user.name}</p>
                          <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                        </div>
                        {/* Only show Admin Console & Rider App to users with admin role */}
                        {user?.role === 'admin' && (
                          <div className="bg-amber-50/70 border-b border-amber-100/80">
                            <Link
                              to="/admin"
                              className="block px-4 py-2 text-xs text-amber-900 hover:bg-amber-100/70 transition-colors font-bold flex items-center justify-between"
                              onClick={() => setShowUserMenu(false)}
                            >
                              <span className="flex items-center gap-1.5">
                                <span>🍱 Mess Admin Console</span>
                              </span>
                              <span className="text-[9px] bg-amber-500 text-white px-1.5 py-0.5 rounded font-black">MESS</span>
                            </Link>
                            <Link
                              to="/admin/instant"
                              className="block px-4 py-2 text-xs text-orange-950 hover:bg-orange-100/70 transition-colors font-bold flex items-center justify-between border-t border-amber-100/60"
                              onClick={() => setShowUserMenu(false)}
                            >
                              <span className="flex items-center gap-1.5">
                                <span>⚡ Instant Orders Kitchen</span>
                              </span>
                              <span className="text-[9px] bg-orange-500 text-white px-1.5 py-0.5 rounded font-black">FAST</span>
                            </Link>
                            <Link
                              to="/rider"
                              className="block px-4 py-2 text-xs text-emerald-950 hover:bg-emerald-100/70 transition-colors font-bold flex items-center justify-between border-t border-amber-100/60"
                              onClick={() => setShowUserMenu(false)}
                            >
                              <span className="flex items-center gap-1.5">
                                <span>🛵 Delivery Rider App</span>
                              </span>
                              <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-black">RIDER</span>
                            </Link>
                          </div>
                        )}
                        {hasActiveSub ? (
                          <>
                            <Link to="/dashboard" className="block px-4 py-2 text-xs sm:text-sm text-slate-600 hover:bg-orange-50 hover:text-orange-600 transition-colors font-medium" onClick={() => setShowUserMenu(false)}>📊 Mess Dashboard</Link>
                            <Link to="/plans" className="block px-4 py-2 text-xs sm:text-sm text-slate-600 hover:bg-orange-50 hover:text-orange-600 transition-colors font-medium" onClick={() => setShowUserMenu(false)}>⭐ Change / Upgrade Plan</Link>
                          </>
                        ) : (
                          <Link to="/mess" className="block px-4 py-2 text-xs sm:text-sm text-slate-600 hover:bg-orange-50 hover:text-orange-600 transition-colors font-medium" onClick={() => setShowUserMenu(false)}>🍱 Mess Plans &amp; Pricing</Link>
                        )}
                        <Link to="/timetable" className="block px-4 py-2 text-xs sm:text-sm text-slate-600 hover:bg-orange-50 hover:text-orange-600 transition-colors font-medium" onClick={() => setShowUserMenu(false)}>📅 Weekly Timetable</Link>
                        <Link to="/orders" className="block px-4 py-2 text-xs sm:text-sm text-slate-600 hover:bg-orange-50 hover:text-orange-600 transition-colors font-medium" onClick={() => setShowUserMenu(false)}>📦 My Orders</Link>
                        <Link to="/support" className="block px-4 py-2 text-xs sm:text-sm text-slate-600 hover:bg-orange-50 hover:text-orange-600 transition-colors font-medium" onClick={() => setShowUserMenu(false)}>💬 Support</Link>
                        <div className="border-t border-slate-100 mt-1 pt-1">
                          <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-xs sm:text-sm text-red-500 hover:bg-red-50 transition-colors font-medium cursor-pointer">🚪 Logout</button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <Link
                  to="/login"
                  className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white flex items-center justify-center transition-all shadow-md shadow-orange-500/20"
                  title="Account Login"
                >
                  <User className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" />
                </Link>
              )}
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;