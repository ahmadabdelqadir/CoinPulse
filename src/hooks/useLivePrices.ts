import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from './index';
import { fetchLivePrices, setPolling } from '../store/slices/reportsSlice';

/**
 * Polls live prices: ONE request per interval for ALL selected coins (e.g. 5 coins = 1 request/sec).
 */
export const useLivePrices = (symbols: string[], intervalMs: number = 1000) => {
  const dispatch = useAppDispatch();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const symbolsRef = useRef(symbols);
  symbolsRef.current = symbols;
  const isPolling = useAppSelector((state) => state.reports.isPolling);

  useEffect(() => {
    if (symbols.length === 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        dispatch(setPolling(false));
      }
      return;
    }

    // Single request for all symbols (e.g. BTC,ETH,DOGE in one call)
    dispatch(fetchLivePrices(symbols));
    dispatch(setPolling(true));

    // One request per interval for all coins
    intervalRef.current = setInterval(() => {
      dispatch(fetchLivePrices(symbolsRef.current));
    }, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        dispatch(setPolling(false));
      }
    };
  }, [dispatch, symbols.length, symbols.join(','), intervalMs]);

  return isPolling;
};
