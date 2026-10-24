import { TaskItem, TaskPhase, TimelineSummary } from './types';

/**
 * Timeline and Checklist Calculation Engine
 * Date-aware milestone manager and progress tracker.
 */

export function isValidIsoDate(dateString: string): boolean {
  if (!dateString || typeof dateString !== 'string') return false;
  const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;
  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const d = new Date(Date.UTC(year, month - 1, day));
  return (
    d.getUTCFullYear() === year &&
    d.getUTCMonth() === month - 1 &&
    d.getUTCDate() === day
  );
}

/**
 * Calculates due date relative to the event date for a given phase.
 */
export function calculatePhaseDueDate(eventDateStr: string, phase: TaskPhase): string {
  if (!isValidIsoDate(eventDateStr)) {
    return new Date().toISOString().split('T')[0];
  }

  const [y, m, d] = eventDateStr.split('-').map(Number);
  const eventDate = new Date(Date.UTC(y, m - 1, d));

  const offsetDays: Record<TaskPhase, number> = {
    '3-6 months before': -120,
    '1-2 months before': -45,
    '2-4 weeks before': -21,
    'Week of event': -3,
    'Event day': 0,
    'Post-event': +3,
  };

  const daysToShift = offsetDays[phase] ?? -14;
  eventDate.setUTCDate(eventDate.getUTCDate() + daysToShift);

  return eventDate.toISOString().split('T')[0];
}

/**
 * Evaluates whether a task is overdue relative to a reference date (defaults to today).
 */
export function isTaskOverdue(task: TaskItem, referenceDateStr?: string): boolean {
  if (task.completed) return false;
  if (!isValidIsoDate(task.dueDate)) return false;

  const todayStr = referenceDateStr && isValidIsoDate(referenceDateStr)
    ? referenceDateStr
    : new Date().toISOString().split('T')[0];

  return task.dueDate < todayStr;
}

/**
 * Calculates overall timeline progress summary.
 */
export function calculateTimelineSummary(
  tasks: TaskItem[],
  referenceDateStr?: string
): TimelineSummary {
  if (!tasks || tasks.length === 0) {
    return {
      totalTasks: 0,
      completedTasks: 0,
      overdueTasks: 0,
      upcomingTasks: 0,
      completionPercentage: 0,
    };
  }

  const todayStr = referenceDateStr && isValidIsoDate(referenceDateStr)
    ? referenceDateStr
    : new Date().toISOString().split('T')[0];

  let completedTasks = 0;
  let overdueTasks = 0;
  let upcomingTasks = 0;

  for (const task of tasks) {
    if (task.completed) {
      completedTasks++;
    } else {
      if (isValidIsoDate(task.dueDate) && task.dueDate < todayStr) {
        overdueTasks++;
      } else {
        upcomingTasks++;
      }
    }
  }

  const totalTasks = tasks.length;
  const completionPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    totalTasks,
    completedTasks,
    overdueTasks,
    upcomingTasks,
    completionPercentage,
  };
}

/**
 * Groups tasks logically by planning phase.
 */
export function groupTasksByPhase(
  tasks: TaskItem[]
): Record<TaskPhase, TaskItem[]> {
  const groups: Record<TaskPhase, TaskItem[]> = {
    '3-6 months before': [],
    '1-2 months before': [],
    '2-4 weeks before': [],
    'Week of event': [],
    'Event day': [],
    'Post-event': [],
  };

  for (const task of tasks) {
    if (groups[task.phase]) {
      groups[task.phase].push(task);
    } else {
      groups['Week of event'].push(task);
    }
  }

  return groups;
}
