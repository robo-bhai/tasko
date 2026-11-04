import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
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

// Local Persistent File Cache Helpers
export function loadDiskPersistentState(): { users: any[]; adminPasswordOverride: string | null } {
  try {
    if (fs.existsSync(STATE_FILE_PATH)) {
      const raw = fs.readFileSync(STATE_FILE_PATH, 'utf8');
      const parsed = JSON.parse(raw);
      return {
        users: Array.isArray(parsed.users) ? parsed.users : [],
        adminPasswordOverride: parsed.adminPasswordOverride || null
      };
    }
  } catch (err: any) {
    console.warn('[FirestoreSync] Disk state load note:', err.message);
  }
  return { users: [], adminPasswordOverride: null };
}

export function saveDiskPersistentState(state: { users?: any[]; adminPasswordOverride?: string | null }) {
  try {
    const current = loadDiskPersistentState();
    const updated = {
      users: state.users !== undefined ? state.users : current.users,
      adminPasswordOverride: state.adminPasswordOverride !== undefined ? state.adminPasswordOverride : current.adminPasswordOverride,
      lastSaved: new Date().toISOString()
    };
    fs.writeFileSync(STATE_FILE_PATH, JSON.stringify(updated, null, 2), 'utf8');
  } catch (err: any) {
    console.warn('[FirestoreSync] Disk state save note:', err.message);
  }
}

// Fetch all users from Cloud Firestore
export async function fetchUsersFromFirestore(): Promise<any[]> {
  const db = getServerDb();
  if (!db) return [];

  try {
    // 1. Check latest_state system backup document
    const backupSnap = await getDoc(doc(db, 'system_backups', 'latest_state'));
    if (backupSnap.exists()) {
      const data = backupSnap.data();
      if (data && Array.isArray(data.users) && data.users.length > 0) {
        return data.users;
      }
    }

    // 2. Query individual users collection
    const usersCol = collection(db, 'users');
    const snap = await getDocs(usersCol);
    const users: any[] = [];
    snap.forEach((d) => {
      const u = d.data();
      if (u && (u.id || u.email)) {
        users.push(u);
      }
    });
    return users;
  } catch (err: any) {
    console.warn('[FirestoreSync] Error fetching users from Firestore:', err.message);
    return [];
  }
}

// Find user in Firestore by email or phone
export async function findUserInFirestore(identifier: string): Promise<any | null> {
  const clean = identifier.trim().toLowerCase();
  const cleanPhone = identifier.trim().replace(/\s+/g, '');
  const db = getServerDb();
  if (!db) return null;

  try {
    // Check backup first (fast single document read)
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

    // Check individual users collection
    const snap = await getDocs(collection(db, 'users'));
    let foundUser: any = null;
    snap.forEach((d) => {
      if (foundUser) return;
      const u = d.data();
      if (
        (u.email && u.email.toLowerCase() === clean) ||
        (u.phone && u.phone.replace(/\s+/g, '') === cleanPhone)
      ) {
        foundUser = u;
      }
    });

    return foundUser;
  } catch (err: any) {
    console.warn('[FirestoreSync] Error finding user in Firestore:', err.message);
    return null;
  }
}

// Update user password in Cloud Firestore
export async function updateUserPasswordInFirestore(emailOrPhone: string, newPassword: string): Promise<any | null> {
  const clean = emailOrPhone.trim().toLowerCase();
  const cleanPhone = emailOrPhone.trim().replace(/\s+/g, '');
  const db = getServerDb();
  if (!db) return null;

  try {
    let targetUser: any = null;

    // 1. Read & Update in system_backups/latest_state
    const backupRef = doc(db, 'system_backups', 'latest_state');
    const backupSnap = await getDoc(backupRef);
    if (backupSnap.exists()) {
      const data = backupSnap.data();
      if (data && Array.isArray(data.users)) {
        const users = [...data.users];
        const idx = users.findIndex((u: any) => 
          (u.email && u.email.toLowerCase() === clean) ||
          (u.phone && u.phone.replace(/\s+/g, '') === cleanPhone)
        );
        if (idx >= 0) {
          users[idx] = {
            ...users[idx],
            password: newPassword,
            updatedAt: new Date().toISOString()
          };
          targetUser = users[idx];
          await setDoc(backupRef, {
            ...data,
            users,
            updatedAt: new Date().toISOString()
          }, { merge: true });
          console.log(`[FirestoreSync] Updated password in system_backups for ${clean}`);
        }
      }
    }

    // 2. Read & Update in individual users collection
    if (targetUser && targetUser.id) {
      const userRef = doc(db, 'users', targetUser.id);
      await setDoc(userRef, {
        password: newPassword,
        cloudUpdatedAt: serverTimestamp()
      }, { merge: true });
      console.log(`[FirestoreSync] Updated password in users/${targetUser.id} document`);
    } else {
      // Find document in users collection if not in backup
      const snap = await getDocs(collection(db, 'users'));
      for (const d of snap.docs) {
        const u = d.data();
        if (
          (u.email && u.email.toLowerCase() === clean) ||
          (u.phone && u.phone.replace(/\s+/g, '') === cleanPhone)
        ) {
          targetUser = { ...u, password: newPassword };
          await setDoc(doc(db, 'users', d.id), {
            password: newPassword,
            cloudUpdatedAt: serverTimestamp()
          }, { merge: true });
          console.log(`[FirestoreSync] Updated password in users/${d.id}`);
          break;
        }
      }
    }

    return targetUser;
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
