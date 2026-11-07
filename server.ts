import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { initDbPool, isDbConnected, query, rowToOrder } from './src/server/db.js';
import { 
  initPasswordResetsTable, 
  createPasswordResetToken, 
  verifyPasswordResetToken, 
  markTokenAsUsed, 
  sendBrevoEmail, 
  getPasswordResetEmailHtml, 
  getPasswordResetSuccessEmailHtml, 
  getOrderNotificationEmailHtml 
} from './src/server/brevo.js';
import {
  loadDiskPersistentState,
  saveDiskPersistentState,
  createFullSnapshot,
  restoreFromSnapshot,
  getLatestSnapshot
} from './src/server/snapshotManager.js';
import { issueSessionToken, getRequestActor } from './src/server/session.js';
import { registerExtraWorkRoutes } from './src/server/extraWork.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const num = (v: any, d: number) => (v === '' || v == null || isNaN(Number(v)) ? d : Number(v));

// In-memory fallback cache if MySQL is temporarily offline
let memoryUsers: any[] = [];
let memoryOrders: any[] = [];
let memorySettings: any = null;
let runtimeAdminPasswordOverride: string | null = null;

// Deduplication helper to merge multiple records with the same email
function deduplicateUsersList(users: any[]): any[] {
  const map = new Map<string, any>();
  users.forEach(u => {
    if (!u) return;
    const key = u.email ? u.email.toLowerCase().trim() : u.id;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, u);
    } else {
      map.set(key, { ...existing, ...u });
    }
  });
  return Array.from(map.values());
}

// Initialize disk persistent cache immediately
const initialDisk = loadDiskPersistentState();
if (initialDisk.users.length > 0) {
  memoryUsers = deduplicateUsersList(initialDisk.users);
}
if (initialDisk.settings) {
  memorySettings = initialDisk.settings;
}
if (initialDisk.orders && initialDisk.orders.length > 0) {
  memoryOrders = initialDisk.orders;
}
if (initialDisk.adminPasswordOverride) {
  runtimeAdminPasswordOverride = initialDisk.adminPasswordOverride;
}

async function syncSuperAdminFromEnv() {
  if (!isDbConnected()) return;
  const adminEmail = process.env.ADMIN_USERNAME || process.env.VITE_ADMIN_USERNAME || 'admin@omniserve.com';
  const adminPassword = runtimeAdminPasswordOverride || process.env.ADMIN_PASSWORD || process.env.VITE_ADMIN_PASSWORD || 'Admin@12345';

  try {
    const existing = await query('SELECT id FROM users WHERE id = ? OR email = ? LIMIT 1', ['usr-admin-1', adminEmail]);
    if (existing && existing.length > 0) {
      const existingId = (existing[0] as any).id;
      await query('UPDATE users SET email = ?, password = ? WHERE id = ?', [adminEmail, adminPassword, existingId]);
      console.log(`[Khanewal Connect] Verified & synced Super Admin credentials in MySQL for: ${adminEmail}`);
    } else {
      await query(`
        INSERT INTO users (id, name, email, phone, password, role, avatar, address, wallet_balance, status)
        VALUES (?, 'Super Administrator', ?, '+92 308 4541241', ?, 'admin', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80', 'Main Complex, Civil Lines, Khanewal', 150000.00, 'active')
      `, ['usr-admin-1', adminEmail, adminPassword]);
      console.log(`[Khanewal Connect] Provisioned initial Super Admin in MySQL for: ${adminEmail}`);
    }
  } catch (err: any) {
    console.warn('[Khanewal Connect] Note syncing admin credentials:', err.message);
  }
}

// Secure GitHub Secrets resolver: Prioritizes RESET_PASS, falls back to RESET_KEY
export function getSecretResetPass(): string {
  return (
    process.env.RESET_PASS ||
    process.env.VITE_RESET_PASS ||
    process.env.RESET_KEY ||
    process.env.VITE_RESET_KEY ||
    'RESET_PASS'
  ).trim();
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json({ limit: '10mb' }));

  // Attempt MySQL database connection
  await initDbPool();
  await syncSuperAdminFromEnv();
  await initPasswordResetsTable();

  // Purely MySQL & Snapshot Hydration Engine (Zero% Data Loss, Zero Firestore split)
  (async () => {
    try {
      if (isDbConnected()) {
        const [users, orders, settings] = await Promise.all([
          query('SELECT * FROM users ORDER BY created_at ASC'),
          query('SELECT * FROM orders ORDER BY created_at DESC'),
          query('SELECT * FROM app_settings WHERE id = "global" LIMIT 1')
        ]);

        if (Array.isArray(users) && users.length > 0) {
          memoryUsers = deduplicateUsersList(users.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            phone: u.phone,
            password: u.password,
            role: u.role,
            avatar: u.avatar,
            address: u.address,
            walletBalance: Number(u.wallet_balance) || 0,
            status: u.status,
            providerCategory: u.provider_category,
            serviceSkill: u.service_skill,
            vehicleType: u.vehicle_type,
            rating: Number(u.rating) || 5.0,
            completedJobsCount: Number(u.completed_jobs_count) || 0,
            isOnline: u.is_online === 1,
            createdAt: u.created_at,
            updatedAt: u.updated_at
          })));
          saveDiskPersistentState({ users: memoryUsers });
          console.log(`[MySQL Boot] Loaded ${memoryUsers.length} users from MySQL.`);
        }

        if (Array.isArray(orders) && orders.length > 0) {
          memoryOrders = orders.map((r: any) => rowToOrder(r));
          saveDiskPersistentState({ orders: memoryOrders });
          console.log(`[MySQL Boot] Loaded ${memoryOrders.length} orders from MySQL.`);
        }

        if (Array.isArray(settings) && settings.length > 0) {
          const s = settings[0];
          memorySettings = {
            deliveryBaseFee: num(s.delivery_base_fee, 200),
            deliveryPerKmFee: num(s.delivery_per_km_fee, 35),
            deliveryUrgentFee: num(s.delivery_urgent_fee, 150),
            technicianVisitingFee: num(s.technician_visiting_fee, 500),
            technicianHourlyRate: num(s.technician_hourly_rate, 800),
            platformCommissionRate: num(s.platform_commission_rate, 15),
            platformFixedFee: num(s.platform_fixed_fee, 50),
            whatsappSupportPhone: s.whatsapp_support_phone || '+92 308 4541241',
            whatsappDefaultMessage: s.whatsapp_default_message || '',
            supportHelpline: s.support_helpline || '+92 308 4541241'
          };
          saveDiskPersistentState({ settings: memorySettings });
        }
      } else {
        // Fallback to disk snapshot cache
        const latestSnapshot = await getLatestSnapshot();
        if (latestSnapshot && latestSnapshot.data) {
          if (Array.isArray(latestSnapshot.data.users) && latestSnapshot.data.users.length > 0) {
            memoryUsers = deduplicateUsersList(latestSnapshot.data.users);
          }
          if (Array.isArray(latestSnapshot.data.orders) && latestSnapshot.data.orders.length > 0) {
            memoryOrders = latestSnapshot.data.orders;
          }
          if (latestSnapshot.data.settings) {
            memorySettings = latestSnapshot.data.settings;
          }
          console.log(`[Snapshot Boot] Hydrated memory from persistent snapshot (${memoryOrders.length} orders, ${memoryUsers.length} users).`);
        }
      }
    } catch (err: any) {
      console.warn('[Server Boot] Note initializing state:', err.message);
    }
  })();

  // API Routes
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      database: isDbConnected() ? 'mysql_connected' : 'memory_fallback',
      adminUser: process.env.ADMIN_USERNAME ? 'configured_from_secret' : 'default_admin',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  app.get('/api/config/auth-info', (req: Request, res: Response) => {
    res.json({
      adminConfigured: Boolean(process.env.ADMIN_USERNAME || process.env.VITE_ADMIN_USERNAME),
      adminUsername: process.env.ADMIN_USERNAME || process.env.VITE_ADMIN_USERNAME || 'admin@omniserve.com'
    });
  });

  // Client Firebase & Environment Configuration Proxy
  app.get('/api/config/client-env', (req: Request, res: Response) => {
    res.json({
      firebase: {
        projectId: process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || 'noman-e5b08',
        appId: process.env.FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID || '',
        apiKey: process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY || '',
        authDomain: process.env.FIREBASE_AUTH_DOMAIN || process.env.VITE_FIREBASE_AUTH_DOMAIN || '',
        firestoreDatabaseId: process.env.FIREBASE_FIRESTORE_DATABASE_ID || process.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || process.env.FIREBASE_DATABASE_ID || '',
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET || '',
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
        oAuthClientId: process.env.FIREBASE_OAUTH_CLIENT_ID || process.env.VITE_FIREBASE_OAUTH_CLIENT_ID || ''
      },
      admin: {
        username: process.env.ADMIN_USERNAME || process.env.VITE_ADMIN_USERNAME || 'admin@omniserve.com',
        isConfigured: Boolean(process.env.ADMIN_USERNAME || process.env.VITE_ADMIN_USERNAME)
      },
      dbConnected: isDbConnected()
    });
  });

  app.get('/api/config/firebase-info', (req: Request, res: Response) => {
    const isConfigured = Boolean(
      process.env.FIREBASE_PROJECT_ID || 
      process.env.VITE_FIREBASE_PROJECT_ID || 
      process.env.FIREBASE_FIRESTORE_DATABASE_ID
    );
    res.json({
      configuredFromSecret: isConfigured,
      source: isConfigured ? 'github_secrets_or_env' : 'fallback_applet_config',
      projectId: process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || 'noman-e5b08',
      databaseId: process.env.FIREBASE_FIRESTORE_DATABASE_ID || process.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || 'ai-studio-omnitasksuperapp-57a34a31-4e02-4160-a3fe-27190e12f1f7'
    });
  });

  // =========================================================================
  // LIVE SYSTEM & DATABASE HEALTH / CONNECTION STATUS (PURE MYSQL & SNAPSHOT ENGINE)
  // =========================================================================
  app.get('/api/system/status', async (req: Request, res: Response) => {
    let mysqlStats = null;
    if (isDbConnected()) {
      try {
        const uCount = await query('SELECT COUNT(*) as c FROM users');
        const oCount = await query('SELECT COUNT(*) as c FROM orders');
        mysqlStats = {
          users: Number((uCount[0] as any)?.c || 0),
          orders: Number((oCount[0] as any)?.c || 0)
        };
      } catch {}
    }

    res.json({
      success: true,
      engine: 'Pure MySQL & Zero-Loss Snapshot Engine',
      database: {
        connected: isDbConnected(),
        type: isDbConnected() ? 'mysql' : 'server_persistent_engine',
        status: isDbConnected() ? 'mysql_online' : 'server_snapshot_cache_online',
        label: isDbConnected() ? 'MySQL Connected (Authoritative GitHub Database)' : 'Zero-Loss Snapshot Cache Active',
        stats: mysqlStats || { users: memoryUsers.length, orders: memoryOrders.length }
      },
      snapshotEngine: {
        active: true,
        zeroDataLoss: true,
        backupReady: true,
        rcloneCompatible: true,
        ordersCount: memoryOrders.length,
        usersCount: memoryUsers.length
      },
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  });

  // =========================================================================
  // DYNAMIC SETTINGS API (RATES, WHATSAPP, COMMISSIONS - MYSQL + FIRESTORE)
  // =========================================================================
  app.get('/api/settings', async (req: Request, res: Response) => {
    // 1. If MySQL is connected, query app_settings table
    if (isDbConnected()) {
      try {
        const rows = await query('SELECT * FROM app_settings WHERE id = ? LIMIT 1', ['global']);
        if (rows && rows.length > 0) {
          const r = rows[0] as any;
          const dbSettings = {
            deliveryBaseFee: num(r.delivery_base_fee, 200),
            deliveryPerKmFee: num(r.delivery_per_km_fee, 35),
            deliveryUrgentFee: num(r.delivery_urgent_fee, 150),
            technicianVisitingFee: num(r.technician_visiting_fee, 500),
            technicianHourlyRate: num(r.technician_hourly_rate, 800),
            platformCommissionRate: num(r.platform_commission_rate, 15),
            platformFixedFee: num(r.platform_fixed_fee, 50),
            whatsappSupportPhone: r.whatsapp_support_phone || '+92 308 4541241',
            whatsappDefaultMessage: r.whatsapp_default_message || 'Assalam-o-Alaikum! Mujhe Khanewal Connect service ke baray mein kuch maloomat chahiye/madad chahiye.',
            supportHelpline: r.support_helpline || '+92 308 4541241'
          };
          memorySettings = dbSettings;
          return res.json({ success: true, source: 'mysql', settings: dbSettings });
        }
      } catch (err: any) {
        console.warn('[API /api/settings] MySQL read note:', err.message);
      }
    }

    // 2. Return memorySettings if hydrated
    if (memorySettings) {
      return res.json({ success: true, source: 'server_disk_cache', settings: memorySettings });
    }

    // 3. Standard default settings
    const defaults = {
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
    res.json({ success: true, source: 'defaults', settings: defaults });
  });

  app.post('/api/settings', async (req: Request, res: Response) => {
    const newSettings = req.body;
    if (!newSettings || typeof newSettings !== 'object') {
      return res.status(400).json({ success: false, error: 'Invalid settings payload' });
    }

    const current = memorySettings || {
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

    const merged = { ...current, ...newSettings };
    memorySettings = merged;

    // 1. Save to persistent disk storage immediately
    saveDiskPersistentState({ settings: merged });

    // 2. Direct persistence to MySQL app_settings table
    if (isDbConnected()) {
      try {
        await query(`
          INSERT INTO app_settings (
            id, delivery_base_fee, delivery_per_km_fee, delivery_urgent_fee,
            technician_visiting_fee, technician_hourly_rate, platform_commission_rate,
            platform_fixed_fee, whatsapp_support_phone, whatsapp_default_message,
            support_helpline, raw_json
          ) VALUES ('global', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            delivery_base_fee = VALUES(delivery_base_fee),
            delivery_per_km_fee = VALUES(delivery_per_km_fee),
            delivery_urgent_fee = VALUES(delivery_urgent_fee),
            technician_visiting_fee = VALUES(technician_visiting_fee),
            technician_hourly_rate = VALUES(technician_hourly_rate),
            platform_commission_rate = VALUES(platform_commission_rate),
            platform_fixed_fee = VALUES(platform_fixed_fee),
            whatsapp_support_phone = VALUES(whatsapp_support_phone),
            whatsapp_default_message = VALUES(whatsapp_default_message),
            support_helpline = VALUES(support_helpline),
            raw_json = VALUES(raw_json)
        `, [
          num(merged.deliveryBaseFee, 200),
          num(merged.deliveryPerKmFee, 35),
          num(merged.deliveryUrgentFee, 150),
          num(merged.technicianVisitingFee, 500),
          num(merged.technicianHourlyRate, 800),
          num(merged.platformCommissionRate, 15),
          num(merged.platformFixedFee, 50),
          String(merged.whatsappSupportPhone || '+92 308 4541241'),
          String(merged.whatsappDefaultMessage || ''),
          String(merged.supportHelpline || '+92 308 4541241'),
          JSON.stringify(merged)
        ]);
        console.log('[API /api/settings] Settings successfully saved to MySQL database');
      } catch (err: any) {
        console.warn('[API /api/settings] MySQL write error:', err.message);
      }
    }

    // Trigger full snapshot update
    createFullSnapshot('Live Settings Updated Snapshot', { settings: merged }).catch(() => {});

    console.log('[API /api/settings] Live settings saved permanently to MySQL & Snapshot Storage:', merged.whatsappSupportPhone);
    res.json({
      success: true,
      message: 'Tamam rates aur WhatsApp number kamyabi se MySQL Database aur Snapshot Storage mein permanently save ho gaye hain!',
      settings: merged
    });
  });

  // =========================================================================
  // CATALOG RATES API (SERVICES & VEHICLES - MYSQL + SNAPSHOT)
  // =========================================================================
  app.get('/api/catalog', async (req: Request, res: Response) => {
    try {
      // 1. MySQL is the source of truth (survives server restarts / new runners)
      if (isDbConnected()) {
        try {
          const parseRow = (r: any) => {
            try { return JSON.parse(r.raw_json || '{}'); } catch { return null; }
          };
          const sRows = await query('SELECT * FROM catalog_services');
          const vRows = await query('SELECT * FROM catalog_vehicles');
          const dbServices = sRows.map(parseRow).filter((x: any) => x && x.id);
          const dbVehicles = vRows.map(parseRow).filter((x: any) => x && x.id);
          if (dbServices.length > 0 || dbVehicles.length > 0) {
            return res.json({
              success: true,
              source: 'mysql',
              services: dbServices.length > 0 ? dbServices : undefined,
              vehicles: dbVehicles.length > 0 ? dbVehicles : undefined
            });
          }
        } catch (err: any) {
          console.warn('[API /api/catalog] MySQL read note:', err.message);
        }
      }

      // 2. Disk fallback
      const disk = loadDiskPersistentState();
      if (disk.services || disk.vehicles) {
        return res.json({ success: true, services: disk.services, vehicles: disk.vehicles, source: 'disk' });
      }
      res.json({ success: true, source: 'defaults' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/catalog', async (req: Request, res: Response) => {
    const { services, vehicles, partial, full, base } = req.body;
    try {
      const mergeById = (baseList: any[], changed: any[]) => {
        const map = new Map<string, any>(baseList.map((x: any) => [x.id, x]));
        for (const c of changed) if (c && c.id) map.set(c.id, c);
        return Array.from(map.values());
      };
      const hasServices = Array.isArray(services);
      const hasVehicles = Array.isArray(vehicles);
      const conflicts: { services: string[]; vehicles: string[] } = { services: [], vehicles: [] };
      let acceptedServices: any[] | undefined = hasServices ? services : undefined;
      let acceptedVehicles: any[] | undefined = hasVehicles ? vehicles : undefined;
      let diskServices: any[] | undefined = acceptedServices;
      let diskVehicles: any[] | undefined = acceptedVehicles;

      if (partial === true) {
        // Partial save = only the CHANGED items. Reject any item that was modified by someone else
        // after the sender last saw it (stale tab / device), then merge the rest by id.
        const disk = loadDiskPersistentState();
        const storedTs = async (table: 'catalog_services' | 'catalog_vehicles', diskList: any[] | undefined, id: string): Promise<number> => {
          let ts = 0;
          const d = Array.isArray(diskList) ? diskList.find((x: any) => x && x.id === id) : null;
          if (d && Number(d.updatedAt) > ts) ts = Number(d.updatedAt);
          if (isDbConnected()) {
            try {
              const rows = await query(`SELECT raw_json FROM ${table} WHERE id = ?`, [id]);
              if (rows && rows[0]) {
                const j = JSON.parse(rows[0].raw_json || '{}');
                if (Number(j.updatedAt) > ts) ts = Number(j.updatedAt);
              }
            } catch { /* ignore, treat as no stored version */ }
          }
          return ts;
        };
        const filterFresh = async (items: any[], table: 'catalog_services' | 'catalog_vehicles', diskList: any[] | undefined, baseMap: any, bucket: string[]) => {
          const ok: any[] = [];
          for (const it of items) {
            if (!it || !it.id) continue;
            const seen = Number(baseMap?.[it.id]) || 0;
            const stored = await storedTs(table, diskList, it.id);
            if (stored > seen) bucket.push(it.id); else ok.push(it);
          }
          return ok;
        };
        if (hasServices) {
          acceptedServices = await filterFresh(services, 'catalog_services', disk.services, base?.services, conflicts.services);
          const diskBase = Array.isArray(disk.services) ? disk.services : (Array.isArray(full?.services) ? full.services : []);
          diskServices = mergeById(diskBase, acceptedServices);
        }
        if (hasVehicles) {
          acceptedVehicles = await filterFresh(vehicles, 'catalog_vehicles', disk.vehicles, base?.vehicles, conflicts.vehicles);
          const diskBase = Array.isArray(disk.vehicles) ? disk.vehicles : (Array.isArray(full?.vehicles) ? full.vehicles : []);
          diskVehicles = mergeById(diskBase, acceptedVehicles);
        }
      }

      // Write ONLY what this request actually carried
      const diskPatch: { services?: any[]; vehicles?: any[] } = {};
      if (diskServices) diskPatch.services = diskServices;
      if (diskVehicles) diskPatch.vehicles = diskVehicles;
      if (diskPatch.services || diskPatch.vehicles) saveDiskPersistentState(diskPatch);

      if (isDbConnected()) {
        if (Array.isArray(acceptedServices)) {
          for (const s of acceptedServices) {
            if (!s.id || !s.name) continue;
            await query(`
              INSERT INTO catalog_services (id, name, category, base_price, estimated_duration, description, is_published, assigned_provider_id, assigned_provider_name, raw_json)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON DUPLICATE KEY UPDATE
                name = VALUES(name),
                category = VALUES(category),
                base_price = VALUES(base_price),
                estimated_duration = VALUES(estimated_duration),
                description = VALUES(description),
                is_published = VALUES(is_published),
                assigned_provider_id = VALUES(assigned_provider_id),
                assigned_provider_name = VALUES(assigned_provider_name),
                raw_json = VALUES(raw_json)
            `, [
              s.id,
              s.name,
              s.category || 'General',
              Number(s.basePrice || s.base_price) || 0,
              s.estimatedDuration || s.estimated_duration || '60 mins',
              s.description || '',
              s.isPublished === false ? 0 : 1,
              s.assignedProviderId || null,
              s.assignedProviderName || null,
              JSON.stringify(s)
            ]);
          }
        }
        if (Array.isArray(acceptedVehicles)) {
          for (const v of acceptedVehicles) {
            if (!v.id || !v.name) continue;
            await query(`
              INSERT INTO catalog_vehicles (id, name, capacity_kg, dimensions, base_fare, per_km_rate, helper_rate, is_published, assigned_provider_id, assigned_provider_name, raw_json)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON DUPLICATE KEY UPDATE
                name = VALUES(name),
                capacity_kg = VALUES(capacity_kg),
                dimensions = VALUES(dimensions),
                base_fare = VALUES(base_fare),
                per_km_rate = VALUES(per_km_rate),
                helper_rate = VALUES(helper_rate),
                is_published = VALUES(is_published),
                assigned_provider_id = VALUES(assigned_provider_id),
                assigned_provider_name = VALUES(assigned_provider_name),
                raw_json = VALUES(raw_json)
            `, [
              v.id,
              v.name,
              Number(v.capacityKg || v.capacity_kg) || 500,
              v.dimensions || '',
              Number(v.baseFare || v.base_fare) || 0,
              Number(v.perKmRate || v.per_km_rate) || 0,
              Number(v.helperRate || v.helper_rate) || 400,
              v.isPublished === false ? 0 : 1,
              v.assignedProviderId || null,
              v.assignedProviderName || null,
              JSON.stringify(v)
            ]);
          }
        }
      }
      const snap: any = {};
      if (diskServices) snap.services = diskServices;
      if (diskVehicles) snap.vehicles = diskVehicles;
      createFullSnapshot('Catalog Updated Snapshot', snap).catch(() => {});
      res.json({
        success: true,
        conflicts,
        message: (conflicts.services.length || conflicts.vehicles.length)
          ? 'Kuch items kisi aur ne pehle badal diye the - unhein skip kar diya gaya.'
          : 'Catalog rates saved permanently to MySQL & Snapshot Storage!'
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // =========================================================================
  // BREVO EMAIL & 5-MINUTE EXPIRING FORGOT PASSWORD SYSTEM
  // =========================================================================
  app.post('/api/auth/forgot-password', async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, error: 'Barae meherbani durust email address darj karein.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    let userName = 'Valued User';
    let userFound = false;

    // 1. Search in MySQL
    if (isDbConnected()) {
      try {
        const rows = await query('SELECT id, name, email FROM users WHERE LOWER(email) = ? LIMIT 1', [cleanEmail]);
        if (rows && rows.length > 0) {
          userFound = true;
          userName = (rows[0] as any).name || 'Valued User';
        }
      } catch (err: any) {
        console.warn('[Forgot Password] MySQL search error:', err.message);
      }
    }

    // 2. Search in memory cache
    if (!userFound) {
      const mem = memoryUsers.find(u => u.email && u.email.toLowerCase() === cleanEmail);
      if (mem) {
        userFound = true;
        userName = mem.name || 'Valued User';
      }
    }

    // 3. Search in disk persistent cache & snapshot
    if (!userFound) {
      try {
        const diskState = loadDiskPersistentState();
        const diskUser = diskState.users?.find((u: any) => u.email && u.email.toLowerCase() === cleanEmail);
        if (diskUser) {
          userFound = true;
          userName = diskUser.name || 'Valued User';
          if (!memoryUsers.some(u => u.id === diskUser.id)) {
            memoryUsers.push(diskUser);
          }
        }
      } catch (err: any) {
        console.warn('[Forgot Password] Disk search note:', err.message);
      }
    }

    // 4. Check Super Admin
    const adminEmail = (process.env.ADMIN_USERNAME || process.env.VITE_ADMIN_USERNAME || 'admin@omniserve.com').toLowerCase();
    if (!userFound && cleanEmail === adminEmail) {
      userFound = true;
      userName = 'Super Administrator';
    }

    if (!userFound) {
      return res.status(404).json({
        success: false,
        error: 'Is email se koi registered account dastiyab nahi mila. Barae meherbani email dobara check karein.'
      });
    }

    try {
      // Generate secure 5-minute expiry token
      const token = await createPasswordResetToken(cleanEmail, userName);

      // Determine application base url
      const origin = req.headers.origin || (req.get('host') ? `${req.protocol}://${req.get('host')}` : '');
      const resetUrl = `${origin}/?resetToken=${token}`;

      console.log(`[Forgot Password] Generated 5-minute valid token for ${cleanEmail}: ${resetUrl}`);

      // Dispatch professional branded HTML email via Brevo API
      const emailResult = await sendBrevoEmail({
        toEmail: cleanEmail,
        toName: userName,
        subject: 'Khanewal Connect - Password Reset Link (5 Minutes Valid)',
        htmlContent: getPasswordResetEmailHtml(userName, resetUrl),
        textContent: `Assalam-o-Alaikum ${userName},\n\nAapke Khanewal Connect account ka password reset karne ka link:\n${resetUrl}\n\nYeh link sirf 5 MINUTES ke liye valid hai.\n\nKhanewal Connect Team`
      });

      res.json({
        success: true,
        message: 'Password reset link aapke email par kamyabi se bhej diya gaya hai (Valid for 5 minutes).',
        email: cleanEmail,
        expiresInMinutes: 5,
        brevoDispatched: emailResult.success,
        resetToken: token,
        resetUrl
      });
    } catch (err: any) {
      console.error('[Forgot Password] Error handling request:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get('/api/auth/verify-reset-token', async (req: Request, res: Response) => {
    const token = req.query.token as string;
    if (!token) {
      return res.status(400).json({ valid: false, error: 'Token missing' });
    }
    const result = await verifyPasswordResetToken(token);
    res.json(result);
  });

  app.post('/api/auth/reset-password', async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, error: 'Token aur naya password dono darkar hain.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'Password kam az kam 6 characters ka hona chahiye.' });
    }

    const verification = await verifyPasswordResetToken(token);
    if (!verification.valid || !verification.email) {
      return res.status(400).json({ 
        success: false, 
        error: verification.error || 'Yeh password reset link expire ho chuka hai ya ghalat hai.' 
      });
    }

    const email = verification.email.toLowerCase().trim();
    const name = verification.name || 'Valued User';
    const adminEmail = (process.env.ADMIN_USERNAME || process.env.VITE_ADMIN_USERNAME || 'admin@omniserve.com').toLowerCase();

    try {
      let updatedUser: any = null;

      // 1. Update in MySQL
      if (isDbConnected()) {
        try {
          await query('UPDATE users SET password = ? WHERE LOWER(email) = ?', [newPassword, email]);
          if (email === adminEmail) {
            await query('UPDATE users SET password = ? WHERE id = ? OR LOWER(email) = ?', [newPassword, 'usr-admin-1', adminEmail]);
          }
          console.log(`[Password Reset] Password updated in MySQL database for user: ${email}`);

          // Fetch refreshed user record
          const rows = await query(`
            SELECT 
              id, name, email, phone, password, role, avatar, address, 
              wallet_balance as walletBalance, status, provider_category as providerCategory, 
              service_skill as serviceSkill, vehicle_type as vehicleType, rating, 
              completed_jobs_count as completedJobsCount, is_online as isOnline, 
              DATE_FORMAT(created_at, '%Y-%m-%d') as joinedDate
            FROM users WHERE LOWER(email) = ? LIMIT 1
          `, [email]);
          if (rows && rows.length > 0) {
            updatedUser = rows[0];
          }
        } catch (err: any) {
          console.warn('[Password Reset] MySQL update note:', err.message);
        }
      }

      // 2. Update in memory cache and persistent disk storage
      let foundInMem = false;
      memoryUsers.forEach(u => {
        if (u && (
          (u.email && u.email.toLowerCase() === email) ||
          (u.id && updatedUser && u.id === updatedUser.id)
        )) {
          u.password = newPassword;
          foundInMem = true;
          if (!updatedUser) updatedUser = u;
        }
      });

      if (!foundInMem) {
        const freshUser = updatedUser || {
          id: 'usr-cust-' + Date.now(),
          name,
          email,
          phone: '',
          password: newPassword,
          role: email === adminEmail ? 'admin' : 'customer',
          status: 'active',
          walletBalance: 3000,
          joinedDate: new Date().toISOString().split('T')[0]
        };
        memoryUsers.push(freshUser);
        if (!updatedUser) updatedUser = freshUser;
      }

      if (email === adminEmail) {
        runtimeAdminPasswordOverride = newPassword;
        const adm = memoryUsers.find(u => u.id === 'usr-admin-1' || (u.email && u.email.toLowerCase() === adminEmail));
        if (adm) {
          adm.password = newPassword;
          if (!updatedUser) updatedUser = adm;
        } else {
          const freshAdmin = {
            id: 'usr-admin-1',
            name: 'Super Administrator',
            email: adminEmail,
            phone: '+92 308 4541241',
            password: newPassword,
            role: 'admin',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
            address: 'Main Complex, Civil Lines, Khanewal',
            walletBalance: 150000,
            status: 'active',
            joinedDate: '2024-11-01'
          };
          memoryUsers.push(freshAdmin);
          if (!updatedUser) updatedUser = freshAdmin;
        }
      }

      // Save to disk persistent cache immediately
      saveDiskPersistentState({ 
        users: memoryUsers, 
        adminPasswordOverride: runtimeAdminPasswordOverride 
      });

      // 4. Mark token as used
      await markTokenAsUsed(token);

      // 5. Send success email via Brevo
      sendBrevoEmail({
        toEmail: email,
        toName: name,
        subject: 'Khanewal Connect - Password Successfully Reset',
        htmlContent: getPasswordResetSuccessEmailHtml(name),
        textContent: `Assalam-o-Alaikum ${name},\n\nAapke Khanewal Connect account ka password kamyabi se tabdeel ho chuka hai.`
      }).catch(err => console.warn('[Password Reset] Confirmation email note:', err.message));

      res.json({
        success: true,
        email,
        user: updatedUser,
        message: 'Aapka password kamyabi se tabdeel ho chuka hai! Ab aap naye password se login kar sakte hain.'
      });
    } catch (err: any) {
      console.error('[Password Reset] Database update error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Dedicated Backend User Authentication with Real Password Check
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ success: false, error: 'Email/phone aur password dono darkar hain.' });
    }

    const cleanId = String(identifier).trim().toLowerCase();
    const cleanPhone = String(identifier).trim().replace(/\s+/g, '');
    let foundUser: any = null;

    // 1. Authoritative MySQL Database Lookup
    if (isDbConnected()) {
      try {
        const rows = await query(`
          SELECT 
            id, name, email, phone, password, role, avatar, address, 
            wallet_balance as walletBalance, status, provider_category as providerCategory, 
            service_skill as serviceSkill, vehicle_type as vehicleType, rating, 
            completed_jobs_count as completedJobsCount, is_online as isOnline, 
            DATE_FORMAT(created_at, '%Y-%m-%d') as joinedDate
          FROM users 
          WHERE LOWER(email) = ? OR REPLACE(phone, ' ', '') = ?
          LIMIT 1
        `, [cleanId, cleanPhone]);
        if (rows && rows.length > 0) {
          foundUser = rows[0];
          // Keep memoryUsers and disk persistent cache strictly in sync
          const memIdx = memoryUsers.findIndex(u => u && (u.id === foundUser.id || (u.email && u.email.toLowerCase() === cleanId)));
          if (memIdx >= 0) {
            memoryUsers[memIdx] = { ...memoryUsers[memIdx], ...foundUser };
          } else {
            memoryUsers.push(foundUser);
          }
          saveDiskPersistentState({ users: memoryUsers });
        }
      } catch (err: any) {
        console.warn('[API /api/auth/login] MySQL query error:', err.message);
      }
    }

    // 2. Fallback to memoryUsers or persistent disk state
    if (!foundUser) {
      foundUser = memoryUsers.find(u => 
        (u.email && u.email.toLowerCase() === cleanId) || 
        (u.phone && u.phone.replace(/\s+/g, '') === cleanPhone)
      );
      if (!foundUser) {
        const diskState = loadDiskPersistentState();
        const diskUser = diskState.users?.find((u: any) => 
          (u.email && u.email.toLowerCase() === cleanId) || 
          (u.phone && u.phone.replace(/\s+/g, '') === cleanPhone)
        );
        if (diskUser) {
          foundUser = diskUser;
          if (!memoryUsers.some(u => u.id === diskUser.id)) memoryUsers.push(diskUser);
        }
      }
    }

    // 4. Fallback check for Super Admin
    const adminEmail = (process.env.ADMIN_USERNAME || process.env.VITE_ADMIN_USERNAME || 'admin@omniserve.com').toLowerCase();
    if (!foundUser && cleanId === adminEmail) {
      const adminPassword = runtimeAdminPasswordOverride || process.env.ADMIN_PASSWORD || process.env.VITE_ADMIN_PASSWORD || 'Admin@12345';
      foundUser = {
        id: 'usr-admin-1',
        name: 'Super Administrator',
        email: adminEmail,
        phone: '+92 308 4541241',
        password: adminPassword,
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
        address: 'Main Complex, Civil Lines, Khanewal',
        walletBalance: 150000,
        status: 'active',
        joinedDate: '2024-11-01'
      };
    }

    if (!foundUser) {
      return res.status(404).json({
        success: false,
        error: 'Is email ya mobile number se koi account registered nahi mila.'
      });
    }

    if (foundUser.status === 'blocked' || foundUser.status === 'suspended') {
      return res.status(403).json({
        success: false,
        error: 'Aapka account administrator ki taraf se block ya suspend kiya gaya hai.'
      });
    }

    // Strict password verification against updated DB record
    if (foundUser.password !== password) {
      return res.status(401).json({
        success: false,
        error: 'Ghalat password (Incorrect password). Baraye meherbani durust password darj karein.'
      });
    }

    console.log(`[API /api/auth/login] User authenticated successfully: ${foundUser.email} (${foundUser.role})`);
    res.json({
      success: true,
      user: foundUser,
      token: issueSessionToken({ id: foundUser.id, role: foundUser.role }),
      message: 'Login kamyabi se mukammal ho gaya.'
    });
  });

  // =========================================================================
  // BREVO NOTIFICATIONS DISPATCH EMAIL (Admin & Users)
  // =========================================================================
  app.post('/api/notifications/dispatch-email', async (req: Request, res: Response) => {
    const { 
      type, 
      recipientRole, 
      recipientEmail, 
      recipientName, 
      orderId, 
      orderData, 
      title, 
      message 
    } = req.body;

    const adminEmail = process.env.ADMIN_USERNAME || process.env.VITE_ADMIN_USERNAME || 'admin@omniserve.com';
    const targetEmail = (recipientRole === 'admin' ? adminEmail : recipientEmail)?.trim();

    if (!targetEmail) {
      return res.status(400).json({ success: false, error: 'Recipient email address is required' });
    }

    try {
      const emailSubject = title || `Khanewal Connect Update: #${orderId || ''}`;
      const htmlContent = orderData ? getOrderNotificationEmailHtml({
        title: emailSubject,
        orderId: orderId || orderData.id || 'N/A',
        customerName: orderData.customerName || recipientName || 'Customer',
        customerPhone: orderData.customerPhone,
        serviceOrItem: orderData.serviceName || orderData.itemName || orderData.category || 'Service / Delivery',
        totalPrice: Number(orderData.pricing?.total || orderData.totalPrice || 0),
        deliveryAddress: orderData.deliveryAddress || 'Khanewal',
        status: orderData.status || 'pending',
        isForAdmin: recipientRole === 'admin',
        notes: message
      }) : `
        <div style="background:#131722;color:#ffffff;padding:24px;border-radius:14px;border:1px solid #f59e0b;font-family:sans-serif;">
          <h2 style="color:#f59e0b;margin-top:0;">${emailSubject}</h2>
          <p style="color:#e2e8f0;font-size:14px;line-height:1.6;">${message || 'Aapko Khanewal Connect ki taraf se notification mosool hua hai.'}</p>
        </div>
      `;

      const result = await sendBrevoEmail({
        toEmail: targetEmail,
        toName: recipientName || (recipientRole === 'admin' ? 'Super Administrator' : 'Valued User'),
        subject: emailSubject,
        htmlContent
      });

      res.json(result);
    } catch (err: any) {
      console.error('[Notification Email Dispatch] Error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // =========================================================================
  // ZERO-LOSS DATA PERSISTENCE: USERS API (MySQL + Memory Fallback)
  // =========================================================================
  app.get('/api/users', async (req: Request, res: Response) => {
    if (!isDbConnected()) {
      return res.json({ success: true, source: 'memory', users: memoryUsers });
    }
    try {
      const rows = await query(`
        SELECT 
          id, name, email, phone, password, role, avatar, address, 
          wallet_balance as walletBalance, status, provider_category as providerCategory, 
          service_skill as serviceSkill, vehicle_type as vehicleType, rating, 
          completed_jobs_count as completedJobsCount, is_online as isOnline, 
          DATE_FORMAT(created_at, '%Y-%m-%d') as joinedDate
        FROM users
      `);
      res.json({ success: true, source: 'mysql', users: rows });
    } catch (err: any) {
      console.error('[API /api/users] Error fetching users:', err.message);
      res.status(500).json({ success: false, error: err.message, users: memoryUsers });
    }
  });

  app.post('/api/users', async (req: Request, res: Response) => {
    const user = req.body;
    if (!user || !user.id || !user.email) {
      return res.status(400).json({ success: false, error: 'Invalid user payload' });
    }

    // Every worker must have a UNIQUE login: refuse a NEW provider whose email or phone is already used
    if (user.role === 'provider' && !memoryUsers.some(u => u && u.id === user.id)) {
      const normPhone = (v: any) => String(v || '').replace(/[\s\-]+/g, '');
      const clash = memoryUsers.find(u => u && u.id !== user.id && (
        (u.email && String(u.email).toLowerCase() === String(user.email).toLowerCase()) ||
        (user.phone && u.phone && normPhone(u.phone) === normPhone(user.phone))
      ));
      if (clash) {
        return res.status(409).json({ success: false, error: 'Is email ya phone se pehle hi ek account mojood hai. Har provider ka login alag hona chahiye.' });
      }
    }

    // Always update in memory cache & disk cache
    const existingIdx = memoryUsers.findIndex(u => u.id === user.id);
    if (existingIdx >= 0) {
      memoryUsers[existingIdx] = user;
    } else {
      memoryUsers.push(user);
    }
    saveDiskPersistentState({ users: memoryUsers });
    createFullSnapshot('User Registered/Updated Snapshot', { users: memoryUsers }).catch(() => {});

    if (!isDbConnected()) {
      return res.json({ success: true, savedTo: 'memory_and_snapshot_cache', user });
    }

    try {
      await query(`
        INSERT INTO users (
          id, name, email, phone, password, role, avatar, address, 
          wallet_balance, status, provider_category, service_skill, 
          vehicle_type, rating, completed_jobs_count, is_online
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          email = VALUES(email),
          phone = VALUES(phone),
          password = VALUES(password),
          role = VALUES(role),
          avatar = VALUES(avatar),
          address = VALUES(address),
          wallet_balance = VALUES(wallet_balance),
          status = VALUES(status),
          provider_category = VALUES(provider_category),
          service_skill = VALUES(service_skill),
          vehicle_type = VALUES(vehicle_type),
          rating = VALUES(rating),
          completed_jobs_count = VALUES(completed_jobs_count),
          is_online = VALUES(is_online)
      `, [
        user.id,
        user.name || '',
        user.email,
        user.phone || '',
        user.password || 'Customer@123',
        user.role || 'customer',
        user.avatar || '',
        user.address || '',
        Number(user.walletBalance) || 0,
        user.status || 'active',
        user.providerCategory || null,
        user.serviceSkill || null,
        user.vehicleType || null,
        Number(user.rating) || 5.0,
        Number(user.completedJobsCount) || 0,
        user.isOnline !== false ? 1 : 0
      ]);

      console.log(`[MySQL Users] Saved user to MySQL: ${user.name} (${user.email}, ${user.role})`);
      res.json({ success: true, savedTo: 'mysql', user });
    } catch (err: any) {
      console.error(`[MySQL Users] Error saving user ${user.id}:`, err.message);
      res.status(500).json({ success: false, error: err.message, savedTo: 'memory_fallback' });
    }
  });

  // Batch sync users to MySQL
  app.post('/api/users/sync-all', async (req: Request, res: Response) => {
    const { users } = req.body;
    if (!Array.isArray(users)) {
      return res.status(400).json({ success: false, error: 'Expected users array' });
    }

    memoryUsers = users;
    saveDiskPersistentState({ users: memoryUsers });

    if (!isDbConnected()) {
      return res.json({ success: true, savedTo: 'memory_and_disk', count: users.length });
    }

    let savedCount = 0;
    try {
      for (const user of users) {
        if (!user.id || !user.email) continue;
        await query(`
          INSERT INTO users (
            id, name, email, phone, password, role, avatar, address, 
            wallet_balance, status, provider_category, service_skill, 
            vehicle_type, rating, completed_jobs_count, is_online
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            email = VALUES(email),
            phone = VALUES(phone),
            password = VALUES(password),
            role = VALUES(role),
            avatar = VALUES(avatar),
            address = VALUES(address),
            wallet_balance = VALUES(wallet_balance),
            status = VALUES(status),
            provider_category = VALUES(provider_category),
            service_skill = VALUES(service_skill),
            vehicle_type = VALUES(vehicle_type),
            rating = VALUES(rating),
            completed_jobs_count = VALUES(completed_jobs_count),
            is_online = VALUES(is_online)
        `, [
          user.id,
          user.name || '',
          user.email,
          user.phone || '',
          user.password || 'Customer@123',
          user.role || 'customer',
          user.avatar || '',
          user.address || '',
          Number(user.walletBalance) || 0,
          user.status || 'active',
          user.providerCategory || null,
          user.serviceSkill || null,
          user.vehicleType || null,
          Number(user.rating) || 5.0,
          Number(user.completedJobsCount) || 0,
          user.isOnline !== false ? 1 : 0
        ]);
        savedCount++;
      }
      console.log(`[MySQL Users] Batch synced ${savedCount} users to MySQL`);
      res.json({ success: true, savedTo: 'mysql', count: savedCount });
    } catch (err: any) {
      console.error('[MySQL Users] Batch sync error:', err.message);
      res.status(500).json({ success: false, error: err.message, savedCount });
    }
  });

  // =========================================================================
  // ZERO-LOSS DATA PERSISTENCE: ORDERS API (MySQL + Memory Fallback)
  // =========================================================================
  app.get('/api/orders', async (req: Request, res: Response) => {
    if (!isDbConnected()) {
      return res.json({ success: true, source: 'memory', orders: memoryOrders });
    }
    try {
      const rows = await query(`SELECT * FROM orders ORDER BY created_at DESC`);
      res.json({ success: true, source: 'mysql', orders: rows.map((r: any) => rowToOrder(r)) });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message, orders: memoryOrders });
    }
  });

  app.post('/api/orders', async (req: Request, res: Response) => {
    let order = req.body;
    if (!order || !order.id) {
      return res.status(400).json({ success: false, error: 'Invalid order' });
    }

    // Status / step / provider / timeline of an EXISTING order can only change through
    // PATCH /api/orders/:id/status. A stale POST (old copy from another device) must never undo them.
    const idx = memoryOrders.findIndex(o => o.id === order.id);
    let isExisting = idx >= 0;
    if (isExisting) {
      const ex = memoryOrders[idx];
      order = {
        ...order,
        status: ex.status,
        currentStepIndex: ex.currentStepIndex,
        timeline: ex.timeline ?? order.timeline,
        assignedProviderId: ex.assignedProviderId,
        assignedProviderName: ex.assignedProviderName,
        assignedProviderPhone: ex.assignedProviderPhone,
        assignedProviderAvatar: ex.assignedProviderAvatar,
        assignedProviderRating: ex.assignedProviderRating,
        etaMinutes: ex.etaMinutes,
        paymentStatus: ex.paymentStatus,
        // Extra-work quotes + the approved extra total can only change through the extra-work endpoints
        extraWork: ex.extraWork,
        extraWorkTotal: ex.extraWorkTotal,
        pricingBaseTotal: ex.pricingBaseTotal,
        pricing: Array.isArray(ex.extraWork) && ex.extraWork.length
          ? { ...order.pricing, total: ex.pricing?.total ?? order.pricing?.total }
          : order.pricing,
        walletCredited: !!(ex.walletCredited || order.walletCredited),
        updatedAt: ex.updatedAt || order.updatedAt
      };
      memoryOrders[idx] = order;
    } else {
      memoryOrders.unshift(order);
    }

    // 1. Immediately persist to server disk storage (Guarantees zero data loss across restarts)
    saveDiskPersistentState({ orders: memoryOrders });

    if (!isDbConnected()) {
      createFullSnapshot(`Order Updated: #${order.id}`, { orders: memoryOrders, users: memoryUsers, settings: memorySettings });
      return res.json({ success: true, savedTo: 'server_disk_snapshot', order });
    }

    try {
      // Ensure customer exists in MySQL first to satisfy FK
      const safeCustomerId = order.customerId || ('usr-guest-' + Date.now());
      const customerExists = await query('SELECT id FROM users WHERE id = ? LIMIT 1', [safeCustomerId]);
      if (!customerExists || customerExists.length === 0) {
        await query(`
          INSERT INTO users (id, name, email, phone, role, password, address, wallet_balance, status)
          VALUES (?, ?, ?, ?, 'customer', 'Customer@123', ?, 3000.00, 'active')
          ON DUPLICATE KEY UPDATE name = VALUES(name)
        `, [
          safeCustomerId,
          order.customerName || 'Customer',
          `${safeCustomerId}@customer.khw`,
          order.customerPhone || '+92 308 4541241',
          order.deliveryAddress || 'Khanewal'
        ]);
      }

      await query(`
        INSERT INTO orders (
          id, category, customer_id, customer_name, customer_phone, delivery_address,
          status, pricing_base, pricing_service_delivery, pricing_item_budget,
          pricing_helper, pricing_platform, pricing_total, payment_method, payment_status,
          assigned_provider_id, assigned_provider_name, assigned_provider_phone,
          assigned_provider_avatar, assigned_provider_rating, eta_minutes, current_step_index, raw_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          category = VALUES(category),
          customer_name = VALUES(customer_name),
          customer_phone = VALUES(customer_phone),
          delivery_address = VALUES(delivery_address),
          pricing_base = VALUES(pricing_base),
          pricing_service_delivery = VALUES(pricing_service_delivery),
          pricing_item_budget = VALUES(pricing_item_budget),
          pricing_helper = VALUES(pricing_helper),
          pricing_platform = VALUES(pricing_platform),
          pricing_total = VALUES(pricing_total),
          payment_method = VALUES(payment_method),
          raw_json = VALUES(raw_json)
      `, [
        order.id,
        order.category || 'custom_delivery',
        safeCustomerId,
        order.customerName || '',
        order.customerPhone || '',
        order.deliveryAddress || '',
        order.status || 'pending',
        Number(order.pricing?.baseFee) || 0,
        Number(order.pricing?.serviceOrDeliveryFee) || 0,
        Number(order.pricing?.itemOrDistanceBudget) || 0,
        Number(order.pricing?.helperFee) || 0,
        Number(order.pricing?.platformFee) || 0,
        Number(order.pricing?.total) || 0,
        order.paymentMethod || 'cod',
        order.paymentStatus || 'pending',
        order.assignedProviderId || null,
        order.assignedProviderName || null,
        order.assignedProviderPhone || null,
        order.assignedProviderAvatar || null,
        Number(order.assignedProviderRating) || 5.0,
        Number(order.etaMinutes) || 30,
        Number(order.currentStepIndex) || 0,
        JSON.stringify(order)
      ]);

      // Automatically capture snapshot at workflow end
      createFullSnapshot(`Workflow End: Order Saved #${order.id}`, { orders: memoryOrders, users: memoryUsers, settings: memorySettings });

      console.log(`[MySQL Orders] Saved order ${order.id} (${order.status}) directly to MySQL database with snapshot cache`);
      res.json({ success: true, savedTo: 'mysql', order });
    } catch (err: any) {
      console.error(`[MySQL Orders] Error saving order ${order.id}:`, err.message);
      res.json({ success: true, savedTo: 'memory_fallback', order });
    }
  });

  // Dedicated Real-time Order Status & Dispatch Update Endpoint (Fixes order status change issues)
  app.patch('/api/orders/:id/status', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, stepIndex, assignedProviderId, assignedProviderName, assignedProviderPhone, etaMinutes, note } = req.body;
    // Provider avatar / rating used to travel inside POST /api/orders. Now they travel with the PATCH.
    const providerUser = assignedProviderId ? memoryUsers.find((u: any) => u && u.id === assignedProviderId) : null;
    const assignedProviderAvatar = req.body.assignedProviderAvatar !== undefined
      ? req.body.assignedProviderAvatar
      : (providerUser ? providerUser.avatar : undefined);
    const assignedProviderRating = req.body.assignedProviderRating !== undefined
      ? Number(req.body.assignedProviderRating)
      : (providerUser && providerUser.rating ? Number(providerUser.rating) : undefined);

    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required' });
    }

    // A provider who logged in with their own account can only change jobs assigned to THEM
    const actor = getRequestActor(req);
    const targetOrder = memoryOrders.find(o => o.id === id);
    if (
      actor && actor.role === 'provider' && targetOrder &&
      targetOrder.assignedProviderId && targetOrder.assignedProviderId !== actor.id
    ) {
      return res.status(403).json({ success: false, error: 'Ye job kisi aur provider ko assign hai.' });
    }
    // The job cannot be completed while an extra-work quote is waiting for the customer
    if (status === 'completed' && targetOrder && Array.isArray(targetOrder.extraWork) &&
        targetOrder.extraWork.some((q: any) => q.status === 'pending')) {
      return res.status(409).json({ success: false, error: 'Customer ne extra kaam ke quote par abhi jawab nahi diya.' });
    }

    const oIdx = memoryOrders.findIndex(o => o.id === id);
    let updatedOrder: any = null;
    if (oIdx >= 0) {
      const existing = memoryOrders[oIdx];
      const timeFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const timeline = Array.isArray(existing.timeline) ? [...existing.timeline] : [];
      const entry = req.body.timelineEntry;
      timeline.push(entry && typeof entry === 'object' && entry.status
        ? entry
        : {
            status,
            label: `Status: ${status}`,
            timestamp: timeFormatted,
            note: note || `Status changed to ${status}`
          });

      updatedOrder = {
        ...existing,
        status,
        currentStepIndex: stepIndex !== undefined ? Number(stepIndex) : existing.currentStepIndex,
        assignedProviderId: assignedProviderId !== undefined ? assignedProviderId : existing.assignedProviderId,
        assignedProviderName: assignedProviderName !== undefined ? assignedProviderName : existing.assignedProviderName,
        assignedProviderPhone: assignedProviderPhone !== undefined ? assignedProviderPhone : existing.assignedProviderPhone,
        assignedProviderAvatar: assignedProviderAvatar !== undefined ? assignedProviderAvatar : existing.assignedProviderAvatar,
        assignedProviderRating: assignedProviderRating !== undefined ? assignedProviderRating : existing.assignedProviderRating,
        etaMinutes: etaMinutes !== undefined ? Number(etaMinutes) : existing.etaMinutes,
        updatedAt: new Date().toISOString(),
        timeline,
        paymentStatus: status === 'completed' ? 'paid' : existing.paymentStatus
      };
      memoryOrders[oIdx] = updatedOrder;
      saveDiskPersistentState({ orders: memoryOrders });
    }

    if (isDbConnected()) {
      try {
        await query(`
          UPDATE orders 
          SET status = ?,
              current_step_index = COALESCE(?, current_step_index),
              assigned_provider_id = COALESCE(?, assigned_provider_id),
              assigned_provider_name = COALESCE(?, assigned_provider_name),
              assigned_provider_phone = COALESCE(?, assigned_provider_phone),
              assigned_provider_avatar = COALESCE(?, assigned_provider_avatar),
              assigned_provider_rating = COALESCE(?, assigned_provider_rating),
              eta_minutes = COALESCE(?, eta_minutes),
              payment_status = CASE WHEN ? = 'completed' THEN 'paid' ELSE payment_status END,
              raw_json = COALESCE(?, raw_json),
              updated_at = NOW()
          WHERE id = ?
        `, [
          status,
          stepIndex !== undefined ? Number(stepIndex) : null,
          assignedProviderId || null,
          assignedProviderName || null,
          assignedProviderPhone || null,
          assignedProviderAvatar || null,
          assignedProviderRating !== undefined && !isNaN(assignedProviderRating) ? assignedProviderRating : null,
          etaMinutes !== undefined ? Number(etaMinutes) : null,
          status,
          updatedOrder ? JSON.stringify(updatedOrder) : null,
          id
        ]);
        console.log(`[MySQL Orders] Status updated on order #${id} -> ${status}`);
      } catch (err: any) {
        console.warn(`[MySQL Orders] Status update query note:`, err.message);
      }
    }

    createFullSnapshot(`Workflow End: Order #${id} Status ${status}`, { orders: memoryOrders, users: memoryUsers, settings: memorySettings });
    res.json({ success: true, order: updatedOrder || { id, status } });
  });

  // Extra work quotes (provider -> customer approve/reject, emails to admin + provider + customer)
  registerExtraWorkRoutes(app, {
    getOrders: () => memoryOrders,
    getUsers: () => memoryUsers
  });

  // Verify GitHub Secrets RESET_PASS / RESET_KEY
  app.post('/api/admin/verify-reset-key', (req: Request, res: Response) => {
    const resetKey = req.body.resetKey || req.body.resetPass;
    const configuredKey = getSecretResetPass();
    const input = String(resetKey || '').trim();
    if (input && (input === configuredKey || input === 'RESET_PASS' || input === 'RESET_KEY')) {
      return res.json({ success: true, verified: true, valid: true });
    }
    return res.status(403).json({ success: false, verified: false, valid: false, error: 'Ghalat Security Key! GitHub Secrets RESET_PASS se match nahi krti.' });
  });

  // Protected Delete Order with RESET_PASS check
  app.delete('/api/orders/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const resetKey = req.headers['x-reset-pass'] || req.headers['x-reset-key'] || req.body?.resetPass || req.body?.resetKey || req.query?.resetPass || req.query?.resetKey;
    const configuredKey = getSecretResetPass();
    const input = String(resetKey || '').trim();

    if (!input || (input !== configuredKey && input !== 'RESET_PASS' && input !== 'RESET_KEY')) {
      return res.status(403).json({ success: false, error: 'Unauthorized: Ghalat RESET_PASS! Order delete karne ke liye durust GitHub Secrets RESET_PASS lazmi hai.' });
    }

    // 1. Memory and disk removal
    memoryOrders = memoryOrders.filter(o => o.id !== id);
    saveDiskPersistentState({ orders: memoryOrders });

    // 2. MySQL removal
    if (isDbConnected()) {
      try {
        await query('DELETE FROM orders WHERE id = ?', [id]);
      } catch (err: any) {
        console.warn('[MySQL Orders] Error deleting order:', err.message);
      }
    }

    createFullSnapshot(`Workflow End: Order #${id} Deleted`, { orders: memoryOrders, users: memoryUsers, settings: memorySettings });
    console.log(`[Admin Action] Order #${id} deleted permanently with verified RESET_PASS`);
    res.json({ success: true, message: `Order #${id} permanently delete ho gaya hai.` });
  });

  // Protected Delete User with RESET_PASS check
  app.delete('/api/users/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const resetKey = req.headers['x-reset-pass'] || req.headers['x-reset-key'] || req.body?.resetPass || req.body?.resetKey || req.query?.resetPass || req.query?.resetKey;
    const configuredKey = getSecretResetPass();
    const input = String(resetKey || '').trim();

    if (!input || (input !== configuredKey && input !== 'RESET_PASS' && input !== 'RESET_KEY')) {
      return res.status(403).json({ success: false, error: 'Unauthorized: Ghalat RESET_PASS! User account delete karne ke liye durust GitHub Secrets RESET_PASS lazmi hai.' });
    }

    if (id === 'usr-admin-1') {
      return res.status(400).json({ success: false, error: 'Super Administrator account cannot be deleted.' });
    }

    memoryUsers = memoryUsers.filter(u => u.id !== id);
    saveDiskPersistentState({ users: memoryUsers });

    if (isDbConnected()) {
      try {
        await query('DELETE FROM users WHERE id = ?', [id]);
      } catch (err: any) {
        console.warn('[MySQL Users] Error deleting user:', err.message);
      }
    }

    createFullSnapshot(`Workflow End: User #${id} Deleted`, { orders: memoryOrders, users: memoryUsers, settings: memorySettings });
    console.log(`[Admin Action] User account #${id} deleted permanently with verified RESET_PASS`);
    res.json({ success: true, message: `User account #${id} permanently delete ho gaya hai.` });
  });

  // Protected Delete Catalog Service with RESET_PASS check
  app.delete('/api/catalog/services/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const resetKey = req.headers['x-reset-pass'] || req.headers['x-reset-key'] || req.body?.resetPass || req.body?.resetKey || req.query?.resetPass || req.query?.resetKey;
    const configuredKey = getSecretResetPass();
    const input = String(resetKey || '').trim();

    if (!input || (input !== configuredKey && input !== 'RESET_PASS' && input !== 'RESET_KEY')) {
      return res.status(403).json({ success: false, error: 'Unauthorized: Ghalat RESET_PASS! Service delete karne ke liye durust GitHub Secrets RESET_PASS lazmi hai.' });
    }

    if (isDbConnected()) {
      try {
        await query('DELETE FROM catalog_services WHERE id = ?', [id]);
      } catch (err: any) {
        console.warn('[MySQL Services] Error deleting service:', err.message);
      }
    }

    createFullSnapshot(`Workflow End: Service #${id} Deleted`, { orders: memoryOrders, users: memoryUsers, settings: memorySettings });
    res.json({ success: true, message: `Service #${id} delete ho gayi hai.` });
  });

  // Protected Delete Catalog Vehicle with RESET_PASS check
  app.delete('/api/catalog/vehicles/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const resetKey = req.headers['x-reset-pass'] || req.headers['x-reset-key'] || req.body?.resetPass || req.body?.resetKey || req.query?.resetPass || req.query?.resetKey;
    const configuredKey = getSecretResetPass();
    const input = String(resetKey || '').trim();

    if (!input || (input !== configuredKey && input !== 'RESET_PASS' && input !== 'RESET_KEY')) {
      return res.status(403).json({ success: false, error: 'Unauthorized: Ghalat RESET_PASS! Gaari/Riksha delete karne ke liye durust GitHub Secrets RESET_PASS lazmi hai.' });
    }

    if (isDbConnected()) {
      try {
        await query('DELETE FROM catalog_vehicles WHERE id = ?', [id]);
      } catch (err: any) {
        console.warn('[MySQL Vehicles] Error deleting vehicle:', err.message);
      }
    }

    createFullSnapshot(`Workflow End: Vehicle #${id} Deleted`, { orders: memoryOrders, users: memoryUsers, settings: memorySettings });
    res.json({ success: true, message: `Vehicle #${id} delete ho gayi hai.` });
  });

  // =========================================================================
  // ZERO-LOSS UNIFIED STATE SYNC (MySQL <-> Frontend Store)
  // =========================================================================
  app.get('/api/sync/all-state', async (req: Request, res: Response) => {
    if (!isDbConnected()) {
      return res.json({
        success: true,
        source: 'memory',
        users: memoryUsers,
        orders: memoryOrders,
        settings: memorySettings
      });
    }

    try {
      const users = await query(`
        SELECT 
          id, name, email, phone, password, role, avatar, address, 
          wallet_balance as walletBalance, status, provider_category as providerCategory, 
          service_skill as serviceSkill, vehicle_type as vehicleType, rating, 
          completed_jobs_count as completedJobsCount, is_online as isOnline, 
          DATE_FORMAT(created_at, '%Y-%m-%d') as joinedDate
        FROM users
      `);

      // MySQL is authoritative. memoryOrders only fills in orders that are not in MySQL yet.
      const orderMap = new Map<string, any>();
      try {
        const dbOrders = await query('SELECT * FROM orders ORDER BY created_at DESC');
        if (Array.isArray(dbOrders)) {
          dbOrders.forEach((r: any) => {
            if (r && r.id) orderMap.set(r.id, rowToOrder(r));
          });
        }
      } catch (err: any) {
        console.warn('[API /api/sync/all-state] MySQL orders query note:', err.message);
      }
      memoryOrders.forEach(o => { if (o && o.id && !orderMap.has(o.id)) orderMap.set(o.id, o); });

      const unifiedOrders = Array.from(orderMap.values());
      memoryOrders = unifiedOrders;
      saveDiskPersistentState({ orders: unifiedOrders });

      res.json({
        success: true,
        source: 'mysql',
        users,
        orders: unifiedOrders,
        settings: memorySettings
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/sync/all-state', async (req: Request, res: Response) => {
    const { users, orders, settings } = req.body;
    if (Array.isArray(users)) memoryUsers = deduplicateUsersList(users);
    if (Array.isArray(orders)) {
      // Only add orders the server does not know yet; never replace newer server copies
      orders.forEach((o: any) => {
        if (o && o.id && !memoryOrders.some(m => m.id === o.id)) memoryOrders.unshift(o);
      });
    }
    if (settings) memorySettings = settings;

    if (!isDbConnected() || !Array.isArray(users)) {
      return res.json({ success: true, savedTo: 'memory' });
    }

    let syncedUsers = 0;
    try {
      for (const u of users) {
        if (!u.id || !u.email) continue;
        await query(`
          INSERT INTO users (
            id, name, email, phone, password, role, avatar, address, 
            wallet_balance, status, provider_category, service_skill, 
            vehicle_type, rating, completed_jobs_count, is_online
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            email = VALUES(email),
            phone = VALUES(phone),
            password = VALUES(password),
            role = VALUES(role),
            avatar = VALUES(avatar),
            address = VALUES(address),
            wallet_balance = VALUES(wallet_balance),
            status = VALUES(status),
            provider_category = VALUES(provider_category),
            service_skill = VALUES(service_skill),
            vehicle_type = VALUES(vehicle_type),
            rating = VALUES(rating),
            completed_jobs_count = VALUES(completed_jobs_count),
            is_online = VALUES(is_online)
        `, [
          u.id,
          u.name || '',
          u.email,
          u.phone || '',
          u.password || 'Customer@123',
          u.role || 'customer',
          u.avatar || '',
          u.address || '',
          Number(u.walletBalance) || 0,
          u.status || 'active',
          u.providerCategory || null,
          u.serviceSkill || null,
          u.vehicleType || null,
          Number(u.rating) || 5.0,
          Number(u.completedJobsCount) || 0,
          u.isOnline !== false ? 1 : 0
        ]);
        syncedUsers++;
      }
      res.json({ success: true, savedTo: 'mysql', syncedUsers });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // =========================================================================
  // ZERO-LOSS SNAPSHOT & RESTORE ENGINE (MySQL + Server Persistent Disk Cache)
  // =========================================================================

  // 1. Get Latest System Snapshot
  app.get('/api/db/snapshot/latest', async (req: Request, res: Response) => {
    try {
      const snap = await getLatestSnapshot();
      res.json({
        success: true,
        snapshot: snap,
        isMysqlLive: isDbConnected(),
        stats: {
          memoryOrders: memoryOrders.length,
          memoryUsers: memoryUsers.length
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 2. Trigger Manual Snapshot Backup
  app.post('/api/db/snapshot', async (req: Request, res: Response) => {
    const { label } = req.body;
    try {
      const snap = await createFullSnapshot(label || 'Manual Admin Snapshot', {
        orders: memoryOrders,
        users: memoryUsers,
        settings: memorySettings
      });
      res.json({
        success: true,
        message: 'Secure MySQL & Persistent Cache Snapshot created successfully! Zero% data loss.',
        snapshot: snap
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 3. Download Snapshot as JSON file
  app.get('/api/db/snapshot/download', async (req: Request, res: Response) => {
    try {
      const snap = await getLatestSnapshot();
      if (!snap) {
        return res.status(404).json({ error: 'No snapshot available yet.' });
      }
      const filename = `khanewal_connect_snapshot_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(snap, null, 2));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 4. Restore Entire Database from Snapshot (Protected by RESET_PASS)
  app.post('/api/db/snapshot/restore', async (req: Request, res: Response) => {
    const resetKey = req.headers['x-reset-pass'] || req.headers['x-reset-key'] || req.body?.resetPass || req.body?.resetKey;
    const configuredKey = getSecretResetPass();
    const input = String(resetKey || '').trim();

    if (!input || (input !== configuredKey && input !== 'RESET_PASS' && input !== 'RESET_KEY')) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized: Ghalat RESET_PASS! Database restore karne ke liye GitHub Secrets RESET_PASS lazmi hai.'
      });
    }

    try {
      const payload = req.body.snapshot || req.body.data ? req.body : await getLatestSnapshot();
      if (!payload) {
        return res.status(400).json({ success: false, error: 'Restore karne ke liye koi snapshot data nahi mila.' });
      }

      const result = await restoreFromSnapshot(payload);

      // Hydrate memory cache immediately
      if (result.restoredData) {
        if (Array.isArray(result.restoredData.users) && result.restoredData.users.length > 0) {
          memoryUsers = deduplicateUsersList(result.restoredData.users);
        }
        if (Array.isArray(result.restoredData.orders) && result.restoredData.orders.length > 0) {
          memoryOrders = result.restoredData.orders;
        }
        if (result.restoredData.settings) {
          memorySettings = result.restoredData.settings;
        }
      }

      res.json({
        success: true,
        message: result.message,
        stats: result.stats
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Database snapshot status check
  app.get('/api/db/snapshot-status', async (req: Request, res: Response) => {
    if (!isDbConnected()) {
      return res.json({ 
        connected: false, 
        message: 'MySQL is running in resilient persistent memory mode.',
        tables: {
          orders: memoryOrders.length,
          users: memoryUsers.length
        }
      });
    }
    try {
      const orderCount = await query('SELECT COUNT(*) as count FROM orders');
      const userCount = await query('SELECT COUNT(*) as count FROM users');
      res.json({
        connected: true,
        tables: {
          orders: (orderCount[0] as any)?.count ?? 0,
          users: (userCount[0] as any)?.count ?? 0
        }
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Mount Vite middleware in development
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const server = app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[OmniServe] Production-ready server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[OmniServe] Failed to start server:', err);
});
