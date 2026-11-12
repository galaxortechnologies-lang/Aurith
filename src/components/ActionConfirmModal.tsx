import React from 'react';
import { AlertTriangle, X, ShieldAlert, Check } from 'lucide-react';

interface ActionConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  targetItem?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ActionConfirmModal: React.FC<ActionConfirmModalProps> = ({
  isOpen,
  title,
  description,
  targetItem,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-[#0B1528] border border-red-500/40 rounded-2xl p-5 shadow-[0_0_40px_rgba(239,68,68,0.25)] text-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-red-400">
            <ShieldAlert className="w-5 h-5 text-red-400 animate-pulse" />
            <h3 className="font-semibold text-sm tracking-wide uppercase">Safety Confirmation</h3>
          </div>
          <button
            onClick={onCancel}
            className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <h4 className="text-base font-bold text-slate-100">{title}</h4>
          <p className="text-xs text-slate-300 leading-relaxed">{description}</p>

          {targetItem && (
            <div className="p-2.5 bg-red-950/40 border border-red-800/40 rounded-lg">
              <span className="text-[11px] font-mono text-red-200 break-all">{targetItem}</span>
            </div>
          )}

          <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-300/90 leading-tight">
              AURITH enforces native Android action safety. High-risk operations cannot run without explicit user consent.
            </p>
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            Reject / Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 text-xs font-semibold rounded-xl bg-red-600 hover:bg-red-500 text-white flex items-center justify-center gap-1.5 shadow-lg shadow-red-950 transition"
          >
            <Check className="w-3.5 h-3.5" />
            Authorize Action
          </button>
        </div>
      </div>
    </div>
  );
};
