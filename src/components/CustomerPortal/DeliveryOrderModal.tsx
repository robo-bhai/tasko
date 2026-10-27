import React, { useState } from 'react';
import { User, OrderPricing, CustomDeliveryDetails } from '../../types';
import { 
  X, 
  ShoppingBag, 
  Store as StoreIcon, 
  MapPin, 
  FileText, 
  Zap, 
  ArrowRight,
  Info
} from 'lucide-react';

interface DeliveryOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onProceedToCheckout: (payload: {
    category: 'custom_delivery';
    deliveryDetails: CustomDeliveryDetails;
    pricing: OrderPricing;
    deliveryAddress: string;
  }) => void;
}

export const DeliveryOrderModal: React.FC<DeliveryOrderModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onProceedToCheckout
}) => {
  const [itemName, setItemName] = useState('');
  const [estimatedBudget, setEstimatedBudget] = useState(1200);
  const [storeName, setStoreName] = useState('Tehzeeb Bakers & Superstore / Any nearby branch');
  const [pickupAddress, setPickupAddress] = useState('Blue Area / F-6 Super Market');
  const [deliveryAddress, setDeliveryAddress] = useState(currentUser?.address || 'House 42, Street 7, Sector F-8/2, Islamabad');
  const [notes, setNotes] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  if (!isOpen) return null;

  const baseFee = isUrgent ? 350 : 220;
  const deliveryFee = 150;
  const platformFee = 50;
  const total = Number(estimatedBudget) + baseFee + deliveryFee + platformFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || !deliveryAddress.trim()) {
      alert('Please provide item details and your delivery address.');
      return;
    }

    const pricing: OrderPricing = {
      baseFee,
      serviceOrDeliveryFee: deliveryFee,
      itemOrDistanceBudget: Number(estimatedBudget),
      helperFee: 0,
      platformFee,
      total
    };

    const deliveryDetails: CustomDeliveryDetails = {
      itemName: itemName.trim(),
      estimatedBudget: Number(estimatedBudget),
      storeName: storeName.trim(),
      pickupAddress: pickupAddress.trim(),
      deliveryAddress: deliveryAddress.trim(),
      notes: notes.trim(),
      isUrgent
    };

    onProceedToCheckout({
      category: 'custom_delivery',
      deliveryDetails,
      pricing,
      deliveryAddress: deliveryAddress.trim()
    });
  };

  const sampleItems = [
    '2x Panadol Extra, 1x Betadine liquid & Bandages',
    '1 Dozen Eggs, 2L Whole Milk, 1 Brown Bread',
    '1x USB-C 65W Fast Charger Cable from local tech shop',
    'Hot Chicken Biryani (2 plates) & Raita'
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Order Anything / Buy & Deliver</h3>
              <p className="text-xs text-slate-300">A verified courier buys items and delivers to your doorstep</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Item details */}
          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
              Items to Purchase & Deliver *
            </label>
            <textarea
              rows={3}
              required
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g. 2 packets of milk, 1 brown bread, fresh mint bunch, and 1 dozen eggs..."
              className="w-full text-sm rounded-xl border border-slate-300 px-3.5 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors"
            />
            {/* Quick Suggestions */}
            <div className="mt-2 flex flex-wrap gap-1.5 items-center">
              <span className="text-[11px] text-slate-400">Quick fill:</span>
              {sampleItems.map((item, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setItemName(item)}
                  className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md transition-colors"
                >
                  {item.split(',')[0]}...
                </button>
              ))}
            </div>
          </div>

          {/* Budget & Store Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                Estimated Items Budget (PKR) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">PKR</span>
                <input
                  type="number"
                  min={50}
                  step={50}
                  required
                  value={estimatedBudget}
                  onChange={(e) => setEstimatedBudget(Number(e.target.value))}
                  className="w-full text-sm font-mono font-semibold rounded-xl border border-slate-300 pl-12 pr-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Courier pays at store; settled with receipt upon delivery.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                Preferred Store / Area
              </label>
              <div className="relative">
                <StoreIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g. Shaheen Chemist or Nearest Bakery"
                  className="w-full text-sm rounded-xl border border-slate-300 pl-9 pr-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Pickup and Delivery Addresses */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                Pickup Address / Store Location
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-blue-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  placeholder="e.g. F-6 Super Market, Islamabad (or Rider chooses closest)"
                  className="w-full text-sm rounded-xl border border-slate-300 pl-9 pr-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                Delivery Address (Your Destination) *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-emerald-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="House #, Street #, Sector / Area"
                  className="w-full text-sm rounded-xl border border-slate-300 pl-9 pr-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Special Instructions & Urgency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                Instructions for Courier
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Ring bell twice, collect store receipt"
                className="w-full text-sm rounded-xl border border-slate-300 px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer w-full transition-colors">
                <input
                  type="checkbox"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    Express Priority (Under 45m)
                  </span>
                  <span className="text-slate-500 block text-[11px]">+ PKR 130 priority surge</span>
                </div>
              </label>
            </div>
          </div>

          {/* Pricing Estimation Summary */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span>Estimated Items Budget</span>
              <span className="font-mono font-semibold">PKR {Number(estimatedBudget).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Courier Base Delivery Fee</span>
              <span className="font-mono font-semibold">PKR {baseFee}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Distance & Fuel Surcharge</span>
              <span className="font-mono font-semibold">PKR {deliveryFee}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Platform Service & Insurance</span>
              <span className="font-mono font-semibold">PKR {platformFee}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm font-bold text-slate-900">
              <span>Total Estimated Payable</span>
              <span className="font-mono text-base text-blue-600">PKR {total.toLocaleString()}</span>
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
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md transition-colors flex items-center gap-2"
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
