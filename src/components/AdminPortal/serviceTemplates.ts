import { HomeServiceItem } from '../../types';
import { INITIAL_SERVICES } from '../../services/store';

/**
 * Admin "Add Service" dropdown ki list.
 * Pehli 6 entries wahi hain jo app ke default catalog mein hain (same id), baqi nayi templates hain.
 * Admin yahan se ek ya zyada services select karta hai, phir har ek ka rate aur worker set karta hai.
 */
export interface ServiceTemplate {
  /** Dropdown mein dikhne wala chota naam (e.g. "Plumber") */
  label: string;
  /** Worker ki skill match karne ke liye keywords (lowercase) */
  keywords: string[];
  service: Omit<HomeServiceItem, 'assignedProviderId' | 'assignedProviderName' | 'updatedAt'>;
}

const base = (id: string) => {
  const s = INITIAL_SERVICES.find(x => x.id === id);
  if (!s) throw new Error('Missing default service template: ' + id);
  const { assignedProviderId: _a, assignedProviderName: _b, updatedAt: _c, ...rest } = s;
  return rest;
};

export const CUSTOM_TEMPLATE_KEY = '__custom__';

export const SERVICE_TEMPLATES: ServiceTemplate[] = [
  { label: 'Electrician', keywords: ['electric', 'wiring', 'ups'], service: base('srv-electrician') },
  { label: 'Plumber', keywords: ['plumb', 'sanitary', 'pipe'], service: base('srv-plumbing') },
  { label: 'AC Repair & Service', keywords: ['ac ', 'ac-', 'hvac', 'cooling', 'air condition'], service: base('srv-ac-repair') },
  { label: 'Home Appliance Repair', keywords: ['appliance', 'fridge', 'refrigerator', 'washing', 'microwave'], service: base('srv-appliances') },
  { label: 'Carpenter & Locksmith', keywords: ['carpent', 'wood', 'lock'], service: base('srv-carpentry') },
  { label: 'Deep Cleaning', keywords: ['clean', 'sofa', 'carpet'], service: base('srv-cleaning') },
  {
    label: 'Home Automation / Smart Home',
    keywords: ['automation', 'smart', 'electric'],
    service: {
      id: 'srv-smart-home',
      name: 'Smart Home Automation Setup',
      category: 'Smart Devices',
      basePrice: 2200,
      estimatedDuration: '90 mins',
      description: 'Smart switch installation, Wi-Fi smart camera setup, and Alexa/Google Home hub pairing.',
      popularIssues: ['Smart camera mounting', 'Wi-Fi switch configuration', 'Zigbee sensor linking', 'Alexa / Google Home setup'],
      icon: 'Cpu',
      isPublished: true
    }
  },
  {
    label: 'CCTV & Security Camera',
    keywords: ['cctv', 'camera', 'security'],
    service: {
      id: 'srv-cctv',
      name: 'CCTV Camera Installation & Repair',
      category: 'Security Systems',
      basePrice: 2500,
      estimatedDuration: '2 - 3 hours',
      description: 'CCTV camera fitting, DVR/NVR setup, cable routing and mobile viewing configuration.',
      popularIssues: ['New CCTV installation', 'Camera not recording', 'DVR / NVR setup', 'Mobile remote view setup'],
      icon: 'Lock',
      isPublished: true
    }
  },
  {
    label: 'Painter',
    keywords: ['paint', 'colour', 'color', 'polish'],
    service: {
      id: 'srv-painter',
      name: 'Painter & Wall Finishing',
      category: 'Painting',
      basePrice: 3000,
      estimatedDuration: '1 day',
      description: 'Interior / exterior wall painting, putty, weather shield and wood polish.',
      popularIssues: ['Room painting', 'Wall putty / damp repair', 'Exterior weather shield', 'Door / furniture polish'],
      icon: 'Paintbrush',
      isPublished: true
    }
  },
  {
    label: 'Mistri / Mason & Tiles',
    keywords: ['mason', 'mistri', 'tile', 'construction'],
    service: {
      id: 'srv-mason',
      name: 'Mistri, Mason & Tile Work',
      category: 'Construction',
      basePrice: 2500,
      estimatedDuration: '3 - 5 hours',
      description: 'Tile fitting, small wall / plaster repair, floor leveling and bathroom renovation work.',
      popularIssues: ['Floor / wall tile fixing', 'Plaster repair', 'Bathroom renovation', 'Boundary wall repair'],
      icon: 'Hammer',
      isPublished: true
    }
  },
  {
    label: 'Geyser & Water Heater',
    keywords: ['geyser', 'heater', 'plumb'],
    service: {
      id: 'srv-geyser',
      name: 'Geyser Installation & Repair',
      category: 'Sanitary & Water',
      basePrice: 1500,
      estimatedDuration: '60 mins',
      description: 'Gas / electric geyser installation, thermostat and burner repair, leakage fixing.',
      popularIssues: ['Geyser not heating', 'Gas leakage / pilot issue', 'Thermostat replacement', 'New geyser installation'],
      icon: 'Wrench',
      isPublished: true
    }
  },
  {
    label: 'Solar & UPS / Inverter',
    keywords: ['solar', 'ups', 'inverter', 'battery', 'electric'],
    service: {
      id: 'srv-solar-ups',
      name: 'Solar, UPS & Inverter Service',
      category: 'Electrical Work',
      basePrice: 2000,
      estimatedDuration: '90 mins',
      description: 'Solar panel cleaning and wiring, UPS / inverter installation, battery checkup and replacement.',
      popularIssues: ['UPS not charging', 'Inverter installation', 'Solar panel wiring', 'Battery replacement'],
      icon: 'Zap',
      isPublished: true
    }
  },
  {
    label: 'Pest Control & Fumigation',
    keywords: ['pest', 'fumigation', 'termite'],
    service: {
      id: 'srv-pest-control',
      name: 'Pest Control & Fumigation',
      category: 'Sanitization & Cleaning',
      basePrice: 3500,
      estimatedDuration: '2 hours',
      description: 'Termite, cockroach, bed-bug and mosquito treatment with safe chemicals.',
      popularIssues: ['Termite treatment', 'Cockroach / ants', 'Bed-bug treatment', 'Mosquito fumigation'],
      icon: 'Sparkles',
      isPublished: true
    }
  },
  {
    label: 'Water Tank Cleaning',
    keywords: ['tank', 'water', 'clean'],
    service: {
      id: 'srv-water-tank',
      name: 'Water Tank Cleaning',
      category: 'Sanitization & Cleaning',
      basePrice: 2000,
      estimatedDuration: '2 hours',
      description: 'Underground / overhead water tank cleaning and sanitization.',
      popularIssues: ['Overhead tank cleaning', 'Underground tank cleaning', 'Tank leakage check'],
      icon: 'Sparkles',
      isPublished: true
    }
  }
];
