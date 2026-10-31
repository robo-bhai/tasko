export type Language = 'en' | 'ur';

export interface Translations {
  appName: string;
  appSlogan: string;
  home: string;
  services: string;
  vehicles: string;
  orderAnything: string;
  homeServices: string;
  transportCargo: string;
  trackOrder: string;
  myOrders: string;
  login: string;
  signup: string;
  logout: string;
  customerPortal: string;
  providerPortal: string;
  adminPortal: string;
  langSwitch: string;
  
  // Hero
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCtaOrder: string;
  heroCtaServices: string;
  heroCtaJoinProvider: string;
  
  // 3 Primary categories
  catDeliveryTitle: string;
  catDeliveryDesc: string;
  catDeliveryBtn: string;
  catDeliveryBadge: string;

  catServicesTitle: string;
  catServicesDesc: string;
  catServicesBtn: string;
  catServicesBadge: string;

  catTransportTitle: string;
  catTransportDesc: string;
  catTransportBtn: string;
  catTransportBadge: string;

  // Sections
  featuredServicesTitle: string;
  featuredServicesSub: string;
  vehiclesTitle: string;
  vehiclesSub: string;
  howItWorksTitle: string;
  howItWorksSub: string;
  
  // Trust
  trustSafePay: string;
  trustSafePayDesc: string;
  trustVerified: string;
  trustVerifiedDesc: string;
  trustInstant: string;
  trustInstantDesc: string;
  trustSupport: string;
  trustSupportDesc: string;
  
  // Modals & Forms
  orderNow: string;
  bookNow: string;
  rentVehicle: string;
  currency: string;
  loginRequiredNotice: string;
  loginRequiredDesc: string;
  or: string;
  
  // Auth
  loginTab: string;
  registerCustomerTab: string;
  registerProviderTab: string;
  emailOrPhone: string;
  password: string;
  fullName: string;
  emailAddress: string;
  mobilePhone: string;
  cnicNumber: string;
  serviceCategory: string;
  vehicleType: string;
  deliveryAddress: string;
  city: string;
  createAccountBtn: string;
  loginBtn: string;
  registerAsProviderBtn: string;
  haveAccount: string;
  noAccount: string;
  loginSuccess: string;
  logoutSuccess: string;
  welcomeBack: string;

  // Order status
  statusPending: string;
  statusAssigned: string;
  statusOnTheWay: string;
  statusWorkStarted: string;
  statusCompleted: string;
  statusCancelled: string;

  // Payments
  cod: string;
  jazzcash: string;
  easypaisa: string;
  bankTransfer: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    appName: 'Khanewal Connect',
    appSlogan: 'Khanewal City & Surrounding Areas #1 On-Demand Super App',
    home: 'Home',
    services: 'Home Services',
    vehicles: 'Transport & Cargo',
    orderAnything: 'Order Anything',
    homeServices: 'Home Services',
    transportCargo: 'Transport & Cargo',
    trackOrder: 'Track Order',
    myOrders: 'My Orders',
    login: 'Sign In',
    signup: 'Create Account',
    logout: 'Sign Out',
    customerPortal: 'Customer View',
    providerPortal: 'Worker / Driver Portal',
    adminPortal: 'Admin Control Panel',
    langSwitch: 'Roman Urdu',

    heroBadge: '⚡ Khanewal City & Tehsils Instant On-Demand Super App',
    heroTitle: 'Order Anything, Book Home Repairs & Rent Cargo in Khanewal',
    heroSubtitle: 'Buy from any shop across Khanewal (Railway Road, Ayub Medical, Block 1-15), hire certified local technicians (AC, Electrician, Plumber), or rent cargo loaders with live tracking.',
    heroCtaOrder: 'Order Anything in Khanewal',
    heroCtaServices: 'Explore Local Services',
    heroCtaJoinProvider: 'Register as Khanewal Partner / Driver',

    catDeliveryTitle: 'Buy & Deliver Anything in Khanewal',
    catDeliveryDesc: 'Need medicines, groceries, hardware, or parcels from any Khanewal store? Our verified rider buys it and delivers straight to your doorstep.',
    catDeliveryBtn: 'Order Item Delivery',
    catDeliveryBadge: 'Instant Rider Dispatch',

    catServicesTitle: 'Certified Home Services (Khanewal)',
    catServicesDesc: 'Professional AC chemical wash, gas refill, short-circuit wiring, emergency plumbing, and deep home cleaning by vetted Khanewal technicians.',
    catServicesBtn: 'Book Local Technician',
    catServicesBadge: 'Fixed Rates & Warranty',

    catTransportTitle: 'Rent Transport & Cargo (Khanewal)',
    catTransportDesc: 'House shifting, market goods, or agriculture cargo? Book Loader Rickshaws, Suzuki Bolan Pickups, or Shahzore Trucks across Khanewal and nearby tehsils.',
    catTransportBtn: 'Book Cargo Vehicle',
    catTransportBadge: 'Fair Distance Rates',

    featuredServicesTitle: 'Popular Khanewal Home & Repair Services',
    featuredServicesSub: 'Transparent upfront pricing with 7-day workmanship guarantee.',
    vehiclesTitle: 'Available Khanewal Cargo & Transport Fleet',
    vehiclesSub: 'From small boxes to full house shifting across Khanewal, Kabirwala, Mian Channu & Jahanian.',
    howItWorksTitle: 'How Khanewal Connect Works',
    howItWorksSub: 'Book in 60 seconds with reliable real-time tracking.',

    trustSafePay: 'Khanewal SafePay Escrow',
    trustSafePayDesc: 'Funds are held securely until the delivery or job is 100% completed to your satisfaction.',
    trustVerified: 'CNIC Verified Khanewal Pros',
    trustVerifiedDesc: 'All technicians, riders, and drivers undergo national identity and background vetting.',
    trustInstant: 'Live Real-Time Tracking',
    trustInstantDesc: 'Watch your rider or technician arrive with step-by-step status notifications.',
    trustSupport: '24/7 Khanewal Helpline',
    trustSupportDesc: 'Local customer care in Urdu & English ready to assist whenever you need.',

    orderNow: 'Order Now',
    bookNow: 'Book Service',
    rentVehicle: 'Rent Vehicle',
    currency: 'PKR',
    loginRequiredNotice: 'Sign In Required',
    loginRequiredDesc: 'Please sign in or create a free account to book this service and track your order in real-time.',
    or: 'or',

    loginTab: 'Sign In',
    registerCustomerTab: 'Customer Sign Up',
    registerProviderTab: 'Join as Provider / Driver',
    emailOrPhone: 'Email or Mobile Phone',
    password: 'Password',
    fullName: 'Full Name',
    emailAddress: 'Email Address',
    mobilePhone: 'Mobile Phone (+92 3xx xxx xxxx)',
    cnicNumber: 'CNIC Number (e.g. 61101-1234567-1)',
    serviceCategory: 'Your Profession / Skill',
    vehicleType: 'Vehicle Type (if driver)',
    deliveryAddress: 'Default Address / City Area',
    city: 'City (Karachi, Lahore, Islamabad, etc.)',
    createAccountBtn: 'Create Account',
    loginBtn: 'Sign In to Account',
    registerAsProviderBtn: 'Register as Service Provider',
    haveAccount: 'Already have an account?',
    noAccount: "Don't have an account?",
    loginSuccess: 'Successfully signed in!',
    logoutSuccess: 'Signed out successfully.',
    welcomeBack: 'Welcome back',

    statusPending: 'Pending Confirmation',
    statusAssigned: 'Provider Assigned',
    statusOnTheWay: 'On The Way',
    statusWorkStarted: 'Work Started / Item Purchased',
    statusCompleted: 'Successfully Completed',
    statusCancelled: 'Cancelled',

    cod: 'Cash on Delivery (COD)',
    jazzcash: 'JazzCash Wallet',
    easypaisa: 'EasyPaisa Wallet',
    bankTransfer: 'Raast / Bank Transfer'
  },
  ur: {
    appName: 'Khanewal Connect',
    appSlogan: 'Khanewal City aur qareebi ilaqon ki No. 1 On-Demand Super App',
    home: 'Home',
    services: 'Gharelu Services',
    vehicles: 'Transport & Cargo',
    orderAnything: 'Khanewal se Kuch Bhi Mangwayen',
    homeServices: 'Gharelu Marammat & Services',
    transportCargo: 'Gaari ya Loader Book Karein',
    trackOrder: 'Order Track Karein',
    myOrders: 'Mere Orders',
    login: 'Login Karein',
    signup: 'Account Banayein',
    logout: 'Logout',
    customerPortal: 'Customer View',
    providerPortal: 'Worker / Driver Portal',
    adminPortal: 'Admin Control Panel',
    langSwitch: 'English',

    heroBadge: '⚡ Khanewal City & Tehseelon mein Fauri Services',
    heroTitle: 'Khanewal se koi bhi cheez mangwayen, Home Service lein ya Cargo Gaari book karein',
    heroSubtitle: 'Khanewal ki kisi bhi dukaan ya market (Railway Road, Ayub Medical, Block 1 ta 15, Peoples Colony) se kharidari, certified AC & Electrician technicians, ya saman shifting ke liye loader riksha aur Shahzore truck — live tracking ke sath.',
    heroCtaOrder: 'Khanewal se Saman Mangwayen',
    heroCtaServices: 'Local Services Dekhein',
    heroCtaJoinProvider: 'Bataur Worker ya Driver Shamil Hon',

    catDeliveryTitle: 'Khanewal mein Kuch Bhi Kharidein aur Mangwayen',
    catDeliveryDesc: 'Dawaii, rashan, purzajaat ya koi bhi zaroori saman Khanewal ki kisi bhi dukaan se khareed kar aap ki dehleez tak foran pohnchaya jata hai.',
    catDeliveryBtn: 'Saman Mangwayen',
    catDeliveryBadge: 'Fauri Rider Dispatch',

    catServicesTitle: 'Certified Gharelu Services (Khanewal)',
    catServicesDesc: 'AC master chemical service, gas charging, short-circuit wiring fault, plumbing aur deep cleaning Khanewal ke verified technicians ke zariye.',
    catServicesBtn: 'Khanewal Technician Bulayein',
    catServicesBadge: 'Muqarrar Rate aur Guarantee',

    catTransportTitle: 'Cargo & Saman Shifting Gaari (Khanewal)',
    catTransportDesc: 'Ghar ka saman, faslein ya factory material shift karne ke liye loader riksha, Suzuki pickup aur Shahzore truck foran book karein.',
    catTransportBtn: 'Gaari Book Karein',
    catTransportBadge: 'Kifayati Per KM Rate',

    featuredServicesTitle: 'Khanewal ki Mashhoor Gharelu Services',
    featuredServicesSub: 'Shaffaf rate list aur 7 din ki tasallibaksh kaam ki guarantee ke sath.',
    vehiclesTitle: 'Dastyab Khanewal Cargo & Transport Gaariyan',
    vehiclesSub: 'Chhotay parcel se le kar pooray ghar ke saman ki Khanewal aur aas paas mehfooz muntaqli.',
    howItWorksTitle: 'Khanewal Connect Kaise Kaam Karta Hai?',
    howItWorksSub: 'Sirf 1 minute mein booking aur mobile par live location tracking.',

    trustSafePay: 'SafePay Mehfooz Adaigi',
    trustSafePayDesc: 'Aap ki raqam mukammal itminan aur kaam ke ikhtitam tak mehfooz rehti hai.',
    trustVerified: 'CNIC Verified Khanewal Workers',
    trustVerifiedDesc: 'Tamam riders, technicians aur drivers national identity aur police vetted hain.',
    trustInstant: 'Live Real-Time Tracking',
    trustInstantDesc: 'Apne rider ya technician ko map par live aatay dekhein aur har marhalay ka status payen.',
    trustSupport: '24/7 Khanewal Helpline',
    trustSupportDesc: 'Kisi bhi masle par hamari local support team fauri madad ke liye tayyar hai.',

    orderNow: 'Abhi Order Karein',
    bookNow: 'Service Book Karein',
    rentVehicle: 'Gaari Book Karein',
    currency: 'PKR',
    loginRequiredNotice: 'Login ya Account Banana Zaroori Hai',
    loginRequiredDesc: 'Service book karne, rider se rabta karne aur live tracking ke liye login karein ya free account banayein.',
    or: 'ya',

    loginTab: 'Login Karein',
    registerCustomerTab: 'Naya Customer Account Banayein',
    registerProviderTab: 'Bataur Worker / Driver Join Karein',
    emailOrPhone: 'Email ya Mobile Phone Number',
    password: 'Password',
    fullName: 'Mukammal Naam',
    emailAddress: 'Email Address',
    mobilePhone: 'Mobile Phone (+92 3xx xxx xxxx)',
    cnicNumber: 'CNIC Number (maslan 61101-1234567-1)',
    serviceCategory: 'Aap ka Hunar ya Shoba',
    vehicleType: 'Gaari ki Qisam (agar driver hain)',
    deliveryAddress: 'Delivery Address / Ilaqa',
    city: 'Shehar (Khanewal, Kabirwala, Mian Channu, Jahanian)',
    createAccountBtn: 'Customer Account Banayein',
    loginBtn: 'Account mein Dakhil Hon',
    registerAsProviderBtn: 'Provider Account Banayein',
    haveAccount: 'Pehle se account mojood hai?',
    noAccount: 'Account nahi hai?',
    loginSuccess: 'Khush-Aamdeed! Kamyabi se login ho gaye hain.',
    logoutSuccess: 'Aap logout ho chuke hain.',
    welcomeBack: 'Khush-Aamdeed',

    statusPending: 'Tasdeeq Ka Intezar (Pending)',
    statusAssigned: 'Worker Assign Ho Gaya',
    statusOnTheWay: 'Raastay Mein Hai (On The Way)',
    statusWorkStarted: 'Kaam Shuru / Kharidari Mukammal',
    statusCompleted: 'Kamyabi Se Mukammal',
    statusCancelled: 'Mansookh (Cancelled)',

    cod: 'Cash on Delivery (COD)',
    jazzcash: 'JazzCash Wallet',
    easypaisa: 'EasyPaisa Wallet',
    bankTransfer: 'Raast / Bank Transfer'
  }
};
