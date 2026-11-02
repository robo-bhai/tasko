import React, { useState } from 'react';
import { AppNotification } from '../services/notifications';
import { PushNotificationService } from '../services/pushNotification';
import { 
  Bell, 
  X, 
  CheckCheck, 
  Clock, 
  ShoppingBag, 
  Wrench, 
  Truck, 
  ShieldCheck, 
  ExternalLink,
  Volume2,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onSelectOrder?: (orderId: string) => void;
  isUrdu?: boolean;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onSelectOrder,
  isUrdu = true
}) => {
  const [pushPermission, setPushPermission] = useState<NotificationPermission>(() => 
    PushNotificationService.getPermission()
  );
  const [testNotificationFeedback, setTestNotificationFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleRequestPush = async () => {
    const result = await PushNotificationService.requestPermission();
    setPushPermission(result);
    if (result === 'granted') {
      PushNotificationService.sendTestNotification();
      setTestNotificationFeedback(
        isUrdu 
          ? 'Push notifications kamyabi se enable ho gayi hain! Test notification bhej diya gaya hai.' 
          : 'Push notifications enabled successfully! Sent test popup.'
      );
      setTimeout(() => setTestNotificationFeedback(null), 4000);
    } else if (result === 'denied') {
      setTestNotificationFeedback(
        isUrdu 
          ? 'Browser ne push permission block kar di hai. Baraye meherbani browser URL bar par ja kar permission allow karein.' 
          : 'Browser blocked permission. Please allow notifications in site settings.'
      );
      setTimeout(() => setTestNotificationFeedback(null), 5000);
    }
  };

  const handleTestPush = () => {
    const sent = PushNotificationService.sendTestNotification();
    if (sent) {
      setTestNotificationFeedback(
        isUrdu 
          ? 'Test push notification screen par bhej diya gaya hai!' 
          : 'Test popup notification sent to screen!'
      );
    } else {
      setTestNotificationFeedback(
        isUrdu 
          ? 'Push notification bhejna namumkin raha. Permission check karein.' 
          : 'Unable to send push. Check browser permissions.'
      );
    }
    setTimeout(() => setTestNotificationFeedback(null), 4000);
  };

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'order_created':
        return <ShoppingBag className="w-4 h-4 text-amber-400" />;
      case 'order_assigned':
        return <Wrench className="w-4 h-4 text-emerald-400" />;
      case 'order_status':
        return <Truck className="w-4 h-4 text-blue-400" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-amber-300" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 ltr">
      <div className="bg-[#0e1017] text-white rounded-3xl max-w-md w-full border border-amber-500/40 shadow-2xl flex flex-col max-h-[88vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-amber-500/20 bg-[#090a0f] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-white">
                  {isUrdu ? 'Khanewal Notifications' : 'Live Notifications'}
                </h3>
                {unreadCount > 0 && (
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                    {unreadCount} {isUrdu ? 'Naye' : 'New'}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400">
                {isUrdu ? 'Aapke liye makhsoos real-time alerts' : 'Targeted real-time order alerts'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-[10px] text-amber-300 hover:text-white px-2 py-1 rounded-lg bg-slate-900 border border-amber-500/30 flex items-center gap-1 cursor-pointer"
                title={isUrdu ? 'Sab parha hua nishan karein' : 'Mark all as read'}
              >
                <CheckCheck className="w-3 h-3" />
                <span className="hidden xs:inline">{isUrdu ? 'Sab Read' : 'Read All'}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Native Browser Push Notification Card */}
        <div className="p-3 bg-[#12141f] border-b border-amber-500/20">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className={`w-2 h-2 rounded-full shrink-0 ${
                pushPermission === 'granted' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`} />
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  {isUrdu ? 'Browser Push Notifications' : 'Desktop & Mobile Push'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {pushPermission === 'granted'
                    ? (isUrdu ? 'Popups active hain (Screen alerts on)' : 'Active (Receiving instant popups)')
                    : pushPermission === 'denied'
                    ? (isUrdu ? 'Permissions blocked in browser' : 'Blocked in site permissions')
                    : (isUrdu ? 'Order status ka fori popup hasil karein' : 'Get instant system popups on updates')}
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-1.5">
              {pushPermission === 'granted' ? (
                <button
                  onClick={handleTestPush}
                  className="px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  title="Test notification"
                >
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>{isUrdu ? 'Test Push' : 'Test Push'}</span>
                </button>
              ) : (
                <button
                  onClick={handleRequestPush}
                  className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-[10px] font-black flex items-center gap-1 cursor-pointer shadow-sm transition-all"
                >
                  <Bell className="w-3 h-3" />
                  <span>{isUrdu ? 'Enable Push' : 'Enable'}</span>
                </button>
              )}
            </div>
          </div>

          {testNotificationFeedback && (
            <div className="mt-2 p-2 rounded-xl bg-amber-400/10 border border-amber-400/30 text-[10px] text-amber-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{testNotificationFeedback}</span>
            </div>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 space-y-2.5">
          {notifications.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-600">
                <Bell className="w-6 h-6" />
              </div>
              <p className="text-xs text-slate-400">
                {isUrdu 
                  ? 'Filhal aapke liye koi naya notification nahi hai.' 
                  : 'No notifications for your account right now.'}
              </p>
              <p className="text-[10px] text-slate-400 max-w-xs mx-auto">
                {isUrdu 
                  ? 'Jab aap order place karein ge ya admin status update karega to sirf aapko fori notification mile ga.' 
                  : 'Order updates and status changes are strictly sent to you.'}
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  if (!notif.isRead) onMarkAsRead(notif.id);
                  if (notif.orderId && onSelectOrder) {
                    onSelectOrder(notif.orderId);
                    onClose();
                  }
                }}
                className={`p-3 rounded-2xl border transition-all cursor-pointer relative ${
                  notif.isRead 
                    ? 'bg-slate-900/40 border-slate-800 text-slate-300' 
                    : 'bg-[#151724] border-amber-500/40 shadow-sm text-white'
                }`}
              >
                {!notif.isRead && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 absolute top-3 right-3 animate-pulse" />
                )}
                
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0 pr-3">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold truncate text-amber-200">
                        {notif.title}
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                      {notif.body}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 text-[9px] text-slate-400 font-mono">
                      <span className="flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {notif.orderId && (
                        <span className="text-amber-400 font-bold flex items-center gap-0.5">
                          #{notif.orderId}
                          <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#08090d] border-t border-slate-800 text-center shrink-0">
          <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
            <Volume2 className="w-3 h-3 text-amber-400" />
            <span>{isUrdu ? 'Targeted chime alerts & browser push popups active' : 'Targeted chime sound & push popups active'}</span>
          </p>
        </div>
      </div>
    </div>
  );
};
