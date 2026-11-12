import React, { useState } from 'react';
import { ScreenId, AppActivityRecord } from '../types';
import { ArrowLeft, History, Shield, PlusCircle, Trash, RefreshCw } from 'lucide-react';
import { getStoredAppActivity } from '../services/storage';

interface AppActivityScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const AppActivityScreen: React.FC<AppActivityScreenProps> = ({ onNavigate }) => {
  const [activities] = useState<AppActivityRecord[]>(getStoredAppActivity());

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
            <h2 className="text-base font-bold text-slate-100 font-heading">App Activity History</h2>
            <p className="text-[11px] text-slate-400">PackageChangeReceiver Event Timeline</p>
          </div>
        </div>
      </div>

      <div className="p-4 overflow-y-auto space-y-3 flex-1">
        {/* Compliance Notice */}
        <div className="p-3 rounded-xl bg-[#09152B] border border-cyan-500/20 text-xs text-slate-300 flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-400 leading-relaxed">
            AURITH tracks package events (installations, uninstalls, and updates) observed <strong>after</strong> monitoring started. Historical events prior to installation are not fabricated.
          </p>
        </div>

        {/* Timeline List */}
        <div className="space-y-2 mt-2">
          {activities.map((item) => {
            const isInstall = item.eventType === 'INSTALLED';
            const isRemoved = item.eventType === 'REMOVED';

            return (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-[#081429] border border-slate-800 flex items-center justify-between transition"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isInstall
                        ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-400'
                        : isRemoved
                        ? 'bg-red-950/60 border border-red-500/40 text-red-400'
                        : 'bg-cyan-950/60 border border-cyan-500/40 text-cyan-400'
                    }`}
                  >
                    {isInstall ? (
                      <PlusCircle className="w-4 h-4" />
                    ) : isRemoved ? (
                      <Trash className="w-4 h-4" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <div className="text-xs font-bold text-slate-200">{item.appName}</div>
                    <div className="text-[10px] font-mono text-slate-500">{item.packageName}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(item.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    isInstall
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : isRemoved
                      ? 'bg-red-500/20 text-red-300'
                      : 'bg-cyan-500/20 text-cyan-300'
                  }`}
                >
                  {item.eventType}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
