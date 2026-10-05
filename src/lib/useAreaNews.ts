import { useEffect, useState } from 'react';
import type { Village } from '../data';
import { areaNewsEnabled, fetchAreaNews, type AreaNews } from './news';

export type AreaNewsState =
  | { status: 'disabled' }
  | { status: 'loading' }
  | { status: 'ready'; data: AreaNews }
  | { status: 'error' };

/**
 * Fetch and analyze local-area news for a village, re-running when the
 * province changes. Stays "disabled" when no API key is configured.
 */
export function useAreaNews(village: Village): AreaNewsState {
  const [state, setState] = useState<AreaNewsState>(
    areaNewsEnabled ? { status: 'loading' } : { status: 'disabled' },
  );

  useEffect(() => {
    if (!areaNewsEnabled) {
      setState({ status: 'disabled' });
      return;
    }

    const ctrl = new AbortController();
    setState({ status: 'loading' });

    fetchAreaNews(village, ctrl.signal).then((data) => {
      if (ctrl.signal.aborted) return;
      setState(data ? { status: 'ready', data } : { status: 'error' });
    });

    return () => ctrl.abort();
    // Province drives the query; re-running per id would waste calls.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [village.province]);

  return state;
}
