import React, { useState, useEffect } from 'react';
import {
  EventRecord,
  EventRequirements,
  EventType,
} from '@celebrai/shared';
import {
  fetchHealth,
  fetchSystemStatus,
  fetchEvents,
  fetchEvent,
  generateAiPlan,
  saveNewEvent,
  updateExistingEvent,
  deleteEvent,
  clearAllEventsData,
  EventListItem,
  SystemStatusResponse,
} from './services/api';
import { Navbar } from './components/Navbar';
import { HeroLanding } from './components/HeroLanding';
import { EventWizard } from './components/EventWizard';
import { Workspace } from './components/Workspace';
import { SavedEventsList } from './components/SavedEventsList';
import { LoadingOverlay } from './components/LoadingOverlay';
import { SettingsModal } from './components/SettingsModal';
import { ToastContainer, ToastItem } from './components/ToastContainer';
import { Sparkles, Heart } from 'lucide-react';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<
    'landing' | 'wizard' | 'workspace' | 'saved'
  >('landing');

  const [savedEvents, setSavedEvents] = useState<EventListItem[]>([]);
  const [activeEvent, setActiveEvent] = useState<EventRecord | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatusResponse | null>(null);
  const [isAiConfigured, setIsAiConfigured] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [wizardPrefill, setWizardPrefill] = useState<Partial<EventRequirements> | undefined>();
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Toast notification helper
  const showToast = (
    message: string,
    type: 'success' | 'warning' | 'error' | 'info' = 'info'
  ) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initial Data Fetch
  useEffect(() => {
    const initApp = async () => {
      try {
        const [health, status, events] = await Promise.all([
          fetchHealth().catch(() => null),
          fetchSystemStatus().catch(() => null),
          fetchEvents().catch(() => []),
        ]);

        if (status) {
          setSystemStatus(status);
          setIsAiConfigured(status.ai.isConfigured);
        } else if (health) {
          setIsAiConfigured(health.services.aiProvider.configured);
        }

        setSavedEvents(events);
      } catch (err) {
        console.error('App initialization error:', err);
      }
    };

    initApp();
  }, []);

  const refreshEventsList = async () => {
    try {
      const events = await fetchEvents();
      setSavedEvents(events);
    } catch (err) {
      console.error('Failed to refresh events list:', err);
    }
  };

  // Launch wizard with optional prefill
  const handleStartPlanning = (prefillType?: EventType) => {
    if (prefillType) {
      const defaultsByType: Record<string, Partial<EventRequirements>> = {
        wedding: {
          title: 'Royal Wedding Celebration',
          eventType: 'wedding',
          budget: 1500000,
          currency: 'INR',
          guestCount: 300,
          city: 'Jaipur',
          themePreference: 'Royal Marigold & Velvet Ambiance',
          venuePreference: 'banquet',
          dietaryPreferences: ['Vegetarian', 'Jain Options Available'],
        },
        birthday: {
          title: 'Milestone 30th Birthday Soirée',
          eventType: 'birthday',
          budget: 75000,
          currency: 'INR',
          guestCount: 50,
          city: 'Mumbai',
          themePreference: 'Retro Glam Neon & Velvet',
          venuePreference: 'indoor',
          dietaryPreferences: ['Vegetarian', 'Kids Menu'],
        },
        anniversary: {
          title: 'Silver 25th Wedding Anniversary',
          eventType: 'anniversary',
          budget: 250000,
          currency: 'INR',
          guestCount: 80,
          city: 'Bengaluru',
          themePreference: 'Silver Starlight & Botanical Ivy',
          venuePreference: 'outdoor',
          dietaryPreferences: ['Vegetarian'],
        },
        community: {
          title: 'Green Valley Community Cultural Fest',
          eventType: 'community',
          budget: 500000,
          currency: 'INR',
          guestCount: 500,
          city: 'Delhi',
          themePreference: 'Vibrant Cultural Harmony',
          venuePreference: 'outdoor',
          dietaryPreferences: ['Vegetarian', 'Halal'],
        },
        engagement: {
          title: 'Shreya & Kabir Engagement Gala',
          eventType: 'engagement',
          budget: 400000,
          currency: 'INR',
          guestCount: 120,
          city: 'Pune',
          themePreference: 'Pastel Floral Euphoria',
          venuePreference: 'outdoor',
          dietaryPreferences: ['Vegetarian'],
        },
      };

      setWizardPrefill(defaultsByType[prefillType] || { eventType: prefillType });
    } else {
      setWizardPrefill(undefined);
    }

    setCurrentView('wizard');
  };

  // Plan generation execution
  const handleGeneratePlan = async (
    requirements: EventRequirements,
    demoMode: boolean
  ) => {
    setIsGenerating(true);
    try {
      const { plan, isDemo } = await generateAiPlan(requirements, demoMode);

      // Persist generated plan in SQLite
      const savedRecord = await saveNewEvent(requirements, plan);

      setActiveEvent(savedRecord);
      await refreshEventsList();
      setCurrentView('workspace');

      showToast(
        isDemo
          ? 'Sample celebration plan assembled in Demo Mode.'
          : 'Custom celebration plan generated via Gemini AI.',
        'success'
      );
    } catch (err: any) {
      console.error('Plan generation error:', err);
      showToast(err.message || 'Failed to generate event plan. Please retry.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Open saved event
  const handleOpenEvent = async (id: string) => {
    try {
      const record = await fetchEvent(id);
      setActiveEvent(record);
      setCurrentView('workspace');
    } catch (err: any) {
      showToast(err.message || 'Failed to open event record.', 'error');
    }
  };

  // Update existing event in workspace
  const handleUpdateActiveEvent = async (updated: EventRecord) => {
    const saved = await updateExistingEvent(updated.id, {
      requirements: updated.requirements,
      plan: updated.plan,
    });
    setActiveEvent(saved);
    await refreshEventsList();
  };

  // Delete single event
  const handleDeleteEvent = async (id: string, title?: string) => {
    const confirmMsg = title
      ? `Are you sure you want to delete "${title}"?`
      : 'Are you sure you want to delete this event?';

    if (!window.confirm(confirmMsg)) return;

    try {
      await deleteEvent(id);
      await refreshEventsList();
      if (activeEvent?.id === id) {
        setActiveEvent(null);
        setCurrentView('saved');
      }
      showToast('Celebration plan deleted.', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete event.', 'error');
    }
  };

  // Clear all data
  const handleClearAllData = async () => {
    try {
      const count = await clearAllEventsData();
      setActiveEvent(null);
      await refreshEventsList();
      setIsSettingsOpen(false);
      setCurrentView('landing');
      showToast(`Cleared ${count} saved event record(s).`, 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to clear data.', 'error');
    }
  };

  // Export all saved plans
  const handleExportAll = async () => {
    try {
      const fullEvents = await Promise.all(
        savedEvents.map((evt) => fetchEvent(evt.id).catch(() => null))
      );
      const valid = fullEvents.filter(Boolean);

      const blob = new Blob(
        [
          JSON.stringify(
            {
              appName: 'CelebrAI Intelligent Event Planner',
              exportedAt: new Date().toISOString(),
              totalEvents: valid.length,
              events: valid,
            },
            null,
            2
          ),
        ],
        { type: 'application/json' }
      );

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CelebrAI_All_Events_Backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Exported backup of all celebration plans.', 'success');
    } catch (err) {
      showToast('Failed to export backup.', 'error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-brand-500 selection:text-white">
      {/* Top Navbar */}
      <div className="no-print">
        <Navbar
          currentView={currentView}
          setCurrentView={setCurrentView}
          savedCount={savedEvents.length}
          isAiConfigured={isAiConfigured}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onNewPlan={() => handleStartPlanning()}
        />
      </div>

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <HeroLanding
            onStartPlanning={handleStartPlanning}
            onViewSaved={() => setCurrentView('saved')}
            savedCount={savedEvents.length}
          />
        )}

        {currentView === 'wizard' && (
          <EventWizard
            initialValues={wizardPrefill}
            isAiConfigured={isAiConfigured}
            onSubmit={handleGeneratePlan}
            onCancel={() => setCurrentView(savedEvents.length > 0 ? 'saved' : 'landing')}
          />
        )}

        {currentView === 'workspace' && activeEvent && (
          <Workspace
            event={activeEvent}
            onUpdateEvent={handleUpdateActiveEvent}
            onDeleteEvent={(id) => handleDeleteEvent(id, activeEvent.requirements.title)}
            onEditRequirements={() => {
              setWizardPrefill(activeEvent.requirements);
              setCurrentView('wizard');
            }}
            onBackToSaved={() => setCurrentView('saved')}
            showToast={showToast}
          />
        )}

        {currentView === 'saved' && (
          <SavedEventsList
            events={savedEvents}
            onOpenEvent={handleOpenEvent}
            onDeleteEvent={handleDeleteEvent}
            onNewEvent={() => handleStartPlanning()}
          />
        )}
      </main>

      {/* App Footer */}
      <footer className="no-print border-t border-slate-900 bg-slate-950/80 py-8 mt-auto text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-brand-600 flex items-center justify-center text-white">
              <Sparkles className="w-3 h-3" />
            </div>
            <span className="font-semibold text-slate-300">CelebrAI</span>
            <span>— Intelligent Celebration & Event Planner</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[11px] text-slate-400">
              PromptWars Virtual Challenge 5 | Production-Ready Build
            </span>
            <span>•</span>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              System Status
            </button>
          </div>
        </div>
      </footer>

      {/* Loading Overlay Modal */}
      {isGenerating && <LoadingOverlay isDemoMode={!isAiConfigured} />}

      {/* Settings & Status Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        status={systemStatus}
        onClearAllData={handleClearAllData}
        onExportAll={handleExportAll}
        totalSavedEvents={savedEvents.length}
      />

      {/* Accessible Toast Notification Stack */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
};
