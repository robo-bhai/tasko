import React, { useState } from 'react';
import { User } from '../types';
import { Store, KHANEWAL_LOCAL_AREAS } from '../services/store';
import { Language, translations } from '../i18n/translations';
import { 
  X, 
  Phone, 
  Mail, 
  Lock, 
  UserCheck, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  MapPin,
  ShoppingBag,
  MessageCircle,
  Sparkles
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  noticeReason?: string;
  lang: Language;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  noticeReason,
  lang
}) => {
  const t = translations[lang];
  const isUrdu = lang === 'ur';

  const [activeTab, setActiveTab] = useState<'login' | 'customer_signup'>('login');
  
  // Login fields
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Customer Signup fields
  const [custName, setCustName] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custPassword, setCustPassword] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [custAreaId, setCustAreaId] = useState(KHANEWAL_LOCAL_AREAS[0].id);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const selectedArea = KHANEWAL_LOCAL_AREAS.find(a => a.id === custAreaId) || KHANEWAL_LOCAL_AREAS[0];

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!loginIdentifier.trim()) {
      setErrorMessage(isUrdu ? 'Barae meherbani email ya phone number darj karein.' : 'Please enter your email or phone number.');
      return;
    }
    if (!loginPassword.trim()) {
      setErrorMessage(isUrdu ? 'Barae meherbani apna password darj karein.' : 'Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const authRes = Store.authenticateUser(loginIdentifier.trim(), loginPassword.trim());
      setIsSubmitting(false);

      if (!authRes.success || !authRes.user) {
        setErrorMessage(
          authRes.error || 
          (isUrdu ? 'Ghalat details. Email / phone aur password dobara check karein.' : 'Invalid credentials. Please verify your email/phone and password.')
        );
        return;
      }

      setSuccessMessage(isUrdu ? `Khush amdeed! Aap kamyabi se login ho chuke hain.` : `Welcome back, ${authRes.user.name}!`);
      setTimeout(() => {
        onSuccess(authRes.user!);
        onClose();
      }, 500);
    }, 400);
  };

  const handleCustomerSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!custName.trim() || !custEmail.trim() || !custPhone.trim() || !custPassword.trim()) {
      setErrorMessage(isUrdu ? 'Tamam zaroori boxes fill karein.' : 'Please fill in all required fields.');
      return;
    }

    if (custPassword.length < 6) {
      setErrorMessage(isUrdu ? 'Password kam az kam 6 characters ka hona chahiye.' : 'Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const areaLabel = isUrdu ? selectedArea.nameUr : selectedArea.nameEn;
      const formattedAddress = custAddress.trim() 
        ? `${custAddress.trim()}, ${areaLabel}` 
        : `${areaLabel}, Khanewal`;

      const newCustomer = Store.registerCustomer({
        name: custName.trim(),
        email: custEmail.trim(),
        phone: custPhone.trim(),
        password: custPassword.trim(),
        address: formattedAddress
      });

      setSuccessMessage(isUrdu ? 'Khanewal Customer account kamyabi se ban gaya!' : 'Khanewal Customer profile created successfully!');
      setTimeout(() => {
        setIsSubmitting(false);
        onSuccess(newCustomer);
        onClose();
      }, 600);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || (isUrdu ? 'Account banane mein kharabi.' : 'Failed to register account.'));
    }
  };

  const whatsappAdminNumber = (Store.getSettings().whatsappSupportPhone || '+923040975351').replace(/[^0-9]/g, '');
  const partnerOnboardUrl = `https://wa.me/${whatsappAdminNumber}?text=${encodeURIComponent(
    isUrdu 
      ? 'Assalam-o-Alaikum! Main Khanewal Connect par bataur service partner / karigar / driver onboard hona chahta hoon. Barae meherbani mujhe register karein.'
      : 'Hello Admin, I want to onboard as a verified service partner on Khanewal Connect. Please register me.'
  )}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 ltr">
      <div className="bg-[#0f1118] text-white rounded-2xl sm:rounded-3xl max-w-lg w-full shadow-2xl border border-amber-500/30 overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="px-3.5 py-3 sm:px-6 sm:py-4 bg-[#090a0f] text-white flex items-center justify-between border-b border-amber-500/20 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 text-slate-950 flex items-center justify-center font-black text-xs sm:text-sm shadow-md shrink-0">
              KC
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h3 className="text-xs sm:text-base font-extrabold text-white tracking-tight">
                  {isUrdu ? 'Khanewal Connect Account' : 'Khanewal Connect'}
                </h3>
                <span className="text-[9px] sm:text-[10px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-1.5 sm:px-2 py-0.5 rounded-full">
                  Khanewal Local
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 line-clamp-1">
                {isUrdu ? 'Sirf Khanewal shehar aur qareebi ilaqon ke liye' : 'Khanewal City & Surrounding Areas'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-amber-400 p-1 rounded-lg transition-colors hover:bg-slate-800"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Notice reason banner if redirected */}
        {noticeReason && (
          <div className="bg-amber-950/40 border-b border-amber-500/30 px-3.5 py-2 sm:px-6 sm:py-3 flex items-center gap-2 text-[11px] sm:text-xs text-amber-300 font-medium shrink-0">
            <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
            <span className="line-clamp-2">{noticeReason}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-[#0a0c12] p-1 gap-1 text-[11px] sm:text-xs font-semibold shrink-0">
          <button
            onClick={() => { setActiveTab('login'); setErrorMessage(''); }}
            className={`flex-1 py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer text-center ${
              activeTab === 'login'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <UserCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="truncate">{isUrdu ? 'Login' : 'Sign In'}</span>
          </button>
          
          <button
            onClick={() => { setActiveTab('customer_signup'); setErrorMessage(''); }}
            className={`flex-1 py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer text-center ${
              activeTab === 'customer_signup'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="truncate">{isUrdu ? 'Naya Account Banayein' : 'Create Account'}</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-3.5 sm:p-6 overflow-y-auto flex-1">
          {/* Alerts */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* TAB 1: LOGIN */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">
                  {isUrdu ? 'Registered Email ya Mobile Number' : 'Registered Email or Mobile Phone'} *
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder={isUrdu ? 'user@gmail.com ya +923001234567' : 'admin@omniserve.com or phone'}
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 py-2.5 pl-9 pr-3 font-mono focus:border-amber-400 focus:ring-1 focus:ring-amber-400 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">
                  {isUrdu ? 'Password' : 'Password'} *
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 py-2.5 pl-9 pr-3 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 focus:outline-hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-black rounded-xl transition-all shadow-lg hover:shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (isUrdu ? 'Checking Details...' : 'Authenticating...') : (isUrdu ? 'Login Karein' : 'Sign In Now')}
              </button>
            </form>
          )}

          {/* TAB 2: CUSTOMER SIGN UP WITH KHANEWAL LOCAL AREAS */}
          {activeTab === 'customer_signup' && (
            <form onSubmit={handleCustomerSignUp} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {isUrdu ? 'Mukammal Naam (Full Name)' : 'Full Name'} *
                </label>
                <input
                  type="text"
                  required
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  placeholder={isUrdu ? 'Maslan: Muhammad Ali Khan' : 'e.g. Muhammad Ali Khan'}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 text-white px-3 py-2 focus:border-amber-400 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {isUrdu ? 'Email Address' : 'Email Address'} *
                  </label>
                  <input
                    type="email"
                    required
                    value={custEmail}
                    onChange={(e) => setCustEmail(e.target.value)}
                    placeholder="khanewal.user@gmail.com"
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 text-white px-3 py-2 font-mono focus:border-amber-400 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {isUrdu ? 'Mobile Number (Khanewal)' : 'Mobile Phone'} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 text-white px-3 py-2 font-mono focus:border-amber-400 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1 text-[10px] sm:text-xs">
                    {isUrdu ? 'Password' : 'Password'} *
                  </label>
                  <input
                    type="password"
                    required
                    value={custPassword}
                    onChange={(e) => setCustPassword(e.target.value)}
                    placeholder={isUrdu ? 'Kam az kam 6 characters' : 'Min 6 characters'}
                    className="w-full text-xs sm:text-sm rounded-xl bg-slate-900 border border-slate-700 text-white px-3 py-2 sm:py-2.5 focus:border-amber-400 focus:outline-hidden"
                  />
                </div>

                {/* KHANEWAL LOCAL OPERATIONAL AREAS (Replaced Lahore/Karachi) */}
                <div>
                  <label className="block text-amber-400 font-bold mb-1 text-[10px] sm:text-xs flex items-center gap-1">
                    <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
                    <span>{isUrdu ? 'Khanewal Ilaqa / Sector *' : 'Khanewal Local Area *'}</span>
                  </label>
                  <select
                    value={custAreaId}
                    onChange={(e) => setCustAreaId(e.target.value)}
                    className="w-full text-xs sm:text-sm rounded-xl bg-slate-900 border border-amber-500/50 text-white px-3 py-2 sm:py-2.5 font-medium focus:border-amber-400 focus:outline-hidden cursor-pointer"
                  >
                    {KHANEWAL_LOCAL_AREAS.map(area => (
                      <option key={area.id} value={area.id} className="bg-slate-900 text-white">
                        {isUrdu ? area.nameUr : area.nameEn} ({area.sector})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1 text-[10px] sm:text-xs">
                  {isUrdu ? 'Ghar / Dukaan ka Mukammal Pata (Gali, Makaan Number)' : 'Street & House Address in Khanewal'}
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={custAddress}
                    onChange={(e) => setCustAddress(e.target.value)}
                    placeholder={isUrdu ? 'Maslan: Makaan #12, Gali #4, Main Bazar' : 'e.g. House #12, Street #4'}
                    className="w-full text-xs sm:text-sm rounded-xl bg-slate-900 border border-slate-700 text-white py-2 sm:py-2.5 pl-8 pr-3 focus:border-amber-400 focus:outline-hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs sm:text-sm rounded-xl transition-all shadow-lg hover:shadow-amber-500/20 mt-2 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (isUrdu ? 'Account Ban Raha Hai...' : 'Creating...') : (isUrdu ? 'Customer Account Mukammal Karein' : 'Complete Registration')}
              </button>
            </form>
          )}

          {/* Provider / Driver Onboarding Banner (Strictly directs to Admin WhatsApp) */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs bg-slate-900/60 p-2.5 sm:p-3 rounded-2xl border border-slate-800">
            <div className="text-center sm:text-start">
              <span className="font-bold text-amber-400 block text-[11px] sm:text-xs">
                {isUrdu ? 'Karigar, Rider ya Loader Driver Hain?' : 'Are you a technician, rider, or cargo driver?'}
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-400">
                {isUrdu ? 'Tasdeeq aur onboarding ke liye Admin WhatsApp par rabta karein.' : 'Contact Khanewal Connect admin on WhatsApp to get registered.'}
              </span>
            </div>
            <a
              href={partnerOnboardUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-[10px] sm:text-xs flex items-center gap-1.5 transition-colors shrink-0 shadow-xs"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'Admin WhatsApp' : 'WhatsApp Admin'}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
