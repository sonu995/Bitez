import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChefHat,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Package,
  RefreshCw,
  Utensils,
  Search,
  ArrowLeft,
  Flame,
  Sparkles,
  Bike,
  ToggleLeft,
  ToggleRight,
  Layers
} from 'lucide-react';
import { kitchenAPI, adminAPI } from '../services/api';

const KitchenPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'kot' | 'mess' | 'stock'>('kot');
  const [slotFilter, setSlotFilter] = useState<'All' | 'Breakfast' | 'Lunch' | 'Dinner'>('All');
  const [stockSearch, setStockSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [kots, setKots] = useState<any[]>([]);
  const [messRoster, setMessRoster] = useState<any[]>([]);
  const [messBatches, setMessBatches] = useState<any>({});
  const [stock, setStock] = useState<{ dishes: any[]; extras: any[] }>({ dishes: [], extras: [] });
  const [toast, setToast] = useState<string>('');
  const [actionBusy, setActionBusy] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const ensureAdminSession = async () => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    if (!token) {
      try {
        const res = await adminAPI.quickLogin();
        if (res?.token) {
          localStorage.setItem('adminToken', res.token);
        }
      } catch {}
    }
  };

  const fetchQueue = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      await ensureAdminSession();
      const res = await kitchenAPI.getQueue();
      if (res?.success) {
        setKots(res.kots || []);
        setMessRoster(res.messRoster || []);
        setMessBatches(res.messBatches || {});
        setStock(res.stock || { dishes: [], extras: [] });
      }
    } catch (err: any) {
      if (!silent) showToast(err.message || 'Could not load kitchen queue');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue(false);
    const interval = setInterval(() => fetchQueue(true), 8000);
    return () => clearInterval(interval);
  }, []);

  const handleKotAction = async (orderId: string, status: string, kitchenReady = false) => {
    setActionBusy(orderId);
    try {
      await kitchenAPI.updateKotStatus(orderId, { status, kitchenReady });
      showToast(`Order #${orderId.slice(-4)} updated to ${status.toUpperCase()}`);
      await fetchQueue(true);
    } catch (err: any) {
      showToast(err.message || 'Failed to update KOT');
    } finally {
      setActionBusy(null);
    }
  };

  const handleMessBoxPack = async (dispatchId: string, nextStatus: string) => {
    setActionBusy(dispatchId);
    try {
      await kitchenAPI.updateMessBoxStatus(dispatchId, nextStatus);
      showToast(`Tiffin Box #${dispatchId.slice(-4)} marked ${nextStatus.toUpperCase()}`);
      await fetchQueue(true);
    } catch (err: any) {
      showToast(err.message || 'Failed to update mess box');
    } finally {
      setActionBusy(null);
    }
  };

  const handleBatchPackSlot = async (slot: 'Breakfast' | 'Lunch' | 'Dinner') => {
    setActionBusy(`batch-${slot}`);
    try {
      const res = await kitchenAPI.batchPackMessSlot(slot);
      showToast(res?.message || `Packed all preparing ${slot} boxes!`);
      await fetchQueue(true);
    } catch (err: any) {
      showToast(err.message || 'Batch pack failed');
    } finally {
      setActionBusy(null);
    }
  };

  const handleToggleStock = async (type: 'dish' | 'extra', id: string, currentAvail: boolean) => {
    setActionBusy(id);
    try {
      await kitchenAPI.updateStock(type, id, { isAvailable: !currentAvail });
      showToast(`Item marked ${!currentAvail ? 'AVAILABLE' : 'OUT OF STOCK'}`);
      await fetchQueue(true);
    } catch (err: any) {
      showToast(err.message || 'Stock update failed');
    } finally {
      setActionBusy(null);
    }
  };

  const filteredMessRoster = messRoster.filter(d => {
    if (slotFilter === 'All') return true;
    const sl = (d.slot || d.mealSlot || '').toLowerCase();
    if (slotFilter === 'Breakfast') return sl.includes('breakfast');
    if (slotFilter === 'Lunch') return sl.includes('lunch') || (!sl.includes('breakfast') && !sl.includes('dinner'));
    return sl.includes('dinner');
  });

  const combinedExtrasCount = messRoster.filter(d => Boolean(d.hasAttachedExtras || (Array.isArray(d.attachedExtras) && d.attachedExtras.length > 0))).length;
  const unassignedCombinedCount = messRoster.filter(d =>
    (d.hasAttachedExtras || (Array.isArray(d.attachedExtras) && d.attachedExtras.length > 0)) &&
    (!d.rider || d.rider === 'Unassigned') &&
    (d.status || '').toLowerCase() !== 'delivered'
  ).length;
  const outOfStockCount = [...stock.dishes, ...stock.extras].filter(i => !i.isAvailable).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      {/* Top KDS Header */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to="/admin"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center gap-1.5 text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
                <span>Bitez Kitchen Display (KDS)</span>
                <span className="text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full animate-pulse">
                  Live Queue
                </span>
              </h1>
              <p className="text-[11px] text-slate-400">
                Instant KOT tickets, 3-slot Mess Tiffin Batching, Combined Extras & Stock Controls
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchQueue(false)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-orange-400' : ''}`} />
              <span>Sync Kitchen</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 bg-orange-500 text-white px-4 py-2.5 rounded-2xl shadow-xl font-bold text-xs flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toast}</span>
          </div>
        )}

        {/* Unassigned Combined Delivery Warning */}
        {unassignedCombinedCount > 0 && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-black text-amber-300">
                  ⚠️ {unassignedCombinedCount} Combined Tiffin Box(es) with Extra Add-ons have NO Rider Assigned!
                </p>
                <p className="text-xs text-amber-200/80">
                  Pack extra sides carefully inside the tagged meal box and alert Admin to assign a rider before dispatch.
                </p>
              </div>
            </div>
            <Link
              to="/admin"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shrink-0 transition"
            >
              Assign in Admin ➔
            </Link>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Instant KOTs Active</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-orange-400">{kots.length}</span>
              <span className="text-xs text-slate-400">orders in queue</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Today Mess Tiffins</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-emerald-400">{messRoster.length}</span>
              <span className="text-xs text-slate-400">
                ({messBatches?.breakfast?.total || 0}B / {messBatches?.lunch?.total || 0}L / {messBatches?.dinner?.total || 0}D)
              </span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Combined Extra Boxes</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-amber-400">{combinedExtrasCount}</span>
              <span className="text-xs text-slate-400">require side packing</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Out of Stock Items</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-rose-400">{outOfStockCount}</span>
              <span className="text-xs text-slate-400">disabled on menu</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
          {[
            { id: 'kot', label: `🔥 Instant Food KOT (${kots.length})` },
            { id: 'mess', label: `🍱 Mess Meal Batches (${messRoster.length})` },
            { id: 'stock', label: `📦 Stock & Availability (${stock.dishes.length + stock.extras.length})` }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex-1 min-w-[160px] py-2.5 px-4 rounded-xl text-xs font-black transition cursor-pointer ${
                activeTab === t.id
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* TAB 1: INSTANT FOOD KOT QUEUE */}
        {activeTab === 'kot' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {kots.length === 0 ? (
              <div className="col-span-full bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center">
                <Utensils className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-base font-black text-slate-300">All Instant KOTs Cleared!</p>
                <p className="text-xs text-slate-500 mt-1">New food delivery orders will appear here automatically.</p>
              </div>
            ) : (
              kots.map(kot => {
                const isPreparing = kot.status === 'preparing';
                const isReady = Boolean(kot.kitchenReady || kot.packingStatus === 'ready');
                return (
                  <div
                    key={kot.orderId || kot._id}
                    className={`bg-slate-900 border-2 rounded-2xl p-4 flex flex-col justify-between transition ${
                      isReady
                        ? 'border-emerald-500/60'
                        : isPreparing
                        ? 'border-orange-500/60'
                        : 'border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <div>
                          <span className="text-sm font-black text-white">{kot.kotNumber}</span>
                          <p className="text-[11px] text-slate-400">
                            {kot.customerName || 'Student'} • #{String(kot.orderId || '').slice(-6)}
                          </p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black flex items-center gap-1 ${
                          kot.elapsedMins > 20 ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-amber-400'
                        }`}>
                          <Clock className="w-3 h-3" /> {kot.elapsedMins}m
                        </span>
                      </div>

                      <div className="py-3 space-y-2">
                        {(kot.items || []).map((it: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between text-xs bg-slate-800/70 px-3 py-2 rounded-xl">
                            <span className="font-bold text-slate-100">
                              <span className="text-orange-400 font-black mr-1.5">{it.quantity || 1}x</span>
                              {it.name}
                            </span>
                            <span className={`w-2 h-2 rounded-full ${it.isVeg !== false ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          </div>
                        ))}
                        {kot.notes && (
                          <p className="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 rounded-lg">
                            📝 {kot.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex gap-2">
                      {!isPreparing && !isReady && (
                        <button
                          disabled={actionBusy === kot.orderId}
                          onClick={() => handleKotAction(kot.orderId || kot._id, 'preparing')}
                          className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Flame className="w-3.5 h-3.5" /> Start Cooking
                        </button>
                      )}
                      {!isReady && (
                        <button
                          disabled={actionBusy === kot.orderId}
                          onClick={() => handleKotAction(kot.orderId || kot._id, 'ready', true)}
                          className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Mark Ready
                        </button>
                      )}
                      {isReady && (
                        <div className="w-full py-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-black text-xs rounded-xl text-center">
                          ✅ Ready for Rider Pickup ({kot.deliveryPartner?.name || 'Waiting Rider'})
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: MESS MEAL BATCHES */}
        {activeTab === 'mess' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <div className="flex flex-wrap gap-2">
                {(['All', 'Breakfast', 'Lunch', 'Dinner'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setSlotFilter(s)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black cursor-pointer transition ${
                      slotFilter === s ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {slotFilter !== 'All' && (
                <button
                  disabled={actionBusy === `batch-${slotFilter}`}
                  onClick={() => handleBatchPackSlot(slotFilter)}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5" /> Pack All Preparing {slotFilter} Boxes
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMessRoster.length === 0 ? (
                <div className="col-span-full bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 text-sm">
                  No mess dispatch entries found for {slotFilter} today.
                </div>
              ) : (
                filteredMessRoster.map(box => {
                  const boxId = box.id || box._id;
                  const hasExtras = Boolean(box.hasAttachedExtras || (Array.isArray(box.attachedExtras) && box.attachedExtras.length > 0));
                  const isSkipped = Boolean(box.isSkipped || (box.status || '').toLowerCase() === 'skipped');
                  const isPacked = (box.status || '').toLowerCase() === 'packed';
                  const isOutOrDone = ['dispatched', 'out-for-delivery', 'out_for_delivery', 'delivered'].includes((box.status || '').toLowerCase());

                  return (
                    <div
                      key={boxId}
                      className={`bg-slate-900 border-2 rounded-2xl p-4 flex flex-col justify-between ${
                        isSkipped
                          ? 'border-rose-500/30 opacity-60'
                          : hasExtras
                          ? 'border-amber-500/70 shadow-lg shadow-amber-500/10'
                          : isPacked
                          ? 'border-emerald-500/50'
                          : 'border-slate-800'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-black text-orange-400 uppercase">{box.slot || box.mealSlot || 'Lunch'}</span>
                          <span className="text-[10px] font-mono text-slate-400">#{String(boxId).slice(-6)}</span>
                        </div>
                        <h4 className="text-sm font-black text-white">{box.student || box.studentName}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">{box.hostel || box.address || 'Hostel Room'}</p>

                        <div className="mt-3 flex flex-wrap gap-1.5">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                            isSkipped ? 'bg-rose-500/20 text-rose-400' :
                            isOutOrDone ? 'bg-blue-500/20 text-blue-300' :
                            isPacked ? 'bg-emerald-500/20 text-emerald-300' :
                            'bg-slate-800 text-slate-300'
                          }`}>
                            {box.status || 'preparing'}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 ${
                            !box.rider || box.rider === 'Unassigned' ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-300'
                          }`}>
                            <Bike className="w-3 h-3" /> {box.rider || 'Unassigned'}
                          </span>
                        </div>

                        {hasExtras && (
                          <div className="mt-3 p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/40">
                            <p className="text-[10px] font-black uppercase text-amber-300 flex items-center gap-1">
                              <Sparkles className="w-3 h-3" /> Combined Extra Items Inside Box:
                            </p>
                            <p className="text-xs font-bold text-amber-100 mt-1">
                              {box.extras || (box.attachedExtras || []).map((e: any) => (e.items || []).map((i: any) => `${i.quantity}x ${i.name}`).join(', ')).join(' • ')}
                            </p>
                          </div>
                        )}
                      </div>

                      {!isSkipped && !isOutOrDone && (
                        <div className="mt-4 pt-3 border-t border-slate-800">
                          {!isPacked ? (
                            <button
                              disabled={actionBusy === boxId}
                              onClick={() => handleMessBoxPack(boxId, 'packed')}
                              className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Package className="w-3.5 h-3.5" /> {hasExtras ? 'Pack Meal + Combined Extras' : 'Mark Box Packed'}
                            </button>
                          ) : (
                            <div className="w-full py-2 bg-emerald-500/15 text-emerald-400 font-black text-xs rounded-xl text-center">
                              ✅ Packed &amp; Ready for Rider Dispatch
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 3: STOCK & INVENTORY AVAILABILITY */}
        {activeTab === 'stock' && (
          <div className="space-y-4">
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={stockSearch}
                onChange={e => setStockSearch(e.target.value)}
                placeholder="Search dish or extra item..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[...stock.extras, ...stock.dishes]
                .filter(i => !stockSearch || i.name.toLowerCase().includes(stockSearch.toLowerCase()))
                .map(item => (
                  <div
                    key={`${item.type}-${item.id}`}
                    className={`bg-slate-900 border rounded-2xl p-4 flex items-center justify-between gap-3 ${
                      item.isAvailable ? 'border-slate-800' : 'border-rose-500/40 bg-rose-950/20'
                    }`}
                  >
                    <div className="min-w-0">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                        item.type === 'extra' ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'
                      }`}>
                        {item.type === 'extra' ? 'Tiffin Extra' : item.category}
                      </span>
                      <h4 className="text-sm font-bold text-white truncate mt-1">{item.name}</h4>
                      <p className="text-xs text-slate-400">₹{item.price}</p>
                    </div>

                    <button
                      disabled={actionBusy === item.id}
                      onClick={() => handleToggleStock(item.type, item.id, item.isAvailable)}
                      className={`px-3 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 shrink-0 cursor-pointer transition ${
                        item.isAvailable
                          ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30'
                      }`}
                    >
                      {item.isAvailable ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      <span>{item.isAvailable ? 'In Stock' : 'Out of Stock'}</span>
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KitchenPanel;

