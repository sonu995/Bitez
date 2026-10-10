import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  Phone,
  MapPin,
  Instagram,
  Facebook,
  Twitter,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
  Heart,
  ArrowUp,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

const Footer: React.FC = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setNewsletterEmail('');
        setSubscribed(false);
      }, 4000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-white text-slate-700 overflow-hidden border-t border-slate-200/80">
      {/* Top brand accent bar */}
      <div className="h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 shadow-xs" />

      {/* Main Container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-28 sm:pb-8">
        
        {/* Upper Newsletter Promo Card - Radiant Sunset Orange */}
        <div className="relative bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-xl shadow-orange-500/20 mb-10 sm:mb-14 overflow-hidden text-white border border-orange-400/30">
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-amber-400/20 rounded-full blur-xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8">
            <div className="max-w-xl text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md text-white border border-white/30 px-3.5 py-1 rounded-full text-xs font-bold mb-2.5 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                <span>Special First-Order Privilege</span>
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight mb-2">
                Get <span className="text-amber-200 underline decoration-white/60 decoration-wavy underline-offset-4">20% OFF</span> On Your First Meal! 🍱
              </h3>
              <p className="text-orange-100 text-xs sm:text-sm leading-relaxed">
                Join 5,000+ happy students & office pros in Bokaro. Receive weekly menu updates, chef specials & exclusive discount codes.
              </p>
            </div>

            {/* Newsletter input form */}
            <form onSubmit={handleSubscribe} className="w-full lg:w-auto max-w-md lg:max-w-none">
              {subscribed ? (
                <div className="bg-white text-emerald-800 px-5 py-3.5 rounded-2xl flex items-center gap-2.5 text-xs sm:text-sm font-bold shadow-lg animate-fade-in text-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span>Welcome aboard! Code SAVE20 sent 🎉</span>
                </div>
              ) : (
                <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center bg-white rounded-2xl p-1.5 transition-all shadow-lg gap-2 sm:gap-0 focus-within:ring-2 focus-within:ring-amber-300">
                  <div className="flex items-center flex-1 min-w-0">
                    <Mail className="w-4.5 h-4.5 text-orange-500 ml-2.5 sm:ml-3 flex-shrink-0" />
                    <input
                      type="email"
                      required
                      placeholder="Enter your email address..."
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      className="w-full bg-transparent px-3 py-2 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none font-medium"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-slate-900 hover:bg-black text-white font-black text-xs sm:text-sm px-6 py-2.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 w-full sm:w-auto"
                  >
                    <span>Claim 20%</span>
                    <ArrowRight className="w-4 h-4 text-amber-400" />
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Middle: 4 Rich Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8 pb-10 border-b border-slate-100">
          
          {/* Column 1: Brand & Bio (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-200 text-orange-600 shadow-xs group-hover:scale-105 transition-transform flex items-center justify-center font-bold text-xl">
                👨‍🍳
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                  Bite<span className="text-orange-600">z</span>
                </span>
                <span className="text-[10px] font-bold text-orange-600 tracking-wider uppercase mt-1">
                  Mess + Instant Order
                </span>
              </div>
            </Link>

            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-sm">
              Bokaro's trusted food companion. Delivering nutritious home-style monthly mess tiffins and handcrafted street bites right to your doorstep, piping hot and on time.
            </p>

            {/* Trust Highlights */}
            <div className="flex flex-col gap-2 pt-2">
              <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                <ShieldCheck className="w-4 h-4 text-orange-600 flex-shrink-0" />
                <span>100% Hygienic • FSSAI Registered Kitchen</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                <Clock className="w-4 h-4 text-orange-600 flex-shrink-0" />
                <span>Average Delivery: 20–30 Minutes</span>
              </div>
            </div>

            {/* Social Icons Row */}
            <div className="pt-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block mb-2.5">
                Follow Us
              </span>
              <div className="flex items-center gap-2.5">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-orange-500 text-slate-500 hover:text-white border border-slate-200 hover:border-orange-500 flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-2xs"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-orange-500 text-slate-500 hover:text-white border border-slate-200 hover:border-orange-500 flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-2xs"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-orange-500 text-slate-500 hover:text-white border border-slate-200 hover:border-orange-500 flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-2xs"
                  aria-label="Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  href="https://whatsapp.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-orange-500 text-slate-500 hover:text-white border border-slate-200 hover:border-orange-500 flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-2xs"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Popular Cuisines (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <span className="w-1.5 h-3.5 bg-orange-500 rounded-full" />
              Popular Cuisines
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/menu?category=thali" className="text-slate-600 hover:text-orange-600 transition-colors flex items-center gap-1.5 group font-medium">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-orange-500 transition-colors" />
                  <span>Home-Style Thalis & Combos</span>
                </Link>
              </li>
              <li>
                <Link to="/menu?category=biryani" className="text-slate-600 hover:text-orange-600 transition-colors flex items-center gap-1.5 group font-medium">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-orange-500 transition-colors" />
                  <span>Hyderabadi Dum Biryani</span>
                </Link>
              </li>
              <li>
                <Link to="/menu?category=burgers" className="text-slate-600 hover:text-orange-600 transition-colors flex items-center gap-1.5 group font-medium">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-orange-500 transition-colors" />
                  <span>Crispy Burgers & Kathi Rolls</span>
                </Link>
              </li>
              <li>
                <Link to="/menu?category=momos" className="text-slate-600 hover:text-orange-600 transition-colors flex items-center gap-1.5 group font-medium">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-orange-500 transition-colors" />
                  <span>Steamed Momos & Peri Peri Fries</span>
                </Link>
              </li>
              <li>
                <Link to="/menu?category=curries" className="text-slate-600 hover:text-orange-600 transition-colors flex items-center gap-1.5 group font-medium">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-orange-500 transition-colors" />
                  <span>Paneer Butter Masala & Naan</span>
                </Link>
              </li>
              <li>
                <Link to="/menu?category=healthy" className="text-slate-600 hover:text-orange-600 transition-colors flex items-center gap-1.5 group font-medium">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-orange-500 transition-colors" />
                  <span>High-Protein Fitness Bowls</span>
                </Link>
              </li>
              <li>
                <Link to="/menu?category=desserts" className="text-slate-600 hover:text-orange-600 transition-colors flex items-center gap-1.5 group font-medium">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-orange-500 transition-colors" />
                  <span>Gulab Jamun & Mango Shakes</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Links (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <span className="w-1.5 h-3.5 bg-orange-500 rounded-full" />
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li><Link to="/mess" className="text-slate-600 hover:text-orange-600 transition-colors font-medium">Daily Mess Plans</Link></li>
              <li><Link to="/menu" className="text-slate-600 hover:text-orange-600 transition-colors font-medium">Instant Order Menu</Link></li>
              <li><Link to="/orders" className="text-slate-600 hover:text-orange-600 transition-colors font-medium">Track Live Order</Link></li>
              <li><Link to="/dashboard" className="text-slate-600 hover:text-orange-600 transition-colors font-medium">My Account</Link></li>
              <li><Link to="/support" className="text-slate-600 hover:text-orange-600 transition-colors font-medium">Help & FAQs</Link></li>
              <li><Link to="/support" className="text-slate-600 hover:text-orange-600 transition-colors font-medium">Terms & Refund</Link></li>
              <li><Link to="/support" className="text-slate-600 hover:text-orange-600 transition-colors font-medium">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact & Hub (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <span className="w-1.5 h-3.5 bg-orange-500 rounded-full" />
              Contact & Hub
            </h4>
            
            <div className="space-y-3 text-xs sm:text-sm text-slate-600">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                <span>Sector 4, City Centre, Near Student Coaching Hub, Bokaro, Jharkhand 827004</span>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-orange-500 flex-shrink-0" />
                <a href="tel:+919876543210" className="hover:text-orange-600 transition-colors font-semibold">
                  +91 98765 43210
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-orange-500 flex-shrink-0" />
                <a href="mailto:care@bitez.com" className="hover:text-orange-600 transition-colors font-semibold">
                  care@bitez.com
                </a>
              </div>
            </div>

            {/* Quick WhatsApp Support */}
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center justify-between w-full bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200/80 hover:border-emerald-300 rounded-2xl p-3 text-slate-800 transition-all hover:scale-[1.02] shadow-2xs group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-900 leading-none">Instant WhatsApp Help</p>
                  <p className="text-[11px] text-emerald-700 font-semibold mt-0.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online • Replies in 2 mins
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Back to Top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p className="flex items-center gap-1.5 flex-wrap justify-center sm:justify-start">
            <span>© 2026 Bitez Express Kitchen Pvt Ltd. All rights reserved.</span>
            <span className="hidden sm:inline">•</span>
            <span className="inline-flex items-center gap-1 text-slate-600 font-medium">
              Cooked with <Heart className="w-3.5 h-3.5 text-orange-500 fill-orange-500" /> for foodies in Bokaro.
            </span>
          </p>

          {/* Back to top button */}
          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 text-slate-600 hover:text-orange-600 transition-colors font-bold group cursor-pointer"
          >
            <span>Back to Top</span>
            <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-orange-500 text-slate-600 group-hover:text-white border border-slate-200 group-hover:border-orange-500 flex items-center justify-center transition-colors shadow-2xs">
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            </div>
          </button>
        </div>

      </div>
    </footer>
  );
};

export default Footer;