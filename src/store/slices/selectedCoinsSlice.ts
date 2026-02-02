/**
 * Selected Coins Slice
 * Manages the user's coin selections (up to 5).
 * Persists selections to localStorage for cross-session retention.
 * Handles the replacement modal when max capacity is reached.
 */

import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { SelectedCoin } from '../../types';

interface SelectedCoinsState {
  coins: SelectedCoin[];
  maxCoins: number;
  modalOpen: boolean;
  pendingCoin: SelectedCoin | null;
}

// Load from localStorage
const loadFromStorage = (): SelectedCoin[] => {
  try {
    const stored = localStorage.getItem('selectedCoins');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load selected coins from localStorage:', error);
  }
  return [];
};

// Save to localStorage
const saveToStorage = (coins: SelectedCoin[]) => {
  try {
    localStorage.setItem('selectedCoins', JSON.stringify(coins));
  } catch (error) {
    console.error('Failed to save selected coins to localStorage:', error);
  }
};

const initialState: SelectedCoinsState = {
  coins: loadFromStorage(),
  maxCoins: 5,
  modalOpen: false,
  pendingCoin: null,
};

const selectedCoinsSlice = createSlice({
  name: 'selectedCoins',
  initialState,
  reducers: {
    addCoin: (state, action: PayloadAction<SelectedCoin>) => {
      const coin = action.payload;
      // Check if already selected
      if (state.coins.some((c) => c.id === coin.id)) {
        return;
      }
      // Check if at max capacity
      if (state.coins.length >= state.maxCoins) {
        state.pendingCoin = coin;
        state.modalOpen = true;
        return;
      }
      state.coins.push(coin);
      saveToStorage(state.coins);
    },
    removeCoin: (state, action: PayloadAction<string>) => {
      state.coins = state.coins.filter((c) => c.id !== action.payload);
      saveToStorage(state.coins);
    },
    toggleCoin: (state, action: PayloadAction<SelectedCoin>) => {
      const coin = action.payload;
      const index = state.coins.findIndex((c) => c.id === coin.id);
      
      if (index !== -1) {
        // Remove if already selected
        state.coins.splice(index, 1);
        saveToStorage(state.coins);
      } else if (state.coins.length >= state.maxCoins) {
        // Open modal if at max capacity
        state.pendingCoin = coin;
        state.modalOpen = true;
      } else {
        // Add if not at max capacity
        state.coins.push(coin);
        saveToStorage(state.coins);
      }
    },
    replaceCoinAndAdd: (state, action: PayloadAction<string>) => {
      const coinIdToRemove = action.payload;
      // Remove the selected coin
      state.coins = state.coins.filter((c) => c.id !== coinIdToRemove);
      // Add the pending coin
      if (state.pendingCoin) {
        state.coins.push(state.pendingCoin);
        saveToStorage(state.coins);
      }
      // Close modal and clear pending
      state.modalOpen = false;
      state.pendingCoin = null;
    },
    cancelPendingCoin: (state) => {
      state.modalOpen = false;
      state.pendingCoin = null;
    },
    openModal: (state, action: PayloadAction<SelectedCoin>) => {
      state.pendingCoin = action.payload;
      state.modalOpen = true;
    },
    closeModal: (state) => {
      state.modalOpen = false;
      state.pendingCoin = null;
    },
  },
});

export const {
  addCoin,
  removeCoin,
  toggleCoin,
  replaceCoinAndAdd,
  cancelPendingCoin,
  openModal,
  closeModal,
} = selectedCoinsSlice.actions;

export default selectedCoinsSlice.reducer;
