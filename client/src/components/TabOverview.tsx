import React from 'react';
import {
  Sparkles,
  Palette,
  AlertTriangle,
  CheckCircle2,
  ListChecks,
  ShieldAlert,
  Copy,
  Check,
} from 'lucide-react';
import { GeneratedPlan, EventRequirements } from '@celebrai/shared';

interface TabOverviewProps {
  plan: GeneratedPlan;
  requirements: EventRequirements;
}

export const TabOverview: React.FC<TabOverviewProps> = ({ plan, requirements }) => {
  const [copiedColor, setCopiedColor] = React.useState<string | null>(null);

  const copyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Executive Summary Card */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="font-display text-lg font-bold text-white">Executive Plan Summary</h3>
        </div>
        <p className="text-slate-300 text-sm leading-relaxed">{plan.summary}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommended Theme & Aesthetics */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Palette className="w-4 h-4" />
              </div>
              <h3 className="font-display text-lg font-bold text-white">Thematic Palette & Aesthetic</h3>
            </div>

            <div className="mb-4">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                Theme Concept
              </span>
              <h4 className="text-base font-bold text-brand-300 mt-0.5">
                {plan.recommendedTheme.name}
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {plan.recommendedTheme.vibeDescription}
              </p>
            </div>

            {/* Color Palette Swatches */}
            <div className="mb-5">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block mb-2">
                Harmonized Color Palette (Click to Copy Hex)
              </span>
              <div className="flex flex-wrap gap-2.5">
                {plan.recommendedTheme.colorPalette.map((color, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => copyHex(color)}
                    className="group flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors text-xs font-mono"
                    title={`Copy ${color}`}
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-slate-300 group-hover:text-white">{color}</span>
                    {copiedColor === color ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3 text-slate-500 group-hover:text-slate-300" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Decor Concepts */}
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block mb-2">
                Key Decor Elements
              </span>
              <ul className="space-y-2">
                {plan.recommendedTheme.decorConcepts.map((decor, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-1.5 flex-shrink-0" />
                    <span>{decor}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Planning Assumptions */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ListChecks className="w-4 h-4" />
              </div>
              <h3 className="font-display text-lg font-bold text-white">Planning Assumptions</h3>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Baseline parameters used by CelebrAI to construct timeline deadlines and vendor quotas.
            </p>

            <div className="space-y-2.5">
              {plan.planningAssumptions.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-200"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Location: <strong className="text-white">{requirements.city}</strong></span>
            <span>Guests: <strong className="text-white">{requirements.guestCount}</strong></span>
            <span>Setting: <strong className="text-white capitalize">{requirements.venuePreference}</strong></span>
          </div>
        </div>
      </div>

      {/* Risk and Contingency Mitigations */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-white">
              Event Risks & Contingency Safeguards
            </h3>
            <p className="text-xs text-slate-400">
              Proactive strategies to protect budget, guest comfort, and schedule integrity.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plan.riskAndContingencies.map((riskItem, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      riskItem.severity === 'high'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : riskItem.severity === 'medium'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}
                  >
                    {riskItem.severity} Risk
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-white mb-2 leading-snug">
                  {riskItem.risk}
                </h4>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg">
                <span className="font-semibold text-brand-300 block mb-0.5">Mitigation Plan:</span>
                {riskItem.mitigation}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
