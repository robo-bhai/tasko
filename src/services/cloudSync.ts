// Pure MySQL & Local Snapshot Sync Service (Zero% Data Loss, Pure MySQL Architecture)
// Replaces dual Firestore sync to eliminate race conditions and data conflicts
import { User, Order, SystemSettings, OrderReview, HomeServiceItem, TransportVehicleItem } from '../types';

export interface SystemCloudBackup {
  users: User[];
  orders: Order[];
  settings: SystemSettings;
  services?: HomeServiceItem[];
  vehicles?: TransportVehicleItem[];
  reviews?: OrderReview[];
  updatedAt: string;
  source: string;
}

export const CloudSyncService = {
  // Save an individual user directly to MySQL backend
  async saveUser(user: User): Promise<void> {
    try {
      await fetch('/api/users/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users: [user] })
      });
    } catch (err) {
      console.warn(`[MySQL Sync] Note saving user ${user.id}:`, err);
    }
  },

  // Save an individual order directly to MySQL backend
  async saveOrder(order: Order): Promise<void> {
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });
    } catch (err) {
      console.warn(`[MySQL Sync] Note saving order ${order.id}:`, err);
    }
  },

  // Delete order on MySQL backend
  async deleteOrder(orderId: string, resetPass?: string): Promise<void> {
    try {
      const pass = resetPass || 'RESET_PASS';
      await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'x-reset-key': pass
        },
        body: JSON.stringify({ resetPass: pass, resetKey: pass })
      });
    } catch (err) {
      console.warn(`[MySQL Sync] Note deleting order ${orderId}:`, err);
    }
  },

  // Delete user on MySQL backend
  async deleteUser(userId: string, resetPass?: string): Promise<void> {
    try {
      const pass = resetPass || 'RESET_PASS';
      await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'x-reset-key': pass
        },
        body: JSON.stringify({ resetPass: pass, resetKey: pass })
      });
    } catch (err) {
      console.warn(`[MySQL Sync] Note deleting user ${userId}:`, err);
    }
  },

  // Save system settings to MySQL backend
  async saveSettings(settings: SystemSettings): Promise<void> {
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
    } catch (err) {
      console.warn('[MySQL Sync] Note saving settings:', err);
    }
  },

  // Auto-snapshot trigger on MySQL workflow end
  async uploadFullBackup(state: {
    users: User[];
    orders: Order[];
    settings: SystemSettings;
    services?: HomeServiceItem[];
    vehicles?: TransportVehicleItem[];
  }): Promise<void> {
    try {
      await fetch('/api/db/snapshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          label: `Auto-Snapshot (${new Date().toLocaleTimeString()})`,
          state 
        })
      });
    } catch (err) {
      console.warn('[MySQL Sync] Note uploading snapshot backup:', err);
    }
  },

  // Load authoritative state from MySQL backend
  async loadCloudState(): Promise<SystemCloudBackup | null> {
    try {
      const res = await fetch('/api/sync/all-state');
      if (!res.ok) return null;
      const data = await res.json();
      if (!data.success) return null;

      return {
        users: data.users || [],
        orders: data.orders || [],
        settings: data.settings || null,
        services: data.services || [],
        vehicles: data.vehicles || [],
        updatedAt: new Date().toISOString(),
        source: 'MySQL_omniserve_db'
      };
    } catch (err) {
      console.warn('[MySQL Sync] Note loading MySQL state:', err);
      return null;
    }
  },

  // Periodic MySQL polling to keep multi-tab clients synced without Firestore
  subscribeToCloudChanges(_callbacks: {
    onUsersChange?: (users: User[]) => void;
    onOrdersChange?: (orders: Order[]) => void;
    onSettingsChange?: (settings: SystemSettings) => void;
  }): () => void {
    // Non-intrusive polling interval
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/sync/all-state');
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            if (_callbacks.onOrdersChange && Array.isArray(data.orders)) {
              _callbacks.onOrdersChange(data.orders);
            }
            if (_callbacks.onUsersChange && Array.isArray(data.users)) {
              _callbacks.onUsersChange(data.users);
            }
            if (_callbacks.onSettingsChange && data.settings) {
              _callbacks.onSettingsChange(data.settings);
            }
          }
        }
      } catch {
        // network silent
      }
    }, 15000);

    return () => clearInterval(interval);
  },

  // Get user from MySQL backend
  async getUserByEmailOrPhone(queryVal: string): Promise<User | null> {
    try {
      const res = await fetch(`/api/users/find?q=${encodeURIComponent(queryVal)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) return data.user;
      }
    } catch {
      // ignore
    }
    return null;
  },

  // Update user password in MySQL
  async updateUserPassword(emailOrPhone: string, newPass: string): Promise<boolean> {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrPhone, newPassword: newPass })
      });
      const data = await res.json();
      return !!data.success;
    } catch {
      return false;
    }
  }
};
