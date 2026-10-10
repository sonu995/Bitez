import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Phone, Mail, Clock, Search, Plus, FileText, AlertCircle, CheckCircle, Star, Send, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Support: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('help');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  const faqCategories = [
    { id: 'orders', name: 'Orders & Delivery', count: 12 },
    { id: 'subscription', name: 'Meal Plans', count: 8 },
    { id: 'payment', name: 'Payment & Wallet', count: 6 },
    { id: 'account', name: 'Account & Profile', count: 5 },
    { id: 'general', name: 'General', count: 4 }
  ];

  const faqs = [
    {
      id: 1,
      category: 'orders',
      question: 'How can I track my order?',
      answer: 'You can track your order in real-time by visiting the "Track Order" section in your dashboard or clicking the tracking link sent via SMS/email.'
    },
    {
      id: 2,
      category: 'orders',
      question: 'What if my order is delayed?',
      answer: 'If your order is delayed beyond the estimated time, you can contact our support team. We provide compensation for significant delays.'
    },
    {
      id: 3,
      category: 'subscription',
      question: 'How do I skip a meal?',
      answer: 'You can skip meals through your dashboard before 8:00 AM on the delivery day. Skipped meals will be credited back to your account.'
    },
    {
      id: 4,
      category: 'subscription',
      question: 'Can I pause my subscription?',
      answer: 'Yes, you can pause your subscription for up to 30 days. The remaining meals will be preserved and you can resume anytime.'
    },
    {
      id: 5,
      category: 'payment',
      question: 'How do I add money to my wallet?',
      answer: 'You can add money to your wallet using UPI, debit/credit cards, or net banking through the wallet section in your dashboard.'
    },
    {
      id: 6,
      category: 'payment',
      question: 'Are there any transaction charges?',
      answer: 'No, we do not charge any additional fees for wallet transactions or payments.'
    }
  ];

  const complaints = [
    {
      id: 'CMP001',
      title: 'Food Quality Issue',
      description: 'The dal was too salty and rice was undercooked',
      category: 'Food Quality',
      status: 'resolved',
      date: '2024-01-15',
      response: 'We apologize for the inconvenience. Your feedback has been shared with the kitchen team and a refund has been processed.',
      orderId: 'ORD001'
    },
    {
      id: 'CMP002',
      title: 'Late Delivery',
      description: 'Order was delivered 45 minutes late without any notification',
      category: 'Delivery',
      status: 'in-progress',
      date: '2024-01-14',
      response: null,
      orderId: 'ORD002'
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'in-progress': return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'resolved': return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'closed': return 'bg-slate-100 text-slate-600 border border-slate-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Customer Support</h1>
          <p className="text-base text-slate-600">We are here to assist you 24/7 with meals, mess plans, and deliveries</p>
        </div>

        {/* Quick Contact */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center shadow-sm">
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-orange-200">
              <Phone className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Call Us</h3>
            <p className="text-xs text-slate-500 mb-3">Available 24/7</p>
            <a href="tel:+919876543210" className="text-orange-600 font-bold hover:text-orange-700 text-sm">
              +91 98765 43210
            </a>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center shadow-sm">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-200">
              <MessageCircle className="w-6 h-6 text-slate-800" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Live Chat</h3>
            <p className="text-xs text-slate-500 mb-3">Instant support</p>
            <button className="text-slate-900 font-bold hover:text-orange-600 text-sm transition-colors">
              Start Chat
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center shadow-sm">
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-orange-200">
              <Mail className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Email Us</h3>
            <p className="text-xs text-slate-500 mb-3">Response within 2 hours</p>
            <a href="mailto:support@bitez.in" className="text-orange-600 font-bold hover:text-orange-700 text-sm">
              support@bitez.in
            </a>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-1.5 shadow-sm max-w-xl mx-auto">
            <div className="flex space-x-2">
              {[
                { key: 'help', label: 'Help Center' },
                { key: 'complaints', label: 'My Complaints' },
                { key: 'feedback', label: 'Feedback' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
                    activeTab === tab.key
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Help Center Tab */}
        {activeTab === 'help' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* FAQ Categories */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-24 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-4">Categories</h3>
                
                {/* Search */}
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search FAQs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-slate-900 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                      !selectedCategory
                        ? 'bg-orange-50 text-orange-700'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    All Categories
                  </button>
                  {faqCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-orange-50 text-orange-700'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {category.name} ({category.count})
                    </button>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100">
                  <button
                    onClick={() => setShowComplaintForm(true)}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-2.5 rounded-xl font-bold text-sm transition-all shadow-md shadow-orange-500/20"
                  >
                    <Plus className="w-4 h-4 inline mr-1.5" />
                    File Complaint
                  </button>
                </div>
              </div>
            </div>

            {/* FAQ Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
                
                {filteredFaqs.length === 0 ? (
                  <div className="text-center py-10">
                    <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-slate-900 mb-1">No results found</h3>
                    <p className="text-sm text-slate-500">Try adjusting your search or select another category</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredFaqs.map((faq) => (
                      <div key={faq.id} className="border border-slate-200 rounded-xl p-5 hover:border-orange-300 transition-colors">
                        <h3 className="text-base font-bold text-slate-900 mb-2">{faq.question}</h3>
                        <p className="text-sm text-slate-600 leading-relaxed">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Complaints Tab */}
        {activeTab === 'complaints' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">My Complaints</h2>
              <button
                onClick={() => setShowComplaintForm(true)}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md shadow-orange-500/20"
              >
                <Plus className="w-4 h-4 inline mr-1.5" />
                New Complaint
              </button>
            </div>

            {user ? (
              <div className="space-y-4">
                {complaints.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
                    <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-slate-900 mb-1">No complaints filed</h3>
                    <p className="text-slate-500 text-sm">We hope you are enjoying delicious fresh meals with Bitez!</p>
                  </div>
                ) : (
                  complaints.map((complaint) => (
                    <div key={complaint.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-base font-bold text-slate-900">{complaint.title}</h3>
                          <p className="text-xs text-slate-500 mt-0.5">Complaint ID: {complaint.id} • Order: {complaint.orderId}</p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(complaint.status)}`}>
                            {complaint.status === 'resolved' && <CheckCircle className="w-3 h-3 mr-1" />}
                            {complaint.status === 'in-progress' && <Clock className="w-3 h-3 mr-1" />}
                            {complaint.status}
                          </span>
                          <p className="text-xs text-slate-400 mt-1 font-medium">{complaint.date}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-slate-700 leading-relaxed">{complaint.description}</p>
                      </div>

                      {complaint.response && (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4">
                          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1">Our Response:</h4>
                          <p className="text-sm text-slate-600">{complaint.response}</p>
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Category: {complaint.category}</span>
                        <div className="space-x-3">
                          <Link
                            to={`/complaint/${complaint.id}`}
                            className="text-orange-600 hover:text-orange-700 text-sm font-bold"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
                <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-900 mb-1">Login Required</h3>
                <p className="text-slate-500 text-sm mb-6">Please login to view and track your complaints</p>
                <Link to="/login" className="bg-orange-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-orange-600 transition-colors inline-block">
                  Login
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Feedback Tab */}
        {activeTab === 'feedback' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">Feedback & Suggestions</h2>
              <button
                onClick={() => setShowFeedbackForm(true)}
                className="bg-orange-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-orange-600 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4 inline mr-1.5" />
                Give Feedback
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-2">We Value Your Opinion</h3>
              <p className="text-slate-600 text-sm mb-6">
                Your feedback helps Bitez elevate food quality, packaging, and timely campus deliveries.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
                  <Star className="w-7 h-7 text-orange-600 mb-2.5" />
                  <h4 className="font-bold text-slate-900 text-sm mb-1">Service Feedback</h4>
                  <p className="text-xs text-slate-600">Rate your food quality, delivery punctuality, and overall experience</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                  <MessageCircle className="w-7 h-7 text-slate-700 mb-2.5" />
                  <h4 className="font-bold text-slate-900 text-sm mb-1">Menu Suggestions</h4>
                  <p className="text-xs text-slate-600">Suggest new recipes or meal combos you would love to see on Bitez</p>
                </div>
              </div>
            </div>

            {/* Recent Feedback */}
            {user && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-4">Your Recent Feedback</h3>
                <div className="space-y-4">
                  <div className="border border-slate-200 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-slate-900 text-sm">Great food quality!</h4>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="w-4 h-4 text-orange-500 fill-orange-500" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 mb-2">
                      The dal rice combo was hot, fresh, and perfectly seasoned.
                    </p>
                    <p className="text-[11px] font-medium text-slate-400">Submitted on 2024-01-15</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Complaint Form Modal */}
        {showComplaintForm && (
          <ComplaintForm 
            onClose={() => setShowComplaintForm(false)} 
            user={user}
          />
        )}

        {/* Feedback Form Modal */}
        {showFeedbackForm && (
          <FeedbackForm 
            onClose={() => setShowFeedbackForm(false)} 
            user={user}
          />
        )}
      </div>
    </div>
  );
};

// Complaint Form Component
const ComplaintForm: React.FC<{ onClose: () => void; user: any }> = ({ onClose, user }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    orderId: '',
    description: '',
    priority: 'medium'
  });

  const categories = [
    'Food Quality',
    'Delivery Issue',
    'Payment Problem',
    'Subscription Issue',
    'App/Website Bug',
    'Customer Service',
    'Other'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to file a complaint');
      return;
    }
    alert('Complaint submitted successfully! You will receive updates via email and SMS.');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900">File a Complaint</h2>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              Complaint Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-slate-900 outline-none"
              placeholder="Brief description of the issue"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                Category *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-slate-900 outline-none"
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                Related Order ID (if applicable)
              </label>
              <input
                type="text"
                value={formData.orderId}
                onChange={(e) => setFormData({...formData, orderId: e.target.value})}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-slate-900 outline-none"
                placeholder="ORD123456"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              Priority Level
            </label>
            <div className="flex space-x-4">
              {['low', 'medium', 'high'].map((priority) => (
                <label key={priority} className="flex items-center text-sm font-medium text-slate-700">
                  <input
                    type="radio"
                    name="priority"
                    value={priority}
                    checked={formData.priority === priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="text-orange-500 focus:ring-orange-500 h-4 w-4"
                  />
                  <span className="ml-2 capitalize">{priority}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              Detailed Description *
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-slate-900 outline-none"
              placeholder="Please provide detailed information about your complaint..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-orange-500 text-white text-sm font-bold rounded-xl hover:bg-orange-600 transition-colors shadow-sm"
            >
              Submit Complaint
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Feedback Form Component
const FeedbackForm: React.FC<{ onClose: () => void; user: any }> = ({ onClose, user }) => {
  const [formData, setFormData] = useState({
    type: '',
    rating: 0,
    orderId: '',
    message: ''
  });

  const feedbackTypes = [
    'Food Quality',
    'Delivery Experience',
    'App/Website',
    'Customer Service',
    'Subscription Service',
    'General Suggestion'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to submit feedback');
      return;
    }
    alert('Thank you for your feedback! We appreciate your input and will use it to improve our service.');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900">Share Your Feedback</h2>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              Feedback Type *
            </label>
            <select
              required
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-slate-900 outline-none"
            >
              <option value="">Select feedback type</option>
              {feedbackTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              Overall Rating *
            </label>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({...formData, rating: star})}
                  className="p-1 focus:outline-none transition-transform hover:scale-110"
                >
                  <Star 
                    className={`w-7 h-7 ${
                      star <= formData.rating 
                        ? 'text-orange-500 fill-orange-500' 
                        : 'text-slate-300'
                    }`} 
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              Related Order ID (optional)
            </label>
            <input
              type="text"
              value={formData.orderId}
              onChange={(e) => setFormData({...formData, orderId: e.target.value})}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-slate-900 outline-none"
              placeholder="ORD123456"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              Your Feedback *
            </label>
            <textarea
              required
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-slate-900 outline-none"
              placeholder="Share your experience, suggestions, or any issues you faced..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-orange-500 text-white text-sm font-bold rounded-xl hover:bg-orange-600 transition-colors shadow-sm flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit Feedback</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Support;