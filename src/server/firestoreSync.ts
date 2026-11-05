import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc,
  collection, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');
const DATA_DIR = path.resolve(rootDir, 'data');
const STATE_FILE_PATH = path.resolve(DATA_DIR, 'server_persistent_state.json');

// Ensure data folder exists
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (e) {
  console.warn('[FirestoreSync] Note creating data dir:', e);
}

// Load Firebase Config
function loadFirebaseConfig() {
  let config: any = {};
  const configPath = path.resolve(rootDir, 'firebase-applet-config.json');
  try {
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
  } catch (err: any) {
    console.warn('[FirestoreSync] Note reading firebase-applet-config.json:', err.message);
  }

  return {
    projectId: process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || config.projectId || 'noman-e5b08',
    appId: process.env.FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID || config.appId || '',
    apiKey: process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY || config.apiKey || '',
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || process.env.VITE_FIREBASE_AUTH_DOMAIN || config.authDomain || 'noman-e5b08.firebaseapp.com',
    firestoreDatabaseId: process.env.FIREBASE_FIRESTORE_DATABASE_ID || process.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || config.firestoreDatabaseId || 'ai-studio-omnitasksuperapp-57a34a31-4e02-4160-a3fe-27190e12f1f7',
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET || config.storageBucket || '',
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || config.messagingSenderId || '',
    oAuthClientId: process.env.FIREBASE_OAUTH_CLIENT_ID || process.env.VITE_FIREBASE_OAUTH_CLIENT_ID || config.oAuthClientId || ''
  };
}

let firestoreInstance: any = null;

export function getServerDb() {
  if (firestoreInstance) return firestoreInstance;
  try {
    const config = loadFirebaseConfig();
    const app = getApps().length > 0 ? getApp() : initializeApp(config);
    const customDbId = config.firestoreDatabaseId;
    if (!customDbId || customDbId === '(default)' || customDbId === 'default' || customDbId.trim() === '') {
      firestoreInstance = getFirestore(app);
    } else {
      firestoreInstance = getFirestore(app, customDbId.trim());
    }
    return firestoreInstance;
  } catch (err: any) {
    console.warn('[FirestoreSync] Failed to initialize Firestore on server:', err.message);
    return null;
  }
}

export interface DiskState {
  users: any[];
  orders: any[];
  settings: any | null;
  services?: any[];
  vehicles?: any[];
  adminPasswordOverride: string | null;
  lastSaved?: string;
}

// Local Persistent File Cache Helpers (Permanent disk persistence for server restarts)
export function loadDiskPersistentState(): DiskState {
  try {
    if (fs.existsSync(STATE_FILE_PATH)) {
      const raw = fs.readFileSync(STATE_FILE_PATH, 'utf8');
      const parsed = JSON.parse(raw);
      return {
        users: Array.isArray(parsed.users) ? parsed.users : [],
        orders: Array.isArray(parsed.orders) ? parsed.orders : [],
        settings: parsed.settings || null,
        services: Array.isArray(parsed.services) ? parsed.services : undefined,
        vehicles: Array.isArray(parsed.vehicles) ? parsed.vehicles : undefined,
        adminPasswordOverride: parsed.adminPasswordOverride || null,
        lastSaved: parsed.lastSaved
      };
    }
  } catch (err: any) {
    console.warn('[FirestoreSync] Disk state load note:', err.message);
  }
  return { users: [], orders: [], settings: null, adminPasswordOverride: null };
}

export function saveDiskPersistentState(state: Partial<DiskState>) {
  try {
    const current = loadDiskPersistentState();
    const updated: DiskState = {
      users: state.users !== undefined ? state.users : current.users,
      orders: state.orders !== undefined ? state.orders : current.orders,
      settings: state.settings !== undefined ? state.settings : current.settings,
      services: state.services !== undefined ? state.services : current.services,
      vehicles: state.vehicles !== undefined ? state.vehicles : current.vehicles,
      adminPasswordOverride: state.adminPasswordOverride !== undefined ? state.adminPasswordOverride : current.adminPasswordOverride,
      lastSaved: new Date().toISOString()
    };
    fs.writeFileSync(STATE_FILE_PATH, JSON.stringify(updated, null, 2), 'utf8');
  } catch (err: any) {
    console.warn('[FirestoreSync] Disk state save note:', err.message);
  }
}

// Fetch all users from Cloud Firestore with deduplication
export async function fetchUsersFromFirestore(): Promise<any[]> {
  const db = getServerDb();
  if (!db) return [];

  try {
    const userMap = new Map<string, any>();

    // 1. Query individual users collection (AUTHORITATIVE SOURCE)
    const usersCol = collection(db, 'users');
    const snap = await getDocs(usersCol);
    snap.forEach((d) => {
      const u = d.data();
      if (u && (u.id || u.email)) {
        const key = (u.email ? u.email.toLowerCase() : u.id);
        const existing = userMap.get(key);
        // If duplicate by email, pick the newer record
        if (!existing || (u.cloudUpdatedAt && !existing.cloudUpdatedAt)) {
          userMap.set(key, { ...u, id: u.id || d.id });
        }
      }
    });

    // 2. Supplement from system_backups if individual collection is sparse
    if (userMap.size === 0) {
      const backupSnap = await getDoc(doc(db, 'system_backups', 'latest_state'));
      if (backupSnap.exists()) {
        const data = backupSnap.data();
        if (data && Array.isArray(data.users)) {
          data.users.forEach((u: any) => {
            if (u && (u.id || u.email)) {
              const key = (u.email ? u.email.toLowerCase() : u.id);
              if (!userMap.has(key)) userMap.set(key, u);
            }
          });
        }
      }
    }

    return Array.from(userMap.values());
  } catch (err: any) {
    console.warn('[FirestoreSync] Error fetching users from Firestore:', err.message);
    return [];
  }
}

// Find user in Firestore by email or phone (Strict query against authoritative 'users' collection)
export async function findUserInFirestore(identifier: string): Promise<any | null> {
  const clean = identifier.trim().toLowerCase();
  const cleanPhone = identifier.trim().replace(/\s+/g, '');
  const db = getServerDb();
  if (!db) return null;

  try {
    // 1. Check individual 'users' collection FIRST (Authoritative)
    const snap = await getDocs(collection(db, 'users'));
    const matchedDocs: any[] = [];

    snap.forEach((d) => {
      const u = d.data();
      const matchesEmail = u.email && u.email.toLowerCase() === clean;
      const matchesPhone = u.phone && u.phone.replace(/\s+/g, '') === cleanPhone;
      if (matchesEmail || matchesPhone) {
        matchedDocs.push({ ...u, id: u.id || d.id, _docId: d.id });
      }
    });

    if (matchedDocs.length > 0) {
      // Return the most recently updated or first valid match
      matchedDocs.sort((a, b) => {
        const timeA = a.cloudUpdatedAt?.seconds || 0;
        const timeB = b.cloudUpdatedAt?.seconds || 0;
        return timeB - timeA;
      });
      return matchedDocs[0];
    }

    // 2. Check system_backups fallback
    const backupSnap = await getDoc(doc(db, 'system_backups', 'latest_state'));
    if (backupSnap.exists()) {
      const data = backupSnap.data();
      if (data && Array.isArray(data.users)) {
        const found = data.users.find((u: any) => 
          (u.email && u.email.toLowerCase() === clean) ||
          (u.phone && u.phone.replace(/\s+/g, '') === cleanPhone)
        );
        if (found) return found;
      }
    }

    return null;
  } catch (err: any) {
    console.warn('[FirestoreSync] Error finding user in Firestore:', err.message);
    return null;
  }
}

// Update user password across ALL matching documents in Cloud Firestore (Deduplicates & guarantees no stale password remains)
export async function updateUserPasswordInFirestore(emailOrPhone: string, newPassword: string): Promise<any | null> {
  const clean = emailOrPhone.trim().toLowerCase();
  const cleanPhone = emailOrPhone.trim().replace(/\s+/g, '');
  const db = getServerDb();
  if (!db) return null;

  try {
    let primaryUser: any = null;
    const nowIso = new Date().toISOString();

    // 1. Search and update ALL matching documents in 'users' collection
    const snap = await getDocs(collection(db, 'users'));
    const matchingDocIds: string[] = [];

    for (const d of snap.docs) {
      const u = d.data();
      const matchesEmail = u.email && u.email.toLowerCase() === clean;
      const matchesPhone = u.phone && u.phone.replace(/\s+/g, '') === cleanPhone;
      if (matchesEmail || matchesPhone) {
        matchingDocIds.push(d.id);
        const updated = {
          ...u,
          password: newPassword,
          passwordUpdatedAt: nowIso,
          cloudUpdatedAt: serverTimestamp()
        };
        await setDoc(doc(db, 'users', d.id), updated, { merge: true });
        console.log(`[FirestoreSync] Updated password in users/${d.id} for ${clean}`);
        if (!primaryUser) primaryUser = updated;
      }
    }

    // 2. Update system_backups/latest_state to ensure snapshot consistency
    const backupRef = doc(db, 'system_backups', 'latest_state');
    const backupSnap = await getDoc(backupRef);
    if (backupSnap.exists()) {
      const data = backupSnap.data();
      if (data && Array.isArray(data.users)) {
        const users = data.users.map((u: any) => {
          const matchesEmail = u.email && u.email.toLowerCase() === clean;
          const matchesPhone = u.phone && u.phone.replace(/\s+/g, '') === cleanPhone;
          if (matchesEmail || matchesPhone) {
            return {
              ...u,
              password: newPassword,
              passwordUpdatedAt: nowIso
            };
          }
          return u;
        });

        await setDoc(backupRef, {
          ...data,
          users,
          updatedAt: nowIso
        }, { merge: true });
        console.log(`[FirestoreSync] Updated password in system_backups for ${clean}`);
      }
    }

    // If user was not yet in users collection, create primary doc
    if (!primaryUser && matchingDocIds.length === 0) {
      const newId = 'usr-cust-' + Date.now();
      primaryUser = {
        id: newId,
        email: clean.includes('@') ? clean : '',
        phone: clean.includes('@') ? '' : cleanPhone,
        name: 'Valued Customer',
        password: newPassword,
        role: 'customer',
        status: 'active',
        passwordUpdatedAt: nowIso,
        joinedDate: nowIso.split('T')[0]
      };
      await setDoc(doc(db, 'users', newId), {
        ...primaryUser,
        cloudUpdatedAt: serverTimestamp()
      }, { merge: true });
    }

    return primaryUser;
  } catch (err: any) {
    console.error('[FirestoreSync] Error updating password in Firestore:', err.message);
    return null;
  }
}

// Save or sync user to Firestore
export async function syncUserToFirestore(user: any): Promise<void> {
  const db = getServerDb();
  if (!db || !user || !user.id) return;

  try {
    await setDoc(doc(db, 'users', user.id), {
      ...user,
      cloudUpdatedAt: serverTimestamp()
    }, { merge: true });

    // Also update system backup array
    const backupRef = doc(db, 'system_backups', 'latest_state');
    const backupSnap = await getDoc(backupRef);
    if (backupSnap.exists()) {
      const data = backupSnap.data();
      const users = Array.isArray(data.users) ? [...data.users] : [];
      const idx = users.findIndex((u: any) => u.id === user.id || (u.email && u.email.toLowerCase() === user.email.toLowerCase()));
      if (idx >= 0) {
        users[idx] = { ...users[idx], ...user };
      } else {
        users.push(user);
      }
      await setDoc(backupRef, { users, updatedAt: new Date().toISOString() }, { merge: true });
    }
  } catch (err: any) {
    console.warn(`[FirestoreSync] Failed to sync user ${user.id} to Firestore:`, err.message);
  }
}

// ============================================================================
// SYSTEM SETTINGS PERSISTENCE (RATES, WHATSAPP, COMMISSIONS) DIRECT IN FIRESTORE
// ============================================================================
export async function fetchSettingsFromFirestore(): Promise<any | null> {
  const db = getServerDb();
  if (!db) return null;

  try {
    // Check settings/global_config first
    const globalSnap = await getDoc(doc(db, 'settings', 'global_config'));
    if (globalSnap.exists()) {
      return globalSnap.data();
    }

    // Check settings/system second
    const sysSnap = await getDoc(doc(db, 'settings', 'system'));
    if (sysSnap.exists()) {
      return sysSnap.data();
    }

    // Check system_backups
    const backupSnap = await getDoc(doc(db, 'system_backups', 'latest_state'));
    if (backupSnap.exists()) {
      const data = backupSnap.data();
      if (data && data.settings) return data.settings;
    }

    return null;
  } catch (err: any) {
    console.warn('[FirestoreSync] Error reading settings from Firestore:', err.message);
    return null;
  }
}

export async function saveSettingsToFirestore(settings: any): Promise<boolean> {
  const db = getServerDb();
  if (!db || !settings) return false;

  try {
    const payload = {
      ...settings,
      cloudUpdatedAt: serverTimestamp(),
      updatedAtIso: new Date().toISOString()
    };

    // Save to both 'global_config' and 'system' for complete compatibility
    await Promise.all([
      setDoc(doc(db, 'settings', 'global_config'), payload, { merge: true }),
      setDoc(doc(db, 'settings', 'system'), payload, { merge: true })
    ]);

    // Also update system_backups
    const backupRef = doc(db, 'system_backups', 'latest_state');
    const backupSnap = await getDoc(backupRef);
    if (backupSnap.exists()) {
      await setDoc(backupRef, {
        settings: payload,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }

    console.log('[FirestoreSync] Saved system settings live to Cloud Firestore!');
    return true;
  } catch (err: any) {
    console.error('[FirestoreSync] Error saving settings to Firestore:', err.message);
    return false;
  }
}

// ============================================================================
// CATALOG (SERVICES & VEHICLES RATES) PERSISTENCE DIRECT IN FIRESTORE
// ============================================================================
export async function fetchCatalogFromFirestore(): Promise<{ services?: any[]; vehicles?: any[] } | null> {
  const db = getServerDb();
  if (!db) return null;

  try {
    const [servicesSnap, vehiclesSnap] = await Promise.all([
      getDoc(doc(db, 'catalog', 'services')),
      getDoc(doc(db, 'catalog', 'vehicles'))
    ]);

    const result: { services?: any[]; vehicles?: any[] } = {};
    if (servicesSnap.exists()) {
      const d = servicesSnap.data();
      if (Array.isArray(d.items)) result.services = d.items;
    }
    if (vehiclesSnap.exists()) {
      const d = vehiclesSnap.data();
      if (Array.isArray(d.items)) result.vehicles = d.items;
    }

    return Object.keys(result).length > 0 ? result : null;
  } catch (err: any) {
    console.warn('[FirestoreSync] Error reading catalog from Firestore:', err.message);
    return null;
  }
}

export async function saveCatalogToFirestore(data: { services?: any[]; vehicles?: any[] }): Promise<boolean> {
  const db = getServerDb();
  if (!db) return false;

  try {
    const writes: Promise<any>[] = [];
    if (Array.isArray(data.services)) {
      writes.push(setDoc(doc(db, 'catalog', 'services'), {
        items: data.services,
        cloudUpdatedAt: serverTimestamp(),
        updatedAt: new Date().toISOString()
      }, { merge: true }));
    }
    if (Array.isArray(data.vehicles)) {
      writes.push(setDoc(doc(db, 'catalog', 'vehicles'), {
        items: data.vehicles,
        cloudUpdatedAt: serverTimestamp(),
        updatedAt: new Date().toISOString()
      }, { merge: true }));
    }

    await Promise.all(writes);
    console.log('[FirestoreSync] Saved catalog rates live to Cloud Firestore!');
    return true;
  } catch (err: any) {
    console.error('[FirestoreSync] Error saving catalog to Firestore:', err.message);
    return false;
  }
}

// Sanitize helper to remove undefined fields before Firestore setDoc
function sanitizeData(obj: any): any {
  if (obj === undefined) return null;
  return JSON.parse(JSON.stringify(obj, (_k, v) => (v === undefined ? null : v)));
}

// Fetch all orders from Cloud Firestore with zero-loss fallback to system_backups
export async function fetchOrdersFromFirestore(): Promise<any[]> {
  const db = getServerDb();
  if (!db) return [];

  try {
    const orderMap = new Map<string, any>();
    const snap = await getDocs(collection(db, 'orders'));
    snap.forEach((d) => {
      const o = d.data();
      if (o && (o.id || d.id)) {
        orderMap.set(o.id || d.id, { ...o, id: o.id || d.id });
      }
    });

    if (orderMap.size === 0) {
      const backupSnap = await getDoc(doc(db, 'system_backups', 'latest_state'));
      if (backupSnap.exists()) {
        const data = backupSnap.data();
        if (data && Array.isArray(data.orders)) {
          data.orders.forEach((o: any) => {
            if (o && o.id) orderMap.set(o.id, o);
          });
        }
      }
    }

    return Array.from(orderMap.values());
  } catch (err: any) {
    console.warn('[FirestoreSync] Error fetching orders from Firestore:', err.message);
    return [];
  }
}

// Persist individual order to Firestore with sanitized payload (No undefined errors)
export async function syncOrderToFirestore(order: any): Promise<boolean> {
  const db = getServerDb();
  if (!db || !order || !order.id) return false;

  try {
    const cleanPayload = sanitizeData({
      ...order,
      cloudUpdatedAt: serverTimestamp(),
      updatedAtIso: new Date().toISOString()
    });

    await setDoc(doc(db, 'orders', String(order.id)), cleanPayload, { merge: true });

    // Also update system_backups array
    const backupRef = doc(db, 'system_backups', 'latest_state');
    const backupSnap = await getDoc(backupRef);
    if (backupSnap.exists()) {
      const data = backupSnap.data();
      const orders = Array.isArray(data.orders) ? [...data.orders] : [];
      const idx = orders.findIndex((o: any) => o.id === order.id);
      if (idx >= 0) orders[idx] = cleanPayload;
      else orders.unshift(cleanPayload);
      await setDoc(backupRef, { orders, updatedAt: new Date().toISOString() }, { merge: true });
    }

    console.log(`[FirestoreSync] Synced order ${order.id} to Cloud Firestore!`);
    return true;
  } catch (err: any) {
    console.warn(`[FirestoreSync] Failed to persist order ${order.id} to Firestore:`, err.message);
    return false;
  }
}

// Delete order permanently from Cloud Firestore and system_backups
export async function deleteOrderFromFirestore(orderId: string): Promise<boolean> {
  const db = getServerDb();
  if (!db || !orderId) return false;

  try {
    await deleteDoc(doc(db, 'orders', String(orderId)));

    // Also remove from system_backups
    const backupRef = doc(db, 'system_backups', 'latest_state');
    const backupSnap = await getDoc(backupRef);
    if (backupSnap.exists()) {
      const data = backupSnap.data();
      if (data && Array.isArray(data.orders)) {
        const filtered = data.orders.filter((o: any) => o.id !== orderId);
        await setDoc(backupRef, { orders: filtered, updatedAt: new Date().toISOString() }, { merge: true });
      }
    }

    console.log(`[FirestoreSync] Deleted order ${orderId} permanently from Cloud Firestore`);
    return true;
  } catch (err: any) {
    console.warn(`[FirestoreSync] Error deleting order ${orderId} from Firestore:`, err.message);
    return false;
  }
}

// Delete user permanently from Cloud Firestore and system_backups
export async function deleteUserFromFirestore(userId: string): Promise<boolean> {
  const db = getServerDb();
  if (!db || !userId) return false;

  try {
    await deleteDoc(doc(db, 'users', String(userId)));

    // Also remove from system_backups
    const backupRef = doc(db, 'system_backups', 'latest_state');
    const backupSnap = await getDoc(backupRef);
    if (backupSnap.exists()) {
      const data = backupSnap.data();
      if (data && Array.isArray(data.users)) {
        const filtered = data.users.filter((u: any) => u.id !== userId);
        await setDoc(backupRef, { users: filtered, updatedAt: new Date().toISOString() }, { merge: true });
      }
    }

    console.log(`[FirestoreSync] Deleted user ${userId} permanently from Cloud Firestore`);
    return true;
  } catch (err: any) {
    console.warn(`[FirestoreSync] Error deleting user ${userId} from Firestore:`, err.message);
    return false;
  }
}

