import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppSelector } from '../hooks';
import { AIRecommendationCard } from '../components';
import styles from './AIRecommendation.module.css';

const AIRecommendation = () => {
  const selectedCoins = useAppSelector((state) => state.selectedCoins.coins);

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
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h1 className={styles.emptyTitle}>AI Recommendations</h1>
            <p className={styles.emptyText}>
              Select coins from the Home page to get AI-powered investment
              analysis and recommendations.
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
              Select Coins
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
          <div className={styles.headerContent}>
            <div className={styles.headerIcon}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h1 className={styles.title}>AI Recommendations</h1>
          </div>
          <p className={styles.subtitle}>
            AI-powered analysis for your selected coins
          </p>
        </motion.div>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={styles.infoBanner}
        >
          <div className={styles.infoBannerContent}>
            <div className={styles.infoBannerIcon}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div>
              <h3 className={styles.infoBannerTitle}>How it works</h3>
              <p className={styles.infoBannerText}>
                Click "Get AI Recommendation" to analyze market data including
                price trends, market cap, and trading volume. Our AI will
                provide a BUY or DO NOT BUY recommendation with detailed
                reasoning.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Recommendation Cards */}
        <div className={styles.cardsList}>
          {selectedCoins.map((coin, index) => (
            <motion.div
              key={coin.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <AIRecommendationCard coin={coin} />
            </motion.div>
          ))}
        </div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={styles.disclaimer}
        >
          <div className={styles.disclaimerContent}>
            <svg
              className={styles.disclaimerIcon}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h3 className={styles.disclaimerTitle}>Important Disclaimer</h3>
              <p className={styles.disclaimerText}>
                The AI recommendations provided here are for educational and
                informational purposes only. They should not be considered as
                financial advice. Cryptocurrency investments carry significant
                risk, and you should always conduct your own research before
                making any investment decisions.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AIRecommendation;
