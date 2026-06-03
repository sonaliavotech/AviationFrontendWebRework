import { createSlice } from '@reduxjs/toolkit';

const locationsSlice = createSlice({
  name: 'locations',
  initialState: {
    locations: [],
  },
  reducers: {
    clearLocations: (state) => {
      state.locations = [];
    },
    // add other reducers as needed
  },
});

export const { clearLocations } = locationsSlice.actions;
export default locationsSlice.reducer;