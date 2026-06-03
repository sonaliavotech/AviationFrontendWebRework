import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import locationsReducer from './locationsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    locations: locationsReducer,
    // add other reducers as needed
  },
});