import React, { useState } from 'react';
import {
  Users, Package, ShoppingCart, Calendar, Settings, TrendingUp,
  Bell, Plus, Search, Edit, Trash2, Eye, DollarSign,
  Truck, UtensilsCrossed, Tag, MessageSquare, CheckCircle,
  XCircle, Clock, BarChart2, Send, Pause, Play,
  MapPin, Phone, Star, ChevronRight,
  Download, Wallet, Bike, AlertTriangle, Building2,
  ToggleLeft, ToggleRight, FileText, Utensils, RotateCcw,
  PieChart as PieChartIcon, Leaf, CreditCard, Receipt
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';

// ─── Mock Data ───────────────────────────────────────────────
const stats = {
  totalUsers: 1250, activeSubscriptions: 890,
  totalOrders: 3420, monthlyRevenue: 185000,
  todayMeals: 312, pendingDeliveries: 18,
  openTickets: 7, activeCoupons: 4
};

const salesData = [
  { name: 'Apr', orders: 420, revenue: 48000, subs: 60 },
  { name: 'May', orders: 510, revenue: 56000, subs: 74 },
  { name: 'Jun', orders: 480, revenue: 52000, subs: 68 },
  { name: 'Jul', orders: 620, revenue: 70000, subs: 90 },
  { name: 'Aug', orders: 590, revenue: 66000, subs: 85 },
  { name: 'Sep', orders: 680, revenue: 78000, subs: 102 },
];

const planDistData = [
  { name: 'Basic', value: 210, color: '#F59E0B' },
  { name: 'Standard', value: 450, color: '#FF5200' },
  { name: 'Premium', value: 230, color: '#10B981' },
];

const recentOrders = [
  { id: 'ORD001', customer: 'Rahul Sharma', phone: '9876543210', item: 'Dal Rice + Roti', amount: 150, status: 'preparing', time: '10 min ago', area: 'North Campus' },
  { id: 'ORD002', customer: 'Priya Mehta', phone: '9871234560', item: 'Chicken Biryani', amount: 220, status: 'on-the-way', time: '18 min ago', area: 'South Campus' },
  { id: 'ORD003', customer: 'Aman Khan', phone: '9865432100', item: 'Paneer Butter Masala', amount: 180, status: 'delivered', time: '35 min ago', area: 'Mukherjee Nagar' },
  { id: 'ORD004', customer: 'Sneha Verma', phone: '9812345678', item: 'Veg Thali', amount: 130, status: 'confirmed', time: '50 min ago', area: 'GTB Nagar' },
  { id: 'ORD005', customer: 'Arjun Singh', phone: '9898765432', item: 'Extra Paneer + Roti', amount: 80, status: 'cancelled', time: '1 hr ago', area: 'Kamla Nagar' },
];

const menuItems = [
  { id: 1, name: 'Dal Rice Combo', category: 'Main Course', price: 120, available: true, orders: 245 },
  { id: 2, name: 'Chicken Biryani', category: 'Main Course', price: 180, available: true, orders: 198 },
  { id: 3, name: 'Paneer Butter Masala', category: 'Main Course', price: 160, available: true, orders: 175 },
  { id: 4, name: 'Rajma Rice', category: 'Main Course', price: 110, available: false, orders: 132 },
  { id: 5, name: 'Veg Hakka Noodles', category: 'Fast Food', price: 90, available: true, orders: 88 },
  { id: 6, name: 'Masala Chai', category: 'Beverages', price: 20, available: true, orders: 320 },
  { id: 7, name: 'Gulab Jamun', category: 'Desserts', price: 30, available: true, orders: 142 },
];

const usersData = [
  { id: 'USR001', name: 'Rahul Sharma', email: 'rahul@iitd.ac.in', phone: '9876543210', plan: 'Standard', joinDate: '2024-08-01', status: 'active', meals: 18 },
  { id: 'USR002', name: 'Priya Mehta', email: 'priya@du.ac.in', phone: '9871234560', plan: 'Premium', joinDate: '2024-07-15', status: 'active', meals: 26 },
  { id: 'USR003', name: 'Aman Khan', email: 'aman@jamia.ac.in', phone: '9865432100', plan: 'Basic', joinDate: '2024-09-01', status: 'active', meals: 9 },
  { id: 'USR004', name: 'Sneha Verma', email: 'sneha@du.ac.in', phone: '9812345678', plan: 'Standard', joinDate: '2024-06-20', status: 'paused', meals: 12 },
  { id: 'USR005', name: 'Arjun Singh', email: 'arjun@iitd.ac.in', phone: '9898765432', plan: '—', joinDate: '2024-09-10', status: 'no-plan', meals: 0 },
];

const subscriptionsData = [
  { id: 'SUB001', user: 'Rahul Sharma', plan: 'Standard', billing: 'Monthly', remaining: 22, expiry: '2024-10-20', status: 'active', paid: 4299, skipped: 2 },
  { id: 'SUB002', user: 'Priya Mehta', plan: 'Premium', billing: 'Semester', remaining: 78, expiry: '2025-01-10', status: 'active', paid: 30594, skipped: 0 },
  { id: 'SUB003', user: 'Aman Khan', plan: 'Basic', billing: 'Monthly', remaining: 18, expiry: '2024-10-01', status: 'active', paid: 2499, skipped: 3 },
  { id: 'SUB004', user: 'Sneha Verma', plan: 'Standard', billing: 'Monthly', remaining: 8, expiry: '2024-09-28', status: 'paused', paid: 4299, skipped: 5 },
  { id: 'SUB005', user: 'Dev Patel', plan: 'Premium', billing: 'Monthly', remaining: 0, expiry: '2024-09-15', status: 'expired', paid: 5999, skipped: 1 },
];

const deliveryData = [
  { id: 'DEL001', user: 'Rahul Sharma', meal: 'Lunch', menu: 'Dal + Rice + Roti + Sabji', area: 'North Campus, Room 204', status: 'preparing', rider: 'Ramesh', eta: '12:45 PM', time: '12:30 PM' },
  { id: 'DEL002', user: 'Priya Mehta', meal: 'Lunch', menu: 'Paneer Masala + Rice + Roti', area: 'South Campus, Room 112', status: 'on-the-way', rider: 'Suresh', eta: '12:50 PM', time: '12:30 PM' },
  { id: 'DEL003', user: 'Aman Khan', meal: 'Lunch', menu: 'Chicken Curry + Rice + Roti', area: 'Mukherjee Nagar, PG Block B', status: 'delivered', rider: 'Mahesh', eta: '—', time: '12:30 PM' },
  { id: 'DEL004', user: 'Karan Dev', meal: 'Lunch', menu: 'Rajma Rice + Roti', area: 'GTB Nagar, Hostel 3', status: 'pending', rider: '—', eta: '—', time: '12:30 PM' },
];

const attendanceData = [
  { user: 'Rahul Sharma', plan: 'Standard (60 meals)', consumed: 18, skipped: 4, missed: 2, remaining: 36 },
  { user: 'Priya Mehta', plan: 'Premium (90 meals)', consumed: 26, skipped: 0, missed: 0, remaining: 64 },
  { user: 'Aman Khan', plan: 'Basic (30 meals)', consumed: 9, skipped: 3, missed: 1, remaining: 17 },
  { user: 'Sneha Verma', plan: 'Standard (60 meals)', consumed: 12, skipped: 5, missed: 2, remaining: 41 },
  { user: 'Dev Patel', plan: 'Premium (90 meals)', consumed: 58, skipped: 2, missed: 1, remaining: 29 },
];

const couponsData = [
  { id: 'CPN001', code: 'MESS20', type: 'Percentage', value: 20, minOrder: 2000, usage: 45, maxUsage: 100, expiry: '2024-10-31', status: 'active' },
  { id: 'CPN002', code: 'WELCOME10', type: 'Flat', value: 200, minOrder: 1000, usage: 78, maxUsage: 200, expiry: '2024-12-31', status: 'active' },
  { id: 'CPN003', code: 'REFER50', type: 'Flat', value: 50, minOrder: 500, usage: 132, maxUsage: 500, expiry: '2024-11-30', status: 'active' },
  { id: 'CPN004', code: 'SEMESTER15', type: 'Percentage', value: 15, minOrder: 5000, usage: 200, maxUsage: 200, expiry: '2024-09-30', status: 'expired' },
];

const ticketsData = [
  { id: 'TKT001', user: 'Rahul Sharma', subject: 'Meal was cold today', category: 'Quality', priority: 'high', status: 'open', time: '2 hrs ago', msg: "Today's lunch was delivered cold. Please ensure proper packaging." },
  { id: 'TKT002', user: 'Priya Mehta', subject: 'Skip meal not credited', category: 'Billing', priority: 'high', status: 'open', time: '4 hrs ago', msg: "I skipped yesterday's dinner but wallet credit not received." },
  { id: 'TKT003', user: 'Aman Khan', subject: 'Wrong item delivered', category: 'Delivery', priority: 'medium', status: 'in-progress', time: '1 day ago', msg: 'Received Rajma instead of Chicken Curry.' },
  { id: 'TKT004', user: 'Sneha Verma', subject: 'Plan renewal discount?', category: 'General', priority: 'low', status: 'resolved', time: '2 days ago', msg: 'Is there any discount available for plan renewal?' },
  { id: 'TKT005', user: 'Dev Patel', subject: 'App not loading', category: 'Technical', priority: 'medium', status: 'resolved', time: '3 days ago', msg: 'The mess dashboard is not loading properly on mobile.' },
];

const notifHistory = [
  { title: 'Today\'s Lunch Menu', msg: 'Dal Makhani + Rice + 3 Roti + Salad — Available from 12:30 PM', sent: '312 users', time: '9:00 AM today', type: 'menu' },
  { title: 'Subscription Expiring', msg: 'Your mess plan expires in 3 days. Renew now to continue!', sent: '28 users', time: 'Yesterday 6:00 PM', type: 'alert' },
  { title: 'Weekend Special 🎉', msg: 'This Sunday — Special Thali + Gulab Jamun FREE for all subscribers!', sent: '890 users', time: 'Fri 10:00 AM', type: 'offer' },
  { title: 'New Coupon Available', msg: 'Use MESS20 to get 20% off on plan renewal. Valid till Oct 31!', sent: '890 users', time: 'Mon 9:00 AM', type: 'coupon' },
];

const mealSchedule: Record<string, { breakfast: boolean; lunch: boolean; dinner: boolean }> = {
  Mon: { breakfast: true, lunch: true, dinner: true },
  Tue: { breakfast: true, lunch: true, dinner: true },
  Wed: { breakfast: true, lunch: true, dinner: false },
  Thu: { breakfast: false, lunch: true, dinner: true },
  Fri: { breakfast: true, lunch: true, dinner: true },
  Sat: { breakfast: true, lunch: true, dinner: false },
  Sun: { breakfast: true, lunch: true, dinner: true },
};

// ─── Status Colors ────────────────────────────────────────────
const statusColor: Record<string, string> = {
  confirmed: 'bg-blue-50 text-blue-700 border border-blue-200',
  preparing: 'bg-amber-50 text-amber-700 border border-amber-200',
  'on-the-way': 'bg-orange-500 text-white shadow-xs',
  delivered: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  cancelled: 'bg-rose-50 text-rose-700 border border-rose-200 line-through',
  active: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  available: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  expired: 'bg-rose-50 text-rose-700 border border-rose-200',
  paused: 'bg-amber-50 text-amber-700 border border-amber-200',
  offline: 'bg-slate-100 text-slate-500 border border-slate-200',
  busy: 'bg-orange-50 text-orange-700 border border-orange-200',
  'no-plan': 'bg-slate-100 text-slate-600 border border-slate-200',
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  approved: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  rejected: 'bg-rose-50 text-rose-700 border border-rose-200 line-through',
  open: 'bg-amber-50 text-amber-700 border border-amber-200',
  'in-progress': 'bg-blue-50 text-blue-700 border border-blue-200',
  resolved: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  high: 'bg-rose-500 text-white shadow-xs',
  medium: 'bg-amber-500 text-white shadow-xs',
  low: 'bg-slate-100 text-slate-700 border border-slate-200',
  credit: 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200',
  debit: 'bg-rose-50 text-rose-700 font-bold border border-rose-200',
};

// ─── New Mock Data ─────────────────────────────────────────────
const ridersData = [
  { id: 'RDR001', name: 'Ramesh Kumar', phone: '9812300001', area: 'North Campus', status: 'busy', orders: 3, totalDeliveries: 245, rating: 4.8 },
  { id: 'RDR002', name: 'Suresh Yadav', phone: '9812300002', area: 'South Campus', status: 'available', orders: 0, totalDeliveries: 198, rating: 4.6 },
  { id: 'RDR003', name: 'Mahesh Singh', phone: '9812300003', area: 'Mukherjee Nagar', status: 'offline', orders: 0, totalDeliveries: 312, rating: 4.9 },
  { id: 'RDR004', name: 'Dinesh Patel', phone: '9812300004', area: 'GTB Nagar', status: 'available', orders: 0, totalDeliveries: 167, rating: 4.5 },
  { id: 'RDR005', name: 'Ganesh Verma', phone: '9812300005', area: 'Kamla Nagar', status: 'busy', orders: 2, totalDeliveries: 289, rating: 4.7 },
];

const walletsData = [
  { user: 'Rahul Sharma', email: 'rahul@iitd.ac.in', balance: 450, transactions: [
    { type: 'credit', amount: 150, desc: 'Skipped Dinner - 22 Sep', date: '22 Sep' },
    { type: 'debit', amount: 80, desc: 'Extra Roti + Paneer', date: '21 Sep' },
    { type: 'credit', amount: 200, desc: 'Welcome Bonus', date: '01 Sep' },
  ]},
  { user: 'Priya Mehta', email: 'priya@du.ac.in', balance: 1200, transactions: [
    { type: 'credit', amount: 500, desc: 'Referral Bonus', date: '20 Sep' },
    { type: 'credit', amount: 700, desc: 'Skipped 5 meals', date: '15 Sep' },
  ]},
  { user: 'Aman Khan', email: 'aman@jamia.ac.in', balance: 120, transactions: [
    { type: 'credit', amount: 120, desc: 'Skipped Lunch - 23 Sep', date: '23 Sep' },
  ]},
  { user: 'Sneha Verma', email: 'sneha@du.ac.in', balance: 350, transactions: [
    { type: 'debit', amount: 150, desc: 'Extra Paneer + Naan', date: '19 Sep' },
    { type: 'credit', amount: 500, desc: 'Skipped 5 meals', date: '10 Sep' },
  ]},
];

const skipRequestsData = [
  { id: 'SKP001', user: 'Rahul Sharma', meal: 'Dinner', date: 'Today', menu: 'Paneer Butter Masala + Rice', credit: 75, status: 'pending', requestedAt: '10:30 AM' },
  { id: 'SKP002', user: 'Priya Mehta', meal: 'Breakfast', date: 'Tomorrow', menu: 'Aloo Paratha + Curd', credit: 40, status: 'approved', requestedAt: '9:15 AM' },
  { id: 'SKP003', user: 'Aman Khan', meal: 'Lunch', date: 'Today', menu: 'Dal Makhani + Rice + Roti', credit: 60, status: 'pending', requestedAt: '8:00 AM' },
  { id: 'SKP004', user: 'Dev Patel', meal: 'Dinner', date: '24 Sep', menu: 'Chicken Tikka + Rice', credit: 90, status: 'rejected', requestedAt: 'Yesterday 11PM' },
  { id: 'SKP005', user: 'Karan Dev', meal: 'Lunch', date: 'Tomorrow', menu: 'Rajma Rice + Roti', credit: 55, status: 'approved', requestedAt: '7:45 AM' },
];

const ratingsData = [
  { meal: 'Dal Makhani + Rice', date: 'Today Lunch', avgRating: 4.6, totalRatings: 89, ratings: [
    { user: 'Rahul S.', stars: 5, comment: 'Dal was amazing today! Extra thick.', time: '2:30 PM' },
    { user: 'Priya M.', stars: 4, comment: 'Good taste, portion could be bigger.', time: '2:15 PM' },
    { user: 'Aman K.', stars: 5, comment: 'Best dal makhani this month!', time: '1:55 PM' },
  ]},
  { meal: 'Paneer Butter Masala + Roti', date: 'Yesterday Dinner', avgRating: 4.2, totalRatings: 76, ratings: [
    { user: 'Sneha V.', stars: 4, comment: 'Good but gravy was less.', time: '9:45 PM' },
    { user: 'Dev P.', stars: 3, comment: 'Average. Expected better paneer.', time: '9:30 PM' },
  ]},
];

const areasData = [
  { id: 'AREA001', name: 'North Campus', hostels: ['Gwyer Hall', 'Jubilee Hall', 'South Hall'], activeUsers: 145, rider: 'Ramesh Kumar', deliveryTime: '30-45 min', status: 'active' },
  { id: 'AREA002', name: 'South Campus', hostels: ['Meghanada Saha Hall', 'Vivekananda Hall'], activeUsers: 98, rider: 'Suresh Yadav', deliveryTime: '35-50 min', status: 'active' },
  { id: 'AREA003', name: 'Mukherjee Nagar', hostels: ['PG Block A', 'PG Block B', 'PG Block C'], activeUsers: 234, rider: 'Mahesh Singh', deliveryTime: '20-35 min', status: 'active' },
  { id: 'AREA004', name: 'GTB Nagar', hostels: ['Hostel 1', 'Hostel 2', 'Hostel 3'], activeUsers: 187, rider: 'Dinesh Patel', deliveryTime: '25-40 min', status: 'active' },
  { id: 'AREA005', name: 'Kamla Nagar', hostels: ['Boys PG', 'Girls PG'], activeUsers: 67, rider: 'Ganesh Verma', deliveryTime: '40-55 min', status: 'active' },
  { id: 'AREA006', name: 'Vijay Nagar', hostels: ['Hostel Complex'], activeUsers: 0, rider: '—', deliveryTime: '—', status: 'inactive' },
];

const wasteData = [
  { day: 'Mon', breakfast: 12, lunch: 8, dinner: 15, total: 35 },
  { day: 'Tue', breakfast: 8, lunch: 5, dinner: 10, total: 23 },
  { day: 'Wed', breakfast: 15, lunch: 12, dinner: 0, total: 27 },
  { day: 'Thu', breakfast: 0, lunch: 6, dinner: 9, total: 15 },
  { day: 'Fri', breakfast: 10, lunch: 4, dinner: 7, total: 21 },
  { day: 'Sat', breakfast: 18, lunch: 20, dinner: 0, total: 38 },
  { day: 'Sun', breakfast: 5, lunch: 3, dinner: 4, total: 12 },
];

const revenueByPlan = [
  { month: 'Apr', basic: 35000, standard: 85000, premium: 65000 },
  { month: 'May', basic: 42000, standard: 98000, premium: 72000 },
  { month: 'Jun', basic: 38000, standard: 92000, premium: 68000 },
  { month: 'Jul', basic: 48000, standard: 115000, premium: 88000 },
  { month: 'Aug', basic: 45000, standard: 108000, premium: 82000 },
  { month: 'Sep', basic: 52000, standard: 124000, premium: 96000 },
];

// ─── Sidebar Nav Items ────────────────────────────────────────
const NAV = [
  { key: 'dashboard',    label: 'Dashboard',       icon: TrendingUp,   badge: null,  group: 'main' },
  { key: 'orders',       label: 'Orders',           icon: ShoppingCart, badge: '5',   group: 'main' },
  { key: 'subscriptions',label: 'Subscriptions',    icon: Calendar,     badge: null,  group: 'main' },
  { key: 'users',        label: 'Users',            icon: Users,        badge: null,  group: 'main' },
  { key: 'menu',         label: 'Menu',             icon: UtensilsCrossed, badge: null, group: 'ops' },
  { key: 'delivery',     label: 'Delivery',         icon: Truck,        badge: '4',   group: 'ops' },
  { key: 'riders',       label: 'Rider Management', icon: Bike,         badge: null,  group: 'ops' },
  { key: 'skipreq',      label: 'Skip Requests',    icon: RotateCcw,    badge: '3',   group: 'ops' },
  { key: 'schedule',     label: 'Meal Schedule',    icon: Clock,        badge: null,  group: 'ops' },
  { key: 'attendance',   label: 'Attendance',       icon: BarChart2,    badge: null,  group: 'reports' },
  { key: 'ratings',      label: 'Ratings',          icon: Star,         badge: null,  group: 'reports' },
  { key: 'reports',      label: 'Revenue Reports',  icon: PieChartIcon, badge: null,  group: 'reports' },
  { key: 'waste',        label: 'Food Waste',       icon: Leaf,         badge: null,  group: 'reports' },
  { key: 'coupons',      label: 'Offers & Coupons', icon: Tag,          badge: null,  group: 'finance' },
  { key: 'wallet',       label: 'Wallet Mgmt',      icon: Wallet,       badge: null,  group: 'finance' },
  { key: 'invoice',      label: 'Invoices',         icon: Receipt,      badge: null,  group: 'finance' },
  { key: 'areas',        label: 'Areas & Hostels',  icon: Building2,    badge: null,  group: 'config' },
  { key: 'bulk',         label: 'Bulk Operations',  icon: Users,        badge: null,  group: 'config' },
  { key: 'tickets',      label: 'Support Tickets',  icon: MessageSquare,badge: '2',   group: 'support' },
  { key: 'notifications',label: 'Notifications',    icon: Bell,         badge: null,  group: 'support' },
  { key: 'settings',     label: 'Settings',         icon: Settings,     badge: null,  group: 'config' },
];



// ─── Stat Card ────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, color, sub }: any) => (
  <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 flex items-center gap-4">
    <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className="text-2xl font-black text-gray-900 leading-tight">{value}</p>
      {sub && <p className="text-xs text-green-500 font-semibold">{sub}</p>}
    </div>
  </div>
);

// ─── Badge ────────────────────────────────────────────────────
const Badge = ({ status }: { status: string }) => (
  <span className={`px-2 py-0.5 rounded-full text-xs font-bold capitalize ${statusColor[status] || 'bg-gray-100 text-gray-600'}`}>
    {status}
  </span>
);

// ─── Main Component ───────────────────────────────────────────
const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [search, setSearch] = useState('');
  const [schedule, setSchedule] = useState(mealSchedule);
  const [notifForm, setNotifForm] = useState({ title: '', msg: '', target: 'all' });
  const [ticketReply, setTicketReply] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const toggleMeal = (day: string, meal: 'breakfast' | 'lunch' | 'dinner') => {
    setSchedule(prev => ({ ...prev, [day]: { ...prev[day], [meal]: !prev[day][meal] } }));
    showToast(`${day} ${meal} updated`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-green-500 text-white px-5 py-3 rounded-xl shadow-lg font-semibold">
          ✅ {toast}
        </div>
      )}

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <div className="w-64 bg-white shadow-sm min-h-screen flex-shrink-0 flex flex-col">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-md shadow-orange-500/20">
              <span className="text-white font-black text-lg">B</span>
            </div>
            <div>
              <p className="font-black text-gray-900 leading-none">Bitez Admin</p>
              <p className="text-xs text-gray-400 font-medium">Operations Hub</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV.map(({ key, label, icon: Icon, badge }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === key
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-orange-50 hover:text-orange-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </div>
              {badge && (
                <span className={`text-xs font-black px-1.5 py-0.5 rounded-full ${activeTab === key ? 'bg-white/30 text-white' : 'bg-red-100 text-red-600'}`}>
                  {badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 bg-orange-50 rounded-xl px-3 py-2">
            <div className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center text-sm">👨‍💼</div>
            <div>
              <p className="text-xs font-bold text-gray-800">Admin</p>
              <p className="text-[10px] text-gray-400">admin@mess.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────── */}
      <div className="flex-1 overflow-auto">

        {/* ── Top Bar ─────────────────────── */}
        <div className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <h1 className="text-xl font-black text-gray-900 capitalize">{activeTab.replace('-', ' ')}</h1>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-300 outline-none w-48"
              />
            </div>
            <button className="relative p-2 hover:bg-gray-100 rounded-xl">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-red-400 rounded-xl flex items-center justify-center text-white font-bold text-sm">A</div>
          </div>
        </div>

        <div className="p-8 space-y-6">

          {/* ════════ DASHBOARD ════════════════════════════════ */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Users" value={stats.totalUsers.toLocaleString()} icon={Users} color="bg-blue-50 text-blue-600" sub="+12% this month" />
                <StatCard label="Active Subscriptions" value={stats.activeSubscriptions} icon={Calendar} color="bg-emerald-50 text-emerald-600" sub="+8% this month" />
                <StatCard label="Today's Meals" value={stats.todayMeals} icon={UtensilsCrossed} color="bg-orange-50 text-orange-600" sub="Across all plans" />
                <StatCard label="Monthly Revenue" value={`₹${(stats.monthlyRevenue / 1000).toFixed(0)}K`} icon={DollarSign} color="bg-amber-50 text-amber-600" sub="+22% this month" />
                <StatCard label="Total Orders" value={stats.totalOrders.toLocaleString()} icon={ShoppingCart} color="bg-purple-50 text-purple-600" sub="+15% this month" />
                <StatCard label="Pending Deliveries" value={stats.pendingDeliveries} icon={Truck} color="bg-amber-50 text-amber-600" sub="Assign riders" />
                <StatCard label="Open Tickets" value={stats.openTickets} icon={MessageSquare} color="bg-rose-50 text-rose-600" sub="Need response" />
                <StatCard label="Active Coupons" value={stats.activeCoupons} icon={Tag} color="bg-indigo-50 text-indigo-600" sub="Running offers" />
              </div>

              {/* Charts */}
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-4">Revenue & Orders Overview</h3>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="orders" fill="#FF5200" radius={[4,4,0,0]} name="Orders" />
                      <Bar dataKey="subs" fill="#10B981" radius={[4,4,0,0]} name="New Subs" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-4">Plan Distribution</h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={planDistData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                        {planDistData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-2">
                    {planDistData.map(p => (
                      <div key={p.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ background: p.color }} /><span className="text-gray-600">{p.name}</span></div>
                        <span className="font-bold text-gray-900">{p.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Orders + Quick Actions */}
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900">Recent Orders</h3>
                    <button onClick={() => setActiveTab('orders')} className="text-orange-500 text-sm font-semibold flex items-center gap-1">View All <ChevronRight className="w-4 h-4" /></button>
                  </div>
                  <table className="w-full">
                    <tbody>
                      {recentOrders.slice(0, 4).map(o => (
                        <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-3 px-6 text-sm font-bold text-gray-700">{o.id}</td>
                          <td className="py-3 px-6 text-sm text-gray-600">{o.customer}</td>
                          <td className="py-3 px-6 text-sm text-gray-500 max-w-[120px] truncate">{o.item}</td>
                          <td className="py-3 px-6 text-sm font-bold">₹{o.amount}</td>
                          <td className="py-3 px-6"><Badge status={o.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    {[
                      { label: 'Send Menu Notification', icon: Send, tab: 'notifications', color: 'text-blue-500 bg-blue-50' },
                      { label: 'View Open Tickets', icon: MessageSquare, tab: 'tickets', color: 'text-red-500 bg-red-50' },
                      { label: 'Manage Deliveries', icon: Truck, tab: 'delivery', color: 'text-purple-500 bg-purple-50' },
                      { label: 'Create Coupon', icon: Tag, tab: 'coupons', color: 'text-green-500 bg-green-50' },
                      { label: 'Attendance Report', icon: BarChart2, tab: 'attendance', color: 'text-orange-500 bg-orange-50' },
                    ].map(a => (
                      <button key={a.label} onClick={() => setActiveTab(a.tab)}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 border border-gray-100 text-left">
                        <div className={`w-8 h-8 ${a.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <a.icon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">{a.label}</span>
                        <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════════ ORDERS ═══════════════════════════════════ */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  {['All', 'Confirmed', 'Preparing', 'On the Way', 'Delivered', 'Cancelled'].map(f => (
                    <button key={f} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${f === 'All' ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'}`}>{f}</button>
                  ))}
                </div>
                <button className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50">
                  <Download className="w-4 h-4" /> Export
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>{['Order ID','Customer','Phone','Item','Area','Amount','Status','Actions'].map(h => (
                      <th key={h} className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {recentOrders.map(o => (
                      <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-bold text-orange-600">{o.id}</td>
                        <td className="py-3 px-4 text-sm font-semibold text-gray-800">{o.customer}</td>
                        <td className="py-3 px-4 text-sm text-gray-500">{o.phone}</td>
                        <td className="py-3 px-4 text-sm text-gray-600 max-w-[140px] truncate">{o.item}</td>
                        <td className="py-3 px-4 text-xs text-gray-500">{o.area}</td>
                        <td className="py-3 px-4 text-sm font-bold text-gray-900">₹{o.amount}</td>
                        <td className="py-3 px-4"><Badge status={o.status} /></td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button className="text-blue-500 hover:text-blue-700"><Eye className="w-4 h-4" /></button>
                            <button className="text-green-500 hover:text-green-700"><Edit className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ════════ SUBSCRIPTIONS ════════════════════════════ */}
          {activeTab === 'subscriptions' && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Total', value: subscriptionsData.length, color: 'text-gray-900' },
                  { label: 'Active', value: subscriptionsData.filter(s => s.status === 'active').length, color: 'text-green-600' },
                  { label: 'Paused', value: subscriptionsData.filter(s => s.status === 'paused').length, color: 'text-yellow-600' },
                  { label: 'Expired', value: subscriptionsData.filter(s => s.status === 'expired').length, color: 'text-red-600' },
                ].map((s,i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                    <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-gray-500 mt-1 font-medium">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900">All Subscriptions</h3>
                  <button className="flex items-center gap-2 text-sm text-orange-500 font-semibold">
                    <Download className="w-4 h-4" /> Export CSV
                  </button>
                </div>
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>{['ID','User','Plan','Billing','Skipped','Remaining','Paid','Expiry','Status','Actions'].map(h => (
                      <th key={h} className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase whitespace-nowrap">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {subscriptionsData.map(s => (
                      <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 px-4 text-xs font-bold text-gray-400">{s.id}</td>
                        <td className="py-3 px-4 text-sm font-semibold text-gray-800">{s.user}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{s.plan}</td>
                        <td className="py-3 px-4 text-xs text-gray-500 capitalize">{s.billing}</td>
                        <td className="py-3 px-4 text-sm text-center font-bold text-yellow-600">{s.skipped}</td>
                        <td className="py-3 px-4 text-sm text-center font-bold text-blue-600">{s.remaining}</td>
                        <td className="py-3 px-4 text-sm font-bold text-green-700">₹{s.paid.toLocaleString()}</td>
                        <td className="py-3 px-4 text-xs text-gray-500">{s.expiry}</td>
                        <td className="py-3 px-4"><Badge status={s.status} /></td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button title="View" className="text-blue-500 hover:text-blue-700"><Eye className="w-4 h-4" /></button>
                            <button title="Edit" className="text-green-500 hover:text-green-700"><Edit className="w-4 h-4" /></button>
                            {s.status === 'paused'
                              ? <button title="Resume" onClick={() => showToast(`${s.user}'s subscription resumed`)} className="text-purple-500 hover:text-purple-700"><Play className="w-4 h-4" /></button>
                              : <button title="Pause" onClick={() => showToast(`${s.user}'s subscription paused`)} className="text-gray-400 hover:text-gray-600"><Pause className="w-4 h-4" /></button>
                            }
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ════════ USERS ════════════════════════════════════ */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">All Users ({usersData.length})</h3>
                <button className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-semibold">
                  <Plus className="w-4 h-4" /> Add User
                </button>
              </div>
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>{['User','Email','Phone','Plan','Meals Used','Joined','Status','Actions'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {usersData.map(u => (
                    <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center text-sm font-bold text-orange-600">{u.name[0]}</div>
                          <span className="text-sm font-semibold text-gray-800">{u.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-500">{u.email}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{u.phone}</td>
                      <td className="py-3 px-4 text-sm font-semibold text-purple-600">{u.plan}</td>
                      <td className="py-3 px-4 text-sm font-bold text-center text-gray-800">{u.meals}</td>
                      <td className="py-3 px-4 text-xs text-gray-500">{u.joinDate}</td>
                      <td className="py-3 px-4"><Badge status={u.status} /></td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button className="text-blue-500 hover:text-blue-700"><Eye className="w-4 h-4" /></button>
                          <button className="text-green-500 hover:text-green-700"><Edit className="w-4 h-4" /></button>
                          <button className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ════════ MENU ═════════════════════════════════════ */}
          {activeTab === 'menu' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  {['All', 'Main Course', 'Fast Food', 'Beverages', 'Desserts'].map(f => (
                    <button key={f} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${f === 'All' ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'}`}>{f}</button>
                  ))}
                </div>
                <button className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow">
                  <Plus className="w-4 h-4" /> Add Item
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>{['Item','Category','Price','Orders','Availability','Actions'].map(h => (
                      <th key={h} className="text-left py-3 px-5 text-xs font-bold text-gray-500 uppercase">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {menuItems.map(item => (
                      <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 px-5 text-sm font-semibold text-gray-800">{item.name}</td>
                        <td className="py-3 px-5"><span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-medium">{item.category}</span></td>
                        <td className="py-3 px-5 text-sm font-bold text-gray-900">₹{item.price}</td>
                        <td className="py-3 px-5 text-sm text-blue-600 font-semibold">{item.orders}</td>
                        <td className="py-3 px-5">
                          <button onClick={() => showToast(`${item.name} availability updated`)}
                            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all ${item.available ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>
                            {item.available ? <><CheckCircle className="w-3 h-3" /> Available</> : <><XCircle className="w-3 h-3" /> Out of Stock</>}
                          </button>
                        </td>
                        <td className="py-3 px-5">
                          <div className="flex gap-2">
                            <button className="text-blue-500 hover:text-blue-700"><Edit className="w-4 h-4" /></button>
                            <button className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ════════ DELIVERY ═════════════════════════════════ */}
          {activeTab === 'delivery' && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Pending', value: 1, color: 'bg-gray-100 text-gray-700' },
                  { label: 'Preparing', value: 1, color: 'bg-yellow-100 text-yellow-700' },
                  { label: 'On the Way', value: 1, color: 'bg-purple-100 text-purple-700' },
                  { label: 'Delivered', value: 1, color: 'bg-green-100 text-green-700' },
                ].map((s,i) => (
                  <div key={i} className={`rounded-2xl p-4 text-center ${s.color}`}>
                    <p className="text-3xl font-black">{s.value}</p>
                    <p className="text-xs font-bold mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                {deliveryData.map(d => (
                  <div key={d.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                          {d.meal === 'Breakfast' ? '☀️' : d.meal === 'Lunch' ? '🌤️' : '🌙'}
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <p className="font-bold text-gray-900">{d.user}</p>
                            <Badge status={d.status} />
                          </div>
                          <p className="text-sm text-gray-600 mb-1">🍽️ {d.menu}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{d.area}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">{d.time}</p>
                        {d.rider !== '—' && <p className="text-sm font-semibold text-purple-600 mt-1">🚴 {d.rider}</p>}
                        {d.eta !== '—' && <p className="text-xs text-green-600 font-semibold">ETA: {d.eta}</p>}
                      </div>
                    </div>

                    {/* Status Steps */}
                    <div className="mt-4 flex items-center gap-0">
                      {['Preparing', 'Picked Up', 'On the Way', 'Delivered'].map((step, i) => {
                        const steps = ['preparing', 'picked-up', 'on-the-way', 'delivered'];
                        const curr = steps.indexOf(d.status);
                        const done = i <= curr;
                        return (
                          <React.Fragment key={step}>
                            <div className="flex flex-col items-center">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${done ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-200 text-gray-400'}`}>
                                {done ? '✓' : i + 1}
                              </div>
                              <p className={`text-[10px] mt-1 font-medium whitespace-nowrap ${done ? 'text-green-600' : 'text-gray-400'}`}>{step}</p>
                            </div>
                            {i < 3 && <div className={`flex-1 h-0.5 mb-4 ${done && i < curr ? 'bg-green-500' : 'bg-gray-200'}`} />}
                          </React.Fragment>
                        );
                      })}
                    </div>

                    <div className="flex gap-2 mt-3">
                      {['pending', 'preparing'].includes(d.status) && (
                        <button onClick={() => showToast(`Rider assigned to ${d.user}`)}
                          className="flex items-center gap-1 bg-purple-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold">
                          <Truck className="w-3 h-3" /> Assign Rider
                        </button>
                      )}
                      {d.status === 'on-the-way' && (
                        <button onClick={() => showToast(`Marked as delivered for ${d.user}`)}
                          className="flex items-center gap-1 bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold">
                          <CheckCircle className="w-3 h-3" /> Mark Delivered
                        </button>
                      )}
                      <button className="flex items-center gap-1 bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-semibold">
                        <Phone className="w-3 h-3" /> Call User
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════════ ATTENDANCE ════════════════════════════════ */}
          {activeTab === 'attendance' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-gray-500 text-sm">Meal consumption report — current billing cycle</p>
                <button className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50">
                  <Download className="w-4 h-4" /> Export Report
                </button>
              </div>

              <div className="space-y-3">
                {attendanceData.map((a, i) => {
                  const total = a.consumed + a.skipped + a.missed + a.remaining;
                  return (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="font-bold text-gray-900">{a.user}</p>
                          <p className="text-xs text-gray-500">{a.plan}</p>
                        </div>
                        <span className="text-xs bg-blue-50 text-blue-600 font-bold px-3 py-1 rounded-full">{total} Meals Total</span>
                      </div>
                      <div className="grid grid-cols-4 gap-3 mb-4">
                        {[
                          { label: 'Consumed', value: a.consumed, color: 'bg-green-50 text-green-700', emoji: '✅' },
                          { label: 'Skipped', value: a.skipped, color: 'bg-yellow-50 text-yellow-700', emoji: '⏭️' },
                          { label: 'Missed', value: a.missed, color: 'bg-red-50 text-red-700', emoji: '❌' },
                          { label: 'Remaining', value: a.remaining, color: 'bg-blue-50 text-blue-700', emoji: '🍱' },
                        ].map(s => (
                          <div key={s.label} className={`${s.color} rounded-xl p-3 text-center`}>
                            <p className="text-lg">{s.emoji}</p>
                            <p className="text-xl font-black">{s.value}</p>
                            <p className="text-xs font-semibold">{s.label}</p>
                          </div>
                        ))}
                      </div>
                      {/* Progress bar */}
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex">
                        <div className="bg-green-400 h-full" style={{ width: `${(a.consumed/total)*100}%` }} />
                        <div className="bg-yellow-400 h-full" style={{ width: `${(a.skipped/total)*100}%` }} />
                        <div className="bg-red-400 h-full" style={{ width: `${(a.missed/total)*100}%` }} />
                        <div className="bg-blue-200 h-full" style={{ width: `${(a.remaining/total)*100}%` }} />
                      </div>
                      <div className="flex gap-4 mt-2 text-[10px] font-semibold text-gray-500">
                        <span className="flex items-center gap-1"><div className="w-2 h-2 bg-green-400 rounded-full"/>Consumed</span>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 bg-yellow-400 rounded-full"/>Skipped</span>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 bg-red-400 rounded-full"/>Missed</span>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-200 rounded-full"/>Remaining</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ════════ COUPONS ═══════════════════════════════════ */}
          {activeTab === 'coupons' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">{couponsData.filter(c=>c.status==='active').length} active coupons</p>
                <button className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow">
                  <Plus className="w-4 h-4" /> Create Coupon
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {couponsData.map(c => (
                  <div key={c.id} className={`bg-white rounded-2xl border shadow-sm p-5 relative overflow-hidden ${c.status === 'expired' ? 'opacity-60 border-gray-100' : 'border-orange-100'}`}>
                    {c.status === 'active' && <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-full -translate-y-8 translate-x-8" />}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-black text-xl text-orange-500 tracking-wider">{c.code}</span>
                          <Badge status={c.status} />
                        </div>
                        <p className="text-sm text-gray-600">
                          {c.type === 'Percentage' ? `${c.value}% OFF` : `₹${c.value} OFF`} · Min order ₹{c.minOrder}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button className="text-blue-500 hover:text-blue-700"><Edit className="w-4 h-4" /></button>
                        <button className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span>⏰ Expires: {c.expiry}</span>
                      <span>Used: {c.usage}/{c.maxUsage}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-orange-400 to-red-400 rounded-full" style={{ width: `${(c.usage/c.maxUsage)*100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════════ SUPPORT TICKETS ══════════════════════════ */}
          {activeTab === 'tickets' && (
            <div className="space-y-3">
              <div className="flex gap-2">
                {['All', 'Open', 'In Progress', 'Resolved'].map(f => (
                  <button key={f} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${f === 'All' ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'}`}>{f}</button>
                ))}
              </div>

              {ticketsData.map(t => (
                <div key={t.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center font-bold text-orange-600 flex-shrink-0">{t.user[0]}</div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-bold text-gray-900">{t.user}</p>
                          <Badge status={t.priority} />
                          <Badge status={t.status} />
                          <span className="bg-gray-100 text-gray-500 text-xs font-medium px-2 py-0.5 rounded-full">{t.category}</span>
                        </div>
                        <p className="font-semibold text-gray-800 text-sm">{t.subject}</p>
                        <p className="text-xs text-gray-500 mt-1">{t.msg}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">{t.time}</span>
                  </div>

                  {ticketReply === t.id ? (
                    <div className="mt-3 border-t border-gray-100 pt-3">
                      <textarea
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        placeholder="Type your reply..."
                        rows={2}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-orange-300 outline-none resize-none"
                      />
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => { showToast('Reply sent to ' + t.user); setTicketReply(null); setReplyText(''); }}
                          className="flex items-center gap-1 bg-orange-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold">
                          <Send className="w-3 h-3" /> Send Reply
                        </button>
                        <button onClick={() => setTicketReply(null)} className="text-gray-400 text-xs px-3 py-1.5">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2 mt-3 border-t border-gray-100 pt-3">
                      <button onClick={() => setTicketReply(t.id)} className="flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-semibold">
                        <MessageSquare className="w-3 h-3" /> Reply
                      </button>
                      {t.status !== 'resolved' && (
                        <button onClick={() => showToast(`Ticket ${t.id} marked as resolved`)} className="flex items-center gap-1 bg-green-50 text-green-600 px-3 py-1.5 rounded-lg text-xs font-semibold">
                          <CheckCircle className="w-3 h-3" /> Resolve
                        </button>
                      )}
                      <button className="flex items-center gap-1 bg-gray-50 text-gray-500 px-3 py-1.5 rounded-lg text-xs font-semibold">
                        <Phone className="w-3 h-3" /> Call User
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ════════ NOTIFICATIONS ════════════════════════════ */}
          {activeTab === 'notifications' && (
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Send Notification Form */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2"><Send className="w-5 h-5 text-orange-500" /> Send Notification</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1">Target Audience</label>
                    <select value={notifForm.target} onChange={e => setNotifForm({...notifForm, target: e.target.value})}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-300 outline-none">
                      <option value="all">All Subscribers (890)</option>
                      <option value="basic">Basic Plan Users</option>
                      <option value="standard">Standard Plan Users</option>
                      <option value="premium">Premium Plan Users</option>
                      <option value="expiring">Expiring Soon (≤5 days)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1">Notification Title</label>
                    <input type="text" value={notifForm.title} onChange={e => setNotifForm({...notifForm, title: e.target.value})}
                      placeholder="e.g. Today's Lunch Menu 🍱"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-300 outline-none" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1">Message</label>
                    <textarea value={notifForm.msg} onChange={e => setNotifForm({...notifForm, msg: e.target.value})}
                      placeholder="Write your message here..."
                      rows={4}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-300 outline-none resize-none" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-2">Quick Templates</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: '🍱 Today\'s Menu', msg: 'Today\'s lunch: Dal + Rice + Roti + Sabji. Available 12:30–2:30 PM!' },
                        { label: '⚠️ Expiry Alert', msg: 'Your mess plan expires in 3 days. Renew now to avoid disruption!' },
                        { label: '🎉 Weekend Special', msg: 'This Sunday — Special Thali + Gulab Jamun FREE for all subscribers!' },
                        { label: '🏷️ New Offer', msg: 'Use MESS20 to get 20% off on plan renewal. Limited time!' },
                      ].map(t => (
                        <button key={t.label} onClick={() => setNotifForm({...notifForm, msg: t.msg})}
                          className="px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg text-xs font-semibold hover:bg-orange-100 border border-orange-100">
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => { showToast(`Notification sent to ${notifForm.target === 'all' ? '890' : '~200'} users!`); setNotifForm({title:'',msg:'',target:'all'}); }}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md">
                    <Send className="w-4 h-4" /> Send Notification
                  </button>
                </div>
              </div>

              {/* History */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-5">Recent Notifications</h3>
                <div className="space-y-3">
                  {notifHistory.map((n, i) => (
                    <div key={i} className="flex gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${
                        n.type === 'menu' ? 'bg-orange-100' : n.type === 'alert' ? 'bg-red-100' : n.type === 'offer' ? 'bg-green-100' : 'bg-purple-100'
                      }`}>
                        {n.type === 'menu' ? '🍱' : n.type === 'alert' ? '⚠️' : n.type === 'offer' ? '🎉' : '🏷️'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 text-sm">{n.title}</p>
                        <p className="text-xs text-gray-500 truncate">{n.msg}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] text-gray-400">{n.time}</span>
                          <span className="text-[10px] text-green-600 font-semibold">✅ {n.sent}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════════ MEAL SCHEDULE ════════════════════════════ */}
          {activeTab === 'schedule' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Toggle meals on/off for each day of the week. Changes reflect immediately for users.</p>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left py-4 px-6 text-sm font-bold text-gray-600">Day</th>
                      {['☀️ Breakfast', '🌤️ Lunch', '🌙 Dinner'].map(m => (
                        <th key={m} className="text-center py-4 px-6 text-sm font-bold text-gray-600">{m}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(schedule).map(([day, meals]) => (
                      <tr key={day} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center font-bold text-orange-600">{day}</div>
                          </div>
                        </td>
                        {(['breakfast', 'lunch', 'dinner'] as const).map(meal => (
                          <td key={meal} className="py-4 px-6 text-center">
                            <button onClick={() => toggleMeal(day, meal)}
                              className={`w-12 h-6 rounded-full relative transition-all duration-300 ${meals[meal] ? 'bg-green-500' : 'bg-gray-300'}`}>
                              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all duration-300 shadow ${meals[meal] ? 'right-0.5' : 'left-0.5'}`} />
                            </button>
                            <p className={`text-[10px] font-semibold mt-1 ${meals[meal] ? 'text-green-600' : 'text-gray-400'}`}>
                              {meals[meal] ? 'ON' : 'OFF'}
                            </p>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ════════ SETTINGS ═════════════════════════════════ */}
          {activeTab === 'settings' && (
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl">
              {[
                { title: 'Restaurant Info', fields: [{ label: 'Restaurant Name', val: 'Student Tiffin Service' }, { label: 'Address', val: 'North Campus, Delhi University' }, { label: 'Phone', val: '+91 99999 99999' }, { label: 'Email', val: 'admin@mess.com' }] },
                { title: 'Delivery Settings', fields: [{ label: 'Delivery Radius (km)', val: '5' }, { label: 'Min Order Amount (₹)', val: '50' }, { label: 'Delivery Charge (₹)', val: '0 (Free)' }, { label: 'Delivery Hours', val: '8AM – 10PM' }] },
              ].map(section => (
                <div key={section.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h3 className="font-bold text-gray-900 mb-4">{section.title}</h3>
                  <div className="space-y-3">
                    {section.fields.map(f => (
                      <div key={f.label}>
                        <label className="text-xs font-bold text-gray-500 block mb-1">{f.label}</label>
                        <input defaultValue={f.val} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-300 outline-none" />
                      </div>
                    ))}
                    <button onClick={() => showToast(`${section.title} saved!`)} className="w-full bg-orange-500 text-white py-2.5 rounded-xl font-bold text-sm mt-2">
                      Save Changes
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ════════ RIDER MANAGEMENT ═════════════════════════ */}
          {activeTab === 'riders' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Available', value: ridersData.filter(r=>r.status==='available').length, color: 'bg-green-50 text-green-700 border-green-100' },
                  { label: 'Busy', value: ridersData.filter(r=>r.status==='busy').length, color: 'bg-yellow-50 text-yellow-700 border-yellow-100' },
                  { label: 'Offline', value: ridersData.filter(r=>r.status==='offline').length, color: 'bg-gray-50 text-gray-600 border-gray-100' },
                ].map((s,i) => (
                  <div key={i} className={`rounded-2xl border p-4 text-center ${s.color}`}>
                    <p className="text-3xl font-black">{s.value}</p>
                    <p className="text-xs font-bold mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">{ridersData.length} total riders</p>
                <button onClick={() => showToast('Rider add form coming soon')} className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow">
                  <Plus className="w-4 h-4" /> Add Rider
                </button>
              </div>
              <div className="space-y-3">
                {ridersData.map(r => (
                  <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-5">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">🏍️</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-bold text-gray-900">{r.name}</p>
                        <Badge status={r.status} />
                        {r.status === 'busy' && <span className="text-xs text-yellow-600 font-semibold">{r.orders} active orders</span>}
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{r.phone}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{r.area}</span>
                        <span className="flex items-center gap-1"><Truck className="w-3 h-3" />{r.totalDeliveries} deliveries</span>
                        <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400" />{r.rating}/5</span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => showToast(`Called ${r.name}`)} className="flex items-center gap-1 bg-green-50 text-green-600 px-3 py-1.5 rounded-lg text-xs font-semibold border border-green-100">
                        <Phone className="w-3 h-3" /> Call
                      </button>
                      <button onClick={() => showToast(`${r.name} status updated`)} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border ${r.status === 'offline' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                        {r.status === 'offline' ? <><Play className="w-3 h-3"/> Activate</> : <><Pause className="w-3 h-3"/> {r.status === 'busy' ? 'Busy' : 'Deactivate'}</>}
                      </button>
                      <button className="text-blue-500 hover:text-blue-700 p-1.5"><Edit className="w-4 h-4" /></button>
                      <button className="text-red-500 hover:text-red-700 p-1.5"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════════ SKIP REQUESTS ════════════════════════════ */}
          {activeTab === 'skipreq' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Pending', value: skipRequestsData.filter(s=>s.status==='pending').length, color: 'bg-orange-50 text-orange-700' },
                  { label: 'Approved', value: skipRequestsData.filter(s=>s.status==='approved').length, color: 'bg-green-50 text-green-700' },
                  { label: 'Rejected', value: skipRequestsData.filter(s=>s.status==='rejected').length, color: 'bg-red-50 text-red-700' },
                ].map((s,i) => (
                  <div key={i} className={`rounded-2xl p-4 text-center ${s.color}`}>
                    <p className="text-3xl font-black">{s.value}</p>
                    <p className="text-xs font-bold mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>{['User','Meal','Date','Menu','Wallet Credit','Requested','Status','Actions'].map(h => (
                      <th key={h} className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase whitespace-nowrap">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {skipRequestsData.map(s => (
                      <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-semibold text-gray-800">{s.user}</td>
                        <td className="py-3 px-4"><span className="bg-blue-50 text-blue-600 text-xs font-bold px-2 py-1 rounded-full">{s.meal}</span></td>
                        <td className="py-3 px-4 text-xs text-gray-500 font-semibold">{s.date}</td>
                        <td className="py-3 px-4 text-xs text-gray-600 max-w-[140px] truncate">{s.menu}</td>
                        <td className="py-3 px-4 text-sm font-bold text-green-600">+₹{s.credit}</td>
                        <td className="py-3 px-4 text-xs text-gray-400">{s.requestedAt}</td>
                        <td className="py-3 px-4"><Badge status={s.status} /></td>
                        <td className="py-3 px-4">
                          {s.status === 'pending' && (
                            <div className="flex gap-2">
                              <button onClick={() => showToast(`Approved skip for ${s.user} — ₹${s.credit} credited`)}
                                className="flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                                <CheckCircle className="w-3 h-3" /> Approve
                              </button>
                              <button onClick={() => showToast(`Rejected skip for ${s.user}`)}
                                className="flex items-center gap-1 bg-red-100 text-red-600 px-2 py-1 rounded-lg text-xs font-bold">
                                <XCircle className="w-3 h-3" /> Reject
                              </button>
                            </div>
                          )}
                          {s.status !== 'pending' && <span className="text-xs text-gray-400 italic">Done</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ════════ RATINGS & FEEDBACK ═══════════════════════ */}
          {activeTab === 'ratings' && (
            <div className="space-y-5">
              {ratingsData.map((r, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-bold text-gray-900 text-lg">{r.meal}</p>
                      <p className="text-xs text-gray-400">{r.date} · {r.totalRatings} ratings</p>
                    </div>
                    <div className="text-center bg-yellow-50 border border-yellow-100 rounded-2xl px-5 py-3">
                      <p className="text-3xl font-black text-yellow-500">{r.avgRating}</p>
                      <div className="flex gap-0.5 justify-center my-1">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} className={`w-3 h-3 ${s <= Math.round(r.avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                        ))}
                      </div>
                      <p className="text-xs text-gray-400">avg rating</p>
                    </div>
                  </div>
                  {/* Star distribution */}
                  <div className="space-y-1.5 mb-5">
                    {[5,4,3,2,1].map(s => {
                      const count = r.ratings.filter(rv => rv.stars === s).length;
                      const pct = r.ratings.length > 0 ? (count / r.ratings.length) * 100 : 0;
                      return (
                        <div key={s} className="flex items-center gap-3 text-xs">
                          <span className="text-gray-500 w-4 text-right font-semibold">{s}</span>
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-gray-400 w-4">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="space-y-3">
                    {r.ratings.map((rv, j) => (
                      <div key={j} className="flex items-start gap-3 bg-gray-50 rounded-xl p-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-xs font-bold text-orange-600 flex-shrink-0">{rv.user[0]}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-xs font-bold text-gray-800">{rv.user}</p>
                            <div className="flex gap-0.5">
                              {[1,2,3,4,5].map(s => <Star key={s} className={`w-3 h-3 ${s <= rv.stars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />)}
                            </div>
                            <span className="text-xs text-gray-400 ml-auto">{rv.time}</span>
                          </div>
                          <p className="text-xs text-gray-600 italic">"{rv.comment}"</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ════════ REVENUE REPORTS ══════════════════════════ */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  {['This Month', 'Last 6 Months', 'This Year'].map(f => (
                    <button key={f} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${f === 'Last 6 Months' ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-200'}`}>{f}</button>
                  ))}
                </div>
                <button onClick={() => showToast('Report downloaded!')} className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50">
                  <Download className="w-4 h-4" /> Download PDF
                </button>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Total Revenue', value: '₹4,72,000', sub: 'Last 6 months', color: 'bg-green-50 text-green-600' },
                  { label: 'Basic Revenue', value: '₹2,60,000', sub: '55% share', color: 'bg-blue-50 text-blue-600' },
                  { label: 'Standard Revenue', value: '₹6,22,000', sub: 'Most revenue', color: 'bg-purple-50 text-purple-600' },
                  { label: 'Premium Revenue', value: '₹4,71,000', sub: '33% share', color: 'bg-orange-50 text-orange-600' },
                ].map((s,i) => (
                  <div key={i} className={`${s.color} rounded-2xl p-4 border border-opacity-20`}>
                    <p className="text-xs font-bold opacity-70 mb-1">{s.label}</p>
                    <p className="text-2xl font-black">{s.value}</p>
                    <p className="text-xs opacity-60 mt-1">{s.sub}</p>
                  </div>
                ))}
              </div>

              {/* Stacked Bar Chart */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-5">Revenue by Plan (Monthly)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueByPlan}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v: any) => `₹${v.toLocaleString()}`} />
                    <Legend />
                    <Bar dataKey="basic" stackId="a" fill="#60A5FA" radius={[0,0,0,0]} name="Basic" />
                    <Bar dataKey="standard" stackId="a" fill="#8B5CF6" radius={[0,0,0,0]} name="Standard" />
                    <Bar dataKey="premium" stackId="a" fill="#F97316" radius={[4,4,0,0]} name="Premium" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Monthly table */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>{['Month','Basic','Standard','Premium','Total','Growth'].map(h => (
                      <th key={h} className="text-left py-3 px-5 text-xs font-bold text-gray-500 uppercase">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {revenueByPlan.map((r, i) => {
                      const total = r.basic + r.standard + r.premium;
                      const prev = i > 0 ? revenueByPlan[i-1].basic + revenueByPlan[i-1].standard + revenueByPlan[i-1].premium : null;
                      const growth = prev ? (((total - prev) / prev) * 100).toFixed(1) : null;
                      return (
                        <tr key={r.month} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-3 px-5 font-bold text-gray-800">{r.month}</td>
                          <td className="py-3 px-5 text-sm text-blue-600 font-semibold">₹{r.basic.toLocaleString()}</td>
                          <td className="py-3 px-5 text-sm text-purple-600 font-semibold">₹{r.standard.toLocaleString()}</td>
                          <td className="py-3 px-5 text-sm text-orange-600 font-semibold">₹{r.premium.toLocaleString()}</td>
                          <td className="py-3 px-5 text-sm font-black text-gray-900">₹{total.toLocaleString()}</td>
                          <td className="py-3 px-5">
                            {growth && <span className={`text-xs font-bold ${+growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>{+growth >= 0 ? '↑' : '↓'} {Math.abs(+growth)}%</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ════════ FOOD WASTE TRACKER ════════════════════════ */}
          {activeTab === 'waste' && (
            <div className="space-y-5">
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'This Week Total', value: `${wasteData.reduce((a,d)=>a+d.total,0)} meals`, color: 'bg-red-50 text-red-700' },
                  { label: 'Avg/Day', value: `${Math.round(wasteData.reduce((a,d)=>a+d.total,0)/7)} meals`, color: 'bg-orange-50 text-orange-700' },
                  { label: 'Worst Day', value: wasteData.sort((a,b)=>b.total-a.total)[0].day, color: 'bg-yellow-50 text-yellow-700' },
                  { label: 'Best Day', value: wasteData.sort((a,b)=>a.total-b.total)[0].day, color: 'bg-green-50 text-green-700' },
                ].map((s,i) => (
                  <div key={i} className={`rounded-2xl p-4 text-center ${s.color}`}>
                    <p className="text-xl font-black">{s.value}</p>
                    <p className="text-xs font-bold mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2"><Leaf className="w-5 h-5 text-green-500" />Weekly Food Waste (meals wasted)</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={wasteData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="breakfast" fill="#FCD34D" radius={[2,2,0,0]} name="Breakfast" />
                    <Bar dataKey="lunch" fill="#F97316" radius={[2,2,0,0]} name="Lunch" />
                    <Bar dataKey="dinner" fill="#8B5CF6" radius={[2,2,0,0]} name="Dinner" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900">Daily Waste Log</h3>
                  <button onClick={() => showToast('Waste report downloaded!')} className="flex items-center gap-2 text-sm text-orange-500 font-semibold">
                    <Download className="w-4 h-4" /> Export
                  </button>
                </div>
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>{['Day','☀️ Breakfast','🌤️ Lunch','🌙 Dinner','Total','Action'].map(h => (
                      <th key={h} className="text-left py-3 px-5 text-xs font-bold text-gray-500 uppercase">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {wasteData.map(d => (
                      <tr key={d.day} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 px-5 font-bold text-gray-800">{d.day}</td>
                        <td className="py-3 px-5 text-sm text-yellow-600 font-semibold">{d.breakfast || '—'}</td>
                        <td className="py-3 px-5 text-sm text-orange-600 font-semibold">{d.lunch || '—'}</td>
                        <td className="py-3 px-5 text-sm text-purple-600 font-semibold">{d.dinner || '—'}</td>
                        <td className="py-3 px-5 font-black text-gray-900">{d.total}</td>
                        <td className="py-3 px-5">
                          <button onClick={() => showToast(`${d.day} waste log updated`)} className="text-xs text-blue-500 font-semibold flex items-center gap-1">
                            <Edit className="w-3 h-3" /> Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ════════ WALLET MANAGEMENT ════════════════════════ */}
          {activeTab === 'wallet' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-100 rounded-2xl p-4 text-center">
                  <p className="text-2xl font-black text-green-700">₹{walletsData.reduce((a,w)=>a+w.balance,0).toLocaleString()}</p>
                  <p className="text-xs font-bold text-green-600 mt-1">Total Wallet Balance</p>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center">
                  <p className="text-2xl font-black text-blue-700">{walletsData.length}</p>
                  <p className="text-xs font-bold text-blue-600 mt-1">Users with Wallet</p>
                </div>
                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 text-center">
                  <p className="text-2xl font-black text-orange-700">₹{Math.round(walletsData.reduce((a,w)=>a+w.balance,0)/walletsData.length)}</p>
                  <p className="text-xs font-bold text-orange-600 mt-1">Avg Balance/User</p>
                </div>
              </div>

              <div className="space-y-4">
                {walletsData.map((w, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center font-bold text-orange-600">{w.user[0]}</div>
                        <div>
                          <p className="font-bold text-gray-900">{w.user}</p>
                          <p className="text-xs text-gray-400">{w.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xs text-gray-400">Balance</p>
                          <p className="text-2xl font-black text-green-600">₹{w.balance}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => showToast(`₹50 credited to ${w.user}`)} className="flex items-center gap-1 bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold">
                            + Add Credit
                          </button>
                          <button onClick={() => showToast(`₹50 debited from ${w.user}`)} className="flex items-center gap-1 bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold">
                            - Deduct
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-gray-100 pt-3">
                      <p className="text-xs font-bold text-gray-500 mb-2">Recent Transactions</p>
                      <div className="space-y-1.5">
                        {w.transactions.map((t, j) => (
                          <div key={j} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${t.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                {t.type === 'credit' ? '+' : '−'}
                              </span>
                              <span className="text-xs text-gray-600">{t.desc}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`text-xs font-bold ${t.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                {t.type === 'credit' ? '+' : '−'}₹{t.amount}
                              </span>
                              <span className="text-xs text-gray-400">{t.date}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════════ INVOICES ═════════════════════════════════ */}
          {activeTab === 'invoice' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">Generate & download invoices for subscribers</p>
                <button onClick={() => showToast('Bulk invoices generated!')} className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow">
                  <FileText className="w-4 h-4" /> Generate All (Sep)
                </button>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>{['Invoice #','User','Plan','Period','Amount','Generated','Action'].map(h => (
                      <th key={h} className="text-left py-3 px-5 text-xs font-bold text-gray-500 uppercase">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {[
                      { inv: 'INV-2024-001', user: 'Rahul Sharma', plan: 'Standard', period: 'Sep 2024', amount: 4299, date: '01 Sep 2024' },
                      { inv: 'INV-2024-002', user: 'Priya Mehta', plan: 'Premium (Semester)', period: 'Sep–Feb 2024', amount: 30594, date: '01 Sep 2024' },
                      { inv: 'INV-2024-003', user: 'Aman Khan', plan: 'Basic', period: 'Sep 2024', amount: 2499, date: '01 Sep 2024' },
                      { inv: 'INV-2024-004', user: 'Sneha Verma', plan: 'Standard', period: 'Sep 2024', amount: 4299, date: '01 Sep 2024' },
                      { inv: 'INV-2024-005', user: 'Dev Patel', plan: 'Premium', period: 'Aug 2024', amount: 5999, date: '01 Aug 2024' },
                    ].map((inv, i) => (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 px-5 text-xs font-bold text-orange-500">{inv.inv}</td>
                        <td className="py-3 px-5 text-sm font-semibold text-gray-800">{inv.user}</td>
                        <td className="py-3 px-5 text-sm text-gray-600">{inv.plan}</td>
                        <td className="py-3 px-5 text-xs text-gray-500">{inv.period}</td>
                        <td className="py-3 px-5 text-sm font-black text-green-700">₹{inv.amount.toLocaleString()}</td>
                        <td className="py-3 px-5 text-xs text-gray-400">{inv.date}</td>
                        <td className="py-3 px-5">
                          <div className="flex gap-2">
                            <button onClick={() => showToast(`Invoice ${inv.inv} downloaded`)} className="flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-semibold">
                              <Download className="w-3 h-3" /> PDF
                            </button>
                            <button onClick={() => showToast(`Invoice sent to ${inv.user}`)} className="flex items-center gap-1 bg-green-50 text-green-600 px-3 py-1.5 rounded-lg text-xs font-semibold">
                              <Send className="w-3 h-3" /> Send
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ════════ AREAS & HOSTELS ══════════════════════════ */}
          {activeTab === 'areas' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">{areasData.filter(a=>a.status==='active').length} active delivery zones · {areasData.reduce((a,z)=>a+z.activeUsers,0)} total users</p>
                <button onClick={() => showToast('Area added!')} className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow">
                  <Plus className="w-4 h-4" /> Add Area
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {areasData.map(a => (
                  <div key={a.id} className={`bg-white rounded-2xl border shadow-sm p-5 ${a.status === 'inactive' ? 'opacity-60 border-gray-100' : 'border-gray-100'}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl">🏘️</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-gray-900">{a.name}</p>
                            <Badge status={a.status} />
                          </div>
                          <p className="text-xs text-gray-500">{a.activeUsers} active subscribers</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => showToast(`${a.name} updated`)} className="text-blue-500 hover:text-blue-700"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => showToast(`${a.name} deleted`)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Truck className="w-3 h-3 text-purple-400" />
                        <span className="font-semibold">Rider:</span> {a.rider}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Clock className="w-3 h-3 text-orange-400" />
                        <span className="font-semibold">Delivery Time:</span> {a.deliveryTime}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {a.hostels.map(h => (
                          <span key={h} className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">{h}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════════ BULK OPERATIONS ══════════════════════════ */}
          {activeTab === 'bulk' && (
            <div className="space-y-5 max-w-2xl">
              <p className="text-sm text-gray-500">Perform bulk actions on all or selected subscribers at once.</p>

              {[
                {
                  title: '📢 Bulk Notification',
                  desc: 'Send a message to all active subscribers at once',
                  color: 'border-blue-100 bg-blue-50',
                  action: 'Send to All (890)',
                  actionColor: 'bg-blue-500 hover:bg-blue-600',
                  fields: [
                    { label: 'Title', placeholder: "e.g. Today's Lunch Ready!" },
                    { label: 'Message', placeholder: 'Write your notification message...' },
                  ],
                },
                {
                  title: '⏸️ Bulk Pause',
                  desc: 'Pause subscriptions for a specific date range (e.g. holidays)',
                  color: 'border-yellow-100 bg-yellow-50',
                  action: 'Pause All Subscriptions',
                  actionColor: 'bg-yellow-500 hover:bg-yellow-600',
                  fields: [
                    { label: 'From Date', placeholder: 'e.g. 2024-10-02' },
                    { label: 'To Date', placeholder: 'e.g. 2024-10-05' },
                  ],
                },
                {
                  title: '💳 Bulk Wallet Credit',
                  desc: 'Add wallet credit to all active subscribers (e.g. festival bonus)',
                  color: 'border-green-100 bg-green-50',
                  action: 'Add Credit to All',
                  actionColor: 'bg-green-500 hover:bg-green-600',
                  fields: [
                    { label: 'Amount (₹)', placeholder: 'e.g. 50' },
                    { label: 'Reason', placeholder: 'e.g. Diwali Bonus' },
                  ],
                },
                {
                  title: '🔔 Renewal Reminder',
                  desc: 'Send renewal reminders to all expiring subscribers',
                  color: 'border-orange-100 bg-orange-50',
                  action: 'Send Reminder (28 users)',
                  actionColor: 'bg-orange-500 hover:bg-orange-600',
                  fields: [
                    { label: 'Days Before Expiry', placeholder: 'e.g. 5' },
                    { label: 'Custom Message', placeholder: 'Your plan expires soon. Renew now!' },
                  ],
                },
              ].map((op, i) => (
                <div key={i} className={`rounded-2xl border p-5 ${op.color}`}>
                  <h3 className="font-bold text-gray-900 mb-1">{op.title}</h3>
                  <p className="text-xs text-gray-500 mb-4">{op.desc}</p>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    {op.fields.map(f => (
                      <div key={f.label}>
                        <label className="text-xs font-bold text-gray-600 block mb-1">{f.label}</label>
                        <input type="text" placeholder={f.placeholder} className="w-full border border-gray-200 bg-white rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-orange-300 outline-none" />
                      </div>
                    ))}
                  </div>
                  <button onClick={() => showToast(`${op.title} executed successfully!`)} className={`${op.actionColor} text-white px-5 py-2 rounded-xl text-sm font-bold transition-all`}>
                    {op.action}
                  </button>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminPanel;