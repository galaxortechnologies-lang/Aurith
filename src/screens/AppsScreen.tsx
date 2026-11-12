import React, { useState } from 'react';
import { ScreenId } from '../types';
import { ArrowLeft, Search, ExternalLink, Sparkles, Grid, Mic } from 'lucide-react';
import { COMPREHENSIVE_APP_CATALOG, AppDefinition } from '../services/appLauncher';

interface AppsScreenProps {
  onNavigate: (screen: ScreenId) => void;
  onLaunchToast?: (msg: string) => void;
}

export const AppsScreen: React.FC<AppsScreenProps> = ({ onNavigate, onLaunchToast }) => {
  const [search, setSearch] = useState('');
  const [launchedApp, setLaunchedApp] = useState<string | null>(null);

  const filtered = COMPREHENSIVE_APP_CATALOG.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.packageName.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase()) ||
      a.aliases.some((alias) => alias.toLowerCase().includes(search.toLowerCase()))
  );

  const handleLaunch = (app: AppDefinition) => {
    setLaunchedApp(app.name);
    if (app.webUrl) {
      try {
        window.open(app.webUrl, '_blank');
      } catch {
        // ignore
      }
    }
    if (onLaunchToast) {
      onLaunchToast(`Triggered native Android launch intent for ${app.name} (${app.packageName})`);
    }
    setTimeout(() => setLaunchedApp(null), 3000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#040812] overflow-hidden">
      {/* Top Header */}
      <div className="p-4 bg-[#081224] border-b border-slate-800 flex items-center gap-3 shrink-0">
        <button
          onClick={() => onNavigate('home')}
          className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-slate-800 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-base font-bold text-slate-100 font-heading">App Launcher</h2>
          <p className="text-[11px] text-slate-400">PackageManager declared package visibility</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-4 shrink-0">
        <div className="relative">
          <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search launchable apps (Hindi or English)..."
            className="w-full bg-[#081224] border border-slate-700 focus:border-cyan-400 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none transition"
          />
        </div>
      </div>

      {/* Launched App Feedback Toast */}
      {launchedApp && (
        <div className="mx-4 mb-2 p-3 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-200 text-xs flex items-center gap-2 animate-in fade-in">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>Opening <strong>{launchedApp}</strong> via Intent.FLAG_ACTIVITY_NEW_TASK</span>
        </div>
      )}

      {/* Apps Grid/List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
        {filtered.map((app) => (
          <div
            key={app.packageName}
            className="p-3 rounded-xl bg-[#081429] border border-slate-800 hover:border-cyan-500/40 flex items-center justify-between transition group"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-[#0D2144] border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 group-hover:scale-105 transition">
                <Grid className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition">
                    {app.name}
                  </span>
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
                    {app.category}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-slate-500 truncate">{app.packageName}</div>
              </div>
            </div>

            <button
              onClick={() => handleLaunch(app)}
              className="px-3 py-1.5 rounded-lg bg-[#0F2347] hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
