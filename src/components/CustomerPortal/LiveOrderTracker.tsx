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
    { sender: 'provider', text: 'Assalam-o-Alaikum! Aap ka order mil gaya hai. Main matlooba saman aur tools le kar rawana ho raha hoon.', time: 'Just now' }
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
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-[#0e1017] rounded-3xl max-w-md w-full p-6 text-center shadow-2xl border border-amber-500/30 space-y-4 text-slate-100">
          <div className="w-14 h-14 rounded-2xl bg-amber-400/10 text-amber-400 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <p className="text-base font-bold text-white">Koi active order mojood nahi hai</p>
          <p className="text-xs text-slate-400">Khanewal city mein home service, parcel delivery ya cargo gaari book karne ke baad live tracking dekhein.</p>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Band Karein (Close)
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
    { label: 'Order Recvd', desc: 'Order Placed' },
    { label: 'Worker Assigned', desc: 'Provider Assigned' },
    { label: activeOrder.category === 'home_services' ? 'Kaam Shuru' : 'Rastay Mein', desc: 'In Execution' },
    { label: 'Mukammal', desc: 'Completed' }
  ];

  let currentStep = 0;
  if (activeOrder.status === 'assigned') currentStep = 1;
  else if (activeOrder.status === 'on_the_way' || activeOrder.status === 'work_started') currentStep = 2;
  else if (activeOrder.status === 'completed') currentStep = 3;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-[#0e1017] rounded-3xl max-w-2xl w-full shadow-2xl border border-amber-500/30 overflow-hidden my-auto flex flex-col max-h-[94vh] text-white">
        {/* Header */}
        <div className="px-4 sm:px-5 py-3.5 sm:py-4 bg-[#141622] border-b border-amber-500/20 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-400 flex items-center justify-center font-bold text-xs shadow-xs">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-base font-black text-white">
                  Live Order o Dispatch Tracker
                </h3>
                <span className="font-mono text-xs text-amber-300 font-bold bg-amber-950/80 border border-amber-600/40 px-2 py-0.5 rounded-md">
                  {activeOrder.id}
                </span>
              </div>
              <p className="text-[10px] text-amber-400/80">Khanewal city aur qareebi ilaqon mein real-time updates</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Order Selector if customer has multiple orders */}
            {orders.length > 1 && (
              <select
                value={activeOrder.id}
                onChange={(e) => onSelectOrder(e.target.value)}
                className="bg-slate-900 text-amber-400 text-xs rounded-xl px-2 py-1 border border-amber-500/30"
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
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-3 sm:p-5 overflow-y-auto space-y-4">
          {/* Progress Stepper */}
          <div className="bg-[#121420] border border-slate-800 rounded-2xl p-3 sm:p-4">
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2 relative">
              {steps.map((st, i) => {
                const isPassed = i <= currentStep && activeOrder.status !== 'cancelled';
                const isCurrent = i === currentStep && activeOrder.status !== 'cancelled';
                return (
                  <div key={i} className="flex flex-col items-center text-center relative z-10">
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isPassed
                          ? 'bg-amber-400 text-slate-950 shadow-xs'
                          : 'bg-slate-800 text-slate-500'
                      } ${isCurrent ? 'ring-4 ring-amber-400/30 scale-105' : ''}`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4 text-slate-950" /> : i + 1}
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold text-white mt-2 line-clamp-1">{st.label}</span>
                    <span className="text-[9px] sm:text-[10px] text-slate-400 hidden sm:block">{st.desc}</span>
                  </div>
                );
              })}
            </div>

            {/* Status note banner */}
            <div className="mt-3 pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="font-semibold text-slate-300">
                  Mojooda Status:{' '}
                  <span className="font-bold text-amber-400">
                    {activeOrder.status === 'pending' && 'Worker ki tasdeeq ka intezar'}
                    {activeOrder.status === 'assigned' && 'Worker assign ho chuka hai'}
                    {activeOrder.status === 'on_the_way' && 'Worker aap ke patay ki taraf rawana hai'}
                    {activeOrder.status === 'work_started' && 'Kaam jari hai'}
                    {activeOrder.status === 'completed' && 'Order kamyabi se mukammal ho chuka hai'}
                    {activeOrder.status === 'cancelled' && 'Order cancel kar diya gaya hai'}
                  </span>
                </span>
              </div>
              {activeOrder.etaMinutes && activeOrder.status !== 'completed' && (
                <div className="flex items-center gap-1.5 text-slate-300 font-mono text-xs">
                  <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Mutawaqqah Pohanchne ka Waqt: <strong className="text-amber-400">~{activeOrder.etaMinutes} Min</strong></span>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Live Route View */}
          <div className="relative rounded-2xl overflow-hidden border border-amber-500/30 bg-slate-950 text-white p-4 sm:p-5 min-h-[190px] sm:min-h-[220px] flex flex-col justify-between shadow-inner">
            <div className="absolute inset-0 opacity-25 pointer-events-none bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]" />

            <div className="relative z-10 flex items-center justify-between text-xs">
              <div className="bg-slate-900/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-mono text-emerald-300 text-[11px]">Khanewal GPS Connected</span>
              </div>
              <span className="text-slate-300 font-mono text-[11px]">
                Khanewal City Zone
              </span>
            </div>

            {/* Route graphic */}
            <div className="relative z-10 py-4 sm:py-6 px-2">
              <div className="flex items-center justify-between relative">
                <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-700 rounded-full" />
                <div 
                  className="absolute left-6 top-1/2 -translate-y-1/2 h-1 bg-amber-400 rounded-full transition-all duration-700" 
                  style={{ width: `${Math.min(100, Math.max(10, currentStep * 33))}%` }}
                />

                {/* Pickup point */}
                <div className="relative flex flex-col items-center">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-800 border-2 border-amber-400 flex items-center justify-center shadow-lg">
                    <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
                  </div>
                  <span className="text-[10px] text-slate-300 font-medium mt-1 whitespace-nowrap">
                    Dukan / Base
                  </span>
                </div>

                {/* Moving Courier icon */}
                <div className="relative flex flex-col items-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-400 text-slate-950 border-2 border-white flex items-center justify-center shadow-xl animate-bounce">
                    {activeOrder.category === 'transport_cargo' ? (
                      <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950" />
                    ) : activeOrder.category === 'home_services' ? (
                      <Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950" />
                    ) : (
                      <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950" />
                    )}
                  </div>
                  <span className="text-[10px] text-amber-300 font-bold mt-1">
                    {activeOrder.status === 'completed' ? 'Pohanch gaya' : 'Rastay mein hai'}
                  </span>
                </div>

                {/* Destination */}
                <div className="relative flex flex-col items-center">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-800 border-2 border-emerald-400 flex items-center justify-center shadow-lg">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <span className="text-[10px] text-slate-300 font-medium mt-1 whitespace-nowrap">
                    Aap ka Pata
                  </span>
                </div>
              </div>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 gap-1.5">
              <span className="truncate max-w-full sm:max-w-[340px]">
                Pata: {activeOrder.deliveryAddress}
              </span>
              <span className="font-mono text-emerald-400 font-semibold shrink-0">
                Khanewal Local Corridor
              </span>
            </div>
          </div>

          {/* Event Planning Banner if applicable */}
          {activeOrder.category === 'event_planning' && activeOrder.eventDetails && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-slate-900 to-amber-950/20 border border-amber-500/40 text-xs text-amber-200 space-y-1.5 shadow-md">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-300 text-sm flex items-center gap-1.5">
                  <span>🎪</span>
                  <span>{activeOrder.eventDetails.eventTitle}</span>
                </span>
                <span className="font-bold bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full text-[11px]">
                  {activeOrder.eventDetails.guestCount} Moazzaz Mehman
                </span>
              </div>
              <p className="text-slate-300 text-[11px]">
                📍 Venue: <strong className="text-white">{activeOrder.eventDetails.venueNameOrAddress}</strong> ({activeOrder.eventDetails.khanewalArea})
              </p>
              <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-amber-400 pt-1 border-t border-amber-500/20">
                <span>📅 Tareekh Taqreeb: {activeOrder.eventDetails.eventDate} ({activeOrder.eventDetails.eventTimeSlot})</span>
                <span>Budget Takhmeenah: PKR {activeOrder.pricing.total.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Assigned Provider Profile Card */}
          {activeOrder.assignedProviderName ? (
            <div className="p-4 rounded-2xl border border-amber-500/30 bg-[#121422] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md text-white">
              <div className="flex items-center gap-3">
                <img
                  src={activeOrder.assignedProviderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={activeOrder.assignedProviderName}
                  className="w-12 h-12 rounded-full object-cover border border-amber-400/50 shadow-xs shrink-0"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                  }}
                />
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="font-bold text-white text-sm">{activeOrder.assignedProviderName}</h4>
                    <span className="text-[11px] text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      Tasdeeq Shuda Worker
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {activeOrder.category === 'home_services' 
                      ? 'Mahir o Tasdeeq Shuda Technician (Khanewal)' 
                      : activeOrder.category === 'event_planning'
                      ? 'Event Coordinator o Manager (Khanewal Taqreeb)'
                      : 'Tasdeeq Shuda Courier Rider (Khanewal)'}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-amber-400 font-bold mt-0.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{activeOrder.assignedProviderRating || 4.9}</span>
                    <span className="text-slate-400 font-normal">· (Tasdeeq Shuda Khanewal Partner)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <a
                  href={`tel:${activeOrder.assignedProviderPhone || '03040975351'}`}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 border border-slate-700"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>Call Karein</span>
                </a>
                <button
                  type="button"
                  onClick={() => setShowChat(!showChat)}
                  className="px-3.5 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-black rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-slate-950" />
                  <span>Chat ({chatHistory.length})</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl border border-dashed border-amber-500/40 bg-amber-950/20 text-xs flex items-center justify-between gap-3 text-amber-200">
              <div className="space-y-1">
                <p className="font-bold text-amber-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  Qareebi Khanewal workers ko notification bheja ja chuka hai...
                </p>
                <p className="text-slate-300 text-[11px]">
                  Khanewal city aur aas paas ke dastyab technicians ya riders ko yeh order mosool ho chuka hai. Jald hi koi worker aap ka kaam qubool kar le ga.
                </p>
              </div>
            </div>
          )}

          {/* Quick Chat Accordion */}
          {showChat && (
            <div className="p-4 rounded-2xl border border-slate-700 bg-[#141724] space-y-3 text-slate-100">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-amber-300">
                  {activeOrder.assignedProviderName || 'Worker'} ke sath live rabta
                </span>
                <button onClick={() => setShowChat(false)} className="text-slate-400 hover:text-white cursor-pointer">
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
                          ? 'bg-amber-400 text-slate-950 font-medium rounded-br-none'
                          : 'bg-slate-900 border border-slate-700 text-slate-200 rounded-bl-none shadow-2xs'
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
                  placeholder="Koi khas hidayat likhein (Misaal: Ghar ke bahar bell bajayein)..."
                  className="flex-1 text-xs rounded-xl border border-slate-700 px-3 py-2 bg-slate-950 text-white focus:outline-hidden focus:border-amber-400"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black cursor-pointer"
                >
                  Bheinjein
                </button>
              </form>
            </div>
          )}

          {/* Real Timeline History */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Order Timeline o Marahil (Status Timeline)
            </h4>
            <div className="space-y-2 text-xs">
              {activeOrder.timeline.map((event, idx) => (
                <div key={idx} className="flex items-start gap-3 p-2.5 rounded-xl bg-[#121422] border border-slate-800">
                  <span className="font-mono text-amber-400 text-[11px] shrink-0 pt-0.5">{event.timestamp}</span>
                  <div className="space-y-0.5">
                    <p className="font-bold text-white">{event.label}</p>
                    {event.note && <p className="text-slate-400 text-[11px]">{event.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Cancel Order Option if still pending or assigned */}
          {(activeOrder.status === 'pending' || activeOrder.status === 'assigned') && (
            <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-red-300 block">Kya aap yeh order cancel karna chahte hain?</span>
                <span className="text-slate-400 text-[11px]">Worker ke rawana hone se pehle aap bila muawza order cancel kar sakte hain.</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Kya aap waqayi yeh order cancel karna chahte hain? (Are you sure you want to cancel this booking?)')) {
                    Store.updateOrderStatus(activeOrder.id, 'cancelled', 'Sarif ki taraf se cancel kiya gaya (Cancelled by customer)');
                  }
                }}
                className="px-3.5 py-1.5 bg-red-600/80 hover:bg-red-600 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shrink-0"
              >
                Order Cancel Karein
              </button>
            </div>
          )}

          {/* Rate & Review if completed */}
          {activeOrder.status === 'completed' && (
            <div className="p-4 rounded-2xl bg-[#121422] border border-amber-500/30 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-bold text-white block">Kaam kamyabi se mukammal ho gaya!</span>
                <span className="text-slate-300">
                  {activeOrder.review ? 'Shukriya! Aap ne ' + activeOrder.review.rating + ' stars rating di hai.' : 'Apne tajrubay ke baray mein worker ko rating aur feedback dein.'}
                </span>
              </div>
              <button
                onClick={() => onOpenReviewModal(activeOrder)}
                className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black rounded-xl transition-colors shrink-0 cursor-pointer"
              >
                {activeOrder.review ? 'Review Dekhein' : 'Rating Dein'}
              </button>
            </div>
          )}
        </div>

        {/* Clean Production Footer */}
        <div className="px-5 py-3.5 bg-[#141622] border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Khanewal Connect Support: 0304-0975351 / 0304-7705212</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            Band Karein (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
