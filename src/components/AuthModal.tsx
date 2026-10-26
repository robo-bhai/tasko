import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Store } from '../services/store';
import { 
  X, 
  Phone, 
  Mail, 
  UserCheck, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Wrench, 
  Truck, 
  ShoppingBag,
  Sparkles
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
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
  const [address, setAddress] = useState('Sector F-8/2, Islamabad');

  if (!isOpen) return null;

  const handleQuickPersona = (user: User) => {
    Store.setCurrentUser(user);
    onSuccess(user);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneOrEmail.trim()) {
      alert('Please enter phone number or email.');
      return;
    }

    const isEmail = phoneOrEmail.includes('@');
    const existingUsers = Store.getUsers();
    
    if (authMode === 'login') {
      const found = existingUsers.find(
        u => u.phone === phoneOrEmail.trim() || u.email.toLowerCase() === phoneOrEmail.toLowerCase().trim()
      );
      if (found) {
        Store.setCurrentUser(found);
        onSuccess(found);
        onClose();
        return;
      }
    }

    // Create / login user
    const newUser: User = {
      id: 'usr-' + Date.now(),
      name: fullName.trim() || (isEmail ? phoneOrEmail.split('@')[0] : 'User ' + phoneOrEmail.slice(-4)),
      email: isEmail ? phoneOrEmail.trim() : `${phoneOrEmail.replace(/\D/g, '')}@omniserve.pk`,
      phone: !isEmail ? phoneOrEmail.trim() : '+92 300 ' + Math.floor(1000000 + Math.random() * 9000000),
      role: selectedRole,
      avatar: selectedRole === 'provider' 
        ? '/src/assets/images/app_avatar_provider_1793035360068.jpg'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      address: address.trim(),
      walletBalance: selectedRole === 'customer' ? 3000 : 0,
      status: 'active',
      joinedDate: new Date().toISOString().split('T')[0],
      providerCategory: selectedRole === 'provider' ? 'home_technician' : undefined,
      rating: selectedRole === 'provider' ? 5.0 : undefined,
      completedJobsCount: 0,
      isOnline: true
    };

    Store.setCurrentUser(newUser);
    onSuccess(newUser);
    onClose();
  };

  const demoPersonas = Store.getUsers();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-xs">
              OS
            </div>
            <div>
              <h3 className="text-base font-bold text-white">OmniServe Authentication</h3>
              <p className="text-xs text-slate-300">Sign in with phone or email, or test with 1-click personas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Quick 1-Click Demo Personas */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                1-Click Quick Testing Personas
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Instant Login</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {demoPersonas.map((persona) => (
                <button
                  key={persona.id}
                  type="button"
                  onClick={() => handleQuickPersona(persona)}
                  className="flex items-center gap-2.5 p-2 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/50 text-left transition-all"
                >
                  <img
                    src={persona.avatar}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="truncate text-xs">
                    <p className="font-bold text-slate-900 truncate">{persona.name}</p>
                    <p className="text-[10px] text-slate-500 capitalize">
                      {persona.role === 'provider' ? (persona.providerCategory?.replace('_', ' ') || 'Provider') : persona.role}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Regular Phone / Email Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex gap-4 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className={`pb-1 ${authMode === 'login' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('signup')}
                  className={`pb-1 ${authMode === 'signup' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}
                >
                  Create New Account
                </button>
              </div>
            </div>

            {authMode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Farhan Zaidi"
                  className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                Phone Number or Email Address *
              </label>
              <input
                type="text"
                required
                value={phoneOrEmail}
                onChange={(e) => setPhoneOrEmail(e.target.value)}
                placeholder="+92 300 1234567 or user@example.com"
                className="w-full text-xs font-mono rounded-xl border border-slate-300 px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            {authMode === 'signup' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                    Account Role *
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setSelectedRole('customer')}
                      className={`p-2.5 rounded-xl border font-bold text-left transition-colors ${
                        selectedRole === 'customer'
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      Customer (Order & Book)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRole('provider')}
                      className={`p-2.5 rounded-xl border font-bold text-left transition-colors ${
                        selectedRole === 'provider'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      Worker / Driver (Earn)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                    Default Address / City
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Sector / Area, City"
                    className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </>
            )}

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
              >
                {authMode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
