import { useMemo, useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { fetchChartOHLC } from '../../store/slices/reportsSlice';
import type { ChartInterval } from '../../store/slices/reportsSlice';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { PriceHistory, OHLCPoint } from '../../types';
import type { SelectedCoin } from '../../types';
import styles from './CandlestickChart.module.css';

interface CandlestickChartProps {
  priceHistory: PriceHistory;
  selectedCoins: SelectedCoin[];
}

interface CandleData {
  time: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  isUp: boolean;
  upperWickRange: [number, number];
  bodyRange: [number, number];
  lowerWickRange: [number, number];
}

const INTERVAL_OPTIONS: { label: string; value: ChartInterval }[] = [
  { label: '1m', value: '1m' },
  { label: '5m', value: '5m' },
  { label: '15m', value: '15m' },
  { label: '30m', value: '30m' },
  { label: '1h', value: '1h' },
  { label: '1D', value: '1d' },
  { label: '7D', value: '7d' },
  { label: '14D', value: '14d' },
  { label: '30D', value: '30d' },
];

function formatCandleTime(timestamp: number, interval: ChartInterval): string {
  const d = new Date(timestamp);
  if (interval === '1m' || interval === '5m') {
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
  if (interval === '15m' || interval === '30m' || interval === '1h') {
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function ohlcToCandleData(ohlc: OHLCPoint[], interval: ChartInterval): CandleData[] {
  return ohlc.map((c) => {
    const isUp = c.close >= c.open;
    const bodyLow = Math.min(c.open, c.close);
    const bodyHigh = Math.max(c.open, c.close);
    const range = c.high - c.low;
    let actualBodyLow = bodyLow;
    let actualBodyHigh = bodyHigh;
    if (range > 0 && bodyHigh - bodyLow < range * 0.08) {
      const minBody = range * 0.08;
      const half = minBody / 2;
      actualBodyLow = Math.max(c.low, (c.open + c.close) / 2 - half);
      actualBodyHigh = Math.min(c.high, (c.open + c.close) / 2 + half);
    }
    return {
      time: formatCandleTime(c.timestamp, interval),
      timestamp: c.timestamp,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
      isUp,
      lowerWickRange: [c.low, actualBodyLow],
      bodyRange: [actualBodyLow, actualBodyHigh],
      upperWickRange: [actualBodyHigh, c.high],
    };
  });
}

function formatPriceAxis(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}k`;
  if (value >= 1) return `$${value.toFixed(2)}`;
  return `$${value.toFixed(4)}`;
}

function formatPriceTooltip(value: number): string {
  if (value >= 1_000) return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (value < 1) return `$${value.toFixed(4)}`;
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
}

const CandlestickChart = ({ priceHistory, selectedCoins }: CandlestickChartProps) => {
  const dispatch = useAppDispatch();
  const { ohlcData, ohlcLoading } = useAppSelector((state) => state.reports);

  const [selectedCoinId, setSelectedCoinId] = useState<string>('');
  const [selectedInterval, setSelectedInterval] = useState<ChartInterval>('5m');

  const selectedCoin = useMemo(
    () => selectedCoins.find((c) => c.id === selectedCoinId),
    [selectedCoins, selectedCoinId]
  );

  useEffect(() => {
    if (selectedCoins.length > 0 && !selectedCoinId) {
      setSelectedCoinId(selectedCoins[0].id);
    }
  }, [selectedCoins, selectedCoinId]);

  useEffect(() => {
    if (selectedCoinId && selectedCoin?.symbol && selectedInterval) {
      dispatch(fetchChartOHLC({
        coinId: selectedCoinId,
        symbol: selectedCoin.symbol,
        interval: selectedInterval,
      }));
    }
  }, [dispatch, selectedCoinId, selectedCoin?.symbol, selectedInterval]);

  const dataKey = useMemo(() => (selectedCoinId && selectedInterval ? `${selectedCoinId}-${selectedInterval}` : ''), [selectedCoinId, selectedInterval]);

  const { candleData, lineData, hasOHLC, isLoadingOHLC } = useMemo(() => {
    if (!selectedCoinId) {
      return { candleData: [], lineData: [], hasOHLC: false, isLoadingOHLC: false };
    }

    const ohlc = dataKey ? ohlcData[dataKey] : undefined;
    const loading = dataKey ? ohlcLoading[dataKey] : false;

    if (ohlc?.data?.length) {
      const candles = ohlcToCandleData(ohlc.data, ohlc.interval);
      return {
        candleData: candles,
        lineData: [],
        hasOHLC: true,
        isLoadingOHLC: !!loading,
      };
    }

    const symbol = selectedCoins.find((c) => c.id === selectedCoinId)?.symbol?.toUpperCase();
    const history = symbol ? (priceHistory[symbol] || []) : [];
    const lineData = history.map((p) => ({
      time: new Date(p.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      price: p.price,
      timestamp: p.timestamp,
    }));

    return {
      candleData: [],
      lineData,
      hasOHLC: false,
      isLoadingOHLC: !!loading,
    };
  }, [selectedCoinId, selectedCoins, dataKey, ohlcData, ohlcLoading, priceHistory]);

  const yDomain = useMemo(() => {
    if (candleData.length > 0) {
      const prices = candleData.flatMap((c) => [c.high, c.low]);
      let min = Math.min(...prices);
      let max = Math.max(...prices);
      const mid = (min + max) / 2;
      const range = max - min;
      const minRange = Math.max(Math.abs(mid) * 0.002, range * 0.1);
      const pad = Math.max(range * 0.08, minRange * 0.5);
      return [min - pad, max + pad];
    }
    if (lineData.length > 0) {
      const prices = lineData.map((d) => d.price);
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      const pad = (max - min) * 0.1 || 1;
      return [min - pad, max + pad];
    }
    return [0, 100];
  }, [candleData, lineData]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const data = payload[0]?.payload;
    if (!data) return null;

    if (data.price !== undefined) {
      return (
        <div className={styles.tooltip}>
          <div className={styles.tooltipLabel}>{data.time}</div>
          <div className={styles.tooltipRow}>
            <span className={styles.tooltipKey}>Price:</span>
            <span className={styles.tooltipValue}>{formatPriceTooltip(data.price)}</span>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.tooltip}>
        <div className={styles.tooltipLabel}>{data.time}</div>
        <div className={styles.tooltipRow}>
          <span className={styles.tooltipKey}>O</span>
          <span className={styles.tooltipValue}>{formatPriceTooltip(data.open)}</span>
        </div>
        <div className={styles.tooltipRow}>
          <span className={styles.tooltipKey}>H</span>
          <span className={styles.tooltipValue}>{formatPriceTooltip(data.high)}</span>
        </div>
        <div className={styles.tooltipRow}>
          <span className={styles.tooltipKey}>L</span>
          <span className={styles.tooltipValue}>{formatPriceTooltip(data.low)}</span>
        </div>
        <div className={styles.tooltipRow}>
          <span className={styles.tooltipKey}>C</span>
          <span className={`${styles.tooltipValue} ${data.isUp ? styles.tooltipUp : styles.tooltipDown}`}>
            {formatPriceTooltip(data.close)}
          </span>
        </div>
      </div>
    );
  };

  if (selectedCoins.length === 0) {
    return (
      <div className={styles.chartContainer}>
        <div className={styles.emptyState}>
          <svg className={styles.emptyIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className={styles.emptyText}>Select coins to see price chart</span>
        </div>
      </div>
    );
  }

  const showCandles = hasOHLC && candleData.length > 0;
  const showLine = lineData.length > 0 && !showCandles;

  return (
    <div className={styles.chartContainer}>
      <div className={styles.chartHeader}>
        <h3 className={styles.chartTitle}>
          {showCandles ? 'OHLC Candlestick' : 'Live Price'}
        </h3>
        {showCandles && (
          <div className={styles.chartLegend}>
            <span className={`${styles.legendDot} ${styles.legendGreen}`} />
            <span className={styles.legendText}>Up</span>
            <span className={`${styles.legendDot} ${styles.legendRed}`} />
            <span className={styles.legendText}>Down</span>
          </div>
        )}
      </div>

      <div className={styles.controlsRow}>
        <div className={styles.coinTabs}>
          {selectedCoins.map((coin) => (
            <button
              key={coin.id}
              onClick={() => setSelectedCoinId(coin.id)}
              className={`${styles.coinTab} ${selectedCoinId === coin.id ? styles.coinTabActive : ''}`}
            >
              <img src={coin.image} alt={coin.name} className={styles.coinTabIcon} />
              {coin.symbol.toUpperCase()}
            </button>
          ))}
        </div>
        <div className={styles.intervalTabs}>
          {INTERVAL_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSelectedInterval(opt.value)}
              className={`${styles.intervalTab} ${selectedInterval === opt.value ? styles.intervalTabActive : ''}`}
              disabled={isLoadingOHLC}
              title={opt.value.length <= 2 ? `${opt.label} candles (CryptoCompare)` : `${opt.label} (CoinGecko)`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {isLoadingOHLC && (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner} />
          <span className={styles.loadingText}>Loading OHLC data...</span>
        </div>
      )}

      {!showCandles && !showLine && !isLoadingOHLC && (
        <div className={styles.loadingState}>
          <span className={styles.loadingText}>Select a coin and timeframe. 1m–1h: CryptoCompare · 1D–30D: CoinGecko.</span>
        </div>
      )}

      {showLine && (
        <div className={styles.chartWrapper}>
          <div className={styles.chartInfo}>Live tick data (switch to OHLC for candlesticks)</div>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={lineData} margin={{ top: 20, right: 24, left: 12, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" className={styles.grid} />
              <XAxis dataKey="time" className={styles.axis} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis
                domain={yDomain}
                className={styles.axis}
                width={52}
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => formatPriceAxis(Number(v))}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="price" stroke="var(--chart-line)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {showCandles && (
        <div className={styles.chartWrapper}>
          <ResponsiveContainer width="100%" height={420}>
            <ComposedChart
              data={candleData}
              margin={{ top: 16, right: 16, left: 56, bottom: 20 }}
              barCategoryGap={4}
              barGap={2}
            >
              <CartesianGrid strokeDasharray="2 2" className={styles.grid} vertical={false} />
              <XAxis
                dataKey="time"
                className={styles.axis}
                fontSize={11}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                tick={{ fill: 'var(--text-muted)' }}
              />
              <YAxis
                domain={yDomain}
                className={styles.axis}
                width={56}
                tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 500 }}
                tickFormatter={(v) => formatPriceAxis(Number(v))}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(88, 166, 255, 0.06)' }} />
              <Bar dataKey="lowerWickRange" barSize={6} isAnimationActive={false} radius={0}>
                {candleData.map((entry, i) => (
                  <Cell key={`l-${i}`} fill={entry.isUp ? 'var(--candle-up)' : 'var(--candle-down)'} />
                ))}
              </Bar>
              <Bar dataKey="bodyRange" barSize={6} isAnimationActive={false} radius={1} minPointSize={1}>
                {candleData.map((entry, i) => (
                  <Cell
                    key={`b-${i}`}
                    fill={entry.isUp ? 'var(--candle-up)' : 'var(--candle-down)'}
                    stroke={entry.isUp ? 'var(--candle-up-border)' : 'var(--candle-down-border)'}
                    strokeWidth={1}
                  />
                ))}
              </Bar>
              <Bar dataKey="upperWickRange" barSize={6} isAnimationActive={false} radius={0}>
                {candleData.map((entry, i) => (
                  <Cell key={`u-${i}`} fill={entry.isUp ? 'var(--candle-up)' : 'var(--candle-down)'} />
                ))}
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default CandlestickChart;
