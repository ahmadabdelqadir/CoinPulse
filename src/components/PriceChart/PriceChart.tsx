import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { PriceHistory } from '../../types';

interface PriceChartProps {
  priceHistory: PriceHistory;
  symbols: string[];
}

const COLORS = [
  '#22d3ee', // cyan
  '#8b5cf6', // purple
  '#f97316', // orange
  '#10b981', // emerald
  '#f43f5e', // rose
];

const PriceChart = ({ priceHistory, symbols }: PriceChartProps) => {
  const chartData = useMemo(() => {
    if (symbols.length === 0) return [];

    // Get all timestamps from all coins
    const allTimestamps = new Set<number>();
    symbols.forEach((symbol) => {
      const upperSymbol = symbol.toUpperCase();
      priceHistory[upperSymbol]?.forEach((point) => {
        allTimestamps.add(point.timestamp);
      });
    });

    // Sort timestamps
    const sortedTimestamps = Array.from(allTimestamps).sort((a, b) => a - b);

    // Build chart data
    return sortedTimestamps.map((timestamp) => {
      const dataPoint: Record<string, number | string> = {
        time: new Date(timestamp).toLocaleTimeString(),
        timestamp,
      };

      symbols.forEach((symbol) => {
        const upperSymbol = symbol.toUpperCase();
        const history = priceHistory[upperSymbol];
        const point = history?.find((p) => p.timestamp === timestamp);
        if (point) {
          dataPoint[upperSymbol] = point.price;
        }
      });

      return dataPoint;
    });
  }, [priceHistory, symbols]);

  if (symbols.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-crypto-card rounded-xl border border-crypto-border">
        <p className="text-gray-500">Select coins to see price chart</p>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-crypto-card rounded-xl border border-crypto-border">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-crypto-accent border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-500">Loading price data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-crypto-card rounded-xl border border-crypto-border p-4">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
          <XAxis
            dataKey="time"
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
          />
          <YAxis
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            tickFormatter={(value) =>
              value >= 1000 ? `$${(value / 1000).toFixed(1)}k` : `$${value.toFixed(2)}`
            }
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#161b22',
              border: '1px solid #30363d',
              borderRadius: '8px',
              padding: '12px',
            }}
            labelStyle={{ color: '#9ca3af' }}
            formatter={(value) => {
              if (typeof value === 'number') {
                return `$${value.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6,
                })}`;
              }
              return value;
            }}
          />
          <Legend
            wrapperStyle={{
              paddingTop: '20px',
            }}
          />
          {symbols.map((symbol, index) => (
            <Line
              key={symbol}
              type="monotone"
              dataKey={symbol.toUpperCase()}
              stroke={COLORS[index % COLORS.length]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, strokeWidth: 2 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceChart;
