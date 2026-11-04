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
  whatsappSupportPhone: '+92 300 0009988',
  whatsappDefaultMessage: 'Assalam-o-Alaikum! Mujhe Khanewal Connect service ke baray mein kuch maloomat chahiye/madad chahiye.',
  supportHelpline: '0800-6664'
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
    phone: '+92 300 0009988',
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

  // Initialize Dual-Layer Zero-Loss Persistent Sync (MySQL + Cloud Firestore)
  initCloudSync: async () => {
    try {
      // 1. Fetch live system settings & catalog from Server API (MySQL + Disk)
      try {
        const [settingsRes, catalogRes] = await Promise.all([
          fetch('/api/settings'),
          fetch('/api/catalog')
        ]);
        if (settingsRes.ok) {
          const sData = await settingsRes.json();
          if (sData.success && sData.settings) {
            saveToStorage(STORAGE_KEY_SETTINGS, sData.settings);
          }
        }
        if (catalogRes.ok) {
          const cData = await catalogRes.json();
          if (cData.success) {
            if (Array.isArray(cData.services) && cData.services.length > 0) {
              saveToStorage(STORAGE_KEY_SERVICES, cData.services);
            }
            if (Array.isArray(cData.vehicles) && cData.vehicles.length > 0) {
              saveToStorage(STORAGE_KEY_VEHICLES, cData.vehicles);
            }
          }
        }
      } catch (err) {
        console.warn('[Store] Server settings/catalog fetch note:', err);
      }

      // 2. Fetch persistent state from MySQL backend
      try {
        const backendRes = await fetch('/api/sync/all-state');
        if (backendRes.ok) {
          const backendData = await backendRes.json();
          if (backendData.success && Array.isArray(backendData.users) && backendData.users.length > 0) {
            const userMap = new Map<string, User>();
            // Remote backend data takes precedence
            backendData.users.forEach((u: User) => {
              if (u && (u.email || u.id)) {
                userMap.set(u.email ? u.email.toLowerCase().trim() : u.id, u);
              }
            });
            const localUsers = loadFromStorage<User[]>(STORAGE_KEY_USERS, INITIAL_USERS);
            localUsers.forEach(u => {
              const key = u.email ? u.email.toLowerCase().trim() : u.id;
              if (!userMap.has(key)) userMap.set(key, u);
            });

            // CRITICAL: Ensure currently logged-in user is preserved and never dropped
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
            notifyStoreChanged();
          }
        }
      } catch (err) {
        console.warn('[Store] MySQL backend sync note:', err);
      }

      // 3. Fetch persistent state from Cloud Firestore (Top Authoritative Source)
      const cloudData = await CloudSyncService.loadCloudState();
      if (cloudData) {
        if (cloudData.users && cloudData.users.length > 0) {
          const currentUsers = loadFromStorage<User[]>(STORAGE_KEY_USERS, INITIAL_USERS);
          const authoritativeMap = new Map<string, User>();
          // Cloud Firestore is authoritative
          cloudData.users.forEach(u => {
            if (u && (u.email || u.id)) {
              authoritativeMap.set(u.email ? u.email.toLowerCase().trim() : u.id, u);
            }
          });
          currentUsers.forEach(u => {
            const key = u.email ? u.email.toLowerCase().trim() : u.id;
            if (!authoritativeMap.has(key)) authoritativeMap.set(key, u);
          });

          // CRITICAL: Ensure currently logged-in user is preserved and never dropped
          const activeUser = loadFromStorage<User | null>(STORAGE_KEY_CURRENT_USER, null);
          if (activeUser) {
            const activeKey = activeUser.email ? activeUser.email.toLowerCase().trim() : activeUser.id;
            const matched = authoritativeMap.get(activeKey);
            if (matched) {
              const refreshed = { ...activeUser, ...matched };
              saveToStorage(STORAGE_KEY_CURRENT_USER, refreshed);
              authoritativeMap.set(activeKey, refreshed);
            } else {
              authoritativeMap.set(activeKey, activeUser);
            }
          }

          const mergedUsers = Array.from(authoritativeMap.values());
          saveToStorage(STORAGE_KEY_USERS, mergedUsers);
        }

        if (cloudData.orders && cloudData.orders.length > 0) {
          saveToStorage(STORAGE_KEY_ORDERS, cloudData.orders);
        }

        if (cloudData.settings) {
          saveToStorage(STORAGE_KEY_SETTINGS, cloudData.settings);
        }

        if (cloudData.services && cloudData.services.length > 0) {
          saveToStorage(STORAGE_KEY_SERVICES, cloudData.services);
        }

        if (cloudData.vehicles && cloudData.vehicles.length > 0) {
          saveToStorage(STORAGE_KEY_VEHICLES, cloudData.vehicles);
        }

        notifyStoreChanged();
      }

      // 4. Live subscription to Cloud Firestore changes (Users, Orders & Settings)
      CloudSyncService.subscribeToCloudChanges({
        onUsersChange: (newUsers) => {
          if (newUsers.length > 0) {
            const currentUsers = Store.getUsers();
            const map = new Map<string, User>();
            currentUsers.forEach(u => map.set(u.email ? u.email.toLowerCase().trim() : u.id, u));
            newUsers.forEach(u => map.set(u.email ? u.email.toLowerCase().trim() : u.id, u));

            // CRITICAL: Preserve and refresh currently logged-in session
            const activeUser = loadFromStorage<User | null>(STORAGE_KEY_CURRENT_USER, null);
            if (activeUser) {
              const activeKey = activeUser.email ? activeUser.email.toLowerCase().trim() : activeUser.id;
              const matched = map.get(activeKey);
              if (matched) {
                const refreshed = { ...activeUser, ...matched };
                saveToStorage(STORAGE_KEY_CURRENT_USER, refreshed);
                map.set(activeKey, refreshed);
              } else {
                map.set(activeKey, activeUser);
              }
            }

            const merged = Array.from(map.values());
            saveToStorage(STORAGE_KEY_USERS, merged);
            notifyStoreChanged();
          }
        },
        onOrdersChange: (newOrders) => {
          if (newOrders.length > 0) {
            const currentOrders = Store.getOrders();
            const map = new Map<string, Order>();
            currentOrders.forEach(o => map.set(o.id, o));
            newOrders.forEach(o => map.set(o.id, o));
            saveToStorage(STORAGE_KEY_ORDERS, Array.from(map.values()));
            notifyStoreChanged();
          }
        },
        onSettingsChange: (newSettings) => {
          if (newSettings) {
            saveToStorage(STORAGE_KEY_SETTINGS, newSettings);
            notifyStoreChanged();
          }
        }
      });
    } catch (err) {
      console.warn('[Store] initCloudSync fallback to local:', err);
    }
  },

  // Manual or automatic snapshot backup to Cloud Firestore & MySQL
  backupDatabaseToCloud: async () => {
    try {
      const users = Store.getUsers();
      const orders = Store.getOrders();
      const settings = Store.getSettings();

      Store.syncAllUsersToBackend(users);
      await CloudSyncService.uploadFullBackup({ users, orders, settings });
      return true;
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
        phone: '+92 300 0009988',
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
    return loaded;
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

  getUserOrders: (userId: string): Order[] => {
    const orders = Store.getOrders();
    return orders.filter(o => o.customerId === userId || o.assignedProviderId === userId);
  },

  // Dynamic Settings & Live Pricing Controls
  getSettings: (): SystemSettings => {
    return loadFromStorage<SystemSettings>(STORAGE_KEY_SETTINGS, DEFAULT_SETTINGS);
  },

  updateSettings: (newSettings: Partial<SystemSettings>): SystemSettings => {
    const current = Store.getSettings();
    const updated: SystemSettings = { ...current, ...newSettings };
    saveToStorage(STORAGE_KEY_SETTINGS, updated);
    notifyStoreChanged();

    // 1. Live persistence directly to MySQL and Server persistent storage
    fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    }).catch(err => console.warn('[Store] Server settings sync note:', err));

    // 2. Live persistence directly to Cloud Firestore
    CloudSyncService.saveSettings(updated);

    return updated;
  },

  getOrders: (): Order[] => {
    return loadFromStorage<Order[]>(STORAGE_KEY_ORDERS, INITIAL_ORDERS);
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

    // Zero-Loss Cloud Firestore & MySQL Persistence
    CloudSyncService.saveOrder(newOrder);
    Store.syncOrderToBackend(newOrder);
    CloudSyncService.uploadFullBackup({
      users: Store.getUsers(),
      orders,
      settings: Store.getSettings()
    });

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

    // Strict customer authorization check: Customers can never advance status
    const caller = Store.getCurrentUser();
    if (caller && caller.role === 'customer') {
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

    const updatedOrder: Order = {
      ...currentOrder,
      status: newStatus,
      currentStepIndex: stepIndex,
      updatedAt: new Date().toISOString(),
      timeline: updatedTimeline,
      paymentStatus: newStatus === 'completed' ? 'paid' : currentOrder.paymentStatus
    };

    orders[idx] = updatedOrder;
    saveToStorage(STORAGE_KEY_ORDERS, orders);

    // If completed, credit provider wallet balance
    if (newStatus === 'completed' && updatedOrder.assignedProviderId) {
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

    // Zero-Loss Cloud Firestore & MySQL Persistence
    CloudSyncService.saveOrder(updatedOrder);
    Store.syncOrderToBackend(updatedOrder);
    CloudSyncService.uploadFullBackup({
      users: Store.getUsers(),
      orders,
      settings: Store.getSettings()
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
      paymentStatus: params.status === 'completed' ? 'paid' : currentOrder.paymentStatus
    };

    orders[idx] = updatedOrder;
    saveToStorage(STORAGE_KEY_ORDERS, orders);

    if (params.status === 'completed' && updatedOrder.assignedProviderId) {
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

    // Zero-Loss Cloud Firestore Persistence & Backup
    CloudSyncService.saveOrder(updatedOrder);
    CloudSyncService.uploadFullBackup({
      users: Store.getUsers(),
      orders,
      settings: Store.getSettings()
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

    // Zero-Loss Cloud Firestore Persistence & Backup
    CloudSyncService.saveOrder(updatedOrder);
    CloudSyncService.uploadFullBackup({
      users: Store.getUsers(),
      orders,
      settings: Store.getSettings()
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
    return orders[idx];
  },

  getPublicReviews: (): Order[] => {
    return Store.getOrders().filter(o => o.review && o.status === 'completed');
  },

  getServicesCatalog: (): HomeServiceItem[] => {
    return loadFromStorage<HomeServiceItem[]>(STORAGE_KEY_SERVICES, INITIAL_SERVICES);
  },

  updateServicesCatalog: (services: HomeServiceItem[]) => {
    saveToStorage(STORAGE_KEY_SERVICES, services);
    notifyStoreChanged();
    CloudSyncService.saveCatalog({ services });
    fetch('/api/catalog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ services, vehicles: Store.getVehiclesCatalog() })
    }).catch(() => {});
  },

  getVehiclesCatalog: (): TransportVehicleItem[] => {
    return loadFromStorage<TransportVehicleItem[]>(STORAGE_KEY_VEHICLES, INITIAL_VEHICLES);
  },

  updateVehiclesCatalog: (vehicles: TransportVehicleItem[]) => {
    saveToStorage(STORAGE_KEY_VEHICLES, vehicles);
    notifyStoreChanged();
    CloudSyncService.saveCatalog({ vehicles });
    fetch('/api/catalog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ services: Store.getServicesCatalog(), vehicles })
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
    // Expected key from GitHub Secrets 'RESET_KEY' (via Vite env or fallback)
    const configuredResetKey = (typeof process !== 'undefined' && process.env?.RESET_KEY) 
      || (import.meta as any).env?.VITE_RESET_KEY 
      || 'RESET_KEY';

    const cleanInput = (inputKey || '').trim();
    if (!cleanInput || cleanInput !== configuredResetKey.trim()) {
      return {
        success: false,
        message: 'Ghalat Security Key! (Security Key Mismatch). Daakhil ki gayi key GitHub Secrets RESET_KEY se match nahi krti. Reset abort kr diya gya.'
      };
    }

    Store.resetToDemoData();
    return {
      success: true,
      message: 'Database kamyabi se reset kr diya gya hai (Database reset successfully authorized).'
    };
  }
};

export default Store;
