import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">F</span>
              </div>
              <span className="text-2xl font-bold">FoodieExpress</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Your trusted partner for delicious meals and convenient food delivery. 
              Quality food, delivered fresh to your doorstep.
            </p>
            <div className="flex space-x-4">
              <Facebook className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
              <Twitter className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
              <Instagram className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-gray-300 hover:text-white text-sm">About Us</Link></li>
              <li><Link to="/menu" className="text-gray-300 hover:text-white text-sm">Our Menu</Link></li>
              <li><Link to="/subscriptions" className="text-gray-300 hover:text-white text-sm">Meal Plans</Link></li>
              <li><Link to="/contact" className="text-gray-300 hover:text-white text-sm">Contact Us</Link></li>
              <li><Link to="/careers" className="text-gray-300 hover:text-white text-sm">Careers</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Support</h3>
            <ul className="space-y-2">
              <li><Link to="/help" className="text-gray-300 hover:text-white text-sm">Help Center</Link></li>
              <li><Link to="/support" className="text-gray-300 hover:text-white text-sm">Customer Support</Link></li>
              <li><Link to="/refunds" className="text-gray-300 hover:text-white text-sm">Refunds</Link></li>
              <li><Link to="/terms" className="text-gray-300 hover:text-white text-sm">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-gray-300 hover:text-white text-sm">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Info</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-orange-500" />
                <span className="text-gray-300 text-sm">+91 98765 43210</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-orange-500" />
                <span className="text-gray-300 text-sm">support@foodieexpress.com</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-orange-500 mt-1" />
                <span className="text-gray-300 text-sm">
                  123 Food Street, Connaught Place<br />
                  New Delhi - 110001
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 FoodieExpress. All rights reserved. Made with ❤️ for food lovers.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;