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
    langSwitch: 'اردو',

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
    appName: 'خانیوال کنیکٹ',
    appSlogan: 'خانیوال سٹی اور قریبی علاقوں کا نمبر 1 آن ڈیمانڈ سپر ایپ',
    home: 'ہوم',
    services: 'گھریلو سروسز',
    vehicles: 'ٹرانسپورٹ و کارگو',
    orderAnything: 'خانیوال سے کچھ بھی منگوائیں',
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

    heroBadge: '⚡ خانیوال سٹی اور ملحقہ تحصیلوں میں فوری سروسز',
    heroTitle: 'خانیوال سے کوئی بھی چیز منگوائیں، ہوم سروس لیں یا کارگو گاڑی بک کریں',
    heroSubtitle: 'خانیوال کی کسی بھی دکان یا مارکیٹ (ریلوے روڈ، ایوب میڈیکل، بلاک 1 تا 15، پیپلز کالونی) سے خریداری، مستند اے سی و الیکٹریشن ٹیکنیشنز، یا سامان کی شفٹنگ کے لیے لوڈر رکشہ اور شاہ زور ٹرک — لائیو ٹریکنگ کے ساتھ۔',
    heroCtaOrder: 'خانیوال سے سامان منگوائیں',
    heroCtaServices: 'مقامی سروسز دیکھیں',
    heroCtaJoinProvider: 'بطور ورکر یا ڈرائیور شامل ہوں',

    catDeliveryTitle: 'خانیوال میں کچھ بھی خریدیں اور منگوائیں',
    catDeliveryDesc: 'دوائی، راشن، پرزہ جات یا کوئی بھی ضروری سامان خانیوال کی کسی بھی دکان سے خرید کر آپ کی دہلیز تک چند منٹوں میں پہنچایا جاتا ہے۔',
    catDeliveryBtn: 'سامان منگوائیں',
    catDeliveryBadge: 'فوری رائیڈر ترسیل',

    catServicesTitle: 'ماہر گھریلو سروسز و مرمت (خانیوال)',
    catServicesDesc: 'اے سی ماسٹر کیمیکل سروس، گیس چارجنگ، شارٹ سرکٹ فالٹ، پلمبنگ اور صوفہ و گھر کی گہری صفائی خانیوال کے تصدیق شدہ ماہرین کے ذریعے۔',
    catServicesBtn: 'خانیوال ٹیکنیشن بلائیں',
    catServicesBadge: 'مقررہ ریٹ اور گارنٹی',

    catTransportTitle: 'کارگو و سامان شفٹنگ گاڑی (خانیوال)',
    catTransportDesc: 'گھر کا سامان، فصلیں، فیکٹری میٹریل یا سامان خانیوال، کبیروالہ، میاں چنوں اور جہانیاں میں شفٹ کرنے کے لیے لوڈر رکشہ، سوزوکی پک اپ اور شاہ زور ٹرک فوری بک کریں۔',
    catTransportBtn: 'گاڑی بک کریں',
    catTransportBadge: 'کفایتی فی کلومیٹر ریٹ',

    featuredServicesTitle: 'خانیوال کی مقبول ترین گھریلو سروسز',
    featuredServicesSub: 'شفاف ریٹ لسٹ اور 7 دن کی تسلی بخش کام کی وارنٹی کے ساتھ۔',
    vehiclesTitle: 'دستیاب خانیوال کارگو اور ٹرانسپورٹ گاڑیاں',
    vehiclesSub: 'چھوٹے پارسل سے لے کر پورے گھر کے سامان کی خانیوال اور آس پاس محفوظ منتقلی۔',
    howItWorksTitle: 'خانیوال کنیکٹ کیسے کام کرتا ہے؟',
    howItWorksSub: 'صرف ایک منٹ میں بکنگ اور موبائل پر لائیو لوکیشن ٹریکنگ۔',

    trustSafePay: 'سیف پے محفوظ ادائیگی',
    trustSafePayDesc: 'آپ کی رقم مکمل اطمینان اور کام کے اختتام تک محفوظ رہتی ہے۔',
    trustVerified: 'شناختی کارڈ سے تصدیق شدہ خانیوال ورکرز',
    trustVerifiedDesc: 'تمام رائیڈرز، ٹیکنیشنز اور ڈرائیورز نادرا اور پولیس ویریفائیڈ ہوتے ہیں۔',
    trustInstant: 'لائیو ریئل ٹائم ٹریکنگ',
    trustInstantDesc: 'اپنے رائیڈر یا گاڑی کو لائیو میپ پر آتا دیکھیں اور ہر مرحلے کی اطلاع حاصل کریں۔',
    trustSupport: '24/7 خانیوال ہیلپ لائن',
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
