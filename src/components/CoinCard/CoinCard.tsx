import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { toggleCoin } from '../../store/slices/selectedCoinsSlice';
import { fetchCoinDetail } from '../../store/slices/coinDetailsSlice';
import type { Coin, SelectedCoin } from '../../types';
import styles from './CoinCard.module.css';

interface CoinCardProps {
  coin: Coin;
}

const CoinCard = ({ coin }: CoinCardProps) => {
  const dispatch = useAppDispatch();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const selectedCoins = useAppSelector((state) => state.selectedCoins.coins);
  const isSelected = selectedCoins.some((c) => c.id === coin.id);
  
  const coinDetail = useAppSelector(
    (state) => state.coinDetails.details[coin.id]
  );
  const isLoadingDetails = useAppSelector(
    (state) => state.coinDetails.loading[coin.id]
  );
  const detailError = useAppSelector(
    (state) => state.coinDetails.error[coin.id]
  );

  const handleToggle = () => {
    const selectedCoin: SelectedCoin = {
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      image: coin.image,
    };
    dispatch(toggleCoin(selectedCoin));
  };

  const handleMoreInfo = async () => {
    if (!isExpanded) {
      dispatch(fetchCoinDetail(coin.id));
    }
    setIsExpanded(!isExpanded);
  };

  const formatCurrency = (value: number, currency: string) => {
    const symbols: { [key: string]: string } = {
      usd: '$',
      eur: '€',
      ils: '₪',
    };
    return `${symbols[currency] || ''}${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    })}`;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`${styles.card} ${isSelected ? styles.cardSelected : ''}`}
    >
      <div className={styles.cardContent}>
        <div className={styles.cardHeader}>
          <div className={styles.coinInfo}>
            <img
              src={coin.image}
              alt={coin.name}
              className={styles.coinIcon}
            />
            <div className={styles.coinDetails}>
              <span className={styles.coinSymbol}>{coin.symbol}</span>
              <span className={styles.coinName}>{coin.name}</span>
            </div>
          </div>

          {/* Selection Toggle */}
          <label className={styles.toggleWrapper}>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={handleToggle}
              className={styles.toggleInput}
            />
            <span className={styles.toggleSlider}></span>
          </label>
        </div>

        <div className={styles.priceSection}>
          <div className={styles.priceInfo}>
            <span className={styles.currentPrice}>
              ${coin.current_price.toLocaleString()}
            </span>
            <span
              className={`${styles.priceChange} ${
                coin.price_change_percentage_24h >= 0
                  ? styles.priceUp
                  : styles.priceDown
              }`}
            >
              {coin.price_change_percentage_24h >= 0 ? '+' : ''}
              {coin.price_change_percentage_24h?.toFixed(2)}%
            </span>
          </div>

          <button onClick={handleMoreInfo} className={styles.moreInfoBtn}>
            {isExpanded ? 'Less Info' : 'More Info'}
          </button>
        </div>
      </div>

      {/* Expandable Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={styles.expandedSection}
          >
            <div className={styles.expandedContent}>
              {isLoadingDetails ? (
                <div className={styles.loadingWrapper}>
                  <div className={styles.loadingSpinner}></div>
                </div>
              ) : coinDetail ? (
                <>
                  <h4 className={styles.sectionTitle}>Current Price</h4>
                  <div className={styles.priceGrid}>
                    <div className={styles.priceBox}>
                      <p className={styles.priceLabel}>USD</p>
                      <p className={styles.priceValue}>
                        {formatCurrency(
                          coinDetail.data.market_data.current_price.usd,
                          'usd'
                        )}
                      </p>
                    </div>
                    <div className={styles.priceBox}>
                      <p className={styles.priceLabel}>EUR</p>
                      <p className={styles.priceValue}>
                        {formatCurrency(
                          coinDetail.data.market_data.current_price.eur,
                          'eur'
                        )}
                      </p>
                    </div>
                    <div className={styles.priceBox}>
                      <p className={styles.priceLabel}>ILS</p>
                      <p className={styles.priceValue}>
                        {formatCurrency(
                          coinDetail.data.market_data.current_price.ils,
                          'ils'
                        )}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className={styles.errorWrapper}>
                  <p className={styles.errorText}>
                    {detailError || 'Unable to load price details'}
                  </p>
                  <button
                    onClick={() => dispatch(fetchCoinDetail(coin.id))}
                    className={styles.retryBtn}
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CoinCard;
