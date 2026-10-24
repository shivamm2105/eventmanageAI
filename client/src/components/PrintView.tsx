import React from 'react';
import { Printer, Download, Sparkles, CheckCircle2 } from 'lucide-react';
import {
  EventRecord,
  formatCurrency,
  calculateBudgetSummary,
  calculateTimelineSummary,
} from '@celebrai/shared';

interface PrintViewProps {
  event: EventRecord;
  onExportJson: () => void;
}

export const PrintView: React.FC<PrintViewProps> = ({ event, onExportJson }) => {
  const { requirements, plan } = event;
  const budgetSummary = calculateBudgetSummary(
    requirements.budget,
    plan.budgetItems,
    plan.contingencyReserve.percentage
  );
  const timelineSummary = calculateTimelineSummary(plan.timeline);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Print Action Controls (Hidden when printing) */}
      <div className="no-print p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-white text-sm">Printable Celebration Blueprint</h3>
          <p className="text-xs text-slate-400">
            Export as PDF or print on paper. This clean view removes app buttons and optimizes margins.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onExportJson}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download JSON</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white flex items-center gap-1.5 shadow-glow transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print or Save to PDF</span>
          </button>
        </div>
      </div>

      {/* The Printable Document */}
      <div className="print-container bg-white text-slate-900 p-8 sm:p-12 rounded-2xl shadow-xl max-w-4xl mx-auto font-sans">
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-widest font-bold text-slate-600">
                CelebrAI Master Plan Document
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 mt-1">
                {requirements.title}
              </h1>
            </div>
            <div className="text-right text-xs text-slate-600">
              <span className="font-bold text-slate-900 block uppercase">
                {requirements.eventType} Celebration
              </span>
              <span>Generated on: {new Date(plan.generatedAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-4 border-t border-slate-200">
            <div>
              <span className="text-slate-500 block">Date</span>
              <strong className="text-slate-900 text-sm font-semibold">
                {requirements.eventDate}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block">Location</span>
              <strong className="text-slate-900 text-sm font-semibold">
                {requirements.city}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block">Guest Count</span>
              <strong className="text-slate-900 text-sm font-semibold">
                {requirements.guestCount} Guests
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block">Total Budget</span>
              <strong className="text-slate-900 text-sm font-semibold font-mono">
                {formatCurrency(requirements.budget, requirements.currency)}
              </strong>
            </div>
          </div>
        </div>

        {/* Executive Summary & Theme */}
        <div className="mb-8 space-y-4 print-break-inside-avoid">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-1">
              Executive Summary
            </h2>
            <p className="text-xs text-slate-700 leading-relaxed">{plan.summary}</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Theme & Aesthetic Concept: {plan.recommendedTheme.name}
            </h3>
            <p className="text-xs text-slate-600 mb-2">{plan.recommendedTheme.vibeDescription}</p>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-semibold">Color Palette:</span>
              {plan.recommendedTheme.colorPalette.map((color, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded font-mono text-[10px] border border-slate-300"
                  style={{ backgroundColor: color, color: '#fff' }}
                >
                  {color}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Budget Breakdown Table */}
        <div className="mb-8 print-break-inside-avoid">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Budget & Expense Breakdown
            </h2>
            <span className="text-xs font-mono text-slate-600">
              Committed: {formatCurrency(budgetSummary.totalEstimated, requirements.currency)} /{' '}
              {formatCurrency(requirements.budget, requirements.currency)}
            </span>
          </div>

          <table className="w-full text-left text-xs border border-slate-200 divide-y divide-slate-200">
            <thead className="bg-slate-100 font-semibold text-slate-700">
              <tr>
                <th className="p-2 border-r border-slate-200">Category</th>
                <th className="p-2 border-r border-slate-200">Scope / Notes</th>
                <th className="p-2 text-right border-r border-slate-200">Proposed Estimate</th>
                <th className="p-2 text-right">Confirmed Actual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {plan.budgetItems.map((item) => (
                <tr key={item.id}>
                  <td className="p-2 font-medium border-r border-slate-200">{item.category}</td>
                  <td className="p-2 border-r border-slate-200 text-slate-600">{item.notes || '-'}</td>
                  <td className="p-2 text-right font-mono border-r border-slate-200">
                    {formatCurrency(item.estimatedAmount, requirements.currency)}
                  </td>
                  <td className="p-2 text-right font-mono font-semibold">
                    {item.actualAmount > 0
                      ? formatCurrency(item.actualAmount, requirements.currency)
                      : 'Pending'}
                  </td>
                </tr>
              ))}
              <tr className="bg-slate-50 font-bold">
                <td colSpan={2} className="p-2 border-r border-slate-200">
                  Contingency Buffer ({plan.contingencyReserve.percentage}%)
                </td>
                <td colSpan={2} className="p-2 text-right font-mono">
                  {formatCurrency(budgetSummary.contingencyAmount, requirements.currency)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Milestone Timeline Checklist */}
        <div className="mb-8 print-break-inside-avoid">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Milestone Checklist & Deadlines
            </h2>
            <span className="text-xs font-mono text-slate-600">
              {timelineSummary.completedTasks} of {timelineSummary.totalTasks} Done (
              {timelineSummary.completionPercentage}%)
            </span>
          </div>

          <div className="space-y-1.5 border border-slate-200 rounded-xl p-3">
            {plan.timeline.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-b-0"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[10px] ${
                      task.completed
                        ? 'bg-slate-900 border-slate-900 text-white'
                        : 'border-slate-400'
                    }`}
                  >
                    {task.completed && '✓'}
                  </span>
                  <span className={task.completed ? 'line-through text-slate-400' : 'text-slate-800'}>
                    {task.title}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">({task.category})</span>
                </div>
                <span className="font-mono text-slate-600 text-[11px]">{task.dueDate}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Vendor Coordination Directory */}
        <div className="mb-8 print-break-inside-avoid">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-2">
            Vendor Directory & Negotiation Log
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {plan.vendorCategories.map((vendor) => (
              <div
                key={vendor.id}
                className="p-3 border border-slate-200 rounded-xl bg-slate-50 text-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <strong className="text-slate-900">{vendor.category}</strong>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-white border border-slate-300">
                    {vendor.status}
                  </span>
                </div>
                <div className="text-slate-600 text-[11px] space-y-0.5">
                  <p>Vendor: {vendor.vendorName || 'Not specified'}</p>
                  <p>Contact: {vendor.contactPerson || '-'} {vendor.phone ? `(${vendor.phone})` : ''}</p>
                  <p className="font-mono">
                    Budget: {formatCurrency(vendor.estimatedBudget, requirements.currency)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Document Footer */}
        <div className="pt-6 border-t border-slate-200 text-center text-[11px] text-slate-500">
          <p>CelebrAI — Intelligent Celebration & Event Planner | PromptWars Challenge 5 Submission</p>
          <p className="mt-0.5 font-mono text-[10px]">
            Plan ID: {event.id} • Model: {plan.modelUsed} • {plan.isDemoPlan ? 'Sample Plan' : 'AI-Verified'}
          </p>
        </div>
      </div>
    </div>
  );
};
