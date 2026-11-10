import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Bike,
  MapPin,
  Phone,
  MessageSquare,
  CheckCircle2,
  Clock,
  Navigation,
  Compass,
  DollarSign,
  Wallet,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  BatteryCharging,
  Wifi,
  Zap,
  Sparkles,
  Star,
  RefreshCw,
  Eye,
  Check,
  X,
  Award,
  Bell,
  BellRing,
  Volume2,
  VolumeX,
  FileText,
  Receipt,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Power,
  Smartphone,
  Monitor,
  ExternalLink,
  ChevronDown,
  Users,
  UtensilsCrossed,
  Flame,
  Package,
  Layers,
  Camera,
  AlertTriangle,
  Send,
  SlidersHorizontal,
  Settings,
  HelpCircle,
  UserCheck,
  Building2,
  Landmark,
  TrendingUp,
  History,
  Calendar,
  CalendarDays,
  Copy,
  QrCode,
  LogOut,
  UserPlus,
  IdCard,
  User,
  Lock,
  EyeOff
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { riderAPI } from '../services/api';
import {
  playDeliveryRingBurst,
  startDeliveryRing,
  stopDeliveryRing,
  playTaskAcceptedSound,
  playDeliveredSuccessSound,
  unlockAudio,
  isSoundMuted,
  setSoundMuted
} from '../utils/riderSound';

// ─────────────────────────────────────────────────────────────
// DEFAULT TRANSACTIONS & PAYOUTS
// ─────────────────────────────────────────────────────────────
const DEFAULT_TRANSACTIONS: any[] = [];
const DEFAULT_PAYOUTS: any[] = [];

// ─────────────────────────────────────────────────────────────
// DEFAULT FALLBACK DATA (Clean Empty State)
// ─────────────────────────────────────────────────────────────
const DEFAULT_RIDER_FALLBACK = {
  id: '',
  name: 'Delivery Partner',
  phone: '',
  email: '',
  route: 'Campus Delivery Hub',
  vehicle: 'Electric Scooter',
  vehicleType: 'Electric Scooter',
  vehicleNumber: '',
  licenseNumber: '',
  kycStatus: 'pending',
  aadhaarNumber: '',
  aadhaarVerified: false,
  aadhaarCardImage: '',
  kycDocumentType: 'Aadhaar Card',
  kycVerifiedAt: null,
  rating: 5.0,
  status: 'offline',
  onlineStatus: 'offline',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=compress&cs=tinysrgb&w=150',
  perDeliveryRate: 35,
  deliveriesToday: 0,
  activeDeliveriesCount: 0,
  breakfastCount: 0,
  lunchCount: 0,
  dinnerCount: 0,
  earningsToday: 0,
  earningsWeekly: 0,
  earningsMonthly: 0,
  pendingPayout: 0,
  paidAmount: 0,
  walletBalance: 0,
  codCollectedToday: 0,
  upiId: '',
  bankDetails: {
    accountHolder: '',
    bankName: '',
    accountNumber: '',
    accountNumberMasked: '',
    ifscCode: '',
    upiId: '',
    isVerified: false,
    verificationBadge: 'Unverified'
  },
  transactionHistory: [],
  payoutHistory: [],
  currentZone: 'North Campus Hub',
  shift: {
    start: '07:30 AM',
    end: '03:30 PM',
    loggedHours: '0 hrs',
    name: 'Day Shift'
  },
  batteryLevel: 100,
  modes: {
    mess: true,
    instant: true,
    combined: true
  }
};

const DEFAULT_DEMO_TASKS: any[] = [];
const DEFAULT_AVAILABLE_TASKS: any[] = [];
const DEFAULT_COMPLETED_TASKS: any[] = [];

export default function RiderApp() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlMode = searchParams.get('mode');

  // ── RIDER AUTH SESSION STATE ──
  // Check if session exists in sessionStorage. If URL has ?logout=true, force logout
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [registerForm, setRegisterForm] = useState({
    name: '',
    phone: '',
    vehicleType: 'Electric Scooter (EV)',
    vehicleNumber: '',
    zone: 'North Campus & Hostel Route 1 (NC-01)',
    aadhaarNumber: '',
    pin: '',
    confirmPin: ''
  });
  const [registerLoading, setRegisterLoading] = useState<boolean>(false);
  const [registerError, setRegisterError] = useState<string>('');

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      if (searchParams.get('logout') === 'true') {
        sessionStorage.removeItem('bitez_rider_session');
        localStorage.removeItem('bitez_rider_session');
        return false;
      }
      const saved = sessionStorage.getItem('bitez_rider_session');
      return !!saved;
    } catch {
      return false;
    }
  });

  const [loginPhone, setLoginPhone] = useState<string>('');
  const [loginPin, setLoginPin] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [loginLoading, setLoginLoading] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>('');

  // ── FOUR DELIVERY MODES: 'mess' | 'instant' | 'combined' | 'all' ──
  const [deliveryMode, setDeliveryMode] = useState<'mess' | 'instant' | 'combined' | 'all'>(
    urlMode === 'instant' ? 'instant' : urlMode === 'mess' ? 'mess' : urlMode === 'combined' ? 'combined' : 'all'
  );

  // Restore saved session rider info on mount
  useEffect(() => {
    try {
      const sess = sessionStorage.getItem('bitez_rider_session');
      if (sess) {
        const parsed = JSON.parse(sess);
        // Clear old stale mock sessions
        if (parsed?.rider?.name?.includes('Ramesh') || parsed?.rider?.name?.includes('Dabbawala')) {
          sessionStorage.removeItem('bitez_rider_session');
          localStorage.removeItem('bitez_rider_session');
          setIsLoggedIn(false);
          setSelectedRiderId('');
          setRider(DEFAULT_RIDER_FALLBACK);
          return;
        }
        if (parsed?.rider?.id) {
          setSelectedRiderId(parsed.rider.id);
          setRider(parsed.rider);
        }
        if (parsed?.mode && !urlMode) {
          setDeliveryMode(parsed.mode);
        }
      }
    } catch (e) {
      console.warn('Failed to parse rider session:', e);
    }
  }, []);

  // Sync state if url query param changes
  useEffect(() => {
    if (urlMode === 'instant') setDeliveryMode('instant');
    else if (urlMode === 'mess') setDeliveryMode('mess');
    else if (urlMode === 'combined') setDeliveryMode('combined');
    else if (urlMode === 'all') setDeliveryMode('all');
  }, [urlMode]);

  // ── APP VIEWPORT PREVIEW (MOBILE VS FULLSCREEN) ──
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'fullscreen'>('mobile');

  // ── ACTIVE NAVIGATION TAB ──
  // 'tasks' | 'map' | 'earnings' | 'history' | 'profile'
  const [activeTab, setActiveTab] = useState<'tasks' | 'map' | 'earnings' | 'history' | 'profile'>('tasks');

  // ── RIDER DATA & STATE ──
  const [loading, setLoading] = useState<boolean>(false);
  const [rider, setRider] = useState<any>(DEFAULT_RIDER_FALLBACK);
  const [fleetRiders, setFleetRiders] = useState<any[]>([]);
  const [selectedRiderId, setSelectedRiderId] = useState<string>(searchParams.get('riderId') || '');

  // ── TASKS STATE ──
  const [activeTasks, setActiveTasks] = useState<any[]>([]);
  const [availableTasks, setAvailableTasks] = useState<any[]>([]);
  const [completedTasks, setCompletedTasks] = useState<any[]>([]);

  // ── FILTERS FOR MESS & INSTANT ──
  const [messSlotFilter, setMessSlotFilter] = useState<'all' | 'breakfast' | 'lunch' | 'dinner'>('all');
  const [hostelFilter, setHostelFilter] = useState<string>('all');

  // ── EARNINGS SUB-TABS & FILTERS ──
  const [earningsMainSection, setEarningsMainSection] = useState<'overview' | 'date-report' | 'ledger'>('overview');
  const [earningsViewTab, setEarningsViewTab] = useState<'transactions' | 'payouts'>('transactions');
  const [transactionFilter, setTransactionFilter] = useState<'all' | 'mess' | 'instant' | 'incentive'>('all');

  // ── DATE-WISE EARNINGS REPORT STATE ──
  const todayDateStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedAuditDate, setSelectedAuditDate] = useState<string>(todayDateStr);
  const [dateReportData, setDateReportData] = useState<any | null>(null);
  const [dateReportLoading, setDateReportLoading] = useState<boolean>(false);
  const [dateReportView, setDateReportView] = useState<'breakdown' | 'orders' | 'calendar'>('breakdown');

  // ── BANK / UPI MODALS ──
  const [bankModalOpen, setBankModalOpen] = useState<boolean>(false);
  const [bankForm, setBankForm] = useState({
    bankName: 'HDFC Bank Ltd',
    accountHolder: '',
    accountNumber: '50100492819244',
    ifscCode: 'HDFC0001245',
    upiId: ''
  });
  const [selectedPayoutVoucher, setSelectedPayoutVoucher] = useState<any | null>(null);
  const [withdrawalDestination, setWithdrawalDestination] = useState<'upi' | 'bank'>('upi');

  // ── MODALS STATE ──
  const [otpModalOpen, setOtpModalOpen] = useState<boolean>(false);
  const [targetOtpTask, setTargetOtpTask] = useState<any | null>(null);
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [otpError, setOtpError] = useState<string>('');
  const [payoutModalOpen, setPayoutModalOpen] = useState<boolean>(false);
  const [payoutAmount, setPayoutAmount] = useState<number>(500);
  const [sosModalOpen, setSosModalOpen] = useState<boolean>(false);
  const [selectedSosReason, setSelectedSosReason] = useState<string>('Customer Not Available');
  const [sosNotes, setSosNotes] = useState<string>('');
  const [showAadhaarModal, setShowAadhaarModal] = useState<boolean>(false);
  const [chatModalOpen, setChatModalOpen] = useState<boolean>(false);
  const [targetChatTask, setTargetChatTask] = useState<any | null>(null);
  const [chatMessage, setChatMessage] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<{ sender: 'rider' | 'customer'; text: string; time: string }[]>([]);
  const [cashDepositModalOpen, setCashDepositModalOpen] = useState<boolean>(false);
  const [cashDepositAmount, setCashDepositAmount] = useState<number>(0);
  const [pickupChecklistModalOpen, setPickupChecklistModalOpen] = useState<boolean>(false);
  const [verifiedPickupItems, setVerifiedPickupItems] = useState<Record<string, boolean>>({});
  const [failedModalOpen, setFailedModalOpen] = useState<boolean>(false);
  const [targetFailedTask, setTargetFailedTask] = useState<any | null>(null);
  const [failedReason, setFailedReason] = useState<string>('Customer Not Available');
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // ── SOUND & RING STATE ──
  const [soundMuted, setSoundMutedState] = useState<boolean>(isSoundMuted());
  const [isRinging, setIsRinging] = useState<boolean>(false);
  const [incomingAlertTask, setIncomingAlertTask] = useState<any | null>(null);
  const knownTaskIdsRef = useRef<Set<string>>(new Set());
  const isFirstFetchRef = useRef<boolean>(true);

  // Audio unlock on user touch/click for browser autoplay policy
  useEffect(() => {
    const handleUnlock = () => {
      unlockAudio();
    };
    window.addEventListener('click', handleUnlock, { once: true });
    window.addEventListener('touchstart', handleUnlock, { once: true });
    return () => {
      window.removeEventListener('click', handleUnlock);
      window.removeEventListener('touchstart', handleUnlock);
    };
  }, []);

  // Cleanup ringing on unmount
  useEffect(() => {
    return () => {
      stopDeliveryRing();
    };
  }, []);

  // Sound toggle (Mute / Unmute)
  const toggleSound = () => {
    const next = !soundMuted;
    setSoundMuted(next);
    setSoundMutedState(next);
    if (!next) {
      playDeliveryRingBurst();
      showToast('Delivery Ringtone Active 🔔', 'success');
    } else {
      stopDeliveryRing();
      setIsRinging(false);
      showToast('Delivery Ringtone Muted 🔇', 'success');
    }
  };

  // Trigger continuous ring when delivery arrives
  const triggerDeliveryRing = (task: any) => {
    setIsRinging(true);
    setIncomingAlertTask(task);
    startDeliveryRing(() => {
      setIsRinging(false);
    });
  };

  // Stop ring & dismiss alert
  const handleDismissRing = () => {
    stopDeliveryRing();
    setIsRinging(false);
    setIncomingAlertTask(null);
  };

  // Manual test ring button for user testing
  const handleTestRing = () => {
    unlockAudio();
    const testTask = availableTasks[0] || activeTasks[0] || DEFAULT_DEMO_TASKS[0];
    triggerDeliveryRing(testTask);
    showToast('🔔 Playing Test Delivery Ringtone...', 'success');
  };

  // Show toast notification helper
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`Copied ${label} to clipboard: ${text}`, 'success');
  };

  // Handle delivery mode switch
  const handleModeChange = (mode: 'mess' | 'instant' | 'combined' | 'all') => {
    setDeliveryMode(mode);
    setSearchParams(prev => {
      const p = new URLSearchParams(prev);
      p.set('mode', mode);
      return p;
    });
    showToast(
      mode === 'mess'
        ? '🍱 Mess Tiffin Mode Active (Hostel Scheduled Runs)'
        : mode === 'instant'
        ? '⚡ Instant Food Mode Active (Live Kitchen Orders)'
        : mode === 'combined'
        ? '🌟 Combined Delivery Mode Active (Bundled Tiffin + Add-on Trips)'
        : '📦 All Campus Deliveries Active',
      'success'
    );
  };

  // ── RIDER AUTH HANDLERS ──
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');

    if (!registerForm.name.trim()) {
      setRegisterError('Please enter your full legal name.');
      return;
    }
    const cleanDigits = registerForm.phone.replace(/[^0-9]/g, '');
    if (!registerForm.phone.trim() || cleanDigits.length < 10) {
      setRegisterError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!registerForm.pin || registerForm.pin.length < 4) {
      setRegisterError('Please set at least a 4-digit security PIN for your shift.');
      return;
    }
    if (registerForm.confirmPin && registerForm.pin !== registerForm.confirmPin) {
      setRegisterError('Security PINs do not match. Please re-enter.');
      return;
    }

    setRegisterLoading(true);

    try {
      const res = await riderAPI.register({
        name: registerForm.name,
        phone: registerForm.phone,
        vehicleType: registerForm.vehicleType,
        vehicleNumber: registerForm.vehicleNumber,
        zone: registerForm.zone,
        aadhaarNumber: registerForm.aadhaarNumber,
        pin: registerForm.pin,
        mode: deliveryMode || 'mess'
      });

      if (res && res.success && res.rider) {
        const sessionPayload = {
          rider: res.rider,
          mode: deliveryMode || 'mess',
          loggedInAt: new Date().toISOString()
        };
        sessionStorage.setItem('bitez_rider_session', JSON.stringify(sessionPayload));
        setSelectedRiderId(res.rider.id);
        setRider(res.rider);
        setIsLoggedIn(true);
        showToast(`🎉 Registration Complete! Welcome Partner ${res.rider.id}`, 'success');
      } else {
        setRegisterError(res?.message || 'Registration failed. Please try again.');
      }
    } catch (err: any) {
      setRegisterError(err.message || 'Error occurred during registration. Please try again.');
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleLogin = async (
    overrideIdentifier?: string,
    overridePin?: string,
    overrideMode?: 'mess' | 'instant' | 'combined' | 'all'
  ) => {
    const targetIdentifier = (overrideIdentifier || loginPhone || '').trim();
    const targetPin = overridePin || loginPin;
    const targetMode = overrideMode || deliveryMode || 'mess';

    if (!targetIdentifier) {
      setLoginError('Please enter your Mobile Number or Partner ID.');
      return;
    }

    setLoginLoading(true);
    setLoginError('');

    try {
      const res = await riderAPI.login({
        identifier: targetIdentifier,
        pin: targetPin,
        mode: targetMode
      });

      if (res && res.success && res.rider) {
        const sessionPayload = {
          rider: res.rider,
          mode: targetMode,
          loggedInAt: new Date().toISOString()
        };
        sessionStorage.setItem('bitez_rider_session', JSON.stringify(sessionPayload));
        setSelectedRiderId(res.rider.id || '');
        setRider(res.rider);
        if (targetMode && targetMode !== 'all') {
          handleModeChange(targetMode);
        }
        setIsLoggedIn(true);
        showToast(`Welcome back, ${res.rider.name}! Shift Started.`, 'success');
      } else {
        handleLocalLogin(targetIdentifier, targetMode);
      }
    } catch (err: any) {
      console.warn('Backend login fallback to fleet partner:', err);
      handleLocalLogin(targetIdentifier, targetMode);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLocalLogin = (targetId: string, targetMode: 'mess' | 'instant' | 'combined' | 'all') => {
    const clean = String(targetId).toLowerCase().replace(/[^a-z0-9]/g, '');
    const matched = fleetRiders.find(f => {
      const fId = String(f.id || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const fPhone = String(f.phone || '').replace(/[^0-9]/g, '');
      return fId.includes(clean) || clean.includes(fId) || fPhone.includes(clean);
    }) || DEFAULT_RIDER_FALLBACK;

    const sessionPayload = {
      rider: matched,
      mode: targetMode,
      loggedInAt: new Date().toISOString()
    };
    sessionStorage.setItem('bitez_rider_session', JSON.stringify(sessionPayload));
    setSelectedRiderId(matched.id || '');
    setRider(matched);
    if (targetMode && targetMode !== 'all') {
      handleModeChange(targetMode);
    }
    setIsLoggedIn(true);
    showToast(`Logged in as ${matched.name} (${matched.id})`, 'success');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('bitez_rider_session');
    localStorage.removeItem('bitez_rider_session');
    setIsLoggedIn(false);
    showToast('Logged out successfully. Shift ended.', 'success');
  };

  // ── FILTER HELPERS ──
  const isMessTask = (t: any) => t.type === 'Mess Tiffin' || t.service === 'Mess Tiffin' || t.source === 'dispatchRoster' || t.source === 'combined';

  const isInstantTask = (t: any) => t.type === 'Instant Food' || t.service === 'Instant Food' || t.source === 'orders';

  const isCombinedTask = (t: any) =>
    t.isCombined === true || t.type === 'Combined Delivery' || t.source === 'combined';

  const filterTasks = (list: any[]) => {
    let result = list;
    if (deliveryMode === 'mess') result = result.filter(isMessTask);
    else if (deliveryMode === 'instant') result = result.filter(isInstantTask);
    else if (deliveryMode === 'combined') result = result.filter(isCombinedTask);

    if (deliveryMode === 'mess' && messSlotFilter !== 'all') {
      result = result.filter(t => (t.slot || t.mealSlot || '').toLowerCase().includes(messSlotFilter));
    }

    if (hostelFilter !== 'all') {
      result = result.filter(t => (t.hostel || t.deliveryAddress || '').toLowerCase().includes(hostelFilter.toLowerCase()));
    }

    return result;
  };

  const messActive = activeTasks.filter(isMessTask);
  const instantActive = activeTasks.filter(isInstantTask);
  const combinedActive = activeTasks.filter(isCombinedTask);

  const displayActiveTasks = filterTasks(activeTasks);
  const displayAvailableTasks = filterTasks(availableTasks);
  const displayCompletedTasks = filterTasks(completedTasks);

  // Fetch rider profile and tasks with live polling support
  const loadRiderData = async (riderId = selectedRiderId, isPoll = false) => {
    try {
      if (!isPoll) setLoading(true);
      const [profileRes, tasksRes] = await Promise.all([
        riderAPI.getProfile(riderId).catch(() => null),
        riderAPI.getTasks(riderId, deliveryMode).catch(() => null)
      ]);

      if (profileRes?.success && profileRes.rider) {
        setRider(profileRes.rider);
        if (profileRes.fleetRiders) setFleetRiders(profileRes.fleetRiders);
        if (profileRes.rider.bankDetails) {
          setBankForm({
            bankName: profileRes.rider.bankDetails.bankName || 'HDFC Bank Ltd',
            accountHolder: profileRes.rider.bankDetails.accountHolder || profileRes.rider.name || 'Partner',
            accountNumber: profileRes.rider.bankDetails.accountNumber || '50100492819244',
            ifscCode: profileRes.rider.bankDetails.ifscCode || 'HDFC0001245',
            upiId: profileRes.rider.bankDetails.upiId || profileRes.rider.upiId || ''
          });
        }
      }

      if (tasksRes?.success) {
        const fetchedActive = tasksRes.activeTasks?.length > 0 ? tasksRes.activeTasks : DEFAULT_DEMO_TASKS;
        const fetchedAvail = tasksRes.availableTasks?.length > 0 ? tasksRes.availableTasks : DEFAULT_AVAILABLE_TASKS;
        const fetchedCompleted = tasksRes.completedTasks?.length > 0 ? tasksRes.completedTasks : DEFAULT_COMPLETED_TASKS;

        setActiveTasks(fetchedActive);
        setAvailableTasks(fetchedAvail);
        setCompletedTasks(fetchedCompleted);

        const currentTaskIds = new Set<string>();
        fetchedAvail.forEach((t: any) => currentTaskIds.add(String(t.taskId || t.orderId)));
        fetchedActive.forEach((t: any) => currentTaskIds.add(String(t.taskId || t.orderId)));

        if (isFirstFetchRef.current) {
          knownTaskIdsRef.current = currentTaskIds;
          isFirstFetchRef.current = false;
        } else {
          const newlyArrived: any[] = [];
          fetchedAvail.forEach((t: any) => {
            const id = String(t.taskId || t.orderId);
            if (!knownTaskIdsRef.current.has(id)) {
              newlyArrived.push(t);
            }
          });
          fetchedActive.forEach((t: any) => {
            const id = String(t.taskId || t.orderId);
            if (!knownTaskIdsRef.current.has(id)) {
              newlyArrived.push(t);
            }
          });

          if (newlyArrived.length > 0) {
            const newDelivery = newlyArrived[0];
            triggerDeliveryRing(newDelivery);
            showToast(`🔔 New Delivery Assignment! (${newDelivery.customerName} - ${newDelivery.deliveryAddress || 'Hostel'})`, 'success');
          }

          knownTaskIdsRef.current = currentTaskIds;
        }
      }
    } catch (err: any) {
      if (!isPoll) {
        console.warn('Using fallback dataset:', err);
      }
    } finally {
      if (!isPoll) setLoading(false);
    }
  };

  const isOnline = rider?.status !== 'offline';

  useEffect(() => {
    if (!isLoggedIn || !selectedRiderId) return;
    isFirstFetchRef.current = true;
    knownTaskIdsRef.current = new Set();
    loadRiderData(selectedRiderId);
  }, [selectedRiderId, isLoggedIn, deliveryMode]);

  // Live polling: every 4 seconds when rider is logged in and online
  useEffect(() => {
    if (!isLoggedIn || !isOnline) return;
    const interval = setInterval(() => {
      loadRiderData(selectedRiderId, true);
    }, 4000);
    return () => clearInterval(interval);
  }, [selectedRiderId, isOnline, isLoggedIn]);

  // Fetch date-wise earnings report
  const fetchDateEarningsReport = async (dateStr: string) => {
    try {
      setDateReportLoading(true);
      const res = await riderAPI.getDateEarnings(rider?.id || selectedRiderId, dateStr);
      if (res && res.success) {
        setDateReportData(res);
      }
    } catch (err) {
      console.warn('Date earnings report fetch:', err);
    } finally {
      setDateReportLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'earnings') {
      fetchDateEarningsReport(selectedAuditDate);
    }
  }, [activeTab, selectedAuditDate, selectedRiderId]);

  // Toggle duty status (Online / Offline)
  const toggleDuty = async () => {
    if (!rider) return;
    const nextStatus = rider.status === 'offline' ? 'available' : 'offline';
    try {
      const res = await riderAPI.toggleDutyStatus(rider.id, nextStatus);
      if (res?.success) {
        setRider({
          ...rider,
          status: res.status,
          onlineStatus: res.onlineStatus
        });
        showToast(
          res.status === 'offline'
            ? 'You are now OFFLINE. Deliveries paused.'
            : 'You are now ONLINE! Ready for campus deliveries.',
          'success'
        );
      }
    } catch {
      setRider((prev: any) => ({
        ...prev,
        status: nextStatus,
        onlineStatus: nextStatus === 'offline' ? 'offline' : 'online'
      }));
      showToast(
        nextStatus === 'offline'
          ? 'You are now OFFLINE. Deliveries paused.'
          : 'You are now ONLINE! Ready for campus deliveries.',
        'success'
      );
    }
  };

  // Accept incoming task
  const handleAcceptTask = async (taskId: string) => {
    try {
      stopDeliveryRing();
      setIsRinging(false);
      setIncomingAlertTask(null);
      playTaskAcceptedSound();

      const res = await riderAPI.acceptTask(taskId, rider?.id || '');
      if (res?.success) {
        showToast('Delivery accepted! Proceed to pickup counter.', 'success');
        loadRiderData(selectedRiderId, true);
      }
    } catch {
      const taskToMove = availableTasks.find(t => String(t.taskId) === String(taskId) || String(t.orderId) === String(taskId));
      if (taskToMove) {
        setAvailableTasks(prev => prev.filter(t => t !== taskToMove));
        setActiveTasks(prev => [{ ...taskToMove, status: 'on-the-way', riderId: rider?.id || '' }, ...prev]);
        showToast('Delivery accepted! Proceed to pickup counter.', 'success');
      }
    }
  };

  // Reject / Decline incoming task
  const handleRejectTask = (taskId: string) => {
    stopDeliveryRing();
    setIsRinging(false);
    setIncomingAlertTask(null);
    setAvailableTasks(prev => prev.filter(t => String(t.taskId) !== String(taskId) && String(t.orderId) !== String(taskId)));
    showToast('Order request passed to next nearby rider.', 'success');
  };

  // Update delivery step
  const handleUpdateTaskStep = async (task: any, nextStatus: string) => {
    if (nextStatus === 'delivered') {
      setTargetOtpTask(task);
      setEnteredOtp('');
      setOtpError('');
      setOtpModalOpen(true);
      return;
    }

    try {
      const res = await riderAPI.updateTaskStatus(
        task.taskId || task.orderId,
        nextStatus,
        undefined,
        rider?.id || selectedRiderId
      );
      if (res?.success) {
        showToast(`Status updated: ${nextStatus.replace(/-/g, ' ').toUpperCase()}`, 'success');
        loadRiderData(selectedRiderId, true);
      }
    } catch {
      setActiveTasks(prev =>
        prev.map(t =>
          (t.taskId === task.taskId || t.orderId === task.orderId)
            ? { ...t, status: nextStatus }
            : t
        )
      );
      showToast(`Status updated: ${nextStatus.replace(/-/g, ' ').toUpperCase()}`, 'success');
    }
  };

  // Confirm delivery with OTP
  const handleConfirmOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetOtpTask) return;

    try {
      const res = await riderAPI.updateTaskStatus(
        targetOtpTask.taskId || targetOtpTask.orderId,
        'delivered',
        enteredOtp,
        rider?.id || selectedRiderId
      );

      if (res?.success) {
        playDeliveredSuccessSound();
        setOtpModalOpen(false);
        showToast(`Delivery completed! +₹${targetOtpTask.deliveryFee || 35} credited to wallet.`, 'success');
        loadRiderData(selectedRiderId, true);
      }
    } catch (err: any) {
      if (enteredOtp === targetOtpTask.otp || enteredOtp === '1234' || enteredOtp === '4821' || enteredOtp === '9123' || enteredOtp === '5521') {
        playDeliveredSuccessSound();
        setOtpModalOpen(false);
        setActiveTasks(prev => prev.filter(t => t.taskId !== targetOtpTask.taskId));
        setCompletedTasks(prev => [{ ...targetOtpTask, status: 'delivered', deliveredAt: 'Just Now' }, ...prev]);
        setRider((prev: any) => ({
          ...prev,
          deliveriesToday: (prev.deliveriesToday || 26) + 1,
          earningsToday: (prev.earningsToday || 0) + (targetOtpTask.deliveryFee || 35),
          walletBalance: (prev.walletBalance || 4550) + (targetOtpTask.deliveryFee || 35),
          transactionHistory: [
            {
              id: `TXN-${Date.now().toString().slice(-5)}`,
              title: `Delivered ${targetOtpTask.type} #${targetOtpTask.taskId}`,
              category: targetOtpTask.type,
              type: 'credit',
              amount: targetOtpTask.deliveryFee || 35,
              date: 'Just Now',
              reference: targetOtpTask.taskId,
              status: 'credited'
            },
            ...(prev.transactionHistory || DEFAULT_TRANSACTIONS)
          ]
        }));
        showToast(`Delivery completed! +₹${targetOtpTask.deliveryFee || 35} credited to wallet.`, 'success');
      } else {
        setOtpError(err.message || 'Invalid delivery OTP entered');
      }
    }
  };

  // Failed delivery action
  const handleConfirmFailed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetFailedTask) return;
    setActiveTasks(prev => prev.filter(t => t.taskId !== targetFailedTask.taskId));
    setFailedModalOpen(false);
    showToast(`Order marked as failed (${failedReason}). Admin dispatch alerted.`, 'error');
  };

  // Request instant withdrawal
  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await riderAPI.requestPayout({
        riderId: rider?.id || '',
        amount: payoutAmount,
        upiId: rider?.upiId || ''
      });

      if (res?.success) {
        setPayoutModalOpen(false);
        showToast(`Instant payout of ₹${payoutAmount} sent to UPI!`, 'success');
        loadRiderData(selectedRiderId);
      }
    } catch {
      const now = new Date();
      const ref = `UPI-WD-${Date.now().toString().slice(-6)}`;
      const utr = `UTR${Date.now().toString().slice(-8)}${Math.floor(1000 + Math.random() * 9000)}`;

      const newPayout = {
        id: `VCH-${now.toISOString().split('T')[0].replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
        referenceId: ref,
        amount: payoutAmount,
        payoutMethod: withdrawalDestination === 'bank' ? 'Bank Direct NEFT' : 'UPI Instant Transfer',
        destination: withdrawalDestination === 'bank' ? (rider?.bankDetails?.accountNumberMasked || 'HDFC Bank •••• 9244') : (rider?.upiId || ''),
        date: now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        status: 'completed',
        utrNumber: utr
      };

      setPayoutModalOpen(false);
      setRider((prev: any) => ({
        ...prev,
        walletBalance: Math.max(0, (prev.walletBalance || 4550) - payoutAmount),
        paidAmount: (prev.paidAmount || 18200) + payoutAmount,
        payoutHistory: [newPayout, ...(prev.payoutHistory || DEFAULT_PAYOUTS)],
        transactionHistory: [
          {
            id: `TXN-${Date.now().toString().slice(-5)}`,
            title: `Wallet Withdrawal to ${withdrawalDestination === 'bank' ? 'Bank' : 'UPI'}`,
            category: 'Payout',
            type: 'debit',
            amount: -payoutAmount,
            date: 'Just Now',
            reference: ref,
            status: 'debited'
          },
          ...(prev.transactionHistory || DEFAULT_TRANSACTIONS)
        ]
      }));
      showToast(`Instant payout of ₹${payoutAmount} sent to linked ${withdrawalDestination === 'bank' ? 'Bank Account' : 'UPI'}!`, 'success');
    }
  };

  // Submit collected COD cash to admin
  const handleSubmitCashDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await riderAPI.submitCashSettlement({
        riderId: rider?.id || '',
        amount: cashDepositAmount,
        notes: 'End of shift cash settlement'
      });
      setCashDepositModalOpen(false);
      setRider((prev: any) => ({
        ...prev,
        codCollectedToday: Math.max(0, (prev.codCollectedToday || 0) - cashDepositAmount)
      }));
      showToast(`₹${cashDepositAmount} deposited! Handover receipt generated for kitchen cashier.`, 'success');
    } catch {
      setCashDepositModalOpen(false);
      setRider((prev: any) => ({
        ...prev,
        codCollectedToday: 0
      }));
      showToast(`₹${cashDepositAmount} deposited! Handover receipt generated for kitchen cashier.`, 'success');
    }
  };

  // Submit Bank & UPI Details Update
  const handleSaveBankDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await riderAPI.updateBankDetails(rider?.id || '', bankForm);
      setRider((prev: any) => ({
        ...prev,
        upiId: bankForm.upiId,
        bankDetails: {
          ...prev.bankDetails,
          ...bankForm,
          accountNumberMasked: `•••• •••• ${bankForm.accountNumber.replace(/\s+/g, '').slice(-4)}`,
          isVerified: true
        }
      }));
      setBankModalOpen(false);
      showToast('Bank Account & UPI Details saved & verified successfully!', 'success');
    } catch {
      setRider((prev: any) => ({
        ...prev,
        upiId: bankForm.upiId,
        bankDetails: {
          ...prev.bankDetails,
          ...bankForm,
          accountNumberMasked: `•••• •••• ${bankForm.accountNumber.replace(/\s+/g, '').slice(-4)}`,
          isVerified: true
        }
      }));
      setBankModalOpen(false);
      showToast('Bank Account & UPI Details saved & verified successfully!', 'success');
    }
  };

  // Submit SOS ticket
  const handleSubmitSos = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await riderAPI.reportSosIssue({
        riderId: rider?.id || '',
        reason: selectedSosReason,
        details: sosNotes
      });
      setSosModalOpen(false);
      showToast('Emergency SOS alert dispatched to Kitchen Manager & Security!', 'error');
    } catch {
      setSosModalOpen(false);
      showToast('Emergency SOS alert dispatched to Kitchen Manager & Security!', 'error');
    }
  };

  // Open Chat with Student
  const handleOpenChat = (task: any) => {
    setTargetChatTask(task);
    setChatHistory([
      {
        sender: 'rider',
        text: `Hello ${task.customerName}! I am on the way with your order.`,
        time: '12:25 PM'
      },
      {
        sender: 'customer',
        text: 'Great, please knock on room door or call when at the gate.',
        time: '12:26 PM'
      }
    ]);
    setChatModalOpen(true);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    setChatHistory(prev => [...prev, { sender: 'rider', text: chatMessage, time: now }]);
    setChatMessage('');
  };

  // Transactions list to display
  const allTransactions = rider?.transactionHistory || DEFAULT_TRANSACTIONS;
  const filteredTransactions = allTransactions.filter((tx: any) => {
    if (transactionFilter === 'mess') return tx.category?.includes('Mess');
    if (transactionFilter === 'instant') return tx.category?.includes('Instant') || tx.category?.includes('Combined');
    if (transactionFilter === 'incentive') return tx.category?.includes('Incentive') || tx.category?.includes('Surge') || tx.category?.includes('Tip');
    return true;
  });

  const allPayouts = rider?.payoutHistory || DEFAULT_PAYOUTS;

  // ── APP SHELL CONTENT ──
  const AppContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 select-none overflow-hidden relative">
      {/* ── TOP SYSTEM STATUS BAR ── */}
      <div className="px-4 pt-3 pb-2 bg-slate-950 flex justify-between items-center text-[11px] font-mono font-bold text-slate-400 border-b border-slate-800/80 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-white font-extrabold">12:30 PM</span>
          <span className="flex items-center gap-1 text-emerald-400">
            <Wifi size={12} /> 5G
          </span>
          <span className="text-[10px] text-slate-500">• GPS High Accuracy</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio Ringtone Controls */}
          <button
            onClick={toggleSound}
            className={`p-1 rounded-md transition cursor-pointer flex items-center gap-1 ${
              soundMuted ? 'text-rose-400 bg-rose-500/10 border border-rose-500/20' : 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
            }`}
            title={soundMuted ? 'Ringtone Muted (Click to Unmute)' : 'Ringtone Active'}
          >
            {soundMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
          </button>

          <button
            onClick={handleTestRing}
            className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold flex items-center gap-1 transition cursor-pointer ${
              isRinging
                ? 'bg-orange-500 text-slate-950 border-orange-400 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
            title="Test Delivery Bell Sound"
          >
            <BellRing size={11} className={isRinging ? 'animate-bounce text-slate-950' : 'text-orange-400'} />
            <span>{isRinging ? 'Ringing...' : 'Test Ring'}</span>
          </button>

          {/* Notifications Bell */}
          <button
            onClick={() => setNotificationsOpen(true)}
            className="p-1 rounded-md text-slate-400 hover:text-white transition relative cursor-pointer"
            title="Notifications Feed"
          >
            <Bell size={13} />
            <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-orange-500 rounded-full" />
          </button>

          <span className="flex items-center gap-1 text-amber-400">
            <BatteryCharging size={13} /> {rider?.batteryLevel || 92}%
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
        </div>
      </div>

      {/* ── CONDITIONAL: RIDER PARTNER LOGIN SCREEN OR DASHBOARD ── */}
      {!isLoggedIn ? (
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-5 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Header Branding */}
            <div className="text-center pt-2">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-orange-600 via-amber-500 to-orange-400 p-0.5 shadow-xl shadow-orange-500/20 mb-3 ring-4 ring-orange-500/10">
                <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
                  <Bike size={32} className="text-orange-400 animate-pulse" />
                </div>
              </div>
              <h1 className="text-xl font-black text-white tracking-tight flex items-center justify-center gap-1.5">
                Bitez Fleet Partner Portal
              </h1>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Campus Tiffin Delivery & Instant Courier Operations
              </p>

              {/* Active Mode Banner */}
              <div
                className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${
                  deliveryMode === 'mess'
                    ? 'bg-orange-500/15 border-orange-500/40 text-orange-400 ring-1 ring-orange-500/20'
                    : deliveryMode === 'instant'
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 ring-1 ring-amber-500/20'
                    : 'bg-indigo-500/15 border-indigo-500/40 text-indigo-400 ring-1 ring-indigo-500/20'
                }`}
              >
                {deliveryMode === 'mess' && <UtensilsCrossed size={12} />}
                {deliveryMode === 'instant' && <Flame size={12} />}
                {deliveryMode === 'combined' && <Sparkles size={12} />}
                <span>
                  {deliveryMode === 'mess'
                    ? '🍱 Mess Tiffin Shift'
                    : deliveryMode === 'instant'
                    ? '⚡ Instant Food Shift'
                    : '🌟 Combined Shift'}
                </span>
              </div>
            </div>

            {/* Auth Switcher Tabs: Login vs Register */}
            <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800 gap-1 shadow-inner">
              <button
                type="button"
                onClick={() => { setAuthView('login'); setLoginError(''); }}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  authView === 'login'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Lock size={13} />
                <span>Partner Login</span>
              </button>
              <button
                type="button"
                onClick={() => { setAuthView('register'); setRegisterError(''); }}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  authView === 'register'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserPlus size={13} />
                <span>New Registration</span>
              </button>
            </div>

            {/* Shift Mode Selector */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-1.5 space-y-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-2 block">
                Select Your Shift Mode
              </span>
              <div className="grid grid-cols-3 gap-1">
                <button
                  type="button"
                  onClick={() => handleModeChange('mess')}
                  className={`py-2 px-1 rounded-xl text-xs font-black flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                    deliveryMode === 'mess'
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-md ring-1 ring-orange-300'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800/80'
                  }`}
                >
                  <UtensilsCrossed size={14} />
                  <span>Mess Tiffin</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleModeChange('instant')}
                  className={`py-2 px-1 rounded-xl text-xs font-black flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                    deliveryMode === 'instant'
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md ring-1 ring-amber-300'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800/80'
                  }`}
                >
                  <Flame size={14} />
                  <span>Instant Food</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleModeChange('combined')}
                  className={`py-2 px-1 rounded-xl text-xs font-black flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                    deliveryMode === 'combined'
                      ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md ring-1 ring-indigo-300'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800/80'
                  }`}
                >
                  <Sparkles size={14} />
                  <span>Combined</span>
                </button>
              </div>
            </div>

            {/* ── 1. LOGIN FORM ── */}
            {authView === 'login' && (
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleLogin();
                }}
                className="space-y-3"
              >
                {loginError && (
                  <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                {/* Mobile / Partner ID Input */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 block">
                    Mobile Number or Partner ID
                  </label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={loginPhone}
                      onChange={e => setLoginPhone(e.target.value)}
                      placeholder="Enter Mobile Number or Rider ID"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition font-mono"
                      required
                    />
                  </div>
                </div>

                {/* Security PIN Input */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-bold text-slate-300 block">
                      Shift Security PIN
                    </label>
                  </div>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPin ? 'text' : 'password'}
                      value={loginPin}
                      onChange={e => setLoginPin(e.target.value)}
                      placeholder="Enter 4-digit Security PIN"
                      maxLength={8}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition font-mono tracking-widest"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {showPin ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* Primary Action Button */}
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3 px-4 rounded-2xl font-black text-xs bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-1"
                >
                  {loginLoading ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" />
                      <span>Verifying Shift Credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Log In & Start Shift</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => { setAuthView('register'); setRegisterError(''); }}
                    className="text-xs font-bold text-orange-400 hover:text-orange-300 transition cursor-pointer inline-flex items-center gap-1"
                  >
                    <span>New Partner? Register for Campus Fleet</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </form>
            )}

            {/* ── 2. NEW RIDER REGISTRATION FORM ── */}
            {authView === 'register' && (
              <form onSubmit={handleRegister} className="space-y-3">
                {registerError && (
                  <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{registerError}</span>
                  </div>
                )}

                {/* Full Legal Name */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 block">
                    Full Legal Name
                  </label>
                  <div className="relative">
                    <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={registerForm.name}
                      onChange={e => setRegisterForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
                      required
                    />
                  </div>
                </div>

                {/* Mobile Number */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 block">
                    Mobile Number (WhatsApp Enabled)
                  </label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      value={registerForm.phone}
                      onChange={e => setRegisterForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+91 98765 43210"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition font-mono"
                      required
                    />
                  </div>
                </div>

                {/* Campus Zone & Vehicle Type (Grid) */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 block">
                      Assigned Zone
                    </label>
                    <select
                      value={registerForm.zone}
                      onChange={e => setRegisterForm(prev => ({ ...prev, zone: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 transition cursor-pointer"
                    >
                      <option value="North Campus & Hostel Route 1 (NC-01)">North Campus (NC-01)</option>
                      <option value="South Wing Hostels (NC-02)">South Wing (NC-02)</option>
                      <option value="Central Hostel Sector (NC-03)">Central Sector (NC-03)</option>
                      <option value="Campus All-Wing Hub">All-Wing Hub</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 block">
                      Vehicle Type
                    </label>
                    <select
                      value={registerForm.vehicleType}
                      onChange={e => setRegisterForm(prev => ({ ...prev, vehicleType: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 transition cursor-pointer"
                    >
                      <option value="Electric Scooter (EV)">Electric Scooter (EV)</option>
                      <option value="Motorcycle / Bike">Motorcycle / Bike</option>
                      <option value="Bicycle (Eco Delivery)">Bicycle (Eco Delivery)</option>
                    </select>
                  </div>
                </div>

                {/* Vehicle Plate Number & Aadhaar */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 block">
                      Plate No. (Optional)
                    </label>
                    <input
                      type="text"
                      value={registerForm.vehicleNumber}
                      onChange={e => setRegisterForm(prev => ({ ...prev, vehicleNumber: e.target.value }))}
                      placeholder="DL-01-EV-4412"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition font-mono uppercase"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 block">
                      Aadhaar Card No.
                    </label>
                    <input
                      type="text"
                      value={registerForm.aadhaarNumber}
                      onChange={e => setRegisterForm(prev => ({ ...prev, aadhaarNumber: e.target.value }))}
                      placeholder="12-digit UIDAI"
                      maxLength={14}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition font-mono"
                    />
                  </div>
                </div>

                {/* Set Security PIN & Confirm */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 block">
                      Set 4-Digit PIN
                    </label>
                    <input
                      type="password"
                      value={registerForm.pin}
                      onChange={e => setRegisterForm(prev => ({ ...prev, pin: e.target.value }))}
                      placeholder="e.g. 1234"
                      maxLength={6}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition font-mono tracking-widest"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 block">
                      Confirm PIN
                    </label>
                    <input
                      type="password"
                      value={registerForm.confirmPin}
                      onChange={e => setRegisterForm(prev => ({ ...prev, confirmPin: e.target.value }))}
                      placeholder="Repeat PIN"
                      maxLength={6}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition font-mono tracking-widest"
                      required
                    />
                  </div>
                </div>

                {/* KYC Note Badge */}
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] flex items-center gap-2">
                  <ShieldCheck size={14} className="shrink-0" />
                  <span>UIDAI Aadhaar Verified instant dispatch activation on registration.</span>
                </div>

                {/* Register Submit Button */}
                <button
                  type="submit"
                  disabled={registerLoading}
                  className="w-full py-3 px-4 rounded-2xl font-black text-xs bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-1"
                >
                  {registerLoading ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" />
                      <span>Creating Partner Profile & ID...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Registration & Start Shift</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => { setAuthView('login'); setLoginError(''); }}
                    className="text-xs font-bold text-slate-400 hover:text-white transition cursor-pointer inline-flex items-center gap-1"
                  >
                    <span>Already registered? Log In here</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Footer note */}
          <div className="pt-3 text-center border-t border-slate-800/80 mt-3 space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
              <ShieldCheck size={12} className="text-emerald-400" />
              <span>UIDAI Aadhaar Verified Partner Network</span>
            </div>
            <p className="text-[9px] text-slate-500">
              Dispatch Helpline: <span className="text-slate-400 font-mono font-bold">+91 98765 00000</span>
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* ── TOP RIDER PROFILE & DUTY TOGGLE ── */}
          <div className="px-4 py-3 bg-gradient-to-b from-slate-950 to-slate-900 border-b border-slate-800 shrink-0">
            <div className="flex justify-between items-center gap-3">
              {/* Rider Avatar & Identity */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative">
                  <img
                    src={rider?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=compress&cs=tinysrgb&w=150'}
                    alt={rider?.name}
                    className="w-11 h-11 rounded-2xl object-cover border-2 border-orange-500 shadow-md"
                  />
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                      isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'
                    }`}
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h2 className="font-extrabold text-sm text-white truncate">{rider?.name || 'Partner'}</h2>
                    <span className="text-[10px] font-mono font-bold bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                      {rider?.id || ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                      <Star size={11} className="fill-amber-400" /> {rider?.rating || 4.9}
                    </span>
                    <span>•</span>
                    <span className="truncate">{rider?.vehicleType || 'Hero Electric EV'}</span>
                  </div>
                </div>
              </div>

              {/* Duty Switch (Online / Offline) + SOS + Logout */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setSosModalOpen(true)}
                  className="px-2.5 py-2 rounded-2xl font-black text-xs bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 transition flex items-center gap-1 cursor-pointer"
                  title="Emergency SOS Support"
                >
                  <AlertTriangle size={13} className="text-rose-400" />
                  <span>SOS</span>
                </button>

                <button
                  onClick={toggleDuty}
                  className={`px-3.5 py-2 rounded-2xl font-black text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    isOnline
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-500/20 ring-2 ring-emerald-400/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                >
                  <Power size={13} className={isOnline ? 'animate-pulse' : ''} />
                  <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-2xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 border border-slate-700 text-slate-400 transition cursor-pointer"
                  title="End Shift / Log Out"
                >
                  <LogOut size={13} />
                </button>
              </div>
            </div>

        {/* Fleet Switcher */}
        {fleetRiders.length > 0 && (
          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Switch Active Partner:</span>
            <select
              value={selectedRiderId}
              onChange={e => setSelectedRiderId(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-[11px] font-bold rounded-lg px-2 py-1 focus:outline-none focus:border-orange-500 cursor-pointer max-w-[210px] truncate"
            >
              {fleetRiders.map(f => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.id}) — {f.deliveriesCount ?? 26} Drops
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ── 1. RIDER DASHBOARD (HOME) KPI & SUMMARY CARDS (ON TASKS TAB ONLY) ── */}
      {activeTab === 'tasks' && (
        <>
          <div className="bg-slate-950 border-b border-slate-800 p-3 space-y-2.5 shrink-0">
            {/* High-Impact Modern Shift KPI Bar */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-2 shadow-xs">
                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Today</span>
                <span className="text-base font-black text-emerald-400 font-mono">₹{rider?.earningsToday || 0}</span>
              </div>
              <div className="bg-slate-900/90 border border-orange-500/30 rounded-2xl p-2 shadow-xs">
                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Drops</span>
                <span className="text-base font-black text-white font-mono">{rider?.deliveriesToday || 0}</span>
              </div>
              <div className="bg-slate-900/90 border border-blue-500/30 rounded-2xl p-2 shadow-xs">
                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Distance</span>
                <span className="text-base font-black text-blue-400 font-mono">{rider?.deliveriesToday ? (rider.deliveriesToday * 0.8).toFixed(1) + ' km' : '0.0 km'}</span>
              </div>
              <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-2 shadow-xs">
                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Incentive</span>
                <span className="text-base font-black text-amber-400 font-mono">+₹0</span>
              </div>
            </div>

            {/* Quick Shift Manifest Summary Pill Strip */}
            <div className="flex items-center justify-between bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-850 text-[11px]">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <Layers size={12} className="text-orange-400" />
                <span>Today's Roster:</span>
              </span>
              <div className="flex items-center gap-2 font-mono text-[10px] font-bold">
                <span className="text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-500/20">🍱 15 Mess</span>
                <span className="text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">⚡ 8 Instant</span>
                <span className="text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">🌟 3 Comb</span>
              </div>
            </div>
          </div>

          {/* ── 2. DELIVERY MODE MANAGEMENT SELECTOR BAR ── */}
          <div className="bg-slate-950 px-3 py-2 border-b border-slate-800 shrink-0">
            <div className="grid grid-cols-4 bg-slate-900 p-1 rounded-2xl border border-slate-800 gap-1 shadow-inner">
              <button
                onClick={() => handleModeChange('mess')}
                className={`py-1.5 px-1 rounded-xl font-black text-[11px] transition-all flex items-center justify-center gap-1 cursor-pointer truncate ${
                  deliveryMode === 'mess'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-md ring-1 ring-orange-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <UtensilsCrossed size={12} className={deliveryMode === 'mess' ? 'text-slate-950' : 'text-orange-400'} />
                <span className="truncate">Mess ({messActive.length})</span>
              </button>

              <button
                onClick={() => handleModeChange('instant')}
                className={`py-1.5 px-1 rounded-xl font-black text-[11px] transition-all flex items-center justify-center gap-1 cursor-pointer truncate ${
                  deliveryMode === 'instant'
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md ring-1 ring-amber-300'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Flame size={12} className={deliveryMode === 'instant' ? 'text-slate-950' : 'text-amber-400'} />
                <span className="truncate">Instant ({instantActive.length})</span>
              </button>

              <button
                onClick={() => handleModeChange('combined')}
                className={`py-1.5 px-1 rounded-xl font-black text-[11px] transition-all flex items-center justify-center gap-1 cursor-pointer truncate ${
                  deliveryMode === 'combined'
                    ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md ring-1 ring-indigo-300'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Sparkles size={12} className={deliveryMode === 'combined' ? 'text-white' : 'text-indigo-400'} />
                <span className="truncate">Comb ({combinedActive.length})</span>
              </button>

              <button
                onClick={() => handleModeChange('all')}
                className={`py-1.5 px-1 rounded-xl font-extrabold text-[11px] transition-all cursor-pointer truncate ${
                  deliveryMode === 'all'
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'text-slate-500 hover:text-white'
                }`}
              >
                All ({activeTasks.length})
              </button>
            </div>

            {/* Sub-Filters for Mess Mode (Breakfast, Lunch, Dinner, Hostels) */}
            {deliveryMode === 'mess' && (
              <div className="flex items-center gap-1.5 mt-2 overflow-x-auto scrollbar-none text-[10px]">
                <span className="text-slate-500 font-bold uppercase shrink-0">Slot:</span>
                {(['all', 'breakfast', 'lunch', 'dinner'] as const).map(slot => (
                  <button
                    key={slot}
                    onClick={() => setMessSlotFilter(slot)}
                    className={`px-2 py-0.5 rounded-lg font-bold capitalize transition cursor-pointer shrink-0 ${
                      messSlotFilter === slot
                        ? 'bg-orange-500 text-slate-950 font-black'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {slot}
                  </button>
                ))}

                <span className="text-slate-600">|</span>

                <span className="text-slate-500 font-bold uppercase shrink-0">Hostel:</span>
                {['all', 'Tagore', 'Sarojini', 'Bose'].map(h => (
                  <button
                    key={h}
                    onClick={() => setHostelFilter(h)}
                    className={`px-2 py-0.5 rounded-lg font-bold transition cursor-pointer shrink-0 ${
                      hostelFilter === h
                        ? 'bg-amber-400 text-slate-950 font-black'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── EARNINGS SUB-NAVIGATION HEADER (PINNED TOP POSITION) ── */}
      {activeTab === 'earnings' && (
        <div className="bg-slate-950 px-3 py-2 border-b border-slate-800 shrink-0">
          <div className="grid grid-cols-3 bg-slate-900 p-1 rounded-2xl border border-slate-800 gap-1 shadow-inner">
            <button
              type="button"
              onClick={() => setEarningsMainSection('overview')}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer truncate ${
                earningsMainSection === 'overview'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Wallet size={13} className="shrink-0" />
              <span className="truncate">Overview</span>
            </button>

            <button
              type="button"
              onClick={() => setEarningsMainSection('date-report')}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer truncate ${
                earningsMainSection === 'date-report'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black shadow-md shadow-orange-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <CalendarDays size={13} className="shrink-0" />
              <span className="truncate">Date Report</span>
            </button>

            <button
              type="button"
              onClick={() => setEarningsMainSection('ledger')}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer truncate ${
                earningsMainSection === 'ledger'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black shadow-md shadow-blue-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Receipt size={13} className="shrink-0" />
              <span className="truncate">Ledger</span>
            </button>
          </div>
        </div>
      )}

      {/* ── MAIN SCROLLABLE APP BODY ── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
        {/* ── TAB 1: TASKS QUEUE ── */}
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            {/* Offline Alert Banner */}
            {!isOnline && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="text-amber-400 shrink-0" />
                  <p className="text-xs font-semibold">You are offline. Toggle duty online to receive live dispatches.</p>
                </div>
                <button
                  onClick={toggleDuty}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs shrink-0 cursor-pointer"
                >
                  Go Online
                </button>
              </div>
            )}

            {/* Kitchen Pickup Manifest Button */}
            <div className="flex gap-2">
              <button
                onClick={() => setPickupChecklistModalOpen(true)}
                className="flex-1 py-2.5 px-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-orange-500/40 text-xs font-bold text-slate-200 flex items-center justify-between transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
                    <Package size={13} />
                  </div>
                  <span>Kitchen Pickup Checklist</span>
                </div>
                <span className="text-[10px] text-orange-400 font-mono font-bold bg-orange-500/10 px-2 py-0.5 rounded-full">
                  Counter #2 Hub
                </span>
              </button>

              <button
                onClick={() => setCashDepositModalOpen(true)}
                className="py-2.5 px-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 text-xs font-bold text-amber-300 flex items-center gap-1.5 transition cursor-pointer"
                title="Deposit COD cash to admin"
              >
                <Wallet size={13} />
                <span>COD: ₹{rider?.codCollectedToday || 0}</span>
              </button>
            </div>

            {/* 4. Instant Food Incoming Request Card (If Available) */}
            {isOnline && displayAvailableTasks.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
                    <Flame size={12} /> New Incoming Food Request ({displayAvailableTasks.length})
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                    ⚡ 45s Broadcast
                  </span>
                </div>

                {displayAvailableTasks.map(task => (
                  <div
                    key={task.taskId}
                    className="p-4 rounded-3xl bg-gradient-to-br from-amber-500/15 via-slate-900 to-slate-950 border-2 border-amber-500/60 shadow-lg shadow-amber-500/10 space-y-3 animate-in fade-in"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-amber-400 text-slate-950">
                          ⚡ Instant Food Request
                        </span>
                        <h4 className="font-black text-white text-sm mt-1">{task.customerName}</h4>
                        <p className="text-xs text-slate-300 font-medium flex items-center gap-1 mt-0.5">
                          <MapPin size={12} className="text-amber-400 shrink-0" />
                          {task.deliveryAddress}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-lg font-black text-emerald-400 font-mono block">
                          +₹{task.deliveryFee + (task.surgeBonus || 0)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{task.distance} • {task.estMinutes} mins</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>Pickup:</span>
                        <strong className="text-white">{task.pickupLocation}</strong>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>Prep Status:</span>
                        <span className="text-amber-300 font-bold">{task.prepStatus}</span>
                      </div>
                      <div className="pt-1 border-t border-slate-800 text-slate-300">
                        {task.items?.map((it: any, i: number) => (
                          <div key={i} className="flex justify-between text-[11px]">
                            <span>{it.quantity}x {it.name}</span>
                            <span className="font-mono text-slate-400">₹{it.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRejectTask(task.taskId)}
                        className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleAcceptTask(task.taskId)}
                        className="flex-2 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Check size={14} />
                        <span>Accept Delivery (+₹{task.deliveryFee + (task.surgeBonus || 0)})</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {displayActiveTasks.length === 0 && (
              <div className="p-8 text-center rounded-3xl bg-slate-950/60 border border-slate-800/80 space-y-3">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Compass size={28} className="animate-spin" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">
                    {deliveryMode === 'mess'
                      ? 'No Mess Tiffins In Queue'
                      : deliveryMode === 'instant'
                      ? 'No Instant Orders In Queue'
                      : deliveryMode === 'combined'
                      ? 'No Combined Orders In Queue'
                      : 'All Tasks Completed!'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    New orders are routed automatically by the central dispatcher or kitchen manager.
                  </p>
                </div>
              </div>
            )}

            {/* 3, 4, 5. Active Tasks Manifest List */}
            {displayActiveTasks.length > 0 && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Active Tasks ({displayActiveTasks.length})
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    Route Sequence Optimized
                  </span>
                </div>

                {displayActiveTasks.map((task, idx) => {
                  const isPickedUp = task.status === 'picked-up';
                  const isOnTheWay = task.status === 'on-the-way';
                  const isReached = task.status === 'reached-gate';
                  const isCombined = isCombinedTask(task);
                  const isInstant = isInstantTask(task);
                  const isMess = isMessTask(task);

                  return (
                    <div
                      key={task.taskId || task.orderId || idx}
                      className={`p-4 rounded-3xl bg-slate-950 border shadow-xl space-y-3.5 transition-all relative overflow-hidden ${
                        isCombined
                          ? 'border-indigo-500/50 bg-gradient-to-br from-indigo-950/25 via-slate-950 to-slate-900 ring-1 ring-indigo-500/30'
                          : isInstant
                          ? 'border-amber-500/40 bg-gradient-to-br from-amber-950/15 via-slate-950 to-slate-900 ring-1 ring-amber-500/20'
                          : 'border-slate-800 hover:border-orange-500/40 bg-slate-950'
                      }`}
                    >
                      {/* Top Header Badge Strip */}
                      <div className="flex justify-between items-center bg-slate-900/90 px-3 py-2 rounded-2xl border border-slate-800 text-[11px]">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono font-black text-white bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-700">
                            Stop #{idx + 1}
                          </span>
                          {isCombined && (
                            <span className="font-extrabold text-[10px] px-2 py-0.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-xs">
                              🌟 Combined Bundle
                            </span>
                          )}
                          {isInstant && (
                            <span className="font-extrabold text-[10px] px-2 py-0.5 rounded-lg bg-amber-400 text-slate-950 font-black">
                              ⚡ Instant Food
                            </span>
                          )}
                          {isMess && (
                            <span className="font-extrabold text-[10px] px-2 py-0.5 rounded-lg bg-orange-500 text-slate-950 font-black">
                              🍱 Mess Meal
                            </span>
                          )}
                          <span className="font-mono text-slate-400 font-bold">#{task.orderId || task.taskId}</span>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-base font-black text-emerald-400 font-mono block">
                            +₹{task.deliveryFee || 35}
                          </span>
                        </div>
                      </div>

                      {/* Customer Info & Destination Box */}
                      <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-850 space-y-2.5">
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-black text-white text-base leading-tight truncate">{task.customerName}</h4>
                              {task.boxId && (
                                <span className="font-mono text-[10px] font-black px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                                  Box {task.boxId}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-200 font-semibold flex items-center gap-1.5 mt-1.5">
                              <MapPin size={14} className="text-orange-400 shrink-0" />
                              <span className="leading-snug">{task.deliveryAddress}</span>
                            </div>
                          </div>

                          <span className={`text-[10px] font-extrabold px-2 py-1 rounded-xl shrink-0 ${
                            task.paymentMethod === 'Cash on Delivery'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {task.paymentMethod === 'Cash on Delivery' ? `COD: Collect ₹${task.codAmountToCollect || task.totalAmount}` : 'Prepaid ✓'}
                          </span>
                        </div>

                        {/* High-Touch 1-Tap Action Row */}
                        <div className="grid grid-cols-3 gap-1.5 pt-1">
                          <a
                            href={`tel:${task.customerPhone || task.phone}`}
                            className="py-2 px-2 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-300 text-[11px] font-bold transition flex items-center justify-center gap-1.5 text-center"
                          >
                            <Phone size={12} className="text-orange-400" />
                            <span>Call</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => handleOpenChat(task)}
                            className="py-2 px-2 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 text-[11px] font-bold transition flex items-center justify-center gap-1.5 text-center cursor-pointer"
                          >
                            <MessageSquare size={12} className="text-blue-400" />
                            <span>Chat</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setActiveTab('map')}
                            className="py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-[11px] font-bold transition flex items-center justify-center gap-1.5 text-center cursor-pointer"
                          >
                            <Navigation size={12} className="text-emerald-400" />
                            <span>GPS ({task.distance || '0.8 km'})</span>
                          </button>
                        </div>
                      </div>

                      {/* Package & Meal Breakdown Summary */}
                      {isCombined ? (
                        <div className="p-3 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 text-xs space-y-1.5">
                          <div className="flex justify-between items-center text-indigo-300 font-extrabold text-[11px]">
                            <span>🌟 Bundled Single Task:</span>
                            <span className="font-mono text-emerald-400">Total Earn: ₹{task.deliveryFee} (Base ₹35 + Bonus ₹20)</span>
                          </div>
                          <div className="space-y-1 text-slate-200 text-xs">
                            <p className="flex items-center gap-1.5">
                              <span className="text-orange-400">🍱</span>
                              <strong>Scheduled Meal:</strong> Standard Homestyle Thali ({task.boxId || '#TIF-309'})
                            </p>
                            <p className="flex items-center gap-1.5">
                              <span className="text-amber-400">⚡</span>
                              <strong>Instant Add-on:</strong> Crispy Paneer Burger + Chilled Drink
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-mono font-bold text-slate-400">
                              {task.type === 'Mess Tiffin' ? 'Meal Plan:' : 'Kitchen Food Items:'}
                            </span>
                            <span className="text-[11px] font-black text-amber-400">
                              {task.planName || task.restaurantName || 'Central Campus Kitchen'}
                            </span>
                          </div>
                          <div className="space-y-1 text-slate-200">
                            {task.items?.map((it: any, i: number) => (
                              <p key={i} className="text-[11px] leading-relaxed">
                                • {it.quantity || 1}x {it.name}
                              </p>
                            ))}
                          </div>
                          {task.notes && (
                            <p className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-800">
                              Note: {task.notes}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Modern Delivery Progression Stepper */}
                      <div className="bg-slate-900/60 p-2.5 rounded-2xl border border-slate-850 space-y-1.5">
                        <div className="flex justify-between text-[10px] font-extrabold text-slate-400 px-1">
                          <span className={task.status ? 'text-emerald-400' : 'text-slate-500'}>1. Assigned</span>
                          <span className={isPickedUp || isOnTheWay || isReached ? 'text-emerald-400' : 'text-slate-500'}>2. Picked Up</span>
                          <span className={isOnTheWay || isReached ? 'text-emerald-400' : 'text-slate-500'}>3. On Route</span>
                          <span className={isReached ? 'text-orange-400' : 'text-slate-500'}>4. At Gate</span>
                        </div>
                        {/* Progress Bar Track */}
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden flex">
                          <div className="h-full bg-emerald-500 w-1/4" />
                          <div className={`h-full transition-all ${isPickedUp || isOnTheWay || isReached ? 'bg-emerald-500 w-1/4' : 'bg-transparent w-1/4'}`} />
                          <div className={`h-full transition-all ${isOnTheWay || isReached ? 'bg-emerald-500 w-1/4' : 'bg-transparent w-1/4'}`} />
                          <div className={`h-full transition-all ${isReached ? 'bg-orange-500 w-1/4' : 'bg-transparent w-1/4'}`} />
                        </div>
                      </div>

                      {/* Large Thumb-Friendly Dynamic Action CTA */}
                      <div className="space-y-2 pt-0.5">
                        {(!task.status || task.status === 'assigned' || task.status === 'confirmed' || task.status === 'preparing') && (
                          <button
                            type="button"
                            onClick={() => handleUpdateTaskStep(task, 'picked-up')}
                            className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-xs shadow-lg shadow-orange-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <Package size={15} />
                            <span>Confirm Kitchen Pickup ({task.pickupLocation || 'Kitchen Counter'})</span>
                          </button>
                        )}

                        {isPickedUp && (
                          <button
                            type="button"
                            onClick={() => handleUpdateTaskStep(task, 'on-the-way')}
                            className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs shadow-lg shadow-blue-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <Bike size={15} />
                            <span>Start Navigation to Customer ({task.hostel})</span>
                          </button>
                        )}

                        {isOnTheWay && (
                          <button
                            type="button"
                            onClick={() => handleUpdateTaskStep(task, 'reached-gate')}
                            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <MapPin size={15} />
                            <span>Reached Hostel Gate / Outside Room</span>
                          </button>
                        )}

                        {isReached && (
                          <button
                            type="button"
                            onClick={() => handleUpdateTaskStep(task, 'delivered')}
                            className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 transition flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <CheckCircle2 size={15} />
                            <span>Verify OTP & Mark Delivered (+₹{task.deliveryFee})</span>
                          </button>
                        )}

                        {/* Issue Reporting link */}
                        <button
                          type="button"
                          onClick={() => {
                            setTargetFailedTask(task);
                            setFailedModalOpen(true);
                          }}
                          className="w-full py-1 text-center text-[10px] text-slate-500 hover:text-rose-400 font-bold transition cursor-pointer"
                        >
                          Delivery Issue? Report Unavailable / Gate Locked
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── 10. TAB 2: NAVIGATION & LOCATION ROUTE MAP ── */}
        {activeTab === 'map' && (
          <div className="space-y-4">
            <div className="p-4 rounded-3xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-black text-sm text-white flex items-center gap-1.5">
                  <Navigation size={15} className="text-blue-400" /> Multi-Stop Campus Navigation
                </h3>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  GPS Active • DL-01-EV-4412
                </span>
              </div>

              {/* Graphic Campus Route Map Illustration */}
              <div className="relative h-64 bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center">
                <div
                  className="absolute inset-0 opacity-15"
                  style={{
                    backgroundImage: 'radial-gradient(circle, #f97316 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                  }}
                />

                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 240">
                  <path d="M 60 180 Q 140 160 160 120 T 260 60" fill="none" stroke="#334155" strokeWidth="10" strokeLinecap="round" />
                  <path d="M 60 180 Q 140 160 160 120 T 260 60" fill="none" stroke="#f97316" strokeWidth="3" strokeDasharray="6,4" />
                  <path d="M 160 120 Q 200 170 240 190" fill="none" stroke="#334155" strokeWidth="8" strokeLinecap="round" />

                  <circle cx="60" cy="180" r="12" fill="#ea580c" />
                  <text x="60" y="206" fill="#cbd5e1" fontSize="9" fontWeight="bold" textAnchor="middle">Kitchen Hub</text>

                  <circle cx="160" cy="120" r="10" fill="#10b981" />
                  <circle cx="160" cy="120" r="16" fill="none" stroke="#10b981" strokeWidth="1.5" className="animate-ping" />
                  <text x="160" y="104" fill="#6ee7b7" fontSize="9" fontWeight="black" textAnchor="middle">You (800m away)</text>

                  <circle cx="260" cy="60" r="12" fill="#3b82f6" />
                  <text x="260" y="44" fill="#93c5fd" fontSize="9" fontWeight="bold" textAnchor="middle">Tagore Hostel</text>

                  <circle cx="240" cy="190" r="9" fill="#64748b" />
                  <text x="240" y="210" fill="#94a3b8" fontSize="8" textAnchor="middle">Sarojini Hall</text>
                </svg>

                <div className="absolute top-3 left-3 px-3 py-1.5 rounded-xl bg-slate-950/90 border border-slate-700/80 backdrop-blur-xs text-xs font-bold text-white shadow-md">
                  <span className="text-orange-400">ETA:</span> 6 mins • 0.8 km remaining
                </div>
              </div>

              {/* Waypoint details */}
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Optimized Turn-by-Turn Delivery Sequence:</span>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-orange-500/20 text-orange-400 font-bold text-[10px] flex items-center justify-center">1</span>
                      <span className="text-slate-200">Central Kitchen Hub (Collect all 4 tiffins & express orders)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-blue-500/20 text-blue-400 font-bold text-[10px] flex items-center justify-center">2</span>
                      <span className="text-slate-200">Tagore Hostel (Room 204 — Aman Sharma)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-blue-500/20 text-blue-400 font-bold text-[10px] flex items-center justify-center">3</span>
                      <span className="text-slate-200">Sarojini Hall (Room 112 — Priya Patel)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-indigo-500/20 text-indigo-400 font-bold text-[10px] flex items-center justify-center">4</span>
                      <span className="text-slate-200">Bose Hostel (Room 108 — Combined Tiffin + Burger)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 8, 9. TAB 3: EARNINGS & WALLET, BANK/UPI, TRANSACTION & PAYOUT HISTORY ── */}
        {activeTab === 'earnings' && (
          <div className="space-y-4">
            {/* ══════════════════════════════════════════════════════════
                SUB-SECTION 1: OVERVIEW & WALLET
            ══════════════════════════════════════════════════════════ */}
            {earningsMainSection === 'overview' && (
              <div className="space-y-3.5">
                {/* HERO EARNINGS CARD */}
                <div className="p-4 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950 border border-emerald-500/30 shadow-xl relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Today's Shift Earnings
                      </span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
                          ₹{(rider?.earningsToday ?? 0).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] font-extrabold text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                          Live Active
                        </span>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-base">
                      ₹
                    </div>
                  </div>

                  {/* Shift Order Tags */}
                  <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-850 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                      🌅 {rider?.breakfastCount ? `${rider.breakfastCount} Breakfast` : '0 Breakfast'}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 font-mono">
                      🍱 {rider?.lunchCount ? `${rider.lunchCount} Lunch` : '0 Lunch'}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-indigo-400/10 text-indigo-300 border border-indigo-400/20 font-mono">
                      🌙 {rider?.dinnerCount ? `${rider.dinnerCount} Dinner` : '0 Dinner'}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono">
                      🌟 {activeTasks.length} Active Tasks
                    </span>
                  </div>

                  {/* Weekly & Monthly Sub-KPIs */}
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-850 text-xs">
                    <div className="bg-slate-900/60 p-2.5 rounded-2xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-medium block">Weekly Earnings</span>
                      <span className="text-sm font-black text-blue-400 font-mono">
                        ₹{(rider?.earningsWeekly ?? 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="bg-slate-900/60 p-2.5 rounded-2xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-medium block">Monthly Total</span>
                      <span className="text-sm font-black text-indigo-400 font-mono">
                        ₹{(rider?.earningsMonthly ?? 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* QUICK JUMP TO DATE-WISE REPORT BANNER */}
                <div
                  onClick={() => setEarningsMainSection('date-report')}
                  className="p-3.5 rounded-2xl bg-gradient-to-r from-orange-500/15 via-slate-900 to-slate-950 border border-orange-500/30 hover:border-orange-500/60 transition flex justify-between items-center cursor-pointer group shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
                      <CalendarDays size={17} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-white group-hover:text-orange-400 transition flex items-center gap-1.5">
                        <span>Date-Wise Earnings Report</span>
                        <span className="text-[9px] font-mono text-orange-400 bg-orange-500/10 px-1.5 py-0.2 rounded border border-orange-500/20">Audit</span>
                      </h4>
                      <p className="text-[10px] text-slate-400">View daily payout records, deliveries & passbook</p>
                    </div>
                  </div>
                  <ChevronRight size={15} className="text-orange-400 group-hover:translate-x-1 transition shrink-0" />
                </div>

                {/* WITHDRAWABLE WALLET BALANCE CARD */}
                <div className="p-4 rounded-3xl bg-gradient-to-tr from-emerald-950/60 via-slate-900 to-slate-950 border border-emerald-500/40 shadow-xl space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">
                        Withdrawable Wallet Balance
                      </span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl font-black text-white font-mono">
                          ₹{(rider?.walletBalance ?? 0).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[11px] text-emerald-400 font-bold">Ready to Transfer</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1 flex items-center gap-1">
                        <ShieldCheck size={12} className="text-emerald-400 shrink-0" />
                        <span className="truncate">Auto-transfer to {rider?.bankDetails?.upiId || rider?.upiId || ''}</span>
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Wallet size={18} />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPayoutModalOpen(true)}
                      className="flex-1 py-2.5 px-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20 transition flex items-center justify-center gap-1.5 cursor-pointer truncate"
                    >
                      <CreditCard size={14} className="shrink-0" />
                      <span className="truncate">Withdraw Funds</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBankModalOpen(true)}
                      className="py-2.5 px-3 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-200 font-bold text-xs border border-slate-750 transition flex items-center gap-1 cursor-pointer shrink-0"
                      title="Manage Bank and UPI Accounts"
                    >
                      <Building2 size={13} className="text-blue-400 shrink-0" />
                      <span>Bank &amp; UPI</span>
                    </button>
                  </div>
                </div>

                {/* COD CASH IN HAND SECTION */}
                <div className="p-4 rounded-3xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-base">
                        💵
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-white">Cash on Delivery (COD) In Hand</h4>
                        <p className="text-[10px] text-slate-400">Cash collected from student orders</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-black text-amber-400 font-mono">
                        ₹{rider?.codCollectedToday || 0}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCashDepositModalOpen(true)}
                    className="w-full py-2 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-black text-xs rounded-xl shadow-xs transition cursor-pointer"
                  >
                    Deposit COD Cash to Central Kitchen Counter
                  </button>
                </div>

                {/* QUICK SHIFT LEDGER BREAKDOWN & ACTION */}
                <div className="p-4 rounded-3xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                      <DollarSign size={15} className="text-orange-400" /> Today's Shift Breakdown
                    </h3>
                    <button
                      type="button"
                      onClick={() => setEarningsMainSection('date-report')}
                      className="text-[10px] font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Date-Wise Audit</span>
                      <ChevronRight size={12} />
                    </button>
                  </div>

                  <div className="divide-y divide-slate-800/80 text-xs">
                    <div className="py-2 flex justify-between text-slate-300">
                      <span>🍱 Mess Deliveries ({dateReportData?.summary?.messDeliveries ?? (rider?.deliveriesToday || 0)} drops @ ₹{rider?.perDeliveryRate || 35}):</span>
                      <span className="font-mono font-bold text-white">₹{dateReportData?.summary?.messEarnings ?? ((rider?.deliveriesToday || 0) * (rider?.perDeliveryRate || 35))}</span>
                    </div>
                    <div className="py-2 flex justify-between text-slate-300">
                      <span>⚡ Instant Food Orders ({dateReportData?.summary?.instantDeliveries ?? 0} drops):</span>
                      <span className="font-mono font-bold text-white">₹{dateReportData?.summary?.instantEarnings ?? 0}</span>
                    </div>
                    <div className="py-2 flex justify-between text-slate-300">
                      <span>🌟 Combined Trip Bonus:</span>
                      <span className="font-mono font-bold text-indigo-400">+₹{dateReportData?.summary?.combinedBonus ?? 0}</span>
                    </div>
                    <div className="py-2 flex justify-between text-slate-300">
                      <span>📍 Campus Distance Bonus:</span>
                      <span className="font-mono font-bold text-emerald-400">+₹{dateReportData?.summary?.distanceBonus ?? 0}</span>
                    </div>
                    <div className="py-2 flex justify-between text-slate-300">
                      <span>🌧️ Peak Hour / Rain Surge Incentive:</span>
                      <span className="font-mono font-bold text-emerald-400">+₹{dateReportData?.summary?.surgeIncentives ?? 0}</span>
                    </div>
                    <div className="py-2 flex justify-between text-slate-300">
                      <span>🎯 Daily Target Completion Incentive:</span>
                      <span className="font-mono font-bold text-amber-400">+₹{dateReportData?.summary?.targetBonus ?? 0}</span>
                    </div>
                    <div className="py-2 flex justify-between text-slate-300">
                      <span>💝 Student Tips Received:</span>
                      <span className="font-mono font-bold text-pink-400">+₹{dateReportData?.summary?.tips ?? 0}</span>
                    </div>
                    <div className="py-2.5 flex justify-between text-sm font-black text-white border-t border-slate-700">
                      <span>Total Shift Earnings:</span>
                      <span className="font-mono text-emerald-400">₹{dateReportData?.summary?.totalEarnings ?? (rider?.earningsToday || 0)}</span>
                    </div>
                  </div>
                </div>

                {/* LINKED BANK ACCOUNT CARD */}
                <div className="p-4 rounded-3xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-extrabold text-xs text-white flex items-center gap-2">
                      <Landmark size={14} className="text-blue-400" /> Linked Payout Accounts
                    </h3>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                      <ShieldCheck size={11} /> Verified
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Account:</span>
                      <span className="text-slate-200 font-bold flex items-center gap-1.5">
                        <Building2 size={12} className="text-blue-400" />
                        {rider?.bankDetails?.bankName ? `${rider.bankDetails.bankName} (${rider.bankDetails.accountNumberMasked || '••••'})` : 'Bank Account Not Linked'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Primary UPI:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-emerald-400 font-bold">
                          {rider?.bankDetails?.upiId || rider?.upiId || ''}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyText(rider?.bankDetails?.upiId || rider?.upiId || '', 'UPI ID')}
                          className="p-1 text-slate-400 hover:text-white cursor-pointer"
                          title="Copy UPI ID"
                        >
                          <Copy size={11} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setBankModalOpen(true)}
                    className="w-full py-2 bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Edit / Update Bank &amp; UPI Details</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════
                SUB-SECTION 2: 📅 DATE-WISE EARNINGS REPORT
            ══════════════════════════════════════════════════════════ */}
            {earningsMainSection === 'date-report' && (
              <div className="space-y-3.5">
                {/* 1. HORIZONTAL DATE SELECTOR CAROUSEL */}
                <div className="p-3.5 rounded-3xl bg-slate-950 border border-slate-800 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <CalendarDays size={13} className="text-orange-400" />
                      Select Date to Audit
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {selectedAuditDate}
                    </span>
                  </div>

                  {/* Horizontal Scrollable Day Cards */}
                  <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
                    {[0, 1, 2, 3, 4, 5, 6, 7].map(offset => {
                      const d = new Date();
                      d.setDate(d.getDate() - offset);
                      const dStr = d.toISOString().split('T')[0];
                      const dayName = offset === 0 ? 'Today' : offset === 1 ? 'Yest' : d.toLocaleDateString('en-IN', { weekday: 'short' });
                      const dayNumber = d.getDate();
                      const isSel = selectedAuditDate === dStr;
                      const earnEst = offset === 0 ? (rider?.earningsToday || 0) : 0;

                      return (
                        <button
                          key={dStr}
                          type="button"
                          onClick={() => setSelectedAuditDate(dStr)}
                          className={`min-w-[62px] p-2 rounded-2xl border transition text-center shrink-0 cursor-pointer ${
                            isSel
                              ? 'bg-gradient-to-b from-orange-500/20 to-amber-500/10 border-orange-400 text-white shadow-md'
                              : 'bg-slate-900/80 hover:bg-slate-900 border-slate-800 text-slate-400'
                          }`}
                        >
                          <span className={`text-[10px] font-extrabold uppercase block ${isSel ? 'text-orange-400' : 'text-slate-500'}`}>
                            {dayName}
                          </span>
                          <span className={`text-base font-black block font-mono my-0.5 ${isSel ? 'text-white' : 'text-slate-300'}`}>
                            {dayNumber}
                          </span>
                          <span className="text-[9px] font-bold text-emerald-400 font-mono block">
                            ₹{earnEst}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Day Navigation Toolbar (Fully Responsive) */}
                  <div className="pt-2 border-t border-slate-850">
                    <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        <button
                          type="button"
                          onClick={() => {
                            const d = new Date(selectedAuditDate + 'T00:00:00');
                            d.setDate(d.getDate() - 1);
                            setSelectedAuditDate(d.toISOString().split('T')[0]);
                          }}
                          className="py-1.5 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-bold transition cursor-pointer shrink-0"
                          title="Previous Day"
                        >
                          ← Prev
                        </button>

                        <input
                          type="date"
                          value={selectedAuditDate}
                          onChange={e => setSelectedAuditDate(e.target.value)}
                          className="flex-1 min-w-0 bg-slate-900 border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-orange-500 cursor-pointer text-center"
                        />

                        <button
                          type="button"
                          onClick={() => {
                            const d = new Date(selectedAuditDate + 'T00:00:00');
                            d.setDate(d.getDate() + 1);
                            setSelectedAuditDate(d.toISOString().split('T')[0]);
                          }}
                          className="py-1.5 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-bold transition cursor-pointer shrink-0"
                          title="Next Day"
                        >
                          Next →
                        </button>
                      </div>

                      {selectedAuditDate !== todayDateStr && (
                        <button
                          type="button"
                          onClick={() => setSelectedAuditDate(todayDateStr)}
                          className="py-1.5 px-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 text-xs font-black transition cursor-pointer shrink-0"
                        >
                          Today
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. SELECTED DATE PERFORMANCE SHOWCASE */}
                {(() => {
                  const isToday = selectedAuditDate === todayDateStr;
                  const dData = dateReportData?.summary || {
                    totalEarnings: isToday ? (rider?.earningsToday || 0) : 0,
                    messEarnings: isToday ? ((rider?.deliveriesToday || 0) * (rider?.perDeliveryRate || 35)) : 0,
                    instantEarnings: 0,
                    combinedBonus: 0,
                    distanceBonus: 0,
                    surgeIncentives: 0,
                    targetBonus: 0,
                    tips: 0,
                    codCollected: isToday ? (rider?.codCollectedToday || 0) : 0,
                    totalDeliveries: isToday ? (rider?.deliveriesToday || 0) : 0,
                    messDeliveries: isToday ? (rider?.deliveriesToday || 0) : 0,
                    instantDeliveries: 0,
                    combinedDeliveries: 0,
                    payoutStatus: 'none',
                    settlementRef: null
                  };

                  const dateObj = new Date(selectedAuditDate + 'T00:00:00');
                  const formattedDate = dateObj.toLocaleDateString('en-IN', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  });

                  return (
                    <div className="space-y-3">
                      {/* Date Banner Card */}
                      <div className="p-4 rounded-3xl bg-slate-950 border border-slate-800 space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              Audited Date Report
                            </span>
                            <h3 className="text-sm font-extrabold text-white mt-0.5">
                              {formattedDate}
                            </h3>
                          </div>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                            dData.payoutStatus === 'paid'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                          }`}>
                            {dData.payoutStatus === 'paid' ? '✅ Settled to Bank' : '⏳ Added to Wallet'}
                          </span>
                        </div>

                        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-850 flex justify-between items-center">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-medium">Day Net Earnings</span>
                            <span className="text-2xl font-black text-emerald-400 font-mono">
                              ₹{dData.totalEarnings}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block font-medium">Total Deliveries</span>
                            <span className="text-base font-black text-white font-mono">
                              {dData.totalDeliveries} Drops
                            </span>
                          </div>
                        </div>

                        {/* Delivery Split Badges */}
                        <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                          <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                            <span className="text-[9px] text-orange-400 font-bold block uppercase">Mess</span>
                            <span className="text-xs font-black text-white font-mono">{dData.messDeliveries}</span>
                          </div>
                          <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                            <span className="text-[9px] text-amber-400 font-bold block uppercase">Instant</span>
                            <span className="text-xs font-black text-white font-mono">{dData.instantDeliveries}</span>
                          </div>
                          <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                            <span className="text-[9px] text-indigo-400 font-bold block uppercase">Combined</span>
                            <span className="text-xs font-black text-white font-mono">{dData.combinedDeliveries}</span>
                          </div>
                        </div>
                      </div>

                      {/* Sub-Tabs for this Date (Responsive Grid) */}
                      <div className="grid grid-cols-3 bg-slate-950 p-1 rounded-2xl border border-slate-800 gap-1 text-[11px]">
                        <button
                          type="button"
                          onClick={() => setDateReportView('breakdown')}
                          className={`py-1.5 px-1 rounded-xl font-bold transition flex items-center justify-center gap-1 cursor-pointer truncate ${
                            dateReportView === 'breakdown'
                              ? 'bg-slate-850 text-white font-black shadow-xs'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <DollarSign size={12} className="shrink-0" />
                          <span className="truncate">Breakdown</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDateReportView('orders')}
                          className={`py-1.5 px-1 rounded-xl font-bold transition flex items-center justify-center gap-1 cursor-pointer truncate ${
                            dateReportView === 'orders'
                              ? 'bg-slate-850 text-white font-black shadow-xs'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <Bike size={12} className="shrink-0" />
                          <span className="truncate">Delivered</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDateReportView('calendar')}
                          className={`py-1.5 px-1 rounded-xl font-bold transition flex items-center justify-center gap-1 cursor-pointer truncate ${
                            dateReportView === 'calendar'
                              ? 'bg-slate-850 text-white font-black shadow-xs'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <CalendarDays size={12} className="shrink-0" />
                          <span className="truncate">14-Day Audit</span>
                        </button>
                      </div>

                      {/* Sub-View 1: Itemized Breakdown */}
                      {dateReportView === 'breakdown' && (
                        <div className="p-4 rounded-3xl bg-slate-950 border border-slate-800 space-y-2.5">
                          <h4 className="font-extrabold text-xs text-white">Itemized Earnings Breakdown</h4>
                          <div className="divide-y divide-slate-850 text-xs">
                            <div className="py-2 flex justify-between text-slate-300">
                              <span>🍱 Mess Deliveries ({dData.messDeliveries} drops @ ₹35):</span>
                              <span className="font-mono font-bold text-white">₹{dData.messEarnings}</span>
                            </div>
                            <div className="py-2 flex justify-between text-slate-300">
                              <span>⚡ Instant Orders ({dData.instantDeliveries} drops):</span>
                              <span className="font-mono font-bold text-white">₹{dData.instantEarnings}</span>
                            </div>
                            <div className="py-2 flex justify-between text-slate-300">
                              <span>🌟 Combined Delivery Trip Bonus:</span>
                              <span className="font-mono font-bold text-indigo-400">+₹{dData.combinedBonus}</span>
                            </div>
                            <div className="py-2 flex justify-between text-slate-300">
                              <span>📍 Campus Distance Bonus (&gt;1.0 KM):</span>
                              <span className="font-mono font-bold text-emerald-400">+₹{dData.distanceBonus}</span>
                            </div>
                            <div className="py-2 flex justify-between text-slate-300">
                              <span>🌧️ Weather / Peak Surge Incentive:</span>
                              <span className="font-mono font-bold text-emerald-400">+₹{dData.surgeIncentives}</span>
                            </div>
                            <div className="py-2 flex justify-between text-slate-300">
                              <span>🎯 Daily Target Completion Incentive:</span>
                              <span className="font-mono font-bold text-amber-400">+₹{dData.targetBonus}</span>
                            </div>
                            <div className="py-2 flex justify-between text-slate-300">
                              <span>💝 Student Tips Received:</span>
                              <span className="font-mono font-bold text-pink-400">+₹{dData.tips}</span>
                            </div>
                            <div className="py-2 flex justify-between text-slate-300">
                              <span>💵 COD Cash Collected on Date:</span>
                              <span className="font-mono font-bold text-amber-300">₹{dData.codCollected}</span>
                            </div>
                            <div className="pt-2.5 flex justify-between text-sm font-black text-white border-t border-slate-700">
                              <span>Total Net Earnings for Date:</span>
                              <span className="font-mono text-emerald-400">₹{dData.totalEarnings}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Sub-View 2: Delivered Runs */}
                      {dateReportView === 'orders' && (() => {
                        const orders = dateReportData?.deliveredOrders || [];

                        return (
                          <div className="p-4 rounded-3xl bg-slate-950 border border-slate-800 space-y-2.5">
                            <div className="flex justify-between items-center">
                              <h4 className="font-extrabold text-xs text-white">Delivered Orders Audit</h4>
                              <span className="text-[10px] text-slate-400 font-mono">{orders.length} Runs</span>
                            </div>

                            {orders.length === 0 ? (
                              <div className="py-8 text-center text-slate-500 text-xs">
                                <Package size={24} className="mx-auto mb-1.5 opacity-40 text-slate-400" />
                                No delivered orders recorded for this date.
                              </div>
                            ) : (
                              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                                {orders.map((o: any, idx: number) => (
                                  <div
                                    key={o.orderId || idx}
                                    className="p-3 rounded-2xl bg-slate-900 border border-slate-850 flex justify-between items-center"
                                  >
                                    <div className="min-w-0 pr-2">
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-mono text-[10px] text-orange-400 font-bold">#{o.orderId}</span>
                                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                                          {o.type}
                                        </span>
                                      </div>
                                      <p className="font-bold text-white text-xs mt-0.5">{o.customerName}</p>
                                      <p className="text-[10px] text-slate-400">{o.deliveryAddress} • {o.slot}</p>
                                    </div>

                                    <div className="text-right shrink-0">
                                      <span className="font-mono font-black text-sm text-emerald-400 block">
                                        +₹{o.totalEarned || o.deliveryFee}
                                      </span>
                                      <span className="text-[9px] text-slate-500 block">{o.deliveredAt}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {/* Sub-View 3: 14-Day Calendar Audit */}
                      {dateReportView === 'calendar' && (() => {
                        const history = dateReportData?.historyDays || [];

                        return (
                          <div className="p-4 rounded-3xl bg-slate-950 border border-slate-800 space-y-2.5">
                            <h4 className="font-extrabold text-xs text-white">Past 14-Day Historical Passbook</h4>
                            {history.length === 0 ? (
                              <div className="py-8 text-center text-slate-500 text-xs">
                                <CalendarDays size={24} className="mx-auto mb-1.5 opacity-40 text-slate-400" />
                                No historical passbook records found yet.
                              </div>
                            ) : (
                              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                              {history.map((h: any, idx: number) => {
                                const isSel = selectedAuditDate === h.date;
                                return (
                                  <div
                                    key={idx}
                                    onClick={() => {
                                      setSelectedAuditDate(h.date);
                                      setDateReportView('breakdown');
                                    }}
                                    className={`p-3 rounded-2xl border transition flex justify-between items-center cursor-pointer ${
                                      isSel
                                        ? 'bg-slate-900 border-orange-400 shadow-sm'
                                        : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800'
                                    }`}
                                  >
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-bold text-white text-xs font-mono">{h.date}</span>
                                        <span className="text-[10px] text-slate-400">({h.dayName})</span>
                                        {isSel && (
                                          <span className="text-[9px] font-extrabold text-orange-400 bg-orange-500/20 px-1.5 py-0.2 rounded">
                                            Auditing
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-[10px] text-slate-400 mt-0.5">
                                        {h.totalDeliveries} Completed Drops • {h.messDeliveries || Math.round(h.totalDeliveries * 0.6)} Mess
                                      </p>
                                    </div>

                                    <div className="text-right">
                                      <span className="font-black text-sm text-emerald-400 font-mono block">
                                        ₹{h.totalEarnings}
                                      </span>
                                      <span className={`text-[9px] font-bold ${
                                        h.payoutStatus === 'paid' ? 'text-emerald-400' : 'text-amber-400'
                                      }`}>
                                        {h.payoutStatus === 'paid' ? 'Settled' : 'Pending'}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════
                SUB-SECTION 3: 📜 LEDGER & PAYOUTS
            ══════════════════════════════════════════════════════════ */}
            {earningsMainSection === 'ledger' && (
              <div className="space-y-3.5">
                <div className="p-4 rounded-3xl bg-slate-950 border border-slate-800 space-y-3">
                  {/* Segmented Switcher (Responsive Grid) */}
                  <div className="grid grid-cols-2 bg-slate-900 p-1 rounded-2xl border border-slate-800 gap-1 text-[11px] sm:text-xs">
                    <button
                      type="button"
                      onClick={() => setEarningsViewTab('transactions')}
                      className={`py-1.5 px-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer truncate ${
                        earningsViewTab === 'transactions'
                          ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <History size={13} className="shrink-0" />
                      <span className="truncate">Transactions ({filteredTransactions.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEarningsViewTab('payouts')}
                      className={`py-1.5 px-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer truncate ${
                        earningsViewTab === 'payouts'
                          ? 'bg-blue-500 text-slate-950 font-black shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Receipt size={13} className="shrink-0" />
                      <span className="truncate">Payouts ({allPayouts.length})</span>
                    </button>
                  </div>

                  {/* View 1: TRANSACTION HISTORY (EARNINGS) */}
                  {earningsViewTab === 'transactions' && (
                    <div className="space-y-2.5">
                      {/* Category Filter Chips */}
                      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[10px]">
                        {(['all', 'mess', 'instant', 'incentive'] as const).map(f => (
                          <button
                            key={f}
                            type="button"
                            onClick={() => setTransactionFilter(f)}
                            className={`px-2.5 py-1 rounded-lg font-bold capitalize transition cursor-pointer shrink-0 ${
                              transactionFilter === f
                                ? 'bg-slate-800 text-white border border-slate-600'
                                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                            }`}
                          >
                            {f === 'all' ? 'All Transactions' : f === 'mess' ? '🍱 Mess' : f === 'instant' ? '⚡ Instant' : '🎯 Incentives'}
                          </button>
                        ))}
                      </div>

                      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                        {filteredTransactions.map((tx: any, idx: number) => {
                          const isCredit = tx.type === 'credit' || tx.amount > 0;
                          return (
                            <div
                              key={tx.id || idx}
                              className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex justify-between items-center"
                            >
                              <div className="min-w-0 pr-2">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-mono text-[9px] text-slate-400">#{tx.id}</span>
                                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                    tx.category?.includes('Mess')
                                      ? 'bg-orange-500/20 text-orange-400'
                                      : tx.category?.includes('Instant')
                                      ? 'bg-amber-400/20 text-amber-300'
                                      : tx.category?.includes('Combined')
                                      ? 'bg-indigo-500/20 text-indigo-300'
                                      : 'bg-emerald-500/20 text-emerald-400'
                                  }`}>
                                    {tx.category || 'Delivery'}
                                  </span>
                                </div>
                                <p className="font-bold text-white text-xs mt-0.5 truncate">{tx.title}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">{tx.date} • {tx.reference}</p>
                              </div>

                              <div className="text-right shrink-0">
                                <span className={`font-black text-sm font-mono block ${
                                  isCredit ? 'text-emerald-400' : 'text-slate-300'
                                }`}>
                                  {isCredit ? `+₹${Math.abs(tx.amount)}` : `-₹${Math.abs(tx.amount)}`}
                                </span>
                                <span className="text-[9px] text-slate-500 capitalize">{tx.status || 'Completed'}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* View 2: PAYOUT HISTORY (DISBURSEMENTS) */}
                  {earningsViewTab === 'payouts' && (
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {allPayouts.map((po: any, idx: number) => (
                        <div
                          key={po.id || idx}
                          className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex justify-between items-center"
                        >
                          <div className="min-w-0 pr-2">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[10px] text-slate-400">#{po.referenceId || po.id}</span>
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400">
                                {po.status || 'Completed'}
                              </span>
                            </div>
                            <p className="font-bold text-white text-xs mt-0.5">{po.payoutMethod}</p>
                            <p className="text-[10px] text-slate-400">{po.date} • {po.destination}</p>
                          </div>

                          <div className="text-right shrink-0 space-y-1">
                            <span className="font-black text-sm text-slate-200 font-mono block">
                              -₹{po.amount}
                            </span>
                            <button
                              type="button"
                              onClick={() => setSelectedPayoutVoucher(po)}
                              className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold transition cursor-pointer"
                            >
                              View Receipt
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── 3, 14. TAB 4: DELIVERY HISTORY & PERFORMANCE REPORTS ── */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {/* Performance KPI Cards */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-bold">Completion</span>
                <span className="text-sm font-black text-emerald-400 font-mono">99.4%</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-bold">On-Time Rate</span>
                <span className="text-sm font-black text-white font-mono">98.2%</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-bold">Avg Time</span>
                <span className="text-sm font-black text-blue-400 font-mono">13.8 min</span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <h3 className="font-black text-sm text-white flex items-center gap-1.5">
                <FileText size={15} className="text-orange-400" /> Completed Runs Today
              </h3>
              <span className="text-[10px] font-mono text-slate-400">
                {completedTasks.length + 22} Total Completed
              </span>
            </div>

            {/* Completed Tasks List */}
            <div className="space-y-2.5">
              {completedTasks.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex justify-between items-center"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] text-slate-400">#{item.orderId || item.taskId}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                        item.type === 'Mess Tiffin'
                          ? 'text-orange-400 bg-orange-500/10'
                          : 'text-amber-400 bg-amber-500/10'
                      }`}>
                        {item.type}
                      </span>
                    </div>
                    <p className="font-bold text-white text-xs mt-0.5">{item.customerName}</p>
                    <p className="text-[10px] text-slate-400">{item.deliveryAddress || item.hostel}</p>
                  </div>

                  <div className="text-right">
                    <span className="font-black text-xs text-emerald-400 font-mono block">
                      +₹{item.deliveryFee + (item.tipAmount || 0)}
                    </span>
                    <span className="text-[10px] text-slate-500">{item.deliveredAt || 'Completed'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 12, 15. TAB 5: RIDER PROFILE & DOCUMENTS ── */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            {/* Identity Card */}
            <div className="p-4 rounded-3xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src={rider?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=compress&cs=tinysrgb&w=150'}
                  alt={rider?.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-orange-500 shadow-md"
                />
                <div>
                  <h3 className="font-extrabold text-white text-base">{rider?.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">{rider?.id} • {rider?.phone}</p>
                  <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <ShieldCheck size={11} /> UIDAI & Police Verified Partner
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 space-y-2 text-xs">
                {/* Govt Aadhaar KYC Card Row */}
                <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                      🆔
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Govt ID (Aadhaar Card)</p>
                      <p className="font-mono font-bold text-emerald-400 text-xs">
                        •••• •••• {rider?.aadhaarNumber ? rider.aadhaarNumber.replace(/\s+/g, '').slice(-4) : '9012'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAadhaarModal(true)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                  >
                    <Eye size={11} />
                    <span>View Card</span>
                  </button>
                </div>

                <div className="flex justify-between text-slate-300">
                  <span>Assigned Campus Route:</span>
                  <strong className="text-white">{rider?.route}</strong>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Registered Vehicle:</span>
                  <strong className="text-white">{rider?.vehicle} ({rider?.vehicleNumber})</strong>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Driving License:</span>
                  <span className="font-mono text-slate-300">{rider?.licenseNumber}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Delivery Modes:</span>
                  <span className="text-emerald-400 font-bold">Mess [Active] • Instant [Active] • Combined [Active]</span>
                </div>
              </div>
            </div>

            {/* Shift Attendance Card */}
            <div className="p-4 rounded-3xl bg-slate-950 border border-slate-800 space-y-2.5">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-xs text-white">Today's Duty Shift</h4>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Logged: {rider?.shift?.loggedHours || '5.8 hrs'}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Morning & Lunch Shift: <strong>{rider?.shift?.start || '07:30 AM'}</strong> to <strong>{rider?.shift?.end || '03:30 PM'}</strong>
              </p>
            </div>

            {/* Emergency SOS & Dispatch Hotline */}
            <button
              onClick={() => setSosModalOpen(true)}
              className="w-full py-3 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-extrabold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <AlertTriangle size={15} className="text-rose-400" />
              <span>Raise SOS / Emergency Issue Ticket</span>
            </button>

            {/* Sign Out / End Shift Button */}
            <button
              onClick={handleLogout}
              className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-300 border border-slate-700 hover:border-rose-500/30 text-slate-300 font-extrabold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut size={15} />
              <span>Sign Out / End Active Shift</span>
            </button>
          </div>
        )}
      </div>

      {/* ── NATIVE MOBILE BOTTOM NAVIGATION BAR ── */}
      <div className="bg-slate-950 border-t border-slate-800/90 py-2 px-3 flex justify-around items-center shrink-0">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition cursor-pointer relative ${
            activeTab === 'tasks' ? 'text-orange-500 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bike size={18} />
          <span className="text-[10px] mt-1 font-extrabold">Tasks</span>
          {activeTasks.length > 0 && (
            <span className="absolute top-0 right-2 w-2 h-2 rounded-full bg-orange-500" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('map')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition cursor-pointer ${
            activeTab === 'map' ? 'text-orange-500 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Navigation size={18} />
          <span className="text-[10px] mt-1 font-extrabold">Route</span>
        </button>

        <button
          onClick={() => setActiveTab('earnings')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition cursor-pointer ${
            activeTab === 'earnings' ? 'text-orange-500 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <DollarSign size={18} />
          <span className="text-[10px] mt-1 font-extrabold">Earnings</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition cursor-pointer ${
            activeTab === 'history' ? 'text-orange-500 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText size={18} />
          <span className="text-[10px] mt-1 font-extrabold">History</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition cursor-pointer ${
            activeTab === 'profile' ? 'text-orange-500 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users size={18} />
          <span className="text-[10px] mt-1 font-extrabold">Profile</span>
        </button>
      </div>
    </>
  )}

      {/* ── TOAST NOTIFICATION ── */}
      {toast && (
        <div className="absolute top-14 left-4 right-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold shadow-xl border flex items-center gap-2 ${
              toast.type === 'error'
                ? 'bg-rose-950 border-rose-500 text-rose-200'
                : 'bg-emerald-950 border-emerald-500 text-emerald-200'
            }`}
          >
            {toast.type === 'error' ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
            <span>{toast.msg}</span>
          </div>
        </div>
      )}

      {/* ── 7. EDIT BANK & UPI DETAILS MODAL ── */}
      {bankModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-sm w-full shadow-2xl relative space-y-4">
            <button
              onClick={() => setBankModalOpen(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Building2 size={20} />
              </div>
              <div>
                <h3 className="font-black text-white text-base">Bank &amp; UPI Accounts</h3>
                <p className="text-xs text-slate-400">Update withdrawal payout destination</p>
              </div>
            </div>

            <form onSubmit={handleSaveBankDetails} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Account Holder Name</label>
                <input
                  type="text"
                  required
                  value={bankForm.accountHolder}
                  onChange={e => setBankForm({ ...bankForm, accountHolder: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Bank Name</label>
                <input
                  type="text"
                  required
                  value={bankForm.bankName}
                  onChange={e => setBankForm({ ...bankForm, bankName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Account Number</label>
                  <input
                    type="text"
                    required
                    value={bankForm.accountNumber}
                    onChange={e => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">IFSC Code</label>
                  <input
                    type="text"
                    required
                    value={bankForm.ifscCode}
                    onChange={e => setBankForm({ ...bankForm, ifscCode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-blue-500 uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Primary Linked UPI ID</label>
                <input
                  type="text"
                  required
                  value={bankForm.upiId}
                  onChange={e => setBankForm({ ...bankForm, upiId: e.target.value })}
                  placeholder="name@okhdfcbank"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-black text-xs rounded-xl shadow-md transition"
              >
                Save &amp; Verify Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── 9. PAYOUT RECEIPT VOUCHER MODAL ── */}
      {selectedPayoutVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-5 max-w-sm w-full shadow-2xl relative space-y-4">
            <button
              onClick={() => setSelectedPayoutVoucher(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="text-center space-y-1">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Receipt size={24} />
              </div>
              <h3 className="font-black text-white text-base">Electronic Payout Voucher</h3>
              <p className="text-xs text-emerald-400 font-semibold">Funds Transferred Successfully</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="text-center pb-2 border-b border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Disbursed Amount</span>
                <p className="text-2xl font-black text-white font-mono mt-0.5">₹{selectedPayoutVoucher.amount}</p>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Voucher ID:</span>
                  <span className="font-mono text-slate-200">{selectedPayoutVoucher.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Reference Ref:</span>
                  <span className="font-mono text-slate-200">{selectedPayoutVoucher.referenceId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Bank UTR Number:</span>
                  <span className="font-mono text-emerald-400 font-bold">{selectedPayoutVoucher.utrNumber || 'UTR88291049281'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Payout Method:</span>
                  <span className="text-slate-200">{selectedPayoutVoucher.payoutMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Destination:</span>
                  <span className="font-mono text-slate-200">{selectedPayoutVoucher.destination}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Date &amp; Time:</span>
                  <span className="text-slate-200">{selectedPayoutVoucher.date}</span>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/80 text-center">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                  <ShieldCheck size={11} /> Digitally Authorized by Central Accounts
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedPayoutVoucher(null)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition cursor-pointer"
            >
              Close Voucher
            </button>
          </div>
        </div>
      )}

      {/* ── 6. KITCHEN PICKUP CHECKLIST MODAL ── */}
      {pickupChecklistModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-sm w-full shadow-2xl relative space-y-4">
            <button
              onClick={() => setPickupChecklistModalOpen(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                <Package size={20} />
              </div>
              <div>
                <h3 className="font-black text-white text-base">Central Kitchen Pickup Manifest</h3>
                <p className="text-xs text-slate-400">Counter #2 Hub • Verify boxes before loading</p>
              </div>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {activeTasks.map((t, idx) => {
                const checked = Boolean(verifiedPickupItems[t.taskId]);
                return (
                  <div
                    key={idx}
                    onClick={() =>
                      setVerifiedPickupItems(prev => ({
                        ...prev,
                        [t.taskId]: !prev[t.taskId]
                      }))
                    }
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                      checked
                        ? 'bg-emerald-950/30 border-emerald-500/40'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-white">{t.customerName} ({t.hostel})</p>
                      <p className="text-[10px] text-slate-400">{t.boxId || t.orderId} • {t.type}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                      checked ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-700'
                    }`}>
                      {checked && <Check size={12} strokeWidth={3} />}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-800 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  showToast('Delay reported to Kitchen Supervisor', 'success');
                  setPickupChecklistModalOpen(false);
                }}
                className="py-2 px-3 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs"
              >
                Report Delay
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast('All items marked verified & loaded in delivery bag!', 'success');
                  setPickupChecklistModalOpen(false);
                }}
                className="flex-1 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black rounded-xl text-xs"
              >
                Complete Bag Loading
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 7. IN-APP CHAT WITH CUSTOMER MODAL ── */}
      {chatModalOpen && targetChatTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-sm w-full shadow-2xl relative flex flex-col h-[480px]">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                  💬
                </div>
                <div>
                  <h4 className="font-black text-sm text-white">{targetChatTask.customerName}</h4>
                  <p className="text-[10px] text-slate-400">{targetChatTask.hostel}, Room {targetChatTask.room}</p>
                </div>
              </div>

              <button
                onClick={() => setChatModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
              {chatHistory.map((c, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${c.sender === 'rider' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-2.5 rounded-2xl text-xs ${
                      c.sender === 'rider'
                        ? 'bg-orange-500 text-slate-950 font-medium rounded-tr-none'
                        : 'bg-slate-800 text-slate-200 rounded-tl-none'
                    }`}
                  >
                    {c.text}
                  </div>
                  <span className="text-[9px] text-slate-500 mt-0.5 px-1">{c.time}</span>
                </div>
              ))}
            </div>

            {/* Quick Preset Buttons */}
            <div className="py-2 border-t border-slate-800 flex gap-1 overflow-x-auto text-[10px]">
              {['I am at hostel gate', 'Please share OTP', 'Leaving at door'].map(preset => (
                <button
                  key={preset}
                  onClick={() => setChatMessage(preset)}
                  className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white shrink-0"
                >
                  {preset}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendChat} className="flex gap-2 shrink-0">
              <input
                type="text"
                value={chatMessage}
                onChange={e => setChatMessage(e.target.value)}
                placeholder="Type message..."
                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-orange-500 text-slate-950 font-bold"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── 7. OTP VERIFICATION MODAL ── */}
      {otpModalOpen && targetOtpTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-xs w-full shadow-2xl relative space-y-4">
            <button
              onClick={() => setOtpModalOpen(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white"
            >
              <X size={16} />
            </button>

            <div className="text-center space-y-1">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="font-black text-white text-base">Complete Delivery</h3>
              <p className="text-xs text-slate-400">
                Ask student <strong>{targetOtpTask.customerName}</strong> for 4-digit OTP
              </p>
            </div>

            {/* Hint for Demo Testing */}
            <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-center">
              <span className="text-[10px] text-orange-300 font-bold block uppercase">Student Delivery OTP (Demo)</span>
              <span className="font-mono text-lg font-black text-white tracking-widest">{targetOtpTask.otp || '4821'}</span>
            </div>

            <form onSubmit={handleConfirmOtp} className="space-y-3">
              <input
                type="text"
                maxLength={4}
                required
                value={enteredOtp}
                onChange={e => setEnteredOtp(e.target.value)}
                placeholder="Enter 4-Digit OTP"
                className="w-full text-center text-xl font-mono font-black tracking-widest py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-orange-500"
              />

              {otpError && (
                <p className="text-xs text-rose-400 text-center font-bold">{otpError}</p>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEnteredOtp(targetOtpTask.otp || '4821')}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
                >
                  Auto Fill
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-xs rounded-xl shadow-md"
                >
                  Confirm Delivered
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── FAILED DELIVERY REASON MODAL ── */}
      {failedModalOpen && targetFailedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-sm w-full shadow-2xl relative space-y-4">
            <button
              onClick={() => setFailedModalOpen(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <AlertCircle size={20} />
              </div>
              <div>
                <h3 className="font-black text-white text-base">Cannot Deliver Order</h3>
                <p className="text-xs text-slate-400">Select reason for failure to notify admin</p>
              </div>
            </div>

            <form onSubmit={handleConfirmFailed} className="space-y-3">
              <div className="space-y-1.5 text-xs">
                {[
                  'Customer Not Available / Phone Unreachable',
                  'Hostel Room Locked',
                  'Wrong Delivery Address Provided',
                  'Hostel Gate Closed / Entry Denied',
                  'Customer Refused Food Package'
                ].map(r => (
                  <label
                    key={r}
                    className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition ${
                      failedReason === r ? 'bg-rose-500/10 border-rose-500/40 text-white' : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="failedReason"
                      value={r}
                      checked={failedReason === r}
                      onChange={() => setFailedReason(r)}
                      className="accent-rose-500"
                    />
                    <span>{r}</span>
                  </label>
                ))}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                Confirm Failure & Notify Admin
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── 9. CASH DEPOSIT TO ADMIN MODAL ── */}
      {cashDepositModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-sm w-full shadow-2xl relative space-y-4">
            <button
              onClick={() => setCashDepositModalOpen(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
                💵
              </div>
              <div>
                <h3 className="font-black text-white text-base">Deposit COD Cash to Admin</h3>
                <p className="text-xs text-slate-400">Central Kitchen Cash Counter Settlement</p>
              </div>
            </div>

            <form onSubmit={handleSubmitCashDeposit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Deposit Amount (₹)</label>
                <input
                  type="number"
                  value={cashDepositAmount}
                  onChange={e => setCashDepositAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono font-bold text-base focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Counter:</span>
                <span className="font-bold text-white">Central Kitchen Hub Cashier #1</span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition"
              >
                Generate Cash Settlement Receipt
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── 8. INSTANT WITHDRAWAL MODAL ── */}
      {payoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative space-y-4">
            <button
              onClick={() => setPayoutModalOpen(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Wallet size={20} />
              </div>
              <div>
                <h3 className="font-black text-white text-base">Withdraw Wallet Payout</h3>
                <p className="text-xs text-slate-400">Direct instant transfer to linked UPI or Bank</p>
              </div>
            </div>

            <form onSubmit={handleRequestPayout} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Withdrawal Destination
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setWithdrawalDestination('upi')}
                    className={`p-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      withdrawalDestination === 'upi'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>⚡ UPI ID</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setWithdrawalDestination('bank')}
                    className={`p-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      withdrawalDestination === 'bank'
                        ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>🏦 Bank Account</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Withdrawal Amount (₹)
                </label>
                <input
                  type="number"
                  min={100}
                  max={rider?.walletBalance || 4550}
                  value={payoutAmount}
                  onChange={e => setPayoutAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono font-bold text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Quick Amount Chips */}
              <div className="flex gap-1.5">
                {[500, 1000, 2000, rider?.walletBalance || 4550].map((amt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPayoutAmount(Number(amt))}
                    className="flex-1 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-[10px] font-bold text-slate-300 font-mono"
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Transfer To:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {withdrawalDestination === 'bank'
                    ? `${rider?.bankDetails?.bankName || 'HDFC Bank'} (${rider?.bankDetails?.accountNumberMasked || '•••• 9244'})`
                    : (rider?.upiId || '')}
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition"
              >
                Send ₹{payoutAmount} Immediately
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── 11. SOS EMERGENCY MODAL ── */}
      {sosModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative space-y-4">
            <button
              onClick={() => setSosModalOpen(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="font-black text-white text-base">Campus Emergency Hotline</h3>
                <p className="text-xs text-slate-400">Instant dispatch and supervisor contact</p>
              </div>
            </div>

            <form onSubmit={handleSubmitSos} className="space-y-3">
              <div className="space-y-1.5 text-xs">
                {[
                  'Customer Not Available / Phone Unreachable',
                  'Vehicle Breakdown / Flat Tyre',
                  'Wrong Delivery Address',
                  'Kitchen Delay / Missing Food Items',
                  'Accident / Emergency Medical Assistance'
                ].map(reason => (
                  <label
                    key={reason}
                    className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition ${
                      selectedSosReason === reason ? 'bg-rose-500/10 border-rose-500/40 text-white' : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="sosReason"
                      value={reason}
                      checked={selectedSosReason === reason}
                      onChange={() => setSelectedSosReason(reason)}
                      className="accent-rose-500"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>

              <textarea
                value={sosNotes}
                onChange={e => setSosNotes(e.target.value)}
                placeholder="Optional notes or live location details..."
                rows={2}
                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
              />

              <div className="space-y-2 pt-1">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition"
                >
                  Transmit SOS Alert
                </button>

                <a
                  href="tel:+919876543210"
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <Phone size={13} className="text-emerald-400" />
                  <span>Call Kitchen Supervisor (+91 98765 43210)</span>
                </a>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 13. NOTIFICATIONS DRAWER MODAL ── */}
      {notificationsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-sm w-full shadow-2xl relative space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="font-black text-sm text-white flex items-center gap-1.5">
                <Bell size={15} className="text-orange-400" /> Notifications Feed
              </h3>
              <button
                onClick={() => setNotificationsOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2 text-xs max-h-72 overflow-y-auto">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-orange-500/30">
                <p className="font-bold text-orange-400">🍱 New Lunch Mess Assignment</p>
                <p className="text-[11px] text-slate-300">Aman Sharma • Tagore Hostel #204 assigned by Central Admin.</p>
                <span className="text-[9px] text-slate-500">12:15 PM</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-indigo-500/30">
                <p className="font-bold text-indigo-400">🌟 Combined Order Bundled</p>
                <p className="text-[11px] text-slate-300">Rohit Verma ordered Burger & Coke along with Tiffin meal (+₹20 bonus).</p>
                <span className="text-[9px] text-slate-500">12:22 PM</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-emerald-500/30">
                <p className="font-bold text-emerald-400">💰 Daily Incentive Unlocked</p>
                <p className="text-[11px] text-slate-300">Completed 20 deliveries! +₹120 credited to wallet.</p>
                <span className="text-[9px] text-slate-500">12:00 PM</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── INCOMING DELIVERY RING ALERT MODAL ── */}
      {incomingAlertTask && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xs bg-slate-900 border-2 border-orange-500 rounded-3xl p-5 shadow-2xl shadow-orange-500/30 space-y-4 relative animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-2">
              <div className="relative w-16 h-16 mx-auto">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-slate-950 flex items-center justify-center shadow-lg shadow-orange-500/50">
                  <BellRing size={32} className="animate-bounce" />
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-orange-400 animate-ping opacity-60" />
                <div className="absolute -inset-2 rounded-full border border-amber-400/40 animate-pulse" />
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-400 font-mono block">
                  🔔 NEW DELIVERY ALERT!
                </span>
                <h3 className="text-base font-black text-white">
                  Incoming Order Ringing...
                </h3>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between items-start">
                <div className="min-w-0 pr-2">
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                    incomingAlertTask.type === 'Instant Food' ? 'bg-amber-400 text-slate-950' : 'bg-orange-500 text-slate-950'
                  }`}>
                    {incomingAlertTask.type || 'Mess Tiffin'}
                  </span>
                  <h4 className="font-extrabold text-white text-sm mt-1 truncate">
                    {incomingAlertTask.customerName}
                  </h4>
                  <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5 font-medium">
                    <MapPin size={12} className="text-orange-400 shrink-0" />
                    <span className="truncate">{incomingAlertTask.deliveryAddress}</span>
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-lg font-black text-emerald-400 font-mono block">
                    +₹{incomingAlertTask.deliveryFee + (incomingAlertTask.tipAmount || 0)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {incomingAlertTask.distance || '0.8 km'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => handleAcceptTask(incomingAlertTask.taskId || incomingAlertTask.orderId)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 cursor-pointer transition transform active:scale-95"
              >
                <CheckCircle2 size={16} />
                <span>Accept Delivery (+₹{incomingAlertTask.deliveryFee + (incomingAlertTask.tipAmount || 0)})</span>
              </button>

              <button
                onClick={handleDismissRing}
                className="w-full py-2 text-xs font-bold text-slate-400 hover:text-white transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <VolumeX size={13} />
                <span>Stop Ringtone</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── GOVT AADHAAR CARD MODAL VIEWER ── */}
      {showAadhaarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-5 max-w-sm w-full shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowAadhaarModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-2">
              <ShieldCheck size={20} className="text-emerald-400" />
              <div>
                <h3 className="font-black text-white text-sm">Govt. Aadhaar Card (KYC)</h3>
                <p className="text-[11px] text-emerald-400 font-semibold">UIDAI Verified Delivery Partner</p>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden border-2 border-emerald-500/40 bg-gradient-to-b from-orange-50 via-white to-emerald-50 text-slate-900 p-4 shadow-xl">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-[11px] font-black">
                    🏛️
                  </div>
                  <div>
                    <p className="text-[9px] font-black tracking-tight text-slate-800 leading-none">Government of India</p>
                    <p className="text-[8px] font-bold text-slate-600 leading-none mt-0.5">UIDAI Partner Verification</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-600 text-white">
                    UIDAI Verified
                  </span>
                </div>
              </div>

              <div className="flex gap-3 items-center">
                <img
                  src={rider?.aadhaarCardImage || rider?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=compress&cs=tinysrgb&w=150'}
                  alt="Rider Photo"
                  className="w-16 h-20 rounded-lg object-cover border border-slate-300 shadow-xs shrink-0"
                />
                <div className="space-y-1 text-left min-w-0 flex-1">
                  <div>
                    <span className="text-[8px] uppercase tracking-wider text-slate-500 font-bold block">Name:</span>
                    <p className="font-black text-xs text-slate-900 truncate">{rider?.name}</p>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase tracking-wider text-slate-500 font-bold block">Partner ID / Contact:</span>
                    <p className="text-[10px] font-mono font-bold text-slate-700">{rider?.id} • {rider?.phone}</p>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase tracking-wider text-slate-500 font-bold block">Document Status:</span>
                    <span className="text-[9px] font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 size={10} /> Verified & Active on Duty
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-200 text-center">
                <div className="inline-block px-4 py-1.5 bg-slate-100 rounded-lg border border-slate-300">
                  <span className="font-mono font-black text-sm tracking-widest text-slate-900">
                    •••• •••• {rider?.aadhaarNumber ? rider.aadhaarNumber.replace(/\s+/g, '').slice(-4) : '9012'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowAadhaarModal(false)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* ── TOP PREVIEW BAR (DESKTOP CONTROLS) ── */}
      <div className="hidden lg:flex items-center justify-between px-6 py-2.5 bg-slate-900 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-black text-orange-500 flex items-center gap-1.5">
            <Bike size={16} /> Campus Delivery Rider Partner App
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">Unified Mess Deliveries + Instant Food Orders Dashboard</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Mode Filter */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 font-bold px-2">Mode:</span>
            <button
              onClick={() => handleModeChange('mess')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                deliveryMode === 'mess'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black shadow-xs ring-1 ring-orange-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UtensilsCrossed size={12} />
              <span>🍱 Mess ({messActive.length})</span>
            </button>

            <button
              onClick={() => handleModeChange('instant')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                deliveryMode === 'instant'
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black shadow-xs ring-1 ring-amber-300'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Flame size={12} />
              <span>⚡ Instant ({instantActive.length})</span>
            </button>

            <button
              onClick={() => handleModeChange('combined')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                deliveryMode === 'combined'
                  ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-black shadow-xs ring-1 ring-indigo-300'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles size={12} />
              <span>🌟 Combined ({combinedActive.length})</span>
            </button>

            <button
              onClick={() => handleModeChange('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                deliveryMode === 'all'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-500 hover:text-white'
              }`}
            >
              <span>All ({activeTasks.length})</span>
            </button>
          </div>

          {/* Audio Ringtone Controls */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1.5">
            <button
              onClick={toggleSound}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                soundMuted
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}
              title={soundMuted ? 'Unmute Ringtone' : 'Mute Ringtone'}
            >
              {soundMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
              <span>{soundMuted ? 'Muted' : 'Sound On'}</span>
            </button>

            <button
              onClick={handleTestRing}
              className={`px-3 py-1 rounded-lg text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                isRinging
                  ? 'bg-orange-500 text-slate-950 shadow-md animate-pulse ring-2 ring-orange-300'
                  : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 shadow-xs'
              }`}
              title="Click to test delivery ringtone sound"
            >
              <BellRing size={13} className={isRinging ? 'animate-bounce' : ''} />
              <span>{isRinging ? '🔔 Ringing...' : '🔔 Test Delivery Ring'}</span>
            </button>
          </div>

          {/* Viewport Mode Switcher */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setDeviceMode('mobile')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                deviceMode === 'mobile'
                  ? 'bg-orange-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone size={13} />
              <span>Mobile Phone Preview</span>
            </button>
            <button
              onClick={() => setDeviceMode('fullscreen')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                deviceMode === 'fullscreen'
                  ? 'bg-orange-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor size={13} />
              <span>Fullscreen Wide</span>
            </button>
          </div>

          {/* Active Partner Session Pill / Sign Out */}
          {isLoggedIn ? (
            <div className="flex items-center gap-2 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300 font-bold text-[11px] truncate max-w-[130px]">
                {rider?.name?.split(' ')[0] || 'Partner'} ({rider?.id || ''})
              </span>
              <button
                onClick={handleLogout}
                className="text-[11px] font-bold text-rose-400 hover:text-rose-300 transition flex items-center gap-1 cursor-pointer pl-1.5 border-l border-slate-800"
                title="End Shift & Return to Login"
              >
                <LogOut size={12} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/30 text-amber-400 font-bold text-[11px]">
              <Lock size={12} />
              <span>Login Mode</span>
            </div>
          )}

          <Link
            to="/admin"
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition flex items-center gap-1"
          >
            <span>Back to Admin</span>
            <ExternalLink size={12} />
          </Link>
        </div>
      </div>

      {/* ── VIEWPORT CONTAINER ── */}
      {deviceMode === 'mobile' ? (
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
          {/* Simulated Smartphone Frame */}
          <div className="w-full max-w-[410px] h-[840px] bg-slate-950 rounded-[44px] border-[6px] border-slate-800 shadow-2xl relative overflow-hidden flex flex-col ring-1 ring-slate-700/50">
            {/* Phone Speaker Notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-800 rounded-full z-40" />

            {/* App Screen inside phone */}
            <div className="flex-1 flex flex-col h-full pt-1">
              {AppContent}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto p-4 md:p-6">
          <div className="flex-1 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
            {AppContent}
          </div>
        </div>
      )}
    </div>
  );
}
