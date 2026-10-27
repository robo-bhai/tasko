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
  Clock
} from 'lucide-react';

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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Notification / Help Bar */}
      <div className="bg-slate-900 text-slate-300 text-[11px] py-1.5 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="truncate">
              {isUrdu 
                ? 'پاکستان بھر میں لائیو سروسز: کراچی، لاہور، اسلام آباد، راولپنڈی، پشاور' 
                : 'Serving all major cities across Pakistan: Islamabad, Rawalpindi, Lahore, Karachi & Peshawar'}
            </span>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {/* Language Switcher */}
            <button
              onClick={onToggleLang}
              className="flex items-center gap-1.5 text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors border border-slate-700 cursor-pointer"
              title="Change Language / زبان تبدیل کریں"
            >
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span>{isUrdu ? 'English' : 'اردو'}</span>
            </button>

            <span className="hidden sm:inline text-slate-500">|</span>
            <span className="hidden sm:inline text-slate-400">
              {isUrdu ? 'ہیلپ لائن: 6664-0800' : 'Helpline: 0800-6664'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setActivePortal('customer')} 
            className="flex items-center gap-2.5 text-left group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 text-white flex items-center justify-center font-black text-sm shadow-md group-hover:scale-105 transition-transform">
              OS
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 text-lg tracking-tight group-hover:text-blue-600 transition-colors">
                  {t.appName}
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                  PK
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                {t.appSlogan}
              </p>
            </div>
          </button>

          {/* Quick Categories navigation (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold text-slate-600">
            <button
              onClick={() => onOpenOrderModal('custom_delivery')}
              className="px-3 py-1.5 rounded-lg hover:text-blue-600 hover:bg-blue-50/70 transition-colors flex items-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
              <span>{t.orderAnything}</span>
            </button>
            <button
              onClick={() => onOpenOrderModal('home_services')}
              className="px-3 py-1.5 rounded-lg hover:text-blue-600 hover:bg-blue-50/70 transition-colors flex items-center gap-1.5"
            >
              <Wrench className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t.homeServices}</span>
            </button>
            <button
              onClick={() => onOpenOrderModal('transport_cargo')}
              className="px-3 py-1.5 rounded-lg hover:text-blue-600 hover:bg-blue-50/70 transition-colors flex items-center gap-1.5"
            >
              <Truck className="w-3.5 h-3.5 text-amber-600" />
              <span>{t.transportCargo}</span>
            </button>
          </nav>
        </div>

        {/* Right Action Zone */}
        <div className="flex items-center gap-2.5">
          {/* Order Tracker / History Button (always accessible) */}
          <button
            onClick={() => onOpenLiveTracker()}
            className="relative px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">{t.trackOrder}</span>
            {pendingOrActiveCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                {pendingOrActiveCount}
              </span>
            )}
          </button>

          {/* User Logged In State vs Guest Visitor State */}
          {currentUser ? (
            <div className="flex items-center gap-2">
              {/* Role Portal Switching Button */}
              {currentUser.role === 'admin' && (
                <button
                  onClick={() => setActivePortal(activePortal === 'admin' ? 'customer' : 'admin')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activePortal === 'admin'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{activePortal === 'admin' ? (isUrdu ? 'کسٹمر ویو' : 'Customer View') : t.adminPortal}</span>
                </button>
              )}

              {currentUser.role === 'provider' && (
                <button
                  onClick={() => setActivePortal(activePortal === 'provider' ? 'customer' : 'provider')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activePortal === 'provider'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{activePortal === 'provider' ? (isUrdu ? 'کسٹمر ویو' : 'Customer View') : t.providerPortal}</span>
                </button>
              )}

              {/* User Profile Pill & Signout */}
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 pl-2 pr-1 py-1 rounded-2xl">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-6 h-6 rounded-full object-cover shrink-0 border border-slate-300"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                  }}
                />
                <span className="text-xs font-bold text-slate-800 max-w-[100px] truncate hidden md:inline">
                  {currentUser.name}
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                  currentUser.role === 'admin'
                    ? 'bg-purple-100 text-purple-800'
                    : currentUser.role === 'provider'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {currentUser.role}
                </span>
                <button
                  onClick={handleLogout}
                  title={t.logout}
                  className="p-1 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3.5 py-1.5 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-blue-50/70 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t.login}</span>
              </button>

              <button
                onClick={() => onOpenAuth('customer_signup')}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs hidden sm:flex items-center gap-1.5 cursor-pointer"
              >
                <span>{t.signup}</span>
              </button>

              <button
                onClick={() => onOpenAuth('provider_signup')}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl transition-colors hidden md:flex items-center gap-1.5 cursor-pointer"
              >
                <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isUrdu ? 'ورکر بنیں' : 'Join as Partner'}</span>
              </button>
            </div>
          )}

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 text-slate-600 hover:text-slate-900 rounded-lg border border-slate-200"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3">
          <div className="grid grid-cols-1 gap-2 text-xs font-semibold">
            <button
              onClick={() => { onOpenOrderModal('custom_delivery'); setMobileMenuOpen(false); }}
              className="p-2.5 rounded-xl bg-blue-50 text-blue-900 flex items-center gap-2 text-left"
            >
              <ShoppingBag className="w-4 h-4 text-blue-600" />
              <span>{t.orderAnything}</span>
            </button>
            <button
              onClick={() => { onOpenOrderModal('home_services'); setMobileMenuOpen(false); }}
              className="p-2.5 rounded-xl bg-emerald-50 text-emerald-900 flex items-center gap-2 text-left"
            >
              <Wrench className="w-4 h-4 text-emerald-600" />
              <span>{t.homeServices}</span>
            </button>
            <button
              onClick={() => { onOpenOrderModal('transport_cargo'); setMobileMenuOpen(false); }}
              className="p-2.5 rounded-xl bg-amber-50 text-amber-900 flex items-center gap-2 text-left"
            >
              <Truck className="w-4 h-4 text-amber-600" />
              <span>{t.transportCargo}</span>
            </button>
          </div>

          {!currentUser && (
            <div className="pt-2 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => { onOpenAuth('login'); setMobileMenuOpen(false); }}
                className="flex-1 py-2 text-center rounded-xl border border-slate-300 text-xs font-bold text-slate-700"
              >
                {t.login}
              </button>
              <button
                onClick={() => { onOpenAuth('customer_signup'); setMobileMenuOpen(false); }}
                className="flex-1 py-2 text-center rounded-xl bg-blue-600 text-white text-xs font-bold"
              >
                {t.signup}
              </button>
              <button
                onClick={() => { onOpenAuth('provider_signup'); setMobileMenuOpen(false); }}
                className="flex-1 py-2 text-center rounded-xl bg-emerald-600 text-white text-xs font-bold"
              >
                {isUrdu ? 'ورکر بنیں' : 'Join'}
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
