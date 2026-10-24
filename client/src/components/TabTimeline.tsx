import React, { useState, useMemo } from 'react';
import {
  CalendarCheck2,
  Clock,
  AlertCircle,
  CheckCircle2,
  Plus,
  Trash2,
  Filter,
  Calendar,
} from 'lucide-react';
import {
  TaskItem,
  TaskPhase,
  TaskPriority,
  calculateTimelineSummary,
  isTaskOverdue,
  groupTasksByPhase,
} from '@celebrai/shared';

interface TabTimelineProps {
  tasks: TaskItem[];
  eventDate: string;
  onUpdateTasks: (tasks: TaskItem[]) => void;
}

export const TabTimeline: React.FC<TabTimelineProps> = ({
  tasks,
  eventDate,
  onUpdateTasks,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'overdue' | 'completed'>('all');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('General');
  const [newPhase, setNewPhase] = useState<TaskPhase>('Week of event');
  const [newDueDate, setNewDueDate] = useState(eventDate);
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');
  const [newNotes, setNewNotes] = useState('');

  const summary = useMemo(() => {
    return calculateTimelineSummary(tasks);
  }, [tasks]);

  const toggleTask = (id: string) => {
    const updated = tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    onUpdateTasks(updated);
  };

  const handleUpdateTaskField = (id: string, field: keyof TaskItem, value: any) => {
    const updated = tasks.map((t) => (t.id === id ? { ...t, [field]: value } : t));
    onUpdateTasks(updated);
  };

  const handleDeleteTask = (id: string) => {
    onUpdateTasks(tasks.filter((t) => t.id !== id));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: TaskItem = {
      id: `task-custom-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory.trim(),
      phase: newPhase,
      dueDate: newDueDate,
      completed: false,
      priority: newPriority,
      notes: newNotes.trim(),
    };

    onUpdateTasks([...tasks, newTask]);
    setNewTitle('');
    setNewNotes('');
    setShowAddModal(false);
  };

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filter === 'completed') return task.completed;
      if (filter === 'overdue') return isTaskOverdue(task);
      if (filter === 'pending') return !task.completed;
      return true;
    });
  }, [tasks, filter]);

  // Group filtered tasks by phase
  const groupedTasks = useMemo(() => {
    return groupTasksByPhase(filteredTasks);
  }, [filteredTasks]);

  const phaseOrder: TaskPhase[] = [
    '3-6 months before',
    '1-2 months before',
    '2-4 weeks before',
    'Week of event',
    'Event day',
    'Post-event',
  ];

  return (
    <div className="space-y-6">
      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Total Tasks</span>
          <div className="text-xl sm:text-2xl font-bold font-mono text-white">
            {summary.totalTasks}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Across all phases</span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-800/40">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Completed</span>
          <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">
            {summary.completedTasks}
          </div>
          <span className="text-[11px] text-emerald-500 mt-0.5 block">Verified milestones</span>
        </div>

        <div
          className={`p-4 rounded-2xl border ${
            summary.overdueTasks > 0
              ? 'bg-rose-950/30 border-rose-800/60'
              : 'bg-slate-900/60 border-slate-800'
          }`}
        >
          <span className="text-xs font-semibold text-slate-400 block mb-1">Overdue</span>
          <div
            className={`text-xl sm:text-2xl font-bold font-mono ${
              summary.overdueTasks > 0 ? 'text-rose-400' : 'text-slate-400'
            }`}
          >
            {summary.overdueTasks}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Past due date</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Upcoming</span>
          <div className="text-xl sm:text-2xl font-bold font-mono text-indigo-300">
            {summary.upcomingTasks}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Scheduled</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 col-span-2 lg:col-span-1">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Progress</span>
          <div className="text-xl sm:text-2xl font-bold font-mono text-brand-300">
            {summary.completionPercentage}%
          </div>
          <div className="w-full bg-slate-950 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-brand-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${summary.completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-400 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Filter:
          </span>
          {[
            { id: 'all', label: `All (${tasks.length})` },
            { id: 'pending', label: `Pending (${summary.overdueTasks + summary.upcomingTasks})` },
            { id: 'overdue', label: `Overdue (${summary.overdueTasks})` },
            { id: 'completed', label: `Completed (${summary.completedTasks})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filter === tab.id
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-950 border border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white flex items-center gap-1.5 transition-colors shadow-sm ml-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Task</span>
        </button>
      </div>

      {/* Grouped Checklist by Phase */}
      <div className="space-y-6">
        {phaseOrder.map((phase) => {
          const phaseTasks = groupedTasks[phase] || [];
          if (phaseTasks.length === 0 && filter !== 'all') return null;

          return (
            <div
              key={phase}
              className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-3"
            >
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <h4 className="font-display text-sm font-bold text-brand-300 uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-400" />
                  <span>{phase}</span>
                </h4>
                <span className="text-xs text-slate-400 font-mono">
                  {phaseTasks.filter((t) => t.completed).length} / {phaseTasks.length} done
                </span>
              </div>

              {phaseTasks.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2">No tasks in this phase.</p>
              ) : (
                <div className="space-y-2">
                  {phaseTasks.map((task) => {
                    const overdue = isTaskOverdue(task);
                    return (
                      <div
                        key={task.id}
                        className={`p-3 rounded-xl border transition-all flex items-start gap-3 ${
                          task.completed
                            ? 'bg-slate-950/40 border-slate-800/40 opacity-75'
                            : overdue
                            ? 'bg-rose-950/20 border-rose-800/50'
                            : 'bg-slate-950/80 border-slate-800/90 hover:border-slate-700'
                        }`}
                      >
                        {/* Accessible Checkbox */}
                        <div className="pt-0.5">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleTask(task.id)}
                            id={`task-check-${task.id}`}
                            className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-brand-600 focus:ring-brand-500 cursor-pointer"
                            aria-label={`Mark "${task.title}" as ${
                              task.completed ? 'incomplete' : 'complete'
                            }`}
                          />
                        </div>

                        {/* Task Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span
                              className={`text-xs font-semibold ${
                                task.completed
                                  ? 'line-through text-slate-500'
                                  : 'text-white'
                              }`}
                            >
                              {task.title}
                            </span>

                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300">
                              {task.category}
                            </span>

                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                task.priority === 'critical'
                                  ? 'bg-rose-500/20 text-rose-300'
                                  : task.priority === 'high'
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : 'bg-blue-500/20 text-blue-300'
                              }`}
                            >
                              {task.priority}
                            </span>

                            {overdue && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                Overdue
                              </span>
                            )}
                          </div>

                          {task.notes && (
                            <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
                              {task.notes}
                            </p>
                          )}

                          <div className="flex items-center gap-3 text-[11px] text-slate-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              Due:
                            </span>
                            <input
                              type="date"
                              value={task.dueDate}
                              onChange={(e) =>
                                handleUpdateTaskField(task.id, 'dueDate', e.target.value)
                              }
                              className="bg-transparent border border-slate-800 rounded px-1.5 py-0.5 text-slate-300 text-[11px] font-mono focus:outline-none focus:border-brand-500"
                            />
                          </div>
                        </div>

                        {/* Delete Action */}
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                          title="Delete task"
                          aria-label={`Delete task ${task.title}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Add Milestone Task"
        >
          <div className="w-full max-w-md p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">Add Custom Milestone Task</h3>
            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Task Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Finalize dance choreography with choreographer"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="e.g., Entertainment"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Phase</label>
                  <select
                    value={newPhase}
                    onChange={(e) => setNewPhase(e.target.value as TaskPhase)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {phaseOrder.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Notes / Details
                </label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g., Book 4 practice sessions starting Tuesday"
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
                  Add Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
