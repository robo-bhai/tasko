import React from 'react';
import { 
  Order, 
  HomeServiceItem, 
  TransportVehicleItem 
} from '../../types';
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
  Briefcase,
  CheckCircle2,
  Headphones,
  PhoneCall
} from 'lucide-react';

interface CustomerHomeProps {
  onOpenOrderModal: (category: 'custom_delivery' | 'home_services' | 'transport_cargo', preselectedId?: string) => void;
  onOpenLiveTracker: (order?: Order) => void;
  onOpenAuth: (tab?: 'login' | 'customer_signup' | 'provider_signup', notice?: string) => void;
  activeOrders: Order[];
  services: HomeServiceItem[];
  vehicles: TransportVehicleItem[];
  lang: Language;
}

export const CustomerHome: React.FC<CustomerHomeProps> = ({
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

  const latestActiveOrder = activeOrders.find(
    o => o.status !== 'completed' && o.status !== 'cancelled'
  );

  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'Fan': return <Fan className="w-5 h-5 text-blue-600" />;
      case 'Zap': return <Zap className="w-5 h-5 text-amber-500" />;
      case 'Wrench': return <Wrench className="w-5 h-5 text-emerald-600" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-purple-600" />;
      case 'Cpu': return <Cpu className="w-5 h-5 text-cyan-600" />;
      default: return <Hammer className="w-5 h-5 text-slate-600" />;
    }
  };

  // Pakistani Urdu translations helper for service items
  const getServiceName = (srv: HomeServiceItem) => {
    if (!isUrdu) return srv.name;
    if (srv.id === 'srv-ac-repair') return 'اے سی ماسٹر کیمیکل سروس اور ریپیرنگ';
    if (srv.id === 'srv-electrician') return 'مصدقہ الیکٹریشن اور وائرنگ فالٹ';
    if (srv.id === 'srv-plumbing') return 'ایمرجنسی پلمبنگ اور سینیٹری سروس';
    if (srv.id === 'srv-cleaning') return 'صوفہ، کارپٹ اور گھر کی گہری صفائی';
    if (srv.id === 'srv-appliances') return 'فریج، واشنگ مشین اور مائیکروویو مرمت';
    if (srv.id === 'srv-carpentry') return 'کارپینٹر، الماری اور تالہ مرمت';
    return srv.name;
  };

  const getVehicleName = (veh: TransportVehicleItem) => {
    if (!isUrdu) return veh.name;
    if (veh.id === 'veh-loader-rickshaw') return 'لوڈر رکشہ (وزن: 400 کلوگرام)';
    if (veh.id === 'veh-suzuki-ravi') return 'سوزوکی راوی پک اپ (وزن: 800 کلوگرام)';
    if (veh.id === 'veh-shehzore-truck') return 'ہنڈائی شاہ زور ٹرک (وزن: 1200 کلوگرام)';
    if (veh.id === 'veh-isuzu-forward') return 'ماسٹر / اسوزو 3 ٹن ہیوی ٹرک';
    return veh.name;
  };

  return (
    <div className={`space-y-10 pb-16 ${isUrdu ? 'rtl' : 'ltr'}`}>
      {/* Active Order Live Banner if any order is currently in-progress */}
      {latestActiveOrder && (
        <section className="bg-gradient-to-r from-blue-900 to-slate-900 text-white rounded-2xl p-5 md:p-6 shadow-md border border-blue-800/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs uppercase tracking-wider font-semibold text-blue-300">
                  {isUrdu ? 'فعال آرڈر جاری ہے' : 'Active Order In Progress'}
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="font-mono text-xs text-slate-300 font-semibold">{latestActiveOrder.id}</span>
              </div>
              <h3 className="text-lg md:text-xl font-bold tracking-tight">
                {latestActiveOrder.category === 'custom_delivery' && (isUrdu ? 'کسٹم اسٹور ڈیلیوری جاری ہے' : 'Custom Store Delivery is Active')}
                {latestActiveOrder.category === 'home_services' && `${latestActiveOrder.serviceDetails?.serviceName || 'Home Service'} ${isUrdu ? 'جاری ہے' : 'in Progress'}`}
                {latestActiveOrder.category === 'transport_cargo' && `${latestActiveOrder.transportDetails?.vehicleName || 'Cargo Vehicle'} ${isUrdu ? 'بکنگ فعال ہے' : 'Booking Active'}`}
              </h3>
              <p className="text-sm text-slate-300 line-clamp-1">
                {latestActiveOrder.timeline[latestActiveOrder.timeline.length - 1]?.label || (isUrdu ? 'ٹیکنیشن یا ڈرائیور روانہ ہو چکا ہے' : 'Technician / Driver dispatched')}
                {latestActiveOrder.assignedProviderName && ` · ${isUrdu ? 'تفویض شدہ ورکر:' : 'Assigned to'} ${latestActiveOrder.assignedProviderName}`}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => onOpenLiveTracker(latestActiveOrder)}
                className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <MapPin className="w-4 h-4" />
                <span>{t.trackOrder}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Hero Showcase with Clean Split */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[390px] lg:items-stretch">
          <div className="lg:col-span-7 p-8 md:p-12 flex flex-col justify-center space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-400 bg-blue-950/80 border border-blue-800/40 px-3 py-1 rounded-full w-fit">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>{t.heroBadge}</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              {t.heroTitle}
            </h1>

            <p className="text-sm md:text-base text-slate-300 max-w-xl leading-relaxed">
              {t.heroSubtitle}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onOpenOrderModal('custom_delivery')}
                className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs md:text-sm font-bold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{t.catDeliveryBtn}</span>
              </button>
              <button
                onClick={() => onOpenOrderModal('home_services')}
                className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs md:text-sm font-semibold rounded-xl transition-all border border-slate-700 flex items-center gap-2 cursor-pointer"
              >
                <Wrench className="w-4 h-4 text-emerald-400" />
                <span>{t.catServicesBtn}</span>
              </button>
              <button
                onClick={() => onOpenOrderModal('transport_cargo')}
                className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs md:text-sm font-semibold rounded-xl transition-all border border-slate-700 flex items-center gap-2 cursor-pointer"
              >
                <Truck className="w-4 h-4 text-amber-400" />
                <span>{t.catTransportBtn}</span>
              </button>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-slate-400 border-t border-slate-800/80">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{isUrdu ? '100% تصدیق شدہ ورکرز' : '100% Verified Providers'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-400" />
                <span>{isUrdu ? 'فوری اور بروقت ترسیل' : 'Under 45-Min Dispatch'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <BadgePercent className="w-4 h-4 text-amber-400" />
                <span>{isUrdu ? 'کیش آن ڈیلیوری اور جاز کیش/ایزی پیسہ' : 'COD & JazzCash / EasyPaisa'}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative min-h-[260px] lg:min-h-full">
            <img
              src="/src/assets/images/hero_delivery_service_1793035359071.jpg"
              alt="OmniServe On-Demand Service"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=800&auto=format&fit=crop&q=80';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent lg:bg-gradient-to-r lg:from-slate-900 lg:to-transparent" />
          </div>
        </div>
      </section>

      {/* 3 Core Category Action Pillars */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
            {isUrdu ? 'بنیادی سروس کیٹیگری کا انتخاب کریں' : 'Choose a Primary Service Category'}
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            {isUrdu ? 'شفاف پیشگی ریٹ، تصدیق شدہ ورکرز اور لائیو ٹریکنگ کے ساتھ' : 'Instant on-demand fulfillment with upfront estimates and live GPS dispatch'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Custom Delivery */}
          <div 
            onClick={() => onOpenOrderModal('custom_delivery')}
            className="group cursor-pointer rounded-3xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                  {t.catDeliveryBadge}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1 group-hover:text-blue-600 transition-colors">
                  {t.catDeliveryTitle}
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  {t.catDeliveryDesc}
                </p>
              </div>

              <div className="pt-2 text-xs text-slate-600 space-y-1.5 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span>{isUrdu ? 'بنیادی رائیڈر فیس' : 'Rider Base Delivery Fee'}</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {isUrdu ? '200 روپے سے' : 'from PKR 200'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{isUrdu ? 'اوسط خریداری وقت' : 'Average Pickup Time'}</span>
                  <span className="font-semibold text-slate-700">{isUrdu ? '15 تا 30 منٹ' : '15 - 30 mins'}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
              <span>{t.catDeliveryBtn}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Home Services */}
          <div 
            onClick={() => onOpenOrderModal('home_services')}
            className="group cursor-pointer rounded-3xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Wrench className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
                  {t.catServicesBadge}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1 group-hover:text-emerald-600 transition-colors">
                  {t.catServicesTitle}
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  {t.catServicesDesc}
                </p>
              </div>

              <div className="pt-2 text-xs text-slate-600 space-y-1.5 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span>{isUrdu ? 'ماہر ٹیکنیشن وزٹ فیس' : 'Certified Tech Visit'}</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {isUrdu ? '1,200 روپے سے' : 'from PKR 1,200'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{isUrdu ? 'وارنٹی اور کسٹمر سپورٹ' : 'Warranty & Support'}</span>
                  <span className="font-semibold text-emerald-700">{isUrdu ? '7 دن کی وارنٹی' : '7-Day Guarantee'}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-600">
              <span>{t.catServicesBtn}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Transport & Cargo */}
          <div 
            onClick={() => onOpenOrderModal('transport_cargo')}
            className="group cursor-pointer rounded-3xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                  {t.catTransportBadge}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1 group-hover:text-indigo-600 transition-colors">
                  {t.catTransportTitle}
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  {t.catTransportDesc}
                </p>
              </div>

              <div className="pt-2 text-xs text-slate-600 space-y-1.5 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span>{isUrdu ? 'ابتدائی بنیادی کرایہ' : 'Vehicle Base Starting Fare'}</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {isUrdu ? '650 روپے سے' : 'from PKR 650'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{isUrdu ? 'لوڈ صلاحیت' : 'Payload Capacity'}</span>
                  <span className="font-semibold text-slate-700">{isUrdu ? '400 تا 3000 کلوگرام' : '400kg - 3,000kg'}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
              <span>{t.catTransportBtn}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Service Catalog Quick Picks */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
              {t.featuredServicesTitle}
            </h2>
            <p className="text-xs md:text-sm text-slate-500">
              {t.featuredServicesSub}
            </p>
          </div>
          <button
            onClick={() => onOpenOrderModal('home_services')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            <span>{isUrdu ? 'تمام سروسز دیکھیں' : 'View All Services'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((srv) => (
            <div
              key={srv.id}
              onClick={() => onOpenOrderModal('home_services', srv.id)}
              className="cursor-pointer bg-white border border-slate-200 rounded-2xl p-5 hover:border-blue-400 hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    {getServiceIcon(srv.icon)}
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">
                      {isUrdu ? 'ابتدائی ریٹ' : 'Starting at'}
                    </span>
                    <p className="font-bold text-slate-900 font-mono text-sm">
                      {isUrdu ? `${srv.basePrice.toLocaleString()} روپے` : `PKR ${srv.basePrice.toLocaleString()}`}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{getServiceName(srv)}</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{srv.description}</p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {srv.popularIssues.slice(0, 2).map((issue, i) => (
                    <span key={i} className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                      {issue}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{srv.estimatedDuration}</span>
                </span>
                <span className="font-bold text-blue-600">
                  {isUrdu ? 'بک کریں ←' : 'Book Slot →'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Transport Fleet Preview Section */}
      <section className="bg-slate-100/70 border border-slate-200 rounded-3xl p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
              {t.vehiclesTitle}
            </h2>
            <p className="text-xs md:text-sm text-slate-500">
              {t.vehiclesSub}
            </p>
          </div>
          <button
            onClick={() => onOpenOrderModal('transport_cargo')}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors whitespace-nowrap w-fit cursor-pointer"
          >
            {t.catTransportBtn}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {vehicles.map((veh) => (
            <div
              key={veh.id}
              onClick={() => onOpenOrderModal('transport_cargo', veh.id)}
              className="cursor-pointer bg-white rounded-2xl p-4 border border-slate-200 hover:border-indigo-400 hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                    {isUrdu ? `زیادہ سے زیادہ ${veh.capacityKg} کلو` : `Max ${veh.capacityKg} kg`}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-900">
                    {isUrdu ? `${veh.baseFare} روپے` : `PKR ${veh.baseFare}`}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-xs md:text-sm">{getVehicleName(veh)}</h4>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">{veh.dimensions}</p>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2">
                  {veh.bestFor}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                <span>{isUrdu ? `${veh.perKmRate} روپے / کلومیٹر` : `PKR ${veh.perKmRate}/km`}</span>
                <span className="font-bold text-indigo-600">
                  {isUrdu ? 'انتخاب کریں' : 'Select Vehicle'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Become a Partner / Driver Callout Banner */}
      <section className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-6 md:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 bg-emerald-700/60 text-emerald-200 text-xs font-bold px-3 py-1 rounded-full border border-emerald-600/40">
            <Briefcase className="w-3.5 h-3.5" />
            <span>{isUrdu ? 'باعزت روزگار کا موقع' : 'Partner Opportunity'}</span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold">
            {isUrdu ? 'کیا آپ رائیڈر، الیکٹریشن، اے سی ٹیکنیشن یا ڈرائیور ہیں؟' : 'Are you a Technician, Courier Rider, or Cargo Driver?'}
          </h3>
          <p className="text-xs md:text-sm text-emerald-100 leading-relaxed">
            {isUrdu 
              ? 'اومنی سروس کے ساتھ رجسٹر ہوں اور اپنے شہر میں روزانہ آرڈرز حاصل کر کے اپنی آمدنی بڑھائیں۔ فوری رجسٹریشن اور آسان موبائل کنٹرول۔'
              : 'Join OmniServe today and start receiving customer requests directly in your local area with guaranteed fast payouts.'}
          </p>
        </div>

        <button
          onClick={() => onOpenAuth('provider_signup')}
          className="px-6 py-3 bg-white text-emerald-900 hover:bg-emerald-50 text-xs md:text-sm font-extrabold rounded-2xl shadow-md transition-colors shrink-0 cursor-pointer"
        >
          {isUrdu ? 'بطور ورکر / ڈرائیور رجسٹر ہوں' : 'Register as Service Partner'}
        </button>
      </section>

      {/* Trust & Guarantee Badges */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-start gap-3">
          <ShieldCheck className="w-8 h-8 text-blue-600 shrink-0" />
          <div>
            <h4 className="font-bold text-xs text-slate-900">{t.trustSafePay}</h4>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{t.trustSafePayDesc}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-start gap-3">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
          <div>
            <h4 className="font-bold text-xs text-slate-900">{t.trustVerified}</h4>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{t.trustVerifiedDesc}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-start gap-3">
          <MapPin className="w-8 h-8 text-amber-600 shrink-0" />
          <div>
            <h4 className="font-bold text-xs text-slate-900">{t.trustInstant}</h4>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{t.trustInstantDesc}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-start gap-3">
          <Headphones className="w-8 h-8 text-purple-600 shrink-0" />
          <div>
            <h4 className="font-bold text-xs text-slate-900">{t.trustSupport}</h4>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{t.trustSupportDesc}</p>
          </div>
        </div>
      </section>
    </div>
  );
};
