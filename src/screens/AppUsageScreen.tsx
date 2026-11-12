import React, { useState } from 'react';
import { ScreenId } from '../types';
import { ArrowLeft, Clock, BarChart3, Settings, AlertCircle, ExternalLink, ShieldCheck } from 'lucide-react';

interface AppUsageScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const AppUsageScreen: React.FC<AppUsageScreenProps> = ({ onNavigate }) => {
  const [permissionGranted, setPermissionGranted] = useState(true);

  const usageStats = [
    { name: 'WhatsApp', time: '1h 45m', minutes: 105, percent: 41, color: 'from-emerald-500 to-teal-500' },
    { name: 'YouTube', time: '1h 10m', minutes: 70, percent: 27, color: 'from-red-500 to-amber-500' },
    { name: 'Google Chrome', time: '45m', minutes: 45, percent: 17, color: 'from-blue-500 to-cyan-500' },
    { name: 'AURITH Assistant', time: '28m', minutes: 28, percent: 11, color: 'from-cyan-400 to-blue-600' },
    { name: 'Android Settings', time: '10m', minutes: 10, percent: 4, color: 'from-slate-400 to-slate-600' },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 bg-[#040812]">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate('home')}
          className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-slate-800 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-slate-100 font-heading">App Usage Intelligence</h2>
          <p className="text-[11px] text-slate-400">Android UsageStatsManager Insights</p>
        </div>
      </div>

      {/* Usage Access Banner */}
      <div className="p-4 rounded-2xl bg-[#09152B] border border-cyan-500/30 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-400">
            <Clock className="w-5 h-5" />
            <span className="text-xs font-mono font-bold uppercase tracking-wide">Today's Screen Time</span>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Access Granted
          </span>
        </div>
        <div className="text-3xl font-black text-slate-100 font-heading">4h 18m</div>
        <p className="text-xs text-slate-400">
          UsageStatsManager monitors foreground application usage on device.
        </p>
      </div>

      {/* Most Used Apps */}
      <div className="p-4 rounded-2xl bg-[#081224] border border-slate-800 space-y-4">
        <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-cyan-400" />
          MOST USED APPS TODAY
        </div>

        <div className="space-y-3">
          {usageStats.map((item, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200">{item.name}</span>
                <span className="font-mono text-cyan-400 font-bold">{item.time}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${item.color}`}
                  style={{ width: `${item.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Onboarding info */}
      <div className="p-3.5 rounded-xl bg-[#081224] border border-slate-800 text-xs text-slate-400 space-y-2">
        <div className="font-bold text-slate-300 flex items-center gap-1.5">
          <Settings className="w-4 h-4 text-cyan-400" />
          Usage Access Settings Page
        </div>
        <p className="text-[11px] leading-relaxed">
          To revoke or modify usage tracking permissions on your smartphone, navigate to Android Settings &gt; Apps &gt; Special App Access &gt; Usage Access &gt; AURITH.
        </p>
      </div>
    </div>
  );
};
