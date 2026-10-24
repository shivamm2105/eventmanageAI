import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../server/src/app';
import { getDatabase, closeDatabase, clearAllEvents } from '../server/src/db';
import { generateSamplePlan } from '../shared/src/samplePlans';

const app = createApp();

beforeAll(() => {
  // Ensure fresh database state
  getDatabase();
  clearAllEvents();
});

afterAll(() => {
  clearAllEvents();
  closeDatabase();
});

describe('Backend API Integration Tests', () => {
  describe('GET /api/health', () => {
    it('returns 200 with healthy database and service statuses', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.services.database).toBe('connected');
      expect(res.body.services.aiProvider.provider).toBe('Google Gemini');
      expect(typeof res.body.services.aiProvider.configured).toBe('boolean');
    });
  });

  describe('GET /api/system/status', () => {
    it('returns system status without revealing API keys', async () => {
      const res = await request(app).get('/api/system/status');
      expect(res.status).toBe(200);
      expect(res.body.appName).toContain('CelebrAI');
      expect(res.body.ai.geminiApiKey).toBeUndefined(); // Crucial: must never expose key
      expect(res.body.persistence.engine).toContain('SQLite');
    });
  });

  describe('POST /api/events/generate-plan', () => {
    it('rejects invalid payload with 400 and validation details', async () => {
      const res = await request(app)
        .post('/api/events/generate-plan')
        .send({
          requirements: {
            title: 'No', // Too short
            budget: -100, // Invalid
          },
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('successfully generates plan in Demo Mode', async () => {
      const validRequirements = {
        title: 'Maya 30th Birthday Bash',
        eventType: 'birthday',
        eventDate: '2026-11-15',
        city: 'Mumbai',
        guestCount: 60,
        budget: 150000,
        currency: 'INR',
        themePreference: 'Retro Disco Glam',
        venuePreference: 'banquet',
        dietaryPreferences: ['Vegetarian', 'Gluten-Free'],
        additionalInstructions: 'Include signature mocktails',
      };

      const res = await request(app)
        .post('/api/events/generate-plan')
        .send({
          requirements: validRequirements,
          demoMode: true, // Deterministic demo mode
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isDemo).toBe(true);
      expect(res.body.data.plan.budgetItems.length).toBeGreaterThan(0);
      expect(res.body.data.plan.timeline.length).toBeGreaterThan(0);
      expect(res.body.data.plan.vendorCategories.length).toBeGreaterThan(0);
      expect(res.body.data.plan.recommendedTheme.name).toBe('Retro Disco Glam');
    });
  });

  describe('CRUD Operations on /api/events', () => {
    let createdEventId = '';

    it('saves a new event and returns 201', async () => {
      const requirements = {
        title: 'Kavita & Dev Engagement',
        eventType: 'engagement' as const,
        eventDate: '2026-12-10',
        city: 'Delhi',
        guestCount: 120,
        budget: 600000,
        currency: 'INR',
        venuePreference: 'outdoor' as const,
        dietaryPreferences: ['Vegetarian'],
      };

      const plan = generateSamplePlan(requirements);

      const res = await request(app)
        .post('/api/events')
        .send({
          requirements,
          plan,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      createdEventId = res.body.data.id;
    });

    it('lists all saved events including the newly created event', async () => {
      const res = await request(app).get('/api/events');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);

      const found = res.body.data.find((e: any) => e.id === createdEventId);
      expect(found).toBeDefined();
      expect(found.title).toBe('Kavita & Dev Engagement');
    });

    it('retrieves the full event details by ID', async () => {
      const res = await request(app).get(`/api/events/${createdEventId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(createdEventId);
      expect(res.body.data.requirements.city).toBe('Delhi');
      expect(res.body.data.plan.budgetItems.length).toBeGreaterThan(0);
    });

    it('updates existing event budget and tasks', async () => {
      const getRes = await request(app).get(`/api/events/${createdEventId}`);
      const eventData = getRes.body.data;

      // User confirms actual expenditure for venue
      const updatedPlan = { ...eventData.plan };
      updatedPlan.budgetItems[0].actualAmount = 175000;
      // User checks first checklist item as completed
      updatedPlan.timeline[0].completed = true;

      const updateRes = await request(app)
        .put(`/api/events/${createdEventId}`)
        .send({
          plan: updatedPlan,
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.success).toBe(true);
      expect(updateRes.body.data.plan.budgetItems[0].actualAmount).toBe(175000);
      expect(updateRes.body.data.plan.timeline[0].completed).toBe(true);
    });

    it('deletes the event by ID', async () => {
      const deleteRes = await request(app).delete(`/api/events/${createdEventId}`);
      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.data.deleted).toBe(true);

      // Verify it is gone
      const checkRes = await request(app).get(`/api/events/${createdEventId}`);
      expect(checkRes.status).toBe(404);
    });
  });
});
