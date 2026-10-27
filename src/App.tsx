import React, { useState, useEffect } from 'react';
import { 
  User, 
  Order, 
  HomeServiceItem, 
  TransportVehicleItem, 
  OrderPricing 
} from './types';
import { Store, subscribeToStore } from './services/store';
import { Language, translations } from './i18n/translations';
import { Navbar } from './components/Navbar';
import { CustomerHome } from './components/CustomerPortal/CustomerHome';
import { DeliveryOrderModal } from './components/CustomerPortal/DeliveryOrderModal';
import { HomeServiceBookingModal } from './components/CustomerPortal/HomeServiceBookingModal';
import { TransportBookingModal } from './components/CustomerPortal/TransportBookingModal';
import { CheckoutModal, PendingCheckoutOrder } from './components/CustomerPortal/CheckoutModal';
import { LiveOrderTracker } from './components/CustomerPortal/LiveOrderTracker';
import { OrderHistoryModal } from './components/CustomerPortal/OrderHistoryModal';
import { ProviderDashboard } from './components/ProviderPortal/ProviderDashboard';
import { AdminDashboard } from './components/AdminPortal/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { 
  ShoppingBag, 
  Wrench, 
  Truck, 
  ShieldCheck, 
  CheckCircle2, 
  CreditCard,
  PhoneCall,
  Globe
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => Store.getCurrentUser());
  const [lang, setLang] = useState<Language>(() => {
    try {
      return (localStorage.getItem('omniserve_lang') as Language) || 'ur';
    } catch {
      return 'ur';
    }
  });

  const t = translations[lang];
  const isUrdu = lang === 'ur';

  const [activePortal, setActivePortal] = useState<'customer' | 'provider' | 'admin'>(() => {
    const user = Store.getCurrentUser();
    if (!user) return 'customer';
    return user.role === 'admin' ? 'admin' : user.role === 'provider' ? 'provider' : 'customer';
  });

  const [orders, setOrders] = useState<Order[]>(() => Store.getOrders());
  const [services, setServices] = useState<HomeServiceItem[]>(() => Store.getServicesCatalog());
  const [vehicles, setVehicles] = useState<TransportVehicleItem[]>(() => Store.getVehiclesCatalog());
  const [usersList, setUsersList] = useState<User[]>(() => Store.getUsers());

  // Modal states
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [isHomeServiceModalOpen, setIsHomeServiceModalOpen] = useState(false);
  const [isTransportModalOpen, setIsTransportModalOpen] = useState(false);
  const [preselectedServiceId, setPreselectedServiceId] = useState<string | undefined>();
  const [preselectedVehicleId, setPreselectedVehicleId] = useState<string | undefined>();

  const [pendingCheckoutOrder, setPendingCheckoutOrder] = useState<PendingCheckoutOrder | null>(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  const [isLiveTrackerOpen, setIsLiveTrackerOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | undefined>();

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  
  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authNoticeReason, setAuthNoticeReason] = useState<string | undefined>();
  const [pendingOrderAction, setPendingOrderAction] = useState<{
    category: 'custom_delivery' | 'home_services' | 'transport_cargo';
    preselectedId?: string;
  } | null>(null);

  // Toggle Language
  const handleToggleLang = () => {
    const nextLang: Language = lang === 'ur' ? 'en' : 'ur';
    setLang(nextLang);
    try {
      localStorage.setItem('omniserve_lang', nextLang);
    } catch (e) {
      console.warn('Storage unavailable:', e);
    }
  };

  // Subscribe to central store updates
  useEffect(() => {
    const unsubscribe = subscribeToStore(() => {
      setOrders(Store.getOrders());
      setUsersList(Store.getUsers());
      setServices(Store.getServicesCatalog());
      setVehicles(Store.getVehiclesCatalog());
      setCurrentUser(Store.getCurrentUser());
    });
    return unsubscribe;
  }, []);

  // Handlers for opening booking modals (Gated by Auth)
  const handleOpenOrderModal = (category: 'custom_delivery' | 'home_services' | 'transport_cargo', preselectedId?: string) => {
    // If visitor is not logged in, enforce registration/login
    if (!currentUser) {
      setAuthNoticeReason(
        lang === 'ur'
          ? 'سروس بک کرنے کے لیے برائے مہربانی پہلے لاگ ان کریں یا نیا اکاؤنٹ بنائیں۔'
          : 'Please sign in or create an account to book this service.'
      );
      setPendingOrderAction({ category, preselectedId });
      setIsAuthModalOpen(true);
      return;
    }

    if (category === 'custom_delivery') {
      setIsDeliveryModalOpen(true);
    } else if (category === 'home_services') {
      setPreselectedServiceId(preselectedId);
      setIsHomeServiceModalOpen(true);
    } else if (category === 'transport_cargo') {
      setPreselectedVehicleId(preselectedId);
      setIsTransportModalOpen(true);
    }
  };

  const handleOpenAuthModal = (tab?: 'login' | 'customer_signup' | 'provider_signup', notice?: string) => {
    setAuthNoticeReason(notice);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      setActivePortal('admin');
    } else if (user.role === 'provider') {
      setActivePortal('provider');
    } else {
      setActivePortal('customer');
      // If customer was in the middle of booking a service, resume that flow
      if (pendingOrderAction) {
        const { category, preselectedId } = pendingOrderAction;
        setPendingOrderAction(null);
        setTimeout(() => {
          if (category === 'custom_delivery') {
            setIsDeliveryModalOpen(true);
          } else if (category === 'home_services') {
            setPreselectedServiceId(preselectedId);
            setIsHomeServiceModalOpen(true);
          } else if (category === 'transport_cargo') {
            setPreselectedVehicleId(preselectedId);
            setIsTransportModalOpen(true);
          }
        }, 350);
      }
    }
  };

  const handleProceedToCheckout = (payload: PendingCheckoutOrder) => {
    setIsDeliveryModalOpen(false);
    setIsHomeServiceModalOpen(false);
    setIsTransportModalOpen(false);

    setPendingCheckoutOrder(payload);
    setIsCheckoutModalOpen(true);
  };

  const handleOrderPlaced = (newOrder: Order) => {
    setIsCheckoutModalOpen(false);
    setPendingCheckoutOrder(null);
    setSelectedOrderId(newOrder.id);
    setIsLiveTrackerOpen(true);
  };

  const handleOpenLiveTracker = (order?: Order) => {
    if (order) {
      setSelectedOrderId(order.id);
    }
    setIsLiveTrackerOpen(true);
  };

  return (
    <div className={`min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900 ${isUrdu ? 'rtl' : 'ltr'}`}>
      {/* Top Bar Navigation */}
      <Navbar
        currentUser={currentUser}
        activePortal={activePortal}
        setActivePortal={setActivePortal}
        onOpenOrderModal={handleOpenOrderModal}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        onOpenLiveTracker={handleOpenLiveTracker}
        onOpenAuth={handleOpenAuthModal}
        activeOrders={orders}
        lang={lang}
        onToggleLang={handleToggleLang}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 pt-6">
        {activePortal === 'customer' && (
          <CustomerHome
            onOpenOrderModal={handleOpenOrderModal}
            onOpenLiveTracker={handleOpenLiveTracker}
            onOpenAuth={handleOpenAuthModal}
            activeOrders={orders}
            services={services}
            vehicles={vehicles}
            lang={lang}
          />
        )}

        {activePortal === 'provider' && currentUser?.role === 'provider' && (
          <ProviderDashboard
            currentUser={currentUser}
            orders={orders}
            onOpenCustomerView={() => setActivePortal('customer')}
          />
        )}

        {activePortal === 'admin' && currentUser?.role === 'admin' && (
          <AdminDashboard
            orders={orders}
            users={usersList}
            services={services}
            vehicles={vehicles}
          />
        )}

        {/* Guard message if attempting to open provider/admin portal while logged out */}
        {(activePortal === 'provider' && (!currentUser || currentUser.role !== 'provider')) && (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 md:p-12 text-center max-w-xl mx-auto my-12 shadow-sm space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <Truck className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              {isUrdu ? 'ورکر / ڈرائیور پورٹل کے لیے لاگ ان کریں' : 'Service Provider Login Required'}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              {isUrdu 
                ? 'اپنے قریبی آرڈرز، ڈیلیوری درخواستیں اور آمدنی دیکھنے کے لیے اپنے پارٹنر اکاؤنٹ میں لاگ ان کریں یا نیا پرووائیڈر اکاؤنٹ بنائیں۔'
                : 'Sign in to your partner account or register as a technician/driver to manage jobs, view orders, and withdraw earnings.'}
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => handleOpenAuthModal('login')}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                {t.login}
              </button>
              <button
                onClick={() => handleOpenAuthModal('provider_signup')}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                {isUrdu ? 'نیا پارٹنر اکاؤنٹ بنائیں' : 'Join as Partner'}
              </button>
            </div>
          </div>
        )}

        {(activePortal === 'admin' && (!currentUser || currentUser.role !== 'admin')) && (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 md:p-12 text-center max-w-xl mx-auto my-12 shadow-sm space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              {isUrdu ? 'ایڈمنسٹریٹر لاگ ان درکار ہے' : 'Admin Login Required'}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              {isUrdu 
                ? 'ماسٹر کنٹرول پینل، آرڈرز مانیٹرنگ اور کیٹلاگ مینیجر تک رسائی کے لیے اپنے ایڈمن اکاؤنٹ کے ساتھ لاگ ان کریں۔'
                : 'Please log in with your configured ADMIN_USERNAME and ADMIN_PASSWORD secrets to access operations and platform controls.'}
            </p>
            <div className="pt-2">
              <button
                onClick={() => handleOpenAuthModal('login')}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                {isUrdu ? 'ایڈمن لاگ ان کریں' : 'Sign in as Admin'}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Modals & Dialogs */}
      <DeliveryOrderModal
        isOpen={isDeliveryModalOpen}
        onClose={() => setIsDeliveryModalOpen(false)}
        currentUser={currentUser}
        onProceedToCheckout={handleProceedToCheckout}
      />

      <HomeServiceBookingModal
        isOpen={isHomeServiceModalOpen}
        onClose={() => setIsHomeServiceModalOpen(false)}
        currentUser={currentUser}
        services={services}
        preselectedServiceId={preselectedServiceId}
        onProceedToCheckout={handleProceedToCheckout}
      />

      <TransportBookingModal
        isOpen={isTransportModalOpen}
        onClose={() => setIsTransportModalOpen(false)}
        currentUser={currentUser}
        vehicles={vehicles}
        preselectedVehicleId={preselectedVehicleId}
        onProceedToCheckout={handleProceedToCheckout}
      />

      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        currentUser={currentUser}
        pendingOrder={pendingCheckoutOrder}
        onOrderPlaced={handleOrderPlaced}
      />

      <LiveOrderTracker
        isOpen={isLiveTrackerOpen}
        onClose={() => setIsLiveTrackerOpen(false)}
        orders={orders}
        selectedOrderId={selectedOrderId}
        onSelectOrder={(id) => setSelectedOrderId(id)}
        onOpenReviewModal={(order) => {
          setIsLiveTrackerOpen(false);
          setIsHistoryModalOpen(true);
        }}
        onSwitchToProviderView={() => {
          setIsLiveTrackerOpen(false);
          setActivePortal('provider');
        }}
      />

      <OrderHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        orders={orders}
        onOpenLiveTracker={handleOpenLiveTracker}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setAuthNoticeReason(undefined);
        }}
        onSuccess={handleAuthSuccess}
        noticeReason={authNoticeReason}
        lang={lang}
      />

      {/* Pakistani Production Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-500 text-white font-black text-sm flex items-center justify-center shadow-md">
                  KC
                </div>
                <span className="font-extrabold text-white text-base tracking-tight">
                  {t.appName}
                </span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                {isUrdu 
                  ? 'خانیوال سٹی اور آس پاس کے علاقوں کے لیے نمبر 1 آن ڈیمانڈ سپر ایپ: کسی بھی لوکل دکان سے خریداری، مصدقہ گھریلو مرمت و صفائی، اور کارگو ٹرانسپورٹ گاڑی کی فوری آن ڈیمانڈ بکنگ۔'
                  : 'Khanewal City and surrounding tehsils unified on-demand super app for store deliveries, certified home repairs, and cargo transport.'}
              </p>
              <div className="text-[11px] text-slate-300 font-medium space-y-1">
                <div>📞 {isUrdu ? 'خانیوال ہیلپ لائن: 6664-0800' : 'Khanewal Helpline: 0800-6664'}</div>
                <div>✉️ support@khanewalconnect.pk</div>
              </div>
            </div>

            <div>
              <h5 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">
                {isUrdu ? 'بنیادی سروسز' : 'Core Services'}
              </h5>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => handleOpenOrderModal('custom_delivery')} className="hover:text-white transition-colors cursor-pointer">
                    {t.catDeliveryTitle}
                  </button>
                </li>
                <li>
                  <button onClick={() => handleOpenOrderModal('home_services')} className="hover:text-white transition-colors cursor-pointer">
                    {isUrdu ? 'اے سی ماسٹر واش و گیس چارجنگ' : 'AC Chemical Wash & Repair'}
                  </button>
                </li>
                <li>
                  <button onClick={() => handleOpenOrderModal('home_services')} className="hover:text-white transition-colors cursor-pointer">
                    {isUrdu ? 'مستند الیکٹریشن و پلمبنگ' : 'Certified Electrician & Plumbing'}
                  </button>
                </li>
                <li>
                  <button onClick={() => handleOpenOrderModal('transport_cargo')} className="hover:text-white transition-colors cursor-pointer">
                    {isUrdu ? 'لوڈر رکشہ و سوزوکی پک اپ بکنگ' : 'Loader Rickshaw & Suzuki Pickup'}
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">
                {isUrdu ? 'پورٹلز و روابط' : 'Portals & Access'}
              </h5>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => setActivePortal('customer')} className="hover:text-white transition-colors cursor-pointer">
                    {t.customerPortal}
                  </button>
                </li>
                <li>
                  <button onClick={() => setActivePortal('provider')} className="hover:text-white transition-colors cursor-pointer">
                    {t.providerPortal}
                  </button>
                </li>
                <li>
                  <button onClick={() => setActivePortal('admin')} className="hover:text-white transition-colors cursor-pointer">
                    {t.adminPortal}
                  </button>
                </li>
                <li>
                  <button onClick={() => handleOpenAuthModal('provider_signup')} className="hover:text-emerald-400 transition-colors cursor-pointer font-semibold text-emerald-300">
                    {isUrdu ? 'ورکر / ڈرائیور رجسٹریشن' : 'Register as Service Partner'}
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">
                {isUrdu ? 'ادائیگی کے محفوظ طریقے' : 'Secure Payments & Trust'}
              </h5>
              <div className="space-y-2.5 text-slate-400 leading-relaxed">
                <p>
                  {isUrdu 
                    ? 'سیف پے اسکرو پروٹیکشن — ادائیگی صرف کام کی تسلی بخش تکمیل پر منتقل ہوتی ہے۔'
                    : 'Khanewal SafePay Escrow protection for complete customer & worker security.'}
                </p>
                <div className="flex flex-wrap gap-2 pt-1 text-[11px] font-semibold text-slate-300">
                  <span className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded">Cash on Delivery</span>
                  <span className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded">JazzCash</span>
                  <span className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded">EasyPaisa</span>
                  <span className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded">Raast Bank</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <span>© 2026 Khanewal Connect. All rights reserved.</span>
            <span>خانیوال سٹی · کینٹ · پیپلز کالونی · سول لائنز · طارق آباد · کبیروالہ · میاں چنوں · جہانیاں</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
