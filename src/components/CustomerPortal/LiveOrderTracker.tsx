import React, { useState } from 'react';
import { Order, OrderStatus } from '../../types';
import { Store } from '../../services/store';
import { 
  X, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  Truck, 
  Wrench, 
  ShoppingBag, 
  ArrowRight, 
  Star, 
  ShieldCheck, 
  RefreshCw,
  Info,
  Radio
} from 'lucide-react';

interface LiveOrderTrackerProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  selectedOrderId?: string;
  onSelectOrder: (orderId: string) => void;
  onOpenReviewModal: (order: Order) => void;
  onSwitchToProviderView?: () => void;
}

export const LiveOrderTracker: React.FC<LiveOrderTrackerProps> = ({
  isOpen,
  onClose,
  orders,
  selectedOrderId,
  onSelectOrder,
  onOpenReviewModal
}) => {
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'provider'; text: string; time: string }>>([
    { sender: 'provider', text: 'السلام علیکم! آپ کا آرڈر مل گیا ہے۔ میں مطلوبہ سامان اور اوزار لے کر روانہ ہو رہا ہوں۔', time: 'Just now' }
  ]);
  const [showChat, setShowChat] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!isOpen) return null;

  // Find active or selected order
  const activeOrder = orders.find(o => o.id === selectedOrderId) 
    || orders.find(o => o.status !== 'completed' && o.status !== 'cancelled')
    || orders[0];

  if (!activeOrder) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center shadow-2xl border border-slate-200 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <p className="text-base font-bold text-slate-900">کوئی فعال آرڈر موجود نہیں ہے</p>
          <p className="text-xs text-slate-500">خانیوال سٹی میں ہوم سروس، پارسل ڈیلیوری یا کارگو گاڑی بک کرنے کے بعد لائیو ٹریکنگ دیکھیں۔</p>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            بند کریں (Close)
          </button>
        </div>
      </div>
    );
  }

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatHistory(prev => [
      ...prev,
      { sender: 'user', text: chatMessage, time }
    ]);
    setChatMessage('');
  };

  // Steps calculation
  const steps = [
    { label: 'آرڈر موصول', desc: 'Order Placed' },
    { label: 'ورکر تفویض', desc: 'Provider Assigned' },
    { label: activeOrder.category === 'home_services' ? 'کام شروع' : 'راستے میں', desc: 'In Execution' },
    { label: 'مکمل', desc: 'Completed' }
  ];

  let currentStep = 0;
  if (activeOrder.status === 'assigned') currentStep = 1;
  else if (activeOrder.status === 'on_the_way' || activeOrder.status === 'work_started') currentStep = 2;
  else if (activeOrder.status === 'completed') currentStep = 3;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-xs text-white shadow-xs">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-white">
                  لائیو آرڈر و ڈسپیچ ٹریکر
                </h3>
                <span className="font-mono text-xs text-blue-300 font-bold bg-blue-950 border border-blue-800 px-2 py-0.5 rounded-md">
                  {activeOrder.id}
                </span>
              </div>
              <p className="text-[11px] text-slate-300">خانیوال سٹی اور قریبی علاقوں میں ریئل ٹائم اپ ڈیٹس</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Order Selector if customer has multiple orders */}
            {orders.length > 1 && (
              <select
                value={activeOrder.id}
                onChange={(e) => onSelectOrder(e.target.value)}
                className="bg-slate-800 text-white text-xs rounded-xl px-2.5 py-1.5 border border-slate-700"
              >
                {orders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.id} ({o.status.replace('_', ' ')})
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={handleManualRefresh}
              title="Refresh Status"
              className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Progress Stepper */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5">
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2 relative">
              {steps.map((st, i) => {
                const isPassed = i <= currentStep && activeOrder.status !== 'cancelled';
                const isCurrent = i === currentStep && activeOrder.status !== 'cancelled';
                return (
                  <div key={i} className="flex flex-col items-center text-center relative z-10">
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isPassed
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-200 text-slate-500'
                      } ${isCurrent ? 'ring-4 ring-blue-100 scale-105' : ''}`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                    </div>
                    <span className="text-[11px] sm:text-xs font-bold text-slate-900 mt-2 line-clamp-1">{st.label}</span>
                    <span className="text-[9px] sm:text-[10px] text-slate-500 hidden sm:block">{st.desc}</span>
                  </div>
                );
              })}
            </div>

            {/* Status note banner */}
            <div className="mt-4 pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="font-semibold text-slate-800">
                  موجودہ کیفیت:{' '}
                  <span className="font-bold text-blue-700">
                    {activeOrder.status === 'pending' && 'ورکر کی تصدیق کا انتظار'}
                    {activeOrder.status === 'assigned' && 'ورکر تفویض ہو چکا ہے'}
                    {activeOrder.status === 'on_the_way' && 'ورکر آپ کے پتے کی طرف روانہ ہے'}
                    {activeOrder.status === 'work_started' && 'کام جاری ہے'}
                    {activeOrder.status === 'completed' && 'آرڈر کامیابی سے مکمل ہو چکا ہے'}
                    {activeOrder.status === 'cancelled' && 'آرڈر منسوخ کر دیا گیا ہے'}
                  </span>
                </span>
              </div>
              {activeOrder.etaMinutes && activeOrder.status !== 'completed' && (
                <div className="flex items-center gap-1.5 text-slate-600 font-mono">
                  <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>متوقع پہنچنے کا وقت: <strong className="text-slate-900">~{activeOrder.etaMinutes} منٹ</strong></span>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Live Route View */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 text-white p-4 sm:p-5 min-h-[190px] sm:min-h-[220px] flex flex-col justify-between shadow-inner">
            <div className="absolute inset-0 opacity-25 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

            <div className="relative z-10 flex items-center justify-between text-xs">
              <div className="bg-slate-900/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-mono text-emerald-300 text-[11px]">Khanewal GPS Connected</span>
              </div>
              <span className="text-slate-300 font-mono text-[11px]">
                خانیوال سٹی زون
              </span>
            </div>

            {/* Route graphic */}
            <div className="relative z-10 py-4 sm:py-6 px-2">
              <div className="flex items-center justify-between relative">
                <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-700 rounded-full" />
                <div 
                  className="absolute left-6 top-1/2 -translate-y-1/2 h-1 bg-blue-500 rounded-full transition-all duration-700" 
                  style={{ width: `${Math.min(100, Math.max(10, currentStep * 33))}%` }}
                />

                {/* Pickup point */}
                <div className="relative flex flex-col items-center">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-800 border-2 border-blue-400 flex items-center justify-center shadow-lg">
                    <ShoppingBag className="w-3.5 h-3.5 text-blue-300" />
                  </div>
                  <span className="text-[10px] text-slate-300 font-medium mt-1 whitespace-nowrap">
                    دکان / بیس
                  </span>
                </div>

                {/* Moving Courier icon */}
                <div className="relative flex flex-col items-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center shadow-xl animate-bounce">
                    {activeOrder.category === 'transport_cargo' ? (
                      <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    ) : activeOrder.category === 'home_services' ? (
                      <Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    ) : (
                      <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    )}
                  </div>
                  <span className="text-[10px] text-blue-300 font-bold mt-1">
                    {activeOrder.status === 'completed' ? 'پہنچ گیا' : 'راستے میں ہے'}
                  </span>
                </div>

                {/* Destination */}
                <div className="relative flex flex-col items-center">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-800 border-2 border-emerald-400 flex items-center justify-center shadow-lg">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <span className="text-[10px] text-slate-300 font-medium mt-1 whitespace-nowrap">
                    آپ کا پتہ
                  </span>
                </div>
              </div>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 gap-1.5">
              <span className="truncate max-w-full sm:max-w-[340px]">
                پتہ: {activeOrder.deliveryAddress}
              </span>
              <span className="font-mono text-emerald-400 font-semibold shrink-0">
                خانیوال لوکل کوریڈور
              </span>
            </div>
          </div>

          {/* Assigned Provider Profile Card */}
          {activeOrder.assignedProviderName ? (
            <div className="p-4 rounded-2xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3">
                <img
                  src={activeOrder.assignedProviderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={activeOrder.assignedProviderName}
                  className="w-12 h-12 rounded-full object-cover border border-slate-200 shadow-xs shrink-0"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                  }}
                />
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="font-bold text-slate-900 text-sm">{activeOrder.assignedProviderName}</h4>
                    <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded font-semibold flex items-center gap-0.5">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      تصدیق شدہ ورکر
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {activeOrder.category === 'home_services' ? 'ماہر و مصدقہ ٹیکنیشن (خانیوال)' : 'تصدیق شدہ کوریئر رائیڈر (خانیوال)'}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-amber-500 font-bold mt-0.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{activeOrder.assignedProviderRating || 4.9}</span>
                    <span className="text-slate-400 font-normal">· (مصدقہ خانیوال لوکل پارٹنر)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <a
                  href={`tel:${activeOrder.assignedProviderPhone || '+923001234567'}`}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-600" />
                  <span>کال کریں</span>
                </a>
                <button
                  type="button"
                  onClick={() => setShowChat(!showChat)}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>چیٹ ({chatHistory.length})</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl border border-dashed border-amber-300 bg-amber-50/80 text-xs flex items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="font-bold text-amber-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  قریبی خانیوال ورکرز کو نوٹیفکیشن بھیجا جا چکا ہے...
                </p>
                <p className="text-amber-700 text-[11px]">
                  خانیوال سٹی اور آس پاس کے دستیاب ٹیکنیشنز یا رائیڈرز کو یہ آرڈر موصول ہو چکا ہے۔ جلد ہی کوئی ورکر آپ کا کام قبول کر لے گا۔
                </p>
              </div>
            </div>
          )}

          {/* Quick Chat Accordion */}
          {showChat && (
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-800">
                  {activeOrder.assignedProviderName || 'ورکر'} کے ساتھ لائیو رابطہ
                </span>
                <button onClick={() => setShowChat(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
                {chatHistory.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`text-xs px-3 py-1.5 rounded-xl max-w-[85%] ${
                        msg.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-2xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[9px] text-slate-400 mt-0.5 px-1">{msg.time}</span>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="کوئی خاص ہدایت لکھیں (مثلاً: گھر کے باہر گھنٹی بجائیں)..."
                  className="flex-1 text-xs rounded-xl border border-slate-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-500"
                >
                  بھیجیں
                </button>
              </form>
            </div>
          )}

          {/* Real Timeline History */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              آرڈر ٹائم لائن و مراحل (Status Timeline)
            </h4>
            <div className="space-y-2 text-xs">
              {activeOrder.timeline.map((event, idx) => (
                <div key={idx} className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-mono text-slate-500 text-[11px] shrink-0 pt-0.5">{event.timestamp}</span>
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-900">{event.label}</p>
                    {event.note && <p className="text-slate-500 text-[11px]">{event.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rate & Review if completed */}
          {activeOrder.status === 'completed' && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-bold text-emerald-900 block">کام کامیابی سے مکمل ہو گیا!</span>
                <span className="text-emerald-700">
                  {activeOrder.review ? 'شکریہ! آپ نے ' + activeOrder.review.rating + ' سٹارز ریٹنگ دی ہے۔' : 'اپنے تجربے کے بارے میں ورکر کو ریٹنگ اور فیڈبیک دیں۔'}
                </span>
              </div>
              <button
                onClick={() => onOpenReviewModal(activeOrder)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors shrink-0"
              >
                {activeOrder.review ? 'ریویو دیکھیں' : 'ریٹنگ دیں'}
              </button>
            </div>
          )}
        </div>

        {/* Clean Production Footer */}
        <div className="px-5 py-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>خانیوال کنیکٹ لائیو سروس سپورٹ: 6664-0800</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            بند کریں (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
