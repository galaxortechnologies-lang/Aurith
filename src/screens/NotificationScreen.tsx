import React, { useState } from 'react';
import { ScreenId } from '../types';
import { ArrowLeft, Bell, BellOff, Trash2, Shield, MessageSquare, Mail, Calendar } from 'lucide-react';

interface NotificationScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const NotificationScreen: React.FC<NotificationScreenProps> = ({ onNavigate }) => {
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      app: 'WhatsApp',
      title: 'Rohit Sharma',
      text: 'Bhai kal subah call karte hain meeting ke liye.',
      time: '12 mins ago',
      icon: MessageSquare,
      color: 'text-emerald-400',
    },
    {
      id: '2',
      app: 'Gmail',
      title: 'Cloud Alert',
      text: 'Security verification succeeded for your session.',
      time: '45 mins ago',
      icon: Mail,
      color: 'text-red-400',
    },
    {
      id: '3',
      app: 'Google Calendar',
      title: 'Project Standup',
      text: 'Starting in 30 minutes with the architecture team.',
      time: '1 hour ago',
      icon: Calendar,
      color: 'text-blue-400',
    },
  ]);

  const handleClearAll = () => {
    setNotifications([]);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#040812] overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-[#081224] border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('home')}
            className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base font-bold text-slate-100 font-heading">Notification Center</h2>
            <p className="text-[11px] text-slate-400">AurithNotificationListenerService</p>
          </div>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={handleClearAll}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 flex items-center gap-1 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      <div className="p-4 overflow-y-auto space-y-3 flex-1">
        {/* Privacy Note */}
        <div className="p-3 rounded-xl bg-[#09152B] border border-cyan-500/20 text-xs text-slate-300 flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-400 leading-relaxed">
            AURITH Notification Access is optional. OTPs, passwords, and sensitive system tokens are never captured or relayed to external servers.
          </p>
        </div>

        {/* Notifications List */}
        <div className="space-y-2 mt-2">
          {notifications.map((item) => {
            const IconComp = item.icon;
            return (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-[#081429] border border-slate-800 hover:border-cyan-500/30 space-y-1.5 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconComp className={`w-4 h-4 ${item.color}`} />
                    <span className="text-xs font-bold text-slate-200">{item.app}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{item.time}</span>
                </div>
                <div className="text-xs font-semibold text-cyan-300">{item.title}</div>
                <div className="text-xs text-slate-300 leading-relaxed">{item.text}</div>
              </div>
            );
          })}

          {notifications.length === 0 && (
            <div className="p-12 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
              <BellOff className="w-8 h-8 text-slate-600" />
              <span>All saved notification records cleared.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
