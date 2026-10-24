import React from 'react';
import {
  Calendar,
  MapPin,
  Users,
  IndianRupee,
  PlusCircle,
  Sparkles,
  ArrowRight,
  Trash2,
  ExternalLink,
  FolderOpen,
} from 'lucide-react';
import { EventListItem } from '../services/api';
import { formatCurrency } from '@celebrai/shared';

interface SavedEventsListProps {
  events: EventListItem[];
  onOpenEvent: (id: string) => void;
  onDeleteEvent: (id: string, title: string) => void;
  onNewEvent: () => void;
}

export const SavedEventsList: React.FC<SavedEventsListProps> = ({
  events,
  onOpenEvent,
  onDeleteEvent,
  onNewEvent,
}) => {
  if (events.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
          <FolderOpen className="w-8 h-8" />
        </div>
        <h3 className="font-display text-xl font-bold text-white">No Saved Celebrations Yet</h3>
        <p className="mt-2 text-sm text-slate-400 leading-relaxed">
          Start by planning your first wedding, birthday, anniversary, or community event. Your plans
          will be automatically persisted locally in your SQLite database.
        </p>
        <div className="mt-6">
          <button
            onClick={onNewEvent}
            className="px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-glow inline-flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Your First Plan</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Saved Celebration Blueprints
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Persisted in local SQLite database. Open any workspace to edit budgets, deadlines, and vendors.
          </p>
        </div>

        <button
          onClick={onNewEvent}
          className="px-4 py-2.5 rounded-xl font-semibold text-xs bg-brand-600 hover:bg-brand-500 text-white shadow-glow flex items-center gap-2 self-start sm:self-auto transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Plan Another Event</span>
        </button>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((evt) => {
          const daysLeft = Math.ceil(
            (new Date(evt.eventDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          );

          return (
            <div
              key={evt.id}
              className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 hover:shadow-xl transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-500/15 border border-brand-500/30 text-brand-300">
                    {evt.eventType}
                  </span>

                  <button
                    onClick={() => onDeleteEvent(evt.id, evt.title)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                    title="Delete celebration plan"
                    aria-label={`Delete ${evt.title}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="font-display text-lg font-bold text-white group-hover:text-brand-300 transition-colors line-clamp-1">
                  {evt.title}
                </h3>

                <div className="mt-4 space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-brand-400" />
                    <span>{evt.eventDate}</span>
                    {daysLeft >= 0 ? (
                      <span className="text-slate-500">({daysLeft} days left)</span>
                    ) : (
                      <span className="text-slate-500">(Completed)</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-indigo-400" />
                    <span>{evt.city}</span>
                    <span className="text-slate-500">•</span>
                    <Users className="w-4 h-4 text-violet-400" />
                    <span>{evt.guestCount} Guests</span>
                  </div>

                  <div className="flex items-center gap-2 pt-1 font-mono text-emerald-400 font-semibold">
                    <span>{formatCurrency(evt.budget, evt.currency)}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-slate-800/80">
                <button
                  onClick={() => onOpenEvent(evt.id)}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-brand-600 text-slate-200 hover:text-white flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <span>Open Event Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
