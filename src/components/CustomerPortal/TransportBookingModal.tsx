import React, { useState, useEffect } from 'react';
import { User, OrderPricing, TransportDetails, TransportVehicleItem } from '../../types';
import { 
  X, 
  Truck, 
  MapPin, 
  Users, 
  ArrowRight, 
  ShieldCheck, 
  Scale, 
  CheckCircle2,
  Navigation
} from 'lucide-react';

interface TransportBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  vehicles: TransportVehicleItem[];
  preselectedVehicleId?: string;
  onProceedToCheckout: (payload: {
    category: 'transport_cargo';
    transportDetails: TransportDetails;
    pricing: OrderPricing;
    deliveryAddress: string;
  }) => void;
}

export const TransportBookingModal: React.FC<TransportBookingModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  vehicles,
  preselectedVehicleId,
  onProceedToCheckout
}) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(
    preselectedVehicleId || vehicles[1]?.id || 'veh-mini-pickup'
  );
  const [pickupLocation, setPickupLocation] = useState('Ghalla Mandi / Railway Goods Yard, Khanewal');
  const [dropoffLocation, setDropoffLocation] = useState(currentUser?.address || 'Civil Lines, Near Circuit House, Khanewal');
  const [cargoDescription, setCargoDescription] = useState('1x Solid Wood Dining Table with 6 Chairs, 2 Mattresses');
  const [loadWeightKg, setLoadWeightKg] = useState(380);
  const [estimatedDistanceKm, setEstimatedDistanceKm] = useState(14);
  const [needsHelper, setNeedsHelper] = useState(true);
  const [helperCount, setHelperCount] = useState(1);

  useEffect(() => {
    if (preselectedVehicleId) {
      setSelectedVehicleId(preselectedVehicleId);
    }
  }, [preselectedVehicleId]);

  if (!isOpen) return null;

  const activeVehicle = vehicles.find(v => v.id === selectedVehicleId) || vehicles[0];

  const baseFare = activeVehicle ? activeVehicle.baseFare : 1200;
  const distanceFare = Math.round(estimatedDistanceKm * (activeVehicle ? activeVehicle.perKmRate : 75));
  const helperFee = needsHelper ? (activeVehicle ? activeVehicle.helperRate : 500) * helperCount : 0;
  const platformFee = 150;
  const total = baseFare + distanceFare + helperFee + platformFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupLocation.trim() || !dropoffLocation.trim() || !cargoDescription.trim()) {
      alert('Please fill out pickup, drop-off locations, and cargo description.');
      return;
    }

    const pricing: OrderPricing = {
      baseFee: baseFare,
      serviceOrDeliveryFee: distanceFare,
      itemOrDistanceBudget: 0,
      helperFee,
      platformFee,
      total
    };

    const transportDetails: TransportDetails = {
      vehicleId: activeVehicle.id,
      vehicleName: activeVehicle.name,
      pickupLocation: pickupLocation.trim(),
      dropoffLocation: dropoffLocation.trim(),
      estimatedDistanceKm,
      cargoDescription: cargoDescription.trim(),
      loadWeightKg,
      needsHelper,
      helperCount: needsHelper ? helperCount : 0
    };

    onProceedToCheckout({
      category: 'transport_cargo',
      transportDetails,
      pricing,
      deliveryAddress: dropoffLocation.trim()
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-[#0e1017] text-white rounded-2xl sm:rounded-3xl max-w-2xl w-full shadow-2xl border border-amber-500/30 overflow-hidden my-auto max-h-[94vh] sm:max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-3.5 py-3 sm:px-6 sm:py-4 bg-[#08090f] text-white flex items-center justify-between border-b border-amber-500/20 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h3 className="text-xs sm:text-base font-bold text-white leading-tight">
                  بک اے کارگو و رکشہ (Book a Cargo)
                </h3>
                <span className="text-[9px] sm:text-[10px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-1.5 py-0.5 rounded-full">
                  خانیوال فلیٹ
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 line-clamp-1">
                لوڈر رکشہ، پک اپ، اور ٹرک برائے سامان شفٹنگ و لوڈنگ
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
          <div className="p-3 sm:p-5 overflow-y-auto flex-1 space-y-3 sm:space-y-4 text-xs">
            {/* Vehicle Selection Grid */}
            <div>
              <label className="block text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                گاڑی یا رکشہ منتخب کریں (Select Vehicle) *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                {vehicles.map((veh) => {
                  const isSelected = selectedVehicleId === veh.id;
                  return (
                    <button
                      type="button"
                      key={veh.id}
                      onClick={() => setSelectedVehicleId(veh.id)}
                      className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-amber-400 bg-amber-950/40 shadow-xs ring-1 ring-amber-400/60'
                          : 'border-slate-800 hover:border-slate-700 bg-[#12141e]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white line-clamp-1">{veh.name}</span>
                        {isSelected ? (
                          <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
                        ) : (
                          <span className="text-[10px] sm:text-[11px] font-mono text-amber-400">PKR {veh.baseFare} بیس</span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-400">
                        <span className="bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded font-mono font-semibold text-slate-300">
                          وزن: {veh.capacityKg} کلو
                        </span>
                        <span>·</span>
                        <span className="font-mono text-slate-300">{veh.dimensions}</span>
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1 line-clamp-1">
                        {veh.bestFor}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pickup and Drop-off locations */}
            <div className="space-y-2.5 sm:space-y-3">
              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  پک اپ لوکیشن (Pickup Location) *
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 absolute left-3 top-2.5 sm:top-3" />
                  <input
                    type="text"
                    required
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    placeholder="جہاں سے سامان لوڈ کرنا ہے (مثلاً غلہ منڈی یا گودام)"
                    className="w-full text-xs sm:text-sm rounded-xl border border-slate-700 bg-slate-900 text-white placeholder-slate-500 pl-8 pr-3 py-2 sm:py-2.5 focus:outline-hidden focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  ڈراپ آف لوکیشن (Drop-off Address in Khanewal) *
                </label>
                <div className="relative">
                  <Navigation className="w-3.5 h-3.5 text-amber-400 absolute left-3 top-2.5 sm:top-3" />
                  <input
                    type="text"
                    required
                    value={dropoffLocation}
                    onChange={(e) => setDropoffLocation(e.target.value)}
                    placeholder="منزل کا پتہ جہاں سامان ان لوڈ کرنا ہے"
                    className="w-full text-xs sm:text-sm rounded-xl border border-slate-700 bg-slate-900 text-white placeholder-slate-500 pl-8 pr-3 py-2 sm:py-2.5 focus:outline-hidden focus:border-amber-400"
                  />
                </div>
              </div>
            </div>

            {/* Distance and Cargo Specs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider">
                    تخمینہ فاصلہ (Trip Distance)
                  </label>
                  <span className="text-xs font-mono font-bold text-amber-400">
                    {estimatedDistanceKm} km
                  </span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={80}
                  value={estimatedDistanceKm}
                  onChange={(e) => setEstimatedDistanceKm(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] sm:text-[10px] text-slate-500 font-mono mt-0.5">
                  <span>2 km</span>
                  <span>40 km</span>
                  <span>80 km</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  تخمینہ وزن (Approx Weight kg)
                </label>
                <div className="relative">
                  <Scale className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5 sm:top-3" />
                  <input
                    type="number"
                    min={10}
                    max={activeVehicle?.capacityKg || 4500}
                    value={loadWeightKg}
                    onChange={(e) => setLoadWeightKg(Number(e.target.value))}
                    className="w-full text-xs sm:text-sm font-mono font-semibold rounded-xl border border-slate-700 bg-slate-900 text-white pl-8 pr-3 py-2 sm:py-2.5 focus:outline-hidden focus:border-amber-400"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  گاڑی کی حد: {activeVehicle?.capacityKg} kg
                </span>
              </div>
            </div>

            {/* Cargo Details */}
            <div>
              <label className="block text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                سامان کی نوعیت (Cargo Description) *
              </label>
              <input
                type="text"
                required
                value={cargoDescription}
                onChange={(e) => setCargoDescription(e.target.value)}
                placeholder="مثلاً: 1 ڈبل بیڈ، 6 کارٹن، فرنیچر یا اناج کی بوریاں..."
                className="w-full text-xs sm:text-sm rounded-xl border border-slate-700 bg-slate-900 text-white placeholder-slate-500 px-3 py-2 sm:py-2.5 focus:outline-hidden focus:border-amber-400"
              />
            </div>

            {/* Helper Option */}
            <div className="p-3 sm:p-3.5 rounded-xl bg-[#12141e] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="helperCheckbox"
                  checked={needsHelper}
                  onChange={(e) => setNeedsHelper(e.target.checked)}
                  className="w-4 h-4 text-amber-500 rounded border-slate-700 bg-slate-900 focus:ring-amber-400"
                />
                <label htmlFor="helperCheckbox" className="text-xs cursor-pointer">
                  <span className="font-bold text-white block text-[11px] sm:text-xs">
                    لوڈنگ / ان لوڈنگ مزدور (Helper) شامل کریں
                  </span>
                  <span className="text-slate-400 text-[10px] sm:text-[11px]">
                    سامان چڑھانے اور اتارنے کے لیے تجربہ کار ہیلپر فراہم کیا جائے گا۔
                  </span>
                </label>
              </div>

              {needsHelper && (
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <span className="text-[11px] text-slate-400 font-medium">مزدور:</span>
                  <div className="flex items-center rounded-lg border border-slate-700 bg-slate-900">
                    <button
                      type="button"
                      onClick={() => setHelperCount(Math.max(1, helperCount - 1))}
                      className="px-2 py-0.5 text-slate-300 hover:text-white font-bold text-xs cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-2.5 py-0.5 font-mono font-bold text-xs text-amber-400">
                      {helperCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => setHelperCount(Math.min(4, helperCount + 1))}
                      className="px-2 py-0.5 text-slate-300 hover:text-white font-bold text-xs cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Transparent Rate Breakdown */}
            <div className="rounded-xl bg-[#12141e] border border-amber-500/20 p-3 sm:p-3.5 space-y-1.5 text-[11px] sm:text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>{activeVehicle?.name} بنیادی کرایہ (Base Fare)</span>
                <span className="font-mono font-semibold text-white">PKR {baseFare.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>فاصلہ کرایہ ({estimatedDistanceKm} km @ PKR {activeVehicle?.perKmRate}/km)</span>
                <span className="font-mono font-semibold text-white">PKR {distanceFare.toLocaleString()}</span>
              </div>
              {needsHelper && (
                <div className="flex items-center justify-between text-slate-400">
                  <span>ہیلپر اجرت ({helperCount} مزدور)</span>
                  <span className="font-mono font-semibold text-white">PKR {helperFee.toLocaleString()}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-slate-400">
                <span>روڈ سیفٹی و ٹول ٹیکس بفر</span>
                <span className="font-mono font-semibold text-white">PKR {platformFee}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between font-bold text-white text-xs sm:text-sm">
                <span>کل تخمینہ کرایہ (Total Estimated)</span>
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
