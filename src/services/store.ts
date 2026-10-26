import { 
  User, 
  Order, 
  HomeServiceItem, 
  TransportVehicleItem, 
  OrderStatus, 
  PaymentMethod,
  OrderReview
} from '../types';

const STORAGE_KEY_ORDERS = 'omniserve_orders_v1';
const STORAGE_KEY_USERS = 'omniserve_users_v1';
const STORAGE_KEY_SERVICES = 'omniserve_services_v1';
const STORAGE_KEY_VEHICLES = 'omniserve_vehicles_v1';
const STORAGE_KEY_CURRENT_USER = 'omniserve_current_user_v1';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-customer-1',
    name: 'Ahmed Khan',
    email: 'ahmed.khan@example.com',
    phone: '+92 300 1234567',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    address: 'House 42, Street 7, Sector F-8/2, Islamabad',
    walletBalance: 4500,
    status: 'active',
    joinedDate: '2025-08-15'
  },
  {
    id: 'usr-provider-tech',
    name: 'Sarah Jenkins',
    email: 'sarah.tech@omniserve.com',
    phone: '+92 321 9876543',
    role: 'provider',
    avatar: '/src/assets/images/app_avatar_provider_1793035360068.jpg',
    address: 'G-9 Commercial Area, Islamabad',
    walletBalance: 18450,
    status: 'active',
    joinedDate: '2025-03-10',
    providerCategory: 'home_technician',
    serviceSkill: 'HVAC & Master AC Repair Specialist',
    rating: 4.9,
    completedJobsCount: 148,
    isOnline: true
  },
  {
    id: 'usr-provider-driver',
    name: 'Tariq Mehmood',
    email: 'tariq.transport@omniserve.com',
    phone: '+92 333 4567890',
    role: 'provider',
    avatar: '/src/assets/images/transport_cargo_vehicle_1793035359966.jpg',
    address: 'I-9 Industrial Zone, Islamabad',
    walletBalance: 24300,
    status: 'active',
    joinedDate: '2025-01-20',
    providerCategory: 'cargo_driver',
    vehicleType: 'Suzuki Bolan Mini-Pickup (1 Ton)',
    rating: 4.85,
    completedJobsCount: 312,
    isOnline: true
  },
  {
    id: 'usr-provider-courier',
    name: 'Bilal Vance',
    email: 'bilal.delivery@omniserve.com',
    phone: '+92 312 5550192',
    role: 'provider',
    avatar: '/src/assets/images/hero_delivery_service_1793035359071.jpg',
    address: 'Blue Area Commercial Hub, Islamabad',
    walletBalance: 9800,
    status: 'active',
    joinedDate: '2025-05-12',
    providerCategory: 'delivery_courier',
    vehicleType: 'Express 125cc Motorbike',
    rating: 4.92,
    completedJobsCount: 524,
    isOnline: true
  },
  {
    id: 'usr-admin-1',
    name: 'Zubair Tariq',
    email: 'admin@omniserve.com',
    phone: '+92 300 0009988',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    walletBalance: 125000,
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
    icon: 'Fan'
  },
  {
    id: 'srv-electrician',
    name: 'Certified Electrician',
    category: 'Electrical Work',
    basePrice: 1200,
    estimatedDuration: '45 - 60 mins',
    description: 'Short circuit diagnosis, DB breaker replacement, UPS & inverter installation, and smart switch wiring.',
    popularIssues: ['Circuit breaker tripping', 'Socket / switch sparked', 'Ceiling fan installation', 'UPS inverter bypass wiring', 'Full house wiring check'],
    icon: 'Zap'
  },
  {
    id: 'srv-plumbing',
    name: 'Emergency Plumbing Solutions',
    category: 'Sanitary & Water',
    basePrice: 1400,
    estimatedDuration: '45 - 90 mins',
    description: 'Water pump repair, high-pressure pipe leak fixing, sanitary fittings, geyser installation, and drain unclogging.',
    popularIssues: ['Water pump not pulling', 'Underground pipe leak', 'Blocked kitchen / bathroom drain', 'Geyser thermostat replacement', 'Mixer tap fixing'],
    icon: 'Wrench'
  },
  {
    id: 'srv-cleaning',
    name: 'Deep Home & Sofa Cleaning',
    category: 'Sanitization & Cleaning',
    basePrice: 2800,
    estimatedDuration: '2 - 3 hours',
    description: 'Professional steam extraction cleaning for sofas, carpets, kitchen degreasing, and complete floor sanitization.',
    popularIssues: ['5-seater sofa shampooing', 'Deep kitchen degreasing', 'Washroom descaling & polish', 'Full apartment move-in clean', 'Mattress allergen removal'],
    icon: 'Sparkles'
  },
  {
    id: 'srv-appliances',
    name: 'Home Appliance Doctor',
    category: 'Major Appliances',
    basePrice: 1600,
    estimatedDuration: '60 mins',
    description: 'Repair for refrigerators, automatic washing machines, microwave ovens, and water dispensers.',
    popularIssues: ['Refrigerator not freezing', 'Washing machine spin error', 'Microwave not heating', 'Dispenser cooling stopped'],
    icon: 'Cpu'
  },
  {
    id: 'srv-carpentry',
    name: 'Woodwork & Locksmith',
    category: 'Carpentry',
    basePrice: 1300,
    estimatedDuration: '60 mins',
    description: 'Door lock replacement, wardrobe sliding hinge repairs, furniture assembly, and wooden polish touchups.',
    popularIssues: ['Door lock jammed', 'Cabinet hinge loose', 'IKEA/Flatpack furniture assembly', 'Bed frame reinforcement'],
    icon: 'Hammer'
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
    icon: 'Truck'
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
    icon: 'Truck'
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
    icon: 'Truck'
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
    icon: 'Truck'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'OS-9104',
    category: 'home_services',
    customerId: 'usr-customer-1',
    customerName: 'Ahmed Khan',
    customerPhone: '+92 300 1234567',
    deliveryAddress: 'House 42, Street 7, Sector F-8/2, Islamabad',
    status: 'work_started',
    createdAt: '2026-10-26T09:15:00Z',
    updatedAt: '2026-10-26T09:55:00Z',
    serviceDetails: {
      serviceId: 'srv-ac-repair',
      serviceName: 'AC Master Service & Repair',
      category: 'HVAC & Cooling',
      issueDescription: 'Master bedroom split AC not throwing cold air and slight water dripping from indoor unit.',
      selectedIssues: ['Not cooling properly', 'Water leakage / dripping'],
      scheduledDate: 'Today (Immediate)',
      scheduledTimeSlot: '10:00 AM - 12:00 PM',
      serviceAddress: 'House 42, Street 7, Sector F-8/2, Islamabad'
    },
    pricing: {
      baseFee: 1800,
      serviceOrDeliveryFee: 400,
      itemOrDistanceBudget: 0,
      helperFee: 0,
      platformFee: 150,
      total: 2350
    },
    paymentMethod: 'jazzcash',
    paymentStatus: 'paid',
    assignedProviderId: 'usr-provider-tech',
    assignedProviderName: 'Sarah Jenkins',
    assignedProviderPhone: '+92 321 9876543',
    assignedProviderAvatar: '/src/assets/images/app_avatar_provider_1793035360068.jpg',
    assignedProviderRating: 4.9,
    etaMinutes: 20,
    currentStepIndex: 2,
    timeline: [
      { status: 'pending', label: 'Booking Received', timestamp: '09:15 AM', note: 'Customer booked AC Master Service' },
      { status: 'assigned', label: 'Sarah Jenkins Assigned', timestamp: '09:22 AM', note: 'Technician accepted with diagnostic kit' },
      { status: 'work_started', label: 'Diagnostic & Chemical Wash in Progress', timestamp: '09:50 AM', note: 'Technician on-site testing coil pressure' }
    ]
  },
  {
    id: 'OS-9102',
    category: 'custom_delivery',
    customerId: 'usr-customer-1',
    customerName: 'Ahmed Khan',
    customerPhone: '+92 300 1234567',
    deliveryAddress: 'House 42, Street 7, Sector F-8/2, Islamabad',
    status: 'on_the_way',
    createdAt: '2026-10-26T08:30:00Z',
    updatedAt: '2026-10-26T09:40:00Z',
    deliveryDetails: {
      itemName: '2x Panadol Extra, 1x Betadine liquid, 1x Sterile Cotton Roll 100g',
      estimatedBudget: 850,
      storeName: 'Shaheen Chemist & Superstore (F-6 Super Market)',
      pickupAddress: 'Block 14, Super Market, F-6, Islamabad',
      deliveryAddress: 'House 42, Street 7, Sector F-8/2, Islamabad',
      notes: 'Please check expiry dates and collect original printed receipt from store.',
      isUrgent: true
    },
    pricing: {
      baseFee: 250,
      serviceOrDeliveryFee: 150,
      itemOrDistanceBudget: 850,
      helperFee: 0,
      platformFee: 50,
      total: 1300
    },
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    assignedProviderId: 'usr-provider-courier',
    assignedProviderName: 'Bilal Vance',
    assignedProviderPhone: '+92 312 5550192',
    assignedProviderAvatar: '/src/assets/images/hero_delivery_service_1793035359071.jpg',
    assignedProviderRating: 4.92,
    etaMinutes: 12,
    currentStepIndex: 2,
    timeline: [
      { status: 'pending', label: 'Order Broadcasted', timestamp: '08:30 AM', note: 'Store delivery request created' },
      { status: 'assigned', label: 'Courier Bilal Vance Dispatched', timestamp: '08:35 AM', note: 'Rider en route to Shaheen Chemist' },
      { status: 'on_the_way', label: 'Items Purchased & On The Way', timestamp: '09:30 AM', note: 'Items verified against customer list' }
    ]
  },
  {
    id: 'OS-9088',
    category: 'transport_cargo',
    customerId: 'usr-customer-1',
    customerName: 'Ahmed Khan',
    customerPhone: '+92 300 1234567',
    deliveryAddress: 'Plot 18, Commercial Broadway, DHA Phase 2, Islamabad',
    status: 'completed',
    createdAt: '2026-10-25T14:00:00Z',
    updatedAt: '2026-10-25T16:20:00Z',
    transportDetails: {
      vehicleId: 'veh-mini-pickup',
      vehicleName: 'Mini Pickup (Suzuki Bolan / Ravi)',
      pickupLocation: 'Furniture Market, Golra Road, H-13, Islamabad',
      dropoffLocation: 'Plot 18, Commercial Broadway, DHA Phase 2, Islamabad',
      estimatedDistanceKm: 18,
      cargoDescription: '1x Solid Oak Dining Table with 6 Chairs and 1 Display Sideboard',
      loadWeightKg: 420,
      needsHelper: true,
      helperCount: 1
    },
    pricing: {
      baseFee: 1200,
      serviceOrDeliveryFee: 1350,
      itemOrDistanceBudget: 0,
      helperFee: 500,
      platformFee: 150,
      total: 3200
    },
    paymentMethod: 'easypaisa',
    paymentStatus: 'paid',
    assignedProviderId: 'usr-provider-driver',
    assignedProviderName: 'Tariq Mehmood',
    assignedProviderPhone: '+92 333 4567890',
    assignedProviderAvatar: '/src/assets/images/transport_cargo_vehicle_1793035359966.jpg',
    assignedProviderRating: 4.85,
    currentStepIndex: 4,
    timeline: [
      { status: 'pending', label: 'Booking Placed', timestamp: '02:00 PM', note: 'Transport request registered' },
      { status: 'assigned', label: 'Driver Tariq Confirmed', timestamp: '02:10 PM', note: 'Suzuki Mini-Pickup assigned' },
      { status: 'on_the_way', label: 'Goods Loaded & Transit Started', timestamp: '02:50 PM', note: 'Securely tied with cargo ropes' },
      { status: 'completed', label: 'Delivered and Unloaded', timestamp: '04:15 PM', note: 'Delivered in mint condition' }
    ],
    review: {
      rating: 5,
      comment: 'Tariq and his helper were extremely courteous and took immense care while moving our fragile wooden dining set. Highly recommended!',
      tags: ['Careful Handling', 'Punctual', 'Great Equipment'],
      reviewedAt: '2026-10-25T16:30:00Z'
    }
  },
  {
    id: 'OS-9108',
    category: 'custom_delivery',
    customerId: 'usr-customer-1',
    customerName: 'Ahmed Khan',
    customerPhone: '+92 300 1234567',
    deliveryAddress: 'House 42, Street 7, Sector F-8/2, Islamabad',
    status: 'pending',
    createdAt: '2026-10-26T10:10:00Z',
    updatedAt: '2026-10-26T10:10:00Z',
    deliveryDetails: {
      itemName: 'Hot Garlic Naan (5 pcs) and Chicken Karahi half from Tehzeeb Bakers & BBQ',
      estimatedBudget: 1650,
      storeName: 'Tehzeeb Foods, Blue Area',
      pickupAddress: 'Blue Area Jinnah Avenue, Islamabad',
      deliveryAddress: 'House 42, Street 7, Sector F-8/2, Islamabad',
      notes: 'Keep food in thermal bag so it stays piping hot please.',
      isUrgent: false
    },
    pricing: {
      baseFee: 200,
      serviceOrDeliveryFee: 150,
      itemOrDistanceBudget: 1650,
      helperFee: 0,
      platformFee: 50,
      total: 2050
    },
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    etaMinutes: 35,
    currentStepIndex: 0,
    timeline: [
      { status: 'pending', label: 'Broadcasted to Nearby Couriers', timestamp: '10:10 AM', note: 'Looking for available riders' }
    ]
  }
];

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
  getUsers: (): User[] => {
    return loadFromStorage<User[]>(STORAGE_KEY_USERS, INITIAL_USERS);
  },

  getCurrentUser: (): User => {
    const defaultUser = INITIAL_USERS[0]; // Ahmed Khan
    return loadFromStorage<User>(STORAGE_KEY_CURRENT_USER, defaultUser);
  },

  setCurrentUser: (user: User) => {
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
    notifyStoreChanged();
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
      if (current.id === updatedUser.id) {
        saveToStorage(STORAGE_KEY_CURRENT_USER, updatedUser);
      }
      notifyStoreChanged();
    }
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

  resetToDemoData: () => {
    saveToStorage(STORAGE_KEY_USERS, INITIAL_USERS);
    saveToStorage(STORAGE_KEY_SERVICES, INITIAL_SERVICES);
    saveToStorage(STORAGE_KEY_VEHICLES, INITIAL_VEHICLES);
    saveToStorage(STORAGE_KEY_ORDERS, INITIAL_ORDERS);
    saveToStorage(STORAGE_KEY_CURRENT_USER, INITIAL_USERS[0]);
    notifyStoreChanged();
  }
};
