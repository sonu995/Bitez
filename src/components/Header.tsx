import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingCart,
  User,
  MapPin,
  ChevronDown,
  Menu as MenuIcon,
  X,
  Home,
  UtensilsCrossed,
  ShoppingBag,
  Package,
  HelpCircle,
  Phone,
  Sparkles,
  ArrowRight,
  LogOut,
  LayoutDashboard,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import NotificationSystem from './NotificationSystem';
import TiffinMateLogo from './TiffinMateLogo';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowUserMenu(false);
    setMobileMenuOpen(false);
  };

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setShowUserMenu(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Press ESC to close open menus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
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
    <header className="bg-white/95 backdrop-blur-xl border-b border-orange-100/70 sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo with Chef Hat Icon (Subtitle hidden on mobile for clean fit) */}
          <Link to="/" className="flex items-center group shrink-0">
            <TiffinMateLogo size="sm" showSubtitle={false} className="sm:hidden" />
            <TiffinMateLogo size="md" className="hidden sm:flex" />
          </Link>

          {/* Center Navigation Links (Hidden on mobile, visible on tablet & desktop >= sm) */}
          <nav className="hidden sm:flex items-center space-x-2.5 md:space-x-5 lg:space-x-8 text-xs sm:text-[13px] lg:text-[15px] font-bold text-slate-700">
            <Link
              to="/"
              className={`relative py-1.5 transition-colors hover:text-amber-600 ${
                location.pathname === '/' ? 'text-slate-900 font-extrabold' : 'text-slate-700'
              }`}
            >
              Home
              {location.pathname === '/' && (
                <span className="absolute -bottom-1 left-0 w-full h-[3px] bg-amber-500 rounded-full"></span>
              )}
            </Link>

            <Link
              to="/mess"
              className={`relative py-1.5 transition-colors hover:text-amber-600 ${
                location.pathname === '/mess' ? 'text-amber-600 font-extrabold' : 'text-slate-700'
              }`}
            >
              Mess
              {location.pathname === '/mess' && (
                <span className="absolute -bottom-1 left-0 w-full h-[3px] bg-amber-500 rounded-full"></span>
              )}
            </Link>

            <Link
              to="/menu"
              className={`relative py-1.5 transition-colors hover:text-amber-600 ${
                location.pathname === '/menu' ? 'text-amber-600 font-extrabold' : 'text-slate-700'
              }`}
            >
              Instant Order
              {location.pathname === '/menu' && (
                <span className="absolute -bottom-1 left-0 w-full h-[3px] bg-amber-500 rounded-full"></span>
              )}
            </Link>

            <Link
              to="/support"
              className="py-1.5 text-slate-700 hover:text-amber-600 transition-colors"
            >
              About
            </Link>

            <Link
              to="/support"
              className="py-1.5 text-slate-700 hover:text-amber-600 transition-colors"
            >
              Contact
            </Link>
          </nav>

          {/* Right Action Icons: Location Pill + Cart + User Profile + Mobile Hamburger */}
          <div className="flex items-center space-x-1.5 sm:space-x-3">
            
            {/* Location dropdown pill (Responsive text) */}
            <div className="flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full border border-slate-200/90 bg-slate-50/80 text-[11px] sm:text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs cursor-pointer">
              <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 flex-shrink-0" />
              <span className="hidden sm:inline">Bokaro, Jharkhand</span>
              <span className="sm:hidden">Bokaro</span>
              <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-400" />
            </div>

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="p-1.5 sm:p-2 text-slate-700 hover:text-amber-600 relative transition-colors"
              title="View Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-black shadow-md shadow-amber-500/30">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* User Profile / Login (Visible on tablets & desktop >= sm; on mobile, managed in bottom nav & hamburger drawer) */}
            <div className="hidden sm:flex items-center space-x-2">
              {user ? (
                <>
                  <NotificationSystem />
                  <div className="relative" ref={menuRef}>
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-2 p-0.5 rounded-full hover:opacity-90 transition-opacity cursor-pointer"
                      aria-label="User menu"
                    >
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-900 flex items-center justify-center text-white shadow-sm font-bold text-xs sm:text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    </button>
                    {showUserMenu && (
                      <div className="absolute right-0 mt-3 w-52 bg-white rounded-2xl shadow-xl border border-orange-100 py-2 z-50 overflow-hidden animate-scale-in">
                        <Link to="/dashboard" className="block px-4 py-2.5 text-sm text-slate-600 hover:bg-orange-50 hover:text-amber-600 transition-colors font-medium" onClick={() => setShowUserMenu(false)}>📊 Dashboard</Link>
                        <Link to="/orders" className="block px-4 py-2.5 text-sm text-slate-600 hover:bg-orange-50 hover:text-amber-600 transition-colors font-medium" onClick={() => setShowUserMenu(false)}>📦 My Orders</Link>
                        <Link to="/mess" className="block px-4 py-2.5 text-sm text-slate-600 hover:bg-orange-50 hover:text-amber-600 transition-colors font-medium" onClick={() => setShowUserMenu(false)}>⭐ Subscriptions</Link>
                        <Link to="/support" className="block px-4 py-2.5 text-sm text-slate-600 hover:bg-orange-50 hover:text-amber-600 transition-colors font-medium" onClick={() => setShowUserMenu(false)}>💬 Support</Link>
                        {user.role === 'admin' && (
                          <Link to="/admin" className="block px-4 py-2.5 text-sm text-slate-600 hover:bg-orange-50 hover:text-amber-600 transition-colors font-medium" onClick={() => setShowUserMenu(false)}>⚙️ Admin Panel</Link>
                        )}
                        <div className="border-t border-orange-100 mt-1 pt-1">
                          <button onClick={handleLogout} className="block w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors font-medium cursor-pointer">🚪 Logout</button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <Link
                  to="/login"
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center transition-colors shadow-sm"
                  title="Account Login"
                >
                  <User className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                </Link>
              )}
            </div>

            {/* Mobile Hamburger Menu Button (Visible only on < sm mobile phones) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 text-slate-700 hover:text-amber-600 hover:bg-orange-50 rounded-xl transition-all cursor-pointer"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-amber-600" />
              ) : (
                <MenuIcon className="w-6 h-6" />
              )}
            </button>

          </div>
        </div>
      </div>

      {/* MOBILE BACKDROP OVERLAY */}
      {mobileMenuOpen && (
        <div
          className="sm:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* MOBILE FULL-WIDTH SLIDE-DOWN DRAWER MENU (Solid white background) */}
      {mobileMenuOpen && (
        <div className="sm:hidden fixed inset-x-0 top-16 bg-white border-b border-orange-100 shadow-2xl z-50 max-h-[calc(100vh-4.5rem)] overflow-y-auto animate-fade-in">
          <div className="px-4 py-5 space-y-4">
            
            {/* User Account / Auth Section */}
            {user ? (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-200/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-black text-sm flex items-center justify-center shadow-md">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-slate-900 leading-tight">{user.name}</div>
                    <div className="text-[11px] text-slate-500 font-medium truncate max-w-[170px]">{user.email}</div>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500 text-white shadow-xs">
                  {user.role === 'admin' ? 'Admin' : 'Member'}
                </span>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-50/80 via-orange-50/50 to-white border border-amber-200/60">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-extrabold text-slate-900">Welcome to Bitez 👋</span>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Save 20%</span>
                </div>
                <p className="text-[11px] text-slate-500 mb-3">Sign in to track orders, manage daily meals & access wallet credits.</p>
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-sm"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2 px-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all"
                  >
                    Create Account
                  </Link>
                </div>
              </div>
            )}

            {/* Quick Promo Pill */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/80 border border-amber-300/50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold text-slate-900">Get 20% OFF Code: SAVE20</span>
              </div>
              <Link
                to="/menu"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[11px] font-extrabold text-amber-700 hover:underline flex items-center gap-0.5"
              >
                Order <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Main Navigation Links */}
            <div className="space-y-1">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                  location.pathname === '/'
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
                    : 'text-slate-700 hover:bg-orange-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Home className="w-4.5 h-4.5" />
                  <span>Home</span>
                </div>
                <ArrowRight className="w-4 h-4 opacity-60" />
              </Link>

              <Link
                to="/mess"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                  location.pathname === '/mess'
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
                    : 'text-slate-700 hover:bg-orange-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <UtensilsCrossed className="w-4.5 h-4.5" />
                  <span>Mess</span>
                </div>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  location.pathname === '/mess' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  Daily Meals
                </span>
              </Link>

              <Link
                to="/menu"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                  location.pathname === '/menu'
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
                    : 'text-slate-700 hover:bg-orange-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-4.5 h-4.5" />
                  <span>Instant Order</span>
                </div>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  location.pathname === '/menu' ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-800'
                }`}>
                  ⚡ 25 Mins
                </span>
              </Link>

              <Link
                to="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                  location.pathname === '/orders'
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
                    : 'text-slate-700 hover:bg-orange-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Package className="w-4.5 h-4.5" />
                  <span>My Orders &amp; Tracking</span>
                </div>
                <ArrowRight className="w-4 h-4 opacity-60" />
              </Link>

              {user && (
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                    location.pathname === '/dashboard'
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
                      : 'text-slate-700 hover:bg-orange-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <LayoutDashboard className="w-4.5 h-4.5" />
                    <span>Member Dashboard</span>
                  </div>
                  <ArrowRight className="w-4 h-4 opacity-60" />
                </Link>
              )}

              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                    location.pathname === '/admin'
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
                      : 'text-slate-700 hover:bg-orange-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-4.5 h-4.5 text-amber-600" />
                    <span>Admin Panel</span>
                  </div>
                  <span className="text-[10px] font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">Admin</span>
                </Link>
              )}

              <Link
                to="/support"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                  location.pathname === '/support'
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
                    : 'text-slate-700 hover:bg-orange-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-4.5 h-4.5" />
                  <span>Help &amp; FAQs</span>
                </div>
                <ArrowRight className="w-4 h-4 opacity-60" />
              </Link>
            </div>

            {/* Quick Contact & WhatsApp Action in Mobile Drawer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <a
                href="tel:+919876543210"
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold hover:bg-slate-200 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-slate-600" />
                <span>Call Kitchen</span>
              </a>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs"
              >
                <span>WhatsApp Help</span>
              </a>
            </div>

            {/* Logout button (if logged in) */}
            {user && (
              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 font-bold text-xs transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout from Bitez</span>
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </header>
  );
};

export default Header;