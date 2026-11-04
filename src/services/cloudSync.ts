import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { User, Order, SystemSettings, OrderReview } from '../types';

export interface SystemCloudBackup {
  users: User[];
  orders: Order[];
  settings: SystemSettings;
  reviews?: OrderReview[];
  updatedAt: string;
  source: string;
}

const BACKUP_DOC_ID = 'latest_state';

export const CloudSyncService = {
  // Save an individual user to Cloud Firestore (zero-loss persistence)
  async saveUser(user: User): Promise<void> {
    try {
      await setDoc(doc(db, 'users', user.id), {
        ...user,
        cloudUpdatedAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.warn(`[CloudSync] Failed to persist user ${user.id} to Firestore:`, err);
    }
  },

  // Save an individual order to Cloud Firestore
  async saveOrder(order: Order): Promise<void> {
    try {
      await setDoc(doc(db, 'orders', order.id), {
        ...order,
        cloudUpdatedAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.warn(`[CloudSync] Failed to persist order ${order.id} to Firestore:`, err);
    }
  },

  // Save system settings to Cloud Firestore
  async saveSettings(settings: SystemSettings): Promise<void> {
    try {
      await setDoc(doc(db, 'settings', 'system'), {
        ...settings,
        cloudUpdatedAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.warn('[CloudSync] Failed to persist settings to Firestore:', err);
    }
  },

  // Save review to Cloud Firestore
  async saveReview(review: OrderReview & { id: string; serviceName?: string }): Promise<void> {
    try {
      await setDoc(doc(db, 'reviews', review.id), {
        ...review,
        cloudUpdatedAt: serverTimestamp()
      }, { merge: true });
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
      const backupPayload: SystemCloudBackup = {
        users: state.users,
        orders: state.orders,
        settings: state.settings,
        updatedAt: new Date().toISOString(),
        source: 'khanewal_connect_app'
      };

      await setDoc(doc(db, 'system_backups', BACKUP_DOC_ID), {
        ...backupPayload,
        serverTime: serverTimestamp()
      });

      // Also ensure all individual users and orders are up-to-date in their collections
      for (const u of state.users) {
        setDoc(doc(db, 'users', u.id), u, { merge: true }).catch(() => {});
      }
      for (const o of state.orders) {
        setDoc(doc(db, 'orders', o.id), o, { merge: true }).catch(() => {});
      }
    } catch (err) {
      console.warn('[CloudSync] Failed to upload full system backup:', err);
    }
  },

  // Fetch full system backup or pull collections on boot
  async loadCloudState(): Promise<{
    users: User[];
    orders: Order[];
    settings: SystemSettings | null;
  } | null> {
    try {
      // 1. Try reading the system_backups document
      const backupSnap = await getDoc(doc(db, 'system_backups', BACKUP_DOC_ID));
      if (backupSnap.exists()) {
        const data = backupSnap.data() as SystemCloudBackup;
        if (data && Array.isArray(data.users) && data.users.length > 0) {
          return {
            users: data.users,
            orders: Array.isArray(data.orders) ? data.orders : [],
            settings: data.settings || null
          };
        }
      }

      // 2. Alternatively, query users and orders collections directly
      const [usersSnap, ordersSnap, settingsSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'orders')),
        getDoc(doc(db, 'settings', 'system'))
      ]);

      const cloudUsers: User[] = [];
      usersSnap.forEach(d => {
        const u = d.data() as User;
        if (u && u.id) cloudUsers.push(u);
      });

      const cloudOrders: Order[] = [];
      ordersSnap.forEach(d => {
        const o = d.data() as Order;
        if (o && o.id) cloudOrders.push(o);
      });

      const cloudSettings = settingsSnap.exists() ? (settingsSnap.data() as SystemSettings) : null;

      if (cloudUsers.length > 0 || cloudOrders.length > 0) {
        return {
          users: cloudUsers,
          orders: cloudOrders,
          settings: cloudSettings
        };
      }

      return null;
    } catch (err) {
      console.warn('[CloudSync] Could not read cloud state:', err);
      return null;
    }
  },

  // Live Real-Time Listener on users & orders
  subscribeToCloudChanges(callbacks: {
    onUsersChange?: (users: User[]) => void;
    onOrdersChange?: (orders: Order[]) => void;
  }): () => void {
    const unsubscribes: (() => void)[] = [];

    try {
      if (callbacks.onUsersChange) {
        const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
          if (!snap.empty) {
            const list: User[] = [];
            snap.forEach(d => {
              const u = d.data() as User;
              if (u && u.id) list.push(u);
            });
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
    } catch (err) {
      console.warn('[CloudSync] Live subscription init error:', err);
    }

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  },

  // Lookup user directly from Cloud Firestore by email or phone (critical for Incognito Mode)
  async getUserByEmailOrPhone(identifier: string): Promise<User | null> {
    const clean = identifier.trim().toLowerCase();
    const cleanPhone = identifier.trim().replace(/\s+/g, '');

    try {
      // 1. Check system_backups/latest_state first
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

      // 2. Check individual users collection
      const snap = await getDocs(collection(db, 'users'));
      let foundUser: User | null = null;
      snap.forEach(d => {
        if (foundUser) return;
        const u = d.data() as User;
        if (
          (u.email && u.email.toLowerCase() === clean) ||
          (u.phone && u.phone.replace(/\s+/g, '') === cleanPhone)
        ) {
          foundUser = u;
        }
      });

      return foundUser;
    } catch (err) {
      console.warn('[CloudSync] getUserByEmailOrPhone error:', err);
      return null;
    }
  },

  // Update user password directly in Cloud Firestore
  async updateUserPassword(emailOrPhone: string, newPassword: string): Promise<User | null> {
    const clean = emailOrPhone.trim().toLowerCase();
    const cleanPhone = emailOrPhone.trim().replace(/\s+/g, '');

    try {
      let targetUser: User | null = null;

      // 1. Read & update system backup
      const backupRef = doc(db, 'system_backups', BACKUP_DOC_ID);
      const backupSnap = await getDoc(backupRef);
      if (backupSnap.exists()) {
        const data = backupSnap.data() as SystemCloudBackup;
        if (data && Array.isArray(data.users)) {
          const users = [...data.users];
          const idx = users.findIndex(u => 
            (u.email && u.email.toLowerCase() === clean) ||
            (u.phone && u.phone.replace(/\s+/g, '') === cleanPhone)
          );
          if (idx >= 0) {
            users[idx] = {
              ...users[idx],
              password: newPassword
            };
            targetUser = users[idx];
            await setDoc(backupRef, {
              ...data,
              users,
              updatedAt: new Date().toISOString()
            }, { merge: true });
          }
        }
      }

      // 2. Read & update users collection
      if (targetUser && targetUser.id) {
        await setDoc(doc(db, 'users', targetUser.id), {
          password: newPassword,
          cloudUpdatedAt: serverTimestamp()
        }, { merge: true });
      } else {
        const snap = await getDocs(collection(db, 'users'));
        for (const d of snap.docs) {
          const u = d.data() as User;
          if (
            (u.email && u.email.toLowerCase() === clean) ||
            (u.phone && u.phone.replace(/\s+/g, '') === cleanPhone)
          ) {
            targetUser = { ...u, password: newPassword };
            await setDoc(doc(db, 'users', d.id), {
              password: newPassword,
              cloudUpdatedAt: serverTimestamp()
            }, { merge: true });
            break;
          }
        }
      }

      return targetUser;
    } catch (err) {
      console.warn('[CloudSync] updateUserPassword error:', err);
      return null;
    }
  }
};

