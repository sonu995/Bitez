import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import OrderTracking from './pages/OrderTracking';
import AdminPanel from './pages/AdminPanel';
import Subscriptions from './pages/Subscriptions';
import Orders from './pages/Orders';
import Support from './pages/Support';
import ComplaintTracking from './pages/ComplaintTracking';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/menu/:restaurantId" element={<Menu />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/track/:orderId" element={<OrderTracking />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/subscriptions" element={<Subscriptions />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/support" element={<Support />} />
                <Route path="/complaint/:complaintId" element={<ComplaintTracking />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;