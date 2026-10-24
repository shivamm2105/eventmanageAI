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
  const res = await fetch('/api/events');
  if (!res.ok) {
    throw new Error(`Failed to fetch events: HTTP ${res.status}`);
  }
  const json = await res.json();
  return json.data || [];
}

export async function fetchEvent(id: string): Promise<EventRecord> {
  const res = await fetch(`/api/events/${encodeURIComponent(id)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to fetch event ${id}`);
  }
  const json = await res.json();
  return json.data;
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
  const res = await fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requirements, plan, id }),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || 'Failed to save event');
  }
  return json.data;
}

export async function updateExistingEvent(
  id: string,
  updates: { requirements?: EventRequirements; plan?: GeneratedPlan }
): Promise<EventRecord> {
  const res = await fetch(`/api/events/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || 'Failed to update event');
  }
  return json.data;
}

export async function deleteEvent(id: string): Promise<void> {
  const res = await fetch(`/api/events/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.error?.message || 'Failed to delete event');
  }
}

export async function clearAllEventsData(): Promise<number> {
  const res = await fetch('/api/events', {
    method: 'DELETE',
  });

  if (!res.ok) {
    throw new Error('Failed to clear events data');
  }

  const json = await res.json();
  return json.data?.clearedCount || 0;
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
