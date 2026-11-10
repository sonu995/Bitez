import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, walletAPI, subscriptionsAPI } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin' | 'delivery';
  walletBalance: number;
  deliveryAddress?: string;
  hostel?: string;
  room?: string;
  dietPreference?: string;
  activeSubscription?: string | null | any;
  subscription?: {
    id: string;
    plan: string;
    remainingMeals: number;
    expiryDate: string;
    status?: string;
  };
}

interface AuthContextType {
  user: User | null;
  hasActiveSub: boolean;
  userSubscription: any;
  login: (email: string, password: string) => Promise<User | null>;
  register: (userData: any) => Promise<User | null>;
  quickAdminLogin: () => Promise<User | null>;
  logout: () => void;
  updateWallet: (amount: number) => void;
  topupWallet: (amount: number) => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (profileData: Partial<User>) => Promise<any>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [hasActiveSub, setHasActiveSub] = useState<boolean>(false);
  const [userSubscription, setUserSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkSubscription = async (currentUser: User | null) => {
    if (!currentUser) {
      setHasActiveSub(false);
      setUserSubscription(null);
      return;
    }
    // Optimistic initial check
    if (currentUser.activeSubscription) {
      setHasActiveSub(true);
    }
    try {
      const res = await subscriptionsAPI.getMine();
      if (res?.subscription && (res.subscription.status === 'active' || res.subscription.status === 'paused')) {
        setHasActiveSub(true);
        setUserSubscription(res.subscription);
      } else {
        setHasActiveSub(false);
        setUserSubscription(null);
      }
    } catch {
      setHasActiveSub(Boolean(currentUser.activeSubscription));
    }
  };

  useEffect(() => {
    // Restore user from localStorage on page load and refresh from backend
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    let parsedUser: User | null = null;
    if (storedUser) {
      try {
        parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        if (parsedUser?.activeSubscription) {
          setHasActiveSub(true);
        }
      } catch {}
    }
    if (token) {
      authAPI.me()
        .then(async data => {
          if (data?.user) {
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
            await checkSubscription(data.user);
          } else {
            await checkSubscription(parsedUser);
          }
        })
        .catch(() => {
          checkSubscription(parsedUser);
        })
        .finally(() => setIsLoading(false));
    } else {
      setHasActiveSub(false);
      setUserSubscription(null);
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await authAPI.login(email, password);
      // Save JWT token
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      await checkSubscription(data.user);
      return data.user as User;
    } finally {
      setIsLoading(false);
    }
  };

  const quickAdminLogin = async () => {
    setIsLoading(true);
    try {
      const data = await authAPI.login('admin@mess.com', 'admin123');
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      await checkSubscription(data.user);
      return data.user as User;
    } catch {
      // Fallback to quickLogin endpoint
      const data = await (authAPI as any).quickLogin?.() || await fetch('http://localhost:5000/api/admin/quick-login', { method: 'POST' }).then(r => r.json());
      if (data?.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        await checkSubscription(data.user);
        return data.user as User;
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any) => {
    setIsLoading(true);
    try {
      const data = await authAPI.register(userData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      await checkSubscription(data.user);
      return data.user as User;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setHasActiveSub(false);
    setUserSubscription(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const updateWallet = (amount: number) => {
    if (user) {
      const updatedUser = {
        ...user,
        walletBalance: user.walletBalance + amount
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const refreshUser = async () => {
    try {
      const data = await authAPI.me();
      if (data?.user) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        await checkSubscription(data.user);
      } else {
        await checkSubscription(null);
      }
    } catch {
      // ignore
    }
  };

  const topupWallet = async (amount: number) => {
    try {
      const data = await walletAPI.topup(amount);
      if (data?.walletBalance !== undefined && user) {
        const updatedUser = { ...user, walletBalance: data.walletBalance };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        updateWallet(amount);
      }
    } catch {
      updateWallet(amount);
    }
  };

  const updateProfile = async (profileData: Partial<User>) => {
    const data = await authAPI.updateProfile(profileData as any);
    if (data?.user) {
      const updated = { ...(user || {}), ...data.user };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      await checkSubscription(updated);
      return data;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      hasActiveSub,
      userSubscription,
      login,
      register,
      quickAdminLogin,
      logout,
      updateWallet,
      topupWallet,
      refreshUser,
      updateProfile,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};