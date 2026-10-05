import { useEffect, useState } from 'react';
import { fetchLiveAqi, type LiveAqi } from './aqi';

export type LiveAqiState =
  | { status: 'loading' }
  | { status: 'ready'; data: LiveAqi }
  | { status: 'error' };

/**
 * Fetch live air quality for a coordinate, re-running when it changes and
 * cancelling the in-flight request if the coordinate changes first.
 */
export function useLiveAqi(lat: number, lng: number): LiveAqiState {
  const [state, setState] = useState<LiveAqiState>({ status: 'loading' });

  useEffect(() => {
    const ctrl = new AbortController();
    setState({ status: 'loading' });

    fetchLiveAqi(lat, lng, ctrl.signal).then((data) => {
      if (ctrl.signal.aborted) return;
      setState(data ? { status: 'ready', data } : { status: 'error' });
    });

    return () => ctrl.abort();
  }, [lat, lng]);

  return state;
}
