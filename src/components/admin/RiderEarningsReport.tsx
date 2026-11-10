import React, { useState, useEffect, useMemo } from 'react';
import {
  DollarSign,
  Calendar,
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Download,
  Printer,
  Receipt,
  CreditCard,
  ArrowUpRight,
  Utensils,
  ShoppingBag,
  Sparkles,
  RefreshCw,
  FileText,
  Layers,
  ChevronDown,
  ChevronRight,
  Eye,
  Check,
  X,
  Phone,
  ShieldCheck,
  Bike,
  Star,
  Info,
  CalendarDays,
  SlidersHorizontal,
  FileSpreadsheet,
  ArrowRight,
  CheckCircle,
  Building2,
  Wallet,
  BadgeCheck
} from 'lucide-react';
import { adminAPI } from '../../services/api';

export interface RiderEarningsReportProps {
  onNotify?: (msg: string, type: 'success' | 'error') => void;
  standalone?: boolean;
}

export default function RiderEarningsReport({
  onNotify = () => {},
  standalone = false
}: RiderEarningsReportProps) {
  // ── VIEW MODES ──
  // 'daily': Specific date ledger
  // 'monthly': Whole month with daily trend chart & breakdown
  // 'custom': Date range period
  // 'rider-passbook': Individual rider passbook & run audit
  const [viewMode, setViewMode] = useState<'daily' | 'monthly' | 'custom' | 'rider-passbook'>('daily');

  // Dynamic date helpers
  const todayDateStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const currentMonthStr = useMemo(() => todayDateStr.substring(0, 7), [todayDateStr]);

  // ── FILTER STATES ──
  const [selectedDate, setSelectedDate] = useState<string>(todayDateStr);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(todayDateStr);
  const [selectedRiderId, setSelectedRiderId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending'>('all');
  const [serviceFilter, setServiceFilter] = useState<'all' | 'mess' | 'instant'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // ── DATA STATE ──
  const [loading, setLoading] = useState<boolean>(true);
  const [reportData, setReportData] = useState<any>(null);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  // ── MODAL STATES ──
  const [settleModalOpen, setSettleModalOpen] = useState<boolean>(false);
  const [bulkSettleModalOpen, setBulkSettleModalOpen] = useState<boolean>(false);
  const [activeSettleRider, setActiveSettleRider] = useState<any | null>(null);
  const [voucherModalOpen, setVoucherModalOpen] = useState<boolean>(false);
  const [activeVoucher, setActiveVoucher] = useState<any | null>(null);
  const [runsModalOpen, setRunsModalOpen] = useState<boolean>(false);
  const [activeRunsRider, setActiveRunsRider] = useState<any | null>(null);

  // Settle form inputs
  const [settleForm, setSettleForm] = useState({
    paymentMethod: 'UPI',
    referenceId: '',
    notes: '',
    amount: 0
  });

  // Bulk settle form inputs
  const [bulkSettleForm, setBulkSettleForm] = useState({
    paymentMethod: 'UPI',
    referenceId: '',
    notes: 'Bulk Fleet Settlement for Completed Runs'
  });

  // Fetch report data from API
  const fetchReport = async () => {
    try {
      setLoading(true);
      const params: any = {
        period: viewMode === 'rider-passbook' ? 'monthly' : viewMode,
        date: selectedDate,
        month: selectedMonth,
        startDate,
        endDate,
        riderId: selectedRiderId,
        status: statusFilter,
        service: serviceFilter
      };

      const data = await adminAPI.getRiderEarningsReport(params);
      if (data && data.success) {
        setReportData(data);
      }
    } catch (err: any) {
      console.error('Failed to load rider earnings report:', err);
      onNotify(err.message || 'Error loading rider earnings data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [viewMode, selectedDate, selectedMonth, startDate, endDate, selectedRiderId, statusFilter, serviceFilter]);

  // Filter riders by search query
  const filteredRiders = useMemo(() => {
    if (!reportData?.riders) return [];
    if (!searchQuery.trim()) return reportData.riders;

    const q = searchQuery.toLowerCase();
    return reportData.riders.filter((r: any) =>
      r.name?.toLowerCase().includes(q) ||
      r.phone?.toLowerCase().includes(q) ||
      r.route?.toLowerCase().includes(q) ||
      r.vehicle?.toLowerCase().includes(q) ||
      r.id?.toLowerCase().includes(q) ||
      r.riderId?.toLowerCase().includes(q)
    );
  }, [reportData, searchQuery]);

  // Selected rider for deep-dive passbook
  const activeDeepDiveRider = useMemo(() => {
    if (!reportData?.riders || reportData.riders.length === 0) return null;
    if (selectedRiderId !== 'all') {
      return reportData.riders.find((r: any) => r.riderId === selectedRiderId || r.id === selectedRiderId) || reportData.riders[0];
    }
    return reportData.riders[0];
  }, [reportData, selectedRiderId]);

  // Open settle modal for individual rider
  const openSettleModal = (rider: any) => {
    setActiveSettleRider(rider);
    const amount = rider.totalPending > 0 ? rider.totalPending : rider.netEarnings;
    setSettleForm({
      paymentMethod: 'UPI',
      referenceId: `UPI-${Date.now().toString().slice(-8)}`,
      notes: `Payout settlement for ${rider.name} (${selectedDate})`,
      amount
    });
    setSettleModalOpen(true);
  };

  // Submit individual settlement
  const handleConfirmSettle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSettleRider) return;

    try {
      const res = await adminAPI.settleRiderEarnings({
        riderId: activeSettleRider.riderId || activeSettleRider.id,
        date: selectedDate,
        month: selectedMonth,
        amount: Number(settleForm.amount),
        paymentMethod: settleForm.paymentMethod,
        referenceId: settleForm.referenceId || `UPI-${Date.now().toString().slice(-8)}`,
        notes: settleForm.notes
      });

      if (res && res.success) {
        onNotify(res.message || 'Rider payout settled successfully!', 'success');
        setSettleModalOpen(false);
        setActiveVoucher(res.receipt);
        setVoucherModalOpen(true);
        fetchReport();
      }
    } catch (err: any) {
      onNotify(err.message || 'Settlement failed', 'error');
    }
  };

  // Open bulk settle modal
  const openBulkSettleModal = () => {
    const pendingRiders = reportData?.riders?.filter((r: any) => r.payoutStatus === 'pending') || [];
    if (pendingRiders.length === 0) {
      onNotify('No pending payouts found for this selection!', 'error');
      return;
    }
    setBulkSettleForm({
      paymentMethod: 'UPI',
      referenceId: `BATCH-${Date.now().toString().slice(-6)}`,
      notes: `Bulk fleet settlement for ${pendingRiders.length} pending riders`
    });
    setBulkSettleModalOpen(true);
  };

  // Submit bulk settlement
  const handleConfirmBulkSettle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const pendingRiders = reportData?.riders?.filter((r: any) => r.payoutStatus === 'pending') || [];
      const riderIds = pendingRiders.map((r: any) => r.riderId || r.id);

      const res = await adminAPI.bulkSettleRiderEarnings({
        date: selectedDate,
        month: selectedMonth,
        paymentMethod: bulkSettleForm.paymentMethod,
        referenceId: bulkSettleForm.referenceId,
        notes: bulkSettleForm.notes,
        riderIds
      });

      if (res && res.success) {
        onNotify(`Successfully settled ₹${res.totalAmount.toLocaleString('en-IN')} for ${res.settledCount} riders!`, 'success');
        setBulkSettleModalOpen(false);
        fetchReport();
      }
    } catch (err: any) {
      onNotify(err.message || 'Bulk settlement failed', 'error');
    }
  };

  // Open voucher modal
  const openVoucherModal = (rider: any) => {
    const voucher = {
      voucherId: `VCH-${selectedDate.replace(/-/g, '')}-${(rider.riderId || 'RDR').replace(/[^a-zA-Z0-9]/g, '')}`,
      riderId: rider.riderId || rider.id,
      riderName: rider.name,
      riderPhone: rider.phone,
      route: rider.route,
      vehicle: rider.vehicle,
      date: selectedDate,
      month: selectedMonth,
      deliveries: rider.totalDeliveries,
      messDeliveries: rider.messDeliveries,
      instantDeliveries: rider.instantDeliveries,
      perDeliveryRate: rider.perDeliveryRate || 35,
      baseEarnings: rider.baseEarnings,
      incentives: rider.incentives,
      tips: rider.tips,
      amount: rider.netEarnings,
      paymentMethod: 'UPI (Instant Transfer)',
      referenceId: `UTR-8912${Date.now().toString().slice(-6)}`,
      adminName: 'Operations Admin',
      status: 'completed',
      createdAt: new Date().toISOString()
    };
    setActiveVoucher(voucher);
    setVoucherModalOpen(true);
  };

  // Open delivery runs drawer
  const openRunsModal = (rider: any) => {
    setActiveRunsRider(rider);
    setRunsModalOpen(true);
  };

  // Export current table view as CSV
  const handleExportCSV = () => {
    if (!filteredRiders || filteredRiders.length === 0) {
      onNotify('No data available to export', 'error');
      return;
    }

    const headers = [
      'Rider ID',
      'Rider Name',
      'Phone',
      'Route',
      'Vehicle',
      'Rate Per Delivery (INR)',
      'Mess Tiffins Delivered',
      'Instant Orders Delivered',
      'Total Deliveries',
      'Base Commission (INR)',
      'Incentives (INR)',
      'Tips (INR)',
      'Net Earnings (INR)',
      'Paid Amount (INR)',
      'Pending Amount (INR)',
      'Payout Status'
    ];

    const rows = filteredRiders.map((r: any) => [
      `"${r.riderId || r.id}"`,
      `"${r.name}"`,
      `"${r.phone}"`,
      `"${r.route}"`,
      `"${r.vehicle}"`,
      r.perDeliveryRate || 35,
      r.messDeliveries || 0,
      r.instantDeliveries || 0,
      r.totalDeliveries || 0,
      r.baseEarnings || 0,
      r.incentives || 0,
      r.tips || 0,
      r.netEarnings || 0,
      r.totalPaid || 0,
      r.totalPending || 0,
      `"${r.payoutStatus}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rider_Earnings_Report_${viewMode}_${selectedDate || selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onNotify('Rider earnings report exported to CSV successfully!', 'success');
  };

  // Quick period helper
  const setQuickPeriod = (type: 'today' | 'yesterday' | 'week' | 'month') => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    if (type === 'today') {
      setSelectedDate(todayStr);
      setViewMode('daily');
    } else if (type === 'yesterday') {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      setSelectedDate(y.toISOString().split('T')[0]);
      setViewMode('daily');
    } else if (type === 'week') {
      const w = new Date(now);
      w.setDate(w.getDate() - 6);
      setStartDate(w.toISOString().split('T')[0]);
      setEndDate(todayStr);
      setViewMode('custom');
    } else if (type === 'month') {
      setSelectedMonth(todayStr.substring(0, 7));
      setViewMode('monthly');
    }
  };

  // Day navigation helper
  const navigateDay = (offset: number) => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + offset);
    setSelectedDate(d.toISOString().split('T')[0]);
    setViewMode('daily');
  };

  const summary = reportData?.summary || {
    totalEarnings: 0,
    totalDeliveries: 0,
    messDeliveries: 0,
    instantDeliveries: 0,
    totalPaid: 0,
    totalPending: 0,
    activeRidersCount: 0,
    avgEarningPerRider: 0,
    avgDeliveriesPerRider: 0,
    topEarner: { riderName: 'N/A', amount: 0, deliveries: 0 }
  };

  return (
    <div className="space-y-6">
      {/* ── 1. HEADER SECTION ── */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20 shrink-0">
            <DollarSign size={24} className="stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Rider Earnings & Payout Report
              </h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive date-wise, daily, and monthly earnings breakdown, delivery run ledger, and payout settlements.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <button
            onClick={fetchReport}
            disabled={loading}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Refresh Report Data"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin text-orange-500' : ''} />
            <span>Sync</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Printer size={13} />
            <span>Print Report</span>
          </button>

          {summary.totalPending > 0 && (
            <button
              onClick={openBulkSettleModal}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition flex items-center gap-1.5 cursor-pointer"
            >
              <CreditCard size={14} />
              <span>Settle All Pending (₹{summary.totalPending.toLocaleString('en-IN')})</span>
            </button>
          )}
        </div>
      </div>

      {/* ── 2. METRIC CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Fleet Earnings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-orange-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Fleet Earnings</span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-sm">
              ₹
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 tracking-tight">
            ₹{summary.totalEarnings.toLocaleString('en-IN')}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-slate-500">
            <span className="text-emerald-600 font-bold flex items-center gap-0.5">
              <TrendingUp size={13} /> ₹35/run rate
            </span>
            <span>•</span>
            <span>{summary.activeRidersCount} Active Riders</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-amber-500" />
        </div>

        {/* Completed Deliveries */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Deliveries</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Bike size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 tracking-tight">
            {summary.totalDeliveries} <span className="text-xs font-semibold text-slate-400">Runs</span>
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 border border-orange-200/60">
              {summary.messDeliveries} Tiffins
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60">
              {summary.instantDeliveries} Instant
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500" />
        </div>

        {/* Settled / Paid Out */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Paid Settlements</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2 tracking-tight">
            ₹{summary.totalPaid.toLocaleString('en-IN')}
          </p>
          <p className="text-xs font-medium text-slate-500 mt-2 flex items-center gap-1">
            <ShieldCheck size={13} className="text-emerald-500" /> Settled via UPI & Bank
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500" />
        </div>

        {/* Pending Settlements */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pending Liabilities</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 mt-2 tracking-tight">
            ₹{summary.totalPending.toLocaleString('en-IN')}
          </p>
          <p className="text-xs font-semibold text-amber-700 mt-2">
            {reportData?.riders?.filter((r: any) => r.payoutStatus === 'pending').length || 0} Riders awaiting payout
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500" />
        </div>

        {/* Top Performer */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-purple-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Top Fleet Earner</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Sparkles size={16} />
            </div>
          </div>
          <p className="text-base font-extrabold text-slate-900 mt-2 truncate" title={summary.topEarner?.riderName}>
            {summary.topEarner?.riderName || 'None'}
          </p>
          <div className="flex items-center justify-between mt-2 text-xs font-semibold text-slate-500">
            <span className="font-bold text-slate-800">₹{summary.topEarner?.amount?.toLocaleString('en-IN')}</span>
            <span className="text-purple-600 font-extrabold">{summary.topEarner?.deliveries} Runs</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500" />
        </div>
      </div>

      {/* ── 3. VIEW MODE TABS & CONTROL TOOLBAR ── */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        {/* Top Segmented Bar: View Modes & Quick Period Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pb-3 border-b border-slate-100">
          {/* Segmented View Mode Buttons */}
          <div className="inline-flex p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setViewMode('daily')}
              className={`px-4 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'daily'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar size={13} className={viewMode === 'daily' ? 'text-orange-500' : ''} />
              <span>Daily Report</span>
            </button>

            <button
              onClick={() => setViewMode('monthly')}
              className={`px-4 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'monthly'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays size={13} className={viewMode === 'monthly' ? 'text-orange-500' : ''} />
              <span>Monthly Overview</span>
            </button>

            <button
              onClick={() => setViewMode('custom')}
              className={`px-4 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'custom'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <SlidersHorizontal size={13} className={viewMode === 'custom' ? 'text-orange-500' : ''} />
              <span>Custom Range</span>
            </button>

            <button
              onClick={() => setViewMode('rider-passbook')}
              className={`px-4 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'rider-passbook'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users size={13} className={viewMode === 'rider-passbook' ? 'text-orange-500' : ''} />
              <span>Rider Passbook</span>
            </button>
          </div>

          {/* Quick Date Shortcuts */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
            <span className="text-slate-400 text-[11px] uppercase tracking-wider font-bold mr-1">Quick:</span>
            <button
              onClick={() => setQuickPeriod('today')}
              className={`px-3 py-1.5 rounded-lg border text-xs transition cursor-pointer ${
                selectedDate === todayDateStr && viewMode === 'daily'
                  ? 'bg-orange-50 text-orange-700 border-orange-300 font-extrabold shadow-2xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setQuickPeriod('yesterday')}
              className={`px-3 py-1.5 rounded-lg border text-xs transition cursor-pointer ${
                selectedDate !== todayDateStr && viewMode === 'daily'
                  ? 'bg-orange-50 text-orange-700 border-orange-300 font-extrabold shadow-2xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Yesterday
            </button>
            <button
              onClick={() => setQuickPeriod('week')}
              className={`px-3 py-1.5 rounded-lg border text-xs transition cursor-pointer ${
                viewMode === 'custom'
                  ? 'bg-orange-50 text-orange-700 border-orange-300 font-extrabold shadow-2xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setQuickPeriod('month')}
              className={`px-3 py-1.5 rounded-lg border text-xs transition cursor-pointer ${
                viewMode === 'monthly'
                  ? 'bg-orange-50 text-orange-700 border-orange-300 font-extrabold shadow-2xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              This Month
            </button>
          </div>
        </div>

        {/* Dynamic Filters Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Specific Date Picker & Prev/Next (In daily mode) */}
          {viewMode === 'daily' && (
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Select Date &amp; Day
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => navigateDay(-1)}
                  className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer shrink-0"
                  title="Previous Day"
                >
                  ←
                </button>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-orange-500 cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => navigateDay(1)}
                  className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer shrink-0"
                  title="Next Day"
                >
                  →
                </button>
              </div>
            </div>
          )}

          {/* Month Selector (In monthly or passbook mode) */}
          {(viewMode === 'monthly' || viewMode === 'rider-passbook') && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Select Month
              </label>
              <select
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-orange-500 cursor-pointer"
              >
                <option value="2026-10">October 2026 (Current)</option>
                <option value="2026-09">September 2026</option>
                <option value="2026-08">August 2026</option>
                <option value="2026-07">July 2026</option>
              </select>
            </div>
          )}

          {/* Custom Date Range */}
          {viewMode === 'custom' && (
            <>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-orange-500 cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-orange-500 cursor-pointer"
                />
              </div>
            </>
          )}

          {/* Rider Selector */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Filter by Rider
            </label>
            <select
              value={selectedRiderId}
              onChange={e => setSelectedRiderId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-orange-500 cursor-pointer"
            >
              <option value="all">All 14 Fleet Riders</option>
              {reportData?.riders?.map((r: any) => (
                <option key={r.riderId || r.id} value={r.riderId || r.id}>
                  {r.name} ({r.riderId || r.id}) - {r.route?.split(' ')[0]}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Payout Status
            </label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-orange-500 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending Settlement</option>
              <option value="paid">Settled / Paid</option>
            </select>
          </div>

          {/* Service Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Service Type
            </label>
            <select
              value={serviceFilter}
              onChange={e => setServiceFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-orange-500 cursor-pointer"
            >
              <option value="all">All Services (Mess + Instant)</option>
              <option value="mess">Mess Tiffins Only</option>
              <option value="instant">Instant Orders Only</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="sm:col-span-2 lg:col-span-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Search by Rider / Route / ID
            </label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by name, phone, vehicle, or route..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. DAILY EARNINGS BAR CHART (MONTHLY VIEW) ── */}
      {viewMode === 'monthly' && reportData?.dailyTimeline && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <TrendingUp size={16} className="text-orange-500" /> Daily Fleet Earnings Trend — {selectedMonth}
              </h3>
              <p className="text-xs text-slate-500">
                Click any bar to view the exact rider breakdown and deliveries for that date.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Selected Date
              </span>
              <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> Logged Days
              </span>
            </div>
          </div>

          {/* Bar Chart Graphic */}
          <div className="pt-2">
            <div className="flex items-end gap-1.5 h-40 border-b border-slate-100 pb-2 overflow-x-auto">
              {reportData.dailyTimeline.map((day: any) => {
                const maxEarning = 12000;
                const heightPct = Math.min(100, Math.max(14, (day.totalEarnings / maxEarning) * 100));
                const isSelected = selectedDate === day.date;

                return (
                  <div
                    key={day.date}
                    onClick={() => {
                      setSelectedDate(day.date);
                      setViewMode('daily');
                    }}
                    className="flex-1 min-w-[28px] flex flex-col items-center group cursor-pointer"
                    title={`${day.formattedDate}: ₹${day.totalEarnings.toLocaleString('en-IN')} (${day.totalDeliveries} deliveries)`}
                  >
                    <div className="text-[9px] font-bold text-slate-400 group-hover:text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity mb-1 font-mono">
                      ₹{Math.round(day.totalEarnings / 1000)}k
                    </div>
                    <div className="w-full bg-slate-100 rounded-t-lg h-full flex items-end overflow-hidden">
                      <div
                        style={{ height: `${heightPct}%` }}
                        className={`w-full transition-all duration-200 rounded-t-lg ${
                          isSelected
                            ? 'bg-gradient-to-t from-orange-600 to-amber-500 shadow-md shadow-orange-500/30'
                            : 'bg-gradient-to-t from-slate-300 to-slate-400 group-hover:from-orange-400 group-hover:to-amber-400'
                        }`}
                      />
                    </div>
                    <span className={`text-[10px] font-bold mt-1.5 ${isSelected ? 'text-orange-600 font-black' : 'text-slate-400'}`}>
                      {day.date.split('-')[2]}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-400 font-semibold mt-2 px-1">
              <span>{reportData.dailyTimeline[0]?.formattedDate || `01 ${selectedMonth}`}</span>
              <span>Daily Total Runs &amp; Commission Ledger</span>
              <span>{reportData.dailyTimeline[reportData.dailyTimeline.length - 1]?.formattedDate || `31 ${selectedMonth}`}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── 4B. DATE-WISE EARNINGS REPORT (DAY-BY-DAY AUDIT TABLE) ── */}
      {(viewMode === 'monthly' || viewMode === 'custom') && reportData?.dailyTimeline && (
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs space-y-0">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50/50">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <CalendarDays size={16} className="text-orange-500" />
                Date-Wise Fleet Earnings Audit (Day-by-Day Report)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Daily aggregated deliveries, mess vs instant distribution, paid vs pending settlements, and top earner per day.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1 rounded-xl">
              {reportData.dailyTimeline.length} Days Audited
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 border-b border-slate-200/80 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Date &amp; Day</th>
                  <th className="py-3 px-3 text-center">Total Runs</th>
                  <th className="py-3 px-3 text-center">🍱 Mess Tiffins</th>
                  <th className="py-3 px-3 text-center">⚡ Instant Food</th>
                  <th className="py-3 px-3 text-right">Fleet Earnings</th>
                  <th className="py-3 px-3 text-right">Settled (Paid)</th>
                  <th className="py-3 px-3 text-right">Pending</th>
                  <th className="py-3 px-3 text-center">Active Fleet</th>
                  <th className="py-3 px-4">Top Earner on Date</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {reportData.dailyTimeline.slice().reverse().map((day: any) => (
                  <tr key={day.date} className="hover:bg-orange-50/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{day.formattedDate}</div>
                      <div className="text-[10px] text-slate-400 uppercase font-mono">{day.dayName}</div>
                    </td>
                    <td className="py-3 px-3 text-center font-extrabold font-mono text-slate-900">
                      {day.totalDeliveries}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 font-bold text-[11px] border border-orange-200/60 font-mono">
                        {day.messDeliveries}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-bold text-[11px] border border-amber-200/60 font-mono">
                        {day.instantDeliveries}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-black font-mono text-slate-900">
                      ₹{day.totalEarnings.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-right font-bold font-mono text-emerald-600">
                      ₹{day.paidAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-right font-bold font-mono text-amber-600">
                      ₹{day.pendingAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-700">
                      {day.activeRiders} Riders
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800 text-xs truncate max-w-[140px]">
                        {day.topRider?.name || 'None'}
                      </div>
                      <div className="text-[10px] font-mono text-emerald-600 font-semibold">
                        ₹{day.topRider?.earnings?.toLocaleString('en-IN')}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          setSelectedDate(day.date);
                          setViewMode('daily');
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-[11px] transition shadow-2xs flex items-center gap-1 mx-auto cursor-pointer"
                        title="Inspect Day Ledger"
                      >
                        <Eye size={12} />
                        <span>View Day</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 5. ALL RIDERS EARNINGS LEDGER TABLE (DAILY / CUSTOM / MONTHLY) ── */}
      {(viewMode === 'daily' || viewMode === 'custom' || viewMode === 'monthly') && (
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50/50">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <FileSpreadsheet size={16} className="text-orange-500" />
                Fleet Earnings Ledger —{' '}
                <span className="text-slate-600 font-bold">
                  {viewMode === 'daily' ? `Date: ${selectedDate}` : viewMode === 'monthly' ? `Month: ${selectedMonth}` : `Period: ${startDate} to ${endDate}`}
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Showing {filteredRiders.length} fleet members with completed runs, commission rate, tips, and settlement actions.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-1 rounded-xl shadow-2xs">
                Base Payout Rate: <strong className="text-slate-900 font-extrabold">₹35 / delivery</strong>
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/90 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/80 select-none text-[10px]">
                <tr>
                  <th className="py-3 px-4">Rider Profile</th>
                  <th className="py-3 px-4">Route & Vehicle</th>
                  <th className="py-3 px-4 text-center">Mess Tiffins</th>
                  <th className="py-3 px-4 text-center">Instant Food</th>
                  <th className="py-3 px-4 text-center">Total Runs</th>
                  <th className="py-3 px-4">Base Commission</th>
                  <th className="py-3 px-4">Incentives & Tips</th>
                  <th className="py-3 px-4 font-black text-slate-900">Net Earnings</th>
                  <th className="py-3 px-4 text-center">Payout Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400">
                      <RefreshCw size={24} className="animate-spin mx-auto text-orange-500 mb-2" />
                      <p className="font-bold text-xs">Loading fleet earnings data...</p>
                    </td>
                  </tr>
                ) : filteredRiders.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400 font-semibold text-xs">
                      No rider earnings match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredRiders.map((rider: any) => {
                    const isPending = rider.payoutStatus === 'pending';
                    const isPartial = rider.payoutStatus === 'partially_paid';

                    return (
                      <tr key={rider.riderId || rider.id} className="hover:bg-slate-50/80 transition-colors group">
                        {/* Rider Profile */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={rider.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${rider.name}`}
                              alt={rider.name}
                              className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-extrabold text-slate-900 group-hover:text-orange-600 transition-colors">
                                  {rider.name}
                                </span>
                                {rider.kycStatus === 'verified' && (
                                  <ShieldCheck size={13} className="text-emerald-500" title="KYC Verified" />
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 font-mono">
                                {rider.riderId || rider.id} • {rider.phone}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Route & Vehicle */}
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-800 text-xs truncate max-w-[160px]" title={rider.route}>
                            {rider.route}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate max-w-[160px]">
                            {rider.vehicle}
                          </p>
                        </td>

                        {/* Mess Deliveries */}
                        <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                          <span className="px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 border border-orange-200/60 font-mono">
                            {rider.messDeliveries || 0}
                          </span>
                        </td>

                        {/* Instant Food */}
                        <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60 font-mono">
                            {rider.instantDeliveries || 0}
                          </span>
                        </td>

                        {/* Total Runs */}
                        <td className="py-3.5 px-4 text-center font-black text-slate-900">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-mono font-bold">
                            {rider.totalDeliveries || 0} Runs
                          </span>
                        </td>

                        {/* Base Earnings */}
                        <td className="py-3.5 px-4 font-bold text-slate-700 font-mono">
                          ₹{(rider.baseEarnings || 0).toLocaleString('en-IN')}
                        </td>

                        {/* Incentives & Tips */}
                        <td className="py-3.5 px-4 font-bold text-emerald-600 font-mono">
                          +₹{((rider.incentives || 0) + (rider.tips || 0)).toLocaleString('en-IN')}
                        </td>

                        {/* Net Earnings */}
                        <td className="py-3.5 px-4 font-black text-slate-900 text-sm font-mono">
                          ₹{(rider.netEarnings || 0).toLocaleString('en-IN')}
                        </td>

                        {/* Payout Status */}
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              rider.payoutStatus === 'paid'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                                : isPartial
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/80'
                                : 'bg-amber-50 text-amber-700 border border-amber-300'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                rider.payoutStatus === 'paid' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                              }`}
                            />
                            {rider.payoutStatus === 'paid' ? 'Settled' : isPartial ? 'Partial' : 'Pending'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isPending || isPartial ? (
                              <button
                                onClick={() => openSettleModal(rider)}
                                className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1"
                              >
                                <CreditCard size={12} />
                                <span>Settle</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => openVoucherModal(rider)}
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1"
                                title="Print Official Payout Voucher"
                              >
                                <Receipt size={12} />
                                <span>Pay Slip</span>
                              </button>
                            )}

                            <button
                              onClick={() => openRunsModal(rider)}
                              className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                              title="View Individual Delivery Runs"
                            >
                              <Eye size={15} />
                            </button>
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
      )}

      {/* ── 6. DAY-BY-DAY HISTORICAL BREAKDOWN TABLE (MONTHLY VIEW) ── */}
      {viewMode === 'monthly' && reportData?.dailyTimeline && (
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <CalendarDays size={16} className="text-orange-500" /> Day-by-Day Historical Ledger
              </h3>
              <p className="text-xs text-slate-500">
                Chronological list of all logged days with active fleet counts, total payout liability, and top performers.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/90 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/80 select-none text-[10px]">
                <tr>
                  <th className="py-3 px-4">Date & Day</th>
                  <th className="py-3 px-4 text-center">Active Fleet</th>
                  <th className="py-3 px-4 text-center">Mess Tiffins</th>
                  <th className="py-3 px-4 text-center">Instant Orders</th>
                  <th className="py-3 px-4 text-center">Total Runs</th>
                  <th className="py-3 px-4">Total Payout</th>
                  <th className="py-3 px-4">Settled Amount</th>
                  <th className="py-3 px-4">Pending Dues</th>
                  <th className="py-3 px-4">Top Performer</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[...reportData.dailyTimeline].reverse().map((day: any) => {
                  const isExpanded = expandedDay === day.date;
                  return (
                    <React.Fragment key={day.date}>
                      <tr
                        className={`hover:bg-slate-50/80 transition cursor-pointer ${
                          isExpanded ? 'bg-orange-50/30' : ''
                        }`}
                        onClick={() => setExpandedDay(isExpanded ? null : day.date)}
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900">{day.formattedDate}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                              {day.dayName}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                          {day.activeRiders} Riders
                        </td>

                        <td className="py-3.5 px-4 text-center font-mono font-bold text-orange-600">
                          {day.messDeliveries}
                        </td>

                        <td className="py-3.5 px-4 text-center font-mono font-bold text-blue-600">
                          {day.instantDeliveries}
                        </td>

                        <td className="py-3.5 px-4 text-center font-black text-slate-900 font-mono">
                          {day.totalDeliveries} Runs
                        </td>

                        <td className="py-3.5 px-4 font-black text-slate-900 font-mono">
                          ₹{day.totalEarnings.toLocaleString('en-IN')}
                        </td>

                        <td className="py-3.5 px-4 font-bold text-emerald-600 font-mono">
                          ₹{day.paidAmount.toLocaleString('en-IN')}
                        </td>

                        <td className="py-3.5 px-4 font-bold text-amber-600 font-mono">
                          {day.pendingAmount > 0 ? `₹${day.pendingAmount.toLocaleString('en-IN')}` : '₹0 (Settled)'}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-800 text-xs truncate block max-w-[130px]">
                            {day.topRider?.name || '-'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-200/60 transition"
                          >
                            <ChevronDown
                              size={16}
                              className={`transition-transform duration-200 ${isExpanded ? 'rotate-180 text-orange-600' : ''}`}
                            />
                          </button>
                        </td>
                      </tr>

                      {/* Expandable sub-row with rider breakdown for that day */}
                      {isExpanded && (
                        <tr className="bg-slate-50/70 border-y border-orange-100">
                          <td colSpan={10} className="p-4">
                            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
                              <div className="flex justify-between items-center">
                                <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                                  <Bike size={14} className="text-orange-500" /> Fleet Breakdown for {day.formattedDate}
                                </h4>
                                <button
                                  onClick={() => {
                                    setSelectedDate(day.date);
                                    setViewMode('daily');
                                  }}
                                  className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1 cursor-pointer"
                                >
                                  <span>Open in Daily View</span>
                                  <ArrowUpRight size={13} />
                                </button>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                                {day.riderBreakdown?.map((rb: any) => (
                                  <div
                                    key={rb.riderId}
                                    className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex justify-between items-center"
                                  >
                                    <div>
                                      <p className="font-bold text-xs text-slate-900 truncate max-w-[120px]">{rb.name}</p>
                                      <p className="text-[11px] text-slate-400 font-mono">{rb.deliveries} Runs</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-extrabold text-xs text-slate-900">₹{rb.earnings}</p>
                                      <span
                                        className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                                          rb.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                        }`}
                                      >
                                        {rb.status}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 7. RIDER DEEP-DIVE PASSBOOK VIEW ── */}
      {viewMode === 'rider-passbook' && activeDeepDiveRider && (
        <div className="space-y-6">
          {/* Executive Rider Profile Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={activeDeepDiveRider.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeDeepDiveRider.name}`}
                  alt={activeDeepDiveRider.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-orange-500 shadow-md shadow-orange-500/10"
                />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" title="Online" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-extrabold text-slate-900">{activeDeepDiveRider.name}</h2>
                  <span className="text-xs font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                    {activeDeepDiveRider.riderId || activeDeepDiveRider.id}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Active Fleet Partner
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1 font-bold text-slate-700">
                    <Bike size={13} className="text-orange-500" /> {activeDeepDiveRider.vehicle}
                  </span>
                  <span>•</span>
                  <span>{activeDeepDiveRider.route}</span>
                  <span>•</span>
                  <span className="font-mono">{activeDeepDiveRider.phone}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-amber-600 font-bold">
                    <Star size={12} className="fill-amber-400 text-amber-400" /> {activeDeepDiveRider.rating || 4.9}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs font-mono text-slate-500">
                  <span>UPI ID: <strong className="text-slate-800">{activeDeepDiveRider.upiId}</strong></span>
                  <span>•</span>
                  <span>Bank Account: <strong className="text-slate-800">{activeDeepDiveRider.bankAccount}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => openSettleModal(activeDeepDiveRider)}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <CreditCard size={14} />
                <span>Settle Earnings</span>
              </button>

              <button
                onClick={() => openVoucherModal(activeDeepDiveRider)}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Receipt size={14} />
                <span>Salary Voucher</span>
              </button>
            </div>
          </div>

          {/* Rider Month KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Month Earnings</span>
              <p className="text-2xl font-black text-slate-900 mt-1">
                ₹{(activeDeepDiveRider.netEarnings || 0).toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Base: ₹{activeDeepDiveRider.baseEarnings} + Inc: ₹{activeDeepDiveRider.incentives + activeDeepDiveRider.tips}
              </p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Runs Completed</span>
              <p className="text-2xl font-black text-blue-600 mt-1">
                {activeDeepDiveRider.totalDeliveries || 0} Runs
              </p>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                {activeDeepDiveRider.messDeliveries} Tiffins / {activeDeepDiveRider.instantDeliveries} Instant
              </p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Cleared Settlements</span>
              <p className="text-2xl font-black text-emerald-600 mt-1">
                ₹{(activeDeepDiveRider.totalPaid || 0).toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-slate-500 mt-1 font-medium">Settled via instant UPI transfer</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pending Dues</span>
              <p className="text-2xl font-black text-amber-600 mt-1">
                ₹{(activeDeepDiveRider.totalPending || 0).toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-amber-700 mt-1 font-medium">Ready for settlement</p>
            </div>
          </div>

          {/* Daily Statement Ledger for Selected Rider */}
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <FileText size={16} className="text-orange-500" /> Daily Statement Ledger — {activeDeepDiveRider.name}
              </h3>
              <span className="text-xs font-semibold text-slate-600">
                Rate: ₹{activeDeepDiveRider.perDeliveryRate || 35} / delivery
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/90 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/80 select-none text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-center">Mess Tiffins</th>
                    <th className="py-3 px-4 text-center">Instant Food</th>
                    <th className="py-3 px-4 text-center">Total Runs</th>
                    <th className="py-3 px-4">Base Earning</th>
                    <th className="py-3 px-4">Incentives & Tips</th>
                    <th className="py-3 px-4 font-black text-slate-900">Total Earned</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Reference ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {activeDeepDiveRider.dailyBreakdown?.map((day: any) => (
                    <tr key={day.date} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {day.date} <span className="text-[10px] text-slate-400 font-normal">({day.dayName})</span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-orange-600">
                        {day.messDeliveries}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-blue-600">
                        {day.instantDeliveries}
                      </td>
                      <td className="py-3.5 px-4 text-center font-black text-slate-900 font-mono">
                        {day.totalDeliveries}
                      </td>
                      <td className="py-3.5 px-4 font-mono">₹{day.baseEarnings}</td>
                      <td className="py-3.5 px-4 font-mono text-emerald-600">+₹{day.incentives + day.tips}</td>
                      <td className="py-3.5 px-4 font-black text-slate-900 font-mono">₹{day.netEarnings}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            day.status === 'paid'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-300'
                          }`}
                        >
                          {day.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-[10px] text-slate-400">
                        {day.settlementRef || 'PENDING'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── 8. MONTH-ON-MONTH ARCHIVED BENCHMARKS (MONTHLY VIEW) ── */}
      {viewMode === 'monthly' && reportData?.monthlyHistory && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Calendar size={16} className="text-orange-500" /> Month-on-Month Fleet Payout Benchmarks
            </h3>
            <span className="text-xs text-slate-400 font-medium">Archived Financial History</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {reportData.monthlyHistory.map((m: any) => (
              <div
                key={m.month}
                onClick={() => setSelectedMonth(m.month)}
                className={`p-4 rounded-xl border transition cursor-pointer ${
                  selectedMonth === m.month
                    ? 'border-orange-500 bg-orange-50/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-slate-900">{m.monthLabel}</span>
                  {m.isCurrentMonth && (
                    <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-xl font-black text-slate-900 mt-2 font-mono">
                  ₹{m.totalEarnings.toLocaleString('en-IN')}
                </p>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mt-1">
                  <span>{m.totalDeliveries} Deliveries</span>
                  <span className="text-emerald-600 font-bold">{m.activeRiders} Fleet Riders</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 9. MODAL: INDIVIDUAL RIDER PAYOUT SETTLEMENT ── */}
      {settleModalOpen && activeSettleRider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setSettleModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CreditCard size={20} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Settle Rider Payout</h3>
                <p className="text-xs text-slate-500">Record cleared payment and generate official settlement receipt</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 mb-4 flex items-center gap-3">
              <img
                src={activeSettleRider.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeSettleRider.name}`}
                alt={activeSettleRider.name}
                className="w-10 h-10 rounded-full object-cover border"
              />
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-slate-900 text-sm truncate">{activeSettleRider.name}</p>
                <p className="text-xs text-slate-500 truncate">
                  {activeSettleRider.route} • {activeSettleRider.phone}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Due Balance</span>
                <span className="font-black text-base text-emerald-600 font-mono">
                  ₹{(activeSettleRider.totalPending > 0 ? activeSettleRider.totalPending : activeSettleRider.netEarnings).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <form onSubmit={handleConfirmSettle} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Settlement Amount (INR)
                </label>
                <input
                  type="number"
                  required
                  value={settleForm.amount}
                  onChange={e => setSettleForm({ ...settleForm, amount: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={settleForm.paymentMethod}
                    onChange={e => setSettleForm({ ...settleForm, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="UPI">UPI (Google Pay / PhonePe)</option>
                    <option value="Bank Transfer">Bank Transfer (IMPS/NEFT)</option>
                    <option value="Cash">Cash Handover</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Transaction Ref / UTR
                  </label>
                  <input
                    type="text"
                    value={settleForm.referenceId}
                    onChange={e => setSettleForm({ ...settleForm, referenceId: e.target.value })}
                    placeholder="e.g. UTR-98124981"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Settlement Remarks (Optional)
                </label>
                <input
                  type="text"
                  value={settleForm.notes}
                  onChange={e => setSettleForm({ ...settleForm, notes: e.target.value })}
                  placeholder="e.g. Cleared via UPI at 11:30 AM"
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSettleModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Check size={14} />
                  <span>Confirm Settlement</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 10. MODAL: BULK SETTLEMENT MODAL ── */}
      {bulkSettleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setBulkSettleModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CreditCard size={20} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Bulk Settle Fleet Payouts</h3>
                <p className="text-xs text-slate-500">
                  Clear all pending rider payouts for {selectedDate || selectedMonth} at once
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/60 mb-4 flex justify-between items-center">
              <div>
                <p className="font-extrabold text-emerald-950 text-sm">
                  {reportData?.riders?.filter((r: any) => r.payoutStatus === 'pending').length || 0} Riders Pending
                </p>
                <p className="text-xs text-emerald-700">Total settlement liability across all pending routes</p>
              </div>
              <p className="text-xl font-black text-emerald-700 font-mono">
                ₹{summary.totalPending.toLocaleString('en-IN')}
              </p>
            </div>

            <form onSubmit={handleConfirmBulkSettle} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Batch Payment Method
                  </label>
                  <select
                    value={bulkSettleForm.paymentMethod}
                    onChange={e => setBulkSettleForm({ ...bulkSettleForm, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="UPI">UPI Fleet Transfer</option>
                    <option value="Bank Transfer">Bank Bulk NEFT</option>
                    <option value="Cash">Cash Handover</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Batch Reference ID
                  </label>
                  <input
                    type="text"
                    value={bulkSettleForm.referenceId}
                    onChange={e => setBulkSettleForm({ ...bulkSettleForm, referenceId: e.target.value })}
                    placeholder="e.g. BATCH-20261021"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Batch Remarks
                </label>
                <input
                  type="text"
                  value={bulkSettleForm.notes}
                  onChange={e => setBulkSettleForm({ ...bulkSettleForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBulkSettleModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Check size={14} />
                  <span>Settle All (₹{summary.totalPending.toLocaleString('en-IN')})</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 11. MODAL: OFFICIAL PAYOUT VOUCHER / SLIP ── */}
      {voucherModalOpen && activeVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setVoucherModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Voucher Header */}
            <div className="text-center pb-4 border-b border-dashed border-slate-200">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center font-black text-xl shadow-md shadow-orange-500/20 mb-2">
                🍱
              </div>
              <h3 className="font-extrabold text-slate-900 text-base uppercase tracking-wider">TiffinMate Mess Hub</h3>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">
                Official Rider Payout Voucher
              </p>
              <span className="inline-block px-2.5 py-0.5 mt-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-[10px] font-black uppercase">
                Payment Cleared • Paid via {activeVoucher.paymentMethod?.split(' ')[0] || 'UPI'}
              </span>
            </div>

            {/* Voucher Details */}
            <div className="py-4 space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Voucher ID:</span>
                <span className="font-mono font-bold text-slate-800">{activeVoucher.voucherId}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Rider Name:</span>
                <span className="font-extrabold text-slate-900">{activeVoucher.riderName}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Rider Code:</span>
                <span className="font-mono font-bold text-slate-800">{activeVoucher.riderId}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Assigned Route:</span>
                <span className="font-bold text-slate-800">{activeVoucher.route}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Period / Date:</span>
                <span className="font-bold text-slate-800">{activeVoucher.date || selectedDate}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Total Runs Delivered:</span>
                <span className="font-bold text-slate-800">{activeVoucher.deliveries || 18} Deliveries</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Per-Delivery Rate:</span>
                <span className="font-bold text-slate-800">₹{activeVoucher.perDeliveryRate || 35}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Transaction Ref:</span>
                <span className="font-mono font-bold text-slate-800">{activeVoucher.referenceId}</span>
              </div>

              <div className="pt-3 border-t border-dashed border-slate-200 flex justify-between items-center text-sm">
                <span className="font-extrabold text-slate-900">Net Amount Paid:</span>
                <span className="font-black text-xl text-emerald-600 font-mono">
                  ₹{Number(activeVoucher.amount || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Voucher Footer */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
              <span>Authorized: {activeVoucher.adminName || 'Operations Admin'}</span>
              <span>{new Date(activeVoucher.createdAt || Date.now()).toLocaleDateString('en-IN')}</span>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer size={13} />
                <span>Print Slip</span>
              </button>
              <button
                onClick={() => setVoucherModalOpen(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 12. MODAL: INDIVIDUAL RUNS & DELIVERIES DRAWER ── */}
      {runsModalOpen && activeRunsRider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
            <button
              onClick={() => setRunsModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <img
                src={activeRunsRider.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeRunsRider.name}`}
                alt={activeRunsRider.name}
                className="w-12 h-12 rounded-2xl object-cover border"
              />
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {activeRunsRider.name} — Delivery Run History
                </h3>
                <p className="text-xs text-slate-500">
                  {activeRunsRider.route} • {activeRunsRider.totalDeliveries} Completed Deliveries Log
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              {activeRunsRider.deliveries && activeRunsRider.deliveries.length > 0 ? (
                activeRunsRider.deliveries.map((run: any) => (
                  <div
                    key={run.runId}
                    className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-slate-400">{run.runId}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                            run.type === 'Mess Tiffin'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {run.type}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold">{run.time}</span>
                      </div>
                      <p className="font-extrabold text-slate-900 text-xs mt-1">
                        {run.customerName} • <span className="text-slate-500 font-normal">{run.deliveryAddress}</span>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-black text-xs text-slate-900 font-mono block">
                        +₹{run.totalEarned || run.deliveryFee || 35}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center justify-end gap-1">
                        <CheckCircle2 size={11} /> {run.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400 font-semibold text-xs">
                  No individual run logs found for this rider.
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-500">
                Total Runs: <strong className="text-slate-900 font-extrabold">{activeRunsRider.totalDeliveries}</strong>
              </span>
              <button
                onClick={() => setRunsModalOpen(false)}
                className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs cursor-pointer"
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
