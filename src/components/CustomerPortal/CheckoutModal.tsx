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
  currentUser: User;
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
  const [mobileNumber, setMobileNumber] = useState(currentUser.phone || '+92 300 1234567');
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
        customerId: currentUser.id,
        customerName: currentUser.name,
        customerPhone: currentUser.phone,
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Review & Checkout</h3>
            <p className="text-xs text-slate-300">Choose payment method and confirm request</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handlePlaceOrder} className="p-6 space-y-5">
          {/* Order Summary Snapshot */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                {pendingOrder.category === 'custom_delivery' && 'Custom Store Delivery'}
                {pendingOrder.category === 'home_services' && 'On-Demand Home Service'}
                {pendingOrder.category === 'transport_cargo' && 'Transport Vehicle Rental'}
              </span>
              <span className="font-mono text-emerald-600 font-bold">Verified Escrow</span>
            </div>

            {pendingOrder.category === 'custom_delivery' && pendingOrder.deliveryDetails && (
              <div className="text-slate-700 space-y-1">
                <p className="font-semibold text-slate-900">{pendingOrder.deliveryDetails.itemName}</p>
                <p className="text-slate-500">Shop: {pendingOrder.deliveryDetails.storeName}</p>
                <p className="text-slate-500">Deliver To: {pendingOrder.deliveryDetails.deliveryAddress}</p>
              </div>
            )}

            {pendingOrder.category === 'home_services' && pendingOrder.serviceDetails && (
              <div className="text-slate-700 space-y-1">
                <p className="font-semibold text-slate-900">{pendingOrder.serviceDetails.serviceName}</p>
                <p className="text-slate-500">Time Slot: {pendingOrder.serviceDetails.scheduledDate} · {pendingOrder.serviceDetails.scheduledTimeSlot}</p>
                <p className="text-slate-500">Address: {pendingOrder.serviceDetails.serviceAddress}</p>
              </div>
            )}

            {pendingOrder.category === 'transport_cargo' && pendingOrder.transportDetails && (
              <div className="text-slate-700 space-y-1">
                <p className="font-semibold text-slate-900">{pendingOrder.transportDetails.vehicleName}</p>
                <p className="text-slate-500">Route: {pendingOrder.transportDetails.pickupLocation} → {pendingOrder.transportDetails.dropoffLocation} ({pendingOrder.transportDetails.estimatedDistanceKm} km)</p>
                <p className="text-slate-500">Cargo: {pendingOrder.transportDetails.cargoDescription} (~{pendingOrder.transportDetails.loadWeightKg} kg)</p>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-bold text-slate-900">
              <span>Total Payable Amount</span>
              <span className="font-mono text-base text-blue-600">PKR {pendingOrder.pricing.total.toLocaleString()}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Select Payment Method
            </label>
            <div className="space-y-2">
              {/* Cash On Delivery */}
              <label className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                paymentMethod === 'cod' ? 'border-blue-600 bg-blue-50/60 ring-1 ring-blue-600' : 'border-slate-200 hover:bg-slate-50'
              }`}>
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                      <Banknote className="w-4 h-4 text-emerald-600" />
                      <span>Cash on Delivery (COD) / Pay After Service</span>
                    </div>
                    <span className="text-[11px] text-slate-500 block">
                      Hand cash directly to the courier, driver, or technician once completed.
                    </span>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded">
                  Most Popular
                </span>
              </label>

              {/* JazzCash */}
              <label className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                paymentMethod === 'jazzcash' ? 'border-amber-600 bg-amber-50/60 ring-1 ring-amber-600' : 'border-slate-200 hover:bg-slate-50'
              }`}>
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="jazzcash"
                    checked={paymentMethod === 'jazzcash'}
                    onChange={() => setPaymentMethod('jazzcash')}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                      <Smartphone className="w-4 h-4 text-red-600" />
                      <span>JazzCash Mobile Account</span>
                    </div>
                    <span className="text-[11px] text-slate-500 block">
                      Instant direct wallet transfer via JazzCash USSD / OTP prompt.
                    </span>
                  </div>
                </div>
                <span className="text-[10px] bg-red-100 text-red-800 font-semibold px-2 py-0.5 rounded">
                  JazzCash
                </span>
              </label>

              {/* EasyPaisa */}
              <label className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                paymentMethod === 'easypaisa' ? 'border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-600' : 'border-slate-200 hover:bg-slate-50'
              }`}>
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="easypaisa"
                    checked={paymentMethod === 'easypaisa'}
                    onChange={() => setPaymentMethod('easypaisa')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                      <Smartphone className="w-4 h-4 text-emerald-600" />
                      <span>EasyPaisa Wallet</span>
                    </div>
                    <span className="text-[11px] text-slate-500 block">
                      Pay quickly with your registered Telenor / EasyPaisa wallet.
                    </span>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded">
                  EasyPaisa
                </span>
              </label>

              {/* Direct Bank Transfer */}
              <label className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                paymentMethod === 'bank_transfer' ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-600' : 'border-slate-200 hover:bg-slate-50'
              }`}>
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank_transfer"
                    checked={paymentMethod === 'bank_transfer'}
                    onChange={() => setPaymentMethod('bank_transfer')}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                      <Building2 className="w-4 h-4 text-indigo-600" />
                      <span>Direct Bank Transfer / Raast Instant IBAN</span>
                    </div>
                    <span className="text-[11px] text-slate-500 block">
                      Official Meezan Bank Escrow account with zero transaction fees.
                    </span>
                  </div>
                </div>
              </label>

              {/* Debit/Credit Card */}
              <label className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                paymentMethod === 'card' ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900' : 'border-slate-200 hover:bg-slate-50'
              }`}>
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="text-slate-900 focus:ring-slate-900"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                      <CreditCard className="w-4 h-4 text-slate-700" />
                      <span>Credit or Debit Card</span>
                    </div>
                    <span className="text-[11px] text-slate-500 block">
                      Visa, Mastercard, or UnionPay accepted with 3D Secure verification.
                    </span>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Conditional Payment Inputs */}
          {(paymentMethod === 'jazzcash' || paymentMethod === 'easypaisa') && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <label className="block text-xs font-bold text-slate-900">
                Registered Mobile Account Number
              </label>
              <input
                type="text"
                required
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="+92 3XX XXXXXXX"
                className="w-full text-xs font-mono font-semibold rounded-lg border border-slate-300 px-3 py-2 bg-white"
              />
              <p className="text-[11px] text-slate-500">
                You will receive a USSD flash approval or push notification on your mobile.
              </p>
            </div>
          )}

          {paymentMethod === 'bank_transfer' && (
            <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-1.5 text-xs text-indigo-950 font-mono">
              <div className="flex justify-between font-bold">
                <span>Bank:</span>
                <span>Meezan Bank Limited</span>
              </div>
              <div className="flex justify-between">
                <span>Account Title:</span>
                <span>OmniServe SuperApp Escrow</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>IBAN:</span>
                <span>PK82MEZN0001000987654321</span>
              </div>
              <div className="text-[11px] text-indigo-800 font-sans pt-1">
                Your payment will be verified and held safely in escrow until service completion.
              </div>
            </div>
          )}

          {/* Guarantee notice */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>OmniServe SafePay Guarantee: Your payment is protected until job satisfaction.</span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Dispatching Order...</span>
              ) : (
                <>
                  <span>Confirm & Place Order</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
