import React, { useState } from 'react';
import { ScreenId, ReminderItem } from '../types';
import { ArrowLeft, Plus, AlarmClock, Bell, Trash2, CheckCircle2, Clock } from 'lucide-react';
import { getStoredReminders, saveReminders } from '../services/storage';

interface RemindersScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const RemindersScreen: React.FC<RemindersScreenProps> = ({ onNavigate }) => {
  const [reminders, setReminders] = useState<ReminderItem[]>(getStoredReminders());
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState<'reminder' | 'alarm'>('reminder');

  const handleAdd = () => {
    if (!title.trim() || !time.trim()) return;

    const newRem: ReminderItem = {
      id: `rem-${Date.now()}`,
      title: title.trim(),
      time: time.trim(),
      timestamp: Date.now() + 3600000,
      isCompleted: false,
      type,
    };

    const updated = [newRem, ...reminders];
    setReminders(updated);
    saveReminders(updated);

    setTitle('');
    setTime('');
    setIsAdding(false);
  };

  const handleToggle = (id: string) => {
    const updated = reminders.map((r) => (r.id === id ? { ...r, isCompleted: !r.isCompleted } : r));
    setReminders(updated);
    saveReminders(updated);
  };

  const handleDelete = (id: string) => {
    const updated = reminders.filter((r) => r.id !== id);
    setReminders(updated);
    saveReminders(updated);
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
            <h2 className="text-base font-bold text-slate-100 font-heading">Reminders & Alarms</h2>
            <p className="text-[11px] text-slate-400">Integrated with AlarmClock & AlarmManager</p>
          </div>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-3 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 text-slate-950 flex items-center gap-1 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          {isAdding ? 'Close' : 'Add New'}
        </button>
      </div>

      <div className="p-4 overflow-y-auto space-y-3 flex-1">
        {/* Creation Form */}
        {isAdding && (
          <div className="p-4 rounded-2xl bg-[#09152B] border border-cyan-500/40 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">Schedule Alert</span>
              <div className="flex rounded-lg bg-slate-800 p-0.5 text-xs">
                <button
                  onClick={() => setType('reminder')}
                  className={`px-3 py-1 rounded-md transition ${type === 'reminder' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'}`}
                >
                  Reminder
                </button>
                <button
                  onClick={() => setType('alarm')}
                  className={`px-3 py-1 rounded-md transition ${type === 'alarm' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'}`}
                >
                  Alarm
                </button>
              </div>
            </div>

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title (e.g. Daily Standup or Wake up)..."
              className="w-full bg-[#040812] border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none"
            />

            <input
              type="text"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="Time (e.g. 06:30 AM or Tomorrow 9 AM)..."
              className="w-full bg-[#040812] border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="px-4 py-1.5 text-xs font-bold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950"
              >
                Schedule {type === 'alarm' ? 'Alarm' : 'Reminder'}
              </button>
            </div>
          </div>
        )}

        {/* List of Reminders / Alarms */}
        <div className="space-y-2">
          {reminders.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 rounded-xl border flex items-center justify-between transition ${
                item.isCompleted
                  ? 'bg-[#060D1A] border-slate-800/60 opacity-60'
                  : 'bg-[#081429] border-slate-800 hover:border-cyan-500/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggle(item.id)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition shrink-0 ${
                    item.isCompleted ? 'text-emerald-400 bg-emerald-950/40' : 'text-slate-500 hover:text-cyan-400'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5" />
                </button>

                <div>
                  <div className={`text-xs font-bold ${item.isCompleted ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                    {item.title}
                  </div>
                  <div className="text-[11px] text-cyan-400 font-mono flex items-center gap-1 mt-0.5">
                    {item.type === 'alarm' ? <AlarmClock className="w-3 h-3 text-amber-400" /> : <Clock className="w-3 h-3 text-cyan-400" />}
                    <span>{item.time}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleDelete(item.id)}
                className="p-1.5 text-slate-500 hover:text-red-400 rounded transition"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
