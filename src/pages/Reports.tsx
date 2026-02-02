import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppSelector } from '../hooks';
import { useLivePrices } from '../hooks/useLivePrices';
import { CandlestickChart, LivePriceCard } from '../components';
import styles from './Reports.module.css';

const Reports = () => {
  const selectedCoins = useAppSelector((state) => state.selectedCoins.coins);
  const { priceHistory, currentPrices, lastUpdated } = useAppSelector(
    (state) => state.reports
  );

  // Get symbols for selected coins
  const symbols = useMemo(
    () => selectedCoins.map((coin) => coin.symbol),
    [selectedCoins]
  );

  // Start live price polling
  useLivePrices(symbols, 1000);

  if (selectedCoins.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.emptyState}
          >
            <div className={styles.emptyIcon}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h1 className={styles.emptyTitle}>Real-Time Reports</h1>
            <p className={styles.emptyText}>
              Select coins from the Home page to see their live price updates
              and candlestick charts here.
            </p>
            <Link to="/" className={styles.emptyBtn}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Go to Home Page
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={styles.header}
        >
          <div className={styles.headerRow}>
            <div>
              <h1 className={styles.title}>Real-Time Reports</h1>
              <p className={styles.subtitle}>
                Live price tracking for your selected coins
              </p>
            </div>
            <div className={styles.liveIndicator}>
              <span className={styles.liveDot}>
                <span className={styles.liveDotPing}></span>
                <span className={styles.liveDotCore}></span>
              </span>
              <span>
                {lastUpdated
                  ? `Last updated: ${new Date(lastUpdated).toLocaleTimeString()}`
                  : 'Connecting...'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Candlestick Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={styles.chartsSection}
        >
          <CandlestickChart priceHistory={priceHistory} selectedCoins={selectedCoins} />
        </motion.div>

        {/* Individual Coin Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className={styles.sectionTitle}>Live Prices</h2>
          <div className={styles.pricesGrid}>
            {selectedCoins.map((coin, index) => {
              const upperSymbol = coin.symbol.toUpperCase();
              return (
                <motion.div
                  key={coin.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                >
                  <LivePriceCard
                    symbol={coin.symbol}
                    name={coin.name}
                    image={coin.image}
                    currentPrice={currentPrices[upperSymbol] || 0}
                    priceHistory={priceHistory[upperSymbol] || []}
                  />
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={styles.infoBanner}
        >
          <div className={styles.infoBannerContent}>
            <svg
              className={styles.infoIcon}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className={styles.infoText}>
                Live prices: CryptoCompare (1 req/sec). Candlesticks: 1m–1h from CryptoCompare, 1D–30D from CoinGecko OHLC.
              </p>
              <p className={styles.infoSubtext}>
                Data may be slightly delayed. For trading, please use official exchange data.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Reports;
