import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./slices/authSlice";
import propertyDetails from "./slices/propertyDetails";
import searchSlice from "./slices/searchSlice";
import {  persistStore } from "redux-persist";

// const searchPersistConfig = {
//   key: "search",
//   storage,
// };
// const persistedSearchReducer = persistReducer(searchPersistConfig, searchSlice);
const store = configureStore({
  reducer: {
    auth: authSlice,
    property: propertyDetails,
    search: searchSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
export const persistor = persistStore(store);
export default store;
