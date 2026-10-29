export type UserRole = 'customer' | 'provider' | 'admin';

export type ProviderCategory = 'delivery_courier' | 'home_technician' | 'cargo_driver';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  password?: string;
  avatar: string;
  address?: string;
  walletBalance: number;
  status: 'active' | 'pending' | 'blocked' | 'suspended';
  isDeleted?: boolean;
  cnic?: string;
  notes?: string;
  joinedDate: string;
  // Provider specific fields
  providerCategory?: ProviderCategory;
  serviceSkill?: string;
  vehicleType?: string;
  rating?: number;
  completedJobsCount?: number;
  isOnline?: boolean;
}

export interface SystemSettings {
  deliveryBaseFee: number;
  deliveryPerKmFee: number;
  deliveryUrgentFee: number;
  technicianVisitingFee: number;
  technicianHourlyRate: number;
  platformCommissionRate: number; // percentage (e.g. 15%)
  platformFixedFee: number;
  whatsappSupportPhone: string;
  whatsappDefaultMessage: string;
  supportHelpline: string;
}


export type OrderCategory = 'custom_delivery' | 'home_services' | 'transport_cargo';

export type OrderStatus = 'pending' | 'assigned' | 'on_the_way' | 'work_started' | 'completed' | 'cancelled';

export type PaymentMethod = 'cod' | 'jazzcash' | 'easypaisa' | 'bank_transfer' | 'card';

export interface OrderTimelineEvent {
  status: OrderStatus;
  label: string;
  timestamp: string;
  note?: string;
}

export interface CustomDeliveryDetails {
  itemName: string;
  estimatedBudget: number;
  storeName: string;
  pickupAddress: string;
  deliveryAddress: string;
  notes: string;
  isUrgent: boolean;
}

export interface HomeServiceDetails {
  serviceId: string;
  serviceName: string;
  category: string;
  issueDescription: string;
  selectedIssues: string[];
  scheduledDate: string;
  scheduledTimeSlot: string;
  serviceAddress: string;
  notes?: string;
}

export interface TransportDetails {
  vehicleId: string;
  vehicleName: string;
  pickupLocation: string;
  dropoffLocation: string;
  estimatedDistanceKm: number;
  cargoDescription: string;
  loadWeightKg: number;
  needsHelper: boolean;
  helperCount: number;
}

export interface OrderPricing {
  baseFee: number;
  serviceOrDeliveryFee: number;
  itemOrDistanceBudget: number;
  helperFee: number;
  platformFee: number;
  total: number;
}

export interface OrderReview {
  rating: number; // 1-5
  comment: string;
  tags?: string[];
  reviewedAt: string;
}

export interface Order {
  id: string; // e.g. OS-8021
  category: OrderCategory;
  customerId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  
  // Specific details based on category
  deliveryDetails?: CustomDeliveryDetails;
  serviceDetails?: HomeServiceDetails;
  transportDetails?: TransportDetails;
  
  // Pricing and payment
  pricing: OrderPricing;
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'paid';
  
  // Assigned Provider
  assignedProviderId?: string;
  assignedProviderName?: string;
  assignedProviderPhone?: string;
  assignedProviderAvatar?: string;
  assignedProviderRating?: number;
  
  // Real-time tracking simulation
  timeline: OrderTimelineEvent[];
  etaMinutes?: number;
  currentStepIndex: number; // 0 to 4
  
  // Feedback
  review?: OrderReview;
}

export interface HomeServiceItem {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  estimatedDuration: string;
  description: string;
  popularIssues: string[];
  icon: string;
  assignedProviderId?: string;
  assignedProviderName?: string;
  isPublished?: boolean;
}

export interface TransportVehicleItem {
  id: string;
  name: string;
  capacityKg: number;
  dimensions: string;
  baseFare: number;
  perKmRate: number;
  helperRate: number;
  bestFor: string;
  icon: string;
  assignedProviderId?: string;
  assignedProviderName?: string;
  isPublished?: boolean;
}
