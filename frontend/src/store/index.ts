import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import polReducer from './polSlice';
import alertReducer from './alertSlice';
import productionReducer from './productionSlice';

// Load persisted state from localStorage
const loadState = () => {
  try {
    const serializedState = localStorage.getItem('reduxState');
    if (serializedState) {
      const parsedState = JSON.parse(serializedState);
      // Only restore auth state, not the entire state
      const authState = parsedState.auth;
      return {
        auth: authState || {
          isAuthenticated: false,
          user: null,
          token: null,
          loading: false,
          error: null,
        },
      };
    }
  } catch (err) {
    console.error('Error loading persisted state:', err);
  }
  return undefined;
};

// Save state to localStorage on each change
const saveState = (state: any) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('reduxState', serializedState);
  } catch (err) {
    console.error('Error saving state:', err);
  }
};

const preloadedState = loadState();

export const store = configureStore({
  reducer: {
    auth: authReducer,
    pol: polReducer,
    alerts: alertReducer,
    production: productionReducer,
  },
  preloadedState,
});

// Subscribe to store changes to persist state
store.subscribe(() => {
  saveState(store.getState());
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
