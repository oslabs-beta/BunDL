import { configureStore } from '@reduxjs/toolkit';
import counterReducer from '../querycontainer/reducers/counterSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
});
