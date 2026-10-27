import React, { useState } from 'react';
import { 
  Order, 
  User, 
  HomeServiceItem, 
  TransportVehicleItem, 
  OrderStatus 
} from '../../types';
import { Store } from '../../services/store';
import { 
  BarChart3, 
  Users, 
  Package, 
  Wrench, 
  Truck, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Edit3, 
  Plus, 
  Save, 
  RotateCcw,
  Search,
  Filter,
  Eye,
  DollarSign
} from 'lucide-react';

interface AdminDashboardProps {
  orders: Order[];
  users: User[];
  services: HomeServiceItem[];
  vehicles: TransportVehicleItem[];
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  orders,
  users,
  services,
  vehicles
}) => {
  const [activeSection, setActiveSection] = useState<'orders' | 'users' | 'catalog'>('orders');
  const [orderSearch, setOrderSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

  // Editable Catalog State
  const [editingServices, setEditingServices] = useState<HomeServiceItem[]>(services);
  const [editingVehicles, setEditingVehicles] = useState<TransportVehicleItem[]>(vehicles);
  const [catalogSavedMessage, setCatalogSavedMessage] = useState('');

  // Admin User Creation Modal State
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('Worker@123');
  const [newUserRole, setNewUserRole] = useState<'provider' | 'customer' | 'admin'>('provider');
  const [newProviderCategory, setNewProviderCategory] = useState<'home_technician' | 'cargo_driver' | 'delivery_courier'>('home_technician');
  const [newSkill, setNewSkill] = useState('HVAC & AC Master Service');
  const [newVehicle, setNewVehicle] = useState('Suzuki Bolan Mini-Pickup');
  const [newBalance, setNewBalance] = useState(5000);
  const [newAddress, setNewAddress] = useState('Sector G-9 Commercial, Islamabad');
  const [userCreatedMessage, setUserCreatedMessage] = useState('');

  // Stats
  const activeOrdersCount = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length;
  const completedOrdersCount = orders.filter(o => o.status === 'completed').length;
  const totalGmv = orders.reduce((sum, o) => sum + o.pricing.total, 0);
  const platformRevenue = Math.round(totalGmv * 0.15); // 15% platform take rate
  const verifiedProvidersCount = users.filter(u => u.role === 'provider' && u.status === 'active').length;
  const registeredCustomersCount = users.filter(u => u.role === 'customer').length;

  const providersList = users.filter(u => u.role === 'provider');

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch = 
      o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      (o.assignedProviderName && o.assignedProviderName.toLowerCase().includes(orderSearch.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || o.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleManualAssign = (orderId: string, providerId: string) => {
    const targetProvider = users.find(u => u.id === providerId);
    if (!targetProvider) return;
    Store.assignProviderToOrder(orderId, targetProvider);
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    Store.updateOrderStatus(orderId, newStatus, `Admin manual override to ${newStatus}`);
  };

  const handleToggleUserStatus = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    const newStatus = user.status === 'active' ? 'blocked' : 'active';
    Store.updateUser({ ...user, status: newStatus });
  };

  const handleServicePriceChange = (serviceId: string, newPrice: number) => {
    setEditingServices(prev => 
      prev.map(s => s.id === serviceId ? { ...s, basePrice: newPrice } : s)
    );
  };

  const handleVehicleRateChange = (vehicleId: string, field: 'baseFare' | 'perKmRate' | 'helperRate', value: number) => {
    setEditingVehicles(prev =>
      prev.map(v => v.id === vehicleId ? { ...v, [field]: value } : v)
    );
  };

  const handleSaveCatalog = () => {
    Store.updateServicesCatalog(editingServices);
    Store.updateVehiclesCatalog(editingVehicles);
    setCatalogSavedMessage('Service & Transport Catalog saved and deployed successfully!');
    setTimeout(() => setCatalogSavedMessage(''), 4000);
  };

  const handleAddNewService = () => {
    const newId = 'srv-custom-' + Date.now();
    const newService: HomeServiceItem = {
      id: newId,
      name: 'Smart Home Automation Setup',
      category: 'Smart Devices',
      basePrice: 2200,
      estimatedDuration: '90 mins',
      description: 'Smart switch installation, Wi-Fi smart camera setup, and Alexa/Google Home hub pairing.',
      popularIssues: ['Smart camera mounting', 'Wi-Fi switch configuration', 'Zigbee sensor linking'],
      icon: 'Zap'
    };
    const updated = [...editingServices, newService];
    setEditingServices(updated);
    Store.updateServicesCatalog(updated);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPhone.trim()) {
      alert('Please fill out all required fields.');
      return;
    }

    try {
      if (newUserRole === 'provider') {
        Store.createProviderByAdmin({
          name: newUserName.trim(),
          email: newUserEmail.trim(),
          phone: newUserPhone.trim(),
          password: newUserPassword.trim() || 'Worker@123',
          providerCategory: newProviderCategory,
          serviceSkill: newProviderCategory === 'home_technician' ? newSkill : undefined,
          vehicleType: newProviderCategory === 'cargo_driver' ? newVehicle : (newProviderCategory === 'delivery_courier' ? '125cc Motorbike' : undefined),
          walletBalance: Number(newBalance) || 0,
          address: newAddress.trim()
        });
      } else {
        Store.registerCustomer({
          name: newUserName.trim(),
          email: newUserEmail.trim(),
          phone: newUserPhone.trim(),
          password: newUserPassword.trim() || 'Customer@123',
          address: newAddress.trim()
        });
      }

      setUserCreatedMessage(`Account for ${newUserName} created successfully! Assigned Password: ${newUserPassword}`);
      setTimeout(() => setUserCreatedMessage(''), 6000);
      setIsCreateUserModalOpen(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPhone('');
    } catch (err: any) {
      alert(err.message || 'Error creating user account');
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Admin Master Header */}
      <section className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
              <span className="text-xs uppercase tracking-wider font-semibold text-purple-300">
                System Administration & Dispatch Console
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight mt-1">Platform Operations Control</h1>
            <p className="text-xs text-slate-300 mt-1">
              Live monitoring, manual dispatch overrides, user verification, and catalog pricing controls
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-slate-400 font-mono">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                MySQL Schema (omniserve_db) Active
              </span>
              <span>·</span>
              <span className="text-blue-300">
                GitHub Actions Safe Snapshot Caching (.github/workflows)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (window.confirm('Reset all demo state to fresh default?')) {
                  Store.resetToDemoData();
                  window.location.reload();
                }
              }}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset State</span>
            </button>
          </div>
        </div>
      </section>

      {/* KPI Stats Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-6 gap-3.5">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Active Orders</span>
          <p className="text-xl font-bold font-mono text-blue-600 mt-1">{activeOrdersCount}</p>
          <span className="text-[10px] text-slate-400">In real-time transit</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Completed</span>
          <p className="text-xl font-bold font-mono text-emerald-600 mt-1">{completedOrdersCount}</p>
          <span className="text-[10px] text-slate-400">Successfully closed</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Gross GMV</span>
          <p className="text-xl font-bold font-mono text-slate-900 mt-1">PKR {totalGmv.toLocaleString()}</p>
          <span className="text-[10px] text-slate-400">Total volume</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Commission</span>
          <p className="text-xl font-bold font-mono text-purple-600 mt-1">PKR {platformRevenue.toLocaleString()}</p>
          <span className="text-[10px] text-slate-400">15% platform cut</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Providers</span>
          <p className="text-xl font-bold font-mono text-slate-900 mt-1">{verifiedProvidersCount}</p>
          <span className="text-[10px] text-emerald-600 font-semibold">100% Verified</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Customers</span>
          <p className="text-xl font-bold font-mono text-slate-900 mt-1">{registeredCustomersCount}</p>
          <span className="text-[10px] text-slate-400">Registered users</span>
        </div>
      </section>

      {/* Admin Section Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveSection('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeSection === 'orders'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Orders & Dispatch ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeSection === 'users'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Users & Providers ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('catalog')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeSection === 'catalog'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Service & Vehicle Catalog</span>
        </button>
      </div>

      {/* SECTION 1: ORDERS & DISPATCH MANAGEMENT */}
      {activeSection === 'orders' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex flex-1 items-center gap-2 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Search by Order ID, customer, provider..."
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">Category:</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="rounded-lg border border-slate-300 px-2.5 py-1.5 bg-white text-xs font-medium"
                >
                  <option value="all">All Categories</option>
                  <option value="custom_delivery">Custom Delivery</option>
                  <option value="home_services">Home Services</option>
                  <option value="transport_cargo">Transport & Cargo</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-lg border border-slate-300 px-2.5 py-1.5 bg-white text-xs font-medium"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="assigned">Assigned</option>
                  <option value="on_the_way">On The Way</option>
                  <option value="work_started">Work Started</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Orders Data Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Order ID & Date</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Assigned Worker</th>
                  <th className="py-3 px-4">Status & Dispatch Override</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400">
                      No matching orders found.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-slate-900 block">{order.id}</span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-700 capitalize">
                          {order.category.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{order.customerName}</span>
                        <span className="text-[11px] text-slate-500 truncate max-w-[180px] block">
                          {order.deliveryAddress}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {order.assignedProviderName ? (
                          <div>
                            <span className="font-semibold text-slate-900 block">
                              {order.assignedProviderName}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {order.assignedProviderPhone}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <select
                              onChange={(e) => handleManualAssign(order.id, e.target.value)}
                              defaultValue=""
                              className="text-[11px] border border-amber-300 bg-amber-50 rounded-md px-2 py-1 text-amber-900 font-semibold"
                            >
                              <option value="" disabled>Manual Dispatch...</option>
                              {providersList.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name} ({p.providerCategory?.replace('_', ' ')})
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                            className={`text-[11px] font-semibold px-2 py-1 rounded-md border ${
                              order.status === 'completed'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : order.status === 'cancelled'
                                ? 'bg-red-50 text-red-800 border-red-200'
                                : 'bg-blue-50 text-blue-800 border-blue-200'
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="assigned">Assigned</option>
                            <option value="on_the_way">On The Way</option>
                            <option value="work_started">Work Started</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span className="font-mono font-bold text-slate-900 block">
                          PKR {order.pricing.total.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">
                          {order.paymentMethod} ({order.paymentStatus})
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setSelectedOrderDetails(order)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors"
                          title="Inspect Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 2: USERS & PROVIDERS MANAGEMENT */}
      {activeSection === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Registered Accounts & Partner Verification</h3>
              <p className="text-xs text-slate-500">Super Admin can create verified drivers, technicians, couriers, and staff accounts</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-mono">{users.length} Total Users</span>
              <button
                onClick={() => setIsCreateUserModalOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>+ Create Worker / Provider</span>
              </button>
            </div>
          </div>

          {userCreatedMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{userCreatedMessage}</span>
            </div>
          )}

          <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role & Domain</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Status & KYC</th>
                  <th className="py-3 px-4">Performance / Balance</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={user.avatar}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                          }}
                        />
                        <div>
                          <span className="font-bold text-slate-900 block">{user.name}</span>
                          <span className="text-[11px] text-slate-400 font-mono">ID: {user.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold capitalize text-slate-800 block">{user.role}</span>
                      <span className="text-[11px] text-slate-500">
                        {user.serviceSkill || user.vehicleType || 'Standard Client'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      <span className="text-slate-800 block">{user.phone}</span>
                      <span className="text-slate-400 text-[11px] font-sans">{user.email}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                        user.status === 'active'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-red-50 text-red-800 border border-red-200'
                      }`}>
                        {user.status}
                      </span>
                      {user.role === 'provider' && (
                        <span className="text-[10px] text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 rounded ml-1 font-semibold">
                          KYC Verified
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      <span className="font-bold text-slate-900 block">
                        PKR {user.walletBalance.toLocaleString()}
                      </span>
                      {user.completedJobsCount !== undefined && (
                        <span className="text-[11px] text-slate-500 font-sans">
                          {user.completedJobsCount} jobs ({user.rating}★)
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleToggleUserStatus(user.id)}
                        className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                          user.status === 'active'
                            ? 'text-red-600 hover:bg-red-50 border border-red-200'
                            : 'text-emerald-600 hover:bg-emerald-50 border border-emerald-200'
                        }`}
                      >
                        {user.status === 'active' ? 'Block User' : 'Unblock User'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 3: SERVICE CATALOG & VEHICLE PRICING MANAGER */}
      {activeSection === 'catalog' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Service Catalog & Vehicle Pricing Manager</h3>
              <p className="text-xs text-slate-500">Edit base prices, add new services, and configure vehicle per-km fares dynamically</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddNewService}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4 text-slate-600" />
                <span>Add New Service</span>
              </button>
              <button
                onClick={handleSaveCatalog}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save All Changes</span>
              </button>
            </div>
          </div>

          {catalogSavedMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{catalogSavedMessage}</span>
            </div>
          )}

          {/* Home Services Editor */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              1. Home Services Base Pricing & Catalog
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {editingServices.map((srv) => (
                <div key={srv.id} className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{srv.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{srv.estimatedDuration}</span>
                  </div>
                  <p className="text-slate-500 text-[11px] line-clamp-2">{srv.description}</p>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Base Starting Price (PKR)
                    </label>
                    <input
                      type="number"
                      step={100}
                      value={srv.basePrice}
                      onChange={(e) => handleServicePriceChange(srv.id, Number(e.target.value))}
                      className="w-full text-xs font-mono font-bold rounded-lg border border-slate-300 px-3 py-1.5 bg-slate-50"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transport Vehicles Pricing */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              2. Cargo & Transport Fleet Rates
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {editingVehicles.map((veh) => (
                <div key={veh.id} className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">{veh.name}</span>
                    <span className="text-[10px] text-indigo-600 font-mono font-semibold">Max {veh.capacityKg}kg</span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500">Base Fare (PKR)</label>
                      <input
                        type="number"
                        step={50}
                        value={veh.baseFare}
                        onChange={(e) => handleVehicleRateChange(veh.id, 'baseFare', Number(e.target.value))}
                        className="w-full text-xs font-mono font-bold rounded-lg border border-slate-300 px-2 py-1 bg-slate-50"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500">Per KM Rate (PKR/km)</label>
                      <input
                        type="number"
                        step={5}
                        value={veh.perKmRate}
                        onChange={(e) => handleVehicleRateChange(veh.id, 'perKmRate', Number(e.target.value))}
                        className="w-full text-xs font-mono font-bold rounded-lg border border-slate-300 px-2 py-1 bg-slate-50"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500">Helper Labor Fee (PKR)</label>
                      <input
                        type="number"
                        step={50}
                        value={veh.helperRate}
                        onChange={(e) => handleVehicleRateChange(veh.id, 'helperRate', Number(e.target.value))}
                        className="w-full text-xs font-mono font-bold rounded-lg border border-slate-300 px-2 py-1 bg-slate-50"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Inspect Order Modal */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Order Audit & Details</h4>
                <p className="text-xs text-slate-500 font-mono">ID: {selectedOrderDetails.id}</p>
              </div>
              <button onClick={() => setSelectedOrderDetails(null)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[11px]">Customer:</span>
                  <span className="font-bold text-slate-900">{selectedOrderDetails.customerName}</span>
                  <span className="text-slate-500 block font-mono text-[11px]">{selectedOrderDetails.customerPhone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Assigned Worker:</span>
                  <span className="font-bold text-slate-900">{selectedOrderDetails.assignedProviderName || 'None (Unassigned)'}</span>
                  <span className="text-slate-500 block font-mono text-[11px]">{selectedOrderDetails.assignedProviderPhone || '-'}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Delivery / Destination:</span>
                <span className="font-semibold text-slate-900">{selectedOrderDetails.deliveryAddress}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Pricing Breakdown:</span>
                <div className="font-mono text-slate-600 space-y-0.5 mt-1">
                  <div className="flex justify-between">
                    <span>Base Fee:</span>
                    <span>PKR {selectedOrderDetails.pricing.baseFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service/Distance:</span>
                    <span>PKR {selectedOrderDetails.pricing.serviceOrDeliveryFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform 15% Cut:</span>
                    <span className="text-purple-600 font-bold">PKR {Math.round(selectedOrderDetails.pricing.total * 0.15)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Provider 85% Cut:</span>
                    <span className="text-emerald-600 font-bold">PKR {Math.round(selectedOrderDetails.pricing.total * 0.85)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                    <span>Total Amount:</span>
                    <span>PKR {selectedOrderDetails.pricing.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE USER / SERVICE PROVIDER MODAL (Admin Only) */}
      {isCreateUserModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h4 className="font-bold text-slate-900 text-base">Create Worker / Provider Account</h4>
                <p className="text-xs text-slate-500">Super Admin can register certified technicians, cargo drivers, and couriers</p>
              </div>
              <button onClick={() => setIsCreateUserModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Account Role *</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as any)}
                    className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 bg-white font-medium"
                  >
                    <option value="provider">Service Provider / Worker</option>
                    <option value="customer">Registered Customer</option>
                  </select>
                </div>

                {newUserRole === 'provider' && (
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Provider Category *</label>
                    <select
                      value={newProviderCategory}
                      onChange={(e) => setNewProviderCategory(e.target.value as any)}
                      className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 bg-white font-medium"
                    >
                      <option value="home_technician">Home Technician (AC/Electric/Plumbing)</option>
                      <option value="cargo_driver">Cargo / Transport Driver</option>
                      <option value="delivery_courier">Delivery Courier / Bike Rider</option>
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Tariq Mehmood"
                  className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="tariq@omniserve.com"
                    className="w-full text-xs font-mono rounded-xl border border-slate-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    placeholder="+92 333 4567890"
                    className="w-full text-xs font-mono rounded-xl border border-slate-300 px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Assigned Login Password *</label>
                  <input
                    type="text"
                    required
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="Worker@123"
                    className="w-full text-xs font-mono rounded-xl border border-slate-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Starting Wallet Balance (PKR)</label>
                  <input
                    type="number"
                    min={0}
                    step={500}
                    value={newBalance}
                    onChange={(e) => setNewBalance(Number(e.target.value))}
                    className="w-full text-xs font-mono rounded-xl border border-slate-300 px-3 py-2"
                  />
                </div>
              </div>

              {newUserRole === 'provider' && newProviderCategory === 'home_technician' && (
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Specialized Skill / Trade</label>
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="e.g. Master AC Chemical Washing & Refrigerant Leak Diagnostics"
                    className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2"
                  />
                </div>
              )}

              {newUserRole === 'provider' && newProviderCategory === 'cargo_driver' && (
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Vehicle Model & Registration</label>
                  <input
                    type="text"
                    value={newVehicle}
                    onChange={(e) => setNewVehicle(e.target.value)}
                    placeholder="e.g. Suzuki Bolan Pickup (ICT-9921)"
                    className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-bold mb-1">Operating Location / Base Address</label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Commercial area, Islamabad"
                  className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateUserModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-xs"
                >
                  Create & Activate Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
