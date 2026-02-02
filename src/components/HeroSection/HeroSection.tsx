import { motion } from 'framer-motion';
import styles from './HeroSection.module.css';

/**
 * HeroSection - Landing section with CSS parallax background image.
 * Uses background-attachment: fixed for true parallax scrolling.
 */
const HeroSection = () => {
  return (
    <div className={styles.hero}>
      {/* Overlay elements */}
      <div className={styles.background}>
        <div className={styles.gridPattern} />

        {/* Floating Orbs */}
        <motion.div
          animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className={`${styles.orb} ${styles.orbCyan}`}
        />
        <motion.div
          animate={{ x: [0, -100, 0], y: [0, 50, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className={`${styles.orb} ${styles.orbPurple}`}
        />
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, 100, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className={`${styles.orb} ${styles.orbPink}`}
        />
      </div>

      {/* Content */}
      <div className={styles.content}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className={styles.textContent}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className={styles.badge}
          >
            <span className={styles.liveDot}>
              <span className={styles.liveDotPing}></span>
              <span className={styles.liveDotCore}></span>
            </span>
            <span className={styles.badgeText}>Live Market Data</span>
          </motion.div>

          {/* Title */}
          <h1 className={styles.title}>
            <span className={styles.titleGradient}>CoinPulse</span>
          </h1>

          {/* Subtitle */}
          <p className={styles.subtitle}>
            Track, analyze, and get AI-powered insights for your favorite
            cryptocurrencies in real-time
          </p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={styles.stats}
          >
            <div className={styles.statItem}>
              <span className={styles.statValue}>100+</span>
              <span className={styles.statLabel}>Coins Tracked</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statValue}>Real-Time</span>
              <span className={styles.statLabel}>Price Updates</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statValue}>AI</span>
              <span className={styles.statLabel}>Powered Insights</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className={styles.scrollIndicator}
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className={styles.scrollText}>Scroll to explore</span>
            <svg
              className={styles.scrollIcon}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;
