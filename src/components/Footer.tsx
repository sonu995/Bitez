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
    <footer className="relative bg-gradient-to-b from-[#180F0A] via-[#1F130D] to-[#120A06] text-white overflow-hidden border-t border-stone-800/90">
      {/* Top radiant multi-color accent line matching website theme */}
      <div className="h-1.5 bg-gradient-to-r from-orange-500 via-amber-400 to-rose-500 shadow-sm" />

      {/* Ambient background glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-8">
        
        {/* Upper Newsletter / Promo Card in Warm Gourmet Espresso */}
        <div className="relative bg-gradient-to-br from-[#281810]/95 via-[#1E120C]/90 to-[#160B06]/95 rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-amber-500/30 shadow-2xl mb-10 sm:mb-14 overflow-hidden backdrop-blur-xl">
          {/* Subtle warm accent shine */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-400/20 to-transparent rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-orange-500/15 to-transparent rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="max-w-xl text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-amber-500/15 text-amber-300 border border-amber-500/30 px-3.5 py-1 rounded-full text-xs font-bold mb-2.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Special First-Order Privilege</span>
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight mb-1.5">
                Get <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-amber-200">20% OFF</span> On Your First Meal! 🍱
              </h3>
              <p className="text-stone-300/80 text-xs sm:text-sm leading-relaxed">
                Join 5,000+ happy students & office pros in Bokaro. Receive weekly menu updates, chef specials & exclusive discount codes.
              </p>
            </div>

            {/* Newsletter input form - 100% fluid and responsive on mobile */}
            <form onSubmit={handleSubscribe} className="w-full lg:w-auto max-w-md lg:max-w-none">
              {subscribed ? (
                <div className="bg-amber-950/90 border border-amber-500/50 text-amber-200 px-5 py-3 rounded-2xl flex items-center gap-2.5 text-xs sm:text-sm font-bold shadow-lg animate-fade-in text-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <span>Welcome aboard! Code SAVE20 sent 🎉</span>
                </div>
              ) : (
                <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center bg-[#120A06]/90 border border-stone-700/80 rounded-2xl p-1.5 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/20 transition-all shadow-inner gap-2 sm:gap-0">
                  <div className="flex items-center flex-1 min-w-0">
                    <Mail className="w-4.5 h-4.5 text-amber-400/70 ml-2.5 sm:ml-3 flex-shrink-0" />
                    <input
                      type="email"
                      required
                      placeholder="Enter your email address..."
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      className="w-full bg-transparent px-3 py-2 text-xs sm:text-sm text-white placeholder:text-stone-400 focus:outline-hidden font-medium"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-stone-950 font-black text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all shadow-md shadow-orange-500/25 active:scale-95 cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 w-full sm:w-auto"
                  >
                    <span>Claim 20%</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Middle: 4 Rich Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8 pb-10 border-b border-stone-800/80">
          
          {/* Column 1: Brand & Bio (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 p-0.5 shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-[#180F0A] rounded-[14px] flex items-center justify-center text-xl">
                  👨‍🍳
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-white tracking-tight leading-none">
                  Bite<span className="text-amber-400">z</span>
                </span>
                <span className="text-[10px] font-bold text-amber-300/80 tracking-wider uppercase mt-1">
                  Mess + Instant Order
                </span>
              </div>
            </Link>

            <p className="text-stone-300/80 text-xs sm:text-sm leading-relaxed max-w-sm">
              Bokaro's trusted food companion. Delivering nutritious home-style monthly mess tiffins and handcrafted street bites right to your doorstep, piping hot and on time.
            </p>

            {/* Trust Highlights */}
            <div className="flex flex-col gap-2 pt-2">
              <div className="flex items-center gap-2 text-xs text-stone-300">
                <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>100% Hygienic • FSSAI Registered Kitchen</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-stone-300">
                <Clock className="w-4 h-4 text-orange-400 flex-shrink-0" />
                <span>Average Delivery: 20–30 Minutes</span>
              </div>
            </div>

            {/* Social Icons Pill Row */}
            <div className="pt-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400/90 block mb-2.5">
                Follow Us
              </span>
              <div className="flex items-center gap-2.5">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-600 text-stone-300 hover:text-white border border-white/10 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-xs"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-blue-600 text-stone-300 hover:text-white border border-white/10 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-xs"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-stone-800 text-stone-300 hover:text-white border border-white/10 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-xs"
                  aria-label="Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  href="https://whatsapp.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-emerald-600 text-stone-300 hover:text-white border border-white/10 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-xs"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Order & Cuisines (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-sm font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <span className="w-1.5 h-3 bg-gradient-to-b from-orange-500 to-amber-400 rounded-full" />
              Popular Cuisines
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/menu?category=thali" className="text-stone-300/80 hover:text-amber-400 transition-colors flex items-center gap-1.5 group">
                  <ChevronRight className="w-3.5 h-3.5 text-stone-500 group-hover:text-amber-400 transition-colors" />
                  <span>Home-Style Thalis & Combos</span>
                </Link>
              </li>
              <li>
                <Link to="/menu?category=biryani" className="text-stone-300/80 hover:text-amber-400 transition-colors flex items-center gap-1.5 group">
                  <ChevronRight className="w-3.5 h-3.5 text-stone-500 group-hover:text-amber-400 transition-colors" />
                  <span>Hyderabadi Dum Biryani</span>
                </Link>
              </li>
              <li>
                <Link to="/menu?category=burgers" className="text-stone-300/80 hover:text-amber-400 transition-colors flex items-center gap-1.5 group">
                  <ChevronRight className="w-3.5 h-3.5 text-stone-500 group-hover:text-amber-400 transition-colors" />
                  <span>Crispy Burgers & Kathi Rolls</span>
                </Link>
              </li>
              <li>
                <Link to="/menu?category=momos" className="text-stone-300/80 hover:text-amber-400 transition-colors flex items-center gap-1.5 group">
                  <ChevronRight className="w-3.5 h-3.5 text-stone-500 group-hover:text-amber-400 transition-colors" />
                  <span>Steamed Momos & Peri Peri Fries</span>
                </Link>
              </li>
              <li>
                <Link to="/menu?category=curries" className="text-stone-300/80 hover:text-amber-400 transition-colors flex items-center gap-1.5 group">
                  <ChevronRight className="w-3.5 h-3.5 text-stone-500 group-hover:text-amber-400 transition-colors" />
                  <span>Paneer Butter Masala & Naan</span>
                </Link>
              </li>
              <li>
                <Link to="/menu?category=healthy" className="text-stone-300/80 hover:text-amber-400 transition-colors flex items-center gap-1.5 group">
                  <ChevronRight className="w-3.5 h-3.5 text-stone-500 group-hover:text-amber-400 transition-colors" />
                  <span>High-Protein Fitness Bowls</span>
                </Link>
              </li>
              <li>
                <Link to="/menu?category=desserts" className="text-stone-300/80 hover:text-amber-400 transition-colors flex items-center gap-1.5 group">
                  <ChevronRight className="w-3.5 h-3.5 text-stone-500 group-hover:text-amber-400 transition-colors" />
                  <span>Gulab Jamun & Mango Shakes</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Links & Services (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-sm font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <span className="w-1.5 h-3 bg-gradient-to-b from-orange-500 to-amber-400 rounded-full" />
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li><Link to="/mess" className="text-stone-300/80 hover:text-amber-400 transition-colors font-medium">Daily Mess Plans</Link></li>
              <li><Link to="/menu" className="text-stone-300/80 hover:text-amber-400 transition-colors font-medium">Instant Order Menu</Link></li>
              <li><Link to="/orders" className="text-stone-300/80 hover:text-amber-400 transition-colors font-medium">Track Live Order</Link></li>
              <li><Link to="/subscriptions" className="text-stone-300/80 hover:text-amber-400 transition-colors font-medium">My Subscription</Link></li>
              <li><Link to="/support" className="text-stone-300/80 hover:text-amber-400 transition-colors font-medium">Help & FAQs</Link></li>
              <li><Link to="/support" className="text-stone-300/80 hover:text-amber-400 transition-colors font-medium">Terms & Refund</Link></li>
              <li><Link to="/support" className="text-stone-300/80 hover:text-amber-400 transition-colors font-medium">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact & Kitchen Hub (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-sm font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <span className="w-1.5 h-3 bg-gradient-to-b from-orange-500 to-amber-400 rounded-full" />
              Contact & Hub
            </h4>
            
            <div className="space-y-3 text-xs sm:text-sm text-stone-300/90">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>Sector 4, City Centre, Near Student Coaching Hub, Bokaro, Jharkhand 827004</span>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-orange-400 flex-shrink-0" />
                <a href="tel:+919876543210" className="hover:text-amber-400 transition-colors font-medium">
                  +91 98765 43210
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <a href="mailto:care@bitez.com" className="hover:text-amber-400 transition-colors">
                  care@bitez.com
                </a>
              </div>
            </div>

            {/* Quick WhatsApp Action Card */}
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center justify-between w-full bg-[#20150F] hover:bg-[#2A1B14] border border-amber-500/25 rounded-2xl p-3 text-stone-200 transition-all hover:scale-[1.02] shadow-sm group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-white leading-none">Instant WhatsApp Help</p>
                  <p className="text-[11px] text-emerald-400 mt-0.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online • Replies in 2 mins
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Back to Top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <p className="flex items-center gap-1.5 flex-wrap justify-center sm:justify-start">
            <span>© 2026 Bitez Express Kitchen Pvt Ltd. All rights reserved.</span>
            <span className="hidden sm:inline">•</span>
            <span className="inline-flex items-center gap-1">
              Cooked with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for foodies in Bokaro.
            </span>
          </p>

          {/* Back to top button */}
          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 text-stone-300 hover:text-amber-400 transition-colors font-semibold group cursor-pointer"
          >
            <span>Back to Top</span>
            <div className="w-6 h-6 rounded-full bg-white/5 border border-stone-700/80 flex items-center justify-center group-hover:bg-amber-400 group-hover:text-stone-950 transition-colors">
              <ArrowUp className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>

      </div>
    </footer>
  );
};

export default Footer;