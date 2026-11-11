import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Header from './components/Header';
import Footer from './components/Footer';
import MobileBottomNav from './components/MobileBottomNav';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import OrderTracking from './pages/OrderTracking';
import AdminPanel from './pages/AdminPanel';
import AdminTiffinPlans from './pages/AdminTiffinPlans';
import InstantAdminPanel from './pages/InstantAdminPanel';
import Subscriptions from './pages/Subscriptions';
import Orders from './pages/Orders';
import Support from './pages/Support';
import ComplaintTracking from './pages/ComplaintTracking';
import WeeklyTimetable from './pages/WeeklyTimetable';
import RiderApp from './pages/RiderApp';
import KitchenPanel from './pages/KitchenPanel';

function AppLayout() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isRider = location.pathname.startsWith('/rider');
  const isKitchen = location.pathname.startsWith('/kitchen');
  const isDedicatedApp = isAdmin || isRider || isKitchen;

  return (
    <div className={`min-h-screen flex flex-col relative ${isAdmin ? 'bg-slate-50' : (isRider || isKitchen) ? 'bg-slate-950' : 'bg-gradient-to-b from-orange-50/40 via-amber-50/20 to-white'}`}>
      {!isDedicatedApp && <Header />}
      <main className={`flex-1 ${!isDedicatedApp ? 'pb-20 sm:pb-0' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu/:restaurantId" element={<Menu />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/timetable" element={<WeeklyTimetable />} />
          <Route path="/weekly-menu" element={<Navigate to="/timetable" replace />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/track/:orderId" element={<OrderTracking />} />
          <Route path="/rider" element={<RiderApp />} />
          <Route path="/rider-app" element={<RiderApp />} />
          <Route path="/rider/*" element={<RiderApp />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/admin/mess" element={<AdminPanel />} />
          <Route path="/admin/instant" element={<InstantAdminPanel />} />
          <Route path="/admin/instant-orders" element={<InstantAdminPanel />} />
          <Route path="/admin/tiffin-plans" element={<AdminTiffinPlans />} />
          <Route path="/admin/kitchen" element={<KitchenPanel />} />
          <Route path="/kitchen" element={<KitchenPanel />} />
          <Route path="/mess" element={<Subscriptions />} />
          <Route path="/plans" element={<Subscriptions />} />
          <Route path="/subscriptions" element={<Subscriptions />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/support" element={<Support />} />
          <Route path="/complaint/:complaintId" element={<ComplaintTracking />} />
        </Routes>
      </main>
      {!isDedicatedApp && <Footer />}
      {/* Native Mobile App-Style Bottom Navigation for customers */}
      {!isDedicatedApp && <MobileBottomNav />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <AppLayout />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;