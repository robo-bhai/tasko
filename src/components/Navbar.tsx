import React, { useState } from 'react';
import { 
  User, 
  UserRole,
  Order
} from '../types';
import { 
  Store 
} from '../services/store';
import { 
  Truck, 
  ShoppingBag, 
  Wrench, 
  Clock, 
  ShieldCheck, 
  UserCheck, 
  ChevronDown, 
  RotateCcw,
  LogIn,
  LogOut,
  MapPin
} from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  activePortal: 'customer' | 'provider' | 'admin';
  setActivePortal: (portal: 'customer' | 'provider' | 'admin') => void;
  onOpenOrderModal: (category: 'custom_delivery' | 'home_services' | 'transport_cargo') => void;
  onOpenHistory: () => void;
  onOpenLiveTracker: (order?: Order) => void;
  onOpenAuth: () => void;
  activeOrders: Order[];
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activePortal,
  setActivePortal,
  onOpenOrderModal,
  onOpenHistory,
  onOpenLiveTracker,
  onOpenAuth,
  activeOrders
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  const handleRoleSelect = (role: 'customer' | 'provider' | 'admin') => {
    setActivePortal(role);
    setShowRoleSwitcher(false);
    
    // Auto switch user persona if currently mismatched
    if (role === 'admin' && currentUser.role !== 'admin') {
      const admin = Store.getUsers().find(u => u.role === 'admin');
      if (admin) Store.setCurrentUser(admin);
    } else if (role === 'provider' && currentUser.role !== 'provider') {
      const provider = Store.getUsers().find(u => u.role === 'provider');
      if (provider) Store.setCurrentUser(provider);
    } else if (role === 'customer' && currentUser.role !== 'customer') {
      const customer = Store.getUsers().find(u => u.role === 'customer');
      if (customer) Store.setCurrentUser(customer);
    }
  };

  const handleResetData = () => {
    if (window.confirm('Reset all demo orders, services, and users back to initial sample state?')) {
      Store.resetToDemoData();
      window.location.reload();
    }
  };

  const pendingOrActiveCount = activeOrders.filter(
    o => o.status !== 'completed' && o.status !== 'cancelled'
  ).length;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      {/* Quick Role & Persona Switcher Banner */}
      <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4 md:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto py-0.5">
            <span className="text-slate-400 font-medium whitespace-nowrap shrink-0">Demo Portal:</span>
            <div className="inline-flex rounded-md bg-slate-800 p-0.5 shrink-0">
              <button
                onClick={() => handleRoleSelect('customer')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  activePortal === 'customer'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Customer Portal
              </button>
              <button
                onClick={() => handleRoleSelect('provider')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  activePortal === 'provider'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Worker / Driver Portal
              </button>
              <button
                onClick={() => handleRoleSelect('admin')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  activePortal === 'admin'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Admin Panel
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 text-slate-300">
              <span className="text-slate-400">Logged in as:</span>
              <span className="font-semibold text-white">{currentUser.name}</span>
              <span className="text-slate-400 capitalize">({currentUser.role})</span>
            </div>
            <button
              onClick={handleResetData}
              title="Reset test data"
              className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Reset Demo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Top Bar */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3.5 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <a 
          href="#" 
          onClick={(e) => { e.preventDefault(); setActivePortal('customer'); }}
          className="flex items-center gap-2.5 whitespace-nowrap shrink-0 group"
        >
          <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm group-hover:bg-blue-700 transition-colors">
            OS
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-slate-900 leading-none">
              OmniServe
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              On-Demand Super App
            </span>
          </div>
        </a>

        {/* Zone 2: Navigation Links (Customer View) */}
        {activePortal === 'customer' ? (
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => onOpenOrderModal('custom_delivery')}
              className="flex items-center gap-1.5 hover:text-blue-600 transition-colors whitespace-nowrap shrink-0"
            >
              <ShoppingBag className="w-4 h-4 text-blue-500" />
              <span>Order Anything</span>
            </button>
            <button
              onClick={() => onOpenOrderModal('home_services')}
              className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors whitespace-nowrap shrink-0"
            >
              <Wrench className="w-4 h-4 text-emerald-500" />
              <span>Home Services</span>
            </button>
            <button
              onClick={() => onOpenOrderModal('transport_cargo')}
              className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors whitespace-nowrap shrink-0"
            >
              <Truck className="w-4 h-4 text-indigo-500" />
              <span>Cargo Transport</span>
            </button>
            <button
              onClick={onOpenHistory}
              className="flex items-center gap-1.5 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Order History</span>
            </button>
          </nav>
        ) : activePortal === 'provider' ? (
          <div className="hidden lg:flex items-center gap-4 text-sm font-medium text-slate-600">
            <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md text-xs font-semibold">
              Worker Console Active
            </span>
            <span className="text-slate-500 text-xs">
              Category: {currentUser.providerCategory?.replace('_', ' ') || 'Service Specialist'}
            </span>
          </div>
        ) : (
          <div className="hidden lg:flex items-center gap-4 text-sm font-medium text-slate-600">
            <span className="text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md text-xs font-semibold">
              Administrator Console
            </span>
            <span className="text-slate-500 text-xs">
              Live Dispatch & Catalog Controls
            </span>
          </div>
        )}

        {/* Zone 3: Primary Actions & User Pill */}
        <div className="flex items-center gap-3 shrink-0">
          {activePortal === 'customer' && (
            <button
              onClick={() => onOpenLiveTracker()}
              className="relative px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>Live Tracker</span>
              {pendingOrActiveCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center">
                  {pendingOrActiveCount}
                </span>
              )}
            </button>
          )}

          {/* User Profile / Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white text-left transition-colors"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover border border-slate-200"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                }}
              />
              <div className="hidden sm:flex flex-col text-xs leading-tight">
                <span className="font-semibold text-slate-900 truncate max-w-[100px]">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-slate-500 capitalize">
                  {currentUser.role}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-xs">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="font-bold text-slate-900">{currentUser.name}</p>
                  <p className="text-slate-500 text-[11px] truncate">{currentUser.email}</p>
                  <p className="text-slate-500 text-[11px]">{currentUser.phone}</p>
                  <div className="mt-1 flex items-center justify-between text-slate-600 font-mono text-[11px]">
                    <span>Wallet Balance:</span>
                    <span className="font-bold text-slate-900">PKR {currentUser.walletBalance.toLocaleString()}</span>
                  </div>
                </div>

                <div className="px-2 py-1.5">
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 px-2 py-1">
                    Quick Switch Persona
                  </p>
                  {Store.getUsers().map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        Store.setCurrentUser(u);
                        setActivePortal(u.role);
                        setShowUserDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-left transition-colors ${
                        u.id === currentUser.id ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <img 
                          src={u.avatar} 
                          alt="" 
                          className="w-5 h-5 rounded-full object-cover shrink-0" 
                          referrerPolicy="no-referrer" 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                          }}
                        />
                        <span className="truncate">{u.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono shrink-0 ml-1">
                        {u.role === 'provider' ? (u.providerCategory === 'cargo_driver' ? 'Driver' : u.providerCategory === 'delivery_courier' ? 'Rider' : 'Tech') : u.role}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="border-t border-slate-100 px-2 pt-1.5">
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onOpenAuth();
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-slate-700 hover:bg-slate-50 rounded-lg text-left font-medium"
                  >
                    <LogIn className="w-3.5 h-3.5 text-slate-400" />
                    <span>Login with Another Account</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
