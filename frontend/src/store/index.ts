import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import polReducer from './polSlice';
import alertReducer from './alertSlice';
import productionReducer from './productionSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    pol: polReducer,
    alerts: alertReducer,
    production: productionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
