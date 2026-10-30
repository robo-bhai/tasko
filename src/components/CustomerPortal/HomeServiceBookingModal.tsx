import React, { useState, useEffect } from 'react';
import { User, OrderPricing, HomeServiceDetails, HomeServiceItem } from '../../types';
import { 
  X, 
  Wrench, 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  ShieldAlert, 
  ArrowRight,
  Fan,
  Zap,
  Sparkles,
  Cpu,
  Hammer
} from 'lucide-react';

interface HomeServiceBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  services: HomeServiceItem[];
  preselectedServiceId?: string;
  onProceedToCheckout: (payload: {
    category: 'home_services';
    serviceDetails: HomeServiceDetails;
    pricing: OrderPricing;
    deliveryAddress: string;
  }) => void;
}

export const HomeServiceBookingModal: React.FC<HomeServiceBookingModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  services,
  preselectedServiceId,
  onProceedToCheckout
}) => {
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    preselectedServiceId || services[0]?.id || 'srv-ac-repair'
  );
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [customDescription, setCustomDescription] = useState('');
  const [scheduledDate, setScheduledDate] = useState('Today (Immediate)');
  const [scheduledTimeSlot, setScheduledTimeSlot] = useState('10:00 AM - 01:00 PM');
  const [serviceAddress, setServiceAddress] = useState(currentUser?.address || 'House 14, Street 3, Peoples Colony, Khanewal');

  useEffect(() => {
    if (preselectedServiceId) {
      setSelectedServiceId(preselectedServiceId);
      const srv = services.find(s => s.id === preselectedServiceId);
      if (srv && srv.popularIssues.length > 0) {
        setSelectedIssues([srv.popularIssues[0]]);
      }
    } else if (services.length > 0 && selectedIssues.length === 0) {
      setSelectedIssues([services[0].popularIssues[0]]);
    }
  }, [preselectedServiceId, services]);

  if (!isOpen) return null;

  const activeService = services.find(s => s.id === selectedServiceId) || services[0];

  const handleToggleIssue = (issue: string) => {
    if (selectedIssues.includes(issue)) {
      setSelectedIssues(selectedIssues.filter(i => i !== issue));
    } else {
      setSelectedIssues([...selectedIssues, issue]);
    }
  };

  const basePrice = activeService ? activeService.basePrice : 1500;
  const toolAndEquipmentFee = 350;
  const platformFee = 150;
  const total = basePrice + toolAndEquipmentFee + platformFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceAddress.trim()) {
      alert('Please enter the service location address.');
      return;
    }

    const pricing: OrderPricing = {
      baseFee: basePrice,
      serviceOrDeliveryFee: toolAndEquipmentFee,
      itemOrDistanceBudget: 0,
      helperFee: 0,
      platformFee,
      total
    };

    const serviceDetails: HomeServiceDetails = {
      serviceId: activeService.id,
      serviceName: activeService.name,
      category: activeService.category,
      issueDescription: customDescription.trim() || selectedIssues.join(', ') || 'Inspection and maintenance',
      selectedIssues,
      scheduledDate,
      scheduledTimeSlot,
      serviceAddress: serviceAddress.trim()
    };

    onProceedToCheckout({
      category: 'home_services',
      serviceDetails,
      pricing,
      deliveryAddress: serviceAddress.trim()
    });
  };

  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'Fan': return <Fan className="w-4 h-4 text-blue-600" />;
      case 'Zap': return <Zap className="w-4 h-4 text-amber-500" />;
      case 'Wrench': return <Wrench className="w-4 h-4 text-emerald-600" />;
      case 'Sparkles': return <Sparkles className="w-4 h-4 text-purple-600" />;
      case 'Cpu': return <Cpu className="w-4 h-4 text-cyan-600" />;
      default: return <Hammer className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-[#0e1017] text-white rounded-2xl sm:rounded-3xl max-w-2xl w-full shadow-2xl border border-amber-500/30 overflow-hidden my-auto max-h-[94vh] sm:max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-3.5 py-3 sm:px-6 sm:py-4 bg-[#08090f] text-white flex items-center justify-between border-b border-amber-500/20 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
              <Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h3 className="text-xs sm:text-base font-bold text-white leading-tight">
                  بک اے ٹیکنیشن (Book a Technician)
                </h3>
                <span className="text-[9px] sm:text-[10px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-1.5 py-0.5 rounded-full">
                  خانیوال لوکل
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 line-clamp-1">
                تصدیق شدہ کاریگر برائے خانیوال شہر و قریبی علاقے
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors hover:bg-slate-800"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          {/* Scrollable Form Body */}
          <div className="p-3 sm:p-5 overflow-y-auto flex-1 space-y-3 sm:space-y-4 text-xs">
            {/* Service Picker */}
            <div>
              <label className="block text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 sm:mb-2">
                1. سروس کا انتخاب کریں (Select Domain) *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
                {services.map((srv) => (
                  <button
                    type="button"
                    key={srv.id}
                    onClick={() => {
                      setSelectedServiceId(srv.id);
                      if (srv.popularIssues.length > 0) {
                        setSelectedIssues([srv.popularIssues[0]]);
                      }
                    }}
                    className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                      selectedServiceId === srv.id
                        ? 'border-amber-400 bg-amber-950/40 shadow-xs ring-1 ring-amber-400/60'
                        : 'border-slate-800 hover:border-slate-700 bg-[#12141e]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="p-1 rounded-md bg-slate-900 border border-slate-700">
                        {getServiceIcon(srv.icon)}
                      </div>
                      {selectedServiceId === srv.id && (
                        <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                      )}
                    </div>
                    <div className="mt-1.5">
                      <p className="font-bold text-white text-[11px] sm:text-xs leading-tight line-clamp-1">{srv.name}</p>
                      <p className="font-mono text-[10px] sm:text-[11px] text-amber-400 font-semibold mt-0.5">
                        PKR {srv.basePrice.toLocaleString()}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Issue Checklist */}
            {activeService && (
              <div className="p-3 sm:p-4 rounded-xl bg-[#12141e] border border-slate-800 space-y-2 sm:space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider">
                    2. مسئلہ منتخب کریں (Common Issues)
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-amber-400 font-mono">{activeService.estimatedDuration}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {activeService.popularIssues.map((issue, idx) => {
                    const isChecked = selectedIssues.includes(issue);
                    return (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => handleToggleIssue(issue)}
                        className={`text-[10px] sm:text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors cursor-pointer ${
                          isChecked
                            ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold'
                            : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                        }`}
                      >
                        {issue}
                      </button>
                    );
                  })}
                </div>

                <div>
                  <input
                    type="text"
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    placeholder="یا اپنے مسئلے کی مزید تفصیل لکھیں (مثلاً: بریکر بار بار ٹرپ ہو رہا ہے)..."
                    className="w-full text-[11px] sm:text-xs rounded-lg border border-slate-700 px-3 py-1.5 sm:py-2 bg-slate-900 text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
                  />
                </div>
              </div>
            )}

            {/* Date and Time Slot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  تاریخ و دن (Preferred Date) *
                </label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5 sm:top-3" />
                  <select
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full text-xs sm:text-sm rounded-xl border border-slate-700 pl-8 pr-3 py-2 sm:py-2.5 bg-slate-900 text-white font-medium focus:outline-hidden focus:border-amber-400 cursor-pointer"
                  >
                    <option value="Today (Immediate)" className="bg-slate-900 text-white">آج ہی (فوری 30-45 منٹ میں)</option>
                    <option value="Tomorrow Morning" className="bg-slate-900 text-white">کل صبح (Morning)</option>
                    <option value="Tomorrow Afternoon" className="bg-slate-900 text-white">کل دوپہر (Afternoon)</option>
                    <option value="This Weekend (Saturday)" className="bg-slate-900 text-white">ہفتہ / اتوار (Weekend)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  پہنچنے کا وقت (Time Slot) *
                </label>
                <div className="relative">
                  <Clock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5 sm:top-3" />
                  <select
                    value={scheduledTimeSlot}
                    onChange={(e) => setScheduledTimeSlot(e.target.value)}
                    className="w-full text-xs sm:text-sm rounded-xl border border-slate-700 pl-8 pr-3 py-2 sm:py-2.5 bg-slate-900 text-white font-medium focus:outline-hidden focus:border-amber-400 cursor-pointer"
                  >
                    <option value="Immediate Urgent Dispatch" className="bg-slate-900 text-white">فوری ارجنٹ ڈسپیچ (Immediate)</option>
                    <option value="10:00 AM - 01:00 PM" className="bg-slate-900 text-white">10:00 AM - 01:00 PM (صبح)</option>
                    <option value="01:00 PM - 04:00 PM" className="bg-slate-900 text-white">01:00 PM - 04:00 PM (دوپہر)</option>
                    <option value="04:00 PM - 07:00 PM" className="bg-slate-900 text-white">04:00 PM - 07:00 PM (شام)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Service Address in Khanewal */}
            <div>
              <label className="block text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                خانیوال میں کام کا پتہ (Service Location Address) *
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-amber-400 absolute left-3 top-2.5 sm:top-3" />
                <input
                  type="text"
                  required
                  value={serviceAddress}
                  onChange={(e) => setServiceAddress(e.target.value)}
                  placeholder="مکان یا دکان نمبر، گلی نمبر، محلہ/کالونی، خانیوال"
                  className="w-full text-xs sm:text-sm rounded-xl border border-slate-700 pl-8 pr-3 py-2 sm:py-2.5 bg-slate-900 text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
                />
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="rounded-xl bg-[#12141e] border border-amber-500/20 p-3 sm:p-3.5 space-y-1.5 text-[11px] sm:text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>{activeService?.name || 'Service'} وزٹ و بنیادی مزدوری</span>
                <span className="font-mono font-semibold text-white">PKR {basePrice.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>معائنہ کٹ و ٹول چارجز</span>
                <span className="font-mono font-semibold text-white">PKR {toolAndEquipmentFee}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>7 روزہ خانیوال کنیکٹ گارنٹی</span>
                <span className="font-mono font-semibold text-white">PKR {platformFee}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between font-bold text-white text-xs sm:text-sm">
                <span>کل تخمینہ رقم (Total)</span>
                <span className="font-mono text-amber-400 text-sm sm:text-base">PKR {total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Sticky Modal Action Footer */}
          <div className="px-3.5 py-2.5 sm:px-6 sm:py-3.5 bg-[#08090f] border-t border-slate-800 flex items-center justify-end gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3 sm:px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              منسوخ (Cancel)
            </button>
            <button
              type="submit"
              className="px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>چیک آؤٹ پر جائیں</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
