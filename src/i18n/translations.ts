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
    appName: 'OmniServe',
    appSlogan: "Pakistan's Premier Multi-Service On-Demand Platform",
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
    providerPortal: 'Provider Dashboard',
    adminPortal: 'Admin Control Panel',
    langSwitch: 'اردو',

    heroBadge: '⚡ Instant On-Demand Super App across Pakistan',
    heroTitle: 'Order Anything, Book Home Repairs & Rent Cargo Transport',
    heroSubtitle: 'Buy from any local shop, get certified technicians (AC, Electrician, Plumber), or rent cargo loaders with live GPS tracking and verified pricing.',
    heroCtaOrder: 'Order Anything Now',
    heroCtaServices: 'Explore Services',
    heroCtaJoinProvider: 'Become a Partner / Driver',

    catDeliveryTitle: 'Buy & Deliver Anything',
    catDeliveryDesc: 'Need medicine, groceries, spare parts, or forgotten documents? Tell our rider what to buy from any store and deliver to your doorstep.',
    catDeliveryBtn: 'Order Item Delivery',
    catDeliveryBadge: 'Instant Rider Dispatch',

    catServicesTitle: 'Certified Home Services',
    catServicesDesc: 'Professional AC chemical wash, gas refill, short-circuit wiring, emergency plumbing, and deep home cleaning by background-checked pros.',
    catServicesBtn: 'Book Technician',
    catServicesBadge: 'Fixed Rates & Warranty',

    catTransportTitle: 'Rent Transport & Cargo',
    catTransportDesc: 'House shifting, heavy cargo, commercial goods? Book Loader Rickshaws, Suzuki Bolan Pickups, or Shahzore Trucks on demand.',
    catTransportBtn: 'Book Transport Vehicle',
    catTransportBadge: 'Fair Distance Rates',

    featuredServicesTitle: 'Popular Home & Repair Services',
    featuredServicesSub: 'Transparent upfront pricing with 7-day workmanship guarantee.',
    vehiclesTitle: 'Available Cargo & Transport Fleet',
    vehiclesSub: 'From small boxes to full house luggage shifting across your city.',
    howItWorksTitle: 'How OmniServe Works',
    howItWorksSub: 'Book in 60 seconds with reliable real-time tracking.',

    trustSafePay: 'OmniServe SafePay',
    trustSafePayDesc: 'Funds are held securely until the delivery or job is 100% completed to your satisfaction.',
    trustVerified: 'CNIC Verified Pros',
    trustVerifiedDesc: 'All technicians, riders, and drivers undergo national identity and background vetting.',
    trustInstant: 'Live Real-Time Tracking',
    trustInstantDesc: 'Watch your rider or technician on the map with step-by-step status notifications.',
    trustSupport: '24/7 Helpline',
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
    appName: 'اومنی سروس',
    appSlogan: 'پاکستان کا سب سے بڑا ملٹی سروس آن ڈیمانڈ پلیٹ فارم',
    home: 'ہوم',
    services: 'گھریلو سروسز',
    vehicles: 'ٹرانسپورٹ و کارگو',
    orderAnything: 'کوئی بھی چیز منگوائیں',
    homeServices: 'گھریلو مرمت و سروسز',
    transportCargo: 'گاڑی یا لوڈر بک کریں',
    trackOrder: 'آرڈر ٹریک کریں',
    myOrders: 'میرے آرڈرز',
    login: 'لاگ ان کریں',
    signup: 'اکاؤنٹ بنائیں',
    logout: 'لاگ آؤٹ',
    customerPortal: 'کسٹمر پورٹل',
    providerPortal: 'ورکر / ڈرائیور ڈیش بورڈ',
    adminPortal: 'ایڈمن کنٹرول پینل',
    langSwitch: 'English',

    heroBadge: '⚡ پاکستان بھر میں فوری ڈیلیوری اور مصدقہ سروسز',
    heroTitle: 'کوئی بھی چیز منگوائیں، ہوم سروس لیں یا کارگو گاڑی بک کریں',
    heroSubtitle: 'کسی بھی قریبی دکان یا مارکیٹ سے خریداری، مستند اے سی و الیکٹریشن ٹیکنیشنز، یا سامان کی شفٹنگ کے لیے لوڈر رکشہ اور ٹرک — لائیو ٹریکنگ اور محفوظ ادائیگی کے ساتھ۔',
    heroCtaOrder: 'ابھی سامان منگوائیں',
    heroCtaServices: 'سروسز دیکھیں',
    heroCtaJoinProvider: 'بطور ورکر یا ڈرائیور شامل ہوں',

    catDeliveryTitle: 'کوئی بھی چیز خریدیں اور ڈیلیور کروائیں',
    catDeliveryDesc: 'دوائی، راشن، پرزہ جات یا کوئی بھی ضروری سامان کسی بھی دکان سے خرید کر آپ کی دہلیز تک چند منٹوں میں پہنچایا جاتا ہے۔',
    catDeliveryBtn: 'سامان منگوائیں',
    catDeliveryBadge: 'فوری رائیڈر ترسیل',

    catServicesTitle: 'ماہر گھریلو سروسز و مرمت',
    catServicesDesc: 'اے سی ماسٹر کیمیکل سروس، گیس چارجنگ، شارٹ سرکٹ فالٹ، پلمبنگ اور صوفہ و گھر کی گہری صفائی تصدیق شدہ ماہرین کے ذریعے۔',
    catServicesBtn: 'ٹیکنیشن بلائیں',
    catServicesBadge: 'مقررہ ریٹ اور گارنٹی',

    catTransportTitle: 'کارگو و سامان شفٹنگ گاڑی',
    catTransportDesc: 'گھر کا سامان، فیکٹری میٹریل یا بھاری سامان شفٹ کرنے کے لیے لوڈر رکشہ، سوزوکی پک اپ اور شاہ زور ٹرک فوری بک کریں۔',
    catTransportBtn: 'گاڑی بک کریں',
    catTransportBadge: 'کفایتی فی کلومیٹر ریٹ',

    featuredServicesTitle: 'مقبول ترین گھریلو سروسز',
    featuredServicesSub: 'شفاف ریٹ لسٹ اور 7 دن کی تسلی بخش کام کی وارنٹی کے ساتھ۔',
    vehiclesTitle: 'دستیاب کارگو اور ٹرانسپورٹ گاڑیاں',
    vehiclesSub: 'چھوٹے پارسل سے لے کر پورے گھر کے سامان کی محفوظ اور بروقت منتقلی۔',
    howItWorksTitle: 'اومنی سروس کیسے کام کرتی ہے؟',
    howItWorksSub: 'صرف ایک منٹ میں بکنگ اور موبائل پر لائیو لوکیشن ٹریکنگ۔',

    trustSafePay: 'سیف پے محفوظ ادائیگی',
    trustSafePayDesc: 'آپ کی رقم مکمل اطمینان اور کام کے اختتام تک محفوظ رہتی ہے۔',
    trustVerified: 'شناختی کارڈ سے تصدیق شدہ ورکرز',
    trustVerifiedDesc: 'تمام رائیڈرز، ٹیکنیشنز اور ڈرائیورز نادرا اور پولیس ویریفائیڈ ہوتے ہیں۔',
    trustInstant: 'لائیو ریئل ٹائم ٹریکنگ',
    trustInstantDesc: 'اپنے رائیڈر یا گاڑی کو لائیو میپ پر آتا دیکھیں اور ہر مرحلے کی اطلاع حاصل کریں۔',
    trustSupport: '24/7 اردو اور انگلش ہیلپ لائن',
    trustSupportDesc: 'کسی بھی مسئلے کی صورت میں ہماری مقامی سپورٹ ٹیم فوری مدد کے لیے تیار ہے۔',

    orderNow: 'ابھی آرڈر کریں',
    bookNow: 'سروس بک کریں',
    rentVehicle: 'گاڑی بک کریں',
    currency: 'روپے',
    loginRequiredNotice: 'لاگ ان یا اکاؤنٹ بنانا ضروری ہے',
    loginRequiredDesc: 'سروس بک کرنے، رائیڈر کے ساتھ رابطہ کرنے اور لائیو ٹریکنگ کے لیے برائے مہربانی لاگ ان کریں یا مفت اکاؤنٹ بنائیں۔',
    or: 'یا',

    loginTab: 'لاگ ان کریں',
    registerCustomerTab: 'نیا کسٹمر اکاؤنٹ بنائیں',
    registerProviderTab: 'بطور ورکر / ڈرائیور رجسٹر ہوں',
    emailOrPhone: 'ای میل ایڈریس یا موبائل نمبر',
    password: 'پاس ورڈ',
    fullName: 'مکمل نام',
    emailAddress: 'ای میل ایڈریس',
    mobilePhone: 'موبائل فون نمبر (+92 3xx xxx xxxx)',
    cnicNumber: 'قومی شناختی کارڈ نمبر (مثلاً 1-1234567-61101)',
    serviceCategory: 'آپ کا ہنر یا شعبہ',
    vehicleType: 'گاڑی کی قسم (اگر ڈرائیور ہیں)',
    deliveryAddress: 'گھر یا کام کا پتہ',
    city: 'شہر (اسلام آباد، راولپنڈی، لاہور، کراچی وغیرہ)',
    createAccountBtn: 'کسٹمر اکاؤنٹ بنائیں',
    loginBtn: 'اکاؤنٹ میں داخل ہوں',
    registerAsProviderBtn: 'پرووائیڈر اکاؤنٹ رجسٹر کریں',
    haveAccount: 'پہلے سے اکاؤنٹ موجود ہے؟',
    noAccount: 'اکاؤنٹ نہیں ہے؟',
    loginSuccess: 'خوش آمدید! آپ کامیابی سے لاگ ان ہو چکے ہیں۔',
    logoutSuccess: 'آپ لاگ آؤٹ ہو چکے ہیں۔',
    welcomeBack: 'خوش آمدید',

    statusPending: 'تصدیق کا انتظار (زیرِ التواء)',
    statusAssigned: 'ورکر تفویض ہو گیا',
    statusOnTheWay: 'راستے میں ہے',
    statusWorkStarted: 'کام شروع / خریداری مکمل',
    statusCompleted: 'کامیابی سے مکمل',
    statusCancelled: 'منسوخ شدہ',

    cod: 'کیش آن ڈیلیوری (Cash on Delivery)',
    jazzcash: 'جاز کیش (JazzCash)',
    easypaisa: 'ایزی پیسہ (EasyPaisa)',
    bankTransfer: 'راست / بینک ٹرانسفر (Raast Transfer)'
  }
};
