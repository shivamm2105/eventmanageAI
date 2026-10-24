import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { config } from './config';
import { EventRecord, EventRequirements, GeneratedPlan } from '../../shared/src';

let dbInstance: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (dbInstance) return dbInstance;

  const dbFilePath = path.resolve(process.cwd(), config.databasePath);
  const dbDir = path.dirname(dbFilePath);

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  dbInstance = new Database(dbFilePath);
  dbInstance.pragma('journal_mode = WAL');
  dbInstance.pragma('foreign_keys = ON');

  initSchema(dbInstance);

  return dbInstance;
}

function initSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      event_type TEXT NOT NULL,
      event_date TEXT NOT NULL,
      city TEXT NOT NULL,
      guest_count INTEGER NOT NULL,
      budget REAL NOT NULL,
      currency TEXT NOT NULL,
      requirements_json TEXT NOT NULL,
      plan_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_events_updated_at ON events(updated_at DESC);
    CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date ASC);
  `);
}

export interface EventListItem {
  id: string;
  title: string;
  eventType: string;
  eventDate: string;
  city: string;
  guestCount: number;
  budget: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export function listAllEvents(): EventListItem[] {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT id, title, event_type as eventType, event_date as eventDate,
           city, guest_count as guestCount, budget, currency,
           created_at as createdAt, updated_at as updatedAt
    FROM events
    ORDER BY updated_at DESC
  `);
  return stmt.all() as EventListItem[];
}

export function getEventById(id: string): EventRecord | null {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT id, requirements_json, plan_json, created_at, updated_at
    FROM events
    WHERE id = ?
  `);
  const row = stmt.get(id) as
    | {
        id: string;
        requirements_json: string;
        plan_json: string;
        created_at: string;
        updated_at: string;
      }
    | undefined;

  if (!row) return null;

  try {
    const requirements: EventRequirements = JSON.parse(row.requirements_json);
    const plan: GeneratedPlan = JSON.parse(row.plan_json);
    return {
      id: row.id,
      requirements,
      plan,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  } catch (err) {
    console.error('Failed to parse event JSON from database', err);
    return null;
  }
}

export function saveEvent(record: EventRecord): void {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO events (
      id, title, event_type, event_date, city, guest_count,
      budget, currency, requirements_json, plan_json, created_at, updated_at
    ) VALUES (
      @id, @title, @eventType, @eventDate, @city, @guestCount,
      @budget, @currency, @requirementsJson, @planJson, @createdAt, @updatedAt
    )
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      event_type = excluded.event_type,
      event_date = excluded.event_date,
      city = excluded.city,
      guest_count = excluded.guest_count,
      budget = excluded.budget,
      currency = excluded.currency,
      requirements_json = excluded.requirements_json,
      plan_json = excluded.plan_json,
      updated_at = excluded.updated_at
  `);

  stmt.run({
    id: record.id,
    title: record.requirements.title,
    eventType: record.requirements.eventType,
    eventDate: record.requirements.eventDate,
    city: record.requirements.city,
    guestCount: record.requirements.guestCount,
    budget: record.requirements.budget,
    currency: record.requirements.currency,
    requirementsJson: JSON.stringify(record.requirements),
    planJson: JSON.stringify(record.plan),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}

export function deleteEventById(id: string): boolean {
  const db = getDatabase();
  const stmt = db.prepare(`DELETE FROM events WHERE id = ?`);
  const result = stmt.run(id);
  return result.changes > 0;
}

export function clearAllEvents(): number {
  const db = getDatabase();
  const stmt = db.prepare(`DELETE FROM events`);
  const result = stmt.run();
  return result.changes;
}

export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
