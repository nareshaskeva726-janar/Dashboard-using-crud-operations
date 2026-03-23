import { createSlice } from "@reduxjs/toolkit";

// Helper
const getUnreadCount = (notifications) =>
  notifications.filter((n) => !n.isRead).length;

const notificationSlice = createSlice({
  name: "notification",
  initialState: {
    notifications: [],
    unreadCount: 0,
  },

  reducers: {
    //  SET (API → FULL DATA)
    setNotifications: (state, action) => {
      state.notifications = action.payload || [];
      state.unreadCount = getUnreadCount(state.notifications);
    },

    //  ADD (SOCKET → SINGLE)
    addNotification: (state, action) => {
      const exists = state.notifications.find(
        (n) => n._id === action.payload._id
      );

      if (!exists) {
        state.notifications.unshift(action.payload);
        state.unreadCount = getUnreadCount(state.notifications);
      }
    },

    //  MERGE (SOCKET OFFLINE DATA)
    mergeNotifications: (state, action) => {
      const incoming = action.payload || [];

      incoming.forEach((newNotif) => {
        const exists = state.notifications.find(
          (n) => n._id === newNotif._id
        );

        if (!exists) {
          state.notifications.unshift(newNotif);
        }
      });

      state.unreadCount = getUnreadCount(state.notifications);
    },

    //  MARK SINGLE
    markAsRead: (state, action) => {
      const notif = state.notifications.find(
        (n) => n._id === action.payload
      );

      if (notif) {
        notif.isRead = true;
      }

      state.unreadCount = getUnreadCount(state.notifications);
    },

    //  MARK ALL
    markAllAsRead: (state) => {
      state.notifications.forEach((n) => {
        n.isRead = true;
      });

      state.unreadCount = 0;
    },

    //  CLEAR (logout)
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
  },
});

export const {
  setNotifications,
  addNotification,
  mergeNotifications, 
  markAsRead,
  markAllAsRead,
  clearNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;