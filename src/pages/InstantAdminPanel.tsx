import React, { useState, useEffect, useMemo } from 'react';
import {
  Package,
  ChefHat,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Bike,
  Truck,
  Tag,
  Settings,
  DollarSign,
  Eye,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  Printer,
  Bell,
  Volume2,
  VolumeX,
  Flame,
  Sparkles,
  Phone,
  ExternalLink,
  ChevronRight,
  Menu as MenuIcon,
  X,
  Check,
  Utensils,
  MapPin,
  FileText,
  RotateCcw,
  LayoutDashboard
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ordersAPI, dishesAPI, adminAPI } from '../services/api';
import TiffinMateLogo from '../components/TiffinMateLogo';

export default function InstantAdminPanel() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Active Tab: orders | dishes | analytics | riders | settings
  const [activeTab, setActiveTab] = useState<'orders' | 'dishes' | 'analytics' | 'riders' | 'settings'>('orders');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Live Data State
  const [orders, setOrders] = useState<any[]>([]);
  const [dishes, setDishes] = useState<any[]>([]);
  const [riders, setRiders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(new Date());

  // Kitchen Controls
  const [isKitchenOpen, setIsKitchenOpen] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'confirmed' | 'preparing' | 'on-the-way' | 'delivered' | 'cancelled'>('all');
  const [dishCategoryFilter, setDishCategoryFilter] = useState('all');
  const [dishVegFilter, setDishVegFilter] = useState<'all' | 'veg' | 'non-veg'>('all');

  // Modals & Action States
  const [addDishModalOpen, setAddDishModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<any | null>(null);
  const [selectedOrderKOT, setSelectedOrderKOT] = useState<any | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // New Dish Form State
  const [dishForm, setDishForm] = useState({
    name: '',
    category: 'Fast Food',
    price: 99,
    description: '',
    imageUrl: '',
    isVeg: true,
    prepTime: '15 mins',
    inStock: true
  });

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch all orders and dishes
  const fetchData = async () => {
    setSyncing(true);
    try {
      const [ordersRes, dishesRes, ridersRes] = await Promise.allSettled([
        ordersAPI.getAll(),
        dishesAPI.getAll(),
        adminAPI.getRiders()
      ]);

      if (ordersRes.status === 'fulfilled' && ordersRes.value?.orders) {
        setOrders(ordersRes.value.orders);
      }
      if (dishesRes.status === 'fulfilled' && dishesRes.value?.dishes) {
        setDishes(dishesRes.value.dishes);
      }
      if (ridersRes.status === 'fulfilled' && ridersRes.value?.riders) {
        setRiders(ridersRes.value.riders);
      }
      setLastSyncTime(new Date());
    } catch (err) {
      console.error('Failed to sync instant kitchen data:', err);
    } finally {
      setSyncing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto sync every 8 seconds for real-time kitchen operations
    const timer = setInterval(() => {
      fetchData();
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  // Update Order Status handler
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await ordersAPI.updateStatus(orderId, newStatus);
      showToast(`Order #${orderId.slice(-6).toUpperCase()} updated to ${newStatus.toUpperCase()}`);
      setOrders(prev =>
        prev.map(o => (o.orderId === orderId || o._id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err: any) {
      showToast(err.message || 'Failed to update order status', 'error');
    }
  };

  // Toggle Dish Availability handler
  const handleToggleDishStock = async (dishId: string) => {
    try {
      await dishesAPI.toggleAvailability(dishId);
      setDishes(prev =>
        prev.map(d => (d._id === dishId || d.id === dishId ? { ...d, inStock: !d.inStock, isAvailable: !d.isAvailable } : d))
      );
      showToast('Dish stock status updated!');
    } catch (err: any) {
      showToast(err.message || 'Failed to update stock', 'error');
    }
  };

  // Save New or Edited Dish
  const handleSaveDish = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDish) {
        const id = editingDish._id || editingDish.id;
        await dishesAPI.update(id, dishForm);
        showToast(`"${dishForm.name}" updated successfully!`);
      } else {
        await dishesAPI.create(dishForm);
        showToast(`🎉 New dish "${dishForm.name}" added to instant menu!`);
      }
      setAddDishModalOpen(false);
      setEditingDish(null);
      setDishForm({
        name: '',
        category: 'Fast Food',
        price: 99,
        description: '',
        imageUrl: '',
        isVeg: true,
        prepTime: '15 mins',
        inStock: true
      });
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save dish', 'error');
    }
  };

  // Delete Dish handler
  const handleDeleteDish = async (dishId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from the food menu?`)) return;
    try {
      await dishesAPI.delete(dishId);
      setDishes(prev => prev.filter(d => (d._id !== dishId && d.id !== dishId)));
      showToast(`"${name}" deleted from menu.`);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete dish', 'error');
    }
  };

  // Metrics computation
  const incomingCount = orders.filter(o => o.status === 'confirmed').length;
  const preparingCount = orders.filter(o => o.status === 'preparing').length;
  const onTheWayCount = orders.filter(o => o.status === 'on-the-way').length;
  const deliveredCount = orders.filter(o => o.status === 'delivered').length;
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders
      .filter(o => {
        if (orderStatusFilter !== 'all' && o.status !== orderStatusFilter) return false;
        if (!search) return true;
        const q = search.toLowerCase();
        const id = (o.orderId || o._id || '').toLowerCase();
        const name = (o.customerName || '').toLowerCase();
        const phone = (o.customerPhone || '').toLowerCase();
        const address = (o.deliveryAddress || '').toLowerCase();
        return id.includes(q) || name.includes(q) || phone.includes(q) || address.includes(q);
      })
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }, [orders, orderStatusFilter, search]);

  // Categories list from dishes
  const categories = useMemo(() => {
    const set = new Set<string>();
    dishes.forEach(d => {
      if (d.category) set.add(d.category);
    });
    return ['all', ...Array.from(set)];
  }, [dishes]);

  // Filtered dishes list
  const filteredDishes = useMemo(() => {
    return dishes.filter(d => {
      if (dishCategoryFilter !== 'all' && d.category !== dishCategoryFilter) return false;
      if (dishVegFilter === 'veg' && !d.isVeg) return false;
      if (dishVegFilter === 'non-veg' && d.isVeg) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (d.name || '').toLowerCase().includes(q) || (d.description || '').toLowerCase().includes(q);
    });
  }, [dishes, dishCategoryFilter, dishVegFilter, search]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse font-black';
      case 'preparing':
        return 'bg-blue-50 text-blue-800 border-blue-200 font-black';
      case 'on-the-way':
        return 'bg-purple-50 text-purple-800 border-purple-200 font-black';
      case 'delivered':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold';
      case 'cancelled':
        return 'bg-rose-50 text-rose-800 border-rose-200 font-bold';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="h-screen w-full overflow-hidden bg-[#F8FAFC] font-sans flex flex-col md:flex-row text-slate-900 antialiased selection:bg-orange-500 selection:text-white">

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl shadow-xl font-bold text-sm text-white flex items-center gap-2.5 transition-all animate-bounce-gentle ${
            toast.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'
          }`}
        >
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          {toast.msg}
        </div>
      )}

      {/* ── MOBILE HEADER BAR (< 768px) ── */}
      <div className="md:hidden shrink-0 bg-white text-slate-800 px-4 py-3 flex items-center justify-between border-b border-slate-200 shadow-xs z-30">
        <div className="flex items-center gap-2">
          <TiffinMateLogo size="sm" showSubtitle={false} />
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-orange-500 text-white shadow-2xs">
            ⚡ Instant Admin
          </span>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200 transition cursor-pointer"
        >
          {mobileMenuOpen ? <X size={20} /> : <MenuIcon size={20} />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden transition-opacity"
        />
      )}

      {/* ── SIDEBAR DRAWER ── */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50 md:z-auto h-full w-72 md:w-64 lg:w-72
          bg-white text-slate-800 flex flex-col shrink-0
          border-r border-slate-200/90 shadow-xl md:shadow-none
          transition-transform duration-200 ease-in-out
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Brand Header with Live Tag */}
        <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-2">
            <TiffinMateLogo size="sm" showSubtitle={false} />
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-2xs">
              Instant Kitchen
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live
            </span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── DUAL CONSOLE SWITCHER STRIP ── */}
        <div className="p-2.5 border-b border-slate-100 bg-slate-50/80">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1 mb-1.5">
            Admin Console Mode
          </p>
          <div className="grid grid-cols-2 p-1 bg-slate-200/80 rounded-xl gap-1 text-xs font-black">
            <Link
              to="/admin"
              className="py-1.5 px-2 text-slate-600 hover:text-orange-600 hover:bg-white/80 rounded-lg transition text-center flex items-center justify-center gap-1"
              title="Switch to Mess Admin"
            >
              <span>🍱 Mess</span>
            </Link>
            <div className="py-1.5 px-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg shadow-xs text-center flex items-center justify-center gap-1 select-none">
              <span>⚡ Instant</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 min-h-0 px-2.5 py-3 space-y-1.5 overflow-y-auto scrollbar-thin">
          {[
            {
              id: 'orders',
              label: 'Live Orders (KDS)',
              icon: Package,
              badge: incomingCount > 0 ? `${incomingCount} New` : orders.length,
              isAlert: incomingCount > 0
            },
            {
              id: 'dishes',
              label: 'Food Menu & Dishes',
              icon: ChefHat,
              badge: dishes.length,
              isAlert: false
            },
            {
              id: 'analytics',
              label: 'Sales & Revenue',
              icon: TrendingUp,
              badge: `₹${totalRevenue > 999 ? `${(totalRevenue / 1000).toFixed(1)}k` : totalRevenue}`,
              isAlert: false
            },
            {
              id: 'riders',
              label: 'Instant Delivery Riders',
              icon: Bike,
              badge: '4 Active',
              isAlert: false
            },
            {
              id: 'settings',
              label: 'Kitchen & Rush Settings',
              icon: Settings,
              badge: isKitchenOpen ? 'Open' : 'Paused',
              isAlert: !isKitchenOpen
            }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer group ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20 font-black'
                    : tab.isAlert
                    ? 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 shadow-2xs'
                    : 'text-slate-600 hover:text-orange-600 hover:bg-orange-50/70'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    size={16}
                    className={
                      isActive
                        ? 'text-white shrink-0'
                        : tab.isAlert
                        ? 'text-amber-600 shrink-0'
                        : 'text-slate-400 group-hover:text-orange-500 shrink-0 transition-colors'
                    }
                  />
                  <span className="truncate">{tab.label}</span>
                </div>
                {tab.badge !== undefined && (
                  <span
                    className={`text-[10px] font-black px-1.5 py-0.2 rounded-full shrink-0 ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : tab.isAlert
                        ? 'bg-amber-500 text-white shadow-xs animate-pulse font-black'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Compact Footer Strip */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/70 shrink-0 space-y-2">
          <div className="grid grid-cols-2 gap-1 text-[10px] font-bold text-slate-600">
            <Link
              to="/menu"
              target="_blank"
              className="flex items-center justify-center gap-1 py-1.5 px-2 bg-white hover:bg-orange-50 hover:text-orange-600 rounded-lg border border-slate-200/80 shadow-2xs transition text-center"
              title="Open Customer Live Menu"
            >
              <ExternalLink size={12} className="text-orange-500 shrink-0" />
              <span>Live Menu</span>
            </Link>
            <Link
              to="/admin"
              className="flex items-center justify-center gap-1 py-1.5 px-2 bg-white hover:bg-orange-50 hover:text-orange-600 rounded-lg border border-slate-200/80 shadow-2xs transition text-center font-black text-amber-700"
              title="Switch to Mess Admin"
            >
              <span>🍱 Mess Admin</span>
            </Link>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-orange-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                K
              </div>
              <div className="min-w-0 text-left">
                <p className="text-[11px] font-black text-slate-900 truncate">Kitchen Desk</p>
                <p className="text-[9px] text-slate-400 truncate">Instant Operations</p>
              </div>
            </div>
            <button
              onClick={() => setIsKitchenOpen(!isKitchenOpen)}
              className={`px-2 py-0.5 rounded-full text-[9px] font-black cursor-pointer border ${
                isKitchenOpen ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              {isKitchenOpen ? 'ONLINE' : 'PAUSED'}
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="flex-1 min-w-0 h-full flex flex-col overflow-hidden">

        {/* ── TOP HEADER ACTION BAR ── */}
        <header className="shrink-0 bg-white border-b border-slate-200/90 px-4 sm:px-6 py-3 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-md">
                  Dedicated Instant Orders Admin
                </span>
                <span className="text-slate-300 hidden sm:inline">•</span>
                <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                  Sync: {lastSyncTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>Fast Food &amp; Instant Kitchen Command</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Direct Switcher to Mess Admin */}
            <Link
              to="/admin"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 text-xs font-black transition cursor-pointer shadow-2xs"
            >
              <span>🍱 Go to Mess Admin</span>
              <ArrowRight size={13} />
            </Link>

            {/* Sound alert toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                soundEnabled ? 'bg-slate-50 text-slate-700 border-slate-200' : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
              title={soundEnabled ? 'Order Sound Alert: ON' : 'Order Sound Alert: MUTED'}
            >
              {soundEnabled ? <Volume2 size={16} className="text-orange-500" /> : <VolumeX size={16} />}
            </button>

            {/* Manual Sync Button */}
            <button
              onClick={fetchData}
              disabled={syncing}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <RefreshCw size={14} className={syncing ? 'animate-spin text-orange-500' : ''} />
              <span className="hidden sm:inline">{syncing ? 'Syncing...' : 'Sync'}</span>
            </button>

            {/* Add New Dish Quick Button */}
            <button
              onClick={() => {
                setEditingDish(null);
                setDishForm({
                  name: '',
                  category: 'Fast Food',
                  price: 99,
                  description: '',
                  imageUrl: '',
                  isVeg: true,
                  prepTime: '15 mins',
                  inStock: true
                });
                setAddDishModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-black shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Plus size={15} />
              <span className="hidden sm:inline">Add Dish</span>
            </button>
          </div>
        </header>

        {/* ── SCROLLABLE WORKSPACE ── */}
        <main className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* ══════════════════════════════════════════════════════════
              TAB 1: LIVE ORDERS & KDS PIPELINE
          ══════════════════════════════════════════════════════════ */}
          {activeTab === 'orders' && (
            <div className="space-y-6">

              {/* 4 Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition relative overflow-hidden">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-black uppercase text-slate-400">Incoming Orders</span>
                    <span className={`w-2.5 h-2.5 rounded-full ${incomingCount > 0 ? 'bg-amber-500 animate-ping' : 'bg-slate-300'}`} />
                  </div>
                  <h3 className="text-3xl font-black text-amber-600 tracking-tight">{incomingCount}</h3>
                  <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Awaiting Kitchen Confirmation</p>
                </div>

                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition relative overflow-hidden">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-black uppercase text-slate-400">In Cooking / Oven</span>
                    <ChefHat size={16} className="text-blue-500" />
                  </div>
                  <h3 className="text-3xl font-black text-blue-600 tracking-tight">{preparingCount}</h3>
                  <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Active on Chef Station</p>
                </div>

                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition relative overflow-hidden">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-black uppercase text-slate-400">Out with Rider</span>
                    <Bike size={16} className="text-purple-500" />
                  </div>
                  <h3 className="text-3xl font-black text-purple-600 tracking-tight">{onTheWayCount}</h3>
                  <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Hostel Doorstep Delivery</p>
                </div>

                <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 text-white rounded-2xl p-4 shadow-md shadow-orange-500/20 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-black uppercase text-orange-100">Today's Sales</span>
                    <DollarSign size={16} className="text-amber-200" />
                  </div>
                  <h3 className="text-3xl font-black tracking-tight">₹{totalRevenue}</h3>
                  <p className="text-[11px] text-orange-100 font-medium mt-0.5">{deliveredCount} Orders Completed</p>
                </div>
              </div>

              {/* Filter Bar & Search */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  {/* Status Pills */}
                  <div className="flex overflow-x-auto scrollbar-hide bg-slate-50 p-1 rounded-2xl border border-slate-200/80 gap-1">
                    {[
                      { id: 'all', label: 'All Orders', count: orders.length },
                      { id: 'confirmed', label: 'Incoming', count: incomingCount },
                      { id: 'preparing', label: 'Cooking', count: preparingCount },
                      { id: 'on-the-way', label: 'Dispatched', count: onTheWayCount },
                      { id: 'delivered', label: 'Delivered', count: deliveredCount }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setOrderStatusFilter(tab.id as any)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                          orderStatusFilter === tab.id
                            ? 'bg-orange-500 text-white shadow-xs font-black'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                        }`}
                      >
                        <span>{tab.label}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${orderStatusFilter === tab.id ? 'bg-white/20' : 'bg-slate-200 text-slate-700'}`}>
                          {tab.count}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Search Input */}
                  <div className="relative min-w-[240px]">
                    <Search size={14} className="absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search order ID, student, room..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* Orders List / Cards */}
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                    <Package size={36} className="text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-700">No instant food orders match this filter</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Incoming orders placed via customer app will appear here live</p>
                  </div>
                ) : (
                  <div className="space-y-3 pt-1">
                    {filteredOrders.map(order => {
                      const id = order.orderId || order._id || order.id;
                      const itemsList = Array.isArray(order.items)
                        ? order.items.map((it: any) => typeof it === 'string' ? it : `${it.name || 'Dish'} x${it.quantity || 1}`)
                        : ['Instant Meal Combo'];

                      return (
                        <div
                          key={id}
                          className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 hover:border-orange-300 transition-all shadow-2xs space-y-3"
                        >
                          {/* Top Row: ID, Badges, Time */}
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2.5">
                              <span className="font-mono font-black text-sm text-slate-900">#{id.slice(-6).toUpperCase()}</span>
                              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${getStatusBadge(order.status)}`}>
                                {order.status.toUpperCase()}
                              </span>
                              {order.isExtraOrder && (
                                <span className="text-[10px] font-black bg-orange-100 text-orange-800 border border-orange-200 px-2 py-0.5 rounded-md">
                                  Tiffin Add-on
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-xs text-slate-400">
                              <Clock size={13} />
                              <span>{new Date(order.createdAt || Date.now()).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                              <span>•</span>
                              <span className="font-semibold text-slate-600">
                                {order.paymentMethod || 'Cash on Delivery'}
                              </span>
                            </div>
                          </div>

                          {/* Middle Row: Items & Delivery Address */}
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                            <div className="md:col-span-7 space-y-1">
                              <p className="text-[10px] uppercase font-black tracking-wider text-slate-400">Ordered Dishes</p>
                              <div className="flex flex-wrap gap-1.5 pt-0.5">
                                {itemsList.map((itemStr: string, idx: number) => (
                                  <span
                                    key={idx}
                                    className="px-2.5 py-1 bg-slate-50 border border-slate-200/80 rounded-lg text-slate-800 font-extrabold text-xs"
                                  >
                                    🍱 {itemStr}
                                  </span>
                                ))}
                              </div>
                              {order.notes && (
                                <p className="text-[11px] text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 mt-1 font-medium">
                                  Note: "{order.notes}"
                                </p>
                              )}
                            </div>

                            <div className="md:col-span-5 space-y-1 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                              <p className="text-[10px] uppercase font-black tracking-wider text-slate-400">Customer &amp; Room</p>
                              <p className="font-extrabold text-slate-900 text-xs">{order.customerName || 'Student Customer'}</p>
                              <p className="text-slate-600 font-medium truncate">📍 {order.deliveryAddress || 'Campus Hostel'}</p>
                              {order.customerPhone && (
                                <a
                                  href={`tel:${order.customerPhone}`}
                                  className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-600 hover:underline pt-0.5"
                                >
                                  <Phone size={11} /> {order.customerPhone}
                                </a>
                              )}
                            </div>
                          </div>

                          {/* Bottom Row: Amount & Action Buttons */}
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                            <div>
                              <span className="text-[10px] uppercase font-black text-slate-400 block">Total Amount</span>
                              <span className="text-lg font-black text-slate-900">₹{order.totalAmount}</span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              {order.status === 'confirmed' && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(id, 'preparing')}
                                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-2xs transition cursor-pointer flex items-center gap-1.5"
                                >
                                  <ChefHat size={14} />
                                  <span>Accept &amp; Start Cooking</span>
                                </button>
                              )}

                              {order.status === 'preparing' && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(id, 'on-the-way')}
                                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black shadow-2xs transition cursor-pointer flex items-center gap-1.5"
                                >
                                  <Bike size={14} />
                                  <span>Out for Delivery</span>
                                </button>
                              )}

                              {order.status === 'on-the-way' && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(id, 'delivered')}
                                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-2xs transition cursor-pointer flex items-center gap-1.5"
                                >
                                  <CheckCircle2 size={14} />
                                  <span>Mark Delivered</span>
                                </button>
                              )}

                              {order.status !== 'delivered' && order.status !== 'cancelled' && (
                                <button
                                  onClick={() => {
                                    if (window.confirm('Cancel this order?')) {
                                      handleUpdateOrderStatus(id, 'cancelled');
                                    }
                                  }}
                                  className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl text-xs font-bold transition cursor-pointer"
                                >
                                  Cancel
                                </button>
                              )}

                              <button
                                onClick={() => setSelectedOrderKOT(order)}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                                title="Print Kitchen Order Ticket"
                              >
                                <Printer size={13} />
                                <span className="hidden sm:inline">KOT</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              TAB 2: FOOD MENU & DISHES CATALOG
          ══════════════════════════════════════════════════════════ */}
          {activeTab === 'dishes' && (
            <div className="space-y-6">

              {/* Top Controls Bar */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <ChefHat size={22} className="text-orange-500" />
                      <span>Instant Food Menu &amp; Kitchen Dishes</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Manage fast-food catalog, pricing, veg/non-veg flags, and 1-tap out-of-stock switches
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setEditingDish(null);
                      setDishForm({
                        name: '',
                        category: 'Fast Food',
                        price: 99,
                        description: '',
                        imageUrl: '',
                        isVeg: true,
                        prepTime: '15 mins',
                        inStock: true
                      });
                      setAddDishModalOpen(true);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-black rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Plus size={15} />
                    <span>Add New Dish</span>
                  </button>
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                  {/* Category Chips */}
                  <div className="flex overflow-x-auto scrollbar-hide gap-1.5 pb-1">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setDishCategoryFilter(cat)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                          dishCategoryFilter === cat
                            ? 'bg-orange-500 text-white shadow-2xs font-black'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {cat === 'all' ? 'All Categories' : cat}
                      </button>
                    ))}
                  </div>

                  {/* Veg Toggle + Search */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="flex bg-slate-100 p-0.5 rounded-xl text-xs font-bold">
                      <button
                        onClick={() => setDishVegFilter('all')}
                        className={`px-2.5 py-1 rounded-lg transition ${dishVegFilter === 'all' ? 'bg-white shadow-2xs text-slate-900 font-black' : 'text-slate-500'}`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setDishVegFilter('veg')}
                        className={`px-2.5 py-1 rounded-lg transition ${dishVegFilter === 'veg' ? 'bg-emerald-600 text-white font-black' : 'text-slate-500'}`}
                      >
                        Veg
                      </button>
                      <button
                        onClick={() => setDishVegFilter('non-veg')}
                        className={`px-2.5 py-1 rounded-lg transition ${dishVegFilter === 'non-veg' ? 'bg-rose-600 text-white font-black' : 'text-slate-500'}`}
                      >
                        Non-Veg
                      </button>
                    </div>

                    <div className="relative flex-1 sm:w-56">
                      <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search dishes..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Dishes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredDishes.map(dish => {
                  const id = dish._id || dish.id;
                  const isAvailable = dish.inStock !== false && dish.isAvailable !== false;

                  return (
                    <div
                      key={id}
                      className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                      <div>
                        {/* Image Banner */}
                        <div className="h-40 w-full bg-slate-100 relative overflow-hidden">
                          <img
                            src={dish.imageUrl || dish.image || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=compress&cs=tinysrgb&w=300'}
                            alt={dish.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=compress&cs=tinysrgb&w=300';
                            }}
                          />
                          {/* Veg Dot */}
                          <div className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-xs p-1 rounded-md shadow-xs">
                            <span className={`block w-2.5 h-2.5 rounded-full ${dish.isVeg ? 'bg-emerald-500 ring-2 ring-emerald-200' : 'bg-rose-500 ring-2 ring-rose-200'}`} />
                          </div>

                          {/* Category Pill */}
                          <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md">
                            {dish.category || 'Fast Food'}
                          </div>
                        </div>

                        {/* Info Body */}
                        <div className="p-4 space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-black text-sm text-slate-900 leading-snug line-clamp-1">{dish.name}</h4>
                            <span className="font-black text-orange-600 text-sm shrink-0">₹{dish.price}</span>
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                            {dish.description || 'Freshly prepared hot in campus kitchen.'}
                          </p>
                        </div>
                      </div>

                      {/* Card Footer: Stock Switch + Actions */}
                      <div className="p-4 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleToggleDishStock(id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                            isAvailable
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          <span>{isAvailable ? 'In Stock' : 'Sold Out'}</span>
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingDish(dish);
                              setDishForm({
                                name: dish.name || '',
                                category: dish.category || 'Fast Food',
                                price: dish.price || 99,
                                description: dish.description || '',
                                imageUrl: dish.imageUrl || dish.image || '',
                                isVeg: dish.isVeg !== false,
                                prepTime: dish.prepTime || '15 mins',
                                inStock: isAvailable
                              });
                              setAddDishModalOpen(true);
                            }}
                            className="p-1.5 bg-slate-50 hover:bg-orange-50 text-slate-600 hover:text-orange-600 rounded-lg transition border border-slate-200 cursor-pointer"
                            title="Edit Dish"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteDish(id, dish.name)}
                            className="p-1.5 bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-lg transition border border-slate-200 cursor-pointer"
                            title="Delete Dish"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              TAB 3: SALES & REVENUE ANALYTICS
          ══════════════════════════════════════════════════════════ */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs">
                  <p className="text-[10px] uppercase font-black tracking-wider text-slate-400">Total Instant Revenue</p>
                  <h3 className="text-4xl font-black text-slate-900 tracking-tight mt-1">₹{totalRevenue}</h3>
                  <p className="text-xs text-emerald-600 font-bold mt-1">✓ Across all fast-food deliveries</p>
                </div>
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs">
                  <p className="text-[10px] uppercase font-black tracking-wider text-slate-400">Total Instant Orders</p>
                  <h3 className="text-4xl font-black text-slate-900 tracking-tight mt-1">{orders.length}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">Average order ticket: ₹{orders.length ? Math.round(totalRevenue / orders.length) : 0}</p>
                </div>
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs">
                  <p className="text-[10px] uppercase font-black tracking-wider text-slate-400">Average Preparation Time</p>
                  <h3 className="text-4xl font-black text-orange-600 tracking-tight mt-1">16 mins</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">Doorstep delivery: 22-26 mins</p>
                </div>
              </div>

              {/* Best Selling Dishes */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs">
                <h3 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
                  <Flame size={18} className="text-orange-500" />
                  <span>Top Instant Street Food Dishes</span>
                </h3>
                <div className="divide-y divide-slate-100">
                  {dishes.slice(0, 6).map((d, idx) => (
                    <div key={d._id || idx} className="py-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className="font-black text-slate-400 w-5">#{idx + 1}</span>
                        <div>
                          <p className="font-black text-slate-900 text-sm">{d.name}</p>
                          <p className="text-[11px] text-slate-500">{d.category || 'Snacks'} • ₹{d.price}</p>
                        </div>
                      </div>
                      <span className="font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                        🔥 Trending
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              TAB 4: INSTANT DELIVERY RIDERS
          ══════════════════════════════════════════════════════════ */}
          {activeTab === 'riders' && (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Bike size={20} className="text-orange-500" />
                  <span>Instant Delivery Partners &amp; Runners</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Dedicated runners assigned for room doorstep food deliveries</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                {riders.length > 0 ? (
                  riders.map((r: any) => (
                    <div key={r.id || r._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-slate-900 text-sm">{r.name}</span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 capitalize">
                          {r.status || 'available'}
                        </span>
                      </div>
                      <p className="text-slate-500 font-mono text-[11px]">{r.vehicle || r.vehicleType || 'Vehicle'}</p>
                      {r.phone && (
                        <p className="text-orange-600 font-bold flex items-center gap-1">
                          <Phone size={12} /> {r.phone}
                        </p>
                      )}
                      <p className="text-[11px] font-semibold text-slate-700 pt-1 border-t border-slate-200/60">
                        📍 {r.route || 'Campus Fleet'}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-8 text-center text-slate-400 text-xs">
                    No delivery riders found.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              TAB 5: KITCHEN SETTINGS
          ══════════════════════════════════════════════════════════ */}
          {activeTab === 'settings' && (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs max-w-2xl space-y-6">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Settings size={20} className="text-orange-500" />
                  <span>Instant Food Kitchen Settings</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Control live ordering status, packaging charges and rush hours</p>
              </div>

              <div className="space-y-4 text-xs font-bold text-slate-700">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div>
                    <p className="text-sm font-black text-slate-900">Accepting Live Instant Orders</p>
                    <p className="text-[11px] text-slate-400 font-normal">Toggle to pause ordering when kitchen is overloaded</p>
                  </div>
                  <button
                    onClick={() => setIsKitchenOpen(!isKitchenOpen)}
                    className={`px-4 py-2 rounded-xl font-black text-xs transition cursor-pointer ${
                      isKitchenOpen ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                    }`}
                  >
                    {isKitchenOpen ? '🟢 OPEN' : '🔴 CLOSED'}
                  </button>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <p className="text-sm font-black text-slate-900">Kitchen Operating Hours</p>
                  <p className="text-xs text-slate-600 font-medium">11:00 AM – 02:00 AM (Midnight Delivery Enabled)</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <p className="text-sm font-black text-slate-900">Delivery Radius</p>
                  <p className="text-xs text-slate-600 font-medium">Inside Campus &amp; Student Coaching Hub (Within 3.5 km)</p>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ── MODAL: ADD / EDIT DISH ── */}
      {addDishModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-scale-in">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <ChefHat size={18} className="text-orange-500" />
                <span>{editingDish ? 'Edit Food Dish' : 'Add New Instant Dish'}</span>
              </h3>
              <button
                onClick={() => setAddDishModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveDish} className="space-y-3.5 text-xs font-bold text-slate-700">
              <div>
                <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">Dish Name</label>
                <input
                  type="text"
                  required
                  value={dishForm.name}
                  onChange={e => setDishForm({ ...dishForm, name: e.target.value })}
                  placeholder="e.g. Crispy Paneer Burger, Steamed Momos"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">Category</label>
                  <select
                    value={dishForm.category}
                    onChange={e => setDishForm({ ...dishForm, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-bold bg-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="Fast Food">Fast Food</option>
                    <option value="Burgers">Burgers &amp; Wraps</option>
                    <option value="Momos">Momos &amp; Snacks</option>
                    <option value="Biryani">Biryani &amp; Bowls</option>
                    <option value="Pizza">Pizzas</option>
                    <option value="Beverages">Beverages &amp; Shakes</option>
                    <option value="Desserts">Desserts</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={dishForm.price}
                    onChange={e => setDishForm({ ...dishForm, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">Image URL</label>
                <input
                  type="url"
                  value={dishForm.imageUrl}
                  onChange={e => setDishForm({ ...dishForm, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-500 mb-1">Short Description</label>
                <textarea
                  rows={2}
                  value={dishForm.description}
                  onChange={e => setDishForm({ ...dishForm, description: e.target.value })}
                  placeholder="Crispy patty with fresh mayo, lettuce and secret spice blend..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dishForm.isVeg}
                    onChange={e => setDishForm({ ...dishForm, isVeg: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span className="text-xs font-bold text-slate-700">100% Pure Veg Dish</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dishForm.inStock}
                    onChange={e => setDishForm({ ...dishForm, inStock: e.target.checked })}
                    className="rounded text-orange-600 focus:ring-orange-500 w-4 h-4"
                  />
                  <span className="text-xs font-bold text-slate-700">Available In Stock</span>
                </label>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setAddDishModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black rounded-xl transition shadow-xs cursor-pointer active:scale-95"
                >
                  {editingDish ? 'Save Changes' : 'Add Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: KITCHEN ORDER TICKET (KOT) ── */}
      {selectedOrderKOT && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-scale-in text-left">
            <div className="flex justify-between items-start pb-3 border-b border-slate-200 mb-3">
              <div>
                <p className="text-[10px] font-black uppercase text-orange-600">BITEZ FAST KITCHEN</p>
                <h4 className="font-mono font-black text-lg text-slate-900">
                  KOT #{String(selectedOrderKOT.orderId || selectedOrderKOT._id || 'ORD').slice(-6).toUpperCase()}
                </h4>
              </div>
              <button
                onClick={() => setSelectedOrderKOT(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-1 text-xs mb-4">
              <p>👤 <strong>Student:</strong> {selectedOrderKOT.customerName || 'Customer'}</p>
              <p>📍 <strong>Deliver To:</strong> {selectedOrderKOT.deliveryAddress}</p>
              <p>📞 <strong>Phone:</strong> {selectedOrderKOT.customerPhone || 'N/A'}</p>
              <p>⏰ <strong>Time:</strong> {new Date(selectedOrderKOT.createdAt || Date.now()).toLocaleTimeString()}</p>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden mb-4 text-xs">
              <div className="bg-slate-100 px-3 py-1.5 font-black text-slate-700 flex justify-between">
                <span>Items</span>
                <span>Qty</span>
              </div>
              <div className="p-3 space-y-1.5">
                {Array.isArray(selectedOrderKOT.items) ? (
                  selectedOrderKOT.items.map((it: any, idx: number) => (
                    <div key={idx} className="flex justify-between font-bold text-slate-800">
                      <span>{typeof it === 'string' ? it : it.name}</span>
                      <span>x{typeof it === 'string' ? 1 : it.quantity || 1}</span>
                    </div>
                  ))
                ) : (
                  <p>1x Instant Food Meal</p>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center font-black text-sm text-slate-900 mb-4 pb-2 border-b border-slate-100">
              <span>Total Paid:</span>
              <span className="text-orange-600">₹{selectedOrderKOT.totalAmount}</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer size={14} />
                <span>Print Kitchen KOT</span>
              </button>
              <button
                onClick={() => setSelectedOrderKOT(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
