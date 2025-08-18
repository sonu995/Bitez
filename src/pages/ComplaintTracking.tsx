import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle, AlertCircle, MessageCircle, Phone, Mail, FileText, Send, X } from 'lucide-react';

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
      icon: <AlertCircle className="w-5 h-5 text-yellow-500" />
    },
    {
      id: 3,
      type: 'investigating',
      title: 'Under Investigation',
      description: 'We are reviewing your order details and coordinating with the kitchen team',
      timestamp: '2024-01-15 03:15 PM',
      user: 'Quality Team',
      icon: <Clock className="w-5 h-5 text-orange-500" />
    },
    {
      id: 4,
      type: 'response',
      title: 'Response from Kitchen Team',
      description: 'Kitchen team has acknowledged the issue and implemented corrective measures. A refund of ₹120 has been processed to your wallet.',
      timestamp: '2024-01-15 04:30 PM',
      user: 'Kitchen Manager',
      icon: <MessageCircle className="w-5 h-5 text-green-500" />
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
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    // Simulate sending message
    alert('Message sent successfully!');
    setNewMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link to="/support" className="inline-flex items-center text-orange-500 hover:text-orange-600 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Support
          </Link>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{complaintDetails.title}</h1>
                <p className="text-gray-600 mb-4">Complaint ID: {complaintDetails.id}</p>
                <div className="flex items-center space-x-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(complaintDetails.status)}`}>
                    {complaintDetails.status.charAt(0).toUpperCase() + complaintDetails.status.slice(1)}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(complaintDetails.priority)}`}>
                    {complaintDetails.priority.charAt(0).toUpperCase() + complaintDetails.priority.slice(1)} Priority
                  </span>
                  <span className="text-sm text-gray-600">Filed on {complaintDetails.createdDate}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Category: {complaintDetails.category}</p>
                {complaintDetails.orderId && (
                  <p className="text-sm text-gray-600">Order: {complaintDetails.orderId}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Timeline */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-6">Complaint Timeline</h2>
              <div className="relative">
                {timeline.map((event, index) => (
                  <div key={event.id} className="relative flex items-start mb-8 last:mb-0">
                    {/* Vertical Line */}
                    {index < timeline.length - 1 && (
                      <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-300" />
                    )}
                    
                    {/* Icon */}
                    <div className="w-12 h-12 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center">
                      {event.icon}
                    </div>

                    {/* Content */}
                    <div className="ml-4 flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-gray-900">{event.title}</h3>
                        <span className="text-sm text-gray-500">{event.timestamp}</span>
                      </div>
                      <p className="text-gray-700 mt-1">{event.description}</p>
                      <p className="text-sm text-gray-500 mt-2">By: {event.user}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-6">Conversation</h2>
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isCustomer ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                        message.isCustomer
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm font-medium mb-1">{message.sender}</p>
                      <p className="text-sm">{message.message}</p>
                      <p className={`text-xs mt-2 ${
                        message.isCustomer ? 'text-orange-100' : 'text-gray-500'
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
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Complaint Details */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Complaint Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Description</p>
                  <p className="text-gray-900">{complaintDetails.description}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Customer</p>
                  <p className="text-gray-900">{complaintDetails.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Contact</p>
                  <p className="text-gray-900">{complaintDetails.customerEmail}</p>
                  <p className="text-gray-900">{complaintDetails.customerPhone}</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center space-x-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition duration-200">
                  <Phone className="w-5 h-5 text-blue-500" />
                  <span className="text-blue-700 font-medium">Call Customer</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition duration-200">
                  <Mail className="w-5 h-5 text-green-500" />
                  <span className="text-green-700 font-medium">Send Email</span>
                </button>
                <Link 
                  to={`/admin/orders/${complaintDetails.orderId}`}
                  className="w-full flex items-center space-x-3 p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition duration-200"
                >
                  <FileText className="w-5 h-5 text-orange-500" />
                  <span className="text-orange-700 font-medium">View Order</span>
                </Link>
              </div>
            </div>

            {/* Resolution Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Resolution Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600">
                  Mark as Resolved
                </button>
                <button className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">
                  Process Refund
                </button>
                <button className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600">
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