import { describe, it, expect } from 'vitest';
import {
  isValidIsoDate,
  calculatePhaseDueDate,
  isTaskOverdue,
  calculateTimelineSummary,
  groupTasksByPhase,
} from '../shared/src/timelineEngine';
import { TaskItem } from '../shared/src/types';

describe('Timeline and Checklist Engine', () => {
  describe('isValidIsoDate', () => {
    it('accepts valid YYYY-MM-DD dates', () => {
      expect(isValidIsoDate('2026-12-25')).toBe(true);
      expect(isValidIsoDate('2024-02-29')).toBe(true); // Leap year
    });

    it('rejects invalid format or dates', () => {
      expect(isValidIsoDate('25-12-2026')).toBe(false);
      expect(isValidIsoDate('2026-02-30')).toBe(false); // Invalid day
      expect(isValidIsoDate('2026/12/25')).toBe(false);
      expect(isValidIsoDate('')).toBe(false);
    });
  });

  describe('calculatePhaseDueDate', () => {
    it('shifts days backward for pre-event phases', () => {
      const eventDate = '2026-10-15';
      const phaseDueDate = calculatePhaseDueDate(eventDate, 'Week of event');
      expect(phaseDueDate).toBe('2026-10-12'); // 3 days before
    });

    it('returns event date itself for Event day phase', () => {
      const eventDate = '2026-10-15';
      expect(calculatePhaseDueDate(eventDate, 'Event day')).toBe('2026-10-15');
    });

    it('shifts days forward (+3 days) for Post-event phase', () => {
      const eventDate = '2026-10-15';
      expect(calculatePhaseDueDate(eventDate, 'Post-event')).toBe('2026-10-18');
    });

    it('falls back to today if event date is invalid format', () => {
      const fallback = calculatePhaseDueDate('not-a-date', 'Week of event');
      expect(isValidIsoDate(fallback)).toBe(true);
    });
  });

  describe('isTaskOverdue', () => {
    const referenceDate = '2026-10-10';

    it('identifies uncompleted task past due date as overdue', () => {
      const task: TaskItem = {
        id: '1',
        title: 'Book Photographer',
        category: 'Photography',
        phase: '1-2 months before',
        dueDate: '2026-10-05',
        completed: false,
        priority: 'high',
      };
      expect(isTaskOverdue(task, referenceDate)).toBe(true);
    });

    it('does not flag completed task as overdue even if due date passed', () => {
      const task: TaskItem = {
        id: '2',
        title: 'Book Photographer',
        category: 'Photography',
        phase: '1-2 months before',
        dueDate: '2026-10-05',
        completed: true,
        priority: 'high',
      };
      expect(isTaskOverdue(task, referenceDate)).toBe(false);
    });

    it('does not flag future task as overdue', () => {
      const task: TaskItem = {
        id: '3',
        title: 'Final walkthrough',
        category: 'Venue',
        phase: 'Week of event',
        dueDate: '2026-10-12',
        completed: false,
        priority: 'critical',
      };
      expect(isTaskOverdue(task, referenceDate)).toBe(false);
    });
  });

  describe('calculateTimelineSummary', () => {
    const referenceDate = '2026-10-10';
    const tasks: TaskItem[] = [
      {
        id: '1',
        title: 'Task 1',
        category: 'Venue',
        phase: '3-6 months before',
        dueDate: '2026-09-01',
        completed: true,
        priority: 'high',
      },
      {
        id: '2',
        title: 'Task 2',
        category: 'Catering',
        phase: '1-2 months before',
        dueDate: '2026-10-01',
        completed: false, // overdue
        priority: 'high',
      },
      {
        id: '3',
        title: 'Task 3',
        category: 'Music',
        phase: 'Week of event',
        dueDate: '2026-10-14',
        completed: false, // upcoming
        priority: 'medium',
      },
      {
        id: '4',
        title: 'Task 4',
        category: 'Decor',
        phase: '2-4 weeks before',
        dueDate: '2026-10-20',
        completed: true,
        priority: 'medium',
      },
    ];

    it('computes correct counts and percentage', () => {
      const summary = calculateTimelineSummary(tasks, referenceDate);
      expect(summary.totalTasks).toBe(4);
      expect(summary.completedTasks).toBe(2);
      expect(summary.overdueTasks).toBe(1);
      expect(summary.upcomingTasks).toBe(1);
      expect(summary.completionPercentage).toBe(50);
    });

    it('handles empty task list gracefully', () => {
      const summary = calculateTimelineSummary([]);
      expect(summary.totalTasks).toBe(0);
      expect(summary.completionPercentage).toBe(0);
    });
  });

  describe('groupTasksByPhase', () => {
    it('groups tasks accurately into phase buckets', () => {
      const tasks: TaskItem[] = [
        {
          id: '1',
          title: 'A',
          category: 'C',
          phase: '3-6 months before',
          dueDate: '2026-05-01',
          completed: false,
          priority: 'low',
        },
        {
          id: '2',
          title: 'B',
          category: 'C',
          phase: 'Week of event',
          dueDate: '2026-10-10',
          completed: false,
          priority: 'low',
        },
      ];

      const groups = groupTasksByPhase(tasks);
      expect(groups['3-6 months before'].length).toBe(1);
      expect(groups['Week of event'].length).toBe(1);
      expect(groups['Event day'].length).toBe(0);
    });
  });
});
