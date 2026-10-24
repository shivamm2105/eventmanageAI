import React, { useState, useMemo } from 'react';
import {
  Calculator,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  Info,
} from 'lucide-react';
import {
  BudgetItem,
  calculateBudgetSummary,
  formatCurrency,
} from '@celebrai/shared';

interface TabBudgetProps {
  totalBudget: number;
  currency: string;
  items: BudgetItem[];
  onUpdateItems: (items: BudgetItem[]) => void;
}

export const TabBudget: React.FC<TabBudgetProps> = ({
  totalBudget,
  currency,
  items,
  onUpdateItems,
}) => {
  const [contingencyPercent, setContingencyPercent] = useState<number>(10);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newCategory, setNewCategory] = useState<string>('');
  const [newEstimate, setNewEstimate] = useState<number>(0);
  const [newNotes, setNewNotes] = useState<string>('');

  // Dynamically calculate summary using the integer-based engine
  const summary = useMemo(() => {
    return calculateBudgetSummary(totalBudget, items, contingencyPercent);
  }, [totalBudget, items, contingencyPercent]);

  React.useEffect(() => {
    if (!showAddModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAddModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAddModal]);

  const handleUpdateItem = (
    id: string,
    field: 'estimatedAmount' | 'actualAmount' | 'notes',
    value: any
  ) => {
    const updated = items.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          [field]: field === 'notes' ? String(value) : Math.max(0, Number(value) || 0),
        };
      }
      return item;
    });
    onUpdateItems(updated);
  };

  const handleDeleteItem = (id: string) => {
    onUpdateItems(items.filter((item) => item.id !== id));
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    const newItem: BudgetItem = {
      id: `custom-budget-${Date.now()}`,
      category: newCategory.trim(),
      estimatedAmount: Math.max(0, newEstimate),
      actualAmount: 0,
      notes: newNotes.trim(),
      isCustom: true,
    };

    onUpdateItems([...items, newItem]);
    setNewCategory('');
    setNewEstimate(0);
    setNewNotes('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Overspending Warning Banner */}
      {summary.isOverBudget && (
        <div
          className="p-4 rounded-2xl bg-rose-950/80 border border-rose-600/80 text-rose-200 flex items-start gap-3 shadow-lg"
          role="alert"
        >
          <AlertTriangle className="w-5 h-5 text-rose-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <h4 className="font-bold text-white">
              Budget Overspend Warning: Exceeded by {formatCurrency(summary.overspendAmount, currency)}
            </h4>
            <p className="mt-0.5 text-xs text-rose-300">
              Your committed expenditures ({formatCurrency(summary.totalBudget + summary.overspendAmount, currency)}) exceed
              your target event budget of {formatCurrency(summary.totalBudget, currency)}. Consider negotiating
              rates or reducing non-essential allocations.
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Budget */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Target Budget</span>
          <div className="text-lg sm:text-xl font-bold font-mono text-white truncate">
            {formatCurrency(summary.totalBudget, currency)}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Approved ceiling</span>
        </div>

        {/* AI Estimated Total */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 block mb-1">AI Estimated</span>
          <div className="text-lg sm:text-xl font-bold font-mono text-indigo-300 truncate">
            {formatCurrency(summary.totalEstimated, currency)}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Sum of initial quotas</span>
        </div>

        {/* Confirmed Actual Total */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Confirmed Actuals</span>
          <div className="text-lg sm:text-xl font-bold font-mono text-emerald-300 truncate">
            {formatCurrency(summary.totalActual, currency)}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">User-booked amounts</span>
        </div>

        {/* Remaining Balance */}
        <div
          className={`p-4 rounded-2xl border ${
            summary.isOverBudget
              ? 'bg-rose-950/40 border-rose-800/60'
              : 'bg-emerald-950/30 border-emerald-800/60'
          }`}
        >
          <span className="text-xs font-semibold text-slate-400 block mb-1">Remaining Balance</span>
          <div
            className={`text-lg sm:text-xl font-bold font-mono truncate ${
              summary.isOverBudget ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {formatCurrency(summary.remainingBudget, currency)}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            {summary.isOverBudget ? 'Deficit' : 'Available buffer'}
          </span>
        </div>

        {/* Contingency Buffer */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-400">Contingency</span>
            <select
              value={contingencyPercent}
              onChange={(e) => setContingencyPercent(Number(e.target.value))}
              className="bg-slate-950 border border-slate-700 text-amber-300 font-semibold text-[10px] rounded px-1.5 py-0.5 focus:outline-none"
              aria-label="Contingency buffer percentage"
            >
              <option value={5}>5% Buffer</option>
              <option value={10}>10% Buffer</option>
              <option value={15}>15% Buffer</option>
              <option value={20}>20% Buffer</option>
            </select>
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-amber-300 truncate">
            {formatCurrency(summary.contingencyAmount, currency)}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Emergency fund buffer</span>
        </div>
      </div>

      {/* Utilization Progress Bar */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center justify-between text-xs font-semibold mb-2">
          <span className="text-slate-300">Budget Allocation Utilization</span>
          <span
            className={`font-mono font-bold ${
              summary.utilizationPercent > 100 ? 'text-rose-400' : 'text-brand-300'
            }`}
          >
            {summary.utilizationPercent}% Allocated
          </span>
        </div>
        <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
          <div
            className={`h-2.5 rounded-full transition-all duration-300 ${
              summary.utilizationPercent > 100
                ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                : 'bg-gradient-to-r from-brand-500 to-emerald-500'
            }`}
            style={{ width: `${Math.min(100, summary.utilizationPercent)}%` }}
          />
        </div>
      </div>

      {/* Categories Table Header & Actions */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-display text-lg font-bold text-white">Category Allocations</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Edit any estimate or confirmed actual amount. All recalculations are integer-exact.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {items.some((i) => i.actualAmount > 0) && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Reset all confirmed actual amounts back to 0?')) {
                    onUpdateItems(items.map((i) => ({ ...i, actualAmount: 0 })));
                  }
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              >
                Reset Actuals
              </button>
            )}

            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Expense</span>
            </button>
          </div>
        </div>

        {/* Budget Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Notes & Scope</th>
                <th className="py-3 px-3 text-right">AI Proposed</th>
                <th className="py-3 px-3 text-right">User Confirmed Actual</th>
                <th className="py-3 px-3 text-right">Status</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {items.map((item) => {
                const isConfirmed = (item.actualAmount || 0) > 0;
                return (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3 font-medium text-white">
                      <div className="flex items-center gap-1.5">
                        <span>{item.category}</span>
                        {item.isCustom && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400">
                            Custom
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <input
                        type="text"
                        value={item.notes || ''}
                        onChange={(e) => handleUpdateItem(item.id, 'notes', e.target.value)}
                        placeholder="Add notes..."
                        aria-label={`Notes for ${item.category}`}
                        className="w-full px-2 py-1 rounded bg-slate-950/80 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-brand-500"
                      />
                    </td>

                    <td className="py-3 px-3 text-right">
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={item.estimatedAmount}
                        onChange={(e) =>
                          handleUpdateItem(item.id, 'estimatedAmount', e.target.value)
                        }
                        aria-label={`AI proposed estimate for ${item.category}`}
                        className="w-28 text-right font-mono px-2 py-1 rounded bg-slate-950/80 border border-slate-800 text-slate-300 focus:outline-none focus:border-brand-500"
                      />
                    </td>

                    <td className="py-3 px-3 text-right">
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={item.actualAmount}
                        onChange={(e) =>
                          handleUpdateItem(item.id, 'actualAmount', e.target.value)
                        }
                        placeholder="0"
                        aria-label={`User confirmed actual spent for ${item.category}`}
                        className={`w-28 text-right font-mono font-semibold px-2 py-1 rounded border text-xs focus:outline-none ${
                          isConfirmed
                            ? 'bg-emerald-950/40 border-emerald-700 text-emerald-300 focus:border-emerald-500'
                            : 'bg-slate-950/80 border-slate-800 text-slate-400 focus:border-brand-500'
                        }`}
                      />
                    </td>

                    <td className="py-3 px-3 text-right">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          isConfirmed
                            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                            : 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                        }`}
                      >
                        {isConfirmed ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>Confirmed</span>
                          </>
                        ) : (
                          <>
                            <Info className="w-3 h-3 text-indigo-400" />
                            <span>AI Estimate</span>
                          </>
                        )}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                        title="Remove expense category"
                        aria-label={`Remove ${item.category}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Custom Item Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Add Custom Expense"
        >
          <div className="w-full max-w-md p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">Add Custom Expense Category</h3>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="e.g., Security, Fireworks, Fireworks Permit, Valet"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Estimated Amount ({currency})
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={newEstimate}
                  onChange={(e) => setNewEstimate(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Notes / Specification
                </label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g., 2 dedicated guards from 6 PM to 12 AM"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow-glow"
                >
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
