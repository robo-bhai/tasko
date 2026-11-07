import { PushNotificationService } from './pushNotification';

export interface AppNotification {
  id: string;
  recipientId: string; // User ID, 'all_admins', or specific recipient
  recipientRole?: 'admin' | 'customer' | 'provider' | 'all';
  title: string;
  body: string;
  orderId?: string;
  type: 'order_created' | 'order_assigned' | 'order_status' | 'system_alert' | 'extra_work';
  isRead: boolean;
  createdAt: string;
}

// Strict Notification Targeting Filter
// Ensures users ONLY receive and see notifications addressed to them
export function isNotificationForUser(
  notif: AppNotification, 
  userId: string | null, 
  userRole?: string
): boolean {
  if (!userId) return false;

  // Admin receives administrative broadcasts, new order alerts, and alerts specifically sent to admin
  if (userRole === 'admin') {
    return (
      notif.recipientRole === 'admin' ||
      notif.recipientId === 'all_admins' ||
      notif.recipientId === userId ||
      notif.recipientRole === 'all'
    );
  }

  // Provider receives assigned tasks or provider announcements
  if (userRole === 'provider') {
    return (
      notif.recipientId === userId ||
      (notif.recipientRole === 'provider' && (!notif.recipientId || notif.recipientId === 'all_providers'))
    );
  }

  // Customer: STRICT ISOLATION
  // Customers only see notifications where recipientId matches their unique user id!
  return notif.recipientId === userId;
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

// Local storage key for notification cache
const LOCAL_NOTIF_KEY = 'khanewal_notifications_v1';
const NOTIF_EVENT = 'khanewal_notif_event';

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
    localStorage.setItem(LOCAL_NOTIF_KEY, JSON.stringify(list.slice(0, 100)));
    window.dispatchEvent(new CustomEvent(NOTIF_EVENT));
  } catch {
    // ignore
  }
}

export const NotificationService = {
  // Push a new targeted notification
  async createNotification(notif: {
    recipientId: string;
    recipientRole?: 'admin' | 'customer' | 'provider' | 'all';
    recipientEmail?: string;
    title: string;
    body: string;
    orderId?: string;
    order?: any;
    note?: string;
    type: 'order_created' | 'order_assigned' | 'order_status' | 'system_alert' | 'extra_work';
    /** true = in-app only (the server already sends the email, e.g. extra-work events) */
    skipEmail?: boolean;
  }): Promise<string> {
    const newRecord: AppNotification = {
      id: 'notif-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      recipientId: notif.recipientId,
      recipientRole: notif.recipientRole,
      title: notif.title,
      body: notif.body,
      orderId: notif.orderId,
      type: notif.type,
      isRead: false,
      createdAt: new Date().toISOString()
    };

    // Save locally
    const current = getLocalNotifications();
    saveLocalNotifications([newRecord, ...current]);

    // Play chime locally if appropriate
    playNotificationChime();

    // Trigger OS Push Notification
    PushNotificationService.showDirectNotification(
      newRecord.title, 
      { body: newRecord.body, tag: newRecord.orderId || newRecord.id }, 
      newRecord.orderId
    );

    // Dispatch transactional email via Brevo and backend notification router
    if (notif.skipEmail) return newRecord.id;
    try {
      fetch('/api/notifications/dispatch-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: notif.type,
          recipientRole: notif.recipientRole,
          recipientId: notif.recipientId,
          recipientEmail: notif.recipientEmail,
          title: notif.title,
          body: notif.body,
          orderId: notif.orderId,
          orderData: notif.order,
          note: notif.note
        })
      }).catch(err => console.warn('Email notification dispatch error:', err));
    } catch {
      // ignore
    }

    return newRecord.id;
  },

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    const current = getLocalNotifications();
    const updated = current.map(n => n.id === notificationId ? { ...n, isRead: true } : n);
    saveLocalNotifications(updated);
  },

  // Mark all as read for active user
  async markAllAsRead(userId: string, userRole?: string): Promise<void> {
    const current = getLocalNotifications();
    const updated = current.map(n => {
      if (isNotificationForUser(n, userId, userRole)) {
        return { ...n, isRead: true };
      }
      return n;
    });
    saveLocalNotifications(updated);
  },

  // Subscribe to strictly targeted notifications for the active user
  subscribe(
    userId: string | null,
    userRole: string | undefined,
    callback: (notifications: AppNotification[]) => void
  ): () => void {
    if (!userId) {
      callback([]);
      return () => {};
    }

    const deliver = () => {
      const list = getLocalNotifications().filter(n => isNotificationForUser(n, userId, userRole));
      callback(list);
    };

    deliver();

    const handler = () => deliver();
    window.addEventListener(NOTIF_EVENT, handler);
    window.addEventListener('storage', handler);

    return () => {
      window.removeEventListener(NOTIF_EVENT, handler);
      window.removeEventListener('storage', handler);
    };
  }
};
