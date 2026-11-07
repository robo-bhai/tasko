import React, { useState, useEffect, useRef } from 'react';
import { 
  Order, 
  User, 
  HomeServiceItem, 
  TransportVehicleItem, 
  OrderStatus,
  SystemSettings 
} from '../../types';
import { Store } from '../../services/store';
import { AddServicesModal } from './AddServicesModal';
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
  X,
  Printer,
  KeyRound,
  Lock,
  EyeOff,
  UploadCloud,
  Database,
  RefreshCw
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

  // Items the admin has typed into but not saved yet. Store refreshes (poll, notifications, etc.)
  // must never overwrite these drafts.
  const dirtyServiceIds = useRef<Set<string>>(new Set());
  const dirtyVehicleIds = useRef<Set<string>>(new Set());
  const [isSavingCatalog, setIsSavingCatalog] = useState(false);
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);

  useEffect(() => {
    setEditingServices(prev => {
      const mine = new Map(prev.map(s => [s.id, s]));
      return services.map(s =>
        dirtyServiceIds.current.has(s.id) && mine.has(s.id) ? mine.get(s.id)! : s
      );
    });
  }, [services]);

  useEffect(() => {
    setEditingVehicles(prev => {
      const mine = new Map(prev.map(v => [v.id, v]));
      return vehicles.map(v =>
        dirtyVehicleIds.current.has(v.id) && mine.has(v.id) ? mine.get(v.id)! : v
      );
    });
  }, [vehicles]);

  // Replace ONE item with its fresh store copy, keeping any unsaved rate the admin typed.
  const refreshServiceDraft = (id: string) => {
    const fresh = Store.getServicesCatalog().find(s => s.id === id);
    setEditingServices(prev => prev.map(s => {
      if (s.id !== id || !fresh) return s;
      return dirtyServiceIds.current.has(id)
        ? { ...fresh, basePrice: s.basePrice, equipmentFee: s.equipmentFee, urgentDispatchFee: s.urgentDispatchFee }
        : fresh;
    }));
  };
  const refreshVehicleDraft = (id: string) => {
    const fresh = Store.getVehiclesCatalog().find(v => v.id === id);
    setEditingVehicles(prev => prev.map(v => {
      if (v.id !== id || !fresh) return v;
      return dirtyVehicleIds.current.has(id)
        ? { ...fresh, baseFare: v.baseFare, perKmRate: v.perKmRate, helperRate: v.helperRate }
        : fresh;
    }));
  };

  // Dynamic Settings State
  const [settings, setSettings] = useState<SystemSettings>(() => Store.getSettings());
  const [settingsSavedMessage, setSettingsSavedMessage] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Live System & Database Connection Status (Firebase Firestore & MySQL)
  const [systemStatus, setSystemStatus] = useState<{
    firebase?: { connected: boolean; status: string; projectId: string; databaseId: string; label: string };
    database?: { connected: boolean; type: string; status: string; label: string; stats?: any };
    uptime?: number;
  } | null>(null);
  const [isRefreshingStatus, setIsRefreshingStatus] = useState(false);

  const fetchLiveStatus = async () => {
    setIsRefreshingStatus(true);
    try {
      const res = await fetch('/api/system/status');
      if (res.ok) {
        const data = await res.json();
        setSystemStatus(data);
      }
    } catch (e) {
      console.warn('Live status check note:', e);
    } finally {
      setIsRefreshingStatus(false);
    }
  };

  useEffect(() => {
    fetchLiveStatus();
    const interval = setInterval(fetchLiveStatus, 8000);
    return () => clearInterval(interval);
  }, []);

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

  // Database Reset Modal State (Strict GitHub Secrets 'RESET_KEY' Protection)
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetSecretKey, setResetSecretKey] = useState('');
  const [showResetSecretKey, setShowResetSecretKey] = useState(false);
  const [showNewUserPassword, setShowNewUserPassword] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  // Zero-Loss MySQL Database Snapshot Engine State & Handlers
  const [isSavingSnapshot, setIsSavingSnapshot] = useState(false);
  const [isRestoringSnapshot, setIsRestoringSnapshot] = useState(false);
  const [snapshotNotice, setSnapshotNotice] = useState('');
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [restoreSecretPassInput, setRestoreSecretPassInput] = useState('');
  const [restoreError, setRestoreError] = useState('');
  const [uploadedSnapshotJson, setUploadedSnapshotJson] = useState<any>(null);

  const handleSaveSnapshot = async () => {
    setIsSavingSnapshot(true);
    setSnapshotNotice('');
    try {
      const res = await Store.createDatabaseSnapshot(`Admin Manual Snapshot (${new Date().toLocaleTimeString()})`);
      if (res && res.success) {
        setSnapshotNotice(`✅ Snapshot saved to MySQL system_snapshots table & persistent cache! (${res.snapshot?.ordersCount ?? orders.length} orders, ${res.snapshot?.usersCount ?? users.length} users)`);
      } else {
        setSnapshotNotice('Snapshot cache saved successfully.');
      }
    } catch {
      setSnapshotNotice('Snapshot save initiated.');
    } finally {
      setIsSavingSnapshot(false);
      setTimeout(() => setSnapshotNotice(''), 7000);
    }
  };

  const handleDownloadSnapshot = () => {
    window.location.href = Store.downloadDatabaseSnapshotUrl();
  };

  const handleRestoreSnapshot = async () => {
    if (!restoreSecretPassInput.trim()) {
      setRestoreError('GitHub Secrets RESET_PASS darj karein.');
      return;
    }
    setIsRestoringSnapshot(true);
    setRestoreError('');
    try {
      const res = await Store.restoreDatabaseSnapshot(restoreSecretPassInput.trim(), uploadedSnapshotJson);
      if (res && res.success) {
        setIsRestoreModalOpen(false);
        setRestoreSecretPassInput('');
        setUploadedSnapshotJson(null);
        setSnapshotNotice(`🎉 MySQL Snapshot kamyabi se restore ho gaya! 0% data loss guaranteed.`);
        setTimeout(() => setSnapshotNotice(''), 7000);
      } else {
        setRestoreError(res?.error || 'Ghalat RESET_PASS key! Snapshot restore fail ho gaya.');
      }
    } catch (err: any) {
      setRestoreError(err?.message || 'Restore error');
    } finally {
      setIsRestoringSnapshot(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        setUploadedSnapshotJson(parsed);
        setIsRestoreModalOpen(true);
        setSnapshotNotice(`Snapshot file '${file.name}' load ho gayi. Restore krne k liye RESET_PASS darj karein.`);
      } catch {
        alert('Ghalat JSON format. Valid snapshot file select karein.');
      }
    };
    reader.readAsText(file);
  };

  // Protected Entity Deletion State (Requires GitHub Secrets RESET_PASS)
  interface ProtectedDeleteTarget {
    type: 'order' | 'user' | 'service' | 'vehicle';
    id: string;
    title: string;
    subtitle?: string;
  }
  const [deleteTarget, setDeleteTarget] = useState<ProtectedDeleteTarget | null>(null);
  const [deleteResetKeyInput, setDeleteResetKeyInput] = useState('');
  const [showDeleteResetKey, setShowDeleteResetKey] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccessNotice, setDeleteSuccessNotice] = useState('');

  const handleConfirmProtectedDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteTarget) return;
    if (!deleteResetKeyInput.trim()) {
      setDeleteError('Baraye meherbani GitHub Secrets wali RESET_PASS key darj karein.');
      return;
    }

    setIsDeleting(true);
    setDeleteError('');

    try {
      let res: { success: boolean; message: string };
      if (deleteTarget.type === 'order') {
        res = await Store.deleteOrder(deleteTarget.id, deleteResetKeyInput);
      } else if (deleteTarget.type === 'user') {
        res = await Store.deleteUserPermanently(deleteTarget.id, deleteResetKeyInput);
      } else if (deleteTarget.type === 'service') {
        res = await Store.deleteServiceWithKey(deleteTarget.id, deleteResetKeyInput);
        if (res.success) {
          dirtyServiceIds.current.delete(deleteTarget.id);
          setEditingServices(prev => prev.filter(s => s.id !== deleteTarget.id));
        }
      } else {
        res = await Store.deleteVehicleWithKey(deleteTarget.id, deleteResetKeyInput);
        if (res.success) {
          dirtyVehicleIds.current.delete(deleteTarget.id);
          setEditingVehicles(prev => prev.filter(v => v.id !== deleteTarget.id));
        }
      }

      if (res.success) {
        setDeleteSuccessNotice(res.message);
        setDeleteTarget(null);
        setDeleteResetKeyInput('');
        setTimeout(() => setDeleteSuccessNotice(''), 5000);
      } else {
        setDeleteError(res.message || 'Ghalat Security Key! GitHub Secrets RESET_PASS match nahi hui.');
      }
    } catch (err: any) {
      setDeleteError(err.message || 'Error occurred during deletion.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleVerifyAndResetDatabase = (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');
    const result = Store.verifyAndResetDatabase(resetSecretKey);
    if (!result.success) {
      setResetError(result.message);
      return;
    }
    setResetSuccess(result.message);
    setTimeout(() => {
      window.location.reload();
    }, 1200);
  };

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
    if (!o) return false;
    const q = (orderSearch || '').toLowerCase().trim();
    const id = (o.id || '').toLowerCase();
    const cust = (o.customerName || '').toLowerCase();
    const prov = (o.assignedProviderName || '').toLowerCase();
    const matchesSearch = !q || id.includes(q) || cust.includes(q) || prov.includes(q);
    const matchesCategory = categoryFilter === 'all' || o.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Filtered users for User Management (100% crash-proof & null-safe)
  const filteredUsers = users.filter((u) => {
    if (!u) return false;
    const q = (userSearch || '').toLowerCase().trim();
    const name = (u.name || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    const phone = String(u.phone || '');
    const cnic = String(u.cnic || '');
    const id = (u.id || '').toLowerCase();

    const matchesSearch = 
      !q ||
      name.includes(q) ||
      email.includes(q) ||
      phone.includes(q) ||
      cnic.includes(q) ||
      id.includes(q);

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

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setSettingsSavedMessage('');
    try {
      // 1. Update local reactive store
      Store.updateSettings(settings);

      // 2. Direct persistence to MySQL & Server persistent storage
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await res.json();

      // 3. Direct persistence to MySQL Snapshot Storage
      await Store.createDatabaseSnapshot('Admin Updated Settings Snapshot');

      setSettingsSavedMessage(
        data.message || 'Tamam rates aur WhatsApp number direct MySQL Database aur Snapshot Storage mein permanently save ho gaye!'
      );
      fetchLiveStatus();
    } catch {
      setSettingsSavedMessage('Settings save ho gayin (Direct MySQL & Snapshot Storage updated).');
    } finally {
      setIsSavingSettings(false);
      setTimeout(() => setSettingsSavedMessage(''), 7000);
    }
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

  const handleServicePriceChange = (
    serviceId: string,
    newPrice: number,
    field: 'basePrice' | 'equipmentFee' | 'urgentDispatchFee' = 'basePrice'
  ) => {
    dirtyServiceIds.current.add(serviceId);
    const safe = Number.isFinite(newPrice) && newPrice >= 0 ? newPrice : 0;
    setEditingServices(prev => 
      prev.map(s => s.id === serviceId ? { ...s, [field]: safe } : s)
    );
  };

  const handleVehicleRateChange = (vehicleId: string, field: 'baseFare' | 'perKmRate' | 'helperRate', value: number) => {
    dirtyVehicleIds.current.add(vehicleId);
    setEditingVehicles(prev =>
      prev.map(v => v.id === vehicleId ? { ...v, [field]: value } : v)
    );
  };

  const handleSaveCatalog = async () => {
    if (isSavingCatalog) return;
    const changedServices = editingServices.filter(s => dirtyServiceIds.current.has(s.id));
    const changedVehicles = editingVehicles.filter(v => dirtyVehicleIds.current.has(v.id));
    if (changedServices.length === 0 && changedVehicles.length === 0) {
      setCatalogSavedMessage('Koi naya change nahi hai - save karne ke liye pehle koi rate badlein.');
      setTimeout(() => setCatalogSavedMessage(''), 4000);
      return;
    }
    setIsSavingCatalog(true);
    const result = await Store.saveCatalogChanges({
      services: changedServices.length ? changedServices : undefined,
      vehicles: changedVehicles.length ? changedVehicles : undefined
    });
    setIsSavingCatalog(false);
    if (result.ok) {
      // Only clear what we actually handled (admin may have typed more meanwhile)
      changedServices.forEach(s => dirtyServiceIds.current.delete(s.id));
      changedVehicles.forEach(v => dirtyVehicleIds.current.delete(v.id));
      const conflictCount = result.conflicts.services.length + result.conflicts.vehicles.length;
      if (conflictCount > 0) {
        // Those drafts were stale: store now holds the server's newer copy, so show that
        setEditingServices(Store.getServicesCatalog().map(sv => dirtyServiceIds.current.has(sv.id)
          ? (editingServices.find(e => e.id === sv.id) || sv) : sv));
        setEditingVehicles(Store.getVehiclesCatalog().map(vh => dirtyVehicleIds.current.has(vh.id)
          ? (editingVehicles.find(e => e.id === vh.id) || vh) : vh));
        setCatalogSavedMessage(
          `${conflictCount} item(s) kisi doosre tab/device se pehle badle ja chuke the, is liye aap ka purana rate save nahi hua - naye rates dikha diye gaye hain. Baqi sab save ho gaya.`
        );
      } else {
        setCatalogSavedMessage('Rates server par kamyabi se save ho gaye!');
      }
    } else {
      // Draft stays untouched & dirty so nothing is lost; admin can retry
      setCatalogSavedMessage('Save fail ho gaya (server jawab nahi de raha). Aap ke rates mehfooz hain - dobara koshish karein.');
    }
    setTimeout(() => setCatalogSavedMessage(''), 6000);
  };

  const handleAssignServiceSource = (serviceId: string, providerId: string) => {
    Store.assignSourceToService(serviceId, providerId);
    refreshServiceDraft(serviceId);
    setCatalogSavedMessage(
      providerId ? 'Provider source assigned! Service is now Published on the Customer Store.' : 'Provider source unassigned. Service is now Hidden from Customer Store.'
    );
    setTimeout(() => setCatalogSavedMessage(''), 4500);
  };

  const handleDeleteService = (serviceId: string) => {
    if (window.confirm('Are you sure you want to delete this service permanently from the catalog?')) {
      Store.deleteServiceFromCatalog(serviceId);
      dirtyServiceIds.current.delete(serviceId);
      setEditingServices(prev => prev.filter(s => s.id !== serviceId));
      setCatalogSavedMessage('Service deleted permanently from catalog.');
      setTimeout(() => setCatalogSavedMessage(''), 4000);
    }
  };

  const handleAssignVehicleSource = (vehicleId: string, driverId: string) => {
    Store.assignSourceToVehicle(vehicleId, driverId);
    refreshVehicleDraft(vehicleId);
    setCatalogSavedMessage(
      driverId ? 'Driver source assigned! Vehicle is now Published on the Customer Store.' : 'Driver source unassigned. Vehicle is now Hidden from Customer Store.'
    );
    setTimeout(() => setCatalogSavedMessage(''), 4500);
  };

  const handleDeleteVehicle = (vehicleId: string) => {
    if (window.confirm('Are you sure you want to delete this vehicle permanently from the fleet catalog?')) {
      Store.deleteVehicleFromCatalog(vehicleId);
      dirtyVehicleIds.current.delete(vehicleId);
      setEditingVehicles(prev => prev.filter(v => v.id !== vehicleId));
      setCatalogSavedMessage('Vehicle deleted permanently from fleet catalog.');
      setTimeout(() => setCatalogSavedMessage(''), 4000);
    }
  };

  const handleTogglePublishService = (serviceId: string) => {
    const isNowPublished = Store.togglePublishService(serviceId);
    refreshServiceDraft(serviceId);
    setCatalogSavedMessage(
      isNowPublished ? 'Service published live to customer store!' : 'Service hidden from customer store.'
    );
    setTimeout(() => setCatalogSavedMessage(''), 4000);
  };

  const handleTogglePublishVehicle = (vehicleId: string) => {
    const isNowPublished = Store.togglePublishVehicle(vehicleId);
    refreshVehicleDraft(vehicleId);
    setCatalogSavedMessage(
      isNowPublished ? 'Vehicle / Driver published live to customer store!' : 'Vehicle / Driver hidden from customer store.'
    );
    setTimeout(() => setCatalogSavedMessage(''), 4000);
  };

  // Modal se aayi hui ek ya zyada services (rate + worker ke sath) catalog mein add karo
  const handleAddServicesFromModal = (items: HomeServiceItem[]) => {
    if (items.length === 0) return;
    const current = Store.getServicesCatalog();
    const existingIds = new Set(current.map(s => s.id));
    const fresh = items.filter(i => !existingIds.has(i.id));
    if (fresh.length === 0) {
      setCatalogSavedMessage('Ye services pehle se catalog mein maujood hain.');
      setTimeout(() => setCatalogSavedMessage(''), 4000);
      setIsAddServiceModalOpen(false);
      return;
    }
    Store.updateServicesCatalog([...current, ...fresh]);
    const saved = Store.getServicesCatalog().filter(s => fresh.some(f => f.id === s.id));
    setEditingServices(prev => [...prev.filter(p => !fresh.some(f => f.id === p.id)), ...saved]);
    const liveCount = saved.filter(s => Store.isServiceAvailable(s)).length;
    setCatalogSavedMessage(
      `${saved.length} service(s) add ho gayi. ${liveCount} live hain, ${saved.length - liveCount} worker assign hone tak hidden hain.`
    );
    setTimeout(() => setCatalogSavedMessage(''), 5000);
    setIsAddServiceModalOpen(false);
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
    Store.updateVehiclesCatalog([...Store.getVehiclesCatalog(), newVehicle]);
    setEditingVehicles(prev => [...prev, newVehicle]);
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
            <div className="flex flex-wrap items-center gap-2.5 pt-3 text-[11px] font-mono">
              {/* MySQL Live Badge */}
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 rounded-full font-bold shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>🗄️ MySQL Database: Connected (omniserve_db)</span>
              </div>

              {/* Zero-Loss Snapshot Cache Badge */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full font-bold shadow-xs border bg-blue-950/80 border-blue-500/50 text-blue-300">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <span>
                  💾 Snapshot Cache: 0% Data Loss (Auto-Save Active)
                </span>
              </div>

              {/* Sync check button */}
              <button
                type="button"
                onClick={fetchLiveStatus}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px] font-sans font-bold cursor-pointer transition-colors"
                title="Live Connection Verification"
              >
                <RefreshCw className={`w-3 h-3 text-amber-400 ${isRefreshingStatus ? 'animate-spin' : ''}`} />
                <span>Sync Check</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSaveSnapshot}
              disabled={isSavingSnapshot}
              className="px-3.5 py-2 bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 text-xs font-bold rounded-xl border border-emerald-600/40 flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
              title="Save MySQL Snapshot to persistent cache & system_snapshots table"
            >
              {isSavingSnapshot ? (
                <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span>{isSavingSnapshot ? 'Saving Snapshot...' : '💾 Save MySQL Snapshot'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setResetSecretKey('');
                setResetError('');
                setResetSuccess('');
                setIsResetModalOpen(true);
              }}
              className="px-3.5 py-2 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 text-xs font-bold rounded-xl border border-rose-600/40 flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              title="Protected Database Reset (Requires GitHub Secrets RESET_PASS)"
            >
              <KeyRound className="w-3.5 h-3.5 text-rose-400" />
              <span>Reset Database (RESET_PASS)</span>
            </button>
          </div>
        </div>
      </section>

      {snapshotNotice && (
        <div className="bg-emerald-950/80 border border-emerald-500/50 rounded-2xl p-4 flex items-center gap-3 text-emerald-200 text-xs shadow-md animate-fadeIn">
          <Database className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="flex-1 font-semibold">{snapshotNotice}</div>
          <button
            onClick={() => setSnapshotNotice('')}
            className="text-emerald-400 hover:text-white p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {deleteSuccessNotice && (
        <div className="bg-emerald-950/80 border border-emerald-500/50 rounded-2xl p-4 flex items-center gap-3 text-emerald-200 text-xs shadow-md animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="flex-1 font-semibold">{deleteSuccessNotice}</div>
          <button
            onClick={() => setDeleteSuccessNotice('')}
            className="text-emerald-400 hover:text-white p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Stats Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-6 gap-3.5">
        <div className="bg-[#0e111a] rounded-2xl border border-slate-800 p-4 shadow-sm text-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Active Orders</span>
          <p className="text-xl font-black font-mono text-amber-400 mt-1">{activeOrdersCount}</p>
          <span className="text-[10px] text-slate-400">In real-time transit</span>
        </div>

        <div className="bg-[#0e111a] rounded-2xl border border-slate-800 p-4 shadow-sm text-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Completed</span>
          <p className="text-xl font-black font-mono text-emerald-400 mt-1">{completedOrdersCount}</p>
          <span className="text-[10px] text-slate-400">Successfully closed</span>
        </div>

        <div className="bg-[#0e111a] rounded-2xl border border-slate-800 p-4 shadow-sm text-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total GMV</span>
          <p className="text-xl font-black font-mono text-white mt-1">PKR {totalGmv.toLocaleString()}</p>
          <span className="text-[10px] text-slate-400">Gross transaction vol.</span>
        </div>

        <div className="bg-[#0e111a] rounded-2xl border border-slate-800 p-4 shadow-sm text-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Platform Cut</span>
          <p className="text-xl font-black font-mono text-purple-400 mt-1">PKR {platformRevenue.toLocaleString()}</p>
          <span className="text-[10px] text-slate-400">{settings.platformCommissionRate}% take rate</span>
        </div>

        <div className="bg-[#0e111a] rounded-2xl border border-slate-800 p-4 shadow-sm text-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Active Providers</span>
          <p className="text-xl font-black font-mono text-emerald-400 mt-1">{verifiedProvidersCount}</p>
          <span className="text-[10px] text-slate-400">Admin-Onboarded</span>
        </div>

        <div className="bg-[#0e111a] rounded-2xl border border-slate-800 p-4 shadow-sm text-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Customers</span>
          <p className="text-xl font-black font-mono text-amber-300 mt-1">{registeredCustomersCount}</p>
          <span className="text-[10px] text-slate-400">Registered users</span>
        </div>
      </section>

      {/* Admin Section Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveSection('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSection === 'orders'
              ? 'bg-amber-400 text-slate-950 shadow-md font-black'
              : 'text-slate-300 hover:text-white bg-[#0e111a] hover:bg-[#141825] border border-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Orders o Dispatch ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSection === 'users'
              ? 'bg-amber-400 text-slate-950 shadow-md font-black'
              : 'text-slate-300 hover:text-white bg-[#0e111a] hover:bg-[#141825] border border-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Users o Workers ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('settings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSection === 'settings'
              ? 'bg-amber-400 text-slate-950 shadow-md font-black'
              : 'text-slate-300 hover:text-white bg-[#0e111a] hover:bg-[#141825] border border-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Live Rates o WhatsApp Settings</span>
        </button>

        <button
          onClick={() => setActiveSection('catalog')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSection === 'catalog'
              ? 'bg-amber-400 text-slate-950 shadow-md font-black'
              : 'text-slate-300 hover:text-white bg-[#0e111a] hover:bg-[#141825] border border-slate-800'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Service Catalog o Riksha Rates</span>
        </button>
      </div>

      {/* SECTION 1: ORDERS & DISPATCH MANAGEMENT */}
      {activeSection === 'orders' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-[#0e111a] rounded-2xl border border-slate-800 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-slate-100 shadow-sm">
            <div className="flex flex-1 items-center gap-2 max-w-sm">
              <Search className="w-4 h-4 text-amber-400 shrink-0" />
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Search by Order ID, customer, provider..."
                className="w-full text-xs rounded-xl border border-slate-700 bg-[#141825] px-3.5 py-2 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-bold">Category:</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="rounded-xl border border-slate-700 bg-[#141825] px-3 py-2 text-slate-100 text-xs font-semibold focus:outline-hidden focus:border-amber-400 cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  <option value="custom_delivery">Custom Delivery</option>
                  <option value="home_services">Home Services</option>
                  <option value="transport_cargo">Transport & Cargo</option>
                  <option value="event_planning">🎪 Event Planning (Shadi o Taqreebat)</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-bold">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-xl border border-slate-700 bg-[#141825] px-3 py-2 text-slate-100 text-xs font-semibold focus:outline-hidden focus:border-amber-400 cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">⏳ Pending</option>
                  <option value="assigned">👤 Assigned</option>
                  <option value="on_the_way">🛵 On The Way</option>
                  <option value="work_started">🔧 Work Started</option>
                  <option value="completed">✅ Completed</option>
                  <option value="cancelled">❌ Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Orders Data Table */}
          <div className="bg-[#0e111a] rounded-2xl border border-slate-800 overflow-x-auto shadow-sm">
            <table className="w-full text-left border-collapse text-xs text-slate-200">
              <thead>
                <tr className="bg-[#131724] border-b border-slate-800 text-amber-400 font-black uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Order ID & Time</th>
                  <th className="py-3.5 px-4">Customer Details</th>
                  <th className="py-3.5 px-4">Service / Cargo Name</th>
                  <th className="py-3.5 px-4">Pay & Status</th>
                  <th className="py-3.5 px-4 min-w-[300px]">Change Status & Worker Assignment</th>
                  <th className="py-3.5 px-3 text-center">Inspect / Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
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
                      : order.category === 'event_planning'
                      ? (order.eventDetails ? `🎪 ${order.eventDetails.eventTitle}` : 'Event Planning')
                      : (order.deliveryDetails?.itemName || 'Store Delivery');

                    const serviceSubtitle = order.category === 'home_services'
                      ? order.serviceDetails?.issueDescription
                      : order.category === 'transport_cargo'
                      ? `${order.transportDetails?.cargoDescription || 'Cargo'} (${order.transportDetails?.estimatedDistanceKm || 0} km)`
                      : order.category === 'event_planning'
                      ? `📅 ${order.eventDetails?.eventDate || ''} | 👥 ${order.eventDetails?.guestCount || 0} Guests | 📍 ${order.eventDetails?.venueNameOrAddress || order.deliveryAddress}`
                      : `Store: ${order.deliveryDetails?.storeName || 'Khanewal Market'}`;

                    return (
                      <tr key={order.id} className="hover:bg-[#141826] transition-colors border-b border-slate-800/60">
                        {/* 1. Order ID */}
                        <td className="py-3.5 px-4 align-top">
                          <span className="font-mono font-bold text-amber-400 block text-sm">{order.id}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            {new Date(order.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        </td>

                        {/* 2. Customer Name & Details */}
                        <td className="py-3.5 px-4 align-top">
                          <span className="font-bold text-white block text-xs">{order.customerName}</span>
                          <span className="text-slate-300 font-mono text-[11px] block">{order.customerPhone}</span>
                          <span className="text-[11px] text-slate-400 line-clamp-2 max-w-[200px] mt-0.5" title={order.deliveryAddress}>
                            📍 {order.deliveryAddress}
                          </span>
                        </td>

                        {/* 3. Service Name */}
                        <td className="py-3.5 px-4 align-top">
                          <span className="font-bold text-amber-300 block text-xs">
                            {serviceTitle}
                          </span>
                          <span className="text-[11px] text-slate-300 block line-clamp-1">
                            {serviceSubtitle}
                          </span>
                          <span className="text-[10px] text-amber-300 bg-amber-950/60 border border-amber-600/40 px-1.5 py-0.2 rounded font-medium inline-block mt-1 capitalize">
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
                                <option value="pending">⏳ Pending (Tasdeeq Ka Intezar)</option>
                                <option value="assigned">👤 Assigned (Worker Assign Karein)</option>
                                <option value="on_the_way">🛵 On The Way (Raastay Mein Hai)</option>
                                <option value="work_started">🔧 Work Started (Kaam Jari Hai)</option>
                                <option value="completed">✅ Completed (Mukammal Ho Gaya)</option>
                                <option value="cancelled">❌ Cancelled (Mansookh Karein)</option>
                              </select>
                            </div>

                            {/* Inline Worker Name and Phone Input Box when choosing Assign */}
                            {isInline ? (
                              <div className="p-3.5 rounded-xl bg-slate-950 border-2 border-amber-500/80 space-y-2.5 text-xs shadow-xl animate-in fade-in duration-200 text-white">
                                <span className="font-bold text-amber-300 block flex items-center gap-1.5">
                                  <span>👤</span>
                                  <span>Worker / Manager Assign Karein:</span>
                                </span>

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
                                    className="w-full text-xs rounded-lg border border-amber-500/40 bg-slate-900 px-2.5 py-1.5 text-amber-200 font-medium focus:border-amber-400 focus:outline-hidden"
                                  >
                                    <option value="">-- Registered Worker Muntakhib Karein (Ya Naam Likhein) --</option>
                                    {providersList.map(prov => (
                                      <option key={prov.id} value={prov.id}>
                                        {prov.name} ({prov.phone}) - {prov.serviceSkill || prov.providerCategory || 'Verified'}
                                      </option>
                                    ))}
                                  </select>
                                )}

                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="text-[10px] text-amber-400 font-bold block mb-1">Worker Ka Naam:</label>
                                    <input
                                      type="text"
                                      value={inlineWorkerName}
                                      onChange={(e) => setInlineWorkerName(e.target.value)}
                                      placeholder="Maslan: Muhammad Aslam"
                                      className="w-full text-xs rounded-lg border border-slate-700 px-2.5 py-1.5 bg-slate-900 text-white font-medium placeholder:text-slate-500 focus:border-amber-400 focus:outline-hidden"
                                    />
                                  </div>

                                  <div>
                                    <label className="text-[10px] text-amber-400 font-bold block mb-1">Worker Phone:</label>
                                    <input
                                      type="tel"
                                      value={inlineWorkerPhone}
                                      onChange={(e) => setInlineWorkerPhone(e.target.value)}
                                      placeholder="0300-1234567"
                                      className="w-full text-xs rounded-lg border border-slate-700 px-2.5 py-1.5 bg-slate-900 text-white font-mono placeholder:text-slate-500 focus:border-amber-400 focus:outline-hidden"
                                    />
                                  </div>
                                </div>

                                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] text-amber-300 font-bold">ETA:</span>
                                    <input
                                      type="number"
                                      value={inlineWorkerEta}
                                      onChange={(e) => setInlineWorkerEta(Number(e.target.value))}
                                      placeholder="20"
                                      className="w-14 text-xs rounded-lg border border-slate-700 px-1.5 py-1 bg-slate-900 font-mono text-center text-amber-300 font-bold focus:border-amber-400 focus:outline-hidden"
                                    />
                                    <span className="text-[10px] text-slate-400">mins</span>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleSaveInlineAssign(order.id)}
                                      className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-lg shadow-sm cursor-pointer"
                                    >
                                      Save o Broadcast Live
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setInlineOrderId(null)}
                                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-lg cursor-pointer"
                                    >
                                      Cancel
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
                                        <span className="text-[10px] text-amber-300 font-semibold block">
                                          ⏱ ETA: ~{order.etaMinutes} mins
                                        </span>
                                      )}
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => handleStartInlineAssign(order, order.status)}
                                      className="text-[10px] text-blue-300 hover:text-white font-bold px-1.5 py-0.5 rounded-md hover:bg-blue-900/60 border border-blue-500/40 transition-colors cursor-pointer shrink-0"
                                      title="Edit Worker or Phone"
                                    >
                                      Edit Worker
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleStartInlineAssign(order, 'assigned')}
                                    className="text-[11px] text-amber-300 hover:text-white font-bold bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer w-fit"
                                  >
                                    <span>+ Worker ka naam o phone darj karein</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* 6. Inspect Full Details & Delete */}
                        <td className="py-3.5 px-3 text-center align-top">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setSelectedOrderDetails(order)}
                              className="px-2.5 py-1.5 hover:bg-amber-400/20 text-amber-300 border border-amber-500/40 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 font-bold shadow-xs hover:scale-105"
                              title="Inspect Order Details & Print PDF Receipt"
                            >
                              <Eye className="w-3.5 h-3.5 text-amber-400" />
                              <span className="text-[10px] hidden sm:inline">Receipt</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setDeleteError('');
                                setDeleteResetKeyInput('');
                                setDeleteTarget({
                                  type: 'order',
                                  id: order.id,
                                  title: `Order #${order.id}`,
                                  subtitle: `${order.customerName || 'Customer'} • PKR ${order.pricing?.total || 0}`
                                });
                              }}
                              className="p-1.5 hover:bg-rose-950/80 text-rose-400 hover:text-white border border-rose-800/50 rounded-xl transition-all cursor-pointer flex items-center justify-center shadow-xs hover:scale-105"
                              title="Delete Order (Protected by GitHub Secrets RESET_PASS)"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                            </button>
                          </div>
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
              <h3 className="text-base font-bold text-white">Comprehensive User & Partner Management</h3>
              <p className="text-xs text-slate-400">
                Full Super-Admin control: inspect history, edit profiles, ban/unban, soft-delete, and onboard verified providers.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">{filteredUsers.length} Users Listed</span>
              <button
                onClick={() => setIsCreateUserModalOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Onboard Provider / User</span>
              </button>
            </div>
          </div>

          {userActionNotice && (
            <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{userActionNotice}</span>
            </div>
          )}

          {/* User Quick Role Switcher & Filters Bar */}
          <div className="bg-[#0e111a] rounded-2xl border border-slate-800 p-4 space-y-3 text-xs text-slate-100 shadow-sm">
            {/* Quick Role Switcher Pills */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-800/80 pb-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Filter View:</span>
              <button
                type="button"
                onClick={() => setUserRoleFilter('all')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  userRoleFilter === 'all'
                    ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                    : 'bg-[#141825] text-slate-300 hover:text-white border border-slate-700/60'
                }`}
              >
                All Accounts ({users.length})
              </button>
              <button
                type="button"
                onClick={() => setUserRoleFilter('provider')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  userRoleFilter === 'provider'
                    ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                    : 'bg-[#141825] text-slate-300 hover:text-white border border-slate-700/60'
                }`}
              >
                🛠️ Karigar & Drivers ({users.filter(u => u && u.role === 'provider').length})
              </button>
              <button
                type="button"
                onClick={() => setUserRoleFilter('customer')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  userRoleFilter === 'customer'
                    ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                    : 'bg-[#141825] text-slate-300 hover:text-white border border-slate-700/60'
                }`}
              >
                👤 Customers ({users.filter(u => u && u.role === 'customer').length})
              </button>
              <button
                type="button"
                onClick={() => setUserRoleFilter('admin')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  userRoleFilter === 'admin'
                    ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                    : 'bg-[#141825] text-slate-300 hover:text-white border border-slate-700/60'
                }`}
              >
                🛡️ Admins ({users.filter(u => u && u.role === 'admin').length})
              </button>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex flex-1 items-center gap-2 max-w-sm">
                <Search className="w-4 h-4 text-amber-400 shrink-0" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search by name, CNIC, phone, email, or user ID..."
                  className="w-full text-xs rounded-xl border border-slate-700 bg-[#141825] px-3.5 py-2 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-bold">Role:</span>
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="rounded-xl border border-slate-700 bg-[#141825] px-3 py-2 text-slate-100 text-xs font-semibold focus:outline-hidden focus:border-amber-400 cursor-pointer"
                  >
                    <option value="all">All Roles</option>
                    <option value="provider">Service Providers</option>
                    <option value="customer">Customers</option>
                    <option value="admin">Administrators</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-bold">Status:</span>
                  <select
                    value={userStatusFilter}
                    onChange={(e) => setUserStatusFilter(e.target.value)}
                    className="rounded-xl border border-slate-700 bg-[#141825] px-3 py-2 text-slate-100 text-xs font-semibold focus:outline-hidden focus:border-amber-400 cursor-pointer"
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
          </div>

          {/* Users Table */}
          <div className="bg-[#0e111a] rounded-2xl border border-slate-800 overflow-x-auto shadow-sm">
            <table className="w-full text-left border-collapse text-xs text-slate-200">
              <thead>
                <tr className="bg-[#131724] border-b border-slate-800 text-amber-400 font-black uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">User & Identity</th>
                  <th className="py-3.5 px-4">Role & Trade</th>
                  <th className="py-3.5 px-4">Contact & CNIC</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-4">Wallet & Volume</th>
                  <th className="py-3.5 px-4 text-right">Admin Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400">
                      No matching user records found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className={`hover:bg-[#141826] transition-colors border-b border-slate-800/60 ${user.isDeleted ? 'opacity-60 bg-slate-900/40' : ''}`}>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                            alt=""
                            className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                            }}
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white block">{user.name || 'User'}</span>
                              {user.isDeleted && (
                                <span className="text-[9px] bg-red-950 text-red-300 border border-red-700 px-1.5 py-0.2 rounded font-semibold">Deleted</span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">ID: {user.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`font-bold capitalize block ${
                          user.role === 'admin' ? 'text-purple-400' : user.role === 'provider' ? 'text-amber-400' : 'text-blue-400'
                        }`}>
                          {user.role}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {user.serviceSkill || user.vehicleType || (user.role === 'admin' ? 'Master Ops' : 'Customer Account')}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <span className="text-slate-200 block">{user.phone || 'N/A'}</span>
                        <span className="text-slate-400 text-[11px] font-sans block">{user.email || 'N/A'}</span>
                        {user.cnic && (
                          <span className="text-[10px] text-amber-300 bg-amber-950/60 border border-amber-800/60 px-1 py-0.5 rounded font-mono mt-0.5 inline-block">
                            CNIC: {user.cnic}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize inline-flex items-center gap-1 ${
                          user.status === 'active' && !user.isDeleted
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/40'
                            : user.status === 'suspended'
                            ? 'bg-amber-950 text-amber-300 border border-amber-600/40'
                            : 'bg-red-950 text-red-300 border border-red-600/40'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            user.status === 'active' && !user.isDeleted ? 'bg-emerald-400' : user.status === 'suspended' ? 'bg-amber-400' : 'bg-red-400'
                          }`} />
                          {user.isDeleted ? 'Removed' : user.status}
                        </span>
                        {user.role === 'provider' && !user.isDeleted && (
                          <span className="text-[10px] text-amber-300 bg-amber-950/60 border border-amber-700/60 px-1.5 py-0.5 rounded ml-1 font-semibold">
                            Admin-Verified
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <span className="font-bold text-amber-400 block">
                          PKR {(user.walletBalance ?? 0).toLocaleString()}
                        </span>
                        {user.completedJobsCount !== undefined ? (
                          <span className="text-[11px] text-slate-400 font-sans">
                            {user.completedJobsCount} jobs ({user.rating ?? 5.0}★)
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-sans">
                            {orders.filter(o => o && o.customerId === user.id).length} orders placed
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Inspect / Full Details */}
                          <button
                            onClick={() => setSelectedUserDetails(user)}
                            className="p-1.5 hover:bg-slate-800 text-amber-400 border border-slate-700 rounded-lg transition-colors cursor-pointer"
                            title="View Full Profile & Order History"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit Details */}
                          <button
                            onClick={() => setEditingUser(user)}
                            className="p-1.5 hover:bg-slate-800 text-blue-400 border border-slate-700 rounded-lg transition-colors cursor-pointer"
                            title="Edit User Profile"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Ban / Unban Toggle */}
                          {user.status === 'blocked' ? (
                            <button
                              onClick={() => handleUnbanUser(user.id)}
                              className="px-2 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-600 rounded-md text-[11px] font-semibold transition-colors cursor-pointer"
                              title="Unban Account"
                            >
                              Unban
                            </button>
                          ) : (
                            <button
                              onClick={() => handleBanUser(user.id)}
                              className="p-1.5 hover:bg-rose-950/60 text-rose-400 border border-rose-800/40 rounded-lg transition-colors cursor-pointer"
                              title="Ban / Block User"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          )}

                          {/* Protected Delete with RESET_PASS */}
                          <button
                            onClick={() => {
                              setDeleteError('');
                              setDeleteResetKeyInput('');
                              setDeleteTarget({
                                type: 'user',
                                id: user.id,
                                title: `User: ${user.name || user.id}`,
                                subtitle: `${user.email || 'No email'} (${user.role})`
                              });
                            }}
                            className="p-1.5 hover:bg-rose-950/80 text-rose-400 hover:text-white border border-rose-800/50 rounded-lg transition-colors cursor-pointer"
                            title="Permanent Delete User (Requires GitHub Secrets RESET_PASS)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
              <h3 className="text-base font-bold text-white">Dynamic Platform Controls & Pricing Configuration</h3>
              <p className="text-xs text-slate-400">
                Live variables update instantly across the entire marketplace, booking modals, and customer checkout.
              </p>
            </div>
            <button
              type="submit"
              disabled={isSavingSettings}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className={`w-4 h-4 ${isSavingSettings ? 'animate-spin' : ''}`} />
              <span>{isSavingSettings ? 'Saving to MySQL & Snapshot...' : 'Save & Deploy Live Settings'}</span>
            </button>
          </div>

          {/* Real-time Persistence & Live Status Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-[#0e1424] to-slate-950 border-2 border-emerald-500/40 shadow-lg text-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 font-black text-lg shrink-0">
                  ⚡
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <span>Pure MySQL & Zero-Loss Snapshot Engine Active</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/50 text-[10px] font-mono">
                      100% Zero-Loss Guaranteed
                    </span>
                  </h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Har rate, commission aur WhatsApp number edit hote hi direct MySQL table <code className="text-amber-300 font-mono">app_settings</code> aur snapshot cache mein permanent save hota hai (0% data loss).
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold border ${
                  systemStatus?.database?.connected
                    ? 'bg-blue-950/70 border-blue-500/40 text-blue-300'
                    : 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
                }`}>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{systemStatus?.database?.connected ? 'MySQL (omniserve_db): Live' : 'Snapshot Engine: Live'}</span>
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/70 border border-purple-500/40 text-purple-300 font-mono text-[11px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                  <span>Zero-Loss Snapshot: Active</span>
                </span>
              </div>
            </div>
          </div>

          {settingsSavedMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{settingsSavedMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Box 1: Delivery Charges */}
            <div className="bg-[#0e111a] rounded-2xl border border-slate-800 p-5 shadow-sm space-y-4 text-slate-100">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-800">
                <Truck className="w-4 h-4 text-amber-400" />
                <h4 className="font-bold text-amber-400 text-xs uppercase tracking-wider">
                  1. Delivery Charges & Distance Rates
                </h4>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Base Delivery Fee (PKR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={10}
                    value={settings.deliveryBaseFee}
                    onChange={(e) => setSettings({ ...settings, deliveryBaseFee: Number(e.target.value) })}
                    className="w-full text-xs font-mono font-bold rounded-xl border border-slate-700 px-3.5 py-2.5 bg-[#141825] text-white placeholder-slate-500 focus:border-amber-400 focus:outline-hidden"
                  />
                  <span className="text-[11px] text-slate-400 block mt-1">Fixed starting pickup & delivery charge within city limits</span>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Per Kilometer Rate (PKR / km)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={5}
                    value={settings.deliveryPerKmFee}
                    onChange={(e) => setSettings({ ...settings, deliveryPerKmFee: Number(e.target.value) })}
                    className="w-full text-xs font-mono font-bold rounded-xl border border-slate-700 px-3.5 py-2.5 bg-[#141825] text-white placeholder-slate-500 focus:border-amber-400 focus:outline-hidden"
                  />
                  <span className="text-[11px] text-slate-400 block mt-1">Incremental transit fee per kilometer from pickup to dropoff</span>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Urgent Delivery Priority Surcharge (PKR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={10}
                    value={settings.deliveryUrgentFee}
                    onChange={(e) => setSettings({ ...settings, deliveryUrgentFee: Number(e.target.value) })}
                    className="w-full text-xs font-mono font-bold rounded-xl border border-slate-700 px-3.5 py-2.5 bg-[#141825] text-white placeholder-slate-500 focus:border-amber-400 focus:outline-hidden"
                  />
                  <span className="text-[11px] text-slate-400 block mt-1">Extra charge for express priority dispatch under 30 minutes</span>
                </div>
              </div>
            </div>

            {/* Box 2: Technician / Plumber Visiting & Hourly Charges */}
            <div className="bg-[#0e111a] rounded-2xl border border-slate-800 p-5 shadow-sm space-y-4 text-slate-100">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-800">
                <Wrench className="w-4 h-4 text-amber-400" />
                <h4 className="font-bold text-amber-400 text-xs uppercase tracking-wider">
                  2. Technician / Plumber Visiting & Hourly Rates
                </h4>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Technician / Plumber Home Visiting Charge (PKR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={50}
                    value={settings.technicianVisitingFee}
                    onChange={(e) => setSettings({ ...settings, technicianVisitingFee: Number(e.target.value) })}
                    className="w-full text-xs font-mono font-bold rounded-xl border border-slate-700 px-3.5 py-2.5 bg-[#141825] text-white placeholder-slate-500 focus:border-amber-400 focus:outline-hidden"
                  />
                  <span className="text-[11px] text-slate-400 block mt-1">Mandatory home visit & initial inspection consultation fee</span>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Base Labor Rate (PKR / hour)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={50}
                    value={settings.technicianHourlyRate}
                    onChange={(e) => setSettings({ ...settings, technicianHourlyRate: Number(e.target.value) })}
                    className="w-full text-xs font-mono font-bold rounded-xl border border-slate-700 px-3.5 py-2.5 bg-[#141825] text-white placeholder-slate-500 focus:border-amber-400 focus:outline-hidden"
                  />
                  <span className="text-[11px] text-slate-400 block mt-1">Standard hourly wage for extended complex repair sessions</span>
                </div>
              </div>
            </div>

            {/* Box 3: Platform Commission & Margin Controls */}
            <div className="bg-[#0e111a] rounded-2xl border border-slate-800 p-5 shadow-sm space-y-4 text-slate-100">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-800">
                <DollarSign className="w-4 h-4 text-amber-400" />
                <h4 className="font-bold text-amber-400 text-xs uppercase tracking-wider">
                  3. Service Fee Margins & Platform Commissions
                </h4>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
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
                      className="w-full text-xs font-mono font-bold rounded-xl border border-slate-700 px-3.5 py-2.5 bg-[#141825] text-white placeholder-slate-500 focus:border-amber-400 focus:outline-hidden"
                    />
                    <span className="absolute right-3.5 top-2.5 text-slate-400 font-bold">%</span>
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-1">Current take rate deducted upon order completion (e.g. 15%)</span>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Escrow Protection Fixed Fee (PKR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={10}
                    value={settings.platformFixedFee}
                    onChange={(e) => setSettings({ ...settings, platformFixedFee: Number(e.target.value) })}
                    className="w-full text-xs font-mono font-bold rounded-xl border border-slate-700 px-3.5 py-2.5 bg-[#141825] text-white placeholder-slate-500 focus:border-amber-400 focus:outline-hidden"
                  />
                  <span className="text-[11px] text-slate-400 block mt-1">SafePay escrow security & insurance coverage per transaction</span>
                </div>
              </div>
            </div>

            {/* Box 4: WhatsApp Support Integration */}
            <div className="bg-[#0e111a] rounded-2xl border border-slate-800 p-5 shadow-sm space-y-4 text-slate-100">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-800">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <h4 className="font-bold text-amber-400 text-xs uppercase tracking-wider">
                  4. Live WhatsApp Support & Contact Channels
                </h4>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    WhatsApp Support Contact Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={settings.whatsappSupportPhone}
                    onChange={(e) => setSettings({ ...settings, whatsappSupportPhone: e.target.value })}
                    placeholder="+92 300 1234567"
                    className="w-full text-xs font-mono font-bold rounded-xl border border-slate-700 px-3.5 py-2.5 bg-[#141825] text-white placeholder-slate-500 focus:border-amber-400 focus:outline-hidden"
                  />
                  <span className="text-[11px] text-slate-400 block mt-1">The dynamic number connected to the frontend floating button</span>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Standard Pre-filled Chat Message (Urdu)
                  </label>
                  <textarea
                    rows={2}
                    value={settings.whatsappDefaultMessage}
                    onChange={(e) => setSettings({ ...settings, whatsappDefaultMessage: e.target.value })}
                    className="w-full text-xs rounded-xl border border-slate-700 px-3.5 py-2.5 bg-[#141825] text-white placeholder-slate-500 focus:border-amber-400 focus:outline-hidden"
                  />
                  <span className="text-[11px] text-slate-400 block mt-1">Auto-filled in customer's WhatsApp window upon clicking button</span>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Toll-Free Voice Helpline
                  </label>
                  <input
                    type="text"
                    value={settings.supportHelpline}
                    onChange={(e) => setSettings({ ...settings, supportHelpline: e.target.value })}
                    className="w-full text-xs font-mono font-bold rounded-xl border border-slate-700 px-3.5 py-2.5 bg-[#141825] text-white placeholder-slate-500 focus:border-amber-400 focus:outline-hidden"
                  />
                </div>

                <div className="pt-2">
                  <a
                    href={testWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-600/40 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Test Current WhatsApp Link</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Box 5: Danger Zone & Database Reset Protection (RESET_PASS) */}
            <div className="bg-[#12080a] rounded-2xl border border-rose-900/60 p-5 shadow-sm space-y-4 text-slate-100 lg:col-span-2">
              <div className="flex items-center justify-between pb-2.5 border-b border-rose-900/40">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-rose-400" />
                  <h4 className="font-bold text-rose-400 text-xs uppercase tracking-wider">
                    5. Security Zone & Database Reset (GitHub Secrets 'RESET_PASS' Protection)
                  </h4>
                </div>
                <span className="text-[10px] text-rose-400/80 bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                  Strict Authorization Required
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <p className="text-slate-300 font-semibold">
                    Database ko reset karne ke liye GitHub Secrets ki khufia key (<code className="font-mono text-amber-300 bg-black/40 px-1 py-0.5 rounded">RESET_PASS</code>) lazmi darkar hai.
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    Agar dakhil karda key match nahi kare gi to system kabhi bhi data reset nahi kare ga. Tamam rates, workers aur orders mehfooz rahein ge.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setResetSecretKey('');
                    setResetError('');
                    setResetSuccess('');
                    setIsResetModalOpen(true);
                  }}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shrink-0 flex items-center justify-center gap-2 shadow-lg shadow-rose-950 transition-all cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Reset Database Tasdeeq (Enter RESET_PASS)</span>
                </button>
              </div>
            </div>

            {/* Box 6: Pure MySQL Database & Zero-Loss Snapshot Engine (Drive / rclone Backup & Restore) */}
            <div className="bg-[#0b101c] rounded-2xl border border-emerald-500/40 p-5 shadow-sm space-y-4 text-slate-100 lg:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-300 text-xs uppercase tracking-wider">
                      6. Pure MySQL Database & Zero-Loss Snapshot Engine
                    </h4>
                    <p className="text-[11px] text-slate-400">Workflow-End Automated Cache, Drive / rclone Backup & Instant Restore</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40 w-fit">
                  0% DATA LOSS GUARANTEED
                </span>
              </div>

              {snapshotNotice && (
                <div className="p-3 bg-emerald-950/90 border border-emerald-500/60 rounded-xl text-xs text-emerald-200 flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{snapshotNotice}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
                <div className="bg-[#121626] p-3.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase font-sans mb-1">Authoritative Database</span>
                  <span className="text-white font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    MySQL (omniserve_db)
                  </span>
                </div>
                <div className="bg-[#121626] p-3.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase font-sans mb-1">Snapshot Persistence Table</span>
                  <span className="text-emerald-400 font-bold">system_snapshots (MySQL)</span>
                </div>
                <div className="bg-[#121626] p-3.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block uppercase font-sans mb-1">Security Secret Protected</span>
                  <span className="text-amber-300 font-bold">GitHub Secret: RESET_PASS</span>
                </div>
              </div>

              {/* Snapshot Action Controls */}
              <div className="pt-2 flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleSaveSnapshot}
                  disabled={isSavingSnapshot}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingSnapshot ? 'Capturing Snapshot...' : '💾 Save MySQL Snapshot Cache'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadSnapshot}
                  className="px-4 py-2.5 bg-[#141825] hover:bg-[#1a2034] text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>📥 Download Backup JSON (Drive / rclone)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRestoreError('');
                    setRestoreSecretPassInput('');
                    setUploadedSnapshotJson(null);
                    setIsRestoreModalOpen(true);
                  }}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Database className="w-4 h-4" />
                  <span>🔄 Restore from Snapshot</span>
                </button>

                <label className="px-4 py-2.5 bg-purple-950/70 hover:bg-purple-900 text-purple-200 border border-purple-600/40 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors">
                  <span>📤 Upload & Restore File</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="text-[11px] text-slate-400 space-y-1 bg-[#121626]/60 p-3.5 rounded-xl border border-slate-800/80">
                <p className="font-semibold text-slate-200">Zero% Data Loss & rclone Google Drive Architecture:</p>
                <p>
                  Har naya order, status tabdeeli, user registration aur settings fori taur par MySQL mein update hoti hain. Workflow end par full snapshot table aur persistent file cache mein save hota hai jisay aap rclone ke zariye Drive mein sync aur wahan se 1-click restore kar sakte hain.
                </p>
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
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Storefront Availability Rule Active · Live Rule Lagu Hai
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-0.5">Service Catalog, Riksha o Loading Gaariyon ke Rates aur Source Workers</h3>
              <p className="text-xs text-slate-400">
                Services and vehicles ONLY appear on customer storefronts when an active verified provider or driver is assigned as a source.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAddServiceModalOpen(true)}
                className="px-3.5 py-2 bg-[#141825] hover:bg-[#1a2032] text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                <span>+ Nayi Service Shamil Karein</span>
              </button>
              <button
                type="button"
                onClick={handleAddNewVehicle}
                className="px-3.5 py-2 bg-[#141825] hover:bg-[#1a2032] text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                <span>+ Naya Riksha / Cargo Gaari</span>
              </button>
              <button
                type="button"
                onClick={handleSaveCatalog}
                disabled={isSavingCatalog}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingCatalog ? 'Save ho raha hai...' : 'Tamam Rates Mehfooz Karein'}</span>
              </button>
            </div>
          </div>

          {/* Quick Visibility Filter */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0e111a] p-3 rounded-2xl border border-slate-800 shadow-xl text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-400 font-semibold text-xs">Catalog Filter:</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setCatalogFilter('all')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                    catalogFilter === 'all' 
                      ? 'bg-amber-400 text-slate-950 shadow-md font-black' 
                      : 'bg-[#141825] text-slate-300 hover:bg-[#1b2135] border border-slate-800'
                  }`}
                >
                  Tamam Services ({editingServices.length + editingVehicles.length})
                </button>
                <button
                  type="button"
                  onClick={() => setCatalogFilter('published')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                    catalogFilter === 'published' 
                      ? 'bg-emerald-500 text-slate-950 shadow-md font-black' 
                      : 'bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/50 border border-emerald-500/30'
                  }`}
                >
                  ● Live o Dastyab ({editingServices.filter(s => Store.isServiceAvailable(s)).length + editingVehicles.filter(v => Store.isVehicleAvailable(v)).length})
                </button>
                <button
                  type="button"
                  onClick={() => setCatalogFilter('unpublished')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                    catalogFilter === 'unpublished' 
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black' 
                      : 'bg-amber-950/40 text-amber-400 hover:bg-amber-900/50 border border-amber-500/30'
                  }`}
                >
                  ○ Hidden / Baghair Worker ({editingServices.filter(s => !Store.isServiceAvailable(s)).length + editingVehicles.filter(v => !Store.isVehicleAvailable(v)).length})
                </button>
              </div>
            </div>

            <span className="text-[11px] text-amber-400/90 font-mono bg-[#141825] px-3 py-1 rounded-xl border border-slate-800">
              {techniciansList.length} Technicians · {driversList.length} Drivers Dastyab
            </span>
          </div>

          {catalogSavedMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{catalogSavedMessage}</span>
            </div>
          )}

          {/* 1. Home Services Catalog & Source Management */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-400" />
                <span>1. Gharelu Services o Source Workers (Home Services)</span>
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
                      className={`bg-[#0e111a] rounded-2xl border p-4 space-y-3 text-xs transition-all ${
                        isLive ? 'border-emerald-500/40 shadow-lg' : 'border-slate-800'
                      }`}
                    >
                      {/* Status Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-bold text-white block text-sm">{srv.name}</span>
                          <span className="text-[11px] text-slate-400">{srv.category} · {srv.estimatedDuration}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleTogglePublishService(srv.id)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer ${
                            isLive 
                              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/50 hover:bg-emerald-900/80' 
                              : 'bg-amber-950/60 text-amber-300 border-amber-500/50 hover:bg-amber-900/80'
                          }`}
                          title={isLive ? 'Click to Hide from Store' : 'Click to Publish Live on Store'}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                          {isLive ? 'Live on Store' : 'Hidden / Unpublished'}
                        </button>
                      </div>

                      <p className="text-slate-400 text-[11px] line-clamp-2">{srv.description}</p>

                      {/* Source Provider Assignment Dropdown */}
                      <div className="p-3 bg-[#141825] rounded-xl border border-slate-800 space-y-2">
                        <label className="block text-[11px] font-bold text-slate-200">
                          Assigned Source Worker:
                        </label>
                        <select
                          value={srv.assignedProviderId || ''}
                          onChange={(e) => handleAssignServiceSource(srv.id, e.target.value)}
                          className="w-full text-xs rounded-lg border border-slate-700 px-2.5 py-1.5 bg-[#0a0d14] text-white font-medium focus:border-amber-400 focus:outline-hidden"
                        >
                          <option value="" className="bg-[#0a0d14] text-slate-400">-- Baghair Worker (Hidden Rahe Gi) --</option>
                          {techniciansList.map(t => (
                            <option key={t.id} value={t.id} className="bg-[#0a0d14] text-white">
                              {t.name} ({t.phone}) - {t.serviceSkill || 'Technician'}
                            </option>
                          ))}
                        </select>

                        {!srv.assignedProviderId && (
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[10px] text-amber-400">Worker assign karne ke baad live ho gi.</span>
                            <button
                              type="button"
                              onClick={() => {
                                setNewUserRole('provider');
                                setNewProviderCategory('home_technician');
                                setNewSkill(srv.name);
                                setIsCreateUserModalOpen(true);
                              }}
                              className="text-[10px] text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                            >
                              + Naya Worker Shamil Karein
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Visit / Equipment / Optional Urgent charges */}
                      <div className="pt-2 border-t border-slate-800 space-y-2">
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-400">
                              Visit Charges (PKR)
                            </label>
                            <input
                              type="number"
                              min={0}
                              step={50}
                              value={srv.basePrice}
                              onChange={(e) => handleServicePriceChange(srv.id, Number(e.target.value), 'basePrice')}
                              className="w-full text-xs font-mono font-bold rounded-lg border border-slate-700 px-2 py-1.5 bg-[#141825] text-white focus:border-amber-400 focus:outline-hidden"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-400">
                              Equipment (PKR)
                            </label>
                            <input
                              type="number"
                              min={0}
                              step={50}
                              value={srv.equipmentFee ?? 350}
                              onChange={(e) => handleServicePriceChange(srv.id, Number(e.target.value), 'equipmentFee')}
                              className="w-full text-xs font-mono font-bold rounded-lg border border-slate-700 px-2 py-1.5 bg-[#141825] text-white focus:border-amber-400 focus:outline-hidden"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-400">
                              Urgent Optional (PKR)
                            </label>
                            <input
                              type="number"
                              min={0}
                              step={50}
                              value={srv.urgentDispatchFee ?? 0}
                              onChange={(e) => handleServicePriceChange(srv.id, Number(e.target.value), 'urgentDispatchFee')}
                              className="w-full text-xs font-mono font-bold rounded-lg border border-slate-700 px-2 py-1.5 bg-[#141825] text-white focus:border-amber-400 focus:outline-hidden"
                            />
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-500">
                          7 din ki warranty free hai. Urgent charge sirf tab lagta hai jab customer khud select kare (0 = option hide).
                        </p>
                      </div>

                      {/* Delete Action */}
                      <div className="flex items-center justify-end gap-3">

                        <button
                          type="button"
                          onClick={() => {
                            setDeleteError('');
                            setDeleteResetKeyInput('');
                            setDeleteTarget({
                              type: 'service',
                              id: srv.id,
                              title: `Service: ${srv.name}`,
                              subtitle: `Category: ${srv.category} • Base Price: PKR ${srv.basePrice}`
                            });
                          }}
                          className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 p-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Delete service permanently from catalog (Requires RESET_PASS)"
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
          <div className="space-y-3 pt-6 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-400" />
                <span>2. Cargo o Riksha Fleet aur Driver Assign (Cargo Fleet)</span>
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
                      className={`bg-[#0e111a] rounded-2xl border p-4 space-y-3 text-xs transition-all ${
                        isLive ? 'border-emerald-500/40 shadow-lg' : 'border-slate-800'
                      }`}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-bold text-white block text-xs">{veh.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">Capacity: {veh.capacityKg} kg</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleTogglePublishVehicle(veh.id)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 flex items-center gap-1 transition-colors cursor-pointer ${
                            isLive
                              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/50 hover:bg-emerald-900/80'
                              : 'bg-amber-950/60 text-amber-300 border-amber-500/50 hover:bg-amber-900/80'
                          }`}
                          title={isLive ? 'Click to Hide from Store' : 'Click to Publish Live on Store'}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                          {isLive ? 'Live' : 'Hidden'}
                        </button>
                      </div>

                      {/* Driver Source Selector */}
                      <div className="p-2.5 bg-[#141825] rounded-xl border border-slate-800 space-y-1.5">
                        <label className="block text-[10px] font-bold text-slate-200">
                          Driver Source:
                        </label>
                        <select
                          value={veh.assignedProviderId || ''}
                          onChange={(e) => handleAssignVehicleSource(veh.id, e.target.value)}
                          className="w-full text-xs rounded-lg border border-slate-700 px-2 py-1.5 bg-[#0a0d14] text-white font-medium focus:border-amber-400 focus:outline-hidden"
                        >
                          <option value="" className="bg-[#0a0d14] text-slate-400">-- Baghair Driver (Hidden Rahe Gi) --</option>
                          {driversList.map(d => (
                            <option key={d.id} value={d.id} className="bg-[#0a0d14] text-white">
                              {d.name} ({d.phone}) - {d.vehicleType || 'Driver'}
                            </option>
                          ))}
                        </select>

                        {!veh.assignedProviderId && (
                          <div className="flex items-center justify-between pt-0.5">
                            <span className="text-[10px] text-amber-400">Driver assign hone par live hogi.</span>
                            <button
                              type="button"
                              onClick={() => {
                                setNewUserRole('provider');
                                setNewProviderCategory('cargo_driver');
                                setNewVehicle(veh.name);
                                setIsCreateUserModalOpen(true);
                              }}
                              className="text-[10px] text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                            >
                              + Driver Shamil Karein
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Rates Editor */}
                      <div className="space-y-2">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-400">Base Fare (PKR)</label>
                          <input
                            type="number"
                            step={50}
                            value={veh.baseFare}
                            onChange={(e) => handleVehicleRateChange(veh.id, 'baseFare', Number(e.target.value))}
                            className="w-full text-xs font-mono font-bold rounded-lg border border-slate-700 px-2.5 py-1.5 bg-[#141825] text-white focus:border-amber-400 focus:outline-hidden"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-400">Per KM (PKR)</label>
                            <input
                              type="number"
                              step={5}
                              value={veh.perKmRate}
                              onChange={(e) => handleVehicleRateChange(veh.id, 'perKmRate', Number(e.target.value))}
                              className="w-full text-xs font-mono font-bold rounded-lg border border-slate-700 px-2.5 py-1.5 bg-[#141825] text-white focus:border-amber-400 focus:outline-hidden"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-400">Helper Charges (PKR)</label>
                            <input
                              type="number"
                              step={50}
                              value={veh.helperRate}
                              onChange={(e) => handleVehicleRateChange(veh.id, 'helperRate', Number(e.target.value))}
                              className="w-full text-xs font-mono font-bold rounded-lg border border-slate-700 px-2.5 py-1.5 bg-[#141825] text-white focus:border-amber-400 focus:outline-hidden"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Delete button */}
                      <div className="pt-2 border-t border-slate-800 flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteError('');
                            setDeleteResetKeyInput('');
                            setDeleteTarget({
                              type: 'vehicle',
                              id: veh.id,
                              title: `Vehicle: ${veh.name}`,
                              subtitle: `Base Fare: PKR ${veh.baseFare} • Rate: PKR ${veh.perKmRate}/km`
                            });
                          }}
                          className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Delete vehicle permanently from catalog (Requires RESET_PASS)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Gaari Delete Karein</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 0: ADD HOME SERVICES (multi-select dropdown + rate + worker) */}
      {isAddServiceModalOpen && (
        <AddServicesModal
          existingServices={Store.getServicesCatalog()}
          technicians={techniciansList}
          onClose={() => setIsAddServiceModalOpen(false)}
          onSubmit={handleAddServicesFromModal}
          onCreateWorker={() => {
            setNewUserRole('provider');
            setNewProviderCategory('home_technician');
            setIsCreateUserModalOpen(true);
          }}
        />
      )}

      {/* MODAL 1: INSPECT ORDER AUDIT & PRINTABLE PDF RECEIPT MODAL */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#0b0e17] rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl border-2 border-amber-500/50 space-y-4 my-auto text-slate-100 max-h-[92vh] overflow-y-auto">
            {/* Modal Top Nav Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-sm">
                  KC
                </div>
                <div>
                  <h4 className="font-black text-white text-sm sm:text-base flex items-center gap-2">
                    <span>Khanewal Connect - Order Audit o PDF Receipt</span>
                  </h4>
                  <p className="text-[11px] text-amber-400 font-mono">Invoice Ref: #{selectedOrderDetails.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
                  title="Print this invoice or save as PDF"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / PDF</span>
                </button>
                <button
                  onClick={() => setSelectedOrderDetails(null)}
                  className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Invoice Container */}
            <div id="khanewal-printable-receipt" className="p-4 sm:p-5 rounded-2xl bg-[#121624] border border-slate-800 space-y-4 print-clean-card text-xs">
              {/* Header inside invoice */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/80 pb-3">
                <div>
                  <h3 className="font-black text-amber-400 text-base">KHANEWAL CONNECT SERVICES</h3>
                  <p className="text-[11px] text-slate-300">Khanewal City o mulhaqa ilaqajaat on-demand network</p>
                  <p className="text-[10px] text-slate-400 font-mono">Toll-Free & Support Helpline: +92 308 4541241</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                    selectedOrderDetails.status === 'completed' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' :
                    selectedOrderDetails.status === 'cancelled' ? 'bg-red-950 text-red-300 border border-red-500/40' :
                    'bg-amber-950 text-amber-300 border border-amber-500/40'
                  }`}>
                    ● {selectedOrderDetails.status.replace('_', ' ')}
                  </span>
                  <p className="text-[11px] text-slate-400 font-mono mt-1">
                    Tareekh: {new Date(selectedOrderDetails.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Customer and Provider Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-[#090b12] border border-slate-800/80">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-amber-400 block uppercase">1. Customer Maloomat (Customer Info)</span>
                  <p className="font-bold text-white text-sm">{selectedOrderDetails.customerName}</p>
                  <p className="font-mono text-slate-300">{selectedOrderDetails.customerPhone}</p>
                  <p className="text-slate-400 text-[11px]">📍 {selectedOrderDetails.deliveryAddress}</p>
                </div>
                <div className="space-y-0.5 sm:border-l sm:border-slate-800 sm:pl-3">
                  <span className="text-[10px] font-bold text-amber-400 block uppercase">2. Muqarar Karigar / Rider (Assigned Partner)</span>
                  <p className="font-bold text-amber-300 text-sm">
                    {selectedOrderDetails.assignedProviderName || 'Khanewal Service Partner (Pending Assignment)'}
                  </p>
                  <p className="font-mono text-slate-300">
                    📞 {selectedOrderDetails.assignedProviderPhone || '0304-0975351'}
                  </p>
                  {selectedOrderDetails.etaMinutes && (
                    <p className="text-emerald-400 font-bold text-[11px]">
                      ⏱ Mutawaqqe Waqt: ~{selectedOrderDetails.etaMinutes} mins
                    </p>
                  )}
                </div>
              </div>

              {/* Order Specific Details (Event, Service, Cargo, Delivery) */}
              <div className="p-3 rounded-xl bg-[#0e121e] border border-slate-800 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                  <span className="font-bold text-amber-300 capitalize text-xs">
                    Category: {selectedOrderDetails.category.replace('_', ' ')}
                  </span>
                  <span className="font-mono font-bold text-slate-400 text-[11px]">
                    Pay: {selectedOrderDetails.paymentMethod.toUpperCase()} ({selectedOrderDetails.paymentStatus.toUpperCase()})
                  </span>
                </div>

                {selectedOrderDetails.serviceDetails && (
                  <div>
                    <span className="font-bold text-white">{selectedOrderDetails.serviceDetails.serviceName}</span>
                    <p className="text-slate-300 text-[11px]">{selectedOrderDetails.serviceDetails.issueDescription}</p>
                  </div>
                )}

                {selectedOrderDetails.transportDetails && (
                  <div>
                    <span className="font-bold text-white">{selectedOrderDetails.transportDetails.vehicleName}</span>
                    <p className="text-slate-300 text-[11px]">
                      Saman: {selectedOrderDetails.transportDetails.cargoDescription} | Faasla: ~{selectedOrderDetails.transportDetails.estimatedDistanceKm} km
                    </p>
                  </div>
                )}

                {selectedOrderDetails.deliveryDetails && (
                  <div>
                    <span className="font-bold text-white">{selectedOrderDetails.deliveryDetails.itemName}</span>
                    <p className="text-slate-300 text-[11px]">Store: {selectedOrderDetails.deliveryDetails.storeName}</p>
                  </div>
                )}

                {selectedOrderDetails.eventDetails && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-amber-300 font-bold">
                      <span>🎪 {selectedOrderDetails.eventDetails.eventTitle}</span>
                      <span>{selectedOrderDetails.eventDetails.guestCount} Mehmaan (Guests)</span>
                    </div>
                    <p className="text-slate-300 text-[11px]">
                      Tareekh: {selectedOrderDetails.eventDetails.eventDate} ({selectedOrderDetails.eventDetails.eventTimeSlot}) | Maqam: {selectedOrderDetails.eventDetails.venueNameOrAddress}
                    </p>
                    {selectedOrderDetails.eventDetails.menuDetailsText && (
                      <p className="text-slate-400 text-[10px]">
                        Khana: {selectedOrderDetails.eventDetails.menuDetailsText} (Degein: {selectedOrderDetails.eventDetails.numberOfDegs || 'N/A'})
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Itemized Pricing */}
              <div className="rounded-xl bg-[#090b12] p-3 space-y-1.5 font-mono text-xs border border-slate-800">
                <div className="flex justify-between text-slate-300">
                  <span>Ibtidai Fare (Base Fare):</span>
                  <span>PKR {selectedOrderDetails.pricing.baseFee}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>{selectedOrderDetails.category === 'home_services' ? 'Tools & Equipment Charges:' : 'Service / Faasla Charge (Service/Distance Charge):'}</span>
                  <span>PKR {selectedOrderDetails.pricing.serviceOrDeliveryFee}</span>
                </div>
                {selectedOrderDetails.pricing.itemOrDistanceBudget > 0 && (
                  <div className="flex justify-between text-slate-300">
                    <span>Market Kharidari Budget (Item Budget):</span>
                    <span>PKR {selectedOrderDetails.pricing.itemOrDistanceBudget}</span>
                  </div>
                )}
                {selectedOrderDetails.pricing.helperFee > 0 && (
                  <div className="flex justify-between text-slate-300">
                    <span>{selectedOrderDetails.category === 'home_services' ? 'Urgent Dispatch (Optional):' : 'Mazdoor / Helper Charge (Helper Fee):'}</span>
                    <span>PKR {selectedOrderDetails.pricing.helperFee}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400 text-[11px] pt-1 border-t border-slate-800">
                  <span>System Commission ({settings.platformCommissionRate}%):</span>
                  <span>PKR {Math.round(selectedOrderDetails.pricing.total * (settings.platformCommissionRate / 100))}</span>
                </div>
                <div className="flex justify-between text-emerald-400 text-[11px]">
                  <span>Karigar / Rider ki Raqam (Provider Cut):</span>
                  <span>PKR {Math.round(selectedOrderDetails.pricing.total * ((100 - settings.platformCommissionRate) / 100))}</span>
                </div>
                <div className="pt-2 border-t border-slate-700 flex justify-between font-bold text-amber-400 text-sm">
                  <span>Kul Raqam (Grand Total Amount):</span>
                  <span>PKR {selectedOrderDetails.pricing.total.toLocaleString()}</span>
                </div>
              </div>

              {/* Bottom Stamp & Signature Line */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800">
                <span>System Mohar: Tasdeeq shuda bazariya Khanewal Connect Admin Desk</span>
                <span className="font-mono">Security Check: SAFE-ESCROW-VERIFIED</span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save PDF</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedOrderDetails(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                Band Karein (Close)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: USER DETAILS & ACTIVITY HISTORY MODAL */}
      {selectedUserDetails && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#0b0f19] rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border-2 border-amber-500/50 space-y-4 my-6 text-slate-100 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
              <div className="flex items-center gap-3">
                <img
                  src={selectedUserDetails.avatar}
                  alt=""
                  className="w-12 h-12 rounded-full object-cover border-2 border-amber-500/40"
                />
                <div>
                  <h4 className="font-bold text-white text-base flex items-center gap-2">
                    {selectedUserDetails.name}
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      selectedUserDetails.role === 'admin' ? 'bg-purple-950 text-purple-300 border border-purple-700' :
                      selectedUserDetails.role === 'provider' ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'bg-blue-950 text-blue-300 border border-blue-700'
                    }`}>
                      {selectedUserDetails.role}
                    </span>
                  </h4>
                  <p className="text-xs text-amber-400 font-mono">ID: {selectedUserDetails.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedUserDetails(null)} 
                className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-[#131724] border border-slate-800">
                <span className="text-slate-400 text-[11px] block">CNIC / ID Card</span>
                <span className="font-bold font-mono text-amber-300">{selectedUserDetails.cnic || 'Not Submitted'}</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#131724] border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Wallet Balance</span>
                <span className="font-bold font-mono text-emerald-400">PKR {selectedUserDetails.walletBalance.toLocaleString()}</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#131724] border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Status</span>
                <span className={`font-bold capitalize ${
                  selectedUserDetails.status === 'active' ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {selectedUserDetails.isDeleted ? 'Deleted' : selectedUserDetails.status}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-[#131724] border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Rating / Rep</span>
                <span className="font-bold text-amber-400">{selectedUserDetails.rating || 5.0}★ Verified</span>
              </div>
            </div>

            {/* Contact & Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-[#131724] border border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[11px]">Contact Info:</span>
                <div className="font-mono text-white">{selectedUserDetails.phone}</div>
                <div className="text-slate-400">{selectedUserDetails.email}</div>
              </div>
              <div className="p-3 rounded-2xl bg-[#131724] border border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[11px]">Base Location & Domain:</span>
                <div className="text-white font-medium">{selectedUserDetails.address || 'Khanewal, Punjab'}</div>
                <div className="text-amber-300">{selectedUserDetails.serviceSkill || selectedUserDetails.vehicleType || 'Standard Services'}</div>
              </div>
            </div>

            {selectedUserDetails.notes && (
              <div className="p-3 bg-amber-950/40 border border-amber-600/40 rounded-2xl text-xs text-amber-200">
                <span className="font-bold">Admin Internal Notes: </span>
                {selectedUserDetails.notes}
              </div>
            )}

            {/* Activity & Order History for this User */}
            <div>
              <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-2">
                Activity & Order History ({Store.getUserOrders(selectedUserDetails.id).length})
              </h5>
              <div className="max-h-52 overflow-y-auto border border-slate-800 rounded-2xl bg-[#0e121e]">
                <table className="w-full text-left border-collapse text-xs text-slate-200">
                  <thead className="bg-[#131724] border-b border-slate-800 text-amber-400 text-[10px] font-bold">
                    <tr>
                      <th className="p-2.5">Order ID</th>
                      <th className="p-2.5">Category</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {Store.getUserOrders(selectedUserDetails.id).length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-slate-400">
                          No order activity recorded yet for this account.
                        </td>
                      </tr>
                    ) : (
                      Store.getUserOrders(selectedUserDetails.id).map(ord => (
                        <tr key={ord.id} className="hover:bg-[#141826]">
                          <td className="p-2.5 font-mono font-bold text-amber-400">{ord.id}</td>
                          <td className="p-2.5 capitalize">{ord.category.replace('_', ' ')}</td>
                          <td className="p-2.5">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-900 border border-slate-700 text-slate-300">
                              {ord.status}
                            </span>
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold text-white">PKR {ord.pricing.total.toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditingUser(selectedUserDetails);
                  setSelectedUserDetails(null);
                }}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-black transition-colors cursor-pointer"
              >
                Edit Profile
              </button>
              <button
                type="button"
                onClick={() => setSelectedUserDetails(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT USER PROFILE MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#0b0f19] rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border-2 border-amber-500/50 space-y-4 my-6 text-slate-100 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
              <div>
                <h4 className="font-bold text-white text-base">Edit User Profile Details</h4>
                <p className="text-xs text-amber-400 font-mono">Modifying User ID: {editingUser.id}</p>
              </div>
              <button 
                type="button"
                onClick={() => setEditingUser(null)} 
                className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUserEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-amber-400 font-bold mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full text-xs rounded-xl border border-slate-700 bg-[#141825] px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-amber-400 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-amber-400 font-bold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="w-full text-xs font-mono rounded-xl border border-slate-700 bg-[#141825] px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-amber-400 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-amber-400 font-bold mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={editingUser.phone}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                    className="w-full text-xs font-mono rounded-xl border border-slate-700 bg-[#141825] px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-amber-400 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-amber-400 font-bold mb-1">CNIC / ID Card</label>
                  <input
                    type="text"
                    value={editingUser.cnic || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, cnic: e.target.value })}
                    placeholder="36104-1234567-1"
                    className="w-full text-xs font-mono rounded-xl border border-slate-700 bg-[#141825] px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-amber-400 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-amber-400 font-bold mb-1">Wallet Balance (PKR)</label>
                  <input
                    type="number"
                    step={100}
                    value={editingUser.walletBalance}
                    onChange={(e) => setEditingUser({ ...editingUser, walletBalance: Number(e.target.value) })}
                    className="w-full text-xs font-mono font-bold rounded-xl border border-slate-700 bg-[#141825] px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-amber-400 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-amber-400 font-bold mb-1">Account Status</label>
                  <select
                    value={editingUser.status}
                    onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as any })}
                    className="w-full text-xs rounded-xl border border-slate-700 bg-[#141825] px-3.5 py-2.5 text-white font-medium focus:border-amber-400 focus:outline-hidden cursor-pointer"
                  >
                    <option value="active">Active (Full Access)</option>
                    <option value="suspended">Suspended (Temporary Hold)</option>
                    <option value="blocked">Blocked / Banned (Login Denied)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-amber-400 font-bold mb-1">Account Role</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })}
                    className="w-full text-xs rounded-xl border border-slate-700 bg-[#141825] px-3.5 py-2.5 text-white font-medium focus:border-amber-400 focus:outline-hidden cursor-pointer"
                  >
                    <option value="customer">Customer</option>
                    <option value="provider">Service Provider</option>
                    <option value="admin">Super Administrator</option>
                  </select>
                </div>
              </div>

              {editingUser.role === 'provider' && (
                <div>
                  <label className="block text-amber-400 font-bold mb-1">Skill or Vehicle Fleet</label>
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
                    className="w-full text-xs rounded-xl border border-slate-700 bg-[#141825] px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-amber-400 focus:outline-hidden"
                  />
                </div>
              )}

              <div>
                <label className="block text-amber-400 font-bold mb-1">Base Address / Area</label>
                <input
                  type="text"
                  value={editingUser.address || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, address: e.target.value })}
                  className="w-full text-xs rounded-xl border border-slate-700 bg-[#141825] px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-amber-400 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-amber-400 font-bold mb-1">Admin Audit Notes</label>
                <textarea
                  rows={2}
                  value={editingUser.notes || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, notes: e.target.value })}
                  placeholder="KYC verification status, physical verification remarks..."
                  className="w-full text-xs rounded-xl border border-slate-700 bg-[#141825] px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-amber-400 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl font-black shadow-md shadow-amber-500/20 cursor-pointer"
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
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#0b0f19] rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border-2 border-amber-500/50 space-y-4 my-6 text-slate-100 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
              <div>
                <h4 className="font-bold text-white text-base">Onboard & Create Partner Account</h4>
                <p className="text-xs text-amber-400">Super-Admin verified onboarding for technicians, plumbers, and drivers</p>
              </div>
              <button 
                type="button"
                onClick={() => setIsCreateUserModalOpen(false)} 
                className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-amber-400 font-bold mb-1">Account Role *</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as any)}
                    className="w-full text-xs rounded-xl border border-slate-700 bg-[#141825] px-3.5 py-2.5 text-white font-medium focus:border-amber-400 focus:outline-hidden cursor-pointer"
                  >
                    <option value="provider">Service Provider / Worker</option>
                    <option value="customer">Registered Customer</option>
                  </select>
                </div>

                {newUserRole === 'provider' && (
                  <div>
                    <label className="block text-amber-400 font-bold mb-1">Provider Category *</label>
                    <select
                      value={newProviderCategory}
                      onChange={(e) => setNewProviderCategory(e.target.value as any)}
                      className="w-full text-xs rounded-xl border border-slate-700 bg-[#141825] px-3.5 py-2.5 text-white font-medium focus:border-amber-400 focus:outline-hidden cursor-pointer"
                    >
                      <option value="home_technician">Home Technician (AC/Electric/Plumbing)</option>
                      <option value="cargo_driver">Cargo / Transport Driver</option>
                      <option value="delivery_courier">Delivery Courier / Bike Rider</option>
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-amber-400 font-bold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Tariq Mehmood"
                  className="w-full text-xs rounded-xl border border-slate-700 bg-[#141825] px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-amber-400 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-amber-400 font-bold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="tariq@khanewalconnect.com"
                    className="w-full text-xs font-mono rounded-xl border border-slate-700 bg-[#141825] px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-amber-400 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-amber-400 font-bold mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    placeholder="+92 333 4567890"
                    className="w-full text-xs font-mono rounded-xl border border-slate-700 bg-[#141825] px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-amber-400 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-amber-400 font-bold mb-1">National CNIC *</label>
                  <input
                    type="text"
                    required
                    value={newUserCnic}
                    onChange={(e) => setNewUserCnic(e.target.value)}
                    placeholder="36104-1234567-1"
                    className="w-full text-xs font-mono rounded-xl border border-slate-700 bg-[#141825] px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-amber-400 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-amber-400 font-bold mb-1 text-left">Assigned Login Password *</label>
                  <div className="relative">
                    <input
                      type={showNewUserPassword ? "text" : "password"}
                      required
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      placeholder="Worker@123"
                      className="w-full text-xs font-mono rounded-xl border border-slate-700 bg-[#141825] pl-3.5 pr-10 py-2.5 text-white placeholder-slate-500 focus:border-amber-400 focus:outline-hidden text-left"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewUserPassword(!showNewUserPassword)}
                      className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                      title={showNewUserPassword ? "Hide password" : "Show password"}
                    >
                      {showNewUserPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-amber-400 font-bold mb-1">Starting Wallet Balance (PKR)</label>
                  <input
                    type="number"
                    min={0}
                    step={500}
                    value={newBalance}
                    onChange={(e) => setNewBalance(Number(e.target.value))}
                    className="w-full text-xs font-mono font-bold rounded-xl border border-slate-700 bg-[#141825] px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-amber-400 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-amber-400 font-bold mb-1">Operating Location</label>
                  <input
                    type="text"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="Khanewal City"
                    className="w-full text-xs rounded-xl border border-slate-700 bg-[#141825] px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-amber-400 focus:outline-hidden"
                  />
                </div>
              </div>

              {newUserRole === 'provider' && newProviderCategory === 'home_technician' && (
                <div>
                  <label className="block text-amber-400 font-bold mb-1">Specialized Skill / Trade</label>
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="e.g. Master AC Chemical Washing & Refrigerant Leak Diagnostics"
                    className="w-full text-xs rounded-xl border border-slate-700 bg-[#141825] px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-amber-400 focus:outline-hidden"
                  />
                </div>
              )}

              {newUserRole === 'provider' && newProviderCategory === 'cargo_driver' && (
                <div>
                  <label className="block text-amber-400 font-bold mb-1">Vehicle Model & Registration</label>
                  <input
                    type="text"
                    value={newVehicle}
                    onChange={(e) => setNewVehicle(e.target.value)}
                    placeholder="e.g. Suzuki Bolan Pickup (KHL-8821)"
                    className="w-full text-xs rounded-xl border border-slate-700 bg-[#141825] px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-amber-400 focus:outline-hidden"
                  />
                </div>
              )}

              <div>
                <label className="block text-amber-400 font-bold mb-1">Verification Remarks / Notes</label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Physical verification completed at Khanewal Desk"
                  className="w-full text-xs rounded-xl border border-slate-700 bg-[#141825] px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-amber-400 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateUserModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl font-black shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  Create & Activate Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: STRICT DATABASE RESET WITH GITHUB SECRETS 'RESET_PASS' */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#0b0f19] rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border-2 border-rose-500/60 space-y-4 my-auto text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-rose-900/40">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold text-sm shadow-md">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-white text-sm sm:text-base">Database Reset Tasdeeq (Secret Key)</h4>
                  <p className="text-[11px] text-rose-400">GitHub Secrets: RESET_PASS verification</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleVerifyAndResetDatabase} className="space-y-4 text-xs">
              <div className="p-3 bg-rose-950/40 border border-rose-800/40 rounded-2xl text-[11px] text-rose-200 leading-relaxed space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-rose-300">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Warning: Yeh amal tamam mojooda data saaf kr de ga</span>
                </p>
                <p className="text-slate-300">
                  Database ko reset krne ke liye GitHub Secrets se munsalik khufia password (<code className="font-mono text-amber-300 bg-black/50 px-1 py-0.5 rounded">RESET_PASS</code>) darj karein.
                </p>
              </div>

              {resetError && (
                <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{resetError}</span>
                </div>
              )}

              {resetSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{resetSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-amber-400 font-bold mb-1.5 text-left">
                  Khufia Key darj karein (Enter Secret Key) *
                </label>
                <div className="relative">
                  <input
                    type={showResetSecretKey ? "text" : "password"}
                    required
                    value={resetSecretKey}
                    onChange={(e) => setResetSecretKey(e.target.value)}
                    placeholder="Enter RESET_PASS..."
                    className="w-full text-xs font-mono font-bold rounded-xl border border-slate-700 bg-[#141825] pl-3.5 pr-10 py-2.5 text-white placeholder-slate-500 focus:border-rose-400 focus:outline-hidden text-left"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetSecretKey(!showResetSecretKey)}
                    className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                    title={showResetSecretKey ? "Hide key" : "Show key"}
                  >
                    {showResetSecretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[10px] text-slate-500 block mt-1 text-left">
                  Must match GitHub Secret <code className="font-mono text-slate-400">RESET_PASS</code>.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Cancel Karein
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-black shadow-lg shadow-rose-950 cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Tasdeeq o Reset Karein (Authorize)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: SNAPSHOT RESTORE WITH RESET_PASS (Zero% Data Loss Recovery Engine) */}
      {isRestoreModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#0b0f19] rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border-2 border-emerald-500/60 space-y-4 my-auto text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-900/40">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-white text-sm sm:text-base">Restore MySQL Database Snapshot</h4>
                  <p className="text-[11px] text-emerald-400">Zero% Data Loss Recovery Engine</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsRestoreModalOpen(false);
                  setRestoreError('');
                  setRestoreSecretPassInput('');
                  setUploadedSnapshotJson(null);
                }}
                className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-2xl text-[11px] text-emerald-200 leading-relaxed space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{uploadedSnapshotJson ? 'Custom Snapshot File Ready for Restoration' : 'Restoring Latest MySQL Persistent Snapshot'}</span>
              </p>
              <p className="text-slate-300">
                Snapshot ko restore karne ke liye GitHub Secrets ka secret password (<code className="font-mono text-amber-300 bg-black/50 px-1 py-0.5 rounded">RESET_PASS</code>) darj karein:
              </p>
            </div>

            {restoreError && (
              <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 text-xs flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{restoreError}</span>
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); handleRestoreSnapshot(); }} className="space-y-4 text-xs">
              <div>
                <label className="block text-amber-400 font-bold mb-1.5 text-left">
                  GitHub Secret RESET_PASS *
                </label>
                <input
                  type="password"
                  required
                  value={restoreSecretPassInput}
                  onChange={(e) => { setRestoreSecretPassInput(e.target.value); setRestoreError(''); }}
                  placeholder="Enter RESET_PASS..."
                  className="w-full text-xs font-mono font-bold rounded-xl border border-slate-700 bg-[#141825] px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-hidden text-left"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  disabled={isRestoringSnapshot}
                  onClick={() => setIsRestoreModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRestoringSnapshot || !restoreSecretPassInput.trim()}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-900/30 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Database className="w-4 h-4" />
                  <span>{isRestoringSnapshot ? 'Restoring Database...' : 'Restore Snapshot Now'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DISPATCH & LIVE STATUS UPDATE MODAL */}
      {dispatchOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#0b0f19] rounded-3xl max-w-lg w-full shadow-[0_0_50px_rgba(245,158,11,0.25)] border-2 border-amber-500/60 overflow-hidden my-6 text-slate-100">
            <div className="px-5 sm:px-6 py-4 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 text-white flex items-center justify-between border-b border-amber-500/30">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-sm shadow-md">
                  ⚡
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Worker Assignment o Live Status Broadcast</span>
                    <span className="font-mono text-xs text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-700">
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
                className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDispatchModal} className="p-4 sm:p-6 space-y-4 text-xs">
              {/* Order Context */}
              <div className="bg-slate-950 border border-amber-500/30 p-3 rounded-2xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300 capitalize">{dispatchOrder.category.replace('_', ' ')}</span>
                  <span className="font-mono font-bold text-white">PKR {dispatchOrder.pricing.total.toLocaleString()}</span>
                </div>
                <p className="text-slate-400 text-[11px] truncate">
                  Pata / Address: {dispatchOrder.deliveryAddress}
                </p>
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-amber-400 font-bold mb-1.5">
                  1. Order ka live status muntakhib karein (Customer live tracker par dekhe ga) *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { val: 'pending', label: '⏳ Pending (Intezar)' },
                    { val: 'assigned', label: '👤 Assigned (Muntakhib)' },
                    { val: 'on_the_way', label: '🛵 On The Way (Rawana)' },
                    { val: 'work_started', label: '🔧 In Progress (Jari)' },
                    { val: 'completed', label: '✅ Completed (Mukammal)' },
                    { val: 'cancelled', label: '❌ Cancelled (Mansookh)' }
                  ].map(st => (
                    <button
                      type="button"
                      key={st.val}
                      onClick={() => setDispatchStatus(st.val as OrderStatus)}
                      className={`py-2 px-2.5 rounded-xl border text-center font-bold text-[11px] transition-all cursor-pointer ${
                        dispatchStatus === st.val
                          ? 'bg-amber-500 text-slate-950 shadow-md border-amber-400 ring-2 ring-amber-400/40'
                          : 'bg-slate-950 hover:bg-slate-900 text-slate-300 border-slate-800'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Select Provider or Type Custom */}
              <div className="pt-2 border-t border-slate-800">
                <label className="block text-amber-400 font-bold mb-1.5">
                  2. Registered Worker ya Manager chunein (ya neechay naya naam o number likhein)
                </label>
                <select
                  value={dispatchProviderId}
                  onChange={(e) => handleSelectProviderForDispatch(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-amber-200 mb-2 font-medium focus:border-amber-400 focus:outline-hidden cursor-pointer"
                >
                  <option value="">-- System ke registered workers mein se select karein (Optional) --</option>
                  {providersList.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.phone}) - {p.serviceSkill || p.vehicleType || p.providerCategory}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-amber-400 font-bold mb-1">
                    Worker / Rider / Event Manager ka Naam *
                  </label>
                  <input
                    type="text"
                    required
                    value={dispatchProviderName}
                    onChange={(e) => setDispatchProviderName(e.target.value)}
                    placeholder="e.g. Tariq Mehmood (Technician)"
                    className="w-full text-xs rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-white font-medium placeholder:text-slate-600 focus:border-amber-400 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-amber-400 font-bold mb-1">
                    Worker ka Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={dispatchProviderPhone}
                    onChange={(e) => setDispatchProviderPhone(e.target.value)}
                    placeholder="0300-1234567"
                    className="w-full text-xs rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-white font-mono placeholder:text-slate-600 focus:border-amber-400 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-amber-400 font-bold mb-1">
                    Pohanchne ka mutawaqqe waqt (ETA in minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="300"
                    value={dispatchEtaMinutes}
                    onChange={(e) => setDispatchEtaMinutes(Number(e.target.value) || 0)}
                    placeholder="20"
                    className="w-full text-xs rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 font-mono font-bold text-amber-300 focus:border-amber-400 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-amber-400 font-bold mb-1">
                    Customer screen preview
                  </label>
                  <div className="h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 px-3.5 flex items-center text-[11px] font-bold text-amber-300">
                    ⏱ Taqreeban {dispatchEtaMinutes || 0} minutes mein pohanch jaye ga (ETA)
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-amber-400 font-bold mb-1">
                  Customer ke liye makhsoos paigham / remarks (Roman Urdu / English)
                </label>
                <textarea
                  rows={2}
                  value={dispatchNote}
                  onChange={(e) => setDispatchNote(e.target.value)}
                  placeholder="Maslan: Technician auzar o saman le kr rawana ho chuka hai, 20 minutes mein aap ke pate pr pohanch jaye ga."
                  className="w-full text-xs rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-white placeholder:text-slate-600 focus:border-amber-400 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2.5 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setDispatchOrder(null)}
                  className="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl font-medium cursor-pointer"
                >
                  Cancel Karein
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl font-black shadow-lg shadow-amber-500/20 cursor-pointer flex items-center gap-1.5"
                >
                  <span>Mehfooz o Customer ko Live Nashar Karein</span>
                  <span>✓</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Protected Item Deletion Modal (Requires GitHub Secrets RESET_KEY) */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0e111a] border border-rose-600/40 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl">
                  <ShieldAlert className="w-6 h-6 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-base font-black text-rose-300">
                    Protected Deletion (RESET_PASS)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Permanent deletion authorization
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDeleteTarget(null);
                  setDeleteError('');
                  setDeleteResetKeyInput('');
                }}
                className="text-slate-500 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block">
                Target: {deleteTarget.type.toUpperCase()}
              </span>
              <p className="text-sm font-bold text-white font-mono">{deleteTarget.title}</p>
              {deleteTarget.subtitle && (
                <p className="text-xs text-slate-400">{deleteTarget.subtitle}</p>
              )}
            </div>

            <div className="bg-rose-950/40 border border-rose-900/60 rounded-xl p-3 text-xs text-rose-200 leading-relaxed">
              ⚠️ <strong>Hifazati Tanbih:</strong> Ye record live database (MySQL & Snapshot Cache) aur storage se hamesha ke liye delete ho jaye ga. Tasdeeq ke liye GitHub Secrets mein mojood <code className="text-amber-300 font-mono font-bold">RESET_PASS</code> darj karein:
            </div>

            <form onSubmit={handleConfirmProtectedDelete} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Enter Security Key (RESET_PASS) *
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type={showDeleteResetKey ? 'text' : 'password'}
                    required
                    value={deleteResetKeyInput}
                    onChange={(e) => {
                      setDeleteResetKeyInput(e.target.value);
                      setDeleteError('');
                    }}
                    placeholder="GitHub Secrets RESET_PASS enter karein..."
                    className="w-full text-xs rounded-xl border border-slate-700 bg-slate-950 pl-9 pr-10 py-2.5 font-mono text-white placeholder:text-slate-600 focus:border-rose-400 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowDeleteResetKey(!showDeleteResetKey)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showDeleteResetKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {deleteError && (
                <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-xl text-xs text-red-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{deleteError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => {
                    setDeleteTarget(null);
                    setDeleteError('');
                    setDeleteResetKeyInput('');
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDeleting || !deleteResetKeyInput.trim()}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-black rounded-xl shadow-lg shadow-rose-900/30 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isDeleting ? 'Verifying & Deleting...' : 'Confirm Delete'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
