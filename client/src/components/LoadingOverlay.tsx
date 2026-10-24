import React, { useEffect, useState } from 'react';
import { Sparkles, Loader2, X } from 'lucide-react';

interface LoadingOverlayProps {
  onCancel?: () => void;
  isDemoMode?: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ onCancel, isDemoMode }) => {
  const steps = [
    'Analyzing event requirements and constraints...',
    'Synthesizing theme aesthetic and color harmonies...',
    'Allocating integer budgets and 10% contingency...',
    'Generating milestone timeline relative to event date...',
    'Formulating tailored vendor questions and risks...',
    'Finalizing comprehensive celebration blueprint...',
  ];

  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1800);

    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Generating Event Plan"
    >
      <div className="w-full max-w-md p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl text-center relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-brand-600/20 rounded-full blur-2xl pointer-events-none" />

        {/* Cancel button if available */}
        {onCancel && (
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Cancel Generation"
            aria-label="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-tr from-brand-700 to-violet-500 flex items-center justify-center shadow-glow animate-pulse">
          <Sparkles className="w-8 h-8 text-white" />
        </div>

        <h3 className="font-display text-xl font-bold text-white tracking-tight">
          Crafting Your Celebration Blueprint
        </h3>

        <p className="mt-2 text-xs font-medium text-brand-300">
          {isDemoMode ? 'Assembling Interactive Demo Plan' : 'Google Gemini 2.5 Flash Reasoning Engine'}
        </p>

        {/* Progress status announcement */}
        <div className="mt-6 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80" aria-live="polite">
          <div className="flex items-center justify-center gap-2 text-sm text-slate-300 font-medium">
            <Loader2 className="w-4 h-4 animate-spin text-brand-400" />
            <span>{steps[currentStepIndex]}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-brand-500 to-indigo-500 h-1.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.min(100, ((currentStepIndex + 1) / steps.length) * 100)}%` }}
          />
        </div>

        <p className="mt-4 text-xs text-slate-500">
          Validating against strict Zod schemas and integer budget boundaries.
        </p>
      </div>
    </div>
  );
};
