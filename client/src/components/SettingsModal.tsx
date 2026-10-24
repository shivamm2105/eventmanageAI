import React, { useState } from 'react';
import {
  X,
  Settings,
  ShieldCheck,
  Cpu,
  Database,
  Trash2,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Key,
  ExternalLink,
  Eye,
  EyeOff,
  Sparkles,
  Loader2,
} from 'lucide-react';
import {
  SystemStatusResponse,
  configureAiApiKey,
  disconnectAi,
  fetchSystemStatus,
} from '../services/api';
import { EventRecord } from '@celebrai/shared';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: SystemStatusResponse | null;
  onClearAllData: () => Promise<void>;
  onExportAll: () => void;
  onImportPlan?: (event: EventRecord | EventRecord[]) => void;
  onStatusUpdated?: (newStatus: SystemStatusResponse) => void;
  showToast: (msg: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
  totalSavedEvents: number;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  status,
  onClearAllData,
  onExportAll,
  onImportPlan,
  onStatusUpdated,
  showToast,
  totalSavedEvents,
}) => {
  const [confirmClear, setConfirmClear] = useState<boolean>(false);
  const [isClearing, setIsClearing] = useState<boolean>(false);

  // Gemini API Key config state
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>(
    status?.ai.model || 'gemini-2.5-flash'
  );
  const [showKey, setShowKey] = useState<boolean>(false);
  const [isTestingKey, setIsTestingKey] = useState<boolean>(false);
  const [keyError, setKeyError] = useState<string | null>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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

  const handleConnectKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) return;

    setIsTestingKey(true);
    setKeyError(null);

    try {
      const res = await configureAiApiKey(apiKeyInput.trim(), selectedModel);
      showToast(res.message, 'success');

      if (onStatusUpdated) {
        if (status) {
          onStatusUpdated({
            ...status,
            ai: {
              ...status.ai,
              isConfigured: true,
              model: res.model,
            },
          });
        } else {
          fetchSystemStatus().then(onStatusUpdated).catch(() => {});
        }
      }
      setApiKeyInput('');
    } catch (err: any) {
      setKeyError(err.message || 'Verification failed. Please check your Gemini API key.');
      showToast(err.message || 'Failed to verify key.', 'error');
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectAi();
      showToast('Switched back to interactive Demo Mode.', 'info');
      if (onStatusUpdated && status) {
        onStatusUpdated({
          ...status,
          ai: {
            ...status.ai,
            isConfigured: false,
          },
        });
      }
    } catch (err: any) {
      showToast('Failed to disconnect AI.', 'error');
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.requirements && parsed.plan && onImportPlan) {
          onImportPlan(parsed);
          showToast(`Imported "${parsed.requirements.title}" successfully.`, 'success');
          onClose();
        } else if (parsed.events && Array.isArray(parsed.events) && onImportPlan) {
          onImportPlan(parsed.events as any);
          onClose();
        } else {
          showToast('Invalid event plan JSON file format.', 'error');
        }
      } catch (err) {
        showToast('Failed to parse JSON file.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Settings and System Configuration"
    >
      <div className="w-full max-w-2xl my-8 p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-white">
                System Status & Configuration
              </h3>
              <p className="text-xs text-slate-400">
                Manage your real Gemini AI connection, storage, backups, and privacy.
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
          {/* AI Connection Card */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-white text-sm">
                <Cpu className="w-4 h-4 text-brand-400" />
                <span>Google Gemini AI Integration</span>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  status?.ai.isConfigured
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {status?.ai.isConfigured ? 'Live Gemini AI Active' : 'Demo Mode Active'}
              </span>
            </div>

            {status?.ai.isConfigured ? (
              <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-emerald-300 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <div>
                    <span className="font-semibold block text-white text-xs">
                      Live Gemini Generation Active ({status.ai.model})
                    </span>
                    <span className="text-[11px] text-emerald-400">
                      Plans are synthesized in real-time by Google AI Studio.
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                >
                  Switch to Demo Mode
                </button>
              </div>
            ) : (
              <form onSubmit={handleConnectKey} className="space-y-3">
                <p className="text-slate-400 text-xs">
                  Connect your Google Gemini API key to enable live generative AI planning. Get a free key from{' '}
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-400 underline inline-flex items-center gap-0.5 hover:text-brand-300"
                  >
                    Google AI Studio <ExternalLink className="w-3 h-3" />
                  </a>.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2 relative">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      placeholder="Paste your GEMINI_API_KEY here..."
                      className="w-full px-3 py-2 pr-10 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                      tabIndex={-1}
                    >
                      {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div>
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                    >
                      <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                      <option value="gemini-1.5-flash">gemini-1.5-flash</option>
                      <option value="gemini-2.0-flash">gemini-2.0-flash</option>
                    </select>
                  </div>
                </div>

                {keyError && (
                  <p className="text-xs text-rose-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {keyError}
                  </p>
                )}

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500">
                    <ShieldCheck className="w-3 h-3 text-emerald-400 inline mr-1" />
                    Key is tested live with Google and saved only to local gitignored .env.
                  </span>
                  <button
                    type="submit"
                    disabled={isTestingKey || !apiKeyInput.trim()}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white shadow-glow flex items-center gap-1.5 transition-all"
                  >
                    {isTestingKey ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying with Google...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Connect & Verify</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Database and Persistence Card */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 font-semibold text-white text-sm">
                <Database className="w-4 h-4 text-indigo-400" />
                <span>Embedded SQLite Database</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                WAL Mode Enabled
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Celebration plans, customized task statuses, actual expenditures, and vendor notes are persisted to SQLite via parameterized queries. Currently storing <strong className="text-white">{totalSavedEvents}</strong> plan(s).
            </p>
          </div>

          {/* Data Export, Import & Reset */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
            <h4 className="font-semibold text-white text-sm">Backup, Import & Reset</h4>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onExportAll}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export Backup (JSON)</span>
              </button>

              <label className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition-colors cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Import Plan (.json)</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileImport}
                  className="hidden"
                />
              </label>

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
