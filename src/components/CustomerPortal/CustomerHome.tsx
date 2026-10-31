import React, { useState } from 'react';
import { 
  Order, 
  HomeServiceItem, 
  TransportVehicleItem,
  User 
} from '../../types';
import { Store, KHANEWAL_LOCAL_AREAS } from '../../services/store';
import { Language, translations } from '../../i18n/translations';
import { 
  ShoppingBag, 
  Wrench, 
  Truck, 
  ArrowRight, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  MapPin, 
  ChevronRight,
  Fan,
  Zap,
  Hammer,
  Cpu,
  BadgePercent,
  CheckCircle2,
  Headphones,
  PhoneCall,
  Search,
  Star,
  Radio,
  Coins,
  MessageCircle,
  HelpCircle,
  Award,
  Navigation,
  Bell,
  Menu,
  ShoppingCart,
  Lock,
  Wind,
  Car,
  Paintbrush,
  Boxes,
  HardHat
} from 'lucide-react';
import { PWAInstallButton } from '../PWAInstallButton';

interface CustomerHomeProps {
  currentUser?: User | null;
  onOpenOrderModal: (category: 'custom_delivery' | 'home_services' | 'transport_cargo', preselectedId?: string) => void;
  onOpenEventPlanner?: () => void;
  onOpenLiveTracker: (order?: Order) => void;
  onOpenAuth: (tab?: 'login' | 'customer_signup' | 'provider_signup', notice?: string) => void;
  activeOrders: Order[];
  services: HomeServiceItem[];
  vehicles: TransportVehicleItem[];
  lang: Language;
}

export const CustomerHome: React.FC<CustomerHomeProps> = ({
  currentUser,
  onOpenOrderModal,
  onOpenEventPlanner,
  onOpenLiveTracker,
  onOpenAuth,
  activeOrders,
  services,
  vehicles,
  lang
}) => {
  const t = translations[lang];
  const isUrdu = lang === 'ur';

  // Active table view: 'technician' | 'ride' | 'cargo' | 'event_planner'
  const [activeTableTab, setActiveTableTab] = useState<'technician' | 'ride' | 'cargo' | 'event_planner'>('technician');
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');
  const [flyerSearchQuery, setFlyerSearchQuery] = useState('');

  // Real Customer Reviews from Store (visible to all users)
  const publicCustomerReviews = Store.getPublicReviews();

  // Strictly only show tracking for the current logged-in customer
  const customerActiveOrders = currentUser ? activeOrders : [];
  const latestActiveOrder = customerActiveOrders.find(
    o => o.status !== 'completed' && o.status !== 'cancelled'
  );

  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'Fan': return <Fan className="w-5 h-5 text-amber-400" />;
      case 'Zap': return <Zap className="w-5 h-5 text-yellow-400" />;
      case 'Wrench': return <Wrench className="w-5 h-5 text-amber-300" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-amber-400" />;
      case 'Cpu': return <Cpu className="w-5 h-5 text-yellow-300" />;
      default: return <Hammer className="w-5 h-5 text-amber-400" />;
    }
  };

  const getServiceName = (srv: HomeServiceItem) => {
    if (!isUrdu) return srv.name;
    if (srv.id === 'srv-ac-repair') return 'AC Master Chemical Service & Repairing';
    if (srv.id === 'srv-electrician') return 'Certified Electrician & Wiring Fault Repair';
    if (srv.id === 'srv-plumbing') return 'Emergency Plumbing & Sanitary Service';
    if (srv.id === 'srv-cleaning') return 'Sofa, Carpet & Ghar ki Deep Cleaning';
    if (srv.id === 'srv-appliances') return 'Fridge, Washing Machine & Microwave Repair';
    if (srv.id === 'srv-carpentry') return 'Carpenter, Almari & Lock Repair';
    return srv.name;
  };

  const getVehicleName = (veh: TransportVehicleItem) => {
    if (!isUrdu) return veh.name;
    if (veh.id === 'veh-loader-rickshaw') return 'Loader Riksha (Wazan: 350 kg)';
    if (veh.id === 'veh-mini-pickup') return 'Suzuki Ravi Pickup (Wazan: 850 kg)';
    if (veh.id === 'veh-standard-van') return 'Hyundai Shahzore Truck (Wazan: 1800 kg)';
    if (veh.id === 'veh-flatbed-truck') return '14-Foot Heavy Commercial Truck (Wazan: 4500 kg)';
    return veh.name;
  };

  // 13 Circular Services matching flyer
  const flyerServices = [
    {
      id: 'labor',
      nameUr: 'Mazdoor',
      nameEn: 'Laborer',
      bgColor: 'bg-purple-600 shadow-purple-600/30',
      icon: <HardHat className="w-6 h-6 text-white" />,
      action: () => onOpenOrderModal('home_services', 'srv-cleaning')
    },
    {
      id: 'house_shifting',
      nameUr: 'Ghar Shifting',
      nameEn: 'House Shifting',
      bgColor: 'bg-blue-600 shadow-blue-600/30',
      icon: <Truck className="w-6 h-6 text-white" />,
      action: () => onOpenOrderModal('transport_cargo', 'veh-standard-van')
    },
    {
      id: 'delivery_cargo',
      nameUr: 'Delivery / Cargo',
      nameEn: 'Delivery / Cargo',
      bgColor: 'bg-amber-600 shadow-amber-600/30',
      icon: <ShoppingBag className="w-6 h-6 text-white" />,
      action: () => onOpenOrderModal('transport_cargo', 'veh-loader-rickshaw')
    },
    {
      id: 'market_shopping',
      nameUr: 'Market se Kharidari',
      nameEn: 'Market Shopping',
      bgColor: 'bg-emerald-600 shadow-emerald-600/30',
      icon: <ShoppingCart className="w-6 h-6 text-white" />,
      action: () => onOpenOrderModal('custom_delivery')
    },
    {
      id: 'locks_keys',
      nameUr: 'Talay aur Chabi',
      nameEn: 'Locks & Keys',
      bgColor: 'bg-pink-600 shadow-pink-600/30',
      icon: <Lock className="w-6 h-6 text-white" />,
      action: () => onOpenOrderModal('home_services', 'srv-carpentry')
    },
    {
      id: 'ac_repair',
      nameUr: 'AC Repairing',
      nameEn: 'AC Repair',
      bgColor: 'bg-cyan-600 shadow-cyan-600/30',
      icon: <Wind className="w-6 h-6 text-white" />,
      action: () => onOpenOrderModal('home_services', 'srv-ac-repair')
    },
    {
      id: 'carpenter',
      nameUr: 'Carpenter',
      nameEn: 'Carpenter',
      bgColor: 'bg-teal-600 shadow-teal-600/30',
      icon: <Hammer className="w-6 h-6 text-white" />,
      action: () => onOpenOrderModal('home_services', 'srv-carpentry')
    },
    {
      id: 'plumber_electrician',
      nameUr: 'Plumber / Electrician',
      nameEn: 'Plumber & Electrician',
      bgColor: 'bg-red-600 shadow-red-600/30',
      icon: <Wrench className="w-6 h-6 text-white" />,
      action: () => onOpenOrderModal('home_services', 'srv-electrician')
    },
    {
      id: 'pick_and_drop',
      nameUr: 'Pick and Drop',
      nameEn: 'Pick & Drop',
      bgColor: 'bg-rose-600 shadow-rose-600/30',
      icon: <Car className="w-6 h-6 text-white" />,
      action: () => onOpenOrderModal('custom_delivery')
    },
    {
      id: 'wood_work',
      nameUr: 'Wood Work',
      nameEn: 'Wood Work',
      bgColor: 'bg-cyan-900 shadow-cyan-900/30',
      icon: <Boxes className="w-6 h-6 text-white" />,
      action: () => onOpenOrderModal('home_services', 'srv-carpentry')
    },
    {
      id: 'masonry',
      nameUr: 'Sang Kaari',
      nameEn: 'Masonry',
      bgColor: 'bg-amber-900 shadow-amber-900/30',
      icon: <Hammer className="w-6 h-6 text-white" />,
      action: () => onOpenOrderModal('home_services', 'srv-appliances')
    },
    {
      id: 'painting',
      nameUr: 'Painting',
      nameEn: 'Painting',
      bgColor: 'bg-indigo-700 shadow-indigo-700/30',
      icon: <Paintbrush className="w-6 h-6 text-white" />,
      action: () => onOpenOrderModal('home_services', 'srv-cleaning')
    },
    {
      id: 'event_planner',
      nameUr: 'Event & Wedding Planner',
      nameEn: 'Event & Wedding Planner',
      bgColor: 'bg-gradient-to-tr from-amber-500 to-yellow-400 shadow-amber-500/30',
      icon: <Sparkles className="w-6 h-6 text-slate-950" />,
      action: () => {
        if (onOpenEventPlanner) {
          onOpenEventPlanner();
        } else {
          setActiveTableTab('event_planner');
          document.getElementById('booking-tables-section')?.scrollIntoView({ behavior: 'smooth' });
        }
      }
    },
    {
      id: 'more_services',
      nameUr: 'Aur bhi bohat kuch...',
      nameEn: 'More Services',
      bgColor: 'bg-amber-500 shadow-amber-500/30',
      icon: <Sparkles className="w-6 h-6 text-slate-950" />,
      action: () => {
        document.getElementById('booking-tables-section')?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  ];

  // Filter flyer services by search query
  const filteredFlyerServices = flyerServices.filter(s => 
    !flyerSearchQuery.trim() || 
    s.nameUr.includes(flyerSearchQuery.trim()) || 
    s.nameEn.toLowerCase().includes(flyerSearchQuery.toLowerCase().trim())
  );

  // Instant Delivery Ride Catalog Data dynamically populated from Admin Settings
  const settings = Store.getSettings();
  const deliveryRideItems = [
    {
      id: 'ride-instant-bike',
      nameUr: 'Fauri Bike Courier (Docs, Medicine & Parcel)',
      nameEn: 'Instant Bike Courier (Docs, Medicine & Parcels)',
      vehicleUr: '125cc Motorbike',
      vehicleEn: '125cc Motorbike',
      baseFee: settings.deliveryBaseFee,
      perKm: settings.deliveryPerKmFee,
      eta: '15 - 25 mins',
      descUr: 'Shehar ke andar fauri documents, parcel, ghar ka paka khana ya market se choti ashiya mangwayen.',
      descEn: 'Superfast parcel, food, or documents pickup across Khanewal neighborhoods.'
    },
    {
      id: 'ride-grocery-errand',
      nameUr: 'Bazaar Sauda Salaf & Sabzi/Gosht Kharidari',
      nameEn: 'Market Grocery & Store Errands Run',
      vehicleUr: 'Cargo Bike Box',
      vehicleEn: 'Cargo Bike Box',
      baseFee: settings.deliveryBaseFee + 50,
      perKm: settings.deliveryPerKmFee,
      eta: '25 - 40 mins',
      descUr: 'Khanewal ki kisi bhi dukaan ya ghalla mandi se matlooba sauda salaf khareed kar ghar pohnchayein.',
      descEn: 'Our verified rider visits the local market, buys requested items, and delivers to your doorstep.'
    },
    {
      id: 'ride-urgent-pharmacy',
      nameUr: 'Emergency Medicine & Pharmacy Delivery',
      nameEn: 'Emergency Pharmacy & Medical Delivery',
      vehicleUr: 'Emergency Priority Bike',
      vehicleEn: 'Priority Bike',
      baseFee: settings.deliveryBaseFee + (settings.deliveryUrgentFee || 100),
      perKm: settings.deliveryPerKmFee,
      eta: '10 - 20 mins',
      descUr: 'Doctor ke nuskhe ke mutabiq qareebi medical store se fauri adwiyaat ki farahmi.',
      descEn: 'Priority 24/7 delivery of emergency medicines and healthcare essentials.'
    },
    {
      id: 'ride-bakery-food',
      nameUr: 'Bakery, Mithai aur Restaurant Pickup',
      nameEn: 'Bakery, Sweets & Food Pickup',
      vehicleUr: 'Thermal Bike Bag',
      vehicleEn: 'Thermal Bike Bag',
      baseFee: settings.deliveryBaseFee,
      perKm: settings.deliveryPerKmFee,
      eta: '20 - 30 mins',
      descUr: 'Shehar ki mashhoor mithaiyon aur restaurant se garam khana foran wasool karein.',
      descEn: 'Get fresh, hot food and bakery delicacies collected and safely delivered.'
    }
  ];

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(serviceSearchQuery.toLowerCase()) ||
    s.description.toLowerCase().includes(serviceSearchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(serviceSearchQuery.toLowerCase())
  );

  const whatsappAdminNumber = (Store.getSettings().whatsappSupportPhone || '+923040975351').replace(/[^0-9]/g, '');
  const partnerOnboardUrl = `https://wa.me/${whatsappAdminNumber}?text=${encodeURIComponent(
    isUrdu 
      ? 'Assalam-o-Alaikum! Main Khanewal Connect par bataur service partner / worker / driver onboard hona chahta hoon. Baraye meherbani mujhe register karein.'
      : 'Hello Admin, I want to onboard as a verified service partner on Khanewal Connect. Please register me.'
  )}`;

  return (
    <div className="space-y-8 sm:space-y-12 pb-24 ltr">
      
      {/* =========================================================================
          FLYER UI SECTION: TOP HEADER, SEARCH BAR, BANNER CARD & HAMARI KHIDMAT
          ========================================================================= */}
      <section className="bg-gradient-to-b from-[#0a0b12] to-[#07080d] rounded-3xl border border-amber-500/40 p-4 sm:p-6 shadow-2xl space-y-5">
        
        {/* 1. Header with branding and notification bell */}
        <div className="flex items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center font-black text-lg shadow-lg shadow-amber-500/30 shrink-0">
              KC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-white">
                  KHANEWAL CONNECT
                </h1>
                <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full">
                  KHANEWAL
                </span>
              </div>
              <p className="text-[11px] text-amber-400/90 font-bold">
                {isUrdu ? 'Har masle ka fauri hal — ab sab kuch aap ke mobile par!' : 'Instant Solutions — Everything on Your Mobile!'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (currentUser) {
                  onOpenLiveTracker();
                } else {
                  onOpenAuth('login', isUrdu ? 'Notifications dekhnay ke liye login karein' : 'Please sign in to view notifications');
                }
              }}
              className="relative p-2.5 rounded-xl bg-[#141624] border border-amber-500/30 text-amber-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title={isUrdu ? 'Notifications' : 'Notifications'}
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-[#0a0b12]" />
            </button>
          </div>
        </div>

        {/* 2. Search View / EditText: "Kaun si service chahiye?" */}
        <div className="relative">
          <Search className="w-4 h-4 text-amber-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={flyerSearchQuery}
            onChange={(e) => setFlyerSearchQuery(e.target.value)}
            placeholder={isUrdu ? 'Kaun si service chahiye? (Maslan: Electrician, Plumber, Cargo, AC)' : 'Which service do you need? (e.g. Electrician, Plumber, Cargo)'}
            className="w-full py-3 text-xs sm:text-sm rounded-2xl bg-[#11131e] border-2 border-amber-500/40 text-white placeholder-slate-400 focus:outline-hidden focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 shadow-inner transition-all pl-11 pr-10"
          />
          {flyerSearchQuery && (
            <button
              onClick={() => setFlyerSearchQuery('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-white text-xs font-bold px-1.5 py-0.5 rounded-md bg-slate-800 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* 3. Banner/Card Section: "Khanewal ki har zarorat ab aik app par!" */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#1c180e] via-[#241f12] to-[#10121b] border-2 border-amber-500/40 p-5 sm:p-7 shadow-xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2 text-center md:text-start">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/50 text-[11px] font-black text-amber-400">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{isUrdu ? 'Khanewal ab mazeed qareeb' : 'Khanewal Now Closer Than Ever'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight">
                {isUrdu ? 'Khanewal ki har zarorat ab aik app par!' : 'Every Khanewal Need Now on One App!'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                {isUrdu 
                  ? 'Mazdoor, Plumber, Electrician, Carpenter, AC Repairing, Cargo aur Market sauda salaf — verified karigar aur fauri delivery.' 
                  : 'Certified plumbers, electricians, AC repairs, loader trucks, and rapid doorstep errands across Khanewal.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5 shrink-0">
              <button
                onClick={() => {
                  document.getElementById('services-grid-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-5 py-3 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs sm:text-sm font-black rounded-xl transition-all shadow-lg hover:shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
              >
                <span>{isUrdu ? 'Hamari tamam services dekhein' : 'View All Services'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 4. Services Grid / List Layout: "Hamari Khidmat" */}
        <div id="services-grid-section" className="space-y-4 pt-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  {isUrdu ? 'Hamari Khidmat (Our Services)' : 'Our Services'}
                </h3>
                <p className="text-[11px] text-amber-400/80">
                  {isUrdu ? 'Direct service par click karein aur fauri order book karein' : 'Tap any service below to book directly'}
                </p>
              </div>
            </div>

            <span className="text-[11px] font-bold text-amber-300 bg-amber-950/80 border border-amber-500/40 px-3 py-1 rounded-full">
              {filteredFlyerServices.length} {isUrdu ? 'Dastyab' : 'Available'}
            </span>
          </div>

          {/* Circular Icon Grid: 3 cols mobile, 4 on sm, 6-7 on lg */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2.5 sm:gap-4">
            {filteredFlyerServices.map((srv) => (
              <button
                key={srv.id}
                onClick={srv.action}
                className="group flex flex-col items-center justify-center p-2.5 sm:p-3.5 rounded-2xl bg-[#0e1019] hover:bg-[#161826] border border-amber-500/20 hover:border-amber-400/60 transition-all shadow-md hover:shadow-amber-500/10 transform hover:-translate-y-1 cursor-pointer text-center"
              >
                <div className={`w-13 h-13 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${srv.bgColor}`}>
                  {srv.icon}
                </div>
                <span className="mt-2 text-xs sm:text-sm font-black text-white group-hover:text-amber-300 transition-colors leading-tight">
                  {isUrdu ? srv.nameUr : srv.nameEn}
                </span>
                <span className="text-[9px] text-amber-400/70 mt-0.5 group-hover:text-amber-300">
                  {isUrdu ? 'Book Karein' : 'Book'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* VIP Event Planner Showcase Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-amber-600/20 via-[#0e111a] to-amber-950/40 border-2 border-amber-500/50 p-4 sm:p-6 shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-2 text-center md:text-start">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/50 text-amber-300 text-xs font-black">
                <span>🎪</span>
                <span>{isUrdu ? 'VIP Khasoosi Service: Shadi & Event Planner' : 'New VIP Service: Event & Wedding Planner'}</span>
              </div>
              <h3 className="text-base sm:text-2xl font-black text-white">
                {isUrdu ? 'Khanewal mein Shadi, Baarat, Walima aur Parties mukammal intezam ke sath!' : 'Complete Wedding, Walima & Event Planning across Khanewal'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                {isUrdu 
                  ? 'Riwayati Daigein, Per-Head Buffet, VIP Shamiyana, Bridal Stage decor, DJ Sound system, Drone shoot aur waiters — sab aik click par.'
                  : 'Catering, traditional degain, VIP tentage, bridal stage decor, DJ sound system, drone shoot, and hospitality staff.'}
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 sm:gap-2 pt-1 text-[11px] font-bold text-amber-200">
                <span className="bg-slate-950/80 px-2.5 py-1 rounded-lg border border-amber-500/30">🍲 Daigein & Catering</span>
                <span className="bg-slate-950/80 px-2.5 py-1 rounded-lg border border-amber-500/30">🎪 VIP Shamiyana</span>
                <span className="bg-slate-950/80 px-2.5 py-1 rounded-lg border border-amber-500/30">💐 Stage & Decoration</span>
                <span className="bg-slate-950/80 px-2.5 py-1 rounded-lg border border-amber-500/30">📸 Photo & Video</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onOpenEventPlanner ? onOpenEventPlanner() : onOpenOrderModal('home_services')}
              className="px-6 py-3.5 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-amber-500/25 transition-all transform hover:scale-105 shrink-0 flex items-center gap-2 cursor-pointer"
            >
              <span>{isUrdu ? '🎪 Event Abhi Plan / Book Karein' : 'Plan Your Event Now'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 5. Contact & Trust Bar matching flyer */}
        <div className="rounded-2xl bg-gradient-to-r from-[#14120c] via-[#1a160e] to-[#0d0f18] border border-amber-500/30 p-4 sm:p-5 space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-start">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-xs shadow-md">
              <Award className="w-4 h-4" />
              <span>{isUrdu ? 'Aap ka aitmaad hi hamari pehchan' : 'Your Trust is Our Identity'}</span>
            </div>

            <span className="text-xs font-bold text-amber-300 font-mono">
              {isUrdu ? 'Khanewal ki apni app — KHANEWAL CONNECT' : 'Khanewal Own App — KHANEWAL CONNECT'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* M Baqir Bhatti */}
            <a
              href="tel:03040975351"
              className="flex items-center justify-between p-3 rounded-xl bg-[#090a10] border border-amber-500/30 hover:border-amber-400 text-white transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-medium">M Baqir Bhatti</span>
                  <span className="font-mono font-black text-sm text-amber-400">0304-0975351</span>
                </div>
              </div>
              <span className="text-[10px] bg-amber-950/80 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md font-bold">
                {isUrdu ? 'Call Karein' : 'Call'}
              </span>
            </a>

            {/* Mujtaba Faiz */}
            <a
              href="tel:03047705212"
              className="flex items-center justify-between p-3 rounded-xl bg-[#090a10] border border-amber-500/30 hover:border-amber-400 text-white transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Mujtaba Faiz</span>
                  <span className="font-mono font-black text-sm text-amber-400">0304-7705212</span>
                </div>
              </div>
              <span className="text-[10px] bg-amber-950/80 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md font-bold">
                {isUrdu ? 'Call Karein' : 'Call'}
              </span>
            </a>
          </div>

          {/* Verified Badges & PWA */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 border-t border-slate-800/80">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{isUrdu ? 'Play Store & Web PWA se verified tasdeeq shuda' : 'Verified by Play Store & Web PWA'}</span>
            </div>
            <PWAInstallButton isUrdu={isUrdu} variant="banner" />
          </div>
        </div>

      </section>
      
      {/* 1. LOGGED-IN CUSTOMER ACTIVE ORDER TRACKING (Strictly visible only to logged-in customer) */}
      {currentUser && latestActiveOrder && (
        <section className="bg-gradient-to-r from-[#14151f] via-[#1c1b14] to-[#0e0f14] text-white rounded-3xl p-4 sm:p-6 shadow-2xl border-2 border-amber-500/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
                </span>
                <span className="text-xs uppercase tracking-wider font-extrabold text-amber-400">
                  {isUrdu ? 'Aap ka active order jari hai (Live Tracking)' : 'Your Live Active Booking'}
                </span>
                <span className="text-slate-500">·</span>
                <span className="font-mono text-xs text-amber-300 font-bold bg-amber-950/80 border border-amber-600/50 px-2 py-0.5 rounded-lg">
                  {latestActiveOrder.id}
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                  latestActiveOrder.status === 'on_the_way'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}>
                  {latestActiveOrder.status === 'assigned' && (isUrdu ? 'Worker Assign ho gaya hai' : 'Assigned')}
                  {latestActiveOrder.status === 'on_the_way' && (isUrdu ? 'Worker raastay mein hai (On The Way)' : 'On The Way')}
                  {latestActiveOrder.status === 'work_started' && (isUrdu ? 'Kaam jari hai (Work Started)' : 'Work Started')}
                  {latestActiveOrder.status === 'pending' && (isUrdu ? 'Tasdeeq Ka Intezar (Pending)' : 'Pending')}
                </span>
              </div>

              <h3 className="text-base sm:text-xl font-black tracking-tight text-white">
                {latestActiveOrder.category === 'custom_delivery' && (isUrdu ? 'Fauri Doorstep Delivery' : 'Doorstep Store Delivery')}
                {latestActiveOrder.category === 'home_services' && `${latestActiveOrder.serviceDetails?.serviceName || 'Home Service'}`}
                {latestActiveOrder.category === 'transport_cargo' && `${latestActiveOrder.transportDetails?.vehicleName || 'Cargo Transport'}`}
              </h3>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-300">
                {latestActiveOrder.assignedProviderName ? (
                  <span className="text-amber-300 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isUrdu ? 'Muqarrar karda worker:' : 'Assigned Worker:'}</span>
                    <strong className="text-white">{latestActiveOrder.assignedProviderName}</strong>
                    {latestActiveOrder.assignedProviderPhone && (
                      <span className="text-slate-400 font-mono">({latestActiveOrder.assignedProviderPhone})</span>
                    )}
                  </span>
                ) : (
                  <span className="text-amber-400 font-medium">
                    {isUrdu ? 'Qareebi verified worker dhonda ja raha hai...' : 'Finding verified worker nearby...'}
                  </span>
                )}

                {latestActiveOrder.etaMinutes && (
                  <span className="bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>~{latestActiveOrder.etaMinutes} {isUrdu ? 'minute mein pohnchay ga' : 'mins ETA'}</span>
                  </span>
                )}

                <span className="text-slate-400 truncate max-w-xs">
                  {latestActiveOrder.deliveryAddress}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => onOpenLiveTracker(latestActiveOrder)}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-black rounded-xl transition-all shadow-lg hover:shadow-amber-500/20 flex items-center gap-2 cursor-pointer transform hover:scale-[1.02]"
              >
                <Radio className="w-4 h-4 text-slate-950 animate-pulse" />
                <span>{isUrdu ? 'Live Tracking Dekhein' : 'Open Live Tracker'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Quick 3 Category Jump Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#0d0f17] border border-amber-500/20">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={() => {
              setActiveTableTab('technician');
              document.getElementById('booking-tables-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-3.5 sm:px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-black rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Wrench className="w-3.5 h-3.5 text-slate-950" />
            <span>{isUrdu ? '1. Book Technician' : '1. Book a Technician'}</span>
          </button>

          <button
            onClick={() => {
              setActiveTableTab('ride');
              document.getElementById('booking-tables-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-3.5 sm:px-4 py-2.5 bg-[#171923] hover:bg-[#202230] text-amber-400 text-xs font-bold rounded-xl transition-all border border-amber-500/40 flex items-center gap-2 cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
            <span>{isUrdu ? '2. Book a Ride' : '2. Book a Ride'}</span>
          </button>

          <button
            onClick={() => {
              setActiveTableTab('cargo');
              document.getElementById('booking-tables-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-3.5 sm:px-4 py-2.5 bg-[#171923] hover:bg-[#202230] text-amber-400 text-xs font-bold rounded-xl transition-all border border-amber-500/40 flex items-center gap-2 cursor-pointer"
          >
            <Truck className="w-3.5 h-3.5 text-amber-400" />
            <span>{isUrdu ? '3. Book Cargo' : '3. Book a Cargo'}</span>
          </button>

          <button
            onClick={() => {
              if (onOpenEventPlanner) {
                onOpenEventPlanner();
              } else {
                setActiveTableTab('event_planner');
                document.getElementById('booking-tables-section')?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="px-3.5 sm:px-4 py-2.5 bg-gradient-to-r from-amber-500/20 to-yellow-500/30 hover:bg-amber-500/30 text-amber-300 text-xs font-black rounded-xl transition-all border border-amber-500/50 flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{isUrdu ? '4. Shadi & Event Planner' : '4. Event Planner'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <PWAInstallButton isUrdu={isUrdu} variant="hero" />
        </div>
      </div>

      {/* 3. KHANEWAL LOCAL OPERATIONAL COVERAGE STRIP */}
      <section className="bg-[#0f1118] text-white rounded-2xl border border-amber-500/20 p-5 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-2">
                <span>{isUrdu ? 'Khanewal Coverage Zones (Operational Localities)' : 'Active Coverage Areas in Khanewal'}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </h4>
              <p className="text-[11px] text-slate-400">
                {isUrdu ? 'Sirf Khanewal shehar aur qareebi chakan ke liye khasoosi aur fauri service' : 'Exclusively operational across Khanewal city sectors & union councils'}
              </p>
            </div>
          </div>

          <span className="text-[11px] font-bold text-amber-300 bg-amber-950/80 border border-amber-500/40 px-3 py-1 rounded-full w-fit">
            ● {isUrdu ? '100% Local On-Demand Fleet Dastyab' : 'Active Local Fleet'}
          </span>
        </div>

        <div className="pt-3.5 flex flex-wrap gap-2 text-xs">
          {KHANEWAL_LOCAL_AREAS.map((loc) => (
            <span
              key={loc.id}
              className="px-3 py-1.5 rounded-xl bg-[#141620] border border-slate-800 text-slate-300 text-[11px] font-semibold hover:border-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1.5"
            >
              <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
              <span>{isUrdu ? loc.nameUr : loc.nameEn}</span>
            </span>
          ))}
        </div>
      </section>

      {/* 4. THREE MAIN BOOKING TABLES (BOOK A TECHNICIAN, BOOK A RIDE, BOOK A CARGO) */}
      <section id="booking-tables-section" className="space-y-6 scroll-mt-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'Markazi Booking Service Hub' : 'Master Booking Hub'}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              {isUrdu ? 'Khanewal Connect ki 3 Bari Service Categories' : 'Choose from 3 Core Booking Tables'}
            </h2>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              {isUrdu 
                ? 'Matlooba category select karein aur live rates dekh kar foran book karein:' 
                : 'Select a primary category to view live rates, verified availability, and book instantly:'}
            </p>
          </div>

          {/* Table Tab Selector Buttons */}
          <div className="flex flex-wrap p-1.5 rounded-2xl bg-[#0f1118] border border-amber-500/30 gap-1.5">
            <button
              onClick={() => setActiveTableTab('technician')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTableTab === 'technician'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>{isUrdu ? '1. Book Technician' : '1. Book a Technician'}</span>
              <span className="text-[10px] opacity-80 font-mono">({services.length})</span>
            </button>

            <button
              onClick={() => setActiveTableTab('ride')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTableTab === 'ride'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{isUrdu ? '2. Book a Ride' : '2. Book a Ride'}</span>
              <span className="text-[10px] opacity-80 font-mono">(4)</span>
            </button>

            <button
              onClick={() => setActiveTableTab('cargo')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTableTab === 'cargo'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>{isUrdu ? '3. Book Cargo' : '3. Book a Cargo'}</span>
              <span className="text-[10px] opacity-80 font-mono">({vehicles.length})</span>
            </button>

            <button
              onClick={() => setActiveTableTab('event_planner')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTableTab === 'event_planner'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md shadow-amber-400/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{isUrdu ? '4. Shadi & Event Planner' : '4. Event Planner'}</span>
              <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-600/40 px-1.5 py-0.2 rounded font-sans font-bold">
                VIP
              </span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            TABLE 1: BOOK A TECHNICIAN / HOME SERVICE
            ========================================================================= */}
        {activeTableTab === 'technician' && (
          <div className="bg-[#0f1118] rounded-3xl border border-amber-500/30 overflow-hidden shadow-2xl">
            <div className="p-5 bg-[#141622] border-b border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    {isUrdu ? 'Table 1: Book Technician & Karigar (Certified Pros)' : 'Table 1: Book a Certified Technician'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isUrdu ? 'Sirf verified local karigar live store par dikhaye gaye hain' : 'Live verified technicians ready for dispatch across Khanewal'}
                  </p>
                </div>
              </div>

              <div className="relative max-w-xs w-full">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={serviceSearchQuery}
                  onChange={(e) => setServiceSearchQuery(e.target.value)}
                  placeholder={isUrdu ? 'Electrician, AC ya Plumber talash karein...' : 'Search technician trade...'}
                  className="w-full text-xs rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 py-2 focus:border-amber-400 focus:outline-hidden pl-8 pr-3"
                />
              </div>
            </div>

            {/* Responsive Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs border-collapse">
                <thead>
                  <tr className="bg-[#12131b] text-amber-400 font-bold border-b border-slate-800 text-[11px] uppercase tracking-wider">
                    <th className="py-3.5 px-5 text-start">{isUrdu ? 'Service & Karigar' : 'Service & Trade'}</th>
                    <th className="py-3.5 px-4 text-start">{isUrdu ? 'Category' : 'Category'}</th>
                    <th className="py-3.5 px-4 text-start">{isUrdu ? 'Visit / Base Fee' : 'Visit / Base Fee'}</th>
                    <th className="py-3.5 px-4 text-start">{isUrdu ? 'Andaza Waqt' : 'Est. Duration'}</th>
                    <th className="py-3.5 px-4 text-start">{isUrdu ? 'Availability Status' : 'Live Status'}</th>
                    <th className="py-3.5 px-5 text-center">{isUrdu ? 'Action' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredServices.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-slate-400">
                        {isUrdu ? 'Koi service match nahi hui.' : 'No matching home services found.'}
                      </td>
                    </tr>
                  ) : (
                    filteredServices.map((srv) => (
                      <tr key={srv.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-900 border border-amber-500/30 flex items-center justify-center shrink-0">
                              {getServiceIcon(srv.icon)}
                            </div>
                            <div>
                              <span className="font-extrabold text-white text-sm block">
                                {getServiceName(srv)}
                              </span>
                              <p className="text-[11px] text-slate-400 line-clamp-1 max-w-sm">
                                {srv.description}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4 text-slate-300 font-medium">
                          <span className="bg-slate-900 border border-slate-700 px-2 py-1 rounded-md text-[11px]">
                            {srv.category}
                          </span>
                        </td>

                        <td className="py-4 px-4 font-mono font-bold text-amber-400 text-sm">
                          PKR {srv.basePrice.toLocaleString()}
                        </td>

                        <td className="py-4 px-4 text-slate-300 font-medium">
                          <span className="flex items-center gap-1 text-[11px]">
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            <span>{srv.estimatedDuration}</span>
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-1 rounded-full">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>{isUrdu ? 'Certified Pro Dastyab Hai' : 'Certified Pro Ready'}</span>
                          </span>
                        </td>

                        <td className="py-4 px-5 text-center">
                          <button
                            onClick={() => onOpenOrderModal('home_services', srv.id)}
                            className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md cursor-pointer whitespace-nowrap"
                          >
                            {isUrdu ? 'Abhi Book Karein' : 'Book Now'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================================
            TABLE 2: BOOK A RIDE / INSTANT COURIER & DELIVERY
            ========================================================================= */}
        {activeTableTab === 'ride' && (
          <div className="bg-[#0f1118] rounded-3xl border border-amber-500/30 overflow-hidden shadow-2xl">
            <div className="p-5 bg-[#141622] border-b border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    {isUrdu ? 'Table 2: Book a Ride & Fauri Courier Delivery' : 'Table 2: Book a Ride & Instant Courier'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isUrdu ? 'Khanewal ke andar taiz tareen bike rider, sauda salaf aur pharmacy delivery' : 'Fast bike riders across Khanewal for parcels, groceries & urgent medicine'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onOpenOrderModal('custom_delivery')}
                className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer w-fit"
              >
                + {isUrdu ? 'Custom Saman List Likhein' : 'Custom Item Pickup'}
              </button>
            </div>

            {/* Responsive Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs border-collapse">
                <thead>
                  <tr className="bg-[#12131b] text-amber-400 font-bold border-b border-slate-800 text-[11px] uppercase tracking-wider">
                    <th className="py-3.5 px-5 text-start">{isUrdu ? 'Service ki Qisam' : 'Service Type'}</th>
                    <th className="py-3.5 px-4 text-start">{isUrdu ? 'Sawari (Vehicle)' : 'Vehicle'}</th>
                    <th className="py-3.5 px-4 text-start">{isUrdu ? 'Base Fare' : 'Base Fare'}</th>
                    <th className="py-3.5 px-4 text-start">{isUrdu ? 'Per KM Rate' : 'Per KM Rate'}</th>
                    <th className="py-3.5 px-4 text-start">{isUrdu ? 'Est. Delivery' : 'Est. Delivery'}</th>
                    <th className="py-3.5 px-5 text-center">{isUrdu ? 'Action' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {deliveryRideItems.map((ride) => (
                    <tr key={ride.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-900 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                            <ShoppingBag className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-extrabold text-white text-sm block">
                              {isUrdu ? ride.nameUr : ride.nameEn}
                            </span>
                            <p className="text-[11px] text-slate-400 line-clamp-1 max-w-sm">
                              {isUrdu ? ride.descUr : ride.descEn}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-slate-300 font-medium">
                        <span className="bg-slate-900 border border-slate-700 px-2 py-1 rounded-md text-[11px]">
                          {isUrdu ? ride.vehicleUr : ride.vehicleEn}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-mono font-bold text-amber-400 text-sm">
                        PKR {ride.baseFee.toLocaleString()}
                      </td>

                      <td className="py-4 px-4 font-mono font-medium text-slate-300">
                        PKR {ride.perKm} / KM
                      </td>

                      <td className="py-4 px-4 text-slate-300 font-medium">
                        <span className="flex items-center gap-1 text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>{ride.eta}</span>
                        </span>
                      </td>

                      <td className="py-4 px-5 text-center">
                        <button
                          onClick={() => onOpenOrderModal('custom_delivery')}
                          className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md cursor-pointer whitespace-nowrap"
                        >
                          {isUrdu ? 'Ride Book Karein' : 'Book Ride'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================================
            TABLE 3: BOOK A CARGO & HEAVY LOADER
            ========================================================================= */}
        {activeTableTab === 'cargo' && (
          <div className="bg-[#0f1118] rounded-3xl border border-amber-500/30 overflow-hidden shadow-2xl">
            <div className="p-5 bg-[#141622] border-b border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    {isUrdu ? 'Table 3: Book Cargo & Loader Vehicle Fleet' : 'Table 3: Book Cargo & Loader Vehicle'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isUrdu ? 'Loader Riksha se le kar Shahzore aur 14-foot commercial truck tak mukammal fleet' : 'From 350kg loader rickshaw to 1-ton Shehzore and flatbed trucks'}
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold text-amber-300 bg-amber-950/80 border border-amber-500/40 px-3 py-1 rounded-full w-fit">
                ● {isUrdu ? 'Verified Khanewal Cargo Drivers' : 'Verified Cargo Drivers'}
              </span>
            </div>

            {/* Responsive Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs border-collapse">
                <thead>
                  <tr className="bg-[#12131b] text-amber-400 font-bold border-b border-slate-800 text-[11px] uppercase tracking-wider">
                    <th className="py-3.5 px-5 text-start">{isUrdu ? 'Gaari & Model' : 'Vehicle & Model'}</th>
                    <th className="py-3.5 px-4 text-start">{isUrdu ? 'Wazan Gunjaish' : 'Capacity'}</th>
                    <th className="py-3.5 px-4 text-start">{isUrdu ? 'Dala Size' : 'Bed Dimensions'}</th>
                    <th className="py-3.5 px-4 text-start">{isUrdu ? 'Base Fare' : 'Base Fare'}</th>
                    <th className="py-3.5 px-4 text-start">{isUrdu ? 'Per KM Rate' : 'Per KM'}</th>
                    <th className="py-3.5 px-4 text-start">{isUrdu ? 'Helper Fee' : 'Helper Rate'}</th>
                    <th className="py-3.5 px-5 text-center">{isUrdu ? 'Action' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {vehicles.map((veh) => (
                    <tr key={veh.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-900 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                            <Truck className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-extrabold text-white text-sm block">
                              {getVehicleName(veh)}
                            </span>
                            <p className="text-[11px] text-slate-400 line-clamp-1 max-w-sm">
                              {veh.bestFor}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 font-mono font-bold text-amber-400">
                        {veh.capacityKg} KG
                      </td>

                      <td className="py-4 px-4 text-slate-300 font-medium">
                        <span className="bg-slate-900 border border-slate-700 px-2 py-1 rounded-md text-[11px]">
                          {veh.dimensions}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-mono font-bold text-amber-400 text-sm">
                        PKR {veh.baseFare.toLocaleString()}
                      </td>

                      <td className="py-4 px-4 font-mono text-slate-300 font-medium">
                        PKR {veh.perKmRate} / KM
                      </td>

                      <td className="py-4 px-4 font-mono text-slate-300 font-medium">
                        PKR {veh.helperRate}
                      </td>

                      <td className="py-4 px-5 text-center">
                        <button
                          onClick={() => onOpenOrderModal('transport_cargo', veh.id)}
                          className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md cursor-pointer whitespace-nowrap"
                        >
                          {isUrdu ? 'Cargo Book Karein' : 'Book Vehicle'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================================
            TABLE 4: BOOK EVENT & CELEBRATION PLANNER (Khanah-e-Taqreeb)
            ========================================================================= */}
        {activeTableTab === 'event_planner' && (
          <div className="bg-[#0f1118] rounded-3xl border-2 border-amber-500/40 overflow-hidden shadow-2xl space-y-4">
            <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-600/20 via-[#141622] to-amber-950/30 border-b border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-amber-400/20 border border-amber-400/50 flex items-center justify-center text-amber-400 text-xl shadow-md">
                  🎪
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <span>{isUrdu ? 'Table 4: Shadi o Taqreeb Planner — Khanah-e-Taqreeb' : 'Table 4: Khanewal Event & Wedding Planner'}</span>
                    <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-black">
                      VIP
                    </span>
                  </h3>
                  <p className="text-xs text-amber-200/80">
                    {isUrdu ? 'Shadi, Barat, Walima, Salgirah aur gharelu dawaton ka certified mukammal intezam' : 'Turnkey events, catering, tentage, and stage decor in Khanewal'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onOpenEventPlanner ? onOpenEventPlanner() : onOpenOrderModal('home_services')}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer w-fit"
              >
                <span>{isUrdu ? 'Nayi Taqreeb Plan Karein' : 'Plan Custom Event'}</span>
                <Sparkles className="w-4 h-4" />
              </button>
            </div>

            {/* Event Packages Grid */}
            <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  id: 'pkg-barat',
                  icon: '👑',
                  nameUr: 'Shahi Baarat & Rukhsati Package',
                  nameEn: 'Royal Barat & Wedding Setup',
                  guests: '200 - 800 Afrad',
                  descUr: 'Bridal stage sofa, VIP shamiyana, cutlery, uniformed waiters, high quality sound aur entry lights.',
                  pricing: 'PKR 75,000 se shuru',
                  badge: 'Mashhoor Tareen'
                },
                {
                  id: 'pkg-walima',
                  icon: '✨',
                  nameUr: 'Walima Grand Reception & Buffet',
                  nameEn: 'Grand Walima Reception',
                  guests: '250 - 1000+ Afrad',
                  descUr: 'Laziz buffet catering, ration salad & sweets, VIP hall decoration, stage aur photography.',
                  pricing: 'PKR 95,000 se shuru',
                  badge: 'Premium'
                },
                {
                  id: 'pkg-mehndi',
                  icon: '🌸',
                  nameUr: 'Mehndi & Mayun Festive Setup',
                  nameEn: 'Mehndi & Mayun Festive Setup',
                  guests: '100 - 400 Afrad',
                  descUr: 'Gainda phool stage, jhoola setup, colorful parday, dholak sound system, photo booth.',
                  pricing: 'PKR 45,000 se shuru',
                  badge: 'Color Theme'
                },
                {
                  id: 'pkg-dawat',
                  icon: '🍲',
                  nameUr: 'Gharelu Dawat & Riwayati Daigein',
                  nameEn: 'Traditional Dawat & Degain',
                  guests: '50 - 300 Afrad',
                  descUr: 'Mahir bawarchi ki tayyar karda laziz daigein (Biryani, Qorma, Karahi, Zarda), crockery aur chatayiyan.',
                  pricing: 'PKR 9,500 per daig',
                  badge: 'Khaalis Zaiqa'
                },
                {
                  id: 'pkg-birthday',
                  icon: '🎂',
                  nameUr: 'Salgirah & Private Family Party',
                  nameEn: 'Birthday & Family Lawn Party',
                  guests: '30 - 150 Afrad',
                  descUr: 'Balloon decoration, custom cake table, party lighting, bachon ke liye sound & snacks.',
                  pricing: 'PKR 25,000 se shuru',
                  badge: 'Family Fun'
                },
                {
                  id: 'pkg-qawwali',
                  icon: '🪕',
                  nameUr: 'Mehfil-e-Qawwali, Milad & Sufi Night',
                  nameEn: 'Sufi Qawwali & Milad Gathering',
                  guests: '100 - 500 Afrad',
                  descUr: 'Qaleen & gadday, stage, premium echo sound system, projector aur langar-o-niaz ka ba-waqar intezam.',
                  pricing: 'PKR 35,000 se shuru',
                  badge: 'Ruhani Intezam'
                }
              ].map(pkg => (
                <div
                  key={pkg.id}
                  className="rounded-2xl bg-[#121422] border border-amber-500/20 hover:border-amber-400/60 p-4 space-y-3 transition-all hover:shadow-lg hover:shadow-amber-500/10 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{pkg.icon}</span>
                      <span className="text-[10px] bg-amber-400/15 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full font-bold">
                        {pkg.badge}
                      </span>
                    </div>

                    <h4 className="font-black text-white text-sm">
                      {isUrdu ? pkg.nameUr : pkg.nameEn}
                    </h4>

                    <span className="text-[11px] font-mono text-amber-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md inline-block">
                      👥 Gunjaish: {pkg.guests}
                    </span>

                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {pkg.descUr}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-xs text-amber-300">
                      {pkg.pricing}
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenEventPlanner ? onOpenEventPlanner() : onOpenOrderModal('home_services')}
                      className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] rounded-lg transition-colors cursor-pointer"
                    >
                      {isUrdu ? 'Book Karein' : 'Book'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 5. TOPIC HEADING-WISE "WHY CHOOSE KHANEWAL CONNECT?" */}
      <section className="space-y-6 pt-4">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-950/60 border border-amber-500/30 px-3.5 py-1 rounded-full">
            <Award className="w-3.5 h-3.5" />
            <span>{isUrdu ? 'Khanewal Connect ki numayan khusoosiyat' : 'Why Choose Khanewal Connect'}</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight">
            {isUrdu ? 'Khanewal Connect ka intekhab kyun karein?' : 'Why Khanewal Connect is the #1 Choice'}
          </h2>
          <p className="text-xs md:text-sm text-slate-400">
            {isUrdu 
              ? 'Hum muqami satah par shaffafiat, aala miyar aur fori rasai ko yaqeeni banatay hain:'
              : 'Our five foundational pillars of local service excellence in Khanewal:'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* TOPIC 1 */}
          <div className="bg-[#0f1118] border border-amber-500/20 hover:border-amber-400/60 rounded-3xl p-6 transition-all shadow-xl hover:shadow-amber-500/10 space-y-4 group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-black text-amber-400 bg-amber-950/80 border border-amber-500/40 px-2.5 py-1 rounded-lg">
                #01
              </span>
              <div className="w-10 h-10 rounded-2xl bg-amber-400/10 text-amber-400 flex items-center justify-center group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>

            <div>
              <h3 className="text-base font-extrabold text-white group-hover:text-amber-400 transition-colors">
                {isUrdu ? 'Unwan 1: 100% Tasdeeq Shuda Muqami Workers aur Qanooni Shinakht' : 'Topic 1: 100% Verified Local Experts & Background Check'}
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {isUrdu
                  ? 'Tamam electricians, plumbers, riders aur cargo drivers ka NADRA CNIC, muqami rihaish aur record admin ki taraf se verified hai. Koi na-maloom banda aap ke ghar nahi aata.'
                  : 'Every technician, plumber, and driver is physically verified via NADRA CNIC and residential records by our Khanewal Administration desk.'}
              </p>
            </div>
          </div>

          {/* TOPIC 2 */}
          <div className="bg-[#0f1118] border border-amber-500/20 hover:border-amber-400/60 rounded-3xl p-6 transition-all shadow-xl hover:shadow-amber-500/10 space-y-4 group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-black text-amber-400 bg-amber-950/80 border border-amber-500/40 px-2.5 py-1 rounded-lg">
                #02
              </span>
              <div className="w-10 h-10 rounded-2xl bg-amber-400/10 text-amber-400 flex items-center justify-center group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors">
                <Coins className="w-5 h-5" />
              </div>
            </div>

            <div>
              <h3 className="text-base font-extrabold text-white group-hover:text-amber-400 transition-colors">
                {isUrdu ? 'Unwan 2: Peeshgi Shaffaf aur Munsifana Rates (Koi Chupay Charges Nahi)' : 'Topic 2: 100% Transparent Upfront Rates - No Hidden Fees'}
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {isUrdu
                  ? 'Har service ki bunyadi visit fee, per km kiraya aur loader rate booking se pehle wazeh nazar aatay hain. Kaam mukammal hone ke baad koi izafi ya beja raqam talab nahi ki jaati.'
                  : 'Upfront published fares and hourly rates. What you see is what you pay, eliminating awkward price bargaining.'}
              </p>
            </div>
          </div>

          {/* TOPIC 3 */}
          <div className="bg-[#0f1118] border border-amber-500/20 hover:border-amber-400/60 rounded-3xl p-6 transition-all shadow-xl hover:shadow-amber-500/10 space-y-4 group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-black text-amber-400 bg-amber-950/80 border border-amber-500/40 px-2.5 py-1 rounded-lg">
                #03
              </span>
              <div className="w-10 h-10 rounded-2xl bg-amber-400/10 text-amber-400 flex items-center justify-center group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors">
                <Navigation className="w-5 h-5" />
              </div>
            </div>

            <div>
              <h3 className="text-base font-extrabold text-white group-hover:text-amber-400 transition-colors">
                {isUrdu ? 'Unwan 3: Real-Time Live Tracking aur Worker ka Phone Number' : 'Topic 3: Live Real-Time Tracking & Direct Worker Contact'}
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {isUrdu
                  ? 'Order confirm hotay hi aap ke dashboard par assigned karigar ya driver ka asool naam, mobile number aur pohanchne ka andaza waqt (ETA) live nazar aata hai taake aap be-fikr rahein.'
                  : 'Live updates on your dashboard with assigned technician name, direct calling number, and accurate arrival ETA minutes.'}
              </p>
            </div>
          </div>

          {/* TOPIC 4 */}
          <div className="bg-[#0f1118] border border-amber-500/20 hover:border-amber-400/60 rounded-3xl p-6 transition-all shadow-xl hover:shadow-amber-500/10 space-y-4 group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-black text-amber-400 bg-amber-950/80 border border-amber-500/40 px-2.5 py-1 rounded-lg">
                #04
              </span>
              <div className="w-10 h-10 rounded-2xl bg-amber-400/10 text-amber-400 flex items-center justify-center group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors">
                <BadgePercent className="w-5 h-5" />
              </div>
            </div>

            <div>
              <h3 className="text-base font-extrabold text-white group-hover:text-amber-400 transition-colors">
                {isUrdu ? 'Unwan 4: Cash on Delivery aur Mehfooz Digital Payment (JazzCash / EasyPaisa)' : 'Topic 4: Safe Payment Modes (Cash on Delivery, JazzCash & EasyPaisa)'}
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {isUrdu
                  ? 'Kaam mukammal aur tasallibakhsh hone ke baad naqd raqam (Cash on Delivery) ada karein ya apne JazzCash aur EasyPaisa se fori aur mehfooz muntaqili karein.'
                  : 'Complete peace of mind: pay cash only after job completion or transfer via JazzCash / EasyPaisa / Bank.'}
              </p>
            </div>
          </div>

          {/* TOPIC 5 */}
          <div className="bg-[#0f1118] border border-amber-500/20 hover:border-amber-400/60 rounded-3xl p-6 transition-all shadow-xl hover:shadow-amber-500/10 space-y-4 group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-black text-amber-400 bg-amber-950/80 border border-amber-500/40 px-2.5 py-1 rounded-lg">
                #05
              </span>
              <div className="w-10 h-10 rounded-2xl bg-amber-400/10 text-amber-400 flex items-center justify-center group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors">
                <Award className="w-5 h-5" />
              </div>
            </div>

            <div>
              <h3 className="text-base font-extrabold text-white group-hover:text-amber-400 transition-colors">
                {isUrdu ? 'Unwan 5: 7 Din ki Service Warranty aur 24/7 Khanewal Helpline' : 'Topic 5: 7-Day Service Warranty & Dedicated Local Support'}
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {isUrdu
                  ? 'Tamam home repairing services par 7 din ki free fault re-visit warranty. Kisi bhi shikayat ya madad ki soorat mein Khanewal admin WhatsApp par 24/7 fori rabta.'
                  : 'Every completed home repair comes with a 7-day fault warranty backed by our local Khanewal customer helpline.'}
              </p>
            </div>
          </div>

          {/* TOPIC 6 (PARTNER ONBOARDING) */}
          <div className="bg-gradient-to-br from-[#1a1810] to-[#0f1118] border border-amber-500/40 rounded-3xl p-6 transition-all shadow-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs font-bold text-amber-400 bg-amber-950 px-2.5 py-1 rounded-lg border border-amber-500/40 inline-block">
                {isUrdu ? 'Karigaron aur Drivers ke liye' : 'For Local Workers & Drivers'}
              </span>
              <h3 className="text-base font-extrabold text-white">
                {isUrdu ? 'Khanewal Connect Partner banein aur rozgar kamaein' : 'Earn with Khanewal Connect'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isUrdu
                  ? 'Agar aap mahir electrician, plumber, bike rider ya loader gaari ke malik hain, to direct admin WhatsApp par tasdeeq karwayein aur rozana orders hasil karein.'
                  : 'Join our verified fleet. Direct onboarding by Admin on WhatsApp.'}
              </p>
            </div>

            <a
              href={partnerOnboardUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{isUrdu ? 'Admin WhatsApp par Registration' : 'WhatsApp Admin Onboarding'}</span>
            </a>
          </div>
        </div>
      </section>

      {/* 6. VERIFIED CUSTOMER REVIEWS & TESTIMONIALS (Khanewal ke shehriyon ke tasurat) */}
      <section className="bg-gradient-to-b from-[#0f1118] to-[#0a0b12] rounded-3xl border border-amber-500/30 p-5 md:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 mb-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{isUrdu ? 'Sarfeen ki raye aur tasurat' : 'Verified Customer Testimonials'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {isUrdu ? 'Khanewal ke mutmaeen shehriyon ke live reviews' : 'Real Customer Reviews Across Khanewal'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isUrdu 
                ? 'Jab bhi koi user kaam mukammal hone par review deta hai, wo yahan shaffafiat ke sath tamam users ko nazar aata hai.' 
                : 'Authentic reviews submitted by verified Khanewal residents after successful job completion.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-400 bg-amber-950/80 border border-amber-500/40 px-3 py-1 rounded-full">
              ★ {isUrdu ? '100% Haqeeqi Reviews' : '100% Real Feedback'}
            </span>
          </div>
        </div>

        {/* Reviews Grid */}
        {publicCustomerReviews.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#121420] border border-slate-800 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/10 text-amber-400 flex items-center justify-center mx-auto mb-2">
              <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
            </div>
            <p className="text-sm font-bold text-white">
              {isUrdu ? 'Abhi koi naya review darj nahi hua' : 'No customer reviews submitted yet'}
            </p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {isUrdu 
                ? 'Jab aap ka order mukammal hoga aur aap review denge, to aap ka tajruba yahan tamam shehriyon ke liye live dikhaya jaye ga.' 
                : 'Book a service today and share your verified experience to help the Khanewal community!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {publicCustomerReviews.map((revOrder) => (
              <div 
                key={revOrder.id}
                className="p-4 rounded-2xl bg-[#121422] border border-amber-500/20 hover:border-amber-400/50 transition-all space-y-3 shadow-md"
              >
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                  <div>
                    <span className="font-bold text-white text-xs block">{revOrder.customerName}</span>
                    <span className="text-[10px] text-amber-400 font-medium">
                      {revOrder.category === 'home_services' 
                        ? (revOrder.serviceDetails?.serviceName || 'Home Service') 
                        : revOrder.category === 'transport_cargo' 
                        ? (revOrder.transportDetails?.vehicleName || 'Cargo') 
                        : 'Store Delivery'}
                    </span>
                  </div>

                  <div className="flex text-amber-400">
                    {Array.from({ length: revOrder.review?.rating || 5 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-200 italic leading-relaxed">
                  "{revOrder.review?.comment}"
                </p>

                {revOrder.review?.tags && revOrder.review.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {revOrder.review.tags.map((tag, tIdx) => (
                      <span key={tIdx} className="text-[10px] bg-slate-900 border border-slate-700 text-slate-300 px-2 py-0.5 rounded-md">
                        ✓ {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Worker: {revOrder.assignedProviderName || 'Tasdeeq Shuda Karigar'}</span>
                  <span>{new Date(revOrder.review?.reviewedAt || revOrder.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
};
