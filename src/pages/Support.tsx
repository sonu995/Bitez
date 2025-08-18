import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Phone, Mail, Clock, Search, Plus, FileText, AlertCircle, CheckCircle, Star, Send } from 'lucide-react';
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
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Customer Support</h1>
          <p className="text-xl text-gray-600">We're here to help you 24/7</p>
        </div>

        {/* Quick Contact */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Call Us</h3>
            <p className="text-gray-600 mb-3">Available 24/7</p>
            <a href="tel:+919876543210" className="text-green-600 font-semibold hover:text-green-700">
              +91 98765 43210
            </a>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Live Chat</h3>
            <p className="text-gray-600 mb-3">Instant support</p>
            <button className="text-blue-600 font-semibold hover:text-blue-700">
              Start Chat
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Email Us</h3>
            <p className="text-gray-600 mb-3">Response within 2 hours</p>
            <a href="mailto:support@foodieexpress.com" className="text-orange-600 font-semibold hover:text-orange-700">
              support@foodieexpress.com
            </a>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm">
            <div className="flex space-x-1">
              {[
                { key: 'help', label: 'Help Center' },
                { key: 'complaints', label: 'My Complaints' },
                { key: 'feedback', label: 'Feedback' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 px-6 py-3 rounded-md font-medium transition duration-200 ${
                    activeTab === tab.key
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-600 hover:text-gray-900'
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
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                <h3 className="text-lg font-semibold mb-4">Categories</h3>
                
                {/* Search */}
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search FAQs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition duration-200 ${
                      !selectedCategory
                        ? 'bg-orange-100 text-orange-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    All Categories
                  </button>
                  {faqCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition duration-200 ${
                        selectedCategory === category.id
                          ? 'bg-orange-100 text-orange-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {category.name} ({category.count})
                    </button>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowComplaintForm(true)}
                    className="w-full bg-red-500 text-white py-2 rounded-lg font-medium hover:bg-red-600 transition duration-200"
                  >
                    <Plus className="w-4 h-4 inline mr-2" />
                    File Complaint
                  </button>
                </div>
              </div>
            </div>

            {/* FAQ Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
                
                {filteredFaqs.length === 0 ? (
                  <div className="text-center py-8">
                    <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
                    <p className="text-gray-600">Try adjusting your search or browse different categories</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredFaqs.map((faq) => (
                      <div key={faq.id} className="border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                        <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
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
              <h2 className="text-2xl font-bold text-gray-900">My Complaints</h2>
              <button
                onClick={() => setShowComplaintForm(true)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                New Complaint
              </button>
            </div>

            {user ? (
              <div className="space-y-4">
                {complaints.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                    <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No complaints filed</h3>
                    <p className="text-gray-600">We hope you're having a great experience with our service!</p>
                  </div>
                ) : (
                  complaints.map((complaint) => (
                    <div key={complaint.id} className="bg-white rounded-xl shadow-sm p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{complaint.title}</h3>
                          <p className="text-sm text-gray-600">Complaint ID: {complaint.id}</p>
                          <p className="text-sm text-gray-600">Order ID: {complaint.orderId}</p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                            {complaint.status === 'resolved' && <CheckCircle className="w-3 h-3 mr-1" />}
                            {complaint.status === 'in-progress' && <Clock className="w-3 h-3 mr-1" />}
                            {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
                          </span>
                          <p className="text-sm text-gray-500 mt-1">{complaint.date}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-gray-700">{complaint.description}</p>
                      </div>

                      {complaint.response && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <h4 className="font-semibold text-green-800 mb-2">Our Response:</h4>
                          <p className="text-green-700">{complaint.response}</p>
                        </div>
                      )}

                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                        <span className="text-sm text-gray-600">Category: {complaint.category}</span>
                        <div className="space-x-2">
                          <Link
                            to={`/complaint/${complaint.id}`}
                            className="text-orange-500 hover:text-orange-600 text-sm font-medium"
                          >
                            View Details
                          </Link>
                          {complaint.status === 'resolved' && (
                            <button className="text-green-500 hover:text-green-600 text-sm font-medium">
                              Rate Resolution
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Login Required</h3>
                <p className="text-gray-600 mb-6">Please login to view and manage your complaints</p>
                <Link to="/login" className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600">
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
              <h2 className="text-2xl font-bold text-gray-900">Feedback & Suggestions</h2>
              <button
                onClick={() => setShowFeedbackForm(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Give Feedback
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">We Value Your Opinion</h3>
              <p className="text-gray-600 mb-6">
                Your feedback helps us improve our service and provide better food experiences. 
                Share your thoughts, suggestions, or report any issues you've encountered.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <Star className="w-8 h-8 text-blue-500 mb-3" />
                  <h4 className="font-semibold text-blue-900 mb-2">Service Feedback</h4>
                  <p className="text-blue-700 text-sm">Rate our delivery, food quality, and overall experience</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <MessageCircle className="w-8 h-8 text-green-500 mb-3" />
                  <h4 className="font-semibold text-green-900 mb-2">Suggestions</h4>
                  <p className="text-green-700 text-sm">Share ideas to help us serve you better</p>
                </div>
              </div>
            </div>

            {/* Recent Feedback */}
            {user && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Your Recent Feedback</h3>
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">Great food quality!</h4>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="w-4 h-4 text-yellow-500 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">
                      The dal rice combo was excellent. Keep up the good work!
                    </p>
                    <p className="text-gray-500 text-xs">Submitted on 2024-01-15</p>
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
    
    // Simulate complaint submission
    alert('Complaint submitted successfully! You will receive updates via email and SMS.');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">File a Complaint</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Complaint Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Brief description of the issue"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Related Order ID (if applicable)
              </label>
              <input
                type="text"
                value={formData.orderId}
                onChange={(e) => setFormData({...formData, orderId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="ORD123456"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority Level
            </label>
            <div className="flex space-x-4">
              {['low', 'medium', 'high'].map((priority) => (
                <label key={priority} className="flex items-center">
                  <input
                    type="radio"
                    name="priority"
                    value={priority}
                    checked={formData.priority === priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="text-orange-500 focus:ring-orange-500"
                  />
                  <span className="ml-2 text-sm capitalize">{priority}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Detailed Description *
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Please provide detailed information about your complaint..."
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
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
    
    // Simulate feedback submission
    alert('Thank you for your feedback! We appreciate your input and will use it to improve our service.');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Share Your Feedback</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Feedback Type *
            </label>
            <select
              required
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Select feedback type</option>
              {feedbackTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Overall Rating *
            </label>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({...formData, rating: star})}
                  className="focus:outline-none"
                >
                  <Star 
                    className={`w-8 h-8 ${
                      star <= formData.rating 
                        ? 'text-yellow-500 fill-current' 
                        : 'text-gray-300'
                    }`} 
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Related Order ID (optional)
            </label>
            <input
              type="text"
              value={formData.orderId}
              onChange={(e) => setFormData({...formData, orderId: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="ORD123456"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Feedback *
            </label>
            <textarea
              required
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Share your experience, suggestions, or any issues you faced..."
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <Send className="w-4 h-4 inline mr-2" />
              Submit Feedback
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Support;