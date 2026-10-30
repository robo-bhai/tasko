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
  Navigation
} from 'lucide-react';
import { PWAInstallButton } from '../PWAInstallButton';

interface CustomerHomeProps {
  currentUser?: User | null;
  onOpenOrderModal: (category: 'custom_delivery' | 'home_services' | 'transport_cargo', preselectedId?: string) => void;
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
  onOpenLiveTracker,
  onOpenAuth,
  activeOrders,
  services,
  vehicles,
  lang
}) => {
  const t = translations[lang];
  const isUrdu = lang === 'ur';

  // Active table view: 'technician' | 'ride' | 'cargo'
  const [activeTableTab, setActiveTableTab] = useState<'technician' | 'ride' | 'cargo'>('technician');
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');

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
    if (srv.id === 'srv-ac-repair') return 'اے سی ماسٹر کیمیکل سروس اور ریپیرنگ';
    if (srv.id === 'srv-electrician') return 'مصدقہ الیکٹریشن اور وائرنگ فالٹ ریپئر';
    if (srv.id === 'srv-plumbing') return 'ایمرجنسی پلمبنگ اور سینیٹری سروس';
    if (srv.id === 'srv-cleaning') return 'صوفہ، کارپٹ اور گھر کی گہری صفائی';
    if (srv.id === 'srv-appliances') return 'فریج، واشنگ مشین اور اوون مرمت';
    if (srv.id === 'srv-carpentry') return 'کارپینٹر، الماری اور تالہ مرمت';
    return srv.name;
  };

  const getVehicleName = (veh: TransportVehicleItem) => {
    if (!isUrdu) return veh.name;
    if (veh.id === 'veh-loader-rickshaw') return 'لوڈر رکشہ (وزن: 350 کلوگرام)';
    if (veh.id === 'veh-mini-pickup') return 'سوزوکی راوی پک اپ (وزن: 850 کلوگرام)';
    if (veh.id === 'veh-standard-van') return 'ہنڈائی شاہ زور ٹرک (وزن: 1800 کلوگرام)';
    if (veh.id === 'veh-flatbed-truck') return '14-فٹ ہیوی کمرشل ٹرک (وزن: 4500 کلوگرام)';
    return veh.name;
  };

  // Instant Delivery Ride Catalog Data dynamically populated from Admin Settings
  const settings = Store.getSettings();
  const deliveryRideItems = [
    {
      id: 'ride-instant-bike',
      nameUr: 'فوری بائیک رائیڈر (دستاویزات، ادویات و پارسل)',
      nameEn: 'Instant Bike Courier (Docs, Medicine & Parcels)',
      vehicleUr: '125cc موٹر بائیک',
      vehicleEn: '125cc Motorbike',
      baseFee: settings.deliveryBaseFee,
      perKm: settings.deliveryPerKmFee,
      eta: '15 - 25 mins',
      descUr: 'شہر کے اندر فوری دستاویزات، پارسل، گھر کا پکا کھانا یا بازار سے چھوٹی اشیاء منگوائیں۔',
      descEn: 'Superfast parcel, food, or documents pickup across Khanewal neighborhoods.'
    },
    {
      id: 'ride-grocery-errand',
      nameUr: 'بازار سودا سلف و سبزی/گوشت خریداری',
      nameEn: 'Market Grocery & Store Errands Run',
      vehicleUr: 'کارگو بائیک باکس',
      vehicleEn: 'Cargo Bike Box',
      baseFee: settings.deliveryBaseFee + 50,
      perKm: settings.deliveryPerKmFee,
      eta: '25 - 40 mins',
      descUr: 'خانیوال کی کسی بھی دکان یا غلہ منڈی سے مطلوبہ سودا سلف خرید کر گھر پہنچائیں۔',
      descEn: 'Our verified rider visits the local market, buys requested items, and delivers to your doorstep.'
    },
    {
      id: 'ride-urgent-pharmacy',
      nameUr: 'ایمرجنسی میڈیسن و فارمیسی ترسیل',
      nameEn: 'Emergency Pharmacy & Medical Delivery',
      vehicleUr: 'ایمرجنسی بائیک',
      vehicleEn: 'Priority Bike',
      baseFee: settings.deliveryBaseFee + (settings.deliveryUrgentFee || 100),
      perKm: settings.deliveryPerKmFee,
      eta: '10 - 20 mins',
      descUr: 'ڈاکٹر کے نسخے کے مطابق قریبی میڈیکل اسٹور سے فوری ادویات کی فراہمی۔',
      descEn: 'Priority 24/7 delivery of emergency medicines and healthcare essentials.'
    },
    {
      id: 'ride-bakery-food',
      nameUr: 'بیکری، مٹھائی اور ریسٹورنٹ پک اپ',
      nameEn: 'Bakery, Sweets & Food Pickup',
      vehicleUr: 'تھرمل بائیک بیگ',
      vehicleEn: 'Thermal Bike Bag',
      baseFee: settings.deliveryBaseFee,
      perKm: settings.deliveryPerKmFee,
      eta: '20 - 30 mins',
      descUr: 'شہر کی مشہور مٹھائیوں اور ریسٹورنٹ سے گرما گرم کھانا فوری وصول کریں۔',
      descEn: 'Get fresh, hot food and bakery delicacies collected and safely delivered.'
    }
  ];

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(serviceSearchQuery.toLowerCase()) ||
    s.description.toLowerCase().includes(serviceSearchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(serviceSearchQuery.toLowerCase())
  );

  const whatsappAdminNumber = (Store.getSettings().whatsappSupportPhone || '+923000009988').replace(/[^0-9]/g, '');
  const partnerOnboardUrl = `https://wa.me/${whatsappAdminNumber}?text=${encodeURIComponent(
    isUrdu 
      ? 'السلام علیکم! میں Khanewal Connect پر بطور سروس پارٹنر / کاریگر / ڈرائیور آن بورڈ ہونا چاہتا ہوں۔ برائے مہربانی مجھے رجسٹر کریں۔'
      : 'Hello Admin, I want to onboard as a verified service partner on Khanewal Connect. Please register me.'
  )}`;

  return (
    <div className={`space-y-12 pb-20 ${isUrdu ? 'rtl' : 'ltr'}`}>
      
      {/* 1. LOGGED-IN CUSTOMER ACTIVE ORDER TRACKING (Strictly visible only to logged-in customer) */}
      {currentUser && latestActiveOrder && (
        <section className="bg-gradient-to-r from-[#14151f] via-[#1c1b14] to-[#0e0f14] text-white rounded-3xl p-5 md:p-6 shadow-2xl border-2 border-amber-500/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
                </span>
                <span className="text-xs uppercase tracking-wider font-extrabold text-amber-400">
                  {isUrdu ? 'آپ کا فعال آرڈر جاری ہے (لائیو ٹریکنگ)' : 'Your Live Active Booking'}
                </span>
                <span className="text-slate-500">·</span>
                <span className="font-mono text-xs text-amber-300 font-bold bg-amber-950/80 border border-amber-600/50 px-2.5 py-0.5 rounded-lg">
                  {latestActiveOrder.id}
                </span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  latestActiveOrder.status === 'on_the_way'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}>
                  {latestActiveOrder.status === 'assigned' && (isUrdu ? 'ورکر تفویض ہو چکا ہے' : 'Assigned')}
                  {latestActiveOrder.status === 'on_the_way' && (isUrdu ? 'ورکر راستے میں ہے (روانہ)' : 'On The Way')}
                  {latestActiveOrder.status === 'work_started' && (isUrdu ? 'کام جاری ہے' : 'Work Started')}
                  {latestActiveOrder.status === 'pending' && (isUrdu ? 'انتظار برائے تصدیق' : 'Pending')}
                </span>
              </div>

              <h3 className="text-lg md:text-xl font-black tracking-tight text-white">
                {latestActiveOrder.category === 'custom_delivery' && (isUrdu ? 'فوری ڈوراسٹیپ ڈیلیوری' : 'Doorstep Store Delivery')}
                {latestActiveOrder.category === 'home_services' && `${latestActiveOrder.serviceDetails?.serviceName || 'Home Service'}`}
                {latestActiveOrder.category === 'transport_cargo' && `${latestActiveOrder.transportDetails?.vehicleName || 'Cargo Transport'}`}
              </h3>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-300">
                {latestActiveOrder.assignedProviderName ? (
                  <span className="text-amber-300 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isUrdu ? 'مقرر کردہ ورکر:' : 'Assigned Worker:'}</span>
                    <strong className="text-white">{latestActiveOrder.assignedProviderName}</strong>
                    {latestActiveOrder.assignedProviderPhone && (
                      <span className="text-slate-400 font-mono">({latestActiveOrder.assignedProviderPhone})</span>
                    )}
                  </span>
                ) : (
                  <span className="text-amber-400 font-medium">
                    {isUrdu ? 'قریبی مصدقہ ورکر کی تصدیق کی جا رہی ہے...' : 'Finding verified worker nearby...'}
                  </span>
                )}

                {latestActiveOrder.etaMinutes && (
                  <span className="bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>~{latestActiveOrder.etaMinutes} {isUrdu ? 'منٹ میں پہنچے گا' : 'mins ETA'}</span>
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
                className="px-5 py-3 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-black rounded-2xl transition-all shadow-lg hover:shadow-amber-500/20 flex items-center gap-2 cursor-pointer transform hover:scale-[1.02]"
              >
                <Radio className="w-4 h-4 text-slate-950 animate-pulse" />
                <span>{isUrdu ? 'لائیو ٹریکنگ دیکھیں' : 'Open Live Tracker'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 2. HERO SHOWCASE - BLACK & GOLD LUXURY AESTHETIC */}
      <section className="relative overflow-hidden rounded-3xl bg-[#0b0c12] text-white border border-amber-500/30 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/15 via-transparent to-transparent pointer-events-none" />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[420px] lg:items-stretch relative z-10">
          <div className="lg:col-span-7 p-8 md:p-12 flex flex-col justify-center space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 bg-amber-950/70 border border-amber-500/40 px-3.5 py-1.5 rounded-full w-fit shadow-xs">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{isUrdu ? 'خانیوال سٹی اور نواحی علاقوں کا اپنا سپر نیٹ ورک' : 'Khanewal City & Nearby Areas #1 On-Demand Super App'}</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
                {isUrdu ? (
                  <>
                    گھر کی مرمت، فوری رائیڈ اور کارگو ٹرانسپورٹ <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500">ایک کلک پر</span>
                  </>
                ) : (
                  <>
                    Certified Home Repairs, Rides & Heavy Cargo <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-400">At Your Doorstep</span>
                  </>
                )}
              </h1>
              <p className="text-sm md:text-base text-slate-300 max-w-xl leading-relaxed">
                {isUrdu 
                  ? 'خانیوال سٹی میں تصدیق شدہ الیکٹریشنز، پلمبرز، بائیک رائیڈرز اور لوڈر گاڑیاں۔ شفاف فلیٹ ریٹس، براہِ راست رابطہ اور منٹوں میں لائیو ڈسپیچ۔'
                  : 'Book verified Khanewal electricians, plumbers, instant courier riders, and loader cargo vehicles with transparent upfront pricing and live GPS tracking.'}
              </p>
            </div>

            {/* Quick 3 Table Switcher CTA Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-2">
              <button
                onClick={() => {
                  setActiveTableTab('technician');
                  document.getElementById('booking-tables-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-4 sm:px-5 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs sm:text-sm font-black rounded-xl transition-all shadow-lg hover:shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
              >
                <Wrench className="w-4 h-4 text-slate-950" />
                <span>{isUrdu ? '1. بک اے ٹیکنیشن' : '1. Book a Technician'}</span>
              </button>

              <button
                onClick={() => {
                  setActiveTableTab('ride');
                  document.getElementById('booking-tables-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-4 sm:px-5 py-3 bg-[#171923] hover:bg-[#202230] text-amber-400 text-xs sm:text-sm font-bold rounded-xl transition-all border border-amber-500/40 flex items-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <span>{isUrdu ? '2. بک اے رائیڈ' : '2. Book a Ride'}</span>
              </button>

              <button
                onClick={() => {
                  setActiveTableTab('cargo');
                  document.getElementById('booking-tables-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-4 sm:px-5 py-3 bg-[#171923] hover:bg-[#202230] text-amber-400 text-xs sm:text-sm font-bold rounded-xl transition-all border border-amber-500/40 flex items-center gap-2 cursor-pointer"
              >
                <Truck className="w-4 h-4 text-amber-400" />
                <span>{isUrdu ? '3. بک اے کارگو' : '3. Book a Cargo'}</span>
              </button>

              {/* Install PWA Button */}
              <div className="pt-1 sm:pt-0">
                <PWAInstallButton isUrdu={isUrdu} variant="hero" />
              </div>
            </div>

            {/* Trust Badges */}
            <div className="pt-3 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-300 border-t border-slate-800">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{isUrdu ? '100% تصدیق شدہ خانیوال ورکرز (CNIC Checked)' : '100% Verified Local Pros'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{isUrdu ? '20 تا 35 منٹ تیز رفتار رسائی' : 'Under 35-Min Dispatch'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{isUrdu ? 'کیش آن ڈیلیوری / جاز کیش' : 'Cash on Delivery & JazzCash'}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative min-h-[280px] lg:min-h-full">
            <img
              src="/src/assets/images/hero_delivery_service_1793035359071.jpg"
              alt="Khanewal Connect Services"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c12] via-transparent lg:bg-gradient-to-r lg:from-[#0b0c12] lg:to-transparent" />
          </div>
        </div>
      </section>

      {/* 3. KHANEWAL LOCAL OPERATIONAL COVERAGE STRIP */}
      <section className="bg-[#0f1118] text-white rounded-2xl border border-amber-500/20 p-5 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-2">
                <span>{isUrdu ? 'خانیوال کوریج زونز (Khanewal Operational Localities)' : 'Active Coverage Areas in Khanewal'}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </h4>
              <p className="text-[11px] text-slate-400">
                {isUrdu ? 'صرف خانیوال شہر اور قریبی چکنبرز کے لیے خصوصی و فوری سروس' : 'Exclusively operational across Khanewal city sectors & union councils'}
              </p>
            </div>
          </div>

          <span className="text-[11px] font-bold text-amber-300 bg-amber-950/80 border border-amber-500/40 px-3 py-1 rounded-full w-fit">
            ● {isUrdu ? '100% لوکل آن ڈیمانڈ فلیٹ دستیاب' : 'Active Local Fleet'}
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
              <span>{isUrdu ? 'مرکزی بکنگ سروس پورٹل' : 'Master Booking Hub'}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              {isUrdu ? 'خانیوال کنیکٹ کی 3 بڑی سروس کیٹیگریز' : 'Choose from 3 Core Booking Tables'}
            </h2>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              {isUrdu 
                ? 'مطلوبہ ٹیبل منتخب کریں اور پیشگی ریٹ و دستیابی دیکھ کر فوراً بک کریں:' 
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
              <span>{isUrdu ? '1. بک اے ٹیکنیشن' : '1. Book a Technician'}</span>
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
              <span>{isUrdu ? '2. بک اے رائیڈ' : '2. Book a Ride'}</span>
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
              <span>{isUrdu ? '3. بک اے کارگو' : '3. Book a Cargo'}</span>
              <span className="text-[10px] opacity-80 font-mono">({vehicles.length})</span>
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
                    {isUrdu ? 'ٹیبل 1: بک اے ٹیکنیشن و ماہر کاریگر (Book a Technician)' : 'Table 1: Book a Certified Technician'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isUrdu ? 'صرف منظور شدہ مقامی کاریگر لائیو اسٹور پر دکھائے گئے ہیں' : 'Live verified technicians ready for dispatch across Khanewal'}
                  </p>
                </div>
              </div>

              <div className="relative max-w-xs w-full">
                <Search className={`w-3.5 h-3.5 text-slate-500 absolute ${isUrdu ? 'right-3' : 'left-3'} top-2.5`} />
                <input
                  type="text"
                  value={serviceSearchQuery}
                  onChange={(e) => setServiceSearchQuery(e.target.value)}
                  placeholder={isUrdu ? 'الیکٹریشن، اے سی یا پلمبر تلاش کریں...' : 'Search technician trade...'}
                  className={`w-full text-xs rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 py-2 focus:border-amber-400 focus:outline-hidden ${
                    isUrdu ? 'pr-8 pl-3' : 'pl-8 pr-3'
                  }`}
                />
              </div>
            </div>

            {/* Responsive Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs border-collapse">
                <thead>
                  <tr className="bg-[#12131b] text-amber-400 font-bold border-b border-slate-800 text-[11px] uppercase tracking-wider">
                    <th className="py-3.5 px-5 text-start">{isUrdu ? 'سروس و کاریگر' : 'Service & Trade'}</th>
                    <th className="py-3.5 px-4 text-start">{isUrdu ? 'زمرہ (Category)' : 'Category'}</th>
                    <th className="py-3.5 px-4 text-start">{isUrdu ? 'وزٹ و بنیادی فیس' : 'Visit / Base Fee'}</th>
                    <th className="py-3.5 px-4 text-start">{isUrdu ? 'اوسط وقت' : 'Est. Duration'}</th>
                    <th className="py-3.5 px-4 text-start">{isUrdu ? 'کاریگر دستیابی' : 'Live Status'}</th>
                    <th className="py-3.5 px-5 text-center">{isUrdu ? 'فوری بکنگ' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredServices.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-slate-400">
                        {isUrdu ? 'کوئی سروس میچ نہیں ہوئی۔' : 'No matching home services found.'}
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
                            <span>{isUrdu ? 'مصدقہ کاریگر دستیاب ہے' : 'Certified Pro Ready'}</span>
                          </span>
                        </td>

                        <td className="py-4 px-5 text-center">
                          <button
                            onClick={() => onOpenOrderModal('home_services', srv.id)}
                            className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md cursor-pointer whitespace-nowrap"
                          >
                            {isUrdu ? 'ابھی بک کریں' : 'Book Now'}
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
                    {isUrdu ? 'ٹیبل 2: بک اے رائیڈ و فوری کوریئر ترسیل (Book a Ride / Instant Courier)' : 'Table 2: Book a Ride & Instant Courier'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isUrdu ? 'خانیوال کے اندر تیز ترین بائیک رائیڈر، سودا سلف اور فارمیسی ترسیل' : 'Fast bike riders across Khanewal for parcels, groceries & urgent medicine'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onOpenOrderModal('custom_delivery')}
                className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer w-fit"
              >
                + {isUrdu ? 'کسٹم سامان لسٹ لکھیں' : 'Custom Item Pickup'}
              </button>
            </div>

            {/* Responsive Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs border-collapse">
                <thead>
                  <tr className="bg-[#12131b] text-amber-400 font-bold border-b border-slate-800 text-[11px] uppercase tracking-wider">
                    <th className="py-3.5 px-5 text-start">{isUrdu ? 'سروس کی قسم' : 'Service Type'}</th>
                    <th className="py-3.5 px-4 text-start">{isUrdu ? 'سواری (Vehicle)' : 'Vehicle'}</th>
                    <th className="py-3.5 px-4 text-start">{isUrdu ? 'بیس چارجز' : 'Base Fare'}</th>
                    <th className="py-3.5 px-4 text-start">{isUrdu ? 'فی کلومیٹر ریٹ' : 'Per KM Rate'}</th>
                    <th className="py-3.5 px-4 text-start">{isUrdu ? 'اوسط ترسیل' : 'Est. Delivery'}</th>
                    <th className="py-3.5 px-5 text-center">{isUrdu ? 'بکنگ' : 'Action'}</th>
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
                          {isUrdu ? 'رائیڈ بک کریں' : 'Book Ride'}
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
                    {isUrdu ? 'ٹیبل 3: بک اے کارگو و لوڈر ٹرانسپورٹ (Book a Cargo & Loader)' : 'Table 3: Book Cargo & Loader Vehicle'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isUrdu ? 'لوڈر رکشہ سے لے کر شاہ زور اور 14 فٹ کمرشل ٹرک تک مکمل فلیٹ' : 'From 350kg loader rickshaw to 1-ton Shehzore and flatbed trucks'}
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold text-amber-300 bg-amber-950/80 border border-amber-500/40 px-3 py-1 rounded-full w-fit">
                ● {isUrdu ? 'مصدقہ خانیوال کارگو ڈرائیورز' : 'Verified Cargo Drivers'}
              </span>
            </div>

            {/* Responsive Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs border-collapse">
                <thead>
                  <tr className="bg-[#12131b] text-amber-400 font-bold border-b border-slate-800 text-[11px] uppercase tracking-wider">
                    <th className="py-3.5 px-5 text-start">{isUrdu ? 'گاڑی و ماڈل' : 'Vehicle & Model'}</th>
                    <th className="py-3.5 px-4 text-start">{isUrdu ? 'وزن گنجائش' : 'Capacity'}</th>
                    <th className="py-3.5 px-4 text-start">{isUrdu ? 'ڈالا سائز' : 'Bed Dimensions'}</th>
                    <th className="py-3.5 px-4 text-start">{isUrdu ? 'بنیادی کرایہ' : 'Base Fare'}</th>
                    <th className="py-3.5 px-4 text-start">{isUrdu ? 'فی KM ریٹ' : 'Per KM'}</th>
                    <th className="py-3.5 px-4 text-start">{isUrdu ? 'ہیلپر فیس' : 'Helper Rate'}</th>
                    <th className="py-3.5 px-5 text-center">{isUrdu ? 'گاڑی بکنگ' : 'Action'}</th>
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
                          {isUrdu ? 'کارگو بک کریں' : 'Book Vehicle'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* 5. TOPIC HEADING-WISE "WHY CHOOSE KHANEWAL CONNECT?" */}
      <section className="space-y-6 pt-4">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-950/60 border border-amber-500/30 px-3.5 py-1 rounded-full">
            <Award className="w-3.5 h-3.5" />
            <span>{isUrdu ? 'خانیوال کنیکٹ کی نمایاں خصوصیات' : 'Why Choose Khanewal Connect'}</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight">
            {isUrdu ? 'خانیوال کنیکٹ کا انتخاب کیوں کریں؟' : 'Why Khanewal Connect is the #1 Choice'}
          </h2>
          <p className="text-xs md:text-sm text-slate-400">
            {isUrdu 
              ? 'ہم مقامی سطح پر شفافیت، اعلیٰ معیار اور فوری رسائی کو یقینی بناتے ہیں:'
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
                {isUrdu ? 'عنوان 1: 100% تصدیق شدہ مقامی ورکرز اور قانونی شناخت' : 'Topic 1: 100% Verified Local Experts & Background Check'}
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {isUrdu
                  ? 'تمام الیکٹریشنز، پلمبرز، رائیڈرز اور کارگو ڈرائیورز کا نادرا شناختی کارڈ (CNIC)، مقامی رہائش اور کرمنل بیک گراؤنڈ ایڈمن کی طرف سے ذاتی طور پر تصدیق شدہ ہے۔ کوئی نامعلوم بندہ آپ کے گھر نہیں آتا۔'
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
                {isUrdu ? 'عنوان 2: پیشگی شفاف اور منصفانہ ریٹس (کوئی پوشیدہ چارجز نہیں)' : 'Topic 2: 100% Transparent Upfront Rates - No Hidden Fees'}
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {isUrdu
                  ? 'ہر سروس کی بنیادی وزٹ فیس، فی کلومیٹر کرایہ اور لوڈر ریٹ بکنگ سے پہلے واضح دکھائی جاتی ہے۔ کام مکمل ہونے کے بعد کوئی اضافی یا بے جا رقم طلب نہیں کی جاتی۔'
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
                {isUrdu ? 'عنوان 3: ریئل ٹائم لائیو ٹریکنگ اور ورکر کا فون نمبر' : 'Topic 3: Live Real-Time Tracking & Direct Worker Contact'}
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {isUrdu
                  ? 'آرڈر کنفرم ہوتے ہی آپ کے ڈیش بورڈ پر تفویض شدہ کاریگر یا ڈرائیور کا اصل نام، موبائل نمبر اور پہنچنے کا تخمینی وقت (ETA) لائیو نظر آتا ہے تاکہ آپ بے فکر رہیں۔'
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
                {isUrdu ? 'عنوان 4: کیش آن ڈیلیوری اور محفوظ ڈیجیٹل پیمنٹ (JazzCash / EasyPaisa)' : 'Topic 4: Safe Payment Modes (Cash on Delivery, JazzCash & EasyPaisa)'}
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {isUrdu
                  ? 'کام مکمل اور تسلی بخش ہونے کے بعد نقد رقم (Cash on Delivery) ادا کریں یا اپنے جاز کیش اور ایزی پیسہ سے فوری اور محفوظ منتقلی کریں۔'
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
                {isUrdu ? 'عنوان 5: 7 دن کی سروس وارنٹی اور 24/7 خانیوال ہیلپ لائن' : 'Topic 5: 7-Day Service Warranty & Dedicated Local Support'}
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {isUrdu
                  ? 'تمام ہوم ریپیرنگ سروسز پر 7 دن کی فری فالٹ ری-وزٹ وارنٹی۔ کسی بھی شکایت یا مدد کی صورت میں خانیوال ایڈمن واٹس ایپ پر 24/7 فوری رابطہ۔'
                  : 'Every completed home repair comes with a 7-day fault warranty backed by our local Khanewal customer helpline.'}
              </p>
            </div>
          </div>

          {/* TOPIC 6 (PARTNER ONBOARDING) */}
          <div className="bg-gradient-to-br from-[#1a1810] to-[#0f1118] border border-amber-500/40 rounded-3xl p-6 transition-all shadow-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs font-bold text-amber-400 bg-amber-950 px-2.5 py-1 rounded-lg border border-amber-500/40 inline-block">
                {isUrdu ? 'کاریگروں اور ڈرائیورز کے لیے' : 'For Local Workers & Drivers'}
              </span>
              <h3 className="text-base font-extrabold text-white">
                {isUrdu ? 'خانیوال کنیکٹ پارٹنر بنیں اور روزگار کمائیں' : 'Earn with Khanewal Connect'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isUrdu
                  ? 'اگر آپ ماہر الیکٹریشن، پلمبر، بائیک رائیڈر یا لوڈر گاڑی کے مالک ہیں، تو براہِ راست ایڈمن واٹس ایپ پر تصدیق کروائیں اور روزانہ آرڈرز حاصل کریں۔'
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
              <span>{isUrdu ? 'ایڈمن واٹس ایپ پر رجسٹریشن' : 'WhatsApp Admin Onboarding'}</span>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
};
