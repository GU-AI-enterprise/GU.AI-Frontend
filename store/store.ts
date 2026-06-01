import { configureStore } from '@reduxjs/toolkit';
import appReducer from '@/features/app/appSlice';
import authReducer from '@/features/auth/authSlice';
import creditReducer from '@/features/credit/creditSlice';

export const store = configureStore({
  reducer: {
    app: appReducer,
    auth: authReducer,
    credit: creditReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
