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
  whatsappDefaultMessage: 'السلام علیکم! مجھے سروس کے بارے میں کچھ معلومات چاہیے/مدد چاہیے۔',
  supportHelpline: '0800-6664'
};

export interface KhanewalArea {
  id: string;
  nameUr: string;
  nameEn: string;
  sector: string;
}

export const KHANEWAL_LOCAL_AREAS: KhanewalArea[] = [
  { id: 'peoples_colony', nameUr: 'پیپلز کالونی، خانیوال', nameEn: 'Peoples Colony, Khanewal', sector: 'Residential Zone A' },
  { id: 'civil_lines', nameUr: 'سیول لائنز و کچہری روڈ', nameEn: 'Civil Lines & Katchery Rd', sector: 'Official & Central' },
  { id: 'block_1_5', nameUr: 'بلاک 1 تا 5 (سینٹرل خانیوال)', nameEn: 'Block 1 - 5 (Central)', sector: 'City Center' },
  { id: 'block_6_10', nameUr: 'بلاک 6 تا 10 (جناح چوک ایریا)', nameEn: 'Block 6 - 10 (Jinnah Chowk)', sector: 'Commercial Hub' },
  { id: 'block_11_15', nameUr: 'بلاک 11 تا 15 (لالہ زار و ماڈل ٹاؤن)', nameEn: 'Block 11 - 15 (Lalazar)', sector: 'Residential Zone B' },
  { id: 'tariqabad', nameUr: 'طارق آباد و گلبرگ کالونی', nameEn: 'Tariqabad & Gulberg Colony', sector: 'North Sector' },
  { id: 'railway_colony', nameUr: 'ریلوے کالونی و لوکو شیڈ روڈ', nameEn: 'Railway Colony & Loco Shed', sector: 'Railway Belt' },
  { id: 'model_town', nameUr: 'ماڈل ٹاؤن و کینٹ ایریا', nameEn: 'Model Town & Cantt Area', sector: 'Cantt Suburb' },
  { id: 'old_khanewal', nameUr: 'پرانا خانیوال و پل بازار', nameEn: 'Old Khanewal & Pull Bazaar', sector: 'Old Heritage Area' },
  { id: 'shamkot_road', nameUr: 'شام کوٹ روڈ و اسٹیڈیم ایریا', nameEn: 'Shamkot Road & Stadium Area', sector: 'South Corridor' },
  { id: 'al_haram_city', nameUr: 'الحرم سٹی و آفیسرز کالونی', nameEn: 'Al-Haram City & Officers Colony', sector: 'New Housing Zone' },
  { id: 'kabirwala_road', nameUr: 'کبیر والا روڈ و بائی پاس لنک', nameEn: 'Kabirwala Road & Bypass', sector: 'Highway Outskirts' },
  { id: 'jahanian_road', nameUr: 'جہانیاں روڈ و لودھراں بائی پاس', nameEn: 'Jahanian Road Bypass', sector: 'Expressway Belt' },
  { id: 'chak_84_10r', nameUr: 'چک 84/10-R (نواحی چکنبر)', nameEn: 'Chak 84/10-R Rural Sector', sector: 'Chak 84' },
  { id: 'chak_86_88', nameUr: 'چک 86/10-R اور 88/10-R', nameEn: 'Chak 86/10-R & 88/10-R', sector: 'East Chaks' }
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
type StoreListener = () => void;
const listeners: Set<StoreListener> = new Set();

export const notifyStoreChanged = () => {
  listeners.forEach(fn => fn());
};

export const subscribeToStore = (listener: StoreListener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

// Store API
export const Store = {
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
    } else if (admin.email !== DEFAULT_ADMIN_USERNAME || admin.password !== DEFAULT_ADMIN_PASSWORD) {
      admin.email = DEFAULT_ADMIN_USERNAME;
      admin.password = DEFAULT_ADMIN_PASSWORD;
      saveToStorage(STORAGE_KEY_USERS, loaded);
    }
    return loaded;
  },

  getCurrentUser: (): User | null => {
    const user = loadFromStorage<User | null>(STORAGE_KEY_CURRENT_USER, null);
    if (!user) return null;
    const freshUser = Store.getUsers().find(u => u.id === user.id);
    if (!freshUser || freshUser.status === 'blocked' || freshUser.status === 'suspended' || freshUser.isDeleted) {
      localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
      return null;
    }
    return freshUser;
  },

  setCurrentUser: (user: User | null) => {
    if (user === null) {
      localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
    } else {
      saveToStorage(STORAGE_KEY_CURRENT_USER, user);
      // Also sync in users list
      const users = Store.getUsers();
      const idx = users.findIndex(u => u.id === user.id);
      if (idx >= 0) {
        users[idx] = user;
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
    return newProvider;
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
    return updated;
  },

  getOrders: (): Order[] => {
    return loadFromStorage<Order[]>(STORAGE_KEY_ORDERS, INITIAL_ORDERS);
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
  },

  getVehiclesCatalog: (): TransportVehicleItem[] => {
    return loadFromStorage<TransportVehicleItem[]>(STORAGE_KEY_VEHICLES, INITIAL_VEHICLES);
  },

  updateVehiclesCatalog: (vehicles: TransportVehicleItem[]) => {
    saveToStorage(STORAGE_KEY_VEHICLES, vehicles);
    notifyStoreChanged();
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
  }
};
