import React, { useState } from 'react';
import { 
  Order, 
  User, 
  HomeServiceItem, 
  TransportVehicleItem, 
  OrderStatus,
  SystemSettings 
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
  DollarSign,
  Settings,
  Trash2,
  Ban,
  UserCheck,
  ShieldAlert,
  Phone,
  MessageSquare,
  AlertCircle,
  Clock,
  MapPin,
  ExternalLink,
  Shield
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
  const [activeSection, setActiveSection] = useState<'orders' | 'users' | 'catalog' | 'settings'>('orders');
  
  // Orders Management Filters
  const [orderSearch, setOrderSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

  // Editable Catalog State
  const [editingServices, setEditingServices] = useState<HomeServiceItem[]>(services);
  const [editingVehicles, setEditingVehicles] = useState<TransportVehicleItem[]>(vehicles);
  const [catalogSavedMessage, setCatalogSavedMessage] = useState('');

  // Dynamic Settings State
  const [settings, setSettings] = useState<SystemSettings>(() => Store.getSettings());
  const [settingsSavedMessage, setSettingsSavedMessage] = useState('');

  // User Management State & Modals
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [userStatusFilter, setUserStatusFilter] = useState<string>('all');
  const [selectedUserDetails, setSelectedUserDetails] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userActionNotice, setUserActionNotice] = useState('');

  // Admin User Creation Modal State
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserCnic, setNewUserCnic] = useState('36104-1234567-1');
  const [newUserPassword, setNewUserPassword] = useState('Worker@123');
  const [newUserRole, setNewUserRole] = useState<'provider' | 'customer' | 'admin'>('provider');
  const [newProviderCategory, setNewProviderCategory] = useState<'home_technician' | 'cargo_driver' | 'delivery_courier'>('home_technician');
  const [newSkill, setNewSkill] = useState('HVAC & AC Master Service');
  const [newVehicle, setNewVehicle] = useState('Suzuki Bolan Mini-Pickup');
  const [newBalance, setNewBalance] = useState(5000);
  const [newAddress, setNewAddress] = useState('Block 5, Railway Road, Khanewal');
  const [newNotes, setNewNotes] = useState('Verified by Khanewal Ops Desk');

  // Stats
  const activeOrdersCount = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length;
  const completedOrdersCount = orders.filter(o => o.status === 'completed').length;
  const totalGmv = orders.reduce((sum, o) => sum + o.pricing.total, 0);
  const platformRevenue = Math.round(totalGmv * (settings.platformCommissionRate / 100));
  const verifiedProvidersCount = users.filter(u => u.role === 'provider' && u.status === 'active' && !u.isDeleted).length;
  const registeredCustomersCount = users.filter(u => u.role === 'customer' && !u.isDeleted).length;

  const providersList = users.filter(u => u.role === 'provider' && !u.isDeleted && u.status === 'active');

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

  // Filtered users for User Management
  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.phone.includes(userSearch) ||
      (u.cnic && u.cnic.includes(userSearch)) ||
      u.id.toLowerCase().includes(userSearch.toLowerCase());

    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;

    let matchesStatus = true;
    if (userStatusFilter === 'deleted') {
      matchesStatus = !!u.isDeleted;
    } else if (userStatusFilter === 'active') {
      matchesStatus = u.status === 'active' && !u.isDeleted;
    } else if (userStatusFilter === 'suspended') {
      matchesStatus = u.status === 'suspended' && !u.isDeleted;
    } else if (userStatusFilter === 'blocked') {
      matchesStatus = u.status === 'blocked' && !u.isDeleted;
    }

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleManualAssign = (orderId: string, providerId: string) => {
    const targetProvider = users.find(u => u.id === providerId);
    if (!targetProvider) return;
    Store.assignProviderToOrder(orderId, targetProvider);
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    Store.updateOrderStatus(orderId, newStatus, `Admin manual override to ${newStatus}`);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    Store.updateSettings(settings);
    setSettingsSavedMessage('System settings & dynamic pricing updated and deployed live!');
    setTimeout(() => setSettingsSavedMessage(''), 5000);
  };

  const handleBanUser = (userId: string) => {
    if (window.confirm('Are you sure you want to BAN this account? User will immediately lose access.')) {
      Store.banUser(userId);
      setUserActionNotice(`User ${userId} has been banned.`);
      setTimeout(() => setUserActionNotice(''), 4000);
    }
  };

  const handleSuspendUser = (userId: string) => {
    if (window.confirm('Suspend this account temporarily?')) {
      Store.suspendUser(userId);
      setUserActionNotice(`User ${userId} has been suspended.`);
      setTimeout(() => setUserActionNotice(''), 4000);
    }
  };

  const handleUnbanUser = (userId: string) => {
    Store.unbanUser(userId);
    setUserActionNotice(`User ${userId} restored to active status.`);
    setTimeout(() => setUserActionNotice(''), 4000);
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to remove (soft-delete) this account?')) {
      Store.deleteUser(userId);
      setUserActionNotice(`User ${userId} removed.`);
      setTimeout(() => setUserActionNotice(''), 4000);
    }
  };

  const handleRestoreUser = (userId: string) => {
    Store.restoreUser(userId);
    setUserActionNotice(`User ${userId} account restored successfully.`);
    setTimeout(() => setUserActionNotice(''), 4000);
  };

  const handleSaveUserEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    Store.adminUpdateUser({
      id: editingUser.id,
      name: editingUser.name,
      email: editingUser.email,
      phone: editingUser.phone,
      cnic: editingUser.cnic,
      address: editingUser.address,
      walletBalance: Number(editingUser.walletBalance) || 0,
      status: editingUser.status,
      role: editingUser.role,
      serviceSkill: editingUser.serviceSkill,
      vehicleType: editingUser.vehicleType,
      notes: editingUser.notes
    });
    setUserActionNotice(`Profile for ${editingUser.name} updated successfully!`);
    setTimeout(() => setUserActionNotice(''), 5000);
    setEditingUser(null);
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
          cnic: newUserCnic.trim(),
          password: newUserPassword.trim() || 'Worker@123',
          providerCategory: newProviderCategory,
          serviceSkill: newProviderCategory === 'home_technician' ? newSkill : undefined,
          vehicleType: newProviderCategory === 'cargo_driver' ? newVehicle : (newProviderCategory === 'delivery_courier' ? '125cc Motorbike' : undefined),
          walletBalance: Number(newBalance) || 0,
          address: newAddress.trim(),
          notes: newNotes.trim()
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

      setUserActionNotice(`Account for ${newUserName} created successfully! Assigned Password: ${newUserPassword}`);
      setTimeout(() => setUserActionNotice(''), 6000);
      setIsCreateUserModalOpen(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPhone('');
    } catch (err: any) {
      alert(err.message || 'Error creating user account');
    }
  };

  // WhatsApp preview url
  const testWhatsAppUrl = `https://wa.me/${(settings.whatsappSupportPhone || '+923001234567').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(settings.whatsappDefaultMessage)}`;

  return (
    <div className="space-y-8 pb-16">
      {/* Super Admin Master Header */}
      <section className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs uppercase tracking-wider font-semibold text-emerald-400">
                Super-Admin Unrestricted Master Console
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight mt-1">Khanewal Connect Operations</h1>
            <p className="text-xs text-slate-300 mt-1">
              Live monitoring, dynamic pricing, complete user management, and provider onboarding controls
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-slate-400 font-mono">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Persistent Database Active
              </span>
              <span>·</span>
              <span className="text-blue-300">
                Super-Admin Full Privileges Enabled
              </span>
              <span>·</span>
              <span className="text-purple-300">
                WhatsApp Live Node Connected
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
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
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
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total GMV</span>
          <p className="text-xl font-bold font-mono text-slate-900 mt-1">PKR {totalGmv.toLocaleString()}</p>
          <span className="text-[10px] text-slate-400">Gross transaction vol.</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Platform Cut</span>
          <p className="text-xl font-bold font-mono text-purple-600 mt-1">PKR {platformRevenue.toLocaleString()}</p>
          <span className="text-[10px] text-slate-400">{settings.platformCommissionRate}% take rate</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Active Providers</span>
          <p className="text-xl font-bold font-mono text-emerald-700 mt-1">{verifiedProvidersCount}</p>
          <span className="text-[10px] text-slate-400">Admin-Onboarded</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Customers</span>
          <p className="text-xl font-bold font-mono text-slate-900 mt-1">{registeredCustomersCount}</p>
          <span className="text-[10px] text-slate-400">Registered users</span>
        </div>
      </section>

      {/* Admin Section Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveSection('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer ${
            activeSection === 'orders'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Orders & Dispatch ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer ${
            activeSection === 'users'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User & Provider Management ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('settings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer ${
            activeSection === 'settings'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Live Settings & Dynamic Pricing</span>
        </button>

        <button
          onClick={() => setActiveSection('catalog')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer ${
            activeSection === 'catalog'
              ? 'bg-slate-900 text-white shadow-xs'
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
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 capitalize">
                        <span className="font-medium text-slate-700 block">
                          {order.category.replace('_', ' ')}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {order.paymentMethod.toUpperCase()}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-900 block">{order.customerName}</span>
                        <span className="text-slate-500 font-mono text-[11px]">{order.customerPhone}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        {order.assignedProviderName ? (
                          <div>
                            <span className="font-semibold text-emerald-700 block">
                              {order.assignedProviderName}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {order.assignedProviderPhone}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <select
                              onChange={(e) => handleManualAssign(order.id, e.target.value)}
                              defaultValue=""
                              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-slate-700 max-w-[140px]"
                            >
                              <option value="" disabled>Manual Dispatch...</option>
                              {providersList.map(p => (
                                <option key={p.id} value={p.id}>
                                  {p.name} ({p.serviceSkill || p.vehicleType || 'Worker'})
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                          className={`text-xs font-semibold px-2 py-1 rounded-lg border ${
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
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                        PKR {order.pricing.total.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setSelectedOrderDetails(order)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors cursor-pointer"
                          title="Inspect Order Audit"
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

      {/* SECTION 2: COMPREHENSIVE USER & PROVIDER MANAGEMENT */}
      {activeSection === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Comprehensive User & Partner Management</h3>
              <p className="text-xs text-slate-500">
                Full Super-Admin control: inspect history, edit profiles, ban/unban, soft-delete, and onboard verified providers.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-mono">{filteredUsers.length} Users Listed</span>
              <button
                onClick={() => setIsCreateUserModalOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Onboard Provider / User</span>
              </button>
            </div>
          </div>

          {userActionNotice && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{userActionNotice}</span>
            </div>
          )}

          {/* User Filters Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex flex-1 items-center gap-2 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search by name, CNIC, phone, email, or user ID..."
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">Role:</span>
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="rounded-lg border border-slate-300 px-2.5 py-1.5 bg-white text-xs font-medium"
                >
                  <option value="all">All Roles</option>
                  <option value="provider">Service Providers</option>
                  <option value="customer">Customers</option>
                  <option value="admin">Administrators</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">Status:</span>
                <select
                  value={userStatusFilter}
                  onChange={(e) => setUserStatusFilter(e.target.value)}
                  className="rounded-lg border border-slate-300 px-2.5 py-1.5 bg-white text-xs font-medium"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="suspended">Suspended</option>
                  <option value="blocked">Banned / Blocked</option>
                  <option value="deleted">Soft-Deleted</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">User & Identity</th>
                  <th className="py-3 px-4">Role & Trade</th>
                  <th className="py-3 px-4">Contact & CNIC</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4">Wallet & Volume</th>
                  <th className="py-3 px-4 text-right">Admin Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400">
                      No matching user records found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className={`hover:bg-slate-50/80 transition-colors ${user.isDeleted ? 'opacity-60 bg-slate-50/50' : ''}`}>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={user.avatar}
                            alt=""
                            className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                            }}
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 block">{user.name}</span>
                              {user.isDeleted && (
                                <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-semibold">Deleted</span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">ID: {user.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`font-semibold capitalize block ${
                          user.role === 'admin' ? 'text-purple-700' : user.role === 'provider' ? 'text-emerald-700' : 'text-blue-700'
                        }`}>
                          {user.role}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {user.serviceSkill || user.vehicleType || (user.role === 'admin' ? 'Master Ops' : 'Customer Account')}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <span className="text-slate-800 block">{user.phone}</span>
                        <span className="text-slate-400 text-[11px] font-sans block">{user.email}</span>
                        {user.cnic && (
                          <span className="text-[10px] text-slate-500 bg-slate-100 px-1 py-0.5 rounded font-mono mt-0.5 inline-block">
                            CNIC: {user.cnic}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize inline-flex items-center gap-1 ${
                          user.status === 'active' && !user.isDeleted
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : user.status === 'suspended'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-red-50 text-red-800 border border-red-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            user.status === 'active' && !user.isDeleted ? 'bg-emerald-500' : user.status === 'suspended' ? 'bg-amber-500' : 'bg-red-500'
                          }`} />
                          {user.isDeleted ? 'Removed' : user.status}
                        </span>
                        {user.role === 'provider' && !user.isDeleted && (
                          <span className="text-[10px] text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 rounded ml-1 font-semibold">
                            Admin-Verified
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <span className="font-bold text-slate-900 block">
                          PKR {user.walletBalance.toLocaleString()}
                        </span>
                        {user.completedJobsCount !== undefined ? (
                          <span className="text-[11px] text-slate-500 font-sans">
                            {user.completedJobsCount} jobs ({user.rating}★)
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-sans">
                            {orders.filter(o => o.customerId === user.id).length} orders placed
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Inspect / Full Details */}
                          <button
                            onClick={() => setSelectedUserDetails(user)}
                            className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors cursor-pointer"
                            title="View Full Profile & Order History"
                          >
                            <Eye className="w-4 h-4 text-slate-600" />
                          </button>

                          {/* Edit Details */}
                          <button
                            onClick={() => setEditingUser(user)}
                            className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors cursor-pointer"
                            title="Edit User Profile"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Ban / Unban Toggle */}
                          {user.status === 'blocked' ? (
                            <button
                              onClick={() => handleUnbanUser(user.id)}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-md text-[11px] font-semibold transition-colors cursor-pointer"
                              title="Unban Account"
                            >
                              Unban
                            </button>
                          ) : (
                            <button
                              onClick={() => handleBanUser(user.id)}
                              className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors cursor-pointer"
                              title="Ban / Block User"
                            >
                              <Ban className="w-4 h-4 text-red-600" />
                            </button>
                          )}

                          {/* Soft Delete or Restore */}
                          {user.isDeleted ? (
                            <button
                              onClick={() => handleRestoreUser(user.id)}
                              className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors cursor-pointer"
                              title="Restore Deleted Account"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                              title="Remove / Soft-Delete Account"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 3: DYNAMIC ADMIN CONTROLS & PRICING CONFIGURATION */}
      {activeSection === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Dynamic Platform Controls & Pricing Configuration</h3>
              <p className="text-xs text-slate-500">
                Live variables update instantly across the entire marketplace, booking modals, and customer checkout.
              </p>
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save & Deploy Live Settings</span>
            </button>
          </div>

          {settingsSavedMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{settingsSavedMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Box 1: Delivery Charges */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Truck className="w-4 h-4 text-blue-600" />
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  1. Delivery Charges & Distance Rates
                </h4>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Base Delivery Fee (PKR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={10}
                    value={settings.deliveryBaseFee}
                    onChange={(e) => setSettings({ ...settings, deliveryBaseFee: Number(e.target.value) })}
                    className="w-full text-xs font-mono font-bold rounded-xl border border-slate-300 px-3 py-2 bg-slate-50"
                  />
                  <span className="text-[11px] text-slate-400">Fixed starting pickup & delivery charge within city limits</span>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Per Kilometer Rate (PKR / km)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={5}
                    value={settings.deliveryPerKmFee}
                    onChange={(e) => setSettings({ ...settings, deliveryPerKmFee: Number(e.target.value) })}
                    className="w-full text-xs font-mono font-bold rounded-xl border border-slate-300 px-3 py-2 bg-slate-50"
                  />
                  <span className="text-[11px] text-slate-400">Incremental transit fee per kilometer from pickup to dropoff</span>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Urgent Delivery Priority Surcharge (PKR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={10}
                    value={settings.deliveryUrgentFee}
                    onChange={(e) => setSettings({ ...settings, deliveryUrgentFee: Number(e.target.value) })}
                    className="w-full text-xs font-mono font-bold rounded-xl border border-slate-300 px-3 py-2 bg-slate-50"
                  />
                  <span className="text-[11px] text-slate-400">Extra charge for express priority dispatch under 30 minutes</span>
                </div>
              </div>
            </div>

            {/* Box 2: Technician / Plumber Visiting & Hourly Charges */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Wrench className="w-4 h-4 text-emerald-600" />
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  2. Technician / Plumber Visiting & Hourly Rates
                </h4>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Technician / Plumber Home Visiting Charge (PKR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={50}
                    value={settings.technicianVisitingFee}
                    onChange={(e) => setSettings({ ...settings, technicianVisitingFee: Number(e.target.value) })}
                    className="w-full text-xs font-mono font-bold rounded-xl border border-slate-300 px-3 py-2 bg-slate-50"
                  />
                  <span className="text-[11px] text-slate-400">Mandatory home visit & initial inspection consultation fee</span>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Base Labor Rate (PKR / hour)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={50}
                    value={settings.technicianHourlyRate}
                    onChange={(e) => setSettings({ ...settings, technicianHourlyRate: Number(e.target.value) })}
                    className="w-full text-xs font-mono font-bold rounded-xl border border-slate-300 px-3 py-2 bg-slate-50"
                  />
                  <span className="text-[11px] text-slate-400">Standard hourly wage for extended complex repair sessions</span>
                </div>
              </div>
            </div>

            {/* Box 3: Platform Commission & Margin Controls */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <DollarSign className="w-4 h-4 text-purple-600" />
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  3. Service Fee Margins & Platform Commissions
                </h4>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Platform Commission Rate (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={50}
                      step={1}
                      value={settings.platformCommissionRate}
                      onChange={(e) => setSettings({ ...settings, platformCommissionRate: Number(e.target.value) })}
                      className="w-full text-xs font-mono font-bold rounded-xl border border-slate-300 px-3 py-2 bg-slate-50"
                    />
                    <span className="absolute right-3 top-2 text-slate-400 font-bold">%</span>
                  </div>
                  <span className="text-[11px] text-slate-400">Current take rate deducted upon order completion (e.g. 15%)</span>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Escrow Protection Fixed Fee (PKR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={10}
                    value={settings.platformFixedFee}
                    onChange={(e) => setSettings({ ...settings, platformFixedFee: Number(e.target.value) })}
                    className="w-full text-xs font-mono font-bold rounded-xl border border-slate-300 px-3 py-2 bg-slate-50"
                  />
                  <span className="text-[11px] text-slate-400">SafePay escrow security & insurance coverage per transaction</span>
                </div>
              </div>
            </div>

            {/* Box 4: WhatsApp Support Integration */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  4. Live WhatsApp Support & Contact Channels
                </h4>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    WhatsApp Support Contact Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={settings.whatsappSupportPhone}
                    onChange={(e) => setSettings({ ...settings, whatsappSupportPhone: e.target.value })}
                    placeholder="+92 300 1234567"
                    className="w-full text-xs font-mono font-bold rounded-xl border border-slate-300 px-3 py-2 bg-slate-50"
                  />
                  <span className="text-[11px] text-slate-400">The dynamic number connected to the frontend floating button</span>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Standard Pre-filled Chat Message (Urdu)
                  </label>
                  <textarea
                    rows={2}
                    value={settings.whatsappDefaultMessage}
                    onChange={(e) => setSettings({ ...settings, whatsappDefaultMessage: e.target.value })}
                    className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 bg-slate-50"
                  />
                  <span className="text-[11px] text-slate-400">Auto-filled in customer's WhatsApp window upon clicking button</span>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Toll-Free Voice Helpline
                  </label>
                  <input
                    type="text"
                    value={settings.supportHelpline}
                    onChange={(e) => setSettings({ ...settings, supportHelpline: e.target.value })}
                    className="w-full text-xs font-mono rounded-xl border border-slate-300 px-3 py-2 bg-slate-50"
                  />
                </div>

                <div className="pt-2">
                  <a
                    href={testWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Test Current WhatsApp Link</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save & Deploy Live Settings</span>
            </button>
          </div>
        </form>
      )}

      {/* SECTION 4: SERVICE CATALOG & VEHICLE PRICING MANAGER */}
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
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 text-slate-600" />
                <span>Add New Service</span>
              </button>
              <button
                onClick={handleSaveCatalog}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
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

      {/* MODAL 1: INSPECT ORDER AUDIT MODAL */}
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
                    <span>Platform {settings.platformCommissionRate}% Cut:</span>
                    <span className="text-purple-600 font-bold">
                      PKR {Math.round(selectedOrderDetails.pricing.total * (settings.platformCommissionRate / 100))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Provider Cut:</span>
                    <span className="text-emerald-600 font-bold">
                      PKR {Math.round(selectedOrderDetails.pricing.total * ((100 - settings.platformCommissionRate) / 100))}
                    </span>
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
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: USER DETAILS & ACTIVITY HISTORY MODAL */}
      {selectedUserDetails && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <img
                  src={selectedUserDetails.avatar}
                  alt=""
                  className="w-12 h-12 rounded-full object-cover border-2 border-slate-200"
                />
                <div>
                  <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    {selectedUserDetails.name}
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      selectedUserDetails.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                      selectedUserDetails.role === 'provider' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {selectedUserDetails.role}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500 font-mono">ID: {selectedUserDetails.id}</p>
                </div>
              </div>
              <button onClick={() => setSelectedUserDetails(null)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 text-[11px] block">CNIC / ID Card</span>
                <span className="font-bold font-mono text-slate-800">{selectedUserDetails.cnic || 'Not Submitted'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 text-[11px] block">Wallet Balance</span>
                <span className="font-bold font-mono text-emerald-700">PKR {selectedUserDetails.walletBalance.toLocaleString()}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 text-[11px] block">Status</span>
                <span className={`font-bold capitalize ${
                  selectedUserDetails.status === 'active' ? 'text-emerald-700' : 'text-red-700'
                }`}>
                  {selectedUserDetails.isDeleted ? 'Deleted' : selectedUserDetails.status}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 text-[11px] block">Rating / Rep</span>
                <span className="font-bold text-slate-800">{selectedUserDetails.rating || 5.0}★ Verified</span>
              </div>
            </div>

            {/* Contact & Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl border border-slate-100 space-y-1">
                <span className="text-slate-400 block text-[11px]">Contact Info:</span>
                <div className="font-mono text-slate-800">{selectedUserDetails.phone}</div>
                <div className="text-slate-600">{selectedUserDetails.email}</div>
              </div>
              <div className="p-3 rounded-xl border border-slate-100 space-y-1">
                <span className="text-slate-400 block text-[11px]">Base Location & Domain:</span>
                <div className="text-slate-800 font-medium">{selectedUserDetails.address || 'Khanewal, Punjab'}</div>
                <div className="text-slate-500">{selectedUserDetails.serviceSkill || selectedUserDetails.vehicleType || 'Standard Services'}</div>
              </div>
            </div>

            {selectedUserDetails.notes && (
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900">
                <span className="font-bold">Admin Internal Notes: </span>
                {selectedUserDetails.notes}
              </div>
            )}

            {/* Activity & Order History for this User */}
            <div>
              <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">
                Activity & Order History ({Store.getUserOrders(selectedUserDetails.id).length})
              </h5>
              <div className="max-h-52 overflow-y-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] font-bold">
                    <tr>
                      <th className="p-2">Order ID</th>
                      <th className="p-2">Category</th>
                      <th className="p-2">Status</th>
                      <th className="p-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {Store.getUserOrders(selectedUserDetails.id).length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-slate-400">
                          No order activity recorded yet for this account.
                        </td>
                      </tr>
                    ) : (
                      Store.getUserOrders(selectedUserDetails.id).map(ord => (
                        <tr key={ord.id} className="hover:bg-slate-50">
                          <td className="p-2 font-mono font-bold text-slate-800">{ord.id}</td>
                          <td className="p-2 capitalize">{ord.category.replace('_', ' ')}</td>
                          <td className="p-2">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                              {ord.status}
                            </span>
                          </td>
                          <td className="p-2 text-right font-mono font-bold">PKR {ord.pricing.total.toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => {
                  setEditingUser(selectedUserDetails);
                  setSelectedUserDetails(null);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Edit Profile
              </button>
              <button
                onClick={() => setSelectedUserDetails(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT USER PROFILE MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h4 className="font-bold text-slate-900 text-base">Edit User Profile Details</h4>
                <p className="text-xs text-slate-500 font-mono">Modifying User ID: {editingUser.id}</p>
              </div>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUserEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="w-full text-xs font-mono rounded-xl border border-slate-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={editingUser.phone}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                    className="w-full text-xs font-mono rounded-xl border border-slate-300 px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">CNIC / ID Card</label>
                  <input
                    type="text"
                    value={editingUser.cnic || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, cnic: e.target.value })}
                    placeholder="36104-1234567-1"
                    className="w-full text-xs font-mono rounded-xl border border-slate-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Wallet Balance (PKR)</label>
                  <input
                    type="number"
                    step={100}
                    value={editingUser.walletBalance}
                    onChange={(e) => setEditingUser({ ...editingUser, walletBalance: Number(e.target.value) })}
                    className="w-full text-xs font-mono font-bold rounded-xl border border-slate-300 px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Account Status</label>
                  <select
                    value={editingUser.status}
                    onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as any })}
                    className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 bg-white font-medium"
                  >
                    <option value="active">Active (Full Access)</option>
                    <option value="suspended">Suspended (Temporary Hold)</option>
                    <option value="blocked">Blocked / Banned (Login Denied)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Account Role</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })}
                    className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 bg-white font-medium"
                  >
                    <option value="customer">Customer</option>
                    <option value="provider">Service Provider</option>
                    <option value="admin">Super Administrator</option>
                  </select>
                </div>
              </div>

              {editingUser.role === 'provider' && (
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Skill or Vehicle Fleet</label>
                  <input
                    type="text"
                    value={editingUser.serviceSkill || editingUser.vehicleType || ''}
                    onChange={(e) => {
                      if (editingUser.serviceSkill !== undefined) {
                        setEditingUser({ ...editingUser, serviceSkill: e.target.value });
                      } else {
                        setEditingUser({ ...editingUser, vehicleType: e.target.value });
                      }
                    }}
                    className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-bold mb-1">Base Address / Area</label>
                <input
                  type="text"
                  value={editingUser.address || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, address: e.target.value })}
                  className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Admin Audit Notes</label>
                <textarea
                  rows={2}
                  value={editingUser.notes || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, notes: e.target.value })}
                  placeholder="KYC verification status, physical verification remarks..."
                  className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: CREATE / ONBOARD PROVIDER ACCOUNT (Admin Only) */}
      {isCreateUserModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h4 className="font-bold text-slate-900 text-base">Onboard & Create Partner Account</h4>
                <p className="text-xs text-slate-500">Super-Admin verified onboarding for technicians, plumbers, and drivers</p>
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
                    placeholder="tariq@khanewalconnect.com"
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
                  <label className="block text-slate-700 font-bold mb-1">National CNIC *</label>
                  <input
                    type="text"
                    required
                    value={newUserCnic}
                    onChange={(e) => setNewUserCnic(e.target.value)}
                    placeholder="36104-1234567-1"
                    className="w-full text-xs font-mono rounded-xl border border-slate-300 px-3 py-2"
                  />
                </div>
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Operating Location</label>
                  <input
                    type="text"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="Khanewal City"
                    className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2"
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
                    placeholder="e.g. Suzuki Bolan Pickup (KHL-8821)"
                    className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-bold mb-1">Verification Remarks / Notes</label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Physical verification completed at Khanewal Desk"
                  className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateUserModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-xs cursor-pointer"
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
