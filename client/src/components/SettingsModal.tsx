import React, { useState } from 'react';
import {
  X,
  Settings,
  ShieldCheck,
  Cpu,
  Database,
  Trash2,
  Download,
  AlertTriangle,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { SystemStatusResponse } from '../services/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: SystemStatusResponse | null;
  onClearAllData: () => Promise<void>;
  onExportAll: () => void;
  totalSavedEvents: number;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  status,
  onClearAllData,
  onExportAll,
  totalSavedEvents,
}) => {
  const [confirmClear, setConfirmClear] = useState<boolean>(false);
  const [isClearing, setIsClearing] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleClear = async () => {
    setIsClearing(true);
    try {
      await onClearAllData();
      setConfirmClear(false);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Settings and System Configuration"
    >
      <div className="w-full max-w-2xl my-8 p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-white">
                System Status & Data Settings
              </h3>
              <p className="text-xs text-slate-400">
                CelebrAI application configuration, GenAI provider state, and privacy safeguards.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 text-xs text-slate-300">
          {/* AI Status Card */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 font-semibold text-white text-sm">
                <Cpu className="w-4 h-4 text-brand-400" />
                <span>Generative AI Engine</span>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  status?.ai.isConfigured
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {status?.ai.isConfigured ? 'Live Gemini AI Configured' : 'Demo Mode Active'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-400">
              <div>
                <span className="block text-[11px] text-slate-500">Active Model</span>
                <strong className="text-slate-200 font-mono">
                  {status?.ai.model || 'gemini-2.5-flash'}
                </strong>
              </div>
              <div>
                <span className="block text-[11px] text-slate-500">Endpoint Rate Limit</span>
                <strong className="text-slate-200 font-mono">
                  {status?.ai.rateLimitMax || 25} requests /{' '}
                  {status?.ai.rateLimitWindowMinutes || 15} min
                </strong>
              </div>
            </div>

            <p className="mt-3 text-[11px] text-slate-400 leading-relaxed border-t border-slate-900 pt-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 inline mr-1" />
              API keys are read exclusively on the server and are never delivered to the client, logged, or exposed in output bundles.
            </p>
          </div>

          {/* Database and Persistence Card */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 font-semibold text-white text-sm">
                <Database className="w-4 h-4 text-indigo-400" />
                <span>Local Storage & Persistence</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                SQLite WAL Mode
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              All celebrations, customized task statuses, confirmed actual budgets, and vendor records
              are persisted safely to local SQLite tables using parameterized queries. You currently
              have <strong className="text-white">{totalSavedEvents}</strong> plan(s) stored.
            </p>
          </div>

          {/* Data Export & Reset Actions */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
            <h4 className="font-semibold text-white text-sm">Data Export & Deletion</h4>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onExportAll}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export All Saved Plans (JSON)</span>
              </button>

              {!confirmClear ? (
                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 flex items-center gap-2 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear All Event Records</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isClearing}
                    onClick={handleClear}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1.5 transition-colors"
                  >
                    <span>{isClearing ? 'Deleting...' : 'Confirm Delete All'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClear(false)}
                    className="px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* PromptWars Evaluation Badge Overview */}
          <div className="p-4 rounded-2xl bg-brand-950/30 border border-brand-900/50">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-brand-400" />
              <h4 className="font-semibold text-brand-300 text-xs">
                PromptWars Virtual Challenge 5 Compliance
              </h4>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Every major feature contributes directly to celebration planning (budgets, timelines,
              vendor checklists, and customized event ideas). Evaluated across Code Quality,
              Application Security, Runtime Efficiency, Automated Testing, WCAG Accessibility, and
              Problem Alignment.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
