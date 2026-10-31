import {
  EventRecord,
  EventRequirements,
  GeneratedPlan,
} from '@celebrai/shared';

export interface HealthResponse {
  status: string;
  version: string;
  timestamp: string;
  environment: string;
  services: {
    database: string;
    aiProvider: {
      provider: string;
      configured: boolean;
      model: string;
    };
  };
}

export interface SystemStatusResponse {
  appName: string;
  environment: string;
  uptimeSeconds: number;
  ai: {
    isConfigured: boolean;
    model: string;
    rateLimitMax: number;
    rateLimitWindowMinutes: number;
  };
  persistence: {
    engine: string;
    localDatabase: boolean;
  };
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

const LOCAL_STORAGE_KEY = 'celebrai_events_cache';

function getLocalEvents(): EventRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setLocalEvents(events: EventRecord[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(events));
  } catch (e) {
    console.warn('LocalStorage save failed:', e);
  }
}

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch('/api/health');
  if (!res.ok) {
    throw new Error(`Health check failed: HTTP ${res.status}`);
  }
  return res.json();
}

export async function fetchSystemStatus(): Promise<SystemStatusResponse> {
  const res = await fetch('/api/system/status');
  if (!res.ok) {
    throw new Error(`Status check failed: HTTP ${res.status}`);
  }
  return res.json();
}

export async function fetchEvents(): Promise<EventListItem[]> {
  try {
    const res = await fetch('/api/events');
    if (res.ok) {
      const json = await res.json();
      const serverList: EventListItem[] = json.data || [];
      // If server has events, update local cache list
      if (serverList.length > 0) {
        return serverList;
      }
    }
  } catch (err) {
    console.warn('Network fetch events failed, falling back to local cache', err);
  }

  // Fallback to local storage
  const locals = getLocalEvents();
  return locals.map((rec) => ({
    id: rec.id,
    title: rec.requirements.title,
    eventType: rec.requirements.eventType,
    eventDate: rec.requirements.eventDate,
    city: rec.requirements.city,
    guestCount: rec.requirements.guestCount,
    budget: rec.requirements.budget,
    currency: rec.requirements.currency,
    createdAt: rec.createdAt,
    updatedAt: rec.updatedAt,
  }));
}

export async function fetchEvent(id: string): Promise<EventRecord> {
  try {
    const res = await fetch(`/api/events/${encodeURIComponent(id)}`);
    if (res.ok) {
      const json = await res.json();
      const rec = json.data;
      if (rec) {
        // Cache single record locally
        const list = getLocalEvents().filter((e) => e.id !== rec.id);
        list.unshift(rec);
        setLocalEvents(list);
        return rec;
      }
    }
  } catch (err) {
    console.warn(`Failed to fetch event ${id} from server, checking local cache`, err);
  }

  const found = getLocalEvents().find((e) => e.id === id);
  if (found) return found;
  throw new Error(`Celebration event ${id} not found.`);
}

export async function generateAiPlan(
  requirements: EventRequirements,
  demoMode: boolean = false
): Promise<{ plan: GeneratedPlan; isDemo: boolean }> {
  const res = await fetch('/api/events/generate-plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requirements, demoMode }),
  });

  const json = await res.json();

  if (!res.ok || !json.success) {
    const message =
      json.error?.message ||
      (json.error?.details
        ? json.error.details.map((d: any) => `${d.path}: ${d.message}`).join(', ')
        : 'Failed to generate plan.');
    throw new Error(message);
  }

  return json.data;
}

export async function saveNewEvent(
  requirements: EventRequirements,
  plan: GeneratedPlan,
  id?: string
): Promise<EventRecord> {
  const localFallbackRecord: EventRecord = {
    id: id || `local-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    requirements,
    plan,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requirements, plan, id }),
    });

    const json = await res.json();
    if (res.ok && json.success && json.data) {
      const saved: EventRecord = json.data;
      const list = getLocalEvents().filter((e) => e.id !== saved.id);
      list.unshift(saved);
      setLocalEvents(list);
      return saved;
    }
  } catch (err) {
    console.warn('Server save failed, storing in client local persistence', err);
  }

  // Store in local storage fallback
  const list = getLocalEvents().filter((e) => e.id !== localFallbackRecord.id);
  list.unshift(localFallbackRecord);
  setLocalEvents(list);
  return localFallbackRecord;
}

export async function updateExistingEvent(
  id: string,
  updates: { requirements?: EventRequirements; plan?: GeneratedPlan }
): Promise<EventRecord> {
  try {
    const res = await fetch(`/api/events/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    const json = await res.json();
    if (res.ok && json.success && json.data) {
      const saved = json.data;
      const list = getLocalEvents().filter((e) => e.id !== id);
      list.unshift(saved);
      setLocalEvents(list);
      return saved;
    }
  } catch (err) {
    console.warn(`Server update failed for ${id}, updating local cache`, err);
  }

  // Update in local cache
  const list = getLocalEvents();
  const index = list.findIndex((e) => e.id === id);
  if (index !== -1) {
    const current = list[index];
    const updated: EventRecord = {
      ...current,
      requirements: updates.requirements || current.requirements,
      plan: updates.plan || current.plan,
      updatedAt: new Date().toISOString(),
    };
    list[index] = updated;
    setLocalEvents(list);
    return updated;
  }

  throw new Error('Failed to update event record');
}

export async function deleteEvent(id: string): Promise<void> {
  try {
    await fetch(`/api/events/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.warn(`Server delete failed for ${id}`, err);
  }

  const list = getLocalEvents().filter((e) => e.id !== id);
  setLocalEvents(list);
}

export async function clearAllEventsData(): Promise<number> {
  let count = 0;
  try {
    const res = await fetch('/api/events', {
      method: 'DELETE',
    });
    if (res.ok) {
      const json = await res.json();
      count = json.data?.clearedCount || 0;
    }
  } catch (err) {
    console.warn('Server clear failed', err);
  }

  const localCount = getLocalEvents().length;
  setLocalEvents([]);
  return Math.max(count, localCount);
}

export async function configureAiApiKey(
  apiKey: string,
  model?: string
): Promise<{ success: boolean; message: string; configured: boolean; model: string }> {
  const res = await fetch('/api/system/configure-ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey, model }),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || 'Failed to verify and configure Gemini API key.');
  }
  return json;
}

export async function disconnectAi(): Promise<{ success: boolean; message: string; configured: boolean }> {
  const res = await fetch('/api/system/disconnect-ai', {
    method: 'POST',
  });

  const json = await res.json();
  return json;
}
