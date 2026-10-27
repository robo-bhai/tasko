import React, { useState } from 'react';
import { User } from '../types';
import { Store, DEFAULT_ADMIN_USERNAME, DEFAULT_ADMIN_PASSWORD } from '../services/store';
import { 
  X, 
  Phone, 
  Mail, 
  Lock, 
  UserCheck, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  MapPin,
  KeyRound
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [address, setAddress] = useState('Sector F-8/2, Islamabad');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleQuickPersona = (user: User) => {
    Store.setCurrentUser(user);
    onSuccess(user);
    onClose();
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!phoneOrEmail.trim()) {
      setErrorMessage('Please enter your email or phone number.');
      return;
    }

    const authRes = Store.authenticateUser(phoneOrEmail.trim(), password ? password.trim() : undefined);
    if (!authRes.success || !authRes.user) {
      setErrorMessage(authRes.error || 'Authentication failed. Please verify your credentials.');
      return;
    }

    onSuccess(authRes.user);
    onClose();
  };

  const handleCustomerSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim() || !signupEmail.trim() || !signupPhone.trim()) {
      setErrorMessage('Please fill out all required fields.');
      return;
    }

    try {
      const newCustomer = Store.registerCustomer({
        name: fullName.trim(),
        email: signupEmail.trim(),
        phone: signupPhone.trim(),
        password: signupPassword.trim() || 'Customer@123',
        address: address.trim()
      });

      setSuccessMessage('Customer profile created successfully! Welcome to OmniServe.');
      setTimeout(() => {
        onSuccess(newCustomer);
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create customer account.');
    }
  };

  const demoUsers = Store.getUsers();
  const superAdmin = demoUsers.find(u => u.role === 'admin');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-xs">
              OS
            </div>
            <div>
              <h3 className="text-base font-bold text-white">OmniServe Authentication</h3>
              <p className="text-xs text-slate-300">Customer self-signup & secure Admin/Worker login</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Tabs */}
          <div className="flex border-b border-slate-200 gap-4 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setErrorMessage('');
              }}
              className={`pb-2.5 transition-colors ${
                authMode === 'login'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              Sign In (All Roles)
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setErrorMessage('');
              }}
              className={`pb-2.5 transition-colors ${
                authMode === 'signup'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              Customer Profile Self-Registration
            </button>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* TAB 1: LOGIN */}
          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                  Email or Phone Number *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={phoneOrEmail}
                    onChange={(e) => setPhoneOrEmail(e.target.value)}
                    placeholder="e.g. admin@omniserve.com or +92 300 1234567"
                    className="w-full text-xs font-mono rounded-xl border border-slate-300 pl-9 pr-3 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Password
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Admin default: {DEFAULT_ADMIN_PASSWORD}
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password..."
                    className="w-full text-xs rounded-xl border border-slate-300 pl-9 pr-3 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  Workers & drivers are created by the Admin.
                </span>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: CUSTOMER SIGN UP */}
          {authMode === 'signup' && (
            <form onSubmit={handleCustomerSignUp} className="space-y-3.5 text-xs">
              <div className="p-2.5 rounded-lg bg-blue-50 text-blue-900 text-[11px] border border-blue-200">
                Create your customer profile to order items, book home technicians, and rent transport vehicles with live GPS tracking.
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Daniyal Siddiqui"
                  className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="daniyal@example.com"
                    className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Mobile Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                    placeholder="+92 300 9876543"
                    className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Create Password *
                </label>
                <input
                  type="password"
                  required
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Default Home / Delivery Address *
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House #, Street #, Sector/Area, City"
                    className="w-full text-xs rounded-xl border border-slate-300 pl-8 pr-3 py-2"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-xs"
                >
                  Create Customer Profile
                </button>
              </div>
            </form>
          )}

          {/* Quick Demo Personas (Includes Super Admin from GitHub Secrets) */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Quick 1-Click Testing Personas:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {superAdmin && (
                <button
                  type="button"
                  onClick={() => handleQuickPersona(superAdmin)}
                  className="flex items-center justify-between p-2 rounded-xl border border-purple-200 bg-purple-50/60 hover:bg-purple-100 text-left transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
                    <div className="truncate">
                      <p className="font-bold text-purple-950 truncate">{superAdmin.name}</p>
                      <p className="text-[10px] text-purple-700 font-mono truncate">{superAdmin.email}</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-purple-200 text-purple-800 font-bold px-1.5 py-0.5 rounded uppercase">
                    Admin
                  </span>
                </button>
              )}

              {demoUsers.filter(u => u.role !== 'admin').slice(0, 3).map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleQuickPersona(user)}
                  className="flex items-center justify-between p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-left transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <img
                      src={user.avatar}
                      alt=""
                      className="w-5 h-5 rounded-full object-cover shrink-0"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                      }}
                    />
                    <span className="font-semibold text-slate-900 truncate">{user.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono">
                    {user.role}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
