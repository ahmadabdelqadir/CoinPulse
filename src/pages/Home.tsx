import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../hooks';
import { fetchCoins } from '../store/slices/coinsSlice';
import { HeroSection, CoinCard, LoadingSpinner } from '../components';
import styles from './Home.module.css';

const Home = () => {
  const dispatch = useAppDispatch();
  const { filteredCoins, loading, error, lastFetched } = useAppSelector(
    (state) => state.coins
  );
  const selectedCoins = useAppSelector((state) => state.selectedCoins.coins);

  useEffect(() => {
    // Fetch coins if not already fetched or if data is stale (older than 5 minutes)
    const STALE_TIME = 5 * 60 * 1000;
    if (!lastFetched || Date.now() - lastFetched > STALE_TIME) {
      dispatch(fetchCoins());
    }
  }, [dispatch, lastFetched]);

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <HeroSection />

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Section Header */}
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Popular Cryptocurrencies</h2>
            <p className={styles.sectionSubtitle}>
              Select up to 5 coins to track in real-time
            </p>
          </div>
          <div className={styles.selectionInfo}>
            <div className={styles.selectionCount}>
              <span className={styles.selectionLabel}>Selected:</span>
              <span
                className={`${styles.selectionValue} ${
                  selectedCoins.length >= 5
                    ? styles.selectionFull
                    : styles.selectionNormal
                }`}
              >
                {selectedCoins.length}/5
              </span>
            </div>
            {selectedCoins.length > 0 && (
              <div className={styles.selectedCoinsAvatars}>
                {selectedCoins.map((coin) => (
                  <img
                    key={coin.id}
                    src={coin.image}
                    alt={coin.name}
                    className={styles.coinAvatar}
                    title={coin.name}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className={styles.loadingContainer}>
            <LoadingSpinner size="lg" text="Loading cryptocurrencies..." />
          </div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.errorContainer}
          >
            <svg
              className={styles.errorIcon}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className={styles.errorTitle}>Failed to load data</h3>
            <p className={styles.errorMessage}>{error}</p>
            <button
              onClick={() => dispatch(fetchCoins())}
              className={styles.retryBtn}
            >
              Try Again
            </button>
          </motion.div>
        )}

        {/* Coins Grid */}
        {!loading && !error && filteredCoins.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={styles.coinsGrid}
          >
            {filteredCoins.map((coin, index) => (
              <motion.div
                key={coin.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.02, 0.5) }}
              >
                <CoinCard coin={coin} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* No Results */}
        {!loading && !error && filteredCoins.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.noResults}
          >
            <svg
              className={styles.noResultsIcon}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <h3 className={styles.noResultsTitle}>No coins found</h3>
            <p className={styles.noResultsText}>
              Try adjusting your search query
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Home;
