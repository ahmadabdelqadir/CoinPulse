import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { replaceCoinAndAdd, cancelPendingCoin } from '../../store/slices/selectedCoinsSlice';
import styles from './SelectionModal.module.css';

const SelectionModal = () => {
  const dispatch = useAppDispatch();
  const { modalOpen, coins, pendingCoin } = useAppSelector(
    (state) => state.selectedCoins
  );
  const [selectedToRemove, setSelectedToRemove] = useState<string | null>(null);

  const handleConfirm = () => {
    if (selectedToRemove) {
      dispatch(replaceCoinAndAdd(selectedToRemove));
      setSelectedToRemove(null);
    }
  };

  const handleCancel = () => {
    dispatch(cancelPendingCoin());
    setSelectedToRemove(null);
  };

  if (!modalOpen || !pendingCoin) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={styles.overlay}
      >
        {/* Overlay - not clickable to close */}
        <div className={styles.backdrop} />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={styles.modal}
        >
          {/* Warning Icon */}
          <div className={styles.iconWrapper}>
            <div className={styles.iconCircle}>
              <svg
                className={styles.warningIcon}
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
            </div>
          </div>

          {/* Title */}
          <h2 className={styles.title}>Maximum Coins Reached</h2>
          <p className={styles.description}>
            You can only select up to 5 coins. To add{' '}
            <span className={styles.coinName}>{pendingCoin.name}</span>, please
            remove one of your current selections.
          </p>

          {/* Current Selections */}
          <div className={styles.coinList}>
            {coins.map((coin) => (
              <label
                key={coin.id}
                className={`${styles.coinOption} ${
                  selectedToRemove === coin.id ? styles.coinOptionSelected : ''
                }`}
              >
                <input
                  type="radio"
                  name="coinToRemove"
                  value={coin.id}
                  checked={selectedToRemove === coin.id}
                  onChange={() => setSelectedToRemove(coin.id)}
                  className={styles.radioInput}
                />
                <div
                  className={`${styles.radioCircle} ${
                    selectedToRemove === coin.id ? styles.radioCircleSelected : ''
                  }`}
                >
                  {selectedToRemove === coin.id && <div className={styles.radioDot} />}
                </div>
                <img src={coin.image} alt={coin.name} className={styles.coinIcon} />
                <div className={styles.coinInfo}>
                  <p className={styles.coinSymbol}>{coin.symbol}</p>
                  <p className={styles.coinFullName}>{coin.name}</p>
                </div>
              </label>
            ))}
          </div>

          {/* Pending Coin Preview */}
          <div className={styles.pendingCoin}>
            <div className={styles.addIcon}>
              <svg
                className={styles.addIconSvg}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <img src={pendingCoin.image} alt={pendingCoin.name} className={styles.coinIcon} />
            <div className={styles.coinInfo}>
              <p className={styles.coinSymbol}>{pendingCoin.symbol}</p>
              <p className={styles.coinFullName}>{pendingCoin.name}</p>
            </div>
            <span className={styles.pendingLabel}>To be added</span>
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <button onClick={handleCancel} className={styles.cancelBtn}>
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedToRemove}
              className={styles.confirmBtn}
            >
              Confirm Swap
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SelectionModal;
