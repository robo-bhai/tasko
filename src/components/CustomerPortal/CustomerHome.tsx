import React from 'react';
import { 
  Order, 
  HomeServiceItem, 
  TransportVehicleItem 
} from '../../types';
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
  BadgePercent
} from 'lucide-react';

interface CustomerHomeProps {
  onOpenOrderModal: (category: 'custom_delivery' | 'home_services' | 'transport_cargo', preselectedId?: string) => void;
  onOpenLiveTracker: (order?: Order) => void;
  activeOrders: Order[];
  services: HomeServiceItem[];
  vehicles: TransportVehicleItem[];
}

export const CustomerHome: React.FC<CustomerHomeProps> = ({
  onOpenOrderModal,
  onOpenLiveTracker,
  activeOrders,
  services,
  vehicles
}) => {
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

  return (
    <div className="space-y-10 pb-16">
      {/* Active Order Live Banner if any order is currently in-progress */}
      {latestActiveOrder && (
        <section className="bg-gradient-to-r from-blue-900 to-slate-900 text-white rounded-2xl p-5 md:p-6 shadow-md border border-blue-800/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs uppercase tracking-wider font-semibold text-blue-300">
                  Active Order In Progress
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="font-mono text-xs text-slate-300 font-semibold">{latestActiveOrder.id}</span>
              </div>
              <h3 className="text-lg md:text-xl font-bold tracking-tight">
                {latestActiveOrder.category === 'custom_delivery' && 'Custom Store Delivery is Active'}
                {latestActiveOrder.category === 'home_services' && `${latestActiveOrder.serviceDetails?.serviceName || 'Home Service'} in Progress`}
                {latestActiveOrder.category === 'transport_cargo' && `${latestActiveOrder.transportDetails?.vehicleName || 'Cargo Vehicle'} Booking Active`}
              </h3>
              <p className="text-sm text-slate-300 line-clamp-1">
                {latestActiveOrder.timeline[latestActiveOrder.timeline.length - 1]?.label || 'Technician / Driver dispatched'}
                {latestActiveOrder.assignedProviderName && ` · Assigned to ${latestActiveOrder.assignedProviderName}`}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => onOpenLiveTracker(latestActiveOrder)}
                className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap"
              >
                <MapPin className="w-4 h-4" />
                <span>Open Live Tracker</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Hero Showcase with Clean 2-Column Split */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-white border border-slate-800">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[380px] lg:items-stretch">
          <div className="lg:col-span-7 p-8 md:p-12 flex flex-col justify-center space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-400 bg-blue-950/80 border border-blue-800/40 px-3 py-1 rounded-full w-fit">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>One Platform · Unlimited Deliveries & Services</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Buy Anything, Book Any Technician, or Rent Cargo Trucks.
            </h1>

            <p className="text-base text-slate-300 max-w-xl leading-relaxed">
              From pharmacy pickups and dinner takeout to master AC repairs and 1-ton cargo shifting — OmniServe connects you directly with verified neighborhood couriers, certified technicians, and drivers.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onOpenOrderModal('custom_delivery')}
                className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs md:text-sm font-semibold rounded-xl transition-all shadow-md flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Order Custom Item</span>
              </button>
              <button
                onClick={() => onOpenOrderModal('home_services')}
                className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs md:text-sm font-semibold rounded-xl transition-all border border-slate-700 flex items-center gap-2"
              >
                <Wrench className="w-4 h-4" />
                <span>Book Technician</span>
              </button>
              <button
                onClick={() => onOpenOrderModal('transport_cargo')}
                className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs md:text-sm font-semibold rounded-xl transition-all border border-slate-700 flex items-center gap-2"
              >
                <Truck className="w-4 h-4" />
                <span>Hire Cargo Van</span>
              </button>
            </div>

            <div className="pt-2 flex items-center gap-6 text-xs text-slate-400 border-t border-slate-800/80">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% Verified Providers</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-400" />
                <span>Under 45-Min Dispatch</span>
              </div>
              <div className="flex items-center gap-1.5">
                <BadgePercent className="w-4 h-4 text-amber-400" />
                <span>COD & JazzCash/EasyPaisa</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative min-h-[260px] lg:min-h-full">
            <img
              src="/src/assets/images/hero_delivery_service_1793035359071.jpg"
              alt="OmniServe On-Demand Courier"
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
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
              Choose a Service Category
            </h2>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">
              Instant on-demand fulfillment with upfront estimates and live GPS dispatch
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Custom Delivery */}
          <div 
            onClick={() => onOpenOrderModal('custom_delivery')}
            className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
                  Category 01 · Buy & Deliver
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1 group-hover:text-blue-600 transition-colors">
                  Order Anything from Any Shop
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Name the items, specify the bakery, pharmacy, hardware store, or restaurant, and a courier will purchase and bring it directly to your address.
                </p>
              </div>

              <div className="pt-2 text-xs text-slate-600 space-y-1">
                <div className="flex items-center justify-between">
                  <span>Courier Base Delivery Fee</span>
                  <span className="font-bold text-slate-900 font-mono">from PKR 200</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Average Pickup Time</span>
                  <span className="font-semibold text-slate-700">15 - 30 mins</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600">
              <span>Create Custom Request</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Home Services */}
          <div 
            onClick={() => onOpenOrderModal('home_services')}
            className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Wrench className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">
                  Category 02 · Expert Help
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1 group-hover:text-emerald-600 transition-colors">
                  Book On-Demand Home Services
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Professional AC master wash, skilled electricians, emergency plumbers, deep house cleaning, and home appliance doctors with guaranteed satisfaction.
                </p>
              </div>

              <div className="pt-2 text-xs text-slate-600 space-y-1">
                <div className="flex items-center justify-between">
                  <span>Certified Professional Visit</span>
                  <span className="font-bold text-slate-900 font-mono">from PKR 1,200</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Warranty & Support</span>
                  <span className="font-semibold text-slate-700">7-Day Guarantee</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-600">
              <span>Explore & Book Service</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Transport & Cargo */}
          <div 
            onClick={() => onOpenOrderModal('transport_cargo')}
            className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">
                  Category 03 · Logistics & Moves
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1 group-hover:text-indigo-600 transition-colors">
                  Rent Transport & Cargo Vehicles
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Book Loader Rickshaws, Suzuki Bolan Pickups, 1-Ton Shehzore Vans, and 14-Foot Flatbed Trucks for shifting goods, furniture, or heavy freight with helper labor.
                </p>
              </div>

              <div className="pt-2 text-xs text-slate-600 space-y-1">
                <div className="flex items-center justify-between">
                  <span>Vehicle Base Starting Fare</span>
                  <span className="font-bold text-slate-900 font-mono">from PKR 650</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Payload Capacity</span>
                  <span className="font-semibold text-slate-700">350kg - 4,500kg</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600">
              <span>Choose Vehicle & Route</span>
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
              Popular Home Services
            </h2>
            <p className="text-xs md:text-sm text-slate-500">
              Fixed rate inspections and certified professionals at your doorstep
            </p>
          </div>
          <button
            onClick={() => onOpenOrderModal('home_services')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View All Services</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((srv) => (
            <div
              key={srv.id}
              onClick={() => onOpenOrderModal('home_services', srv.id)}
              className="cursor-pointer bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    {getServiceIcon(srv.icon)}
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Starting at</span>
                    <p className="font-bold text-slate-900 font-mono text-sm">PKR {srv.basePrice.toLocaleString()}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{srv.name}</h4>
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
                <span className="font-semibold text-blue-600">Book Slot →</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Transport Fleet Preview Section */}
      <section className="bg-slate-100/70 border border-slate-200 rounded-2xl p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
              Cargo & Transport Fleet
            </h2>
            <p className="text-xs md:text-sm text-slate-500">
              Select the right capacity vehicle for apartment moves, retail cargo, or heavy freight
            </p>
          </div>
          <button
            onClick={() => onOpenOrderModal('transport_cargo')}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap w-fit"
          >
            Book Transport Now
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {vehicles.map((veh) => (
            <div
              key={veh.id}
              onClick={() => onOpenOrderModal('transport_cargo', veh.id)}
              className="cursor-pointer bg-white rounded-xl p-4 border border-slate-200 hover:border-indigo-400 hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    Max {veh.capacityKg} kg
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-900">
                    PKR {veh.baseFare}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-xs md:text-sm">{veh.name}</h4>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">{veh.dimensions}</p>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2">
                  {veh.bestFor}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                <span>PKR {veh.perKmRate}/km</span>
                <span className="font-semibold text-indigo-600">Select & Get Fare</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
