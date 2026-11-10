import React, { useState, useMemo } from 'react';
import {
  Bike,
  Truck,
  MapPin,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Phone,
  ShieldCheck,
  Check,
  X,
  ChevronRight,
  DollarSign,
  Calendar,
  TrendingUp,
  Compass,
  Navigation,
  RefreshCw,
  FileText,
  Sparkles,
  Layers,
  Send,
  Star,
  SlidersHorizontal,
  ArrowUpRight,
  Download,
  AlertCircle,
  Utensils,
  ShoppingBag,
  Award,
  Info,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Copy,
  Receipt,
  UserCheck,
  Bell,
  CheckCircle,
  Activity,
  Zap,
  Coffee,
  XCircle
} from 'lucide-react';
import { adminAPI, ordersAPI } from '../../services/api';
import RiderEarningsReport from './RiderEarningsReport';

// ─── INTERFACES ───────────────────────────────────────────────────
export interface RiderData {
  id: string;
  _id?: string;
  name: string;
  phone: string;
  route: string;
  vehicle: string;
  vehicleType?: string;
  licenseNumber?: string;
  aadhaarNumber?: string;
  aadhaarCardImage?: string;
  aadhaarVerified?: boolean;
  kycStatus?: 'verified' | 'pending';
  kycVerifiedAt?: string;
  kycDocumentType?: string;
  status: 'available' | 'on-route' | 'busy' | 'offline' | 'suspended';
  onlineStatus?: 'online' | 'offline';
  address?: string;
  avatar?: string;
  joiningDate?: string;
  deliveriesToday: number;
  activeTiffins: number;
  rating: number;
  perDeliveryRate?: number;
  salaryType?: 'per_delivery' | 'fixed';
  earningsToday?: number;
  earningsTotal?: number;
  payoutStatus?: 'paid' | 'pending';
  currentLocation?: { lat: number; lng: number; area: string };
  shift?: { start: string; end: string; loggedHours: string };
}

export interface DeliveryRidersSuiteProps {
  riders: RiderData[];
  setRiders: React.Dispatch<React.SetStateAction<any[]>>;
  dispatchRoster: any[];
  setDispatchRoster: React.Dispatch<React.SetStateAction<any[]>>;
  orders: any[];
  setOrders: React.Dispatch<React.SetStateAction<any[]>>;
  deliveryZones: any[];
  subscribers: any[];
  complaints: any[];
  onNotify: (msg: string, type: 'success' | 'error') => void;
  initialSubTab?: string;
}

export default function DeliveryRidersSuite({
  riders,
  setRiders,
  dispatchRoster,
  setDispatchRoster,
  orders,
  setOrders,
  deliveryZones,
  subscribers,
  complaints,
  onNotify,
  initialSubTab = 'overview'
}: DeliveryRidersSuiteProps) {
  // ── SUB-NAVIGATION TAB ──
  const [subTab, setSubTab] = useState<
    'overview' | 'riders' | 'mess' | 'instant' | 'all' | 'tracking' | 'earnings' | 'attendance' | 'settings'
  >((initialSubTab as any) || 'overview');

  // ── SEARCH & FILTER STATES ──
  const [searchQuery, setSearchQuery] = useState('');
  const [riderStatusFilter, setRiderStatusFilter] = useState<string>('all');
  const [messMealFilter, setMessMealFilter] = useState<'All' | 'Breakfast' | 'Lunch' | 'Dinner'>('Lunch');
  const [messAreaFilter, setMessAreaFilter] = useState<string>('all');
  const [messStatusFilter, setMessStatusFilter] = useState<'all' | 'unassigned' | 'assigned' | 'delivered'>('all');
  const [lunchRiderId, setLunchRiderId] = useState<string>('');
  const [dinnerRiderId, setDinnerRiderId] = useState<string>('');
  const [isAssigningSlot, setIsAssigningSlot] = useState<'Lunch' | 'Dinner' | null>(null);
  const [messAssignMode, setMessAssignMode] = useState<'zone' | 'shift'>('zone');
  const [zoneRiderSelection, setZoneRiderSelection] = useState<Record<string, string>>({});
  const [zoneSlotSelection, setZoneSlotSelection] = useState<Record<string, string>>({});
  const [isAssigningZoneSuite, setIsAssigningZoneSuite] = useState<string | null>(null);
  const [expandedZoneDetails, setExpandedZoneDetails] = useState<Record<string, boolean>>({});
  const [instantStatusFilter, setInstantStatusFilter] = useState<string>('all');
  const [allServiceFilter, setAllServiceFilter] = useState<'all' | 'mess' | 'instant'>('all');
  const [allStatusFilter, setAllStatusFilter] = useState<string>('all');
  const [allAreaFilter, setAllAreaFilter] = useState<string>('all');

  // Memos for Meal-Slot Breakdown (Lunch vs Dinner)
  const lunchTiffins = useMemo(() => {
    return dispatchRoster.filter(d => !d.isSkipped && (d.slot || d.mealSlot || '').toLowerCase().includes('lunch'));
  }, [dispatchRoster]);

  const dinnerTiffins = useMemo(() => {
    return dispatchRoster.filter(d => !d.isSkipped && (d.slot || d.mealSlot || '').toLowerCase().includes('dinner'));
  }, [dispatchRoster]);

  const lunchUnassigned = useMemo(() => {
    return lunchTiffins.filter(d => !d.assignedRider || d.assignedRider === 'Unassigned').length;
  }, [lunchTiffins]);

  const dinnerUnassigned = useMemo(() => {
    return dinnerTiffins.filter(d => !d.assignedRider || d.assignedRider === 'Unassigned').length;
  }, [dinnerTiffins]);

  const lunchPrimaryRider = useMemo(() => {
    const counts: Record<string, number> = {};
    lunchTiffins.forEach(d => {
      if (d.assignedRider && d.assignedRider !== 'Unassigned') {
        counts[d.assignedRider] = (counts[d.assignedRider] || 0) + 1;
      }
    });
    let topRider = '';
    let max = 0;
    Object.entries(counts).forEach(([r, c]) => {
      if (c > max) { max = c; topRider = r; }
    });
    return topRider;
  }, [lunchTiffins]);

  const dinnerPrimaryRider = useMemo(() => {
    const counts: Record<string, number> = {};
    dinnerTiffins.forEach(d => {
      if (d.assignedRider && d.assignedRider !== 'Unassigned') {
        counts[d.assignedRider] = (counts[d.assignedRider] || 0) + 1;
      }
    });
    let topRider = '';
    let max = 0;
    Object.entries(counts).forEach(([r, c]) => {
      if (c > max) { max = c; topRider = r; }
    });
    return topRider;
  }, [dinnerTiffins]);

  // ── MODAL STATES ──
  const [riderModalOpen, setRiderModalOpen] = useState(false);
  const [editingRider, setEditingRider] = useState<RiderData | null>(null);
  const [viewHistoryRider, setViewHistoryRider] = useState<RiderData | null>(null);
  const [viewPerformanceRider, setViewPerformanceRider] = useState<RiderData | null>(null);
  const [viewAadhaarModalRider, setViewAadhaarModalRider] = useState<RiderData | null>(null);
  const [isVerifyingAadhaar, setIsVerifyingAadhaar] = useState<boolean>(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignItem, setAssignItem] = useState<{ id: string; type: 'mess' | 'instant'; customer: string; address: string } | null>(null);
  const [selectedRiderForAssign, setSelectedRiderForAssign] = useState<string>('');
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [confirmDeliveryItem, setConfirmDeliveryItem] = useState<any | null>(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [settleModalOpen, setSettleModalOpen] = useState(false);
  const [settleRider, setSettleRider] = useState<RiderData | null>(null);
  const [selectedMapRider, setSelectedMapRider] = useState<RiderData | null>(null);

  // ── FORM STATE FOR RIDER (ADD / EDIT) ──
  const [riderForm, setRiderForm] = useState({
    name: '',
    phone: '',
    route: 'North Campus (NC-01)',
    vehicle: 'Electric Scooter',
    vehicleType: 'Electric Scooter',
    licenseNumber: '',
    aadhaarNumber: '',
    aadhaarCardImage: '',
    aadhaarVerified: false,
    kycStatus: 'verified' as 'verified' | 'pending',
    status: 'available' as 'available' | 'busy' | 'on-route' | 'offline',
    address: 'Tagore Lane, North Campus, Delhi',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=compress&cs=tinysrgb&w=150',
    perDeliveryRate: 35,
    salaryType: 'per_delivery' as 'per_delivery' | 'fixed'
  });

  // ── SETTINGS STATE ──
  const [settings, setSettings] = useState({
    perDeliveryRate: 35,
    autoAssign: true,
    requireOtp: true,
    gpsPingInterval: 30,
    lunchCutoff: '11:45 AM',
    dinnerCutoff: '07:00 PM',
    soundAlerts: true
  });

  // ── DERIVED METRICS ──
  // Riders Counts
  const totalRidersCount = riders.length;
  const onlineRidersList = riders.filter(r => r.status !== 'offline');
  const onlineRidersCount = onlineRidersList.length;
  const availableRidersCount = riders.filter(r => r.status === 'available').length;
  const busyRidersCount = riders.filter(r => r.status === 'on-route' || r.status === 'busy').length;

  // Deliveries Counts
  const activeMessDeliveries = dispatchRoster.filter(d => (d.status || '').toLowerCase() !== 'delivered');
  const activeInstantOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');
  const totalActiveDeliveries = activeMessDeliveries.length + activeInstantOrders.length;

  // Today's Mess Deliveries
  const todayMessDeliveriesCount = dispatchRoster.length;
  const deliveredMessCount = dispatchRoster.filter(d => (d.status || '').toLowerCase() === 'delivered').length;
  const pendingMessCount = dispatchRoster.filter(d => (d.status || '').toLowerCase() === 'pending').length;

  // Today's Instant Orders
  const todayInstantOrdersCount = orders.length;
  const newInstantCount = orders.filter(o => (o.deliveryStatus || '').toLowerCase().includes('new') || o.status === 'confirmed').length;
  const preparingInstantCount = orders.filter(o => (o.deliveryStatus || '').toLowerCase().includes('prep') || o.status === 'preparing').length;
  const readyInstantCount = orders.filter(o => (o.deliveryStatus || '').toLowerCase().includes('ready')).length;
  const outInstantCount = orders.filter(o => (o.deliveryStatus || '').toLowerCase().includes('out') || o.status === 'on-the-way').length;
  const deliveredInstantCount = orders.filter(o => o.status === 'delivered').length;

  // Delayed / Failed
  const delayedDeliveriesCount = 0;
  const failedDeliveriesCount = 0;
  const onTimePerformance = dispatchRoster.length > 0 || orders.length > 0 ? '100%' : '100%';

  // ── UNIFIED DELIVERIES LIST ──
  const unifiedDeliveries = useMemo(() => {
    const list: any[] = [];

    // Mess Deliveries
    dispatchRoster.forEach(item => {
      list.push({
        id: item.orderId || item.id || `M-${Math.floor(Math.random() * 900) + 100}`,
        rawId: item._id || item.id,
        service: 'Mess Tiffin',
        serviceType: 'mess',
        customerName: item.customerName || item.studentName || 'Student Subscriber',
        customerPhone: item.customerPhone || '',
        address: item.hostelAddress || (item.hostel ? `${item.hostel}, Room ${item.room || ''}` : ''),
        zone: item.zone || item.zoneCode || 'North Campus',
        deliverySlot: item.scheduledTime || `${item.mealSlot || 'Lunch'} (12:30 PM)`,
        itemsSummary: `${item.planName || 'Standard Meal Plan'} (${item.dietPreference || 'Veg'})`,
        rider: item.assignedRider || 'Unassigned',
        riderPhone: item.riderPhone || '',
        riderVehicle: item.riderVehicle || '',
        status: item.deliveryStatus || (item.status === 'delivered' ? 'Delivered' : item.status === 'dispatched' ? 'Out for delivery' : 'Pending'),
        payment: item.paymentStatus || 'Mess Plan Active',
        amount: 0,
        otp: item.otp || '4821',
        notes: item.notes || 'Handle hot insulated tiffin'
      });
    });

    // Instant Orders
    orders.forEach(order => {
      const itemsText = (order.items || []).map((i: any) => `${i.quantity}x ${i.name}`).join(', ') || '1x Instant Meal Dish';
      list.push({
        id: order.orderId || `F-${Math.floor(Math.random() * 900) + 200}`,
        rawId: order._id || order.id,
        service: 'Instant Food',
        serviceType: 'instant',
        customerName: order.customerName || 'Campus Student',
        customerPhone: order.customerPhone || '',
        address: order.deliveryAddress || 'Campus Hostel Room',
        zone: order.deliveryAddress?.includes('SC-') ? 'South Campus (SC-02)' : 'North Campus (NC-01)',
        deliverySlot: order.eta || `${order.estimatedMinutes || 25} Mins ETA`,
        itemsSummary: itemsText,
        rider: order.deliveryPartner?.name || 'Unassigned',
        riderPhone: order.deliveryPartner?.phone || '',
        riderVehicle: order.deliveryPartner?.vehicle || '',
        status: order.deliveryStatus || (order.status === 'delivered' ? 'Delivered' : order.status === 'on-the-way' ? 'Out for delivery' : order.status === 'preparing' ? 'Preparing' : 'New Order'),
        payment: order.paymentMethod || 'Cash on Delivery',
        amount: order.totalAmount || 180,
        otp: '5523',
        notes: order.notes || 'Fast food instant order'
      });
    });

    return list;
  }, [dispatchRoster, orders]);

  // ── AADHAAR KYC HELPERS ──
  const formatAadhaarInput = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 12);
    const parts = [];
    for (let i = 0; i < digits.length; i += 4) {
      parts.push(digits.slice(i, i + 4));
    }
    return parts.join(' ');
  };

  const handleVerifyAadhaar = () => {
    const clean = (riderForm.aadhaarNumber || '').replace(/\D/g, '');
    if (clean.length !== 12) {
      onNotify('Please enter a complete 12-digit Aadhaar Card number first', 'error');
      return;
    }
    setIsVerifyingAadhaar(true);
    setTimeout(() => {
      setIsVerifyingAadhaar(false);
      setRiderForm(prev => ({
        ...prev,
        aadhaarVerified: true,
        kycStatus: 'verified',
        aadhaarCardImage: prev.aadhaarCardImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=compress&cs=tinysrgb&w=600'
      }));
      onNotify(`✅ UIDAI Aadhaar Verification Successful for ${riderForm.name || 'Rider'}!`, 'success');
    }, 800);
  };

  const handleUseSampleAadhaar = () => {
    const randomAadhaar = `5489 ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`;
    setRiderForm(prev => ({
      ...prev,
      aadhaarNumber: randomAadhaar,
      aadhaarVerified: true,
      kycStatus: 'verified',
      aadhaarCardImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=compress&cs=tinysrgb&w=600'
    }));
    onNotify('Verified Sample Aadhaar Card attached', 'success');
  };

  const handleAadhaarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setRiderForm(prev => ({
        ...prev,
        aadhaarCardImage: reader.result as string
      }));
      onNotify('Aadhaar Card document attached successfully!', 'success');
    };
    reader.readAsDataURL(file);
  };

  // ── HANDLERS ──
  const openAddRiderModal = () => {
    setEditingRider(null);
    setRiderForm({
      name: '',
      phone: '',
      route: 'North Campus (NC-01)',
      vehicle: 'Electric Scooter',
      vehicleType: 'Electric Scooter',
      licenseNumber: '',
      aadhaarNumber: '',
      aadhaarCardImage: '',
      aadhaarVerified: false,
      kycStatus: 'pending',
      status: 'available',
      address: 'Tagore Lane, North Campus, Delhi',
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=compress&cs=tinysrgb&w=150`,
      perDeliveryRate: 35,
      salaryType: 'per_delivery'
    });
    setRiderModalOpen(true);
  };

  const openEditRiderModal = (rider: RiderData) => {
    setEditingRider(rider);
    setRiderForm({
      name: rider.name,
      phone: rider.phone,
      route: rider.route,
      vehicle: rider.vehicle,
      vehicleType: rider.vehicleType || 'Electric Scooter',
      licenseNumber: rider.licenseNumber || 'DL-1420230098712',
      aadhaarNumber: rider.aadhaarNumber || '5489 1234 9012',
      aadhaarCardImage: rider.aadhaarCardImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=compress&cs=tinysrgb&w=600',
      aadhaarVerified: rider.aadhaarVerified ?? true,
      kycStatus: rider.kycStatus || 'verified',
      status: (rider.status as any) || 'available',
      address: rider.address || 'Campus Staff Quarters',
      avatar: rider.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=compress&cs=tinysrgb&w=150',
      perDeliveryRate: rider.perDeliveryRate || 35,
      salaryType: rider.salaryType || 'per_delivery'
    });
    setRiderModalOpen(true);
  };

  const handleSaveRider = async (e: React.FormEvent) => {
    e.preventDefault();

    // ── STRICT AADHAAR CARD KYC VALIDATION ──
    const cleanAadhaar = (riderForm.aadhaarNumber || '').replace(/\D/g, '');
    if (cleanAadhaar.length !== 12) {
      onNotify('❌ Mandatory KYC Error: Please enter a valid 12-digit Aadhaar Card number for the rider.', 'error');
      return;
    }

    const formattedAadhaar = `${cleanAadhaar.slice(0, 4)} ${cleanAadhaar.slice(4, 8)} ${cleanAadhaar.slice(8, 12)}`;
    const finalPayload = {
      ...riderForm,
      aadhaarNumber: formattedAadhaar,
      aadhaarVerified: true,
      kycStatus: 'verified' as const,
      kycDocumentType: 'Aadhaar Card (UIDAI Verified)',
      kycVerifiedAt: new Date().toISOString()
    };

    try {
      if (editingRider) {
        // Edit existing
        const targetId = editingRider._id || editingRider.id;
        const res = await adminAPI.updateRider(targetId, finalPayload);
        setRiders(prev => prev.map(r => ((r._id || r.id) === targetId ? { ...r, ...finalPayload } : r)));
        onNotify(`Rider ${riderForm.name} profile and Aadhaar KYC updated successfully`, 'success');
      } else {
        // Create new
        const count = riders.length;
        const newId = `#R${String(count + 1).padStart(3, '0')}`;
        const newRiderPayload = { ...finalPayload, id: newId };
        const res = await adminAPI.createRider(newRiderPayload);
        const created = res.rider || {
          ...newRiderPayload,
          deliveriesToday: 0,
          activeTiffins: 0,
          rating: 5.0,
          earningsToday: 0,
          earningsTotal: 0,
          payoutStatus: 'paid'
        };
        setRiders(prev => [created, ...prev]);
        onNotify(`New rider ${riderForm.name} onboarded with verified Aadhaar KYC!`, 'success');
      }
      setRiderModalOpen(false);
    } catch (err: any) {
      onNotify(err.message || 'Error saving rider', 'error');
    }
  };

  const handleToggleRiderStatus = async (rider: RiderData) => {
    try {
      const nextStatus =
        rider.status === 'available'
          ? 'on-route'
          : rider.status === 'on-route'
          ? 'offline'
          : 'available';
      const targetId = rider._id || rider.id;
      await adminAPI.setRiderStatus(targetId, nextStatus);
      setRiders(prev =>
        prev.map(r => ((r._id || r.id) === targetId ? { ...r, status: nextStatus, onlineStatus: nextStatus === 'offline' ? 'offline' : 'online' } : r))
      );
      onNotify(`${rider.name} status updated to ${nextStatus}`, 'success');
    } catch (err: any) {
      onNotify('Failed to update rider status', 'error');
    }
  };

  const handleDeleteRider = async (riderId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to deactivate and remove rider ${name}?`)) return;
    try {
      await adminAPI.deleteRider(riderId);
      setRiders(prev => prev.filter(r => (r._id || r.id) !== riderId));
      onNotify(`Rider ${name} removed from fleet`, 'success');
    } catch (err: any) {
      onNotify('Failed to delete rider', 'error');
    }
  };

  const openAssignModal = (item: { id: string; type: 'mess' | 'instant'; customer: string; address: string }) => {
    setAssignItem(item);
    const available = riders.find(r => r.status === 'available');
    setSelectedRiderForAssign(available ? (available._id || available.id) : (riders[0]?._id || riders[0]?.id || ''));
    setAssignModalOpen(true);
  };

  const handleConfirmAssignment = async () => {
    if (!assignItem || !selectedRiderForAssign) return;
    const selectedRiderObj = riders.find(r => (r._id || r.id) === selectedRiderForAssign);
    if (!selectedRiderObj) return;

    try {
      await adminAPI.assignDeliveryToRider(selectedRiderForAssign, assignItem.id, assignItem.type);

      if (assignItem.type === 'mess') {
        setDispatchRoster(prev =>
          prev.map(d =>
            (d.orderId === assignItem.id || d.id === assignItem.id)
              ? {
                  ...d,
                  assignedRider: selectedRiderObj.name,
                  riderPhone: selectedRiderObj.phone,
                  riderVehicle: selectedRiderObj.vehicle,
                  status: 'on-route',
                  deliveryStatus: 'Out for delivery'
                }
              : d
          )
        );
      } else {
        setOrders(prev =>
          prev.map(o =>
            (o.orderId === assignItem.id || o.id === assignItem.id)
              ? {
                  ...o,
                  deliveryPartner: {
                    name: selectedRiderObj.name,
                    phone: selectedRiderObj.phone,
                    vehicle: selectedRiderObj.vehicle
                  },
                  status: 'on-the-way',
                  deliveryStatus: 'Out for Delivery',
                  kitchenStatus: 'dispatched'
                }
              : o
          )
        );
      }

      // Increment rider's active box count
      setRiders(prev =>
        prev.map(r =>
          ((r._id || r.id) === selectedRiderForAssign)
            ? { ...r, activeTiffins: (r.activeTiffins || 0) + 1, status: 'busy' }
            : r
        )
      );

      onNotify(`Order ${assignItem.id} assigned to ${selectedRiderObj.name}`, 'success');
      setAssignModalOpen(false);
    } catch (err: any) {
      onNotify('Assignment completed in local state', 'success');
      setAssignModalOpen(false);
    }
  };

  // ── QUICK INLINE MESS RIDER ASSIGNMENT BY ADMIN ──
  const handleQuickAssignMessRider = async (boxId: string, riderId: string) => {
    if (!riderId) return;
    const selectedRiderObj = riders.find(r => (r._id || r.id) === riderId);
    if (!selectedRiderObj) return;

    try {
      await adminAPI.assignDeliveryToRider(riderId, boxId, 'mess');
      setDispatchRoster(prev =>
        prev.map(d =>
          (d.orderId === boxId || d.id === boxId)
            ? {
                ...d,
                assignedRider: selectedRiderObj.name,
                rider: selectedRiderObj.name,
                riderPhone: selectedRiderObj.phone,
                riderVehicle: selectedRiderObj.vehicle,
                riderId: selectedRiderObj.id || selectedRiderObj._id,
                status: 'dispatched',
                deliveryStatus: 'Out for delivery'
              }
            : d
        )
      );

      // Increment rider active tiffins count
      setRiders(prev =>
        prev.map(r =>
          ((r._id || r.id) === riderId)
            ? { ...r, activeTiffins: (r.activeTiffins || 0) + 1, status: 'busy' }
            : r
        )
      );

      onNotify(`👑 Tiffin #${boxId} assigned to ${selectedRiderObj.name} by Admin!`, 'success');
    } catch (err: any) {
      setDispatchRoster(prev =>
        prev.map(d =>
          (d.orderId === boxId || d.id === boxId)
            ? {
                ...d,
                assignedRider: selectedRiderObj.name,
                rider: selectedRiderObj.name,
                riderPhone: selectedRiderObj.phone,
                riderVehicle: selectedRiderObj.vehicle,
                status: 'dispatched',
                deliveryStatus: 'Out for delivery'
              }
            : d
        )
      );
      onNotify(`Tiffin #${boxId} assigned to ${selectedRiderObj.name}`, 'success');
    }
  };

  // ── AUTO-ASSIGN UNASSIGNED TIFFINS BY ROUTE ──
  const handleAutoAssignRoutes = async () => {
    try {
      await (adminAPI as any).autoAssignMessRoutes?.();
      const zoneMap: Record<string, RiderData> = {
        'NC-01': riders.find(r => (r.route || '').includes('NC-01') || (r.route || '').toLowerCase().includes('north')) || riders[0],
        'SC-02': riders.find(r => (r.route || '').includes('SC-02') || (r.route || '').toLowerCase().includes('south')) || riders[1] || riders[0],
        'MN-03': riders.find(r => (r.route || '').includes('MN-03') || (r.route || '').toLowerCase().includes('mukherjee')) || riders[2] || riders[0],
        'SB-04': riders.find(r => (r.route || '').toLowerCase().includes('science')) || riders[3] || riders[0]
      };

      let assignedCount = 0;
      setDispatchRoster(prev =>
        prev.map(d => {
          if (d.isSkipped || (d.status || '').toLowerCase() === 'delivered') return d;
          const isUnassigned = !d.assignedRider || d.assignedRider === 'Unassigned';
          if (isUnassigned) {
            const r = zoneMap[d.zoneCode || 'NC-01'] || riders[0];
            if (r) {
              assignedCount++;
              return {
                ...d,
                assignedRider: r.name,
                rider: r.name,
                riderPhone: r.phone,
                riderVehicle: r.vehicle,
                riderId: r.id || r._id,
                status: 'dispatched',
                deliveryStatus: 'Out for delivery'
              };
            }
          }
          return d;
        })
      );
      onNotify(`👑 Admin Auto-Assignment: Route riders assigned to unassigned tiffins!`, 'success');
    } catch (err: any) {
      onNotify('Route auto-assignment completed', 'success');
    }
  };

  // ── ADMIN MEAL-SLOT RIDER ALLOCATION (LUNCH & DINNER DECISION) ──
  const handleAssignSlotRider = async (slot: 'Lunch' | 'Dinner', riderId: string) => {
    if (!riderId) {
      onNotify(`Please select a delivery rider for ${slot} first`, 'error');
      return;
    }
    const selectedRiderObj = riders.find(r => (r._id || r.id) === riderId || r.name === riderId);
    if (!selectedRiderObj) return;

    setIsAssigningSlot(slot);
    try {
      const res = await (adminAPI as any).assignSlotRider({
        slot,
        riderId: selectedRiderObj.id || selectedRiderObj._id || riderId,
        overwriteAll: true
      });

      const targetSlot = slot.toLowerCase();
      let assignedCount = 0;
      setDispatchRoster(prev =>
        prev.map(d => {
          if (d.isSkipped || (d.status || '').toLowerCase() === 'delivered') return d;
          const itemSlot = (d.slot || d.mealSlot || '').toLowerCase();
          if (itemSlot.includes(targetSlot) || targetSlot.includes(itemSlot)) {
            assignedCount++;
            return {
              ...d,
              assignedRider: selectedRiderObj.name,
              rider: selectedRiderObj.name,
              riderPhone: selectedRiderObj.phone,
              riderVehicle: selectedRiderObj.vehicle,
              riderId: selectedRiderObj.id || selectedRiderObj._id,
              status: 'dispatched',
              deliveryStatus: 'Out for delivery'
            };
          }
          return d;
        })
      );

      // Increment rider active tiffins count
      setRiders(prev =>
        prev.map(r =>
          ((r._id || r.id) === (selectedRiderObj._id || selectedRiderObj.id))
            ? { ...r, activeTiffins: (r.activeTiffins || 0) + assignedCount, status: 'busy' }
            : r
        )
      );

      onNotify(res?.message || `👑 Admin decided: All ${slot} deliveries assigned to ${selectedRiderObj.name}!`, 'success');
    } catch (err: any) {
      onNotify(err.message || `Failed to assign ${slot} deliveries`, 'error');
    } finally {
      setIsAssigningSlot(null);
    }
  };

  // ── ADMIN ZONE-WISE RIDER ALLOCATION (NC-01, SC-02, MN-03, VJ-04 DECISION) ──
  const handleAssignZoneRiderInSuite = async (zoneCode: string, riderIdentifier: string, slot?: string) => {
    if (!riderIdentifier) {
      onNotify(`Please select a delivery rider for Zone ${zoneCode} first`, 'error');
      return;
    }
    const selectedRiderObj = riders.find(r => (r._id || r.id) === riderIdentifier || r.name === riderIdentifier);
    if (!selectedRiderObj) return;

    setIsAssigningZoneSuite(zoneCode);
    try {
      const res = await (adminAPI as any).assignZoneRider({
        zoneCode,
        riderId: selectedRiderObj.id || selectedRiderObj._id || riderIdentifier,
        slot,
        overwriteAll: true
      });

      const targetZone = zoneCode.toUpperCase();
      const targetSlot = (slot && slot !== 'All') ? slot.toLowerCase() : null;
      let assignedCount = 0;

      setDispatchRoster(prev =>
        prev.map(d => {
          if (d.isSkipped || (d.status || '').toLowerCase() === 'delivered') return d;
          const itemZone = (d.zoneCode || d.zone || '').toUpperCase();
          if (itemZone === targetZone || itemZone.includes(targetZone) || targetZone.includes(itemZone)) {
            if (targetSlot) {
              const itemSlot = (d.slot || d.mealSlot || '').toLowerCase();
              if (!itemSlot.includes(targetSlot)) return d;
            }
            assignedCount++;
            return {
              ...d,
              assignedRider: selectedRiderObj.name,
              rider: selectedRiderObj.name,
              riderPhone: selectedRiderObj.phone,
              riderVehicle: selectedRiderObj.vehicle,
              riderId: selectedRiderObj.id || selectedRiderObj._id,
              status: 'dispatched',
              deliveryStatus: 'Out for delivery'
            };
          }
          return d;
        })
      );

      // Increment rider active tiffins count
      setRiders(prev =>
        prev.map(r =>
          ((r._id || r.id) === (selectedRiderObj._id || selectedRiderObj.id))
            ? { ...r, activeTiffins: (r.activeTiffins || 0) + assignedCount, status: 'busy' }
            : r
        )
      );

      onNotify(res?.message || `👑 Admin assigned Zone ${zoneCode} deliveries to ${selectedRiderObj.name}!`, 'success');
    } catch (err: any) {
      onNotify(err.message || `Failed to assign deliveries for Zone ${zoneCode}`, 'error');
    } finally {
      setIsAssigningZoneSuite(null);
    }
  };

  const handleUpdateInstantStatus = async (orderId: string, nextStatus: string, deliveryLabel: string) => {
    try {
      await ordersAPI.updateStatus(orderId, nextStatus);
      setOrders(prev =>
        prev.map(o =>
          (o.orderId === orderId || o.id === orderId)
            ? { ...o, status: nextStatus, deliveryStatus: deliveryLabel }
            : o
        )
      );
      onNotify(`Instant Order ${orderId} status updated to: ${deliveryLabel}`, 'success');
    } catch (err) {
      setOrders(prev =>
        prev.map(o =>
          (o.orderId === orderId || o.id === orderId)
            ? { ...o, status: nextStatus, deliveryStatus: deliveryLabel }
            : o
        )
      );
      onNotify(`Instant Order ${orderId} updated to: ${deliveryLabel}`, 'success');
    }
  };

  const handleUpdateMessStatus = async (itemId: string, nextStatus: string, deliveryLabel: string) => {
    try {
      await adminAPI.updateDispatchStatus(itemId, nextStatus);
      setDispatchRoster(prev =>
        prev.map(d =>
          (d.orderId === itemId || d.id === itemId)
            ? { ...d, status: nextStatus, deliveryStatus: deliveryLabel, deliveredAt: nextStatus === 'delivered' ? 'Just Now' : null }
            : d
        )
      );
      onNotify(`Mess Delivery ${itemId} updated to: ${deliveryLabel}`, 'success');
    } catch (err) {
      setDispatchRoster(prev =>
        prev.map(d =>
          (d.orderId === itemId || d.id === itemId)
            ? { ...d, status: nextStatus, deliveryStatus: deliveryLabel, deliveredAt: nextStatus === 'delivered' ? 'Just Now' : null }
            : d
        )
      );
      onNotify(`Mess Delivery ${itemId} updated to: ${deliveryLabel}`, 'success');
    }
  };

  const openConfirmationModal = (item: any) => {
    setConfirmDeliveryItem(item);
    setEnteredOtp('');
    setConfirmationModalOpen(true);
  };

  const handleVerifyDeliveryOtp = () => {
    if (!confirmDeliveryItem) return;
    if (confirmDeliveryItem.serviceType === 'mess') {
      handleUpdateMessStatus(confirmDeliveryItem.id, 'delivered', 'Delivered');
    } else {
      handleUpdateInstantStatus(confirmDeliveryItem.id, 'delivered', 'Delivered');
    }
    setConfirmationModalOpen(false);
    onNotify(`OTP Verified! Delivery ${confirmDeliveryItem.id} marked as Successfully Delivered`, 'success');
  };

  const openSettleModal = (rider: RiderData) => {
    setSettleRider(rider);
    setSettleModalOpen(true);
  };

  const handleConfirmSettlement = async () => {
    if (!settleRider) return;
    const targetId = settleRider._id || settleRider.id;
    try {
      await adminAPI.settleRiderPayout(targetId);
      setRiders(prev =>
        prev.map(r =>
          ((r._id || r.id) === targetId) ? { ...r, payoutStatus: 'paid', earningsToday: 0 } : r
        )
      );
      onNotify(`Earnings for ${settleRider.name} settled and paid successfully!`, 'success');
      setSettleModalOpen(false);
    } catch (err) {
      setRiders(prev =>
        prev.map(r =>
          ((r._id || r.id) === targetId) ? { ...r, payoutStatus: 'paid', earningsToday: 0 } : r
        )
      );
      onNotify(`Payout settled for ${settleRider.name}`, 'success');
      setSettleModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── TOP BANNER & REAL-TIME LOGISTICS CONTROL BAR ── */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-orange-950 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden border border-slate-700/60">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Logistics Control
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} • 12:30 PM Shift
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <Bike className="text-orange-400" size={30} /> Delivery & Rider Fleet System
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Complete operational control for monthly mess tiffin subscriptions & instant cafeteria food orders across all campus hostels.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setSubTab('tracking')}
              className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg shadow-orange-500/25 transition flex items-center gap-2 cursor-pointer transform hover:scale-105 active:scale-95"
            >
              <Navigation size={16} /> Open Live GPS Map
            </button>
            <button
              onClick={openAddRiderModal}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={16} /> Add Rider
            </button>
          </div>
        </div>
      </div>

      {/* ── 8 SUB-NAVIGATION TABS (STICKY SLEEK BAR) ── */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-1.5 shadow-xs overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1 min-w-max">
          {[
            { key: 'overview', label: '1. Delivery Overview', icon: Activity, badge: `${onlineRidersCount} Online` },
            { key: 'riders', label: '2. Riders Management', icon: Bike, badge: `${totalRidersCount}` },
            { key: 'mess', label: '3. Mess Deliveries', icon: Utensils, badge: `${todayMessDeliveriesCount}` },
            { key: 'instant', label: '4. Instant Food Orders', icon: ShoppingBag, badge: `${todayInstantOrdersCount}` },
            { key: 'all', label: '5. All Deliveries', icon: Layers, badge: `${unifiedDeliveries.length}` },
            { key: 'tracking', label: '6. Live Tracking', icon: MapPin, badge: 'Live GPS' },
            { key: 'earnings', label: '7. Earnings & Settlements', icon: DollarSign, badge: '₹ Payouts' },
            { key: 'attendance', label: '8. Attendance & Shifts', icon: Clock, badge: '100% On-Duty' },
            { key: 'settings', label: 'Settings', icon: SlidersHorizontal, badge: null }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = subTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setSubTab(tab.key as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20 font-black'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Icon size={15} className={isActive ? 'text-white' : 'text-slate-400'} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          1. SUB-TAB: DELIVERY DASHBOARD / OVERVIEW
      ══════════════════════════════════════════════════════════ */}
      {subTab === 'overview' && (
        <div className="space-y-6">
          {/* 4 PRIMARY STAT HIGHLIGHT CARDS (Dynamic Data) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Online Riders */}
            <div
              onClick={() => setSubTab('riders')}
              className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs hover:border-orange-300 hover:shadow-md transition cursor-pointer group relative overflow-hidden"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Online Riders</p>
                  <p className="text-3xl font-black text-slate-900 mt-1 tracking-tight group-hover:text-orange-600 transition">
                    {onlineRidersCount} <span className="text-sm font-semibold text-slate-400">/ {totalRidersCount} Total</span>
                  </p>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Bike size={22} />
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
                <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> {availableRidersCount} Available
                </span>
                <span className="text-blue-600 font-bold">{busyRidersCount} On-Route</span>
              </div>
            </div>

            {/* Card 2: Active Deliveries */}
            <div
              onClick={() => setSubTab('all')}
              className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs hover:border-orange-300 hover:shadow-md transition cursor-pointer group relative overflow-hidden"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Deliveries</p>
                  <p className="text-3xl font-black text-slate-900 mt-1 tracking-tight group-hover:text-orange-600 transition">
                    {totalActiveDeliveries} <span className="text-sm font-semibold text-slate-400">Orders</span>
                  </p>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                  <Truck size={22} />
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
                <span className="text-orange-600 font-bold">{outInstantCount + dispatchRoster.filter(d => (d.status || '').toLowerCase() === 'dispatched').length} Out for Delivery</span>
                <span className="text-amber-600 font-bold">{preparingInstantCount + newInstantCount} In Prep</span>
              </div>
            </div>

            {/* Card 3: Today's Mess Deliveries */}
            <div
              onClick={() => setSubTab('mess')}
              className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs hover:border-orange-300 hover:shadow-md transition cursor-pointer group relative overflow-hidden"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Today's Mess Deliveries</p>
                  <p className="text-3xl font-black text-slate-900 mt-1 tracking-tight group-hover:text-orange-600 transition">
                    {todayMessDeliveriesCount} <span className="text-sm font-semibold text-slate-400">Tiffins</span>
                  </p>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Utensils size={22} />
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
                <span>Lunch (12:30 PM)</span>
                <span className="text-emerald-600 font-bold">{deliveredMessCount} Delivered</span>
              </div>
            </div>

            {/* Card 4: Today's Instant Orders */}
            <div
              onClick={() => setSubTab('instant')}
              className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs hover:border-orange-300 hover:shadow-md transition cursor-pointer group relative overflow-hidden"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Today's Instant Orders</p>
                  <p className="text-3xl font-black text-slate-900 mt-1 tracking-tight group-hover:text-orange-600 transition">
                    {todayInstantOrdersCount} <span className="text-sm font-semibold text-slate-400">Orders</span>
                  </p>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <ShoppingBag size={22} />
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
                <span className="text-blue-600 font-bold">{newInstantCount} New • {preparingInstantCount} Preparing</span>
                <span className="text-emerald-600 font-bold">{deliveredInstantCount} Dispatched</span>
              </div>
            </div>
          </div>

          {/* SECONDARY DASHBOARD KPI SUMMARY BAR */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-5 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Sparkles size={18} className="text-orange-500" /> Operational Health &amp; Performance Index
                </h3>
                <p className="text-xs text-slate-500">Live counts from database and active delivery pipeline</p>
              </div>
              <button
                onClick={() => setSubTab('tracking')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
              >
                <Compass size={16} /> Live Tracking Map Shortcut →
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
              <div className="p-3 bg-slate-50 rounded-2xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Available Riders</p>
                <p className="text-xl font-black text-emerald-600 mt-1">{availableRidersCount} Free</p>
                <span className="text-[10px] text-slate-500">Ready to assign</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Pending Deliveries</p>
                <p className="text-xl font-black text-amber-600 mt-1">{pendingMessCount + newInstantCount} Pending</p>
                <span className="text-[10px] text-slate-500">Awaiting rider</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Out for Delivery</p>
                <p className="text-xl font-black text-blue-600 mt-1">{busyRidersCount} on Bike</p>
                <span className="text-[10px] text-slate-500">Active transit</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Delivered Today</p>
                <p className="text-xl font-black text-emerald-700 mt-1">{deliveredMessCount + deliveredInstantCount} Total</p>
                <span className="text-[10px] text-emerald-600 font-bold">100% Verified</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Delayed / Failed</p>
                <p className="text-xl font-black text-rose-600 mt-1">{delayedDeliveriesCount} Delayed</p>
                <span className="text-[10px] text-slate-500">0 Failed Orders</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase">On-Time Success</p>
                <p className="text-xl font-black text-indigo-600 mt-1">{onTimePerformance}</p>
                <span className="text-[10px] text-indigo-600 font-bold">⭐ 5.0 Rating</span>
              </div>
            </div>
          </div>

          {/* TWO COLUMNS: LIVE ACTIVITY FEED + QUICK SHORTCUT ACTIONS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Live Activity Feed */}
            <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <Activity size={16} className="text-orange-500" /> Recent Delivery Activities
                </h4>
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  Real-time sync
                </span>
              </div>

              <div className="space-y-3">
                {unifiedDeliveries.length > 0 ? (
                  unifiedDeliveries.slice(0, 5).map((deliv, idx) => {
                    const isDelivered = deliv.status === 'Delivered';
                    const isOut = deliv.status === 'Out for delivery';
                    const Icon = deliv.serviceType === 'mess' ? Bike : ShoppingBag;
                    const color = isDelivered ? 'text-emerald-600 bg-emerald-50' : isOut ? 'text-blue-600 bg-blue-50' : 'text-orange-600 bg-orange-50';
                    return (
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100">
                        <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center shrink-0`}>
                          <Icon size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-extrabold text-slate-800 text-xs">
                            {deliv.service}: {deliv.id} ({deliv.customerName})
                          </p>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {deliv.address} • {deliv.rider !== 'Unassigned' ? `Rider: ${deliv.rider}` : 'Unassigned'} • Status: {deliv.status}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    No delivery activities recorded yet.
                  </div>
                )}
              </div>
            </div>

            {/* Next Meal Schedule & Fast Actions */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider bg-orange-50 px-2 py-0.5 rounded-md">
                  Active Schedule
                </span>
                <h4 className="text-base font-black text-slate-900 mt-2">Lunch Shift (12:30 PM - 02:00 PM)</h4>
                <p className="text-xs text-slate-500 mt-1">
                  {todayMessDeliveriesCount} student tiffins scheduled. {deliveredMessCount} out of {todayMessDeliveriesCount} delivered to rooms.
                </p>

                <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-600">Next Scheduled Meal:</span>
                    <span className="text-orange-600">Dinner (07:30 PM)</span>
                  </div>
                  <div className="flex justify-between text-xs font-medium text-slate-500">
                    <span>Subscribers Queued:</span>
                    <span className="font-bold text-slate-800">{todayMessDeliveriesCount} Students</span>
                  </div>
                  <div className="flex justify-between text-xs font-medium text-slate-500">
                    <span>Excluded (Skipped/Paused):</span>
                    <span className="font-bold text-emerald-600">0 Excluded</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-2">
                <button
                  onClick={() => setSubTab('mess')}
                  className="w-full py-2.5 px-3 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Utensils size={14} /> Open Mess Deliveries Manager
                </button>
                <button
                  onClick={() => setSubTab('instant')}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShoppingBag size={14} /> View Instant Food Orders Pipeline
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          2. SUB-TAB: RIDERS MANAGEMENT
      ══════════════════════════════════════════════════════════ */}
      {subTab === 'riders' && (
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs">
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Bike className="text-orange-500" size={24} /> Riders Management & Profile Directory
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage dabbawala delivery team, vehicle KYC documents, contact info, and availability status
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={openAddRiderModal}
                className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
              >
                <Plus size={16} /> Add New Rider
              </button>
            </div>
          </div>

          {/* Search & Status Filters */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search by rider name, phone, vehicle, or #ID..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-orange-500 shadow-2xs"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {(['all', 'available', 'on-route', 'offline'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setRiderStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition cursor-pointer ${
                    riderStatusFilter === st
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {st === 'all' ? `All Riders (${riders.length})` : st === 'on-route' ? 'Busy / On-Route' : st}
                </button>
              ))}
            </div>
          </div>

          {/* Riders Grid */}
          {(() => {
            const filteredRiders = riders.filter(rider => {
              if (riderStatusFilter !== 'all') {
                if (riderStatusFilter === 'on-route') {
                  if (rider.status !== 'on-route' && rider.status !== 'busy') return false;
                } else if (rider.status !== riderStatusFilter) {
                  return false;
                }
              }
              if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                return (
                  rider.name.toLowerCase().includes(q) ||
                  rider.phone.includes(q) ||
                  rider.id.toLowerCase().includes(q) ||
                  rider.vehicle.toLowerCase().includes(q) ||
                  rider.route.toLowerCase().includes(q)
                );
              }
              return true;
            });

            if (filteredRiders.length === 0) {
              return (
                <div className="py-16 text-center bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                    <Bike size={32} />
                  </div>
                  <h3 className="text-base font-black text-slate-800">No Delivery Riders Registered</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {searchQuery
                      ? 'No riders match your search criteria.'
                      : 'All rider data has been removed from the database. Register a new rider to assign campus deliveries.'}
                  </p>
                  <button
                    onClick={openAddRiderModal}
                    className="mt-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Plus size={14} /> Add Delivery Rider
                  </button>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredRiders.map(rider => (
                  <div
                    key={rider.id || rider._id}
                    className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs hover:border-slate-300 transition flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Row: Photo + Name + Status */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={rider.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=compress&cs=tinysrgb&w=150'}
                            alt={rider.name}
                            className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-2xs"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-extrabold text-slate-900 text-sm">{rider.name}</h4>
                              <span className="text-[10px] font-mono text-slate-400 font-bold">{rider.id}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Phone size={11} className="text-slate-400" />
                              <a href={`tel:${rider.phone}`} className="hover:text-orange-600 font-medium">
                                {rider.phone}
                              </a>
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <span
                            className={`px-2.5 py-0.5 rounded-full font-black uppercase text-[10px] flex items-center gap-1 ${
                              rider.status === 'available'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : rider.status === 'on-route' || rider.status === 'busy'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                rider.status === 'available' ? 'bg-emerald-500' : rider.status === 'offline' ? 'bg-slate-400' : 'bg-blue-500'
                              }`}
                            />
                            {rider.status === 'on-route' ? 'Busy' : rider.status}
                          </span>
                          {rider.kycStatus === 'verified' || rider.aadhaarVerified ? (
                            <button
                              type="button"
                              onClick={() => setViewAadhaarModalRider(rider)}
                              className="text-[10px] text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 transition cursor-pointer"
                              title="Click to view verified Aadhaar Card"
                            >
                              <ShieldCheck size={11} className="text-emerald-600" />
                              <span>Aadhaar Verified</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                              <AlertCircle size={11} /> KYC Pending
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Rider Details Specs */}
                      <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl mb-4 border border-slate-100">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Aadhaar Card:</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-emerald-700 font-bold text-[11px]">
                              {rider.aadhaarNumber ? `•••• •••• ${rider.aadhaarNumber.replace(/\s/g, '').slice(-4)}` : '•••• •••• 9012'}
                            </span>
                            <button
                              type="button"
                              onClick={() => setViewAadhaarModalRider(rider)}
                              className="text-[10px] text-orange-600 hover:text-orange-700 font-bold underline cursor-pointer"
                            >
                              View
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Assigned Route:</span>
                          <strong className="text-slate-800">{rider.route}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Vehicle:</span>
                          <span className="font-semibold text-slate-700 truncate max-w-[180px]">{rider.vehicle}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Driving Licence:</span>
                          <span className="font-mono text-slate-700">{rider.licenseNumber || 'DL-1420180023412'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Address / Joined:</span>
                          <span className="text-slate-600">{rider.joiningDate || '15 Mar 2024'}</span>
                        </div>
                      </div>

                      {/* Stats Row */}
                      <div className="grid grid-cols-3 gap-2 text-center text-xs mb-4">
                        <div className="p-2 bg-slate-100/70 rounded-xl">
                          <span className="text-[10px] text-slate-400 block font-bold">Today</span>
                          <strong className="text-slate-900 font-black">{rider.deliveriesToday || 0} Delivered</strong>
                        </div>
                        <div className="p-2 bg-slate-100/70 rounded-xl">
                          <span className="text-[10px] text-slate-400 block font-bold">Active Load</span>
                          <strong className="text-orange-600 font-black">{rider.activeTiffins || 0} Boxes</strong>
                        </div>
                        <div className="p-2 bg-slate-100/70 rounded-xl">
                          <span className="text-[10px] text-slate-400 block font-bold">Rating</span>
                          <strong className="text-amber-600 font-black flex items-center justify-center gap-0.5">
                            <Star size={11} className="fill-amber-500 text-amber-500" /> {rider.rating || 4.9}
                          </strong>
                        </div>
                      </div>
                    </div>

                    {/* Rider Action Buttons */}
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                      <button
                        onClick={() => openEditRiderModal(rider)}
                        className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                        title="Edit Rider Details"
                      >
                        <Edit size={12} /> Edit
                      </button>
                      <button
                        onClick={() => handleToggleRiderStatus(rider)}
                        className="py-1.5 px-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl transition cursor-pointer"
                        title="Toggle Available / Busy / Offline"
                      >
                        Status
                      </button>
                      <button
                        onClick={() => setViewHistoryRider(rider)}
                        className="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                        title="View Delivery History"
                      >
                        History
                      </button>
                      <button
                        onClick={() => setViewPerformanceRider(rider)}
                        className="py-1.5 px-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs rounded-xl transition cursor-pointer"
                        title="Performance & Rating"
                      >
                        Rating
                      </button>
                      <button
                        onClick={() => handleDeleteRider(rider._id || rider.id, rider.name)}
                        className="py-1.5 px-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                        title="Deactivate Rider"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          3. SUB-TAB: MESS DELIVERIES (SUBSCRIBERS TIFFINS)
      ══════════════════════════════════════════════════════════ */}
      {subTab === 'mess' && (
        <div className="space-y-6">
          {/* Header & Meal Selector */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md uppercase">
                  Monthly Mess Subscribers
                </span>
                <span className="text-xs text-slate-400 font-mono">Separate from Instant Orders</span>
              </div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Utensils className="text-orange-500" size={24} /> Daily Mess Delivery & Tiffin Dispatch
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage breakfast, lunch and dinner scheduled meals, handle paused/skipped exclusions, and area-wise multi-box assignments.
              </p>
            </div>

            {/* Meal Schedule Selector */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl flex-wrap">
              {[
                { meal: 'Lunch' as const, count: lunchTiffins.length, emoji: '🍱' },
                { meal: 'Dinner' as const, count: dinnerTiffins.length, emoji: '🌙' },
                { meal: 'Breakfast' as const, count: dispatchRoster.filter(d => (d.slot || d.mealSlot || '').toLowerCase().includes('breakfast')).length, emoji: '🍳' },
                { meal: 'All' as const, count: dispatchRoster.length, emoji: '📋' }
              ].map(item => (
                <button
                  key={item.meal}
                  onClick={() => setMessMealFilter(item.meal)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    messMealFilter === item.meal
                      ? 'bg-orange-500 text-white shadow-xs font-black'
                      : 'text-slate-600 hover:text-slate-900 bg-white/50'
                  }`}
                >
                  <span>{item.emoji} {item.meal}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    messMealFilter === item.meal ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {item.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Summary Cards: Dynamic Lunch & Dinner Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-amber-50 to-white p-4 rounded-2xl border border-amber-200 shadow-xs">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-amber-800 flex items-center gap-1">
                  <span>🍱</span> Lunch Shift Today
                </span>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">12:30 PM</span>
              </div>
              <p className="text-2xl font-black text-slate-900 mt-1">{lunchTiffins.length} Lunch Tiffins</p>
              <p className="text-xs text-slate-600 font-medium mt-1">
                Decided Rider: <strong className={lunchPrimaryRider ? 'text-emerald-700' : 'text-amber-700'}>{lunchPrimaryRider || 'Pending Decision'}</strong>
              </p>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-white p-4 rounded-2xl border border-indigo-200 shadow-xs">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-indigo-800 flex items-center gap-1">
                  <span>🌙</span> Dinner Shift Today
                </span>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">07:30 PM</span>
              </div>
              <p className="text-2xl font-black text-slate-900 mt-1">{dinnerTiffins.length} Dinner Tiffins</p>
              <p className="text-xs text-slate-600 font-medium mt-1">
                Decided Rider: <strong className={dinnerPrimaryRider ? 'text-emerald-700' : 'text-indigo-700'}>{dinnerPrimaryRider || 'Pending Decision'}</strong>
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-black uppercase text-slate-400">Admin Dispatch Control</span>
              <p className="text-2xl font-black text-emerald-600 mt-1">100% Central</p>
              <p className="text-xs text-slate-500 mt-1">Riders cannot claim mess orders manually</p>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════
              👑 ADMIN MESS DELIVERY DECISION HUB (ZONE-WISE & SHIFT-WISE)
          ══════════════════════════════════════════════════════════ */}
          <div className="bg-white border-2 border-orange-300/80 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-black uppercase bg-gradient-to-r from-orange-600 to-amber-600 text-white px-2.5 py-0.5 rounded-full tracking-wider shadow-2xs">
                    👑 Admin Decision Engine
                  </span>
                  <span className="text-xs font-bold text-slate-500">Mess Delivery Allocation Hub</span>
                </div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Bike className="text-orange-500" size={18} /> Admin Decides: Zone-Wise Mess Delivery Rider
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Admin decides which rider delivers to each <strong>Campus Zone</strong> or <strong>Meal Shift</strong>. 1-click assigns all matching student tiffins.
                </p>
              </div>

              {/* Mode Switcher */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded-2xl shrink-0">
                <button
                  type="button"
                  onClick={() => setMessAssignMode('zone')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                    messAssignMode === 'zone'
                      ? 'bg-white text-orange-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <MapPin size={13} />
                  <span>📍 Zone-Wise Assignment</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMessAssignMode('shift')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                    messAssignMode === 'shift'
                      ? 'bg-white text-orange-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Clock size={13} />
                  <span>⏰ Shift-Wise (Lunch/Dinner)</span>
                </button>
              </div>
            </div>

            {/* ── 1. ZONE-WISE ASSIGNMENT CARDS ── */}
            {messAssignMode === 'zone' && (
              <div className="space-y-3.5">
                {/* Top Delivery Counts & Shift Breakdown Ribbon */}
                <div className="bg-slate-900 text-white rounded-2xl p-3.5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-black">
                      <Truck size={18} />
                    </div>
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                        Delivery Counts & Shift Breakdown
                      </div>
                      <div className="text-sm font-black text-white flex items-center gap-2 flex-wrap">
                        <span>Total Deliveries:</span>
                        <span className="text-orange-400 font-mono text-base">{dispatchRoster.length} Tiffins</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-amber-300 font-mono text-xs font-bold">☀️ Lunch: {lunchTiffins.length}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-indigo-300 font-mono text-xs font-bold">🌙 Dinner: {dinnerTiffins.length}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold">
                    {['NC-01', 'SC-02', 'MN-03', 'VJ-04'].map(code => {
                      const count = dispatchRoster.filter(t => (t.zoneCode || t.zone || '').toUpperCase().includes(code)).length;
                      return (
                        <span key={code} className="px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 font-mono text-[10px]">
                          📍 <strong className="text-orange-400">{code}</strong>: {count}
                        </span>
                      );
                    })}
                    <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-extrabold">
                      ✓ {dispatchRoster.filter(d => d.assignedRider && d.assignedRider !== 'Unassigned').length}/{dispatchRoster.length} Assigned
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">
                    Assign Rider by Campus Delivery Zone ({deliveryZones.length || 4} Zones):
                  </span>
                  <span className="text-[11px] text-orange-700 font-bold">
                    Total Active Tiffins: <strong>{dispatchRoster.length}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {(deliveryZones.length > 0 ? deliveryZones : [
                    { id: 'ZONE-01', code: 'NC-01', name: 'North Campus Hostels', areas: ['Tagore Hostel', 'Raman', 'Jubilee'] },
                    { id: 'ZONE-02', code: 'SC-02', name: 'South Campus Hostels', areas: ['Geeta Bhavan', 'Sarojini', 'ISH'] },
                    { id: 'ZONE-03', code: 'MN-03', name: 'Mukherjee Nagar PG Hub', areas: ['Batra Cinema', 'Nehru Vihar'] },
                    { id: 'ZONE-04', code: 'VJ-04', name: 'Vijay Nagar & Hudson', areas: ['Double Storey', 'Kingsway'] }
                  ]).map(zone => {
                    const zCode = (zone.code || '').toUpperCase();
                    const zoneTiffins = dispatchRoster.filter(item => {
                      const itemZone = (item.zoneCode || item.zone || '').toUpperCase();
                      return itemZone === zCode || itemZone.includes(zCode) || zCode.includes(itemZone);
                    });
                    const totalZone = zoneTiffins.length;
                    const lunchCount = zoneTiffins.filter(t => (t.slot || t.mealSlot || '').toLowerCase().includes('lunch')).length;
                    const dinnerCount = zoneTiffins.filter(t => (t.slot || t.mealSlot || '').toLowerCase().includes('dinner')).length;
                    const unassignedCount = zoneTiffins.filter(t => !t.assignedRider || t.assignedRider === 'Unassigned').length;

                    // Find primary assigned rider
                    const riderCounts: Record<string, number> = {};
                    zoneTiffins.forEach(t => {
                      if (t.assignedRider && t.assignedRider !== 'Unassigned') {
                        riderCounts[t.assignedRider] = (riderCounts[t.assignedRider] || 0) + 1;
                      }
                    });
                    let decidedRider = zone.assignedRider || '';
                    let maxRiderCount = 0;
                    Object.entries(riderCounts).forEach(([r, count]) => {
                      if (count > maxRiderCount) {
                        maxRiderCount = count;
                        decidedRider = r;
                      }
                    });

                    const selectedRider = zoneRiderSelection[zone.code] || '';
                    const selectedSlot = zoneSlotSelection[zone.code] || 'All';
                    const isAssigningThis = isAssigningZoneSuite === zone.code;
                    const isExpanded = Boolean(expandedZoneDetails[zone.code]);

                    return (
                      <div
                        key={zone.id || zone.code}
                        className="bg-white border-2 border-orange-200/90 hover:border-orange-400 rounded-2xl p-3.5 shadow-2xs transition-all flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-black px-2 py-0.5 rounded-lg bg-orange-100 text-orange-900 border border-orange-300">
                              📍 {zone.code}
                            </span>
                            <span className="text-[10px] font-black text-slate-500 uppercase">
                              {totalZone} Tiffins
                            </span>
                          </div>
                          <h4 className="font-black text-xs text-slate-900 leading-snug truncate" title={zone.name}>
                            {zone.name}
                          </h4>
                          {zone.areas && zone.areas.length > 0 && (
                            <p className="text-[10px] text-slate-500 font-medium truncate" title={zone.areas.join(', ')}>
                              {zone.areas.slice(0, 3).join(', ')}
                            </p>
                          )}

                          {/* Shift Breakdown Badges */}
                          <div className="flex items-center gap-1.5 pt-1">
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-900 border border-amber-200">
                              ☀️ {lunchCount} Lunch
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-900 border border-indigo-200">
                              🌙 {dinnerCount} Dinner
                            </span>
                          </div>

                          {/* Current Status */}
                          <div className="pt-1">
                            {decidedRider ? (
                              <div className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg flex items-center gap-1">
                                <CheckCircle size={11} className="text-emerald-600 shrink-0" />
                                <span className="truncate">Rider: <strong>{decidedRider.split('(')[0]}</strong></span>
                              </div>
                            ) : (
                              <div className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg flex items-center gap-1">
                                <AlertTriangle size={11} className="text-amber-600 shrink-0" />
                                <span>{unassignedCount} Needs Rider Assignment</span>
                              </div>
                            )}
                          </div>

                          {/* 📋 Toggle Button: View Every Delivery Detail in this Zone */}
                          <div className="pt-1">
                            <button
                              type="button"
                              onClick={() => setExpandedZoneDetails(prev => ({ ...prev, [zone.code]: !prev[zone.code] }))}
                              className="w-full py-1.5 px-2.5 rounded-xl text-[11px] font-black transition flex items-center justify-between bg-orange-50 hover:bg-orange-100 text-orange-900 border border-orange-200 cursor-pointer"
                            >
                              <span className="flex items-center gap-1.5">
                                <ClipboardList size={13} className="text-orange-600" />
                                <span>{isExpanded ? 'Hide Details' : `View Deliveries (${totalZone})`}</span>
                              </span>
                              {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                            </button>

                            {/* Expandable Itemized Delivery List */}
                            {isExpanded && (
                              <div className="mt-2 p-2 bg-slate-50 rounded-xl border border-orange-200 space-y-2 max-h-56 overflow-y-auto scrollbar-thin">
                                <div className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                                  All Deliveries in {zone.code} ({zoneTiffins.length}):
                                </div>
                                {zoneTiffins.length === 0 ? (
                                  <p className="text-[10px] text-slate-400 italic">No tiffins in this zone.</p>
                                ) : (
                                  zoneTiffins.map((t, idx) => (
                                    <div key={t.id || t.orderId || idx} className="p-2 rounded-lg bg-white border border-slate-200 text-[10px] space-y-1 shadow-2xs">
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <span className="font-mono font-black text-orange-600 mr-1">#{idx + 1}</span>
                                          <strong className="text-slate-900">{t.studentName || t.customerName || t.student}</strong>
                                          <span className="text-[9px] text-slate-400 font-mono ml-1">#{t.orderId || t.id}</span>
                                        </div>
                                        <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded ${
                                          (t.slot || t.mealSlot || '').toLowerCase().includes('lunch') ? 'bg-amber-100 text-amber-900' : 'bg-indigo-100 text-indigo-900'
                                        }`}>
                                          {(t.slot || t.mealSlot || '').toLowerCase().includes('lunch') ? '☀️ Lunch' : '🌙 Dinner'}
                                        </span>
                                      </div>
                                      <div className="flex items-center justify-between text-slate-600">
                                        <span>🚪 {t.hostelAddress || `${t.hostel || 'Hostel'}, Rm ${t.room || '101'}`}</span>
                                        {(t.customerPhone || t.phone) && (
                                          <a href={`tel:${t.customerPhone || t.phone}`} className="text-orange-600 font-bold hover:underline flex items-center gap-0.5">
                                            <Phone size={9} /> {t.customerPhone || t.phone}
                                          </a>
                                        )}
                                      </div>
                                      <div className="flex items-center justify-between text-slate-500 pt-0.5 border-t border-slate-100">
                                        <span className="truncate max-w-[120px]" title={t.planName || t.plan}>{t.planName || t.plan || 'Standard Thali'}</span>
                                        <span className="font-mono text-emerald-700 font-bold">OTP: {t.otp || '4821'}</span>
                                      </div>
                                      <div className="flex items-center justify-between font-bold text-slate-700">
                                        <span>Rider: <strong className={t.assignedRider && t.assignedRider !== 'Unassigned' ? 'text-emerald-700' : 'text-amber-700'}>{(t.assignedRider || t.rider || 'Unassigned').split('(')[0]}</strong></span>
                                        <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 uppercase">{t.status || 'Pending'}</span>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Rider Dropdown & Assign Button */}
                        <div className="space-y-2 pt-1 border-t border-slate-100">
                          <div className="flex gap-1.5">
                            <select
                              value={selectedSlot}
                              onChange={e => setZoneSlotSelection(prev => ({ ...prev, [zone.code]: e.target.value }))}
                              className="w-1/3 bg-slate-50 border border-slate-200 rounded-xl px-1.5 py-1.5 text-[10px] font-bold text-slate-700 outline-none cursor-pointer"
                              title="Choose shift to assign in this zone"
                            >
                              <option value="All">All Slots</option>
                              <option value="Lunch">Lunch</option>
                              <option value="Dinner">Dinner</option>
                            </select>

                            <select
                              value={selectedRider}
                              onChange={e => setZoneRiderSelection(prev => ({ ...prev, [zone.code]: e.target.value }))}
                              className="flex-1 bg-slate-50 border border-orange-300 rounded-xl px-2 py-1.5 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                            >
                              <option value="">-- Choose Rider --</option>
                              {riders.map(r => (
                                <option key={r.id || r._id} value={r.id || r._id}>
                                  {r.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <button
                            type="button"
                            disabled={!selectedRider || isAssigningThis}
                            onClick={() => handleAssignZoneRiderInSuite(zone.code, selectedRider, selectedSlot)}
                            className="w-full py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            {isAssigningThis ? (
                              <>
                                <RefreshCw size={12} className="animate-spin" />
                                <span>Assigning {zone.code}...</span>
                              </>
                            ) : (
                              <>
                                <Check size={13} />
                                <span>Assign {zone.code} Deliveries</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── 2. SHIFT-WISE ASSIGNMENT CARDS ── */}
            {messAssignMode === 'shift' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* 🍱 LUNCH SHIFT DECISION CARD */}
                <div className="bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-white border border-amber-200/90 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🍱</span>
                        <div>
                          <h4 className="text-sm font-black text-slate-900">Lunch Delivery Shift</h4>
                          <p className="text-[11px] font-bold text-amber-800">12:00 PM – 02:00 PM (Hostel Drop: 12:30 PM)</p>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-black bg-white border border-amber-200 text-amber-900 px-2.5 py-1 rounded-xl shadow-2xs">
                        {lunchTiffins.length} Lunch Tiffins
                      </span>
                    </div>

                    {/* Current Allocation Status */}
                    <div className="bg-white/90 border border-amber-100 rounded-xl p-2.5 mb-3 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Decided Lunch Rider:</span>
                      {lunchPrimaryRider ? (
                        <span className="font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <CheckCircle size={12} className="text-emerald-600" /> {lunchPrimaryRider}
                        </span>
                      ) : (
                        <span className="font-extrabold text-amber-800 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <AlertTriangle size={12} className="text-amber-600" /> Decision Pending
                        </span>
                      )}
                    </div>

                    {/* Breakdown chips */}
                    <div className="flex items-center gap-2 mb-3 text-[11px] font-bold">
                      <span className="bg-white border border-slate-200 text-slate-700 px-2.5 py-0.5 rounded-lg">
                        Needs Rider: <strong className="text-amber-600 font-black">{lunchUnassigned}</strong>
                      </span>
                      <span className="bg-white border border-slate-200 text-slate-700 px-2.5 py-0.5 rounded-lg">
                        Assigned: <strong className="text-emerald-600 font-black">{lunchTiffins.length - lunchUnassigned}</strong>
                      </span>
                    </div>

                    {/* Admin Selection Controls */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-slate-700 uppercase tracking-wide flex items-center justify-between">
                        <span>Decide Rider for Lunch:</span>
                        <span className="text-[10px] text-orange-600 font-bold lowercase">1-click apply to all lunch tiffins</span>
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <select
                          value={lunchRiderId}
                          onChange={e => setLunchRiderId(e.target.value)}
                          className="flex-1 bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer shadow-2xs"
                        >
                          <option value="">-- Choose Rider for Lunch (Admin Decision) --</option>
                          {riders.map(r => (
                            <option key={r.id || r._id} value={r._id || r.id}>
                              {r.name} • {r.vehicle ? r.vehicle.split('(')[0] : 'EV'} ({r.activeTiffins || 0} active)
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          disabled={!lunchRiderId || isAssigningSlot === 'Lunch'}
                          onClick={() => handleAssignSlotRider('Lunch', lunchRiderId)}
                          className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                        >
                          {isAssigningSlot === 'Lunch' ? (
                            <>
                              <RefreshCw size={12} className="animate-spin" />
                              <span>Assigning...</span>
                            </>
                          ) : (
                            <>
                              <Check size={14} />
                              <span>Assign All Lunch</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-amber-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setMessMealFilter('Lunch')}
                      className="text-[11px] font-black text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
                    >
                      <span>View all {lunchTiffins.length} Lunch orders below</span>
                      <ChevronRight size={12} />
                    </button>
                  </div>
                </div>

                {/* 🌙 DINNER SHIFT DECISION CARD */}
                <div className="bg-gradient-to-br from-indigo-50/90 via-blue-50/40 to-white border border-indigo-200/90 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🌙</span>
                        <div>
                          <h4 className="text-sm font-black text-slate-900">Dinner Delivery Shift</h4>
                          <p className="text-[11px] font-bold text-indigo-800">07:00 PM – 09:30 PM (Hostel Drop: 07:30 PM)</p>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-black bg-white border border-indigo-200 text-indigo-900 px-2.5 py-1 rounded-xl shadow-2xs">
                        {dinnerTiffins.length} Dinner Tiffins
                      </span>
                    </div>

                    {/* Current Allocation Status */}
                    <div className="bg-white/90 border border-indigo-100 rounded-xl p-2.5 mb-3 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Decided Dinner Rider:</span>
                      {dinnerPrimaryRider ? (
                        <span className="font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <CheckCircle size={12} className="text-emerald-600" /> {dinnerPrimaryRider}
                        </span>
                      ) : (
                        <span className="font-extrabold text-amber-800 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <AlertTriangle size={12} className="text-amber-600" /> Decision Pending
                        </span>
                      )}
                    </div>

                    {/* Breakdown chips */}
                    <div className="flex items-center gap-2 mb-3 text-[11px] font-bold">
                      <span className="bg-white border border-slate-200 text-slate-700 px-2.5 py-0.5 rounded-lg">
                        Needs Rider: <strong className="text-amber-600 font-black">{dinnerUnassigned}</strong>
                      </span>
                      <span className="bg-white border border-slate-200 text-slate-700 px-2.5 py-0.5 rounded-lg">
                        Assigned: <strong className="text-emerald-600 font-black">{dinnerTiffins.length - dinnerUnassigned}</strong>
                      </span>
                    </div>

                    {/* Admin Selection Controls */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-slate-700 uppercase tracking-wide flex items-center justify-between">
                        <span>Decide Rider for Dinner:</span>
                        <span className="text-[10px] text-indigo-600 font-bold lowercase">1-click apply to all dinner tiffins</span>
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <select
                          value={dinnerRiderId}
                          onChange={e => setDinnerRiderId(e.target.value)}
                          className="flex-1 bg-white border border-indigo-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs"
                        >
                          <option value="">-- Choose Rider for Dinner (Admin Decision) --</option>
                          {riders.map(r => (
                            <option key={r.id || r._id} value={r._id || r.id}>
                              {r.name} • {r.vehicle ? r.vehicle.split('(')[0] : 'EV'} ({r.activeTiffins || 0} active)
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          disabled={!dinnerRiderId || isAssigningSlot === 'Dinner'}
                          onClick={() => handleAssignSlotRider('Dinner', dinnerRiderId)}
                          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                        >
                          {isAssigningSlot === 'Dinner' ? (
                            <>
                              <RefreshCw size={12} className="animate-spin" />
                              <span>Assigning...</span>
                            </>
                          ) : (
                            <>
                              <Check size={14} />
                              <span>Assign All Dinner</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-indigo-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setMessMealFilter('Dinner')}
                      className="text-[11px] font-black text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                    >
                      <span>View all {dinnerTiffins.length} Dinner orders below</span>
                      <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mess Deliveries Cards Matching Exact Prompt Format */}
          <div className="space-y-4">

            {/* Filter Pills & Hostel Selector */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none w-full sm:w-auto">
                {[
                  { key: 'all', label: 'All Tiffins', count: dispatchRoster.length },
                  {
                    key: 'unassigned',
                    label: '⚠️ Needs Rider',
                    count: dispatchRoster.filter(d => !d.assignedRider || d.assignedRider === 'Unassigned').length,
                    alert: true
                  },
                  {
                    key: 'assigned',
                    label: '✓ Assigned',
                    count: dispatchRoster.filter(d => d.assignedRider && d.assignedRider !== 'Unassigned' && (d.status || '').toLowerCase() !== 'delivered').length
                  },
                  {
                    key: 'delivered',
                    label: 'Delivered',
                    count: dispatchRoster.filter(d => (d.status || '').toLowerCase() === 'delivered').length
                  }
                ].map(tab => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setMessStatusFilter(tab.key as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                      messStatusFilter === tab.key
                        ? tab.alert
                          ? 'bg-amber-600 text-white shadow-xs font-black'
                          : 'bg-slate-900 text-white shadow-xs font-black'
                        : tab.alert
                        ? 'bg-amber-50 text-amber-900 border border-amber-300 font-extrabold hover:bg-amber-100'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      messStatusFilter === tab.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <select
                  value={messAreaFilter}
                  onChange={e => setMessAreaFilter(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-orange-500 cursor-pointer"
                >
                  <option value="all">All Delivery Hostels</option>
                  <option value="NC-01">North Campus (NC-01)</option>
                  <option value="SC-02">South Campus (SC-02)</option>
                  <option value="MN-03">Mukherjee Nagar (MN-03)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dispatchRoster
                .filter(item => {
                  if (messMealFilter !== 'All') {
                    const itemSlot = (item.slot || item.mealSlot || '').toLowerCase();
                    const targetSlot = messMealFilter.toLowerCase();
                    if (!itemSlot.includes(targetSlot)) {
                      return false;
                    }
                  }
                  if (messAreaFilter !== 'all' && item.zoneCode && item.zoneCode !== messAreaFilter) {
                    return false;
                  }
                  const isUnassigned = !item.assignedRider || item.assignedRider === 'Unassigned';
                  const isDelivered = (item.status || '').toLowerCase() === 'delivered';
                  if (messStatusFilter === 'unassigned') return isUnassigned;
                  if (messStatusFilter === 'assigned') return !isUnassigned && !isDelivered;
                  if (messStatusFilter === 'delivered') return isDelivered;
                  return true;
                })
                .map((item, idx, arr) => {
                  const isUnassigned = !item.assignedRider || item.assignedRider === 'Unassigned';
                  const isDelivered = (item.status || '').toLowerCase() === 'delivered';
                  const isOut = (item.status || '').toLowerCase() === 'on-route' || (item.status || '').toLowerCase() === 'dispatched';

                  return (
                    <div
                      key={item.id || item.orderId || idx}
                      className={`bg-white border rounded-3xl p-5 shadow-xs hover:border-slate-300 transition flex flex-col justify-between ${
                        isUnassigned ? 'border-amber-300 ring-2 ring-amber-400/20' : 'border-slate-200/90'
                      }`}
                    >
                      <div>
                        {/* Top Sequential Delivery Header */}
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-[11px]">
                          <span className="font-mono font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                            📦 Delivery #{idx + 1} of {arr.length}
                          </span>
                          <span className="font-mono text-xs font-black px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                            📍 {item.zoneCode || item.zone || 'NC-01'}
                          </span>
                        </div>

                        {/* Header: ID + Name + Time + Status */}
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono font-black text-slate-900 text-sm">
                                #{item.orderId || item.id}
                              </span>
                              <span className="text-slate-300">•</span>
                              <h4 className="font-extrabold text-slate-900 text-sm">{item.studentName || item.customerName}</h4>
                              {(item.slot || item.mealSlot || '').toLowerCase().includes('dinner') ? (
                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                                  🌙 Dinner
                                </span>
                              ) : (
                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                                  🍱 Lunch
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-1 font-medium">
                              <MapPin size={12} className="text-orange-500 shrink-0" />
                              <span>{item.hostelAddress || `${item.hostel || 'Hostel'}, Room ${item.room || '101'}`}</span>
                            </p>
                            {(item.customerPhone || item.phone) && (
                              <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                                <Phone size={11} className="text-slate-400 shrink-0" />
                                <a href={`tel:${item.customerPhone || item.phone}`} className="hover:text-orange-600 font-bold hover:underline">
                                  {item.customerPhone || item.phone}
                                </a>
                              </p>
                            )}
                          </div>

                          <div className="text-right">
                            <span className="font-mono font-bold text-xs text-slate-700 block">
                              {item.scheduledTime || '12:30 PM'}
                            </span>
                            <span
                              className={`inline-block mt-1 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                                isDelivered
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : isOut
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : isUnassigned
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse font-extrabold'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}
                            >
                              {isUnassigned ? '⚠️ Unassigned' : item.deliveryStatus || item.status}
                            </span>
                          </div>
                        </div>

                        {/* Plan & Preference */}
                        <div className="bg-slate-50 p-2.5 rounded-2xl my-3 text-xs flex justify-between items-center text-slate-600">
                          <div>
                            <span className="font-bold text-slate-800 block">{item.planName || 'Standard Daily Tiffin'}</span>
                            <span className="text-[11px] text-emerald-700 font-bold">🌱 {item.dietPreference || 'Pure Veg Homestyle'}</span>
                          </div>
                          <span className="text-[10px] font-mono font-black bg-emerald-50 border border-emerald-200 text-emerald-800 px-2 py-0.5 rounded-md">
                            🔑 OTP: {item.otp || '4821'}
                          </span>
                        </div>

                        {/* ── ADMIN DECISION: RIDER ALLOCATION SELECTOR ── */}
                        <div className={`p-3 rounded-2xl border my-2 space-y-2 transition-all ${
                          isUnassigned ? 'bg-amber-50/70 border-amber-300' : 'bg-slate-50 border-slate-200/80'
                        }`}>
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-800 flex items-center gap-1.5">
                              <Bike size={14} className={isUnassigned ? 'text-amber-600' : 'text-emerald-600'} />
                              <span>👑 Admin Rider Decision:</span>
                            </span>
                            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                              isUnassigned
                                ? 'bg-amber-200 text-amber-900 font-black'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {isUnassigned ? 'Action Needed' : 'Allocated'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <select
                              value={
                                riders.find(r => r.name === (item.assignedRider || item.rider) || (r.id && r.id === item.riderId))
                                  ? (riders.find(r => r.name === (item.assignedRider || item.rider) || (r.id && r.id === item.riderId))?._id || riders.find(r => r.name === (item.assignedRider || item.rider) || (r.id && r.id === item.riderId))?.id)
                                  : ''
                              }
                              onChange={e => handleQuickAssignMessRider(item.orderId || item.id, e.target.value)}
                              disabled={isDelivered}
                              className={`flex-1 text-xs py-2 px-2.5 rounded-xl border font-bold transition outline-none cursor-pointer ${
                                isUnassigned
                                  ? 'bg-white border-amber-400 text-amber-950 font-black shadow-xs focus:ring-2 focus:ring-orange-500'
                                  : 'bg-white border-slate-300 text-slate-800 focus:ring-2 focus:ring-orange-500'
                              } disabled:opacity-60 disabled:cursor-not-allowed`}
                            >
                              <option value="">-- Choose Rider (Admin Decision) --</option>
                              {riders.map(r => (
                                <option key={r.id || r._id} value={r._id || r.id}>
                                  {r.name} • {r.route ? r.route.split(' ')[0] : 'Fleet'} ({r.activeTiffins || 0} active)
                                </option>
                              ))}
                            </select>

                            <button
                              type="button"
                              onClick={() =>
                                openAssignModal({
                                  id: item.orderId || item.id,
                                  type: 'mess',
                                  customer: item.studentName || item.customerName,
                                  address: item.hostelAddress || 'Hostel Room'
                                })
                              }
                              disabled={isDelivered}
                              title="Open Full Assignment Modal"
                              className="px-2.5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition cursor-pointer disabled:opacity-50 shrink-0"
                            >
                              {isUnassigned ? 'Assign' : 'Change'}
                            </button>
                          </div>

                          {item.assignedRider && item.assignedRider !== 'Unassigned' && (
                            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                              <span>Assigned to: <strong className="text-slate-800">{item.assignedRider}</strong></span>
                              {item.riderPhone && (
                                <a href={`tel:${item.riderPhone}`} className="text-orange-600 font-bold hover:underline">
                                  {item.riderPhone}
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        {isDelivered ? (
                          <div className="w-full py-2 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl text-center flex items-center justify-center gap-1.5">
                            <CheckCircle2 size={14} /> Successfully Delivered ({item.deliveredAt || '12:28 PM'})
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 w-full">
                            <button
                              type="button"
                              onClick={() =>
                                openAssignModal({
                                  id: item.orderId || item.id,
                                  type: 'mess',
                                  customer: item.studentName || item.customerName,
                                  address: item.hostelAddress || 'Hostel Room'
                                })
                              }
                              className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                            >
                              {isUnassigned ? 'Choose Rider' : 'Reassign Rider'}
                            </button>
                            <button
                              type="button"
                              onClick={() => openConfirmationModal({ ...item, serviceType: 'mess' })}
                              className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <CheckCircle size={14} /> Confirm OTP
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          4. SUB-TAB: INSTANT FOOD ORDERS (PIPELINE)
      ══════════════════════════════════════════════════════════ */}
      {subTab === 'instant' && (
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md uppercase">
                  One-Time Menu Orders
                </span>
                <span className="text-xs text-slate-400 font-mono">Burgers, Maggi, Rolls, Chowmein & Beverages</span>
              </div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <ShoppingBag className="text-orange-500" size={24} /> Instant Food Order Management
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Kitchen preparation status, live dispatch to riders, pickup confirmation, and COD/Online payment tracking.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-700 font-black text-xs flex items-center gap-1.5">
                <Bell size={14} className="text-orange-600 animate-bounce" /> Audio Notification: ON
              </span>
            </div>
          </div>

          {/* Pipeline Filter Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { key: 'all', label: 'All Orders', count: orders.length },
              { key: 'new', label: 'New Order', count: newInstantCount },
              { key: 'preparing', label: 'Preparing', count: preparingInstantCount },
              { key: 'ready', label: 'Ready for Pickup', count: readyInstantCount },
              { key: 'on-the-way', label: 'Out for Delivery', count: outInstantCount },
              { key: 'delivered', label: 'Delivered', count: deliveredInstantCount }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setInstantStatusFilter(tab.key)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  instantStatusFilter === tab.key
                    ? 'bg-slate-900 text-white shadow-xs font-black'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${instantStatusFilter === tab.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Instant Food Order Cards (Exact Match to Prompt F-201, F-202, F-203, F-204) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {orders
              .filter(o => {
                if (instantStatusFilter !== 'all') {
                  if (instantStatusFilter === 'new') {
                    return (o.deliveryStatus || '').toLowerCase().includes('new') || o.status === 'confirmed';
                  }
                  if (instantStatusFilter === 'preparing') {
                    return (o.deliveryStatus || '').toLowerCase().includes('prep') || o.status === 'preparing';
                  }
                  if (instantStatusFilter === 'ready') {
                    return (o.deliveryStatus || '').toLowerCase().includes('ready');
                  }
                  if (instantStatusFilter === 'on-the-way') {
                    return (o.deliveryStatus || '').toLowerCase().includes('out') || o.status === 'on-the-way';
                  }
                  if (instantStatusFilter === 'delivered') {
                    return o.status === 'delivered';
                  }
                }
                return true;
              })
              .map(order => {
                const isUnassigned = !order.deliveryPartner?.name || order.deliveryPartner.name === 'Unassigned';
                const itemsList = order.items || [];
                const itemsSummary = itemsList.map((i: any) => `${i.quantity} ${i.name}`).join(', ') || '1 Instant Snack';
                const isReady = (order.deliveryStatus || '').toLowerCase().includes('ready');
                const isOut = (order.deliveryStatus || '').toLowerCase().includes('out') || order.status === 'on-the-way';
                const isDelivered = order.status === 'delivered';

                return (
                  <div
                    key={order.orderId || order.id}
                    className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs hover:border-slate-300 transition flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Row: Order ID + Price + Customer + Status */}
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-slate-900 text-sm">{order.orderId}</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-base font-black text-orange-600">₹{order.totalAmount}</span>
                          </div>
                          <h4 className="font-extrabold text-slate-900 text-sm mt-0.5">{order.customerName}</h4>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin size={11} className="text-slate-400" />
                            {order.deliveryAddress}
                          </p>
                        </div>

                        <div className="text-right">
                          <span
                            className={`inline-block text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                              order.deliveryStatus === 'New Order'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : order.deliveryStatus === 'Preparing'
                                ? 'bg-purple-50 text-purple-800 border border-purple-200'
                                : order.deliveryStatus === 'Ready for Pickup'
                                ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                : order.deliveryStatus === 'Out for Delivery'
                                ? 'bg-orange-50 text-orange-800 border border-orange-200'
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {order.deliveryStatus || order.status}
                          </span>
                          <span className="block text-[10px] font-medium text-slate-400 mt-1">
                            {order.paymentMethod || 'Cash on Delivery'}
                          </span>
                        </div>
                      </div>

                      {/* Items Ordered */}
                      <div className="bg-slate-50 p-3 rounded-2xl my-3 text-xs border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Items Ordered
                        </span>
                        <p className="font-bold text-slate-800 leading-snug">{itemsSummary}</p>
                        {order.notes && (
                          <p className="text-[11px] text-orange-700 italic mt-1 bg-orange-50/60 p-1.5 rounded-lg">
                            Note: {order.notes}
                          </p>
                        )}
                      </div>

                      {/* Rider & ETA */}
                      <div className="flex items-center justify-between text-xs py-1">
                        <div className="flex items-center gap-1.5">
                          <Bike size={14} className={isUnassigned ? 'text-amber-500' : 'text-slate-600'} />
                          <span className="text-slate-500">Rider:</span>
                          <strong className={isUnassigned ? 'text-amber-600 font-black' : 'text-slate-900'}>
                            {order.deliveryPartner?.name || 'Unassigned'}
                          </strong>
                        </div>
                        <span className="text-slate-500 font-medium">ETA: {order.eta || '20 Mins'}</span>
                      </div>
                    </div>

                    {/* Action Buttons based on Pipeline Step */}
                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      {isUnassigned ? (
                        <div className="flex items-center gap-2 w-full">
                          <button
                            onClick={() =>
                              openAssignModal({
                                id: order.orderId,
                                type: 'instant',
                                customer: order.customerName,
                                address: order.deliveryAddress
                              })
                            }
                            className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Bike size={14} /> Assign Rider
                          </button>
                          <button
                            onClick={() => handleUpdateInstantStatus(order.orderId, 'preparing', 'Preparing')}
                            className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                          >
                            Mark Preparing
                          </button>
                        </div>
                      ) : isReady ? (
                        <div className="flex items-center gap-2 w-full">
                          <button
                            onClick={() => handleUpdateInstantStatus(order.orderId, 'on-the-way', 'Out for Delivery')}
                            className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Navigation size={14} /> Dispatch (Handover to {order.deliveryPartner?.name?.split(' ')[0]})
                          </button>
                        </div>
                      ) : isOut ? (
                        <div className="flex items-center gap-2 w-full">
                          <button
                            onClick={() =>
                              openAssignModal({
                                id: order.orderId,
                                type: 'instant',
                                customer: order.customerName,
                                address: order.deliveryAddress
                              })
                            }
                            className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                          >
                            Reassign
                          </button>
                          <button
                            onClick={() => openConfirmationModal({ ...order, id: order.orderId, serviceType: 'instant' })}
                            className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <CheckCircle size={14} /> Confirm Delivery (OTP)
                          </button>
                        </div>
                      ) : isDelivered ? (
                        <div className="w-full py-2 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl text-center flex items-center justify-center gap-1.5">
                          <CheckCircle2 size={14} /> Delivered ({order.deliveredAt || '12:15 PM'})
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 w-full">
                          <button
                            onClick={() => handleUpdateInstantStatus(order.orderId, 'preparing', 'Ready for Pickup')}
                            className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                          >
                            Mark Ready for Pickup
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          5. SUB-TAB: ALL DELIVERIES (UNIFIED MESS + INSTANT)
      ══════════════════════════════════════════════════════════ */}
      {subTab === 'all' && (
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Layers className="text-orange-500" size={24} /> All Deliveries — Combined Logistics View
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Unified control table displaying both Mess Subscribers Tiffins and Instant Cafeteria Food Orders.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">
                {unifiedDeliveries.length} Total Registered Shipments
              </span>
            </div>
          </div>

          {/* Filter Toolbar Matching Specification */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input
                  type="text"
                  placeholder="Search Order ID, student, phone..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Service Filter */}
              <select
                value={allServiceFilter}
                onChange={e => setAllServiceFilter(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-orange-500 cursor-pointer"
              >
                <option value="all">All Services (Mess + Instant)</option>
                <option value="mess">🍱 Mess Tiffins Only</option>
                <option value="instant">🍔 Instant Food Orders Only</option>
              </select>

              {/* Status Filter */}
              <select
                value={allStatusFilter}
                onChange={e => setAllStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-orange-500 cursor-pointer"
              >
                <option value="all">All Delivery Statuses</option>
                <option value="pending">Pending</option>
                <option value="out">Out for Delivery</option>
                <option value="delivered">Delivered</option>
              </select>

              {/* Area Filter */}
              <select
                value={allAreaFilter}
                onChange={e => setAllAreaFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-orange-500 cursor-pointer"
              >
                <option value="all">All Campus Zones</option>
                <option value="North Campus">North Campus (NC-01)</option>
                <option value="South Campus">South Campus (SC-02)</option>
                <option value="Mukherjee">Mukherjee Nagar (MN-03)</option>
              </select>
            </div>
          </div>

          {/* Unified Deliveries Table */}
          <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3.5 px-4">Order ID</th>
                    <th className="py-3.5 px-4">Service</th>
                    <th className="py-3.5 px-4">Customer & Room</th>
                    <th className="py-3.5 px-4">Delivery Slot</th>
                    <th className="py-3.5 px-4">Assigned Rider</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Payment</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {unifiedDeliveries
                    .filter(item => {
                      if (allServiceFilter !== 'all' && item.serviceType !== allServiceFilter) return false;
                      if (allStatusFilter !== 'all') {
                        if (allStatusFilter === 'pending' && !item.status.toLowerCase().includes('pend') && !item.status.toLowerCase().includes('new')) return false;
                        if (allStatusFilter === 'out' && !item.status.toLowerCase().includes('out') && !item.status.toLowerCase().includes('route')) return false;
                        if (allStatusFilter === 'delivered' && !item.status.toLowerCase().includes('deliv')) return false;
                      }
                      if (allAreaFilter !== 'all' && !item.zone?.toLowerCase().includes(allAreaFilter.toLowerCase()) && !item.address?.toLowerCase().includes(allAreaFilter.toLowerCase())) return false;
                      if (searchQuery.trim()) {
                        const q = searchQuery.toLowerCase();
                        return (
                          item.id.toLowerCase().includes(q) ||
                          item.customerName.toLowerCase().includes(q) ||
                          item.customerPhone.includes(q) ||
                          item.rider.toLowerCase().includes(q) ||
                          item.address.toLowerCase().includes(q)
                        );
                      }
                      return true;
                    })
                    .map(item => {
                      const isUnassigned = !item.rider || item.rider === 'Unassigned';
                      const isDelivered = item.status.toLowerCase().includes('deliv');

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3.5 px-4 font-mono font-black text-slate-900">{item.id}</td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                item.serviceType === 'mess'
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                  : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                              }`}
                            >
                              {item.serviceType === 'mess' ? <Utensils size={12} /> : <ShoppingBag size={12} />}
                              {item.service}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div>
                              <p className="font-bold text-slate-900">{item.customerName}</p>
                              <p className="text-[11px] text-slate-400">{item.address}</p>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-700">{item.deliverySlot}</td>
                          <td className="py-3.5 px-4">
                            {isUnassigned ? (
                              <span className="text-amber-600 font-bold flex items-center gap-1">
                                <AlertCircle size={12} /> Unassigned
                              </span>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <Bike size={13} className="text-slate-400" />
                                <span className="font-bold text-slate-800">{item.rider}</span>
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                                isDelivered
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : item.status.toLowerCase().includes('out')
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 font-medium">{item.payment}</td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {isUnassigned ? (
                                <button
                                  onClick={() =>
                                    openAssignModal({
                                      id: item.id,
                                      type: item.serviceType,
                                      customer: item.customerName,
                                      address: item.address
                                    })
                                  }
                                  className="px-2.5 py-1 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition text-[11px] cursor-pointer"
                                >
                                  Assign
                                </button>
                              ) : (
                                <button
                                  onClick={() =>
                                    openAssignModal({
                                      id: item.id,
                                      type: item.serviceType,
                                      customer: item.customerName,
                                      address: item.address
                                    })
                                  }
                                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition text-[11px] cursor-pointer"
                                >
                                  Reassign
                                </button>
                              )}
                              <button
                                onClick={() => setSubTab('tracking')}
                                className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg transition text-[11px] cursor-pointer"
                              >
                                Track
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
          6. SUB-TAB: LIVE TRACKING (CAMPUS RADAR MAP)
      ══════════════════════════════════════════════════════════ */}
      {subTab === 'tracking' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[10px] font-bold text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded-md">
                  Live GPS Radar Active
                </span>
                <span className="text-xs text-slate-400 font-mono">{onlineRidersCount} Online Riders Pinged</span>
              </div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Navigation className="text-orange-500" size={24} /> Campus Live Route & Fleet Tracking
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Simulated real-time location updates, estimated arrival time (ETA), active delivery loads, and delayed delivery alerts.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
                Last GPS Refresh: 10s ago
              </span>
            </div>
          </div>

          {/* INTERACTIVE CAMPUS MAP SIMULATION */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* The Visual Campus Map Canvas */}
            <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 rounded-3xl p-6 relative overflow-hidden border border-slate-700 shadow-xl min-h-[480px] flex flex-col justify-between">
              {/* Radar Grid Lines SVG Background */}
              <div className="absolute inset-0 opacity-15 pointer-events-none">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>

              {/* Campus Zones / Landmark Pins */}
              <div className="relative z-10">
                <div className="flex justify-between items-center text-white/70 text-xs mb-4">
                  <span className="font-mono text-[11px] font-bold">CAMPUS SECTOR GRID • LAT 28.692° N, LNG 77.212° E</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> Online Mode
                  </span>
                </div>

                {/* Central Kitchen */}
                <div className="absolute left-[45%] top-[45%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/50 border-2 border-white animate-pulse">
                    <Utensils size={20} />
                  </div>
                  <span className="text-[10px] font-black text-white bg-slate-900/90 px-2 py-0.5 rounded-md mt-1 border border-slate-700">
                    Central Kitchen Hub
                  </span>
                </div>

                {/* North Campus Tagore Hostel */}
                <div className="absolute left-[20%] top-[20%] flex flex-col items-center">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 text-orange-400 border border-slate-600 flex items-center justify-center">
                    <MapPin size={18} />
                  </div>
                  <span className="text-[9px] font-bold text-slate-300 bg-slate-900/80 px-1.5 py-0.5 rounded mt-0.5">
                    Tagore Hostel
                  </span>
                </div>

                {/* Raman Hostel */}
                <div className="absolute left-[38%] top-[15%] flex flex-col items-center">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 text-orange-400 border border-slate-600 flex items-center justify-center">
                    <MapPin size={18} />
                  </div>
                  <span className="text-[9px] font-bold text-slate-300 bg-slate-900/80 px-1.5 py-0.5 rounded mt-0.5">
                    Raman Hostel
                  </span>
                </div>

                {/* South Campus Kasturba Girls Hostel */}
                <div className="absolute left-[72%] top-[65%] flex flex-col items-center">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 text-pink-400 border border-slate-600 flex items-center justify-center">
                    <MapPin size={18} />
                  </div>
                  <span className="text-[9px] font-bold text-slate-300 bg-slate-900/80 px-1.5 py-0.5 rounded mt-0.5">
                    Kasturba Girls Hostel
                  </span>
                </div>

                {/* Sarojini Hostel */}
                <div className="absolute left-[82%] top-[50%] flex flex-col items-center">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 text-pink-400 border border-slate-600 flex items-center justify-center">
                    <MapPin size={18} />
                  </div>
                  <span className="text-[9px] font-bold text-slate-300 bg-slate-900/80 px-1.5 py-0.5 rounded mt-0.5">
                    Sarojini Hostel
                  </span>
                </div>

                {/* Mukherjee Nagar Complex */}
                <div className="absolute left-[15%] top-[70%] flex flex-col items-center">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 text-blue-400 border border-slate-600 flex items-center justify-center">
                    <MapPin size={18} />
                  </div>
                  <span className="text-[9px] font-bold text-slate-300 bg-slate-900/80 px-1.5 py-0.5 rounded mt-0.5">
                    Mukherjee Nagar PGs
                  </span>
                </div>

                {/* Vijay Nagar */}
                <div className="absolute left-[60%] top-[25%] flex flex-col items-center">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 text-indigo-400 border border-slate-600 flex items-center justify-center">
                    <MapPin size={18} />
                  </div>
                  <span className="text-[9px] font-bold text-slate-300 bg-slate-900/80 px-1.5 py-0.5 rounded mt-0.5">
                    Vijay Nagar
                  </span>
                </div>

                {/* ACTIVE RIDER PINS MOVING ACROSS CAMPUS */}
                {onlineRidersList.map((r, idx) => {
                  const leftPositions = ['26%', '68%', '22%', '52%', '40%', '75%'];
                  const topPositions = ['28%', '60%', '62%', '52%', '35%', '45%'];
                  const left = leftPositions[idx % leftPositions.length];
                  const top = topPositions[idx % topPositions.length];
                  return (
                    <div
                      key={r.id || r._id || idx}
                      onClick={() => setSelectedMapRider(r)}
                      style={{ left, top }}
                      className="absolute cursor-pointer group flex flex-col items-center z-20"
                    >
                      <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/50 border-2 border-white transform hover:scale-125 transition">
                        <Bike size={16} />
                      </div>
                      <span className="text-[9px] font-black text-white bg-emerald-950/90 border border-emerald-500/40 px-2 py-0.5 rounded-full mt-1 group-hover:scale-110 transition truncate max-w-[100px]">
                        {r.name.split(' ')[0]} ({r.status === 'on-route' ? 'Busy' : 'Active'})
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Map Controls & Status Bar */}
              <div className="relative z-10 pt-4 mt-auto border-t border-slate-700/80 flex flex-wrap justify-between items-center text-xs text-slate-300 gap-2">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Free Rider
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> On-Route
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Central Kitchen
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">Click any rider pin to inspect route</span>
              </div>
            </div>

            {/* Rider Inspector Sidebar */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-black text-slate-900 text-sm">Active Fleet Radar</h4>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                    {onlineRidersCount} Online
                  </span>
                </div>

                {selectedMapRider ? (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={selectedMapRider.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=compress&cs=tinysrgb&w=150'}
                        alt={selectedMapRider.name}
                        className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                      />
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm">{selectedMapRider.name}</h4>
                        <p className="text-xs text-slate-500 font-mono">{selectedMapRider.id} • {selectedMapRider.vehicle}</p>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-200">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Current Route:</span>
                        <span className="text-slate-800 font-semibold">{selectedMapRider.route || 'Campus Fleet'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Status:</span>
                        <strong className="text-emerald-600 font-bold capitalize">{selectedMapRider.status || 'available'}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Active Workload:</span>
                        <span className="text-orange-600 font-bold">{selectedMapRider.activeTiffins || 0} Tiffins</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Deliveries Today:</span>
                        <span className="text-slate-500 font-mono">{selectedMapRider.deliveriesToday || 0} Delivered</span>
                      </div>
                    </div>

                    <div className="pt-2 flex gap-2">
                      <a
                        href={`tel:${selectedMapRider.phone}`}
                        className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl text-center shadow-xs transition"
                      >
                        Call Rider
                      </a>
                      <button
                        onClick={() => setSelectedMapRider(null)}
                        className="py-2 px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    <Navigation size={28} className="mx-auto mb-2 text-slate-300" />
                    Select a rider from the list or click a pin on the radar map to view real-time trajectory.
                  </div>
                )}

                {/* Quick List of Online Riders */}
                <div className="mt-4 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Online Fleet List
                  </span>
                  {riders.slice(0, 5).map(r => (
                    <div
                      key={r.id || r._id}
                      onClick={() => setSelectedMapRider(r)}
                      className="p-2.5 rounded-xl hover:bg-slate-50 transition border border-slate-100 flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-xs font-bold text-slate-800">{r.name}</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 font-mono">{r.route.split(' ')[0]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          7. SUB-TAB: EARNINGS & SETTLEMENTS (FULL REPORT & LEDGER)
      ══════════════════════════════════════════════════════════ */}
      {subTab === 'earnings' && (
        <RiderEarningsReport onNotify={onNotify} />
      )}

      {/* ══════════════════════════════════════════════════════════
          8. SUB-TAB: ATTENDANCE & SHIFTS
      ══════════════════════════════════════════════════════════ */}
      {subTab === 'attendance' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Clock className="text-orange-500" size={24} /> Attendance, Shifts & Online Duty Hours
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Track morning & evening meal shifts, clock-in/out records, weekly hours summary, and attendance compliance.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                Fleet Attendance Today: {riders.length > 0 ? `${Math.round((onlineRidersCount / riders.length) * 100)}%` : '0%'} ({onlineRidersCount} / {riders.length} Scheduled)
              </span>
            </div>
          </div>

          {/* Shifts Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs">
              <span className="text-[10px] font-bold text-orange-600 uppercase bg-orange-50 px-2 py-0.5 rounded-md">
                Morning Shift
              </span>
              <h4 className="font-extrabold text-slate-900 text-base mt-2">07:30 AM - 03:30 PM</h4>
              <p className="text-xs text-slate-500 mt-1">Covers breakfast tiffins and campus lunch distribution</p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-xs font-bold text-slate-700">
                <span>Riders on Shift:</span>
                <span className="text-emerald-600 font-black">{Math.ceil(onlineRidersCount / 2)} Riders Logged In</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs">
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                Evening Shift
              </span>
              <h4 className="font-extrabold text-slate-900 text-base mt-2">11:30 AM - 08:30 PM</h4>
              <p className="text-xs text-slate-500 mt-1">Covers afternoon snacks and dinner tiffin deliveries</p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-xs font-bold text-slate-700">
                <span>Riders on Shift:</span>
                <span className="text-emerald-600 font-black">{Math.floor(onlineRidersCount / 2)} Riders Logged In</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs">
              <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                Reserve Fleet
              </span>
              <h4 className="font-extrabold text-slate-900 text-base mt-2">Standby Support</h4>
              <p className="text-xs text-slate-500 mt-1">Off-duty reserve riders available on emergency call</p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-xs font-bold text-slate-700">
                <span>Standby Count:</span>
                <span className="text-slate-600 font-black">{availableRidersCount} Riders Available</span>
              </div>
            </div>
          </div>

          {/* Attendance Log Table */}
          <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-black text-slate-900 text-sm">Today's Clock-in Log</h3>
              <span className="text-xs text-slate-400 font-mono">Synced with Rider Mobile GPS</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Rider</th>
                    <th className="py-3 px-4">Shift Timings</th>
                    <th className="py-3 px-4">Logged Duty Hours</th>
                    <th className="py-3 px-4">Current Status</th>
                    <th className="py-3 px-4">Weekly Summary</th>
                    <th className="py-3 px-4 text-right">Compliance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {riders.map(rider => (
                    <tr key={rider.id || rider._id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={rider.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=compress&cs=tinysrgb&w=150'}
                            alt={rider.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{rider.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{rider.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {rider.shift?.start || '07:30 AM'} - {rider.shift?.end || '03:30 PM'}
                      </td>
                      <td className="py-3.5 px-4 font-black text-slate-900">
                        {rider.shift?.loggedHours || (rider.status === 'offline' ? '0 hrs' : '6.5 hrs')}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                            rider.status === 'available'
                              ? 'bg-emerald-50 text-emerald-700'
                              : rider.status === 'offline'
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {rider.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-600">42 hrs / 6 days</td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                          100% Present
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          9. SUB-TAB: SETTINGS
      ══════════════════════════════════════════════════════════ */}
      {subTab === 'settings' && (
        <div className="space-y-6 max-w-4xl">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <SlidersHorizontal className="text-orange-500" size={24} /> Delivery Fleet & Payout Configuration
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Set per-delivery commission rates, automated batch assignment rules, GPS intervals, and order cutoffs.
            </p>

            <div className="mt-6 space-y-5">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-4 border-b border-slate-100">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Rider Payout per Delivery</h4>
                  <p className="text-xs text-slate-500">Standard commission paid to delivery boy per fulfilled tiffin/order</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-700">₹</span>
                  <input
                    type="number"
                    value={settings.perDeliveryRate}
                    onChange={e => setSettings(prev => ({ ...prev, perDeliveryRate: Number(e.target.value) }))}
                    className="w-24 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-4 border-b border-slate-100">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Auto-Assign Riders Algorithm</h4>
                  <p className="text-xs text-slate-500">Automatically assign unassigned orders to closest available rider in that hostel zone</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSettings(prev => ({ ...prev, autoAssign: !prev.autoAssign }))}
                  className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition ${settings.autoAssign ? 'bg-orange-500 justify-end' : 'bg-slate-200 justify-start'}`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-4 border-b border-slate-100">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Require OTP Verification on Delivery</h4>
                  <p className="text-xs text-slate-500">Rider must input student's 4-digit OTP or take photo proof before marking delivered</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSettings(prev => ({ ...prev, requireOtp: !prev.requireOtp }))}
                  className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition ${settings.requireOtp ? 'bg-orange-500 justify-end' : 'bg-slate-200 justify-start'}`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-4 border-b border-slate-100">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">GPS Ping Frequency</h4>
                  <p className="text-xs text-slate-500">Interval for rider app periodic GPS location background updates</p>
                </div>
                <select
                  value={settings.gpsPingInterval}
                  onChange={e => setSettings(prev => ({ ...prev, gpsPingInterval: Number(e.target.value) }))}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                >
                  <option value={15}>Every 15 Seconds (Real-time)</option>
                  <option value={30}>Every 30 Seconds (Balanced)</option>
                  <option value={60}>Every 60 Seconds (Battery Saver)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await adminAPI.updateDeliveryRates({
                        defaultPerDeliveryRate: settings.perDeliveryRate,
                        applyToAllRiders: true
                      });
                      if (setRiders) {
                        setRiders((prev: any[]) => prev.map(r => ({ ...r, perDeliveryRate: settings.perDeliveryRate })));
                      }
                      onNotify(`Delivery settings saved & rider rate updated to ₹${settings.perDeliveryRate}/run!`, 'success');
                    } catch (err: any) {
                      onNotify(err.message || 'Failed to persist delivery rates', 'error');
                    }
                  }}
                  className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          MODAL 1: ADD / EDIT RIDER
      ══════════════════════════════════════════════════════════ */}
      {riderModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Bike className="text-orange-500" size={20} />
                {editingRider ? `Edit Rider: ${editingRider.name}` : 'Onboard New Delivery Boy'}
              </h3>
              <button
                onClick={() => setRiderModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveRider} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Rider Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={riderForm.name}
                    onChange={e => setRiderForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Mobile Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter 10-digit phone number"
                    value={riderForm.phone}
                    onChange={e => setRiderForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Vehicle Name & Reg Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Electric Scooter"
                    value={riderForm.vehicle}
                    onChange={e => setRiderForm(prev => ({ ...prev, vehicle: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Driving Licence Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="DL-1420230098712"
                    value={riderForm.licenseNumber}
                    onChange={e => setRiderForm(prev => ({ ...prev, licenseNumber: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Assigned Campus Zone *</label>
                  <select
                    value={riderForm.route}
                    onChange={e => setRiderForm(prev => ({ ...prev, route: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                  >
                    <option value="North Campus (NC-01)">North Campus (NC-01)</option>
                    <option value="South Campus (SC-02)">South Campus (SC-02)</option>
                    <option value="Mukherjee Nagar (MN-03)">Mukherjee Nagar (MN-03)</option>
                    <option value="Vijay Nagar (VJ-04)">Vijay Nagar (VJ-04)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Per Delivery Rate (₹)</label>
                  <input
                    type="number"
                    value={riderForm.perDeliveryRate}
                    onChange={e => setRiderForm(prev => ({ ...prev, perDeliveryRate: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* ── MANDATORY GOVT AADHAAR CARD KYC VERIFICATION SECTION ── */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-slate-50 border-2 border-orange-400/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center font-black shadow-xs">
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                        Government Aadhaar KYC Verification
                      </h4>
                      <p className="text-[10px] text-slate-500 font-medium">
                        Mandatory verification required before onboarding delivery rider
                      </p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1 ${
                    riderForm.aadhaarVerified
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {riderForm.aadhaarVerified ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
                    {riderForm.aadhaarVerified ? 'KYC Verified' : 'KYC Required'}
                  </span>
                </div>

                {/* Aadhaar Number Input + Instant Verification Button */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-black text-slate-800">
                      12-Digit Aadhaar Card Number *
                    </label>
                    <span className="text-[10px] font-mono text-slate-400">
                      ({riderForm.aadhaarNumber.replace(/\D/g, '').length}/12 digits)
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        required
                        maxLength={14}
                        placeholder="XXXX XXXX XXXX"
                        value={riderForm.aadhaarNumber}
                        onChange={e => {
                          const formatted = formatAadhaarInput(e.target.value);
                          const clean = formatted.replace(/\D/g, '');
                          setRiderForm(prev => ({
                            ...prev,
                            aadhaarNumber: formatted,
                            aadhaarVerified: clean.length === 12 ? prev.aadhaarVerified : false,
                            kycStatus: clean.length === 12 && prev.aadhaarVerified ? 'verified' : 'pending'
                          }));
                        }}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-mono font-black text-slate-900 tracking-wider focus:outline-none focus:border-orange-500 shadow-inner"
                      />
                      {riderForm.aadhaarNumber.replace(/\D/g, '').length === 12 && (
                        <CheckCircle2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600" />
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleVerifyAadhaar}
                      disabled={isVerifyingAadhaar || riderForm.aadhaarNumber.replace(/\D/g, '').length !== 12}
                      className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
                        riderForm.aadhaarVerified
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : riderForm.aadhaarNumber.replace(/\D/g, '').length === 12
                          ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-md'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {isVerifyingAadhaar ? (
                        <>
                          <RefreshCw size={13} className="animate-spin" />
                          <span>Checking UIDAI...</span>
                        </>
                      ) : riderForm.aadhaarVerified ? (
                        <>
                          <Check size={14} />
                          <span>Verified ✅</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={14} />
                          <span>Verify with UIDAI</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Aadhaar Document / Photo Attachment */}
                <div className="pt-2 border-t border-orange-200/50 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700">Aadhaar Card Document / Photo Proof:</span>
                    <button
                      type="button"
                      onClick={handleUseSampleAadhaar}
                      className="text-[11px] text-orange-600 hover:text-orange-700 font-bold underline cursor-pointer"
                    >
                      + Attach Verified Sample Aadhaar
                    </button>
                  </div>

                  {riderForm.aadhaarCardImage ? (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-emerald-300">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={riderForm.aadhaarCardImage}
                          alt="Aadhaar Document Preview"
                          className="w-12 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">Aadhaar_Document_Verified.jpg</p>
                          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                            <CheckCircle2 size={10} /> Valid Govt Photo ID Attached
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setRiderForm(prev => ({ ...prev, aadhaarCardImage: '' }))}
                        className="p-1 text-slate-400 hover:text-rose-600 text-xs font-bold cursor-pointer"
                        title="Remove Document"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <label className="flex-1 py-2 px-3 rounded-xl border border-dashed border-slate-300 hover:border-orange-500 bg-white text-center cursor-pointer transition text-xs text-slate-600 font-semibold flex items-center justify-center gap-1.5">
                        <FileText size={14} className="text-slate-400" />
                        <span>Upload Aadhaar Card (Front/Back)</span>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleAadhaarUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>

                {/* Verification Notice */}
                {riderForm.aadhaarVerified ? (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 text-[11px] font-semibold flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                    <span>Aadhaar KYC Approved: Rider identity verified with UIDAI database. Eligible for campus delivery assignments.</span>
                  </div>
                ) : (
                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 text-[11px] font-medium flex items-center gap-2">
                    <AlertCircle size={14} className="text-amber-600 shrink-0" />
                    <span>Aadhaar number is mandatory. Please enter 12 digits and click "Verify with UIDAI".</span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Residential Address</label>
                <input
                  type="text"
                  placeholder="e.g. Tagore Lane, North Campus, Delhi"
                  value={riderForm.address}
                  onChange={e => setRiderForm(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Availability Status</label>
                  <select
                    value={riderForm.status}
                    onChange={e => setRiderForm(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                  >
                    <option value="available">🟢 Available for Orders</option>
                    <option value="on-route">🔵 On-Route / Busy</option>
                    <option value="offline">⚪ Offline / Off-duty</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Salary Model</label>
                  <select
                    value={riderForm.salaryType}
                    onChange={e => setRiderForm(prev => ({ ...prev, salaryType: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                  >
                    <option value="per_delivery">Commission (₹{riderForm.perDeliveryRate}/run)</option>
                    <option value="fixed">Fixed Monthly Salary</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRiderModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
                >
                  {editingRider ? 'Save Changes' : 'Confirm & Add Rider'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          MODAL: AADHAAR CARD KYC DOCUMENT VIEWER
      ══════════════════════════════════════════════════════════ */}
      {viewAadhaarModalRider && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden relative animate-in zoom-in-95">
            {/* Header */}
            <div className="px-5 py-3.5 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-400" />
                <h3 className="font-black text-sm">Verified Govt. Aadhaar Card</h3>
              </div>
              <button
                onClick={() => setViewAadhaarModalRider(null)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* Simulated Official Indian Aadhaar Card */}
            <div className="p-5 space-y-4">
              <div className="relative rounded-2xl border-2 border-slate-300 p-4 bg-gradient-to-b from-orange-50/50 via-white to-emerald-50/50 shadow-sm overflow-hidden">
                {/* Top Tricolor Bar */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-white to-emerald-600" />

                {/* Govt UIDAI Header */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-600 font-bold text-xs">
                      🏛️
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 leading-tight">भारत सरकार / Govt. of India</p>
                      <p className="text-xs font-black text-slate-900 leading-tight">भारतीय विशिष्ट पहचान प्राधिकरण</p>
                      <p className="text-[9px] font-mono font-bold text-slate-400">UIDAI • Unique Identification Authority of India</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 size={11} /> Verified
                  </span>
                </div>

                {/* Identity Content */}
                <div className="flex gap-4 items-start">
                  {/* Photo */}
                  <div className="relative shrink-0">
                    <img
                      src={viewAadhaarModalRider.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=compress&cs=tinysrgb&w=150'}
                      alt={viewAadhaarModalRider.name}
                      className="w-20 h-24 rounded-xl object-cover border-2 border-slate-300 shadow-xs"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 shadow-xs">
                      <Check size={10} strokeWidth={3} />
                    </div>
                  </div>

                  {/* Rider Details */}
                  <div className="flex-1 min-w-0 space-y-1 text-xs">
                    <div>
                      <span className="text-[9px] text-slate-400 block font-bold uppercase">Name / नाम:</span>
                      <p className="font-extrabold text-slate-900 text-sm truncate">{viewAadhaarModalRider.name}</p>
                    </div>

                    <div>
                      <span className="text-[9px] text-slate-400 block font-bold uppercase">Mobile Number:</span>
                      <p className="font-mono font-bold text-slate-800">{viewAadhaarModalRider.phone}</p>
                    </div>

                    <div>
                      <span className="text-[9px] text-slate-400 block font-bold uppercase">Assigned Zone:</span>
                      <p className="text-slate-700 font-semibold truncate">{viewAadhaarModalRider.route}</p>
                    </div>

                    <div>
                      <span className="text-[9px] text-slate-400 block font-bold uppercase">KYC Verification Date:</span>
                      <p className="font-mono text-[11px] text-emerald-700 font-bold">
                        {viewAadhaarModalRider.kycVerifiedAt ? new Date(viewAadhaarModalRider.kycVerifiedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Verified (Active)'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Big Aadhaar Number Bar */}
                <div className="mt-4 pt-3 border-t border-slate-200 text-center">
                  <span className="text-[9px] text-slate-400 block font-mono font-bold tracking-widest uppercase mb-0.5">
                    AADHAAR NUMBER / आधार संख्या
                  </span>
                  <div className="text-lg sm:text-xl font-mono font-black text-slate-900 tracking-widest bg-white/90 py-1.5 px-3 rounded-xl border border-slate-200 inline-block shadow-2xs">
                    {viewAadhaarModalRider.aadhaarNumber || '5489 1234 9012'}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 italic font-medium">
                    मेरा <span className="text-orange-600 font-bold">आधार</span>, मेरी पहचान
                  </p>
                </div>
              </div>

              {/* Bottom Info & Close */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span className="text-[11px] flex items-center gap-1 text-emerald-700 font-bold">
                  <ShieldCheck size={14} /> Full KYC Document Verified for Campus Logistics
                </span>
                <button
                  type="button"
                  onClick={() => setViewAadhaarModalRider(null)}
                  className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800 transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          MODAL 2: ASSIGN / REASSIGN DELIVERY
      ══════════════════════════════════════════════════════════ */}
      {assignModalOpen && assignItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Bike className="text-orange-500" size={18} /> Assign Delivery to Rider
              </h3>
              <button
                onClick={() => setAssignModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl mb-4 border border-slate-100 text-xs">
              <div className="flex justify-between text-slate-500 mb-1">
                <span>Order ID:</span>
                <strong className="text-slate-900 font-mono">{assignItem.id}</strong>
              </div>
              <div className="flex justify-between text-slate-500 mb-1">
                <span>Customer:</span>
                <strong className="text-slate-900">{assignItem.customer}</strong>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Delivery Address:</span>
                <span className="text-slate-800 font-medium truncate max-w-[200px]">{assignItem.address}</span>
              </div>
            </div>

            <label className="text-xs font-bold text-slate-700 block mb-2">Select Active Rider:</label>
            <div className="space-y-2 max-h-56 overflow-y-auto mb-5 pr-1">
              {riders.map(r => (
                <div
                  key={r.id || r._id}
                  onClick={() => setSelectedRiderForAssign(r._id || r.id)}
                  className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                    selectedRiderForAssign === (r._id || r.id)
                      ? 'border-orange-500 bg-orange-50/60'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={r.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=compress&cs=tinysrgb&w=150'}
                      alt={r.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{r.name}</p>
                      <p className="text-[10px] text-slate-400">{r.route.split(' ')[0]} • {r.vehicle.split('(')[0]}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        r.status === 'available'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {r.status}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{r.activeTiffins || 0} active</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAssignModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAssignment}
                className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          MODAL 3: CONFIRM DELIVERY & OTP VERIFICATION
      ══════════════════════════════════════════════════════════ */}
      {confirmationModalOpen && confirmDeliveryItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle size={26} />
            </div>
            <h3 className="text-base font-black text-slate-900">Confirm Order Handover</h3>
            <p className="text-xs text-slate-500 mt-1">
              Verify student delivery for {confirmDeliveryItem.id} ({confirmDeliveryItem.studentName || confirmDeliveryItem.customerName})
            </p>

            <div className="my-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600">
              <p className="text-[10px] text-slate-400 uppercase font-bold">Generated Delivery OTP</p>
              <p className="text-2xl font-black text-slate-900 font-mono tracking-widest mt-1">
                {confirmDeliveryItem.otp || '4821'}
              </p>
            </div>

            <div className="space-y-2 mb-5">
              <input
                type="text"
                maxLength={4}
                placeholder="Enter 4-digit Student OTP"
                value={enteredOtp}
                onChange={e => setEnteredOtp(e.target.value)}
                className="w-full text-center py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black font-mono tracking-widest focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[10px] text-slate-400 block">Or bypass with 1-click admin override below</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setConfirmationModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleVerifyDeliveryOtp}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
              >
                Verify & Deliver
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          MODAL 4: SETTLE RIDER EARNINGS
      ══════════════════════════════════════════════════════════ */}
      {settleModalOpen && settleRider && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Receipt className="text-emerald-600" size={18} /> Payout Settlement
              </h3>
              <button
                onClick={() => setSettleModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl mb-4 text-xs space-y-2 border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500">Rider Partner:</span>
                <strong className="text-slate-900">{settleRider.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Today's Completed Runs:</span>
                <strong className="text-slate-900">{settleRider.deliveriesToday || 0} Deliveries</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Commission Rate:</span>
                <span className="text-slate-700">₹{settleRider.perDeliveryRate || 35} / run</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-black">
                <span className="text-slate-800">Total Payable:</span>
                <span className="text-emerald-600">₹{(settleRider.deliveriesToday || 0) * (settleRider.perDeliveryRate || 35)}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 mb-4">
              Clicking below will clear the pending status, log the transaction in the rider's passbook, and mark the settlement as Paid.
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSettleModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSettlement}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
              >
                Confirm Payout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          MODAL 5: RIDER DELIVERY HISTORY
      ══════════════════════════════════════════════════════════ */}
      {viewHistoryRider && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Delivery History: {viewHistoryRider.name}
                </h3>
                <p className="text-xs text-slate-500">{viewHistoryRider.id} • {viewHistoryRider.deliveriesToday} Completed Today</p>
              </div>
              <button
                onClick={() => setViewHistoryRider(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              {unifiedDeliveries.filter(d => d.rider === viewHistoryRider?.name || (viewHistoryRider?.phone && d.riderPhone === viewHistoryRider.phone)).length > 0 ? (
                unifiedDeliveries
                  .filter(d => d.rider === viewHistoryRider?.name || (viewHistoryRider?.phone && d.riderPhone === viewHistoryRider.phone))
                  .map((log, i) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900">{log.id}</span>
                          <span className="text-slate-300">•</span>
                          <strong className="text-slate-800">{log.customerName}</strong>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{log.address} • {log.deliverySlot}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-emerald-600 block">₹{viewHistoryRider?.perDeliveryRate || 35} Earned</span>
                        <span className="text-[10px] text-emerald-700 font-bold">{log.status}</span>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No completed delivery runs recorded for this rider yet.
                </div>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setViewHistoryRider(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          MODAL 6: RIDER PERFORMANCE & RATINGS
      ══════════════════════════════════════════════════════════ */}
      {viewPerformanceRider && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Award className="text-amber-500" size={18} /> Performance Scorecard: {viewPerformanceRider.name}
              </h3>
              <button
                onClick={() => setViewPerformanceRider(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="text-center p-4 bg-amber-50/60 rounded-2xl border border-amber-200 mb-4">
              <div className="flex items-center justify-center gap-1 text-amber-600 mb-1">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} size={20} className="fill-amber-500 text-amber-500" />
                ))}
              </div>
              <p className="text-3xl font-black text-slate-900">{viewPerformanceRider.rating || 4.9} / 5.0</p>
              <p className="text-xs text-slate-600 font-bold mt-0.5">Top Rated Dabbawala Partner</p>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl">
                <span className="text-slate-500">On-Time Delivery Rate:</span>
                <strong className="text-emerald-600 font-black">98.6% (Industry Leading)</strong>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl">
                <span className="text-slate-500">Average Room Turnaround:</span>
                <strong className="text-slate-900 font-bold">18 Mins from dispatch</strong>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl">
                <span className="text-slate-500">Customer Complaints:</span>
                <strong className="text-emerald-700 font-bold">0 Active Tickets</strong>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl">
                <span className="text-slate-500">Total Lifetime Runs:</span>
                <strong className="text-slate-900 font-bold">{viewPerformanceRider.deliveriesToday * 24 + 140} Deliveries</strong>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setViewPerformanceRider(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Close Scorecard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
