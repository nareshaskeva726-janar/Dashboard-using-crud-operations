import { configureStore } from "@reduxjs/toolkit";

// 🔹 Custom reducers
import authReducer from "./authSlice";
import messageReducer from "./chatSlice";
import projectReducer from "./projectSlice";
import notificationReducer from "./notificationSlice";
import attendanceReducer from "./attendanceSlice"; 

// 🔹 RTK Query APIs
import { userApi } from "./userApi";
import { messageApi } from "./messageApi";
import { projectApi } from "./projectApi";
import { notificationApi } from "./notificationApi";
import { attendanceApi } from "./attendanceApi";


export const store = configureStore({
  reducer: {
    // 🔹 Custom reducers
    auth: authReducer,
    message: messageReducer,
    project: projectReducer,
    notification: notificationReducer,
    attendance: attendanceReducer, 

    // 🔹 RTK Query reducers
    [userApi.reducerPath]: userApi.reducer,
    [messageApi.reducerPath]: messageApi.reducer,
    [projectApi.reducerPath]: projectApi.reducer,
    [notificationApi.reducerPath]: notificationApi.reducer,
    [attendanceApi.reducerPath]: attendanceApi.reducer, 
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      userApi.middleware,
      messageApi.middleware,
      projectApi.middleware,
      notificationApi.middleware,
      attendanceApi.middleware 
    ),

  devTools: process.env.NODE_ENV !== "production",
});