import { describe, it, expect } from 'vitest';
import {
  eventRequirementsSchema,
  generatedPlanSchema,
  budgetItemSchema,
  taskItemSchema,
} from '../shared/src/schemas';

describe('Zod Validation Schemas', () => {
  describe('eventRequirementsSchema', () => {
    it('accepts valid event requirements payload', () => {
      const validPayload = {
        title: 'Ananya & Rohan Wedding',
        eventType: 'wedding',
        eventDate: '2026-11-20',
        city: 'Jaipur',
        guestCount: 250,
        budget: 1500000,
        currency: 'INR',
        venuePreference: 'banquet',
        dietaryPreferences: ['Vegetarian', 'Jain'],
        additionalInstructions: 'Include fireworks if allowed',
      };

      const result = eventRequirementsSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it('rejects title shorter than 3 characters', () => {
      const payload = {
        title: 'Hi',
        eventType: 'birthday',
        eventDate: '2026-12-01',
        city: 'Mumbai',
        guestCount: 50,
        budget: 50000,
        currency: 'INR',
      };

      const result = eventRequirementsSchema.safeParse(payload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('at least 3 characters');
      }
    });

    it('rejects negative or zero budget', () => {
      const payload = {
        title: 'Community Gathering',
        eventType: 'community',
        eventDate: '2026-12-01',
        city: 'Bangalore',
        guestCount: 100,
        budget: 0,
        currency: 'INR',
      };

      const result = eventRequirementsSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });

    it('rejects invalid guest count', () => {
      const payload = {
        title: 'Community Gathering',
        eventType: 'community',
        eventDate: '2026-12-01',
        city: 'Bangalore',
        guestCount: 0,
        budget: 50000,
        currency: 'INR',
      };

      const result = eventRequirementsSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });

    it('rejects invalid date format', () => {
      const payload = {
        title: 'Community Gathering',
        eventType: 'community',
        eventDate: '20-12-2026', // wrong format
        city: 'Bangalore',
        guestCount: 50,
        budget: 50000,
        currency: 'INR',
      };

      const result = eventRequirementsSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });

  describe('budgetItemSchema', () => {
    it('validates budget item with positive or zero amounts', () => {
      const item = {
        id: 'b-1',
        category: 'Venue',
        estimatedAmount: 50000,
        actualAmount: 48000,
      };
      const result = budgetItemSchema.safeParse(item);
      expect(result.success).toBe(true);
    });

    it('rejects negative amount', () => {
      const item = {
        id: 'b-1',
        category: 'Venue',
        estimatedAmount: -100,
      };
      const result = budgetItemSchema.safeParse(item);
      expect(result.success).toBe(false);
    });
  });

  describe('taskItemSchema', () => {
    it('validates task item correctly', () => {
      const task = {
        id: 't-1',
        title: 'Order invitations',
        category: 'Stationery',
        phase: '2-4 weeks before',
        dueDate: '2026-10-15',
        completed: false,
        priority: 'high',
      };
      const result = taskItemSchema.safeParse(task);
      expect(result.success).toBe(true);
    });

    it('rejects task with invalid phase', () => {
      const task = {
        id: 't-1',
        title: 'Order invitations',
        category: 'Stationery',
        phase: 'someday-in-future',
        dueDate: '2026-10-15',
      };
      const result = taskItemSchema.safeParse(task);
      expect(result.success).toBe(false);
    });
  });
});
