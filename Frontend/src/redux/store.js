import { configureStore } from "@reduxjs/toolkit";

// 🔹 Custom reducers
import authReducer from "./authSlice";
import chatReducer from "./chatSlice";
import projectReducer from "./projectSlice";
import notificationReducer from "./notificationSlice";
import attendanceReducer from "./attendanceSlice";

// 🔹 RTK Query APIs
import { userApi } from "./userApi";
import { projectApi } from "./projectApi";
import { notificationApi } from "./notificationApi";
import { attendanceApi } from "./attendanceApi";
import { chatApi } from "./chatApi";



export const store = configureStore({
  reducer: {

    // Custom reducers
    auth: authReducer,
    chat: chatReducer,
    project: projectReducer,
    notification: notificationReducer,
    attendance: attendanceReducer,

    //  RTK Query reducers
    [userApi.reducerPath]: userApi.reducer,
    [projectApi.reducerPath]: projectApi.reducer,
    [notificationApi.reducerPath]: notificationApi.reducer,
    [attendanceApi.reducerPath]: attendanceApi.reducer,
    [chatApi.reducerPath]: chatApi.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      userApi.middleware,
      projectApi.middleware,
      notificationApi.middleware,
      attendanceApi.middleware,
      chatApi.middleware,
    ),

  devTools: process.env.NODE_ENV !== "production",
});