import React, { useState } from 'react';
import { 
  User, 
  Order
} from '../types';
import { Store } from '../services/store';
import { Language, translations } from '../i18n/translations';
import { 
  Truck, 
  ShoppingBag, 
  Wrench, 
  ShieldCheck, 
  UserCheck, 
  LogIn,
  LogOut,
  MapPin,
  Globe,
  Briefcase,
  Menu,
  X,
  Radio
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  currentUser: User | null;
  activePortal: 'customer' | 'provider' | 'admin';
  setActivePortal: (portal: 'customer' | 'provider' | 'admin') => void;
  onOpenOrderModal: (category: 'custom_delivery' | 'home_services' | 'transport_cargo') => void;
  onOpenHistory: () => void;
  onOpenLiveTracker: (order?: Order) => void;
  onOpenAuth: (tab?: 'login' | 'customer_signup' | 'provider_signup', notice?: string) => void;
  activeOrders: Order[];
  lang: Language;
  onToggleLang: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activePortal,
  setActivePortal,
  onOpenOrderModal,
  onOpenHistory,
  onOpenLiveTracker,
  onOpenAuth,
  activeOrders,
  lang,
  onToggleLang
}) => {
  const t = translations[lang];
  const isUrdu = lang === 'ur';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pendingOrActiveCount = activeOrders.filter(
    o => o.status !== 'completed' && o.status !== 'cancelled'
  ).length;

  const handleLogout = () => {
    Store.logout();
    setActivePortal('customer');
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#090a0f]/95 backdrop-blur-md border-b border-amber-500/20 shadow-xl text-white w-full overflow-hidden">
      {/* Top Location & Language Bar */}
      <div className="bg-[#050608] text-slate-300 text-[10px] sm:text-[11px] py-1 px-2.5 sm:px-6 border-b border-slate-900 overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-4">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
            <span className="truncate font-semibold text-slate-300 text-[10px] sm:text-[11px]">
              {isUrdu 
                ? '📍 Khanewal City, Cantt & Chak No. On-Demand' 
                : '📍 Operating across Khanewal City & Nearby Areas'}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Language Switcher */}
            <button
              onClick={onToggleLang}
              className="flex items-center gap-1 text-amber-300 hover:text-white bg-slate-900 hover:bg-slate-800 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold transition-colors border border-amber-500/30 cursor-pointer shrink-0"
              title="Change Language (English / Roman Urdu)"
            >
              <Globe className="w-3 h-3 text-amber-400" />
              <span>{isUrdu ? 'English' : 'Roman Urdu'}</span>
            </button>

            <span className="hidden sm:inline text-slate-700">|</span>
            <span className="hidden sm:inline text-amber-400 font-mono text-[11px] font-bold">
              {isUrdu ? 'Helpline: 0800-6664' : 'Khanewal: 0800-6664'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-1.5 sm:gap-3 w-full overflow-hidden">
        {/* Brand */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <button 
            onClick={() => setActivePortal('customer')} 
            className="flex items-center gap-1.5 sm:gap-2.5 text-left group cursor-pointer shrink-0"
          >
            <img
              src="/assets/aistudio/IMG-20261028-WA0027_c07670f1.jpg"
              alt="Khanewal Connect Official Logo"
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-amber-400/80 shadow-md group-hover:scale-105 transition-transform shrink-0"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="font-black text-white text-xs sm:text-base md:text-lg tracking-tight group-hover:text-amber-400 transition-colors whitespace-nowrap">
                  {t.appName}
                </span>
                <span className="hidden xs:inline-block bg-amber-400/10 text-amber-400 border border-amber-400/30 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                  KHANEWAL
                </span>
              </div>
              <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium hidden md:block">
                {t.appSlogan}
              </p>
            </div>
          </button>

          {/* Quick Categories navigation (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-bold text-slate-300">
            <button
              onClick={() => onOpenOrderModal('home_services')}
              className="px-3 py-1.5 rounded-xl hover:text-amber-400 hover:bg-slate-900 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Wrench className="w-3.5 h-3.5 text-amber-400" />
              <span>{isUrdu ? 'Book Technician' : 'Book a Technician'}</span>
            </button>
            <button
              onClick={() => onOpenOrderModal('custom_delivery')}
              className="px-3 py-1.5 rounded-xl hover:text-amber-400 hover:bg-slate-900 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
              <span>{isUrdu ? 'Book a Ride' : 'Book a Ride'}</span>
            </button>
            <button
              onClick={() => onOpenOrderModal('transport_cargo')}
              className="px-3 py-1.5 rounded-xl hover:text-amber-400 hover:bg-slate-900 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Truck className="w-3.5 h-3.5 text-amber-400" />
              <span>{isUrdu ? 'Book Cargo' : 'Book a Cargo'}</span>
            </button>
          </nav>
        </div>

        {/* Right Action Zone */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* PWA Install Button */}
          <div className="hidden sm:block">
            <PWAInstallButton isUrdu={isUrdu} variant="navbar" />
          </div>

          {/* Order Tracker Button (Customer Live Tracker) */}
          {currentUser && (
            <button
              onClick={() => onOpenLiveTracker()}
              className="relative p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-amber-500/30 bg-[#12141e] hover:bg-[#1a1c2a] text-amber-300 text-xs font-bold flex items-center gap-1 transition-colors shadow-sm cursor-pointer shrink-0"
              title={isUrdu ? 'Meri Live Tracking' : 'My Live Tracker'}
            >
              <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="hidden md:inline">{isUrdu ? 'Tracking' : 'Tracker'}</span>
              {pendingOrActiveCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[9px] flex items-center justify-center font-black">
                  {pendingOrActiveCount}
                </span>
              )}
            </button>
          )}

          {/* User Logged In State vs Guest Visitor State */}
          {currentUser ? (
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              {/* Role Portal Switching Button */}
              {currentUser.role === 'admin' && (
                <button
                  onClick={() => setActivePortal(activePortal === 'admin' ? 'customer' : 'admin')}
                  className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-black transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                    activePortal === 'admin'
                      ? 'bg-amber-400 text-slate-950 shadow-md'
                      : 'bg-[#141624] text-amber-400 hover:bg-[#1c1f32] border border-amber-500/30'
                  }`}
                  title={activePortal === 'admin' ? 'Customer View' : 'Admin Panel'}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">
                    {activePortal === 'admin' ? 'Customer' : 'Admin'}
                  </span>
                </button>
              )}

              {currentUser.role === 'provider' && (
                <button
                  onClick={() => setActivePortal(activePortal === 'provider' ? 'customer' : 'provider')}
                  className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-black transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                    activePortal === 'provider'
                      ? 'bg-amber-400 text-slate-950 shadow-md'
                      : 'bg-[#141624] text-amber-400 hover:bg-[#1c1f32] border border-amber-500/30'
                  }`}
                  title={activePortal === 'provider' ? 'Customer View' : 'Worker Portal'}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">
                    {activePortal === 'provider' ? 'Customer' : 'Worker'}
                  </span>
                </button>
              )}

              {/* User Profile Pill & Signout */}
              <div className="flex items-center gap-1 sm:gap-1.5 bg-[#12141f] border border-amber-500/30 p-1 sm:pl-2 sm:pr-1 sm:py-1 rounded-xl sm:rounded-2xl shrink-0">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover shrink-0 border border-amber-400/50"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                  }}
                />
                <span className="text-xs font-bold text-white max-w-[80px] truncate hidden md:inline">
                  {currentUser.name}
                </span>
                <span className={`text-[9px] font-black px-1 py-0.2 rounded uppercase hidden xs:inline-block ${
                  currentUser.role === 'admin'
                    ? 'bg-amber-400 text-slate-950'
                    : currentUser.role === 'provider'
                    ? 'bg-emerald-400 text-slate-950'
                    : 'bg-slate-800 text-amber-300'
                }`}>
                  {currentUser.role}
                </span>
                <button
                  onClick={handleLogout}
                  title={t.logout}
                  className="p-1 text-slate-400 hover:text-red-400 rounded-lg hover:bg-red-950/40 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl text-slate-300 hover:text-amber-400 hover:bg-slate-900 text-[11px] sm:text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shrink-0"
              >
                <LogIn className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>{isUrdu ? 'Login' : 'Sign In'}</span>
              </button>

              <button
                onClick={() => onOpenAuth('customer_signup')}
                className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-[11px] sm:text-xs font-black rounded-xl transition-all shadow-md hidden sm:flex items-center gap-1 cursor-pointer shrink-0"
              >
                <span>{isUrdu ? 'Sign Up' : 'Sign Up'}</span>
              </button>
            </div>
          )}

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1 sm:p-1.5 text-slate-300 hover:text-amber-400 rounded-lg border border-slate-800 shrink-0 cursor-pointer"
            aria-label="Open mobile navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-[#0c0e16] px-4 py-4 space-y-3">
          <div className="pb-2 border-b border-slate-800">
            <PWAInstallButton isUrdu={isUrdu} variant="banner" />
          </div>

          <div className="grid grid-cols-1 gap-2 text-xs font-bold">
            <button
              onClick={() => { onOpenOrderModal('home_services'); setMobileMenuOpen(false); }}
              className="p-3 rounded-xl bg-[#141624] text-amber-300 border border-amber-500/20 flex items-center gap-2 text-left"
            >
              <Wrench className="w-4 h-4 text-amber-400" />
              <span>{isUrdu ? '1. Book a Technician (Gharelu Services)' : '1. Book a Technician'}</span>
            </button>
            <button
              onClick={() => { onOpenOrderModal('custom_delivery'); setMobileMenuOpen(false); }}
              className="p-3 rounded-xl bg-[#141624] text-amber-300 border border-amber-500/20 flex items-center gap-2 text-left"
            >
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <span>{isUrdu ? '2. Book a Ride & Delivery' : '2. Book a Ride'}</span>
            </button>
            <button
              onClick={() => { onOpenOrderModal('transport_cargo'); setMobileMenuOpen(false); }}
              className="p-3 rounded-xl bg-[#141624] text-amber-300 border border-amber-500/20 flex items-center gap-2 text-left"
            >
              <Truck className="w-4 h-4 text-amber-400" />
              <span>{isUrdu ? '3. Book Cargo & Loader Riksha' : '3. Book a Cargo'}</span>
            </button>
          </div>

          {currentUser ? (
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-2">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover border border-amber-400/50"
                  />
                  <div>
                    <div className="text-xs font-bold text-white">{currentUser.name}</div>
                    <div className="text-[10px] text-amber-400 capitalize">{currentUser.role} Account</div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-2.5 py-1 rounded-lg bg-red-950/60 border border-red-500/30 text-red-300 text-xs font-bold flex items-center gap-1 hover:bg-red-900/80 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{isUrdu ? 'Logout' : 'Sign Out'}</span>
                </button>
              </div>

              {currentUser.role === 'admin' && (
                <button
                  onClick={() => { setActivePortal(activePortal === 'admin' ? 'customer' : 'admin'); setMobileMenuOpen(false); }}
                  className="w-full py-2.5 px-3 rounded-xl bg-amber-400 text-slate-950 text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{activePortal === 'admin' ? 'Switch to Customer View' : 'Open Admin Operations Panel'}</span>
                </button>
              )}

              {currentUser.role === 'provider' && (
                <button
                  onClick={() => { setActivePortal(activePortal === 'provider' ? 'customer' : 'provider'); setMobileMenuOpen(false); }}
                  className="w-full py-2.5 px-3 rounded-xl bg-amber-400 text-slate-950 text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>{activePortal === 'provider' ? 'Switch to Customer View' : 'Open Worker / Driver Portal'}</span>
                </button>
              )}

              <button
                onClick={() => { onOpenLiveTracker(); setMobileMenuOpen(false); }}
                className="w-full py-2.5 px-3 rounded-xl bg-[#141624] text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>{isUrdu ? 'Meri Live Order Tracking' : 'My Live Order Tracking'}</span>
                {pendingOrActiveCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[10px] flex items-center justify-center font-black">
                    {pendingOrActiveCount}
                  </span>
                )}
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-slate-800 flex gap-2">
              <button
                onClick={() => { onOpenAuth('login'); setMobileMenuOpen(false); }}
                className="flex-1 py-2 text-center rounded-xl border border-slate-700 text-xs font-bold text-slate-300 bg-slate-900 cursor-pointer"
              >
                {isUrdu ? 'Login' : 'Sign In'}
              </button>
              <button
                onClick={() => { onOpenAuth('customer_signup'); setMobileMenuOpen(false); }}
                className="flex-1 py-2 text-center rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-xs font-black cursor-pointer shadow-md"
              >
                {isUrdu ? 'Sign Up' : 'Sign Up'}
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
