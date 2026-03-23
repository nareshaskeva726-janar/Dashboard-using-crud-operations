import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const notificationApi = createApi({
  reducerPath: "notificationApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/notifications",
    credentials: "include",
  }),
  tagTypes: ["Notification"],

  endpoints: (builder) => ({
    // ✅ SEND
    sendNotification: builder.mutation({
      query: (data) => ({
        url: "/send",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Notification"],
    }),

    // ✅ GET
    getNotifications: builder.query({
      query: () => "/",
      providesTags: (result) =>
        result?.notifications
          ? [
              ...result.notifications.map((n) => ({
                type: "Notification",
                id: n._id,
              })),
              { type: "Notification", id: "LIST" },
            ]
          : [{ type: "Notification", id: "LIST" }],
    }),

    // ✅ MARK ALL READ
    markNotificationsRead: builder.mutation({
      query: () => ({
        url: "/mark-read",
        method: "PUT",
      }),
      invalidatesTags: [{ type: "Notification", id: "LIST" }],
    }),

    // ✅ MARK SINGLE READ
    markSingleNotificationRead: builder.mutation({
      query: (id) => ({
        url: `/mark-read/${id}`,
        method: "PUT",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Notification", id },
      ],
    }),
  }),
});

export const {
  useSendNotificationMutation,
  useGetNotificationsQuery,
  useMarkNotificationsReadMutation,
  useMarkSingleNotificationReadMutation,
} = notificationApi;