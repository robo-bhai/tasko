// Native Web Push and Browser Notification Service for Khanewal Connect
// Provides system-level desktop and mobile notification popups with app branding

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  orderId?: string;
  tag?: string;
}

const DEFAULT_ICON = '/assets/aistudio/IMG-20261028-WA0027_c07670f1.jpg';

export const PushNotificationService = {
  // Check if browser notifications are supported in this environment
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  },

  // Get current permission status: 'default' | 'granted' | 'denied'
  getPermission(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  },

  // Request user permission for native browser notifications
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) return 'denied';
    try {
      const result = await Notification.requestPermission();
      return result;
    } catch (err) {
      console.warn('Failed to request notification permission:', err);
      return 'denied';
    }
  },

  // Display a native system push notification
  show(payload: PushNotificationPayload): boolean {
    if (!this.isSupported()) return false;
    if (Notification.permission !== 'granted') return false;

    try {
      const options: NotificationOptions = {
        body: payload.body,
        icon: payload.icon || DEFAULT_ICON,
        badge: payload.badge || DEFAULT_ICON,
        tag: payload.tag || (payload.orderId ? `order-${payload.orderId}` : `khanewal-${Date.now()}`),
        // @ts-expect-error - vibrate is supported in standard mobile browsers
        vibrate: [200, 100, 200]
      };

      // Try Service Worker registration first if available (better mobile PWA behavior)
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready
          .then((registration) => {
            registration.showNotification(payload.title, options);
          })
          .catch(() => {
            // Fallback to standard window Notification
            this.showDirectNotification(payload.title, options, payload.orderId);
          });
        return true;
      }

      // Standard browser Notification API
      return this.showDirectNotification(payload.title, options, payload.orderId);
    } catch (err) {
      console.warn('Native notification display failed:', err);
      return false;
    }
  },

  showDirectNotification(title: string, options: NotificationOptions, orderId?: string): boolean {
    try {
      const notification = new Notification(title, options);
      notification.onclick = () => {
        window.focus();
        notification.close();
        if (orderId && typeof window !== 'undefined') {
          // Dispatch custom event so app can navigate or open order tracker
          window.dispatchEvent(new CustomEvent('open-order-tracker', { detail: { orderId } }));
        }
      };
      return true;
    } catch (err) {
      console.warn('Direct notification instantiation failed:', err);
      return false;
    }
  },

  // Send a quick test notification so the user can verify their browser settings
  sendTestNotification(): boolean {
    return this.show({
      title: 'Khanewal Connect Notifications Test',
      body: 'Browser push notifications kamyabi se active ho chuki hain! Ab aapko har naye order aur status ka fori popup mile ga.',
      tag: 'test-push-' + Date.now()
    });
  }
};
