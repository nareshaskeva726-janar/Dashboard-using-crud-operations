import { createSlice } from "@reduxjs/toolkit";

/* ---------------- UNREAD COUNT HELPER ---------------- */
const getUnreadCount = (notifications = []) =>
  notifications.filter((n) => n?.isRead === false).length;

/* ---------------- SLICE ---------------- */
const notificationSlice = createSlice({
  name: "notification",
  initialState: {
    notifications: [],
    unreadCount: 0,
  },

  reducers: {
    /* SET ALL NOTIFICATIONS (API LOAD) */
    setNotifications: (state, action) => {
      state.notifications = action.payload || [];
      state.unreadCount = getUnreadCount(state.notifications);
    },

    /* SOCKET NEW NOTIFICATION */
    addNotification: (state, action) => {
      const newNotif = action.payload;

      const exists = state.notifications.some(
        (n) => n._id?.toString() === newNotif._id?.toString()
      );

      if (!exists) {
        state.notifications.unshift(newNotif);

        // faster unread update
        if (!newNotif.isRead) state.unreadCount++;
      }
    },

    /* MERGE API + SOCKET DATA */
    mergeNotifications: (state, action) => {
      const incoming = action.payload || [];

      const existingIds = new Set(
        state.notifications.map((n) => n._id)
      );

      incoming.forEach((notif) => {
        if (!existingIds.has(notif._id)) {
          state.notifications.unshift(notif);
        }
      });

      state.unreadCount = getUnreadCount(state.notifications);
    },

    /* MARK SINGLE READ */
    markAsRead: (state, action) => {
      const notif = state.notifications.find(
        (n) => n._id?.toString() === action.payload?.toString()
      );

      if (notif && !notif.isRead) {
        notif.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },

    /* MARK ALL READ */
    markAllAsRead: (state) => {
      state.notifications.forEach((n) => {
        if (!n.isRead) n.isRead = true;
      });
      state.unreadCount = 0;
    },

    /* CLEAR ON LOGOUT */
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
  },
});

/* ---------------- EXPORTS ---------------- */
export const {
  setNotifications,
  addNotification,
  mergeNotifications,
  markAsRead,
  markAllAsRead,
  clearNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;