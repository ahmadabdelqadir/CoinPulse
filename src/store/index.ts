import { configureStore } from '@reduxjs/toolkit';
import coinsReducer from './slices/coinsSlice';
import coinDetailsReducer from './slices/coinDetailsSlice';
import selectedCoinsReducer from './slices/selectedCoinsSlice';
import reportsReducer from './slices/reportsSlice';
import aiReducer from './slices/aiSlice';

export const store = configureStore({
  reducer: {
    coins: coinsReducer,
    coinDetails: coinDetailsReducer,
    selectedCoins: selectedCoinsReducer,
    reports: reportsReducer,
    ai: aiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
