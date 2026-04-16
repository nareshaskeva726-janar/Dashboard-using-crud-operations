import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const notificationApi = createApi({
  reducerPath: "notificationApi",

  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API+"/api",

    // ⭐ IMPORTANT
    credentials: "include", // cookies send automatically
  }),

  tagTypes: ["Notification"],

  endpoints: (builder) => ({

    //  GET Notifications
    getNotifications: builder.query({
      query: () => "/notifications/",
      providesTags: ["Notification"],
    }),

    //  SEND Notification
    sendNotification: builder.mutation({
      query: (data) => ({
        url: "/notifications/send",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Notification"],
    }),

    //  Mark All Read
    markAllRead: builder.mutation({
      query: () => ({
        url: "/notifications/mark-all-read",
        method: "PUT",
      }),
      invalidatesTags: ["Notification"],
    }),

    // ✅ Mark Single Read
    markSingleRead: builder.mutation({
      query: (id) => ({
        url: `/notifications/mark-read/${id}`,
        method: "PUT",
      }),
      invalidatesTags: ["Notification"],
    }),

  }),
});

export const {
  useGetNotificationsQuery,
  useSendNotificationMutation,
  useMarkAllReadMutation,
  useMarkSingleReadMutation,
} = notificationApi;