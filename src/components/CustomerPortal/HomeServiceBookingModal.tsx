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
  const [serviceAddress, setServiceAddress] = useState(currentUser?.address || 'House 42, Street 7, Sector F-8/2, Islamabad');

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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Book a Home Service / Technician</h3>
              <p className="text-xs text-slate-300">Certified local professionals with verified background & warranty</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Service Picker Carousel/Grid */}
          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Select Service Domain *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
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
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    selectedServiceId === srv.id
                      ? 'border-emerald-600 bg-emerald-50/70 shadow-xs ring-1 ring-emerald-600'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="p-1.5 rounded-md bg-white border border-slate-200 shadow-2xs">
                      {getServiceIcon(srv.icon)}
                    </div>
                    {selectedServiceId === srv.id && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                  </div>
                  <div className="mt-2">
                    <p className="font-bold text-slate-900 text-xs leading-tight">{srv.name}</p>
                    <p className="font-mono text-[11px] text-emerald-700 font-semibold mt-1">
                      PKR {srv.basePrice.toLocaleString()}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Issue Checklist */}
          {activeService && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Select Issue / Required Work
                </span>
                <span className="text-[11px] text-slate-500">{activeService.estimatedDuration}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeService.popularIssues.map((issue, idx) => {
                  const isChecked = selectedIssues.includes(issue);
                  return (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => handleToggleIssue(issue)}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                        isChecked
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
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
                  placeholder="Or describe the specific problem in detail (e.g. AC makes rattling sound after 15 mins)..."
                  className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>
            </div>
          )}

          {/* Date and Time Slot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                Preferred Date *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <select
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 pl-9 pr-3 py-2.5 bg-white font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                >
                  <option value="Today (Immediate)">Today (Within 60-90 mins)</option>
                  <option value="Tomorrow Morning">Tomorrow Morning</option>
                  <option value="Tomorrow Afternoon">Tomorrow Afternoon</option>
                  <option value="This Weekend (Saturday)">This Weekend (Saturday)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                Arrival Time Window *
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <select
                  value={scheduledTimeSlot}
                  onChange={(e) => setScheduledTimeSlot(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 pl-9 pr-3 py-2.5 bg-white font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                >
                  <option value="10:00 AM - 01:00 PM">10:00 AM - 01:00 PM (Morning)</option>
                  <option value="01:00 PM - 04:00 PM">01:00 PM - 04:00 PM (Afternoon)</option>
                  <option value="04:00 PM - 07:00 PM">04:00 PM - 07:00 PM (Evening)</option>
                  <option value="Immediate Urgent Dispatch">Immediate Urgent Dispatch</option>
                </select>
              </div>
            </div>
          </div>

          {/* Service Address */}
          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
              Service Address (Technician Destination) *
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-emerald-600 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={serviceAddress}
                onChange={(e) => setServiceAddress(e.target.value)}
                placeholder="House / Flat #, Street #, Sector / Area, City"
                className="w-full text-xs rounded-xl border border-slate-300 pl-9 pr-3 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span>{activeService?.name || 'Service'} Standard Labor & Visit</span>
              <span className="font-mono font-semibold">PKR {basePrice.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Diagnostic Kit & Standard Chemical/Parts Allowance</span>
              <span className="font-mono font-semibold">PKR {toolAndEquipmentFee}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Service Warranty & Platform Guarantee (7 Days)</span>
              <span className="font-mono font-semibold">PKR {platformFee}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm font-bold text-slate-900">
              <span>Total Estimated Service Fee</span>
              <span className="font-mono text-base text-emerald-600">PKR {total.toLocaleString()}</span>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-md transition-colors flex items-center gap-2"
            >
              <span>Proceed to Payment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
