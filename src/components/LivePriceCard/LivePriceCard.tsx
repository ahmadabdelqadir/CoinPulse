import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import type { PricePoint } from '../../types';
import styles from './LivePriceCard.module.css';

interface LivePriceCardProps {
  symbol: string;
  name: string;
  image: string;
  currentPrice: number;
  priceHistory: PricePoint[];
}

const LivePriceCard = ({
  symbol,
  name,
  image,
  currentPrice,
  priceHistory,
}: LivePriceCardProps) => {
  const { priceChange, isPositive, chartData } = useMemo(() => {
    if (priceHistory.length < 2) {
      return { priceChange: 0, isPositive: true, chartData: [] };
    }

    const firstPrice = priceHistory[0].price;
    const lastPrice = priceHistory[priceHistory.length - 1].price;
    const change = ((lastPrice - firstPrice) / firstPrice) * 100;

    return {
      priceChange: change,
      isPositive: change >= 0,
      chartData: priceHistory.map((p) => ({ price: p.price })),
    };
  }, [priceHistory]);

  return (
    <motion.div layout className={styles.card}>
      <div className={styles.header}>
        <div className={styles.coinInfo}>
          <img src={image} alt={name} className={styles.coinIcon} />
          <div className={styles.coinDetails}>
            <h3>{symbol.toUpperCase()}</h3>
            <p>{name}</p>
          </div>
        </div>
        <div className={styles.priceInfo}>
          <p className={styles.currentPrice}>
            $
            {currentPrice.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 6,
            })}
          </p>
          <p className={`${styles.priceChange} ${isPositive ? styles.priceUp : styles.priceDown}`}>
            {isPositive ? '+' : ''}
            {priceChange.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Sparkline Chart */}
      <div className={styles.sparkline}>
        {chartData.length > 1 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Line
                type="monotone"
                dataKey="price"
                stroke={isPositive ? '#3fb950' : '#f85149'}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className={styles.sparklineEmpty}>
            <span className={styles.sparklineText}>Collecting data...</span>
          </div>
        )}
      </div>

      {/* Live Indicator */}
      <div className={styles.liveIndicator}>
        <span className={styles.liveDot}>
          <span className={styles.liveDotPing}></span>
          <span className={styles.liveDotCore}></span>
        </span>
        <span className={styles.liveText}>Live</span>
      </div>
    </motion.div>
  );
};

export default LivePriceCard;
