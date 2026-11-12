import React, { useState } from 'react';
import { ScreenId, MemoryItem, ApiSettings } from '../types';
import { ArrowLeft, Search, Plus, Trash2, BrainCircuit, Shield, Check, ToggleLeft, ToggleRight } from 'lucide-react';
import { getStoredMemories, saveMemories, saveSettings } from '../services/storage';

interface MemoryScreenProps {
  onNavigate: (screen: ScreenId) => void;
  settings: ApiSettings;
  onUpdateSettings: (s: ApiSettings) => void;
}

export const MemoryScreen: React.FC<MemoryScreenProps> = ({
  onNavigate,
  settings,
  onUpdateSettings,
}) => {
  const [memories, setMemories] = useState<MemoryItem[]>(getStoredMemories());
  const [search, setSearch] = useState('');
  const [newMemoryText, setNewMemoryText] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const filtered = memories.filter((m) => m.content.toLowerCase().includes(search.toLowerCase()));

  const handleToggleMemoryGlobal = () => {
    const updated = { ...settings, memoryEnabled: !settings.memoryEnabled };
    onUpdateSettings(updated);
    saveSettings(updated);
  };

  const handleAddMemory = () => {
    if (!newMemoryText.trim()) return;

    const newMem: MemoryItem = {
      id: `mem-${Date.now()}`,
      category: 'preference',
      content: newMemoryText.trim(),
      timestamp: Date.now(),
      isEnabled: true,
    };

    const updated = [newMem, ...memories];
    setMemories(updated);
    saveMemories(updated);
    setNewMemoryText('');
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    const updated = memories.filter((m) => m.id !== id);
    setMemories(updated);
    saveMemories(updated);
  };

  const handleClearAll = () => {
    if (confirm('Clear all assistant memories? This cannot be undone.')) {
      setMemories([]);
      saveMemories([]);
    }
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
            <h2 className="text-base font-bold text-slate-100 font-heading">Memory Center</h2>
            <p className="text-[11px] text-slate-400">User-approved on-device memory in Room</p>
          </div>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-3 py-1.5 text-xs font-bold rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center gap-1 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          Add
        </button>
      </div>

      <div className="p-4 overflow-y-auto space-y-4 flex-1">
        {/* Master Memory Switch */}
        <div className="p-4 rounded-2xl bg-[#09152B] border border-cyan-500/30 flex items-center justify-between">
          <div className="space-y-1 pr-4">
            <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              <BrainCircuit className="w-4 h-4 text-cyan-400" />
              Assistant Memory Status
            </div>
            <p className="text-[11px] text-slate-400">
              When enabled, AURITH recalls user preferences and approved facts on device.
            </p>
          </div>

          <button
            onClick={handleToggleMemoryGlobal}
            className="text-cyan-400 hover:text-cyan-300 transition"
          >
            {settings.memoryEnabled ? (
              <ToggleRight className="w-8 h-8 text-cyan-400" />
            ) : (
              <ToggleLeft className="w-8 h-8 text-slate-600" />
            )}
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search saved memories..."
            className="w-full bg-[#081224] border border-slate-700 focus:border-cyan-400 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none transition"
          />
        </div>

        {/* Adding form */}
        {isAdding && (
          <div className="p-3.5 rounded-xl bg-[#081429] border border-cyan-500/40 space-y-3 animate-in fade-in">
            <span className="text-xs font-bold text-cyan-300 uppercase">New Memory Fact</span>
            <textarea
              value={newMemoryText}
              onChange={(e) => setNewMemoryText(e.target.value)}
              placeholder="e.g. User prefers Hindi/Hinglish replies, or favorite music genre is Lo-Fi..."
              rows={3}
              className="w-full bg-[#040812] border border-slate-700 focus:border-cyan-400 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none resize-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 text-xs rounded-lg bg-slate-800 text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMemory}
                className="px-4 py-1.5 text-xs font-bold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950"
              >
                Save Memory
              </button>
            </div>
          </div>
        )}

        {/* Memories list */}
        <div className="space-y-2">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-[#081429] border border-slate-800 hover:border-cyan-500/30 flex items-start justify-between gap-3 transition"
            >
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                  {item.category}
                </span>
                <p className="text-xs text-slate-200 leading-relaxed pt-1">{item.content}</p>
              </div>

              <button
                onClick={() => handleDelete(item.id)}
                className="p-1.5 text-slate-500 hover:text-red-400 rounded transition shrink-0"
                title="Delete memory"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-500">
              No memories recorded matching search.
            </div>
          )}
        </div>

        {memories.length > 0 && (
          <button
            onClick={handleClearAll}
            className="w-full py-2.5 rounded-xl bg-red-950/30 hover:bg-red-950/60 border border-red-500/30 text-red-300 text-xs font-bold transition"
          >
            Clear All Memories
          </button>
        )}
      </div>
    </div>
  );
};
