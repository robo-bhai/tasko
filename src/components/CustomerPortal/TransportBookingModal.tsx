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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Rent Transport & Cargo Vehicles</h3>
              <p className="text-xs text-slate-300">Shifting, freight transport, and heavy item movement with helpers</p>
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
          {/* Vehicle Selection Grid */}
          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Select Vehicle Type *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {vehicles.map((veh) => {
                const isSelected = selectedVehicleId === veh.id;
                return (
                  <button
                    type="button"
                    key={veh.id}
                    onClick={() => setSelectedVehicleId(veh.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 shadow-xs ring-1 ring-indigo-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{veh.name}</span>
                      {isSelected ? (
                        <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                      ) : (
                        <span className="text-[11px] font-mono text-slate-500">PKR {veh.baseFare} base</span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-600">
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded font-mono font-semibold">
                        Max {veh.capacityKg} kg
                      </span>
                      <span>·</span>
                      <span className="font-mono">{veh.dimensions}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                      {veh.bestFor}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pickup and Drop-off locations */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                Pickup Address / Warehouse / Store *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-indigo-600 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  placeholder="Starting address where driver will load goods"
                  className="w-full text-xs rounded-xl border border-slate-300 pl-9 pr-3 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                Drop-off Destination Address *
              </label>
              <div className="relative">
                <Navigation className="w-4 h-4 text-emerald-600 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={dropoffLocation}
                  onChange={(e) => setDropoffLocation(e.target.value)}
                  placeholder="Final delivery address where cargo is unloaded"
                  className="w-full text-xs rounded-xl border border-slate-300 pl-9 pr-3 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>
            </div>
          </div>

          {/* Distance and Cargo Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Estimated Trip Distance
                </label>
                <span className="text-xs font-mono font-bold text-indigo-600">
                  {estimatedDistanceKm} km
                </span>
              </div>
              <input
                type="range"
                min={2}
                max={80}
                value={estimatedDistanceKm}
                onChange={(e) => setEstimatedDistanceKm(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>2 km</span>
                <span>40 km</span>
                <span>80 km</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                Estimated Weight (approx kg)
              </label>
              <div className="relative">
                <Scale className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="number"
                  min={10}
                  max={activeVehicle?.capacityKg || 4500}
                  value={loadWeightKg}
                  onChange={(e) => setLoadWeightKg(Number(e.target.value))}
                  className="w-full text-xs font-mono font-semibold rounded-xl border border-slate-300 pl-9 pr-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Selected vehicle limit: {activeVehicle?.capacityKg} kg
              </span>
            </div>
          </div>

          {/* Cargo Details */}
          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
              Cargo / Freight Description *
            </label>
            <input
              type="text"
              required
              value={cargoDescription}
              onChange={(e) => setCargoDescription(e.target.value)}
              placeholder="e.g. 1 double bed, 1 wardrobe, 6 cartons of kitchenware..."
              className="w-full text-xs rounded-xl border border-slate-300 px-3.5 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          {/* Helper Option */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="helperCheckbox"
                checked={needsHelper}
                onChange={(e) => setNeedsHelper(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <label htmlFor="helperCheckbox" className="text-xs cursor-pointer">
                <span className="font-bold text-slate-900 block">
                  Add Loading / Unloading Labor (Helper)
                </span>
                <span className="text-slate-500 text-[11px]">
                  Driver comes with skilled loader to carry furniture up stairs and load securely.
                </span>
              </label>
            </div>

            {needsHelper && (
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <span className="text-xs text-slate-600 font-medium">Workers:</span>
                <div className="flex items-center rounded-lg border border-slate-300 bg-white">
                  <button
                    type="button"
                    onClick={() => setHelperCount(Math.max(1, helperCount - 1))}
                    className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold text-xs"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 font-mono font-bold text-xs text-slate-900">
                    {helperCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setHelperCount(Math.min(4, helperCount + 1))}
                    className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold text-xs"
                  >
                    +
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Transparent Rate Breakdown */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span>{activeVehicle?.name} Initial Base Fare</span>
              <span className="font-mono font-semibold">PKR {baseFare.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Distance Charge ({estimatedDistanceKm} km @ PKR {activeVehicle?.perKmRate}/km)</span>
              <span className="font-mono font-semibold">PKR {distanceFare.toLocaleString()}</span>
            </div>
            {needsHelper && (
              <div className="flex items-center justify-between text-slate-600">
                <span>Labor / Helper Fee ({helperCount} helper{helperCount > 1 ? 's' : ''})</span>
                <span className="font-mono font-semibold">PKR {helperFee.toLocaleString()}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-slate-600">
              <span>Cargo Transit Insurance & Toll Buffer</span>
              <span className="font-mono font-semibold">PKR {platformFee}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm font-bold text-slate-900">
              <span>Total Estimated Fare</span>
              <span className="font-mono text-base text-indigo-600">PKR {total.toLocaleString()}</span>
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
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md transition-colors flex items-center gap-2"
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
