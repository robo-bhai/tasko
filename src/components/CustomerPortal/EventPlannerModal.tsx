import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Users, 
  MapPin, 
  Utensils, 
  Sparkles, 
  Music, 
  Camera, 
  Shield, 
  Zap, 
  Clock, 
  CheckCircle2, 
  HeartHandshake, 
  PartyPopper,
  Flame,
  Phone,
  MessageCircle,
  HelpCircle,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { User, EventPlanningDetails, Order } from '../../types';
import { Store } from '../../services/store';

interface EventPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onOrderSuccess: (newOrder: Order) => void;
  isUrdu?: boolean;
}

const KHANEWAL_VENUES = [
  { id: 'royal_palace', name: 'Royal Palace Marquee (Multan Road, Khanewal)' },
  { id: 'garrison', name: 'Garrison Officers Club & Lawn (Cantt Area)' },
  { id: 'green_lagoon', name: 'Green Lagoon Banquet & Marquee' },
  { id: 'al_harmain', name: 'Al-Harmain Marriage Hall (Civil Lines)' },
  { id: 'railway_club', name: 'Railway Officers Club Ground (Railway Road)' },
  { id: 'home_venue', name: 'Ghar ka wasee lawn ya chhat (Private Home Lawn / Roof)' },
  { id: 'private_farmhouse', name: 'Private farmhouse ya khuli jagah (Farmhouse / Ground)' },
  { id: 'custom_venue', name: 'Koi aur makhsoos jagah / hall (Other Venue)' },
  { id: 'need_help', name: 'Admin hamare budget ke mutabiq behtareen hall book karwaye (Admin Suggest Venue)' }
];

const KHANEWAL_AREAS = [
  'Civil Lines, Khanewal',
  'People\'s Colony, Khanewal',
  'Tariqabad & Model Town',
  'Block 1 to 5, Main City',
  'Block 6 to 10, Khanewal',
  'Block 11 to 15, Khanewal',
  'Railway Road & Station Colony',
  'Lahore Mor & Bypass',
  'Multan Road & Stadium Area',
  'Kabirwala Road Area',
  'Jahanian Mor / Kacha Khu nearby'
];

export const EventPlannerModal: React.FC<EventPlannerModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOrderSuccess,
  isUrdu = true
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [eventType, setEventType] = useState('wedding_barat');
  const [eventTitle, setEventTitle] = useState('Shadi o Baarat Taqreeb');
  const [eventDate, setEventDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [eventTimeSlot, setEventTimeSlot] = useState<'day_lunch' | 'evening_dinner' | 'night_party' | 'full_day'>('evening_dinner');
  const [guestCount, setGuestCount] = useState<number>(300);
  
  // Venue State
  const [venueType, setVenueType] = useState<'hall_marquee' | 'home_lawn' | 'farmhouse_ground' | 'need_admin_suggestion'>('hall_marquee');
  const [venueNameOrAddress, setVenueNameOrAddress] = useState('Royal Palace Marquee (Multan Road, Khanewal)');
  const [khanewalArea, setKhanewalArea] = useState('People\'s Colony, Khanewal');

  // Services State
  const [selectedServices, setSelectedServices] = useState<string[]>([
    'catering_food',
    'tentage_shamiana',
    'stage_floral',
    'sound_lighting',
    'waiters_crockery'
  ]);

  // Catering Details
  const [cateringType, setCateringType] = useState<'per_head_buffet' | 'traditional_degain' | 'refreshment_tea' | 'only_setup_no_food'>('traditional_degain');
  const [numberOfDegs, setNumberOfDegs] = useState<number>(10);
  const [menuItemsText, setMenuItemsText] = useState('Beef / Chicken Biryani, Chicken Karahi, Roghni Naan, Raita Salad, Meethay mein Shahi Kheer, Cold Drinks');
  const [tentageThemeColor, setTentageThemeColor] = useState('Shahi Golden aur White VIP Theme (Royal Gold & White)');
  const [soundAndStageReq, setSoundAndStageReq] = useState('Shaandaar Bridal Stage, Sofa style aur Clear Sound');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Budget & Contact
  const [budgetRangePkr, setBudgetRangePkr] = useState<number>(250000);
  const [contactPersonName, setContactPersonName] = useState(currentUser?.name || '');
  const [contactPersonPhone, setContactPersonPhone] = useState(currentUser?.phone || '');
  const [whatsappNumber, setWhatsappNumber] = useState(currentUser?.phone || '');

  if (!isOpen) return null;

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(s => s !== serviceId)
        : [...prev, serviceId]
    );
  };

  const calculateRoughEstimate = () => {
    let est = 0;
    // Catering
    if (selectedServices.includes('catering_food')) {
      if (cateringType === 'per_head_buffet') {
        est += guestCount * 950;
      } else if (cateringType === 'traditional_degain') {
        est += numberOfDegs * 9500;
      } else if (cateringType === 'refreshment_tea') {
        est += guestCount * 350;
      }
    }
    // Tentage & Hall Setup
    if (selectedServices.includes('tentage_shamiana')) {
      est += Math.max(30000, guestCount * 120);
    }
    // Stage & Floral
    if (selectedServices.includes('stage_floral')) {
      est += 25000;
    }
    // Sound & DJ
    if (selectedServices.includes('sound_lighting')) {
      est += 15000;
    }
    // Photography
    if (selectedServices.includes('photography_drone')) {
      est += 25000;
    }
    // Waiters
    if (selectedServices.includes('waiters_crockery')) {
      est += Math.ceil(guestCount / 30) * 1500;
    }
    // Generator
    if (selectedServices.includes('generator_backup')) {
      est += 12000;
    }
    // Security & Valet
    if (selectedServices.includes('valet_security')) {
      est += 10000;
    }
    return Math.max(est, 45000);
  };

  const handleEventTypeSelect = (type: string, title: string) => {
    setEventType(type);
    setEventTitle(title);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setErrorMsg('Bara-e-meherbani event planning ke liye pehle login karein.');
      return;
    }

    if (!contactPersonName.trim() || !contactPersonPhone.trim()) {
      setErrorMsg('Bara-e-meherbani apna naam aur mobile number darj karein.');
      return;
    }

    if (!venueNameOrAddress.trim()) {
      setErrorMsg('Bara-e-meherbani venue ya taqreeb ka pata darj karein.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const estimatedTotal = calculateRoughEstimate();
      const eventDetails: EventPlanningDetails = {
        eventType,
        eventTitle: eventTitle.trim() || 'Shadi o Taqreeb Intezam',
        eventDate,
        eventTimeSlot,
        guestCount: Number(guestCount) || 100,
        venueType,
        venueNameOrAddress: venueNameOrAddress.trim(),
        khanewalArea,
        budgetRangePkr: Number(budgetRangePkr) || estimatedTotal,
        selectedServices,
        cateringType,
        menuDetailsText: menuItemsText.trim(),
        numberOfDegs: cateringType === 'traditional_degain' ? numberOfDegs : undefined,
        tentageThemeColor,
        soundAndStageReq,
        specialInstructions: specialInstructions.trim(),
        contactPersonName: contactPersonName.trim(),
        contactPersonPhone: contactPersonPhone.trim(),
        whatsappNumber: (whatsappNumber.trim() || contactPersonPhone.trim())
      };

      const newOrder = Store.createOrder({
        category: 'event_planning',
        customerId: currentUser.id,
        customerName: contactPersonName.trim(),
        customerPhone: contactPersonPhone.trim(),
        deliveryAddress: `${venueNameOrAddress}, ${khanewalArea}`,
        status: 'pending',
        eventDetails,
        pricing: {
          baseFee: 5000,
          serviceOrDeliveryFee: estimatedTotal - 5000,
          itemOrDistanceBudget: 0,
          helperFee: 0,
          platformFee: 0,
          total: estimatedTotal
        },
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        etaMinutes: 60
      });

      setIsSubmitting(false);
      onOrderSuccess(newOrder);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err?.message || 'Order jama karne mein masla paish aya hai. Dobara koshish karein.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#0b0f19] border-2 border-amber-500/50 rounded-3xl max-w-2xl w-full shadow-[0_0_50px_rgba(245,158,11,0.2)] overflow-hidden my-auto max-h-[95vh] flex flex-col text-slate-100">
        
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 bg-gradient-to-r from-amber-600/30 via-slate-900 to-amber-950/40 border-b border-amber-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-bold text-lg shadow-md shadow-amber-500/20">
              🎪
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-amber-300 flex items-center gap-1.5">
                <span>Khanah-e-Taqreeb o Shadi Planner</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-sans">
                  Khanewal Events
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Shadi, Barat, Walima, Salgirah aur gharelu dawaton ka mukammal VIP intezam
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps Progress Indicator */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between text-xs shrink-0">
          {[
            { step: 1, label: 'Taqreeb ki Noiyat' },
            { step: 2, label: 'Muqam o Mehman' },
            { step: 3, label: 'Sahooliyat o Khana' },
            { step: 4, label: 'Budget o Rabta' }
          ].map(s => (
            <button
              key={s.step}
              type="button"
              onClick={() => setCurrentStep(s.step)}
              className={`flex items-center gap-1.5 py-1 px-2 rounded-lg transition-all ${
                currentStep === s.step
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : currentStep > s.step
                  ? 'text-amber-400 font-bold'
                  : 'text-slate-500 font-medium'
              }`}
            >
              <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                currentStep === s.step ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-400'
              }`}>
                {s.step}
              </span>
              <span className="hidden sm:inline text-[11px]">{s.label}</span>
            </button>
          ))}
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="mx-4 mt-3 p-2.5 rounded-xl bg-red-950/80 border border-red-500 text-red-200 text-xs flex items-center gap-2">
            <span className="text-base">⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body - Scrollable */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
          
          {/* STEP 1: EVENT TYPE */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <label className="text-amber-400 font-bold block mb-2 text-xs sm:text-sm">
                  1. Taqreeb ki qisam ka intekhab karein (Select Event Type) *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'wedding_barat', label: 'Baarat (Barat)', icon: '👑', desc: 'Dulha entry aur mukammal intezam' },
                    { id: 'wedding_walima', label: 'Walima (Walima)', icon: '✨', desc: 'Buffet aur shaandar reception' },
                    { id: 'mehndi_mayun', label: 'Mehndi o Mayun', icon: '🌸', desc: 'Rang baranga stage aur dholak' },
                    { id: 'birthday_party', label: 'Salgirah Party', icon: '🎂', desc: 'Theme birthday aur sound' },
                    { id: 'dawat_catering', label: 'Gharelu Dawat / Daigein', icon: '🍲', desc: 'Riwayati laziz daigein aur bartan' },
                    { id: 'qawwali_mehfil', label: 'Mehfil-e-Qawwali / Milad', icon: '🪕', desc: 'Sufi sound aur qaleen' },
                    { id: 'corporate_seminar', label: 'Seminar o Conference', icon: '🏢', desc: 'Projector, sound aur hi-tea' },
                    { id: 'milad_majlis', label: 'Milad o Zikr', icon: '🕌', desc: 'Pur-noor intezam aur langar daigein' }
                  ].map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleEventTypeSelect(item.id, item.label)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        eventType === item.id
                          ? 'bg-amber-500/15 border-amber-400 text-white shadow-md ring-1 ring-amber-400/50'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="text-xl">{item.icon}</span>
                        {eventType === item.id && (
                          <CheckCircle2 className="w-4 h-4 text-amber-400" />
                        )}
                      </div>
                      <span className="font-bold text-xs text-amber-200">{item.label}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">{item.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title Input */}
              <div className="pt-2">
                <label className="text-slate-300 font-semibold block mb-1">
                  Taqreeb ka unwan ya naam (Event Title)
                </label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="Misaal ke taur par: Muhammad Usman ka Shaandaar Walima"
                  className="w-full text-xs rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 px-3.5 py-2.5 text-white font-medium placeholder:text-slate-600 focus:outline-hidden"
                />
              </div>

              {/* Date and Time Slot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-amber-400 font-semibold block mb-1">
                    Taqreeb ki tareekh (Event Date) *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full text-xs rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 px-3.5 py-2.5 text-white font-mono focus:outline-hidden"
                    />
                    <Calendar className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="text-amber-400 font-semibold block mb-1">
                    Waqt ka doraniya (Time Slot) *
                  </label>
                  <select
                    value={eventTimeSlot}
                    onChange={(e) => setEventTimeSlot(e.target.value as any)}
                    className="w-full text-xs rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 px-3.5 py-2.5 text-white font-medium focus:outline-hidden cursor-pointer"
                  >
                    <option value="evening_dinner">Raat ka dinner (Dinner: 7:30 PM - 11:30 PM)</option>
                    <option value="day_lunch">Dopehar ka lunch (Lunch: 12:30 PM - 4:00 PM)</option>
                    <option value="night_party">Der raat ki taqreeb (Late Night Party)</option>
                    <option value="full_day">Mukammal din ka program (Full Day Event)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: VENUE & GUESTS */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Guest Count */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-amber-400 font-bold block text-xs sm:text-sm">
                    Mehmanon ki mutawaqqah tadaad (Expected Guests Count) *
                  </label>
                  <span className="font-mono font-bold text-amber-300 text-sm bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/30">
                    {guestCount} Moazzaz Mehman
                  </span>
                </div>

                {/* Quick Chips */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {[50, 100, 200, 300, 450, 600, 800, 1200].map(cnt => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setGuestCount(cnt)}
                      className={`px-3 py-1.5 rounded-xl border font-mono text-xs transition-all cursor-pointer ${
                        guestCount === cnt
                          ? 'bg-amber-500 text-slate-950 font-black border-amber-400 shadow-xs'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {cnt}
                    </button>
                  ))}
                </div>

                <input
                  type="range"
                  min="30"
                  max="2000"
                  step="10"
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="w-full accent-amber-500 bg-slate-800 rounded-lg h-2 cursor-pointer"
                />
              </div>

              {/* Venue Type */}
              <div className="pt-2">
                <label className="text-amber-400 font-bold block mb-1.5">
                  Muqam ki noiyat (Venue Preference) *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'hall_marquee', label: 'Shadi Hall / Marquee' },
                    { id: 'home_lawn', label: 'Ghar ka Ahata / Lawn' },
                    { id: 'farmhouse_ground', label: 'Farmhouse / Open' },
                    { id: 'need_admin_suggestion', label: 'Admin Tajweez Kare' }
                  ].map(vt => (
                    <button
                      key={vt.id}
                      type="button"
                      onClick={() => setVenueType(vt.id as any)}
                      className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                        venueType === vt.id
                          ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {vt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Venue Selector / Specific Name */}
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Khanewal ke mashhoor halls / venue muntakhib karein ya naam likhein:
                </label>
                <select
                  value={venueNameOrAddress}
                  onChange={(e) => setVenueNameOrAddress(e.target.value)}
                  className="w-full text-xs rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 px-3.5 py-2.5 text-white font-medium mb-2 cursor-pointer"
                >
                  {KHANEWAL_VENUES.map(v => (
                    <option key={v.id} value={v.name}>{v.name}</option>
                  ))}
                </select>

                <input
                  type="text"
                  value={venueNameOrAddress}
                  onChange={(e) => setVenueNameOrAddress(e.target.value)}
                  placeholder="Ya apna mukammal pata darj karein (Misaal ke taur par: Bil-muqabil Civil Lines Park, Khanewal)"
                  className="w-full text-xs rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 px-3.5 py-2 text-white font-medium placeholder:text-slate-600 focus:outline-hidden"
                />
              </div>

              {/* Khanewal Neighborhood */}
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Ilaqa / Location (Khanewal Neighborhood Area)
                </label>
                <select
                  value={khanewalArea}
                  onChange={(e) => setKhanewalArea(e.target.value)}
                  className="w-full text-xs rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 px-3.5 py-2 text-white font-medium cursor-pointer"
                >
                  {KHANEWAL_AREAS.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* STEP 3: SERVICES & CATERING */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <label className="text-amber-400 font-bold block mb-2 text-xs sm:text-sm">
                  Matlooba sahooliyat ka intekhab karein (Select Required Event Services):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: 'catering_food', icon: <Utensils className="w-4 h-4 text-amber-400" />, title: 'Catering, Daigein aur Laziz Khana', desc: 'Biryani, Karahi, Naan, Sweets aur Salad' },
                    { id: 'tentage_shamiana', icon: <Sparkles className="w-4 h-4 text-amber-400" />, title: 'VIP Shamiyana, Qanatein o Tent', desc: 'Shahi parday, red carpet aur aaram deh kursiyan' },
                    { id: 'stage_floral', icon: <PartyPopper className="w-4 h-4 text-amber-400" />, title: 'Stage Decoration o Phoolon ki Entry', desc: 'Bridal stage sofa aur taaza gulab ka setup' },
                    { id: 'sound_lighting', icon: <Music className="w-4 h-4 text-amber-400" />, title: 'Sound System, DJ o Focus Lighting', desc: 'Crystal clear audio aur decorative lights' },
                    { id: 'photography_drone', icon: <Camera className="w-4 h-4 text-amber-400" />, title: 'HD Photography aur Drone Video Shoot', desc: 'Mahir cameraman aur event ki yadgar movie' },
                    { id: 'waiters_crockery', icon: <Users className="w-4 h-4 text-amber-400" />, title: 'Uniformed Waiters o Crockery Bartan', desc: 'Tehzeeb yafta service aur saaf suthray bartan' },
                    { id: 'generator_backup', icon: <Zap className="w-4 h-4 text-amber-400" />, title: 'Heavy Generator Backup o AC', desc: 'Bijli bandish se be-fikri' },
                    { id: 'valet_security', icon: <Shield className="w-4 h-4 text-amber-400" />, title: 'Security Guards o Valet Parking', desc: 'Gariyon ka mehfooz intezam aur nazm-o-zabt' }
                  ].map(srv => {
                    const isChecked = selectedServices.includes(srv.id);
                    return (
                      <div
                        key={srv.id}
                        onClick={() => toggleService(srv.id)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          isChecked
                            ? 'bg-amber-500/10 border-amber-400/80 text-white shadow-xs'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            isChecked ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-500'
                          }`}>
                            {srv.icon}
                          </div>
                          <div>
                            <span className="font-bold text-xs text-slate-100 block">{srv.title}</span>
                            <span className="text-[10px] text-slate-400">{srv.desc}</span>
                          </div>
                        </div>

                        <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 ${
                          isChecked ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold' : 'border-slate-700'
                        }`}>
                          {isChecked && '✓'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* If Catering is selected, show catering options */}
              {selectedServices.includes('catering_food') && (
                <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-amber-400" />
                      <span>Khanay aur catering ki tafseelat (Catering Details):</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'traditional_degain', label: 'Riwayati Daigein (Traditional Degain)' },
                      { id: 'per_head_buffet', label: 'Per Head VIP Buffet' },
                      { id: 'refreshment_tea', label: 'Hi-Tea o Refreshment' }
                    ].map(ct => (
                      <button
                        key={ct.id}
                        type="button"
                        onClick={() => setCateringType(ct.id as any)}
                        className={`p-2 rounded-xl border text-center font-bold text-[11px] transition-all cursor-pointer ${
                          cateringType === ct.id
                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs'
                            : 'bg-slate-900 border-slate-800 text-slate-300'
                        }`}
                      >
                        {ct.label}
                      </button>
                    ))}
                  </div>

                  {cateringType === 'traditional_degain' && (
                    <div className="flex items-center gap-3">
                      <label className="text-slate-300 font-semibold text-xs">Daigon ki mutawaqqah tadaad:</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={numberOfDegs}
                        onChange={(e) => setNumberOfDegs(Number(e.target.value))}
                        className="w-20 text-xs rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 px-3 py-1.5 text-white font-mono text-center"
                      />
                      <span className="text-slate-400 text-[11px]">(Taqreeban 25 se 30 afrad per daig)</span>
                    </div>
                  )}

                  <div>
                    <label className="text-slate-300 font-semibold block mb-1 text-[11px]">
                      Menu ke pakwan ya custom dishes:
                    </label>
                    <textarea
                      rows={2}
                      value={menuItemsText}
                      onChange={(e) => setMenuItemsText(e.target.value)}
                      placeholder="Misaal ke taur par: Chicken Biryani, Mutton Qorma, Seekh Kabab, Roghni Naan, Kheer, Salad"
                      className="w-full text-xs rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 p-2.5 text-white placeholder:text-slate-600 focus:outline-hidden"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: BUDGET & CONTACT */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Estimated Quote Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-900 to-amber-950/20 border border-amber-500/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-amber-300 font-bold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Takhmeenah laagat o quotation (Live Package Estimate):</span>
                  </span>
                  <span className="font-mono font-black text-amber-400 text-base">
                    PKR ~{calculateRoughEstimate().toLocaleString()}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Yeh aik ibtedai takhmeenah hai. Admin ki taraf se call aur site visit ke baad aap ki zaroorat ke mutabiq final aur discount rate tay kiya jaye ga.
                </p>
              </div>

              {/* Host Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-amber-400 font-bold block mb-1">
                    Mezban / Rabta car ka naam *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactPersonName}
                    onChange={(e) => setContactPersonName(e.target.value)}
                    placeholder="Misaal ke taur par: Malik Kashif ya Rao Nadeem"
                    className="w-full text-xs rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 px-3.5 py-2.5 text-white font-medium focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-amber-400 font-bold block mb-1">
                    Mobile phone number (Call ke liye) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={contactPersonPhone}
                    onChange={(e) => setContactPersonPhone(e.target.value)}
                    placeholder="0300-1234567"
                    className="w-full text-xs rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 px-3.5 py-2.5 text-white font-mono focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1 flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>WhatsApp number (Menu aur tasaveer ke liye)</span>
                  </label>
                  <input
                    type="tel"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="0300-1234567"
                    className="w-full text-xs rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 px-3.5 py-2.5 text-white font-mono focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Mutawaqqah kul budget (PKR Budget Range)
                  </label>
                  <input
                    type="number"
                    step="5000"
                    value={budgetRangePkr}
                    onChange={(e) => setBudgetRangePkr(Number(e.target.value))}
                    className="w-full text-xs rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 px-3.5 py-2.5 text-white font-mono font-bold focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Special Instructions */}
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Koi khas hidayat, theme color ya custom farmaish:
                </label>
                <textarea
                  rows={2}
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="Misaal ke taur par: Baarat 2 bajay pohanchay gi, stage par sufaid o surkh gulab ki sajawat honi chahiye, mehmanon ke baithne ka khususi intezam ho."
                  className="w-full text-xs rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 p-2.5 text-white placeholder:text-slate-600 focus:outline-hidden"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-4 sm:px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-slate-800"
            >
              <ChevronRight className="w-4 h-4" />
              <span>Pichla Marhala (Back)</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-500 hover:text-slate-300 font-medium text-xs cursor-pointer"
            >
              Cancel Karein
            </button>
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(prev => prev + 1)}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <span>Agla Marhala (Next)</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="px-7 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 rounded-xl font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Darkhwast bheji ja rahi hai...</span>
              ) : (
                <>
                  <span>Event Booking Jama Karwayein (Confirm Booking)</span>
                  <span>✓</span>
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
