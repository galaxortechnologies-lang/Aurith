import React, { useState } from 'react';
import { X, Download, Copy, Check, FileCode, Folder, Smartphone } from 'lucide-react';
import { ANDROID_FILES, downloadAndroidProjectZip } from '../services/exportZip';

interface CodeExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CodeExplorerModal: React.FC<CodeExplorerModalProps> = ({ isOpen, onClose }) => {
  const fileKeys = Object.keys(ANDROID_FILES);
  const [selectedFile, setSelectedFile] = useState<string>(fileKeys[0] || 'build.gradle.kts');
  const [copied, setCopied] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentContent = ANDROID_FILES[selectedFile] || '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadAndroidProjectZip();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl h-[90vh] bg-[#070F1E] border border-cyan-500/30 rounded-2xl flex flex-col shadow-[0_0_50px_rgba(6,182,212,0.2)] overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-[#0A172C] border-b border-cyan-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                AURITH Native Android Source Project
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Android 16 • Kotlin
                </span>
              </h3>
              <p className="text-xs text-slate-400">Created by Anup Chand • com.anupchand.aurith</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.4)] transition"
            >
              <Download className="w-3.5 h-3.5" />
              {downloading ? 'Packing Zip...' : 'Download Project (.ZIP)'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Split */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* File Tree Sidebar */}
          <div className="w-full md:w-64 bg-[#050B16] border-b md:border-b-0 md:border-r border-slate-800/80 p-3 overflow-y-auto">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-2 flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-cyan-400" />
              Project Structure
            </div>
            <div className="space-y-1">
              {fileKeys.map((filePath) => {
                const isSelected = selectedFile === filePath;
                const fileName = filePath.split('/').pop();
                return (
                  <button
                    key={filePath}
                    onClick={() => setSelectedFile(filePath)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center gap-2 transition ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                    }`}
                  >
                    <FileCode className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <span className="truncate">{fileName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Code Viewer Panel */}
          <div className="flex-1 flex flex-col bg-[#030712] overflow-hidden">
            {/* File Path & Copy Toolbar */}
            <div className="p-3 bg-[#081224] border-b border-slate-800/80 flex items-center justify-between">
              <span className="text-xs font-mono text-cyan-400 truncate">{selectedFile}</span>
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy File'}
              </button>
            </div>

            {/* Code Content */}
            <div className="flex-1 overflow-auto p-4">
              <pre className="text-xs font-mono text-slate-300 leading-relaxed whitespace-pre font-normal selection:bg-cyan-500 selection:text-black">
                {currentContent}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-2.5 bg-[#060D1A] border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between px-4">
          <span>Target: Android 16 (API 36) • Min SDK 26 • Jetpack Compose • Material 3</span>
          <span className="text-cyan-400 font-medium">DEVELOPER: ANUP CHAND</span>
        </div>
      </div>
    </div>
  );
};
