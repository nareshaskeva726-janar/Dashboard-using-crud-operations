import { configureStore } from "@reduxjs/toolkit";

// 🔹 Custom reducers
import authReducer from "./authSlice";
import chatReducer from "./chatSlice";
import projectReducer from "./projectSlice";
import notificationReducer from "./notificationSlice";

// 🔹 RTK Query APIs
import { userApi } from "./userApi";
import { projectApi } from "./projectApi";
import { notificationApi } from "./notificationApi";
import { chatApi } from "./chatApi";
import { attendanceApi } from "./attendanceApi";

export const store = configureStore({
  reducer: {
    // Custom reducers
    auth: authReducer,
    chat: chatReducer,
    project: projectReducer,
    notification: notificationReducer,

    // RTK Query reducers
    [userApi.reducerPath]: userApi.reducer,
    [projectApi.reducerPath]: projectApi.reducer,
    [notificationApi.reducerPath]: notificationApi.reducer,
    [chatApi.reducerPath]: chatApi.reducer,
    [attendanceApi.reducerPath]: attendanceApi.reducer, // ✅ ADD THIS
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      userApi.middleware,
      projectApi.middleware,
      notificationApi.middleware,
      chatApi.middleware,
      attendanceApi.middleware // ✅ ADD THIS
    ),

  devTools: process.env.NODE_ENV !== "production",
});