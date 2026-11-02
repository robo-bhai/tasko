import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

export interface AppNotification {
  id: string;
  recipientId: string;
  recipientRole?: 'admin' | 'customer' | 'provider' | 'all';
  title: string;
  body: string;
  orderId?: string;
  type: 'order_created' | 'order_assigned' | 'order_status' | 'system_alert';
  isRead: boolean;
  createdAt: string;
}

// Web Audio API soft notification chime (100% reliable without external audio assets)
export function playNotificationChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const now = ctx.currentTime;
    
    // First high note (bell tone)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.5);

    // Second harmonious note
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(880, now + 0.15); // A5
    osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.35); // D6
    gain2.gain.setValueAtTime(0.15, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.65);
  } catch (err) {
    console.warn('Audio chime unavailable:', err);
  }
}

// Local storage fallback key for offline notification cache
const LOCAL_NOTIF_KEY = 'khanewal_notifications_v1';

function getLocalNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(LOCAL_NOTIF_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalNotifications(list: AppNotification[]) {
  try {
    localStorage.setItem(LOCAL_NOTIF_KEY, JSON.stringify(list.slice(0, 50)));
  } catch {
    // ignore
  }
}

export const NotificationService = {
  // Push a new real-time notification
  async createNotification(notif: {
    recipientId: string;
    recipientRole?: 'admin' | 'customer' | 'provider' | 'all';
    title: string;
    body: string;
    orderId?: string;
    type: 'order_created' | 'order_assigned' | 'order_status' | 'system_alert';
  }): Promise<string> {
    const newRecord: AppNotification = {
      id: 'notif-' + Date.now(),
      ...notif,
      isRead: false,
      createdAt: new Date().toISOString()
    };

    // Save locally
    const current = getLocalNotifications();
    saveLocalNotifications([newRecord, ...current]);

    // Push to Firestore if connected
    try {
      const docRef = await addDoc(collection(db, 'notifications'), {
        ...newRecord,
        serverTime: serverTimestamp()
      });
      return docRef.id;
    } catch (err) {
      console.warn('Firestore notification write failed, cached locally:', err);
      return newRecord.id;
    }
  },

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    const current = getLocalNotifications();
    const updated = current.map(n => n.id === notificationId ? { ...n, isRead: true } : n);
    saveLocalNotifications(updated);

    try {
      const ref = doc(db, 'notifications', notificationId);
      await updateDoc(ref, { isRead: true });
    } catch {
      // offline fallback
    }
  },

  // Mark all as read for user
  async markAllAsRead(recipientId: string): Promise<void> {
    const current = getLocalNotifications();
    const updated = current.map(n => (n.recipientId === recipientId || n.recipientId === 'all_admins') ? { ...n, isRead: true } : n);
    saveLocalNotifications(updated);
  },

  // Subscribe to real-time notifications for a user or admin
  subscribe(
    userId: string | null,
    userRole: string | undefined,
    callback: (notifications: AppNotification[]) => void
  ): () => void {
    let previousCount = -1;

    // First load from local storage
    const initialLocal = getLocalNotifications().filter(n => {
      if (userRole === 'admin') return true;
      return n.recipientId === userId || n.recipientId === 'all';
    });
    callback(initialLocal);

    if (!userId) {
      return () => {};
    }

    try {
      const notifsRef = collection(db, 'notifications');
      let q;
      if (userRole === 'admin') {
        q = query(notifsRef, orderBy('createdAt', 'desc'), limit(30));
      } else {
        q = query(
          notifsRef, 
          where('recipientId', 'in', [userId, 'all']), 
          orderBy('createdAt', 'desc'), 
          limit(30)
        );
      }

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list: AppNotification[] = [];
          snapshot.forEach(docSnap => {
            const data = docSnap.data();
            list.push({
              id: docSnap.id,
              recipientId: data.recipientId || '',
              recipientRole: data.recipientRole,
              title: data.title || '',
              body: data.body || '',
              orderId: data.orderId,
              type: data.type || 'system_alert',
              isRead: !!data.isRead,
              createdAt: data.createdAt || new Date().toISOString()
            });
          });

          // Play audio chime if new unread notification arrived
          const unreadCount = list.filter(n => !n.isRead).length;
          if (previousCount >= 0 && unreadCount > previousCount) {
            playNotificationChime();
          }
          previousCount = unreadCount;

          callback(list.length > 0 ? list : getLocalNotifications());
        },
        (error) => {
          console.warn('Firestore notification listener error, falling back to local storage:', error);
          callback(getLocalNotifications());
        }
      );

      return unsubscribe;
    } catch (err) {
      console.warn('Notification listener setup fallback:', err);
      return () => {};
    }
  }
};
