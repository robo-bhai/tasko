import React, { useState } from 'react';
import { 
  User, 
  OrderPricing, 
  PaymentMethod, 
  CustomDeliveryDetails, 
  HomeServiceDetails, 
  TransportDetails, 
  Order 
} from '../../types';
import { Store } from '../../services/store';
import { 
  X, 
  CreditCard, 
  Banknote, 
  Smartphone, 
  Building2, 
  ShieldCheck, 
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export interface PendingCheckoutOrder {
  category: 'custom_delivery' | 'home_services' | 'transport_cargo';
  deliveryDetails?: CustomDeliveryDetails;
  serviceDetails?: HomeServiceDetails;
  transportDetails?: TransportDetails;
  pricing: OrderPricing;
  deliveryAddress: string;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  pendingOrder: PendingCheckoutOrder | null;
  onOrderPlaced: (newOrder: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  pendingOrder,
  onOrderPlaced
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [mobileNumber, setMobileNumber] = useState(currentUser?.phone || '+92 300 1234567');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 9012');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !pendingOrder) return null;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const isPaidOnline = paymentMethod !== 'cod';

      const newOrder = Store.createOrder({
        category: pendingOrder.category,
        customerId: currentUser?.id || 'usr-guest-' + Date.now(),
        customerName: currentUser?.name || 'Customer',
        customerPhone: currentUser?.phone || mobileNumber,
        deliveryAddress: pendingOrder.deliveryAddress,
        status: 'pending',
        deliveryDetails: pendingOrder.deliveryDetails,
        serviceDetails: pendingOrder.serviceDetails,
        transportDetails: pendingOrder.transportDetails,
        pricing: pendingOrder.pricing,
        paymentMethod,
        paymentStatus: isPaidOnline ? 'paid' : 'pending',
        etaMinutes: pendingOrder.category === 'custom_delivery' ? 35 : 45
      });

      setIsSubmitting(false);
      onOrderPlaced(newOrder);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-[#0e1017] text-white rounded-2xl sm:rounded-3xl max-w-xl w-full shadow-2xl border border-amber-500/30 overflow-hidden my-auto max-h-[94vh] sm:max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-3.5 py-3 sm:px-6 sm:py-4 bg-[#08090f] text-white flex items-center justify-between border-b border-amber-500/20 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-xs sm:text-base font-bold text-white leading-tight">
                Checkout aur Adaigi (Review & Checkout)
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-400 line-clamp-1">
                Tariqa adaigi muntakhib karein aur order confirm karein
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

        <form onSubmit={handlePlaceOrder} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-3 sm:p-5 overflow-y-auto flex-1 space-y-3 sm:space-y-4 text-xs">
            {/* Order Summary Snapshot */}
            <div className="p-3 sm:p-3.5 rounded-xl bg-[#12141e] border border-amber-500/20 space-y-2 text-xs">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px] sm:text-[11px]">
                  {pendingOrder.category === 'custom_delivery' && 'Khanewal Rider Delivery'}
                  {pendingOrder.category === 'home_services' && 'Khanewal Home Technician'}
                  {pendingOrder.category === 'transport_cargo' && 'Khanewal Cargo o Riksha'}
                </span>
                <span className="font-mono text-emerald-400 text-[10px] sm:text-xs font-bold">100% Mehfooz Escrow</span>
              </div>

              {pendingOrder.category === 'custom_delivery' && pendingOrder.deliveryDetails && (
                <div className="text-slate-300 space-y-0.5 text-[11px] sm:text-xs">
                  <p className="font-semibold text-white">{pendingOrder.deliveryDetails.itemName}</p>
                  <p className="text-slate-400">Market / Dukaan: {pendingOrder.deliveryDetails.storeName || 'Qareebi Dukaan'}</p>
                  <p className="text-slate-400">Delivery Address: {pendingOrder.deliveryDetails.deliveryAddress}</p>
                </div>
              )}

              {pendingOrder.category === 'home_services' && pendingOrder.serviceDetails && (
                <div className="text-slate-300 space-y-0.5 text-[11px] sm:text-xs">
                  <p className="font-semibold text-white">{pendingOrder.serviceDetails.serviceName}</p>
                  <p className="text-slate-400">Waqt: {pendingOrder.serviceDetails.scheduledDate} · {pendingOrder.serviceDetails.scheduledTimeSlot}</p>
                  <p className="text-slate-400">Address: {pendingOrder.serviceDetails.serviceAddress}</p>
                </div>
              )}

              {pendingOrder.category === 'transport_cargo' && pendingOrder.transportDetails && (
                <div className="text-slate-300 space-y-0.5 text-[11px] sm:text-xs">
                  <p className="font-semibold text-white">{pendingOrder.transportDetails.vehicleName}</p>
                  <p className="text-slate-400">Route: {pendingOrder.transportDetails.pickupLocation} → {pendingOrder.transportDetails.dropoffLocation} ({pendingOrder.transportDetails.estimatedDistanceKm} km)</p>
                  <p className="text-slate-400">Saman: {pendingOrder.transportDetails.cargoDescription} (~{pendingOrder.transportDetails.loadWeightKg} kg)</p>
                </div>
              )}

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between font-bold text-white text-xs sm:text-sm">
                <span>Kul Qabil-e-Adaigi Raqam</span>
                <span className="font-mono text-amber-400 text-sm sm:text-base">PKR {pendingOrder.pricing.total.toLocaleString()}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 sm:mb-2">
                Tariqa Adaigi Muntakhib Karein (Payment Method)
              </label>
              <div className="space-y-2">
                {/* Cash On Delivery */}
                <label className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'cod' ? 'border-amber-400 bg-amber-950/40 ring-1 ring-amber-400/60' : 'border-slate-800 bg-[#12141e] hover:border-slate-700'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="text-amber-500 focus:ring-amber-400"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-white text-[11px] sm:text-xs">
                        <Banknote className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Cash On Delivery / Kaam Ke Baad Naqad (COD)</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">
                        Kaam mukammal hone par rider ya karigar ko naqad ada karein.
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] sm:text-[10px] bg-emerald-950 border border-emerald-800 text-emerald-400 font-semibold px-2 py-0.5 rounded">
                    Sabse Asan
                  </span>
                </label>

                {/* JazzCash */}
                <label className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'jazzcash' ? 'border-amber-400 bg-amber-950/40 ring-1 ring-amber-400/60' : 'border-slate-800 bg-[#12141e] hover:border-slate-700'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="jazzcash"
                      checked={paymentMethod === 'jazzcash'}
                      onChange={() => setPaymentMethod('jazzcash')}
                      className="text-amber-500 focus:ring-amber-400"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-white text-[11px] sm:text-xs">
                        <Smartphone className="w-3.5 h-3.5 text-red-500" />
                        <span>JazzCash Mobile Account</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">
                        Apne JazzCash account se fori mehfooz transfer.
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] sm:text-[10px] bg-red-950 border border-red-800 text-red-400 font-semibold px-2 py-0.5 rounded">
                    JazzCash
                  </span>
                </label>

                {/* EasyPaisa */}
                <label className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'easypaisa' ? 'border-amber-400 bg-amber-950/40 ring-1 ring-amber-400/60' : 'border-slate-800 bg-[#12141e] hover:border-slate-700'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="easypaisa"
                      checked={paymentMethod === 'easypaisa'}
                      onChange={() => setPaymentMethod('easypaisa')}
                      className="text-amber-500 focus:ring-amber-400"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-white text-[11px] sm:text-xs">
                        <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                        <span>EasyPaisa Wallet</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">
                        Apne registered EasyPaisa account se adaigi karein.
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] sm:text-[10px] bg-emerald-950 border border-emerald-800 text-emerald-400 font-semibold px-2 py-0.5 rounded">
                    EasyPaisa
                  </span>
                </label>

                {/* Direct Bank Transfer */}
                <label className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'bank_transfer' ? 'border-amber-400 bg-amber-950/40 ring-1 ring-amber-400/60' : 'border-slate-800 bg-[#12141e] hover:border-slate-700'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank_transfer"
                      checked={paymentMethod === 'bank_transfer'}
                      onChange={() => setPaymentMethod('bank_transfer')}
                      className="text-amber-500 focus:ring-amber-400"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-white text-[11px] sm:text-xs">
                        <Building2 className="w-3.5 h-3.5 text-amber-400" />
                        <span>Bank Transfer / Raast Instant IBAN</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">
                        Meezan Bank Escrow account, zero transaction charges.
                      </span>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Conditional Payment Inputs */}
            {(paymentMethod === 'jazzcash' || paymentMethod === 'easypaisa') && (
              <div className="p-3 sm:p-3.5 rounded-xl bg-[#12141e] border border-amber-500/30 space-y-1.5">
                <label className="block text-[10px] sm:text-xs font-bold text-slate-300">
                  Registered Mobile Account Number ({paymentMethod === 'jazzcash' ? 'JazzCash' : 'EasyPaisa'} Number)
                </label>
                <input
                  type="text"
                  required
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="+92 3XX XXXXXXX"
                  className="w-full text-xs sm:text-sm font-mono font-semibold rounded-lg border border-slate-700 px-3 py-2 bg-slate-900 text-white focus:outline-hidden focus:border-amber-400"
                />
                <p className="text-[10px] text-slate-400">
                  Order confirm karne par aap ke mobile par OTP ya PIN prompt mosool ho ga.
                </p>
              </div>
            )}

            {paymentMethod === 'bank_transfer' && (
              <div className="p-3 sm:p-3.5 rounded-xl bg-[#12141e] border border-amber-500/30 space-y-1 text-xs text-slate-200 font-mono">
                <div className="flex justify-between font-bold">
                  <span>Bank Ka Naam:</span>
                  <span className="text-white">Meezan Bank Limited (Khanewal)</span>
                </div>
                <div className="flex justify-between">
                  <span>Account Title:</span>
                  <span className="text-white">Khanewal Connect Escrow</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>IBAN:</span>
                  <span className="text-amber-400">PK82MEZN0001000987654321</span>
                </div>
                <div className="text-[10px] text-slate-400 font-sans pt-1">
                  Aap ki raqam escrow account mein mehfooz rahegi jab tak kaam mukammal na ho jae.
                </div>
              </div>
            )}

            {/* Guarantee notice */}
            <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Khanewal Connect Guarantee: Aap ka order aur adaigi 100% mehfooz hain.</span>
            </div>
          </div>

          {/* Sticky Modal Action Footer */}
          <div className="px-3.5 py-2.5 sm:px-6 sm:py-3.5 bg-[#08090f] border-t border-slate-800 flex items-center justify-end gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3 sm:px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Wapis (Back)
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:from-amber-500 text-slate-950 text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Order Dispatch Ho Raha Hai...</span>
              ) : (
                <>
                  <span>Order Confirm Karein</span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
