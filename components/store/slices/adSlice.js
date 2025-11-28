import { createSlice } from "@reduxjs/toolkit";

const adSlice = createSlice({
  name: "ads",
  initialState: {
    listingAds: {
      ready_to_move: [],
      under_construction: [],
    },
    slider: [],
    ads: [],
    userProperties: [],
    videos: [],
    floorPlan: [],
    nearby: [],
    images: [],
    promotionalBanners: [],
  },
  reducers: {
    setListingAds: (state, action) => {
      state.listingAds = action.payload;
    },
    setSlider: (state, action) => {
      state.slider = action.payload;
    },
    setAds: (state, action) => {
      state.ads = action.payload;
    },
    setUserProperties: (state, action) => {
      state.userProperties = action.payload;
    },
    setVideos: (state, action) => {
      state.videos = action.payload;
    },
    setFloorPlan: (state, action) => {
      state.floorPlan = action.payload;
    },
    setNearby: (state, action) => {
      state.nearby = action.payload;
    },
    setImages: (state, action) => {
      state.images = action.payload;
    },
    setPromotionalBanners: (state, action) => {
      state.promotionalBanners = action.payload;
    },
  },
});

export const {
  setListingAds,
  setSlider,
  setAds,
  setUserProperties,
  setVideos,
  setFloorPlan,
  setImages,
  setNearby,
  setPromotionalBanners,
} = adSlice.actions;
export default adSlice.reducer;
