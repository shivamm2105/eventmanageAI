import React, { useState } from 'react';
import {
  Calendar,
  MapPin,
  Users,
  IndianRupee,
  Save,
  Download,
  Printer,
  Trash2,
  Edit3,
  Sparkles,
  LayoutDashboard,
  Calculator,
  CalendarCheck2,
  Briefcase,
  Lightbulb,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Copy,
  RotateCcw,
} from 'lucide-react';
import {
  EventRecord,
  BudgetItem,
  TaskItem,
  VendorCategoryPlanning,
  formatCurrency,
} from '@celebrai/shared';
import { TabOverview } from './TabOverview';
import { TabBudget } from './TabBudget';
import { TabTimeline } from './TabTimeline';
import { TabVendors } from './TabVendors';
import { TabPersonalization } from './TabPersonalization';
import { PrintView } from './PrintView';

interface WorkspaceProps {
  event: EventRecord;
  onUpdateEvent: (updated: EventRecord) => Promise<void>;
  onDeleteEvent: (id: string) => void;
  onEditRequirements: () => void;
  onRegeneratePlan?: () => void;
  onBackToSaved: () => void;
  showToast: (msg: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

export const Workspace: React.FC<WorkspaceProps> = ({
  event,
  onUpdateEvent,
  onDeleteEvent,
  onEditRequirements,
  onRegeneratePlan,
  onBackToSaved,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'budget' | 'timeline' | 'vendors' | 'ideas' | 'print'
  >('overview');

  const [currentEvent, setCurrentEvent] = useState<EventRecord>(event);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // Sync if prop changes
  React.useEffect(() => {
    setCurrentEvent(event);
    setHasUnsavedChanges(false);
  }, [event]);

  const { requirements, plan } = currentEvent;

  // Days until event calculation
  const daysUntil = Math.ceil(
    (new Date(requirements.eventDate).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );

  const handleUpdateBudgetItems = (items: BudgetItem[]) => {
    const updated: EventRecord = {
      ...currentEvent,
      plan: {
        ...currentEvent.plan,
        budgetItems: items,
      },
    };
    setCurrentEvent(updated);
    setHasUnsavedChanges(true);
  };

  const handleUpdateTasks = (tasks: TaskItem[]) => {
    const updated: EventRecord = {
      ...currentEvent,
      plan: {
        ...currentEvent.plan,
        timeline: tasks,
      },
    };
    setCurrentEvent(updated);
    setHasUnsavedChanges(true);
  };

  const handleUpdateVendors = (vendors: VendorCategoryPlanning[]) => {
    const updated: EventRecord = {
      ...currentEvent,
      plan: {
        ...currentEvent.plan,
        vendorCategories: vendors,
      },
    };
    setCurrentEvent(updated);
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdateEvent(currentEvent);
      setHasUnsavedChanges(false);
      showToast('Celebration plan updated & saved to SQLite.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save changes.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportJson = () => {
    const cleanExport = {
      id: currentEvent.id,
      requirements: currentEvent.requirements,
      plan: currentEvent.plan,
      exportedAt: new Date().toISOString(),
      appName: 'CelebrAI Intelligent Event Planner',
    };

    const blob = new Blob([JSON.stringify(cleanExport, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CelebrAI-${requirements.title.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Event plan JSON exported successfully.', 'info');
  };

  const handleCopySummary = () => {
    const summaryText =
      `🎉 ${requirements.title}\n` +
      `📅 Date: ${requirements.eventDate} (${daysUntil >= 0 ? `${daysUntil} days to go` : 'Past event'})\n` +
      `📍 Location: ${requirements.city}\n` +
      `👥 Guests: ${requirements.guestCount}\n` +
      `💰 Budget: ${formatCurrency(requirements.budget, requirements.currency)}\n` +
      `🎨 Theme: ${plan.recommendedTheme.name}\n\n` +
      `Summary: ${plan.summary}\n\n` +
      `Planned with CelebrAI — Intelligent Celebration Planner`;

    navigator.clipboard.writeText(summaryText);
    showToast('Event summary copied to clipboard for easy sharing.', 'success');
  };

  const handleRegenerateClick = () => {
    if (
      window.confirm(
        'Regenerate celebration plan with AI? This will construct a fresh plan based on current requirements.'
      )
    ) {
      if (onRegeneratePlan) {
        onRegeneratePlan();
      } else {
        onEditRequirements();
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back button */}
      <div className="no-print">
        <button
          onClick={onBackToSaved}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Saved Plans</span>
        </button>
      </div>

      {/* Workspace Master Header */}
      <div className="no-print p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl relative overflow-hidden backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500/15 border border-brand-500/30 text-brand-300">
                {requirements.eventType}
              </span>

              {plan.isDemoPlan ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-300">
                  Demo Plan (Sample Data)
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Live AI Plan ({plan.modelUsed})
                </span>
              )}

              {hasUnsavedChanges && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 animate-pulse">
                  Unsaved Edits
                </span>
              )}
            </div>

            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              {requirements.title}
            </h1>

            {/* Event Key Metrics Badges */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
              <span className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1 rounded-lg border border-slate-800">
                <Calendar className="w-3.5 h-3.5 text-brand-400" />
                <span>{requirements.eventDate}</span>
                {daysUntil >= 0 ? (
                  <strong className="text-brand-300 ml-1">({daysUntil} days left)</strong>
                ) : (
                  <strong className="text-slate-400 ml-1">(Past Event)</strong>
                )}
              </span>

              <span className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1 rounded-lg border border-slate-800">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                <span>{requirements.city}</span>
              </span>

              <span className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1 rounded-lg border border-slate-800">
                <Users className="w-3.5 h-3.5 text-violet-400" />
                <span>{requirements.guestCount} Guests</span>
              </span>

              <span className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1 rounded-lg border border-slate-800 font-mono">
                <span className="text-emerald-400 font-bold">{requirements.currency}</span>
                <span>{formatCurrency(requirements.budget, requirements.currency)}</span>
              </span>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-glow ${
                hasUnsavedChanges
                  ? 'bg-brand-600 hover:bg-brand-500 text-white animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving to SQLite...' : hasUnsavedChanges ? 'Save Changes' : 'Saved'}</span>
            </button>

            <button
              onClick={handleRegenerateClick}
              className="p-2.5 rounded-xl text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors"
              title="Regenerate Plan with AI"
              aria-label="Regenerate Plan"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={handleCopySummary}
              className="p-2.5 rounded-xl text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors"
              title="Copy Summary to Clipboard"
              aria-label="Copy Summary"
            >
              <Copy className="w-4 h-4" />
            </button>

            <button
              onClick={handleExportJson}
              className="p-2.5 rounded-xl text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors"
              title="Export Event Plan as JSON"
              aria-label="Export JSON"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('print')}
              className="p-2.5 rounded-xl text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors"
              title="Clean Printable View"
              aria-label="Print view"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={onEditRequirements}
              className="p-2.5 rounded-xl text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors"
              title="Edit Event Requirements"
              aria-label="Edit Requirements"
            >
              <Edit3 className="w-4 h-4" />
            </button>

            <button
              onClick={() => onDeleteEvent(currentEvent.id)}
              className="p-2.5 rounded-xl text-slate-400 hover:text-rose-400 bg-slate-800/80 hover:bg-rose-950/40 border border-slate-700 hover:border-rose-800/60 transition-colors"
              title="Delete Celebration Plan"
              aria-label="Delete Event"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="no-print border-b border-slate-800 flex overflow-x-auto gap-2 text-sm font-medium">
        {[
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'budget', label: 'Budget Planner', icon: Calculator },
          { id: 'timeline', label: 'Timeline & Checklist', icon: CalendarCheck2 },
          { id: 'vendors', label: 'Vendor Directory', icon: Briefcase },
          { id: 'ideas', label: 'Experiences & Ideas', icon: Lightbulb },
          { id: 'print', label: 'Printable Blueprint', icon: Printer },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 pt-2 px-3.5 border-b-2 font-semibold flex items-center gap-2 whitespace-nowrap transition-colors ${
                isActive
                  ? 'border-brand-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-brand-400' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab Content */}
      <div className="pt-2">
        {activeTab === 'overview' && (
          <TabOverview plan={plan} requirements={requirements} />
        )}

        {activeTab === 'budget' && (
          <TabBudget
            totalBudget={requirements.budget}
            currency={requirements.currency}
            items={plan.budgetItems}
            onUpdateItems={handleUpdateBudgetItems}
          />
        )}

        {activeTab === 'timeline' && (
          <TabTimeline
            tasks={plan.timeline}
            eventDate={requirements.eventDate}
            onUpdateTasks={handleUpdateTasks}
          />
        )}

        {activeTab === 'vendors' && (
          <TabVendors
            categories={plan.vendorCategories}
            currency={requirements.currency}
            onUpdateCategories={handleUpdateVendors}
          />
        )}

        {activeTab === 'ideas' && (
          <TabPersonalization ideas={plan.personalizedIdeas} />
        )}

        {activeTab === 'print' && (
          <PrintView event={currentEvent} onExportJson={handleExportJson} />
        )}
      </div>
    </div>
  );
};
