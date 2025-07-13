import { safeGetStorageLocal, safeSetStorageLocal } from '../chrome';

export const DEFAULT_DEBOUNCE_MS = 5000;
export const eventTimestamps = new Map<string, number>();

export const MEASUREMENT_ID = 'G-134JGYJQP8';
export const API_SECRET = 'qgoNk4tuRGqmhLBojtYs2Q';
export const TELEMETRY_ENABLED_KEY = 'telemetry_enabled';

export const CLIENT_ID_KEY = 'ga_client_id';

export function cleanupOldEvents(maxAgeMs = 300000) {
  const now = Date.now();
  for (const [name, ts] of eventTimestamps) {
    if (now - ts > maxAgeMs) {
      eventTimestamps.delete(name);
    }
  }
}

export async function getClientId(): Promise<string> {
  const stored = await safeGetStorageLocal(CLIENT_ID_KEY);
  const existing = stored[CLIENT_ID_KEY] as string | undefined;
  if (existing) {
    return existing;
  }
  const id = crypto.randomUUID();
  safeSetStorageLocal({ [CLIENT_ID_KEY]: id });
  return id;
}

export async function getTelemetryEnabled(): Promise<boolean> {
  const stored = await safeGetStorageLocal(TELEMETRY_ENABLED_KEY);
  const value = stored[TELEMETRY_ENABLED_KEY];
  return value !== false;
}

export async function trackEvent(
  eventName: string,
  params: Record<string, any> = {},
  options: { force?: boolean; debounceMs?: number } = {}
): Promise<void> {
  if (!(await getTelemetryEnabled())) {
    cleanupOldEvents();
    return;
  }

  const now = Date.now();
  const { force = false, debounceMs = DEFAULT_DEBOUNCE_MS } = options;
  const lastTs = eventTimestamps.get(eventName) ?? 0;
  if (!force && now - lastTs < debounceMs) {
    cleanupOldEvents();
    return;
  }
  eventTimestamps.set(eventName, now);

  const clientId = await getClientId();
  const body = {
    client_id: clientId,
    events: [{ name: eventName, params }],
  };

  const url =
    `https://www.google-analytics.com/mp/collect?measurement_id=${MEASUREMENT_ID}` +
    `&api_secret=${API_SECRET}`;

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (error) {
    console.warn('[telemetry] failed to send event', error);
  } finally {
    cleanupOldEvents();
  }
}
