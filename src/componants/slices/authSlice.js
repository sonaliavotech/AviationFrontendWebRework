import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
  },
  reducers: {
    logoutUser: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
    },
    // add other reducers as needed
  },
});

export const { logoutUser } = authSlice.actions;
export default authSlice.reducer;