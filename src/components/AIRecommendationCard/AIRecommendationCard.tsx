import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { fetchAIRecommendation } from '../../store/slices/aiSlice';
import type { SelectedCoin } from '../../types';
import styles from './AIRecommendationCard.module.css';

interface AIRecommendationCardProps {
  coin: SelectedCoin;
}

const AIRecommendationCard = ({ coin }: AIRecommendationCardProps) => {
  const dispatch = useAppDispatch();
  const recommendation = useAppSelector(
    (state) => state.ai.recommendations[coin.id]
  );
  const isLoading = useAppSelector((state) => state.ai.loading[coin.id]);
  const error = useAppSelector((state) => state.ai.error[coin.id]);

  const handleGetRecommendation = () => {
    dispatch(fetchAIRecommendation(coin.id));
  };

  return (
    <motion.div layout className={styles.card}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.coinInfo}>
            <img src={coin.image} alt={coin.name} className={styles.coinIcon} />
            <div>
              <h3 className={styles.coinSymbol}>{coin.symbol}</h3>
              <p className={styles.coinName}>{coin.name}</p>
            </div>
          </div>

          <button
            onClick={handleGetRecommendation}
            disabled={isLoading}
            className={styles.analyzeBtn}
          >
            {isLoading ? (
              <>
                <div className={styles.btnSpinner}></div>
                <span>Analyzing...</span>
              </>
            ) : recommendation ? (
              'Refresh Analysis'
            ) : (
              'Get AI Recommendation'
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {error && (
          <div className={styles.error}>
            <p className={styles.errorText}>{error}</p>
            <p className={styles.errorSubtext}>
              Please check your API configuration and try again.
            </p>
          </div>
        )}

        {!recommendation && !error && !isLoading && (
          <div className={styles.emptyState}>
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
            <p className={styles.emptyText}>
              Click the button above to get AI-powered investment analysis
            </p>
            <p className={styles.emptySubtext}>
              Based on market data, price trends, and volume analysis
            </p>
          </div>
        )}

        {recommendation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.result}
          >
            {/* Decision Badge */}
            <div className={styles.decisionWrapper}>
              <div
                className={`${styles.decision} ${
                  recommendation.decision === 'BUY'
                    ? styles.decisionBuy
                    : styles.decisionSell
                }`}
              >
                {recommendation.decision === 'BUY' ? (
                  <svg
                    className={styles.decisionIcon}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 10l7-7m0 0l7 7m-7-7v18"
                    />
                  </svg>
                ) : (
                  <svg
                    className={styles.decisionIcon}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                    />
                  </svg>
                )}
                {recommendation.decision}
              </div>
              
              {/* Confidence Score */}
              <div className={styles.confidence}>
                <span className={styles.confidenceLabel}>Confidence</span>
                <div className={styles.confidenceBar}>
                  <div 
                    className={styles.confidenceFill}
                    style={{ width: `${recommendation.confidence}%` }}
                  />
                </div>
                <span className={styles.confidenceValue}>{recommendation.confidence}%</span>
              </div>
            </div>

            {/* Explanation */}
            <div className={styles.explanation}>
              <h4 className={styles.explanationTitle}>Analysis</h4>
              <p className={styles.explanationText}>{recommendation.explanation}</p>
            </div>

            {/* Disclaimer */}
            <div className={styles.disclaimer}>
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
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p>
                This is not financial advice. Always do your own research before
                making investment decisions.
              </p>
            </div>

            {/* Timestamp */}
            <p className={styles.timestamp}>
              Generated: {new Date(recommendation.timestamp).toLocaleString()}
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default AIRecommendationCard;
