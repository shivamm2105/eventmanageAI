import React, { useState } from 'react';
import {
  Users,
  Building,
  Utensils,
  Camera,
  Music,
  Cake,
  Truck,
  Sparkles,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Phone,
  Mail,
  User,
  CheckCircle2,
  AlertCircle,
  FileText,
  Plus,
  Trash2,
  Copy,
  Check,
} from 'lucide-react';
import {
  VendorCategoryPlanning,
  VendorStatus,
  formatCurrency,
} from '@celebrai/shared';

interface TabVendorsProps {
  categories: VendorCategoryPlanning[];
  currency: string;
  onUpdateCategories: (categories: VendorCategoryPlanning[]) => void;
}

export const TabVendors: React.FC<TabVendorsProps> = ({
  categories,
  currency,
  onUpdateCategories,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(
    categories[0]?.id || null
  );

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [newEstimatedBudget, setNewEstimatedBudget] = useState<number>(0);
  const [newNotes, setNewNotes] = useState<string>('');

  const statusOptions: { value: VendorStatus; label: string; badgeClass: string }[] = [
    {
      value: 'research',
      label: 'Researching',
      badgeClass: 'bg-slate-800 text-slate-300 border-slate-700',
    },
    {
      value: 'shortlisted',
      label: 'Shortlisted',
      badgeClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    },
    {
      value: 'contacted',
      label: 'Contacted',
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    },
    {
      value: 'booked',
      label: 'Booked / Confirmed',
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    },
  ];

  const handleUpdate = (
    id: string,
    field: keyof VendorCategoryPlanning,
    value: any
  ) => {
    const updated = categories.map((cat) => {
      if (cat.id === id) {
        return {
          ...cat,
          [field]: field === 'estimatedBudget' || field === 'actualCost'
            ? Math.max(0, Number(value) || 0)
            : value,
        };
      }
      return cat;
    });
    onUpdateCategories(updated);
  };

  const handleDeleteCategory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Remove this vendor category?')) {
      onUpdateCategories(categories.filter((cat) => cat.id !== id));
    }
  };

  const handleCopyQuestions = (item: VendorCategoryPlanning, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `Questions for ${item.category} Vendor:\n` +
      item.questionsToAsk.map((q, idx) => `${idx + 1}. ${q}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    const newVendor: VendorCategoryPlanning = {
      id: `vendor-custom-${Date.now()}`,
      category: newCategoryName.trim(),
      status: 'research',
      vendorName: '',
      contactPerson: '',
      phone: '',
      email: '',
      estimatedBudget: Math.max(0, newEstimatedBudget),
      actualCost: 0,
      notes: newNotes.trim(),
      questionsToAsk: [
        'What is your payment schedule and cancellation policy?',
        'Are there any additional service taxes or overtime fees?',
        'Do you provide insurance and what is your backup contingency protocol?',
      ],
    };

    onUpdateCategories([...categories, newVendor]);
    setNewCategoryName('');
    setNewEstimatedBudget(0);
    setNewNotes('');
    setShowAddModal(false);
  };

  const getCategoryIcon = (category: string) => {
    const lower = category.toLowerCase();
    if (lower.includes('venue')) return Building;
    if (lower.includes('cater') || lower.includes('food')) return Utensils;
    if (lower.includes('photo') || lower.includes('video')) return Camera;
    if (lower.includes('music') || lower.includes('entertain')) return Music;
    if (lower.includes('cake') || lower.includes('dessert')) return Cake;
    if (lower.includes('transport') || lower.includes('logistics')) return Truck;
    return Sparkles;
  };

  return (
    <div className="space-y-6">
      {/* Notice Banner */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-brand-400 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-white block font-semibold mb-0.5">
            Vendor Directory & Negotiation Guide
          </strong>
          These cards are your private planning records and curated negotiation checklists. CelebrAI
          does not fabricate fake reviews or claim vendors are booked. Fill in your shortlisted
          vendors and use the questions below during vendor calls.
        </div>
      </div>

      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-bold text-white">Vendor Categories</h3>
          <p className="text-xs text-slate-400">
            {categories.length} vendor categorie(s) planned
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Vendor Category</span>
        </button>
      </div>

      {/* Vendor Category Cards */}
      <div className="space-y-4">
        {categories.map((item) => {
          const Icon = getCategoryIcon(item.category);
          const isExpanded = expandedId === item.id;
          const statusMeta =
            statusOptions.find((s) => s.value === item.status) || statusOptions[0];

          return (
            <div
              key={item.id}
              className={`rounded-2xl border transition-all ${
                isExpanded
                  ? 'bg-slate-900/80 border-slate-700 shadow-xl'
                  : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700/80'
              }`}
            >
              {/* Header Accordion Bar */}
              <div
                className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none"
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 flex-shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-white text-sm sm:text-base truncate">
                        {item.category}
                      </h4>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusMeta.badgeClass}`}
                      >
                        {statusMeta.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">
                      {item.vendorName
                        ? `${item.vendorName} • Budget: ${formatCurrency(
                            item.estimatedBudget,
                            currency
                          )}`
                        : `Target Budget: ${formatCurrency(item.estimatedBudget, currency)}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={(e) => handleCopyQuestions(item, e)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 text-xs hidden sm:flex items-center gap-1 transition-colors"
                    title="Copy questions to clipboard"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedId === item.id ? 'Copied' : 'Questions'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleDeleteCategory(item.id, e)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition-colors"
                    title="Delete category"
                    aria-label={`Delete ${item.category}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="p-1 text-slate-400">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Card Content */}
              {isExpanded && (
                <div className="px-4 pb-6 sm:px-6 pt-2 border-t border-slate-800/80 space-y-5">
                  {/* Status and Financial Controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Planning Status
                      </label>
                      <select
                        value={item.status}
                        onChange={(e) =>
                          handleUpdate(item.id, 'status', e.target.value as VendorStatus)
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                      >
                        {statusOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Allocated Budget ({currency})
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="500"
                        value={item.estimatedBudget}
                        onChange={(e) =>
                          handleUpdate(item.id, 'estimatedBudget', e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Confirmed Cost ({currency})
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="500"
                        value={item.actualCost}
                        onChange={(e) =>
                          handleUpdate(item.id, 'actualCost', e.target.value)
                        }
                        placeholder="0"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Vendor Contact Record */}
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-3">
                    <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">
                      Vendor Contact Record (User Entered)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                          <Building className="w-3.5 h-3.5" />
                          <span>Business / Agency Name</span>
                        </div>
                        <input
                          type="text"
                          value={item.vendorName || ''}
                          onChange={(e) => handleUpdate(item.id, 'vendorName', e.target.value)}
                          placeholder="e.g., Royal Marigold Florals"
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
                        />
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                          <User className="w-3.5 h-3.5" />
                          <span>Contact Person</span>
                        </div>
                        <input
                          type="text"
                          value={item.contactPerson || ''}
                          onChange={(e) =>
                            handleUpdate(item.id, 'contactPerson', e.target.value)
                          }
                          placeholder="e.g., Suresh Verma (Lead Coordinator)"
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
                        />
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                          <Phone className="w-3.5 h-3.5" />
                          <span>Phone Number</span>
                        </div>
                        <input
                          type="tel"
                          value={item.phone || ''}
                          onChange={(e) => handleUpdate(item.id, 'phone', e.target.value)}
                          placeholder="e.g., +91 98765 43210"
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-brand-500"
                        />
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                          <Mail className="w-3.5 h-3.5" />
                          <span>Email Address</span>
                        </div>
                        <input
                          type="email"
                          value={item.email || ''}
                          onChange={(e) => handleUpdate(item.id, 'email', e.target.value)}
                          placeholder="e.g., contact@royalmarigold.example"
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                        <FileText className="w-3.5 h-3.5" />
                        <span>Private Notes / Negotiation Terms</span>
                      </div>
                      <input
                        type="text"
                        value={item.notes || ''}
                        onChange={(e) => handleUpdate(item.id, 'notes', e.target.value)}
                        placeholder="e.g., Demanded 25% advance; promised 2 extra live stations at no extra cost"
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>

                  {/* AI Questions to Ask */}
                  {item.questionsToAsk && item.questionsToAsk.length > 0 && (
                    <div className="p-4 rounded-xl bg-brand-950/30 border border-brand-900/50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-xs font-semibold text-brand-300">
                          <HelpCircle className="w-4 h-4 text-brand-400" />
                          <span>Crucial Questions to Ask Before Signing</span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleCopyQuestions(item, e)}
                          className="text-[11px] text-brand-400 hover:text-brand-300 flex items-center gap-1"
                        >
                          {copiedId === item.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400 font-semibold">Copied Questions!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Questions</span>
                            </>
                          )}
                        </button>
                      </div>

                      <ul className="space-y-1.5">
                        {item.questionsToAsk.map((q, qIdx) => (
                          <li
                            key={qIdx}
                            className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-1.5 flex-shrink-0" />
                            <span>{q}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Custom Vendor Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Add Vendor Category"
        >
          <div className="w-full max-w-md p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">Add New Vendor Category</h3>
            <form onSubmit={handleAddCategorySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Category Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g., Mehendi & Henna Artist, Fireworks, Valet, Security"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Estimated Budget ({currency})
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={newEstimatedBudget}
                  onChange={(e) => setNewEstimatedBudget(Number(e.target.value))}
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
                  placeholder="e.g., Bridal mehendi for 15 relatives on pre-wedding night"
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
