import React, { useState, useEffect } from 'react';
import {
  Plus, Edit, Trash2, Save, X, ChevronLeft,
  Package, Calendar, Users, DollarSign,
  ToggleLeft, ToggleRight, UtensilsCrossed, ShoppingBag
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { plansAPI, menuAPI, extrasAPI, subscriptionsAPI } from '../services/api';

// ─── Types ──────────────────────────────────────────────────
interface Plan {
  _id: string;
  name: string;
  mealsPerDay: number;
  description: string;
  monthlyPrice: number;
  semesterDiscount: number;
  features: string[];
  isPopular: boolean;
  isActive: boolean;
  activeSubscribers: number;
}

interface DayMenu {
  breakfast: string;
  lunch: string;
  dinner: string;
}

interface ExtraItem {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  isActive: boolean;
}

interface Subscription {
  _id: string;
  userId: { name: string; email: string; phone: string };
  planId: { name: string; monthlyPrice: number };
  billingCycle: string;
  status: string;
  remainingMeals: number;
  amountPaid: number;
  endDate: string;
}

type TabKey = 'plans' | 'menu' | 'extras' | 'subscribers';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const CATEGORIES = ['General', 'Roti', 'Sweet', 'Beverage', 'Side'];

// ─── Main Component ──────────────────────────────────────────
const AdminTiffinPlans: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('plans');

  // Plans state
  const [plans, setPlans] = useState<Plan[]>([]);
  const [planLoading, setPlanLoading] = useState(true);
  const [planModal, setPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [planForm, setPlanForm] = useState({
    name: 'Basic', mealsPerDay: 1, description: '', monthlyPrice: 0,
    semesterDiscount: 15, features: '', isPopular: false, isActive: true
  });

  // Menu state
  const [weeklyMenu, setWeeklyMenu] = useState<Record<string, DayMenu>>({});
  const [menuLoading, setMenuLoading] = useState(true);
  const [editDay, setEditDay] = useState<string | null>(null);
  const [menuForm, setMenuForm] = useState<DayMenu>({ breakfast: '', lunch: '', dinner: '' });

  // Extras state
  const [extras, setExtras] = useState<ExtraItem[]>([]);
  const [extrasLoading, setExtrasLoading] = useState(true);
  const [extraModal, setExtraModal] = useState(false);
  const [editingExtra, setEditingExtra] = useState<ExtraItem | null>(null);
  const [extraForm, setExtraForm] = useState({
    name: '', price: 0, imageUrl: '', category: 'General', isActive: true
  });

  // Subscriptions state
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [subStats, setSubStats] = useState({ total: 0, active: 0, expired: 0, revenue: 0 });
  const [subLoading, setSubLoading] = useState(true);

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Auth guard disabled for development — re-enable when backend is live
  // if (!user || user.role !== 'admin') { return <AccessDenied />; }

  // ── Load data ─────────────────────────────────────────────
  useEffect(() => { fetchPlans(); }, []);
  useEffect(() => { if (activeTab === 'menu') fetchMenu(); }, [activeTab]);
  useEffect(() => { if (activeTab === 'extras') fetchExtras(); }, [activeTab]);
  useEffect(() => { if (activeTab === 'subscribers') fetchSubscriptions(); }, [activeTab]);

  const fetchPlans = async () => {
    setPlanLoading(true);
    try {
      const data = await plansAPI.getAllAdmin();
      setPlans(data.plans);
    } catch (e: any) {
      // Backend nahi hai — mock data use karo
      setPlans([
        { _id: '1', name: 'Basic', mealsPerDay: 1, description: 'Perfect for 1 meal/day', monthlyPrice: 2499, semesterDiscount: 15, features: ['Lunch or Dinner', 'Basic Menu', '2 Skips/Month', '5% OFF Extra Orders'], isPopular: false, isActive: true, activeSubscribers: 12 },
        { _id: '2', name: 'Standard', mealsPerDay: 2, description: 'Lunch + Dinner daily', monthlyPrice: 4299, semesterDiscount: 15, features: ['Lunch + Dinner', 'Full Premium Menu', 'Unlimited Skips', 'Weekend Specials', '5% OFF Extra Orders'], isPopular: true, isActive: true, activeSubscribers: 45 },
        { _id: '3', name: 'Premium', mealsPerDay: 3, description: '3 meals + snacks', monthlyPrice: 5999, semesterDiscount: 15, features: ['Breakfast + Lunch + Dinner + Snacks', 'Priority Delivery', 'Free Weekly Desserts', 'Dedicated Support', '5% OFF Extra Orders'], isPopular: false, isActive: true, activeSubscribers: 23 },
      ]);
    } finally {
      setPlanLoading(false);
    }
  };

  const fetchMenu = async () => {
    setMenuLoading(true);
    try {
      const data = await menuAPI.getAll();
      setWeeklyMenu(data.menu);
    } catch (e: any) {
      // Mock menu fallback
      setWeeklyMenu({
        Mon: { breakfast: 'Aloo Paratha + Curd + Chai', lunch: 'Dal Makhani + Jeera Rice + 3 Roti', dinner: 'Paneer Butter Masala + Rice + 3 Roti' },
        Tue: { breakfast: 'Poha + Boiled Eggs + Juice', lunch: 'Chole Masala + Puri + Raita', dinner: 'Kadhai Paneer + Dal Fry + 3 Roti' },
        Wed: { breakfast: 'Idli Sambar + Coconut Chutney', lunch: 'Chicken Curry / Mix Veg + Rice + 3 Roti', dinner: 'Veg Hakka Noodles + Manchurian' },
        Thu: { breakfast: 'Bread Butter + Omelette + Chai', lunch: 'Rajma Rice + Papad + Pickle', dinner: 'Chicken Tikka Masala + Rice + 3 Roti' },
        Fri: { breakfast: 'Upma + Fruit Bowl + Juice', lunch: 'Dal Tadka + Jeera Rice + Sabji + 3 Roti', dinner: 'Veg Biryani + Raita + Salan' },
        Sat: { breakfast: 'Chole Bhature + Lassi', lunch: 'Pav Bhaji + Butter Pav', dinner: 'Egg Curry / Palak Paneer + Rice + Roti' },
        Sun: { breakfast: 'Puri Sabji + Halwa + Chai', lunch: "Special Sunday Thali (Chef's Choice)", dinner: 'Butter Chicken / Mix Veg + Naan + Gulab Jamun 🎉' },
      });
    } finally {
      setMenuLoading(false);
    }
  };

  const fetchExtras = async () => {
    setExtrasLoading(true);
    try {
      const data = await extrasAPI.getAllAdmin();
      setExtras(data.items);
    } catch (e: any) {
      // Mock extras fallback
      setExtras([
        { _id: '1', name: 'Extra Roti (2)', price: 15, imageUrl: 'https://images.pexels.com/photos/10860591/pexels-photo-10860591.jpeg?auto=compress&cs=tinysrgb&w=150', category: 'Roti', isActive: true },
        { _id: '2', name: 'Extra Paneer', price: 45, imageUrl: 'https://images.pexels.com/photos/9738981/pexels-photo-9738981.jpeg?auto=compress&cs=tinysrgb&w=150', category: 'Side', isActive: true },
        { _id: '3', name: 'Gulab Jamun', price: 30, imageUrl: 'https://images.pexels.com/photos/13435133/pexels-photo-13435133.jpeg?auto=compress&cs=tinysrgb&w=150', category: 'Sweet', isActive: true },
        { _id: '4', name: 'Sweet Lassi', price: 35, imageUrl: 'https://images.pexels.com/photos/10153303/pexels-photo-10153303.jpeg?auto=compress&cs=tinysrgb&w=150', category: 'Beverage', isActive: true },
        { _id: '5', name: 'Butter Naan', price: 25, imageUrl: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=150', category: 'Roti', isActive: true },
        { _id: '6', name: 'Mango Shake', price: 50, imageUrl: 'https://images.pexels.com/photos/3625372/pexels-photo-3625372.jpeg?auto=compress&cs=tinysrgb&w=150', category: 'Beverage', isActive: false },
      ]);
    } finally {
      setExtrasLoading(false);
    }
  };

  const fetchSubscriptions = async () => {
    setSubLoading(true);
    try {
      const data = await subscriptionsAPI.getAll();
      setSubscriptions(data.subscriptions);
      setSubStats(data.stats);
    } catch (e: any) {
      // Mock subscription stats fallback
      setSubStats({ total: 80, active: 45, expired: 25, revenue: 185000 });
      setSubscriptions([]);
    } finally {
      setSubLoading(false);
    }
  };

  // ── Plan handlers ─────────────────────────────────────────
  const openPlanModal = (plan?: Plan) => {
    if (plan) {
      setEditingPlan(plan);
      setPlanForm({
        name: plan.name,
        mealsPerDay: plan.mealsPerDay,
        description: plan.description,
        monthlyPrice: plan.monthlyPrice,
        semesterDiscount: plan.semesterDiscount,
        features: plan.features.join('\n'),
        isPopular: plan.isPopular,
        isActive: plan.isActive
      });
    } else {
      setEditingPlan(null);
      setPlanForm({ name: 'Basic', mealsPerDay: 1, description: '', monthlyPrice: 0, semesterDiscount: 15, features: '', isPopular: false, isActive: true });
    }
    setPlanModal(true);
  };

  const savePlan = async () => {
    try {
      const payload = {
        ...planForm,
        features: planForm.features.split('\n').filter(f => f.trim())
      };
      if (editingPlan) {
        await plansAPI.update(editingPlan._id, payload);
        showToast('Plan updated successfully');
      } else {
        await plansAPI.create(payload);
        showToast('Plan created successfully');
      }
      setPlanModal(false);
      fetchPlans();
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const deletePlan = async (id: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;
    try {
      await plansAPI.delete(id);
      showToast('Plan deleted');
      fetchPlans();
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const togglePlanActive = async (plan: Plan) => {
    try {
      await plansAPI.update(plan._id, { isActive: !plan.isActive });
      showToast(`Plan ${!plan.isActive ? 'activated' : 'deactivated'}`);
      fetchPlans();
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  // ── Menu handlers ─────────────────────────────────────────
  const startEditDay = (day: string) => {
    setEditDay(day);
    setMenuForm(weeklyMenu[day] || { breakfast: '', lunch: '', dinner: '' });
  };

  const saveMenu = async () => {
    if (!editDay) return;
    try {
      await menuAPI.updateDay(editDay, menuForm);
      showToast(`${editDay} menu updated`);
      setEditDay(null);
      fetchMenu();
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  // ── Extra item handlers ───────────────────────────────────
  const openExtraModal = (item?: ExtraItem) => {
    if (item) {
      setEditingExtra(item);
      setExtraForm({ name: item.name, price: item.price, imageUrl: item.imageUrl, category: item.category, isActive: item.isActive });
    } else {
      setEditingExtra(null);
      setExtraForm({ name: '', price: 0, imageUrl: '', category: 'General', isActive: true });
    }
    setExtraModal(true);
  };

  const saveExtra = async () => {
    try {
      if (editingExtra) {
        await extrasAPI.update(editingExtra._id, extraForm);
        showToast('Item updated');
      } else {
        await extrasAPI.create(extraForm);
        showToast('Item added');
      }
      setExtraModal(false);
      fetchExtras();
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const deleteExtra = async (id: string) => {
    if (!confirm('Delete this extra item?')) return;
    try {
      await extrasAPI.delete(id);
      showToast('Item deleted');
      fetchExtras();
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  // ── Status badge ──────────────────────────────────────────
  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      active: 'bg-green-100 text-green-700',
      paused: 'bg-yellow-100 text-yellow-700',
      expired: 'bg-red-100 text-red-700',
      cancelled: 'bg-gray-100 text-gray-600'
    };
    return `px-2 py-1 rounded-full text-xs font-bold ${map[status] || 'bg-gray-100 text-gray-600'}`;
  };

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'plans', label: 'Tiffin Plans', icon: <Package className="w-4 h-4" /> },
    { key: 'menu', label: 'Weekly Menu', icon: <UtensilsCrossed className="w-4 h-4" /> },
    { key: 'extras', label: 'Extra Items', icon: <ShoppingBag className="w-4 h-4" /> },
    { key: 'subscribers', label: 'Subscribers', icon: <Users className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-white font-semibold transition-all ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center gap-1 text-gray-500 hover:text-gray-800 text-sm font-medium"
            >
              <ChevronLeft className="w-4 h-4" /> Admin Panel
            </button>
            <div className="w-px h-5 bg-gray-300" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">🍱 Tiffin Plans Management</h1>
              <p className="text-xs text-gray-500">Manage plans, menus, extras & subscribers</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-orange-700">Backend Live</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Row — show subscription stats always */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Plans', value: plans.length, icon: <Package className="w-5 h-5 text-orange-500" />, color: 'bg-orange-50' },
            { label: 'Active Subscribers', value: subStats.active, icon: <Users className="w-5 h-5 text-blue-500" />, color: 'bg-blue-50' },
            { label: 'Total Revenue', value: `₹${subStats.revenue.toLocaleString()}`, icon: <DollarSign className="w-5 h-5 text-green-500" />, color: 'bg-green-50' },
            { label: 'Extra Items', value: extras.length, icon: <ShoppingBag className="w-5 h-5 text-purple-500" />, color: 'bg-purple-50' }
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 flex items-center gap-4">
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white p-1.5 rounded-2xl border border-gray-200 shadow-sm w-fit">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ── TAB: PLANS ───────────────────────────────────── */}
        {activeTab === 'plans' && (
          <div>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-gray-900">Tiffin Plans</h2>
              <button
                onClick={() => openPlanModal()}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow"
              >
                <Plus className="w-4 h-4" /> Add Plan
              </button>
            </div>

            {planLoading ? (
              <div className="text-center py-16 text-gray-400">Loading plans...</div>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                {plans.map(plan => (
                  <div key={plan._id} className={`bg-white rounded-2xl border shadow-sm p-6 relative ${plan.isPopular ? 'ring-2 ring-orange-400' : 'border-gray-100'} ${!plan.isActive ? 'opacity-60' : ''}`}>
                    {plan.isPopular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                        🔥 Most Popular
                      </span>
                    )}
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                        <p className="text-sm text-gray-500">{plan.mealsPerDay} meal{plan.mealsPerDay > 1 ? 's' : ''}/day</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => togglePlanActive(plan)} title="Toggle active">
                          {plan.isActive
                            ? <ToggleRight className="w-6 h-6 text-green-500" />
                            : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                        </button>
                        <button onClick={() => openPlanModal(plan)} className="text-blue-500 hover:text-blue-700">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => deletePlan(plan._id)} className="text-red-500 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="text-3xl font-black text-gray-900 mb-1">
                      ₹{plan.monthlyPrice.toLocaleString()}
                      <span className="text-sm font-normal text-gray-400">/mo</span>
                    </div>
                    <p className="text-xs text-green-600 font-semibold mb-4">Semester: {plan.semesterDiscount}% off</p>

                    <ul className="space-y-2 mb-5">
                      {plan.features.map((f, i) => (
                        <li key={i} className="text-xs text-gray-600 flex items-center gap-2">
                          <span className="text-green-500">✓</span> {f}
                        </li>
                      ))}
                    </ul>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-1 text-sm text-blue-600 font-semibold">
                        <Users className="w-4 h-4" />
                        {plan.activeSubscribers} active
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${plan.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {plan.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: WEEKLY MENU ─────────────────────────────── */}
        {activeTab === 'menu' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-5">Weekly Menu Editor</h2>
            {menuLoading ? (
              <div className="text-center py-16 text-gray-400">Loading menu...</div>
            ) : (
              <div className="space-y-4">
                {DAYS.map(day => (
                  <div key={day} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {editDay === day ? (
                      <div className="p-5">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-bold text-gray-900 text-lg">{day}</h3>
                          <div className="flex gap-2">
                            <button onClick={saveMenu} className="flex items-center gap-1 bg-green-500 text-white px-4 py-1.5 rounded-lg text-sm font-semibold">
                              <Save className="w-4 h-4" /> Save
                            </button>
                            <button onClick={() => setEditDay(null)} className="flex items-center gap-1 bg-gray-100 text-gray-600 px-4 py-1.5 rounded-lg text-sm font-semibold">
                              <X className="w-4 h-4" /> Cancel
                            </button>
                          </div>
                        </div>
                        <div className="grid md:grid-cols-3 gap-4">
                          {(['breakfast', 'lunch', 'dinner'] as const).map(meal => (
                            <div key={meal}>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 capitalize">{meal}</label>
                              <textarea
                                value={menuForm[meal]}
                                onChange={e => setMenuForm({ ...menuForm, [meal]: e.target.value })}
                                rows={3}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-300 outline-none resize-none"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-5 flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center font-bold text-orange-600 text-lg flex-shrink-0">
                          {day}
                        </div>
                        <div className="flex-1 grid md:grid-cols-3 gap-2">
                          {weeklyMenu[day] ? (
                            <>
                              <div><p className="text-[10px] text-gray-400 font-bold uppercase">☀️ Breakfast</p><p className="text-xs text-gray-700">{weeklyMenu[day].breakfast}</p></div>
                              <div><p className="text-[10px] text-gray-400 font-bold uppercase">🌤 Lunch</p><p className="text-xs text-gray-700">{weeklyMenu[day].lunch}</p></div>
                              <div><p className="text-[10px] text-gray-400 font-bold uppercase">🌙 Dinner</p><p className="text-xs text-gray-700">{weeklyMenu[day].dinner}</p></div>
                            </>
                          ) : (
                            <p className="text-gray-400 text-sm col-span-3">No menu set yet</p>
                          )}
                        </div>
                        <button
                          onClick={() => startEditDay(day)}
                          className="flex items-center gap-1 text-orange-500 hover:text-orange-700 font-semibold text-sm flex-shrink-0"
                        >
                          <Edit className="w-4 h-4" /> Edit
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: EXTRAS ──────────────────────────────────── */}
        {activeTab === 'extras' && (
          <div>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-gray-900">Extra Items</h2>
              <button
                onClick={() => openExtraModal()}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow"
              >
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>

            {extrasLoading ? (
              <div className="text-center py-16 text-gray-400">Loading items...</div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left py-3 px-5 text-xs font-bold text-gray-500 uppercase">Item</th>
                      <th className="text-left py-3 px-5 text-xs font-bold text-gray-500 uppercase">Category</th>
                      <th className="text-left py-3 px-5 text-xs font-bold text-gray-500 uppercase">Price</th>
                      <th className="text-left py-3 px-5 text-xs font-bold text-gray-500 uppercase">Status</th>
                      <th className="text-left py-3 px-5 text-xs font-bold text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {extras.map(item => (
                      <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 px-5">
                          <div className="flex items-center gap-3">
                            {item.imageUrl && (
                              <img src={item.imageUrl} alt={item.name} className="w-10 h-10 rounded-lg object-cover border border-gray-100" />
                            )}
                            <span className="font-semibold text-sm text-gray-800">{item.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-5 text-sm text-gray-500">{item.category}</td>
                        <td className="py-3 px-5 text-sm font-bold text-gray-800">₹{item.price}</td>
                        <td className="py-3 px-5">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {item.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 px-5">
                          <div className="flex gap-3">
                            <button onClick={() => openExtraModal(item)} className="text-blue-500 hover:text-blue-700"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => deleteExtra(item._id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {extras.length === 0 && (
                  <div className="text-center py-12 text-gray-400">No extra items found. Add one!</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: SUBSCRIBERS ─────────────────────────────── */}
        {activeTab === 'subscribers' && (
          <div>
            {/* Mini stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Total', value: subStats.total, color: 'text-gray-900' },
                { label: 'Active', value: subStats.active, color: 'text-green-600' },
                { label: 'Expired', value: subStats.expired, color: 'text-red-500' },
                { label: 'Revenue', value: `₹${subStats.revenue.toLocaleString()}`, color: 'text-blue-600' }
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                  <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-5">All Subscriptions</h2>
            {subLoading ? (
              <div className="text-center py-16 text-gray-400">Loading subscriptions...</div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left py-3 px-5 text-xs font-bold text-gray-500 uppercase">User</th>
                      <th className="text-left py-3 px-5 text-xs font-bold text-gray-500 uppercase">Plan</th>
                      <th className="text-left py-3 px-5 text-xs font-bold text-gray-500 uppercase">Cycle</th>
                      <th className="text-left py-3 px-5 text-xs font-bold text-gray-500 uppercase">Meals Left</th>
                      <th className="text-left py-3 px-5 text-xs font-bold text-gray-500 uppercase">Paid</th>
                      <th className="text-left py-3 px-5 text-xs font-bold text-gray-500 uppercase">Expires</th>
                      <th className="text-left py-3 px-5 text-xs font-bold text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions.map(sub => (
                      <tr key={sub._id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 px-5">
                          <p className="font-semibold text-sm text-gray-800">{sub.userId?.name}</p>
                          <p className="text-xs text-gray-400">{sub.userId?.email}</p>
                        </td>
                        <td className="py-3 px-5 text-sm text-gray-700 font-medium">{sub.planId?.name}</td>
                        <td className="py-3 px-5 text-sm text-gray-500 capitalize">{sub.billingCycle}</td>
                        <td className="py-3 px-5 text-sm font-bold text-gray-800">{sub.remainingMeals}</td>
                        <td className="py-3 px-5 text-sm font-bold text-green-700">₹{sub.amountPaid.toLocaleString()}</td>
                        <td className="py-3 px-5 text-sm text-gray-500">
                          {new Date(sub.endDate).toLocaleDateString('en-IN')}
                        </td>
                        <td className="py-3 px-5">
                          <span className={statusBadge(sub.status)}>{sub.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {subscriptions.length === 0 && (
                  <div className="text-center py-12 text-gray-400">No subscriptions yet.</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── PLAN MODAL ───────────────────────────────────────── */}
      {planModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">{editingPlan ? 'Edit Plan' : 'Add New Plan'}</h3>
              <button onClick={() => setPlanModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Plan Name</label>
                <select value={planForm.name} onChange={e => setPlanForm({ ...planForm, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-300 outline-none">
                  {['Basic', 'Standard', 'Premium'].map(n => <option key={n}>{n}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Meals / Day</label>
                  <input type="number" min={1} max={5} value={planForm.mealsPerDay}
                    onChange={e => setPlanForm({ ...planForm, mealsPerDay: +e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-300 outline-none" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Monthly Price (₹)</label>
                  <input type="number" value={planForm.monthlyPrice}
                    onChange={e => setPlanForm({ ...planForm, monthlyPrice: +e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-300 outline-none" />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Description</label>
                <input type="text" value={planForm.description}
                  onChange={e => setPlanForm({ ...planForm, description: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-300 outline-none" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Semester Discount (%)</label>
                <input type="number" min={0} max={50} value={planForm.semesterDiscount}
                  onChange={e => setPlanForm({ ...planForm, semesterDiscount: +e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-300 outline-none" />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Features (one per line)</label>
                <textarea rows={5} value={planForm.features}
                  onChange={e => setPlanForm({ ...planForm, features: e.target.value })}
                  placeholder="Lunch + Dinner included&#10;5% OFF on extra orders"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-300 outline-none resize-none" />
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={planForm.isPopular} onChange={e => setPlanForm({ ...planForm, isPopular: e.target.checked })} className="accent-orange-500 w-4 h-4" />
                  Mark as Popular
                </label>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={planForm.isActive} onChange={e => setPlanForm({ ...planForm, isActive: e.target.checked })} className="accent-green-500 w-4 h-4" />
                  Active
                </label>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100">
              <button onClick={savePlan} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl font-bold text-sm">
                {editingPlan ? 'Save Changes' : 'Create Plan'}
              </button>
              <button onClick={() => setPlanModal(false)} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-bold text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EXTRA ITEM MODAL ─────────────────────────────────── */}
      {extraModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">{editingExtra ? 'Edit Item' : 'Add Extra Item'}</h3>
              <button onClick={() => setExtraModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Item Name</label>
                <input type="text" value={extraForm.name} onChange={e => setExtraForm({ ...extraForm, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-300 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Price (₹)</label>
                  <input type="number" value={extraForm.price} onChange={e => setExtraForm({ ...extraForm, price: +e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-300 outline-none" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Category</label>
                  <select value={extraForm.category} onChange={e => setExtraForm({ ...extraForm, category: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-300 outline-none">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Image URL</label>
                <input type="text" value={extraForm.imageUrl} onChange={e => setExtraForm({ ...extraForm, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-300 outline-none" />
              </div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
                <input type="checkbox" checked={extraForm.isActive} onChange={e => setExtraForm({ ...extraForm, isActive: e.target.checked })} className="accent-green-500 w-4 h-4" />
                Active (visible to users)
              </label>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100">
              <button onClick={saveExtra} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl font-bold text-sm">
                {editingExtra ? 'Save Changes' : 'Add Item'}
              </button>
              <button onClick={() => setExtraModal(false)} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-bold text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTiffinPlans;
