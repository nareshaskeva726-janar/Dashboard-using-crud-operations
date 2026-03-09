import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import { userApi } from "./userApi";


//using configureStore to createStore to avoid too much code 
export const store = configureStore({
  reducer: {
     auth: authReducer,
    [userApi.reducerPath]: userApi.reducer,
  },

  //default middleware
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(userApi.middleware),
});