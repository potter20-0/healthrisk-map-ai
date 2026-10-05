/**
 * Live air-quality via the Open-Meteo Air Quality API.
 *
 * Chosen because it needs no API key or sign-up, is HTTPS and CORS-enabled
 * (so the browser calls it directly — fits this client-only app), and returns
 * PM2.5 directly in µg/m³ — the same unit the rest of the app uses. Data is
 * hourly from the Copernicus CAMS model, refreshed in real time.
 *
 * Docs: https://open-meteo.com/en/docs/air-quality-api
 */

const ENDPOINT = 'https://air-quality-api.open-meteo.com/v1/air-quality';

export interface LiveAqi {
  /** PM2.5 concentration, µg/m³ */
  pm25: number;
  /** PM10 concentration, µg/m³ */
  pm10: number;
  /** US AQI index for the location */
  aqi: number;
  /** Local ISO timestamp of the reading */
  time: string;
  /** Human-readable data source */
  source: string;
}

/** No key required, so live data is always available. */
export const liveAqiEnabled = true;

interface OpenMeteoResponse {
  current?: {
    time?: string;
    pm2_5?: number;
    pm10?: number;
    us_aqi?: number;
  };
  error?: boolean;
  reason?: string;
}

/**
 * Fetch the current air quality for a coordinate. Resolves to null on any
 * failure (network error, timeout, malformed data) so callers can fall back
 * to sample data without special-casing.
 */
export async function fetchLiveAqi(
  lat: number,
  lng: number,
  signal?: AbortSignal,
): Promise<LiveAqi | null> {
  const timeout = new AbortController();
  const timer = setTimeout(() => timeout.abort(), 10_000);
  // Abort if either the caller cancels or the timeout fires.
  signal?.addEventListener('abort', () => timeout.abort(), { once: true });

  const url =
    `${ENDPOINT}?latitude=${lat}&longitude=${lng}` +
    `&current=pm2_5,pm10,us_aqi&timezone=Asia%2FBangkok`;

  try {
    const res = await fetch(url, { signal: timeout.signal });
    if (!res.ok) return null;

    const json = (await res.json()) as OpenMeteoResponse;
    const c = json.current;
    if (json.error || !c || typeof c.pm2_5 !== 'number') return null;

    return {
      pm25: Math.round(c.pm2_5),
      pm10: typeof c.pm10 === 'number' ? Math.round(c.pm10) : 0,
      aqi: typeof c.us_aqi === 'number' ? Math.round(c.us_aqi) : 0,
      time: c.time ?? new Date().toISOString(),
      source: 'Open-Meteo · CAMS',
    };
  } catch {
    return null; // aborted or network failure — caller uses sample data
  } finally {
    clearTimeout(timer);
  }
}
