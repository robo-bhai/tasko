import React, { useState } from 'react';
import { 
  Home, 
  ShoppingBag, 
  Plus, 
  Wallet, 
  User as UserIcon,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Phone,
  X,
  LogOut,
  CheckCircle2
} from 'lucide-react';
import { User, Order } from '../types';
import { Store } from '../services/store';

interface BottomNavigationProps {
  currentUser: User | null;
  activeOrders: Order[];
  onNavigateHome: () => void;
  onOpenOrders: () => void;
  onOpenBookNow: () => void;
  onOpenAuth: (tab?: 'login' | 'customer_signup' | 'provider_signup', notice?: string) => void;
  onLogout: () => void;
  isUrdu: boolean;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentUser,
  activeOrders,
  onNavigateHome,
  onOpenOrders,
  onOpenBookNow,
  onOpenAuth,
  onLogout,
  isUrdu
}) => {
  const [activeTab, setActiveTab] = useState<'home' | 'orders' | 'wallet' | 'profile'>('home');
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const pendingActiveCount = activeOrders.filter(
    o => o.status !== 'completed' && o.status !== 'cancelled'
  ).length;

  const handleTabClick = (tab: 'home' | 'orders' | 'wallet' | 'profile') => {
    setActiveTab(tab);
    if (tab === 'home') {
      onNavigateHome();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'orders') {
      if (!currentUser) {
        onOpenAuth('login', isUrdu ? 'Apne orders aur history dekhne ke liye login karein' : 'Please sign in to view your orders');
      } else {
        onOpenOrders();
      }
    } else if (tab === 'wallet') {
      setIsWalletModalOpen(true);
    } else if (tab === 'profile') {
      if (!currentUser) {
        onOpenAuth('login', isUrdu ? 'Profile dekhne ke liye login karein' : 'Please sign in to view your profile');
      } else {
        setIsProfileModalOpen(true);
      }
    }
  };

  return (
    <>
      {/* Sticky Bottom Navigation Bar */}
      <nav 
        aria-label="Bottom Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 bg-[#07080d]/95 backdrop-blur-md border-t border-amber-500/30 px-3 py-1.5 shadow-[0_-8px_30px_rgba(0,0,0,0.8)] pb-safe"
      >
        <div className="max-w-md mx-auto flex items-center justify-around relative">
          
          {/* 1. Home */}
          <button
            onClick={() => handleTabClick('home')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'home' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">{isUrdu ? 'Home' : 'Home'}</span>
          </button>

          {/* 2. Orders */}
          <button
            onClick={() => handleTabClick('orders')}
            className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'orders' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {pendingActiveCount > 0 && (
              <span className="absolute -top-0.5 right-2 w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-black text-[9px] flex items-center justify-center animate-pulse">
                {pendingActiveCount}
              </span>
            )}
            <ShoppingBag className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">{isUrdu ? 'Orders' : 'Orders'}</span>
          </button>

          {/* 3. Center Elevated "Book Now" Button */}
          <div className="relative -top-4 flex flex-col items-center">
            <button
              onClick={() => {
                onOpenBookNow();
              }}
              className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/40 ring-4 ring-[#07080d] hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title={isUrdu ? 'Book Now' : 'Book Now'}
            >
              <Plus className="w-6 h-6 stroke-[3]" />
            </button>
            <span className="text-[10px] font-black text-amber-400 mt-0.5 tracking-tight">
              {isUrdu ? 'Book Now' : 'Book Now'}
            </span>
          </div>

          {/* 4. Wallet */}
          <button
            onClick={() => handleTabClick('wallet')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'wallet' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wallet className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">{isUrdu ? 'Wallet' : 'Wallet'}</span>
          </button>

          {/* 5. Profile */}
          <button
            onClick={() => handleTabClick('profile')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'profile' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserIcon className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">
              {currentUser ? (isUrdu ? 'Profile' : 'Profile') : (isUrdu ? 'Login' : 'Sign In')}
            </span>
          </button>

        </div>
      </nav>

      {/* Wallet Modal */}
      {isWalletModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#0e1017] rounded-3xl max-w-sm w-full border border-amber-500/40 p-5 shadow-2xl text-white space-y-4 max-h-[94vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">
                    {isUrdu ? 'Khanewal SafePay Wallet' : 'Khanewal SafePay Wallet'}
                  </h3>
                  <p className="text-[10px] text-amber-400/80">
                    {isUrdu ? '100% Shafaf aur mehfooz adaigiyan' : '100% Protected Escrow'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsWalletModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Balance & COD Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1a1712] to-[#12131b] border border-amber-500/30 space-y-2">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                {isUrdu ? 'Dastiyab Sahoolat' : 'Available Payment Method'}
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-black text-amber-400 font-mono">
                  {isUrdu ? 'Cash on Delivery (COD)' : 'Cash on Delivery (COD)'}
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                  {isUrdu ? 'Active' : 'Active'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {isUrdu 
                  ? 'Kaam mukammal hone aur aap ke mutmain hone ke baad raqam karigar ya rider ko ada karein. Koi chhupe charges nahi.' 
                  : 'Pay directly after job completion and your complete satisfaction.'}
              </p>
            </div>

            {/* Supported digital channels */}
            <div className="space-y-2 text-xs">
              <span className="text-[11px] font-bold text-slate-300">
                {isUrdu ? 'Digital Adaigiyan Bazariya:' : 'Digital Payment Options:'}
              </span>
              <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200">
                  <CreditCard className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                  <span className="font-bold block">JazzCash</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200">
                  <CreditCard className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                  <span className="font-bold block">EasyPaisa</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200">
                  <ShieldCheck className="w-4 h-4 mx-auto mb-1 text-sky-400" />
                  <span className="font-bold block">Raast Bank</span>
                </div>
              </div>
            </div>

            {/* Trust note */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2 text-[11px] text-amber-300">
              <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <span>
                {isUrdu
                  ? 'Aap ka aitemad hi hamari pehchan hai. Kisi bhi issue ke liye Admin WhatsApp 24/7 dastiyab hai.'
                  : 'Your trust is our reputation. 24/7 Admin dispute protection guarantee.'}
              </span>
            </div>

            <button
              onClick={() => setIsWalletModalOpen(false)}
              className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer"
            >
              {isUrdu ? 'Theek Hai' : 'Got It'}
            </button>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {isProfileModalOpen && currentUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#0e1017] rounded-3xl max-w-sm w-full border border-amber-500/40 p-5 shadow-2xl text-white space-y-4 max-h-[94vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400 font-bold">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">{currentUser.name}</h3>
                  <span className="text-[10px] text-amber-400 font-mono capitalize">
                    {currentUser.role} · {currentUser.phone}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setIsProfileModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">{isUrdu ? 'Email' : 'Email'}</span>
                <p className="text-white font-mono text-xs">{currentUser.email}</p>
              </div>

              {currentUser.address && (
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">{isUrdu ? 'Pata / Address' : 'Address'}</span>
                  <p className="text-white text-xs">{currentUser.address}</p>
                </div>
              )}
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  setIsProfileModalOpen(false);
                  onOpenOrders();
                }}
                className="w-full py-2.5 bg-[#171924] hover:bg-[#202232] text-amber-300 font-bold text-xs rounded-xl border border-amber-500/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isUrdu ? 'Mere Tamam Orders o Raseedein' : 'View My Orders & Receipts'}</span>
              </button>

              <button
                onClick={() => {
                  setIsProfileModalOpen(false);
                  onLogout();
                }}
                className="w-full py-2 bg-red-950/60 hover:bg-red-900/80 text-red-300 font-bold text-xs rounded-xl border border-red-500/30 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{isUrdu ? 'Logout Karein' : 'Sign Out'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
