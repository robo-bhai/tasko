import React, { useState } from 'react';
import { User } from '../types';
import { Store, DEFAULT_ADMIN_USERNAME, DEFAULT_ADMIN_PASSWORD, KHANEWAL_LOCAL_AREAS } from '../services/store';
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
      setErrorMessage(isUrdu ? 'برائے مہربانی ای میل یا فون نمبر درج کریں۔' : 'Please enter your email or phone number.');
      return;
    }
    if (!loginPassword.trim()) {
      setErrorMessage(isUrdu ? 'برائے مہربانی اپنا پاس ورڈ درج کریں۔' : 'Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const authRes = Store.authenticateUser(loginIdentifier.trim(), loginPassword.trim());
      setIsSubmitting(false);

      if (!authRes.success || !authRes.user) {
        setErrorMessage(
          authRes.error || 
          (isUrdu ? 'غلط تفصیلات۔ ای میل / فون اور پاس ورڈ دوبارہ چیک کریں۔' : 'Invalid credentials. Please verify your email/phone and password.')
        );
        return;
      }

      setSuccessMessage(isUrdu ? `خوش آمدید! آپ کامیابی سے لاگ ان ہو چکے ہیں۔` : `Welcome back, ${authRes.user.name}!`);
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
      setErrorMessage(isUrdu ? 'تمام ضروری خانے پر کریں۔' : 'Please fill in all required fields.');
      return;
    }

    if (custPassword.length < 6) {
      setErrorMessage(isUrdu ? 'پاس ورڈ کم از کم 6 ہندسوں کا ہونا چاہیے۔' : 'Password must be at least 6 characters.');
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

      setSuccessMessage(isUrdu ? 'خانیوال کسٹمر اکاؤنٹ کامیابی سے بن گیا!' : 'Khanewal Customer profile created successfully!');
      setTimeout(() => {
        setIsSubmitting(false);
        onSuccess(newCustomer);
        onClose();
      }, 600);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || (isUrdu ? 'اکاؤنٹ بنانے میں خرابی۔' : 'Failed to register account.'));
    }
  };

  const whatsappAdminNumber = (Store.getSettings().whatsappSupportPhone || '+923000009988').replace(/[^0-9]/g, '');
  const partnerOnboardUrl = `https://wa.me/${whatsappAdminNumber}?text=${encodeURIComponent(
    isUrdu 
      ? 'السلام علیکم! میں Khanewal Connect پر بطور سروس پارٹنر / کاریگر / ڈرائیور آن بورڈ ہونا چاہتا ہوں۔ برائے مہربانی مجھے رجسٹر کریں۔'
      : 'Hello Admin, I want to onboard as a verified service partner on Khanewal Connect. Please register me.'
  )}`;

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 ${isUrdu ? 'rtl' : 'ltr'}`}>
      <div className="bg-[#0f1118] text-white rounded-3xl max-w-lg w-full shadow-2xl border border-amber-500/30 overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-5 bg-[#090a0f] text-white flex items-center justify-between border-b border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 text-slate-950 flex items-center justify-center font-black text-sm shadow-md">
              KC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white tracking-tight">
                  {isUrdu ? 'خانیوال کنیکٹ اکاؤنٹ پورٹل' : 'Khanewal Connect Portal'}
                </h3>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded-full">
                  خانیوال لوکل
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isUrdu ? 'صرف خانیوال شہر اور قریبی علاقوں کے لیے محفوظ لاگ ان' : 'Secure Access for Khanewal City & Surrounding Areas'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-amber-400 p-1.5 rounded-xl transition-colors hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice reason banner if redirected */}
        {noticeReason && (
          <div className="bg-amber-950/40 border-b border-amber-500/30 px-6 py-3 flex items-center gap-2.5 text-xs text-amber-300 font-medium">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{noticeReason}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-[#0a0c12] p-1.5 gap-1.5 text-xs font-semibold">
          <button
            onClick={() => { setActiveTab('login'); setErrorMessage(''); }}
            className={`flex-1 py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'login'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>{isUrdu ? 'لاگ ان کریں (Sign In)' : 'Sign In'}</span>
          </button>
          
          <button
            onClick={() => { setActiveTab('customer_signup'); setErrorMessage(''); }}
            className={`flex-1 py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'customer_signup'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{isUrdu ? 'نیا کسٹمر اکاؤنٹ بنائیں' : 'Create Customer Account'}</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
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
                  {isUrdu ? 'رجسٹرڈ ای میل یا موبائل فون نمبر' : 'Registered Email or Mobile Phone'} *
                </label>
                <div className="relative">
                  <Mail className={`w-3.5 h-3.5 text-slate-500 absolute ${isUrdu ? 'right-3' : 'left-3'} top-3`} />
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder={isUrdu ? 'admin@omniserve.com یا +923001234567' : 'admin@omniserve.com or phone'}
                    className={`w-full rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 py-2.5 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 focus:outline-hidden ${
                      isUrdu ? 'pr-9 pl-3 font-mono text-left' : 'pl-9 pr-3 font-mono'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">
                  {isUrdu ? 'پاس ورڈ (Password)' : 'Password'} *
                </label>
                <div className="relative">
                  <Lock className={`w-3.5 h-3.5 text-slate-500 absolute ${isUrdu ? 'right-3' : 'left-3'} top-3`} />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 py-2.5 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 focus:outline-hidden ${
                      isUrdu ? 'pr-9 pl-3' : 'pl-9 pr-3'
                    }`}
                  />
                </div>
              </div>

              {/* Helper Quick Fill for Admin & Verified Worker */}
              <div className="bg-slate-900/90 border border-amber-500/20 rounded-xl p-3 text-[11px] text-slate-300 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-amber-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{isUrdu ? 'ایڈمن لاگ ان کواڈینشلز:' : 'Admin & Staff Access:'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginIdentifier(DEFAULT_ADMIN_USERNAME);
                      setLoginPassword(DEFAULT_ADMIN_PASSWORD);
                    }}
                    className="text-[10px] text-amber-400 hover:text-amber-300 underline font-semibold cursor-pointer"
                  >
                    {isUrdu ? 'خودکار درج کریں' : 'Auto Fill Admin'}
                  </button>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  {isUrdu 
                    ? `ایڈمن صارف نام: ${DEFAULT_ADMIN_USERNAME} | پاس ورڈ GitHub Secrets سے سنک ہے۔`
                    : `Admin: ${DEFAULT_ADMIN_USERNAME} (Loaded from GitHub Secrets).`}
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-black rounded-xl transition-all shadow-lg hover:shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (isUrdu ? 'تصدیق ہو رہی ہے...' : 'Authenticating...') : (isUrdu ? 'لاگ ان کریں' : 'Sign In Now')}
              </button>
            </form>
          )}

          {/* TAB 2: CUSTOMER SIGN UP WITH KHANEWAL LOCAL AREAS */}
          {activeTab === 'customer_signup' && (
            <form onSubmit={handleCustomerSignUp} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {isUrdu ? 'مکمل نام (Full Name)' : 'Full Name'} *
                </label>
                <input
                  type="text"
                  required
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  placeholder={isUrdu ? 'مثلاً محمد علی خان' : 'e.g. Muhammad Ali Khan'}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 text-white px-3 py-2 focus:border-amber-400 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {isUrdu ? 'ای میل ایڈریس' : 'Email Address'} *
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
                    {isUrdu ? 'موبائل نمبر (خانیوال)' : 'Mobile Phone'} *
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {isUrdu ? 'پاس ورڈ (Password)' : 'Password'} *
                  </label>
                  <input
                    type="password"
                    required
                    value={custPassword}
                    onChange={(e) => setCustPassword(e.target.value)}
                    placeholder={isUrdu ? 'کم از کم 6 ہندسے' : 'Min 6 characters'}
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 text-white px-3 py-2 focus:border-amber-400 focus:outline-hidden"
                  />
                </div>

                {/* KHANEWAL LOCAL OPERATIONAL AREAS (Replaced Lahore/Karachi) */}
                <div>
                  <label className="block text-amber-400 font-bold mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isUrdu ? 'خانیوال کا علاقہ / سیکٹر *' : 'Khanewal Local Area *'}</span>
                  </label>
                  <select
                    value={custAreaId}
                    onChange={(e) => setCustAreaId(e.target.value)}
                    className="w-full rounded-xl bg-slate-900 border border-amber-500/50 text-white px-3 py-2 font-medium focus:border-amber-400 focus:outline-hidden cursor-pointer"
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
                <label className="block text-slate-300 font-bold mb-1">
                  {isUrdu ? 'گھر / دکان کا مکمل پتہ (گلی، مکان نمبر)' : 'Street & House Address in Khanewal'}
                </label>
                <div className="relative">
                  <MapPin className={`w-3.5 h-3.5 text-slate-500 absolute ${isUrdu ? 'right-3' : 'left-3'} top-2.5`} />
                  <input
                    type="text"
                    value={custAddress}
                    onChange={(e) => setCustAddress(e.target.value)}
                    placeholder={isUrdu ? 'مثلاً مکان 12، گلی 4، بالمقابل جامع مسجد' : 'e.g. House #12, Street #4'}
                    className={`w-full rounded-xl bg-slate-900 border border-slate-700 text-white py-2 focus:border-amber-400 focus:outline-hidden ${
                      isUrdu ? 'pr-8 pl-3' : 'pl-8 pr-3'
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black rounded-xl transition-all shadow-lg hover:shadow-amber-500/20 mt-2 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (isUrdu ? 'اکاؤنٹ بن رہا ہے...' : 'Creating...') : (isUrdu ? 'کسٹمر اکاؤنٹ مکمل کریں' : 'Complete Registration')}
              </button>
            </form>
          )}

          {/* Provider / Driver Onboarding Banner (Strictly directs to Admin WhatsApp) */}
          <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <div className="text-center sm:text-start">
              <span className="font-bold text-amber-400 block">
                {isUrdu ? 'کاریگر، رائیڈر یا لوڈر ڈرائیور ہیں؟' : 'Are you a technician, rider, or cargo driver?'}
              </span>
              <span className="text-[11px] text-slate-400">
                {isUrdu ? 'تصدیق اور آن بورڈنگ کے لیے ایڈمن واٹس ایپ پر رابطہ کریں۔' : 'Contact Khanewal Connect admin on WhatsApp to get registered.'}
              </span>
            </div>
            <a
              href={partnerOnboardUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-[11px] flex items-center gap-1.5 transition-colors shrink-0 shadow-xs"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'ایڈمن واٹس ایپ آن بورڈنگ' : 'WhatsApp Admin'}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
