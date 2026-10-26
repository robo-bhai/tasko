import React, { useState } from 'react';
import { User, Order, OrderStatus } from '../../types';
import { Store } from '../../services/store';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  Star, 
  Truck, 
  Wrench, 
  ShoppingBag, 
  Wallet, 
  ArrowUpRight, 
  Power, 
  AlertCircle,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Check
} from 'lucide-react';

interface ProviderDashboardProps {
  currentUser: User;
  orders: Order[];
  onOpenCustomerView: () => void;
}

export const ProviderDashboard: React.FC<ProviderDashboardProps> = ({
  currentUser,
  orders,
  onOpenCustomerView
}) => {
  const [isOnline, setIsOnline] = useState(currentUser.isOnline ?? true);
  const [activeTab, setActiveTab] = useState<'available' | 'active' | 'history'>('available');
  const [withdrawalMessage, setWithdrawalMessage] = useState('');

  const handleToggleOnline = () => {
    const updated = !isOnline;
    setIsOnline(updated);
    Store.updateUser({ ...currentUser, isOnline: updated });
  };

  // Switch between sample provider personas
  const handleSwitchProvider = (providerId: string) => {
    Store.switchUserById(providerId);
  };

  const providers = Store.getUsers().filter(u => u.role === 'provider');

  // Available incoming jobs (pending status)
  const incomingJobs = orders.filter(o => o.status === 'pending');

  // Currently assigned active job for this provider
  const activeTask = orders.find(
    o => o.assignedProviderId === currentUser.id && o.status !== 'completed' && o.status !== 'cancelled'
  );

  // Completed jobs by this provider
  const completedJobs = orders.filter(
    o => o.assignedProviderId === currentUser.id && o.status === 'completed'
  );

  const handleAcceptJob = (order: Order) => {
    Store.assignProviderToOrder(order.id, currentUser);
    setActiveTab('active');
  };

  const handleUpdateStatus = (newStatus: OrderStatus, note: string) => {
    if (!activeTask) return;
    Store.updateOrderStatus(activeTask.id, newStatus, note);
  };

  const handleWithdraw = () => {
    if (currentUser.walletBalance <= 0) {
      alert('Wallet balance is zero.');
      return;
    }
    const amount = currentUser.walletBalance;
    Store.updateUser({ ...currentUser, walletBalance: 0 });
    setWithdrawalMessage(`Successfully transferred PKR ${amount.toLocaleString()} to your JazzCash / Bank account!`);
    setTimeout(() => setWithdrawalMessage(''), 5000);
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'custom_delivery':
        return <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">Custom Delivery</span>;
      case 'home_services':
        return <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">Home Service</span>;
      case 'transport_cargo':
        return <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">Transport & Cargo</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header Profile & Mode Bar */}
      <section className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-700 shadow-md"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                }}
              />
              <span
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 ${
                  isOnline ? 'bg-emerald-400' : 'bg-slate-500'
                }`}
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold">{currentUser.name}</h1>
                <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {currentUser.serviceSkill || currentUser.vehicleType || 'Professional Partner'}
              </p>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {currentUser.rating || 4.9}
                </span>
                <span>·</span>
                <span>{currentUser.completedJobsCount || 148} Total Jobs</span>
                <span>·</span>
                <span className="text-emerald-400">98% Acceptance</span>
              </div>
            </div>
          </div>

          {/* Persona quick switch for testing */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex flex-col text-xs text-slate-400">
              <span className="text-[11px] font-semibold text-slate-300">View as Worker Persona:</span>
              <div className="flex gap-1.5 mt-1">
                {providers.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSwitchProvider(p.id)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                      p.id === currentUser.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {p.name.split(' ')[0]} ({p.providerCategory === 'cargo_driver' ? 'Driver' : p.providerCategory === 'delivery_courier' ? 'Rider' : 'Tech'})
                  </button>
                ))}
              </div>
            </div>

            {/* Online / Offline Toggle */}
            <button
              onClick={handleToggleOnline}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${
                isOnline
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
              }`}
            >
              <Power className="w-4 h-4" />
              <span>{isOnline ? 'Online & Receiving Jobs' : 'Offline'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Provider KPI Metric Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Wallet Balance */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Withdrawable Wallet
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold font-mono text-slate-900">
              PKR {currentUser.walletBalance.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">85% net earnings after platform commission</p>
          </div>
          <button
            onClick={handleWithdraw}
            disabled={currentUser.walletBalance <= 0}
            className="mt-4 text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 disabled:opacity-40"
          >
            <span>Instant Cashout</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Active Task */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Current Active Task
            </span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-slate-900 font-mono">
              {activeTask ? '1 In-Flight' : '0 Idle'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {activeTask ? `Status: ${activeTask.status.replace('_', ' ')}` : 'Ready for incoming orders'}
            </p>
          </div>
          {activeTask ? (
            <button
              onClick={() => setActiveTab('active')}
              className="mt-4 text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Manage Active Job</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span className="mt-4 text-xs text-slate-400">No active assignment</span>
          )}
        </div>

        {/* Available Requests */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Broadcasts
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-slate-900 font-mono">
              {incomingJobs.length} Nearby
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Customers waiting for fulfillment</p>
          </div>
          <button
            onClick={() => setActiveTab('available')}
            className="mt-4 text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1"
          >
            <span>Review Job Radar</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Customer Rating */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Performance Rating
            </span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-center gap-1.5">
              <p className="text-2xl font-bold text-slate-900 font-mono">
                {currentUser.rating || 4.9}
              </p>
              <div className="flex text-amber-400">
                <Star className="w-4 h-4 fill-amber-400" />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Top Rated Tier 1 Provider</p>
          </div>
          <span className="mt-4 text-xs text-emerald-600 font-medium">100% On-time guarantee</span>
        </div>
      </section>

      {/* Withdrawal Notification Banner */}
      {withdrawalMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{withdrawalMessage}</span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('available')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'available'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>Incoming Available Jobs</span>
          {incomingJobs.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center">
              {incomingJobs.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'active'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>My Active Task</span>
          {activeTask && (
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'history'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>Completed History ({completedJobs.length})</span>
        </button>
      </div>

      {/* Tab Content 1: Available Jobs Radar */}
      {activeTab === 'available' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              Nearby Job Requests Awaiting Worker Assignment
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              Auto-refreshed live
            </span>
          </div>

          {incomingJobs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">No Pending Requests Right Now</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                All requests have been assigned. Switch back to the Customer Portal to place a test delivery or repair booking!
              </p>
              <button
                onClick={onOpenCustomerView}
                className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-500"
              >
                Place New Customer Order →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {incomingJobs.map((job) => {
                const providerNetPayout = Math.round(job.pricing.total * 0.85);
                return (
                  <div
                    key={job.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900">{job.id}</span>
                          {getCategoryBadge(job.category)}
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">Your Net Payout</span>
                          <p className="font-mono font-bold text-emerald-600 text-base">
                            PKR {providerNetPayout.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Job details */}
                      <div>
                        {job.category === 'custom_delivery' && job.deliveryDetails && (
                          <div className="space-y-1">
                            <h4 className="font-bold text-slate-900 text-sm">
                              {job.deliveryDetails.itemName}
                            </h4>
                            <p className="text-xs text-slate-500">
                              Pickup Shop: <strong className="text-slate-700">{job.deliveryDetails.storeName}</strong>
                            </p>
                            <p className="text-xs text-slate-500">
                              Estimated item shopping budget: PKR {job.deliveryDetails.estimatedBudget}
                            </p>
                          </div>
                        )}

                        {job.category === 'home_services' && job.serviceDetails && (
                          <div className="space-y-1">
                            <h4 className="font-bold text-slate-900 text-sm">
                              {job.serviceDetails.serviceName}
                            </h4>
                            <p className="text-xs text-slate-600 font-medium">
                              Issue: {job.serviceDetails.issueDescription}
                            </p>
                            <p className="text-xs text-slate-500">
                              Slot: {job.serviceDetails.scheduledDate} · {job.serviceDetails.scheduledTimeSlot}
                            </p>
                          </div>
                        )}

                        {job.category === 'transport_cargo' && job.transportDetails && (
                          <div className="space-y-1">
                            <h4 className="font-bold text-slate-900 text-sm">
                              {job.transportDetails.vehicleName}
                            </h4>
                            <p className="text-xs text-slate-600">
                              Cargo: {job.transportDetails.cargoDescription} (~{job.transportDetails.loadWeightKg} kg)
                            </p>
                            <p className="text-xs text-slate-500">
                              Trip: {job.transportDetails.estimatedDistanceKm} km {job.transportDetails.needsHelper ? `· Includes ${job.transportDetails.helperCount} Helper` : ''}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center gap-1.5 truncate max-w-[280px]">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{job.deliveryAddress}</span>
                        </div>
                        <span className="font-mono text-slate-400 shrink-0">~2.5 km away</span>
                      </div>
                    </div>

                    {/* Accept / Decline actions */}
                    <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                      <button
                        onClick={() => handleAcceptJob(job)}
                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>Accept Job Request</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab Content 2: My Active Task */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900">Active Job Control Center</h3>

          {!activeTask ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h4 className="text-sm font-bold text-slate-900">No Job Currently In Progress</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                You are currently idle and ready for new tasks. Check the Incoming Available Jobs tab to accept a request!
              </p>
              <button
                onClick={() => setActiveTab('available')}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg"
              >
                View Available Jobs →
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-blue-200 p-6 shadow-sm space-y-6">
              {/* Task Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" />
                    <span className="font-mono text-xs font-bold text-slate-900">{activeTask.id}</span>
                    {getCategoryBadge(activeTask.category)}
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">
                    {activeTask.category === 'custom_delivery' && activeTask.deliveryDetails?.itemName}
                    {activeTask.category === 'home_services' && activeTask.serviceDetails?.serviceName}
                    {activeTask.category === 'transport_cargo' && activeTask.transportDetails?.vehicleName}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Client: <strong className="text-slate-800">{activeTask.customerName}</strong> ({activeTask.customerPhone})
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Your Total Payout</span>
                  <p className="font-mono font-bold text-emerald-600 text-xl">
                    PKR {Math.round(activeTask.pricing.total * 0.85).toLocaleString()}
                  </p>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Payment Method: <strong className="uppercase">{activeTask.paymentMethod}</strong>
                  </span>
                </div>
              </div>

              {/* Task Instructions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                    Location & Destination
                  </h5>
                  {activeTask.category === 'custom_delivery' && activeTask.deliveryDetails && (
                    <div className="space-y-1 text-slate-700">
                      <p><strong>Shop Pickup:</strong> {activeTask.deliveryDetails.pickupAddress}</p>
                      <p><strong>Store Name:</strong> {activeTask.deliveryDetails.storeName}</p>
                      <p><strong>Dropoff To:</strong> {activeTask.deliveryDetails.deliveryAddress}</p>
                    </div>
                  )}
                  {activeTask.category === 'home_services' && activeTask.serviceDetails && (
                    <div className="space-y-1 text-slate-700">
                      <p><strong>Service Address:</strong> {activeTask.serviceDetails.serviceAddress}</p>
                      <p><strong>Slot:</strong> {activeTask.serviceDetails.scheduledDate} ({activeTask.serviceDetails.scheduledTimeSlot})</p>
                    </div>
                  )}
                  {activeTask.category === 'transport_cargo' && activeTask.transportDetails && (
                    <div className="space-y-1 text-slate-700">
                      <p><strong>Load At:</strong> {activeTask.transportDetails.pickupLocation}</p>
                      <p><strong>Unload At:</strong> {activeTask.transportDetails.dropoffLocation}</p>
                      <p><strong>Distance:</strong> {activeTask.transportDetails.estimatedDistanceKm} km</p>
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                    Customer Notes & Instructions
                  </h5>
                  <p className="text-slate-700 italic">
                    "{activeTask.deliveryDetails?.notes || activeTask.serviceDetails?.issueDescription || activeTask.transportDetails?.cargoDescription || 'No special instructions provided.'}"
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => alert(`Calling customer ${activeTask.customerName} at ${activeTask.customerPhone}...`)}
                      className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-100 flex items-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5 text-blue-600" />
                      <span>Call Client ({activeTask.customerPhone})</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Live Status Progression Control Bar */}
              <div className="p-5 rounded-xl bg-blue-50/70 border border-blue-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-blue-950 text-xs uppercase tracking-wider">
                    Live Status Updater (Broadcasts instantly to Customer Tracker)
                  </h5>
                  <span className="text-xs font-semibold text-blue-700 capitalize">
                    Current: {activeTask.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={() => handleUpdateStatus('on_the_way', 'Worker has departed and is en route')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      activeTask.status === 'on_the_way'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white border border-blue-300 text-blue-800 hover:bg-blue-100'
                    }`}
                  >
                    1. On The Way / En Route
                  </button>

                  <button
                    onClick={() => handleUpdateStatus('work_started', 'Arrived on-site / Items procured at store')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      activeTask.status === 'work_started'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white border border-blue-300 text-blue-800 hover:bg-blue-100'
                    }`}
                  >
                    2. Arrived On-Site / Work Started
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm('Confirm job completion and credit your wallet?')) {
                        handleUpdateStatus('completed', 'Order successfully fulfilled and payment settled');
                        setActiveTab('history');
                      }
                    }}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 ml-auto"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>3. Complete Job & Collect Payment</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Content 3: Completed History */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900">Completed Jobs & Earnings History</h3>

          {completedJobs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
              No completed jobs recorded yet under this provider persona.
            </div>
          ) : (
            <div className="space-y-3">
              {completedJobs.map((job) => {
                const payout = Math.round(job.pricing.total * 0.85);
                return (
                  <div
                    key={job.id}
                    className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{job.id}</span>
                        {getCategoryBadge(job.category)}
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-500">{new Date(job.updatedAt).toLocaleDateString()}</span>
                      </div>
                      <p className="font-semibold text-slate-800">
                        {job.deliveryDetails?.itemName || job.serviceDetails?.serviceName || job.transportDetails?.vehicleName}
                      </p>
                      <p className="text-slate-500">Client: {job.customerName} · {job.deliveryAddress}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Credited to Wallet</span>
                      <p className="font-mono font-bold text-emerald-600 text-sm">
                        + PKR {payout.toLocaleString()}
                      </p>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold">
                        Paid ({job.paymentMethod.toUpperCase()})
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
