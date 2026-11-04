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
import { EventPlannerModal } from './components/CustomerPortal/EventPlannerModal';
import { ProviderDashboard } from './components/ProviderPortal/ProviderDashboard';
import { AdminDashboard } from './components/AdminPortal/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { ResetPasswordModal } from './components/ResetPasswordModal';
import { NotificationsModal } from './components/NotificationsModal';
import { NotificationService, AppNotification } from './services/notifications';
import { FloatingWhatsAppButton } from './components/FloatingWhatsAppButton';
import { BottomNavigation } from './components/BottomNavigation';
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
  const [isEventPlannerModalOpen, setIsEventPlannerModalOpen] = useState(false);
  
  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authNoticeReason, setAuthNoticeReason] = useState<string | undefined>();

  // 5-Minute Password Reset Modal State (Auto-opened on ?resetToken=...)
  const [resetToken, setResetToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('resetToken');
    }
    return null;
  });
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return Boolean(params.get('resetToken'));
    }
    return false;
  });

  const [pendingOrderAction, setPendingOrderAction] = useState<{
    category: 'custom_delivery' | 'home_services' | 'transport_cargo';
    preselectedId?: string;
  } | null>(null);

  // Real-time Firebase Notifications State
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);

  // Subscribe to real-time Firebase Notifications with Push click handler
  useEffect(() => {
    const unsubscribe = NotificationService.subscribe(
      currentUser?.id || null,
      currentUser?.role,
      (items) => setNotifications(items)
    );

    const handlePushOrderOpen = (e: Event) => {
      const customEvent = e as CustomEvent<{ orderId?: string }>;
      if (customEvent.detail?.orderId) {
        setSelectedOrderId(customEvent.detail.orderId);
        setIsLiveTrackerOpen(true);
      }
    };
    window.addEventListener('open-order-tracker', handlePushOrderOpen);

    return () => {
      unsubscribe();
      window.removeEventListener('open-order-tracker', handlePushOrderOpen);
    };
  }, [currentUser]);

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

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

  // Subscribe to central store updates and initialize Cloud Firestore Zero-Loss Sync
  useEffect(() => {
    // Zero-Loss Cloud Firestore Hydration & Real-time Sync
    Store.initCloudSync();

    const unsubscribe = subscribeToStore(() => {
      setOrders(Store.getOrders());
      setUsersList(Store.getUsers());
      setServices(Store.getServicesCatalog());
      setVehicles(Store.getVehiclesCatalog());
      setCurrentUser(Store.getCurrentUser());
    });

    const handleFlushBackup = () => {
      Store.backupDatabaseToCloud();
    };

    window.addEventListener('beforeunload', handleFlushBackup);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        Store.backupDatabaseToCloud();
      }
    });

    return () => {
      unsubscribe();
      window.removeEventListener('beforeunload', handleFlushBackup);
    };
  }, []);

  // Handlers for opening booking modals (Gated by Auth)
  const handleOpenOrderModal = (category: 'custom_delivery' | 'home_services' | 'transport_cargo', preselectedId?: string) => {
    // If visitor is not logged in, enforce registration/login
    if (!currentUser) {
      setAuthNoticeReason(
        lang === 'ur'
          ? 'Service book karne ke liye baraye meherbani pehle login karein ya naya account banayein.'
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

  const handleOpenEventPlanner = () => {
    if (!currentUser) {
      setAuthNoticeReason(
        lang === 'ur'
          ? 'Event planning ki darkhwast jama karwane ke liye pehle login karein ya naya account banayein.'
          : 'Please sign in or create an account to plan an event.'
      );
      setPendingOrderAction({ category: 'home_services' });
      setIsAuthModalOpen(true);
      return;
    }
    setIsEventPlannerModalOpen(true);
  };

  const handleEventOrderSuccess = (newOrder: Order) => {
    setSelectedOrderId(newOrder.id);
    setIsLiveTrackerOpen(true);
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

  // Only services and vehicles with active available providers are published to store & customers
  const publishedServices = services.filter(s => Store.isServiceAvailable(s));
  const publishedVehicles = vehicles.filter(v => Store.isVehicleAvailable(v));

  // Customer order tracking visibility: strictly only orders placed by the logged-in customer are visible
  const customerOrders = currentUser
    ? orders.filter(o => o.customerId === currentUser.id)
    : [];

  const navbarActiveOrders = currentUser?.role === 'admin'
    ? orders
    : currentUser?.role === 'provider'
    ? orders.filter(o => o.assignedProviderId === currentUser.id)
    : customerOrders;

  const whatsappAdminNumber = (Store.getSettings().whatsappSupportPhone || '+923000009988').replace(/[^0-9]/g, '');
  const partnerOnboardUrl = `https://wa.me/${whatsappAdminNumber}?text=${encodeURIComponent(
    isUrdu 
      ? 'Assalam-o-Alaikum! Main Khanewal Connect par bataur service partner / karigar / driver onboard hona chahta hoon. Baraye meherbani mujhe register karein.'
      : 'Hello Admin, I want to onboard as a verified service partner on Khanewal Connect. Please register me.'
  )}`;

  const handleLogout = () => {
    Store.logout();
    setCurrentUser(null);
    setActivePortal('customer');
  };

  return (
    <div className="h-screen max-h-screen h-[100dvh] max-h-[100dvh] w-full flex flex-col overflow-hidden bg-[#07080c] text-slate-100 font-sans selection:bg-amber-400 selection:text-slate-950 ltr" dir="ltr">
      {/* 1. 100% Static Top Bar Navigation */}
      <div className="shrink-0 z-30 w-full sticky top-0 bg-[#090a0f] border-b border-amber-500/20">
        <Navbar
          currentUser={currentUser}
          activePortal={activePortal}
          setActivePortal={setActivePortal}
          onOpenOrderModal={handleOpenOrderModal}
          onOpenHistory={() => setIsHistoryModalOpen(true)}
          onOpenLiveTracker={handleOpenLiveTracker}
          onOpenAuth={handleOpenAuthModal}
          activeOrders={navbarActiveOrders}
          lang={lang}
          onToggleLang={handleToggleLang}
          unreadNotificationsCount={unreadNotificationsCount}
          onOpenNotifications={() => setIsNotificationsModalOpen(true)}
        />
      </div>

      {/* 2. Contained Safe Scroll Area (Trapped exclusively between static Header & Bottom Navigation) */}
      <div 
        id="main-scroll-viewport" 
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden w-full relative overscroll-contain flex flex-col"
      >
        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 md:px-8 pt-4 sm:pt-6 pb-12">
          {activePortal === 'customer' && (
            <CustomerHome
              currentUser={currentUser}
              onOpenOrderModal={handleOpenOrderModal}
              onOpenEventPlanner={handleOpenEventPlanner}
              onOpenLiveTracker={handleOpenLiveTracker}
              onOpenAuth={handleOpenAuthModal}
              activeOrders={customerOrders}
              services={publishedServices}
              vehicles={publishedVehicles}
              lang={lang}
              unreadNotificationsCount={unreadNotificationsCount}
              onOpenNotifications={() => setIsNotificationsModalOpen(true)}
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
            <div className="bg-[#0e111a] rounded-3xl border border-amber-500/30 p-6 md:p-10 text-center max-w-xl mx-auto my-12 shadow-sm space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <Truck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">
                {isUrdu ? 'Worker / Driver Portal ke liye Login Zaroori Hai' : 'Service Provider Login Required'}
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                {isUrdu 
                  ? 'Apne qareebi orders, delivery requests aur aamdani dekhne ke liye apne partner account mein login karein ya naya provider account banayein.'
                  : 'Sign in to your partner account or register as a technician/driver to manage jobs, view orders, and withdraw earnings.'}
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => handleOpenAuthModal('login')}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  {t.login}
                </button>
                <a
                  href={partnerOnboardUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1.5"
                >
                  <span>{isUrdu ? 'Onboarding Baraye Workers (WhatsApp)' : 'Onboard as Worker (WhatsApp)'}</span>
                </a>
              </div>
            </div>
          )}

          {(activePortal === 'admin' && (!currentUser || currentUser.role !== 'admin')) && (
            <div className="bg-[#0e111a] rounded-3xl border border-amber-500/30 p-6 md:p-10 text-center max-w-xl mx-auto my-12 shadow-sm space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">
                {isUrdu ? 'Administrator Login Darkar Hai' : 'Admin Login Required'}
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                {isUrdu 
                  ? 'Master control panel, orders monitoring aur catalog manager tak rasaai ke liye apne admin account ke sath login karein.'
                  : 'Please log in with your configured ADMIN_USERNAME and ADMIN_PASSWORD secrets to access operations and platform controls.'}
              </p>
              <div className="pt-2">
                <button
                  onClick={() => handleOpenAuthModal('login')}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  {isUrdu ? 'Admin Login Karein' : 'Sign in as Admin'}
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Pakistani Production Footer */}
        <footer className="shrink-0 bg-[#090a0f] text-slate-400 text-xs border-t border-slate-800 py-12 mt-auto">
          <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <img
                    src="/assets/aistudio/IMG-20261028-WA0027_c07670f1.jpg"
                    alt="Khanewal Connect Official Logo"
                    className="w-9 h-9 rounded-full object-cover border-2 border-amber-400 shadow-md shrink-0"
                  />
                  <span className="font-extrabold text-white text-base tracking-tight">
                    {t.appName}
                  </span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  {isUrdu 
                    ? 'Khanewal City aur aas paas ke ilaqon ke liye No. 1 on-demand super app: kisi bhi local dukaan se khareedari, verified gharelu marammat o safai, aur cargo transport gaari ki fori on-demand booking.'
                    : 'Khanewal City and surrounding tehsils unified on-demand super app for store deliveries, certified home repairs, and cargo transport.'}
                </p>
                <div className="text-[11px] text-slate-300 font-medium space-y-1">
                  <div>📞 {isUrdu ? 'Khanewal Helpline: 0800-6664' : 'Khanewal Helpline: 0800-6664'}</div>
                  <div>✉️ support@khanewalconnect.pk</div>
                </div>
              </div>

              <div>
                <h5 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">
                  {isUrdu ? 'Bunyadi Services' : 'Core Services'}
                </h5>
                <ul className="space-y-2">
                  <li>
                    <button onClick={() => handleOpenOrderModal('custom_delivery')} className="hover:text-white transition-colors cursor-pointer">
                      {t.catDeliveryTitle}
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleOpenOrderModal('home_services')} className="hover:text-white transition-colors cursor-pointer">
                      {isUrdu ? 'AC Master Wash o Gas Charging' : 'AC Chemical Wash & Repair'}
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleOpenOrderModal('home_services')} className="hover:text-white transition-colors cursor-pointer">
                      {isUrdu ? 'Certified Electrician o Plumbing' : 'Certified Electrician & Plumbing'}
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleOpenOrderModal('transport_cargo')} className="hover:text-white transition-colors cursor-pointer">
                      {isUrdu ? 'Loader Riksha o Suzuki Pickup Booking' : 'Loader Rickshaw & Suzuki Pickup'}
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <h5 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">
                  {isUrdu ? 'Portals o Rabitay' : 'Portals & Access'}
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
                    <a
                      href={partnerOnboardUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-emerald-400 transition-colors cursor-pointer text-slate-400"
                    >
                      {isUrdu ? 'Worker Onboarding (Admin WhatsApp)' : 'Partner Onboarding (Admin WhatsApp)'}
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h5 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">
                  {isUrdu ? 'Adaigi ke Mehfooz Tareeqay' : 'Secure Payments & Trust'}
                </h5>
                <div className="space-y-2.5 text-slate-400 leading-relaxed">
                  <p>
                    {isUrdu 
                      ? 'SafePay escrow protection — adaigi sirf kaam ki tasallibaksh takmeel par muntaqil hoti hai.'
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
              <span>Khanewal City · Cantt · Peoples Colony · Civil Lines · Tariq Abad · Kabirwala · Mian Channu · Jahanian</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Floating WhatsApp Support Button */}
      <FloatingWhatsAppButton isUrdu={isUrdu} />

      {/* 3. 100% Static Bottom Navigation (sticky/pinned) */}
      <div className="shrink-0 z-30 w-full sticky bottom-0">
        <BottomNavigation
          currentUser={currentUser}
          activeOrders={navbarActiveOrders}
          onNavigateHome={() => {
            setActivePortal('customer');
            document.getElementById('main-scroll-viewport')?.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenOrders={() => setIsHistoryModalOpen(true)}
          onOpenBookNow={() => {
            setActivePortal('customer');
            setTimeout(() => {
              document.getElementById('services-grid-section')?.scrollIntoView({ behavior: 'smooth' });
            }, 60);
          }}
          onOpenAuth={handleOpenAuthModal}
          onLogout={handleLogout}
          isUrdu={isUrdu}
        />
      </div>

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
        services={publishedServices}
        preselectedServiceId={preselectedServiceId}
        onProceedToCheckout={handleProceedToCheckout}
      />

      <TransportBookingModal
        isOpen={isTransportModalOpen}
        onClose={() => setIsTransportModalOpen(false)}
        currentUser={currentUser}
        vehicles={publishedVehicles}
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
        orders={currentUser?.role === 'admin' ? orders : customerOrders}
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
        orders={currentUser?.role === 'admin' ? orders : customerOrders}
        onOpenLiveTracker={handleOpenLiveTracker}
      />

      <EventPlannerModal
        isOpen={isEventPlannerModalOpen}
        onClose={() => setIsEventPlannerModalOpen(false)}
        currentUser={currentUser}
        onOrderSuccess={handleEventOrderSuccess}
        isUrdu={isUrdu}
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

      {/* 5-Minute Expiring Brevo Password Reset Modal */}
      <ResetPasswordModal
        isOpen={isResetPasswordModalOpen}
        token={resetToken}
        onClose={() => {
          setIsResetPasswordModalOpen(false);
          setResetToken(null);
          if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.delete('resetToken');
            window.history.replaceState({}, '', url.pathname + url.search);
          }
        }}
        onPasswordResetSuccess={(email) => {
          setIsResetPasswordModalOpen(false);
          setResetToken(null);
          setAuthNoticeReason(
            isUrdu 
              ? 'Password kamyabi se tabdeel ho chuka hai! Ab naye password se login karein.' 
              : 'Password reset successfully! Please sign in with your new password.'
          );
          setIsAuthModalOpen(true);
        }}
        lang={lang}
      />

      {/* Real-time Firebase Alerts Modal */}
      <NotificationsModal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
        notifications={notifications}
        onMarkAsRead={(id) => NotificationService.markAsRead(id)}
        onMarkAllAsRead={() => currentUser && NotificationService.markAllAsRead(currentUser.id, currentUser.role)}
        onSelectOrder={(orderId) => {
          setSelectedOrderId(orderId);
          setIsLiveTrackerOpen(true);
        }}
        isUrdu={isUrdu}
      />
    </div>
  );
}
