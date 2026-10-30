import React, { useState } from 'react';
import { Order, OrderReview } from '../../types';
import { Store } from '../../services/store';
import { 
  X, 
  ShoppingBag, 
  Wrench, 
  Truck, 
  Clock, 
  CheckCircle2, 
  Star, 
  MapPin, 
  Receipt, 
  ChevronRight,
  Filter,
  Sparkles
} from 'lucide-react';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onOpenLiveTracker: (order: Order) => void;
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({
  isOpen,
  onClose,
  orders,
  onOpenLiveTracker
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [selectedReviewOrder, setSelectedReviewOrder] = useState<Order | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Punctual', 'Professional']);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  const filteredOrders = orders.filter((o) => {
    if (filter === 'active') return o.status !== 'completed' && o.status !== 'cancelled';
    if (filter === 'completed') return o.status === 'completed';
    return true;
  });

  const availableTags = ['Punctual', 'Professional', 'Careful Handling', 'Clean Work', 'Polite', 'Affordable'];

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReviewOrder) return;

    const review: OrderReview = {
      rating,
      comment: comment.trim() || 'Great service, highly satisfied!',
      tags: selectedTags,
      reviewedAt: new Date().toISOString()
    };

    Store.addReview(selectedReviewOrder.id, review);
    setSelectedReviewOrder(null);
    setComment('');
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'custom_delivery': return <ShoppingBag className="w-4 h-4 text-blue-400" />;
      case 'home_services': return <Wrench className="w-4 h-4 text-emerald-400" />;
      case 'transport_cargo': return <Truck className="w-4 h-4 text-indigo-400" />;
      case 'event_planning': return <Sparkles className="w-4 h-4 text-amber-400" />;
      default: return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-[#0e1017] rounded-3xl max-w-3xl w-full shadow-2xl border border-amber-500/30 overflow-hidden my-auto flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-[#141622] border-b border-amber-500/20 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white">آرڈرز کی تاریخ اور رسیدیں (Order History)</h3>
              <p className="text-[10px] sm:text-xs text-amber-400/80">لائیو ٹریکنگ، تصدیق شدہ رسید اور کاریگر ریٹنگ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="px-3 sm:px-6 py-2.5 bg-[#10121b] border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl text-[11px] font-bold">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                filter === 'all' ? 'bg-amber-400 text-slate-950 font-black shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              تمام ({orders.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                filter === 'active' ? 'bg-amber-400 text-slate-950 font-black shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              جاری ({orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                filter === 'completed' ? 'bg-emerald-500 text-slate-950 font-black shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              مکمل ({orders.filter(o => o.status === 'completed').length})
            </button>
          </div>

          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
            {filteredOrders.length} records
          </span>
        </div>

        {/* Order List */}
        <div className="p-3 sm:p-5 overflow-y-auto space-y-3">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <p className="text-sm font-semibold">No orders in this view</p>
              <p className="text-xs">Your placed orders will show up here.</p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const isActive = order.status !== 'completed' && order.status !== 'cancelled';
              return (
                <div
                  key={order.id}
                  className="rounded-2xl border border-slate-800 bg-[#121420] p-3.5 sm:p-4 space-y-2.5 hover:border-amber-500/40 transition-colors text-white"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-700">
                        {getCategoryIcon(order.category)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-amber-400">{order.id}</span>
                          <span className="text-slate-600">·</span>
                          <span className="text-xs text-slate-300 font-medium capitalize">
                            {order.category.replace('_', ' ')}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {new Date(order.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold capitalize ${
                        order.status === 'completed' 
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                          : order.status === 'cancelled'
                          ? 'bg-red-950/80 text-red-300 border border-red-500/40'
                          : 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                      }`}>
                        {order.status.replace('_', ' ')}
                      </span>
                      <span className="font-mono font-black text-sm text-amber-400">
                        PKR {order.pricing.total.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Body description */}
                  <div className="text-xs text-slate-300 space-y-1">
                    {order.category === 'custom_delivery' && order.deliveryDetails && (
                      <p className="font-semibold text-white line-clamp-1">
                        سامان: {order.deliveryDetails.itemName}
                      </p>
                    )}
                    {order.category === 'home_services' && order.serviceDetails && (
                      <p className="font-semibold text-white">
                        سروس: {order.serviceDetails.serviceName} ({order.serviceDetails.issueDescription})
                      </p>
                    )}
                    {order.category === 'transport_cargo' && order.transportDetails && (
                      <p className="font-semibold text-white">
                        گاڑی: {order.transportDetails.vehicleName} · {order.transportDetails.cargoDescription}
                      </p>
                    )}
                    {order.category === 'event_planning' && order.eventDetails && (
                      <div className="space-y-0.5">
                        <p className="font-semibold text-amber-300">
                          🎪 {order.eventDetails.eventTitle} ({order.eventDetails.guestCount} معزز مہمان)
                        </p>
                        <p className="text-[11px] text-slate-400">
                          وینیو: {order.eventDetails.venueNameOrAddress} · تاریخ: {order.eventDetails.eventDate}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">{order.deliveryAddress}</span>
                    </div>
                  </div>

                  {/* Review Banner if already rated */}
                  {order.review && (
                    <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex text-amber-400">
                          {Array.from({ length: order.review.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400" />
                          ))}
                        </div>
                        <span className="italic line-clamp-1">"{order.review.comment}"</span>
                      </div>
                      <span className="text-[10px] text-amber-400 font-mono">Reviewed</span>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-800/80">
                    <button
                      onClick={() => setReceiptOrder(order)}
                      className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>رسید دیکھیں (Receipt)</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {isActive && (
                        <>
                          {(order.status === 'pending' || order.status === 'assigned') && (
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm('کیا آپ واقعی یہ آرڈر منسوخ کرنا چاہتے ہیں؟ (Are you sure you want to cancel this booking?)')) {
                                  Store.updateOrderStatus(order.id, 'cancelled', 'صارف کی طرف سے منسوخ کیا گیا (Cancelled by customer)');
                                }
                              }}
                              className="px-2.5 py-1 text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-red-500/30 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                            >
                              منسوخ کریں (Cancel)
                            </button>
                          )}

                          <button
                            onClick={() => {
                              onClose();
                              onOpenLiveTracker(order);
                            }}
                            className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                          >
                            <span>لائیو ٹریک کریں</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}

                      {order.status === 'completed' && (
                        <button
                          onClick={() => {
                            setSelectedReviewOrder(order);
                            setRating(order.review?.rating || 5);
                            setComment(order.review?.comment || '');
                            setSelectedTags(order.review?.tags || ['Punctual', 'Professional']);
                          }}
                          className="px-3 py-1.5 border border-amber-500/40 hover:bg-slate-800 text-amber-300 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                        >
                          <Star className="w-3.5 h-3.5 text-amber-400" />
                          <span>{order.review ? 'ریویو تبدیل کریں' : 'کاریگر کو ریٹ کریں'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Receipt Modal Overlay */}
        {receiptOrder && (
          <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h4 className="font-bold text-slate-900">Official OmniServe Receipt</h4>
                  <p className="text-xs text-slate-500 font-mono">Order {receiptOrder.id}</p>
                </div>
                <button onClick={() => setReceiptOrder(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer:</span>
                  <span className="font-semibold text-slate-900">{receiptOrder.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Assigned Provider:</span>
                  <span className="font-semibold text-slate-900">{receiptOrder.assignedProviderName || 'Verified Partner'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Method:</span>
                  <span className="font-semibold uppercase">{receiptOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Status:</span>
                  <span className="font-semibold text-emerald-600 uppercase">{receiptOrder.paymentStatus}</span>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-600">
                  <span>Base Fee:</span>
                  <span>PKR {receiptOrder.pricing.baseFee}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Service / Distance Charge:</span>
                  <span>PKR {receiptOrder.pricing.serviceOrDeliveryFee}</span>
                </div>
                {receiptOrder.pricing.itemOrDistanceBudget > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Store Item Procure Budget:</span>
                    <span>PKR {receiptOrder.pricing.itemOrDistanceBudget}</span>
                  </div>
                )}
                {receiptOrder.pricing.helperFee > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Helper / Labor Charge:</span>
                    <span>PKR {receiptOrder.pricing.helperFee}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Platform & Insurance:</span>
                  <span>PKR {receiptOrder.pricing.platformFee}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900 text-sm">
                  <span>Grand Total:</span>
                  <span>PKR {receiptOrder.pricing.total.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  alert('Receipt downloaded / printed successfully.');
                  setReceiptOrder(null);
                }}
                className="w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
              >
                Download / Print PDF Receipt
              </button>
            </div>
          </div>
        )}

        {/* Review & Rating Modal Overlay */}
        {selectedReviewOrder && (
          <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h4 className="font-bold text-slate-900 text-sm">
                  Rate {selectedReviewOrder.assignedProviderName || 'Provider'}
                </h4>
                <button onClick={() => setSelectedReviewOrder(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveReview} className="space-y-4 text-xs">
                {/* Star Rating */}
                <div className="flex flex-col items-center gap-1.5 py-2">
                  <span className="text-slate-500 font-medium">Select Rating</span>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="font-bold text-slate-800 text-sm">{rating} / 5 Stars</span>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">What went well?</label>
                  <div className="flex flex-wrap gap-1.5">
                    {availableTags.map((tag) => (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => handleToggleTag(tag)}
                        className={`px-2.5 py-1 rounded-lg border transition-colors ${
                          selectedTags.includes(tag)
                            ? 'bg-amber-100 border-amber-300 text-amber-900 font-semibold'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Your Written Review</label>
                  <textarea
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Write a few words about your experience with the courier or technician..."
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedReviewOrder(null)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
