import React, { useState } from 'react';
import { User, ProviderCategory } from '../types';
import { Store, DEFAULT_ADMIN_USERNAME, DEFAULT_ADMIN_PASSWORD } from '../services/store';
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
  Truck,
  Wrench,
  ShoppingBag,
  CreditCard,
  Briefcase
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
  const [activeTab, setActiveTab] = useState<'login' | 'customer_signup' | 'provider_signup'>('login');
  
  // Login fields
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Customer Signup fields
  const [custName, setCustName] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custPassword, setCustPassword] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [custCity, setCustCity] = useState('Islamabad');

  // Provider Signup fields
  const [provName, setProvName] = useState('');
  const [provEmail, setProvEmail] = useState('');
  const [provPhone, setProvPhone] = useState('');
  const [provCnic, setProvCnic] = useState('');
  const [provPassword, setProvPassword] = useState('');
  const [provCategory, setProvCategory] = useState<ProviderCategory>('home_technician');
  const [provSkill, setProvSkill] = useState('AC Master Service & Chemical Wash');
  const [provVehicle, setProvVehicle] = useState('Suzuki Ravi / Bolan Pickup (800kg)');
  const [provAddress, setProvAddress] = useState('');
  const [provCity, setProvCity] = useState('Islamabad');

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!loginIdentifier.trim()) {
      setErrorMessage(lang === 'ur' ? 'برائے مہربانی ای میل یا فون نمبر درج کریں۔' : 'Please enter your email or phone number.');
      return;
    }
    if (!loginPassword.trim()) {
      setErrorMessage(lang === 'ur' ? 'برائے مہربانی اپنا پاس ورڈ درج کریں۔' : 'Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      // Authenticate
      const authRes = Store.authenticateUser(loginIdentifier.trim(), loginPassword.trim());
      setIsSubmitting(false);

      if (!authRes.success || !authRes.user) {
        setErrorMessage(
          authRes.error || 
          (lang === 'ur' ? 'غلط تفصیلات۔ ای میل / فون اور پاس ورڈ دوبارہ چیک کریں۔' : 'Invalid credentials. Please verify your email/phone and password.')
        );
        return;
      }

      setSuccessMessage(lang === 'ur' ? `خوش آمدید! آپ کامیابی سے لاگ ان ہو چکے ہیں۔` : `Welcome back, ${authRes.user.name}!`);
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
      setErrorMessage(lang === 'ur' ? 'تمام ضروری خانے پر کریں۔' : 'Please fill in all required fields.');
      return;
    }

    if (custPassword.length < 6) {
      setErrorMessage(lang === 'ur' ? 'پاس ورڈ کم از کم 6 ہندسوں کا ہونا چاہیے۔' : 'Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newCustomer = Store.registerCustomer({
        name: custName.trim(),
        email: custEmail.trim(),
        phone: custPhone.trim(),
        password: custPassword.trim(),
        address: custAddress.trim() ? `${custAddress.trim()}, ${custCity}` : `${custCity}, Pakistan`
      });

      setSuccessMessage(lang === 'ur' ? 'کسٹمر اکاؤنٹ کامیابی سے بن گیا!' : 'Customer profile created successfully!');
      setTimeout(() => {
        setIsSubmitting(false);
        onSuccess(newCustomer);
        onClose();
      }, 600);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || (lang === 'ur' ? 'اکاؤنٹ بنانے میں خرابی۔' : 'Failed to register account.'));
    }
  };

  const handleProviderSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!provName.trim() || !provEmail.trim() || !provPhone.trim() || !provPassword.trim()) {
      setErrorMessage(lang === 'ur' ? 'تمام ضروری معلومات فراہم کریں۔' : 'Please fill in all required fields.');
      return;
    }

    if (provPassword.length < 6) {
      setErrorMessage(lang === 'ur' ? 'پاس ورڈ کم از کم 6 ہندسوں کا ہونا چاہیے۔' : 'Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newProvider = Store.registerProvider({
        name: provName.trim(),
        email: provEmail.trim(),
        phone: provPhone.trim(),
        password: provPassword.trim(),
        cnic: provCnic.trim(),
        city: provCity,
        providerCategory: provCategory,
        serviceSkill: provCategory === 'home_technician' ? provSkill : undefined,
        vehicleType: provCategory === 'cargo_driver' ? provVehicle : provCategory === 'delivery_courier' ? '125cc Delivery Bike' : undefined,
        address: provAddress.trim() ? `${provAddress.trim()}, ${provCity}` : `${provCity}, Pakistan`
      });

      setSuccessMessage(lang === 'ur' ? 'ورکر / ڈرائیور پروفائل رجسٹر ہو گئی۔ خوش آمدید!' : 'Provider profile created successfully! Welcome aboard.');
      setTimeout(() => {
        setIsSubmitting(false);
        onSuccess(newProvider);
        onClose();
      }, 600);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || (lang === 'ur' ? 'رجسٹریشن ناکام ہو گئی۔' : 'Failed to register provider.'));
    }
  };

  const isUrdu = lang === 'ur';

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 ${isUrdu ? 'rtl' : 'ltr'}`}>
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-sm shadow-md text-white">
              OS
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {isUrdu ? 'اومنی سروس پورٹل' : 'OmniServe Account'}
              </h3>
              <p className="text-xs text-slate-300">
                {isUrdu ? 'کسٹمر اور سروس پارٹنرز کے لیے محفوظ رسائی' : 'Secure Access for Customers, Providers & Admins'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg transition-colors hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice reason banner if redirected */}
        {noticeReason && (
          <div className="bg-blue-50 border-b border-blue-100 px-6 py-3 flex items-center gap-2.5 text-xs text-blue-900 font-medium">
            <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{noticeReason}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 p-1.5 gap-1 text-xs font-semibold">
          <button
            onClick={() => { setActiveTab('login'); setErrorMessage(''); }}
            className={`flex-1 py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'login'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>{t.loginTab}</span>
          </button>
          
          <button
            onClick={() => { setActiveTab('customer_signup'); setErrorMessage(''); }}
            className={`flex-1 py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'customer_signup'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{isUrdu ? 'نیا کسٹمر اکاؤنٹ' : 'Customer Sign Up'}</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Alerts */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* TAB 1: LOGIN */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {t.emailOrPhone} *
                </label>
                <div className="relative">
                  <Mail className={`w-4 h-4 text-slate-400 absolute ${isUrdu ? 'right-3' : 'left-3'} top-3`} />
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder={isUrdu ? 'مثلاً user@example.com یا 03001234567' : 'e.g. user@example.com or +92 300 1234567'}
                    className={`w-full text-xs rounded-xl border border-slate-300 py-2.5 ${isUrdu ? 'pr-9 pl-3' : 'pl-9 pr-3'} focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-sans`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {t.password} *
                </label>
                <div className="relative">
                  <Lock className={`w-4 h-4 text-slate-400 absolute ${isUrdu ? 'right-3' : 'left-3'} top-3`} />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full text-xs rounded-xl border border-slate-300 py-2.5 ${isUrdu ? 'pr-9 pl-3' : 'pl-9 pr-3'} focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600`}
                  />
                </div>
              </div>

              {/* Admin Note */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-500 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>{isUrdu ? 'ایڈمن اور کنٹرول پینل تک رسائی:' : 'Admin & Master Access:'}</span>
                </div>
                <p className="leading-relaxed">
                  {isUrdu 
                    ? 'ایڈمن لاگ ان کے لیے اپنے GitHub Secrets والے ADMIN_USERNAME اور ADMIN_PASSWORD درج کریں۔'
                    : 'Log in with your configured ADMIN_USERNAME and ADMIN_PASSWORD secrets to access the master control panel.'}
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? (isUrdu ? 'تصدیق ہو رہی ہے...' : 'Authenticating...') : t.loginBtn}
              </button>
            </form>
          )}

          {/* TAB 2: CUSTOMER SIGN UP */}
          {activeTab === 'customer_signup' && (
            <form onSubmit={handleCustomerSignUp} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  {t.fullName} *
                </label>
                <input
                  type="text"
                  required
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  placeholder={isUrdu ? 'مثلاً محمد علی خان' : 'e.g. Muhammad Ali Khan'}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {t.emailAddress} *
                  </label>
                  <input
                    type="email"
                    required
                    value={custEmail}
                    onChange={(e) => setCustEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {t.mobilePhone} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {t.password} *
                  </label>
                  <input
                    type="password"
                    required
                    value={custPassword}
                    onChange={(e) => setCustPassword(e.target.value)}
                    placeholder={isUrdu ? 'کم از کم 6 ہندسے' : 'Min 6 characters'}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {t.city} *
                  </label>
                  <select
                    value={custCity}
                    onChange={(e) => setCustCity(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 bg-white"
                  >
                    <option value="Islamabad">Islamabad (اسلام آباد)</option>
                    <option value="Rawalpindi">Rawalpindi (راولپنڈی)</option>
                    <option value="Lahore">Lahore (لاہور)</option>
                    <option value="Karachi">Karachi (کراچی)</option>
                    <option value="Peshawar">Peshawar (پشاور)</option>
                    <option value="Faisalabad">Faisalabad (فیصل آباد)</option>
                    <option value="Multan">Multan (ملتان)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  {t.deliveryAddress}
                </label>
                <div className="relative">
                  <MapPin className={`w-3.5 h-3.5 text-slate-400 absolute ${isUrdu ? 'right-3' : 'left-3'} top-2.5`} />
                  <input
                    type="text"
                    value={custAddress}
                    onChange={(e) => setCustAddress(e.target.value)}
                    placeholder={isUrdu ? 'مکان نمبر، گلی نمبر، سیکٹر یا علاقہ' : 'House #, Street #, Sector / Area'}
                    className={`w-full rounded-xl border border-slate-300 py-2 ${isUrdu ? 'pr-8 pl-3' : 'pl-8 pr-3'}`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-sm mt-2 disabled:opacity-50"
              >
                {isSubmitting ? (isUrdu ? 'اکاؤنٹ بن رہا ہے...' : 'Creating...') : t.createAccountBtn}
              </button>
            </form>
          )}

          {/* TAB 3: PROVIDER NOTICE (RESTRICTED TO ADMIN ONBOARDING ONLY) */}
          {activeTab === 'provider_signup' && (
            <div className="space-y-4 text-center py-4">
              <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 mb-1">
                  {isUrdu ? 'پرووائیڈر اکاؤنٹ رجسٹریشن ایڈمن کے ذریعے محدود ہے' : 'Provider Registration is Admin-Restricted'}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                  {isUrdu
                    ? 'سیکیورٹی اور کوالٹی کے پیشِ نظر سروس پرووائیڈرز (ٹیکنیشن، پلمبر، رائیڈر) کے اکاؤنٹس صرف خانیوال کنیکٹ ایڈمن پینل سے تصدیق کے بعد بنتے ہیں۔ براہِ کرم تصدیق کے لیے ایڈمن سے رابطہ کریں۔'
                    : 'For security and service quality, service provider accounts (technicians, plumbers, drivers) are strictly created and onboarded by Khanewal Connect Administration. Please contact Admin via WhatsApp to join.'}
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 text-start space-y-1">
                <div className="font-semibold text-slate-900">{isUrdu ? 'ضروری دستاویزات برائے ایڈمن:' : 'Required for Admin Onboarding:'}</div>
                <div className="text-[11px] text-slate-600">• {isUrdu ? 'اصل قومی شناختی کارڈ (CNIC)' : 'Valid CNIC Copy'}</div>
                <div className="text-[11px] text-slate-600">• {isUrdu ? 'موبائل نمبر اور متعلقہ سروس کی مہارت کا ثبوت' : 'Active Mobile Number & Verified Trade Experience'}</div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors"
                >
                  {isUrdu ? 'لاگ ان صفحہ پر جائیں' : 'Back to Login'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('customer_signup')}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                >
                  {isUrdu ? 'کسٹمر اکاؤنٹ بنائیں' : 'Sign Up as Customer'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
