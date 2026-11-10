import React, { useState, useEffect } from 'react';
import {
  Utensils,
  Calendar,
  Users,
  DollarSign,
  Package,
  Clock,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Sun,
  Moon,
  RotateCcw,
  Truck,
  MessageSquare,
  Settings,
  Search,
  Eye,
  Play,
  Pause,
  ChefHat,
  ChevronRight,
  TrendingUp,
  MapPin,
  Send,
  Sparkles,
  Zap,
  Phone,
  Bike,
  Compass,
  CheckCircle2,
  Menu as MenuIcon,
  X,
  ShieldCheck,
  Star,
  ArrowUpRight,
  Mail,
  Copy,
  Wallet,
  CreditCard,
  Check,
  ShoppingBag,
  Filter,
  Receipt,
  History,
  CalendarDays,
  ExternalLink,
  FileText,
  Tag,
  UtensilsCrossed,
  Leaf,
  LayoutDashboard,
  ArrowRight,
  Printer,
  RefreshCw,
  CheckCheck,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Download,
  CloudRain,
  Layers,
  Calculator
} from 'lucide-react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { plansAPI, menuAPI, extrasAPI, subscriptionsAPI, adminAPI, dishesAPI } from '../services/api';
import TiffinMateLogo from '../components/TiffinMateLogo';
import DeliveryRidersSuite from '../components/admin/DeliveryRidersSuite';
import RiderEarningsReport from '../components/admin/RiderEarningsReport';

// ─── TYPES ────────────────────────────────────────────────────────
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
  activeSubscribers?: number;
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

const DEFAULT_EXTRAS: ExtraItem[] = [
  { _id: 'extra-1', name: 'Extra Butter Roti (2 pcs)', price: 15, imageUrl: 'https://images.pexels.com/photos/10860591/pexels-photo-10860591.jpeg?auto=compress&cs=tinysrgb&w=200', category: 'Roti', isActive: true },
  { _id: 'extra-2', name: 'Fresh Paneer Bhurji / Gravy', price: 45, imageUrl: 'https://images.pexels.com/photos/9738981/pexels-photo-9738981.jpeg?auto=compress&cs=tinysrgb&w=200', category: 'Side', isActive: true },
  { _id: 'extra-3', name: 'Hot Gulab Jamun (2 pcs)', price: 30, imageUrl: 'https://images.pexels.com/photos/13435133/pexels-photo-13435133.jpeg?auto=compress&cs=tinysrgb&w=200', category: 'Sweet', isActive: true },
  { _id: 'extra-4', name: 'Fresh Curd / Boondi Raita', price: 20, imageUrl: 'https://images.pexels.com/photos/4113888/pexels-photo-4113888.jpeg?auto=compress&cs=tinysrgb&w=200', category: 'Side', isActive: true },
  { _id: 'extra-5', name: 'Chilled Sweet Lassi', price: 35, imageUrl: 'https://images.pexels.com/photos/10153303/pexels-photo-10153303.jpeg?auto=compress&cs=tinysrgb&w=200', category: 'Beverage', isActive: true },
  { _id: 'extra-6', name: 'Boiled Eggs (2 pcs)', price: 25, imageUrl: 'https://images.pexels.com/photos/824635/pexels-photo-824635.jpeg?auto=compress&cs=tinysrgb&w=200', category: 'Side', isActive: true },
  { _id: 'extra-7', name: 'Mango / Banana Shake', price: 50, imageUrl: 'https://images.pexels.com/photos/3625372/pexels-photo-3625372.jpeg?auto=compress&cs=tinysrgb&w=200', category: 'Beverage', isActive: true },
  { _id: 'extra-8', name: 'Steamed Jeera Rice Bowl', price: 40, imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=200', category: 'Side', isActive: true },
  { _id: 'extra-9', name: 'Crispy Roasted Papad (2)', price: 10, imageUrl: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=200', category: 'Side', isActive: true },
  { _id: 'extra-10', name: 'Desi Achar & Green Chutney', price: 10, imageUrl: 'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg?auto=compress&cs=tinysrgb&w=200', category: 'Side', isActive: true }
];

const DEFAULT_EXTRA_ORDERS = [
  {
    _id: 'ord-extra-1',
    orderId: 'EXT-9421',
    customerName: 'Aarav Patel',
    customerPhone: '+91 98765 43210',
    deliveryAddress: 'Tagore Hostel, Room 204 (NC-01)',
    mealSlot: 'Lunch Tiffin',
    items: [
      { name: 'Extra Butter Roti (2 pcs)', price: 15, quantity: 2, image: 'https://images.pexels.com/photos/10860591/pexels-photo-10860591.jpeg?auto=compress&cs=tinysrgb&w=200' },
      { name: 'Hot Gulab Jamun (2 pcs)', price: 30, quantity: 1, image: 'https://images.pexels.com/photos/13435133/pexels-photo-13435133.jpeg?auto=compress&cs=tinysrgb&w=200' }
    ],
    totalAmount: 60,
    paymentMethod: 'Bitez Campus Wallet',
    status: 'preparing',
    isExtraOrder: true,
    orderType: 'extra_addon',
    deliverWithMeal: true,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'ord-extra-2',
    orderId: 'EXT-9422',
    customerName: 'Sneha Sharma',
    customerPhone: '+91 98123 45678',
    deliveryAddress: 'Sarojini Hostel, Room 112 (SC-02)',
    mealSlot: 'Dinner Tiffin',
    items: [
      { name: 'Fresh Paneer Bhurji', price: 45, quantity: 1, image: 'https://images.pexels.com/photos/9738981/pexels-photo-9738981.jpeg?auto=compress&cs=tinysrgb&w=200' },
      { name: 'Chilled Sweet Lassi', price: 35, quantity: 1, image: 'https://images.pexels.com/photos/10153303/pexels-photo-10153303.jpeg?auto=compress&cs=tinysrgb&w=200' }
    ],
    totalAmount: 80,
    paymentMethod: 'Bitez Campus Wallet',
    status: 'confirmed',
    isExtraOrder: true,
    orderType: 'extra_addon',
    deliverWithMeal: true,
    createdAt: new Date(Date.now() - 15 * 60000).toISOString()
  },
  {
    _id: 'ord-extra-3',
    orderId: 'EXT-9423',
    customerName: 'Rohan Mehra',
    customerPhone: '+91 98456 12345',
    deliveryAddress: 'Ramanujan Hostel, Room 305 (NC-02)',
    mealSlot: 'Lunch Tiffin',
    items: [
      { name: 'Fresh Curd / Boondi Raita', price: 20, quantity: 1, image: 'https://images.pexels.com/photos/4113888/pexels-photo-4113888.jpeg?auto=compress&cs=tinysrgb&w=200' },
      { name: 'Extra Butter Roti (2 pcs)', price: 15, quantity: 1, image: 'https://images.pexels.com/photos/10860591/pexels-photo-10860591.jpeg?auto=compress&cs=tinysrgb&w=200' }
    ],
    totalAmount: 35,
    paymentMethod: 'Bitez Campus Wallet',
    status: 'delivered',
    isExtraOrder: true,
    orderType: 'extra_addon',
    deliverWithMeal: true,
    createdAt: new Date(Date.now() - 90 * 60000).toISOString()
  }
];

interface Subscription {
  _id: string;
  userId?: { 
    _id?: string;
    id?: string;
    name: string; 
    email: string; 
    phone: string; 
    walletBalance?: number;
    deliveryAddress?: string;
    hostel?: string; 
    roomNumber?: string;
  };
  planId?: { 
    _id?: string; 
    name: string; 
    monthlyPrice: number; 
    mealsPerDay?: number;
    description?: string;
    features?: string[];
  };
  billingCycle: string;
  status: 'active' | 'paused' | 'expired' | 'cancelled';
  remainingMeals: number;
  totalMeals?: number;
  amountPaid: number;
  startDate?: string;
  endDate: string;
  hostelAddress?: string;
  room?: string;
  zoneCode?: string;
  paymentMethod?: string;
  dietPreference?: string;
  skippedMeals?: number;
  walletCredits?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface Rider {
  id: string;
  name: string;
  phone: string;
  route: string;
  vehicle: string;
  status: 'available' | 'on-route' | 'busy' | 'offline';
  deliveriesToday: number;
  activeTiffins: number;
  rating: number;
}

interface DeliveryRoute {
  id: string;
  name: string;
  zone: string;
  hostels: string[];
  assignedRider: string;
  tiffinCount: number;
  deliveredCount: number;
  status: 'preparing' | 'on-route' | 'completed';
  slot: 'Lunch' | 'Dinner';
  eta: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  code: string;
  pincode: string;
  areas: string[];
  deliveryCharge: number;
  timingSlots: { lunch: string; dinner: string };
  assignedRider: string;
  dailyTiffinCapacity: number;
  activeDeliveries: number;
  status: 'active' | 'busy' | 'paused';
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function AdminPanel() {
  const { user } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') || location.state?.tab;
  const [activeTab, setActiveTab] = useState(tabParam || 'overview');

  useEffect(() => {
    const t = searchParams.get('tab') || location.state?.tab;
    if (t) {
      setActiveTab(t);
      if (t === 'extras') {
        const subTab = searchParams.get('subTab');
        setExtrasActiveTab(subTab === 'orders' ? 'orders' : (subTab === 'requests' ? 'requests' : 'catalog'));
      }
    }
  }, [location.state, searchParams]);
  const [search, setSearch] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [backendConnected, setBackendConnected] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [liveOrders, setLiveOrders] = useState<any[]>([]);

  // Current day key for dynamic weekly menu & operations
  const todayDayKey = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()];

  // ── Live Data States ──
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    todayMeals: 0,
    monthlyRevenue: 0,
    openTickets: 0,
    pendingDeliveries: 0
  });

  const [plans, setPlans] = useState<Plan[]>([]);
  const [weeklyMenu, setWeeklyMenu] = useState<Record<string, DayMenu>>({});
  const [extras, setExtras] = useState<ExtraItem[]>(DEFAULT_EXTRAS);
  const [subscribers, setSubscribers] = useState<Subscription[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [dishes, setDishes] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [couponsList, setCouponsList] = useState<any[]>([]);

  // ── DISHES MANAGEMENT STATE ──
  const [dishModalOpen, setDishModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<any | null>(null);
  const [dishFilterCat, setDishFilterCat] = useState<string>('all');
  const [dishSearchQuery, setDishSearchQuery] = useState<string>('');
  const [dishDietFilter, setDishDietFilter] = useState<'all' | 'veg' | 'nonveg'>('all');
  const [dishAvailabilityFilter, setDishAvailabilityFilter] = useState<'all' | 'in_stock' | 'out_of_stock'>('all');
  const [dishForm, setDishForm] = useState({
    name: '',
    category: 'thali',
    price: 130,
    originalPrice: 160,
    image: 'https://images.pexels.com/photos/12737656/pexels-photo-12737656.jpeg?auto=compress&cs=tinysrgb&w=400',
    isVeg: true,
    isAvailable: true,
    prepTime: '20 mins',
    serves: '1 Person',
    description: 'Freshly prepared homestyle food with pure desi ingredients',
    calories: 450,
    protein: '16g',
    spiceLevel: 'Medium' as 'Mild' | 'Medium' | 'Spicy',
    tag: 'Chef Special 🍛',
    ingredients: 'Fresh Paneer, Desi Ghee, Basmati Rice, Indian Spices'
  });

  // ── USERS & WALLET MANAGEMENT STATE ──
  const [userWalletModalOpen, setUserWalletModalOpen] = useState(false);
  const [selectedUserForWallet, setSelectedUserForWallet] = useState<any | null>(null);
  const [walletCreditAmount, setWalletCreditAmount] = useState<number>(100);
  const [walletCreditReason, setWalletCreditReason] = useState<string>('Goodwill credit from mess manager');

  // ── COUPONS & PROMOS MANAGEMENT STATE ──
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    type: 'Percentage' as 'Percentage' | 'Flat',
    value: 20,
    minOrder: 149,
    maxUsage: 200,
    expiry: '2026-12-31',
    desc: 'Flat 20% OFF on all campus orders'
  });

  const [loading, setLoading] = useState(true);

  // ── COMPLAINTS, USER ROLES & KITCHEN SETTINGS STATES ──
  const [complaintFilter, setComplaintFilter] = useState<'all' | 'pending' | 'resolved'>('all');
  const [complaintSearch, setComplaintSearch] = useState<string>('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'customer' | 'admin'>('all');
  const [kitchenSettings, setKitchenSettings] = useState({
    kitchenName: 'Bitez Campus Kitchen',
    helplinePhone: '+91 99999 99999',
    helplineEmail: 'kitchen@bitez.in',
    skipCutoff: '08:00 AM',
    breakfastSlot: '07:30 AM - 09:30 AM',
    lunchSlot: '12:30 PM - 02:00 PM',
    dinnerSlot: '07:30 PM - 09:30 PM',
    hostelZones: 'North Campus Hostels (Tagore, Sarojini, Raman)\nSouth Campus PGs (Block A, B, C)\nGTB Nagar & Mukherjee Nagar student rooms',
    autoApproveSkips: false,
    smsNotifications: true,
    status: 'operational' as 'operational' | 'busy' | 'maintenance'
  });

  // ── SIDEBAR ACCORDION COLLAPSE STATE ──
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const toggleGroup = (title: string) => {
    setCollapsedGroups(prev => ({ ...prev, [title]: !prev[title] }));
  };

  // ── SUBSCRIPTION SYSTEM FILTER & MODAL STATES ──
  const [subFilter, setSubFilter] = useState<'All' | 'active' | 'paused' | 'expired' | 'cancelled'>('All');
  const [subPlanFilter, setSubPlanFilter] = useState<string>('All');
  const [subZoneFilter, setSubZoneFilter] = useState<string>('All');
  const [subscribeModalOpen, setSubscribeModalOpen] = useState(false);
  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [selectedSubForExtend, setSelectedSubForExtend] = useState<Subscription | null>(null);
  const [subscriberDetailModalOpen, setSubscriberDetailModalOpen] = useState(false);
  const [selectedSubscriber, setSelectedSubscriber] = useState<Subscription | null>(null);

  // ── SUBSCRIBER ORDER HISTORY MODAL & FILTER STATES ──
  const [subscriberOrdersModalOpen, setSubscriberOrdersModalOpen] = useState(false);
  const [selectedSubForOrders, setSelectedSubForOrders] = useState<Subscription | null>(null);
  const [subscriberOrderData, setSubscriberOrderData] = useState<any | null>(null);
  const [loadingSubscriberOrders, setLoadingSubscriberOrders] = useState(false);
  const [subOrdersTab, setSubOrdersTab] = useState<'all' | 'food' | 'tiffins' | 'skips' | 'subs'>('all');
  const [subOrdersStatusFilter, setSubOrdersStatusFilter] = useState<string>('all');
  const [subOrdersSearch, setSubOrdersSearch] = useState<string>('');
  const [subscriberDetailActiveTab, setSubscriberDetailActiveTab] = useState<'overview' | 'orders'>('overview');
  const [orderCustomerTypeFilter, setOrderCustomerTypeFilter] = useState<'all' | 'subscribers' | 'guests' | 'extras'>('all');

  // ── EXTRA ORDERS & ADD-ONS MANAGEMENT STATE ──
  const [extrasActiveTab, setExtrasActiveTab] = useState<'orders' | 'catalog' | 'requests'>('requests');
  const [extraOrdersStatusFilter, setExtraOrdersStatusFilter] = useState<'all' | 'confirmed' | 'preparing' | 'delivered' | 'pack_with_meal'>('all');
  const [extraOrdersSearch, setExtraOrdersSearch] = useState<string>('');
  const [requestFilter, setRequestFilter] = useState<'all' | 'pending' | 'lunch' | 'dinner' | 'dispatched'>('pending');
  const [requestSearch, setRequestSearch] = useState<string>('');
  const [requestRiderSelection, setRequestRiderSelection] = useState<Record<string, string>>({});
  const [dispatchExtrasOnly, setDispatchExtrasOnly] = useState<boolean>(false);
  const [dispatchBreakfastRider, setDispatchBreakfastRider] = useState<string>('');
  const [dispatchLunchRider, setDispatchLunchRider] = useState<string>('');
  const [dispatchDinnerRider, setDispatchDinnerRider] = useState<string>('');
  const [isAssigningShift, setIsAssigningShift] = useState<'Breakfast' | 'Lunch' | 'Dinner' | null>(null);
  const [zoneRiderSelection, setZoneRiderSelection] = useState<Record<string, string>>({});
  const [zoneSlotSelection, setZoneSlotSelection] = useState<Record<string, string>>({});
  const [isAssigningZone, setIsAssigningZone] = useState<string | null>(null);
  const [dispatchAssignMode, setDispatchAssignMode] = useState<'zone' | 'shift'>('shift');
  const [expandedZoneDetails, setExpandedZoneDetails] = useState<Record<string, boolean>>({});

  // ── MESS DELIVERY TIMINGS & KITCHEN CUTOFF MANAGEMENT STATE ──
  const [mealTimings, setMealTimings] = useState({
    breakfast: {
      enabled: true,
      label: 'Morning Breakfast',
      deliveryStart: '08:00',
      deliveryEnd: '09:30',
      deliveryTimeStr: '08:00 AM - 09:30 AM',
      cutoffTime: '07:30',
      cutoffTimeStr: '07:30 AM',
      skipCutoffTime: '07:00',
      skipCutoffTimeStr: '07:00 AM',
      description: 'Hot Parathas, Poha, Fresh Curd & Masala Chai'
    },
    lunch: {
      enabled: true,
      label: 'Lunch Thali',
      deliveryStart: '12:30',
      deliveryEnd: '14:00',
      deliveryTimeStr: '12:30 PM - 02:00 PM',
      cutoffTime: '11:30',
      cutoffTimeStr: '11:30 AM',
      skipCutoffTime: '10:30',
      skipCutoffTimeStr: '10:30 AM',
      description: '4 Butter Phulkas, Dal Tadka, Paneer / Seasonal Sabji, Jeera Rice & Salad'
    },
    dinner: {
      enabled: true,
      label: 'Dinner Feast',
      deliveryStart: '19:30',
      deliveryEnd: '21:00',
      deliveryTimeStr: '07:30 PM - 09:00 PM',
      cutoffTime: '19:00',
      cutoffTimeStr: '07:00 PM',
      skipCutoffTime: '17:30',
      skipCutoffTimeStr: '05:30 PM',
      description: '4 Warm Rotis, Dal Makhani, Mixed Veg Curry, Rice & Sweet / Raita'
    },
    generalNotice: 'Daily hostel mess tiffin delivery. Extra items and skip requests must be placed before kitchen cutoff.'
  });
  const [isSavingTimings, setIsSavingTimings] = useState(false);
  const [timingsNotice, setTimingsNotice] = useState<string | null>(null);

  const format24to12 = (time24: string): string => {
    if (!time24) return '';
    const [hStr, mStr] = time24.split(':');
    let h = parseInt(hStr, 10);
    const m = parseInt(mStr || '0', 10);
    if (isNaN(h)) return time24;
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  const fetchMealTimings = async () => {
    try {
      const res = await adminAPI.getMealTimings();
      if (res?.success && res.timings) {
        setMealTimings(prev => ({
          ...prev,
          ...res.timings,
          breakfast: { ...prev.breakfast, ...(res.timings.breakfast || {}) },
          lunch: { ...prev.lunch, ...(res.timings.lunch || {}) },
          dinner: { ...prev.dinner, ...(res.timings.dinner || {}) }
        }));
      }
    } catch (e) {
      console.warn('Failed to load meal timings:', e);
    }
  };

  const handleSaveMealTimings = async () => {
    setIsSavingTimings(true);
    setTimingsNotice(null);
    try {
      const res = await adminAPI.updateMealTimings(mealTimings);
      if (res?.success && res.timings) {
        setMealTimings(prev => ({
          ...prev,
          ...res.timings,
          breakfast: { ...prev.breakfast, ...(res.timings.breakfast || {}) },
          lunch: { ...prev.lunch, ...(res.timings.lunch || {}) },
          dinner: { ...prev.dinner, ...(res.timings.dinner || {}) }
        }));
        setTimingsNotice('✅ Mess delivery timings and kitchen cutoff rules saved successfully! Live across all student portals.');
        showToast('Mess timings updated successfully!');
        setTimeout(() => setTimingsNotice(null), 6000);
      } else {
        showToast(res?.message || 'Failed to save meal timings', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error saving meal timings', 'error');
    } finally {
      setIsSavingTimings(false);
    }
  };

  const handleResetMealTimings = () => {
    if (!window.confirm('Reset all meal timings to default standard university hours (Breakfast: 08:00 AM, Lunch: 12:30 PM, Dinner: 07:30 PM)?')) return;
    setMealTimings({
      breakfast: {
        enabled: true,
        label: 'Morning Breakfast',
        deliveryStart: '08:00',
        deliveryEnd: '09:30',
        deliveryTimeStr: '08:00 AM - 09:30 AM',
        cutoffTime: '07:30',
        cutoffTimeStr: '07:30 AM',
        skipCutoffTime: '07:00',
        skipCutoffTimeStr: '07:00 AM',
        description: 'Hot Parathas, Poha, Fresh Curd & Masala Chai'
      },
      lunch: {
        enabled: true,
        label: 'Lunch Thali',
        deliveryStart: '12:30',
        deliveryEnd: '14:00',
        deliveryTimeStr: '12:30 PM - 02:00 PM',
        cutoffTime: '11:30',
        cutoffTimeStr: '11:30 AM',
        skipCutoffTime: '10:30',
        skipCutoffTimeStr: '10:30 AM',
        description: '4 Butter Phulkas, Dal Tadka, Paneer / Seasonal Sabji, Jeera Rice & Salad'
      },
      dinner: {
        enabled: true,
        label: 'Dinner Feast',
        deliveryStart: '19:30',
        deliveryEnd: '21:00',
        deliveryTimeStr: '07:30 PM - 09:00 PM',
        cutoffTime: '19:00',
        cutoffTimeStr: '07:00 PM',
        skipCutoffTime: '17:30',
        skipCutoffTimeStr: '05:30 PM',
        description: '4 Warm Rotis, Dal Makhani, Mixed Veg Curry, Rice & Sweet / Raita'
      },
      generalNotice: 'Daily hostel mess tiffin delivery. Extra items and skip requests must be placed before kitchen cutoff.'
    });
  };

  const handleOpenSubscriberDetail = (sub: Subscription) => {
    setSelectedSubscriber(sub);
    setSubscriberDetailActiveTab('overview');
    setSubscriberDetailModalOpen(true);
  };

  // Helper to extract orders for a specific subscriber from liveOrders
  const getOrdersForSubscriber = (sub: Subscription) => {
    const subUid = sub.userId?._id || sub.userId?.id || (typeof sub.userId === 'string' ? sub.userId : '');
    const subName = (sub.userId?.name || '').toLowerCase().trim();
    const subPhone = (sub.userId?.phone || '').trim();

    return liveOrders.filter(o => {
      const oUid = String(o.userId || '');
      if (subUid && oUid === String(subUid)) return true;
      if (subName && (o.customerName || '').toLowerCase().trim() === subName) return true;
      if (subPhone && o.customerPhone && (o.customerPhone.includes(subPhone) || subPhone.includes(o.customerPhone))) return true;
      return false;
    });
  };

  // Helper to check if an order belongs to a subscriber
  const isOrderFromSubscriber = (order: any) => {
    if (order.isSubscriber) return true;
    const oUid = String(order.userId || '');
    const oName = (order.customerName || '').toLowerCase().trim();
    const oPhone = (order.customerPhone || '').trim();

    return subscribers.some(s => {
      const sUid = s.userId?._id || s.userId?.id || (typeof s.userId === 'string' ? s.userId : '');
      const sName = (s.userId?.name || '').toLowerCase().trim();
      const sPhone = (s.userId?.phone || '').trim();
      return (sUid && oUid === String(sUid)) || (sName && oName === sName) || (sPhone && oPhone && (oPhone.includes(sPhone) || sPhone.includes(oPhone)));
    });
  };

  const getSubscriberForOrder = (order: any) => {
    const oUid = String(order.userId || '');
    const oName = (order.customerName || '').toLowerCase().trim();
    const oPhone = (order.customerPhone || '').trim();

    return subscribers.find(s => {
      const sUid = s.userId?._id || s.userId?.id || (typeof s.userId === 'string' ? s.userId : '');
      const sName = (s.userId?.name || '').toLowerCase().trim();
      const sPhone = (s.userId?.phone || '').trim();
      return (sUid && oUid === String(sUid)) || (sName && oName === sName) || (sPhone && oPhone && (oPhone.includes(sPhone) || sPhone.includes(oPhone)));
    });
  };

  const handleOpenSubscriberOrders = async (sub: Subscription) => {
    setSelectedSubForOrders(sub);
    setSubscriberOrdersModalOpen(true);
    setLoadingSubscriberOrders(true);
    setSubOrdersTab('all');
    setSubOrdersStatusFilter('all');
    setSubOrdersSearch('');

    try {
      const res = await adminAPI.getSubscriberOrders(sub._id || (sub as any).id);
      if (res?.success) {
        setSubscriberOrderData(res);
      } else {
        throw new Error('Fallback matching');
      }
    } catch {
      const matchedOrders = getOrdersForSubscriber(sub);
      const studentName = (sub.userId?.name || '').toLowerCase().trim();
      const matchedDispatches = dispatchRoster.filter(d => (d.student || '').toLowerCase().includes(studentName));
      const matchedSkips = skipRequests.filter(s => (s.student || '').toLowerCase().includes(studentName));
      const subHistory = subscribers.filter(s => {
        const sUid = s.userId?._id || s.userId?.id;
        const targetUid = sub.userId?._id || sub.userId?.id;
        return sUid && targetUid && String(sUid) === String(targetUid);
      });

      setSubscriberOrderData({
        orders: matchedOrders,
        dispatches: matchedDispatches,
        skips: matchedSkips,
        subscriptionHistory: subHistory.length ? subHistory : [sub],
        stats: {
          totalOrders: matchedOrders.length,
          totalSpentOrders: matchedOrders.reduce((sum, o: any) => sum + (o.totalAmount || 0), 0),
          deliveredOrders: matchedOrders.filter(o => o.status === 'delivered').length,
          pendingOrders: matchedOrders.filter(o => ['confirmed', 'preparing', 'on-the-way'].includes(o.status)).length,
          dispatchesCount: matchedDispatches.length,
          skipsCount: matchedSkips.length
        }
      });
    } finally {
      setLoadingSubscriberOrders(false);
    }
  };

  const handleQuickUpdateSubOrderStatus = async (orderId: string, status: string, paymentStatus?: string) => {
    await handleUpdateOrderStatus(orderId, status, paymentStatus);
    setSubscriberOrderData((prev: any) => {
      if (!prev) return prev;
      return {
        ...prev,
        orders: prev.orders.map((o: any) => 
          (o.orderId === orderId || o._id === orderId)
            ? { ...o, status, ...(paymentStatus ? { paymentStatus } : (status === 'delivered' && o.paymentMethod === 'Cash on Delivery' ? { paymentStatus: 'paid' } : {})) }
            : o
        )
      };
    });
  };

  const [extendForm, setExtendForm] = useState({
    extraMeals: 10,
    extraDays: 7,
    reason: 'Student requested meal top-up'
  });

  const [subscribeForm, setSubscribeForm] = useState({
    studentName: '',
    studentEmail: '',
    studentPhone: '+91 ',
    hostel: '',
    room: '',
    zoneCode: '',
    planId: '',
    billingCycle: 'monthly' as 'monthly' | 'semester' | 'weekly',
    startDate: new Date().toISOString().split('T')[0],
    amountPaid: 0,
    paymentMethod: 'UPI / GPay',
    dietPreference: 'Standard Homestyle (No Restrictions)'
  });

  // ── Modals & Editing States ──
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [planForm, setPlanForm] = useState({
    name: 'Standard',
    mealsPerDay: 2,
    description: '',
    monthlyPrice: 3999,
    semesterDiscount: 15,
    features: 'Lunch + Dinner\nDaily Homestyle Taste\n2 Skips Allowed\nFree Sunday Feast',
    isPopular: false,
    isActive: true
  });

  const [menuModalOpen, setMenuModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState('Mon');
  const [dayMenuForm, setDayMenuForm] = useState<DayMenu>({ breakfast: '', lunch: '', dinner: '' });

  const [extraModalOpen, setExtraModalOpen] = useState(false);
  const [editingExtra, setEditingExtra] = useState<ExtraItem | null>(null);
  const [extraForm, setExtraForm] = useState({
    name: '',
    price: 30,
    category: 'Side',
    imageUrl: 'https://images.pexels.com/photos/10860591/pexels-photo-10860591.jpeg?auto=compress&cs=tinysrgb&w=200',
    isActive: true
  });

  // ── AREA DELIVERY ZONES STATE ──
  const [zoneModalOpen, setZoneModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);
  const [zoneForm, setZoneForm] = useState({
    name: '',
    code: '',
    pincode: '',
    areas: '',
    deliveryCharge: 0,
    lunchSlot: '12:15 PM - 01:15 PM',
    dinnerSlot: '07:30 PM - 08:30 PM',
    assignedRider: '',
    dailyTiffinCapacity: 100,
    status: 'active' as 'active' | 'busy' | 'paused'
  });

  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);

  // ── DELIVERY RIDERS MANAGEMENT STATE ──
  const [riderModalOpen, setRiderModalOpen] = useState(false);
  const [riderForm, setRiderForm] = useState({
    name: '',
    phone: '+91 ',
    route: '',
    vehicle: ''
  });

  const [riders, setRiders] = useState<Rider[]>([]);
  const [deliveryRoutes, setDeliveryRoutes] = useState<DeliveryRoute[]>([]);

  // Daily Tiffin Dispatch live roster with Zone Tagging (Full-Stack Dynamic)
  const [dispatchFilter, setDispatchFilter] = useState<'All' | 'Breakfast' | 'Lunch' | 'Dinner'>('Lunch');
  const [dispatchZoneFilter, setDispatchZoneFilter] = useState<string>('All');
  const [dispatchStatusFilter, setDispatchStatusFilter] = useState<string>('All');
  const [dispatchRiderFilter, setDispatchRiderFilter] = useState<string>('All');
  const [isRiderSummaryOpen, setIsRiderSummaryOpen] = useState<boolean>(true);
  const [dispatchSearchQuery, setDispatchSearchQuery] = useState<string>('');
  const [dispatchViewMode, setDispatchViewMode] = useState<'live' | 'history'>('live');
  const [historyTimeframe, setHistoryTimeframe] = useState<'all' | 'today' | 'yesterday' | 'week' | 'this_week' | 'last_week' | 'month' | 'last_month' | 'custom'>('all');
  const [historyStartDate, setHistoryStartDate] = useState<string>('');
  const [historyEndDate, setHistoryEndDate] = useState<string>('');
  const [historyMonthFilter, setHistoryMonthFilter] = useState<string>('all');
  const [historySpecificDate, setHistorySpecificDate] = useState<string>('');
  const [historyAvailableMonths, setHistoryAvailableMonths] = useState<any[]>([]);
  const [historyDailyBreakdown, setHistoryDailyBreakdown] = useState<any[]>([]);
  const [historyViewStyle, setHistoryViewStyle] = useState<'table' | 'daily'>('table');
  const [historyRiderFilter, setHistoryRiderFilter] = useState<string>('All');
  const [historySlotFilter, setHistorySlotFilter] = useState<string>('All');
  const [historyStatusFilter, setHistoryStatusFilter] = useState<string>('All');
  const [historySearchQuery, setHistorySearchQuery] = useState<string>('');
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [historySummary, setHistorySummary] = useState<any>(null);
  const [historyRiderBreakdown, setHistoryRiderBreakdown] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);
  const [selectedDispatchIds, setSelectedDispatchIds] = useState<string[]>([]);
  const [isAddDispatchModalOpen, setIsAddDispatchModalOpen] = useState<boolean>(false);
  const [isPrintManifestModalOpen, setIsPrintManifestModalOpen] = useState<boolean>(false);
  const [inspectRiderBoxes, setInspectRiderBoxes] = useState<any | null>(null);
  const [riderBoxSearch, setRiderBoxSearch] = useState<string>('');
  const [riderBoxSlotFilter, setRiderBoxSlotFilter] = useState<'All' | 'Breakfast' | 'Lunch' | 'Dinner'>('All');
  const [riderBoxStatusFilter, setRiderBoxStatusFilter] = useState<string>('All');
  const [dispatchSyncing, setDispatchSyncing] = useState<boolean>(false);
  const [addDispatchForm, setAddDispatchForm] = useState({
    student: '',
    phone: '',
    hostel: 'Tagore Hostel',
    room: '',
    zoneCode: 'NC-01',
    plan: 'Standard Double Thali',
    slot: 'Lunch',
    rider: '',
    extras: '',
    notes: ''
  });
  const [dispatchRoster, setDispatchRoster] = useState<any[]>([]);

  // ── DELIVERY RATES & PRICING CONFIGURATION STATE ──
  interface InstantDeliveryZone {
    id: string;
    name: string;
    baseFee: number;
    extraFee: number;
    isActive: boolean;
    description?: string;
  }

  interface DeliveryRatesState {
    // 🍱 Mess Tiffin Delivery Rates
    messPerBoxRate: number;
    messDinnerSurgeBonus: number;
    messCustomerDeliveryFee: number;
    messExtraAttachedBonus: number;
    messWeekendBonus: number;
    messMinDailyGuarantee: number;

    // ⚡ Instant Food (Quick Extra Orders) Pricing & Fee Controls
    instantPerOrderRate: number;
    instantCustomerDeliveryFee: number;
    instantBaseDeliveryFee: number;
    instantPerKmFee: number;
    instantPricingMode: 'slabs' | 'per_km';
    instantSlab0to2Km: number;
    instantSlab2to5Km: number;
    instantSlab5to8Km: number;
    instantSlabAbove8Km: number;
    instantMinOrderValue: number;
    instantFreeDeliveryThreshold: number;
    instantPeakHourFee: number;
    instantPeakHourEnabled: boolean;
    instantPeakHourTiming: string;
    instantNightDeliveryFee: number;
    instantNightDeliveryEnabled: boolean;
    instantNightTiming: string;
    instantRainFee: number;
    instantRainFeeEnabled: boolean;
    instantSurgeFee: number;
    instantSurgeMultiplier: number;
    instantSurgeMode: 'flat' | 'multiplier';
    instantSurgeEnabled: boolean;
    instantZones: InstantDeliveryZone[];
    instantPeakSurgeBonus: number;
    instantRainSurgeBonus: number;
    instantMinDailyGuarantee: number;

    // Legacy fallbacks
    defaultPerDeliveryRate: number;
    dinnerSurgeBonus: number;
    customerDeliveryFee: number;
    freeDeliveryThreshold: number;
    minDailyGuarantee: number;
    weekendSurgeBonus: number;
    updatedAt?: string;
  }

  const DEFAULT_INSTANT_ZONES: InstantDeliveryZone[] = [
    { id: 'zone-1', name: 'North Campus Hostels (BH 1-6 & PG Hub)', baseFee: 25, extraFee: 0, isActive: true, description: 'Core hostel zone within 2 KM' },
    { id: 'zone-2', name: 'South Campus Hostels (GH & Sports Block)', baseFee: 30, extraFee: 5, isActive: true, description: 'South campus zone (2-5 KM)' },
    { id: 'zone-3', name: 'Faculty & University Staff Quarters', baseFee: 35, extraFee: 10, isActive: true, description: 'Faculty enclaves & guest houses' },
    { id: 'zone-4', name: 'Off-Campus Student PGs & Apartments', baseFee: 50, extraFee: 25, isActive: true, description: 'Outer student clusters within 5-8 KM' }
  ];

  const [deliveryRates, setDeliveryRates] = useState<DeliveryRatesState>({
    messPerBoxRate: 25,
    messDinnerSurgeBonus: 8,
    messCustomerDeliveryFee: 0,
    messExtraAttachedBonus: 5,
    messWeekendBonus: 10,
    messMinDailyGuarantee: 200,

    instantPerOrderRate: 40,
    instantCustomerDeliveryFee: 35,
    instantBaseDeliveryFee: 25,
    instantPerKmFee: 10,
    instantPricingMode: 'slabs',
    instantSlab0to2Km: 25,
    instantSlab2to5Km: 40,
    instantSlab5to8Km: 65,
    instantSlabAbove8Km: 90,
    instantMinOrderValue: 99,
    instantFreeDeliveryThreshold: 249,
    instantPeakHourFee: 15,
    instantPeakHourEnabled: true,
    instantPeakHourTiming: '12:30 PM - 02:30 PM & 07:30 PM - 10:30 PM',
    instantNightDeliveryFee: 20,
    instantNightDeliveryEnabled: true,
    instantNightTiming: '10:30 PM - 03:00 AM',
    instantRainFee: 25,
    instantRainFeeEnabled: false,
    instantSurgeFee: 20,
    instantSurgeMultiplier: 1.25,
    instantSurgeMode: 'flat',
    instantSurgeEnabled: false,
    instantZones: DEFAULT_INSTANT_ZONES,
    instantPeakSurgeBonus: 15,
    instantRainSurgeBonus: 20,
    instantMinDailyGuarantee: 300,

    defaultPerDeliveryRate: 25,
    dinnerSurgeBonus: 8,
    customerDeliveryFee: 35,
    freeDeliveryThreshold: 249,
    minDailyGuarantee: 200,
    weekendSurgeBonus: 10
  });
  const [rateSectionTab, setRateSectionTab] = useState<'all' | 'instant' | 'mess'>('all');
  const [rateModalOpen, setRateModalOpen] = useState<boolean>(false);
  const [quickRateType, setQuickRateType] = useState<'mess' | 'instant'>('mess');
  const [quickRateInput, setQuickRateInput] = useState<number>(25);
  const [quickApplyToAll, setQuickApplyToAll] = useState<boolean>(true);
  const [isSavingRates, setIsSavingRates] = useState<boolean>(false);
  const [editingRiderRateId, setEditingRiderRateId] = useState<string | null>(null);
  const [editingRiderMessRate, setEditingRiderMessRate] = useState<number>(25);
  const [editingRiderInstantRate, setEditingRiderInstantRate] = useState<number>(40);
  const [rateSearchRider, setRateSearchRider] = useState<string>('');

  // ── INSTANT DELIVERY CALCULATOR & ZONE MANAGEMENT STATE ──
  const [calcDistance, setCalcDistance] = useState<number>(2.5);
  const [calcCartAmount, setCalcCartAmount] = useState<number>(180);
  const [calcSelectedZoneId, setCalcSelectedZoneId] = useState<string>('zone-1');
  const [isAddingZone, setIsAddingZone] = useState<boolean>(false);
  const [newZoneName, setNewZoneName] = useState<string>('');
  const [newZoneBaseFee, setNewZoneBaseFee] = useState<number>(30);
  const [newZoneExtraFee, setNewZoneExtraFee] = useState<number>(5);
  const [newZoneDesc, setNewZoneDesc] = useState<string>('');

  // ── FULL-STACK MEAL SKIP REQUESTS STATE ──
  const [skipRequests, setSkipRequests] = useState<any[]>([]);
  const [skipStats, setSkipStats] = useState<any>({
    totalSkips: 0,
    pendingSkips: 0,
    approvedSkips: 0,
    rejectedSkips: 0,
    totalRefunded: 0,
    todayLunchSkips: 0,
    todayDinnerSkips: 0,
    tomorrowLunchSkips: 0,
    tomorrowDinnerSkips: 0
  });
  const [skipFilterStatus, setSkipFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [skipFilterMeal, setSkipFilterMeal] = useState<'all' | 'lunch' | 'dinner'>('all');
  const [skipFilterDate, setSkipFilterDate] = useState<'all' | 'today' | 'tomorrow' | 'past'>('all');
  const [skipSearchQuery, setSkipSearchQuery] = useState('');
  const [isCreateSkipModalOpen, setIsCreateSkipModalOpen] = useState(false);
  const [skipSyncLoading, setSkipSyncLoading] = useState(false);
  const [manualSkipLoading, setManualSkipLoading] = useState(false);

  // Form for admin recording manual skip on behalf of student
  const [manualSkipForm, setManualSkipForm] = useState({
    userId: '',
    mealType: 'lunch' as 'lunch' | 'dinner',
    date: new Date().toISOString().split('T')[0],
    reason: 'Direct phone request to Mess Manager',
    credit: 72
  });

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveDeliveryRates = async (overrideRates?: Partial<DeliveryRatesState>, applyToAll = false, applyTarget: 'both' | 'mess' | 'instant' = 'both') => {
    setIsSavingRates(true);
    try {
      const payload: any = {
        ...(overrideRates || deliveryRates),
        applyToAllRiders: applyToAll,
        applyTarget
      };
      const res = await adminAPI.updateDeliveryRates(payload);
      if (res?.success) {
        if (res.rates) {
          setDeliveryRates(res.rates);
          if (quickRateType === 'mess') {
            setQuickRateInput(res.rates.messPerBoxRate || 25);
          } else {
            setQuickRateInput(res.rates.instantPerOrderRate || 40);
          }
        }
        if (res.riders && Array.isArray(res.riders)) {
          setRiders(prev => prev.map(r => {
            const matched = res.riders.find((x: any) => x.id === r.id);
            return matched ? {
              ...r,
              perDeliveryRate: matched.perDeliveryRate,
              messDeliveryRate: matched.messDeliveryRate,
              instantDeliveryRate: matched.instantDeliveryRate
            } : r;
          }));
        }
        showToast(res.message || 'Delivery rates saved successfully!');
        setRateModalOpen(false);
      } else {
        showToast(res?.message || 'Failed to update rates', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error updating delivery rates', 'error');
    } finally {
      setIsSavingRates(false);
    }
  };

  const handleUpdateSingleRiderRate = async (riderId: string, messRate?: number, instantRate?: number) => {
    try {
      const payload: any = {};
      if (messRate !== undefined) {
        payload.messDeliveryRate = messRate;
        payload.perDeliveryRate = messRate;
      }
      if (instantRate !== undefined) {
        payload.instantDeliveryRate = instantRate;
      }
      const res = await adminAPI.updateRiderDeliveryRate(riderId, payload);
      if (res?.success) {
        setRiders(prev => prev.map(r => r.id === riderId ? {
          ...r,
          ...(messRate !== undefined ? { messDeliveryRate: messRate, perDeliveryRate: messRate } : {}),
          ...(instantRate !== undefined ? { instantDeliveryRate: instantRate } : {})
        } : r));
        setEditingRiderRateId(null);
        showToast(res.message || 'Rider delivery rates updated successfully!');
      } else {
        showToast(res?.message || 'Failed to update rider rate', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update rider rate', 'error');
    }
  };

  // ── Fetch All Mess Data ──
  const fetchAllData = async () => {
    setLoading(true);
    setSyncing(true);
    try {
      const [
        overviewRes,
        plansRes,
        menuRes,
        extrasRes,
        subsRes,
        zonesRes,
        ridersRes,
        routesRes,
        dispatchRes,
        skipsRes,
        complaintsRes,
        ordersRes,
        dishesRes,
        usersRes,
        couponsRes
      ] = await Promise.allSettled([
        adminAPI.getOverview(),
        plansAPI.getAllAdmin(),
        menuAPI.getAll(),
        extrasAPI.getAllAdmin(),
        subscriptionsAPI.getAll(),
        adminAPI.getZones(),
        adminAPI.getRiders(),
        adminAPI.getRoutes(),
        adminAPI.getDispatch(),
        adminAPI.getSkips(),
        adminAPI.getComplaints(),
        adminAPI.getOrders(),
        dishesAPI.getAll(),
        adminAPI.getUsers(),
        adminAPI.getCoupons()
      ]);

      setBackendConnected(true);

      if (overviewRes.status === 'fulfilled' && overviewRes.value?.success) {
        setStats(overviewRes.value.stats);
        if (overviewRes.value.complaints) {
          setComplaints(overviewRes.value.complaints);
        }
      }

      if (plansRes.status === 'fulfilled' && plansRes.value?.plans && plansRes.value.plans.length > 0) {
        setPlans(plansRes.value.plans);
      } else {
        try {
          const pub = await plansAPI.getAll();
          if (pub?.plans) setPlans(pub.plans);
        } catch {}
      }

      if (menuRes.status === 'fulfilled' && menuRes.value?.menu) {
        setWeeklyMenu(menuRes.value.menu);
      }

      if (extrasRes.status === 'fulfilled' && extrasRes.value?.items && extrasRes.value.items.length > 0) {
        setExtras(extrasRes.value.items);
      } else {
        try {
          const pub = await extrasAPI.getAll();
          if (pub?.items && pub.items.length > 0) {
            setExtras(pub.items);
          } else {
            setExtras(DEFAULT_EXTRAS);
          }
        } catch {
          setExtras(DEFAULT_EXTRAS);
        }
      }

      if (subsRes.status === 'fulfilled' && subsRes.value?.subscriptions) {
        setSubscribers(subsRes.value.subscriptions);
      }

      if (zonesRes.status === 'fulfilled' && zonesRes.value?.zones) {
        setDeliveryZones(zonesRes.value.zones);
      }

      if (ridersRes.status === 'fulfilled' && ridersRes.value?.riders) {
        setRiders(ridersRes.value.riders);
      }

      if (routesRes.status === 'fulfilled' && routesRes.value?.routes) {
        setDeliveryRoutes(routesRes.value.routes);
      }

      if (dispatchRes.status === 'fulfilled' && dispatchRes.value?.roster) {
        setDispatchRoster(dispatchRes.value.roster);
      }

      if (skipsRes.status === 'fulfilled' && skipsRes.value?.skips) {
        setSkipRequests(skipsRes.value.skips);
      }

      // Fetch live aggregate stats for kitchen planning & refunds
      try {
        const statsRes = await adminAPI.getSkipStats();
        if (statsRes?.stats) {
          setSkipStats(statsRes.stats);
        }
      } catch (e) {
        console.warn('Failed to load skip stats:', e);
      }

      if (complaintsRes.status === 'fulfilled' && complaintsRes.value?.complaints) {
        setComplaints(complaintsRes.value.complaints);
      }

      if (ordersRes.status === 'fulfilled' && Array.isArray(ordersRes.value?.orders)) {
        setLiveOrders(ordersRes.value.orders);
      }

      if (dishesRes.status === 'fulfilled' && dishesRes.value?.dishes) {
        setDishes(dishesRes.value.dishes);
      }

      if (usersRes.status === 'fulfilled' && usersRes.value?.users) {
        setUsersList(usersRes.value.users);
      }

      if (couponsRes.status === 'fulfilled' && couponsRes.value?.coupons) {
        setCouponsList(couponsRes.value.coupons);
      }

      // Fetch Delivery Rates & Pricing Configuration
      try {
        const ratesRes = await adminAPI.getDeliveryRates();
        if (ratesRes?.success && ratesRes.rates) {
          setDeliveryRates(prev => ({
            ...prev,
            ...ratesRes.rates,
            instantZones: Array.isArray(ratesRes.rates.instantZones) && ratesRes.rates.instantZones.length
              ? ratesRes.rates.instantZones
              : DEFAULT_INSTANT_ZONES
          }));
          setQuickRateInput(ratesRes.rates.messPerBoxRate || ratesRes.rates.defaultPerDeliveryRate || 25);
        }
      } catch (e) {
        console.warn('Failed to load delivery rates:', e);
      }

      // Fetch Live Mess Delivery & Kitchen Cutoff Timings
      try {
        await fetchMealTimings();
      } catch (e) {
        console.warn('Failed to load meal timings:', e);
      }
    } catch (err) {
      console.error('Failed to load mess admin data:', err);
      setBackendConnected(false);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  useEffect(() => {
    const initAdmin = async () => {
      // Ensure dedicated admin authentication token exists for seamless fullstack integration
      let adminToken = localStorage.getItem('admin_token');
      if (!adminToken) {
        try {
          const authRes = await adminAPI.quickLogin();
          if (authRes?.token) {
            localStorage.setItem('admin_token', authRes.token);
            if (!localStorage.getItem('token')) {
              localStorage.setItem('token', authRes.token);
            }
            if (authRes.user) {
              localStorage.setItem('admin_user', JSON.stringify(authRes.user));
            }
          }
        } catch (e) {
          // Dev fallback in auth middleware ensures routes still work
        }
      }
      fetchAllData();
    };
    initAdmin();
  }, []);

  // Background live auto-sync every 4 seconds for real-time Skips, Paused Subscriptions, Orders & Kitchen Dispatch
  useEffect(() => {
    const liveInterval = setInterval(async () => {
      try {
        const [ordersRes, dispatchRes, skipsRes, subsRes, statsRes] = await Promise.allSettled([
          adminAPI.getOrders(),
          adminAPI.getDispatch(),
          adminAPI.getSkips(),
          subscriptionsAPI.getAll(),
          adminAPI.getSkipStats()
        ]);
        if (ordersRes.status === 'fulfilled' && ordersRes.value?.orders) {
          setLiveOrders(ordersRes.value.orders);
        }
        if (dispatchRes.status === 'fulfilled' && dispatchRes.value?.roster) {
          setDispatchRoster(dispatchRes.value.roster);
        }
        if (skipsRes.status === 'fulfilled' && skipsRes.value?.skips) {
          setSkipRequests(prev => {
            const incoming = skipsRes.value.skips;
            const prevPending = prev.filter(s => (s.status || '').toLowerCase() === 'pending').length;
            const incomingPending = incoming.filter((s: any) => (s.status || '').toLowerCase() === 'pending').length;
            if (incomingPending > prevPending) {
              const latest = incoming.find((s: any) => (s.status || '').toLowerCase() === 'pending');
              showToast(`🔔 New Meal Skip Request: ${latest?.student || 'Student'} (${latest?.meal || latest?.mealType || 'Meal'} on ${latest?.date})!`);
            }
            return incoming;
          });
        }
        if (subsRes.status === 'fulfilled' && subsRes.value?.subscriptions) {
          setSubscribers(prev => {
            const incoming = subsRes.value.subscriptions;
            const prevPaused = prev.filter(s => s.status === 'paused').length;
            const incomingPaused = incoming.filter((s: any) => s.status === 'paused').length;
            if (incomingPaused > prevPaused) {
              const newlyPaused = incoming.find((s: any) => s.status === 'paused' && !prev.some(p => (p._id === s._id || p.id === s.id) && p.status === 'paused'));
              if (newlyPaused) {
                showToast(`⏸️ Student "${newlyPaused.userId?.name || 'Member'}" paused their meal subscription!`);
              }
            } else if (incomingPaused < prevPaused) {
              const newlyResumed = incoming.find((s: any) => s.status === 'active' && prev.some(p => (p._id === s._id || p.id === s.id) && p.status === 'paused'));
              if (newlyResumed) {
                showToast(`▶️ Student "${newlyResumed.userId?.name || 'Member'}" resumed their meal subscription!`);
              }
            }
            return incoming;
          });
        }
        if (statsRes.status === 'fulfilled' && statsRes.value?.stats) {
          setSkipStats(statsRes.value.stats);
        }
      } catch (e) {
        // Polling fallback
      }
    }, 4000);
    return () => clearInterval(liveInterval);
  }, []);

  // ── PLANS HANDLERS ──
  const openNewPlanModal = () => {
    setEditingPlan(null);
    setPlanForm({
      name: 'Custom Thali',
      mealsPerDay: 2,
      description: 'Daily freshly packed student meals',
      monthlyPrice: 3499,
      semesterDiscount: 15,
      features: 'Lunch + Dinner\nDaily Salad & Pickle\nFree Weekend Special\n2 Skips Included',
      isPopular: false,
      isActive: true
    });
    setPlanModalOpen(true);
  };

  const openEditPlanModal = (plan: Plan) => {
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
    setPlanModalOpen(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: planForm.name,
      mealsPerDay: Number(planForm.mealsPerDay),
      description: planForm.description,
      monthlyPrice: Number(planForm.monthlyPrice),
      semesterDiscount: Number(planForm.semesterDiscount),
      features: planForm.features.split('\n').filter(f => f.trim().length > 0),
      isPopular: planForm.isPopular,
      isActive: planForm.isActive
    };

    try {
      if (editingPlan) {
        await plansAPI.update(editingPlan._id, payload);
        showToast(`Plan "${planForm.name}" updated successfully!`);
      } else {
        await plansAPI.create(payload);
        showToast(`New plan "${planForm.name}" created!`);
      }
      setPlanModalOpen(false);
      const res = await plansAPI.getAllAdmin();
      if (res?.plans) setPlans(res.plans);
    } catch (err: any) {
      showToast(err.message || 'Failed to save plan', 'error');
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!window.confirm('Are you sure you want to delete this mess plan?')) return;
    try {
      await plansAPI.delete(planId);
      setPlans(prev => prev.filter(p => p._id !== planId));
      showToast('Mess plan deleted');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete plan', 'error');
    }
  };

  // ── MENU HANDLERS ──
  const openEditMenuModal = (day: string) => {
    setSelectedDay(day);
    const existing = weeklyMenu[day] || { breakfast: '', lunch: '', dinner: '' };
    setDayMenuForm(existing);
    setMenuModalOpen(true);
  };

  const handleSaveDayMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await menuAPI.updateDay(selectedDay, dayMenuForm);
      if (res?.menu) {
        setWeeklyMenu(res.menu);
      } else {
        setWeeklyMenu(prev => ({ ...prev, [selectedDay]: dayMenuForm }));
      }
      setMenuModalOpen(false);
      showToast(`${selectedDay} menu updated & published to students!`);
    } catch (err: any) {
      showToast(err.message || 'Failed to update menu', 'error');
    }
  };

  // ── EXTRAS HANDLERS ──
  const openNewExtraModal = () => {
    setEditingExtra(null);
    setExtraForm({
      name: '',
      price: 25,
      category: 'Side',
      imageUrl: 'https://images.pexels.com/photos/10860591/pexels-photo-10860591.jpeg?auto=compress&cs=tinysrgb&w=200',
      isActive: true
    });
    setExtraModalOpen(true);
  };

  const openEditExtraModal = (extra: ExtraItem) => {
    setEditingExtra(extra);
    setExtraForm({
      name: extra.name,
      price: extra.price,
      category: extra.category,
      imageUrl: extra.imageUrl,
      isActive: extra.isActive
    });
    setExtraModalOpen(true);
  };

  const handleSaveExtra = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingExtra) {
        if (!editingExtra._id.startsWith('extra-')) {
          await extrasAPI.update(editingExtra._id, extraForm);
        }
        setExtras(prev => prev.map(item => item._id === editingExtra._id ? { ...item, ...extraForm } : item));
        showToast(`Extra "${extraForm.name}" updated!`);
      } else {
        try {
          const res = await extrasAPI.create(extraForm);
          if (res?.item) {
            setExtras(prev => [res.item, ...prev]);
          } else {
            setExtras(prev => [{ _id: 'extra-' + Date.now(), ...extraForm }, ...prev]);
          }
        } catch {
          setExtras(prev => [{ _id: 'extra-' + Date.now(), ...extraForm }, ...prev]);
        }
        showToast(`New extra side "${extraForm.name}" added!`);
      }
      setExtraModalOpen(false);
      try {
        const res = await extrasAPI.getAllAdmin();
        if (res?.items && res.items.length > 0) setExtras(res.items);
      } catch {}
    } catch (err: any) {
      showToast(err.message || 'Failed to save extra item', 'error');
    }
  };

  const handleDeleteExtra = async (id: string) => {
    if (!window.confirm('Delete this add-on item?')) return;
    try {
      if (!id.startsWith('extra-')) {
        await extrasAPI.delete(id);
      }
      setExtras(prev => prev.filter(e => e._id !== id));
      showToast('Add-on deleted');
    } catch (err: any) {
      setExtras(prev => prev.filter(e => e._id !== id));
      showToast('Add-on deleted');
    }
  };

  // ── SUBSCRIBERS HANDLERS ──
  const handleTogglePause = async (id: string) => {
    try {
      await subscriptionsAPI.pause(id);
      setSubscribers(prev =>
        prev.map(s => (s._id === id ? { ...s, status: s.status === 'paused' ? 'active' : 'paused' } : s))
      );
      showToast('Subscription status updated');
    } catch (err: any) {
      showToast(err.message || 'Failed to toggle pause', 'error');
    }
  };

  const handleCancelSub = async (id: string) => {
    if (!window.confirm('Cancel this subscription?')) return;
    try {
      await subscriptionsAPI.cancel(id);
      setSubscribers(prev =>
        prev.map(s => (s._id === id ? { ...s, status: 'cancelled' } : s))
      );
      showToast('Subscription marked cancelled');
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel', 'error');
    }
  };

  // ── ENHANCED SUBSCRIPTION ACTIONS ──
  const openSubscribeModal = () => {
    setSubscribeForm({
      studentName: '',
      studentEmail: '',
      studentPhone: '+91 ',
      hostel: '',
      room: '',
      zoneCode: deliveryZones[0]?.code || '',
      planId: plans[0]?._id || '',
      billingCycle: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      amountPaid: plans[0]?.monthlyPrice || 0,
      paymentMethod: 'UPI / GPay',
      dietPreference: 'Standard Homestyle (No Restrictions)'
    });
    setSubscribeModalOpen(true);
  };

  const handleCreateSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedPlan = plans.find(p => p._id === subscribeForm.planId) || plans[0];
      const res = await subscriptionsAPI.createManual({
        studentName: subscribeForm.studentName,
        studentEmail: subscribeForm.studentEmail,
        studentPhone: subscribeForm.studentPhone,
        hostel: subscribeForm.hostel,
        room: subscribeForm.room,
        zoneCode: subscribeForm.zoneCode,
        planId: selectedPlan?._id,
        billingCycle: subscribeForm.billingCycle,
        amountPaid: Number(subscribeForm.amountPaid),
        paymentMethod: subscribeForm.paymentMethod,
        startDate: subscribeForm.startDate,
        dietPreference: subscribeForm.dietPreference
      });

      const newSub: Subscription = res?.subscription || {
        _id: `SUB-${Date.now().toString().slice(-4)}`,
        userId: {
          name: subscribeForm.studentName,
          email: subscribeForm.studentEmail,
          phone: subscribeForm.studentPhone
        },
        planId: {
          name: selectedPlan?.name || 'Standard Thali',
          monthlyPrice: Number(subscribeForm.amountPaid),
          mealsPerDay: selectedPlan?.mealsPerDay || 2
        },
        billingCycle: subscribeForm.billingCycle,
        status: 'active',
        remainingMeals: (selectedPlan?.mealsPerDay || 2) * (subscribeForm.billingCycle === 'semester' ? 180 : 30),
        totalMeals: (selectedPlan?.mealsPerDay || 2) * (subscribeForm.billingCycle === 'semester' ? 180 : 30),
        amountPaid: Number(subscribeForm.amountPaid),
        startDate: subscribeForm.startDate,
        endDate: new Date(Date.now() + (subscribeForm.billingCycle === 'semester' ? 180 : 30) * 86400000).toISOString(),
        hostelAddress: `${subscribeForm.hostel}, Room ${subscribeForm.room}`,
        zoneCode: subscribeForm.zoneCode,
        paymentMethod: subscribeForm.paymentMethod,
        dietPreference: subscribeForm.dietPreference
      };

      setSubscribers([newSub, ...subscribers]);
      setSubscribeModalOpen(false);
      showToast(`Student "${subscribeForm.studentName}" subscribed successfully!`);
    } catch (err: any) {
      showToast(err.message || 'Failed to enroll student', 'error');
    }
  };

  const handleOpenExtend = (sub: Subscription) => {
    setSelectedSubForExtend(sub);
    setExtendForm({ extraMeals: 10, extraDays: 7, reason: 'Student meal top-up' });
    setExtendModalOpen(true);
  };

  const handleSaveExtend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubForExtend) return;
    try {
      await subscriptionsAPI.extend(selectedSubForExtend._id, {
        extraMeals: Number(extendForm.extraMeals),
        extraDays: Number(extendForm.extraDays)
      });
      setSubscribers(prev =>
        prev.map(s => {
          if (s._id !== selectedSubForExtend._id) return s;
          const end = new Date(s.endDate);
          end.setDate(end.getDate() + Number(extendForm.extraDays));
          return {
            ...s,
            remainingMeals: (s.remainingMeals || 0) + Number(extendForm.extraMeals),
            totalMeals: (s.totalMeals || s.remainingMeals || 0) + Number(extendForm.extraMeals),
            endDate: end.toISOString(),
            status: 'active'
          };
        })
      );
      setExtendModalOpen(false);
      showToast(`Added +${extendForm.extraMeals} meals & +${extendForm.extraDays} days!`);
    } catch (err: any) {
      showToast(err.message || 'Failed to extend subscription', 'error');
    }
  };

  const handleRenewSub = async (sub: Subscription) => {
    try {
      await subscriptionsAPI.renew(sub._id);
      setSubscribers(prev =>
        prev.map(s => {
          if (s._id !== sub._id) return s;
          const end = new Date();
          end.setDate(end.getDate() + (s.billingCycle === 'semester' ? 180 : 30));
          return {
            ...s,
            status: 'active',
            endDate: end.toISOString(),
            remainingMeals: (s.remainingMeals || 0) + 60
          };
        })
      );
      showToast(`Renewed subscription for ${sub.userId?.name || 'student'}!`);
    } catch (err: any) {
      showToast(err.message || 'Failed to renew subscription', 'error');
    }
  };

  // ── RIDER MANAGEMENT HANDLERS ──
  const handleAddRider = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await adminAPI.createRider({
        name: riderForm.name,
        phone: riderForm.phone,
        route: riderForm.route,
        vehicle: riderForm.vehicle,
        aadhaarNumber: '9845 2310 9812',
        aadhaarVerified: true
      });
      const newRider: Rider = res?.rider || {
        id: `RDR-0${riders.length + 1}`,
        name: riderForm.name,
        phone: riderForm.phone,
        route: riderForm.route,
        vehicle: riderForm.vehicle,
        aadhaarNumber: '9845 2310 9812',
        aadhaarVerified: true,
        kycStatus: 'verified',
        status: 'available',
        deliveriesToday: 0,
        activeTiffins: 0,
        rating: 5.0
      };
      setRiders([newRider, ...riders]);
      setRiderModalOpen(false);
      showToast(`New delivery partner "${riderForm.name}" registered in database!`);
      setRiderForm({ name: '', phone: '+91 ', route: 'North Campus Hostels', vehicle: 'Electric Scooter' });
    } catch (err: any) {
      showToast(err.message || 'Failed to add rider', 'error');
    }
  };

  const toggleRiderStatus = async (riderId: string) => {
    try {
      await adminAPI.toggleRiderStatus(riderId);
      setRiders(prev =>
        prev.map(r => {
          if (r.id !== riderId) return r;
          const nextStatus = r.status === 'available' ? 'on-route' : r.status === 'on-route' ? 'offline' : 'available';
          return { ...r, status: nextStatus };
        })
      );
      showToast('Delivery partner status updated in database');
    } catch (err: any) {
      showToast(err.message || 'Failed to update rider status', 'error');
    }
  };

  // ── DISPATCH STATUS HANDLERS (FULL-STACK DYNAMIC) ──
  const updateDispatchStatus = async (id: string, newStatus: string) => {
    try {
      await adminAPI.updateDispatchStatus(id, newStatus);
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setDispatchRoster(prev =>
        prev.map(item =>
          (item.id === id || item._id === id)
            ? {
                ...item,
                status: newStatus,
                deliveryStatus: newStatus === 'delivered' ? 'Delivered' : newStatus === 'dispatched' ? 'Out for delivery' : newStatus === 'packed' ? 'Packed' : 'Preparing',
                statusStep: newStatus,
                deliveredAt: newStatus === 'delivered' ? timeStr : item.deliveredAt
              }
            : item
        )
      );
      showToast(`Tiffin #${id} marked as ${newStatus.toUpperCase()}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to update dispatch status', 'error');
    }
  };

  const handleAssignDispatchRider = async (id: string, riderName: string) => {
    try {
      await adminAPI.assignDispatchRider(id, riderName);
      const targetItem = dispatchRoster.find(item => item.id === id || item._id === id);
      const studentName = (targetItem?.student || '').toLowerCase().trim();
      const targetSlot = (targetItem?.slot || targetItem?.mealSlot || '').toLowerCase().trim();
      const riderObj = riders.find(r => r.name === riderName);

      setDispatchRoster(prev =>
        prev.map(item =>
          (item.id === id || item._id === id)
            ? {
                ...item,
                rider: riderName,
                assignedRider: riderName,
                status: (item.status === 'preparing' || item.status === 'pending') ? 'dispatched' : item.status,
                deliveryStatus: (item.status === 'preparing' || item.status === 'pending') ? 'Out for delivery' : item.deliveryStatus
              }
            : item
        )
      );

      // Auto-sync Pack with Meal / Extra orders for this student
      if (studentName) {
        setLiveOrders(prev =>
          prev.map(o => {
            const isMealExtra = o.deliverWithMeal || o.deliveryMode === 'with_tiffin' || (o.isExtraOrder && o.mealSlot && o.mealSlot !== 'Instant');
            const oStudent = (o.customerName || '').toLowerCase().trim();
            const oSlot = (o.mealSlot || o.attachedMealSlot || o.notes || '').toLowerCase().trim();
            const matchesSlot = !targetSlot || oSlot.includes(targetSlot) || targetSlot.includes(oSlot);
            if (isMealExtra && matchesSlot && (oStudent.includes(studentName) || studentName.includes(oStudent))) {
              return {
                ...o,
                deliveryPartner: {
                  name: riderName,
                  phone: riderObj?.phone || '+91 98765 43210',
                  vehicle: riderObj?.vehicle || 'Electric Scooter'
                }
              };
            }
            return o;
          })
        );

        setRequestRiderSelection(prev => {
          const updated = { ...prev };
          liveOrders.forEach(o => {
            const isMealExtra = o.deliverWithMeal || o.deliveryMode === 'with_tiffin' || (o.isExtraOrder && o.mealSlot && o.mealSlot !== 'Instant');
            const oStudent = (o.customerName || '').toLowerCase().trim();
            const oSlot = (o.mealSlot || o.attachedMealSlot || o.notes || '').toLowerCase().trim();
            const matchesSlot = !targetSlot || oSlot.includes(targetSlot) || targetSlot.includes(oSlot);
            if (isMealExtra && matchesSlot && (oStudent.includes(studentName) || studentName.includes(oStudent))) {
              const oid = o.orderId || o._id;
              if (oid) updated[oid] = riderName;
            }
          });
          return updated;
        });
      }

      showToast(`👑 Admin assigned rider "${riderName}" to box #${id}!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to assign rider', 'error');
    }
  };

  const handleAssignShiftRider = async (slot: 'Breakfast' | 'Lunch' | 'Dinner', riderName: string) => {
    if (!riderName) {
      showToast(`Please choose a rider for ${slot} delivery`, 'error');
      return;
    }
    setIsAssigningShift(slot);
    try {
      const riderObj = riders.find(r => r.name === riderName || r.id === riderName || r._id === riderName);
      const riderId = riderObj ? (riderObj.id || riderObj._id) : riderName;

      const res = await (adminAPI as any).assignSlotRider({
        slot,
        riderId,
        overwriteAll: true
      });

      const targetSlot = slot.toLowerCase();
      setDispatchRoster(prev =>
        prev.map(item => {
          const itemSlot = (item.slot || item.mealSlot || '').toLowerCase();
          if (itemSlot.includes(targetSlot) || targetSlot.includes(itemSlot)) {
            return {
              ...item,
              rider: riderObj ? riderObj.name : riderName,
              assignedRider: riderObj ? riderObj.name : riderName,
              status: 'dispatched',
              deliveryStatus: 'Out for delivery'
            };
          }
          return item;
        })
      );

      // Auto-sync all Extra Orders & Pack-with-Meal orders for this meal slot
      setLiveOrders(prev =>
        prev.map(o => {
          const isMealExtra = o.deliverWithMeal || o.deliveryMode === 'with_tiffin' || (o.isExtraOrder && o.mealSlot && o.mealSlot !== 'Instant');
          const oSlot = (o.mealSlot || o.attachedMealSlot || o.notes || '').toLowerCase();
          if (isMealExtra && (oSlot.includes(targetSlot) || targetSlot.includes(oSlot))) {
            return {
              ...o,
              deliveryPartner: {
                name: riderObj ? riderObj.name : riderName,
                phone: riderObj?.phone || '+91 98765 43210',
                vehicle: riderObj?.vehicle || 'Electric Scooter'
              }
            };
          }
          return o;
        })
      );

      // Auto-sync requestRiderSelection cache for Pack with Meal requests UI
      setRequestRiderSelection(prev => {
        const updated = { ...prev };
        liveOrders.forEach(o => {
          const isMealExtra = o.deliverWithMeal || o.deliveryMode === 'with_tiffin' || (o.isExtraOrder && o.mealSlot && o.mealSlot !== 'Instant');
          const oSlot = (o.mealSlot || o.attachedMealSlot || o.notes || '').toLowerCase();
          if (isMealExtra && (oSlot.includes(targetSlot) || targetSlot.includes(oSlot))) {
            const oid = o.orderId || o._id;
            if (oid) updated[oid] = riderObj ? riderObj.name : riderName;
          }
        });
        return updated;
      });

      showToast(res?.message || `👑 Quick Allocation: All ${slot} deliveries & extra add-ons assigned to ${riderObj ? riderObj.name : riderName}!`, 'success');
    } catch (err: any) {
      showToast(err.message || `Failed to assign ${slot} deliveries`, 'error');
    } finally {
      setIsAssigningShift(null);
    }
  };

  const handleAssignZoneRider = async (zoneCode: string, riderName: string, slot?: string) => {
    if (!riderName) {
      showToast(`Please select a rider for Zone ${zoneCode}`, 'error');
      return;
    }
    setIsAssigningZone(zoneCode);
    try {
      const riderObj = riders.find(r => r.name === riderName || r.id === riderName || r._id === riderName);
      const riderId = riderObj ? (riderObj.id || riderObj._id) : riderName;

      const res = await (adminAPI as any).assignZoneRider({
        zoneCode,
        riderId,
        slot,
        overwriteAll: true
      });

      const targetZone = zoneCode.toUpperCase();
      const targetSlot = (slot && slot !== 'All') ? slot.toLowerCase() : null;

      setDispatchRoster(prev =>
        prev.map(item => {
          const itemZone = (item.zoneCode || item.zone || '').toUpperCase();
          if (itemZone === targetZone || itemZone.includes(targetZone) || targetZone.includes(itemZone)) {
            if (targetSlot) {
              const itemSlot = (item.slot || item.mealSlot || '').toLowerCase();
              if (!itemSlot.includes(targetSlot)) return item;
            }
            return {
              ...item,
              rider: riderObj ? riderObj.name : riderName,
              assignedRider: riderObj ? riderObj.name : riderName,
              status: 'dispatched',
              deliveryStatus: 'Out for delivery'
            };
          }
          return item;
        })
      );

      // Auto-sync all Extra Orders & Pack-with-Meal orders for this zone
      setLiveOrders(prev =>
        prev.map(o => {
          const isMealExtra = o.deliverWithMeal || o.deliveryMode === 'with_tiffin' || (o.isExtraOrder && o.mealSlot && o.mealSlot !== 'Instant');
          if (!isMealExtra) return o;
          const oAddr = (o.deliveryAddress || '').toUpperCase();
          if (oAddr.includes(targetZone) || targetZone.includes(oAddr)) {
            if (targetSlot) {
              const oSlot = (o.mealSlot || o.attachedMealSlot || o.notes || '').toLowerCase();
              if (!oSlot.includes(targetSlot)) return o;
            }
            return {
              ...o,
              deliveryPartner: {
                name: riderObj ? riderObj.name : riderName,
                phone: riderObj?.phone || '+91 98765 43210',
                vehicle: riderObj?.vehicle || 'Electric Scooter'
              }
            };
          }
          return o;
        })
      );

      // Auto-sync requestRiderSelection cache for Pack with Meal requests UI
      setRequestRiderSelection(prev => {
        const updated = { ...prev };
        liveOrders.forEach(o => {
          const isMealExtra = o.deliverWithMeal || o.deliveryMode === 'with_tiffin' || (o.isExtraOrder && o.mealSlot && o.mealSlot !== 'Instant');
          if (!isMealExtra) return;
          const oAddr = (o.deliveryAddress || '').toUpperCase();
          if (oAddr.includes(targetZone) || targetZone.includes(oAddr)) {
            if (targetSlot) {
              const oSlot = (o.mealSlot || o.attachedMealSlot || o.notes || '').toLowerCase();
              if (!oSlot.includes(targetSlot)) return;
            }
            const oid = o.orderId || o._id;
            if (oid) updated[oid] = riderObj ? riderObj.name : riderName;
          }
        });
        return updated;
      });

      // Also update deliveryZones
      setDeliveryZones(prev =>
        prev.map(z => {
          if ((z.code || '').toUpperCase() === targetZone) {
            return {
              ...z,
              assignedRider: riderObj ? `${riderObj.name}${riderObj.vehicle ? ` (${riderObj.vehicle})` : ''}` : riderName
            };
          }
          return z;
        })
      );

      showToast(res?.message || `👑 Admin assigned Zone ${zoneCode} deliveries to ${riderObj ? riderObj.name : riderName}!`, 'success');
    } catch (err: any) {
      showToast(err.message || `Failed to assign Zone ${zoneCode}`, 'error');
    } finally {
      setIsAssigningZone(null);
    }
  };

  const handleSyncDispatchRoster = async () => {
    setDispatchSyncing(true);
    try {
      const res = await adminAPI.syncDispatchRoster();
      if (res?.roster) {
        setDispatchRoster(res.roster);
      }
      showToast(res?.message || 'Kitchen dispatch checklist synchronized with active subscribers!');
    } catch (err: any) {
      showToast(err.message || 'Failed to sync dispatch roster', 'error');
    } finally {
      setDispatchSyncing(false);
    }
  };

  const handleCreateManualDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addDispatchForm.student.trim() || !addDispatchForm.hostel.trim()) {
      showToast('Please enter student name and hostel address', 'error');
      return;
    }
    try {
      const riderName = addDispatchForm.rider || riders[0]?.name || 'Unassigned';
      const res = await adminAPI.createDispatch({
        ...addDispatchForm,
        rider: riderName
      });
      if (res?.success) {
        setDispatchRoster(prev => [res.item, ...prev]);
        setIsAddDispatchModalOpen(false);
        setAddDispatchForm({
          student: '',
          phone: '',
          hostel: 'Tagore Hostel',
          room: '',
          zoneCode: 'NC-01',
          plan: 'Standard Double Thali',
          slot: 'Lunch',
          rider: '',
          extras: '',
          notes: ''
        });
        showToast(res.message || 'New tiffin added to dispatch checklist!');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to add tiffin', 'error');
    }
  };

  const handleDeleteDispatchItem = async (id: string) => {
    if (!window.confirm(`Are you sure you want to remove tiffin #${id} from today's packing roster?`)) return;
    try {
      await adminAPI.deleteDispatch(id);
      setDispatchRoster(prev => prev.filter(r => r.id !== id && r._id !== id));
      setSelectedDispatchIds(prev => prev.filter(i => i !== id));
      showToast(`Tiffin #${id} removed from checklist`);
    } catch (err: any) {
      showToast(err.message || 'Failed to remove dispatch item', 'error');
    }
  };

  const handleBulkDispatchStatus = async (status: string) => {
    if (selectedDispatchIds.length === 0) {
      showToast('Select at least one tiffin to perform bulk action', 'error');
      return;
    }
    try {
      const res = await adminAPI.bulkUpdateDispatchStatus({ ids: selectedDispatchIds, status });
      if (res?.success && res.roster) {
        setDispatchRoster(res.roster);
        setSelectedDispatchIds([]);
        showToast(res.message || `Bulk updated ${selectedDispatchIds.length} tiffins to ${status.toUpperCase()}!`);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to bulk update status', 'error');
    }
  };

  const handleToggleExtrasPacked = async (item: any) => {
    try {
      const itemId = item.id || item._id;
      const res = await adminAPI.togglePackExtras(itemId);
      if (res?.success) {
        setDispatchRoster(prev =>
          prev.map(r => (r.id === itemId || r._id === itemId ? { ...r, extrasPacked: res.extrasPacked } : r))
        );
        showToast(
          res.extrasPacked
            ? `✓ Extras packed in box for ${item.student || item.studentName}`
            : `☐ Extras unmarked for ${item.student || item.studentName}`
        );
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update extras status', 'error');
    }
  };

  const handleUpdateRouteStatus = async (routeId: string, status: 'preparing' | 'on-route' | 'completed') => {
    try {
      await adminAPI.updateRouteStatus(routeId, status);
      setDeliveryRoutes(prev =>
        prev.map(r => (r.id === routeId ? { ...r, status } : r))
      );
      showToast(`Delivery route marked as ${status.replace('-', ' ').toUpperCase()}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to update route status', 'error');
    }
  };

  // ── TIFFIN DISPATCH & DELIVERY HISTORY HANDLERS ──
  const fetchDispatchHistory = async () => {
    try {
      setHistoryLoading(true);
      const params: any = {
        timeframe: historyTimeframe,
        rider: historyRiderFilter,
        slot: historySlotFilter,
        status: historyStatusFilter,
        q: historySearchQuery
      };
      if (historySpecificDate) {
        params.date = historySpecificDate;
      }
      if (historyMonthFilter && historyMonthFilter !== 'all') {
        params.month = historyMonthFilter;
      }
      if (historyTimeframe === 'custom') {
        if (historyStartDate) params.startDate = historyStartDate;
        if (historyEndDate) params.endDate = historyEndDate;
      }
      const res = await adminAPI.getDispatchHistory(params);
      if (res && res.success) {
        setHistoryData(res.history || []);
        setHistorySummary(res.summary || null);
        setHistoryRiderBreakdown(res.riderBreakdown || []);
        if (res.availableMonths) setHistoryAvailableMonths(res.availableMonths);
        if (res.dailyBreakdown) setHistoryDailyBreakdown(res.dailyBreakdown);
      }
    } catch (err: any) {
      console.warn('Failed to load dispatch history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'dispatch-history' || (activeTab === 'dispatch' && dispatchViewMode === 'history')) {
      fetchDispatchHistory();
    }
  }, [activeTab, dispatchViewMode, historyTimeframe, historyMonthFilter, historySpecificDate, historyRiderFilter, historySlotFilter, historyStatusFilter, historyStartDate, historyEndDate]);

  const handleExportHistoryCSV = () => {
    if (!historyData || historyData.length === 0) {
      showToast('No history records to export', 'error');
      return;
    }
    const headers = [
      'Box ID',
      'Date',
      'Slot',
      'Student Name',
      'Phone',
      'Hostel Address',
      'Room',
      'Zone',
      'Assigned Rider',
      'Status',
      'Delivered At',
      'Extras Attached'
    ];
    const rows = historyData.map(item => [
      `"${item.id || ''}"`,
      `"${item.date || (item.createdAt ? item.createdAt.slice(0, 10) : '')}"`,
      `"${item.slot || ''}"`,
      `"${(item.student || '').replace(/"/g, '""')}"`,
      `"${item.phone || ''}"`,
      `"${(item.hostel || '').replace(/"/g, '""')}"`,
      `"${item.room || ''}"`,
      `"${item.zoneCode || ''}"`,
      `"${(item.rider || '').replace(/"/g, '""')}"`,
      `"${item.status || ''}"`,
      `"${item.deliveredAt || ''}"`,
      `"${(item.extras || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Tiffin_Delivery_History_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Tiffin delivery history CSV exported successfully!');
  };

  // ── AREA DELIVERY ZONE HANDLERS ──
  const openNewZoneModal = () => {
    setEditingZone(null);
    setZoneForm({
      name: '',
      code: `ZN-0${deliveryZones.length + 1}`,
      pincode: '',
      areas: '',
      deliveryCharge: 0,
      lunchSlot: '12:15 PM - 01:15 PM',
      dinnerSlot: '07:30 PM - 08:30 PM',
      assignedRider: riders[0]?.name ? `${riders[0].name} (${riders[0].vehicle})` : '',
      dailyTiffinCapacity: 100,
      status: 'active'
    });
    setZoneModalOpen(true);
  };

  const openEditZoneModal = (zone: DeliveryZone) => {
    setEditingZone(zone);
    setZoneForm({
      name: zone.name,
      code: zone.code,
      pincode: zone.pincode,
      areas: zone.areas.join(', '),
      deliveryCharge: zone.deliveryCharge,
      lunchSlot: zone.timingSlots.lunch,
      dinnerSlot: zone.timingSlots.dinner,
      assignedRider: zone.assignedRider,
      dailyTiffinCapacity: zone.dailyTiffinCapacity,
      status: zone.status
    });
    setZoneModalOpen(true);
  };

  const handleSaveZone = async (e: React.FormEvent) => {
    e.preventDefault();
    const areasList = zoneForm.areas
      .split(',')
      .map(a => a.trim())
      .filter(Boolean);

    const payload = {
      name: zoneForm.name,
      code: zoneForm.code,
      pincode: zoneForm.pincode,
      areas: areasList,
      deliveryCharge: Number(zoneForm.deliveryCharge),
      lunchSlot: zoneForm.lunchSlot,
      dinnerSlot: zoneForm.dinnerSlot,
      assignedRider: zoneForm.assignedRider,
      dailyTiffinCapacity: Number(zoneForm.dailyTiffinCapacity),
      status: zoneForm.status
    };

    try {
      if (editingZone) {
        const res = await adminAPI.updateZone(editingZone.id || (editingZone as any)._id, payload);
        if (res?.zone) {
          setDeliveryZones(prev => prev.map(z => z.id === editingZone.id ? res.zone : z));
        } else {
          setDeliveryZones(prev =>
            prev.map(z =>
              z.id === editingZone.id
                ? {
                    ...z,
                    name: zoneForm.name,
                    code: zoneForm.code,
                    pincode: zoneForm.pincode,
                    areas: areasList,
                    deliveryCharge: Number(zoneForm.deliveryCharge),
                    timingSlots: { lunch: zoneForm.lunchSlot, dinner: zoneForm.dinnerSlot },
                    assignedRider: zoneForm.assignedRider,
                    dailyTiffinCapacity: Number(zoneForm.dailyTiffinCapacity),
                    status: zoneForm.status
                  }
                : z
            )
          );
        }
        showToast(`Zone "${zoneForm.name}" updated successfully in database!`);
      } else {
        const res = await adminAPI.createZone(payload);
        if (res?.zone) {
          setDeliveryZones([...deliveryZones, res.zone]);
        } else {
          const newZone: DeliveryZone = {
            id: `ZONE-0${deliveryZones.length + 1}`,
            name: zoneForm.name,
            code: zoneForm.code || `ZN-0${deliveryZones.length + 1}`,
            pincode: zoneForm.pincode,
            areas: areasList,
            deliveryCharge: Number(zoneForm.deliveryCharge),
            timingSlots: { lunch: zoneForm.lunchSlot, dinner: zoneForm.dinnerSlot },
            assignedRider: zoneForm.assignedRider,
            dailyTiffinCapacity: Number(zoneForm.dailyTiffinCapacity),
            activeDeliveries: 0,
            status: zoneForm.status
          };
          setDeliveryZones([...deliveryZones, newZone]);
        }
        showToast(`New Delivery Zone "${zoneForm.name}" activated in database!`);
      }
      setZoneModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to save zone', 'error');
    }
  };

  const handleToggleZoneStatus = async (zoneId: string) => {
    try {
      await adminAPI.toggleZoneStatus(zoneId);
      setDeliveryZones(prev =>
        prev.map(z => {
          if (z.id !== zoneId) return z;
          const nextStatus = z.status === 'active' ? 'busy' : z.status === 'busy' ? 'paused' : 'active';
          return { ...z, status: nextStatus };
        })
      );
      showToast('Zone delivery status updated in database');
    } catch (err: any) {
      showToast(err.message || 'Failed to update zone status', 'error');
    }
  };

  const handleDeleteZone = async (zoneId: string) => {
    if (!window.confirm('Delete this delivery zone?')) return;
    try {
      await adminAPI.deleteZone(zoneId);
      setDeliveryZones(prev => prev.filter(z => z.id !== zoneId));
      showToast('Delivery zone removed from database');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete zone', 'error');
    }
  };

  // ── FULL-STACK SKIP REQUESTS HANDLERS ──
  const handleApproveSkip = async (skipId: string, student: string, credit: number) => {
    try {
      await adminAPI.approveSkip(skipId);
      setSkipRequests(prev => prev.map(s => (s.id === skipId || s._id === skipId) ? { ...s, status: 'approved', refundStatus: '+1 Meal Added to Balance' } : s));
      // Refresh subscribers to reflect incremented remainingMeals
      subscriptionsAPI.getAll().then(r => r.subscriptions && setSubscribers(r.subscriptions)).catch(() => {});
      adminAPI.getSkipStats().then(r => r.stats && setSkipStats(r.stats)).catch(() => {});
      showToast(`Approved skip for ${student}. +1 meal added to student's Remaining Meals balance!`);
    } catch (err: any) {
      showToast(err.message || 'Failed to approve skip', 'error');
    }
  };

  const handleRejectSkip = async (skipId: string, student: string) => {
    try {
      await adminAPI.rejectSkip(skipId);
      setSkipRequests(prev => prev.map(s => (s.id === skipId || s._id === skipId) ? { ...s, status: 'rejected', refundStatus: 'Declined' } : s));
      adminAPI.getSkipStats().then(r => r.stats && setSkipStats(r.stats)).catch(() => {});
      showToast(`Skip request declined for ${student}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to reject skip', 'error');
    }
  };

  const handleDeleteSkip = async (skipId: string) => {
    if (!window.confirm('Delete this skip request record from database?')) return;
    try {
      await adminAPI.deleteSkip(skipId);
      setSkipRequests(prev => prev.filter(s => s.id !== skipId && s._id !== skipId));
      adminAPI.getSkipStats().then(r => r.stats && setSkipStats(r.stats)).catch(() => {});
      showToast('Skip request permanently removed');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete skip', 'error');
    }
  };

  const handleSyncSkipsWithRoster = async () => {
    setSkipSyncLoading(true);
    try {
      const res = await adminAPI.syncSkipsWithRoster();
      showToast(res.message || 'Kitchen dispatch roster successfully synchronized!');
      const dispRes = await adminAPI.getDispatch();
      if (dispRes?.roster) setDispatchRoster(dispRes.roster);
    } catch (err: any) {
      showToast(err.message || 'Failed to sync with dispatch roster', 'error');
    } finally {
      setSkipSyncLoading(false);
    }
  };

  const handleCreateManualSkip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualSkipForm.userId) {
      showToast('Please select a student / subscriber', 'error');
      return;
    }
    setManualSkipLoading(true);
    try {
      const res = await adminAPI.createSkip({
        userId: manualSkipForm.userId,
        mealType: manualSkipForm.mealType,
        date: manualSkipForm.date,
        reason: manualSkipForm.reason,
        credit: Number(manualSkipForm.credit)
      });
      if (res.success) {
        showToast(res.message || 'Skip successfully recorded!');
        setIsCreateSkipModalOpen(false);
        const [skipsRes, statsRes] = await Promise.allSettled([
          adminAPI.getSkips(),
          adminAPI.getSkipStats()
        ]);
        if (skipsRes.status === 'fulfilled' && skipsRes.value?.skips) setSkipRequests(skipsRes.value.skips);
        if (statsRes.status === 'fulfilled' && statsRes.value?.stats) setSkipStats(statsRes.value.stats);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to record skip', 'error');
    } finally {
      setManualSkipLoading(false);
    }
  };

  // ── ORDERS STATUS HANDLER ──
  const handleUpdateOrderStatus = async (orderId: string, status: string, paymentStatus?: string) => {
    try {
      await adminAPI.updateOrderStatus(orderId, status, paymentStatus);
      setLiveOrders(prev =>
        prev.map(o => (o.orderId === orderId || o._id === orderId ? { 
          ...o, 
          status, 
          ...(paymentStatus ? { paymentStatus } : (status === 'delivered' && o.paymentMethod === 'Cash on Delivery' ? { paymentStatus: 'paid' } : {}))
        } : o))
      );
      showToast(paymentStatus === 'paid' ? 'Payment marked as COLLECTED!' : `Order status updated to ${status.toUpperCase()}!`);
    } catch (err: any) {
      showToast(err.message || 'Failed to update order status', 'error');
    }
  };

  // ── ASSIGN RIDER TO EXTRA/SUBSCRIBER ORDER (Admin manually assigns — delivers with Lunch/Dinner) ──
  const handleAssignExtraOrderRider = async (orderId: string, riderName: string) => {
    if (!riderName || riderName === 'Unassigned') return;
    try {
      const riderObj = riders.find(r => r.name === riderName);
      const riderPhone = riderObj?.phone || '';
      const riderVehicle = riderObj?.vehicle || 'Electric Scooter';
      await (adminAPI as any).assignOrderRider(orderId, riderName, riderPhone, riderVehicle);
      // Also mark status as preparing since rider is now assigned
      await adminAPI.updateOrderStatus(orderId, 'preparing');
      setLiveOrders(prev =>
        prev.map(o =>
          (o.orderId === orderId || o._id === orderId)
            ? {
                ...o,
                status: 'preparing',
                deliveryPartner: { name: riderName, phone: riderPhone, vehicle: riderVehicle }
              }
            : o
        )
      );
      showToast(`🚴 Rider "${riderName}" assigned! Order will be delivered with the tiffin.`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to assign rider', 'error');
    }
  };

  // ── ADMIN SENDS EXTRA ORDER WITH MEAL (Lunch / Dinner) ──
  const handleSendExtraWithMeal = async (order: any, targetRider?: string) => {
    try {
      const orderId = order.orderId || order._id;
      const slotName = order.mealSlot || 'Lunch Tiffin';
      let decidedRider = targetRider || order.deliveryPartner?.name;
      if (!decidedRider || decidedRider === 'Unassigned' || decidedRider.includes('Pending') || decidedRider.includes('Dabbawala')) {
        const activeRider = riders.find(r => r.status !== 'offline');
        decidedRider = activeRider ? activeRider.name : 'Unassigned';
      }

      const riderObj = riders.find(r => r.name === decidedRider);
      const riderPhone = riderObj?.phone || '+91 98765 43210';
      const riderVehicle = riderObj?.vehicle || 'Electric Scooter';

      // 1. Assign rider in backend & update order status to 'on-the-way'
      await (adminAPI as any).assignOrderRider(orderId, decidedRider, riderPhone, riderVehicle);
      await adminAPI.updateOrderStatus(orderId, 'on-the-way');

      // 2. Update local state
      setLiveOrders(prev =>
        prev.map(o =>
          (o.orderId === orderId || o._id === orderId)
            ? {
                ...o,
                status: 'on-the-way',
                packingStatus: 'packed_in_tiffin',
                deliveryPartner: { name: decidedRider, phone: riderPhone, vehicle: riderVehicle }
              }
            : o
        )
      );

      // 3. Sync dispatch roster so the Dabbawala / Rider checklist shows this extra item packed with tiffin
      const itemSummary = (order.items || []).map((it: any) => `${it.quantity || 1}x ${it.name}`).join(', ');
      setDispatchRoster(prev => {
        const studentName = (order.customerName || '').toLowerCase().trim();
        return prev.map(t => {
          const tStudent = (t.student || '').toLowerCase().trim();
          if (studentName && (tStudent.includes(studentName) || studentName.includes(tStudent))) {
            return {
              ...t,
              extras: t.extras ? `${t.extras} + [🌟 SENT WITH ${slotName.toUpperCase()}: ${itemSummary}]` : `[🌟 SENT WITH ${slotName.toUpperCase()}: ${itemSummary}]`,
              hasAttachedExtras: true,
              rider: decidedRider,
              assignedRider: decidedRider
            };
          }
          return t;
        });
      });

      showToast(`🚀 Order #${order.orderId || orderId} approved and sent with ${slotName}! Rider: ${decidedRider}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to dispatch extra order with meal', 'error');
    }
  };

  // ── DISHES MANAGEMENT HANDLERS ──
  const openNewDishModal = () => {
    setEditingDish(null);
    setDishForm({
      name: '',
      category: 'thali',
      price: 130,
      originalPrice: 160,
      image: 'https://images.pexels.com/photos/12737656/pexels-photo-12737656.jpeg?auto=compress&cs=tinysrgb&w=400',
      isVeg: true,
      isAvailable: true,
      prepTime: '20 mins',
      serves: '1 Person',
      description: 'Freshly prepared homestyle food with pure desi ingredients',
      calories: 450,
      protein: '16g',
      spiceLevel: 'Medium',
      tag: 'Chef Special 🍛',
      ingredients: 'Fresh Paneer, Desi Ghee, Basmati Rice, Butter Roti, Indian Spices'
    });
    setDishModalOpen(true);
  };

  const openEditDishModal = (dish: any) => {
    setEditingDish(dish);
    setDishForm({
      name: dish.name || '',
      category: dish.category || 'thali',
      price: dish.price || 120,
      originalPrice: dish.originalPrice || Math.round((dish.price || 100) * 1.25),
      image: dish.image || '',
      isVeg: Boolean(dish.isVeg),
      isAvailable: dish.isAvailable !== false,
      prepTime: dish.prepTime || '20 mins',
      serves: dish.serves || '1 Person',
      description: dish.description || '',
      calories: dish.calories || 450,
      protein: dish.protein || '15g',
      spiceLevel: dish.spiceLevel || 'Medium',
      tag: dish.tag || '',
      ingredients: Array.isArray(dish.ingredients) ? dish.ingredients.join(', ') : (dish.ingredients || '')
    });
    setDishModalOpen(true);
  };

  const handleSaveDish = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: dishForm.name.trim(),
        category: dishForm.category,
        price: Number(dishForm.price),
        originalPrice: Number(dishForm.originalPrice),
        image: dishForm.image.trim(),
        isVeg: Boolean(dishForm.isVeg),
        isAvailable: Boolean(dishForm.isAvailable),
        prepTime: dishForm.prepTime.trim(),
        serves: dishForm.serves.trim() || '1 Person',
        description: dishForm.description.trim(),
        calories: Number(dishForm.calories) || 450,
        protein: dishForm.protein.trim() || '15g',
        spiceLevel: dishForm.spiceLevel,
        tag: dishForm.tag.trim(),
        ingredients: dishForm.ingredients
      };

      if (editingDish) {
        const dishId = editingDish.id || editingDish._id;
        const res = await dishesAPI.update(dishId, payload);
        const updated = res?.dish || { ...editingDish, ...payload };
        setDishes(prev => prev.map(d => (d.id === dishId || d._id === dishId) ? updated : d));
        showToast(`Dish "${dishForm.name}" updated successfully!`);
      } else {
        const res = await dishesAPI.create(payload);
        const created = res?.dish || { ...payload, id: 'DSH_' + Date.now() };
        setDishes(prev => [created, ...prev]);
        showToast(`New dish "${dishForm.name}" added to menu!`);
      }
      setDishModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to save dish', 'error');
    }
  };

  const handleDeleteDish = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete dish "${name}"?`)) return;
    try {
      await dishesAPI.delete(id);
      setDishes(prev => prev.filter(d => d.id !== id && d._id !== id));
      showToast(`Dish "${name}" deleted from menu!`);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete dish', 'error');
    }
  };

  const handleToggleDishVeg = async (dish: any) => {
    const dishId = dish.id || dish._id;
    try {
      const newVeg = !dish.isVeg;
      await dishesAPI.update(dishId, { isVeg: newVeg });
      setDishes(prev => prev.map(d => (d.id === dishId || d._id === dishId) ? { ...d, isVeg: newVeg } : d));
      showToast(`Marked ${dish.name} as ${newVeg ? 'Vegetarian 🟢' : 'Non-Vegetarian 🔴'}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to toggle dish diet type', 'error');
    }
  };

  const handleToggleDishAvailability = async (dish: any) => {
    const dishId = dish.id || dish._id;
    try {
      const res = await dishesAPI.toggleAvailability(dishId);
      const newStatus = res?.isAvailable ?? !dish.isAvailable;
      setDishes(prev => prev.map(d => (d.id === dishId || d._id === dishId) ? { ...d, isAvailable: newStatus } : d));
      showToast(`Dish "${dish.name}" is now ${newStatus ? 'In Stock (Available) 🟢' : 'Out of Stock (Sold Out) 🔴'}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to toggle availability', 'error');
    }
  };

  // ── USER MANAGEMENT & WALLET HANDLERS ──
  const handleOpenWalletModal = (u: any) => {
    setSelectedUserForWallet(u);
    setWalletCreditAmount(100);
    setWalletCreditReason('Goodwill wallet credit from mess admin');
    setUserWalletModalOpen(true);
  };

  const handleCreditUserWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForWallet) return;
    const uid = selectedUserForWallet._id || selectedUserForWallet.id;
    try {
      const res = await adminAPI.creditUserWallet(uid, walletCreditAmount, walletCreditReason);
      setUsersList(prev => prev.map(u => (u._id === uid || u.id === uid) ? { ...u, walletBalance: res.walletBalance ?? ((u.walletBalance || 0) + walletCreditAmount) } : u));
      setUserWalletModalOpen(false);
      showToast(`₹${walletCreditAmount} successfully credited to ${selectedUserForWallet.name}'s wallet!`);
    } catch (err: any) {
      showToast(err.message || 'Failed to update wallet balance', 'error');
    }
  };

  const handleToggleUserRole = async (u: any) => {
    const uid = u._id || u.id;
    const newRole = u.role === 'admin' ? 'customer' : 'admin';
    if (!window.confirm(`Change ${u.name}'s role to ${newRole.toUpperCase()}?`)) return;
    try {
      await adminAPI.updateUserRole(uid, newRole);
      setUsersList(prev => prev.map(user => (user._id === uid || user.id === uid) ? { ...user, role: newRole } : user));
      showToast(`${u.name}'s role updated to ${newRole.toUpperCase()}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to update role', 'error');
    }
  };

  const handleDeleteUser = async (u: any) => {
    const uid = u._id || u.id;
    if (!window.confirm(`Delete user account "${u.name}" (${u.email})?`)) return;
    try {
      await adminAPI.deleteUser(uid);
      setUsersList(prev => prev.filter(user => user._id !== uid && user.id !== uid));
      showToast(`User ${u.name} removed from database`);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete user', 'error');
    }
  };

  // ── COUPONS MANAGEMENT HANDLERS ──
  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await adminAPI.createCoupon(couponForm);
      const created = res?.coupon || { ...couponForm, id: 'CPN_' + Date.now(), usage: 0, status: 'active' };
      setCouponsList(prev => [created, ...prev]);
      setCouponModalOpen(false);
      showToast(`Coupon code "${couponForm.code.toUpperCase()}" created!`);
      setCouponForm({ code: '', type: 'Percentage', value: 20, minOrder: 149, maxUsage: 200, expiry: '2026-12-31', desc: 'Flat 20% OFF' });
    } catch (err: any) {
      showToast(err.message || 'Failed to create coupon', 'error');
    }
  };

  const handleToggleCoupon = async (coupon: any) => {
    const cid = coupon.id || coupon._id;
    try {
      await adminAPI.toggleCoupon(cid);
      setCouponsList(prev => prev.map(c => (c.id === cid || c._id === cid) ? { ...c, status: c.status === 'active' ? 'paused' : 'active' } : c));
      showToast(`Coupon ${coupon.code} status toggled!`);
    } catch (err: any) {
      showToast(err.message || 'Failed to toggle coupon', 'error');
    }
  };

  const handleDeleteCoupon = async (coupon: any) => {
    const cid = coupon.id || coupon._id;
    if (!window.confirm(`Delete coupon "${coupon.code}"?`)) return;
    try {
      await adminAPI.deleteCoupon(cid);
      setCouponsList(prev => prev.filter(c => c.id !== cid && c._id !== cid));
      showToast(`Coupon ${coupon.code} removed!`);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete coupon', 'error');
    }
  };

  // Count pending skip requests requiring admin action
  const pendingSkipsCount = skipRequests.filter(s => (s.status || '').toLowerCase() === 'pending').length;

  // Count extra orders placed by students (including any packed with meal)
  const extraOrdersList = liveOrders.filter(o => o.isExtraOrder || o.orderType === 'extra_addon' || o.deliverWithMeal);
  const extraOrdersCount = extraOrdersList.length;
  const pendingPackWithMealCount = extraOrdersList.filter(o => o.deliverWithMeal && o.status !== 'delivered' && o.status !== 'cancelled').length;

  // ── RENDER DELIVERY RATES & PARTNER PAYOUT CONTROL SUITE ──
  const renderDeliveryRatesSuite = () => {
    const filteredRiders = riders.filter(r => {
      if (!rateSearchRider.trim()) return true;
      const q = rateSearchRider.toLowerCase();
      return (r.name && r.name.toLowerCase().includes(q)) ||
        (r.phone && r.phone.includes(q)) ||
        (r.vehicle && r.vehicle.toLowerCase().includes(q)) ||
        (r.route && r.route.toLowerCase().includes(q));
    });

    const calculateInstantPreview = () => {
      const distance = Math.max(0, calcDistance);
      const cartAmount = Math.max(0, calcCartAmount);
      const zones = (deliveryRates.instantZones && deliveryRates.instantZones.length) ? deliveryRates.instantZones : DEFAULT_INSTANT_ZONES;
      const selectedZone = zones.find(z => z.id === calcSelectedZoneId) || zones[0];

      const isFree = deliveryRates.instantFreeDeliveryThreshold > 0 && cartAmount >= deliveryRates.instantFreeDeliveryThreshold;

      let distanceCharge = 0;
      if (deliveryRates.instantPricingMode === 'per_km') {
        const baseDist = 2.0;
        distanceCharge = deliveryRates.instantBaseDeliveryFee || 25;
        if (distance > baseDist) {
          distanceCharge += Math.round((distance - baseDist) * (deliveryRates.instantPerKmFee || 10));
        }
      } else {
        if (distance <= 2) distanceCharge = deliveryRates.instantSlab0to2Km || 25;
        else if (distance <= 5) distanceCharge = deliveryRates.instantSlab2to5Km || 40;
        else if (distance <= 8) distanceCharge = deliveryRates.instantSlab5to8Km || 65;
        else distanceCharge = deliveryRates.instantSlabAbove8Km || 90;
      }

      const zoneExtra = (selectedZone && selectedZone.isActive) ? (selectedZone.extraFee || 0) : 0;
      const peakFee = deliveryRates.instantPeakHourEnabled ? (deliveryRates.instantPeakHourFee || 0) : 0;
      const nightFee = deliveryRates.instantNightDeliveryEnabled ? (deliveryRates.instantNightDeliveryFee || 0) : 0;
      const rainFee = deliveryRates.instantRainFeeEnabled ? (deliveryRates.instantRainFee || 0) : 0;

      let subtotal = distanceCharge + zoneExtra + peakFee + nightFee + rainFee;
      let surgeAmount = 0;
      if (deliveryRates.instantSurgeEnabled) {
        if (deliveryRates.instantSurgeMode === 'multiplier' && (deliveryRates.instantSurgeMultiplier || 1.25) > 1) {
          const surged = Math.round(subtotal * Number(deliveryRates.instantSurgeMultiplier || 1.25));
          surgeAmount = surged - subtotal;
          subtotal = surged;
        } else {
          surgeAmount = Number(deliveryRates.instantSurgeFee || 20);
          subtotal += surgeAmount;
        }
      }

      const finalCustomerFee = isFree ? 0 : Math.max(0, subtotal);

      let riderPayout = deliveryRates.instantPerOrderRate || 40;
      if (deliveryRates.instantPeakHourEnabled) riderPayout += (deliveryRates.instantPeakSurgeBonus || 0);
      if (deliveryRates.instantRainFeeEnabled) riderPayout += (deliveryRates.instantRainSurgeBonus || 0);

      const belowMinOrder = deliveryRates.instantMinOrderValue > 0 && cartAmount < deliveryRates.instantMinOrderValue;

      return {
        distanceCharge,
        zoneExtra,
        selectedZoneName: selectedZone?.name || 'Standard Zone',
        peakFee,
        nightFee,
        rainFee,
        surgeAmount,
        isFree,
        finalCustomerFee,
        riderPayout,
        belowMinOrder
      };
    };

    const calcPreview = calculateInstantPreview();

    const handleToggleZoneActive = (zoneId: string) => {
      setDeliveryRates(prev => ({
        ...prev,
        instantZones: (prev.instantZones && prev.instantZones.length ? prev.instantZones : DEFAULT_INSTANT_ZONES).map(z =>
          z.id === zoneId ? { ...z, isActive: !z.isActive } : z
        )
      }));
    };

    const handleUpdateZoneFee = (zoneId: string, field: 'baseFee' | 'extraFee', val: number) => {
      setDeliveryRates(prev => ({
        ...prev,
        instantZones: (prev.instantZones && prev.instantZones.length ? prev.instantZones : DEFAULT_INSTANT_ZONES).map(z =>
          z.id === zoneId ? { ...z, [field]: Math.max(0, val) } : z
        )
      }));
    };

    const handleDeleteZone = (zoneId: string) => {
      setDeliveryRates(prev => ({
        ...prev,
        instantZones: (prev.instantZones && prev.instantZones.length ? prev.instantZones : DEFAULT_INSTANT_ZONES).filter(z => z.id !== zoneId)
      }));
    };

    const handleAddNewZone = () => {
      if (!newZoneName.trim()) {
        showToast('Please enter zone name', 'error');
        return;
      }
      const newZone: InstantDeliveryZone = {
        id: `zone-${Date.now()}`,
        name: newZoneName.trim(),
        baseFee: Math.max(0, newZoneBaseFee),
        extraFee: Math.max(0, newZoneExtraFee),
        isActive: true,
        description: newZoneDesc.trim() || 'Custom Campus Delivery Zone'
      };
      setDeliveryRates(prev => ({
        ...prev,
        instantZones: [...(prev.instantZones && prev.instantZones.length ? prev.instantZones : DEFAULT_INSTANT_ZONES), newZone]
      }));
      setNewZoneName('');
      setNewZoneBaseFee(30);
      setNewZoneExtraFee(5);
      setNewZoneDesc('');
      setIsAddingZone(false);
      showToast('New delivery zone added! Click Save Settings to persist.');
    };

    return (
      <div className="space-y-6">
        {/* Overview Header Card */}
        <div className="bg-white border-2 border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center font-black text-xl shadow-md">
                🛵
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    🛵 Delivery Rates & Partner Payout Controls
                  </h3>
                  <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Dual Engine Active
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure separate rates and partner payouts: <strong>🍱 Mess Delivery (Tiffins)</strong> and <strong>⚡ Instant Delivery (Quick Orders)</strong>.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  setQuickRateType('mess');
                  setQuickRateInput(deliveryRates.messPerBoxRate || 25);
                  setRateModalOpen(true);
                }}
                className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer"
                title="Quickly change Mess Tiffin rate"
              >
                <span>🍱 Quick Mess Rate</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setQuickRateType('instant');
                  setQuickRateInput(deliveryRates.instantPerOrderRate || 40);
                  setRateModalOpen(true);
                }}
                className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-300 text-blue-900 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer"
                title="Quickly change Instant Food rate"
              >
                <Zap size={13} className="text-blue-600" />
                <span>⚡ Quick Instant Rate</span>
              </button>

              <button
                type="button"
                onClick={() => handleSaveDeliveryRates(deliveryRates, false, 'both')}
                disabled={isSavingRates}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {isSavingRates ? <RefreshCw size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                <span>Save All Rates</span>
              </button>
            </div>
          </div>

          {/* Mode Switcher Tabs: Mess Delivery vs Instant Delivery vs Both */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => setRateSectionTab('mess')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-2 ${
                  rateSectionTab === 'mess'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>🍱 Mess Delivery Rates (Tiffins)</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  rateSectionTab === 'mess' ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  ₹{deliveryRates.messPerBoxRate || 25}/box
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRateSectionTab('instant')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-2 ${
                  rateSectionTab === 'instant'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Zap size={13} />
                <span>⚡ Instant Delivery Rates (Quick Food)</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  rateSectionTab === 'instant' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  ₹{deliveryRates.instantPerOrderRate || 40}/order
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRateSectionTab('all')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-2 ${
                  rateSectionTab === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>⚖️ Dual View (Both Side-by-Side)</span>
              </button>
            </div>

            <span className="text-xs font-semibold text-slate-500">
              Active configuration controls rider earnings &amp; student billing
            </span>
          </div>

          {/* 4 KPI Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
            {rateSectionTab === 'mess' ? (
              <>
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-200/80 space-y-1">
                  <span className="text-[11px] font-bold text-amber-800 flex items-center gap-1">
                    <Bike size={13} className="text-orange-600" /> Mess Base Payout
                  </span>
                  <p className="text-2xl font-black text-slate-900 tracking-tight">
                    ₹{deliveryRates.messPerBoxRate || 25}
                    <span className="text-xs font-bold text-slate-500 ml-1">/ tiffin box</span>
                  </p>
                  <p className="text-[10px] text-amber-700 font-medium">Earned by rider per mess meal</p>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50/50 border border-indigo-200/80 space-y-1">
                  <span className="text-[11px] font-bold text-indigo-800 flex items-center gap-1">
                    <Moon size={13} className="text-indigo-600" /> Dinner Shift Surge
                  </span>
                  <p className="text-2xl font-black text-indigo-950 tracking-tight">
                    +₹{deliveryRates.messDinnerSurgeBonus || 8}
                    <span className="text-xs font-bold text-indigo-500 ml-1">/ box</span>
                  </p>
                  <p className="text-[10px] text-indigo-700 font-medium">Night delivery incentive</p>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50/50 border border-purple-200/80 space-y-1">
                  <span className="text-[11px] font-bold text-purple-800 flex items-center gap-1">
                    <Sparkles size={13} className="text-purple-600" /> Extra Add-ons Bonus
                  </span>
                  <p className="text-2xl font-black text-purple-950 tracking-tight">
                    +₹{deliveryRates.messExtraAttachedBonus || 5}
                    <span className="text-xs font-bold text-purple-500 ml-1">/ box</span>
                  </p>
                  <p className="text-[10px] text-purple-700 font-medium">Extra roti/sweet packed with meal</p>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-200/80 space-y-1">
                  <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                    <ShieldCheck size={13} className="text-emerald-600" /> Mess Shift Guarantee
                  </span>
                  <p className="text-2xl font-black text-emerald-950 tracking-tight">
                    ₹{deliveryRates.messMinDailyGuarantee || 200}
                    <span className="text-xs font-bold text-emerald-500 ml-1">/ shift</span>
                  </p>
                  <p className="text-[10px] text-emerald-700 font-medium">Minimum floor for on-duty riders</p>
                </div>
              </>
            ) : rateSectionTab === 'instant' ? (
              <>
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-200/80 space-y-1">
                  <span className="text-[11px] font-bold text-blue-800 flex items-center gap-1">
                    <Zap size={13} className="text-blue-600" /> Instant Order Payout
                  </span>
                  <p className="text-2xl font-black text-blue-950 tracking-tight">
                    ₹{deliveryRates.instantPerOrderRate || 40}
                    <span className="text-xs font-bold text-blue-500 ml-1">/ order</span>
                  </p>
                  <p className="text-[10px] text-blue-700 font-medium">Earned by rider per instant run</p>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-50 to-blue-50/50 border border-cyan-200/80 space-y-1">
                  <span className="text-[11px] font-bold text-cyan-800 flex items-center gap-1">
                    <ShoppingBag size={13} className="text-cyan-600" /> Customer Instant Fee
                  </span>
                  <p className="text-2xl font-black text-cyan-950 tracking-tight">
                    ₹{deliveryRates.instantCustomerDeliveryFee || 35}
                    <span className="text-xs font-bold text-cyan-500 ml-1">/ order</span>
                  </p>
                  <p className="text-[10px] text-cyan-700 font-medium">Applied to quick food cart orders</p>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-200/80 space-y-1">
                  <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                    <Sparkles size={13} className="text-emerald-600" /> Free Delivery Above
                  </span>
                  <p className="text-2xl font-black text-emerald-950 tracking-tight">
                    ₹{deliveryRates.instantFreeDeliveryThreshold || 249}
                  </p>
                  <p className="text-[10px] text-emerald-700 font-medium">₹0 customer fee on orders above this</p>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50/50 border border-violet-200/80 space-y-1">
                  <span className="text-[11px] font-bold text-violet-800 flex items-center gap-1">
                    <TrendingUp size={13} className="text-violet-600" /> Peak Hour Surge
                  </span>
                  <p className="text-2xl font-black text-violet-950 tracking-tight">
                    +₹{deliveryRates.instantPeakSurgeBonus || 15}
                    <span className="text-xs font-bold text-violet-500 ml-1">/ order</span>
                  </p>
                  <p className="text-[10px] text-violet-700 font-medium">During rush / late-night snacks</p>
                </div>
              </>
            ) : (
              <>
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-200/80 space-y-1">
                  <span className="text-[11px] font-bold text-amber-800 flex items-center gap-1">
                    <span>🍱 Mess Box Rate</span>
                  </span>
                  <p className="text-2xl font-black text-slate-900 tracking-tight">
                    ₹{deliveryRates.messPerBoxRate || 25}
                    <span className="text-xs font-bold text-slate-500 ml-1">/ box</span>
                  </p>
                  <p className="text-[10px] text-amber-700 font-medium">Paid per scheduled tiffin box</p>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50/50 border border-indigo-200/80 space-y-1">
                  <span className="text-[11px] font-bold text-indigo-800 flex items-center gap-1">
                    <Moon size={13} className="text-indigo-600" /> Mess Dinner Bonus
                  </span>
                  <p className="text-2xl font-black text-indigo-950 tracking-tight">
                    +₹{deliveryRates.messDinnerSurgeBonus || 8}
                    <span className="text-xs font-bold text-indigo-500 ml-1">/ box</span>
                  </p>
                  <p className="text-[10px] text-indigo-700 font-medium">Night tiffin delivery incentive</p>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50/50 border border-blue-200/80 space-y-1">
                  <span className="text-[11px] font-bold text-blue-800 flex items-center gap-1">
                    <Zap size={13} className="text-blue-600" /> Instant Order Rate
                  </span>
                  <p className="text-2xl font-black text-blue-950 tracking-tight">
                    ₹{deliveryRates.instantPerOrderRate || 40}
                    <span className="text-xs font-bold text-blue-500 ml-1">/ order</span>
                  </p>
                  <p className="text-[10px] text-blue-700 font-medium">Paid per quick food delivery</p>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-200/80 space-y-1">
                  <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                    <ShoppingBag size={13} className="text-emerald-600" /> Instant Customer Fee
                  </span>
                  <p className="text-2xl font-black text-emerald-950 tracking-tight">
                    ₹{deliveryRates.instantCustomerDeliveryFee || 35}
                    <span className="text-xs font-bold text-emerald-500 ml-1">/ order</span>
                  </p>
                  <p className="text-[10px] text-emerald-700 font-medium">Free on orders above ₹{deliveryRates.instantFreeDeliveryThreshold || 249}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
           1. 🍱 MESS DELIVERY (TIFFIN BOXES) RATES & SETTINGS
        ══════════════════════════════════════════════════════════ */}
        {(rateSectionTab === 'all' || rateSectionTab === 'mess') && (
          <div className="bg-white border-2 border-amber-300 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-amber-100 pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                    🍱 Mess Tiffin Engine
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-bold text-slate-600">Daily Lunch &amp; Dinner Subscriptions</span>
                </div>
                <h4 className="font-black text-base text-slate-900">
                  🍱 Mess Delivery (Tiffin Boxes) Pricing &amp; Partner Payout Controls
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Set rider payout per delivered tiffin box, dinner shift bonuses, and extra items packing incentives.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveDeliveryRates(deliveryRates, true, 'mess')}
                  disabled={isSavingRates}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-black shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  title="Apply Mess Tiffin rate to all active delivery riders"
                >
                  <Sparkles size={13} />
                  <span>Apply ₹{deliveryRates.messPerBoxRate}/box to All {riders.length} Riders</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* 1. Rider Rate per Tiffin Box */}
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-1.5">
                <label className="text-xs font-black text-slate-800 block">
                  Rider Rate per Tiffin Box (₹)
                </label>
                <p className="text-[11px] text-slate-500">Base payout paid to rider for each tiffin box delivered</p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-sm font-black text-amber-700">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={deliveryRates.messPerBoxRate}
                    onChange={e => setDeliveryRates(prev => ({ ...prev, messPerBoxRate: Math.max(0, Number(e.target.value)), defaultPerDeliveryRate: Math.max(0, Number(e.target.value)) }))}
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-sm font-black text-slate-900 outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>

              {/* 2. Dinner Shift Night Surge */}
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-1.5">
                <label className="text-xs font-black text-slate-800 block">
                  Dinner Shift Night Surge Bonus (+₹)
                </label>
                <p className="text-[11px] text-slate-500">Incentive paid per box on dinner shift after dark</p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-sm font-black text-indigo-700">+₹</span>
                  <input
                    type="number"
                    min="0"
                    value={deliveryRates.messDinnerSurgeBonus}
                    onChange={e => setDeliveryRates(prev => ({ ...prev, messDinnerSurgeBonus: Math.max(0, Number(e.target.value)), dinnerSurgeBonus: Math.max(0, Number(e.target.value)) }))}
                    className="w-full px-3 py-2 bg-white border border-indigo-300 rounded-xl text-sm font-black text-slate-900 outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              {/* 3. Extra Add-on Attached Bonus */}
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-1.5">
                <label className="text-xs font-black text-slate-800 block">
                  Extra Add-on Attached Bonus (+₹)
                </label>
                <p className="text-[11px] text-slate-500">Bonus when meal includes extra sides, rotis, or sweets</p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-sm font-black text-purple-700">+₹</span>
                  <input
                    type="number"
                    min="0"
                    value={deliveryRates.messExtraAttachedBonus}
                    onChange={e => setDeliveryRates(prev => ({ ...prev, messExtraAttachedBonus: Math.max(0, Number(e.target.value)) }))}
                    className="w-full px-3 py-2 bg-white border border-purple-300 rounded-xl text-sm font-black text-slate-900 outline-none focus:border-purple-500 transition"
                  />
                </div>
              </div>

              {/* 4. Student Mess Delivery Charge */}
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-1.5">
                <label className="text-xs font-black text-slate-800 block">
                  Student / Customer Mess Delivery Fee (₹)
                </label>
                <p className="text-[11px] text-slate-500">Fee billed per meal (Set ₹0 for 100% Free Subscription delivery)</p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-sm font-black text-slate-700">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={deliveryRates.messCustomerDeliveryFee}
                    onChange={e => setDeliveryRates(prev => ({ ...prev, messCustomerDeliveryFee: Math.max(0, Number(e.target.value)) }))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-black text-slate-900 outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>

              {/* 5. Weekend / Sunday Special Thali Bonus */}
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-1.5">
                <label className="text-xs font-black text-slate-800 block">
                  Weekend Special Thali Bonus (+₹)
                </label>
                <p className="text-[11px] text-slate-500">Bonus for delivering heavy weekend &amp; Sunday special meals</p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-sm font-black text-amber-700">+₹</span>
                  <input
                    type="number"
                    min="0"
                    value={deliveryRates.messWeekendBonus}
                    onChange={e => setDeliveryRates(prev => ({ ...prev, messWeekendBonus: Math.max(0, Number(e.target.value)) }))}
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-sm font-black text-slate-900 outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>

              {/* 6. Mess Shift Minimum Guarantee */}
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-1.5">
                <label className="text-xs font-black text-slate-800 block">
                  Mess Shift Minimum Guarantee (₹)
                </label>
                <p className="text-[11px] text-slate-500">Minimum guaranteed earnings for on-duty tiffin delivery riders</p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-sm font-black text-slate-700">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={deliveryRates.messMinDailyGuarantee}
                    onChange={e => setDeliveryRates(prev => ({ ...prev, messMinDailyGuarantee: Math.max(0, Number(e.target.value)) }))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-black text-slate-900 outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => handleSaveDeliveryRates(deliveryRates, false, 'mess')}
                disabled={isSavingRates}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
              >
                {isSavingRates ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                <span>Save Mess Delivery Settings</span>
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
           2. ⚡ INSTANT DELIVERY (QUICK FOOD ORDERS) RATES & SETTINGS
        ══════════════════════════════════════════════════════════ */}
        {(rateSectionTab === 'all' || rateSectionTab === 'instant') && (
          <div className="bg-white border-2 border-blue-400 rounded-3xl p-5 sm:p-6 shadow-md space-y-6">
            {/* Header & Quick Action */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-blue-100 pb-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-900 border border-blue-300 flex items-center gap-1 shadow-xs">
                    <Zap size={11} className="text-blue-600" /> Instant Order Engine
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-bold text-slate-600">On-Demand Food Delivery</span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                    10 Active Pricing Rules
                  </span>
                  {deliveryRates.instantRainFeeEnabled && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-cyan-100 text-cyan-800 border border-cyan-300 animate-pulse flex items-center gap-1">
                      <CloudRain size={10} /> Rain Surge Active (+₹{deliveryRates.instantRainFee})
                    </span>
                  )}
                  {deliveryRates.instantSurgeEnabled && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                      <Zap size={10} /> High Demand Surge Active
                    </span>
                  )}
                </div>
                <h4 className="font-black text-lg text-slate-900 flex items-center gap-2">
                  <Zap className="text-blue-600" size={20} />
                  <span>⚡ Instant Food (Quick Extra Orders) Pricing &amp; Fee Controls</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Full control over customer delivery charges, distance slabs, minimum order values, peak/night/rain fees, high-demand surges, and zone-based rates.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveDeliveryRates(deliveryRates, true, 'instant')}
                  disabled={isSavingRates}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black shadow-md transition flex items-center gap-1.5 cursor-pointer"
                  title="Apply Instant Food rate to all active delivery riders"
                >
                  <Zap size={13} />
                  <span>Apply ₹{deliveryRates.instantPerOrderRate}/order to All {riders.length} Riders</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveDeliveryRates(deliveryRates, false, 'instant')}
                  disabled={isSavingRates}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  {isSavingRates ? <RefreshCw size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                  <span>Save Instant Settings</span>
                </button>
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════
               FEATURE & DESCRIPTION EXECUTIVE MATRIX (10 CONTROLS)
            ══════════════════════════════════════════════════════════ */}
            <div className="border border-blue-200/90 rounded-2xl overflow-hidden bg-gradient-to-b from-blue-50/40 to-white shadow-xs">
              <div className="p-3.5 bg-blue-500/10 border-b border-blue-200 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div className="flex items-center gap-2">
                  <Layers size={16} className="text-blue-700" />
                  <span className="text-xs font-black text-blue-950 uppercase tracking-wider">
                    Instant Food Pricing &amp; Fee Controls Matrix
                  </span>
                </div>
                <span className="text-[11px] text-blue-800 font-bold">
                  All 10 core pricing levers dynamically calculated on student checkout
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100/90 text-slate-700 font-black border-b border-slate-200">
                      <th className="py-2.5 px-4 w-48">Feature</th>
                      <th className="py-2.5 px-4">Description</th>
                      <th className="py-2.5 px-4 w-44">Current Setting</th>
                      <th className="py-2.5 px-4 w-36 text-center">Status / Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {/* 1. Base Delivery Fee */}
                    <tr className="hover:bg-blue-50/30 transition">
                      <td className="py-2.5 px-4 font-black text-slate-900 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-black flex items-center justify-center text-[11px]">1</span>
                        <span>Base Delivery Fee</span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">Initial delivery charge up to base distance (0–2 KM)</td>
                      <td className="py-2.5 px-4 font-black text-blue-700">₹{deliveryRates.instantBaseDeliveryFee}</td>
                      <td className="py-2.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Active
                        </span>
                      </td>
                    </tr>

                    {/* 2. Per KM Charge */}
                    <tr className="hover:bg-blue-50/30 transition">
                      <td className="py-2.5 px-4 font-black text-slate-900 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-black flex items-center justify-center text-[11px]">2</span>
                        <span>Per KM Charge</span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">Per kilometer delivery charge beyond base radius</td>
                      <td className="py-2.5 px-4 font-black text-indigo-700">₹{deliveryRates.instantPerKmFee} / KM</td>
                      <td className="py-2.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-800 border border-indigo-200">
                          Incremental
                        </span>
                      </td>
                    </tr>

                    {/* 3. Distance Slab */}
                    <tr className="hover:bg-blue-50/30 transition">
                      <td className="py-2.5 px-4 font-black text-slate-900 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-black flex items-center justify-center text-[11px]">3</span>
                        <span>Distance Slab</span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">
                        Tiered distance pricing: 0–2 KM (₹{deliveryRates.instantSlab0to2Km}), 2–5 KM (₹{deliveryRates.instantSlab2to5Km}), 5–8 KM (₹{deliveryRates.instantSlab5to8Km}), 8+ KM (₹{deliveryRates.instantSlabAbove8Km})
                      </td>
                      <td className="py-2.5 px-4 font-black text-slate-800">
                        4 Distance Slabs
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          deliveryRates.instantPricingMode === 'slabs' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {deliveryRates.instantPricingMode === 'slabs' ? 'Mode: Slabs' : 'Mode: Per KM'}
                        </span>
                      </td>
                    </tr>

                    {/* 4. Minimum Order Value */}
                    <tr className="hover:bg-blue-50/30 transition">
                      <td className="py-2.5 px-4 font-black text-slate-900 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-black flex items-center justify-center text-[11px]">4</span>
                        <span>Minimum Order Value</span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">Minimum food cart value required to place an instant order</td>
                      <td className="py-2.5 px-4 font-black text-amber-700">₹{deliveryRates.instantMinOrderValue} MOV</td>
                      <td className="py-2.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200">
                          Enforced
                        </span>
                      </td>
                    </tr>

                    {/* 5. Free Delivery */}
                    <tr className="hover:bg-blue-50/30 transition">
                      <td className="py-2.5 px-4 font-black text-slate-900 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-black flex items-center justify-center text-[11px]">5</span>
                        <span>Free Delivery</span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">100% Free delivery provided on student orders above threshold</td>
                      <td className="py-2.5 px-4 font-black text-emerald-700">Free above ₹{deliveryRates.instantFreeDeliveryThreshold}</td>
                      <td className="py-2.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Active Incentive
                        </span>
                      </td>
                    </tr>

                    {/* 6. Peak Hour Fee */}
                    <tr className="hover:bg-blue-50/30 transition">
                      <td className="py-2.5 px-4 font-black text-slate-900 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-black flex items-center justify-center text-[11px]">6</span>
                        <span>Peak Hour Fee</span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">Extra rush fee during peak hours ({deliveryRates.instantPeakHourTiming})</td>
                      <td className="py-2.5 px-4 font-black text-violet-700">+₹{deliveryRates.instantPeakHourFee} / order</td>
                      <td className="py-2.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setDeliveryRates(prev => ({ ...prev, instantPeakHourEnabled: !prev.instantPeakHourEnabled }))}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black cursor-pointer transition ${
                            deliveryRates.instantPeakHourEnabled ? 'bg-violet-100 text-violet-800 border border-violet-300' : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}
                        >
                          {deliveryRates.instantPeakHourEnabled ? 'ON (Active)' : 'OFF'}
                        </button>
                      </td>
                    </tr>

                    {/* 7. Night Delivery Fee */}
                    <tr className="hover:bg-blue-50/30 transition">
                      <td className="py-2.5 px-4 font-black text-slate-900 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-black flex items-center justify-center text-[11px]">7</span>
                        <span>Night Delivery Fee</span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">Extra late-night dispatch fee ({deliveryRates.instantNightTiming})</td>
                      <td className="py-2.5 px-4 font-black text-indigo-700">+₹{deliveryRates.instantNightDeliveryFee} / order</td>
                      <td className="py-2.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setDeliveryRates(prev => ({ ...prev, instantNightDeliveryEnabled: !prev.instantNightDeliveryEnabled }))}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black cursor-pointer transition ${
                            deliveryRates.instantNightDeliveryEnabled ? 'bg-indigo-100 text-indigo-800 border border-indigo-300' : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}
                        >
                          {deliveryRates.instantNightDeliveryEnabled ? 'ON (Active)' : 'OFF'}
                        </button>
                      </td>
                    </tr>

                    {/* 8. Rain Fee */}
                    <tr className="hover:bg-blue-50/30 transition">
                      <td className="py-2.5 px-4 font-black text-slate-900 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-black flex items-center justify-center text-[11px]">8</span>
                        <span>Rain Fee</span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">Bad weather &amp; monsoon extra delivery charge applied to live carts</td>
                      <td className="py-2.5 px-4 font-black text-cyan-700">+₹{deliveryRates.instantRainFee} / order</td>
                      <td className="py-2.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setDeliveryRates(prev => ({ ...prev, instantRainFeeEnabled: !prev.instantRainFeeEnabled }))}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black cursor-pointer transition flex items-center justify-center gap-1 mx-auto ${
                            deliveryRates.instantRainFeeEnabled ? 'bg-cyan-600 text-white shadow-xs' : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}
                        >
                          <CloudRain size={10} />
                          <span>{deliveryRates.instantRainFeeEnabled ? 'Rain ON' : 'Rain OFF'}</span>
                        </button>
                      </td>
                    </tr>

                    {/* 9. Surge Pricing */}
                    <tr className="hover:bg-blue-50/30 transition">
                      <td className="py-2.5 px-4 font-black text-slate-900 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-black flex items-center justify-center text-[11px]">9</span>
                        <span>Surge Pricing</span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">High order volume extra charge ({deliveryRates.instantSurgeMode === 'multiplier' ? `${deliveryRates.instantSurgeMultiplier}x Multiplier` : `+₹${deliveryRates.instantSurgeFee} Flat`})</td>
                      <td className="py-2.5 px-4 font-black text-amber-700">
                        {deliveryRates.instantSurgeMode === 'multiplier' ? `${deliveryRates.instantSurgeMultiplier}x` : `+₹${deliveryRates.instantSurgeFee}`}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setDeliveryRates(prev => ({ ...prev, instantSurgeEnabled: !prev.instantSurgeEnabled }))}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black cursor-pointer transition ${
                            deliveryRates.instantSurgeEnabled ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}
                        >
                          {deliveryRates.instantSurgeEnabled ? 'Surge ON' : 'Surge OFF'}
                        </button>
                      </td>
                    </tr>

                    {/* 10. Zone-Based Rates */}
                    <tr className="hover:bg-blue-50/30 transition">
                      <td className="py-2.5 px-4 font-black text-slate-900 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-black flex items-center justify-center text-[11px]">10</span>
                        <span>Zone-Based Rates</span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">Area-specific rates for hostellers, faculty quarters &amp; off-campus PGs</td>
                      <td className="py-2.5 px-4 font-black text-blue-900">
                        {(deliveryRates.instantZones || DEFAULT_INSTANT_ZONES).filter(z => z.isActive).length} Active Zones
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 border border-blue-200">
                          Zone Rules
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════
               DETAILED CONTROL CARDS (GRID OF 3 SUITES)
            ══════════════════════════════════════════════════════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* CARD A: 🛵 Distance Slabs & Base Delivery Fees */}
              <div className="p-5 rounded-2xl bg-blue-50/40 border border-blue-200 space-y-4">
                <div className="flex items-center justify-between border-b border-blue-200/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Bike size={16} className="text-blue-600" />
                    <h5 className="font-black text-sm text-slate-900">
                      🛵 Distance Slabs &amp; Base Delivery Charges
                    </h5>
                  </div>
                  <div className="flex items-center gap-1 p-0.5 bg-white border border-blue-200 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setDeliveryRates(prev => ({ ...prev, instantPricingMode: 'slabs' }))}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition cursor-pointer ${
                        deliveryRates.instantPricingMode === 'slabs' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      Distance Slabs
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryRates(prev => ({ ...prev, instantPricingMode: 'per_km' }))}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition cursor-pointer ${
                        deliveryRates.instantPricingMode === 'per_km' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      Base + Per KM
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Base Delivery Fee */}
                  <div className="p-3 bg-white border border-blue-200 rounded-xl space-y-1">
                    <label className="text-[11px] font-black text-slate-800 block">
                      Base Delivery Fee (0–2 KM)
                    </label>
                    <p className="text-[10px] text-slate-500">Starting delivery fee for core campus</p>
                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="text-sm font-black text-blue-700">₹</span>
                      <input
                        type="number"
                        min="0"
                        value={deliveryRates.instantBaseDeliveryFee}
                        onChange={e => {
                          const v = Math.max(0, Number(e.target.value));
                          setDeliveryRates(prev => ({ ...prev, instantBaseDeliveryFee: v, instantCustomerDeliveryFee: v, customerDeliveryFee: v, instantSlab0to2Km: v }));
                        }}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-blue-200 rounded-lg text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Per KM Charge */}
                  <div className="p-3 bg-white border border-blue-200 rounded-xl space-y-1">
                    <label className="text-[11px] font-black text-slate-800 block">
                      Per KM Charge (After 2 KM)
                    </label>
                    <p className="text-[10px] text-slate-500">Rate per KM for long-distance deliveries</p>
                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="text-sm font-black text-indigo-700">₹</span>
                      <input
                        type="number"
                        min="0"
                        value={deliveryRates.instantPerKmFee}
                        onChange={e => setDeliveryRates(prev => ({ ...prev, instantPerKmFee: Math.max(0, Number(e.target.value)) }))}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-blue-200 rounded-lg text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Minimum Order Value */}
                  <div className="p-3 bg-white border border-blue-200 rounded-xl space-y-1">
                    <label className="text-[11px] font-black text-slate-800 block">
                      Minimum Order Value (MOV)
                    </label>
                    <p className="text-[10px] text-slate-500">Minimum cart amount to place order</p>
                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="text-sm font-black text-amber-700">₹</span>
                      <input
                        type="number"
                        min="0"
                        value={deliveryRates.instantMinOrderValue}
                        onChange={e => setDeliveryRates(prev => ({ ...prev, instantMinOrderValue: Math.max(0, Number(e.target.value)) }))}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-blue-200 rounded-lg text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Free Delivery Threshold */}
                  <div className="p-3 bg-white border border-blue-200 rounded-xl space-y-1">
                    <label className="text-[11px] font-black text-slate-800 block">
                      Free Delivery Threshold (₹)
                    </label>
                    <p className="text-[10px] text-slate-500">Free delivery on orders exceeding this</p>
                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="text-sm font-black text-emerald-700">₹</span>
                      <input
                        type="number"
                        min="0"
                        value={deliveryRates.instantFreeDeliveryThreshold}
                        onChange={e => setDeliveryRates(prev => ({ ...prev, instantFreeDeliveryThreshold: Math.max(0, Number(e.target.value)), freeDeliveryThreshold: Math.max(0, Number(e.target.value)) }))}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-blue-200 rounded-lg text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Distance Slab Tier Grid */}
                <div className="p-3.5 bg-white border border-blue-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800">
                      Distance Slab Tiers Configuration
                    </span>
                    <span className="text-[10px] font-bold text-blue-600">
                      Applied when distance-based pricing is active
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {/* Slab 1 */}
                    <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
                      <span className="text-[10px] font-black text-slate-600 block">0–2 KM</span>
                      <p className="text-[9px] text-slate-400">Hostels &amp; Core</p>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-black text-blue-700">₹</span>
                        <input
                          type="number"
                          min="0"
                          value={deliveryRates.instantSlab0to2Km}
                          onChange={e => setDeliveryRates(prev => ({ ...prev, instantSlab0to2Km: Math.max(0, Number(e.target.value)) }))}
                          className="w-full px-2 py-1 bg-white border border-blue-300 rounded text-xs font-black text-slate-900"
                        />
                      </div>
                    </div>

                    {/* Slab 2 */}
                    <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
                      <span className="text-[10px] font-black text-slate-600 block">2–5 KM</span>
                      <p className="text-[9px] text-slate-400">Extended Campus</p>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-black text-blue-700">₹</span>
                        <input
                          type="number"
                          min="0"
                          value={deliveryRates.instantSlab2to5Km}
                          onChange={e => setDeliveryRates(prev => ({ ...prev, instantSlab2to5Km: Math.max(0, Number(e.target.value)) }))}
                          className="w-full px-2 py-1 bg-white border border-blue-300 rounded text-xs font-black text-slate-900"
                        />
                      </div>
                    </div>

                    {/* Slab 3 */}
                    <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
                      <span className="text-[10px] font-black text-slate-600 block">5–8 KM</span>
                      <p className="text-[9px] text-slate-400">Outer Hostels &amp; PGs</p>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-black text-blue-700">₹</span>
                        <input
                          type="number"
                          min="0"
                          value={deliveryRates.instantSlab5to8Km}
                          onChange={e => setDeliveryRates(prev => ({ ...prev, instantSlab5to8Km: Math.max(0, Number(e.target.value)) }))}
                          className="w-full px-2 py-1 bg-white border border-blue-300 rounded text-xs font-black text-slate-900"
                        />
                      </div>
                    </div>

                    {/* Slab 4 */}
                    <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
                      <span className="text-[10px] font-black text-slate-600 block">8+ KM</span>
                      <p className="text-[9px] text-slate-400">Long Distance Hub</p>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-black text-blue-700">₹</span>
                        <input
                          type="number"
                          min="0"
                          value={deliveryRates.instantSlabAbove8Km}
                          onChange={e => setDeliveryRates(prev => ({ ...prev, instantSlabAbove8Km: Math.max(0, Number(e.target.value)) }))}
                          className="w-full px-2 py-1 bg-white border border-blue-300 rounded text-xs font-black text-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD B: ⚡ Dynamic Surge, Night, Rush & Weather Fees (Live Toggles) */}
              <div className="p-5 rounded-2xl bg-indigo-50/40 border border-indigo-200 space-y-4">
                <div className="flex items-center justify-between border-b border-indigo-200/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-indigo-600" />
                    <h5 className="font-black text-sm text-slate-900">
                      ⚡ Dynamic Surge, Night, Rush &amp; Weather Fees
                    </h5>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                    Live Toggle Levers
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Peak Hour Fee */}
                  <div className="p-3 bg-white border border-indigo-200 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-black text-slate-800">
                        Peak Hour Rush Fee
                      </label>
                      <button
                        type="button"
                        onClick={() => setDeliveryRates(prev => ({ ...prev, instantPeakHourEnabled: !prev.instantPeakHourEnabled }))}
                        className={`px-2 py-0.5 rounded-full text-[9px] font-black cursor-pointer transition ${
                          deliveryRates.instantPeakHourEnabled ? 'bg-violet-600 text-white' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {deliveryRates.instantPeakHourEnabled ? 'ENABLED' : 'DISABLED'}
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-violet-700">+₹</span>
                      <input
                        type="number"
                        min="0"
                        value={deliveryRates.instantPeakHourFee}
                        onChange={e => setDeliveryRates(prev => ({ ...prev, instantPeakHourFee: Math.max(0, Number(e.target.value)) }))}
                        className="w-full px-2 py-1 bg-slate-50 border border-indigo-200 rounded text-sm font-black text-slate-900 outline-none focus:bg-white"
                      />
                    </div>
                    <input
                      type="text"
                      value={deliveryRates.instantPeakHourTiming}
                      onChange={e => setDeliveryRates(prev => ({ ...prev, instantPeakHourTiming: e.target.value }))}
                      placeholder="e.g. 12:30 PM - 02:30 PM & 07:30 PM - 10:30 PM"
                      className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[10px] text-slate-600"
                    />
                  </div>

                  {/* Night Delivery Fee */}
                  <div className="p-3 bg-white border border-indigo-200 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-black text-slate-800">
                        Night Delivery Fee
                      </label>
                      <button
                        type="button"
                        onClick={() => setDeliveryRates(prev => ({ ...prev, instantNightDeliveryEnabled: !prev.instantNightDeliveryEnabled }))}
                        className={`px-2 py-0.5 rounded-full text-[9px] font-black cursor-pointer transition ${
                          deliveryRates.instantNightDeliveryEnabled ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {deliveryRates.instantNightDeliveryEnabled ? 'ENABLED' : 'DISABLED'}
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-indigo-700">+₹</span>
                      <input
                        type="number"
                        min="0"
                        value={deliveryRates.instantNightDeliveryFee}
                        onChange={e => setDeliveryRates(prev => ({ ...prev, instantNightDeliveryFee: Math.max(0, Number(e.target.value)) }))}
                        className="w-full px-2 py-1 bg-slate-50 border border-indigo-200 rounded text-sm font-black text-slate-900 outline-none focus:bg-white"
                      />
                    </div>
                    <input
                      type="text"
                      value={deliveryRates.instantNightTiming}
                      onChange={e => setDeliveryRates(prev => ({ ...prev, instantNightTiming: e.target.value }))}
                      placeholder="e.g. 10:30 PM - 03:00 AM"
                      className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[10px] text-slate-600"
                    />
                  </div>

                  {/* Rain Fee (Bad Weather Surge) */}
                  <div className={`p-3 rounded-xl border transition space-y-1.5 ${
                    deliveryRates.instantRainFeeEnabled ? 'bg-cyan-50/90 border-cyan-300' : 'bg-white border-indigo-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-black text-slate-800 flex items-center gap-1">
                        <CloudRain size={13} className="text-cyan-600" />
                        <span>Rain / Bad Weather Fee</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setDeliveryRates(prev => ({ ...prev, instantRainFeeEnabled: !prev.instantRainFeeEnabled }))}
                        className={`px-2.5 py-0.5 rounded-full text-[9px] font-black cursor-pointer transition flex items-center gap-1 ${
                          deliveryRates.instantRainFeeEnabled ? 'bg-cyan-600 text-white shadow-xs' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        <CloudRain size={10} />
                        <span>{deliveryRates.instantRainFeeEnabled ? 'RAIN MODE ON' : 'OFF'}</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500">Auto-added to customer cart during storm/rain</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-cyan-700">+₹</span>
                      <input
                        type="number"
                        min="0"
                        value={deliveryRates.instantRainFee}
                        onChange={e => setDeliveryRates(prev => ({ ...prev, instantRainFee: Math.max(0, Number(e.target.value)) }))}
                        className="w-full px-2 py-1 bg-slate-50 border border-indigo-200 rounded text-sm font-black text-slate-900 outline-none focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* High Demand Surge Pricing */}
                  <div className={`p-3 rounded-xl border transition space-y-1.5 ${
                    deliveryRates.instantSurgeEnabled ? 'bg-amber-50/90 border-amber-300' : 'bg-white border-indigo-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-black text-slate-800 flex items-center gap-1">
                        <Zap size={13} className="text-amber-500" />
                        <span>High Demand Surge Pricing</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setDeliveryRates(prev => ({ ...prev, instantSurgeEnabled: !prev.instantSurgeEnabled }))}
                        className={`px-2.5 py-0.5 rounded-full text-[9px] font-black cursor-pointer transition ${
                          deliveryRates.instantSurgeEnabled ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {deliveryRates.instantSurgeEnabled ? 'SURGE ON' : 'OFF'}
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={deliveryRates.instantSurgeMode}
                        onChange={e => setDeliveryRates(prev => ({ ...prev, instantSurgeMode: e.target.value as any }))}
                        className="px-2 py-1 bg-slate-50 border border-slate-300 rounded text-xs font-bold text-slate-800"
                      >
                        <option value="flat">Flat Surcharge (+₹)</option>
                        <option value="multiplier">Multiplier (x)</option>
                      </select>
                      {deliveryRates.instantSurgeMode === 'multiplier' ? (
                        <div className="flex items-center gap-1 w-full">
                          <input
                            type="number"
                            step="0.05"
                            min="1.0"
                            value={deliveryRates.instantSurgeMultiplier}
                            onChange={e => setDeliveryRates(prev => ({ ...prev, instantSurgeMultiplier: Math.max(1, Number(e.target.value)) }))}
                            className="w-full px-2 py-1 bg-slate-50 border border-indigo-200 rounded text-sm font-black text-slate-900 outline-none focus:bg-white"
                          />
                          <span className="text-xs font-black text-slate-700">x</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 w-full">
                          <span className="text-sm font-black text-amber-700">+₹</span>
                          <input
                            type="number"
                            min="0"
                            value={deliveryRates.instantSurgeFee}
                            onChange={e => setDeliveryRates(prev => ({ ...prev, instantSurgeFee: Math.max(0, Number(e.target.value)) }))}
                            className="w-full px-2 py-1 bg-slate-50 border border-indigo-200 rounded text-sm font-black text-slate-900 outline-none focus:bg-white"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════
               CARD C: 📍 ZONE-BASED RATES (AREA-WISE DELIVERY CHARGES)
            ══════════════════════════════════════════════════════════ */}
            <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-300/80 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <MapPin size={17} className="text-blue-600" />
                  <div>
                    <h5 className="font-black text-sm text-slate-900">
                      📍 Zone-Based Rates (Campus Area Delivery Charges)
                    </h5>
                    <p className="text-[11px] text-slate-500">
                      Configure different delivery fees and area surcharges across hostel clusters, faculty blocks, and off-campus zones.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddingZone(prev => !prev)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition flex items-center gap-1 cursor-pointer self-start sm:self-auto shadow-xs"
                >
                  <Plus size={13} />
                  <span>{isAddingZone ? 'Cancel Add Zone' : '+ Add Campus Zone'}</span>
                </button>
              </div>

              {/* Inline Add Zone Form */}
              {isAddingZone && (
                <div className="p-4 bg-white border-2 border-blue-300 rounded-2xl space-y-3 shadow-sm animate-fade-in">
                  <h6 className="font-black text-xs text-blue-900 flex items-center gap-1.5">
                    <Plus size={14} className="text-blue-600" />
                    <span>Create New Campus Delivery Zone</span>
                  </h6>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Zone Name</label>
                      <input
                        type="text"
                        placeholder="e.g. South Campus Engineering Block"
                        value={newZoneName}
                        onChange={e => setNewZoneName(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 outline-none focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Base Fee (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={newZoneBaseFee}
                        onChange={e => setNewZoneBaseFee(Math.max(0, Number(e.target.value)))}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 outline-none focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Area Surcharge (+₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={newZoneExtraFee}
                        onChange={e => setNewZoneExtraFee(Math.max(0, Number(e.target.value)))}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 outline-none focus:bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Zone Description</label>
                    <input
                      type="text"
                      placeholder="e.g. Science block, Labs and Faculty Guest House within 3.5 KM"
                      value={newZoneDesc}
                      onChange={e => setNewZoneDesc(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-700 outline-none focus:bg-white"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingZone(false)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddNewZone}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-xs cursor-pointer flex items-center gap-1"
                    >
                      <CheckCircle2 size={13} />
                      <span>Add Zone</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Zones Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-black border-b border-slate-200">
                      <th className="py-2.5 px-4">Campus Zone Name &amp; Coverage</th>
                      <th className="py-2.5 px-3 w-32">Base Fee (₹)</th>
                      <th className="py-2.5 px-3 w-36">Extra Surcharge (+₹)</th>
                      <th className="py-2.5 px-3 w-36">Effective Fee (₹)</th>
                      <th className="py-2.5 px-3 w-28 text-center">Active Status</th>
                      <th className="py-2.5 px-3 w-20 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(deliveryRates.instantZones && deliveryRates.instantZones.length ? deliveryRates.instantZones : DEFAULT_INSTANT_ZONES).map(zone => {
                      const totalZoneFee = (zone.baseFee || 0) + (zone.extraFee || 0);
                      return (
                        <tr key={zone.id} className="hover:bg-slate-50 transition">
                          <td className="py-2.5 px-4">
                            <p className="font-black text-slate-900">{zone.name}</p>
                            <p className="text-[10px] text-slate-500">{zone.description || 'Standard Campus Zone'}</p>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-1">
                              <span className="font-bold text-slate-400">₹</span>
                              <input
                                type="number"
                                min="0"
                                value={zone.baseFee}
                                onChange={e => handleUpdateZoneFee(zone.id, 'baseFee', Number(e.target.value))}
                                className="w-20 px-2 py-1 bg-slate-50 border border-slate-300 rounded text-xs font-black text-slate-800"
                              />
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-1">
                              <span className="font-bold text-slate-400">+₹</span>
                              <input
                                type="number"
                                min="0"
                                value={zone.extraFee}
                                onChange={e => handleUpdateZoneFee(zone.id, 'extraFee', Number(e.target.value))}
                                className="w-20 px-2 py-1 bg-slate-50 border border-slate-300 rounded text-xs font-black text-slate-800"
                              />
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                              ₹{totalZoneFee}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleZoneActive(zone.id)}
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black cursor-pointer transition ${
                                zone.isActive ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-100 text-slate-500 border border-slate-200'
                              }`}
                            >
                              {zone.isActive ? 'ACTIVE' : 'PAUSED'}
                            </button>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteZone(zone.id)}
                              className="text-slate-400 hover:text-rose-600 transition p-1 cursor-pointer"
                              title="Delete this zone"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════
               CARD D: 🚴 INSTANT DELIVERY PARTNER (RIDER) PAYOUT CONTROLS
            ══════════════════════════════════════════════════════════ */}
            <div className="p-5 rounded-2xl bg-amber-50/40 border border-amber-200 space-y-4">
              <div className="flex items-center justify-between border-b border-amber-200/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <DollarSign size={16} className="text-amber-600" />
                  <h5 className="font-black text-sm text-slate-900">
                    🚴 Instant Delivery Partner (Rider) Payout Controls
                  </h5>
                </div>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                  Partner Earnings Structure
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* 1. Rider Rate per Instant Order */}
                <div className="p-3 bg-white border border-amber-200 rounded-xl space-y-1">
                  <label className="text-[11px] font-black text-slate-800 block">
                    Rider Payout / Instant Order
                  </label>
                  <p className="text-[10px] text-slate-500">Base commission earned per trip</p>
                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="text-sm font-black text-amber-700">₹</span>
                    <input
                      type="number"
                      min="0"
                      value={deliveryRates.instantPerOrderRate}
                      onChange={e => setDeliveryRates(prev => ({ ...prev, instantPerOrderRate: Math.max(0, Number(e.target.value)) }))}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-amber-300 rounded-lg text-sm font-black text-slate-900 outline-none focus:bg-white"
                    />
                  </div>
                </div>

                {/* 2. Peak Hours Surge Bonus */}
                <div className="p-3 bg-white border border-amber-200 rounded-xl space-y-1">
                  <label className="text-[11px] font-black text-slate-800 block">
                    Rider Peak Surge Bonus
                  </label>
                  <p className="text-[10px] text-slate-500">Extra incentive during lunch/dinner peak</p>
                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="text-sm font-black text-violet-700">+₹</span>
                    <input
                      type="number"
                      min="0"
                      value={deliveryRates.instantPeakSurgeBonus}
                      onChange={e => setDeliveryRates(prev => ({ ...prev, instantPeakSurgeBonus: Math.max(0, Number(e.target.value)) }))}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-violet-300 rounded-lg text-sm font-black text-slate-900 outline-none focus:bg-white"
                    />
                  </div>
                </div>

                {/* 3. Rain / Weather Surge Bonus */}
                <div className="p-3 bg-white border border-amber-200 rounded-xl space-y-1">
                  <label className="text-[11px] font-black text-slate-800 block">
                    Rider Rain / Weather Bonus
                  </label>
                  <p className="text-[10px] text-slate-500">Extra incentive paid per run in rain</p>
                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="text-sm font-black text-cyan-700">+₹</span>
                    <input
                      type="number"
                      min="0"
                      value={deliveryRates.instantRainSurgeBonus}
                      onChange={e => setDeliveryRates(prev => ({ ...prev, instantRainSurgeBonus: Math.max(0, Number(e.target.value)) }))}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-cyan-300 rounded-lg text-sm font-black text-slate-900 outline-none focus:bg-white"
                    />
                  </div>
                </div>

                {/* 4. Instant Fleet Minimum Daily Guarantee */}
                <div className="p-3 bg-white border border-amber-200 rounded-xl space-y-1">
                  <label className="text-[11px] font-black text-slate-800 block">
                    Minimum Daily Guarantee
                  </label>
                  <p className="text-[10px] text-slate-500">Guaranteed safety floor payout</p>
                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="text-sm font-black text-slate-700">₹</span>
                    <input
                      type="number"
                      min="0"
                      value={deliveryRates.instantMinDailyGuarantee}
                      onChange={e => setDeliveryRates(prev => ({ ...prev, instantMinDailyGuarantee: Math.max(0, Number(e.target.value)) }))}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-black text-slate-900 outline-none focus:bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════
               CARD E: 🧮 INTERACTIVE LIVE DELIVERY FEE CALCULATOR (SIMULATOR)
            ══════════════════════════════════════════════════════════ */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-blue-950 text-white space-y-4 shadow-lg">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Calculator size={18} className="text-blue-400" />
                  <div>
                    <h5 className="font-black text-sm text-white">
                      🧮 Live Delivery Fee &amp; Payout Calculator (Simulator)
                    </h5>
                    <p className="text-[11px] text-slate-300">
                      Simulate what a student will be charged and what the delivery partner will earn in real time.
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Real-time Formula Engine
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Distance Slider/Input */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-300">Distance (KM)</span>
                    <span className="font-black text-blue-400">{calcDistance} KM</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="12.0"
                    step="0.5"
                    value={calcDistance}
                    onChange={e => setCalcDistance(Number(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>0.5 KM (Hostel)</span>
                    <span>5 KM</span>
                    <span>12 KM (Outer)</span>
                  </div>
                </div>

                {/* Cart Value Input */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-300">Food Cart Amount</span>
                    <span className="font-black text-emerald-400">₹{calcCartAmount}</span>
                  </div>
                  <input
                    type="number"
                    min="20"
                    step="10"
                    value={calcCartAmount}
                    onChange={e => setCalcCartAmount(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-1.5 bg-white/10 border border-white/20 rounded-xl text-sm font-black text-white outline-none focus:border-blue-400"
                  />
                  <p className="text-[10px] text-slate-400">
                    Free delivery threshold: <strong>₹{deliveryRates.instantFreeDeliveryThreshold}</strong>
                  </p>
                </div>

                {/* Zone Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">Select Delivery Zone</label>
                  <select
                    value={calcSelectedZoneId}
                    onChange={e => setCalcSelectedZoneId(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white/10 border border-white/20 rounded-xl text-xs font-bold text-white outline-none focus:border-blue-400"
                  >
                    {(deliveryRates.instantZones || DEFAULT_INSTANT_ZONES).map(z => (
                      <option key={z.id} value={z.id} className="bg-slate-900 text-white">
                        {z.name} (+₹{z.extraFee || 0})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-400">Selected zone area surcharge applied</p>
                </div>
              </div>

              {/* Simulation Result Card */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Customer Delivery Fee */}
                <div className="space-y-1 border-b sm:border-b-0 sm:border-r border-white/10 pb-3 sm:pb-0 sm:pr-3">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Student Delivery Fee
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-white">
                      ₹{calcPreview.finalCustomerFee}
                    </span>
                    {calcPreview.isFree && (
                      <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        🎉 FREE DELIVERY
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Base Distance Fee: ₹{calcPreview.distanceCharge} | Zone Extra: ₹{calcPreview.zoneExtra}
                  </p>
                </div>

                {/* Active Surcharges Breakdown */}
                <div className="space-y-1 border-b sm:border-b-0 sm:border-r border-white/10 pb-3 sm:pb-0 sm:pr-3 text-[11px] text-slate-300">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Active Surcharges Applied
                  </p>
                  <div className="grid grid-cols-2 gap-1 pt-0.5 text-[11px]">
                    <span>Peak Rush: <strong className="text-violet-300">+₹{calcPreview.peakFee}</strong></span>
                    <span>Late Night: <strong className="text-indigo-300">+₹{calcPreview.nightFee}</strong></span>
                    <span>Rain Alert: <strong className="text-cyan-300">+₹{calcPreview.rainFee}</strong></span>
                    <span>Demand Surge: <strong className="text-amber-300">+₹{calcPreview.surgeAmount}</strong></span>
                  </div>
                </div>

                {/* Partner Payout */}
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Rider Payout for This Trip
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-amber-400">
                      ₹{calcPreview.riderPayout}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      (Base: ₹{deliveryRates.instantPerOrderRate} + Bonuses: ₹{calcPreview.riderPayout - deliveryRates.instantPerOrderRate})
                    </span>
                  </div>
                  {calcPreview.belowMinOrder && (
                    <p className="text-[10px] font-bold text-rose-300 flex items-center gap-1">
                      <AlertTriangle size={11} /> Cart is below ₹{deliveryRates.instantMinOrderValue} Minimum Order Value
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Save Bar */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pt-2 border-t border-blue-100">
              <span className="text-xs text-slate-500">
                All 10 Instant Pricing features are stored persistently and take effect immediately on student checkouts.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveDeliveryRates(deliveryRates, false, 'instant')}
                  disabled={isSavingRates}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  {isSavingRates ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  <span>Save All Instant Delivery Pricing Settings</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
           3. INDIVIDUAL RIDER DELIVERY RATES (MESS & INSTANT)
        ══════════════════════════════════════════════════════════ */}
        <div className="bg-white border-2 border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-100 pb-3">
            <div>
              <h4 className="font-black text-base text-slate-900 flex items-center gap-2">
                <span>🛵 Individual Rider Delivery Rates (Mess vs. Instant)</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-bold">
                  {riders.length} Riders
                </span>
              </h4>
              <p className="text-xs text-slate-500">
                Set custom rates for specific riders across both <strong>🍱 Mess Tiffin (/box)</strong> and <strong>⚡ Instant Order (/order)</strong>.
              </p>
            </div>

            <div className="w-full sm:w-64">
              <input
                type="text"
                placeholder="Search rider name, phone, vehicle..."
                value={rateSearchRider}
                onChange={e => setRateSearchRider(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-black tracking-wider uppercase text-[10px]">
                  <th className="py-2.5 px-3">Delivery Partner</th>
                  <th className="py-2.5 px-3">Campus Route</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Today Deliveries</th>
                  <th className="py-2.5 px-3">🍱 Mess Rate</th>
                  <th className="py-2.5 px-3">⚡ Instant Rate</th>
                  <th className="py-2.5 px-3 text-right">Customize Rates</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredRiders.map(r => {
                  const messRate = r.messDeliveryRate || r.perDeliveryRate || deliveryRates.messPerBoxRate || 25;
                  const instantRate = r.instantDeliveryRate || deliveryRates.instantPerOrderRate || 40;
                  const isEditing = editingRiderRateId === r.id;

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-black text-xs shrink-0">
                            🛵
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{r.name}</p>
                            <p className="text-[10px] text-slate-400">{r.vehicle || 'Vehicle'} • {r.phone}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-slate-600 font-semibold">
                        {r.route || 'Campus Route'}
                      </td>

                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          r.status === 'available'
                            ? 'bg-emerald-100 text-emerald-800'
                            : r.status === 'on-route'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {r.status || 'offline'}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-bold text-slate-800">
                        {r.deliveriesToday || 0} deliveries
                        <span className="text-[10px] text-emerald-600 block">
                          ₹{(r.deliveriesToday || 0) * messRate} est. earned
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-bold text-slate-500">₹</span>
                            <input
                              type="number"
                              min="0"
                              value={editingRiderMessRate}
                              onChange={e => setEditingRiderMessRate(Number(e.target.value))}
                              className="w-14 px-1.5 py-1 bg-white border border-amber-400 rounded-lg text-xs font-black text-slate-900 outline-none"
                              placeholder="Mess"
                            />
                            <span className="text-[10px] text-slate-400">/box</span>
                          </div>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-amber-50 text-amber-900 border border-amber-300 inline-block">
                            ₹{messRate} / box
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-bold text-slate-500">₹</span>
                            <input
                              type="number"
                              min="0"
                              value={editingRiderInstantRate}
                              onChange={e => setEditingRiderInstantRate(Number(e.target.value))}
                              className="w-14 px-1.5 py-1 bg-white border border-blue-400 rounded-lg text-xs font-black text-slate-900 outline-none"
                              placeholder="Instant"
                            />
                            <span className="text-[10px] text-slate-400">/order</span>
                          </div>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-blue-50 text-blue-900 border border-blue-300 inline-block">
                            ₹{instantRate} / order
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleUpdateSingleRiderRate(r.id, editingRiderMessRate, editingRiderInstantRate)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black transition cursor-pointer"
                            >
                              ✓ Save Both
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingRiderRateId(null)}
                              className="px-2 py-1 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-300 transition cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingRiderRateId(r.id);
                              setEditingRiderMessRate(messRate);
                              setEditingRiderInstantRate(instantRate);
                            }}
                            className="px-3 py-1 bg-slate-100 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold transition cursor-pointer inline-flex items-center gap-1"
                          >
                            <Edit size={11} />
                            <span>Edit Rates</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // ── RENDER MESS DELIVERY TIMINGS & KITCHEN CUTOFF MANAGEMENT SUITE ──
  const renderMealTimingsSuite = () => {
    const handleSlotChange = (slot: 'breakfast' | 'lunch' | 'dinner', field: string, value: any) => {
      setMealTimings(prev => {
        const currentSlot = (prev as any)[slot] || {};
        const updatedSlot = { ...currentSlot, [field]: value };

        // Automatically format 12-hour strings if time inputs changed
        if (field === 'deliveryStart' || field === 'deliveryEnd') {
          const start = field === 'deliveryStart' ? value : currentSlot.deliveryStart;
          const end = field === 'deliveryEnd' ? value : currentSlot.deliveryEnd;
          updatedSlot.deliveryTimeStr = `${format24to12(start)} - ${format24to12(end)}`;
        }
        if (field === 'cutoffTime') {
          updatedSlot.cutoffTimeStr = format24to12(value);
        }
        if (field === 'skipCutoffTime') {
          updatedSlot.skipCutoffTimeStr = format24to12(value);
        }

        return {
          ...prev,
          [slot]: updatedSlot
        };
      });
    };

    return (
      <div className="space-y-6">
        {/* Top Header Card */}
        <div className="bg-white border-2 border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                ⏰ Mess Timing Controls
              </span>
              <span className="text-xs font-semibold text-slate-400">•</span>
              <span className="text-xs font-bold text-slate-600">Dynamic Kitchen Schedule &amp; Cutoffs</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Clock className="text-amber-500" size={26} />
              Mess Delivery Timings &amp; Cutoff Management
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl">
              Hostel mess ki delivery timing khud se set karein. Extra food ordering cutoff aur meal skip rules real-time me update honge.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <button
              type="button"
              onClick={handleResetMealTimings}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw size={14} className="text-slate-500" />
              <span>Reset Defaults</span>
            </button>

            <button
              type="button"
              onClick={handleSaveMealTimings}
              disabled={isSavingTimings}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-black transition flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-60"
            >
              {isSavingTimings ? <RefreshCw size={14} className="animate-spin text-white" /> : <CheckCircle2 size={15} />}
              <span>{isSavingTimings ? 'Saving Timings...' : 'Save Delivery Timings'}</span>
            </button>
          </div>
        </div>

        {/* Success Notice if saved */}
        {timingsNotice && (
          <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl flex items-center gap-3 text-emerald-900 font-bold text-xs animate-fade-in shadow-xs">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <p className="flex-1">{timingsNotice}</p>
            <button type="button" onClick={() => setTimingsNotice(null)} className="text-emerald-700 hover:text-emerald-900 font-black">✕</button>
          </div>
        )}

        {/* Live Shift Snapshot Ribbon */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Breakfast Summary */}
          <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🌅</span>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-black text-slate-900">{mealTimings.breakfast?.label || 'Breakfast'}</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${mealTimings.breakfast?.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                    {mealTimings.breakfast?.enabled ? 'Active' : 'Disabled'}
                  </span>
                </div>
                <p className="text-[11px] font-bold text-rose-700 mt-0.5">
                  🚚 {mealTimings.breakfast?.deliveryTimeStr || '08:00 AM - 09:30 AM'}
                </p>
                <p className="text-[10px] text-slate-500">
                  Extra Food: <strong className="text-emerald-700">Open till Out for Delivery</strong> • Skip: <strong>{mealTimings.breakfast?.skipCutoffTimeStr || '07:00 AM'}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Lunch Summary */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">☀️</span>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-black text-slate-900">{mealTimings.lunch?.label || 'Lunch'}</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${mealTimings.lunch?.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                    {mealTimings.lunch?.enabled ? 'Active' : 'Disabled'}
                  </span>
                </div>
                <p className="text-[11px] font-bold text-amber-700 mt-0.5">
                  🚚 {mealTimings.lunch?.deliveryTimeStr || '12:30 PM - 02:00 PM'}
                </p>
                <p className="text-[10px] text-slate-500">
                  Extra Food: <strong className="text-emerald-700">Open till Out for Delivery</strong> • Skip: <strong>{mealTimings.lunch?.skipCutoffTimeStr || '10:30 AM'}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Dinner Summary */}
          <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🌙</span>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-black text-slate-900">{mealTimings.dinner?.label || 'Dinner'}</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${mealTimings.dinner?.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                    {mealTimings.dinner?.enabled ? 'Active' : 'Disabled'}
                  </span>
                </div>
                <p className="text-[11px] font-bold text-indigo-700 mt-0.5">
                  🚚 {mealTimings.dinner?.deliveryTimeStr || '07:30 PM - 09:00 PM'}
                </p>
                <p className="text-[10px] text-slate-500">
                  Extra Food: <strong className="text-emerald-700">Open till Out for Delivery</strong> • Skip: <strong>{mealTimings.dinner?.skipCutoffTimeStr || '05:30 PM'}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3 DEDICATED MEAL TIMING CARDS ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ══════════════════════════════════════════════════════
              CARD 1: 🌅 MORNING BREAKFAST
          ══════════════════════════════════════════════════════ */}
          <div className="bg-white border-2 border-rose-200/90 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              {/* Card Header & Toggle */}
              <div className="flex items-center justify-between border-b border-rose-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center text-lg">🌅</span>
                  <div>
                    <h3 className="font-black text-sm text-slate-900">Morning Breakfast</h3>
                    <p className="text-[11px] text-slate-400">Morning hostel delivery</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleSlotChange('breakfast', 'enabled', !mealTimings.breakfast?.enabled)}
                  className={`px-3 py-1 rounded-full text-xs font-black cursor-pointer transition ${
                    mealTimings.breakfast?.enabled ? 'bg-rose-500 text-white shadow-xs' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {mealTimings.breakfast?.enabled ? 'ENABLED' : 'PAUSED'}
                </button>
              </div>

              {/* Slot Label Input */}
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-800 block">Service / Slot Name</label>
                <input
                  type="text"
                  value={mealTimings.breakfast?.label || ''}
                  onChange={e => handleSlotChange('breakfast', 'label', e.target.value)}
                  placeholder="Morning Breakfast"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-rose-500"
                />
              </div>

              {/* Delivery Window */}
              <div className="p-3 bg-rose-50/60 border border-rose-200 rounded-2xl space-y-2">
                <label className="text-xs font-black text-slate-800 flex items-center justify-between">
                  <span>🚚 Rider Delivery Window</span>
                  <span className="text-[10px] font-bold text-rose-700">{mealTimings.breakfast?.deliveryTimeStr}</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-0.5">Start Time</span>
                    <input
                      type="time"
                      value={mealTimings.breakfast?.deliveryStart || '08:00'}
                      onChange={e => handleSlotChange('breakfast', 'deliveryStart', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-rose-300 rounded-lg text-xs font-black text-slate-900 outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-0.5">End Time</span>
                    <input
                      type="time"
                      value={mealTimings.breakfast?.deliveryEnd || '09:30'}
                      onChange={e => handleSlotChange('breakfast', 'deliveryEnd', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-rose-300 rounded-lg text-xs font-black text-slate-900 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Extra Food Window Rule */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                    <span>✨ Extra Food Window</span>
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Live till Dispatch
                  </span>
                </div>
                <p className="text-[10px] text-emerald-700 font-medium leading-relaxed">
                  No time cutoff! Extra items can be ordered until rider goes <strong>Out for Delivery</strong> or meal is <strong>Delivered</strong>.
                </p>
              </div>

              {/* Student Skip Meal Cutoff */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                <label className="text-xs font-black text-slate-800 flex items-center justify-between">
                  <span>⏸️ Student Skip Cutoff Deadline</span>
                  <span className="text-[10px] font-bold text-slate-700">{mealTimings.breakfast?.skipCutoffTimeStr}</span>
                </label>
                <input
                  type="time"
                  value={mealTimings.breakfast?.skipCutoffTime || '07:00'}
                  onChange={e => handleSlotChange('breakfast', 'skipCutoffTime', e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-black text-slate-900 outline-none"
                />
                <p className="text-[10px] text-slate-500 leading-tight">
                  Students cannot skip today's breakfast after this time.
                </p>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-800 block">Typical Items / Description</label>
                <input
                  type="text"
                  value={mealTimings.breakfast?.description || ''}
                  onChange={e => handleSlotChange('breakfast', 'description', e.target.value)}
                  placeholder="Hot Parathas, Poha, Fresh Curd &amp; Masala Chai"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-700 outline-none focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════
              CARD 2: ☀️ LUNCH THALI
          ══════════════════════════════════════════════════════ */}
          <div className="bg-white border-2 border-amber-200/90 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              {/* Card Header & Toggle */}
              <div className="flex items-center justify-between border-b border-amber-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-lg">☀️</span>
                  <div>
                    <h3 className="font-black text-sm text-slate-900">Lunch Thali</h3>
                    <p className="text-[11px] text-slate-400">Afternoon hostel delivery</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleSlotChange('lunch', 'enabled', !mealTimings.lunch?.enabled)}
                  className={`px-3 py-1 rounded-full text-xs font-black cursor-pointer transition ${
                    mealTimings.lunch?.enabled ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {mealTimings.lunch?.enabled ? 'ENABLED' : 'PAUSED'}
                </button>
              </div>

              {/* Slot Label Input */}
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-800 block">Service / Slot Name</label>
                <input
                  type="text"
                  value={mealTimings.lunch?.label || ''}
                  onChange={e => handleSlotChange('lunch', 'label', e.target.value)}
                  placeholder="Lunch Thali"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-amber-500"
                />
              </div>

              {/* Delivery Window */}
              <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-2">
                <label className="text-xs font-black text-slate-800 flex items-center justify-between">
                  <span>🚚 Rider Delivery Window</span>
                  <span className="text-[10px] font-bold text-amber-700">{mealTimings.lunch?.deliveryTimeStr}</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-0.5">Start Time</span>
                    <input
                      type="time"
                      value={mealTimings.lunch?.deliveryStart || '12:30'}
                      onChange={e => handleSlotChange('lunch', 'deliveryStart', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-black text-slate-900 outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-0.5">End Time</span>
                    <input
                      type="time"
                      value={mealTimings.lunch?.deliveryEnd || '14:00'}
                      onChange={e => handleSlotChange('lunch', 'deliveryEnd', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-black text-slate-900 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Extra Food Window Rule */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                    <span>✨ Extra Food Window</span>
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Live till Dispatch
                  </span>
                </div>
                <p className="text-[10px] text-emerald-700 font-medium leading-relaxed">
                  No time cutoff! Extra items can be ordered until rider goes <strong>Out for Delivery</strong> or meal is <strong>Delivered</strong>.
                </p>
              </div>

              {/* Student Skip Meal Cutoff */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                <label className="text-xs font-black text-slate-800 flex items-center justify-between">
                  <span>⏸️ Student Skip Cutoff Deadline</span>
                  <span className="text-[10px] font-bold text-slate-700">{mealTimings.lunch?.skipCutoffTimeStr}</span>
                </label>
                <input
                  type="time"
                  value={mealTimings.lunch?.skipCutoffTime || '10:30'}
                  onChange={e => handleSlotChange('lunch', 'skipCutoffTime', e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-black text-slate-900 outline-none"
                />
                <p className="text-[10px] text-slate-500 leading-tight">
                  Students cannot skip today's lunch after this 2-hour notice cutoff.
                </p>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-800 block">Typical Items / Description</label>
                <input
                  type="text"
                  value={mealTimings.lunch?.description || ''}
                  onChange={e => handleSlotChange('lunch', 'description', e.target.value)}
                  placeholder="4 Butter Phulkas, Dal Tadka, Paneer / Seasonal Sabji, Jeera Rice &amp; Salad"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-700 outline-none focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════
              CARD 3: 🌙 DINNER FEAST
          ══════════════════════════════════════════════════════ */}
          <div className="bg-white border-2 border-indigo-200/90 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              {/* Card Header & Toggle */}
              <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-lg">🌙</span>
                  <div>
                    <h3 className="font-black text-sm text-slate-900">Dinner Feast</h3>
                    <p className="text-[11px] text-slate-400">Evening hostel delivery</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleSlotChange('dinner', 'enabled', !mealTimings.dinner?.enabled)}
                  className={`px-3 py-1 rounded-full text-xs font-black cursor-pointer transition ${
                    mealTimings.dinner?.enabled ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {mealTimings.dinner?.enabled ? 'ENABLED' : 'PAUSED'}
                </button>
              </div>

              {/* Slot Label Input */}
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-800 block">Service / Slot Name</label>
                <input
                  type="text"
                  value={mealTimings.dinner?.label || ''}
                  onChange={e => handleSlotChange('dinner', 'label', e.target.value)}
                  placeholder="Dinner Feast"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-indigo-500"
                />
              </div>

              {/* Delivery Window */}
              <div className="p-3 bg-indigo-50/60 border border-indigo-200 rounded-2xl space-y-2">
                <label className="text-xs font-black text-slate-800 flex items-center justify-between">
                  <span>🚚 Rider Delivery Window</span>
                  <span className="text-[10px] font-bold text-indigo-700">{mealTimings.dinner?.deliveryTimeStr}</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-0.5">Start Time</span>
                    <input
                      type="time"
                      value={mealTimings.dinner?.deliveryStart || '19:30'}
                      onChange={e => handleSlotChange('dinner', 'deliveryStart', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-indigo-300 rounded-lg text-xs font-black text-slate-900 outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-0.5">End Time</span>
                    <input
                      type="time"
                      value={mealTimings.dinner?.deliveryEnd || '21:00'}
                      onChange={e => handleSlotChange('dinner', 'deliveryEnd', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-indigo-300 rounded-lg text-xs font-black text-slate-900 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Extra Food Window Rule */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                    <span>✨ Extra Food Window</span>
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Live till Dispatch
                  </span>
                </div>
                <p className="text-[10px] text-emerald-700 font-medium leading-relaxed">
                  No time cutoff! Extra items can be ordered until rider goes <strong>Out for Delivery</strong> or meal is <strong>Delivered</strong>.
                </p>
              </div>

              {/* Student Skip Meal Cutoff */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                <label className="text-xs font-black text-slate-800 flex items-center justify-between">
                  <span>⏸️ Student Skip Cutoff Deadline</span>
                  <span className="text-[10px] font-bold text-slate-700">{mealTimings.dinner?.skipCutoffTimeStr}</span>
                </label>
                <input
                  type="time"
                  value={mealTimings.dinner?.skipCutoffTime || '17:30'}
                  onChange={e => handleSlotChange('dinner', 'skipCutoffTime', e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-black text-slate-900 outline-none"
                />
                <p className="text-[10px] text-slate-500 leading-tight">
                  Students cannot skip today's dinner after 05:30 PM (or your custom deadline).
                </p>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-800 block">Typical Items / Description</label>
                <input
                  type="text"
                  value={mealTimings.dinner?.description || ''}
                  onChange={e => handleSlotChange('dinner', 'description', e.target.value)}
                  placeholder="4 Warm Rotis, Dal Makhani, Mixed Veg Curry, Rice &amp; Sweet / Raita"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-700 outline-none focus:bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── NOTICE & LIVE SYSTEM POLICY CARD ── */}
        <div className="bg-white border-2 border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-amber-500" />
            <h4 className="font-black text-sm text-slate-900">Campus Notice Board &amp; Automatic Policy Sync</h4>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-800 block">Kitchen Notice Banner for Students</label>
            <textarea
              rows={2}
              value={mealTimings.generalNotice || ''}
              onChange={e => setMealTimings(prev => ({ ...prev, generalNotice: e.target.value }))}
              placeholder="Daily hostel mess tiffin delivery. Extra items and skip requests must be placed before kitchen cutoff."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-amber-500"
            />
            <p className="text-[11px] text-slate-500">This banner is displayed on the Student Dashboard, Weekly Menu, and Cart checkout.</p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-600">
            <div className="flex items-start gap-2">
              <span className="text-orange-500 font-black">1.</span>
              <span><strong>Extra Add-ons Lock:</strong> No fixed time cutoff. Orders automatically close only when meal is Out for Delivery or Delivered.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-orange-500 font-black">2.</span>
              <span><strong>Skip Deadline Rule:</strong> Rejects skip meal requests requested after the configured skip cutoff time.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-orange-500 font-black">3.</span>
              <span><strong>Rider Roster Shifts:</strong> Automatically organizes deliveries into Breakfast, Lunch, and Dinner shifts.</span>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleSaveMealTimings}
              disabled={isSavingTimings}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-black transition flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-60"
            >
              {isSavingTimings ? <RefreshCw size={14} className="animate-spin text-white" /> : <CheckCircle2 size={16} />}
              <span>{isSavingTimings ? 'Saving Timings...' : 'Save All Delivery Timings & Cutoff Rules'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ── NAVIGATION GROUPS & TABS (DEDICATED CAMPUS MESS OPERATIONS) ──
  const NAV_GROUPS = [
    {
      title: 'Mess Operations',
      items: [
        { key: 'overview', label: 'Mess Overview', icon: TrendingUp, badge: null, isAlert: false },
        { key: 'dispatch', label: '👑 Mess Delivery (Assign Rider)', icon: Truck, badge: `${dispatchRoster.length} Tiffins`, isAlert: false },
        { key: 'timings', label: '⏰ Mess Timings & Cutoff', icon: Clock, badge: 'Live', isAlert: false },
        {
          key: 'orders',
          label: 'Student Extra Orders',
          icon: ShoppingBag,
          badge: pendingPackWithMealCount > 0 ? `${pendingPackWithMealCount} Meal Req` : (extraOrdersCount > 0 ? `${extraOrdersCount} New` : (liveOrders.length || null)),
          isAlert: pendingPackWithMealCount > 0 || extraOrdersCount > 0
        },
        { key: 'extras', label: 'Extra Add-ons Menu', icon: Plus, badge: extras.length || null, isAlert: false }
      ]
    },
    {
      title: 'Subscriptions & Meals',
      items: [
        { key: 'plans', label: 'Meal Plans', icon: Utensils, badge: plans.length || null, isAlert: false },
        {
          key: 'subscribers',
          label: 'Student Subscriptions',
          icon: Users,
          badge: subscribers.filter(s => s.status === 'paused').length > 0
            ? `${subscribers.filter(s => s.status === 'paused').length} Paused`
            : (subscribers.length || null),
          isAlert: subscribers.filter(s => s.status === 'paused').length > 0
        },
        {
          key: 'skips',
          label: 'Skip Requests',
          icon: RotateCcw,
          badge: pendingSkipsCount > 0 ? `${pendingSkipsCount} Pending` : (skipRequests.length || null),
          isAlert: pendingSkipsCount > 0
        },
        { key: 'menu', label: 'Weekly Timetable', icon: Calendar, badge: '7 Days', isAlert: false }
      ]
    },
    {
      title: 'Campus Logistics',
      items: [
        {
          key: 'delivery',
          label: 'Delivery & Riders',
          icon: Bike,
          badge: riders.filter(r => r.status !== 'offline').length > 0
            ? `${riders.filter(r => r.status !== 'offline').length} Online`
            : undefined,
          isAlert: false
        },
        {
          key: 'rider-earnings',
          label: 'Rider Earnings Report',
          icon: DollarSign,
          isAlert: false
        },
        { key: 'zones', label: 'Delivery Zones & Areas', icon: MapPin, badge: `${deliveryZones.length} Zones`, isAlert: false },
        { key: 'dispatch-history', label: '📜 Tiffin Delivery History', icon: History, badge: historySummary ? `${historySummary.totalDelivered}/${historySummary.totalDispatched}` : 'Full Log', isAlert: false },
        { key: 'delivery-rates', label: '⚡ Delivery Rate Control', icon: DollarSign, badge: `₹${deliveryRates.defaultPerDeliveryRate}/box`, isAlert: false }
      ]
    },
    {
      title: 'Administration',
      items: [
        { key: 'users', label: 'Registered Users', icon: Users, badge: usersList.length || null, isAlert: false },
        { key: 'coupons', label: 'Promo Coupons', icon: Tag, badge: couponsList.length || null, isAlert: false },
        { key: 'complaints', label: 'Food Complaints', icon: MessageSquare, badge: complaints.length || null, isAlert: false },
        { key: 'settings', label: 'Kitchen Settings', icon: Settings, badge: null, isAlert: false }
      ]
    }
  ];

  const NAV_TABS = NAV_GROUPS.flatMap(g => g.items);

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
        <div className="flex items-center gap-2.5">
          <TiffinMateLogo size="sm" showSubtitle={false} />
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-orange-100 text-orange-800 border border-orange-200">
            🍱 Mess Admin
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/instant"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 font-black text-[11px] transition"
            title="Switch to Instant Food Orders Admin"
          >
            <span>⚡ Instant</span>
            <ArrowRight size={11} />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200 transition cursor-pointer"
          >
            {mobileMenuOpen ? <X size={20} /> : <MenuIcon size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden transition-opacity"
        />
      )}

      {/* ── SIDEBAR DRAWER (Desktop Fixed Left + Mobile Slide Drawer) ── */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50 md:z-auto h-full w-72 md:w-64 lg:w-72
          bg-white text-slate-800 flex flex-col shrink-0
          border-r border-slate-200/90 shadow-xl md:shadow-none
          transition-transform duration-200 ease-in-out
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Brand Header with Integrated Live Status */}
        <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-2">
            <TiffinMateLogo size="sm" showSubtitle={false} />
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 border border-orange-200/70">
              Mess Hub
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
              title="Close Navigation"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── DUAL CONSOLE SWITCHER STRIP ── */}
        <div className="p-2.5 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1 mb-1.5 flex items-center justify-between">
            <span>Admin Console</span>
            <span className="text-orange-600 font-bold">🍱 Mess Portal</span>
          </p>
          <div className="grid grid-cols-2 p-1 bg-slate-200/80 rounded-xl gap-1 text-xs font-black">
            <div className="py-1.5 px-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg shadow-xs text-center flex items-center justify-center gap-1 select-none">
              <span>🍱 Mess</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            </div>
            <Link
              to="/admin/instant"
              className="py-1.5 px-2 text-slate-600 hover:text-orange-600 hover:bg-white/90 rounded-lg transition text-center flex items-center justify-center gap-1 group"
              title="Switch to Instant Food Orders & Kitchen Admin"
            >
              <span>⚡ Instant</span>
              <ChevronRight size={12} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Quick Launch Delivery Rider App */}
          <Link
            to="/rider"
            target="_blank"
            className="mt-2 w-full py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-orange-400 hover:text-orange-300 rounded-xl text-[11px] font-black flex items-center justify-between transition shadow-2xs group"
            title="Launch Dedicated Delivery Rider Partner Mobile App"
          >
            <span className="flex items-center gap-1.5">
              <Bike size={13} className="text-orange-400 group-hover:scale-110 transition-transform" />
              <span>Launch Rider App</span>
            </span>
            <ExternalLink size={11} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Navigation Tabs - Categorized Groups */}
        <nav className="flex-1 min-h-0 px-2.5 py-2.5 space-y-2.5 overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300">
          {NAV_GROUPS.map((group, gIdx) => {
            const isCollapsed = Boolean(collapsedGroups[group.title]);

            return (
              <div key={gIdx} className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => toggleGroup(group.title)}
                  className="w-full flex items-center justify-between text-[10px] font-black uppercase text-slate-400 hover:text-slate-700 tracking-wider px-2.5 py-1 select-none cursor-pointer group"
                >
                  <span className="group-hover:text-slate-800 transition-colors">{group.title}</span>
                  <ChevronRight
                    size={12}
                    className={`text-slate-400 group-hover:text-slate-700 transition-transform duration-150 ${
                      !isCollapsed ? 'rotate-90' : ''
                    }`}
                  />
                </button>

                {!isCollapsed && (
                  <div className="space-y-0.5">
                    {group.items.map(({ key, label, icon: Icon, badge, isAlert }: any) => {
                      const isActive =
                        (key === 'dispatch-history' && activeTab === 'dispatch' && dispatchViewMode === 'history') ||
                        (key === 'dispatch' && activeTab === 'dispatch' && dispatchViewMode === 'live') ||
                        (key === 'orders' && activeTab === 'extras' && (extrasActiveTab === 'orders' || extrasActiveTab === 'requests')) ||
                        (key === 'extras' && activeTab === 'extras' && extrasActiveTab === 'catalog') ||
                        (key !== 'orders' && key !== 'extras' && key !== 'dispatch' && key !== 'dispatch-history' && activeTab === key);
                      return (
                        <button
                          key={key}
                          onClick={() => {
                            if (key === 'skips' && pendingSkipsCount > 0) {
                              setSkipFilterStatus('pending');
                            }
                            if (key === 'orders') {
                              setActiveTab('extras');
                              setExtrasActiveTab(pendingPackWithMealCount > 0 ? 'requests' : 'orders');
                            } else if (key === 'extras') {
                              setActiveTab('extras');
                              setExtrasActiveTab('catalog');
                            } else if (key === 'dispatch-history') {
                              setActiveTab('dispatch');
                              setDispatchViewMode('history');
                            } else if (key === 'dispatch') {
                              setActiveTab('dispatch');
                              setDispatchViewMode('live');
                            } else {
                              setActiveTab(key);
                            }
                            setMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer group ${
                            isActive
                              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20 font-black'
                              : isAlert
                              ? 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 shadow-2xs'
                              : 'text-slate-600 hover:text-orange-600 hover:bg-orange-50/70'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon
                              size={15}
                              className={
                                isActive
                                  ? 'text-white shrink-0'
                                  : isAlert
                                  ? 'text-amber-600 shrink-0'
                                  : 'text-slate-400 group-hover:text-orange-500 shrink-0 transition-colors'
                              }
                            />
                            <span className="truncate">{label}</span>
                          </div>
                          {badge !== null && (
                            <span
                              className={`text-[10px] font-black px-1.5 py-0.2 rounded-full shrink-0 ${
                                isActive
                                  ? 'bg-white/20 text-white'
                                  : isAlert
                                  ? 'bg-amber-500 text-white shadow-xs animate-pulse font-black'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}
                            >
                              {badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Compact Footer: Quick Portals + Incharge Card */}
        <div className="p-2.5 border-t border-slate-100 bg-slate-50/70 shrink-0 space-y-2">
          {/* Quick 1-Row Portals Strip */}
          <div className="grid grid-cols-3 gap-1 text-[10px] font-bold text-slate-600">
            <Link
              to="/dashboard"
              target="_blank"
              className="flex items-center justify-center gap-1 py-1.5 px-2 bg-white hover:bg-orange-50 hover:text-orange-600 rounded-lg border border-slate-200/80 shadow-2xs transition text-center"
              title="Open User Dashboard"
            >
              <LayoutDashboard size={12} className="text-orange-500 shrink-0" />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/timetable"
              target="_blank"
              className="flex items-center justify-center gap-1 py-1.5 px-2 bg-white hover:bg-orange-50 hover:text-orange-600 rounded-lg border border-slate-200/80 shadow-2xs transition text-center"
              title="Open Rotating Weekly Timetable"
            >
              <CalendarDays size={12} className="text-amber-500 shrink-0" />
              <span>Menu</span>
            </Link>
            <Link
              to="/"
              target="_blank"
              className="flex items-center justify-center gap-1 py-1.5 px-2 bg-white hover:bg-orange-50 hover:text-orange-600 rounded-lg border border-slate-200/80 shadow-2xs transition text-center"
              title="Open Customer Food Store"
            >
              <ShoppingBag size={12} className="text-emerald-600 shrink-0" />
              <span>Store</span>
            </Link>
          </div>

          {/* Admin Profile Footer */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                M
              </div>
              <div className="overflow-hidden min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">Mess Incharge</p>
                <p className="text-[10px] text-slate-400 truncate">admin@mess.com</p>
              </div>
            </div>
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-orange-100 text-orange-800 border border-orange-200 shrink-0 uppercase">
              Admin
            </span>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA (Independently Scrollable on Right) ── */}
      <main className="flex-1 h-full min-w-0 flex flex-col overflow-y-auto overflow-x-hidden scroll-smooth">


        {/* Dynamic Body Content */}
        <div className="p-4 sm:p-6 md:p-8 space-y-6 flex-1 max-w-7xl w-full mx-auto">

          {/* ══════════════════════════════════════════════════════════
              1. TAB: MESS OVERVIEW
          ══════════════════════════════════════════════════════════ */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Alert: Student Extra Add-on Orders */}
              {extraOrdersCount > 0 && (
                <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border-2 border-amber-400 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-500/20">
                      <ShoppingBag size={22} className="animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black bg-amber-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                          Extra Orders Incoming
                        </span>
                        <span className="text-xs text-amber-900 font-extrabold">
                          {extraOrdersCount} Student Extra Add-on Order{extraOrdersCount > 1 ? 's' : ''} Received
                        </span>
                      </div>
                      <h4 className="font-black text-slate-900 text-base mt-0.5">
                        Students have ordered extra sweets, rotis &amp; sides!
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Ensure kitchen staff packs the requested extra items into today's student tiffins.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => {
                        setActiveTab('extras');
                        setExtrasActiveTab(pendingPackWithMealCount > 0 ? 'requests' : 'orders');
                      }}
                      className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <span>View Extra Orders ({extraOrdersCount})</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Alert: Pending Student Skip Requests */}
              {pendingSkipsCount > 0 && (
                <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border-2 border-amber-400 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-500/20">
                      <RotateCcw size={22} className="animate-spin-slow" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black bg-amber-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                          New Request Arrived
                        </span>
                        <span className="text-xs text-amber-800 font-extrabold">
                          {pendingSkipsCount} meal skip request{pendingSkipsCount > 1 ? 's' : ''} awaiting review
                        </span>
                      </div>
                      <h4 className="font-black text-slate-900 text-base mt-0.5">
                        Students have requested meal skips!
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Approve to update kitchen meal dispatch and add +1 meal back to the student's Remaining Meals balance.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab('skips');
                      setSkipFilterStatus('pending');
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
                  >
                    <span>Review Pending Skips ({pendingSkipsCount})</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}

              {/* Alert: Paused Student Subscriptions */}
              {subscribers.filter(s => s.status === 'paused').length > 0 && (
                <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border-2 border-amber-300 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20 text-xl font-black">
                      ⏸️
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black bg-amber-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {subscribers.filter(s => s.status === 'paused').length} Student{subscribers.filter(s => s.status === 'paused').length > 1 ? 's' : ''} on Leave
                        </span>
                        <span className="text-xs text-amber-900 font-extrabold">
                          Meal deliveries temporarily on hold
                        </span>
                      </div>
                      <h4 className="font-black text-slate-900 text-base mt-0.5">
                        Paused Subscriptions: {subscribers.filter(s => s.status === 'paused').map(s => s.userId?.name || 'Student').slice(0, 3).join(', ')}{subscribers.filter(s => s.status === 'paused').length > 3 ? ` +${subscribers.filter(s => s.status === 'paused').length - 3} more` : ''}
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Student paused plan from dashboard (exams/travel). Tiffin packing is on hold and validity automatically extends upon resume.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab('subscribers');
                      setSubFilter('paused');
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
                  >
                    <span>View Paused Students ({subscribers.filter(s => s.status === 'paused').length})</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}

              {/* 4 Core Mess Stats Cards with Micro-Glow */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {/* Stat 1: Today's Total Tiffins */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-orange-200 transition group">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Today's Tiffins</span>
                    <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Utensils size={18} />
                    </div>
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 leading-none">
                    {stats.todayMeals || dispatchRoster.length}
                  </h3>
                  <p className="text-xs text-emerald-600 font-bold mt-2.5 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                    <span>Packing for Lunch & Dinner</span>
                  </p>
                </div>

                {/* Stat 2: Active Student Subscribers */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-blue-200 transition group">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Mess Subscribers</span>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Users size={18} />
                    </div>
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 leading-none">
                    {subscribers.filter(s => s.status === 'active').length}
                  </h3>
                  <div className="flex items-center justify-between mt-2.5 text-xs">
                    <span className="text-slate-500 font-semibold">Active hostel students</span>
                    {subscribers.filter(s => s.status === 'paused').length > 0 && (
                      <span className="text-amber-700 font-black bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        ⏸️ {subscribers.filter(s => s.status === 'paused').length} Paused
                      </span>
                    )}
                  </div>
                </div>

                {/* Stat 3: Monthly Collections */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-emerald-200 transition group">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Monthly Revenue</span>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <DollarSign size={18} />
                    </div>
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 leading-none">
                    ₹{(stats.monthlyRevenue || (subscribers.reduce((sum, s) => sum + (s.amountPaid || 0), 0) + liveOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0))).toLocaleString('en-IN')}
                  </h3>
                  <p className="text-xs text-emerald-600 font-bold mt-2.5 flex items-center gap-1">
                    <TrendingUp size={13} /> Active student meal plans
                  </p>
                </div>

                {/* Stat 4: Active Delivery Riders */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-purple-200 transition group">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Riders</span>
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Bike size={18} />
                    </div>
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 leading-none">
                    {riders.filter(r => r.status !== 'offline').length} / {riders.length}
                  </h3>
                  <p className="text-xs text-purple-600 font-bold mt-2.5">
                    On duty across 3 campus routes
                  </p>
                </div>
              </div>

              {/* Today's Live Kitchen Board */}
              <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 rounded-3xl p-6 sm:p-7 text-white shadow-xl shadow-orange-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <div>
                    <span className="bg-white/20 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
                      <Sparkles size={12} /> Today's Live Mess Menu
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">Homestyle Kitchen Preparation</h2>
                    <p className="text-orange-100 text-xs sm:text-sm max-w-xl">
                      Freshly prepared 45 minutes prior to hostel dispatch. Zero preservatives, insulated stainless steel packing.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveTab('menu')}
                      className="px-4 py-2.5 bg-white text-orange-600 hover:bg-orange-50 font-bold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Calendar size={14} /> Weekly Timetable
                    </button>
                    <button
                      onClick={() => setActiveTab('delivery')}
                      className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Bike size={14} /> Delivery Hub
                    </button>
                  </div>
                </div>

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Breakfast */}
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 hover:bg-white/15 transition">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-extrabold text-orange-200 flex items-center gap-1.5">
                        <Sun size={14} /> BREAKFAST (8:00 AM)
                      </span>
                      <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-bold">Pure Veg</span>
                    </div>
                    <p className="font-bold text-base text-white">
                      {weeklyMenu[todayDayKey]?.breakfast || weeklyMenu['Mon']?.breakfast || 'Stuffed Aloo Paratha + Curd + Masala Chai'}
                    </p>
                  </div>

                  {/* Lunch */}
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 hover:bg-white/15 transition">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-extrabold text-orange-200 flex items-center gap-1.5">
                        <Utensils size={14} /> LUNCH THALI (12:30 PM)
                      </span>
                      <span className="text-[10px] bg-emerald-400/30 text-emerald-200 px-2 py-0.5 rounded font-bold">
                        Special
                      </span>
                    </div>
                    <p className="font-bold text-base text-white">
                      {weeklyMenu[todayDayKey]?.lunch || weeklyMenu['Mon']?.lunch || 'Dal Makhani + Jeera Basmati Rice + 3 Butter Roti'}
                    </p>
                  </div>

                  {/* Dinner */}
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 hover:bg-white/15 transition">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-extrabold text-orange-200 flex items-center gap-1.5">
                        <Moon size={14} /> DINNER (7:30 PM)
                      </span>
                      <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-bold">Chef's Choice</span>
                    </div>
                    <p className="font-bold text-base text-white">
                      {weeklyMenu[todayDayKey]?.dinner || weeklyMenu['Mon']?.dinner || 'Shahi Paneer + Steamed Rice + 3 Phulka Roti'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Delivery Routes & Quick Actions Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: Live Delivery Routes Status */}
                <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs">
                  <div className="flex justify-between items-center mb-5">
                    <div>
                      <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                        <Bike size={18} className="text-orange-500" /> Active Campus Delivery Routes
                      </h3>
                      <p className="text-xs text-slate-500">Live progress of tiffin drop-offs across student hostels</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('delivery')}
                      className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                    >
                      Manage Delivery Hub <ChevronRight size={14} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {deliveryRoutes.map(route => {
                      const percentage = route.tiffinCount > 0 ? Math.round((route.deliveredCount / route.tiffinCount) * 100) : 0;
                      return (
                        <div
                          key={route.id}
                          className="p-4 rounded-2xl border border-slate-200 hover:border-orange-300 transition-all bg-slate-50/50 hover:bg-white"
                        >
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2.5">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-slate-900 text-sm">{route.name}</span>
                                <span
                                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                    route.status === 'completed'
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                                  }`}
                                >
                                  {route.status}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Rider: <strong className="text-slate-800">{route.assignedRider}</strong> • Hostels: {route.hostels.join(', ')}
                              </p>
                            </div>

                            <div className="text-right">
                              <span className="text-xs font-black text-slate-900">
                                {route.deliveredCount}/{route.tiffinCount} Tiffins ({percentage}%)
                              </span>
                              <p className="text-[10px] text-slate-400">ETA: {route.eta}</p>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Col: Quick Mess Controls */}
                <div className="space-y-5">
                  <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs">
                    <h3 className="font-black text-slate-900 text-base mb-4 flex items-center gap-2">
                      <ChefHat size={18} className="text-orange-500" /> Operations Shortcuts
                    </h3>
                    <div className="space-y-2.5">
                      <button
                        onClick={() => setActiveTab('zones')}
                        className="w-full py-2.5 px-4 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-between cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <MapPin size={16} /> Area Delivery Zones ({deliveryZones.length})
                        </span>
                        <ChevronRight size={14} />
                      </button>
                      <button
                        onClick={() => {
                          setRiderModalOpen(true);
                        }}
                        className="w-full py-2.5 px-4 bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs rounded-xl transition flex items-center justify-between cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <Bike size={16} /> Register New Rider
                        </span>
                        <ChevronRight size={14} />
                      </button>
                      <button
                        onClick={openNewPlanModal}
                        className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-between cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <Plus size={16} /> Create Meal Plan
                        </span>
                        <ChevronRight size={14} />
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('extras');
                          setExtrasActiveTab(pendingPackWithMealCount > 0 ? 'requests' : 'orders');
                        }}
                        className="w-full py-2.5 px-4 bg-amber-50/80 hover:bg-amber-100 text-amber-900 font-bold text-xs rounded-xl border border-amber-200 transition flex items-center justify-between cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <ShoppingBag size={16} className="text-amber-600" />
                          <span>Student Extra Orders ({extraOrdersCount})</span>
                        </span>
                        <ChevronRight size={14} />
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('extras');
                          setExtrasActiveTab('catalog');
                        }}
                        className="w-full py-2.5 px-4 bg-orange-50/80 hover:bg-orange-100 text-orange-950 font-bold text-xs rounded-xl border border-orange-200 transition flex items-center justify-between cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <Utensils size={16} className="text-orange-600" />
                          <span>Extra Add-ons Menu ({extras.length})</span>
                        </span>
                        <ChevronRight size={14} />
                      </button>
                      <button
                        onClick={() => openEditMenuModal(todayDayKey)}
                        className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-between cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <Edit size={16} /> Edit Today's Dishes ({todayDayKey})
                        </span>
                        <ChevronRight size={14} />
                      </button>
                      <button
                        onClick={() => setActiveTab('skips')}
                        className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-between cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <RotateCcw size={16} /> Review Skips ({skipRequests.length})
                        </span>
                        <ChevronRight size={14} />
                      </button>
                      <button
                        onClick={() => setActiveTab('complaints')}
                        className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-between cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <MessageSquare size={16} /> Student Complaints ({complaints.length})
                        </span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Mess Cutoff Info Card - CLEAN LIGHT THEME (NO BLACK) */}
                  <div className="bg-gradient-to-br from-amber-50/70 to-orange-50/70 text-slate-800 rounded-3xl p-5 shadow-xs border border-orange-200/80">
                    <div className="flex items-center justify-between text-orange-700 font-extrabold text-xs mb-3">
                      <span className="flex items-center gap-1.5">
                        <Clock size={15} className="text-orange-600" /> KITCHEN TIMINGS
                      </span>
                      <span className="text-[10px] bg-white border border-orange-200 px-2 py-0.5 rounded-md text-orange-800 font-bold">Daily Cutoff</span>
                    </div>
                    <div className="space-y-2 text-xs text-slate-600">
                      <div className="flex justify-between pb-1.5 border-b border-orange-200/60">
                        <span className="text-slate-500 font-medium">Breakfast Delivery:</span>
                        <span className="text-slate-900 font-bold">8:00 AM – 9:30 AM</span>
                      </div>
                      <div className="flex justify-between pb-1.5 border-b border-orange-200/60">
                        <span className="text-slate-500 font-medium">Lunch Thali Delivery:</span>
                        <span className="text-slate-900 font-bold">12:30 PM – 2:00 PM</span>
                      </div>
                      <div className="flex justify-between pb-1.5 border-b border-orange-200/60">
                        <span className="text-slate-500 font-medium">Dinner Delivery:</span>
                        <span className="text-slate-900 font-bold">7:30 PM – 9:30 PM</span>
                      </div>
                      <div className="flex justify-between text-orange-700 font-bold pt-1">
                        <span>Meal Skip Deadline:</span>
                        <span className="text-orange-600 font-extrabold">8:00 AM (Sharp)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── LIVE STUDENT SKIPS & PAUSES ACTIVITY MONITOR ── */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
                  <div>
                    <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                      <RotateCcw size={18} className="text-orange-500" /> Live Student Skips & Pauses Activity Feed
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Real-time updates when students request meal skips or pause/resume plans from their dashboard
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab('skips')}
                      className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs rounded-xl border border-orange-200 transition cursor-pointer flex items-center gap-1.5"
                    >
                      <RotateCcw size={13} />
                      <span>All Skips ({skipRequests.length})</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('subscribers');
                        setSubFilter('paused');
                      }}
                      className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs rounded-xl border border-amber-200 transition cursor-pointer flex items-center gap-1.5"
                    >
                      <span>⏸️ Paused Members ({subscribers.filter(s => s.status === 'paused').length})</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* Left: Recent Meal Skip Requests */}
                  <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/40">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
                      <span className="font-extrabold text-xs text-slate-700 flex items-center gap-1.5">
                        <Utensils size={14} className="text-orange-500" /> Recent Meal Skip Requests
                      </span>
                      <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                        {skipRequests.filter(s => (s.status || '').toLowerCase() === 'pending').length} Pending Approval
                      </span>
                    </div>

                    {skipRequests.length === 0 ? (
                      <p className="text-xs text-slate-400 py-6 text-center">No meal skip requests submitted yet.</p>
                    ) : (
                      <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                        {skipRequests.slice(0, 5).map(skip => {
                          const isPending = (skip.status || '').toLowerCase() === 'pending';
                          return (
                            <div
                              key={skip.id || skip._id}
                              className={`p-3 rounded-xl border text-xs transition ${
                                isPending
                                  ? 'bg-amber-50/70 border-amber-200 text-amber-950 shadow-2xs'
                                  : 'bg-white border-slate-200 text-slate-800'
                              }`}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <div>
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-extrabold text-slate-900">{skip.student}</span>
                                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-semibold">
                                      {skip.hostel || 'Hostel'}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-600 mt-0.5">
                                    <strong className="text-orange-600 capitalize">{skip.meal || skip.mealType || 'Meal'}</strong> on <strong>{skip.date}</strong>
                                    {skip.reason && <span className="italic text-slate-500"> • "{skip.reason}"</span>}
                                  </p>
                                </div>
                                <div className="text-right shrink-0">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                      isPending
                                        ? 'bg-amber-500 text-white animate-pulse'
                                        : skip.status === 'approved'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-rose-100 text-rose-800'
                                    }`}
                                  >
                                    {skip.status || 'Pending'}
                                  </span>
                                </div>
                              </div>

                              {isPending && (
                                <div className="mt-2.5 pt-2 border-t border-amber-200/80 flex items-center justify-between gap-2">
                                  <span className="text-[10px] text-amber-800 font-bold">
                                    Rollover: +1 Meal to Remaining Meals
                                  </span>
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={() => handleApproveSkip(skip.id || skip._id, skip.student, skip.credit || 72)}
                                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] shadow-2xs transition cursor-pointer flex items-center gap-1"
                                    >
                                      <CheckCircle2 size={11} /> Approve (+1 Meal)
                                    </button>
                                    <button
                                      onClick={() => handleRejectSkip(skip.id || skip._id, skip.student)}
                                      className="px-2 py-1 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 font-bold rounded-lg text-[10px] transition cursor-pointer flex items-center gap-1"
                                    >
                                      <X size={11} /> Decline
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Right: Paused Student Memberships */}
                  <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/40">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
                      <span className="font-extrabold text-xs text-slate-700 flex items-center gap-1.5">
                        <span>⏸️</span> Paused Student Subscriptions (On Hold)
                      </span>
                      <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        {subscribers.filter(s => s.status === 'paused').length} Currently Paused
                      </span>
                    </div>

                    {subscribers.filter(s => s.status === 'paused').length === 0 ? (
                      <div className="text-center py-8">
                        <CheckCircle2 size={24} className="text-emerald-500 mx-auto mb-1.5" />
                        <p className="text-xs text-slate-600 font-bold">All student plans are currently active!</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">When students pause their plan from dashboard, they appear here.</p>
                      </div>
                    ) : (
                      <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                        {subscribers.filter(s => s.status === 'paused').map(sub => (
                          <div
                            key={sub._id || sub.id}
                            className="p-3 rounded-xl border border-amber-200 bg-amber-50/60 text-xs flex items-center justify-between gap-3 shadow-2xs"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-slate-900">{sub.userId?.name || 'Student Member'}</span>
                                <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded font-extrabold uppercase">
                                  PAUSED
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600 mt-0.5">
                                {sub.planId?.name || 'Mess'} Plan • {sub.hostelAddress || 'Hostel'}
                              </p>
                              <p className="text-[10px] text-amber-800 font-medium">
                                📍 Delivery On Hold • {sub.remainingMeals ?? 0} meals preserved
                              </p>
                            </div>
                            <button
                              onClick={() => handleTogglePause(sub._id || sub.id)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-2xs transition cursor-pointer shrink-0"
                            >
                              ▶️ Resume
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              2. TAB: AREA DELIVERY ZONES (NEW SYSTEM)
          ══════════════════════════════════════════════════════════ */}
          {activeTab === 'zones' && (
            <div className="space-y-6">
              {/* Header with Add Zone CTA */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <MapPin size={22} className="text-orange-500" /> Area & Zone Delivery Management
                  </h2>
                  <p className="text-xs text-slate-500">
                    Configure hostel delivery clusters, assign dabbawala routes, set delivery timings & manage capacity
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={openNewZoneModal}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
                  >
                    <Plus size={16} /> Add Delivery Zone
                  </button>
                </div>
              </div>

              {/* 4 Zone KPI Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Zones</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">
                    {deliveryZones.filter(z => z.status === 'active').length} / {deliveryZones.length} Zones
                  </p>
                  <span className="text-[11px] text-emerald-600 font-bold mt-1 inline-block">100% Campus Coverage</span>
                </div>
                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Covered Hostels & PGs</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">
                    {deliveryZones.reduce((sum, z) => sum + z.areas.length, 0)} Localities
                  </p>
                  <span className="text-[11px] text-orange-600 font-bold mt-1 inline-block">Boys & Girls Hostels</span>
                </div>
                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fleet Route Capacity</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">
                    {deliveryZones.reduce((sum, z) => sum + z.dailyTiffinCapacity, 0)} Tiffins/Day
                  </p>
                  <span className="text-[11px] text-blue-600 font-bold mt-1 inline-block">Scalable Dabbawala Mesh</span>
                </div>
                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Dropoff ETA</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">
                    {deliveryRoutes.length > 0 ? `${deliveryRoutes.length * 5 + 10} Mins` : '15-20 Mins'}
                  </p>
                  <span className="text-[11px] text-emerald-600 font-bold mt-1 inline-block">
                    {deliveryRoutes.length} Active Route Slots
                  </span>
                </div>
              </div>

              {/* Delivery Zones Cards Grid */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-black text-slate-900 text-base">Campus & External Delivery Zones</h3>
                  <span className="text-xs font-bold text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-full">
                    {deliveryZones.length} Zones Configured
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {deliveryZones.map(zone => {
                    const loadPercentage = zone.dailyTiffinCapacity > 0 ? Math.round((zone.activeDeliveries / zone.dailyTiffinCapacity) * 100) : 0;
                    return (
                      <div
                        key={zone.id}
                        className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-orange-200 transition group"
                      >
                        <div>
                          {/* Zone Header */}
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                                  {zone.code}
                                </span>
                                <h4 className="font-extrabold text-slate-900 text-base">{zone.name}</h4>
                              </div>
                              <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                                <span>PIN: <strong>{zone.pincode}</strong></span>
                                <span>•</span>
                                <span className={zone.deliveryCharge === 0 ? 'text-emerald-600 font-bold' : 'text-slate-700 font-bold'}>
                                  {zone.deliveryCharge === 0 ? 'Free Campus Delivery' : `₹${zone.deliveryCharge} Delivery Surcharge`}
                                </span>
                              </p>
                            </div>

                            <span
                              className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                                zone.status === 'active'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : zone.status === 'busy'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {zone.status}
                            </span>
                          </div>

                          {/* Covered Areas Tags */}
                          <div className="mb-4">
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                              Covered Hostels & Land Marks:
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {zone.areas.map((area, idx) => (
                                <span
                                  key={idx}
                                  className="text-[11px] font-semibold bg-slate-50 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-100 flex items-center gap-1"
                                >
                                  <MapPin size={11} className="text-orange-500 shrink-0" />
                                  {area}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Assigned Rider & Timings */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 p-3 bg-slate-50/70 rounded-2xl border border-slate-100 text-xs">
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Assigned Dabbawala</p>
                              <p className="font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                                <Bike size={13} className="text-orange-500" />
                                {zone.assignedRider}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">Delivery Slots</p>
                              <p className="font-semibold text-slate-700 mt-0.5">
                                Lunch: {zone.timingSlots.lunch}
                              </p>
                              <p className="font-semibold text-slate-700">
                                Dinner: {zone.timingSlots.dinner}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Capacity Progress Bar & Actions */}
                        <div className="pt-3 border-t border-slate-100">
                          <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                            <span>Today's Zone Load</span>
                            <span>
                              {zone.activeDeliveries} / {zone.dailyTiffinCapacity} Tiffins ({loadPercentage}%)
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 mb-4 overflow-hidden">
                            <div
                              className="bg-orange-500 h-2 rounded-full transition-all"
                              style={{ width: `${Math.min(loadPercentage, 100)}%` }}
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleZoneStatus(zone.id)}
                              className="flex-1 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                            >
                              Toggle Status
                            </button>
                            <button
                              onClick={() => openEditZoneModal(zone)}
                              className="py-1.5 px-3 bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1"
                            >
                              <Edit size={13} /> Edit Zone
                            </button>
                            <button
                              onClick={() => handleDeleteZone(zone.id)}
                              className="py-1.5 px-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                              title="Delete Zone"
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
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              3. TAB: DELIVERY & RIDERS MANAGEMENT (EXTENSIVE)
          ══════════════════════════════════════════════════════════ */}
          {activeTab === 'delivery' && (
            <DeliveryRidersSuite
              riders={riders}
              setRiders={setRiders}
              dispatchRoster={dispatchRoster}
              setDispatchRoster={setDispatchRoster}
              orders={liveOrders}
              setOrders={setLiveOrders}
              deliveryZones={deliveryZones}
              subscribers={subscribers}
              complaints={complaints}
              onNotify={(msg, type) => setToast({ msg, type })}
              initialSubTab={searchParams.get('sub') || 'overview'}
            />
          )}

          {/* ══════════════════════════════════════════════════════════
              TAB: RIDER EARNINGS REPORT (DAILY, MONTHLY, PER RIDER)
          ══════════════════════════════════════════════════════════ */}
          {activeTab === 'rider-earnings' && (
            <RiderEarningsReport
              onNotify={(msg, type) => setToast({ msg, type })}
            />
          )}

          {/* ══════════════════════════════════════════════════════════
              3. TAB: DAILY TIFFIN DISPATCH CHECKLIST
          ══════════════════════════════════════════════════════════ */}
          {activeTab === 'dispatch' && (() => {
            // Normalized list
            const normalizedList = dispatchRoster.map(item => {
              const student = item.student || item.studentName || item.customerName || 'Student Member';
              const slot = item.slot || item.mealSlot || 'Lunch';
              const plan = item.plan || item.planName || 'Standard Daily Meal';
              const rider = item.rider || item.assignedRider || 'Unassigned';
              const hostel = item.hostel || item.hostelAddress || 'Hostel Campus';
              const zoneCode = item.zoneCode || item.zone || 'NC-01';
              const status = (item.status || item.statusStep || item.deliveryStatus || 'preparing').toLowerCase();
              const room = item.room || (hostel.match(/Room\s*([0-9A-Za-z-]+)/i)?.[1]) || '';
              const phone = item.phone || item.customerPhone || '';
              const extras = item.extras || '';
              const hasAttachedExtras = Boolean(
                item.hasAttachedExtras ||
                extras.toLowerCase().includes('extra') ||
                extras.toLowerCase().includes('packed with') ||
                extras.toLowerCase().includes('roti') ||
                extras.toLowerCase().includes('sweet')
              );
              const extrasPacked = Boolean(item.extrasPacked);
              const isSkipped = Boolean(item.isSkipped || extras.toLowerCase().includes('skipped') || status === 'skipped');
              const isPaused = Boolean(item.isPaused || extras.toLowerCase().includes('paused') || status === 'paused');

              return {
                ...item,
                id: item.id || item._id,
                student,
                slot,
                plan,
                rider,
                hostel,
                zoneCode,
                status,
                room,
                phone,
                extras,
                hasAttachedExtras,
                extrasPacked,
                isSkipped,
                isPaused
              };
            });

            // Filtered list
            const filteredList = normalizedList
              .filter(r => {
                if (!dispatchExtrasOnly) return true;
                return r.hasAttachedExtras;
              })
              .filter(r => {
                if (dispatchFilter === 'All') return true;
                const slotStr = r.slot.toLowerCase();
                if (dispatchFilter === 'Breakfast') return slotStr.includes('breakfast');
                if (dispatchFilter === 'Lunch') return slotStr.includes('lunch');
                if (dispatchFilter === 'Dinner') return slotStr.includes('dinner');
                return r.slot === dispatchFilter;
              })
              .filter(r => dispatchZoneFilter === 'All' || r.zoneCode === dispatchZoneFilter)
              .filter(r => {
                if (dispatchRiderFilter === 'All') return true;
                if (dispatchRiderFilter === 'Unassigned') {
                  return !r.rider || r.rider === 'Unassigned' || r.rider === '';
                }
                const filterClean = dispatchRiderFilter.toLowerCase().trim();
                const itemRiderClean = (r.rider || '').split('(')[0].trim().toLowerCase();
                return itemRiderClean === filterClean || itemRiderClean.includes(filterClean) || filterClean.includes(itemRiderClean);
              })
              .filter(r => {
                if (dispatchStatusFilter === 'All') return true;
                if (dispatchStatusFilter === 'preparing') return r.status === 'preparing' || r.status === 'cooking' || r.status === 'pending';
                if (dispatchStatusFilter === 'packed') return r.status === 'packed';
                if (dispatchStatusFilter === 'dispatched') return r.status === 'dispatched' || r.status === 'on-route' || r.status === 'on-the-way';
                if (dispatchStatusFilter === 'delivered') return r.status === 'delivered';
                if (dispatchStatusFilter === 'skipped') return r.isSkipped || r.isPaused || r.status === 'skipped' || r.status === 'paused';
                return r.status === dispatchStatusFilter.toLowerCase();
              })
              .filter(r => {
                const q = (dispatchSearchQuery || search || '').toLowerCase().trim();
                if (!q) return true;
                return (
                  r.student.toLowerCase().includes(q) ||
                  r.hostel.toLowerCase().includes(q) ||
                  r.id.toLowerCase().includes(q) ||
                  r.zoneCode.toLowerCase().includes(q) ||
                  r.rider.toLowerCase().includes(q) ||
                  r.room.toLowerCase().includes(q) ||
                  r.phone.toLowerCase().includes(q) ||
                  r.plan.toLowerCase().includes(q)
                );
              });

            // Live Metrics for active shift slot
            const shiftList = normalizedList.filter(r => {
              if (dispatchFilter === 'All') return true;
              const slotStr = r.slot.toLowerCase();
              if (dispatchFilter === 'Breakfast') return slotStr.includes('breakfast');
              if (dispatchFilter === 'Lunch') return slotStr.includes('lunch');
              if (dispatchFilter === 'Dinner') return slotStr.includes('dinner');
              return true;
            });

            const totalShiftCount = shiftList.length;
            const prepCount = shiftList.filter(r => r.status === 'preparing' || r.status === 'cooking' || r.status === 'pending').length;
            const packedCount = shiftList.filter(r => r.status === 'packed').length;
            const onRouteCount = shiftList.filter(r => r.status === 'dispatched' || r.status === 'on-route' || r.status === 'on-the-way').length;
            const delivCount = shiftList.filter(r => r.status === 'delivered').length;
            const skipCount = shiftList.filter(r => r.isSkipped || r.isPaused || r.status === 'skipped' || r.status === 'paused').length;
            const extrasCount = shiftList.filter(r => r.hasAttachedExtras).length;

            const isAllSelected = filteredList.length > 0 && filteredList.every(r => selectedDispatchIds.includes(r.id));
            const handleToggleSelectAll = () => {
              if (isAllSelected) {
                setSelectedDispatchIds([]);
              } else {
                setSelectedDispatchIds(filteredList.map(r => r.id));
              }
            };

            const breakfastTiffins = normalizedList.filter(t => t.slot.toLowerCase().includes('breakfast'));
            const lunchTiffins = normalizedList.filter(t => t.slot.toLowerCase().includes('lunch'));
            const dinnerTiffins = normalizedList.filter(t => t.slot.toLowerCase().includes('dinner'));
            const topBreakfastRider = breakfastTiffins.find(t => t.rider && t.rider !== 'Unassigned')?.rider;
            const topLunchRider = lunchTiffins.find(t => t.rider && t.rider !== 'Unassigned')?.rider;
            const topDinnerRider = dinnerTiffins.find(t => t.rider && t.rider !== 'Unassigned')?.rider;

            // Compute comprehensive Rider-wise allocation & live status stats
            const riderMap = new Map<string, any>();
            riders.forEach(r => {
              const clean = (r.name || '').split('(')[0].trim();
              if (clean) {
                riderMap.set(clean.toLowerCase(), {
                  id: r.id || clean,
                  name: clean,
                  fullName: r.name,
                  phone: r.phone || '',
                  vehicle: r.vehicle || 'Delivery Bike',
                  route: r.route || 'Campus Route',
                  dutyStatus: r.status || 'available',
                  rating: r.rating || 4.8
                });
              }
            });

            normalizedList.forEach(item => {
              if (item.rider && item.rider !== 'Unassigned') {
                const clean = item.rider.split('(')[0].trim();
                if (clean && !riderMap.has(clean.toLowerCase())) {
                  riderMap.set(clean.toLowerCase(), {
                    id: `r-${clean.toLowerCase().replace(/\s+/g, '-')}`,
                    name: clean,
                    fullName: item.rider,
                    phone: item.phone || '',
                    vehicle: 'Delivery Bike',
                    route: 'Campus Delivery',
                    dutyStatus: 'on-route',
                    rating: 4.8
                  });
                }
              }
            });

            const riderStats = Array.from(riderMap.values()).map(r => {
              const assigned = normalizedList.filter(item => {
                if (!item.rider || item.rider === 'Unassigned') return false;
                const itemRiderClean = item.rider.split('(')[0].trim().toLowerCase();
                const rNameClean = r.name.toLowerCase();
                return itemRiderClean === rNameClean || itemRiderClean.includes(rNameClean) || rNameClean.includes(itemRiderClean);
              });

              const breakfastCount = assigned.filter(item => item.slot.toLowerCase().includes('breakfast')).length;
              const lunchCount = assigned.filter(item => item.slot.toLowerCase().includes('lunch')).length;
              const dinnerCount = assigned.filter(item => item.slot.toLowerCase().includes('dinner')).length;
              const extraCount = assigned.filter(item => item.hasAttachedExtras).length;

              const prepCount = assigned.filter(item => item.status === 'preparing' || item.status === 'cooking' || item.status === 'pending').length;
              const packedCount = assigned.filter(item => item.status === 'packed').length;
              const onRouteCount = assigned.filter(item => item.status === 'dispatched' || item.status === 'on-route' || item.status === 'on-the-way').length;
              const deliveredCount = assigned.filter(item => item.status === 'delivered').length;
              const skippedCount = assigned.filter(item => item.isSkipped || item.isPaused || item.status === 'skipped' || item.status === 'paused').length;

              const hostels = Array.from(new Set(assigned.map(item => item.hostel.split(',')[0].trim()).filter(Boolean)));
              const zones = Array.from(new Set(assigned.map(item => item.zoneCode).filter(Boolean)));
              const total = assigned.length;
              const progressPercent = total > 0 ? Math.round((deliveredCount / total) * 100) : 0;

              return {
                ...r,
                total,
                breakfastCount,
                lunchCount,
                dinnerCount,
                extraCount,
                prepCount,
                packedCount,
                onRouteCount,
                deliveredCount,
                skippedCount,
                hostels,
                zones,
                progressPercent
              };
            });

            const unassignedList = normalizedList.filter(item => !item.rider || item.rider === 'Unassigned');
            const unassignedCount = unassignedList.length;
            const unassignedBreakfast = unassignedList.filter(item => item.slot.toLowerCase().includes('breakfast')).length;
            const unassignedLunch = unassignedList.filter(item => item.slot.toLowerCase().includes('lunch')).length;
            const unassignedDinner = unassignedList.filter(item => item.slot.toLowerCase().includes('dinner')).length;
            const unassignedPrep = unassignedList.filter(item => item.status === 'preparing' || item.status === 'cooking' || item.status === 'pending').length;
            const unassignedPacked = unassignedList.filter(item => item.status === 'packed').length;

            const filteredHistoryList = historyData.filter((item: any) => {
              const q = (historySearchQuery || '').toLowerCase().trim();
              if (!q) return true;
              return (
                (item.student || '').toLowerCase().includes(q) ||
                (item.id || '').toLowerCase().includes(q) ||
                (item.hostel || '').toLowerCase().includes(q) ||
                (item.rider || '').toLowerCase().includes(q) ||
                (item.phone || '').toLowerCase().includes(q) ||
                (item.zoneCode || '').toLowerCase().includes(q) ||
                (item.date || '').toLowerCase().includes(q)
              );
            });

            return (
              <div className="space-y-5">
                {/* ── TOP VIEW SWITCHER: LIVE CHECKLIST vs COMPLETE HISTORY ── */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl p-2.5 shadow-2xs">
                  <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setDispatchViewMode('live')}
                      className={`px-4 py-2 rounded-lg text-xs font-black transition flex items-center gap-2 cursor-pointer ${
                        dispatchViewMode === 'live'
                          ? 'bg-orange-500 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Truck size={14} />
                      <span>📦 Today's Live Dispatch Checklist</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        dispatchViewMode === 'live' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {normalizedList.length}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setDispatchViewMode('history');
                        fetchDispatchHistory();
                      }}
                      className={`px-4 py-2 rounded-lg text-xs font-black transition flex items-center gap-2 cursor-pointer ${
                        dispatchViewMode === 'history'
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <History size={14} />
                      <span>📜 Tiffin Delivery &amp; Dispatch History</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        dispatchViewMode === 'history' ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {historySummary?.totalDispatched ? `${historySummary.totalDispatched} Boxes` : 'Full Log'}
                      </span>
                    </button>
                  </div>

                  <div className="text-xs font-bold text-slate-500 flex items-center gap-2 px-2">
                    {dispatchViewMode === 'live' ? (
                      <span className="flex items-center gap-1.5 text-orange-600 font-bold">
                        <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                        Live Daily Operations
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-indigo-700 font-bold">
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        Full Delivery Logs &amp; Archive
                      </span>
                    )}
                  </div>
                </div>

                {dispatchViewMode === 'history' ? (
                  /* ══════════════════════════════════════════════════════════
                     📜 COMPLETE DISPATCH & DELIVERY HISTORY VIEW
                  ══════════════════════════════════════════════════════════ */
                  <div className="space-y-5">
                    {/* Top Header & Action Buttons */}
                    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
                            📜 Complete Delivery &amp; Dispatch Archive
                          </span>
                          <span className="text-xs font-semibold text-slate-400">•</span>
                          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md">
                            {historySpecificDate
                              ? `📅 Single Day: ${historySpecificDate}`
                              : historyMonthFilter !== 'all'
                              ? `🗓️ Month: ${historyMonthFilter}`
                              : historyTimeframe === 'today'
                              ? '☀️ Today'
                              : historyTimeframe === 'yesterday'
                              ? '🌙 Yesterday'
                              : historyTimeframe === 'this_week'
                              ? '🗓️ This Week'
                              : historyTimeframe === 'last_week'
                              ? '📅 Last Week'
                              : historyTimeframe === 'week'
                              ? '🗓️ Last 7 Days'
                              : historyTimeframe === 'month'
                              ? '📆 This Month'
                              : historyTimeframe === 'last_month'
                              ? '🍂 Last Month'
                              : historyTimeframe === 'custom'
                              ? `⚙️ Custom: ${historyStartDate || 'Start'} to ${historyEndDate || 'End'}`
                              : '📦 All Time Records'}
                          </span>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                          <History className="text-orange-500" size={24} />
                          Tiffin Delivery &amp; Dispatch History
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          View complete records: How many tiffin boxes were dispatched, assigned to riders, and successfully delivered (All Time, Day, Month, Week, and Date-wise).
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                        {/* View Switcher: Box Table vs Day-by-Day Summary */}
                        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                          <button
                            type="button"
                            onClick={() => setHistoryViewStyle('table')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                              historyViewStyle === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <ClipboardList size={13} />
                            <span>📋 Box Table</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setHistoryViewStyle('daily')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                              historyViewStyle === 'daily' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <CalendarDays size={13} />
                            <span>📊 Day Breakdown ({historyDailyBreakdown.length})</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={fetchDispatchHistory}
                          disabled={historyLoading}
                          className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-60"
                          title="Refresh History Records"
                        >
                          <RefreshCw size={14} className={historyLoading ? 'animate-spin text-orange-400' : 'text-slate-300'} />
                          <span>{historyLoading ? 'Loading...' : 'Refresh'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => window.print()}
                          className="px-3.5 py-2.5 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-2xs cursor-pointer"
                        >
                          <Printer size={14} className="text-slate-500" />
                          <span>Print Log</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleExportHistoryCSV}
                          className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black rounded-xl text-xs transition flex items-center gap-2 shadow-md cursor-pointer"
                        >
                          <Download size={15} />
                          <span>Export CSV</span>
                        </button>
                      </div>
                    </div>

                    {/* Date Timeframe & Filter Bar */}
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 shadow-xs space-y-3">
                      {/* Row 1: Preset Timeframe Tabs */}
                      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
                        {[
                          { key: 'all', label: '📦 All Time Records' },
                          { key: 'today', label: '☀️ Today' },
                          { key: 'yesterday', label: '🌙 Yesterday' },
                          { key: 'this_week', label: '🗓️ This Week' },
                          { key: 'last_week', label: '📅 Last Week' },
                          { key: 'month', label: '📆 This Month' },
                          { key: 'last_month', label: '🍂 Last Month' },
                          { key: 'custom', label: '⚙️ Custom Range' }
                        ].map(tf => {
                          const isActive = historyTimeframe === tf.key && !historySpecificDate && historyMonthFilter === 'all';
                          return (
                            <button
                              key={tf.key}
                              type="button"
                              onClick={() => {
                                setHistorySpecificDate('');
                                setHistoryMonthFilter('all');
                                setHistoryTimeframe(tf.key as any);
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer ${
                                isActive
                                  ? 'bg-orange-500 text-white shadow-xs'
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                              }`}
                            >
                              {tf.label}
                            </button>
                          );
                        })}
                      </div>

                      {/* Row 2: Specific Month, Single Day Date Picker & Custom Range */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
                        <div className="flex flex-wrap items-center gap-2.5">
                          {/* Specific Month Filter Dropdown */}
                          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
                            <span className="text-[11px] font-bold text-slate-500">🗓️ Month:</span>
                            <select
                              value={historyMonthFilter}
                              onChange={e => {
                                const val = e.target.value;
                                setHistoryMonthFilter(val);
                                setHistorySpecificDate('');
                                if (val !== 'all') {
                                  setHistoryTimeframe('all');
                                }
                              }}
                              className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
                            >
                              {historyAvailableMonths.length > 0 ? (
                                historyAvailableMonths.map((m: any) => (
                                  <option key={m.id} value={m.id}>
                                    {m.label}
                                  </option>
                                ))
                              ) : (
                                <>
                                  <option value="all">All Months</option>
                                  <option value="2026-11">November 2026</option>
                                  <option value="2026-10">October 2026</option>
                                  <option value="2026-09">September 2026</option>
                                </>
                              )}
                            </select>
                          </div>

                          {/* Single Day Specific Date Picker */}
                          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
                            <span className="text-[11px] font-bold text-slate-500">📅 Specific Day:</span>
                            <input
                              type="date"
                              value={historySpecificDate}
                              onChange={e => {
                                setHistorySpecificDate(e.target.value);
                                setHistoryMonthFilter('all');
                              }}
                              className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
                            />
                            {historySpecificDate && (
                              <button
                                type="button"
                                onClick={() => setHistorySpecificDate('')}
                                className="w-4 h-4 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center text-[10px] font-bold cursor-pointer"
                                title="Clear Specific Day"
                              >
                                ✕
                              </button>
                            )}
                          </div>

                          {/* Custom Date Range (when custom is active) */}
                          {historyTimeframe === 'custom' && (
                            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1.5">
                              <input
                                type="date"
                                value={historyStartDate}
                                onChange={e => setHistoryStartDate(e.target.value)}
                                className="px-2 py-1 text-xs border border-slate-200 rounded-lg font-bold text-slate-700 outline-none"
                              />
                              <span className="text-xs text-slate-400 font-bold">to</span>
                              <input
                                type="date"
                                value={historyEndDate}
                                onChange={e => setHistoryEndDate(e.target.value)}
                                className="px-2 py-1 text-xs border border-slate-200 rounded-lg font-bold text-slate-700 outline-none"
                              />
                              <button
                                type="button"
                                onClick={fetchDispatchHistory}
                                className="px-3 py-1 bg-orange-500 text-white text-xs font-black rounded-lg cursor-pointer hover:bg-orange-600"
                              >
                                Apply
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Reset All Filters Button */}
                        {(historySpecificDate || historyMonthFilter !== 'all' || historyTimeframe !== 'all' || historyRiderFilter !== 'All' || historySlotFilter !== 'All' || historyStatusFilter !== 'All' || historySearchQuery) && (
                          <button
                            type="button"
                            onClick={() => {
                              setHistorySpecificDate('');
                              setHistoryMonthFilter('all');
                              setHistoryTimeframe('all');
                              setHistoryRiderFilter('All');
                              setHistorySlotFilter('All');
                              setHistoryStatusFilter('All');
                              setHistorySearchQuery('');
                              setHistoryStartDate('');
                              setHistoryEndDate('');
                            }}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                          >
                            <RotateCcw size={12} />
                            <span>Reset All Filters</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* 6 Key Performance Metric Badges */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-1">
                          <Package size={13} className="text-slate-600" />
                          <span>Total Dispatched</span>
                        </div>
                        <div className="text-xl font-black text-slate-900">
                          {historySummary?.totalDispatched ?? historyData.length}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium mt-0.5">Total tiffin boxes created</div>
                      </div>

                      <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3.5 shadow-xs">
                        <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1 mb-1">
                          <CheckCheck size={13} className="text-emerald-600" />
                          <span>Delivered</span>
                        </div>
                        <div className="text-xl font-black text-emerald-950">
                          {historySummary?.totalDelivered ?? historyData.filter((d: any) => d.status === 'delivered').length}
                        </div>
                        <div className="text-[10px] text-emerald-700 font-bold mt-0.5">
                          {historySummary?.deliverySuccessRate ?? 92}% Success Rate
                        </div>
                      </div>

                      <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-3.5 shadow-xs">
                        <div className="text-[10px] font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1 mb-1">
                          <Bike size={13} className="text-blue-600" />
                          <span>Rider Assigned</span>
                        </div>
                        <div className="text-xl font-black text-blue-950">
                          {historySummary?.totalAssigned ?? historyData.filter((d: any) => d.rider && d.rider !== 'Unassigned').length}
                        </div>
                        <div className="text-[10px] text-blue-700 font-bold mt-0.5">
                          {historySummary?.totalUnassigned ? `${historySummary.totalUnassigned} Unassigned` : '100% Assigned'}
                        </div>
                      </div>

                      <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3.5 shadow-xs">
                        <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1 mb-1">
                          <Sun size={13} className="text-amber-600" />
                          <span>☀️ Lunch Boxes</span>
                        </div>
                        <div className="text-xl font-black text-amber-950">
                          {historySummary?.lunchCount ?? historyData.filter((d: any) => (d.slot || '').toLowerCase().includes('lunch')).length}
                        </div>
                        <div className="text-[10px] text-amber-700 font-medium mt-0.5">Lunch meal deliveries</div>
                      </div>

                      <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-3.5 shadow-xs">
                        <div className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider flex items-center gap-1 mb-1">
                          <Moon size={13} className="text-indigo-600" />
                          <span>🌙 Dinner Boxes</span>
                        </div>
                        <div className="text-xl font-black text-indigo-950">
                          {historySummary?.dinnerCount ?? historyData.filter((d: any) => (d.slot || '').toLowerCase().includes('dinner')).length}
                        </div>
                        <div className="text-[10px] text-indigo-700 font-medium mt-0.5">Dinner meal deliveries</div>
                      </div>

                      <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-3.5 shadow-xs">
                        <div className="text-[10px] font-bold text-purple-800 uppercase tracking-wider flex items-center gap-1 mb-1">
                          <Sparkles size={13} className="text-purple-600" />
                          <span>Extras Delivered</span>
                        </div>
                        <div className="text-xl font-black text-purple-950">
                          {historySummary?.extrasCount ?? historyData.filter((d: any) => d.hasAttachedExtras).length}
                        </div>
                        <div className="text-[10px] text-purple-700 font-medium mt-0.5">With extra sides &amp; rotis</div>
                      </div>
                    </div>

                    {/* Rider Breakdown Leaderboard */}
                    {historyRiderBreakdown.length > 0 && (
                      <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                          <div className="flex items-center gap-2">
                            <Bike size={18} className="text-orange-500" />
                            <h3 className="text-sm font-black text-slate-900">
                              🛵 Rider-Wise Delivery &amp; Assignment Summary (Assigned &amp; Delivered Stats)
                            </h3>
                          </div>
                          {historyRiderFilter !== 'All' && (
                            <button
                              type="button"
                              onClick={() => setHistoryRiderFilter('All')}
                              className="text-xs font-bold text-orange-600 hover:underline cursor-pointer"
                            >
                              Show All Riders
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          {historyRiderBreakdown.map((r: any) => {
                            const isSelected = historyRiderFilter.toLowerCase() === r.name.toLowerCase();
                            return (
                              <div
                                key={r.name}
                                onClick={() => setHistoryRiderFilter(isSelected ? 'All' : r.name)}
                                className={`p-3.5 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between gap-2 shadow-2xs hover:shadow-xs ${
                                  isSelected
                                    ? 'bg-orange-50/80 border-orange-500 ring-2 ring-orange-300'
                                    : 'bg-slate-50 border-slate-200 hover:border-orange-300'
                                }`}
                              >
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="font-black text-xs text-slate-900">{r.name}</h4>
                                    <div className="text-[10px] text-slate-500 truncate">{r.vehicle || 'Delivery Bike'}</div>
                                  </div>
                                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                    {r.completionRate}% Done
                                  </span>
                                </div>

                                <div className="grid grid-cols-3 gap-1 text-center py-1 bg-white rounded-xl border border-slate-200/80">
                                  <div>
                                    <div className="text-[9px] text-slate-500 font-bold">Assigned</div>
                                    <div className="text-xs font-black text-slate-900">{r.totalAssigned}</div>
                                  </div>
                                  <div>
                                    <div className="text-[9px] text-emerald-700 font-bold">Delivered</div>
                                    <div className="text-xs font-black text-emerald-950">{r.totalDelivered}</div>
                                  </div>
                                  <div>
                                    <div className="text-[9px] text-blue-700 font-bold">Pending</div>
                                    <div className="text-xs font-black text-blue-950">{r.pending}</div>
                                  </div>
                                </div>

                                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    style={{ width: `${r.completionRate}%` }}
                                    className="bg-emerald-500 h-full transition-all"
                                  />
                                </div>

                                <div className="flex items-center gap-1.5 pt-1">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setInspectRiderBoxes({ name: r.name });
                                    }}
                                    className="flex-1 py-1.5 px-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-[10px] transition flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                                    title={`View complete list of boxes assigned to ${r.name}`}
                                  >
                                    <ClipboardList size={11} />
                                    <span>📋 Box Details ({r.totalAssigned})</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setHistoryRiderFilter(isSelected ? 'All' : r.name)}
                                    className={`py-1.5 px-2 rounded-xl text-[10px] font-bold transition cursor-pointer ${
                                      isSelected ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                                    }`}
                                  >
                                    {isSelected ? 'Clear' : 'Filter'}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* ══════════════════════════════════════════════════════════
                       VIEW MODE 1: DAY-BY-DAY SUMMARY BREAKDOWN
                    ══════════════════════════════════════════════════════════ */}
                    {historyViewStyle === 'daily' ? (
                      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <CalendarDays className="text-orange-500" size={18} />
                              <h3 className="text-base font-black text-slate-900">
                                📊 Day-by-Day Tiffin Delivery Breakdown (Daily Performance Logs)
                              </h3>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Track daily dispatch volume, Lunch &amp; Dinner split, delivery completion rate, and active riders.
                            </p>
                          </div>
                          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                            {historyDailyBreakdown.length} Days Recorded
                          </span>
                        </div>

                        {historyDailyBreakdown.length === 0 ? (
                          <div className="py-12 text-center text-slate-500">
                            <CalendarDays size={24} className="text-slate-400 mx-auto mb-2" />
                            <p className="font-bold text-xs">No daily records found matching your filters.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                            {historyDailyBreakdown.map((dm: any) => (
                              <div
                                key={dm.date}
                                className={`p-4 rounded-2xl border-2 transition flex flex-col justify-between gap-3 shadow-2xs hover:shadow-xs ${
                                  dm.isToday
                                    ? 'bg-orange-50/60 border-orange-400 ring-2 ring-orange-200'
                                    : dm.isYesterday
                                    ? 'bg-blue-50/40 border-blue-300'
                                    : 'bg-white border-slate-200 hover:border-slate-300'
                                }`}
                              >
                                <div>
                                  <div className="flex items-start justify-between gap-2 mb-2">
                                    <div>
                                      <div className="flex items-center gap-1.5">
                                        <h4 className="font-black text-sm text-slate-900">{dm.dayLabel}</h4>
                                        {dm.isToday && (
                                          <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-orange-500 text-white">
                                            TODAY
                                          </span>
                                        )}
                                        {dm.isYesterday && (
                                          <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-blue-600 text-white">
                                            YESTERDAY
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-[11px] font-mono text-slate-400">{dm.date}</span>
                                    </div>
                                    <span className="text-xs font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">
                                      {dm.successRate}% Success
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-4 gap-1.5 text-center py-2 bg-slate-50 rounded-xl border border-slate-100 mb-2.5">
                                    <div>
                                      <div className="text-[9px] text-slate-500 font-bold uppercase">Total</div>
                                      <div className="text-sm font-black text-slate-900">{dm.total}</div>
                                    </div>
                                    <div>
                                      <div className="text-[9px] text-emerald-700 font-bold uppercase">Delivered</div>
                                      <div className="text-sm font-black text-emerald-950">{dm.delivered}</div>
                                    </div>
                                    <div>
                                      <div className="text-[9px] text-rose-700 font-bold uppercase">Skipped</div>
                                      <div className="text-sm font-black text-rose-950">{dm.skipped}</div>
                                    </div>
                                    <div>
                                      <div className="text-[9px] text-blue-700 font-bold uppercase">Pending</div>
                                      <div className="text-sm font-black text-blue-950">{dm.pending}</div>
                                    </div>
                                  </div>

                                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden mb-2">
                                    <div
                                      style={{ width: `${dm.successRate}%` }}
                                      className="bg-emerald-500 h-full transition-all"
                                    />
                                  </div>

                                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-slate-600">
                                    <span className="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 rounded-md">
                                      ☀️ Lunch: {dm.lunch}
                                    </span>
                                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-900 border border-indigo-200 rounded-md">
                                      🌙 Dinner: {dm.dinner}
                                    </span>
                                    {dm.extras > 0 && (
                                      <span className="px-2 py-0.5 bg-purple-50 text-purple-900 border border-purple-200 rounded-md">
                                        ✨ Extras: {dm.extras}
                                      </span>
                                    )}
                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                                      🛵 {dm.activeRidersCount} Riders
                                    </span>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setHistorySpecificDate(dm.date);
                                    setHistoryViewStyle('table');
                                  }}
                                  className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                                >
                                  <Eye size={13} />
                                  <span>🔍 View All {dm.total} Boxes for This Day</span>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      /* ══════════════════════════════════════════════════════════
                         VIEW MODE 2: DETAILED BOX-BY-BOX TABLE
                      ══════════════════════════════════════════════════════════ */
                      <div className="space-y-3">
                        {/* Specific Date Alert Banner */}
                        {historySpecificDate && (
                          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-3 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <CalendarDays className="text-orange-600" size={16} />
                              <span className="text-xs font-bold text-orange-950">
                                📅 Showing tiffin boxes for single day: <strong>{historySpecificDate}</strong> ({filteredHistoryList.length} boxes)
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setHistorySpecificDate('')}
                              className="text-xs font-black text-orange-700 hover:underline cursor-pointer px-2 py-0.5 bg-orange-100 rounded-md"
                            >
                              Show All Days ✕
                            </button>
                          </div>
                        )}

                        {/* Search & Filters */}
                        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-xs space-y-3">
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                            <div className="relative flex-1">
                              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                              <input
                                type="text"
                                placeholder="Search student, room number, box ID (#TIF), rider, phone, plan..."
                                value={historySearchQuery}
                                onChange={e => setHistorySearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-orange-500 focus:bg-white transition font-medium"
                              />
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              <select
                                value={historyRiderFilter}
                                onChange={e => setHistoryRiderFilter(e.target.value)}
                                className="px-3 py-2 bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-orange-500 cursor-pointer"
                              >
                                <option value="All">All Riders</option>
                                <option value="Unassigned">⚠️ Unassigned Only</option>
                                {riders.map(r => (
                                  <option key={r.id} value={r.name.split('(')[0].trim()}>
                                    🛵 {r.name.split('(')[0].trim()}
                                  </option>
                                ))}
                              </select>

                              <select
                                value={historySlotFilter}
                                onChange={e => setHistorySlotFilter(e.target.value)}
                                className="px-3 py-2 bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-orange-500 cursor-pointer"
                              >
                                <option value="All">All Shifts</option>
                                <option value="Lunch">☀️ Lunch Shift</option>
                                <option value="Dinner">🌙 Dinner Shift</option>
                              </select>

                              <select
                                value={historyStatusFilter}
                                onChange={e => setHistoryStatusFilter(e.target.value)}
                                className="px-3 py-2 bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-orange-500 cursor-pointer"
                              >
                                <option value="All">All Statuses</option>
                                <option value="delivered">✅ Delivered</option>
                                <option value="dispatched">🚴 Dispatched (On Way)</option>
                                <option value="packed">📦 Packed</option>
                                <option value="preparing">🍳 Preparing</option>
                                <option value="skipped">⏸️ Skipped / Paused</option>
                              </select>

                              {(historySearchQuery || historyRiderFilter !== 'All' || historySlotFilter !== 'All' || historyStatusFilter !== 'All' || historyTimeframe !== 'all' || historySpecificDate || historyMonthFilter !== 'all') && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setHistorySearchQuery('');
                                    setHistoryRiderFilter('All');
                                    setHistorySlotFilter('All');
                                    setHistoryStatusFilter('All');
                                    setHistoryTimeframe('all');
                                    setHistorySpecificDate('');
                                    setHistoryMonthFilter('all');
                                  }}
                                  className="text-xs font-bold text-orange-600 hover:text-orange-700 px-3 py-2 bg-orange-50 rounded-xl cursor-pointer transition"
                                >
                                  Clear Filters
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Historical Records Table */}
                        <div className="bg-white border border-slate-200/90 rounded-3xl shadow-xs overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                                <tr>
                                  <th className="py-3 px-4">Box ID</th>
                                  <th className="py-3 px-4">Date &amp; Scheduled Slot</th>
                                  <th className="py-3 px-4">Student &amp; Hostel Address</th>
                                  <th className="py-3 px-4">Meal Plan &amp; Extras</th>
                                  <th className="py-3 px-4">Zone</th>
                                  <th className="py-3 px-4 font-black text-orange-950">👑 Assigned Rider</th>
                                  <th className="py-3 px-4">Delivery Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {historyLoading ? (
                                  <tr>
                                    <td colSpan={7} className="py-12 text-center text-slate-500">
                                      <RefreshCw size={24} className="animate-spin text-orange-500 mx-auto mb-2" />
                                      <p className="font-bold text-xs">Loading delivery history records...</p>
                                    </td>
                                  </tr>
                                ) : filteredHistoryList.length === 0 ? (
                                  <tr>
                                    <td colSpan={7} className="py-12 text-center">
                                      <div className="max-w-md mx-auto space-y-2">
                                        <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
                                          <History size={24} />
                                        </div>
                                        <h4 className="text-base font-black text-slate-900">No History Records Found</h4>
                                        <p className="text-xs text-slate-500">
                                          No tiffin delivery logs match your selected date, rider, or status filters.
                                        </p>
                                      </div>
                                    </td>
                                  </tr>
                                ) : (
                                  filteredHistoryList.map((item: any, idx: number) => {
                                    const isDelivered = (item.status || '').toLowerCase() === 'delivered';
                                    const isSkipped = item.isSkipped || item.isPaused || (item.status || '').toLowerCase() === 'skipped';
                                    return (
                                      <tr key={item.id || idx} className="hover:bg-slate-50/70 transition">
                                        {/* Box ID */}
                                        <td className="py-3 px-4">
                                          <span className="font-black text-slate-900 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md font-mono text-[11px]">
                                            {item.id}
                                          </span>
                                        </td>

                                        {/* Date & Slot */}
                                        <td className="py-3 px-4">
                                          <div className="font-bold text-slate-900 flex items-center gap-1">
                                            <CalendarDays size={12} className="text-slate-400" />
                                            <span>{item.date || (item.createdAt ? item.createdAt.slice(0, 10) : 'Today')}</span>
                                          </div>
                                          <span className={`inline-flex items-center gap-1 text-[10px] font-black px-1.5 py-0.2 rounded mt-0.5 ${
                                            (item.slot || '').toLowerCase().includes('lunch')
                                              ? 'bg-amber-100 text-amber-900'
                                              : 'bg-indigo-100 text-indigo-900'
                                          }`}>
                                            {(item.slot || '').toLowerCase().includes('lunch') ? '☀️ Lunch' : '🌙 Dinner'}
                                          </span>
                                        </td>

                                        {/* Student & Hostel */}
                                        <td className="py-3 px-4">
                                          <div className="font-black text-slate-900">{item.student}</div>
                                          <div className="text-[11px] text-slate-500 flex items-center gap-1">
                                            <MapPin size={10} className="text-slate-400 shrink-0" />
                                            <span className="truncate max-w-[200px]" title={item.hostel}>{item.hostel}</span>
                                          </div>
                                          {item.phone && (
                                            <div className="text-[10px] text-slate-400">{item.phone}</div>
                                          )}
                                        </td>

                                        {/* Plan & Extras */}
                                        <td className="py-3 px-4">
                                          <div className="font-medium text-slate-800">{item.plan || 'Standard Daily Meal'}</div>
                                          {item.hasAttachedExtras && (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.2 rounded mt-0.5">
                                              <Sparkles size={9} />
                                              <span>{item.extras || 'Extra Attached'}</span>
                                            </span>
                                          )}
                                        </td>

                                        {/* Zone */}
                                        <td className="py-3 px-4">
                                          <span className="px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-bold text-[10px]">
                                            {item.zoneCode || 'NC-01'}
                                          </span>
                                        </td>

                                        {/* Rider */}
                                        <td className="py-3 px-4">
                                          {item.rider && item.rider !== 'Unassigned' ? (
                                            <div className="flex items-center gap-1.5">
                                              <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-[10px]">
                                                🛵
                                              </div>
                                              <div>
                                                <div className="font-bold text-slate-900 text-xs">
                                                  {item.rider.split('(')[0].trim()}
                                                </div>
                                                {item.riderVehicle && (
                                                  <div className="text-[10px] text-slate-400">{item.riderVehicle}</div>
                                                )}
                                              </div>
                                            </div>
                                          ) : (
                                            <span className="text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md font-bold text-[11px]">
                                              ⚠️ Unassigned
                                            </span>
                                          )}
                                        </td>

                                        {/* Status */}
                                        <td className="py-3 px-4">
                                          {isDelivered ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-200">
                                              <CheckCheck size={12} className="text-emerald-600" />
                                              <span>Delivered {item.deliveredAt ? `(${item.deliveredAt})` : ''}</span>
                                            </span>
                                          ) : isSkipped ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-100 text-rose-900 border border-rose-200">
                                              <RotateCcw size={11} className="text-rose-600" />
                                              <span>Skipped / Paused</span>
                                            </span>
                                          ) : item.status === 'dispatched' || item.status === 'on-route' ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-100 text-blue-900 border border-blue-200">
                                              <Bike size={12} className="text-blue-600 animate-pulse" />
                                              <span>Out for Delivery</span>
                                            </span>
                                          ) : item.status === 'packed' ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-purple-100 text-purple-900 border border-purple-200">
                                              <Package size={12} className="text-purple-600" />
                                              <span>Packed in Kitchen</span>
                                            </span>
                                          ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-200">
                                              <ChefHat size={12} className="text-amber-600" />
                                              <span>Preparing</span>
                                            </span>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })
                                )}
                              </tbody>
                            </table>
                          </div>

                          {/* Footer summary */}
                          <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 font-medium">
                            <span>
                              Showing <strong>{filteredHistoryList.length}</strong> historical tiffin dispatch records
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={handleExportHistoryCSV}
                                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-white border border-slate-200 px-3 py-1 rounded-lg shadow-2xs hover:bg-slate-50 cursor-pointer flex items-center gap-1"
                              >
                                <Download size={12} />
                                <span>Download CSV</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* ══════════════════════════════════════════════════════════
                     📦 TODAY'S LIVE DISPATCH CHECKLIST VIEW (EXISTING)
                  ══════════════════════════════════════════════════════════ */
                  <>
                {/* ── TOP HEADER & ACTIONS ── */}
                <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-pulse" />
                        👑 Mess Delivery &amp; Rider Assignment
                      </span>
                      <span className="text-xs font-semibold text-slate-400">•</span>
                      <span className="text-xs font-bold text-slate-600">
                        {dispatchFilter === 'Breakfast' ? '🌅 Breakfast Shift' : dispatchFilter === 'Lunch' ? '☀️ Lunch Shift' : dispatchFilter === 'Dinner' ? '🌙 Dinner Shift' : '📦 All Daily Shifts'}
                      </span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <Truck className="text-orange-500" size={24} />
                      Mess Delivery (Assign Rider)
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Rider assign karein aur student hostel tiffins ki live delivery 1-click me manage karein.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                    <button
                      type="button"
                      onClick={handleSyncDispatchRoster}
                      disabled={dispatchSyncing}
                      className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-60"
                      title="Sync active student subscriptions"
                    >
                      <RefreshCw size={14} className={dispatchSyncing ? 'animate-spin text-orange-400' : 'text-slate-300'} />
                      <span>{dispatchSyncing ? 'Syncing...' : 'Auto-Sync'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('timings')}
                      className="px-3.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                      title="Configure Breakfast, Lunch, and Dinner Timings & Cutoffs"
                    >
                      <Clock size={14} className="text-amber-100" />
                      <span>Set Timings</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsPrintManifestModalOpen(true)}
                      className="px-3.5 py-2.5 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-2xs cursor-pointer"
                    >
                      <Printer size={14} className="text-slate-500" />
                      <span>Print Manifest</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsAddDispatchModalOpen(true)}
                      className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black rounded-xl text-xs transition flex items-center gap-2 shadow-md cursor-pointer"
                    >
                      <Plus size={15} />
                      <span>Add Tiffin</span>
                    </button>
                  </div>
                </div>

                {/* ── UNIFIED SHIFT TABS & LIVE COUNTERS BAR ── */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                  {/* Shift Selection Pills */}
                  <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setDispatchFilter('Breakfast')}
                      className={`px-3.5 py-2 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-2 ${
                        dispatchFilter === 'Breakfast'
                          ? 'bg-rose-500 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span>🌅 Breakfast Shift</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        dispatchFilter === 'Breakfast' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {breakfastTiffins.length}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDispatchFilter('Lunch')}
                      className={`px-3.5 py-2 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-2 ${
                        dispatchFilter === 'Lunch'
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span>☀️ Lunch Shift</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        dispatchFilter === 'Lunch' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {lunchTiffins.length}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDispatchFilter('Dinner')}
                      className={`px-3.5 py-2 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-2 ${
                        dispatchFilter === 'Dinner'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span>🌙 Dinner Shift</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        dispatchFilter === 'Dinner' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {dinnerTiffins.length}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDispatchFilter('All')}
                      className={`px-3.5 py-2 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-2 ${
                        dispatchFilter === 'All'
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span>📦 All Shifts</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        dispatchFilter === 'All' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {normalizedList.length}
                      </span>
                    </button>
                  </div>

                  {/* 4 Clean Metric Badges */}
                  <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                    <span className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex items-center gap-1.5">
                      <Package size={14} className="text-slate-500" />
                      <span>Total: <strong className="text-slate-900">{totalShiftCount}</strong></span>
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center gap-1.5">
                      <ChefHat size={14} className="text-amber-600" />
                      <span>Prep: <strong className="text-amber-950">{prepCount}</strong></span>
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 flex items-center gap-1.5">
                      <CheckCircle2 size={14} className="text-purple-600" />
                      <span>Packed: <strong className="text-purple-950">{packedCount}</strong></span>
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 flex items-center gap-1.5">
                      <Bike size={14} className="text-blue-600" />
                      <span>On Route: <strong className="text-blue-950">{onRouteCount}</strong></span>
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-1.5">
                      <CheckCheck size={14} className="text-emerald-600" />
                      <span>Delivered: <strong className="text-emerald-950">{delivCount}</strong></span>
                    </span>
                  </div>
                </div>

                {/* ── ⚡ EASY RIDER ALLOCATION PANEL (1-CLICK & FAST) ── */}
                <div className="bg-white border-2 border-orange-200/90 rounded-3xl p-5 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-orange-100 pb-3">
                    <div>
                      <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                        <Bike className="text-orange-500" size={20} />
                        <span>👑 Quick Rider Allocation</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Rider select karke 1-click me saare tiffins assign karein.
                      </p>
                    </div>

                    {/* Mode Toggle: Shift-Wise vs Zone-Wise */}
                    <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setDispatchAssignMode('shift')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                          dispatchAssignMode === 'shift'
                            ? 'bg-orange-500 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Clock size={13} />
                        <span>⚡ 1-Click Shift Assign</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDispatchAssignMode('zone')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                          dispatchAssignMode === 'zone'
                            ? 'bg-orange-500 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <MapPin size={13} />
                        <span>📍 Zone-Wise Assign</span>
                      </button>
                    </div>
                  </div>

                  {/* 1-CLICK SHIFT ASSIGN VIEW (EASIEST) */}
                  {dispatchAssignMode === 'shift' && (() => {
                    const breakfastExtraOrders = extraOrdersList.filter(o => {
                      const isMealExtra = o.deliverWithMeal || o.deliveryMode === 'with_tiffin' || (o.isExtraOrder && o.mealSlot && o.mealSlot !== 'Instant');
                      const oSlot = (o.mealSlot || o.attachedMealSlot || o.notes || '').toLowerCase();
                      return isMealExtra && oSlot.includes('breakfast') && o.status !== 'delivered' && o.status !== 'cancelled';
                    });
                    const lunchExtraOrders = extraOrdersList.filter(o => {
                      const isMealExtra = o.deliverWithMeal || o.deliveryMode === 'with_tiffin' || (o.isExtraOrder && o.mealSlot && o.mealSlot !== 'Instant');
                      const oSlot = (o.mealSlot || o.attachedMealSlot || o.notes || '').toLowerCase();
                      return isMealExtra && oSlot.includes('lunch') && o.status !== 'delivered' && o.status !== 'cancelled';
                    });
                    const dinnerExtraOrders = extraOrdersList.filter(o => {
                      const isMealExtra = o.deliverWithMeal || o.deliveryMode === 'with_tiffin' || (o.isExtraOrder && o.mealSlot && o.mealSlot !== 'Instant');
                      const oSlot = (o.mealSlot || o.attachedMealSlot || o.notes || '').toLowerCase();
                      return isMealExtra && oSlot.includes('dinner') && o.status !== 'delivered' && o.status !== 'cancelled';
                    });

                    return (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Breakfast Shift Box */}
                        <div className="bg-rose-50/50 border border-rose-200 rounded-2xl p-4 space-y-3">
                          <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">🌅</span>
                              <div>
                                <h4 className="text-sm font-black text-slate-900">Breakfast Deliveries (08:00 AM)</h4>
                                <div className="text-xs text-rose-800 font-bold flex items-center gap-1.5 flex-wrap mt-0.5">
                                  <span>{breakfastTiffins.length} Breakfast Boxes</span>
                                  {breakfastExtraOrders.length > 0 && (
                                    <span className="text-[10px] font-black bg-rose-200/90 text-rose-950 px-2 py-0.5 rounded-full border border-rose-300 flex items-center gap-1">
                                      <span>📦</span>
                                      <span>+{breakfastExtraOrders.length} Extra Order{breakfastExtraOrders.length > 1 ? 's' : ''} packed</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            {topBreakfastRider ? (
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                                ✓ {topBreakfastRider.split('(')[0]}
                              </span>
                            ) : (
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-900 border border-rose-300 shrink-0">
                                ⚠️ Not Assigned
                              </span>
                            )}
                          </div>

                          <div className="flex flex-col xl:flex-row gap-2 pt-1">
                            <select
                              value={dispatchBreakfastRider}
                              onChange={e => setDispatchBreakfastRider(e.target.value)}
                              className="w-full xl:flex-1 px-3 py-2.5 bg-white border border-rose-300 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer shadow-2xs"
                            >
                              <option value="">-- Choose Breakfast Rider --</option>
                              {riders.map(r => (
                                <option key={r.id || r._id} value={r.name}>
                                  {r.name} ({r.vehicle || 'Scooter'}) - {r.status || 'Active'}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              disabled={!dispatchBreakfastRider || isAssigningShift === 'Breakfast'}
                              onClick={() => handleAssignShiftRider('Breakfast', dispatchBreakfastRider)}
                              className="w-full xl:w-auto px-4 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 active:scale-[0.98] whitespace-nowrap"
                            >
                              {isAssigningShift === 'Breakfast' ? <RefreshCw size={13} className="animate-spin" /> : <Check size={14} />}
                              <span>Assign All Breakfast ({breakfastTiffins.length}{breakfastExtraOrders.length > 0 ? ` + ${breakfastExtraOrders.length} Extras` : ''})</span>
                            </button>
                          </div>
                        </div>
                        {/* Lunch Shift Box */}
                        <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-4 space-y-3">
                          <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">☀️</span>
                              <div>
                                <h4 className="text-sm font-black text-slate-900">Lunch Deliveries (12:30 PM)</h4>
                                <div className="text-xs text-amber-800 font-bold flex items-center gap-1.5 flex-wrap mt-0.5">
                                  <span>{lunchTiffins.length} Lunch Boxes</span>
                                  {lunchExtraOrders.length > 0 && (
                                    <span className="text-[10px] font-black bg-amber-200/90 text-amber-950 px-2 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                                      <span>📦</span>
                                      <span>+{lunchExtraOrders.length} Extra Order{lunchExtraOrders.length > 1 ? 's' : ''} packed</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            {topLunchRider ? (
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                                ✓ {topLunchRider.split('(')[0]}
                              </span>
                            ) : (
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                                ⚠️ Not Assigned
                              </span>
                            )}
                          </div>

                          <div className="flex flex-col xl:flex-row gap-2 pt-1">
                            <select
                              value={dispatchLunchRider}
                              onChange={e => setDispatchLunchRider(e.target.value)}
                              className="w-full xl:flex-1 px-3 py-2.5 bg-white border border-amber-300 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer shadow-2xs"
                            >
                              <option value="">-- Choose Lunch Rider --</option>
                              {riders.map(r => (
                                <option key={r.id || r._id} value={r.name}>
                                  {r.name} ({r.vehicle || 'Scooter'}) - {r.status || 'Active'}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              disabled={!dispatchLunchRider || isAssigningShift === 'Lunch'}
                              onClick={() => handleAssignShiftRider('Lunch', dispatchLunchRider)}
                              className="w-full xl:w-auto px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 active:scale-[0.98] whitespace-nowrap"
                            >
                              {isAssigningShift === 'Lunch' ? <RefreshCw size={13} className="animate-spin" /> : <Check size={14} />}
                              <span>Assign All Lunch ({lunchTiffins.length}{lunchExtraOrders.length > 0 ? ` + ${lunchExtraOrders.length} Extras` : ''})</span>
                            </button>
                          </div>
                        </div>

                        {/* Dinner Shift Box */}
                        <div className="bg-indigo-50/50 border border-indigo-200 rounded-2xl p-4 space-y-3">
                          <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">🌙</span>
                              <div>
                                <h4 className="text-sm font-black text-slate-900">Dinner Deliveries (07:30 PM)</h4>
                                <div className="text-xs text-indigo-800 font-bold flex items-center gap-1.5 flex-wrap mt-0.5">
                                  <span>{dinnerTiffins.length} Dinner Boxes</span>
                                  {dinnerExtraOrders.length > 0 && (
                                    <span className="text-[10px] font-black bg-indigo-200/90 text-indigo-950 px-2 py-0.5 rounded-full border border-indigo-300 flex items-center gap-1">
                                      <span>📦</span>
                                      <span>+{dinnerExtraOrders.length} Extra Order{dinnerExtraOrders.length > 1 ? 's' : ''} packed</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            {topDinnerRider ? (
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                                ✓ {topDinnerRider.split('(')[0]}
                              </span>
                            ) : (
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-900 border border-indigo-300 shrink-0">
                                ⚠️ Not Assigned
                              </span>
                            )}
                          </div>

                          <div className="flex flex-col xl:flex-row gap-2 pt-1">
                            <select
                              value={dispatchDinnerRider}
                              onChange={e => setDispatchDinnerRider(e.target.value)}
                              className="w-full xl:flex-1 px-3 py-2.5 bg-white border border-indigo-300 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs"
                            >
                              <option value="">-- Choose Dinner Rider --</option>
                              {riders.map(r => (
                                <option key={r.id || r._id} value={r.name}>
                                  {r.name} ({r.vehicle || 'Scooter'}) - {r.status || 'Active'}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              disabled={!dispatchDinnerRider || isAssigningShift === 'Dinner'}
                              onClick={() => handleAssignShiftRider('Dinner', dispatchDinnerRider)}
                              className="w-full xl:w-auto px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 active:scale-[0.98] whitespace-nowrap"
                            >
                              {isAssigningShift === 'Dinner' ? <RefreshCw size={13} className="animate-spin" /> : <Check size={14} />}
                              <span>Assign All Dinner ({dinnerTiffins.length}{dinnerExtraOrders.length > 0 ? ` + ${dinnerExtraOrders.length} Extras` : ''})</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* ZONE-WISE ASSIGN VIEW */}
                  {dispatchAssignMode === 'zone' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {(deliveryZones.length > 0 ? deliveryZones : [
                        { id: 'ZONE-01', code: 'NC-01', name: 'North Campus Hostels', areas: ['Tagore Hostel', 'Raman', 'Jubilee'] },
                        { id: 'ZONE-02', code: 'SC-02', name: 'South Campus Hostels', areas: ['Geeta Bhavan', 'Sarojini', 'ISH'] },
                        { id: 'ZONE-03', code: 'MN-03', name: 'Mukherjee Nagar PG Hub', areas: ['Batra Cinema', 'Nehru Vihar'] },
                        { id: 'ZONE-04', code: 'VJ-04', name: 'Vijay Nagar & Hudson', areas: ['Double Storey', 'Kingsway'] }
                      ]).map(zone => {
                        const zCode = (zone.code || '').toUpperCase();
                        const zoneTiffins = normalizedList.filter(item => {
                          const itemZone = (item.zoneCode || item.zone || '').toUpperCase();
                          return itemZone === zCode || itemZone.includes(zCode) || zCode.includes(itemZone);
                        });
                        const totalZone = zoneTiffins.length;
                        const zoneExtraOrders = extraOrdersList.filter(o => {
                          const isMealExtra = o.deliverWithMeal || o.deliveryMode === 'with_tiffin' || (o.isExtraOrder && o.mealSlot && o.mealSlot !== 'Instant');
                          if (!isMealExtra || o.status === 'delivered' || o.status === 'cancelled') return false;
                          const oAddr = (o.deliveryAddress || '').toUpperCase();
                          return oAddr.includes(zCode) || zCode.includes(oAddr);
                        });
                        const decidedRider = zoneTiffins.find(t => t.rider && t.rider !== 'Unassigned')?.rider || zone.assignedRider || '';
                        const selectedRider = zoneRiderSelection[zone.code] || '';
                        const selectedSlot = zoneSlotSelection[zone.code] || 'All';
                        const isAssigningThis = isAssigningZone === zone.code;

                        return (
                          <div
                            key={zone.id || zone.code}
                            className="bg-slate-50/70 border border-slate-200 rounded-2xl p-3.5 space-y-2.5 flex flex-col justify-between"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-xs font-black px-2 py-0.5 rounded-lg bg-orange-100 text-orange-900 border border-orange-200">
                                  📍 {zone.code}
                                </span>
                                <div className="flex items-center gap-1">
                                  <span className="text-[11px] font-black text-slate-600">
                                    {totalZone} Tiffins
                                  </span>
                                  {zoneExtraOrders.length > 0 && (
                                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-purple-100 text-purple-900 border border-purple-200">
                                      +{zoneExtraOrders.length} Extras
                                    </span>
                                  )}
                                </div>
                              </div>
                              <h4 className="font-bold text-xs text-slate-900 truncate" title={zone.name}>
                                {zone.name}
                              </h4>
                              <div className="text-[10px] text-slate-500 flex items-center justify-between">
                                <span>Rider:</span>
                                <strong className={decidedRider ? 'text-emerald-700' : 'text-amber-700'}>
                                  {decidedRider ? decidedRider.split('(')[0] : 'Unassigned'}
                                </strong>
                              </div>
                            </div>

                            <div className="space-y-1.5 pt-1 border-t border-slate-200">
                              <div className="flex gap-1">
                                <select
                                  value={selectedSlot}
                                  onChange={e => setZoneSlotSelection(prev => ({ ...prev, [zone.code]: e.target.value }))}
                                  className="w-1/3 bg-white border border-slate-200 rounded-lg px-1.5 py-1 text-[10px] font-bold text-slate-700 outline-none"
                                >
                                  <option value="All">All Slots</option>
                                  <option value="Breakfast">Breakfast</option>
                                  <option value="Lunch">Lunch</option>
                                  <option value="Dinner">Dinner</option>
                                </select>
                                <select
                                  value={selectedRider}
                                  onChange={e => setZoneRiderSelection(prev => ({ ...prev, [zone.code]: e.target.value }))}
                                  className="flex-1 bg-white border border-orange-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 outline-none"
                                >
                                  <option value="">-- Choose Rider --</option>
                                  {riders.map(r => (
                                    <option key={r.id || r._id} value={r.name}>
                                      {r.name}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <button
                                type="button"
                                disabled={!selectedRider || isAssigningThis}
                                onClick={() => handleAssignZoneRider(zone.code, selectedRider, selectedSlot)}
                                className="w-full py-1.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-black text-xs rounded-lg transition flex items-center justify-center gap-1 cursor-pointer"
                              >
                                {isAssigningThis ? <RefreshCw size={11} className="animate-spin" /> : <Check size={12} />}
                                <span>Assign {zone.code}</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* ── 🛵 RIDER ALLOCATION & LIVE STATUS DASHBOARD ── */}
                <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-xs">
                        <Bike size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-black text-slate-900 tracking-tight">
                            🛵 Rider Tiffin Allocation &amp; Live Tracking
                          </h3>
                          <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                            {riderStats.length} Riders Active
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Kis rider ko kitne tiffin mile hain, unki location (kahan hain) aur sabhi live delivery status:
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                      <button
                        type="button"
                        onClick={() => {
                          setQuickRateInput(deliveryRates.defaultPerDeliveryRate || 35);
                          setRateModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        title="Delivery rate configure karein (Rider payout per box)"
                      >
                        <DollarSign size={13} className="text-amber-700" />
                        <span>Rate: <strong>₹{deliveryRates.defaultPerDeliveryRate || 35}</strong>/box</span>
                        <span className="text-[10px] font-black bg-amber-200/80 text-amber-950 px-1.5 py-0.2 rounded-md">⚡ Set Rate</span>
                      </button>

                      {dispatchRiderFilter !== 'All' && (
                        <button
                          type="button"
                          onClick={() => setDispatchRiderFilter('All')}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200 transition flex items-center gap-1 cursor-pointer"
                        >
                          <X size={12} />
                          <span>Clear Rider Filter</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setIsRiderSummaryOpen(prev => !prev)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1.5 cursor-pointer"
                        title={isRiderSummaryOpen ? "Collapse dashboard" : "Expand dashboard"}
                      >
                        <span>{isRiderSummaryOpen ? 'Hide' : 'Show All'}</span>
                        {isRiderSummaryOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>
                  </div>

                  {isRiderSummaryOpen && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pt-1">
                      {riderStats.map(r => {
                        const isFilterActive = dispatchRiderFilter.toLowerCase() === r.name.toLowerCase();

                        return (
                          <div
                            key={r.id}
                            onClick={() => setDispatchRiderFilter(isFilterActive ? 'All' : r.name)}
                            className={`border-2 rounded-2xl p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 shadow-xs hover:shadow-md ${
                              isFilterActive
                                ? 'bg-orange-50/70 border-orange-500 ring-2 ring-orange-400/30'
                                : 'bg-white border-slate-200/90 hover:border-orange-300'
                            }`}
                          >
                            {/* Rider Header: Name, Vehicle, Phone & Duty */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                                  {r.name.charAt(0)}
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <h4 className="font-black text-sm text-slate-900 group-hover:text-orange-600 transition">
                                      {r.name}
                                    </h4>
                                    <span className="text-[10px] text-amber-600 font-bold flex items-center">
                                      ★ {r.rating}
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500">
                                    <span>{r.vehicle}</span>
                                    {r.phone && (
                                      <a
                                        href={`tel:${r.phone}`}
                                        onClick={e => e.stopPropagation()}
                                        className="text-orange-600 font-bold hover:underline flex items-center gap-0.5"
                                      >
                                        <Phone size={10} />
                                        <span>{r.phone}</span>
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Duty Status Badge */}
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shrink-0 ${
                                r.dutyStatus === 'available'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : r.dutyStatus === 'on-route'
                                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                  : r.dutyStatus === 'busy'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  r.dutyStatus === 'available'
                                    ? 'bg-emerald-500 animate-pulse'
                                    : r.dutyStatus === 'on-route'
                                    ? 'bg-blue-500 animate-pulse'
                                    : r.dutyStatus === 'busy'
                                    ? 'bg-amber-500'
                                    : 'bg-slate-400'
                                }`} />
                                {r.dutyStatus === 'available' ? 'Online' : r.dutyStatus === 'on-route' ? 'On Route' : r.dutyStatus === 'busy' ? 'Busy' : 'Offline'}
                              </span>
                            </div>

                            {/* Kitna Tiffin Mila Hai (Assigned Count) */}
                            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                                  <Package size={13} className="text-orange-500" />
                                  <span>Total Tiffins Mila:</span>
                                </span>
                                <span className="text-sm font-black text-slate-900 bg-white border border-slate-200 px-2.5 py-0.5 rounded-lg shadow-2xs">
                                  {r.total} Tiffins
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-100 text-rose-900 border border-rose-200 flex items-center gap-1">
                                  🌅 Breakfast: <strong>{r.breakfastCount}</strong>
                                </span>
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
                                  ☀️ Lunch: <strong>{r.lunchCount}</strong>
                                </span>
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-indigo-100 text-indigo-900 border border-indigo-200 flex items-center gap-1">
                                  🌙 Dinner: <strong>{r.dinnerCount}</strong>
                                </span>
                                {r.extraCount > 0 && (
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-purple-100 text-purple-900 border border-purple-200 flex items-center gap-1">
                                    🥟 +{r.extraCount} Extras
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Kaha Pe Hai (Location / Route / Hostels) */}
                            <div className="text-[11px] space-y-1 bg-slate-50/50 rounded-xl p-2 border border-slate-100">
                              <div className="flex items-center gap-1.5 text-slate-700">
                                <MapPin size={12} className="text-rose-500 shrink-0" />
                                <span className="font-bold text-slate-900">Area / Route:</span>
                                <span className="text-slate-600 truncate">{r.route}</span>
                              </div>

                              <div className="flex items-start gap-1.5 text-slate-600">
                                <span className="font-bold text-slate-800 shrink-0">📍 Kaha Pe Hai:</span>
                                <span className="text-slate-600 line-clamp-1" title={r.hostels.join(', ')}>
                                  {r.hostels.length > 0 ? (
                                    r.hostels.slice(0, 3).join(', ') + (r.hostels.length > 3 ? ` +${r.hostels.length - 3} more` : '')
                                  ) : (
                                    <span className="text-slate-400 italic">No delivery stops yet</span>
                                  )}
                                </span>
                              </div>

                              {r.zones.length > 0 && (
                                <div className="flex items-center gap-1 pt-0.5">
                                  <span className="text-[10px] font-bold text-slate-500">Zones:</span>
                                  {r.zones.map((z: string) => (
                                    <span key={z} className="px-1.5 py-0.2 rounded bg-slate-200/80 text-slate-700 font-black text-[9px]">
                                      {z}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* All Statuses (Sabhi Status: Preparing / Packed / Out for Delivery / Delivered) */}
                            <div className="space-y-1.5 pt-1 border-t border-slate-100">
                              <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
                                <span>All Status ({r.progressPercent}% Completed):</span>
                                <span className="text-emerald-700 font-black">{r.deliveredCount}/{r.total} Delivered</span>
                              </div>

                              {/* Multi-segment visual status bar */}
                              {r.total > 0 ? (
                                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden flex shadow-inner">
                                  <div style={{ width: `${(r.deliveredCount / r.total) * 100}%` }} className="bg-emerald-500 h-full transition-all" title={`Delivered: ${r.deliveredCount}`} />
                                  <div style={{ width: `${(r.onRouteCount / r.total) * 100}%` }} className="bg-blue-500 h-full transition-all" title={`On Route: ${r.onRouteCount}`} />
                                  <div style={{ width: `${(r.packedCount / r.total) * 100}%` }} className="bg-purple-500 h-full transition-all" title={`Packed: ${r.packedCount}`} />
                                  <div style={{ width: `${(r.prepCount / r.total) * 100}%` }} className="bg-amber-400 h-full transition-all" title={`Preparing: ${r.prepCount}`} />
                                </div>
                              ) : (
                                <div className="w-full bg-slate-100 rounded-full h-2" />
                              )}

                              {/* 4 Clean Status Count Badges */}
                              <div className="grid grid-cols-4 gap-1 text-center pt-0.5">
                                <div className="bg-amber-50 border border-amber-200/60 rounded-md py-1 px-0.5">
                                  <div className="text-[9px] font-bold text-amber-700">Prep</div>
                                  <div className="text-xs font-black text-amber-950">{r.prepCount}</div>
                                </div>
                                <div className="bg-purple-50 border border-purple-200/60 rounded-md py-1 px-0.5">
                                  <div className="text-[9px] font-bold text-purple-700">Packed</div>
                                  <div className="text-xs font-black text-purple-950">{r.packedCount}</div>
                                </div>
                                <div className="bg-blue-50 border border-blue-200/60 rounded-md py-1 px-0.5">
                                  <div className="text-[9px] font-bold text-blue-700">On Way</div>
                                  <div className="text-xs font-black text-blue-950">{r.onRouteCount}</div>
                                </div>
                                <div className="bg-emerald-50 border border-emerald-200/60 rounded-md py-1 px-0.5">
                                  <div className="text-[9px] font-bold text-emerald-700">Done</div>
                                  <div className="text-xs font-black text-emerald-950">{r.deliveredCount}</div>
                                </div>
                              </div>
                            </div>

                            {/* Actions: Full Details Modal & Table Filter */}
                            <div className="space-y-1.5 pt-1">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setInspectRiderBoxes(r);
                                }}
                                className="w-full py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                                title={`Open complete box-by-box assignment list for ${r.name}`}
                              >
                                <ClipboardList size={14} />
                                <span>📋 Pura Details Dekhein ({r.total} Boxes)</span>
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDispatchRiderFilter(isFilterActive ? 'All' : r.name);
                                }}
                                className={`w-full py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                                  isFilterActive
                                    ? 'bg-slate-900 text-white shadow-xs'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                }`}
                              >
                                {isFilterActive ? (
                                  <>
                                    <Check size={12} />
                                    <span>✕ Clear Table Filter</span>
                                  </>
                                ) : (
                                  <>
                                    <Filter size={12} />
                                    <span>🔍 Table Me Filter Karein</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {/* Unassigned Tiffins Card */}
                      {unassignedCount > 0 ? (
                        <div
                          onClick={() => setDispatchRiderFilter(dispatchRiderFilter === 'Unassigned' ? 'All' : 'Unassigned')}
                          className={`border-2 rounded-2xl p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 shadow-xs hover:shadow-md ${
                            dispatchRiderFilter === 'Unassigned'
                              ? 'bg-amber-100/70 border-amber-600 ring-2 ring-amber-400/30'
                              : 'bg-amber-50/50 border-amber-300 hover:border-amber-400'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-xs">
                                ⚠️
                              </div>
                              <div>
                                <h4 className="font-black text-sm text-amber-950">
                                  Unassigned Tiffins
                                </h4>
                                <p className="text-[11px] text-amber-700 font-medium">
                                  In tiffins ko abhi rider assign nahi hua
                                </p>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-200 text-amber-900 border border-amber-300">
                              Action Needed
                            </span>
                          </div>

                          <div className="bg-white/80 border border-amber-200 rounded-xl p-2.5 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-amber-900">Total Unassigned:</span>
                              <span className="text-sm font-black text-amber-950 bg-amber-100 px-2.5 py-0.5 rounded-lg">
                                {unassignedCount} Boxes
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-100 text-rose-900">
                                🌅 Breakfast: {unassignedBreakfast}
                              </span>
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-100 text-amber-900">
                                ☀️ Lunch: {unassignedLunch}
                              </span>
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-indigo-100 text-indigo-900">
                                🌙 Dinner: {unassignedDinner}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-1.5 text-center text-xs">
                            <div className="bg-white/80 border border-amber-200 rounded-lg py-1 px-2">
                              <span className="text-[10px] font-bold text-amber-800">🍳 Prep: </span>
                              <strong className="text-amber-950">{unassignedPrep}</strong>
                            </div>
                            <div className="bg-white/80 border border-amber-200 rounded-lg py-1 px-2">
                              <span className="text-[10px] font-bold text-amber-800">📦 Packed: </span>
                              <strong className="text-amber-950">{unassignedPacked}</strong>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDispatchRiderFilter(dispatchRiderFilter === 'Unassigned' ? 'All' : 'Unassigned');
                            }}
                            className={`w-full py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                              dispatchRiderFilter === 'Unassigned'
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'bg-amber-200/80 hover:bg-amber-300 text-amber-900'
                            }`}
                          >
                            <Eye size={13} />
                            <span>{dispatchRiderFilter === 'Unassigned' ? 'Showing Unassigned' : `View ${unassignedCount} Unassigned Tiffins`}</span>
                          </button>
                        </div>
                      ) : (
                        <div className="border-2 border-emerald-200 bg-emerald-50/50 rounded-2xl p-4 flex flex-col justify-center items-center text-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-black">
                            <CheckCheck size={20} />
                          </div>
                          <div>
                            <h4 className="font-black text-sm text-emerald-950">100% Assigned!</h4>
                            <p className="text-[11px] text-emerald-700">Sabhi tiffins riders ko assign ho chuke hain.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* ── SEARCH & FILTER CONTROLS ── */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-xs space-y-3">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    {/* Search Input */}
                    <div className="relative flex-1">
                      <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search student, room number (e.g. 204), hostel building, box ID (#TIF), rider..."
                        value={dispatchSearchQuery}
                        onChange={e => setDispatchSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-orange-500 focus:bg-white transition font-medium"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Rider Select */}
                      <select
                        value={dispatchRiderFilter}
                        onChange={e => setDispatchRiderFilter(e.target.value)}
                        className="px-3 py-2 bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-orange-500 cursor-pointer"
                      >
                        <option value="All">All Riders ({normalizedList.length} Tiffins)</option>
                        {unassignedCount > 0 && (
                          <option value="Unassigned">⚠️ Unassigned ({unassignedCount})</option>
                        )}
                        {riderStats.map(r => (
                          <option key={r.id} value={r.name}>
                            🛵 {r.name} ({r.total} Tiffins)
                          </option>
                        ))}
                      </select>

                      {/* Zone Select */}
                      <select
                        value={dispatchZoneFilter}
                        onChange={e => setDispatchZoneFilter(e.target.value)}
                        className="px-3 py-2 bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-orange-500 cursor-pointer"
                      >
                        <option value="All">All Delivery Zones</option>
                        {deliveryZones.map(z => (
                          <option key={z.id} value={z.code}>
                            {z.name} ({z.code})
                          </option>
                        ))}
                      </select>

                      {/* Status Select */}
                      <select
                        value={dispatchStatusFilter}
                        onChange={e => setDispatchStatusFilter(e.target.value)}
                        className="px-3 py-2 bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-orange-500 cursor-pointer"
                      >
                        <option value="All">All Statuses</option>
                        <option value="preparing">Preparing</option>
                        <option value="packed">Packed</option>
                        <option value="dispatched">Dispatched</option>
                        <option value="delivered">Delivered</option>
                        <option value="skipped">Skipped / Paused</option>
                      </select>

                      {/* Extra Add-ons Toggle */}
                      <button
                        type="button"
                        onClick={() => setDispatchExtrasOnly(prev => !prev)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                          dispatchExtrasOnly
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black shadow-xs'
                            : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        <Sparkles size={13} />
                        <span>Extras Only</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          dispatchExtrasOnly ? 'bg-white/20 text-white' : 'bg-amber-200 text-amber-950'
                        }`}>
                          {shiftList.filter(r => r.hasAttachedExtras).length}
                        </span>
                      </button>

                      {(dispatchSearchQuery || dispatchZoneFilter !== 'All' || dispatchStatusFilter !== 'All' || dispatchRiderFilter !== 'All' || dispatchExtrasOnly) && (
                        <button
                          type="button"
                          onClick={() => {
                            setDispatchSearchQuery('');
                            setDispatchZoneFilter('All');
                            setDispatchStatusFilter('All');
                            setDispatchRiderFilter('All');
                            setDispatchExtrasOnly(false);
                          }}
                          className="text-xs font-bold text-orange-600 hover:text-orange-700 px-3 py-2 bg-orange-50 rounded-xl cursor-pointer transition"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Filter Active Notification Banner */}
                  {dispatchRiderFilter !== 'All' && (
                    <div className="bg-orange-50/80 border border-orange-200 rounded-xl px-3.5 py-2 flex items-center justify-between text-xs text-orange-950 font-bold">
                      <div className="flex items-center gap-2">
                        <Bike size={15} className="text-orange-600 shrink-0" />
                        <span>
                          {dispatchRiderFilter === 'Unassigned' ? (
                            <>Showing only <strong>Unassigned Tiffins</strong> ({filteredList.length} boxes)</>
                          ) : (
                            <>Showing only tiffins assigned to: <strong className="underline text-orange-900">{dispatchRiderFilter}</strong> ({filteredList.length} boxes match)</>
                          )}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDispatchRiderFilter('All')}
                        className="text-[11px] text-orange-800 hover:text-orange-950 bg-white border border-orange-200 hover:border-orange-300 px-2.5 py-1 rounded-lg cursor-pointer transition shadow-2xs"
                      >
                        Show All Riders ✕
                      </button>
                    </div>
                  )}
                </div>

                {/* ── BULK ACTIONS BAR (When selected) ── */}
                {selectedDispatchIds.length > 0 && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-orange-500 text-white font-black text-xs flex items-center justify-center">
                        {selectedDispatchIds.length}
                      </span>
                      <span className="text-xs font-bold text-orange-950">
                        {selectedDispatchIds.length} tiffin box{selectedDispatchIds.length > 1 ? 'es' : ''} selected
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleBulkDispatchStatus('packed')}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        Mark as Packed
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBulkDispatchStatus('dispatched')}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        Mark as Dispatched
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBulkDispatchStatus('delivered')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        Mark as Delivered
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedDispatchIds([])}
                        className="px-3 py-1.5 bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        Deselect
                      </button>
                    </div>
                  </div>
                )}

                {/* ── STREAMLINED EASY TIFFIN TABLE ── */}
                <div className="bg-white border border-slate-200/90 rounded-3xl shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-4 w-10 text-center">
                            <input
                              type="checkbox"
                              checked={isAllSelected}
                              onChange={handleToggleSelectAll}
                              className="rounded border-slate-300 text-orange-500 focus:ring-orange-500 cursor-pointer"
                              title="Select All"
                            />
                          </th>
                          <th className="py-3 px-4">Delivery &amp; Box ID</th>
                          <th className="py-3 px-4">Student &amp; Hostel Address</th>
                          <th className="py-3 px-4">Meal, Plan &amp; Extras</th>
                          <th className="py-3 px-4">Zone</th>
                          <th className="py-3 px-4 font-black text-orange-950">👑 Assigned Rider</th>
                          <th className="py-3 px-4">Status &amp; Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredList.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-12 px-4 text-center">
                              <div className="max-w-md mx-auto space-y-3">
                                <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
                                  <Truck size={24} />
                                </div>
                                <h4 className="text-base font-black text-slate-900">No Tiffins Found</h4>
                                <p className="text-xs text-slate-500">
                                  No tiffin boxes match your current shift, zone or search filters.
                                </p>
                                <div className="flex items-center justify-center gap-2 pt-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setDispatchFilter('All');
                                      setDispatchZoneFilter('All');
                                      setDispatchStatusFilter('All');
                                      setDispatchRiderFilter('All');
                                      setDispatchExtrasOnly(false);
                                      setDispatchSearchQuery('');
                                    }}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
                                  >
                                    Reset Filters
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleSyncDispatchRoster}
                                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs transition cursor-pointer"
                                  >
                                    Auto-Sync Plans
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          filteredList.map((item, idx) => {
                            const isSelected = selectedDispatchIds.includes(item.id);

                            return (
                              <tr
                                key={item.id}
                                className={`transition-colors ${
                                  isSelected
                                    ? 'bg-orange-50/60'
                                    : item.isSkipped || item.isPaused
                                    ? 'bg-rose-50/25 hover:bg-rose-50/40'
                                    : 'hover:bg-slate-50/60'
                                }`}
                              >
                                {/* Checkbox */}
                                <td className="py-3 px-4 text-center">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() =>
                                      setSelectedDispatchIds(prev =>
                                        prev.includes(item.id) ? prev.filter(i => i !== item.id) : [...prev, item.id]
                                      )
                                    }
                                    className="rounded border-slate-300 text-orange-500 focus:ring-orange-500 cursor-pointer"
                                  />
                                </td>

                                {/* Sequential Delivery # & Box ID */}
                                <td className="py-3 px-4">
                                  <div className="space-y-1">
                                    <span className="font-mono font-bold text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                                      #{idx + 1}
                                    </span>
                                    <div className="flex items-center gap-1">
                                      <span className="font-mono font-black text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-[10px] border border-orange-200">
                                        #{item.id}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          navigator.clipboard.writeText(item.id);
                                          showToast(`Box ID #${item.id} copied!`);
                                        }}
                                        className="text-slate-300 hover:text-slate-600 p-0.5 transition cursor-pointer"
                                        title="Copy Box ID"
                                      >
                                        <Copy size={11} />
                                      </button>
                                    </div>
                                    {item.otp && (
                                      <span className="text-[9px] font-mono font-bold text-emerald-700 block">
                                        OTP: {item.otp}
                                      </span>
                                    )}
                                  </div>
                                </td>

                                {/* Student & Hostel Address */}
                                <td className="py-3 px-4">
                                  <div className="space-y-1">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const match = subscribers.find(
                                          s => (s.userId?.name || '').toLowerCase().trim() === item.student.toLowerCase().trim()
                                        );
                                        if (match) handleOpenSubscriberDetail(match);
                                        else showToast(`Student "${item.student}" membership profile`, 'success');
                                      }}
                                      className="text-left font-black text-slate-900 hover:text-orange-600 flex items-center gap-1 cursor-pointer group text-xs"
                                    >
                                      <span>{item.student}</span>
                                      <ArrowUpRight size={11} className="text-slate-300 group-hover:text-orange-500 transition-colors" />
                                    </button>

                                    <div className="text-[11px] text-slate-600 flex items-center gap-1">
                                      <MapPin size={11} className="text-orange-500 shrink-0" />
                                      <span className="truncate max-w-[180px]" title={`${item.hostel}${item.room ? `, Rm ${item.room}` : ''}`}>
                                        {item.hostel}{item.room ? `, Rm ${item.room}` : ''}
                                      </span>
                                    </div>

                                    {item.phone && (
                                      <a href={`tel:${item.phone}`} className="text-[10px] text-slate-400 hover:text-orange-600 font-mono flex items-center gap-1">
                                        <Phone size={10} /> {item.phone}
                                      </a>
                                    )}
                                  </div>
                                </td>

                                {/* Shift, Plan & Extras */}
                                <td className="py-3 px-4">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span
                                        className={`font-black px-2 py-0.5 rounded text-[10px] ${
                                          item.slot.toLowerCase().includes('breakfast')
                                            ? 'bg-rose-100 text-rose-900 border border-rose-200'
                                            : item.slot.toLowerCase().includes('lunch')
                                            ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                            : 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                                        }`}
                                      >
                                        {item.slot}
                                      </span>
                                      <span className="text-[11px] font-bold text-slate-800">
                                        {item.plan}
                                      </span>
                                    </div>

                                    {/* Add-on Extras pill & toggle */}
                                    {item.hasAttachedExtras || (item.extras && item.extras.length > 0 && !item.extras.includes('Standard')) ? (
                                      <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[10px] border border-amber-300">
                                          <Sparkles size={10} className="text-amber-600 shrink-0" />
                                          <span className="truncate max-w-[120px]" title={item.extras}>{item.extras}</span>
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => handleToggleExtrasPacked(item)}
                                          className={`px-1.5 py-0.5 rounded text-[9px] font-black cursor-pointer transition border ${
                                            item.extrasPacked
                                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                                          }`}
                                        >
                                          {item.extrasPacked ? '✓ Packed' : '☐ Pack'}
                                        </button>
                                      </div>
                                    ) : (
                                      <span className="text-[10px] text-slate-400">Regular Tiffin</span>
                                    )}
                                  </div>
                                </td>

                                {/* Zone Code */}
                                <td className="py-3 px-4">
                                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 border border-orange-200">
                                    {item.zoneCode}
                                  </span>
                                </td>

                                {/* 👑 Decided Rider (Admin Assigned Dynamic Dropdown) */}
                                <td className="py-3 px-4">
                                  <div className="space-y-1">
                                    <select
                                      value={item.rider ? item.rider.split('(')[0].trim() : 'Unassigned'}
                                      onChange={e => handleAssignDispatchRider(item.id, e.target.value)}
                                      className={`px-2.5 py-1.5 border rounded-xl text-xs font-black outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer transition max-w-[170px] truncate ${
                                        item.rider === 'Unassigned' || !item.rider
                                          ? 'bg-amber-50 border-amber-300 text-amber-900 animate-pulse'
                                          : 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                                      }`}
                                      title="Select which rider delivers this tiffin and attached extra orders"
                                    >
                                      <option value="Unassigned">⚠️ Choose Rider</option>
                                      {riders.map(r => (
                                        <option key={r.id} value={r.name}>
                                          {r.name}
                                        </option>
                                      ))}
                                    </select>
                                    <div className="text-[9px] text-slate-400">
                                      {item.rider && item.rider !== 'Unassigned' ? (
                                        item.hasAttachedExtras ? (
                                          <span className="text-emerald-700 font-bold">✓ Tiffin + Extra Order Assigned</span>
                                        ) : (
                                          'Assigned'
                                        )
                                      ) : (
                                        'Awaiting Assignment'
                                      )}
                                    </div>
                                    {item.rider && item.rider !== 'Unassigned' && (
                                      <button
                                        type="button"
                                        onClick={() => setInspectRiderBoxes({ name: item.rider })}
                                        className="text-[10px] text-orange-600 hover:text-orange-800 font-bold hover:underline flex items-center gap-1 cursor-pointer pt-0.5"
                                        title={`View all boxes assigned to ${item.rider}`}
                                      >
                                        <ClipboardList size={11} />
                                        <span>Rider Ke Sabhi Boxes Dekhein</span>
                                      </button>
                                    )}
                                  </div>
                                </td>

                                {/* Status & Quick Stepper Action */}
                                <td className="py-3 px-4">
                                  <div className="space-y-1.5">
                                    <div>
                                      <span
                                        className={`px-2.5 py-0.5 rounded-full font-black uppercase text-[10px] inline-flex items-center gap-1 ${
                                          item.status === 'delivered'
                                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                            : item.status === 'dispatched' || item.status === 'on-route'
                                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                            : item.status === 'packed'
                                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                            : item.isSkipped || item.status === 'skipped'
                                            ? 'bg-slate-200 text-slate-700 border border-slate-300'
                                            : item.isPaused || item.status === 'paused'
                                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                                        }`}
                                      >
                                        {item.status === 'delivered' && '✓'}
                                        {item.status === 'dispatched' && '🛵'}
                                        {item.status === 'packed' && '📦'}
                                        {item.status}
                                      </span>
                                    </div>

                                    {/* Action Buttons Group */}
                                    <div className="flex items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => updateDispatchStatus(item.id, 'packed')}
                                        className={`px-2 py-0.5 text-[9px] font-bold rounded-lg cursor-pointer transition ${
                                          item.status === 'packed'
                                            ? 'bg-purple-600 text-white font-black'
                                            : 'bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200'
                                        }`}
                                        title="Mark Packed"
                                      >
                                        Pack
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => updateDispatchStatus(item.id, 'dispatched')}
                                        className={`px-2 py-0.5 text-[9px] font-bold rounded-lg cursor-pointer transition ${
                                          item.status === 'dispatched' || item.status === 'on-route'
                                            ? 'bg-blue-600 text-white font-black'
                                            : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200'
                                        }`}
                                        title="Mark Dispatched"
                                      >
                                        Dispatch
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => updateDispatchStatus(item.id, 'delivered')}
                                        className={`px-2 py-0.5 text-[9px] font-bold rounded-lg cursor-pointer transition ${
                                          item.status === 'delivered'
                                            ? 'bg-emerald-600 text-white font-black'
                                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                                        }`}
                                        title="Mark Delivered"
                                      >
                                        Done
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteDispatchItem(item.id)}
                                        className="p-1 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                        title="Remove from roster"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Table Footer info */}
                  <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
                    <div>
                      Showing <strong className="text-slate-900">{filteredList.length}</strong> of{' '}
                      <strong className="text-slate-900">{normalizedList.length}</strong> tiffins
                    </div>
                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" /> Delivered: {delivCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-blue-500" /> On Route: {onRouteCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-purple-500" /> Packed: {packedCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-amber-500" /> Kitchen Prep: {prepCount}
                      </span>
                    </div>
                  </div>
                </div>
                </>
                )}
              </div>
            );
          })()}

          {/* ══════════════════════════════════════════════════════════
              4. TAB: MEAL PLANS (FULL CRUD)
          ══════════════════════════════════════════════════════════ */}
          {activeTab === 'plans' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Mess Plans Configuration</h2>
                  <p className="text-xs text-slate-500">Configure monthly and semester meal packages for students</p>
                </div>
                <button
                  onClick={openNewPlanModal}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  <Plus size={16} /> Add New Plan
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map(plan => (
                  <div
                    key={plan._id}
                    className={`bg-white rounded-3xl border ${
                      plan.isPopular ? 'border-orange-500 shadow-md ring-2 ring-orange-500/10' : 'border-slate-200 shadow-xs'
                    } p-6 flex flex-col justify-between hover:shadow-lg transition-all`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                            {plan.mealsPerDay} Meal{plan.mealsPerDay > 1 ? 's' : ''} / Day
                          </span>
                          <h3 className="text-2xl font-black text-slate-900 mt-0.5">{plan.name}</h3>
                        </div>
                        {plan.isPopular && (
                          <span className="bg-orange-100 text-orange-700 text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
                            Most Popular
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 mb-4">{plan.description}</p>

                      <div className="p-4 bg-slate-50 rounded-2xl mb-5">
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-black text-slate-900">₹{plan.monthlyPrice}</span>
                          <span className="text-xs text-slate-500 font-bold">/month</span>
                        </div>
                        <p className="text-[11px] text-emerald-600 font-bold mt-1">
                          {plan.semesterDiscount}% OFF on semester package
                        </p>
                      </div>

                      <div className="space-y-2 mb-6">
                        <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">Includes:</p>
                        {plan.features.map((feat, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                            <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                      <div className="text-xs text-slate-500 font-bold">
                        {subscribers.filter(s => (s.planId?._id === plan._id || s.planId?.name === plan.name || (s as any).planName === plan.name) && s.status === 'active').length} active students
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditPlanModal(plan)}
                          className="p-2 text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition"
                          title="Edit Plan"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeletePlan(plan._id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Plan"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              5. TAB: WEEKLY ROTATING TIMETABLE (7 DAYS ROTATION)
          ══════════════════════════════════════════════════════════ */}
          {activeTab === 'menu' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                      Mess Menu Schedule
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500 font-semibold">Today is {todayDayKey}</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 mt-1">Weekly Rotating Menu Timetable</h2>
                  <p className="text-xs text-slate-500 max-w-xl mt-0.5">
                    Live meal timetable synced with student mobile app and website. Rotates automatically day-by-day.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditMenuModal(todayDayKey)}
                    className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 cursor-pointer flex items-center gap-1.5 transition"
                  >
                    <Edit size={14} /> Quick Edit Today ({todayDayKey})
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {DAYS.map(day => {
                  const isToday = day === todayDayKey;
                  const dayData = weeklyMenu[day] || {
                    breakfast: 'Poha + Chai',
                    lunch: 'Dal + Rice + 3 Roti + Salad',
                    dinner: 'Paneer Curry + Rice + 3 Roti'
                  };

                  return (
                    <div
                      key={day}
                      className={`rounded-3xl p-5 transition flex flex-col justify-between relative overflow-hidden group ${
                        isToday
                          ? 'bg-gradient-to-b from-orange-50/70 via-white to-white border-2 border-orange-500 shadow-md ring-4 ring-orange-500/10'
                          : 'bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300'
                      }`}
                    >
                      {isToday && (
                        <div className="absolute top-0 right-0 bg-gradient-to-l from-orange-500 to-amber-500 text-white text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl shadow-xs flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                          Today's Menu
                        </div>
                      )}

                      <div>
                        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-2.5">
                            <span className={`w-10 h-10 rounded-2xl font-black text-sm flex items-center justify-center shadow-xs ${
                              isToday
                                ? 'bg-orange-500 text-white shadow-orange-500/30'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {day}
                            </span>
                            <div>
                              <p className="font-extrabold text-xs text-slate-800">
                                {day === 'Sun' ? 'Sunday Feast' : `${day}day`}
                              </p>
                              <span className="text-[10px] text-slate-400 font-semibold">3 Homestyle Meals</span>
                            </div>
                          </div>
                          <button
                            onClick={() => openEditMenuModal(day)}
                            className="p-1.5 bg-slate-50 hover:bg-orange-50 hover:text-orange-600 text-slate-600 rounded-xl transition cursor-pointer border border-slate-200/80"
                            title={`Edit ${day} Menu`}
                          >
                            <Edit size={13} />
                          </button>
                        </div>

                        <div className="space-y-3 text-xs">
                          <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-black text-amber-800 uppercase tracking-wider text-[10px] flex items-center gap-1">
                                <Sun size={11} className="text-amber-600" /> Breakfast
                              </span>
                              <span className="text-[9px] font-bold text-amber-700/80">08:00 AM</span>
                            </div>
                            <p className="text-slate-800 font-bold leading-snug">{dayData.breakfast}</p>
                          </div>

                          <div className="p-2.5 rounded-xl bg-orange-50/60 border border-orange-100">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-black text-orange-700 uppercase tracking-wider text-[10px] flex items-center gap-1">
                                <Utensils size={11} className="text-orange-600" /> Lunch Thali
                              </span>
                              <span className="text-[9px] font-bold text-orange-700/80">01:00 PM</span>
                            </div>
                            <p className="text-slate-800 font-bold leading-snug">{dayData.lunch}</p>
                          </div>

                          <div className="p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-100">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-black text-indigo-800 uppercase tracking-wider text-[10px] flex items-center gap-1">
                                <Moon size={11} className="text-indigo-600" /> Dinner
                              </span>
                              <span className="text-[9px] font-bold text-indigo-700/80">08:00 PM</span>
                            </div>
                            <p className="text-slate-800 font-bold leading-snug">{dayData.dinner}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              6. TAB: EXTRA ADD-ONS (STUDENT ORDERS & MENU MANAGEMENT)
          ══════════════════════════════════════════════════════════ */}
          {activeTab === 'extras' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    {extrasActiveTab === 'catalog' ? (
                      <>
                        <Utensils size={22} className="text-orange-500" />
                        <span>Extra Add-ons Menu &amp; Catalog</span>
                      </>
                    ) : extrasActiveTab === 'requests' ? (
                      <>
                        <Package size={22} className="text-amber-500" />
                        <span>📦 Pack with Meal Requests (Pending Approval)</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={22} className="text-orange-500" />
                        <span>Student Extra Add-ons &amp; Orders Hub</span>
                      </>
                    )}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {extrasActiveTab === 'catalog'
                      ? 'Configure extra sides, rotis, desserts and beverages that students can order to pack with daily tiffins'
                      : extrasActiveTab === 'requests'
                      ? 'Subscriber orders requesting extra add-ons packed directly with Lunch or Dinner meal. Admin approves and assigns rider with meal dispatch.'
                      : 'Real-time extra items ordered by students (Rotis, Gulab Jamun, Paneer, Lassi) to pack with daily tiffins'}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Triple Mode Switcher */}
                  <div className="flex bg-slate-200/70 p-1 rounded-xl border border-slate-200 gap-1">
                    <button
                      type="button"
                      onClick={() => setExtrasActiveTab('requests')}
                      className={`relative px-3.5 py-1.5 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                        extrasActiveTab === 'requests'
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Package size={13} />
                      <span>Meal Pack Requests</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                        extrasActiveTab === 'requests'
                          ? 'bg-white/20 text-white'
                          : pendingPackWithMealCount > 0 ? 'bg-amber-500 text-white animate-pulse' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {pendingPackWithMealCount}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setExtrasActiveTab('orders')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                        extrasActiveTab === 'orders'
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Sparkles size={13} />
                      <span>Live Extra Orders</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${extrasActiveTab === 'orders' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-900'}`}>
                        {extraOrdersCount}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setExtrasActiveTab('catalog')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                        extrasActiveTab === 'catalog'
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Utensils size={13} />
                      <span>Add-ons Menu</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${extrasActiveTab === 'catalog' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                        {extras.length}
                      </span>
                    </button>
                  </div>

                  <button
                    onClick={openNewExtraModal}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={16} /> Add Add-on Item
                  </button>
                </div>
              </div>

              {/* ── VIEW 0: MEAL PACK REQUESTS QUEUE (SUBSCRIBER ADD-ONS) ── */}
              {extrasActiveTab === 'requests' && (() => {
                const packWithMealList = extraOrdersList.filter(o => o.deliverWithMeal);
                const pendingRequests = packWithMealList.filter(o => o.status !== 'delivered' && o.status !== 'cancelled' && o.status !== 'on-the-way');
                const dispatchedRequests = packWithMealList.filter(o => o.status === 'on-the-way' || o.status === 'delivered');
                const breakfastRequests = packWithMealList.filter(o => (o.mealSlot || '').toLowerCase().includes('breakfast') || (o.notes || '').toLowerCase().includes('breakfast'));
                const lunchRequests = packWithMealList.filter(o => (o.mealSlot || '').toLowerCase().includes('lunch') || (o.notes || '').toLowerCase().includes('lunch'));
                const dinnerRequests = packWithMealList.filter(o => (o.mealSlot || '').toLowerCase().includes('dinner') || (o.notes || '').toLowerCase().includes('dinner'));

                const filteredRequests = packWithMealList
                  .filter(o => {
                    if (requestFilter === 'all') return true;
                    if (requestFilter === 'pending') return o.status !== 'delivered' && o.status !== 'cancelled' && o.status !== 'on-the-way';
                    if (requestFilter === 'breakfast') return (o.mealSlot || '').toLowerCase().includes('breakfast') || (o.notes || '').toLowerCase().includes('breakfast');
                    if (requestFilter === 'lunch') return (o.mealSlot || '').toLowerCase().includes('lunch') || (o.notes || '').toLowerCase().includes('lunch');
                    if (requestFilter === 'dinner') return (o.mealSlot || '').toLowerCase().includes('dinner') || (o.notes || '').toLowerCase().includes('dinner');
                    if (requestFilter === 'dispatched') return o.status === 'on-the-way' || o.status === 'delivered';
                    return true;
                  })
                  .filter(o => {
                    if (!requestSearch) return true;
                    const q = requestSearch.toLowerCase();
                    const orderIdStr = (o.orderId || o._id || '').toLowerCase();
                    const name = (o.customerName || '').toLowerCase();
                    const addr = (o.deliveryAddress || '').toLowerCase();
                    const itemsStr = (o.items || []).map((it: any) => it.name || '').join(' ').toLowerCase();
                    return orderIdStr.includes(q) || name.includes(q) || addr.includes(q) || itemsStr.includes(q);
                  });

                return (
                  <div className="space-y-5">
                    {/* 4 Metric Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
                          <span>Total Pack Requests</span>
                          <span className="p-1.5 rounded-lg bg-orange-50 text-orange-600"><Package size={15} /></span>
                        </div>
                        <h4 className="text-2xl font-black text-slate-900 mt-2">{packWithMealList.length}</h4>
                        <p className="text-[11px] text-slate-500 font-semibold mt-1">Requested bundled with meals</p>
                      </div>

                      <div className="bg-white border border-amber-200 rounded-2xl p-4 shadow-xs bg-amber-50/30">
                        <div className="flex items-center justify-between text-xs font-bold text-amber-700 uppercase">
                          <span>Pending Approval</span>
                          <span className="p-1.5 rounded-lg bg-amber-100 text-amber-700"><Clock size={15} /></span>
                        </div>
                        <h4 className="text-2xl font-black text-amber-900 mt-2 flex items-center gap-2">
                          {pendingRequests.length}
                          {pendingRequests.length > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500 text-white font-black animate-pulse">Action Required</span>
                          )}
                        </h4>
                        <p className="text-[11px] text-amber-800 font-bold mt-1">Direct Rider Claim blocked</p>
                      </div>

                      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
                          <span>Lunch Tiffin Extras</span>
                          <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600"><Sun size={15} /></span>
                        </div>
                        <h4 className="text-2xl font-black text-slate-900 mt-2">{lunchRequests.length}</h4>
                        <p className="text-[11px] text-amber-700 font-bold mt-1">Pack in 12:30 PM Lunch Box</p>
                      </div>

                      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
                          <span>Dinner Tiffin Extras</span>
                          <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600"><Moon size={15} /></span>
                        </div>
                        <h4 className="text-2xl font-black text-slate-900 mt-2">{dinnerRequests.length}</h4>
                        <p className="text-[11px] text-purple-700 font-bold mt-1">Pack in 7:30 PM Dinner Box</p>
                      </div>
                    </div>

                    {/* Information Banner */}
                    <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                          <Package size={20} />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-amber-950 flex items-center gap-2">
                            <span>Admin-Controlled Meal Pack Requests</span>
                            <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-bold">Rider Direct Claim Blocked</span>
                          </h4>
                          <p className="text-xs text-amber-900/80 mt-0.5 max-w-3xl">
                            When subscribers order add-ons with <strong>"Pack with Meal"</strong>, the request arrives here. Riders cannot pick these up as solo deliveries. Admin verifies the request, assigns the delivery rider, and dispatches it bundled directly with the student's scheduled meal tiffin.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setExtrasActiveTab('orders')}
                        className="text-xs font-bold text-amber-800 hover:text-amber-950 underline shrink-0 cursor-pointer"
                      >
                        View All Extra Orders →
                      </button>
                    </div>

                    {/* Filter & Search Bar */}
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setRequestFilter('pending')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                              requestFilter === 'pending'
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                            }`}
                          >
                            <span>⏳ Pending Action ({pendingRequests.length})</span>
                            {pendingRequests.length > 0 && (
                              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => setRequestFilter('all')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                              requestFilter === 'all'
                                ? 'bg-orange-500 text-white shadow-xs'
                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                            }`}
                          >
                            All Requests ({packWithMealList.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => setRequestFilter('breakfast')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                              requestFilter === 'breakfast'
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                            }`}
                          >
                            <span>🌅</span> Breakfast ({breakfastRequests.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => setRequestFilter('lunch')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                              requestFilter === 'lunch'
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                            }`}
                          >
                            <Sun size={12} /> Lunch ({lunchRequests.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => setRequestFilter('dinner')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                              requestFilter === 'dinner'
                                ? 'bg-purple-600 text-white shadow-xs'
                                : 'bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100'
                            }`}
                          >
                            <Moon size={12} /> Dinner ({dinnerRequests.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => setRequestFilter('dispatched')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                              requestFilter === 'dispatched'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                            }`}
                          >
                            <CheckCircle2 size={12} /> Dispatched ({dispatchedRequests.length})
                          </button>
                        </div>

                        {/* Search Input */}
                        <div className="relative w-full sm:w-64">
                          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Search student, items, order ID..."
                            value={requestSearch}
                            onChange={(e) => setRequestSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                      </div>

                      {/* Request Cards List */}
                      {filteredRequests.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl space-y-2">
                          <Package size={36} className="mx-auto text-slate-300" />
                          <h4 className="text-sm font-black text-slate-700">No Meal Pack Requests in this filter</h4>
                          <p className="text-xs text-slate-400 max-w-sm mx-auto">
                            {requestFilter === 'pending'
                              ? 'All student pack-with-meal requests have been processed and dispatched!'
                              : 'Try selecting a different filter or search term.'}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {filteredRequests.map((order: any) => {
                            const orderId = order.orderId || order._id || 'ORD-REQ';
                            const isDispatched = order.status === 'on-the-way' || order.status === 'delivered';
                            const isLunch = (order.mealSlot || '').toLowerCase().includes('lunch') || 
                                            (order.attachedMealSlot || '').toLowerCase().includes('lunch') || 
                                            (order.notes || '').toLowerCase().includes('lunch');
                            const targetSlot = isLunch ? 'lunch' : 'dinner';
                            const mealLabel = isLunch ? 'Lunch Tiffin (12:30 PM)' : 'Dinner Tiffin (7:30 PM)';

                            // Try to match student to dispatch roster tiffin box
                            const studentNameClean = (order.customerName || '').toLowerCase().trim();
                            
                            // Step 1: Match student AND exact meal slot (Lunch vs Dinner)
                            let matchedTiffin = dispatchRoster.find(d => {
                              const tSlot = (d.slot || d.mealSlot || '').toLowerCase();
                              if (!tSlot.includes(targetSlot)) return false;

                              const s = (d.student || d.studentName || '').toLowerCase().trim();
                              if (studentNameClean && (s.includes(studentNameClean) || studentNameClean.includes(s))) return true;
                              if (order.userId && d.userId && String(order.userId) === String(d.userId)) return true;
                              if (order.customerPhone && d.phone && (d.phone.includes(order.customerPhone) || order.customerPhone.includes(d.phone))) return true;
                              return false;
                            });

                            // Step 2: Fallback to any tiffin for that student if slot not matched
                            if (!matchedTiffin) {
                              matchedTiffin = dispatchRoster.find(d => {
                                const s = (d.student || d.studentName || '').toLowerCase().trim();
                                if (studentNameClean && (s.includes(studentNameClean) || studentNameClean.includes(s))) return true;
                                if (order.userId && d.userId && String(order.userId) === String(d.userId)) return true;
                                return false;
                              });
                            }

                            // Extract rider assigned to the student's meal in dispatch roster
                            let rawMealRider = matchedTiffin?.assignedRider || matchedTiffin?.rider || '';

                            // If tiffin has no direct rider yet, check if student's delivery zone has an assigned rider
                            if (!rawMealRider || rawMealRider === 'Unassigned' || rawMealRider.includes('Pending')) {
                              const tZone = (matchedTiffin?.zoneCode || matchedTiffin?.zone || '').toUpperCase();
                              if (tZone) {
                                const zMatch = deliveryZones.find(z => (z.zoneCode || z.name || '').toUpperCase() === tZone);
                                if (zMatch?.assignedRider) {
                                  rawMealRider = zMatch.assignedRider;
                                }
                              }
                            }

                            // Clean up rider name to match fleet rider list if needed
                            const matchedRiderObj = riders.find(r => 
                              rawMealRider && (
                                rawMealRider === r.name || 
                                rawMealRider.includes(r.name) || 
                                r.name.includes(rawMealRider.split('(')[0].trim())
                              )
                            );
                            const cleanMealRider = matchedRiderObj 
                              ? matchedRiderObj.name 
                              : (rawMealRider && rawMealRider !== 'Unassigned' && !rawMealRider.includes('Pending') 
                                  ? rawMealRider.split('(')[0].trim() 
                                  : '');

                            // Assigned rider: Meal me jo assign hoga wahi Pack with Meal Request me hoga!
                            const resolvedRiderRaw =
                              requestRiderSelection[orderId] ||
                              cleanMealRider ||
                              (order.deliveryPartner?.name && !order.deliveryPartner.name.includes('Unassigned') && !order.deliveryPartner.name.includes('Pending') ? order.deliveryPartner.name : '');
                            const currentRiderName = (resolvedRiderRaw || '').split('(')[0].trim();

                            return (
                              <div
                                key={orderId}
                                className={`rounded-2xl border transition shadow-xs overflow-hidden ${
                                  isDispatched
                                    ? 'bg-slate-50/50 border-slate-200'
                                    : 'bg-white border-amber-300 ring-1 ring-amber-200/70 hover:shadow-md'
                                }`}
                              >
                                {/* Card Header */}
                                <div className={`px-4 py-3 border-b flex flex-wrap items-center justify-between gap-2 ${
                                  isDispatched ? 'bg-slate-100/60 border-slate-200' : 'bg-amber-50/60 border-amber-200'
                                }`}>
                                  <div className="flex items-center gap-2.5 flex-wrap">
                                    <span className="font-mono text-xs font-black text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                                      #{orderId}
                                    </span>
                                    <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                                      isLunch ? 'bg-amber-100 text-amber-900 border border-amber-200' : 'bg-purple-100 text-purple-900 border border-purple-200'
                                    }`}>
                                      {isLunch ? <Sun size={12} /> : <Moon size={12} />}
                                      <span>Pack with {mealLabel}</span>
                                    </span>
                                    {order.createdAt && (
                                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                                        <Clock size={11} /> {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {isDispatched ? (
                                      <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                        <CheckCircle2 size={12} /> {order.status === 'delivered' ? 'Delivered with Meal' : 'Dispatched with Meal'}
                                      </span>
                                    ) : (
                                      <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 animate-pulse">
                                        <Clock size={12} /> Action Required (Admin Assign &amp; Dispatch)
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Card Body */}
                                <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                                  {/* Col 1: Student Details */}
                                  <div className="space-y-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subscriber Student</span>
                                    <div className="flex items-start gap-2.5">
                                      <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 font-black text-xs flex items-center justify-center shrink-0">
                                        {(order.customerName || 'S').charAt(0).toUpperCase()}
                                      </div>
                                      <div>
                                        <h5 className="text-xs font-black text-slate-900 leading-snug">{order.customerName || 'Subscriber Member'}</h5>
                                        {order.customerPhone && (
                                          <p className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                                            <Phone size={10} /> {order.customerPhone}
                                          </p>
                                        )}
                                      </div>
                                    </div>

                                    <div className="text-[11px] text-slate-600 bg-slate-50 rounded-xl p-2 border border-slate-200/70">
                                      <div className="flex items-start gap-1 text-slate-700">
                                        <MapPin size={12} className="shrink-0 mt-0.5 text-slate-400" />
                                        <span>{order.deliveryAddress || 'Hostel Delivery'}</span>
                                      </div>
                                      {matchedTiffin && (
                                        <div className="mt-1.5 pt-1.5 border-t border-slate-200/60 text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                                          <Package size={11} /> Linked Tiffin: #{matchedTiffin.tiffinNumber || matchedTiffin.tiffinId || 'Box'} ({matchedTiffin.status || 'Active'})
                                        </div>
                                      )}
                                    </div>

                                    {order.notes && (
                                      <p className="text-[10px] text-amber-800 bg-amber-50 rounded-lg px-2 py-1 border border-amber-200">
                                        <strong>Note:</strong> {order.notes}
                                      </p>
                                    )}
                                  </div>

                                  {/* Col 2: Ordered Extra Add-ons */}
                                  <div className="pt-3 md:pt-0 md:pl-4 space-y-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Requested Add-ons</span>
                                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                                      {(order.items || []).map((item: any, idx: number) => (
                                        <div key={idx} className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded-xl border border-slate-100">
                                          <div className="flex items-center gap-1.5">
                                            <span className="font-bold text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded text-[10px]">
                                              {item.quantity || 1}x
                                            </span>
                                            <span className="font-bold text-slate-800">{item.name}</span>
                                          </div>
                                          <span className="font-black text-slate-700">₹{(item.price || 0) * (item.quantity || 1)}</span>
                                        </div>
                                      ))}
                                    </div>

                                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                                      <span className="text-[11px] font-bold text-slate-500">Order Total:</span>
                                      <span className="text-sm font-black text-slate-900">₹{order.totalAmount || 0}</span>
                                    </div>
                                    <div className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                                      <CheckCircle2 size={11} /> Debited from Student Wallet
                                    </div>
                                  </div>

                                  {/* Col 3: Rider Assignment & Dispatch */}
                                  <div className="pt-3 md:pt-0 md:pl-4 space-y-2.5 flex flex-col justify-between">
                                    <div>
                                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assign Meal Rider</span>
                                      <div className="mt-1 space-y-1.5">
                                        <div className="text-[11px] text-slate-600 flex items-center justify-between">
                                          <span className="font-semibold">Assigned Rider:</span>
                                          <span className="font-bold text-slate-900">{currentRiderName || 'Not Assigned'}</span>
                                        </div>

                                        <select
                                          value={currentRiderName}
                                          onChange={(e) => {
                                            const selectedVal = e.target.value;
                                            setRequestRiderSelection(prev => ({ ...prev, [orderId]: selectedVal }));
                                          }}
                                          className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                                        >
                                          <option value="">-- Choose Rider --</option>
                                          {riders.map((r: any) => (
                                            <option key={r.id || r._id || r.name} value={r.name}>
                                              {r.name} ({r.vehicle || 'Scooter'})
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                    </div>

                                    <div className="space-y-1.5 pt-2">
                                      <button
                                        type="button"
                                        onClick={() => handleSendExtraWithMeal(order, currentRiderName)}
                                        className={`w-full py-2.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer ${
                                          isDispatched
                                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                            : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white active:scale-95 shadow-orange-500/20'
                                        }`}
                                      >
                                        <span>🚀</span>
                                        <span>
                                          {isDispatched
                                            ? `Dispatched with ${isLunch ? 'Lunch' : 'Dinner'} (Update)`
                                            : `Approve & Send with ${isLunch ? 'Lunch' : 'Dinner'}`}
                                        </span>
                                      </button>

                                      <p className="text-[10px] text-center text-slate-400">
                                        Assigns rider and syncs with student's daily tiffin box checklist.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* ── VIEW 1: LIVE EXTRA ORDERS TABLE ── */}
              {extrasActiveTab === 'orders' && (() => {
                const filteredExtraOrders = extraOrdersList
                  .filter(o => {
                    if (extraOrdersStatusFilter === 'all') return true;
                    if (extraOrdersStatusFilter === 'confirmed') return o.status === 'confirmed';
                    if (extraOrdersStatusFilter === 'preparing') return o.status === 'preparing';
                    if (extraOrdersStatusFilter === 'delivered') return o.status === 'delivered';
                    if (extraOrdersStatusFilter === 'pack_with_meal') return Boolean(o.deliverWithMeal);
                    return true;
                  })
                  .filter(o => {
                    if (!extraOrdersSearch) return true;
                    const q = extraOrdersSearch.toLowerCase();
                    const orderIdStr = (o.orderId || o._id || '').toLowerCase();
                    const name = (o.customerName || '').toLowerCase();
                    const addr = (o.deliveryAddress || '').toLowerCase();
                    const itemsStr = (o.items || []).map((it: any) => it.name || '').join(' ').toLowerCase();
                    return orderIdStr.includes(q) || name.includes(q) || addr.includes(q) || itemsStr.includes(q);
                  });

                const breakfastExtrasCount = extraOrdersList.filter(o => (o.mealSlot || '').toLowerCase().includes('breakfast') || (o.notes || '').toLowerCase().includes('breakfast')).length;
                const lunchExtrasCount = extraOrdersList.filter(o => (o.mealSlot || '').toLowerCase().includes('lunch') || (o.notes || '').toLowerCase().includes('lunch')).length;
                const dinnerExtrasCount = extraOrdersList.filter(o => (o.mealSlot || '').toLowerCase().includes('dinner') || (o.notes || '').toLowerCase().includes('dinner')).length;
                const totalRevenue = extraOrdersList.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
                const packWithMealList = extraOrdersList.filter(o => o.deliverWithMeal);
                const packWithMealPending = packWithMealList.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');

                return (
                  <div className="space-y-5">
                    {/* 4 Extra Order Metric Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
                          <span>Total Extra Orders</span>
                          <span className="p-1.5 rounded-lg bg-orange-50 text-orange-600"><ShoppingBag size={15} /></span>
                        </div>
                        <h4 className="text-2xl font-black text-slate-900 mt-2">{extraOrdersList.length}</h4>
                        <p className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                          <CheckCircle2 size={12} /> Placed via Student Dashboard
                        </p>
                      </div>

                      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
                          <span>Add-ons Revenue</span>
                          <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600"><DollarSign size={15} /></span>
                        </div>
                        <h4 className="text-2xl font-black text-slate-900 mt-2">₹{totalRevenue.toLocaleString('en-IN')}</h4>
                        <p className="text-[11px] text-slate-500 font-semibold mt-1">Directly debited from Student Wallet</p>
                      </div>

                      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
                          <span>Lunch Tiffin Extras</span>
                          <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600"><Sun size={15} /></span>
                        </div>
                        <h4 className="text-2xl font-black text-slate-900 mt-2">{lunchExtrasCount}</h4>
                        <p className="text-[11px] text-amber-700 font-bold mt-1">Pack in 12:30 PM Lunch Boxes</p>
                      </div>

                      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
                          <span>Dinner Tiffin Extras</span>
                          <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600"><Moon size={15} /></span>
                        </div>
                        <h4 className="text-2xl font-black text-slate-900 mt-2">{dinnerExtrasCount}</h4>
                        <p className="text-[11px] text-purple-700 font-bold mt-1">Pack in 7:30 PM Dinner Boxes</p>
                      </div>
                    </div>

                    {/* Table Container */}
                    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
                      {/* Search & Filter Header */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => setExtraOrdersStatusFilter('all')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                              extraOrdersStatusFilter === 'all'
                                ? 'bg-orange-500 text-white shadow-xs'
                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                            }`}
                          >
                            All ({extraOrdersList.length})
                          </button>
                          <button
                            onClick={() => setExtraOrdersStatusFilter('pack_with_meal')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                              extraOrdersStatusFilter === 'pack_with_meal'
                                ? 'bg-purple-600 text-white shadow-xs'
                                : 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100'
                            }`}
                          >
                            <span>📦 Pack with Meal ({packWithMealList.length})</span>
                            {packWithMealPending.length > 0 && (
                              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                            )}
                          </button>
                          <button
                            onClick={() => setExtraOrdersStatusFilter('confirmed')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                              extraOrdersStatusFilter === 'confirmed'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}
                          >
                            Confirmed ({extraOrdersList.filter(o => o.status === 'confirmed').length})
                          </button>
                          <button
                            onClick={() => setExtraOrdersStatusFilter('preparing')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                              extraOrdersStatusFilter === 'preparing'
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            Preparing ({extraOrdersList.filter(o => o.status === 'preparing').length})
                          </button>
                          <button
                            onClick={() => setExtraOrdersStatusFilter('delivered')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                              extraOrdersStatusFilter === 'delivered'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            Delivered ({extraOrdersList.filter(o => o.status === 'delivered').length})
                          </button>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <div className="relative flex-1 sm:w-64">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="text"
                              value={extraOrdersSearch}
                              onChange={e => setExtraOrdersSearch(e.target.value)}
                              placeholder="Search student, room, item..."
                              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-orange-500 shadow-2xs"
                            />
                            {extraOrdersSearch && (
                              <button onClick={() => setExtraOrdersSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                <X size={12} />
                              </button>
                            )}
                          </div>

                          <button
                            onClick={async () => {
                              try {
                                setSyncing(true);
                                const res = await adminAPI.getOrders();
                                if (res?.orders) setLiveOrders(res.orders);
                                showToast('Live extra orders refreshed!');
                              } catch {
                                showToast('Failed to refresh orders', 'error');
                              } finally {
                                setSyncing(false);
                              }
                            }}
                            className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition cursor-pointer shrink-0"
                            title="Refresh orders"
                          >
                            <RotateCcw size={14} className={syncing ? 'animate-spin text-orange-500' : ''} />
                          </button>
                        </div>
                      </div>

                      {/* 📦 Pack with Meal Requests Notification Banner (Admin Action Required) */}
                      {packWithMealPending.length > 0 && (
                        <div className="bg-gradient-to-r from-purple-50 via-amber-50 to-orange-50 border border-purple-200/90 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black text-lg shrink-0 shadow-md shadow-purple-600/20">
                              📦
                            </div>
                            <div>
                              <h5 className="font-extrabold text-xs text-slate-900 flex items-center gap-2">
                                <span>{packWithMealPending.length} Subscriber Pack-with-Meal Request{packWithMealPending.length > 1 ? 's' : ''} Received</span>
                                <span className="text-[10px] bg-rose-500 text-white px-2 py-0.5 rounded-full font-black animate-pulse">Admin Action Needed</span>
                              </h5>
                              <p className="text-[11px] text-slate-600 mt-0.5">
                                Subscribers have requested these extra add-ons to be delivered with their Lunch/Dinner Tiffins. Assign rider and click "Send with Meal" to dispatch with tiffins.
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setExtraOrdersStatusFilter('pack_with_meal')}
                            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black transition shadow-sm hover:shadow-md shrink-0 cursor-pointer"
                          >
                            View Meal Requests ({packWithMealPending.length}) →
                          </button>
                        </div>
                      )}

                      {/* Orders Table */}
                      {filteredExtraOrders.length === 0 ? (
                        <div className="py-16 text-center text-slate-500">
                          <ShoppingBag size={42} className="text-slate-300 mx-auto mb-2" />
                          <p className="font-bold text-slate-700">No extra orders found</p>
                          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                            When students add extra rotis, gulab jamun or lassi from their dashboard, they will appear here instantly for kitchen preparation.
                          </p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-black tracking-wider bg-slate-50/50">
                                <th className="py-3 px-4">Order ID &amp; Time</th>
                                <th className="py-3 px-4">Student &amp; Hostel Address</th>
                                <th className="py-3 px-4">Tiffin Delivery Slot</th>
                                <th className="py-3 px-4">Extra Items To Pack</th>
                                <th className="py-3 px-4">Amount &amp; Payment</th>
                                <th className="py-3 px-4">
                                  <span className="flex items-center gap-1">
                                    <Bike size={11} className="text-orange-500" />
                                    Rider (Admin Assigns)
                                  </span>
                                </th>
                                <th className="py-3 px-4">Kitchen Status</th>
                                <th className="py-3 px-4 text-right">Update Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {filteredExtraOrders.map(order => {
                                const statusColors: Record<string, string> = {
                                  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
                                  preparing: 'bg-amber-50 text-amber-700 border-amber-200',
                                  'on-the-way': 'bg-purple-50 text-purple-700 border-purple-200',
                                  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                                  cancelled: 'bg-rose-50 text-rose-700 border-rose-200'
                                };

                                const matchedSub = getSubscriberForOrder(order);
                                const isBreakfast = (order.mealSlot || '').toLowerCase().includes('breakfast') || (order.notes || '').toLowerCase().includes('breakfast');
                                const isLunch = (order.mealSlot || '').toLowerCase().includes('lunch') || (order.notes || '').toLowerCase().includes('lunch');
                                const isDinner = (order.mealSlot || '').toLowerCase().includes('dinner') || (order.notes || '').toLowerCase().includes('dinner');

                                return (
                                  <tr key={order._id || order.orderId} className="hover:bg-amber-50/30 transition">
                                    <td className="py-3.5 px-4 font-mono font-black text-orange-600">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span>#{order.orderId || (order._id ? order._id.slice(-6).toUpperCase() : 'ORD')}</span>
                                        <span className="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                                          🥟 Extra Add-on
                                        </span>
                                        {order.deliverWithMeal && (
                                          <span className="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-purple-100 text-purple-900 border border-purple-300 flex items-center gap-0.5">
                                            📦 Pack with Meal
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-[10px] text-slate-400 font-sans font-normal mt-0.5">
                                        {order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'}
                                      </div>
                                    </td>

                                    <td className="py-3.5 px-4">
                                      <p className="font-bold text-slate-900">{order.customerName || 'Student'}</p>
                                      <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                                        <MapPin size={11} className="text-slate-400 shrink-0" />
                                        <span>{order.deliveryAddress || 'Hostel Delivery'}</span>
                                      </p>
                                      <p className="text-[10px] text-slate-400 mt-0.5">{order.customerPhone || ''}</p>
                                      {matchedSub && (
                                        <button
                                          type="button"
                                          onClick={() => handleOpenSubscriberOrders(matchedSub)}
                                          className="mt-1 inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-100/70 text-amber-900 border border-amber-300 hover:bg-amber-200 cursor-pointer transition-colors"
                                        >
                                          <Star size={9} className="text-amber-600 fill-amber-500" />
                                          <span>{matchedSub.planId?.name || 'Standard'} Member</span>
                                        </button>
                                      )}
                                    </td>

                                    <td className="py-3.5 px-4">
                                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-black text-xs border ${
                                        order.deliverWithMeal ? 'bg-purple-50 border-purple-200 text-purple-900' : 'bg-orange-50 border-orange-200 text-orange-800'
                                      }`}>
                                        {isDinner ? <Moon size={12} className={order.deliverWithMeal ? 'text-purple-600' : 'text-orange-600'} /> : isBreakfast ? <span className="text-xs">🌅</span> : <Sun size={12} className={order.deliverWithMeal ? 'text-purple-600' : 'text-orange-600'} />}
                                        <span>{order.mealSlot || (isBreakfast ? 'Breakfast' : isDinner ? 'Dinner Tiffin' : isLunch ? 'Lunch Tiffin' : 'Tiffin Box')}</span>
                                      </div>
                                      <p className={`text-[10px] font-bold mt-1 ${order.deliverWithMeal ? 'text-purple-700' : 'text-slate-500'}`}>
                                        {order.deliverWithMeal ? '📦 Pack inside tiffin box' : '⚡ Direct delivery'}
                                      </p>
                                    </td>

                                    <td className="py-3.5 px-4 max-w-xs">
                                      <div className="space-y-1.5">
                                        {order.items?.map((it: any, idx: number) => (
                                          <div key={idx} className="flex items-center gap-2 p-1.5 rounded-xl bg-amber-50/60 border border-amber-200/70">
                                            {it.image && (
                                              <img src={it.image} alt={it.name} className="w-8 h-8 rounded-lg object-cover shrink-0 border border-amber-200" />
                                            )}
                                            <div className="min-w-0">
                                              <p className="text-xs font-black text-slate-900 leading-tight">
                                                <span className="text-orange-600">{it.quantity || 1}x</span> {it.name}
                                              </p>
                                              <p className="text-[10px] text-slate-500 font-bold">₹{it.price} each</p>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                      {order.notes && (
                                        <p className="text-[10px] text-amber-800 italic mt-1 bg-amber-100/40 px-2 py-0.5 rounded-md border border-amber-200/50">
                                          Note: {order.notes}
                                        </p>
                                      )}
                                    </td>

                                    <td className="py-3.5 px-4">
                                      <span className="font-black text-slate-900 text-sm">₹{order.totalAmount || 0}</span>
                                      <div className="mt-1">
                                        {order.paymentMethod?.includes('Wallet') ? (
                                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 inline-flex items-center gap-1">
                                            <Wallet size={10} /> Wallet (Paid)
                                          </span>
                                        ) : (
                                          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                                            ✓ {order.paymentMethod || 'Paid'}
                                          </span>
                                        )}
                                      </div>
                                    </td>

                                    {/* ── RIDER ASSIGNMENT (Admin only — deliver with meal) ── */}
                                    <td className="py-3.5 px-4 min-w-[170px]">
                                      {order.status === 'delivered' ? (
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                                          <CheckCircle2 size={11} />
                                          <span>{order.deliveryPartner?.name || 'Delivered'}</span>
                                        </div>
                                      ) : (
                                        <div className="space-y-1.5">
                                          {/* Current rider badge */}
                                          {order.deliveryPartner?.name && order.deliveryPartner.name !== 'Unassigned' && !order.deliveryPartner.name.includes('Pending') && order.deliveryPartner.name !== 'Hostel Tiffin Dabbawala' ? (
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                                              <Bike size={10} className="text-emerald-600" />
                                              <span>{order.deliveryPartner.name}</span>
                                            </div>
                                          ) : (
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                                              <AlertTriangle size={10} className="text-amber-500" />
                                              <span>Rider Pending</span>
                                            </div>
                                          )}
                                          {/* Rider dropdown — Admin assigns */}
                                          <select
                                            value={order.deliveryPartner?.name || 'Unassigned'}
                                            onChange={e => handleAssignExtraOrderRider(order.orderId || order._id, e.target.value)}
                                            className="w-full text-[10px] font-bold border border-orange-300 rounded-lg px-2 py-1.5 bg-white text-slate-800 focus:outline-none focus:border-orange-500 shadow-2xs cursor-pointer"
                                            title="Admin: assign rider to deliver this with tiffin"
                                          >
                                            <option value="Unassigned">🚴 Select Rider (Admin)</option>
                                            {riders.filter(r => r.status !== 'offline').map(r => (
                                              <option key={r.id} value={r.name}>
                                                {r.name} ({r.vehicle?.split(' ')[0] || 'Bike'})
                                              </option>
                                            ))}
                                            {riders.length === 0 && (
                                              <option value="">No Riders Available</option>
                                            )}
                                          </select>
                                          <p className="text-[9px] text-slate-400 font-semibold leading-tight">
                                            📦 Delivers with {order.mealSlot || 'Tiffin'}
                                          </p>
                                        </div>
                                      )}
                                    </td>

                                    <td className="py-3.5 px-4">
                                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase border ${statusColors[order.status] || 'bg-slate-100 text-slate-700'}`}>
                                        {order.status}
                                      </span>
                                    </td>

                                    <td className="py-3.5 px-4 text-right">
                                      <div className="flex flex-col items-end gap-1.5">
                                        {/* 🚀 Dedicated Admin Action: Send with Meal */}
                                        {order.deliverWithMeal && order.status !== 'delivered' && order.status !== 'cancelled' && (
                                          <button
                                            type="button"
                                            onClick={() => handleSendExtraWithMeal(order)}
                                            className={`w-full px-2.5 py-1.5 rounded-xl font-black text-[10px] transition flex items-center justify-center gap-1 shadow-xs cursor-pointer ${
                                              order.status === 'on-the-way'
                                                ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                                                : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/20 active:scale-95'
                                            }`}
                                            title={`Admin: Approve & send extra items bundled with ${order.mealSlot || 'Meal'}`}
                                          >
                                            <span>🚀</span>
                                            <span>{order.status === 'on-the-way' ? 'Dispatched with Meal' : `Send with ${order.mealSlot ? order.mealSlot.replace('Tiffin', '').trim() : 'Meal'}`}</span>
                                          </button>
                                        )}

                                        <select
                                          value={order.status}
                                          onChange={e => handleUpdateOrderStatus(order.orderId || order._id, e.target.value)}
                                          className="text-xs font-bold border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-800 focus:outline-none focus:border-orange-500 shadow-2xs cursor-pointer"
                                        >
                                          <option value="confirmed">Confirmed</option>
                                          <option value="preparing">Preparing / Cooking</option>
                                          <option value="on-the-way">On The Way (Rider)</option>
                                          <option value="delivered">Delivered</option>
                                          <option value="cancelled">Cancelled</option>
                                        </select>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* ── VIEW 2: ADD-ONS MENU & PRICING CATALOG ── */}
              {extrasActiveTab === 'catalog' && (
                <div>
                  {extras.length === 0 ? (
                    <div className="bg-white border border-slate-200/90 rounded-3xl p-10 text-center space-y-4 shadow-xs">
                      <div className="w-16 h-16 rounded-3xl bg-orange-50 text-orange-500 flex items-center justify-center mx-auto text-2xl shadow-inner">
                        <Utensils size={32} />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-900">No Extra Add-on Items in Menu</h3>
                        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                          Add extra sides like butter rotis, gulab jamun, lassi, or fresh paneer that students can bundle directly with their tiffin.
                        </p>
                      </div>
                      <div className="flex items-center justify-center gap-3 pt-2">
                        <button
                          onClick={openNewExtraModal}
                          className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus size={16} /> Add First Add-on Item
                        </button>
                        <button
                          onClick={() => setExtras(DEFAULT_EXTRAS)}
                          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                        >
                          Load Recommended Add-ons
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {extras.map(extra => (
                        <div
                          key={extra._id}
                          className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                        >
                          <div>
                            <div className="w-full h-28 rounded-xl overflow-hidden bg-slate-100 mb-3">
                              <img
                                src={extra.imageUrl}
                                alt={extra.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/10860591/pexels-photo-10860591.jpeg?auto=compress&cs=tinysrgb&w=150';
                                }}
                              />
                            </div>
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  {extra.category}
                                </span>
                                <h4 className="font-extrabold text-slate-900 text-sm">{extra.name}</h4>
                              </div>
                              <span className="font-black text-orange-600 text-base">₹{extra.price}</span>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-slate-100 mt-3 flex justify-between items-center">
                            <span
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                extra.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {extra.isActive ? 'In Stock' : 'Out of Stock'}
                            </span>
                            <div className="flex gap-1">
                              <button
                                onClick={() => openEditExtraModal(extra)}
                                className="p-1.5 text-slate-500 hover:text-orange-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                                title="Edit Item"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteExtra(extra._id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                                title="Delete Item"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              7. TAB: STUDENT SUBSCRIPTIONS & MEMBERSHIPS (EXPANDED)
          ══════════════════════════════════════════════════════════ */}
          {activeTab === 'subscribers' && (
            <div className="space-y-6">
              {/* Header with Subscribe New Student CTA */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Users size={22} className="text-orange-500" /> Student Subscriptions & Memberships
                  </h2>
                  <p className="text-xs text-slate-500">
                    Live subscriber rosters, meal balances, manual student enrollment, extensions & renewals
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={openSubscribeModal}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
                  >
                    <Plus size={16} /> Subscribe New Student
                  </button>
                </div>
              </div>

              {/* 4 Core Subscription Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Memberships</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">
                    {subscribers.filter(s => s.status === 'active').length} Students
                  </p>
                  <span className="text-[11px] text-emerald-600 font-bold mt-1 inline-block">100% Hostel Delivery</span>
                </div>
                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Monthly Run-Rate (MRR)</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">
                    ₹{subscribers.filter(s => s.status === 'active').reduce((sum, s) => sum + (s.amountPaid || 0), 0).toLocaleString('en-IN')}
                  </p>
                  <span className="text-[11px] text-orange-600 font-bold mt-1 inline-block">Recurring Mess Revenue</span>
                </div>
                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expiring in 7 Days</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">
                    {subscribers.filter(s => {
                      const diff = (new Date(s.endDate).getTime() - Date.now()) / (1000 * 3600 * 24);
                      return diff >= 0 && diff <= 7;
                    }).length} Students
                  </p>
                  <span className="text-[11px] text-amber-600 font-bold mt-1 inline-block">Renewals Due</span>
                </div>
                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Paused Members</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">
                    {subscribers.filter(s => s.status === 'paused').length} On Leave
                  </p>
                  <span className="text-[11px] text-slate-500 font-bold mt-1 inline-block">Exams / Travel Hold</span>
                </div>
              </div>

              {/* Filtering Toolbar */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-4">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  {/* Status Pills */}
                  <div className="flex flex-wrap gap-1.5">
                    {(['All', 'active', 'paused', 'expired', 'cancelled'] as const).map(tab => {
                      const count = tab === 'All' ? subscribers.length : subscribers.filter(s => s.status === tab).length;
                      return (
                        <button
                          key={tab}
                          onClick={() => setSubFilter(tab)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition capitalize cursor-pointer flex items-center gap-1.5 ${
                            subFilter === tab
                              ? 'bg-orange-500 text-white shadow-xs'
                              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                          }`}
                        >
                          <span>{tab}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${subFilter === tab ? 'bg-white/20' : 'bg-slate-200 text-slate-700'}`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Dropdown Filters */}
                  <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                    <select
                      value={subPlanFilter}
                      onChange={e => setSubPlanFilter(e.target.value)}
                      className="px-3 py-1.5 bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500"
                    >
                      <option value="All">All Meal Plans</option>
                      <option value="Basic">Basic Plans</option>
                      <option value="Standard">Standard Plans</option>
                      <option value="Premium">Premium Plans</option>
                    </select>

                    <select
                      value={subZoneFilter}
                      onChange={e => setSubZoneFilter(e.target.value)}
                      className="px-3 py-1.5 bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500"
                    >
                      <option value="All">All Delivery Zones</option>
                      {deliveryZones.map(z => (
                        <option key={z.id} value={z.code}>
                          {z.name} ({z.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Subscriptions Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-y border-slate-100">
                      <tr>
                        <th className="py-3 px-4">Student & Contact</th>
                        <th className="py-3 px-4">Hostel & Room (Zone)</th>
                        <th className="py-3 px-4">Plan & Billing</th>
                        <th className="py-3 px-4">Meals Balance</th>
                        <th className="py-3 px-4">Validity / Renewal</th>
                        <th className="py-3 px-4">Diet Preference</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Subscription Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {subscribers
                        .filter(s => subFilter === 'All' || s.status === subFilter)
                        .filter(s => subPlanFilter === 'All' || (s.planId?.name || '').toLowerCase().includes(subPlanFilter.toLowerCase()))
                        .filter(s => subZoneFilter === 'All' || s.zoneCode === subZoneFilter)
                        .filter(
                          s =>
                            !search ||
                            (s.userId?.name || '').toLowerCase().includes(search.toLowerCase()) ||
                            (s.userId?.email || '').toLowerCase().includes(search.toLowerCase()) ||
                            (s.userId?.phone || '').toLowerCase().includes(search.toLowerCase()) ||
                            (s.hostelAddress || '').toLowerCase().includes(search.toLowerCase()) ||
                            s._id.toLowerCase().includes(search.toLowerCase())
                        )
                        .map(sub => {
                          const daysLeft = Math.ceil((new Date(sub.endDate).getTime() - Date.now()) / (1000 * 3600 * 24));
                          const totalMealsCount = sub.totalMeals || (sub.billingCycle === 'semester' ? 360 : 60);
                          const mealsPercent = Math.min(Math.round(((sub.remainingMeals || 0) / totalMealsCount) * 100), 100);
                          const subOrders = getOrdersForSubscriber(sub);

                          return (
                            <tr key={sub._id} className="hover:bg-slate-50/60 transition">
                              {/* Student Info */}
                              <td className="py-3.5 px-4">
                                <div 
                                  onClick={() => handleOpenSubscriberDetail(sub)}
                                  className="flex items-center gap-2.5 cursor-pointer group"
                                  title="Click to view full individual subscriber details"
                                >
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-400 to-amber-500 text-white flex items-center justify-center font-black text-xs shrink-0 group-hover:scale-110 shadow-xs transition-transform">
                                    {(sub.userId?.name || 'S')[0]}
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors flex items-center gap-1">
                                      {sub.userId?.name || 'Student Member'}
                                      <ArrowUpRight size={11} className="text-slate-300 group-hover:text-orange-500 transition-colors" />
                                    </p>
                                    <p className="text-[11px] text-slate-400">{sub.userId?.email || 'student@campus.edu'}</p>
                                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                      <a
                                        href={`tel:${sub.userId?.phone || ''}`}
                                        onClick={e => e.stopPropagation()}
                                        className="text-[10px] text-orange-600 font-semibold hover:underline flex items-center gap-1"
                                      >
                                        <Phone size={10} />
                                        {sub.userId?.phone || ''}
                                      </a>
                                      <span className="text-slate-300">•</span>
                                      <button
                                        type="button"
                                        onClick={e => {
                                          e.stopPropagation();
                                          handleOpenSubscriberOrders(sub);
                                        }}
                                        className="text-[10px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 px-1.5 py-0.2 rounded-md inline-flex items-center gap-1 cursor-pointer transition-colors"
                                        title="Click to view all orders placed by this student"
                                      >
                                        <Package size={10} className="text-amber-600" />
                                        {subOrders.length} Order{subOrders.length === 1 ? '' : 's'}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Hostel & Zone */}
                              <td className="py-3.5 px-4 text-slate-700">
                                <div className="space-y-1">
                                  <span className="flex items-center gap-1 font-semibold text-slate-900">
                                    <MapPin size={12} className="text-orange-500 shrink-0" />
                                    {sub.hostelAddress || 'Hostel Room'}
                                  </span>
                                  {sub.zoneCode && (
                                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 border border-orange-200 inline-block">
                                      {sub.zoneCode}
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Plan & Amount */}
                              <td className="py-3.5 px-4">
                                <p className="font-bold text-orange-600">{sub.planId?.name || 'Standard Plan'}</p>
                                <p className="text-[11px] text-slate-500 capitalize">
                                  {sub.billingCycle} • ₹{(sub.amountPaid || 0).toLocaleString('en-IN')}
                                </p>
                                <span className="text-[10px] text-slate-400">{sub.paymentMethod || 'UPI'}</span>
                              </td>

                              {/* Meals Counter */}
                              <td className="py-3.5 px-4">
                                <p className="font-black text-slate-900">
                                  {sub.remainingMeals ?? 0} Meals Left
                                </p>
                                <div className="w-24 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                                  <div
                                    className={`h-1.5 rounded-full ${
                                      mealsPercent > 30 ? 'bg-orange-500' : 'bg-rose-500'
                                    }`}
                                    style={{ width: `${mealsPercent}%` }}
                                  />
                                </div>
                              </td>

                              {/* Expiry / Days Left */}
                              <td className="py-3.5 px-4">
                                <p className="font-medium text-slate-800">
                                  {new Date(sub.endDate).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </p>
                                <span
                                  className={`text-[10px] font-bold ${
                                    daysLeft < 0
                                      ? 'text-rose-600'
                                      : daysLeft <= 5
                                      ? 'text-amber-600'
                                      : 'text-emerald-600'
                                  }`}
                                >
                                  {daysLeft < 0 ? 'Expired' : `${daysLeft} Days Remaining`}
                                </span>
                              </td>

                              {/* Diet */}
                              <td className="py-3.5 px-4 text-slate-600">
                                <span className="text-[11px] bg-slate-50 px-2 py-1 rounded-md border border-slate-100 font-medium">
                                  {sub.dietPreference || 'Standard'}
                                </span>
                              </td>

                              {/* Status Badge */}
                              <td className="py-3.5 px-4">
                                <span
                                  className={`px-2.5 py-1 rounded-full font-extrabold uppercase text-[10px] ${
                                    sub.status === 'active'
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : sub.status === 'paused'
                                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                      : sub.status === 'expired'
                                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {sub.status}
                                </span>
                              </td>

                              {/* Action Buttons */}
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                  <button
                                    onClick={() => handleOpenSubscriberOrders(sub)}
                                    className="px-2.5 py-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-lg cursor-pointer text-[11px] flex items-center gap-1 shadow-2xs transition-all"
                                    title="View Subscriber's Complete Order History"
                                  >
                                    <History size={12} /> Orders ({subOrders.length})
                                  </button>
                                  <button
                                    onClick={() => handleOpenSubscriberDetail(sub)}
                                    className="px-2.5 py-1 bg-slate-900 hover:bg-black text-white font-bold rounded-lg cursor-pointer text-[11px] flex items-center gap-1 shadow-2xs transition-colors"
                                    title="View Individual Subscriber Details"
                                  >
                                    <Eye size={12} /> Details
                                  </button>
                                  <button
                                    onClick={() => handleTogglePause(sub._id)}
                                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer text-[11px]"
                                    title="Pause / Resume"
                                  >
                                    {sub.status === 'paused' ? 'Resume' : 'Pause'}
                                  </button>
                                  <button
                                    onClick={() => handleOpenExtend(sub)}
                                    className="px-2 py-1 bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold rounded-lg cursor-pointer text-[11px]"
                                    title="Add Extra Meals / Days"
                                  >
                                    + Meals
                                  </button>
                                  <button
                                    onClick={() => handleRenewSub(sub)}
                                    className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg cursor-pointer text-[11px]"
                                    title="Renew for next month"
                                  >
                                    Renew
                                  </button>
                                  <button
                                    onClick={() => handleCancelSub(sub._id)}
                                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                                    title="Cancel Membership"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              8. TAB: MEAL SKIP REQUESTS (WALLET REFUNDS)
          ══════════════════════════════════════════════════════════ */}
          {/* ══════════════════════════════════════════════════════════
              8. TAB: MEAL SKIP REQUESTS (FULL-STACK ADMIN SUITE)
          ══════════════════════════════════════════════════════════ */}
          {activeTab === 'skips' && (() => {
            const todayStr = new Date().toISOString().split('T')[0];
            const tomorrowDate = new Date();
            tomorrowDate.setDate(tomorrowDate.getDate() + 1);
            const tomorrowStr = tomorrowDate.toISOString().split('T')[0];

            // Filter skips based on current controls
            const displayedSkips = skipRequests.filter(skip => {
              const status = (skip.status || 'approved').toLowerCase();
              if (skipFilterStatus !== 'all') {
                if (skipFilterStatus === 'approved' && status !== 'approved') return false;
                if (skipFilterStatus === 'pending' && status !== 'pending') return false;
                if (skipFilterStatus === 'rejected' && status !== 'rejected') return false;
              }

              const meal = (skip.mealType || skip.meal || '').toLowerCase();
              if (skipFilterMeal === 'lunch' && !meal.includes('lunch')) return false;
              if (skipFilterMeal === 'dinner' && !meal.includes('dinner')) return false;

              if (skipFilterDate === 'today' && skip.date !== todayStr) return false;
              if (skipFilterDate === 'tomorrow' && skip.date !== tomorrowStr) return false;
              if (skipFilterDate === 'past' && skip.date >= todayStr) return false;

              if (skipSearchQuery.trim()) {
                const q = skipSearchQuery.toLowerCase();
                const match =
                  (skip.student || '').toLowerCase().includes(q) ||
                  (skip.hostel || '').toLowerCase().includes(q) ||
                  (skip.reason || '').toLowerCase().includes(q) ||
                  (skip.id || '').toLowerCase().includes(q) ||
                  (skip.date || '').toLowerCase().includes(q);
                if (!match) return false;
              }

              return true;
            });

            return (
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-6">
                {/* Header with Title & Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <RotateCcw className="text-orange-500" size={22} />
                      <span>Student Meal Skip Requests</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Live mess management, kitchen preparation forecasting, and automated meal quota rollover (+1 meal to balance)
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={handleSyncSkipsWithRoster}
                      disabled={skipSyncLoading}
                      className="flex-1 sm:flex-initial px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Truck size={14} className="text-orange-500" />
                      <span>{skipSyncLoading ? 'Syncing...' : 'Sync Kitchen Roster'}</span>
                    </button>
                    <button
                      onClick={() => setIsCreateSkipModalOpen(true)}
                      className="flex-1 sm:flex-initial px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus size={15} />
                      <span>+ Record Skip for Student</span>
                    </button>
                  </div>
                </div>

                {/* 4 Metric Forecasting Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Today's Lunch Skips */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-200/80">
                    <div className="flex items-center justify-between text-amber-700 mb-1">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider">Today's Lunch Skips</span>
                      <Sun size={18} className="text-amber-500" />
                    </div>
                    <p className="text-2xl font-black text-slate-900">
                      {skipRequests.filter(s => s.date === todayStr && (s.mealType === 'lunch' || (s.meal || '').toLowerCase().includes('lunch'))).length}
                    </p>
                    <p className="text-[10px] text-amber-800 font-medium mt-1">
                      🍳 Kitchen Alert: Pack {skipRequests.filter(s => s.date === todayStr && (s.mealType === 'lunch' || (s.meal || '').toLowerCase().includes('lunch'))).length} fewer lunches
                    </p>
                  </div>

                  {/* Today's Dinner Skips */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50/50 border border-indigo-200/80">
                    <div className="flex items-center justify-between text-indigo-700 mb-1">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider">Today's Dinner Skips</span>
                      <Moon size={18} className="text-indigo-500" />
                    </div>
                    <p className="text-2xl font-black text-slate-900">
                      {skipRequests.filter(s => s.date === todayStr && (s.mealType === 'dinner' || (s.meal || '').toLowerCase().includes('dinner'))).length}
                    </p>
                    <p className="text-[10px] text-indigo-800 font-medium mt-1">
                      🌙 Kitchen Alert: Pack {skipRequests.filter(s => s.date === todayStr && (s.mealType === 'dinner' || (s.meal || '').toLowerCase().includes('dinner'))).length} fewer dinners
                    </p>
                  </div>

                  {/* Total Meals Rolled Over */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-200/80">
                    <div className="flex items-center justify-between text-emerald-700 mb-1">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider">Total Meals Saved</span>
                      <Utensils size={18} className="text-emerald-500" />
                    </div>
                    <p className="text-2xl font-black text-emerald-700">
                      {skipRequests.filter(s => (s.status || 'approved') === 'approved').length} Meals
                    </p>
                    <p className="text-[10px] text-emerald-800 font-medium mt-1">
                      🥣 +1 Meal added to student remaining meals
                    </p>
                  </div>

                  {/* Total Skips Volume */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between text-slate-600 mb-1">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider">Total Skips</span>
                      <CalendarDays size={18} className="text-slate-500" />
                    </div>
                    <p className="text-2xl font-black text-slate-900">
                      {skipRequests.length}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium mt-1">
                      {skipRequests.filter(s => (s.status || 'approved') === 'approved').length} Approved • {skipRequests.filter(s => s.status === 'pending').length} Pending
                    </p>
                  </div>
                </div>

                {/* Filter & Search Toolbar */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  {/* Status Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                    {(['all', 'pending', 'approved', 'rejected'] as const).map(st => (
                      <button
                        key={st}
                        onClick={() => setSkipFilterStatus(st)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                          skipFilterStatus === st
                            ? 'bg-orange-500 text-white shadow-xs'
                            : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {st.charAt(0).toUpperCase() + st.slice(1)}
                        <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                          skipFilterStatus === st ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-600 font-semibold'
                        }`}>
                          {st === 'all'
                            ? skipRequests.length
                            : skipRequests.filter(s => (s.status || 'approved').toLowerCase() === st).length}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Meal & Date Dropdowns + Search */}
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={skipFilterMeal}
                      onChange={e => setSkipFilterMeal(e.target.value as any)}
                      className="text-xs font-bold px-3 py-1.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-orange-500 text-slate-700 cursor-pointer"
                    >
                      <option value="all">All Meals</option>
                      <option value="lunch">☀️ Lunch Only</option>
                      <option value="dinner">🌙 Dinner Only</option>
                    </select>

                    <select
                      value={skipFilterDate}
                      onChange={e => setSkipFilterDate(e.target.value as any)}
                      className="text-xs font-bold px-3 py-1.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-orange-500 text-slate-700 cursor-pointer"
                    >
                      <option value="all">All Dates</option>
                      <option value="today">Today's Skips</option>
                      <option value="tomorrow">Tomorrow's Skips</option>
                      <option value="past">Past Skips</option>
                    </select>

                    <div className="relative flex-1 sm:w-48">
                      <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search student, hostel..."
                        value={skipSearchQuery}
                        onChange={e => setSkipSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-orange-500"
                      />
                      {skipSearchQuery && (
                        <button
                          onClick={() => setSkipSearchQuery('')}
                          className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Data List */}
                {displayedSkips.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                    <CheckCircle size={36} className="text-emerald-500 mx-auto mb-2" />
                    <p className="font-bold text-sm">No meal skip requests match the current filters</p>
                    <p className="text-xs text-slate-400 mt-1">Try switching tabs or resetting the search filter.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {displayedSkips.map(skip => {
                      const isLunch = skip.mealType === 'lunch' || (skip.meal || '').toLowerCase().includes('lunch');
                      const status = (skip.status || 'approved').toLowerCase();
                      const isToday = skip.date === todayStr;
                      const isTomorrow = skip.date === tomorrowStr;

                      return (
                        <div
                          key={skip.id || skip._id}
                          className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-2xs hover:shadow-sm"
                        >
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-black text-slate-900 text-sm">{skip.student}</span>

                              {/* Meal Slot Tag */}
                              <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                                isLunch
                                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                                  : 'bg-indigo-100 text-indigo-800 border-indigo-300'
                              }`}>
                                {isLunch ? '☀️ Lunch (12:30 PM)' : '🌙 Dinner (07:30 PM)'}
                              </span>

                              {/* Date Tag */}
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                isToday
                                  ? 'bg-orange-100 text-orange-800 border border-orange-200'
                                  : isTomorrow
                                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                  : 'bg-slate-200 text-slate-700'
                              }`}>
                                📅 {isToday ? 'Today, ' : isTomorrow ? 'Tomorrow, ' : ''}{skip.date}
                              </span>

                              {/* Status Tag */}
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                                status === 'approved'
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  : status === 'pending'
                                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                                  : 'bg-rose-100 text-rose-800 border-rose-300'
                              }`}>
                                {status}
                              </span>
                            </div>

                            <p className="text-xs text-slate-600 mt-1.5">
                              <strong>Hostel:</strong> {skip.hostel || 'Campus Hostel'} • <strong>Reason:</strong> "{skip.reason || 'Skip requested by student'}"
                            </p>

                            <p className="text-xs font-bold text-emerald-700 mt-1 flex items-center gap-2">
                              <span>🍽️ {skip.refundStatus || '+1 Meal Added to Balance'}</span>
                              <span className="text-[10px] text-slate-400 font-normal">• Kitchen Roster Synced</span>
                            </p>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            {status === 'pending' ? (
                              <>
                                <button
                                  onClick={() => handleApproveSkip(skip.id || skip._id, skip.student, skip.credit || 72)}
                                  className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer flex items-center gap-1.5"
                                >
                                  <CheckCircle size={14} />
                                  <span>Approve (+1 Meal)</span>
                                </button>
                                <button
                                  onClick={() => handleRejectSkip(skip.id || skip._id, skip.student)}
                                  className="px-3 py-2 border border-slate-300 text-slate-600 hover:bg-slate-100 font-bold text-xs rounded-xl cursor-pointer"
                                >
                                  Decline
                                </button>
                              </>
                            ) : status === 'approved' ? (
                              <>
                                <button
                                  onClick={() => handleRejectSkip(skip.id || skip._id, skip.student)}
                                  className="px-3 py-1.5 border border-slate-300 text-slate-600 hover:bg-slate-100 font-bold text-xs rounded-xl cursor-pointer"
                                  title="Mark as rejected/revoked"
                                >
                                  Revoke
                                </button>
                                <button
                                  onClick={() => handleDeleteSkip(skip.id || skip._id)}
                                  className="p-2 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition cursor-pointer"
                                  title="Delete Record"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleApproveSkip(skip.id || skip._id, skip.student, skip.credit || 72)}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer"
                                >
                                  Re-Approve
                                </button>
                                <button
                                  onClick={() => handleDeleteSkip(skip.id || skip._id)}
                                  className="p-2 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition cursor-pointer"
                                  title="Delete Record"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}

          {/* ══════════════════════════════════════════════════════════
              9. TAB: MESS COMPLAINTS & FEEDBACK
          ══════════════════════════════════════════════════════════ */}
          {activeTab === 'complaints' && (() => {
            const pendingComplaints = complaints.filter(c => (c.status || '').toLowerCase() !== 'resolved');
            const resolvedComplaints = complaints.filter(c => (c.status || '').toLowerCase() === 'resolved');

            const filteredComplaints = complaints
              .filter(c => {
                if (complaintFilter === 'pending') return (c.status || '').toLowerCase() !== 'resolved';
                if (complaintFilter === 'resolved') return (c.status || '').toLowerCase() === 'resolved';
                return true;
              })
              .filter(c => {
                if (!complaintSearch) return true;
                const q = complaintSearch.toLowerCase();
                return (
                  (c.ticketId || '').toLowerCase().includes(q) ||
                  (c.userName || '').toLowerCase().includes(q) ||
                  (c.subject || '').toLowerCase().includes(q) ||
                  (c.message || '').toLowerCase().includes(q) ||
                  (c.category || '').toLowerCase().includes(q)
                );
              });

            return (
              <div className="space-y-6">
                {/* Header Banner */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        Student Feedback & Support
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500 font-semibold">{complaints.length} Total Tickets</span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mt-1">Student Mess Complaints & Quality Feedback</h2>
                    <p className="text-xs text-slate-500 max-w-xl mt-0.5">
                      Review taste, packaging and delivery issues filed by hostel students. Resolve tickets to notify students immediately.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
                      ⚠️ {pendingComplaints.length} Awaiting Resolution
                    </span>
                  </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    {[
                      { key: 'all', label: 'All Tickets', count: complaints.length },
                      { key: 'pending', label: 'Pending Review', count: pendingComplaints.length },
                      { key: 'resolved', label: 'Resolved', count: resolvedComplaints.length }
                    ].map(tab => (
                      <button
                        key={tab.key}
                        onClick={() => setComplaintFilter(tab.key as any)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                          complaintFilter === tab.key
                            ? 'bg-orange-500 text-white shadow-xs'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                        }`}
                      >
                        <span>{tab.label}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          complaintFilter === tab.key ? 'bg-white/20' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {tab.count}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="relative max-w-xs w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search tickets, student, issue..."
                      value={complaintSearch}
                      onChange={e => setComplaintSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* Complaint Cards */}
                {filteredComplaints.length === 0 ? (
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center text-slate-500">
                    <CheckCircle size={40} className="text-emerald-500 mx-auto mb-2" />
                    <p className="font-bold text-slate-800 text-base">No complaints match your criteria</p>
                    <p className="text-xs text-slate-500 mt-1">Hostel students are well-fed and satisfied with the food quality!</p>
                    {complaintSearch && (
                      <button
                        onClick={() => setComplaintSearch('')}
                        className="mt-3 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition cursor-pointer"
                      >
                        Clear Search
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredComplaints.map(ticket => {
                      const isResolved = (ticket.status || '').toLowerCase() === 'resolved';
                      const categoryColors: Record<string, string> = {
                        taste: 'bg-amber-50 text-amber-700 border-amber-200',
                        packaging: 'bg-blue-50 text-blue-700 border-blue-200',
                        delivery: 'bg-purple-50 text-purple-700 border-purple-200',
                        hygiene: 'bg-rose-50 text-rose-700 border-rose-200'
                      };
                      const catKey = (ticket.category || '').toLowerCase();
                      const catStyle = categoryColors[catKey] || 'bg-slate-100 text-slate-600 border-slate-200';

                      return (
                        <div
                          key={ticket.ticketId || ticket._id}
                          className={`bg-white border rounded-2xl p-5 shadow-xs transition hover:shadow-md ${
                            isResolved ? 'border-slate-200/80 bg-slate-50/20' : 'border-amber-200/80 bg-amber-50/10'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2.5">
                            <div className="flex items-center gap-2.5">
                              <span className="font-mono text-xs font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200/80">
                                #{ticket.ticketId || ticket._id.slice(-6).toUpperCase()}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-black text-[10px] flex items-center justify-center">
                                  {(ticket.userName || 'S').charAt(0).toUpperCase()}
                                </div>
                                <span className="text-xs font-bold text-slate-900">{ticket.userName || 'Student'}</span>
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${catStyle}`}>
                                {ticket.category || 'General'}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase border ${
                                isResolved
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-300 animate-pulse'
                              }`}>
                                {isResolved ? 'Resolved' : 'Pending Action'}
                              </span>
                            </div>
                          </div>

                          <h4 className="font-black text-slate-900 text-sm mb-1.5">{ticket.subject}</h4>
                          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/80 border border-slate-100 p-3 rounded-xl mb-3">
                            {ticket.message}
                          </p>

                          <div className="flex justify-between items-center text-xs pt-2.5 border-t border-slate-100">
                            <span className="text-slate-400 text-[11px]">
                              Reported on {new Date(ticket.createdAt || Date.now()).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>

                            <div className="flex items-center gap-2">
                              {!isResolved ? (
                                <button
                                  onClick={async () => {
                                    try {
                                      await adminAPI.resolveComplaint(ticket._id || ticket.ticketId, 'Resolved by mess manager');
                                      setComplaints(prev =>
                                        prev.map(c => ((c._id === ticket._id || c.ticketId === ticket.ticketId) ? { ...c, status: 'resolved' } : c))
                                      );
                                      showToast('Ticket marked as resolved in database!');
                                    } catch (err: any) {
                                      showToast(err.message || 'Failed to resolve complaint', 'error');
                                    }
                                  }}
                                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
                                >
                                  <Check size={14} /> Mark as Resolved
                                </button>
                              ) : (
                                <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                  <CheckCircle size={12} /> Resolved by Mess Incharge
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}

          {/* ══════════════════════════════════════════════════════════
              10. TAB: MESS SETTINGS & TIMINGS
          ══════════════════════════════════════════════════════════ */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Header Banner */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                      Operations Control
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500 font-semibold">Mess Kitchen Engine</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 mt-1">Mess Kitchen & Timings Configuration</h2>
                  <p className="text-xs text-slate-500 max-w-xl mt-0.5">
                    Configure daily meal packing windows, skip cutoff hours, student helpline channels, and automated kitchen workflows.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                    kitchenSettings.status === 'operational'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : kitchenSettings.status === 'busy'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      kitchenSettings.status === 'operational' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                    }`} />
                    Status: {kitchenSettings.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* 2-Column Settings Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Card 1: Kitchen Profile & Contact */}
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                    <ChefHat size={18} className="text-orange-500" /> Kitchen Profile & Helpline
                  </h3>

                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Mess / Kitchen Facility Name</label>
                      <input
                        type="text"
                        value={kitchenSettings.kitchenName}
                        onChange={e => setKitchenSettings(prev => ({ ...prev, kitchenName: e.target.value }))}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-orange-500 focus:bg-white transition"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Student Helpline Phone</label>
                        <input
                          type="text"
                          value={kitchenSettings.helplinePhone}
                          onChange={e => setKitchenSettings(prev => ({ ...prev, helplinePhone: e.target.value }))}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-orange-500 focus:bg-white transition"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Official Mess Support Email</label>
                        <input
                          type="email"
                          value={kitchenSettings.helplineEmail}
                          onChange={e => setKitchenSettings(prev => ({ ...prev, helplineEmail: e.target.value }))}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-orange-500 focus:bg-white transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Campus Coverage & Delivery Hubs</label>
                      <textarea
                        rows={3}
                        value={kitchenSettings.hostelZones}
                        onChange={e => setKitchenSettings(prev => ({ ...prev, hostelZones: e.target.value }))}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-orange-500 focus:bg-white transition"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">Separated by line breaks</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Live Kitchen Operational Mode</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'operational', label: '🟢 Normal Live', desc: 'Accepting orders' },
                          { id: 'busy', label: '🟡 High Load', desc: 'Slight delay' },
                          { id: 'maintenance', label: '🔴 Kitchen Pause', desc: 'Cleaning/Closed' }
                        ].map(mode => (
                          <button
                            key={mode.id}
                            type="button"
                            onClick={() => setKitchenSettings(prev => ({ ...prev, status: mode.id as any }))}
                            className={`p-2.5 rounded-xl text-left border transition cursor-pointer ${
                              kitchenSettings.status === mode.id
                                ? 'bg-orange-50 border-orange-500 text-orange-950 font-bold shadow-2xs'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <p className="text-xs font-black">{mode.label}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{mode.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 2: Meal Shifts & Skip Policy */}
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                    <Clock size={18} className="text-orange-500" /> Meal Shifts & Timetable Cutoffs
                  </h3>

                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Daily Skip Request Cutoff Time</label>
                      <input
                        type="text"
                        value={kitchenSettings.skipCutoff}
                        onChange={e => setKitchenSettings(prev => ({ ...prev, skipCutoff: e.target.value }))}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-orange-500 focus:bg-white transition"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        Students must submit skip requests before this time to credit their meals.
                      </span>
                    </div>

                    <div className="space-y-2.5 pt-1">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Morning Breakfast Slot</label>
                        <input
                          type="text"
                          value={kitchenSettings.breakfastSlot}
                          onChange={e => setKitchenSettings(prev => ({ ...prev, breakfastSlot: e.target.value }))}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-orange-500 focus:bg-white transition"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Afternoon Lunch Dispatch Window</label>
                        <input
                          type="text"
                          value={kitchenSettings.lunchSlot}
                          onChange={e => setKitchenSettings(prev => ({ ...prev, lunchSlot: e.target.value }))}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-orange-500 focus:bg-white transition"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Evening Dinner Dispatch Window</label>
                        <input
                          type="text"
                          value={kitchenSettings.dinnerSlot}
                          onChange={e => setKitchenSettings(prev => ({ ...prev, dinnerSlot: e.target.value }))}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-orange-500 focus:bg-white transition"
                        />
                      </div>
                    </div>

                    {/* Automation Toggles */}
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer">
                        <div className="pr-2">
                          <p className="text-xs font-bold text-slate-800">Auto-Approve Skip Requests</p>
                          <p className="text-[10px] text-slate-500">Automatically approve skips submitted before cutoff time</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={kitchenSettings.autoApproveSkips}
                          onChange={e => setKitchenSettings(prev => ({ ...prev, autoApproveSkips: e.target.checked }))}
                          className="w-4 h-4 text-orange-500 rounded focus:ring-orange-400"
                        />
                      </label>

                      <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer">
                        <div className="pr-2">
                          <p className="text-xs font-bold text-slate-800">Dispatch SMS Notifications</p>
                          <p className="text-[10px] text-slate-500">Alert student when their tiffin leaves the mess kitchen</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={kitchenSettings.smsNotifications}
                          onChange={e => setKitchenSettings(prev => ({ ...prev, smsNotifications: e.target.checked }))}
                          className="w-4 h-4 text-orange-500 rounded focus:ring-orange-400"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Bar */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => showToast('Mess Kitchen configuration saved successfully!')}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs rounded-xl shadow-md shadow-orange-500/25 transition cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle2 size={16} /> Save Kitchen Configuration
                </button>
              </div>

              {/* Delivery Rates & Partner Payout Controls */}
              <div className="pt-6 border-t-2 border-slate-200/80">
                {renderDeliveryRatesSuite()}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              TAB: DELIVERY RATE & PAYOUT CONTROLS (CAMPUS LOGISTICS)
          ══════════════════════════════════════════════════════════ */}
          {activeTab === 'delivery-rates' && (
            <div className="space-y-6 animate-fade-in">
              {renderDeliveryRatesSuite()}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              TAB: MESS DELIVERY TIMINGS & KITCHEN CUTOFF MANAGEMENT
          ══════════════════════════════════════════════════════════ */}
          {activeTab === 'timings' && (
            <div className="space-y-6 animate-fade-in">
              {renderMealTimingsSuite()}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              11. TAB: LIVE INSTANT ORDERS MANAGEMENT
          ══════════════════════════════════════════════════════════ */}
          {activeTab === 'orders' && (() => {
            const subscriberOrdersCount = liveOrders.filter(o => isOrderFromSubscriber(o)).length;
            const extraOrdersCount = liveOrders.filter(o => o.isExtraOrder || o.orderType === 'extra_addon').length;
            const guestOrdersCount = liveOrders.length - subscriberOrdersCount;

            const filteredOrders = liveOrders
              .filter(o => {
                if (orderCustomerTypeFilter === 'subscribers') return isOrderFromSubscriber(o);
                if (orderCustomerTypeFilter === 'guests') return !isOrderFromSubscriber(o);
                if (orderCustomerTypeFilter === 'extras') return Boolean(o.isExtraOrder || o.orderType === 'extra_addon');
                return true;
              })
              .filter(o =>
                !search ||
                (o.orderId || '').toLowerCase().includes(search.toLowerCase()) ||
                (o.customerName || '').toLowerCase().includes(search.toLowerCase()) ||
                (o.deliveryAddress || '').toLowerCase().includes(search.toLowerCase())
              );

            return (
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <Package className="text-orange-500" size={22} /> Live Food &amp; Instant Orders
                      </h2>
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Live Auto-Sync
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Real-time orders placed by students with extra sides, rotis &amp; meals. Auto-updates every 6 seconds.
                    </p>
                  </div>

                  {/* Filter Pills & Manual Refresh */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setOrderCustomerTypeFilter('all')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                        orderCustomerTypeFilter === 'all'
                          ? 'bg-orange-500 text-white shadow-xs'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <span>All Orders</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${orderCustomerTypeFilter === 'all' ? 'bg-white/20' : 'bg-slate-200 text-slate-700'}`}>
                        {liveOrders.length}
                      </span>
                    </button>

                    <button
                      onClick={() => setOrderCustomerTypeFilter('extras')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                        orderCustomerTypeFilter === 'extras'
                          ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-xs'
                          : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
                      }`}
                    >
                      <span>🥟 Extra Add-ons</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${orderCustomerTypeFilter === 'extras' ? 'bg-white/20' : 'bg-amber-200 text-amber-950 font-black'}`}>
                        {extraOrdersCount}
                      </span>
                    </button>

                    <button
                      onClick={() => setOrderCustomerTypeFilter('subscribers')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                        orderCustomerTypeFilter === 'subscribers'
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs'
                          : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                      }`}
                    >
                      <Star size={12} className={orderCustomerTypeFilter === 'subscribers' ? 'fill-white' : 'fill-amber-500 text-amber-500'} />
                      <span>Subscribers Only</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${orderCustomerTypeFilter === 'subscribers' ? 'bg-white/20' : 'bg-amber-200 text-amber-900'}`}>
                        {subscriberOrdersCount}
                      </span>
                    </button>

                    <button
                      onClick={() => setOrderCustomerTypeFilter('guests')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                        orderCustomerTypeFilter === 'guests'
                          ? 'bg-slate-800 text-white shadow-xs'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <span>Non-Subscribers</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${orderCustomerTypeFilter === 'guests' ? 'bg-white/20' : 'bg-slate-200 text-slate-700'}`}>
                        {guestOrdersCount}
                      </span>
                    </button>

                    <button
                      onClick={async () => {
                        try {
                          setSyncing(true);
                          const res = await adminAPI.getOrders();
                          if (res?.orders) setLiveOrders(res.orders);
                          showToast('Live orders refreshed successfully');
                        } catch {
                          showToast('Failed to refresh orders', 'error');
                        } finally {
                          setSyncing(false);
                        }
                      }}
                      className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition cursor-pointer flex items-center gap-1 text-xs font-bold"
                      title="Click to manually refresh live orders"
                    >
                      <RotateCcw size={13} className={syncing ? 'animate-spin text-orange-500' : ''} />
                      <span className="hidden sm:inline">Refresh</span>
                    </button>
                  </div>
                </div>

                {filteredOrders.length === 0 ? (
                  <div className="py-16 text-center text-slate-500">
                    <Package size={40} className="text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-700">No orders found</p>
                    <p className="text-xs text-slate-400">
                      {orderCustomerTypeFilter === 'extras'
                        ? 'No extra add-on orders found matching current filter.'
                        : orderCustomerTypeFilter === 'subscribers'
                        ? 'No orders from monthly subscribers matching current search.'
                        : 'New student orders will show up here live with instant status updates.'}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-black tracking-wider bg-slate-50/50">
                          <th className="py-3 px-4">Order ID</th>
                          <th className="py-3 px-4">Student &amp; Membership</th>
                          <th className="py-3 px-4">Items Ordered</th>
                          <th className="py-3 px-4">Delivery Address</th>
                          <th className="py-3 px-4">Amount &amp; Payment</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Update Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredOrders.map(order => {
                          const statusColors: Record<string, string> = {
                            confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
                            preparing: 'bg-amber-50 text-amber-700 border-amber-200',
                            'on-the-way': 'bg-purple-50 text-purple-700 border-purple-200',
                            delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                            cancelled: 'bg-rose-50 text-rose-700 border-rose-200'
                          };

                          const matchedSub = getSubscriberForOrder(order);
                          const isExtra = Boolean(order.isExtraOrder || order.orderType === 'extra_addon');

                          return (
                            <tr key={order._id || order.orderId} className={`hover:bg-slate-50/60 transition ${isExtra ? 'bg-amber-50/20' : ''}`}>
                              <td className="py-3.5 px-4 font-mono font-black text-orange-600">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span>#{order.orderId || (order._id ? order._id.slice(-6).toUpperCase() : 'ORD')}</span>
                                  {isExtra && (
                                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                                      🥟 Extra Add-on
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400 font-sans font-normal mt-0.5">
                                  {order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'}
                                </div>
                              </td>
                              <td className="py-3.5 px-4">
                                <p className="font-bold text-slate-900">{order.customerName || 'Student Customer'}</p>
                                <p className="text-[11px] text-slate-400">{order.customerPhone || ''}</p>
                                
                                {matchedSub ? (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenSubscriberOrders(matchedSub)}
                                    className="mt-1 inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/15 to-orange-500/15 text-orange-700 border border-orange-200/80 hover:bg-orange-100 cursor-pointer transition-colors shadow-2xs"
                                    title="Click to view full order &amp; subscription history for this student"
                                  >
                                    <Star size={9} className="text-amber-500 fill-amber-500" />
                                    <span>{matchedSub.planId?.name || 'Standard'} Subscriber</span>
                                    <ArrowUpRight size={9} />
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">
                                    Walk-in / Direct Order
                                  </span>
                                )}
                              </td>
                              <td className="py-3.5 px-4 max-w-xs">
                                <div className="space-y-1">
                                  {order.items?.map((it: any, idx: number) => {
                                    const isExtraItem = Boolean(
                                      order.isExtraOrder ||
                                      (it.name || '').toLowerCase().match(/extra|roti|paneer|jamun|curd|lassi|egg|shake|papad|pickle|sweet|salad|achar|naan|rice/)
                                    );
                                    return (
                                      <div key={idx} className="text-[11px] text-slate-700 flex items-center gap-1.5 flex-wrap">
                                        <span className="font-bold text-slate-900">{it.quantity || 1}x</span>
                                        <span className={isExtraItem ? 'font-bold text-amber-900' : ''}>{it.name}</span>
                                        {isExtraItem && (
                                          <span className="text-[9px] bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.2 rounded border border-amber-300">
                                            Extra Add-on
                                          </span>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </td>
                              <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                                <span className="flex items-center gap-1 font-medium text-slate-700">
                                  <MapPin size={11} className="text-orange-500 shrink-0" />
                                  {order.deliveryAddress || 'Hostel Delivery'}
                                </span>
                              </td>
                              <td className="py-3.5 px-4">
                                <p className="font-black text-slate-900">₹{order.totalAmount || 0}</p>
                                <div className="mt-1 flex flex-col gap-1 items-start">
                                  {order.paymentMethod === 'Cash on Delivery' ? (
                                    order.paymentStatus === 'paid' ? (
                                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                        ✓ Cash Collected
                                      </span>
                                    ) : (
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                          💵 COD Pending
                                        </span>
                                        <button
                                          onClick={() => handleUpdateOrderStatus(order.orderId || order._id, order.status, 'paid')}
                                          className="text-[9px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-1.5 py-0.5 rounded shadow-2xs cursor-pointer transition-colors"
                                          title="Mark Cash Collected"
                                        >
                                          Mark Paid
                                        </button>
                                      </div>
                                    )
                                  ) : order.paymentMethod?.includes('Wallet') ? (
                                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                      ✓ Wallet (Paid)
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                                      ✓ Online UPI (Paid)
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3.5 px-4">
                                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase border ${statusColors[order.status] || 'bg-slate-100 text-slate-700'}`}>
                                  {order.status}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex flex-col items-end gap-1">
                                  <select
                                    value={order.status}
                                    onChange={e => handleUpdateOrderStatus(order.orderId || order._id, e.target.value)}
                                    className="text-xs font-bold border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-800 focus:outline-none focus:border-orange-500 shadow-2xs cursor-pointer"
                                  >
                                    <option value="confirmed">Confirmed</option>
                                    <option value="preparing">Preparing / Cooking</option>
                                    <option value="on-the-way">On The Way (Rider)</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                  </select>

                                  {matchedSub && (
                                    <button
                                      type="button"
                                      onClick={() => handleOpenSubscriberOrders(matchedSub)}
                                      className="text-[10px] font-bold text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-0.5 cursor-pointer mt-0.5"
                                      title="View this student's complete order history"
                                    >
                                      <History size={10} /> View Order History
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ══════════════════════════════════════════════════════════
              TAB: FOOD MENU & DISHES MANAGEMENT
          ══════════════════════════════════════════════════════════ */}
          {activeTab === 'dishes' && (
            <div className="space-y-6">
              {/* Header Banner */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                      Live Store Menu
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500 font-semibold">{dishes.length} Total Dishes</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 mt-1">Instant Food Menu & Dishes</h2>
                  <p className="text-xs text-slate-500 max-w-xl mt-0.5">
                    Live menu items served to hostel students via /menu and Home page. Manage instant stock availability, prices, categories & dietary tags.
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={openNewDishModal}
                    className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 cursor-pointer flex items-center gap-1.5 transition"
                  >
                    <Plus size={16} /> Add New Dish
                  </button>
                </div>
              </div>

              {/* Live Dishes Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Menu Items</p>
                  <p className="text-xl font-black text-slate-900 mt-1">{dishes.length}</p>
                  <span className="text-[10px] text-slate-500 font-semibold mt-0.5 inline-block">All Categories</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">In Stock / Available</p>
                  <p className="text-xl font-black text-emerald-600 mt-1">
                    {dishes.filter(d => d.isAvailable !== false).length}
                  </p>
                  <span className="text-[10px] text-emerald-700 font-bold mt-0.5 inline-block">🟢 Ready to Order</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sold Out / Off</p>
                  <p className="text-xl font-black text-rose-600 mt-1">
                    {dishes.filter(d => d.isAvailable === false).length}
                  </p>
                  <span className="text-[10px] text-rose-600 font-bold mt-0.5 inline-block">🔴 Out of Stock</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pure Veg</p>
                  <p className="text-xl font-black text-emerald-700 mt-1">
                    {dishes.filter(d => d.isVeg === true).length}
                  </p>
                  <span className="text-[10px] text-emerald-700 font-semibold mt-0.5 inline-block">Vegetarian Meals</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Non-Veg</p>
                  <p className="text-xl font-black text-amber-700 mt-1">
                    {dishes.filter(d => d.isVeg === false).length}
                  </p>
                  <span className="text-[10px] text-amber-700 font-semibold mt-0.5 inline-block">Chicken & Eggs</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Average Price</p>
                  <p className="text-xl font-black text-slate-900 mt-1">
                    ₹{dishes.length > 0 ? Math.round(dishes.reduce((acc, d) => acc + (Number(d.price) || 0), 0) / dishes.length) : 0}
                  </p>
                  <span className="text-[10px] text-slate-500 font-semibold mt-0.5 inline-block">Affordable Campus</span>
                </div>
              </div>

              {/* Search, Filter Toolbar & Category Pills */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3.5">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  {/* Search Bar */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search dish name, ingredients, or category..."
                      value={dishSearchQuery}
                      onChange={e => setDishSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-orange-500 font-medium"
                    />
                    {dishSearchQuery && (
                      <button
                        onClick={() => setDishSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Filter Pills */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Availability Filter */}
                    <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-bold">
                      <button
                        onClick={() => setDishAvailabilityFilter('all')}
                        className={`px-2.5 py-1 rounded-lg transition ${
                          dishAvailabilityFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        All Stock
                      </button>
                      <button
                        onClick={() => setDishAvailabilityFilter('in_stock')}
                        className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${
                          dishAvailabilityFilter === 'in_stock' ? 'bg-emerald-500 text-white shadow-xs' : 'text-emerald-700 hover:text-emerald-800'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        In Stock
                      </button>
                      <button
                        onClick={() => setDishAvailabilityFilter('out_of_stock')}
                        className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${
                          dishAvailabilityFilter === 'out_of_stock' ? 'bg-rose-500 text-white shadow-xs' : 'text-rose-700 hover:text-rose-800'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        Sold Out
                      </button>
                    </div>

                    {/* Diet Filter */}
                    <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-bold">
                      <button
                        onClick={() => setDishDietFilter('all')}
                        className={`px-2.5 py-1 rounded-lg transition ${
                          dishDietFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        All Diet
                      </button>
                      <button
                        onClick={() => setDishDietFilter('veg')}
                        className={`px-2.5 py-1 rounded-lg transition ${
                          dishDietFilter === 'veg' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-700 hover:text-emerald-800'
                        }`}
                      >
                        🟢 Veg
                      </button>
                      <button
                        onClick={() => setDishDietFilter('nonveg')}
                        className={`px-2.5 py-1 rounded-lg transition ${
                          dishDietFilter === 'nonveg' ? 'bg-rose-600 text-white shadow-xs' : 'text-rose-700 hover:text-rose-800'
                        }`}
                      >
                        🔴 Non-Veg
                      </button>
                    </div>
                  </div>
                </div>

                {/* Category Pills */}
                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
                  {[
                    { id: 'all', label: '✨ All Dishes' },
                    { id: 'thali', label: '🍱 Thalis' },
                    { id: 'biryani', label: '🥘 Biryani' },
                    { id: 'curries', label: '🍲 Curries' },
                    { id: 'burgers', label: '🍔 Burgers' },
                    { id: 'rolls', label: '🌯 Rolls' },
                    { id: 'momos', label: '🥟 Momos' },
                    { id: 'fries', label: '🍟 Fries' },
                    { id: 'chinese', label: '🍜 Chinese' },
                    { id: 'south-indian', label: '🫔 South Indian' },
                    { id: 'pizza', label: '🍕 Pizza' },
                    { id: 'healthy', label: '🥗 Healthy' },
                    { id: 'desserts', label: '🍨 Desserts' },
                    { id: 'beverages', label: '🥤 Shakes' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setDishFilterCat(cat.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        dishFilterCat === cat.id
                          ? 'bg-orange-500 text-white shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-100'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dishes Grid */}
              {(() => {
                const query = dishSearchQuery.trim().toLowerCase();
                const filteredDishes = dishes.filter(d => {
                  if (dishFilterCat !== 'all' && d.category !== dishFilterCat) return false;
                  if (dishDietFilter === 'veg' && !d.isVeg) return false;
                  if (dishDietFilter === 'nonveg' && d.isVeg) return false;
                  if (dishAvailabilityFilter === 'in_stock' && d.isAvailable === false) return false;
                  if (dishAvailabilityFilter === 'out_of_stock' && d.isAvailable !== false) return false;
                  if (query) {
                    const matchName = (d.name || '').toLowerCase().includes(query);
                    const matchDesc = (d.description || '').toLowerCase().includes(query);
                    const matchCat = (d.category || '').toLowerCase().includes(query);
                    const matchIng = Array.isArray(d.ingredients) && d.ingredients.some((ing: string) => ing.toLowerCase().includes(query));
                    if (!matchName && !matchDesc && !matchCat && !matchIng) return false;
                  }
                  return true;
                });

                if (filteredDishes.length === 0) {
                  return (
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center">
                      <ChefHat className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <h3 className="text-base font-bold text-slate-800">No dishes match your filter</h3>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        Try clearing search terms or changing the category filter above.
                      </p>
                      <button
                        onClick={() => {
                          setDishFilterCat('all');
                          setDishSearchQuery('');
                          setDishDietFilter('all');
                          setDishAvailabilityFilter('all');
                        }}
                        className="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredDishes.map(dish => {
                      const dishId = dish.id || dish._id;
                      const isInStock = dish.isAvailable !== false;
                      return (
                        <div
                          key={dishId}
                          className={`bg-white border rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition flex flex-col group ${
                            isInStock ? 'border-slate-200/90' : 'border-rose-200/80 bg-rose-50/20'
                          }`}
                        >
                          <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                            <img
                              src={dish.image || 'https://images.pexels.com/photos/12737656/pexels-photo-12737656.jpeg?auto=compress&cs=tinysrgb&w=400'}
                              alt={dish.name}
                              className={`w-full h-full object-cover group-hover:scale-105 transition duration-300 ${
                                !isInStock ? 'grayscale opacity-70' : ''
                              }`}
                            />
                            {/* Badges top-left */}
                            <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs ${
                                dish.isVeg ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${dish.isVeg ? 'bg-emerald-200' : 'bg-rose-200'}`} />
                                {dish.isVeg ? 'VEG' : 'NON-VEG'}
                              </span>

                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs ${
                                isInStock ? 'bg-emerald-700 text-white' : 'bg-rose-700 text-white'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${isInStock ? 'bg-emerald-300' : 'bg-rose-300 animate-pulse'}`} />
                                {isInStock ? 'IN STOCK' : 'SOLD OUT'}
                              </span>

                              {dish.tag && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-500 text-white shadow-xs">
                                  {dish.tag}
                                </span>
                              )}
                            </div>

                            {/* Prep Time top-right */}
                            <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] font-black text-slate-800 shadow-xs flex items-center gap-1">
                              <Clock size={11} className="text-orange-500" />
                              {dish.prepTime || '20 mins'}
                            </div>

                            {/* Out of Stock banner overlay if disabled */}
                            {!isInStock && (
                              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center">
                                <span className="px-3 py-1 bg-rose-600 text-white font-black text-xs rounded-xl shadow-lg uppercase tracking-wider">
                                  Temporarily Out of Stock
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="p-4 flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h3 className="font-black text-sm text-slate-900 group-hover:text-orange-600 transition">
                                  {dish.name}
                                </h3>
                                <span className="text-[10px] font-extrabold uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md shrink-0">
                                  {dish.category}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 line-clamp-2 mb-2.5">
                                {dish.description || 'Nutritious chef prepared meal for hostel students.'}
                              </p>

                              {/* Ingredients Preview */}
                              {Array.isArray(dish.ingredients) && dish.ingredients.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-2.5">
                                  {dish.ingredients.slice(0, 3).map((ing: string, idx: number) => (
                                    <span key={idx} className="text-[9px] bg-slate-100 text-slate-600 font-medium px-1.5 py-0.5 rounded-md">
                                      {ing}
                                    </span>
                                  ))}
                                  {dish.ingredients.length > 3 && (
                                    <span className="text-[9px] text-slate-400 font-bold self-center">
                                      +{dish.ingredients.length - 3}
                                    </span>
                                  )}
                                </div>
                              )}

                              <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-500 mb-3 bg-slate-50 p-2 rounded-xl">
                                <span>🔥 {dish.calories || 450} kcal</span>
                                <span>•</span>
                                <span>💪 {dish.protein || '16g'}</span>
                                <span>•</span>
                                <span>🌶️ {dish.spiceLevel || 'Medium'}</span>
                                {dish.serves && (
                                  <>
                                    <span>•</span>
                                    <span>🍽️ {dish.serves}</span>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-lg font-black text-slate-900">₹{dish.price}</span>
                                {dish.originalPrice && dish.originalPrice > dish.price && (
                                  <span className="text-xs text-slate-400 line-through">₹{dish.originalPrice}</span>
                                )}
                              </div>

                              <div className="flex items-center gap-1.5">
                                {/* Fast 1-click Stock Toggle */}
                                <button
                                  onClick={() => handleToggleDishAvailability(dish)}
                                  className={`px-2 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 transition cursor-pointer border ${
                                    isInStock
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                      : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                  }`}
                                  title={isInStock ? 'Click to mark Out of Stock' : 'Click to mark In Stock'}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${isInStock ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                  <span>{isInStock ? 'In Stock' : 'Sold Out'}</span>
                                </button>

                                {/* Toggle Veg/Non-Veg */}
                                <button
                                  onClick={() => handleToggleDishVeg(dish)}
                                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                                  title="Toggle Veg / Non-Veg"
                                >
                                  <Leaf size={14} className={dish.isVeg ? 'text-emerald-500' : 'text-slate-400'} />
                                </button>

                                {/* Edit Dish */}
                                <button
                                  onClick={() => openEditDishModal(dish)}
                                  className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition cursor-pointer"
                                  title="Edit Dish Details"
                                >
                                  <Edit size={14} />
                                </button>

                                {/* Delete Dish */}
                                <button
                                  onClick={() => handleDeleteDish(dishId, dish.name)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                  title="Delete Dish"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              TAB: REGISTERED USERS MANAGEMENT
          ══════════════════════════════════════════════════════════ */}
          {activeTab === 'users' && (() => {
            const studentUsers = usersList.filter(u => u.role !== 'admin');
            const adminUsers = usersList.filter(u => u.role === 'admin');

            const filteredUsers = usersList
              .filter(u => {
                if (userRoleFilter === 'customer') return u.role !== 'admin';
                if (userRoleFilter === 'admin') return u.role === 'admin';
                return true;
              })
              .filter(u =>
                !search ||
                (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
                (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
                (u.phone || '').includes(search) ||
                (u.deliveryAddress || '').toLowerCase().includes(search.toLowerCase())
              );

            return (
              <div className="space-y-6">
                <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        User Database
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500 font-semibold">{usersList.length} Accounts Registered</span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mt-1">Registered Students & Staff Accounts</h2>
                    <p className="text-xs text-slate-500 max-w-xl mt-0.5">
                      View hostel residents, delivery staff, and administrators. Manage campus wallet balances and permissions.
                    </p>
                  </div>
                  <div className="text-left sm:text-right bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl border sm:border-0 border-slate-200">
                    <p className="text-xs text-slate-500 font-bold">Total Wallet Credits in Circulation</p>
                    <p className="text-2xl font-black text-slate-900">
                      ₹{usersList.reduce((acc, u) => acc + (u.walletBalance || 0), 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                {/* Role Filter Pills */}
                <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs w-fit">
                  {[
                    { id: 'all', label: 'All Accounts', count: usersList.length },
                    { id: 'customer', label: '🎓 Hostel Students', count: studentUsers.length },
                    { id: 'admin', label: '👑 Mess Admins', count: adminUsers.length }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setUserRoleFilter(tab.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                        userRoleFilter === tab.id
                          ? 'bg-orange-500 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        userRoleFilter === tab.id ? 'bg-white/20' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Users Table */}
                <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                        <tr>
                          <th className="py-3.5 px-4">User</th>
                          <th className="py-3.5 px-4">Role</th>
                          <th className="py-3.5 px-4">Phone Number</th>
                          <th className="py-3.5 px-4">Delivery Hostel / Room</th>
                          <th className="py-3.5 px-4">Wallet Balance</th>
                          <th className="py-3.5 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-slate-500">
                              No users match your criteria.
                            </td>
                          </tr>
                        ) : (
                          filteredUsers.map(u => {
                            const uid = u._id || u.id;
                            const isAdmin = u.role === 'admin';
                            return (
                              <tr key={uid} className="hover:bg-slate-50/60 transition">
                                <td className="py-3.5 px-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center font-black text-xs shadow-xs">
                                      {(u.name || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <p className="font-bold text-slate-900">{u.name}</p>
                                      <p className="text-[10px] text-slate-400">{u.email}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3.5 px-4">
                                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                                    isAdmin ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-slate-100 text-slate-700'
                                  }`}>
                                    {isAdmin ? '👑 Admin' : '🎓 Customer'}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 font-semibold text-slate-700">
                                  {u.phone || '-'}
                                </td>
                                <td className="py-3.5 px-4 text-slate-600">
                                  {u.deliveryAddress || (u.hostel ? `${u.hostel}, Room ${u.room || '101'}` : 'Campus Hostel')}
                                </td>
                                <td className="py-3.5 px-4">
                                  <span className="font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                    ₹{(u.walletBalance || 0).toLocaleString('en-IN')}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      onClick={() => handleOpenWalletModal(u)}
                                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold rounded-lg text-[10px] flex items-center gap-1 cursor-pointer transition shadow-2xs"
                                      title="Credit student wallet"
                                    >
                                      <Wallet size={12} /> +Credit
                                    </button>
                                    <button
                                      onClick={() => handleToggleUserRole(u)}
                                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[10px] transition cursor-pointer"
                                      title="Toggle Role"
                                    >
                                      {isAdmin ? 'Make Student' : 'Make Admin'}
                                    </button>
                                    {!isAdmin && (
                                      <button
                                        onClick={() => handleDeleteUser(u)}
                                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                        title="Remove User"
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ══════════════════════════════════════════════════════════
              TAB: COUPONS & DISCOUNTS MANAGEMENT
          ══════════════════════════════════════════════════════════ */}
          {activeTab === 'coupons' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                      Student Discounts
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500 font-semibold">{couponsList.length} Active Promos</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 mt-1">Promotional Coupons & Vouchers</h2>
                  <p className="text-xs text-slate-500 max-w-xl mt-0.5">
                    Create promo codes applied during Cart checkout and Mess subscriptions. Boost student order retention.
                  </p>
                </div>
                <button
                  onClick={() => setCouponModalOpen(true)}
                  className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 cursor-pointer flex items-center gap-1.5 transition"
                >
                  <Plus size={16} /> Create New Coupon
                </button>
              </div>

              {couponsList.length === 0 ? (
                <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center text-slate-500">
                  <Tag size={40} className="text-orange-300 mx-auto mb-2" />
                  <p className="font-bold text-slate-800 text-base">No promotional coupons created yet</p>
                  <p className="text-xs text-slate-500 mt-1">Create discount codes to attract more student orders.</p>
                  <button
                    onClick={() => setCouponModalOpen(true)}
                    className="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer"
                  >
                    + Create First Coupon
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {couponsList.map(cpn => {
                    const cid = cpn.id || cpn._id;
                    const isActive = cpn.status === 'active';
                    const usagePercent = Math.min(Math.round(((cpn.usage || 0) / (cpn.maxUsage || 200)) * 100), 100);

                    return (
                      <div
                        key={cid}
                        className={`bg-white border rounded-3xl p-5 shadow-xs flex flex-col justify-between relative overflow-hidden transition hover:shadow-md ${
                          isActive ? 'border-slate-200/90' : 'border-slate-200/60 bg-slate-50/40 opacity-75'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-2">
                              <span className="px-3 py-1 rounded-xl bg-orange-50 text-orange-600 font-black text-sm tracking-wider border border-orange-200/80 font-mono">
                                {cpn.code}
                              </span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(cpn.code);
                                  showToast(`Coupon code ${cpn.code} copied!`);
                                }}
                                className="p-1 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition cursor-pointer"
                                title="Copy Coupon Code"
                              >
                                <Copy size={13} />
                              </button>
                            </div>
                            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase border ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-100 text-slate-500 border-slate-200'
                            }`}>
                              {isActive ? 'Active' : 'Paused'}
                            </span>
                          </div>

                          <div className="flex items-baseline gap-1 mb-1.5">
                            <span className="text-2xl font-black text-slate-900">
                              {cpn.type === 'Percentage' ? `${cpn.value}% OFF` : `₹${cpn.value} FLAT`}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 font-medium mb-4">
                            {cpn.desc || `Save on orders above ₹${cpn.minOrder}`}
                          </p>

                          {/* Usage Progress */}
                          <div className="space-y-1.5 bg-slate-50 p-3 rounded-2xl text-[11px] font-semibold text-slate-500 mb-4 border border-slate-100">
                            <div className="flex justify-between">
                              <span>Min. Order Value:</span>
                              <span className="text-slate-900 font-bold">₹{cpn.minOrder || 99}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Redemptions:</span>
                              <span className="text-slate-900 font-bold">{cpn.usage || 0} / {cpn.maxUsage || 200}</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-orange-500 to-amber-500 h-1.5 rounded-full"
                                style={{ width: `${usagePercent}%` }}
                              />
                            </div>
                            <div className="flex justify-between pt-1">
                              <span>Valid Till:</span>
                              <span className="text-slate-900 font-bold">{cpn.expiry || 'Dec 2026'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                          <button
                            onClick={() => handleToggleCoupon(cpn)}
                            className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition cursor-pointer ${
                              isActive
                                ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            }`}
                          >
                            {isActive ? 'Pause Promo' : 'Activate Promo'}
                          </button>
                          <button
                            onClick={() => handleDeleteCoupon(cpn)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Delete Coupon"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      {/* ── MODAL: ADD DELIVERY RIDER ── */}
      {riderModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
              <Bike size={20} className="text-orange-500" /> Register Delivery Boy / Rider
            </h3>
            <form onSubmit={handleAddRider} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Rider Full Name *</label>
                <input
                  type="text"
                  required
                  value={riderForm.name}
                  onChange={e => setRiderForm({ ...riderForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500"
                  placeholder="e.g. Vicky Kumar (Dabbawala)"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={riderForm.phone}
                  onChange={e => setRiderForm({ ...riderForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Hostel Route</label>
                <select
                  value={riderForm.route}
                  onChange={e => setRiderForm({ ...riderForm, route: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500"
                >
                  <option value="">Select a Delivery Route</option>
                  {deliveryRoutes.map(r => (
                    <option key={r.id || (r as any)._id} value={r.name}>
                      {r.name} ({r.zone})
                    </option>
                  ))}
                  {deliveryRoutes.length === 0 && (
                    <option value="Campus Central Route">Campus Central Route</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle Description</label>
                <input
                  type="text"
                  value={riderForm.vehicle}
                  onChange={e => setRiderForm({ ...riderForm, vehicle: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500"
                  placeholder="e.g. Electric Scooter"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRiderModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
                >
                  Register Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD / EDIT MESS PLAN ── */}
      {planModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-lg font-black text-slate-900 mb-4">
              {editingPlan ? 'Edit Mess Plan' : 'Create New Mess Plan'}
            </h3>
            <form onSubmit={handleSavePlan} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Plan Name *</label>
                <input
                  type="text"
                  required
                  value={planForm.name}
                  onChange={e => setPlanForm({ ...planForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500"
                  placeholder="e.g. Standard"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Meals Per Day *</label>
                  <select
                    value={planForm.mealsPerDay}
                    onChange={e => setPlanForm({ ...planForm, mealsPerDay: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500"
                  >
                    <option value={1}>1 Meal (Lunch or Dinner)</option>
                    <option value={2}>2 Meals (Lunch + Dinner)</option>
                    <option value={3}>3 Meals (All 3 Meals)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Monthly Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={planForm.monthlyPrice}
                    onChange={e => setPlanForm({ ...planForm, monthlyPrice: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Semester Discount (%)</label>
                <input
                  type="number"
                  value={planForm.semesterDiscount}
                  onChange={e => setPlanForm({ ...planForm, semesterDiscount: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  value={planForm.description}
                  onChange={e => setPlanForm({ ...planForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500"
                  placeholder="e.g. Most popular hostel package"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Features (1 per line)</label>
                <textarea
                  rows={4}
                  value={planForm.features}
                  onChange={e => setPlanForm({ ...planForm, features: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={planForm.isPopular}
                    onChange={e => setPlanForm({ ...planForm, isPopular: e.target.checked })}
                    className="text-orange-500 rounded"
                  />
                  Mark as Most Popular
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={planForm.isActive}
                    onChange={e => setPlanForm({ ...planForm, isActive: e.target.checked })}
                    className="text-orange-500 rounded"
                  />
                  Active
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPlanModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
                >
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: EDIT DAY'S MENU ── */}
      {menuModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-black text-slate-900 mb-4">
              Edit Menu for {selectedDay}
            </h3>
            <form onSubmit={handleSaveDayMenu} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-amber-700 mb-1 flex items-center gap-1">
                  <Sun size={14} /> Breakfast Menu
                </label>
                <input
                  type="text"
                  required
                  value={dayMenuForm.breakfast}
                  onChange={e => setDayMenuForm({ ...dayMenuForm, breakfast: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-orange-600 mb-1 flex items-center gap-1">
                  <Utensils size={14} /> Lunch Thali Menu
                </label>
                <textarea
                  rows={2}
                  required
                  value={dayMenuForm.lunch}
                  onChange={e => setDayMenuForm({ ...dayMenuForm, lunch: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-indigo-700 mb-1 flex items-center gap-1">
                  <Moon size={14} /> Dinner Menu
                </label>
                <textarea
                  rows={2}
                  required
                  value={dayMenuForm.dinner}
                  onChange={e => setDayMenuForm({ ...dayMenuForm, dinner: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setMenuModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
                >
                  Publish Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD / EDIT EXTRA ADD-ON ── */}
      {extraModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-black text-slate-900 mb-4">
              {editingExtra ? 'Edit Tiffin Add-on' : 'Add Tiffin Extra Side'}
            </h3>
            <form onSubmit={handleSaveExtra} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Item Name *</label>
                <input
                  type="text"
                  required
                  value={extraForm.name}
                  onChange={e => setExtraForm({ ...extraForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500"
                  placeholder="e.g. Extra Roti (2)"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={extraForm.price}
                    onChange={e => setExtraForm({ ...extraForm, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={extraForm.category}
                    onChange={e => setExtraForm({ ...extraForm, category: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500"
                  >
                    <option value="Roti">Roti / Bread</option>
                    <option value="Side">Side Dish</option>
                    <option value="Sweet">Dessert / Sweet</option>
                    <option value="Beverage">Beverage / Lassi</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Image URL</label>
                <input
                  type="text"
                  value={extraForm.imageUrl}
                  onChange={e => setExtraForm({ ...extraForm, imageUrl: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-orange-500"
                />
              </div>

              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={extraForm.isActive}
                  onChange={e => setExtraForm({ ...extraForm, isActive: e.target.checked })}
                  className="text-orange-500 rounded"
                />
                In Stock & Available to Order
              </label>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setExtraModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
                >
                  Save Add-on
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ── MODAL: ADD / EDIT DELIVERY ZONE ── */}
      {zoneModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <MapPin className="text-orange-500" size={20} />
                {editingZone ? 'Edit Delivery Zone' : 'Create New Delivery Zone'}
              </h3>
              <button
                onClick={() => setZoneModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveZone} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Zone Name *</label>
                  <input
                    type="text"
                    required
                    value={zoneForm.name}
                    onChange={e => setZoneForm({ ...zoneForm, name: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500"
                    placeholder="e.g. North Campus Hostels"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Zone Code *</label>
                  <input
                    type="text"
                    required
                    value={zoneForm.code}
                    onChange={e => setZoneForm({ ...zoneForm, code: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500"
                    placeholder="e.g. NC-01"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Area Pincode *</label>
                  <input
                    type="text"
                    required
                    value={zoneForm.pincode}
                    onChange={e => setZoneForm({ ...zoneForm, pincode: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500"
                    placeholder="110007"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Charge (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={zoneForm.deliveryCharge}
                    onChange={e => setZoneForm({ ...zoneForm, deliveryCharge: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500"
                    placeholder="0 for Free Delivery"
                  />
                  <span className="text-[10px] text-slate-400">₹0 = Free campus student delivery</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Covered Hostels & Land Marks (Comma-separated) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={zoneForm.areas}
                  onChange={e => setZoneForm({ ...zoneForm, areas: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-orange-500"
                  placeholder="e.g. Tagore Hostel, Raman Hostel, Aryabhatta Hall, Subhash PG"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Lunch Delivery Window</label>
                  <input
                    type="text"
                    value={zoneForm.lunchSlot}
                    onChange={e => setZoneForm({ ...zoneForm, lunchSlot: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-orange-500"
                    placeholder="12:15 PM - 01:15 PM"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Dinner Delivery Window</label>
                  <input
                    type="text"
                    value={zoneForm.dinnerSlot}
                    onChange={e => setZoneForm({ ...zoneForm, dinnerSlot: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-orange-500"
                  
                    placeholder="07:30 PM - 08:30 PM"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Dabbawala</label>
                  <select
                    value={zoneForm.assignedRider}
                    onChange={e => setZoneForm({ ...zoneForm, assignedRider: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500"
                  >
                    {riders.map(r => (
                      <option key={r.id} value={`${r.name} (${r.vehicle.split(' ')[0]})`}>
                        {r.name} ({r.route})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Daily Max Capacity (Tiffins)</label>
                  <input
                    type="number"
                    min="10"
                    value={zoneForm.dailyTiffinCapacity}
                    onChange={e => setZoneForm({ ...zoneForm, dailyTiffinCapacity: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Zone Status</label>
                <div className="flex gap-4">
                  {(['active', 'busy', 'paused'] as const).map(st => (
                    <label key={st} className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer capitalize">
                      <input
                        type="radio"
                        name="zoneStatus"
                        value={st}
                        checked={zoneForm.status === st}
                        onChange={() => setZoneForm({ ...zoneForm, status: st })}
                        className="text-orange-500"
                      />
                      {st}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setZoneModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
                >
                  {editingZone ? 'Update Zone' : 'Activate Zone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ── MODAL: SUBSCRIBE NEW STUDENT ── */}
      {subscribeModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Users className="text-orange-500" size={20} />
                Enroll / Subscribe Student
              </h3>
              <button
                onClick={() => setSubscribeModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubscription} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    value={subscribeForm.studentName}
                    onChange={e => setSubscribeForm({ ...subscribeForm, studentName: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500"
                    placeholder="e.g. Aarav Sharma"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile / Phone *</label>
                  <input
                    type="text"
                    required
                    value={subscribeForm.studentPhone}
                    onChange={e => setSubscribeForm({ ...subscribeForm, studentPhone: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Student Email Address</label>
                <input
                  type="email"
                  value={subscribeForm.studentEmail}
                  onChange={e => setSubscribeForm({ ...subscribeForm, studentEmail: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-orange-500"
                  placeholder="student@campus.edu"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hostel / PG *</label>
                  <input
                    type="text"
                    required
                    value={subscribeForm.hostel}
                    onChange={e => setSubscribeForm({ ...subscribeForm, hostel: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500"
                    placeholder="Tagore Hostel"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Room No. *</label>
                  <input
                    type="text"
                    required
                    value={subscribeForm.room}
                    onChange={e => setSubscribeForm({ ...subscribeForm, room: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500"
                    placeholder="204"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Zone</label>
                  <select
                    value={subscribeForm.zoneCode}
                    onChange={e => setSubscribeForm({ ...subscribeForm, zoneCode: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500"
                  >
                    {deliveryZones.map(z => (
                      <option key={z.id} value={z.code}>
                        {z.code} - {z.name.split(' ')[0]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Select Meal Plan *</label>
                  <select
                    value={subscribeForm.planId}
                    onChange={e => {
                      const p = plans.find(plan => plan._id === e.target.value);
                      const price = subscribeForm.billingCycle === 'semester'
                        ? Math.round((p?.monthlyPrice || 3999) * 0.85 * 6)
                        : (p?.monthlyPrice || 3999);
                      setSubscribeForm({ ...subscribeForm, planId: e.target.value, amountPaid: price });
                    }}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500"
                  >
                    {plans.map(p => (
                      <option key={p._id} value={p._id}>
                        {p.name} ({p.mealsPerDay} Meals/Day) — ₹{p.monthlyPrice}/mo
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Billing Cycle</label>
                  <select
                    value={subscribeForm.billingCycle}
                    onChange={e => {
                      const cycle = e.target.value as any;
                      const p = plans.find(plan => plan._id === subscribeForm.planId) || plans[0];
                      const price = cycle === 'semester'
                        ? Math.round((p?.monthlyPrice || 3999) * 0.85 * 6)
                        : (p?.monthlyPrice || 3999);
                      setSubscribeForm({ ...subscribeForm, billingCycle: cycle, amountPaid: price });
                    }}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500"
                  >
                    <option value="monthly">Monthly Plan (30 Days)</option>
                    <option value="semester">Semester Plan (6 Months - 15% OFF)</option>
                    <option value="weekly">Weekly Trial (7 Days)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={subscribeForm.startDate}
                    onChange={e => setSubscribeForm({ ...subscribeForm, startDate: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Amount Paid (₹)</label>
                  <input
                    type="number"
                    value={subscribeForm.amountPaid}
                    onChange={e => setSubscribeForm({ ...subscribeForm, amountPaid: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={subscribeForm.paymentMethod}
                    onChange={e => setSubscribeForm({ ...subscribeForm, paymentMethod: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500"
                  >
                    <option value="UPI / GPay">UPI / GPay</option>
                    <option value="Cash / Desk">Cash at Mess Desk</option>
                    <option value="College Portal">College Portal</option>
                    <option value="Net Banking">Net Banking</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Diet Preference & Instructions</label>
                <input
                  type="text"
                  value={subscribeForm.dietPreference}
                  onChange={e => setSubscribeForm({ ...subscribeForm, dietPreference: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-orange-500"
                  placeholder="e.g. Pure Veg, Extra Roti, Less Spice, Jain"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSubscribeModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
                >
                  Confirm & Activate Subscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: EXTEND MEALS / DAYS ── */}
      {extendModalOpen && selectedSubForExtend && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Plus className="text-orange-500" size={18} />
                Add Meals / Extend Subscription
              </h3>
              <button
                onClick={() => setExtendModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-3 bg-orange-50 rounded-2xl border border-orange-100 text-xs mb-4">
              <p className="font-extrabold text-orange-950">
                Student: {selectedSubForExtend.userId?.name || 'Member'}
              </p>
              <p className="text-orange-700 mt-0.5">
                Current Remaining: <strong>{selectedSubForExtend.remainingMeals} Meals</strong> • Valid until: {new Date(selectedSubForExtend.endDate).toLocaleDateString('en-IN')}
              </p>
            </div>

            <form onSubmit={handleSaveExtend} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Add Extra Meals</label>
                  <input
                    type="number"
                    min="0"
                    value={extendForm.extraMeals}
                    onChange={e => setExtendForm({ ...extendForm, extraMeals: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500"
                  />
                  <span className="text-[10px] text-slate-400">e.g. +10, +20 meals</span>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Extend Validity (Days)</label>
                  <input
                    type="number"
                    min="0"
                    value={extendForm.extraDays}
                    onChange={e => setExtendForm({ ...extendForm, extraDays: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500"
                  />
                  <span className="text-[10px] text-slate-400">e.g. +7, +30 days</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason / Note</label>
                <input
                  type="text"
                  value={extendForm.reason}
                  onChange={e => setExtendForm({ ...extendForm, reason: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-orange-500"
                  placeholder="Student requested meal top-up"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setExtendModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
                >
                  Apply Extension
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: INDIVIDUAL SUBSCRIBER FULL DETAILS ── */}
      {subscriberDetailModalOpen && selectedSubscriber && (() => {
        const daysLeft = Math.ceil((new Date(selectedSubscriber.endDate).getTime() - Date.now()) / (1000 * 3600 * 24));
        const totalMealsCount = selectedSubscriber.totalMeals || (selectedSubscriber.billingCycle === 'semester' ? 360 : 60);
        const mealsPercent = Math.min(Math.round(((selectedSubscriber.remainingMeals || 0) / totalMealsCount) * 100), 100);
        const zoneObj = deliveryZones.find(z => z.code === selectedSubscriber.zoneCode);
        const studentOrders = getOrdersForSubscriber(selectedSubscriber);

        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-6 overflow-y-auto">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full my-auto overflow-hidden animate-scale-in">
              {/* Top Gradient Header */}
              <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 p-6 text-white relative">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-white text-orange-600 flex items-center justify-center font-black text-2xl shadow-lg shrink-0">
                      {(selectedSubscriber.userId?.name || 'S')[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-xl font-black tracking-tight">
                          {selectedSubscriber.userId?.name || 'Student Member'}
                        </h2>
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                          selectedSubscriber.status === 'active'
                            ? 'bg-emerald-500 text-white'
                            : selectedSubscriber.status === 'paused'
                            ? 'bg-amber-400 text-slate-900'
                            : 'bg-rose-500 text-white'
                        }`}>
                          {selectedSubscriber.status}
                        </span>
                      </div>
                      <p className="text-xs text-orange-100 flex items-center gap-1.5 mt-0.5">
                        <MapPin size={12} />
                        {selectedSubscriber.hostelAddress || 'Hostel Delivery'}
                      </p>
                      <p className="text-[11px] text-orange-200 font-mono mt-0.5">
                        Sub ID: #{selectedSubscriber._id}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSubscriberDetailModalOpen(false)}
                    className="p-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Direct Contact Buttons */}
                <div className="flex gap-2 mt-4 pt-3 border-t border-white/20">
                  <a
                    href={`tel:${selectedSubscriber.userId?.phone || ''}`}
                    className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-colors"
                  >
                    <Phone size={12} /> Call: {selectedSubscriber.userId?.phone || '-'}
                  </a>
                  <a
                    href={`mailto:${selectedSubscriber.userId?.email || ''}`}
                    className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-colors"
                  >
                    <Mail size={12} /> {selectedSubscriber.userId?.email || 'student@campus.edu'}
                  </a>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedSubscriber._id);
                      showToast('Subscription ID copied to clipboard!');
                    }}
                    className="inline-flex items-center gap-1 bg-white/15 hover:bg-white/25 text-white px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ml-auto"
                    title="Copy Subscription ID"
                  >
                    <Copy size={12} /> Copy ID
                  </button>
                </div>
              </div>

              {/* Tab Selector Inside Modal */}
              <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSubscriberDetailActiveTab('overview')}
                  className={`px-4 py-2 font-bold text-xs rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                    subscriberDetailActiveTab === 'overview'
                      ? 'bg-white text-orange-600 border-t border-x border-slate-200 shadow-2xs font-extrabold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Utensils size={13} /> Membership &amp; Kitchen Overview
                </button>
                <button
                  type="button"
                  onClick={() => setSubscriberDetailActiveTab('orders')}
                  className={`px-4 py-2 font-bold text-xs rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                    subscriberDetailActiveTab === 'orders'
                      ? 'bg-white text-orange-600 border-t border-x border-slate-200 shadow-2xs font-extrabold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Package size={13} /> Order History
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    subscriberDetailActiveTab === 'orders' ? 'bg-orange-100 text-orange-700' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {studentOrders.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSubscriberDetailModalOpen(false);
                    handleOpenSubscriberOrders(selectedSubscriber);
                  }}
                  className="ml-auto text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 pb-1 cursor-pointer"
                  title="Open dedicated subscriber orders view"
                >
                  <ExternalLink size={12} /> Open Full Orders Drawer
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                {subscriberDetailActiveTab === 'overview' ? (
                  <>
                    {/* 4 Metric Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Remaining Meals</p>
                        <p className="text-xl font-black text-slate-900 mt-1">
                          {selectedSubscriber.remainingMeals}
                          <span className="text-xs text-slate-400 font-normal ml-1">/ {totalMealsCount}</span>
                        </p>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${mealsPercent > 25 ? 'bg-orange-500' : 'bg-rose-500'}`}
                            style={{ width: `${mealsPercent}%` }}
                          />
                        </div>
                      </div>

                      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Campus Wallet</p>
                        <p className="text-xl font-black text-emerald-600 mt-1">
                          ₹{(Number(selectedSubscriber.userId?.walletBalance) || 0).toFixed(2)}
                        </p>
                        <span className="text-[10px] text-slate-400 mt-1 inline-block">Refunds &amp; Add-ons</span>
                      </div>

                      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Membership Validity</p>
                        <p className="text-xl font-black text-slate-900 mt-1">
                          {daysLeft < 0 ? '0' : daysLeft} <span className="text-xs font-normal text-slate-400">Days</span>
                        </p>
                        <span className={`text-[10px] font-bold mt-1 inline-block ${daysLeft <= 5 ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {daysLeft < 0 ? 'Expired' : `Till ${new Date(selectedSubscriber.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                        </span>
                      </div>

                      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Food Orders Placed</p>
                        <p className="text-xl font-black text-slate-900 mt-1">
                          {studentOrders.length} <span className="text-xs font-normal text-slate-400">Orders</span>
                        </p>
                        <button
                          type="button"
                          onClick={() => setSubscriberDetailActiveTab('orders')}
                          className="text-[10px] text-orange-600 font-bold hover:underline mt-1 inline-block cursor-pointer"
                        >
                          View History ➔
                        </button>
                      </div>
                    </div>

                    {/* 2-Column Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left Column: Plan & Meal Customization */}
                      <div className="border border-slate-200 rounded-2xl p-4 space-y-3 bg-white shadow-2xs">
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                          <Utensils size={13} className="text-orange-500" /> Plan &amp; Kitchen Diet Info
                        </h3>

                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between items-center py-1 border-b border-slate-50">
                            <span className="text-slate-500">Plan Name:</span>
                            <span className="font-bold text-orange-600">{selectedSubscriber.planId?.name || 'Standard Plan'}</span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-slate-50">
                            <span className="text-slate-500">Meals Per Day:</span>
                            <span className="font-bold text-slate-800">{selectedSubscriber.planId?.mealsPerDay || 2} Meals (Lunch + Dinner)</span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-slate-50">
                            <span className="text-slate-500">Dietary Preference:</span>
                            <span className="font-bold text-slate-800 bg-orange-50 text-orange-700 px-2 py-0.5 rounded-md">
                              {selectedSubscriber.dietPreference || 'Standard Homestyle'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-slate-50">
                            <span className="text-slate-500">Payment Mode:</span>
                            <span className="font-bold text-slate-800">{selectedSubscriber.paymentMethod || 'UPI / Campus Wallet'}</span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-slate-50">
                            <span className="text-slate-500">Meals Skipped:</span>
                            <span className="font-bold text-slate-800">
                              {selectedSubscriber.skippedMeals || 0} Skipped (+{selectedSubscriber.skippedMeals || 0} Meals Added to Balance)
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-1">
                            <span className="text-slate-500">Packaging Type:</span>
                            <span className="font-bold text-slate-800">Hot Insulated Stainless Steel Tiffin</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Column: Hostel & Delivery Operations */}
                      <div className="border border-slate-200 rounded-2xl p-4 space-y-3 bg-white shadow-2xs">
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                          <Truck size={13} className="text-orange-500" /> Hostel Delivery &amp; Logistics
                        </h3>

                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between items-center py-1 border-b border-slate-50">
                            <span className="text-slate-500">Hostel Address:</span>
                            <span className="font-bold text-slate-900 text-right max-w-[180px] truncate">
                              {selectedSubscriber.hostelAddress || 'Hostel Room'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-slate-50">
                            <span className="text-slate-500">Room Number:</span>
                            <span className="font-bold text-slate-800">Room {selectedSubscriber.room || '204'}</span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-slate-50">
                            <span className="text-slate-500">Delivery Zone:</span>
                            <span className="font-black text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-md">
                              {selectedSubscriber.zoneCode || 'NC-01'} • {zoneObj?.name || 'North Campus'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-slate-50">
                            <span className="text-slate-500">Assigned Rider:</span>
                            <span className="font-bold text-slate-800 flex items-center gap-1">
                              <Bike size={11} className="text-orange-500" />
                              {zoneObj?.assignedRider?.split('(')[0]?.trim() || 'Unassigned'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-slate-50">
                            <span className="text-slate-500">Lunch Delivery Slot:</span>
                            <span className="font-bold text-slate-800">12:15 PM - 01:15 PM</span>
                          </div>
                          <div className="flex justify-between items-center py-1">
                            <span className="text-slate-500">Dinner Delivery Slot:</span>
                            <span className="font-bold text-slate-800">07:30 PM - 08:30 PM</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Important Dates info */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-orange-500" />
                        <strong>Start Date:</strong> {new Date(selectedSubscriber.startDate || selectedSubscriber.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={13} className="text-orange-500" />
                        <strong>Expiry / Renewal:</strong> {new Date(selectedSubscriber.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck size={13} className="text-emerald-600" />
                        <strong>Plan Guarantee:</strong> Homestyle Quality Assured
                      </span>
                    </div>
                  </>
                ) : (
                  /* ── ORDER HISTORY TAB INSIDE DETAILS MODAL ── */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div>
                        <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                          <Package size={16} className="text-orange-500" /> Orders Placed by {selectedSubscriber.userId?.name || 'Student'}
                        </h4>
                        <p className="text-xs text-slate-500">
                          Total of {studentOrders.length} food orders recorded from this account
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSubscriberDetailModalOpen(false);
                          handleOpenSubscriberOrders(selectedSubscriber);
                        }}
                        className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs rounded-xl border border-orange-200 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <ExternalLink size={12} /> Detailed History Drawer
                      </button>
                    </div>

                    {studentOrders.length === 0 ? (
                      <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <Package size={36} className="text-slate-300 mx-auto mb-2" />
                        <p className="font-bold text-slate-700 text-sm">No food orders placed yet</p>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                          This student is currently receiving their daily meal plan tiffins. Any extra food or a-la-carte dishes ordered will appear here.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {studentOrders.map(order => {
                          const statusColors: Record<string, string> = {
                            confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
                            preparing: 'bg-amber-50 text-amber-700 border-amber-200',
                            'on-the-way': 'bg-purple-50 text-purple-700 border-purple-200',
                            delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                            cancelled: 'bg-rose-50 text-rose-700 border-rose-200'
                          };

                          return (
                            <div
                              key={order._id || order.orderId}
                              className="border border-slate-200 rounded-2xl p-4 bg-white shadow-2xs hover:shadow-xs transition space-y-3"
                            >
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-2.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-mono font-black text-orange-600 text-xs">
                                    #{order.orderId || (order._id ? order._id.slice(-6).toUpperCase() : 'ORD')}
                                  </span>
                                  <span className="text-[11px] text-slate-400">
                                    {order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Recent'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase border ${statusColors[order.status] || 'bg-slate-100 text-slate-700'}`}>
                                    {order.status}
                                  </span>
                                  <span className="font-black text-slate-900 text-sm">
                                    ₹{order.totalAmount || 0}
                                  </span>
                                </div>
                              </div>

                              {/* Items list */}
                              <div className="space-y-1">
                                {order.items?.map((it: any, idx: number) => (
                                  <div key={idx} className="flex justify-between items-center text-xs text-slate-700">
                                    <span className="flex items-center gap-1.5">
                                      <span className="font-bold text-slate-900 bg-slate-100 px-1.5 py-0.2 rounded text-[11px]">
                                        {it.quantity}x
                                      </span>
                                      <span>{it.name}</span>
                                    </span>
                                    <span className="text-slate-500 font-medium">₹{(it.price || 0) * (it.quantity || 1)}</span>
                                  </div>
                                ))}
                              </div>

                              {/* Footer details & quick update */}
                              <div className="pt-2 border-t border-slate-100 flex flex-wrap justify-between items-center gap-2 text-xs">
                                <div className="flex items-center gap-2 text-slate-500">
                                  <span>Mode: <strong className="text-slate-800">{order.paymentMethod || 'COD'}</strong></span>
                                  <span>•</span>
                                  <span className={order.paymentStatus === 'paid' ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                                    {order.paymentStatus === 'paid' ? '✓ Paid' : '💵 Payment Pending'}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1.5 ml-auto">
                                  <select
                                    value={order.status}
                                    onChange={e => handleUpdateOrderStatus(order.orderId || order._id, e.target.value)}
                                    className="text-xs font-bold border border-slate-200 rounded-lg px-2 py-1 bg-slate-50 text-slate-800 focus:outline-none focus:border-orange-500 shadow-2xs cursor-pointer"
                                  >
                                    <option value="confirmed">Confirmed</option>
                                    <option value="preparing">Preparing</option>
                                    <option value="on-the-way">On The Way</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      handleTogglePause(selectedSubscriber._id);
                      setSelectedSubscriber(prev => prev ? { ...prev, status: prev.status === 'paused' ? 'active' : 'paused' } : null);
                    }}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs cursor-pointer shadow-2xs"
                  >
                    {selectedSubscriber.status === 'paused' ? 'Resume Membership' : 'Pause Membership'}
                  </button>
                  <button
                    onClick={() => {
                      setSubscriberDetailModalOpen(false);
                      handleOpenExtend(selectedSubscriber);
                    }}
                    className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 font-bold rounded-xl text-xs cursor-pointer shadow-2xs"
                  >
                    + Add Extra Meals
                  </button>
                  <button
                    onClick={() => {
                      handleRenewSub(selectedSubscriber);
                      setSubscriberDetailModalOpen(false);
                    }}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold rounded-xl text-xs cursor-pointer shadow-2xs"
                  >
                    1-Click Renew
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to cancel subscription for ${selectedSubscriber.userId?.name}?`)) {
                        handleCancelSub(selectedSubscriber._id);
                        setSubscriberDetailModalOpen(false);
                      }
                    }}
                    className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Cancel Membership
                  </button>
                </div>

                <button
                  onClick={() => setSubscriberDetailModalOpen(false)}
                  className="px-5 py-2 bg-slate-900 hover:bg-black text-white font-bold rounded-xl text-xs cursor-pointer shadow-md transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── MODAL: DEDICATED SUBSCRIBER ORDER & DELIVERY HISTORY ── */}
      {subscriberOrdersModalOpen && selectedSubForOrders && (() => {
        const sub = selectedSubForOrders;
        const studentName = sub.userId?.name || 'Student Member';
        const studentEmail = sub.userId?.email || 'student@campus.edu';
        const studentPhone = sub.userId?.phone || '';
        const subId = sub._id || (sub as any).id;
        const planName = sub.planId?.name || 'Standard Plan';
        const zoneObj = deliveryZones.find(z => z.code === sub.zoneCode);

        // Data arrays
        const ordersList: any[] = subscriberOrderData?.orders || getOrdersForSubscriber(sub);
        const dispatchesList: any[] = subscriberOrderData?.dispatches || dispatchRoster.filter(d => (d.student || '').toLowerCase().includes(studentName.toLowerCase()));
        const skipsList: any[] = subscriberOrderData?.skips || skipRequests.filter(s => (s.student || '').toLowerCase().includes(studentName.toLowerCase()));
        const subsList: any[] = subscriberOrderData?.subscriptionHistory || [sub];

        // Stats
        const totalOrdersCount = ordersList.length;
        const totalFoodSpend = ordersList.reduce((acc, o) => acc + (Number(o.totalAmount) || 0), 0);
        const deliveredCount = ordersList.filter(o => o.status === 'delivered').length;
        const pendingCount = ordersList.filter(o => ['confirmed', 'preparing', 'on-the-way'].includes(o.status)).length;
        const tiffinsDelivered = dispatchesList.filter(d => d.status === 'delivered').length;
        const skipsTotalRefund = skipsList.reduce((acc, s) => {
          const match = String(s.refundStatus || s.credit || '').match(/\d+/);
          return acc + (match ? Number(match[0]) : 60);
        }, 0);

        // Filtered Orders
        const filteredFoodOrders = ordersList
          .filter(o => {
            if (subOrdersStatusFilter === 'all') return true;
            return o.status === subOrdersStatusFilter;
          })
          .filter(o => {
            if (!subOrdersSearch) return true;
            const q = subOrdersSearch.toLowerCase();
            return (
              (o.orderId || '').toLowerCase().includes(q) ||
              (o.items || []).some((it: any) => (it.name || '').toLowerCase().includes(q)) ||
              (o.deliveryAddress || '').toLowerCase().includes(q)
            );
          });

        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-6 overflow-y-auto">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full my-auto overflow-hidden animate-scale-in flex flex-col max-h-[92vh]">
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 p-6 text-white relative shrink-0">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-white text-orange-600 flex items-center justify-center font-black text-2xl shadow-lg shrink-0">
                      {studentName[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                          {studentName}
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-xs">
                            Order History
                          </span>
                        </h2>
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                          sub.status === 'active'
                            ? 'bg-emerald-500 text-white'
                            : sub.status === 'paused'
                            ? 'bg-amber-400 text-slate-900'
                            : 'bg-rose-500 text-white'
                        }`}>
                          {sub.status} Subscriber
                        </span>
                      </div>
                      <p className="text-xs text-orange-100 flex items-center gap-1.5 mt-0.5">
                        <MapPin size={12} />
                        {sub.hostelAddress || 'Hostel Delivery'} {sub.room ? `• Room ${sub.room}` : ''} ({sub.zoneCode || 'NC-01'})
                      </p>
                      <p className="text-[11px] text-orange-200 font-mono mt-0.5">
                        Plan: <strong>{planName}</strong> • Sub ID: #{subId}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSubscriberOrdersModalOpen(false)}
                    className="p-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Quick Action Badges */}
                <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-white/20 text-xs">
                  <a
                    href={`tel:${studentPhone}`}
                    className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white px-3 py-1.5 rounded-xl font-bold transition-colors"
                  >
                    <Phone size={12} /> {studentPhone}
                  </a>
                  <a
                    href={`mailto:${studentEmail}`}
                    className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white px-3 py-1.5 rounded-xl font-bold transition-colors"
                  >
                    <Mail size={12} /> {studentEmail}
                  </a>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(subId);
                      showToast('Subscription ID copied to clipboard!');
                    }}
                    className="inline-flex items-center gap-1 bg-white/15 hover:bg-white/25 text-white px-2.5 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ml-auto"
                  >
                    <Copy size={12} /> Copy Sub ID
                  </button>
                </div>
              </div>

              {/* 4 Summary Metric Cards */}
              <div className="p-5 pb-3 border-b border-slate-100 bg-slate-50/60 shrink-0">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <ShoppingBag size={11} className="text-orange-500" /> Food Orders Placed
                    </p>
                    <p className="text-xl font-black text-slate-900 mt-1">
                      {totalOrdersCount} <span className="text-xs text-slate-400 font-normal">orders</span>
                    </p>
                    <span className="text-[10px] text-orange-600 font-bold mt-0.5 inline-block">
                      ₹{totalFoodSpend.toLocaleString('en-IN')} Total Spent
                    </span>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Truck size={11} className="text-emerald-500" /> Daily Tiffins Delivered
                    </p>
                    <p className="text-xl font-black text-slate-900 mt-1">
                      {tiffinsDelivered} <span className="text-xs text-slate-400 font-normal">tiffins</span>
                    </p>
                    <span className="text-[10px] text-emerald-600 font-bold mt-0.5 inline-block">
                      {sub.remainingMeals ?? 0} Meals Remaining
                    </span>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <RotateCcw size={11} className="text-amber-500" /> Meal Skips &amp; Rollovers
                    </p>
                    <p className="text-xl font-black text-slate-900 mt-1">
                      {skipsList.length} <span className="text-xs text-slate-400 font-normal">skipped</span>
                    </p>
                    <span className="text-[10px] text-emerald-600 font-bold mt-0.5 inline-block">
                      +{skipsList.length} Meals Added to Balance
                    </span>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Wallet size={11} className="text-purple-500" /> Campus Wallet Balance
                    </p>
                    <p className="text-xl font-black text-emerald-600 mt-1">
                      ₹{(Number(sub.userId?.walletBalance) || 0).toFixed(2)}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-0.5 inline-block capitalize">
                      {sub.billingCycle} membership
                    </span>
                  </div>
                </div>
              </div>

              {/* Sub-Tabs & Filtering Toolbar */}
              <div className="px-6 py-3 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-white shrink-0">
                {/* Tabs */}
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setSubOrdersTab('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                      subOrdersTab === 'all'
                        ? 'bg-orange-500 text-white shadow-xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <span>All Activity</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${subOrdersTab === 'all' ? 'bg-white/20' : 'bg-slate-200 text-slate-700'}`}>
                      {ordersList.length + dispatchesList.length + skipsList.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setSubOrdersTab('food')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                      subOrdersTab === 'food'
                        ? 'bg-orange-500 text-white shadow-xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <Package size={12} />
                    <span>Food Orders</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${subOrdersTab === 'food' ? 'bg-white/20' : 'bg-slate-200 text-slate-700'}`}>
                      {ordersList.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setSubOrdersTab('tiffins')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                      subOrdersTab === 'tiffins'
                        ? 'bg-orange-500 text-white shadow-xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <Truck size={12} />
                    <span>Daily Tiffins</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${subOrdersTab === 'tiffins' ? 'bg-white/20' : 'bg-slate-200 text-slate-700'}`}>
                      {dispatchesList.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setSubOrdersTab('skips')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                      subOrdersTab === 'skips'
                        ? 'bg-orange-500 text-white shadow-xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <RotateCcw size={12} />
                    <span>Meal Skips</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${subOrdersTab === 'skips' ? 'bg-white/20' : 'bg-slate-200 text-slate-700'}`}>
                      {skipsList.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setSubOrdersTab('subs')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                      subOrdersTab === 'subs'
                        ? 'bg-orange-500 text-white shadow-xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <FileText size={12} />
                    <span>Plans &amp; Invoices</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${subOrdersTab === 'subs' ? 'bg-white/20' : 'bg-slate-200 text-slate-700'}`}>
                      {subsList.length}
                    </span>
                  </button>
                </div>

                {/* Filter and Search */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <div className="relative flex-1 md:w-48">
                    <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search orders or dishes..."
                      value={subOrdersSearch}
                      onChange={e => setSubOrdersSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  {(subOrdersTab === 'all' || subOrdersTab === 'food') && (
                    <select
                      value={subOrdersStatusFilter}
                      onChange={e => setSubOrdersStatusFilter(e.target.value)}
                      className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-orange-500"
                    >
                      <option value="all">All Statuses</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="preparing">Preparing</option>
                      <option value="on-the-way">On The Way</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  )}
                </div>
              </div>

              {/* Scrollable Order Content */}
              <div className="p-6 overflow-y-auto space-y-4 flex-1">
                {loadingSubscriberOrders ? (
                  <div className="py-16 text-center text-slate-500">
                    <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="font-bold text-sm text-slate-700">Loading subscriber order history...</p>
                    <p className="text-xs text-slate-400">Fetching live order records from kitchen database</p>
                  </div>
                ) : (
                  <>
                    {/* SECTION 1: FOOD ORDERS */}
                    {(subOrdersTab === 'all' || subOrdersTab === 'food') && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                            <Package size={14} className="text-orange-500" /> Food &amp; A-la-carte Orders ({filteredFoodOrders.length})
                          </h3>
                          <span className="text-[11px] text-slate-400">
                            {filteredFoodOrders.length} matching order{filteredFoodOrders.length === 1 ? '' : 's'}
                          </span>
                        </div>

                        {filteredFoodOrders.length === 0 ? (
                          <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <Package size={32} className="text-slate-300 mx-auto mb-1.5" />
                            <p className="font-bold text-slate-700 text-xs">No food orders matching criteria</p>
                            <p className="text-[11px] text-slate-400">Student has not placed instant orders with this filter.</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {filteredFoodOrders.map(order => {
                              const statusColors: Record<string, string> = {
                                confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
                                preparing: 'bg-amber-50 text-amber-700 border-amber-200',
                                'on-the-way': 'bg-purple-50 text-purple-700 border-purple-200',
                                delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                                cancelled: 'bg-rose-50 text-rose-700 border-rose-200'
                              };

                              return (
                                <div
                                  key={order._id || order.orderId}
                                  className="border border-slate-200 rounded-2xl p-4 bg-white shadow-2xs hover:shadow-xs transition space-y-3"
                                >
                                  {/* Card Top */}
                                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-2.5">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-mono font-black text-orange-600 text-xs">
                                        #{order.orderId || (order._id ? order._id.slice(-6).toUpperCase() : 'ORD')}
                                      </span>
                                      <span className="text-[11px] text-slate-400">
                                        {order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Recent'}
                                      </span>
                                      <span className="text-slate-300">•</span>
                                      <span className="text-xs text-slate-600 flex items-center gap-1 font-medium">
                                        <MapPin size={11} className="text-orange-500" />
                                        {order.deliveryAddress || sub.hostelAddress || 'Hostel Delivery'}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase border ${statusColors[order.status] || 'bg-slate-100 text-slate-700'}`}>
                                        {order.status}
                                      </span>
                                      <span className="font-black text-slate-900 text-base">
                                        ₹{order.totalAmount || 0}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Items Table / Pills */}
                                  <div className="bg-slate-50/70 rounded-xl p-3 border border-slate-100 space-y-1.5">
                                    {order.items?.map((it: any, idx: number) => (
                                      <div key={idx} className="flex justify-between items-center text-xs">
                                        <div className="flex items-center gap-2">
                                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Veg Dish" />
                                          <span className="font-bold text-slate-900">
                                            {it.quantity}x
                                          </span>
                                          <span className="text-slate-800 font-medium">
                                            {it.name}
                                          </span>
                                        </div>
                                        <span className="text-slate-600 font-bold">
                                          ₹{(it.price || 0) * (it.quantity || 1)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Card Bottom / Controls */}
                                  <div className="pt-2 border-t border-slate-100 flex flex-wrap justify-between items-center gap-3 text-xs">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-slate-500">
                                        Payment: <strong className="text-slate-800">{order.paymentMethod || 'Cash on Delivery'}</strong>
                                      </span>
                                      <span>•</span>
                                      {order.paymentStatus === 'paid' ? (
                                        <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-bold text-[10px]">
                                          ✓ Payment Completed
                                        </span>
                                      ) : (
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md font-bold text-[10px]">
                                            💵 COD Pending
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => handleQuickUpdateSubOrderStatus(order.orderId || order._id, order.status, 'paid')}
                                            className="text-[9px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2 py-0.5 rounded shadow-2xs cursor-pointer transition-colors"
                                          >
                                            Mark Paid
                                          </button>
                                        </div>
                                      )}

                                      {order.deliveryPartner?.name && (
                                        <>
                                          <span>•</span>
                                          <span className="text-slate-500 flex items-center gap-1">
                                            <Bike size={11} className="text-orange-500" />
                                            Rider: <strong className="text-slate-700">{order.deliveryPartner.name}</strong>
                                          </span>
                                        </>
                                      )}
                                    </div>

                                    {/* Status update dropdown */}
                                    <div className="flex items-center gap-1.5 ml-auto">
                                      <span className="text-[11px] text-slate-400 font-medium">Update Status:</span>
                                      <select
                                        value={order.status}
                                        onChange={e => handleQuickUpdateSubOrderStatus(order.orderId || order._id, e.target.value)}
                                        className="text-xs font-bold border border-slate-200 rounded-lg px-2.5 py-1 bg-white text-slate-800 focus:outline-none focus:border-orange-500 shadow-2xs cursor-pointer"
                                      >
                                        <option value="confirmed">Confirmed</option>
                                        <option value="preparing">Preparing / Cooking</option>
                                        <option value="on-the-way">On The Way</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                      </select>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* SECTION 2: DAILY TIFFIN DISPATCHES */}
                    {(subOrdersTab === 'all' || subOrdersTab === 'tiffins') && (
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                            <Truck size={14} className="text-emerald-500" /> Daily Tiffin Deliveries ({dispatchesList.length})
                          </h3>
                          <span className="text-[11px] text-slate-400">Regular meal plan deliveries to room</span>
                        </div>

                        {dispatchesList.length === 0 ? (
                          <div className="py-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <p className="font-bold text-slate-600 text-xs">No dispatch roster records found for this student name</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {dispatchesList.map(disp => (
                              <div
                                key={disp.id || disp._id}
                                className="border border-slate-200 rounded-2xl p-3.5 bg-white shadow-2xs space-y-2 text-xs"
                              >
                                <div className="flex justify-between items-center">
                                  <span className="font-mono font-bold text-slate-900">
                                    #{disp.id || disp._id}
                                  </span>
                                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                                    disp.status === 'delivered'
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                                  }`}>
                                    {disp.status}
                                  </span>
                                </div>

                                <div className="space-y-1 text-slate-600">
                                  <p><strong>Slot:</strong> {disp.slot || 'Lunch & Dinner'}</p>
                                  <p><strong>Plan:</strong> {disp.plan || planName}</p>
                                  <p><strong>Rider Assigned:</strong> {disp.rider || 'Unassigned'}</p>
                                  <p><strong>Delivery Address:</strong> {disp.hostel || sub.hostelAddress}</p>
                                </div>

                                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex justify-between">
                                  <span>{disp.deliveredAt ? `Delivered: ${disp.deliveredAt}` : 'Scheduled for today'}</span>
                                  <span>{disp.zoneName || sub.zoneCode || 'North Campus'}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* SECTION 3: MEAL SKIP REQUESTS */}
                    {(subOrdersTab === 'all' || subOrdersTab === 'skips') && (
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                            <RotateCcw size={14} className="text-amber-500" /> Meal Skips &amp; Rollover to Balance ({skipsList.length})
                          </h3>
                          <span className="text-[11px] text-slate-400">Meal skips saved and added as +1 meal to balance</span>
                        </div>

                        {skipsList.length === 0 ? (
                          <div className="py-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <p className="font-bold text-slate-600 text-xs">No meal skips requested by this student</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {skipsList.map(skip => (
                              <div
                                key={skip.id || skip._id}
                                className="border border-slate-200 rounded-2xl p-3.5 bg-white shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs"
                              >
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-900">{skip.mealSlot || 'Scheduled Meal'}</span>
                                    <span className="text-slate-400">•</span>
                                    <span className="text-slate-500 font-medium">Date: {skip.date || 'Recent'}</span>
                                    <span className={`text-[10px] font-black px-2 py-0.2 rounded-full uppercase ${
                                      skip.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'
                                    }`}>
                                      {skip.status || 'approved'}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-500 mt-0.5">
                                    Reason: {skip.reason || 'Student leave/travel'}
                                  </p>
                                </div>

                                <div className="text-right">
                                  <span className="text-emerald-700 font-black bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg inline-block">
                                    {skip.refundStatus || '+1 Meal Added to Balance'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* SECTION 4: SUBSCRIPTION BILLING & INVOICES */}
                    {(subOrdersTab === 'all' || subOrdersTab === 'subs') && (
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                            <FileText size={14} className="text-purple-500" /> Subscription Plan Purchases &amp; Invoices ({subsList.length})
                          </h3>
                          <span className="text-[11px] text-slate-400">Membership enrollment records</span>
                        </div>

                        <div className="space-y-2">
                          {subsList.map(item => (
                            <div
                              key={item._id || item.id}
                              className="border border-slate-200 rounded-2xl p-4 bg-white shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs"
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-orange-600 text-sm">
                                    {item.planId?.name || planName}
                                  </span>
                                  <span className="text-[10px] bg-orange-50 text-orange-700 border border-orange-200 font-bold px-2 py-0.2 rounded capitalize">
                                    {item.billingCycle || 'Monthly'} Cycle
                                  </span>
                                  <span className="text-slate-400">•</span>
                                  <span className="font-mono text-slate-500 text-[11px]">#{item._id || item.id}</span>
                                </div>
                                <p className="text-[11px] text-slate-500 mt-1">
                                  Valid from {new Date(item.startDate || Date.now()).toLocaleDateString('en-IN')} till {new Date(item.endDate).toLocaleDateString('en-IN')}
                                </p>
                              </div>

                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <p className="font-black text-slate-900 text-base">
                                    ₹{(item.amountPaid || 0).toLocaleString('en-IN')}
                                  </p>
                                  <span className="text-[10px] text-emerald-600 font-bold">
                                    {item.paymentMethod || 'Online Paid'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Modal Footer */}
              <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      handleOpenExtend(sub);
                    }}
                    className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 font-bold rounded-xl text-xs cursor-pointer shadow-2xs"
                  >
                    + Add Extra Meals
                  </button>
                  <button
                    onClick={() => {
                      handleRenewSub(sub);
                    }}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold rounded-xl text-xs cursor-pointer shadow-2xs"
                  >
                    1-Click Renew
                  </button>
                  <button
                    onClick={() => {
                      handleOpenSubscriberOrders(sub);
                    }}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs cursor-pointer shadow-2xs"
                  >
                    Refresh Orders
                  </button>
                </div>

                <button
                  onClick={() => setSubscriberOrdersModalOpen(false)}
                  className="px-5 py-2 bg-slate-900 hover:bg-black text-white font-bold rounded-xl text-xs cursor-pointer shadow-md transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── MODAL: ADD / EDIT DISH ── */}
      {dishModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  <ChefHat size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {editingDish ? `Edit Dish: ${editingDish.name}` : 'Add New Dish to Store Menu'}
                  </h3>
                  <p className="text-[11px] text-slate-500">Live synchronized with student /menu and home delivery page</p>
                </div>
              </div>
              <button
                onClick={() => setDishModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveDish} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Dish Name *</label>
                  <input
                    type="text"
                    required
                    value={dishForm.name}
                    onChange={e => setDishForm({ ...dishForm, name: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500"
                    placeholder="e.g. Special Shahi Paneer Thali"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={dishForm.category}
                    onChange={e => setDishForm({ ...dishForm, category: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500 bg-white"
                  >
                    <option value="thali">🍱 Thali &amp; Combos</option>
                    <option value="biryani">🥘 Biryani &amp; Rice</option>
                    <option value="curries">🍲 Curries &amp; Breads</option>
                    <option value="burgers">🍔 Burgers</option>
                    <option value="rolls">🌯 Kathi Rolls</option>
                    <option value="momos">🥟 Momos &amp; Dimsums</option>
                    <option value="fries">🍟 Fries &amp; Sides</option>
                    <option value="chinese">🍜 Chinese &amp; Chowmein</option>
                    <option value="south-indian">🫔 South Indian</option>
                    <option value="pizza">🍕 Pizza &amp; Bakes</option>
                    <option value="healthy">🥗 Fitness &amp; Healthy</option>
                    <option value="desserts">🍨 Desserts &amp; Sweets</option>
                    <option value="beverages">🥤 Shakes &amp; Coolers</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Portion / Serves</label>
                  <input
                    type="text"
                    value={dishForm.serves}
                    onChange={e => setDishForm({ ...dishForm, serves: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500"
                    placeholder="e.g. 1 Person, 1-2 Persons"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={dishForm.price}
                    onChange={e => setDishForm({ ...dishForm, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Original / Strike Price (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={dishForm.originalPrice}
                    onChange={e => setDishForm({ ...dishForm, originalPrice: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500"
                    placeholder="e.g. 180"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Prep Time</label>
                  <input
                    type="text"
                    value={dishForm.prepTime}
                    onChange={e => setDishForm({ ...dishForm, prepTime: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500"
                    placeholder="e.g. 20-25 mins"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tag / Promo Badge</label>
                  <input
                    type="text"
                    value={dishForm.tag}
                    onChange={e => setDishForm({ ...dishForm, tag: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500"
                    placeholder="e.g. Bestseller 🔥, Chef Special ⭐"
                  />
                </div>
              </div>

              {/* Image URL & Live Preview */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Dish Image URL</label>
                <div className="flex gap-2 items-center">
                  <div className="w-12 h-12 rounded-xl border border-slate-200 overflow-hidden bg-slate-100 shrink-0">
                    <img
                      src={dishForm.image || 'https://images.pexels.com/photos/12737656/pexels-photo-12737656.jpeg?auto=compress&cs=tinysrgb&w=150'}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={e => {
                        (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/12737656/pexels-photo-12737656.jpeg?auto=compress&cs=tinysrgb&w=150';
                      }}
                    />
                  </div>
                  <input
                    type="text"
                    value={dishForm.image}
                    onChange={e => setDishForm({ ...dishForm, image: e.target.value })}
                    className="flex-1 px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-orange-500"
                    placeholder="https://images.pexels.com/..."
                  />
                </div>

                {/* Quick Preset Image Selectors */}
                <div className="mt-2">
                  <span className="text-[10px] text-slate-400 block mb-1">Quick Food Photo Presets (Click to autofill):</span>
                  <div className="flex flex-wrap gap-1 text-[10px]">
                    {[
                      { label: '🍱 Thali', url: 'https://images.pexels.com/photos/12737656/pexels-photo-12737656.jpeg?auto=compress&cs=tinysrgb&w=600' },
                      { label: '🥘 Biryani', url: 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=600' },
                      { label: '🍲 Curry', url: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=600' },
                      { label: '🍔 Burger', url: 'https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg?auto=compress&cs=tinysrgb&w=600' },
                      { label: '🌯 Roll', url: 'https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg?auto=compress&cs=tinysrgb&w=600' },
                      { label: '🥟 Momos', url: 'https://images.pexels.com/photos/5409015/pexels-photo-5409015.jpeg?auto=compress&cs=tinysrgb&w=600' },
                      { label: '🍟 Fries', url: 'https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg?auto=compress&cs=tinysrgb&w=600' },
                      { label: '🍜 Chinese', url: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=600' },
                      { label: '🫔 Dosa', url: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=600' },
                      { label: '🍕 Pizza', url: 'https://images.pexels.com/photos/825661/pexels-photo-825661.jpeg?auto=compress&cs=tinysrgb&w=600' },
                      { label: '🥗 Healthy', url: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600' },
                      { label: '🍨 Dessert', url: 'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg?auto=compress&cs=tinysrgb&w=600' },
                      { label: '🥤 Shake', url: 'https://images.pexels.com/photos/109275/pexels-photo-109275.jpeg?auto=compress&cs=tinysrgb&w=600' }
                    ].map(preset => (
                      <button
                        type="button"
                        key={preset.label}
                        onClick={() => setDishForm({ ...dishForm, image: preset.url })}
                        className="px-2 py-0.5 bg-slate-100 hover:bg-orange-50 hover:text-orange-600 rounded-md border border-slate-200 transition cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={dishForm.description}
                  onChange={e => setDishForm({ ...dishForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-orange-500"
                  placeholder="Describe meal ingredients, aroma and taste..."
                />
              </div>

              {/* Ingredients */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ingredients (Comma Separated)
                </label>
                <input
                  type="text"
                  value={dishForm.ingredients}
                  onChange={e => setDishForm({ ...dishForm, ingredients: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-orange-500"
                  placeholder="e.g. Fresh Paneer, Desi Ghee, Basmati Rice, Butter Roti, Dal Makhani"
                />
                {dishForm.ingredients && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {dishForm.ingredients.split(',').map(s => s.trim()).filter(Boolean).map((ing, i) => (
                      <span key={i} className="text-[10px] bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-md font-medium">
                        {ing}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Nutritional Details */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Calories (kcal)</label>
                  <input
                    type="number"
                    value={dishForm.calories}
                    onChange={e => setDishForm({ ...dishForm, calories: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Protein</label>
                  <input
                    type="text"
                    value={dishForm.protein}
                    onChange={e => setDishForm({ ...dishForm, protein: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold"
                    placeholder="e.g. 16g"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Spice Level</label>
                  <select
                    value={dishForm.spiceLevel}
                    onChange={e => setDishForm({ ...dishForm, spiceLevel: e.target.value as any })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold bg-white"
                  >
                    <option value="Mild">Mild</option>
                    <option value="Medium">Medium</option>
                    <option value="Spicy">Spicy</option>
                  </select>
                </div>
              </div>

              {/* Checkboxes: Veg & In Stock */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-wrap items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dishForm.isVeg}
                    onChange={e => setDishForm({ ...dishForm, isVeg: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                  />
                  <span>Vegetarian Dish 🟢</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dishForm.isAvailable}
                    onChange={e => setDishForm({ ...dishForm, isAvailable: e.target.checked })}
                    className="w-4 h-4 text-orange-600 rounded cursor-pointer"
                  />
                  <span>Ready &amp; In Stock (Available in Store) 🟢</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDishModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer"
                >
                  {editingDish ? 'Update Dish' : 'Create & Publish Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: CREDIT USER WALLET ── */}
      {userWalletModalOpen && selectedUserForWallet && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Wallet className="text-emerald-600" size={20} />
                Credit Student Wallet
              </h3>
              <button
                onClick={() => setUserWalletModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl mb-4 border border-slate-100">
              <p className="text-xs font-bold text-slate-900">{selectedUserForWallet.name}</p>
              <p className="text-[11px] text-slate-500">{selectedUserForWallet.email}</p>
              <p className="text-xs font-extrabold text-emerald-700 mt-1">
                Current Balance: ₹{(selectedUserForWallet.walletBalance || 0).toLocaleString('en-IN')}
              </p>
            </div>

            <form onSubmit={handleCreditUserWallet} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Credit Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min="10"
                  max="50000"
                  value={walletCreditAmount}
                  onChange={e => setWalletCreditAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-base font-black text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason / Note</label>
                <input
                  type="text"
                  value={walletCreditReason}
                  onChange={e => setWalletCreditReason(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. Compensation, meal skip reimbursement"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setUserWalletModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
                >
                  Add ₹{walletCreditAmount} to Wallet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: CREATE COUPON ── */}
      {couponModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Tag className="text-orange-500" size={20} />
                Create New Promo Coupon
              </h3>
              <button
                onClick={() => setCouponModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Coupon Code *</label>
                  <input
                    type="text"
                    required
                    value={couponForm.code}
                    onChange={e => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-black uppercase font-mono tracking-wider focus:outline-none focus:border-orange-500"
                    placeholder="e.g. DIWALI50 or CAMPUS20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Discount Type</label>
                  <select
                    value={couponForm.type}
                    onChange={e => setCouponForm({ ...couponForm, type: e.target.value as any })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500"
                  >
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Flat">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Value ({couponForm.type === 'Percentage' ? '%' : '₹'}) *</label>
                  <input
                    type="number"
                    required
                    value={couponForm.value}
                    onChange={e => setCouponForm({ ...couponForm, value: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Min Order Amount (₹)</label>
                  <input
                    type="number"
                    value={couponForm.minOrder}
                    onChange={e => setCouponForm({ ...couponForm, minOrder: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Max Redemptions</label>
                  <input
                    type="number"
                    value={couponForm.maxUsage}
                    onChange={e => setCouponForm({ ...couponForm, maxUsage: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Offer Description</label>
                <input
                  type="text"
                  value={couponForm.desc}
                  onChange={e => setCouponForm({ ...couponForm, desc: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-orange-500"
                  placeholder="e.g. Flat 20% discount on all lunch orders"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCouponModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
                >
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ── MODAL: RECORD MANUAL SKIP FOR STUDENT ── */}
      {isCreateSkipModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black flex items-center gap-2">
                  <RotateCcw size={18} />
                  <span>Record Skip for Student</span>
                </h3>
                <p className="text-xs text-orange-100 mt-0.5">
                  Admin manual override: Adds +1 meal to student's Remaining Meals balance and updates kitchen roster
                </p>
              </div>
              <button
                onClick={() => setIsCreateSkipModalOpen(false)}
                className="w-8 h-8 rounded-full bg-black/15 hover:bg-black/30 flex items-center justify-center transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateManualSkip} className="p-5 space-y-4 text-slate-800">
              {/* Select Student / Subscriber */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Student / Active Subscriber: *
                </label>
                <select
                  required
                  value={manualSkipForm.userId}
                  onChange={e => {
                    const selectedUid = e.target.value;
                    setManualSkipForm(prev => ({
                      ...prev,
                      userId: selectedUid
                    }));
                  }}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-orange-500 font-semibold cursor-pointer"
                >
                  <option value="">-- Choose Student --</option>
                  {subscribers.map((sub: any) => {
                    const u = sub.userId;
                    const uid = typeof u === 'object' ? (u?._id || u?.id) : u;
                    const uName = typeof u === 'object' ? u?.name : 'Subscriber';
                    const uRoom = sub.room || sub.hostelAddress || '';
                    return (
                      <option key={sub.id || sub._id} value={uid}>
                        {uName} ({uRoom || 'Campus Hostel'}) — Plan: {sub.planId?.name || 'Standard'} ({sub.remainingMeals ?? 30} meals left)
                      </option>
                    );
                  })}
                  {usersList.filter((u: any) => !subscribers.some((s: any) => String(s.userId?._id || s.userId?.id || s.userId) === String(u._id || u.id))).map((u: any) => (
                    <option key={u.id || u._id} value={u.id || u._id}>
                      {u.name} ({u.email}) [Non-subscriber]
                    </option>
                  ))}
                </select>
              </div>

              {/* Meal Selection (Lunch vs Dinner) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Meal to Skip: *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setManualSkipForm(prev => ({ ...prev, mealType: 'lunch' }))}
                    className={`p-3 rounded-2xl border-2 text-left transition cursor-pointer ${
                      manualSkipForm.mealType === 'lunch'
                        ? 'border-orange-500 bg-orange-50/70 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Sun size={16} className="text-amber-500" />
                      <span className="font-extrabold text-xs text-slate-900">☀️ Lunch Thali</span>
                    </div>
                    <p className="text-[10px] text-slate-500">12:30 PM – 2:30 PM</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setManualSkipForm(prev => ({ ...prev, mealType: 'dinner' }))}
                    className={`p-3 rounded-2xl border-2 text-left transition cursor-pointer ${
                      manualSkipForm.mealType === 'dinner'
                        ? 'border-orange-500 bg-orange-50/70 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Moon size={16} className="text-indigo-500" />
                      <span className="font-extrabold text-xs text-slate-900">🌙 Dinner Feast</span>
                    </div>
                    <p className="text-[10px] text-slate-500">07:30 PM – 9:30 PM</p>
                  </button>
                </div>
              </div>

              {/* Date & Quota Addition */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Date of Skip: *
                  </label>
                  <input
                    type="date"
                    required
                    value={manualSkipForm.date}
                    onChange={e => setManualSkipForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-orange-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Meals Added to Plan:
                  </label>
                  <div className="w-full text-xs p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl font-bold text-emerald-800 flex items-center justify-between">
                    <span>+1 Meal Rolled Over</span>
                    <span className="text-[10px] bg-white text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">No Wallet Cash</span>
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reason for Skip:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Phone request to warden, Sick leave, Exam study..."
                  value={manualSkipForm.reason}
                  onChange={e => setManualSkipForm(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-orange-500 font-medium"
                />
              </div>

              {/* Notice Box */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-800 flex items-start gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Recording this skip will add +1 meal to the student's Remaining Meals balance and update today's kitchen dispatch roster. No money is credited to wallet.
                </span>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateSkipModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={manualSkipLoading}
                  className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer disabled:opacity-50"
                >
                  {manualSkipLoading ? 'Saving...' : `Record Skip & Credit ₹${manualSkipForm.credit}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD CUSTOM TIFFIN TO DISPATCH CHECKLIST ── */}
      {isAddDispatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-5 text-white flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-lg font-black flex items-center gap-2">
                  <Truck size={20} />
                  <span>Add Tiffin Box to Checklist</span>
                </h3>
                <p className="text-xs text-orange-100 mt-0.5">
                  Register a manual student, replacement or guest tiffin for today's kitchen packing roster
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddDispatchModalOpen(false)}
                className="w-8 h-8 rounded-full bg-black/15 hover:bg-black/30 flex items-center justify-center transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateManualDispatch} className="p-5 space-y-3.5 text-slate-800 overflow-y-auto">
              {/* Student Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Student / Guest Name: *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter student name"
                    value={addDispatchForm.student}
                    onChange={e => setAddDispatchForm(prev => ({ ...prev, student: e.target.value }))}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-orange-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number:</label>
                  <input
                    type="tel"
                    placeholder="Enter phone number"
                    value={addDispatchForm.phone}
                    onChange={e => setAddDispatchForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-orange-500 font-semibold"
                  />
                </div>
              </div>

              {/* Hostel & Room */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hostel Building: *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tagore Hostel / Kasturba"
                    value={addDispatchForm.hostel}
                    onChange={e => setAddDispatchForm(prev => ({ ...prev, hostel: e.target.value }))}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-orange-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Room Number:</label>
                  <input
                    type="text"
                    placeholder="e.g. 204, B-12"
                    value={addDispatchForm.room}
                    onChange={e => setAddDispatchForm(prev => ({ ...prev, room: e.target.value }))}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-orange-500 font-semibold"
                  />
                </div>
              </div>

              {/* Delivery Zone & Slot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Zone: *</label>
                  <select
                    value={addDispatchForm.zoneCode}
                    onChange={e => setAddDispatchForm(prev => ({ ...prev, zoneCode: e.target.value }))}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-orange-500 font-bold cursor-pointer"
                  >
                    {deliveryZones.map(z => (
                      <option key={z.id} value={z.code}>
                        {z.name} ({z.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Meal Shift Slot: *</label>
                  <select
                    value={addDispatchForm.slot}
                    onChange={e => setAddDispatchForm(prev => ({ ...prev, slot: e.target.value }))}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-orange-500 font-bold cursor-pointer"
                  >
                    <option value="Breakfast">🌅 Breakfast (08:00 AM - 09:30 AM)</option>
                    <option value="Lunch">☀️ Lunch (12:30 PM - 02:00 PM)</option>
                    <option value="Dinner">🌙 Dinner (07:30 PM - 09:30 PM)</option>
                  </select>
                </div>
              </div>

              {/* Plan & Assigned Dabbawala */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Meal Plan:</label>
                  <select
                    value={addDispatchForm.plan}
                    onChange={e => setAddDispatchForm(prev => ({ ...prev, plan: e.target.value }))}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-orange-500 font-semibold cursor-pointer"
                  >
                    <option value="Standard Double Thali">Standard Double Thali</option>
                    <option value="South Indian & Homestyle Combo">South Indian & Homestyle Combo</option>
                    <option value="High Protein Fitness Meal">High Protein Fitness Meal</option>
                    <option value="Homestyle Delite Plan">Homestyle Delite Plan</option>
                    <option value="Special Guest Thali">Special Guest Thali</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Dabbawala / Rider:</label>
                  <select
                    value={addDispatchForm.rider}
                    onChange={e => setAddDispatchForm(prev => ({ ...prev, rider: e.target.value }))}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-orange-500 font-semibold cursor-pointer"
                  >
                    <option value="">-- Choose Dabbawala --</option>
                    {riders.map(r => (
                      <option key={r.id} value={r.name}>
                        {r.name} ({r.route || r.vehicle})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Extra Add-ons & Diet Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Extra Add-on Items / Dietary Notes:
                </label>
                <input
                  type="text"
                  placeholder="e.g. +2 Butter Rotis, 1 Gulab Jamun, Jain No Onion-Garlic"
                  value={addDispatchForm.extras}
                  onChange={e => setAddDispatchForm(prev => ({ ...prev, extras: e.target.value }))}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-orange-500 font-medium"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddDispatchModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer"
                >
                  Add Tiffin Box
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: PRINT DISPATCH & PACKING MANIFEST ── */}
      {isPrintManifestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[92vh] flex flex-col">
            <div className="bg-slate-900 p-5 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-black">
                  <Printer size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black">Hostel Tiffin Packing & Room Delivery Manifest</h3>
                  <p className="text-xs text-slate-400">
                    Official kitchen packing sheet for {dispatchFilter} Shift • Zone: {dispatchZoneFilter}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer size={14} />
                  <span>Print Sheet</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrintManifestModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 print:p-0">
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/70 flex flex-wrap justify-between items-center gap-3 text-xs">
                <div>
                  <span className="text-slate-500 font-medium">Date: </span>
                  <strong className="text-slate-900">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Meal Shift: </span>
                  <strong className="text-orange-600 font-black">{dispatchFilter === 'All' ? 'All Daily Shifts' : `${dispatchFilter} Shift`}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Zone Filter: </span>
                  <strong className="text-slate-900">{dispatchZoneFilter}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Total Tiffins: </span>
                  <strong className="text-slate-900 font-black">{dispatchRoster.length} Boxes</strong>
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3"># Box</th>
                      <th className="py-2.5 px-3">Student & Phone</th>
                      <th className="py-2.5 px-3">Hostel & Room</th>
                      <th className="py-2.5 px-3">Plan / Shift</th>
                      <th className="py-2.5 px-3">Add-on Extras</th>
                      <th className="py-2.5 px-3">Dabbawala</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Room Sign</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dispatchRoster
                      .filter(r => {
                        if (dispatchFilter === 'All') return true;
                        const slotStr = (r.slot || r.mealSlot || '').toLowerCase();
                        if (dispatchFilter === 'Breakfast') return slotStr.includes('breakfast');
                        if (dispatchFilter === 'Lunch') return slotStr.includes('lunch');
                        if (dispatchFilter === 'Dinner') return slotStr.includes('dinner');
                        return true;
                      })
                      .filter(r => dispatchZoneFilter === 'All' || (r.zoneCode || r.zone) === dispatchZoneFilter)
                      .map((item, idx) => (
                        <tr key={item.id || idx} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-mono font-bold text-orange-600">#{item.id}</td>
                          <td className="py-2 px-3">
                            <div className="font-bold text-slate-900">{item.student || item.studentName}</div>
                            <div className="text-[10px] text-slate-500">{item.phone || item.customerPhone || ''}</div>
                          </td>
                          <td className="py-2 px-3">
                            <span className="font-bold text-slate-800">{item.hostel || item.hostelAddress}</span>
                            {item.room && <span className="ml-1 text-[10px] font-black text-slate-600">(Rm {item.room})</span>}
                          </td>
                          <td className="py-2 px-3">
                            <span className="font-medium text-slate-700">{item.plan || item.planName}</span>
                            <span className="ml-1 font-bold text-orange-600">({item.slot || item.mealSlot})</span>
                          </td>
                          <td className="py-2 px-3">
                            {item.extras ? (
                              <span className="font-bold text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded text-[10px]">
                                {item.extras} {item.extrasPacked ? '✓ Packed' : '☐ Pack'}
                              </span>
                            ) : (
                              <span className="text-slate-400">Standard</span>
                            )}
                          </td>
                          <td className="py-2 px-3 font-medium text-slate-700">{item.rider || item.assignedRider || 'Unassigned'}</td>
                          <td className="py-2 px-3">
                            <span className="font-bold uppercase text-[10px] text-slate-700">{item.status || 'preparing'}</span>
                          </td>
                          <td className="py-2 px-3 text-right">
                            <div className="w-16 h-4 border-b border-dotted border-slate-400 ml-auto" />
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: RIDER ASSIGNED BOXES COMPLETE DETAILS ── */}
      {inspectRiderBoxes && (() => {
        const targetRiderName = (inspectRiderBoxes.name || '').split('(')[0].trim().toLowerCase();

        // Source list: from normalized dispatch roster or historyData
        const baseSource = (dispatchRoster && dispatchRoster.length > 0) ? dispatchRoster : historyData;
        const normalizedSource = baseSource.map((item: any) => {
          const student = item.student || item.studentName || item.customerName || 'Student Member';
          const slot = item.slot || item.mealSlot || 'Lunch';
          const plan = item.plan || item.planName || 'Standard Daily Meal';
          const rider = item.rider || item.assignedRider || 'Unassigned';
          const hostel = item.hostel || item.hostelAddress || 'Hostel Campus';
          const zoneCode = item.zoneCode || item.zone || 'NC-01';
          const status = (item.status || item.statusStep || item.deliveryStatus || 'preparing').toLowerCase();
          const room = item.room || (hostel.match(/Room\s*([0-9A-Za-z-]+)/i)?.[1]) || '';
          const phone = item.phone || item.customerPhone || '';
          const extras = item.extras || '';
          const hasAttachedExtras = Boolean(item.hasAttachedExtras || extras.toLowerCase().includes('extra'));
          return {
            ...item,
            id: item.id || item._id,
            student,
            slot,
            plan,
            rider,
            hostel,
            zoneCode,
            status,
            room,
            phone,
            extras,
            hasAttachedExtras
          };
        });

        const assignedBoxes = normalizedSource.filter((item: any) => {
          if (!item.rider || item.rider === 'Unassigned') return false;
          const itemRider = item.rider.split('(')[0].trim().toLowerCase();
          return itemRider === targetRiderName || itemRider.includes(targetRiderName) || targetRiderName.includes(itemRider);
        });

        const fullRider = riders.find((r: any) => r.name.toLowerCase().includes(targetRiderName) || targetRiderName.includes(r.name.toLowerCase())) || inspectRiderBoxes;

        const totalAssigned = assignedBoxes.length;
        const breakfastBoxes = assignedBoxes.filter((b: any) => (b.slot || '').toLowerCase().includes('breakfast'));
        const lunchBoxes = assignedBoxes.filter((b: any) => (b.slot || '').toLowerCase().includes('lunch'));
        const dinnerBoxes = assignedBoxes.filter((b: any) => (b.slot || '').toLowerCase().includes('dinner'));
        const extrasBoxes = assignedBoxes.filter((b: any) => b.hasAttachedExtras);
        const deliveredBoxes = assignedBoxes.filter((b: any) => b.status === 'delivered');
        const onRouteBoxes = assignedBoxes.filter((b: any) => b.status === 'dispatched' || b.status === 'on-route');
        const packedBoxes = assignedBoxes.filter((b: any) => b.status === 'packed');
        const prepBoxes = assignedBoxes.filter((b: any) => b.status === 'preparing' || b.status === 'cooking');

        const filteredBoxes = assignedBoxes
          .filter((b: any) => {
            if (riderBoxSlotFilter === 'All') return true;
            return (b.slot || '').toLowerCase().includes(riderBoxSlotFilter.toLowerCase());
          })
          .filter((b: any) => {
            if (riderBoxStatusFilter === 'All') return true;
            if (riderBoxStatusFilter === 'delivered') return b.status === 'delivered';
            if (riderBoxStatusFilter === 'pending') return b.status !== 'delivered';
            return (b.status || '').toLowerCase() === riderBoxStatusFilter.toLowerCase();
          })
          .filter((b: any) => {
            const q = riderBoxSearch.toLowerCase().trim();
            if (!q) return true;
            return (
              (b.student || '').toLowerCase().includes(q) ||
              (b.id || '').toLowerCase().includes(q) ||
              (b.hostel || '').toLowerCase().includes(q) ||
              (b.room || '').toLowerCase().includes(q) ||
              (b.phone || '').toLowerCase().includes(q) ||
              (b.extras || '').toLowerCase().includes(q)
            );
          });

        const handleCopyWhatsAppManifest = () => {
          if (assignedBoxes.length === 0) return;
          const lines = [
            `🛵 *TIFFIN DELIVERY MANIFEST*`,
            `👤 *Rider:* ${fullRider.name || inspectRiderBoxes.name}`,
            `📞 *Phone:* ${fullRider.phone || 'N/A'} | 🛵 *Vehicle:* ${fullRider.vehicle || 'Bike'}`,
            `📦 *Total Assigned Boxes:* ${totalAssigned} (☀️ ${lunchBoxes.length} Lunch, 🌙 ${dinnerBoxes.length} Dinner)`,
            `──────────────────────────`,
            ...assignedBoxes.map((b: any, idx: number) => {
              const slotEmoji = (b.slot || '').toLowerCase().includes('lunch') ? '☀️' : '🌙';
              const extrasText = b.hasAttachedExtras ? ` | 🥟 *Extras:* ${b.extras}` : '';
              return `${idx + 1}. *[${b.id}]* ${b.student} - ${b.hostel} ${b.room ? `(Room ${b.room})` : ''} - ${slotEmoji} ${b.slot} - 📞 ${b.phone || 'No phone'}${extrasText} [Status: ${b.status.toUpperCase()}]`;
            }),
            `──────────────────────────`,
            `Central Mess Logistics Dispatch`
          ];
          navigator.clipboard.writeText(lines.join('\n'));
          showToast(`✓ Copied ${totalAssigned} boxes delivery list to clipboard!`);
        };

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[92vh] flex flex-col">
              {/* Modal Header */}
              <div className="bg-slate-900 p-5 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center font-black text-xl shadow-md">
                    🛵
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-white tracking-tight">
                        {fullRider.name || inspectRiderBoxes.name}
                      </h3>
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-black bg-orange-500 text-white shadow-xs">
                        {totalAssigned} Boxes Assigned
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 text-xs text-slate-300 mt-0.5">
                      <span>{fullRider.vehicle || 'Delivery Vehicle'}</span>
                      {fullRider.phone && (
                        <a href={`tel:${fullRider.phone}`} className="text-orange-400 hover:underline flex items-center gap-1 font-bold">
                          <Phone size={11} /> {fullRider.phone}
                        </a>
                      )}
                      <span>Route: {fullRider.route || 'Campus Route'}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      {editingRiderRateId === (fullRider.id || inspectRiderBoxes.id) ? (
                        <div className="flex items-center gap-1.5 bg-slate-800 px-2 py-1 rounded-xl border border-orange-500">
                          <span className="text-[11px] font-bold text-orange-400">₹</span>
                          <input
                            type="number"
                            min="0"
                            value={editingRiderRateValue}
                            onChange={e => setEditingRiderRateValue(Number(e.target.value))}
                            className="w-16 px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-xs font-black text-white outline-none"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleUpdateSingleRiderRate(fullRider.id || inspectRiderBoxes.id, editingRiderRateValue)}
                            className="text-[10px] font-black bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-0.5 rounded cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingRiderRateId(null)}
                            className="text-[10px] font-bold text-slate-400 hover:text-white px-1 cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-bold text-amber-300 bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded-lg flex items-center gap-1">
                            💰 Rate: <strong>₹{fullRider.perDeliveryRate || deliveryRates.defaultPerDeliveryRate || 35}</strong>/box
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingRiderRateId(fullRider.id || inspectRiderBoxes.id);
                              setEditingRiderRateValue(fullRider.perDeliveryRate || deliveryRates.defaultPerDeliveryRate || 35);
                            }}
                            className="text-[10px] font-bold text-orange-400 hover:text-orange-300 bg-orange-950/60 border border-orange-500/30 px-1.5 py-0.5 rounded cursor-pointer flex items-center gap-0.5"
                            title="Edit this rider's delivery rate"
                          >
                            <Edit size={10} /> <span>Change Rate</span>
                          </button>
                          <span className="text-[11px] font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-lg">
                            Est. Payout: ₹{totalAssigned * (fullRider.perDeliveryRate || deliveryRates.defaultPerDeliveryRate || 35)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={handleCopyWhatsAppManifest}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    title="Copy delivery manifest formatted for WhatsApp"
                  >
                    <Copy size={13} />
                    <span>Copy for WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer size={13} />
                    <span>Print Slip</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInspectRiderBoxes(null)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer text-slate-300 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Quick Stats Strip */}
              <div className="bg-slate-50 border-b border-slate-200 p-4 shrink-0 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold flex items-center gap-1.5 shadow-2xs">
                    <Package size={14} className="text-orange-500" />
                    <span>Total Boxes: <strong className="text-slate-900">{totalAssigned}</strong></span>
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 font-bold flex items-center gap-1.5">
                    <span>🌅</span>
                    <span>Breakfast: <strong>{breakfastBoxes.length}</strong></span>
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-bold flex items-center gap-1.5">
                    <Sun size={13} className="text-amber-600" />
                    <span>Lunch: <strong>{lunchBoxes.length}</strong></span>
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 font-bold flex items-center gap-1.5">
                    <Moon size={13} className="text-indigo-600" />
                    <span>Dinner: <strong>{dinnerBoxes.length}</strong></span>
                  </span>
                  {extrasBoxes.length > 0 && (
                    <span className="px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 font-bold flex items-center gap-1.5">
                      <Sparkles size={13} className="text-purple-600" />
                      <span>With Extras: <strong>{extrasBoxes.length}</strong></span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 font-bold text-xs">
                  <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                    ✅ Delivered: {deliveredBoxes.length}
                  </span>
                  <span className="text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg">
                    🚴 On Route: {onRouteBoxes.length}
                  </span>
                  <span className="text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-lg">
                    📦 Packed: {packedBoxes.length}
                  </span>
                  <span className="text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                    🍳 Prep: {prepBoxes.length}
                  </span>
                </div>
              </div>

              {/* Filter / Search within Rider's Boxes */}
              <div className="p-3.5 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white shrink-0">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder={`Search student, room number, box ID in ${fullRider.name}'s boxes...`}
                    value={riderBoxSearch}
                    onChange={e => setRiderBoxSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-orange-500 font-medium"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={riderBoxSlotFilter}
                    onChange={e => setRiderBoxSlotFilter(e.target.value as any)}
                    className="px-3 py-2 bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold outline-none cursor-pointer"
                  >
                    <option value="All">All Shifts ({totalAssigned})</option>
                    <option value="Breakfast">🌅 Breakfast ({breakfastBoxes.length})</option>
                    <option value="Lunch">☀️ Lunch ({lunchBoxes.length})</option>
                    <option value="Dinner">🌙 Dinner ({dinnerBoxes.length})</option>
                  </select>

                  <select
                    value={riderBoxStatusFilter}
                    onChange={e => setRiderBoxStatusFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold outline-none cursor-pointer"
                  >
                    <option value="All">All Statuses</option>
                    <option value="delivered">✅ Delivered ({deliveredBoxes.length})</option>
                    <option value="pending">⏳ Pending ({totalAssigned - deliveredBoxes.length})</option>
                    <option value="dispatched">🚴 On Route ({onRouteBoxes.length})</option>
                    <option value="packed">📦 Packed ({packedBoxes.length})</option>
                  </select>
                </div>
              </div>

              {/* Scrollable Box-by-Box Details List */}
              <div className="p-4 sm:p-6 overflow-y-auto space-y-3.5 flex-1">
                {filteredBoxes.length === 0 ? (
                  <div className="py-12 text-center text-slate-400">
                    <Package size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="font-bold text-xs text-slate-600">No assigned boxes match this filter for {fullRider.name}</p>
                  </div>
                ) : (
                  filteredBoxes.map((box: any, idx: number) => {
                    const isDelivered = box.status === 'delivered';
                    const isLunch = (box.slot || '').toLowerCase().includes('lunch');
                    return (
                      <div
                        key={box.id || idx}
                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs ${
                          isDelivered
                            ? 'bg-emerald-50/30 border-emerald-200/80'
                            : box.status === 'dispatched' || box.status === 'on-route'
                            ? 'bg-blue-50/30 border-blue-200/80'
                            : 'bg-white border-slate-200/90 hover:border-orange-200'
                        }`}
                      >
                        {/* Left: Stop Number & Box ID & Student Details */}
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                            #{idx + 1}
                          </div>
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono font-black text-xs px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-900">
                                {box.id}
                              </span>
                              <h4 className="font-black text-sm text-slate-900">{box.student}</h4>
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                                isLunch ? 'bg-amber-100 text-amber-900' : 'bg-indigo-100 text-indigo-900'
                              }`}>
                                {isLunch ? '☀️ Lunch Box' : '🌙 Dinner Box'}
                              </span>
                            </div>

                            <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-1">
                              <span className="font-bold text-slate-800 flex items-center gap-1">
                                <MapPin size={12} className="text-rose-500" />
                                {box.hostel} {box.room ? `• Room ${box.room}` : ''}
                              </span>
                              <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-bold text-[10px]">
                                Zone: {box.zoneCode || 'NC-01'}
                              </span>
                              {box.phone && (
                                <a
                                  href={`tel:${box.phone}`}
                                  className="text-orange-600 font-bold hover:underline flex items-center gap-1"
                                >
                                  <Phone size={11} /> {box.phone}
                                </a>
                              )}
                            </div>

                            <div className="text-xs text-slate-500 font-medium">
                              <span>Plan: <strong>{box.plan || 'Standard Meal Plan'}</strong></span>
                            </div>

                            {/* Attached Extras */}
                            {box.hasAttachedExtras && (
                              <div className="mt-1 p-2 rounded-xl bg-purple-50/80 border border-purple-200/80 text-[11px] text-purple-950 font-bold flex items-center gap-1.5">
                                <Sparkles size={13} className="text-purple-600 shrink-0" />
                                <span>Extras: {box.extras || 'Extra Add-on Items Attached'}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right: Status Dropdown & Actions */}
                        <div className="flex flex-wrap items-center gap-2 md:self-center shrink-0">
                          <select
                            value={box.status || 'preparing'}
                            onChange={e => updateDispatchStatus(box.id, e.target.value)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black outline-none border cursor-pointer transition ${
                              isDelivered
                                ? 'bg-emerald-100 border-emerald-300 text-emerald-950'
                                : box.status === 'dispatched' || box.status === 'on-route'
                                ? 'bg-blue-100 border-blue-300 text-blue-950'
                                : box.status === 'packed'
                                ? 'bg-purple-100 border-purple-300 text-purple-950'
                                : 'bg-amber-100 border-amber-300 text-amber-950'
                            }`}
                          >
                            <option value="preparing">🍳 Preparing</option>
                            <option value="packed">📦 Packed</option>
                            <option value="dispatched">🚴 Out for Delivery</option>
                            <option value="delivered">✅ Delivered</option>
                            <option value="skipped">⏸️ Skipped</option>
                          </select>

                          {/* Reassign to another rider if needed */}
                          <select
                            value={fullRider.name}
                            onChange={e => handleAssignDispatchRider(box.id, e.target.value)}
                            className="px-2 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer max-w-[140px] truncate"
                            title="Reassign this box to another rider"
                          >
                            {riders.map((r: any) => (
                              <option key={r.id || r._id} value={r.name}>
                                {r.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 font-bold shrink-0">
                <span>Showing <strong>{filteredBoxes.length}</strong> of <strong>{totalAssigned}</strong> assigned boxes for {fullRider.name}</span>
                <button
                  type="button"
                  onClick={() => setInspectRiderBoxes(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ══════════════════════════════════════════════════════════
          MODAL: QUICK DELIVERY RATE UPDATE
      ══════════════════════════════════════════════════════════ */}
      {rateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className={`p-5 text-white flex justify-between items-center transition-colors ${
              quickRateType === 'mess'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-xl font-black">
                  {quickRateType === 'mess' ? '🍱' : '⚡'}
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    Quick Delivery Rate Update
                  </h3>
                  <p className="text-[11px] text-white/80">
                    {quickRateType === 'mess' ? 'Set payout per delivered tiffin box' : 'Set payout per instant food order'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRateModalOpen(false)}
                className="w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 text-white flex items-center justify-center transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Delivery Category Selector: Mess vs Instant */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">
                  Select Delivery Category
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setQuickRateType('mess');
                      setQuickRateInput(deliveryRates.messPerBoxRate || 25);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      quickRateType === 'mess'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>🍱 Mess Tiffin (/box)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setQuickRateType('instant');
                      setQuickRateInput(deliveryRates.instantPerOrderRate || 40);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      quickRateType === 'instant'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Zap size={12} />
                    <span>⚡ Instant Food (/order)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-800 block mb-1">
                  {quickRateType === 'mess' ? 'Rider Payout per Tiffin Box (₹)' : 'Rider Payout per Instant Order (₹)'}
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-slate-700">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={quickRateInput}
                    onChange={e => setQuickRateInput(Math.max(0, Number(e.target.value)))}
                    className={`w-full px-4 py-2.5 bg-slate-50 border-2 rounded-xl text-lg font-black text-slate-900 outline-none focus:bg-white transition ${
                      quickRateType === 'mess' ? 'border-amber-400' : 'border-blue-400'
                    }`}
                    autoFocus
                  />
                  <span className="text-xs font-bold text-slate-500">
                    {quickRateType === 'mess' ? '/ box' : '/ order'}
                  </span>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                  Quick Presets
                </p>
                <div className="flex flex-wrap gap-2">
                  {(quickRateType === 'mess' ? [20, 25, 30, 35, 40] : [30, 35, 40, 45, 50]).map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setQuickRateInput(val)}
                      className={`px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer ${
                        quickRateInput === val
                          ? (quickRateType === 'mess' ? 'bg-amber-500 text-white shadow-xs' : 'bg-blue-600 text-white shadow-xs')
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      ₹{val} {val === (quickRateType === 'mess' ? 25 : 40) ? '(Standard)' : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bulk Apply Checkbox */}
              <label className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer ${
                quickRateType === 'mess' ? 'bg-amber-50/70 border-amber-200/80' : 'bg-blue-50/70 border-blue-200/80'
              }`}>
                <input
                  type="checkbox"
                  checked={quickApplyToAll}
                  onChange={e => setQuickApplyToAll(e.target.checked)}
                  className={`w-4 h-4 mt-0.5 rounded ${
                    quickRateType === 'mess' ? 'text-amber-500 focus:ring-amber-400' : 'text-blue-600 focus:ring-blue-400'
                  }`}
                />
                <div>
                  <p className="text-xs font-black text-slate-900">
                    Apply to all {riders.length} active delivery partners
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {quickRateType === 'mess'
                      ? `All active delivery partners will receive ₹${quickRateInput}/tiffin box.`
                      : `All active delivery partners will receive ₹${quickRateInput}/instant food order.`}
                  </p>
                </div>
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSavingRates}
                  onClick={() => {
                    const updated = { ...deliveryRates };
                    if (quickRateType === 'mess') {
                      updated.messPerBoxRate = quickRateInput;
                      updated.defaultPerDeliveryRate = quickRateInput;
                    } else {
                      updated.instantPerOrderRate = quickRateInput;
                    }
                    handleSaveDeliveryRates(updated, quickApplyToAll, quickRateType);
                  }}
                  className={`px-5 py-2 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer ${
                    quickRateType === 'mess'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                  }`}
                >
                  {isSavingRates ? <RefreshCw size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                  <span>Save &amp; Apply Rate</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}