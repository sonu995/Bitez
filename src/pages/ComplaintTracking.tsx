import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, AlertCircle, MessageCircle, Phone, Mail, FileText, Send } from 'lucide-react';

const ComplaintTracking: React.FC = () => {
  const { complaintId } = useParams();
  const [newMessage, setNewMessage] = useState('');

  const complaintDetails = {
    id: complaintId || 'CMP001',
    title: 'Food Quality Issue',
    category: 'Food Quality',
    priority: 'high',
    status: 'in-progress',
    createdDate: '2024-01-15',
    orderId: 'ORD001',
    description: 'The dal was too salty and rice was undercooked. This has happened twice in the last week.',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    customerPhone: '+91 9876543210'
  };

  const timeline = [
    {
      id: 1,
      type: 'created',
      title: 'Complaint Filed',
      description: 'Complaint has been submitted and assigned ticket number',
      timestamp: '2024-01-15 02:30 PM',
      user: 'Customer',
      icon: <FileText className="w-5 h-5 text-blue-500" />
    },
    {
      id: 2,
      type: 'acknowledged',
      title: 'Complaint Acknowledged',
      description: 'Our support team has received your complaint and started investigation',
      timestamp: '2024-01-15 02:45 PM',
      user: 'Support Team',
      icon: <AlertCircle className="w-5 h-5 text-amber-500" />
    },
    {
      id: 3,
      type: 'investigating',
      title: 'Under Investigation',
      description: 'We are reviewing your order details and coordinating with the kitchen team',
      timestamp: '2024-01-15 03:15 PM',
      user: 'Quality Team',
      icon: <Clock className="w-5 h-5 text-indigo-500" />
    },
    {
      id: 4,
      type: 'response',
      title: 'Response from Kitchen Team',
      description: 'Kitchen team has acknowledged the issue and implemented corrective measures. A refund of ₹120 has been processed to your wallet.',
      timestamp: '2024-01-15 04:30 PM',
      user: 'Kitchen Manager',
      icon: <MessageCircle className="w-5 h-5 text-emerald-500" />
    }
  ];

  const messages = [
    {
      id: 1,
      sender: 'Support Team',
      message: 'Thank you for bringing this to our attention. We are investigating the issue with your recent order.',
      timestamp: '2024-01-15 03:00 PM',
      isCustomer: false
    },
    {
      id: 2,
      sender: 'John Doe',
      message: 'This is the second time this week. Please ensure better quality control.',
      timestamp: '2024-01-15 03:30 PM',
      isCustomer: true
    },
    {
      id: 3,
      sender: 'Kitchen Manager',
      message: 'We sincerely apologize for the inconvenience. We have retrained our cooking staff and implemented additional quality checks. A full refund has been processed.',
      timestamp: '2024-01-15 04:30 PM',
      isCustomer: false
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'in-progress': return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'resolved': return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'closed': return 'bg-slate-100 text-slate-600 border border-slate-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-slate-100 text-slate-700 border border-slate-200';
      case 'medium': return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'high': return 'bg-rose-500 text-white shadow-xs';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    alert('Message sent successfully!');
    setNewMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link
              to="/support"
              className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Ticket #{complaintDetails.id}</h1>
              <p className="text-sm text-slate-500">{complaintDetails.title}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getPriorityColor(complaintDetails.priority)}`}>
              {complaintDetails.priority} priority
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(complaintDetails.status)}`}>
              {complaintDetails.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Timeline */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-6">Activity Timeline</h2>
              <div className="relative">
                <div className="absolute top-0 bottom-0 left-6 w-0.5 bg-slate-200" />
                <div className="space-y-6">
                  {timeline.map((step) => (
                    <div key={step.id} className="relative flex items-start space-x-4">
                      <div className="relative z-10 w-12 h-12 bg-white rounded-2xl border border-slate-200 flex items-center justify-center shadow-sm">
                        {step.icon}
                      </div>
                      <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-4">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-slate-900 text-sm">{step.title}</h3>
                          <span className="text-xs text-slate-400 font-medium">{step.timestamp}</span>
                        </div>
                        <p className="text-xs text-slate-600 mb-2 leading-relaxed">{step.description}</p>
                        <span className="text-[11px] font-semibold text-orange-600 uppercase tracking-wider">
                          By: {step.user}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-6">Conversation</h2>
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isCustomer ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl text-sm ${
                        message.isCustomer
                          ? 'bg-orange-500 text-white rounded-br-none shadow-sm'
                          : 'bg-slate-100 text-slate-900 rounded-bl-none border border-slate-200'
                      }`}
                    >
                      <p className={`text-xs font-bold mb-1 ${message.isCustomer ? 'text-orange-100' : 'text-slate-500'}`}>
                        {message.sender}
                      </p>
                      <p className="leading-relaxed">{message.message}</p>
                      <p className={`text-[10px] mt-1.5 font-medium ${
                        message.isCustomer ? 'text-orange-100' : 'text-slate-400'
                      }`}>
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-slate-900 outline-none"
                />
                <button
                  type="submit"
                  className="bg-orange-500 text-white px-5 py-2.5 rounded-xl hover:bg-orange-600 transition-colors shadow-sm"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Complaint Details */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-4">Complaint Details</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs uppercase font-semibold text-slate-400">Description</p>
                  <p className="text-slate-800 mt-0.5 leading-relaxed">{complaintDetails.description}</p>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-xs uppercase font-semibold text-slate-400">Customer</p>
                  <p className="text-slate-800 font-medium mt-0.5">{complaintDetails.customerName}</p>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-xs uppercase font-semibold text-slate-400">Contact</p>
                  <p className="text-slate-800 font-medium mt-0.5">{complaintDetails.customerEmail}</p>
                  <p className="text-slate-800 font-medium">{complaintDetails.customerPhone}</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-4">Quick Actions</h3>
              <div className="space-y-2.5">
                <button className="w-full flex items-center space-x-3 p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors">
                  <Phone className="w-4 h-4 text-orange-600" />
                  <span className="text-slate-800 text-sm font-semibold">Call Customer</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors">
                  <Mail className="w-4 h-4 text-orange-600" />
                  <span className="text-slate-800 text-sm font-semibold">Send Email</span>
                </button>
                <Link 
                  to={`/orders`}
                  className="w-full flex items-center space-x-3 p-3 bg-orange-50 border border-orange-200 rounded-xl hover:bg-orange-100 transition-colors"
                >
                  <FileText className="w-4 h-4 text-orange-600" />
                  <span className="text-orange-800 text-sm font-semibold">View Order</span>
                </Link>
              </div>
            </div>

            {/* Resolution Actions */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-4">Resolution Actions</h3>
              <div className="space-y-2.5">
                <button className="w-full bg-emerald-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors shadow-xs">
                  Mark as Resolved
                </button>
                <button className="w-full bg-orange-500 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-orange-600 transition-colors shadow-sm">
                  Process Refund
                </button>
                <button className="w-full bg-slate-100 text-slate-800 border border-slate-300 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors">
                  Escalate to Manager
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintTracking;