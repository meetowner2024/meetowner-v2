import { createSlice } from "@reduxjs/toolkit";

const locationSlice = createSlice({
  name: "locations",
  initialState: {
    cities: [],
  },
  reducers: {
    setCities: (state, action) => {
      state.cities = action.payload;
    },
  },
});

export const { setCities } = locationSlice.actions;
export default locationSlice.reducer;
