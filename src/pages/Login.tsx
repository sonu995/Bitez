import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ShieldCheck, Sparkles, ArrowRight, UserCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const { login, quickAdminLogin, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const role = searchParams.get('role');
    if (role === 'admin') {
      setEmail('admin@mess.com');
      setPassword('admin123');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const user = await login(email, password);
      if (user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err?.message || 'Invalid email or password');
    }
  };

  const handleQuickAdmin = async () => {
    setError('');
    setDemoLoading('admin');
    try {
      const user = await quickAdminLogin();
      if (user) {
        navigate('/admin');
      } else {
        // Fallback standard login
        const logged = await login('admin@mess.com', 'admin123');
        if (logged?.role === 'admin') navigate('/admin');
      }
    } catch (err: any) {
      setError('Admin quick login failed. Ensure backend on port 5000 is active.');
    } finally {
      setDemoLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/60 via-amber-50/30 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-7 bg-white p-7 sm:p-10 rounded-3xl border border-slate-200/90 shadow-2xl relative overflow-hidden">
        
        {/* Top Decorative Glow */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600" />

        {/* Live Backend Indicator */}
        <div className="flex items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Full-Stack Backend Linked (Port 5000)
          </span>
        </div>

        <div className="text-center">
          <div className="w-14 h-14 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-orange-500/25">
            <span className="text-white font-black text-2xl tracking-tight">B</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Welcome to Bitez</h2>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-600 font-medium">
            Sign in to access your student mess, orders & meals
          </p>
        </div>

        {/* ── QUICK ADMIN LOGIN (Only visible if ?role=admin) ── */}
        {searchParams.get('role') === 'admin' && (
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
              <span className="flex items-center gap-1.5 text-slate-900">
                <ShieldCheck className="w-3.5 h-3.5 text-orange-500" />
                Administrator Access:
              </span>
            </div>
            <button
              type="button"
              onClick={handleQuickAdmin}
              disabled={isLoading || demoLoading !== null}
              className="w-full px-3 py-2.5 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 hover:from-black hover:to-slate-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-slate-900/15 cursor-pointer transition transform active:scale-95 disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>{demoLoading === 'admin' ? 'Logging in...' : '👑 Admin Portal Quick Login'}</span>
            </button>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-rose-50 border border-rose-300 text-rose-800 px-4 py-3 rounded-xl text-xs font-bold">
              {error}
            </div>
          )}

          <div className="space-y-3.5">
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-900 placeholder-slate-400 text-xs sm:text-sm transition-all outline-none"
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-xs font-bold text-slate-700">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-900 placeholder-slate-400 text-xs sm:text-sm transition-all outline-none"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                defaultChecked
                className="h-3.5 w-3.5 text-orange-500 focus:ring-orange-500 border-slate-300 rounded cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-2 text-slate-600 font-medium cursor-pointer">
                Remember me
              </label>
            </div>
            <Link to="/support" className="font-bold text-orange-600 hover:text-orange-700">
              Need Help?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading || demoLoading !== null}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3 rounded-xl font-bold hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>{isLoading ? 'Signing In...' : 'Sign In to Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="text-center text-xs pt-1">
            <span className="text-slate-600">Don't have an account? </span>
            <Link to="/register" className="text-orange-600 font-bold hover:text-orange-700">
              Sign up as new student
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;