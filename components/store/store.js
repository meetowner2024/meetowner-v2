import { configureStore } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { persistStore, persistReducer } from "redux-persist";
import authSlice from "./slices/authSlice";
import propertyDetails from "./slices/propertyDetails";
import searchSlice from "./slices/searchSlice";
import adReducer from "./slices/adSlice";
import locationSlice from "./slices/locationSlice";
const adPersistConfig = {
  key: "ads",
  storage,
};
const persistedAdReducer = persistReducer(adPersistConfig, adReducer);
const locationPersistConfig = {
  key: "location",
  storage,
};

const persistedLocationReducer = persistReducer(
  locationPersistConfig,
  locationSlice
);
export const store = configureStore({
  reducer: {
    auth: authSlice,
    property: propertyDetails,
    search: searchSlice,
    ads: persistedAdReducer,
    location: persistedLocationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
export const persistor = persistStore(store);
export default store;
