import React, { useState } from 'react';
import {
  Sparkles,
  Calendar,
  FolderHeart,
  Settings,
  PlusCircle,
  Menu,
  X,
  Zap,
} from 'lucide-react';

interface NavbarProps {
  currentView: 'landing' | 'wizard' | 'workspace' | 'saved';
  setCurrentView: (view: 'landing' | 'wizard' | 'workspace' | 'saved') => void;
  savedCount: number;
  isAiConfigured: boolean;
  onOpenSettings: () => void;
  onNewPlan: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  savedCount,
  isAiConfigured,
  onOpenSettings,
  onNewPlan,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentView('landing')}
              className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-lg p-1"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 via-indigo-600 to-violet-500 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform duration-200">
                <Sparkles className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
              <div>
                <span className="font-display font-bold text-xl tracking-tight text-white flex items-center gap-1.5">
                  Celebr<span className="text-brand-400">AI</span>
                </span>
                <span className="hidden sm:block text-xs font-medium text-slate-400 -mt-1">
                  Intelligent Event Planner
                </span>
              </div>
            </button>

            {/* AI Status Badge */}
            <div className="hidden md:flex items-center gap-1.5 ml-4 px-2.5 py-1 rounded-full text-xs font-medium border border-slate-800 bg-slate-900/60">
              <span
                className={`w-2 h-2 rounded-full ${
                  isAiConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span className="text-slate-300">
                {isAiConfigured ? 'Gemini 2.5 Flash' : 'Demo Mode Active'}
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => setCurrentView('landing')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'landing'
                  ? 'text-white bg-slate-800/80'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              Overview
            </button>

            <button
              onClick={() => setCurrentView('saved')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                currentView === 'saved'
                  ? 'text-white bg-slate-800/80'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <FolderHeart className="w-4 h-4 text-brand-400" />
              <span>Saved Events</span>
              {savedCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  {savedCount}
                </span>
              )}
            </button>

            <button
              onClick={onOpenSettings}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
              title="System Status & Settings"
              aria-label="Settings and Status"
            >
              <Settings className="w-5 h-5" />
            </button>

            <button
              onClick={onNewPlan}
              className="ml-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-glow flex items-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Plan My Event</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onNewPlan}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-600 text-white flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Plan</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950 px-4 pt-2 pb-4 space-y-2">
          <button
            onClick={() => {
              setCurrentView('landing');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2.5 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-900"
          >
            Overview
          </button>
          <button
            onClick={() => {
              setCurrentView('saved');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2.5 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-900 flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <FolderHeart className="w-4 h-4 text-brand-400" />
              Saved Events
            </span>
            {savedCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300">
                {savedCount}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              onOpenSettings();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2.5 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-900 flex items-center gap-2"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            System Status & Configuration
          </button>
          <div className="pt-2">
            <button
              onClick={() => {
                onNewPlan();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 rounded-xl font-semibold bg-brand-600 hover:bg-brand-500 text-white flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Plan My Event
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
