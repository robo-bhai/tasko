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
  ChevronRight,
  Sparkles,
  RotateCw
} from 'lucide-react';

interface LiveOrderTrackerProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  selectedOrderId?: string;
  onSelectOrder: (orderId: string) => void;
  onOpenReviewModal: (order: Order) => void;
  onSwitchToProviderView: () => void;
}

export const LiveOrderTracker: React.FC<LiveOrderTrackerProps> = ({
  isOpen,
  onClose,
  orders,
  selectedOrderId,
  onSelectOrder,
  onOpenReviewModal,
  onSwitchToProviderView
}) => {
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'provider'; text: string; time: string }>>([
    { sender: 'provider', text: 'Hello! I am handling your request. On my way shortly.', time: 'Just now' }
  ]);
  const [showChat, setShowChat] = useState(false);
  const [simulating, setSimulating] = useState(false);

  if (!isOpen) return null;

  // Find active or selected order
  const activeOrder = orders.find(o => o.id === selectedOrderId) 
    || orders.find(o => o.status !== 'completed' && o.status !== 'cancelled')
    || orders[0];

  if (!activeOrder) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center shadow-xl space-y-4">
          <p className="text-sm font-semibold text-slate-800">No active orders found.</p>
          <p className="text-xs text-slate-500">Place a delivery, home service, or vehicle transport order to track live.</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const handleSimulateNextStep = () => {
    setSimulating(true);
    let nextStatus: OrderStatus = 'assigned';
    let note = '';

    if (activeOrder.status === 'pending') {
      nextStatus = 'assigned';
      note = 'Auto-assigned nearest verified professional';
      // assign provider if missing
      const provider = Store.getUsers().find(u => u.role === 'provider');
      if (provider) {
        Store.assignProviderToOrder(activeOrder.id, provider);
        setSimulating(false);
        return;
      }
    } else if (activeOrder.status === 'assigned') {
      nextStatus = activeOrder.category === 'home_services' ? 'work_started' : 'on_the_way';
      note = activeOrder.category === 'home_services' ? 'Technician arrived and began diagnostics' : 'Courier picked up package and is en route';
    } else if (activeOrder.status === 'on_the_way' || activeOrder.status === 'work_started') {
      nextStatus = 'completed';
      note = 'Service completed and verified by customer';
    }

    Store.updateOrderStatus(activeOrder.id, nextStatus, note);
    setTimeout(() => {
      setSimulating(false);
    }, 300);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatHistory(prev => [
      ...prev,
      { sender: 'user', text: chatMessage, time }
    ]);
    const userText = chatMessage;
    setChatMessage('');

    // Simulated provider reply
    setTimeout(() => {
      setChatHistory(prev => [
        ...prev,
        { 
          sender: 'provider', 
          text: `Got your message ("${userText}"). Everything is on schedule!`, 
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        }
      ]);
    }, 1000);
  };

  // Steps calculation
  const steps = [
    { label: 'Requested', desc: 'Order received in system' },
    { label: 'Assigned', desc: 'Professional confirmed' },
    { label: activeOrder.category === 'home_services' ? 'In Progress' : 'On The Way', desc: 'Active execution' },
    { label: 'Delivered', desc: 'Completed & verified' }
  ];

  let currentStep = 0;
  if (activeOrder.status === 'assigned') currentStep = 1;
  else if (activeOrder.status === 'on_the_way' || activeOrder.status === 'work_started') currentStep = 2;
  else if (activeOrder.status === 'completed') currentStep = 3;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-xs">
              GPS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Live Tracking & Dispatch</h3>
                <span className="font-mono text-xs text-blue-300 font-semibold bg-blue-950 px-2 py-0.5 rounded">
                  {activeOrder.id}
                </span>
              </div>
              <p className="text-xs text-slate-300">Real-time status updates and provider communication</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Order Selector if customer has multiple */}
            {orders.length > 1 && (
              <select
                value={activeOrder.id}
                onChange={(e) => onSelectOrder(e.target.value)}
                className="bg-slate-800 text-white text-xs rounded-lg px-2 py-1.5 border border-slate-700"
              >
                {orders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.id} - {o.status.replace('_', ' ')}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Progress Tracker Stepper */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
            <div className="grid grid-cols-4 gap-2 relative">
              {steps.map((st, i) => {
                const isPassed = i <= currentStep && activeOrder.status !== 'cancelled';
                const isCurrent = i === currentStep && activeOrder.status !== 'cancelled';
                return (
                  <div key={i} className="flex flex-col items-center text-center relative z-10">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                        isPassed
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-200 text-slate-500'
                      } ${isCurrent ? 'ring-4 ring-blue-100' : ''}`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                    </div>
                    <span className="text-xs font-bold text-slate-900 mt-2 line-clamp-1">{st.label}</span>
                    <span className="text-[10px] text-slate-500 hidden sm:block">{st.desc}</span>
                  </div>
                );
              })}
            </div>

            {/* Status note banner */}
            <div className="mt-4 pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-slate-800">
                  Current Status: <span className="capitalize text-blue-600">{activeOrder.status.replace('_', ' ')}</span>
                </span>
              </div>
              {activeOrder.etaMinutes && activeOrder.status !== 'completed' && (
                <div className="flex items-center gap-1.5 text-slate-600 font-mono">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Estimated Arrival: <strong className="text-slate-900">~{activeOrder.etaMinutes} mins</strong></span>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Simulated Live Map / Route View */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 text-white p-5 min-h-[220px] flex flex-col justify-between shadow-inner">
            {/* Visual map route background styling */}
            <div className="absolute inset-0 opacity-25 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

            <div className="relative z-10 flex items-center justify-between text-xs">
              <div className="bg-slate-900/90 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-mono text-emerald-300">Simulated GPS Live Link</span>
              </div>
              <span className="text-slate-400 font-mono text-[11px]">Sector F-8/2 · Islamabad Corridor</span>
            </div>

            {/* Route simulation graphic */}
            <div className="relative z-10 py-6 px-4">
              <div className="flex items-center justify-between relative">
                {/* Connecting line */}
                <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-700 rounded-full" />
                <div 
                  className="absolute left-6 top-1/2 -translate-y-1/2 h-1 bg-blue-500 rounded-full transition-all duration-700" 
                  style={{ width: `${Math.min(100, Math.max(10, currentStep * 33))}%` }}
                />

                {/* Pickup point */}
                <div className="relative flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-blue-400 flex items-center justify-center shadow-lg">
                    <ShoppingBag className="w-3.5 h-3.5 text-blue-300" />
                  </div>
                  <span className="text-[10px] text-slate-300 font-medium mt-1 whitespace-nowrap">
                    Pickup / Base
                  </span>
                </div>

                {/* Moving Courier icon */}
                <div className="relative flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center shadow-xl animate-bounce">
                    {activeOrder.category === 'transport_cargo' ? (
                      <Truck className="w-5 h-5 text-white" />
                    ) : activeOrder.category === 'home_services' ? (
                      <Wrench className="w-5 h-5 text-white" />
                    ) : (
                      <Truck className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <span className="text-[10px] text-blue-300 font-bold mt-1">
                    {activeOrder.status === 'completed' ? 'Arrived & Done' : 'En Route'}
                  </span>
                </div>

                {/* Destination */}
                <div className="relative flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-emerald-400 flex items-center justify-center shadow-lg">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <span className="text-[10px] text-slate-300 font-medium mt-1 whitespace-nowrap">
                    Your Address
                  </span>
                </div>
              </div>
            </div>

            <div className="relative z-10 flex items-center justify-between text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <span className="truncate max-w-[320px]">
                Destination: {activeOrder.deliveryAddress}
              </span>
              <span className="font-mono text-emerald-400 font-semibold shrink-0">
                Speed: 38 km/h
              </span>
            </div>
          </div>

          {/* Assigned Provider Profile Card (if assigned) */}
          {activeOrder.assignedProviderName ? (
            <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={activeOrder.assignedProviderAvatar || '/src/assets/images/app_avatar_provider_1793035360068.jpg'}
                  alt={activeOrder.assignedProviderName}
                  className="w-12 h-12 rounded-full object-cover border border-slate-200 shadow-xs"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                  }}
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-slate-900 text-sm">{activeOrder.assignedProviderName}</h4>
                    <span className="text-xs text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5">
                      <ShieldCheck className="w-3 h-3" />
                      Verified
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {activeOrder.category === 'home_services' ? 'Senior Certified Technician' : 'Verified Logistics Specialist'}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-amber-500 font-bold mt-0.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{activeOrder.assignedProviderRating || 4.9}</span>
                    <span className="text-slate-400 font-normal">· (140+ completed jobs)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <a
                  href={`tel:${activeOrder.assignedProviderPhone || '+923001234567'}`}
                  onClick={(e) => {
                    e.preventDefault();
                    alert(`Calling ${activeOrder.assignedProviderName} at ${activeOrder.assignedProviderPhone || '+92 321 9876543'}...`);
                  }}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-600" />
                  <span>Call</span>
                </a>
                <button
                  type="button"
                  onClick={() => setShowChat(!showChat)}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Chat ({chatHistory.length})</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-dashed border-amber-300 bg-amber-50/60 text-xs flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="font-bold text-amber-900">Broadcasting to Nearby Providers...</p>
                <p className="text-amber-700">Couriers and technicians in your area have received this alert.</p>
              </div>
              <button
                onClick={onSwitchToProviderView}
                className="px-3 py-1.5 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 text-xs shrink-0"
              >
                Accept as Worker →
              </button>
            </div>
          )}

          {/* Quick In-App Chat Accordion */}
          {showChat && (
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-800">
                  Chat with {activeOrder.assignedProviderName || 'Provider'}
                </span>
                <button onClick={() => setShowChat(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                {chatHistory.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`text-xs px-3 py-1.5 rounded-xl max-w-[80%] ${
                        msg.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
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
                  placeholder="Type a message (e.g. Ring doorbell when outside)..."
                  className="flex-1 text-xs rounded-lg border border-slate-300 px-3 py-1.5 bg-white"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-500"
                >
                  Send
                </button>
              </form>
            </div>
          )}

          {/* Timeline Audit History */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Status Timeline
            </h4>
            <div className="space-y-2 text-xs">
              {activeOrder.timeline.map((event, idx) => (
                <div key={idx} className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-mono text-slate-500 text-[11px] shrink-0 pt-0.5">{event.timestamp}</span>
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-900">{event.label}</p>
                    {event.note && <p className="text-slate-500 text-[11px]">{event.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Review prompt if order is completed */}
          {activeOrder.status === 'completed' && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-bold text-emerald-900 block">Service Successfully Completed!</span>
                <span className="text-emerald-700">
                  {activeOrder.review ? 'Thank you! You rated this order ' + activeOrder.review.rating + ' stars.' : 'How was your experience? Leave a review for the provider.'}
                </span>
              </div>
              <button
                onClick={() => onOpenReviewModal(activeOrder)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-colors shrink-0"
              >
                {activeOrder.review ? 'Edit Review' : 'Rate & Review'}
              </button>
            </div>
          )}
        </div>

        {/* Footer with Demo Simulator Controls */}
        <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Demo Simulator:</span>
            {activeOrder.status !== 'completed' && activeOrder.status !== 'cancelled' ? (
              <button
                onClick={handleSimulateNextStep}
                disabled={simulating}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <RotateCw className={`w-3.5 h-3.5 ${simulating ? 'animate-spin' : ''}`} />
                <span>Simulate Next Progression</span>
              </button>
            ) : (
              <span className="text-xs text-emerald-700 font-semibold">Order Complete</span>
            )}
            <button
              onClick={() => {
                onClose();
                onSwitchToProviderView();
              }}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold underline"
            >
              Open in Worker Portal
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
