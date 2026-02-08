import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import polReducer from './slices/polSlice';
import productionReducer from './slices/productionSlice';
import alertReducer from './slices/alertSlice';
import reportReducer from './slices/reportSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    pol: polReducer,
    production: productionReducer,
    alerts: alertReducer,
    reports: reportReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/setUser', 'auth/login/fulfilled'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
