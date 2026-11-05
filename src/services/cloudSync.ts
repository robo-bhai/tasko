import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc,
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { User, Order, SystemSettings, OrderReview, HomeServiceItem, TransportVehicleItem } from '../types';

export interface SystemCloudBackup {
  users: User[];
  orders: Order[];
  settings: SystemSettings;
  reviews?: OrderReview[];
  updatedAt: string;
  source: string;
}

const BACKUP_DOC_ID = 'latest_state';

// Helper to remove any undefined fields that cause Firestore setDoc() to fail
function sanitizeData<T>(data: T): T {
  if (data === undefined) return null as any;
  return JSON.parse(JSON.stringify(data, (_k, v) => (v === undefined ? null : v)));
}

export const CloudSyncService = {
  // Save an individual user to Cloud Firestore (zero-loss persistence)
  async saveUser(user: User): Promise<void> {
    try {
      const cleanUser = sanitizeData({
        ...user,
        cloudUpdatedAt: serverTimestamp()
      });
      await setDoc(doc(db, 'users', user.id), cleanUser, { merge: true });
    } catch (err) {
      console.warn(`[CloudSync] Failed to persist user ${user.id} to Firestore:`, err);
    }
  },

  // Save an individual order to Cloud Firestore (guaranteed zero undefined field errors)
  async saveOrder(order: Order): Promise<void> {
    try {
      const cleanOrder = sanitizeData({
        ...order,
        cloudUpdatedAt: serverTimestamp()
      });
      await setDoc(doc(db, 'orders', order.id), cleanOrder, { merge: true });
      console.log(`[CloudSync] Successfully persisted order ${order.id} to Firestore!`);
    } catch (err) {
      console.warn(`[CloudSync] Failed to persist order ${order.id} to Firestore:`, err);
    }
  },

  // Delete an individual order permanently from Cloud Firestore
  async deleteOrder(orderId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'orders', orderId));
      console.log(`[CloudSync] Deleted order ${orderId} from Firestore`);
    } catch (err) {
      console.warn(`[CloudSync] Failed to delete order ${orderId} from Firestore:`, err);
    }
  },

  // Delete an individual user permanently from Cloud Firestore
  async deleteUser(userId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'users', userId));
      console.log(`[CloudSync] Deleted user ${userId} from Firestore`);
    } catch (err) {
      console.warn(`[CloudSync] Failed to delete user ${userId} from Firestore:`, err);
    }
  },

  // Save system settings to Cloud Firestore (Direct into global_config and system docs)
  async saveSettings(settings: SystemSettings): Promise<void> {
    try {
      const payload = {
        ...settings,
        cloudUpdatedAt: serverTimestamp(),
        updatedAtIso: new Date().toISOString()
      };
      await Promise.all([
        setDoc(doc(db, 'settings', 'global_config'), payload, { merge: true }),
        setDoc(doc(db, 'settings', 'system'), payload, { merge: true })
      ]);
    } catch (err) {
      console.warn('[CloudSync] Failed to persist settings to Firestore:', err);
    }
  },

  // Save catalog (services & vehicles) to Cloud Firestore
  async saveCatalog(data: { services?: HomeServiceItem[]; vehicles?: TransportVehicleItem[] }): Promise<void> {
    try {
      const promises: Promise<any>[] = [];
      if (Array.isArray(data.services)) {
        promises.push(setDoc(doc(db, 'catalog', 'services'), {
          items: data.services,
          cloudUpdatedAt: serverTimestamp(),
          updatedAt: new Date().toISOString()
        }, { merge: true }));
      }
      if (Array.isArray(data.vehicles)) {
        promises.push(setDoc(doc(db, 'catalog', 'vehicles'), {
          items: data.vehicles,
          cloudUpdatedAt: serverTimestamp(),
          updatedAt: new Date().toISOString()
        }, { merge: true }));
      }
      await Promise.all(promises);
    } catch (err) {
      console.warn('[CloudSync] Failed to persist catalog to Firestore:', err);
    }
  },

  // Save review to Cloud Firestore
  async saveReview(review: OrderReview & { id: string; serviceName?: string }): Promise<void> {
    try {
      const cleanReview = sanitizeData({
        ...review,
        cloudUpdatedAt: serverTimestamp()
      });
      await setDoc(doc(db, 'reviews', review.id), cleanReview, { merge: true });
    } catch (err) {
      console.warn(`[CloudSync] Failed to persist review ${review.id} to Firestore:`, err);
    }
  },

  // Complete snapshot backup upload to Cloud Firestore cache
  async uploadFullBackup(state: {
    users: User[];
    orders: Order[];
    settings: SystemSettings;
  }): Promise<void> {
    try {
      const backupPayload: SystemCloudBackup = sanitizeData({
        users: state.users,
        orders: state.orders,
        settings: state.settings,
        updatedAt: new Date().toISOString(),
        source: 'khanewal_connect_app'
      });

      await setDoc(doc(db, 'system_backups', BACKUP_DOC_ID), {
        ...backupPayload,
        serverTime: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.warn('[CloudSync] Failed to upload full system backup:', err);
    }
  },

  // Fetch full system backup or pull collections on boot
  async loadCloudState(): Promise<{
    users: User[];
    orders: Order[];
    settings: SystemSettings | null;
    services?: HomeServiceItem[];
    vehicles?: TransportVehicleItem[];
  } | null> {
    try {
      // Query authoritative collections directly in parallel
      const [usersSnap, ordersSnap, settingsGlobalSnap, settingsSysSnap, servicesSnap, vehiclesSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'orders')),
        getDoc(doc(db, 'settings', 'global_config')),
        getDoc(doc(db, 'settings', 'system')),
        getDoc(doc(db, 'catalog', 'services')),
        getDoc(doc(db, 'catalog', 'vehicles'))
      ]);

      const userMap = new Map<string, User>();
      usersSnap.forEach(d => {
        const u = d.data() as User;
        if (u && (u.id || u.email)) {
          const key = u.email ? u.email.toLowerCase() : u.id;
          const existing = userMap.get(key);
          if (!existing || (u.cloudUpdatedAt && !(existing as any).cloudUpdatedAt)) {
            userMap.set(key, { ...u, id: u.id || d.id });
          }
        }
      });

      const cloudOrders: Order[] = [];
      ordersSnap.forEach(d => {
        const o = d.data() as Order;
        if (o && o.id) cloudOrders.push(o);
      });

      let cloudSettings: SystemSettings | null = null;
      if (settingsGlobalSnap.exists()) {
        cloudSettings = settingsGlobalSnap.data() as SystemSettings;
      } else if (settingsSysSnap.exists()) {
        cloudSettings = settingsSysSnap.data() as SystemSettings;
      }

      let services: HomeServiceItem[] | undefined;
      if (servicesSnap.exists()) {
        const d = servicesSnap.data();
        if (Array.isArray(d.items)) services = d.items;
      }

      let vehicles: TransportVehicleItem[] | undefined;
      if (vehiclesSnap.exists()) {
        const d = vehiclesSnap.data();
        if (Array.isArray(d.items)) vehicles = d.items;
      }

      const usersList = Array.from(userMap.values());

      if (usersList.length > 0 || cloudOrders.length > 0 || cloudSettings) {
        return {
          users: usersList,
          orders: cloudOrders,
          settings: cloudSettings,
          services,
          vehicles
        };
      }

      // Check system_backups if individual collections were empty
      const backupSnap = await getDoc(doc(db, 'system_backups', BACKUP_DOC_ID));
      if (backupSnap.exists()) {
        const data = backupSnap.data() as SystemCloudBackup;
        if (data && Array.isArray(data.users)) {
          return {
            users: data.users,
            orders: Array.isArray(data.orders) ? data.orders : [],
            settings: data.settings || null
          };
        }
      }

      return null;
    } catch (err) {
      console.warn('[CloudSync] Could not read cloud state:', err);
      return null;
    }
  },

  // Live Real-Time Listener on users, orders & settings
  subscribeToCloudChanges(callbacks: {
    onUsersChange?: (users: User[]) => void;
    onOrdersChange?: (orders: Order[]) => void;
    onSettingsChange?: (settings: SystemSettings) => void;
  }): () => void {
    const unsubscribes: (() => void)[] = [];

    try {
      if (callbacks.onUsersChange) {
        const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
          if (!snap.empty) {
            const userMap = new Map<string, User>();
            snap.forEach(d => {
              const u = d.data() as User;
              if (u && (u.id || u.email)) {
                const key = u.email ? u.email.toLowerCase() : u.id;
                userMap.set(key, { ...u, id: u.id || d.id });
              }
            });
            const list = Array.from(userMap.values());
            if (list.length > 0) {
              callbacks.onUsersChange!(list);
            }
          }
        }, (err) => {
          console.warn('[CloudSync] Users live listener notice:', err);
        });
        unsubscribes.push(unsubUsers);
      }

      if (callbacks.onOrdersChange) {
        const unsubOrders = onSnapshot(collection(db, 'orders'), (snap) => {
          if (!snap.empty) {
            const list: Order[] = [];
            snap.forEach(d => {
              const o = d.data() as Order;
              if (o && o.id) list.push(o);
            });
            callbacks.onOrdersChange!(list);
          }
        }, (err) => {
          console.warn('[CloudSync] Orders live listener notice:', err);
        });
        unsubscribes.push(unsubOrders);
      }

      if (callbacks.onSettingsChange) {
        const unsubSettings = onSnapshot(doc(db, 'settings', 'global_config'), (snap) => {
          if (snap.exists()) {
            const s = snap.data() as SystemSettings;
            callbacks.onSettingsChange!(s);
          }
        }, (err) => {
          console.warn('[CloudSync] Settings live listener notice:', err);
        });
        unsubscribes.push(unsubSettings);
      }
    } catch (err) {
      console.warn('[CloudSync] Live subscription init error:', err);
    }

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  },

  // Lookup user directly from Cloud Firestore by email or phone (Authoritative collection check first)
  async getUserByEmailOrPhone(identifier: string): Promise<User | null> {
    const clean = identifier.trim().toLowerCase();
    const cleanPhone = identifier.trim().replace(/\s+/g, '');

    try {
      // 1. Check individual 'users' collection FIRST
      const snap = await getDocs(collection(db, 'users'));
      const matching: any[] = [];
      snap.forEach(d => {
        const u = d.data() as User;
        const matchesEmail = u.email && u.email.toLowerCase() === clean;
        const matchesPhone = u.phone && u.phone.replace(/\s+/g, '') === cleanPhone;
        if (matchesEmail || matchesPhone) {
          matching.push({ ...u, id: u.id || d.id });
        }
      });

      if (matching.length > 0) {
        matching.sort((a, b) => {
          const timeA = a.cloudUpdatedAt?.seconds || 0;
          const timeB = b.cloudUpdatedAt?.seconds || 0;
          return timeB - timeA;
        });
        return matching[0];
      }

      // 2. Check system_backups fallback
      const backupSnap = await getDoc(doc(db, 'system_backups', BACKUP_DOC_ID));
      if (backupSnap.exists()) {
        const data = backupSnap.data() as SystemCloudBackup;
        if (data && Array.isArray(data.users)) {
          const found = data.users.find(u => 
            (u.email && u.email.toLowerCase() === clean) ||
            (u.phone && u.phone.replace(/\s+/g, '') === cleanPhone)
          );
          if (found) return found;
        }
      }

      return null;
    } catch (err) {
      console.warn('[CloudSync] getUserByEmailOrPhone error:', err);
      return null;
    }
  },

  // Update user password across ALL matching documents in Cloud Firestore
  async updateUserPassword(emailOrPhone: string, newPassword: string): Promise<User | null> {
    const clean = emailOrPhone.trim().toLowerCase();
    const cleanPhone = emailOrPhone.trim().replace(/\s+/g, '');

    try {
      let targetUser: User | null = null;
      const nowIso = new Date().toISOString();

      // 1. Search and update ALL matching documents in 'users' collection
      const snap = await getDocs(collection(db, 'users'));
      for (const d of snap.docs) {
        const u = d.data() as User;
        const matchesEmail = u.email && u.email.toLowerCase() === clean;
        const matchesPhone = u.phone && u.phone.replace(/\s+/g, '') === cleanPhone;
        if (matchesEmail || matchesPhone) {
          targetUser = { ...u, id: u.id || d.id, password: newPassword };
          await setDoc(doc(db, 'users', d.id), {
            password: newPassword,
            passwordUpdatedAt: nowIso,
            cloudUpdatedAt: serverTimestamp()
          }, { merge: true });
        }
      }

      // 2. Update system backup array
      const backupRef = doc(db, 'system_backups', BACKUP_DOC_ID);
      const backupSnap = await getDoc(backupRef);
      if (backupSnap.exists()) {
        const data = backupSnap.data() as SystemCloudBackup;
        if (data && Array.isArray(data.users)) {
          const users = data.users.map(u => {
            const matchesEmail = u.email && u.email.toLowerCase() === clean;
            const matchesPhone = u.phone && u.phone.replace(/\s+/g, '') === cleanPhone;
            if (matchesEmail || matchesPhone) {
              return { ...u, password: newPassword, passwordUpdatedAt: nowIso };
            }
            return u;
          });
          await setDoc(backupRef, { users, updatedAt: nowIso }, { merge: true });
        }
      }

      return targetUser;
    } catch (err) {
      console.warn('[CloudSync] updateUserPassword error:', err);
      return null;
    }
  }
};
