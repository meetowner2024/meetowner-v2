import { createSlice } from "@reduxjs/toolkit";

const profileSlice = createSlice({
  name: "profile",
  initialState: {
    profileData: null,
  },
  reducers: {
    setProfileData: (state, action) => {
      state.profileData = action.payload;
    },
  },
});
export const { setProfileData } = profileSlice.actions;
export default profileSlice.reducer;
