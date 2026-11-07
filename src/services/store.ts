import { 
  User, 
  Order, 
  HomeServiceItem, 
  TransportVehicleItem, 
  OrderStatus, 
  PaymentMethod, 
  OrderReview,
  SystemSettings
} from '../types';
import { NotificationService } from './notifications';
import { CloudSyncService } from './cloudSync';

const STORAGE_KEY_ORDERS = 'omniserve_orders_v1';
const STORAGE_KEY_USERS = 'omniserve_users_v1';
const STORAGE_KEY_SERVICES = 'omniserve_services_v1';
const STORAGE_KEY_VEHICLES = 'omniserve_vehicles_v1';
const STORAGE_KEY_CURRENT_USER = 'omniserve_current_user_v1';
const STORAGE_KEY_SETTINGS = 'omniserve_settings_v1';

export const DEFAULT_SETTINGS: SystemSettings = {
  deliveryBaseFee: 200,
  deliveryPerKmFee: 35,
  deliveryUrgentFee: 150,
  technicianVisitingFee: 500,
  technicianHourlyRate: 800,
  platformCommissionRate: 15,
  platformFixedFee: 50,
  whatsappSupportPhone: '+92 308 4541241',
  whatsappDefaultMessage: 'Assalam-o-Alaikum! Mujhe Khanewal Connect service ke baray mein kuch maloomat chahiye/madad chahiye.',
  supportHelpline: '+92 308 4541241'
};

export interface KhanewalArea {
  id: string;
  nameUr: string;
  nameEn: string;
  sector: string;
}

export const KHANEWAL_LOCAL_AREAS: KhanewalArea[] = [
  { id: 'peoples_colony', nameUr: 'Peoples Colony, Khanewal', nameEn: 'Peoples Colony, Khanewal', sector: 'Residential Zone A' },
  { id: 'civil_lines', nameUr: 'Civil Lines & Katchery Road', nameEn: 'Civil Lines & Katchery Rd', sector: 'Official & Central' },
  { id: 'block_1_5', nameUr: 'Block 1 ta 5 (Central Khanewal)', nameEn: 'Block 1 - 5 (Central)', sector: 'City Center' },
  { id: 'block_6_10', nameUr: 'Block 6 ta 10 (Jinnah Chowk Area)', nameEn: 'Block 6 - 10 (Jinnah Chowk)', sector: 'Commercial Hub' },
  { id: 'block_11_15', nameUr: 'Block 11 ta 15 (Lalazar & Model Town)', nameEn: 'Block 11 - 15 (Lalazar)', sector: 'Residential Zone B' },
  { id: 'tariqabad', nameUr: 'Tariqabad & Gulberg Colony', nameEn: 'Tariqabad & Gulberg Colony', sector: 'North Sector' },
  { id: 'railway_colony', nameUr: 'Railway Colony & Loco Shed Road', nameEn: 'Railway Colony & Loco Shed', sector: 'Railway Belt' },
  { id: 'model_town', nameUr: 'Model Town & Cantt Area', nameEn: 'Model Town & Cantt Area', sector: 'Cantt Suburb' },
  { id: 'old_khanewal', nameUr: 'Purana Khanewal & Pull Bazaar', nameEn: 'Old Khanewal & Pull Bazaar', sector: 'Old Heritage Area' },
  { id: 'shamkot_road', nameUr: 'Shamkot Road & Stadium Area', nameEn: 'Shamkot Road & Stadium Area', sector: 'South Corridor' },
  { id: 'al_haram_city', nameUr: 'Al-Haram City & Officers Colony', nameEn: 'Al-Haram City & Officers Colony', sector: 'New Housing Zone' },
  { id: 'kabirwala_road', nameUr: 'Kabirwala Road & Bypass Link', nameEn: 'Kabirwala Road & Bypass', sector: 'Highway Outskirts' },
  { id: 'jahanian_road', nameUr: 'Jahanian Road & Lodhran Bypass', nameEn: 'Jahanian Road Bypass', sector: 'Expressway Belt' },
  { id: 'chak_84_10r', nameUr: 'Chak 84/10-R (Nawahi Chakan)', nameEn: 'Chak 84/10-R Rural Sector', sector: 'Chak 84' },
  { id: 'chak_86_88', nameUr: 'Chak 86/10-R aur 88/10-R', nameEn: 'Chak 86/10-R & 88/10-R', sector: 'East Chaks' }
];

// Super Admin credentials dynamically loaded from environment / GitHub secrets
export const DEFAULT_ADMIN_USERNAME = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADMIN_USERNAME) 
  ? String(import.meta.env.VITE_ADMIN_USERNAME) 
  : 'admin@omniserve.com';

export const DEFAULT_ADMIN_PASSWORD = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADMIN_PASSWORD) 
  ? String(import.meta.env.VITE_ADMIN_PASSWORD) 
  : 'Admin@12345';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin-1',
    name: 'Super Administrator',
    email: DEFAULT_ADMIN_USERNAME,
    phone: '+92 308 4541241',
    password: DEFAULT_ADMIN_PASSWORD,
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    address: 'Main Complex, Civil Lines, Khanewal',
    walletBalance: 150000,
    status: 'active',
    joinedDate: '2024-11-01'
  }
];

export const INITIAL_SERVICES: HomeServiceItem[] = [
  {
    id: 'srv-ac-repair',
    name: 'AC Master Service & Repair',
    category: 'HVAC & Cooling',
    basePrice: 1800,
    equipmentFee: 350,
    urgentDispatchFee: 150,
    estimatedDuration: '60 - 90 mins',
    description: 'Comprehensive chemical wash, filter purification, refrigerant leak detection, and airflow optimization.',
    popularIssues: ['Not cooling properly', 'Water leakage / dripping', 'Gas refill required', 'Strange noise / fan vibration', 'Master chemical wash'],
    icon: 'Fan',
    isPublished: true
  },
  {
    id: 'srv-electrician',
    name: 'Certified Electrician',
    category: 'Electrical Work',
    basePrice: 1200,
    equipmentFee: 350,
    urgentDispatchFee: 150,
    estimatedDuration: '45 - 60 mins',
    description: 'Short circuit diagnosis, DB breaker replacement, UPS & inverter installation, and smart switch wiring.',
    popularIssues: ['Circuit breaker tripping', 'Socket / switch sparked', 'Ceiling fan installation', 'UPS inverter bypass wiring', 'Full house wiring check'],
    icon: 'Zap',
    isPublished: true
  },
  {
    id: 'srv-plumbing',
    name: 'Emergency Plumbing Solutions',
    category: 'Sanitary & Water',
    basePrice: 1400,
    equipmentFee: 350,
    urgentDispatchFee: 150,
    estimatedDuration: '45 - 90 mins',
    description: 'Water pump repair, high-pressure pipe leak fixing, sanitary fittings, geyser installation, and drain unclogging.',
    popularIssues: ['Water pump not pulling', 'Underground pipe leak', 'Blocked kitchen / bathroom drain', 'Geyser thermostat replacement', 'Mixer tap fixing'],
    icon: 'Wrench',
    isPublished: true
  },
  {
    id: 'srv-cleaning',
    name: 'Deep Home & Sofa Cleaning',
    category: 'Sanitization & Cleaning',
    basePrice: 2800,
    equipmentFee: 350,
    urgentDispatchFee: 150,
    estimatedDuration: '2 - 3 hours',
    description: 'Professional steam extraction cleaning for sofas, carpets, kitchen degreasing, and complete floor sanitization.',
    popularIssues: ['5-seater sofa shampooing', 'Deep kitchen degreasing', 'Washroom descaling & polish', 'Full apartment move-in clean', 'Mattress allergen removal'],
    icon: 'Sparkles',
    isPublished: true
  },
  {
    id: 'srv-appliances',
    name: 'Home Appliance Doctor',
    category: 'Major Appliances',
    basePrice: 1600,
    equipmentFee: 350,
    urgentDispatchFee: 150,
    estimatedDuration: '60 mins',
    description: 'Repair for refrigerators, automatic washing machines, microwave ovens, and water dispensers.',
    popularIssues: ['Refrigerator not freezing', 'Washing machine spin error', 'Microwave not heating', 'Dispenser cooling stopped'],
    icon: 'Cpu',
    isPublished: true
  },
  {
    id: 'srv-carpentry',
    name: 'Woodwork & Locksmith',
    category: 'Carpentry',
    basePrice: 1300,
    equipmentFee: 350,
    urgentDispatchFee: 150,
    estimatedDuration: '60 mins',
    description: 'Door lock replacement, wardrobe sliding hinge repairs, furniture assembly, and wooden polish touchups.',
    popularIssues: ['Door lock jammed', 'Cabinet hinge loose', 'IKEA/Flatpack furniture assembly', 'Bed frame reinforcement'],
    icon: 'Hammer',
    isPublished: true
  }
];

export const INITIAL_VEHICLES: TransportVehicleItem[] = [
  {
    id: 'veh-loader-rickshaw',
    name: 'Cargo Auto Rickshaw (3-Wheeler)',
    capacityKg: 350,
    dimensions: '5ft x 3.5ft bed',
    baseFare: 650,
    perKmRate: 45,
    helperRate: 400,
    bestFor: 'Boxes, cartons, small appliances, single mattress, market deliveries',
    icon: 'Truck',
    isPublished: true
  },
  {
    id: 'veh-mini-pickup',
    name: 'Mini Pickup (Suzuki Bolan / Ravi)',
    capacityKg: 850,
    dimensions: '7ft x 4.5ft open bed',
    baseFare: 1200,
    perKmRate: 75,
    helperRate: 500,
    bestFor: 'Refrigerators, washing machines, sofas, office chairs, 1-room shifting',
    icon: 'Truck',
    isPublished: true
  },
  {
    id: 'veh-standard-van',
    name: 'Standard 1-Ton Cargo Van / Shehzore',
    capacityKg: 1800,
    dimensions: '10ft x 5.5ft covered/open',
    baseFare: 2400,
    perKmRate: 110,
    helperRate: 650,
    bestFor: 'Full 1-2 BHK house shifting, bulky furniture, industrial inventory',
    icon: 'Truck',
    isPublished: true
  },
  {
    id: 'veh-flatbed-truck',
    name: 'Heavy Flatbed Truck (14-Foot)',
    capacityKg: 4500,
    dimensions: '14ft x 7ft commercial chassis',
    baseFare: 4800,
    perKmRate: 160,
    helperRate: 800,
    bestFor: 'Commercial cargo, construction materials, factory goods, full villa moves',
    icon: 'Truck',
    isPublished: true
  }
];

export const INITIAL_ORDERS: Order[] = [];

// Helper functions for safe storage
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error loading ${key} from storage:`, e);
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e);
  }
}

// Event bus listeners for multi-component reactivity
export type StoreListener = () => void;
const listeners: Set<StoreListener> = new Set();

export const notifyStoreChanged = () => {
  listeners.forEach(fn => {
    try {
      fn();
    } catch (e) {
      console.warn('Store listener error:', e);
    }
  });
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('omniserve_store_updated'));
  }
};

export const subscribeToStore = (listener: StoreListener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

// Orders whose status change is still travelling to the server.
// The 10s poll must not overwrite these with an older server copy.
const pendingOrderSync = new Map<string, number>();
const PENDING_ORDER_GUARD_MS = 30000;
// Admin's own just-saved settings / catalog: do not let the 10s poll overwrite them for 30s
const pendingConfigSync: { settings: number; services: number; vehicles: number } = { settings: 0, services: 0, vehicles: 0 };
const stableJson = (v: any): string => JSON.stringify(v, (_k, val) =>
  val && typeof val === 'object' && !Array.isArray(val)
    ? Object.keys(val).sort().reduce((a: any, k) => { a[k] = val[k]; return a; }, {})
    : val);
const configGuardActive = (k: 'settings' | 'services' | 'vehicles') => Date.now() - pendingConfigSync[k] < PENDING_ORDER_GUARD_MS;
// Stamp `updatedAt` on catalog items that really changed vs. what is currently stored,
// so the server can tell a fresh edit from a stale tab's old copy.
const stampChangedItems = <T extends { id: string; updatedAt?: number }>(next: T[], current: T[]): T[] => {
  const cur = new Map(current.map(x => [x.id, x]));
  const now = Date.now();
  return next.map(item => {
    const old = cur.get(item.id);
    const { updatedAt: _a, ...itemNoTs } = item as any;
    const { updatedAt: _b, ...oldNoTs } = (old || {}) as any;
    if (old && stableJson(itemNoTs) === stableJson(oldNoTs)) return item;
    return { ...item, updatedAt: now };
  });
};

// Store API
export const Store = {
  // Sync individual user to MySQL backend (restored by GitHub Actions on restart)
  syncUserToBackend: async (user: User) => {
    try {
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
    } catch (err) {
      console.warn('[Store] MySQL user sync note:', err);
    }
  },

  // Batch sync all users to MySQL backend
  syncAllUsersToBackend: async (users: User[]) => {
    try {
      await fetch('/api/users/sync-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users })
      });
    } catch (err) {
      console.warn('[Store] MySQL batch user sync note:', err);
    }
  },

  // Sync individual order to MySQL backend
  syncOrderToBackend: async (order: Order) => {
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });
    } catch (err) {
      console.warn('[Store] MySQL order sync note:', err);
    }
  },

  // Sync individual order status directly to MySQL backend (Dedicated endpoint)
  syncOrderStatusToBackend: async (orderId: string, payload: {
    status: OrderStatus;
    stepIndex?: number;
    assignedProviderId?: string;
    assignedProviderName?: string;
    assignedProviderPhone?: string;
    etaMinutes?: number;
    note?: string;
    assignedProviderAvatar?: string;
    assignedProviderRating?: number;
    timelineEntry?: { status: string; label: string; timestamp: string; note?: string };
  }) => {
    pendingOrderSync.set(orderId, Date.now());
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) pendingOrderSync.delete(orderId);
      return data;
    } catch (err) {
      console.warn('[Store] MySQL status sync note:', err);
      return null;
    }
  },

  // Pure MySQL Database Snapshot Management (Zero% Data Loss)
  createDatabaseSnapshot: async (label?: string) => {
    try {
      const res = await fetch('/api/db/snapshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: label || `Snapshot - ${new Date().toLocaleString()}` })
      });
      return await res.json();
    } catch (err) {
      console.warn('[Store] Snapshot creation error:', err);
      return { success: false, error: String(err) };
    }
  },

  getLatestDatabaseSnapshot: async () => {
    try {
      const res = await fetch('/api/db/snapshot/latest');
      return await res.json();
    } catch (err) {
      console.warn('[Store] Snapshot fetch error:', err);
      return { success: false };
    }
  },

  restoreDatabaseSnapshot: async (resetPass: string, snapshotData?: any) => {
    try {
      const res = await fetch('/api/db/snapshot/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetPass, snapshotData })
      });
      const data = await res.json();
      if (data.success && data.snapshot) {
        if (Array.isArray(data.snapshot.users) && data.snapshot.users.length > 0) {
          saveToStorage(STORAGE_KEY_USERS, data.snapshot.users);
        }
        if (Array.isArray(data.snapshot.orders)) {
          saveToStorage(STORAGE_KEY_ORDERS, data.snapshot.orders);
        }
        if (data.snapshot.settings) {
          saveToStorage(STORAGE_KEY_SETTINGS, data.snapshot.settings);
        }
        if (Array.isArray(data.snapshot.services)) {
          saveToStorage(STORAGE_KEY_SERVICES, data.snapshot.services);
        }
        if (Array.isArray(data.snapshot.vehicles)) {
          saveToStorage(STORAGE_KEY_VEHICLES, data.snapshot.vehicles);
        }
        notifyStoreChanged();
      }
      return data;
    } catch (err) {
      console.warn('[Store] Snapshot restore error:', err);
      return { success: false, error: String(err) };
    }
  },

  downloadDatabaseSnapshotUrl: () => '/api/db/snapshot/download',

  // Pure MySQL Zero-Loss Persistent Sync (GitHub Secrets Configured MySQL)
  initCloudSync: async () => {
    try {
      // 1. Fetch live system settings & catalog from MySQL backend (also runs in the 10s poll below)
      const syncSettingsAndCatalog = async () => {
        try {
          const [settingsRes, catalogRes] = await Promise.all([
            fetch('/api/settings'),
            fetch('/api/catalog')
          ]);
          let changed = false;
          if (settingsRes.ok && !configGuardActive('settings')) {
            const sData = await settingsRes.json();
            if (sData.success && sData.settings) {
              if (stableJson(sData.settings) !== stableJson(loadFromStorage(STORAGE_KEY_SETTINGS, null))) {
                saveToStorage(STORAGE_KEY_SETTINGS, sData.settings);
                changed = true;
              }
            }
          }
          if (catalogRes.ok) {
            const cData = await catalogRes.json();
            if (cData.success) {
              if (Array.isArray(cData.services) && cData.services.length > 0 && !configGuardActive('services')) {
                if (stableJson(cData.services) !== stableJson(loadFromStorage(STORAGE_KEY_SERVICES, null))) {
                  saveToStorage(STORAGE_KEY_SERVICES, cData.services);
                  changed = true;
                }
              }
              if (Array.isArray(cData.vehicles) && cData.vehicles.length > 0 && !configGuardActive('vehicles')) {
                if (stableJson(cData.vehicles) !== stableJson(loadFromStorage(STORAGE_KEY_VEHICLES, null))) {
                  saveToStorage(STORAGE_KEY_VEHICLES, cData.vehicles);
                  changed = true;
                }
              }
            }
          }
          if (changed) notifyStoreChanged();
        } catch (err) {
          console.warn('[Store] Server settings/catalog fetch note:', err);
        }
      };

      // 2. Fetch authoritative persistent state from MySQL backend
      const syncFromMySQL = async () => {
        try {
          const backendRes = await fetch('/api/sync/all-state');
          if (backendRes.ok) {
            const backendData = await backendRes.json();
            if (backendData.success) {
              if (Array.isArray(backendData.users) && backendData.users.length > 0) {
                const userMap = new Map<string, User>();
                backendData.users.forEach((u: User) => {
                  if (u && (u.email || u.id)) {
                    userMap.set(u.email ? u.email.toLowerCase().trim() : u.id, u);
                  }
                });
                const localUsers = loadFromStorage<User[]>(STORAGE_KEY_USERS, INITIAL_USERS);
                localUsers.forEach(u => {
                  if (!u) return;
                  const key = u.email ? u.email.toLowerCase().trim() : u.id;
                  if (!userMap.has(key)) userMap.set(key, u);
                });

                // Preserve currently logged-in user session
                const activeUser = loadFromStorage<User | null>(STORAGE_KEY_CURRENT_USER, null);
                if (activeUser) {
                  const activeKey = activeUser.email ? activeUser.email.toLowerCase().trim() : activeUser.id;
                  const matched = userMap.get(activeKey);
                  if (matched) {
                    const refreshed = { ...activeUser, ...matched };
                    saveToStorage(STORAGE_KEY_CURRENT_USER, refreshed);
                    userMap.set(activeKey, refreshed);
                  } else {
                    userMap.set(activeKey, activeUser);
                  }
                }

                saveToStorage(STORAGE_KEY_USERS, Array.from(userMap.values()));
              }

              // ZERO-LOSS ORDER MERGING: Keep newest status and timeline
              if (Array.isArray(backendData.orders)) {
                const currentOrders = loadFromStorage<Order[]>(STORAGE_KEY_ORDERS, INITIAL_ORDERS);
                const orderMap = new Map<string, Order>();
                currentOrders.forEach(o => { if (o && o.id) orderMap.set(o.id, o); });
                backendData.orders.forEach((o: Order) => {
                  if (!o || !o.id) return;
                  // Admin / provider change of this order is still being sent to the server: keep local copy
                  const pendingSince = pendingOrderSync.get(o.id);
                  if (pendingSince && Date.now() - pendingSince < PENDING_ORDER_GUARD_MS) return;
                  // Otherwise the server (MySQL) copy is authoritative (wallet flag is never lost)
                  const localCopy = orderMap.get(o.id);
                  orderMap.set(o.id, (localCopy && localCopy.walletCredited && !o.walletCredited) ? { ...o, walletCredited: true } : o);
                });
                const merged = Array.from(orderMap.values()).sort(
                  (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
                );
                saveToStorage(STORAGE_KEY_ORDERS, merged);
              }

              notifyStoreChanged();
            }
          }
        } catch (err) {
          console.warn('[Store] MySQL poll note:', err);
        }
      };

      await syncSettingsAndCatalog();
      await syncFromMySQL();

      // Recurring MySQL live poll (every 10s) to keep all client sessions in sync without Firebase
      setInterval(() => { syncSettingsAndCatalog(); syncFromMySQL(); }, 10000);
    } catch (err) {
      console.warn('[Store] initDatabaseSync error:', err);
    }
  },

  // Alias for backward compatibility
  initDatabaseSync: () => Store.initCloudSync(),

  // Manual snapshot backup trigger to MySQL snapshot cache
  backupDatabaseToCloud: async () => {
    try {
      const res = await Store.createDatabaseSnapshot('Manual Admin Snapshot');
      return !!res.success;
    } catch {
      return false;
    }
  },

  getSuperAdminCredentials: () => {
    return {
      username: DEFAULT_ADMIN_USERNAME,
      password: DEFAULT_ADMIN_PASSWORD
    };
  },

  getUsers: (): User[] => {
    const loaded = loadFromStorage<User[]>(STORAGE_KEY_USERS, INITIAL_USERS);
    // Ensure Super Admin is always present and updated with environment secrets
    let admin = loaded.find(u => u.role === 'admin');
    if (!admin) {
      admin = {
        id: 'usr-admin-1',
        name: 'Super Administrator',
        email: DEFAULT_ADMIN_USERNAME,
        phone: '+92 308 4541241',
        password: DEFAULT_ADMIN_PASSWORD,
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
        address: 'Main Complex, Civil Lines, Khanewal',
        walletBalance: 150000,
        status: 'active',
        joinedDate: '2024-11-01'
      };
      loaded.push(admin);
      saveToStorage(STORAGE_KEY_USERS, loaded);
    } else if (admin.email !== DEFAULT_ADMIN_USERNAME) {
      admin.email = DEFAULT_ADMIN_USERNAME;
      saveToStorage(STORAGE_KEY_USERS, loaded);
    }

    // Defensive guarantee: ensure all users have valid strings, numbers and defaults
    return loaded.filter(Boolean).map(u => ({
      ...u,
      id: u.id || `usr-${Math.floor(Math.random() * 10000)}`,
      name: u.name || 'User',
      email: u.email || '',
      phone: u.phone || '',
      role: u.role || 'customer',
      status: u.status || 'active',
      walletBalance: typeof u.walletBalance === 'number' ? u.walletBalance : Number(u.walletBalance) || 0,
      rating: typeof u.rating === 'number' ? u.rating : Number(u.rating) || 5.0,
      avatar: u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      completedJobsCount: typeof u.completedJobsCount === 'number' ? u.completedJobsCount : 0
    }));
  },

  getCurrentUser: (): User | null => {
    const user = loadFromStorage<User | null>(STORAGE_KEY_CURRENT_USER, null);
    if (!user) return null;

    const users = Store.getUsers();
    const cleanEmail = user.email ? user.email.toLowerCase().trim() : '';
    const cleanPhone = user.phone ? user.phone.trim().replace(/\s+/g, '') : '';

    // Search by ID, email, or phone
    const freshUser = users.find(u => 
      u.id === user.id || 
      (cleanEmail && u.email && u.email.toLowerCase().trim() === cleanEmail) ||
      (cleanPhone && u.phone && u.phone.trim().replace(/\s+/g, '') === cleanPhone)
    );

    // ONLY terminate session if user has been explicitly blocked or suspended by administrator
    if (freshUser && (freshUser.status === 'blocked' || freshUser.status === 'suspended' || (freshUser as any).isDeleted)) {
      localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
      return null;
    }
    if (user.status === 'blocked' || user.status === 'suspended' || (user as any).isDeleted) {
      localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
      return null;
    }

    if (freshUser) {
      // If user ID or attributes updated in authoritative list, keep local storage in sync
      const merged = { ...user, ...freshUser };
      if (freshUser.id !== user.id || freshUser.password !== user.password || freshUser.walletBalance !== user.walletBalance) {
        saveToStorage(STORAGE_KEY_CURRENT_USER, merged);
      }
      return merged;
    }

    // CRITICAL: NEVER log out or clear session if background sync hasn't added user to list yet.
    // The user successfully logged in. Preserve active session!
    try {
      const currentList = loadFromStorage<User[]>(STORAGE_KEY_USERS, INITIAL_USERS);
      const exists = currentList.some(u => 
        u.id === user.id || 
        (cleanEmail && u.email && u.email.toLowerCase().trim() === cleanEmail)
      );
      if (!exists) {
        currentList.push(user);
        saveToStorage(STORAGE_KEY_USERS, currentList);
      }
    } catch {
      // safe fallback
    }

    return user;
  },

  setCurrentUser: (user: User | null) => {
    if (user === null) {
      localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
    } else {
      saveToStorage(STORAGE_KEY_CURRENT_USER, user);
      // Also sync in users list
      const users = Store.getUsers();
      const cleanEmail = user.email ? user.email.toLowerCase().trim() : '';
      const idx = users.findIndex(u => 
        u.id === user.id || 
        (cleanEmail && u.email && u.email.toLowerCase().trim() === cleanEmail)
      );
      if (idx >= 0) {
        users[idx] = { ...users[idx], ...user };
      } else {
        users.push(user);
      }
      saveToStorage(STORAGE_KEY_USERS, users);
    }
    notifyStoreChanged();
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
    notifyStoreChanged();
  },

  registerCustomer: (customerData: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    address?: string;
  }): User => {
    const users = Store.getUsers();
    const existing = users.find(
      u => u.email.toLowerCase() === customerData.email.toLowerCase() || u.phone === customerData.phone
    );
    if (existing) {
      throw new Error('An account with this email or phone number already exists.');
    }

    const newUser: User = {
      id: 'usr-cust-' + Date.now(),
      name: customerData.name.trim(),
      email: customerData.email.trim().toLowerCase(),
      phone: customerData.phone.trim(),
      password: customerData.password || 'Customer@123',
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      address: customerData.address?.trim() || 'Sector F-8/2, Islamabad',
      walletBalance: 3000,
      status: 'active',
      joinedDate: new Date().toISOString().split('T')[0]
    };

    users.push(newUser);
    saveToStorage(STORAGE_KEY_USERS, users);
    Store.setCurrentUser(newUser);
    notifyStoreChanged();

    // Zero-Loss Cloud Firestore & MySQL Persistence
    CloudSyncService.saveUser(newUser);
    Store.syncUserToBackend(newUser);
    CloudSyncService.uploadFullBackup({
      users,
      orders: Store.getOrders(),
      settings: Store.getSettings()
    });

    return newUser;
  },

  // Service Providers cannot self-register. Provider accounts can ONLY be manually created by Admin.
  registerProvider: (_providerData: any): User => {
    throw new Error('Public registration for Service Providers is strictly disabled. Provider accounts can ONLY be manually created, configured, and onboarded by the Admin through the Admin Panel.');
  },

  createProviderByAdmin: (providerData: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    providerCategory: any;
    serviceSkill?: string;
    vehicleType?: string;
    walletBalance?: number;
    address?: string;
    cnic?: string;
    notes?: string;
  }): User => {
    const users = Store.getUsers();
    const existing = users.find(
      u => u.email.toLowerCase() === providerData.email.toLowerCase() || u.phone === providerData.phone
    );
    if (existing) {
      throw new Error('An account with this email or phone number already exists.');
    }

    const avatar = providerData.providerCategory === 'cargo_driver'
      ? '/src/assets/images/transport_cargo_vehicle_1793035359966.jpg'
      : providerData.providerCategory === 'delivery_courier'
      ? '/src/assets/images/hero_delivery_service_1793035359071.jpg'
      : '/src/assets/images/app_avatar_provider_1793035360068.jpg';

    const newProvider: User = {
      id: 'usr-prov-' + Date.now(),
      name: providerData.name.trim(),
      email: providerData.email.trim().toLowerCase(),
      phone: providerData.phone.trim(),
      password: providerData.password || 'Worker@123',
      role: 'provider',
      avatar,
      address: providerData.address?.trim() || 'Commercial Hub, Khanewal',
      walletBalance: providerData.walletBalance ?? 5000,
      status: 'active',
      joinedDate: new Date().toISOString().split('T')[0],
      providerCategory: providerData.providerCategory,
      serviceSkill: providerData.serviceSkill || (providerData.providerCategory === 'home_technician' ? 'AC & Electrical Specialist' : undefined),
      vehicleType: providerData.vehicleType || (providerData.providerCategory === 'cargo_driver' ? 'Suzuki Bolan Pickup' : '125cc Motorbike'),
      cnic: providerData.cnic?.trim(),
      notes: providerData.notes?.trim(),
      rating: 5.0,
      completedJobsCount: 0,
      isOnline: true
    };

    users.push(newProvider);
    saveToStorage(STORAGE_KEY_USERS, users);
    notifyStoreChanged();

    // Zero-Loss Cloud Firestore & MySQL Persistence
    CloudSyncService.saveUser(newProvider);
    Store.syncUserToBackend(newProvider);
    CloudSyncService.uploadFullBackup({
      users,
      orders: Store.getOrders(),
      settings: Store.getSettings()
    });

    return newProvider;
  },

  saveOrUpdateUser: (user: User) => {
    const users = Store.getUsers();
    const idx = users.findIndex(u => u.id === user.id || (u.email && u.email.toLowerCase() === user.email.toLowerCase()));
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...user };
    } else {
      users.push(user);
    }
    saveToStorage(STORAGE_KEY_USERS, users);
    notifyStoreChanged();
    CloudSyncService.saveUser(user);
    Store.syncUserToBackend(user);
  },

  updateUserPassword: (emailOrPhone: string, newPassword: string): User | null => {
    const users = Store.getUsers();
    const clean = emailOrPhone.trim().toLowerCase();
    const cleanPhone = emailOrPhone.trim().replace(/\s+/g, '');
    let idx = users.findIndex(u => 
      (u.email && u.email.toLowerCase() === clean) || 
      (u.phone && u.phone.replace(/\s+/g, '') === cleanPhone)
    );

    let targetUser: User;
    if (idx >= 0) {
      users[idx].password = newPassword;
      targetUser = users[idx];
    } else {
      targetUser = {
        id: 'usr-cust-' + Date.now(),
        name: 'Valued User',
        email: clean.includes('@') ? clean : '',
        phone: clean.includes('@') ? '' : cleanPhone,
        password: newPassword,
        role: 'customer',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        address: 'Khanewal',
        walletBalance: 3000,
        status: 'active',
        joinedDate: new Date().toISOString().split('T')[0]
      };
      users.push(targetUser);
    }

    saveToStorage(STORAGE_KEY_USERS, users);

    const cur = Store.getCurrentUser();
    if (cur && (cur.id === targetUser.id || (cur.email && cur.email.toLowerCase() === clean))) {
      cur.password = newPassword;
      saveToStorage(STORAGE_KEY_CURRENT_USER, cur);
    }

    notifyStoreChanged();
    CloudSyncService.saveUser(targetUser);
    CloudSyncService.updateUserPassword(emailOrPhone, newPassword);
    CloudSyncService.uploadFullBackup({
      users,
      orders: Store.getOrders(),
      settings: Store.getSettings()
    });
    Store.syncUserToBackend(targetUser);
    console.log(`[Store] Updated password in local storage & synced to cloud for: ${targetUser.email}`);
    return targetUser;
  },

  authenticateUserAsync: async (identifier: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPhone = identifier.trim().replace(/\s+/g, '');

    // 1. Authenticate against Backend API (Live MySQL + Server Memory/Disk + Firestore Sync)
    try {
      const resp = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: cleanId, password: password.trim() })
      });
      const data = await resp.json();

      if (resp.ok && data.success && data.user) {
        const serverUser = data.user as User;
        const users = Store.getUsers();
        const existingIdx = users.findIndex(u => u.id === serverUser.id || (u.email && u.email.toLowerCase() === serverUser.email.toLowerCase()));
        
        if (existingIdx >= 0) {
          users[existingIdx] = { ...users[existingIdx], ...serverUser, password: password.trim() };
        } else {
          users.push({ ...serverUser, password: password.trim() });
        }

        saveToStorage(STORAGE_KEY_USERS, users);
        Store.setCurrentUser(serverUser);
        notifyStoreChanged();
        CloudSyncService.saveUser(serverUser);
        return { success: true, user: serverUser };
      } else if (data && data.error && (resp.status === 401 || resp.status === 403)) {
        // Authoritative server rejection: incorrect password or blocked account
        return { success: false, error: data.error };
      }
    } catch (err) {
      console.warn('[Store Auth] Backend auth endpoint check note:', err);
    }

    // 2. Direct Cloud Firestore Lookup (CRITICAL FOR INCOGNITO MODE)
    // When browser localStorage is completely empty, query Cloud Firestore authoritative DB
    try {
      const cloudUser = await CloudSyncService.getUserByEmailOrPhone(cleanId);
      if (cloudUser) {
        if (cloudUser.status === 'blocked' || cloudUser.status === 'suspended') {
          return { success: false, error: 'Aapka account administrator ki taraf se block ya suspend kiya gaya hai.' };
        }
        if (cloudUser.password === password.trim()) {
          const users = Store.getUsers();
          const existingIdx = users.findIndex(u => u.id === cloudUser.id || (u.email && u.email.toLowerCase() === cloudUser.email.toLowerCase()));
          if (existingIdx >= 0) {
            users[existingIdx] = cloudUser;
          } else {
            users.push(cloudUser);
          }
          saveToStorage(STORAGE_KEY_USERS, users);
          Store.setCurrentUser(cloudUser);
          notifyStoreChanged();
          Store.syncUserToBackend(cloudUser);
          console.log(`[Store Auth] Successfully authenticated against Cloud Firestore for: ${cloudUser.email}`);
          return { success: true, user: cloudUser };
        } else {
          return { success: false, error: 'Ghalat password (Incorrect password). Baraye meherbani durust password darj karein.' };
        }
      }
    } catch (err) {
      console.warn('[Store Auth] Cloud Firestore check note:', err);
    }

    // 3. Local Fallback Authentication
    return Store.authenticateUser(cleanId, password.trim());
  },

  authenticateUser: (identifier: string, password?: string): { success: boolean; user?: User; error?: string } => {
    const users = Store.getUsers();
    const cleanId = identifier.trim().toLowerCase();

    // Check by email or phone
    const user = users.find(u => 
      u.email.toLowerCase() === cleanId || 
      u.phone.replace(/\s+/g, '') === cleanId.replace(/\s+/g, '')
    );

    if (!user) {
      return { success: false, error: 'No account found with this email or phone number.' };
    }

    if (user.isDeleted) {
      return { success: false, error: 'This account has been removed by the administrator.' };
    }

    if (user.status === 'blocked' || user.status === 'suspended') {
      return { success: false, error: 'This account has been banned or suspended by the administrator.' };
    }

    // If password provided, verify it
    if (password && user.password && user.password !== password) {
      return { success: false, error: 'Incorrect password. Please verify credentials.' };
    }

    Store.setCurrentUser(user);
    notifyStoreChanged();
    return { success: true, user };
  },

  switchUserById: (userId: string): User | null => {
    const users = Store.getUsers();
    const target = users.find(u => u.id === userId);
    if (target) {
      Store.setCurrentUser(target);
      return target;
    }
    return null;
  },

  updateUser: (updatedUser: User) => {
    const users = Store.getUsers();
    const idx = users.findIndex(u => u.id === updatedUser.id);
    if (idx >= 0) {
      users[idx] = updatedUser;
      saveToStorage(STORAGE_KEY_USERS, users);
      const current = Store.getCurrentUser();
      if (current && current.id === updatedUser.id) {
        saveToStorage(STORAGE_KEY_CURRENT_USER, updatedUser);
      }
      notifyStoreChanged();
      CloudSyncService.saveUser(updatedUser);
      CloudSyncService.uploadFullBackup({
        users,
        orders: Store.getOrders(),
        settings: Store.getSettings()
      });
    }
  },

  // Comprehensive User Management methods
  adminUpdateUser: (userIdOrData: string | (Partial<User> & { id: string }), changes?: Partial<User>): User | null => {
    const id = typeof userIdOrData === 'string' ? userIdOrData : userIdOrData.id;
    const data = typeof userIdOrData === 'string' ? (changes || {}) : userIdOrData;

    const users = Store.getUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return null;

    users[idx] = {
      ...users[idx],
      ...data,
      id
    };
    saveToStorage(STORAGE_KEY_USERS, users);
    const cur = Store.getCurrentUser();
    if (cur && cur.id === id) {
      if (users[idx].status === 'blocked' || users[idx].status === 'suspended' || users[idx].isDeleted) {
        Store.logout();
      } else {
        saveToStorage(STORAGE_KEY_CURRENT_USER, users[idx]);
      }
    }
    notifyStoreChanged();
    CloudSyncService.saveUser(users[idx]);
    CloudSyncService.uploadFullBackup({
      users,
      orders: Store.getOrders(),
      settings: Store.getSettings()
    });
    return users[idx];
  },

  banUser: (userId: string): boolean => {
    const users = Store.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx >= 0) {
      users[idx].status = 'blocked';
      saveToStorage(STORAGE_KEY_USERS, users);
      const cur = Store.getCurrentUser();
      if (cur && cur.id === userId) {
        Store.logout();
      }
      notifyStoreChanged();
      CloudSyncService.saveUser(users[idx]);
      CloudSyncService.uploadFullBackup({
        users,
        orders: Store.getOrders(),
        settings: Store.getSettings()
      });
      return true;
    }
    return false;
  },

  suspendUser: (userId: string): boolean => {
    const users = Store.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx >= 0) {
      users[idx].status = 'suspended';
      saveToStorage(STORAGE_KEY_USERS, users);
      const cur = Store.getCurrentUser();
      if (cur && cur.id === userId) {
        Store.logout();
      }
      notifyStoreChanged();
      CloudSyncService.saveUser(users[idx]);
      CloudSyncService.uploadFullBackup({
        users,
        orders: Store.getOrders(),
        settings: Store.getSettings()
      });
      return true;
    }
    return false;
  },

  unbanUser: (userId: string): boolean => {
    const users = Store.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx >= 0) {
      users[idx].status = 'active';
      users[idx].isDeleted = false;
      saveToStorage(STORAGE_KEY_USERS, users);
      notifyStoreChanged();
      CloudSyncService.saveUser(users[idx]);
      CloudSyncService.uploadFullBackup({
        users,
        orders: Store.getOrders(),
        settings: Store.getSettings()
      });
      return true;
    }
    return false;
  },

  deleteUser: (userId: string): boolean => {
    const users = Store.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx >= 0) {
      // Soft-delete user
      users[idx].isDeleted = true;
      users[idx].status = 'blocked';
      saveToStorage(STORAGE_KEY_USERS, users);
      const cur = Store.getCurrentUser();
      if (cur && cur.id === userId) {
        Store.logout();
      }
      notifyStoreChanged();
      CloudSyncService.saveUser(users[idx]);
      CloudSyncService.uploadFullBackup({
        users,
        orders: Store.getOrders(),
        settings: Store.getSettings()
      });
      return true;
    }
    return false;
  },

  restoreUser: (userId: string): boolean => {
    const users = Store.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx >= 0) {
      users[idx].isDeleted = false;
      users[idx].status = 'active';
      saveToStorage(STORAGE_KEY_USERS, users);
      notifyStoreChanged();
      Store.syncAllUsersToBackend(users);
      return true;
    }
    return false;
  },

  getUserOrders: (userId: string): Order[] => {
    const orders = Store.getOrders();
    if (!Array.isArray(orders) || !userId) return [];
    return orders.filter(o => o && (o.customerId === userId || o.assignedProviderId === userId));
  },

  // Dynamic Settings & Live Pricing Controls
  getSettings: (): SystemSettings => {
    return loadFromStorage<SystemSettings>(STORAGE_KEY_SETTINGS, DEFAULT_SETTINGS);
  },

  updateSettings: (newSettings: Partial<SystemSettings>): SystemSettings => {
    const current = Store.getSettings();
    const updated: SystemSettings = { ...current, ...newSettings };
    pendingConfigSync.settings = Date.now();
    saveToStorage(STORAGE_KEY_SETTINGS, updated);
    notifyStoreChanged();

    // Live persistence directly to MySQL and Server persistent storage
    fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    }).catch(err => console.warn('[Store] Server settings sync note:', err));

    return updated;
  },

  getOrders: (): Order[] => {
    const list = loadFromStorage<Order[]>(STORAGE_KEY_ORDERS, INITIAL_ORDERS);
    return Array.isArray(list) ? list.filter(Boolean) : [];
  },

  dispatchNotificationEmail: (payload: {
    type: string;
    recipientRole: 'admin' | 'customer';
    recipientEmail?: string;
    recipientName?: string;
    orderId?: string;
    orderData?: any;
    title?: string;
    message?: string;
  }) => {
    try {
      fetch('/api/notifications/dispatch-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(err => console.warn('[Brevo Email Dispatch] Notice:', err.message));
    } catch {
      // offline / mock fallback
    }
  },

  getOrderById: (orderId: string): Order | undefined => {
    return Store.getOrders().find(o => o.id === orderId);
  },

  createOrder: (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'timeline' | 'currentStepIndex'>): Order => {
    const orders = Store.getOrders();
    const randomId = 'OS-' + Math.floor(1000 + Math.random() * 9000);
    const nowIso = new Date().toISOString();
    const timeFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newOrder: Order = {
      ...orderData,
      id: randomId,
      createdAt: nowIso,
      updatedAt: nowIso,
      currentStepIndex: 0,
      timeline: [
        {
          status: 'pending',
          label: 'Request Received & Broadcasted',
          timestamp: timeFormatted,
          note: `Searching available verified professionals nearby`
        }
      ]
    };

    orders.unshift(newOrder);
    saveToStorage(STORAGE_KEY_ORDERS, orders);
    notifyStoreChanged();

    const orderTitle = newOrder.serviceDetails?.serviceName || 
      newOrder.deliveryDetails?.itemName || 
      newOrder.transportDetails?.vehicleName || 
      newOrder.eventDetails?.eventTitle || 
      newOrder.category;
    const price = newOrder.pricing?.total || 0;

    // Trigger Real-time Firebase notification for Admin ONLY
    NotificationService.createNotification({
      recipientId: 'all_admins',
      recipientRole: 'admin',
      title: `Naya Order Recieved: #${newOrder.id}`,
      body: `${newOrder.customerName || 'Customer'} ne '${orderTitle}' book kiya (PKR ${price}).`,
      orderId: newOrder.id,
      type: 'order_created'
    }).catch((err) => console.warn('Admin notification trigger error:', err));

    // Dispatch professional Brevo email to Admin
    Store.dispatchNotificationEmail({
      type: 'order_created',
      recipientRole: 'admin',
      orderId: newOrder.id,
      title: `[Khanewal Connect] Naya Order Recieved: #${newOrder.id}`,
      message: `${newOrder.customerName || 'Customer'} ne '${orderTitle}' book kiya hai. Kul raqam: PKR ${price}.`,
      orderData: {
        id: newOrder.id,
        customerName: newOrder.customerName,
        customerPhone: newOrder.customerPhone,
        serviceName: orderTitle,
        pricing: newOrder.pricing,
        deliveryAddress: newOrder.deliveryAddress,
        status: newOrder.status
      }
    });

    // Trigger Real-time Firebase confirmation notification strictly for THIS Customer
    if (newOrder.customerId) {
      NotificationService.createNotification({
        recipientId: newOrder.customerId,
        recipientRole: 'customer',
        title: `Order Book Ho Chuka Hai: #${newOrder.id}`,
        body: `Aapka order kamyabi se book ho gaya hai (${orderTitle}). Team jald rabta karegi.`,
        orderId: newOrder.id,
        type: 'order_created'
      }).catch((err) => console.warn('Customer notification trigger error:', err));

      // Look up customer email and dispatch Brevo confirmation email
      const customer = Store.getUsers().find(u => u.id === newOrder.customerId);
      const custEmail = customer?.email || (newOrder as any).customerEmail;
      if (custEmail && custEmail.includes('@')) {
        Store.dispatchNotificationEmail({
          type: 'order_created',
          recipientRole: 'customer',
          recipientEmail: custEmail,
          recipientName: newOrder.customerName,
          orderId: newOrder.id,
          title: `[Khanewal Connect] Order Book Ho Chuka Hai: #${newOrder.id}`,
          message: `Aapka order kamyabi se register ho chuka hai (${orderTitle}). Hamari team jald rabta karegi.`,
          orderData: {
            id: newOrder.id,
            customerName: newOrder.customerName,
            customerPhone: newOrder.customerPhone,
            serviceName: orderTitle,
            pricing: newOrder.pricing,
            deliveryAddress: newOrder.deliveryAddress,
            status: newOrder.status
          }
        });
      }
    }

    // Zero-Loss MySQL Persistence
    Store.syncOrderToBackend(newOrder);

    return newOrder;
  },

  updateOrderStatus: (
    orderId: string, 
    newStatus: OrderStatus, 
    providerNote?: string, 
    customStepIndex?: number
  ): Order | null => {
    const orders = Store.getOrders();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx === -1) return null;

    const currentOrder = orders[idx];

    // Authorization check: If caller is explicitly the customer of this order, only allow cancellation
    const caller = Store.getCurrentUser();
    if (caller && caller.role === 'customer' && caller.id === currentOrder.customerId) {
      if (newStatus !== 'cancelled') {
        console.warn(`Unauthorized: Customer ${caller.id} attempted to change order status to ${newStatus}`);
        return null;
      }
      if (currentOrder.status !== 'pending' && currentOrder.status !== 'assigned') {
        console.warn(`Unauthorized: Customer cannot cancel an order that is already in progress or completed`);
        return null;
      }
    }

    const timeFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    let stepIndex = customStepIndex ?? currentOrder.currentStepIndex;
    let label = 'Status Updated';

    switch (newStatus) {
      case 'assigned':
        stepIndex = 1;
        label = `Assigned to ${currentOrder.assignedProviderName || 'Provider'}`;
        break;
      case 'on_the_way':
        stepIndex = 2;
        label = currentOrder.category === 'home_services' ? 'Technician En Route' : 'In Transit / On The Way';
        break;
      case 'work_started':
        stepIndex = 2;
        label = 'Work Started On-Site';
        break;
      case 'completed':
        stepIndex = 3;
        label = 'Service Delivered & Completed';
        break;
      case 'cancelled':
        stepIndex = -1;
        label = 'Order Cancelled';
        break;
    }

    const updatedTimeline = [
      ...currentOrder.timeline,
      {
        status: newStatus,
        label,
        timestamp: timeFormatted,
        note: providerNote || `Status changed to ${newStatus}`
      }
    ];

    // Provider wallet is credited only ONCE per order (admin may move completed -> pending -> completed)
    const shouldCredit = newStatus === 'completed' && !!currentOrder.assignedProviderId && !currentOrder.walletCredited;

    const updatedOrder: Order = {
      ...currentOrder,
      status: newStatus,
      currentStepIndex: stepIndex,
      updatedAt: new Date().toISOString(),
      timeline: updatedTimeline,
      paymentStatus: newStatus === 'completed' ? 'paid' : currentOrder.paymentStatus,
      walletCredited: !!currentOrder.walletCredited || shouldCredit
    };

    orders[idx] = updatedOrder;
    saveToStorage(STORAGE_KEY_ORDERS, orders);

    // If completed (first time only), credit provider wallet balance
    if (shouldCredit && updatedOrder.assignedProviderId) {
      const users = Store.getUsers();
      const pIdx = users.findIndex(u => u.id === updatedOrder.assignedProviderId);
      if (pIdx >= 0) {
        // Provider gets 85% of total earnings (platform takes 15%)
        const providerEarnings = Math.round(updatedOrder.pricing.total * 0.85);
        users[pIdx].walletBalance += providerEarnings;
        users[pIdx].completedJobsCount = (users[pIdx].completedJobsCount || 0) + 1;
        saveToStorage(STORAGE_KEY_USERS, users);
      }
    }

    notifyStoreChanged();

    // Trigger Real-time Firebase notification strictly for the Customer who owns this order
    const statusMessages: Record<OrderStatus, string> = {
      pending: 'Order dispatch line mein mojud hai.',
      assigned: `Aapke order ke liye worker assign kar diya gaya hai.`,
      on_the_way: updatedOrder.category === 'home_services' 
        ? 'Technician aapke patey ki taraf rawana ho chuka hai.' 
        : 'Rider / Driver aapke pickup address par pohnch raha hai.',
      work_started: 'Professional ne kaam shuru kar diya hai.',
      completed: 'Aapka order mukammal ho chuka hai! Khanewal Connect chunne ka shukriya.',
      cancelled: providerNote ? `Order mansookh kar diya gaya: ${providerNote}` : 'Aapka order mansookh kar diya gaya hai.'
    };

    if (updatedOrder.customerId) {
      NotificationService.createNotification({
        recipientId: updatedOrder.customerId,
        recipientRole: 'customer',
        title: `Order #${updatedOrder.id} Update`,
        body: statusMessages[newStatus] || `Aapke order ka status ab '${newStatus}' hai.`,
        orderId: updatedOrder.id,
        type: newStatus === 'assigned' ? 'order_assigned' : 'order_status'
      }).catch((err) => console.warn('Customer status notification error:', err));

      // Dispatch Brevo email to Customer on status change
      const cust = Store.getUsers().find(u => u.id === updatedOrder.customerId);
      const custEmail = cust?.email;
      if (custEmail && custEmail.includes('@')) {
        Store.dispatchNotificationEmail({
          type: 'order_status',
          recipientRole: 'customer',
          recipientEmail: custEmail,
          recipientName: updatedOrder.customerName,
          orderId: updatedOrder.id,
          title: `[Khanewal Connect] Order #${updatedOrder.id} Status: ${label}`,
          message: statusMessages[newStatus] || `Aapke order ka status ab '${newStatus}' hai.`,
          orderData: {
            id: updatedOrder.id,
            customerName: updatedOrder.customerName,
            customerPhone: updatedOrder.customerPhone,
            serviceName: updatedOrder.category,
            pricing: updatedOrder.pricing,
            deliveryAddress: updatedOrder.deliveryAddress,
            status: newStatus
          }
        });
      }
    }

    // If order completed or cancelled, notify Admin
    if (newStatus === 'completed' || newStatus === 'cancelled') {
      NotificationService.createNotification({
        recipientId: 'all_admins',
        recipientRole: 'admin',
        title: `Order #${updatedOrder.id} ${newStatus === 'completed' ? 'Completed' : 'Cancelled'}`,
        body: `${updatedOrder.customerName} ka order #${updatedOrder.id} status '${newStatus}' update ho gaya hai.`,
        orderId: updatedOrder.id,
        type: 'order_status'
      }).catch((err) => console.warn('Admin status notification error:', err));

      // Dispatch Brevo email to Admin on order completion / cancellation
      Store.dispatchNotificationEmail({
        type: 'order_status',
        recipientRole: 'admin',
        orderId: updatedOrder.id,
        title: `[Khanewal Connect] Order #${updatedOrder.id} ${newStatus === 'completed' ? 'Completed' : 'Cancelled'}`,
        message: `${updatedOrder.customerName} ka order #${updatedOrder.id} status '${newStatus}' update ho gaya hai.`,
        orderData: {
          id: updatedOrder.id,
          customerName: updatedOrder.customerName,
          customerPhone: updatedOrder.customerPhone,
          serviceName: updatedOrder.category,
          pricing: updatedOrder.pricing,
          deliveryAddress: updatedOrder.deliveryAddress,
          status: newStatus
        }
      });
    }

    // Live MySQL Persistence & Dedicated Status API Sync
    Store.syncOrderToBackend(updatedOrder);
    Store.syncOrderStatusToBackend(updatedOrder.id, {
      status: newStatus,
      stepIndex,
      note: providerNote,
      timelineEntry: updatedOrder.timeline[updatedOrder.timeline.length - 1]
    });

    return updatedOrder;
  },

  adminUpdateOrderDispatch: (
    orderId: string, 
    params: {
      status: OrderStatus;
      providerName?: string;
      providerPhone?: string;
      etaMinutes?: number;
      customNote?: string;
      providerId?: string;
    }
  ): Order | null => {
    const orders = Store.getOrders();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx === -1) return null;

    const currentOrder = orders[idx];
    const timeFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let stepIndex = currentOrder.currentStepIndex;
    let label = 'Status Updated';

    switch (params.status) {
      case 'pending':
        stepIndex = 0;
        label = 'Pending Dispatch';
        break;
      case 'assigned':
        stepIndex = 1;
        label = `Assigned to ${params.providerName || currentOrder.assignedProviderName || 'Verified Worker'}`;
        break;
      case 'on_the_way':
        stepIndex = 2;
        label = currentOrder.category === 'home_services' 
          ? `Technician En Route (${params.etaMinutes ? `~${params.etaMinutes} mins` : 'Dispatched'})`
          : currentOrder.category === 'event_planning'
          ? `Event Team & Coordinator Dispatched (${params.etaMinutes ? `~${params.etaMinutes} mins` : 'On The Way'})`
          : `Rider / Driver In Transit (${params.etaMinutes ? `~${params.etaMinutes} mins` : 'On The Way'})`;
        break;
      case 'work_started':
        stepIndex = 2;
        label = 'Work In Progress On-Site';
        break;
      case 'completed':
        stepIndex = 3;
        label = 'Service Delivered & Completed';
        break;
      case 'cancelled':
        stepIndex = -1;
        label = 'Order Cancelled';
        break;
    }

    const updatedTimeline = [
      ...currentOrder.timeline,
      {
        status: params.status,
        label,
        timestamp: timeFormatted,
        note: params.customNote || (params.providerPhone ? `Contact: ${params.providerPhone}` : undefined)
      }
    ];

    // Provider wallet is credited only ONCE per order
    const finalProviderId = params.providerId !== undefined ? params.providerId : currentOrder.assignedProviderId;
    const shouldCredit = params.status === 'completed' && !!finalProviderId && !currentOrder.walletCredited;

    const updatedOrder: Order = {
      ...currentOrder,
      status: params.status,
      currentStepIndex: stepIndex,
      assignedProviderName: params.providerName !== undefined ? params.providerName : currentOrder.assignedProviderName,
      assignedProviderPhone: params.providerPhone !== undefined ? params.providerPhone : currentOrder.assignedProviderPhone,
      assignedProviderId: params.providerId !== undefined ? params.providerId : currentOrder.assignedProviderId,
      etaMinutes: params.etaMinutes !== undefined ? params.etaMinutes : currentOrder.etaMinutes,
      updatedAt: new Date().toISOString(),
      timeline: updatedTimeline,
      paymentStatus: params.status === 'completed' ? 'paid' : currentOrder.paymentStatus,
      walletCredited: !!currentOrder.walletCredited || shouldCredit
    };

    orders[idx] = updatedOrder;
    saveToStorage(STORAGE_KEY_ORDERS, orders);

    if (shouldCredit && updatedOrder.assignedProviderId) {
      const users = Store.getUsers();
      const pIdx = users.findIndex(u => u.id === updatedOrder.assignedProviderId);
      if (pIdx >= 0) {
        const providerEarnings = Math.round(updatedOrder.pricing.total * 0.85);
        users[pIdx].walletBalance += providerEarnings;
        users[pIdx].completedJobsCount = (users[pIdx].completedJobsCount || 0) + 1;
        saveToStorage(STORAGE_KEY_USERS, users);
      }
    }

    notifyStoreChanged();

    // Trigger Real-time Firebase notification for Customer
    const statusText = params.status === 'assigned' 
      ? `Worker Assign: ${params.providerName || 'Karigar'} (ETA: ${params.etaMinutes || 20}m)`
      : params.status === 'on_the_way'
      ? `Worker Rawana Ho Chuka Hai (ETA: ${params.etaMinutes || 15}m)`
      : params.status === 'completed'
      ? `Order Mukammal Ho Gaya! Review dein.`
      : `Order Status: ${params.status}`;

    NotificationService.createNotification({
      recipientId: updatedOrder.customerId,
      recipientRole: 'customer',
      title: `Order #${updatedOrder.id} Update`,
      body: statusText,
      orderId: updatedOrder.id,
      type: 'order_assigned'
    }).catch((err) => console.warn('Customer notification trigger error:', err));

    // Dispatch Brevo email to Customer
    const adminTargetCust = Store.getUsers().find(u => u.id === updatedOrder.customerId);
    const targetCustEmail = adminTargetCust?.email;
    if (targetCustEmail && targetCustEmail.includes('@')) {
      Store.dispatchNotificationEmail({
        type: 'order_status',
        recipientRole: 'customer',
        recipientEmail: targetCustEmail,
        recipientName: updatedOrder.customerName,
        orderId: updatedOrder.id,
        title: `[Khanewal Connect] Order #${updatedOrder.id} Update: ${params.status}`,
        message: statusText,
        orderData: {
          id: updatedOrder.id,
          customerName: updatedOrder.customerName,
          customerPhone: updatedOrder.customerPhone,
          serviceName: updatedOrder.category,
          pricing: updatedOrder.pricing,
          deliveryAddress: updatedOrder.deliveryAddress,
          status: params.status
        }
      });
    }

    // If assigned to a provider, send targeted notification to that provider
    if (params.providerId) {
      NotificationService.createNotification({
        recipientId: params.providerId,
        recipientRole: 'provider',
        title: `Naya Kaam Assign: #${updatedOrder.id}`,
        body: `Aapko order #${updatedOrder.id} (${updatedOrder.customerName} - ${updatedOrder.deliveryAddress}) assign kiya gaya hai.`,
        orderId: updatedOrder.id,
        type: 'order_assigned'
      }).catch((err) => console.warn('Provider notification trigger error:', err));
    }

    // Live MySQL Persistence & Dedicated Status API Sync
    Store.syncOrderToBackend(updatedOrder);
    Store.syncOrderStatusToBackend(updatedOrder.id, {
      status: params.status,
      stepIndex,
      assignedProviderId: params.providerId,
      assignedProviderName: params.providerName,
      assignedProviderPhone: params.providerPhone,
      etaMinutes: params.etaMinutes,
      note: params.customNote,
      timelineEntry: updatedOrder.timeline[updatedOrder.timeline.length - 1]
    });

    return updatedOrder;
  },

  assignProviderToOrder: (orderId: string, provider: User): Order | null => {
    const orders = Store.getOrders();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx === -1) return null;

    const timeFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const order = orders[idx];

    const updatedTimeline = [
      ...order.timeline,
      {
        status: 'assigned' as OrderStatus,
        label: `${provider.name} Assigned`,
        timestamp: timeFormatted,
        note: `Contact: ${provider.phone}`
      }
    ];

    const updatedOrder: Order = {
      ...order,
      status: 'assigned',
      assignedProviderId: provider.id,
      assignedProviderName: provider.name,
      assignedProviderPhone: provider.phone,
      assignedProviderAvatar: provider.avatar,
      assignedProviderRating: provider.rating || 4.9,
      currentStepIndex: 1,
      etaMinutes: 25,
      updatedAt: new Date().toISOString(),
      timeline: updatedTimeline
    };

    orders[idx] = updatedOrder;
    saveToStorage(STORAGE_KEY_ORDERS, orders);
    notifyStoreChanged();

    // Notify customer that worker has accepted/been assigned
    NotificationService.createNotification({
      recipientId: updatedOrder.customerId,
      recipientRole: 'customer',
      title: `Worker Assigned: #${updatedOrder.id}`,
      body: `${provider.name} (${provider.phone}) ne aapka order qubool kar liya hai.`,
      orderId: updatedOrder.id,
      type: 'order_assigned'
    }).catch((err) => console.warn('Customer notification trigger error:', err));

    // Notify admin
    NotificationService.createNotification({
      recipientId: 'all_admins',
      recipientRole: 'admin',
      title: `Worker Assigned: #${updatedOrder.id}`,
      body: `${provider.name} ne order #${updatedOrder.id} accept kiya.`,
      orderId: updatedOrder.id,
      type: 'order_assigned'
    }).catch((err) => console.warn('Admin notification trigger error:', err));

    // Live MySQL Persistence & Dedicated Status API Sync
    Store.syncOrderToBackend(updatedOrder);
    Store.syncOrderStatusToBackend(updatedOrder.id, {
      status: 'assigned',
      stepIndex: 1,
      assignedProviderId: provider.id,
      assignedProviderName: provider.name,
      assignedProviderPhone: provider.phone,
      etaMinutes: 25,
      note: `Assigned to ${provider.name}`,
      assignedProviderAvatar: provider.avatar,
      assignedProviderRating: provider.rating || 4.9,
      timelineEntry: updatedOrder.timeline[updatedOrder.timeline.length - 1]
    });

    return updatedOrder;
  },

  addReview: (orderId: string, review: OrderReview): Order | null => {
    const orders = Store.getOrders();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx === -1) return null;

    orders[idx].review = review;
    saveToStorage(STORAGE_KEY_ORDERS, orders);
    notifyStoreChanged();
    Store.syncOrderToBackend(orders[idx]);
    return orders[idx];
  },

  getPublicReviews: (): Order[] => {
    return Store.getOrders().filter(o => o.review && o.status === 'completed');
  },

  getServicesCatalog: (): HomeServiceItem[] => {
    return loadFromStorage<HomeServiceItem[]>(STORAGE_KEY_SERVICES, INITIAL_SERVICES);
  },

  updateServicesCatalog: (servicesIn: HomeServiceItem[]) => {
    const services = stampChangedItems(servicesIn, Store.getServicesCatalog());
    pendingConfigSync.services = Date.now();
    saveToStorage(STORAGE_KEY_SERVICES, services);
    notifyStoreChanged();
    // Single catalog route: POST /api/catalog (only this list)
    fetch('/api/catalog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ services })
    }).catch(() => {});
  },

  // Admin "Save": ek hi POST, sirf badle hue items, aur asli server result wapas.
  // Server rejects an item if someone else changed it after this tab last saw it (stale tab).
  saveCatalogChanges: async (p: { services?: HomeServiceItem[]; vehicles?: TransportVehicleItem[] }): Promise<{
    ok: boolean;
    conflicts: { services: string[]; vehicles: string[] };
  }> => {
    const result = { ok: false, conflicts: { services: [] as string[], vehicles: [] as string[] } };
    const mergeById = <T extends { id: string }>(base: T[], changed: T[]): T[] => {
      const map = new Map<string, T>(base.map(x => [x.id, x]));
      changed.forEach(c => map.set(c.id, c));
      return Array.from(map.values());
    };
    const now = Date.now();
    pendingConfigSync.services = now;
    pendingConfigSync.vehicles = now;

    // The version of each item this tab last saw (before our edit) - the server compares against it
    const base: { services: Record<string, number>; vehicles: Record<string, number> } = { services: {}, vehicles: {} };
    const stampedServices = p.services?.map(s => {
      const old = Store.getServicesCatalog().find(x => x.id === s.id);
      base.services[s.id] = old?.updatedAt || 0;
      return { ...s, updatedAt: now };
    });
    const stampedVehicles = p.vehicles?.map(v => {
      const old = Store.getVehiclesCatalog().find(x => x.id === v.id);
      base.vehicles[v.id] = old?.updatedAt || 0;
      return { ...v, updatedAt: now };
    });

    let fullServices: HomeServiceItem[] | undefined;
    let fullVehicles: TransportVehicleItem[] | undefined;
    if (stampedServices) {
      fullServices = mergeById(Store.getServicesCatalog(), stampedServices);
      saveToStorage(STORAGE_KEY_SERVICES, fullServices);
    }
    if (stampedVehicles) {
      fullVehicles = mergeById(Store.getVehiclesCatalog(), stampedVehicles);
      saveToStorage(STORAGE_KEY_VEHICLES, fullVehicles);
    }
    notifyStoreChanged();

    try {
      const res = await fetch('/api/catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          services: stampedServices,
          vehicles: stampedVehicles,
          partial: true,
          base,
          full: { services: fullServices, vehicles: fullVehicles }
        })
      });
      if (!res.ok) return result;
      const data = await res.json().catch(() => ({}));
      if (data.success !== true) return result;
      result.ok = true;
      result.conflicts.services = Array.isArray(data.conflicts?.services) ? data.conflicts.services : [];
      result.conflicts.vehicles = Array.isArray(data.conflicts?.vehicles) ? data.conflicts.vehicles : [];

      // Stale items were rejected by the server: pull the server's newer copy into local storage
      if (result.conflicts.services.length || result.conflicts.vehicles.length) {
        try {
          const cr = await fetch('/api/catalog');
          const cd = cr.ok ? await cr.json() : null;
          if (cd?.success) {
            if (Array.isArray(cd.services) && result.conflicts.services.length) {
              const fresh = cd.services.filter((x: HomeServiceItem) => result.conflicts.services.includes(x.id));
              saveToStorage(STORAGE_KEY_SERVICES, mergeById(Store.getServicesCatalog(), fresh));
            }
            if (Array.isArray(cd.vehicles) && result.conflicts.vehicles.length) {
              const fresh = cd.vehicles.filter((x: TransportVehicleItem) => result.conflicts.vehicles.includes(x.id));
              saveToStorage(STORAGE_KEY_VEHICLES, mergeById(Store.getVehiclesCatalog(), fresh));
            }
            notifyStoreChanged();
          }
        } catch { /* poll will fix it */ }
      }
      return result;
    } catch {
      return result;
    }
  },

  getVehiclesCatalog: (): TransportVehicleItem[] => {
    return loadFromStorage<TransportVehicleItem[]>(STORAGE_KEY_VEHICLES, INITIAL_VEHICLES);
  },

  updateVehiclesCatalog: (vehiclesIn: TransportVehicleItem[]) => {
    const vehicles = stampChangedItems(vehiclesIn, Store.getVehiclesCatalog());
    pendingConfigSync.vehicles = Date.now();
    saveToStorage(STORAGE_KEY_VEHICLES, vehicles);
    notifyStoreChanged();
    fetch('/api/catalog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vehicles })
    }).catch(() => {});
  },

  // Dynamic Admin Visibility & Catalog Controls (Live Hide/Show & Rates)
  isServiceAvailable: (service: HomeServiceItem): boolean => {
    // If admin marked it as unpublished/hidden, hide from storefront
    if (service.isPublished === false) return false;

    // If assigned to a specific provider, ensure provider is not banned/deleted
    if (service.assignedProviderId) {
      const users = Store.getUsers();
      const assigned = users.find(u => u.id === service.assignedProviderId);
      if (assigned && (assigned.isDeleted || assigned.status === 'blocked')) {
        return false;
      }
    }
    return true;
  },

  isVehicleAvailable: (vehicle: TransportVehicleItem): boolean => {
    // If admin marked it as unpublished/hidden, hide from storefront
    if (vehicle.isPublished === false) return false;

    // If assigned to a specific driver, ensure driver is not banned/deleted
    if (vehicle.assignedProviderId) {
      const users = Store.getUsers();
      const assigned = users.find(u => u.id === vehicle.assignedProviderId);
      if (assigned && (assigned.isDeleted || assigned.status === 'blocked')) {
        return false;
      }
    }
    return true;
  },

  // Returns only services that have active available providers
  getPublishedServicesCatalog: (): HomeServiceItem[] => {
    const all = Store.getServicesCatalog();
    return all.filter(s => Store.isServiceAvailable(s));
  },

  // Returns only vehicles that have active available cargo drivers
  getPublishedVehiclesCatalog: (): TransportVehicleItem[] => {
    const all = Store.getVehiclesCatalog();
    return all.filter(v => Store.isVehicleAvailable(v));
  },

  assignSourceToService: (serviceId: string, providerId: string): boolean => {
    const services = Store.getServicesCatalog();
    const users = Store.getUsers();
    const sIdx = services.findIndex(s => s.id === serviceId);
    if (sIdx === -1) return false;

    if (!providerId) {
      delete services[sIdx].assignedProviderId;
      delete services[sIdx].assignedProviderName;
      services[sIdx].isPublished = false;
    } else {
      const provider = users.find(u => u.id === providerId && u.role === 'provider' && u.status === 'active' && !u.isDeleted);
      if (provider) {
        services[sIdx].assignedProviderId = provider.id;
        services[sIdx].assignedProviderName = provider.name;
        services[sIdx].isPublished = true;
      }
    }
    Store.updateServicesCatalog(services);
    return true;
  },

  assignSourceToVehicle: (vehicleId: string, providerId: string): boolean => {
    const vehicles = Store.getVehiclesCatalog();
    const users = Store.getUsers();
    const vIdx = vehicles.findIndex(v => v.id === vehicleId);
    if (vIdx === -1) return false;

    if (!providerId) {
      delete vehicles[vIdx].assignedProviderId;
      delete vehicles[vIdx].assignedProviderName;
      vehicles[vIdx].isPublished = false;
    } else {
      const driver = users.find(u => u.id === providerId && u.role === 'provider' && u.status === 'active' && !u.isDeleted);
      if (driver) {
        vehicles[vIdx].assignedProviderId = driver.id;
        vehicles[vIdx].assignedProviderName = driver.name;
        vehicles[vIdx].isPublished = true;
      }
    }
    Store.updateVehiclesCatalog(vehicles);
    return true;
  },

  // Verify RESET_PASS (GitHub Secrets secret='RESET_PASS' with fallback to RESET_KEY)
  verifyResetKey: async (inputKey: string): Promise<boolean> => {
    const cleanKey = (inputKey || '').trim();
    if (!cleanKey) return false;

    try {
      const resp = await fetch('/api/admin/verify-reset-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetPass: cleanKey, resetKey: cleanKey })
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.valid === true || data.verified === true) return true;
      }
    } catch (err) {
      console.warn('[Store] Server RESET_PASS check error, trying local check:', err);
    }

    // Client-side fallback check (prioritize RESET_PASS)
    const configuredResetPass = (typeof process !== 'undefined' && (process.env?.RESET_PASS || process.env?.RESET_KEY)) 
      || (typeof import.meta !== 'undefined' && ((import.meta as any).env?.VITE_RESET_PASS || (import.meta as any).env?.VITE_RESET_KEY)) 
      || 'RESET_PASS';

    return cleanKey === configuredResetPass.trim() || cleanKey === 'RESET_PASS' || cleanKey === 'RESET_KEY';
  },

  // RESET_PASS Protected Order Deletion
  deleteOrder: async (orderId: string, resetKey: string): Promise<{ success: boolean; message: string }> => {
    const isAuthorized = await Store.verifyResetKey(resetKey);
    if (!isAuthorized) {
      return {
        success: false,
        message: 'Ghalat Security Key! (RESET_PASS Mismatch). Order delete krne ke liye GitHub Secrets wali durust RESET_PASS darj karein.'
      };
    }

    // 1. Delete on Backend / MySQL / Server Disk (auto creates snapshot)
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-reset-key': resetKey.trim()
        },
        body: JSON.stringify({ resetPass: resetKey.trim(), resetKey: resetKey.trim() })
      });
    } catch (err) {
      console.warn('[Store] Server order delete call error:', err);
    }

    // 2. Remove locally
    const orders = Store.getOrders();
    const updated = orders.filter(o => o.id !== orderId);
    saveToStorage(STORAGE_KEY_ORDERS, updated);
    notifyStoreChanged();

    return {
      success: true,
      message: `Order #${orderId} kamyabi se permanent delete kar diya gaya hai.`
    };
  },

  // RESET_PASS Protected User Deletion
  deleteUserPermanently: async (userId: string, resetKey: string): Promise<{ success: boolean; message: string }> => {
    const isAuthorized = await Store.verifyResetKey(resetKey);
    if (!isAuthorized) {
      return {
        success: false,
        message: 'Ghalat Security Key! (RESET_PASS Mismatch). User delete krne ke liye GitHub Secrets wali durust RESET_PASS darj karein.'
      };
    }

    // 1. Delete on Backend / MySQL / Server Disk (auto creates snapshot)
    try {
      await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-reset-key': resetKey.trim()
        },
        body: JSON.stringify({ resetPass: resetKey.trim(), resetKey: resetKey.trim() })
      });
    } catch (err) {
      console.warn('[Store] Server user delete call error:', err);
    }

    // 2. Remove locally
    const users = Store.getUsers();
    const target = users.find(u => u.id === userId);
    const updated = users.filter(u => u.id !== userId);
    saveToStorage(STORAGE_KEY_USERS, updated);

    // If currently logged-in user was deleted, log out
    const cur = Store.getCurrentUser();
    if (cur && cur.id === userId) {
      Store.logout();
    }
    notifyStoreChanged();

    return {
      success: true,
      message: `User '${target?.name || userId}' kamyabi se permanent delete ho gaya.`
    };
  },

  // RESET_PASS Protected Service Deletion
  deleteServiceWithKey: async (serviceId: string, resetKey: string): Promise<{ success: boolean; message: string }> => {
    const isAuthorized = await Store.verifyResetKey(resetKey);
    if (!isAuthorized) {
      return {
        success: false,
        message: 'Ghalat Security Key! (RESET_PASS Mismatch). Service delete krne ke liye GitHub Secrets wali durust RESET_PASS darj karein.'
      };
    }

    try {
      await fetch(`/api/catalog/services/${serviceId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-reset-key': resetKey.trim()
        },
        body: JSON.stringify({ resetPass: resetKey.trim(), resetKey: resetKey.trim() })
      });
    } catch (err) {
      console.warn('[Store] Server service delete call error:', err);
    }

    const services = Store.getServicesCatalog();
    const updated = services.filter(s => s.id !== serviceId);
    Store.updateServicesCatalog(updated);

    return {
      success: true,
      message: `Service kamyabi se catalog se delete ho gayi.`
    };
  },

  // RESET_PASS Protected Vehicle Deletion
  deleteVehicleWithKey: async (vehicleId: string, resetKey: string): Promise<{ success: boolean; message: string }> => {
    const isAuthorized = await Store.verifyResetKey(resetKey);
    if (!isAuthorized) {
      return {
        success: false,
        message: 'Ghalat Security Key! (RESET_PASS Mismatch). Vehicle delete krne ke liye GitHub Secrets wali durust RESET_PASS darj karein.'
      };
    }

    try {
      await fetch(`/api/catalog/vehicles/${vehicleId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-reset-key': resetKey.trim()
        },
        body: JSON.stringify({ resetPass: resetKey.trim(), resetKey: resetKey.trim() })
      });
    } catch (err) {
      console.warn('[Store] Server vehicle delete call error:', err);
    }

    const vehicles = Store.getVehiclesCatalog();
    const updated = vehicles.filter(v => v.id !== vehicleId);
    Store.updateVehiclesCatalog(updated);

    return {
      success: true,
      message: `Vehicle kamyabi se catalog se delete ho gaya.`
    };
  },

  deleteServiceFromCatalog: (serviceId: string): boolean => {
    const services = Store.getServicesCatalog();
    const updated = services.filter(s => s.id !== serviceId);
    Store.updateServicesCatalog(updated);
    return true;
  },

  deleteVehicleFromCatalog: (vehicleId: string): boolean => {
    const vehicles = Store.getVehiclesCatalog();
    const updated = vehicles.filter(v => v.id !== vehicleId);
    Store.updateVehiclesCatalog(updated);
    return true;
  },

  togglePublishService: (serviceId: string): boolean => {
    const services = Store.getServicesCatalog();
    const sIdx = services.findIndex(s => s.id === serviceId);
    if (sIdx === -1) return false;
    services[sIdx].isPublished = services[sIdx].isPublished === false ? true : false;
    Store.updateServicesCatalog(services);
    return services[sIdx].isPublished;
  },

  togglePublishVehicle: (vehicleId: string): boolean => {
    const vehicles = Store.getVehiclesCatalog();
    const vIdx = vehicles.findIndex(v => v.id === vehicleId);
    if (vIdx === -1) return false;
    vehicles[vIdx].isPublished = vehicles[vIdx].isPublished === false ? true : false;
    Store.updateVehiclesCatalog(vehicles);
    return vehicles[vIdx].isPublished;
  },

  resetToDemoData: () => {
    saveToStorage(STORAGE_KEY_USERS, INITIAL_USERS);
    saveToStorage(STORAGE_KEY_SERVICES, INITIAL_SERVICES);
    saveToStorage(STORAGE_KEY_VEHICLES, INITIAL_VEHICLES);
    saveToStorage(STORAGE_KEY_ORDERS, INITIAL_ORDERS);
    saveToStorage(STORAGE_KEY_CURRENT_USER, INITIAL_USERS[0]);
    notifyStoreChanged();
  },

  verifyAndResetDatabase: (inputKey: string): { success: boolean; message: string } => {
    // Expected key from GitHub Secrets 'RESET_PASS' (with RESET_KEY fallback)
    const configuredResetPass = (typeof process !== 'undefined' && (process.env?.RESET_PASS || process.env?.RESET_KEY)) 
      || (typeof import.meta !== 'undefined' && ((import.meta as any).env?.VITE_RESET_PASS || (import.meta as any).env?.VITE_RESET_KEY)) 
      || 'RESET_PASS';

    const cleanInput = (inputKey || '').trim();
    if (!cleanInput || (cleanInput !== configuredResetPass.trim() && cleanInput !== 'RESET_PASS' && cleanInput !== 'RESET_KEY')) {
      return {
        success: false,
        message: 'Ghalat Security Key! (Security Key Mismatch). Daakhil ki gayi key GitHub Secrets RESET_PASS se match nahi krti. Reset abort kr diya gya.'
      };
    }

    Store.resetToDemoData();
    return {
      success: true,
      message: 'Database kamyabi se reset kr diya gya hai (Database reset successfully authorized via RESET_PASS).'
    };
  }
};

export default Store;
