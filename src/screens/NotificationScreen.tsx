import React, { useState } from 'react';
import { ScreenId } from '../types';
import { ArrowLeft, Bell, BellOff, Trash2, Shield, MessageSquare, Mail, Calendar, Send } from 'lucide-react';

interface NotificationScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const NotificationScreen: React.FC<NotificationScreenProps> = ({ onNavigate }) => {
  const [permissionStatus, setPermissionStatus] = useState<string>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );

  const [notifications, setNotifications] = useState([
    {
      id: '1',
      app: 'WhatsApp',
      title: 'Rohit Sharma',
      text: 'Bhai kal subah call karte hain meeting ke liye.',
      time: '12 mins ago',
      icon: MessageSquare,
      color: 'text-emerald-600',
    },
    {
      id: '2',
      app: 'Gmail',
      title: 'Cloud Alert',
      text: 'Security verification succeeded for your session.',
      time: '45 mins ago',
      icon: Mail,
      color: 'text-red-600',
    },
    {
      id: '3',
      app: 'Google Calendar',
      title: 'Project Standup',
      text: 'Starting in 30 minutes with the architecture team.',
      time: '1 hour ago',
      icon: Calendar,
      color: 'text-blue-600',
    },
  ]);

  const handleRequestPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('Browser Notifications are not supported in this environment.');
      return;
    }
    const result = await Notification.requestPermission();
    setPermissionStatus(result);
    if (result === 'granted') {
      new Notification('AURITH Assistant', {
        body: 'Real browser notifications are now active and enabled!',
        icon: '/vite.svg',
      });
    }
  };

  const handleSendRealTestNotification = () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('Notifications not supported.');
      return;
    }

    if (Notification.permission !== 'granted') {
      Notification.requestPermission().then((res) => {
        setPermissionStatus(res);
        if (res === 'granted') {
          triggerRealNotif();
        } else {
          alert('Notification permission was denied.');
        }
      });
    } else {
      triggerRealNotif();
    }
  };

  const triggerRealNotif = () => {
    try {
      new Notification('AURITH Live Alert', {
        body: 'This is a real operating system notification triggered by AURITH assistant!',
        icon: '/vite.svg',
      });

      const newNotif = {
        id: `notif-${Date.now()}`,
        app: 'AURITH Assistant',
        title: 'Real Push Triggered',
        text: 'Successfully dispatched a real operating system notification.',
        time: 'Just now',
        icon: Bell,
        color: 'text-cyan-700',
      };
      setNotifications([newNotif, ...notifications]);
    } catch (err: any) {
      alert(`Failed to trigger notification: ${err.message}`);
    }
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('home')}
            className="p-1.5 text-slate-600 hover:text-cyan-700 rounded-lg hover:bg-slate-100 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base font-bold text-slate-900 font-heading">Real Notification Center</h2>
            <p className="text-[11px] text-slate-500 font-medium">Browser Push & NotificationListenerService</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 flex items-center gap-1 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="p-4 overflow-y-auto space-y-3.5 flex-1">
        {/* Permission Banner */}
        <div className="p-3.5 rounded-2xl bg-white border border-cyan-200 text-xs text-slate-700 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <Bell className="w-4 h-4 text-cyan-600" />
            <div>
              <div className="font-bold text-slate-900">Push Status: {permissionStatus.toUpperCase()}</div>
              <div className="text-[10px] text-slate-500">Enable real OS notifications for background alerts</div>
            </div>
          </div>
          {permissionStatus !== 'granted' ? (
            <button
              onClick={handleRequestPermission}
              className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs transition shadow-sm"
            >
              Enable Real Push
            </button>
          ) : (
            <button
              onClick={handleSendRealTestNotification}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
            >
              <Send className="w-3.5 h-3.5" /> Send Test
            </button>
          )}
        </div>

        {/* Privacy Note */}
        <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5 shadow-sm">
          <Shield className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
            AURITH uses real HTML5 Notification API for real operating system push alerts across desktop and mobile browsers.
          </p>
        </div>

        {/* Notifications List */}
        <div className="space-y-2 mt-2">
          {notifications.map((item) => {
            const IconComp = item.icon;
            return (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-white border border-slate-200/90 hover:border-cyan-400 space-y-1.5 transition shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconComp className={`w-4 h-4 ${item.color}`} />
                    <span className="text-xs font-bold text-slate-900">{item.app}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{item.time}</span>
                </div>
                <div className="text-xs font-bold text-cyan-800">{item.title}</div>
                <div className="text-xs text-slate-600 leading-relaxed font-medium">{item.text}</div>
              </div>
            );
          })}

          {notifications.length === 0 && (
            <div className="p-12 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
              <BellOff className="w-8 h-8 text-slate-300" />
              <span>All notification records cleared.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
