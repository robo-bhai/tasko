import React, { useState, useEffect } from 'react';
import { 
  User, 
  Order, 
  HomeServiceItem, 
  TransportVehicleItem, 
  CustomDeliveryDetails, 
  HomeServiceDetails, 
  TransportDetails, 
  OrderPricing 
} from './types';
import { Store, subscribeToStore } from './services/store';
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
  Headphones, 
  CheckCircle2, 
  CreditCard,
  Heart
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(() => Store.getCurrentUser());
  const [activePortal, setActivePortal] = useState<'customer' | 'provider' | 'admin'>(() => {
    const user = Store.getCurrentUser();
    return user.role === 'admin' ? 'admin' : user.role === 'provider' ? 'provider' : 'customer';
  });

  const [orders, setOrders] = useState<Order[]>(() => Store.getOrders());
  const [services, setServices] = useState<HomeServiceItem[]>(() => Store.getServicesCatalog());
  const [vehicles, setVehicles] = useState<TransportVehicleItem[]>(() => Store.getVehiclesCatalog());

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
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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

  const [usersList, setUsersList] = useState<User[]>(() => Store.getUsers());

  // Handlers for opening booking modals
  const handleOpenOrderModal = (category: 'custom_delivery' | 'home_services' | 'transport_cargo', preselectedId?: string) => {
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

  const handleProceedToCheckout = (payload: PendingCheckoutOrder) => {
    // Close initial modal
    setIsDeliveryModalOpen(false);
    setIsHomeServiceModalOpen(false);
    setIsTransportModalOpen(false);

    // Open checkout
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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Top Bar Navigation */}
      <Navbar
        currentUser={currentUser}
        activePortal={activePortal}
        setActivePortal={setActivePortal}
        onOpenOrderModal={handleOpenOrderModal}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        onOpenLiveTracker={handleOpenLiveTracker}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        activeOrders={orders}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 pt-6">
        {activePortal === 'customer' && (
          <CustomerHome
            onOpenOrderModal={handleOpenOrderModal}
            onOpenLiveTracker={handleOpenLiveTracker}
            activeOrders={orders}
            services={services}
            vehicles={vehicles}
          />
        )}

        {activePortal === 'provider' && (
          <ProviderDashboard
            currentUser={currentUser}
            orders={orders}
            onOpenCustomerView={() => setActivePortal('customer')}
          />
        )}

        {activePortal === 'admin' && (
          <AdminDashboard
            orders={orders}
            users={usersList}
            services={services}
            vehicles={vehicles}
          />
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
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          setActivePortal(user.role === 'admin' ? 'admin' : user.role === 'provider' ? 'provider' : 'customer');
        }}
      />

      {/* Clean Domain Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                  OS
                </div>
                <span className="font-bold text-white text-base">OmniServe</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                The unified on-demand platform for custom store deliveries, certified home services, and cargo transport booking.
              </p>
              <div className="text-[11px] text-slate-500 font-mono">
                Support: 0800-OMNI (6664) · support@omniserve.pk
              </div>
            </div>

            <div>
              <h5 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">Core Services</h5>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => handleOpenOrderModal('custom_delivery')} className="hover:text-white transition-colors">
                    Order Anything / Buy & Deliver
                  </button>
                </li>
                <li>
                  <button onClick={() => handleOpenOrderModal('home_services')} className="hover:text-white transition-colors">
                    AC Repair & Master Chemical Wash
                  </button>
                </li>
                <li>
                  <button onClick={() => handleOpenOrderModal('home_services')} className="hover:text-white transition-colors">
                    Certified Electricians & Plumbers
                  </button>
                </li>
                <li>
                  <button onClick={() => handleOpenOrderModal('transport_cargo')} className="hover:text-white transition-colors">
                    Cargo Rickshaw & Suzuki Pickup Rental
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">Platform Portals</h5>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => setActivePortal('customer')} className="hover:text-white transition-colors">
                    Customer Experience Portal
                  </button>
                </li>
                <li>
                  <button onClick={() => setActivePortal('provider')} className="hover:text-white transition-colors">
                    Service Provider & Driver Portal
                  </button>
                </li>
                <li>
                  <button onClick={() => setActivePortal('admin')} className="hover:text-white transition-colors">
                    Operations & Admin Control Panel
                  </button>
                </li>
                <li>
                  <button onClick={() => setIsAuthModalOpen(true)} className="hover:text-white transition-colors">
                    Switch Test Persona
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">Trust & Payments</h5>
              <div className="space-y-2 text-slate-400 leading-relaxed">
                <p>Protected by OmniServe SafePay Escrow.</p>
                <div className="flex flex-wrap gap-2 pt-1 text-[11px] font-semibold text-slate-300">
                  <span className="bg-slate-800 px-2 py-0.5 rounded">Cash on Delivery</span>
                  <span className="bg-slate-800 px-2 py-0.5 rounded">JazzCash</span>
                  <span className="bg-slate-800 px-2 py-0.5 rounded">EasyPaisa</span>
                  <span className="bg-slate-800 px-2 py-0.5 rounded">Raast Bank</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <span>© 2026 OmniServe Super App. All rights reserved.</span>
            <span>Zero-dependency LocalStorage simulation for instant interactive demo testing.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
