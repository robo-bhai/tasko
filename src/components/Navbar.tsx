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
    <header className="sticky top-0 z-40 bg-[#090a0f]/95 backdrop-blur-md border-b border-amber-500/20 shadow-xl text-white">
      {/* Top Location & Language Bar */}
      <div className="bg-[#050608] text-slate-300 text-[11px] py-1.5 px-3 sm:px-6 border-b border-slate-900">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
            <span className="truncate font-semibold text-slate-300">
              {isUrdu 
                ? '📍 خانیوال سٹی، پیپلز کالونی، سول لائنز، طارق آباد و چکنبرز میں آن ڈیمانڈ دستیاب' 
                : '📍 Operating exclusively across Khanewal City, Cantt, Peoples Colony & Nearby Areas'}
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Language Switcher */}
            <button
              onClick={onToggleLang}
              className="flex items-center gap-1.5 text-amber-300 hover:text-white bg-slate-900 hover:bg-slate-800 px-2.5 py-0.5 rounded-full text-xs font-bold transition-colors border border-amber-500/30 cursor-pointer"
              title="Change Language / زبان تبدیل کریں"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>{isUrdu ? 'English' : 'اردو'}</span>
            </button>

            <span className="hidden sm:inline text-slate-700">|</span>
            <span className="hidden sm:inline text-amber-400 font-mono text-[11px] font-bold">
              {isUrdu ? 'ہیلپ لائن: 6664-0800' : 'Khanewal: 0800-6664'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-4 sm:gap-6">
          <button 
            onClick={() => setActivePortal('customer')} 
            className="flex items-center gap-2 sm:gap-2.5 text-left group cursor-pointer"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 text-slate-950 flex items-center justify-center font-black text-sm shadow-lg group-hover:scale-105 transition-transform shrink-0">
              KC
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-white text-base sm:text-lg tracking-tight group-hover:text-amber-400 transition-colors">
                  {t.appName}
                </span>
                <span className="bg-amber-400/10 text-amber-400 border border-amber-400/30 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                  خانیوال
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden md:block">
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
              <span>{isUrdu ? 'بک اے ٹیکنیشن' : 'Book a Technician'}</span>
            </button>
            <button
              onClick={() => onOpenOrderModal('custom_delivery')}
              className="px-3 py-1.5 rounded-xl hover:text-amber-400 hover:bg-slate-900 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
              <span>{isUrdu ? 'بک اے رائیڈ' : 'Book a Ride'}</span>
            </button>
            <button
              onClick={() => onOpenOrderModal('transport_cargo')}
              className="px-3 py-1.5 rounded-xl hover:text-amber-400 hover:bg-slate-900 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Truck className="w-3.5 h-3.5 text-amber-400" />
              <span>{isUrdu ? 'بک اے کارگو' : 'Book a Cargo'}</span>
            </button>
          </nav>
        </div>

        {/* Right Action Zone */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* PWA Install Button */}
          <div className="hidden sm:block">
            <PWAInstallButton isUrdu={isUrdu} variant="navbar" />
          </div>

          {/* Order Tracker Button (Customer Live Tracker) */}
          {currentUser && (
            <button
              onClick={() => onOpenLiveTracker()}
              className="relative px-2.5 sm:px-3 py-1.5 rounded-xl border border-amber-500/30 bg-[#12141e] hover:bg-[#1a1c2a] text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="hidden md:inline">{isUrdu ? 'میری ٹریکنگ' : 'My Live Tracker'}</span>
              {pendingOrActiveCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[10px] flex items-center justify-center font-black">
                  {pendingOrActiveCount}
                </span>
              )}
            </button>
          )}

          {/* User Logged In State vs Guest Visitor State */}
          {currentUser ? (
            <div className="flex items-center gap-2">
              {/* Role Portal Switching Button */}
              {currentUser.role === 'admin' && (
                <button
                  onClick={() => setActivePortal(activePortal === 'admin' ? 'customer' : 'admin')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                    activePortal === 'admin'
                      ? 'bg-amber-400 text-slate-950 shadow-md'
                      : 'bg-[#141624] text-amber-400 hover:bg-[#1c1f32] border border-amber-500/30'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">
                    {activePortal === 'admin' ? (isUrdu ? 'کسٹمر ویو' : 'Customer View') : (isUrdu ? 'ایڈمن پینل' : 'Admin Panel')}
                  </span>
                </button>
              )}

              {currentUser.role === 'provider' && (
                <button
                  onClick={() => setActivePortal(activePortal === 'provider' ? 'customer' : 'provider')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                    activePortal === 'provider'
                      ? 'bg-amber-400 text-slate-950 shadow-md'
                      : 'bg-[#141624] text-amber-400 hover:bg-[#1c1f32] border border-amber-500/30'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">
                    {activePortal === 'provider' ? (isUrdu ? 'کسٹمر ویو' : 'Customer View') : (isUrdu ? 'ورکر ڈیش بورڈ' : 'Worker Portal')}
                  </span>
                </button>
              )}

              {/* User Profile Pill & Signout */}
              <div className="flex items-center gap-2 bg-[#12141f] border border-amber-500/30 pl-2 pr-1 py-1 rounded-2xl">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-6 h-6 rounded-full object-cover shrink-0 border border-amber-400/50"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                  }}
                />
                <span className="text-xs font-bold text-white max-w-[100px] truncate hidden md:inline">
                  {currentUser.name}
                </span>
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded uppercase ${
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
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-2.5 sm:px-3.5 py-1.5 rounded-xl text-slate-300 hover:text-amber-400 hover:bg-slate-900 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{isUrdu ? 'لاگ ان' : 'Sign In'}</span>
              </button>

              <button
                onClick={() => onOpenAuth('customer_signup')}
                className="px-3 sm:px-4 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-black rounded-xl transition-all shadow-md hidden sm:flex items-center gap-1.5 cursor-pointer"
              >
                <span>{isUrdu ? 'کسٹمر سائن اپ' : 'Sign Up'}</span>
              </button>
            </div>
          )}

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 text-slate-300 hover:text-amber-400 rounded-lg border border-slate-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
              <span>{isUrdu ? '1. بک اے ٹیکنیشن و کاریگر' : '1. Book a Technician'}</span>
            </button>
            <button
              onClick={() => { onOpenOrderModal('custom_delivery'); setMobileMenuOpen(false); }}
              className="p-3 rounded-xl bg-[#141624] text-amber-300 border border-amber-500/20 flex items-center gap-2 text-left"
            >
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <span>{isUrdu ? '2. بک اے رائیڈ و ڈیلیوری' : '2. Book a Ride'}</span>
            </button>
            <button
              onClick={() => { onOpenOrderModal('transport_cargo'); setMobileMenuOpen(false); }}
              className="p-3 rounded-xl bg-[#141624] text-amber-300 border border-amber-500/20 flex items-center gap-2 text-left"
            >
              <Truck className="w-4 h-4 text-amber-400" />
              <span>{isUrdu ? '3. بک اے کارگو و لوڈر' : '3. Book a Cargo'}</span>
            </button>
          </div>

          {!currentUser && (
            <div className="pt-2 border-t border-slate-800 flex gap-2">
              <button
                onClick={() => { onOpenAuth('login'); setMobileMenuOpen(false); }}
                className="flex-1 py-2 text-center rounded-xl border border-slate-700 text-xs font-bold text-slate-300 bg-slate-900"
              >
                {isUrdu ? 'لاگ ان' : 'Sign In'}
              </button>
              <button
                onClick={() => { onOpenAuth('customer_signup'); setMobileMenuOpen(false); }}
                className="flex-1 py-2 text-center rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-xs font-black"
              >
                {isUrdu ? 'کسٹمر سائن اپ' : 'Sign Up'}
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
