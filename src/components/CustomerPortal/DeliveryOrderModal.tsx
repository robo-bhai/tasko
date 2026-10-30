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
  const [storeName, setStoreName] = useState('Khanewal Pharmacy & Mart / Any Railway Road shop');
  const [pickupAddress, setPickupAddress] = useState('Railway Road / Ayub Medical Complex, Khanewal');
  const [deliveryAddress, setDeliveryAddress] = useState(currentUser?.address || 'House 14, Street 3, Peoples Colony, Khanewal');
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-[#0e1017] text-white rounded-2xl sm:rounded-3xl max-w-xl w-full shadow-2xl border border-amber-500/30 overflow-hidden my-auto max-h-[94vh] sm:max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-3.5 py-3 sm:px-6 sm:py-4 bg-[#08090f] text-white flex items-center justify-between border-b border-amber-500/20 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h3 className="text-xs sm:text-base font-bold text-white leading-tight">
                  بک اے رائیڈ و ڈلیوری (Delivery & Ride)
                </h3>
                <span className="text-[9px] sm:text-[10px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-1.5 py-0.5 rounded-full">
                  خانیوال لوکل
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 line-clamp-1">
                سودا سلف، پارسل، یا اشیاء کی خریداری و ہوم ڈیلیوری
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

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-3 sm:p-5 overflow-y-auto flex-1 space-y-3 sm:space-y-4 text-xs">
            {/* Item details */}
            <div>
              <label className="block text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                سامان یا خریداری کی تفصیل (Items to Deliver) *
              </label>
              <textarea
                rows={2}
                required
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="مثلاً: 2 پیکٹ دودھ، پیناڈول گولیاں، یا مین بازار سے بیکری آئٹمز..."
                className="w-full text-xs sm:text-sm rounded-xl border border-slate-700 bg-slate-900 text-white placeholder-slate-500 px-3 py-2 focus:outline-hidden focus:border-amber-400 transition-colors"
              />
              {/* Quick Suggestions */}
              <div className="mt-1.5 flex flex-wrap gap-1.5 items-center">
                <span className="text-[10px] text-slate-400">فوری انتخاب:</span>
                {sampleItems.map((item, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => setItemName(item)}
                    className="text-[10px] bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-800 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                  >
                    {item.split(',')[0]}...
                  </button>
                ))}
              </div>
            </div>

            {/* Budget & Store Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  سامان کی تخمینہ قیمت (Estimated Items Budget) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 sm:top-2.5 text-[10px] sm:text-xs font-bold text-slate-500">PKR</span>
                  <input
                    type="number"
                    min={50}
                    step={50}
                    required
                    value={estimatedBudget}
                    onChange={(e) => setEstimatedBudget(Number(e.target.value))}
                    className="w-full text-xs sm:text-sm font-mono font-semibold rounded-xl border border-slate-700 bg-slate-900 text-white pl-11 pr-3 py-2 sm:py-2.5 focus:outline-hidden focus:border-amber-400"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  رائیڈر سامان کی اصل رسید کے مطابق بقایا حساب لے گا۔
                </p>
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  پسندیدہ دکان یا مارکیٹ (Store / Area)
                </label>
                <div className="relative">
                  <StoreIcon className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5 sm:top-3" />
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="مثلاً ایوب چوک، ریلوے روڈ، یا قریبی میڈیکل اسٹور"
                    className="w-full text-xs sm:text-sm rounded-xl border border-slate-700 bg-slate-900 text-white placeholder-slate-500 pl-8 pr-3 py-2 sm:py-2.5 focus:outline-hidden focus:border-amber-400"
                  />
                </div>
              </div>
            </div>

            {/* Pickup and Delivery Addresses */}
            <div className="space-y-2.5 sm:space-y-3">
              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  پک اپ لوکیشن (Pickup Address)
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 absolute left-3 top-2.5 sm:top-3" />
                  <input
                    type="text"
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    placeholder="مثلاً غلہ منڈی یا مین بازار (یا رائیڈر قریبی منتخب کرے گا)"
                    className="w-full text-xs sm:text-sm rounded-xl border border-slate-700 bg-slate-900 text-white placeholder-slate-500 pl-8 pr-3 py-2 sm:py-2.5 focus:outline-hidden focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  ڈیلیوری کا پتہ (Delivery Destination in Khanewal) *
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 absolute left-3 top-2.5 sm:top-3" />
                  <input
                    type="text"
                    required
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="مکان یا دکان نمبر، گلی نمبر، خانیوال"
                    className="w-full text-xs sm:text-sm rounded-xl border border-slate-700 bg-slate-900 text-white placeholder-slate-500 pl-8 pr-3 py-2 sm:py-2.5 focus:outline-hidden focus:border-amber-400"
                  />
                </div>
              </div>
            </div>

            {/* Special Instructions & Urgency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  رائیڈر کے لیے ہدایات (Instructions)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="مثلاً: باہر گھنٹی بجائیں، رسید ضرور لیں"
                  className="w-full text-xs sm:text-sm rounded-xl border border-slate-700 bg-slate-900 text-white placeholder-slate-500 px-3 py-2 sm:py-2.5 focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-2.5 p-2.5 sm:p-3 rounded-xl border border-slate-800 bg-[#12141e] hover:border-amber-500/40 cursor-pointer w-full transition-colors">
                  <input
                    type="checkbox"
                    checked={isUrgent}
                    onChange={(e) => setIsUrgent(e.target.checked)}
                    className="w-4 h-4 text-amber-500 rounded border-slate-700 bg-slate-900 focus:ring-amber-400"
                  />
                  <div className="text-[11px] sm:text-xs">
                    <span className="font-bold text-white flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      فوری ارجنٹ ڈلیوری (Express Priority)
                    </span>
                    <span className="text-slate-400 block text-[10px]">+ PKR 130 ارجنٹ چارجز</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Pricing Estimation Summary */}
            <div className="rounded-xl bg-[#12141e] border border-amber-500/20 p-3 sm:p-3.5 space-y-1.5 text-[11px] sm:text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>سامان کا تخمینہ بجٹ</span>
                <span className="font-mono font-semibold text-white">PKR {Number(estimatedBudget).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>رائیڈر بیس ڈلیوری فیس</span>
                <span className="font-mono font-semibold text-white">PKR {baseFee}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>فاصلہ و فیول سرچارج</span>
                <span className="font-mono font-semibold text-white">PKR {deliveryFee}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>پلیٹ فارم تحفظ و انشورنس فیس</span>
                <span className="font-mono font-semibold text-white">PKR {platformFee}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between font-bold text-white text-xs sm:text-sm">
                <span>کل تخمینہ رقم (Total Payable)</span>
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
