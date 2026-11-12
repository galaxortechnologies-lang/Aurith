import React, { useState } from 'react';
import { ScreenId, DownloadFileItem } from '../types';
import { ArrowLeft, Search, FileText, Trash2, Download, AlertTriangle, Check } from 'lucide-react';
import { getStoredDownloads, saveDownloads } from '../services/storage';

interface DownloadsScreenProps {
  onNavigate: (screen: ScreenId) => void;
  onRequestConfirmAction?: (details: any) => void;
}

export const DownloadsScreen: React.FC<DownloadsScreenProps> = ({
  onNavigate,
  onRequestConfirmAction,
}) => {
  const [files, setFiles] = useState<DownloadFileItem[]>(getStoredDownloads());
  const [search, setSearch] = useState('');
  const [fileToDelete, setFileToDelete] = useState<DownloadFileItem | null>(null);

  const filtered = files.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = (file: DownloadFileItem) => {
    setFileToDelete(file);
  };

  const confirmDelete = () => {
    if (!fileToDelete) return;
    const updated = files.filter((f) => f.id !== fileToDelete.id);
    setFiles(updated);
    saveDownloads(updated);
    setFileToDelete(null);
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
            <h2 className="text-base font-bold text-slate-100 font-heading">Downloads Manager</h2>
            <p className="text-[11px] text-slate-400">MediaStore & Storage Access Framework</p>
          </div>
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
            placeholder="Search downloaded files..."
            className="w-full bg-[#081224] border border-slate-700 focus:border-cyan-400 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none transition"
          />
        </div>
      </div>

      {/* Files List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
        {filtered.map((file) => (
          <div
            key={file.id}
            className="p-3.5 rounded-xl bg-[#081429] border border-slate-800 hover:border-cyan-500/40 flex items-center justify-between transition group"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition truncate">
                  {file.name}
                </div>
                <div className="text-[11px] text-slate-400">
                  {file.type} • {file.sizeFormatted} • {file.date}
                </div>
              </div>
            </div>

            <button
              onClick={() => handleDelete(file)}
              className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition shrink-0"
              title="Delete File"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="p-8 text-center text-xs text-slate-500">
            No downloaded files found matching your search.
          </div>
        )}
      </div>

      {/* Custom Deletion Confirmation Modal */}
      {fileToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-[#0B1528] border border-red-500/50 rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center gap-2 text-red-400 mb-3">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-sm font-bold uppercase tracking-wider">Confirm File Deletion</h3>
            </div>
            <p className="text-xs text-slate-300 mb-2">
              Are you sure you want to permanently delete this file? This uses Android's native file deletion and cannot be undone.
            </p>
            <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-800/40 text-[11px] font-mono text-red-200 mb-4 break-all">
              {fileToDelete.name} ({fileToDelete.sizeFormatted})
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFileToDelete(null)}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
