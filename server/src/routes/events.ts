import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import {
  eventRequirementsSchema,
  generatedPlanSchema,
  updateEventSchema,
  EventRecord,
} from '../../../shared/src';
import {
  listAllEvents,
  getEventById,
  saveEvent,
  deleteEventById,
  clearAllEvents,
} from '../db';
import { generateEventPlan } from '../services/aiService';
import { aiRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Schema for POST /generate-plan body
const generatePlanRequestSchema = z.object({
  requirements: eventRequirementsSchema,
  demoMode: z.boolean().optional().default(false),
});

// Schema for POST / (save new event)
const saveEventRequestSchema = z.object({
  id: z.string().optional(),
  requirements: eventRequirementsSchema,
  plan: generatedPlanSchema,
});

/**
 * POST /api/events/generate-plan
 * Accepts validated event requirements and returns structured AI-generated plan.
 */
router.post(
  '/generate-plan',
  aiRateLimiter,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = generatePlanRequestSchema.parse(req.body);
      const plan = await generateEventPlan(parsed.requirements, parsed.demoMode);
      res.json({
        success: true,
        data: {
          plan,
          isDemo: plan.isDemoPlan,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/events
 * Lists all saved events summary.
 */
router.get('/', (_req: Request, res: Response, next: NextFunction) => {
  try {
    const events = listAllEvents();
    res.json({
      success: true,
      data: events,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/events/:id
 * Retrieves a single saved event by ID.
 */
router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const event = getEventById(id);
    if (!event) {
      res.status(404).json({
        success: false,
        error: {
          code: 'EVENT_NOT_FOUND',
          message: `Event with id '${id}' was not found.`,
        },
      });
      return;
    }

    res.json({
      success: true,
      data: event,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/events
 * Saves a new event record.
 */
router.post('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = saveEventRequestSchema.parse(req.body);
    const now = new Date().toISOString();
    const eventId = parsed.id || crypto.randomUUID();

    const record: EventRecord = {
      id: eventId,
      requirements: {
        ...parsed.requirements,
        id: eventId,
      },
      plan: parsed.plan,
      createdAt: now,
      updatedAt: now,
    };

    saveEvent(record);

    res.status(201).json({
      success: true,
      data: record,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/events/:id
 * Updates an existing event requirements or plan.
 */
router.put('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const existing = getEventById(id);

    if (!existing) {
      res.status(404).json({
        success: false,
        error: {
          code: 'EVENT_NOT_FOUND',
          message: `Event with id '${id}' was not found.`,
        },
      });
      return;
    }

    const parsed = updateEventSchema.parse(req.body);
    const now = new Date().toISOString();

    const updatedRecord: EventRecord = {
      id,
      requirements: parsed.requirements
        ? { ...parsed.requirements, id }
        : existing.requirements,
      plan: parsed.plan || existing.plan,
      createdAt: existing.createdAt,
      updatedAt: now,
    };

    saveEvent(updatedRecord);

    res.json({
      success: true,
      data: updatedRecord,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/events/:id
 * Deletes an event by ID.
 */
router.delete('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const success = deleteEventById(id);

    if (!success) {
      res.status(404).json({
        success: false,
        error: {
          code: 'EVENT_NOT_FOUND',
          message: `Event with id '${id}' was not found.`,
        },
      });
      return;
    }

    res.json({
      success: true,
      data: { id, deleted: true },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/events
 * Clear all events (data deletion workflow).
 */
router.delete('/', (_req: Request, res: Response, next: NextFunction) => {
  try {
    const count = clearAllEvents();
    res.json({
      success: true,
      data: { clearedCount: count },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
