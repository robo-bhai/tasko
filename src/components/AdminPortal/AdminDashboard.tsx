import React, { useState, useEffect } from 'react';
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
  Shield,
  X
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
  const [catalogFilter, setCatalogFilter] = useState<'all' | 'published' | 'unpublished'>('all');

  useEffect(() => {
    setEditingServices(services);
  }, [services]);

  useEffect(() => {
    setEditingVehicles(vehicles);
  }, [vehicles]);

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

  // Dispatch & Live Status Update Modal State
  const [dispatchOrder, setDispatchOrder] = useState<Order | null>(null);
  const [dispatchStatus, setDispatchStatus] = useState<OrderStatus>('assigned');
  const [dispatchProviderName, setDispatchProviderName] = useState('');
  const [dispatchProviderPhone, setDispatchProviderPhone] = useState('');
  const [dispatchEtaMinutes, setDispatchEtaMinutes] = useState<number>(20);
  const [dispatchProviderId, setDispatchProviderId] = useState<string>('');
  const [dispatchNote, setDispatchNote] = useState('');

  // Inline row-wise status & worker assignment state
  const [inlineOrderId, setInlineOrderId] = useState<string | null>(null);
  const [inlineWorkerName, setInlineWorkerName] = useState('');
  const [inlineWorkerPhone, setInlineWorkerPhone] = useState('');
  const [inlineWorkerEta, setInlineWorkerEta] = useState<number>(20);
  const [inlineStatus, setInlineStatus] = useState<OrderStatus>('assigned');

  const handleStartInlineAssign = (order: Order, targetStatus: OrderStatus = 'assigned') => {
    setInlineOrderId(order.id);
    setInlineStatus(targetStatus);
    setInlineWorkerName(order.assignedProviderName || '');
    setInlineWorkerPhone(order.assignedProviderPhone || '');
    setInlineWorkerEta(order.etaMinutes || 20);
  };

  const handleSaveInlineAssign = (orderId: string) => {
    Store.adminUpdateOrderDispatch(orderId, {
      status: inlineStatus,
      providerName: inlineWorkerName.trim() || undefined,
      providerPhone: inlineWorkerPhone.trim() || undefined,
      etaMinutes: Number(inlineWorkerEta) || undefined
    });
    setUserActionNotice(`Order ${orderId} updated! Worker: ${inlineWorkerName || 'Assigned'}, Status: ${inlineStatus}. Customer live tracker updated!`);
    setTimeout(() => setUserActionNotice(''), 5000);
    setInlineOrderId(null);
  };

  const handleDirectStatusChange = (order: Order, newStatus: OrderStatus) => {
    if (newStatus === 'assigned') {
      handleStartInlineAssign(order, 'assigned');
      return;
    }

    Store.adminUpdateOrderDispatch(order.id, {
      status: newStatus,
      providerName: order.assignedProviderName,
      providerPhone: order.assignedProviderPhone,
      etaMinutes: order.etaMinutes
    });
    setUserActionNotice(`Order ${order.id} status changed to ${newStatus}. Updated live on customer tab!`);
    setTimeout(() => setUserActionNotice(''), 4500);
  };

  // Stats
  const activeOrdersCount = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length;
  const completedOrdersCount = orders.filter(o => o.status === 'completed').length;
  const totalGmv = orders.reduce((sum, o) => sum + o.pricing.total, 0);
  const platformRevenue = Math.round(totalGmv * (settings.platformCommissionRate / 100));
  const verifiedProvidersCount = users.filter(u => u.role === 'provider' && u.status === 'active' && !u.isDeleted).length;
  const registeredCustomersCount = users.filter(u => u.role === 'customer' && !u.isDeleted).length;

  const providersList = users.filter(u => u.role === 'provider' && !u.isDeleted && u.status === 'active');
  const techniciansList = providersList.filter(u => u.providerCategory === 'home_technician' || !u.providerCategory);
  const driversList = providersList.filter(u => u.providerCategory === 'cargo_driver' || !u.providerCategory);

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

  const handleOpenDispatchModal = (order: Order) => {
    setDispatchOrder(order);
    setDispatchStatus(order.status === 'pending' ? 'assigned' : order.status);
    setDispatchProviderName(order.assignedProviderName || '');
    setDispatchProviderPhone(order.assignedProviderPhone || '');
    setDispatchEtaMinutes(order.etaMinutes || 20);
    setDispatchNote('');
    setDispatchProviderId(order.assignedProviderId || '');
  };

  const handleSelectProviderForDispatch = (provId: string) => {
    setDispatchProviderId(provId);
    if (!provId) return;
    const target = users.find(u => u.id === provId);
    if (target) {
      setDispatchProviderName(target.name);
      setDispatchProviderPhone(target.phone);
    }
  };

  const handleSaveDispatchModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchOrder) return;

    Store.adminUpdateOrderDispatch(dispatchOrder.id, {
      status: dispatchStatus,
      providerName: dispatchProviderName.trim() || undefined,
      providerPhone: dispatchProviderPhone.trim() || undefined,
      etaMinutes: Number(dispatchEtaMinutes) || undefined,
      customNote: dispatchNote.trim() || undefined,
      providerId: dispatchProviderId || undefined
    });

    setUserActionNotice(`Order ${dispatchOrder.id} dispatch updated! Assigned: ${dispatchProviderName || 'Worker'}, ETA: ${dispatchEtaMinutes}m, Status: ${dispatchStatus}. Customer live tracker updated!`);
    setTimeout(() => setUserActionNotice(''), 5000);
    setDispatchOrder(null);
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

  const handleAssignServiceSource = (serviceId: string, providerId: string) => {
    Store.assignSourceToService(serviceId, providerId);
    setEditingServices([...Store.getServicesCatalog()]);
    setCatalogSavedMessage(
      providerId ? 'Provider source assigned! Service is now Published on the Customer Store.' : 'Provider source unassigned. Service is now Hidden from Customer Store.'
    );
    setTimeout(() => setCatalogSavedMessage(''), 4500);
  };

  const handleDeleteService = (serviceId: string) => {
    if (window.confirm('Are you sure you want to delete this service permanently from the catalog?')) {
      Store.deleteServiceFromCatalog(serviceId);
      setEditingServices([...Store.getServicesCatalog()]);
      setCatalogSavedMessage('Service deleted permanently from catalog.');
      setTimeout(() => setCatalogSavedMessage(''), 4000);
    }
  };

  const handleAssignVehicleSource = (vehicleId: string, driverId: string) => {
    Store.assignSourceToVehicle(vehicleId, driverId);
    setEditingVehicles([...Store.getVehiclesCatalog()]);
    setCatalogSavedMessage(
      driverId ? 'Driver source assigned! Vehicle is now Published on the Customer Store.' : 'Driver source unassigned. Vehicle is now Hidden from Customer Store.'
    );
    setTimeout(() => setCatalogSavedMessage(''), 4500);
  };

  const handleDeleteVehicle = (vehicleId: string) => {
    if (window.confirm('Are you sure you want to delete this vehicle permanently from the fleet catalog?')) {
      Store.deleteVehicleFromCatalog(vehicleId);
      setEditingVehicles([...Store.getVehiclesCatalog()]);
      setCatalogSavedMessage('Vehicle deleted permanently from fleet catalog.');
      setTimeout(() => setCatalogSavedMessage(''), 4000);
    }
  };

  const handleTogglePublishService = (serviceId: string) => {
    const isNowPublished = Store.togglePublishService(serviceId);
    setEditingServices([...Store.getServicesCatalog()]);
    setCatalogSavedMessage(
      isNowPublished ? 'Service published live to customer store!' : 'Service hidden from customer store.'
    );
    setTimeout(() => setCatalogSavedMessage(''), 4000);
  };

  const handleTogglePublishVehicle = (vehicleId: string) => {
    const isNowPublished = Store.togglePublishVehicle(vehicleId);
    setEditingVehicles([...Store.getVehiclesCatalog()]);
    setCatalogSavedMessage(
      isNowPublished ? 'Vehicle / Driver published live to customer store!' : 'Vehicle / Driver hidden from customer store.'
    );
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
      icon: 'Zap',
      isPublished: true
    };
    const updated = [...editingServices, newService];
    setEditingServices(updated);
    Store.updateServicesCatalog(updated);
    setCatalogSavedMessage('New technician service added to catalog!');
    setTimeout(() => setCatalogSavedMessage(''), 4000);
  };

  const handleAddNewVehicle = () => {
    const newId = 'veh-custom-' + Date.now();
    const newVehicle: TransportVehicleItem = {
      id: newId,
      name: 'Khanewal Cargo Loader Rickshaw',
      capacityKg: 400,
      dimensions: '5.5ft x 3.8ft bed',
      baseFare: 700,
      perKmRate: 50,
      helperRate: 350,
      bestFor: 'Agricultural sacks, bazaar freight, carton transport',
      icon: 'Truck',
      isPublished: true
    };
    const updated = [...editingVehicles, newVehicle];
    setEditingVehicles(updated);
    Store.updateVehiclesCatalog(updated);
    setCatalogSavedMessage('New vehicle / rickshaw added to fleet catalog!');
    setTimeout(() => setCatalogSavedMessage(''), 4000);
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
                  <th className="py-3 px-4">Order ID & Time</th>
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Service / Cargo Name</th>
                  <th className="py-3 px-4">Pay & Status</th>
                  <th className="py-3 px-4 min-w-[300px]">Change Status & Worker Assignment</th>
                  <th className="py-3 px-3 text-center">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400">
                      No matching orders found.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const isInline = inlineOrderId === order.id;
                    const serviceTitle = order.category === 'home_services' 
                      ? (order.serviceDetails?.serviceName || 'Home Service')
                      : order.category === 'transport_cargo'
                      ? (order.transportDetails?.vehicleName || 'Cargo Transport')
                      : (order.deliveryDetails?.itemName || 'Store Delivery');

                    const serviceSubtitle = order.category === 'home_services'
                      ? order.serviceDetails?.issueDescription
                      : order.category === 'transport_cargo'
                      ? `${order.transportDetails?.cargoDescription || 'Cargo'} (${order.transportDetails?.estimatedDistanceKm || 0} km)`
                      : `Store: ${order.deliveryDetails?.storeName || 'Khanewal Market'}`;

                    return (
                      <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* 1. Order ID */}
                        <td className="py-3.5 px-4 align-top">
                          <span className="font-mono font-bold text-slate-900 block text-sm">{order.id}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            {new Date(order.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        </td>

                        {/* 2. Customer Name & Details */}
                        <td className="py-3.5 px-4 align-top">
                          <span className="font-bold text-slate-900 block text-xs">{order.customerName}</span>
                          <span className="text-slate-600 font-mono text-[11px] block">{order.customerPhone}</span>
                          <span className="text-[11px] text-slate-400 line-clamp-2 max-w-[200px] mt-0.5" title={order.deliveryAddress}>
                            📍 {order.deliveryAddress}
                          </span>
                        </td>

                        {/* 3. Service Name */}
                        <td className="py-3.5 px-4 align-top">
                          <span className="font-bold text-slate-900 block text-xs">
                            {serviceTitle}
                          </span>
                          <span className="text-[11px] text-slate-500 block line-clamp-1">
                            {serviceSubtitle}
                          </span>
                          <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded font-medium inline-block mt-1 capitalize">
                            {order.category.replace('_', ' ')}
                          </span>
                        </td>

                        {/* 4. Pay & Status */}
                        <td className="py-3.5 px-4 align-top">
                          <span className="font-mono font-bold text-sm text-slate-900 block">
                            PKR {order.pricing.total.toLocaleString()}
                          </span>
                          <div className="flex flex-wrap items-center gap-1 mt-1">
                            <span className="text-[10px] bg-slate-100 text-slate-700 border border-slate-200 px-1.5 py-0.2 rounded font-semibold uppercase">
                              {order.paymentMethod}
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
                              order.paymentStatus === 'paid' 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {order.paymentStatus}
                            </span>
                          </div>
                        </td>

                        {/* 5. Change Status & Worker Assignment (Live Inline Controls) */}
                        <td className="py-3.5 px-4 align-top">
                          <div className="space-y-1.5">
                            {/* Direct Status Change Dropdown */}
                            <div className="flex items-center gap-2">
                              <select
                                value={isInline ? inlineStatus : order.status}
                                onChange={(e) => handleDirectStatusChange(order, e.target.value as OrderStatus)}
                                className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border shadow-2xs transition-colors cursor-pointer ${
                                  order.status === 'completed'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                    : order.status === 'cancelled'
                                    ? 'bg-red-50 text-red-800 border-red-300'
                                    : order.status === 'on_the_way'
                                    ? 'bg-amber-50 text-amber-900 border-amber-300'
                                    : order.status === 'assigned'
                                    ? 'bg-blue-50 text-blue-900 border-blue-300'
                                    : 'bg-slate-50 text-slate-800 border-slate-300'
                                }`}
                              >
                                <option value="pending">⏳ Pending (انتظار برائے تصدیق)</option>
                                <option value="assigned">👤 Assigned (ورکر تفویض کریں)</option>
                                <option value="on_the_way">🛵 On The Way (راستے میں ہے)</option>
                                <option value="work_started">🔧 Work Started (کام جاری ہے)</option>
                                <option value="completed">✅ Completed (مکمل ہو گیا)</option>
                                <option value="cancelled">❌ Cancelled (منسوخ کریں)</option>
                              </select>
                            </div>

                            {/* Inline Worker Name and Phone Input Box when choosing Assign */}
                            {isInline ? (
                              <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-300 space-y-2 text-xs shadow-xs animate-in fade-in duration-200">
                                <span className="font-bold text-amber-950 block">ورکر کی تفصیلات درج کریں:</span>

                                {/* Quick select from existing registered providers */}
                                {providersList.length > 0 && (
                                  <select
                                    onChange={(e) => {
                                      const prov = providersList.find(p => p.id === e.target.value);
                                      if (prov) {
                                        setInlineWorkerName(prov.name);
                                        setInlineWorkerPhone(prov.phone);
                                      }
                                    }}
                                    className="w-full text-[11px] rounded-lg border border-amber-300 bg-white px-2 py-1 text-slate-800 font-medium"
                                  >
                                    <option value="">-- رجسٹرڈ ورکر چنیں (یا نیچے خود ٹائپ کریں) --</option>
                                    {providersList.map(prov => (
                                      <option key={prov.id} value={prov.id}>
                                        {prov.name} ({prov.phone}) - {prov.serviceSkill || prov.providerCategory || 'Verified'}
                                      </option>
                                    ))}
                                  </select>
                                )}

                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="text-[10px] text-slate-600 font-medium block">Worker Name:</label>
                                    <input
                                      type="text"
                                      value={inlineWorkerName}
                                      onChange={(e) => setInlineWorkerName(e.target.value)}
                                      placeholder="مثلاً: Muhammad Aslam"
                                      className="w-full text-xs rounded-lg border border-slate-300 px-2 py-1 bg-white font-medium focus:ring-1 focus:ring-amber-500"
                                    />
                                  </div>

                                  <div>
                                    <label className="text-[10px] text-slate-600 font-medium block">Worker Phone:</label>
                                    <input
                                      type="tel"
                                      value={inlineWorkerPhone}
                                      onChange={(e) => setInlineWorkerPhone(e.target.value)}
                                      placeholder="0300-1234567"
                                      className="w-full text-xs rounded-lg border border-slate-300 px-2 py-1 bg-white font-mono focus:ring-1 focus:ring-amber-500"
                                    />
                                  </div>
                                </div>

                                <div className="flex items-center justify-between gap-2 pt-1">
                                  <div className="flex items-center gap-1">
                                    <span className="text-[10px] text-slate-600 font-medium">ETA:</span>
                                    <input
                                      type="number"
                                      value={inlineWorkerEta}
                                      onChange={(e) => setInlineWorkerEta(Number(e.target.value))}
                                      placeholder="20"
                                      className="w-14 text-xs rounded-lg border border-slate-300 px-1.5 py-0.5 bg-white font-mono text-center"
                                    />
                                    <span className="text-[10px] text-slate-500">منٹ</span>
                                  </div>

                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleSaveInlineAssign(order.id)}
                                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs cursor-pointer"
                                    >
                                      محفوظ کریں (Save)
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setInlineOrderId(null)}
                                      className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-lg cursor-pointer"
                                    >
                                      منسوخ
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              /* Display assigned worker information if available */
                              <div>
                                {order.assignedProviderName ? (
                                  <div className="flex items-start justify-between gap-2 p-1.5 rounded-lg bg-emerald-50/60 border border-emerald-200 text-[11px]">
                                    <div>
                                      <span className="font-bold text-emerald-800 flex items-center gap-1">
                                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                        {order.assignedProviderName}
                                      </span>
                                      <span className="font-mono text-slate-600 block text-[10px]">
                                        📞 {order.assignedProviderPhone || 'No phone'}
                                      </span>
                                      {order.etaMinutes && (
                                        <span className="text-[10px] text-amber-800 font-semibold block">
                                          ⏱ پہنچنے کا وقت: ~{order.etaMinutes} منٹ
                                        </span>
                                      )}
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => handleStartInlineAssign(order, order.status)}
                                      className="text-[10px] text-blue-700 hover:text-blue-900 font-bold px-1.5 py-0.5 rounded-md hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer shrink-0"
                                      title="Edit Worker or Phone"
                                    >
                                      تبدیل ورکر (Edit)
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleStartInlineAssign(order, 'assigned')}
                                    className="text-[11px] text-amber-800 hover:text-amber-900 font-bold bg-amber-50 hover:bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer w-fit"
                                  >
                                    <span>+ ورکر کا نام اور فون درج کریں</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* 6. Inspect Full Details */}
                        <td className="py-3.5 px-3 text-center align-top">
                          <button
                            onClick={() => setSelectedOrderDetails(order)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors cursor-pointer"
                            title="Inspect Order Details & Timeline"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
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

      {/* SECTION 4: SERVICE CATALOG, STORE VISIBILITY & SOURCE PROVIDER MANAGER */}
      {activeSection === 'catalog' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  Storefront Availability Rule Active
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">Service Catalog & Source Provider Manager</h3>
              <p className="text-xs text-slate-500">
                Services and vehicles ONLY appear on customer storefronts when an active verified provider or driver is assigned as a source.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAddNewService}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 text-slate-600" />
                <span>Add Service</span>
              </button>
              <button
                type="button"
                onClick={handleAddNewVehicle}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 text-slate-600" />
                <span>Add Vehicle / Riksha</span>
              </button>
              <button
                type="button"
                onClick={handleSaveCatalog}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save All Rates</span>
              </button>
            </div>
          </div>

          {/* Quick Visibility Filter */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-semibold text-xs">Show in Catalog:</span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setCatalogFilter('all')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                    catalogFilter === 'all' ? 'bg-slate-900 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All ({editingServices.length + editingVehicles.length})
                </button>
                <button
                  type="button"
                  onClick={() => setCatalogFilter('published')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                    catalogFilter === 'published' ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  ● Published & Live ({editingServices.filter(s => Store.isServiceAvailable(s)).length + editingVehicles.filter(v => Store.isVehicleAvailable(v)).length})
                </button>
                <button
                  type="button"
                  onClick={() => setCatalogFilter('unpublished')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                    catalogFilter === 'unpublished' ? 'bg-amber-600 text-white shadow-2xs' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                  }`}
                >
                  ○ Hidden / Needs Source ({editingServices.filter(s => !Store.isServiceAvailable(s)).length + editingVehicles.filter(v => !Store.isVehicleAvailable(v)).length})
                </button>
              </div>
            </div>

            <span className="text-[11px] text-slate-400 font-mono">
              {techniciansList.length} Technicians · {driversList.length} Drivers Online
            </span>
          </div>

          {catalogSavedMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{catalogSavedMessage}</span>
            </div>
          )}

          {/* 1. Home Services Catalog & Source Management */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Wrench className="w-4 h-4 text-emerald-600" />
                <span>1. Home Services & Source Provider Assignment</span>
              </h4>
              <span className="text-[11px] text-slate-400">
                {editingServices.filter(s => Store.isServiceAvailable(s)).length} of {editingServices.length} Published
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {editingServices
                .filter(srv => {
                  const isAvail = Store.isServiceAvailable(srv);
                  if (catalogFilter === 'published') return isAvail;
                  if (catalogFilter === 'unpublished') return !isAvail;
                  return true;
                })
                .map((srv) => {
                  const isLive = Store.isServiceAvailable(srv);
                  return (
                    <div
                      key={srv.id}
                      className={`bg-white rounded-2xl border p-4 space-y-3 text-xs transition-all ${
                        isLive ? 'border-emerald-300 shadow-2xs' : 'border-slate-200 bg-slate-50/50'
                      }`}
                    >
                      {/* Status Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-bold text-slate-900 block text-sm">{srv.name}</span>
                          <span className="text-[11px] text-slate-400">{srv.category} · {srv.estimatedDuration}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleTogglePublishService(srv.id)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer ${
                            isLive 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100' 
                              : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                          }`}
                          title={isLive ? 'Click to Hide from Store' : 'Click to Publish Live on Store'}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                          {isLive ? 'Live on Store (Click to Hide)' : 'Hidden (Click to Live)'}
                        </button>
                      </div>

                      <p className="text-slate-500 text-[11px] line-clamp-2">{srv.description}</p>

                      {/* Source Provider Assignment Dropdown */}
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                        <label className="block text-[11px] font-bold text-slate-800">
                          Assigned Provider / Source:
                        </label>
                        <select
                          value={srv.assignedProviderId || ''}
                          onChange={(e) => handleAssignServiceSource(srv.id, e.target.value)}
                          className="w-full text-xs rounded-lg border border-slate-300 px-2.5 py-1.5 bg-white font-medium focus:ring-2 focus:ring-blue-500/20"
                        >
                          <option value="">-- No Source (Unpublished / Hidden) --</option>
                          {techniciansList.map(t => (
                            <option key={t.id} value={t.id}>
                              {t.name} ({t.phone}) - {t.serviceSkill || 'Technician'}
                            </option>
                          ))}
                        </select>

                        {!srv.assignedProviderId && (
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[10px] text-amber-800">Assign a worker to publish this.</span>
                            <button
                              type="button"
                              onClick={() => {
                                setNewUserRole('provider');
                                setNewProviderCategory('home_technician');
                                setNewSkill(srv.name);
                                setIsCreateUserModalOpen(true);
                              }}
                              className="text-[10px] text-blue-700 font-bold hover:underline cursor-pointer"
                            >
                              + Onboard Worker
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Base Price & Delete Action */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                        <div className="flex-1">
                          <label className="block text-[10px] font-semibold text-slate-500">
                            Starting Price (PKR)
                          </label>
                          <input
                            type="number"
                            step={100}
                            value={srv.basePrice}
                            onChange={(e) => handleServicePriceChange(srv.id, Number(e.target.value))}
                            className="w-full text-xs font-mono font-bold rounded-lg border border-slate-300 px-2 py-1 bg-white"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteService(srv.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors mt-3.5 cursor-pointer"
                          title="Delete service permanently from catalog"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* 2. Transport & Cargo Fleet Catalog & Driver Assignment */}
          <div className="space-y-3 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-600" />
                <span>2. Cargo Fleet & Driver Source Assignment</span>
              </h4>
              <span className="text-[11px] text-slate-400">
                {editingVehicles.filter(v => Store.isVehicleAvailable(v)).length} of {editingVehicles.length} Published
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {editingVehicles
                .filter(veh => {
                  const isAvail = Store.isVehicleAvailable(veh);
                  if (catalogFilter === 'published') return isAvail;
                  if (catalogFilter === 'unpublished') return !isAvail;
                  return true;
                })
                .map((veh) => {
                  const isLive = Store.isVehicleAvailable(veh);
                  return (
                    <div
                      key={veh.id}
                      className={`bg-white rounded-2xl border p-4 space-y-3 text-xs transition-all ${
                        isLive ? 'border-emerald-300 shadow-2xs' : 'border-slate-200 bg-slate-50/50'
                      }`}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-bold text-slate-900 block text-xs">{veh.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">Capacity: {veh.capacityKg}kg</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleTogglePublishVehicle(veh.id)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 flex items-center gap-1 transition-colors cursor-pointer ${
                            isLive
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                          }`}
                          title={isLive ? 'Click to Hide from Store' : 'Click to Publish Live on Store'}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                          {isLive ? 'Live (Click to Hide)' : 'Hidden (Click to Live)'}
                        </button>
                      </div>

                      {/* Driver Source Selector */}
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                        <label className="block text-[10px] font-bold text-slate-800">
                          Assigned Driver / Fleet Source:
                        </label>
                        <select
                          value={veh.assignedProviderId || ''}
                          onChange={(e) => handleAssignVehicleSource(veh.id, e.target.value)}
                          className="w-full text-xs rounded-lg border border-slate-300 px-2 py-1 bg-white font-medium"
                        >
                          <option value="">-- No Driver (Hidden) --</option>
                          {driversList.map(d => (
                            <option key={d.id} value={d.id}>
                              {d.name} ({d.phone}) - {d.vehicleType || 'Driver'}
                            </option>
                          ))}
                        </select>

                        {!veh.assignedProviderId && (
                          <div className="flex items-center justify-between pt-0.5">
                            <span className="text-[10px] text-amber-800">Requires driver to publish.</span>
                            <button
                              type="button"
                              onClick={() => {
                                setNewUserRole('provider');
                                setNewProviderCategory('cargo_driver');
                                setNewVehicle(veh.name);
                                setIsCreateUserModalOpen(true);
                              }}
                              className="text-[10px] text-blue-700 font-bold hover:underline cursor-pointer"
                            >
                              + Onboard Driver
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Rates Editor */}
                      <div className="space-y-2">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500">Base Fare (PKR)</label>
                          <input
                            type="number"
                            step={50}
                            value={veh.baseFare}
                            onChange={(e) => handleVehicleRateChange(veh.id, 'baseFare', Number(e.target.value))}
                            className="w-full text-xs font-mono font-bold rounded-lg border border-slate-300 px-2 py-1 bg-white"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-500">Per KM (PKR)</label>
                            <input
                              type="number"
                              step={5}
                              value={veh.perKmRate}
                              onChange={(e) => handleVehicleRateChange(veh.id, 'perKmRate', Number(e.target.value))}
                              className="w-full text-xs font-mono font-bold rounded-lg border border-slate-300 px-2 py-1 bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-500">Helper (PKR)</label>
                            <input
                              type="number"
                              step={50}
                              value={veh.helperRate}
                              onChange={(e) => handleVehicleRateChange(veh.id, 'helperRate', Number(e.target.value))}
                              className="w-full text-xs font-mono font-bold rounded-lg border border-slate-300 px-2 py-1 bg-white"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Delete button */}
                      <div className="pt-2 border-t border-slate-100 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleDeleteVehicle(veh.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Delete vehicle permanently from catalog"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Vehicle</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
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

      {/* DISPATCH & LIVE STATUS UPDATE MODAL */}
      {dispatchOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs">
                  ⚡
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Dispatch & Live Status Broadcast</span>
                    <span className="font-mono text-xs text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
                      {dispatchOrder.id}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Customer: {dispatchOrder.customerName} ({dispatchOrder.customerPhone})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDispatchOrder(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDispatchModal} className="p-6 space-y-4 text-xs">
              {/* Order Context */}
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl space-y-1">
                <div className="flex items-center justify-between text-slate-700">
                  <span className="font-semibold capitalize">{dispatchOrder.category.replace('_', ' ')}</span>
                  <span className="font-mono font-bold text-slate-900">PKR {dispatchOrder.pricing.total.toLocaleString()}</span>
                </div>
                <p className="text-slate-500 text-[11px] truncate">
                  Address: {dispatchOrder.deliveryAddress}
                </p>
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  1. Live Order Status (Customer will see this real-time) *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 'pending', label: 'Pending', color: 'border-slate-300' },
                    { val: 'assigned', label: 'Assigned', color: 'border-blue-400 text-blue-800' },
                    { val: 'on_the_way', label: 'On The Way (روانہ)', color: 'border-amber-400 text-amber-800' },
                    { val: 'work_started', label: 'Work Started', color: 'border-purple-400 text-purple-800' },
                    { val: 'completed', label: 'Completed (مکمل)', color: 'border-emerald-400 text-emerald-800' },
                    { val: 'cancelled', label: 'Cancelled', color: 'border-red-400 text-red-800' }
                  ].map(st => (
                    <button
                      type="button"
                      key={st.val}
                      onClick={() => setDispatchStatus(st.val as OrderStatus)}
                      className={`py-2 px-2 rounded-xl border text-center font-bold text-[11px] transition-all cursor-pointer ${
                        dispatchStatus === st.val
                          ? 'bg-slate-900 text-white shadow-xs border-slate-900 ring-2 ring-blue-500/30'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Select Provider or Type Custom */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-slate-700 font-bold mb-1">
                  2. Select Verified Worker / Driver (or Type Custom Name)
                </label>
                <select
                  value={dispatchProviderId}
                  onChange={(e) => handleSelectProviderForDispatch(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 bg-white mb-2 cursor-pointer"
                >
                  <option value="">-- Choose from Registered Fleet (Optional) --</option>
                  {providersList.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.phone}) - {p.serviceSkill || p.vehicleType || p.providerCategory}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Worker / Rider / Driver Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={dispatchProviderName}
                    onChange={(e) => setDispatchProviderName(e.target.value)}
                    placeholder="e.g. Muhammad Tariq (Electrician)"
                    className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 font-medium focus:border-blue-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Worker Direct Contact Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={dispatchProviderPhone}
                    onChange={(e) => setDispatchProviderPhone(e.target.value)}
                    placeholder="+92 301 7766554"
                    className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 font-mono focus:border-blue-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Estimated Time to Reach (ETA in minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="300"
                    value={dispatchEtaMinutes}
                    onChange={(e) => setDispatchEtaMinutes(Number(e.target.value) || 0)}
                    placeholder="20"
                    className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 font-mono font-bold focus:border-blue-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    ETA Live Customer Preview
                  </label>
                  <div className="h-9 rounded-xl bg-amber-50 border border-amber-200 px-3 flex items-center text-[11px] font-bold text-amber-900">
                    ~ {dispatchEtaMinutes || 0} منٹ میں پہنچ جائے گا (ETA)
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Custom Status Note / Message for Customer (Urdu / English)
                </label>
                <textarea
                  rows={2}
                  value={dispatchNote}
                  onChange={(e) => setDispatchNote(e.target.value)}
                  placeholder="مثلاً: ٹیکنیشن اوزار اور تار لے کر روانہ ہو چکا ہے، 20 منٹ میں آپ کے پتے پر ہو گا۔"
                  className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDispatchOrder(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <span>Broadcast Live to Customer</span>
                  <span>→</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
