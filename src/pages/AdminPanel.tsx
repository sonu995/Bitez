import React, { useState } from 'react';
import { Users, Package, ShoppingCart, Calendar, Settings, TrendingUp, Bell, Plus, Search, Filter, Edit, Trash2, Eye, DollarSign } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for admin dashboard
  const stats = {
    totalUsers: 1250,
    activeSubscriptions: 890,
    totalOrders: 3420,
    monthlyRevenue: 185000
  };

  const recentOrders = [
    { id: 'ORD001', customer: 'John Doe', amount: 150, status: 'preparing', time: '10 mins ago' },
    { id: 'ORD002', customer: 'Jane Smith', amount: 200, status: 'on-the-way', time: '15 mins ago' },
    { id: 'ORD003', customer: 'Mike Johnson', amount: 120, status: 'delivered', time: '30 mins ago' },
    { id: 'ORD004', customer: 'Sarah Wilson', amount: 180, status: 'confirmed', time: '45 mins ago' }
  ];

  const menuItems = [
    { id: 1, name: 'Dal Rice Combo', category: 'Main Course', price: 120, available: true },
    { id: 2, name: 'Chicken Biryani', category: 'Main Course', price: 180, available: true },
    { id: 3, name: 'Veggie Burger', category: 'Fast Food', price: 80, available: false },
    { id: 4, name: 'Masala Chai', category: 'Beverages', price: 20, available: true }
  ];

  const subscriptions = [
    { id: 'SUB001', user: 'John Doe', plan: 'Monthly Premium', remaining: 25, expiry: '2024-02-15', status: 'active' },
    { id: 'SUB002', user: 'Jane Smith', plan: 'Weekly Basic', remaining: 8, expiry: '2024-01-25', status: 'active' },
    { id: 'SUB003', user: 'Mike Johnson', plan: 'Custom Plan', remaining: 0, expiry: '2024-01-20', status: 'expired' }
  ];

  const salesData = [
    { name: 'Jan', orders: 400, revenue: 45000 },
    { name: 'Feb', orders: 300, revenue: 35000 },
    { name: 'Mar', orders: 500, revenue: 55000 },
    { name: 'Apr', orders: 450, revenue: 50000 },
    { name: 'May', orders: 600, revenue: 65000 },
    { name: 'Jun', orders: 550, revenue: 60000 }
  ];

  const categoryData = [
    { name: 'Main Course', value: 45, color: '#F97316' },
    { name: 'Fast Food', value: 25, color: '#10B981' },
    { name: 'Beverages', value: 20, color: '#3B82F6' },
    { name: 'Desserts', value: 10, color: '#8B5CF6' }
  ];

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access the admin panel</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { key: 'orders', label: 'Orders', icon: ShoppingCart },
    { key: 'menu', label: 'Menu', icon: Package },
    { key: 'users', label: 'Users', icon: Users },
    { key: 'subscriptions', label: 'Subscriptions', icon: Calendar },
    { key: 'settings', label: 'Settings', icon: Settings }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-yellow-100 text-yellow-800';
      case 'on-the-way': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'paused': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-8">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Admin Panel</span>
            </div>
            
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition duration-200 ${
                      activeTab === tab.key
                        ? 'bg-orange-100 text-orange-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-500" />
                  </div>
                  <div className="mt-2">
                    <span className="text-green-500 text-sm">+12% from last month</span>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Active Subscriptions</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.activeSubscriptions}</p>
                    </div>
                    <Calendar className="w-8 h-8 text-green-500" />
                  </div>
                  <div className="mt-2">
                    <span className="text-green-500 text-sm">+8% from last month</span>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Orders</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                    </div>
                    <ShoppingCart className="w-8 h-8 text-orange-500" />
                  </div>
                  <div className="mt-2">
                    <span className="text-green-500 text-sm">+15% from last month</span>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Monthly Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">₹{stats.monthlyRevenue.toLocaleString()}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-purple-500" />
                  </div>
                  <div className="mt-2">
                    <span className="text-green-500 text-sm">+22% from last month</span>
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold mb-4">Sales Overview</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="orders" fill="#F97316" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold mb-4">Order Categories</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 text-sm font-medium text-gray-600">Order ID</th>
                        <th className="text-left py-3 text-sm font-medium text-gray-600">Customer</th>
                        <th className="text-left py-3 text-sm font-medium text-gray-600">Amount</th>
                        <th className="text-left py-3 text-sm font-medium text-gray-600">Status</th>
                        <th className="text-left py-3 text-sm font-medium text-gray-600">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr key={order.id} className="border-b border-gray-100">
                          <td className="py-3 text-sm">{order.id}</td>
                          <td className="py-3 text-sm">{order.customer}</td>
                          <td className="py-3 text-sm">₹{order.amount}</td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3 text-sm text-gray-600">{order.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
                <div className="flex space-x-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search orders..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600">
                    <Filter className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Order ID</th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Customer</th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Items</th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Amount</th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Status</th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr key={order.id} className="border-b border-gray-100">
                          <td className="py-4 px-6 text-sm font-medium">{order.id}</td>
                          <td className="py-4 px-6 text-sm">{order.customer}</td>
                          <td className="py-4 px-6 text-sm">2 items</td>
                          <td className="py-4 px-6 text-sm">₹{order.amount}</td>
                          <td className="py-4 px-6">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex space-x-2">
                              <button className="text-blue-500 hover:text-blue-700">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="text-green-500 hover:text-green-700">
                                <Edit className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'menu' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
                <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600">
                  <Plus className="w-4 h-4 inline mr-2" />
                  Add Item
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Item Name</th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Category</th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Price</th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Availability</th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {menuItems.map((item) => (
                        <tr key={item.id} className="border-b border-gray-100">
                          <td className="py-4 px-6 text-sm font-medium">{item.name}</td>
                          <td className="py-4 px-6 text-sm">{item.category}</td>
                          <td className="py-4 px-6 text-sm">₹{item.price}</td>
                          <td className="py-4 px-6">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              item.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {item.available ? 'Available' : 'Out of Stock'}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex space-x-2">
                              <button className="text-blue-500 hover:text-blue-700">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="text-red-500 hover:text-red-700">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'subscriptions' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Subscription Management</h1>
                <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600">
                  <Plus className="w-4 h-4 inline mr-2" />
                  Create Plan
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Subscription ID</th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">User</th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Plan</th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Remaining Meals</th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Expiry</th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Status</th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscriptions.map((sub) => (
                        <tr key={sub.id} className="border-b border-gray-100">
                          <td className="py-4 px-6 text-sm font-medium">{sub.id}</td>
                          <td className="py-4 px-6 text-sm">{sub.user}</td>
                          <td className="py-4 px-6 text-sm">{sub.plan}</td>
                          <td className="py-4 px-6 text-sm">{sub.remaining}</td>
                          <td className="py-4 px-6 text-sm">{sub.expiry}</td>
                          <td className="py-4 px-6">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(sub.status)}`}>
                              {sub.status}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex space-x-2">
                              <button className="text-blue-500 hover:text-blue-700">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="text-green-500 hover:text-green-700">
                                <Edit className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;